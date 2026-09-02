import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const PORT = 4614;
const ROOT = path.resolve(import.meta.dirname, '../../..');
const OUT = path.resolve(ROOT, 'evidence/about-hall/W3a');
mkdirSync(OUT, { recursive: true });
const BASE = `http://127.0.0.1:${PORT}/website`;
const HALL = `${BASE}/world/about-pavilion/`;

const serverSrc = `
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const dist = ${JSON.stringify(path.join(ROOT, 'dist'))};
const port = ${PORT};
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
`;

const serverFile = path.join(OUT, '_static-server.mjs');
writeFileSync(serverFile, serverSrc);

const child = spawn(process.execPath, [serverFile], {
  cwd: ROOT,
  detached: true,
  stdio: 'ignore',
});
child.unref();

function killPreview() {
  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    /* already gone */
  }
}

async function waitReady() {
  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch(HALL);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error(`preview ${PORT} not ready`);
}

try {
  await waitReady();
  const browser = await chromium.launch();

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto(HALL, { waitUntil: 'load' });
  await desktop.locator('h1').waitFor();
  await desktop.screenshot({
    path: path.join(OUT, 'shot-hero-desktop.png'),
    fullPage: false,
  });

  await desktop.locator('[data-scene="s3"]').scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(400);
  await desktop.screenshot({
    path: path.join(OUT, 'shot-scene3-desktop.png'),
    fullPage: false,
  });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(HALL, { waitUntil: 'load' });
  await mobile.locator('h1').waitFor();
  await mobile.screenshot({
    path: path.join(OUT, 'shot-hero-mobile.png'),
    fullPage: false,
  });

  const headerBg = await desktop.evaluate(() => {
    const h = document.querySelector('.site-header');
    return h ? getComputedStyle(h).backgroundColor : null;
  });
  console.log(JSON.stringify({ headerBg, pid: child.pid }));

  await browser.close();
} finally {
  killPreview();
}
