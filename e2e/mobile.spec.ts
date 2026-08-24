// 移动端 375px（触屏 · pointer: coarse）—— 布局无溢出、触控目标、facade pointer 拦截差异。
// 覆盖：e2e-test-plan §5.6（MOB-E2E-01 ~ 03）。仅在 mobile-375 project 运行。
import { test, expect } from '@playwright/test';
import { u, shot, waitLabReady } from './helpers';

// MOB-E2E-03 含完整 3D 挂载（SwiftShader 软渲染），放宽文件级超时
test.describe.configure({ timeout: 150_000 });

test.describe('移动端 375px', () => {
  test('MOB-E2E-01 首页：无水平溢出、导航横滚可用、主题切换触控目标 ≥ 44px', async ({ page }) => {
    await page.goto(u('/'));

    // 页面本体不得横向溢出（导航条内部横滚是设计内行为，不算页面溢出）
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, '首页在 375px 下不得出现页面级水平滚动').toBeLessThanOrEqual(0);

    // 五个导航项均可见/可达（第二行横滚容器内）
    await expect(page.locator('.site-nav a')).toHaveCount(5);
    await expect(page.locator('.site-nav a', { hasText: 'Contact' })).toBeVisible();

    // 触控目标 ≥ 44×44（spec §8.4）
    const box = await page.locator('[data-theme-toggle]').boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
    await shot(page, 'mobile_home_375');
  });

  test('MOB-E2E-02 tts-cockpit：pointerFine=false → 触屏不拦截自动挂载，仪表簇按断点隐藏', async ({ page }) => {
    await page.goto(u('/lab/tts-cockpit/'));

    // manifest capabilities.pointerFine=false：触屏（pointer: coarse）不触发 pointer 拦截
    const host = page.locator('[data-lab-host]');
    await expect(host).not.toHaveAttribute('data-blocked', /.+/);

    await waitLabReady(page);

    // < 640px 断点：仪表簇（cluster）隐藏，中控单列
    await expect(page.locator('.cluster')).toBeHidden();
    await expect(page.locator('#screen')).toBeVisible();
    await shot(page, 'mobile_tts_ready_375');
  });

  test('MOB-E2E-03 car-configurator：pointerFine=true → 触屏拦截自动挂载（data-blocked=pointer），显式启动仍可用', async ({ page }) => {
    await page.goto(u('/lab/car-configurator/'));

    const host = page.locator('[data-lab-host]');
    await expect(host).toHaveAttribute('data-blocked', 'pointer');
    await expect(host).toHaveAttribute('data-state', 'idle');
    await expect(page.locator('.lab-blocked-note[data-blocked-reason="pointer"]')).toBeVisible();

    // 滚动 + 等待 idle 窗口：仍不得自动挂载
    await host.locator('[data-lab-stage]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2_500);
    await expect(host).toHaveAttribute('data-state', 'idle');
    await shot(page, 'mobile_car_blocked_pointer');

    // 显式启动（§12.4 流程图 POSTER -.-> 探测 的显式路径）
    await page.locator('[data-lab-start]').click();
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: 100_000 });
    await expect(page.locator('[data-lab-backend]')).toHaveText(/^(WebGPU|WebGL 2)$/);
    await shot(page, 'mobile_car_ready_375');
  });
});
