// [CC-AUD-C1] 驾驶五事件合成音效层 e2e（董事会 R5 §D 硬门第 1 条 AUD 最低断言集：
// 「首手势前零 AudioContext 实例、静音钮持久、事件音触发计数」）。
//
// 上位条款：
//   - R5 终裁 §B AUD-C1 文件域 / §D 硬门 4（autoplay 政策：AudioContext 懒创建 +
//     首手势解锁，禁任何「加载即响」）与硬门 5（robot_idle/transforming 新 UI hidden）
//   - 调研 cc-audio-pubg-nav-research.md §3.2（解锁链 = 变形 CTA / Space / WASD /
//     pointerdown 兜底；autoplay 合规可断言 = 无手势路径下 AudioContext 不存在）
//   - gameplay-features G3（静音钮 localStorage 记忆 + `world-audio` 埋点）
//
// 取证双口径：
//   ① 独立口径：addInitScript 包裹 window.AudioContext 构造计数（不依赖实现自报）；
//   ② 实现口径：window.__worldAudio.state()（unlocked/muted/counts/engineLevel）。
//
// 编排：单用例单次 3D 挂载串全部断言（world-chromium 串行 project 挂载成本纪律，
// CITY-VEH 五 ID 共链同款）；SwiftShader 计时校准沿 cyber-city.spec.ts 文件头⑤。
// 注意：playwright launchOptions 带 --autoplay-policy=no-user-gesture-required（TTS
// 用例既有旗标），故本 spec 的「首手势前零实例」断言的是懒创建合同本身——引擎侧
// 不因政策放宽而提前建 ctx，这正是 R5 §D「禁加载即响」的机器面。
import { test, expect } from '@playwright/test';
import { u } from './helpers';

const PAGE_URL = u('/');

const SEL = {
  host: '[data-world-host]',
  transform: '[data-world-transform]',
  audio: '[data-world-audio]',
} as const;

/** 挂载等待（SwiftShader 校准口径，cyber-city.spec.ts 文件头⑤）：全链实测 ~75-110s */
const MOUNT_TIMEOUT = 210_000;

/** 探针读取（实现口径②） */
interface AudioProbe {
  unlocked: boolean;
  running: boolean;
  muted: boolean;
  engineLevel: number;
  counts: { transform: number; impact: number; skid: number };
}

test.describe('科技城音效层 @phase0（CC-AUD-C1 · world-chromium 串行 project）', () => {
  test.describe.configure({ mode: 'serial', timeout: 420_000 });

  test('CITY-AUD-01 首手势前零 AudioContext → CTA 解锁 + 变形音计数 → 静音钮持久（localStorage 还原/写回）→ 驾驶引擎层激活', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    // 独立口径①：包裹 AudioContext 构造计数（页面脚本运行前注入）；
    // 同时种入静音记忆 '1'——断言挂载后按钮还原持久态（写回向断言在后半段）
    await page.addInitScript(() => {
      try {
        localStorage.setItem('world-audio-muted', '1');
      } catch {
        /* 忽略 */
      }
      const RealCtx = window.AudioContext;
      let count = 0;
      (window as unknown as { __audioCtxCount: () => number }).__audioCtxCount = () => count;
      const Patched = function (this: unknown, ...args: unknown[]) {
        count += 1;
        return new (RealCtx as unknown as new (...a: unknown[]) => AudioContext)(...args);
      };
      Patched.prototype = RealCtx.prototype;
      (window as unknown as { AudioContext: unknown }).AudioContext = Patched;
    });

    await page.goto(PAGE_URL);
    const host = page.locator(SEL.host);
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    await expect(host).toHaveAttribute('data-world-state', 'robot_idle', { timeout: 120_000 });

    // ————— 硬门断言 A：首手势前零 AudioContext 实例（双口径互证）—————
    // 自动挂载全链（load → ready → robot_idle）无一次用户手势，懒创建合同必须成立
    expect(
      await page.evaluate(() => (window as unknown as { __audioCtxCount: () => number }).__audioCtxCount()),
      '首手势前不得创建任何 AudioContext（R5 §D 硬门 4「禁加载即响」）',
    ).toBe(0);
    const preGesture = await page.evaluate(() => window.__worldAudio!.state() as AudioProbe);
    expect(preGesture.unlocked, '探针口径同证：首手势前 unlocked=false').toBe(false);

    // ————— 硬门断言 B：robot_idle 态静音钮 hidden（恒等合同样式门）—————
    await expect(page.locator(SEL.audio)).toBeHidden();

    // ————— 首手势 = 变形 CTA 点击（解锁链主路径）→ 四拍变形音 —————
    await page.locator(SEL.transform).click();
    await expect(host).toHaveAttribute('data-world-state', 'car_ready', { timeout: 120_000 });

    await expect
      .poll(
        () => page.evaluate(() => (window as unknown as { __audioCtxCount: () => number }).__audioCtxCount()),
        { message: '首手势后 AudioContext 应已创建（手势内新建）', timeout: 15_000 },
      )
      .toBeGreaterThan(0);
    const postTransform = await page.evaluate(() => window.__worldAudio!.state() as AudioProbe);
    expect(postTransform.unlocked, '首手势解锁').toBe(true);
    expect(postTransform.running, 'AudioContext 处于 running').toBe(true);
    // 硬门断言 C：事件音触发计数——变形完成沿至少排程 1 次变形音
    expect(postTransform.counts.transform, '变形音触发计数 ≥1').toBeGreaterThanOrEqual(1);
    // 静音持久还原向：initScript 种入 '1' → 构造期读回 muted=true（解锁 ≠ 出声分离）
    expect(postTransform.muted, 'localStorage 静音记忆应在构造期还原').toBe(true);

    // ————— 硬门断言 D：静音钮 car_ready 起可见 + aria-pressed 还原态 + 写回持久 —————
    const audioBtn = page.locator(SEL.audio);
    await expect(audioBtn).toBeVisible();
    await expect(audioBtn).toHaveAttribute('aria-pressed', 'true');
    await audioBtn.click();
    await expect(audioBtn).toHaveAttribute('aria-pressed', 'false');
    expect(
      await page.evaluate(() => localStorage.getItem('world-audio-muted')),
      '切换写回 localStorage（跨会话记忆）',
    ).toBe('0');

    // ————— 引擎层（加速/巡航）：W 驾驶接管后 engineLevel 抬升 —————
    await page.keyboard.down('w');
    try {
      await expect(host).toHaveAttribute('data-world-state', 'driving', { timeout: 60_000 });
      await expect
        .poll(() => page.evaluate(() => window.__worldAudio!.state().engineLevel), {
          message: '驾驶后引擎哼鸣增益应从 0 抬升（速度+油门咬合映射）',
          timeout: 45_000,
        })
        .toBeGreaterThan(0.01);
    } finally {
      await page.keyboard.up('w').catch(() => {});
    }

    expect(errors, '音效层全程零未捕获异常').toEqual([]);
  });
});
