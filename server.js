const http = require('http');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

// Server configuration
const PORT = process.env.PORT || 3000;
const BASE_DIR = path.resolve(__dirname);

// MIME types for common file extensions
const MIME_TYPES = {
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
  '.json': 'application/json',
};

// Simple in-memory cache for small static files
const cache = new Map();
const MAX_CACHE_BYTES = 1024 * 1024; // 1MB

/**
 * Determine the Content-Type for a given file path.
 * @param {string} filePath
 * @returns {string}
 */
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * Serve a file with basic caching support.
 * @param {http.ServerResponse} res
 * @param {string} filePath
 */
async function serveFile(res, filePath) {
  try {
    const stats = await fsp.stat(filePath);
    if (!stats.isFile()) throw new Error('Not file');

    const cached = cache.get(filePath);
    const contentType = getContentType(filePath);

    if (cached && cached.mtimeMs === stats.mtimeMs) {
      res.writeHead(200, { 'Content-Type': cached.contentType });
      res.end(cached.data);
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });

    if (stats.size <= MAX_CACHE_BYTES) {
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

/**
 * Handle incoming HTTP requests by resolving the
 * requested path and serving the appropriate file.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function handleRequest(req, res) {
  const urlPath = req.url.split('?')[0];
  const safePath = path.normalize(urlPath).replace(/^\/+/, '');
  let filePath = path.join(BASE_DIR, safePath);

  if (!filePath.startsWith(BASE_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  if (safePath === '/' || safePath === '') {
    filePath = path.join(BASE_DIR, 'index.html');
  }

  serveFile(res, filePath);
}

http.createServer(handleRequest).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
