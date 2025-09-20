const http = require('http')
const fs = require('fs')
const path = require('path')
const dir = path.resolve(__dirname, '..', 'dist')
const port = 5173
const host = '127.0.0.1'

const s = http.createServer((req, res) => {
  let pathname = req.url.split('?')[0]
  if (pathname === '/' || pathname === '') pathname = '/index.html'
  const p = path.join(dir, pathname)
  fs.readFile(p, (err, data) => {
    if (err) {
      res.statusCode = 404
      res.end('Not found')
      return
    }
    res.end(data)
  })
})

s.listen(port, host, () => console.log(`serving ${dir} on http://${host}:${port}`))
