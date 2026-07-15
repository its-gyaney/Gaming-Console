import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'

const root = join(process.cwd(), 'dist')
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' }

createServer((req, res) => {
  let path = normalize(join(root, req.url.split('?')[0]))
  if (!path.startsWith(root) || !existsSync(path) || statSync(path).isDirectory()) path = join(root, 'index.html')
  res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' })
  createReadStream(path).pipe(res)
}).listen(process.env.PORT || 3000, () => console.log('Arcadia running on port ' + (process.env.PORT || 3000)))
