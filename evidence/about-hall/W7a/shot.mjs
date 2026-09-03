import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const PORT = 4632;
const ROOT = path.resolve(import.meta.dirname, '../../..');
const OUT = path.resolve(ROOT, 'evidence/about-hall/W7a');
mkdirSync(OUT, { recursive: true });
const BASE = `http://127.0.0.1:${PORT}/website`;
const ABOUT = `${BASE}/about/`;
const HALL = `${BASE}/world/about-pavilion/`;

const consoleLog = [];

async function waitReady(url) {
  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`dev ${PORT} not ready for ${url}`);
}

function attachConsole(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleLog.push({ url: page.url(), type: 'console.error', text: msg.text() });
    }
  });
  page.on('pageerror', (err) => {
    consoleLog.push({ url: page.url(), type: 'pageerror', text: String(err) });
  });
}

await waitReady(ABOUT);
await waitReady(HALL);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
attachConsole(page);

await page.goto(ABOUT, { waitUntil: 'networkidle' });
await page.locator('.about-qlist').waitFor();
await page.locator('.about-qcard-teaser').first().waitFor();
await page.locator('.about-qlist').scrollIntoViewIfNeeded();
await page.locator('.about-qlist').screenshot({
  path: path.join(OUT, 'about-cards-collapsed.png'),
});

const firstCard = page.locator('.about-qcard').first();
await firstCard.hover();
await page.waitForTimeout(500);
await page.locator('.about-qlist').screenshot({
  path: path.join(OUT, 'about-cards-expanded.png'),
});

await page.goto(HALL, { waitUntil: 'networkidle' });
const crystal = page.locator('.hall-crystal');
await crystal.waitFor();
await crystal.scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await crystal.screenshot({ path: path.join(OUT, 'crystal-intersection.png') });

writeFileSync(path.join(OUT, 'console.json'), JSON.stringify(consoleLog, null, 2));
await browser.close();
console.log(JSON.stringify({ out: OUT, consoleErrors: consoleLog.length }));
