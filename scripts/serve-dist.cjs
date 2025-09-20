const http = require('http')
const fs = require('fs')
const path = require('path')
const dir = path.resolve(__dirname, '..', 'dist')
const port = 5173
const host = '127.0.0.1'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
}

const s = http.createServer((req, res) => {
  let pathname = req.url.split('?')[0]
  if (pathname === '/' || pathname === '') pathname = '/index.html'
  const p = path.join(dir, pathname)
  fs.readFile(p, (err, data) => {
    if (err) {
      // SPA fallback: if the request accepts HTML, serve index.html so client-side router can handle the route
      const accept = (req.headers['accept'] || '')
      if (accept.includes('text/html')) {
        const indexFile = path.join(dir, 'index.html')
        return fs.readFile(indexFile, (ie, idata) => {
          if (ie) {
            res.statusCode = 500
            res.end('Index file missing')
            return
          }
          res.setHeader('Content-Type', MIME['.html'])
          res.statusCode = 200
          res.end(idata)
        })
      }
      res.statusCode = 404
      res.end('Not found')
      return
    }
    const ext = path.extname(p)
    if (MIME[ext]) res.setHeader('Content-Type', MIME[ext])
    res.end(data)
  })
})

s.listen(port, host, () => console.log(`serving ${dir} on http://${host}:${port}`))
