const LEGACY_SCRIPTS = [
  '/_static/markdown-it-imsize.js',
  '/_static/underscore-min.js',
  '/_static/webfont.js',
  '/_static/snap.svg.min.js',
  '/_static/tweenlite.min.js',
  '/_static/mermaid.min.js',
  '/_static/sequence-diagram-min.js',
  '/_static/katex@0.15.3.js',
  '/_static/mhchem.min.js',
  '/_static/raphael@2.3.0.min.js',
  '/_static/flowchart@1.13.0.min.js',
  '/_static/viz.js',
  '/_static/full.render.js',
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
  for (const src of LEGACY_SCRIPTS) {
    await loadScript(src)
  }
  await import('./boot.jsx')
}

start()
