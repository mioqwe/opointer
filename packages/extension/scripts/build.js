const esbuild = require('esbuild')
const fs = require('fs')
const path = require('path')

const target = process.argv[2] || 'firefox'
const projectRoot = path.resolve(__dirname, '..', '..', '..')
const distDir = path.join(projectRoot, 'dist', target)

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true })
}

const packageDir = path.resolve(__dirname, '..')
const assetsDir = path.join(packageDir, 'assets')
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true })
}

function createPlaceholderIcon(size, filename) {
  const filepath = path.join(assetsDir, filename)
  if (!fs.existsSync(filepath)) {
    const png = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, size, 0x00, 0x00, 0x00, size,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x91, 0x68, 0x36, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0x60, 0x60, 0xF8, 0x0F,
      0x00, 0x00, 0x01, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB4, 0x00, 0x00,
      0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ])
    fs.writeFileSync(filepath, png)
  }
}

createPlaceholderIcon(16, 'icon16.png')
createPlaceholderIcon(32, 'icon32.png')
createPlaceholderIcon(48, 'icon48.png')
createPlaceholderIcon(64, 'icon64.png')
createPlaceholderIcon(128, 'icon128.png')

async function build() {
  const manifest = JSON.parse(fs.readFileSync(path.join(packageDir, 'manifest.json'), 'utf8'))
  
  const browserTarget = target === 'chrome' ? 'chrome87' : 'firefox78'
  
  if (target === 'chrome') {
    manifest.manifest_version = 3
    manifest.permissions = ['activeTab', 'storage', 'commands', '<all_urls>']
    manifest.host_permissions = ['<all_urls>']
    manifest.action = manifest.browser_action
    delete manifest.browser_action
    delete manifest.browser_specific_settings
  } else {
    manifest.manifest_version = 2
    manifest.browser_action = {
      default_icon: manifest.icons,
      default_popup: "popup.html"
    }
    delete manifest.host_permissions
    delete manifest.action
    manifest.background = {
      scripts: ["background.js"]
    }
    delete manifest.background.service_worker
    manifest.browser_specific_settings = {
      gecko: {
        id: "@opointer-dom-editor",
        strict_min_version: "78.0"
      }
    }
  }

  fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2))

  await Promise.all([
    esbuild.build({
      entryPoints: [path.join(packageDir, 'src', 'background.ts')],
      bundle: true,
      outfile: path.join(distDir, 'background.js'),
      platform: 'browser',
      target: browserTarget,
      format: 'iife',
      sourcemap: false,
      minify: false,
    }),
    esbuild.build({
      entryPoints: [path.join(packageDir, 'src', 'content.ts')],
      bundle: true,
      outfile: path.join(distDir, 'content.js'),
      platform: 'browser',
      target: browserTarget,
      format: 'iife',
      sourcemap: false,
      minify: false,
    }),
    esbuild.build({
      entryPoints: [path.join(packageDir, 'src', 'popup.ts')],
      bundle: true,
      outfile: path.join(distDir, 'popup.js'),
      platform: 'browser',
      target: browserTarget,
      format: 'iife',
      sourcemap: false,
      minify: false,
    })
  ])

  const assetsTarget = path.join(distDir, 'assets')
  if (!fs.existsSync(assetsTarget)) {
    fs.mkdirSync(assetsTarget, { recursive: true })
  }
  
  fs.readdirSync(assetsDir).forEach(file => {
    fs.copyFileSync(path.join(assetsDir, file), path.join(assetsTarget, file))
  })

  fs.copyFileSync(path.join(packageDir, 'src', 'popup.html'), path.join(distDir, 'popup.html'))

  console.log(`Built for ${target}`)
}

build().catch(err => {
  console.error(err)
  process.exit(1)
})
