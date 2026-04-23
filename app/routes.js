const fs = require('fs')
const path = require('path')
const logger = require('./lib/util/logger')('app/routes')

function fileUnderRoot (rootDir, relativePath) {
  const clean = String(relativePath || '').replace(/^\/+/, '').replace(/\0/g, '')
  const rootNorm = path.resolve(rootDir)
  const full = path.resolve(rootNorm, clean)
  const prefix = rootNorm.endsWith(path.sep) ? rootNorm : rootNorm + path.sep
  if (full !== rootNorm && !full.startsWith(prefix)) {
    return null
  }
  return full
}

function contentTypeForPath (fpath) {
  switch (path.extname(fpath).toLowerCase()) {
    case '.js':
    case '.mjs':
    case '.cjs':
      return 'application/javascript; charset=utf-8'
    case '.css':
      return 'text/css; charset=utf-8'
    case '.html':
    case '.htm':
      return 'text/html; charset=utf-8'
    case '.json':
      return 'application/json; charset=utf-8'
    case '.svg':
      return 'image/svg+xml'
    case '.ico':
      return 'image/x-icon'
    case '.woff':
      return 'font/woff'
    case '.woff2':
      return 'font/woff2'
    case '.ttf':
      return 'font/ttf'
    case '.map':
      return 'application/json'
    default:
      return ''
  }
}

function sendFile (res, fpath) {
  const ct = contentTypeForPath(fpath)
  if (ct) {
    res.setHeader('Content-Type', ct)
  }
  return fs.createReadStream(fpath).pipe(res)
}

const routes = []

const use = function (route) {
  routes.unshift((req, res, next) => () => route(req, res, next))
}

// /page/:number
use((req, res, next) => {
  if (/\/page\/\d+/.test(req.asPath)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    const indexHtml = path.resolve(process.cwd(), 'out', 'index.html')
    return fs.createReadStream(indexHtml).pipe(res)
  }
  next()
})

// /assets/* (Vite build output)
use((req, res, next) => {
  if (req.asPath.startsWith('/assets/')) {
    const rel = req.asPath.slice('/assets/'.length)
    const fpath = fileUnderRoot(path.resolve(process.cwd(), 'out', 'assets'), rel)
    if (fpath && fs.existsSync(fpath) && !fs.statSync(fpath).isDirectory()) {
      return sendFile(res, fpath)
    }
  }
  next()
})

// /_static/markdown.css
// /_static/highlight.css
use((req, res, next) => {
  try {
    if (req.mkcss && req.asPath === '/_static/markdown.css') {
      if (fs.existsSync(req.mkcss)) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8')
        return fs.createReadStream(req.mkcss).pipe(res)
      }
    } else if (req.hicss && req.asPath === '/_static/highlight.css') {
      if (fs.existsSync(req.hicss)) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8')
        return fs.createReadStream(req.hicss).pipe(res)
      }
    }
  } catch (e) {
    logger.error('load diy css fail: ', req.asPath, req.mkcss, req.hicss)
  }
  next()
})

// /_static/path
use((req, res, next) => {
  if (/\/_static/.test(req.asPath)) {
    const rel = req.asPath.replace(/^\/_static\/?/, '')
    const fpath = fileUnderRoot(path.resolve(process.cwd(), '_static'), rel)
    if (fpath && fs.existsSync(fpath) && !fs.statSync(fpath).isDirectory()) {
      return sendFile(res, fpath)
    }
    logger.error('No such file:', req.asPath, req.mkcss, req.hicss)
  }
  next()
})

// images
use(async (req, res, next) => {
  logger.info('image route: ', req.asPath)
  const reg = /^\/_local_image_/
  if (reg.test(req.asPath) && req.asPath !== '') {
    const plugin = req.plugin
    const buffers = await plugin.nvim.buffers
    const buffer = buffers.find(b => b.id === Number(req.bufnr))
    if (buffer) {
      let fileDir = ''
      if (req.custImgPath !== '' ){
        fileDir = req.custImgPath
      } else {
        fileDir = await plugin.nvim.call('expand', `#${req.bufnr}:p:h`)
      }

      logger.info('fileDir', fileDir)

      let imgPath = decodeURIComponent(decodeURIComponent(req.asPath.replace(reg, '')))
      imgPath = imgPath.replace(/\\ /g, ' ')
      if (imgPath[0] !== '/' && imgPath[0] !== '\\') {
        imgPath = path.join(fileDir, imgPath)
      } else if (!fs.existsSync(imgPath)) {
        let tmpDirPath = fileDir
        while (tmpDirPath !== '/' && tmpDirPath !== '\\') {
          tmpDirPath = path.normalize(path.join(tmpDirPath, '..'))
          let tmpImgPath = path.join(tmpDirPath, imgPath)
          if (fs.existsSync(tmpImgPath)) {
            imgPath = tmpImgPath
            break
          }
        }
      }
      logger.info('imgPath', imgPath);
      
      if (fs.existsSync(imgPath) && !fs.statSync(imgPath).isDirectory()) {
        if (imgPath.endsWith('svg')) {
          res.setHeader('content-type', 'image/svg+xml')
        }
        return fs.createReadStream(imgPath).pipe(res)
      }
      logger.error('image not exists: ', imgPath)
    }
  }
  next()
})

// 404
use((req, res) => {
  res.statusCode = 404
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  const notFound = fileUnderRoot(path.resolve(process.cwd(), 'out'), '404.html')
  if (notFound && fs.existsSync(notFound)) {
    return fs.createReadStream(notFound).pipe(res)
  }
  res.end('Not found')
})

module.exports = function (req, res, next) {
  return routes.reduce((next, route) => route(req, res, next), next)()
}
