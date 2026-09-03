# 独立对抗审计报告 v2｜R-1/R-2 整改复核 + 前两轮 NO_GO 复审

- 仓库：`rayw-lab/website`
- 被审快照：`main@4ef7ed4cc9db9bde92180b8498bac7104951dd1d`（#224 合并后，R-1/R-2 交付终点）
- 审计收口时远端主干：`main@fbb09ebdbf929f60e8025187a429ba334acab86b`（#226；后续 #225/#226 未改写本案核心证据）
- 生成时间：`2026-09-02T13:48:45Z`
- 模式：**只读 / 零 Git 写操作 / 未运行 Playwright、Node / 未下载二进制 artifact**

## Executive Verdict

> **FAIL / NO_GO**

综合分 **94** 与视觉登记 **76** 的算术成立；R-1 的 rotY 重放、AABB 修正和 H11/H12 分层也基本成立。  
但本案仍不满足 v2 放行条件：

1. **存在 5 项 `REFUTED`**。最短反证链是：
   - #224 PR 正文声称 #223 只有 3 个文件、audit prompt 与 paradigm 都没提交，并称 #224 补 2 个文件；
   - #223 changed-files API 实际为 4 个文件，且包含 `cc-loop-audit-prompt-v2.md`；
   - #224 changed-files API 实际只有 `cyber-city-orchestration-paradigm.md` 1 个文件。
2. R-2 的两份评审仍为同一模型，时间戳缺失/父代补录，无可验证签名或不可变会话证据，**独立性仍是 `UNVERIFIED`**。
3. #220 的历史 append-only 违规真实存在；R-1 建立的是向前纪律，不能倒推出历史从未违规。
4. 前两轮审计至少两项严重性判断应降级，但不能据此宣布两份 NO_GO 已被整体推翻。

**门禁统计：** `P0=0`；`REFUTED=5`；因此按任务书“任一 REFUTED/P0 → FAIL”直接拒绝放行。

---

## 1. 审计范围、能力边界与锚点

### 1.1 被审链条

| 阶段 | PR | 合并 SHA | 本报告定位 |
|---|---:|---|---|
| 首次视觉登记 | #218 | `3c17ca61b27333074d261b90534835d9e6b80edb` | 视觉 73→76 |
| OK-2 看板登记 | #219 | `82cfd95c99684716dd7d5b175e16b7f487bd5867` | 综合 94 / 视觉 76 |
| 原位勘误 | #220 | `cb72a694ae5413cb88442c6e28e9f40059de13fe` | append-only 违规发生点 |
| 整改路线图 | #221 | `3cf1552c4468a10dab16e4e9118e1fc1f56a24d4` | A/B 指控重述与 R-1/R-2 计划 |
| R-1 | #222 | `23b7032af8a8914c5860c2804d0de1f4ae98d621` | 几何、谱系、append-only 归位 |
| R-2 | #223 | `1a1774da67bc90a338968f02c8daccca96148b64` | 双评重跑、audit prompt |
| R-2 补交 | #224 | `4ef7ed4cc9db9bde92180b8498bac7104951dd1d` | 仅补 paradigm 四行 |
| 审计后续 | #225/#226 | `e573dc8` / `fbb09ebdbf929f60e8025187a429ba334acab86b` | R-3 取证/提案，未修正本报告反证 |

### 1.2 证据等级

- `INDEPENDENTLY_VERIFIED`：亲自抓取固定 SHA/API 字节并复算。
- `TRUST_BASED(receipt)`：运行时结果无法在边界内重跑或二进制 artifact 无法解包，只核元数据与内部一致性。
- `UNVERIFIED`：缺少可验证原件。
- `REFUTED`：被两个或以上底层 URL 直接反证。

---

## 2. Claim → Proof 总表

| ID | 被审 claim | 判定 | 证据等级 | 独立核验摘要 | URL |
|---|---|---|---|---|---|
| CHAIN-01 | R-1/R-2 被审终点为 #224 merge 4ef7ed4；审计收口时 main 已到 #226 merge fbb09eb，后两 PR 未回写本案核心文件。 | **VERIFIED** | `INDEPENDENTLY_VERIFIED` | #224/#225/#226 PR 元数据与 changed-files API；#225 仅 sky-forensic，#226 仅其三件继承项+治理/handoff/备忘。 | https://api.github.com/repos/rayw-lab/website/pulls/224<br>https://api.github.com/repos/rayw-lab/website/pulls/225/files?per_page=100<br>https://api.github.com/repos/rayw-lab/website/pulls/226/files?per_page=100 |
| REC-R1-01 | #222 Validation：3 文件、+13/−0。 | **REFUTED** | `INDEPENDENTLY_VERIFIED` | PR API 为 changed_files=5、additions=133、deletions=0；changed-files API 也列出 5 路径。 | https://api.github.com/repos/rayw-lab/website/pulls/222<br>https://api.github.com/repos/rayw-lab/website/pulls/222/files?per_page=100 |
| REC-R2-01 | #223 Changed Files 含范式文档，共 5 文件。 | **REFUTED** | `INDEPENDENTLY_VERIFIED` | PR API 为 4 文件；实际包含 audit prompt，但不含 paradigm。 | https://api.github.com/repos/rayw-lab/website/pulls/223<br>https://api.github.com/repos/rayw-lab/website/pulls/223/files?per_page=100 |
| REC-R2-02 | #224 confession：#223 仅 3 件且 audit prompt/paradigm 都未提交；#224 补 2 文件。 | **REFUTED** | `INDEPENDENTLY_VERIFIED` | #223 实际 4 件且 audit prompt 已提交；#224 实际仅 1 件 paradigm。 | https://api.github.com/repos/rayw-lab/website/pulls/224<br>https://api.github.com/repos/rayw-lab/website/pulls/223/files?per_page=100<br>https://api.github.com/repos/rayw-lab/website/pulls/224/files?per_page=100 |
| C1-HIST | SEC-R13 ledger 合并后始终 append-only。 | **REFUTED** | `INDEPENDENTLY_VERIFIED` | #220 对已合并块做 +2/−1 原位编辑。Git 历史仍在，但本项目自立 append-only 合同被违反。 | https://api.github.com/repos/rayw-lab/website/pulls/220<br>https://api.github.com/repos/rayw-lab/website/pulls/220/files?per_page=100 |
| C1-FWD | R-1 之后，ledger 勘误改为新增 SEC-R14，目标看板未再被 #223/#224/#225/#226 删除式改写。 | **VERIFIED** | `INDEPENDENTLY_VERIFIED` | #222 整体 deletions=0；后续四个 PR changed-files 均不含该看板。 | https://api.github.com/repos/rayw-lab/website/pulls/222<br>https://api.github.com/repos/rayw-lab/website/pulls/223/files?per_page=100<br>https://api.github.com/repos/rayw-lab/website/pulls/224/files?per_page=100<br>https://api.github.com/repos/rayw-lab/website/pulls/225/files?per_page=100<br>https://api.github.com/repos/rayw-lab/website/pulls/226/files?per_page=100 |
| C2-ROTY | R-1 replay 的 seed、NE 三件 rotY、AABB 与 S2 nose 包含关系。 | **VERIFIED** | `INDEPENDENTLY_VERIFIED` | 逐行对译 FNV-1a/mulberry32：seed=3416619534；NE=-131.6617/-141.6989/-139.7073°；nose(15.77, -15.78) inside S2=True。 | https://raw.githubusercontent.com/rayw-lab/website/50c33d9b98b86155c31ae2749ddbf68bd75bde4c/src/lab/world/city/CityMap.ts<br>https://raw.githubusercontent.com/rayw-lab/website/50c33d9b98b86155c31ae2749ddbf68bd75bde4c/src/lab/world/city/StreetProps.ts<br>https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/tools/streetprops-roty-replay.mjs<br>https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-vis-x2-collider-aabb-20260902.md |
| C2-H11H12 | 静态中心线正穿 H11，不是 H12；动态右漂 nose 命中 H12/S2 是另一层叙述。 | **VERIFIED** | `INDEPENDENTLY_VERIFIED` | 直线 (20,-8)→(28,-28) 在 H12 z 带对应 x≈22.82–23.18，落 H11 x=[21.55,23.45]，不落 H12 x=[25.02,26.98]。 | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-vis-x2-collider-aabb-20260902.md<br>https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-vis-x2-obs-r2-diagnosis.md |
| C3-FIX | 最小修复增量 5987641..ad93ed1 没有更改 test.setTimeout；主要新增东弧途径点和两份诊断档。 | **VERIFIED** | `INDEPENDENTLY_VERIFIED` | compare API 仅 4 文件；父/子同一行均为 OBS test.setTimeout(1_800_000)，新增 route hunks。 | https://api.github.com/repos/rayw-lab/website/compare/598764172250f3a0d6e5a29c36aa564dbd44e009...ad93ed1efcce66ea9367bb3ca40a95b811c9e393<br>https://raw.githubusercontent.com/rayw-lab/website/598764172250f3a0d6e5a29c36aa564dbd44e009/e2e/cyber-city-observability.spec.ts<br>https://raw.githubusercontent.com/rayw-lab/website/ad93ed1efcce66ea9367bb3ca40a95b811c9e393/e2e/cyber-city-observability.spec.ts |
| C10-FULL | PR #104 全历史确有 timeout 放宽。 | **VERIFIED** | `INDEPENDENTLY_VERIFIED` | 最终 PR diff：OBS test.setTimeout 1.5M→1.8M；PERF 1.2M→1.5M。 | https://api.github.com/repos/rayw-lab/website/pulls/104/files?per_page=100<br>https://github.com/rayw-lab/website/pull/104.diff |
| C10-PEDIGREE | R-1 文档把上述净变化精确归因于 c912b49/97223b8。 | **REFUTED** | `INDEPENDENTLY_VERIFIED` | c912 的直接 patch 是 OBS 1.5M→2.7M、0.9M→1.5M，且 navigate 0.9M→1.8M；972 是 navigate 1.8M→3.0M。它们是历史谱系节点，但不是文档所写净变化的直接、完整归因。 | https://api.github.com/repos/rayw-lab/website/commits/c912b49f6aea0f07bf71b74d58399ebe83c568a5<br>https://api.github.com/repos/rayw-lab/website/commits/97223b8333be48b6b762380c6e208dbb496252aa<br>https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cyber-city-score-loop-orchestration.md<br>https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-loop-audit-prompt-v2.md |
| C4-AGG | R3 全量窗 aggregate：86 expected / 0 unexpected / 0 skipped / 0 flaky。 | **VERIFIED** | `INDEPENDENTLY_VERIFIED` | 原始 Playwright JSON stats 与 e2e-summary 聚合字段一致；workers=1、retries=0 也可见。 | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-vis-x2-full-r3-evidence/e2e-results.json<br>https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-vis-x2-full-r3-evidence/e2e-summary.json |
| C4-DETAIL | 全部 86 个 spec 均 results.length=1 且每个 retry=0。 | **TRUST_BASED(receipt)** | `TRUST_BASED(receipt)` | 浏览器文本中可抽样见单 result/retry0，但本次边界内未对 86 项做完整机器遍历。 | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-vis-x2-full-r3-evidence/e2e-results.json |
| C5-SCHEMA | e2e-summary 的 totalTests=86、totalFiles=19 口径已分离，历史 R2 摘要以追加式 erratum 纠正。 | **VERIFIED** | `INDEPENDENTLY_VERIFIED` | 当前 summary 字段分离；#216 文件列表显示新增 erratum/evidence，而非把历史快照伪装为原始未变事实。 | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-vis-x2-full-r3-evidence/e2e-summary.json<br>https://api.github.com/repos/rayw-lab/website/pulls/216/files?per_page=100 |
| C6-CI-ID | CI run 与 Lighthouse artifact 身份链存在且 run SUCCESS、artifact 未过期、head SHA 可核。 | **VERIFIED** | `INDEPENDENTLY_VERIFIED` | run 33589801653 conclusion=success、head=6f691fce；artifact 9831423112 size=6,805,356、expired=false、digest 存在。 | https://api.github.com/repos/rayw-lab/website/actions/runs/33589801653<br>https://api.github.com/repos/rayw-lab/website/actions/runs/33589801653/artifacts<br>https://api.github.com/repos/rayw-lab/website/actions/artifacts/9831423112 |
| C6-LHCI | artifact 内两 URL 四项中位数均为 100。 | **TRUST_BASED(receipt)** | `TRUST_BASED(receipt)` | 二进制 zip 按能力边界未下载/解包；只验证了 artifact 元数据与登记 JSON 自洽。 | https://api.github.com/repos/rayw-lab/website/actions/artifacts/9831423112<br>https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/quality-score-r3.json |
| C7-INDEP | R-2 已完成“单模型双会话 + 签名收据”的可验证独立评审。 | **UNVERIFIED** | `UNVERIFIED` | 两份均为 gpt-5.6-terra；A timestamp=UNAVAILABLE，B 由父代补录；无可验证签名/会话 ID/工具原始日志，隔离仅自述。 | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-alvis-r3-eval/r2-eval-a.json<br>https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-alvis-r3-eval/r2-eval-b.json<br>https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cyber-city-visual-rubric-score.json |
| C8-SCORE | 综合分 94、视觉登记 76、R2 仲裁仍为 76。 | **VERIFIED** | `INDEPENDENTLY_VERIFIED` | 综合=94.00；原视觉 raw=76.30→76；R2 A=74.75→75、B=82.00→82、仲裁=76.25→76。 | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/quality-score-r3.json<br>https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cyber-city-visual-rubric-score.json<br>https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/scripts/score-loop.mjs |
| R2-DOCS | R2-2 replay、R2-3 范式坑 13–16、R2-4 audit prompt v2 的最终字节均已落库。 | **VERIFIED** | `INDEPENDENTLY_VERIFIED` | replay 随 #222；audit prompt 随 #223；paradigm 四行随 #224。最终交付齐，但补交叙述不真。 | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/tools/streetprops-roty-replay.mjs<br>https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-loop-audit-prompt-v2.md<br>https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cyber-city-orchestration-paradigm.md<br>https://api.github.com/repos/rayw-lab/website/pulls/223/files?per_page=100<br>https://api.github.com/repos/rayw-lab/website/pulls/224/files?per_page=100 |
### 2.1 计数

- `VERIFIED`：11
- `REFUTED`：5
- `TRUST_BASED(receipt)`：2
- `UNVERIFIED`：1
- 可由本审直接建立或反证的文本/算术事实：**16**
- 仅收据可信：**2**
- 无法验证：**1**

---

## 3. R-1 复核

### 3.1 append-only：历史失败，向前整改成立

#220 的 PR API 给出 `+2/−1`，且内容是对已合并 SEC-R13 块的原位措辞修改。执行方自己把 ledger 定义成 append-only 后，这一操作就是合同违规。  
#222 随后以新增 SEC-R14/ERRATA 的方式承认并追认，且 #222 自身 `deletions=0`；#223–#226 没再触碰该看板。因此：

- “历史从未违反 append-only”＝`REFUTED`；
- “R-1 后采用向前追加式纪律”＝`VERIFIED`；
- 历史违规的事实影响半径：**不改变 94/76，但改变证据链合规性**。

### 3.2 rotY 重放与 AABB

独立逐行对译源码：

- FNV-1a 输入：`x2-street-props`
- seed：`3416619534`
- PRNG：mulberry32，调用顺序为六簇 × 三件

东北簇复算：

| 物件 | rotY | 世界中心 | 世界 AABB |
|---|---:|---|---|
| PropVending | -131.661732° | (17.800000, -17.800000) | x=[17.009325, 18.590675], z=[-18.604675, -16.995325] |
| PropCabinet | -141.698862° | (16.456497, -16.456497) | x=[15.580768, 17.332226], z=[-17.266238, -15.646756] |
| PropBin | -139.707300° | (19.072792, -19.072792) | x=[18.165777, 19.979807], z=[-19.927581, -18.218003] |

18 个 rotY 的统计：

- mean = `27.241322466°`
- median = `14.822957296°`
- 单侧各裁一值 trimmed mean = `27.378059149°`
- min/max/span = `-141.698862208° / 193.993720213° / 335.692582421°`
- finite rate = `100%`
- 精确值众数集中度 = `5.56%`，不存在“≥60% 完全同值集中”。

S2 Cabinet 修正 AABB 为：

- x=`[15.580768, 17.332226]`
- z=`[-17.266238, -15.646756]`

文档 nose 点 `(15.77, -15.78)` **仍在 S2 内：`true`**。  
因此前审 B 证明“旧 rotY 数字算错”是对的；但其若进一步断言“根因整体崩塌”，则不成立。按 v2 影响半径规则，此项不能维持 P0。

### 3.3 H11 / H12

对静态线段 `(20,-8)→(28,-28)`：

- 参数式：`x=20+8t, z=-8-20t`
- H12 的 z 带 `[-15.94,-15.06]` 对应 `x≈22.824–23.176`
- 该 x 落入 H11 `[21.55,23.45]`，不落入 H12 `[25.02,26.98]`

所以应写成：

1. **静态中心线层**：正穿 H11；
2. **控制器动态偏移层**：运行时 nose 右漂后可能嵌入 H12/S2。

执行方 R-1 的分层勘误方向正确；运行时“6 escapes/350.2s、0 escapes/49s”仍只能标 `TRUST_BASED(receipt)`。

### 3.4 C10：不能只选一个 scope

| Scope | 独立结果 | 裁决 |
|---|---|---|
| PR #104 全历史 | OBS `test.setTimeout 1.5M→1.8M`；PERF `1.2M→1.5M` | 前审抓到的字节事实成立 |
| 最小 fix `5987641..ad93ed1` | timeout 值前后相同，仅新增东弧路线与诊断文件 | 不应把 full-history 变化算成该 fix 的新增违规 |
| R-1 谱系说明 | c912/972 是历史节点，但直接 patch 与文档所写净变化不一致 | 精确归因 `REFUTED` |

因此，“前审 C10 全错”与“整改增量仍改了 timeout”都不成立。正确结论是：**full PR 有变化，fix increment 无变化；原审计 scope 决定其程序性裁决是否成立。** 原 A/B 任务书未保存，无法终局判断其原 scope。

---

## 4. R-2 复核

### 4.1 评分算术

视觉权重：`20% / 20% / 15% / 15% / 15% / 10% / 5%`

- 原登记维度：`[79, 76, 80, 75, 71, 76, 76]`
  - `76.30 → round = 76`
- R2-A：`[80, 80, 75, 70, 70, 70, 70]`
  - `74.75 → round = 75`
- R2-B：`[85, 80, 80, 85, 80, 80, 85]`
  - `82.00 → 82`，不是自报 83
- A/B 差：`|75−82|=7>5`，仲裁门仍触发
- 仲裁维度：`[80, 80, 75, 75, 70, 75, 75]`
  - `76.25 → round = 76`

**影响半径：** B 的 83→82 算术修正不改变门限、不改变仲裁、不改变最终 76。

### 4.2 独立性没有闭环

两份 JSON 的共同问题：

- `model_slug` 都是 `gpt-5.6-terra`；
- A 的时间戳为 `UNAVAILABLE`；
- B 明示时间戳由父代补录；
- `signedReceipt` 没有公钥、签名值或可验证签名算法；
- “未见他人评分”“不同会话”是自述，无不可变会话 ID；
- 帧 hash 只回显截断值，未附原始工具日志。

所以：

- “重评分与逐维仲裁已完成”＝`VERIFIED`；
- “可验证的独立双评已完成”＝`UNVERIFIED`；
- “R-2 可消项全部闭环”＝不成立。

### 4.3 最终字节齐，但补交说明不真

最终快照确实包含 replay、audit prompt v2、paradigm 坑 13–16。问题不是“文件最终还缺”，而是：

- audit prompt 在 #223 已入库；
- paradigm 才是在 #224 补入；
- #224 的 confession 把缺失范围扩大，并写错 changed-files。

“最终交付齐”不能推出“整改收据真实”。

---

## 5. 综合分复算与鲁棒性

### 5.1 当前登记

```text
LHCI /        100 × 0.25 = 25
LHCI /home/   100 × 0.15 = 15
e2e           100 × 0.20 = 20
visual         76 × 0.25 = 19
smoke3d       100 × 0.15 = 15
--------------------------------
availableWeight = 1.00
composite = 94.00
```

与 `quality-score-r3.json` 的 `94 / availableWeight=1 / missing=[]` 一致。

### 5.2 What-if

- visual=85 → `96.25`
- visual=0 → `75`
- e2e=95、其余不变 → `93`
- visual 缺失时按现脚本对 75% 可用权重归一化 → `100`

最后一项不是本轮登记错误，因为当前 `missing=[]`；但说明 `--min` 不能单独作为完整性门，必须同时硬断 `missing=[]`。

### 5.3 Fuzz 发现

`score-loop.mjs` 对 CLI visual override 校验 `[0,100]`，对 JSON 文件里的 `score` 只检查 `typeof number`：

- visual=`-1` → 可算出 `74.75`
- visual=`101` → 可算出 `100.25`
- visual=`"76"` → 被当作缺失，可能归一化为 `100`

当前输入合法，影响半径为 0；建议把范围与 finite 检查统一到所有输入源。

---

## 6. 前两轮 NO_GO 裁决复审

由于仓库未保存审计 A/B 原文与原任务 scope，下表是对整改路线图所重述指控的复核，不冒充逐句原文复审。

| 指控 | 技术事实复核 | 严重性复审 | 对 NO_GO 的影响 |
|---|---|---|---|
| 审计 A：#220 append-only | 成立 | P0→P1 | 当时 NO_GO 方向可维持；但它证明流程合同被破坏，不证明 94/76 造假。 |
| 审计 B：rotY 人工复刻 | 算术错误成立；根因崩塌不成立 | P0→P2 | 修正 AABB 后 S2 仍命中，影响半径 0；不得单凭此项 NO_GO。 |
| 审计 A/B：timeout | full PR 有变化；fix increment 无变化 | 取决于原 scope | 不能一概说前审错，也不能把 full-history 变化当 R-1 增量违规。原 scope 缺失→部分保留。 |
| 审计 B：静态 bearing 正穿 H12 | 前审纠正成立 | P2 | 静态线穿 H11；动态右漂命中 H12/S2 是另一层，需分开叙述。 |
| 双评独立性/签名收据 | 前审质疑成立，R-2 仍未独立证明 | P1 | 重评分 76 可复算，但“独立双评已闭环”不能放行。 |
| 综合 94 / 视觉 76 | 成立 | 无问题 | 两轮 NO_GO 不应被表述成登记分必然错误；问题在证据与流程完整性。 |

### 6.1 复审结论

- **审计 A：部分维持。** append-only 与独立性问题是真；但把 append-only 直接等同“历史被销毁/分数造假”属于放大，P0 应降为 P1。
- **审计 B：核心 P0 理由被推翻。** rotY 错误存在，但修正后根因方向不变，影响半径为 0。
- **timeout：双向纠偏。** 前审不能把 full-history 变化直接扣给 ad93ed1；整改方也不能否认 #104 全历史确有变化，更不能在缺少原 scope 时宣布两审都错。
- **两轮 NO_GO 的总体方向并未被 R-1/R-2 证明为错误。** 更准确的表述是：登记数字可成立，但证据治理与独立性不足以放行。

---

## 7. 分级问题清单

| ID | Severity | Finding | 反事实影响 | URL |
|---|---|---|---|---|
| F-P1-001 | **P1** | #224 声称 #223 仅 3 件、audit prompt 与 paradigm 均未提交，且 #224 补 2 件；API 证明 #223 为 4 件且 audit prompt 已在，#224 仅补 paradigm 1 件。当前可见收据正面失真，触发 v2 的 REFUTED→FAIL。 | 只纠正 PR 正文即可消除此反证，不改变仓库字节、视觉 76 或综合 94；但在纠正前不得把“全部可消项闭环”判为真。 | https://api.github.com/repos/rayw-lab/website/pulls/224<br>https://api.github.com/repos/rayw-lab/website/pulls/223/files?per_page=100<br>https://api.github.com/repos/rayw-lab/website/pulls/224/files?per_page=100 |
| F-P1-002 | **P1** | #222 正文写 3 文件 +13/−0，API 为 5 文件 +133/−0；#223 正文列 5 文件，API 为 4 文件。这不是代码结论错误，但说明验收收据没有由 API 事实自动生成。 | 改正文为 API 实值后，分数和技术结论不变；收据完整性恢复，但 C7 独立性仍会阻塞 GO。 | https://api.github.com/repos/rayw-lab/website/pulls/222<br>https://api.github.com/repos/rayw-lab/website/pulls/222/files?per_page=100<br>https://api.github.com/repos/rayw-lab/website/pulls/223<br>https://api.github.com/repos/rayw-lab/website/pulls/223/files?per_page=100 |
| F-P1-003 | **P1** | 两评同模型；UTC 时间戳缺失/父代补录；所谓 signedReceipt 仅是 JSON 字段，不含可验证签名；会话隔离与未见他分均为自述。R-2 完成了重评分与仲裁，不等于完成独立性证明。 | 补一份异模型评审，或同模型但提供不可变会话 ID、可信 UTC、完整帧 hash、工具序列与签名校验，即可把该项从 UNVERIFIED 提升；登记 76 未必变化。 | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-alvis-r3-eval/r2-eval-a.json<br>https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-alvis-r3-eval/r2-eval-b.json<br>https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cyber-city-visual-rubric-score.json |
| F-P1-004 | **P1** | #220 对已合并 SEC-R13 块做 +2/−1 原位编辑，违反本 Loop 自定合同。R-1 只能建立向前纪律，不能把历史违规改写为从未发生。 | 若 #220 当时采用新增 SEC-R14/ERRATA 块、0 删除，则历史 C1 可通过；分数仍不受影响。 | https://api.github.com/repos/rayw-lab/website/pulls/220<br>https://api.github.com/repos/rayw-lab/website/pulls/222 |
| F-P1-005 | **P1** | 应拆成两真：PR #104 全历史确有 OBS 1.5M→1.8M、PERF 1.2M→1.5M；最小修复 5987641..ad93ed1 确实零 timeout 改动。没有原始 A/B 任务书，不能证明其本来只审后者，因此整改方把两轮 C10 一概定性为范围错置，证据不足。 | 明确写成“全 PR 有变、fix increment 无变”，并附原审计 scope，便可判定谁混测；当前事实不改变 94/76，但改变对前审是否误判的结论。 | https://api.github.com/repos/rayw-lab/website/pulls/104/files?per_page=100<br>https://api.github.com/repos/rayw-lab/website/compare/598764172250f3a0d6e5a29c36aa564dbd44e009...ad93ed1efcce66ea9367bb3ca40a95b811c9e393<br>https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-loop-audit-prompt-v2.md<br>https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-loop-remediation-roadmap-2026-09-02.md |
| F-P2-001 | **P2** | c912 的直接 diff 是 OBS 1.5M→2.7M、0.9M→1.5M并加入 navigate 1.8M；972 是 navigate 1.8M→3.0M。它们属于历史谱系，但不能被写成最终净变化的精确直接来源。 | 补全中间提交链并区分 test.setTimeout 与 navigate budget，即可闭环；当前影响半径为 0，仍能确认 full PR 有 timeout 变化、fix increment 没有。 | https://api.github.com/repos/rayw-lab/website/commits/c912b49f6aea0f07bf71b74d58399ebe83c568a5<br>https://api.github.com/repos/rayw-lab/website/commits/97223b8333be48b6b762380c6e208dbb496252aa<br>https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cyber-city-score-loop-orchestration.md |
| F-P2-002 | **P2** | 人工 rotY 数字确错；独立重放为 NE −131.6617/−141.6989/−139.7073°。但修正 S2 AABB 后 nose (15.77, -15.78) 仍在盒内，因此“根因整体崩塌”不成立。 | 只有修正后 nose 退出所有相关碰撞盒、从而改变根因/修复方向，才有 P0 影响；本案影响半径=0，应降级。 | https://raw.githubusercontent.com/rayw-lab/website/50c33d9b98b86155c31ae2749ddbf68bd75bde4c/src/lab/world/city/CityMap.ts<br>https://raw.githubusercontent.com/rayw-lab/website/50c33d9b98b86155c31ae2749ddbf68bd75bde4c/src/lab/world/city/StreetProps.ts<br>https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/tools/streetprops-roty-replay.mjs<br>https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-vis-x2-collider-aabb-20260902.md |
| F-P2-003 | **P2** | 按权重重算为 82.00，不是 82.75/83。文件虽保留 parent_recompute=82.0，但仍保留错误 self report。 | 用 82 替换 83 后，\|75−82\|=7 仍大于 5，仲裁仍触发，最终 76 不变；影响半径=0。 | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-alvis-r3-eval/r2-eval-b.json<br>https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cyber-city-visual-rubric-score.json |
| F-P2-004 | **P2** | CLI override 校验 0–100，但视觉 JSON 文件路径只校验 typeof number；−1、101 等越界值会被计入。字符串分数会被当作缺失并触发可用权重归一化，极端情况下反而得到 100。 | 对所有维度增加 finite + 0≤score≤100 且 `missing.length>0` 时阻止 --min 放行；当前输入均合法，现有 94 影响半径=0。 | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/scripts/score-loop.mjs |
| F-P2-005 | **P2** | 仓库只保存整改方对 A/B 的摘要，没有发现两份外部审计原文、不可变快照或原始 scope。因此本报告可复核技术事实与摘要裁决，不能替代逐句复审原报告。 | 保存原始 A/B Markdown、时间戳、会话/模型与证据索引后，才能对“哪两处同行错误”作无条件终局裁定。 | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-loop-remediation-roadmap-2026-09-02.md<br>https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-loop-audit-prompt-v2.md |
严重度计数：`P0=0` / `P1=5` / `P2=5`。

---

## 8. 自审与限制

### 8.1 被叙事误导次数：2

1. 初始阶段曾把混杂的 PR 摘要映射到错误编号；读取当前仓库 PR API 后全部废弃。
2. 曾暂时接受 #224 “两个文件都没提交”的 confession；changed-files API 证明 audit prompt 已在 #223 后纠正。

两次均未进入最终证据表；最终只使用固定 SHA、PR API 与自己复算值。

### 8.2 相较前两轮新增识别：4 项

1. #222 diffstat/文件数收据错误；
2. #223/#224 哑工件差 confession 自身错误；
3. R-2 签名收据仍不可验证；
4. score-loop 文件输入缺少范围校验。

其中前三项产生于整改后，不能倒算成前两轮审计员当时“应当看到”。

### 8.3 残余限制

- 未运行 Playwright/Node；运行时轨迹与视觉过程按收据分级。
- 未下载 Lighthouse zip；只核 run/artifact 元数据。
- 未对 86 项 `results.length` 做完整机器遍历。
- 未找到审计 A/B 原始全文；其整体验证只能给 `PARTIALLY_UPHELD / ORIGINAL_TEXT_UNVERIFIED`。
- 固定审计对象为 `4ef7ed4cc9db9bde92180b8498bac7104951dd1d`；#225/#226 是后续 R-3 文档/取证，不倒灌为 R-1/R-2 当时已完成。

---

## 9. Closeout

### Conclusion

**NO_GO。** 94/76 算术与 R-1 几何修正可以保留；“R-1/R-2 可消项全部闭环”必须撤回。阻断点不是分数，而是当前收据仍有直接反证，且 R-2 独立性不可验证。

### Changed Files

本审计对仓库：**0 文件修改、0 Git 写操作**。仅在本地交付目录生成审计五件套。

### Validation

- 所有机读 JSON 重新解析；
- CSV 列结构校验；
- HTML 内嵌 JSON 与核心算式由 JS 自动复算；
- 交付文件 SHA-256 生成并打包。

### Proof Class

- `INDEPENDENTLY_VERIFIED/REFUTED`：16
- `TRUST_BASED(receipt)`：2
- `UNVERIFIED`：1

### Residual Risks

当前 main 的 branch protection API 仍显示 `protected=false`；#226 交付的是治理提案，不是已落地设置。PR 正文可变且多次与 changed-files API 分叉，继续手填收据仍会复发。

### Next Action

最小解锁包只有三件：  
① 对 #222/#223/#224 追加一份不可变“API 实值勘误表”；② 重做一轮具可验证签名/UTC/会话标识的独立评审；③ 在计分门中把 `missing=[]` 与 0–100 输入范围设为 hard gate。完成后再发起第四轮只读复核。
