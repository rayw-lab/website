// 3D canvas 视觉取证工具（CC-L0-setup，供 e2e/visual/ 与后续 Loop 复用）。
//
// 为什么不用 canvas.toDataURL()/readPixels：three 默认 preserveDrawingBuffer=false，
// 帧呈现后 drawing buffer 即被清空，页内读取到的多半是全透明假阴性。
// 取证走 Playwright 合成器截图（拿到的是屏幕上真实合成结果，与降级/后端无关），
// 再把截图送回浏览器端 2D canvas 做像素统计——零 Node 侧图像解码依赖。
import { expect, type Locator, type Page, type TestInfo } from '@playwright/test';

/** 取证截图输出目录（gitignore 的 test-results/ 下：每轮 Loop 本地留档，不入库） */
export const EVIDENCE_DIR = 'test-results/visual';

/** 画布着色统计（analyzeCanvasPaint 返回值） */
export interface CanvasPaintStats {
  /** 采样区域（CSS px，画布 boundingBox 内缩后的中心区） */
  clip: { x: number; y: number; width: number; height: number };
  /** 缩样后统计的像素数 */
  sampled: number;
  /** 4bit/通道量化后的不同颜色数（纯色空画布 = 1） */
  quantizedColors: number;
  /** 非众数色像素占比 0–1（纯色空画布 = 0） */
  nonModalRatio: number;
}

/**
 * 对 canvas 元素中心区（默认各边内缩 15%，避开壳页 HUD 渐变/提示胶囊等 DOM 覆盖层）
 * 截图并统计像素多样性。SwiftShader 软渲染下同样适用——只要求「画了东西」，
 * 不要求帧率或与真机 GPU 一致的着色结果。
 */
export async function analyzeCanvasPaint(canvas: Locator, inset = 0.15): Promise<CanvasPaintStats> {
  const box = await canvas.boundingBox();
  if (!box) throw new Error('[visual] canvas 无 boundingBox（未附着或不可见）');
  const clip = {
    x: box.x + box.width * inset,
    y: box.y + box.height * inset,
    width: Math.max(1, box.width * (1 - inset * 2)),
    height: Math.max(1, box.height * (1 - inset * 2)),
  };
  const page = canvas.page();
  const buffer = await page.screenshot({ clip, animations: 'allow' });

  const stats = await page.evaluate(async (dataUrl: string) => {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('取证截图解码失败'));
      img.src = dataUrl;
    });
    // 缩样统计上限 256px：足够判空/判绘，避免大画布逐像素开销
    const MAX = 256;
    const scale = Math.min(1, MAX / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const probe = document.createElement('canvas');
    probe.width = w;
    probe.height = h;
    const ctx = probe.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('2D 探针上下文不可用');
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    const counts = new Map<number, number>();
    for (let i = 0; i < data.length; i += 4) {
      const key = ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    let modal = 0;
    for (const n of counts.values()) modal = Math.max(modal, n);
    const sampled = w * h;
    return { sampled, quantizedColors: counts.size, nonModalRatio: 1 - modal / sampled };
  }, `data:image/png;base64,${buffer.toString('base64')}`);

  return { clip, ...stats };
}

/**
 * 断言 canvas 已实际着色（非空/非纯色），带轮询重采样——SwiftShader ~1-5fps，
 * 状态落定后首帧可能尚未合成，单次采样有假阴性风险。阈值经验值：
 * 空画布（含壳页覆盖层渗入）quantizedColors ≤ 3、nonModalRatio < 0.01；
 * 城市场景（SwiftShader）colors 数百、ratio > 0.3——默认阈值留了量级余量。
 */
export async function expectCanvasPainted(
  canvas: Locator,
  opts: { minColors?: number; minNonModalRatio?: number; timeout?: number } = {},
): Promise<CanvasPaintStats> {
  const { minColors = 8, minNonModalRatio = 0.03, timeout = 45_000 } = opts;
  const deadline = Date.now() + timeout;
  let stats = await analyzeCanvasPaint(canvas);
  while (
    (stats.quantizedColors < minColors || stats.nonModalRatio < minNonModalRatio) &&
    Date.now() < deadline
  ) {
    await canvas.page().waitForTimeout(3_000);
    stats = await analyzeCanvasPaint(canvas);
  }
  expect(
    stats.quantizedColors,
    `canvas 量化颜色数应 ≥${minColors}（空画布≈1，实测 ${stats.quantizedColors}）`,
  ).toBeGreaterThanOrEqual(minColors);
  expect(
    stats.nonModalRatio,
    `canvas 非众数色占比应 ≥${minNonModalRatio}（纯色空画布=0，实测 ${stats.nonModalRatio.toFixed(4)}）`,
  ).toBeGreaterThanOrEqual(minNonModalRatio);
  return stats;
}

/**
 * 落盘取证截图（整页）到 EVIDENCE_DIR，并附到 Playwright 报告。
 * 固定文件名（不带时间戳）：每轮 Loop 覆盖写，方便跨轮同名对比。
 */
export async function captureEvidence(page: Page, testInfo: TestInfo, name: string): Promise<string> {
  const path = `${EVIDENCE_DIR}/${name}.png`;
  await page.screenshot({ path, fullPage: false });
  await testInfo.attach(name, { path, contentType: 'image/png' });
  return path;
}
