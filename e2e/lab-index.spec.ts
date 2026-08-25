// /lab/ 索引页 —— manifest 驱动卡片、morph 注册表、零 JS 静态页。
// 覆盖：e2e-test-plan §5.2（LAB-E2E-01 ~ 04）。
import { test, expect } from '@playwright/test';
import { u, shot, expectImageLoaded } from './helpers';

// 与 src/lab/manifest.json 同步的最小期望集（新模块上线时在此追加）
const LIVE_MODULES = [
  { slug: 'tts-cockpit', code: 'RA-01', vtName: 'demo-cockpit' },
  { slug: 'car-configurator', code: 'RB-01', vtName: 'demo-car' },
];

test.describe('Lab 索引页', () => {
  test('LAB-E2E-01 manifest 卡片：2 个 live 模块、LIVE 徽标、预算与技术要点行', async ({ page }) => {
    const res = await page.goto(u('/lab/'));
    expect(res?.status()).toBe(200);

    const cards = page.locator('.cards .card');
    await expect(cards).toHaveCount(LIVE_MODULES.length);

    for (const mod of LIVE_MODULES) {
      const card = page.locator(`.card[href*="/lab/${mod.slug}"]`);
      await expect(card).toBeVisible();
      await expect(card.locator('.card-code')).toContainText(mod.code);
      await expect(card.locator('.status-live')).toHaveText('LIVE');
      await expect(card.locator('.card-budget')).toContainText('预算');
      expect(await card.locator('.card-chips i').count()).toBeGreaterThan(0);
    }
    await shot(page, 'lab_index_cards');
  });

  test('LAB-E2E-02 海报可加载且 view-transition-name 与详情页舞台配对（§9.3 morph 注册表）', async ({ page }) => {
    await page.goto(u('/lab/'));

    for (const mod of LIVE_MODULES) {
      const visual = page.locator(`.card[href*="/lab/${mod.slug}"] .card-visual`);
      await expect(visual).toHaveAttribute('style', new RegExp(`view-transition-name:\\s*${mod.vtName}`));
      await expectImageLoaded(visual.locator('img'));
    }

    // 详情页舞台侧同名（配对成立 morph 才会生效）
    for (const mod of LIVE_MODULES) {
      await page.goto(u(`/lab/${mod.slug}/`));
      await expect(page.locator('[data-lab-stage]')).toHaveAttribute(
        'style',
        new RegExp(`view-transition-name:\\s*${mod.vtName}`),
      );
    }
  });

  test('LAB-E2E-03 导航链路：卡片进详情页、面包屑回首页', async ({ page }) => {
    await page.goto(u('/lab/'));

    await page.locator('.card[href*="/lab/car-configurator"]').click();
    await expect(page).toHaveURL(new RegExp(`${u('/lab/car-configurator')}/?$`));
    await expect(page.locator('[data-lab-host]')).toHaveAttribute('data-lab-slug', 'car-configurator');

    await page.goBack();
    await page.locator('.crumb a', { hasText: '首页' }).click();
    await expect(page).toHaveURL(new RegExp(`${u('/')}$`));
  });

  test('LAB-E2E-04 零 JS 静态页：禁用 JS 后卡片内容完整', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(u('/lab/'));
    await expect(page.locator('.cards .card')).toHaveCount(LIVE_MODULES.length);
    await expect(page.locator('h1')).toHaveText(/Lab 实验室/);
    await context.close();
  });
});
