# 赛博科技城视觉 Rubric v1.0（CC-L0-visual）

| 项 | 内容 |
|----|------|
| Task | **CC-L0-visual**（提分 Loop 编排 `cyber-city-score-loop-orchestration.md` Loop 0 三 Task 之一） |
| 分支 | `cursor/cc-l0-visual-research-1d6f`（base：`cursor/cc-l0-test-framework-1d6f`） |
| 日期 | 2026-08-25 |
| 评分对象 | `/` Full Entry 世界壳（静态段）+ 3D 首幕（挂载 → 光柱显现 → robot_idle → 变形 → car_ready → 城市驾驶最初几分钟）——即 Phase 0 合入 tip `74947d9` 的用户可见视觉面（本分支 3D 代码零改动，自评对象同一） |
| 消费方 | `scripts/score-loop.mjs` 维度④「视觉 rubric（竞品对标）」**权重 25%**；机读文件 `cyber-city-visual-rubric-score.json`（同目录） |
| 复核 | CC-AL0（`gpt-5.6-sol-xhigh-fast`）按 §4 规程独立重打，|Δ总分| ≤5 视为通过 |

---

## 1. 目的与口径

**只测视觉工艺，不测性能/可达性/功能**——加载速度、a11y、e2e 通过率、交互冒烟已由综合分其余四维（LHCI ×2、e2e、smoke3d）独立承载，本 rubric 不重复计入，防双计。

**分值标定（全局锚，°为本 rubric 的 0-100 总分标尺）**：

- **95-100°** = Awwwards SOTD/年度级视觉面（Bruno Simon folio-2025 量级）；
- **85°（Loop 目标）** = **Awwwards Honorable Mention 量级**（评委均分 ≥6.5/10 的视觉面——Jesse's Ramen、Cyber City Orion 实际拿到 HM 的档位）；
- **60°** = 系统完备但密度/精修不足（「工程通了、美术欠账」）；
- **40°** = 模板感/占位感明显；**20°** = 未修饰灰盒。

依据：Awwwards 官方评审四维 Design 40% / Usability 30% / Creativity 20% / Content 10%（https://www.awwwards.com/about-evaluation/ ），HM 门槛 6.5/10。本 rubric 相当于把其中「Design + Creativity 的视觉面」展开为可独立复现的七个子维（权重推导见 §3 尾注），Usability/Content 归综合分其他维。

## 2. 竞品对标锚（公开可查证）

| 锚分° | 站点 | 佐证（URL） | 视觉面要点（与本站差异的参照物） |
|:---:|------|------|------|
| **95** | Bruno Simon folio-2025 | https://bruno-simon.com ·Awwwards 官方案例 https://www.awwwards.com/brunos-portfolio-case-study.html | 全 Blender 手工世界 + WebGPU/TSL；程式化自然、昼夜四季天气、调色板压缩、3D 化 UI；一年工期的密度与统一艺术指导——SOTD/SOTY 级天花板 |
| **88** | Cyber City Orion（Adrian Red） | https://orion.adrianred.com ·Awwwards HM 2025-09-23 https://www.awwwards.com/sites/cyber-city-orion ·FWA/CSSDA SOTD（作者页 https://www.adrianred.com/portfolio/cyber-city-orion ） | **与本站最直接可比**：Blade Runner 系霓虹 3D 城。Blender 实模楼体 + 雨渍反光 + 大气光 + 招牌文字密布；预加载/入场转场成套；4 档画质。差异核心 = 实模细节密度与氛围层 |
| **82** | Jesse's Ramen（Jesse Zhou） | https://jessezhou.com ·Awwwards HM 2022-03-22 https://www.awwwards.com/sites/jesses-ramen-portfolio ·选择性 bloom 工艺自述 https://jesse-zhou.medium.com/jesses-ramen-case-study-77bae77ab5f0 | 单场景高完成度：手工建模道具密度 + 选择性 bloom 节制 + 统一霓虹叙事。巧合：其 Awwwards 登记色板含 **#49c5b6**（与本站品牌青完全一致），色彩对标可直接同色比对 |
| **62** | Night City（Cyrus Mobini） | https://github.com/cyrus2281/night-city | 开源可跑的三人称霓虹城：功能齐、氛围成立，但材质/密度/构图皆平——「能玩」与「好看」的分界样本 |
| **45** | 通用赛博模板 hero | 例 https://github.com/Simone-techAIGC/cyber-portfolio | 代码雨 + 城市剪影背景 + 泛用霓虹 UI 的「AI 味模板脸」（CC-T1 竞品报告反模式 P1） |
| **20** | 未修饰灰盒 | 本站 `/world-spike/` 早期灰盒（`world-spike-log.md`） | 纯色地面 + 无光效体块——工程验证态 |

> 对标方法：竞品皆有公开站点/录屏可实时查证；打分时至少打开 88° 与 82° 两个锚位站点（或其 Awwwards 页截图集）做同屏比对。

## 3. 七维度与 0-100 锚点

各维 0-100 独立打分（建议 5 的倍数），**总分 = Σ(维分 × 权重)，四舍五入取整**。

### V1 首幕构图与第一印象（权重 20%）

poster 与首个 3D 稳定帧（robot_idle）的画面语言：焦点层次、剪影可读性、纵深层次（前景/主体/中景/天际线/雾）。

| 分段 | 锚点 |
|:---:|------|
| 90-100 | 电影级定帧：主体-环境-光的三角构图完整，任一帧可当海报（Bruno 出生点、Orion 开场天际线） |
| 70-85 | 焦点明确 + ≥3 层纵深 + 剪影一眼可读；构图讲究但缺「definitive shot」打磨 |
| 50-65 | 有意识的构图（主体居中/峡谷缺口对景）且要素齐，但层次扁平或 poster 精修不足 |
| 30-45 | 主体可辨但画面平铺、无景深层次经营 |
| 0-25 | 无构图意识：体块散置、焦点缺席 |

### V2 光照·材质·后处理（权重 20%）

bloom 纪律、发光材质工艺、反射/阴影、雾与大气、PBR 质感。

| 分段 | 锚点 |
|:---:|------|
| 90-100 | 光即叙事：分层大气/体积光、选择性辉光有克制、材质经手工调校 + IBL（Bruno TSL 全家桶、Orion 雨渍街景） |
| 70-85 | bloom 有阈值纪律 + 反射/阴影成立 + 雾有层次；个别材质仍见程序感（Jesse 选择性 bloom 档） |
| 50-65 | 后处理链与发光系统工程完备（阈值/档位/反射如实存在），但大气单层、材质缺手工精修痕迹 |
| 30-45 | 只有 emissive 平涂或全屏泛光，无雾/反射层次 |
| 0-25 | 无光效经营（unlit 灰盒） |

### V3 色彩体系与氛围一致性（权重 15%）

palette 纪律（深蓝底 + 青/品红 + 工业橙，设计提案 §2/§5.2 tokens）、逐楼霓虹色语义、DOM 壳与 3D 同色系、整体“同一世界”感。

| 分段 | 锚点 |
|:---:|------|
| 90-100 | 全站色板单源且有明暗节奏经营，DOM/3D/poster 三面无缝（Bruno 调色板压缩工艺） |
| 70-85 | palette 单源落地 + 逐对象色彩语义一致，DOM↔3D 同色系；缺明暗节奏/重点色运营 |
| 50-65 | 主色调统一但存在色彩噪音（无语义的杂色、面积失衡） |
| 30-45 | 色彩东拼西凑，DOM 与 3D 两张皮 |
| 0-25 | 无色彩设计 |

### V4 场景密度与世界可信度（权重 15%）

楼体细节层级、招牌/文字、街道道具（灯柱/广告牌/车辆/杂物）、天际线层次、生活感。**Orion/Bruno 与模板站拉开差距的主战场。**

| 分段 | 锚点 |
|:---:|------|
| 90-100 | 实模级密度：每个视角都有近/中/远三层可读细节，招牌文字、道具、氛围粒子成体系（Orion 街景、Bruno 手工世界） |
| 70-85 | 关键视角密度达标（主干道/出生点/POI 圈），道具与招牌成层但覆盖不全 |
| 50-65 | 楼体有体量变化 + 檐口/信标等构件，但街道空、无文字招牌、道具稀缺 |
| 30-45 | 体块城市：楼是盒子的变体、地面只有路标线 |
| 0-25 | 空场景 |

### V5 动效与转场工艺（权重 15%）

首幕剧本（光柱显现/变形仪式）、idle 微动、缓动质量、镜头经营、UI 过渡；`prefers-reduced-motion` 的优雅降级。

| 分段 | 锚点 |
|:---:|------|
| 90-100 | 全链编舞：入场-转场-微动-镜头四层皆有设计且节奏统一（Bruno 入场、Orion 预加载→入城转场成套） |
| 70-85 | 关键节拍（入场/变形）完成度高 + 微动层齐，缺镜头运动/次级动效打磨 |
| 50-65 | 有成套仪式动画与缓动设计（非线性、有预备与跟随），但镜头静态、节拍单一 |
| 30-45 | 只有状态切换硬切/线性 tween |
| 0-25 | 无动效 |

### V6 DOM UI/HUD 视觉整合（权重 10%）

壳层排版/字体/组件工艺，HUD 与 3D 的视觉融合（同族光效、同色系、层级不打架）。

| 分段 | 锚点 |
|:---:|------|
| 90-100 | UI 即世界的一部分（Bruno 的 3D 化 UI / Orion 的 diegetic 面板），字体有品牌级选型 |
| 70-85 | HUD 与 3D 同族视觉语言 + 排版精修（展示字体、字距/层级讲究） |
| 50-65 | UI 干净统一、暗色霓虹协调，但系统字体栈/组件为通用样式、缺专属工艺 |
| 30-45 | UI 与 3D 两套审美，或可读性受霓虹干扰 |
| 0-25 | 未设计的默认样式 |

### V7 主题原创性与叙事贴合（权重 5%）

「座舱科技城」隐喻的视觉兑现度：是原创世界观还是通用赛博模板（CC-T1 反模式 P1）；楼=产品线的可感知度。

| 分段 | 锚点 |
|:---:|------|
| 90-100 | 世界观强到可被转述（「拉面店=作品集」级的叙事一体） |
| 70-85 | 组合原创（无直接克隆先例）且核心隐喻已有视觉载体，但隐喻靠文案而非画面自明 |
| 50-65 | 主题成立但视觉上与通用赛博城难区分 |
| 30-45 | 模板赛博脸 |
| 0-25 | 无主题 |

> **权重推导**：对齐 Awwwards Design(40)+Creativity(20) 的视觉面拆分——画面工艺核心 V1+V2 = 40%；世界观经营 V3+V4 = 30%；动效创意 V5 = 15%；UI 工艺 V6 = 10%；原创性 V7 = 5%。改权重须同步本表与 score JSON 的 `dimensions[*].weight`。

## 4. 打分规程（复现协议）

1. **取证**（固定证据集，SwiftShader 亦可执行）：
   - `pnpm test:visual`（visual-chromium 单 worker）产出 E1 `world-shell-static.png`（VIS-01 壳基线）、E2 `world-esc-menu.png`（VIS-02）、E3 `test-results/visual/world-robot-idle.png`（VIS-03 首幕）、E4 `test-results/visual/world-poi-concept-garage.png`（VIS-04 POI）。注：VIS-01/02 的 `toHaveScreenshot` 基线暂未入库（归 CC-L0-setup/baseline 裁决）——全新 VM 首跑加 `--update-snapshots` 生成本地基线即可，E3/E4 取证图不受影响；
   - E5 变形段：`/`（默认 ritual）点击 CTA 观察 transforming → car_ready 全序列（或读 `TransformSystem.ts` 时间轴注释 + A4 审计 §5 冒烟实录）；
   - E6 竞品对照：打开 §2 锚位站点或其 Awwwards 页截图集。
2. **环境注记**：本 VM 为 SwiftShader 软渲染——构图/密度/色彩判断稳定可用；光照判断须交叉核对代码参数（`Rendering.ts` bloom(0.55, 0, 1)、`city/index.ts` `Fog('#0d0c11',160,900)`、`Grid.ts` Q0 实时 reflector）与 A4 审计真跑冒烟记录，不因软渲染压暗而扣光照分。
3. **打分**：逐维引用 ≥1 条证据 + ≥1 个锚点段落定分（建议 5 的倍数，允许段内插值）；总分 = Σ(维分×权重) 取整。
4. **审计**：复核者按同证据集独立打分；|Δ总分| ≤5 通过，超出则逐维复议（以锚点文本为仲裁依据）。
5. **登记**：分数写 `cyber-city-visual-rubric-score.json`（`score` 字段为 `score-loop.mjs` 唯一机读位），`node scripts/score-loop.mjs` 验证维度④已从「缺失」转实分。

## 5. Phase 0 自评明细（→ score JSON）

评分对象：`74947d9` 的 `/` 壳 + 3D 首幕。证据：E1-E4（本分支 `pnpm test:visual` 实跑，VIS-01~04 全过）、E5（A4 审计 §5 场景①实录 + `TransformSystem.ts` 时间轴）、代码参数核对。

| 维 | 分 | 定分依据（证据 → 锚点） | 主要失分点 |
|----|:--:|------|------|
| V1 首幕构图 | **55** | E3：机器人居中 + 峡谷对景（D4 构图）+ 斑马线导视线 + 足下青环焦点 → 落 50-65 段「有意识构图但层次扁平」 | E3 实拍三扣：①spike 遗留锥桶阵滞留首幕（16 只橙锥 = 工程测试道具当画面噪音）；②天空纯黑（无天幕渐变/星点，上半屏死黑）；③poster 为 SwiftShader 软渲染帧（发闷、缺高光层次）。无「海报级」定帧打磨 |
| V2 光照材质 | **58** | 代码 + E4 实证：bloom threshold=1 只烧 emissive>1（纪律成立）、~7% 亮屏窗、**Q0 湿地实时反射在 E4 帧可见成立**（楼窗倒影 + POI 环倒影）、三档降载 → 50-65 段上沿「工程完备、精修不足」 | 幕墙窗格尺度过大（E3/E4 中窗=数米级大色块，读作像素块而非城市窗格）；距离雾单层（PRD CITY-03「体积雾」字面未兑现，A4 观察 A）；城市无 IBL/AO；阴影仅 Q0；机器人金属度为无 IBL 压暗的妥协值（E5 留档） |
| V3 色彩氛围 | **72** | buildings JSON 12 楼霓虹色单源 → 3D 楼体/DOM 快览色点/POI 光圈三面同源（E1+E4 同色可证）；深蓝底 #05070d + 品牌青 #49c5b6 贯穿壳与 3D；与 Jesse's Ramen 登记色板同色系可直接比对 → 70-85 段下沿 | 大面积同亮度霓虹缺明暗节奏；standard 档七楼夜景辨识度趋同；无重点色运营（时段/事件变奏） |
| V4 场景密度 | **40** | E3/E4：楼=收分体量 + 檐口/信标构件，地面只有路标线与出生光圈；零招牌文字（TextCanvas 已就位未消费，E9 留档）、零街道道具（唯一「道具」= spike 遗留锥桶）、零氛围粒子 → 30-45 段上沿「体块城市」 | 与 88° 锚（Orion 实模街景）差距最大的维；窗格大色块加剧「盒子感」；48 剪影填充楼型重复；广场空旷 |
| V5 动效转场 | **65** | E5：变形仪式成套（充能环 easeOutCubic 展开→光幕遮蔽热交换→easeOutBack 落地 1.05s，A4 冒烟实证）；光柱显现 + idle 呼吸灯/环顾；reduced-motion 终态直出（CITY-E2E-04 绿）→ 50-65 段顶「成套仪式但镜头静态」+插值 | 无镜头编舞（等距机位一杆到底）；POI 标点开合弹性过冲在慢渲染下露中间帧（A4 §5 附注）；HUD 过渡仅 opacity |
| V6 UI/HUD 整合 | **60** | E1/E2：壳排版干净、霓虹 chip/ESC dialog 与 3D 同色系、12 楼快览色点即导航 → 50-65 段上沿 | 系统字体栈（无展示字体选型）；HUD 速度表恒 0（A4 观察 F 未接线）；挂载后楼宇快览不可达（观察⑨）；组件为通用暗色样式 |
| V7 主题原创 | **78** | CC-T1 竞品矩阵：「机甲站岗 + 一键变车 + 楼=产品线」组合无直接克隆品；机器人为座舱 Master Agent 人格化（非 IP）；变形仪式为稀缺叙事 → 70-85 段 | 无招牌/道具支撑时，画面本身仍近似通用霓虹城——隐喻靠文案自明，扣「视觉自明性」 |

**总分 = 55×0.20 + 58×0.20 + 72×0.15 + 40×0.15 + 65×0.15 + 60×0.10 + 78×0.05 = 59.05 → 59/100**

结论：与 85°（Awwwards HM 量级）的差距集中在 **V4 密度（-45）、V1 首幕（-30）、V2 光照（-27）**——即「工程系统已齐、美术密度与精修欠账」，与用户「视觉分偏低」体感一致且已量化。

## 6. 提分清单（Loop 1+ 备选，按性价比排序）

| # | 动作 | 维 | 预估维分 | 总分增量 | 依据/挂点 |
|---|------|----|:---:|:---:|------|
| 1 | 首幕除噪三小件：ritual 路径撤锥桶阵（或改赛博路障皮）+ 天幕渐变/星点 + 幕墙窗格加密一档 | V1/V4 | V1 55→65 | +2.0 | 锥桶属 `world/World.ts` spike 物理试验场（驾驶 e2e 被测面在 `/world-spike/`，`/` 撤场零 e2e 冲击需核对 CITY 用例）；天幕/窗格为 TSL 参数级改动 |
| 2 | 楼顶/立面全息招牌文字（buildings `title.en` → TextCanvas 纹理，E9 已留接缝） | V4 | 40→52 | +1.8 | `world/TextCanvas.ts` 就位；Orion 招牌密度是 HM 关键 |
| 3 | 街道道具层：灯柱/全息广告牌/停驻车辆 InstancedMesh（程序化，零资产红线内） | V4 | 52→62 | +1.5 | `city/` 程序化管线复用；配 CITY-03 动画配额裁决 |
| 4 | 真机 GPU 重渲 poster + 定帧构图（前景元素 + 高光层次，仍 ≤40KB） | V1 | 65→72 | +1.4 | G-A′ poster 预算余 8KB；A4 已证真机色彩远优于软渲染 |
| 5 | 首幕镜头编舞：入场 dolly-in + 变形 push-in（View city 档参数动画） | V5 | 65→75 | +1.5 | `View.ts` city 档已参数化；reduced-motion 直出保留 |
| 6 | 分层雾/光轴（近雾+远雾双层或楼间光柱，兑现/修订「体积雾」字面） | V2 | 58→66 | +1.6 | A4 观察 A 收口同批；TSL fog 节点可做高度雾 |
| 7 | 展示字体子集（标题/数字表盘专用，woff2 子集 ≤30KB）+ HUD 速度表接线 | V6 | 60→70 | +1.0 | 观察 F 接线归 Phase 1 HUD 批次，同批做 |

全清单落地预估：**59 → ~70**；连同 V3 明暗节奏与 V4 二期（氛围粒子/天际线变奏）可及 **~75-80**。85° 需要 Orion 级实模密度投入（Blender 资产管线），建议作为 Phase 1 后的专项裁决，勿在 Loop 内隐式承诺。

## 7. score JSON 契约

`cyber-city-visual-rubric-score.json`：`score`（0-100 整数，score-loop 唯一机读位）、`dimensions`（七维 `{label, weight, score, evidence}`，权重与 §3 同步）、`notes`（一段话结论）+ 溯源字段（`subject`/`scoredAt`/`scoredBy`/`rubric`）。重打分只改分值与证据，不改 schema；改维度/权重须升 rubric 版本号并同步 §3。

---

*CC-L0-visual v1.0 · 2026-08-25 — 调研只读 + 文档/JSON 交付，3D 代码零改动；证据实跑记录见 `cyber-city-eng-wave1-notes.md`「CC-L0-visual」小节。*
