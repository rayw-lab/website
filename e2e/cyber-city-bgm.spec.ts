// [CC-BGM-C1] BGM 合成氛围垫 e2e（CITY-BGM-01）。
//
// 上位条款：
//   - 董事会急裁 docs/research/cc-loop-board-bgm-synth-scope.md §E **HG-B2**：同 spec
//     双用例串行（显式批准第二挂载）——用例 1（无种子挂载）覆盖断言 A–D / F / G / I / J
//     + H 之 `source:'user'` 半部；用例 2（addInitScript 种 `world-bgm-on='1'` 后新文档
//     挂载）覆盖 E + H 之 `source:'restore'` 半部。无种子用例不得要求 restore 事件，
//     restore 遥测合同在种子用例内闭合。
//   - 同急裁 §D 零资产三证之二：全程零音频资源网络请求（`.mp3/.m4a/.webm/.ogg/.opus`
//     过滤器——v0 恒真，同时为 v1 懒加载合同预置取证面），两用例都挂取证。
//   - 断言集正本 = 调研 docs/research/cc-bgm-rs.md §6（经 HG-B2 修订）；断言 J
//     （poster/像素基线零改动）走全量回归面既有断言，本 spec 不新增（§6-J 原文）。
//
// 取证双口径（CITY-AUD-01 同款）：
//   ① 独立口径：addInitScript 包裹 window.AudioContext 构造计数（不依赖实现自报）
//     + page.on('request') 音频资源过滤；
//   ② 实现口径：window.__worldAudio.state().bgm（enabled/playing/level/duck，
//     duck = HG-B1 串联双 GainNode 的合成有效值 1 − duckEngine×duckPulse）。
//
// 编排：world-chromium 串行 project（cyber-city.* 泛匹配自动收编）；MOUNT_TIMEOUT 210s
// / serial 口径照抄 CITY-AUD-01（HG-B2 明文不变项）。
// 注意（避坑 §10-2 照抄）：playwright launchOptions 带
// --autoplay-policy=no-user-gesture-required（TTS 既有旗标），本 spec「首手势前零
// AudioContext」断言的是懒创建合同本身而非浏览器政策——合规靠代码结构不靠测试环境。
import { test, expect, type Page } from '@playwright/test';
import { u } from './helpers';

const PAGE_URL = u('/');

const SEL = {
  host: '[data-world-host]',
  transform: '[data-world-transform]',
  audio: '[data-world-audio]',
  bgm: '[data-world-bgm]',
} as const;

/** 挂载等待（SwiftShader 校准口径，cyber-city.spec.ts 文件头⑤）：全链实测 ~75-110s */
const MOUNT_TIMEOUT = 210_000;

/** §D 三证之二音频资源过滤器（断言 C 独立口径；v0 恒真 + v1 懒加载合同预置） */
const AUDIO_URL_RE = /\.(mp3|m4a|webm|ogg|opus)(\?|#|$)/i;

/** 实现口径②：__worldAudio.state() 探针形状（bgm 为 [CC-BGM-C1] 扩展字段） */
interface BgmProbe {
  enabled: boolean;
  playing: boolean;
  level: number;
  duck: number;
}
interface AudioProbe {
  unlocked: boolean;
  running: boolean;
  muted: boolean;
  engineLevel: number;
  counts: { transform: number; impact: number; skid: number };
  bgm: BgmProbe | null;
}

/** SessionTimeline dump 消费面（断言 H：world-bgm 事件形状按 source 拆分取证） */
interface BgmEventEntry {
  type: string;
  data?: Record<string, string | number | boolean>;
}

/** 独立口径①：AudioContext 构造计数包裹（CITY-AUD-01 同式，页面脚本运行前注入） */
const CTX_COUNT_INIT = () => {
  const RealCtx = window.AudioContext;
  let count = 0;
  (window as unknown as { __audioCtxCount: () => number }).__audioCtxCount = () => count;
  const Patched = function (this: unknown, ...args: unknown[]) {
    count += 1;
    return new (RealCtx as unknown as new (...a: unknown[]) => AudioContext)(...args);
  };
  Patched.prototype = RealCtx.prototype;
  (window as unknown as { AudioContext: unknown }).AudioContext = Patched;
};

const readCtxCount = (page: Page): Promise<number> =>
  page.evaluate(() => (window as unknown as { __audioCtxCount: () => number }).__audioCtxCount());

const readProbe = (page: Page): Promise<AudioProbe> =>
  page.evaluate(() => window.__worldAudio!.state() as AudioProbe);

const readBgmEvents = (page: Page): Promise<BgmEventEntry[]> =>
  page.evaluate(() => {
    const ws = (window as unknown as { __worldSession?: { dump(): unknown } }).__worldSession;
    if (!ws) throw new Error('__worldSession 未挂载');
    const dump = ws.dump() as { events: BgmEventEntry[] };
    return dump.events.filter((entry) => entry.type === 'world-bgm');
  });

const trackAudioRequests = (page: Page): string[] => {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (AUDIO_URL_RE.test(request.url())) requests.push(request.url());
  });
  return requests;
};

test.describe('科技城 BGM 氛围垫 @phase0（CC-BGM-C1 · world-chromium 串行 project）', () => {
  test.describe.configure({ mode: 'serial', timeout: 420_000 });

  test('CITY-BGM-01 用例1（无种子挂载）：懒创建回归 + 样式门 + 默认 OFF + 开关钮持久 + user 埋点 + 主静音优先 + 驾驶 ducking + 零音频请求', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const audioRequests = trackAudioRequests(page);
    await page.addInitScript(CTX_COUNT_INIT);

    await page.goto(PAGE_URL);
    const host = page.locator(SEL.host);
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    await expect(host).toHaveAttribute('data-world-state', 'robot_idle', { timeout: 120_000 });

    // ————— 断言 A：首手势前零 AudioContext（回归）+ BGM 构造前零实例 —————
    expect(
      await readCtxCount(page),
      '首手势前不得创建任何 AudioContext（门 4 / 禁③——BGM 模块顶层与构造前零音频节点）',
    ).toBe(0);
    const preGesture = await readProbe(page);
    expect(preGesture.unlocked, '探针口径同证：首手势前 unlocked=false').toBe(false);
    expect(preGesture.bgm, '解锁前 BgmLoop 不存在（惰性构造合同，§10-1）').toBeNull();

    // ————— 断言 B（robot_idle 半部）：BGM 钮 hidden —————
    await expect(page.locator(SEL.bgm)).toBeHidden();

    // ————— 首手势 = 变形 CTA 点击（pointerdown 解锁 → BgmLoop 构造）—————
    await page.locator(SEL.transform).click();

    // ————— 断言 B（transforming 半部）：钮已存在（解锁沿构造）但样式门 hidden —————
    await expect(host).toHaveAttribute('data-world-state', 'transforming', { timeout: 60_000 });
    await expect(page.locator(SEL.bgm)).toBeAttached();
    await expect(page.locator(SEL.bgm)).toBeHidden();

    await expect(host).toHaveAttribute('data-world-state', 'car_ready', { timeout: 120_000 });

    // ————— 断言 C：解锁后 BGM 默认不响（禁③ 默认 OFF 恒定，DP-B2 未确认前禁改）—————
    expect(await readCtxCount(page), '首手势后 AudioContext 已创建（解锁成立的对照面）').toBeGreaterThan(0);
    const postUnlock = await readProbe(page);
    expect(postUnlock.unlocked).toBe(true);
    expect(postUnlock.bgm, '解锁后 BgmLoop 已惰性构造').not.toBeNull();
    expect(postUnlock.bgm!.enabled, '默认 OFF：无记忆时开关恒关').toBe(false);
    expect(postUnlock.bgm!.playing, '默认不响：playing=false').toBe(false);
    expect(postUnlock.bgm!.level, '默认不响：子总线电平恒 0').toBe(0);

    // ————— 断言 D：开钮/关钮——playing + aria-pressed 翻转 + localStorage 写回 —————
    const bgmBtn = page.locator(SEL.bgm);
    await expect(bgmBtn).toBeVisible();
    await expect(bgmBtn).toHaveAttribute('aria-pressed', 'false');
    await bgmBtn.click();
    await expect(bgmBtn).toHaveAttribute('aria-pressed', 'true');
    expect(
      await page.evaluate(() => localStorage.getItem('world-bgm-on')),
      '开钮写回 localStorage（跨会话记忆）',
    ).toBe('1');
    expect((await readProbe(page)).bgm!.playing, '开钮 → playing=true').toBe(true);
    await bgmBtn.click();
    await expect(bgmBtn).toHaveAttribute('aria-pressed', 'false');
    expect(await page.evaluate(() => localStorage.getItem('world-bgm-on')), '关钮反向写回').toBe('0');
    expect((await readProbe(page)).bgm!.playing, '关钮 → playing=false').toBe(false);

    // ————— 断言 H（'user' 半部）：开/关各一条 world-bgm；无种子场景零 restore 事件 —————
    const userEvents = await readBgmEvents(page);
    expect(
      userEvents.map((entry) => entry.data),
      '开/关各产生一条 world-bgm（source: user）',
    ).toEqual([
      { enabled: true, source: 'user' },
      { enabled: false, source: 'user' },
    ]);

    // 再开钮（F/G 前置：进入唯一新增听感态 ON）
    await bgmBtn.click();
    await expect(bgmBtn).toHaveAttribute('aria-pressed', 'true');

    // ————— 断言 F：主静音优先——音效钮 OFF 时 BGM 层状态保持（master 总线机器面）—————
    const audioBtn = page.locator(SEL.audio);
    await audioBtn.click();
    const mutedState = await readProbe(page);
    expect(mutedState.muted, '音效钮 OFF → master 静音').toBe(true);
    expect(mutedState.bgm!.playing, 'BGM 钮态/playing 保持（§4.1 状态矩阵：总线 0 非 ducking）').toBe(true);
    await expect(bgmBtn).toHaveAttribute('aria-pressed', 'true');
    await audioBtn.click(); // 回开声：G 段在开声态取证
    expect((await readProbe(page)).muted).toBe(false);

    // ————— 断言 G：驾驶 ducking——duck（合成有效值）自静止基线显著抬升 —————
    const idleDuck = (await readProbe(page)).bgm!.duck;
    await page.keyboard.down('w');
    try {
      await expect(host).toHaveAttribute('data-world-state', 'driving', { timeout: 60_000 });
      await expect
        .poll(async () => (await readProbe(page)).bgm!.duck, {
          message: '驾驶后 bgm.duck > 0 且高于静止基线（连续侧链随 engineLevel，§4.2）',
          timeout: 45_000,
        })
        .toBeGreaterThan(Math.max(0.15, idleDuck + 0.05));
    } finally {
      await page.keyboard.up('w').catch(() => {});
    }

    // ————— 断言 C 独立口径 / §D 三证之二：全程零音频资源网络请求 —————
    expect(audioRequests, '零 .mp3/.m4a/.webm/.ogg/.opus 请求（零资产 v0 恒真）').toEqual([]);

    // ————— 断言 I：全程零 pageerror（CITY-AUD-01 回归另由同 project 串行共存保障）—————
    expect(errors, 'BGM 层全程零未捕获异常').toEqual([]);
  });

  test('CITY-BGM-01 用例2（种子 world-bgm-on=1 挂载）：解锁沿自动恢复播放（E）+ restore 埋点（H 后半）', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const audioRequests = trackAudioRequests(page);
    await page.addInitScript(() => {
      try {
        localStorage.setItem('world-bgm-on', '1');
      } catch {
        /* 忽略 */
      }
    });
    await page.addInitScript(CTX_COUNT_INIT);

    await page.goto(PAGE_URL);
    const host = page.locator(SEL.host);
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    await expect(host).toHaveAttribute('data-world-state', 'robot_idle', { timeout: 120_000 });

    // ————— 断言 E 前半：记忆在场也不得提前——首手势前零 ctx 且 bgm 不存在 —————
    expect(
      await readCtxCount(page),
      '种子 world-bgm-on=1 在场时首手势前仍零 AudioContext（恢复恒晚于解锁，硬门 4）',
    ).toBe(0);
    const preGesture = await readProbe(page);
    expect(preGesture.unlocked).toBe(false);
    expect(preGesture.bgm, 'unlocked=true 前 bgm 不存在/不响').toBeNull();

    // ————— 首手势 = 变形 CTA → 解锁沿自动恢复播放 —————
    await page.locator(SEL.transform).click();
    await expect(host).toHaveAttribute('data-world-state', 'car_ready', { timeout: 120_000 });

    const restored = await readProbe(page);
    expect(restored.unlocked).toBe(true);
    expect(restored.bgm!.enabled, '记忆还原：开关态 ON').toBe(true);
    expect(restored.bgm!.playing, '解锁沿后自动恢复播放（硬门 4 明文语义）').toBe(true);
    await expect(page.locator(SEL.bgm)).toBeVisible();
    await expect(page.locator(SEL.bgm)).toHaveAttribute('aria-pressed', 'true');

    // ————— 断言 H（'restore' 半部）：恢复沿恰一条 source:'restore'、零 'user' —————
    const restoreEvents = await readBgmEvents(page);
    expect(
      restoreEvents.map((entry) => entry.data),
      '记忆恢复沿恰产生一条 world-bgm（source: restore）',
    ).toEqual([{ enabled: true, source: 'restore' }]);

    // §D 三证之二覆盖第二挂载 + 零 pageerror
    expect(audioRequests, '种子用例同样零音频资源请求').toEqual([]);
    expect(errors, '恢复路径全程零未捕获异常').toEqual([]);
  });
});
