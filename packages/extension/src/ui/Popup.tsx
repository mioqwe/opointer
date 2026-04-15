import { useState, useEffect } from "react"
import type { ProjectMapping } from "~/types"

export default function Popup() {
  const [mappings, setMappings] = useState<ProjectMapping>({})
  const [newUrl, setNewUrl] = useState("")
  const [newDir, setNewDir] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    browser.storage.local.get("projectMappings").then((result) => {
      if (result.projectMappings) {
        setMappings(result.projectMappings)
      }
    })
  }, [])

  const handleAddMapping = async () => {
    if (!newUrl.trim() || !newDir.trim()) return

    const updated = { ...mappings, [newUrl]: newDir }
    setMappings(updated)
    await browser.storage.local.set({ projectMappings: updated })
    setNewUrl("")
    setNewDir("")
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleRemoveMapping = async (url: string) => {
    const updated = { ...mappings }
    delete updated[url]
    setMappings(updated)
    await browser.storage.local.set({ projectMappings: updated })
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>OpenCode DOM Editor</h1>
        <p style={subtitleStyle}>Configure project URL mappings</p>
      </header>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Add Project Mapping</h2>
        <div style={formStyle}>
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://example.com"
            style={inputStyle}
          />
          <input
            type="text"
            value={newDir}
            onChange={(e) => setNewDir(e.target.value)}
            placeholder="/path/to/project"
            style={inputStyle}
          />
          <button onClick={handleAddMapping} style={addButtonStyle}>
            Add
          </button>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Configured Projects</h2>
        {Object.keys(mappings).length === 0 ? (
          <p style={emptyStyle}>No projects configured yet</p>
        ) : (
          <ul style={listStyle}>
            {Object.entries(mappings).map(([url, dir]) => (
              <li key={url} style={listItemStyle}>
                <div>
                  <span style={urlStyle}>{url}</span>
                  <span style={dirStyle}>{dir}</span>
                </div>
                <button onClick={() => handleRemoveMapping(url)} style={removeButtonStyle}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
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

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: "rgba(255, 255, 255, 0.4)",
  marginBottom: "12px"
}

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px"
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: "6px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  background: "rgba(255, 255, 255, 0.05)",
  color: "#fff",
  fontSize: "14px",
  outline: "none"
}

const addButtonStyle: React.CSSProperties = {
  padding: "10px",
  borderRadius: "6px",
  border: "none",
  background: "#0066ff",
  color: "#fff",
  fontSize: "14px",
  cursor: "pointer"
}

const emptyStyle: React.CSSProperties = {
  color: "rgba(255, 255, 255, 0.4)",
  fontSize: "14px",
  textAlign: "center",
  padding: "20px"
}

const listStyle: React.CSSProperties = {
  listStyle: "none",
  margin: 0,
  padding: 0
}

const listItemStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px",
  background: "rgba(255, 255, 255, 0.05)",
  borderRadius: "6px",
  marginBottom: "8px"
}

const urlStyle: React.CSSProperties = {
  display: "block",
  fontSize: "14px",
  color: "#00aaff"
}

const dirStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  color: "rgba(255, 255, 255, 0.5)",
  marginTop: "2px"
}

const removeButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "rgba(255, 255, 255, 0.4)",
  fontSize: "18px",
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
