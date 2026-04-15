import { useState, useEffect, useRef } from "react"
import type { DomContext, StatusMessage } from "~/types"

interface ChatModalProps {
  domContext: DomContext
  projectDirectory: string
  pageTitle: string
  pageUrl: string
  onClose: () => void
}

export default function ChatModal({ domContext, projectDirectory, pageTitle, pageUrl, onClose }: ChatModalProps) {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<string>("")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const handleMessage = (message: StatusMessage) => {
      if (message.type === "STATUS_UPDATE") {
        setStatus(message.message)
      } else if (message.type === "SESSION_CREATED") {
        setSessionId(message.sessionId || null)
        setStatus(`Session created: ${message.sessionId}`)
      } else if (message.type === "ERROR") {
        setStatus(`Error: ${message.message}`)
        setIsLoading(false)
      } else if (message.type === "COMPLETE") {
        setStatus("Edit complete!")
        setIsLoading(false)
      }
    }

    browser.runtime.onMessage.addListener(handleMessage)
    return () => browser.runtime.onMessage.removeListener(handleMessage)
  }, [])

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isLoading) return

    setIsLoading(true)
    setStatus("Sending request to OpenCode...")

    try {
      browser.runtime.sendMessage({
        type: "SEND_PROMPT",
        projectDirectory,
        domContext,
        userPrompt: prompt,
        pageTitle,
        pageUrl
      })
    } catch (error) {
      setStatus(`Failed to send: ${error}`)
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <div>
            <h2 style={titleStyle}>Edit DOM Element</h2>
            <p style={subtitleStyle}>
              {domContext.tagName} • {pageTitle}
            </p>
          </div>
          <button onClick={handleClose} style={closeButtonStyle} aria-label="Close">
            ×
          </button>
        </div>

        <div style={domInfoStyle}>
          <div style={infoLabelStyle}>Selected Element</div>
          <code style={codeStyle}>{domContext.xPath}</code>
          {Object.keys(domContext.attributes).length > 0 && (
            <div style={attributesStyle}>
              {Object.entries(domContext.attributes).slice(0, 3).map(([key, value]) => (
                <span key={key} style={attrStyle}>
                  {key}="{value.slice(0, 30)}"
                </span>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the change you want to make..."
            style={textareaStyle}
            disabled={isLoading}
            rows={4}
          />

          {status && (
            <div style={statusStyle}>
              {isLoading && <span style={spinnerStyle} />}
              <span>{status}</span>
            </div>
          )}

          <div style={actionsStyle}>
            <button type="button" onClick={handleClose} style={cancelButtonStyle}>
              Cancel
            </button>
            <button type="submit" disabled={!prompt.trim() || isLoading} style={submitButtonStyle}>
              {isLoading ? "Sending..." : "Send to OpenCode"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2147483647,
  fontFamily: "system-ui, -apple-system, sans-serif"
}

const modalStyle: React.CSSProperties = {
  background: "#1a1a2e",
  borderRadius: "12px",
  width: "90%",
  maxWidth: "500px",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
  border: "1px solid rgba(255, 255, 255, 0.1)"
}

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  padding: "20px 20px 16px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
}

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "18px",
  fontWeight: 600,
  color: "#fff"
}

const subtitleStyle: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: "13px",
  color: "rgba(255, 255, 255, 0.5)"
}

const closeButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "rgba(255, 255, 255, 0.5)",
  fontSize: "24px",
  cursor: "pointer",
  padding: "0",
  lineHeight: 1
}

const domInfoStyle: React.CSSProperties = {
  padding: "12px 20px",
  background: "rgba(0, 102, 255, 0.1)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
}

const infoLabelStyle: React.CSSProperties = {
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: "rgba(255, 255, 255, 0.4)",
  marginBottom: "4px"
}

const codeStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  color: "#00aaff",
  fontFamily: "monospace",
  wordBreak: "break-all"
}

const attributesStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  marginTop: "8px"
}

const attrStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "rgba(255, 255, 255, 0.6)",
  background: "rgba(255, 255, 255, 0.05)",
  padding: "2px 6px",
  borderRadius: "4px"
}

const formStyle: React.CSSProperties = {
  padding: "16px 20px 20px"
}

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  background: "rgba(255, 255, 255, 0.05)",
  color: "#fff",
  fontSize: "14px",
  fontFamily: "inherit",
  resize: "vertical",
  boxSizing: "border-box",
  outline: "none"
}

const statusStyle: React.CSSProperties = {
  marginTop: "12px",
  padding: "10px 12px",
  borderRadius: "6px",
  background: "rgba(255, 255, 255, 0.05)",
  color: "rgba(255, 255, 255, 0.7)",
  fontSize: "13px",
  display: "flex",
  alignItems: "center",
  gap: "8px"
}

const spinnerStyle: React.CSSProperties = {
  width: "14px",
  height: "14px",
  border: "2px solid rgba(255, 255, 255, 0.3)",
  borderTopColor: "#fff",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite"
}

const actionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  marginTop: "16px"
}

const cancelButtonStyle: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: "6px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  background: "transparent",
  color: "rgba(255, 255, 255, 0.7)",
  fontSize: "14px",
  cursor: "pointer"
}

const submitButtonStyle: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: "6px",
  border: "none",
  background: "#0066ff",
  color: "#fff",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer"
}
