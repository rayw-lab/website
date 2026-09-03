import { chromium } from '@playwright/test';

const OUT = '/Users/wanglei/studio-data-root/worktrees/website-nexus-hall/evidence/nexus-hall/anchors/W1';
const BASE = 'http://localhost:4611/website/world-spike/nexus-ink/';

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
page.on('console', (m) => console.log('[page]', m.type(), m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));

for (const t of [2, 8]) {
  await page.goto(`${BASE}?demo=yin&t=${t}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const state = await page.evaluate(() => ({
    ready: document.documentElement.dataset.inkReady ?? null,
    fallback: document.documentElement.dataset.inkFallback ?? null,
    demo: document.documentElement.dataset.inkDemo ?? null,
    hud: document.getElementById('hud')?.textContent ?? null,
  }));
  console.log(`t=${t}`, JSON.stringify(state));
  const canvas = await page.$('#ink');
  if (canvas) await canvas.screenshot({ path: `${OUT}/spike-r2-yin-t${t}.png` });
}

// 减动效终态：必须不起 rAF
const rm = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
let rafCount = 0;
await rm.exposeFunction('__rafTick', () => { rafCount++; });
await rm.goto(BASE, { waitUntil: 'networkidle' });
await rm.waitForTimeout(1200);
const rmState = await rm.evaluate(() => ({
  fallback: document.documentElement.dataset.inkFallback ?? null,
  ready: document.documentElement.dataset.inkReady ?? null,
  canvasHidden: getComputedStyle(document.getElementById('ink')).display,
}));
console.log('reduced-motion', JSON.stringify(rmState));

await browser.close();
