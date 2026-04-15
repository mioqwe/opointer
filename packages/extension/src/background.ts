interface DomContext {
  tagName: string
  attributes: Record<string, string>
  textContent: string
  computedStyles: Record<string, string>
  xPath: string
  parentHierarchy: string[]
  children: string[]
}

interface EditRequest {
  type: "EDIT_REQUEST"
  projectDirectory: string
  domContext: DomContext
  userPrompt: string
  pageTitle: string
  pageUrl: string
  sessionId?: string
}

interface StatusUpdate {
  type: "STATUS_UPDATE" | "ERROR" | "COMPLETE" | "SESSION_CREATED" | "PROJECTS_LIST" | "SESSIONS_LIST"
  message?: string
  projects?: Array<{ id: string; name: string; worktree: string }>
  sessions?: Array<{ id: string; title: string; createdAt: string; truncatedId: string }>
  sessionId?: string
}

const WEBSOCKET_URL = "ws://localhost:9999"
const SESSION_PREFIX = "session_"

let ws: WebSocket | null = null
let pendingResolution: ((result: { success: boolean; sessionId?: string; error?: string }) => void) | null = null
let pendingSessionsTabId: number | null = null

async function getSessionId(tabId: number): Promise<string | null> {
  const key = SESSION_PREFIX + tabId
  const result = await browser.storage.local.get(key)
  return result[key] || null
}

async function setSessionId(tabId: number, sessionId: string | null): Promise<void> {
  const key = SESSION_PREFIX + tabId
  if (sessionId) {
    await browser.storage.local.set({ [key]: sessionId })
  } else {
    await browser.storage.local.remove(key)
  }
}

function connectWebSocket(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      resolve(ws)
      return
    }

    ws = new WebSocket(WEBSOCKET_URL)

    ws.onopen = () => {
      console.log("[Background] Connected to MCP server")
      resolve(ws!)
    }

    ws.onerror = (error) => {
      console.error("[Background] WebSocket error:", error)
      reject(new Error("Failed to connect to MCP server"))
    }

    ws.onclose = () => {
      console.log("[Background] WebSocket connection closed")
      ws = null
    }

    ws.onmessage = (event) => {
      console.log("[Background] Received WebSocket message, data length:", event.data.length)
      try {
        const message = JSON.parse(event.data as string)
        console.log("[Background] Parsed message type:", message.type, "has sessions:", !!message.sessions, "sessions count:", message.sessions?.length)
        
        if (message.type === "SESSIONS_LIST") {
          console.log("[Background] SESSIONS_LIST - sending to tab:", pendingSessionsTabId)
          if (pendingSessionsTabId) {
            browser.tabs.sendMessage(pendingSessionsTabId, message).then(() => {
              console.log("[Background] sendMessage to tab succeeded")
              pendingSessionsTabId = null
            }).catch((err) => {
              console.error("[Background] sendMessage to tab failed:", err.message)
              pendingSessionsTabId = null
            })
          } else {
            console.log("[Background] No pending tab for SESSIONS_LIST")
            browser.runtime.sendMessage(message).catch(console.error)
          }
          return
        }
        
        if (message.type === "PROJECTS_LIST") {
          console.log("[Background] PROJECTS_LIST - bypassing pendingResolution, forwarding to content")
          browser.runtime.sendMessage(message)
          return
        }
        
        if (pendingResolution) {
          console.log("[Background] Has pendingResolution, processing message")
          if (message.type === "ERROR") {
            pendingResolution({ success: false, error: message.message })
          } else if (message.type === "COMPLETE" || message.type === "SESSION_CREATED") {
            pendingResolution({ success: true, sessionId: message.sessionId })
          } else if (message.type === "STATUS_UPDATE") {
            browser.runtime.sendMessage(message)
          }
        } else {
          console.log("[Background] No pendingResolution, message type:", message.type)
        }
      } catch (error) {
        console.error("[Background] Failed to parse message:", error)
      }
    }
  })
}

async function sendEditRequest(request: EditRequest): Promise<string | null> {
  const socket = await connectWebSocket()

  return new Promise((resolve, reject) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      reject(new Error("WebSocket not connected"))
      return
    }

    pendingResolution = (result) => {
      if (result.success && result.sessionId) {
        resolve(result.sessionId)
      } else {
        reject(new Error(result.error || "Edit request failed"))
      }
      pendingResolution = null
    }

    console.log("[Background] Sending edit request:", request)
    ws.send(JSON.stringify(request))

    setTimeout(() => {
      if (pendingResolution) {
        pendingResolution({ success: false, error: "Request timed out" })
      }
    }, 60000)
  })
}

browser.commands.onCommand.addListener(async (command: string) => {
  if (command === "select-element") {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
      if (!tab?.id) {
        console.error("[Background] No active tab found")
        return
      }

      const result = await browser.storage.local.get("selectedProject")
      const projectDir = result.selectedProject

      if (!projectDir) {
        const message = {
          type: "CONFIG_REQUIRED",
          message: "No project selected. Please select a project in the extension popup."
        }
        browser.tabs.sendMessage(tab.id, message)
        return
      }

      const sessionId = await getSessionId(tab.id)

      console.log("[Background] Sending START_SELECTION to tab:", tab.id, "sessionId:", sessionId)
      
      browser.tabs.sendMessage(tab.id, {
        type: "START_SELECTION",
        projectDirectory: projectDir,
        sessionId,
        tabId: tab.id
      }).then(() => {
        console.log("[Background] START_SELECTION sent successfully")
      }).catch(err => {
        console.error("[Background] Failed to send START_SELECTION:", err.message)
      })
    } catch (error) {
      console.error("[Background] Error handling command:", error)
    }
  }
})

browser.runtime.onMessage.addListener((message: StatusUpdate | { type: string }, sender, sendResponse) => {
  const msg = message as StatusUpdate

  if (msg.type === "STATUS_UPDATE" || msg.type === "ERROR" || msg.type === "COMPLETE" || msg.type === "SESSION_CREATED" || msg.type === "PROJECTS_LIST" || msg.type === "SESSIONS_LIST") {
    browser.runtime.sendMessage(msg)
    sendResponse({ received: true })
    return true
  }

  if (message.type === "GET_SESSIONS") {
    const data = message as { tabId?: number; projectDirectory: string }
    console.log("[Background] GET_SESSIONS received, tabId:", data.tabId)
    pendingSessionsTabId = data.tabId || null
    connectWebSocket().then(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "GET_SESSIONS", projectDirectory: data.projectDirectory }))
      }
    }).catch(console.error)
    sendResponse({ sent: true })
    return true
  }

  if (message.type === "GET_CURRENT_TAB_ID") {
    console.log("[Background] GET_CURRENT_TAB_ID received")
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      console.log("[Background] tabs query result:", tabs)
      sendResponse({ tabId: tabs[0]?.id ?? null })
    }).catch(err => {
      console.error("[Background] GET_CURRENT_TAB_ID error:", err)
      sendResponse({ tabId: null })
    })
    return true
  }

  if (message.type === "STORE_SESSION") {
    const data = message as { tabId: number; sessionId: string }
    setSessionId(data.tabId, data.sessionId)
    sendResponse({ received: true })
    return true
  }

  if (message.type === "CLEAR_SESSION") {
    const data = message as { tabId: number }
    console.log("[Background] CLEAR_SESSION received for tab:", data.tabId)
    setSessionId(data.tabId, null)
    sendResponse({ received: true })
    return true
  }

  if (message.type === "SEND_PROMPT") {
    const data = message as { tabId: number; projectDirectory: string; domContext: DomContext; userPrompt: string; pageTitle: string; pageUrl: string; sessionId?: string }
    console.log("[Background] SEND_PROMPT received:", data.userPrompt, "sessionId:", data.sessionId)

    sendEditRequest({
      type: "EDIT_REQUEST",
      projectDirectory: data.projectDirectory,
      domContext: data.domContext,
      userPrompt: data.userPrompt,
      pageTitle: data.pageTitle,
      pageUrl: data.pageUrl,
      sessionId: data.sessionId
    })
      .then((sessionId) => {
        console.log("[Background] Session created:", sessionId)
        setSessionId(data.tabId, sessionId)
        browser.runtime.sendMessage({
          type: "SESSION_CREATED",
          sessionId,
          message: `Session created. Check OpenCode for progress.`
        })
      })
      .catch((error) => {
        console.error("[Background] Error:", error)
        browser.runtime.sendMessage({
          type: "ERROR",
          message: error.message
        })
      })
    sendResponse({ sent: true })
    return true
  }

  return false
})