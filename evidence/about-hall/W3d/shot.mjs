import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const PORT = Number(process.env.W3D_PORT || 4630);
const ROOT = path.resolve(import.meta.dirname, '../../..');
const OUT = path.resolve(ROOT, 'evidence/about-hall/W3d');
mkdirSync(OUT, { recursive: true });
const HALL = `http://127.0.0.1:${PORT}/website/world/about-pavilion/`;
const HIDE_TOOLBAR = 'astro-dev-toolbar, #dev-toolbar-root { display: none !important; }';

async function shotScene(page, scene, { mid = true, wait = 1200 } = {}) {
  const el = page.locator(`[data-scene="${scene}"]`);
  await el.evaluate((node, useMid) => {
    const y = node.getBoundingClientRect().top + window.scrollY;
    const travel = Math.max(0, node.offsetHeight - window.innerHeight);
    window.scrollTo(0, useMid ? y + travel * 0.58 : y);
  }, mid);
  await page.waitForTimeout(wait);
}

async function clipCurator(page, file) {
  const box = await page.locator('[data-curator]').boundingBox();
  if (!box) return null;
  await page.screenshot({
    path: path.join(OUT, file),
    clip: {
      x: Math.max(0, box.x - 12),
      y: Math.max(0, box.y - 12),
      width: box.width + 24,
      height: box.height + 24,
    },
  });
  return box;
}

const browser = await chromium.launch();
const consoleErrors = [];

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.addInitScript(() => {
    localStorage.setItem(
      'astro:dev-toolbar:settings',
      JSON.stringify({ placement: 'bottom-left', disableApp: true }),
    );
  });
  desktop.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  desktop.on('pageerror', (err) => consoleErrors.push(String(err)));
  await desktop.goto(HALL, { waitUntil: 'networkidle' });
  await desktop.addStyleTag({ content: HIDE_TOOLBAR });
  await desktop.locator('section.hall-hero h1').waitFor();
  await desktop.waitForTimeout(600);
  const atHero = await desktop.evaluate(() => {
    const host = document.querySelector('[data-curator]');
    return {
      on: host instanceof HTMLElement ? host.classList.contains('is-on') : false,
      canvas: Boolean(host?.querySelector('canvas')),
    };
  });

  await shotScene(desktop, 's4', { wait: 2000 });
  await desktop.waitForSelector('[data-curator].is-on canvas', { timeout: 12_000 });
  await desktop.waitForTimeout(400);
  const atStations = await desktop.evaluate(() => {
    const host = document.querySelector('[data-curator]');
    const stage = host?.querySelector('[data-curator-stage]');
    const canvas = host?.querySelector('canvas');
    const frame = document.querySelector('[data-scene="s4"] .hall-station-frame');
    const hr = host instanceof HTMLElement ? host.getBoundingClientRect() : null;
    const fr = frame instanceof HTMLElement ? frame.getBoundingClientRect() : null;
    return {
      on: host instanceof HTMLElement ? host.classList.contains('is-on') : false,
      htmlOn: document.documentElement.getAttribute('data-hall-curator'),
      lift: host instanceof HTMLElement ? host.dataset.curatorLift : '',
      scene: host instanceof HTMLElement ? host.dataset.curatorScene : '',
      stageW: stage instanceof HTMLElement ? stage.clientWidth : 0,
      stageH: stage instanceof HTMLElement ? stage.clientHeight : 0,
      canvasW: canvas instanceof HTMLCanvasElement ? canvas.width : 0,
      canvasH: canvas instanceof HTMLCanvasElement ? canvas.height : 0,
      curatorX: hr ? Math.round(hr.x) : null,
      frameRight: fr ? Math.round(fr.right) : null,
      gap: hr && fr ? Math.round(hr.x - fr.right) : null,
    };
  });
  await desktop.screenshot({ path: path.join(OUT, 'shot-stations.png'), fullPage: false });
  await clipCurator(desktop, 'shot-curator-s4.png');

  await shotScene(desktop, 's8', { mid: false, wait: 1400 });
  const atS8 = await desktop.evaluate(() => {
    const host = document.querySelector('[data-curator]');
    const rail = document.querySelector('[data-station-rail]');
    const footer = document.querySelector('.site-footer');
    const fr = footer?.getBoundingClientRect();
    return {
      on: host instanceof HTMLElement ? host.classList.contains('is-on') : false,
      scene: host instanceof HTMLElement ? host.dataset.curatorScene : '',
      railAway: rail instanceof HTMLElement ? rail.classList.contains('is-away') : null,
      footerTop: fr ? Math.round(fr.top) : null,
      innerHeight,
    };
  });
  await clipCurator(desktop, 'shot-curator-s8.png');

  await desktop.locator('.site-footer').scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(500);
  await desktop.screenshot({ path: path.join(OUT, 'shot-epilogue.png'), fullPage: false });
  const atFooter = await desktop.evaluate(() => {
    const host = document.querySelector('[data-curator]');
    const rail = document.querySelector('[data-station-rail]');
    return {
      on: host instanceof HTMLElement ? host.classList.contains('is-on') : false,
      railAway: rail instanceof HTMLElement ? rail.classList.contains('is-away') : null,
      curatorOpacity: host ? getComputedStyle(host).opacity : '',
      railOpacity: rail ? getComputedStyle(rail).opacity : '',
    };
  });

  const reduced = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await reduced.addInitScript(() => {
    localStorage.setItem(
      'astro:dev-toolbar:settings',
      JSON.stringify({ placement: 'bottom-left', disableApp: true }),
    );
  });
  await reduced.emulateMedia({ reducedMotion: 'reduce' });
  await reduced.goto(`${HALL}?from=city&poi=about-pavilion`, { waitUntil: 'load' });
  await reduced.addStyleTag({ content: HIDE_TOOLBAR });
  await reduced.waitForTimeout(400);
  await reduced.locator('[data-scene="s1"]').evaluate((node) => {
    node.scrollIntoView({ block: 'center' });
  });
  await reduced.waitForTimeout(400);
  const animReport = await reduced.evaluate(() => {
    const anims = document.getAnimations();
    return {
      total: anims.length,
      running: anims.filter((a) => a.playState === 'running').length,
      names: anims.map((a) =>
        'animationName' in a ? String(a.animationName) : a.constructor.name,
      ),
    };
  });
  writeFileSync(path.join(OUT, 'reduced-motion-animations.json'), `${JSON.stringify(animReport, null, 2)}\n`);

  const mid = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await mid.addInitScript(() => {
    localStorage.setItem(
      'astro:dev-toolbar:settings',
      JSON.stringify({ placement: 'bottom-left', disableApp: true }),
    );
  });
  await mid.goto(HALL, { waitUntil: 'networkidle' });
  await mid.addStyleTag({ content: HIDE_TOOLBAR });
  await shotScene(mid, 's4', { wait: 1800 });
  await mid.waitForSelector('[data-curator].is-on canvas', { timeout: 12_000 });
  const at1280 = await mid.evaluate(() => {
    const host = document.querySelector('[data-curator]');
    const frame = document.querySelector('[data-scene="s4"] .hall-station-frame');
    const hr = host instanceof HTMLElement ? host.getBoundingClientRect() : null;
    const fr = frame instanceof HTMLElement ? frame.getBoundingClientRect() : null;
    return {
      htmlOn: document.documentElement.getAttribute('data-hall-curator'),
      curatorX: hr ? Math.round(hr.x) : null,
      frameRight: fr ? Math.round(fr.right) : null,
      gap: hr && fr ? Math.round(hr.x - fr.right) : null,
      stageW: host?.querySelector('[data-curator-stage]') instanceof HTMLElement
        ? host.querySelector('[data-curator-stage]').clientWidth
        : 0,
    };
  });
  await mid.screenshot({ path: path.join(OUT, 'shot-stations-1280.png'), fullPage: false });

  const report = { atHero, atStations, atS8, atFooter, at1280, animReport, consoleErrors };
  writeFileSync(path.join(OUT, 'console.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
