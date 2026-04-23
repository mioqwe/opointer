(() => {
  // ../../node_modules/bippy/dist/rdt-hook.js
  var e = `0.5.39`;
  var t = `bippy-${e}`;
  var n = Object.defineProperty;
  var r = Object.prototype.hasOwnProperty;
  var i = () => {
  };
  var a = (e2) => {
    try {
      Function.prototype.toString.call(e2).indexOf(`^_^`) > -1 && setTimeout(() => {
        throw Error(`React is running in production mode, but dead code elimination has not been applied. Read how to correctly configure React for production: https://reactjs.org/link/perf-use-production-build`);
      });
    } catch {
    }
  };
  var o = (e2 = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__) => !!(e2 && `getFiberRoots` in e2);
  var s = false;
  var c;
  var l = (e2 = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__) => s ? true : (e2 && typeof e2.inject == `function` && (c = e2.inject.toString()), !!c?.includes(`(injected)`));
  var u = /* @__PURE__ */ new Set();
  var d = /* @__PURE__ */ new Set();
  var f = (e2) => {
    let r2 = /* @__PURE__ */ new Map(), o3 = 0, s3 = { _instrumentationIsActive: false, _instrumentationSource: t, checkDCE: a, hasUnsupportedRendererAttached: false, inject(e3) {
      let t2 = ++o3;
      return r2.set(t2, e3), d.add(e3), s3._instrumentationIsActive || (s3._instrumentationIsActive = true, u.forEach((e4) => e4())), t2;
    }, on: i, onCommitFiberRoot: i, onCommitFiberUnmount: i, onPostCommitFiberRoot: i, renderers: r2, supportsFiber: true, supportsFlight: true };
    try {
      n(globalThis, `__REACT_DEVTOOLS_GLOBAL_HOOK__`, { configurable: true, enumerable: true, get() {
        return s3;
      }, set(t3) {
        if (t3 && typeof t3 == `object`) {
          let n2 = s3.renderers;
          s3 = t3, n2.size > 0 && (n2.forEach((e3, n3) => {
            d.add(e3), t3.renderers.set(n3, e3);
          }), p(e2));
        }
      } });
      let t2 = window.hasOwnProperty, r3 = false;
      n(window, `hasOwnProperty`, { configurable: true, value: function(...e3) {
        try {
          if (!r3 && e3[0] === `__REACT_DEVTOOLS_GLOBAL_HOOK__`) return globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__ = void 0, r3 = true, -0;
        } catch {
        }
        return t2.apply(this, e3);
      }, writable: true });
    } catch {
      p(e2);
    }
    return s3;
  };
  var p = (e2) => {
    e2 && u.add(e2);
    try {
      let n2 = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (!n2) return;
      if (!n2._instrumentationSource) {
        n2.checkDCE = a, n2.supportsFiber = true, n2.supportsFlight = true, n2.hasUnsupportedRendererAttached = false, n2._instrumentationSource = t, n2._instrumentationIsActive = false;
        let e3 = o(n2);
        if (e3 || (n2.on = i), n2.renderers.size) {
          n2._instrumentationIsActive = true, u.forEach((e4) => e4());
          return;
        }
        let r2 = n2.inject, c3 = l(n2);
        c3 && !e3 && (s = true, n2.inject({ scheduleRefresh() {
        } }) && (n2._instrumentationIsActive = true)), n2.inject = (e4) => {
          let t2 = r2(e4);
          return d.add(e4), c3 && n2.renderers.set(t2, e4), n2._instrumentationIsActive = true, u.forEach((e5) => e5()), t2;
        };
      }
      (n2.renderers.size || n2._instrumentationIsActive || l()) && e2?.();
    } catch {
    }
  };
  var m = () => r.call(globalThis, `__REACT_DEVTOOLS_GLOBAL_HOOK__`);
  var h = (e2) => m() ? (p(e2), globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__) : f(e2);
  var g = () => !!(typeof window < `u` && (window.document?.createElement || window.navigator?.product === `ReactNative`));
  var _ = () => {
    try {
      g() && h();
    } catch {
    }
  };

  // ../../node_modules/bippy/dist/install-hook-only.js
  _();

  // ../../node_modules/bippy/dist/core.js
  var ve = (e2) => {
    switch (e2.tag) {
      case 1:
      case 11:
      case 0:
      case 14:
      case 15:
        return true;
      default:
        return false;
    }
  };
  function j(e2, t2, n2 = false) {
    if (!e2) return null;
    let r2 = t2(e2);
    if (r2 instanceof Promise) return (async () => {
      if (await r2 === true) return e2;
      let i4 = n2 ? e2.return : e2.child;
      for (; i4; ) {
        let e3 = await N(i4, t2, n2);
        if (e3) return e3;
        i4 = n2 ? null : i4.sibling;
      }
      return null;
    })();
    if (r2 === true) return e2;
    let i3 = n2 ? e2.return : e2.child;
    for (; i3; ) {
      let e3 = M(i3, t2, n2);
      if (e3) return e3;
      i3 = n2 ? null : i3.sibling;
    }
    return null;
  }
  var M = (e2, t2, n2 = false) => {
    if (!e2) return null;
    if (t2(e2) === true) return e2;
    let r2 = n2 ? e2.return : e2.child;
    for (; r2; ) {
      let e3 = M(r2, t2, n2);
      if (e3) return e3;
      r2 = n2 ? null : r2.sibling;
    }
    return null;
  };
  var N = async (e2, t2, n2 = false) => {
    if (!e2) return null;
    if (await t2(e2) === true) return e2;
    let r2 = n2 ? e2.return : e2.child;
    for (; r2; ) {
      let e3 = await N(r2, t2, n2);
      if (e3) return e3;
      r2 = n2 ? null : r2.sibling;
    }
    return null;
  };
  var P = (e2) => {
    let t2 = e2;
    return typeof t2 == `function` ? t2 : typeof t2 == `object` && t2 ? P(t2.type || t2.render) : null;
  };
  var we = (e2) => {
    let t2 = e2;
    if (typeof t2 == `string`) return t2;
    if (typeof t2 != `function` && !(typeof t2 == `object` && t2)) return null;
    let n2 = t2.displayName || t2.name || null;
    if (n2) return n2;
    let r2 = P(t2);
    return r2 && (r2.displayName || r2.name) || null;
  };
  var Te = () => {
    let e2 = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    return !!e2?._instrumentationIsActive || o(e2) || l(e2);
  };
  var Z = (e2) => {
    let t2 = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (t2?.renderers) for (let n2 of t2.renderers.values()) try {
      let t3 = n2.findFiberByHostInstance?.(e2);
      if (t3) return t3;
    } catch {
    }
    if (typeof e2 == `object` && e2) {
      if (`_reactRootContainer` in e2) return e2._reactRootContainer?._internalRoot?.current?.child;
      for (let t3 in e2) if (t3.startsWith(`__reactContainer$`) || t3.startsWith(`__reactInternalInstance$`) || t3.startsWith(`__reactFiber`)) return e2[t3] || null;
    }
    return null;
  };
  var Q = Error();

  // ../../node_modules/bippy/dist/source.js
  var i2 = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;
  var a2 = [`rsc://`, `file:///`, `webpack-internal://`, `webpack://`, `node:`, `turbopack://`, `metro://`, `/app-pages-browser/`, `/(app-pages-browser)/`];
  var o2 = [`<anonymous>`, `eval`, ``];
  var s2 = /\.(jsx|tsx|ts|js)$/;
  var c2 = /(\.min|bundle|chunk|vendor|vendors|runtime|polyfill|polyfills)\.(js|mjs|cjs)$|(chunk|bundle|vendor|vendors|runtime|polyfill|polyfills|framework|app|main|index)[-_.][A-Za-z0-9_-]{4,}\.(js|mjs|cjs)$|[\da-f]{8,}\.(js|mjs|cjs)$|[-_.][\da-f]{20,}\.(js|mjs|cjs)$|\/dist\/|\/build\/|\/.next\/|\/out\/|\/node_modules\/|\.webpack\.|\.vite\.|\.turbopack\./i;
  var l2 = /^\?[\w~.-]+(?:=[^&#]*)?(?:&[\w~.-]+(?:=[^&#]*)?)*$/;
  var u2 = /(^|@)\S+:\d+/;
  var d3 = /^\s*at .*(\S+:\d+|\(native\))/m;
  var f3 = /^(eval@)?(\[native code\])?$/;
  var m3 = (e2, t2) => {
    if (t2?.includeInElement !== false) {
      let n2 = e2.split(`
`), r2 = [];
      for (let e3 of n2) if (/^\s*at\s+/.test(e3)) {
        let t3 = _3(e3, void 0)[0];
        t3 && r2.push(t3);
      } else if (/^\s*in\s+/.test(e3)) {
        let t3 = e3.replace(/^\s*in\s+/, ``).replace(/\s*\(at .*\)$/, ``);
        r2.push({ functionName: t3, source: e3 });
      } else if (e3.match(u2)) {
        let t3 = v2(e3, void 0)[0];
        t3 && r2.push(t3);
      }
      return g3(r2, t2);
    }
    return e2.match(d3) ? _3(e2, t2) : v2(e2, t2);
  };
  var h3 = (e2) => {
    if (!e2.includes(`:`)) return [e2, void 0, void 0];
    let t2 = e2.startsWith(`(`) && /:\d+\)$/.test(e2) ? e2.slice(1, -1) : e2, n2 = /(.+?)(?::(\d+))?(?::(\d+))?$/.exec(t2);
    return n2 ? [n2[1], n2[2] || void 0, n2[3] || void 0] : [t2, void 0, void 0];
  };
  var g3 = (e2, t2) => t2 && t2.slice != null ? Array.isArray(t2.slice) ? e2.slice(t2.slice[0], t2.slice[1]) : e2.slice(0, t2.slice) : e2;
  var _3 = (e2, t2) => g3(e2.split(`
`).filter((e3) => !!e3.match(d3)), t2).map((e3) => {
    let t3 = e3;
    t3.includes(`(eval `) && (t3 = t3.replace(/eval code/g, `eval`).replace(/(\(eval at [^()]*)|(,.*$)/g, ``));
    let n2 = t3.replace(/^\s+/, ``).replace(/\(eval code/g, `(`).replace(/^.*?\s+/, ``), r2 = n2.match(/ (\(.+\)$)/);
    n2 = r2 ? n2.replace(r2[0], ``) : n2;
    let i3 = h3(r2 ? r2[1] : n2);
    return { functionName: r2 && n2 || void 0, fileName: [`eval`, `<anonymous>`].includes(i3[0]) ? void 0 : i3[0], lineNumber: i3[1] ? +i3[1] : void 0, columnNumber: i3[2] ? +i3[2] : void 0, source: t3 };
  });
  var v2 = (e2, t2) => g3(e2.split(`
`).filter((e3) => !e3.match(f3)), t2).map((e3) => {
    let t3 = e3;
    if (t3.includes(` > eval`) && (t3 = t3.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, `:$1`)), !t3.includes(`@`) && !t3.includes(`:`)) return { functionName: t3 };
    {
      let e4 = /(([^\n\r"\u2028\u2029]*".[^\n\r"\u2028\u2029]*"[^\n\r@\u2028\u2029]*(?:@[^\n\r"\u2028\u2029]*"[^\n\r@\u2028\u2029]*)*(?:[\n\r\u2028\u2029][^@]*)?)?[^@]*)@/, n2 = t3.match(e4), r2 = n2 && n2[1] ? n2[1] : void 0, i3 = h3(t3.replace(e4, ``));
      return { functionName: r2, fileName: i3[0], lineNumber: i3[1] ? +i3[1] : void 0, columnNumber: i3[2] ? +i3[2] : void 0, source: t3 };
    }
  });
  var ie2 = 44;
  var ae2 = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`;
  var oe2 = new Uint8Array(64);
  var se2 = new Uint8Array(128);
  for (let e2 = 0; e2 < ae2.length; e2++) {
    let t2 = ae2.charCodeAt(e2);
    oe2[e2] = t2, se2[t2] = e2;
  }
  function x2(e2, t2) {
    let n2 = 0, r2 = 0, i3 = 0;
    do
      i3 = se2[e2.next()], n2 |= (i3 & 31) << r2, r2 += 5;
    while (i3 & 32);
    let a3 = n2 & 1;
    return n2 >>>= 1, a3 && (n2 = -2147483648 | -n2), t2 + n2;
  }
  function ce2(e2, t2) {
    return e2.pos >= t2 ? false : e2.peek() !== ie2;
  }
  var le2 = class {
    constructor(e2) {
      this.pos = 0, this.buffer = e2;
    }
    next() {
      return this.buffer.charCodeAt(this.pos++);
    }
    peek() {
      return this.buffer.charCodeAt(this.pos);
    }
    indexOf(e2) {
      let { buffer: t2, pos: n2 } = this, r2 = t2.indexOf(e2, n2);
      return r2 === -1 ? t2.length : r2;
    }
  };
  function ue2(e2) {
    let { length: t2 } = e2, n2 = new le2(e2), r2 = [], i3 = 0, a3 = 0, o3 = 0, s3 = 0, c3 = 0;
    do {
      let e3 = n2.indexOf(`;`), t3 = [], l3 = true, u3 = 0;
      for (i3 = 0; n2.pos < e3; ) {
        let r3;
        i3 = x2(n2, i3), i3 < u3 && (l3 = false), u3 = i3, ce2(n2, e3) ? (a3 = x2(n2, a3), o3 = x2(n2, o3), s3 = x2(n2, s3), ce2(n2, e3) ? (c3 = x2(n2, c3), r3 = [i3, a3, o3, s3, c3]) : r3 = [i3, a3, o3, s3]) : r3 = [i3], t3.push(r3), n2.pos++;
      }
      l3 || de2(t3), r2.push(t3), n2.pos = e3 + 1;
    } while (n2.pos <= t2);
    return r2;
  }
  function de2(e2) {
    e2.sort(fe2);
  }
  function fe2(e2, t2) {
    return e2[0] - t2[0];
  }
  var pe2 = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;
  var me2 = /^data:application\/json[^,]+base64,/;
  var he2 = /(?:\/\/[@#][ \t]+sourceMappingURL=([^\s'"]+?)[ \t]*$)|(?:\/\*[@#][ \t]+sourceMappingURL=([^*]+?)[ \t]*(?:\*\/)[ \t]*$)/;
  var S2 = typeof WeakRef < `u`;
  var C2 = /* @__PURE__ */ new Map();
  var w2 = /* @__PURE__ */ new Map();
  var ge2 = (e2) => S2 && e2 instanceof WeakRef;
  var _e2 = (e2, t2, n2, r2) => {
    if (n2 < 0 || n2 >= e2.length) return null;
    let i3 = e2[n2];
    if (!i3 || i3.length === 0) return null;
    let a3 = null;
    for (let e3 of i3) if (e3[0] <= r2) a3 = e3;
    else break;
    if (!a3 || a3.length < 4) return null;
    let [, o3, s3, c3] = a3;
    if (o3 === void 0 || s3 === void 0 || c3 === void 0) return null;
    let l3 = t2[o3];
    return l3 ? { columnNumber: c3, fileName: l3, lineNumber: s3 + 1 } : null;
  };
  var T2 = (e2, t2, n2) => {
    if (e2.sections) {
      let r2 = null;
      for (let i4 of e2.sections) if (t2 > i4.offset.line || t2 === i4.offset.line && n2 >= i4.offset.column) r2 = i4;
      else break;
      if (!r2) return null;
      let i3 = t2 - r2.offset.line, a3 = t2 === r2.offset.line ? n2 - r2.offset.column : n2;
      return _e2(r2.map.mappings, r2.map.sources, i3, a3);
    }
    return _e2(e2.mappings, e2.sources, t2 - 1, n2);
  };
  var ve2 = (e2, t2) => {
    let n2 = t2.split(`
`), r2;
    for (let e3 = n2.length - 1; e3 >= 0 && !r2; e3--) {
      let t3 = n2[e3].match(he2);
      t3 && (r2 = t3[1] || t3[2]);
    }
    if (!r2) return null;
    let i3 = pe2.test(r2);
    if (!(me2.test(r2) || i3 || r2.startsWith(`/`))) {
      let t3 = e2.split(`/`);
      t3[t3.length - 1] = r2, r2 = t3.join(`/`);
    }
    return r2;
  };
  var ye2 = (e2) => ({ file: e2.file, mappings: ue2(e2.mappings), names: e2.names, sourceRoot: e2.sourceRoot, sources: e2.sources, sourcesContent: e2.sourcesContent, version: 3 });
  var be2 = (e2) => {
    let t2 = e2.sections.map(({ map: e3, offset: t3 }) => ({ map: { ...e3, mappings: ue2(e3.mappings) }, offset: t3 })), n2 = /* @__PURE__ */ new Set();
    for (let e3 of t2) for (let t3 of e3.map.sources) n2.add(t3);
    return { file: e2.file, mappings: [], names: [], sections: t2, sourceRoot: void 0, sources: Array.from(n2), sourcesContent: void 0, version: 3 };
  };
  var E2 = (e2) => {
    if (!e2) return false;
    let t2 = e2.trim();
    if (!t2) return false;
    let n2 = t2.match(pe2);
    if (!n2) return true;
    let r2 = n2[0].toLowerCase();
    return r2 === `http:` || r2 === `https:`;
  };
  var D2 = async (e2, t2 = fetch) => {
    if (!E2(e2)) return null;
    let n2;
    try {
      let r3 = await t2(e2);
      if (!r3.ok) return null;
      n2 = await r3.text();
    } catch {
      return null;
    }
    if (!n2) return null;
    let r2 = ve2(e2, n2);
    if (!r2 || !E2(r2)) return null;
    try {
      let e3 = await t2(r2);
      if (!e3.ok) return null;
      let n3 = await e3.json();
      return `sections` in n3 ? be2(n3) : ye2(n3);
    } catch {
      return null;
    }
  };
  var O2 = async (e2, t2 = true, n2) => {
    if (t2 && C2.has(e2)) {
      let t3 = C2.get(e2);
      if (t3 == null) return null;
      if (ge2(t3)) {
        let n3 = t3.deref();
        if (n3) return n3;
        C2.delete(e2);
      } else return t3;
    }
    if (t2 && w2.has(e2)) return w2.get(e2);
    let r2 = D2(e2, n2);
    t2 && w2.set(e2, r2);
    let i3 = await r2;
    return t2 && w2.delete(e2), t2 && (i3 === null ? C2.set(e2, null) : C2.set(e2, S2 ? new WeakRef(i3) : i3)), i3;
  };
  var xe2 = async (e2, t2 = true, n2) => await Promise.all(e2.map(async (e3) => {
    if (!e3.fileName) return e3;
    let r2 = await O2(e3.fileName, t2, n2);
    if (!r2 || typeof e3.lineNumber != `number` || typeof e3.columnNumber != `number`) return e3;
    let i3 = T2(r2, e3.lineNumber, e3.columnNumber);
    return i3 ? { ...e3, source: i3.fileName && e3.source ? e3.source.replace(e3.fileName, i3.fileName) : e3.source, fileName: i3.fileName, lineNumber: i3.lineNumber, columnNumber: i3.columnNumber, isSymbolicated: true } : e3;
  }));
  var Se2 = (e2) => e2._debugStack instanceof Error && typeof e2._debugStack?.stack == `string`;
  var Ce2 = () => {
    let n2 = h();
    for (let t2 of [...Array.from(d), ...Array.from(n2.renderers.values())]) {
      let e2 = t2.currentDispatcherRef;
      if (e2 && typeof e2 == `object`) return `H` in e2 ? e2.H : e2.current;
    }
    return null;
  };
  var k2 = (t2) => {
    for (let n2 of d) {
      let e2 = n2.currentDispatcherRef;
      e2 && typeof e2 == `object` && (`H` in e2 ? e2.H = t2 : e2.current = t2);
    }
  };
  var A2 = (e2) => `
    in ${e2}`;
  var j2 = (e2, t2) => {
    let n2 = A2(e2);
    return t2 && (n2 += ` (at ${t2})`), n2;
  };
  var M2 = false;
  var N2 = (e2, t2) => {
    if (!e2 || M2) return ``;
    let r2 = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0, M2 = true;
    let i3 = Ce2();
    k2(null);
    let a3 = console.error, o3 = console.warn;
    console.error = () => {
    }, console.warn = () => {
    };
    try {
      let r3 = { DetermineComponentFrameRoot() {
        let n2;
        try {
          if (t2) {
            let t3 = function() {
              throw Error();
            };
            if (Object.defineProperty(t3.prototype, `props`, { set: function() {
              throw Error();
            } }), typeof Reflect == `object` && Reflect.construct) {
              try {
                Reflect.construct(t3, []);
              } catch (e3) {
                n2 = e3;
              }
              Reflect.construct(e2, [], t3);
            } else {
              try {
                t3.call();
              } catch (e3) {
                n2 = e3;
              }
              e2.call(t3.prototype);
            }
          } else {
            try {
              throw Error();
            } catch (e3) {
              n2 = e3;
            }
            let t3 = e2();
            t3 && typeof t3.catch == `function` && t3.catch(() => {
            });
          }
        } catch (e3) {
          if (e3 instanceof Error && n2 instanceof Error && typeof e3.stack == `string`) return [e3.stack, n2.stack];
        }
        return [null, null];
      } };
      r3.DetermineComponentFrameRoot.displayName = `DetermineComponentFrameRoot`, Object.getOwnPropertyDescriptor(r3.DetermineComponentFrameRoot, `name`)?.configurable && Object.defineProperty(r3.DetermineComponentFrameRoot, `name`, { value: `DetermineComponentFrameRoot` });
      let [i4, a4] = r3.DetermineComponentFrameRoot();
      if (i4 && a4) {
        let t3 = i4.split(`
`), r4 = a4.split(`
`), o4 = 0, s4 = 0;
        for (; o4 < t3.length && !t3[o4].includes(`DetermineComponentFrameRoot`); ) o4++;
        for (; s4 < r4.length && !r4[s4].includes(`DetermineComponentFrameRoot`); ) s4++;
        if (o4 === t3.length || s4 === r4.length) for (o4 = t3.length - 1, s4 = r4.length - 1; o4 >= 1 && s4 >= 0 && t3[o4] !== r4[s4]; ) s4--;
        for (; o4 >= 1 && s4 >= 0; o4--, s4--) if (t3[o4] !== r4[s4]) {
          if (o4 !== 1 || s4 !== 1) do
            if (o4--, s4--, s4 < 0 || t3[o4] !== r4[s4]) {
              let r5 = `
${t3[o4].replace(` at new `, ` at `)}`, i5 = we(e2);
              return i5 && r5.includes(`<anonymous>`) && (r5 = r5.replace(`<anonymous>`, i5)), r5;
            }
          while (o4 >= 1 && s4 >= 0);
          break;
        }
      }
    } finally {
      M2 = false, Error.prepareStackTrace = r2, k2(i3), console.error = a3, console.warn = o3;
    }
    let s3 = e2 ? we(e2) : ``;
    return s3 ? A2(s3) : ``;
  };
  var P2 = (e2, t2) => {
    let n2 = e2.tag, r2 = ``;
    switch (n2) {
      case 28:
        r2 = A2(`Activity`);
        break;
      case 1:
        r2 = N2(e2.type, true);
        break;
      case 11:
        r2 = N2(e2.type.render, false);
        break;
      case 0:
      case 15:
        r2 = N2(e2.type, false);
        break;
      case 5:
      case 26:
      case 27:
        r2 = A2(e2.type);
        break;
      case 16:
        r2 = A2(`Lazy`);
        break;
      case 13:
        r2 = e2.child !== t2 && t2 !== null ? A2(`Suspense Fallback`) : A2(`Suspense`);
        break;
      case 19:
        r2 = A2(`SuspenseList`);
        break;
      case 30:
        r2 = A2(`ViewTransition`);
        break;
      default:
        return ``;
    }
    return r2;
  };
  var F2 = (e2) => {
    try {
      let t2 = ``, n2 = e2, r2 = null;
      do {
        t2 += P2(n2, r2);
        let e3 = n2._debugInfo;
        if (e3 && Array.isArray(e3)) for (let n3 = e3.length - 1; n3 >= 0; n3--) {
          let r3 = e3[n3];
          typeof r3.name == `string` && (t2 += j2(r3.name, r3.env));
        }
        r2 = n2, n2 = n2.return;
      } while (n2);
      return t2;
    } catch (e3) {
      return e3 instanceof Error ? `
Error generating stack: ${e3.message}
${e3.stack}` : ``;
    }
  };
  var I = (e2) => {
    let t2 = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    let n2 = e2;
    if (!n2) return ``;
    Error.prepareStackTrace = t2, n2.startsWith(`Error: react-stack-top-frame
`) && (n2 = n2.slice(29));
    let r2 = n2.indexOf(`
`);
    if (r2 !== -1 && (n2 = n2.slice(r2 + 1)), r2 = Math.max(n2.indexOf(`react_stack_bottom_frame`), n2.indexOf(`react-stack-bottom-frame`)), r2 !== -1 && (r2 = n2.lastIndexOf(`
`, r2)), r2 !== -1) n2 = n2.slice(0, r2);
    else return ``;
    return n2;
  };
  var we2 = (e2) => !!(e2.fileName?.startsWith(`rsc://`) && e2.functionName);
  var Te2 = (e2, t2) => e2.fileName === t2.fileName && e2.lineNumber === t2.lineNumber && e2.columnNumber === t2.columnNumber;
  var Ee2 = (e2) => {
    let t2 = /* @__PURE__ */ new Map();
    for (let n2 of e2) for (let e3 of n2.stackFrames) {
      if (!we2(e3)) continue;
      let n3 = e3.functionName, r2 = t2.get(n3) ?? [];
      r2.some((t3) => Te2(t3, e3)) || (r2.push(e3), t2.set(n3, r2));
    }
    return t2;
  };
  var De = (e2, t2, n2) => {
    if (!e2.functionName) return { ...e2, isServer: true };
    let r2 = t2.get(e2.functionName);
    if (!r2 || r2.length === 0) return { ...e2, isServer: true };
    let i3 = n2.get(e2.functionName) ?? 0, a3 = r2[i3 % r2.length];
    return n2.set(e2.functionName, i3 + 1), { ...e2, isServer: true, fileName: a3.fileName, lineNumber: a3.lineNumber, columnNumber: a3.columnNumber, source: e2.source?.replace(`(at Server)`, `(${a3.fileName}:${a3.lineNumber}:${a3.columnNumber})`) };
  };
  var Oe2 = (e2) => {
    let t2 = [];
    return j(e2, (e3) => {
      if (!Se2(e3)) return;
      let r2 = typeof e3.type == `string` ? e3.type : we(e3.type) || `<anonymous>`;
      t2.push({ componentName: r2, stackFrames: m3(I(e3._debugStack?.stack)) });
    }, true), t2;
  };
  var L2 = async (e2, t2 = true, n2) => {
    let r2 = Oe2(e2), i3 = m3(F2(e2)), a3 = Ee2(r2), o3 = /* @__PURE__ */ new Map();
    return xe2(i3.map((e3) => e3.source?.includes(`(at Server)`) ?? false ? De(e3, a3, o3) : e3).filter((e3, t3, n3) => {
      if (t3 === 0) return true;
      let r3 = n3[t3 - 1];
      return e3.functionName !== r3.functionName;
    }), t2, n2);
  };
  var z2 = (e2) => e2.split(`/`).filter(Boolean).length;
  var Ae2 = (e2) => e2.split(`/`).filter(Boolean)[0] ?? null;
  var je2 = (e2) => {
    let t2 = e2.indexOf(`/`, 1);
    if (t2 === -1 || z2(e2.slice(0, t2)) !== 1) return e2;
    let n2 = e2.slice(t2);
    if (!s2.test(n2) || z2(n2) < 2) return e2;
    let r2 = Ae2(n2);
    return !r2 || r2.startsWith(`@`) || r2.length > 4 ? e2 : n2;
  };
  var Me2 = (e2) => {
    if (!e2 || o2.some((t3) => t3 === e2)) return ``;
    let t2 = e2, n2 = t2.startsWith(`http://`) || t2.startsWith(`https://`);
    if (n2) try {
      t2 = new URL(t2).pathname;
    } catch {
    }
    if (n2 && (t2 = je2(t2)), t2.startsWith(`about://React/`)) {
      let e3 = t2.slice(14), n3 = e3.indexOf(`/`), r3 = e3.indexOf(`:`);
      t2 = n3 !== -1 && (r3 === -1 || n3 < r3) ? e3.slice(n3 + 1) : e3;
    }
    let r2 = true;
    for (; r2; ) {
      r2 = false;
      for (let e3 of a2) if (t2.startsWith(e3)) {
        t2 = t2.slice(e3.length), e3 === `file:///` && (t2 = `/${t2.replace(/^\/+/, ``)}`), r2 = true;
        break;
      }
    }
    if (i2.test(t2)) {
      let e3 = t2.match(i2);
      e3 && (t2 = t2.slice(e3[0].length));
    }
    if (t2.startsWith(`//`)) {
      let e3 = t2.indexOf(`/`, 2);
      t2 = e3 === -1 ? `` : t2.slice(e3);
    }
    let s3 = t2.indexOf(`?`);
    if (s3 !== -1) {
      let e3 = t2.slice(s3);
      l2.test(e3) && (t2 = t2.slice(0, s3));
    }
    return t2;
  };
  var Ne2 = (e2) => {
    let t2 = Me2(e2);
    return !(!t2 || !s2.test(t2) || c2.test(t2));
  };
  var Ie = /* @__PURE__ */ Symbol.for(`react.context`);
  var Le = /* @__PURE__ */ Symbol.for(`react.memo_cache_sentinel`);
  var B2 = [];
  var H2 = null;
  var U2 = null;
  var W = null;
  var G = 0;
  var K = null;
  var q = Error("Suspense Exception: This is not a real error! It's an implementation detail of `use` to interrupt the current render.");
  var Y = () => {
    let e2 = U2;
    return e2 !== null && (U2 = e2.next), e2;
  };
  var X = (e2) => {
    if (H2 === null) return e2._currentValue;
    if (W === null) throw Error(`Context reads do not line up with context dependencies.`);
    if (Object.prototype.hasOwnProperty.call(W, `memoizedValue`)) {
      let e3 = W.memoizedValue;
      return W = W.next, e3;
    }
    return e2._currentValue;
  };
  var Z2 = (e2, t2, n2, r2 = null) => {
    B2.push({ displayName: r2, primitive: e2, stackError: Error(), value: t2, dispatcherHookName: n2 });
  };
  var Ve = (e2) => {
    if (typeof e2 == `object` && e2) {
      let t2 = e2;
      if (typeof t2.then == `function`) {
        let e3 = K !== null && G < K.length ? K[G++] : t2;
        switch (e3.status) {
          case `fulfilled`:
            return Z2(`Promise`, e3.value, `Use`), e3.value;
          case `rejected`:
            throw e3.reason;
        }
        throw Z2(`Unresolved`, e3, `Use`), q;
      }
      if (t2.$$typeof === Ie && `_currentValue` in t2) {
        let e3 = t2, n2 = X(e3);
        return Z2(`Context (use)`, n2, `Use`, e3.displayName || `Context`), n2;
      }
    }
    throw Error(`An unsupported type was passed to use(): ` + String(e2));
  };
  var He = (e2) => {
    let t2 = X(e2);
    return Z2(`Context`, t2, `Context`, e2.displayName || null), t2;
  };
  var Ue = (e2) => {
    let t2 = Y(), n2 = t2 === null ? typeof e2 == `function` ? e2() : e2 : t2.memoizedState;
    return Z2(`State`, n2, `State`), [n2, () => {
    }];
  };
  var We = (e2, t2, n2) => {
    let r2 = Y(), i3 = r2 === null ? n2 === void 0 ? t2 : n2(t2) : r2.memoizedState;
    return Z2(`Reducer`, i3, `Reducer`), [i3, () => {
    }];
  };
  var Ge = (e2) => {
    let t2 = Y(), n2 = t2 === null ? { current: e2 } : t2.memoizedState;
    return Z2(`Ref`, n2.current, `Ref`), n2;
  };
  var Ke = () => {
    let e2 = Y();
    return Z2(`CacheRefresh`, e2 === null ? () => {
    } : e2.memoizedState, `CacheRefresh`), () => {
    };
  };
  var qe = (e2) => {
    Y(), Z2(`LayoutEffect`, e2, `LayoutEffect`);
  };
  var Je = (e2) => {
    Y(), Z2(`InsertionEffect`, e2, `InsertionEffect`);
  };
  var Ye = (e2) => {
    Y(), Z2(`Effect`, e2, `Effect`);
  };
  var Xe = (e2) => {
    Y();
    let t2;
    typeof e2 == `object` && e2 && `current` in e2 && (t2 = e2.current), Z2(`ImperativeHandle`, t2, `ImperativeHandle`);
  };
  var Ze = (e2, t2) => {
    Z2(`DebugValue`, typeof t2 == `function` ? t2(e2) : e2, `DebugValue`);
  };
  var Qe = (e2) => {
    let t2 = Y();
    return Z2(`Callback`, t2 === null ? e2 : t2.memoizedState[0], `Callback`), e2;
  };
  var $e = (e2) => {
    let t2 = Y(), n2 = t2 === null ? e2() : t2.memoizedState[0];
    return Z2(`Memo`, n2, `Memo`), n2;
  };
  var et = (e2, t2) => {
    let n2 = Y();
    Y();
    let r2 = n2 === null ? t2() : n2.memoizedState;
    return Z2(`SyncExternalStore`, r2, `SyncExternalStore`), r2;
  };
  var tt = () => {
    let e2 = Y();
    Y();
    let t2 = e2 === null ? false : e2.memoizedState;
    return Z2(`Transition`, t2, `Transition`), [t2, () => {
    }];
  };
  var nt = (e2) => {
    let t2 = Y(), n2 = t2 === null ? e2 : t2.memoizedState;
    return Z2(`DeferredValue`, n2, `DeferredValue`), n2;
  };
  var rt = () => {
    let e2 = Y(), t2 = e2 === null ? `` : e2.memoizedState;
    return Z2(`Id`, t2, `Id`), t2;
  };
  var it = (e2) => {
    let t2 = H2;
    if (t2 == null) return [];
    let n2 = t2.updateQueue?.memoCache;
    if (n2 == null) return [];
    let r2 = n2.data[n2.index];
    return r2 === void 0 && (r2 = n2.data[n2.index] = Array.from({ length: e2 }, () => Le)), n2.index++, r2;
  };
  var at = (e2) => {
    let t2 = Y(), n2 = t2 === null ? e2 : t2.memoizedState;
    return Z2(`Optimistic`, n2, `Optimistic`), [n2, () => {
    }];
  };
  var ot = (e2, t2) => {
    let n2, r2 = null;
    if (e2 !== null) {
      let t3 = e2.memoizedState;
      if (typeof t3 == `object` && t3 && `then` in t3 && typeof t3.then == `function`) {
        let e3 = t3;
        switch (e3.status) {
          case `fulfilled`:
            n2 = e3.value;
            break;
          case `rejected`:
            r2 = e3.reason;
            break;
          default:
            r2 = q, n2 = e3;
        }
      } else n2 = t3;
    } else n2 = t2;
    return { value: n2, error: r2 };
  };
  var st = (e2) => (t2, n2) => {
    let r2 = Y();
    Y(), Y();
    let i3 = Error(), { value: a3, error: o3 } = ot(r2, n2);
    if (B2.push({ displayName: null, primitive: e2, stackError: i3, value: a3, dispatcherHookName: e2 }), o3 !== null) throw o3;
    return [a3, () => {
    }, false];
  };
  var ct = st(`ActionState`);
  var Q2 = { readContext: X, use: Ve, useCallback: Qe, useContext: He, useEffect: Ye, useImperativeHandle: Xe, useLayoutEffect: qe, useInsertionEffect: Je, useMemo: $e, useReducer: We, useRef: Ge, useState: Ue, useDebugValue: Ze, useDeferredValue: nt, useTransition: tt, useSyncExternalStore: et, useId: rt, useHostTransitionStatus: () => {
    let e2 = X({ _currentValue: null });
    return Z2(`HostTransitionStatus`, e2, `HostTransitionStatus`), e2;
  }, useFormState: st(`FormState`), useActionState: ct, useOptimistic: at, useMemoCache: it, useCacheRefresh: Ke, useEffectEvent: (e2) => (Y(), Z2(`EffectEvent`, e2, `EffectEvent`), e2) };
  var lt = typeof Proxy > `u` ? Q2 : new Proxy(Q2, { get(e2, t2) {
    if (Object.prototype.hasOwnProperty.call(e2, t2)) return e2[t2];
    let n2 = Error(`Missing method in Dispatcher: ` + t2);
    throw n2.name = `ReactDebugToolsUnsupportedHookError`, n2;
  } });

  // ../../node_modules/element-source/dist/index.js
  var SYMBOLICATION_TIMEOUT_MS = 5e3;
  var MAX_SOURCE_CONTEXT_WINDOW_CHARS = 4e3;
  var SOURCE_CONTEXT_HALF_WINDOW_CHARS = MAX_SOURCE_CONTEXT_WINDOW_CHARS / 2;
  var SOLID_HANDLER_SOURCE_LENGTH_MIN_CHARS = 3;
  var SVELTE_COLUMN_OFFSET = 1;
  var SOURCE_LINE_START_COLUMN = 1;
  var MIN_COMPONENT_NAME_LENGTH_CHARS = 1;
  var isElement = (node) => typeof Element !== "undefined" && node instanceof Element;
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
    cachedIsNextProject ?? (cachedIsNextProject = typeof document !== "undefined" && Boolean(document.getElementById("__NEXT_DATA__") || document.querySelector("nextjs-portal")));
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
    j(
      rootFiber,
      (currentFiber) => {
        if (!Se2(currentFiber)) return false;
        const ownerStack = I(currentFiber._debugStack.stack);
        if (!ownerStack) return false;
        for (const frame of m3(ownerStack)) {
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
    if (!Te()) return node;
    if (Z(node)) return node;
    if (isElement(node)) {
      let current = node.parentElement;
      while (current) {
        if (Z(current)) return current;
        current = current.parentElement;
      }
    }
    return node;
  };
  var stackCache = /* @__PURE__ */ new WeakMap();
  var fetchStackForNode = async (node) => {
    try {
      const fiber = Z(node);
      if (!fiber) return null;
      const frames = await L2(fiber);
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
    if (!Te()) return Promise.resolve([]);
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
      if (frame.fileName && Ne2(frame.fileName)) {
        return {
          filePath: Me2(frame.fileName),
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
    if (!Te()) return null;
    const stack = await getReactStack(node);
    if (stack) {
      for (const frame of stack) {
        if (frame.functionName && isSourceComponentName(frame.functionName)) {
          return frame.functionName;
        }
      }
    }
    const resolved = findNearestFiberNode(node);
    const fiber = Z(resolved);
    if (!fiber) return null;
    let current = fiber.return;
    while (current) {
      if (ve(current)) {
        const name = we(current.type);
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
  var isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
  var readString = (value) => typeof value === "string" ? value : null;
  var readNumber = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
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
  var getTagName = (node) => {
    if ("tagName" in node && typeof node.tagName === "string") return node.tagName.toLowerCase();
    if ("nodeName" in node && typeof node.nodeName === "string") return node.nodeName.toLowerCase();
    return "";
  };
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

  // src/content.ts
  async function getSvelteMetaFromPage(element) {
    return new Promise((resolve) => {
      const callbackId = `svelte-meta-${Date.now()}-${Math.random()}`;
      const elementId = `__opointer_${Date.now()}`;
      if (!element.id) {
        element.id = elementId;
      }
      const targetId = element.id;
      const handler = (event) => {
        if (event.data?.callbackId === callbackId) {
          window.removeEventListener("message", handler);
          if (element.id === elementId) {
            element.removeAttribute("id");
          }
          resolve(event.data.result);
        }
      };
      window.addEventListener("message", handler);
      const script = document.createElement("script");
      script.textContent = `
      (function() {
        var el = document.getElementById('${targetId}');
        if (!el) {
          window.postMessage({ callbackId: '${callbackId}', result: null }, '*');
          return;
        }
        var depth = 0;
        var current = el;
        while (current && depth < 20) {
          if ('__svelte_meta' in current) {
            window.postMessage({ callbackId: '${callbackId}', result: { meta: current.__svelte_meta, depth: depth } }, '*');
            return;
          }
          current = current.parentElement;
          depth++;
        }
        window.postMessage({ callbackId: '${callbackId}', result: null }, '*');
      })();
    `;
      document.head.appendChild(script);
      script.remove();
      setTimeout(() => {
        window.removeEventListener("message", handler);
        if (element.id === elementId) {
          element.removeAttribute("id");
        }
        resolve(null);
      }, 5e3);
    });
  }
  var isSelecting = false;
  var isChatOpen = false;
  var currentProjectDir = "";
  var selectionOverlay = null;
  var hoveredElement = null;
  var chatModal = null;
  var sessionId = null;
  var dropdownContainer = null;
  var currentDomContext = null;
  var currentTabId = null;
  var AVAILABLE_COMMANDS = [
    { id: "sessions", title: "/sessions", description: "Switch to a different session" },
    { id: "new", title: "/new", description: "Clear session and start fresh" }
  ];
  var OVERLAY_STYLES = `
  * { cursor: crosshair !important; }
  .opencode-selection-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    z-index: 2147483646 !important; pointer-events: none; background: transparent;
  }
  .opencode-element-outline {
    position: absolute; border: 2px solid #0066ff !important;
    background: rgba(0, 102, 255, 0.1) !important;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.5), 0 0 20px rgba(0, 102, 255, 0.3) !important;
    z-index: 2147483647 !important; pointer-events: none; border-radius: 2px;
    transition: all 0.1s ease;
  }
  .opencode-selection-cancel {
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8); color: white; padding: 12px 24px;
    border-radius: 8px; font-family: system-ui, sans-serif; font-size: 14px;
    z-index: 2147483647; pointer-events: none;
  }
  .opencode-element-info {
    position: absolute; top: -30px; left: 0; background: #0066ff; color: white;
    padding: 4px 8px; border-radius: 4px; font-family: monospace;
    font-size: 12px; white-space: nowrap; z-index: 2147483647; pointer-events: none;
  }
  .opencode-chat-terminal {
    position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important;
    background: #0d1117 !important; border-top: 1px solid #30363d !important;
    font-family: 'SF Mono', Monaco, 'Courier New', monospace !important;
    z-index: 2147483647 !important; box-sizing: border-box !important;
  }
  .opencode-chat-input-row {
    display: flex !important; align-items: center !important; gap: 12px !important;
    padding: 16px 20px !important;
  }
  .opencode-chat-prompt {
    color: #58a6ff !important; font-size: 16px !important; font-weight: bold !important;
    user-select: none !important;
  }
  .opencode-chat-textarea {
    flex: 1 !important; background: transparent !important; border: none !important;
    color: #c9d1d9 !important; font-size: 14px !important; resize: none !important;
    outline: none !important; padding: 0 !important; font-family: inherit !important;
    line-height: 1.5 !important;
  }
  .opencode-chat-textarea::placeholder {
    color: #484f58 !important;
  }
  .opencode-chat-hint {
    color: #484f58 !important; font-size: 11px !important; white-space: nowrap !important;
  }
  .opencode-chat-status {
    padding: 8px 20px !important; background: rgba(0,0,0,0.3) !important;
    color: #8b949e !important; font-size: 12px !important; border-top: 1px solid #21262d !important;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .opencode-chat-spinner {
    display: inline-block !important; width: 12px !important; height: 12px !important;
    border: 2px solid #484f58 !important; border-top-color: #58a6ff !important;
    border-radius: 50% !important; animation: spin 0.8s linear infinite !important;
    margin-right: 8px !important; vertical-align: middle !important;
  }
  .opencode-sessions-dropdown {
    position: fixed !important; top: 20px !important; right: 20px !important;
    background: #161b22 !important; border: 1px solid #30363d !important;
    border-radius: 6px !important; z-index: 2147483647 !important;
    max-height: 400px !important; overflow-y: auto !important;
    min-width: 300px !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
  }
  .opencode-session-item {
    padding: 12px 16px !important; cursor: pointer !important;
    border-bottom: 1px solid #21262d !important; color: #c9d1d9 !important;
    font-size: 12px !important; font-family: monospace !important;
  }
  .opencode-session-item:hover {
    background: #1f6feb !important;
  }
  .opencode-session-item:last-child {
    border-bottom: none !important;
  }
  .opencode-session-item-title {
    color: #58a6ff !important; margin-bottom: 4px !important;
  }
  .opencode-session-item-id {
    color: #484f58 !important; font-size: 10px !important;
  }
  .opencode-commands-dropdown {
    position: fixed; bottom: 80px; left: 20px;
    background: #0d1117; border: 1px solid #30363d;
    border-radius: 6px; z-index: 2147483647;
    max-height: 200px; overflow-y: auto;
    min-width: 250px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  }
  .opencode-command-item {
    padding: 8px 12px !important; cursor: pointer !important;
    border-bottom: 1px solid #21262d !important; color: #c9d1d9 !important;
    font-size: 12px !important; font-family: 'SF Mono', Monaco, 'Courier New', monospace !important;
  }
  .opencode-command-item:hover {
    background: #1f6feb !important;
  }
  .opencode-command-item:last-child {
    border-bottom: none !important;
  }
  .opencode-command-item-title {
    color: #58a6ff !important; margin-bottom: 2px !important;
  }
  .opencode-command-item-desc {
    color: #484f58 !important; font-size: 10px !important;
  }
`;
  function injectStyles() {
    console.log("[Content] injectStyles called");
    if (document.getElementById("opencode-selection-styles")) return;
    const style = document.createElement("style");
    style.id = "opencode-selection-styles";
    style.textContent = OVERLAY_STYLES;
    const target = document.head || document.documentElement;
    if (target) {
      target.appendChild(style);
    } else {
      document.appendChild(style);
    }
  }
  function createOverlay() {
    console.log("[Content] createOverlay called");
    if (selectionOverlay) return;
    selectionOverlay = document.createElement("div");
    selectionOverlay.className = "opencode-selection-overlay";
    document.body.appendChild(selectionOverlay);
  }
  function removeOverlay() {
    console.log("[Content] removeOverlay called");
    if (selectionOverlay) {
      selectionOverlay.remove();
      selectionOverlay = null;
    }
    document.querySelectorAll(".opencode-element-outline").forEach((el) => el.remove());
    document.querySelector(".opencode-selection-cancel")?.remove();
  }
  function removeChatModal() {
    console.log("[Content] removeChatModal called");
    if (chatModal) {
      chatModal.remove();
      chatModal = null;
    }
    if (dropdownContainer) {
      dropdownContainer.remove();
      dropdownContainer = null;
    }
    isChatOpen = false;
  }
  function removeDropdown() {
    console.log("[Content] removeDropdown called");
    if (dropdownContainer) {
      dropdownContainer.remove();
      dropdownContainer = null;
    }
  }
  function showCommandsDropdown(commands, textarea) {
    console.log("[Content] showCommandsDropdown called");
    removeDropdown();
    dropdownContainer = document.createElement("div");
    dropdownContainer.style.cssText = `
    width: 100% !important; max-height: 200px !important; overflow-y: auto !important;
    background: #0d1117 !important; border-top: 1px solid #30363d !important;
  `;
    const rect = textarea.getBoundingClientRect();
    dropdownContainer.style.left = `${rect.left}px`;
    dropdownContainer.style.bottom = `${window.innerHeight - rect.top}px`;
    commands.forEach((command) => {
      const item = document.createElement("div");
      item.style.cssText = `
      padding: 8px 12px !important; cursor: pointer !important;
      color: #c9d1d9 !important;
      font-size: 12px !important; font-family: 'SF Mono', Monaco, 'Courier New', monospace !important;
    `;
      item.innerHTML = `
      <span style="color: #58a6ff !important;">${command.title}</span>
      <span style="color: #484f58 !important; margin-left: 8px; font-size: 11px;">${command.description}</span>
    `;
      item.addEventListener("click", () => {
        executeCommand(command.id);
        removeDropdown();
      });
      item.addEventListener("mouseover", () => {
        item.style.background = "#21262d !important";
      });
      item.addEventListener("mouseout", () => {
        item.style.background = "transparent !important";
      });
      dropdownContainer.appendChild(item);
    });
    chatModal.insertBefore(dropdownContainer, chatModal.firstChild);
  }
  function executeCommand(commandId) {
    console.log("[Content] executeCommand called, id:", commandId);
    if (commandId === "sessions") {
      fetchSessionsList();
    } else if (commandId === "new") {
      sessionId = null;
      const hintEl = document.getElementById("opencode-hint");
      if (hintEl) {
        hintEl.textContent = "ESC to close";
      }
      if (currentTabId) {
        browser.runtime.sendMessage({
          type: "CLEAR_SESSION",
          tabId: currentTabId
        });
      }
    }
  }
  function cleanup() {
    console.log("[Content] cleanup called, isSelecting:", isSelecting, "isChatOpen:", isChatOpen);
    if (!isSelecting && !isChatOpen) return;
    isSelecting = false;
    isChatOpen = false;
    hoveredElement = null;
    document.removeEventListener("mouseover", handleMouseOver, true);
    document.removeEventListener("mouseout", handleMouseOut, true);
    document.removeEventListener("click", handleClick, true);
    document.removeEventListener("keydown", handleKeyDown, true);
    removeOverlay();
    removeChatModal();
    removeDropdown();
    const style = document.getElementById("opencode-selection-styles");
    if (style) style.remove();
  }
  function getElementXPath(element) {
    if (element.id) return `//*[@id="${element.id}"]`;
    const parts = [];
    let current = element;
    while (current && current !== document.body) {
      let index = 1;
      let sibling = current.previousElementSibling;
      while (sibling) {
        if (sibling.nodeName === current.nodeName) index++;
        sibling = sibling.previousElementSibling;
      }
      parts.unshift(`${current.tagName.toLowerCase()}[${index}]`);
      current = current.parentElement;
    }
    return `//${parts.join("/")}`;
  }
  async function captureDomContext(element) {
    const computed = window.getComputedStyle(element);
    const attributes = {};
    for (const attr of element.attributes) {
      if (!attr.name.startsWith("data-opencode")) {
        attributes[attr.name] = attr.value;
      }
    }
    const computedStyles = {};
    const styleProps = ["display", "position", "width", "height", "margin", "padding", "background", "color"];
    for (const prop of styleProps) {
      computedStyles[prop] = computed.getPropertyValue(prop);
    }
    const parentHierarchy = [];
    let parent = element.parentElement;
    while (parent && parent !== document.body) {
      parentHierarchy.push(parent.tagName.toLowerCase());
      parent = parent.parentElement;
    }
    const children = [];
    for (const child of element.children) {
      children.push(child.tagName.toLowerCase());
    }
    let sourceInfo = null;
    let componentStack = [];
    let resolved = false;
    try {
      const info = await resolveElementInfo(element);
      sourceInfo = info.source || null;
      componentStack = info.stack || [];
      resolved = true;
      if (!sourceInfo || sourceInfo.filePath === null) {
        const pageResult = await getSvelteMetaFromPage(element);
        if (pageResult && pageResult.meta && pageResult.meta.loc) {
          sourceInfo = {
            filePath: pageResult.meta.loc.file,
            lineNumber: pageResult.meta.loc.line,
            columnNumber: pageResult.meta.loc.column,
            componentName: null
          };
        }
      }
    } catch (error) {
      console.error("[Content] element-source error:", error);
    }
    return {
      tagName: element.tagName.toLowerCase(),
      attributes,
      textContent: element.textContent?.trim().slice(0, 200) || "",
      computedStyles,
      xPath: getElementXPath(element),
      parentHierarchy,
      children,
      sourceInfo,
      componentStack,
      resolved
    };
  }
  function showElementOutline(element, label) {
    document.querySelectorAll(".opencode-element-outline").forEach((el) => el.remove());
    const rect = element.getBoundingClientRect();
    const outline = document.createElement("div");
    outline.className = "opencode-element-outline";
    outline.style.top = `${rect.top + window.scrollY}px`;
    outline.style.left = `${rect.left + window.scrollX}px`;
    outline.style.width = `${rect.width}px`;
    outline.style.height = `${rect.height}px`;
    const info = document.createElement("div");
    info.className = "opencode-element-info";
    info.textContent = label || element.tagName.toLowerCase();
    outline.appendChild(info);
    document.body.appendChild(outline);
  }
  function getComponentLabel(sourceInfo) {
    if (!sourceInfo?.filePath) return void 0;
    const fileName = sourceInfo.filePath.split("/").pop() || "";
    const line = sourceInfo.lineNumber ?? "";
    return line ? `${fileName}:${line}` : fileName;
  }
  function showCancelHint() {
    console.log("[Content] showCancelHint called");
    if (document.querySelector(".opencode-selection-cancel")) return;
    const hint = document.createElement("div");
    hint.className = "opencode-selection-cancel";
    hint.textContent = "Press ESC to cancel";
    document.body.appendChild(hint);
  }
  function fetchSessionsList() {
    console.log("[Content] fetchSessionsList called, currentProjectDir:", currentProjectDir);
    removeDropdown();
    getCurrentTabId().then((tabId) => {
      console.log("[Content] fetchSessionsList - tabId from query:", tabId);
      console.log("[Content] Sending GET_SESSIONS with tabId:", tabId);
      browser.runtime.sendMessage({
        type: "GET_SESSIONS",
        tabId,
        projectDirectory: currentProjectDir
      }).then((response) => {
        console.log("[Content] GET_SESSIONS response:", response);
      }).catch((err) => {
        console.error("[Content] GET_SESSIONS error:", err);
      });
    }).catch((err) => {
      console.error("[Content] fetchSessionsList error:", err);
    });
  }
  function showSessionsDropdown(sessions) {
    console.log("[Content] showSessionsDropdown called with sessions:", sessions);
    removeDropdown();
    console.log("[Content] Creating sessions dropdown");
    dropdownContainer = document.createElement("div");
    dropdownContainer.style.cssText = `
    width: 100% !important; max-height: 300px !important; overflow-y: auto !important;
    background: #0d1117 !important; border-top: 1px solid #30363d !important;
  `;
    const header = document.createElement("div");
    header.style.cssText = "padding: 10px 14px; border-bottom: 1px solid #30363d; color: #8b949e; font-size: 11px; font-family: 'SF Mono', Monaco, 'Courier New', monospace;";
    header.textContent = `Select Session (${sessions.length} available)`;
    dropdownContainer.appendChild(header);
    console.log("[Content] Sessions count:", sessions.length);
    sessions.forEach((session) => {
      console.log("[Content] Adding session item:", session.title, session.truncatedId);
      const item = document.createElement("div");
      item.style.cssText = `
      padding: 10px 14px !important; cursor: pointer !important;
      border-bottom: 1px solid #21262d !important;
      color: #c9d1d9 !important;
      font-size: 12px !important; font-family: 'SF Mono', Monaco, 'Courier New', monospace !important;
    `;
      item.innerHTML = `
      <div style="color: #58a6ff !important; margin-bottom: 4px !important;">${session.title || "Untitled"}</div>
      <div style="color: #484f58 !important; font-size: 10px !important;">${session.truncatedId} - ${new Date(session.createdAt).toLocaleDateString()}</div>
    `;
      item.addEventListener("click", () => {
        console.log("[Content] Session selected:", session.id);
        sessionId = session.id;
        if (currentTabId) {
          browser.runtime.sendMessage({
            type: "STORE_SESSION",
            tabId: currentTabId,
            sessionId: session.id
          });
        }
        removeDropdown();
      });
      item.addEventListener("mouseover", () => {
        item.style.background = "#21262d !important";
      });
      item.addEventListener("mouseout", () => {
        item.style.background = "transparent !important";
      });
      dropdownContainer.appendChild(item);
    });
    chatModal.insertBefore(dropdownContainer, chatModal.firstChild);
    console.log("[Content] Sessions dropdown appended to chatModal");
  }
  function showChatModal(domContext, projectDirectory, pageTitle, pageUrl) {
    console.log("[Content] showChatModal called, sessionId:", sessionId);
    cleanup();
    isChatOpen = true;
    currentDomContext = domContext;
    chatModal = document.createElement("div");
    chatModal.style.cssText = `
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    background: #0d1117 !important;
    border-top: 1px solid #30363d !important;
    font-family: 'SF Mono', Monaco, 'Courier New', monospace !important;
    z-index: 2147483647 !important;
    box-sizing: border-box !important;
  `;
    const inputRow = document.createElement("div");
    inputRow.style.cssText = `
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    padding: 16px 20px !important;
  `;
    const prompt = document.createElement("span");
    prompt.style.cssText = `
    color: #58a6ff !important;
    font-size: 16px !important;
    font-weight: bold !important;
    user-select: none !important;
  `;
    prompt.textContent = "\u203A";
    const textarea = document.createElement("textarea");
    textarea.className = "opencode-chat-textarea";
    textarea.style.cssText = `
    flex: 1 !important;
    background: transparent !important;
    border: none !important;
    color: #c9d1d9 !important;
    font-size: 14px !important;
    resize: none !important;
    outline: none !important;
    padding: 0 !important;
    font-family: inherit !important;
    line-height: 1.5 !important;
  `;
    textarea.placeholder = "Describe the change you want to make...";
    textarea.rows = 1;
    const hint = document.createElement("span");
    hint.style.cssText = `
    color: #484f58 !important;
    font-size: 11px !important;
    white-space: nowrap !important;
  `;
    hint.textContent = sessionId ? sessionId.substring(0, 8) : "ESC to close";
    hint.id = "opencode-hint";
    const statusEl = document.createElement("div");
    statusEl.style.cssText = `
    padding: 8px 20px !important;
    background: rgba(0,0,0,0.3) !important;
    color: #8b949e !important;
    font-size: 12px !important;
    border-top: 1px solid #21262d !important;
    display: none !important;
  `;
    statusEl.id = "opencode-status";
    inputRow.appendChild(prompt);
    inputRow.appendChild(textarea);
    inputRow.appendChild(hint);
    chatModal.appendChild(inputRow);
    chatModal.appendChild(statusEl);
    document.body.appendChild(chatModal);
    console.log("[Content] Chat modal appended to body");
    const sendPrompt = () => {
      const promptText = textarea.value.trim();
      console.log("[Content] sendPrompt called, promptText:", promptText);
      if (!promptText) {
        console.log("[Content] Empty prompt, returning");
        return;
      }
      console.log("[Content] Checking for /sessions command, startsWith:", promptText.startsWith("/sessions"));
      if (promptText.startsWith("/sessions")) {
        console.log("[Content] Detected /sessions command, calling fetchSessionsList");
        fetchSessionsList();
        return;
      }
      if (promptText.startsWith("/new")) {
        console.log("[Content] Detected /new command, clearing sessionId");
        sessionId = null;
        hint.textContent = "ESC to close";
        const hintEl = document.getElementById("opencode-hint");
        if (hintEl) {
          hintEl.textContent = "ESC to close";
        }
        if (currentTabId) {
          browser.runtime.sendMessage({
            type: "CLEAR_SESSION",
            tabId: currentTabId
          });
        }
        textarea.value = "";
        return;
      }
      console.log("[Content] Sending prompt to background");
      textarea.disabled = true;
      statusEl.style.display = "block";
      statusEl.innerHTML = '<span style="display:inline-block;width:12px;height:12px;border:2px solid #484f58;border-top-color:#58a6ff;border-radius:50%;animation:spin .8s linear infinite;margin-right:8px;vertical-align:middle;"></span><span>Sending request...</span>';
      try {
        browser.runtime.sendMessage({
          type: "SEND_PROMPT",
          tabId: currentTabId,
          projectDirectory,
          domContext: currentDomContext,
          userPrompt: promptText,
          pageTitle,
          pageUrl,
          sessionId
        });
        statusEl.innerHTML = '<span style="display:inline-block;width:12px;height:12px;border:2px solid #484f58;border-top-color:#58a6ff;border-radius:50%;animation:spin .8s linear infinite;margin-right:8px;vertical-align:middle;"></span><span>Sent! Check OpenCode for progress...</span>';
        textarea.value = "";
        setTimeout(cleanup, 1500);
      } catch (error) {
        statusEl.innerHTML = `<span>Error: ${error}</span>`;
        textarea.disabled = false;
      }
    };
    textarea.addEventListener("keydown", (e2) => {
      console.log("[Content] textarea keydown, key:", e2.key);
      if (e2.key === "Enter" && !e2.shiftKey) {
        console.log("[Content] Enter pressed (no shift), calling sendPrompt");
        e2.preventDefault();
        sendPrompt();
      }
    });
    textarea.addEventListener("input", () => {
      console.log("[Content] input event, value:", textarea.value);
      const value = textarea.value;
      if (value === "/") {
        console.log("[Content] showing commands dropdown");
        showCommandsDropdown(AVAILABLE_COMMANDS, textarea);
      } else if (value.startsWith("/")) {
        const filtered = AVAILABLE_COMMANDS.filter(
          (c3) => c3.title.toLowerCase().includes(value.toLowerCase())
        );
        if (filtered.length > 0) {
          showCommandsDropdown(filtered, textarea);
        } else {
          removeDropdown();
        }
      } else {
        removeDropdown();
      }
    });
    const handleEsc = (e2) => {
      console.log("[Content] ESC key handler, key:", e2.key);
      if (e2.key === "Escape") {
        document.removeEventListener("keydown", handleEsc, true);
        cleanup();
      }
    };
    document.addEventListener("keydown", handleEsc, true);
    setTimeout(() => textarea.focus(), 50);
  }
  function startSelection(projectDirectory, existingSessionId) {
    console.log("[Content] startSelection called, projectDir:", projectDirectory, "existingSessionId:", existingSessionId);
    if (isSelecting || isChatOpen) return;
    isSelecting = true;
    currentProjectDir = projectDirectory;
    if (existingSessionId) {
      console.log("[Content] Setting sessionId to:", existingSessionId);
      sessionId = existingSessionId;
    }
    injectStyles();
    createOverlay();
    showCancelHint();
    document.addEventListener("mouseover", handleMouseOver, true);
    document.addEventListener("mouseout", handleMouseOut, true);
    document.addEventListener("click", handleClick, true);
    document.addEventListener("keydown", handleKeyDown, true);
  }
  function handleMouseOver(e2) {
    if (!isSelecting) return;
    const target = e2.target;
    if (target === selectionOverlay || target.classList.contains("opencode-element-outline")) return;
    hoveredElement = target;
    showElementOutline(target);
  }
  function handleMouseOut() {
    hoveredElement = null;
  }
  async function handleClick(e2) {
    e2.preventDefault();
    e2.stopPropagation();
    if (!isSelecting || isChatOpen) return;
    const clickedElement = e2.target;
    if (!clickedElement) return;
    const domContext = await captureDomContext(clickedElement);
    const componentLabel = getComponentLabel(domContext.sourceInfo);
    if (componentLabel) {
      showElementOutline(clickedElement, componentLabel);
    }
    showChatModal(domContext, currentProjectDir, document.title, window.location.href);
  }
  function handleKeyDown(e2) {
    console.log("[Content] handleKeyDown, key:", e2.key);
    if (e2.key === "Escape") {
      cleanup();
    }
  }
  console.log("[Content] Script loaded, setting up message listener");
  async function getCurrentTabId() {
    console.log("[Content] getCurrentTabId - trying browser.runtime");
    try {
      const response = await browser.runtime.sendMessage({ type: "GET_CURRENT_TAB_ID" });
      console.log("[Content] GET_CURRENT_TAB_ID response:", response);
      return response?.tabId ?? null;
    } catch (err) {
      console.error("[Content] getCurrentTabId error:", err);
      return null;
    }
  }
  browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log("[Content] Message received, type:", message.type);
    if (message.type === "START_SELECTION") {
      console.log("[Content] START_SELECTION handler");
      const selectionMsg = message;
      if (selectionMsg.tabId) {
        currentTabId = selectionMsg.tabId;
        console.log("[Content] START_SELECTION, using tabId from message:", currentTabId);
      } else {
        console.log("[Content] START_SELECTION, no tabId in message, querying...");
        currentTabId = await getCurrentTabId();
        console.log("[Content] START_SELECTION, tabId from query:", currentTabId);
      }
      startSelection(selectionMsg.projectDirectory, selectionMsg.sessionId);
      sendResponse({ success: true });
      return true;
    }
    if (message.type === "CONFIG_REQUIRED") {
      alert(message.message);
      sendResponse({ received: true });
      return true;
    }
    if (message.type === "SESSIONS_LIST") {
      console.log("[Content] SESSIONS_LIST received, sessions:", message.sessions);
      const sessionsMsg = message;
      if (sessionsMsg.sessions && sessionsMsg.sessions.length > 0) {
        console.log("[Content] Calling showSessionsDropdown with", sessionsMsg.sessions.length, "sessions");
        showSessionsDropdown(sessionsMsg.sessions);
      } else {
        console.log("[Content] SESSIONS_LIST received but no sessions or empty sessions array");
      }
      sendResponse({ received: true });
      return true;
    }
    if (message.type === "SESSION_CREATED") {
      console.log("[Content] SESSION_CREATED received, sessionId:", message.sessionId);
      const sessionMsg = message;
      if (sessionMsg.sessionId) {
        sessionId = sessionMsg.sessionId;
        console.log("[Content] sessionId updated to:", sessionId);
        if (currentTabId) {
          browser.runtime.sendMessage({
            type: "STORE_SESSION",
            tabId: currentTabId,
            sessionId: sessionMsg.sessionId
          });
        }
        const hintEl = document.getElementById("opencode-hint");
        if (hintEl) {
          hintEl.textContent = sessionId.substring(0, 8);
        }
      }
      sendResponse({ received: true });
      return true;
    }
    if (message.type === "PROJECT_CHANGED") {
      console.log("[Content] PROJECT_CHANGED received, new project:", message.projectDirectory);
      const projMsg = message;
      if (projMsg.projectDirectory) {
        currentProjectDir = projMsg.projectDirectory;
        console.log("[Content] currentProjectDir updated to:", currentProjectDir);
      }
      sendResponse({ received: true });
      return true;
    }
    return false;
  });
})();
/*! Bundled license information:

bippy/dist/rdt-hook.js:
bippy/dist/install-hook-only.js:
bippy/dist/core.js:
bippy/dist/index.js:
bippy/dist/source.js:
  (**
   * @license bippy
   *
   * Copyright (c) Aiden Bai
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
