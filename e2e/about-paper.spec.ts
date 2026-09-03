// About 纸面双胞胎（/about/）—— AH-F1。desktop-chromium（本文件不在 testIgnore）。
import { test, expect } from '@playwright/test';
import { u } from './helpers';

const ABOUT = '/about/';

test.describe('About 纸面（AH-F1）', () => {
  test('ABOUT-PAPER-TEASERS-AND-FLIP：三张折叠摘要、首卡 hover 见背面、main 无 [[', async ({
    page,
  }) => {
    const res = await page.goto(u(ABOUT));
    expect(res?.status()).toBe(200);

    const teasers = page.locator('.about-qcard-teaser');
    await expect(teasers).toHaveCount(3);
    await expect(teasers.first()).toBeVisible();

    const firstCard = page.locator('.about-qcard').first();
    await firstCard.hover();
    await expect(page.locator('.about-qcard-back').first()).toBeVisible();
    await expect
      .poll(async () =>
        firstCard.locator('.about-qcard-inner').evaluate((el) => getComputedStyle(el).transform),
      )
      .toMatch(/matrix3d\(-1/);

    const bodyText = await page.locator('main').innerText();
    expect(bodyText).not.toContain('[[');
  });

  test('ABOUT-PAPER-RM：reduced-motion 下 /about/ 无 running animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const res = await page.goto(u(ABOUT));
    expect(res?.status()).toBe(200);
    await page.waitForLoadState('load');

    const report = await page.evaluate(() => {
      const running = document.getAnimations().filter((a) => a.playState === 'running');
      return {
        running: running.length,
        names: running.map((a) =>
          'animationName' in a ? String((a as CSSAnimation).animationName) : a.constructor.name,
        ),
        targets: running.map((a) => {
          const effect = a.effect;
          if (effect && 'target' in effect && effect.target instanceof Element) {
            const el = effect.target;
            return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${el.className}`;
          }
          return '?';
        }),
      };
    });
    expect(
      report.running,
      `running=${report.running} names=${JSON.stringify(report.names)} targets=${JSON.stringify(report.targets)}`,
    ).toBe(0);
  });
});
