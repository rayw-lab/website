// E2E 公共工具：base 前缀、待交付路由白名单镜像、facade 挂载等待、报告截图。
import { expect, type Locator, type Page } from '@playwright/test';

/** GitHub Pages 项目页 base（与 astro.config.mjs base 一致） */
export const BASE = '/website';

/** 站内路径 → 带 base 前缀的绝对路径（Playwright baseURL 只含 origin） */
export const u = (path: string): string => `${BASE}${path}`;

/**
 * 待交付路由白名单 —— 与 scripts/check-links.mjs 的 PENDING_ROUTES 保持同步。
 * 语义与 CI 门禁一致：这些路由允许 404；一旦真实交付（返回 200），
 * 本白名单条目过期，site-health 测试会失败，强制删除条目（只收缩不增长）。
 */
export const PENDING_ROUTES = new Set([
  '/work/',
  '/work/multilingual-cockpit/',
  '/work/llm-capability-layering/',
  '/work/ai-native-workflow/',
  '/insights/',
  '/ai-lab/',
  '/about/',
  '/contact/',
  '/rss.xml',
]);

/** 报告截图输出目录（batch 1 报告引用，随 docs 入库） */
export const SHOT_DIR = 'docs/spec/assets/e2e-batch1';

/** 关键状态截图：供 e2e-test-report-batch1.md 引用 */
export async function shot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `${SHOT_DIR}/${name}.png` });
}

/**
 * 滚动到 Lab 舞台并等待 facade 完成挂载（data-state=ready）。
 * 自动挂载条件 = 视口相交 + requestIdleCallback（facade §12.4），
 * 滚动后仍需等待 idle 回调与模块 chunk / 资产加载。
 * SwiftShader 软渲染下 3D 初始化偏慢，默认给 45s。
 */
export async function waitLabReady(page: Page, timeout = 45_000): Promise<Locator> {
  const host = page.locator('[data-lab-host]');
  await host.locator('[data-lab-stage]').scrollIntoViewIfNeeded();
  await expect(host).toHaveAttribute('data-state', 'ready', { timeout });
  return host;
}

/** 断言 <img> 已实际解码出像素（src 200 且非坏图） */
export async function expectImageLoaded(img: Locator): Promise<void> {
  await expect(img).toBeVisible();
  const width = await img.evaluate((el) => (el as HTMLImageElement).naturalWidth);
  expect(width, `图片应加载成功：${await img.getAttribute('src')}`).toBeGreaterThan(0);
}
