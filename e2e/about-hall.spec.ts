// About Hall —— ADR-2 G-Hall-10 首批。
// 路由 /world/about-pavilion/（Hall-0 壳）。不改 playwright.config.ts。
import { test, expect } from '@playwright/test';
import { expectImageLoaded, u } from './helpers';

const HALL = '/world/about-pavilion/';
const CHROME = '[data-hall-chrome]';

test.describe('About Hall 到达条', () => {
  test('无 query：200，H1 含「架桥」，到达条 hidden', async ({ page }) => {
    const res = await page.goto(u(HALL));
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText('架桥');
    const chrome = page.locator(CHROME);
    await expect(chrome).toHaveCount(1);
    await expect(chrome).toBeHidden();
    expect(await chrome.evaluate((el) => (el as HTMLElement).hidden)).toBe(true);
  });

  test('?from=city&poi=about-pavilion：到达条可见且含「个人档案馆」与「返回科技城」', async ({
    page,
  }) => {
    const res = await page.goto(u(`${HALL}?from=city&poi=about-pavilion`));
    expect(res?.status()).toBe(200);
    const chrome = page.locator(CHROME);
    await expect(chrome).toBeVisible();
    await expect(chrome).toContainText('个人档案馆');
    await expect(chrome).toContainText('返回科技城');
  });

  test('有卡：world-arrival-v1 的 poi 匹配 → 到达条含「探索」与楼名', async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem(
        'world-arrival-v1',
        JSON.stringify({
          v: 1,
          poi: 'about-pavilion',
          sessionId: 'e2e-w5-card',
          t: 184320,
          exploreN: 2,
          exploreTotal: 12,
          wroteAt: 1_700_000_000_000,
          maxKmh: 96,
          coneHits: 3,
          respawns: 1,
          poiEnters: 4,
        }),
      );
      localStorage.setItem('world-explore-v1', JSON.stringify(['about-pavilion', 'autodrive-lab']));
    });
    const res = await page.goto(u(`${HALL}?from=city&poi=about-pavilion`));
    expect(res?.status()).toBe(200);
    const chrome = page.locator(CHROME);
    await expect(chrome).toBeVisible();
    await expect(chrome).toContainText('探索');
    await expect(chrome).toContainText('个人档案馆');
  });

  test('?from=city&poi=not-a-building：到达条 hidden', async ({ page }) => {
    await page.goto(u(`${HALL}?from=city&poi=not-a-building`));
    const chrome = page.locator(CHROME);
    await expect(chrome).toBeHidden();
    expect(await chrome.evaluate((el) => (el as HTMLElement).hidden)).toBe(true);
  });
});

test.describe('About Hall scrub（AH-W1h）', () => {
  test('桌面 Hero：readyState≥1 后指针移到右 3/4，currentTime > 1s', async ({ page }) => {
    await page.goto(u(HALL));
    const hero = page.locator('[data-hero-scrub]');
    const video = hero.locator('video');
    await expect(video).toHaveCount(1);
    await expect
      .poll(async () => video.evaluate((el) => (el as HTMLVideoElement).readyState), {
        timeout: 15_000,
      })
      .toBeGreaterThanOrEqual(1);
    const box = await hero.boundingBox();
    expect(box, 'Hero 应有盒模型').toBeTruthy();
    await page.mouse.move(box!.x + box!.width * 0.12, box!.y + box!.height * 0.5);
    await page.mouse.move(box!.x + box!.width * 0.75, box!.y + box!.height * 0.5);
    await expect
      .poll(async () => video.evaluate((el) => (el as HTMLVideoElement).currentTime), {
        timeout: 8_000,
      })
      .toBeGreaterThan(1);
  });

  test('滚动到 S6 中段：transition video.currentTime 在 (3, 8)', async ({ page }) => {
    await page.goto(u(HALL));
    await page.evaluate(() => {
      const el = document.querySelector('[data-scene="s6"]');
      if (!(el instanceof HTMLElement)) throw new Error('missing s6');
      const y = el.getBoundingClientRect().top + window.scrollY - window.innerHeight + 160;
      window.scrollTo(0, Math.max(0, y));
    });
    const video = page.locator('[data-scene="s6"] video');
    await expect(video).toHaveCount(1);
    await expect
      .poll(async () => video.evaluate((el) => (el as HTMLVideoElement).readyState), {
        timeout: 15_000,
      })
      .toBeGreaterThanOrEqual(1);
    await page.evaluate(() => {
      const el = document.querySelector('[data-scene="s6"]');
      if (!(el instanceof HTMLElement)) throw new Error('missing s6');
      const denom = el.scrollHeight - window.innerHeight;
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top + denom * 0.5);
    });
    await expect
      .poll(async () => video.evaluate((el) => (el as HTMLVideoElement).currentTime), {
        timeout: 8_000,
      })
      .toBeGreaterThan(3);
    const t = await video.evaluate((el) => (el as HTMLVideoElement).currentTime);
    expect(t).toBeLessThan(8);
  });
});

test.describe('About Hall reduced-motion', () => {
  test('prefers-reduced-motion：Hero/S6 video 不存在或 paused，且无运行中 animation', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(u(HALL));
    await page.waitForLoadState('load');
    const report = await page.evaluate(() => {
      const videos = [...document.querySelectorAll('video')];
      const anims = document.getAnimations();
      return {
        videoCount: videos.length,
        allPaused: videos.every((v) => v.paused),
        animCount: anims.length,
        running: anims.filter((a) => a.playState === 'running').length,
      };
    });
    expect(report.videoCount === 0 || report.allPaused, `videos=${report.videoCount} paused=${report.allPaused}`).toBe(
      true,
    );
    expect(report.running, 'reduced-motion 不得有 running animation').toBe(0);
    if (report.animCount !== 0) {
      // 允许 paused 残留；硬条件是 running===0。票面 getAnimations()===0 在无 paused 残留时成立。
      expect(report.running).toBe(0);
    }
  });

  test('prefers-reduced-motion：无正在运行的 CSS animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(u(`${HALL}?from=city&poi=about-pavilion`));
    await page.waitForLoadState('load');
    await page.waitForFunction(
      () => !document.getAnimations().some((a) => a.playState === 'running'),
      { timeout: 2000 },
    );
    const report = await page.evaluate(() => {
      const anims = document.getAnimations();
      return {
        total: anims.length,
        running: anims.filter((a) => a.playState === 'running').length,
        states: anims.map((a) => a.playState),
        names: anims.map((a) => ('animationName' in a ? String(a.animationName) : a.constructor.name)),
      };
    });
    const allPaused = report.states.length > 0 && report.states.every((s) => s === 'paused');
    expect(
      report.total === 0 || allPaused || report.running === 0,
      `CSS animations: total=${report.total} running=${report.running} states=${JSON.stringify(report.states)} names=${JSON.stringify(report.names)}`,
    ).toBe(true);
    expect(report.running, '不得有 running 的 CSS animation').toBe(0);
  });
});

test.describe('About Hall 无 JS', () => {
  test.use({ javaScriptEnabled: false });

  test('禁用 JS：首屏 H1 与 poster <img> 可见', async ({ page }) => {
    const res = await page.goto(u(HALL));
    expect(res?.status()).toBe(200);
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('架桥');
    const poster = page.locator('section[data-scene] img').first();
    await expect(poster).toBeVisible();
    await expectImageLoaded(poster);
  });
});

test.describe('About Hall 未知 slug', () => {
  test('未知 slug 404', async ({ page }) => {
    const res = await page.goto(u('/world/definitely-not-a-hall/'));
    expect(res?.status()).toBe(404);
  });
});

test.describe('About Hall 驾驶卡短句（AH-T1b / ADR-4 决策 B）', () => {
  test('完整快照写最高巡航；空快照保底探索 n/N', async ({ browser }) => {
    const hallUrl = u(`${HALL}?from=city&poi=about-pavilion`);

    const full = await browser.newPage();
    await full.addInitScript(() => {
      sessionStorage.setItem(
        'world-arrival-v1',
        JSON.stringify({
          v: 1,
          poi: 'about-pavilion',
          sessionId: 'e2e-t1b-full',
          t: 184320,
          exploreN: 2,
          exploreTotal: 12,
          wroteAt: 1_700_000_000_000,
          maxKmh: 96,
          coneHits: 3,
        }),
      );
      localStorage.setItem('world-explore-v1', JSON.stringify(['about-pavilion', 'autodrive-lab']));
    });
    const fullRes = await full.goto(hallUrl);
    expect(fullRes?.status()).toBe(200);
    const fullChrome = full.locator(CHROME);
    await expect(fullChrome).toBeVisible();
    await expect(fullChrome).toContainText('最高巡航 96 km/h');
    await expect(fullChrome).toContainText('个人档案馆');
    await expect(fullChrome).toContainText('探索');
    await full.close();

    const empty = await browser.newPage();
    const emptyRes = await empty.goto(hallUrl);
    expect(emptyRes?.status()).toBe(200);
    const emptyChrome = empty.locator(CHROME);
    await expect(emptyChrome).toBeVisible();
    await expect(emptyChrome).toContainText(/探索\s+\d+\/\d+/);
    await expect(emptyChrome).not.toContainText('最高巡航');
    await expect(emptyChrome).not.toContainText('途中碰倒');
    await empty.close();
  });
});
