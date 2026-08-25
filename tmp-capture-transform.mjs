// CC-L1 临时取证脚本（不入库）：抓 robot_idle → transforming 光幕中帧 → car_ready 帧
import { chromium } from '@playwright/test';

const BASE = 'http://127.0.0.1:4321/website';
const OUT = process.env.OUT_DIR ?? '/tmp/l1-frames';
import { mkdirSync } from 'node:fs';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  args: ['--autoplay-policy=no-user-gesture-required', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

console.log('goto /');
await page.goto(`${BASE}/`);
await page.waitForSelector('[data-world-host][data-world-state="robot_idle"]', {
  timeout: 210_000,
});
await page.waitForTimeout(4_000);
await page.screenshot({ path: `${OUT}/1-robot-idle.png` });
console.log('robot_idle captured');

await page.click('[data-world-transform]');
await page.waitForSelector('[data-world-host][data-world-state="transforming"]', {
  timeout: 30_000,
});
console.log('transforming...');
// SwiftShader 慢动作（设计 1.05s → ~40s 墙钟）：期间连拍光幕帧
for (let i = 0; i < 14; i++) {
  const state = await page.getAttribute('[data-world-host]', 'data-world-state');
  if (state !== 'transforming') break;
  await page.screenshot({ path: `${OUT}/2-transforming-${String(i).padStart(2, '0')}.png` });
  await page.waitForTimeout(3_000);
}
await page.waitForSelector('[data-world-host][data-world-state="car_ready"]', {
  timeout: 120_000,
});
await page.waitForTimeout(3_000);
await page.screenshot({ path: `${OUT}/3-car-ready.png` });
console.log('car_ready captured');

await browser.close();
