import { instance } from '@viz-js/viz'

let vizSingleton = null

async function getViz() {
  if (!vizSingleton) {
    vizSingleton = await instance()
  }
  return vizSingleton
}

const dot = (md) => {
  const temp = md.renderer.rules.fence.bind(md.renderer.rules)
  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const token = tokens[idx]
    try {
      if (token.info && (token.info.trim() === 'dot' || token.info.trim() === 'graphviz')) {
        const code = token.content.trim()
        return `<div class="dot">${code}</div>`
      }
    } catch (e) {
      console.error(`Parse flowchart Error: `, e)
    }
    return temp(tokens, idx, options, env, slf)
  }
}

export const renderDot = async () => {
  const list = document.querySelectorAll('.dot')
  if (!list || !list.length) {
    return
  }
  let viz
  try {
    viz = await getViz()
  } catch (e) {
    console.error('Viz init error:', e)
    return
  }
  for (const item of list) {
    const src = item.textContent.trim()
    if (!src) {
      continue
    }
    try {
      const el = await viz.renderSVGElement(src)
      item.textContent = ''
      item.appendChild(el)
    } catch (e) {
      console.error(`Parse dot Error: ${e}`)
    }
  }
}

export default dot
