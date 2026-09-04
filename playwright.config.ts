// Playwright E2E 配置（docs/spec/e2e-test-plan.md §3 选型结论）。
// 被测对象 = 生产构建产物（dist/，astro preview 伺服）——与 GitHub Pages 行为一致，
// 不测 dev server（HMR/未压缩产物与线上不同构）。
//
// 运行方式：pnpm test:e2e（先 astro build 再 playwright test）。
// 本地已有 astro preview（Cloud Agent astro-dev 终端，端口 4321）时自动复用；
// CI 无现存服务则由 webServer 自动拉起。
import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 4321);
const ORIGIN = `http://127.0.0.1:${PORT}`;
/** GitHub Pages 项目页 base（astro.config.mjs base: '/website'） */
export const BASE_PATH = '/website';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // WebGL（SwiftShader 软渲染）3D 挂载单次约 50s 且吃满 CPU。
  // [CC-VIS-X2-TRIAGE] 并行度由 2 收到 1：Playwright 的 project 级 fullyParallel:false
  // 只串行「同文件」用例，跨文件仍按全局 workers 派发——X2 全量跑实锤 explore 与
  // feedback 两文件的重 3D 用例全程并发（QST-02 idle 设计秒 20min 轮询耗尽、FB 链
  // 900s 预算越线均由此起）。SwiftShader 下双 3D 页共抢同一批核，双 worker 并无
  // 吞吐收益、只有挤兑假阴性；轻量 DOM 段损失的并行以分钟计，0 flaky 硬门优先
  workers: 1,
  timeout: 60_000,
  // toHaveScreenshot 基线图目录纪律（CC-L0-setup）：基线随 spec 入库，按
  // e2e/visual/__screenshots__/<spec 文件名>/<project>/<截图名>.png 归档；
  // 基线只在 Cloud Agent VM（SwiftShader + 固定系统字体）生成/更新：
  //   pnpm exec playwright test --project=visual-chromium --no-deps --update-snapshots
  snapshotPathTemplate: 'e2e/visual/__screenshots__/{testFileName}/{projectName}/{arg}{ext}',
  expect: {
    timeout: 15_000,
    // 视觉基线容差：同 VM 复跑仅存在亚像素级抖动，2% 像素配额吸收字体平滑差异
    toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: 'disabled' },
  },
  // json 报告供 scripts/score-loop.mjs 计算综合分（e2e 通过率 + @smoke3d 维度）
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/e2e-results.json' }],
  ],

  use: {
    baseURL: ORIGIN,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // 座舱 TTS 播放走 <audio> + AudioContext；显式放行自动播放，避免 CI 策略差异
    launchOptions: {
      args: ['--autoplay-policy=no-user-gesture-required', '--enable-unsafe-swiftshader'],
    },
  },

  projects: [
    {
      // 桌面基线：1440×900（homepage-redesign-spec 桌面栅格）
      // cyber-city（`/` 世界剧本）随 CC-E7 绿灯移入 world-chromium 串行 project；
      // e2e/visual/（视觉取证）归 visual-chromium 殿后 project
      name: 'desktop-chromium',
      // cyber-city.*：城市世界剧本族（cyber-city / cyber-city-feedback…）整族归
      // world-chromium 串行 project，本组一律忽略（并发 3D 上下文挤兑纪律）；
      // [CC-VEH-E2E-FIX] car-configurator 同理移出（归 car-chromium 独占 project）
      testIgnore:
        /mobile\.spec\.ts|world-spike.*\.spec\.ts|cyber-city.*\.spec\.ts|car-configurator\.spec\.ts|visual[\\/].*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      // 移动基线：375×667 触屏（pointer: coarse —— 验证 facade §12.4 pointer 拦截）
      name: 'mobile-375',
      testMatch: /mobile\.spec\.ts/,
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
      },
    },
    {
      // [CC-VEH-E2E-FIX] 3D 车辆配置器独占 project（e2e-test-plan「3D 重负载调度」
      // 纪律：重 3D spec 一律并入 world-chromium 或复制该模式）。此前该文件留在
      // desktop-chromium 只靠文件内 mode:'default' 串行，挡不住跨 project 并发——
      // phase 1 里 MOB-E2E-03 还有一次完整 car 3D 挂载（SwiftShader），实测挤兑下
      // CAR-E2E-01 164s / CAR-E2E-05 179s，贴着 180s 超时线（AL-VEH-R2 两次全量
      // 复跑即在此越线）。殿后 desktop+mobile 独占整机后，挂载单次回落 ~13s。
      name: 'car-chromium',
      testMatch: /car-configurator\.spec\.ts/,
      fullyParallel: false,
      dependencies: ['desktop-chromium', 'mobile-375'],
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      // world-spike 驾驶用例 + cyber-city 世界剧本（CC-E7 绿灯移入，文件头④）：
      // 每例完整挂载 3D + 长时驾驶/变形积分（SwiftShader 下 ~1fps），
      // 依赖前置 project 跑完后独占机器执行——4 核 CPU 上任何并发 3D 上下文
      // 都会把驾驶腿饿死（batch 1 已实测并发挤兑结论，此处更甚）。
      // [CC-OBS-C2] cyber-city.*\.spec\.ts 收编 cyber-city-observability.spec.ts
      // （观测规格 §7：OBS 用例入 world-chromium 串行 project，同款 3D 独占纪律）
      // [CC-VEH-E2E-FIX] 依赖改指 car-chromium（线性链：desktop+mobile → car →
      // world → world-perf → city-perf → visual，任意时刻至多一个重 3D 上下文）
      // [CC-VIS-X2-TRIAGE] fullyParallel 显式关死（根配置 fullyParallel:true 会把
      // 本组同文件不同 describe 的用例拆到多 worker——X2 全量跑时间戳证实 EXP-01
      // 与 QST-02 同文件并发。注意本开关只管同文件粒度，跨文件独占由全局
      // workers:1 兜底；car-chromium/city-perf/visual 同款纪律，本组此前漏配）
      name: 'world-chromium',
      testMatch: /world-spike\.spec\.ts|cyber-city.*\.spec\.ts/,
      fullyParallel: false,
      // [CC-PERF-C1] perf spec 排除（perf 测试方案 §1.3 ①）：cyber-city.*\.spec\.ts
      // 泛匹配会误收编 cyber-city-perf.spec.ts——该 spec 独归 city-perf-chromium
      testIgnore: /cyber-city-perf\.spec\.ts/,
      dependencies: ['car-chromium'],
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      // WS-PERF-01 帧率证据包（e2e-test-plan §5.8）：帧间隔采样对并发负载最敏感，
      // 单列 project 且依赖 world-chromium 殿后串行——保证采样期整机独占，
      // 读数可作为「该 CI 环境软件光栅化硬下界」归档（真机门禁另走人工录测）。
      name: 'world-perf-chromium',
      testMatch: /world-spike-perf\.spec\.ts/,
      dependencies: ['world-chromium'],
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      // CITY-PERF-01/02 城市档证据包（CC-PERF-C1；perf 测试方案 §1.3 ② 案 B）：
      // project 间 dependencies 是 Playwright 唯一的跨文件强序原语——依赖
      // world-perf-chromium 保证 WS-PERF-01 采样完毕后才开跑，双 perf 采样期
      // 均整机独占互不污染。
      name: 'city-perf-chromium',
      testMatch: /cyber-city-perf\.spec\.ts/,
      fullyParallel: false, // 文件内两用例（01→02）按序单 worker
      dependencies: ['world-perf-chromium'], // WS-PERF-01 采样完毕后才开跑
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      // 视觉/3D 冒烟取证（CC-L0-setup，e2e/visual/）：canvas 像素取证 + toHaveScreenshot
      // 基线 + @smoke3d 计分维度。含完整 3D 挂载 → 依赖链殿后（全量跑时整机独占）；
      // fullyParallel=false 钉死单 worker 顺序执行且用例相互独立（非 serial——
      // 一例失败不连坐，score-loop 按 @smoke3d 逐项计分）。
      // 快速单跑（提分 Loop 常规轮）：pnpm test:visual（--no-deps 跳过前置链）。
      name: 'visual-chromium',
      testMatch: /visual[\\/].*\.spec\.ts/,
      fullyParallel: false,
      dependencies: ['city-perf-chromium'], // [CC-PERF-C1] 依赖链改指新殿后节点（§1.3 ③）
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],

  webServer: {
    // Astro 7 在探测到 agent 环境时会自动转后台并让父进程退出，Playwright 因而报
    // “webServer exited early”。该变量在 Astro CLI 中关闭自动探测，保留前台子进程。
    command: `ASTRO_PREVIEW_BACKGROUND=1 pnpm preview --host 127.0.0.1 --port ${PORT}`,
    url: `${ORIGIN}${BASE_PATH}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
