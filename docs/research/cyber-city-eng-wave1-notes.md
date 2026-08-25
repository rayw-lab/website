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
