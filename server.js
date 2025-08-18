const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const port = process.env.PORT || 3000;
const baseDir = __dirname;

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

http.createServer((req, res) => {
  let filePath = path.join(baseDir, req.url === '/' ? 'index.html' : req.url);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    const isHTML = ext === '.html';
    const cacheControl = isHTML ? 'public, max-age=0' : 'public, max-age=31536000';
    const headers = {
      'Content-Type': contentType,
      'Cache-Control': cacheControl
    };
    const enc = req.headers['accept-encoding'] || '';
    if (enc.includes('br')) {
      headers['Content-Encoding'] = 'br';
      res.writeHead(200, headers);
      zlib.brotliCompress(content, (e, buf) => res.end(e ? content : buf));
    } else if (enc.includes('gzip')) {
      headers['Content-Encoding'] = 'gzip';
      res.writeHead(200, headers);
      zlib.gzip(content, (e, buf) => res.end(e ? content : buf));
    } else {
      res.writeHead(200, headers);
      res.end(content);
    }
  });
}).listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
