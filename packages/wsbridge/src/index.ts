import { WebSocketServer, WebSocket } from "ws"
import { createOpencodeClient } from "@opencode-ai/sdk/client"
import { randomUUID } from "crypto"
import { formatSourceContext, type ElementSourceInfo } from "./elementSource.js"

const MCP_SERVER_PORT = 9999
const OPENCODE_URL = "http://localhost:4096"

interface DomContext {
  tagName: string
  attributes: Record<string, string>
  textContent: string
  computedStyles: Record<string, string>
  xPath: string
  parentHierarchy: string[]
  children: string[]
  sourceInfo: ElementSourceInfo | null
  componentStack: ElementSourceInfo[]
  resolved: boolean
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

interface GetProjectsRequest {
  type: "GET_PROJECTS"
}

interface GetSessionsRequest {
  type: "GET_SESSIONS"
  projectDirectory: string
}

interface StatusUpdate {
  type: "STATUS_UPDATE" | "ERROR" | "COMPLETE" | "PROJECTS_LIST" | "SESSIONS_LIST"
  message?: string
  projects?: Array<{ id: string; name: string; worktree: string }>
  sessions?: Array<{ id: string; title: string; createdAt: string; truncatedId: string }>
  sessionId?: string
}

const opencodeClients = new Map<string, ReturnType<typeof createOpencodeClient>>()

function expandPath(path: string): string {
  if (path.startsWith("~/") || path === "~") {
    return path.replace(/^~/, process.env.HOME || "/Users/mio")
  }
  return path
}

function getOpenCodeClient(projectDirectory: string) {
  const expandedDir = expandPath(projectDirectory)
  
  if (opencodeClients.has(expandedDir)) {
    return opencodeClients.get(expandedDir)!
  }

  const client = createOpencodeClient({
    baseUrl: OPENCODE_URL,
    directory: expandedDir
  })
  
  opencodeClients.set(expandedDir, client)
  return client
}

async function handleEditRequest(request: EditRequest): Promise<string> {
  const { projectDirectory, domContext, userPrompt, pageTitle, pageUrl, sessionId: existingSessionId } = request
  
  console.log(`[MCP Server] Processing edit request for project: ${projectDirectory}`)
  console.log(`[MCP Server] Target element: ${domContext.tagName}`)
  console.log(`[MCP Server] User prompt: ${userPrompt}`)
  console.log(`[MCP Server] Existing session: ${existingSessionId || "none"}`)
  
  const client = getOpenCodeClient(projectDirectory)
  
  let sessionId = existingSessionId
  
  try {
    if (!sessionId) {
      const result = await client.session.create({
        body: {
          title: `Web Edit: ${domContext.tagName} on ${pageTitle}`
        }
      })
      
      if (result.error) {
        throw new Error(`Failed to create session: ${JSON.stringify(result.error)}`)
      }
      
      sessionId = result.data.id
      console.log(`[MCP Server] Created session: ${sessionId}`)
    } else {
      console.log(`[MCP Server] Reusing existing session: ${sessionId}`)
    }
    
    const domContextJson = JSON.stringify(domContext, null, 2)
    const sourceContext = formatSourceContext(
      domContext.sourceInfo,
      domContext.componentStack,
      domContext.xPath
    )
    
    const fullPrompt = `You are implementing a web edit requested by the user. 

Given the following DOM context from a webpage (${pageUrl}):

## Element Source Information
${sourceContext}

## DOM Element Details
- Tag: ${domContext.tagName}
- Attributes: ${JSON.stringify(domContext.attributes)}
- Text: ${domContext.textContent.slice(0, 100)}

Requested change: ${userPrompt}

Please implement this change by editing the appropriate source files in the project. Analyze the DOM context to understand what element needs to be modified, then make the necessary file changes.

IMPORTANT: 
- Only modify files that are necessary for this change
- Provide clear explanation of what files you changed`

    const promptResult = await client.session.prompt({
      path: { id: sessionId },
      body: {
        parts: [{ type: "text", text: fullPrompt }]
      }
    })
    
    console.log(`[MCP Server] Prompt sent to session ${sessionId}`)
    
    if (promptResult.error) {
      console.log(`[MCP Server] Prompt error:`, JSON.stringify(promptResult.error))
    } else {
      console.log(`[MCP Server] Response received`)
    }
    
    return sessionId
  } catch (error) {
    console.error(`[MCP Server] Error:`, error)
    if (error instanceof Error && error.message.includes("fetch")) {
      throw new Error("OpenCode server is not running. Please start OpenCode and try again.")
    }
    throw error
  }
}

function sendStatusUpdate(ws: WebSocket, message: StatusUpdate): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: message.type,
      message: message.message,
      sessionId: message.sessionId,
      projects: message.projects,
      sessions: message.sessions
    }))
  }
}

async function handleGetProjects(): Promise<Array<{ id: string; name: string; worktree: string }>> {
  const client = createOpencodeClient({
    baseUrl: OPENCODE_URL,
  })

  const result = await client.project.list()

  if (result.error) {
    throw new Error(`Failed to list projects: ${JSON.stringify(result.error)}`)
  }

  const data = result.data
  if (!data) {
    throw new Error("No projects data returned")
  }

  return data.map((p: { id: string; name?: string; worktree: string }) => ({
    id: p.id,
    name: p.name || p.worktree.split("/").pop() || "Unknown",
    worktree: p.worktree
  }))
}

async function processMessage(ws: WebSocket, message: { type: string; [key: string]: unknown }): Promise<void> {
  console.log(`[MCP Server] Message type: ${message.type}`)

  if (message.type === "GET_PROJECTS") {
    try {
      const projects = await handleGetProjects()
      sendStatusUpdate(ws, {
        type: "PROJECTS_LIST",
        projects
      })
    } catch (error) {
      sendStatusUpdate(ws, {
        type: "ERROR",
        message: error instanceof Error ? error.message : "Failed to get projects"
      })
    }
    return
  }

  if (message.type === "GET_SESSIONS") {
    console.log("[MCP Server] GET_SESSIONS handler started")
    try {
      const req = message as unknown as GetSessionsRequest
      console.log("[MCP Server] projectDirectory:", req.projectDirectory)
      const client = getOpenCodeClient(req.projectDirectory)
      console.log("[MCP Server] Calling client.session.list()")
      const result = await client.session.list()
      console.log("[MCP Server] session.list result:", JSON.stringify(result))
      
      if (result.error) {
        throw new Error(`Failed to list sessions: ${JSON.stringify(result.error)}`)
      }
      
      const sessions = (result.data || []).map((s) => ({
        id: s.id,
        title: s.title || "Untitled",
        createdAt: (s as unknown as { createdAt?: string }).createdAt || new Date().toISOString(),
        truncatedId: s.id.substring(0, 8)
      }))
      
      console.log("[MCP Server] Sending SESSIONS_LIST with", sessions.length, "sessions")
      sendStatusUpdate(ws, {
        type: "SESSIONS_LIST",
        sessions
      })
      console.log("[MCP Server] SESSIONS_LIST sent")
    } catch (error) {
      console.error("[MCP Server] GET_SESSIONS error:", error)
      sendStatusUpdate(ws, {
        type: "ERROR",
        message: error instanceof Error ? error.message : "Failed to get sessions"
      })
    }
    return
  }

  if (message.type !== "EDIT_REQUEST") {
    console.log(`[MCP Server] Unknown message type: ${message.type}`)
    sendStatusUpdate(ws, { type: "ERROR", message: `Unknown message type: ${message.type}` })
    return
  }

  const request = message as unknown as EditRequest

  if (!request.projectDirectory || !request.domContext) {
    sendStatusUpdate(ws, { type: "ERROR", message: "Invalid request: missing projectDirectory or domContext" })
    return
  }

  try {
    const sessionId = await handleEditRequest(request)

    sendStatusUpdate(ws, {
      type: "STATUS_UPDATE",
      message: "Edit request sent to OpenCode. Check the OpenCode interface for progress.",
      sessionId
    })

    sendStatusUpdate(ws, {
      type: "COMPLETE",
      message: "Edit request processed successfully.",
      sessionId
    })
  } catch (error) {
    console.error(`[MCP Server] Error processing request:`, error)

    sendStatusUpdate(ws, {
      type: "ERROR",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    })
  }
}

async function startMcpServer(): Promise<void> {
  const wss = new WebSocketServer({ port: MCP_SERVER_PORT })
  
  console.log(`[MCP Server] WebSocket server listening on ws://localhost:${MCP_SERVER_PORT}`)
  
  wss.on("connection", (ws: WebSocket) => {
    const clientId = randomUUID()
    console.log(`[MCP Server] Client connected: ${clientId}`)
    
    ws.on("message", async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString())
        console.log(`[MCP Server] Received message keys:`, Object.keys(message))
        
        await processMessage(ws, message as { type: string; [key: string]: unknown })
      } catch (error) {
        console.error(`[MCP Server] Failed to parse message:`, error)
        
        sendStatusUpdate(ws, {
          type: "ERROR",
          message: "Invalid message format"
        })
      }
    })
    
    ws.on("close", () => {
      console.log(`[MCP Server] Client disconnected: ${clientId}`)
    })
    
    ws.on("error", (error) => {
      console.error(`[MCP Server] WebSocket error for client ${clientId}:`, error)
    })
  })
  
  wss.on("error", (error) => {
    console.error("[MCP Server] Server error:", error)
  })
}

startMcpServer().catch(console.error)
