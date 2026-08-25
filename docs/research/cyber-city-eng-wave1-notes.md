# 工程波 1 实施笔记（Cyber City · Phase 0）

各波 1 Task 的实施留档：改了什么、怎么接线、验证口径、给后续波次的交接点。
编排看板见 `cyber-city-eng-orchestration.md`；规格基线 PRD v2.0 + SRD v2.0 +
`cyber-city-implementation-plan.md`。

## CC-E1 — PhysicsVehicle 上车 + VisualVehicle 合体（2026-08-25）

分支 `cursor/cc-e1-physics-vehicle-1d6f`（base：`cursor/cyber-city-hero-design-1d6f`）。

### 交付物

| 文件 | 内容 |
|------|------|
| `src/lab/world/physics/PhysicsVehicle.ts` | 新增。folio-2025 `Physics/PhysicsVehicle.js`（590 行）→ TS 移植：Rapier `DynamicRayCastVehicleController`、底盘三 collider（压质心/车顶/bumper 铲斗）、四轮参数表、两段式 tick（order 2 pre / 5 post）、stop·upsideDown·stuck·flip 四检测器、flipJump 自救。参数原封（依赖 Ticker.scale=2），详表见 `world-spike-log.md` §9.1 |
| `src/lab/world/player/KinematicFallback.ts` | 新增。spike `vehicle.ts` 迁入：单刚体运动学 + 自行车转向 + 四轮 raycast 贴地；SI 参数原值拷贝（不 import spike，CC-E2 退役红线）；不依赖 Rapier |
| `src/lab/world/player/VisualVehicle.ts` | 新增。spike `carRig.ts` 并入（轮组枢轴 rig 红线注释原样保留，见 `world-spike-log.md` §7）+ folio 轮同步段：位姿直拷、前轮转角阻尼、滚转按视觉半径换算、悬挂行程沿轮枢轴浮动；HDR 环境贴图异步装载 |
| `src/lab/world/player/Player.ts` | 扩展 `PlayerVehicle` 契约（quaternion/wheelSpin/steeringTarget/wheels/events/upsideDownActive/moveTo/flipJump）+ `setUnstuck` 翻车自救循环（folio L345-393，gsap.delayedCall → Ticker.delay）+ 掉出世界 killElevation 重生守卫 |
| `src/lab/world/core/Game.ts` | 装配：阶段二资产清单接 CarConcept gltf；Rapier import 失败捕获 → null；阶段三按 `options.vehicle`/RAPIER 可用性热切换两档车辆，先挂 `physicalVehicle` 再构造 Player，`visualVehicle` 随后 |
| `src/lab/world/index.ts` | `?vehicle=kinematic` 接线（壳页白名单只转发 gl，从 `location.search` 兜底读取——临时接线，CC-E2 转正入白名单） |

### 契约（后续波次接口）

- `PlayerVehicle`（`player/Player.ts` 导出）：两实现热切换，Player/View/VisualVehicle 零感知。姿态约定：底盘局部 +X 车头 / +Y 上 / +Z 右；`moveTo(position, rotationY)` 收「地面坐标」，各实现自行抬升 `VEHICLE_GROUND_CLEARANCE = 0.92`（静态平衡口径，推导见 `world-spike-log.md` §9.2）。
- `PhysicsVehicle.activate()/deactivate()`：TransformSystem（CC-E6 变形）的物理插入点——机器人形态冻结底盘、车形态清零速度后启用。
- 事件面：`stop/start/upsideDown/rightSideUp/stuck/unstuck/flip`——音效/成就/UI 后续波次订阅即可。

### 验证（全部通过）

- `pnpm astro check` 0 errors / `pnpm build` 通过。
- 独立 Chromium（避开共享 MCP 浏览器）实测 `/world-spike/?impl=engine#debug` 两档：
  出生位姿 [10, ~0.98, 0] 朝 +Z、四轮触地、W 直行 +Z、A 满舵 steeringTarget 0.5（folio 值）、
  加速后蹲/转向重量转移悬挂行程差可见、推撞锥桶（bumper 组生效）、B 刹车链路（braking=1）、
  R 重生回出生点、`?vehicle=kinematic` 同流程可开；两腿控制台 0 错误。
- 实测踩坑两枚已修复并留档（`world-spike-log.md` §9.2）：静态下沉 0.36m 的净高口径、底盘不得进 Objects 注册表。

### 已知边界 / TODO（交接 CC-E2+）

- **翻车自救已保留**：`upsideDown → 3s → flipJump` 循环在 Player 内；折叠项 = folio 的翻车视觉戏剧化（相机震动/音效）未移植（依赖未来 Audio/View 扩展）。
- 运动学档锥桶无物理互动（物理域不同）；spike 场景级锥桶扫掠/边界夹持未迁（属场景不属车辆）。
- CarConcept 按物理脚印轴距 1.8m 统一缩放：车宽略窄于物理盒（碰撞观感略「隔空」），E2/正式资产解决。
- 程序化接触阴影退役（引擎层有实时阴影，双影会假）——移动端阴影预算复核归性能波次。
- `?vehicle=` 参数走 `location.search` 兜底属临时接线；CC-E2 合流时入壳页白名单。
- spike/ 目录原样保留（含 `params.ts` 参数事实源）；删除与壳页 HUD 接引擎读数归 CC-E2。

---

## CC-E3：城市地图 schema + 程序化城区（2026-08-25）

| 项 | 内容 |
|----|------|
| 分支 | `cursor/cc-e3-city-procedural-1d6f`（base = `cursor/cyber-city-hero-design-1d6f`） |
| 文件域 | `src/lab/world/city/*`（7 个新文件）+ `src/lab/world/index.ts` 最小接线 |
| 数据单源 | `src/data/cyber-city-buildings.json` **零改动**：仍 12 buildings + 8 reservedSlots（≤ 20 封顶） |
| 外部资产 | **0 字节**（全程序化 TSL：零贴图、零 GLB、零网络请求）——资产台账登记行见下 |

### 交付文件

| 文件 | 职责 |
|------|------|
| `city/CityMap.ts` | SRD §12.7.3 schema 的 TS 固化（全字段文档注释）+ JSON 加载轻校验（槽位封顶 / id 唯一 / 道路带侵入，console.warn 不阻断——zod/CI 硬校验归 CC-E8）+ `headingToRotationY` / 确定性种子助手 |
| `city/NeonFacade.ts` | TSL 窗格 emissive 材质族：幕墙（层高×列宽栅格 + 每窗 hash 亮灭/色相/呼吸闪烁）、剪影（世界坐标栅格，InstancedMesh 缩放实例专用）、霓虹发光件、全息路障。算法思路重写自 three.js r185 `SkyscraperGenerator`（MIT），换皮赛博 palette；无 LICENSE 仓库零复制 |
| `city/Roads.ts` | 主十字路口：路面三段网格共用 1 材质（世界坐标取样无缝；虚线/白边线/斑马线/霓虹路缘，`createRoadMaterial` 思路重写）+ 出生点光圈与朝北箭标（**直读 JSON `world.spawn`**）+ 四条尽头全息路障（fixed cuboid）+ 城市地面碰撞体（±340m）——物理全部经 `game.objects.add` 显式描述注册（World.ts 同款 Objects 约定） |
| `city/ThemeTowers.ts` | `lodProfile: 'hero'` 五栋（内环四主题塔 + concept-garage）**JSON 数据驱动**：双阶收分体量（≥55m）/ 裙房 / 霓虹招牌带（全息文字归 CC-E4/E9）/ ≥70m 天线呼吸信标；footprint fixed cuboid 碰撞体 |
| `city/CityBlocks.ts` | `lodProfile: 'standard'` 七栋中景体块 + 霓虹檐口 + 碰撞体（CC-P1 流式后即 M 档基底） |
| `city/CitySilhouette.ts` | S 档剪影：预留槽位 8（熄灯窗格 + fixed 碰撞体防穿楼）+ 天际线填充 48（外环 300–420m，确定性种子摆位）——**全层 1 个 InstancedMesh = 1 次 draw call** |
| `city/index.ts` | `mountCity(game)` 装配 + 相机远裁剪面 1000m + 距离雾；类型/材质全量导出 |
| `src/lab/world/index.ts` | 最小接线：`?city=1` 动态 import 挂载（独立分包，默认零城市字节） |

### 验收命令输出摘要

- `pnpm astro check`：**0 errors / 0 warnings**（57 hints 均为既有）。
- `pnpm build`：18 页全绿；city 独立分包 `dist/_astro/city.*.js` = 18.5KB raw / **7.2KB gzip**（含内联 buildings JSON），spike 引擎分包 `world.*.js` 44KB 未变。
- JSON 断言：`buildings=12 reservedSlots=8 max=20`，`git diff src/data/cyber-city-buildings.json` 空（零改动）。
- 运行时证明（`/world-spike/?impl=engine&city=1`，Playwright + WebGL 2 回退，headless 无 WebGPU）——console 原文：

```text
[INFO] [city] CC-E3 程序化城区已挂载：在册 12 栋可见地标（hero 5 [lingua-tower,
voice-pod, agent-nexus, autodrive-lab, concept-garage] + standard 7）；预留剪影
槽位 8 + 天际线填充 48（1 draw call）；道路 2 条 + 尽头路障 4；出生点 (0, 0)
heading 0（十字路口正中，车头朝北）；外部资产 0 字节（全程序化）
```

- 截图三机位（存 agent 工件，PR 描述附图）：① 出生点近景——斑马线 + 青色出生光圈
  与朝北箭标 + 品红/青路缘霓虹；② 高空俯瞰——十字路口四进口斑马线 + 内环四主题塔
  （青 Lingua / 品红 Voice / 紫 Agent / 橙 AutoDrive）+ 概念车库蓝檐口 + 提案锁定
  色标逐楼可辨；③ 沿中轴大道望北街景——Agent Nexus × AutoDrive Lab 峡谷缺口
  （提案 D4 出生第一眼构图复现）。
- 回归检查（默认路径 `/world-spike/?impl=engine` 不带 `?city`）：网络零 `city*` 请求、
  console 零 `[city]` 日志、世界正常 ready——spike 灰盒零回归。

### 资产台账登记（程序化，0 字节外部资产）

| 资产 | 来源 | 许可 | 体积 | 入库路径 |
|------|------|------|------|---------|
| 城市几何/材质（路面、12 楼、8 槽剪影、48 填充、路障） | 程序化生成（CityGenerator/SkyscraperGenerator **算法思路** MIT 重写，零代码复制） | 自制（MIT 思路致谢） | **0 字节外部资产**（代码 7.2KB gzip 分包） | `src/lab/world/city/` |

### 遗留与交接

- 窗格 atlas / 品质三档（Quality 0/1/2）归 CC-E4（`createFacadeMaterial` 为其替换挂载点，接口已留）。
- 楼顶全息招牌文字（构建期 title 纹理）归 CC-E4/E9；泊车触发圈（parkingBay）归 CC-E9。
- 出生点对齐：城市按 JSON `world.spawn`(0,0) 布局；spike 灰盒 respawn 仍在环形道 (10,0,0)（`world/World.ts` 属 CC-E2 文件域，出生点切换随 CC-E2/E6 合流）。
- 道路两侧车道隐形围栏（限定 CC-P0 可驾驶范围为两主轴）未做——当前仅尽头路障 + 楼体/槽位碰撞体，广场可越野至 ±340m 地面边缘（掉落触发 killElevation 复位，spike 语义一致）；细化归 CC-P1。

---

# Phase 0 工程波 1 · 交接笔记（eng wave-1 notes）

波次编排见 `cyber-city-implementation-plan.md` §波次编排：波 1 = CC-E1（车）∥ CC-E3（城）∥
CC-E5（机器人）∥ CC-E10（e2e 骨架），文件域互斥并行，各 Task 在本文追加自己的小节，
波末审计时以本文为合流对照单。

---

## E5 · 机器人英雄接入（CC-E5，2026-08-25）

### 交付物

| 文件 | 说明 |
|------|------|
| `public/models/hero-robot/HeroRobot.glb` | Quaternius Animated Mech Pack「Stan」（CC0）→ 换装钛灰/青/橙 + 剪辑裁至 Idle/Walk + Draco，**338KB**（≤800KB 预算） |
| `public/models/hero-robot/README.md` | 来源/许可/改造/热替换约定留痕（assets research §5.2 规范） |
| `src/lab/world/city/HeroRobot.ts` | 机器人英雄类：GLB 挂载（缺失自动回退程序化块面机甲，R4 止损同接口）、光柱显现（升起→easeOutBack 落定→消散 ≈1.1s）、idle 态（Idle 剪辑 + Eye 传感器呼吸灯 + 头部环顾）、`getAnchor()`/`setVisible()` 变形预留 |
| `docs/spec/asset-ledger-cyber-city.md` | 科技城资产台账（建账 + 首包滚动核算：净新增 338KB / 2MB） |
| `THIRD-PARTY-NOTICES.md` | 全站第三方声明（新建，含 Quaternius CC0 行） |

### 资产选型记录（D2 终稿执行）

- 4 台机甲实测比对（three r185 逐台渲染）：**Stan** 胜出——块面宽胸 + 五指手 + 直立人形双足，
  最贴 CITY-04「块面机甲·英雄站姿」；Mike 圆润呆萌、Leela 无臂独眼、George 反关节虫姿，均弃。
- 原生高度 ≈6.4m，运行时按 `targetHeight`（默认 9m，8–12m 级）等比缩放；5,972 tris。
- 配色烘焙进资产（钛灰 `#5c6472` / 工业橙 `#ff6b35` / 青 `#49c5b6`），零 Transformers 商标元素；
  金属度压低适配无 IBL 灰盒，CC-E4 IBL 就位后按材质名热调。
- 管线坑位记录：gltf-transform 的 `ColorUtils.hexToFactor` **内部已做 sRGB→线性**，
  再叠 `convertSRGBToLinear` 会双重线性化（实测发黑变红），勿踩。

### 域外挂点（本 Task 文件域之外的最小改动，合流时按此对照）

1. **`src/lab/world/index.ts`**（engine 入口，+~20 行）：`?robot=1` 时动态 import HeroRobot、
   经 `game.resourcesLoader` 装载、站位取 `respawns.getDefault()`（SRD §12.7.5
   「机器人站位即出生锚点」，变形后车落地同点）、加进 `game.scene`、挂 `ticker` tick 驱动、
   `ticker.wait(6)` 后起光柱（同 Game 坑④节奏）；`dispose()` 链路已接。
   默认路径（无参数）零机器人字节。
2. **`src/pages/world-spike/index.astro`**（壳页，+3 行脚本 +1 行说明）：`robot` 参数透传 +
   验证口径清单追加一条。演示地址：`/world-spike/?impl=engine&robot=1`（`&gl=1` 可验 WebGL2 腿）。
3. **ResourcesLoader 两阶段清单**：本 Task **未改 `core/Game.ts`**（E1/E2/E6 波内竞写该文件，
   避让合流冲突）。清单以 `HERO_ROBOT_RESOURCES`（`ResourceFile[]`）从 `HeroRobot.ts` 导出，
   **合流约定**：CC-E6/E7 城市装配段把它拼进 `Game.init` 阶段二并行加载清单
   （`resourcesLoader.load([...HERO_ROBOT_RESOURCES, ...])`），即完成「两阶段清单」正式接线；
   失败回退请走 `loadHeroRobotGltf()`（内置 try/catch → null → 程序化机甲）。

### 给 CC-E6（TransformSystem）的接口交底

- `getAnchor(): Object3D` = 变形锚点（机器人站位即车落点，SRD §12.7.4 同锚点热交换）；
- 光幕峰值热交换：`robot.setVisible(false)` + `car.visible = true`；双向可逆同理；
- `reveal()` 的光柱剧本可直接复用为「车→机器人」回变的显现拍；
- idle 呼吸灯占世界循环动画配额 1 处（CITY-03 ≤2 处：idle 呼吸 + 招牌脉动），
  变形为车后请对 HeroRobot 停止 `update()` 驱动以释放配额；
- `prefers-reduced-motion`：构造参数 `reducedMotion: true` → 显现即时化 + Idle 定格 + 环顾静止，
  与 CC-E6 的 instant swap 口径一致。

### 验证记录

- `pnpm astro check` + `pnpm build` 通过；audit-budget G-E/G-F/G-C 不受影响
  （资产 338KB 懒加载，首页/内容页零字节；public/ 实测 8.7MB / 40MB）。
- 浏览器实测 `/world-spike/?impl=engine&robot=1`：光柱显现→机器人落定→Idle 循环 +
  呼吸灯 + 头部环顾；`?gl=1` WebGL2 回退腿同表现；Draco 解码走 r185 内置 wasm 管线
  （car-configurator 同款，零解码器配置）。
- 遗留：机器人静态 collider（机器人形态物理体冻结）按 SRD §12.7.4 归 CC-E6 交付，
  E5 不建物理体；`?robot=1` 挂点在 CC-E7 路由切换后由 city 装配段接管并退役。

---

## CC-E10 —— e2e 世界剧本骨架 + 走查表（红灯态先写）

- **分支**：`cursor/cc-e10-e2e-skeleton-1d6f`（自 `cursor/cyber-city-hero-design-1d6f`）
- **交付物**：
  1. `e2e/cyber-city.spec.ts`（新）——世界剧本 6 用例骨架，**全部 `test.skip` 红灯态**，每用例头部注明对应 PRD/SRD 条款；文件头固化选择器契约提案（`SEL` 常量区 = CC-E6/E7 实装时的唯一改动点）与绿灯五条件；
  2. `docs/spec/human-gate-checklist.md` §5（新）——「科技城 Phase 0」走查表空表四张：首幕全流程（§5.1）、八跳过出口（§5.2）、Persona 2 猎头剧本（§5.3）、真机帧率录测回填位（§5.4）；
  3. 本文件（新建，波 1 汇集地）。

### 新增用例清单与 skip 原因

| ID | 覆盖 | 上位条款 | skip 原因（绿灯依赖） |
|----|------|---------|----------------------|
| CITY-E2E-01 | 壳静态段合同：load 前零 world 字节 + HTML 零 world 静态标签 + 定位语/poster/noscript | SRD §11.2 ⑥、§12.7.2 G-A′；PRD CITY-01/02 | `/` 世界壳未交付（CC-E7 波 4，当前根路由 = 宪法 HTML 首页） |
| CITY-E2E-02 | 跳过出口：第 0 秒可点 + Tab 第一焦点 → `/home/` 落地零 world 字节 | PRD §2.6 新承诺二、CITY-02/09①、§7.4 Persona 2；SRD §12.7.8 出口① | `/home/` 路由与壳上跳过出口未交付（CC-E7） |
| CITY-E2E-03 | 变形→可开计时：robot_idle → transforming（CTA disabled）→ car_ready → 即刻 WASD（占位断言 + 计时采集） | PRD CITY-05/06、终裁 D4；SRD §12.7.2（变形 1.0–1.2s / 加载→可驾驶 ≤8s）、§12.7.4 | TransformSystem/Reveal 未交付（CC-E6 波 2）；墙钟阈值待 SwiftShader 慢动作系数标定 |
| CITY-E2E-04 | reduced-motion 终态：不自动挂载（`data-blocked`）→ 显式进入终态直出 → 变形 instant swap + 文字提示 | PRD CITY-05 验收、CITY-09⑤；实施方案 §1.2 | 世界壳与 TransformSystem 均未交付（CC-E6/E7） |
| CITY-E2E-05 | `?gl=1` 回退：徽标 WebGL 2 + 变形在回退腿可播 + 零异常 | SRD §12.7.8 第二档；PRD LAB-17（TSL 双后端）；spike WS-E2E-05 契约结转 | `?gl=` 读参随 CC-E7 壳引导脚本落地 |
| CITY-E2E-06 | 机器人可见计时：poster 先显（LCP 不等 GLB）+ world-reveal 计时采集留档 | PRD CITY-04（≤2.5s）；SRD §12.7.2「e2e 冒烟计时」行 | HeroRobot/Reveal 未交付（CC-E5/E6）；可测信号契约待实装补齐 |

**计时口径决策**：CI SwiftShader 软渲染 ~1fps（e2e 先例实测），墙钟阈值直接断言必假阴性——计时用例在 CI 侧只做「状态序 + annotation 采集留档」（口径同 WS-PERF-01 软门禁），真机判定读数以 human-gate-checklist §5.1/§5.4 走查表为准。

**编排注记**：新用例暂挂 `desktop-chromium` project（skip 态零成本）；绿灯时应移入串行 world project（SwiftShader 下并发 3D 上下文互相挤兑，playwright.config 先例注释），该配置调整与解 skip 同 PR 完成，本次不动 `playwright.config.ts`。CI 门禁阈值（G-A′/LHCI assertMatrix 等）不在本 Task 文件域（CC-E8）。

### 验收命令输出摘要

```text
npx playwright test --list
  → Total 48 tests in 9 files（既有 42 + 新增 CITY-E2E-01~06，均声明为 skip）
pnpm test:e2e  # 独立 worktree 全量验证（E2E_PORT=4620，避开共享 VM 上其他波 1 Task 的 preview）
  → 42 passed / 6 skipped（= CITY-E2E-01~06 红灯态）/ 0 failed，17.2m，exit 0
  → 既有 42 用例零回归；WS-PERF-01 软门禁 OBS 照常登记（SwiftShader ~1.4fps 下界读数，不阻断）
  → 运行再生成的报告截图（docs/spec/assets/e2e-*）按「不提交无关 png」纪律全部还原，未入库
```

---

## E6 · TransformSystem + Reveal 首幕（CC-E6，波 2，2026-08-25）

分支 `cursor/cc-e6-transform-reveal-1d6f`（base：`cursor/cyber-city-hero-design-1d6f`）。
上位条款：PRD CITY-04/05/06 + 终裁 D4；SRD §12.7.4；实施方案 §1 六幕（本 Task 交付幕②③④）。

### 交付物

| 文件 | 内容 |
|------|------|
| `src/lab/world/player/TransformSystem.ts` | 新增。状态机 robot_idle→transforming→car_ready→driving；V1 遮蔽式变形时间轴（见下）；仪式视觉件全程序化 TSL（充能环 CircleGeometry + 环带/刻度扫掠/中心微光、光幕 billboard 竖幕 + 扫描线/中腰亮带，additive、零外部资产）；物理插入点（E1 交底的 `activate/deactivate`，duck-typing 兼容运动学档）；`transform(to)` 幂等返回 Promise、`onStateChange` 退订式订阅、`waitFor` 资产进度钩子（环多转语义，CC-E7 两阶段清单接线位）；reduced-motion instant swap |
| `src/lab/world/world/Reveal.ts` | 新增。Intro+Reveal 合并移植（folio 剧本思路，gsap→Ticker.wait/delay + 手写缓动，第 6 章依赖红线）：机器人光柱开演节奏（ticker.wait(6) 防 shader 编译吃动画 → reveal() → 1.15s 后 robot_idle）、自建 DOM 覆盖层（CTA「变形 · 巡航态」+ role="status" aria-live 文字状态 + 键位提示浮现 4s 淡出）、`data-world-state` 状态镜像到传入 host、热交换后停 HeroRobot update 驱动（释放 CITY-03 循环动画配额，E5 交接约定）、Space 触发经 inputs 动作 `transform`（categories: ['intro']——driving 后 Space 自动归还悬挂跳） |
| `src/lab/world/index.ts` | `?ritual=1` 首幕全流程接线（城市 + 机器人 + TransformSystem + Reveal 四分包 Promise.all 并行动态 import）；M3 出生锚点统一（见下）；`#debug` 追加 `__worldTransform` 句柄（控制台可验 `transform('robot')` 回变，CC-P1 预演）；`?city=1`/`?robot=1` 独立演示挂点原样保留（ritual 隐含装配时跳过重复挂载） |
| `src/lab/world/inputs/Inputs.ts` | `nipplePointer` categories 追加 `'driving'`（触屏摇杆在变形后可用）+ filters 语义 JSDoc（intro/driving 上下文） |
| `e2e/cyber-city.spec.ts` | 仅注释更新（不解 skip，属绿灯 PR）：SEL 契约区标注 CC-E6 已实装项与辅助信号（`[data-world-status]`/`[data-world-hint]`）；CITY-E2E-03/04/06 skip 原因改写为「E6 已交付、余 CC-E7 壳依赖」 |

### 状态机与时间轴（验收窗 1.0–1.2s；真实秒随 Ticker.delta，暂停即冻结）

```text
robot_idle ──transform('car')──▶ transforming ──1.05s──▶ car_ready ──首个驾驶输入──▶ driving
  0    →0.35   地面充能环半径 0→4m（easeOutCubic 展开 + 刻度扫掠；兼资产进度：
               waitFor 未 resolve 则峰值处环多转，时钟不进光幕段）
  0.35 →0.60   光幕淡入 0→1（billboard 面向相机，任何机位遮住热交换截面）
  0.60         ★ 峰值热交换：robot.setVisible(false) + car.visible=true——同锚点
               （防「PPT 切页」，Premortem P4/R8）；车从 +2m 起落
  0.60 →1.05   easeOutBack 落地 0.45s（光幕 0.3s 淡出、充能环随落地消散）；
               落定帧：moveTo(锚点) + activate() + filters intro→driving + car_ready
driving = car_ready 后首个驾驶动作（forward/backward/left/right/nipplePointer）接管，
不是变形的一部分——D4「变形→可开零等待」的机器保证在 car_ready 同帧完成。
reduced-motion：instant swap（零动画窗直落 car_ready）+ 文字状态提示（Reveal aria-live）。
```

- v0.1 提案的 car_idle/car_ready 两态已按终裁 D4 合并；回变 car→robot 共用同一遮蔽序列
  （无落地拍，机器人原地重现，filters driving→intro）——CC-P1 双向可逆的地基已在。
- 按住 W 穿越变形窗的边缘：Keyboard 不滤 `event.repeat`，OS 连发会在 car_ready 后
  自动接管 driving（实测通过）；Playwright 合成键无连发，e2e 需在 car_ready 后压键。

### 契约（后续波次接口）

- **事件**（`game.events`，SRD §9.5 命名）：`world-reveal`（光柱起）/ `world-transform` [to]
  （变形完成）/ `world-drive-start`（首个驾驶输入）——埋点/音效/成就订阅即可。
- **DOM**（Reveal 生成，e2e SEL 契约对齐）：host `data-world-state` 四态镜像、
  `button[data-world-transform]`（transforming 期 disabled + CSS 进度条）、
  `[data-world-status]`（role="status" aria-live）、`[data-world-hint]`。
  CC-E7 壳把 `[data-world-host]` 作为 host 传入即与 e2e 契约无缝对齐。
- **TransformSystem 选项**：`anchor`/`rotationY`（落点姿态）、`waitFor`（车资产 Promise，
  环多转语义）、`reducedMotion`；`events` 上另有 `'swap'` [to]（Reveal 消费停/起机器人驱动）。

### 域外挂点（本 Task 文件域之外的最小改动，合流时按此对照）

1. **`src/lab/world/core/Game.ts`**（+1 选项）：`GameOptions.autoReveal`（缺省 true = 灰盒
   原行为 intro→wandering 不变；ritual 传 false 让 Reveal/TransformSystem 接管 filters）。
   E1/E2 同波竞写该文件，改动收敛为一个布尔开关以最小化合流冲突面。
2. **`src/lab/world/player/Player.ts`**（+8 处 categories）：`forward/right/backward/left/
   boost/brake/respawn/suspensions` 动作追加 `'driving'` 类别——否则 filters 切到 driving 后
   全部驾驶动作被闸门拦截。语义映射：`wandering`（灰盒）≈ `driving`（首幕后），两者并存。

### M3 执行（出生锚点统一 JSON spawn）

- `?ritual=1` 装配段：`respawns.getDefault()` 位置/朝向改写为 buildings JSON
  `world.spawn`(0,0) heading 0（十字路口正中朝北），heading→rotationY 换算
  `π/2 − heading·π/180`（PlayerVehicle 前向 = (cos r, 0, −sin r)）。
- 机器人站位 = 变形锚点 = 车落点 = R 键 respawn 复位点，四点同源（SRD §12.7.5）。
- E3 遗留的「spike 灰盒 respawn 仍在环形道 (10,0,0)」在 ritual 路径已消解；
  默认灰盒路径不动（零回归），全局切换随 CC-E2/E7 合流。

### 验证记录（全部通过）

- `pnpm astro check` 0 errors / `pnpm build` 18 页全绿；分包核算：world 引擎包
  61.4KB raw（基线 60.6KB，+0.8KB = autoReveal/categories 最小面）；TransformSystem
  5.9KB / Reveal 6.5KB raw 独立懒分包——默认路径零字节（网络请求实测零 ritual 分包）。
- 浏览器实测（headless Chromium + SwiftShader WebGL2，独立 worktree preview :4620）
  四场景 24 断言全 PASS，日志工件 `cc-e6-browser-test.log`：
  ① 首幕全流程：robot_idle→transforming（CTA disabled+进度）→car_ready→driving；
    M3 落点实测 (−0.00, 0.94, −0.00)；W 朝北行驶（z 减小）；R 复位回 (0,0)；
    world-reveal / world-transform:car / world-drive-start 三埋点日志齐；零异常。
  ② reduced-motion：终态直出（无光柱窗）+ 点击即 car_ready + aria-live 文字提示可见。
  ③ `?gl=1`：WebGL 2 回退腿变形可播（TSL 双后端），零异常。
  ④ 默认路径零回归：零 ritual/city 请求、零 [reveal]/[transform]/[city] 日志、
    灰盒 W 直行照常（首测 FAIL 为 SwiftShader ~2s/帧下合成键时序假象，
    以 `revealed===true` 门控复测位移 1.11m PASS，留档防后人误判）。
- 计时口径：1.05s 设计窗在软渲染下等比放大为 ~53s 墙钟（Ticker.delta 累计），
  状态序与同帧语义不受影响；真机 1.0–1.2s 判定归 human-gate-checklist §5.1。

### 遗留与交接（CC-E7+）

- **两阶段清单正式接线**：本波演示路径车随 `Game.init` 就绪、机器人顺序加载
  （`loadHeroRobotGltf` 缓存感知 + R4 回退），未把 `HERO_ROBOT_RESOURCES` 拼进
  Game.init 批量清单——批量失败即整批 reject，与 R4「GLB 缺失回退程序化机甲」冲突；
  CC-E7 做两阶段编排时请保留该 try/catch 回退路由，`TransformSystem.waitFor` 已留好
  车资产进度接线位（环多转语义）。
- **`?ritual=1` 转正/退役**：CC-E7 `/` 壳条件自动挂载接管后，ritual 参数与
  `?robot=1` 挂点、壳页 `[data-ws-hint]` 预隐藏 hack（index.ts 内注释已标）一并退役；
  Reveal 覆盖层样式（`injectStyles`）可平移进壳页样式表。
- **首幕相机**：灰盒 View（FOV 25°）下机器人 targetHeight 压到 5.2m 取景；
  CC-E7 城市首幕相机（设计提案 §3.1：FOV 42° / 距 18m / 俯角 22°）就位后回 9m 级。
- **回变 car→robot**：序列已实现（`transform('robot')`，#debug 控制台可验），
  但无 CTA 入口/驾驶态触发键——归 CC-P1 双向可逆需求排期。
- **运动学档边界**：KinematicFallback 无 activate/deactivate（duck-typing 跳过），
  落地拍为 moveTo 驱动的纯视觉弹跳、无物理微弹；悬挂落定观感差异可接受，
  若 CC-P1 要对齐请给运动学档补 freeze 面。
- **仪式视觉件材质族**：充能环/光幕为 TransformSystem 私有 TSL 材质；若 CC-E4/E9
  需要同族光效（泊车圈、POI 触发圈），建议提炼进 NeonFacade 材质族统一 palette——
  本波按「禁大改 NeonFacade」红线未动。
- **e2e 解 skip**：CITY-E2E-03/04/06 的 E6 侧依赖已清（spec 注释已改写），
  解 skip + 串行 project 编排 + SwiftShader 计时系数标定归 CC-E7 绿灯 PR。
