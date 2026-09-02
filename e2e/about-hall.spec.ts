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

  test('?from=city&poi=not-a-building：到达条 hidden', async ({ page }) => {
    await page.goto(u(`${HALL}?from=city&poi=not-a-building`));
    const chrome = page.locator(CHROME);
    await expect(chrome).toBeHidden();
    expect(await chrome.evaluate((el) => (el as HTMLElement).hidden)).toBe(true);
  });
});

test.describe('About Hall reduced-motion', () => {
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
