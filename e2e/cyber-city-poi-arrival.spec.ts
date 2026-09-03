// POI 进站前奏验收（CC-FXN-C3）—— docs/spec/cyber-city-function-test-plan.md §3.3
// CITY-PA-01…04，world-chromium 串行 project（playwright.config testMatch
// cyber-city.*\.spec\.ts 自动收编）。
//
// 被测面 = areas/PoiArrival.ts（CAM F1 进站前奏）：圈内 E → world-poi →
// shot-apply{id} → 0.8s tween 至 poi_showcase-* 机位 → 0.4s 定帧 → navigate；
// 驾驶意图（RELEASE_ACTIONS）随时中断 → shot-interrupt{by:'drive'} + 相机回跟随。
//
// 纪律（§2 硬约束，与 cyber-city-observability.spec.ts 同源）：
//   - SwiftShader 慢动作：只断存在性/顺序性（seq 序、终态），禁对 t 值/时长设阈值
//     （前奏 1.2 游戏秒在软渲染下 ≈ 数十秒墙钟，早退互证一律事件驱动等待）；
//   - route abort 跳转前取证（CITY-OBS-01 先例）：abort 掉 navigate 请求保住 JS
//     上下文，拦截后 dump/遥测照常可用。errorCode 必须显式 'aborted'
//     （net::ERR_ABORTED 静默取消）——前奏把 navigate 推迟到 ticker 回调，用户
//     手势已过期，默认 'failed'（net::ERR_FAILED）会提交错误页销毁上下文
//     （本 PR 实测；OBS-01 同步适配，function-test-plan §3.3 留痕行）；
//   - 恒等门：robot_idle 期 poiInteract 被 Inputs filters（intro）物理拦截，
//     前奏路径完全不可达（CITY-PA-04 复证）。
//
// 与冻结表建议稿的一处显式偏差（实现事实所迫，§3.3 e2e 行回填 + PR 描述登记）：
//   CITY-PA-02 的「data-drive-view 恢复驾驶视角」——deep-link 非 ritual 腿无 Reveal
//   状态机（data-world-state/data-drive-view 属性缺席），相机回跟随改用引擎侧遥测
//   __worldSpike.state().shot === null（View.shotId 单源）+ 零 navigate 终态断言。
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { u } from './helpers';

const PAGE_URL = u('/');

/** 挂载等待（cyber-city.spec.ts 文件头⑤ SwiftShader 校准口径） */
const MOUNT_TIMEOUT = 210_000;

/** 进站目标 = autodrive-lab：?poi= 出生即落触发圈内（parkingBay 圆心），E 立即可交互 */
const POI_SLUG = 'autodrive-lab';
/** showcase shot 键（PoiArrival 数据驱动开关口径：`poi_showcase-<buildingId>`） */
const SHOT_ID = `poi_showcase-${POI_SLUG}`;

const SEL = {
  host: '[data-world-host]',
  enter: '[data-world-enter]',
} as const;

/* ———— 数据单源（Node ESM 下 JSON 用 fs 读——AGENTS 已知坑；CITY-VEH-07 先例） ———— */

const buildingsJson = JSON.parse(
  readFileSync(new URL('../src/data/cyber-city-buildings.json', import.meta.url), 'utf8'),
) as { buildings: Array<{ id: string; deepLink: string; hallPath?: string; neonColor: string }> };
const targetBuilding = buildingsJson.buildings.find((b) => b.id === POI_SLUG);
if (!targetBuilding) throw new Error(`buildings JSON 缺少 ${POI_SLUG}`);
/** navigate 目标（route abort 模式；base=/website 同 OBS-01） */
/** ADR-2（About Hall）：进站 navigate 统一带 `?from=city&poi=<id>`；正则容纳可选 query，路径仍以 deepLink 为准 */
const NAV_ROUTE = new RegExp('/website' + targetBuilding.deepLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\?.*)?$');

const cameraShotsJson = JSON.parse(
  readFileSync(new URL('../src/data/camera-shots.json', import.meta.url), 'utf8'),
) as { shots: Record<string, { mode: string } | undefined> };

/* ———— dump schema 消费侧最小面（observability spec 同构） ———— */

interface SessionEventEntry {
  seq: number;
  t: number;
  type: string;
  data?: Record<string, string | number | boolean>;
}

interface SessionDump {
  env: { reducedMotion: boolean };
  events: SessionEventEntry[];
  funnel: { firstPoiIn: number | null; firstPoiInteract: number | null };
}

/** UA 级已知异常白名单（world-spike.spec.ts 先例）：跨文档 View Transition 跳过 */
const isKnownUaError = (msg: string): boolean => /Transition was skipped/.test(msg);

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

async function readDump(page: Page): Promise<SessionDump> {
  return page.evaluate(() => {
    const ws = (window as unknown as { __worldSession?: { dump(): unknown } }).__worldSession;
    if (!ws) throw new Error('__worldSession 未挂载');
    return ws.dump() as SessionDump;
  });
}

/** 引擎侧 shot 遥测（__worldSpike.state().shot = View.shotId 单源；null = 玩家跟随） */
async function readShot(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const ws = (window as unknown as { __worldSpike?: { state(): { shot: string | null } } })
      .__worldSpike;
    if (!ws) throw new Error('__worldSpike 未挂载');
    return ws.state().shot;
  });
}

/** #debug 腿：输出相机世界高度（showcase 高位机位 ≈34.6m ≫ 跟随档 ≈5-7m 的取景真值） */
async function readCameraY(page: Page): Promise<number> {
  return page.evaluate(() => {
    const game = (window as unknown as {
      __worldSpikeGame?: { view: { camera: { position: { y: number } } } };
    }).__worldSpikeGame;
    if (!game) throw new Error('__worldSpikeGame 未挂载（需 #debug）');
    return game.view.camera.position.y;
  });
}

/** 轮询 dump 直至谓词满足（observability spec 同款） */
async function pollDump(
  page: Page,
  pred: (d: SessionDump) => boolean,
  timeoutMs: number,
  intervalMs = 1_000,
): Promise<{ ok: boolean; dump: SessionDump }> {
  const deadline = Date.now() + timeoutMs;
  let dump = await readDump(page);
  while (!pred(dump)) {
    if (Date.now() > deadline) return { ok: false, dump };
    await page.waitForTimeout(intervalMs);
    dump = await readDump(page);
  }
  return { ok: true, dump };
}

/** E 键重试直至 dump 谓词满足（OBS-01 E 循环先例：标点开合节拍冗余） */
async function pressEUntil(
  page: Page,
  pred: (d: SessionDump) => boolean,
  timeoutMs: number,
): Promise<{ ok: boolean; dump: SessionDump }> {
  const deadline = Date.now() + timeoutMs;
  let dump = await readDump(page);
  if (pred(dump)) return { ok: true, dump };
  while (Date.now() < deadline) {
    await page.keyboard.press('e');
    const hit = await pollDump(page, pred, 5_000);
    dump = hit.dump;
    if (hit.ok) return { ok: true, dump };
  }
  return { ok: false, dump };
}

const firstOf = (dump: SessionDump, type: string): SessionEventEntry | undefined =>
  dump.events.find((e) => e.type === type);

test.describe('科技城 POI 进站前奏（CC-FXN-C3 · world-chromium 串行 project）', () => {
  // 3D 挂载单例互斥（cyber-city.spec.ts 同纪律）；长用例单独 setTimeout 放宽
  test.describe.configure({ mode: 'serial', timeout: 420_000 });

  // ---------------------------------------------------------------------------
  // CITY-PA-01 前奏时序
  // 条款：§3.3——圈内 E → dump 依序 world-poi{id} / shot-apply{id}（seq 序断言，
  //       禁时长阈值）→ route abort 拦下 navigate（OBS-01 先例）→ 拦截点前 dump
  //       已含两事件（「跳转前取证」合同延续）。#debug 腿补取景真值：定帧机位
  //       高度 ≫ 跟随档（showcase 帧确实生效，非只有埋点）。
  // ---------------------------------------------------------------------------
  test('CITY-PA-01 前奏时序：圈内 E → world-poi/shot-apply seq 序 → 定帧后 navigate 被拦（跳转前取证）', async ({ page }) => {
    test.setTimeout(600_000);
    const errors = trackErrors(page);

    // 数据面前置：showcase 条目必须登记（PoiArrival 数据驱动开关——缺条目即降级直跳，
    // 本用例的前奏路径失效属注册表回归而非引擎回归，就地报因）
    expect(cameraShotsJson.shots[SHOT_ID]?.mode, `camera-shots.json 应登记 ${SHOT_ID}`).toBe('poi');

    let navHits = 0;
    await page.route(NAV_ROUTE, (route) => {
      navHits += 1;
      void route.abort('aborted');
    });

    await page.goto(`${PAGE_URL}?poi=${POI_SLUG}#debug`);
    const host = page.locator(SEL.host);
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });

    // ?poi= 深链出生即在触发圈内：poi-bounding-in 自然入账（标点展开，E 可交互）
    const entered = await pollDump(page, (d) => d.funnel.firstPoiIn !== null, 90_000);
    expect(entered.ok, '深链出生应落触发圈内（poi-bounding-in）').toBe(true);

    // 前奏未生效前的跟随档机位高度（对照读数：showcase 定帧应显著抬升）
    const followCameraY = await readCameraY(page);

    // E 进站：world-poi 交互帧即入账（前奏不推迟取证），shot-apply 同调用内随行
    const interacted = await pressEUntil(page, (d) => firstOf(d, 'world-poi') !== undefined, 120_000);
    expect(interacted.ok, 'E 应触发 world-poi').toBe(true);

    // seq 序断言（存在性/顺序性，禁时长阈值）：world-poi < shot-apply
    const poiEvent = firstOf(interacted.dump, 'world-poi');
    const applyEvent = firstOf(interacted.dump, 'shot-apply');
    expect(poiEvent?.data?.id).toBe(POI_SLUG);
    expect(applyEvent, 'E 后 shot-apply 应入账（OBS §3.4 camera 族转正行）').toBeTruthy();
    expect(applyEvent!.data?.id).toBe(SHOT_ID);
    expect(applyEvent!.seq, 'shot-apply 应晚于 world-poi（seq 序）').toBeGreaterThan(poiEvent!.seq);

    // 引擎侧遥测互证：前奏起帧即挂 shot id（View.shotId 单源）
    expect(await readShot(page)).toBe(SHOT_ID);

    // 前奏走完（tween 0.8 + 定帧 0.4 游戏秒，慢动作下数十秒墙钟）→ navigate 发出
    // 并被 route abort 拦下——上下文存续 =「跳转前取证」确定性成立
    await expect
      .poll(() => navHits, { timeout: 240_000 })
      .toBeGreaterThanOrEqual(1);

    // 取景真值：定帧机位高度显著高于跟随档（poi_showcase-autodrive-lab 高位 3/4
    // 展示帧 ≈34.6m vs 跟随档 ≈5-7m；状态断言非时长断言）
    const showcaseCameraY = await readCameraY(page);
    expect(showcaseCameraY, 'showcase 定帧机位应显著抬升').toBeGreaterThan(25);
    expect(showcaseCameraY).toBeGreaterThan(followCameraY + 10);
    await page.screenshot({ path: 'test-results/poi-arrival-showcase.png' });

    // 拦截后取证面完整：事件仍在账、JS 上下文可用；本用例零驾驶输入 → 零 shot-interrupt
    const finalDump = await readDump(page);
    expect(firstOf(finalDump, 'world-poi')).toBeTruthy();
    expect(firstOf(finalDump, 'shot-apply')).toBeTruthy();
    expect(firstOf(finalDump, 'shot-interrupt')).toBeUndefined();

    expect(errors.filter((m) => !isKnownUaError(m)), '前奏时序零未捕获异常').toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // CITY-PA-02 驾驶中断
  // 条款：§3.3——前奏播放窗内压 W → dump 出现 shot-interrupt{by:'drive'} 且其
  //       seq > 对应 shot-apply、相机恢复驾驶跟随、不发生 navigate（route 零命中）
  //       ——断因果序与终态，不断 0.1s 时长（§2-4）。相机恢复口径 = 引擎遥测
  //       state().shot === null（文件头偏差注记：deep-link 腿无 data-drive-view）。
  // ---------------------------------------------------------------------------
  test('CITY-PA-02 驾驶中断：前奏窗内压 W → shot-interrupt{by:drive} seq 序 + 相机回跟随 + 零 navigate', async ({ page }) => {
    test.setTimeout(600_000);
    const errors = trackErrors(page);

    let navHits = 0;
    await page.route(NAV_ROUTE, (route) => {
      navHits += 1;
      void route.abort('aborted');
    });

    await page.goto(`${PAGE_URL}?poi=${POI_SLUG}`);
    const host = page.locator(SEL.host);
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });

    const entered = await pollDump(page, (d) => d.funnel.firstPoiIn !== null, 90_000);
    expect(entered.ok, '深链出生应落触发圈内').toBe(true);

    // E 进站 → shot-apply 入账（前奏窗开启；tween 0.8 游戏秒在慢动作下 ≥ 数十秒墙钟，
    // 下方 W 压入必然落在播放窗内——事件驱动等待，非时长赌注）
    const interacted = await pressEUntil(page, (d) => firstOf(d, 'shot-apply') !== undefined, 120_000);
    expect(interacted.ok, 'E 应触发 shot-apply（前奏开启）').toBe(true);

    // 前奏窗内压 W：驾驶意图同帧中断（design F1「0.1s 内交还」的实现上界）
    await page.keyboard.down('w');
    let result: { ok: boolean; dump: SessionDump };
    try {
      result = await pollDump(page, (d) => firstOf(d, 'shot-interrupt') !== undefined, 60_000);
    } finally {
      await page.keyboard.up('w').catch(() => {});
    }
    expect(result.ok, '前奏窗内 W 应触发 shot-interrupt').toBe(true);

    // 因果序：shot-interrupt{by:'drive'} 晚于对应 shot-apply
    const applyEvent = firstOf(result.dump, 'shot-apply')!;
    const interruptEvent = firstOf(result.dump, 'shot-interrupt')!;
    expect(interruptEvent.data?.by).toBe('drive');
    expect(interruptEvent.seq, 'shot-interrupt 应晚于 shot-apply（seq 序）').toBeGreaterThan(applyEvent.seq);

    // 相机回驾驶跟随（引擎遥测口径，文件头偏差注记）：shot 遥测清空
    expect(await readShot(page), '中断后 View.shotId 应清空（相机回玩家跟随）').toBe(null);

    // 终态负断言：中断已弃 navigate——route 零命中（给慢动作留余量后核账，
    // 因果证据已由 shot-interrupt + shot 清空提供，此处为合同兜底）
    await page.waitForTimeout(10_000);
    expect(navHits, '中断路径不得发 navigate').toBe(0);
    await page.screenshot({ path: 'test-results/poi-arrival-interrupt.png' });

    expect(errors.filter((m) => !isKnownUaError(m)), '驾驶中断零未捕获异常').toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // CITY-PA-03 reduced-motion 降级
  // 条款：§3.3——前奏按 CAM 规格降级（本 PR 冻结口径 = design F1 红线「直切
  //       showcase 定帧」，tween 跳过）、核心进站路径可完成、world-poi 照常入 dump。
  //       直切证据 = shot-apply 首次观测拍相机已在 showcase 高位机位（tween 路径
  //       此拍尚在起步段——状态断言非时长阈值）。
  // ---------------------------------------------------------------------------
  test('CITY-PA-03 reduced-motion：直切定帧（零 tween）+ world-poi 照常 + 进站路径可完成', async ({ page }) => {
    test.setTimeout(600_000);
    const errors = trackErrors(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });

    let navHits = 0;
    await page.route(NAV_ROUTE, (route) => {
      navHits += 1;
      void route.abort('aborted');
    });

    await page.goto(`${PAGE_URL}?poi=${POI_SLUG}#debug`);
    const host = page.locator(SEL.host);
    // 壳四条件拦截：reduced-motion 走显式进入（CITY-FB-05 同口径）
    await expect(host).toHaveAttribute('data-blocked', 'reduced-motion');
    await host.locator(SEL.enter).click();
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });

    // 降级判定与 SessionTimeline env 同 matchMedia 口径（互证）
    const dump0 = await readDump(page);
    expect(dump0.env.reducedMotion).toBe(true);

    const entered = await pollDump(page, (d) => d.funnel.firstPoiIn !== null, 90_000);
    expect(entered.ok, '深链出生应落触发圈内').toBe(true);

    // E 进站：world-poi 照常入 dump（核心路径不因偏好剥夺）+ shot-apply 随行
    const interacted = await pressEUntil(page, (d) => firstOf(d, 'shot-apply') !== undefined, 120_000);
    expect(interacted.ok, 'E 应照常触发 world-poi + shot-apply').toBe(true);
    const poiEvent = firstOf(interacted.dump, 'world-poi');
    const applyEvent = firstOf(interacted.dump, 'shot-apply')!;
    expect(poiEvent?.data?.id).toBe(POI_SLUG);
    expect(applyEvent.seq).toBeGreaterThan(poiEvent!.seq);

    // 直切定帧证据：shot-apply 首次观测拍相机已在 showcase 高位（≈34.6m；tween
    // 路径同拍仍近跟随档 ≈5-7m）——降级 = 瞬时应用（C3 冻结口径）
    expect(await readShot(page)).toBe(SHOT_ID);
    expect(await readCameraY(page), 'reduced-motion 应直切 showcase 定帧').toBeGreaterThan(25);

    // 定帧驻留后 navigate 照常发出（进站路径可完成；route abort 拦下取证）
    await expect
      .poll(() => navHits, { timeout: 240_000 })
      .toBeGreaterThanOrEqual(1);
    await page.screenshot({ path: 'test-results/poi-arrival-reduced-motion.png' });

    expect(errors.filter((m) => !isKnownUaError(m)), 'reduced-motion 腿零未捕获异常').toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // CITY-PA-04 恒等门
  // 条款：§3.3——robot_idle 期 E/前奏路径完全不可达（既有门禁复证）：poiInteract
  //       categories 只挂 wandering/driving，intro filter 物理拦截（CITY-HINT-01
  //       ① 同款 H 键先例）。零 world-poi/shot-apply/shot-interrupt + View 零触碰。
  // ---------------------------------------------------------------------------
  test('CITY-PA-04 恒等门：robot_idle 期 E 完全不可达（零事件 + View 零触碰）', async ({ page }) => {
    test.setTimeout(600_000);
    const errors = trackErrors(page);

    await page.goto(PAGE_URL); // 默认剧本 = ritual 首幕（终裁 D4）
    const host = page.locator(SEL.host);
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    await expect(host).toHaveAttribute('data-world-state', 'robot_idle', { timeout: 120_000 });

    // E 连按：intro filter 物理拦截（拦在动作路由层，PoiArrival 根本不可达）
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('e');
      await page.waitForTimeout(1_000);
    }

    const dump = await readDump(page);
    for (const type of ['world-poi', 'shot-apply', 'shot-interrupt']) {
      expect(
        dump.events.some((e) => e.type === type),
        `robot_idle 期不得出现 ${type}`,
      ).toBe(false);
    }
    // View 零触碰（零漂移合同）：shot 遥测恒 null + 状态机原地
    expect(await readShot(page)).toBe(null);
    await expect(host).toHaveAttribute('data-world-state', 'robot_idle');

    expect(errors.filter((m) => !isKnownUaError(m)), '恒等门零未捕获异常').toEqual([]);
  });
});

test.describe('AH-T1b hold overlay（ADR-4 决策 B）', () => {
  test.describe.configure({ timeout: 600_000 });

  const HOLD_CLASS = 'world-poi-hold-pulse';
  const aboutPavilion = buildingsJson.buildings.find((b) => b.id === 'about-pavilion');
  if (!aboutPavilion) throw new Error('buildings JSON 缺少 about-pavilion');
  const ABOUT_NEON = aboutPavilion.neonColor;
  const ABOUT_DEST = aboutPavilion.hallPath ?? aboutPavilion.deepLink;
  const ABOUT_NAV_ROUTE = new RegExp(
    '/website' + ABOUT_DEST.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\?.*)?$',
  );

  const overlayOn = (target: Page): Promise<boolean> =>
    target.evaluate((cls) => document.documentElement.classList.contains(cls), HOLD_CLASS);

  /** 锁存「出现过 + 当时 neon」，不记墙钟（400ms 脉冲会被 poll 间隔漏掉） */
  const installHoldLatch = (target: Page): Promise<void> =>
    target.evaluate((cls) => {
      const w = window as unknown as { __poiHoldLatch?: { seen: boolean; neon: string } };
      w.__poiHoldLatch = { seen: false, neon: '' };
      const mark = () => {
        const root = document.documentElement;
        if (!root.classList.contains(cls) || w.__poiHoldLatch!.seen) return;
        w.__poiHoldLatch!.seen = true;
        w.__poiHoldLatch!.neon = root.style.getPropertyValue('--poi-hold-neon').trim();
      };
      new MutationObserver(mark).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
      mark();
    }, HOLD_CLASS);

  const readLatch = (target: Page): Promise<{ seen: boolean; neon: string }> =>
    target.evaluate(
      () =>
        (window as unknown as { __poiHoldLatch?: { seen: boolean; neon: string } }).__poiHoldLatch ?? {
          seen: false,
          neon: '',
        },
    );

  test('AH-T1b hold overlay：hold 起帧挂类且一次性卸；reduced-motion 不挂', async ({
    page,
    browser,
  }) => {
    test.setTimeout(600_000);
    const errors = trackErrors(page);

    await page.route(ABOUT_NAV_ROUTE, (route) => {
      void route.abort('aborted');
    });

    await page.goto(`${PAGE_URL}?poi=about-pavilion#debug`);
    const host = page.locator(SEL.host);
    await expect(host).toBeVisible({ timeout: 60_000 });
    try {
      await expect(host).toHaveAttribute('data-state', 'ready', { timeout: 90_000 });
    } catch {
      await host.locator(SEL.enter).click();
      await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    }

    const entered = await pollDump(page, (d) => d.funnel.firstPoiIn !== null, 90_000);
    expect(entered.ok, '深链出生应落触发圈内').toBe(true);

    await installHoldLatch(page);
    const interacted = await pressEUntil(page, (d) => firstOf(d, 'shot-apply') !== undefined, 120_000);
    expect(interacted.ok, 'E 应触发 shot-apply（前奏开启）').toBe(true);

    // 状态语义（禁墙钟阈值）：hold 起帧 class 在 + neon 单源 JSON；卸类 poll 等到 false（15s 是等待上限）
    await expect.poll(async () => (await readLatch(page)).seen, { timeout: 240_000, intervals: [50] }).toBe(true);
    expect((await readLatch(page)).neon, 'hold 起帧 --poi-hold-neon 须等于 about-pavilion.neonColor').toBe(
      ABOUT_NEON,
    );
    await expect.poll(() => overlayOn(page), { timeout: 15_000, intervals: [50] }).toBe(false);
    await page.waitForTimeout(1_000);
    expect(await overlayOn(page), 'overlay 一次性：卸类后 1s 内不得重挂').toBe(false);

    // 新页 + 先 emulateMedia 再 goto（CITY-PA-03 同序）；同页后设偏好会错过壳四条件检查
    const rm = await browser.newPage();
    const rmErrors = trackErrors(rm);
    let rmNavHits = 0;
    await rm.emulateMedia({ reducedMotion: 'reduce' });
    await rm.route(ABOUT_NAV_ROUTE, (route) => {
      rmNavHits += 1;
      void route.abort('aborted');
    });
    await rm.goto(`${PAGE_URL}?poi=about-pavilion#debug`);
    const rmHost = rm.locator(SEL.host);
    await expect(rmHost).toHaveAttribute('data-blocked', 'reduced-motion');
    await rmHost.locator(SEL.enter).click();
    await expect(rmHost).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });

    const dump0 = await readDump(rm);
    expect(dump0.env.reducedMotion).toBe(true);

    const enteredRm = await pollDump(rm, (d) => d.funnel.firstPoiIn !== null, 90_000);
    expect(enteredRm.ok, 'reduced-motion 深链出生应落触发圈内').toBe(true);

    await installHoldLatch(rm);
    const interactedRm = await pressEUntil(
      rm,
      (d) => firstOf(d, 'shot-apply') !== undefined,
      120_000,
    );
    expect(interactedRm.ok, 'reduced-motion E 应照常 shot-apply').toBe(true);
    await expect.poll(() => rmNavHits, { timeout: 240_000, intervals: [200] }).toBeGreaterThanOrEqual(1);
    expect((await readLatch(rm)).seen, 'reduced-motion 不得挂 hold overlay 类').toBe(false);
    expect(await overlayOn(rm)).toBe(false);
    await rm.close();

    expect(
      [...errors, ...rmErrors].filter((m) => !isKnownUaError(m)),
      'hold overlay 腿零未捕获异常',
    ).toEqual([]);
  });
});
