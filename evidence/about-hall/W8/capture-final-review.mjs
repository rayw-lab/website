import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const origin = process.argv[2] ?? 'http://127.0.0.1:4658';
const output = resolve('evidence/about-hall/W8/final-review');
await mkdir(output, { recursive: true });

const browser = await chromium.launch();
const errors = [];

async function pageAt(viewport, path) {
  const page = await browser.newPage({ viewport });
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`${path}: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`${path}: ${error}`));
  await page.goto(`${origin}/website${path}`, { waitUntil: 'load' });
  await page.addStyleTag({ content: 'astro-dev-toolbar, #dev-toolbar-root { display: none !important; }' });
  return page;
}

async function scrollScene(page, scene, fraction = 0.55) {
  await page.locator(`[data-scene="${scene}"]`).evaluate((node, f) => {
    const rect = node.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const travel = Math.max(0, rect.height - window.innerHeight);
    window.scrollTo(0, top + travel * f);
  }, fraction);
  await page.waitForTimeout(800);
}

try {
  const hall = await pageAt({ width: 1440, height: 900 }, '/world/about-pavilion/?from=city&poi=about-pavilion');
  await hall.locator('.hall-hero h1').waitFor();
  await hall.screenshot({ path: `${output}/01-hall-hero-desktop.png` });
  for (const scene of ['s2', 's3', 's4', 's5']) {
    await scrollScene(hall, scene, scene === 's2' ? 0.62 : 0.55);
    await hall.screenshot({ path: `${output}/02-hall-station-${scene}-desktop.png` });
  }
  await scrollScene(hall, 's6');
  await hall.screenshot({ path: `${output}/03-hall-homecoming-desktop.png` });
  await scrollScene(hall, 's8', 0.2);
  await hall.screenshot({ path: `${output}/04-hall-epilogue-desktop.png` });
  await hall.close();

  const hallMobile = await pageAt({ width: 375, height: 667 }, '/world/about-pavilion/?from=city&poi=about-pavilion');
  await hallMobile.locator('.hall-hero h1').waitFor();
  await hallMobile.screenshot({ path: `${output}/05-hall-hero-mobile.png` });
  await hallMobile.close();

  const paper = await pageAt({ width: 1440, height: 900 }, '/about/');
  await paper.locator('h1').waitFor();
  await paper.screenshot({ path: `${output}/06-paper-hero-desktop.png` });
  await paper.locator('.about-qlist').scrollIntoViewIfNeeded();
  await paper.screenshot({ path: `${output}/07-paper-problems-desktop.png` });
  await paper.close();

  const paperMobile = await pageAt({ width: 375, height: 667 }, '/about/');
  await paperMobile.locator('h1').waitFor();
  await paperMobile.screenshot({ path: `${output}/08-paper-hero-mobile.png` });
  await paperMobile.locator('.about-qlist').scrollIntoViewIfNeeded();
  await paperMobile.screenshot({ path: `${output}/09-paper-problems-mobile.png` });
  await paperMobile.close();
} finally {
  await browser.close();
}

await writeFile(`${output}/console-errors.json`, `${JSON.stringify(errors, null, 2)}\n`);
console.log(JSON.stringify({ output, consoleErrors: errors.length }));
