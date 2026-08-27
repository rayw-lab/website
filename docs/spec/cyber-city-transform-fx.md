# 变形窗粒子炫技层设计规格（CC-TRANS-FX-DES）

| 项 | 内容 |
|----|------|
| 任务 | Loop 7 CC-TRANS-FX：变形仪式「过程化粒子炫技」设计规格（指挥官触发②） |
| 模型 | claude-fable-5-thinking-xhigh（Fable5 xhigh 全链路之 DES 环节） |
| 分支 | `cursor/cc-trans-fx-design-1d6f`（零 `src/` 改动，纯设计文档） |
| 上位条款 | PRD CITY-03（视觉体系/循环动画配额）+ CITY-05（变形仪式 0.9–1.2s / reduced-motion 即时切换）；SRD §12.7.4（状态机/遮蔽式变形）；`cyber-city-vehicle-transform-experience.md`（Loop 7 入口）§2/§5；`cyber-city-score-loop-orchestration.md` Loop 7 硬门 |
| 消费方 | CC-TRANS-FX-IMPL（`cursor/cc-trans-fx-impl-1d6f`，实装 + 测试证据）；CC-AL-TRANS-FX（Sol 专项审计） |
| 并行件 | CC-TRANS-FX-RS `docs/research/transform-particle-fx-survey.md`（撰稿时未推送，本稿基于仓内代码事实独立成稿；RS 结论若与本稿冲突，以集成 PR 合议为准） |

## 0. 摘要与设计原则

现状（`src/lab/world/player/TransformSystem.ts`）：变形四拍 = 充能环（TSL 环带 + 刻度扫掠）
→ 光幕（billboard 竖幕 + 扫描线）→ 峰值热交换 → 落地弹跳，机械完整但观感偏「系统 UI」。
本规格在**四拍之上叠加一层瞬态粒子**（充能喷发 / 光幕体积碎屑 / 落地余烬），把遮蔽式变形
读成「能量积聚 → 物质解构重组 → 实体落地」的赛博仪式，主攻 rubric V5 动效维。

五条铁律（全文展开，越界即撤）：

1. **叠加不改拍**：`RING_IN=0.35 / VEIL_IN=0.25 / VEIL_OUT=0.3 / DROP=0.45` 四常量与状态机
   `robot_idle→transforming→car_ready→driving` **零字节改动**；car 路径墙钟恒 1.05s ∈ 验收窗
   1.0–1.2s（CITY-E2E-03 被测面）。粒子层只**读**节拍快照，永不写时钟。
2. **瞬态不占席**：粒子只活在变形窗内（+有界余辉尾），按 CC-L4-B5「运镜为一次性瞬态，
   CITY-03 循环动画配额零占用」先例做**书面登记**（§4），台账维持 3/3。
3. **白爆不洗帧**：A6 光幕白爆抑制（双色 tint ×1.3 + 峰值不透明度 ×0.7）的战果不得回吐——
   粒子层带量化门禁（§6：近白峰值 Δ ≤ +0.5pp 且绝对值 ≤ 1.9%）。
4. **reduced-motion 零粒子**：instant swap 路径不建任何粒子资源（§5），CITY-E2E-04 被测面
   零改动。
5. **robot_idle 恒等**：变形窗外粒子 mesh 不可见、零 draw call、零像素——poster 合同与
   `ritual_idle` 逐字节恒等门禁（Loop 6/7 共用硬门）不受影响。

## 1. 现状叠加面（代码事实）

| 拍 | 窗（秒，car 路径） | 现有视觉件 | 粒子叠加点 |
|----|------|------|------|
| ① RING_IN | 0 → 0.35（waitFor 未 resolve 则峰值处 holding 多转） | 地面充能环 0→4m（easeOutCubic + 刻度扫掠 + 中心微光） | **BEAT-A 充能喷发**：环缘能量微粒螺旋上卷汇聚 |
| ② VEIL_IN | 0.35 → 0.60 | 光幕 opacity 0→1（additive billboard 26×15 @ y4.6） | **BEAT-B 光幕体积碎屑**：幕面前后浅椭球壳内碎屑上旋 |
| ★ swap | 0.60 | `robot.setVisible(false)` + `car.visible=true` | **BEAT-B 峰值裂解冲击**：碎屑子集径向外抛（swap 有「事件感」） |
| ③ VEIL_OUT | 0.60 → 0.90 | 光幕淡出 | BEAT-B 碎屑随幕衰减 + 微坠 |
| ④ DROP | 0.60 → 1.05（首触地 ≈0.767s，见 §2.3） | 车 +2m→0 easeOutBack、环随落地消散；L4-B5 落地微震 + roll 微滚 | **BEAT-C 落地余烬**：触地帧低角度余烬环外溅，余辉尾入 car_ready |
| 回变 robot | 0 → 0.90（无 DROP） | 同遮蔽序列，机器人原地重现 | BEAT-A + BEAT-B 复用；BEAT-C 门控为零（§2.4） |

接线事实：TransformSystem 在 Ticker **order 4** 推进时间轴（`run.clock` 真实秒、暂停即冻结）；
运镜经 `View.ritualCam` 由 View order 7 同帧消费。粒子层由 TransformSystem 的同一 `update()`
驱动（§3.1），不新增 Ticker 订阅、不新增执行序。

## 2. 三段粒子行为设计

时间轴总览（car 路径，设计秒）：

```text
0        0.35      0.60      0.767        0.90      1.05          ≤1.50
|—BEAT-A 充能喷发—|          |             |         |             |
|  (holding 时原地再循环)     |             |         |             |
         |—BEAT-B 碎屑上旋—★裂解冲击—衰减微坠—|      |             |
                             |—BEAT-C 蓄势—触地外溅——余辉衰减(car_ready 后纯视觉尾)—强制归零
```

### 2.1 BEAT-A 充能喷发（0 → 0.35s，holding 可再循环）

**读法**：充能环不只是「进度条」——环缘持续析出能量微粒，沿收敛螺旋上卷汇聚到光幕
中腰线（y≈4.6m，即热交换截面），讲「能量从大地抽取、向截面积聚」。

| 参数 | 值 | 说明 |
|------|-----|------|
| 实例数 | 320（Q0） | 交错写入序参与 Q1 比例裁剪（§3.3） |
| 出生位 | 环缘 r = ringProgress×4m，随环展开外推 | 逐实例出生角 θ₀ + 出生延迟抖动 0–0.25（后出生的粒子从更大半径起步，与环展开同拍） |
| 轨迹 | 收敛螺旋：r 4m→0.6m、y 0.06→4.6m、θ 附加 1.2–2.2 rad 旋卷 | 全解析（§3.2），easeIn 半径收敛 = 「被吸入」观感 |
| 单粒生命 | 0.30s（fract 再循环，见 holding 行） | 短生命多轮次 = 喷发感而非一次性烟花 |
| 点径 | 0.06–0.22m（生命末端收缩 ×0.4） | billboard 圆形软点，FlightTrails 同款径向衰减 |
| 色 | 青:品红 = 70:30（`NEON` token 单源，逐实例 hash 择色） | 与充能环青主调同族，品红为截面预告 |
| 强度 | 逐粒 0.45–0.85；≤10% 实例「亮头」1.15 | 主体阈下（bloom threshold=1）；亮头略过阈成小光晕，不与招牌档（1.9–2.4）抢辉光名额 |
| holding 语义 | `waitFor` 未 resolve 时充能相位时钟**继续走**（§3.2 `fxChargeClock`），粒子原地再循环 | 与「环多转」同语义——充能持续、光幕不落；BEAT-B/C 相位源是 `run.clock`，holding 时天然冻结 |

### 2.2 BEAT-B 光幕体积碎屑 + 峰值裂解冲击（0.35 → 0.90s）

**读法**：光幕从「一张平面贴片」变成「有厚度的解构场」——碎屑在幕面前后 ±1.2m 浅椭球壳
内上旋抖动，密度随幕不透明度同拍呼吸；swap 帧一小撮碎屑径向外抛，把被遮住的热交换读成
「裂解重组」的可感事件（金属解构感的最小可信实现，不做真网格碎裂）。

| 参数 | 值 | 说明 |
|------|-----|------|
| 实例数 | 300（Q0），其中 48 为「裂解冲击」子集 | 交错写入序 |
| 分布 | 幕面平行浅椭球壳：横 ±9m、纵 y 1.5–8m、厚 ±1.2m（billboard 幕的世界系近似，不随相机转） | 避开幕中腰亮带的屏幕空间正叠（§6 白爆规避①） |
| 运动 | 上旋 0.8–1.6 m/s + 逐粒正弦抖动（幅 0.15m）；swap 后叠加 −0.8 m/s² 微坠 | 全解析；「幕在吞吐物质」 |
| 透明度包络 | 跟随 `veilOpacity` 同拍（0→1→0），VEIL_OUT 末强制归零 | 幕散尽 = 碎屑散尽，无孤儿粒子 |
| 形态 | 长条屑（billboard 各向异性 scale：长 0.10–0.35m × 宽 0.03–0.08m，随机取向） | 读作金属屑/数据屑，与 BEAT-A 圆点区分 |
| 色 | 沿幕横向 青→品红 渐变取样（与 veil tint 同式同源） | 幕与碎屑同一色场 |
| 强度 | 逐粒 0.4–0.8，阈下 | 体积感靠数量与运动，不靠亮度 |
| ★裂解冲击 | swap 帧起 48 粒自幕中腰径向外抛（初速 6–9 m/s，指数减速），峰值强度 1.5、**0.12s 内跌至阈下**，0.35s 生命 | 亮点快速**离开**幕心 = 峰值帧亮度反而更分散（§6 白爆规避②）；swap 时刻由 uniform 锁存（§3.2） |

### 2.3 BEAT-C 落地余烬（0.767s 触地 → 1.05s car_ready → ≤1.50s 余辉强制归零）

**触地帧推导**（编译期常量，非魔数）：DROP 段 y = 2×(1−easeOutBack(p))，easeOutBack 首次
过 1 在 p = 1 − c1/c3 = 1 − 1.70158/2.70158 ≈ **0.3702** → t_contact = 0.60 + 0.45×0.3702 ≈
**0.7666s**。此后 easeOutBack 过冲段即悬挂压缩，与 L4-B5 落地微震（shakeY 0.3s）同帧族。

**读法**：车底盘触地瞬间，接地区向外低角度喷溅一圈工业橙余烬，沿地面滑擦、跳跃衰减——
给「8 吨实体落地」以质量证据，与微震/roll 微滚互为音画（本批无音效，Phase 3 接）。

| 参数 | 值 | 说明 |
|------|-----|------|
| 实例数 | 200（Q0） | 交错写入序 |
| 出生位 | 锚点为心 r 0.8–2.2m 环带（近似轮距/底盘投影缘），逐粒出生角均布 + 抖动 | 不需要真轮位——遮蔽式变形无逐轮语义 |
| 轨迹 | 低角度弹道：仰角 4–18°、初速 3–7 m/s，重力 −9.8 m/s²，落回 y≤0.05 后按 0.55 恢复系数解析二段跳（最多 2 跳，之后贴地滑擦减速） | 全解析分段函数（§3.2）；「溅射 + 滑擦」而非「升腾」——余烬属地面不属天空 |
| 单粒生命 | 0.28–0.55s（逐粒抖动） → 最迟 0.767+0.55+0.18 淡出 ≈ **1.50s 全灭** | car_ready（1.05s）后为纯视觉余辉尾，不碰状态机/输入/相机 |
| 点径 | 0.08–0.28m，生命末端 ×0.3 收缩 | |
| 色 | 工业橙 `#ff6b35`（血统 = buildings JSON `autodrive-lab.neonColor`，CITY-03「工业橙点缀」唯一授权色；实装为本地常量 + 血统注释，不 import JSON 数据面） | 与青/品红仪式色刻意断色——「仪式结束、实体落地」的色相标点 |
| 强度 | 出生头 1.3–1.6，**0.3s 内指数衰至阈下**，尾段 0.2 | 短暂过阈成火星光晕；峰值帧（触地）近白贡献见 §6 预算 |
| 门控 | `fxTo` uniform：回变（car→robot）恒为 0（§2.4）；reduced-motion 整层不存在（§5） | |

### 2.4 回变路径（car → robot，0.90s，CC-P1 双向可逆）

复用同一 mesh 同一 shader：BEAT-A（充能喷发）+ BEAT-B（碎屑 + 裂解冲击）逐拍照播；
BEAT-C 由 `fxTo` 门控为零透明度（机器人无落地拍，Reveal 光柱承接重现）。回变可能发生在
driving 视角（含 CC-VEH FPV 落地后的车内第一人称）：粒子全部世界空间解算 + veil 本就
billboard，**机位无关**，与 CC-VEH 零耦合（合流序仍按编排：TRANS-FX-C1 先、VEH-C1 后）。

### 2.5 色相与强度台账（bloom threshold=1、全站无 tone mapping 前提）

| 元素 | 峰值线性强度 | 与阈关系 | 参照档 |
|------|------|------|------|
| BEAT-A 主体 / 亮头 | 0.85 / 1.15 | 阈下 / 略过阈小光晕 | FlightTrails 机头叠加峰 ≈1.3 |
| BEAT-B 碎屑 / 裂解冲击 | 0.8 / 1.5（0.12s 内跌阈下） | 阈下 / 瞬时过阈 | 楼宇亮窗 ≈1.3 |
| BEAT-C 余烬头 / 尾 | 1.6（0.3s 内跌阈下）/ 0.2 | 瞬时过阈 / 阈下 | 招牌 1.9–2.4 / 信标 3（**不得逾越**） |

色相纪律：全层仅 3 色——`NEON.cyan` / `NEON.magenta`（token 单源）+ 工业橙 `#ff6b35`
（blood­line 见 §2.3），零新色相。渲染架构审计「白爆靠 emissive 台账手工纪律压制」的前提
下，本表即粒子层的台账增量页；Loop 后续若上 ACES/AgX，本表随 §5 强度台账整表重校。

## 3. TSL / InstancedMesh 架构

### 3.1 文件与所有权

```text
src/lab/world/player/TransformFX.ts   新增（唯一新文件，≈300 行）
src/lab/world/player/TransformSystem.ts  接线 ≈20 行（构造/快照/dispose 三点）
```

- **组合而非订阅**：TransformSystem 构造器内 `new TransformFX(game, { anchor, reducedMotion })`
  （reducedMotion 时**不构造**，§5）；`update()` 末尾以只读快照驱动
  `fx.update(dt, { clock, holding, swapped, to, veilOpacity, ringProgress })`；
  `dispose()` 内 `fx.dispose()`。零新 Ticker 订阅、零新事件面、时间轴单写手不变——
  「叠加不改拍」由所有权结构机器保证。
- 状态机、四拍常量、`hotSwap`/`finish`/`completeRun`、`ritualCam` 通道、Reveal、View、
  Inputs、e2e 选择器契约全部**零改动**。

### 3.2 单 InstancedMesh + 解析式位置 + uniform 驱动

FlightTrails 同族技法，关键差异是**驱动源**：

- **不用 TSL `time` 节点**——`time` 随渲染帧走，Game 暂停时仍前进；仪式粒子必须与
  `run.clock`（Ticker.delta 累积、暂停即冻结）同钟。全部相位经 **instance 级 uniform**
  从 `fx.update()` 写入：
  | uniform | 写入源 | 语义 |
  |------|------|------|
  | `fxClock` | `run.clock` | BEAT-B/C 相位主钟（holding 时天然冻结） |
  | `fxChargeClock` | 自累积 dt（RING_IN 段 + holding 段） | BEAT-A 再循环钟（holding 时继续走，对齐「环多转」） |
  | `fxRing` | `ringProgress` | BEAT-A 出生半径跟随环展开 |
  | `fxVeil` | `veilOpacity` | BEAT-B 透明度包络（含 VEIL_OUT 归零） |
  | `fxSwapAt` | swap 帧锁存 `run.clock`，未 swap = −1 | 裂解冲击/余烬的事件基准 |
  | `fxTo` | car=1 / robot=0 | BEAT-C 门控 |
  | `fxIntensity` | Quality 档（§3.4） | 全层强度乘子 |
  | `fxMaster` | 取证开关（§3.6） | A/B 对照，additive 加零 = 像素级不存在 |
  全部 uniform 为 **TransformFX 实例字段**（TransformSystem `ringOpacity` 同款），
  **禁模块级单例**（FlightTrails 的 trailUniforms 是常驻系统口径，瞬态系统跨 mount 残留
  即泄漏），dispose 后随实例回收。
- **几何**：`PlaneGeometry(1,1)` + `SpriteNodeMaterial`，`InstancedMesh` 单只 = 全层
  **1 次 draw call**。材质：`transparent + AdditiveBlending + depthWrite=false +
  depthTest 保留`（碎屑被机器人/车身/楼体遮挡 = 体积感自证）、`fog=false`（additive
  吃 fogNode 加出雾灰，FlightTrails 同坑）、`frustumCulled=false`（位置在 shader 内）。
- **逐实例属性**（2×vec4 + 零色彩缓冲）：
  - `fxSeed`: beatId（0/1/2 + 裂解冲击标记）、出生延迟、速度抖动、hash 种子；
  - `fxShape`: 出生角 θ₀、尺寸、长宽比、仰角/旋卷参数复用位。
  颜色在 shader 内由 beatId + seed 解析择色（青/品红 hash、幕横向渐变采样、橙常量），
  省一条 vec3 缓冲。总缓冲 ≈ 820×32B ≈ 26KB，一次写入构造期，**零逐帧 CPU 写缓冲**。
- **positionNode**：按 beatId 三分支解析式（螺旋 / 椭球壳上旋 + 冲击外抛 / 弹道二段跳），
  一切从 `fxClock`/`fxChargeClock`/`fxSwapAt` + 逐实例常量闭式求出——任意帧长无积分
  发散（SwiftShader 大 dt 稳定，L4-B5 解析阻尼正弦同款论证）。窗外实例 `opacity=0`
  （additive 零像素），mesh 级再由 `visible` 兜底（§3.5）。
- **shader 预热**：渲染架构审计发现② PreRenderer 只预热 Q0+WebGPU——TransformFX 材质
  须在挂载段注册预热（Reveal `ticker.wait(6)` 防编译窗内完成编译），否则首次变形
  swap 帧叠管线编译 = 首帧卡顿回归（L4-B5 已实测该停顿族）。IMPL 必做项。

### 3.3 实例预算与写入序

| 段 | Q0 | 写入序 |
|----|----|--------|
| BEAT-A 充能 | 320 | 三段**round-robin 交错写入**（A,B,C,A,B,C,…），使 `mesh.count` 裁尾对三拍近似等比生效 |
| BEAT-B 碎屑（含冲击 48） | 300 | 冲击子集均布在 B 序列内，裁剪同样等比 |
| BEAT-C 余烬 | 200 | |
| **合计** | **820**（预算上限 900，FlightTrails ≤800 同量级） | |

### 3.4 Quality 三档（`applyQuality`，city 装配段同款幂等接线）

| 档 | 行为 |
|----|------|
| Q0 | 全量 820 + `fxIntensity=1` |
| Q1 | `mesh.count = 492`（60% 交错裁尾）+ `fxIntensity=0.85` |
| Q2 | **零粒子**：`visible=false` + count=0 + intensity=0（不画，非调暗）——环 + 光幕四拍照播（E6 底线不动），drawCalls 结构性 −1 |

切档 = uniform 写入 + `mesh.count`/`visible`，零材质重建零重编译。

### 3.5 dispose 路径与可见性生命周期

可见性合同（robot_idle 恒等门禁的机器保证）：

```text
构造            → mesh.visible=false（scene.add 后恒不可见，idle 零 draw call）
transform() 起拍 → visible=true（唯一置真点 = ritual 建立帧）
completeRun     → car：保持 visible 至余辉尾终点（fxClock ≥ 1.50s 或全粒 alpha 归零）
                  后 visible=false + 全 uniform 归零；robot：VEIL_OUT 末即置 false
dispose()       → removeFromParent + geometry.dispose + material.dispose
                  + delete scene.userData.transformFx + uniform 引用随实例回收
```

- 余辉尾跨入 car_ready/driving 属纯视觉，**不注册任何输入/状态依赖**；尾窗推进复用
  TransformSystem 既有 tick（shakeClock 同款「ritual 已清仍需衰减」通道），终帧强制
  `visible=false`——驾驶接管后场景内不残留任何粒子 draw call。
- 仪式中途 dispose（页面卸载）：TransformSystem.dispose 既有次序内追加 `fx.dispose()`，
  粒子不碰相机/输入，无 L4-B5 式残余偏移问题；owned geometry/material 各 1 件，清单式
  释放（TransformSystem `ownedGeometries/ownedMaterials` 同款纪律亦可直接并入）。

### 3.6 取证开关（审计 A/B 协议）

`scene.userData.transformFx = { setFx: (v: 0|1) => fxMaster.value = v }`——
`cityFlightTrails.setTrails` 同协议：additive 加零 = 像素级等价于不存在、不减 draw call
（结构性开关归 Q2）。CC-AL-TRANS-FX「同机位有/无粒子」对照与 §6 白爆 A/B 全靠它，
dispose 时随 userData 删除。

## 4. CITY-03 循环动画配额书面登记（本节即落档件）

**计席口径**（CC-L3-B3 统一）：帧内可见的**持续**时间性动画计席，与驱动源无关；
静态采样与常亮不计席。**先例**：CC-L4-B5 变形运镜以「一次性瞬态」登记**零占用**。

**本层登记：瞬态，0 席。台账维持 3/3 不变**：

| # | 席位 | 驱动 | 出处 | 与本层关系 |
|---|------|------|------|------|
| 1 | HeroRobot idle 呼吸灯 | Reveal.update Ticker | CC-E5/E6 | swap 帧 Reveal 停 robot update 释放本席（E5 交接约定不变）；粒子层不延长、不复用该席位时间轴 |
| 2 | 楼顶全息板慢呼吸脉动 | shader `neonTime` | CC-L2-B1 | 无交互 |
| 3 | 飞行光轨（系统计 1 席） | shader `time` | CC-L3-B3 | 中远景 ≥110m 常驻层；本层为近景瞬态，**不得**被实现成变相常驻粒子（见瞬态条件） |
| — | **变形窗粒子层（本登记）** | instance uniform（`run.clock` 同钟） | **CC-TRANS-FX（Loop 7）** | **瞬态 0 席**，条件见下 |

**瞬态成立的三个硬条件**（任一破防即改判 1 席、触发配额重审）：

1. **窗界有界**：粒子仅在 `transforming` 起拍 → 余辉尾终点（car 路径 ≤1.50s 设计秒；
   robot 路径 ≤0.90s）存活；终帧强制 `visible=false` + alpha 全零（§3.5 合同）。
2. **holding 例外受限**：`waitFor` 悬置时仅 BEAT-A 原地再循环（与既有「环多转」同语义、
   同一 transforming 遮蔽窗、CTA disabled 期间）——这是资产等待的延长遮蔽，不是常驻
   动画；holding 结束立即回到有界时间轴。
3. **idle 零像素**：robot_idle / car_ready 稳态帧内本层零 draw call 零像素（poster 合同、
   `ritual_idle` 逐字节恒等门禁的前提）。

Phase 0 上限 ≤3（L3-B3 调整后）与 Phase 3 天花板 ≤5 均不因本层变动。本节由 IMPL 落地时
摘要转录进 `cyber-city-eng-wave1-notes.md` 台账小节（登记行指回本文档）。

## 5. reduced-motion：零粒子 instant swap

- `prefers-reduced-motion` 时 TransformSystem 走 instant swap（不建 ritual 时间轴）——
  **TransformFX 不构造**：零 InstancedMesh、零几何/材质、零 GPU 上传、零 shader 编译，
  不是「建了不播」而是**不存在**（HeroRobot「偏好静止即静止」纪律的资源版）。
- 文字状态提示（Reveal `[data-world-status]`）与 CITY-E2E-04 断言面零改动；
  instant swap 前后相机/机位位级恒等的 L4-B5 证据口径继续成立（粒子不碰相机）。
- 运行中媒体查询翻转不追踪（与 TransformSystem 构造期一次性读取的既有口径一致）。

## 6. 白爆门禁：峰值不洗帧（量化）

**风险面**：additive 粒子 × additive 光幕 × bloom(threshold=1, strength=0.55) 在
swap 峰值帧（veilOpacity=1）与触地帧（余烬头 1.6）两个时刻叠加，可能回吐 A6 白爆抑制
战果（V5 判词「光幕余辉洗帧」历史扣分项）。

**结构性规避**（设计内建，非事后调参）：

1. BEAT-B 碎屑分布避开幕中腰亮带的屏幕空间正叠（椭球壳纵向 1.5–8m 避开 belt 峰值带
   ±0.5m 走廊加权稀疏）；
2. 裂解冲击的亮粒（1.5）在 swap 帧**径向离开**幕心——峰值帧亮度更分散而非更集中，
   且 0.12s 跌阈下 < VEIL_OUT 窗；
3. 余烬为**低角度地面层**，与光幕（y 1.5–12）屏幕空间基本不相交；触地帧（0.767s）
   光幕已衰减至 ≈0.44×0.7 峰值；
4. 全层无任何元素逾越招牌强度档 1.9（§2.5 台账）。

**量化门禁**（CC-AL-TRANS-FX 验收行，L4-B5 协议原样续用）：

| 指标 | 口径 | 阈值 |
|------|------|------|
| 近白峰值增量 | 同固定脚本 A/B（`setFx(1)` vs `setFx(0)`），变形窗逐帧 min(r,g,b)≥240 像素占比峰值 | **Δ ≤ +0.5pp** |
| 近白峰值绝对值 | 同上，FX-on 峰值帧 | **≤ 1.9%**（基线：L4-B5 实测 main 1.19% / B5 1.41%） |
| 对比度保持 | car_ready 首稳定帧（余烬尾内）主体-背景对比不劣于 FX-off 同帧 | 帧证对照留档 |

超阈处置序：先砍裂解冲击峰值强度（1.5→1.2）→ 再砍余烬头（1.6→1.3）→ 再降 BEAT-B
密度 20%——**不许**以延长/提前时间轴或加大光幕透明度来「摊薄」峰值（改拍红线）。

## 7. 性能与预算门禁

| 项 | 门 |
|----|-----|
| draw call | 变形窗内 +1（单 InstancedMesh）；robot_idle/car_ready 稳态 +0（visible=false） |
| 实例 | ≤900（本设计 820）；Q1 60%；Q2 零 |
| CPU | 零逐帧写缓冲、零新 Ticker 订阅；每帧仅 ≤8 个 uniform 标量写 |
| 包体 | world chunk 增量 ≤ +4KB gzip（现 ~85/900KB）；零贴图零外部资产（全程序化） |
| 编译 | 材质挂载段预热（§3.2）；Quality 切档零重编译 |
| 双后端 | 100% TSL NodeMaterial，WebGPU/WebGL2 同源（CITY-E2E-05 `?gl=1` 自动覆盖） |

## 8. 测试计划（IMPL 验收面）

### 8.1 固定脚本设计时等速视频（5–10s，主证据）

L4-B5 录屏协议原样续用：SwiftShader 下 **CDP `Page.startScreencast` 逐合成帧存 PNG**，
`Ticker.maxDelta=1/30` ⇒ 每合成帧 ≈ 1/30 设计秒，30fps 拼装 = 设计时间等速；前置注入
CSS 隐藏全部 DOM 覆盖层（`.skip/.topbar/.hud/.hud-city/.hint/.cover/.world-ritual`——
CSS 进度条动画混入合成流会打乱帧↔tick 映射，已知坑）。

固定脚本（设计秒 ≈ 6.4s ∈ 5–10s 窗，`/world-spike/?ritual=1#debug`）：

| 段 | 设计秒 | 内容 | 取证点 |
|----|----|------|------|
| ① | 0–1.0 | robot_idle 静置 | 粒子层零像素（恒等门禁帧证） |
| ② | 1.0–2.05 | Space → car 变形 1.05s | BEAT-A 喷发 / BEAT-B 碎屑+裂解冲击 / BEAT-C 触地外溅 |
| ③ | 2.05–3.6 | W 驾驶接管 | 余辉尾 ≤0.45s 内全灭、驾驶帧零残留 |
| ④ | 3.6–4.5 | 松键滑行 + `__worldTransform.transform('robot')` 回变 0.9s | BEAT-A/B 复用、BEAT-C 门控为零 |
| ⑤ | 4.5–6.4 | robot_idle 回归静置 | 终态零粒子、机位零漂移 |

产物 `transfx-ritual-6s.mp4`（1440×900/30fps/≈192 帧）+ 四关键帧 A/B 对照静帧
（充能峰值 / swap 裂解 / 触地 / car_ready 稳态，`setFx(1|0)` 各一）。

### 8.2 白爆 A/B（§6 门禁执行）

同脚本双跑（`setFx(0)` / `setFx(1)`），逐帧近白统计 → 峰值/增量对表 §6；
超阈按处置序返工，报告落 `transfx-whiteburst-ab.json`。

### 8.3 CITY-E2E-03 / 04 回归（任务书点名）+ 全量门禁

- **测试文件零改动**，全量 e2e **52/52**（0 failed / 0 skipped / 0 flaky）：
  - **CITY-E2E-03**：`transforming→car_ready` 墙钟窗、CTA disabled、car_ready 即压 W
    接管 driving——粒子层不写时钟不碰输入，唯一可能回归源是首变形帧编译卡顿，
    以 §3.2 预热消除；transform 段 metric 注解与 FX 前基线同量级（±10% 内留档）。
  - **CITY-E2E-04**：reduced-motion 不构造粒子（§5），instant swap + 文字提示断言
    原样通过；`data-blocked` 拦截与零 world 字节段不受影响。
  - CITY-E2E-05（`?gl=1`）顺带覆盖双后端腿。
- `pnpm astro check` 0 err；`node scripts/audit-budget.mjs` 全过（§7 包体门）；
  `pnpm test:visual` VIS-01/02 壳基线零 diff（零 DOM/poster 改动）；隔离 LHCI `/` +
  `/home/` 四项不降；`#debug` drawCalls 台账：idle 帧与 main 持平、变形窗 +1。

## 9. IMPL 交接边界

| 允许改 | 禁止改（零字节） |
|--------|------|
| `src/lab/world/player/TransformFX.ts`（新增） | 四拍常量 / 状态机 / `hotSwap`/`finish`/`completeRun` 语义 |
| `src/lab/world/player/TransformSystem.ts`（构造/快照/dispose/余辉尾 ≈20 行接线；四拍常量与状态序不动） | `Reveal.ts` / `View.ts` / `Inputs.ts` / 车辆物理 |
| `cyber-city-eng-wave1-notes.md`（§4 配额登记转录 + 交付小节） | `e2e/cyber-city.spec.ts` / poster 资产 / 壳页 / tone mapping / 雾 / 光轨 |
| city 装配段 `applyQuality` 转发（若经 quality.events 需 1–2 行） | `camera-shots` 数据面（归 CC-CAM/CC-VEH） |

实装顺序建议：TransformFX 骨架（mesh + uniform + 三 beat shader）→ TransformSystem
三点接线 → 预热注册 → Quality/取证开关 → §8.1 视频 → §8.2 A/B → 全量门禁。

## 10. 风险与止损

| 风险 | 缓解 | 止损 |
|------|------|------|
| 峰值帧白爆超阈 | §6 结构性规避 + 处置序 | 处置序砍完仍超 → 裂解冲击整段撤（BEAT-B 退回纯碎屑），不改拍 |
| 首变形帧编译卡顿 | §3.2 挂载段预热（审计发现②对症） | 预热不可行 → mesh 以 1 帧 alpha=0 提前入渲染队列强制编译 |
| SwiftShader 下粒子轨迹步进撕裂 | 全解析闭式位置（§3.2），无积分 | 不适用（架构消除） |
| 余辉尾被判「常驻动画」 | §4 三硬条件 + 终帧强制归零 | 审计仍有异议 → 余辉尾截短至 car_ready 帧齐平（1.05s 全灭） |
| Q1 裁剪后三拍失衡 | round-robin 交错写入序（§3.3） | 失衡可见 → 改三段独立 count 偏移表（仍单 mesh） |
| 与 CC-VEH 合流冲突 | 本层不碰 View/Inputs；合流序 TRANS-FX-C1 先 | 冲突文件仅可能是 index.ts 装配段，行级可解 |
