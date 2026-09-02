| document | cc-loop-remediation-roadmap-v3 |
|---|---|
| status | ACTIVE_TASK_BOOK v3（第三轮双外部审计辩证裁决 + P1/P2 整改路线） |
| date | 2026-09-02 Asia/Shanghai |
| base | main@`fbb09eb`；被审对象 = R-1/R-2 批次（#222 head `d2c6730` / #223 head `9c11e86` / #224 head `51a6329`） |
| 输入 | 第三轮审计 C（cc-loop-third-audit，5 REFUTED / P0=0）与审计 D（website-r1-r2-audit，P0=0 / P1=3），均为浏览器只读模式，五件套交付齐 |
| 迎合原则（不降级声明） | ① 登记数值 **94 / 76 / 87 / —** 维持不降——审计 C/D 均独立复算一致（C：composite 94.0 matchesReceipt=true、visualLocked 76；D：scoreArithmeticInvalidated=false）；② 评审/模型档位不降（gpt-5.6-terra 自报照登）；③ 裁决不软化——本档对己方错误逐条认账，对外部审计的过度指控逐条给出影响半径反证 |
| v2 规则下的状态 | 两审计均 NO_GO；C 复核确认前两轮 P0 降级（A-P0→P1、B-P0→P2 影响半径 0）；本轮 P0=0——NO_GO 实质 = §2/§3 整改未闭环前的状态登记，非登记分问题 |

# 长程整改任务书 v3｜第三轮双审计（C/D）辩证裁决与 P1/P2 整改路线

## 0. 双审计对表总裁决（合并去重 13 findings：接受 9 / 部分接受 4 / 驳回 0——本轮无对外部审计的驳回，全部成立或成立+影响半径为零）

### 0.1 双审计独立复算一致项（无需整改，登记基础加固）

| 项 | C 裁决 | D 裁决 |
|---|---|---|
| 综合分 94.0（availableWeight=1/missing=[]） | VERIFIED，matchesReceipt=true | PASS，formula 逐项复算 |
| 视觉 76（七维 79/76/80/75/71/76/76，raw 76.30→76） | VERIFIED（visualLocked） | PASS（consensusRaw 76.3） |
| R3 86/0/0/0、e2e-summary 正 schema、R2 勘误追加式 | VERIFIED | PASS |
| rotY 重放（seed 3416619534，NE −131.66/−141.70/−139.71）、S2 含 nose (15.77,−15.78) | VERIFIED（含 18 件全量重放表，noseInsideS2=true） | PASS（nose 最小边界距 0.133m） |
| H11/H12 两层分立、C3 修复增量零 timeout 改动 | VERIFIED | PASS_WITH_WORDING_DEFECT（见 F-P2-003） |
| **R-1 后 ledger append-only 前向成立**（#222/#223/#224/#225/#226 删除行=0） | VERIFIED（C1-FWD） | REFUTED_HISTORICAL_**PASS_PROSPECTIVE**（同义：前向过、历史例外在案） |

### 0.2 逐条裁决（P1 五条 + P2 八条）

| # | Finding（C/D 合并） | 裁决 | 整改编号 |
|---|---|---|---|
| F1 | **#224 confession 失真**：#223 实为 4 文件（prompt v2 已在，untracked 文件被 `git add -A` 收入而未被 reset 清除——执行代理复验坐实）；#224 实补 1 文件（paradigm）。本档认定：confession 的**意图诚实**（主动披露 #223 body 与事实不符）但**事实陈述错误**（把幸存文件记成被清除） | **接受 P1** | R-4-1 |
| F2 | **#222/#223 changed-files 收据失真**：#222 实 5 文件 +133（R-1 4 文件 +65 ⊕ #221 roadmap 内容 1 文件 +68——因 R-1 分支自陈旧基 `cb72a69` 切出，PR diff 视图含 #221 内容）；#223 实 4 文件。执行代理复验：PR API `changed_files=5, +133, base=3cf1552`；compare `3cf1552..23b7032` = 4 文件 +65 | **接受 P1** | R-4-2 |
| F3 | **C7 双评独立性未闭环**：同模型、无不可变会话收据、时间戳父代补录；R-2 完成重评分与仲裁 ≠ 完成独立性证明 | **接受 P1** | R-4-3 |
| F4 | **#220 历史违规不可被声明洗白**：append-only 声明只能建立前向纪律；C1/C9' 检查须拆「历史例外（#220 白名单）+ 前向不变量（已 VERIFIED）」两层 | **接受 P1** | R-4-4 |
| F5 | **C10「全部驳回」证据不足**：两个真命题并存（PR #104 全历史确有 OBS 1.5M→1.8M、PERF 1.2M→1.5M；fix increment 5987641..ad93ed1 确实零 timeout 改动）；原 A/B 任务书不在仓，无法证明其 scope 只审后者——「范围错置」一概定性过强 | **接受 P1** | R-4-5 |
| F6 | **timeout 谱系精确归因错误**：c912b49 实际 diff = OBS 1.5M→**2.7M**、另 0.9M→1.5M、navigate 0.9M→1.8M；97223b8 = navigate 1.8M→3.0M；最终 1.8M 经 0269408（TRIAGE）——执行代理复验坐实 | **接受 P2** | R-5-1 |
| F7 | **数字勘误**：修正 AABB 位移实测 0.06m（非 0.05m，S2 z 下界）；rotY 最大误差 **10.80°**（Cabinet，非「约 6°」）；R2-B 总分复算 **82.00**（非 82.75/83，自报保留于 raw） | **接受 P2** | R-5-2 / R-5-4 |
| F8 | **OBS/PERF spec 注释残留**：两个可执行 spec 的注释仍写「bearing 正穿 H12/S2」（诊断档已勘误，spec 注释漏改） | **接受 P2** | R-5-3 |
| F9 | **score-loop 输入健壮性**：视觉 JSON 路径只校验 typeof number（−1/101 越界计入；字符串分触发归一化反得 100）——当前输入合法（影响半径 0），但属真缺陷 | **接受 P2（代码修复）** | R-5-5 |
| F10 | **前两轮审计原文未入仓**：A/B 原报告与原始 scope 不可复审，第三轮对前审的裁决只能条件性成立 | **接受 P2** | R-5-6 |
| F11 | **R-2-1 降级口径仍不满足任务书原文**（要求异模型或完整不可变收据；实际同模型 + 短哈希 + 父代补录时间戳） | **接受 P1（并入 F3）** | R-4-3 |
| F12 | **main 无 branch protection**（R-3-4 未决） | **接受（已在决策页 D-1）** | 待指挥官 |
| F13 | **leg2a「零触」绝对化**：新增腿自带 radius=2.5/timeout 240_000，「未放宽既有门，只新增绕行腿参数」才是真命题 | **接受 P2** | R-5-6（并入） |

**登记数值立场（不降级）**：两审计对 94/76/87/— 的独立复算与本档一致；C 的 priorAuditReassessment 明示「两轮 NO_GO 不应被表述成登记分必然错误；问题在证据与流程完整性」——本档全文以此为准绳。

## 1. P0

**本轮 P0 = 0**（审计 C/D 一致）。前两轮 P0 处置记录：审计 A-P0（append-only）→ P1 工艺项（R-4-4 承接）；审计 B-P0（rotY 崩塌论）→ P2（影响半径 0，C/D 双双裁定，F-P2-002 收账）。

## 2. P1 批次｜R-4（docs-only + 一个决策项）

| # | 整改项 | 动作 | 验收 |
|---|---|---|---|
| R-4-1 | #224 confession 失真勘误 | 看板顶部追加「R-4-1 勘误声明」：#223 实 4 文件（含 prompt v2——untracked 幸存被 `git add -A` 收入）、#224 实补 1 文件（paradigm 行）；confession 中「prompt v2 与范式行均未提交」为错误陈述，予以更正；原 confession 的意图（披露 #223 body 失真）仍成立 | 追加式纯新增；API 文件清单收据内嵌 |
| R-4-2 | changed-files 收据勘误 + 分支基卫生 | 同块追加：#222 实 5 文件 +133（=R-1 4 文件 +65 ⊕ 陈旧基带入的 #221 roadmap 1 文件 +68）；#223 实 4 文件；**规则新增：PR 正文统计必须由 `gh pr view --json` / PR files API 生成，禁止手写计数** | 追加式；API 收据内嵌 |
| R-4-3 | C7 独立性真闭环（二选一，均不降级登记分） | **路径 a（推荐）**：由指挥官在两个**不同模型族**的 web 会话（如 ChatGPT × Gemini/Claude）各跑一次 AL-VIS 评审 prompt（帧包已存 main `cc-alvis-r3-eval/`），带回带时间戳的完整 transcript 入仓 → 真异模型独立评审；**路径 b**：指挥官签署接受「单模型双会话 + 算术全可复现」的降级口径为终态（76 的稳健性由三评收敛 74/78/75/82→76 佐证） | 路径 a：两份异模型 transcript + 帧回显入仓；路径 b：指挥官签署声明入仓 |
| R-4-4 | C1/C9' 规则分层 | 审计任务书 v2 修订为 v2.1：C1/C9' 拆「历史例外（#220 已登记 + SEC-R14 声明）」与「前向不变量（SEC-R14 起删除行=0，已 VERIFIED）」两个独立判定位；机检命令附 `git log --numstat` 白名单 | v2.1 文件提交 |
| R-4-5 | C10 两真命题精确表述 | 看板追加声明（supersede R-1-3 中「范围错置」一概定性）：「真命题一：PR #104 全历史确有 OBS 1.5M→1.8M、PERF 1.2M→1.5M；真命题二：fix increment 5987641..ad93ed1 零 timeout 改动；原 A/B 审计 scope 不可考（原文未入仓），故对前审裁定的最终判断挂 R-5-6 归档后复审」 | 追加式；与 R-5-1/R-5-6 数字一致 |

## 3. P2 批次｜R-5

| # | 整改项 | 动作 | 验收 |
|---|---|---|---|
| R-5-1 | timeout 谱系完整链登记 | 修正看板/任务书引述为完整链：`c912b49`（OBS 1.5M→2.7M；0.9M→1.5M；navigate 0.9M→1.8M）→ `0269408`（OBS →1.8M，TRIAGE r1）→ `97223b8`（navigate 1.8M→3.0M）；区分 `test.setTimeout` 与 navigate budget 两类 | 各 commit diff 摘引内嵌 |
| R-5-2 | 数字勘误 | roadmap §0.1「位移 ≤0.05m」→ **0.06m**；「实证差 6°」→ **10.80°**（Cabinet）；paradigm 坑 14 同步 | 两文件数字修正 |
| R-5-3 | OBS/PERF spec 注释措辞 | 两 spec 的 ROUTE-R3 注释「正穿 H12/S2」→「直瞄中心线静态穿 H11；控制器动线右偏 nose 嵌入 H12/S2（见诊断档勘误）」——纯注释改动 | 注释 diff；零逻辑变化 |
| R-5-4 | r2-eval-b 结构化修正 | score JSON `dualEval.r2ReEval.scorerB.total` 83 → **82**（复算值）；自报 83 保留于 raw 文件并标注「self-report 含算术误差 82.75/83，正确 82.00」 | JSON 复算一致 |
| R-5-5 | score-loop 输入校验加固 | `scripts/score-loop.mjs`：全维度 finite + 0≤score≤100 校验；`missing.length>0` 时 `--min` 直接拒绝放行（禁归一化放行）；附一个越界输入的失败用例收据 | 单元验证：越界输入 → exit 非 0 |
| R-5-6 | leg2a 表述 + 审计原文归档 | ①「零触」→「未放宽既有终点门；新增绕行腿自带 radius=2.5/240_000」（SEC-R14 追加声明）；② 原始审计 A/B 原文 + 第三轮 C/D 原文入仓 `docs/research/cc-loop-audit-archive/`（含各自五件套），闭合 F10/F-P2-005 | A/B/C/D 四份原文可 raw 抓取 |

## 4. 相关建议（非整改，纳入范式/决策页）

1. **rotY 重放计算器 H5 成为外部审计标准件**：审计 C 自发在 score-recompute.html 内嵌 18 件全量 rotY 重放表（与本档重放脚本逐位一致）——该实践写入审计任务书 v2.1 交付物清单。
2. **异模型评审 SOP**：R-4-3 路径 a 跑通后固化为 AL-VIS 标准（两异模型 web 会话 + transcript 入仓），彻底关闭同模型争议面。
3. **收据 API 化**：F2 的教训固化为「PR 正文的一切计数来自 PR API」，与范式坑 16（scope 限定）并列为坑 17。

## 5. 验收门与禁止项（沿用 + 新增）

- R-4 五项 + R-5 六项全部合入 → 第三轮 NO_GO 的可消项闭环（剩余不可消项 = C7 待 R-4-3 路径落地 + R-3-4 待 D-1，均已有明确归属）。
- 新增禁止：**禁止手写 PR 统计计数**（API 生成）；**禁止 confession 二次失真**（勘误前必须 `gh api` 复核事实）；**禁止把「影响半径=0」的算术指控定为 P0**（v2 已立，本轮 B-P0 降级实证其必要）。
- 永不降级声明：登记 94/76/87/— 在本任务书全部整改中保持不变；任何后续变动只能来自新工程波的正式登记流程。

## 6. 决策页衔接

D-1~D-5 维持北极星备忘决策页不变；R-4-3 路径 a 需指挥官指定两个异模型 web 会话并带回 transcript（帧包与评审 prompt 均已在仓）。
