const SESSION_PREFIX = "session_"

export async function getProjectMappings(): Promise<Record<string, string>> {
  const result = await browser.storage.local.get("projectMappings")
  return (result.projectMappings as Record<string, string>) || {}
}

export async function setProjectMappings(mappings: Record<string, string>): Promise<void> {
  await browser.storage.local.set({ projectMappings: mappings })
}

export async function getSessionId(tabId: number): Promise<string | null> {
  const key = SESSION_PREFIX + tabId
  const result = await browser.storage.local.get(key)
  return result[key] || null
}

export async function setSessionId(tabId: number, sessionId: string | null): Promise<void> {
  const key = SESSION_PREFIX + tabId
  if (sessionId) {
    await browser.storage.local.set({ [key]: sessionId })
  } else {
    await browser.storage.local.remove(key)
  }
}
