// 可观测性验收（CC-OBS-C2）—— docs/spec/cyber-city-observability.md §7 冻结用例表
// CITY-OBS-01…06，world-chromium 串行 project（既有 52 用例零改动）。
//
// 补充纪律（§7 尾注）：全程监听 pageerror 断零（UA 级 View Transition 跳过白名单
// 沿用 world-spike 先例）；SwiftShader 下只断存在性/顺序性，禁止对 t 值设阈值。
//
// 与冻结表的两处显式偏差（实现事实所迫，PR 描述登记）：
//   ① CITY-OBS-01 动线的「撞锥桶」在生产 `/` 不可达——CC-L1 A2 已把试车锥桶撤出
//      城市取景档（World.setCones 仅 greybox 档执行，knockedConeCount 恒 0）。
//      cone-hit 覆盖改由 CITY-OBS-01b（/world-spike/ 灰盒档）补充 dump 提供，
//      CITY-OBS-06 以 §6.2 冻结的多 dump 并集机制合并计分——分母与断言口径不变。
//   ② OBS-01 动线增加 V 视角往返两拍：CC-VEH-VIEW 已合流（PR #54），
//      world-drive-view 覆盖随动线自然命中（§3.4 预留行已激活，零补丁语义）。
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { u } from './helpers';

const PAGE_URL = u('/');
const HOME_URL = u('/home/');
const SPIKE_URL = u('/world-spike/');

/** 状态机等待（cyber-city.spec.ts 校准 ~75-110s + 并行 CI 负载挤兑余量） */
const MOUNT_TIMEOUT = 300_000;

const SEL = {
  host: '[data-world-host]',
  transform: '[data-world-transform]',
} as const;

/**
 * debug chunk 定位（CITY-OBS-05）：astro.config.mjs chunkFileNames 把 world 域
 * chunk 统一命名 world.<hash>.js（G-G(world) 直测全覆盖）——debug chunk 无法按
 * 文件名区分，改按内容寻址：扫 dist/_astro 找含面板 DOM 契约标记的 JS 文件。
 * 正腿断言该文件被请求（自证寻址有效），负腿断言零请求。
 */
function findDebugChunkName(): string {
  const dir = 'dist/_astro';
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.js')) continue;
    if (readFileSync(join(dir, file), 'utf8').includes('data-debug-panel')) return file;
  }
  throw new Error('dist/_astro 未找到含 data-debug-panel 的 debug chunk（先 astro build）');
}

/** CI 工件路径（§6.1 工件总表；CITY-OBS-06 消费） */
const FUNNEL_DUMP = 'test-results/session-dump-funnel.json';
const CONES_DUMP = 'test-results/session-dump-cones.json';

/** UA 级已知异常白名单（world-spike.spec.ts 先例）：声明式跨文档 View Transition
 *  在 SwiftShader 下离页被跳过，Chromium 上抛「Transition was skipped」——仅此放行 */
const isKnownUaError = (msg: string): boolean => /Transition was skipped/.test(msg);

/* ———————————————————— dump schema（§3.2 v1 的消费侧最小面） ———————————————————— */

interface SessionEventEntry {
  seq: number;
  t: number;
  type: string;
  data?: Record<string, string | number | boolean>;
}

interface SessionDump {
  schemaVersion: number;
  sessionId: string;
  startedAt: string;
  env: {
    backend: string;
    vehicle: string;
    quality: number;
    reducedMotion: boolean;
    dpr: number;
    viewport: { w: number; h: number };
    touch: boolean;
  };
  events: SessionEventEntry[];
  dropped: number;
  counters: {
    respawns: number;
    coneHits: number;
    poiEnters: number;
    poiInteracts: number;
    transforms: number;
    driveViewToggles: number;
  };
  funnel: {
    reveal: number | null;
    robotIdle: number | null;
    transformStart: number | null;
    carReady: number | null;
    driveStart: number | null;
    firstPoiIn: number | null;
    firstPoiInteract: number | null;
  };
}

/** funnel 七步声明序（§3.2；function-smoke.mjs 同一常量） */
const FUNNEL_STEPS = [
  'reveal',
  'robotIdle',
  'transformStart',
  'carReady',
  'driveStart',
  'firstPoiIn',
  'firstPoiInteract',
] as const;

/* ———————————————————— 公共探针 ———————————————————— */

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

interface SpikeState {
  x: number;
  z: number;
  yaw: number;
  speedKmh: number;
  cones: number;
}

async function readSpike(page: Page): Promise<SpikeState> {
  return page.evaluate(() => {
    const ws = (window as unknown as { __worldSpike?: { state(): unknown } }).__worldSpike;
    if (!ws) throw new Error('__worldSpike 未挂载');
    return ws.state() as SpikeState;
  });
}

/** 落盘 + attach（§6.1：session-dump-<case>.json 证据非门） */
async function saveDump(testInfo: TestInfo, path: string, dump: SessionDump): Promise<void> {
  mkdirSync('test-results', { recursive: true });
  writeFileSync(path, JSON.stringify(dump, null, 2) + '\n');
  await testInfo.attach(path.split('/').pop() ?? path, { path, contentType: 'application/json' });
}

const wrapAngle = (a: number): number => Math.atan2(Math.sin(a), Math.cos(a));

interface Waypoint {
  x: number;
  z: number;
  radius: number;
}

/** state + fps 单次 evaluate 合并读（轮询开销减半；fps 供游戏时间推进率折算） */
async function readTelemetry(page: Page): Promise<{ state: SpikeState; fpsAvg: number }> {
  return page.evaluate(() => {
    const ws = (
      window as unknown as { __worldSpike?: { state(): unknown; fps(): { avg: number } } }
    ).__worldSpike;
    if (!ws) throw new Error('__worldSpike 未挂载');
    return { state: ws.state() as SpikeState, fpsAvg: ws.fps().avg };
  });
}

/**
 * 遥测闭环路径导航（world-spike pollState 先例的转向扩展）：按住 W，每 0.5s 读
 * __worldSpike.state()，按当前途径点方位差压/放 A/D（rotationY 约定：正 = 左转 =
 * KeyA，Player.steering += 1 / PhysicsVehicle steeringTarget 正左）；速度经
 * 闭环帽控制（详见循环内注释），直道远段 Shift 助推压缩所需游戏时间。
 *
 * 时基纪律（多轮实测教训）：CI 负载抖动下帧率可跌破 1fps，Ticker maxDelta=1/30
 * 使游戏时间推进率 ≈ min(fps,30)/30 游戏秒/墙秒（10×+ 慢放）——一切「卡死」判定
 * 必须以游戏时间累计（fps 取 __worldSpike.fps() 实测），任何墙钟阈值在慢放下都是
 * 系统性误报（实测 75s 位移阈值把正常起步误判成卡死，反复重生拽回原点）。
 *   · 卡死 = 位移 < 2m 且 speedKmh < 5 持续 ≥ 8 游戏秒（速度条件与 fps 滑窗滞后
 *     解耦：慢放起步 1 游戏秒内速度即爬过 5，永不累计；顶墙车速≈0 才累计）
 *     → R 重生（回首幕出生锚点）并把路径重置回首途径点重走。
 */
async function navigate(
  page: Page,
  path: Waypoint[],
  totalTimeoutMs: number,
): Promise<{ ok: boolean; state: SpikeState }> {
  let steering: 'a' | 'd' | null = null;
  let throttle = false;
  let braking = false;
  let boosting = false;
  let index = 0;
  let { state } = await readTelemetry(page);
  let lastPos = { x: state.x, z: state.z };
  let stuckGameSec = 0;
  let lastTickAt = Date.now();

  const setKeys = async (
    wantThrottle: boolean,
    wantBrake: boolean,
    wantBoost: boolean,
    wantSteer: 'a' | 'd' | null,
  ) => {
    if (wantThrottle !== throttle) {
      await (wantThrottle ? page.keyboard.down('w') : page.keyboard.up('w'));
      throttle = wantThrottle;
    }
    if (wantBrake !== braking) {
      await (wantBrake ? page.keyboard.down('Space') : page.keyboard.up('Space'));
      braking = wantBrake;
    }
    if (wantBoost !== boosting) {
      await (wantBoost ? page.keyboard.down('Shift') : page.keyboard.up('Shift'));
      boosting = wantBoost;
    }
    if (wantSteer !== steering) {
      if (steering) await page.keyboard.up(steering);
      if (wantSteer) await page.keyboard.down(wantSteer);
      steering = wantSteer;
    }
  };

  try {
    const deadline = Date.now() + totalTimeoutMs;
    while (Date.now() < deadline) {
      const now = Date.now();
      const wallDtSec = (now - lastTickAt) / 1000;
      lastTickAt = now;
      const telemetry = await readTelemetry(page);
      state = telemetry.state;
      // 游戏时间推进率：fps<30 时每帧推进恒 1/30s → rate=fps/30；样本不足（read()
      // 返回 0）时取保守下限 0.05fps——宁可少计（推迟自救）不可多计（误报重生）
      const rate = Math.min(Math.max(telemetry.fpsAvg, 0.05), 30) / 30;

      // 途径点推进（到达即切下一个；全部到达 = 成功）
      while (
        index < path.length &&
        Math.hypot(path[index].x - state.x, path[index].z - state.z) <= path[index].radius
      ) {
        index++;
      }
      if (index >= path.length) return { ok: true, state };

      const target = path[index];
      const distance = Math.hypot(target.x - state.x, target.z - state.z);
      const desired = Math.atan2(-(target.z - state.z), target.x - state.x); // forward=(cos r,0,-sin r) 反解
      const diff = wrapAngle(desired - state.yaw);
      const steer: 'a' | 'd' | null = diff > 0.12 ? 'a' : diff < -0.12 ? 'd' : null;

      // 闭环速度控制（上轮实测教训：高速下最小转弯半径 > 触发圈，车绕目标公转
      // 不收敛）：终点进近速度帽随距离线性收敛，急弯段一并限速压小转弯半径；
      // 超帽 8 以上点刹，超帽即松油滑行；直道远段 Shift 助推压缩游戏时间
      const finalLeg = index === path.length - 1;
      let speedCap = 50;
      if (finalLeg) speedCap = Math.min(speedCap, Math.max(10, distance * 1.5));
      if (Math.abs(diff) > 0.9) speedCap = Math.min(speedCap, 15);
      const overspeed = state.speedKmh > speedCap + 8;
      const throttleOn = state.speedKmh <= speedCap;
      const boost = throttleOn && distance > 20 && Math.abs(diff) < 0.3;
      await setKeys(throttleOn, overspeed, boost, steer);

      // 游戏时基卡死自救：位移 + 速度双条件累计 → R 重生 + 路径重置
      if (Math.hypot(state.x - lastPos.x, state.z - lastPos.z) > 2) {
        lastPos = { x: state.x, z: state.z };
        stuckGameSec = 0;
      } else if (state.speedKmh < 5) {
        stuckGameSec += wallDtSec * rate;
        if (stuckGameSec >= 8) {
          await setKeys(false, false, false, null);
          await page.keyboard.press('r');
          await page.waitForTimeout(4_000);
          index = 0;
          ({ state } = await readTelemetry(page));
          lastPos = { x: state.x, z: state.z };
          stuckGameSec = 0;
          lastTickAt = Date.now();
        }
      }
      await page.waitForTimeout(500);
    }
    return { ok: false, state };
  } finally {
    await page.keyboard.up('Space').catch(() => {});
    await page.keyboard.up('Shift').catch(() => {});
    if (steering) await page.keyboard.up(steering).catch(() => {});
    await page.keyboard.up('w').catch(() => {});
  }
}

/** 轮询 dump 直至谓词满足（超时返回最后一次 dump 并置 ok=false） */
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

test.describe('科技城可观测性 @phase0（CC-OBS-C2 · world-chromium 串行 project）', () => {
  // 3D 挂载单例互斥（cyber-city.spec.ts 同纪律）；长用例单独 setTimeout 放宽
  test.describe.configure({ mode: 'serial', timeout: 420_000 });

  // ---------------------------------------------------------------------------
  // CITY-OBS-01 漏斗全走 @funnel
  // 条款：§7 表首行——生产 `/` 走 CITY-E2E-03 同款动线到 driving，续驾至 POI
  //       触发圈 + E 进站（进站跳转前取证）→ dump 全量断言 → 落盘 + attach。
  //       动线增量：V 视角往返 ×2（偏差②）+ R 重生（respawn 覆盖；出生点即首幕
  //       锚点，零路程损失）。锥桶偏差①见文件头注。
  //       进站 = Areas onInteract 的 location.assign 真实跳转——route abort 拦下
  //       导航请求保住 JS 上下文（页面原地存续），「跳转前取证」确定性成立。
  // ---------------------------------------------------------------------------
  test('CITY-OBS-01 漏斗全走 @funnel：ritual 动线 + V 往返 + R 重生 + 驾驶进 POI + E 进站取证', async ({ page }, testInfo) => {
    // 时基纪律同 navigate 头注：robot_idle（ticker.wait 6 游戏秒）、变形仪式
    // （~8 游戏秒）等游戏时间驱动的 DOM 状态在 10×+ 慢放下需 15-20 分钟墙钟——
    // 等待值按最坏慢放放宽（expect 轮询即到即过，健康负载下不增加时长）
    test.setTimeout(5_400_000);
    const errors = trackErrors(page);

    // 进站目标 = autodrive-lab（parkingBay (28,-28) r6，deepLink /work/——
    // 出生 (0,0) 朝北的最近顺路 POI）；abort 该导航请求防上下文销毁
    await page.route('**/website/work/', (route) => route.abort());

    await page.goto(PAGE_URL);
    const host = page.locator(SEL.host);
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    await expect(host).toHaveAttribute('data-world-state', 'robot_idle', { timeout: 900_000 });

    // 变形仪式 → car_ready（CITY-E2E-03 同款动线；等待按慢放口径放宽）
    await page.locator(SEL.transform).click();
    await expect(host).toHaveAttribute('data-world-state', 'car_ready', { timeout: 1_200_000 });

    // 驾驶接管（world-drive-start）
    await page.keyboard.down('w');
    try {
      await expect(host).toHaveAttribute('data-world-state', 'driving', { timeout: 300_000 });
    } finally {
      await page.keyboard.up('w');
    }

    // V 往返 ×2：world-drive-view 覆盖（fpv → third 回位，动线其余段视角不变）
    await page.keyboard.press('v');
    await expect(host).toHaveAttribute('data-drive-view', 'fpv', { timeout: 120_000 });
    await page.keyboard.press('v');
    await expect(host).toHaveAttribute('data-drive-view', 'third', { timeout: 120_000 });

    // R 重生（reason 'key'）：出生点即首幕锚点，随后从原点起跑
    await page.keyboard.press('r');
    const respawned = await pollDump(page, (d) => d.counters.respawns >= 1, 90_000);
    expect(respawned.ok, 'R 重生应记入 respawn 事件').toBe(true);

    // 遥测闭环驾驶：沿路途径点走位（先北上 (0,-24) 避开路口隔离墩再东折）→
    // autodrive-lab 泊车位。卡死自救重生后回首途径点重走（重生点 = 首幕锚点 (0,0)）。
    const BAY_PATH: Waypoint[] = [
      { x: 0, z: -24, radius: 5 },
      { x: 28, z: -28, radius: 5.5 }, // POI 触发圈 r=6，5.5 = 圈内且留收敛余量
    ];
    const drive = await navigate(page, BAY_PATH, 3_000_000);
    expect(drive.ok, `泊车位 (28,-28) 应可达（实测 x=${drive.state.x.toFixed(1)} z=${drive.state.z.toFixed(1)}）`).toBe(true);

    // 触发圈进入（poi-bounding-in → firstPoiIn 首达）
    const entered = await pollDump(page, (d) => d.funnel.firstPoiIn !== null, 120_000);
    expect(entered.ok, '进入 parkingBay 触发圈应记 poi-bounding-in').toBe(true);

    // E 进站取证前置：world-poi 同步入账后 Areas 走 location.assign 真实跳转——
    // route abort 会让主框架导航落成错误页（文档销毁，__worldSession 随 dispose
    // 删除，上轮实测），改用 beforeunload 取消导航：显式 dialog dismiss = 取消
    // 离页确认框，文档原地存活（E 键即用户手势，确认框必现）；route abort 保留
    // 作二道网（万一确认框未现，至少不真离开 origin）
    page.on('dialog', (dialog) => {
      dialog.dismiss().catch(() => {});
    });
    await page.evaluate(() => {
      window.addEventListener('beforeunload', (e) => {
        e.preventDefault();
        e.returnValue = '';
      });
    });

    // E 进站；溜出触发圈则低速回靠再按（boundingOut 收合 activeItem 的兜底）
    const deadline = Date.now() + 600_000;
    let interacted = false;
    while (Date.now() < deadline && !interacted) {
      const s = await readSpike(page);
      if (Math.hypot(28 - s.x, -28 - s.z) > 5.8) {
        await navigate(page, [{ x: 28, z: -28, radius: 5 }], 480_000);
      }
      await page.keyboard.press('e');
      const hit = await pollDump(page, (d) => d.funnel.firstPoiInteract !== null, 10_000);
      interacted = hit.ok;
    }
    expect(interacted, 'E 进站应记 world-poi（beforeunload 取消跳转取证）').toBe(true);
    await page.screenshot({ path: 'test-results/obs-funnel-poi.png' });

    // ———— 取证与全量断言（§7 CITY-OBS-01 断言要点） ————
    const dump = await readDump(page);
    expect(dump.schemaVersion).toBe(1);

    // funnel 七步非 null 且单调不减（同帧相等合法）
    const steps = FUNNEL_STEPS.map((step) => dump.funnel[step]);
    for (const [i, value] of steps.entries()) {
      expect(value, `funnel.${FUNNEL_STEPS[i]} 应非 null`).not.toBeNull();
    }
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i]!, `funnel 步 ${FUNNEL_STEPS[i]} 应不早于 ${FUNNEL_STEPS[i - 1]}`).toBeGreaterThanOrEqual(steps[i - 1]!);
    }

    // events seq 严格递增
    for (let i = 1; i < dump.events.length; i++) {
      expect(dump.events[i].seq).toBeGreaterThan(dump.events[i - 1].seq);
    }

    // counters 与事件互证（本动线事件量 << ring 500，dropped 必为 0 → ring 全量可数）
    expect(dump.dropped).toBe(0);
    const count = (type: string): number => dump.events.filter((e) => e.type === type).length;
    expect(dump.counters.respawns).toBe(count('respawn'));
    expect(dump.counters.respawns).toBeGreaterThanOrEqual(1);
    expect(dump.counters.poiEnters).toBe(count('poi-bounding-in'));
    expect(dump.counters.poiEnters).toBeGreaterThanOrEqual(1);
    expect(dump.counters.poiInteracts).toBe(count('world-poi'));
    expect(dump.counters.poiInteracts).toBeGreaterThanOrEqual(1);
    expect(dump.counters.transforms).toBe(count('world-transform'));
    expect(dump.counters.driveViewToggles).toBe(count('world-drive-view'));
    expect(dump.counters.driveViewToggles).toBe(2);
    // 城市首幕零锥桶（偏差①）：coneHits 恒 0，覆盖由 OBS-01b 灰盒 dump 补充
    expect(dump.counters.coneHits).toBe(0);

    await saveDump(testInfo, FUNNEL_DUMP, dump);
    expect(errors.filter((m) => !isKnownUaError(m)), '漏斗全走零未捕获异常').toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // CITY-OBS-01b 锥桶交互补充取证 @funnel（冻结表偏差①的补充用例，文件头注）
  // 城市首幕已撤锥桶（CC-L1 A2）——cone-hit 唯一可达路径 = /world-spike/ 灰盒档
  // （确定性锚点桩 (0,-4.5)/(0,-9)，WS-E2E-04 同款驾驶闭环）。产出第二份 dump，
  // CITY-OBS-06 按 §6.2 多 dump 并集合并计分。
  // ---------------------------------------------------------------------------
  test('CITY-OBS-01b 锥桶补充取证：灰盒直线撞桩 → cone-hit 事件 + coneHits 计数互证', async ({ page }, testInfo) => {
    test.setTimeout(2_400_000);
    const errors = trackErrors(page);

    await page.goto(SPIKE_URL);
    const host = page.locator('[data-ws-host]');
    await expect(host).toHaveAttribute('data-state', 'idle');
    await page.locator('[data-ws-start]').click();
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });

    // 直线撞桩（WS-E2E-04 同款三次重试）：出生 (0,0) 朝北，锚点桩 (0,-4.5)。
    // 每次尝试以游戏时间封顶（navigate 同款时基纪律：慢放下墙钟阈值必误报），
    // z < -14 = 冲过桩位带（提前止损重试）。
    let knocked = 0;
    for (let attempt = 1; attempt <= 3 && knocked === 0; attempt++) {
      await page.keyboard.down('w');
      let attemptGameSec = 0;
      let lastTickAt = Date.now();
      while (attemptGameSec < 20) {
        const { state: s, fpsAvg } = await readTelemetry(page);
        if (s.cones > 0) {
          knocked = s.cones;
          break;
        }
        if (s.z < -14) break;
        const now = Date.now();
        attemptGameSec += ((now - lastTickAt) / 1000) * (Math.min(Math.max(fpsAvg, 0.05), 30) / 30);
        lastTickAt = now;
        await page.waitForTimeout(300);
      }
      await page.keyboard.up('w');
      if (knocked === 0) {
        await page.keyboard.press('r');
        await page.waitForTimeout(5_000);
      }
    }
    expect(knocked, '灰盒直线驾驶必须实际撞倒锥桶').toBeGreaterThan(0);

    // cone-hit 沿检测在 HUD 0.25 游戏秒节拍（慢动作 ~数十秒墙钟）——轮询等事件落账
    const logged = await pollDump(page, (d) => d.counters.coneHits >= 1, 180_000);
    expect(logged.ok, 'cone-hit 事件应随 HUD 节拍落入 timeline').toBe(true);

    const dump = logged.dump;
    expect(dump.schemaVersion).toBe(1);
    const coneEvents = dump.events.filter((e) => e.type === 'cone-hit');
    expect(coneEvents.length).toBeGreaterThanOrEqual(1);
    // counters.coneHits = 最新 cone-hit.total（HUD 同源语义，§3.2）
    expect(dump.counters.coneHits).toBe(coneEvents[coneEvents.length - 1].data?.total);

    await saveDump(testInfo, CONES_DUMP, dump);
    expect(errors.filter((m) => !isKnownUaError(m)), '锥桶取证零未捕获异常').toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // CITY-OBS-02 导出面契约
  // 条款：§7——挂载后 __worldSession 存在且仅 dump 一键；dump() 可 JSON.stringify；
  //       env 字段齐；连续两次 dump() 不同引用、内容一致（纯快照）。
  // ---------------------------------------------------------------------------
  test('CITY-OBS-02 导出面契约：__worldSession 仅 dump 一键 + env 落定 + 纯快照语义', async ({ page }) => {
    const errors = trackErrors(page);

    await page.goto(PAGE_URL);
    await expect(page.locator(SEL.host)).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });

    const contract = await page.evaluate(() => {
      const ws = (window as unknown as { __worldSession?: { dump(): unknown } }).__worldSession;
      if (!ws) return null;
      const first = ws.dump() as Record<string, unknown>;
      const second = ws.dump() as Record<string, unknown>;
      return {
        keys: Object.keys(ws),
        dumpIsFunction: typeof ws.dump === 'function',
        sameReference: first === second,
        sameContent: JSON.stringify(first) === JSON.stringify(second),
        stringifyOk: JSON.stringify(first).length > 0,
        dump: first as unknown,
      };
    });
    expect(contract, '__worldSession 应挂载').not.toBeNull();
    expect(contract!.keys, '导出面仅 dump 一键（只读单方法，§4.1）').toEqual(['dump']);
    expect(contract!.dumpIsFunction).toBe(true);
    expect(contract!.sameReference, '两次 dump() 应返回不同对象引用（纯快照）').toBe(false);
    expect(contract!.sameContent, '同步连续两次 dump() 内容应一致').toBe(true);
    expect(contract!.stringifyOk).toBe(true);

    // env 字段齐套（挂载后 backend/vehicle 已落定，不得为 pending）
    const dump = contract!.dump as SessionDump;
    expect(dump.schemaVersion).toBe(1);
    expect(['webgpu', 'webgl2']).toContain(dump.env.backend);
    expect(['physics', 'kinematic']).toContain(dump.env.vehicle);
    expect([0, 1, 2]).toContain(dump.env.quality);
    expect(typeof dump.env.reducedMotion).toBe('boolean');
    expect(typeof dump.env.touch).toBe('boolean');
    expect(dump.env.dpr).toBeGreaterThan(0);
    expect(dump.env.viewport.w).toBeGreaterThan(0);
    expect(dump.env.viewport.h).toBeGreaterThan(0);
    expect(dump.sessionId.length).toBeGreaterThan(7);
    expect(Number.isNaN(Date.parse(dump.startedAt))).toBe(false);

    expect(errors.filter((m) => !isKnownUaError(m))).toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // CITY-OBS-03 dispose 合同
  // 条款：§7——真实离页（非 bfcache）前 dump() 成功；卸载过程 console 出现
  //       [session] 摘要一行 + console.table 两次；window 面删除对称性由
  //       CITY-OBS-02 挂载断言 + 代码评审保证（离页后上下文已换，同页断言不可行）。
  //       bfcache 排除：测试侧挂 unload 监听使页面不进 bfcache（Chromium 语义）——
  //       pagehide(!persisted) → facade dispose 确定性触发（§4.2 时序合同）。
  // ---------------------------------------------------------------------------
  test('CITY-OBS-03 dispose 合同：卸载前可取证 + 卸载时 console 摘要一次（table×2 + [session] 一行）', async ({ page }) => {
    const errors = trackErrors(page);
    const tables: string[] = [];
    const infos: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'table') tables.push(msg.text());
      else infos.push(msg.text());
    });

    await page.goto(PAGE_URL);
    await expect(page.locator(SEL.host)).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });

    // 卸载前取证成功（e2e/审计消费纪律：dump 必须在触发卸载之前，§4.2）
    const dump = await readDump(page);
    expect(dump.schemaVersion).toBe(1);

    // 真实离页（强制非 bfcache）→ facade pagehide → instance.dispose() → session.dispose()
    await page.evaluate(() => window.addEventListener('unload', () => {}));
    await page.goto(HOME_URL);
    await page.waitForURL(new RegExp(`${HOME_URL}$`));

    // dispose 摘要（console 消息经 CDP 异步送达，轮询收账）：
    // console.table(funnel) + console.table(counters) 恰两次 + [session] 摘要恰一行
    await expect.poll(() => tables.length, { timeout: 15_000 }).toBeGreaterThanOrEqual(2);
    expect(tables.length, 'dispose 应 console.table 恰两次（funnel + counters）').toBe(2);
    const summaries = infos.filter((t) => /\[session\] .+ 事件 \d+ 条（丢弃 \d+）/.test(t));
    expect(summaries.length, 'dispose 应输出 [session] 摘要恰一行（幂等：二次调用零输出）').toBe(1);

    expect(errors.filter((m) => !isKnownUaError(m))).toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // CITY-OBS-04 ring 溢出
  // 条款：§7——经 world-obs 桥灌 520 条 ux 族事件 → events ≤ 500、dropped ≥ 20、
  //       events[0].seq > 1、seq 连续、funnel/counters 不受污染；再 dispatch 1 条
  //       白名单外 type → 不入 events、console.warn 出现。
  //       灌注与前后快照同在一次 evaluate 内同步执行——排除引擎自然事件插帧干扰。
  // ---------------------------------------------------------------------------
  test('CITY-OBS-04 ring 溢出：520 条桥事件 → 丢最旧不失真；白名单外拒收 + 告警', async ({ page }) => {
    const errors = trackErrors(page);
    const warnings: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'warning') warnings.push(msg.text());
    });

    await page.goto(PAGE_URL);
    await expect(page.locator(SEL.host)).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });

    const flood = await page.evaluate(() => {
      const ws = (window as unknown as { __worldSession: { dump(): unknown } }).__worldSession;
      const before = ws.dump();
      for (let i = 0; i < 520; i++) {
        window.dispatchEvent(new CustomEvent('world-obs', { detail: { type: 'hint-shown' } }));
      }
      const after = ws.dump();
      return { before, after } as { before: SessionDump; after: SessionDump };
    });

    const { before, after } = flood;
    expect(after.events.length, 'ring 上限 500').toBeLessThanOrEqual(500);
    expect(after.dropped - before.dropped, '溢出丢弃 ≥ 20').toBeGreaterThanOrEqual(20);
    expect(after.events[0].seq, 'events[0].seq > 1 = 发生过丢弃（seq 不回收）').toBeGreaterThan(1);
    for (let i = 1; i < after.events.length; i++) {
      expect(after.events[i].seq, 'ring 内 seq 连续').toBe(after.events[i - 1].seq + 1);
    }
    // 聚合独立于 ring（§3.3 第 2 条）：ux 灌注不得污染 funnel/counters
    expect(after.funnel).toEqual(before.funnel);
    expect(after.counters).toEqual(before.counters);

    // 白名单外 type：桥拒收（不入 events）+ console.warn 一次
    const probe = await page.evaluate(() => {
      const ws = (window as unknown as { __worldSession: { dump(): unknown } }).__worldSession;
      window.dispatchEvent(new CustomEvent('world-obs', { detail: { type: 'obs-e2e-bogus' } }));
      return ws.dump() as unknown as SessionDump;
    });
    expect(probe.events.some((e) => e.type === 'obs-e2e-bogus'), '白名单外事件不得入 ring').toBe(false);
    await expect
      .poll(() => warnings.filter((t) => t.includes('obs-e2e-bogus')).length, { timeout: 10_000 })
      .toBe(1);

    expect(errors.filter((m) => !isKnownUaError(m))).toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // CITY-OBS-05 #debug 面板
  // 条款：§7——`/#debug`：[data-debug-panel] 出现、[data-debug-tail] 含最近事件、
  //       [data-debug-export] 点击触发 download 且文件名 session-*.json、面板内
  //       零 button/input 除导出按钮（只读红线机器断言）；无 #debug：debug chunk
  //       零网络请求（CITY-E2E-01 零字节断言同构）。
  //       负腿在前（同 URL 仅变 hash 是 same-document 导航，经 about:blank 强制重挂载）。
  // ---------------------------------------------------------------------------
  test('CITY-OBS-05 #debug 面板：无 hash 零 debug 请求；有 hash 面板只读 + tail + 导出下载', async ({ page }) => {
    test.setTimeout(1_200_000); // 两次完整 3D 挂载（负腿 + 正腿）+ 负载挤兑余量
    const errors = trackErrors(page);
    const debugChunk = findDebugChunkName();
    const debugHits: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes(debugChunk)) debugHits.push(r.url());
    });

    // ———— 负腿：无 #debug 的生产路径 debug chunk 零请求（挂载全程监听） ————
    await page.goto(PAGE_URL);
    const host = page.locator(SEL.host);
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    await page.waitForTimeout(3_000);
    expect(debugHits, '无 #debug 时 debug chunk 零网络请求（§5.1 分包红线）').toEqual([]);
    await expect(page.locator('[data-debug-panel]')).toHaveCount(0);

    // ———— 正腿：/#debug（经 about:blank 触发真实重挂载） ————
    await page.goto('about:blank');
    await page.goto(`${PAGE_URL}#debug`);
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    expect(debugHits.length, 'debug chunk 命名探针正腿自证（防重命名空转负腿）').toBeGreaterThanOrEqual(1);

    const panel = page.locator('[data-debug-panel]');
    await expect(panel).toBeVisible();
    // 事件 tail：`#seq t(ms) type` 行，mount 为会话首事件（首屏事件量 < 10 恒可见）
    await expect(panel.locator('[data-debug-tail]')).toContainText('mount', { timeout: 30_000 });
    await expect(panel.locator('[data-debug-tail]')).toContainText('#1');
    // CAM F7 留位容器（§5.2：CAM 在此扩展，禁止第二块 overlay）
    await expect(panel.locator('[data-debug-cam]')).toHaveCount(1);

    // 只读红线机器断言：面板内唯一 button = 导出，零 input/select/textarea/链接
    await expect(panel.locator('button')).toHaveCount(1);
    await expect(panel.locator('button')).toHaveAttribute('data-debug-export', '');
    await expect(panel.locator('input, select, textarea, a[href]')).toHaveCount(0);

    await page.screenshot({ path: 'test-results/obs-debug-panel.png' });

    // 导出：download 事件 + 文件名 session-<sessionId 前 8 位>.json
    const downloadPromise = page.waitForEvent('download');
    await panel.locator('[data-debug-export]').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^session-[0-9a-f-]{8}\.json$/);

    expect(errors.filter((m) => !isKnownUaError(m))).toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // CITY-OBS-06 冒烟脚本（shell 断言用例）
  // 条款：§7——node scripts/function-smoke.mjs --dump <OBS-01/01b 产物>：退出码 0、
  //       末行 FUNCTION_SMOKE= 格式、function-smoke.json schema 合法、漏斗 70 分
  //       全额 + coverage cone-hit/respawn/world-poi 为 true（多 dump 并集见文件头
  //       偏差①；world-drive-view 随偏差② V 往返同为 true → 满分 100）。
  // ---------------------------------------------------------------------------
  test('CITY-OBS-06 冒烟脚本：function-smoke 消费 OBS-01/01b dump → 漏斗满额 + 覆盖齐 + 末行机读', async ({}, testInfo) => {
    const result = spawnSync(
      'node',
      ['scripts/function-smoke.mjs', '--dump', FUNNEL_DUMP, '--dump', CONES_DUMP],
      { encoding: 'utf8' },
    );
    expect(result.status, `退出码应为 0（stderr：${result.stderr}）`).toBe(0);

    const lines = result.stdout.trim().split('\n');
    const last = lines[lines.length - 1];
    expect(last, '末行机读 FUNCTION_SMOKE=<0-100 一位小数>').toMatch(/^FUNCTION_SMOKE=\d+(\.\d)?$/);

    const smoke = JSON.parse(readFileSync('test-results/function-smoke.json', 'utf8'));
    expect(smoke.schemaVersion).toBe(1);
    expect(Array.isArray(smoke.dumps)).toBe(true);
    expect(smoke.sessions.length).toBe(2);
    // 漏斗 70 分全额：七步全命中（OBS-01 动线）
    for (const step of FUNNEL_STEPS) {
      expect(smoke.funnel[step]?.hit, `funnel.${step} 应命中`).toBe(true);
    }
    // 覆盖：cone-hit（OBS-01b 灰盒）/respawn/world-poi（OBS-01）为 true；
    // world-drive-view 随 VEH-VIEW 合流 + OBS-01 V 往返同为 true
    expect(smoke.coverage['cone-hit']).toBe(true);
    expect(smoke.coverage['respawn']).toBe(true);
    expect(smoke.coverage['world-poi']).toBe(true);
    expect(smoke.coverage['world-drive-view']).toBe(true);
    expect(smoke.score).toBe(100);

    // OBS annotation（§6.1 软门形态：首个 Loop 观察，不设阈值阻断）
    testInfo.annotations.push({ type: 'FUNCTION_SMOKE', description: last });
    await testInfo.attach('function-smoke.json', {
      path: 'test-results/function-smoke.json',
      contentType: 'application/json',
    });
  });
});
