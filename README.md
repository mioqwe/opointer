# Opointer - AI-Powered DOM Editor

A cross-browser (Chrome/Firefox) browser extension that integrates with OpenCode for AI-powered DOM editing. Select any DOM element on a webpage, describe the change you want, and OpenCode will implement it in your local project.

## Overview

This project consists of two main components:

1. **Browser Extension** (`packages/extension`) - Handles DOM element selection and provides a chat interface for describing desired changes
2. **WSBridge Server** (`packages/wsbridge`) - Acts as a WebSocket bridge between the extension and OpenCode, using the OpenCode SDK to create sessions and send prompts

## Features

- **DOM Element Selection**: Press `Cmd+Shift+E` / `Ctrl+Shift+E` to enter selection mode, then click on any element
- **Session Management**: Continue editing in the same session across multiple element selections
- **Session Switching**: Type `/sessions` to switch between existing OpenCode sessions
- **New Session**: Type `/new` to clear current session and create a fresh one
- **Per-Tab Sessions**: Each browser tab maintains its own session
- **Project Switching**: Change projects in the extension popup without losing your session
- **Session Persistence**: Sessions persist across page reloads (stored in browser storage)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser Extension                        │
├──────────────┬──────────────────────────────┬─────────────────┤
│   Background │        Content Script        │   Chat Modal    │
│   (Service   │   - DOM Selection Overlay     │   - Prompt     │
│    Worker)   │   - Element Capture          │     Input       │
│             │   - Session Management        │   - /sessions   │
│             │   - Crosshair Cursor         │   - /new        │
│             │                              │   - Session ID  │
└──────┬───────┴──────────────┬───────────────┴─────────────────┘
       │                      │
       │   WebSocket (ws://localhost:9999)
       │                      │
       ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      WSBridge Server                            │
│  - WebSocket Server                                           │
│  - OpenCode SDK Integration                                    │
│  - Session Management                                         │
└────────────────────────────┬──────────────────────────────────┘
                              │
                              │ HTTP (localhost:4096)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      OpenCode Server                            │
│  - AI Agent                                                    │
│  - File Operations                                             │
│  - Session Management                                          │
└─────────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Node.js 18+
- npm 9+
- [OpenCode](https://opencode.ai) server running locally (port 4096)
- A web project you want to edit

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the WSBridge Server

```bash
npm run build --workspace=@opointer/wsbridge
```

### 3. Load the Extension

#### Firefox

1. Navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Select `packages/extension/dist/firefox/manifest.json`

#### Chrome

1. Navigate to `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select `packages/extension/dist/chrome/`

### 4. Start the WSBridge Server

```bash
cd packages/wsbridge
npm run dev        # Development with watch mode
# Or
npm start           # Production
```

## Configuration

1. Click the extension icon in your browser toolbar
2. Select a project from the dropdown (this fetches available projects from OpenCode)
3. Click "Save" to set the project

## Usage

### Basic Workflow

1. **Start OpenCode Server** - Ensure OpenCode is running on `localhost:4096`
2. **Start WSBridge Server** - `cd packages/wsbridge && npm start`
3. **Navigate to Your Project** - Open the website you want to edit
4. **Select an Element** - Press `Cmd+Shift+E`, then click on the element
5. **Describe the Change** - Type your prompt and press Enter
6. **Review Changes** - Check OpenCode for progress and suggested changes

### Chat Commands

- `/sessions` - Opens a dropdown to switch between existing OpenCode sessions
- `/new` - Clears the current session ID, allowing the next prompt to create a new session

### Session Behavior

- **New Session**: If no session exists, one is created automatically when you send your first prompt
- **Same Session**: All prompts go to the same session until you switch or clear it
- **Page Reload**: Session ID persists in browser storage, so it survives page reloads
- **Tab Isolation**: Each tab has its own independent session
- **Project Change**: Changing project in the popup updates the content script immediately

### Keyboard Shortcuts

| Action | Firefox/Mac | Windows/Linux |
|--------|------------|--------------|
| Enter selection mode | `Cmd+Shift+E` | `Ctrl+Shift+E` |
| Send prompt | `Enter` | `Enter` |
| Close modal | `ESC` | `ESC` |

## Building

```bash
# Build everything
npm run build

# Build extension only
npm run build --workspace=@opointer/extension

# Build WSBridge server only
npm run build --workspace=@opointer/wsbridge
```

## Project Structure

```
opointer/
├── package.json              # Root workspace configuration
├── README.md                 # User documentation
├── AGENTS.md                 # Developer documentation for AI agents
└── packages/
    ├── extension/            # Browser extension
    │   ├── src/
    │   │   ├── content.ts     # Content script - DOM selection, chat UI
    │   │   ├── background.ts # Service worker - messaging, WebSocket
    │   │   ├── popup.ts      # Extension popup UI
    │   │   ├── storage.ts    # browser.storage.local helpers
    │   │   └── types.ts      # TypeScript interfaces
    │   ├── manifest.json     # Extension manifest v3
    │   └── dist/             # Built output (firefox/, chrome/)
    │
    └── wsbridge/             # WebSocket bridge server
        ├── src/
        │   └── index.ts      # WebSocket server + OpenCode SDK
        └── dist/             # Built output
```

## WebSocket Protocol

### Extension → WSBridge Messages

```typescript
// Edit request
{
  type: "EDIT_REQUEST"
  projectDirectory: string
  domContext: {
    tagName: string
    attributes: Record<string, string>
    textContent: string
    computedStyles: Record<string, string>
    xPath: string
    parentHierarchy: string[]
    children: string[]
  }
  userPrompt: string
  pageTitle: string
  pageUrl: string
  sessionId?: string  // Optional - reuses existing session if provided
}

// Get sessions
{
  type: "GET_SESSIONS"
  projectDirectory: string
}
```

### WSBridge → Extension Messages

```typescript
// Status update
{
  type: "STATUS_UPDATE"
  message: string
  sessionId?: string
}

// Sessions list
{
  type: "SESSIONS_LIST"
  sessions: Array<{
    id: string
    title: string
    createdAt: string
    truncatedId: string
  }>
}

// Error
{
  type: "ERROR"
  message: string
}
```

## Error Handling

### "Could not establish connection. Receiving end does not exist"

The content script isn't ready. Refresh the webpage and try again.

### "Failed to connect to WSBridge server"

Ensure the WSBridge server is running on `ws://localhost:9999`.

### Session created in wrong project

Make sure to save the project in the extension popup before selecting an element. If you change projects, the new project will be used for subsequent prompts.

## Dependencies

### Extension
- Vanilla JS with esbuild (no framework)
- `browser.storage.local` for persistence

### WSBridge Server
- `@opencode-ai/sdk` - OpenCode SDK
- `ws` - WebSocket server

## License

MIT