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
  // WebGL（SwiftShader 软渲染）3D 挂载单次约 50s 且吃满 CPU，并行度封顶 2，
  // 避免多个 3D 上下文互相挤兑导致超时假阴性（首轮实测 4 worker 时 5/7 车配置器用例超时）
  workers: 2,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never' }]],

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
      name: 'desktop-chromium',
      testIgnore: /mobile\.spec\.ts|world-spike.*\.spec\.ts/,
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
      // world-spike 驾驶用例：每例完整挂载 3D + 长时驾驶积分（SwiftShader 下 ~1fps），
      // 依赖前两个 project 跑完后独占机器执行——4 核 CPU 上任何并发 3D 上下文
      // 都会把驾驶腿饿死（batch 1 已实测并发挤兑结论，此处更甚）。
      name: 'world-chromium',
      testMatch: /world-spike\.spec\.ts/,
      dependencies: ['desktop-chromium', 'mobile-375'],
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
  ],

  webServer: {
    command: `pnpm preview --host 127.0.0.1 --port ${PORT}`,
    url: `${ORIGIN}${BASE_PATH}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
