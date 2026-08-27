// `/`（Full Entry 科技城）探索计数 n/12 e2e —— CC-FXN-C4 随行断言
// （function-test-plan §3.4 C4 合同落地：任务书收窄为「探索计数」形态，
// CITY-EXP-01…02 两用例；空闲引导腿未在本批交付，留痕见 §3.4 回填行）。
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
) as { pois: { buildingId: string }[] };
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
 */
async function reverseBy(
  page: Page,
  meters: number,
  capMs: number,
): Promise<{ ok: boolean; state: SpikeState }> {
  const origin = await readSpike(page);
  let state = origin;
  await page.keyboard.down('s');
  try {
    const deadline = Date.now() + capMs;
    while (Date.now() < deadline) {
      state = await readSpike(page);
      if (Math.hypot(state.x - origin.x, state.z - origin.z) >= meters) return { ok: true, state };
      await page.waitForTimeout(500);
    }
    return { ok: false, state };
  } finally {
    await page.keyboard.up('s').catch(() => {});
  }
}

/**
 * 遥测闭环自动驾驶（CITY-OBS-01 同款：真实键盘输入 + 0.5s 遥测节拍 + 卡死倒车自救）。
 * opts.from 给定时启用巡线（pure pursuit）：瞄准「车辆位置在 from→target 线段上的
 * 投影 + 6m 前视」的线上点，而非远端目标本体——共享 VM 竞争下渲染 ~1fps，
 * bang-bang 舵机对远目标瞄准会横向漂出走廊（50min 轮实测漂进备件箱堆 (26.6,-19)），
 * 巡线把横向误差沿线指数收敛，是窄缺口（隔离墩间 2.55m 半宽）可重复穿越的前提。
 * 自救倒退距离逐次升级（3m→5m 封顶）破解「贴障往复」死循环；trail 为 10s 采样
 * 轨迹面包屑 + 自救标记（失败断言随错误信息落报告，替代无遥测的黑盒排障）。
 */
async function driveTo(
  page: Page,
  target: { x: number; z: number },
  opts: { radius: number; timeoutMs: number; from?: { x: number; z: number } },
): Promise<{ ok: boolean; state: SpikeState; trail: string }> {
  const LOOK_AHEAD = 6;
  let steering: 'a' | 'd' | null = null;
  let state = await readSpike(page);
  const crumbs: string[] = [];
  let rescues = 0;
  let tick = 0;
  await page.keyboard.down('w');
  try {
    const deadline = Date.now() + opts.timeoutMs;
    let stuckSince = Date.now();
    while (Date.now() < deadline) {
      state = await readSpike(page);
      if (tick % 20 === 0) crumbs.push(`(${state.x.toFixed(1)},${state.z.toFixed(1)})`);
      tick += 1;
      if (Math.hypot(target.x - state.x, target.z - state.z) <= opts.radius)
        return { ok: true, state, trail: crumbs.join('→') };

      // 巡线瞄准点：from→target 线段上的投影 + 前视（无 from 即瞄目标本体）
      let aim = target;
      if (opts.from) {
        const spanX = target.x - opts.from.x;
        const spanZ = target.z - opts.from.z;
        const len = Math.hypot(spanX, spanZ);
        const ux = spanX / len;
        const uz = spanZ / len;
        const proj = (state.x - opts.from.x) * ux + (state.z - opts.from.z) * uz;
        const ahead = Math.min(Math.max(proj, 0) + LOOK_AHEAD, len);
        aim = { x: opts.from.x + ux * ahead, z: opts.from.z + uz * ahead };
      }

      const dx = aim.x - state.x;
      const dz = aim.z - state.z;
      const desired = Math.atan2(-dz, dx); // forward = (cos r, 0, -sin r) 反解
      const diff = wrapAngle(desired - state.yaw);
      const want: 'a' | 'd' | null = diff > 0.12 ? 'a' : diff < -0.12 ? 'd' : null;
      if (want !== steering) {
        if (steering) await page.keyboard.up(steering);
        if (want) await page.keyboard.down(want);
        steering = want;
      }

      if (state.speedKmh > 3) stuckSince = Date.now();
      else if (Date.now() - stuckSince > 45_000) {
        // 卡死自救 = 倒车退离障碍（OBS-01 用 R 重生，但深链会话的重生锚点
        // = 泊位面楼——传送回陷阱本身，故一律倒车再续航）；倒退逐次升级
        if (steering) {
          await page.keyboard.up(steering);
          steering = null;
        }
        await page.keyboard.up('w');
        rescues += 1;
        crumbs.push(`[R${rescues}@(${state.x.toFixed(1)},${state.z.toFixed(1)})]`);
        await reverseBy(page, Math.min(3 + (rescues - 1) * 2, 5), 180_000);
        await page.keyboard.down('w');
        stuckSince = Date.now();
      }
      await page.waitForTimeout(500);
    }
    return { ok: false, state, trail: crumbs.join('→') };
  } finally {
    if (steering) await page.keyboard.up(steering).catch(() => {});
    await page.keyboard.up('w').catch(() => {});
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
    test.setTimeout(3_300_000); // SwiftShader 慢动作 + 共享 VM 竞争：双对角巡线遥测闭环 + 二次挂载
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

    // —— ② 驾驶至第 2 个探索点。「z∈[-24,-28] 直线走廊」不成立：autodrive-lab
    //    hero GLB 道具碰撞体（HeroBlenderMesh PROP_COLLIDERS，楼位 (52,-52) 平移）
    //    中「充电桩排」= 世界系 x∈[16.2,17.8]、z∈[-40.3,-25.3] 的 15m 纵墙，
    //    直线西行必抵墙死锁（两轮独立实测停点 x≈19.7±0.1 = 墙面 17.8 + 车头半长），
    //    z=-24 线另有光伏雨棚柱 (14.8,-24.2)/(19.2,-24.2) 封口。
    //    正确动线 = 建模侧预留的对角走廊（HeroBlenderMesh 文件头「隔离墩缺口→
    //    泊车位的对角行车走廊已让空」）：泊位 (28,-28) 沿对角线 x=-z 西北向穿
    //    隔离墩缺口入路口腹地，再沿西南对角线 x=z 穿镜像缺口抵 agent-nexus。
    //    出泊位仍先倒车 5m（出生朝向面建筑角，原地掉头必蹭墙角；R 重生锚点=泊位
    //    本身，传送回陷阱）：倒退线 (28,-28)→(24.5,-24.5) 恰落对角走廊上。
    //    倒车实测 ~0.04m/s 墙钟 → 5m ≈ 120s，予 300s 余量
    const escaped = await reverseBy(page, 5, 300_000);
    expect(
      escaped.ok,
      `应能倒车退出泊位（实测 x=${escaped.state.x.toFixed(1)} z=${escaped.state.z.toFixed(1)}）`,
    ).toBe(true);
    const target = bayOf(SECOND_POI);
    // 巡线两腿沿双对角走廊（线心 = 东南象限 x=-z 与西南象限 x=z）：
    //   A 腿 (24.5,-24.5)→(0,0)：穿东南隔离墩缺口（中点 (15.4,-15.4) 距两墩各
    //     2.55m，唯一收口；余段距雨棚柱/totem/备件箱堆 ≥3.5m）入路口腹地；
    //   B 腿 (0,0)→(-28,-28)：穿西南缺口（同 2.55m 半宽）直抵泊位——西南象限
    //     无 hero 道具（PROP_COLLIDERS 本拍只有 autodrive-lab），全程净空
    const legA = await driveTo(
      page,
      { x: 0, z: 0 },
      { radius: 5, timeoutMs: 720_000, from: { x: 24.5, z: -24.5 } },
    );
    expect(legA.ok, `对角走廊 A 腿→路口 (0,0) 应可达（轨迹 ${legA.trail}）`).toBe(true);
    const legB = await driveTo(
      page,
      { x: target.x, z: target.z },
      { radius: 5.5, timeoutMs: 720_000, from: { x: 0, z: 0 } },
    );
    expect(legB.ok, `泊车位 (${target.x},${target.z}) 应可达（轨迹 ${legB.trail}）`).toBe(true);

    const second = await pollDump(
      page,
      (d) => progressEvents(d).some((e) => e.data?.id === SECOND_POI && e.data?.n === 2),
      60_000,
    );
    expect(second.ok, '进入第 2 个触发圈应发现第 2 个探索点（explore-progress{n:2}）').toBe(true);
    await expect(count).toHaveText(`2/${TOTAL}`);
    await page.screenshot({ path: 'test-results/explore-second-discover.png' });

    // —— ③ 去重：驶出触发圈（bounding-out 入账）再驶回（bounding-in 第二次入账）
    const outPoint = { x: target.x + 14, z: target.z + 2 };
    const out = await driveTo(page, outPoint, {
      radius: 4,
      timeoutMs: 300_000,
      from: { x: target.x, z: target.z },
    });
    expect(out.ok, `应能驶出触发圈（轨迹 ${out.trail}）`).toBe(true);
    const bounded = await pollDump(
      page,
      (d) => d.events.some((e) => e.type === 'poi-bounding-out' && e.data?.id === SECOND_POI),
      60_000,
    );
    expect(bounded.ok, '驶出应记 poi-bounding-out').toBe(true);
    const back = await driveTo(page, { x: target.x, z: target.z }, {
      radius: 5.5,
      timeoutMs: 300_000,
      from: outPoint,
    });
    expect(back.ok, `应能驶回触发圈（轨迹 ${back.trail}）`).toBe(true);
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

    // —— ③ 完成闭环：驾驶至最后一个未发现点（agent-nexus，途径点走廊同 EXP-01）
    await page.keyboard.down('w');
    try {
      await expect(host).toHaveAttribute('data-world-state', 'driving', { timeout: 60_000 });
    } finally {
      await page.keyboard.up('w');
    }
    // 原点出圈仍留 (0,-24) 途径点（OBS-01 同款：先出隔离墩阵再入西走廊直线）；
    // 两腿同样挂巡线锚线（南向路心 x=0 → 西南斜线），控制纪律与 EXP-01 对齐
    const target = bayOf(SECOND_POI);
    const leg1 = await driveTo(
      page,
      { x: 0, z: -24 },
      { radius: 6, timeoutMs: 480_000, from: { x: 0, z: 0 } },
    );
    expect(leg1.ok, `途径点 (0,-24) 应可达（轨迹 ${leg1.trail}）`).toBe(true);
    const leg2 = await driveTo(
      page,
      { x: target.x, z: target.z },
      { radius: 5.5, timeoutMs: 600_000, from: { x: 0, z: -24 } },
    );
    expect(leg2.ok, `泊车位 (${target.x},${target.z}) 应可达（轨迹 ${leg2.trail}）`).toBe(true);

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
