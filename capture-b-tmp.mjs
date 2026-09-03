import { chromium } from '@playwright/test';
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const pause = async (page) => { await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); }); };
// F1a: Q0 全效（默认挂载，robot_idle 后立即截——赶在 auto-drop 前）
await page.goto('http://127.0.0.1:4603/website/');
await page.waitForSelector('[data-world-host][data-state="ready"]', { timeout: 210000 });
await page.waitForSelector('[data-world-host][data-world-state="robot_idle"]', { timeout: 120000 });
const q0 = await page.evaluate(() => (window as any).__worldSession?.dump()?.env?.quality);
console.log('Q0-frame quality =', q0);
await pause(page);
await page.screenshot({ path: 'test-results/sky-forensic/q0-full.png' });
// F1b: 同机位 Q2 兜底（layerMix=0，深链）
await page.goto('http://127.0.0.1:4603/website/?quality=2');
await page.waitForSelector('[data-world-host][data-state="ready"]', { timeout: 210000 });
await page.waitForSelector('[data-world-host][data-world-state="robot_idle"]', { timeout: 120000 });
const q2 = await page.evaluate(() => (window as any).__worldSession?.dump()?.env?.quality);
console.log('Q2-frame quality =', q2);
await pause(page);
await page.screenshot({ path: 'test-results/sky-forensic/q2-fallback.png' });
await ctx.close(); await browser.close();
console.log('FORENSIC_DONE');
