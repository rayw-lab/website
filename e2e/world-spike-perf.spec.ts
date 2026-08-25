// /world-spike/ —— WS-PERF-01 帧率证据包（e2e-test-plan §5.8 · 仅 world-perf-chromium project）。
//
// 定位（与 60fps/30fps 门禁的关系，Fable5 裁决口径）：
//   Spike 门禁「桌面 60fps / 中端安卓 30fps」只能真机判定（roadmap §7.3 Step 9，
//   执行脚本见 docs/spec/human-gate-checklist.md §2）。CI 仅 SwiftShader 软件渲染
//   （~1fps，决策记录 §3 实测），任何自动化数值门禁要么恒假阳性要么恒假阴性——
//   因此本 spec 不做 60/30 判定，而是产出**可审计的辅助证据包**：每次全量 e2e
//   留档帧率读数 + 帧间隔分布 + 环境指纹，真机录测前后均可对照（软件光栅化硬下界）。
//
// 断言分层（不降级 Spike 功能，不因环境慢而 skip）：
//   - 硬断言（挡合并）：链路活着——挂载 ready、驾驶产生速度、HUD data-ws-fps 出数、
//     __worldSpike.fps().avg > 0、rAF 持续出帧、全程零未捕获异常；
//   - 软门禁（不阻断 CI）：采样期 95% 帧间隔 < 50ms（p95 < 50ms，≈95% 帧保持
//     ≥20fps 节奏、无长时间 stall）。SwiftShader 下预期不达标：失败不 fail 用例，
//     登记 OBS annotation + 证据 JSON 标记 softGate.pass=false + console.warn。
//
// 运行纪律：
//   - 独占 world-perf-chromium project 殿后串行（依赖 world-chromium）——任何并发
//     3D 上下文/测试负载都会污染帧间隔采样（batch 1 §3 并发挤兑实测结论）；
//   - 录像显式关闭：Playwright 录屏本身吃 CPU，会系统性拉低采样读数；证据以
//     JSON + HUD 截图留档（jsonl / 报告附件 / docs/spec/assets/e2e-integration/）。
import { test, expect, type Page } from '@playwright/test';
import { appendFileSync, mkdirSync } from 'node:fs';
import { u, shotIntegration } from './helpers';

const PAGE_URL = u('/world-spike/');
/** 3D 挂载超时：与 world-spike.spec.ts 同标定（CarConcept 3.4MB + SwiftShader 初始化） */
const MOUNT_TIMEOUT = 150_000;
/** 持续驾驶时长（墙钟）：任务口径「驾驶 30s 后采集」 */
const DRIVE_MS = 30_000;
/** rAF 采样窗口：≥5s 且 ≥6 帧（软渲染 ~1fps 下 5s 仅 ~5 帧，帧数不足自动延长），封顶 45s */
const SAMPLE_MIN_MS = 5_000;
const SAMPLE_MIN_FRAMES = 6;
const SAMPLE_CAP_MS = 45_000;
/** 软门禁阈值：帧间隔 50ms（= 20fps 节奏；超过视作 stall 帧） */
const STALL_MS = 50;

test.describe.configure({ mode: 'default', timeout: 300_000 });

// 录像关闭（见文件头注释「运行纪律」；全局配置本就无录像，此处显式声明意图）
test.use({ video: 'off' });

/* ---------- 工具（镜像 world-spike.spec.ts，两 spec 保持相互独立、互不 import） ---------- */

interface WorldState {
  x: number;
  y: number;
  z: number;
  yaw: number;
  speedKmh: number;
  grounded: boolean;
  cones: number;
}

/** 读取 __worldSpike.state()（挂载后才可用） */
async function readState(page: Page): Promise<WorldState> {
  return page.evaluate(() => {
    const ws = (window as unknown as { __worldSpike?: { state(): unknown } }).__worldSpike;
    if (!ws) throw new Error('__worldSpike 未挂载');
    return ws.state() as WorldState;
  });
}

/** 轮询遥测直至谓词满足；超时返回最后一次状态并置 ok=false */
async function pollState(
  page: Page,
  pred: (s: WorldState) => boolean,
  timeoutMs: number,
  intervalMs = 400,
): Promise<{ ok: boolean; state: WorldState }> {
  const deadline = Date.now() + timeoutMs;
  let state = await readState(page);
  while (!pred(state)) {
    if (Date.now() > deadline) return { ok: false, state };
    await page.waitForTimeout(intervalMs);
    state = await readState(page);
  }
  return { ok: true, state };
}

/** 进入试验场：显式点击启动 → ready（world 规格的唯一入场路径） */
async function enterWorld(page: Page): Promise<void> {
  await page.goto(PAGE_URL);
  const host = page.locator('[data-ws-host]');
  await expect(host).toHaveAttribute('data-state', 'idle');
  await page.locator('[data-ws-start]').click();
  await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
}

/** 证据落盘（与 world-spike.spec.ts 共用同一 jsonl，integration 报告数据源） */
function logMetrics(label: string, data: Record<string, unknown>): void {
  mkdirSync('test-results', { recursive: true });
  appendFileSync(
    'test-results/world-spike-metrics.jsonl',
    `${JSON.stringify({ label, ...data })}\n`,
  );
}

test.describe('world Spike 帧率证据包', () => {
  test('WS-PERF-01 30s 驾驶后采集 HUD/遥测帧率 + rAF 帧间隔采样；p95<50ms 软门禁（OBS 不阻断）', async ({
    page,
  }) => {
    test.setTimeout(420_000);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await enterWorld(page);

    // 环境指纹：证据包的可审计前提——读数必须能归因到具体渲染环境
    const env = await page.evaluate(() => ({
      userAgent: navigator.userAgent,
      hardwareConcurrency: navigator.hardwareConcurrency,
      devicePixelRatio: window.devicePixelRatio,
      webgpuAvailable: 'gpu' in navigator,
      viewport: { w: window.innerWidth, h: window.innerHeight },
    }));
    const backend = await page.evaluate(
      () => (window as unknown as { __worldSpike: { backend: string } }).__worldSpike.backend,
    );
    await expect(page.locator('[data-ws-backend]')).toHaveText(/^(WebGPU|WebGL 2)$/);

    const driveStart = Date.now();
    await page.keyboard.down('w');
    try {
      // ① 硬断言：驾驶闭环活着（真实 CDP 按键 → 意图 → 物理 → 遥测）
      const moving = await pollState(page, (s) => s.speedKmh > 2, 60_000);
      expect(
        moving.ok,
        `W 持续按住后车辆应实际行驶（实测 ${moving.state.speedKmh.toFixed(1)}km/h）`,
      ).toBe(true);

      // ② 补足 30s 墙钟持续驾驶（帧率仪表在真实负载下积分）
      const remaining = DRIVE_MS - (Date.now() - driveStart);
      if (remaining > 0) await page.waitForTimeout(remaining);
      const driveMs = Date.now() - driveStart;

      // ③ 采集读数：HUD（data-ws-fps 每 0.25 世界秒刷新，软渲染下 ~5s 一拍 → 放宽等待）
      //    + 引擎遥测 __worldSpike.fps()/info()/state() 互证
      const hudFps = page.locator('[data-ws-fps]');
      await expect(hudFps, 'HUD 帧率仪表应有「均值 / 1% low」读数').toHaveText(/^\d+ \/ \d+$/, {
        timeout: 30_000,
      });
      const hudFpsText = (await hudFps.textContent())?.trim() ?? '';
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
        return { fps: ws.fps(), info: ws.info(), state: ws.state() as WorldState };
      });
      expect(meter.fps.avg, '帧率仪表 avg 必须有读数').toBeGreaterThan(0);

      // ④ rAF 帧间隔采样（驾驶不间断）：≥5s 且 ≥6 帧，封顶 45s；
      //    统计 p50/p95/max 与 stall（>50ms）计数——软门禁与 stall 归档的数据源
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
      expect(
        sampling.frames,
        `rAF 采样期间渲染循环必须持续出帧（${sampling.durationMs}ms 内 ${sampling.frames} 帧）`,
      ).toBeGreaterThanOrEqual(SAMPLE_MIN_FRAMES);

      // ⑤ 软门禁：p95 帧间隔 < 50ms（≈95% 帧保持 ≥20fps 节奏、无长时间 stall）。
      //    失败 = OBS 观察项，不阻断 CI——SwiftShader 软渲染下为预期读数；
      //    真机门禁（桌面 60 / 安卓 30）以 human-gate-checklist §2 人工录测为准。
      const softGate = {
        rule: '采样期 95% 帧间隔 < 50ms（p95 < 50ms，软断言不阻断 CI）',
        thresholdMs: STALL_MS,
        p95Ms: sampling.p95Ms,
        pass: sampling.p95Ms < STALL_MS,
        blocking: false,
      };
      // 60/30 门禁参考读数（仅信息性对照，CI 读数是软件光栅化硬下界，不作判定）
      const gateReference = {
        avgFps: meter.fps.avg,
        desktop60Ref: meter.fps.avg >= 60,
        android30Ref: meter.fps.avg >= 30,
        verdictAuthority: 'docs/spec/human-gate-checklist.md §2（真机人工录测）',
      };

      const evidence = {
        spec: 'WS-PERF-01',
        capturedAt: new Date().toISOString(),
        ci: Boolean(process.env.CI),
        env: { ...env, backend },
        driveMs,
        hud: { fpsText: hudFpsText },
        meter,
        sampling,
        softGate,
        gateReference,
      };
      logMetrics('WS-PERF-01 evidence', evidence);
      await test.info().attach('world-spike-perf-evidence.json', {
        body: JSON.stringify(evidence, null, 2),
        contentType: 'application/json',
      });

      if (!softGate.pass) {
        const obs =
          `软门禁未达标（不阻断 CI）：p95 帧间隔 ${sampling.p95Ms.toFixed(1)}ms ≥ ${STALL_MS}ms，` +
          `stall 帧 ${sampling.stallCount}/${sampling.frames}（采样 ${sampling.durationMs}ms，` +
          `≈${sampling.approxFps.toFixed(1)}fps，后端 ${backend}，navigator.gpu=${env.webgpuAvailable}）。` +
          `${env.webgpuAvailable ? '' : '无 GPU（SwiftShader 软件渲染）环境的预期读数；'}` +
          `真机 60/30fps 门禁以 docs/spec/human-gate-checklist.md §2 人工录测为准。`;
        test.info().annotations.push({ type: 'OBS', description: obs });
        console.warn(`[WS-PERF-01][OBS] ${obs}`);
      }

      // HUD 读数截图入库（docs/spec/assets/e2e-integration/，证据包三件套之一）
      await shotIntegration(page, 'world_perf_hud_after_drive');
    } finally {
      await page.keyboard.up('w').catch(() => {});
    }

    expect(errors, '30s 驾驶 + 采样全程零未捕获异常').toEqual([]);
  });
});
