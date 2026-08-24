# folio 差距与复用报告：当前实现 vs folio-2025 / folio-2019

> **一句话定位**：`bruno-simon-folio-source-teardown.md` 回答「folio 是什么、怎么造的」；本文回答「我们已经搬了什么、还缺什么、剩下的每一件怎么搬、搬多少」。原则只有一条——**能利用的都利用**，每一项都标注 MIT 合规口径与改写量。

## 0. 文档信息

| 项 | 值 |
|---|---|
| 版本 | v1.0 |
| 日期 | 2026-08-24 |
| 作者 | 云端子代理（技术架构师角色） |
| 上游依赖 | `bruno-simon-folio-source-teardown.md`（源码拆解）、`bruno-simon-teardown-adaptation.md`（Hybrid 决策）、`docs/spec/SRD.md` v1.1（§12.7 world 专章）、`docs/spec/implementation-roadmap-birdseye.md`（§7 Spike 执行清单） |
| 服务对象 | Track B 全部三个 Phase（A Spike / B 最小可玩 / C 完整版）的施工者 |

### 0.1 对照基线（本文全部行号与体积的出处）

| 仓库 / 分支 | commit | 日期 | 规模 |
|---|---|---|---|
| `vendor/folio-2025` | `41046b5` | 2026-04-07 | sources/ 148 文件；Game 代码 20,418 行；static/ 197MB |
| `vendor/folio-2019` | `540f135` | 2024-05-06 | src/javascript 47 文件，约 5,900 行（World 层）+ 材质/Pass；static/ 18MB |
| 本仓库基线 | `62740fb`（= `cursor/bruno-implementation-plan-1d6f` tip，main 的直系后代） | 2026-08-24 | Lab 基建（manifest/contracts/facade + 2 模块）已合入 |
| 本仓库 WIP | `cursor/world-spike-engine-1d6f` 工作区（写作时暂存于 stash：`world-spike engine WIP`） | 2026-08-24 | `src/lab/world/` 13 文件 1,758 行 TS + 构建配置 |

> ⚠️ 写作时 world-spike 的 13 个文件尚未 commit（被 e2e QA 子代理暂存进 stash）。本文按其内容如实盘点；**第一优先级行动是把这批文件落成 commit**（见 §11 风险 R1）。

### 0.2 术语与改写量分级（全文统一口径）

| 级别 | 定义 | 例 |
|---|---|---|
| **零** | 逐行照抄，仅加 TypeScript 类型/改 import 路径 | `Events.ts`、`ObservableSet.ts` |
| **低** | 行级改动 < 20%：去 Game 单例耦合、接 AbortSignal、砍 Debug 面板 | `Viewport.ts`、`Physics.ts` |
| **中** | 改动 20–60%：砍子系统、换依赖（gsap→手写缓动）、结构重排 | `Ticker.ts`（delay 替代 gsap）、`Player.ts`（计划） |
| **高** | 改动 > 60% 或仅保留思想重写 | `World.ts`（灰盒自建）、`Audio`（WebAudio 重写） |
| **不搬** | 明确排除，只留档理由 | `Server.js`、BGM 曲库 |

---

## 1. 执行摘要

1. **完成度**：roadmap §7.1 的 14 项必抄清单中，**11 项已落地**（Events / Ticker / Viewport / Quality / ResourcesLoader / Objects / Physics / Rendering / Keyboard / Pointer / Nipple，附带 maths 子集 + ObservableSet）。剩余 **3 项硬缺口**：`Game.ts`（编排器，4 个文件的 import 悬空指向它）、`Inputs.ts`（动作表编排器，Nipple 的类型依赖悬空）、`Player.ts + View.ts + PhysicsVehicle.ts` 三大件（车开起来的全部剩余条件）。另有 `/world-spike/` 壳页与 `index.ts` mount 入口未建。
2. **当前工作区编译不过是预期状态**：`Objects.ts` 读 `game.view.optimalArea`、`Rendering.ts` 读 `game.view.camera`，View 未移植前这些引用无法解析。缺口拓扑见 §2.2。
3. **复用规模测算**：folio-2025 两万行 Game 代码中，Spike 还需搬 ~2,600 行源码（→ 预计 ~1,700 行 TS），Phase B 追加 ~1,900 行（POI/地图/标牌），Phase C 追加 ~1,100 行（音效结构/昼夜）。合计全程复用 folio 源码约 **7,500 行 / 37%**，其余为明确不搬（运营层、天气装饰、多人服务）或自建（灰盒世界、morph）。
4. **资产口径**：MIT 文本名义上覆盖两仓库全部内容，但**只搬工程性资产**（解码器已内置无需搬、键位图标、少量 SFX 候选），**不搬内容性资产**（BGM 148MB 第三方版权穿透风险、Bruno 个人项目截图/品牌物料）。车模已定 CarConcept 复用豁免路线，folio 车模仅作开发期对照。
5. **Phase 裁决确认**：音效 = **Phase C**（roadmap B3 白纸黑字）；成就 = **规划外，列 Phase C 后备**（机制可 150 行低成本搬，数据阀门通过后再议）；排行榜/多人 = **永久不做**（静态托管无后端 + 依赖红线 + 隐私）。

---

## 2. 我们当前实现盘点

### 2.1 已移植文件对照（13 文件，1,758 行 TS ← folio 1,983 行源码）

| 我们的文件 | 行数 | folio-2025 源 | 源行数 | 改写量 | 关键改动 |
|---|---|---|---|---|---|
| `src/lab/world/core/Events.ts` | 51 | `sources/Game/Events.js` | 64 | 零 | 仅加类型；order 稀疏数组时序机制原样保留 |
| `src/lab/world/core/Ticker.ts` | 101 | `sources/Game/Ticker.js` | 71 | 中 | `scale=2` 全局倍速保留（手感参数标定基准）；`gsap.delayedCall` → 自写 `delay()`；新增 TSL uniform 四件套跟随 r185 |
| `src/lab/world/core/Viewport.ts` | 57 | `sources/Game/Viewport.js` | 48 | 低 | 去单例；resize 接 `AbortSignal`；`pixelRatioMax` 参数化（移动端 DPR 1.5 封顶） |
| `src/lab/world/core/Quality.ts` | 22 | `sources/Game/Quality.js` | 48 | 低 | 去 Debug 面板；level 0/1 语义原样 |
| `src/lab/world/core/ResourcesLoader.ts` | 126 | `sources/Game/ResourcesLoader.js` | 123 | 低 | loader 解码器路径改 r185 内置 `import.meta.url` 解析；修复空清单永不 resolve |
| `src/lab/world/core/Objects.ts` | 335 | `sources/Game/Objects.js` | 362 | 低 | Blender 命名约定（`physical/dynamic` + `trimesh*/hull*/cuboid*/tube*/ball*`）原样；Materials 钩子留位 no-op；`water.depthElevation` → `world.killElevation` |
| `src/lab/world/inputs/Keyboard.ts` | 52 | `sources/Game/Inputs/Keyboard.js` | 49 | 低 | 接 AbortSignal；blur 全键抬起、输入框吞键保留 |
| `src/lab/world/inputs/Pointer.ts` | 190 | `sources/Game/Inputs/Pointer.js` | 195 | 低 | upcoming/current 双缓冲、多指平均、pinch 全保留 |
| `src/lab/world/inputs/Nipple.ts` | 307 | `sources/Game/Inputs/Nipple.js` | 278 | 中 | TSL 环形 shader 摇杆保留；gsap jump 补间 → ticker 驱动两段缓动 |
| `src/lab/world/physics/Physics.ts` | 337 | `sources/Game/Physics/Physics.js` | 313 | 低 | 碰撞分组/getPhysical 工厂/contactForce 回调保留；砍水体阻尼；新增 `cone` shape；补 `free()` |
| `src/lab/world/rendering/Rendering.ts` | 88 | `sources/Game/Rendering.js` | 184 | 中 | 砍后处理（bloom/cheapDOF）与 Inspector；补 pause/resume/dispose（mount 契约）；`?gl=1` 强制回退 |
| `src/lab/world/utils/maths.ts` | 55 | `sources/Game/utilities/maths.js` | 184 | 中 | 只搬 `/world/` 已用子集（clamp/remap/lerp/smoothstep/smallestAngle）；**缺 `circleIntersectsPolygon`/`segmentCircleIntersection`（Phase B frustum 判定要补）** |
| `src/lab/world/utils/ObservableSet.ts` | 37 | `sources/Game/utilities/ObservableSet.js` | 41 | 零 | 仅加泛型 |

**已建立的移植纪律**（后续文件必须延续）：每文件头部注明「移植自 folio-2025 `sources/...`（N 行）+ 改动清单」；去 Game 单例改构造注入；浏览器事件监听一律接 `AbortSignal`；gsap/howler 等红线依赖以手写等价物替代。

### 2.2 悬空引用拓扑（当前编译缺口的完整清单）

```text
core/Game.ts          ← 被 Objects / ResourcesLoader / Physics / Rendering / Nipple 以 import type 引用（未创建）
inputs/Inputs.ts      ← 被 Nipple 引用 InputAction 类型（未创建）
view/View.ts          ← Objects.update() 读 game.view.focusPoint / optimalArea；Rendering.render() 读 game.view.camera（未创建）
world/World.ts        ← Objects 读 game.world.killElevation（未创建）
player/Player.ts      ← Zones.update() 将读 game.player.position（Zones 也未搬）
```

即：**`Game.ts` + `Inputs.ts` + `View.ts` + `World.ts`（灰盒版）四件落地，工作区才能第一次编译通过**；`Player.ts + PhysicsVehicle.ts` 落地才能上车。

### 2.3 Lab 基建的复用面（world 不是从零开始的第 3 个理由）

| 既有资产 | 行数 | world 如何吃到 |
|---|---|---|
| `src/lab/contracts.ts` | 124 | `budgetClass:'world'`、`kind:'world'`、`mode:'world'` 已在 schema 中预留（SRD v1.1 S2/S3 修订）；world 模块照常写 `mount()` 默认导出 |
| `src/lab/facade.ts` | 251 | 视口+idle 懒挂载、reduced-motion/Save-Data 拦截、pause/resume（visibilitychange + IntersectionObserver）、`astro:before-swap` dispose、进度条/后端徽章/埋点——**world 壳页全部白拿，一行不用写** |
| `src/lab/manifest.json` | — | 新增 `slug:'world-spike'` 条目即完成注册（entry 指 `world/index.ts`，`deepLinkParams:['gl']`） |
| `modules/car-configurator/engine.ts` | — | KTX2/Draco loader 就地修饰、`detectSupport` 类型断言、WebGPU→WebGL2 徽章上报——`ResourcesLoader.ts` 已抄同款写法 |
| `public/models/car-concept/` | 3.5MB | Spike 车模显式豁免复用（审计 P0-2 裁决），零新增资产 |

### 2.4 构建配置与依赖已就位（WIP 中）

- `astro.config.mjs`：`vite-plugin-wasm` + `vite-plugin-top-level-await`（Rapier wasm 必需，对应 folio-2025 `vite.config.js` L28-30）；`optimizeDeps.exclude:['@dimforge/rapier3d']`；sitemap 过滤 `/world-spike/`。
- `package.json`：`@dimforge/rapier3d ^0.20.0`（folio 同款物理引擎）；three `^0.185.1`（folio-2025 用 `^0.183.2`，版本差异风险见 §11 R3）。
- **依赖红线执行情况**：folio-2025 的 gsap / howler / msgpack-lite / uuid / tweakpane 全部未引入，等价物均为手写 ✔。

---

## 3. 模块对照总表（folio 有 / 我们有 / 缺口 / 复用方式）

> 「2019 对应」列标注 folio-2019 的等价文件，仅当 2019 版有独立参考价值时展开。Phase 列 = 该模块进入我们代码库的时点；「—」= 不搬。

### 3.A 引擎核心

| folio-2025 模块（行数） | 2019 对应 | 我们现状 | 缺口 | 复用方式 / Phase |
|---|---|---|---|---|
| `Game.js`（276） | `Application.js`（294） | **无**（4 文件 import 悬空） | **P0** | 中改 → `core/Game.ts` ~120 行：两阶段异步 init 骨架照抄，系统清单换成我们的 11+6 件；启动四坑（intro filter / rendering.start 先行 / world.step(1) 后置 / wait(3) 再 reveal）直接编码。**Spike** |
| `Ticker.js`（71） | `Utils/Time.js` | ✅ 101 行 | 无 | 已完成 |
| `Events.js`（64） | `Utils/EventEmitter.js` | ✅ 51 行 | 无 | 已完成 |
| `Viewport.js`（48） | `Utils/Sizes.js` | ✅ 57 行 | 无 | 已完成 |
| `Quality.js`（48） | —（2019 无分档） | ✅ 22 行 | 无 | 已完成 |
| `ResourcesLoader.js`（123） | `Resources.js` + `Utils/Loader.js`（250+） | ✅ 126 行 | 无 | 已完成（2025 版结构更优，2019 版不看） |
| `Objects.js`（362） | `World/Objects.js`（354） | ✅ 335 行 | 无 | 已完成 |
| `Time.js`（84，真实时钟/时区） | — | 无 | P3 | Phase C 昼夜联动才需要，低改。**C** |
| `Debug.js`（90，tweakpane） | dat.GUI | 无 | — | 不搬（红线依赖）；调试用 URL 参数 + console。**—** |
| `utilities/maths.js`（184） | — | ✅ 子集 55 行 | P1 | 补 `circleIntersectsPolygon`/`segmentCircleIntersection`/`safeMod`/`signedModDelta`（POI frustum 与循迹判定用），零改。**Spike 尾/B** |
| `utilities/ObservableSet.js`（41） | — | ✅ 37 行 | 无 | 已完成 |
| `utilities/ObservableMap.js`（27） | — | 无 | P2 | Inputs 移植若用到再零改搬。**Spike** |
| `utilities/time.js`（28，时长格式化） | — | 无 | P3 | 成就/里程展示才用。**C 后备** |
| `InstancedGroup.js`（119） | — | 无 | P2 | 锥桶批量渲染可用可不用；Phase B 装饰件（围栏/灯柱）必用，零改。**B** |

### 3.B 渲染

| folio-2025 模块（行数） | 2019 对应 | 我们现状 | 缺口 | 复用方式 / Phase |
|---|---|---|---|---|
| `Rendering.js`（184） | `Application.js` 内嵌 + `Passes/`（Blur/Glows） | ✅ 88 行（后处理砍） | 无 | 已完成 |
| `PreRenderer.js`（34，shader 预热） | — | 无 | P2 | 防首帧卡顿的关键小件，零改。**Spike 尾** |
| `Materials/MeshGridMaterial.js`（156，TSL 网格材质） | `shaders/floor/` GLSL | 无 | **P1** | 零改 → 灰盒地面直接是「folio 同款颜值」，替代自写网格贴图。**Spike** |
| `Materials/MeshDefaultMaterial.js`（135，globalColor/晕影钩子） | `Materials/Matcap.js` | 无 | P2 | Phase B 世界视觉统一时低改引入；Spike 用标准材质即可。**B** |
| `Materials.js`（366，材质注册表） | `World/Materials.js`（216） | 无（Objects 留了 no-op 钩子） | P2 | 中改 → Phase B 接回 `objects.updateMaterials`。**B** |
| `Ligthing.js`（214）/`Fog.js`（49） | — | 无 | P2 | 低改；Spike 用两盏灯硬编码，Phase B 引入。**B** |
| `Noises.js`（292，噪声纹理生成） | — | 无 | P3 | 水面/风才用。**—（除非 C 加视觉）** |
| `Passes/cheapDOF.js`（57） | `Passes/Blur.js` | 无 | — | 后处理已裁决砍除（§9.1 第 7 项）。**—** |
| `threejs-override.js`（three 原型补丁：`Object3D.copy` 跳过 children 等） | — | 无 | P1 | **必须逐条评估**：folio 靠它改变 `.copy()` 语义（不深拷子节点）。我们 `getFromModel` 已绕开该依赖，暂不需要；若移植 VisualVehicle 报怪异 bug 先查这里。**留档不搬** |

### 3.C 物理

| folio-2025 模块（行数） | 2019 对应 | 我们现状 | 缺口 | 复用方式 / Phase |
|---|---|---|---|---|
| `Physics/Physics.js`（313，Rapier） | `World/Physics.js`（824，Cannon.js） | ✅ 337 行 | 无 | 已完成（Rapier 路线；2019 Cannon 版仅作参数换算参考，source-teardown §5.4） |
| `Physics/PhysicsVehicle.js`（590，DynamicRayCastVehicleController） | `World/Physics.js` L300+ RaycastVehicle 段 | **无** | **P0** | 低改 → `physics/PhysicsVehicle.ts` ~450 行：底盘三 collider（mass 2.5 + `centerOfMass.y=-0.5`）、轮参表（`frictionSlip 0.9`/`sideFrictionStiffness 3`/悬挂 0.88/1.23/1.63）、两段式 tick（order 2 pre / 5 post）、30 帧滑动平均 dt——**参数原封不动起步**（roadmap §7.2 决策点 2）。**Spike** |
| `Physics/PhysicsWireframe.js`（58，调试线框） | — | 无 | P2 | 零改，`?debug=1` 才挂。**Spike 尾（可选）** |

### 3.D 输入

| folio-2025 模块（行数） | 2019 对应 | 我们现状 | 缺口 | 复用方式 / Phase |
|---|---|---|---|---|
| `Inputs/Inputs.js`（333，动作表+filters 编排） | `World/Controls.js`（652，混杂键触） | **无**（Nipple 类型悬空） | **P0** | 中改 → `inputs/Inputs.ts` ~180 行：actions Map + `ObservableSet` filters + 模式切换保留；V1 砍 Gamepad/Wheel/InteractiveButtons 的实例化（保留接缝）。**Spike** |
| `Inputs/Keyboard.js`（49） | 同上内嵌 | ✅ 52 行 | 无 | 已完成 |
| `Inputs/Pointer.js`（195） | 同上内嵌 | ✅ 190 行 | 无 | 已完成 |
| `Inputs/Nipple.js`（278，场景内 3D 摇杆） | 无（2019 用 DOM 摇杆） | ✅ 307 行 | 无 | 已完成 |
| `Inputs/Gamepad.js`（437） | — | 无 | P3 | Phase B/C 增强项，低改可搬。**C 后备** |
| `Inputs/Wheel.js`（16，滚轮缩放） | — | 无 | P2 | 零改 16 行，View.zoom 落地时顺手搬。**Spike 尾** |
| `Inputs/InteractiveButtons.js`（114，移动端屏上按钮） | — | 无 | P2 | 低改；移动端 POI「进入」按钮需要。**B** |
| `InputFlag.js`（216，输入设备旗标） | — | 无 | — | UI 提示用，价值低。**—** |
| `RayCursor.js`（219，射线点击/悬停管理） | — | 无 | P2 | 低改；Reveal 的「点击圆环开始」与 POI 点击都靠它。**B（Start here 若要点击启动则 Spike 尾）** |

### 3.E 玩家与相机

| folio-2025 模块（行数） | 2019 对应 | 我们现状 | 缺口 | 复用方式 / Phase |
|---|---|---|---|---|
| `Player.js`（676） | `World/Car.js`（389）+ Controls | **无** | **P0** | 中改 → `player/Player.ts` ~200 行：保留 `setInputs`（意图层：forward/backward/left/right/brake/jump→PhysicsVehicle 读）、`respawn`、`setUnstuck`（翻车 3s 自救）；砍 `setSounds`（Phase C 回接）、`setDistanceDriven`/`setTimePlayed`/`setFlip`（成就依赖，C 后备）。**Spike** |
| `View.js`（788） | `Camera.js`（347） | **无** | **P0** | 中改 → `view/View.ts` ~350 行：保留 focusPoint（含 magnet）、zoom（含 pinch/滚轮）、spherical 视角、**optimalArea（Objects 已在消费！）**、resize 重算；砍 speedLines、cinematic 模式、shake。**Spike** |

### 3.F 世界内容

| folio-2025 模块（行数） | 2019 对应 | 我们现状 | 缺口 | 复用方式 / Phase |
|---|---|---|---|---|
| `World/World.js`（244，两阶段 step 编排） | `World/index.js`（512） | **无**（Objects 读 killElevation 悬空） | **P0** | 高改 → `world/World.ts` ~80 行：只留 step(0/1/2) 骨架 + killElevation 常量 + 灰盒内容清单。**Spike** |
| `World/Grid.js`（101，网格地面视觉） | — | 无 | **P1** | 低改（依赖 MeshGridMaterial）；灰盒地面 + 加载态视觉双用途。**Spike** |
| `World/Floor.js`（209，正式地面 TSL） | `World/Floor.js`（75）+ shaders/floor | 无 | P2 | 低改；Phase B 换正式地面时引入。**B** |
| `Terrain.js`（132，高度场） | — | 无 | — | 我们是平地试验场，不搬；若 Phase C 想加起伏坡道再回访（heightfield collider 我们 Physics 已支持）。**—** |
| `World/Intro.js`（342，进度圆环+标签） | `World/index.js` L171-249 | 无 | P1 | 中改（见 §4 专章）。**Spike 尾/B** |
| `Reveal.js`（236，三步启幕状态机） | `World/index.js` reveal 段 | 无 | P1 | 中改（见 §4 专章）。**Spike 尾/B** |
| `World/VisualVehicle.js`（546，车视觉/轮转/尾迹钩子） | `World/Car.js` 视觉段 | 无 | **P0（部分）** | 中改 → 只搬轮子位姿同步 + 转向前轮偏转段（~120 行）；车漆/天线/氮气拖尾不搬（CarConcept 自带材质）。**Spike** |
| `World/Scenery.js`（118，静态景物摆放） | — | 无 | P2 | 低改；Phase B 摆美术资产用。**B** |
| 装饰件全家桶：Grass 210 / Trees 120 / Bushes / Flowers 177 / Leaves 305 / Snow 475 / RainLines 257 / Lightnings 492 / WindLines 191 / WaterSurface 467 / Whispers 528 / Fireballs 107 / Confetti 183 / PoleLights 141 / Lanterns 69 / Fences 66 / Benches 63 / Bricks 64 / ExplosiveCrates 189 / Foliage 220 | `Tiles/Walls/Shadows` | 无 | — | **默认全部不搬**（预算与工期黑洞）；Phase B 按美术方案个别回访（候选：Fences/PoleLights/Benches 三小件 + Confetti 彩蛋）。**—/B 个别** |
| `Tornado.js`（255）+ `VisualTornado.js`（170） | — | 无 | — | 不搬。**—** |
| `Explosions.js`（81）/`Trails.js`（183）/`Tracks.js`（250，轮胎痕） | — | 无 | P3 | Tracks（漂移胎痕）是驾驶手感反馈的高性价比件，低改 ~200 行。**B（可选）/C** |

### 3.G Areas / POI（专章见 §5）

| folio-2025 模块（行数） | 2019 对应 | 我们现状 | 缺口 | 复用方式 / Phase |
|---|---|---|---|---|
| `Zones.js`（81，圆柱/球触发器） | `World/Zones.js`（80）+ `Zone.js` | 无 | **P1** | 零改（依赖 player.position）。**Spike 尾** |
| `References.js`（50，Blender ref* 命名解析） | — | 无 | **P1** | 零改。**Spike 尾** |
| `Respawns.js`（67，重生点注册） | — | 无 | **P1** | 低改（respawn glb → 硬编码坐标起步）。**Spike 尾** |
| `World/Areas/Areas.js`（81，glb 命名→类实例注册） | `World/Areas.js`（132） | 无 | P2 | 低改：类清单换成我们六分区。**B** |
| `World/Areas/Area.js`（177，基类三件套） | `World/Area.js`（308，含交互围栏） | 无 | P2 | 低改 ~120 行（见 §5.3）。**B** |
| 14 个具体 Area 类（Landing 到 Easter） | `Sections/` 10 个 | 无 | P2 | **不逐个搬**：抄 LandingArea/ProjectsArea 的模式写我们 6 个分区类。**B（重写参考）** |
| `InteractivePoints.js`（663，POI 标点+键位提示+开合动画） | `Sections/Project.js` 板架 | 无 | P2 | 中改 → ~250 行精简版（见 §5.3）。**B** |
| `TextCanvas.js`（112，Canvas 文字纹理） | — | 无 | P2 | 零改；世界内标牌文字。**B** |
| `Map.js`（192，2D 等距地图 overlay） | — | 无 | P2 | 中改；PRD LAB-18 的 2D 地图交付物直接以它为底。**B** |
| `KonamiCode.js`（77） | `EasterEggs.js`（385） | 无 | P3 | 彩蛋配额 ≤3 内自行取舍，零改。**C（可选）** |

### 3.H 运营与元系统

| folio-2025 模块（行数） | 2019 对应 | 我们现状 | 缺口 | 复用方式 / Phase |
|---|---|---|---|---|
| `Audio.js`（769，howler 全站音效） | `World/Sounds.js`（334） | 无 | P3 | **Phase C**；结构照抄（group/playRandomNext/速率随速度），播放层手写 WebAudio 重写（§6.1）。**C** |
| `Achievements.js`（630）+ `data/achievements.js`（238） | — | 无 | P3 | 规划外；核心机制 ~150 行可低成本搬（§6.2）。**C 后备** |
| `Server.js`（132，WebSocket+msgpack 多人/排行） | — | 无 | — | **永久不做**（§6.3）。**—** |
| `Menu.js`（284）/`Modals.js`（204）/`Options.js`（117）/`Notifications.js`（175）/`Tabs.js`（105）/`Title.js`（104）/`Overlay.js`（142）/`ClosingManager.js`（109） | — | 无 | P2 | **不搬 DOM 层**：我们的 ESC 菜单/设置/POI overlay 全部走 Astro/HTML 自建（SRD §12.7.1 iframe overlay 方案）；仅 Options 的「设置持久化 localStorage」模式借鉴。**B（自建）** |
| `Cycles/`（311+70+29，昼夜/年循环） | — | 无 | P3 | DayCycles 低改（昼夜联动是 Phase C 交付物④）。**C** |
| `Weather.js`（229）/`Wind.js`（77） | — | 无 | — | 不搬。**—** |
| `Easter.js`（169）/`BlackFriday/`（345） | — | 无 | — | 不搬（活动运营件）。**—** |
| `Monitoring.js`（被 folio 自己注释掉） | — | 无 | — | 不搬；我们用 GoatCounter 事件。**—** |
| `data/projects.js`（161）/`data/lab.js`（79）/`social.js`/`countries.js`/`consoleLog.js` | — | manifest.json + src/data | 无 | **不搬内容**；数据形状参考（title/url/image 三元组 → 我们 manifest 已超集）。**—** |

---

## 4. Start here：两代实现差异与本站落地

### 4.1 folio-2019：显式 Start 按钮（`src/javascript/World/index.js` L171-249 `setStartingScreen`）

机制链：`areas.add()` 造一块 2.35×1.5 的交互区（active:false）→ 加载中显示 base64 内嵌的 "Loading" 位图标签，`resources.on('progress')` 驱动 `areaFloorBorder` shader 的 `uLoadProgress` 边框进度 → `resources.on('ready')` 后 `area.activate()`，"Loading" 淡出、"Start" 淡入 → 玩家开车压上区域或按键触发 `interact` 事件 → `area.deactivate()` + 标签淡出 + `this.start()`（世界分区实例化）+ 600ms 后 `reveal.go()`（matcap/阴影渐显）。

**要点**：① 加载进度即世界内元素（地板边框 shader），无 DOM 加载条；② Start 是**空间性动作**（把车开进区域），教学与启动合一——玩家学会「前进」的瞬间就是开始的瞬间；③ 资源全量加载完才可交互（单阶段加载）。

### 4.2 folio-2025：无按钮，「任意输入即开始」（`Intro.js` 342 行 + `Reveal.js` 236 行）

机制链：`Game.init()` 先加载 4 件小资产（respawn 参考/调色板等）→ `World.step(0)` 只建 Grid + Intro（进度圆环：TSL 弧线 shader，`updateProgress` 吃第二批资产的加载进度）→ 第二批 30+ 资产与 Rapier wasm 并行加载 → `ticker.wait(3)`（等 shader 编译防白帧）→ `Reveal.updateStep(0)`：圆环收起、Grid 亮起、reveal 半径 gsap 弹到 3.5、镜头 zoom 0.6→0.3、显示文字标签和声音开关 → 注册 `introStart` 动作（`Keyboard.Enter/ArrowUp/ArrowDown/KeyW/KeyD` + `Gamepad.cross` + RayCursor 点击半径 3.5 球体）→ **任意一个输入到达即 `updateStep(1)`**：audio.init（用户手势解锁 AudioContext）、reveal 半径 back.in 补到 30→∞、inputs.filters 切 `['wandering']`（车辆输入这一刻才生效）、镜头拉起 → `updateStep(2)`：`world.step(2)` 建满世界、Grid/Intro 销毁、server.start、菜单预开。支持 `#skip` 快进 4 倍。

**要点**：① 两阶段资产加载：先 4 件出「加载画面」，重资产后台并行；② 启动=纯输入事件而非空间动作（更快，但少了教学性）；③ `inputs.filters` 是启动状态机的开关本体（`['intro']`→`['wandering']`），防加载期按键漏进车辆；④ 音频初始化严格绑定用户手势（自动播放合规）。

### 4.3 差异对照表

| 维度 | folio-2019 | folio-2025 | 本站取舍 |
|---|---|---|---|
| 触发方式 | 开车压 Start 区（空间动作） | 任意输入（按键/点击/手柄） | **2025 式**为主 + 壳页显式按钮（见 4.4） |
| 加载可视化 | 地板边框 shader 进度 | 进度圆环（TSL 弧线） | 圆环照搬（低改），或 facade 进度条兜底 |
| 资产策略 | 单阶段全量 | 两阶段（4 件先行 + 30 件后台） | **两阶段照搬**——我们 ResourcesLoader 已支持 |
| 教学性 | 强（启动即学会前进） | 弱（标签文案提示） | Phase B 补「出发广场压线出发」找回 2019 教学性 |
| 输入门控 | area.active 布尔 | `inputs.filters` 集合 | filters 照搬（ObservableSet 已移植） |
| 动画驱动 | gsap | gsap | **Ticker.delay + 手写缓动**（红线 G5/C-6） |
| 音频解锁 | Start 交互内 | step(1) 内 audio.init | Phase C 接入时同款手势绑定 |

### 4.4 本站两级 Start（结论）

我们比 folio 多一级：**壳页级**（Astro 静态页「进入试验场」按钮 = facade `start()`，SRD §12.4 显式路径；这满足 Lighthouse 壳页四项 ≥95 与 LCP=poster）→ **世界级**（挂载后进入 2025 式 Intro/Reveal：圆环吃 `ResourcesLoader` 进度 → 任意输入出发）。落地时 `Intro.ts` + `Reveal.ts` 合并成单文件 `world/Reveal.ts`（~200 行，中改）：Intro 的圆环 shader 照抄、标签 3D 文字换 TextCanvas 或砍掉、Reveal 三步状态机照抄但 gsap 补间全换 `ticker.delay` + `remapClamp` 缓动、`server.start`/`menu.preopen` 段删除。Spike 阶段可先用 facade 进度条 + 直接进入（无圆环），把 Reveal 排在 Spike 尾/Phase B 首。

---

## 5. Areas / POI 系统移植方案

### 5.1 folio 机制链（五件套 + 一个消费者）

```text
areas.glb（Blender 命名约定）
  └─ Areas.js：child.name.startsWith('landing'|'projects'|…) → new XxxArea(child) 注册
       └─ Area.js 基类三件套：
            setObjects()  — 子节点经 objects.addFromModel 入世界（physical/cuboid* 命名自动转碰撞体）
                            + references.parse 收集 ref* 空节点
            setBounding() — 'zoneBounding' 参考 → zones.create('cylinder', pos, scale.x)
                            → enter/leave 触发 boundingIn/boundingOut 事件
            setFrustum()  — 'zoneFrustum' 参考 → 每帧 circleIntersectsPolygon(区域圆, 相机 optimalArea 四边形)
                            → 不可见时整组 visible=false（剔除性能核心）
  └─ Zones.js：每 tick(order 8) 算 player.position 与各触发器距离 → enter/leave 事件
  └─ References.js：/^ref(?:erence)?(名字)(序号)?$/ 命名解析 → Map<名字, 节点[]>
  └─ Respawns.js：respawns glb → 重生点表（getByName/getClosest）
  └─ InteractivePoints.js（消费者）：POI 标点（TSL 圆点 + 键位图标纹理 + 开合动画）
       → zone enter 显示按键提示 → 按 E/Enter/手柄 → 触发内容展示（modal/URL）
```

### 5.2 六分区映射（本站六导航 → folio 参考类）

| 本站分区（Phase B 世界地图） | 内容源 | folio 参考 Area | 借鉴点 |
|---|---|---|---|
| 出发广场（Start here） | 首页定位语 | `LandingArea` | 出生点 + 指路标牌 + 首个 POI 教学 |
| 案例岛（旗舰 A 展馆 + B/C 标牌） | `/work/` 三案例 | `ProjectsArea` | 展板阵列 + InteractivePoints 逐板注册 |
| 实验区·电台塔（TTS） | `modules/tts-cockpit`（`mode:'world'`） | `SocialArea`（音源点） | zone enter 触发音频、leave 停止 |
| 实验区·涂装车间（配置器） | `modules/car-configurator`（`mode:'world'`） | `CircuitArea`（功能区） | 进区换材质热更、出区还原 |
| 档案馆（Insights）/控制塔（About）/联络站（Contact） | Phase C 全内容映射 | `CareerArea`/`BehindTheSceneArea` | 纹理展墙 + timeMachine 屏幕式内容展示 |
| 八出口标牌（LAB-18） | 全站路由 | `InteractivePoints` 的 URL 型 POI | 按键→`location.href`（世界任何点可退出） |

### 5.3 移植分步与改写量

| 步 | 文件 | 改写量 | 说明 |
|---|---|---|---|
| B-1 | `Zones.ts`（81 行）+ `References.ts`（50 行）+ `Respawns.ts`（67 行） | 零/零/低 | Spike 尾即可搬（Zones 依赖 player.position）。Respawns 先硬编码坐标数组替代 glb，接口签名不变 |
| B-2 | `utils/maths.ts` 补 `circleIntersectsPolygon` + `segmentCircleIntersection` | 零 | Area frustum 的唯一数学依赖 |
| B-3 | `areas/Area.ts`（177→~120 行） | 低 | 三件套全留；`preventAutoAdd/preventFrustum` userData 约定保留；去 Game 单例 |
| B-4 | `areas/Areas.ts`（81→~60 行） | 低 | 类清单换成我们 6 个分区类；命名前缀约定原样（我们的 areas.glb 沿用 Bruno 的 Blender 命名纪律——**这是资产管线零重新发明的关键**） |
| B-5 | `InteractivePoints.ts`（663→~250 行） | 中 | 保留：items 注册、zone 联动开合、键位图标 mesh、`STATE_HIDDEN/OPEN/CONCEALED` 状态机；砍：成就钩子、gsap 补间（换手写）、debug 面板、多语言键位图（只留 E/Enter/触屏按钮三款） |
| B-6 | 6 个分区类（各 ~60–150 行） | 重写（参考 folio 模式） | 每类 = Area 子类 + 本区 POI 注册 + 区域专属逻辑（电台塔音频/车间材质热更） |
| B-7 | `TextCanvas.ts`（112 行）+ `Map.ts`（192→~150 行） | 零/中 | 标牌文字 + LAB-18 2D 地图 |

**验收基准**（对齐 roadmap B2）：POI 数据不硬编码在类里，统一从 `src/data/world-pois.json`（自定 schema：id/分区/坐标/类型 modal|url|module/目标）读取——folio 把内容写死在 Area 类中是它可以接受而我们不行的点（我们的内容会随 manifest 增长）。

### 5.4 Blender 命名约定纪律（资产侧的合规「接口」）

沿用三套命名并写进美术交付规范：`physical`/`dynamic`/`kinematicPositionBased` + 碰撞体子节点 `trimesh*/hull*/cuboid*/tube*/ball*`（Objects.ts 已实现解析）；`ref[Name][N]` 参考空节点（References）；`zoneBounding`/`zoneFrustum`（Area 触发圈）。**王磊侧 Blender 工作流照此出 glb，代码侧零适配成本。**

---

## 6. 音效 / 成就 / 排行榜：Phase 裁决

### 6.1 音效 → **Phase C（确认）**

- **依据**：roadmap B3 交付物明确列「音效体系」；adaptation Phase C 交付物②细化为引擎音随速度、morph 音、POI 环境音、全局静音开关默认记忆；门禁要求「音效全部可关且 reduced-motion 下默认关」。Phase B **明确不做**（adaptation L292）。
- **复用方式**：`Audio.js`（769 行）**结构照抄、播放层重写**。保留的设计资产：group 注册表 + `playRandomNext`（同类音效随机轮播防重复感）、引擎音 rate 随速度 remap、音量随 `visibilitychange` 静音、分组音量。替换：howler → 手写 WebAudio（`AudioBufferSourceNode` + `GainNode`，预计 ~150 行；依据 adaptation §406「需求简单建议先手写，超 150 行再引库」——Howler ~7KB gzip 是备选而非默认）。
- **资产**：合计 ≤2MB、**不上 BGM**（roadmap §资产表第 10 行）。folio `static/sounds/` 中工程性 SFX（vehicle 引擎 572K / hits 164K / rolling 88K / swoosh 60K / clicks 8K / reveal 48K）是候选，合规口径见 §7.1；TTS 语种问候直接复用 `public/demo/tts/`（零新增）。

### 6.2 成就 → **规划外，列 Phase C 后备（非交付物）**

- **依据**：PRD/SRD/roadmap 三文档的 Phase C 交付清单均**不含**成就系统；folio 的成就深度绑定其运营性玩法（630 行 + 数据 238 行 + 独立 AchievementsArea + 奖励换装）。
- **裁决**：不进 Phase C 交付物。若数据阀门通过且世界留存好，作为 C 后备以**极简版**引入：`setStorage`（localStorage 编码存档）+ `setProgress`/群组进度这两段核心 ~150 行低改可搬，配 3–5 个站点向成就（「访问全部六分区」「读完一篇案例」），复用我们 GoatCounter 事件做统计侧。**不搬**：奖励换装、全球进度对比（依赖 Server）、成就专区。
- **注意**：Player.js 移植时把 `setFlip/setDistanceDriven/setTimePlayed` 一并砍掉（§3.E 已标注），成就后备启用时再回接——不要为未立项的功能保留死代码。

### 6.3 排行榜 / 多人 → **永久不做**

- **依据**：`Server.js` 是 WebSocket 常连 + msgpack-lite + uuid 会话（三个红线依赖）+ 需要自持后端——我们是 GitHub Pages 纯静态（SRD 托管约束），无处放 WebSocket 服务；圈速排行/在线人数属 folio 的社区运营目标，与我们「招聘方 10 秒到证据」的北极星无关；uuid 持久化涉及隐私成本（GDPR 语境下需披露）。
- **替代**：圈速挑战若 Phase C 想要，做**本地最佳圈速**（localStorage，CircuitArea 的计时段逻辑 ~80 行可参考搬）；「多少人在线」的社交证明用 GoatCounter 页面数据在 About 页静态展示。

### 6.4 依赖红线对照总表

| folio 依赖 | 用途 | 我们的裁决 |
|---|---|---|
| gsap | 全部补间 | ❌ `Ticker.delay` + 手写缓动（已在 Ticker/Nipple 落实） |
| howler | 音效 | ❌ Phase C 手写 WebAudio（超 150 行再评审引库） |
| msgpack-lite / uuid | Server 编解码/会话 | ❌ 随 Server 一并不做 |
| tweakpane | Debug 面板 | ❌ URL 参数 + console |
| three（0.183.2） | 渲染 | ✅ 我们 0.185.1（差 2 个 minor，风险见 §11 R3） |
| @dimforge/rapier3d | 物理 | ✅ 同款 0.20 |

---

## 7. 资产可搬运清单

### 7.1 授权口径（先说清楚再搬）

两仓库根目录 `license.md` 均为标准 MIT（版权人 Bruno Simon，2019/2025），文本覆盖「the Software and associated documentation files」，**仓库内静态资产随仓库以 MIT 分发，名义上可用**。但执行三条更严的自律红线：

1. **版权穿透风险**：`static/sounds/musics/`（148MB 曲库）几乎必然是第三方音乐授权给 Bruno 个人使用，MIT 无法「洗」上游权利——**禁搬**。同理适用于 fonts（须逐字体核查上游许可，SIL OFL 可用但要带许可文件）与 projects/ui 里的第三方 logo。
2. **品牌与身份混淆**：Bruno 的项目截图、职业履历纹理、社交头像、个人车设计是他的作品集内容，搬过来在法律之外先输了原创性——**内容性资产一律不搬**。
3. **预算纪律**：SRD §12.6 `public/` 全站 40MB、world 首包 ≤5MB/流式 ≤12MB；Spike 新增资产 ≤1MB。任何搬运先过预算再过审美。

**结论口径：只搬「工程性资产」（无内容语义、可替换、体积小），不搬「内容性资产」。** 所有搬入文件在 `docs/spec/` 资产台账登记来源 + 许可（NFR-S5 署名纪律同 CarConcept 现行做法）。

### 7.2 folio-2025 `static/`（197MB）逐目录裁决

| 目录 | 体积 | 内容 | 裁决 | 说明 |
|---|---|---|---|---|
| `sounds/musics/` | 148M | BGM 曲库 | ❌ 禁搬 | 第三方版权穿透（§7.1-1） |
| `sounds/` 其余 31 目录 | ~4M / 92 文件 | SFX（引擎/碰撞/滚动/UI…） | ⚠️ 候选 | Phase C 需求出清单后逐文件评估；vehicle（572K，4 个引擎 loop）、hits（164K）、rolling（88K）、swoosh（60K）、clicks（8K）、reveal（48K）为首选；保守替代方案 freesound CC0 / Kenney Audio 随时可切 |
| `projects/` | 15M | Bruno 项目截图 KTX | ❌ 不搬 | 内容性资产 |
| `ui/` | 9.2M | 菜单/图标/字模 | ❌ 大部不搬 | 我们 UI 是 HTML 自建；个别通用小图标可参考重绘 |
| `lab/` | 8.4M | Bruno 实验缩略图 | ❌ 不搬 | 内容性资产 |
| `areas/areas(-compressed).glb` | 3.2M/628K | 全部分区几何 | ❌ 不搬内容 / ✅ 作学习样本 | 在 Blender 打开研究命名约定与碰撞体组织方式（§5.4），照此出我们自己的 areas.glb |
| `draco/` + `basis/` | 3.6M + 584K | 解码器 | ✅ 不需要搬 | r185 loader 内置 `import.meta.url` 解析，bundler 自动携带（ResourcesLoader.ts 已接） |
| `terrain/` | 1.4M | 高度图+模型 | ❌ 不搬 | 平地试验场（§3.F） |
| `fonts/` | 796K | 站点字体 | ❌ 默认不搬 | 上游许可未核查；我们已有站点字体方案 |
| `vehicle/default-compressed.glb` | **36K** | Bruno 座驾（压缩版） | ⚠️ 仅开发对照 | 手感调参时 A/B 对照（folio 参数表原生标定对象是它）；**不上生产**（品牌混淆 + 已定 CarConcept 路线） |
| `vehicle/` 其余 | 560K | 天线/旧款车 | ❌ 不搬 | 同上 |
| `interactivePoints/` | 44K | 键位图标（E/Enter/A 键 KTX） | ✅ 可搬 | InteractivePoints 移植即用；或按站点视觉重绘（成本半小时，倾向重绘保持风格统一） |
| `intro/sound.png` | ~8K | 声音开关序列帧 | ✅ 可搬 | Phase C 音效开关用 |
| `floor/slabs`、`overlay/overlayPattern` | <70K | 平铺纹理 | ⚠️ 候选 | Phase B 地面/转场视觉需要时评估 |
| `playground/`、`scenery/`、`career/`、`social/`、`behindTheScene/`、`timeMachine/`、树木/花草各目录 | ~1.5M | 场景内容 glb/纹理 | ❌ 不搬 | 内容性资产；结构照样本学习 |
| `christmas/`、`favicons/` | <150K | 节日活动/图标 | ❌ 不搬 | 无关 |

### 7.3 folio-2019 `static/`（18MB）

| 目录 | 体积 | 裁决 |
|---|---|---|
| `sounds/` | 7.3M | 同 §7.2 音效口径，2019 版引擎音（低保真风）与 2025 版二选一 |
| `models/` | 5.6M | ❌ 不搬（Bruno 世界内容；matcap 材质路线我们也不用） |
| `draco/` | 3.6M | ✅ 不需要 |
| `social/`、`favicon/` | 1.2M | ❌ 不搬 |

### 7.4 资产搬运执行表（今天就能做的）

| # | 源 | 目标 | 体积 | 时点 |
|---|---|---|---|---|
| 1 | （无需搬）r185 内置 draco/basis | — | 0 | 已生效 |
| 2 | `static/vehicle/default-compressed.glb` | 本地开发目录（gitignore，不入库） | 36K | Spike 调参期 |
| 3 | `static/interactivePoints/*.ktx`（3 键位图） | `public/world/poi/`（或重绘） | ~12K | Phase B |
| 4 | `static/intro/sound.png` | `public/world/ui/` | ~8K | Phase C |
| 5 | `static/sounds/{vehicle,hits,rolling,swoosh,clicks}/` 精选 ≤10 文件 | `public/world/sounds/` | ≤1M | Phase C（逐文件登记台账） |
| 6 | `static/areas/areas.glb` | 仅本地打开学习，不入库 | 0 | Phase B 前 |

---

## 8. 文件级 copy 路径映射

### 8.1 已完成（13 件，见 §2.1，此处不重复）

### 8.2 待搬清单（Spike 剩余 → Phase B → Phase C，按施工顺序）

| # | vendor 源（行数） | 目标路径 | 改写量 | 预计行数 | Phase |
|---|---|---|---|---|---|
| 1 | `folio-2025/sources/Game/Game.js`（276） | `src/lab/world/core/Game.ts` | 中 | ~120 | Spike |
| 2 | `folio-2025/sources/Game/Inputs/Inputs.js`（333） | `src/lab/world/inputs/Inputs.ts` | 中 | ~180 | Spike |
| 3 | `folio-2025/sources/Game/View.js`（788） | `src/lab/world/view/View.ts` | 中 | ~350 | Spike |
| 4 | `folio-2025/sources/Game/Player.js`（676） | `src/lab/world/player/Player.ts` | 中 | ~200 | Spike |
| 5 | `folio-2025/sources/Game/Physics/PhysicsVehicle.js`（590） | `src/lab/world/physics/PhysicsVehicle.ts` | 低 | ~450 | Spike |
| 6 | `folio-2025/sources/Game/World/World.js`（244） | `src/lab/world/world/World.ts` | 高（骨架） | ~80 | Spike |
| 7 | `folio-2025/sources/Game/World/VisualVehicle.js`（546，轮同步段） | `src/lab/world/world/VisualVehicle.ts` | 中 | ~120 | Spike |
| 8 | `folio-2025/sources/Game/Materials/MeshGridMaterial.js`（156） | `src/lab/world/rendering/MeshGridMaterial.ts` | 零 | ~160 | Spike |
| 9 | `folio-2025/sources/Game/World/Grid.js`（101） | `src/lab/world/world/Grid.ts` | 低 | ~80 | Spike |
| 10 | （自建）mount 入口 | `src/lab/world/index.ts` | 新写 | ~120 | Spike |
| 11 | （自建）壳页 | `src/pages/world-spike/index.astro` | 新写 | ~80 | Spike |
| 12 | `folio-2025/sources/Game/Inputs/Wheel.js`（16） | `src/lab/world/inputs/Wheel.ts` | 零 | ~20 | Spike 尾 |
| 13 | `folio-2025/sources/Game/PreRenderer.js`（34） | `src/lab/world/rendering/PreRenderer.ts` | 零 | ~40 | Spike 尾 |
| 14 | `folio-2025/sources/Game/Physics/PhysicsWireframe.js`（58） | `src/lab/world/physics/PhysicsWireframe.ts` | 零 | ~60 | Spike 尾（可选） |
| 15 | `folio-2025/sources/Game/Zones.js`（81） | `src/lab/world/world/Zones.ts` | 零 | ~80 | Spike 尾 |
| 16 | `folio-2025/sources/Game/References.js`（50） | `src/lab/world/world/References.ts` | 零 | ~50 | Spike 尾 |
| 17 | `folio-2025/sources/Game/Respawns.js`（67） | `src/lab/world/world/Respawns.ts` | 低 | ~60 | Spike 尾 |
| 18 | `folio-2025/sources/Game/utilities/maths.js`（剩余函数） | `src/lab/world/utils/maths.ts` 追加 | 零 | +60 | Spike 尾 |
| 19 | `folio-2025/sources/Game/utilities/ObservableMap.js`（27） | `src/lab/world/utils/ObservableMap.ts` | 零 | ~30 | 按需 |
| 20 | `folio-2025/sources/Game/World/Intro.js`（342）+ `Reveal.js`（236） | `src/lab/world/world/Reveal.ts`（合并） | 中 | ~200 | Spike 尾/B |
| 21 | `folio-2025/sources/Game/World/Areas/Area.js`（177） | `src/lab/world/areas/Area.ts` | 低 | ~120 | B |
| 22 | `folio-2025/sources/Game/World/Areas/Areas.js`（81） | `src/lab/world/areas/Areas.ts` | 低 | ~60 | B |
| 23 | `folio-2025/sources/Game/InteractivePoints.js`（663） | `src/lab/world/areas/InteractivePoints.ts` | 中 | ~250 | B |
| 24 | `folio-2025/sources/Game/TextCanvas.js`（112） | `src/lab/world/world/TextCanvas.ts` | 零 | ~110 | B |
| 25 | `folio-2025/sources/Game/Map.js`（192） | `src/lab/world/ui/Map.ts` | 中 | ~150 | B |
| 26 | `folio-2025/sources/Game/RayCursor.js`（219） | `src/lab/world/inputs/RayCursor.ts` | 低 | ~180 | B |
| 27 | `folio-2025/sources/Game/Inputs/InteractiveButtons.js`（114） | `src/lab/world/inputs/InteractiveButtons.ts` | 低 | ~100 | B |
| 28 | `folio-2025/sources/Game/Materials/MeshDefaultMaterial.js`（135） | `src/lab/world/rendering/MeshDefaultMaterial.ts` | 低 | ~130 | B |
| 29 | `folio-2025/sources/Game/World/Floor.js`（209） | `src/lab/world/world/Floor.ts` | 低 | ~180 | B |
| 30 | `folio-2025/sources/Game/InstancedGroup.js`（119） | `src/lab/world/world/InstancedGroup.ts` | 零 | ~120 | B |
| 31 | `folio-2025/sources/Game/Tracks.js`（250，胎痕） | `src/lab/world/world/Tracks.ts` | 低 | ~200 | B（可选） |
| 32 | `folio-2025/sources/Game/Audio.js`（769，结构参考） | `src/lab/world/audio/Audio.ts` | 高（重写） | ~200 | C |
| 33 | `folio-2025/sources/Game/Cycles/DayCycles.js`（70） | `src/lab/world/world/DayCycles.ts` | 低 | ~70 | C |
| 34 | `folio-2025/sources/Game/Time.js`（84） | `src/lab/world/core/Time.ts` | 低 | ~80 | C |
| 35 | `folio-2025/sources/Game/Achievements.js`（存档段 ~150） | `src/lab/world/meta/Achievements.ts` | 中 | ~150 | C 后备 |
| 36 | （自建，teardown §10 设计） | `src/lab/world/player/TransformSystem.ts`（morph） | 新写 | ~250 | C |

### 8.3 明确不搬清单（复核用）

`Server.js`、`Monitoring.js`、`Debug.js`、`Menu/Modals/Notifications/Options/Overlay/Tabs/Title/ClosingManager`（DOM 层自建）、`Weather/Wind/Tornado/VisualTornado/Explosions/Trails`、装饰件全家桶（Grass/Trees/Bushes/Flowers/Leaves/Snow/RainLines/Lightnings/WindLines/WaterSurface/Whispers/Fireballs/Foliage 等，Phase B 按美术方案个别回访）、`Easter/BlackFriday/KonamiCode`（彩蛋配额内自行重写）、`Noises/cheapDOF/threejs-override`、`data/*`（内容）、folio-2019 全部 GLSL shader（TSL 路线不用）与 `ThreejsJourney.js`（营销弹层）。

---

## 9. 优先复用 Top 20 文件

排序依据：解锁价值（阻塞多少后续工作）÷ 改写成本，Phase 内再按施工依赖排。

| 优先级 | 文件（folio-2025） | 行数 | 改写量 | 解锁什么 |
|---|---|---|---|---|
| 1 | `Game.js` | 276 | 中 | 消除 4 处 import 悬空；两阶段启动骨架；**没有它一切无法编译** |
| 2 | `Inputs/Inputs.js` | 333 | 中 | 动作表 + filters 门控；Nipple 类型闭环；Start here 的输入基础 |
| 3 | `View.js` | 788 | 中 | 相机跟随 + `optimalArea`（Objects 已在消费）+ zoom；Rendering.render 的 camera 来源 |
| 4 | `Physics/PhysicsVehicle.js` | 590 | 低 | 车辆手感的全部（参数表原封起步）；Spike 核心问题的答案 |
| 5 | `Player.js` | 676 | 中 | 意图层 + respawn + 翻车自救；输入→物理的桥 |
| 6 | `World/World.js` | 244 | 高 | step 骨架 + killElevation；Objects 悬空引用闭环 |
| 7 | `World/VisualVehicle.js`（轮同步段） | 546 | 中 | CarConcept 轮子转起来（不然车是「滑」的） |
| 8 | `Materials/MeshGridMaterial.js` | 156 | 零 | 灰盒地面 folio 同款颜值，零美术投入 |
| 9 | `World/Grid.js` | 101 | 低 | 灰盒地面/加载态视觉 |
| 10 | `Zones.js` | 81 | 零 | POI 触发底座（Phase B 全部区域逻辑的地基） |
| 11 | `References.js` | 50 | 零 | Blender 命名 → 代码的资产管线接口 |
| 12 | `Respawns.js` | 67 | 低 | 重生点 + reset 语义 |
| 13 | `PreRenderer.js` | 34 | 零 | 防首帧白屏/卡顿（shader 预热） |
| 14 | `utilities/maths.js`（剩余函数） | ~60 | 零 | frustum 判定 + 循迹数学 |
| 15 | `World/Intro.js` + `Reveal.js`（合并） | 578 | 中 | Start here 世界级体验（进度圆环 + 任意输入出发） |
| 16 | `World/Areas/Area.js` | 177 | 低 | POI 基类三件套（bounding/frustum/objects） |
| 17 | `InteractivePoints.js` | 663 | 中 | POI 标点 + 键位提示 + 开合——世界与内容层的连接件 |
| 18 | `Map.js` | 192 | 中 | LAB-18 2D 地图交付物的现成底子 |
| 19 | `TextCanvas.js` | 112 | 零 | 世界内标牌文字（八出口/指路牌都靠它） |
| 20 | `Audio.js`（结构） | 769 | 高 | Phase C 音效体系的设计蓝图（group/随机轮播/速度联动） |

---

## 10. MIT 合规操作规范

1. **许可证保留**：`vendor/` 两仓库自带 `license.md`，且 `vendor/*` 已在 `.gitignore`（除 README）——clone 不入库 ✔。移植代码属「substantial portions」，须履行 MIT 告知义务。
2. **文件头署名模板**（已在 13 个移植文件中执行，后续延续）：

   ```ts
   // 移植自 folio-2025 sources/Game/Xxx.js（N 行，MIT © Bruno Simon）。
   // 行号基线：folio-2025 @ 41046b5。改动：<清单>
   ```

3. **集中 NOTICE**：建议在仓库根新增 `THIRD-PARTY-NOTICES.md`，收录 folio-2025 / folio-2019 的 MIT 全文与适用文件范围（`src/lab/world/` 下标注「移植自」的文件）+ CarConcept CC BY 4.0 + HDRI CC0——一处集中履约，页脚 colophon 链接它。
4. **资产台账**：§7.4 每笔搬运在台账登记（源路径 / 许可 / 体积 / 入库路径）；音效类逐文件登记，来源存疑即弃用换 CC0。
5. **不该署名的地方不署名**：自建文件（World.ts 灰盒、TransformSystem、壳页）不挂 folio 头注——署名过度与不足同样是合规瑕疵。
6. **改写量与合规无关**：即使「高改写」，只要保留了 folio 的表达（参数表、结构、shader 逻辑）就保留署名头；只有「仅借鉴思想、逐行重写」（如 WebAudio 版 Audio）可降格为普通参考注释。

---

## 11. 风险与未决问题

| # | 风险 | 影响 | 处置 |
|---|---|---|---|
| R1 | **world-spike WIP 未 commit**（13 文件躺在 stash：`world-spike engine WIP`） | stash 易被误清，1,758 行工作可能丢失 | 恢复工作区后立即 `git add src/lab/world astro.config.mjs package.json pnpm-lock.yaml && git commit`——高于一切其他工作 |
| R2 | 悬空引用（Game/Inputs/View/World 四件未落地） | 当前分支不可编译、不可验证 | 按 §9 优先级 1–6 顺序补齐；期间不要并行搬 Phase B 件 |
| R3 | three 版本差（folio 0.183.2 → 我们 0.185.1） | TSL API 在 minor 间有破坏史；Nipple/MeshGridMaterial 的 TSL 代码可能遇 API 更名 | 移植 TSL 重的文件（View 无 TSL、MeshGridMaterial/Intro 圆环有）时对照 three 迁移指南逐版核对；`threejs-override.js` 的 `Object3D.copy` 补丁我们未搬——若 VisualVehicle/克隆行为异常，第一嫌疑在此 |
| R4 | Rapier 版本语义差（folio 锁定版 vs 我们 ^0.20.0） | 车辆控制器 API（`DynamicRayCastVehicleController`）参数语义变化会让参数表失真 | 锁定 minor（`0.20.x`）；手感对照用 §7.4-2 的 folio 车模做 A/B |
| R5 | InteractivePoints 663 行里 gsap 补间密度高 | 精简版工作量可能被低估（估 ~250 行） | 先移植状态机与 zone 联动，开合动画用 CSS/手写缓动降级起步 |
| R6 | 音效合规灰区（§7.1） | Phase C 返工 | 默认 CC0 路线，folio SFX 仅在逐文件确认为 Bruno 自制时采用 |
| R7 | 本文与 roadmap §7.1 的 14 项清单口径差 | 施工者困惑 | 本文 §8.2 是 14 项清单的**超集与细化**（含 Phase B/C），冲突时以 SRD > roadmap > 本文为序 |

### 未决问题（需要人裁决）

1. POI 键位图标：搬 folio KTX（½ 小时）还是按站点视觉重绘（½ 天）？——倾向重绘，Phase B 定。
2. 胎痕 `Tracks.js` 进不进 Phase B？（手感反馈价值高 vs 200 行成本）——建议进，作为 B 尾可裁项。
3. 成就极简版是否要在 Phase C 数据阀门通过后立项？——留给 30 天数据。

---

## 12. 附：数字总账（一屏速览）

```text
folio-2025 Game 代码           20,418 行 / 148 文件
├─ 已移植                      1,983 行源 → 1,758 行 TS（13 文件）     [9.7%]
├─ Spike 待搬（§8.2 #1–19）    ~2,900 行源 → ~2,300 行 TS             [14.2%]
├─ Phase B 待搬（#20–31）      ~2,900 行源 → ~1,860 行 TS             [14.2%]
├─ Phase C 待搬/重写（#32–36） ~1,100 行源 → ~750 行 TS               [5.4%]
└─ 明确不搬                    ~11,500 行                              [56.5%]

资产：入库搬运合计 ≤ 1.1MB（POI 图标 + 声音开关 + Phase C 精选 SFX）
     开发期对照不入库 36KB（folio 车模）
     解码器 0（r185 内置）
依赖：folio 6 个运行时依赖 → 我们 2 个（three + rapier），红线零违反
```
