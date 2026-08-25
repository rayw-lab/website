# Phase A Spike 决策记录：CarConcept 上车 + WASD 驾驶

> **文档性质**：roadmap §7.2 Step 5-6 / §7.3 Step 10 的 Spike 决策记录——**SRD 第 6 章「物理/车辆控制」行的淘汰条件裁决材料**。五项必填齐备：① 物理选型 + 参数表快照；② 双后端帧率读数；③ JS/资产实测体积 vs 门禁；④ 移动端摇杆可用性评语；⑤ 通过/止损结论。
> **代码落点**：`src/lab/modules/world/`（engine/vehicle/carRig/scene/inputs/camera/params 七件）+ 隐藏壳页 `/world-spike/`（noindex、不进 sitemap）+ 共享加载器 `src/lab/shared/gltf-loaders.ts`（configurator 与 world 公用）。
> **验证态**：环形道整圈驾驶 / 锥桶击飞 / R 复位 / boost+刹车 / 触摸摇杆，WebGPU 与 WebGL2（`?gl=1`）双后端自动化全绿；测试方法见 §6。

---

## 1. 物理选型结论（Step 5 决策点）

**裁决：路线 1「手写运动学控制器」通过，Spike 期内不切 Rapier。**

- 实现规模 ≈270 行（`vehicle.ts`）：自行车模型转向几何 + 纵/侧速度分解 + 四轮 raycast 贴地拟合（y/pitch/roll 阻尼跟随）+ 悬空抛体 + 软限速；零物理引擎依赖、零 wasm 字节。
- 半日手感评估（roadmap 判据）逐项：
  - **加速跟手度**：油门即走，0→50km/h ≈ 2s；松油门怠速指数滑行（folio `idleBrake` 连续化）✅
  - **转向阻尼**：输入→前轮角 11 s⁻¹ 阻尼插值 + 高速转角收紧（`1/(1+|v|·0.055)`），78km/h 巡航环形道不甩尾 ✅
  - **过锥桶反馈**：击飞初速与车速线性挂钩 + 车速按 0.965^hits 扣减——有代价不打断 ✅
  - **boost 漂移感**：Shift 下侧向抓地 ×0.55，高速过弯带可控滑移 ✅
  - **坡道**：raycast 丢地即进抛体（9.81 m/s²），冲坡有真实腾空 ✅
- **不切 Rapier 的理由**：上述判据全过，且运动学模型给了逐参数的手感控制权（Spike 的调参速度 > 刚体仿真的真实度收益）。Rapier `DynamicRayCastVehicleController` + folio 参数表（source-teardown §5.2）保留为 Phase B 的升级路径：翻车/碰撞体互推/悬挂三档 restLength 这三样运动学模型给不了，届时按 §5.2 参数表原封不动起步，并连带恢复 `Ticker.scale=2`（两套参数不可混搭，见 `params.ts` 头注）。

### 运动学模型必须显式补的两课（folio 靠引擎白拿的）

1. **超速回落**：folio 的软限速靠 Rapier 轮胎摩擦天然耗散超出部分；纯运动学积分下持续踩油门速度无界攀升（实测 126km/h 才发现）。补 `overspeedDecay=0.9 s⁻¹`：超过当前档软限速后按指数向限速回落。
2. **扫掠碰撞**：20fps × 35m/s 单步位移 1.75m，点对点距离检测会隧穿锥桶。碰撞参考点改「本帧运动线段上离锥桶最近的点」（胶囊扫掠的平面简化）。

## 2. 参数表快照（`params.ts` 单一事实源）

单位 SI（米/秒），不引入 folio 全局 2 倍速；标注 folio 对应物便于日后切换对照。

| 组 | 参数 | 值 | folio 对应/备注 |
|----|------|-----|----------------|
| 驱动 | `engineAccel` | 24 m/s² | `accel×300/(1+overflow)` 同型 |
| | `boostAccelFactor` | 1.7 | folio `1+boost×2` 收敛版 |
| | `topSpeed / topSpeedBoost / topSpeedReverse` | 18 / 28 / 7 m/s | ≈65 / 101 / 25 km/h |
| | `overflowSlope` | 1.6 | 软限速衰减斜率，无硬限速 |
| | `overspeedDecay` | 0.9 s⁻¹ | 运动学专属（见上第 1 课） |
| 制动 | `brakeDecel / reverseBrakeDecel` | 30 / 22 m/s² | folio brake=1 / 换向 0.4（×35 尺度） |
| | `reverseBrakeMinSpeed` | 0.6 m/s | folio 0.5 |
| | `idleDrag / rollingDecel` | 0.55 s⁻¹ / 1.1 m/s² | folio idleBrake 0.06 连续化 |
| 转向 | `maxSteer` | 0.6 rad | folio steering×0.5 直写；本站加阻尼 |
| | `steerSpeedDrop` | 0.055 | 高速收紧斜率 |
| | `steerLerpRate` | 11 s⁻¹ | 跟手度核心旋钮 |
| 抓地 | `gripRate` | 7.0 s⁻¹ | `sideFrictionStiffness=3` 运动学等价 |
| | `boostGripFactor` | 0.55 | boost 漂移感 |
| 贴地 | `rayLift / rayLength` | 1.6 / 4.0 m | 四轮 raycast |
| | `poseLerpRate` | 9 s⁻¹ | 悬挂柔度观感 |
| | `gravity` | 9.81 m/s² | 悬空抛体 |
| 视觉 | `visualRollK / visualPitchK / visualTiltMax` | 0.011 / 0.009 / 0.09 | 纯视觉戏剧化，不进物理积分 |
| 锥桶 | `kickSpeedFactor/Base` | 0.95 / 1.6 | 击飞初速挂车速 |
| | `kickUpFactor/Base · tumbleFactor · groundDrag · bounce` | 0.28/0.8 · 1.4 · 2.6 · 0.28 | 抛体+翻滚+落地摩擦 |
| | `carSpeedKeep` | 0.965/hit | 撞锥代价 |
| 场地 | `ringRadius / ringWidth / boundaryRadius` | 55 / 13 / 92 m | 环形道 + 轮胎墙软夹持 |

dt 纪律照抄 folio §5.3：车辆积分用 **30 帧滑动平均 dt**（与渲染瞬时 dt 分离），物理 dt clamp 1/20（低于 20fps 世界进慢动作而非隧穿）；帧率仪表读未 clamp 的墙钟真值。

## 3. 帧率读数（Step 9 门禁）

**测试环境没有 GPU**（云 VM、headless Chromium、SwiftShader 软件渲染），下列读数是**软件光栅化的硬下界**，不是真机读数；真机人工录测（§7.3 Step 9 口径：桌面 DevTools Performance 4x throttle 录 20s 连续驾驶；移动 chrome://inspect 连中端安卓 60s）列为 **Phase B 合并前动作**。

| 后端 × 视口 | avg fps | 1% low | 状态 |
|------------|---------|--------|------|
| WebGPU 1280×800 | 23.0 | 4.0 | 游戏循环/物理/遥测全程正常；画面白屏（见下） |
| WebGL2 1280×800 | 1.2 | 0.6 | 渲染正确，整圈/锥桶/复位全绿 |
| WebGL2 640×400 | 1.0 | 0.3 | 同上（小视口腿） |
| WebGL2 390×700（移动仿真） | ≈1 | — | 触摸摇杆全程可玩 |

- 仪表方法：rAF 墙钟 dt 环形窗 360 样本，avg + 1% low；HUD 常显 + `__worldSpike.fps()` 遥测。
- **硬件无关的帧率论证**（真机读数缺位期的依据）：场景复杂度实测 **121 draw calls / 225,236 triangles**、无实时阴影（车底接触阴影贴片）、锥桶/轮胎墙全 InstancedMesh、DPR 封顶移动 1.5 / 桌面 2。该复杂度低于同站 car-configurator（同一车模 + 影棚光）一个量级的场景开销预算，对 2019+ 中端安卓（Adreno 61x 级）30fps 是宽余量负载；不达标时 RR-04 三板斧（DPR→1、关装饰实例减半）仍备用。
- **SwiftShader WebGPU 环境缺陷记录**：`createBuffer(size=288, mappedAtCreation=true)` 反复 RangeError 导致白屏；隔离探针里同参数创建成功 → 判定为 SwiftShader Vulkan 资源上限问题而非应用 bug（真机 WebGPU 无此路径）。功能层（物理/输入/遥测/HUD）在 WebGPU 腿全绿。

### 3.1 自动化帧率采样（WS-PERF-01，CI 常驻证据）

上表是 Spike 验证期的一次性人工读数；此后追加**常驻自动化采样**（`e2e/world-spike-perf.spec.ts`，测试计划 §5.8），每次 `pnpm test:e2e` 全量跑都重新产出可审计证据包，60fps/30fps 真机门禁执行前后均有 CI 侧下界读数可对照。

- **采样流程**：显式进入试验场 → W 持续驾驶 30s（硬断言链路活着：速度爬升 >2km/h、HUD `data-ws-fps` 出「均值 / 1% low」读数、`__worldSpike.fps().avg > 0`、全程零未捕获异常）→ 驾驶不间断的前提下 `page.evaluate` 内 rAF 采样帧间隔 ≥5s（软渲染下帧数不足 6 自动延长，封顶 45s）→ 统计 p50 / p95 / max / stall（>50ms）帧计数。
- **软门禁（不阻断 CI）**：采样期 95% 帧间隔 < 50ms（p95 < 50ms，≈95% 帧保持 ≥20fps 节奏、无长时间 stall）。SwiftShader ~1fps 下该项**预期不达标**——失败不 fail 用例，登记 `OBS` annotation + 证据 JSON 标记 `softGate.pass=false`；带 GPU 的真机/集显环境预期转绿。**60/30 门禁判定不在自动化范围**（CI 读数只是软件光栅化硬下界），判定权归 `docs/spec/human-gate-checklist.md` §2 真机人工录测。
- **证据落点（三件套）**：① `test-results/world-spike-metrics.jsonl` 的 `WS-PERF-01 evidence` 行（环境指纹 UA/核数/DPR/`navigator.gpu` 有无 + 后端 + HUD 文本 + 仪表读数 + 采样统计 + 软门禁与 60/30 参考判定）；② Playwright 报告附件 `world-spike-perf-evidence.json`（同一 JSON 随 HTML 报告归档）；③ HUD 读数截图 `docs/spec/assets/e2e-integration/world_perf_hud_after_drive.png`（入库）。
- **运行纪律**：独占 `world-perf-chromium` project 殿后串行（帧间隔采样对并发 3D 负载最敏感）；录像显式关闭（Playwright 录屏 CPU 开销会系统性拉低读数）；用例零 skip、零 Spike 功能降级——帧率数值一律走软门禁 + 证据留档，硬断言只挡「链路死了」。
- **首轮实测（2026-08-24，42/42 全绿轮，4 核 SwiftShader，默认腿回退 webgl2）**：驾驶 31.3s 末速 77.1km/h；HUD「1 / 0」，仪表 avg 0.90 / 1% low 0.13；rAF 采样 5475ms 共 7 帧，p50 716.6ms / p95 1166.6ms / stall 6/7 → 软门禁按预期不达标，OBS 登记、CI 不阻断；drawCalls 120 / triangles 225,224 与 §3 场景复杂度读数一致（证据链自洽）。60/30 参考判定 false = 软件光栅化下界事实，非真机裁决。

## 4. 体积实测 vs 门禁（Step 9）

| 门禁 | 实测 | 判定 |
|------|------|------|
| 懒加载 JS ≤ 400KB gzip（Spike 从严） | **283.0KB**：world 入口 0.4 + engine 7.2 + 共享 three/loaders 248.4 + draco wrapper 11.5 + basis 14.7 + preload 0.7 | ✅ |
| `public/world/` 新增 ≤ 1MB | **0 字节**（目录不存在：地面/环形道 = 2048px 程序化画布纹理，锥桶/坡道/轮胎墙 = primitive 实例化） | ✅ |
| CarConcept 豁免口径 | 3.4MB 实测，位于 `public/models/car-concept/`，复用显式豁免（审计 P0-2）；HDRI 复用配置器现有 `studio_small_08_1k.hdr`，0 新增 | ✅ |
| 首页零 world 字节断言 | `audit-budget` ✅ PASS（world chunk/资产命中 0 处） | ✅ |
| noindex / sitemap | 壳页 `<meta name="robots" content="noindex">`；sitemap filter 排除 `/world-spike/`；`check-links` 0 条新增断链 | ✅ |

三 .js 中 248.4KB 是 `three/webgpu` 核心，与 car-configurator **共享同一 chunk**（本 Spike 顺手把两处 loader 栈合并为 `lab/shared/gltf-loaders.ts`）——配置器访问过的用户缓存命中后，world 增量只有 **≈7.6KB**。

## 5. 移动端摇杆可用性评语（Step 8）

自绘动态原点摇杆（`inputs.ts` 内 ~90 行，folio Nipple.ts 精简版，零第三方依赖）：按下生成原点、死区 18%、y 油门 x 转向、只认 touch/pen 指针不干扰鼠标。CDP 真触摸注入实测（390×700 移动仿真 + GL2 腿）：上推持杆 5s 达 40km/h、10s 达 72.9km/h，斜推航向偏转 0.28rad，松杆怠速滑行 73→23km/h，全链路（触点→意图→物理→HUD）无粘滞。**评语：可用性达标**；两处 Phase B 改进项——转向满舵映射偏灵（建议非线性曲线），摇杆基座无常显视觉锚点（首次上手要试探）。

## 6. 测试方法记录

- **自动化驾驶**：独立 Chromium（与共享 MCP 浏览器隔离）+ playwright-core，键盘事件闭环控制：期望航向 = 环形道切线 + 半径误差比例修正（`(r-55)×0.06`），A/D 开关式打舵，绕 55m 环形道**整圈**（累计弧度 > 2π 断言）；随后故意骑内/外线扫锥桶（击倒数断言 > 0）、R 复位（位置回出生点 + 锥桶清零轮询断言）、boost 峰值→空格刹停、12s 连续驾驶读帧率。WebGPU 与 `?gl=1` 两腿分别全绿（锥桶 7/6 只、复位 OK、boost 106km/h→刹停）。
- **触摸腿**：`Input.dispatchTouchEvent`（CDP 真触摸，非合成事件）驱动摇杆，遥测断言见 §5。
- **演示视频**：Playwright 录屏；软件渲染 ~1fps 下物理 dt clamp 使世界呈慢动作，视频 10× 时间压缩还原近实时观感。

## 7. 资产工程发现：CarConcept 轮组 rig 红线（Phase B 直接受用）

自动化截图审查揪出「悬浮轮胎」缺陷，排查结论（已修复于 `carRig.ts`，勿凭直觉重构）：

- 资产实况：场景唯一根 `BodyUnderside` 带 matrix=-90°X（Z-up 导出）；四个轮组节点用 **matrix** 承载「轮心平移 + 导出时随手转过的任意姿态旋转」（前轮甚至带着转向角）；轮组子网格（Rim/胎/卡钳/刹车盘）几何**原点居中**。
- 错误做法（曾上车）：拿包围盒中心当轮心——GLTFLoader 的 `boundingBox` 来自 accessor 声明、原点居中 → 轮心测成 0，四轮静止时全部叠在车体中心（恰被车身轮拱遮住，肉眼几乎看不出），一打方向/滚转就绕 ~1.8m 半径公转飞出车顶。
- 正确做法：**轮节点平移（父本地空间）即轮心**；烘死的姿态旋转刻意丢弃（不丢前轮呈内八字）；转向/滚转轴必须 `qParentInv` 换算进父节点 Z-up 本地空间（滚转轴 +X 恰好在 -90°X 下不变，纯属侥幸——这就是滚转「看起来一直对」而转向立刻穿帮的原因）。
- 验证：静止/满舵/行驶三态轮心世界坐标定量断言（满舵位移 0.000m）+ 倒车打轮截图复核。

## 8. 结论（Step 10 ⑤）

**通过。** Phase B（最小可玩）可排期：本 Spike 的 vehicle/carRig/inputs/camera 四模块按 `engine.ts` 头注的 tick 契约插进正式 Game 循环即可转正。条件项：**真机帧率录测（桌面 + 中端安卓）须在 Phase B 合并前补齐**——本记录的帧率证据链是「软件渲染下界（§3 + §3.1 常驻采样）+ 场景复杂度预算」，非真机读数；执行脚本与签字回填表已就位：`docs/spec/human-gate-checklist.md` §2（自动化采样为辅助证据，不替代真机）。若中端安卓实测持续 <24fps 且三板斧无效，仍按 roadmap 止损路径执行（Spike 归档为 ai-lab 实验记录，世界降级 HOME-07/08 保守方案）。

## 9. CC-E1 参数留档：PhysicsVehicle 上车 + 双档车辆合流（2026-08-25）

§8 预告的「四模块插进正式 Game 循环」已执行（Task CC-E1，分支 `cursor/cc-e1-physics-vehicle-1d6f`）：`src/lab/world/` 引擎层新增 `physics/PhysicsVehicle.ts`（folio `DynamicRayCastVehicleController` 全参数移植）、`player/KinematicFallback.ts`（本 Spike `vehicle.ts` 迁入，同接口）、`player/VisualVehicle.ts`（本 Spike `carRig.ts` 并入 + folio 轮同步段）。`spike/` 目录原样保留，退役归 CC-E2。

### 9.1 folio 物理参数表（Rapier 主路径，原封起步——roadmap §7.2 决策点 2）

全部数值依赖 **Ticker.scale = 2**（teardown §5.4 隐藏参数）；车辆控制器 dt = min(1/60, 30 帧滑动平均)，与 `world.step` 的瞬时 deltaScaled 分离（§5.3 纪律，两处独立时基）。

| 组 | 参数 | 值 | 语义 |
|----|------|-----|------|
| 驱动 | engineForceAmplitude / boostMultiplier | 300 / ×(1+2) | 引擎力 = 油门 × 300 / (1+超速量) × deltaScaled，无硬限速 |
| 驱动 | topSpeed / topSpeedBoost | 5 / 40 | folio 时基速度标量（位置差分 ÷ deltaScaled 口径） |
| 制动 | brakeAmplitude / idleBrake / reverseBrake | 35 / 0.06 / 0.4 | 三分支：主动 / 怠速滑停 / 换向先刹停 |
| 转向 | steeringAmplitude | 0.5 | 前两轮直写无插值（视觉平滑在 VisualVehicle 层） |
| 底盘 | 主体 cuboid 1.3×0.4×0.85 | mass 2.5，centerOfMass y=-0.5 | 压质心 = 防翻车第一要素 |
| 底盘 | 车顶 / 推土铲 cuboid | mass 0 | 铲斗走 bumper 分组：只推 object、不碰 floor |
| 轮 | offset ±0.9 / ±0.75，radius 0.4 | — | 物理脚印轴距 1.8m / 轮距 1.5m |
| 轮 | frictionSlip / sideFrictionStiffness | 0.9 / 3 | 漂移手感核心旋钮 |
| 悬挂 | restLength 三档 | low 0.88 / mid 1.23 / high 1.63 | high = 空格跳跃冲量来源（弹簧瞬间加长） |
| 悬挂 | stiffness 三档 | 20 / 30 / 40 | 配合 maxForce 150 / travel 2 / compression 10 / relaxation 2.7 |
| 自救 | flipForce | 5 | 翻覆 3s 后向上冲量 ×mass + 姿态分支扭矩（Player.setUnstuck 循环） |

### 9.2 E1 实测新发现（folio 文档未载，浏览器定量测得）

- **静态下沉 0.36m**：low 档刚度 20 扛底盘质量 2.5，四轮平衡压缩 ≈ mg/(4k) ≈ 0.31 + 阻尼余项 → 悬停高度实测 0.92~0.98m（≠ 名义 rest 0.88+0.4=1.28）。接口净高常量 `VEHICLE_GROUND_CLEARANCE` 与悬挂视觉行程差基线均按**静态平衡口径**（0.92 / 平衡长度 0.52）取值，否则车身相对轮子低 0.36m（视觉半埋）。
- **底盘不得进 Objects 注册表**：注册表的 `resetAll` / 掉出世界重置会把底盘拽回「创建时初始位」，覆盖 `moveTo` 的重生位（实测 R 重生被拉回 (0,4,0)）。底盘直连 `physics.getPhysical`；掉出世界由 Player 的 killElevation 守卫兜底。
- **轮序映射**：接口视觉序（前左/前右/后左/后右）↔ folio 物理序（前右/前左/后右/后左），`SITE_TO_FOLIO = [1,0,3,2]`。
- **姿态约定统一**：底盘局部 +X 车头（folio），CarConcept 对齐旋转从 Spike 的「车头 +Z」改为「车头 +X」，模型按物理脚印轴距 1.8m 统一缩放（轮位对齐物理接触点优先，车宽随缩 <1.7m 物理盒，灰盒期可接受）；`wheelSpin` 统一按物理轮半径 0.4m 积分，视觉层按实测半径换算真实滚转。

### 9.3 运动学回退档（SRD §12.7.5「世界永远能开」）

本 Spike `vehicle.ts` 的 SI 参数表（§«params.ts»）**原值拷贝**进 `KinematicFallback.ts`（拷贝而非 import——spike/ 目录 CC-E2 退役，引擎层不得依赖）；dt 用 `ticker.deltaAverage` 真实秒，**不乘 Ticker.scale**（两套参数不可混搭红线）。触发：Rapier wasm 加载失败自动切换，或 `?vehicle=kinematic` 显式 A/B。运动学档下锥桶无物理互动（域不同），贴地 raycast 打视觉地面网格。

## 10. CC-E2 退役决策记录：spike 合流、单实现转正（2026-08-25）

§8 预告的合流第二步执行完毕（Task CC-E2，分支 `cursor/cc-e2-spike-merge-1d6f`）：`src/lab/modules/world/spike/` **七文件全部删除**，`/world-spike/` 壳页与薄入口 `src/lab/modules/world/index.ts` 唯一指向引擎层（`src/lab/world/`，folio 架构 Game loop + Rapier 物理车），`?impl=` 分叉退役。本节 = 各文件去向裁决 + 合流期新决策；被退役代码此后仅存于 git 历史（本分支删除提交之前）。

### 10.1 七文件去向表

| spike 文件 | 去向 | 说明 |
|-----------|------|------|
| `vehicle.ts` | `player/KinematicFallback.ts`（E1 已迁，见 §9.3） | SI 参数原值拷贝；`?vehicle=kinematic` 显式回退腿保活 |
| `carRig.ts` | `player/VisualVehicle.ts`（E1 已并，见 §9） | 轮组 rig 红线（§7）随迁；落位裁决见 §10.2 M2 |
| `params.ts` | **本文档 §2 参数表快照即留档**（单一事实源退役后转历史档） | 车辆 SI 参数活拷贝在 KinematicFallback；锥桶 kick 动力学参数**随手写碰撞一并退役**（锥桶已转 Rapier 动态体，动力学=物理真值，无参数可调）；场地参数被引擎灰盒替代（环形道 55m→10m，`World.RING`） |
| `inputs.ts` | 键位表并入 `player/Player.ts` actions；`preventDefault` 纪律并入 `inputs/Keyboard.ts`；摇杆职责归引擎 `inputs/Nipple.ts`（自绘 DOM 摇杆退役） | 键位冲突裁决见 §10.2 |
| `camera.ts` | 速度变焦参数换算进 `view/View.ts` zoom 配置 | `speedEdge` 重标定 {5,40}→{4,24}：focusPointSpeed 是真实 m/s，物理车常态软限速 ≈10 m/s（folio topSpeed 5 × Ticker.scale 2），folio 原阈值在此速度域几乎不动；新值下巡航即有可感拉远、boost 逼近满幅（spike「推背观感」等价物） |
| `scene.ts` | 锥桶阵位并入 `world/World.ts`（三组布局按 10m 环缩尺重排：直道慢弯桩 4 + 环道 slalom 8 + 出弯双排门 4，共 16 只）；地面/环道/轮胎墙被引擎程序化灰盒替代 | 锥桶从手写球碰撞换 **Rapier 动态体**（Objects 注册表管理，R 复位走 `resetAll`）；击倒判定 = 物理真值（位移 >0.6m 或倾角 >56°），出生正前方 -Z 直线上有确定性锚点桩 (0,-4.5)/(0,-9)（e2e 直行即撞，循迹控制器退役） |
| `engine.ts` | 装配职责归 `src/lab/world/index.ts` mount 入口；FpsMeter 摘出为 `utils/FpsMeter.ts` | HUD 接线 / `__worldSpike` 遥测 / canvas 置换纪律 / 教学提示消隐全部迁入；详见 §10.3 |

### 10.2 合流期裁决（M2/M3/M4 + 键位冲突）

- **M2 · VisualVehicle 落位**：保持 `player/VisualVehicle.ts`（E1 实况），**修订实施方案 §3.1/§3.2 文字**而非搬文件——它与底盘（PhysicsVehicle/KinematicFallback）同属 Player 装配域，从契约回读位姿；`world/` 留给场景内容件。
- **M3 · 出生锚点统一**：`World.SPAWN` 切到 `src/data/cyber-city-buildings.json` 的 `world.spawn`（十字路口 (0,0)、heading 0）——机器人站位（`?robot=1`）、变形落点（E6）、城市出生光圈三者同锚。heading（度，0=北 -Z，顺时针）→ folio 底盘 rotationY 换算：`r = π/2 − h·π/180`（h=0 → r=π/2，车头朝北）。灰盒环形道恰以出生点为圆心，出发直行即上道。
- **M4 · 深链白名单转正**：壳页白名单 = `gl` / `vehicle` / `city` / `robot` 四项，全部经壳页过滤后透传 mount；引擎入口**不再** `location.search` 兜底（临时接线退役），白名单外参数一律忽略且不回写 URL。
- **键位冲突（Space）**：spike 口径 Space=刹车 vs folio 口径 Space=悬挂跳。**裁决：Space=刹车**（WS-E2E-03 验收契约 + 触屏教学文案既成事实），folio 悬挂跳挪 KeyF（非核心验收行为）。`brake` 键组 = Space/B/ControlLeft。
- **速度遥测口径统一**：`__worldSpike.state().speedKmh` = 真实 km/h 两档同口径——physics 档 `forwardSpeed` 是 folio 时基，×`Ticker.scale`(=2)×3.6；kinematic 档本征即 SI，×3.6。由 `Game.vehicleKind`（init 落定）分派。常态巡航实测 ≈36km/h、boost >45km/h（e2e 阈值据此重标定，原 spike 65km/h 阈值随参数域退役）。

### 10.3 spike engine.ts 纪律迁入清单（新宿主）

1. **HUD 接线**（`src/lab/world/index.ts`，tick order 999 渲染后结算，0.25 世界秒节流）：速度/帧率/锥桶计数 + 教学提示消隐（任何驾驶意图含摇杆即收）。挂点缺席容忍——引擎不依赖壳页 DOM。
2. **`__worldSpike` 遥测**契约结转并扩展：`backend`/`vehicle`（physics|kinematic）/`state()`（位姿 + speedKmh + grounded + cones + **nippleActive/nippleProgress** 新增——3D 摇杆无 DOM 锚，e2e 断言全走遥测）/`fps()`/`info()`；`#debug` 暴露 `__worldSpikeGame` 句柄；dispose 时删除。
3. **FpsMeter**（`utils/FpsMeter.ts`）：喂墙钟 `performance.now()`，**不能用 Ticker.delta**（被 maxDelta 钳制且随暂停冻结，读不出真实帧间隔——spike wallDt/rawDt 双轨纪律）；pause/resume 边界 `reset()`（跨暂停长间隔不得计入 1% low）。
4. **canvas 置换**（`rendering/Rendering.dispose`）：dispose 后原位克隆置换 canvas，保证可重复挂载（WS-E2E-07 再挂载链路依赖）。
5. **ready = 输入已放行**：mount 等引擎 `revealed` 事件（intro→wandering 过滤器切换）后才 resolve——否则「ready 即按键」被 intro 过滤器吞掉（e2e 与真实用户首帧即操作场景）。
6. **驾驶键 preventDefault**（`inputs/Keyboard.ts`）：方向键/Space 的 keydown+keyup 双向拦截（Space 对聚焦按钮的 click 激活发生在 keyup——刹车键不得误触「进入」按钮）；输入框聚焦守卫在前。
7. **复位即整场复位**：R/触屏复位按钮 → Player respawn 事件 → `Objects.resetAll()`（锥桶阵列恢复）。触屏按钮派发 keydown+keyup 成对事件（引擎 Inputs 是 toggle 语义，只派 down 会卡按下态）。

### 10.4 合流期修复（引擎侧既有缺陷，合流验证揪出）

- **Nipple NDC 偏移**：Pointer 给 client 视口坐标，NDC 归一化未减舞台 `getBoundingClientRect()` 偏移——壳页舞台非满屏时射线整体偏移。已修（`updateFromPointer`）。
- **Nipple 角度约定镜像**：内部 `targetAngle = atan2(dz, dx)` 是世界 XZ 方位角口径，而 `this.angle` 直存 folio rotationY（前向 `(cos r, 0, -sin r)`）——两口径混用导致转向镜像。已修：`this.angle = -rotationY`（车头 XZ 方位角 = atan2(-sin r, cos r) = -r），mesh 自转仍用 rotationY。

### 10.5 e2e 重标定摘要（`e2e/world-spike.spec.ts`，用例数不变）

出生点 (0,0)（原 z=55）、速度阈值（巡航 25 / boost 45 km/h）、锥桶=Rapier 真值 + 直线锚点桩打法（撞空 R 复位重试 ≤3 轮，决不 skip）、摇杆断言全走遥测 nippleActive/nippleProgress（`.ws-nipple-*` DOM 选择器退役）、WS-E2E-11 从「?impl=engine 灰盒腿」改守「?vehicle=kinematic 运动学回退档」（SRD §12.7.5「世界永远能开」显式腿）。`world-spike-perf.spec.ts` 与 `mobile.spec.ts` 零改动（无旧口径引用）。
