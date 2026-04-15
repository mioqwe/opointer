import { useState, useEffect } from "react"

interface Project {
  id: string
  name: string
  worktree: string
}

const WEBSOCKET_URL = "ws://localhost:9999"

export default function Popup() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    setLoading(true)
    setError(null)

    return new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(WEBSOCKET_URL)

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "GET_PROJECTS" }))
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data as string)
          if (message.type === "PROJECTS_LIST" && message.projects) {
            setProjects(message.projects)
            if (message.projects.length > 0 && !selectedProject) {
              setSelectedProject(message.projects[0].worktree)
            }
          } else if (message.type === "ERROR") {
            setError(message.message || "Failed to fetch projects")
          }
          ws.close()
          resolve()
        } catch (err) {
          reject(err)
        }
      }

      ws.onerror = () => {
        setError("Failed to connect to MCP server")
        reject()
      }

      setTimeout(() => {
        if (ws.readyState !== WebSocket.CLOSED) {
          ws.close()
          reject()
        }
      }, 5000)
    }).catch(() => {
      setError("Failed to fetch projects (timeout)")
    }).finally(() => {
      setLoading(false)
    })
  }

  const handleSave = async () => {
    if (!selectedProject) return

    await browser.storage.local.set({ selectedProject })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>OpenCode DOM Editor</h1>
        <p style={subtitleStyle}>Select a project to edit</p>
      </header>

      <section style={sectionStyle}>
        {loading && <p style={loadingStyle}>Loading projects from OpenCode...</p>}
        {error && <p style={errorStyle}>{error}</p>}

        {!loading && !error && (
          <>
            {projects.length === 0 ? (
              <p style={emptyStyle}>No projects found in OpenCode. Make sure OpenCode is running with some projects open.</p>
            ) : (
              <>
                <label style={labelStyle}>Select Project</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  style={selectStyle}
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.worktree}>
                      {project.name} ({project.worktree})
                    </option>
                  ))}
                </select>
              </>
            )}
          </>
        )}
      </section>

      <section style={sectionStyle}>
        <button
          onClick={handleSave}
          disabled={!selectedProject}
          style={saveButtonStyle}
        >
          Save Selection
        </button>
      </section>

      <section style={sectionStyle}>
        <button
          onClick={() => fetchProjects()}
          style={refreshButtonStyle}
        >
          Refresh Projects
        </button>
      </section>

      <footer style={footerStyle}>
        <p style={shortcutStyle}>
          Shortcut: <kbd style={kbdStyle}>Ctrl+Shift+E</kbd>
        </p>
        {saved && <span style={savedStyle}>Saved!</span>}
      </footer>
    </div>
  )
}

const containerStyle: React.CSSProperties = {
  width: "360px",
  padding: "20px",
  fontFamily: "system-ui, -apple-system, sans-serif",
  background: "#0f0f1a",
  color: "#fff",
  boxSizing: "border-box"
}

const headerStyle: React.CSSProperties = {
  marginBottom: "24px"
}

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "20px",
  fontWeight: 600,
  color: "#fff"
}

const subtitleStyle: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: "13px",
  color: "rgba(255, 255, 255, 0.5)"
}

const sectionStyle: React.CSSProperties = {
  marginBottom: "24px"
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: "rgba(255, 255, 255, 0.4)",
  marginBottom: "8px"
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "6px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  background: "rgba(255, 255, 255, 0.05)",
  color: "#fff",
  fontSize: "14px",
  outline: "none",
  cursor: "pointer"
}

const loadingStyle: React.CSSProperties = {
  color: "rgba(255, 255, 255, 0.5)",
  fontSize: "14px",
  textAlign: "center",
  padding: "20px"
}

const errorStyle: React.CSSProperties = {
  color: "#ff4444",
  fontSize: "14px",
  textAlign: "center",
  padding: "20px"
}

const emptyStyle: React.CSSProperties = {
  color: "rgba(255, 255, 255, 0.4)",
  fontSize: "14px",
  textAlign: "center",
  padding: "20px"
}

const saveButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "6px",
  border: "none",
  background: "#0066ff",
  color: "#fff",
  fontSize: "14px",
  cursor: "pointer"
}

const refreshButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  background: "transparent",
  color: "#fff",
  fontSize: "14px",
  cursor: "pointer"
}

const footerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingTop: "16px",
  borderTop: "1px solid rgba(255, 255, 255, 0.1)"
}

const shortcutStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "rgba(255, 255, 255, 0.5)",
  margin: 0
}

const kbdStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.1)",
  padding: "2px 6px",
  borderRadius: "4px",
  fontSize: "11px"
}

const savedStyle: React.CSSProperties = {
  color: "#00ff88",
  fontSize: "13px"
}