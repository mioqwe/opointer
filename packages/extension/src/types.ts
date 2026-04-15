export interface DomContext {
  tagName: string
  attributes: Record<string, string>
  textContent: string
  computedStyles: Record<string, string>
  xPath: string
  parentHierarchy: string[]
  children: string[]
}

export interface StatusMessage {
  type: "STATUS_UPDATE" | "ERROR" | "COMPLETE" | "SESSION_CREATED"
  message: string
  sessionId?: string
}

export interface EditRequest {
  type: "EDIT_REQUEST"
  projectDirectory: string
  domContext: DomContext
  userPrompt: string
  pageTitle: string
  pageUrl: string
}

export interface ProjectMapping {
  [url: string]: string
}
