# 赛博科技城运行时性能调研（CC-PERF-RS）

> 执行模型自报：**claude-fable-5-thinking-xhigh**

| 项 | 内容 |
|----|------|
| 任务 | **CC-PERF-RS**（Loop 8 性能扩展子 Task）——性能 85 北极星的巨人肩膀搜刮：three.js/folio 运行时优化模式对照 + SwiftShader CI vs 真机双轨口径 + `/` 采样缺口审计 + CITY-PERF-01 设计输入（**只调研，零实现**） |
| 分支 | `cursor/cc-perf-rs-survey-1d6f`（base：`main` @ `b2b8684`） |
| 日期 | 2026-08-27（UTC） |
| 上游 | 顾问报告 `cyber-city-fxn-advisor-consult.md` §3（性能双轨冻结）· rubric 正本 `docs/spec/cyber-city-function-rubric.md` §5（P1–P5 权重与锚点）· `e2e/world-spike-perf.spec.ts`（WS-PERF-01 先例）· `docs/spec/human-gate-checklist.md` §5.4（真机回填位）· gap 审计 `cyber-city-gameplay-gap-audit.md`（「`/` 城市档零采样」行）· 观测规格 `docs/spec/cyber-city-observability.md`（SessionTimeline/工件契约，OBS-C1/C2 已合流） |
| 方法 | 17 仓库全部经 `gh api repos/{owner}/{repo}` 实测（星数 / SPDX 许可 / archived / 最近 push，2026-08-27 快照）；folio-2025/2019 以 vendor 一手快照核验到文件行号；three 0.185 API 以 `node_modules/three/build/three.webgpu.js` 一手核验；CI 读数事实以 `test-results/world-spike-metrics.jsonl` 最新行 + `world-spike-log.md` §3 实测记录为证 |
| 下游 | CC-PERF-BR（特性脑暴）· CC-PERF-DES（性能规格正本 + CITY-PERF-01 spec 定稿）· CITY-PERF-01 实现（e2e 批次）· CC-AL-PERF / human-gate 回填（登记） |

## 0. 结论先行

1. **「CI 不判帧率」是生态常态，不是本站妥协**：three.js 官方 CI 自己就不跑帧率门——
   `test/e2e` 用 puppeteer + `deterministic-injection.js`（钉死随机数/时间）做**确定性截图回归**，
   性能判定完全不进 CI。SwiftShader（CPU 光栅化，本站实测 ~1fps）读数只有「下界哨兵」价值，
   WS-PERF-01 文件头结论（任何 CI 数值硬门要么恒假阳性要么恒假阴性）与生态实践一致，直接继承。
2. **优化面「巨人肩膀」已大半在手，缺的是测量面**：folio 血统的运行时优化模式
   （Quality 三档 / DPR 封顶 / InstancedMesh / PreRenderer shader 预热 / bloom 旁路 /
   渲染循环即游戏循环 / renderOrder 手排）已随 vendor 移植进 `src/lab/world/`，poster-first
   与 world 分包是本站超出 folio 的部分（§3.1 对照表）。真正的运行时优化缺口只有一个：
   **FPS 自动降档接线**（`Quality.ts` 注释预留「连续 2s <30fps → Q2 + toast」，folio 无此功能，
   drei `PerformanceMonitor` 是同形态先例）——归 PERF-BR/DES 裁决，非本调研扩权。
3. **`/` 城市档零采样是性能 85 的第一取证缺口**（gap 审计已提）：`world-spike-perf.spec.ts`
   只测 `/world-spike/`，而登记对象是生产 `/`；两档在挂载路径、动作脚本、场景负载、工件上
   全部不同（§3.4 差异表）。**补此缺口零 src/ 改动**——CITY-PERF-01 所需的全部取证面
   （`__worldSpike.fps()/info()/state()`、`__worldSession.dump()`、`data-world-state` 状态机、
   HUD `[data-ws-fps]`）已随 OBS-C1/C2 与 CC-E7 合流就位，纯 e2e + playwright.config 交付。
4. **测量零引库**：stats.js（无 1% low）/ stats-gl（双表冗余）对本站 FpsMeter（avg + 1% low
   滑窗，真机门禁同口径）无增量；detect-gpu 触「零网络副作用」红线（默认拉 CDN 基准 JSON）。
   唯二值得记录的新测量面：① three 0.185 **内建 GPU 计时**（`trackTimestamp` +
   `resolveTimestampsAsync`，WebGPU timestamp-query / WebGL2 disjoint timer query，
   `three.webgpu.js` L62037/L66163 一手核验）——`#debug` 面板 v1 增 GPU ms 读数的零依赖路径；
   ② **LoAF**（`PerformanceObserver` type `long-animation-frame`，Chrome 123+ 平台 API）——
   CITY-PERF-01 的 stall 归因补充通道。两者均为裁决点非 v1 必做（§3.5）。
5. **CITY-PERF-01 设计输入冻结建议**（§3.5 全文，交 PERF-DES 定稿）：对象 `/`、
   动作脚本与 human-gate §5.4 行 1 同源（变形 → 驾驶 20s 含 2 急转 + 1 锥桶 + 1 boost）、
   rAF 采样沿用 WS-PERF-01 标定（≥5s 且 ≥6 帧封顶 45s、stall 50ms）、软门 p95<50ms 沿用
   （OBS annotation 不阻断）、CI 单腿 + 后端指纹归因（SwiftShader WebGPU 有 createBuffer
   缺陷记录且实测自动回退 webgl2，双后端腿归真机）、工件 `city-perf-evidence.jsonl` +
   session dump 附档。**project 拓扑必须处理**：全局 `fullyParallel: true` 下同 project 两个
   spec 文件会并行互相污染采样——推荐 `world-perf-chromium` 扩 testMatch + 该 project
   `fullyParallel: false`（两行 config 改动，殿后独占语义不变）。
6. **真机轨零新增采购**：human-gate §5.4 四行 + 顾问增补两行（Q2 降档腿 / Fast 4G 加载腿）
   已是完整协议；工具全部免费在手（DevTools Performance、`chrome://inspect`、HUD FpsMeter、
   安卓系统级归因可选 Perfetto）。云端代理产不出真机读数——**留空不伪造**纪律延续。

## 1. 红线与本仓库现状（先立秤再称重）

| 红线 / 事实 | 出处 | 对本调研的含义 |
|------|------|----------------|
| 性能分双轨：真机判定、CI 哨兵 | rubric §5 / 顾问 §3：P1/P2 判定权威 = human-gate §5.4 真机录测；CI 证据包只做下界 | 一切 CI 侧设计不得含 60/30 判定或时长判定；调研重点是「证据包怎么产」不是「门怎么设」 |
| LHCI 与性能分彻底分立 | 顾问 §3.1：LHCI 测壳加载（`/` 已 P100），对 world 运行时帧率零感知 | Lighthouse（含 timespan/user-flow 模式）不入运行时轨（§4 否决存档） |
| G5 依赖红线 | `implementation-roadmap-birdseye.md` G5：不引 React/R3F 等 | drei `PerformanceMonitor`/`AdaptiveDpr`、r3f-perf 只借模式不借码 |
| 零网络副作用 | 观测规格 §1「❌ RUM / 远端上报 / 第三方统计 SDK」（P0 零网络副作用） | detect-gpu 默认拉远端基准 JSON → 不引（§4） |
| 性能采样不归 SessionTimeline | 观测规格 §1：「帧间隔采样归 CITY-PERF-01；SessionTimeline 不读 fps 只记事件」 | CITY-PERF-01 是独立 spec，dump 只作漏斗/事件附档 |
| 预算门已有 CI 权威 | rubric §5 P4：audit-budget 零 ❌（二值，本维 CI 即权威） | P4 零新增调研面；本调研聚焦 P1/P2/P3/P5 的取证与优化模式 |
| 测量资产已在手 | `FpsMeter.ts`（滑窗 avg + 1% low，喂墙钟不吃 Ticker.delta）· WS-PERF-01 rAF 采样（p50/p95/max/stall）· SessionTimeline `funnel.robotIdle/carReady/driveStart`（OBS-C1 已合，`SessionTimeline.ts` L92/L176）· `#debug` 面板 drawCalls/triangles（`DebugPanel.ts` L180-182，读 `renderer.info`）· HUD `[data-ws-fps]` | CITY-PERF-01 零新钩子需求；「测量面缺口」只剩 GPU 计时（§3.2 裁决点） |
| 优化资产已在手 | `Rendering.ts`：Quality 三档（DPR 2/1.5/1 封顶 L23、bloom 全/弱/整段旁路、阴影开关）· `PreRenderer.ts` shader 预热（quality 0 + WebGPU 门）· `StreetProps.ts`/`FlightTrails.ts`/`CitySilhouette.ts` InstancedMesh · poster-first + world 分包动态 import（壳零 world 字节，CITY-E2E-01 断言） | 优化面调研 = 对照存量找缺口（§3.1），不是从零搜刮 |
| 自动降档预留未接线 | `Quality.ts` L12-13 注释：「连续 2s <30fps → 降 Quality 2 + toast，接线归 Phase 1 装配段」 | 唯一值得排期的运行时优化缺口，先例见 §3.1 末段 |
| `/` 零采样 | gap 审计「帧率/性能采样于 `/`」行：world-spike-perf.spec 只测 `/world-spike/`；`/` 城市档零采样 | 本调研 §3.4/§3.5 的直接靶子 |
| CI 环境事实 | `world-spike-metrics.jsonl` 最新行（2026-08-27）：`webgpuAvailable: true` 但 `backend: "webgl2"`、avg 1.11fps、drawCalls 263 / triangles 447,493；`world-spike-log.md`：SwiftShader WebGPU `createBuffer` RangeError 缺陷记录（判定为 SwiftShader Vulkan 资源上限，非应用 bug） | CI 双后端腿无意义（WebGPU 腿不可靠/自动回退），单腿 + 指纹归因；drawCalls/triangles 是 CI 侧最稳的「负载回归」读数（与帧率不同，它环境无关） |

接入成本刻度（沿用 VEH/CAM 调研）：**零**（已 vendor / 已是依赖 / 平台 API）｜**低**（≤200 行自实现、零新依赖）｜**中**（新增运行时依赖，须 SRD 登记）｜**高**（栈不兼容 / 需改架构）。

## 2. 总表（17 仓库，`gh api` 2026-08-27 实测）

### 2.1 测量 / 证据面

| 仓库/项目 | 许可 · 星 · 最近 push | 可借鉴点 | 红线对齐 | 接入成本 | 裁决 |
|------|------|-------------------|----------|----------|------|
| [mrdoob/stats.js](https://github.com/mrdoob/stats.js) | MIT · 9,148 · 2024-10 | FPS/MS/MB 三面板经典件；rAF 间隔计数的教科书实现 | 无 1% low（真机门禁读数需要）；与 FpsMeter 双表冗余 | 无需（—） | 不引（FpsMeter 已覆盖且口径更全） |
| [RenaudRohlinger/stats-gl](https://github.com/RenaudRohlinger/stats-gl) | MIT（package.json v4.2.3 核验；API SPDX 为 none）· 278 · 2026-07 | **CPU/GPU 双轨帧计时**：WebGL2 `EXT_disjoint_timer_query_webgl2` + WebGPU timestamp-query 读 GPU ms——「CPU 帧间隔 ≠ GPU 负载」的测量分离思路 | 引库无增量：three 0.185 已内建同能力（§3.2）；面板 UI 与 `#debug` 冗余 | 借思路（零：用 three 内建） | 模式参照（GPU 计时思路） |
| [BabylonJS/Spector.js](https://github.com/BabylonJS/Spector.js) | MIT · 1,614 · 2026-08 | WebGL 单帧捕获：逐 draw call 状态/纹理/耗时归因——draw call 异常暴涨时的排查显微镜 | 浏览器扩展形态本地用；**不进生产 bundle**（预算红线） | 零（扩展本地装） | 工具箱收编（真机/本地排查用，不进运行时） |
| [pmndrs/detect-gpu](https://github.com/pmndrs/detect-gpu) | MIT · 1,211 · 2026-08 | GPU tier 分档（跑分数据库查表）：初始 Quality 档位判定比 UA 嗅探精准 | **默认从 CDN 拉基准 JSON** → 触零网络副作用红线；自托管 JSON ~百 KB 触预算 | 中 | 不引（理由存档 §4；UA 分档 + `?quality=` 深链 + 自动降档三件套已够） |
| [utsuboco/r3f-perf](https://github.com/utsuboco/r3f-perf) | MIT · 780 · 2024-12 | R3F 生态性能面板（gl.info + 内存 + shader 计数一屏） | R3F（G5 出局） | —（只看） | 观感参照（`#debug` 面板 v1 信息密度对标） |
| [w3c/long-animation-frames](https://github.com/w3c/long-animation-frames)（LoAF 规格） | W3C 文档许可 · 22 · 2026-04 | **平台级 stall 归因**：`PerformanceObserver`（type `long-animation-frame`，Chrome 123+）给出长帧的脚本/渲染耗时拆解——比裸 rAF 间隔多出「谁吃掉了这帧」 | 平台 API 零依赖；Firefox/Safari 未实现（CI Chromium 恒可用，真机 Chrome 可用） | 低（采样脚本 ~20 行） | 推荐为 CITY-PERF-01 v1.1 补充通道（§3.5 裁决点） |

### 2.2 优化模式（folio / three.js 生态）

| 仓库/项目 | 许可 · 星 · 最近 push | 可借鉴点 | 红线对齐 | 接入成本 | 裁决 |
|------|------|-------------------|----------|----------|------|
| [brunosimon/folio-2025](https://github.com/brunosimon/folio-2025) | MIT · 1,772 · 2026-04 | 运行时优化全家桶（§3.1 逐项对照）：Quality 二档驱动 shadow mapSize 2048/512（`Ligthing.js` L23）、`InstancedGroup`（GLB 引用 → 逐 mesh InstancedMesh，tick order 13 批量矩阵更新）、`PreRenderer` 32px CubeCamera 管线预编译（`Game.js` L202-204 仅 quality 0 + WebGPU）、噪声烘焙时 `setPixelRatio(1)`（`Noises.js` L204/244/286，离屏渲染不吃 DPR）、DPR<2 才开 antialias（`Rendering.js` L44） | vendor 快照在手，大半已移植 | **零** | ⭐ 已在用（本站运行时优化基线） |
| [brunosimon/folio-2019](https://github.com/brunosimon/folio-2019) | MIT · 4,736 · 2024-05 | **matcap 单材质族 + 烘焙光照**（`src/javascript/Materials/Matcap.js` + matcap glsl）：全场景无实时光、材质种类个位数 → 管线切换近零——「美术烘焙换运行时」的极限样本 | 本站城市走 TSL 霓虹/自发光路线，不可整搬；「压材质种类数」的纪律可借 | 借纪律（—） | 概念参照（材质预算意识） |
| [mrdoob/three.js](https://github.com/mrdoob/three.js) | MIT · 114,838 · 活跃 | ① `renderer.info`（drawCalls/triangles，`#debug` 已消费）；② **内建 GPU 计时**：`WebGPURenderer({ trackTimestamp: true })` + `renderer.resolveTimestampsAsync('render')`（`three.webgpu.js` L62037/L66163/L66684 一手核验，WebGPU timestamp-query / WebGL2 disjoint timer query 双后端同 API）；③ `BatchedMesh`（异构几何合批，r160+）；④ **官方 CI 先例**：`test/e2e/`（`puppeteer.js` + `deterministic-injection.js` + `clean-page.js`）= 确定性截图回归，无帧率门 | 已是依赖；GPU 计时默认关（`trackTimestamp` 显式开才有开销） | 零 | ⭐ 主库能力盘点（GPU 计时 = `#debug` v1 裁决点；BatchedMesh = V2 观察） |
| [gkjohnson/three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh) | MIT · 3,462 · 2026-08 | BVH 加速 raycast（大网格场景 raycast 从 O(n) 三角形降到 O(log n)）——若 `RayCursor` 逐帧 raycast 成为热点的解药 | 新增运行时依赖（中）；**RayCursor 现状未证瓶颈**——CI drawCalls 263 / triangles 447k 量级下无证据 | 中 | V2 观察（先用 DevTools Performance 证明瓶颈再议） |
| [pmndrs/drei](https://github.com/pmndrs/drei) | MIT · 9,821 · 2026-08 | **`PerformanceMonitor` 自动降档先例**：滑窗采样 fps → 上/下阈值 + `flipflops` 抖动保险丝（反复升降 N 次后锁定 fallback）+ `factor` 连续系数；`AdaptiveDpr`：regress 期间把 DPR 降到 performance.min 再回弹 | R3F（G5）只借模式；「抖动保险丝」正是 `Quality.ts` 预留自动降档缺的设计件 | 借模式（低，~50 行接线） | ⭐ 模式推荐（自动降档 = PERF-BR 候选特性的形态参照） |
| [donmccurdy/glTF-Transform](https://github.com/donmccurdy/glTF-Transform) | MIT · 1,951 · 2026-08 | glTF 构建期压缩管线（prune/dedup/quantize/meshopt/KTX2 一条龙 CLI）——P3「加载→可玩 ≤8s」的资产侧杠杆（CarConcept 3.4MB 是最大加载件） | 构建期工具零运行时字节；改资产管线属 P3 优化批次不属本调研扩权 | 低（devDependency） | 观察项（P3 若不达标的第一杠杆，交 PERF-BR） |
| [BinomialLLC/basis_universal](https://github.com/BinomialLLC/basis_universal) | Apache-2.0 · 3,088 · 2026-08 | KTX2/BasisU GPU 纹理压缩（显存占用与上传时间数量级下降；three `KTX2Loader` 原生支持） | 同上：构建期资产杠杆；本站纹理面目前小（程序化为主），优先级低于 CarConcept 网格 | 低 | 观察项（P3 资产侧，纹理面增长后再议） |

### 2.3 CI / 真机双轨基建

| 仓库/项目 | 许可 · 星 · 最近 push | 可借鉴点 | 红线对齐 | 接入成本 | 裁决 |
|------|------|-------------------|----------|----------|------|
| [google/swiftshader](https://github.com/google/swiftshader) | Apache-2.0 · 2,533 · 2026-08 | CI 渲染环境的本体：CPU 光栅化 Vulkan 实现（headless Chromium `--enable-unsafe-swiftshader` 即它）。**定位声明就写明是「可移植性/一致性方案」不是性能方案** | 事实基建非选型项；其 WebGPU 腿缺陷已留案（§1 末行） | —（已在环境里） | 事实参照（双轨口径的物理依据） |
| [microsoft/playwright](https://github.com/microsoft/playwright) | Apache-2.0 · 95,211 · 活跃 | 已是依赖：CDP 直通（`page.evaluate` rAF 采样 = WS-PERF-01 现行法）、`test.info().attach` 证据附档、project 依赖链殿后独占 | 无 | 零 | ⭐ 已在用（CITY-PERF-01 载体） |
| [GoogleChrome/lighthouse](https://github.com/GoogleChrome/lighthouse) | Apache-2.0 · 30,703 · 活跃 | timespan/user-flow 模式可测交互期 TBT/INP——但**无帧率维度**，且同跑在 SwiftShader 上 | 运行时帧率轨不适用（§4 否决存档）；既有 LHCI 导航模式继续守壳加载 | —（已在用） | 维持现职（壳加载轨），不扩权进运行时轨 |
| [google/perfetto](https://github.com/google/perfetto) | Apache-2.0 · 6,396 · 活跃 | 安卓真机系统级 tracing（GPU 频率/温度/掉帧归因），`chrome://inspect` 之上的深挖层 | 真机轨工具箱，零仓库接入 | 零（工具本地用） | 工具箱收编（安卓腿 <30fps 时的归因深挖，可选） |

**计数**：2.1×6 + 2.2×7 + 2.3×4 = **17 仓库/项目**，全部 `gh api` 实测（LoAF 为 W3C 规格仓库；闭源/平台项已单独标注口径）。

## 3. 深读

### 3.1 folio/bruno 运行时优化模式对照（vendor 一手源码 vs 本站移植现状）

| 模式 | folio 出处（一手行号） | 本站现状 | 缺口/动作 |
|------|------|------|------|
| Quality 档位驱动一切 | `Quality.js`（isMobile 二档）；`Ligthing.js` L23/L28（shadow mapSize 2048/512、radius 3/2）；`Game.js` L202-204（quality 0 才 PreRender） | ✅ 且更细：三档（`Quality.ts` 0/1/2）+ `?quality=` 深链 + `#debug` 热切；`Rendering.ts` 档位驱动 DPR/bloom/阴影 | 无缺口；**P5 的 e2e Q2 存在腿未建**（`?quality=2` 在 e2e 零覆盖，grep 实证）→ CITY-PERF-01 随行或独立用例（§3.5） |
| DPR 封顶 + antialias 门 | `Rendering.js` L44-47（DPR<2 才 antialias；setPixelRatio 跟 viewport） | ✅ `Rendering.ts` L23 三档封顶 {2, 1.5, 1}，L46 同款 antialias 门 | 无缺口 |
| InstancedMesh 合批 | `InstancedGroup.js`（GLB 引用组 → 逐 mesh InstancedMesh，tick 13 矩阵批更新；Bricks/Fences/PoleLights/Benches 等九处消费） | ✅ 思路已用：`StreetProps.ts`（4 draw call 封顶注释）、`FlightTrails.ts`（单 InstancedMesh 全航线）、`CitySilhouette.ts` | 无缺口；BatchedMesh（异构合批）留 V2 观察——现状 CI 读数 drawCalls 263 未见失控 |
| shader 预热（消首帧卡顿） | `PreRenderer.js`（32px CubeCamera 全场景强制渲一遍逼管线编译） | ✅ `PreRenderer.ts` 移植 + 补清场；调用门 quality 0 + WebGPU（渲染架构审计已留观察：仅此组合生效） | 无缺口本批次；「Q1/WebGL2 是否也该预热」= 渲染审计已留 defer 项，不重复立项 |
| 渲染循环即游戏循环 | `Rendering.js` L68（setAnimationLoop → ticker.update，单循环无双 rAF） | ✅ `Rendering.ts` L57-59 同款 | 无缺口 |
| 排序开销手控 | folio renderOrder 纪律 | ✅ `Rendering.ts` L50-54：`sortObjects = false` + opaque/transparent 双排序器只按 renderOrder | 无缺口 |
| 离屏渲染不吃 DPR | `Noises.js` L204/244/286（烘噪声前 setPixelRatio(1)） | ✅ 同类纪律在 TextCanvas/烘焙件沿用 | 无缺口 |
| 后处理档位旁路 | folio bloom `_nMips` 按档 5/2 | ✅ 更狠：Q2 整段旁路直连 `renderer.render`（零 pass 开销，`Rendering.ts` L14） | 无缺口 |
| **FPS 自动降档** | **folio 无此功能**（档位只有 UA 初判 + debug 面板手切） | ❌ `Quality.ts` L12-13 注释预留：「连续 2s <30fps → 降 Q2 + toast」，接线未做 | **唯一运行时优化缺口**。先例形态 = drei `PerformanceMonitor`：滑窗 fps + 上下双阈值 + **flipflops 抖动保险丝**（反复升降 N 次锁定 fallback，防临界震荡）；本站已有 FpsMeter 滑窗，接线 ~50 行。交 PERF-BR 立项、PERF-DES 定阈值（注意与 reduced-motion / `?quality=` 显式深链的优先级关系：显式参数永不被自动档覆盖） |
| poster-first / 分包懒加载 | folio 无（全量入场） | ✅ 本站独有：壳零 world 字节（CITY-E2E-01 断言）+ world 动态 import + `funnel.robotIdle` 机读位 | 本站超出 folio 的部分；P3 的分母就是这套架构 |

**一句话**：优化面对照的结论是「**存量健康、缺口唯一**」——性能 85 的短板不在优化技巧，
在**取证链路**（`/` 零采样 + 真机表空白），这正是 CITY-PERF-01 与 human-gate 的分工。

### 3.2 three.js 官方口径（双后端 GPU 计时 + 官方 CI 先例）

- **`renderer.info`**：drawCalls/triangles 已进 `#debug` 面板（`DebugPanel.ts` L180-182）。
  CI 侧它是**环境无关**读数（SwiftShader 与真机同值）——比帧率更适合做「场景负载回归」
  哨兵：CITY-PERF-01 证据包应记录之（§3.5 schema），漂移可归因到具体 PR 的场景改动。
- **内建 GPU 计时**（本调研核验的主库新能力）：`three.webgpu.js` L66163
  `this.trackTimestamp = (parameters.trackTimestamp === true)`；L62037/L66684
  `async resolveTimestampsAsync(type = 'render')`。WebGPU 走 timestamp-query、WebGL2 走
  disjoint timer query，**同一 API 双后端**。默认关闭零开销。价值：真机 `#debug` 走查时
  区分「CPU 帧循环慢」vs「GPU 渲染慢」（P1 不达标时的第一归因分叉）。裁决点交 PERF-DES：
  `#debug` v1 增 GPU ms 行（仅 `#debug` 挂载时 `trackTimestamp: true`，生产路径不开）。
- **BatchedMesh**：r160+ 异构几何合批（InstancedMesh 要求同几何，BatchedMesh 不要求）。
  楼群/装饰件若未来 draw call 失控是对症药；现状 263 draw call 无病不吃药，V2 观察。
- **官方 CI 先例**（对双轨口径的生态佐证）：three.js `test/e2e/` 用 puppeteer 截图回归 +
  `deterministic-injection.js`（钉死 `Math.random`/时间/rAF 节奏）保证可比性——**官方从不
  在 CI 判帧率**。本站 WS-PERF-01「证据包不判定」的定位与主库实践同构，可在 PERF-DES
  文档里作为「为什么 CI 软门不转硬」的引用依据。

### 3.3 SwiftShader CI vs 真机双轨口径（冻结建议镜像 + 生态佐证）

**物理事实**（本仓库实测存档）：

| 事实 | 证据 |
|------|------|
| SwiftShader = CPU 光栅化，定位是一致性不是性能 | 仓库自述（§2.3）；playwright.config L47 `--enable-unsafe-swiftshader` |
| 本站场景下 ~1fps | `world-spike-metrics.jsonl` 最新行 avg 1.11fps / p95 帧间隔 2133ms；`world-spike-log.md` §3 首轮 0.90fps |
| CI 的 WebGPU 腿不可靠 | `webgpuAvailable: true` 但实际 `backend: "webgl2"`（自动回退）；SwiftShader Vulkan `createBuffer` RangeError 缺陷已留案（判定非应用 bug） |
| 时长读数同等失真 | cyber-city.spec MOUNT_TIMEOUT 210s（真机门禁 ≤8s 的 26 倍余量）；CITY-E2E-03 已把 load→robot_idle 作 annotation 采集不判定 |

**双轨分工表**（rubric §5 冻结口径的执行版，CI 列 = CITY-PERF-01 职责边界）：

| 维 | CI（SwiftShader）能产什么 | CI 不许做什么 | 真机（human-gate §5.4）判什么 |
|----|------|------|------|
| P1 帧率体感 | 下界读数 + rAF 持续出帧硬断言 + 环境指纹 | 60/30 判定、任何 fps 数值硬门 | 桌面双后端 ≥60 / 中端安卓 ≥30（20s/60s 脚本） |
| P2 1% low | `fps().low1` 读数留档 | ≥45 判定 | 桌面 1% low ≥45（HUD + DevTools 互证） |
| P3 加载可玩 | `funnel.robotIdle` **存在性**（非 null）+ 毫秒数留档 | ≤8s 计时判定 | Fast 4G throttle 秒表 + funnel 截图互证 |
| P4 预算 | audit-budget 零 ❌（**本维 CI 即权威**，既有硬门） | — | —（CI 权威） |
| P5 降档可感知 | `?quality=2` 核心路径**存在性** e2e（待建，§3.5） | 降档「可感知性」判定 | S-5 L6 腿真人走查 |
| 负载回归 | drawCalls/triangles 快照（环境无关，唯一可跨轮硬比的 CI 读数） | —（v1 只留档不设门） | — |

**纪律镜像**（禁止清单第 4/8 条在性能轨的表达）：CI 读数永不填 human-gate 表；真机行
产不出时对应维 `score` 置 null 留空；CI 侧采样脚本必须与真机动作脚本**同源**（否则两轨
读数失去互证意义——这是「脚本同源」写进 §3.5 协议第 3 步的原因）。

### 3.4 `/` 城市档 vs `/world-spike/` 采样缺口审计（gap 审计 GAP 行展开）

gap 审计已登记：「world-spike-perf.spec 只测 `/world-spike/`；`/` 城市档零采样」。逐项差异：

| 差异面 | `/world-spike/`（WS-PERF-01 已测） | `/`（城市档，零采样） | 对 CITY-PERF-01 的含义 |
|------|------|------|------|
| 登记对象 | 否——试验场页 | **是**——性能 85 的分母（rubric §5 评分对象） | 缺口本质：证据包测错了对象 |
| 入场路径 | 显式点击 `[data-ws-start]` → `data-state: ready`（150s 超时） | 自动挂载（load 后静置 1.8s）→ `ready`（210s）→ `data-world-state: robot_idle`（+120s） | 挂载等待翻倍；采样起点必须晚于 robot_idle |
| 变形仪式 | 无（直接驾驶） | CTA/Space → transforming → car_ready（+120s）——**变形段本身是 P1/P2 的被测负载**（human-gate §5.4 脚本含「变形+驾驶」） | 采样窗必须覆盖变形段或紧随其后（真机脚本同源） |
| 场景负载 | 试验场：drawCalls 263 / triangles 447k（最新 CI 读数） | 城市全量：楼群 + 霓虹 + 剪影层 + 航线 + 大气——**负载读数从未在 CI 留档** | 证据包首轮即建立城市档负载基线 |
| 动作脚本 | W 直行 30s | human-gate §5.4 行 1：变形 + 驾驶 20s（2 急转 + 1 锥桶 + 1 boost） | CITY-PERF-01 抄 §5.4 不抄 WS-PERF-01 的直行 |
| 后处理 | 同引擎但试验场无城市 bloom 负载面 | bloom 全档（Q0）+ 湿地面反射等 D3 件 | 城市档才测得到后处理的帧成本 |
| 取证钩子 | `__worldSpike.*` | `__worldSpike.*` **同源**（`src/lab/world/index.ts` 两页共用）+ `__worldSession.dump()`（OBS-C1）+ `funnel` 机读位 | **零 src/ 改动**可开工的依据 |
| 工件 | `world-spike-metrics.jsonl` | `city-perf-evidence.jsonl`（观测规格 §6.3 已冻结名字，未有生产者） | 工件契约已预留，只差 spec 落地 |
| project | `world-perf-chromium` 殿后独占 | 无 | §3.5 拓扑设计输入 |

**结论**：缺口是「有钩子无用例」型——OBS-C1/C2 与 CC-E7 已把取证面全部铺好，
CITY-PERF-01 是纯 e2e + config 交付（估 ~250 行 spec + 2 行 config），无任何引擎改动。

### 3.5 CITY-PERF-01 设计输入（采样协议 / 软门 / 证据工件，交 PERF-DES 定稿）

**Project 拓扑**（必须先裁，否则采样被污染）：全局 `fullyParallel: true` + `workers: 2` 下，
同 project 的两个 spec 文件会**并行**执行——WS-PERF-01 与 CITY-PERF-01 若同槽并跑，
两个 3D 上下文互相挤兑（batch 1 实测结论），双方读数全废。两案：

| 案 | 改法 | 评价 |
|----|------|------|
| A（推荐） | `world-perf-chromium` 的 testMatch 扩为 `/world-spike-perf\.spec\.ts\|city-perf\.spec\.ts/` + 该 project 加 `fullyParallel: false` | 两行 config；殿后独占语义不变（visual-chromium 依赖链零改动）；文件间按字母序串行（city 先 spike 后，顺序无耦合） |
| B | 新 `city-perf-chromium` project，`dependencies: ['world-perf-chromium']`，`visual-chromium` 改依赖它 | 语义最显式但改三处；全量墙钟不变（反正串行） |

**采样协议**（单用例七步；动作与 human-gate §5.4 行 1 同源）：

1. **入场**：生产 `/` 无参数、清存储；自动挂载 → `data-state: ready`（210s）→
   `data-world-state: robot_idle`（120s）——阈值抄 cyber-city.spec 既有标定；
   load→robot_idle 毫秒数进 annotation + 证据 JSON（**采集不判定**，CITY-E2E-03 先例）。
2. **环境指纹**：UA / hardwareConcurrency / DPR / `navigator.gpu` 有无 / viewport /
   `__worldSpike.backend`（**实际后端**，防 SwiftShader WebGPU 回退假象）/ quality 档 /
   `ci` 布尔。**CI 单腿不做 `?gl=1` 双后端**（§3.3 物理事实：WebGPU 腿不可靠且自动回退，
   双后端归真机）；后端差异靠指纹归因。
3. **变形 + 脚本化驾驶 ~20s 墙钟**：CTA 变形 → car_ready → W 直行 + 2 次急转（A/D 脉冲）+
   1 次撞锥桶 + 1 次 Shift boost——与真机动作脚本逐项同源（两轨读数互证的前提）。
4. **rAF 帧间隔采样**：标定全抄 WS-PERF-01（≥5s 且 ≥6 帧、封顶 45s、stall 阈 50ms），
   统计 p50/p95/max/stallCount/stallRatio/approxFps——两档读数同标定才可横比。
5. **互证读数**：`__worldSpike.fps()`（avg/low1）+ `info()`（drawCalls/triangles，
   城市档负载基线首轮建档）+ `state()`（速度/锥桶数证明驾驶真发生）+ HUD `[data-ws-fps]` 文本。
6. **硬断言（挡合并，全部存在性/顺序性）**：三态状态机走通（ready→robot_idle→car_ready→
   driving）、驾驶产生速度、`fps().avg > 0`、rAF 持续出帧（≥6 帧）、全程零 pageerror、
   `dump().funnel` 的 robotIdle/carReady/driveStart 非 null。
7. **证据落盘**：`test-results/city-perf-evidence.jsonl` 追加一行（schema 下表）+
   `test.info().attach('city-perf-evidence.json')` + `__worldSession.dump()` 附档
   （观测规格 §6.3 的 `session-dump-<case>` 命名族，case = `city-perf`）。

**软门**（全部不阻断，OBS annotation + console.warn，WS-PERF-01 同款姿势）：

| 软门 | 口径 | 备注 |
|------|------|------|
| p95 帧间隔 < 50ms | WS-PERF-01 原样沿用（SwiftShader 下预期不达标，`softGate.pass=false` 留档） | 唯一 v1 软门；带 GPU 环境预期转绿 |
| LoAF 长帧归因（v1.1 裁决点） | `PerformanceObserver`（`long-animation-frame`）采样窗内长帧的 script/render 耗时拆解进证据 JSON | 零依赖 ~20 行；Chromium 恒可用；给 stall 帧回答「谁吃的」 |
| 负载回归护栏（v1.1 裁决点） | drawCalls/triangles 相对上一轮 jsonl 漂移告警（环境无关，唯一可硬比项） | v1 只留档不设门——先积累两三轮基线再定阈值 |

**红线**（继承 WS-PERF-01 运行纪律 + rubric 禁止清单）：录像 `video: 'off'`；殿后独占；
不因环境慢 skip、不降级功能；**零 60/30 判定、零时长判定**；采样窗/动作脚本不许为凑读数
裁剪（脚本同源是铁律）；spec 超时建议 600s（挂载 210 + robot_idle 120 + car_ready 120 +
驾驶/采样 65 + 余量；WS-PERF-01 的 420s 对城市档不够）。

**`city-perf-evidence.jsonl` 行 schema 草案**（正本归 PERF-DES；与 WS-PERF-01 evidence 同构 + 城市档增量）：

```jsonc
{
  "spec": "CITY-PERF-01",
  "capturedAt": "ISO", "ci": true,
  "env": { "userAgent": "…", "hardwareConcurrency": 4, "devicePixelRatio": 1,
           "webgpuAvailable": true, "viewport": { "w": 1440, "h": 900 },
           "backend": "webgl2", "quality": 0 },          // backend = 实际值非探测值
  "timing": { "loadToRobotIdleMs": 0, "transformToCarReadyMs": 0 },  // 采集不判定
  "driveMs": 20000,
  "hud": { "fpsText": "1 / 0" },
  "meter": { "fps": { "avg": 0, "low1": 0 }, "info": { "drawCalls": 0, "triangles": 0 } },
  "sampling": { "frames": 0, "durationMs": 0, "p50Ms": 0, "p95Ms": 0, "maxMs": 0,
                "stallCount": 0, "stallRatio": 0, "approxFps": 0 },
  "softGate": { "rule": "p95 < 50ms", "thresholdMs": 50, "p95Ms": 0, "pass": false, "blocking": false },
  "gateReference": { "avgFps": 0, "desktop60Ref": false, "android30Ref": false,
                     "verdictAuthority": "docs/spec/human-gate-checklist.md §5.4" },
  "funnel": { "robotIdle": 0, "carReady": 0, "driveStart": 0 }   // dump 摘要（全量进附档）
}
```

**配套缺口（同批次或紧随）**：P5 的 **Q2 存在腿** e2e（`?quality=2` 完成变形→驾驶→进站，
当前 e2e 零覆盖）——形态可以是 CITY-PERF-01 同 spec 第二用例（负载轻，只断存在性不采样）
或并入 cyber-city.spec 家族，归 PERF-DES 裁决。

### 3.6 真机轨工具清单（human-gate §5.4 的执行配套，零采购）

| 工具 | 用途 | 口径 |
|------|------|------|
| HUD `[data-ws-fps]`（FpsMeter avg / 1% low） | P1/P2 主读数（§5.4 表列） | 已在手；截图三件套之一 |
| Chrome DevTools Performance | 桌面 20s 录制互证 + CPU 4x throttle 腿；GPU/CPU 归因分叉 | human-gate §2.1 已写 |
| `chrome://inspect` | 中端安卓远程调试（§2.2 已写） | 已写 |
| `#debug` 面板 | drawCalls/triangles/FPS 走查；（v1 裁决点）GPU ms 行 | 已合流（OBS-C2） |
| Spector.js（浏览器扩展） | draw call 异常时单帧显微镜 | 本地工具，不进仓库 |
| Perfetto | 安卓 <30fps 时系统级归因（GPU 频率/温控降频/掉帧） | 可选深挖层 |

## 4. 不推荐清单（一票否决理由存档）

| 对象 | 否决理由 |
|------|----------|
| stats.js / stats-gl 引入运行时 | FpsMeter 已有 avg + 1% low（真机门禁同口径，stats.js 反而没有 1% low）；双表冗余 + world 分包预算；GPU 计时 three 内建已覆盖 |
| detect-gpu | 默认拉 CDN 基准 JSON = 观测规格「零网络副作用」红线；自托管百 KB 级 JSON 触预算门；UA 初判 + `?quality=` 深链 + 自动降档三件套已覆盖其收益 |
| r3f-perf / drei 直引 | R3F（G5 红线）；`PerformanceMonitor` 只借「双阈值 + 抖动保险丝」模式 |
| Lighthouse timespan/user-flow 扩权进运行时轨 | 无帧率维度；同跑 SwiftShader 继承全部失真；LHCI 壳加载现职不动（双轨分立是顾问 §3.1 冻结结论） |
| CI 帧率/时长数值硬门（60/30、≤8s 判定） | WS-PERF-01 文件头结论 + three.js 官方 CI 先例（§3.2）：SwiftShader 下恒假阳性或恒假阴性；判定权威恒为真机 |
| 为凑 CI 读数改采样窗 / 降负载 / 换轻量动作脚本 | 脚本同源铁律（§3.3）：CI 与真机动作不同源则互证失效；rubric 禁止清单第 8 条同族 |
| Spector.js 进生产 bundle | 排查扩展本地用；预算红线 |
| three-mesh-bvh 本批次引入 | RayCursor 未证瓶颈（263 draw call / 447k 三角形量级）；「先证明瓶颈再引依赖」（中成本刻度纪律） |
| 自动降档在本批次顺手实现 | 属 PERF-BR/DES 立项面（涉 UX：toast、显式参数优先级、抖动保险丝阈值）；调研越权即扩批 |

## 5. 推荐方案摘要（交接 CC-PERF-BR / CC-PERF-DES）

**一句话**：优化面存量健康（folio 血统 + 三档降档 + poster-first），性能 85 卡在取证链路——
**CITY-PERF-01（`/` 证据包，零 src/ 改动）+ human-gate §5.4 真机四行回填**是仅有的两块拼图；
唯一值得立项的运行时优化 = FPS 自动降档接线（drei PerformanceMonitor 模式）。

| 项 | 推荐 | 依据 |
|----|------|------|
| CITY-PERF-01 形态 | 案 A：`world-perf-chromium` 扩 testMatch + project 级 `fullyParallel: false`；单用例七步协议 + 硬断言存在性 + p95<50ms 软门 + `city-perf-evidence.jsonl` | §3.5 |
| 采样标定 | 全抄 WS-PERF-01（≥5s/≥6 帧/封顶 45s/stall 50ms）；动作脚本抄 human-gate §5.4 行 1（非 WS-PERF-01 直行） | §3.3/§3.5 |
| CI 后端策略 | 单腿 + `__worldSpike.backend` 指纹归因；双后端归真机 | §3.3 物理事实表 |
| 负载基线 | 首轮即留档城市档 drawCalls/triangles（环境无关，唯一可跨轮硬比读数）；v1.1 再议回归护栏阈值 | §3.2/§3.5 |
| P5 配套 | Q2 存在腿 e2e（`?quality=2`，当前零覆盖）随 CITY-PERF-01 批次补 | §3.5 末段 |
| 自动降档（PERF-BR 立项） | FpsMeter 滑窗 → 双阈值 + flipflops 抖动保险丝 → `quality.changeLevel(2)` + toast；显式 `?quality=` 永不被覆盖；reduced-motion 路径不参与 | §3.1 末行 |
| `#debug` v1 增量（裁决点） | GPU ms 行（three 0.185 内建 `trackTimestamp`，仅 `#debug` 开）；LoAF 长帧归因通道 | §3.2/§2.1 |
| P3 资产杠杆（观察项） | glTF-Transform（meshopt/quantize）+ KTX2——仅当真机 Fast 4G 腿 >8s 再立项，CarConcept 3.4MB 是第一目标 | §2.2 |
| 真机轨 | 零采购：HUD + DevTools + chrome://inspect（已写进 human-gate）+ Perfetto 可选深挖；云端产不出真机读数——留空不伪造 | §3.6 |
| 登记纪律 | CI 证据包永不填 §5.4 表；`cyber-city-perf-rubric-score.json` 真机维缺读数置 null；禁止清单第 4/8 条 | rubric §5/§8 |

---

*CC-PERF-RS · 只调研零实现：本分支仅新增本文档；未触碰 `src/`、`e2e/`、
`playwright.config.ts`、workflow 与像素基线。17 仓库星数/许可/活跃度为 2026-08-27
`gh api` 快照；folio-2025/2019 结论以 vendor 一手快照核验到行号；three 0.185 GPU 计时
API 以 `node_modules` 构建产物行号为证；CI 环境事实以 `world-spike-metrics.jsonl`
最新行与 `world-spike-log.md` §3 实测记录为证。*
