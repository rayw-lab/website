import { chromium } from '@playwright/test';
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--enable-unsafe-swiftshader'] });
const pause = async (page) => { await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); }); };
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:4603/website/');
await page.waitForSelector('[data-world-host][data-state="ready"]', { timeout: 210000 });
await page.waitForSelector('[data-world-host][data-world-state="robot_idle"]', { timeout: 120000 });
await page.locator('[data-world-transform]').click();
await page.waitForSelector('[data-world-host][data-world-state="car_ready"]', { timeout: 120000 });
await page.waitForTimeout(2500); // T-4 色温微移落位后
await pause(page);
await page.screenshot({ path: 'test-results/visual-alvis/world-car-1440.png' });
// 顺带取一张 Q0 robot-idle 新帧（三评对齐用）
await page.keyboard.press('r');
await page.waitForTimeout(4000);
const s = await page.evaluate(() => (window).__worldSession?.dump()?.env?.quality);
console.log('quality after respawn =', s);
await pause(page);
await page.screenshot({ path: 'test-results/visual-alvis/world-robot-idle-postB.png' });
await ctx.close(); await browser.close();
console.log('B2_DONE');
