import { chromium, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const PORT = Number(process.env.E2E_PORT || 4634);
const ORIGIN = `http://127.0.0.1:${PORT}`;
const BASE = '/website';
const OUT = path.resolve(import.meta.dirname);
mkdirSync(OUT, { recursive: true });

const CITY = `${ORIGIN}${BASE}/?poi=about-pavilion`;
const HIDE_TOOLBAR = 'astro-dev-toolbar, #dev-toolbar-root { display: none !important; }';
const MOUNT_TIMEOUT = 210_000;

const log = [];
const note = (msg) => {
  const line = `[t1b-shot] ${msg}`;
  log.push(line);
  console.info(line);
};

async function readDump(page) {
  return page.evaluate(() => {
    const ws = window.__worldSession;
    if (!ws) throw new Error('__worldSession 未挂载');
    return ws.dump();
  });
}

async function mountWorld(page) {
  const host = page.locator('[data-world-host]');
  await expect(host).toBeVisible({ timeout: 60_000 });
  try {
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: 90_000 });
  } catch {
    await host.locator('[data-world-enter]').click();
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
  }
}

async function waitPoiIn(page, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const dump = await readDump(page);
    if (dump.funnel.firstPoiIn !== null) return dump;
    await page.waitForTimeout(500);
  }
  throw new Error('firstPoiIn 超时');
}

async function pressEUntilShot(page, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const dump = await readDump(page);
    if (dump.events.some((e) => e.type === 'shot-apply')) return dump;
    await page.keyboard.press('e');
    await page.waitForTimeout(400);
  }
  throw new Error('shot-apply 超时');
}

async function captureOverlay(page, file) {
  const deadline = Date.now() + 240_000;
  while (Date.now() < deadline) {
    const on = await page.evaluate(() =>
      document.documentElement.classList.contains('world-poi-hold-pulse'),
    );
    if (on) {
      await page.screenshot({ path: path.join(OUT, file), fullPage: false });
      return true;
    }
    await page.waitForTimeout(40);
  }
  return false;
}

const browser = await chromium.launch({
  args: ['--autoplay-policy=no-user-gesture-required', '--enable-unsafe-swiftshader'],
});

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => {
    localStorage.setItem(
      'astro:dev-toolbar:settings',
      JSON.stringify({ placement: 'bottom-left', disableApp: true }),
    );
    sessionStorage.setItem(
      'world-arrival-v1',
      JSON.stringify({
        v: 1,
        poi: 'about-pavilion',
        sessionId: 't1b-shot',
        t: 1,
        exploreN: 2,
        exploreTotal: 12,
        wroteAt: Date.now(),
        maxKmh: 96,
        coneHits: 3,
      }),
    );
    localStorage.setItem('world-explore-v1', JSON.stringify(['about-pavilion', 'autodrive-lab']));
  });
  await page.goto(CITY, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.addStyleTag({ content: HIDE_TOOLBAR });
  await mountWorld(page);
  await waitPoiIn(page);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, '01-spawn.png'), fullPage: false });
  note('wrote 01-spawn.png');

  await pressEUntilShot(page);
  const overlayOk = await captureOverlay(page, '02-hold-overlay.png');
  note(`02-hold-overlay.png captured=${overlayOk}`);
  if (!overlayOk) {
    await page.screenshot({ path: path.join(OUT, '02-hold-overlay.png'), fullPage: false });
  }

  await page.waitForURL(/\/world\/about-pavilion\//, { timeout: 180_000 });
  await page.locator('[data-hall-chrome]').waitFor({ state: 'visible', timeout: 15_000 });
  await page.addStyleTag({ content: HIDE_TOOLBAR });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, '03-hall-chrome.png'), fullPage: false });
  note('wrote 03-hall-chrome.png');
  await page.close();

  const rm = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await rm.emulateMedia({ reducedMotion: 'reduce' });
  await rm.addInitScript(() => {
    localStorage.setItem(
      'astro:dev-toolbar:settings',
      JSON.stringify({ placement: 'bottom-left', disableApp: true }),
    );
  });
  await rm.goto(CITY, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await rm.addStyleTag({ content: HIDE_TOOLBAR });
  await mountWorld(rm);
  await waitPoiIn(rm);
  await pressEUntilShot(rm);
  await rm.waitForTimeout(800);
  const rmOn = await rm.evaluate(() =>
    document.documentElement.classList.contains('world-poi-hold-pulse'),
  );
  await rm.screenshot({ path: path.join(OUT, '04-hold-reduced.png'), fullPage: false });
  note(`wrote 04-hold-reduced.png overlayOn=${rmOn}`);
  if (rmOn) throw new Error('reduced-motion 不应出现 hold overlay 类');
  await rm.close();
} finally {
  writeFileSync(path.join(OUT, 'shot-log.txt'), `${log.join('\n')}\n`);
  await browser.close();
}
