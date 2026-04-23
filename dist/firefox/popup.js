(() => {
  // src/popup.ts
  var WEBSOCKET_URL = "ws://localhost:9999";
  var savedSpan = document.getElementById("saved");
  var projectSelect = document.getElementById("project-select");
  var saveBtn = document.getElementById("save-btn");
  var refreshBtn = document.getElementById("refresh-btn");
  var statusEl = document.getElementById("status");
  var projects = [];
  async function fetchProjects() {
    statusEl.textContent = "Loading projects...";
    statusEl.style.color = "rgba(255,255,255,0.5)";
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(WEBSOCKET_URL);
      const timeout = setTimeout(() => {
        ws.close();
        statusEl.textContent = "Failed to fetch projects (timeout)";
        statusEl.style.color = "#ff4444";
        reject();
      }, 5e3);
      ws.onopen = () => {
        console.log("WebSocket connected, sending GET_PROJECTS");
        ws.send(JSON.stringify({ type: "GET_PROJECTS" }));
      };
      ws.onmessage = (event) => {
        clearTimeout(timeout);
        try {
          const message = JSON.parse(event.data);
          if (message.type === "PROJECTS_LIST" && message.projects) {
            projects = message.projects;
            renderProjects();
            statusEl.textContent = projects.length > 0 ? "" : "No projects found";
          } else if (message.type === "ERROR") {
            statusEl.textContent = message.message || "Failed to fetch projects";
            statusEl.style.color = "#ff4444";
          }
          ws.close();
          resolve();
        } catch (err) {
          statusEl.textContent = "Failed to parse response";
          statusEl.style.color = "#ff4444";
          reject(err);
        }
      };
      ws.onerror = () => {
        clearTimeout(timeout);
        statusEl.textContent = "Failed to connect to MCP server";
        statusEl.style.color = "#ff4444";
        reject();
      };
    });
  }
  function renderProjects() {
    if (projects.length === 0) {
      projectSelect.innerHTML = '<option value="">No projects available</option>';
      saveBtn.disabled = true;
      return;
    }
    projectSelect.innerHTML = projects.map(
      (p) => `<option value="${p.worktree}">${p.name} (${p.worktree})</option>`
    ).join("");
    saveBtn.disabled = false;
  }
  async function loadSavedProject() {
    const result = await browser.storage.local.get("selectedProject");
    if (result.selectedProject) {
      projectSelect.value = result.selectedProject;
    }
  }
  async function saveSelection() {
    const selected = projectSelect.value;
    if (!selected) return;
    await browser.storage.local.set({ selectedProject: selected });
    savedSpan.style.display = "inline";
    setTimeout(() => {
      savedSpan.style.display = "none";
    }, 2e3);
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      browser.tabs.sendMessage(tab.id, {
        type: "PROJECT_CHANGED",
        projectDirectory: selected
      }).catch(() => {
      });
    }
  }
  saveBtn.addEventListener("click", saveSelection);
  refreshBtn.addEventListener("click", () => fetchProjects());
  projectSelect.addEventListener("change", () => {
    saveBtn.disabled = !projectSelect.value;
  });
  fetchProjects().finally(() => {
    loadSavedProject();
  });
})();
