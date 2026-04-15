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
}

interface StatusUpdate {
  type: "STATUS_UPDATE" | "ERROR" | "COMPLETE" | "SESSION_CREATED" | "PROJECTS_LIST"
  message?: string
  projects?: Array<{ id: string; name: string; worktree: string }>
  sessionId?: string
}

const WEBSOCKET_URL = "ws://localhost:9999"

const projectUrlMap = new Map<string, string>()

let ws: WebSocket | null = null
let pendingResolution: ((result: { success: boolean; error?: string }) => void) | null = null

async function loadProjectMappings(): Promise<void> {
  try {
    const result = await browser.storage.local.get("projectMappings")
    if (result.projectMappings) {
      for (const [url, dir] of Object.entries(result.projectMappings as Record<string, string>)) {
        projectUrlMap.set(url, dir)
      }
    }
  } catch (error) {
    console.error("[Background] Failed to load project mappings:", error)
  }
}

function getProjectDirectory(tabUrl: string): string | null {
  try {
    const url = new URL(tabUrl)
    const baseUrl = `${url.protocol}//${url.host}`
    for (const [projectUrl, dir] of projectUrlMap.entries()) {
      if (baseUrl.includes(projectUrl) || projectUrl.includes(url.host)) {
        return dir
      }
    }
    return projectUrlMap.get(baseUrl) || projectUrlMap.get(tabUrl)
  } catch {
    return null
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
  })
}

async function sendEditRequest(request: EditRequest): Promise<string> {
  await connectWebSocket()

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
      await loadProjectMappings()

      const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
      if (!tab?.id || !tab.url) {
        console.error("[Background] No active tab found")
        return
      }

      const projectDir = getProjectDirectory(tab.url)
      if (!projectDir) {
        const message = {
          type: "CONFIG_REQUIRED",
          message: `No project mapping found for ${tab.url}. Please configure the project mapping in extension options.`
        }
        browser.tabs.sendMessage(tab.id, message)
        return
      }

      await browser.tabs.sendMessage(tab.id, {
        type: "START_SELECTION",
        projectDirectory: projectDir
      })
    } catch (error) {
      console.error("[Background] Error handling command:", error)
    }
  }
})

browser.runtime.onMessage.addListener((message: StatusUpdate | { type: string }, sender, sendResponse) => {
  const msg = message as StatusUpdate

  if (msg.type === "STATUS_UPDATE" || msg.type === "ERROR" || msg.type === "COMPLETE" || msg.type === "SESSION_CREATED") {
    if (pendingResolution) {
      if (msg.type === "ERROR") {
        pendingResolution({ success: false, error: msg.message })
      } else if (msg.type === "COMPLETE" || msg.type === "SESSION_CREATED") {
        pendingResolution({ success: true, sessionId: msg.sessionId })
      } else {
        browser.runtime.sendMessage(msg)
      }
    }
    sendResponse({ received: true })
    return true
  }

  if (message.type === "DOM_SELECTED") {
    const data = message as { projectDirectory: string; domContext: DomContext; pageTitle: string; pageUrl: string }
    sendEditRequest({
      type: "EDIT_REQUEST",
      projectDirectory: data.projectDirectory,
      domContext: data.domContext,
      userPrompt: "",
      pageTitle: data.pageTitle,
      pageUrl: data.pageUrl
    })
      .then((sessionId) => {
        browser.runtime.sendMessage({
          type: "SESSION_CREATED",
          sessionId,
          message: `Session created. Edit in progress...`
        })
      })
      .catch((error) => {
        browser.runtime.sendMessage({
          type: "ERROR",
          message: error.message
        })
      })
    return true
  }

  if (message.type === "SEND_PROMPT") {
    const data = message as { projectDirectory: string; domContext: DomContext; userPrompt: string; pageTitle: string; pageUrl: string }
    sendEditRequest({
      type: "EDIT_REQUEST",
      projectDirectory: data.projectDirectory,
      domContext: data.domContext,
      userPrompt: data.userPrompt,
      pageTitle: data.pageTitle,
      pageUrl: data.pageUrl
    })
      .then((sessionId) => {
        browser.runtime.sendMessage({
          type: "SESSION_CREATED",
          sessionId,
          message: `Session ${sessionId} created. Edit in progress...`
        })
      })
      .catch((error) => {
        browser.runtime.sendMessage({
          type: "ERROR",
          message: error.message
        })
      })
    return true
  }

  return false
})
