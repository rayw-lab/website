# CC-VIS-L8-W1-X1a 实现任务书 · BL2-R2 最小补洞（CC-VIS-X1A-BL2R2）

| 项 | 内容 |
|----|------|
| Task | **CC-VIS-X1A-BL2R2**（视觉 L8 W1 批①——PR [#43](https://github.com/rayw-lab/website/pull/43) NO-GO 复审续审的唯一合法后继；实现批，可直接派单） |
| 实现分支 | `cursor/cc-vis-x1a-bl2-close-*`（模板出自设计确认 §3 批①；base = 派单时最新 `main`；本任务书事实核对基线 `main@e448059`） |
| 日期 | 2026-08-27 |
| 必读输入 | `cyber-city-visual-l8-design-confirm.md`（§0.3 拆分、§1 D4/D10、§3 批①、§4.1、§6 不变式）· `loop-bl2-reaudit.md`（§0 同参读数、§2 场地裁定、§6 资产合同、**§9 四条**、§10 证据先例）· `cyber-city-visual-l8-gap-survey.md` §6.1（归因隔离）· `cyber-city-visual-l8-optimization-features.md` §1 红线 R1–R9 + §4 X1 |
| 消费方 | 实现子代理直接执行 §2–§4 与 §6；AL 复审子代理以 §5 为审计合同（含 D10 潜分收账条款） |
| 纪律 | 单 PR 单主题、**零捎带**；draft PR 锁定候选 SHA 待 AL 复审；NO-GO 先例在案，**禁自行合流、禁自行更新生产 score JSON**；评分正本恒归独立审计 |

---

## 0. 任务一句话与判定语义

**一句话**：在不改相机注册值、不改楼位的前提下，让 concept-garage 的「**塔身/螺旋带 + 屋顶阶差**」组合轮廓在 `?poi=work-gallery` 固定深链的**正常 1440×900 settled 整帧**中直接可读，销 #43 复审 §9 四条，过 **V4 独立 72–75 门**。

**判定语义（防三度 NO-GO 的第一原则）**：whole-frame 直读——不许只靠画面顶缘被裁切的冠环弧、不许依赖放大裁切、不许依赖实现说明才知道「那段弧属于螺旋塔」。两轮 NO-GO 的失败点完全一致：设计清单在代码与放大图中成立，在正常整帧中不可读。本批一切施工判断以「整帧裸眼可读」为唯一标尺。

要点四条：

1. **基线搬运 + 最小增量**：新分支自最新 `main`，先把 PR #43 分支 `dbc47c3` 的 8 文件业务面原样搬运（§2，已核与 main 零冲突），再在其上做唯一增量——生成器几何修改（§3）。`fcdfcb5` 不得复用；搬运路径天然满足 §9 ④（新分支从未触碰 24 张历史取证 PNG）。
2. **轮廓预演先行**：开 Blender 前用程序化占位块在目标帧做零资产成本构图验证（§3.1 硬前置门），预演不过不得开建模。
3. **GLB 字节必变 → §9 ③ 全链重跑**：资产解析/fresh 复现/三探针/全量 e2e/exact-port LHCI 一项不缺（§4）。
4. **审计合同前置**：§5 全表 + D10 潜分收账条款写死进本批 AL 复评任务书（若 X3 批先合流则条款移挂 X3，两处只执行一次，父代理派 AL 单时裁定）。

## 1. 背景与欠账（最小事实集，禁止再争的已裁定项）

| 事实 | 内容 | 来源 |
|------|------|------|
| NO-GO 在案 | PR #43 两轮审计均 NO-GO：首审 V4 门未过；PLUS 复审 V4=71 < 72–75 门，且锁定 `fcdfcb5` 含 **24 张**无关历史取证 PNG 改写（`docs/spec/assets/e2e-batch1/`、`e2e-integration/`） | 复审 §0/§1.3 |
| 失败机理 | 同参 pre/post 整帧中主楼仍是同一条宽百叶女儿墙，可归因变化仅顶缘一小段被裁切冠环青弧；螺旋光带、肩块、塔身、桅杆、信标、东书挡未形成整帧可读组合 | 复审 §2.3 |
| 几何裁定（已定，禁翻案） | concept-garage 地块不在 robot-idle 水平视锥内（缺口约 35°），抬高 z 不可达；`?poi=work-gallery` 被裁定为合格替代场地（固定、可复现、whole-frame、非目标近景） | 复审 §2.1/§2.2 |
| main 现状 | concept-garage 资产域（生成器/GLB/README）**完全不在 main**（BL1 只合入 autodrive-lab）；PR #43 分支 head `dbc47c3`（24 图已回滚）为唯一业务载体 | main@e448059 实核 |
| 唯一后继 | #43 禁止合流不变；X1a 是唯一合法后继路径；第三栋 hero 已拆出为 X1b（D4：掺入新楼即污染 72–75 门归因） | 设计确认 §0.3/§6 |

## 2. Step 0 · 分支与基线搬运

1. 自最新 `main` 开新分支（模板 `cursor/cc-vis-x1a-bl2-close-*`）。**禁止**续用 #43 分支或以 `fcdfcb5`/`dbc47c3` 为分支基点。
2. 从 `dbc47c3` 逐文件搬运业务面（`git checkout dbc47c3 -- <path>`；下列文件自 merge-base `b9a6edb` 以来 main 侧零改动，已核无冲突）：

| 搬运 | 文件 | 说明 |
|:---:|------|------|
| ✅ | `tools/blender/generate-concept-garage.py` | 新增（838 行生成器） |
| ✅ | `public/models/concept-garage/ConceptGarage.glb` | 新增（PLUS 版 148,240B，SHA-256 `2f529589…8303`，作为增量起点） |
| ✅ | `public/models/concept-garage/README.md` | 新增（复现合同，增量后须同步更新） |
| ✅ | `src/lab/world/city/HeroBlenderMesh.ts` | 修改（hero 挂载注册 + 台账注释读数） |
| ✅ | `src/data/cyber-city-buildings.json` | +1 行（concept-garage 登记；既有楼位零改动） |
| ✅ | `docs/spec/asset-ledger-cyber-city.md` | 修改（资产台账行，增量后须再更新） |
| ❌ | `docs/research/cyber-city-score-loop-orchestration.md` | 不搬运——看板归父代理，历史上是 exact-merge 唯一冲突源 |
| ❌ | `docs/research/cyber-city-bl2-plus-implementation.md` | 不搬运——由本批新实现记录取代（§7-3） |

3. **§9 ④ 满足方式**：新分支从未触碰 `docs/spec/assets/e2e-batch1/`、`docs/spec/assets/e2e-integration/`——PR diff 中该两目录必须为 **0**（等价并强于「含回滚」）。锁定的新候选 SHA 以此为零污染证明。
4. 搬运后先 `pnpm build` + `@smoke3d` 冒烟，确认 BL2 基线（hero 挂载/Q2 降级/abort fallback）在新 main 上照常工作，并拍下**搬运基线帧**（§4-1 三帧对照之二），再开增量。

## 3. 增量施工

### 3.1 Step 1 · 轮廓预演（开 Blender 前的硬前置门）

- 用程序化占位块（临时代码，如在生成器外临时加 BoxGeometry 体量）模拟目标体量分布，在 `?poi=work-gallery` 1440×900 settled 整帧验证「塔身/螺旋带 + 屋顶阶差」组合可读。
- **同参协议**（复审实测读数，settled 后逐值核对）：`player=(140,18)` · `camera≈(152.29, 5.95, 36.39)` · `FOV=42` · `viewport=1440×900`。
- **预演门**：不借放大即可在整帧读出组合轮廓 → GO，开 Blender；不过 → 调整体量分布再预演。禁止「先建模再看」。
- 预演占位代码**不得进入候选 SHA**（取证后移除，PR diff 零残留）。预演帧存档进实现记录。

### 3.2 Step 2 · Blender 几何增量

- **唯一改动面**：`tools/blender/generate-concept-garage.py`。方向 = 加高加宽轮廓件或体量再分布（BR X1 原文），使组合轮廓进入帧内可读区；**不改相机、不改楼位、不动其他楼与道具**。
- 预算：单栋 ≤300KB 量级（BL 先例 ~150KB/栋，现 GLB 148,240B）；GLB 合同 ≤10MB、≤100k tri（现 2,928）、贴图每张 ≤2K、Draco+KTX2 全覆盖、`extensionsRequired` 含 Draco+BasisU。

### 3.3 Step 3 · 资产管线重跑（GLB 字节必变 → §9 ③ 全链触发）

- 按 README 复现管线重建：Blender → toktx（ETC1S quality 255）→ gltf-transform Draco（审计机实测版本 Blender 4.0.2 / toktx 4.3.0 / gltf-transform CLI 4.4.2，README 命令与产物 SHA-256 同步更新，保证 fresh 重建字节一致）。
- 台账双登记：`public/models/concept-garage/README.md` + `docs/spec/asset-ledger-cyber-city.md` 更新新体积/tri/贴图/包络/复现命令/SHA-256。

## 4. Step 4 · 取证协议

1. **三帧对照**（同深链同参四同——player/camera/FOV/viewport 逐值相同，放大裁切只作辅助不作主证）：① main 基线帧（无 concept hero）；② 搬运基线帧（=`dbc47c3` 几何）；③ 增量后帧。②→③ 证明 R2 增量修了什么，①→③ 给 AL 全量归因。
2. **fresh 三探针**：Q0 `work-gallery`（两 hero GLB 请求、hero present+visible、程序化 tower present+invisible）· Q2 `concept-garage`（heroGlb zero-request `[]`、两程序化 tower visible、host ready）· 主动 abort ConceptGarage（concept tower visible、autodrive hero 不受影响、host ready、失败 warning 命中）。
3. **全量 e2e**（分母以当轮 `main` 为准，隔离端口）+ `@smoke3d` 全过；本地 `retries=0`。
4. **exact-port LHCI 陷阱转录**（复审 §4.3 先例）：`run-quality-loop.mjs --full` 不覆盖 `lighthouserc.json` 硬编码的 4321 URL——必须清空 `.lighthouseci` 后对隔离端口 preview **显式传 URL** 采集 ×3 轮；`/website/`、`/website/home/` 四项 100 逐项不降。
5. **poster/像素基线恒等**：`public/posters/` blob/tree zero-diff + `ritual_idle` 注册值逐值恒等（§6 不变式硬门）；VIS-01/02/03 像素基线**零更新预期**——concept-garage 不在 robot_idle 视锥（复审 §2.1），若基线意外变化按回归排查处理，**禁止**用 `--update-snapshots` 重签掩盖。
6. **预算面**：`audit-budget.mjs` 全绿（壳 ≤90KB gzip / poster ≤40KB / world JS ≤900KB gzip / world 资产池 ≤12MB 现用 5.5 / public ≤40MB / `.blend` 等黑名单 0）。

## 5. 硬门清单（AL 复审合同，逐行可判）

| # | 硬门 | 判据 |
|---|------|------|
| H1 | 复审 §9 ①轮廓 | 固定 `?poi=work-gallery` 正常 1440×900 整帧直读「塔身/螺旋带 + 屋顶阶差」组合轮廓，不许只靠顶缘裁切冠弧 |
| H2 | 复审 §9 ②同参取证 | settled 同参 pre/post 整帧（四同逐值），放大裁切只作辅助 |
| H3 | 复审 §9 ③全链重跑 | GLB 字节变化 → 资产解析/fresh 复现（SHA 一致）+ fresh Q0/Q2/abort + 全量 e2e + exact-port LHCI，全套在案 |
| H4 | 复审 §9 ④零污染 | 新候选 SHA 下 `docs/spec/assets/e2e-batch1/`、`e2e-integration/` 相对 main zero-diff；`fcdfcb5` 未复用 |
| H5 | V4 专项门 | **独立 V4 = 72–75**（复审续审口径；双评门通过不能替代本门） |
| H6 | 双评门 | 实现记录含**七维自评向量 + 总分**（BL2 首审曾缺自评的教训）；\|自评−独立\|总分 ≤5 |
| H7 | 归因隔离 | 增量白名单外零改动（§6）；V4 增量只归本批；已有楼体/招牌不重复计分（R9）；与上轮分差 ≥±10 的维写差异说明 |
| H8 | 质量门 | 全量 e2e 全绿（当轮 main 分母）+ `@smoke3d` + LHCI 两 URL 四项 100 不降 + `availableWeight=1`、`missing=[]` + 综合 ≥85 |
| H9 | 资产合同 | GLB ≤10MB/≤100k tri/Draco 13-13/KTX2 全覆盖/贴图 ≤2K/README+台账+SHA fresh 可复现（R4/R8） |
| H10 | poster/基线恒等 | `public/posters/` zero-diff + `ritual_idle` 逐值恒等 + VIS 像素基线零更新 |
| H11 | 受保护面 | `e2e/`、`playwright.config.ts`、`lighthouserc.json`、`.github/workflows/`、`scripts/` 相对 main 零差异 |
| H12 | **D10 潜分收账**（写给 AL） | 本批若为 W1 首个合流批：V5 按 AL-TRANS-FX GO 建议 **74** 复评，FXN-C3 进站 tween 与 C4 探索 chip 一并复评归因；若 X3 先合流则本条移挂 X3 审计，**两处只执行一次**（父代理派 AL 单时裁定并注明） |

## 6. Scope 白名单与禁区

**增量白名单**（相对 §2 搬运基线，超出即 NO-GO）：

- `tools/blender/generate-concept-garage.py`（几何增量本体）
- `public/models/concept-garage/`（GLB + README）
- `docs/spec/asset-ledger-cyber-city.md`（台账行）
- `docs/research/cyber-city-bl2-r2-implementation.md`（本批新实现记录）

**禁区**（设计确认 §4.1 + RS §6.1 归因隔离原文 + 在途冲突面）：

| 禁区 | 归属 |
|------|------|
| 相机注册值（`CameraShots`/相机常量）、楼位（buildings JSON 既有行） | 归因隔离 |
| poster、调色/tone mapping、bloom threshold/strength | X6 / X4 域（R1/R2） |
| 其他道具、招牌、`TextCanvas`/`BuildingSigns` | X3 域（W1 并行批，文件域正交声明） |
| 第三栋 hero（选楼/建模/挂载一律不入本批） | X1b 域（D4 裁定，紧后独立 PR） |
| `src/lab/world/core/Quality.ts`、`src/lab/world/index.ts` | PERF-C2 B1 在途 `ecf30a1` 域，跨轨串行 |
| `e2e/`、`playwright.config.ts`、`lighthouserc.json`、`.github/workflows/`、`scripts/` | 受保护面（H11） |

**与 X3 并行合法性**：X3 招牌批不触 concept-garage 资产域，本批不触招牌/文字纹理域；两批文件域正交、审计分批归因、各计各维（设计确认 §4.2）。

## 7. 交付物清单

1. 候选分支 + **draft PR**：锁定候选 SHA 供 AL 复审（描述中登记新 GLB SHA-256 与体积/tri 读数）；审计 GO 前禁合流。
2. 新 `ConceptGarage.glb` + README 复现合同 + 台账登记（§3.3）。
3. 实现记录 `docs/research/cyber-city-bl2-r2-implementation.md`：七维自评向量 + 总分（H6）、轮廓预演帧、三帧对照、三探针结果、e2e/LHCI/预算读数、证据 artifact 路径 + SHA-256 digest（复审 §10 格式先例）。
4. AL 复审移交块：§5 合同全表引用 + H12 条款状态（执行/移挂）+ 归因隔离声明。

## 8. 预期维分与 NO-GO 处置

- **预期**：V4 72→**74±1**（下沿口径；X1a 只主张补洞收益，第三栋收益归 X1b）；V7 +1~2（螺旋车库图腾从放大可读升整帧可读，由 AL 实测，不预支）。**不主张总分水位**——M1 前半在 W1 全合（X1a+X3）后由 AL 复评实测（设计确认 §3）。
- **再次 NO-GO 处置**：回到 §3.1 轮廓预演重新做体量分布，在同一白名单内迭代；**禁止**转向改相机/楼位翻案（复审 §2.1 已裁定几何不可达，属禁止再争项）。

## 9. 引用

**裁定与欠账**：`cyber-city-visual-l8-design-confirm.md`（§0.3/§1 D4/D10/§3/§4.1/§5 G 表/§6）· `loop-bl2-reaudit.md`（NO-GO 正本 + §9 四条 + §10 证据先例）。

**边界与红线**：`cyber-city-visual-l8-gap-survey.md` §6.1/§6.2 · `cyber-city-visual-l8-optimization-features.md` §1 R1–R9 + §4 X1 · `docs/spec/asset-ledger-cyber-city.md` · `public/models/`（BL1 先例）。

**事实核对（main@e448059）**：concept-garage 资产域不在 main；PR #43 head `dbc47c3`（24 图已回滚）业务面 8 文件；`HeroBlenderMesh.ts`/`cyber-city-buildings.json`/`asset-ledger` 自 merge-base `b9a6edb` 以来 main 侧零改动（搬运无冲突）；PERF-C2 B1 在途 `ecf30a1`。

---

*CC-VIS-L8-W1-X1a · 2026-08-27 — 实现任务书（doc-only，可直接转派单）：BL2-R2 最小补洞 = 基线搬运（dbc47c3 八文件，零污染路径）+ 轮廓预演门 + 生成器几何唯一增量 + §9 全链取证 + AL 复审合同（H1–H12 含 D10 潜分收账）。#43 禁合流、评分归独立审计、零捎带（X1b/X3/X4 域禁入）全部承接设计确认。*
