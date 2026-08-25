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
- `pnpm test:e2e` 全量结果见本小节末尾补记（E2E_PORT=4640 独占端口，避开共享 VM 其他 Task）。

### 交接点（波 2 同僚 + 波 3）

- **给 CC-E6（变形/首幕）**：respawn 默认点已是城市 `world.spawn` (0,0)——变形落点/机器人站位同锚兑现（M3 完成，E6 无需再动 Respawns）；mount 的 ready 语义已改「revealed 后 resolve」，首幕剧本若接管 reveal 时序请保持该契约（e2e 依赖 ready 即可操作）。
- **给 CC-E7（壳）**：壳页白名单模式已转正（`PARAM_ALLOWLIST` 四项透传 mount，引擎不读 location.search）——`/` 世界壳复用该模式即可；`__worldSpike` 遥测为 e2e 公共契约，壳重写时保留挂点 data-ws-* 命名。
- **速度口径红线**：physics 档 `forwardSpeed` 是 folio 时基（真实 m/s = ×Ticker.scale），kinematic 档本征 SI——任何新消费方（音效/UI/成就）走 `Game.vehicleKind` 分派，勿直读 forwardSpeed 当真实速度。
- E1 遗留「CarConcept 车宽略窄于物理盒」维持现状（正式资产波次解决）；运动学档锥桶无物理互动维持（域不同，log §9.3）。
