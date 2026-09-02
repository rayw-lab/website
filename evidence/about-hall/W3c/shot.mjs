import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const PORT = 4617;
const ROOT = path.resolve(import.meta.dirname, '../../..');
const OUT = path.resolve(ROOT, 'evidence/about-hall/W3c');
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

async function shotScene(page, scene, file, { mid = true } = {}) {
  const el = page.locator(`[data-scene="${scene}"]`);
  await el.evaluate((node, useMid) => {
    const y = node.getBoundingClientRect().top + window.scrollY;
    const travel = Math.max(0, node.offsetHeight - window.innerHeight);
    window.scrollTo(0, useMid ? y + travel * 0.58 : y);
  }, mid);
  await page.waitForTimeout(500);
  const img = el.locator('img').first();
  if ((await img.count()) > 0) {
    await img.evaluate((node) => node instanceof HTMLImageElement && node.decode().catch(() => {}));
  }
  await page.screenshot({ path: path.join(OUT, file), fullPage: false });
}

try {
  await waitReady();
  const browser = await chromium.launch();

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto(HALL, { waitUntil: 'load' });
  await desktop.locator('h1').waitFor();

  await shotScene(desktop, 's1', 'shot-s1-desktop.png');
  await shotScene(desktop, 's3', 'shot-s3-desktop.png');
  await shotScene(desktop, 's5', 'shot-s5-desktop.png');
  await shotScene(desktop, 's7', 'shot-crystal-desktop.png', { mid: false });
  await desktop.locator('.hall-avatar-note').scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(300);
  await desktop.screenshot({
    path: path.join(OUT, 'shot-epilogue-desktop.png'),
    fullPage: false,
  });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(HALL, { waitUntil: 'load' });
  await mobile.locator('h1').waitFor();
  await shotScene(mobile, 's3', 'shot-s3-mobile-390.png');

  const reduced = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await reduced.emulateMedia({ reducedMotion: 'reduce' });
  await reduced.goto(`${HALL}?from=city&poi=about-pavilion`, { waitUntil: 'load' });
  await reduced.waitForTimeout(400);
  const animReport = await reduced.evaluate(() => {
    const anims = document.getAnimations();
    return {
      total: anims.length,
      running: anims.filter((a) => a.playState === 'running').length,
      states: anims.map((a) => a.playState),
      names: anims.map((a) =>
        'animationName' in a ? String(a.animationName) : a.constructor.name,
      ),
    };
  });
  writeFileSync(path.join(OUT, 'reduced-motion-animations.json'), JSON.stringify(animReport, null, 2));
  console.log(
    JSON.stringify({
      pid: child.pid,
      port: PORT,
      animReport,
      keepAlive: process.env.W3C_KEEP_SERVER === '1',
    }),
  );

  await browser.close();
  if (process.env.W3C_KEEP_SERVER !== '1') killPreview();
} catch (err) {
  killPreview();
  throw err;
}
