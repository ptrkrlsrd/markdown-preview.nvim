import './setup-globals.js'

const DIAGRAM_STACK_SCRIPTS = [
  '/_static/markdown-it-imsize.js',
  '/_static/snap.svg.min.js',
  '/_static/tweenlite.min.js',
  '/_static/raphael@2.3.0.min.js',
  '/_static/sequence-diagram-min.js',
]

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.onload = () => resolve()
    s.onerror = reject
    document.head.appendChild(s)
  })
}

async function start() {
  for (const src of DIAGRAM_STACK_SCRIPTS) {
    await loadScript(src)
  }
  await import('./boot.jsx')
}

start()
