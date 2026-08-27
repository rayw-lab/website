# 赛博科技城视觉 L8 设计确认（CC-VIS-L8-DES）

| 项 | 内容 |
|----|------|
| Task | **CC-VIS-L8-DES**（Loop 8 视觉设计确认 · doc-only——把 RS 调研与 BR 脑暴收敛为唯一可派执行设计；评分正本恒归独立审计） |
| 分支 | `cursor/cc-vis-l8-des-1d6f`（base `main@7d017d5`；任务书 pin `4d35d7e`，必读件 #77 在其后一拍 `7d017d5` 合入 main，本确认要求双必读同时在树，故基线取 `7d017d5`） |
| 日期 | 2026-08-27 |
| 必读输入 | PR [#73](https://github.com/rayw-lab/website/pull/73) RS `cyber-city-visual-l8-gap-survey.md` · PR [#77](https://github.com/rayw-lab/website/pull/77) BR `cyber-city-visual-l8-optimization-features.md` |
| 复核输入 | rubric v1.1 + `cyber-city-visual-rubric-score.json`（**71**，AL-CAM）· `cyber-city-rendering-gaps-consult.md`（TM 施工合同）· `cyber-city-score-loop-orchestration.md`（板）· `loop-bl2-reaudit.md`（复审 §9）· main 事实核对（§2 映射表脚注） |
| 消费方 | 父代理 Loop 8+ 视觉轨派单：§3 批序表为排期正本，§4 为 W1 任务书要点，§5 为父代理待裁决清单 |
| 纪律 | 零 `src/`、零 e2e、零生产 score、零 poster、零像素基线改动；PR [#43](https://github.com/rayw-lab/website/pull/43) BL2 **禁止合流**不变 |

---

## 0. 结论先行

1. **正本确认**：BR 的 X1–X16 编号与 §6 批序为执行骨架正本；RS §5 的 P0/P1 条目全部映射进 X 表（§2），核对无遗漏——其中 RS P1-3（MRT 选择性 bloom）在 BR X 表无对应件，本确认收编为**新增件 X17**（§2.1）。
2. **十处分歧逐项裁定**（§1）：关键三裁为——TM 选型**按 RS**（AgX vs Neutral 双案对比，ACES 出局）；TM 时点**按 BR**（实模主体批合流、材质集合稳定后）；poster 重拍**按 BR**（X6 恒排全程最后，RS P0-3 批尾重拍作废，「只拍一次」原则不变、「最后」重定义为 X6）。
3. **X1 拆分**：X1 → **X1a**（BL2-R2 最小补洞，严格复审 §9 四条、零捎带）+ **X1b**（第三栋 hero，紧后独立 PR）——保 V4 72–75 门归因纯净。
4. **首批即可派**：W1 = X1a ∥ X3（文件域正交、审计分批归因）。跨轨前置 P0-0（CAR-E2E-01/05 超时修）已在 main `4c1e37f` 销账，全量 e2e 硬门通。潜分收账条款（V5 按 AL-TRANS-FX GO 建议 74 + FXN-C3 tween + C4 chip 一并复评）**写死挂 W1 首个合流批的 AL 复评任务书**。
5. **水位正本**：M0 71 → M5 ~88 采 BR 阶梯（分项预期下沿累加、AL 实测校准）；综合换算采 RS（视觉 92 ⇔ 综合 98，两个 98 分开算账）。**M6 尾段（X16 spike + P2 红线重谈六项）不在本确认可派范围**，触发条件见 §5 G6。
6. **待父代理裁决六项**（§5）：TM defer 解除、循环动画扩席 ×2、P3 计时口径、X11 字体翻案确认、X6 真机窗口、M6 尾段裁决。

## 1. RS × BR 分歧裁定表（本文件核心交付）

| # | 议题 | RS（#73） | BR（#77） | **裁定** | 依据 |
|---|------|-----------|-----------|----------|------|
| D1 | tone mapping 选型 | AgX vs Neutral 同机位双案对比，ACES 出局（RS §2.3 新证据） | 「ACES 或 AgX 二选一定案」（沿旧 consult 参照系） | **按 RS**：AgX vs Neutral 双案对比取证 → 单方案落地 | BR §7 自申明「与 RS 冲突以 RS 为准」；r160+/r165+ 内建 + 霓虹饱和度证据链；consult「单方案落地」边界不变，只换候选矩阵 |
| D2 | TM 批时点 | BL2-R2 后即开（P0-2），据北极星 98 解除 defer | X1+X2+X3 合流、材质集合稳定后（X4 前置 ①②③） | **按 BR** | consult「重校必须基于最终材质集合」同逻辑；X2 立面套件引入新材质在 RS 小 P0 视野外；TM 重置全部视觉取证基线（RS 自认），晚开少返工 |
| D3 | poster 重拍时点 | P0-3 批尾一次（「TM 后拍使 poster 只拍一次」） | X6 恒排全程最后（全部合流 + M5 复评后） | **按 BR** | 确认程序采 BR 全量骨架，X7/X10/X15 均改帧，P0-3 批尾拍必白拍；失效窗口按 RS §6.2 口径看板单行登记已知项，不构成中途重拍理由 |
| D4 | 第三栋 hero 归属 | P1-1（BL3 扩批，P1 段） | X1 内「同批或紧后」（P0） | **紧后独立 PR（X1b）**，不与补洞同批 | X1a 的 72–75 门是 #43 复审续审，掺入新楼即污染归因（复审「锁定 SHA 零无关改动」同款纪律）；段位归 P0 采 BR（实模是 V4 唯一突破口，双审已裁定） |
| D5 | 入场编舞席位 | P1-5（转场成套的一部分） | X5 独立 P0 承重件 | **按 BR** | V5 90 段锚点「入场-转场-微动-镜头四层皆有设计」唯一缺入场层；2026 镜头编排为主判分面（RS §2.2 自证）；P3 计时口径裁决前置不变（§5 G3） |
| D6 | stagger 点亮归属 | P0-3（V1 批三件之一） | X3（招牌批四件之一） | **按 BR** | 与招牌体系同文件域同管线，一批取证；「一次性瞬态零配额、reduced-motion 直出终态」两文结论一致 |
| D7 | 前景景框层归属 | P0-3（V1 批三件之一） | X2 与 X6 分摊表述 | **归 X2**（静态桥架/管线剪影与立面套件同 Blender 管线同批产出）；X6 只留机位常量微调 + 三面重拍 | 消灭独立「V1 批」：V1 收益由 X2/X5/X6 分批归因，避免小批次基线重签次数膨胀 |
| D8 | Q0 特权效果 scope | 一件（雨丝 **或** 微量 DOF 二选一，克制纪律） | X8 三件包（雨丝/尘粒/蒸汽口） | **雨丝 + 湿反射联动为 X8 主件**；尘粒/蒸汽口降为从件（主件 AL 过门后另裁追加）；**DOF 不立项** | RS 克制纪律（2026 趋势「1-2 个强节拍」）+ X4 边界本就排除 DOF；雨丝同时喂 V2/V4 与 Orion「雨湿楼面」对标 |
| D9 | 水位口径 | 三段位：P0→73–75 / P1→80–85 / P2→90–98 | M0→M6 阶梯（M1 ~75 / M2 ~78 / M3 ~82 / M4 ~85 / M5 ~88） | **采 BR M 阶梯为排期正本**；RS 三段位仅作综合换算参照 | 「P0」语义两文不同（红线内小步 vs 承重结构六件）；弃用「P0/P1」做排期语言，一律以 X 编号 + W 波次表述 |
| D10 | 潜分收账挂载点 | 随 P0-1~3 任一批审计执行（P0-4） | M0 基线不预支、未指定挂载点 | **写死挂 W1 首个合流批的 AL 复评任务书**（X1a 或 X3 谁先合挂谁） | 同时满足 RS 目的（防 +0.6 raw 永久滞留）与 BR 反预支纪律；「任一批」的软约定改硬指定防漏 |

## 2. RS P0/P1 → X 表映射（无遗漏核对）

| RS 条目 | 去向 | 状态 |
|---------|------|------|
| P0-0 CAR-E2E-01/05 超时修 | —（跨轨前置） | ✅ **已销**：main `4c1e37f`（PR [#69](https://github.com/rayw-lab/website/pull/69)/[#70](https://github.com/rayw-lab/website/pull/70) 批），全量 e2e 硬门通，视觉批 GO 门不再被阻断 |
| P0-1 BL2-R2 补洞 | **X1a** | W1 可派（§4.1） |
| P0-2 TM 校准 | **X4**（选型按 D1 改 AgX vs Neutral） | W3，G1 解除 defer 后 |
| P0-3 V1 definitive-shot 批 | 拆解：前景景框→X2 · stagger→X3 · poster 重拍→X6 | 按 D6/D7/D3，独立「V1 批」不立项 |
| P0-4 潜分收账 | W1 首合流批 AL 复评条款 | 按 D10 写死 |
| P1-1 BL3 实模扩批 | **X1b**（第三栋）+ X2（立面套件） | X1b 入 W2 |
| P1-2 街道生活层 | X2（街角道具带）/ X3（楼身广告位）/ X9（车流光轨、行人剪影）分摊 | — |
| P1-3 MRT 选择性 bloom | **X17（新增，BR 漏项）** | §2.1；W4 |
| P1-4 V6 打包批 | X12（+X11 字体翻案独立护栏） | DOM 轨可自 W1 起并行 |
| P1-5 转场成套 | X5 + X14 | W4 |
| P1-6 Q0 特权一件 | X8（按 D8 裁 scope） | W5，G2 扩席后 |
| P2 红线重谈六项菜单 | M6 尾段（与 X16 spike 同段） | 不派；§5 G6 |

### 2.1 新增件 X17 · MRT 选择性 bloom 迁移

RS §2.3-2 的 MRT emissive 选择性 bloom（three.js 官方样例 `webgpu_postprocessing_bloom_emissive`）在 BR X 表无对应件——X4 只重校台账不改 bloom 架构。确认收编为 **X17**（P1 · 引擎-中 · 主受益 V2）：辉光资格从「全彩通路 threshold=1 阈值兜底」升级为「emissive 通道声明制」，emissive 纹理可降 `UnsignedByteType` 省带宽。**独立小批，不与 X4 同 PR**（RS 原文归因隔离要求）；**序在 X4 之后**（在定案 TM 曲线上迁移才不校两次）。BR 红线 R2 相应修订注记：「唯一重校窗口 = X4」细化为「X4 重校台账、X17 迁移架构，各自独立批次独立取证；其余批次两者皆禁动」。

## 3. 确认执行骨架（修订 BR §6 批序）

| 波 | 序 | 批（分支名模板） | 内容 | 前置 | 水位 |
|----|----|------------------|------|------|------|
| W1 | ① | `cursor/cc-vis-x1a-bl2-close-*` | X1a BL2-R2 最小补洞（轮廓预演先行） | 即可派 | — |
| W1 | ② | `cursor/cc-vis-x3-signage-v2-*` | X3 招牌叙事 v2 + stagger（∥ ①，审计分批归因） | 即可派 | W1 全合 → M1 前半 |
| W2 | ③ | `cursor/cc-vis-x1b-hero3-*` | X1b 第三栋 hero（选楼：robot_idle 视锥或主干道驾驶动线可见优先，候选 work-gallery / tts-cockpit 楼） | ① GO | — |
| W2 | ④ | `cursor/cc-vis-x2-facade-kit-*` | X2 立面套件 + 街角道具带 + **前景景框层（D7 并入）**；显式基线重签批 | ①（管线经验）；可见楼清单 NDC 取证先行 | W2 全合 → M1 ~75 |
| W3 | ⑤ | `cursor/cc-vis-x4-tone-mapping-*` | X4 统一光照校准：**AgX vs Neutral 同机位双案对比 → 单方案落地** + exposure/emissive 台账全量重校；全量基线重签 | W1+W2 合流 + G1 解除 defer + **PERF-C2 B1 合流**（`Quality.ts` 域串行）；三档取证用 `?quality=` 深链钉档（B1 深链禁自动降档，恰为取证协议所需） | — |
| W3 | ⑥ | `cursor/cc-vis-x7-atmosphere-*` | X7 天空大气 v2 | ⑤ 紧后（天空是 TM 第一重校对象） | W3 全合 → M2 ~78 |
| W4 | ⑦ | `cursor/cc-vis-x5-entrance-*` | X5 入场编舞 + X14 镜头扩展 | G3 计时口径裁决；与 ⑤⑥ 文件域正交可并行开工、串行合流 | — |
| W4 | ⑧ | `cursor/cc-vis-x17-mrt-bloom-*` | X17 MRT 选择性 bloom（§2.1） | ⑤ | W4 全合 → M3 ~82 |
| W5 | ⑨ | `cursor/cc-vis-x8x9-ambient-*` | X8（D8 缩 scope：雨丝主件）+ X9 街道生活 v2 | G2 扩席 + ⑤（在最终光照上调观感） | — |
| W5 | ⑩ | `cursor/cc-vis-x10-color-rhythm-*` | X10 明暗节奏与重点色运营 | ⑤ | — |
| W5 | ⑪ | `cursor/cc-vis-x11x12-ui-*` | X11 字体翻案 + X12 diegetic HUD（**DOM 轨，可自 W1 起并行开工**，合流窗口任意） | G4 | — |
| W5 | ⑫ | `cursor/cc-vis-x13x15-material-*` | X13 主角质感 + X15 光照材质深化（`scene.environment` 与性能轨 O7 同批裁决） | ⑤；与 O14 串行 | W5 全合 → M4 ~85 |
| W6 | ⑬ | `cursor/cc-vis-x6-poster-final-*` | X6 definitive shot + poster 三面收口（桌面/移动竖版/OG，三处 ≤40KB） | 全部合流 + M5 复评 + G5 真机窗口 | M5 ~88 |
| — | ⑭ | 视 G6 裁决 | X16 烘焙统一 spike → 尾段逐维专项（P2 红线重谈六项） | G6 | M6（裁决段） |

流程纪律（承接 BR §6 尾段，全序适用）：每批合流前独立 AL 复评（帧优先 + 双评门 |Δ|≤5 + 当批主攻维净增益归因）；触帧批附同机位 settled pre/post 对照（player/camera/FOV/viewport 四同）；基线重签只在标记批执行且逐张审阅；新事件/循环动画同步 OBS spec 白名单与配额台账。**新增一条**：⑤ 之后每个改帧批合流都会延长 poster 失效窗口——看板保持单行已知项登记（RS §6.2 口径），任何中间批不得以此为由提前重拍。

## 4. W1 派单要点（可直接转任务书）

### 4.1 ① X1a · CC-VIS-X1A-BL2R2

- **目标**：销 [#43](https://github.com/rayw-lab/website/pull/43) 复审 §9 四条，V4 过 72–75 门。scope 白名单：`tools/blender/generate-concept-garage.py` + `public/models/concept-garage/` + 资产台账；**禁碰**相机注册值、楼位、poster、调色、其他道具（RS §6.1 归因隔离原文）。
- **先行动作**：程序化占位块在 `?poi=work-gallery` 1440×900 整帧做**轮廓预演**（零资产成本验证构图，BR X1 风险条），预演过再开 Blender。
- **复审 §9 四条转录**：① 固定场地正常整帧直读「塔身/螺旋带 + 屋顶阶差」组合轮廓（不许只靠顶缘裁切冠弧）；② settled 同参 pre/post 整帧取证，放大裁切只作辅助；③ GLB 字节变化即重跑资产解析/复现 + fresh Q0/Q2/abort + 全量 e2e + exact-port LHCI；④ 新候选 SHA 含 24 张历史取证 PNG 回滚，原锁定 `fcdfcb5` 不得复用。
- **审计**：AL 复审专项（V4 净增益门 72–75）；任务书**写入 D10 潜分收账条款**（V5 按 AL-TRANS-FX GO 建议 74，FXN-C3 进站 tween 与 C4 探索 chip 一并复评归因）——若 ② 先合流则该条款移挂 ② 的审计，两处只执行一次。

### 4.2 ② X3 · CC-VIS-X3-SIGNAGE

- **四件一批**：多层招牌体系（TextCanvas 扩展竖排/双语/图标合成 + 纹理图集合并控 draw call）；产品线帧内自明（招牌直写产品线名 + 符号图形，销 V7 扣分点）；全息广告板 3-5 块（默认静帧零配额，轮播变体不在本批）；stagger 150ms 逐楼点亮（一次性瞬态零配额，reduced-motion 直出终态）。
- **硬门自查**：R2（新增发光面全部阈上或阈下，不动 threshold=1 与 strength）；A3 三族色纪律 + neon-tokens 色相单源；首幕帧变化 → 显式基线重签批；O4 draw call 哨兵（+20% 阈值）。
- **取证**：同机位 settled pre/post + 招牌文字可读性特写 + stagger 时序帧序列。
- **与 ① 并行合法性**：文件域正交（X3 不触 concept-garage 资产域）；审计分批归因，各计各维。

## 5. 待裁决登记（父代理动作项）

| # | 裁决 | 前置于 | 建议 |
|---|------|--------|------|
| G1 | TM defer 解除 | ⑤ X4 | 按 D2 书面解除：解除条件 =「W1+W2 全部合流」；施工合同 = consult §1.1 原文（单方案落地、台账联动重校、三档双后端同机位证据、不加 DOF/SSAO/LUT/新内容）+ 选型矩阵按 D1 改 AgX vs Neutral |
| G2 | 循环动画扩席 ×2（X8 雨丝、X9 各拟 +1；现 3/3，天花板 ≤5 内） | ⑨ | 按 CC-L3-B3 先例书面登记后开工；若只批一席，**X9 优先**（V4 主战场权重高于 V2 氛围件） |
| G3 | P3 计时口径（入场编舞 vs 加载→可玩 ≤8s 门） | ⑦ X5 | 建议「skip 即达」口径，与 PERF 轨（O3/CITY-PERF-01）联合修订，实现前定案 |
| G4 | X11 字体翻案确认 | ⑪ | 预算口径实证成立（`audit-budget.mjs` `FONT_RE` 跳过字体，master-plan 7.5 同口径），建议确认重开；护栏 = LHCI 四项 100 不降 + CLS 零漂移（`size-adjust`/metric override 对冲）+ R8 字体台账登记 |
| G5 | X6 真机窗口 | ⑬ | 与 PERF HG-PREP 真机六腿共窗排期（human-gate 复用）；云端产不出的读数留空登记不伪造（豁免留痕先例） |
| G6 | M6 尾段裁决 | ⑭ | 触发条件三联：**M5 复评实测 ≥82**（RS 下限口径）且**综合分核算完成**（视觉 92 ⇔ 综合 98，两个 98 分开算账，综合北极星在视觉 92 即达成）且**父代理确认视觉北极星 98 维持有效**——三者齐备才开 X16 spike；spike GO 才开 P2 红线重谈（六项一次性裁决，禁逐项零散放宽） |

## 6. 不变式重申

- PR [#43](https://github.com/rayw-lab/website/pull/43) BL2 NO-GO **禁止合流**；X1a 是其唯一合法后继路径。
- poster：`public/posters/` blob/tree zero-diff + `ritual_idle` 注册值逐值恒等为除 ⑬ 外全部批次硬门；desktop 余量 <0.5KB，⑬ 重拍当场复核三处 ≤40KB。
- BR §1 红线 R1–R9 全承接（R2 按 §2.1 修订注记）；rubric v1.1 秤不动、`availableWeight=1`、`missing=[]`；评分恒归独立审计、帧优先、反通胀、与上轮分差 ≥±10 必写差异说明。
- 同文件跨轨串行：`Rendering.ts`（X4/X17 × O5/O6/O8）· `Quality.ts`（X4 取证与 X8 梯退表 × PERF-C2 B1，B1 在途 `ecf30a1`）· `NeonMaterials/NeonFacade`（X4/X15 × O14）· `scene.environment`（X15 × O7 同批裁决）· 装配段（X5 × O1/O4）。

## 7. 引用

**必读正本**：PR [#73](https://github.com/rayw-lab/website/pull/73) `cyber-city-visual-l8-gap-survey.md`（RS）· PR [#77](https://github.com/rayw-lab/website/pull/77) `cyber-city-visual-l8-optimization-features.md`（BR）。

**复核**：`cyber-city-visual-rubric.md` v1.1 · `cyber-city-visual-rubric-score.json`（71，AL-CAM）· `cyber-city-rendering-gaps-consult.md`（CC-L6-TM 施工合同）· `loop-bl2-reaudit.md`（复审 §9）· `cyber-city-score-loop-orchestration.md`（Loop 8 板）· main 事实核对：VEH-E2E-FIX 已合 `4c1e37f`（销 RS P0-0）；PERF-C2 B0 已合 `a1353dc`/`21b20d1`（不触 `Rendering.ts`）；PERF-C2 B1 在途 `ecf30a1`（触 `Quality.ts`/`index.ts`，⑤ 取证前须合流）。

---

*CC-VIS-L8-DES · 2026-08-27 — doc-only 设计确认：RS×BR 十处分歧裁定（D1–D10）+ X 表修订（X1a/X1b 拆分、X17 新增、X8 缩 scope、独立 V1 批撤销）+ 六波批序（W1 即可派：X1a ∥ X3）+ 六项待裁决（G1–G6）。零实现改动；#43 禁合流、poster 纪律、评分归独立审计全部不变。M6 尾段不在本确认可派范围。*
