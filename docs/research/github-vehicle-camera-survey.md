# GitHub / 开源载具相机深度调研（CC-VEH-RS）

| 项 | 内容 |
|----|------|
| 任务 | CC-VEH-RS：PUBG 式载具 FPV + 第三人称跟车 + V 键切换的 GitHub / 开源调研（**只调研，零实现**） |
| 模型 | `claude-fable-5-thinking-xhigh` |
| 日期 | 2026-08-27（UTC） |
| 上游 | `cyber-city-vehicle-transform-experience.md`（Loop 7 入口 §1.1/§2）· `github-camera-poi-survey.md`（CAM 红线与 shot 注册表结论，读自 `cursor/cc-cam-rs-doc-merge-1d6f`）· `src/lab/world/view/View.ts` · `src/lab/world/player/Player.ts` |
| 方法 | 16 仓库全部经 `gh api repos/{owner}/{repo}` 实测（星数 / SPDX 许可 / archived / 最近 push，2026-08-27 快照）；核心仓库逐个拉一手源码核验到行号（Sketchbook / racing-game / Mario-Kart-3.js / folio-2025 / Godot truck_town / SuperTuxKart / Babylon / isaac-mason / Jolt）；闭源竞品（PUBG/GTA/CP2077）以官方支持页 + 控制表交叉核实，单独标注「观察口径」 |
| 下游 | CC-VEH-DES（`docs/spec/cyber-city-vehicle-camera.md`）· CC-VEH-VIEW（V 键 + FPV + focus 策略 + e2e） |

## 0. 结论先行

1. **V 键载具视角切换有直接的开源先例，且键位选择与 PUBG/GTA 行业约定一致**：
   swift502/Sketchbook（three.js + cannon，MIT）在车内绑定 `'view': KeyBinding('KeyV')` →
   `toggleFirstPersonView()`，是与本站需求形态最近的一手样本；PUBG 官方支持页确认
   V = 1st/3rd 切换（含载具内）；GTA V PC 同为 V 键循环视角。指挥官点名的 V 键
   **无键位冲突**：本站 `Player.ts` 动作表未占 V，folio-2025 原 V 键（debug free cam
   切换，一手源码 `View.js` L83-97 确认**只在 debug 模式注册**）已随 free 模式砍除。
2. **没有任何库值得引入，FPV 是 ≤200 行的自实现**。三类实现样本里，「场景图
   parenting」（racing-game 把相机挂进底盘组）会把物理抖动与 roll 直传相机（晕动症
   高风险 + 破坏本站 View 单出口架构）；正解是 **STK/Sketchbook 式「采样底盘位姿 →
   分离平滑 → 输出」**——恰好是 `View.ts` 现有架构（order 6 位置回读 → order 7 相机
   解算）的自然扩展，且能复用 `ritualCam` 的「零值恒等」通道范式机器保证 poster 合同。
3. **lookahead 的行业共识是「三条腿」**：① 速度拉远/拉高（folio speedZoom 已有，
   STK `-2.8-5.6×ratio` 同构）；② 转向侧偏（racing-game FPV `sin(steer)×speed/30`，
   STK 侧滑角半角）；③ 焦点前置（Mario-Kart 前置 lookAt 组）。本站第三人称已有 ①，
   缺 ③——落地形态 = focusPoint 前置偏移通道 `forward × Lmax × smoothstep(speed,
   speedEdge)`，复用现有 `speedEdge {4,24}` 标定，0 恒等。
4. **切换 UX 的行业口径是「即切不补间」**：PUBG/GTA/CP2077 三家全部即切；Godot
   truck_town 还显式 `reset_physics_interpolation()` 防切换残影。V1 推荐即切（e2e
   可测性最好：位姿离散跳变断言），短混合（≤200ms）留给 DES 裁决。
5. **红线全部可对齐**：FPV 不引入任何鼠标/触摸相机接管（PUBG 的 Alt 自由环视是
   G5 相机纪律禁用面，明确不抄）；零新依赖；`drive_third` = 现行 View 行为逐位不动
   （驾驶第三人称默认态零回归）；非驾驶态 V 无效（ritual_idle / transform 恒等保护）。

## 1. 红线与本仓库现状（先立秤再称重）

| 红线 / 事实 | 出处 | 对本调研的含义 |
|------|------|----------------|
| G5 依赖红线 | `implementation-roadmap-birdseye.md` G5：不引 React/R3F、Lenis、Tailwind；GSAP 仅专项审批 | R3F 系样本（racing-game / Mario-Kart / isaac-mason）只借模式不借码 |
| 相机纪律（CAM 红线） | `cyber-city-camera-poi-research.md` §5 + `github-camera-poi-survey.md` §1：禁用户 free 漫游，只允许数据驱动预设镜头 | FPV 的鼠标自由环视（PUBG Alt / Sketchbook CameraOperator 鼠标 orbit）全部禁用；FPV 朝向只能由**车辆状态**驱动 |
| poster 合同 | `View.ts` ritualCam 注释：零值 ×1/+0 IEEE 逐位恒等 | FPV/lookahead 通道必须同范式：`fpvBlend=0`、`lookahead=0` 时现行为逐位恒等 |
| 驾驶输入现状 | `Player.ts` L127-136：WASD/箭头 + Shift boost + Space/B/Ctrl brake + R respawn + F suspensions，类别含 `driving` | **V 空闲**；新动作照抄 `addActions` 模式并入 driving/wandering/racing 类别即可 |
| 相机现状 | `View.ts`：focusPoint（跟踪+磁吸+easing）/ zoom（speedEdge {4,24} 速度拉远）/ spherical（固定 phi/theta）/ roll（碰撞 kick）/ ritualCam（变形推镜通道） | 第三人称跟车已是 folio 血统完整移植；缺 FPV、缺 lookahead、theta 不随车头 |
| folio V 键血统 | folio-2025 `View.js` L83-97（一手源码）：`Keyboard.KeyV` → `viewToggle` **仅 `debug.active` 时注册**，切 MODE_FREE（camera-controls 自由机） | folio 的 V ≠ FPV；本站 V 键语义是**新设计**，UX 依据来自 PUBG/GTA/Sketchbook，输入接线照抄 folio `addActions`/`actionStart` 模式（已有移植先例） |
| CAM 合流顺序 | `cyber-city-vehicle-transform-experience.md` §3 | `drive_third`/`drive_fpv` 挂位参数入 CAM 批次 `camera-shots.json` 注册表，避免双源机位常量 |

接入成本刻度（沿用 CAM 调研）：**零**（已 vendor / 已是依赖）｜**低**（≤200 行自实现、零新依赖）｜**中**（新增运行时依赖，须 SRD 登记）｜**高**（栈不兼容 / 需改架构）。

## 2. 总表（16 仓库，gh api 2026-08-27 实测）

### 2.1 three.js 生态载具相机实现（一手源码核验）

| 仓库/项目 | 许可 · 星 · 最近 push | 可借鉴点 | 红线对齐 | 接入成本 | 裁决 |
|------|------|-------------------|----------|----------|------|
| [swift502/Sketchbook](https://github.com/swift502/Sketchbook) | MIT · 1,748 · 2024-10（**archived**） | **V 键载具 FPV 切换的完整一手样本**：`Car.ts` L52-60 动作表 `'view': KeyBinding('KeyV')`，`onInputChange` 里 `view.justPressed → toggleFirstPersonView()`；`Vehicle.ts` L189-206：FPV = 相机半径归 0 + 隐藏角色模型，TPP = 半径 3 + 目标 `position+0.5y`；**FPV 挂点 = GLB 内嵌 `userData.data==='camera'` 空节点**（L391-393），每帧 `挂点本地位 applyQuaternion(底盘四元数) + 底盘位`（L266-268）——挂点是美术资产数据不是代码常量 | 其 CameraOperator 鼠标 orbit / Shift+C free cam 是禁用面；FPV 挂点解算与即切半径本身零输入接管 ✅ | 低（挂点解算 ~10 行） | ⭐ 强推荐（V 键语义 + FPV 挂点形态） |
| [pmndrs/racing-game](https://github.com/pmndrs/racing-game) | MIT · 2,211 · 2023-02（停更） | `store.ts` L13/L106/L177：`cameras=['DEFAULT','FIRST_PERSON','BIRD_EYE']` + `'c'` 键取模循环；相机挂进底盘组（`App.tsx` L54-57，`<Cameras/>` 是 `<Vehicle>` 子节点），`Vehicle.tsx` L82-97 本地偏移逐帧 lerp：**FPV `(0.3+sin(-steer)×speed/30, 0.4, -0.1)`（转向侧偏 = FPV lookahead）**、DEFAULT `(sin(steer)×speed/2.5, 1.25, -5-speed/15+刹车推近1)`（速度拉远 + 刹车推近）、roll swivel `-steer×speed/40`；L103-108 boost 正弦 sway/vibration | R3F（G5）整库出局；**parenting 挂法不推荐**（物理抖动直传 + 破坏 View 单出口）；sway 抖动网页晕动症风险，不抄 | 借参数不借码（低） | ⭐ 模式推荐（FPV 偏移参数 + 转向侧偏公式 + 循环切换语义） |
| [mustache-dev/Mario-Kart-3.js](https://github.com/mustache-dev/Mario-Kart-3.js)（原 Lunakepio） | **无 LICENSE** · 4,582 · 2025-12 | `PlayerController.jsx` L286-311：**双挂点跟车**——`cameraGroup(0,1,5)` 尾随点 + `cameraLookAt(0,-2,-9)` 前置点挂在卡丁车容器上，相机 `position.lerp(尾随点世界位, 24×dt)` + `lookAt(卡丁车)`；朝向平滑 `smoothedDirection.lerp(desired, 12×dt)`（位置快、朝向慢的分离时间常数） | **无许可 = 法律上不可借码**（CAM 调研同裁决）+ R3F + 任天堂 IP | 禁止借码；机制自明可自写（—） | 观感参照（前置 lookAt 挂点思路） |
| [isaac-mason/sketches](https://github.com/isaac-mason/sketches)（`rapier/arcade-vehicle-controller`） | MIT · 342 · 2026-05 | `sketch.tsx` L214-218：偏移 `(0,3,10)` **applyQuaternion(平滑后的转向朝向)** + `lookAt(车身)`——「相机绕到车头反向」的 heading-chase 最小实现；Rapier 栈与本站同源 | R3F 壳（G5），逻辑本体三行纯 three | 借公式（低） | 模式推荐（heading-chase 备选） |
| [brunosimon/folio-2025](https://github.com/brunosimon/folio-2025) | MIT · 1,772 · 2026-04 | 第三人称跟车主干（focusPoint 磁吸 + speedZoom + spherical + roll kick）**已移植完毕**（`View.ts`）；`View.js` L83-97/L100-114 的 `addActions`+`toggleMode` 输入接线模式照抄；L736-747 双相机出口切换 | 其 V 键切的是 camera-controls free cam（禁用面），语义不借 | **零**（vendor 快照 + 移植已完成） | ⭐ 已在用（跟车基线） |
| [brunosimon/folio-2019](https://github.com/brunosimon/folio-2019) | MIT · 4,736 · 2024-05 | 固定等距跟车（无 FPV）；`Camera.angle.items` 命名机位注册表血统（CAM 调研 §2.2 已收） | 无新增冲突 | 零 | 已收编（CAM 批次） |

### 2.2 引擎级 / 跨引擎 chase-cam 与视角切换参照

| 仓库/项目 | 许可 · 星 · 最近 push | 可借鉴点 | 红线对齐 | 接入成本 | 裁决 |
|------|------|-------------------|----------|----------|------|
| [godotengine/godot-demo-projects](https://github.com/godotengine/godot-demo-projects)（`3d/truck_town`） | MIT · 9,413 · 2026-08 | `follow_camera.gd`（全文核验）：**三档循环 EXTERIOR/INTERIOR/TOP_DOWN**（`cycle_camera` 动作取模，与 racing-game 同构）；INTERIOR = 车内挂点节点刚性跟随（`set_as_top_level(false)`）；EXTERIOR = **绳长夹距**（距离 clamp min 2/max 4 + 固定高 1.5 + lookAt）；**速度 FOV 三参数**：`FOV_SPEED_FACTOR 60`、`FOV_SMOOTH_FACTOR 0.2`、**`FOV_CHANGE_MIN_SPEED 0.05`（低速死区防抖/防阴影闪烁）**；切换时 `reset_physics_interpolation()` **即切防残影** | 无（借算法，引擎无关） | 低 | ⭐ 强推荐（切换即切纪律 + FOV 低速死区 + 挂点车内档） |
| [supertuxkart/stk-code](https://github.com/supertuxkart/stk-code) | GPL-3.0（API NOASSERTION，LICENSE 实为 GPL）· 5,313 · 2026-08 | `camera_normal.cpp` L87-152（一手核验）：跟车距离 `-2.8-5.6×(speed/maxSpeed)`、高度 `0.85+ratio/2.5`（越快越远越高）；**侧滑角半角侧偏**（漂移取景）；**位置/旋转分离平滑时间常数**（`m_camera_forward_smooth_position/rotation` 两个 delta）；四元数 `dot<0` 取反防 slerp 翻转 | **GPL-3.0：只借思路严禁抄码**；输入无关的跟车数学无红线 | 借思路（低） | 模式推荐（分离平滑 + 速度标定口径） |
| [BabylonJS/Babylon.js](https://github.com/BabylonJS/Babylon.js) | Apache-2.0 · 25,985 · 2026-08 | `followCamera.pure.ts` L24-93：FollowCamera 参数面 = `radius 12 / rotationOffset 0 / heightOffset 4 / cameraAcceleration 0.05 / maxCameraSpeed 20`——**「跟车相机 = 5 参数」的引擎级 API 定形**，可作 `drive_third`/`drive_fpv` 进 shot 注册表的字段命名参照 | 引擎不可换（借参数命名） | 零 | 模式推荐（schema 参照） |
| [jrouwe/JoltPhysics.js](https://github.com/jrouwe/JoltPhysics.js) | MIT · 562 · 2026-08 | `Examples/vehicle_wheeled.html` L286：`camera.position.add(pos - oldPos)` delta 平移跟随（保用户 orbit）——物理 demo 相机的最省形态 | orbit 主体是禁用面 | 无需（—） | 不推荐（无增量） |
| [dimforge/rapier.js](https://github.com/dimforge/rapier.js) | Apache-2.0 · 696 · **2026-07 archived** | 本站物理主路径的上游 JS 绑定仓库**已归档**（npm 包与文档另有去向）——与相机无关但值得记录到工程风险台账 | — | — | 情报（转 CC-MAINT 关注） |

### 2.3 FPV / 第三人称通用件（视野拉宽）

| 仓库/项目 | 许可 · 星 · 最近 push | 可借鉴点 | 红线对齐 | 接入成本 | 裁决 |
|------|------|-------------------|----------|----------|------|
| [mrdoob/three.js](https://github.com/mrdoob/three.js)（`examples/games_fps.html`） | MIT · 114,828 · 活跃 | 官方步行 FPV 样本：相机挂碰撞体 + pointer lock 鼠标 pitch/yaw。**三 js 无官方载具相机示例**——载具 FPV 没有「现成轮子」可引，自实现是生态常态 | pointer lock 鼠标接管是禁用面；仅证明「没有库可依赖」这个事实 | —（已是依赖） | 事实参照 |
| [simondevyoutube/ThreeJS_Tutorial_ThirdPersonCamera](https://github.com/simondevyoutube/ThreeJS_Tutorial_ThirdPersonCamera) | MIT · 65 · 2020-11 | 教学最小样本：**idealOffset（尾随点）+ idealLookat（前置点）双挂点** + 帧率无关插值 `t=1-0.001^dt`；「lookAt 点放角色前方」是 lookahead 的最直白表达 | 无 | View.ts 已有等价插值（—） | 概念参照（双挂点术语） |
| [yomotsu/meshwalk](https://github.com/yomotsu/meshwalk) | MIT（package.json 已核，API 无 SPDX）· 306 · 2026-08 | TPS 相机遮挡回退（相机与角色间射线求交拉近）——本站城市楼体密集，`drive_third` 撞楼遮挡迟早要面对 | 输入接管主体禁用；遮挡算法本身无关输入 | 借思路（低，V2 面） | 参考（遮挡处理，非本批次） |
| [enable3d/enable3d](https://github.com/enable3d/enable3d) | **LGPL-3.0** · 1,175 · 2025-11 | three+ammo 全家桶（含载具示例） | LGPL 传染条款 + 引擎栈不符 | 不引（—） | 不推荐 |
| [cyrus2281/night-city](https://github.com/cyrus2281/night-city) | BSD-3 · 9 · 2024-09 | 赛博城第三人称跟随观感锚（CAM 调研已收） | R3F | —（只看） | 已收编 |

**计数**：2.1×6 + 2.2×5 + 2.3×5 = **16 仓库**，全部 `gh api` 实测。

## 3. 五题深读（任务书点名主题）

### 3.1 PUBG / 同类 FPS 载具第一人称（闭源，观察口径）

事实核验（PUBG 官方支持页 + wiki 控制表交叉）：

- **V = 1st/3rd Person Toggle**（官方支持页原文），车内外同一键；载具键位 Space=手刹、
  Shift=boost——与本站 `Player.ts` 现有 Space=brake/Shift=boost 口径**巧合一致**，V 键
  并入后整套驾驶键位与 PUBG 玩家肌肉记忆对齐。
- **FPP 载具 = 座舱内驾驶位视角**：视点在司机头位，能看到内饰/方向盘；社区共识是
  FPP 驾驶「更敏感、更晕」（转向感放大）——防晕设计不是可选项。
- **Alt = 自由环视**（头转车不转）：这是 PUBG FPV 可用性的重要补丁，但本质是鼠标
  相机接管，**触碰 CAM 红线，明确不抄**。替代：本站 FPV 视线由车辆状态驱动
  （车头朝向 + 转向侧偏微量），不开放自由环视。
- 对本站映射：PUBG「按 V 即切、双态记忆、无过场」的 UX 骨架全部可借；FPP 的
  头位挂点 + 内饰可见依赖本站车模是否有座舱面（资产裁决给 DES：无座舱则用
  「引擎盖位/hood cam」——GTA 同样提供 hood 档作为无内饰的 FPV 替代，规避穿模）。

### 3.2 folio-2025 / bruno 第三人称跟车（vendor 一手源码 + 本站移植现状）

- 已在手资产（`View.ts` 完整移植）：focusPoint 跟踪 + 磁吸 + easing、speedZoom
  （`speedEdge {4,24}` 已按本站速度域重标定）、spherical 固定机位、roll 碰撞 kick、
  optimalArea。**`drive_third` = 这套现行为原样，是零回归基线，不是新建目标。**
- folio 血统的三个「有意为之的缺席」，本批次维持：① theta 不随车头旋转（等距
  「地图感」取景，转弯永不甩镜头 = folio 防晕核心决策）；② 无 lookahead（磁吸
  弹性 + 速度拉远补上下文）；③ 无 FPV。指挥官诉求把 ③ 补上、③ 的补法不动 ①②。
- folio-2025 V 键真相（`View.js` L83-97 一手核验）：**仅 debug 模式注册**，切
  camera-controls free cam，生产玩家从未见过 V 键——「folio 有 V 键切视角」是误传，
  本站 V 键语义以 PUBG/GTA/Sketchbook 为准。

### 3.3 three.js 载具相机模式（三种挂法与裁决)

| 挂法 | 样本 | 机制 | 裁决 |
|------|------|------|------|
| A. 场景图 parenting | racing-game（相机是底盘子节点） | 本地偏移 lerp，物理姿态全量直传 | ❌ 物理抖动/roll 直达相机（晕）；与 View 单出口架构冲突 |
| B. 采样-平滑-输出 | Sketchbook FPV / STK / Mario-Kart | 每帧读底盘 position+quaternion，位置/旋转**分离时间常数**平滑后写相机 | ✅ **推荐**：正是 View.ts 现架构（order 6 回读 → order 7 解算），`PlayerVehicle` 契约已暴露 position/quaternion/forward |
| C. anchor+球坐标 | 本站 View.ts 现行 / Cesium HeadingPitchRange | 焦点 + 球坐标偏移 | ✅ `drive_third` 已是此形态，不动 |

FPV 挂点数据形态：Sketchbook 用 GLB 内嵌空节点（美术可调、代码零常量），
racing-game 用代码常量 `(0.3, 0.4, -0.1)`。本站折中：**挂点本地偏移进 CAM 批次
`camera-shots.json`**（`drive_fpv` 条目字段），与「镜头是数据不是代码」的 CAM 调研
结论同构；数值起点参照 racing-game 比例换算本站底盘口径（局部 +X 车头 / +Y 上 /
+Z 右，`Player.ts` PlayerVehicle 注释），DES 定稿。

### 3.4 lookahead / focus 策略（跨样本比较）

| 样本 | 速度拉远 | 转向/侧滑侧偏 | 焦点前置 | 平滑口径 |
|------|----------|---------------|----------|----------|
| folio-2025（已移植） | ✅ speedZoom（quality 0 档） | — | — | focusPoint easing + 磁吸 |
| racing-game | ✅ `-5-speed/15` + 刹车推近 | ✅ FPV `sin(steer)×speed/30`、TPP `sin(steer)×speed/2.5` | —（挂点即前视） | 本地 lerp ×dt |
| Mario-Kart-3.js | — | —（漂移角进车体旋转） | ✅ 前置 lookAt 组 `(0,-2,-9)` | 位置 24dt / 朝向 12dt 分离 |
| SuperTuxKart | ✅ `-2.8-5.6×ratio` + 高度 `0.85+ratio/2.5` | ✅ 侧滑角半角 | —（目标 = 车 +0.5y） | 位置/旋转双时间常数 + dot 防翻转 |
| Godot truck_town | ✅ 速度 FOV（非距离）+ 低速死区 | — | — | FOV lerp 0.2 |
| GDC 参照（非 GitHub）：John Nesky《50 Game Camera Mistakes》（GDC 2014）、Squirrel Eiserloh《Juicing Your Cameras With Math》（GDC 2016） | lookahead 应由**输入/速度**驱动而非位置微分；避免方向反转瞬间甩镜头；所有通道可插值可衰减 | | | |

本站落地形态（交 DES 定稿）：

- **第三人称 lookahead** = focusPoint 前置偏移通道：`offset = vehicle.forward ×
  Lmax × smoothstep(|speed|, speedEdge.min, speedEdge.max)`，倒车取反并减半，
  Lmax 量级 2–4m（斜距 20m/FOV 42° 下约 1/6–1/3 屏），偏移本身再过一层慢平滑
  （防转向抖动直传，Nesky 纪律）。**0 恒等**：静止/非驾驶态 offset=0，focusPoint
  链路逐位与现行为一致。磁吸/easing/speedZoom 全部不动。
- **FPV 视线** = 挂点前方远点（天然 lookahead）+ 转向侧偏微量（racing-game 公式，
  幅度砍半起步）；roll 不传或衰减 ≤20% 传递，pitch 限幅（座舱水平线稳定 =
  防晕第一杠杆，PUBG FPP 晕感投诉的反面教材）；速度 FOV kick 可选，若做则带
  Godot 式低速死区 + `reduced-motion` 归零。

### 3.5 V 键视角切换 UX（跨产品对照）

| 产品 | 键位 | 档位 | 切换观感 | 出处口径 |
|------|------|------|----------|----------|
| PUBG | **V** | FPP ↔ TPP 双态 | 即切 | 官方支持页 |
| GTA V（PC） | **V** | TPP 近/中/远 → FPV/hood 循环 | 即切；C = 回头看、R = 电影相机（独立键） | IGN/GTABOOM 控制表 |
| Cyberpunk 2077 | Q（PC，2.0 起） | 上车自动 TPP；FPP + TPP 近/远循环 | 即切 | Game8/gamepressure |
| Sketchbook | **V**（`KeyBinding('KeyV')`） | FPV ↔ TPP 双态 | 即切（半径 0/3 instantly=true） | 一手源码 |
| racing-game | C | 三档循环（含俯瞰） | 相机 lerp 追新挂点（数帧内到位） | 一手源码 |
| Godot truck_town | `cycle_camera` 动作 | 三档循环 | 即切 + `reset_physics_interpolation()` | 一手源码 |

UX 决策清单（给 DES 的建议倾向）：

1. **键位 = V**：PUBG/GTA/Sketchbook 三票 + 指挥官点名 + 本站键位空闲，无争议。
2. **双态不做三档**：V1 只 `third ↔ fpv`（PUBG/Sketchbook 口径）。GTA 式多档循环
   留 V2——三档以上必须配 HUD 指示器，成本升一档。
3. **即切**：六个样本五个即切；即切对 e2e 最友好（单帧位姿跳变断言，无补间时序
   flake）。若 DES 选短混合，上限 200ms 且线性（变形四拍墙钟纪律的同款克制）。
4. **驾驶态限定**：动作类别 `['driving', 'wandering', 'racing']`（与 boost/brake 同口径）；
   `TransformSystem` intro/ritual 态 V 无效；respawn（R）时强制回 `third`（重生瞬间
   FPV 会黑帧/穿模，Godot INTERIOR 档切出场景同款问题）。
5. **状态记忆**：会话内记忆即可（不建议 localStorage——首幕/poster 恒等审计要求
   冷启动状态确定性）。
6. **提示**：并入现有 hints 体系一条（「V 切换视角」），touch 端暂缺 FPV 入口
   （nipple 无空闲手势位），V1 FPV 定位为桌面增强，touch 保持第三人称（裁决点）。

## 4. 不推荐清单（一票否决理由存档）

| 对象 | 否决理由 |
|------|----------|
| 任何相机库整库引入（camera-controls / three-story-controls 等） | CAM 调研 §6 结论直接沿用：载具 FPV 是 ≤200 行自实现，引库换不到增量 |
| racing-game 式相机 parenting 进底盘 | 物理抖动/roll 全量直传（晕动症）+ 破坏 View 单出口与恒等通道审计 |
| PUBG Alt 自由环视 / FPV 鼠标 look | CAM 红线「用户不可接管相机」；FPV 朝向只能由车辆状态驱动 |
| racing-game sway/vibration 正弦抖动 | 网页场景晕动症高风险；本站已有 roll.kick（碰撞事件驱动）够用 |
| Mario-Kart-3.js 借码 | 无 LICENSE（法律不可借）+ R3F + IP 风险（CAM 调研同裁决） |
| SuperTuxKart 抄码 | GPL-3.0 传染；只借「分离平滑/速度标定」思路 |
| enable3d | LGPL-3.0 + 栈不符 |
| FPV 触发 theta 跟随改造第三人称 | 超范围：folio 固定 theta 是防晕决策，`drive_third` 保持零回归 |

## 5. 推荐方案摘要（交接 CC-VEH-DES / CC-VEH-VIEW）

**一句话**：`drive_third`（现行 View 逐位不动）+ `drive_fpv`（采样-平滑-输出新通道，
挂点数据入 CAM shot 注册表）双态，V 键即切、驾驶态限定、零新依赖、零鼠标接管。

| 项 | 推荐 | 依据 |
|----|------|------|
| 模式集 | `third ↔ fpv` 双态，V 即切 | §3.5 六样本对照 |
| FPV 实现 | 采样 `PlayerVehicle.position/quaternion` → 位置/旋转分离平滑 → 挂点本地偏移（起点参照 racing-game `(0.3,0.4,-0.1)` 换算本站 +X 车头口径）→ 输出 camera；roll 衰减/pitch 限幅 | Sketchbook/STK 模式 B（§3.3） |
| lookahead | 第三人称 focusPoint 前置偏移通道（`forward × Lmax × smoothstep(speed, 4, 24)`，0 恒等）；FPV 转向侧偏微量 | §3.4 |
| 防晕 | 水平线稳定 + 转向不甩镜头 + FOV kick 低速死区 + `reduced-motion` 全通道归零 | PUBG 反面教材 + Godot/Nesky |
| 恒等红线 | `fpvBlend=0`/`lookahead=0` 时逐位恒等（ritualCam 同范式同 order）；非驾驶态 V 无效；respawn 强制回 third | poster 合同 |
| 数据面 | `drive_fpv` 挂点偏移/平滑常数/侧偏系数进 `camera-shots.json`（CAM-C1 合流后接线，字段命名参照 Babylon FollowCamera 五参数） | CAM 调研模式一 |
| e2e 面 | V 切换位姿跳变断言 + 非驾驶态 V 零效果断言 + robot_idle 恒等回归；即切设计使断言免时序等待 | §3.5 第 3 条 |
| 成本 | View.ts 增 FPV+lookahead 通道 ~150–200 行；Player.ts 动作表 +1 行 + toggle 监听 ~10 行；**零新依赖** | 刻度：低 |
| 裁决点（DES） | ① FPV 挂点：座舱位 vs hood 位（取决于车模内饰资产）；② 即切 vs ≤200ms 短混合；③ touch 端 FPV 入口暂缺是否接受；④ FPV FOV 是否与 city 42° 分档 | §3.1/§3.5 |

---

*CC-VEH-RS · 只调研零实现：本分支仅新增本文档；未触碰 `src/`、`e2e/`、
`playwright.config.ts`、workflow 与像素基线。16 仓库星数/许可/活跃度为 2026-08-27
`gh api` 快照；Sketchbook/racing-game/Mario-Kart/Godot/STK/Babylon/folio-2025 结论
均以当日拉取的一手源码为证（行号见文内）；PUBG/GTA/CP2077 为闭源观察口径，
以官方支持页与控制表交叉核实。*
