// `/`（Full Entry 科技城）探索计数 n/12 + 目标线 v0 e2e —— CC-FXN-C4/C5 随行断言
// （function-test-plan §3.4 C4 合同落地：任务书收窄为「探索计数」形态，
// CITY-EXP-01…02 两用例；[CC-FXN-C5] §3.5 C5 合同落地：G4 目标线 v0 +
// idle-30s 消费，CITY-QST-01…02 两用例——C4 悬置的空闲引导腿在本批收口）。
//
// 被测面 = areas/ExploreProgress.ts（功能 rubric F6「目标/进度」最小可见形态）：
//   · chip [data-world-explore]（计数 [data-world-explore-count]，完成态 data-complete）；
//   · 计数语义 = 首次驶入某 POI 触发圈（poi-bounding-in 同拍）+1，去重 + localStorage
//     跨会话持久（world-explore-v1）；
//   · goal 族埋点随行（观测规格 §3.4 [CC-FXN-C4] 加法）：explore-restore /
//     explore-progress / explore-complete——呈现 ⇔ 埋点互证（§2-2 每批必做题）。
//
// 纪律断言（§2-3 恒等腿）：
//   · ritual_idle 恒等：robot_idle 期 chip 整层 display:none（样式门；transforming
//     由同一条选择器规则覆盖，正常速档全程断言先例 = CITY-FB-01 同构样式门）；
//   · reduced-motion：进度数字是操作性信息，RM 腿照常呈现（仅 pop 动画压 0）；
//   · 非强制（rubric F6「阻断自由探索扣分」的负断言）：chip pointer-events:none
//     全穿透、零模态、驾驶/进圈全程零输入劫持；
//   · 待机纪律偏差留痕：chip 是常驻进度指示件（F6「可见可选目标」本体），
//     不适用瞬时反馈件「零事件时隐藏」——恒等门只管 poster 两态（组件头注同一口径）；
//   · pageerror 断零（UA View Transition 白名单唯一放行）；SwiftShader 禁令：
//     只断存在性/顺序性/计数，零时长阈值。
//
// 运行编排：world-chromium 串行 project（playwright.config testMatch
// cyber-city.*\.spec\.ts 泛化，零配置改动）；驾驶走 OBS-01 同款遥测闭环
// driveTo（真实 CDP 键盘输入，禁止 evaluate 直改物理状态）。
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { u } from './helpers';

const PAGE_URL = u('/');

/** 挂载等待（cyber-city.spec.ts 文件头⑤ SwiftShader 校准口径） */
const MOUNT_TIMEOUT = 210_000;

/** 双 JSON 单源（Node ESM 下 JSON 用 fs 读，visual spec 先例）：分母/坐标零硬编码 */
const pois = JSON.parse(
  readFileSync(new URL('../src/data/world-pois.json', import.meta.url), 'utf8'),
) as { pois: { buildingId: string }[]; quest: { chain: string[] } };
const cityMap = JSON.parse(
  readFileSync(new URL('../src/data/cyber-city-buildings.json', import.meta.url), 'utf8'),
) as { buildings: { id: string; parkingBay: { x: number; z: number; radius: number } }[] };

/** 探索点全量（chip 分母同源：Areas records = 在册 POI） */
const ALL_IDS = pois.pois.map((p) => p.buildingId);
const TOTAL = ALL_IDS.length;

/** EXP-01 出生点 = autodrive-lab（?poi= 深链落触发圈内，CITY-PA 同款）；
 *  第二探索点 = agent-nexus（内环镜像位 (-28,-28)，OBS-01 走廊路线的对称腿） */
const SPAWN_POI = 'autodrive-lab';
const SECOND_POI = 'agent-nexus';

/** localStorage 持久键（ExploreProgress STORAGE_KEY 契约） */
const STORAGE_KEY = 'world-explore-v1';

/** [CC-FXN-C5] 目标线主链（world-pois.json quest.chain 单源：站序/站数零硬编码）
 *  + 折叠偏好持久键（QuestLine COLLAPSE_KEY 契约） */
const CHAIN = pois.quest.chain;
const QUEST_COLLAPSE_KEY = 'world-quest-collapsed-v1';

const bayOf = (id: string): { x: number; z: number; radius: number } => {
  const bay = cityMap.buildings.find((b) => b.id === id)?.parkingBay;
  if (!bay) throw new Error(`buildings JSON 缺少 ${id}.parkingBay`);
  return bay;
};

const SEL = {
  host: '[data-world-host]',
  transform: '[data-world-transform]',
  explore: '[data-world-explore]',
  exploreCount: '[data-world-explore-count]',
  quest: '[data-world-quest]',
  questName: '[data-world-quest-name]',
  questDistance: '[data-world-quest-distance]',
  questStep: '[data-world-quest-step]',
  questToggle: '[data-world-quest-toggle]',
  questNudge: '[data-world-quest-nudge]',
} as const;

/** UA 级已知异常白名单（world-spike.spec.ts 先例）：仅「Transition was skipped」放行 */
const isKnownUaError = (msg: string): boolean => /Transition was skipped/.test(msg);

/* ———————————————————— dump 消费面（观测规格 §3.2 v1 最小面） ———————————————————— */

interface SessionEventEntry {
  seq: number;
  t: number;
  type: string;
  data?: Record<string, string | number | boolean>;
}

interface SessionDump {
  schemaVersion: number;
  events: SessionEventEntry[];
  dropped: number;
  funnel: { firstPoiIn: number | null };
}

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

/** 轮询 dump 直至谓词满足（CITY-OBS 同款；超时返回最后一次 dump 并置 ok=false） */
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

interface SpikeState {
  x: number;
  z: number;
  yaw: number;
  speedKmh: number;
}

async function readSpike(page: Page): Promise<SpikeState> {
  return page.evaluate(() => {
    const ws = (window as unknown as { __worldSpike?: { state(): unknown } }).__worldSpike;
    if (!ws) throw new Error('__worldSpike 未挂载');
    return ws.state() as SpikeState;
  });
}

const wrapAngle = (a: number): number => Math.atan2(Math.sin(a), Math.cos(a));

/**
 * 倒车脱困/出泊位（S=backward，Player 倒车扇区油门转向同反转）：直线倒车至
 * 位移 ≥ meters 或超时。深链出生泊位朝建筑角（parkingBay.heading 面楼），
 * 原地掉头会蹭墙角卡死；且 R 重生锚点=泊位本身（传送回陷阱），故一律倒车脱身。
 * [CC-FXN-EXP01-ENV] 帧率鲁棒化：VM 空载近实时帧率下倒车可飙 30-50km/h，
 * 500ms 轮询单拍位移 >7m（run3 实测 5m 令过冲至 9.6m，退进隔离墩/角簇邻域）——
 * 倒车限速（>12km/h 松 S 滑行）+ 250ms 轮询，把过冲压到 ~1m 内；
 * SwiftShader 慢帧（~0.04m/s）下速度恒 <12，行为与原版逐帧一致。
 */
async function reverseBy(
  page: Page,
  meters: number,
  capMs: number,
): Promise<{ ok: boolean; state: SpikeState }> {
  const origin = await readSpike(page);
  let state = origin;
  let reversing = false;
  const setReverse = async (want: boolean): Promise<void> => {
    if (want === reversing) return;
    if (want) await page.keyboard.down('s');
    else await page.keyboard.up('s');
    reversing = want;
  };
  await setReverse(true);
  try {
    const deadline = Date.now() + capMs;
    while (Date.now() < deadline) {
      state = await readSpike(page);
      if (Math.hypot(state.x - origin.x, state.z - origin.z) >= meters) return { ok: true, state };
      await setReverse(state.speedKmh < 12);
      await page.waitForTimeout(250);
    }
    return { ok: false, state };
  } finally {
    if (reversing) await page.keyboard.up('s').catch(() => {});
  }
}

/**
 * 遥测闭环自动驾驶（CITY-OBS-01 同款：真实键盘输入 + 遥测节拍 + 卡死倒车自救）。
 * [CC-FXN-EXP01-ENV] 帧率鲁棒化——过弯限速：VM 空载近实时帧率下全程满油门
 * 会以 45-55km/h、10-15m 半径过大弯（run3 实测回程 146° 弯过冲 15m 漂进大街角，
 * 直线回泊线贴 SW 隔离墩 0.6m 反复楔死）；大转角（|diff|>0.9rad≈52°）且车速
 * >18km/h 时松油门滑行收弯，弯毕/降速即回油——SwiftShader 慢帧下弯中速度
 * 常 <18，行为与原版一致；轮询 500→250ms 同步收紧高速下的控制延迟。
 */
async function driveTo(
  page: Page,
  target: { x: number; z: number },
  opts: { radius: number; timeoutMs: number },
): Promise<{ ok: boolean; state: SpikeState }> {
  let steering: 'a' | 'd' | null = null;
  let throttle = false;
  let state = await readSpike(page);
  const setThrottle = async (want: boolean): Promise<void> => {
    if (want === throttle) return;
    if (want) await page.keyboard.down('w');
    else await page.keyboard.up('w');
    throttle = want;
  };
  await setThrottle(true);
  try {
    const deadline = Date.now() + opts.timeoutMs;
    let stuckSince = Date.now();
    while (Date.now() < deadline) {
      state = await readSpike(page);
      const dx = target.x - state.x;
      const dz = target.z - state.z;
      if (Math.hypot(dx, dz) <= opts.radius) return { ok: true, state };

      const desired = Math.atan2(-dz, dx); // forward = (cos r, 0, -sin r) 反解
      const diff = wrapAngle(desired - state.yaw);
      const want: 'a' | 'd' | null = diff > 0.12 ? 'a' : diff < -0.12 ? 'd' : null;
      if (want !== steering) {
        if (steering) await page.keyboard.up(steering);
        if (want) await page.keyboard.down(want);
        steering = want;
      }
      // 过弯限速（速度低于门槛必回油 ⇒ 无滑行死锁）
      await setThrottle(!(Math.abs(diff) > 0.9 && state.speedKmh > 18));

      if (state.speedKmh > 3) stuckSince = Date.now();
      else if (Date.now() - stuckSince > 45_000) {
        // 卡死自救 = 倒车退离障碍（OBS-01 用 R 重生，但深链会话的重生锚点
        // = 泊位面楼——传送回陷阱本身，故此处一律倒车 4m 再续航）
        if (steering) {
          await page.keyboard.up(steering);
          steering = null;
        }
        await setThrottle(false);
        await reverseBy(page, 3, 120_000); // 倒车实测 ~0.04m/s 墙钟（SwiftShader 慢动作）
        await setThrottle(true);
        stuckSince = Date.now();
      }
      await page.waitForTimeout(250);
    }
    return { ok: false, state };
  } finally {
    if (steering) await page.keyboard.up(steering).catch(() => {});
    if (throttle) await page.keyboard.up('w').catch(() => {});
  }
}

/** dump 落盘 + attach（观测规格 §6.1 session-dump-<case>.json 证据非门） */
async function saveDump(testInfo: TestInfo, path: string, dump: SessionDump): Promise<void> {
  mkdirSync('test-results', { recursive: true });
  writeFileSync(path, JSON.stringify(dump, null, 2) + '\n');
  await testInfo.attach(path.split('/').pop() ?? path, { path, contentType: 'application/json' });
}

const progressEvents = (dump: SessionDump): SessionEventEntry[] =>
  dump.events.filter((e) => e.type === 'explore-progress');

/** [CC-FXN-C5] world-quest 事件游标（goal 族，观测规格 §3.4 C5 加法行） */
const questEvents = (dump: SessionDump): SessionEventEntry[] =>
  dump.events.filter((e) => e.type === 'world-quest');

test.describe('科技城探索计数 n/12（CC-FXN-C4 · world-chromium 串行 project）', () => {
  // 3D 挂载单例互斥（cyber-city.spec.ts 同纪律）；长用例单独 setTimeout 放宽
  test.describe.configure({ mode: 'serial', timeout: 420_000 });

  // ---------------------------------------------------------------------------
  // CITY-EXP-01 探索计数闭环（?poi= 深链非 ritual 腿，无 data-world-state ⇒
  // 样式门恒放行，chip 挂载即见——FB-06 灰盒同构口径）：
  //   ① 深链出生落 autodrive-lab 触发圈 → 发现第 1 点：chip 1/12 ⇔
  //      explore-progress{id,n:1,total}（呈现 ⇔ 埋点互证）；
  //   ② 遥测闭环驾驶至 agent-nexus 触发圈 → 2/12 ⇔ explore-progress{n:2}；
  //   ③ 去重：驶出再驶入同一触发圈（poi-bounding-in 第二次入账）→ 计数不动、
  //      explore-progress 恒两条且 id 互异；
  //   ④ 非强制负断言：chip pointer-events:none + 零模态弹层；
  //   ⑤ 持久化：reload 重挂载 → explore-restore{n:2} + chip 还原 2/12 +
  //      出生圈 poi-bounding-in 再入账仍零新增 explore-progress（跨会话去重）。
  // ---------------------------------------------------------------------------
  test('CITY-EXP-01 探索计数闭环：深链发现 → 驾驶 +1 → 重复进圈去重 → reload 持久还原（埋点互证）', async ({ page }, testInfo) => {
    // SwiftShader 慢动作 + 共享 VM 竞争：遥测闭环 + 二次挂载。[CC-FXN-EXP01-ENV]
    // 途径点改线后驾驶腿预算 = 360+480+360s（三腿各自封顶，见 ② 注），上限相应
    // 2400→3000s（各腿为封顶非实耗，成功路径实测 ~15min 收轮）
    test.setTimeout(3_000_000);
    const errors = trackErrors(page);

    await page.goto(`${PAGE_URL}?poi=${SPAWN_POI}`);
    const host = page.locator(SEL.host);
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });

    // —— ① 深链出生即落触发圈：发现第 1 个探索点（CITY-PA-01 同款出生口径）
    const first = await pollDump(
      page,
      (d) => progressEvents(d).some((e) => e.data?.id === SPAWN_POI && e.data?.n === 1),
      90_000,
    );
    expect(first.ok, '深链出生应发现第 1 个探索点（explore-progress{n:1}）').toBe(true);
    expect(
      progressEvents(first.dump)[0]?.data?.total,
      'explore-progress.total 应等于在册探索点数',
    ).toBe(TOTAL);

    const chip = page.locator(SEL.explore);
    const count = page.locator(SEL.exploreCount);
    await expect(chip, '非 ritual 腿无样式门属性，chip 挂载即见').toBeVisible();
    await expect(count).toHaveText(`1/${TOTAL}`);
    await expect(chip).not.toHaveAttribute('data-complete', '1');
    await page.screenshot({ path: 'test-results/explore-first-discover.png' });

    // —— ④ 非强制负断言：纯展示层零输入劫持（rubric F6 非强制铁则）
    const pointerEvents = await chip.evaluate((el) => getComputedStyle(el).pointerEvents);
    expect(pointerEvents, 'chip 必须全层穿透（不遮 CTA/HUD/摇杆热区）').toBe('none');
    await expect(page.locator('dialog[open]'), '探索计数不得弹任何模态').toHaveCount(0);

    // —— ② 驾驶至第 2 个探索点（agent-nexus）。出泊位先倒车 5m：出生朝向 =
    //    parkingBay.heading（面建筑角），原地掉头必蹭墙角；倒退线 (28,-28)→(24.5,-24.5)。
    //    倒车实测 ~0.04m/s 墙钟 → 5m ≈ 120s，予 300s 余量。
    //    [CC-FXN-EXP01-ENV] 途径点加固（T11 #124 F4/F5 + T12 #126 判读 B 兑现）：
    //    原「直线走廊 z∈[-24,-28]」实测被 BL1 充电桩带截断（桩带世界 x∈[16.2,17.8]、
    //    桩位 z∈[-39.5,-26]，雨棚柱 (19.2,-24.2)/(14.8,-24.2)）——西行直线在 x=17 处
    //    z≈-25.0，与桩带间距 < 车半宽：高帧率靠高速擦碰偏转侥幸通过，SwiftShader
    //    慢帧下贴壁楔死（main 卡 (25.2,-25.7) 出泊爬行 / X2 楔死 (19.4,-32.7) 桩带东面）。
    //    改线经霓虹大街（路面带 z∈[-12,12]，全平无路缘、无在册障碍）：
    //      · WP-A (26,-8)：出泊右转南下（desired≈-85°，diff≈-130°→恒右转；右转弧线
    //        x 单调东移、z 不低于 -27，几何上背离桩带与 X2 角簇 ±(18.2~20.8,18.2~20.8)）；
    //      · WP-B (-26,-8)：大街直线西行 52m（隔离墩 (±17.2,-13.6) 距线 5.6m、
    //        (±13.6,-17.2) 距线 9.2m；X2 桥腿 (±15.7,-26) 距线 18m——两树余量均
    //        ≥ 车半宽 1m + 转向余量 1.5m 纪律）；
    //      · 终点泊位 (-28,-28)：北上入泊（右转弧线 x 单调西移，隔离墩 x≥-17.2 不可达；
    //        agent-nexus 墙面 x=-32 仅 z≤-32 段，进泊线 z≥-28 全程无障碍）。
    const escaped = await reverseBy(page, 5, 300_000);
    expect(
      escaped.ok,
      `应能倒车退出泊位（实测 x=${escaped.state.x.toFixed(1)} z=${escaped.state.z.toFixed(1)}）`,
    ).toBe(true);
    const target = bayOf(SECOND_POI);
    const legA = await driveTo(page, { x: 26, z: -8 }, { radius: 6, timeoutMs: 360_000 });
    expect(legA.ok, `途径点 (26,-8) 应可达（实测 x=${legA.state.x.toFixed(1)} z=${legA.state.z.toFixed(1)}）`).toBe(true);
    const legB = await driveTo(page, { x: -26, z: -8 }, { radius: 6, timeoutMs: 480_000 });
    expect(legB.ok, `途径点 (-26,-8) 应可达（实测 x=${legB.state.x.toFixed(1)} z=${legB.state.z.toFixed(1)}）`).toBe(true);
    const leg = await driveTo(page, { x: target.x, z: target.z }, { radius: 5.5, timeoutMs: 360_000 });
    expect(leg.ok, `泊车位 (${target.x},${target.z}) 应可达（实测 x=${leg.state.x.toFixed(1)} z=${leg.state.z.toFixed(1)}）`).toBe(true);

    const second = await pollDump(
      page,
      (d) => progressEvents(d).some((e) => e.data?.id === SECOND_POI && e.data?.n === 2),
      60_000,
    );
    expect(second.ok, '进入第 2 个触发圈应发现第 2 个探索点（explore-progress{n:2}）').toBe(true);
    await expect(count).toHaveText(`2/${TOTAL}`);
    await page.screenshot({ path: 'test-results/explore-second-discover.png' });

    // —— ③ 去重：驶出触发圈（bounding-out 入账）再驶回（bounding-in 第二次入账）
    const out = await driveTo(page, { x: target.x + 14, z: target.z + 2 }, { radius: 4, timeoutMs: 300_000 });
    expect(out.ok, '应能驶出触发圈').toBe(true);
    const bounded = await pollDump(
      page,
      (d) => d.events.some((e) => e.type === 'poi-bounding-out' && e.data?.id === SECOND_POI),
      60_000,
    );
    expect(bounded.ok, '驶出应记 poi-bounding-out').toBe(true);
    const back = await driveTo(page, { x: target.x, z: target.z }, { radius: 5.5, timeoutMs: 300_000 });
    expect(back.ok, '应能驶回触发圈').toBe(true);
    const reentered = await pollDump(
      page,
      (d) =>
        d.events.filter((e) => e.type === 'poi-bounding-in' && e.data?.id === SECOND_POI).length >= 2,
      60_000,
    );
    expect(reentered.ok, '重复进圈应再记 poi-bounding-in（触发圈语义不变）').toBe(true);

    const dedup = reentered.dump;
    const progress = progressEvents(dedup);
    expect(progress.length, '重复进圈不得重复计数（explore-progress 恒两条）').toBe(2);
    expect(new Set(progress.map((e) => e.data?.id)).size, '两条 explore-progress 的 id 应互异').toBe(2);
    expect(dedup.events.some((e) => e.type === 'explore-complete'), '2/12 不得出现完成事件').toBe(false);
    expect(dedup.dropped, '本动线事件量 ≪ ring 500（§2-5 纪律自证）').toBe(0);
    await expect(count).toHaveText(`2/${TOTAL}`);
    await saveDump(testInfo, 'test-results/session-dump-explore.json', dedup);

    // —— ⑤ 持久化：reload 重挂载 → 进度跨会话还原（写读闭环，非预置伪造）
    await page.reload();
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    const restored = await pollDump(
      page,
      (d) => d.events.some((e) => e.type === 'explore-restore' && e.data?.n === 2),
      30_000,
    );
    expect(restored.ok, '重挂载应记 explore-restore{n:2}（localStorage 还原）').toBe(true);
    expect(
      (restored.dump.events.find((e) => e.type === 'explore-restore')?.data as { total?: number })?.total,
    ).toBe(TOTAL);
    await expect(count).toHaveText(`2/${TOTAL}`);

    // 出生圈 bounding-in 再入账（新会话漏斗照常）但已发现点零新增 progress（跨会话去重）
    const rebound = await pollDump(page, (d) => d.funnel.firstPoiIn !== null, 90_000);
    expect(rebound.ok, '重挂载出生圈应照常记 poi-bounding-in').toBe(true);
    expect(progressEvents(rebound.dump).length, '已发现探索点重逢不得再计数').toBe(0);
    await page.screenshot({ path: 'test-results/explore-restored.png' });

    expect(errors.filter((m) => !isKnownUaError(m)), '探索计数闭环零未捕获异常').toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // CITY-EXP-02 恒等门 + reduced-motion + 完成反馈（ritual 腿，RM 快路径省时）：
  //   ① ritual_idle 恒等：robot_idle 期 chip 整层不可见（样式门；transforming 由
  //      同一选择器覆盖）；
  //   ② RM 呈现不剥夺：instant swap → car_ready 后 chip 照常可见，还原进度可读
  //      （预置 11 点 → explore-restore{n:11} 互证——消费面取证，写入面归 EXP-01 ⑤）；
  //   ③ 完成闭环：驾驶发现最后 1 点 → 12/12 + data-complete 完成态 ⇔
  //      explore-progress{n:12} 与 explore-complete{total} 埋点互证（seq 序断言）。
  // ---------------------------------------------------------------------------
  test('CITY-EXP-02 恒等门 + reduced-motion + 完成反馈：robot_idle 隐藏 → 11/12 还原呈现 → 末点集齐完成态（埋点互证）', async ({ page }) => {
    test.setTimeout(2_100_000); // ritual 挂载 + 40m 遥测闭环驾驶（共享 VM 竞争余量）
    const errors = trackErrors(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // 预置 11/12（除 agent-nexus 外全量）：完成腿的确定性布局——把「集齐」压缩为
    // 一段可驾驶的末点动线（12 圈全走在 SwiftShader 下不可行；写读闭环由 EXP-01 ⑤ 承担）
    const seeded = ALL_IDS.filter((id) => id !== SECOND_POI);
    await page.addInitScript(
      ([key, value]) => {
        try {
          localStorage.setItem(key, value);
        } catch {
          /* 隐私模式静默（组件同款降级） */
        }
      },
      [STORAGE_KEY, JSON.stringify(seeded)] as const,
    );

    await page.goto(PAGE_URL);
    const host = page.locator(SEL.host);
    await expect(host).toHaveAttribute('data-blocked', 'reduced-motion');
    await host.locator('[data-world-enter]').click();
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    await expect(host).toHaveAttribute('data-world-state', 'robot_idle', { timeout: 120_000 });

    // —— ① ritual_idle 恒等门：chip 已挂载（DOM 存在）但整层不可见（poster 两态样式门）
    const chip = page.locator(SEL.explore);
    const count = page.locator(SEL.exploreCount);
    await expect(chip).toBeAttached();
    await expect(chip).toBeHidden();

    // 还原埋点先于呈现（挂载即打，与 robot_idle 隐藏互不矛盾——恒等门只管呈现层）
    const restored = await pollDump(
      page,
      (d) => d.events.some((e) => e.type === 'explore-restore' && e.data?.n === TOTAL - 1),
      30_000,
    );
    expect(restored.ok, `预置进度应记 explore-restore{n:${TOTAL - 1}}`).toBe(true);
    expect(progressEvents(restored.dump).length, '还原不产 explore-progress').toBe(0);

    // —— ② RM instant swap → car_ready：chip 照常呈现（操作性信息不剥夺）
    await page.locator(SEL.transform).click();
    await expect(host).toHaveAttribute('data-world-state', 'car_ready', { timeout: 15_000 });
    await expect(chip).toBeVisible();
    await expect(count).toHaveText(`${TOTAL - 1}/${TOTAL}`);
    await expect(chip).not.toHaveAttribute('data-complete', '1');
    await page.screenshot({ path: 'test-results/explore-rm-restored.png' });

    // —— ③ 完成闭环：驾驶至最后一个未发现点（agent-nexus；本腿自原点出发走西侧
    //    (0,-24) 途径点直线，不经 BL1 桩带域 x∈[14.8,19.2]，无需 EXP-01 的大街改线）
    await page.keyboard.down('w');
    try {
      await expect(host).toHaveAttribute('data-world-state', 'driving', { timeout: 60_000 });
    } finally {
      await page.keyboard.up('w');
    }
    // 原点出圈仍留 (0,-24) 途径点（OBS-01 同款：先出隔离墩阵再入西走廊直线）
    const target = bayOf(SECOND_POI);
    const leg1 = await driveTo(page, { x: 0, z: -24 }, { radius: 6, timeoutMs: 480_000 });
    expect(leg1.ok, `途径点 (0,-24) 应可达（实测 x=${leg1.state.x.toFixed(1)} z=${leg1.state.z.toFixed(1)}）`).toBe(true);
    const leg2 = await driveTo(page, { x: target.x, z: target.z }, { radius: 5.5, timeoutMs: 600_000 });
    expect(leg2.ok, `泊车位 (${target.x},${target.z}) 应可达（实测 x=${leg2.state.x.toFixed(1)} z=${leg2.state.z.toFixed(1)}）`).toBe(true);

    const completed = await pollDump(
      page,
      (d) => d.events.some((e) => e.type === 'explore-complete'),
      60_000,
    );
    expect(completed.ok, '末点集齐应记 explore-complete').toBe(true);

    const dump = completed.dump;
    const lastProgress = progressEvents(dump).find((e) => e.data?.id === SECOND_POI);
    expect(lastProgress?.data?.n, `末点应为第 ${TOTAL} 个探索点`).toBe(TOTAL);
    const completeEvent = dump.events.find((e) => e.type === 'explore-complete');
    expect(completeEvent?.data?.total).toBe(TOTAL);
    expect(
      completeEvent!.seq,
      'explore-complete 应晚于末点 explore-progress（seq 序，禁时长阈值）',
    ).toBeGreaterThan(lastProgress!.seq);

    // 完成态呈现 ⇔ 埋点互证（RM 下 pop 压 0，但完成态信息照常）
    await expect(count).toHaveText(`${TOTAL}/${TOTAL}`);
    await expect(chip).toHaveAttribute('data-complete', '1');
    await expect(chip).toContainText('探索完成');
    await page.screenshot({ path: 'test-results/explore-complete.png' });

    expect(errors.filter((m) => !isKnownUaError(m)), '完成闭环零未捕获异常').toEqual([]);
  });
});

test.describe('科技城目标线 v0（CC-FXN-C5 · world-chromium 串行 project）', () => {
  // 3D 挂载单例互斥（cyber-city.spec.ts 同纪律）；长用例单独 setTimeout 放宽
  test.describe.configure({ mode: 'serial', timeout: 420_000 });

  // ---------------------------------------------------------------------------
  // CITY-QST-01 目标线闭环（?poi= 深链非 ritual 腿——无状态机 ⇒ 挂载即激活，
  // 出生落链首站触发圈 = 零驾驶取证链推进）：
  //   ① 事件序：shown(step1) → reached(step1) → shown(step2)（seq 序，禁时长阈值）；
  //   ② chip 呈现 ⇔ 埋点互证：步进 2/N + 楼名 + 距离读数 ≈ 站-1→站-2 泊位平面距；
  //   ③ 非强制负断言：容器 pointer-events:none 全穿透（唯一交互件 = 折叠按钮
  //      auto）+ 零模态；
  //   ④ 折叠偏好：一键收起 → data-collapsed + localStorage 记忆 + collapsed 埋点；
  //      再点展开 → expanded 埋点 + 属性摘除。
  // ---------------------------------------------------------------------------
  test('CITY-QST-01 目标线闭环：深链出生链首站到站 → 链推进 shown 步进 → 距离读数 → 折叠偏好（埋点互证）', async ({ page }, testInfo) => {
    test.setTimeout(600_000); // 挂载 + 事件轮询（零长途驾驶腿）
    const errors = trackErrors(page);
    const station1 = CHAIN[0];
    const station2 = CHAIN[1];

    await page.goto(`${PAGE_URL}?poi=${station1}`);
    const host = page.locator(SEL.host);
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });

    // —— ① 深链出生即落链首站触发圈：reached(1) 后链推进至站-2（seq 序断言）
    const chained = await pollDump(
      page,
      (d) => questEvents(d).some((e) => e.data?.action === 'shown' && e.data?.step === 2),
      90_000,
    );
    expect(chained.ok, '深链出生落链首站触发圈应推进主链至站-2（shown{step:2}）').toBe(true);
    const quests = questEvents(chained.dump);
    const shown1 = quests.find((e) => e.data?.action === 'shown' && e.data?.step === 1);
    const reached1 = quests.find((e) => e.data?.action === 'reached' && e.data?.step === 1);
    const shown2 = quests.find((e) => e.data?.action === 'shown' && e.data?.step === 2);
    expect(shown1?.data?.targetId, '首个 shown 目标 = 链首站').toBe(station1);
    expect(reached1?.data?.targetId, 'reached 站 = 链首站').toBe(station1);
    expect(shown2?.data?.targetId, '链推进目标 = 链次站').toBe(station2);
    expect(shown1!.seq, 'shown(1) 应先于 reached(1)').toBeLessThan(reached1!.seq);
    expect(reached1!.seq, 'reached(1) 应先于 shown(2)').toBeLessThan(shown2!.seq);

    // —— ② chip 呈现 ⇔ 埋点互证（非 ritual 腿无样式门属性，挂载即见）
    const chip = page.locator(SEL.quest);
    await expect(chip, '非 ritual 腿 chip 挂载即见').toBeVisible();
    await expect(page.locator(SEL.questStep)).toHaveText(`2/${CHAIN.length}`);

    // 距离读数 ≈ 站-1 泊位 → 站-2 泊位平面距（±30m：物理落位/漂移余量）
    const bay1 = bayOf(station1);
    const bay2 = bayOf(station2);
    const expected = Math.hypot(bay2.x - bay1.x, bay2.z - bay1.z);
    const distanceText = (await page.locator(SEL.questDistance).textContent()) ?? '';
    const distance = Number(/^(\d+)m$/.exec(distanceText)?.[1]);
    expect(Number.isFinite(distance), `距离读数应为「<整数>m」（实测「${distanceText}」）`).toBe(true);
    expect(
      Math.abs(distance - expected),
      `距离读数 ${distanceText} 应≈站间泊位平面距 ${expected.toFixed(0)}m`,
    ).toBeLessThan(30);
    await page.screenshot({ path: 'test-results/quest-chain-step2.png' });

    // —— ③ 非强制负断言（G4 红线：主链不锁楼、纯展示零输入劫持）
    const chipPointer = await chip.evaluate((el) => getComputedStyle(el).pointerEvents);
    expect(chipPointer, '容器必须全层穿透（不遮 CTA/HUD/摇杆热区）').toBe('none');
    const toggle = page.locator(SEL.questToggle);
    const togglePointer = await toggle.evaluate((el) => getComputedStyle(el).pointerEvents);
    expect(togglePointer, '折叠按钮是唯一交互件').toBe('auto');
    await expect(page.locator('dialog[open]'), '目标线不得弹任何模态').toHaveCount(0);

    // —— ④ 折叠偏好：一键收起 + localStorage 记忆 + 埋点互证；再点展开
    await toggle.click();
    await expect(chip).toHaveAttribute('data-collapsed', '1');
    expect(
      await page.evaluate((key) => localStorage.getItem(key), QUEST_COLLAPSE_KEY),
      '折叠偏好应持久化（记忆偏好红线）',
    ).toBe('1');
    const collapsedEv = await pollDump(
      page,
      (d) => questEvents(d).some((e) => e.data?.action === 'collapsed'),
      30_000,
    );
    expect(collapsedEv.ok, '折叠应记 world-quest{action:collapsed}').toBe(true);
    await toggle.click();
    await expect(chip).not.toHaveAttribute('data-collapsed', '1');
    const expandedEv = await pollDump(
      page,
      (d) => questEvents(d).some((e) => e.data?.action === 'expanded'),
      30_000,
    );
    expect(expandedEv.ok, '展开应记 world-quest{action:expanded}').toBe(true);
    await saveDump(testInfo, 'test-results/session-dump-quest.json', expandedEv.dump);

    expect(errors.filter((m) => !isKnownUaError(m)), '目标线闭环零未捕获异常').toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // CITY-QST-02 恒等门 + car_ready 激活 + idle-30s 消费（ritual 腿，RM 快路径）：
  //   ① 恒等双保险：robot_idle 期 chip 整层不可见（样式门）且零 world-quest 事件
  //      （激活/光柱/首个 shown 一并推迟到 car_ready——poster 恒等合同）；
  //   ② car_ready 激活：chip 可见 + shown{step:1, targetId:链首}；
  //   ③ L7 空闲主动引导：driving 撒手 30 设计秒 → idle-30s 先入账、idle-nudge
  //      随后（seq 序）⇔ nudge 行呈现互证（驻留至下一个驾驶意图，不赛跑淡出计时）；
  //   ④ 输入即收：驾驶意图恢复 → nudge 隐藏（引导不粘身——非强制纪律）。
  // ---------------------------------------------------------------------------
  test('CITY-QST-02 恒等门 + car_ready 激活 + idle-30s 消费：robot_idle 隐藏零事件 → shown 链首 → 空闲 nudge 呈现（输入即收）', async ({ page }, testInfo) => {
    test.setTimeout(2_100_000); // ritual 挂载 + 30 设计秒空闲（SwiftShader maxDelta 限频下墙钟可达十余分钟）
    const errors = trackErrors(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto(PAGE_URL);
    const host = page.locator(SEL.host);
    await expect(host).toHaveAttribute('data-blocked', 'reduced-motion');
    await host.locator('[data-world-enter]').click();
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    await expect(host).toHaveAttribute('data-world-state', 'robot_idle', { timeout: 120_000 });

    // —— ① 恒等门：chip 已挂载但整层不可见；激活推迟 = robot_idle 期零 world-quest 事件
    const chip = page.locator(SEL.quest);
    await expect(chip).toBeAttached();
    await expect(chip).toBeHidden();
    expect(
      questEvents(await readDump(page)).length,
      'robot_idle 期目标线不得激活（光柱/shown 一并推迟——poster 恒等合同）',
    ).toBe(0);

    // —— ② car_ready 激活：chip 可见 + shown 链首站（RM instant swap 快路径）
    await page.locator(SEL.transform).click();
    await expect(host).toHaveAttribute('data-world-state', 'car_ready', { timeout: 15_000 });
    await expect(chip).toBeVisible();
    const shown = await pollDump(
      page,
      (d) => questEvents(d).some((e) => e.data?.action === 'shown' && e.data?.step === 1),
      30_000,
    );
    expect(shown.ok, 'car_ready 应激活目标线（shown{step:1}）').toBe(true);
    expect(
      questEvents(shown.dump)[0]?.data?.targetId,
      '首个目标 = 链首站（城区序主链）',
    ).toBe(CHAIN[0]);
    await expect(page.locator(SEL.questStep)).toHaveText(`1/${CHAIN.length}`);
    await page.screenshot({ path: 'test-results/quest-car-ready.png' });

    // —— ③ 进 driving 后撒手：30 设计秒零驾驶意图 → idle-30s 入账 + idle-nudge 同拍消费
    await page.keyboard.down('w');
    try {
      await expect(host).toHaveAttribute('data-world-state', 'driving', { timeout: 60_000 });
    } finally {
      await page.keyboard.up('w');
    }
    const nudged = await pollDump(
      page,
      (d) => d.events.some((e) => e.type === 'idle-nudge'),
      1_200_000,
      2_000,
    );
    expect(nudged.ok, 'driving 空闲 30 设计秒应打 idle-nudge（idle-30s 消费腿）').toBe(true);
    const idleEv = nudged.dump.events.find((e) => e.type === 'idle-30s');
    const nudgeEv = nudged.dump.events.find((e) => e.type === 'idle-nudge');
    expect(idleEv, 'idle-30s 应先入账（观测先行）').toBeTruthy();
    expect(nudgeEv!.seq, 'idle-nudge 应晚于 idle-30s（seq 序，禁时长阈值）').toBeGreaterThan(
      idleEv!.seq,
    );
    expect(nudgeEv?.data?.targetId, 'nudge 指向当前目标站').toBe(CHAIN[0]);

    // nudge 呈现 ⇔ 埋点互证（驻留至下一个驾驶意图——断言免赛跑；RM 仅动画压 0，文字照常）
    const nudge = page.locator(SEL.questNudge);
    await expect(nudge).toBeVisible();
    await expect(nudge, 'nudge 文案含目标语义').toContainText('下一站');
    await page.screenshot({ path: 'test-results/quest-idle-nudge.png' });

    // —— ④ 输入即收：驾驶意图恢复收起 nudge（引导不粘身）
    await page.keyboard.down('w');
    try {
      await expect(nudge).toBeHidden({ timeout: 30_000 });
    } finally {
      await page.keyboard.up('w');
    }

    await saveDump(testInfo, 'test-results/session-dump-quest-idle.json', await readDump(page));
    expect(errors.filter((m) => !isKnownUaError(m)), 'idle 消费闭环零未捕获异常').toEqual([]);
  });
});
