const esbuild = require('esbuild')
const path = require('path')

esbuild.build({
  entryPoints: [path.join(__dirname, '..', 'src', 'index.ts')],
  bundle: true,
  outfile: path.join(__dirname, '..', 'dist', 'index.js'),
  platform: 'node',
  target: 'node20',
  format: 'esm',
  sourcemap: true,
  external: ['ws', '@modelcontextprotocol/sdk', '@opencode-ai/sdk']
}).then(() => {
  console.log('Built MCP server')
}).catch(err => {
  console.error(err)
  process.exit(1)
})
