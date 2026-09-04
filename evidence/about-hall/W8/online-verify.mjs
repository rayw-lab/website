import { writeFile } from 'node:fs/promises';
import { chromium } from '/Users/wanglei/studio-data-root/worktrees/website-about-hall/node_modules/@playwright/test/index.mjs';

const site = 'https://rayw-lab.github.io/website';
const out = '/Users/wanglei/studio-data-root/about-hall/ONLINE-VERIFICATION.json';
const result = { site, checkedAt: new Date().toISOString(), checks: {}, errors: [] };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const poll = async (fn, predicate, timeoutMs, intervalMs = 1000) => {
  const deadline = Date.now() + timeoutMs;
  let value;
  while (Date.now() < deadline) {
    value = await fn();
    if (predicate(value)) return value;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`poll timeout; last=${JSON.stringify(value)}`);
};

async function chromiumJourney() {
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  try {
    let response = await page.goto(`${site}/#debug`, { waitUntil: 'load' });
    assert(response?.status() === 200, 'homepage status');
    const host = page.locator('[data-world-host]');
    await host.waitFor({ state: 'visible', timeout: 30000 });
    await poll(
      () => host.getAttribute('data-state'),
      (value) => value === 'ready',
      240000,
    );
    await poll(
      () => host.getAttribute('data-world-state'),
      (value) => value === 'robot_idle',
      120000,
    );
    const signState = await page.evaluate(() => {
      const game = window.__worldSpikeGame;
      if (!game) throw new Error('__worldSpikeGame missing');
      const names = [];
      game.scene.traverse((object) => names.push(object.name));
      return {
        aboutHolo: names.includes('city-sign-holo-about-pavilion'),
        aboutPanels: names.includes('city-sign-panels-about-pavilion'),
        worldState: document.querySelector('[data-world-host]')?.getAttribute('data-world-state'),
      };
    });
    assert(signState.aboutHolo && signState.aboutPanels, 'About signage missing online');

    await page.locator('[data-world-transform]').click();
    await poll(
      () => host.getAttribute('data-world-state'),
      (value) => value === 'car_ready',
      120000,
    );

    const readYaw = () => page.evaluate(() => window.__worldSpikeGame?.view.lookYaw ?? null);
    await page.keyboard.down('q');
    const leftYaw = await poll(readYaw, (value) => typeof value === 'number' && value > 0.35, 150000);
    await page.keyboard.up('q');
    const centeredFromQ = await poll(readYaw, (value) => value === 0, 150000);
    await page.keyboard.down('e');
    const rightYaw = await poll(readYaw, (value) => typeof value === 'number' && value < -0.35, 150000);
    await page.keyboard.up('e');
    const centeredFromE = await poll(readYaw, (value) => value === 0, 150000);

    response = await page.goto(`${site}/?poi=about-pavilion#debug`, { waitUntil: 'load' });
    assert(response?.status() === 200, 'deep-link city status');
    await poll(
      () => page.locator('[data-world-host]').getAttribute('data-state'),
      (value) => value === 'ready',
      240000,
    );
    await poll(
      () => page.evaluate(() => window.__worldSession?.dump()?.funnel?.firstPoiIn ?? null),
      (value) => value !== null,
      180000,
    );
    const deadline = Date.now() + 240000;
    while (!page.url().includes('/world/about-pavilion/') && Date.now() < deadline) {
      await page.keyboard.press('e');
      await page.waitForTimeout(2000);
    }
    assert(page.url().includes('/world/about-pavilion/?from=city&poi=about-pavilion'), `hall navigation ${page.url()}`);
    await page.locator('[data-hall-chrome]:not([hidden])').waitFor({ timeout: 30000 });
    const chromeText = await page.locator('[data-hall-chrome]').innerText();
    assert(chromeText.includes('个人档案馆') && chromeText.includes('返回科技城'), 'arrival chrome text');
    const railNames = await page.locator('.hall-rail-name').allInnerTexts();
    assert(railNames.join('|') === '物联网|整车前瞻|AR-HUD|多语种座舱|端云大模型|AI 工作流', 'six station names');
    await page.locator('[data-scene="s6"]').evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const travel = Math.max(0, rect.height - window.innerHeight);
      window.scrollTo(0, rect.top + window.scrollY + travel * 0.55);
    });
    await page.waitForTimeout(1200);
    assert(await page.locator('.hall-homecoming-title').isVisible(), 'homecoming title');
    const backHref = await page.locator('.hall-chrome-back').getAttribute('href');
    await page.locator('.hall-chrome-back').click();
    await page.waitForURL(/\/website\/\?poi=about-pavilion/);
    assert(await page.locator('h1').isVisible(), 'returned city shell');

    response = await page.goto(`${site}/about/`, { waitUntil: 'load' });
    assert(response?.status() === 200, 'paper about status');
    const paperH1 = await page.locator('h1').innerText();
    const cardCount = await page.locator('.about-qcard').count();
    assert(cardCount === 3, 'paper problem cards');
    await page.locator('.about-qcard').first().hover();
    assert(await page.locator('.about-qcard-back').first().isVisible(), 'paper card expanded');
    return { signState, leftYaw, centeredFromQ, rightYaw, centeredFromE, chromeText, railNames, backHref, paperH1, cardCount, pageErrors };
  } finally {
    await browser.close();
  }
}

async function chromiumMedia() {
  const browser = await chromium.launch();
  try {
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    desktop.on('pageerror', (error) => errors.push(error.message));
    const response = await desktop.goto(`${site}/world/about-pavilion/?from=city&poi=about-pavilion`, { waitUntil: 'load' });
    assert(response?.status() === 200, 'Chromium hall media status');
    const hero = desktop.locator('.hall-hero video');
    await poll(() => hero.evaluate((video) => video.readyState), (value) => value >= 1, 60000);
    const heroSeek = await hero.evaluate((video) => {
      video.currentTime = Math.min(2, Math.max(0.1, video.duration / 2));
      return { duration: video.duration, currentTime: video.currentTime };
    });
    await desktop.locator('[data-scene="s6"]').scrollIntoViewIfNeeded();
    const transition = desktop.locator('.hall-homecoming video');
    await poll(() => transition.evaluate((video) => video.readyState), (value) => value >= 1, 60000);
    const transitionSeek = await transition.evaluate((video) => {
      video.currentTime = Math.min(4, Math.max(0.1, video.duration / 2));
      return { duration: video.duration, currentTime: video.currentTime };
    });
    await desktop.close();

    const mobile = await browser.newPage({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true });
    const mp4Requests = [];
    mobile.on('request', (request) => { if (/\.mp4(?:\?|$)/.test(request.url())) mp4Requests.push(request.url()); });
    await mobile.goto(`${site}/world/about-pavilion/?from=city&poi=about-pavilion`, { waitUntil: 'load' });
    await mobile.locator('[data-scene="s6"]').scrollIntoViewIfNeeded();
    await mobile.waitForTimeout(1500);
    const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const mobilePoster = await mobile.locator('.hall-hero img').evaluate((img) => ({ complete: img.complete, width: img.naturalWidth }));
    assert(mp4Requests.length === 0, `mobile requested mp4 ${mp4Requests}`);
    assert(overflow <= 1, `mobile overflow ${overflow}`);
    assert(mobilePoster.complete && mobilePoster.width > 0, 'mobile poster');
    await mobile.close();
    return { heroSeek, transitionSeek, mobile: { mp4Requests, overflow, mobilePoster }, errors };
  } finally {
    await browser.close();
  }
}

async function staticFallbacks() {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 667 } });
    const hall = await context.newPage();
    const hallResponse = await hall.goto(`${site}/world/about-pavilion/`, { waitUntil: 'load' });
    const hallH1 = await hall.locator('h1').innerText();
    const hallPoster = await hall.locator('.hall-hero img').evaluate((img) => ({ complete: img.complete, width: img.naturalWidth }));
    const paper = await context.newPage();
    const paperResponse = await paper.goto(`${site}/about/`, { waitUntil: 'load' });
    const paperH1 = await paper.locator('h1').innerText();
    assert(hallResponse?.status() === 200 && paperResponse?.status() === 200, 'no-JS status');
    assert(hallPoster.complete && hallPoster.width > 0, 'no-JS hall poster');
    await context.close();
    return { hallStatus: hallResponse.status(), hallH1, hallPoster, paperStatus: paperResponse.status(), paperH1 };
  } finally {
    await browser.close();
  }
}

for (const [name, fn] of Object.entries({ chromiumJourney, chromiumMedia, staticFallbacks })) {
  try {
    result.checks[name] = { status: 'PASS', detail: await fn() };
  } catch (error) {
    result.checks[name] = { status: 'FAIL', error: String(error?.stack || error) };
    result.errors.push(`${name}: ${error}`);
  }
}
result.status = result.errors.length ? 'FAIL' : 'PASS';
await writeFile(out, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.errors.length ? 1 : 0;
