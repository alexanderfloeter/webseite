const http = require('http');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const port = process.env.PORT || 3000;
const baseDir = path.resolve(__dirname);

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.json': 'application/json'
};

const cache = new Map();
const MAX_CACHE_SIZE = 1024 * 1024; // 1MB

async function sendFile(res, filePath) {
  try {
    const stats = await fsp.stat(filePath);
    if (!stats.isFile()) throw new Error('Not file');

    const cached = cache.get(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    if (cached && cached.mtimeMs === stats.mtimeMs) {
      res.writeHead(200, { 'Content-Type': cached.contentType });
      res.end(cached.data);
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });

    if (stats.size <= MAX_CACHE_SIZE) {
      const data = await fsp.readFile(filePath);
      cache.set(filePath, { data, mtimeMs: stats.mtimeMs, contentType });
      res.end(data);
    } else {
      fs.createReadStream(filePath).pipe(res);
    }
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}

http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  const safePath = path.normalize(urlPath).replace(/^\/+/, '');
  let filePath = path.join(baseDir, safePath);

  if (!filePath.startsWith(baseDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  if (safePath === '/' || safePath === '') {
    filePath = path.join(baseDir, 'index.html');
  }

  sendFile(res, filePath);
}).listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
