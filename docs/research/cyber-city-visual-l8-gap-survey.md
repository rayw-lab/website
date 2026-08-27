# 赛博科技城视觉 71→98 gap 调研（CC-VIS-L8-RS）

| 项 | 内容 |
|----|------|
| Task | **CC-VIS-L8-RS**（Loop 8 视觉提分输入调研 · doc-only） |
| 分支 | `cursor/cc-vis-l8-rs-1d6f`（base `main@66ed0fe`） |
| 日期 | 2026-08-27 |
| 方法 | 巨人肩膀（Bruno folio-2025 案例研究 + 开源仓）+ 竞品复核（Orion / Jesse's Ramen / 2026 Awwwards 趋势）+ three.js r183+ 工艺基线更新 + 逐维代码/审计核对 |
| 输入 | `cyber-city-visual-rubric.md` v1.1 · `cyber-city-visual-rubric-score.json`（**71**，AL-CAM）· `loop6-cam-audit.md` · `loop-veh-r2-audit.md` · `loop-bl2-reaudit.md`（PR [#43](https://github.com/rayw-lab/website/pull/43) NO-GO）· `cyber-city-rendering-gaps-consult.md` · `loop5-audit.md` |
| 消费方 | 父代理 Loop 8+ 视觉轨派单；后续 TM / BL2-R2 / V1 批任务书直接引用本文件 §5 边界 |
| 纪律 | 本 Task 零 `src/`、零 e2e、零 score JSON、零 poster、零像素基线改动 |

---

## 0. 结论先行

1. **71→98 的算术**：生产登记向量 `V1 65 / V2 74 / V3 69 / V4 72 / V5 70 / V6 73 / V7 75`（raw 70.50）。到 98 需加权 **+27.5**，等价于七维全部推进 ~98——rubric 标定 95-100° = Bruno folio-2025 **SOTD/SOTY 级**。这不是一个 Loop 目标，是三段位的路线图：
   - **71 → ~75**（P0 批，§5.1）：BL2-R2 补洞过 V4 门 + tone mapping 校准 + V1 definitive-shot 批 + 潜分收账；全部在现行红线内合法；
   - **~75 → ~85**（P1 实模密度专项，§5.2）：rubric §6 尾注已预留的「Blender 实模资产管线专项」显式裁决——Orion HM 级密度；
   - **~85 → 98**（红线重谈段，§5.3）：Bruno 级「作者化世界」——全城 palette 统一层、活世界系统、品牌字体、diegetic UI 深化，逐项与现行 G-A′ 红线/循环动画配额冲突，**必须专项裁决，禁止 Loop 内隐式预支**（与 rubric「75→85 尾段裁决」同款条款，上移一段）。
2. **潜分事实**：main 已合 TRANS-FX 粒子层（AL-TRANS-FX GO，V5 诊断建议 **74**）与 FXN-C3 进站 tween，均未进生产分。但重评自身只值 raw +0.60（70.50→71.10，整数仍 71），**不值得单开评分批**——应捆绑进下一个实现批的独立审计一并收账（§5.1 P0-4）。
3. **综合换算**（其余四轴保持 100）：综合 = 75 + 0.25×视觉。**综合北极星 98 ⇔ 视觉 ≥92**；视觉北极星 98 ⇔ 综合 99.5。视觉是唯一决定轴，每 +4 视觉分 = 综合 +1。
4. **BL2 纪律不变**：PR [#43](https://github.com/rayw-lab/website/pull/43) 维持 NO-GO **禁止合流**；V4 的 72–75 门必须走复审 §9 最小补洞（新候选 SHA + 24 张历史 PNG 回滚 + work-gallery 整帧可读轮廓组）。本调研的 P0/P1 全部与 BL2 归因隔离（§6.1）。
5. **poster 纪律不变**：desktop 39.7KB / mobile 38.0KB gzip，距 40KB 红线余量 <0.5KB；`public/posters/` zero-diff 与 `ritual_idle` 恒等是每批审计硬门；P0 若 TM 与 V1 批都落地，**poster 全程只在最后一个改帧批的批尾重拍一次**（§6.2）。
6. **工艺基线更新（本调研新证据）**：three.js r183+ 的 MRT emissive 选择性 bloom 已有官方样例（Jesse's Ramen 工艺的引擎原生化）；tone mapping 选型上 **AgX / Khronos PBR Neutral 对霓虹饱和度的保持优于 ACES**——`cyber-city-rendering-gaps-consult.md` 当时默认 ACES 参照系，TM 批任务书应按 §2.3 更新选型矩阵。

---

## 1. 巨人肩膀：95-100° 锚的可迁移工艺清单（Bruno folio-2025）

来源：Awwwards 官方案例研究（https://www.awwwards.com/brunos-portfolio-case-study.html ）、开源仓 https://github.com/brunosimon/folio-2025 （MIT，含 .blend 源文件）、站内 teardown 四件（`bruno-simon-teardown-*.md`、`bruno-simon-folio-source-teardown.md`，vendor 已 clone）。

| # | 工艺 | folio-2025 做法 | 本站现状 | 可迁移性 → 受益维 |
|---|------|----------------|---------|------------------|
| G1 | **palette texture 调色板压缩** | 全场景颜色收进一张 palette 纹理，模型经 UV 映射取色；合并几何仍能有色彩变化——「全场景色调统一成一张图」的根技术 | buildings JSON 色值直出材质；L1-A3 已收敛窗色三族，但无全城统一 palette 层 | **中**（引擎-中）；V3 明暗节奏经营的终极解，也是 85→98 段 V3 95+ 的必要条件 |
| G2 | 手工资产优化管线 | 隐藏面删除、几何合并、ETC1S/UASTC 压缩、Draco；「体积换密度」 | BL1/BL2 生成器同源（Draco+KTX2 ETC1S、≤2K 贴图）；已对齐 | **已对齐**；BL3 扩批直接沿用 |
| G3 | TSL 双后端 | NodeBuilder 同源出 WGSL/GLSL，WebGPU 可用即自动升档 | r185 `WebGPURenderer` + WebGL2 回退，同源 | **已对齐** |
| G4 | 移动降档 preset | 移动端自动关水面模糊/DOF、降阴影分辨率 | Q0/Q1/Q2 三档已有；但本站**没有** DOF/水面模糊这类「Q0 特权效果」可关——降档体系比对手完整、上限效果比对手少 | **低成本启示**：Q0 专属效果（DOF 微量/雨丝）是 V2 差异化位，见 §5.2 P1-6 |
| G5 | **活世界系统** | DayCycles / YearCycles / Weather / Wind / Rain / Snow / Lightnings / Tornado 等 40+ 子系统按依赖序 tick——「世界活着」的生命感主源 | 循环动画配额 ≤3（B3 裁决扩 1 席，Phase 3 天花板 ≤5）；idle 呼吸 + 招牌脉动 + 飞行光轨已满 3 席 | **红线冲突**；85→98 段议题（§5.3），当前段位用「静态层次 + 少量强节拍」替代（2026 趋势也支持克制，§2.2） |
| G6 | 3D 化 UI + 手写字体 | UI 元素进 3D 世界（diegetic）；Amatic 手写字体贯穿 | 系统字体栈（壳 86.5/90KB，webfont 被红线否决）；HUD 为 DOM 素面件 | V6 90-100 锚即此项；**红线冲突**，85→98 段议题 |
| G7 | 发布纪律 | 一年周期 + milestone devlog +「我们是自己最糟的客户」的止损意识 | 提分 Loop + 独立审计 + 反通胀条款，机制同构 | **已对齐**（机制层） |

> 判读：G2/G3/G7 已同源——本站与 95° 锚的差距**不在工程底盘，在美术投入量级**（G1 色彩统一层、G5 生命感、G6 UI 一体化、以及 Orion 侧的实模密度）。这与 rubric v1.1 §0「工程底盘竞品级、视觉呈现最弱轴」的诊断在更高分位上依然成立。

## 2. 竞品对标复核（88°/82° 锚 + 2026 趋势增量）

### 2.1 定标锚复核

| 锚 | 站点 | 本轮新证据 | 与本站当前 gap 的核心 |
|:---:|------|-----------|----------------------|
| 88° | Cyber City Orion | making-of 自述（作者站 https://www.adrianred.com/portfolio/cyber-city-orion 的 X thread 2025-09-17；Abduzeedo 报道 https://abduzeedo.com/cyber-city-orion-exploring-future-immersive-web-design ）：4 个月、Blender 全手工（建模/UV/贴图）→ Draco/KTX2、Three.js 渲染、4 档画质、真机+触屏全覆盖；FWA/CSSDA SOTD + Awwwards HM | 楼身广告牌密度、雨湿楼面反光、大气光、预加载→入城转场成套。本站 V4 72 的评语「楼仍为程序化盒体，细节不足」逐字对应此差距——**V4 主战场未变** |
| 82° | Jesse's Ramen | 选择性 bloom 工艺自述（https://jesse-zhou.medium.com/jesses-ramen-case-study-77bae77ab5f0 ）——手工逐件控制起辉对象 | 本站 bloom 为全彩通路 threshold=1 的阈值纪律（`Rendering.ts`）；r185 已有 **MRT emissive 选择性 bloom 官方样例**（§2.3），Jesse 工艺可引擎原生化，V2 升段位的明确路径 |
| 95° | Bruno folio-2025 | §1 全表 | 色调统一（G1）+ 生命感（G5）+ UI 一体化（G6） |

### 2.2 2026 Awwwards 趋势增量（对 rubric 口径的外部校验）

来源：svilenkovic.com 3D portfolio / SOTD 2026 趋势稿（https://svilenkovic.com/3d/3d-portfolio-trends-2026 · https://svilenkovic.com/3d/sotd-2026-3d ）、digitalstrategyforce 2026 Awwwards 沉浸式分析、Codrops cinematic 3D scroll 教程（2025-11）。

| 趋势 | 判分含义 | 本站对位 |
|------|---------|---------|
| **克制 > 堆料**：赢家做 1-2 个强节拍，不做 10 个特效；「粒子背景 + 旋转 logo」模板脸出局 | 与 AL5「禁止 Tier C 叠件赌四舍五入」裁决同向；强节拍应继续押注变形仪式 + 首幕 | ✅ 方向正确；V5 变形四拍 + 粒子层已是强节拍资产 |
| **电影化镜头编排**：camera spline / 编排位驱动叙事，「相机运动即讲故事」成为主要判分面 | 本站已有 camera-shots 注册表 + NDC 探针基建（PR #45），但 shot 为挂载期**直切、零 tween**（AL-CAM V5 评语） | ⭕ 基建在、编排消费缺——V5 最便宜的升段位杠杆（§4 V5） |
| **custom typography = craft 信号** | V6 90-100 锚的外部印证 | ❌ 系统字体栈；红线冲突（§5.3） |
| **a11y（reduced-motion）成为判分项** | rubric V5 已内建 | ✅ 全链直出降级已实证 |
| **Lighthouse mobile 90+ 是 table stakes** | 非加分项，是入场券 | ✅ 本站 100×4，超额 |
| 出局项：模板布局、泛用粒子背景、忽视移动端 | CC-T1 反模式 P1 同判 | ✅ 已规避 |

> 校验结论：rubric v1.1 的七维与权重**不需要修秤**；2026 趋势与其完全同向（克制、镜头编排、字体工艺、a11y）。新增的判分重心（镜头编排叙事）在 V5/V1 维内已有锚点位。

### 2.3 引擎工艺基线更新（three.js r183+，供 TM/bloom 批任务书引用）

1. **RenderPipeline**：r183 起为后处理正名入口（本站 `Rendering.ts` 已用 r185 `THREE.RenderPipeline`，无迁移债）；tone mapping 与色彩空间转换在管线末端自动应用，`renderOutput()` 可手动接管顺序（官方手册 https://threejs.org/manual/en/webgpu-postprocessing.html ）。
2. **MRT 选择性 bloom**：`scenePass.setMRT(mrt({ output, emissive }))` → `bloom(scenePass.getTextureNode('emissive'))`——只对 emissive 通道起辉，白色非发光面不再可能污染辉光（官方样例 `webgpu_postprocessing_bloom_emissive`）。相对本站现行「全彩通路 threshold=1」：语义上更干净（辉光资格由材质台账声明，而不是亮度阈值兜底），且 emissive 纹理可降 `UnsignedByteType` 省带宽。**建议作为独立小批，不与 TM 同 PR**（归因隔离）。
3. **tone mapping 选型矩阵**（修正 `cyber-city-rendering-gaps-consult.md` 的 ACES 默认参照）：

| 选型 | 霓虹场景表现 | 判据 |
|------|-------------|------|
| ACESFilmic | 高亮区饱和度坍缩、发灰（霓虹青/品红最受伤） | 社区一致结论；车配置器（HDRI 车漆）适用 ≠ 霓虹城适用 |
| **AgX** | 高光滚降平滑、色相偏移小、保饱和 | r160+ 内建 `THREE.AgXToneMapping`；夜景霓虹首选候选 |
| **Khronos PBR Neutral** | 色彩保真优先（为电商/品牌色设计），几乎不偏色 | r165+ 内建 `THREE.NeutralToneMapping`；品牌青 #49c5b6 逐帧一致性最好 |
| Reinhard/Linear | 白爆或平淡 | 排除 |

   TM 校准批应 **AgX 与 Neutral 双方案同机位对比取证**后定夺，exposure 与全城 emissive 台账联动重校（consult §1.1 风险 3 的施工合同原文继续有效）。

## 3. 逐维 gap 拆解（71 → 98）

分轨迹：51（L0 合议）→ 68（AL5）→ 70（AL-BL1）→ **71（AL-CAM，生产）**。加权缺口 = (98−维分)×权重。

| 维 | 现分 | 加权缺口 | 滞涨情况 | 一句话主缺口 |
|----|:---:|:---:|------|------------|
| V1 首幕构图 | 65 | **6.60** | AL4 起连续五轮 65，**最大单项** | definitive shot 缺席：无前景景框层、poster 为软渲染实拍、首幕无点亮节拍 |
| V2 光照材质 | 74 | 4.80 | BL1 后未动 | tone mapping 缺席（`NoToneMapping`）、无 IBL/AO、bloom 未选择性化、反射首幕可见性弱 |
| V3 色彩氛围 | 69 | 4.35 | **AL4 起连续五轮 69，最滞涨** | 明暗节奏零经营、无全城 palette 层（G1）、无 grading——全部压在 TM 批之后的链条上 |
| V4 场景密度 | 72 | 3.90 | BL1+CAM 两轮 +12，唯一在涨 | 程序化盒体 vs 实模；BL2 卡 72–75 门；街道生活与招牌密度远逊 Orion |
| V5 动效转场 | 70 | 4.20 | 生产分滞后（潜分 74 已审未登） | shot 直切零 tween；无预加载→入城成套转场；镜头编排消费缺 |
| V6 UI/HUD | 73 | 2.50 | AL4 起五轮未动 | diegetic 面板缺、排版零个性化（红线）、速度表素面 |
| V7 原创叙事 | 75 | 1.15 | 缓涨 | 「楼=产品线」帧内自明度不足；世界观可转述度依赖文案 |

### V1 首幕构图（65 → 段位天花板拆解）

- **已在位**：θ25° 偏轴 + drift 1.1° 慢漂（A4）、天空穹顶+分层大气+低云带（A1/ATM）、剪影层（B4）、斑马线导视线。65 分评语实为「构图有意识、缺 definitive shot 打磨」——70-85 段门槛只差「≥3 层纵深的前景层 + poster 精修」。
- **70-85 段缺件**：①前景景框元素（近景桥架/管线剪影，Tier C 遗留）——补齐「前景/主体/中景/天际线/雾」五层中唯一缺失的前景层；②首幕招牌 stagger 点亮（150ms 逐楼，Tier C 遗留）——给 poster 后的首个 3D 稳定帧一个「城市醒来」节拍；③poster 真机重拍（A10，永远批尾）。对标：Orion 开场天际线、Bruno 出生点定帧。
- **85+ 缺件**：整帧可当海报的光比经营（依赖 TM/grading 落地）+ 实模天际线（依赖 P1 密度专项）。V1 是**复合维**——它的 90-100 段位由 V2/V3/V4 的落地共同解锁，本身可直接施工的只有构图件。

### V2 光照·材质·后处理（74 →）

- **70-85 段内继续爬**：tone mapping 校准（§2.3 选型）直接命中「高光滚降 + 材质程序感」评语；MRT 选择性 bloom 把辉光资格从阈值兜底升级为台账声明（Jesse 工艺原生化）；湿反射首幕可见性调参（A9 只做过 uniform 级，POI 帧已实证、首幕机位仍弱）。
- **85+ 缺件**：IBL（generator_city 的物理天空驱动 IBL 思路，与 A1 穹顶可衔接）、AO（实模楼落地后烘焙进 KTX2 贴图，走 G2 管线而非运行时 SSAO）、Q0 特权效果一件（雨丝或微量 DOF，G4 启示——**只开一件**，遵守克制趋势）。

### V3 色彩体系与氛围（69 → 最滞涨维的解锁链）

- 69 的评语五轮未变（AL4→AL5→BL1→BL2→CAM）：「色板与明暗节奏不变」。它滞涨不是没人管，而是**它的施工面被 TM 批锁住**——grading/明暗节奏经营必须在 tone mapping 落地后校，否则校两次。解锁链：TM（P0-2）→ 变形后色温「巡航态」微移（Tier C 遗留，常量级）→ 全帧 grading 微调（TSL `saturation`/LUT 节点，r183+ 内建）→（85+ 段）G1 palette texture 全城统一层。
- 对标：Bruno「调色板压缩让全场景成一张图」；Jesse 同色 #49c5b6 的单一色叙事。本站三面同源（DOM/3D/poster）已实证，缺的是**帧内明暗节奏**（亮区克制、暗区有形、重点色运营）。

### V4 场景密度与世界可信度（72 → 主战场）

- **72–75 门**：唯一合法路径 = BL2-R2 最小补洞（复审 §9 转录于 §6.1）。V4 是当前唯一在涨的维（BL1 +10、CAM +2），路线正确。
- **75-85 段**：rubric 尾注的「实模资产管线专项」= P1 主体（§5.2）：第 3–5 栋 hero 楼 + 街道生活组合件（沿街灯箱/摊位/停靠车辆剪影）+ 招牌密度对齐 Orion（TextCanvas 管线已建，B1 已落 5 栋，扩覆盖 + 楼身广告位）。生成器管线（`tools/blender/generate-*.py` + README 复现合同 + 台账）已被 BL1/BL2 审计验证为可复现资产管线，扩批边际成本递减。
- **85+**：全城实模化 + 氛围粒子成体系——资产池 12MB 红线大概率要重谈（§5.3）。

### V5 动效与转场（70 生产 / 74 潜分 →）

- **潜分收账**：TRANS-FX 粒子层（GO，建议 74）+ FXN-C3 进站 tween（E→tween→showcase 定帧→navigate，镜头编排的第一个消费实例）+ FXN-C4 探索 chip——下一个实现批审计时一并复评 V5，预期 74-76。
- **70-85 段继续爬**：①shot 应用从直切升 tween（挂载期 0.6-0.8s ease，reduced-motion 直切保留）；②预加载→入城转场成套（Orion/Igloo 对标：poster→3D 的 crossfade 已有，缺「入城」运镜一拍）；③POI 巡礼镜头链（camera-shots 注册表已有多 shot，缺编排消费——2026 趋势的 spline 叙事在本站的对位实现）。
- **85+**：全链编舞（入场-转场-微动-镜头四层节奏统一）+ 活世界微动层（G5 红线议题）。

### V6 DOM UI/HUD（73 →）

- **70-85 段缺件**：HUD 速度表装饰化（SVG 霓虹弧线，Tier C 遗留，DOM 成本）+ mini 楼宇快览常驻（A7 后半，销 A4 观察⑨ 的挂载后退化）+ text-shadow/字距强化复检（A8 已落，挂载后 HUD 面板延续同语言）。
- **85+**：diegetic 面板（HUD 进 3D 或伪 3D 透视）、品牌字体（G6，红线议题）。V6 权重仅 10%，P0 不投入，P1 一批打包。

### V7 主题原创性（75 →）

- 组合原创已被 CC-T1 竞品矩阵实证（70-85 段内）。**85+ 缺件**：「楼=产品线」的帧内自明（楼身广告牌直接展示产品视觉，随 P1 招牌扩批捎带）+ 变形仪式作为「可被转述」的记忆点持续打磨（已是最强资产）。权重 5%，永远捎带、不单开批。

## 4. 段位路径与预期水位

| 段位 | 动作包 | 预期视觉 | 预期综合 | 合法性 |
|------|--------|:---:|:---:|--------|
| 现状 | — | 71 | 92.8 | 生产登记 |
| **P0**（§5.1） | BL2-R2 + TM + V1 批 + 潜分收账 | **73–75** | 93.3–93.8 | 现行红线内；TM 需父代理解除 consult defer（§5.1 P0-2 论证） |
| **P1**（§5.2） | 实模密度专项（BL3+街道生活+招牌扩批）+ 选择性 bloom + V6 批 + 转场成套 | **~80–85** | 95.0–96.3 | rubric 尾注预留的显式裁决；资产池余量 6.5MB 内可启动 |
| **P2**（§5.3） | palette 统一层 + 活世界 + 字体 + diegetic UI + IBL/AO | **~90–98** | 97.5–99.5 | **红线重谈专项裁决**，本调研只列菜单 |

> 水位口径沿用 rubric 反通胀纪律：P1 采保守估（rubric 尾注对纯程序化打磨天花板的裁定同款），实测超预期再上修，禁止预支。综合 98 北极星在 P2 段中途（视觉 92）即达成；视觉 98 需 P2 全落 + 复评实证。

## 5. P0/P1 候选清单

### 5.1 P0（Loop 8-9 可派，现行红线内，归因互相隔离）

| 序 | Task 建议 | 主受益维 | 成本 | 前置 | 边界与风险 |
|----|----------|:---:|------|------|-----------|
| **P0-0** | CAR-E2E-01/05 超时修（在途，跨轨前置） | — | 测试 | 无 | 全量 e2e 绿是**每个**视觉批 GO 的硬门（VEH-R2 NO-GO 的唯一残留阻断同源）；不修则所有视觉批审计都会卡硬门 #2 |
| **P0-1** | **CC-BL2-R2**：concept-garage 补洞 | V4 72→74± | 资产 | 无 | 严格按复审 §9 四条（§6.1 转录）；只动 GLB/生成器，禁碰相机/楼位/poster；GLB 字节变化即重跑资产解析+fresh 三探针+全量 e2e+exact-port LHCI |
| **P0-2** | **CC-L6-TM**：tone mapping + 色彩校准 | V2 74→77±，V3 69→72± | 引擎-中 | P0-0 | consult §2 施工合同原文有效（单方案落地、exposure/emissive 台账联动重校、三档双后端同机位证据、不加 DOF/LUT/新内容）；**选型按 §2.3 更新为 AgX vs Neutral 双案对比**，不再默认 ACES。全帧变化 → VIS-01/02 基线经审阅更新，poster 失效登记但**不在本批重拍**。裁决说明：consult 决策树「≥70 先收口」的 defer 前提是无更高产品目标；北极星 98 确立后，V2/V3 残余（高光滚降+综合色彩）恰为 consult 预设的唯一推荐插槽条件，建议父代理据此解除 defer |
| **P0-3** | **CC-V1-SHOT**：首幕 definitive-shot 批 | V1 65→70± | 引擎-低+资产 | P0-2 合流后 | 三件：前景景框元素（近景桥架/管线剪影，静态、零配额）、首幕招牌 stagger 点亮（一次性动画不占循环配额，reduced-motion 直出终态）、**poster 三面同源重拍**（A10 纪律：批尾、真机 GPU、≤40KB 复核、VIS 基线随拍更新）。排在 TM 后使 poster 只拍一次 |
| **P0-4** | 潜分收账（随 P0-1~3 任一批的独立审计执行，不单开） | V5 70→74± | 零 | 任一实现批 | 审计任务书写明「按 AL-TRANS-FX GO 建议复评 V5，FXN-C3 进站 tween 与 C4 chip 一并计入」；防止 +0.6 raw 潜分永久滞留 |

**排序**：P0-0 ∥ P0-1 先行（互不触碰）→ P0-2 → P0-3（poster 收口）→ 全量复评登记。P0-1 与 P0-2 若并行，各自 exact tree 审计天然隔离，但合流顺序建议 BL2-R2 先合（V4 门独立、不受全帧变化干扰），TM 后合（它重置所有视觉取证基线）。

### 5.2 P1（75→85 段，需 BL2-R2 GO 验证实模管线后开专项）

| 序 | 候选 | 主受益维 | 说明 |
|----|------|:---:|------|
| P1-1 | BL3 实模扩批：第 3–5 栋 hero 楼 + 街角组合件 | V4 | 沿用 BL1/BL2 生成器管线（复现合同+台账+fallback 三探针已成审计模板）；每栋以 whole-frame 可读轮廓为验收（BL2 教训成文） |
| P1-2 | 街道生活层：沿街灯箱扩密 + 停靠车辆/摊位剪影 + 楼身广告位 | V4/V7 | Orion 招牌密度对标主力；TextCanvas 程序化纹理，零外部资产；「楼=产品线」广告位捎带 V7 |
| P1-3 | MRT emissive 选择性 bloom 迁移 + 发光台账重校 | V2 | §2.3 样例；独立小批（不与 TM 同 PR）；台账语义从阈值兜底升声明制 |
| P1-4 | V6 打包批：HUD 速度表 SVG 霓虹弧线 + mini 楼宇快览常驻 + 挂载后面板语言延续 | V6 | 纯 DOM；一批打包（权重 10% 不值多批） |
| P1-5 | 转场成套：shot tween 化 + 预加载→入城运镜一拍 + POI 巡礼链 | V5/V1 | camera-shots 注册表消费升级；reduced-motion 直切保留；2026 镜头编排趋势对位 |
| P1-6 | Q0 特权大气一件：屏幕空间雨丝 **或** 微量 DOF（二选一） | V2/V4 | 克制纪律：只开一件；循环配额先裁决（雨丝属循环动画，现役 3/3 满席——需扩席裁决或等 Phase 3） |

### 5.3 P2 红线重谈菜单（85→98，只列不派）

| 议题 | 冲突红线 | 巨人依据 |
|------|---------|---------|
| 全城 palette texture 统一层 | 无直接冲突（引擎-中），但值得与 P1-1 的贴图管线合并设计 | G1（Bruno 色调统一根技术） |
| 活世界系统（昼夜循环/天气层） | 循环动画配额 ≤3（Phase 3 ≤5 天花板） | G5；Orion 大气光 |
| 品牌字体（subset webfont） | 壳 ≤90KB（现 86.5，余量 3.5KB 塞不下任何字体） | G6；2026 typography 趋势 |
| diegetic UI / 3D 化 HUD | 无预算冲突，工程量大 | G6；Orion diegetic 面板 |
| IBL + 烘焙 AO 全城化 | 资产池 ≤12MB（现 5.5，扩全城需重估） | generator_city；Bruno 烘焙工艺 |
| poster/OG 电影化定帧（依赖上述全部） | poster ≤40KB | V1 90-100 锚 |

> P2 启动条件建议：P1 复评实测 ≥82 且父代理确认北极星 98 维持有效，再开「红线重谈专项」一次性裁决全部六项的预算变更——逐项零散放宽会瓦解 G-A′ 预算纪律的公信力。

## 6. 与 BL2 / poster 纪律的关系

### 6.1 BL2（PR #43）

- **现状**：PR [#43](https://github.com/rayw-lab/website/pull/43) draft、复审 NO-GO（V4=71 < 72–75 门 + 锁定 SHA 含 24 张无关历史取证 PNG 改写），**禁止合流**不变。
- **复审 §9 最小补洞转录**（P0-1 任务书直接引用）：①继续用固定 `?poi=work-gallery` 场地，正常 1440×900 整帧须直接读出「塔身/螺旋带 + 屋顶阶差」组合轮廓（不许只靠顶缘裁切冠弧）；②重拍 settled 前后帧，相机位置/FOV/viewport 逐值相同，放大裁切只作辅助；③GLB 字节变化即重跑资产解析/复现、fresh Q0/Q2/abort、全量 e2e、exact-port LHCI；④新候选 SHA 必须含 24 张 PNG 回滚（`dbc47c3` 不在锁定对象内，须重锁新 SHA）。
- **归因隔离**：P0-2/P0-3 及全部 P1 **禁止触碰** `tools/blender/generate-concept-garage.py`、`public/models/concept-garage/`、相机注册值与楼位；V4 增量只归 BL2-R2 审计计分，TM/V1 批的审计只计各自可归因维（AL-CAM「只计本批可归因收益」条款为模板）。反向同理：BL2-R2 不得捎带任何调色/相机/道具改动。
- **时序**：TM 全帧变化会重置视觉取证基线——BL2-R2 的 pre/post 成对帧在其自身 exact tree 内闭环，与 TM 并行不冲突，但合流建议 BL2-R2 在前（§5.1 排序）。

### 6.2 poster 纪律

- **现役读数**：desktop 40,580B（39.7KB gzip 口径）/ mobile 38,916B / OG 同源；红线 ≤40KB（`scripts/audit-budget.mjs` `SHELL_POSTER_CAP_KB=40` 阻断门），desktop 余量 **<0.5KB**——任何重拍都必须当场复核，必要时降 webp 质量参数而不是动红线。
- **恒等合同**：`public/posters/` blob/tree id zero-diff + `ritual_idle` 注册值逐值恒等，是 AL-CAM/AL-VEH-R2/AL-BL2 三份审计的通用硬门；P0/P1 所有非 poster 批延续此合同。
- **重拍执行细则**（沿 A10 + L3 先例 `67348d5`）：永远排**所在批次最后**；本轮 P0 的唯一重拍点在 P0-3 批尾（TM 之前拍会白拍一次）；三面（desktop/mobile/OG）同源一次出；真机 GPU 按 rubric §4 协议截帧；随拍走 VIS-01/02 `--update-snapshots` 的「经审阅的有意变更」流程，禁止批量重拍掩盖回归。
- **失效登记**：P0-2（TM）合流后到 P0-3 重拍前，poster 与 3D 实帧存在已知色差窗口——看板登记为已知项即可，不构成中途重拍理由（L3 的 ATM→poster 同款先例）。

## 7. 引用

**站内**：`cyber-city-visual-rubric.md`（v1.1 秤与 §6 Tier 表）· `cyber-city-visual-rubric-score.json`（71）· `loop6-cam-audit.md`（现役向量+相机注册值）· `loop-veh-r2-audit.md`（e2e 合同 67+ 与硬门 #2 先例）· `loop-bl2-reaudit.md`（NO-GO+最小补洞）· `loop-bl1-audit.md`（BL1 70+实模管线验证）· `loop5-audit.md`（AL5 68+Tier C 叠件禁令）· `loop-trans-fx-audit.md`（V5 诊断 74 GO）· `cyber-city-rendering-gaps-consult.md`（TM 施工合同）· `bruno-simon-teardown-*.md` / `bruno-simon-folio-source-teardown.md`（vendor 源码拆解）· `cyber-city-competitive-research.md`（CC-T1 竞品矩阵）。

**站外（本轮核实）**：Awwwards Bruno case study（https://www.awwwards.com/brunos-portfolio-case-study.html ）· folio-2025 开源仓（https://github.com/brunosimon/folio-2025 ）· Orion 作者页/making-of（https://www.adrianred.com/portfolio/cyber-city-orion ）· Abduzeedo Orion 报道（https://abduzeedo.com/cyber-city-orion-exploring-future-immersive-web-design ）· three.js WebGPU 后处理手册（https://threejs.org/manual/en/webgpu-postprocessing.html ）· `webgpu_postprocessing_bloom_emissive` 官方样例 · Jesse Zhou case study（https://jesse-zhou.medium.com/jesses-ramen-case-study-77bae77ab5f0 ）· svilenkovic 3D portfolio trends 2026（https://svilenkovic.com/3d/3d-portfolio-trends-2026 ）· SOTD 2026 趋势（https://svilenkovic.com/3d/sotd-2026-3d ）· Codrops cinematic 3D scroll（https://tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/ ）。

---

*CC-VIS-L8-RS · doc-only：本分支只提交本报告；零 `src/`、e2e、生产 score、看板、poster 与像素基线改动。PR #43 BL2 禁止合流纪律在本调研全文中维持不变。*
