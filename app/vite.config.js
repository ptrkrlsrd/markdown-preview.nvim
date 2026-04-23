const path = require('path')
const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')

module.exports = defineConfig({
  plugins: [react()],
  root: path.join(__dirname, 'client'),
  publicDir: false,
  build: {
    outDir: path.join(__dirname, 'out'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.join(__dirname, 'client/index.html'),
        notFound: path.join(__dirname, 'client/404.html'),
      },
    },
  },
})
