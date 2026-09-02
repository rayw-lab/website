# 独立对抗审计任务书 v2｜rayw-lab/website「提分 Loop」整改后复核模板

> v2 修订点（对 v1 `chatgpt-audit-prompt` 的三处升级，来自首轮双外部审计的教训反哺）：
> ① C10 类检查**范围分离**——「Loop 整改增量（base..head）」与「PR 全历史」设为两个独立检查项，禁止混测（首轮 C10 双 REFUTED 均属范围错置：timeout 放宽系 R1 前历史 `c912b49`/`97223b8`，本 Loop 增量 `ad93ed1` e2e diff setTimeout=0 次）；
> ② 新增 **C9' ledger append-only 机检**——对所有已合并看板 ledger 块的后续 commit 校验删除行数=0（首轮 A-P0 实证 #220 原位 +2/−1 工艺违规，SEC-R14-ERRATA 已归位）；
> ③ 新增 **静态复刻重放**标准检查项——凡文档声称「源码确定性复刻」的数字，必须存在可执行重放脚本（先例 `docs/research/tools/streetprops-roty-replay.mjs`）且审计员可独立运行或逐行对译；首轮 B-P0 实证人工推导 rotY 偏差可达 6°。

## 0. 角色与立场

利益无关的对抗性审计员。**默认立场 = 执行代理在说谎或美化**；只采信亲自抓取/复算的字节与算术；抓取不到写 `UNVERIFIED`。禁止因报告漂亮而给分；禁止把「流程看起来完整」当作任何单项的证据。

## 1. 能力边界声明（掺假即废标）

浏览器内可做：抓取 `raw.githubusercontent.com/rayw-lab/website/<SHA>/<path>`、PR pages、GitHub API 只读端点；文本/哈希/算术复算。
不可做：运行 Playwright/Node/下载二进制 artifact。运行时事实标 `TRUST_BASED(receipt)` 并核收据链自洽；文本/算术/一致性事实标 `INDEPENDENTLY_VERIFIED`。报告末尾给出两类计数。

## 2. 检查项骨架（按被审对象填充锚点）

| # | 检查项 | 取证方式 |
|---|---|---|
| C1 | ledger append-only 机检 | 对每个已合并 ledger 块取其合并后全部后续 commit，`git diff`（网页 compare）删除行数必须=0；勘误必须是追加声明行 |
| C2 | 根因/诊断报告证据链 | 帧级证据 ↔ 代码 file:line ↔ 几何推算三层各自自洽；静态复刻数字必须有重放脚本或逐行对译 |
| C3 | 修复增量域合规 | **分两栏**：(a) 整改增量 commit（base..fix）逐 hunk；(b) PR 全历史——只登记谱系事实（timeout/预算演化及当时证据 PR），不作为整改违规依据 |
| C4 | 全量窗结果 stats | e2e-results.json：stats 字段 + 逐例 results 长度=1 + retry=0 |
| C5 | 汇总 schema 正确性 | totalTests=测试数 / totalFiles=文件数；历史档勘误必须是追加文件（原字节 diff=0） |
| C6 | LHCI/CI 收据链 | artifact 存在 + headSha 对应 + SUCCESS；表格内部自洽（无法解包二进制则 TRUST_BASED） |
| C7 | 双评/多评独立性 | 签名收据：model slug + UTC 时间戳 + 帧 hash 回显 + 工具调用序列；同模型时必须「不同会话 + 收据齐全」否则降级 UNVERIFIED；两份 frames_seen 措辞重叠度抽查 |
| C8 | 综合分复算 | 五维逐项加权重算（自己列竖式），与 quality-score JSON 比对；availableWeight=1 / missing=[] 核验 |
| C9' | append-only 机检 | 见 C1（独立于 C9 历史块内容正确性） |
| C10 | 分 scope 的数值演化 | (a) 整改增量内搜 `setTimeout/retries/skip/radius/timeout` 变化；(b) PR 全历史数值演化单独列表并核对当时证据 PR 是否收账 |

## 3. 交付物五件套（缺一或格式不符=废标）

1. `audit-report.md`——Executive Verdict + Claim→Proof 表（每项标 INDEPENDENTLY_VERIFIED / TRUST_BASED(receipt) / UNVERIFIED / REFUTED + URL + 摘引）+ 分级问题清单（每条附反事实影响）+ 两类计数 + 被误导次数自评。
2. `verdict.json`——机读裁决（逐项判定 + 重算数字 + GO_OR_NO_GO）。
3. `findings.csv`——`id,severity,claim,finding,counterfactual,url`。
4. `score-recompute.html`——单文件 H5 复算计分板（零外部依赖；每数字旁 ✓/✗；内嵌 `recompute-data` JSON）。直接抄被审数字不展示算式=废标。
5. `evidence-index.md`——声称→URL→时间→摘引 映射 ≥25 行。

## 4. 放行规则

- 五件齐 + 无 REFUTED + P0=0 → 才可 GO；任一 REFUTED/P0 → FAIL + 最小反证链（哪两个 URL 对不上）。
- 算术指控必须同时给出**影响半径**（修正后结果是否改变被审结论）——只证明「算错了」不构成 P0，「结论因此改变」才构成。
- 审计员的程序性指控（如 append-only）须先核对其参照系是否允许该操作（先例在案与否），程序瑕疵与事实造假分级报告。
