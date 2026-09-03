// AH-T1a evidence shots: spawn ritual_idle + ?poi=about-pavilion parking bay.
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const PORT = Number(process.env.E2E_PORT || 4633);
const ORIGIN = `http://127.0.0.1:${PORT}`;
const BASE = '/website';
const OUT = path.resolve(import.meta.dirname);
mkdirSync(OUT, { recursive: true });
const MOUNT_TIMEOUT = 210_000;

const browser = await chromium.launch({
  args: ['--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'],
});

async function waitReady(page, { ritual = false } = {}) {
  const hostReady = page.locator('[data-world-host][data-state="ready"]');
  await hostReady.waitFor({ state: 'attached', timeout: MOUNT_TIMEOUT });
  if (ritual) {
    const idle = page.locator('[data-world-host][data-world-state="robot_idle"]');
    await idle.waitFor({ state: 'attached', timeout: 120_000 });
    await page.locator('[data-world-transform]').waitFor({ state: 'visible', timeout: 30_000 });
  }
}

async function dumpPose(page) {
  return page.evaluate(() => {
    const w = globalThis.__worldSpike;
    const host = document.querySelector('[data-world-host]');
    const st = typeof w?.state === 'function' ? w.state() : null;
    return {
      hostState: host?.getAttribute('data-state') ?? null,
      worldState: host?.getAttribute('data-world-state') ?? null,
      pose: st
        ? {
            x: st.x ?? null,
            z: st.z ?? null,
            yaw: st.yaw ?? null,
            headingDeg: typeof st.yaw === 'number' ? ((st.yaw * 180) / Math.PI + 360) % 360 : null,
            shot: st.shot ?? null,
          }
        : null,
      keys: st ? Object.keys(st).slice(0, 40) : [],
    };
  });
}

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${ORIGIN}${BASE}/`, { waitUntil: 'domcontentloaded', timeout: MOUNT_TIMEOUT });
  await waitReady(page, { ritual: true });
  await page.waitForTimeout(1200);
  const spawnDump = await dumpPose(page);
  await page.screenshot({
    path: path.join(OUT, 'shot-spawn.png'),
    type: 'png',
  });

  await page.goto(`${ORIGIN}${BASE}/?poi=about-pavilion`, {
    waitUntil: 'domcontentloaded',
    timeout: MOUNT_TIMEOUT,
  });
  await waitReady(page);
  await page.waitForTimeout(800);
  const poiDump = await dumpPose(page);
  await page.screenshot({
    path: path.join(OUT, 'shot-poi-about.png'),
    type: 'png',
  });

  writeFileSync(
    path.join(OUT, 'shot-pose.json'),
    JSON.stringify({ spawn: spawnDump, poi: poiDump }, null, 2),
  );
  console.log(JSON.stringify({ spawn: spawnDump, poi: poiDump }, null, 2));
} finally {
  await browser.close();
}
