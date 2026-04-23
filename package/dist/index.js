// src/frameworks/react.ts
import {
  getFiberFromHostInstance,
  isInstrumentationActive,
  getDisplayName,
  isCompositeFiber,
  traverseFiber
} from "bippy";
import {
  isSourceFile,
  normalizeFileName,
  getOwnerStack,
  formatOwnerStack,
  hasDebugStack,
  parseStack
} from "bippy/source";

// src/constants.ts
var SYMBOLICATION_TIMEOUT_MS = 5e3;
var MAX_SOURCE_CONTEXT_WINDOW_CHARS = 4e3;
var SOURCE_CONTEXT_HALF_WINDOW_CHARS = MAX_SOURCE_CONTEXT_WINDOW_CHARS / 2;
var SOLID_HANDLER_SOURCE_LENGTH_MIN_CHARS = 3;
var SVELTE_COLUMN_OFFSET = 1;
var SOURCE_LINE_START_COLUMN = 1;
var DEFAULT_MAX_STACK_LINES = 3;
var MIN_COMPONENT_NAME_LENGTH_CHARS = 1;

// src/utils/is-element.ts
var isElement = (node) => typeof Element !== "undefined" && node instanceof Element;

// src/frameworks/react.ts
var NON_COMPONENT_PREFIXES = [
  "_",
  "$",
  "motion.",
  "styled.",
  "chakra.",
  "ark.",
  "Primitive.",
  "Slot."
];
var NEXT_INTERNAL_NAMES = /* @__PURE__ */ new Set([
  "InnerLayoutRouter",
  "RedirectErrorBoundary",
  "RedirectBoundary",
  "HTTPAccessFallbackErrorBoundary",
  "HTTPAccessFallbackBoundary",
  "LoadingBoundary",
  "ErrorBoundary",
  "InnerScrollAndFocusHandler",
  "ScrollAndFocusHandler",
  "RenderFromTemplateContext",
  "OuterLayoutRouter",
  "body",
  "html",
  "DevRootHTTPAccessFallbackBoundary",
  "AppDevOverlayErrorBoundary",
  "AppDevOverlay",
  "HotReload",
  "Router",
  "ErrorBoundaryHandler",
  "AppRouter",
  "ServerRoot",
  "SegmentStateProvider",
  "RootErrorBoundary",
  "LoadableComponent",
  "MotionDOMComponent"
]);
var REACT_INTERNAL_NAMES = /* @__PURE__ */ new Set([
  "Suspense",
  "Fragment",
  "StrictMode",
  "Profiler",
  "SuspenseList"
]);
var cachedIsNextProject;
var checkIsNextProject = (revalidate) => {
  if (revalidate) {
    cachedIsNextProject = void 0;
  }
  cachedIsNextProject ??= typeof document !== "undefined" && Boolean(document.getElementById("__NEXT_DATA__") || document.querySelector("nextjs-portal"));
  return cachedIsNextProject;
};
var isInternalComponentName = (name) => {
  if (NEXT_INTERNAL_NAMES.has(name)) return true;
  if (REACT_INTERNAL_NAMES.has(name)) return true;
  return NON_COMPONENT_PREFIXES.some((prefix) => name.startsWith(prefix));
};
var isSourceComponentName = (name) => {
  if (name.length <= MIN_COMPONENT_NAME_LENGTH_CHARS) return false;
  if (isInternalComponentName(name)) return false;
  if (name[0] !== name[0].toUpperCase()) return false;
  if (name.includes("Provider") || name.includes("Context")) return false;
  return true;
};
var isUsefulComponentName = (name) => {
  if (!name) return false;
  if (isInternalComponentName(name)) return false;
  if (name === "SlotClone" || name === "Slot") return false;
  return true;
};
var SERVER_COMPONENT_URL_PREFIXES = ["about://React/", "rsc://React/"];
var isServerComponentUrl = (url) => SERVER_COMPONENT_URL_PREFIXES.some((prefix) => url.startsWith(prefix));
var devirtualizeServerUrl = (url) => {
  for (const prefix of SERVER_COMPONENT_URL_PREFIXES) {
    if (!url.startsWith(prefix)) continue;
    const envEnd = url.indexOf("/", prefix.length);
    const queryStart = url.lastIndexOf("?");
    if (envEnd > -1 && queryStart > -1) {
      return decodeURI(url.slice(envEnd + 1, queryStart));
    }
  }
  return url;
};
var symbolicateServerFrames = async (frames) => {
  const serverIndices = [];
  const requestFrames = [];
  for (let index = 0; index < frames.length; index++) {
    const frame = frames[index];
    if (!frame.isServer || !frame.fileName) continue;
    serverIndices.push(index);
    requestFrames.push({
      file: devirtualizeServerUrl(frame.fileName),
      methodName: frame.functionName ?? "<unknown>",
      line1: frame.lineNumber ?? null,
      column1: frame.columnNumber ?? null,
      arguments: []
    });
  }
  if (requestFrames.length === 0) return frames;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SYMBOLICATION_TIMEOUT_MS);
  try {
    const response = await fetch("/__nextjs_original-stack-frames", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        frames: requestFrames,
        isServer: true,
        isEdgeServer: false,
        isAppDirectory: true
      }),
      signal: controller.signal
    });
    if (!response.ok) return frames;
    const results = await response.json();
    const resolved = [...frames];
    for (let index = 0; index < serverIndices.length; index++) {
      const result = results[index];
      if (result?.status !== "fulfilled") continue;
      const original = result.value?.originalStackFrame;
      if (!original?.file || original.ignored) continue;
      const frameIndex = serverIndices[index];
      resolved[frameIndex] = {
        ...frames[frameIndex],
        fileName: original.file,
        lineNumber: original.line1 ?? void 0,
        columnNumber: original.column1 ?? void 0,
        isSymbolicated: true
      };
    }
    return resolved;
  } catch {
    return frames;
  } finally {
    clearTimeout(timeout);
  }
};
var extractServerFramesFromDebugStack = (rootFiber) => {
  const serverFramesByName = /* @__PURE__ */ new Map();
  traverseFiber(
    rootFiber,
    (currentFiber) => {
      if (!hasDebugStack(currentFiber)) return false;
      const ownerStack = formatOwnerStack(currentFiber._debugStack.stack);
      if (!ownerStack) return false;
      for (const frame of parseStack(ownerStack)) {
        if (!frame.functionName || !frame.fileName) continue;
        if (!isServerComponentUrl(frame.fileName)) continue;
        if (serverFramesByName.has(frame.functionName)) continue;
        serverFramesByName.set(frame.functionName, { ...frame, isServer: true });
      }
      return false;
    },
    true
  );
  return serverFramesByName;
};
var enrichServerFrameLocations = (rootFiber, frames) => {
  const hasUnresolved = frames.some(
    (frame) => frame.isServer && !frame.fileName && frame.functionName
  );
  if (!hasUnresolved) return frames;
  const serverFramesByName = extractServerFramesFromDebugStack(rootFiber);
  if (serverFramesByName.size === 0) return frames;
  return frames.map((frame) => {
    if (!frame.isServer || frame.fileName || !frame.functionName) return frame;
    const resolved = serverFramesByName.get(frame.functionName);
    if (!resolved) return frame;
    return {
      ...frame,
      fileName: resolved.fileName,
      lineNumber: resolved.lineNumber,
      columnNumber: resolved.columnNumber
    };
  });
};
var findNearestFiberNode = (node) => {
  if (!isInstrumentationActive()) return node;
  if (getFiberFromHostInstance(node)) return node;
  if (isElement(node)) {
    let current = node.parentElement;
    while (current) {
      if (getFiberFromHostInstance(current)) return current;
      current = current.parentElement;
    }
  }
  return node;
};
var stackCache = /* @__PURE__ */ new WeakMap();
var fetchStackForNode = async (node) => {
  try {
    const fiber = getFiberFromHostInstance(node);
    if (!fiber) return null;
    const frames = await getOwnerStack(fiber);
    if (checkIsNextProject()) {
      const enriched = enrichServerFrameLocations(fiber, frames);
      return symbolicateServerFrames(enriched);
    }
    return frames;
  } catch {
    return null;
  }
};
var getReactStack = (node) => {
  if (!isInstrumentationActive()) return Promise.resolve([]);
  const resolved = findNearestFiberNode(node);
  const cached = stackCache.get(resolved);
  if (cached) return cached;
  const promise = fetchStackForNode(resolved);
  stackCache.set(resolved, promise);
  return promise;
};
var resolveSourceFromStack = (stack) => {
  if (!stack || stack.length === 0) return null;
  for (const frame of stack) {
    if (frame.fileName && isSourceFile(frame.fileName)) {
      return {
        filePath: normalizeFileName(frame.fileName),
        lineNumber: frame.lineNumber ?? null,
        columnNumber: null,
        componentName: frame.functionName && isSourceComponentName(frame.functionName) ? frame.functionName : null
      };
    }
  }
  return null;
};
var resolveStack = async (node) => {
  const stack = await getReactStack(node);
  const source = resolveSourceFromStack(stack);
  return source ? [source] : [];
};
var resolveComponentName = async (node) => {
  if (!isInstrumentationActive()) return null;
  const stack = await getReactStack(node);
  if (stack) {
    for (const frame of stack) {
      if (frame.functionName && isSourceComponentName(frame.functionName)) {
        return frame.functionName;
      }
    }
  }
  const resolved = findNearestFiberNode(node);
  const fiber = getFiberFromHostInstance(resolved);
  if (!fiber) return null;
  let current = fiber.return;
  while (current) {
    if (isCompositeFiber(current)) {
      const name = getDisplayName(current.type);
      if (name && isUsefulComponentName(name)) return name;
    }
    current = current.return;
  }
  return null;
};
var reactResolver = {
  name: "react",
  resolveStack,
  resolveComponentName
};

// src/utils/is-record.ts
var isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);

// src/utils/read-string.ts
var readString = (value) => typeof value === "string" ? value : null;

// src/utils/read-number.ts
var readNumber = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;

// src/frameworks/svelte.ts
var SVELTE_META_PROPERTY = "__svelte_meta";
var getNearestSvelteMeta = (element) => {
  let current = element;
  while (current) {
    const meta = Reflect.get(current, SVELTE_META_PROPERTY);
    if (isRecord(meta)) return meta;
    current = current.parentElement;
  }
  return null;
};
var readSvelteLocation = (meta) => {
  const location = meta.loc;
  if (!isRecord(location)) return null;
  const filePath = readString(location.file);
  const lineNumber = readNumber(location.line);
  const rawColumn = readNumber(location.column);
  if (!filePath || lineNumber === null || rawColumn === null) return null;
  return {
    filePath,
    lineNumber,
    columnNumber: rawColumn + SVELTE_COLUMN_OFFSET
  };
};
var readComponentNameFromParent = (meta) => {
  let current = meta.parent;
  while (isRecord(current)) {
    const tag = readString(current.componentTag);
    if (tag) return tag;
    current = current.parent;
  }
  return null;
};
var readParentStackFrames = (meta) => {
  const frames = [];
  let current = meta.parent;
  while (isRecord(current)) {
    const filePath = readString(current.file);
    const lineNumber = readNumber(current.line);
    const rawColumn = readNumber(current.column);
    const componentName = readString(current.componentTag);
    if (filePath && lineNumber !== null && rawColumn !== null) {
      frames.push({
        filePath,
        lineNumber,
        columnNumber: rawColumn + SVELTE_COLUMN_OFFSET,
        componentName
      });
    }
    current = current.parent;
  }
  return frames;
};
var resolveStack2 = (element) => {
  const meta = getNearestSvelteMeta(element);
  if (!meta) return [];
  const location = readSvelteLocation(meta);
  if (!location) return [];
  const frames = [
    {
      filePath: location.filePath,
      lineNumber: location.lineNumber,
      columnNumber: location.columnNumber,
      componentName: readComponentNameFromParent(meta)
    }
  ];
  const seen = /* @__PURE__ */ new Set([`${location.filePath}:${location.lineNumber}:${location.columnNumber}`]);
  for (const parentFrame of readParentStackFrames(meta)) {
    const identity = `${parentFrame.filePath}:${parentFrame.lineNumber ?? ""}:${parentFrame.columnNumber ?? ""}`;
    if (seen.has(identity)) continue;
    seen.add(identity);
    frames.push(parentFrame);
  }
  return frames;
};
var svelteResolver = {
  name: "svelte",
  resolveStack: resolveStack2
};

// src/utils/parse-location.ts
var SOURCE_DELIMITER = ":";
var parsePositiveInteger = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return null;
  return parsed;
};
var parseSourceLocation = (location) => {
  const lastDelimiterIndex = location.lastIndexOf(SOURCE_DELIMITER);
  if (lastDelimiterIndex === -1) return null;
  const secondLastDelimiterIndex = location.lastIndexOf(SOURCE_DELIMITER, lastDelimiterIndex - 1);
  if (secondLastDelimiterIndex === -1) return null;
  const filePath = location.slice(0, secondLastDelimiterIndex);
  if (!filePath) return null;
  const lineValue = location.slice(secondLastDelimiterIndex + 1, lastDelimiterIndex);
  const columnValue = location.slice(lastDelimiterIndex + 1);
  const lineNumber = parsePositiveInteger(lineValue);
  const columnNumber = parsePositiveInteger(columnValue);
  if (lineNumber === null || columnNumber === null) return null;
  return { filePath, lineNumber, columnNumber };
};

// src/frameworks/vue.ts
var INSPECTOR_ATTRIBUTE = "data-v-inspector";
var INSPECTOR_SELECTOR = `[${INSPECTOR_ATTRIBUTE}]`;
var PARENT_COMPONENT_PROPERTY = "__vueParentComponent";
var getVueComponentType = (component) => {
  if (!component) return null;
  const componentType = component.type;
  return isRecord(componentType) ? componentType : null;
};
var getVueParentComponent = (element) => {
  const component = Reflect.get(element, PARENT_COMPONENT_PROPERTY);
  return isRecord(component) ? component : null;
};
var getNearestVueComponent = (element) => {
  let current = element;
  while (current) {
    const component = getVueParentComponent(current);
    if (component) return component;
    current = current.parentElement;
  }
  return null;
};
var getComponentName = (componentType) => {
  if (!componentType) return null;
  return readString(componentType.__name) ?? readString(componentType.name);
};
var getComponentFilePath = (componentType) => {
  if (!componentType) return null;
  return readString(componentType.__file);
};
var getParentComponentFrom = (component) => {
  if (!component) return null;
  const parent = Reflect.get(component, "parent");
  return isRecord(parent) ? parent : null;
};
var getComponentChain = (element) => {
  const chain = [];
  let current = getNearestVueComponent(element);
  while (current) {
    chain.push(current);
    current = getParentComponentFrom(current);
  }
  return chain;
};
var getRuntimeStackFrames = (element) => getComponentChain(element).map((component) => {
  const componentType = getVueComponentType(component);
  const filePath = getComponentFilePath(componentType);
  if (!filePath) return null;
  return {
    filePath,
    lineNumber: null,
    columnNumber: null,
    componentName: getComponentName(componentType)
  };
}).filter((frame) => Boolean(frame));
var resolveFromInspectorAttribute = (element) => {
  const sourceElement = element.closest(INSPECTOR_SELECTOR);
  if (!sourceElement) return null;
  const location = sourceElement.getAttribute(INSPECTOR_ATTRIBUTE);
  if (!location) return null;
  const parsed = parseSourceLocation(location);
  if (!parsed) return null;
  const nearestComponent = getNearestVueComponent(element);
  const componentType = getVueComponentType(nearestComponent);
  return {
    filePath: parsed.filePath,
    lineNumber: parsed.lineNumber,
    columnNumber: parsed.columnNumber,
    componentName: getComponentName(componentType)
  };
};
var resolveStack3 = (element) => {
  const frames = [];
  const seen = /* @__PURE__ */ new Set();
  const inspectorInfo = resolveFromInspectorAttribute(element);
  if (inspectorInfo) {
    const identity = `${inspectorInfo.filePath}|${inspectorInfo.componentName ?? ""}`;
    frames.push(inspectorInfo);
    seen.add(identity);
  }
  for (const runtimeFrame of getRuntimeStackFrames(element)) {
    const identity = `${runtimeFrame.filePath}|${runtimeFrame.componentName ?? ""}`;
    if (seen.has(identity)) continue;
    seen.add(identity);
    frames.push(runtimeFrame);
  }
  return frames;
};
var vueResolver = {
  name: "vue",
  resolveStack: resolveStack3
};

// src/frameworks/solid.ts
var HANDLER_PREFIX = "$$";
var SOURCE_LOCATION_PATTERN = /location:\s*["']([^"']+:\d+:\d+)["']/g;
var SOURCE_MODULE_PATH_PREFIX = "/src/";
var CSS_FILE_EXTENSION = ".css";
var IMAGE_IMPORT_SUFFIX = "?import";
var RUNTIME_MODULES_KEY = "__SOLID_RUNTIME_MODULES__";
var MODULE_SOURCE_CACHE = /* @__PURE__ */ new Map();
var HANDLER_STACK_CACHE = /* @__PURE__ */ new Map();
var shouldIncludeModule = (resourceUrl) => {
  if (resourceUrl.includes(IMAGE_IMPORT_SUFFIX)) return false;
  const pathname = new URL(resourceUrl, window.location.href).pathname;
  if (pathname.endsWith(CSS_FILE_EXTENSION)) return false;
  return pathname.includes(SOURCE_MODULE_PATH_PREFIX);
};
var readModuleUrlsFromPerformance = () => {
  if (typeof window === "undefined") return [];
  const entries = performance.getEntriesByType("resource");
  const urls = /* @__PURE__ */ new Set();
  for (const entry of entries) {
    if (!entry.name || !shouldIncludeModule(entry.name)) continue;
    urls.add(entry.name);
  }
  return Array.from(urls);
};
var fetchModuleSource = (moduleUrl) => {
  const cached = MODULE_SOURCE_CACHE.get(moduleUrl);
  if (cached) return cached;
  const promise = fetch(moduleUrl).then((response) => response.ok ? response.text() : null).catch(() => null);
  MODULE_SOURCE_CACHE.set(moduleUrl, promise);
  return promise;
};
var readRuntimeModules = () => {
  if (typeof window === "undefined") return [];
  const modules = Reflect.get(window, RUNTIME_MODULES_KEY);
  if (!Array.isArray(modules)) return [];
  return modules;
};
var findHandlerSourceMatch = async (handlerSource) => {
  for (const runtimeModule of readRuntimeModules()) {
    const index = runtimeModule.content.indexOf(handlerSource);
    if (index === -1) continue;
    return {
      moduleUrl: runtimeModule.url,
      moduleContent: runtimeModule.content,
      handlerSourceIndex: index
    };
  }
  for (const moduleUrl of readModuleUrlsFromPerformance()) {
    const content = await fetchModuleSource(moduleUrl);
    if (!content) continue;
    const index = content.indexOf(handlerSource);
    if (index === -1) continue;
    return {
      moduleUrl,
      moduleContent: content,
      handlerSourceIndex: index
    };
  }
  return null;
};
var parseNearbyLocations = (moduleContent, handlerIndex) => {
  const windowStart = Math.max(0, handlerIndex - SOURCE_CONTEXT_HALF_WINDOW_CHARS);
  const windowEnd = Math.min(moduleContent.length, handlerIndex + SOURCE_CONTEXT_HALF_WINDOW_CHARS);
  const windowText = moduleContent.slice(windowStart, windowEnd);
  const matches = [];
  for (const match of windowText.matchAll(SOURCE_LOCATION_PATTERN)) {
    const rawLocation = match[1];
    if (!rawLocation) continue;
    const parsed = parseSourceLocation(rawLocation);
    if (!parsed || match.index === void 0) continue;
    const absoluteIndex = windowStart + match.index;
    matches.push({
      sourceInfo: {
        filePath: parsed.filePath,
        lineNumber: parsed.lineNumber,
        columnNumber: parsed.columnNumber,
        componentName: null
      },
      distance: Math.abs(absoluteIndex - handlerIndex)
    });
  }
  matches.sort((left, right) => {
    const leftLine = left.sourceInfo.lineNumber ?? 0;
    const rightLine = right.sourceInfo.lineNumber ?? 0;
    if (rightLine !== leftLine) return rightLine - leftLine;
    return left.distance - right.distance;
  });
  const seen = /* @__PURE__ */ new Set();
  const unique = [];
  for (const match of matches) {
    const identity = `${match.sourceInfo.filePath}:${match.sourceInfo.lineNumber}:${match.sourceInfo.columnNumber}`;
    if (seen.has(identity)) continue;
    seen.add(identity);
    unique.push(match.sourceInfo);
  }
  return unique;
};
var toProjectRelativePath = (moduleUrl) => {
  try {
    const pathname = decodeURIComponent(new URL(moduleUrl, window.location.href).pathname);
    if (!pathname.includes(SOURCE_MODULE_PATH_PREFIX)) return null;
    return pathname.startsWith("/") ? pathname.slice(1) : pathname;
  } catch {
    return null;
  }
};
var getGeneratedLocation = (moduleContent, handlerIndex) => {
  const prefix = moduleContent.slice(0, handlerIndex);
  const lines = prefix.split("\n");
  const lastLine = lines[lines.length - 1] ?? "";
  return {
    lineNumber: lines.length,
    columnNumber: lastLine.length + SOURCE_LINE_START_COLUMN
  };
};
var findHandlerCandidate = (element) => {
  let current = element;
  while (current) {
    for (const property of Object.getOwnPropertyNames(current)) {
      if (!property.startsWith(HANDLER_PREFIX)) continue;
      const value = Reflect.get(current, property);
      if (typeof value !== "function") continue;
      const source = String(value).trim();
      if (source.length < SOLID_HANDLER_SOURCE_LENGTH_MIN_CHARS) continue;
      return { source };
    }
    current = current.parentElement;
  }
  return null;
};
var resolveFromHandler = (handlerSource) => {
  const cached = HANDLER_STACK_CACHE.get(handlerSource);
  if (cached) return cached;
  const promise = (async () => {
    const match = await findHandlerSourceMatch(handlerSource);
    if (!match) return [];
    const locationFrames = parseNearbyLocations(match.moduleContent, match.handlerSourceIndex);
    if (locationFrames.length > 0) return locationFrames;
    const modulePath = toProjectRelativePath(match.moduleUrl);
    if (!modulePath) return [];
    const generated = getGeneratedLocation(match.moduleContent, match.handlerSourceIndex);
    return [
      {
        filePath: modulePath,
        lineNumber: generated.lineNumber,
        columnNumber: generated.columnNumber,
        componentName: null
      }
    ];
  })();
  HANDLER_STACK_CACHE.set(handlerSource, promise);
  return promise;
};
var resolveStack4 = (element) => {
  const candidate = findHandlerCandidate(element);
  if (!candidate) return Promise.resolve([]);
  return resolveFromHandler(candidate.source);
};
var solidResolver = {
  name: "solid",
  resolveStack: resolveStack4
};

// src/frameworks/preact.ts
var COMPONENT_NAME_FRAGMENT = "Fragment";
var ROOT_VNODE_PROPERTY = "__k";
var VNODE_CHILDREN_PROPERTY = "__k";
var VNODE_CONSTRUCTOR_PROPERTY = "constructor";
var VNODE_DOM_PROPERTY = "__e";
var VNODE_OWNER_PROPERTY = "__o";
var VNODE_PARENT_PROPERTY = "__";
var VNODE_PROPS_PROPERTY = "props";
var VNODE_SOURCE_PROPERTY = "__source";
var VNODE_TYPE_PROPERTY = "type";
var SOURCE_COLUMN_NUMBER_PROPERTY = "columnNumber";
var SOURCE_FILE_NAME_PROPERTY = "fileName";
var SOURCE_LINE_NUMBER_PROPERTY = "lineNumber";
var isPreactVNode = (value) => {
  if (!isRecord(value)) return false;
  if (Reflect.get(value, VNODE_CONSTRUCTOR_PROPERTY) !== void 0) return false;
  return Reflect.has(value, VNODE_TYPE_PROPERTY) && Reflect.has(value, VNODE_DOM_PROPERTY) && Reflect.has(value, VNODE_CHILDREN_PROPERTY);
};
var readVNode = (value) => isPreactVNode(value) ? value : null;
var getVNodeChildren = (vnode) => {
  const children = Reflect.get(vnode, VNODE_CHILDREN_PROPERTY);
  if (!Array.isArray(children)) return [];
  return children.filter((child) => isPreactVNode(child));
};
var getVNodeParent = (vnode) => readVNode(Reflect.get(vnode, VNODE_PARENT_PROPERTY));
var getVNodeOwner = (vnode) => readVNode(Reflect.get(vnode, VNODE_OWNER_PROPERTY));
var getVNodeDom = (vnode) => {
  if (typeof Node === "undefined") return null;
  const dom = Reflect.get(vnode, VNODE_DOM_PROPERTY);
  return dom instanceof Node ? dom : null;
};
var getComponentName2 = (vnode) => {
  const type = Reflect.get(vnode, VNODE_TYPE_PROPERTY);
  if (typeof type !== "function") return null;
  const displayName = readString(Reflect.get(type, "displayName")) ?? readString(Reflect.get(type, "name"));
  if (!displayName || displayName === COMPONENT_NAME_FRAGMENT) return null;
  return displayName;
};
var getNearestComponentName = (vnode) => {
  let current = vnode;
  while (current) {
    const componentName = getComponentName2(current);
    if (componentName) return componentName;
    current = getVNodeOwner(current) ?? getVNodeParent(current);
  }
  return null;
};
var getSourceRecord = (vnode) => {
  const source = Reflect.get(vnode, VNODE_SOURCE_PROPERTY);
  if (isRecord(source)) return source;
  const props = Reflect.get(vnode, VNODE_PROPS_PROPERTY);
  if (!isRecord(props)) return null;
  const propsSource = Reflect.get(props, VNODE_SOURCE_PROPERTY);
  return isRecord(propsSource) ? propsSource : null;
};
var createSourceInfo = (vnode, componentName) => {
  const source = getSourceRecord(vnode);
  if (!source) return null;
  const filePath = readString(Reflect.get(source, SOURCE_FILE_NAME_PROPERTY));
  const lineNumber = readNumber(Reflect.get(source, SOURCE_LINE_NUMBER_PROPERTY));
  const columnNumber = readNumber(Reflect.get(source, SOURCE_COLUMN_NUMBER_PROPERTY));
  if (!filePath || lineNumber === null) return null;
  return {
    filePath,
    lineNumber,
    columnNumber,
    componentName
  };
};
var getRootVNode = (element) => {
  let current = element;
  while (current) {
    const rootVNode = readVNode(Reflect.get(current, ROOT_VNODE_PROPERTY));
    if (rootVNode) return rootVNode;
    current = current.parentElement;
  }
  return null;
};
var hostVNodeContainsElement = (vnode, element) => {
  const type = Reflect.get(vnode, VNODE_TYPE_PROPERTY);
  if (typeof type !== "string") return true;
  const dom = getVNodeDom(vnode);
  if (!dom) return false;
  if (dom === element) return true;
  return dom instanceof Element ? dom.contains(element) : false;
};
var findVNodeForElement = (vnode, element) => {
  if (!hostVNodeContainsElement(vnode, element)) return null;
  for (const child of getVNodeChildren(vnode)) {
    const match = findVNodeForElement(child, element);
    if (match) return match;
  }
  const type = Reflect.get(vnode, VNODE_TYPE_PROPERTY);
  if (typeof type !== "string") return null;
  return getVNodeDom(vnode) === element ? vnode : null;
};
var resolveVNode = (element) => {
  const rootVNode = getRootVNode(element);
  if (!rootVNode) return null;
  return findVNodeForElement(rootVNode, element);
};
var getAncestorComponents = (vnode) => {
  const components = [];
  let currentOwner = getVNodeOwner(vnode);
  if (currentOwner) {
    while (currentOwner) {
      if (getComponentName2(currentOwner)) components.push(currentOwner);
      currentOwner = getVNodeOwner(currentOwner);
    }
    return components;
  }
  let currentParent = getVNodeParent(vnode);
  while (currentParent) {
    if (getComponentName2(currentParent)) components.push(currentParent);
    currentParent = getVNodeParent(currentParent);
  }
  return components;
};
var pushUniqueFrame = (frames, seen, frame) => {
  const identity = `${frame.filePath}:${frame.lineNumber}:${frame.columnNumber ?? ""}:${frame.componentName ?? ""}`;
  if (seen.has(identity)) return;
  seen.add(identity);
  frames.push(frame);
};
var resolveStack5 = (element) => {
  const vnode = resolveVNode(element);
  if (!vnode) return [];
  const componentName = getNearestComponentName(vnode);
  const frames = [];
  const seen = /* @__PURE__ */ new Set();
  const primaryFrame = createSourceInfo(vnode, componentName);
  if (primaryFrame) pushUniqueFrame(frames, seen, primaryFrame);
  let skippedPrimaryOwner = false;
  for (const ancestor of getAncestorComponents(vnode)) {
    const ancestorName = getComponentName2(ancestor);
    if (!ancestorName) continue;
    if (!skippedPrimaryOwner && primaryFrame && componentName && ancestorName === componentName) {
      skippedPrimaryOwner = true;
      continue;
    }
    skippedPrimaryOwner = true;
    const frame = createSourceInfo(ancestor, ancestorName);
    if (!frame) continue;
    pushUniqueFrame(frames, seen, frame);
  }
  return frames;
};
var resolveComponentName2 = (element) => {
  const vnode = resolveVNode(element);
  if (!vnode) return null;
  return getNearestComponentName(vnode);
};
var preactResolver = {
  name: "preact",
  resolveStack: resolveStack5,
  resolveComponentName: resolveComponentName2
};

// src/utils/get-tag-name.ts
var getTagName = (node) => {
  if ("tagName" in node && typeof node.tagName === "string") return node.tagName.toLowerCase();
  if ("nodeName" in node && typeof node.nodeName === "string") return node.nodeName.toLowerCase();
  return "";
};

// src/resolve.ts
var DEFAULT_RESOLVERS = [
  svelteResolver,
  vueResolver,
  solidResolver,
  preactResolver
];
var resolveFrameworkStack = async (element, resolvers) => {
  for (const resolver of resolvers) {
    const frames = await resolver.resolveStack(element);
    const validFrames = frames.filter((frame) => frame.filePath.length > 0);
    if (validFrames.length > 0) return validFrames;
  }
  return [];
};
var createSourceResolver = (options = {}) => {
  const frameworkResolvers = options.resolvers ?? DEFAULT_RESOLVERS;
  const resolveStack7 = async (node) => {
    const reactStack = await reactResolver.resolveStack(node);
    if (isElement(node)) {
      const frameworkStack = await resolveFrameworkStack(node, frameworkResolvers);
      if (reactStack.length > 0) return [...reactStack, ...frameworkStack];
      return frameworkStack;
    }
    return reactStack;
  };
  const resolveSource2 = async (node) => {
    const stack = await resolveStack7(node);
    return stack[0] ?? null;
  };
  const resolveComponentName4 = async (node) => {
    const reactName = await reactResolver.resolveComponentName?.(node);
    if (reactName) return reactName;
    if (isElement(node)) {
      const frameworkStack = await resolveFrameworkStack(node, frameworkResolvers);
      const frameworkName = frameworkStack.find((frame) => frame.componentName)?.componentName;
      return frameworkName ?? null;
    }
    return null;
  };
  const resolveElementInfo2 = async (node) => {
    const stack = await resolveStack7(node);
    const source = stack[0] ?? null;
    const componentName = stack.find((frame) => frame.componentName)?.componentName ?? await reactResolver.resolveComponentName?.(node) ?? null;
    return {
      tagName: getTagName(node),
      componentName,
      source,
      stack
    };
  };
  return { resolveSource: resolveSource2, resolveStack: resolveStack7, resolveComponentName: resolveComponentName4, resolveElementInfo: resolveElementInfo2 };
};
var defaultResolver = createSourceResolver();
var resolveSource = defaultResolver.resolveSource;
var resolveStack6 = defaultResolver.resolveStack;
var resolveComponentName3 = defaultResolver.resolveComponentName;
var resolveElementInfo = defaultResolver.resolveElementInfo;

// src/utils/format-stack-frame.ts
var formatSourceLocation = (sourceInfo) => {
  const parts = [sourceInfo.filePath];
  if (sourceInfo.lineNumber !== null) {
    parts.push(String(sourceInfo.lineNumber));
  }
  if (sourceInfo.columnNumber !== null) {
    parts.push(String(sourceInfo.columnNumber));
  }
  return parts.join(":");
};
var formatStackFrame = (frame) => {
  const location = formatSourceLocation(frame);
  if (frame.componentName) {
    return `
  in ${frame.componentName} (at ${location})`;
  }
  return `
  in ${location}`;
};

// src/utils/format-stack.ts
var formatStack = (stack, maxLines = DEFAULT_MAX_STACK_LINES) => {
  if (maxLines < 1 || stack.length < 1) return "";
  return stack.slice(0, maxLines).map(formatStackFrame).join("");
};

// src/utils/merge-stack-context.ts
var STACK_LINE_PREFIX = "in ";
var extractStackLines = (context) => context.split("\n").map((line) => line.trim()).filter((line) => line.startsWith(STACK_LINE_PREFIX)).map((line) => `
  ${line}`);
var mergeStackContext = (primary, secondary, maxLines) => {
  if (maxLines < 1) return "";
  const merged = [];
  const seen = /* @__PURE__ */ new Set();
  for (const context of [primary, secondary]) {
    for (const line of extractStackLines(context)) {
      if (seen.has(line)) continue;
      seen.add(line);
      merged.push(line);
    }
  }
  return merged.slice(0, maxLines).join("");
};
export {
  checkIsNextProject,
  createSourceResolver,
  formatStack,
  formatStackFrame,
  getReactStack,
  getTagName,
  isSourceComponentName,
  mergeStackContext,
  parseSourceLocation,
  preactResolver,
  reactResolver,
  resolveComponentName3 as resolveComponentName,
  resolveElementInfo,
  resolveSource,
  resolveStack6 as resolveStack,
  solidResolver,
  svelteResolver,
  vueResolver
};
//# sourceMappingURL=index.js.map