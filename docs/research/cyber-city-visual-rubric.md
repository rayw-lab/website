# 赛博科技城视觉 Rubric v1.1（CC-L0-visual · 双评合议版）

| 项 | 内容 |
|----|------|
| Task | **CC-L0-visual**（提分 Loop 编排 `cyber-city-score-loop-orchestration.md` Loop 0 三 Task 之一） |
| 分支 | `cursor/cc-l0-visual-research-1d6f`（base：`cursor/cc-l0-test-framework-1d6f`） |
| 日期 | 2026-08-25 |
| 版本 | **v1.1 双评合议**：本 Task 产生了两轮独立打分——Pass A（13 项 ×0-10 帧优先量表，自评 **41.5**，评分过程见 git 历史 `2fc0702`）与 Pass B（7 维 ×0-100 锚点量表，自评 **59**）。v1.1 保留 7 维 0-100 锚点结构（任务规格「5-8 条维度、每维 0-100 锚点」），吸收 Pass A 的帧优先纪律与逐项代码核对，逐维合议定分 → **51/100**（§5） |
| 评分对象 | `/` Full Entry 世界壳（静态段）+ 3D 首幕（挂载 → 光柱显现 → robot_idle → 变形 → car_ready → 城市驾驶最初几分钟）——Phase 0 合入 tip `74947d9` 的用户可见视觉面（本分支 3D 代码零改动） |
| 消费方 | `scripts/score-loop.mjs` 维度④「视觉 rubric（竞品对标）」**权重 25%**；机读文件 `cyber-city-visual-rubric-score.json`（同目录） |
| 复核 | CC-AL0（`gpt-5.6-sol-xhigh-fast`）按 §4 规程独立重打，\|Δ总分\| ≤5 视为通过 |

---

## 0. 结论先行

- **合议自评 51/100**（七维：V1 首幕 45 / V2 光照 52 / V3 色彩 55 / V4 密度 35 / V5 动效 58 / V6 UI 55 / V7 原创 70）。工程底盘（挂载策略、出口体系、bloom/反射/变形仪式系统、双后端）是竞品级的且有帧证据；**视觉呈现是全 Loop 最弱轴**：黑天空、spike 锥桶滞留首幕、窗色五彩纸屑、零招牌文字、零街道层——整帧更近「开发沙盒」而非「赛博科技城」。
- **综合分敏感度**（其余四轴按 A4 审计数据代入 ≈99/100/100/100）：综合 ≈ 74.75 + 0.25 × 视觉分。视觉 51 → 综合 ≈ **87.5**（已过 85 线，但视觉仍是唯一低于 60 的轴）；Tier A 落地（§6）→ 视觉 ~62 → 综合 ≈ 90。**视觉轴每 +4 分 = 综合 +1 分，是当前 ROI 最高的提分轴。**
- 到视觉 85°（Awwwards HM 量级锚）的路径：Tier A（十件低成本）→ ~62；Tier B（五件引擎-中）→ ~70；Tier C（打磨批）→ ~75。**75 → 85 的最后一段 = Orion 级实模密度投入（Blender 资产管线），须作为专项裁决，勿在 Loop 内隐式承诺**（两 Pass 对 Tier C 后水位的估计差异见 §6 尾注）。

## 1. 目的与口径

**只测视觉工艺，不测性能/可达性/功能**——加载速度、a11y、e2e 通过率、交互冒烟已由综合分其余四维（LHCI ×2、e2e、smoke3d）独立承载，本 rubric 不重复计入，防双计。

**口径铁律（Pass A 确立，v1.1 起为本 rubric 法条）**：

1. **帧优先**：「功能在代码里但帧里看不见」按帧打分（先例：湿反射在首幕 22° 俯角机位几乎不入画——按可见帧计分，POI 帧可见倒影计入 V2 证据）；
2. **软渲染折扣有界**：SwiftShader 无 MSAA/色调映射偏差不作为扣分或加分理由；构图/色彩/密度/道具四类判断与渲染器无关，真机不会自愈；
3. **反通胀**：逐维必须引用当轮证据帧 + 锚点段落；与上轮分差 ≥±10（0-100 制）的维必须写差异说明。

**分值标定（全局锚，°为本 rubric 的 0-100 总分标尺）**：

- **95-100°** = Awwwards SOTD/年度级视觉面（Bruno Simon folio-2025 量级）；
- **85°（Loop 目标）** = **Awwwards Honorable Mention 量级**（评委均分 ≥6.5/10 的视觉面——Jesse's Ramen、Cyber City Orion 实际拿到 HM 的档位）；
- **60°** = 系统完备但密度/精修不足（「工程通了、美术欠账」）；
- **40°** = 模板感/占位感明显；**20°** = 未修饰灰盒。

依据：Awwwards 官方评审四维 Design 40% / Usability 30% / Creativity 20% / Content 10%（https://www.awwwards.com/about-evaluation/ ），HM 门槛 6.5/10。本 rubric 相当于把其中「Design + Creativity 的视觉面」展开为可独立复现的七个子维（权重推导见 §3 尾注），Usability/Content 归综合分其他维。

## 2. 竞品对标锚（公开可查证）

### 2.1 定标锚（打分时至少开 88° 与 82° 两站同屏比对）

| 锚分° | 站点 | 佐证（URL） | 视觉面要点（与本站差异的参照物） |
|:---:|------|------|------|
| **95** | Bruno Simon folio-2025 | https://bruno-simon.com · Awwwards 官方案例 https://www.awwwards.com/brunos-portfolio-case-study.html | 全 Blender 手工世界 + WebGPU/TSL；程式化自然、昼夜四季天气、调色板压缩、3D 化 UI；烘焙光照让全场景色调统一成「一张图」——SOTD/SOTY 级天花板（与本站引擎腿同源，色调统一是可直接对标的差距） |
| **88** | Cyber City Orion（Adrian Red） | https://orion.adrianred.com · Awwwards HM 2025-09-23 https://www.awwwards.com/sites/cyber-city-orion · FWA/CSSDA SOTD（作者页 https://www.adrianred.com/portfolio/cyber-city-orion ） | **与本站最直接可比**：Blade Runner 系霓虹 3D 城。Blender 实模楼体 + 雨湿楼面反光 + 楼身广告牌密度 + 大气光；预加载/入场转场成套；4 档画质。差异核心 = 实模细节密度与氛围层 |
| **82** | Jesse's Ramen（Jesse Zhou） | https://jessezhou.com · Awwwards HM 2022-03-22 https://www.awwwards.com/sites/jesses-ramen-portfolio · 选择性 bloom 工艺自述 https://jesse-zhou.medium.com/jesses-ramen-case-study-77bae77ab5f0 | 单场景高完成度：手工建模道具密度（每件道具讲故事）+ 选择性 bloom 节制 + 统一霓虹叙事。巧合：其 Awwwards 登记色板含 **#49c5b6**（与本站品牌青完全一致），色彩对标可直接同色比对 |
| **62** | Night City（Cyrus Mobini） | https://github.com/cyrus2281/night-city | 开源可跑的三人称霓虹城：功能齐、氛围成立，但材质/密度/构图皆平——「能玩」与「好看」的分界样本 |
| **45** | 通用赛博模板 hero | 例 https://github.com/Simone-techAIGC/cyber-portfolio | 代码雨 + 城市剪影背景 + 泛用霓虹 UI 的「AI 味模板脸」（CC-T1 竞品报告反模式 P1） |
| **20** | 未修饰灰盒 | 本站 `/world-spike/` 早期灰盒（`world-spike-log.md`） | 纯色地面 + 无光效体块——工程验证态 |

### 2.2 施工参照（不定标，逐维/逐动作对照用）

| 参考 | URL | 可借鉴点 |
|------|-----|---------|
| Bruno Simon 2019 | https://bruno-simon.com/2019 | 车落地弹跳开场 + 全场玩具质感统一——道具风格一致性（本站锥桶 vs 城市的冲突反例） |
| Utopia Tokyo（Awwwards SOTD 2026-03） | https://www.awwwards.com/sites/utopia-tokyo | 文化符号 × 未来城的原创审美（非模板赛博脸）；首屏节奏 |
| three.js 官方 webgpu_generator_city（r185） | https://threejs.org/examples/?q=generator#webgpu_generator_city | **与本站同栈（TSL/WebGPU）**：物理天空驱动背景 + IBL、假室内映射窗格、整楼单 draw call——天空与窗格质感的直接施工参考 |
| Neon Loft（three.js forum showcase） | https://discourse.threejs.org/t/i-built-neon-loft-a-walkable-cyberpunk-room-with-a-living-holographic-city-outside/93363 | 「城市活着」清单：全息广告塔、闪烁 LED 牌、楼面投影、高架列车——环境生命感逐件对照表 |
| Igloo Inc（Awwwards 2024 年度站点） | https://www.awwwards.com/sites/igloo-inc | 入场动画无缝流入正文；加载期观感策略 |
| Lusion v3 | https://lusion.co | 首屏 0 秒即有反应式渲染——「进场即活」而非「进场再等」 |
| Virtual Car Showroom（Awwwards HM 2025-03） | https://www.awwwards.com/sites/virtual-car-showroom | 电影化换车转场——变形仪式的运镜对标（转场期间相机不是静止的） |
| PorscheLab / drive-my-portfolio | https://github.com/ASTRICKK/PorscheLab · https://github.com/poojagosika/drive-my-portfolio | 移动端降档承诺；「先运镜展示 3 秒再交方向盘」的首屏节奏 |

## 3. 七维度与 0-100 锚点

各维 0-100 独立打分（建议 5 的倍数，允许段内插值），**总分 = Σ(维分 × 权重)，四舍五入取整**。

### V1 首幕构图与第一印象（权重 20%）

poster 与首个 3D 稳定帧（robot_idle）的画面语言：焦点层次、剪影可读性、纵深层次（前景/主体/中景/天际线/雾）、画面噪音。

| 分段 | 锚点 |
|:---:|------|
| 90-100 | 电影级定帧：主体-环境-光的三角构图完整，任一帧可当海报（Bruno 出生点、Orion 开场天际线） |
| 70-85 | 焦点明确 + ≥3 层纵深 + 剪影一眼可读；构图讲究但缺「definitive shot」打磨 |
| 50-65 | 有意识的构图（主体居中/峡谷缺口对景）且要素齐，但层次扁平或 poster 精修不足 |
| 30-45 | 主体可辨但画面平铺：背景死黑/无层次经营，或帧内存在出戏噪音元素 |
| 0-25 | 无构图意识：体块散置、焦点缺席 |

### V2 光照·材质·后处理（权重 20%）

bloom 纪律、发光材质工艺、反射/阴影、雾与大气、PBR 质感——**按帧内可见性打分**（口径铁律 1）。

| 分段 | 锚点 |
|:---:|------|
| 90-100 | 光即叙事：分层大气/体积光、选择性辉光有克制、材质经手工调校 + IBL（Bruno TSL 全家桶、Orion 雨湿街景） |
| 70-85 | bloom 有阈值纪律 + 反射/阴影在主要机位可见 + 雾有层次；个别材质仍见程序感（Jesse 选择性 bloom 档） |
| 50-65 | 后处理链与发光系统工程完备且至少部分帧可见（阈值/档位/反射有帧证据），但大气单层、天空无经营、材质缺手工精修 |
| 30-45 | 只有 emissive 平涂或全屏泛光，无雾/反射的帧内证据 |
| 0-25 | 无光效经营（unlit 灰盒） |

### V3 色彩体系与氛围一致性（权重 15%）

palette 纪律（深蓝底 + 青/品红 + 工业橙，设计提案 §2/§5.2 tokens）、同帧色相纪律、DOM 壳与 3D 同色系、整体「同一世界」感。

| 分段 | 锚点 |
|:---:|------|
| 90-100 | 全站色板单源且有明暗节奏经营，同帧色相锁 2-3 色族，DOM/3D/poster 三面无缝（Bruno 调色板压缩工艺） |
| 70-85 | palette 单源落地 + 逐对象色彩语义一致 + 同帧色相基本受控，DOM↔3D 同色系；缺明暗节奏/重点色运营 |
| 50-65 | 主色调统一、DOM↔3D 同源，但同帧存在色彩噪音（无语义杂色同框互撞、面积失衡） |
| 30-45 | 色彩东拼西凑，DOM 与 3D 两张皮 |
| 0-25 | 无色彩设计 |

### V4 场景密度与世界可信度（权重 15%）

楼体细节层级、招牌/文字、街道道具（灯柱/广告牌/车辆/杂物）、环境生命感（光轨/雨丝/车流）、天际线层次。**Orion/Bruno 与模板站拉开差距的主战场。**

| 分段 | 锚点 |
|:---:|------|
| 90-100 | 实模级密度：每个视角都有近/中/远三层可读细节，招牌文字、道具、氛围粒子成体系（Orion 街景、Bruno 手工世界） |
| 70-85 | 关键视角密度达标（主干道/出生点/POI 圈），道具与招牌成层但覆盖不全 |
| 50-65 | 楼体有体量变化 + 檐口/信标等构件 + 至少一层街道级细节（招牌文字或道具），环境有微动 |
| 30-45 | 体块城市：楼是盒子的变体、地面只有路标线、3D 内无可读文字、道具缺席或出戏 |
| 0-25 | 空场景 |

### V5 动效与转场工艺（权重 15%）

首幕剧本（光柱显现/变形仪式）、idle 微动、缓动质量、镜头经营、UI 过渡；`prefers-reduced-motion` 的优雅降级。

| 分段 | 锚点 |
|:---:|------|
| 90-100 | 全链编舞：入场-转场-微动-镜头四层皆有设计且节奏统一（Bruno 入场、Orion 预加载→入城转场成套） |
| 70-85 | 关键节拍（入场/变形）完成度高 + 微动层齐 + 转场保画面对比度，缺镜头运动/次级动效打磨 |
| 50-65 | 有成套仪式动画与缓动设计（非线性、有预备与跟随），但镜头静态、节拍单一，或转场存在洗帧问题 |
| 30-45 | 只有状态切换硬切/线性 tween |
| 0-25 | 无动效 |

### V6 DOM UI/HUD 视觉整合（权重 10%）

壳层排版/字体/组件工艺，HUD 与 3D 的视觉融合（同族光效、同色系、层级不打架）、挂载前后 UI 语言连续性、移动端壳观感。

| 分段 | 锚点 |
|:---:|------|
| 90-100 | UI 即世界的一部分（Bruno 的 3D 化 UI / Orion 的 diegetic 面板），字体有品牌级选型 |
| 70-85 | HUD 与 3D 同族视觉语言 + 排版精修（发光描边体系贯穿挂载前后、字距/层级讲究） |
| 50-65 | 静态壳干净统一、暗色霓虹协调，但挂载后 HUD 退化为素面件、系统字体栈零个性化处理 |
| 30-45 | UI 与 3D 两套审美，或可读性受霓虹干扰 |
| 0-25 | 未设计的默认样式 |

### V7 主题原创性与叙事贴合（权重 5%）

「座舱科技城」隐喻的视觉兑现度：是原创世界观还是通用赛博模板（CC-T1 反模式 P1）；楼=产品线的可感知度；帧内道具是否服务叙事。

| 分段 | 锚点 |
|:---:|------|
| 90-100 | 世界观强到可被转述（「拉面店=作品集」级的叙事一体） |
| 70-85 | 组合原创（无直接克隆先例）且核心隐喻有帧内视觉载体（机器人↔车变形），但「楼=产品线」仍靠文案自明 |
| 50-65 | 主题成立但视觉上与通用赛博城难区分 |
| 30-45 | 模板赛博脸，或帧内道具叙事互斥（出戏道具占焦点） |
| 0-25 | 无主题 |

> **权重推导**：对齐 Awwwards Design(40)+Creativity(20) 的视觉面拆分——画面工艺核心 V1+V2 = 40%；世界观经营 V3+V4 = 30%；动效创意 V5 = 15%；UI 工艺 V6 = 10%；原创性 V7 = 5%。改权重须同步本表与 score JSON 的 `dimensions[*].weight`。

## 4. 打分规程（复现协议）

1. **取证 A（框架路径，推荐）**：`pnpm test:visual`（visual-chromium 单 worker）产出 E1 `world-shell-static.png`（VIS-01 壳基线）、E2 `world-esc-menu.png`（VIS-02）、E3 `test-results/visual/world-robot-idle.png`（VIS-03 首幕）、E4 `test-results/visual/world-poi-concept-garage.png`（VIS-04 POI）。VIS-01/02 的 `toHaveScreenshot` 基线已入库 `e2e/visual/__screenshots__/`，全新 VM 直接比对；只有经审阅确认的有意视觉变更才可用 `--update-snapshots` 更新，E3/E4 继续作为非像素基线的当轮取证图。
2. **取证 B（手动路径，Pass A 协议，覆盖变形段与移动端）**：`pnpm build && pnpm preview` → headless Chromium 访问 `/website/`——①静态壳 1440×900（domcontentloaded+0.8s）②等 `data-state="ready"` 截首幕 ③Space 触发变形、车落地后截帧 ④375×812 移动壳。软渲染下 RAF 独占主线程会使 screenshot 超时：先派发 `visibilitychange(hidden)` 暂停渲染循环再截（引导脚本生命周期契约）。参考帧存 `assets/visual-rubric/`（shell-static-1440 / world-ready-1440 / world-car-1440 / shell-mobile-375，Pass A 实拍）。
3. **代码核对**（防「截图偶然」误判；帧疑点必须落到代码定位）：已核对事实见下表，新疑点照此格式补行。

| 观察 | 代码定位 | 结论 |
|------|---------|------|
| 天空纯黑 | `world/World.ts` `scene.background = '#0d0c11'`（纯色）；`city/index.ts` 雾 `Fog('#0d0c11',160,900)` 同色 | 无渐变穹顶/地平线辉光，设计缺席而非截图问题 |
| 橙色锥桶 ×16 滞留首幕 | `world/World.ts` `setCones()`——spike 试车道三组阵位原样继承 | 灰盒物理证明道具留在城市首幕英雄机位正中 |
| 窗色五彩纸屑 | `rendering/NeonMaterials.ts` 窗色 = 各楼 `neonColor` + 暖白；12 楼 JSON 色值含绿/红/蓝/紫/橙全谱 | 多楼同框 → 绿+红+紫+白同屏，无全城色彩纪律层 |
| 楼顶无字 | `city/ThemeTowers.ts` 注释「全息招牌文字归 CC-E4/E9，此处为霓虹占位带」 | 招牌 = 发光箍带占位；3D 内楼不可辨，分楼靠 DOM |
| 湿反射在跑 | `world/Grid.ts` Q0 实时 reflector + 水洼掩码；bloom `Rendering.ts` `bloom(0.55, 0, 1)` threshold 纪律 | 功能在位；首幕 22° 俯角几乎不入画（帧优先扣 V2），POI 帧倒影清晰可见（E4 实证计入） |
| 相机构图 | `view/View.ts` 城市档 FOV 42°/斜距 18m/俯角 22°，正对机器人居中 | 对称居中 + 黑背景 → 无景深层次、无 1/3 构图张力；全程静止 |

4. **打分**：逐维引用 ≥1 条证据帧 + ≥1 个锚点段落定分；总分 = Σ(维分×权重) 取整。SwiftShader 折扣按口径铁律 2 界定。
5. **审计**：复核者按同证据集独立打分；\|Δ总分\| ≤5 通过，超出则逐维复议（以锚点文本为仲裁依据）；rubric 口径改动必须在本文件 PR 中留痕，不许口头改秤。
6. **登记**：分数写 `cyber-city-visual-rubric-score.json`（`score` 字段为 `score-loop.mjs` 唯一机读位），`node scripts/score-loop.mjs` 验证维度④已从「缺失」转实分。

## 5. Phase 0 双评合议明细（→ score JSON）

两轮独立打分同对象（`74947d9`）：**Pass A** = 帧优先 13 项量表（41.5，证据帧 `assets/visual-rubric/` 4 帧 + 代码核对表）；**Pass B** = 本 7 维锚点量表初评（59，证据 `pnpm test:visual` 4/4 全过实跑帧）。合议规则：以 7 维锚点结构为准，**帧优先铁律仲裁两 Pass 分歧**（Pass B 对「系统在但帧内欠可见」的项按铁律 1 下修）。

| 维 | Pass B 初评 | Pass A 对应项（0-10） | 合议 | 合议依据（帧证据 → 锚点） |
|----|:---:|------|:---:|------|
| V1 首幕构图 | 55 | 构图 4 | **45** | E3/world-ready 帧：机器人居中满幅 + 峡谷对景 + 斑马线导视线成立；但黑天空吃掉远层、锥桶阵抢占近层、poster=软渲染实拍——「主体可辨但背景死黑 + 帧内出戏噪音」落 30-45 段顶 |
| V2 光照材质 | 58 | 天空 2 · 湿反射 4 | **52** | bloom threshold=1 纪律（代码）+ POI 帧倒影清晰（E4 实证）→ 满足 50-65 段「系统完备且部分帧可见」；扣：首幕机位反射不入画（帧优先）、天空零经营、窗格大色块平涂、无 IBL/AO |
| V3 色彩氛围 | 72 | 色彩纪律 3 | **55** | 单源纪律强：buildings JSON 霓虹色贯穿 3D/DOM 快览/POI 光圈，深蓝底 + 品牌青 #49c5b6 三面一致（E1+E4）；但 E3 帧绿+红+紫+白窗色同框互撞（12 楼 neonColor 直出窗格，无全城色相纪律层）——「主色调统一但同帧色彩噪音」= 50-65 段 |
| V4 场景密度 | 40 | 楼宇辨识 3 · 生命感 3 · 道具 3 | **35** | E3/E4：楼=收分体量+檐口/信标，零招牌文字（`ThemeTowers` 注释自认占位）、零街道道具（唯一「道具」= spike 锥桶，叙事读作「驾校」）、零氛围粒子（设计提案 §3.2 光轨未实装）——30-45 段「体块城市 + 出戏道具」 |
| V5 动效转场 | 65 | 变形 5 · 首屏节奏 6 | **58** | 变形四拍机械完整（充能环→光幕→热交换→easeOutBack 落地，A4 冒烟实证）+ 光柱显现 + idle 微动 + reduced-motion 直出（CITY-E2E-04 绿）；扣：相机全程静止、光幕余辉+雾把 car 帧洗成灰绿低对比（world-car 帧实拍）——50-65 段「成套仪式但镜头静态 + 洗帧」 |
| V6 UI/HUD 整合 | 60 | HUD 5 · 排版 5 · 移动壳 6 | **55** | E1/E2：静态壳 cover 语言完整（描边丸/色点/ESC dialog 同色系）；扣：挂载后仅剩素面顶栏+提示丸+恒 0 速度表（观察 F），楼宇快览随 cover 消失（观察⑨），系统字体栈零个性化，移动 poster 无构图——50-65 段「壳统一、挂载后退化」 |
| V7 主题原创 | 78 | 道具叙事 3 | **70** | CC-T1 竞品矩阵证「机甲站岗 + 一键变车 + 楼=产品线」无直接克隆；变形仪式 = 帧内可见的核心隐喻载体 → 70-85 段下沿；扣：无招牌/道具支撑时城市面仍近似通用霓虹城 + 锥桶叙事出戏 |

**合议总分 = 45×0.20 + 52×0.20 + 55×0.15 + 35×0.15 + 58×0.15 + 55×0.10 + 70×0.05 = 50.6 → 51/100**

> 差异说明（反通胀条款）：Pass B 初评 59 → 合议 51 的下修全部来自帧优先铁律（V1 -10：锥桶/黑天空按帧计噪音；V3 -17：同帧色相互撞实拍证据；V2 -6：首幕机位反射不可见）。Pass A 41.5 → 合议 51 的上修来自：POI 帧反射/变形仪式全链/reduced-motion 降级在 Pass A 的 13 项结构中无独立位而被摊薄，7 维结构下按锚点归位（V5 58、V2 52）。

## 6. 到 85° 的提分清单（双 Pass 合并，按 ROI 排序）

成本类别：**DOM** = 纯 CSS/DOM（零引擎）；**引擎-低** = 调参/小件（<100 行，零新资产）；**引擎-中** = 新子系统（100-300 行或新 canvas 纹理）；**资产** = 重截/新增资产。预算纪律：全部动作不得破 G-A′ 红线（壳 ≤90KB / poster ≤40KB / world JS ≤900KB / 循环动画配额）。

### Tier A：51 → ~62（十件低成本）

| 序 | 动作 | 主受益维 | 成本 | 施工要点 |
|----|------|:---:|------|---------|
| A1 | 天空穹顶渐变 + 地平线辉光（TSL 垂直渐变：深蓝→地平线青/品红光污染带），雾色随之调暖 | V2/V1 | 引擎-低 | 参照 webgpu_generator_city SkyMesh 思路极简版；零贴图；~60 行 |
| A2 | 撤 16 只试车锥桶，换 6-8 件城市道具（霓虹护栏柱/信息亭/发光隔离墩，原语 + `createNeonGlowMaterial` 复用） | V1/V7 | 引擎-低 | 保留 2-3 件动态体维持「物理在跑」可见证据；`/world-spike/` 锥桶 e2e 用例被测面不动，`/` 路径撤场需核对 CITY 用例零依赖 |
| A3 | 全城窗色纪律层：窗格收敛青/品红/暖白三族（楼 `neonColor` 只进招牌/信标不再直出窗格） | V3 | 引擎-低 | `NeonMaterials.ts` 单文件调色；buildings JSON 不动 |
| A4 | 相机构图：机位 theta 偏 15-20°（1/3 构图）+ 慢 yaw 微动（reduced-motion 关） | V1 | 引擎-低 | `View.ts` 城市档参数 3 处 |
| A5 | 机器人 rim light + 接地常亮青环（fresnel emissive 或背光） | V1/V2 | 引擎-低 | 光环复用出生圈 shader；常亮不占循环动画配额 |
| A6 | 变形光幕调色：白爆改青→品红渐变 tint，峰值不透明度降 ~30% 保帧内对比 | V5 | 引擎-低 | `TransformSystem.ts` 常量级 |
| A7 | HUD 霓虹面板化 + 挂载后保留 mini 楼宇快览（右下 5 栋 hero 楼常驻列表） | V6 | DOM | 1px 霓虹描边 + 8% 填色语言（设计提案 §5.2）；同时销 A4 观察⑨ |
| A8 | H1/标签排版强化：text-shadow 辉光 + 字距（零字体文件，G-A′ 红线内） | V6 | DOM | webfont 因 90KB 合计红线否决，纯 CSS |
| A9 | 湿反射可见性调参：水洼占比/强度上调 + 广场棋盘格弱化 | V2 | 引擎-低 | `Grid.ts` uniform 级 |
| A10 | poster 重拍（A1-A6 落地后真机 GPU 按 §4 协议重截，≤40KB 复核）——静态壳/移动端/OG 三处同吃 | V1/V6 | 资产 | **永远排所在批次最后** |

### Tier B：~62 → ~70（五件引擎-中）

| 序 | 动作 | 主受益维 | 成本 | 施工要点 |
|----|------|:---:|------|---------|
| B1 | 楼顶全息招牌文字：TextCanvas（E9 已建管线）出楼名纹理 → 双面全息板替换占位箍带，5 栋 hero 先行 | V4 | 引擎-中 | Orion 招牌密度是 HM 关键；3D 内认楼不再靠 DOM |
| B2 | 街道层霓虹：路灯杆 + 沿街广告灯箱 6-10 件（InstancedMesh 1-2 draw call）——湿地面因此有可反射光源 | V4/V2 | 引擎-中 | 灯箱纹理走 TextCanvas 程序化，零外部资产 |
| B3 | 飞行光轨粒子层（设计提案 §3.2 原案 ≤800 点）：中远景 2-3 条航线 additive 拖尾 | V4 | 引擎-中 | Quality 2 关；CITY-03 动画配额口径先裁决（A4 观察 B）——已裁决并登记：`cyber-city-eng-wave1-notes.md`「CC-L3-B3」配额小节（计席与驱动源无关；≤2 → ≤3 扩 1 席，Phase 3 ≤5 天花板不变） |
| B4 | 剪影层密度/高度方差上调 + 最远排贴地平线辉光（与 A1 联动「城市在发光」） | V1/V4 | 引擎-低 | JSON slots 填充数 + 种子参数 |
| B5 | 变形运镜：充能 0.35s 推镜 5% + 落地帧 0.15s 相机微震（reduced-motion 直出不动镜） | V5 | 引擎-中 | Virtual Car Showroom 转场对标 |

### Tier C：~70 → ~75（打磨批，复评后按需裁剪）

假室内映射窗格（generator_city 同技法，~10% 近景窗）· 屏幕空间雨丝/尘粒（Q0 only）· 机器人材质分区 + 关节 emissive · 移动端竖版 poster + CSS 视差 · 首幕招牌 stagger 点亮（150ms 逐楼）· HUD 速度表装饰化（SVG 霓虹弧线，配合接线销观察 F）· 变形后全城色温「巡航态」微移 · 前景景框元素（近景桥架/管线剪影）· 天空低层云带/月轮。

> **75 → 85 尾段裁决**：Pass A 估 Tier A+B+C 可达 85.7，Pass B 按锚点标定估 ~75——分歧根源是「程序化打磨的上限」：85° 锚（Orion）靠 Blender 实模密度，纯程序化打磨在 V4 密度维有天花板。合议采保守口径（~75），85° 缺口留给「实模资产管线专项」的显式裁决；若 Tier A/B 复评实测超预期再上修，禁止预支。
>
> **排期纪律**：poster 重拍永远排所在批次最后；每批合并前按 §4 复评，不达预期先修不追加。

## 7. score JSON 契约

`cyber-city-visual-rubric-score.json`：`score`（0-100 整数，score-loop 唯一机读位）、`dimensions`（七维 `{label, weight, score, evidence}`，权重与 §3 同步）、`notes`（一段话结论）+ 溯源字段（`subject`/`scoredAt`/`scoredBy`/`rubric`）。重打分只改分值与证据，不改 schema；改维度/权重须升 rubric 版本号并同步 §3。

---

*CC-L0-visual v1.1 双评合议 · 2026-08-25 — 调研只读 + 文档/JSON 交付，3D 代码零改动；Pass A 证据帧入库 `assets/visual-rubric/`（4 帧 ~167KB），Pass B 证据实跑记录见 `cyber-city-eng-wave1-notes.md`「CC-L0-visual」小节；两 Pass 原文见本分支 git 历史（`2fc0702` / `0fe8a4b`）。*
