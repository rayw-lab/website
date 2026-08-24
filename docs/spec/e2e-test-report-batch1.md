# E2E 测试报告 · Batch 1

> 计划：[e2e-test-plan.md](./e2e-test-plan.md) · 分支 `cursor/e2e-testing-1d6f`
> 框架：Playwright（@playwright/test 1.62.1 · Chromium 151 headless）
> 被测产物：`astro build` 生产构建（`astro preview` 伺服，base `/website`，与 GitHub Pages 同构）
> 执行环境：Cloud Agent VM（Linux x64 · 4 vCPU · 15GB RAM · 无 GPU → WebGL 走 SwiftShader 软渲染 · 无 `navigator.gpu`）

## 1. 结果概要

| 指标 | 数值 |
|---|---|
| 用例总数 | 30（desktop-chromium 27 + mobile-375 3） |
| 通过 | **29** |
| 失败 | **0** |
| 条件跳过 | 1（SITE-E2E-04：`/world-spike/` 路由未交付，白名单内预期 404 → 按设计 skip） |
| 已执行用例通过率 | **29/29 = 100%** |
| 稳定性 | 最终形态连续 2 轮全绿（6.6 min / 6.1 min），2 worker |
| 复现命令 | `pnpm test:e2e`（首次需 `pnpm exec playwright install --with-deps chromium`） |

分套件明细：

| spec | 用例 | 结果 |
|---|---|---|
| `e2e/home.spec.ts` | HOME-E2E-01~05 | 5/5 ✅ |
| `e2e/lab-index.spec.ts` | LAB-E2E-01~04 | 4/4 ✅ |
| `e2e/tts-cockpit.spec.ts` | TTS-E2E-01~07 | 7/7 ✅ |
| `e2e/car-configurator.spec.ts` | CAR-E2E-01~07 | 7/7 ✅ |
| `e2e/site-health.spec.ts` | SITE-E2E-01~04 | 3/3 ✅ + 1 条件 skip |
| `e2e/mobile.spec.ts`（375px 触屏） | MOB-E2E-01~03 | 3/3 ✅ |

## 2. 发现的缺陷

### BUG-01（真实站点缺陷 · 已修复本分支）：tts-cockpit 移动端仪表簇从未被隐藏

- **发现用例**：MOB-E2E-02（375px 断言 `.cluster` 隐藏 → 实测 `display: grid` 可见）。
- **根因**：`src/pages/lab/tts-cockpit.astro` 中 `@media (max-width: 640px) { .cluster { display: none } }` 写在 `.cluster { …; display: grid }` 基础规则**之前**；两条规则特异性相同（0,1,0），级联按源序后者胜出——媒体查询在任何视口都被反向覆盖。真机同样复现（非仿真伪差异），窄屏下仪表簇挤占中控单列布局。
- **修复**：媒体查询块移至 `.cluster` 基础规则之后（同文件，附注释防回归）；MOB-E2E-02 即为该缺陷的常驻回归用例。
- **旁证**：同一媒体块内的 `.hmi-body` 覆盖規则因其基础规则恰好在前而一直正常——说明此类源序缺陷靠人工审查难以发现，属 E2E 体系的直接收益。

### 观察项 OBS-01（风险登记 · 未构成本批失败）：`navigator.gpu` 存在但 adapter 为 null 的降级空隙

`src/lab/facade.ts` 与 three.js `WebGPURenderer` 的回退判定基于 `navigator.gpu` **是否存在**；若浏览器暴露 `navigator.gpu` 但 `requestAdapter()` 返回 null（部分 Linux 桌面 Chrome 真机），`renderer.init()` 将 reject → facade 进入 error 态而非回退 WebGL 2。headless CI 无 `navigator.gpu`（恒走 WebGL 2 干净回退），无法覆盖该分支——已列入 plan §8 backlog（WebKit/Firefox project + adapter mock）。

## 3. 运行历史与失败项处置

| 轮次 | 配置 | 结果 | 失败项与处置 |
|---|---|---|---|
| Run 1 | 4 worker，站点未修复 | 18 ✅ / 11 ❌ / 1 skip（2.2m） | 见下方归因表 |
| Run 2 | 站点 CSS 修复 + spec 修正，2 worker | 28 ✅ / 1 ❌（5.5m） | CAR-E2E-05：`locator.click` 在 handler 调 `history.replaceState` 且 rAF 渲染循环压满 SwiftShader 合成器时，收尾等待（waiting for scheduled navigations）长挂。探针证实主线程健康（evaluate 往返 <200ms）、状态/URL 均正确 → 属驱动侧等待判定问题。处置：3D 页挂载后交互改「可见性断言 + dispatchEvent」 |
| Run 3 | dispatchEvent 方案 | 29 ✅ / 0 ❌（3.7m）全绿 | — |
| Run 4 | 同 Run 3 复跑 | 28 ✅ / 1 ❌（5.3m） | CAR-E2E-05 偶发：fullyParallel 下两个 SwiftShader 3D 上下文并发挤兑 4 核 CPU，页面饿死。处置：车配置器 spec 退出 fullyParallel（文件内按序单 worker）+ 削减一次冗余材质置换（URL 清理契约改逐 key 断言） |
| Run 5 | 最终形态 | **29 ✅ / 0 ❌（6.6m）全绿** | — |
| Run 6 | 最终形态复跑 | **29 ✅ / 0 ❌（6.1m）全绿** | — |

**Run 1 的 11 个失败归因**（全部闭环）：

| 归因 | 数量 | 用例 | 处置 |
|---|---|---|---|
| 真实站点缺陷（BUG-01） | 1 | MOB-E2E-02 | 修复站点 CSS |
| spec 选择器碰撞：`#screen` 与场景按钮同带 `data-scene` 属性，strict mode 解析出 2 元素 | 3 | TTS-E2E-03/04/05 | 收窄为 `.scene-btn[data-scene=…]` |
| CDP 禁 JS 语义：解析器 scripting flag 不变，`<noscript>` 子树不渲染为 DOM | 2 | TTS-E2E-07 / CAR-E2E-07 | noscript 文案改 `textContent` 合同断言 |
| 并行超时假阴性：4 worker 并发 3D 挂载（单次实测 ~50s） | 5 | CAR-E2E-01~05 | worker 封顶 2 + 车文件串行 + 挂载超时放宽（隔离复测 CAR-E2E-01 单跑 49.7s 通过，确认非站点问题） |

## 4. 关键验证证据（截图索引）

截图由用例执行时落盘：`docs/spec/assets/e2e-batch1/`（14 张，随 docs 入库）。

| 截图 | 用例 | 验证点 |
|---|---|---|
| `home_desktop_light.png` / `home_desktop_dark.png` | HOME-E2E-03 | 主题切换前后 body 背景实变 + html.dark 写入 |
| `lab_index_cards.png` | LAB-E2E-01 | manifest 双卡、LIVE 徽标、预算行 |
| `tts_playing_zh_nav.png` | TTS-E2E-02 | speaking 态：逐词字幕点亮、时钟/进度/统计联动 |
| `tts_deeplink_ar_rtl_park.png` | TTS-E2E-04 | 深链 `?locale=ar-SA&scene=park`：RTL 镜像 + 泊车场景直达 + 阿语播放 |
| `tts_blocked_reduced_motion.png` | TTS-E2E-06 | reduced-motion 拦截：poster 常驻 + 提示文案 + 零 chunk |
| `car_ready_default.png` | CAR-E2E-01 | 3D 挂载完成：车模实绘、HUD「糖果胭脂 · 原厂配色 · 双色机加工」、WebGL 2 徽标 |
| `car_deeplink_graphite_abyss_stealth.png` | CAR-E2E-03 | 深链三参组合生效（炙烤石墨 · 深海蓝 · 曜黑竞速） |
| `car_paint_crimson.png` | CAR-E2E-05 | 交互换漆：熔岩红上车 + URL `?paint=crimson` |
| `car_blocked_reduced_motion.png` | CAR-E2E-06 | reduced-motion 拦截：零 3D 资产请求 |
| `mobile_home_375.png` | MOB-E2E-01 | 375px 首页无水平溢出、导航横滚 |
| `mobile_tts_ready_375.png` | MOB-E2E-02 | 触屏自动挂载成功 + 仪表簇隐藏（BUG-01 修复后） |
| `mobile_car_blocked_pointer.png` | MOB-E2E-03 | 触屏 pointer 拦截：poster 常驻 + 移动端提示 |
| `mobile_car_ready_375.png` | MOB-E2E-03 | 显式启动后 375px 完成 3D 挂载 |

失败留痕（trace + 失败截图）输出至 `test-results/`（gitignore，不入库）；HTML 报告 `pnpm test:e2e:report`。

## 5. 覆盖缺口与下一步

- world-spike：路由未交付 → SITE-E2E-04 挂起中（交付即自动生效，且 SITE-E2E-01 会强制清退过期白名单条目）；交互深测列 plan §8.4。
- WebGPU 正路径 / adapter-null 空隙（OBS-01）：需 headed + GPU 环境或 WebKit/Firefox project。
- facade error 态、bfcache dispose、弱网降级：plan §8.5/§8.6。
- CI 接入：可选 job YAML 见 plan §6（建议先 `continue-on-error` 观察期，稳定后转阻断门禁）。
