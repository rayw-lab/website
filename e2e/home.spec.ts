// 首页（/）—— 骨架、导航、主题切换、Lab 入口、无 JS 退化。
// 覆盖：e2e-test-plan §5.1（HOME-E2E-01 ~ 05）。
import { test, expect } from '@playwright/test';
import { u, shot, expectImageLoaded } from './helpers';

test.describe('首页', () => {
  test('HOME-E2E-01 骨架与 SEO 基础：title / h1 / skip-link / canonical', async ({ page }) => {
    const res = await page.goto(u('/'));
    expect(res?.status()).toBe(200);

    await expect(page).toHaveTitle(/王磊/);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toBeVisible();

    // 跳到主内容（键盘可达性）：Tab 首个焦点即 skip-link，指向 #main
    const skip = page.locator('.skip-link');
    await expect(skip).toHaveAttribute('href', '#main');
    await page.keyboard.press('Tab');
    await expect(skip).toBeFocused();

    // canonical 必须带 GitHub Pages base（部署为项目页 /website/）
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /\/website\/$/);

    // 首页五区块标题锚点齐全
    for (const id of ['capabilities-title', 'live-demos-title', 'selected-work-title', 'now-title']) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
  });

  test('HOME-E2E-02 顶部导航：品牌 + 五栏目链接均带 base 前缀', async ({ page }) => {
    await page.goto(u('/'));

    const brand = page.locator('.site-header .brand');
    await expect(brand).toHaveAttribute('href', `${u('/')}`);

    const expected: Array<[string, string]> = [
      ['Work', u('/work/')],
      ['Insights', u('/insights/')],
      ['AI Lab', u('/ai-lab/')],
      ['About', u('/about/')],
      ['Contact', u('/contact/')],
    ];
    const links = page.locator('.site-nav a');
    await expect(links).toHaveCount(expected.length);
    for (const [label, href] of expected) {
      const link = links.filter({ hasText: label });
      await expect(link).toHaveAttribute('href', href);
    }
    // 首页不属于任何栏目：不应有 aria-current=page
    await expect(page.locator('.site-nav a[aria-current="page"]')).toHaveCount(0);
  });

  test('HOME-E2E-03 主题切换：html.dark 写入 + localStorage 持久化 + 刷新不回退', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(u('/'));

    const html = page.locator('html');
    const toggle = page.locator('[data-theme-toggle]').first();
    await expect(html).not.toHaveClass(/dark/);
    const lightBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await shot(page, 'home_desktop_light');

    // 切到夜间
    await toggle.click();
    await expect(html).toHaveClass(/dark/);
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');
    const darkBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(darkBg, '切换后 body 背景色应实际变化').not.toBe(lightBg);
    await shot(page, 'home_desktop_dark');

    // 刷新后主题保持（BaseLayout 防闪烁内联脚本在首帧前恢复）
    await page.reload();
    await expect(html).toHaveClass(/dark/);

    // 切回日间并再次刷新
    await toggle.click();
    await expect(html).toHaveClass(/light/);
    await page.reload();
    await expect(html).toHaveClass(/light/);
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('light');
  });

  test('HOME-E2E-04 Lab 证据区：两张 Demo 卡指向 /lab/ 详情页且海报可加载', async ({ page }) => {
    await page.goto(u('/'));
    const bento = page.locator('section:has(#live-demos-title)');

    const carLink = bento.locator(`a[href*="${u('/lab/car-configurator')}"]`).first();
    const ttsLink = bento.locator(`a[href*="${u('/lab/tts-cockpit')}"]`).first();
    await expect(carLink).toBeVisible();
    await expect(ttsLink).toBeVisible();

    for (const img of await bento.locator('img').all()) {
      await expectImageLoaded(img);
    }

    // 点击进入详情页（真实导航，非仅断言 href）
    await ttsLink.click();
    await expect(page).toHaveURL(new RegExp(`${u('/lab/tts-cockpit')}/?$`));
    await expect(page.locator('[data-lab-host]')).toHaveAttribute('data-lab-slug', 'tts-cockpit');
  });
});

test.describe('首页（无 JS）', () => {
  test.use({ javaScriptEnabled: false });

  test('HOME-E2E-05 禁用 JS：内容完整可读，导航与 Lab 入口不依赖脚本', async ({ page }) => {
    await page.goto(u('/'));
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.site-nav a')).toHaveCount(5);
    await expect(
      page.locator('section:has(#live-demos-title)').locator(`a[href*="${u('/lab/')}"]`).first(),
    ).toBeVisible();
  });
});
