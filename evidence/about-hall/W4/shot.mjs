import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const PORT = 4616;
const ROOT = path.resolve(import.meta.dirname, '../../..');
const OUT = path.resolve(ROOT, 'evidence/about-hall/W4');
mkdirSync(OUT, { recursive: true });
const BASE = `http://127.0.0.1:${PORT}/website`;
const ABOUT = `${BASE}/about/`;

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
      const res = await fetch(ABOUT);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error(`preview ${PORT} not ready`);
}

async function shot(page, name) {
  await page.goto(ABOUT, { waitUntil: 'load' });
  await page.locator('h1').waitFor();
  await page.screenshot({ path: path.join(OUT, name), fullPage: true });
}

try {
  await waitReady();
  const browser = await chromium.launch();

  const def = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await shot(def, 'shot-default.png');
  await def.close();

  const reduced = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await reduced.emulateMedia({ reducedMotion: 'reduce' });
  await shot(reduced, 'shot-reduced-motion.png');
  await reduced.close();

  const nojsCtx = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  });
  const nojs = await nojsCtx.newPage();
  await shot(nojs, 'shot-nojs.png');
  await nojsCtx.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await shot(mobile, 'shot-390.png');
  await mobile.close();

  console.log(JSON.stringify({ pid: child.pid, port: PORT, about: ABOUT }));
  await browser.close();
} finally {
  killPreview();
}
