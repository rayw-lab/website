// /lab/car-configurator/ —— WebGPU→WebGL2 降级链、?gl=1、深链三参数、交互回写、reduced-motion、无 JS。
// 覆盖：e2e-test-plan §5.4（CAR-E2E-01 ~ 07）。
//
// 后端徽标断言说明：headless Chromium（含 CI runner）无 navigator.gpu，
// three.js WebGPURenderer 自动走 WebGL 2 后端（SwiftShader 软渲染）——
// 因此本套件在 CI 恒验证「回退链路」；WebGPU 正路径需本地带 GPU 的 headed 运行验证。
import { test, expect } from '@playwright/test';
import { u, shot, waitLabReady, expectImageLoaded } from './helpers';

const PAGE_URL = u('/lab/car-configurator/');
/** 3D 挂载（5MB 资产 + SwiftShader 初始化）宽限 */
const MOUNT_TIMEOUT = 60_000;

test.describe('3D 车辆配置器', () => {
  test('CAR-E2E-01 facade → ready：canvas 呈现、HUD 揭示、后端徽标显示实际渲染后端', async ({ page, request }) => {
    // SSR 合同：idle 态 + 控制坞 inert + poster
    const html = await (await request.get(PAGE_URL)).text();
    expect(html).toContain('data-state="idle"');
    expect(html).toMatch(/data-lab-gated[^>]*\binert\b/);
    expect(html).toContain('car-configurator-poster.webp');

    await page.goto(PAGE_URL);
    await expectImageLoaded(page.locator('.lab-poster'));

    const host = await waitLabReady(page, MOUNT_TIMEOUT);

    // canvas 有真实绘制尺寸
    const canvas = page.locator('[data-cfg-canvas]');
    await expect(canvas).toBeVisible();
    const size = await canvas.evaluate((el) => {
      const c = el as HTMLCanvasElement;
      return { w: c.width, h: c.height };
    });
    expect(size.w).toBeGreaterThan(0);
    expect(size.h).toBeGreaterThan(0);

    // 后端徽标：WebGPU（本地带 GPU）或 WebGL 2（headless 回退链路）
    const backend = page.locator('[data-lab-backend]');
    await expect(backend).toHaveText(/^(WebGPU|WebGL 2)$/);

    // HUD 默认配置名 + 控制坞解锁
    await expect(page.locator('[data-cfg-config-name]')).toHaveText('糖果胭脂 · 原厂配色 · 双色机加工');
    await expect(page.locator('.cfg-dock')).not.toHaveAttribute('inert');
    await expect(host).toHaveAttribute('data-state', 'ready');
    await shot(page, 'car_ready_default');
  });

  test('CAR-E2E-02 ?gl=1 强制 WebGL 2 回退（§9.2 保留参数），且交互后参数保持', async ({ page }) => {
    await page.goto(`${PAGE_URL}?gl=1`);
    await waitLabReady(page, MOUNT_TIMEOUT);

    await expect(page.locator('[data-lab-backend]')).toHaveText('WebGL 2');

    // 交互回写 URL 时 gl=1 不得丢失（writeURL 显式保留）
    await page.locator('[data-cfg-paint="abyss"]').click();
    await expect(page).toHaveURL(/gl=1/);
    await expect(page).toHaveURL(/paint=abyss/);
  });

  test('CAR-E2E-03 深链 ?paint=&wheels=&livery= 三参组合：选中态与 HUD 全部生效', async ({ page }) => {
    await page.goto(`${PAGE_URL}?paint=abyss&wheels=stealth&livery=graphite`);
    await waitLabReady(page, MOUNT_TIMEOUT);

    await expect(page.locator('[data-cfg-paint="abyss"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-cfg-wheel="stealth"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-cfg-livery="graphite"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-cfg-config-name]')).toHaveText('炙烤石墨 · 深海蓝 · 曜黑竞速');
    await shot(page, 'car_deeplink_graphite_abyss_stealth');
  });

  test('CAR-E2E-04 非法深链 ?paint=hotpink&wheels=square&livery=none：忽略并回默认配置', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto(`${PAGE_URL}?paint=hotpink&wheels=square&livery=none`);
    await waitLabReady(page, MOUNT_TIMEOUT);

    await expect(page.locator('[data-cfg-paint="livery"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-cfg-wheel="machined"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-cfg-livery="carmine"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-cfg-config-name]')).toHaveText('糖果胭脂 · 原厂配色 · 双色机加工');
    expect(errors, '非法参数不应产生未捕获异常').toEqual([]);
  });

  test('CAR-E2E-05 交互链路：车漆/分区 Tab/轮毂切换 + URL 回写与默认值清理', async ({ page }) => {
    await page.goto(PAGE_URL);
    await waitLabReady(page, MOUNT_TIMEOUT);

    // 车漆：熔岩红 → aria-pressed 迁移 + HUD + URL
    await page.locator('[data-cfg-paint="crimson"]').click();
    await expect(page.locator('[data-cfg-paint="crimson"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-cfg-paint="livery"]')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('[data-cfg-config-name]')).toContainText('熔岩红');
    await expect(page).toHaveURL(/paint=crimson/);
    await shot(page, 'car_paint_crimson');

    // Tab 切到轮毂：aria-selected 迁移、面板 hidden 切换
    await page.locator('[data-cfg-tab="wheels"]').click();
    await expect(page.locator('[data-cfg-tab="wheels"]')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[data-cfg-tab="paint"]')).toHaveAttribute('aria-selected', 'false');
    await expect(page.locator('[data-cfg-panel="wheels"]')).toBeVisible();
    await expect(page.locator('[data-cfg-panel="paint"]')).toBeHidden();

    // 轮毂：曜黑竞速 → URL 追加 wheels
    await page.locator('[data-cfg-wheel="stealth"]').click();
    await expect(page).toHaveURL(/wheels=stealth/);
    await expect(page).toHaveURL(/paint=crimson/);

    // 切回默认（原厂漆 + 原厂轮毂）→ URL 参数全部清理
    await page.locator('[data-cfg-tab="paint"]').click();
    await page.locator('[data-cfg-paint="livery"]').click();
    await page.locator('[data-cfg-tab="wheels"]').click();
    await page.locator('[data-cfg-wheel="machined"]').click();
    await expect(page).not.toHaveURL(/paint=|wheels=|livery=/);
  });

  test('CAR-E2E-06 reduced-motion：自动挂载被拦、不拉 3D 资产；显式启动逃生门可用', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    const assetRequests: string[] = [];
    page.on('request', (r) => {
      if (/\/models\/|\/hdri\//.test(r.url())) assetRequests.push(r.url());
    });

    await page.goto(PAGE_URL);
    await page.waitForLoadState('networkidle');

    const host = page.locator('[data-lab-host]');
    await expect(host).toHaveAttribute('data-blocked', 'reduced-motion');
    await expect(host).toHaveAttribute('data-state', 'idle');
    await expect(
      page.locator('.lab-blocked-note[data-blocked-reason="reduced-motion"]'),
    ).toBeVisible();

    await host.locator('[data-lab-stage]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2_500);
    expect(assetRequests, 'reduced-motion 下不得拉取任何 3D 资产').toEqual([]);
    await shot(page, 'car_blocked_reduced_motion');

    // 显式点击启动 → 跳过自动挡拦截，完成挂载
    await page.locator('[data-lab-start]').click();
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    expect(assetRequests.length, '显式启动后才允许拉取 3D 资产').toBeGreaterThan(0);
  });
});

test.describe('3D 车辆配置器（无 JS）', () => {
  test.use({ javaScriptEnabled: false });

  test('CAR-E2E-07 禁用 JS：noscript 提示可见，技术说明/署名静态可读', async ({ page }) => {
    await page.goto(PAGE_URL);
    await expect(page.getByText('本演示需要启用 JavaScript')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
    // 静态区块（操作方式 / 技术实现 / 素材署名）不依赖脚本
    await expect(page.getByRole('heading', { name: /技术实现/ })).toBeVisible();
    await expect(page.getByText('素材署名与免责声明')).toBeVisible();
    await expectImageLoaded(page.locator('.lab-poster'));
  });
});
