# Opointer - AGENTS.md

## Overview

This is a browser extension with a companion WebSocket bridge server that enables AI-powered DOM editing via OpenCode. Users select DOM elements on webpages, describe desired changes in natural language, and OpenCode implements those changes in the corresponding local project.

## Project Structure

```
opointer/
├── package.json           # Root workspace config
├── README.md              # User documentation
├── AGENTS.md              # This file - for AI agents
└── packages/
    ├── extension/         # Browser extension (Chrome + Firefox)
    │   ├── src/
    │   │   ├── content.ts  # Content script - DOM selection, chat UI
    │   │   ├── background.ts # Service worker - messaging, WebSocket
    │   │   ├── popup.ts     # Extension popup UI
    │   │   ├── storage.ts   # browser.storage.local helpers
    │   │   └── types.ts      # TypeScript interfaces
    │   ├── manifest.json    # Extension manifest v3
    │   └── dist/            # Built output (firefox/, chrome/)
    │
    └── wsbridge/           # WebSocket bridge server
        ├── src/
        │   └── index.ts     # WebSocket server + OpenCode SDK
        ├── dist/            # Built output
        └── scripts/         # Build scripts
```

## Building

```bash
# Build everything
npm run build

# Build extension only (outputs to packages/extension/dist/)
npm run build --workspace=@opointer/extension

# Build WSBridge server only (outputs to packages/wsbridge/dist/)
npm run build --workspace=@opointer/wsbridge
```

## Running

### 1. Start WSBridge Server (port 9999)

```bash
cd packages/wsbridge
npm run dev        # Development with watch mode
npm start          # Production (after build)
```

### 2. Load Extension

**Firefox:**
1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Select `packages/extension/dist/firefox/manifest.json`

**Chrome:**
1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `packages/extension/dist/chrome/`

### 3. Use Extension

1. Click extension icon, select a project from the dropdown, click Save
2. Press `Cmd+Shift+E` (Mac) / `Ctrl+Shift+E` (Windows/Linux)
3. Click on any element you want to edit
4. Type your prompt in the chat modal
5. Use `/sessions` to switch sessions, `/new` to clear and create new session

## Key Technologies

- **Extension**: Vanilla JS with esbuild (NOT Plasmo - we switched away from it)
- **WSBridge**: Node.js with WebSocket + OpenCode SDK
- **Communication**: WebSocket (`ws://localhost:9999`) between extension and wsbridge

## Architecture Decisions

### Why Vanilla JS for Extension?

We initially tried Plasmo but encountered issues with hot reload causing page reloads (which cleared session state). We switched to vanilla JS with esbuild for simplicity and reliability.

### Session Management

Sessions are stored per-tab in `browser.storage.local` with key format `session_<tabId>`. This ensures:
- Sessions persist across page reloads within the same tab
- Each tab has independent session state
- Session is automatically cleared when tab closes

### Tab ID Discovery

Firefox content scripts cannot access `browser.tabs` directly. We use a message-passing pattern:
- Content script sends `GET_CURRENT_TAB_ID` to background
- Background uses `browser.tabs.query()` and responds with tab ID

## Important Quirks

### browser.tabs Not Available in Content Script

In Firefox, content scripts cannot call `browser.tabs.query()`. If you need the current tab ID from content script, you must ask the background script via:
```typescript
browser.runtime.sendMessage({ type: "GET_CURRENT_TAB_ID" })
```

### Inline Styles Required

Firefox may not apply CSS injected via `<style>` tags in content scripts. Use inline `style.cssText` for all UI elements:
```typescript
element.style.cssText = "position: fixed !important; top: 20px !important; ..."
```

### Session Persistence

Session ID is stored in `browser.storage.local`, NOT in memory. This means:
- Page reload doesn't clear session
- Tab close does clear session (storage is per-tab)
- Changing projects doesn't affect current session

## Message Types

### Extension → Background
- `SEND_PROMPT` - Send edit request to wsbridge
- `GET_SESSIONS` - Fetch available sessions from OpenCode
- `STORE_SESSION` - Store sessionId for a tab
- `CLEAR_SESSION` - Clear sessionId for a tab (use /new command)
- `GET_CURRENT_TAB_ID` - Get current tab ID

### Background → Extension
- `START_SELECTION` - Trigger element selection mode
- `SESSION_CREATED` - New session was created
- `SESSIONS_LIST` - List of available sessions
- `ERROR` - Error occurred
- `STATUS_UPDATE` - Progress update

### WSBridge ↔ Background (WebSocket)
- `GET_PROJECTS` - Request project list
- `GET_SESSIONS` - Request session list
- `EDIT_REQUEST` - Send edit prompt to OpenCode
- `SESSIONS_LIST` / `PROJECTS_LIST` - Response data

## File Reference

| File | Purpose |
|------|---------|
| `content.ts` | DOM selection, element capture, chat modal UI, session management |
| `background.ts` | Service worker, WebSocket client, message routing, tab ID management |
| `popup.ts` | Project selection dropdown, save/load from storage |
| `storage.ts` | Helper functions for `browser.storage.local` |
| `index.ts` (wsbridge) | WebSocket server, OpenCode SDK integration, session handling |

## Testing Changes

1. Make your changes to source files
2. Run `npm run build --workspace=@opointer/extension`
3. Reload the extension in browser (about:addons for Firefox)
4. Refresh the webpage (content script is injected at page load)

If testing WSBridge changes:
1. Make changes to `packages/wsbridge/src/index.ts`
2. Run `npm run build --workspace=@opointer/wsbridge`
3. Restart the wsbridge process

## Common Issues

### "Could not establish connection. Receiving end does not exist"

The content script isn't ready to receive messages. Make sure:
1. Page is refreshed after extension reload
2. Tab ID is correctly passed through the message chain

### Session created in wrong project

Check that `currentProjectDir` in content script is updated when user changes project in popup. The popup sends `PROJECT_CHANGED` message to content script on save.

### Dropdown not visible

Use inline styles (`style.cssText`) instead of CSS classes for Firefox compatibility.