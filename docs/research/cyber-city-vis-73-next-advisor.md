# 赛博科技城视觉 73→~78 下一拍顾问（CC-VIS-ADV-73）

> 执行模型自报：**claude-fable-5-thinking-xhigh**

| 项 | 内容 |
|----|------|
| Task | **CC-VIS-ADV-73**（视觉 73 登记后的下一拍最短路径顾问 · doc-only——批序正本仍是设计确认 §3，本文只做条件核账、水位算术校验与派单折叠，不改骨架） |
| 分支 | `cursor/cc-vis-adv-73-1d6f`（base `main@771b1e4` = PR [#94](https://github.com/rayw-lab/website/pull/94) 合流 tip，独立 worktree） |
| 日期 | 2026-08-27 |
| 必读输入 | `cyber-city-visual-l8-design-confirm.md`（DES，批序正本）· `cyber-city-visual-l8-gap-survey.md`（RS，PR [#73](https://github.com/rayw-lab/website/pull/73)）· `loop8-vis-w1-audit.md` + `cyber-city-visual-rubric-score.json`（**73**，PR [#94](https://github.com/rayw-lab/website/pull/94)） |
| 复核输入 | `cyber-city-score-loop-orchestration.md`（板）· PR [#88](https://github.com/rayw-lab/website/pull/88)（PERF 顾问 R2，B1 已合核验）· main 实核（`git log`：B1 `52fafca`、X1A-R4 `dea7c1e`/[#92](https://github.com/rayw-lab/website/pull/92)、X3 `c0bb67a` + [#93](https://github.com/rayw-lab/website/pull/93)） |
| 消费方 | 父代理下一拍派单：§3 派单表 + §4 三张即刻派单要点可直接转任务书 |
| 纪律 | doc-only：零 `src/`、零 e2e、零 score、零 poster、零基线改动；PR [#43](https://github.com/rayw-lab/website/pull/43) 禁合流不变；评分正本恒归独立审计 |

---

## 0. 结论先行

1. **现状核账**：生产登记 **73**（raw 72.60，[#94](https://github.com/rayw-lab/website/pull/94)），向量 `V1 68 / V2 75 / V3 70 / V4 74 / V5 74 / V6 74 / V7 78`。W1（X1a+X3）齐、X1a V4 门判 74 GO、D10 潜分收账已唯一执行；审计对象 `dc3f56b` 即 #94 前一拍 main tip，**当前无未登记潜分**，账面干净。
2. **最短路径 = 设计确认既定骨架，不改道**：W2（X1b ∥ X2）→ G1 书面解除 → W3（X4 → X7）→ AL 复评登记。**X2 不可裁**（§2.1 三条论证）——用户侧「W2 X1b」的最短口径若理解为砍掉 X2，会同时毁掉 G1 解除条件、TM 唯一重校窗口与 V1 本波唯一杠杆，路径反而变长。
3. **G1 条件盘点**（§2.2）：X4 的三前置中 **PERF-C2 B1 已销**（`52fafca` 在 main，[#88](https://github.com/rayw-lab/website/pull/88) 顾问已核验，本文 git 复核一致）；剩「W1+W2 全部合流」（W1 ✅，W2 待）+ 父代理**书面解除动作本身**。建议本拍即预登记 G1（写死解除条件），W2 全合当日零等待放行 X4。
4. **水位算术校验（本文核心修正）**：按分项下沿累加，W2 落点 ~74–75、W3 落点 ~76–77——**仅靠 W2+W3 冲 78 需 X4/X7 全部命中上沿，不稳**。缺口在 V5（74，W2/W3 零批次触碰）。解法已在设计确认 ⑦ 授权：**X5 与 ⑤⑥ 文件域正交、可并行开工串行合流**——建议本拍即裁 G3（书面、零成本），X5 随 W3 尾合流，则 ~78 在 W3+X5 复评窗口内可达（上沿）；若届时落 76–77，剩余差额由 W4 首批（X17）确定性补齐，不预支。
5. **#94 审计 ROI 表第 1 项（A10 poster 重拍）不采纳为本拍动作**：D3 裁定 poster 恒排 X6（W6）；X4 全帧重置会使任何中途重拍白拍一次。V1 在 X6 前接受 ~72–74 封顶，看板维持失效窗口单行登记。
6. **三张即刻派单**（§4）：**CC-VIS-X1B-HERO3**（即派）∥ **CC-VIS-X2-FACADE**（即派，并行开工、X1b 后合流）+ **CC-VIS-X4-TM**（条件触发单，W2 全合 + G1 解除即发）。X7 紧随 X4 的第四单已在 §3 表内备好措辞。全部 `claude-fable-5-thinking-xhigh`。

## 1. 现状核账（#94 之后的板面）

### 1.1 向量与滞涨点

| 维 | 权重 | 分 | 本波（W2/W3）可动性 |
|----|:---:|:---:|----|
| V1 首幕构图 | .20 | 68 | **可动**：X2 前景景框层（D7）+ X4 光比 + X7 天空 v2；poster 欠账压顶（X6 前封顶 ~72–74） |
| V2 光照材质 | .20 | 75 | **主杠杆**：X4 tone mapping（`NoToneMapping` → AgX/Neutral 单方案）为 V2 最大单件 |
| V3 色彩氛围 | .15 | 70 | **解锁链在 X4 后**：grading/明暗节奏必须在 TM 定案曲线上校（RS §3 V3 原判） |
| V4 场景密度 | .15 | 74 | **可动**：X1b 第三栋（74→76~77）+ X2 立面套件/街角道具带 |
| V5 动效转场 | .15 | 74 | **W2/W3 零批次触碰**——~78 算术缺口所在；X5 并行开工是唯一本波合法解（§2.3） |
| V6 UI/HUD | .10 | 74 | 不动（X11/X12 DOM 轨独立窗口，不占本波） |
| V7 主题原创 | .05 | 78 | X2 街角道具带捎带（+0~1），不单列 |

### 1.2 前置事实核验（git 实核，base `771b1e4`）

| 事实 | 证据 | 对派单的意义 |
|------|------|------|
| W1 全合：X1a `dea7c1e`（#92）+ X3 `c0bb67a` + X3-R4 e2e `dc3f56b`（#93） | main log | W2 ③ 前置「① GO」已满足（V4 门判 74） |
| PERF-C2 B1 已合 | `52fafca`（`Quality.ts`/`index.ts`）；#88 顾问核验一致 | X4 的 `Quality.ts` 域串行前置**已销**；三档取证可用 `?quality=` 深链钉档（B1 深链禁自动降档） |
| 生产登记与 main tip 同步 | 审计对象 `dc3f56b`，其后仅 #94 自身（docs） | 无潜分挂账，W2 复评从干净基线起算 |
| 取证串台先例条款 | #94 §2：共享 VM 取证前必须核对 preview 实际端口 + chunk hash 对账 | **写入本文全部三张派单的硬前置**（§4 通用合同第 1 条） |
| hero 在册 2 栋 | `autodrive-lab` + `concept-garage`（F2 双 GLB 请求实证） | X1b 选楼从其余 10 栋出（§4.1） |

## 2. 最短路径裁定

### 2.1 X2 不可裁（对「最短」的正面回答）

砍 X2、只跑 X1b→X4→X7 表面省一批，实际三处断链：

1. **G1 解除条件原文**（设计确认 G1）：「解除条件 = W1+W2 全部合流」——W2 含 ④ X2。砍 X2 即需重谈 G1，裁决成本高于批次成本。
2. **D2 时点逻辑**：TM 重校必须基于最终材质集合。X2 立面套件引入新材质族，若排到 X4 之后合流，将强制二次重校，直接违反「唯一重校窗口 = X4」红线（BR R2 + §2.1 修订注记）。X2 晚于 X4 的任何排法都比现骨架更贵。
3. **V1 算术**：本波内 V1 唯一可施工件是 X2 的前景景框层（D7 并入，静态零配额）。没有它，V1 停在 68，~78 的加权算术塌 0.4–0.6。

**裁定：维持 W2 = X1b ∥ X2，并行开工、串行合流（X1b 先合，X2 rebase 后合）。** 串行合流双重理由：两批都可能触 `src/data/cyber-city-buildings.json`（单点注册交叠）；X2 是显式基线重签批，后合可把 W2 两批帧变化一次收进重签，少签一轮。

### 2.2 G1 条件盘点（X4 放行清单）

| # | 条件 | 状态 | 动作 |
|---|------|:---:|------|
| 1 | W1 全部合流 | ✅ | 无 |
| 2 | W2 全部合流（X1b + X2） | ⏳ | 本拍派单（§4.1/§4.2） |
| 3 | PERF-C2 B1 合流（`Quality.ts` 域串行） | ✅ `52fafca` | 无（本文核验完毕，X4 任务书直接引用） |
| 4 | 父代理书面解除登记 | ⏳ | **本拍即预登记**：解除条件写死为「本表 #2 达成」；施工合同 = consult §1.1 原文 + D1 选型矩阵（AgX vs Neutral 双案同机位对比，ACES 出局） |

### 2.3 水位算术（下沿/上沿累加，raw 72.60 起）

| 批 | 维贡献（下沿→上沿） | raw 增量 |
|----|----|:---:|
| X1b | V4 +2→+3 | +0.30→+0.45 |
| X2 | V1 +2→+3 · V4 +1→+2 · V7 +0→+1 | +0.55→+0.95 |
| X4 | V2 +2→+4 · V3 +2→+3 · V1 +0→+1 | +0.70→+1.45 |
| X7 | V1 +1→+2 · V3 +1→+2 · V2 +0→+1 | +0.35→+0.90 |
| **小计（W2+W3）** | | **+1.90→+3.75 → raw 74.5–76.4 → 登记 74–76** |
| X5（G3 裁决后并行开工、X7 后串行合流） | V5 +2→+3 · V1 +0→+1 | +0.30→+0.65 |
| **含 X5 累计** | | **+2.20→+4.40 → raw 74.8–77.0 → 登记 75–77（上沿逼 78）** |

判读：BR 阶梯 M2 ~78 是从 M0 71 起的预期值；实测 W1 只交付 +2.10，**按同口径外推 W3 复评的诚实落点是 76±1，~78 是上沿目标而非确定值**。反通胀纪律（下沿累加、AL 实测校准、禁预支）不允许把 78 写成承诺。两条兑现路线：

- **主路线**：X5 并行开工随 W3 尾合流（设计确认 ⑦ 已授权「与 ⑤⑥ 文件域正交可并行开工、串行合流」），把 V5 74→76~77 收进 W3 复评窗口——G3 是唯一前置，建议本拍即按「skip 即达」口径书面裁决（G3 建议原文，与 PERF 轨 O3/CITY-PERF-01 联合修订）；
- **兜底**：若 W3(+X5) 复评落 76–77，差额由 W4 首批 X17（V2 +1~2，前置 ⑤ 已满足）确定性补齐，不在本轮预支。

综合敏感度维持 RS §0 口径：每 +4 视觉 ≈ 综合 +1；73→78 ≈ 综合 +1.25。

## 3. 派单表（正本，父代理按行触发）

模型纪律：L8+ 全部子代理 = `claude-fable-5-thinking-xhigh`（AGENTS.md + 板 §模型行）；降级须按 AGENTS.md 明示降级规则声明。每单独立 worktree、禁共享 `/workspace`、首行自报 model slug。

| 序 | Task ID | 模型 | 文件域 | 串并行 | 触发条件 |
|----|---------|------|--------|--------|----------|
| ① | **CC-VIS-X1B-HERO3** | claude-fable-5-thinking-xhigh | `tools/blender/generate-<楼>.py`（新）+ `public/models/<楼>/`（新）+ `src/data/cyber-city-buildings.json`（单点）+ `src/lab/world/city/HeroBlenderMesh.ts`（挂载扩位）+ `docs/spec/asset-ledger-cyber-city.md` | 与 ② 并行开工，**先合** | 即派（X1a GO 已满足） |
| ② | **CC-VIS-X2-FACADE** | claude-fable-5-thinking-xhigh | `tools/blender/generate-facade-kit.py`（新）+ `public/models/facade-kit/`（新）+ `src/lab/world/city/CityBlocks.ts` / `StreetProps.ts` + 前景剪影新模块（静态零配额）+ VIS-01/02 基线**显式重签** | 与 ① 并行开工，**X1b 合流后 rebase 再合** | 即派；NDC 可见楼清单取证先行 |
| ③ | **CC-VIS-X4-TM** | claude-fable-5-thinking-xhigh | `src/lab/world/rendering/Rendering.ts`（toneMapping/exposure）+ `NeonMaterials.ts` / neon tokens emissive 台账 + 全量基线重签 | W3 头，**严格串行**（W2 全合后） | 条件单：§2.2 清单四条齐 → 即发（任务书要点见 §4.3） |
| ④ | CC-VIS-X7-ATMOSPHERE | claude-fable-5-thinking-xhigh | `src/lab/world/city/Sky.ts`（穹顶/大气/云带）± `CitySilhouette.ts` 微调 | ③ 合流**紧后**（天空是 TM 第一重校对象） | X4 合流 + 基线重签完成 |
| ⑤ | CC-VIS-X5-ENTRANCE | claude-fable-5-thinking-xhigh | `src/lab/world/view/View.ts` / `CameraShots.ts` + `src/data/camera-shots.json` + 装配段（× PERF O1/O4 串行注意） | 与 ③④ **并行开工、串行合流**（X7 后） | G3 书面裁决（建议本拍即裁，「skip 即达」口径） |
| ⑥ | CC-AL-VIS-L8-W2 | claude-fable-5-thinking-xhigh | `docs/research/` only（复评登记，预期 74–75） | 单跑 | W2 全合 |
| ⑦ | CC-AL-VIS-L8-W3 | claude-fable-5-thinking-xhigh | `docs/research/` only（复评登记，目标 76–78） | 单跑 | W3（含 X5 若已合）全合 |

流程纪律（承接设计确认 §3 尾段，全表适用）：每批合流前独立 AL 复评（帧优先 + 双评门 |Δ|≤5 + 当批主攻维净增益归因）；触帧批附同机位 settled pre/post 四同对照；基线重签只在 ②③ 标记批执行且逐张审阅；X4 之后每个改帧批延长 poster 失效窗口——看板单行登记，禁以此提前重拍。

**VM 排程注记**：板上 CC-AL-VEH-R3-R2 需独占 VM 单跑全量 e2e；①② 的 e2e 硬门与其错峰（先 VEH-R3-R2 后 W2 合流验证，或反之，禁同窗）。X4 取证窗口内 PERF 轨**冻结** `Rendering.ts` / `Quality.ts` / `NeonMaterials.ts` 实现批（O5/O6/O8/O14 顺延，同文件跨轨串行不变式）。

## 4. 三张即刻派单要点（可直接转任务书）

**通用合同（三单共用）**：（a）取证前核对 preview 实际端口 + 页面 chunk hash ∈ 本轮 `dist/_astro/`（#94 §2 先例条款，硬前置）；（b）poster 恒等合同：`public/posters/` blob/tree zero-diff + `ritual_idle` 注册值逐值恒等；（c）全量 e2e 绿 + exact-port LHCI 是合流硬门；（d）新事件/循环动画同步 OBS spec 白名单（本三单均不新增循环席位）；（e）独立 worktree + 首行自报 model slug。

### 4.1 ① CC-VIS-X1B-HERO3（即派）

- **目标**：第三栋 hero 实模，V4 74→76~77。选楼判据按设计确认 ③：robot_idle 视锥或主干道驾驶动线可见优先，候选 `work-gallery` / `lingua-tower`（即 DES 所称 tts-cockpit 座舱馆）；实现单以首幕/驾驶动线 NDC 取证定夺并在任务书回执登记。
- **scope 白名单**：§3 表 ① 文件域；**禁碰** `generate-concept-garage.py`、`public/models/concept-garage/`、相机注册值、其他楼位、poster、调色（X1a 同款归因隔离）。
- **先行动作**：程序化占位块整帧轮廓预演（1440×900，零资产成本验证构图），预演过再开 Blender——X1a 流程复用。
- **管线合同**：BL1/BL2 已验证管线原样沿用（Draco+KTX2 ETC1S、≤2K、README 复现合同、台账登记、fallback 三探针）；GLB 字节变化即重跑资产解析/复现 + fresh Q0/Q2/abort + 全量 e2e + exact-port LHCI（复审 §9-③ 转录）。
- **验收**：whole-frame 可读轮廓（BL2 教训：不许只靠放大裁切）；资产池余量核对（现 ~5.5MB+X1a 增量 / 12MB 红线）。
- **审计**：合流前 AL 复评 V4 净增益归因（76~77 预期，下沿口径登记）。

### 4.2 ② CC-VIS-X2-FACADE（即派，并行开工）

- **目标**：立面套件 + 街角道具带 + **前景景框层**（D7 并入：近景桥架/管线剪影，静态、零循环配额），V1 68→70~71、V4 +1~2、V7 捎带。
- **先行动作**：可见楼清单 NDC 取证（设计确认 ④ 前置原文）——只给首幕与主动线可见的楼做立面，不可见面零投入。
- **scope 白名单**：§3 表 ② 文件域；**禁碰** hero GLB 域（①③ 隔离）、相机注册值、bloom/threshold、poster。
- **基线纪律**：本批为**显式基线重签批**——VIS-01/02 `--update-snapshots` 逐张审阅；排 X1b 之后合流，把 W2 全部帧变化一次收进重签。
- **reduced-motion**：前景层为静态件天然合规；街角道具带如含发光面，全部走 neon tokens 单源 + 阈上/阈下自查（R2 不动 threshold=1 与 strength）。
- **审计**：合流前 AL 复评 V1/V4 分维归因；此批即 W2 收口批，⑥ CC-AL-VIS-L8-W2 生产登记随后单派。

### 4.3 ③ CC-VIS-X4-TM（条件单：§2.2 四条齐 → 即发，任务书零起草时间）

- **目标**：`NoToneMapping` → **AgX vs Neutral 同机位双案对比取证 → 单方案落地** + exposure/emissive 台账全量重校。V2 75→77~79、V3 70→72~73（V3 解锁链头）。
- **施工合同**：consult §1.1 原文全承接——单方案落地、台账联动重校、三档双后端（WebGPU/WebGL2）同机位证据、**不加 DOF/SSAO/LUT/新内容**；选型矩阵按 D1/RS §2.3（ACES 出局理由留档：霓虹青/品红高亮饱和度坍缩）。
- **取证协议**：三档用 `?quality=` 深链钉档（B1 已合，深链禁自动降档恰为取证所需——`52fafca` 本文已核验，任务书直接引用不必重查）；双案对比帧同机位四同（player/camera/FOV/viewport）。
- **基线纪律**：全帧变化 → 全量基线重签（逐张审阅）；poster 失效窗口自此打开，看板单行登记，**重拍仍恒归 X6**。
- **跨轨冻结**：本批开工至合流期间，PERF 轨不得派触 `Rendering.ts` / `Quality.ts` / `NeonMaterials.ts` 的实现批。
- **审计**：合流前 AL 复评 V2/V3 净增益归因；X17（MRT 选择性 bloom）**不并入本批**（RS 归因隔离原文，序在 X4 后、W4 窗口）。

## 5. 父代理动作项（本拍随派单一并执行，均零实现成本）

| # | 动作 | 时点 | 要点 |
|---|------|------|------|
| A1 | G1 预登记 | 本拍 | 解除条件写死 =「X1b+X2 全合」；§2.2 清单入板，W2 合流当日放行 X4 零等待 |
| A2 | G3 书面裁决 | 本拍 | 建议「skip 即达」口径（与 PERF O3/CITY-PERF-01 联合修订）；裁决落地即解锁 ⑤ X5 并行开工——**这是 ~78 主路线的唯一前置** |
| A3 | VM 排程 | 本拍 | VEH-R3-R2 独占 e2e 窗口与 W2 两批合流验证错峰登记 |
| A4 | 板面更新 | 随 tick | 视觉行 71→**73**（#94）；在途改 X1b/X2；poster 失效窗口单行项自 X4 合流起挂 |

## 6. 不变式重申

- PR [#43](https://github.com/rayw-lab/website/pull/43) BL2 NO-GO **禁止合流**；X1a 已走完其唯一合法后继路径，#43 本体维持关闭状态不重启。
- poster：除 X6 外全批 `public/posters/` zero-diff + `ritual_idle` 逐值恒等；desktop 余量 <0.5KB，X6 重拍当场复核三面 ≤40KB。
- rubric v1.1 秤不动、`availableWeight=1`；评分恒归独立审计、帧优先、反通胀（下沿累加、禁预支、|Δ|≥10 必写差异说明）。
- 循环动画 3/3 满席不变——本文三单零新增席位；扩席裁决（G2）属 W5 窗口，不提前。
- M6 尾段（X16 spike + P2 红线重谈）不在本文可派范围（G6 三联条件未触发）。

## 7. 引用

**站内**：`cyber-city-visual-l8-design-confirm.md`（批序正本 §3、D1–D10、G1–G6）· `cyber-city-visual-l8-gap-survey.md`（RS §2.3 TM 选型矩阵、§5 P0/P1、§6 纪律）· `loop8-vis-w1-audit.md`（73 登记 + §2 取证串台先例 + §6 ROI 表）· `cyber-city-visual-rubric-score.json`（73 向量正本）· `cyber-city-visual-rubric.md` v1.1 · `cyber-city-score-loop-orchestration.md`（板）· `cyber-city-rendering-gaps-consult.md`（X4 施工合同原文）· PR [#88](https://github.com/rayw-lab/website/pull/88)（B1 已合核验先例）。

**main 实核**（base `771b1e4`）：X1A-R4 `dea7c1e`（[#92](https://github.com/rayw-lab/website/pull/92)）· X3 `c0bb67a` + R4 e2e `dc3f56b`（[#93](https://github.com/rayw-lab/website/pull/93)）· B1 `52fafca`（`Quality.ts`）· 73 登记 `771b1e4`（[#94](https://github.com/rayw-lab/website/pull/94)）。

---

*CC-VIS-ADV-73 · 2026-08-27 — doc-only 顾问：73 后下一拍最短路径 = W2（X1b ∥ X2，X2 不可裁）→ G1 预登记零等待放行 X4 → X7 紧后；~78 诚实落点 76±1，主路线靠 G3 本拍裁决解锁 X5 并行收 V5 账，兜底 W4 X17。三张即刻派单 + 四项父代理零成本动作随文交付。零实现改动；#43 禁合流、poster 纪律、评分归独立审计不变。*
