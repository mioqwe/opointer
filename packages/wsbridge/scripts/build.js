import * as esbuild from 'esbuild'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

await esbuild.build({
  entryPoints: [path.join(__dirname, '..', 'src', 'index.ts')],
  bundle: true,
  outfile: path.join(__dirname, '..', 'dist', 'index.js'),
  platform: 'node',
  target: 'node20',
  format: 'esm',
  sourcemap: true,
  external: ['ws', '@modelcontextprotocol/sdk', '@opencode-ai/sdk']
})

console.log('Built MCP server')
