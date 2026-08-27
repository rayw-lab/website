# 赛博科技城性能 85 优化特性脑暴（CC-PERF-BR）

| 项 | 内容 |
|----|------|
| Task | **CC-PERF-BR**（Loop 8 性能扩展四路之一，编排看板「Loop 8 性能扩展子 Task」行）——性能 85 达成路径的**特性清单**脑暴；采样/rubric 正本归 CC-PERF-DES，现状普查归 CC-PERF-RS（并行在途，本篇不重复其职责） |
| 分支 | `cursor/cc-perf-br-brainstorm-1d6f`（base：`main` @ `b2b8684`） |
| 日期 | 2026-08-27 |
| 输入 | 渲染架构审计 `cyber-city-rendering-architecture-audit.md`（§2 管线图 / §4 未迁欠账 / §6 反射 / §9 建议）· 缺口审计 `cyber-city-gameplay-gap-audit.md`（§3.2「帧率/性能采样于 `/` 零覆盖」行）· 功能 rubric `cyber-city-function-rubric.md` §5 性能五维（P1 帧率 30% / P2 1% low 20% / P3 加载可玩 20% / P4 预算 15% / P5 降档可感知 15%）· 顾问报告 §3.3 CITY-PERF-01 大纲 · 代码事实（`Quality.ts` / `Rendering.ts` / `FpsMeter.ts` / `Game.ts` init 时序 / `Viewport` DPR / 各系统粒子与实例 count） |
| 命名口径 | 本篇特性编号 **O1–O14**（Optimization），避免与游戏特性 G1–G16、镜头 F1–F11、功能维 F1–F7、性能维 P1–P5 撞号；正文「P1–P5」一律指 rubric §5 性能维 |
| 铁律 | **不牺牲功能/视觉硬门**（§1 红线清单逐条列出）；每项优化附可观测证据面——**无前后对照读数不得宣称收益**（Loop 8「可观测先行」在性能域的镜像） |

---

## 0. 结论先行

1. 脑暴 **14 项**优化特性（§3 总表 + §4 分项）：**P0 四件**（O1 自动降档接线、O2 初判档位校准、O3 CarConcept 延迟加载、O4 CITY-PERF-01 驾驶采样+预算哨兵）、P1 六件、P2 四件。P0 四件合起来直接覆盖性能五维里权重最大的三维：P1 帧率（30%）、P3 加载可玩（20%）、P5 降档可感知（15%）——**且全部是接线/时序/取证工作，零新渲染技术引入，视觉帧零变化**。
2. 三个立项裁量原则贯穿全篇：**① 证据先行**——O4 采样底座未落地前，一切「优化」都无法证明收益，P2 级条目一律「先剖析读数、后动工」；**② 能旋钮不重建**——优先动 uniform/count/时序/档位判定，材质节点图重建与管线重构放最后（审计 §9.4 切档纪律的优化域延伸）；**③ 视觉帧有变化的项必须过 AL 同机位对照**——bloom/反射/阴影/幕墙四件（O6/O11/O12/O14）全部标记视觉签收门。
3. 最被低估的单点：**自动降档至今未接线**（O1）。`Quality.ts` 头注 2026-08 之前就写明「连续 2s <30fps → 降 Quality 2 + toast，接线归 Phase 1 装配段」，grep 证实 `FpsMeter` 三个消费方（HUD / `__worldSpike.fps` / DebugPanel）里**零档位裁决**——三档梯退体系是全站性能架构的主干，却没有司机。接上它，P1 安卓腿与 P5「降档可感知」两维同时进账。
4. P3 维（加载→robot_idle ≤8s）的最大单杠杆是 **O3**：`Game.init` 阶段二 await CarConcept ~3.4MB（gltf+bin+ktx2），而 ritual 首幕到 car_ready 前只需要 HeroRobot 345KB + 程序化城市（零资产）——车资产完全可以搬进 robot_idle 静置窗（~10s）后台预取，Fast 4G 预计省 2–3s。
5. 边界申明：CITY-PERF-01 e2e 正本归 CC-PERF-DES（顾问 §3.3 已有大纲），本篇 O4 只登记**增量**（renderer.info 预算哨兵 + 「每优化 PR 附前后 evidence」流程约束）；tone mapping 属视觉批次且已裁决「等 Blender 后再开」，不入本清单；Sol 渲染裁决②（PreRenderer 仅 Q0+WebGPU，defer）由 O5 按新证据门重开——**先测出 Q1/WebGL 首用编译尖峰再动工**，不翻旧案。

## 1. 红线清单（全部条目的共同约束）

凡与下列硬门冲突的方案变体，一律在分项「风险」栏标记并给出规避路径；规避不了的不立项：

| # | 硬门 | 来源 | 受约束条目 |
|---|------|------|-----------|
| R1 | `robot_idle` poster 帧**逐字节恒等**（`?shot=` 零漂移同款合同） | CAM 硬门 / VIS-03 | O6 O11 O12 O14（凡改首幕帧渲染路径者） |
| R2 | bloom **threshold=1** emissive 台账不重排；strength 0.55/0.3 档值不动 | 审计 §5 | O6 O14 |
| R3 | CITY-03 循环动画配额 ≤3 席不新增 | eng-wave1 台账 | 全部（本清单零新增动画） |
| R4 | 变形 1.0–1.2s 墙钟、reduced-motion instant swap、e2e 52/52、LHCI 不降、audit-budget 零 ❌ | rubric / CI | O1 O3（时序敏感件） |
| R5 | 切档纪律「能 uniform 不重建」；逐帧热路径零材质操作 | 审计 §9.4 | O1 O2 O14 |
| R6 | CI SwiftShader 时长/帧率读数**永远只做下界哨兵**，禁止充当判定 | rubric 禁止清单 4 | O4 及所有证据栏 |
| R7 | 壳静态段零 world 字节 / world JS ≤900KB gzip / 资产池 ≤12MB | audit-budget G-A′/G-G(world) | O3 O7（动分包与资产者） |
| R8 | 「反馈闭环才算数」——降档等状态变化必须有可感知确认层，否则 P5 按半价 | 功能 rubric 铁律 2 | O1 O2 |

## 2. 现状基线（优化的起点事实，供对照）

| 面 | 现状（代码事实） | 出处 |
|----|------|------|
| Quality 三档 | 0/1/2 全链联动（bloom 0.55/0.3/旁路 · DPR ≤2/1.5/1 · 阴影仅 Q0 · 反射 真/假/无 · 剪影 84/42/21 · 光轨 800/裁/0 · 变形粒子 300/180/0）；**档位判定仅 UA**（移动 1/桌面 0）；**自动降档未接线** | `Quality.ts` `Rendering.ts` 各系统 |
| 帧率仪表 | FpsMeter（滑窗 avg + 1% low）挂 HUD/遥测/#debug，**零档位消费** | `index.ts` L250 `FpsMeter.ts` |
| 二次渲染源 | 仅 Q0 Grid reflector（0.35x 全场景镜像，Roads 共享零二次开销） | 审计 §6 |
| 后处理 | 单 bloom（默认 5 mips 全档共用；folio `_nMips` 5/2 按档调优**未迁**）；Q2 整段旁路 | 审计 §2/§4 |
| 阴影 | Q0 独占，directional 1024 map，全场景投射；切档全场景 needsUpdate 重编译 | `Rendering.applyQuality` |
| MSAA | 建器一次性 `antialias: pixelRatio<2`——**Q2（DPR1）反而开、Q0 高分屏关**，语义倒挂且运行时锁死 | `Rendering.setRenderer` |
| 预热 | PreRenderer 仅 Q0+WebGPU（Sol 裁决② defer）；Q1/Q2 与 `?gl=1` 首用材质编译落在驾驶/变形中 | 审计 §9.4 |
| 加载序 | init 阶段二 await CarConcept ~3.4MB + Rapier wasm ~1.5MB（并行）后才放行 ritual 装配；HDR 1.5MB 异步非阻塞；world 资产池 5.5/12MB | `Game.init` `public/` 实测 |
| 采样 | `/` 城市档**零帧率采样**（WS-PERF-01 只测灰盒）；drawCalls/triangles 无回归哨兵 | gap-audit §3.2 末行 |
| draw call 台账 | 挂城全量健康（剪影 1 + 光轨 1 + 灯杆 2 + 隔离墩 4 + 招牌 10 + 楼宇每栋 2–4 + 底面穹顶各 1） | 审计 §9.5 |

## 3. 特性总表

成本口径：低 = 单文件/接线/数据；中 = 跨 2–3 模块或需 A/B 取证；高 = 动管线/资产/多降级轨。「Quality 梯退关系」四类：**档间**（切档机制）/ **档判**（档位判定）/ **档内**（单档降本，梯退表不动）/ **档外**（加载、资产、取证，与梯退正交）。

| # | 特性 | 级 | 主收益维（rubric §5） | Quality 梯退关系 | 成本 | 视觉签收 |
|---|------|:--:|----------------------|------------------|------|:--:|
| O1 | FPS 自动降档接线（滞回 + 单向降 + toast） | **P0** | **P1** / **P5** / P2 | **档间**（给梯退装司机） | 低-中 | 免 |
| O2 | Quality 初判校准（起步实测 + 设备启发式） | **P0** | **P1** / P2 | **档判**（UA → UA+实测） | 中 | 免 |
| O3 | CarConcept 延迟加载（ritual 路径时序重排） | **P0** | **P3** | 档外（加载时序） | 中 | 免 |
| O4 | CITY-PERF-01 驾驶采样 + drawCalls/triangles 预算哨兵 | **P0** | **P4** + 全维证据底座 | 档外（取证；分档矩阵采样） | 中 | 免 |
| O5 | 管线预热扩档（Q1/Q2/WebGL 首用编译尖峰） | P1 | **P2** | 档内（各档首用体验） | 中 | 免 |
| O6 | bloom 按档降本（Q1 mips/输入分辨率裁剪） | P1 | P1（移动腿） | Q1 档内 | 中 | **须** |
| O7 | HDR 环境替换（1.5MB → 程序化/小图） | P1 | P3 / P4 | 档外（资产） | 低 | **须** |
| O8 | 建器 antialias 档位化（Q2 关 MSAA） | P1 | P1（弱机腿） | 档判→建器参数映射 | 低 | 须（Q2） |
| O9 | 像素总量封顶（DPR 语义升级） | P1 | P1（安卓高分屏腿） | 梯退 DPR 行口径升级 | 低-中 | 须（真机走查） |
| O10 | 分段帧时剖析（tick order 段计时 + longFrames 计数） | P1 | P2 归因 / P4 | 档外（观测） | 低 | 免 |
| O11 | Q0 reflector 预算旋钮（分辨率 A/B + 镜像剔除表） | P2 | P1（Q0 桌面腿） | Q0 档内 | 中 | **须** |
| O12 | 阴影投射面收敛（castShadow 白名单 + shadow camera 紧束） | P2 | P1（Q0） | Q0 档内 | 中 | **须** |
| O13 | 粒子/实例预算单源台账（perf-budgets 单源 + e2e 合同断言） | P2 | P4 / P5 | 梯退数值单一事实源化（行为零变化） | 低 | 免 |
| O14 | 幕墙远距 LOD 衰减（TSL 距离折叠窗格计算） | P2 | P1（片元 bound 时） | 档内（可全档或仅 Q1/Q2） | 中-高 | **须** |

## 4. 分项细述

### P0 —— 85 门主路径（四件）

#### O1 · FPS 自动降档接线（含降档 toast）

- **现状欠账**：`Quality.ts` 头注明文「自动降档（连续 2s <30fps → 降 Quality 2 + toast，§5.3 触发条件行）依赖 FpsMeter，接线归 Phase 1 装配段」——至今未接。三档梯退的全部执行体（bloom/DPR/阴影/反射/粒子 count）都已就位且事件级可切，缺的只是裁决者。
- **方案**：装配段（`src/lab/world/index.ts` 既有 0.25s HUD 节拍内，零新 tick）读 `fps.read()`：滞回窗建议「连续 3s avg<30 **或** low1<20 → 降一档」，20s 冷却期防抖，**只降不升**（升档归 O2 校准且只在非驾驶态执行）；降档瞬间经 `DriveFeedback` toast 呈现（「已切换省电画质」类文案，R8 反馈闭环）；`session.log('quality-auto-drop', { from, to, avg, low1 })` 入 SessionTimeline（事件名归 OBS spec 白名单修订，与实现同 PR 提请）。`?quality=` 显式深链**禁用**自动降档——取证与 e2e 的可复现性优先（rubric §3.2 复现协议）。
- **Quality 梯退关系**：档间机制本体。Q1→Q2 迁移成本最低（阴影本就关、bloom 旁路是布尔、Grid/Roads 重建 2 材质）；Q0→Q1 含全场景阴影重编译——低帧时刻叠加一次尖峰，缓解：降档动作缓期到最近的遮蔽窗（transform/respawn/toast 出现后首拍），或直接接受一次性尖峰换长期帧率（toast 同时呈现，用户可归因）。
- **预期收益**：P1（安卓/弱机腿 ≥30fps 的兜底保险，30% 权重维的地板）；P5（rubric 锚点「完成但反馈缺失=70 → 完成=100」，toast 即确认层）；P2 间接（持续低帧段被切走）。
- **风险**：滞回参数失当来回抖动（只降不升+冷却期对冲）；Q0→Q1 重编译尖峰（上述缓期）；e2e L6 降档腿口径需同步（`?quality=2` 深链路径不受影响）。
- **可观测证据**：dump `quality-auto-drop` 事件（seq/t/from/to/读数）；CITY-PERF-01 加 CPU throttle 腿验证触发链；#debug 面板手动 `changeLevel` 对照。

#### O2 · Quality 初判校准（起步实测 + 设备启发式）

- **现状欠账**：`Quality` 构造仅 UA 分档——弱核显桌面（Intel UHD 级）直接吃 Q0 全效（阴影+实时反射+DPR2+bloom 全档），P1 桌面腿 60fps 门在这类设备上注定失守；反之高端安卓被一刀切进 Q1。
- **方案**：两段组合。**A 实测校准**（主）：挂载段 shader 预热完成后、reveal 前，用 FpsMeter 采 ~1.5s；桌面档 avg<45 → 降 Q1 再开演（重编译落在 loading 遮蔽窗内，符合审计 §9.4「首帧编译落在挂载段而非驾驶中」护栏）。**B 零等待启发式**（辅）：`navigator.deviceMemory` / WebGL `RENDERER` 字符串 / WebGPU adapter 特征做粗筛，只影响采样起点档不做终判。校准结果 `session.log('quality-calibrated', { from, to, avg })`。升档方向（Q1→Q0）仅对实测充裕的移动设备开放且缓期到变形窗后，避免首幕重编译。
- **Quality 梯退关系**：档判源升级（UA → UA+实测），三档语义与梯退表零改动。
- **预期收益**：P1（弱桌面腿从「注定失守」变「开局即正确档位」）；P2（避免全程挣扎+自动降档反复触发）。
- **风险**：采样窗与编译尖峰重叠误判——采样起点严格放 PreRenderer/O5 预热完成后；reveal 前降档的用户可感面为零（尚未见到 Q0 画面，无「变糊了」的失落感——这正是初判优于事后降档的原因）。
- **可观测证据**：dump `quality-calibrated`；human-gate §5.4 增弱桌面行；CITY-PERF-01 分档矩阵读数。

#### O3 · CarConcept 延迟加载（P3 主杠杆）

- **现状欠账**：`Game.init` 阶段二 `await` CarConcept（gltf 216KB + bin 1.9MB + KTX2 ~1.4MB）后才继续 ritual 装配（city/robot/Reveal 的动态 import 与 robot GLB 都排在其后），而首幕到 car_ready（~20s）前唯一需要的资产是 HeroRobot 345KB。Fast 4G（~1.5MB/s）下车资产占「加载→robot_idle」计时 2–3s——P3 门 ≤8s 的最大单项。
- **方案**：ritual 路径下 CarConcept 移出 init 关键路径，改为 robot_idle 静置窗后台预取（10s 窗对 3.4MB 绰绰有余）；`TransformSystem` car_ready 前校验资源就位，未就位时沿用既有「CTA disabled + 进度」语义等待（R4：变形墙钟从资源就位后起算，不拉长四拍本身）。灰盒 `/world-spike/` 路径保持现状（车即主角，时序不动）。KTX2/Draco worker 初始化随首个 GLB（robot）提前完成，车资产解码零冷启动。
- **Quality 梯退关系**：档外（加载时序），与梯退正交。
- **预期收益**：P3（预计 -2~3s @Fast 4G，8s 门从贴线变余量；锚点 8–10s=70 → ≤8s=100 的直接跨段候选）；P2 间接（挂载期下载/解码错峰）。
- **风险**：极慢网被试 20s 内按 CTA 而车未到——反馈闭环须成立（disabled+进度既有语义覆盖，F2 功能硬门不破）；e2e CITY-E2E-03 状态序不得变（transforming 前多一个资源门，断言面需确认兼容）；分包边界动静（R7：world chunk 直测口径复核）。
- **可观测证据**：dump `funnel.robotIdle` 前后对照（机读位现成）；CITY-E2E-06 计时采集趋势；真机 Fast 4G throttle 秒表（human-gate §5.1 项 5 复测轮）。

#### O4 · CITY-PERF-01 驾驶采样 + 预算哨兵（证据底座）

- **现状欠账**：`/` 城市档零帧率采样（gap-audit §3.2 明列）；WS-PERF-01 只测灰盒 `/world-spike/`；drawCalls/triangles 无回归哨兵——后续任何优化 PR 都无法出示「前后对照」。
- **方案**：正本归 CC-PERF-DES（顾问 §3.3 大纲：挂载 → CTA 变形 → 脚本化驾驶 20s → rAF 帧间隔采样 + `__worldSpike.fps()` 互证 + `__worldSession.dump()` 附档 → `test-results/city-perf-evidence.jsonl`，p95<50ms 软门沿用）。本篇登记两项**增量**：① `renderer.info` drawCalls/triangles 入证据包并设**回归哨兵软门**（阈值以首采读数 +20% 定标，防「优化批次反而涨 draw call」的倒退无人察觉）；② 流程约束——本清单每个动渲染面的条目（O5 起）合流 PR 必须附同 commit 的 evidence 前后对照，无对照不宣称收益（§0 原则①）。分档矩阵：`?quality=0|1|2` × 双后端各采一遍。
- **Quality 梯退关系**：档外（取证）；分档采样反向验证梯退表各档读数差。
- **预期收益**：P4 直接（rubric §5 P4 维=CI 硬门证据包；`ciEvidence` 登记字段的数据源）；其余四维的证据底座。
- **风险**：CI SwiftShader 读数恒不可判定（R6 纪律恒挂标注）；e2e 时长 +2–3min（照 WS-PERF-01 独占殿后串行 project，不阻塞其他）。
- **可观测证据**：`city-perf-evidence.jsonl` 本身 + CI 工件出现（rubric F7/P4 双登记面）。

### P1 —— 高性价比降本（六件）

#### O5 · 管线预热扩档

- **现状**：PreRenderer（CubeCamera 32px 离屏全场景含隐藏件）仅 Q0+WebGPU；Q1/Q2 与 `?gl=1` 后端首次入画的材质（变形粒子/光幕/POI 标点/holo 板）编译落在变形或驾驶中——1% low 尖峰源。Sol 裁决②曾 defer（「AL5 观测无硬门击穿」），当时无 P2 维考核；性能 85 语境下 1% low 占 20% 权重，**重开条件 = O4 先测出 Q1/WebGL 首用尖峰 >50ms 的实证**，测不出则维持 defer 留档。
- **方案**：优先评估 `renderer.compileAsync(scene, camera)`（three 0.185 WebGPURenderer 具备，双后端同 API）替代/补充 CubeCamera 技法，扩至全档全后端；预热窗放 loading 段 progress 完成前，预算 ≤500ms，失败静默（预热是优化不是功能）；隐藏件（visible=false 的粒子/光幕）需临时置 visible 入编译遍历（PreRenderer 现有技法保留）。
- **梯退关系**：档内（各档首用体验），梯退表不动。
- **收益**：P2 主（变形窗/首驶的 stall 帧清除）；P3 微损（预热耗时入 funnel 对照，超预算即回退）。
- **风险**：compileAsync 双后端行为差异（WebGL 后端编译同步性）；预热清单漏件（以 O4 的 stallCount 回归验证）。
- **证据**：CITY-PERF-01 p95/max/stallCount 分档前后对照；dump 增 `precompile-done {ms}`（OBS 白名单同步）。

#### O6 · bloom 按档降本

- **现状**：bloom 默认 5 mips 全档共用；folio 私有 `_nMips` 按档 5/2 调优未迁（审计 §4 明列欠账）。Q1 移动端 strength 已减半但 mip 链全价跑——bloom 是 Q1 后处理的全部成本。
- **方案**：验证 three 0.185 BloomNode 可配置面，三选一：① `_nMips` 私有则子类覆写（锁 three 版本 + 头注留档升级脆弱性）；② bloom 输入节点前置 0.5x 降采样；③ 均不可行则记录结论留档不硬做。仅 Q1 生效，Q0 不动。
- **梯退关系**：Q1 档内降本；threshold=1 台账与 strength 档值全不动（R2）。
- **收益**：P1 移动腿（mips pass 减 3 层 ≈ 后处理带宽减半量级，具体以真机读数为准）。
- **风险**：辉光扩散半径/柔度微变（**视觉签收门**：Q1 同机位对照帧过 AL）；私有字段 hack 的 three 升级脆弱性。
- **证据**：Q1 真机帧时对照（human-gate §5.4 安卓行）；对照帧归档 `docs/spec/assets/`。

#### O7 · HDR 环境替换

- **现状**：`studio_small_08_1k.hdr` 1.5MB 仅供车漆 IBL（`scene.environment`，intensity 0.55，异步非阻塞可失败）——非阻塞但抢挂载期 Fast 4G 带宽，且占 world 资产池 12MB 配额的 12.5%。
- **方案**：三选一按序尝试：① three 内建 `RoomEnvironment` 程序化生成（零资产零网络）；② 同图 512px 重压（~200–300KB）；③ PMREM 预烘焙 KTX2。推荐 ①，车漆观感过 AL 特写对照即收；色温偏移可用 intensity/自定义灯位补偿。
- **梯退关系**：档外（资产），正交。
- **收益**：P3（挂载期总下载 -1.5MB，与 O3 叠加）；P4（资产池余量还给 Blender 路径）。
- **风险**：车漆反射观感变化（**视觉签收门**：VisualVehicle 特写对照帧）；RoomEnvironment 高光形状与摄影棚 HDR 不同（车漆是全站唯一 IBL 消费方，影响面单一可控）。
- **证据**：audit-budget world 资产池行前后；网络瀑布对照；VIS 对照帧。

#### O8 · 建器 antialias 档位化

- **现状**：建器一次性 `antialias: pixelRatio<2`——语义倒挂：Q2 止损档（DPR1）反而开 MSAA 吃填充率，Q0 高分屏（DPR2）关。且 WebGPURenderer 建器参数运行时锁死。
- **方案**：建器参数改按**初始 Quality 档**映射：Q0/Q1 维持现规则，Q2 显式 `antialias:false`。已知边界留档：运行时降档到 Q2（O1 路径）无法关 MSAA（重建 renderer 不可接受）——仅深链 `?quality=2` 与 O2 初判 Q2 时全额生效，自动降档路径吃不到本项收益（诚实登记，不夸大）。
- **梯退关系**：档判→建器参数的一次性映射；梯退表新增「MSAA」行。
- **收益**：P1 弱机腿（Q2 主场设备的填充率/带宽）；P5（Q2 档语义更自洽）。
- **风险**：Q2 边缘锯齿——网格线有 `fwidth` shader 内自理（审计 §4），霓虹 emissive 大色块不敏感；对照帧确认。
- **证据**：Q2 真机帧时；`session.env` 增 antialias 字段供 dump 归因。

#### O9 · 像素总量封顶（DPR 语义升级）

- **现状**：DPR 封顶 2/1.5/1 是**比例**口径——3x 高分安卓（1170×2532 物理级）Q1 下 1.5 DPR 仍是 ~2.9MP 片元负载，与中端 GPU 不匹配；同为 Q1 的 720p 老机型却只有 0.9MP。同档设备间负载差 3 倍，P1 安卓腿的离散度主因。
- **方案**：`Viewport.pixelRatioMax` 语义升级为「与像素总量封顶取 min」：建议 Q0 ≤4.6MP（2560×1440 级）/ Q1 ≤2.2MP（1080p 级）/ Q2 ≤1.2MP；桌面 1080p@DPR2 读数不变（零回归面），仅高分小屏与 4K 桌面受益。
- **梯退关系**：梯退表 DPR 行口径升级，三档语义保持。
- **收益**：P1 安卓高分屏腿（片元负载 -20~40%）。
- **风险**：高分屏画面软化——HUD 是 DOM 不受影响；3D 内 TextCanvas 文字轻微软化（真机走查签收，human-gate §5.4 增记录列）。
- **证据**：真机 §5.4 安卓行前后；`session.env` 记录实际渲染分辨率。

#### O10 · 分段帧时剖析（归因工具）

- **现状**：FpsMeter 只有全帧 avg/low1，卡顿无法归因到 physics（order 3）/render（998）/reflector 镜像/POI 检测各段；#debug 性能行只有 renderer.info 汇总。
- **方案**：两层。① **#debug 门控**：Ticker tick 总线按 order 段打 `performance.mark/measure`，DebugPanel 增分段耗时行（生产路径零字节零成本，沿 #debug 动态分包既有纪律）；② **常驻轻量**：dump `counters` 增 `longFrames`（>50ms 帧计数，一次比较零分配）。
- **梯退关系**：档外（观测）。
- **收益**：P2 归因底座（O5/O11/O12/O14 的立项前提读数都靠它）；P4（证据完备度）。
- **风险**：几乎无；唯一纪律是 mark 不得泄进无 #debug 的生产热路径（构造期一次判定）。
- **证据**：#debug 面板分段行截图；dump `counters.longFrames`；OBS spec counters 白名单修订。

### P2 —— 先证据后动工（四件）

#### O11 · Q0 reflector 预算旋钮

- **现状**：Q0 每帧一次 0.35x 全场景镜像渲染（全站唯一二次渲染源；Grid+Roads 共享）。
- **方案**：① `resolutionScale` 0.35→0.25 A/B（低清模糊感本就是设计语言，降清可能不可感）；② 镜像 pass 图层剔除表（layers 剔除 FlightTrails/剪影填充楼等远景件）——**注意** AL2-a-plus 裁决把「灯杆/灯箱/楼窗/机器人 rim 自动入水」列为视觉卖点，剔除表须逐件过 AL；先 ① 后 ②。
- **梯退关系**：Q0 档内旋钮；反射三档语义（真/假/无）不动。
- **收益**：P1 桌面腿余量（Q0 是 60fps 门的主战场；镜像 pass 是 Q0 相对 Q1 的最大增量成本之一）。
- **风险**：倒影内容缺件/更糊被 AL 认定回归（**视觉签收门**：倒影特写对照帧）。
- **证据**：O10 分段读数（镜像 pass 段耗时前后）；CITY-PERF-01 Q0 腿对照；对照帧。

#### O12 · 阴影投射面收敛

- **现状**：Q0 directional 1024 map 全场景投射，静态楼群逐帧全价重画阴影；夜景 emissive 主导画面里楼影视觉贡献低（审计 §4 SSAO 缺席同一判断逻辑）。
- **方案**：① castShadow 白名单（车/机器人/近景道具；楼群改 receive-only）；② shadow camera 紧束跟随玩家（frustum 减半 → 同 map 有效分辨率翻倍，或 map 降 512 等值换帧时）。
- **梯退关系**：Q0 档内；Q1/Q2 本就无阴影，零涉及。
- **收益**：P1 小-中（Q0 阴影 pass 绘制物级减半；量级待 O10 实测定级）。
- **风险**：楼影消失可感度（**视觉签收门**）；shadow camera 跟随的边缘 popping（缓动跟随对冲）。
- **证据**：renderer.info 阴影 pass 前后；同机位对照帧。

#### O13 · 粒子/实例预算单源台账

- **现状**：性能预算散在 6+ 文件（FlightTrails 800/裁/0、TransformParticles 300/180/0、剪影填充 84/42/21、reflector 0.35、DPR 表、bloom 档值…）——调参跨文件、审计靠 grep、rubric P5「降档合同」无机器断言。
- **方案**：`src/lab/world/core/perf-budgets.ts` 单源常量表（档 × 系统），各消费方改读表；e2e 增合同断言（Q2 粒子 count=0 / 剪影 count 对表 / DPR 封顶对表）；**不改任何现值**——纯治理重构，行为零变化以 CITY-PERF-01 同读数验证。
- **梯退关系**：梯退数值的单一事实源化（neon-tokens 色相单源的性能域镜像）。
- **收益**：P4/P5（预算可审计、Q2 降档合同从注释升为断言）；为 O6/O9/O11 后续调参把回归面收敛到一个文件。
- **风险**：纯重构笔误（e2e 断言 + evidence 同读数双对冲）。
- **证据**：新 e2e 断言绿灯；CITY-PERF-01 读数前后一致（证明零行为变化）。

#### O14 · 幕墙远距 LOD 衰减

- **现状**：幕墙片元 shader（米制 cell hash 亮灭/三族窗色/相位闪烁）不分距离全价计算；200m+ 远楼窗格已 <1px 仍全跑。是否值得做取决于片元 bound 画像——**立项前提 = O10 剖析证实 Q1 片元受限**。
- **方案**：TSL 内按 `positionWorld` 到相机距离 smoothstep 折叠：远段窗格计算混合为低频渐变常量（同色相均值、**亮度守恒**防远景变暗触碰 R2 bloom 台账）；零材质切换零重建（R5），纯节点图静态分支；可仅 Q1/Q2 生效（Q0 桌面不差这点 ALU）。
- **梯退关系**：档内（建议仅 Q1/Q2）；与剪影层 count 裁剪互补（那是实例数，这是每像素成本）。
- **收益**：P1 小（移动端片元 ALU；远景像素占屏比高的构图下更明显）。
- **风险**：远景窗格闪烁密度观感变化（**视觉签收门**：VIS-03 首幕帧远景对照——首幕帧有远楼入画，R1 逐字节恒等约束下本项若影响 poster 帧须仅 Q1/Q2 生效或重新签 poster）；shader 分支复杂度上升。
- **证据**：同机位对照帧 + Q1 真机帧时 + O10 片元段读数。

## 5. 预期收益汇总（维 × 条目矩阵）

| 维（权重） | 门 | 主攻条目 | 辅助条目 | 现状→预期路径 |
|-----------|-----|---------|---------|--------------|
| P1 帧率体感（30%） | 桌面≥60 / 安卓≥30 | **O1 O2** O6 O8 O9 | O11 O12 O14 | 弱机自动兜底（O1）+ 开局正确档位（O2）保 30 地板；桌面 60 靠 Q0 档内降本（O11/O12）攒余量 |
| P2 1% low（20%） | 桌面≥45 | **O5** O10 | O1 O3 | 首用编译尖峰清除（O5）是最大已知 stall 源；O10 负责找出剩余尖峰 |
| P3 加载可玩（20%） | ≤8s @Fast 4G | **O3** O7 | O5（预算约束项） | -1.5~3s 下载 + 错峰；`funnel.robotIdle` 机读位直接对账 |
| P4 预算（15%） | audit-budget 零❌ + 证据包 | **O4** O13 | O7 O10 | drawCalls/triangles 哨兵补位 + `city-perf-evidence.jsonl` 落地 |
| P5 降档可感知（15%） | Q2 核心路径完整 | **O1**（toast 确认层） O13（合同断言） | O8 | 「完成但反馈缺失=70」→「完成=100」的确认层就是 O1 的 toast |

**85 门合成检验**（rubric §5「允许一处真实缺口，不允许两处」）：P0 四件 + O5 落地后，预期缺口集中在「真机安卓腿读数」单点（云端产不出，留空不伪造，欠账列登记前置）——满足「一处缺口」语义；若安卓真机读数也达标则五维齐。

## 6. PR 切分建议（单 PR 单主题）

依赖拓扑与冲突面先行声明：`src/lab/world/index.ts` 装配段被 O1/O4 触碰、`Rendering.ts` 被 O5/O6/O8 触碰、`Viewport.ts` 被 O9 触碰、`Game.ts` init 被 O2/O3 触碰——同文件条目**严格串行合流**，不并行开工。

| 序 | PR（建议分支名） | 内容 | 前置 | 硬门自查 |
|----|-----------------|------|------|---------|
| ① | `cursor/cc-perf-c0-city-perf-e2e-*` | O4（CITY-PERF-01 落地随 PERF-DES 定稿 + drawCalls/triangles 哨兵）+ O10（#debug 分段剖析 + longFrames） | PERF-DES 冻结 | e2e 殿后串行不阻塞；OBS spec counters/事件白名单同步修订 |
| ② | `cursor/cc-perf-c1-auto-quality-*` | O1（自动降档 + toast + `quality-auto-drop` 事件） | ① 的证据底座 | e2e 52/52；`?quality=` 深链行为不变；OBS 白名单修订同 PR |
| ③ | `cursor/cc-perf-c2-quality-calibration-*` | O2（初判校准） | ②（共享滞回/读数工具，避免双实现） | reveal 前完成，poster 恒等零涉及 |
| ④ | `cursor/cc-perf-c3-defer-car-*` | O3（CarConcept 时序重排） | 独立可先行 | CITY-E2E-03 状态序回归；audit-budget world 直测复核；funnel 前后对照入 PR 描述 |
| ⑤ | `cursor/cc-perf-c4-precompile-*` | O5（预热扩档；含重开裁决②的实证段） | ① 测出尖峰实证 | 预热 ≤500ms 预算入 funnel 对照 |
| ⑥ | `cursor/cc-perf-c5-pixel-budget-*` | O9 + O8（同为「分辨率/建器档位」主题，Viewport+建器一次收口） | ② | Q2 对照帧；真机走查行 |
| ⑦ | `cursor/cc-perf-c6-asset-env-*` | O7（HDR 替换） | 独立可先行 | VisualVehicle 特写对照帧过 AL |
| ⑧ | `cursor/cc-perf-c7-bloom-tiers-*` | O6（bloom 按档） | ①；与 ⑤ 串行（同触 Rendering.ts） | Q1 对照帧过 AL；three 版本锁注释 |
| ⑨ | `cursor/cc-perf-c8-budget-ledger-*` | O13（预算单源） | ②⑥⑧ 合流后（收编其数值） | evidence 同读数证明零行为变化 |
| ⑩ | 视条件 | O11 / O12 / O14（全部「先证据后动工」：O10 读数立项，逐项单 PR） | ①⑤ 后按剖析读数排序 | 每项视觉签收门对照帧 |

流程纪律（全序适用）：每 PR 描述必附 ① 同 commit `city-perf-evidence.jsonl` 前后对照（① 合流前用 WS-PERF-01 + 手采代偿）；② 触及视觉帧者附同机位对照帧；③ 新事件/counters 同步 OBS spec 白名单；④ CI SwiftShader 读数恒标「下界哨兵非判定」（R6）。

## 7. 与在途件/既有裁决的边界

| 件 | 关系 |
|----|------|
| CC-PERF-RS（普查，在途） | 本篇 §2 基线表为脑暴自用最小集；RS 普查如与本篇读数冲突，以 RS 为准并回改本表 |
| CC-PERF-DES（rubric/采样正本，在途） | O4 只登记增量（哨兵+流程约束）；CITY-PERF-01 脚本/阈值正本归 DES，落地 PR 等 DES 冻结 |
| CC-FXN-C1（功能首批，在途） | O1 toast 复用其 DriveFeedback 面（已合 main 的 FXN-C2 件）；无代码依赖冲突 |
| Sol 渲染裁决①（tone mapping 未开） | 非性能项且属视觉批（审计 §9.1「一改全改」批次级），本清单不涉 |
| Sol 渲染裁决②（PreRenderer defer） | O5 以 P2 维实证重开：先测 Q1/WebGL 首用尖峰，测不出维持 defer |
| human-gate §5.4 真机表 | P1/P2 维判定权威恒为真机；本清单全部 CI 证据是下界哨兵；安卓行欠账列登记前置（豁免留痕先例） |
| BL2/Blender 路径（PR #43 待机） | O7 资产池余量为其让路；若 Blender GLB 合流，O4 哨兵阈值须重定标（drawCalls/triangles 基线变化） |

---

*CC-PERF-BR · 2026-08-27 — 性能 85 路径脑暴：14 项优化特性（P0×4 / P1×6 / P2×4），零实现改动。核心判断：自动降档接线（O1）+ 初判校准（O2）+ 车资产延迟（O3）+ 驾驶采样底座（O4）四件 P0 覆盖 P1/P3/P4/P5 四维主权重，全部零新渲染技术、视觉帧零变化；档内降本类（bloom/反射/阴影/幕墙）一律「先证据后动工 + AL 同机位对照签收」。正本分工：采样/阈值归 CC-PERF-DES，普查归 CC-PERF-RS，登记恒归独立审计。*
