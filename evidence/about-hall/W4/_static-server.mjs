import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const dist = path.resolve(import.meta.dirname, '../../../dist');
const port = 4616;
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.xml': 'application/xml',
};
http.createServer((req, res) => {
  let url = decodeURIComponent((req.url || '/').split('?')[0]);
  if (url.startsWith('/website/')) url = url.slice('/website'.length);
  if (!url || url === '/') url = '/index.html';
  if (url.endsWith('/')) url += 'index.html';
  const file = path.normalize(path.join(dist, url));
  if (!file.startsWith(dist)) { res.statusCode = 403; res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.statusCode = 404; res.end('not found'); return; }
    res.setHeader('content-type', types[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
}).listen(port, '127.0.0.1', () => console.log('ready ' + port));
