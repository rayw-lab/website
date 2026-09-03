---
id: ADR-6
title: 数据白名单与公开尺度（墨迹厅）
status: accepted
date: 2026-09-04
decided_by: 磊哥（charter §0.1 第 2 条「同意草案 §3.2 候选名单」）
---

# 决定

沿用草案 §3.2 的白名单候选，**按项目目录准入**：`cwd` 命中白名单才入库，否则**整条丢弃**（不做匿名化——匿名化后的记录仍可能因组合特征被还原）。展厅表达的是**协作的形状**，不是会话内容。

- 纳入：`mywebsite`、`co-agent`、`co-agent-cline-unification`、`agent-tmux-stack-research*`、`smux`、`tmux-bridge-mcp`、`oh-my-codex`、`hermes-agent-upstream-*`、`grok-build`、`workspace/raw`（仅 `loop-commander` / `skills-distilled` 子树）。
- 排除：`MAformac`、`lark-*`、`huasheng-*`、`scout-r0`、`Documents/Codex-*`、`-private-tmp-*`、以及任何客户/雇主目录。
- `total_cost_usd` **不展示**（磊哥六点第 5 条）。

# 本轮新增实证（决定执行细则，非改变决定）

| 事实 | 来源 | 对执行的约束 |
|---|---|---|
| 1474 个 jsonl / **358,722 行** / 2.0 GB | `evidence/nexus-hall/w2/type-census.json`（全量真解析，闭合账成立） | reducer 必须流式，禁整目录入内存 |
| 顶层 `type` 全集 **23 种** | 同上 | 覆盖门：23 种逐一**显式映射或显式 allowlist**，缺一即 FAIL |
| `queue-operation` **10,918 行** | 同上 | 本机有「整类丢弃致 62.5% 用户指令蒸发」先例，必须显式表态，不许落默认分支 |
| `attachment` **96,045 行**（占 26.8%） | 同上 | 该类含文件内容快照，**默认整类不入 ledger**，只计数不取内容 |

# 🔴 对草案 §3.2 redact 词表的一处修正

草案原文要求 ledger 内不得出现 `ark-`。**实测该规则会在第一天误伤**：
`rg -i -o 'ark-[a-z]*' src/` 命中 **16 处**，全部是 `src/lab/modules/tts-cockpit/` 的
`park-path` / `park-chip` / `park-car` / `park-slot`，零安全含义。

修正：方舟凭据只认 `ark-` + 五段 hex（UUID 实形），并用负向环视排除前面贴着 `[A-Za-z0-9_-]` 的情况，使 `park-*` 结构上不可能命中；`park-` 四词面写进门的 `--selftest` 作永久回归样本。

**理由**：恒红的门等于恒绿的门——使用者会学会忽略它。规则准入从此有硬门槛：先实测全仓分母、写清"明确不拦什么"、在 selftest 补正控回归样本，三样缺一不进词表。
