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
  sessionId?: string
}

interface SessionInfo {
  id: string
  title: string
  createdAt: string
  truncatedId: string
}

let isSelecting = false
let isChatOpen = false
let currentProjectDir = ""
let selectionOverlay: HTMLDivElement | null = null
let hoveredElement: HTMLElement | null = null
let chatModal: HTMLDivElement | null = null
let sessionId: string | null = null
let sessionsDropdown: HTMLDivElement | null = null
let currentDomContext: DomContext | null = null
let currentTabId: number | null = null

const OVERLAY_STYLES = `
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
`

function injectStyles(): void {
  console.log("[Content] injectStyles called")
  if (document.getElementById("opencode-selection-styles")) return
  const style = document.createElement("style")
  style.id = "opencode-selection-styles"
  style.textContent = OVERLAY_STYLES
  const target = document.head || document.documentElement
  if (target) {
    target.appendChild(style)
  } else {
    document.appendChild(style)
  }
}

function createOverlay(): void {
  console.log("[Content] createOverlay called")
  if (selectionOverlay) return
  selectionOverlay = document.createElement("div")
  selectionOverlay.className = "opencode-selection-overlay"
  document.body.appendChild(selectionOverlay)
}

function removeOverlay(): void {
  console.log("[Content] removeOverlay called")
  if (selectionOverlay) { selectionOverlay.remove(); selectionOverlay = null }
  document.querySelectorAll(".opencode-element-outline").forEach(el => el.remove())
  document.querySelector(".opencode-selection-cancel")?.remove()
}

function removeChatModal(): void {
  console.log("[Content] removeChatModal called")
  if (chatModal) { chatModal.remove(); chatModal = null }
  if (sessionsDropdown) { sessionsDropdown.remove(); sessionsDropdown = null }
  isChatOpen = false
}

function removeSessionsDropdown(): void {
  console.log("[Content] removeSessionsDropdown called")
  if (sessionsDropdown) { sessionsDropdown.remove(); sessionsDropdown = null }
}

function cleanup(): void {
  console.log("[Content] cleanup called, isSelecting:", isSelecting, "isChatOpen:", isChatOpen)
  if (!isSelecting && !isChatOpen) return
  
  isSelecting = false
  isChatOpen = false
  hoveredElement = null
  
  document.removeEventListener("mouseover", handleMouseOver, true)
  document.removeEventListener("mouseout", handleMouseOut, true)
  document.removeEventListener("click", handleClick, true)
  document.removeEventListener("keydown", handleKeyDown, true)
  
  removeOverlay()
  removeChatModal()
  
  const style = document.getElementById("opencode-selection-styles")
  if (style) style.remove()
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
    parts.unshift(`${current.tagName.toLowerCase()}[${index}]`)
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
  const computedStyles: Record<string, string> = {}
  const styleProps = ["display", "position", "width", "height", "margin", "padding", "background", "color"]
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
    textContent: element.textContent?.trim().slice(0, 200) || "",
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
  console.log("[Content] showCancelHint called")
  if (document.querySelector(".opencode-selection-cancel")) return
  const hint = document.createElement("div")
  hint.className = "opencode-selection-cancel"
  hint.textContent = "Press ESC to cancel"
  document.body.appendChild(hint)
}

function fetchSessionsList(): void {
  console.log("[Content] fetchSessionsList called, currentProjectDir:", currentProjectDir)
  removeSessionsDropdown()
  
  getCurrentTabId().then(tabId => {
    console.log("[Content] fetchSessionsList - tabId from query:", tabId)
    console.log("[Content] Sending GET_SESSIONS with tabId:", tabId)
    browser.runtime.sendMessage({
      type: "GET_SESSIONS",
      tabId,
      projectDirectory: currentProjectDir
    }).then(response => {
      console.log("[Content] GET_SESSIONS response:", response)
    }).catch(err => {
      console.error("[Content] GET_SESSIONS error:", err)
    })
  }).catch(err => {
    console.error("[Content] fetchSessionsList error:", err)
  })
}

function showSessionsDropdown(sessions: SessionInfo[]): void {
  console.log("[Content] showSessionsDropdown called with sessions:", sessions)
  removeSessionsDropdown()
  
  console.log("[Content] Creating sessions dropdown")
  sessionsDropdown = document.createElement("div")
  sessionsDropdown.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    background: #161b22 !important;
    border: 1px solid #30363d !important;
    border-radius: 6px !important;
    z-index: 2147483647 !important;
    max-height: 400px !important;
    overflow-y: auto !important;
    min-width: 300px !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
  `
  
  const header = document.createElement("div")
  header.style.cssText = "padding: 10px 14px; border-bottom: 1px solid #30363d; color: #8b949e; font-size: 11px; font-family: monospace;"
  header.textContent = `Select Session (${sessions.length} available)`
  sessionsDropdown.appendChild(header)
  
  console.log("[Content] Sessions count:", sessions.length)
  sessions.forEach(session => {
    console.log("[Content] Adding session item:", session.title, session.truncatedId)
    const item = document.createElement("div")
    item.style.cssText = `
      padding: 12px 16px !important;
      cursor: pointer !important;
      border-bottom: 1px solid #21262d !important;
      color: #c9d1d9 !important;
      font-size: 12px !important;
      font-family: monospace !important;
    `
    item.innerHTML = `
      <div style="color: #58a6ff !important; margin-bottom: 4px !important;">${session.title || "Untitled"}</div>
      <div style="color: #484f58 !important; font-size: 10px !important;">${session.truncatedId} - ${new Date(session.createdAt).toLocaleDateString()}</div>
    `
    item.addEventListener("click", () => {
      console.log("[Content] Session selected:", session.id)
      sessionId = session.id
      if (currentTabId) {
        browser.runtime.sendMessage({
          type: "STORE_SESSION",
          tabId: currentTabId,
          sessionId: session.id
        })
      }
      removeSessionsDropdown()
    })
    item.addEventListener("mouseover", () => {
      item.style.background = "#1f6feb !important"
    })
    item.addEventListener("mouseout", () => {
      item.style.background = "transparent !important"
    })
    sessionsDropdown!.appendChild(item)
  })
  
  document.body.appendChild(sessionsDropdown)
  console.log("[Content] Sessions dropdown appended to body")
  
  document.addEventListener("click", handleOutsideClick, true)
}

function handleOutsideClick(e: MouseEvent): void {
  console.log("[Content] handleOutsideClick called, target:", e.target)
  if (sessionsDropdown && !sessionsDropdown.contains(e.target as Node)) {
    console.log("[Content] Click outside dropdown, removing")
    removeSessionsDropdown()
    document.removeEventListener("click", handleOutsideClick, true)
  }
}

function showChatModal(domContext: DomContext, projectDirectory: string, pageTitle: string, pageUrl: string): void {
  console.log("[Content] showChatModal called, sessionId:", sessionId)
  cleanup()
  isChatOpen = true
  currentDomContext = domContext

  chatModal = document.createElement("div")
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
  `

  const inputRow = document.createElement("div")
  inputRow.style.cssText = `
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    padding: 16px 20px !important;
  `

  const prompt = document.createElement("span")
  prompt.style.cssText = `
    color: #58a6ff !important;
    font-size: 16px !important;
    font-weight: bold !important;
    user-select: none !important;
  `
  prompt.textContent = "›"

  const textarea = document.createElement("textarea")
  textarea.className = "opencode-chat-textarea"
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
  `
  textarea.placeholder = "Describe the change you want to make..."
  textarea.rows = 1

  const hint = document.createElement("span")
  hint.style.cssText = `
    color: #484f58 !important;
    font-size: 11px !important;
    white-space: nowrap !important;
  `
  hint.textContent = sessionId ? sessionId.substring(0, 8) : "ESC to close"
  hint.id = "opencode-hint"

  const statusEl = document.createElement("div")
  statusEl.style.cssText = `
    padding: 8px 20px !important;
    background: rgba(0,0,0,0.3) !important;
    color: #8b949e !important;
    font-size: 12px !important;
    border-top: 1px solid #21262d !important;
    display: none !important;
  `
  statusEl.id = "opencode-status"

  inputRow.appendChild(prompt)
  inputRow.appendChild(textarea)
  inputRow.appendChild(hint)

  chatModal.appendChild(inputRow)
  chatModal.appendChild(statusEl)
  document.body.appendChild(chatModal)
  console.log("[Content] Chat modal appended to body")

  const sendPrompt = () => {
    const promptText = textarea.value.trim()
    console.log("[Content] sendPrompt called, promptText:", promptText)
    if (!promptText) {
      console.log("[Content] Empty prompt, returning")
      return
    }

    console.log("[Content] Checking for /sessions command, startsWith:", promptText.startsWith("/sessions"))
    if (promptText.startsWith("/sessions")) {
      console.log("[Content] Detected /sessions command, calling fetchSessionsList")
      fetchSessionsList()
      return
    }

    if (promptText.startsWith("/new")) {
      console.log("[Content] Detected /new command, clearing sessionId")
      sessionId = null
      hint.textContent = "ESC to close"
      const hintEl = document.getElementById("opencode-hint")
      if (hintEl) {
        hintEl.textContent = "ESC to close"
      }
      if (currentTabId) {
        browser.runtime.sendMessage({
          type: "CLEAR_SESSION",
          tabId: currentTabId
        })
      }
      textarea.value = ""
      return
    }

    console.log("[Content] Sending prompt to background")
    textarea.disabled = true
    statusEl.style.display = "block"
    statusEl.innerHTML = '<span style="display:inline-block;width:12px;height:12px;border:2px solid #484f58;border-top-color:#58a6ff;border-radius:50%;animation:spin .8s linear infinite;margin-right:8px;vertical-align:middle;"></span><span>Sending request...</span>'

    try {
      browser.runtime.sendMessage({
        type: "SEND_PROMPT",
        tabId: currentTabId,
        projectDirectory,
        domContext: currentDomContext!,
        userPrompt: promptText,
        pageTitle,
        pageUrl,
        sessionId
      })
      statusEl.innerHTML = '<span style="display:inline-block;width:12px;height:12px;border:2px solid #484f58;border-top-color:#58a6ff;border-radius:50%;animation:spin .8s linear infinite;margin-right:8px;vertical-align:middle;"></span><span>Sent! Check OpenCode for progress...</span>'
      textarea.value = ""
      setTimeout(cleanup, 1500)
    } catch (error) {
      statusEl.innerHTML = `<span>Error: ${error}</span>`
      textarea.disabled = false
    }
  }

  textarea.addEventListener("keydown", (e) => {
    console.log("[Content] textarea keydown, key:", e.key)
    if (e.key === "Enter" && !e.shiftKey) {
      console.log("[Content] Enter pressed (no shift), calling sendPrompt")
      e.preventDefault()
      sendPrompt()
    }
  })

  const handleEsc = (e: KeyboardEvent) => {
    console.log("[Content] ESC key handler, key:", e.key)
    if (e.key === "Escape") {
      document.removeEventListener("keydown", handleEsc, true)
      cleanup()
    }
  }
  document.addEventListener("keydown", handleEsc, true)

  setTimeout(() => textarea.focus(), 50)
}

function startSelection(projectDirectory: string, existingSessionId?: string): void {
  console.log("[Content] startSelection called, projectDir:", projectDirectory, "existingSessionId:", existingSessionId)
  if (isSelecting || isChatOpen) return
  
  isSelecting = true
  currentProjectDir = projectDirectory
  if (existingSessionId) {
    console.log("[Content] Setting sessionId to:", existingSessionId)
    sessionId = existingSessionId
  }
  injectStyles()
  createOverlay()
  showCancelHint()
  
  document.addEventListener("mouseover", handleMouseOver, true)
  document.addEventListener("mouseout", handleMouseOut, true)
  document.addEventListener("click", handleClick, true)
  document.addEventListener("keydown", handleKeyDown, true)
}

function handleMouseOver(e: MouseEvent): void {
  if (!isSelecting) return
  const target = e.target as HTMLElement
  if (target === selectionOverlay || target.classList.contains("opencode-element-outline")) return
  hoveredElement = target
  showElementOutline(target)
}

function handleMouseOut(): void {
  hoveredElement = null
}

function handleClick(e: MouseEvent): void {
  console.log("[Content] handleClick called")
  e.preventDefault()
  e.stopPropagation()
  
  if (!isSelecting || !hoveredElement || isChatOpen) return
  
  const domContext = captureDomContext(hoveredElement)
  showChatModal(domContext, currentProjectDir, document.title, window.location.href)
}

function handleKeyDown(e: KeyboardEvent): void {
  console.log("[Content] handleKeyDown, key:", e.key)
  if (e.key === "Escape") {
    cleanup()
  }
}

console.log("[Content] Script loaded, setting up message listener")

async function getCurrentTabId(): Promise<number | null> {
  console.log("[Content] getCurrentTabId - trying browser.runtime")
  try {
    const response = await browser.runtime.sendMessage({ type: "GET_CURRENT_TAB_ID" })
    console.log("[Content] GET_CURRENT_TAB_ID response:", response)
    return response?.tabId ?? null
  } catch (err) {
    console.error("[Content] getCurrentTabId error:", err)
    return null
  }
}

async function getTabIdForMessage(): Promise<number | null> {
  return getCurrentTabId()
}

browser.runtime.onMessage.addListener(async (message: SelectionMessage | { type: string; sessions?: SessionInfo[]; sessionId?: string }, sender, sendResponse) => {
  console.log("[Content] Message received, type:", message.type)
  
  if (message.type === "START_SELECTION") {
    console.log("[Content] START_SELECTION handler")
    const selectionMsg = message as SelectionMessage & { tabId?: number }
    
    if (selectionMsg.tabId) {
      currentTabId = selectionMsg.tabId
      console.log("[Content] START_SELECTION, using tabId from message:", currentTabId)
    } else {
      console.log("[Content] START_SELECTION, no tabId in message, querying...")
      currentTabId = await getCurrentTabId()
      console.log("[Content] START_SELECTION, tabId from query:", currentTabId)
    }
    
    startSelection(selectionMsg.projectDirectory, selectionMsg.sessionId)
    sendResponse({ success: true })
    return true
  }
  if (message.type === "CONFIG_REQUIRED") {
    alert((message as { message: string }).message)
    sendResponse({ received: true })
    return true
  }
  if (message.type === "SESSIONS_LIST") {
    console.log("[Content] SESSIONS_LIST received, sessions:", (message as { sessions?: SessionInfo[] }).sessions)
    const sessionsMsg = message as { sessions?: SessionInfo[] }
    if (sessionsMsg.sessions && sessionsMsg.sessions.length > 0) {
      console.log("[Content] Calling showSessionsDropdown with", sessionsMsg.sessions.length, "sessions")
      showSessionsDropdown(sessionsMsg.sessions)
    } else {
      console.log("[Content] SESSIONS_LIST received but no sessions or empty sessions array")
    }
    sendResponse({ received: true })
    return true
  }
  if (message.type === "SESSION_CREATED") {
    console.log("[Content] SESSION_CREATED received, sessionId:", (message as { sessionId?: string }).sessionId)
    const sessionMsg = message as { sessionId?: string }
    if (sessionMsg.sessionId) {
      sessionId = sessionMsg.sessionId
      console.log("[Content] sessionId updated to:", sessionId)
      if (currentTabId) {
        browser.runtime.sendMessage({
          type: "STORE_SESSION",
          tabId: currentTabId,
          sessionId: sessionMsg.sessionId
        })
      }
      const hintEl = document.getElementById("opencode-hint")
      if (hintEl) {
        hintEl.textContent = sessionId.substring(0, 8)
      }
    }
    sendResponse({ received: true })
    return true
  }
  if (message.type === "PROJECT_CHANGED") {
    console.log("[Content] PROJECT_CHANGED received, new project:", (message as { projectDirectory?: string }).projectDirectory)
    const projMsg = message as { projectDirectory?: string }
    if (projMsg.projectDirectory) {
      currentProjectDir = projMsg.projectDirectory
      console.log("[Content] currentProjectDir updated to:", currentProjectDir)
    }
    sendResponse({ received: true })
    return true
  }
  return false
})