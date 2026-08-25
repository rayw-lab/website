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

## CC-E2 — spike 合流退役（单实现）（2026-08-25，波 2）

分支 `cursor/cc-e2-spike-merge-1d6f`（base：`cursor/cyber-city-hero-design-1d6f` 波 1 合流 tip）。
完整退役决策记录（七文件去向表 / M2-M4 裁决 / engine.ts 纪律迁入清单 / 合流期修复）见
**`world-spike-log.md` §10**，此处只记交付面与交接点。

### 交付物

| 文件 | 内容 |
|------|------|
| `src/lab/modules/world/spike/`（七文件） | **删除**。参数表留档 `world-spike-log.md` §2（§10.1 有逐文件去向） |
| `src/lab/modules/world/index.ts` | 薄入口唯一指向引擎 `src/lab/world/index.ts`（facade 分包映射位不变） |
| `src/lab/world/index.ts` | mount 入口重写：HUD 接线（tick 999 / 0.25s 节流 / 提示消隐）、`__worldSpike` 遥测（+`vehicle`、nipple 双字段）、`?city=1`/`?robot=1` 动态挂载、respawn→`Objects.resetAll()`、ready 等 `revealed` 事件（输入放行后才 resolve）、`#debug` 句柄 |
| `src/lab/world/world/World.ts` | **M3**：`SPAWN` 切 `cyber-city-buildings.json` `world.spawn` (0,0)（heading→rotationY 换算 `r=π/2−h·π/180`）；spike 三组锥桶阵按 10m 环缩尺重排（16 只 Rapier 动态体 + 出生正前锚点桩），`knockedConeCount()` 物理真值判定 |
| `src/lab/world/player/Player.ts` | 键位合流：**Space=刹车**（spike 口径裁决，folio 悬挂跳挪 KeyF）；brake 组 = Space/B/ControlLeft |
| `src/lab/world/inputs/Keyboard.ts` | 驾驶键 preventDefault（keydown+keyup 双向，Space keyup 防误触聚焦按钮） |
| `src/lab/world/inputs/Nipple.ts` | 修引擎既有缺陷两枚：NDC 未减舞台 rect 偏移、angle 口径镜像（详见 log §10.4） |
| `src/lab/world/view/View.ts` | spike 速度变焦换算：`zoom.speedEdge` {5,40}→{4,24}（物理车真实速度域重标定） |
| `src/lab/world/rendering/Rendering.ts` | dispose 时 canvas 原位克隆置换（可重复挂载，WS-E2E-07 依赖） |
| `src/lab/world/core/Game.ts` | 新增 `vehicleKind`（physics\|kinematic，init 落定）——速度遥测两档换算依据 |
| `src/lab/world/utils/FpsMeter.ts` | 新增。spike FpsMeter 摘出（墙钟口径 + 暂停边界 reset，log §10.3-3） |
| `src/pages/world-spike/index.astro` | `?impl=` 分叉退役；**M4** 白名单 = gl/vehicle/city/robot；DOM 摇杆退役（引擎 3D Nipple 接管）；文案/注记随单实现更新；复位按钮 keydown+keyup 成对派发 |
| `e2e/world-spike.spec.ts` | 重标定（出生 (0,0)/速度阈值/锥桶直线锚点桩/摇杆走遥测/WS-E2E-11 改守 kinematic 回退腿），用例数不变；perf 与 mobile 两文件零改动 |
| `docs/research/cyber-city-implementation-plan.md` | **M2**：§3.1/§3.2 VisualVehicle 落位文字修订为 `player/`（E1 实况，不搬文件） |

### 验证

- `pnpm astro check` 0 errors / `pnpm build` 通过。
- 独立 Chromium 标定探针（build 产物 + 独占 preview 端口）：出生 (0, ~0.98, 0) 朝 -Z、
  W 巡航 ≈36km/h、boost 破 45km/h、直行撞锚点桩 cones>0、R 复位全场清零、
  CDP 真触摸摇杆 nippleActive/progress 遥测就位并驱动车辆、`?vehicle=kinematic` 可开、
  `?city=1&robot=1` 城市 + 机器人同帧渲染正常、控制台零未捕获异常。
- `pnpm test:e2e` 全量（E2E_PORT=4640 独占端口，避开共享 VM 其他 Task）：
  **42 passed / 6 skipped（= CITY-E2E-01~06 红灯态不动）/ 0 failed，15.1m，exit 0**——
  既有 42 用例零回归达成。抽样读数（SwiftShader 软渲染下界）：WS-E2E-03 boost 峰值
  57.9km/h（阈值 45）；WS-E2E-04 直线锚点桩第 1 轮命中（knocked=1）；WS-E2E-09 摇杆
  满推 progress=1 驱动至 30.9km/h；WS-PERF-01 软门禁照常 OBS 登记（p95 766.6ms，
  ≈1.5fps 下界，不阻断）。
- 截图纪律：e2e-batch1 无关截图（home/tts/car）运行再生成后已还原未入库；
  e2e-integration 的 world_* 截图随场景实变（出生 (0,0)/新锥桶阵/3D 摇杆）更新入库，
  新增 `world_kinematic_fallback.png`（WS-E2E-11 改测回退腿）；退役腿旧图
  `world_engine_impl_ready.png` 保留（历史批次报告 `e2e-test-report-integration.md`
  引用它，该报告为既往战役存档不追改）。

### 交接点（波 2 同僚 + 波 3）

- **给 CC-E6（变形/首幕）**：respawn 默认点已是城市 `world.spawn` (0,0)——变形落点/机器人站位同锚兑现（M3 完成，E6 无需再动 Respawns）；mount 的 ready 语义已改「revealed 后 resolve」，首幕剧本若接管 reveal 时序请保持该契约（e2e 依赖 ready 即可操作）。
- **给 CC-E7（壳）**：壳页白名单模式已转正（`PARAM_ALLOWLIST` 四项透传 mount，引擎不读 location.search）——`/` 世界壳复用该模式即可；`__worldSpike` 遥测为 e2e 公共契约，壳重写时保留挂点 data-ws-* 命名。
- **速度口径红线**：physics 档 `forwardSpeed` 是 folio 时基（真实 m/s = ×Ticker.scale），kinematic 档本征 SI——任何新消费方（音效/UI/成就）走 `Game.vehicleKind` 分派，勿直读 forwardSpeed 当真实速度。
- E1 遗留「CarConcept 车宽略窄于物理盒」维持现状（正式资产波次解决）；运动学档锥桶无物理互动维持（域不同，log §9.3）。

## CC-E4 — 霓虹视觉系统（D3 品质线，2026-08-25）

| 项 | 内容 |
|----|------|
| 分支 | `cursor/cc-e4-neon-visual-1d6f`（base = `cursor/cyber-city-hero-design-1d6f`，波 2 与 E2∥E6 并行） |
| 文件域 | `rendering/NeonMaterials.ts`（新）· `rendering/MeshGridMaterial.ts`（folio 搬）· `rendering/PreRenderer.ts`（folio 搬）· `world/Grid.ts`（folio 改造）· `core/Quality.ts` 扩三档 · `rendering/Rendering.ts` 回补 bloom · `city/NeonFacade.ts` 转薄壳 · `city/CitySilhouette.ts`/`city/index.ts` 品质接线 |
| 外部资产 | **0 字节**（全 TSL 程序化；可选窗格 atlas ≤300KB 槽位本波未用——程序化已达关键帧，槽位留给 CC-P1 M 档） |

### 交付物

| 文件 | 内容 |
|------|------|
| `core/Quality.ts` | 0\|1\|2 三档（0 桌面全效 / 1 移动中端 / 2 止损）；`?quality=0\|1\|2` URL 覆写（location.search 兜底读取，同 `?city=`/`?vehicle=` 临时接线纪律）+ `#debug` 句柄 `__worldSpikeGame.quality.changeLevel(n)` 热切；changeLevel 语义与 folio 原版一致（events 'change'） |
| `rendering/NeonMaterials.ts` | **全城唯一霓虹材质工厂**（E3 `NeonFacade` 实现体整体迁入，工厂签名零改动）。新增模块级共享 uniform 三件套（timeScale/flickerScale/phaseSpread）：Q0 逐窗随机相位闪烁 / Q1 全局统一相位 / Q2 时间轴冻结+振幅归零——切档 = 3 个 uniform 写入，**零材质重建零重编译**（风险表 R1 缓解落地）。D3 质感件：~7% 亮窗升格 1.9× 强度「亮屏窗」（bloom 下的立面高光锚点） |
| `city/NeonFacade.ts` | 转薄壳 re-export（E3 头注预留的「品质升级挂载点」兑现）：city/ 四消费方 import 路径零改动，全城单套材质系统（Premortem P9 双材质禁令守住） |
| `rendering/MeshGridMaterial.ts` | folio `Materials/MeshGridMaterial.js`（156 行）TS 移植：Ben Golus 抗锯齿网格算法 TSL 函数四件（toMask/toTriplanarUv/toGrid/toAntialiasedGrid）+ MeshGridMaterial 类全 API |
| `world/Grid.ts` | folio `World/Grid.js`（101 行）改造为城市地面：MeshStandardNodeMaterial 壳（吃光照/阴影/雾）+ toAntialiasedGrid 组 emissive（8m 青细格 cross 十字 + 40m 紫粗格）；**湿地反射三档**：Q0 TSL `reflector`（r185 webgpu_reflection 例同款，resolutionScale 0.35 + bounces:false）× 价噪声水洼掩码，Q1 假反射（噪声水洼 × 青/品红 sheen，零二次渲染），Q2 哑光。接管 Roads.plaza 地表职责（plaza 隐藏保留作回退开关） |
| `rendering/PreRenderer.ts` | folio `PreRenderer.js`（34 行）移植：32px CubeCamera 逼全场景管线预编译（§12.7.2 shader 预热行）；调用门 = Quality 0 + WebGPU 后端（folio Game.js L203 同门）；补渲染后清场（folio 原文 cubeCamera 遗留在场景） |
| `rendering/Rendering.ts` | 回补 folio setPostprocessing 主干：`THREE.RenderPipeline` + BloomNode 全彩通路（threshold 1 = 只有 emissive>1 的霓虹件起辉）。三档响应：Q0 bloom 0.55+阴影+DPR≤2 / Q1 bloom 0.3+无阴影+DPR≤1.5 / Q2 **后处理整段旁路**（直连 renderer.render）+DPR≤1 |
| `city/CitySilhouette.ts` | 天际线填充按档收缩 `mesh.count`（48/24/12）；实例缓冲区槽位在前填充在后，8 个预留槽位（带碰撞体）任何档位可见——视觉物理永远对齐。§5.3 原文 Q2「静态天空盒纹理」以最低密度程序化剪影等效替代（贴图违背默认路径零重资产纪律） |
| `city/index.ts` | 品质联动装配：`applyCityQuality`（霓虹 uniform + 地面反射档 + 剪影密度）挂 quality.events；挂载末拍 PreRenderer 预热（守门）；相机 far 1000 + 距离雾不变 |

### TSL / three 0.185 迁移核对记录（供后续搬运参考）

- `THREE.RenderPipeline` 为 r183 起正名（`PostProcessing` 保留为弃用别名）；bloom 仍自 `three/addons/tsl/display/BloomNode.js` 具名导出——folio 用法零改名直迁。
- NodeMaterial 已无 `this.normals` 布尔开关（normalNode 体系取代）——unlit 语义由 `lights=false` + outputNode 直出承担。
- @types/three 0.185 泛型收紧三处：TSL 节点句柄用 `Node<'float'>` 制式；folio 的 float→vec2 隐式广播需显式 `vec2(thickness)`；`mix(vec2, vec2, vec2)` 重载缺失，展开为等价 `mul().add()` 方法链（产物 shader 等价）。
- folio `MeshGridMaterial` 原文引用未导入的 `positionLocal`（local* 分支潜在 bug），移植补齐；`toMask` 的 mask 显式 `.toVar()`（WGSL assign 目标须为变量）。
- TSL `reflector`：`{ resolutionScale: 0.35, bounces: false }`，target 面片进场景、`dispose()` 收 RT——reflector 节点不在当前节点图中时其 updateBefore 不触发，Q1/Q2 天然零镜像渲染开销。

### 验证记录（build + 运行时冒烟全过）

- `pnpm astro check` 0 errors 0 warnings / `pnpm build` 通过；city 分包 gzip 后仍在预算内，默认路径零城市字节。
- 运行时冒烟（Chromium + SwiftShader 软渲染，WebGL 2 回退腿，`?impl=engine&city=1&robot=1#debug`）：
  - 冷启动 Q0（桌面缺省）：bloom 0.55 + 阴影开 + 实时反射 + DPR≤2；控制台 0 错误。
  - `?quality=1` URL 覆写冷启动：level 1 / DPR 封顶 1.5 / 阴影关 / bloom 0.3 / 剪影 32 实例——全部命中。
  - `#debug` 句柄热切 0→1→2→0：剪影 count 48/32/20（=8 槽位 + 48/24/12 填充）、阴影随档开关、Q2 `postEnabled=false`（后处理旁路确认）、回 Q0 反射节点复用零重建。
  - 默认路径（无 `?city`）回归：灰盒正常渲染（bloom 管线下无视觉回归）、city 分包未加载、E4 新增网络资产 0（资源清单里的 CarConcept/KTX2/wasm/HDR 全部为 E0 既有基线，审计 P0-2 豁免项）。
- **FpsMeter 读数（如实登记）**：本环境为 SwiftShader 软光栅，三档均被填充成本压平——Q0 0.93 / Q1 0.91 / Q2 0.97 fps（1024×620 视口，4s 窗口，含切档重编译拍）。绝对值无档位区分度（同 WS-PERF-01 软门禁口径：SwiftShader ~1fps 下界），**真机 60fps 判定移交 human-gate-checklist §5.4 走查表回填**；三档降载的正确性以上述状态断言（DPR/阴影/旁路/实例数/uniform）为准。

### 遗留与交接

- 自动降档（连续 2s <30fps → Quality 2 + toast，§5.3 触发条件行）：`Quality.changeLevel` 即调用面，FpsMeter 接线归 CC-E7 壳装配段。
- `?quality=` 走 location.search 兜底属临时接线，CC-E2 壳白名单转正时并入（同 `?city=`/`?vehicle=`）。
- 窗格 atlas ≤300KB 槽位未用（见资产行）；bloom 参数（0.55/0.3、threshold 1、smoothWidth 1）与水洼噪声频率（÷19）为首版手调值，真机走查后可在 `#debug` 句柄上直调 `rendering.bloomPass.strength.value` 复核。
- Q0 阴影切换触发全场材质重编译（事件级成本）；若真机切档卡顿明显，后续可给 shadow 材质变体做预热（PreRenderer 二次调用即可）。

## E6 · TransformSystem + Reveal 首幕（CC-E6，波 2，2026-08-25）

分支 `cursor/cc-e6-transform-reveal-1d6f`（base：`cursor/cyber-city-hero-design-1d6f`）。
上位条款：PRD CITY-04/05/06 + 终裁 D4；SRD §12.7.4；实施方案 §1 六幕（本 Task 交付幕②③④）。

### 交付物

| 文件 | 内容 |
|------|------|
| `src/lab/world/player/TransformSystem.ts` | 新增。状态机 robot_idle→transforming→car_ready→driving；V1 遮蔽式变形时间轴（见下）；仪式视觉件全程序化 TSL（充能环 CircleGeometry + 环带/刻度扫掠/中心微光、光幕 billboard 竖幕 + 扫描线/中腰亮带，additive、零外部资产）；物理插入点（E1 交底的 `activate/deactivate`，duck-typing 兼容运动学档）；`transform(to)` 幂等返回 Promise、`onStateChange` 退订式订阅、`waitFor` 资产进度钩子（环多转语义，CC-E7 两阶段清单接线位）；reduced-motion instant swap |
| `src/lab/world/world/Reveal.ts` | 新增。Intro+Reveal 合并移植（folio 剧本思路，gsap→Ticker.wait/delay + 手写缓动，第 6 章依赖红线）：机器人光柱开演节奏（ticker.wait(6) 防 shader 编译吃动画 → reveal() → 1.15s 后 robot_idle）、自建 DOM 覆盖层（CTA「变形 · 巡航态」+ role="status" aria-live 文字状态 + 键位提示浮现 4s 淡出）、`data-world-state` 状态镜像到传入 host、热交换后停 HeroRobot update 驱动（释放 CITY-03 循环动画配额，E5 交接约定）、Space 触发经 inputs 动作 `transform`（categories: ['intro']——driving 后 Space 归还刹车；悬挂跳 KeyF，A2 M7/M8） |
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

### 合流织合附注（CC-A2 M5–M8，父代理合流期落地）

- **M5**：`index.ts` ritual 模式 `autoReveal=false` 时跳过 `await 'revealed'`（`!ritualRequested` 短路），避免 ready 死锁。
- **M6**：壳页 `PARAM_ALLOWLIST` 增补 `ritual`（及建议转正的 `quality`）。
- **M7**：`Player.setInputs` 保留 E2 键位（Space=刹车 / KeyF=悬挂）并并入 E6 `driving` categories。
- **M8**：`Reveal` 键位提示文案 =「Space/B 刹车 · F 悬挂跳」。
- 合并顺序权威：E2 → E4 → E6（见 `cyber-city-wave2-audit.md`）。

---

## CC-E8 — CI 门禁改造（波 3，2026-08-25）

上位条款：SRD §11.2 ④⑤⑥ v2.0 改造 + §12.7.2 预算总表与双口径 Lighthouse；实施方案
`cyber-city-implementation-plan.md` §4.4 六项门禁清单 + §5.2 预算总表 + §7 CC-E8 行；
A2 审计 `cyber-city-wave2-audit.md` §6（manifest 先行死卡片纪律）。分支
`cursor/cc-e8-ci-gates-1d6f`，base = `cursor/cyber-city-hero-design-1d6f`（波 2 合流 tip）。

### 交付物

| 文件 | 改造 |
|---|---|
| `scripts/audit-budget.mjs` | ① G-A/B/C 考核对象重定向：探测器 `E7_SWITCHED = dist/home/index.html 存在` ——切换后自动改盯 `dist/home/index.html`，切换前继续考核 `dist/index.html` 并打印明确过渡口径日志；② 新增壳专项 **G-A′**（HTML+CSS ≤35 / 引导 JS ≤15 / poster ≤40 / 合计 ≤90KB gzip + 静态标签零重资产/零 world 字节）；③ G-D 排除表条件化：E7 后根 `index.html` 移出保护表（壳归 G-A′ 接管），E7 前根首页仍全额受保护；④ 新增 **G-G(world) 直测**：`dist/_astro/` 内 world 命名 chunk gzip 合计 ≤900KB + world 资产池（`public/models`+`hdri`+`textures/city`）≤12MB，不依赖 manifest 注册；⑤ 首屏核算逻辑提炼为 `collectFirstView()` 供 G-A/B/C 与 G-A′ 共用（行为对基线零变化） |
| `scripts/check-links.mjs` | ① 新增检查 5（feature-detect `src/data/cyber-city-buildings.json`）：12 栋在册大楼 `deepLink` 存在性（`deepLinkStatus:'fallback'` 打登记行放行）+ dist 内全部 `?poi={id}` 深链的 id 在册校验；② live 模块路由页规则对 `kind==='world'` 豁免预埋（world 路由 = `/` 而非 `/lab/world/`，SRD §12.7.1）；③ 壳六导航无需专项入口——普通 `<a>` 由既有检查 1 自动覆盖（头注释已写明） |
| `lighthouserc.json` | 由 `assert.assertions` 单组改为 **assertMatrix 双断言组**：组① `.*/website/home/` 四项 ≥95（E7 前 collect.url 无 /home/ → 空匹配不生效，**已实测 LHCI 空匹配组不报错**）；组② `.*` 四项 ≥95（与基线完全等效）。collect.url 六 URL 未动——本波对现网 CI 行为零变化 |
| `lighthouserc.e7-draft.json` | **新增** E7 日切 draft（不被 CI 引用，`configPath` 恒指 `lighthouserc.json`）：collect.url 增 `/website/home/`；assertMatrix 三组——`/` 壳 Perf ≥0.80 阻断 + A11y/BP/SEO ≥95 阻断、`/` Perf ≥0.90 warn 目标线、其余 URL（正则 `.*/website/.+` 不罩根）四项 ≥95。激活方式写在文件内 `_cc_e8_notes` |
| `src/lab/manifest.json` | **本波不动**（A2 §6 过渡纪律选 (b)）：Lab 索引过滤逻辑为 `status !== 'archived'`（`wip` 也渲染卡片）、`contracts.ts` status 枚举无 `hidden`、卡片 href 指向 `/lab/{slug}`——manifest 先行注册必然产出死卡片或语义歪的 `archived`。world 预算考核改由 G-G(world) 直测承载，注册块作为占位补丁见下 |
| `.github/workflows/ci.yml` | **零改动**（六项落地均不需要：脚本路径、configPath、步骤序全部不变——workflow 影响面为零） |

### 断言硬度表（哪些本波已硬 / 哪些 E7 日切硬）

| 断言 | 本波（E7 前） | E7 日切后 | 切换机制 |
|---|---|---|---|
| G-A/B/C 宪法首页预算 | **硬**（考核 `dist/index.html`） | **硬**（考核 `dist/home/index.html`） | `E7_SWITCHED` 探测器自动重定向，零改脚本 |
| G-A′ 壳体积四分项（35/15/40/90KB） | SOFT（超限 WARN 分类打印） | **硬** | 同上，自动转档 |
| G-A′ 静态标签零重资产/零 world | **硬** | **硬** | 恒硬（现行首页天然满足，无误伤） |
| G-D 零 world 字节 | **硬**（根 index.html 仍受保护） | **硬**（根移入排除表，`/home/`+内容页受保护） | 探测器条件排除 |
| G-G manifest 声明对照 | **硬**（现 2 模块） | **硬**（world 补丁激活后双轨） | 既有逻辑 |
| G-G(world) chunk 直测 ≤900KB | **硬**（实测 20.9KB） | **硬** | 恒硬，不依赖 manifest |
| G-G(world) 资产池 ≤12MB | **硬**（实测 5.2MB） | **硬** | 恒硬 |
| LHCI 全 URL 四项 ≥95 | **硬**（与基线等效） | `/home/` 与内容页维持硬 | assertMatrix 组② |
| LHCI `/home/` 断言组 | 空匹配不生效（无 URL） | **硬**（collect.url 增补即自动生效） | assertMatrix 组① |
| LHCI `/` Perf ≥80 阻断 / ≥90 目标 | 未生效（draft 文件） | **硬**（阻断线 80 写死） | E7 以 draft 替换 ci 块 |
| check-links buildings deepLink | 警告档（过渡不变红） | **硬** | `resolveToFile('/home/')` 探测自动转档 |
| check-links `?poi=` id 在册 | **硬**（当前空集自然绿） | **硬** | 恒硬 |
| e2e 交互前零 world 字节冒烟 | skip（CITY-E2E-01 骨架已在，E10 交付） | 解 skip 归 E7 绿灯 PR | 本波不解禁任何 CITY skip，不新增重复用例 |

e2e 冒烟准备说明（§4.4 第 5 项落地口径）：SRD §11.2 ⑥ 要求的「`/` 打开后、自动挂载触发
前零 `_astro/world*`/`models/`/`hdri/` 请求」已由 `e2e/cyber-city.spec.ts` CITY-E2E-01
完整承载（其 `WORLD_BYTES_RE` 在三类之外还保护 `textures/city/`，覆盖面超规格），处
红灯 skip 态、绿灯条件与选择器契约在该文件头部逐条留档——本波核对无缺口，不新增
重复骨架、不动 e2e 文件域。

### manifest 占位补丁（CC-E7 同 PR 激活，勿提前合入）

```jsonc
// 追加进 src/lab/manifest.json 数组（字段对照 src/lab/contracts.ts labModuleSchema 全过）：
{
  "slug": "world",
  "code": "RW-01",
  "title": "智能座舱科技城",
  "description": "Full Entry 旗舰：全屏赛博科技城 + 座舱 AI 机器人↔CarConcept 变形 + 十字路口 WASD 驾驶，12 栋主题大楼即全站导航。",
  "status": "live",
  "kind": "world",
  "entry": "world/index.ts",
  "poster": "posters/world-poster.webp",
  "budgetClass": "world",
  "budget": { "lazyJsKbGzip": 500, "assetsMb": 12 },
  "capabilities": { "webgpu": "preferred", "webgl2": "fallback", "audio": false, "pointerFine": true },
  "deepLinkParams": ["poi", "paint", "gl", "quality", "ritual"],
  "viewTransitionName": "world-entry",
  "techChips": ["WebGPU", "Rapier", "TSL", "变形仪式", "12 楼 POI"],
  "relatedWork": ["llm-capability-layering"],
  "relatedArticles": []
}
```

激活须知（E7 逐条核对）：

1. **死卡片拆弹（A2 §6 的本体）**：`src/pages/lab/index.astro` 过滤为 `status !== 'archived'`
   且卡片 href 硬拼 `/lab/{slug}`、poster 硬引 `${base}/${m.poster}`——world 注册即渲染指向
   `/lab/world`（404）的死卡片 + poster 404。激活时**必须同步**给索引页加 `kind !== 'world'`
   过滤（推荐：world 的入口就是 `/`，索引页可复用 spike 专区卡样式做「进入科技城 →」真实
   入口），或交付 `/lab/world/` 跳转页。二选一，不允许裸激活。
2. `deepLinkParams` 白名单与壳页 `PARAM_ALLOWLIST`（M6 织合后含 `ritual`/`quality`）对齐后
   定稿；`poster` 路径按 E7 实产出物（`posters/world-poster.webp` 为建议名）核对。
3. `check-links.mjs` 的 `kind==='world'` live 路由豁免**已预埋**（本波交付），激活后
   check-links 直接绿；`audit-budget.mjs` G-G 将自动进入「声明校验 × 直测」双轨。
4. `budget.lazyJsKbGzip: 500` = SRD §12.7.2「首屏可玩 JS」上限声明（当前实测 20.9KB，
   声明按上限写防告警噪音；G-G 直测 900KB 全量硬线独立于该声明）。

### 给 CC-E7 的交接点清单

1. **LHCI 日切**：以 `lighthouserc.e7-draft.json` 的 `ci` 块整体替换 `lighthouserc.json`
   的 `ci` 块（含 collect.url 增 `/website/home/`），删除 `_cc_e8_notes` 键与 draft 文件本体。
   `ci.yml` 的 configPath 不用动。
2. **audit-budget / check-links 零改动跟随**：两脚本全部日切逻辑挂在
   `dist/home/index.html` 存在性探测器上——`/home/` 产物出现即自动完成 G-A/B/C 重定向、
   G-A′ 转硬、G-D 排除根 index、deepLink 缺链转阻断。E7 不需要再碰 scripts/。
3. **G-A′ 是壳的设计红线**：HTML+CSS ≤35 / 引导 JS ≤15 / poster ≤40 / 合计 ≤90KB gzip、
   world 分包零静态标签（只许引导脚本动态 import）——壳页施工时按此自查，合并前
   `node scripts/audit-budget.mjs dist/` 必须零 ❌。
4. **manifest 补丁**：按上方占位补丁 + 激活须知 1–4 执行，与路由切换同 PR。
5. **e2e**：解 CITY-E2E-01~06 skip、串行 project 编排、SwiftShader 计时系数标定归 E7
   绿灯 PR（E10 文件头绿灯五条件不变）。
6. **`?poi=` 深链**：check-links 已对 dist 内全部 `?poi={id}` 做在册校验（阻断级）——
   壳/POI 落深链时 id 必须与 `cyber-city-buildings.json` 一致；两条 fallback 楼
   （agent-nexus → /ai-lab/、autodrive-lab → /work/）登记行已在 CI 输出常驻，转正时改
   `deepLinkStatus: 'live'` 即消。

### 验收命令输出摘要（本分支实测，2026-08-25）

- `pnpm astro check` → **0 errors**（111 files，0 warnings / 57 hints 与基线持平）。
- `pnpm build` → **18 page(s) built**，绿。
- `node scripts/audit-budget.mjs dist/` → exit 0，**阻断级门禁全绿、零 WARN**：
  G-A/B/C（过渡口径考核 `dist/index.html`）33.8KB / 200KB；G-A′ SOFT 档四分项全过
  （13.0/0.0/20.6/33.8KB）+ 零重资产零 world 命中 0；G-D 受保护 14 页命中 0；
  G-E 8.7MB/40MB；G-F 命中 0；G-G 两模块声明+流式豁免全过；
  **G-G(world) 直测：world chunk ×2 合计 20.9KB/900KB ✅ + 资产池 5.2MB/12MB ✅**。
- `node scripts/check-links.mjs dist/` → exit 0：310 条内部引用全有效；科技城深链
  核对 12 栋 deepLink × 0 条 ?poi=（E7 未切换，缺链降为警告档）；fallback 登记 2 条。
- **LHCI assertMatrix 行为三连验证**（本地 `@lhci/cli@0.15.x` + Chrome 151 实测）：
  ① 新 assertMatrix 语法 healthcheck/assert 全过；② `/website/home/` 组在 collect
  无该 URL 时**空匹配零报错**（`All results processed!` exit 0）——「目标路径存在才断言」
  机制成立；③ 反向对照（注入必失败断言 `first-contentful-paint maxNumericValue 1`）
  → `Assertion failed. Exiting with status code 1`——断言组真实生效非静默跳过。
- **E7 双态模拟**（临时 dist 操作，未入库）：
  ① 造 `dist/home/index.html` → 日志切「E7 已切换」口径、G-A/B/C 改盯 home、G-A′
  转阻断级、G-D 排除表含根 index，全绿 exit 0；
  ② 切换态 + 向根 index 注入 world `<script src>` → G-A′ 阻断 2 条（引导 JS 20.5KB>15KB
  + world 静态标签），G-D 不误报（根已排除、内容页仍 0 命中）,exit 1；
  ③ 过渡态（无 home/）同样注入 → G-D 抓到（受保护页命中 1 处 FAIL）+ G-B JS 超硬阻断
  + G-A′ 零 world 恒硬阻断 + 体积分项仅 WARN，exit 1——三态行为与设计口径逐条一致。
- `pnpm test:e2e` 全量回归 → **48 = 42 passed + 6 skipped，exit 0**（10.1 分钟，
  Chrome Headless Shell 151）——既有 42 绿路径零破坏，CITY-E2E-01~06 维持 skip
  （本 Task 红线「不解禁 CITY skip」遵守），与 A2 合流树口径一致。

---

## CC-E9 — POI 十二楼 · Phase 1 先遣（波 3，2026-08-25）

分支 `cursor/cc-e9-poi-areas-1d6f`（base：`cursor/cyber-city-hero-design-1d6f`）。
上位条款：PRD CITY-07（主题大楼 POI 10–20，首发四主楼）+ CITY-08 Phase 1（触发圈+深链先行，
完整进站动线归后续）；SRD §12.7.5（深链出生）§12.7.8 出口⑧（?poi= 深链）§9.5（world-poi 埋点名）；
实施方案 §7 CC-E9 行；folio-gap-and-reuse-report §5.3 B-3/B-5（Area/InteractivePoints 搬运裁决）。

### 交付物

| 文件 | 内容 |
|------|------|
| `src/data/world-pois.json` | 新增。POI 单源注册表（schemaVersion 0.1.0）：`pois[]` 12 条只存 `id/buildingId/kind/action(/align)` 外键与交互语义，坐标/标题/霓虹色/触发圈半径/进站 URL 全部经 `buildingId` 引用 `cyber-city-buildings.json`（零硬编码验收口径）；`deepLink` 块声明 `?poi=` 参数契约（`param/slugField/entryUrlField`）；`interaction` 块注入键位（`Keyboard.KeyE`/`Keyboard.Enter`）与键帽字符/提示词；`point.hoverHeight` 标点悬浮高（3.2m，运行时标定） |
| `src/lab/world/areas/Areas.ts` | 新增（重写自 folio `Areas.js` 81 行）。区域注册表：folio 从 areas.glb 节点前缀实例化 → 本站双 JSON 数据驱动。每条 POI = Area 触发圈（game.zones 圆柱）+ 泊车位霓虹光圈（NeonMaterials 同源 Torus，pulseSpeed 0 常亮不占 CITY-03 循环动画配额，几何按半径去重共享）+ InteractivePoints 标点（楼名双语标签 + E 键帽）。轻量运行期校验（id 重复/外键悬空/数量 <10 告警）；`?poi=` 深链出生改写 `respawns.getDefault()`（heading→rotationY 换算与 E6 M3 同式）+ 光圈提亮 3.4×；无效 slug 告警并原地出生（不阻断）。运动学档兜底：`game.zones` 缺席时按需补建（Zones 零物理依赖，只测 player 距离） |
| `src/lab/world/areas/Area.ts` | 新增（移植 folio `Area.js` 177 行）。POI 区域基类：setBounding 触发圈（zones 圆柱 enter/leave → boundingIn/Out 事件，folio 原样，数据源从 Blender 参考节点改显式构造参数）；setFrustum 视野剔除改圆-圆相交近似（本站 View 精简版无 quad2 四边形，用既有 optimalArea 外接圆，宁显勿隐）；setObjects 砍除（楼体/碰撞体归 E3 city 系统），留 `addHideable()` 接缝。tick order 10 原样 |
| `src/lab/world/areas/InteractivePoints.ts` | 新增（移植精简 folio `InteractivePoints.js` 663→~300 行）。标点三件套：TSL 菱形圈（Chebyshev 距离场 + threshold/lineThickness/lineOffset 三 uniform 开合）+ TextCanvas 标签滑入 + 键帽图标（canvas 手绘共享单 mesh，folio 三款 KTX 键图 → 零资产）。状态机 HIDDEN/OPEN/CONCEALED 原样；gsap → 手写缓动（power2/back.in/elastic.out 数值等价）+ tick 驱动 tween 通道表（同通道覆盖 = gsap overwrite:true 语义）。砍除：音效/成就/debug 面板/Gamepad 键图/temporaryHide 全局隐显/逐帧玩家距离扫描（触发圈归 zones）。交互动作 `poiInteract` 只挂 wandering/driving categories——intro 的 Space/CTA 归 Reveal，不抢键 |
| `src/lab/world/areas/index.ts` | 新增。装配入口 `mountAreas(game, map, options)`，areas/ 唯一对外面 |
| `src/lab/world/world/TextCanvas.ts` | 新增（移植 folio `TextCanvas.js` 112 行）。Canvas 2D 文字 → THREE.Texture；改动：位置参数→options、width 可缺省 = 自动量宽（folio 需调用方手工 measureText）、padding 左右非对称（键帽让位语义参数化）、补 dispose()。flipY=false 原样（采样侧 v.oneMinus() 翻转，双后端一致前提） |
| `src/lab/world/inputs/RayCursor.ts` | 新增（移植 folio `RayCursor.js` 219 行）。射线点击/悬停管理（Sphere/Box3/Plane/Mesh 四形状，onEnter/onLeave/onDown/onUp/onClick + 光标态切换）；改动：去 Game 单例（构造注入）、NDC 归一化补 stage 边界偏移（本站画布嵌页面中段，Nipple.ts L199 同款口径）、`rayPointer` 动作 categories 补 driving。只管指针，不含键位 |
| `src/lab/world/index.ts` | 最小接线：`?poi=` 深链隐含挂城（`?city=1` 同路径）；city 就位后动态 import areas 分包（默认路径零字节纪律与 city 同）；ritual 模式触发圈照挂、深链出生让位首幕锚点（M3 纪律，`deepLinkPoi: null`）；dispose 链补 `areas?.dispose()` |
| `src/pages/world-spike/index.astro` | `PARAM_ALLOWLIST` 增补 `'poi'`（M4/M6 纪律：壳只透传，引擎吃 `opts.params`） |
| `e2e/cyber-city.spec.ts` | 仅注释更新（不解 skip）：头部绿灯条件登记 CC-E9 已交付面（?poi= 深链 + world-poi:<id> 埋点在隐藏路径可测） |

### 深链契约（E7/E8 交接）

- **URL 参数**：`?poi=<slug>`，slug = `cyber-city-buildings.json` `buildings[].id`
  （即 `world-pois.json` `pois[].buildingId`；12 候选见下）。隐含挂城（无需另带 `?city=1`）。
- **进站 URL 字段**：`buildings[].deepLink`（相对站根，运行时拼 `import.meta.env.BASE_URL`）。
  `world-pois.json` `deepLink.entryUrlField` 声明了这一间接层——E7 壳/overlay 读 JSON 即可，勿硬编码。
- **交互**：驶入触发圈（`parkingBay.radius`）→ 标点开态（标签 + E 键帽）→ E/Enter/点按标点 →
  `game.events.trigger('world-poi', [buildingId])` + `action: 'navigate'` 直跳进站 URL
  （CITY-08 Phase 1 占位；overlay/View Transition 归 CC-P1，届时把 action 语义升级即可，JSON 不动）。
- **12 slug**：lingua-tower / voice-pod / agent-nexus / autodrive-lab / concept-garage /
  work-gallery / insights-archive / about-pavilion / contact-beacon / edge-cloud-hub /
  workflow-foundry / now-signal。
- **E7 待办**：`/` 壳 `PARAM_ALLOWLIST` 同样增补 `poi`；**E8 待办**：world-pois.json ⇄
  buildings.json 外键完整性收进构建期 zod 校验（本波只做运行期 console.warn）。

### 验证记录（全部通过）

- `pnpm astro check` 0 errors 0 warnings；`pnpm build` 18 页全绿；`areas.*.js` 独立懒分包
  （world-pois.json 打进该包，无独立请求）。
- 默认路径零回归：无 `?poi`/`?city` 时网络零 `areas`/`world-pois` 请求实测；
  `cyber-city-buildings.js` 分包出现为既有基线行为（M3 出生单源 World.ts 消费，非 E9 引入）。
- 浏览器实测（headless Chromium + SwiftShader，preview :4321）：
  ① `?poi=lingua-tower`：出生 (−28,28) 泊位居中、青色光圈提亮、标点开态标签
    「多语种方案塔 / Lingua Tower · E 进站」可读；控制台深链日志 + 系统就位日志（12/12）；
  ② 驶离触发圈 → 标点收合（conceal）+ 光圈仍显；驶回 → boundingIn 重开（pinned 悬停不抢收）；
  ③ E 键交互（autodrive-lab 圈内）：`world-poi:autodrive-lab` 事件 + 直跳 `/work/` 落地成功；
  ④ RayCursor 点按标点（lingua-tower）：`world-poi:lingua-tower` + 直跳 `/work/multilingual-cockpit/`；
  ⑤ 运动学回退档 `?vehicle=kinematic&poi=voice-pod`：zones 兜底补建成立，出生 (28,28) 正确；
  ⑥ 无效 slug `?poi=not-a-building`：console.warn 候选清单 + 原地出生，零未捕获异常。
- **已知观察（非 E9 缺陷，留档防后人误判）**：`?poi=voice-pod` 画面底部出现大黑菱形。
  根因 = E3 裙房基座（`ThemeTowers.createPodiumMaterial` #101018 近黑，w×1.14 方盒）×
  固定等距相机（View θ=π/4, φ=0.31π）：voice-pod 是全城唯一「楼体在自家泊位相机对角线上」
  的楼（bay (28,28) → bldg (52,52)），相机落点 ≈(45.6,16.9,45.6) 在楼体积内——幕墙从内侧
  被背面剔除（所以能看穿墙看到泊位），基座顶面（y=4 轴对齐正方形）从上方可见，θ=π/4 下
  投影恰为 45° 黑菱形。对照验证：`?poi=autodrive-lab`（楼不在对角线上）画面完全干净。
  处置建议（三选一，归 E3/E7 排期）：voice-pod 泊位挪出对角线（buildings JSON 数据改动）/
  相机遮挡淡出（View 系统）/ 基座材质提亮。POI 系统本身各态渲染全部正确。

### folio 移植台账（vendor/README.md commit 41046b5，MIT）

| folio 源 | 行数 | 本站 | 处置 |
|----------|------|------|------|
| `Game/World/Areas/Areas.js` | 81 | `areas/Areas.ts` | 重写：glb 节点驱动 → 双 JSON 数据驱动 |
| `Game/World/Areas/Area.js` | 177 | `areas/Area.ts` | bounding 原样 / frustum 改圆-圆 / setObjects 砍 |
| `Game/InteractivePoints.js` | 663 | `areas/InteractivePoints.ts` | 精简至 ~300 行（砍单 = gap 报告口径） |
| `Game/TextCanvas.js` | 112 | `world/TextCanvas.ts` | 全量 + 自动量宽/dispose 增强 |
| `Game/RayCursor.js` | 219 | `inputs/RayCursor.ts` | 全量 + stage 偏移修正 |

### 资产台账

新增 public 重资产 **0 字节**：键帽图标 canvas 手绘（folio 三款 KTX 键图砍）、标签 TextCanvas
程序化、菱形圈/光圈纯 TSL/Torus 几何。gsap/howler 零引入（依赖红线 G5）。

### 遗留与交接（CC-P1+）

- **CITY-08 Phase 2**：进站 overlay/View Transition 替换 `location.assign` 直跳；
  `world-pois.json` `action` 字段留好语义位（navigate/console），升级零 schema 变更。
- **frustum 精化**：本波圆-圆近似偏保守（宁显勿隐）；若 CC-P1 回捡 folio quad2
  四边形剔除，需给 View 补 `optimalArea.quad2` 计算（folio View.js L214）。
- **世界内招牌**：TextCanvas 已就位，楼顶全息招牌（buildings `title.en`）可直接消费——
  归 E4 Phase B/CC-P1。
- **触屏键帽**：MODE_TOUCH 下键帽隐藏、点按标点即交互（RayCursor onClick 等价键）；
  DOM 侧「进站」按钮提示归 E7 壳 HUD。
