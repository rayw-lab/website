# E2E 测试报告 · integration 批次（world-spike 交互 + corner cases）

> 计划：[e2e-test-plan.md](./e2e-test-plan.md)（§5.7 为本批新增用例）· 分支 `cursor/e2e-integration-report-1d6f`
> 被测基线：integration 合并 `cursor/bruno-implementation-plan-1d6f`（engine + vehicle 两条 world-spike 分支 + e2e 分支 + folio 差距报告 + 审计 F-1 整改合流）
> 框架：Playwright（@playwright/test 1.62.1 · Chromium 151 headless）· 被测产物 = `astro build` 生产构建（`astro preview` 伺服，base `/website`，与 GitHub Pages 同构）
> 执行环境：Cloud Agent VM（Linux x64 · 4 vCPU · 15GB RAM · 无 GPU → SwiftShader 软渲染 · 无 `navigator.gpu` → 恒验证 WebGPU→WebGL 2 回退链路）

## 1. 结果概要

| 指标 | 数值 |
|---|---|
| 用例总数 | **41**（desktop-chromium 27 + mobile-375 3 + world-chromium 11） |
| 通过 | **41 / 41 = 100%**（零 skip——Batch 1 的 SITE-E2E-04 条件 skip 已随 `/world-spike/` 交付自动转为实跑） |
| 稳定性 | 最终形态连续 **2 轮全绿**（14.1 min / 13.7 min，2 worker + world 独占串行段） |
| world-spike 驾驶验证 | **不降级、不 skip**：真实 CDP 键盘/触摸输入 → 物理积分 → 遥测断言闭环（§2） |
| 静态门禁 | `check-links` ✅（白名单过期反向阻断首次实战：`/world-spike/` 交付 → 双侧清退）· `audit-budget` ✅ 全部阻断级通过 |
| 复现命令 | `pnpm test:e2e`（首次需 `pnpm exec playwright install --with-deps chromium`） |

分套件明细：

| spec | 用例 | 结果 |
|---|---|---|
| `e2e/home.spec.ts` | HOME-E2E-01~05 | 5/5 ✅（F-1 整改后 Hero 无 Start here 入口，断言未受影响） |
| `e2e/lab-index.spec.ts` | LAB-E2E-01~04 | 4/4 ✅ |
| `e2e/tts-cockpit.spec.ts` | TTS-E2E-01~07 | 7/7 ✅ |
| `e2e/car-configurator.spec.ts` | CAR-E2E-01~07 | 7/7 ✅ |
| `e2e/site-health.spec.ts` | SITE-E2E-01~04 | **4/4 ✅**（04 由条件 skip 转实跑） |
| `e2e/mobile.spec.ts`（375px 触屏） | MOB-E2E-01~03 | 3/3 ✅ |
| `e2e/world-spike.spec.ts`（**本批新增**） | WS-E2E-01~11 | **11/11 ✅** |

调度说明：world-spike 每例完整挂载 3D + 长时驾驶积分，挂在独立 `world-chromium` project 且 `dependencies: ['desktop-chromium', 'mobile-375']`——4 核 CI 上任何两个 SwiftShader 3D 上下文并发都会把驾驶积分饿死（Batch 1 挤兑结论的加强版）。

## 2. world-spike 可驾驶验证（核心交付，不降级）

SwiftShader 软渲染本场景 ~1fps（决策记录 §3 口径一致），物理 dt clamp 1/20 → 世界呈慢动作。所有驾驶断言走「真实 CDP 输入 → 意图层 → 物理积分 → `__worldSpike` 遥测轮询」闭环，无一处 evaluate 直改状态、无一处因环境慢而 skip。两轮实测读数：

| 验证项 | 用例 | Round 1 实测 | Round 2 实测 |
|---|---|---|---|
| 挂载后端 / 场景复杂度 | WS-02 | webgl2 · 120 draw calls · 225,224 tris | 同左（逐位一致） |
| W 加速 >25km/h + 位移 >5m | WS-03 | ✅ | ✅ |
| 空格刹停 <5km/h · R 回出生点 | WS-03 | ✅ | ✅ |
| Shift boost 峰值（>70km/h 门槛） | WS-03 | **104.0 km/h** | 71.7 km/h |
| A 左转 Δyaw>0.12rad · 教学提示消隐 | WS-03 | ✅ | ✅ |
| 循迹扫掠撞锥桶（≤3 轮重试配额） | WS-04 | **第 1 轮命中**（cones=1 @ 75.7km/h） | **第 1 轮命中**（cones=1 @ 70.7km/h） |
| 撞桩后 HUD 计数联动 → R 复位闭环 | WS-04 | 出生点 (0,55)±0 · 速度 0 · 锥桶 0/16 ✅ | 同左 ✅ |
| 触摸摇杆持杆速度（CDP 真触摸） | WS-09 | **54.4 km/h** | 52.0 km/h |
| 帧率仪表读数（软渲染硬下界） | WS-03 | avg 0.94 / 1% low 0.12 | avg 0.96 / 0.12 |

驾驶过程视频（8× 时间压缩还原近实时观感，源为 Playwright 逐帧录制）：

- [world_drive_wasd_boost_8x.mp4](./assets/e2e-integration/world_drive_wasd_boost_8x.mp4) —— WS-03 全键位链路（W 加速 → 刹停 → R 复位 → boost → 左转）
- [world_cone_hit_and_reset_8x.mp4](./assets/e2e-integration/world_cone_hit_and_reset_8x.mp4) —— WS-04 循迹扫掠撞桩 + HUD 计数 + R 复位
- [world_mobile_joystick_8x.mp4](./assets/e2e-integration/world_mobile_joystick_8x.mp4) —— WS-09 375px 真触摸摇杆驾驶 + 复位按钮

关键状态截图（随 docs 入库）：

| 截图 | 状态 |
|---|---|
| [world_shell_idle.png](./assets/e2e-integration/world_shell_idle.png) | 静态壳（poster + 进入按钮，点击前零 world 字节） |
| [world_ready_hud.png](./assets/e2e-integration/world_ready_hud.png) | ready：HUD/提示/后端徽标揭示 |
| [world_drive_after_boost.png](./assets/e2e-integration/world_drive_after_boost.png) | WS-03 boost 后驾驶态 |
| [world_cone_knocked.png](./assets/e2e-integration/world_cone_knocked.png) | WS-04 锥桶击倒（HUD 计数非零） |
| [world_after_reset.png](./assets/e2e-integration/world_after_reset.png) | R 复位后（出生点、锥桶 0/16） |
| [world_gl1_backend.png](./assets/e2e-integration/world_gl1_backend.png) | `?gl=1` 强制 WebGL 2 徽标 |
| [world_engine_impl_ready.png](./assets/e2e-integration/world_engine_impl_ready.png) | `?impl=engine` 引擎层灰盒腿（Rapier，车辆读数隐藏） |
| [world_remount_ready.png](./assets/e2e-integration/world_remount_ready.png) | WS-07 dispose → 再挂载后 ready |
| [world_mobile_joystick.png](./assets/e2e-integration/world_mobile_joystick.png) | WS-09 摇杆持杆驾驶（动态原点基座可见） |

## 3. corner cases 覆盖结论

| corner case | 用例 | 结论 |
|---|---|---|
| reduced-motion | WS-06（+回归 TTS-06/CAR-06） | world 显式启动制下零自动加载成立；显式「进入」逃生门不被 reduced-motion 阻断（§12.4 语义对齐）✅ |
| 375px 移动端 | WS-09（+回归 MOB-01~03） | 无页面级水平溢出；CDP 真触摸摇杆全链路可驾驶；HUD 复位按钮与键盘 R 同语义 ✅ |
| 深链 | WS-05/11（+回归 TTS/CAR 深链 6 例） | `?gl=1` 强制 WebGL 2（徽标 + 遥测双确认）；白名单外参数忽略零异常；world 壳 URL 不回写（与 lab 模块 replaceState 契约区分）；`?impl=engine` 第二入口挂载可达 ✅ |
| dispose 再挂载 | WS-07 | pagehide → `dispose()` 零未捕获异常（UA 级已知项除外，§4）；返回后重新进入 ready 且**仍可驾驶**——dispose 的 canvas 置换克隆策略被证实有效 ✅ |
| 快速切页 | WS-08 | 资产加载中途弃页 + 全站五路由 commit 级快切：零未捕获异常；终局再完整进入并驾驶，无脏状态残留 ✅ |
| 无 JS | WS-10（+回归 HOME/LAB/TTS/CAR 4 例） | noscript 文案合同 + 操作说明/CC 署名静态可读 + 壳保持 idle ✅ |

## 4. 真实点击走查（Playwright MCP · 真实浏览器点击链）

按任务要求对五页做真实点击走查（home → 主题切换 → Lab 卡片点击 → tts-cockpit 自动挂载 + 播放 → 面包屑回 /lab/ → 卡片点击进 car-configurator 挂载 + 车漆切换 → /world-spike/ 进入 + 驾驶 + 复位）：

- 主题切换真点击后 `html.dark` 生效；home Lab 卡片真实导航至详情页；
- tts-cockpit 滚动入视口自动挂载 ready，播放进入 speaking、13 词点亮；
- car-configurator 真点击挂载 ready（WebGL 2），车漆「熔岩红」真点击后 aria-pressed / HUD「糖果胭脂 · 熔岩红 · 双色机加工」/ URL `?paint=crimson` 三处联动；
- world-spike 真点击「进入试验场」→ ready → W 键 20.7km/h → R 复位回 (0, 55) 速度 0。

走查发现两条 console 级观察项（未构成失败，见 §5 OBS-02/KNOWN-01 归档）。

## 5. BUG / 观察项列表

**本批未发现新的站点级功能缺陷**：3D 全链路（挂载/驾驶/碰撞/复位/释放/再挂载/双入口）在全部 41 用例 + 走查中零未捕获功能异常。登记如下：

### KNOWN-01（UA 级已知项 · 精确放行 + 真机复核挂账）：「Transition was skipped」未处理拒绝

- **现象**：WS-07 首轮实测离开 3D 页时页面级异常「Transition was skipped」×3；真实点击走查在普通页间导航（home→tts）同样复现 ×1。
- **归因**：站点启用**声明式**跨文档 View Transitions（`global.css` `@view-transition { navigation: auto }`，零 JS）。SwiftShader ~1fps 下 UA 无法按时产出转场帧 → 转场被跳过，Chromium 把 UA 内部 ViewTransition promise 的拒绝上抛为页面错误。纯声明式用法下站点侧**不存在可附着的 catch 点**；规格语义 = 自动退化为普通整页跳转，无功能影响。
- **处置**：`e2e/world-spike.spec.ts` 白名单仅此一条精确放行（附归因注释）；plan §8.6 挂账「带 GPU headed 环境复核真机转场正常播放时无此异常」。

### OBS-02（观察项 · 项目页 scope 外）：浏览器自动请求 `/favicon.ico` 404

走查中 Chromium 按惯例请求域根 `/favicon.ico`（base `/website` 之外）→ 404 console 噪音。页面已正确声明 `<link rel="icon" href="{base}/favicon.svg">`；GitHub Pages 项目页无法在本仓库 scope 内提供域根文件（须放入 `rayw-lab.github.io` 用户站点仓库）。仅 console 噪音，不影响功能与 SEO，登记备查。

### 测试侧修正（首轮失败全量归因，站点零责任）

| 首轮失败 | 归因 | 处置 |
|---|---|---|
| WS-03「位移 >2m」断言 | 测试侧阈值错误：速度达标瞬间位移仅 1.85m（加速段物理正确） | 改为「持续按 W 位移 >5m」轮询断言 |
| WS-04 单点追踪控制器 4 轮未命中锥桶 | 测试侧控制策略缺陷：无前瞻的单点追踪在低帧率下绕桩振荡 | 改为决策记录 §6 同款「环形道切线 + 半径误差修正」循迹扫掠（沿内桩线 52.4m 单趟扫 4 桩）——两轮均第 1 轮命中 |
| 移动 describe `devices['Pixel 5']` spread | Playwright 约束：describe 级 `use` 不允许 `defaultBrowserType` | 字段展开（userAgent/viewport/DSF/isMobile/hasTouch） |

## 6. 运行历史

| 轮次 | 范围 | 结果 | 说明 |
|---|---|---|---|
| Smoke 1 | WS-01/02 | 2 ✅（1.6m） | 壳合同 + 挂载首验通过 |
| Smoke 2 | WS-03/04 | 0 ✅ / 2 ❌（6.1m） | 测试侧阈值 + 控制器缺陷（§5 归因表），当轮修复 |
| Smoke 3 | WS-03/04 | 2 ✅（3.9m） | 循迹控制器第 1 轮命中锥桶 |
| Smoke 4 | WS-05/11/06 | 3 ✅（59s） | 深链双入口 + reduced-motion |
| Smoke 5 | WS-07/08/09/10 | 3 ✅ / 1 ❌（2.6m） | WS-07 捕获 KNOWN-01（UA 级），归因后精确放行 |
| **Round 1** | **全量 41** | **41 ✅（14.1m）** | 全绿 |
| **Round 2** | **全量 41** | **41 ✅（13.7m）** | 复跑全绿（稳定性确认） |

## 7. 与 folio 的差距摘要（对照 `docs/research/folio-gap-and-reuse-report.md`）

### 7.1 Start here 两级入口：现状实测 vs folio 两代

| 层级 | folio-2019 | folio-2025 | 本站 integration 实测 |
|---|---|---|---|
| 首页级入口 | 即世界（无壳页） | 即世界 | **门控中**：审计 F-1 依 PRD HOME-10 移除 Hero「Start here」（Phase B `/world/` 转正随 LAB-16 恢复）；当前 `/world-spike/` 为 noindex 隐藏路由（WS-01 + SITE-03 双断言通过） |
| 壳页级（第一级） | — | — | **✅ 已达成并实测**：poster + 显式「进入试验场」，点击前零 world 字节（WS-01），逃生链接「跳过 3D 返回首页」（WS-07 实走） |
| 世界级（第二级） | Start 区域（开车压上，教学与启动合一） | Intro 圆环 + 任意输入即开始（`inputs.filters` 门控） | **✗ 缺**：挂载后直接可驾驶，无 Intro/Reveal 启幕状态机——gap 报告 §4.4 裁决的「两级 Start」只落了第一级 |

### 7.2 降级链：本站已实测 vs folio

folio 无降级纪律（WebGL 一条路 + 加载圆环）；本站降级链在本批全部实测：WebGPU→WebGL 2 自动回退（headless 恒走回退腿，徽标 + 遥测双断言）→ `?gl=1` 强制回退（WS-05/CAR-02）→ reduced-motion/显式启动闸门（WS-06/TTS-06/CAR-06）→ 静态壳 + noscript（WS-01/10）。**这一维度本站强于 folio**；剩余空隙为 WebGPU 正路径与「`navigator.gpu` 存在但 adapter null」分支（Batch 1 OBS-01，需真机/WebKit project）。

### 7.3 还差什么（按 gap 报告口径核对 integration 现状）

引擎层已合流 Game/Ticker/Inputs/View/Player/Physics(Rapier)/World 灰盒/Zones/References/Respawns（gap 报告 §2.2 四件悬空已闭环）；vehicle 腿已交付可驾驶验证。**仍缺**：`PhysicsVehicle`（引擎腿无车，`?impl=engine` 仅灰盒 + 锥桶）、Intro/Reveal（世界级 Start）、MeshGridMaterial/Grid（folio 同款灰盒颜值）、Areas/POI 消费端（Area/Areas/InteractivePoints/TextCanvas/Map）、PreRenderer、maths 剩余函数、音效（Phase C）、真机帧率录测（决策记录 §8 条件项，Phase B 合并前置）。

### 7.4 下一步复用 folio Top 5

| # | folio 源（行数/改写量） | 解锁什么 | 依据 |
|---|---|---|---|
| 1 | `Physics/PhysicsVehicle.js`（590 · 低改） | 引擎腿上车——两条 Spike 合体转正（决策记录 §8）的唯一硬缺口；翻车/悬挂/碰撞体互推是运动学模型给不了的 Phase B 能力 | gap §8.2#5 · Top20#4 |
| 2 | `World/Intro.js` + `Reveal.js` 合并（578 · 中改 ~200 行） | Start here 第二级（世界级）入口：进度圆环吃 ResourcesLoader 进度 + 任意输入出发——补齐 §7.1 实测缺口，也是 HOME-10 门控入口恢复的体验前提 | gap §4.4 · Top20#15 |
| 3 | `Materials/MeshGridMaterial.js` + `World/Grid.js`（257 · 零/低改） | 灰盒地面 folio 同款颜值 + Reveal 加载态视觉依赖，替代画布纹理地面，零美术投入 | gap Top20#8/9 |
| 4 | `Areas/Area.js` + `Areas.js` + `InteractivePoints.js` 精简版（921 → ~430 · 低/中改） | 六分区 POI 地基（Zones/References/Respawns 已就位，独缺消费端）——世界与站点内容层的连接件 | gap §5.3 B-3/4/5 · Top20#16/17 |
| 5 | `PreRenderer.js` + `utilities/maths.js` 剩余函数（~94 · 零改） | 首帧防白屏（shader 预热）+ `circleIntersectsPolygon`/`segmentCircleIntersection`（Area frustum 判定的唯一数学依赖） | gap Top20#13/14 |

## 8. 结论

integration 基线（engine + vehicle + e2e 合流）在真实浏览器下全维度绿灯：41/41 连续两轮，world-spike **可驾驶性以真实输入实测确认**（加速/刹停/boost/转向/锥桶碰撞/复位/触摸摇杆/双后端/双入口/dispose 再挂载），静态门禁与白名单收缩纪律首次实战走通。无阻断级缺陷；KNOWN-01/OBS-02 为环境与 scope 级观察项。Phase B 建议按 §7.4 Top 5 顺序复用 folio，并优先补真机帧率录测（决策记录 §8 条件项）。
