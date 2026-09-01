// `/`（生产科技城）—— CITY-PERF-01/02 性能 CI 证据包（CC-PERF-C1 · PR-A）。
//
// 冻结正本（断言合同 = 合并门，无自由裁量位）：
//   docs/spec/cyber-city-perf-test-plan.md §2（CITY-PERF-01 七步协议 + H1–H7 硬断言
//   + p95<50ms 软门）/ §3（CITY-PERF-02 Q2 存在腿）/ §2.4 超时 / §2.5 evidence schema。
//   秤与判定权威归 docs/spec/cyber-city-perf-rubric.md（真机六腿）；本 spec 只产
//   CI 证据包（下界哨兵），**永不**做 60/30 帧率判定或 ≤8s 时长判定（SwiftShader 禁令）。
//
// 断言分层（WS-PERF-01 同款姿势，e2e/world-spike-perf.spec.ts 先例）：
//   - 硬断言（挡合并）：链路存在性/顺序性/计数——状态机走通、驾驶产生速度、
//     引擎 fps 探针出数（城市页无 [data-ws-fps] HUD）、rAF 持续出帧、漏斗互证、
//     零未捕获异常、证据完整（H1–H7）；
//   - 软门（不阻断）：采样期 p95 帧间隔 < 50ms。SwiftShader 下恒预期失败：
//     登记 OBS annotation + softGate.pass=false + console.warn，用例保持绿。
//
// 运行纪律（测试方案 §1.3 案 B 拓扑）：
//   - 独占 city-perf-chromium project（dependencies: ['world-perf-chromium']）殿后
//     串行——project 间 dependencies 是 Playwright 唯一的跨文件强序原语，保证与
//     WS-PERF-01 及一切并行池互不污染采样（fullyParallel: false 只管文件内 01→02 按序）；
//   - 采样标定全抄 WS-PERF-01（≥5s 且 ≥6 帧、封顶 45s、stall 50ms）——两档同标定
//     才可横比；动作脚本改抄真机 rubric §4.1 行 1（脚本同源 = 结构门 S4）；
//   - 录像显式关闭（录屏吃 CPU 系统性拉低读数，WS-PERF-01 运行纪律）。
//
// 与冻结正本 §2.4 的显式偏差（实现事实所迫，PR 描述登记——CITY-OBS-C2 偏差登记先例）：
//   超时 600s → CITY-PERF-01 900s / CITY-PERF-02 1200s。首轮实测（trace 逐 action
//   计时）：挂载/robot_idle/car_ready 均在 §1.4 标定内，但 SwiftShader 满载下每个
//   CDP 动作（键盘事件/evaluate/waitForTimeout）承担 ~5-10s 往返开销——冻结脚本的
//   「20s 墙钟」实付 ~150-250s，§2.4 的 600s 推导未计入该系数（e2e-test-plan §3
//   环境事实 3 同源现象）。01 实测需 ~700-750s；02 的 driveTo 腿改为逐腿 360s
//   （CITY-OBS-01 实战跑绿的原口径——其单腿预算即 360s，§3「预算 360s」按腿计）。
//   断言合同/脚本/采样标定/schema 零偏差；正本回改归 PERF-DES 升版（§7 版本纪律）。
import { test, expect, type Page } from '@playwright/test';
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { u } from './helpers';

const PAGE_URL = u('/');

/** 挂载 ready 超时（cyber-city.spec.ts 同标定：SwiftShader 慢动作全链 ~75-110s） */
const MOUNT_TIMEOUT = 210_000;
/** ready → robot_idle（Reveal 光柱落定）/ transforming → car_ready（CITY-E2E-03 标定） */
const STATE_TIMEOUT = 120_000;
/** 驾驶接管 driving 超时（CITY-E2E-03 同标定） */
const DRIVING_TIMEOUT = 60_000;
/** 脚本化驾驶墙钟（测试方案 §2.1 步 3：真机 rubric §4.1 行 1 桌面腿同源 20s） */
const DRIVE_MS = 20_000;
/** rAF 采样标定（WS-PERF-01 全抄——横比前提，测试方案 §2.1 步 4） */
const SAMPLE_MIN_MS = 5_000;
const SAMPLE_MIN_FRAMES = 6;
const SAMPLE_CAP_MS = 45_000;
const STALL_MS = 50;
/** CITY-PERF-02 driveTo 逐腿预算（CITY-OBS-01 实战值逐腿复用，文件头偏差注记） */
const DRIVE_TO_LEG_BUDGET_MS = 360_000;

/** 工件（观测规格 §6.1 冻结名；jsonl 行 schema = 测试方案 §2.5 v1） */
const EVIDENCE_JSONL = 'test-results/city-perf-evidence.jsonl';
const SESSION_DUMP = 'test-results/session-dump-city-perf.json';

const SEL = {
  host: '[data-world-host]',
  transform: '[data-world-transform]',
} as const;

/** UA 级已知异常白名单（既有惯例，仅此一条精确放行——测试方案 §2.2 H6） */
const isKnownUaError = (msg: string): boolean => /Transition was skipped/.test(msg);

/* ---------- 遥测工具（镜像 cyber-city-observability.spec.ts，两 spec 互不 import） ---------- */

interface SpikeState {
  x: number;
  z: number;
  yaw: number;
  speedKmh: number;
}

interface SessionDump {
  schemaVersion: number;
  env: { backend: string; quality: number };
  events: Array<{ seq: number; t: number; type: string }>;
  counters: { respawns: number; coneHits: number };
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

/** funnel 七步声明序（观测规格 §3.2；CITY-PERF-02 硬断言用全集） */
const FUNNEL_STEPS = [
  'reveal',
  'robotIdle',
  'transformStart',
  'carReady',
  'driveStart',
  'firstPoiIn',
  'firstPoiInteract',
] as const;

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

async function readSpike(page: Page): Promise<SpikeState> {
  return page.evaluate(() => {
    const ws = (window as unknown as { __worldSpike?: { state(): unknown } }).__worldSpike;
    if (!ws) throw new Error('__worldSpike 未挂载');
    return ws.state() as SpikeState;
  });
}

async function readDump(page: Page): Promise<SessionDump> {
  return page.evaluate(() => {
    const ws = (window as unknown as { __worldSession?: { dump(): unknown } }).__worldSession;
    if (!ws) throw new Error('__worldSession 未挂载');
    return ws.dump() as SessionDump;
  });
}

async function readFps(page: Page): Promise<{ avg: number; low1: number }> {
  return page.evaluate(() => {
    const ws = (window as unknown as { __worldSpike: { fps(): { avg: number; low1: number } } }).__worldSpike;
    return ws.fps();
  });
}

/** 轮询 fps 直至 avg/low1 均 >0；超时返回最后一次读数并置 ok=false（WS-PERF-01 驾驶后读数先例） */
async function pollFps(
  page: Page,
  timeoutMs: number,
  intervalMs = 400,
): Promise<{ ok: boolean; fps: { avg: number; low1: number } }> {
  const deadline = Date.now() + timeoutMs;
  let fps = await readFps(page);
  while (!(fps.avg > 0 && fps.low1 > 0)) {
    if (Date.now() > deadline) return { ok: false, fps };
    await page.waitForTimeout(intervalMs);
    fps = await readFps(page);
  }
  return { ok: true, fps };
}

/** 轮询遥测直至谓词满足；超时返回最后一次状态并置 ok=false（WS-PERF-01 先例） */
async function pollState(
  page: Page,
  pred: (s: SpikeState) => boolean,
  timeoutMs: number,
  intervalMs = 400,
): Promise<{ ok: boolean; state: SpikeState }> {
  const deadline = Date.now() + timeoutMs;
  let state = await readSpike(page);
  while (!pred(state)) {
    if (Date.now() > deadline) return { ok: false, state };
    await page.waitForTimeout(intervalMs);
    state = await readSpike(page);
  }
  return { ok: true, state };
}

/** 轮询 dump 直至谓词满足（CITY-OBS 先例） */
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

const wrapAngle = (a: number): number => Math.atan2(Math.sin(a), Math.cos(a));

/**
 * 遥测闭环自动驾驶（CITY-OBS-01 已实战跑绿的 driveTo 打法镜像）：按住 W，每 0.5s
 * 读 state()，按目标方位差压/放 A/D；卡死自救 = 速度贴地超 45s → R 重生重跑。
 */
async function driveTo(
  page: Page,
  target: { x: number; z: number },
  opts: { radius: number; timeoutMs: number },
): Promise<{ ok: boolean; state: SpikeState }> {
  let steering: 'a' | 'd' | null = null;
  let state = await readSpike(page);
  await page.keyboard.down('w');
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

      if (state.speedKmh > 3) stuckSince = Date.now();
      else if (Date.now() - stuckSince > 45_000) {
        if (steering) {
          await page.keyboard.up(steering);
          steering = null;
        }
        await page.keyboard.up('w');
        await page.keyboard.press('r');
        await page.waitForTimeout(3_000);
        await page.keyboard.down('w');
        stuckSince = Date.now();
      }
      await page.waitForTimeout(500);
    }
    return { ok: false, state };
  } finally {
    if (steering) await page.keyboard.up(steering).catch(() => {});
    await page.keyboard.up('w').catch(() => {});
  }
}

/* ---------- 证据落盘（§2.5 schema v1；H7 自检防哑工件） ---------- */

/** jsonl 追加（裸行，无 label 包裹——§2.5 `spec` 为判别字段） */
function appendEvidence(row: Record<string, unknown>): void {
  mkdirSync('test-results', { recursive: true });
  appendFileSync(EVIDENCE_JSONL, `${JSON.stringify(row)}\n`);
}

/** 点路径取值（schema 自检用） */
function pick(obj: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj);
}

/**
 * H7 证据完整：append 后读回末行反解，逐字段核对 §2.5 必填清单——
 * 「append 成功且含必填字段」的机器化，防哑工件/半行。
 */
function assertEvidenceRow(specId: string, requiredPaths: string[]): Record<string, unknown> {
  const lines = readFileSync(EVIDENCE_JSONL, 'utf8').trim().split('\n');
  const row = JSON.parse(lines[lines.length - 1]) as Record<string, unknown>;
  expect(row.spec, 'jsonl 末行应为本用例刚追加的行').toBe(specId);
  for (const path of requiredPaths) {
    expect(pick(row, path), `§2.5 必填字段 ${path} 缺失`).not.toBeUndefined();
  }
  return row;
}

/** 环境指纹（测试方案 §2.1 步 2：backend 取 __worldSpike.backend 实际值，防
 *  SwiftShader WebGPU 回退假象——webgpuAvailable: true ≠ 实际后端）。
 *  单次 evaluate 合并采集（满载下每次往返 ~5-10s，见文件头偏差注记）。 */
async function captureEnv(page: Page): Promise<{
  userAgent: string;
  hardwareConcurrency: number;
  devicePixelRatio: number;
  webgpuAvailable: boolean;
  viewport: { w: number; h: number };
  backend: string;
  quality: number;
}> {
  return page.evaluate(() => {
    const w = window as unknown as {
      __worldSpike: { backend: string };
      __worldSession: { dump(): { env: { quality: number } } };
    };
    return {
      userAgent: navigator.userAgent,
      hardwareConcurrency: navigator.hardwareConcurrency,
      devicePixelRatio: window.devicePixelRatio,
      webgpuAvailable: 'gpu' in navigator,
      viewport: { w: window.innerWidth, h: window.innerHeight },
      backend: w.__worldSpike.backend,
      quality: w.__worldSession.dump().env.quality,
    };
  });
}

test.describe.configure({ mode: 'default', timeout: 1_200_000 });

// 录像显式关闭（测试方案 §2.4 运行纪律；全局配置本就无录像，此处声明意图）
test.use({ video: 'off' });

test.describe('科技城性能证据包 @phase0（CC-PERF-C1 · city-perf-chromium 殿后 project）', () => {
  // ---------------------------------------------------------------------------
  // CITY-PERF-01 城市档证据包（测试方案 §2 冻结规格）
  // 七步协议：入场 → 环境指纹 → 变形 + 脚本化驾驶 20s（2 急转 + 1 撞道具尝试 +
  // 1 Shift boost，真机 rubric §4.1 行 1 同源 = S4）→ rAF 采样（WS-PERF-01 同标定）
  // → 互证读数 → 硬断言 H1–H7 → 证据落盘（jsonl 全量行 + dump 落盘 + 双 attach）。
  // ---------------------------------------------------------------------------
  test('CITY-PERF-01 城市档证据包：状态机全走 + 20s 同源驾驶脚本 + rAF 采样 + 漏斗互证；p95<50ms 软门（OBS 不阻断）', async ({ page }, testInfo) => {
    test.setTimeout(900_000); // §2.4 600s + CDP 动作开销重标定（文件头偏差注记：首轮 trace 实测需 ~700-750s）
    const errors = trackErrors(page);

    // ① 入场：生产 `/` 无 URL 参数；Playwright 每用例全新 context = 清存储首访口径
    const t0 = Date.now();
    await page.goto(PAGE_URL);
    const host = page.locator(SEL.host);
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    await expect(host).toHaveAttribute('data-world-state', 'robot_idle', { timeout: STATE_TIMEOUT });
    const loadToRobotIdleMs = Date.now() - t0;
    // 采集不判定（CITY-E2E-03 先例：真机 ≤8s 门归 human-gate，CI 读数只留档）
    testInfo.annotations.push({
      type: 'metric',
      description: `load→robot_idle ${loadToRobotIdleMs}ms（采集不判定，真机门归 human-gate §5.4）`,
    });

    // ② 环境指纹（CI 单腿，不跑 ?gl=1——测试方案 §0-1，后端差异靠指纹归因）
    const env = await captureEnv(page);

    // ③ 变形 + 脚本化驾驶 20s 墙钟（真机 rubric §4.1 行 1 同源——S4 结构门依据）
    const t1 = Date.now();
    await page.locator(SEL.transform).click();
    await expect(host).toHaveAttribute('data-world-state', 'transforming');
    await expect(host).toHaveAttribute('data-world-state', 'car_ready', { timeout: STATE_TIMEOUT });
    const transformToCarReadyMs = Date.now() - t1; // 采集不判定
    testInfo.annotations.push({
      type: 'metric',
      description: `transform→car_ready ${transformToCarReadyMs}ms（采集不判定）`,
    });

    const driveStart = Date.now();
    await page.keyboard.down('w');
    try {
      // H1 状态机走通（末态）+ H2 驾驶真发生（速度 >2km/h，60s 预算轮询）
      await expect(host).toHaveAttribute('data-world-state', 'driving', { timeout: DRIVING_TIMEOUT });
      const moving = await pollState(page, (s) => s.speedKmh > 2, 60_000);
      expect(
        moving.ok,
        `W 持续按住后车辆应实际行驶（实测 ${moving.state.speedKmh.toFixed(1)}km/h）`,
      ).toBe(true);

      // 脚本段（W 全程按住）：2 次急转（A/D 各 ~0.6s 脉冲）
      await page.keyboard.down('a');
      await page.waitForTimeout(600);
      await page.keyboard.up('a');
      await page.waitForTimeout(800);
      await page.keyboard.down('d');
      await page.waitForTimeout(600);
      await page.keyboard.up('d');
      await page.waitForTimeout(800);
      // 1 次撞道具尝试：向路缘隔离墩方向斜插再回正（城市档道具 = 街角霓虹隔离墩，
      // counters.coneHits 承接——尝试同源、命中不判，防慢动作动线抖动假阴性）
      await page.keyboard.down('d');
      await page.waitForTimeout(500);
      await page.keyboard.up('d');
      await page.waitForTimeout(1_200);
      await page.keyboard.down('a');
      await page.waitForTimeout(500);
      await page.keyboard.up('a');
      // 1 次 Shift boost ≥1.5s（boost-first 事件互证）；SwiftShader 下单帧可达
      // 2-3s 墙钟，按住 3s 保证 ≥1 个 Player tick 落在按压窗内（≥1.5s 合规超额）
      await page.keyboard.down('Shift');
      await page.waitForTimeout(3_000);
      await page.keyboard.up('Shift');

      // 补足 20s 墙钟
      const remaining = DRIVE_MS - (Date.now() - driveStart);
      if (remaining > 0) await page.waitForTimeout(remaining);
      const driveMs = Date.now() - driveStart;

      // ④ rAF 帧间隔采样（驾驶不间断，W 保持按住）：标定全抄 WS-PERF-01
      const sampling = await page.evaluate(
        ({ minMs, minFrames, capMs, stallMs }) =>
          new Promise<{
            frames: number;
            durationMs: number;
            p50Ms: number;
            p95Ms: number;
            maxMs: number;
            stallCount: number;
            stallRatio: number;
            approxFps: number;
          }>((resolve) => {
            const intervals: number[] = [];
            const t0 = performance.now();
            let lastT = t0;
            const tick = (now: number) => {
              intervals.push(now - lastT);
              lastT = now;
              const elapsed = now - t0;
              if ((elapsed >= minMs && intervals.length >= minFrames) || elapsed >= capMs) {
                const sorted = [...intervals].sort((a, b) => a - b);
                const pct = (p: number) =>
                  sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1))];
                const stalls = intervals.filter((d) => d > stallMs).length;
                resolve({
                  frames: intervals.length,
                  durationMs: Math.round(elapsed),
                  p50Ms: pct(0.5),
                  p95Ms: pct(0.95),
                  maxMs: sorted[sorted.length - 1],
                  stallCount: stalls,
                  stallRatio: stalls / intervals.length,
                  approxFps: (intervals.length * 1000) / elapsed,
                });
              } else {
                requestAnimationFrame(tick);
              }
            };
            requestAnimationFrame(tick);
          }),
        { minMs: SAMPLE_MIN_MS, minFrames: SAMPLE_MIN_FRAMES, capMs: SAMPLE_CAP_MS, stallMs: STALL_MS },
      );
      // H4 rAF 持续出帧
      expect(
        sampling.frames,
        `rAF 采样期间渲染循环必须持续出帧（${sampling.durationMs}ms 内 ${sampling.frames} 帧）`,
      ).toBeGreaterThanOrEqual(SAMPLE_MIN_FRAMES);

      // ⑤ 互证读数：引擎探针（城市页无 [data-ws-fps] 壳挂点，与 human-gate §5.4 一致）
      const fpsLive = await pollFps(page, 30_000);
      expect(fpsLive.ok, 'H3 fps().avg/low1 必须有读数').toBe(true);
      const meter = await page.evaluate(() => {
        const ws = (
          window as unknown as {
            __worldSpike: {
              fps(): { avg: number; low1: number };
              info(): { drawCalls: number; triangles: number };
              state(): unknown;
            };
          }
        ).__worldSpike;
        return { fps: ws.fps(), info: ws.info(), state: ws.state() as SpikeState };
      });
      expect(meter.fps.avg, 'H3 fps().avg 必须有读数').toBeGreaterThan(0);
      expect(meter.fps.low1, 'H3 fps().low1 必须有读数').toBeGreaterThan(0);

      // H5 漏斗互证：robotIdle/carReady/driveStart 非 null 且单调不减；
      // 同一 dump 顺带互证 boost-first（脚本步 3 的 Shift boost 沿检测事件，
      // Player tick 同步落账——采样 45s 窗后必然在档，免单独轮询往返）
      const dump = await readDump(page);
      const funnelLegs = ['robotIdle', 'carReady', 'driveStart'] as const;
      for (const leg of funnelLegs) {
        expect(dump.funnel[leg], `funnel.${leg} 应非 null`).not.toBeNull();
      }
      expect(dump.funnel.carReady!).toBeGreaterThanOrEqual(dump.funnel.robotIdle!);
      expect(dump.funnel.driveStart!).toBeGreaterThanOrEqual(dump.funnel.carReady!);
      expect(
        dump.events.some((e) => e.type === 'boost-first'),
        'Shift boost ≥1.5s 应打 boost-first 事件（脚本互证）',
      ).toBe(true);

      // 软门：p95 < 50ms（annotation + console.warn，不阻断——SwiftShader 恒预期失败，
      // 即失败路径每轮常驻实测；带 GPU 环境预期转绿）
      const softGate = {
        rule: 'p95 < 50ms',
        thresholdMs: STALL_MS,
        p95Ms: sampling.p95Ms,
        pass: sampling.p95Ms < STALL_MS,
        blocking: false,
      };
      // 60/30 门参考读数（仅信息性对照，WS-PERF-01 先例——不构成判定）
      const gateReference = {
        avgFps: meter.fps.avg,
        desktop60Ref: meter.fps.avg >= 60,
        android30Ref: meter.fps.avg >= 30,
        verdictAuthority:
          'docs/spec/human-gate-checklist.md §5.4 + docs/spec/cyber-city-perf-rubric.md §4',
      };

      // ⑦ 证据落盘：jsonl 全量行（§2.5）+ attach + dump 落盘/attach（session-dump-<case>
      // 命名族 case = city-perf；smoke 分母不收——function-smoke 只读显式 --dump 传参）
      const evidence = {
        spec: 'CITY-PERF-01',
        capturedAt: new Date().toISOString(),
        ci: Boolean(process.env.CI),
        env,
        timing: { loadToRobotIdleMs, transformToCarReadyMs },
        driveMs,
        hud: { fpsText: null, cityShellNoHudFps: true },
        meter: { fps: meter.fps, info: meter.info },
        sampling,
        softGate,
        gateReference,
        funnel: {
          robotIdle: dump.funnel.robotIdle,
          carReady: dump.funnel.carReady,
          driveStart: dump.funnel.driveStart,
        },
        counters: { coneHits: dump.counters.coneHits, respawns: dump.counters.respawns },
      };
      appendEvidence(evidence);
      // H7 证据完整：读回末行逐字段自检（§2.5 必填清单，防哑工件）
      assertEvidenceRow('CITY-PERF-01', [
        'capturedAt',
        'ci',
        'env.userAgent',
        'env.hardwareConcurrency',
        'env.devicePixelRatio',
        'env.webgpuAvailable',
        'env.viewport.w',
        'env.viewport.h',
        'env.backend',
        'env.quality',
        'timing.loadToRobotIdleMs',
        'timing.transformToCarReadyMs',
        'driveMs',
        'hud.fpsText',
        'meter.fps.avg',
        'meter.fps.low1',
        'meter.info.drawCalls',
        'meter.info.triangles',
        'sampling.frames',
        'sampling.durationMs',
        'sampling.p50Ms',
        'sampling.p95Ms',
        'sampling.maxMs',
        'sampling.stallCount',
        'sampling.stallRatio',
        'sampling.approxFps',
        'softGate.rule',
        'softGate.thresholdMs',
        'softGate.p95Ms',
        'softGate.pass',
        'softGate.blocking',
        'gateReference.avgFps',
        'gateReference.desktop60Ref',
        'gateReference.android30Ref',
        'gateReference.verdictAuthority',
        'funnel.robotIdle',
        'funnel.carReady',
        'funnel.driveStart',
        'counters.coneHits',
        'counters.respawns',
      ]);
      await testInfo.attach('city-perf-evidence.json', {
        body: JSON.stringify(evidence, null, 2),
        contentType: 'application/json',
      });
      mkdirSync('test-results', { recursive: true });
      writeFileSync(SESSION_DUMP, JSON.stringify(dump, null, 2) + '\n');
      await testInfo.attach('session-dump-city-perf.json', {
        path: SESSION_DUMP,
        contentType: 'application/json',
      });

      if (!softGate.pass) {
        const obs =
          `软门未达标（不阻断 CI）：p95 帧间隔 ${sampling.p95Ms.toFixed(1)}ms ≥ ${STALL_MS}ms，` +
          `stall 帧 ${sampling.stallCount}/${sampling.frames}（采样 ${sampling.durationMs}ms，` +
          `≈${sampling.approxFps.toFixed(1)}fps，后端 ${env.backend}，navigator.gpu=${env.webgpuAvailable}）。` +
          `SwiftShader 软件渲染环境的预期读数；真机判定以 human-gate §5.4 + perf rubric §4 为准。`;
        testInfo.annotations.push({ type: 'OBS', description: obs });
        console.warn(`[CITY-PERF-01][OBS] ${obs}`);
      }
    } finally {
      await page.keyboard.up('w').catch(() => {});
    }

    // H6 零未捕获异常（UA「Transition was skipped」唯一白名单）
    expect(errors.filter((m) => !isKnownUaError(m)), '20s 驾驶 + 采样全程零未捕获异常').toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // CITY-PERF-02 Q2 存在腿（测试方案 §3 冻结规格）
  // 被测命题：?quality=2 止损档下核心路径零功能性缺失——rubric P5 的 CI 存在性
  // 哨兵、真机判定腿 5 与 S-5 L6 的影子。**不采样**（存在性腿，负载轻跑）。
  // 动线镜像 CITY-OBS-01 已实战跑绿的 driveTo 遥测闭环：变形 → 驾驶 → driveTo
  // autodrive-lab 泊车圈 (28,-28) → E 进站（route abort 拦下 navigate，跳转前取证）。
  // ---------------------------------------------------------------------------
  test('CITY-PERF-02 Q2 存在腿：?quality=2 深链生效 + 变形驾驶进站核心路径全走 + 漏斗七步 + Q2 负载基线', async ({ page }, testInfo) => {
    test.setTimeout(1_500_000); // §2.4 600s + driveTo 逐腿 360s ×3（桥腿绕行途径点）；CITY-OBS-01 同动线先例
    const errors = trackErrors(page);

    // 进站目标 = autodrive-lab（parkingBay (28,-28) r6，deepLink /work/——出生 (0,0)
    // 朝北最近顺路 POI，CITY-OBS-01 同款）；abort 该导航请求防 JS 上下文销毁
    await page.route('**/website/work/', (route) => route.abort());

    // ① /?quality=2 深链 → ready → robot_idle（深链参数不改挂载路径）
    const t0 = Date.now();
    await page.goto(`${PAGE_URL}?quality=2`);
    const host = page.locator(SEL.host);
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    await expect(host).toHaveAttribute('data-world-state', 'robot_idle', { timeout: STATE_TIMEOUT });
    const loadToRobotIdleMs = Date.now() - t0;

    // ② 深链生效的机读证明
    const env = await captureEnv(page);
    expect(env.quality, '?quality=2 深链应落 dump().env.quality === 2').toBe(2);

    // ③ CTA 变形 → car_ready → W 驾驶（速度 >2km/h）
    const t1 = Date.now();
    await page.locator(SEL.transform).click();
    await expect(host).toHaveAttribute('data-world-state', 'car_ready', { timeout: STATE_TIMEOUT });
    const transformToCarReadyMs = Date.now() - t1;
    await page.keyboard.down('w');
    try {
      await expect(host).toHaveAttribute('data-world-state', 'driving', { timeout: DRIVING_TIMEOUT });
      const moving = await pollState(page, (s) => s.speedKmh > 2, 60_000);
      expect(
        moving.ok,
        `Q2 档驾驶应实际行驶（实测 ${moving.state.speedKmh.toFixed(1)}km/h）`,
      ).toBe(true);
    } finally {
      await page.keyboard.up('w');
    }

    // ④ driveTo 泊车圈（逐腿 360s 预算，CITY-OBS-01 原口径）。[CC-VIS-X2-TRIAGE r1]
    // 原 (0,-24)→(28,-28) 直线双障不可通行（X1 充电桩排带墙 + X2 右桥腿正穿），
    // 改走东西大道路线 E1 (20,-8) → 泊车位（OBS-01 同批口径，注记见彼处）
    const leg1 = await driveTo(page, { x: 20, z: -8 }, { radius: 3, timeoutMs: DRIVE_TO_LEG_BUDGET_MS });
    expect(
      leg1.ok,
      `Q2 档途径点 (20,-8) 应可达（实测 x=${leg1.state.x.toFixed(1)} z=${leg1.state.z.toFixed(1)}）`,
    ).toBe(true);
    const leg2 = await driveTo(page, { x: 28, z: -28 }, { radius: 4.5, timeoutMs: DRIVE_TO_LEG_BUDGET_MS });
    expect(
      leg2.ok,
      `Q2 档泊车位 (28,-28) 应可达（实测 x=${leg2.state.x.toFixed(1)} z=${leg2.state.z.toFixed(1)}）`,
    ).toBe(true);

    // 触发圈进入（poi-bounding-in → firstPoiIn 首达）
    const entered = await pollDump(page, (d) => d.funnel.firstPoiIn !== null, 60_000);
    expect(entered.ok, 'Q2 档进入泊车触发圈应记 poi-bounding-in').toBe(true);

    // E 进站（world-poi → location.assign 被 route abort 拦下，跳转前取证合同延续）；
    // 溜出触发圈则低速回靠再按（CITY-OBS-01 同款兜底）
    const deadline = Date.now() + 120_000;
    let interacted = false;
    while (Date.now() < deadline && !interacted) {
      const s = await readSpike(page);
      if (Math.hypot(28 - s.x, -28 - s.z) > 5.4) {
        await driveTo(page, { x: 28, z: -28 }, { radius: 4, timeoutMs: 90_000 });
      }
      await page.keyboard.press('e');
      const hit = await pollDump(page, (d) => d.funnel.firstPoiInteract !== null, 5_000);
      interacted = hit.ok;
    }
    expect(interacted, 'Q2 档 E 进站应记 world-poi（核心路径零功能性缺失命题）').toBe(true);

    // ⑤ 硬断言：漏斗七步非 null 且单调不减 + world-poi 事件在档 + 引擎 fps 探针出数
    const dump = await readDump(page);
    const steps = FUNNEL_STEPS.map((step) => dump.funnel[step]);
    for (const [i, value] of steps.entries()) {
      expect(value, `funnel.${FUNNEL_STEPS[i]} 应非 null`).not.toBeNull();
    }
    for (let i = 1; i < steps.length; i++) {
      expect(
        steps[i]!,
        `funnel 步 ${FUNNEL_STEPS[i]} 应不早于 ${FUNNEL_STEPS[i - 1]}`,
      ).toBeGreaterThanOrEqual(steps[i - 1]!);
    }
    expect(
      dump.events.some((e) => e.type === 'world-poi'),
      'world-poi 事件应在档',
    ).toBe(true);
    // H3 帧率仪表活着（存在腿哨兵——引擎探针，非 HUD DOM）
    const fpsLive = await pollFps(page, 30_000);
    expect(fpsLive.ok, 'Q2 档 fps().avg/low1 应有读数').toBe(true);
    expect(fpsLive.fps.avg, 'Q2 档 fps().avg 应 > 0').toBeGreaterThan(0);
    expect(fpsLive.fps.low1, 'Q2 档 fps().low1 应 > 0').toBeGreaterThan(0);

    // ⑥ 证据：jsonl 精简行（§2.5——无 sampling/softGate/hud/gateReference）；
    // Q2 档 drawCalls/triangles 与 Q0 行对照 = 梯退表实效的 CI 旁证
    const info = await page.evaluate(
      () =>
        (
          window as unknown as { __worldSpike: { info(): { drawCalls: number; triangles: number } } }
        ).__worldSpike.info(),
    );
    const evidence = {
      spec: 'CITY-PERF-02',
      capturedAt: new Date().toISOString(),
      ci: Boolean(process.env.CI),
      env,
      timing: { loadToRobotIdleMs, transformToCarReadyMs },
      meter: { info },
      funnel: {
        robotIdle: dump.funnel.robotIdle,
        carReady: dump.funnel.carReady,
        driveStart: dump.funnel.driveStart,
        firstPoiIn: dump.funnel.firstPoiIn,
        firstPoiInteract: dump.funnel.firstPoiInteract,
      },
    };
    appendEvidence(evidence);
    // 精简行 schema 自检（§2.5；H7 同纪律）
    assertEvidenceRow('CITY-PERF-02', [
      'capturedAt',
      'ci',
      'env.userAgent',
      'env.hardwareConcurrency',
      'env.devicePixelRatio',
      'env.webgpuAvailable',
      'env.viewport.w',
      'env.viewport.h',
      'env.backend',
      'env.quality',
      'timing.loadToRobotIdleMs',
      'timing.transformToCarReadyMs',
      'meter.info.drawCalls',
      'meter.info.triangles',
      'funnel.robotIdle',
      'funnel.carReady',
      'funnel.driveStart',
      'funnel.firstPoiIn',
      'funnel.firstPoiInteract',
    ]);
    await testInfo.attach('city-perf-evidence-q2.json', {
      body: JSON.stringify(evidence, null, 2),
      contentType: 'application/json',
    });

    // 零 pageerror（H6 同白名单）
    expect(errors.filter((m) => !isKnownUaError(m)), 'Q2 存在腿全程零未捕获异常').toEqual([]);
  });
});
