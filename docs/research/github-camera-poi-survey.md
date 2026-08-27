# GitHub / 开源 3D 相机 & POI 深度调研（CC-CAM-RS）

| 项 | 内容 |
|----|------|
| 任务 | CC-CAM-RS：GitHub / 开源 3D 相机 & POI 调研（**只调研，零实现**） |
| 模型 | `claude-fable-5-thinking-xhigh` |
| 日期 | 2026-08-27（UTC） |
| 上游 | `cyber-city-camera-poi-research.md`（批次入口）· `loop-bl2-reaudit.md` §9 最小补洞 · `src/lab/world/view/View.ts`（city framing 纪律）· `docs/spec/implementation-roadmap-birdseye.md` G5 |
| 方法 | 22 仓库全部经 `gh api repos/{owner}/{repo}` 实测（星数 / SPDX 许可 / archived / 最近 push，2026-08-27 快照）；folio-2019/2025 直接读本仓库 `vendor/` 快照（commit 41046b5，MIT）；许可存疑者逐个拉 LICENSE 原文核验 |
| 下游 | CC-CAM-DES（shot schema 定稿）· CC-CAM-DATA（`camera-shots.json` + 投影审计脚本） |

## 0. 结论先行

1. **没有任何一个开源相机库值得整库引入**。三大候选各有一票否决项：
   `three-story-controls` 硬依赖 gsap 3.6.1（G5 点名红线）且 2023-10 起停更；
   `camera-controls` 的核心价值是用户输入接管（本站 G5 相机纪律明令禁止的那一半）；
   R3F 生态（drei / night-city / Mario-Kart-3.js）整族撞 G5 React 红线。
2. **真正的收成是三个数据模式而非代码**：① 命名 shot 注册表（NYT `StoryPointMarker` ×
   Cesium `HeadingPitchRange` 语法）；② 相机状态入 URL 的深链先例（MapLibre `hash` /
   `<model-viewer>` 属性 / Potree annotation）；③ 「编辑期产 JSON、运行时只读回放」的
   authoring/runtime 分离（NYT CameraHelper / Theatre.js / nerfstudio 三家同构）。
3. **folio 血统已在本仓库**：folio-2019 `Camera.angle.items` 命名机位 → folio-2025
   `cinematic.start(position, target)` progress-lerp 通道，都是 MIT 且 vendor 快照在手；
   本站 `View.ts` 的 `ritualCam`（dollyIn/shakeY 恒等通道）已经验证过「附加相机通道 +
   IEEE 恒等保 poster」的施工范式，shot 通道照此扩即可，**无需任何新依赖**。
4. 对 BL2 双 NO-GO 的直接回应：数据驱动 shot = **确定性 settled 帧**（无收敛等待、无
   输入抖动），每条 shot 可挂 NDC 投影审计探针——正中 `loop-bl2-reaudit.md` §9
   「settled fixed camera 前后帧同参可复现」的取证口径。

## 1. 红线与评审口径（先立秤再称重）

| 红线 | 出处 | 对本调研的含义 |
|------|------|----------------|
| G5 依赖红线 | `implementation-roadmap-birdseye.md` G5：不引 React/R3F、Lenis、Tailwind；GSAP 仅专项审批；gsap/howler/tweakpane 点名（`full-entry-world-proposal-roadmap.md` §「明确不做」、`cyber-city-eng-wave1-notes.md`） | R3F 系整族出局；依赖 gsap 的库不能整库引入；tweakpane 连 debug 面板也不引 |
| 相机纪律 | `cyber-city-camera-poi-research.md` §5：禁止 `camera-controls` 式用户 free 漫游 | 输入→相机的映射能力（各 controls 库的主体价值）全部不可用；只允许**数据驱动预设镜头** |
| poster 合同 | `View.ts` ritualCam 注释：dollyIn=0 时 ×1 IEEE 逐位恒等，robot_idle 首幕零漂移 | 任何 shot 通道必须保持 shot=null → 恒等；改 ritual 机位 = poster 三面重拍门禁 |
| 取证纪律 | `loop-bl2-reaudit.md` §9 | shot 帧须 settled、前后同参（position/FOV/viewport）、whole-frame 可读 |
| 本任务边界 | 任务书 | 禁改 `src/`、`e2e/`、`playwright.config.ts`、workflow；零业务代码 |

接入成本刻度：**零**（已 vendor / 已是依赖）｜**低**（≤100 行自实现、零新依赖）｜
**中**（新增运行时依赖，须 SRD 第 6 章登记 + PR 预算行）｜**高**（栈不兼容 / 需改架构）。

## 2. 总表（22 仓库，gh api 2026-08-27 实测）

### 2.1 相机控制 / 编排库

| 仓库 | 许可 | 星 | 最近 push | 可借鉴 API / 模式 | 红线冲突 | 接入成本 | 裁决 |
|------|------|---:|-----------|-------------------|----------|----------|------|
| [nytimes/three-story-controls](https://github.com/nytimes/three-story-controls) | Apache-2.0（LICENSE 已核） | 270 | 2023-10-06（停更） | `StoryPointMarker {position, quaternion, duration=1, ease='power1', useSlerp}`；`StoryPointsControls.goToPOI(i)/nextPOI()`；`CameraRig.do(Pan/Tilt/Roll/Pedestal/Truck/Dolly)`；**CameraHelper 录机位 → 导出 JSON → 控制方案消费** | **硬依赖 gsap 3.6.1**（G5）；自带 FreeMovementControls（禁用面） | 依赖不可行；**仅借 schema 与工作流**（低） | ⭐ 模式推荐 / 依赖不推荐 |
| [yomotsu/camera-controls](https://github.com/yomotsu/camera-controls) | MIT | 2,422 | 2026-02-02（活跃） | `setLookAt(px,py,pz,tx,ty,tz,transition)`、`fitToBox/fitToSphere`、`saveState/reset`、`smoothTime`（默认 0.25s 阻尼）、`transitionstart/rest/sleep` 事件语义 | 主体价值 = 鼠标/触摸接管相机（G5 相机纪律禁用面）；programmatic 那一半 View.ts 已有等价基建 | 不引依赖；借 `setLookAt`+`fitToBox`+`rest` 三个语义自实现（低） | 模式推荐 / 依赖不推荐 |
| [theatre-js/theatre](https://github.com/theatre-js/theatre) | Apache-2.0 | 12,634 | 2024-08-14（放缓） | **@theatre/studio（仅开发期）可视化编 keyframe → project state JSON → @theatre/core 生产回放**；authoring/runtime 硬分离 | studio 是重 React 应用（G5）；core 也是新运行时依赖（中） | 仅借「编辑器产 JSON、运行时只读」范式（零） | 模式推荐 / 依赖不推荐 |
| [vanruesc/spatial-controls](https://github.com/vanruesc/spatial-controls) | Zlib | 52 | 2026-08-20（活跃） | 轻量 spherical 控制器 + 键鼠移动；体量小可读性好 | 同样以用户输入为主体；能力被 View.ts 覆盖 | 无需（—） | 不推荐（无增量） |
| [cocopon/tweakpane](https://github.com/cocopon/tweakpane) | MIT | 4,579 | 2026-03-15（活跃） | folio-2025 debug 面板底座（+ essentials/camerakit 插件）；binding/折叠面板/插件生态 | **G5 点名红线依赖**（连 devDependency 进 bundle 的路径都要防） | 不引；debug 导出用原生实现替代（低） | 不推荐（红线点名） |

### 2.2 folio 血统（本仓库 vendor 快照在手，MIT）

| 仓库 | 许可 | 星 | 最近 push | 可借鉴 API / 模式 | 红线冲突 | 接入成本 | 裁决 |
|------|------|---:|-----------|-------------------|----------|----------|------|
| [brunosimon/folio-2025](https://github.com/brunosimon/folio-2025) | MIT | 1,772 | 2026-04-07 | `View.cinematic` progress-lerp 通道（§4.1 逐行解剖）；`#debug` 工作流（§4.3）；区域进站 `inputs.filters` 换挡 | 其 free 相机（camera-controls + V 键）与 gsap 补间是禁用面 | **零**（vendor + View.ts 同源移植已完成主干） | ⭐ 强推荐（模式层） |
| [brunosimon/folio-2019](https://github.com/brunosimon/folio-2019) | MIT | 4,736 | 2024-05-25 | `Camera.angle.items = { default: Vector3, projects: Vector3 }` + `angle.set(name)` 2s 补间——**命名机位注册表的血统原点**；`easing 0.15` 目标缓动 | gsap 补间（换 ticker 缓动）；dat.GUI debug | 零（vendor 在手） | ⭐ 强推荐（模式层） |

### 2.3 POI / 深链 / 自动取景先例（跨领域，模式价值最高）

| 仓库 | 许可 | 星 | 最近 push | 可借鉴 API / 模式 | 红线冲突 | 接入成本 | 裁决 |
|------|------|---:|-----------|-------------------|----------|----------|------|
| [CesiumGS/cesium](https://github.com/CesiumGS/cesium) | Apache-2.0 | 15,609 | 2026-08-27（活跃） | `camera.flyTo({destination, orientation:{heading,pitch,roll}, duration, easingFunction})`；`viewer.flyTo(entity, offset: HeadingPitchRange)`——**anchor + 球坐标偏移自动推算机位**，与本站 `spherical` 同构 | 库本身是 GIS 巨兽，不可能引入 | 仅借 shot 语法（零） | ⭐ 模式推荐 |
| [maplibre/maplibre-gl-js](https://github.com/maplibre/maplibre-gl-js) | BSD-3-Clause（LICENSE 已核） | 11,457 | 2026-08-26（活跃） | 构造参数 `hash: true` → **相机状态入 URL fragment**（zoom/center/bearing/pitch，可分享可回放）；`flyTo/easeTo/jumpTo` 三档转场语义 | 无（不引库，借 URL 语义） | 零 | ⭐ 模式推荐 |
| [google/model-viewer](https://github.com/google/model-viewer) | Apache-2.0 | 8,213 | 2026-07-07（活跃） | **声明式相机**：`camera-orbit="45deg 55deg 2.5m"` + `camera-target` + `interpolation-decay`——「一条属性字符串 = 一个可复现镜头」 | Web Component 运行时，不适配 Game 循环 | 仅借属性化 shot 表达（零） | 模式推荐 |
| [potree/potree](https://github.com/potree/potree) | 自定义 BSD 系（NOASSERTION，引用前逐条核） | 5,585 | 2026-01-08 | Annotation = `{position, cameraPosition, cameraTarget}` 三元组，点击标注即 flyTo——**「POI 自带机位」的数据形态**，恰是本站 `?poi=` 缺的那一半 | 无（借数据形态） | 零 | ⭐ 模式推荐 |
| [nerfstudio-project/nerfstudio](https://github.com/nerfstudio-project/nerfstudio) | Apache-2.0 | 11,934 | 2025-07-29 | viewer 里可视化编相机路径 → **camera_paths JSON**（keyframes 矩阵 + fov + fps + seconds）→ 离线确定性渲染 | Python 栈（无关） | 仅借 JSON schema 与「编辑/回放分离」（零） | 模式推荐 |

### 2.4 第三人称 / 城市跟随相机实现样本

| 仓库 | 许可 | 星 | 最近 push | 可借鉴 API / 模式 | 红线冲突 | 接入成本 | 裁决 |
|------|------|---:|-----------|-------------------|----------|----------|------|
| [cyrus2281/night-city](https://github.com/cyrus2281/night-city) | BSD-3-Clause | 9 | 2024-09-11 | 开源可跑的赛博城市 + 彩蛋式 POI 玩法（rubric 62° 锚样本）；进楼/彩蛋触发圈设计可参 | **R3F + drei + rapier 全家桶**（G5） | 只看不借码（—） | 玩法参考 / 代码不推荐 |
| [swift502/Sketchbook](https://github.com/swift502/Sketchbook) | MIT | 1,748 | 2024-10-10（**archived**） | `CameraOperator`：角色/载具切换时的相机交接、theta/phi 跟随——上下车镜头交接是本站 drive↔poi 切换的参照 | archived 无维护；cannon.js 旧栈 | 仅读实现思路（零） | 参考（谨慎） |
| [simondevyoutube/ThreeJS_Tutorial_ThirdPersonCamera](https://github.com/simondevyoutube/ThreeJS_Tutorial_ThirdPersonCamera) | MIT | 65 | 2020-11-16 | 帧率无关跟随插值 `t = 1 - 0.001^dt` 的教学最小样本 | 无 | View.ts 已有等价（—） | 不推荐（无增量） |
| [yomotsu/meshwalk](https://github.com/yomotsu/meshwalk) | MIT（package.json 已核） | 306 | 2026-08-25（活跃） | TPS 相机 + 角色控制器 + 相机遮挡处理的轻量组合 | 输入接管主体（G5 纪律） | 无需（—） | 不推荐（无增量） |
| [mustache-dev/Mario-Kart-3.js](https://github.com/mustache-dev/Mario-Kart-3.js)（原 Lunakepio） | **无 LICENSE** | 4,582 | 2025-12-26 | 卡丁车跟随相机 + 速度 FOV kick 的观感参照 | **无许可 = 法律上不可借码**；R3F；任天堂 IP 风险 | 禁止（—） | ❌ 不推荐 |

### 2.5 声明式 / 引擎级（视野拉宽用）

| 仓库 | 许可 | 星 | 最近 push | 可借鉴 API / 模式 | 红线冲突 | 接入成本 | 裁决 |
|------|------|---:|-----------|-------------------|----------|----------|------|
| [mrdoob/three.js](https://github.com/mrdoob/three.js) | MIT | 114,828 | 活跃 | `examples/jsm/cameras/CinematicCamera`（DOF 机位）；`THREE.CameraHelper`（folio debug 同款视锥可视化）；`setFromSphericalCoords`（View.ts 正在用） | 无（已是依赖） | 零 | 已在用 |
| [pmndrs/drei](https://github.com/pmndrs/drei) | MIT | 9,821 | 2026-08-25（活跃） | `<Bounds fit>`（点击自动取景）、`<MotionPathControls>`（曲线运镜）、`<CameraShake>` 的能力清单 = 相机需求 checklist | **R3F**（G5） | 仅当能力目录读（零） | 目录参考 / 代码不推荐 |
| [BabylonJS/Babylon.js](https://github.com/BabylonJS/Babylon.js) | Apache-2.0 | 25,985 | 2026-08-26（活跃） | `FramingBehavior`：按 mesh 包围盒自动推算半径/仰角把目标框满（`fitFootprint: true` 的引擎级先例，含 `framingTime` 等参数化） | 引擎不可换 | 仅借取景算法思路（零） | 模式推荐 |
| [aframevr/aframe](https://github.com/aframevr/aframe) | MIT | 17,616 | 2026-07-13（活跃） | `<a-entity camera>` rig 实体化 + animation 组件补间——「相机 rig 是数据不是代码」的声明式佐证 | 自带完整运行时 | 无需（—） | 概念参考 |
| [lume/lume](https://github.com/lume/lume) | MIT | 1,515 | 2026-05-05（活跃） | `<lume-camera-rig>` HTML 属性驱动相机 rig | 自带运行时；生态年轻 | 无需（—） | 概念参考 |

**计数**：2.1×5 + 2.2×2 + 2.3×5 + 2.4×5 + 2.5×5 = **22 仓库** ≥ 15 ✅

## 3. 重点深读：三家「shot 数据」同构证据

三个互不相识的团队收敛到同一个形态——**镜头是数据，编辑器只在开发期存在**：

| 项目 | 编辑期工具 | 数据载体 | 运行时消费者 |
|------|-----------|----------|--------------|
| NYT three-story-controls | CameraHelper（场景内录机位） | 导出 JSON（POI 数组 / AnimationClip） | StoryPoints/PathPoints controls |
| Theatre.js | @theatre/studio（React UI，仅 dev） | project state JSON | @theatre/core 无 UI 回放 |
| nerfstudio | viewer 相机路径编辑器 | camera_paths JSON（keyframes+fov+times） | 离线渲染器确定性出帧 |

`StoryPointMarker` 是与本站需求距离最近的最小 schema：

```ts
interface StoryPointMarker {
  position: Vector3        // 机位
  quaternion: Quaternion   // 朝向
  duration?: number        // 转场时长，默认 1
  ease?: string            // 缓动，默认 'power1'
  useSlerp?: boolean       // 旋转球面插值，默认 true
}
```

本站的差异化改造点（供 CC-CAM-DES）：不存绝对 `position/quaternion`，存
**anchor 引用 + 球坐标偏移**（`{ anchor: 'building:concept-garage', spherical: {radius, phi, theta}, lookAtHeight, lateral }`），
理由有三：① 与 `View.ts` 现有 `spherical/lookAtHeight/lateral` 参数系逐字段同构，消费代码最短；
② 楼体坐标改动（Blender 批次）时 shot 自动跟随，不产生第二事实源——这正是 Cesium
`viewer.flyTo(entity, HeadingPitchRange)` 而非 `camera.flyTo(绝对坐标)` 的取舍；
③ 球坐标参数可直接进投影审计脚本复算 NDC。

## 4. 对标三题（任务书点名）

### 4.1 folio-2025 进站 tween（vendor 一手源码，`sources/Game/View.js` L422–460 / L727–734）

机制解剖：

1. `cinematic.start(position, target)`：gsap 把标量 `cinematic.progress` 0→1（1.5s
   `power2.inOut`），同时把 `cheapDOFPass.strength` 补到 0（进站时景深让位于清晰展示）；
2. 每帧末段（跟随相机解算完之后）：dummy 相机摆到 shot 位 → `defaultCamera.position.lerp(dummy, progress)` +
   `quaternion.slerp(dummy, progress)`——**progress=0 时逐位恒等，通道天然可叠加**；
3. 宽高比补偿：`ratioOverflow > 0` 时机位沿视轴退 `ratioOverflow × 10`m（窄屏不裁主体）——
   与 View.ts `nonIdealRatioOffset 9` 同源同思路；
4. 进站同时 `inputs.filters` 从 `wandering` 换 `cinematic`（驾驶输入被滤除，非禁用相机——
   出站 `cinematic.end()` progress→0（1s）还原，玩家位置从未被相机动过）；
5. 触发方：`LabArea/ProjectsArea` 的 boundingIn/交互回调，机位数据是区域自己的
   `this.cinematic.position/target`——**每个 POI 区域自带机位**（Potree annotation 同构）。

对本站的移植结论：该通道**不需要 gsap**——progress 是单标量，`ticker.delay` + 手写
`power2.inOut`（Reveal.ts 已有先例）即可驱动；且 View.ts `ritualCam` 已验证过
「order-4 写入、order-7 消费、零值恒等」的同帧通道范式，shot 通道是它的直接推广。

### 4.2 Orion 俯拍进站（闭源，观察口径）

[Cyber City Orion](https://orion.adrianred.com)（Adrian Red，Awwwards HM 2025-09-23，
FWA/CSSDA SOTD；rubric v1.1 的 88° 锚）不开源，只能按公开材料 + 实访对标：

- **节奏成套**：Preloader → Intro Transition（自动运镜俯扫全城天际线）→ 落到探索模式
  （WASD/飞行）。Awwwards 元素页把 Preloader 与 Intro Transition 单独列为获奖元素——
  **进站运镜本身就是评分面**，不是过场成本；
- 俯拍开场先给 whole-frame 城市轮廓（V1 「任一帧可当海报」的 90+ 锚点行为），再交出
  控制权——先证明世界可读，再让用户动；
- 对本站映射：`ritual_idle`（恒等首幕，poster 合同）之后、交互开始之前，可选一条
  `city_overview` 俯拍 shot 作为 `?shot=` 深链专用帧——**BL2 的「东向楼群不入帧」在
  俯拍帧里是零成本可解的**（不动 ritual、不碰 poster）；
- 纪律差异：Orion 的自由飞行/跳伞是 G5 禁用面，借的是「入场运镜编舞」不是漫游。

### 4.3 Bruno `#debug` 工作流（vendor 一手源码）

folio-2025 的调机位闭环（`sources/data/consoleLog.js` L36-37、`Game/Debug.js`、`Game/View.js` L402-410）：

1. URL 加 `#debug` 重载 → Tweakpane 面板挂载（+ essentials/camerakit 插件）；
2. `V` 键切 `MODE_FREE`：camera-controls 自由机（`smoothTime 0.075`、`dollySpeed 0.2`）
   飞到想要的角度；`THREE.CameraHelper` binding 可视化默认相机视锥对照；
3. 面板逐参数微调（View 的 spherical/zoom 全部有 binding）→ 读数抄回代码；
4. 同族 hash 开关：`#inspector`（three.js Inspector）、`#stats`、`#skip`（快进 Reveal）。

本站授权替代（不引 tweakpane、不引 camera-controls）：

- 现有先例：本站已有 hash/query 开关族（`?poi=`、quality 档）；debug 面板在移植时
  被明确砍除（View.ts 头注），**不应回引**；
- 最小闭环 = `#camdebug` 下开放键盘微调 shot 参数（±phi/theta/radius/lookAtHeight）
  + `copy(JSON.stringify(shot))` 控制台导出 → 粘进 `camera-shots.json` → 投影审计脚本
  复算 NDC 通过后入库。编辑器只活在 debug hash 里，生产 bundle 零增量——与 §3 三家
  「编辑期产 JSON」范式对齐，成本 ≤100 行且可 tree-shake（dev-only import）。

## 5. 三条最可落地模式（数据驱动 shot JSON > 运行时 free cam）

### 模式一：`camera-shots.json` 命名机位注册表（anchor + 球坐标，非绝对坐标）

- **先例**：folio-2019 `angle.items`（血统原点）→ NYT `StoryPointMarker`（duration/ease/slerp
  字段齐）→ Cesium `HeadingPitchRange`（anchor 相对化）→ Babylon `FramingBehavior`
  （`fitFootprint` 自动取景）。
- **形态**：每条 shot = `{ anchor, spherical{radius,phi,theta}, lookAtHeight, lateral, fov?, duration, ease }`；
  anchor 支持 `spawn | parkingBay:{id} | building:{id} | world`——与 View.ts 参数系逐字段
  同构，与 `cyber-city-buildings.json` 单源联动（楼动 shot 跟）。
- **纪律扣位**：`ritual_idle` 不进补间通道，shot=null → View 现行为逐位恒等（poster 合同）；
  shot 通道复用 `ritualCam` 的 order/恒等范式；FOV 改动默认禁止（42° 是 city 合同参数），
  确需 per-shot FOV 由 DES 单独裁决。
- **落地面**：CC-CAM-DATA 出 JSON + schema 校验；CC-CAM-VIEW 消费（预估 ≤120 行，含
  progress 缓动，零新依赖）。

### 模式二：`?poi=&shot=` 深链 = 相机状态单源（URL 即可复现帧）

- **先例**：MapLibre `hash: true`（相机五参数入 URL fragment，行业最久经考验的相机深链）；
  `<model-viewer>` `camera-orbit` 属性字符串；Potree annotation 的 POI+机位三元组。
- **形态**：`?poi=concept-garage&shot=showcase` → 出生进 parkingBay（现行 Areas.ts 行为
  不变）+ 相机直落 `building_showcase` shot（settled、确定性、零收敛等待）。shot 缺省时
  行为与今日完全一致（零回归面）。
- **为什么这是 BL2 补洞的正解**：`loop-bl2-reaudit.md` §9 要求「固定 `?poi=work-gallery`
  场地 + settled 同参前后帧 + whole-frame 可读」——深链直落 shot 帧天然满足全部三条，
  且每条 shot 可预挂 NDC 投影探针（指定楼八角点入帧断言），把「审计员肉眼判帧」升级为
  「机器先验 + 肉眼复核」。e2e/VIS 基线若需新增固定帧用例，须按纪律走独立任务书。
- **落地面**：CC-CAM-DATA 投影审计脚本（tools/camera/，Node 侧复算投影矩阵，不跑浏览器）；
  CC-CAM-VIEW 接 `?shot=` 解析。

### 模式三：debug 导出闭环（编辑期产 JSON，运行时只读）

- **先例**：NYT CameraHelper（录 → 导 JSON → 控制方案消费）、Theatre.js（studio 仅 dev）、
  nerfstudio（viewer 编辑 → JSON → 确定性渲染）、Bruno `#debug`（§4.3）。
- **形态**：`#camdebug` hash 下键盘微调当前 shot 球坐标 + 控制台导出 JSON；不引
  tweakpane / camera-controls / lil-gui，任何指针拖拽接管一律不做（G5 相机纪律的
  「用户不可接管」在 debug 模式同样成立——微调走离散键step，不走 free cam）。
- **优先级**：P2（三条中最低）；没有它 shot 数值也能靠投影审计脚本反推，先 DATA/VIEW
  后工具链。

## 6. 不推荐清单（一票否决理由存档）

| 对象 | 否决理由 |
|------|----------|
| three-story-controls 整库 | gsap 3.6.1 硬依赖（G5 点名）+ 2023-10 停更 + 自带 free 漫游面 |
| camera-controls 整库 | 主体价值 = 用户输入接管（相机纪律禁用面）；programmatic 面 View.ts 已有等价物；引入即背上 SRD 登记 + 预算行成本换不到增量 |
| tweakpane（含 debug-only） | G5 点名红线；folio 工作流可用原生键盘+console 等价替代 |
| drei / night-city / Mario-Kart-3.js 等 R3F 族 | React/R3F 红线；Mario-Kart 另有**无 LICENSE**（法律不可借码）+ 任天堂 IP 双重风险 |
| Sketchbook 代码级复用 | 仓库已 archived；cannon.js 旧栈；只读思路 |
| gsap（随任何库夹带） | 仅专项审批；本批次诉求（单标量 progress 缓动）用 ticker + 手写缓动即覆盖，无审批必要 |
| 运行时 free cam（任何形式） | G5 相机纪律；folio 自身也把 free cam 锁在 `#debug` 后——竞品同样不给用户 free cam |

## 7. 下一步交接

| 收件人 | 建议 |
|--------|------|
| **CC-CAM-DES** | 以 §3 差异化改造点 + §5 模式一为 schema 底稿定稿 `docs/spec/cyber-city-camera-shots.md`；必须裁决三件事：① per-shot FOV 是否开放（默认不开）；② `ritual_idle` 是否入注册表（建议入表但标记 `frozen: true`，消费侧跳过补间通道保恒等）；③ poster 影响矩阵（任何触碰 ritual 机位的 shot 一律标注重拍门禁） |
| **CC-CAM-DATA** | `src/data/camera-shots.json` 按模式一形态起步四条（`ritual_idle`/`poi_arrival`/`building_showcase`/`street_pullback`）；`tools/camera/` NDC 投影审计脚本先行（Node 复算 42° FOV/1440×900 下指定楼八角点投影），**先有探针再填数值**，避免 BL2 式「肉眼以为入帧」返工 |
| **CC-CAM-VIEW** | 消费通道复用 `ritualCam` 范式（order-4 写、order-7 消费、零值恒等）；`?shot=` 缺省零回归；禁动 e2e/VIS-03 基线（需新固定帧用例走独立任务书） |
| 审计（CC-AL-CAM） | 专项门建议：指定楼 NDC 八角点入帧断言 + settled 同参前后帧 + e2e 52/52 + VIS-03 合同零漂移 |

---

*CC-CAM-RS · 只调研零实现：本分支仅新增本文档；未触碰 `src/`、`e2e/`、
`playwright.config.ts`、workflow 与像素基线。22 仓库星数/许可/活跃度为 2026-08-27
`gh api` 快照；folio 结论以本仓库 vendor 快照（commit 41046b5）为一手证据。*
