const fs = require('fs')
const path = require('path')
const logger = require('./lib/util/logger')('app/routes')

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
    return fs.createReadStream('./out/index.html').pipe(res)
  }
  next()
})

// /assets/* (Vite build output)
use((req, res, next) => {
  if (req.asPath.startsWith('/assets/')) {
    const fpath = path.join('./out', req.asPath)
    if (fs.existsSync(fpath) && !fs.statSync(fpath).isDirectory()) {
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
    const fpath = path.join('./', req.asPath)
    if (fs.existsSync(fpath)) {
      return sendFile(res, fpath)
    } else {
      logger.error('No such file:', req.asPath, req.mkcss, req.hicss)
    }
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

      const  mingw_home=process.env.MINGW_HOME;
      if (mingw_home){
        if(! fileDir.includes(':')){
          // fileDir is unix-like:      /Z/x/y/...., 'Z' means Z:
          // the win-like fileDir should be: Z:\x\y...
          const cygpath = 'cygpath.exe'
          const cmd=cygpath+' -w'+' -a '+fileDir ;
          logger.info('cmd',cmd)
       
          const { execSync } = require('node:child_process');
          const result = execSync(cmd);
          fileDir=result.toString('utf8').replace('\n','');

          logger.info('New fileDir',fileDir);
        }  
      }

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
  return fs.createReadStream(path.join('./out', '404.html')).pipe(res)
})

module.exports = function (req, res, next) {
  return routes.reduce((next, route) => route(req, res, next), next)()
}
