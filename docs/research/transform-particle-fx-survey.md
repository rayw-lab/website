# 变形粒子炫技调研（CC-TRANS-FX-RS · Loop 7）

| 项 | 内容 |
|----|------|
| Task | **CC-TRANS-FX-RS**（`cyber-city-vehicle-transform-experience.md` §4 任务路标；指挥官追加②「机器人变汽车过程要有过程化、粒子向的炫技展示」） |
| 分支 | `cursor/cc-trans-fx-research-1d6f`（base：`main`） |
| 模型 | claude-fable-5-thinking-xhigh |
| 日期 | 2026-08-27 |
| 性质 | **只调研零实现**——本文档是唯一交付物，3D 代码零改动 |
| 消费方 | CC-TRANS-FX-DES（`docs/spec/cyber-city-transform-fx.md` 设计稿）→ CC-TRANS-FX-IMPL（变形窗粒子层实装）；审计 CC-AL-TRANS-FX |
| 必读依据 | `TransformSystem.ts` 四拍时间轴常量 · `cyber-city-visual-rubric.md` §6 B3 + `cyber-city-eng-wave1-notes.md`「CC-L3-B3」CITY-03 配额登记 · `cyber-city-rendering-architecture-audit.md` 全文 · `FlightTrails.ts` |

---

## 0. 结论先行

1. **主选型 = 单 InstancedMesh + SpriteNodeMaterial + 顶点级解析轨迹（Track A，FlightTrails 同门技法）**，可选叠加 **MeshSurfaceSampler 表面采样起讫点（Track B）** 实现「金属碎屑从机器人表面剥离 → 向车壳聚合」的 morph 语义。**TSL compute（Track C）本批明确暂缓**：WebGL 2 回退腿的 compute 支持是官方自述的「部分支持」（transform feedback + instanceIndex 限制，粒子示例仍有破例记录），与 CITY-E2E `?gl=1` 回退腿「全程零未捕获异常」硬门直接冲突；而 compute 的独有收益（持久状态、真碰撞）在 1.05s 瞬态窗内不可辨。`THREE.Points` 路线**出局**（WebGPU 下点径恒 1px，Codrops Gommage 实测结论）；后处理级冲击波/径向模糊**出局**（单 bloom 管线纪律 + tone mapping 禁令）。
2. **预算建议**：Q0 总实例 **≤4096**、Q1 **≤1536** + 强度 ×0.8、**Q2 = 0（不画）**；draw call **+1**（全部粒子相位合入单 InstancedMesh，FlightTrails 同款）。真瓶颈是 additive 近景 **overdraw（fill rate）** 而非顶点数——护栏要定在「峰值屏占」（建议 ≤0.8 屏当量）而不是点数本身。
3. **四拍对齐**：粒子层是既有时间轴的**只读消费方**——TransformSystem 每帧把 `run.clock` 派生的 1–2 个 TSL uniform 写给粒子材质（该 JS-写-uniform 通道已存在：ringOpacity/veilOpacity/ringSpin 仅变形窗内逐帧写），粒子在 shader 内用窗口函数展开四拍相位。**四拍常量、状态机、swap 帧语义零改动**；holding（waitFor 多转）语义由「包络定格 + 能量时间轴续走」天然覆盖。
4. **reduced-motion**：instant swap 分支不建 ritual 时间轴 → 粒子系统**不建/恒不可见**，与既有「偏好静止即静止」纪律同构；`robot_idle` 帧零像素改动由 `visible=false` 机器保证（poster 逐字节恒等硬门）。
5. **配额**：变形粒子 = 一次性瞬态（1.05s + ≤0.3s 余韵），按 CC-L4-B5 运镜先例登记 **CITY-03 零席位**——但登记动作本身必须在 DES 文档落书面条目（硬门 §5 原文「变形粒子须登记席位」的合规完成态 = 有登记、席位数为 0）。现台账 3/3（idle 呼吸 / 招牌脉动 / 光轨）不受挤占。

---

## 1. 现状与红线（代码事实）

### 1.1 四拍时间轴（`TransformSystem.ts` 常量区，本批不可动面）

| 拍 | 区间（秒） | 常量 | 现有视觉件 | 粒子缺口 |
|----|-----------|------|-----------|---------|
| ① 充能 | 0 → 0.35 | `RING_IN = 0.35` | 地面充能环 0→4m（`RING_RADIUS`）+ 刻度扫掠 + 推镜 `dollyIn` easeInQuad | 无能量吸聚 / 无 spark |
| ② 光幕 | 0.35 → 0.60 | `VEIL_IN = 0.25` | additive 竖幕 26×15m 淡入（青→品红 tint ×1.3、峰值 opacity ×0.7 = A6 白爆抑制） | 无体积感粒子幕 |
| ★ swap | t = 0.60 | （`RING_IN + VEIL_IN`） | `hotSwap()` 热交换（robot.setVisible(false) + car.visible=true） | 无 additive burst / 无金属解构感 |
| ③ 落地 | 0.60 → 1.05 | `DROP = 0.45`（`DROP_HEIGHT = 2`） | 车 easeOutBack 落地、光幕 `VEIL_OUT = 0.3` 内淡出、环随落地消散 | 无碎屑随落 / 无拖尾 |
| ④ 落地帧 | 1.05 起 | `SHAKE_DURATION = 0.3` | 垂直微震（解析阻尼正弦）+ `roll.kick(0.25)` | 无冲击尘环 / 无火花 |

- robot→car 合计 **1.05s ∈ 验收窗 1.0–1.2s**（PRD CITY-05 / SRD §12.7.2）；car→robot 回变共用序列、无落地拍（0.9s）。
- **holding 语义**：`waitFor` 未 resolve 时时钟停在充能峰值、`ringSpin` 继续积秒（环多转）——粒子层必须兼容「包络暂停、能量继续」的双时钟。
- **运镜已有**（CC-L4-B5）：`View.ritualCam` 通道（order 4 写 / order 7 消费），推镜 7% + 落地微震 + roll 微滚，恒等式保证 robot_idle 零漂移。**粒子层是运镜之上缺的最后一层**（`cyber-city-vehicle-transform-experience.md` §1.2「运镜已有；粒子层未叠」）。

### 1.2 审计红线（集成 PR 硬门，`cyber-city-vehicle-transform-experience.md` §5）

- e2e **52/52**；LHCI `/` + `/home/` 不降；
- `robot_idle` 未驾驶时**逐字节恒等**（poster 合同）——粒子在 idle 态不得有任何像素/渲染成本痕迹；
- 变形状态机四拍墙钟 **1.0–1.2s 不变**；reduced-motion 直出保留；
- CITY-03 配额：粒子须登记席位（见 §7）；变形帧**不白爆**（A6 判词不得回潮）；
- tone mapping 本批不碰（渲染审计 §9.1 的「一改全改」批次级工程，独立裁决）。

### 1.3 渲染架构约束（`cyber-city-rendering-architecture-audit.md` 摘要）

- 全站 TSL NodeMaterial，**零手写 GLSL/WGSL**；`WebGPURenderer` + WebGL 2 自动回退（`?gl=1` 强制复测腿）；
- 后处理 = `RenderPipeline` 单 bloom（strength 0.55/0.3、**threshold=1**、Q2 整段旁路）——粒子强度必须在 §5 emissive 台账内站队；
- 切档纪律「能 uniform 不重建」；补间一律 Ticker + 手写缓动（gsap 禁令）；
- **编译护栏**（审计 §9.4）：PreRenderer 预热只覆盖 Q0+WebGPU——新常驻材质的首帧编译必须落在挂载段而非变形中；
- draw call 台账现状健康（剪影 1 + 光轨 1 + 灯杆 2 + 隔离墩 4 + 招牌 10 + 楼宇 2–4/栋 + 路面/地坪/穹顶/Grid 各 1）；world JS 预算 84.8/900KB（CC-L5-C1 时点），余量充足。

### 1.4 in-repo 粒子先例：`FlightTrails.ts`（可直接复用的工程范式）

630 点（≤800 合同）单 InstancedMesh（PlaneGeometry 1×1 + SpriteNodeMaterial）= 1 draw call；**位置在顶点级由航线参数 + `time` 解析求出，零逐帧 JS、零 CPU 写缓冲**；`trailUniforms` 模块级共享 uniform 三档切换（Q1 `mesh.count` 裁尾 / Q2 `visible=false` + 强度/时间轴双归零）；`material.fog=false`（additive 吃雾会「加出雾灰」）；`frustumCulled=false`（实例位置在 shader 内）；additive 逐点 ~0.3、机头叠加峰 ≈1.3 略过阈。**这套纪律已通过双后端 e2e、三档取证与配额登记全流程**——变形粒子应整套继承，差异只在：驱动时钟从自走 `time` 换成 ritual 进度 uniform（§4.4）。

---

## 2. 对标调研

### 2.1 外部竞品 / 示例矩阵

| 对标 | 技法（可查证事实） | 对本站的可借鉴点 | 局限/不适用 |
|------|------------------|----------------|------------|
| **Virtual Car Showroom**（Awwwards HM 2025-03，rubric §2.2 在册） | 电影化换车转场：运镜 + 光效成套遮蔽模型切换（转场期间相机不静止） | 运镜部分已由 CC-L4-B5 落地；其「高级感」余下来源 = 转场瞬间的光效/粒子层——正是本批缺口 | 闭源站点，实现细节不可查证；只作观感锚 |
| **three.js 官方 `webgpu_compute_particles` / `webgpu_tsl_compute_attractors_particles`**（r18x） | `instancedArray` storage buffer + `Fn().compute(count)` 更新，`SpriteNodeMaterial.positionNode = buffer.toAttribute()` 渲染；百万级点数 | compute 路线的官方形态；SpriteNodeMaterial 渲染面与本站同构 | 依赖 compute（WebGL 2 腿风险见 §3.3）；持久态在 1.05s 窗内无收益 |
| **TSL morphing particles**（[ysztlww](https://github.com/ysztlww/tsl-morphing-particles) / [chrismaldona2](https://github.com/chrismaldona2/tsl-morphing-particles)） | `MeshSurfaceSampler` 把任意模型采样成 16k 均匀点云 → 烘进 `DataArrayTexture` → 顶点级 `mix(shapeA, shapeB, progress)` morph；InstancedMesh 渲染、curl noise 全 shader 内伪物理 | **最贴近「机器人→车」语义**：A→B 形态点云插值 + progress 单 uniform 驱动——与四拍 progress 映射天然同构 | 本站只有 2 个形态、单次通道，DataArrayTexture 过度设计——双 vec3 实例属性即可（§3.2） |
| **Codrops Dissolve Effect**（2025-02，[教程](https://tympanus.net/codrops/2025/02/17/implementing-a-dissolve-effect-with-shaders-and-particles-in-three-js/)） | noise 阈值 `uProgress` discard 溶解 + 溶解边缘发光 + 从边缘发射粒子 + 选择性 bloom | 「金属解构感」的标准配方：边缘发光带 + 边缘喷发粒子；本站光幕峰值 = 溶解阈值瞬间的语义等价物 | 对模型材质注入 shader 片段——本站机器人/车是经典材质/GLB 材质（审计 §8），改本体材质越界（热交换语义会变），只取「边缘喷发」思路不动本体 |
| **Codrops WebGPU Gommage**（2026-01，[教程](https://tympanus.net/codrops/2026/01/28/webgpu-gommage-effect-dissolving-msdf-text-into-dust-and-petals-with-three-js-tsl/)） | MSDF 文字溶解成尘埃/花瓣：TSL + InstancedMesh 双粒子系统 + MRT 选择性 bloom | **关键工程事实**：WebGPU 下 `THREE.Points` 不支持可变点径（恒 1 px）→ 官方教程明示粒子走 Sprite/InstancedMesh——`Points` 路线在本站直接出局 | 花瓣 GLB 资产（本站零资产纪律→ quad/拉伸 quad 程序化替代） |
| **hologram-particles**（[cortiz2894](https://github.com/cortiz2894/hologram-particles)，three r182 WebGPU） | 60k instanced 球体全息点云；**三相状态机 deform-out → morph → reform**；位移最大处 bloom 最亮 | 三相节奏与本站四拍映射同构（充能=deform-out、swap=morph、落地=reform）；「位移越大越亮」= 碎屑亮度调制的好配方 | GPU compute 物理 + 60k 球体实例（非 billboard）远超本站瞬态预算档位 |
| **folio-2025 粒子全家桶**（Snow 475 行 / RainLines 257 / Confetti 183 / Leaves 305 / Lightnings 492，MIT，teardown §World 表在册） | 引擎同源（TSL/WebGPU）的成套天气/庆祝粒子；Confetti = burst 语义最近先例 | 移植纪律已有成例（vendor clone + 重写 TS 保留出处注释）；tick order 10 的挂位参照 | vendor 目录 gitignore 不在库内（`vendor/README.md` 有重取指引）；folio 粒子多为常驻环境层，瞬态 burst 只有 Confetti 一件 |

### 2.2 in-repo 先例复用清单

| 先例 | 复用点 |
|------|-------|
| `FlightTrails.ts` | InstancedMesh+SpriteNodeMaterial 全套纪律（§1.4）；`applyQuality` 三档模板；取证开关协议（`scene.userData.*` #debug 句柄） |
| `TransformSystem.ts` 充能环/光幕 | JS-写-uniform 仅变形窗内的驱动通道（粒子 uniform 顺同一 `update()` 写入，零新 tick 订阅）；`ringSpin` 双时钟语义（holding 时环续转） |
| CC-L4-B5 运镜 | 「一次性瞬态零配额」登记先例；解析式（无积分发散）抗 SwiftShader 大 dt 的工程理由；`shakeClock` 独立衰减时钟模式（ritual 清空后余韵仍可推进） |
| `Reveal.ts` 光柱 | 拍④ 尘环/火花的「显现即消散」节奏参照；回变（car→robot）时光柱剧本可与粒子收束同帧 |
| `PreRenderer.ts` | 粒子材质编译预热接线位（Q0+WebGPU 之外的腿见 §5.4） |

---

## 3. 技术选型对比（交付①）

### 3.1 五路线总表

| | **A：解析轨迹 InstancedMesh**（FlightTrails 同门） | **B：A + 表面采样起讫点**（morph 语义增强） | **C：TSL compute**（instancedArray + `.compute()`） | D：`THREE.Points` | E：CPU 逐帧写 attribute | F：后处理 pass（冲击波/径向模糊） |
|---|---|---|---|---|---|---|
| 位置来源 | 顶点级解析（发射参数 + progress uniform） | 同 A，起点/终点换成挂载段一次性 CPU 采样的实例属性 | GPU storage buffer 逐帧积分 | — | JS 每帧写 InstancedBufferAttribute | 屏幕空间 |
| 双后端确定性 | ✅ 与 FlightTrails 同一代码路径，`?gl=1` 腿已被 e2e 隐式覆盖 | ✅ 同 A（采样在 CPU，渲染面不变） | ⚠️ WebGL 2 腿 = transform feedback「部分支持」（§3.3） | ❌ WebGPU 点径恒 1px | ✅ | ✅ 但违反管线纪律 |
| 逐帧 JS 成本 | ~2 次 uniform 写入（仅变形窗内） | 同 A | `renderer.compute()` 每帧调度 | — | O(n) 写缓冲 + 上传（n=数千） | pass 常驻开销 |
| 暂停/holding 语义 | ✅ 无状态，时钟停即画面停；SwiftShader 大 dt 零积分发散 | ✅ 同 A | ⚠️ 有状态：暂停/holding/中途降档需显式冻结 compute | — | ⚠️ 同 C | — |
| 表现力上限 | 高：螺旋吸聚/burst/抛物线/拖尾全可解析闭式 | 更高：碎屑贴合机器人/车真实轮廓（「从表面剥离」可读性质变） | 最高：持久态（碰撞、堆积、湍流累积） | — | 中 | 另一维度（空间扭曲） |
| 与既有纪律契合 | ✅ 全部继承 §1.4 | ✅ 渲染面同 A；新增 `three/addons` MeshSurfaceSampler import（数 KB） | ❌ 新机制（compute 调度、双档关停、取证协议全部新开） | ❌ | ❌ 违反 FlightTrails「零逐帧 JS」先例 | ❌ 单 bloom 纪律 + Q2 旁路语义破坏 |
| 结论 | **主选** | **推荐叠加**（DES 定夺采样规模） | **暂缓**（Phase 3 预烘焙变形评审同批再议） | **出局** | **出局** | **出局** |

### 3.2 Track B 细化：表面采样的可行性与边界

- **采样对象双路径均可行**：HeroRobot 是 GLB（Quaternius CC0）或程序化块面机甲回退，两者皆 `THREE.Mesh` 树——挂载段 `traverse` 收集 Mesh → `MeshSurfaceSampler`（`three/addons/math/MeshSurfaceSampler.js`）一次性采样 1–2k 点，锚点局部坐标系存储。CarConcept 经 `VisualVehicle.root` 同法采样。
- **数据形态**：单次 A↔B morph 不需要对标项目的 `DataArrayTexture`——每实例 2×vec3 实例属性（`fxFrom` = 机器人表面点 / `fxTo` = 车表面点）+ vec4 发射参数即可；4096 实例 × 4×vec4 ≈ **256KB 显存**，构建 <2ms 量级。
- **时序边界**：机器人在 robot_idle 必然已就位（可见即已加载）；**车 GLB 可能在 waitFor 挂起**——采样须在 waitFor resolve 后、swap 前完成（充能 holding 窗天然是缓冲带）；车资产失败路径（R4 同源止损：物理照常、视觉缺席）退化为解析车壳包围盒近似或跳过聚合相位——DES 必须写死这条降级线。
- **回变复用**：同一属性对反演（`fxTo→fxFrom`）零新数据。

### 3.3 Track C 暂缓的证据链

- three 官方 [PR #27367](https://github.com/mrdoob/three.js/pull/27367)（WebGL backend 部分 compute 支持）自述：storage buffer 仅限 `instanceIndex` 访问、buffer 分配翻倍、VAO 管理特殊化；[PR #27661](https://github.com/mrdoob/three.js/pull/27661)（PBO texelFetch 读外部元素）作者明言 **read-only** 且「`webgpu_compute_particles` / `_rain` 示例仍有 shader/node 层问题」。
- 本站硬门：CITY-E2E 用例 `?gl=1` 回退腿「全程零未捕获异常」+ 变形状态序完整走通——把变形炫技绑在回退腿的「部分支持」面上是不必要的架构风险。
- 收益侧：compute 独有能力 = 跨帧持久状态。变形窗 1.05s + 0.3s 余韵内，碎屑堆积/二次碰撞肉眼不可辨；解析抛物线 + hash 抖动在该时长下与真积分无观感差。
- **重启条件**（写给 Phase 3 预烘焙变形评审）：若 V2 预烘焙部件级变形立项且需要碎屑与部件互动，届时 compute 与预烘焙动画同批评审；且届时 three 版本的 WebGL compute 支持面需重新查证。

---

## 4. 效果词汇表与四拍对齐方案（交付④）

### 4.1 相位→节拍映射（四拍常量零改动，粒子只做只读消费方）

| 时间轴 | 相位 | 粒子行为（全解析闭式） | 强度/bloom 站队 |
|--------|------|----------------------|----------------|
| ① 0→0.35 | **吸聚**（converge） | 从充能环外缘（r≈4m）逆重力螺旋收束上升（r 4→0.5m、y 0→3m）；密度包络随 easeInQuad 攀升（与推镜同拍）；环缘随机 spark 溅射 | 逐点 ≤0.9 阈下（能量在积聚、尚未起辉）——与推镜「蓄力」观感同语义 |
| ② 0.35→0.60 | **峰值悬滞**（hold） | 密度峰值；竖幕内侧上升粒子流（沿光幕平面内随机柱状上升，读作「能量幕有厚度」）；**holding 时包络定格在本相位、运动继续**（§4.3） | 峰值粒子 ≈1.1–1.3 略过阈（FlightTrails 机头同档），数量少（≤15% 实例） |
| ★ t=0.60 | **爆发**（burst） | 热交换帧：径向 additive burst（大 quad ≤64 个、寿命 ≤0.25s）+ **金属碎屑环喷**（Track B 时从机器人表面点起跳）；「位移越大越亮」调制（hologram-particles 配方） | burst 头 1.6–2.0 短时过阈起辉（≤0.25s 即跌回）；**总帧亮度须 A/B 对照**——A6 光幕已压 ×0.7，burst 不得把它加回白爆（审计门「变形帧不白爆」） |
| ③ 0.60→1.05 | **随落**（settle） | 碎屑解析抛物线下落 + 短拖尾（速度方向拉伸 quad，「金属条」读法）；Track B 时碎屑向车壳表面点聚合吸附（`mix(from, to, settleT)` + curl 抖动）；密度随 DROP 进度衰减 | 快速跌落阈下（拖尾 ≤0.5）；与光幕 VEIL_OUT 淡出同拍不叠加白账 |
| ④ 1.05 起 | **冲击**（impact） | 落地帧地面冲击尘环（贴地扁环径向扩散 4→7m）+ 轮位火花溅射；0.3s 内衰减归零——与 `shakeY` 微震/`roll.kick` 同帧起、同窗收 | 尘环 ≤0.6 阈下（「尘是环境不是光源」，与天空/雾同纪律）；火花少量过阈点缀 |
| 回变 car→robot | 反演 | 无落地拍：吸聚→峰值→burst 后粒子向机器人表面点收束（`fxTo→fxFrom`），VEIL_OUT 窗内收完 | 同上，无 impact 相位 |

### 4.2 驱动机制推荐：复用既有 JS-写-uniform 通道

- **推荐（a）：TransformSystem 逐帧写 2 个新 uniform**——`fxProgress`（`run.clock` 归一化 0..1，含相位常量在 shader 侧以 `smoothstep` 窗口函数展开）+ 复用现成 **`ringSpin`** 作连续能量时间轴（它已在 holding 时继续积秒）。零新 tick 订阅、零新机制，与 ringOpacity/veilOpacity 同一 `update()` 写入点（order 4，视觉同步段）。
- 备选（b）：shader `time` 自走 + JS 只写起始时间戳——**否决**：无法跟随 Ticker 暂停冻结（「暂停即冻结」是四拍法条）、无法表达 holding。
- 拍④ 余韵越过 `completeRun()` 的问题：ritual 清空后粒子尘环仍需 0.3s 衰减——**复用 `shakeClock` 模式**（独立衰减时钟，ritual 生命周期外仍推进、终帧强制归零），先例已在 §1.1 拍④。
- **swap 帧触发**：无需 JS 分支——burst 相位 = `smoothstep(swapT, swapT+ε, fxProgress)` 窗口函数；swap 时刻在时间轴上是常量（`RING_IN+VEIL_IN`），shader 编译期已知。holding 时 `fxProgress` 停在 swap 前，burst 自然不提前。

### 4.3 holding（waitFor 多转）契约

充能环峰值等待车资产时：`run.clock` 不推进（包络冻结在相位②峰值）、`ringSpin` 继续积秒（环多转）。粒子层同构继承：**包络（密度/相位窗）吃 `fxProgress`、运动（螺旋角、上升流相位）吃 `ringSpin`**——多转期间粒子持续旋涌但不爆发，「等待被读作蓄力更久」，与充能环的进度语义一致。零新状态。

### 4.4 不可动面清单（DES/IMPL 逐条自查）

1. `RING_IN/VEIL_IN/VEIL_OUT/DROP/DROP_HEIGHT/RING_RADIUS` 六常量零改动；
2. 状态机四态与 `hotSwap`/`finish`/`completeRun` 时序零改动（粒子不得反向影响状态机）；
3. `ritualCam` 通道语义零改动（粒子不写相机）；
4. e2e SEL 契约与 `data-world-state` 镜像零改动；
5. 变形墙钟 1.0–1.2s：粒子是并行视觉层，不引入任何 await。

---

## 5. 点数与 GPU 预算建议（交付②）

### 5.1 参照系与真瓶颈

FlightTrails 630 点合同 ≤800 是**常驻、中远景（≥110m）**层；变形粒子是**瞬态（≤1.35s 含余韵）、近景（20m 机位 / FOV 42°）**层——同点数下每实例屏占大一个量级，**预算轴心从点数换成 additive overdraw**。估算：20m 斜距 FOV 42° 下画幅高 ≈15.4m，0.3m 粒子 ≈ 画高 2%（屏占 ~0.04%）；2000 实例 × 0.04% ≈ **0.8 屏当量**峰值 overdraw——移动端可承受的上限带。大 quad（1–2m burst 光球）单个屏占 ~1–4%，必须限量。

### 5.2 分档预算表（建议值，DES 可在 ±25% 内调整）

| 档 | 总实例 | 相位配比（吸聚/幕流/burst/碎屑/尘环火花） | 点径带 | 峰值屏占护栏 | 机制 |
|----|--------|------------------------------------------|--------|-------------|------|
| **Q0** | **≤4096** | 1024 / 512 / 64（大 quad）/ 1536 / 960 | 0.06–0.5m（burst 例外 ≤2m） | ≤0.8 屏当量 | 全效 |
| **Q1** | **≤1536** | 384 / 192 / 32 / 640 / 288 | 上限压 0.35m（burst ≤1.4m） | ≤0.35 屏当量 | `mesh.count` 裁尾（相位-major 写入序 = 裁尾合同，FlightTrails route-major 同款）+ 强度 ×0.8 |
| **Q2** | **0** | — | — | — | `visible=false` + count=0 + 强度归零**双保险不画**（四拍仪式本体 ring/veil 照常，变形语义完整） |
| reduced-motion | 不建 | — | — | — | instant swap 分支无 ritual 时间轴，粒子系统不实例化 |

- **draw call：+1**（单 InstancedMesh 装全部相位；若 DES 论证碎屑「拉伸 quad」与圆点 billboard 必须分材质，上限 **+2** 并在 PR 写入台账行）。
- 显存：4096 × 4×vec4 实例属性 ≈ 256KB；几何共享 PlaneGeometry 1×1。零贴图零资产（全程序化圆点/条形软片，`uv()` 距离场）。
- world JS 预计 **+8–12KB 源码**（84.8/900KB 余量下无预算风险）；Track B 追加 MeshSurfaceSampler addon import（tree-shake 后数 KB）。

### 5.3 bloom 台账站队（渲染审计 §5 契约的增量行）

| 新增件 | 线性强度 | 站队 |
|--------|---------|------|
| burst 光球头（≤64 实例、≤0.25s） | 1.6–2.0 | 阈上短时——与招牌 1.9–2.4 档同带但瞬态，不挤占常驻辉光名额 |
| 峰值悬滞亮粒（≤15%） | 1.1–1.3 | 阈上——FlightTrails 机头同档先例 |
| 吸聚/碎屑/拖尾主体 | ≤0.9 | 阈下 |
| 冲击尘环 | ≤0.6 | 阈下（「尘是环境不是光源」） |

**白爆护栏**：swap 帧已有光幕峰值（A6 压过 ×0.7）——burst 与光幕同帧叠加是白爆最高危点，DES 须给同机位 A/B 帧对照（有 burst / 无 burst）与峰值亮度数据，CC-AL-TRANS-FX「变形帧不白爆」的证据从这里出。

### 5.4 编译与 CI 成本

- **编译预热**：粒子材质随城市挂载段构建（懒建到首次 transform 会把编译卡顿塞进仪式第一帧——审计 §9.4 明令避免）。Q0+WebGPU 有 PreRenderer 覆盖；**Q1/WebGL 腿建议挂载末拍做一帧 `visible=true, count=1, opacity 0` 级别的隐式预热**（或等价的 `renderer.compileAsync`），DES 定夺具体形态。
- **SwiftShader/CI**：变形窗粒子会进一步压低软渲染帧率——录屏取证沿用 CC-L4-B5 的 CDP `Page.startScreencast` 逐合成帧协议（`Ticker.maxDelta=1/30` ⇒ 30fps 拼装 = 设计时间等速）；`pnpm test:visual` 现有 4 帧取证点均不在变形窗内（VIS-01/02 壳、E3 robot_idle、E4 POI），零基线冲击；若 DES 要新增 burst 帧取证，独立加 shot 不动现有基线。

---

## 6. reduced-motion 与降级链（交付③）

1. **prefers-reduced-motion**：`TransformSystem.transform()` 的 reduced-motion 分支走 `hotSwap + finish` 即返（不建 `ritual`）——粒子驱动 uniform 恒零、系统不实例化/不可见。**零新分支**：现有「不建 ritual 时间轴 → 运镜通道恒 0」的纪律直接外推到粒子通道。文字状态提示（`[data-world-status]`）照常，CITY-E2E-04 契约零改动。
2. **poster 逐字节恒等**：粒子 mesh 默认 `visible=false`，仅 `transforming` 态置 true、`completeRun`+余韵后归 false——robot_idle 帧不进渲染列表（比「additive 加零」更强：像素等价 + 零渲染成本 + 逐字节恒等三者同时成立）。
3. **Q2 止损档**：不画（§5.2）——与 FlightTrails Q2「明确关闭不是调暗」同款语义；变形仪式本体（环/幕/热交换/落地）完整，粒子是纯增强层。
4. **`?gl=1` WebGL 2 腿**：Track A/B 渲染面与 FlightTrails 同路径，双后端能力已被现网证明；DES 无需为回退腿留任何特殊分支（这正是否决 Track C 换来的架构简洁性）。
5. **变形中途自动降档**（FpsMeter → Q2）：解析式无状态——`visible=false` + 强度归零即时生效、无中间态损坏；粒子中断不影响四拍推进（只读消费方）。
6. **dispose**：单 InstancedMesh 进 `game.scene` 由 Game 场景遍历统一释放（city 无独立 dispose 纪律）；若挂 TransformSystem 生命周期则入 `ownedGeometries/ownedMaterials` 既有登记表——DES 二选一并写明（倾向后者：粒子与仪式同生命周期，`dispose()` 现有通道零新面）。

---

## 7. CITY-03 配额与审计登记

- **计席口径**（CC-L3-B3 书面登记，A4 观察 B 收口）：「帧内可见的**持续**时间性动画计席，与驱动源无关；静态采样与常亮不计席」。变形粒子 = 用户主动触发的**一次性瞬态**（1.05s + ≤0.3s 余韵，非循环、非常驻）——与 CC-L4-B5 运镜「一次性瞬态，CITY-03 循环动画配额零占用」完全同构，**登记零席位**。
- 现台账 3/3（HeroRobot idle 呼吸 / 楼顶全息板脉动 / 飞行光轨）不受挤占；Phase 3 ≤5 天花板不动。
- **合规动作**：硬门 §5「变形粒子须登记席位」的完成态 = CC-TRANS-FX-DES 在 `cyber-city-eng-wave1-notes.md`（或 DES 文档配额小节）落**书面登记条目**，写明「瞬态零席位 + 依据 = B5 先例 + 口径原文」，供 CC-AL-TRANS-FX 直接引用。**禁止**把任何相位做成 idle 态常驻循环（例如「变形后车身残留能量微粒」）——那会立刻变成第 4 席，越界即撤。
- **CC-AL-TRANS-FX 证据清单建议**（写给 IMPL 的验收面）：① 四拍时序对照（状态机时间戳 log：transforming→car_ready 墙钟 ∈1.0–1.2s）；② reduced-motion 直出帧（零粒子）；③ swap 帧亮度 A/B（burst 开/关同机位）；④ e2e 52/52 + `?gl=1` 腿零异常；⑤ robot_idle 帧逐字节 diff = 0；⑥ draw call/点数台账行（console 装配行取证，FlightTrails `pointCount` 同款）。

---

## 8. 给 CC-TRANS-FX-DES 的待决清单

| # | 待决项 | 本调研倾向 |
|---|--------|-----------|
| 1 | Track B 采样规模与降级线（车资产失败/超时路径） | 每形态 1–1.5k 点；失败退解析包围盒近似 |
| 2 | 色相：粒子锁 NEON.cyan/magenta 双主轴 vs 引入锚点楼色 | 锁双主轴 + burst 头掺 40% 暖白（FlightTrails 机头同法，零新色相） |
| 3 | 碎屑形态：圆点 billboard vs 速度向拉伸 quad「金属条」 | 混合：碎屑用拉伸 quad（金属读法），能量点用圆点——若因此需第 2 材质，draw call +2 上限内 |
| 4 | 尘环：粒子化 vs 复用 ring mesh 二次扩散 | 粒子化（ring 语义是「充能」，落地复用会串音）；贴地扁环相位并入主 InstancedMesh |
| 5 | 驱动 uniform 命名与写入点 | `fxProgress` + 复用 `ringSpin`；`update()` 现有写入段追加 2 行 |
| 6 | 取证开关 | `scene.userData.transformFx.setFx(0\|1)`（cityFlightTrails.setTrails 同协议，#debug 句柄） |
| 7 | 是否加落地帧地面贴花（scorch mark 余韵） | 不做——常驻痕迹既占帧噪音又逼近「常驻循环」灰区 |

---

## 9. 来源索引

**in-repo**：`src/lab/world/player/TransformSystem.ts`（四拍常量/holding/运镜通道）· `src/lab/world/city/FlightTrails.ts`（粒子纪律范式）· `src/lab/world/view/View.ts`（ritualCam）· `src/lab/world/core/Quality.ts` · `docs/research/cyber-city-visual-rubric.md`（§2.2 Virtual Car Showroom 锚、§6 B3/B5）· `docs/research/cyber-city-eng-wave1-notes.md`（CC-L3-B3 配额登记、CC-L4-B5 运镜/录屏协议、CC-L5-C1 预算时点）· `docs/research/cyber-city-rendering-architecture-audit.md`（§4/§5/§9 管线与台账）· `docs/research/cyber-city-vehicle-transform-experience.md`（Loop 7 任务书与硬门）· `docs/research/bruno-simon-folio-source-teardown.md`（folio 粒子清单）· `docs/spec/PRD.md` CITY-03/05/06 · `docs/spec/SRD.md` §12.7.4 · `e2e/cyber-city.spec.ts` CITY-E2E-03/04。

**外部**：three.js 官方示例 [webgpu_compute_particles](https://github.com/mrdoob/three.js/blob/master/examples/webgpu_compute_particles.html) / [webgpu_tsl_compute_attractors_particles](https://github.com/mrdoob/three.js/blob/master/examples/webgpu_tsl_compute_attractors_particles.html) · [TSL Wiki](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language) · WebGL backend compute 支持面：[PR #27367](https://github.com/mrdoob/three.js/pull/27367)、[PR #27661](https://github.com/mrdoob/three.js/pull/27661)、[Issue #27642](https://github.com/mrdoob/three.js/issues/27642) · [tsl-morphing-particles (ysztlww)](https://github.com/ysztlww/tsl-morphing-particles) / [chrismaldona2 fork](https://github.com/chrismaldona2/tsl-morphing-particles) · Codrops [Dissolve Effect (2025-02)](https://tympanus.net/codrops/2025/02/17/implementing-a-dissolve-effect-with-shaders-and-particles-in-three-js/) / [WebGPU Gommage (2026-01)](https://tympanus.net/codrops/2026/01/28/webgpu-gommage-effect-dissolving-msdf-text-into-dust-and-petals-with-three-js-tsl/) · [hologram-particles (cortiz2894)](https://github.com/cortiz2894/hologram-particles) · [Virtual Car Showroom（Awwwards HM 2025-03）](https://www.awwwards.com/sites/virtual-car-showroom)。

---

*CC-TRANS-FX-RS · 2026-08-27 — 只调研零实现；下游 CC-TRANS-FX-DES 消费 §3 选型、§4 时序映射、§5 预算表、§7 配额登记与 §8 待决清单。*
