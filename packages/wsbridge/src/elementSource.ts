export interface ElementSourceInfo {
  filePath: string | null
  lineNumber: number | null
  columnNumber: number | null
  componentName: string | null
}

function extractComponentNameFromFilePath(filePath: string | null): string {
  if (!filePath) return "unknown"
  const match = filePath.match(/([^\/]+)\.svelte$/i)
  return match ? match[1] : filePath.split("/").pop() || "unknown"
}

export function formatSourceContext(
  sourceInfo: ElementSourceInfo | null,
  componentStack: ElementSourceInfo[],
  xPath: string
): string {
  if (!sourceInfo) {
    return `XPath: ${xPath}`
  }
  
  const primaryName = sourceInfo.componentName || extractComponentNameFromFilePath(sourceInfo.filePath)
  const primaryLocation = `${sourceInfo.filePath || 'unknown'}:${sourceInfo.lineNumber ?? '?'}:${sourceInfo.columnNumber ?? '?'}`
  
  if (componentStack.length === 0) {
    return `Source: ${primaryName} @ ${primaryLocation}

Fallback XPath: ${xPath}`
  }
  
  const frames = componentStack.map(f => {
    const name = f.componentName || extractComponentNameFromFilePath(f.filePath)
    const loc = `${f.filePath || 'unknown'}:${f.lineNumber ?? '?'}:${f.columnNumber ?? '?'}`
    return `  - ${name} (at ${loc})`
  }).join("\n")
  
  return `Component stack:
${frames}

Primary: ${primaryName} @ ${primaryLocation}

Fallback XPath: ${xPath}`
}