import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const origin = process.argv[2] ?? 'http://127.0.0.1:4655';
const output = resolve('evidence/about-hall/W8/poster-candidates');
await mkdir(output, { recursive: true });

const browser = await chromium.launch({
  args: ['--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'],
});

async function capture(name, viewport, deviceScaleFactor, mobile = false) {
  const context = await browser.newContext({ viewport, deviceScaleFactor, isMobile: mobile, hasTouch: mobile });
  const page = await context.newPage();
  await page.goto(`${origin}/website/`);
  const host = page.locator('[data-world-host]');
  if ((await host.getAttribute('data-blocked')) !== null) {
    await page.locator('[data-world-enter]').click();
  }
  await host.waitFor({ state: 'visible' });
  await page.waitForFunction(
    () => document.querySelector('[data-world-host]')?.getAttribute('data-state') === 'ready',
    undefined,
    { timeout: 210_000 },
  );
  await page.waitForFunction(
    () => document.querySelector('[data-world-host]')?.getAttribute('data-world-state') === 'robot_idle',
    undefined,
    { timeout: 180_000 },
  );
  await page.addStyleTag({
    content:
      '[data-world-skip], [data-world-host] > :not(.stage), [data-world-host] .stage > :not([data-world-canvas]) { visibility: hidden !important; }',
  });
  await page.locator('[data-world-canvas]').screenshot({
    path: `${output}/${name}.png`,
    animations: 'allow',
  });
  await context.close();
}

try {
  await capture('desktop-1280x720', { width: 1280, height: 773 }, 1);
  await capture('mobile-720x1280', { width: 360, height: 639 }, 2, true);
} finally {
  await browser.close();
}

console.log(output);
