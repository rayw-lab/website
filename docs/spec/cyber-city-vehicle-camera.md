# 驾驶态双视角相机规格（CC-VEH-DES · 脑暴+设计合一）

| 项 | 内容 |
|----|------|
| Task | **CC-VEH-DES**（Loop 7 入口 `cyber-city-vehicle-transform-experience.md` §4 六 Task 之一） |
| 分支 | `cursor/cc-veh-camera-design-1d6f`（base：`main`） |
| 日期 | 2026-08-27 |
| 指挥官需求 | ① driving 态按 **V** 在第三人称 ↔ **车内第一人称**（PUBG 式）切换；② 车辆移动时焦点策略：lookahead / 速度变焦 / 转弯稳定 / 防晕 |
| 上游事实 | `src/lab/world/view/View.ts`（city 跟随档 + ritualCam 恒等通道）· `src/lab/world/player/TransformSystem.ts`（driving 上下文热切）· `src/lab/world/player/Player.ts`（动作表）· `src/lab/world/inputs/Inputs.ts`（categories/filters 闸门）· Loop 6 `src/data/camera-shots.json`（schemaVersion 1，分支 `cursor/cc-cam-shot-data-probe-1d6f`，CAM-C1 合流前 main 不可见） |
| 消费方 | **CC-VEH-VIEW**（`cursor/cc-veh-fpv-view-1d6f`：V 键 + FPV + focus 策略 + e2e）；审计 **CC-AL-VEH**（Sol，集成后） |
| 红线 | ritual_idle（robot_idle 首幕帧）**逐字节恒等**（poster 协议 B）· **禁 free 漫游**（G5 相机纪律：用户不可接管相机）· 禁新相机依赖（camera-controls / three-story-controls / gsap 全部出局，`github-camera-poi-survey.md` 结论 1）· 变形四拍 1.0–1.2s 不变 · e2e 52/52 |

---

## 0. 结论先行

- **双视角 = View 输出层的一个二态子状态机**（`third` ↔ `fpv`），只在 TransformSystem `car_ready`/`driving` 期间可切；`drive_third` 就是现状 folio 等距跟随档（叠加新的 lookahead 加法通道），`drive_fpv` 是从 `PlayerVehicle` 底盘位姿实时解算的挡风机位 rig。
- **架构主裁决：双相机管线**。`defaultCamera`（第三人称虚拟跟随相机）**FPV 期间照常每帧更新**——Nipple 触屏射线（`Nipple.ts` L206 `setFromCamera(…, view.defaultCamera)`）、`optimalArea`（Objects 休眠 + 装饰密度）、`focusPointSpeed`（速度域单源）全部继续消费它，世界逻辑零改动；只有输出相机 `View.camera` 在 fpv 态改从车体解算。这是 folio「free 相机不动 defaultCamera」的同构复用（View.ts L422 注释「输出到最终相机…直通」的那个接缝）。
- **恒等由机器保证而非约定**：V 动作 categories `['driving']` 被 Inputs filters 闸门挡在 intro 上下文外（robot_idle 期间按 V 物理上不触发）；lookahead 是 `+0` 恒等的加法通道（同 `ritualCam.shakeY` 先例）且门在 `state==='driving'`；third 态输出路径与现状逐行一致。poster 三面零影响，不触发重拍。
- **切换 = 硬切**（PUBG 原版口径）：无补间 → 无穿车体飞行、无晕动窗、reduced-motion 天然同形。
- 速度域单源 = `focusPointSpeed`（View 已算，真实 m/s、车辆实现无关）——`PlayerVehicle.forwardSpeed` 契约自述「两实现单位不同，仅供方向/观感消费」，**不得**用作阈值输入。

## 1. 目标 / 非目标

**目标**

1. driving 态 `Keyboard.KeyV` 切换 `drive_third` ↔ `drive_fpv`，一键往返，硬切。
2. 第三人称移动焦点策略：行进方向 lookahead（速度驱动、方向低通、转弯收缩、变化率钳制）；速度变焦维持现状快照。
3. FPV 防晕 rig：yaw 直通（转向即时反馈——延迟 yaw 才是晕源）、pitch/roll 衰减 + 低通、FOV 速度 kick 缓变、视线锁前向。
4. 与 Loop 6 `camera-shots.json` 对齐：新增 `drive_third` / `drive_fpv` 两条目（字段本 spec §7 冻结），schemaVersion 1 加法兼容。
5. e2e 验收点 + DOM 契约（`data-drive-view` 镜像），既有 52 用例零改动。

**非目标（显式不做）**

- ❌ 第三人称改 PUBG 背后追尾相机（裁决 D1 否决，理由见 §4）。
- ❌ FPV 鼠标 free look（G5 用户不可接管；与 PUBG 的显式差异，裁决 D2）。
- ❌ 触屏 FPV（V1 键盘专属，裁决 D5——触屏 FPV 要求 Nipple 射线相机切换 + `forwardAmplitude` 重标定，独立任务书）。
- ❌ 驾驶座舱内机位（CarConcept 无内饰实模，V2 资产专项，裁决 D4）。
- ❌ tone mapping / poster 三面（Loop 7 纪律）。

## 2. 现状事实（代码定位）

| 机制 | 现状 | 与本设计的关系 |
|------|------|----------------|
| 跟随相机 | `View.ts` city 档：FOV 42° / 极角 75°（俯角 15°）/ theta 25° / radius edges {16,26}×baseRatio 0.6（静止 20m）/ lateral 4.2 / lookAtHeight 3.4 / thetaDrift ±1.1°（reduced-motion 置 0） | = `drive_third` 的静态骨架，**参数零改动** |
| 焦点管线 | `focusPoint` 跟踪 + 磁吸（multiplier 0.25）+ easing 平滑 → `focusPointSpeed`（真实 m/s） | lookahead 挂载点 + 速度域单源 |
| 速度变焦 | `zoom` baseRatio 0.6 / speedAmplitude −0.4 / speedEdge {4,24} / Q0 only | 现状快照进 `drive_third.dynamics.zoom`，不改参 |
| 变形运镜通道 | `View.ritualCam`（dollyIn 乘法 ×1 恒等 / shakeY 加法 +0 恒等），TransformSystem order 4 写、View order 7 消费 | lookahead 通道的恒等先例；FPV 与 ritual 互斥（§5） |
| 输入上下文 | `TransformSystem.finish('car')`：filters `intro`→`driving` 与 `car_ready` **同帧**热切；`DRIVE_ACTIONS = [forward, backward, left, right, nipplePointer]` 触发 `car_ready`→`driving` | V 生效窗 = car_ready 起；V **不进** DRIVE_ACTIONS（切视角 ≠ 驾驶意图） |
| 动作表 | `Player.ts` setInputs：WASD/Shift/Space/R/F，categories 含 `'driving'`；**无 V 键** | §8 新增 `toggleDriveView` 一行 |
| 触屏 | `Nipple.ts` 射线经 `view.defaultCamera` 投地平面 | 双相机管线的零回归依据（§4 D5） |
| tick order | 输入 0 → 意图 1 → 车辆 pre 2 → 物理 3 → 视觉同步 4 → 车辆 post 5 → 玩家 post 6 → **相机 7** → 渲染 998 | FPV 在 order 7 解算时底盘位姿已定，无帧延迟 |
| 车体口径 | 底盘局部 +X=车头 +Y=上 +Z=右；底盘原点静态离地 `VEHICLE_GROUND_CLEARANCE = 0.92m`；物理轴距 1.8m、轮半径 0.4m；视觉车宽 ~1.7m | FPV `offsetLocal` 的参考系 |
| DOM 契约 | host `data-world-state`（四态镜像）、`[data-world-hint]` 键位提示（car_ready 浮现） | §8 追加 `data-drive-view` + hint 文案 |
| Loop 6 shots | `camera-shots.json` schemaVersion 1：shot = `{mode, status, anchor, spherical, lookAtHeight, lateral, notes, projectionAudit}`；`ritual_idle` posterContract frozen | §7 加法扩展，`ritual_idle` 条目零改动 |

## 3. 竞品口径（脑暴输入）

| 参照 | 借什么 | 不借什么 |
|------|--------|----------|
| PUBG 载具 | **V 硬切**第三人称↔FPV 的交互原语；FPV 引擎盖/挡风参照物 = 速度感来源；视角跨 respawn 保持 | 车内自由环顾（G5）；背后追尾第三人称（D1） |
| folio-2025 | 等距斜视角 + focusPoint 磁吸 + 速度拉远（已在 View.ts） | camera-controls / wheel zoom（已砍，G5） |
| Sketchbook `CameraOperator`（survey §「参考」） | 角色/载具**相机交接**思路 → 本站 third↔fpv 交接的「谁持有输出相机」问题 | archived 旧栈代码 |
| Mario-Kart-3.js | 速度 FOV kick 观感 | 无 LICENSE，禁止借码（survey ❌ 行） |
| 赛车游戏通例（hood cam） | 无内饰资产时的 FPV 诚实解：挡风前上沿机位 | 后视镜/座舱 UI（超纲） |

## 4. 脑暴与裁决（D1–D5）

| # | 议题 | 选项 | 裁决与理由 |
|---|------|------|-----------|
| D1 | 第三人称形态 | A. 保持 folio 等距固定 theta（仅加 lookahead）；B. PUBG 背后追尾（theta 跟 heading）；C. 高速渐变为追尾 | **A**。B/C 连锁触碰：`optimalArea` 视锥投影假设固定方位角（Objects 休眠 + Phase B 装饰密度都读它）、Nipple 前向扇区标定、thetaDrift 构图件、旋转晕动风险、VIS-03/04 取证协议——改动面 ≫ 收益；「PUBG 式」的需求本体是 **V 切换 + FPV**，追尾不是必要构件。等距跟随是本站从 folio 继承的签名语言 |
| D2 | FPV 视线 | A. 锁前向；B. 鼠标 free look（PUBG 原样）；C. 转向时向弯心自动偏置 ≤4° | **A**（V1）。B 撞 G5「用户不可接管相机」死线；C 是无输入接管的「看弯心」替代，观感加分但引入新晕动变量，**列 V2 可选（默认关）**，不进本批验收 |
| D3 | 切换手感 | A. 硬切；B. 0.2–0.3s 位置补间 | **A**。补间路径从后上方 20m 机位穿越车体网格进座舱，必须做遮罩/近裁剪特技，成本高且是晕动窗；PUBG 原版即硬切；reduced-motion 下 A 无需分支（天然同形） |
| D4 | FPV 机位 | A. 挡风前上沿（hood/windshield cam，舱外）；B. 驾驶座（舱内，左座）；C. 车顶 | **A**（V1）。CarConcept 资产实测无内饰实模（`VisualVehicle.ts` 资产结构注释），舱内机位 = 背面剔除穿帮或黑壳；A 零内饰依赖、引擎盖前缘入画即速度参照物。B 依赖内饰资产，挂 V2 专项；中置 z=0（车宽 1.7m 且左右皆无 A 柱实模，中置防不对称穿帮） |
| D5 | 触屏 | A. V1 键盘专属；B. HUD 加视角切换按钮 | **A**。Nipple 射线经 `defaultCamera` 投地——触屏切 FPV 后「所见相机 ≠ 摇杆求交相机」，前向扇区语义全错；修复面 = Nipple 相机切换 + forwardAmplitude 重标定 + 触屏晕动评估，独立任务书。V1 触屏恒 `third`（按钮不出现） |

## 5. 状态机

### 5.1 driveView 子状态机（View 持有）

```
                                  ┌────────────────────────────────────┐
  初始 / robot_idle / transforming │   third（默认；= 现状输出直通）      │
  ──────────────────────────────→ │   camera ← defaultCamera 拷贝       │
                                  └──────────────┬─────────────────────┘
                                                 │ toggleDriveView（V）
                                                 │ 门：state ∈ {car_ready, driving}
                                                 ▼
                                  ┌────────────────────────────────────┐
                                  │   fpv（挡风机位 rig 解算）           │
                                  │   camera ← PlayerVehicle 位姿解算   │
                                  └──────────────┬─────────────────────┘
                                                 │ toggleDriveView（V）→ third
                                                 │ 强制回 third：
                                                 │  · transform('robot') 启动帧
                                                 │  · TransformSystem.dispose()
                                                 └──（respawn **不**强制回位，PUBG 口径）
```

- **与 TransformState 的乘积关系**：driveView 只在 `car_ready | driving` 有意义（filters `'driving'` 从 car_ready 同帧激活——V 的生效窗由 Inputs 闸门机器保证，无需 View 再查一次状态，但 View **仍加** `state` 冗余门防未来 filters 语义漂移）。`robot_idle | transforming` 期间恒 `third`。
- **V 不触发 driving**：`toggleDriveView` 不加入 TransformSystem `DRIVE_ACTIONS`（切视角不是驾驶意图）——car_ready 按 V：视角切 fpv、`data-world-state` 恒 car_ready。
- **与 ritual 运镜互斥**：`transform('robot')` 启动帧强制 `third`（ritualCam.dollyIn 按第三人称斜距标定，FPV 下推镜无意义；且光幕 billboard 面向输出相机，FPV 会糊脸）。机器保证：ritual 运行期 driveView 恒 third → `ritualCam` 通道语义零改动。
- **V 不进 View `focusActionsNames`**：切视角不抢 focus 跟踪；fpv→third 切回帧由 View 程序化置 `focusPoint.isTracking = true`（defaultCamera 后台连续更新，切回无 pop）。
- **暂停**：相机全部由 Ticker 驱动，ESC/暂停即冻结，天然成立。

### 5.2 DOM 镜像（e2e 契约增量）

| 信号 | 语义 |
|------|------|
| host `data-drive-view` = `third \| fpv` | Reveal 镜像（消费 `game.events` 埋点 `world-drive-view` [mode]，与 `world-transform` 先例同机制）。**car_ready 起才挂属性**；robot_idle 期间属性缺席（DOM 面恒等） |
| 埋点 `world-drive-view` [mode] | 每次切换 trigger（SRD §9.5 埋点族命名沿用 `world-*` 前缀） |

## 6. 机位参数表

### 6.1 `drive_third`（现状快照 + lookahead 动态层）

| 参数 | 值 | 口径 |
|------|-----|------|
| FOV | 42°（恒） | 现状，勿动 |
| spherical | phiDeg 75 / thetaDeg 25 / thetaDrift ±1.1°（reduced-motion 0） | 现状，勿动 |
| radius | edges {16,26} × baseRatio 0.6 + nonIdealRatioOffset 9 | 现状，勿动 |
| lateral / lookAtHeight | 4.2m / 3.4m | 现状，勿动 |
| 速度变焦 | speedAmplitude −0.4 / speedEdge {4,24} m/s / Q0 only / reduced-motion **不新增门**（既有面不扩大） | 现状快照 |
| **lookahead.maxDistance** | **4.5m** | FOV 42°/斜距 20m 下画面半宽 ≈13.7m（View.ts L112 注释口径）→ 满 lookahead ≈ 半宽 1/3，车让出行进侧但不出 1/3 构图带 |
| **lookahead.speedEdge** | **{min 3, max 20} m/s** | 输入 = `focusPointSpeed`；巡航 ~10 m/s（folio topSpeed 5 × Ticker.scale 2）→ L≈1.9m 微感；boost 逼近满值 |
| **lookahead.directionSmoothRate** | **6 s⁻¹**（τ≈0.17s） | 方向 = 位移方向低通（**非**车头朝向）——倒车/甩尾自动正确，转弯不甩视 |
| **lookahead.magnitudeSmoothRate** | **4 s⁻¹**（τ≈0.25s） | 幅值低通，加速/急刹不阶跃 |
| **lookahead.steeringShrink** | **0.45** | 满舵时 L ×0.55——转弯看近处，弯中焦点稳定 |
| **lookahead.offsetRateClamp** | **8 m/s** | 偏移向量变化率硬钳（防晕兜底，SwiftShader 大 dt 下同样成立） |
| **lookahead 状态门** | `state === 'driving'` **且** reduced-motion 关 | 恒等双保险：robot_idle/car_ready 恒 +0；v→0 时 smoothstep 自然归零 |
| 应用方式 | 机位与 lookAtTarget **同加**（纯屏幕平移） | `lateralOffset` 偏轴构图（CC-L1 A4）同构先例 |

### 6.2 `drive_fpv`（挡风机位 rig）

| 参数 | 值 | 口径 |
|------|-----|------|
| anchor | `PlayerVehicle` 底盘参考系（position + quaternion，order 5 已定） | 局部 +X=车头 +Y=上 +Z=右 |
| **offsetLocal** | **(x +0.35, y +0.55, z 0)**（初值提案，实装 A/B 校准） | 底盘原点离地 0.92m → 视高 ≈1.5m；中置 z=0（D4）。校准硬门：① 引擎盖前缘在画面下缘可见（速度参照物）② 机位到最近车体面 ≥ `nearClearanceMin` |
| **fovDeg** | **58°**（16:9 下水平 ≈89°） | 与 third 42° 拉开明确档差 = 切换的即时视觉反馈 |
| **fovKick** | 最大 **+6°**，smoothstep(`focusPointSpeed`, **8, 24**)，低通 **3 s⁻¹**；reduced-motion 恒 0 | 推背感；缓变防晕（FOV 变化率 ≤ ~18°/s 理论上限，实际低通后 ≪） |
| **attitudeTransfer** | yaw **1.0（直通）** / pitch **0.7**（低通 10 s⁻¹）/ roll **0.35**（低通 8 s⁻¹）；reduced-motion：pitch/roll 恒 **0**（地平线锁定） | 防晕核心：转向反馈零延迟，颠簸/侧倾衰减。悬挂微震经底盘姿态自然进入 pitch/roll 通道，被同一低通覆盖 |
| 视线 | 锁前向（stabilized forward），无 free look（G5） | D2 |
| near / far | 0.1 / 200（现状） | 不动 |
| nearClearanceMin | **0.15m** | 机位到车体网格最近面安全距（校准门，防近裁穿帮） |
| 头部 bob | **无** | 防晕；速度感由 FOV kick + 引擎盖参照物承担 |
| ritualCam.shakeY | **不叠加**（ritual 期强制 third，机器保证互斥） | §5.1 |
| defaultCamera | FPV 期间照常 42°/斜距解算每帧更新 | optimalArea / Nipple / focusPointSpeed 零回归 |

### 6.3 恒等保证清单（poster 协议 B / VIS-03）

| # | 机制 | 保证 |
|---|------|------|
| 1 | `toggleDriveView` categories `['driving']` | intro filter 下按 V **物理上不触发**（`Inputs.checkCategory` 闸门） |
| 2 | driveView 初始 `third`；robot_idle/transforming 恒 third | FPV 解算分支不执行 |
| 3 | lookahead 门 `state==='driving'` + 速度 smoothstep(v≤3)=0 | robot_idle 帧 +0 逐位恒等（`ritualCam.shakeY` 同款 IEEE 恒等先例） |
| 4 | third 态输出路径与现状逐行一致（直通拷贝不动） | 像素级零漂移 |
| 5 | `data-drive-view` car_ready 起才挂 | robot_idle DOM 面恒等 |
| 6 | defaultCamera FOV 恒 42 | optimalArea 视锥口径不变 |

## 7. camera-shots.json 对齐（Loop 6 合流接口）

### 7.1 条目草案（字段冻结，CC-VEH-VIEW / CAM 合流照抄）

schemaVersion **保持 1**：全部增量为加法可选字段（未知字段消费方忽略）；`mode` 新增枚举值 `"drive"`；`anchor.type` 新增枚举值 `"vehicle"`。`ritual_idle` 条目**零改动**（posterContract frozen）。

```jsonc
"drive_third": {
  "mode": "drive",
  "status": "current-snapshot+proposal",   // 静态骨架=现状快照；dynamics.lookahead=新增提案
  "anchor": { "type": "vehicle" },
  "spherical": {
    "phiDeg": 75, "thetaDeg": 25, "thetaDriftDeg": 1.1,
    "radius": { "edges": { "min": 16, "max": 26 }, "baseRatio": 0.6, "nonIdealRatioOffset": 9 }
  },
  "lookAtHeight": 3.4,
  "lateral": 4.2,
  "dynamics": {
    "speedSource": "focusPointSpeed",      // 真实 m/s，实现无关（forwardSpeed 单位不统一，禁用）
    "zoom": { "status": "current-snapshot", "speedAmplitude": -0.4,
              "speedEdge": { "min": 4, "max": 24 }, "qualityGate": "Q0" },
    "lookahead": {
      "maxDistance": 4.5,
      "speedEdge": { "min": 3, "max": 20 },
      "directionSmoothRate": 6,
      "magnitudeSmoothRate": 4,
      "steeringShrink": 0.45,
      "offsetRateClamp": 8,
      "stateGate": "driving",
      "reducedMotion": "off"
    }
  },
  "notes": "驾驶第三人称 = ritual_idle 同一静态骨架（View city 跟随档），叠加 lookahead 加法通道（+0 恒等）。无 projectionAudit：动态机位不做静态 NDC 审计，安全门走 §9 e2e/运行时。"
},
"drive_fpv": {
  "mode": "drive",
  "status": "proposal",
  "anchor": { "type": "vehicle" },
  "rig": {
    "offsetLocal": { "x": 0.35, "y": 0.55, "z": 0 },
    "fovDeg": 58,
    "fovKick": { "maxDeg": 6, "speedEdge": { "min": 8, "max": 24 },
                 "smoothRate": 3, "reducedMotion": "off" },
    "attitudeTransfer": { "yaw": 1, "pitch": 0.7, "roll": 0.35,
                          "pitchSmoothRate": 10, "rollSmoothRate": 8,
                          "reducedMotion": { "pitch": 0, "roll": 0 } },
    "lookLock": "forward",
    "nearClearanceMin": 0.15
  },
  "notes": "挡风前上沿机位（D4：CarConcept 无内饰实模，hood cam 为诚实 V1）；offsetLocal 为初值提案，实装按 §6.2 两条校准硬门 A/B 定值后回写本条目。"
}
```

### 7.2 合流规则

| 项 | 约定 |
|----|------|
| 文件所有权 | `src/data/camera-shots.json` 在 CC-CAM-DATA 分支；**CAM-C1 合 main 后**，CC-VEH-VIEW 以 patch 追加 `drive_*` 两条目并从注册表读参（Loop 7 入口 §3「避免双源机位常量」） |
| CAM-C1 未合的降级 | VEH-VIEW 允许常量内联先行 + `// TODO(CC-CAM 合流：改读 camera-shots.json drive_*)` 标记；合流 PR 删除双源，字段名照 §7.1 冻结值——**两侧零重命名成本** |
| NDC 探针兼容 | `drive_*` 不带 `projectionAudit`；若 `tools/camera/audit-shot-ndc.mjs` 以 projectionAudit 存在性迭代则天然跳过，否则合流时加 `mode !== 'drive'` 早退（一行） |
| `sources.design` | 合流时追加本文件路径 `docs/spec/cyber-city-vehicle-camera.md` |
| 命名纪律 | camelCase、角度一律 `*Deg`、距离米制、速度区间 `speedEdge {min,max}`（`View.zoom.speedEdge` 先例）——与 schemaVersion 1 conventions 全等 |

## 8. 输入与 DOM/HUD 契约

### 8.1 Player.ts 动作表增量（一行）

```ts
// Player.ts setInputs() addActions 表尾追加：
{ name: 'toggleDriveView', categories: ['driving'], keys: ['Keyboard.KeyV'] },
```

- categories 只有 `'driving'`：灰盒 `wandering`/`racing` 不放行（spike 试车道无 FPV 需求，零回归）；intro 下被闸门拦截（恒等保证 #1）。
- 消费在 **View**（相机归相机）：`inputs.events.on('toggleDriveView', a => { if (a.active) this.driveView.toggle(); })`——`actionStart` 沿触发（isToggle 语义：按下翻转一次，长按不连发）；与 `focusActionsNames` 订阅同构先例。
- **不**加入 TransformSystem `DRIVE_ACTIONS`、**不**加入 View `focusActionsNames`（§5.1）。

### 8.2 Reveal 键位提示（文案冻结）

```
W/A/S/D 或方向键驾驶 · Shift 加速 · Space/B 刹车 · V 切换视角 · F 悬挂跳 · R 回到路口
```

（现状串插入「· V 切换视角」于刹车之后；`[data-world-hint]` 机制不动——car_ready 浮现 4s 淡出。）

### 8.3 实现落点建议（CC-VEH-VIEW 参考，非强制）

- **View 内聚**：`driveView = { mode, toggle(), setMode() }` 子对象 + 私有 `updateFpv()` 分支（预估 ~120 行）——与 `ritualCam` 通道先例一致，不建新类防输出相机所有权分裂；`update()` 尾段现状「输出到最终相机」直通处开分支。
- 切换动作在输入事件时刻只改 `mode` 标志，位姿在**下一次 order 7 update** 统一解算（防帧中相机不一致）。
- fpv→third 切回帧：`focusPoint.isTracking = true`；`camera.fov = 42` + `updateProjectionMatrix()`。
- TransformSystem `transform('robot')` 入口 + `dispose()` 各加一行 `view.driveView.setMode('third')`（§5.1 强制回位；dispose 先例 = ritualCam 归零段）。

## 9. focus 算法伪代码

### 9.1 第三人称 lookahead（View.update order 7，focus 平滑段之后）

```
// —— 状态（View 私有，全部帧率无关低通：k(dt) = 1 − e^(−rate·dt) ——
lookahead = { dir: Vec3(1,0,0), len: 0, offset: Vec3() }

update_lookahead(dt):
  // 门：driving 态 + 非 reduced-motion；否则目标恒 0（+0 恒等通道）
  gateOpen = (transformSystem.state == 'driving') && !reducedMotion

  // 1. 速度与方向源：焦点位移（真实 m/s、实现无关；倒车方向自动正确）
  v = focusPointSpeed                          // View 既有量
  travelDir = normalize(smoothFocusPointDelta.xz)   // 帧位移方向；v≈0 时保持上帧 dir

  // 2. 方向低通（转弯稳定：甩尾/counter-steer 不甩视）
  if v > 0.5: lookahead.dir = slerp_xz(lookahead.dir, travelDir, k(6, dt))

  // 3. 目标幅值：速度 smoothstep × 转弯收缩
  steer = lowpass(|player.steering|, 8 s⁻¹)         // 满舵渐进，非阶跃
  targetLen = gateOpen ? 4.5 * smoothstep(v, 3, 20) * (1 − 0.45 * steer) : 0

  // 4. 幅值低通 + 变化率硬钳（防晕兜底）
  lookahead.len = lowpass(lookahead.len, targetLen, k(4, dt))
  newOffset = lookahead.dir * lookahead.len
  lookahead.offset = clampRate(lookahead.offset, newOffset, 8 m/s, dt)

// —— 应用（与 lateralOffset 同构：机位与视线目标同加 = 纯屏幕平移）——
position   = smoothedFocusPoint + sphericalOffset + lateralOffset + lookahead.offset
lookAtTarget = smoothedFocusPoint + lateralOffset + lookahead.offset  (+ lookAtHeight)
```

恒等论证：`gateOpen=false ⇒ targetLen=0 ⇒ len→0（低通渐近）`；但 robot_idle 从未进过 driving 态 ⇒ `len` 初值 0 且从未离开 0 ⇒ offset 为精确 `(0,0,0)`，`+0` 逐位恒等（非渐近近似）。

### 9.2 FPV rig 解算（View.update fpv 分支）

```
update_fpv(dt):
  v = game.physicalVehicle                     // order 5 已定位姿

  // 1. 姿态分解（Player.rotationY 同式反解 yaw）
  yaw   = atan2(−v.forward.z, v.forward.x)
  pitch = asin(clamp(v.forward.y, −1, 1))
  roll  = signedRollOf(v.upward, v.forward)    // upward 绕前向轴相对世界 up 的偏转

  // 2. 传递衰减 + 低通（yaw 直通零延迟；reduced-motion：pitch/roll 目标恒 0）
  fpv.pitch = lowpass(fpv.pitch, pitch * 0.7, k(10, dt))
  fpv.roll  = lowpass(fpv.roll,  roll  * 0.35, k(8, dt))

  // 3. 机位：offsetLocal 经【完整】底盘四元数（机位随悬挂/姿态走，防头穿引擎盖；
  //    衰减只作用于视线姿态，不作用于机位）
  camera.position = v.position + offsetLocal.applyQuaternion(v.quaternion)

  // 4. 视线：稳定前向 lookAt + roll 叠加（View.roll 弹簧同法 rotation.z 追加）
  stabForward = ( cos(yaw)·cos(fpv.pitch), sin(fpv.pitch), −sin(yaw)·cos(fpv.pitch) )
  camera.lookAt(camera.position + stabForward)
  camera.rotation.z += fpv.roll
  // 陷阱注记：相机默认前向 −Z 与底盘前向 +X 相差绕 Y 的 −π/2——用 lookAt 合成
  // 即可绕开手写四元数的轴系换算（勿凭直觉拼 Euler）。

  // 5. FOV kick（缓变）；reduced-motion 恒 58
  targetFov = 58 + 6 * smoothstep(focusPointSpeed, 8, 24)
  camera.fov = lowpass(camera.fov, targetFov, k(3, dt)); camera.updateProjectionMatrix()

  // defaultCamera：本分支不触碰——照常走现状第三人称解算（§0 双相机管线）
```

### 9.3 切换（硬切）

```
toggle():
  if transformSystem.state ∉ {car_ready, driving}: return   // 冗余门（闸门外的双保险）
  mode = (mode == 'third') ? 'fpv' : 'third'
  if mode == 'third':
    focusPoint.isTracking = true
    camera.fov = 42; camera.updateProjectionMatrix()        // 位姿下帧由直通拷贝接管
  game.events.trigger('world-drive-view', [mode])           // Reveal 镜像 data-drive-view
```

## 10. reduced-motion 行为表

| 机制 | reduced-motion 行为 | 理由 |
|------|--------------------:|------|
| V 切换 | **保留**（硬切本就无动画） | 操作性功能不因偏好剥夺；PUBG 口径 |
| lookahead | **关**（gateOpen=false，恒 +0） | 新增自动相机运动，从严（thetaDrift/FlightTrails「偏好静止即静止」纪律） |
| FOV kick | **关**（恒 58°） | 同上 |
| FPV pitch/roll 传递 | **0**（完全地平线锁定，yaw 直通保留） | 前庭安全最大化；yaw 关掉则无法驾驶，属功能而非动效 |
| 速度变焦（既有） | **现状不动**（无 reduced-motion 门） | 既有面不扩大改动（若要收紧，独立任务书） |
| 变形运镜/微震 | 现状（instant swap 不建时间轴，通道恒 0） | TransformSystem 既有 |

## 11. e2e 验收点

新用例全部走既有 DOM 信号契约（`e2e/cyber-city.spec.ts` SEL 区 + §5.2 增量），慢动作窗口沿用 CITY-E2E-03 校准口径。**既有 52 用例零改动。**

| ID | 场景 | 断言 |
|----|------|------|
| CITY-VEH-01 | driving 态 V 往返 | 进 driving（W 接管）→ `keyboard.press('v')` → host `data-drive-view="fpv"` → 再按 V → `"third"`；全程零未捕获异常 |
| CITY-VEH-02 | robot_idle 门禁（恒等） | robot_idle 下按 V → `data-world-state` 恒 `robot_idle`、`data-drive-view` 属性**缺席**（闸门机器保证的 DOM 面证据） |
| CITY-VEH-03 | car_ready 按 V 不触发 driving | car_ready 下按 V → `data-drive-view="fpv"` 且 `data-world-state` 恒 `car_ready`（V ∉ DRIVE_ACTIONS 的行为证据） |
| CITY-VEH-04 | FPV 驾驶冒烟 | fpv 态按住 W ≥3s（慢动作换算）→ `data-world-state="driving"`、console 零错误；释放后 V 切回 third |
| CITY-VEH-05 | reduced-motion | `reducedMotion: 'reduce'` 上下文：instant swap 到 car_ready → V 切换仍可用（`data-drive-view` 翻转）——硬切非动画的行为证据 |
| CITY-VEH-06 | 键位提示 | car_ready 后 `[data-world-hint]` 文案含「V 切换视角」 |
| （像素） | VIS-03 robot-idle 基线 | `pnpm test:visual` 既有基线**零更新**通过（恒等清单 §6.3 的像素级证据；禁用 `--update-snapshots`） |
| （回归） | 既有全量 | e2e 52/52 + 新用例全绿；LHCI `/`+`/home/` 不降 |

回变强制回 third（§5.1）当前无 DOM 触发路径（回变 CTA 未建）——由实装侧单元/集成测试面覆盖，不占 e2e 位。

**审计口径（CC-AL-VEH 专项门对照）**：driving 态 V 切换 ✅（VEH-01）；e2e 52/52 ✅；ritual_idle 恒等 ✅（VEH-02 + VIS-03 + §6.3 清单）；无 free 漫游 ✅（G5：无任何指针→相机映射，代码面可 grep 验证零 `camera-controls`/pointer 接管）。

## 12. 风险与开放问题

| # | 风险 | 缓解 |
|---|------|------|
| R1 | 挡风机位近处车体穿帮（近裁/背面剔除） | §6.2 两条校准硬门 A/B 定 offsetLocal；仍穿则 layers 隐藏近舱壳体网格（实装 A/B，不动资产） |
| R2 | `forwardSpeed` 两实现单位不一 | 速度域单源 `focusPointSpeed`（§0）；方向用位移方向，不用车头 |
| R3 | KinematicFallback 无 pitch/roll（运动学档姿态平直） | FPV 仍成立：attitudeTransfer 输入恒 0，退化为纯 yaw 跟随——「世界永远能开」契约无损 |
| R4 | SwiftShader 大 dt 打乱平滑 | 全部低通用 `1 − e^(−rate·dt)` 帧率无关式 + offsetRateClamp 硬钳（TransformSystem 解析阻尼正弦先例） |
| R5 | VIS-03 像素漂移 | §6.3 六条机器保证；e2e 像素基线零更新验收 |
| R6 | 晕动 | 防晕预算：yaw 零延迟 / pitch·roll 衰减低通 / FOV 缓变 / 无 bob / 硬切无补间 / lookahead 变化率钳制——逐条对应 §6 参数 |
| O1 | 触屏 FPV（D5） | 独立任务书：Nipple 射线相机切换 + forwardAmplitude 重标定 + HUD 按钮 |
| O2 | FPV「看弯心」偏置 ≤4°（D2 之 C） | V2 可选，默认关；落地前须晕动 A/B |
| O3 | 座舱内机位（D4 之 B） | 依赖内饰资产专项（Blender 管线裁决后） |
| O4 | offsetLocal 终值 | 实装校准后回写 §7.1 条目与本表（数值提案 ≠ 合同；两条硬门是合同） |

## 13. 实施切分建议（CC-VEH-VIEW 工单要点）

1. `Player.ts`：动作表 +1 行（§8.1）。
2. `View.ts`：`driveView` 子状态机 + `update_lookahead` + `update_fpv`（§9；~120 行）；third 直通路径逐行不动。
3. `TransformSystem.ts`：`transform('robot')` 入口 + `dispose()` 各 +1 行强制回 third（§8.3）。
4. `Reveal.ts`：hint 文案（§8.2）+ `world-drive-view` 埋点镜像到 `data-drive-view`（§5.2）。
5. `e2e/cyber-city.spec.ts`：CITY-VEH-01…06（§11；SEL 区登记 `data-drive-view`）。
6. CAM-C1 已合则从 `camera-shots.json` 读参并追加 `drive_*` 条目；未合则常量内联 + TODO 标记（§7.2）。
7. 禁改面：`playwright.config.ts`、像素基线、tone mapping、poster 三面、变形四拍常量。

---

*CC-VEH-DES · 2026-08-27 — 脑暴+设计合一交付，仅 `docs/spec/` 本文件，`src/` 零改动；上游代码事实以 main tip `8ae872c` 为准；Loop 6 shots 事实以 `cursor/cc-cam-shot-data-probe-1d6f` 分支 `camera-shots.json`（schemaVersion 1）为准。*
