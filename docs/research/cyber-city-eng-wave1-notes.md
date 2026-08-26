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

## CC-E7 — `/` 世界壳 + `/home/` 平移 · 路由原子切换（波 4，2026-08-25）

分支 `cursor/cc-e7-world-shell-1d6f`（base：`cursor/cyber-city-hero-design-1d6f`）。
Phase 0 终波、唯一动用户可见面的原子 PR。上位条款：PRD 终裁 D1/D6 + CITY-01/02/09 +
`/home/` 迁移纪律；SRD §12.7.1 路由表 v2.0、§12.7.2 预算 G-A′/G-D/G-G、§12.7.8 八出口；
实施方案 §4（壳）§5.2（预算）§7 CC-E7 行；A3 审计 §6 八项必带全量照做。

### 路由表变更（v2.0 生效）

| 路由 | 切换前 | 切换后 |
|------|--------|--------|
| `/` | 宪法 HTML 首页（五区块） | **Full Entry 科技城壳**：poster LCP + H1 + 三支柱 + 六导航 + 12 楼 DOM 快览 + noscript 全导航；四条件自动挂载（load 后静置 1.8s），跳过出口 = DOM 首焦点 |
| `/home/` | 404 | **宪法首页新址**：原五区块像素级平移（仅 import 深一级 + 科技城卡指 `/`）；LHCI 四项 ≥95 严格档考核对象 |
| `/world-spike/` | 公开路由（index,follow，进 sitemap） | **归档验证入口**：noindex,follow + canonical → `/` + 剔出 sitemap；功能保留（驾驶/物理 e2e 契约被测面） |

### 交付物

| 文件 | 内容 |
|------|------|
| `src/pages/index.astro` | 重写为世界壳。静态段（G-A′ 实测）：HTML+CSS 5.1KB / 引导 JS 1.4KB / poster 31.9KB / 合计 38.4KB gzip（红线 90KB）。`PARAM_ALLOWLIST` 七参数 gl/vehicle/city/robot/ritual/quality/poi 经 `opts.params` 透传（M4/M6/M9 全部转正，引擎零 location.search 旁路）；默认剧本 ritual=1（显式场景参数让位）；四条件拦截（reduced-motion/saveData/<768px/无 WebGL2·WebGPU）→ data-blocked + 显式「进入科技城」按钮 + 分因文案 |
| `src/pages/home/index.astro` | 新增：原首页整体平移，零内容改动（唯二接线差：import 路径深一级；LabCardWorldSpike 卡指 `/`） |
| `src/pages/world-spike/index.astro` | 归档处置（评估记录见下）；`.ws-lede` 保持单链接守 WS-E2E-01/07 严格模式契约 |
| `src/lab/manifest.json` | world 注册并与本 PR 同激活（E8 须知 1）：kind=world、budgetClass=world、deepLinkParams 与壳白名单同表 |
| `src/pages/lab/index.astro` | `kind !== 'world'` 过滤拆弹（防 /lab/world 死卡）+ 科技城通栏专区卡（真实 URL `/`） |
| `src/lab/world/core/Quality.ts` | M9 转正：档位改经构造参数（`GameOptions.quality` ← `opts.params`），删 location.search 解析 |
| `src/lab/world/core/Game.ts` / `index.ts` | `GameOptions` 增 `quality` + `cameraFraming: 'greybox'\|'city'`；index.ts 读参装配（ritual/poi → city 档，city/robot 灰盒验证参数 → greybox 档） |
| `src/lab/world/view/View.ts` | 城市首幕相机（A2 观察③）：city 档 FOV 42°/距 18m/俯角 22°/lookAt +2.5m；greybox 档参数原封不动（既有驾驶 e2e 全绿佐证） |
| `src/lab/world/index.ts` | HeroRobot targetHeight 5.2 → 9m（设计稿 9m 级立像，城市相机就位后成立） |
| `src/data/cyber-city-buildings.json` | voice-pod parkingBay x 28 → 12（黑菱形三选一之泊位改址，见下） |
| `lighthouserc.json` | E8 draft ci 块整体日切（collect 七 URL 含 `/home/`；`/` 分档断言）；`lighthouserc.e7-draft.json` 删除 |
| `astro.config.mjs` | ① sitemap filter 剔 `/world-spike/`；② G-G chunk 命名：`environments.client.build.rolldownOptions.output.chunkFileNames`——world 域谓词（`src/lab/world/**`、`src/lab/modules/world/`、`@dimforge/rapier3d`、buildings/pois JSON）命中 → `_astro/world.<hash>.js`，其余复刻 Astro 默认 cleanChunkName。**必须写在 client 环境级**：Astro 7 client 构建用自有 chunkFileNames 覆盖顶层 `rollupOptions.output`（见 astro/dist/core/build/vite-build-config.js 展开顺序），顶层写法静默失效——踩坑留档 |
| `public/posters/cyber-city-poster.webp` | 首幕实景截图（Playwright + SwiftShader 实渲 robot_idle 帧，Chromium canvas 编码 1280×720 q=0.74）31.9KB ≤40KB |
| `e2e/*` + `playwright.config.ts` | CITY 六用例解 skip + 全套件重定向（详见 §6-8 行） |
| `.github/workflows/ci.yml` | 注释同步（七 URL + `/` 分档断言口径） |

### A3 §6 八项必带逐条销账

1. **M9 `?quality=` 转正** ✔ — Quality 构造参数化 + 壳白名单 + index.ts 读参，全链 `opts.params`。
2. **targetHeight 回 9m** ✔ — 城市相机（FOV42°/18m/22°）就位同 PR 落账。
3. **manifest world 注册 + Lab 过滤拆弹** ✔ — 同 PR 激活，无裸激活窗口；LAB-E2E-01 增拆弹断言。
4. **LHCI 日切** ✔ — draft→正式 + 删 draft；collect 含 `/website/home/`；实测 `/` P100/A100/BP96/SEO100、`/home/` 四项全 100。
5. **壳 PARAM_ALLOWLIST 七参数** ✔ — gl/vehicle/city/robot/ritual/quality/poi，与 manifest deepLinkParams 同表。
6. **voice-pod 黑菱形三选一** ✔ — 选「泊位挪出对角线」（bay (28,28)→(12,28)，纯数据改动零代码风险；相机落点脱离楼体积，实测画面干净）。两条 fallback 楼（agent-nexus→/ai-lab/、autodrive-lab→/work/）详情页 Phase 0 无排期 → deepLinkStatus 维持 fallback 上级索引，check-links 登记通过；转正计划归 Phase 1 内容批次。
7. **G-G chunk 按 slug 命名** ✔ — world 域 12 chunk 全部 `world.<hash>.js`，直测 JS 全量 78.0KB/900KB；共享库（three/KTX2/Draco 与 car-configurator 共用）不计入，与既有核算口径一致。
8. **e2e 笔误 + 解 skip + 串行 + 计时** ✔ — `/lab/world-spike/` 注释笔误更正；CITY 六用例解 skip 全绿；cyber-city 移入 world-chromium 串行 project；SwiftShader 校准 MOUNT_TIMEOUT 210s / robot_idle·car_ready 120s。

### world-spike 归档评估（为何不降占位页）

既有 `e2e/world-spike*.spec.ts` 13 用例（驾驶/物理/触屏/dispose/快切/帧率证据包）
全部以本页为被测面，且 `/` 默认剧本 = 首幕变形仪式、无「直接开车」显式路径——
现在降占位 = 一次性重写 13 用例的被测路由与计时锚点，超出原子 PR 边界。
处置：功能保留 + noindex,follow + canonical → `/` + 剔出 sitemap（SEO 面已归档）；
WS-E2E-01 静态合同随归档改述（noindex/标题/H1）。降 ≤1KB 占位页 = 驾驶用例迁往
`/?...` 参数路径后执行，归 Phase 1 e2e 批次排期。

### 门禁数字（全绿留档）

- `pnpm astro check`：0 errors / 0 warnings；`pnpm build` 19 页（+/home/）。
- `audit-budget`：**零 ❌**（E7 探测器已识别切换，G-A′ 转硬阻断）——壳专项 HTML+CSS 5.1/35KB、
  引导 JS 1.4/15KB、poster 31.9/40KB、合计 38.4/90KB；零 world 静态标签命中 0；
  零 world 字节受保护 14 页命中 0；G-G(world) JS 78.0/900KB、资产 5.2/12MB；首页（现 /home/
  口径）首屏合计 33.9KB。
- `check-links`：345 条内部引用全部有效；12 楼 deepLink 全 200；fallback 登记 2 条。
- LHCI（7 URL × 3 轮中位）：`/` P100 A100 **BP96** SEO100（分档断言过）；`/home/` 与其余
  五页四项全部 ≥99（/home/ 全 100）。
- e2e：desktop+mobile 30 通过（home/mobile/site-health/lab-index 重定向后全绿）；
  CITY 六用例解 skip 后全绿（6.4m）；world-spike 11 用例全绿（5.8m，归档合同改述后）。

### 遗留与交接（A4/Phase 1）

- **`/` BP 96 的 4 分**：Lighthouse「Browser errors logged to console」——自动挂载后
  SwiftShader/headless 环境 WebGPU 探测降级告警落 console；真机不复现，阈值 0.95 内安全余量 1 分，
  Phase 1 可静默该探测日志再收口。
- **世界内 HUD 接线**：壳 `data-ws-speed`/`data-world-respawn` 挂点已就位（引擎缺席容忍），
  速度表数据源接线归 Phase 1。
- **POI 专项 e2e**（触发圈进出/无效 slug/`/?poi=` 深链用例）：归 Phase 1 首个 e2e 批次
  （契约已可测：`/?poi=lingua-tower` 实测出生泊位正确）。
- **驾驶 e2e 迁移 → world-spike 降占位**：一个版本周期后执行（见归档评估）。

## CC-M11 — A4 M11/M12 清条件（ESC 出口 + 走查表豁免留痕，2026-08-25）

A4 全量终审（`cyber-city-phase0-full-audit.md` §0/§6）「有条件放行」的两条硬条件在本分支销账：

- **M11 · 八出口④ ESC 招聘方速览（走 A4 (a) 最小实现，未改期）**：`src/pages/index.astro`
  壳层新增原生 `<dialog data-world-esc-menu>` —— Escape 开合（showModal = 焦点陷阱 +
  背景 inert + Esc 原生可关，关闭后焦点自动还原），菜单含「招聘方速览 → `/work/`」+
  「内容首页 → `/home/`」+ 关闭按钮，链接均带 BASE_URL；驾驶提示条追加「Esc 菜单」词条。
  零框架零动画库（红线不动），纯壳层改动不碰引擎。体积计入 G-A′：壳 HTML+CSS
  5.1→5.8KB、引导 JS 1.4→1.5KB、合计 38.4→**39.3/90KB gzip**（增量 ≈0.9KB，余量 50.7KB），
  audit-budget 复跑零 ❌。PRD CITY-09②/SRD §12.7.8 出口④ 原文「必有」保持一致，零修订。
- **M12 · 走查表豁免留痕（走 A4 (b)，云端无真机 60fps 不伪造读数）**：
  `human-gate-checklist.md` §5 新增 §5.5 自动化证据摘要（tip `268e99f`、e2e 48/48、
  LHCI `/` P100 A100 BP96 SEO100 + `/home/` 全 100、G-A′ 39.3/90KB、A4 冒烟四场景 +
  本 PR ESC 冒烟）+ 总判定行显式 Go：产品负责人延续 `goal-progress-status.md`
  2026-08-25「人工 Gate 豁免」先例至本路由切换 PR——列清自动化覆盖项
  （§5.1-1/3/4/6/7、§5.2 ①②③④⑥⑦⑧、§5.3 全部）与仍欠真人回填项（§5.1-2/5 真机计时、
  §5.1-8 D3 品质线目测、§5.4 真机帧率四行全部留空），豁免范围仅限 Phase 0 合入 main、
  不免除 Phase 1 真机走查；§5.2④ 行同步标已实现（✅ 冒烟）。
- **验证**：`astro check` 0 err / `build` 19 页 / `audit-budget` 零 ❌（G-A′ 转硬后仍绿）；
  ESC 冒烟（Playwright + preview 伺服 dist）：`/` 挂载后按 Escape → 菜单可见（焦点落
  「招聘方速览」）→ 点击落地 `/work/`，截图留档 `m11-esc-menu.png`。
- **交接**：ESC 出口的 CITY 专项 e2e 用例（Esc 开合 + 链接直达断言）随 Phase 1 首个
  e2e 批次（POI 专项用例同批）补入；SRD §11.2「手动画质档常驻 ESC 菜单」属 Phase 1
  帧率自适应交付面，本次最小菜单不含画质档（口径见 SRD 原文，非缺口）。

## CC-L0-visual — 竞品视觉调研 + 85 分 rubric（Loop 0，2026-08-25）

- 分支 `cursor/cc-l0-visual-research-1d6f`（base：`cursor/cc-l0-test-framework-1d6f`）；只读调研 + 文档/JSON，3D 代码零改动。
- 交付：`cyber-city-visual-rubric.md` **v1.1 双评合议版**（竞品定标锚 6 档含 URL——Bruno folio-2025 95° / Cyber City Orion 88° / Jesse's Ramen 82° 等 + 施工参照 9 条 + 七维 0-100 锚点 + 帧优先复现协议 + Tier A/B/C 提分清单）+ `cyber-city-visual-rubric-score.json`（score-loop 维度④机读位，85° = Awwwards HM 量级标定）。
- **双评合议 51/100**：本 Task 两轮独立打分同对象——Pass A 帧优先 13 项 41.5（证据帧 `assets/visual-rubric/` 4 帧 + 代码核对，git `2fc0702`）、Pass B 七维锚点初评 59（`pnpm test:visual` 4/4 实跑帧，git `0fe8a4b`）——按帧优先铁律逐维收敛：V1 45 / V2 52 / V3 55 / V4 35 / V5 58 / V6 55 / V7 70（权重 20/20/15/15/15/10/5）。
- 核心结论：工程系统（bloom/湿反射/变形仪式/色彩单源/降级链）全部帧证成立；欠账在帧内美术——黑天空、spike 锥桶滞留首幕、窗色五彩纸屑、零招牌文字零街道层。综合分敏感度 ≈74.75+0.25×视觉分（当前 ≈87.5，视觉仍是唯一 <60 的轴）。
- 域外最小改动一处：`e2e/visual/world-visual.spec.ts` JSON import 补 `with { type: 'json' }`——Node 22 ESM 硬性要求，原样在本 VM 报「No tests found」（astro check 0 err 复验，非 3D 代码）。
- 交接：VIS-01/02 截图基线未入库（全新 VM 首跑 `--update-snapshots`，入库裁决归 CC-L0-setup/baseline）；`node scripts/score-loop.mjs` 已验维度④由「缺失」转 51.0；Loop 1 建议从 rubric §6 Tier A（十件低成本 →~62）起步，A10 poster 重拍永远排批次最后。

## CC-L0-baseline — 全链检验 + 基线分数矩阵（Loop 0，2026-08-25）

- 分支 `cursor/cc-l0-baseline-score-1d6f`（base：`cursor/cc-l0-test-framework-1d6f` ⊕ 合并
  `cursor/cc-l0-visual-research-1d6f`——score-loop + 视觉 rubric JSON 齐套后的首个五维基线）。
  合并冲突仅 `e2e/visual/world-visual.spec.ts` 的 buildings JSON 读取方式（visual 分支
  `with { type: 'json' }` vs test-framework 后继修的 fs 读），保留 fs 读方案；
  `cyber-city.spec.ts` 复核无 JSON import，Node 22 下 52 用例 `--list` 全量可发现。
- **基线登记：`COMPOSITE_SCORE=87.2`（五维齐套，≥85 门槛达成）**——
  LHCI `/` 97.75×25% + `/home/` 100×15% + e2e 100×20%（**52/52**，18.4 min）+
  视觉 rubric 51×25% + 3D 冒烟 100×15%（VIS-02/03/04 三 `@smoke3d` 全过）。
  单源登记 `cyber-city-baseline-score.md` §A（§B 保留早前 main@1b8d051 四维口径 75 分首跑）；
  机读明细 `test-results/quality-score.json`（快照入库 `docs/spec/assets/quality-score-baseline-l0.json`）。
- 检验链 `pnpm quality:loop:full` 单命令跑通（`LOOP_EXIT=0`，全链 ~23 min 实测），
  VIS-01/02 入库基线图首跑即匹配（0.02 容差内零 diff，基线图跨 VM 可复现性首证）。
- **LHCI 已知限制实证**：本地 collect 21 run 的 performance/best-practices 全为 null
  （SwiftShader 追踪不产值），①②维改用 CI artifact 复算——**LHCI 来源：CI artifact @
  `71e7c59`**（Actions run 32878074874，最近 green）。跑法与登记纪律固化进
  `cyber-city-test-framework.md`「SwiftShader VM 下 LHCI 已知限制」一节。
- 缺口观察（非阻断）：视觉维 51 仍是唯一 <60 的轴（综合分敏感度 ≈74.7+0.25×视觉分，
  Tier A 落地 →~90）；`/` A11y 95（`aria-hidden-focus`：挂载后 `.hud` 在 aria-hidden 容器内
  含可聚焦元素）；`/` BP 96（`font-size`：移动 formFactor 下壳上 <12px 小字）——
  三项修法已写进 baseline 文档 §A.5，归 Loop 1。
- 测试运行重写的 `docs/spec/assets/e2e-*` 历史截图已按「不提交无关 png」纪律全部还原。

## CC-L1-improve — 视觉 Tier A 五项聚焦 PR（Loop 1，2026-08-25）

- 分支 `cursor/cc-l1-visual-tier-a-1d6f`（base：`main@6e2ad63`，L0 基线 87.2/视觉 51）。
  单聚焦 PR 纪律：只做 AL0 审计 §8 Tier A1 五项（对应 rubric §6 A1-A6，A4/A5 合并施工）；
  HUD 面板化（A7）/排版（A8）/湿反射调参（A9）/poster 重拍（A10）留 Loop 2。
- 交付五件（全程序化 TSL，零新资产、零 gsap、禁令红线未触碰）：
  1. **A1 天空/雾**：新建 `city/Sky.ts` 反面穹顶（垂直渐变：天顶深蓝紫→地平线
     青⇄品红光污染辉光带，方位混色与双主轴道路同源；峰值 ≈0.45 线性 < bloom
     threshold=1 纪律）；雾色 `#0d0c11` 纯黑 → `SKY_FOG_COLOR #101c26` 与辉光带
     同源（Fog 140/850），远楼渐隐进光污染而非黑幕。
  2. **A2 锥桶撤场**：`World.setCones` 只在 `cameraFraming==='greybox'` 执行——
     `/world-spike/` 锥桶 e2e 闭环被测面不动，城市首幕零锥桶；新建
     `city/StreetProps.ts` 8 只街角霓虹隔离墩替换道具层（双色族 InstancedMesh
     4 draw call + 单 fixed 刚体 8 cylinder 碰撞体；常亮不占 CITY-03 动画配额）。
  3. **A3 窗色纪律**：`NeonMaterials.ts` 新增 `WINDOW_PALETTE` 单源（青 55%/品红
     25%/暖白 20%），楼体 `neonColor` 不再直出窗格（保留招牌带/信标/大堂光带的
     楼宇身份职责）；剪影层第二色相紫→品红同轴。
  4. **A4+A5 首幕构图与主体光**：`View.ts` 城市档 theta 45°→25°（峡谷对景）+
     右移 4.2m 偏轴 1/3 构图 + phi 68°→75°（俯角 22°→15°，天际线入画）+ 斜距
     18→20m + 慢 yaw ±1.1° 微动（reduced-motion 关）；`HeroRobot.ts` 品红 rim
     SpotLight（对置机位方位经 -headingY 反旋校正，锥角/距离双限位不污染全城）+
     接地常亮青环（additive 径向带，随 setVisible 同显隐）。
  5. **A6 光幕白爆抑制**：`TransformSystem.setVeil` 近白单色 ×1.9 → 品牌双色
     青→品红 tint ×1.3 + 峰值不透明度 ×0.7；四拍时间轴常量零改动
     （RING_IN/VEIL_IN/VEIL_OUT/DROP 原值），car_ready 帧对比度保住（帧证）。
- 帧优先实拍迭代一轮：首拍发现 22° 俯角下天空被楼群顶出画框 → 调 phi/radius/
  lookAtHeight 后天际线带 + 峡谷层次入画（V1/V2 证据帧
  `assets/visual-rubric/l1-world-{robot,veil,car}-1440.webp`，veil 中帧补上
  AL0 条款「V5 动态证据不足」的缺口）。
- 验证：`pnpm astro check` 0 err；`node scripts/audit-budget.mjs` 全过（world JS
  79.4KB/900KB）；`pnpm test:visual` 4/4（VIS-01/02 入库基线零 diff——DOM 壳未动，
  3D 帧变化只落在非像素基线的 VIS-03/04）；**全量 e2e 52/52 零回归**（17.3m，
  world-spike 灰盒锥桶闭环 WS-E2E-04 照常绿）。
- 视觉自评 **51 → 59（+8）**：V1 45→56 / V2 52→60 / V3 55→68 / V4 35→44 /
  V5 58→65 / V6 55（未动） / V7 70→72——单评自评，待 AL1 复核（±5 容差）。
  综合分 `COMPOSITE_SCORE=89.2`（LHCI 沿用 CI artifact @71e7c59 回填口径）。
- 交接：Tier A 尾件 A7-A10（HUD 面板化 + mini 楼宇快览、H1 排版、湿反射调参、
  poster 重拍——重拍必须在前三件落定后）归 Loop 2 →目标 ~62；Tier B（招牌文字
  /街道灯箱）在 A 复评达标后开工。

## CC-L2-a-tail — 视觉 Tier A 尾件 A7-A10 聚焦 PR（Loop 2 第一段，2026-08-25）

- 分支 `cursor/cc-l2-visual-a-tail-1d6f`（base：`main@8f7c86d`，L1 合入基线 89.2/
  视觉 59、AL1 独立 57）。单聚焦 PR 纪律：只做 rubric §6 A7-A10 四尾件 +
  AL1 复评门条款（§6-2 时间维证据）；Tier B B1/B2/B4 留下一 Task。
- 交付四件（A7/A8 纯 DOM/CSS 零引擎改动，A9 uniform 级调参，A10 资产重拍）：
  1. **A7 HUD 霓虹面板化 + mini 楼宇快览**：`index.astro` 挂载后 HUD 全件面板化
     （1px 霓虹描边 + 8% 填色，设计提案 §5.2——速度表/回到路口/提示丸/backend
     徽标同族）；右下常驻 5 栋 hero 楼 mini 快览（`lodProfile=hero` 单源筛选 =
     `streaming.spawnHd` 五钉，真实 URL 直跳）——销 A4 观察⑨「挂载后退化素面
     /快览随 cover 消失」。附带销 baseline §A.5-2：HUD 容器 aria-hidden →
     visibility 门控（隐藏态不可聚焦不进 AT，`aria-hidden-focus` 违例清除，
     ready 后回到路口/快览键盘可达）。
  2. **A8 排版强化（零 webfont，G-A′ 红线内）**：霓虹色单源 token
     `--neon-cyan/--neon-magenta/--neon-ink`（与 Roads `ROAD_NEON` 字面同值），
     壳内全部霓虹描边/辉光/填色经 `color-mix` 取自 token；H1 字距 0.01→0.06em +
     暗投影+青晕双层辉光；顶栏 brand/nav/backend、chip/pillars 同族化；
     壳内小字号全部提至 ≥0.75rem/12px（销 §A.5-3 BP font-size 审计项）。
  3. **A9 湿反射可见性**：`Grid.ts` 水洼掩码 smoothstep 0.42/0.78→0.3/0.64
     （覆盖率 ~18%→~38%）+ Q0 反射强度 0.55/0.14→0.8/0.18（峰值系数 0.98<1，
     bloom threshold=1 纪律不动）+ Q1 sheen 0.12→0.2；网格线强 0.55/0.8→0.3/0.45
     （棋盘格弱化——地面读作湿沥青而非发光网格）。首幕主机位帧内可见（帧证）。
  4. **A10 poster 重拍（最后执行）**：A1-A9 落地后按 rubric §4 协议 B 重截
     robot_idle 主帧（canvas 纯帧，DOM 覆盖层隐藏）——desktop 1280×720 34.5KB +
     **新增** mobile 9:16 竖版 720×1280 24.2KB（`<picture>` 断点单选，销「移动
     poster 无构图」）+ og:image 首接（三处同源同帧）。壳静态段合计 67.3KB ≤90KB。
     坑：`<picture>` 需自身绝对定位脱流——`display:contents` 方案会让空
     `<source>` 变成 grid item 抢占 `.cover` 首列（实拍翻版发现，已修）。
- AL1 复评门条款销账：固定脚本录屏 118.8s 墙钟全程（robot_idle 62.2s → Space
  68.1s → transforming 73.0s → car_ready 113.8s，SwiftShader 时间膨胀 ×~39），
  变长加速出 **9.4s** 序列 `assets/visual-rubric/l2-transform-seq.mp4`（idle 呼吸
  →充能→双色光幕→热交换→easeOutBack 落地→提示丸，veil 段楼体/斑马线全程可读）；
  关键帧 `l2-world-{robot,veil,car}-1440.webp` + 壳双端 `l2-shell-*.webp` 入库。
- 验证：`pnpm astro check` 0 err；`node scripts/audit-budget.mjs` 全过（壳 67.3KB
  /90、world JS 79.4KB/900）；`pnpm test:visual` 4/4（VIS-01 壳基线经审阅
  `--update-snapshots`——A8 排版 + A10 新 poster 的有意变更；VIS-02 在 2% 容差内
  零 diff）；**全量 e2e 52/52 零回归**（17.8m）；测试重写的 `docs/spec/assets/e2e-*`
  历史截图照例还原不提交。
- 视觉自评 **59 → 62（+3；对 AL1 独立 57 = +5）**：V6 55→70（主攻维）/ V2 60→64 /
  V1 56→59 / V3 68→70 / V4 44、V5 65、V7 72 诚实持平（本 PR 零场景内容/零动效
  改动）——达 rubric §6 Tier A 完成档 ~62。综合分 `COMPOSITE_SCORE=89.9`
  （LHCI 沿用 CI artifact @8f7c86d 回填口径 + 当轮 e2e JSON，五维齐套）；
  §A.5-2/3 两项 LHCI 修法落地后 `/` A11y/BP 有望在本 PR CI 上修（不预支计分）。
- 交接：Tier B 主批 B1/B2/B4（5 栋 hero 可读招牌、沿街灯箱/灯杆 6-10 件、剪影
  密度/高度方差）按 AL1 §6-3 开工，V4=44 仍是最低维；B3/B5 后置（动画配额与
  运镜门禁先裁决）。

---

## CC-L2-a-plus — AL2-a 复评门补洞 PR（Loop 2 第二段，2026-08-26）

- 分支 `cursor/cc-l2-visual-a-plus-1d6f`（base：`cursor/cc-l2-visual-a-tail-1d6f`
  @711339c——PR #33 未合入 main，按派发指示叠在 a-tail 上）。背景：AL2-a 审计
  A7-A10 5/5 落地、双评容差 Δ2≤5 通过，但**独立视觉 60 < 62 硬门**，Tier B 暂停；
  §6 补洞两件 = 本 PR 全部内容（零 Tier B 场景内容）。
- 交付三件（①引擎 ②DOM ③收窄条款销账）：
  1. **湿反射进主体前景（AL2-a §6-1，V2 主攻）**：根因——机器人站位 (0,0) 与
     斑马线带都在 **Roads 路面**（y=0.1）上，A9 只调了 Grid 广场（y=0.02），
     所以反射「主要停在画面右缘」。修法：`Roads.applyWetQuality` 三档湿反射层
     （Q0 **共享 Grid 的 reflector 节点**——同一镜像渲染零二次开销，反射平面高差
     8cm 在 20m 斜距不可辨；Q1 sheen / Q2 干燥），`city/index.ts` 保证 Grid 先
     切档再喂 Roads；掩码抽为 `Grid.cityPuddleMask` 单源（全城噪声 + **首幕前景
     英雄湿区**：椭圆中心 (3,8) 半轴 (13,11.5)，按实拍机位推导恰盖「主体脚下→
     南斑马线→近机位路面」，区内 0.6-1.0 噪声调制防盖章感，北向路廊零覆盖保
     干湿对比）。纪律：反射项峰值系数 0.72+0.1=0.82<1（比 Grid 0.98 更严），
     bloom threshold=1 不动。
  2. **HUD/mini 字级·留白·占比（AL2-a §6-2，V6）**：顶栏 brand/nav 12→13.6px、
     backend/skip 12→12.8px、速度表 28.8→38.4px、mini 快览行 12.8→14.4px +
     面板 15.5→17.5rem、hint/respawn 同步，内衬/行距全面放宽；另修移动端顶栏
     brand 没进跳过丸底下的既有重叠（<768px 顶栏 padding-top 3rem 让位）。
  3. **neon token 真单源（AL2-a §2 收窄条款销账，V3）**：`src/data/neon-tokens.ts`
     跨 TS/CSS 单一事实源——引擎 Roads/NeonMaterials/Reveal import + 壳
     `<html>` 内联 style 构建期注入；壳内青色 rgba 分解字面量清零（全部
     color-mix(var(--neon-cyan))）。
- **poster 三处同源重拍**（A10 纪律「永远排批次最后」随批执行）：desktop
  1280×720 37.9KB + mobile 720×1280 34.1KB（≤40KB，壳合计 80.9KB ≤90KB）；
  mobile 从 2160×1350 高清帧按主体居中裁 9:16（销「横图硬裁」，构图优于 a-tail
  的贴边裁切）。坑：canvas 纯帧截图要先量「视口高 − 画布高」补偿顶栏占高，
  否则 1280×720 视口实拍出 1280×668（纵横比 1.92 构图错）。
- 验证：`pnpm astro check` 0 err；`node scripts/audit-budget.mjs` 全过；
  `pnpm test:visual` 4/4（VIS-01 壳基线经审阅 `--update-snapshots`——顶栏字级 +
  新 poster 有意变更；VIS-02 在 2% 容差内零 diff）；**全量 e2e 52/52 零回归**；
  LHCI 本轮 exact-tree 实采。同机位前后对比帧 `l2-world-robot-1440.webp`（前）
  vs `l2a-world-robot-1440.webp`（后）+ 壳双端 `l2a-shell-*.webp` 入库。
- 视觉自评 **62（校准基线 = AL2-a 独立分 60 逐维原值，非 a-tail 自评轨道）**：
  V2 61→66（70 段四条件满足三条，唯雾单层压段界）/ V6 69→73 / V1 59→61 /
  V3 68→70；V4 40、V5 63、V7 70 诚实持平。四处加分全部有帧内可见证据。
- 交接：AL2-a 复评达门（≥62）后启动 Tier B B1/B2/B4；V4=40 仍最低维；
  V2 下一段提分需雾分层（Tier B/C），V6 再上要 diegetic 面板/字体选型（Tier C）。

## CC-L2-tier-b — Tier B 主批 B1/B2/B4（Loop 2 第三段，2026-08-26）

- 分支 `cursor/cc-l2-visual-tier-b-1d6f`（base：`cursor/cc-l2-visual-a-plus-1d6f`
  @bdcd29d，PR #34 之上叠栈）。背景：AL2-a-plus 复评独立视觉 62 达门
  （`cyber-city-loop2-a-plus-audit.md`），放行 **B1/B2/B4 三件**；B3 飞行光轨、
  B5 变形运镜按放行边界继续后置，本 PR 未越界。
- 交付三件（V4 主攻，全程序化零新增资产、零外部字体、零网络请求）：
  1. **B1 hero 五栋可读招牌（`city/BuildingSigns.ts` 新建）**：rubric §6 B1 原文
     「TextCanvas 出楼名纹理 → 双面全息板替换占位箍带」落地，每栋两件套——
     ① 楼顶双面全息板（`title.en` 大写楼名，AdditiveBlending + 静态扫描纹 +
     慢呼吸脉动；**脉动继承被替换箍带的『招牌脉动』配额席位，CITY-03 ≤2 处不变**：
     ThemeTowers 占位箍带同 PR 撤场）；② 临街立面灯箱招牌（常亮面板 +
     Chebyshev 细描边，挂高压双阶收分楼下段满宽区 clamp(0.34h, 9, 25)m——
     96m 塔的楼顶板出主机位画框，街面认楼由立面件承接）。立面槽位数据驱动：
     楼心距主轴 ≤100m 的面向道路立面各挂一面（内环四塔 ×2 + garage ×1 = 9 面，
     同楼多面 mergeGeometries 合 1 draw call）。draw call 台账：5 全息板 +
     5 立面合并网格 = 10。材质工厂 `createHoloSignMaterial` /
     `createSignPanelMaterial` 进 `NeonMaterials.ts`（Premortem P9 单材质系统
     纪律；纹理采样沿用 TextCanvas flipY=false 的 v.oneMinus() 口径）。
  2. **B2 街道灯杆/灯箱 10 件（`city/StreetLamps.ts` 新建）**：杆+悬臂+灯头盒+
     挂旗广告灯箱 mergeGeometries 合 1 份几何，按路轴色族分 **2 个 InstancedMesh**
     （rubric B2「1-2 draw call」原文达标）；发光件用 `positionGeometry` 本地
     坐标带掩码切出（`createStreetLampMaterial`，布局常量与几何同源防错位），
     常亮无时间项不占动画配额。**neon 色单源**：青=南北/品红=东西直取
     `neon-tokens.ts`（非派生字面量）。摆位：北廊 4 杆左右交错（主机位纵深
     节奏）+ 南段 2 + 东西大街 4（含 garage 门前段两杆，VIS-04 帧内可见）；
     全部路缘外 1.5m，已核对不侵 parkingBay（最近 = garage bay 距 11m > r8）。
     物理 = 1 fixed 刚体 × 10 cylinder（隔离墩同款 model:null 注册）。Q0 湿地
     真镜像渲染自动收灯箱倒影（AL2-a-plus §5「灯箱给湿地面有语义反射源」）。
  3. **B4 剪影密度/高度方差（`CitySilhouette.ts`）**：填充 48→84、带宽
     296-436m；高度方差三档（基底 28-96 ≈68% / 中挑 96-134 ≈22% / 地标
     132-196 ≈10%，地标窄足迹 + 压外带 40%+）。**北向视锥护栏**（AL2-a-plus
     §5 裁决第 2 条「避免剪影填充吃掉天空开口」的执行体）：固定主机位视线朝北，
     透视收敛让 z<-120 的走廊旁填充在帧内落进路廊尽头天空开口——平行避让管
     不住透视，北侧带 |x| 下限随 -z 线性外扩（z=-436 处 105m），角度游走重掷 +
     末尾钳位兜底；首版实拍确认开口被吃后加此护栏，二拍恢复（前后帧留档）。
     连带修复既有瑕疵：填充写入顺序改模 4 交错——原顺序下 applyQuality 裁尾
     会把 Q1/Q2 裁成半圈天际线缺口，现低配档保留全环均匀子集。
- 验证：`pnpm astro check` 0 err；`node scripts/audit-budget.mjs` 全过（world
  chunk 81.7KB ≤900KB）；`pnpm test:visual` 4/4（**VIS-01/02 壳基线零 diff
  未重生成**——本 PR 零壳改动）；**全量 e2e 52/52 零回归**（25.7m）；本地
  LHCI（standalone lighthouse 12，7 URL ×3）`/` 与 `/home/` 四项中位数全 100
  不降；统一计分 COMPOSITE_SCORE=91.3、availableWeight=1、missing=[]。
  坑：本 VM `pnpm lhci:local` 因 pnpm 布局 tslib@1 解析冲突（rxjs←inquirer←
  @lhci/cli）致 performance/best-practices NaN——CI 用 treosh action 自带
  lighthouse 不受影响，本地改 `npx @lhci/cli collect` 独立安装采集。
- 帧证据：`l2b-world-robot-1440.webp`（主机位后帧：AGENT NEXUS 双立面招牌 +
  湿地倒影 + 北廊灯杆 + 分层剪影 + 天空开口保留）vs `l2a-world-robot-1440.webp`
  （前帧）；`l2b-world-poi-garage-1440.webp`（POI 深链：CARCONCEPT GARAGE
  立面招牌 + 品红灯杆）。V5 沿用 `l2-transform-seq.mp4`（动效零改动）。
- 视觉自评 **65（校准基线 = AL2-a-plus 独立分 62 逐维原值）**：V4 40→56
  （主攻维 +16，招牌文字层+道具层双齐进 50-65 段中位）/ V1 60→63 / V7 70→72；
  V2 65 段顶持平（审计已裁定越界须分层雾，本批未动光照架构）、V3/V5/V6 持平。
  与派发目标 ≥68 差 3：Tier B 档 ~70 按五件全落估算，本批按放行边界只做三件
  （B3/B5 后置），不虚报预支。
- 交接：待 CC-AL2 按同一 rubric 独立复评；Tier B 余件 B3/B5 + 分层雾是
  下一段主路径（→~70）；招牌覆盖扩 standard 七栋、灯杆密度上调是 V4 的
  低风险追加位（本批按 spec 未扩）。

## CC-L3-content — 内容一致性批：B2 灯箱内容 + poster 三面同源（Loop 3 首批，2026-08-26）

- 分支 `cursor/cc-l3-content-poster-1d6f`（base：`main@76950e7`，AL2 终审基线
  综合 91.0 / 独立视觉 64）。单聚焦 PR 纪律：只做 AL2 终审 §7 非阻塞保留项
  #1 #2 收口（`cyber-city-loop2-audit.md` Loop 3 裁决第 1 条原文「先给 B2 灯箱补
  TextCanvas 内容；所有运行时视觉落定后，最后重拍 desktop/mobile/OG poster」）；
  禁做项（分层雾、B3 光轨、B5 运镜、新楼/新资产管线）未越界。
- 交付两件（poster 按 A10 纪律排批次最后）：
  1. **B2 灯箱 TextCanvas 广告内容（AL2 §7 #2）**：rubric B2 施工说明「灯箱纹理走
     TextCanvas 程序化」兑现——10 件挂旗灯箱各配差异化竖排霓虹标语（与产品线/
     楼名弱关联：AI CORE/DRIVE/EDGE AI/FOUNDRY/TTS LIVE/39 LANGS/SAY HI »/
     WORKS →/GARAGE/TUNE-UP，行序=摆位序，`StreetLamps.SLOGANS` 注释逐件对楼）。
     实现：① 单张 TextCanvas atlas（10 行 × 128px 等高，行宽 308px ≈ 灯箱大面
     2.5/1.04 纵横比——旋转映射后字形零变形；系统等宽栈，零外部字体零网络请求）
     + 行内下划饰线（偶数行细通栏/奇数行短粗条，广告排版层次）；②
     `createStreetLampMaterial` 广告内容层：`instanceIndex + rowStart` 逐实例选行
     （两色族材质共享 atlas），90° 竖排映射（阅读自上而下、字形顶朝观者右手，
     港式挂旗惯例；±Z 双面镜像选择保双面正读）+ Chebyshev 描边框 + 行号 %3==2
     反相（亮板暗字，面板 0.95 < bloom threshold 1 不入泛光保暗字可读；其余
     暗板亮字 1.9 与楼身立面招牌同档 bloom 锚点）。**draw call 台账不变**（仍
     2 个 InstancedMesh），几何/物理/摆位零改动，常亮无时间项（CITY-03 配额
     ≤2 处不变）。坑：合并几何无独立 UV 通道——面板 UV 从 `positionGeometry`
     本地坐标 + `BANNER_BOX` 单源常量推导（几何/掩码/UV 三处同源防错位）；
     行内 v 压 [0.01,0.99] 防 clamp 边缘采到相邻行。
  2. **poster 三面同源重拍（AL2 §7 #1，最后执行）**：B2 内容落定后按 rubric §4
     协议 B 重截 robot_idle 主帧——2560×1440 高清 canvas 纯帧一拍两吃：desktop
     1280×720 降采样（超采 AA 补软渲染无 MSAA）38.6KB gzip + mobile 720×1280
     主体居中裁 9:16 34.9KB（各 ≤40KB；og:image 与 desktop 同文件）。新帧含
     Tier B 全套：AGENT NEXUS 双件招牌、北廊灯杆灯箱广告（DRIVE 可读）、
     分层剪影——销「reduced-motion/移动端/无 3D 用户看到的仍是 A-plus 城市」。
     坑复用：视口高补偿顶栏占高 53px（a-plus 口径），DOM 覆盖层隐藏时补
     `.world-ritual`（变形 CTA 是引擎注入件，不在壳 selector 表内，首拍入镜返工）。
- 验证：`pnpm astro check` 0 err；`node scripts/audit-budget.mjs` 全过（poster
  38.6/40KB、壳静态段合计 82.2/90KB、world chunk 82.2/900KB、受保护 14 页
  world 命中 0、外部资产新增 0 字节）；`pnpm test:visual` 4/4（VIS-01 壳基线
  经审阅 `--update-snapshots`——新 poster 有意变更；VIS-02 在 2% 容差内零 diff
  未重生成）；**全量 e2e 52/52 零回归**（17.0m，@smoke3d 3/3）；本地隔离 LHCI
  （独立 npm 布局 @lhci/cli@0.15.1 + Playwright Chromium，7 URL ×3 = 21 LHR）
  `/` 与 `/home/` 四项中位数全 100 不降，assert exit 0；统一计分
  COMPOSITE_SCORE=91.5、availableWeight=1、missing=[]。
- 帧证据：`l3-world-robot-1440.webp`（主机位后帧：AI CORE/DRIVE 灯箱竖排标语
  可读 + EDGE AI 远位反相亮板）vs `l2b-world-robot-1440.webp`（前帧：灯箱仍是
  通用条纹发光板）；`l3-world-poi-garage-1440.webp`（POI 深链：TUNE-UP 品红
  灯箱近景）；`l3-lamp-ad-cyan.webp` / `l3-lamp-ad-magenta.webp`（双色族特写）。
  V5 沿用 `l2-transform-seq.mp4`（动效零改动）。
- 视觉自评 **66（校准基线 = CC-AL2 终审独立分 64 逐维原值）**：V4 53→59
  （主攻维 +6：「灯箱无 TextCanvas 内容」判词销账）/ V1 61→64（poster 漂移
  判词销账 + 中景文字锚点）/ V6 72→74（三面同源恢复）/ V7 72→73（街道层
  叙事延伸）；V2 65 段顶持平（越界须分层雾——本批禁做项，不预支）、V3/V5
  持平。达派发目标「自评 ≥66」。
- 交接：待 CC-AL3 独立复评；Loop 3 主攻批按 AL2 §7 裁决第 2 条开分层雾/低云带
  （V2 破 65 段顶 + V1 远景）；B3/B5 按裁决第 3 条分批后置（B3 先书面统一
  CITY-03 配额并验证 Q2 关闭；B5 先补 reduced-motion 直出与运镜门禁）。

## CC-L3-ATM — 分层雾/低云带/大气纵深（Loop 3 主攻批，2026-08-26）

- 分支 `cursor/cc-l3-layered-atmosphere-1d6f`（base：`main@2e6126c`，AL3-B2C 放行
  基线独立视觉 65 / 综合 91.3）。单主题 PR 纪律：只做 AL3-B2C §5 放行的分层雾/
  低云带/大气纵深（V2 主攻、兼顾 V1）；禁做项（IBL/AO、B3 光轨、B5 运镜、
  poster 重拍、新贴图资产）未越界，全程序化 TSL 零新资产零新 draw call。
- 交付一件（`Sky.ts` 单文件扩展成大气模块——任务书「扩展 Sky.ts 或新建大气层」
  取前者：雾色/辉光/云带三件本就同色轴，单文件防色相双源）：
  1. **分层距离雾（`scene.fogNode` 接管 CC-L1 单层线性 `THREE.Fog(140,850)`）**：
     ① 中景 haze（50-520m 缓坡 ×0.42）+ 远景纱帘（260-640m 陡坡 ×0.40）双坡
     叠加——中/远衰减节奏可分；② 近地雾床（世界高度 <30m 增密 ×0.38、随距离
     50-380m 展开）——远楼「底先隐、顶后隐」，纵向也有层次，主体 20m 机位处
     严格为 0；③ 远雾色按视线方位染向青⇄品红光污染（`HORIZON_GLOW` 单源，
     与穹顶辉光带/Roads 双主轴同色相），近中景为无色相抬亮蓝灰；④ 总量封顶
     0.86 保远景剪影暗形（防「雾更浓=层次更好」假象，AL3-B2C §5 边界第 4 条
     「不得把无界透明 overdraw 包装成雾层」——fogNode 是材质输出级逐片元混合，
     零 overdraw 零第二次渲染）。
  2. **地平线低云带（穹顶着色内嵌）**：`mx_noise_float` 两倍频程序化平流云
     （3D 方向域直采零接缝、纵向 ×26 压扁成条状），带窗仰角 0.012-0.26、峰值
     压在首幕可见天空带（俯角 15°/FOV 42° 下画框顶 ≈ 仰角 +6°）；云底被城市
     辉光自下点亮（0.45→1.15）、云体半遮辉光带（×0.45）——「剪影 → 辉光+云 →
     夜空」三段远景。**静态无时间项**（云漂移会占 CITY-03 配额 ≤2 处，按顾问稿
     「默认静态层」纪律不开）。
- 档位与开关（模块级共享 uniform，切档零材质重建零重编译，neonUniforms 同款）：
  Q0 全效（layerMix 1/云细节 1）· Q1 简化（0.8/平云 0.35）· Q2 关闭走廉价兜底
  ——`layerMix×master=0` 时雾严格退回 CC-L1 线性 Fog(140,850) 等价式 + 云带清零；
  Q2 兜底与「关雾」取证开关（`scene.userData.cityAtmosphere.setLayers`，#debug
  句柄可达）共用同一条退化路径，归因干净。bloom threshold=1 纪律：云带峰值
  <0.6、雾色峰值 <0.19，全大气 <1 不触泛光。
- 验证：`pnpm astro check` 0 err；`node scripts/audit-budget.mjs` 全过（world
  chunk 82.8/900KB，外部资产 0 新增）；`pnpm test:visual` 4/4（VIS-01/02 壳基线
  零 diff——本批零 DOM/poster 改动）；**全量 e2e 52/52 零回归**（17.6m，
  0 failed/0 skipped/0 flaky，@smoke3d 3/3）；本地隔离 LHCI（独立 npm 布局
  @lhci/cli@0.15.1 + Playwright Chromium，7 URL ×3 = 21 LHR，本轮 perf 有值无需
  CI 回填）`/` 与 `/home/` 四项中位数全 100 不降，assert exit 0；统一计分
  COMPOSITE_SCORE=91.5、availableWeight=1、missing=[]。历史文档截图被全量
  e2e 重写后已按纪律还原（e2e-batch1/e2e-integration 两目录）。
- 帧证据（同构建参数开关对照，非跨构建前后帧——比历史协议归因更严）：
  `l3atm-world-robot-1440.webp`（开雾：主体+湿反射清晰 / 中景 AGENT NEXUS·
  AI CORE 可读轻纱 / 远景融入方位辉光 + 东天低云带）vs
  `l3atm-world-robot-atmoff-1440.webp`（关雾 = 旧单层暗雾，与 main 前帧
  `l3-world-robot-1440.webp` 同构图互证）；POI 同对照
  `l3atm-world-poi-garage(-atmoff)-1440.webp`（TUNE-UP 双帧同读不回退）；
  低云带特写 `l3atm-cloudband-east.webp`（条状云 + DRIVE 灯箱同帧可读）；
  分档验证帧 `l3atm-world-robot-q1/q2-1440.webp`。V5 沿用 `l2-transform-seq.mp4`
  （动效零改动）。
- 视觉自评 **66（校准基线 = CC-AL3-B2C 独立分 65 逐维原值）**：V2 65→70
  （主攻维 +5：破 50-65 段顶的审计裁定条件「帧内可辨近/中/远大气层次」以
  同机位开关对照帧兑现，取 70-85 段底沿不多探——无 IBL/AO/体积光欠账仍在）/
  V1 63→65（+2：纵深扁平判词改善，段顶封住——构图本体未动）；V3/V4/V5/V6/V7
  诚实持平（云带/分层收益只计一次不在 V4 重复计；动效/DOM/叙事零改动）。
  加权 66.3→66，综合 91.5。
- 交接：待 CC-AL3-MID 审 B2C+ATM 集成树（审计口径已预设「poster 尚未重拍」）；
  若独立视觉 66-67 按最低维（V4 57）在 B3 光轨/B5 运镜里裁一件；**poster 三面
  重拍（CC-L3-POSTER）须在 Loop 3 收口前落地**——本批 runtime 大气已改画面，
  AL2 §7 #1 漂移在专批清账前是已知链上状态。

## CC-L3-B3 — 飞行光轨（Loop 3 条件批，2026-08-26）

### CITY-03 循环动画配额书面登记（开工前先行落档，A4 观察 B 口径收口）

- 依据：CC-AL3-MID 中审裁决——集成树独立视觉 **66**、最低维 **V4** 为剩余瓶颈，
  按顾问稿 A.2 条件行开 `CC-L3-B3`（B5 顺延 Loop 4，不与 B3 连续赌分）；
  父代理 B3 任务书即本登记的书面授权（顾问稿风险表「未裁决则 B3 自动延期」
  的解锁件）。
- **计席口径**（承 A4 观察 B「shader 不算、ticker 算不算」悬空项，本批统一）：
  帧内可见的**持续时间性动画计席，与驱动源无关**（TSL `time` / Ticker / DOM 同权
  ——防「换驱动源绕配额」）；静态采样（全息扫描纹、静态云带）与常亮
  （`pulseSpeed=0` 语义）不计席。
- 席位台账（本批登记后 3/3）：
  | # | 席位 | 驱动 | 出处 |
  |---|------|------|------|
  | 1 | HeroRobot idle 呼吸灯 | `Reveal.update` Ticker | CC-E5/E6 |
  | 2 | 楼顶全息板慢呼吸脉动 | shader `neonTime` | CC-L2-B1（继承占位箍带席位） |
  | 3 | 飞行光轨 2-3 条航线（单 InstancedMesh 系统计 1 席） | shader `time` | 本批 CC-L3-B3 |
- **配额上限调整：Phase 0 运行时循环动画 ≤2 → ≤3**。PRD CITY-03 描述列
  「飞行光轨粒子」为交付件而其验收行只留 2 席（idle 呼吸 + 招牌脉动）——
  该自相矛盾即 A4 观察 B 敞口；本登记以父代理 B3 任务书为准扩 1 席，
  Phase 3「城内同屏循环动画 ≤5 处」天花板不变。
- 任务书锁定参数（越界即撤）：航线 **2-3 条**、只做**中远景**（航线距首幕
  主体 ≥100m，不入近景不抢主体）、总点数 **≤800**、**Q2 明确关闭**（mesh 隐藏
  + 时间轴冻结双保险）、Q0 全效 / Q1 简化、`prefers-reduced-motion` 冻结时间轴、
  dispose 随 Game 场景遍历闭合；**禁做项 = 雾、运镜、poster、B5**。

### 交付与验证

- 分支 `cursor/cc-l3-b3-flight-trails-1d6f`（base：`cursor/cc-l3-layered-atmosphere-1d6f`
  @ `d258e23`，AL3-MID 放行基线独立视觉 66）。单主题 PR 纪律：只做飞行光轨；
  禁做项（雾、运镜、poster、B5）零字节触碰——`Sky.ts`/`View.ts`/
  `TransformSystem.ts`/poster 资产全部零改动。
- 交付一件（`FlightTrails.ts` 单文件新增 + `city/index.ts` 装配 6 行）：
  **中远景飞行光轨 3 航线 630 点**（≤800 任务书上限），单
  `InstancedMesh(PlaneGeometry 1×1, SpriteNodeMaterial)` = 全部航线 **1 次
  draw call**。每实例 = 拖尾上一个 billboard 光点，位置由航线参数（椭圆环 +
  高度起伏）+ TSL `time` 顶点级解析求出——**零逐帧 JS update、零 Ticker 订阅、
  零 CPU 写缓冲**；`θ = phase0 + time·ω − tailT·signedSpan`，机头亮/大、尾端
  暗/小/微散（长曝光光轨读法）：
  1. **航线 M 中景环**（品红，单架次）：内外环楼群之间走廊（z −110..−220，
     离主体最近 111m），穿行 now-signal/autodrive-lab 楼隙（避楼核对过）；
  2. **航线 F 远景环**（青，双架次错拍 π 对开）：外环外侧、剪影带之前
     （z −260..−400）——远景暗剪影上的亮线，与低云带/辉光同帧；
  3. **航线 H 西北远环**（青，双架次）：西北象限，画框左半纵深层。
     巡航高度 20-30m 压在首幕可见天空带（仰角 3-5° < 画框顶 +6°）。
- 纪律对齐：遮挡走深度测试（depthWrite=false + depthTest 保留——光轨穿楼即被
  剪影吞没，穿行空间感自证）· additive 逐点 0.3、机头叠加峰 ≈1.3 略过 bloom
  threshold=1、拖尾速降阈下（招牌 1.9-2.4 辉光名额不挤占）· `material.fog=false`
  + 手工 200-620m 距离衰减（additive 片元吃 fogNode 会「加出雾灰」，改与 ATM
  远景纱帘同带手工融入）· 色相锁 NEON 青/品红双主轴 + 机头 40% 暖白（窗色三族
  同轴零新色相）· 零贴图零资产全程序化。
- 档位（`applyQuality` 接 city 装配段 quality.events，模块级 uniform +
  mesh.count/visible）：Q0 全效 3 航线 / Q1 简化 2 航线（route-major 实例序
  `mesh.count` 裁尾，CitySilhouette 同技法）× 强度 0.8 / **Q2 明确关闭**
  （`visible=false` + 强度/时间轴双归零——不画，drawCalls 直接 −1）；
  `prefers-reduced-motion` 冻结时间轴（光轨定格静态光带，View thetaDrift 同款
  「偏好静止即静止」纪律）。取证开关
  `scene.userData.cityFlightTrails.setTrails(0|1)`（cityAtmosphere 同协议）。
- 验证：`pnpm astro check` 0 err；`node scripts/audit-budget.mjs` 全过（world
  chunk 83.9/900KB，+1.1KB，外部资产 0 新增）；**全量 e2e 52/52 零回归**
  （17.8m，0 failed/0 skipped/0 flaky，@smoke3d 3/3；VIS-01/02 壳基线零 diff
  未重生成——本批零 DOM/poster 改动）；本地隔离 LHCI（独立 npm 布局
  @lhci/cli@0.15.1 + Playwright Chromium——workspace pnpm 布局的 lighthouse 触
  `tslib.__spreadArray is not a function` 兼容坑致 perf/BP 全 NaN，按 ATM 先例
  换隔离布局后 7 URL ×3 = 21 LHR perf 全有值，无需 CI 回填）`/` 与 `/home/`
  四项中位数全 100 不降，assert exit 0；统一计分 **COMPOSITE_SCORE=91.8**、
  availableWeight=1、missing=[]。drawCalls 台账（#debug 实测，WebGL2 腿）：
  Q0 92 / Q1 47 / Q2 34——光轨结构性贡献恒为 1 draw call（setTrails(0) 取证
  开关是 uniform 加零不减 draw，Q2 关闭才摘 mesh）。
- 帧证据（同构建参数开关对照 + 时间维双证）：`l3b3-world-robot-1440.webp`
  （开：品红拖尾穿行 AGENT NEXUS 楼隙 + 青色机头拖尾划过右上天空带）vs
  `l3b3-world-robot-trailsoff-1440.webp`（关 = ATM 批帧面）；真实运动证据 =
  `l3b3-world-robot-t2-1440.webp`（+8s 机头位移可测、品红航线出画）+ 22s 定机位
  录像 `l3b3-trails-motion.mp4`（顾问稿验收行「动态证据能区分真实运动与静态
  emissive」）；分档帧 `l3b3-world-robot-q1/q2-1440.webp`；POI 深链
  `l3b3-world-poi-garage-1440.webp`（主体近景零回退）。
- 视觉自评 **67（校准基线 = CC-AL3-MID 独立总分 66 + ATM 批逐维向量）**：
  V4 57→60（主攻维 +3：AL3-MID 点名判词「零车流/雨丝/光轨」中光轨项销账，
  段内保守取分——招牌覆盖/车流/雨丝欠账仍在）；V1/V2/V3/V5/V6/V7 诚实持平
  （生命感收益只计一次入 V4，不在 V1/V5 重复计）。加权 66.75→67，综合 91.8。
- 交接：待 CC-AL3-B3 审 exact tree（只审动画配额/Quality/帧内密度增益/性能）；
  若独立视觉仍 <68，本 Loop 停止追加运行时效果（B5 顺延 Loop 4，不连续赌分）；
  **poster 三面重拍（CC-L3-POSTER）在运行时冻结后收口 Loop 3**——本批 runtime
  又改画面，poster 漂移债继续挂专批。

## CC-L3-POSTER — poster 三面同源重拍 + VIS-01 基线（Loop 3 收口批，2026-08-26）

- 分支 `cursor/cc-l3-poster-three-surface-1d6f`（base：`cursor/cc-l3-b3-flight-trails-1d6f`
  @ `8d523b7`，AL3-B3 裁决基线：独立视觉仍 66、B5 HOLD——运行时视觉冻结）。
  单聚焦 PR 纪律：只重拍 desktop/mobile/OG poster + VIS-01 壳基线（清 AL2 §7 #1
  口径下 ATM/B3 两批积累的三面漂移；A10 铁律「poster 重拍永远排批次最后」=
  Loop 3 运行时冻结后收口批）；**零 3D/CSS 构图改动**——`src/` 全域零字节触碰，
  diff 仅 2 张 webp + 1 张基线 png（+文档）。
- 重拍协议（rubric §4 协议 B，L3-content 口径复用）：preview 伺服 dist →
  2560×1493 视口（顶栏补偿 53px——phase1 用 reduced-motion 拦截态实测量取，
  与 a-plus 口径复核一致）→ 等 `data-state=ready` + `data-world-state=robot_idle`
  + 稳帧 8s → 隐藏 DOM 覆盖层（.skip/.hud/.hud-city/.hint/.cover/**.world-ritual**）
  → `visibilitychange(hidden)` 暂停 RAF（合成器留末帧，绕开 SwiftShader 下 RAF
  独占主线程的 screenshot 超时）→ canvas 纯帧 2560×1440 一拍两吃：desktop
  1280×720 lanczos3 降采样（超采 AA 补软渲染无 MSAA）q=68 → **39.7KB gzip**；
  mobile 720×1280 主体居中裁 9:16 q=76 → **38.0KB gzip**（各 ≤40KB）；og:image
  与 desktop 同文件三面同源。坑（新增留档）：「主体居中」= **crop 中心对机器人
  （x≈870/2560），非画幅居中**——主体在画面左 1/3，画幅居中裁 (left=875) 会把
  主体切半出画，首裁翻车按旧 mobile 帧构图对齐后重裁 (left=465)。
- 新帧带入两批运行时增量（销漂移的实证）：右地平线 ATM 低云带/大气纵深入镜 +
  右上空域 B3 青色机头拖尾入镜；机位/构图与旧帧逐像素同构（相机零改动自证）。
- VIS-01 壳基线重生成：新旧帧落在 toHaveScreenshot 2% 像素容差内，
  `--update-snapshots`（默认 changed 模式）判定通过**不触发重写**——按任务书
  「重拍 VIS-01 基线」改 `--update-snapshots all` 强制重生成（坑留档：poster
  级有意变更未必超容差，重拍基线必须显式 all）；VIS-02 在 2% 容差内零 diff
  未重生成（惯例口径）。
- 验证：`node scripts/audit-budget.mjs dist/` 全过（G-A′ poster 39.7/40KB、
  壳静态段合计 86.5/90KB、world chunk 83.9/900KB 零变化、受保护 14 页命中 0）；
  `pnpm test:visual` 4/4；**全量 e2e 52/52 零回归**（18.2m，0 failed/0 skipped/
  0 flaky，@smoke3d 3/3）；本地隔离 LHCI（B3 同口径：workspace pnpm 布局
  `pnpm lhci:local` 复现 tslib 兼容坑 perf/BP 全 NaN → 独立 npm 布局
  @lhci/cli@0.15.1 + Playwright Chromium，7 URL ×3 = 21 LHR perf 全有值）
  `/` 与 `/home/` 四项中位数全 100 不降（poster 为 `/` LCP 资源，+1.1KB gzip
  无感），assert exit 0；统一计分 **COMPOSITE_SCORE=91.8**、availableWeight=1、
  missing=[]（与 B3 批持平——本批视觉分不动，唯一变量 LHCI 复测不降）；测试
  重写的 `docs/spec/assets/e2e-*` 历史截图照例还原不提交；抓帧脚本为临时件
  不入库（协议全文见本小节）。
- 视觉自评持平 **67（零运行时改动，不重复计分）**：poster 同源性收益在
  L3-content V6 已计过一次，本批只清 ATM/B3 后的链上已知漂移（B3 自评 V6 73
  「本维不预扣」的对价 = 本批销账，score JSON 已加批注）。交接：AL2 §7 #1 /
  ATM·B3 交接项「poster 三面重拍须在 Loop 3 收口前落地」销账；Loop 3 全链
  （B2C+ATM+B3+POSTER）就绪，待 CC-AL3 终审 ≥68 硬门裁决。

<<<<<<< HEAD

- 分支 `cursor/cc-l4-b5-transform-camera-1d6f`（base：`main@ecb0fd3`，运行时树 ≡
  `main@70396eb` Loop 3 全链合入 tip——差量仅编排看板文档）。AL3 终审 NO-GO
  （独立 66 <68）后按其 §6 建议受控开启的 Loop 4 唯一主题；派发边界：只做充能
  推镜 + 落地微震，不改状态机总节拍、车辆物理、雾、光轨、HUD、poster。实装
  `src/` 仅 2 文件（`view/View.ts` + `player/TransformSystem.ts`，+83 行）。
- 实现：`View.ritualCam` 双通道（TransformSystem order-4 写入 → View order-7
  同帧消费）——`dollyIn` 为斜距乘法（×(1−0.07·dollyIn)，静止 20m→18.6m），
  `shakeY` 为朝向解算后的相机垂直平移；两者为 0 时 ×1/+0 **IEEE 位级恒等**，
  robot_idle 首幕零漂移与驾驶接管零残余不靠补间收敛、由恒等式机器保证。
  时间轴映射：充能段 easeInQuad 蓄力 0→1（与充能环展开同拍）→ 光幕段峰值定格
  （waitFor 多转同帧）→ 落地/散幕段回放归零（completeRun 前机位已回基线）；
  car 落地帧起 0.3s 垂直微震（解析阻尼正弦按时钟直出，SwiftShader 大 dt 无积分
  发散，终帧强制归零）+ `View.roll.kick(0.25)` 微滚（folio 碰撞弹簧小件首次
  接线，~0.5s 自收敛）。reduced-motion 不建 ritual 时间轴 → 通道恒 0 全程不动镜；
  dispose 显式归零；运镜为一次性瞬态，CITY-03 循环动画配额零占用。
- 幅度偏差登记（rubric §6 Tier B5 施工基线 → 实装）：推镜 5% → **7%**（5% 在
  42° FOV / 20m 机位下主体仅放大约半档，录屏几乎不可读；7% 白爆 A/B 峰值仅
  +0.22pp）；微震 0.15s → **0.3s 衰减窗**（能量集中前 0.15s，解析包络终帧归零）。
- 录屏协议（新坑+新技法留档）：SwiftShader ~0.7-1fps 下 Playwright 实时录像是
  慢动作废片；本批用 **CDP Page.startScreencast 逐合成帧存 PNG**——
  `Ticker.maxDelta=1/30` ⇒ 每合成帧 ≈ 1/30 设计秒，**30fps 拼装 = 设计时间等速
  视频**（实测变形窗 29-32 帧 ≈ 1.05s 设计窗自证映射成立）。前置条件：注入 CSS
  隐藏全部 DOM 覆盖层（`.skip/.topbar/.hud/.hud-city/.hint/.cover/.world-ritual`），
  否则 CSS 进度条动画混入合成流打乱帧↔tick 1:1 映射。产物
  `l4b5-transform-camera-5s.mp4`（1440×900/30fps/160 帧/5.33s 设计秒，固定脚本
  robot_idle 23 帧→Space→transforming 29 帧→car_ready→W 接管 driving 86 帧→
  松键滑行）。坑：350ms 遥测采样会错过微震首 2-3 个大峰（car 首帧管线编译墙钟
  停顿），微震取证以帧对 f00055/f00056（整帧垂直位移+微滚）为准，遥测只证衰减
  尾与终态归零。
- 三门专项证据：①**驾驶零漂移** `final-drift.json`（w-up 滑行后 ×3 采样：
  dollyIn=0、shakeY=0、radiusDelta=0 全部精确零，roll ~2e-9 rad）；
  ②**reduced-motion 不动镜** `reduced-report.json`（instant swap 前后相机
  position/quaternion **位级相同**，且与 main 两跑同值
  [12.038319925404643, 5.219157938671525, 15.878213742097875]、斜距
  20.165277777777778——「robot_idle 稳定帧零漂移」按机位位级恒等销账；像素级
  残差 12.8% 为既有窗闪/呼吸灯时间相位噪声：main-vs-main 双跑地板 2.7%@Δt=0.07s、
  跨构建 Δt≈1.1s 同族放大，diff 热图几何边缘全黑零位移）；③**变形帧不白爆**
  同脚本 A/B：变形窗逐帧近白（min(r,g,b)≥240）峰值 B5 **1.41%** vs main
  **1.19%**（+0.22pp = 推镜覆盖增长比例项；additive 光幕逐像素亮度距离不变，
  A6 白爆抑制原样有效）。poster 三面按 AL3 条件⑤「没有漂移则只复核 hash/消费链」
  处理：机位位级恒等 + `src/` 外零文件触碰 → 免重拍。
- 验证：`astro check` 0 errors/0 warnings/58 hints；`pnpm test:visual` 4/4
  （VIS-01/02 基线零 diff 未重生成）；**全量 e2e 52/52 零回归**（18.1m，
  0 failed/0 skipped/0 flaky，@smoke3d 3/3）；`node scripts/audit-budget.mjs`
  全过（world chunk 84.2/900KB，+0.3KB；poster/壳静态段零变化）；统一计分
  **COMPOSITE_SCORE=92.0**、availableWeight=1、missing=[]（LHCI 来源：CI
  artifact @ commit ecb0fd3 run 32967573079，`/` 与 `/home/` 四项均 100——本 VM
  SwiftShader LHCI null 限制的登记口径，AL4 终审另做隔离 LHCI 复采）；测试重写
  的 23 张历史说明截图照例还原不提交；抓帧脚本为临时件不入库（协议全文见本小节）。
- 视觉自评 **68（校准基线 = CC-AL3 终审独立向量 raw 66.45，V4 从上轮自评 60
  对齐审计 58 不护短）**：V5 63→70（主攻维 +7：AL3 判词「相机仍静止，B5 未做」
  以录屏/遥测/恒等/白爆四组证据销账，越段进 70-85 段底保守取分——镜头运动仅
  覆盖变形节拍，入场/POI/出口无运镜，次级动效欠账保留）；其余六维诚实持平。
  加权 67.50→68，综合 ≈92.0。
- 交接：CC-AL4 已放行（独立视觉 **68**，Loop 4 GO）；见 `loop4-audit.md`。

## CC-Rendering-Audit — 渲染架构全量审视（只读调研，2026-08-26）

分支 `cursor/cc-rendering-arch-audit-1d6f`；交付 `docs/research/cyber-city-rendering-architecture-audit.md`。
- 结论：后处理**在用**（`Rendering.ts` RenderPipeline + 单 bloom 通路，threshold=1，
  Q0/Q1 启用、Q2 整段旁路）；着色器**在用且为主体**——100% TSL NodeMaterial
  （35 文件 import `three/webgpu`、14 文件 import `three/tsl`），全仓零手写
  GLSL/WGSL、零 ShaderMaterial/onBeforeCompile（grep 交叉验证）。
- 关键发现①：全站未设 toneMapping（NoToneMapping 直通），白爆靠 emissive 台账
  手工纪律压制——Loop 4+ 若上 ACES/AgX 须整表重校 §5 强度台账（一改全改）。
- 关键发现②：PreRenderer shader 预热只覆盖 Q0+WebGPU；Q1/Q2 与 WebGL 后端
  首用新材质存在编译卡顿敞口（新增常驻材质须落在挂载段编译）。
- 关键发现③：`core/Ticker.ts` 四个 TSL 时间 uniform 逐帧写入但零材质消费方
  （动画主源是 `time` 节点）——预留面语义悬空，建议补注释或移除。
