# 赛博科技城性能 Rubric v1.0（CC-PERF-DES · 冻结版）

> 执行模型自报：**claude-fable-5**

| 项 | 内容 |
|----|------|
| Task | **CC-PERF-DES**（Loop 8 性能扩展 DES 三件套之一）——性能 85 秤的**独立正本**：五维权重与锚点、85 门（数值门 + 结构门）、真机取证协议与 human-gate §5.4 占位、登记 JSON 契约 |
| 分支 | `cursor/cc-perf-des-spec-1d6f`（base：`main` @ `cf76d35`） |
| 日期 | 2026-08-27 |
| 版本 | **v1.0 冻结**：五维权重与锚点骨架逐字镜像功能 rubric `docs/spec/cyber-city-function-rubric.md` §5（顾问报告 §3 冻结口径）；本文件首次落地逐维锚点分段、85 门合成语义、五条结构门、真机增补两行与登记 JSON 全量 schema。改权重/维度/锚点段位必须升版本号（§7） |
| 正本交接 | 本文件即性能秤**正本**；功能 rubric §5/§6.2 为其冻结时点镜像——PR-A（实现方案 `docs/research/cyber-city-perf-impl-plan.md` §2）随行加「正本已迁本文件」指针注记，**加法不改秤** |
| 评分对象 | 生产 `/`（或 `pnpm build && pnpm preview` 产物）的 **world 运行时体验**：挂载 → robot_idle → 变形 → 驾驶的帧率/流畅度/加载可玩/预算/降档五面。**不测**壳加载分（LHCI 承载，两轨彻底分立）、不测体验好坏（功能 rubric 承载） |
| 上游 | 功能 rubric §5（权重与锚点冻结源）· 顾问报告 `cyber-city-fxn-advisor-consult.md` §3（性能双轨冻结）· PERF-RS `docs/research/cyber-city-runtime-perf-survey.md`（§3.3 双轨口径 / §3.5 设计输入）· PERF-BR `docs/research/cyber-city-perf-optimization-features.md`（O1–O14 与 85 门合成检验 §5）· human-gate `docs/spec/human-gate-checklist.md` §5.4/§5.5 · 观测规格 `docs/spec/cyber-city-observability.md` §6 |
| 姊妹件 | 测试执行正本 = `docs/spec/cyber-city-perf-test-plan.md`（CITY-PERF-01/02 冻结规格 + CI 五步链）· 实现切分 = `docs/research/cyber-city-perf-impl-plan.md`（PR-A/B/C 序） |
| 消费方 | **CC-AL-PERF**（独立审计，唯一登记人）· 指挥官（真机执行人）· CC-PERF-C1/C2（实现）· 父代理看板（northStar.perf）· `docs/research/cyber-city-perf-rubric-score.json`（机读登记位） |
| 判定权威 | P1/P2/P3/P5 = **真机录测**（human-gate §5.4 + 本文件 §4 增补两行）；P4 = CI（audit-budget，本维 CI 即权威）；CI 证据包（CITY-PERF-01/02 + WS-PERF-01）只做下界哨兵，**永不替代**（§6） |

---

## 0. 结论先行（冻结清单）

1. **五维权重冻结**（功能 rubric §5 逐字镜像）：P1 帧率体感 30 / P2 1% low 20 / P3 加载可玩 20 / P4 预算 15 / P5 降档可感知 15 = **100%**（§2.1）。跨文档一致性是法条：任何一处改权重都必须两处同步 + 升版本号。
2. **85 门 = 数值门 + 五条结构门**（§3）：数值门 = 登记 `score ≥ 85` **且**真实缺口维 ≤1（顾问 §3.2「允许一处真实缺口，不允许两处」的机器化）；结构门 S1–S5（独立登记人 / 真机证据或豁免留痕 / CI 证据包同 commit / 脚本同源 / 回归面不塌）**逐条判定入登记 JSON**，任何一条不过则登记无效——数值可凑、结构门不可凑。
3. **真机表占位落地**（§4）：human-gate §5.4 既有四行（桌面双后端 20s / 安卓双后端 60s）+ 本文件增补两行（**Q2 降档安卓腿** / **Fast 4G 计时腿**）= 判定腿全集六行；回填正本恒为 human-gate 文件（增补两行由 PR-C 执行时追加至该表），本文件 §4.1 表为只读占位镜像。云端代理产不出真机读数——**留空不伪造**（human-gate §5.5 豁免留痕先例）。
4. **登记 JSON 契约冻结**（§5）：`docs/research/cyber-city-perf-rubric-score.json`，schema 与功能登记位同构 + perf 专属字段（`gates` 结构门逐条判定、`evidence.humanGate`/`ciEvidence`、`debts` 欠账清单）；任一维读数产不出 → 该维 `score: null` → 顶层 `score` 必须 `null`（northStar 显 `—`）——**禁止以预计值填充**（§5.1）。
5. **CI 数值判定零容忍**：SwiftShader（CI 软件光栅化，实测 ~1fps）读数只有下界哨兵价值；任何 60/30 帧率判定或 ≤8s 时长判定禁止进 CI（WS-PERF-01 文件头结论 + three.js 官方 CI 先例，PERF-RS §3.2 生态佐证）。CI 侧的全部职责冻结在姊妹件测试方案（CITY-PERF-01/02）。

---

## 1. 定位与口径铁律

**只称「world 运行时快不快」**：帧率体感、1% low 流畅度、加载到可玩、预算纪律、降档兜底五面。**不称**壳加载（LHCI `/` 已 P100，两轨分立是顾问 §3.1 冻结结论）、不称体验与玩法（功能 rubric）、不称视觉工艺（视觉 rubric）。

**口径铁律**（v1.0 起为本 rubric 法条）：

1. **双轨分工**：真机判定、CI 哨兵。P1/P2/P3/P5 的判定权威恒为真机录测；CI 证据包（下界读数 + 存在性硬断言 + 环境指纹）用于跨轮对照与回归护栏，**永不填入判定表、永不折算成维分**。
2. **脚本同源**：CI 采样动作脚本必须与真机 §4.1 行 1 动作脚本同源（变形 → 驾驶 20s 含 2 急转 + 1 撞道具 + 1 boost）；两轨读数互证的前提是被测负载同构。为凑读数裁剪采样窗/降负载/换轻量脚本 = 结构门 S4 击穿，登记无效。
3. **留空不伪造**：真机腿产不出时对应维 `score: null` + `debts` 欠账清单留痕；豁免走 human-gate §5.5 留痕先例（产品决策，非门禁降级）。禁止预计值、禁止用 CI 读数补位、禁止用旧轮读数冒充当轮。
4. **P4 是唯一 CI 权威维**：audit-budget 零 ❌ 二值判定，CI 即权威——本维不受铁律 1 约束（预算门本就是构建期机器事实）。

**分值标定（全局锚）**：

- **90-100** = 「任何目标设备上打开就玩，全程不觉得这是 3D 重站」——四腿帧率齐、加载无感、降档无感知损失；
- **70-85** = 主流设备流畅，存在**一处**可数缺口（如安卓单腿贴线、加载 8–10s）；
- **50-65** = 桌面可玩但安卓挣扎/加载超 10s——「演示级，不是产品级」；
- **30-45** = 主流桌面亦掉帧可感，或加载劝退；
- **0-25** = 不可用。

## 2. 五维权重与 0-100 锚点（冻结）

### 2.1 权重表（功能 rubric §5 逐字镜像）

各维 0-100 独立打分（5 的倍数，允许段内插值），**总分 = Σ(维分 × 权重)，四舍五入取整**。

| 维 | 权重 | 口径 | 判定权威 | 判定腿（§4.1） |
|----|:---:|------|----------|----------|
| P1 帧率体感 | 30% | 桌面双后端均值 ≥60 / 中端安卓 ≥30 | **真机录测** | 行 1–4 |
| P2 1% low | 20% | 桌面 ≥45（变形+驾驶 20s 脚本；FpsMeter `low1` 既有口径） | 真机 HUD + DevTools 互证 | 行 1–2 |
| P3 加载可玩 | 20% | Fast 4G「加载→robot_idle CTA 可用」≤8s（机读位 `funnel.robotIdle`） | 真机 throttle 秒表 + funnel 互证 | 行 6 |
| P4 预算 | 15% | audit-budget 零 ❌（既有 CI 硬门） | CI（本维 CI 即权威） | —（CI run） |
| P5 降档可感知 | 15% | `?quality=2` 完成核心路径且无功能性缺失 | S-5 L6 真人腿 + CITY-PERF-02 存在腿哨兵 | 行 5 + L6 |

### 2.2 逐维锚点

#### P1 帧率体感（30%）

被测：§4.1 行 1–4 四腿（桌面 WebGPU / 桌面 `?gl=1` / 安卓默认 / 安卓 `?gl=1`），动作脚本 = 变形 + 驾驶（桌面 20s / 安卓 60s），读数 = HUD FpsMeter 均值为主、DevTools Performance 互证。

| 分段 | 锚点 |
|:---:|------|
| 90-100 | 四腿全达标：桌面双后端均值 ≥60 且安卓双后端 ≥30，全程无肉眼可见掉帧段 |
| 70-85 | 单腿缺口且幅度轻（安卓一腿 26–29fps 或桌面一腿 52–59fps），其余三腿达标 |
| 50-65 | 两腿缺口、或单腿缺口幅度大但仍 ≥24fps 地板（三板斧/Quality 兜底候选区） |
| 30-45 | 安卓 <24fps（human-gate §2.2 三板斧触发线）或桌面 <45——止损裁决路径激活 |
| 0-25 | 桌面亦不足 30fps，驾驶不可用 |

#### P2 1% low（20%）

被测：桌面双后端「变形 + 驾驶 20s」脚本内 FpsMeter `low1` 读数（HUD `[data-ws-fps]` 第二数）+ DevTools Performance 长帧互证；变形落地窗与首驶首秒是已知尖峰区（PERF-BR O5 立项面）。

| 分段 | 锚点 |
|:---:|------|
| 90-100 | 双后端 1% low ≥45 且 Performance 轨道无红色长任务连片 |
| 70-85 | 单后端 40–44，或仅变形落地窗单次孤立尖峰（可归因、不复现于驾驶段） |
| 50-65 | 双后端 40–44，或驾驶段规律性 stall（首用 shader 编译尖峰未清） |
| 30-45 | 1% low <40，驾驶中顿挫频繁可感 |
| 0-25 | 持续卡停 |

#### P3 加载可玩（20%）

被测：桌面 Chrome DevTools Network「Fast 4G」throttle + 清缓存首访，「导航开始 → robot_idle CTA 可用」秒表计时，与 `__worldSession.dump().funnel.robotIdle` 机读位互证（两读数差 >1s 须归因留痕）。

| 分段 | 锚点（功能 rubric §5 三段冻结值照抄） |
|:---:|------|
| 100 | ≤8s |
| 70 | 8–10s |
| 40 | >10s |

（本维只此三段，段间不插值；秒表与 funnel 互证取较大值判定——对被试更诚实。）

#### P4 预算（15%）

被测：`node scripts/audit-budget.mjs dist/` 零 ❌（world JS ≤900KB gzip、壳零 world 字节、public ≤40MB 等全部既有门）。

| 分段 | 锚点 |
|:---:|------|
| 100 | 登记同 commit 的 CI run 零 ❌ |
| 0 | 任何 ❌（二值维，无中间段） |

#### P5 降档可感知（15%）

被测：S-5 L6 真人腿（`?quality=2` 完成变形 → 驾驶 → 进站核心路径）为判定；CITY-PERF-02 e2e 存在腿为 CI 哨兵。「反馈」= 降档状态可被玩家感知确认（档位可读/提示在场），「功能性缺失」= Q2 下核心路径任何一步不可达或输入失效。

| 分段 | 锚点 |
|:---:|------|
| 100 | 核心路径完整可完成 + 无功能性缺失 + 档位状态可感知 |
| 70 | 完成但反馈缺失（降档后无任何状态确认层——功能 rubric 铁律 2「半价」在本维的表达） |
| 0 | 核心路径不可完成 |

> v1 口径注记：自动降档（PERF-BR O1）合流前，P5 只考 `?quality=` 显式深链路径；O1 合流后「降档瞬间确认层（toast）」进入本维被测面——届时按 §7 版本条款升 v1.1 复核锚点，不许口头扩权。

### 2.3 合成检验（防凑分 sanity check）

权重最大单维仅 30%，凑分空间集中在 P1——审计时用下列算例校验打分单：

| 算例 | 合成 | 数值门 | 缺口计数 | 85 门 |
|------|:---:|:---:|:---:|:---:|
| 五维全 100 | 100 | ✓ | 0 | ✓ |
| P1=70（安卓单腿），余 100 | 91 | ✓ | 1 | ✓（允许的一处缺口） |
| P5=70（反馈缺失），余 100 | 95.5 | ✓ | 1 | ✓ |
| P3=70（8–10s），余 100 | 94 | ✓ | 1 | ✓ |
| P1=70 且 P5=70 | 86.5 | ✓ | **2** | **✗**（数值过、结构拒——两处真实缺口） |
| P1=70 且 P3=70 | 85 | ✓（贴线） | **2** | **✗** |
| P4=0（预算击穿），余 100 | 85 | ✓（贴线） | 1 | **✗**（S5 回归面不塌同时击穿——预算红是硬回归） |

**结论**：单靠 Σ 加权 ≥85 不构成通过；缺口计数与结构门是 85 门语义的主体（§3）。

## 3. 85 门：数值门 + 五条结构门（冻结）

**门语义**（功能 rubric §7「四层分工，各守各门」在性能轨的表达——结构门是**必要条件**，谁也不许替谁签字）：

**数值门**：登记 JSON 顶层 `score ≥ 85`，且**真实缺口维 ≤1**（缺口维 = 锚点落段 <85 的维；`null` 维不算缺口——它直接使顶层 score 为 null，连数值门都到不了）。

**结构门 S1–S5**（逐条判定入登记 JSON `gates.structural`，缺一登记无效）：

| # | 结构门 | 判定口径 | 对应禁令 |
|---|--------|----------|----------|
| S1 | 独立登记人 | `scoredBy` = CC-AL-PERF（独立审计，模型自报）；出现实现方署名即无效 | 禁止清单 1 |
| S2 | 真机证据或豁免留痕 | P1/P2/P3/P5 逐维引用 §4.1 判定腿记录行（三件套归档路径）；产不出的腿 = 该维 `null` + `debts` 清单 + human-gate §5.5 豁免留痕（若走豁免） | 禁止清单 8 |
| S3 | CI 证据包同 commit | 登记 `subject` commit 上：`test-results/city-perf-evidence.jsonl` 当轮行在档（CITY-PERF-01 全量行 + CITY-PERF-02 精简行）+ WS-PERF-01 照常产出 + audit-budget 零 ❌；`evidence.ciEvidence` 引用之并标注「下界哨兵非判定」 | 禁止清单 4 |
| S4 | 脚本同源 | CI 采样动作脚本与 §4.1 行 1 逐项同源核对（测试方案 §2.1 协议 = 本文件行 1 脚本的 e2e 化）；采样标定与 WS-PERF-01 同源（横比前提）；任何为凑读数的裁剪即击穿 | 铁律 2 |
| S5 | 回归面不塌 | 登记同 commit：e2e 全量绿（含 CITY-PERF-01/02）+ LHCI 不降 + `ritual_idle`/poster 恒等 + reduced-motion 双轨 + audit-budget 零 ❌——必要条件非充分条件（功能测试方案 §5-10 同构） | 功能测试方案 §5 |

## 4. 真机取证协议 + human-gate §5.4 真机表占位

### 4.1 判定腿总表（六行 · 只读占位镜像，回填正本 = human-gate §5.4）

方法论全文沿 human-gate §2.0–§2.2（设备选型 / 双后端 / 三件套归档纪律）；对象一律生产 `/`（或 preview 产物，记录表注明）；动作脚本 = **变形 → 十字路口驾驶**（含 2 次急转 + 1 次撞道具 + 1 次 Shift boost——与 CITY-PERF-01 采样脚本同源，S4 结构门依据）。

| # | 腿 | 设备/条件 | 场景/时长 | 读数与门 | 计分维 | 状态 |
|---|----|-----------|----------|----------|:---:|:---:|
| 1 | 桌面 WebGPU | 桌面 Chrome 最新稳定版 | 变形+驾驶 20s | FPS 均值 ≥60 · 1% low ≥45 | P1 P2 | 【待填】 |
| 2 | 桌面 WebGL 2 | 同上 + `?gl=1` | 变形+驾驶 20s | 同上 | P1 P2 | 【待填】 |
| 3 | 安卓默认 | 2019 后中端档（Adreno 61x / Mali-G5x 级） | 变形+驾驶 60s | 持续 ≥30fps（<24fps 触发三板斧，human-gate §2.2-6） | P1 | 【待填】 |
| 4 | 安卓 WebGL 2 | 同上 + `?gl=1` | 变形+驾驶 60s | 同上 | P1 | 【待填】 |
| 5 | **Q2 降档腿（增补）** | 行 3 同设备 + `?quality=2` | 变形+驾驶 60s + E 进站 | 帧率读数留档（对照行 3 增益）+ 核心路径完成 + 无功能性缺失 | P5（P1 对照） | 【待填】 |
| 6 | **Fast 4G 计时腿（增补）** | 桌面 Chrome + DevTools Network Fast 4G + 清缓存 | 加载 → robot_idle | 秒表 + `funnel.robotIdle` 互证 ≤8s | P3 | 【待填】 |

**占位纪律**：行 1–4 为 human-gate §5.4 既有四行的镜像；行 5–6 为本 rubric 增补，PR-C 执行时**追加至 human-gate §5.4 表**（该文件恒为回填正本与签字位，本表不回填数字，只更新「状态」列为指向记录行的引用）。三件套归档 `docs/spec/assets/human-gate/`，命名 `cityperf_<desktop|android>_<webgpu|gl2|q2|fast4g>_<yyyymmdd>.<mp4|png>`。

### 4.2 执行环境与工具箱（零采购，PERF-RS §3.6 收编）

| 工具 | 用途 |
|------|------|
| HUD `[data-ws-fps]`（FpsMeter avg / 1% low） | P1/P2 主读数，截图三件套之一 |
| Chrome DevTools Performance | 桌面 20s 录制互证 + CPU 4x throttle 腿；CPU/GPU 归因分叉 |
| `chrome://inspect` | 安卓远程调试（human-gate §2.2 既有） |
| `#debug` 面板 | drawCalls/triangles/FPS 走查（OBS-C2 已合）；GPU ms 行为 v1.1 裁决点（§7.1） |
| Spector.js / Perfetto | 异常归因深挖（本地工具，不进仓库） |

### 4.3 CI 侧证据引用纪律

CI 证据包（`city-perf-evidence.jsonl` + `world-spike-metrics.jsonl`）在登记中的唯一合法用途：① S3 结构门在档性判定；② 跨轮下界趋势对照（同环境 `ci: true` 行互比）；③ drawCalls/triangles 负载基线（环境无关，唯一可跨环境硬比读数）。**禁止**：填入 §4.1 表、折算维分、以「CI 读数 < 真机门」为由预判不过或以「CI 达标」为由预判通过。

## 5. 登记 JSON 契约（冻结）

### 5.1 登记纪律

1. **唯一登记人** = CC-AL-PERF（独立审计）；真机腿执行人 = 指挥官（判定与签字不可委托，human-gate 文件头纪律）；实现方自评永不登记。
2. **登记文件的诚实状态机**：文件不存在（northStar 显 `—`）→ 首轮登记（可含 `null` 维——真机产不出的维留空 + `debts` 清单，此时顶层 `score` 必须 `null`，northStar 仍显 `—`）→ 全维读数齐 + 双门判定后 `score` 首次出数。**禁止预登记草稿填数**：`score` 出现数值当且仅当五维读数齐且结构门 S1–S5 判定完成。
3. 重打分只改分值与证据，不改 schema；改维度/权重/锚点须升 `rubricVersion` 并同步本文件（§7）。

### 5.2 `docs/research/cyber-city-perf-rubric-score.json` schema

```jsonc
{
  "schemaVersion": "1.0.0",
  "score": null,                    // 0-100 整数 = 合成总分（唯一机读位）；任一维 null 时必须 null
  "target": 85,
  "subject": "被评对象：分支/PR/commit + 一句话交付面描述",
  "rubric": "docs/spec/cyber-city-perf-rubric.md",
  "rubricVersion": "1.0",
  "scoredAt": "YYYY-MM-DD",
  "scoredBy": "CC-AL-PERF 独立审计（模型自报）——实现方自评永不登记",
  "gates": {
    "numeric": { "pass": false, "gapDimensions": [], "rule": "score ≥85 且真实缺口维 ≤1（§3）" },
    "structural": {
      "s1IndependentScorer":  { "pass": false, "evidence": "" },
      "s2RealDeviceEvidence": { "pass": false, "evidence": "§4.1 记录行引用 或 豁免留痕 + debts" },
      "s3CiEvidencePackage":  { "pass": false, "evidence": "同 commit jsonl 行 + WS-PERF-01 + audit-budget run" },
      "s4ScriptParity":       { "pass": false, "evidence": "CI 脚本 ↔ §4.1 行 1 同源核对记录" },
      "s5RegressionIntact":   { "pass": false, "evidence": "e2e / LHCI / 恒等 / reduced-motion / 预算 同 commit 核对" }
    }
  },
  "evidence": {
    "humanGate": "human-gate-checklist.md §5.4 记录行引用（或 §5.5 豁免留痕 + 欠账清单）",
    "ciEvidence": "test-results/city-perf-evidence.jsonl 同 commit 行（下界哨兵非判定）+ world-spike-metrics.jsonl 行",
    "recordings": ["docs/spec/assets/human-gate/cityperf_*（命名含腿别与日期）"],
    "hudShots": ["同上 png"],
    "environment": "生产 / preview + 浏览器版本 + 设备型号/SoC + 清存储确认"
  },
  "dimensions": {
    "p1FrameRate":      { "label": "帧率体感",   "weight": 0.30, "score": null, "evidence": "≥1 记录行 + ≥1 录屏/截图引用" },
    "p2OnePercentLow":  { "label": "1% low",     "weight": 0.20, "score": null, "evidence": "" },
    "p3LoadToPlayable": { "label": "加载可玩",   "weight": 0.20, "score": null, "evidence": "秒表 + funnel.robotIdle 互证" },
    "p4Budget":         { "label": "预算",       "weight": 0.15, "score": null, "evidence": "CI run 链接/工件（本维可只引 CI）" },
    "p5QualityFallback":{ "label": "降档可感知", "weight": 0.15, "score": null, "evidence": "S-5 L6 腿记录 + CITY-PERF-02 绿" }
  },
  "debts": ["真机欠账清单：产不出的腿逐条列出（腿号 + 原因 + 补测前置）"],
  "notes": "一段话结论 + 合成算式（Σ 维分×权重 → 取整）+ 缺口计数"
}
```

### 5.3 登记有效性校验（缺一登记无效）

1. `dimensions[*].weight` 合计 = 1 且与 §2.1 一致；`score` 非 null 时 = Σ(维分×权重) 取整（±1 归整差）且五维 `score` 全非 null；
2. `gates.structural` 五条逐条有 `pass` 判定与证据引用；`gates.numeric.gapDimensions` 与逐维锚点落段一致；
3. 每个非 null 维 `evidence` 非空且含 §4.1 记录行或 CI run 引用（P4）；`null` 维在 `debts` 有对应行；
4. `subject` 含可复现 commit；`scoredBy` = 独立审计（出现实现方署名即无效）；
5. 同 commit 回归面不塌（S5——必要条件非充分条件）。

## 6. 与 score-loop / 四层 / e2e 的关系

**northStar 读数合同**（观测规格 §6.4 冻结、`scripts/score-loop.mjs` 已落地实测）：`northStar.perf` 恒读本登记位顶层 `score`；文件缺失或 `score` 非数值 → `null` + sources 注记「（缺失）」，看板显 `—` 禁估值。综合分五维权重（25/15/20/25/15）零改动，性能分**不折算**进综合分——北极星四数（视觉 98 · 功能 90 · **性能 85** · 综合 98）各自独立取证。

**性能轨四层（谁也不许替谁签字）**：

| 层 | 测什么 | 门 |
|----|--------|-----|
| CI 证据包（CITY-PERF-01/02 + WS-PERF-01，测试方案正本） | 链路存在性硬断言 + 下界读数留档 + 负载基线 | 硬断言**挡合并**；读数软门（annotation 不阻断） |
| 真机 human-gate（§4.1 六腿） | P1/P2/P3/P5 判定读数 | **挡登记** |
| AL-PERF 审计 | 数值门 + 结构门双门判定、登记 JSON 写入与 §5.3 校验 | **唯一登记出口** |
| northStar.perf | 只读汇总 | 无门（汇总非判定） |

**与功能 rubric 的交接**：功能 rubric §5「性能 rubric v1（并入正本）」自本文件冻结起转为镜像；其 §6.2 的 perf 登记位 schema 草案由本文件 §5.2 取代为全量正本。指针注记（两处各一行「正本已迁 `cyber-city-perf-rubric.md`」）随 PR-A 落地——加法不改秤，不触发功能 rubric 升版。

## 7. 版本纪律与禁止清单

**版本纪律**：改维度/权重/锚点段位 → 本文件版本 +1 并同步登记 JSON `rubricVersion` 与功能 rubric §5 镜像；登记 JSON schema 破坏性变更 → `schemaVersion` 主版本 +1；改 §4.1 判定腿集合（增删腿/改门值）→ 版本 +1 且 human-gate 表同 PR 同步。任何改秤必须走本文件 PR 留痕，不许口头改秤。

### 7.1 方法论增补预留位（v1.1 裁决点，登记不等它们）

| 裁决点 | 内容 | 依据 |
|--------|------|------|
| `#debug` GPU ms 行 | three 0.185 内建 `trackTimestamp` + `resolveTimestampsAsync`（仅 `#debug` 挂载时开）——真机 P1/P2 不达标时「CPU 帧循环慢 vs GPU 渲染慢」第一归因分叉 | PERF-RS §3.2 |
| LoAF 长帧归因 | `PerformanceObserver`（`long-animation-frame`，Chrome 123+）进 CITY-PERF-01 证据 JSON——stall 帧「谁吃的」拆解 | PERF-RS §3.5 软门表 |
| 负载回归护栏转软门 | drawCalls/triangles 相对上轮同环境行漂移 >+20% → annotation（v1 只留档；积累 ≥2 轮基线后启用） | PERF-BR O4 + PERF-RS §3.5 |
| 分档采样矩阵 | `?quality=0\|1\|2` 分档读数对照（梯退表实效反向验证）——真机轨优先，CI 矩阵按需 | PERF-BR O4 |

**禁止清单**（功能 rubric §8 八条对本 rubric 的约束力全文继承，此处列直接绑定项）：

| # | 禁止 | 本文件锚 |
|---|------|----------|
| 1 | 实现代理自评登记性能分 | §3-S1 / §5.1 |
| 2 | 用 CI 证据包读数/软门通过率冒充性能分 | §4.3 / §6 |
| 4 | CI SwiftShader 时长/帧率读数充当真机判定 | §1 铁律 1 / §3-S3 |
| 8 | 真机表伪造或以预计值填充；产不出就留空列欠账 | §1 铁律 3 / §5.1 |
| — | 为凑读数裁剪脚本/采样窗/负载（本 rubric 新增执行面） | §1 铁律 2 / §3-S4 |
| — | 两处真实缺口靠数值合成蒙混（85 贴线凑分） | §2.3 / §3 |

---

*CC-PERF-DES v1.0 · 2026-08-27 — 性能 rubric 独立正本冻结：五维权重（30/20/20/15/15，功能 rubric §5 镜像）+ 逐维 0-100 锚点分段 + 85 门（数值门「≥85 且缺口 ≤1」+ 五条结构门 S1–S5）+ 真机判定腿六行（human-gate §5.4 四行镜像 + Q2 降档腿 / Fast 4G 计时腿增补占位）+ 登记 JSON 全量 schema（gates/debts 字段、null 语义、预登记禁令）。仅文档交付，`src/` 与 e2e 零改动；姊妹件 = 测试方案 `cyber-city-perf-test-plan.md` + 实现方案 `cyber-city-perf-impl-plan.md`。*
