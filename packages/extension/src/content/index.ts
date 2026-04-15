interface DomContext {
  tagName: string
  attributes: Record<string, string>
  textContent: string
  computedStyles: Record<string, string>
  xPath: string
  parentHierarchy: string[]
  children: string[]
}

interface SelectionMessage {
  type: "START_SELECTION"
  projectDirectory: string
}

interface DomSelectedMessage {
  type: "DOM_SELECTED"
  projectDirectory: string
  domContext: DomContext
  pageTitle: string
  pageUrl: string
}

let isSelecting = false
let currentProjectDir = ""
let selectionOverlay: HTMLDivElement | null = null
let hoveredElement: HTMLElement | null = null
let selectedElement: HTMLElement | null = null

const OVERLAY_STYLES = `
  * {
    cursor: crosshair !important;
  }
  .opencode-selection-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2147483646 !important;
    pointer-events: none;
    background: transparent;
  }
  .opencode-element-outline {
    position: absolute;
    border: 2px solid #0066ff !important;
    background: rgba(0, 102, 255, 0.1) !important;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.5), 0 0 20px rgba(0, 102, 255, 0.3) !important;
    z-index: 2147483647 !important;
    pointer-events: none;
    border-radius: 2px;
    transition: all 0.1s ease;
  }
  .opencode-selection-cancel {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    z-index: 2147483647;
    pointer-events: none;
  }
  .opencode-element-info {
    position: absolute;
    top: -30px;
    left: 0;
    background: #0066ff;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    white-space: nowrap;
    z-index: 2147483647;
    pointer-events: none;
  }
`

function injectStyles(): void {
  if (document.getElementById("opencode-selection-styles")) return
  
  const style = document.createElement("style")
  style.id = "opencode-selection-styles"
  style.textContent = OVERLAY_STYLES
  document.head.appendChild(style)
}

function createOverlay(): void {
  if (selectionOverlay) return
  
  selectionOverlay = document.createElement("div")
  selectionOverlay.className = "opencode-selection-overlay"
  selectionOverlay.dataset.opencodeOverlay = "true"
  document.body.appendChild(selectionOverlay)
}

function removeOverlay(): void {
  if (selectionOverlay) {
    selectionOverlay.remove()
    selectionOverlay = null
  }
  document.querySelectorAll(".opencode-element-outline").forEach(el => el.remove())
  document.querySelector(".opencode-selection-cancel")?.remove()
}

function getElementXPath(element: Element): string {
  if (element.id) return `//*[@id="${element.id}"]`
  
  const parts: string[] = []
  let current: Element | null = element
  
  while (current && current !== document.body) {
    let index = 1
    let sibling = current.previousElementSibling
    
    while (sibling) {
      if (sibling.nodeName === current.nodeName) index++
      sibling = sibling.previousElementSibling
    }
    
    const tagName = current.tagName.toLowerCase()
    parts.unshift(`${tagName}[${index}]`)
    current = current.parentElement
  }
  
  return `//${parts.join("/")}`
}

function captureDomContext(element: HTMLElement): DomContext {
  const computed = window.getComputedStyle(element)
  
  const attributes: Record<string, string> = {}
  for (const attr of element.attributes) {
    if (!attr.name.startsWith("data-opencode")) {
      attributes[attr.name] = attr.value
    }
  }
  
  const textContent = element.textContent?.trim().slice(0, 200) || ""
  
  const computedStyles: Record<string, string> = {}
  const styleProps = [
    "display", "position", "top", "left", "right", "bottom",
    "width", "height", "margin", "padding", "border",
    "background", "color", "font", "flex", "grid"
  ]
  
  for (const prop of styleProps) {
    computedStyles[prop] = computed.getPropertyValue(prop)
  }
  
  const parentHierarchy: string[] = []
  let parent = element.parentElement
  while (parent && parent !== document.body) {
    parentHierarchy.push(parent.tagName.toLowerCase())
    parent = parent.parentElement
  }
  
  const children: string[] = []
  for (const child of element.children) {
    children.push(child.tagName.toLowerCase())
  }
  
  return {
    tagName: element.tagName.toLowerCase(),
    attributes,
    textContent,
    computedStyles,
    xPath: getElementXPath(element),
    parentHierarchy,
    children
  }
}

function showElementOutline(element: HTMLElement): void {
  document.querySelectorAll(".opencode-element-outline").forEach(el => el.remove())
  
  const rect = element.getBoundingClientRect()
  const outline = document.createElement("div")
  outline.className = "opencode-element-outline"
  outline.style.top = `${rect.top + window.scrollY}px`
  outline.style.left = `${rect.left + window.scrollX}px`
  outline.style.width = `${rect.width}px`
  outline.style.height = `${rect.height}px`
  
  const info = document.createElement("div")
  info.className = "opencode-element-info"
  info.textContent = element.tagName.toLowerCase()
  outline.appendChild(info)
  
  document.body.appendChild(outline)
}

function showCancelHint(): void {
  const existing = document.querySelector(".opencode-selection-cancel")
  if (existing) return
  
  const hint = document.createElement("div")
  hint.className = "opencode-selection-cancel"
  hint.textContent = "Press ESC to cancel"
  document.body.appendChild(hint)
}

function startSelection(projectDirectory: string): void {
  isSelecting = true
  currentProjectDir = projectDirectory
  
  injectStyles()
  createOverlay()
  showCancelHint()
  
  document.addEventListener("mouseover", handleMouseOver)
  document.addEventListener("mouseout", handleMouseOut)
  document.addEventListener("click", handleClick, true)
  document.addEventListener("keydown", handleKeyDown)
}

function stopSelection(): void {
  isSelecting = false
  currentProjectDir = ""
  hoveredElement = null
  selectedElement = null
  
  document.removeEventListener("mouseover", handleMouseOver)
  document.removeEventListener("mouseout", handleMouseOut)
  document.removeEventListener("click", handleClick, true)
  document.removeEventListener("keydown", handleKeyDown)
  
  removeOverlay()
}

function handleMouseOver(e: MouseEvent): void {
  if (!isSelecting) return
  
  const target = e.target as HTMLElement
  if (target === selectionOverlay || target === document.querySelector(".opencode-element-outline")) return
  
  hoveredElement = target
  showElementOutline(target)
}

function handleMouseOut(): void {
  hoveredElement = null
}

function handleClick(e: MouseEvent): void {
  e.preventDefault()
  e.stopPropagation()
  
  if (!isSelecting || !hoveredElement) return
  
  selectedElement = hoveredElement
  const domContext = captureDomContext(selectedElement)
  
  browser.runtime.sendMessage({
    type: "DOM_SELECTED",
    projectDirectory: currentProjectDir,
    domContext,
    pageTitle: document.title,
    pageUrl: window.location.href
  } as DomSelectedMessage)
  
  stopSelection()
}

function handleKeyDown(e: KeyboardEvent): void {
  if (e.key === "Escape") {
    stopSelection()
    
    browser.runtime.sendMessage({
      type: "SELECTION_CANCELLED",
      message: "Element selection was cancelled"
    })
  }
}

browser.runtime.onMessage.addListener((message: SelectionMessage | { type: string }, sender, sendResponse) => {
  if (message.type === "START_SELECTION") {
    const selectionMsg = message as SelectionMessage
    startSelection(selectionMsg.projectDirectory)
    sendResponse({ success: true })
    return true
  }
  
  if (message.type === "CONFIG_REQUIRED") {
    alert((message as { message: string }).message)
    sendResponse({ received: true })
    return true
  }
  
  return false
})

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isSelecting) {
    stopSelection()
  }
}, true)
