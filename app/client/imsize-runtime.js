const fn = globalThis['markdown-it-imsize.js']

export default typeof fn === 'function' ? fn : (md) => md
