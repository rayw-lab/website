# 调研：Cursor「Async new-VM subagent limit of 3 reached」来源

调研日期：2026-08-28  
方式：Cursor 官方文档（subagents / cloud-agent capabilities / changelog）+ Task 工具运行时错误 + 论坛公开讨论，只读。

## 1. 错误语义

`Async new-VM subagent limit of 3 reached` 由 **Cloud Agent 父代理在派 Task 子代理时** 抛出。

同时满足以下条件才计入配额：

1. **async / background**（`run_in_background: true` 或等价后台模式）
2. **每个子代理独占新 VM**（「Subagents on their own machines」，2026-08-19 changelog）
3. **同一父代理会话内**并发

第 4 个满足上述条件的派生请求会被拒绝。

官方文档位置：

- https://cursor.com/docs/subagents.md（Foreground vs background；Isolated project copies / cloud subagents）
- https://cursor.com/changelog/08-19-26（独立 VM 子代理能力）

## 2. 「3」写在哪？

**官方文档、changelog、Dashboard 配置项中均未公布数字 3。**

已核对：

| 来源 | 是否写明并发上限 |
|------|------------------|
| `docs/subagents.md` | 否（只讲 foreground/background、隔离 VM、嵌套两层） |
| `docs/cloud-agent/capabilities.md` | 否（每 agent 一 VM，无 fan-out 数字） |
| `.cursor/environment.json` | 否 |
| 子代理 frontmatter（`is_background` 等） | 否 |
| Cursor Dashboard → Cloud Agents | 否（无「子代理并发」开关） |

**结论：错误串里的 `3` 是未文档化的平台 runtime guardrail**，不是本仓库 AGENTS.md 或编排顾问文档的约定。

## 3. 三类「并行」不要混谈

| 限制类型 | 典型数值 | 性质 | 用户能否调 |
|----------|----------|------|------------|
| **单父代理内 async new-VM 子代理** | 观测为 **3**（未文档化） | Task 工具硬拒绝 | **不能** |
| **顶层 Cloud Agent 并发** | Pro 约 **8**；Pro+/Ultra 更高（论坛口径，非精确文档） | 账号/plan tier | 升级 plan；归档已完成 agent 释放配额 |
| **本地（IDE）子代理** | 无固定上限；实测每批约 4，过多会压垮 extension host | 本机资源 | 通过提示词控制批次 |
| **编排建议（本仓库）** | 如 e2e 独占 VM、PERF 静默窗 | 质量/墙钟成本 | 父代理调度策略，非平台上限 |

另有正交限制：**子代理树最多两层可派生**（主 → 子 → 孙，孙不可再派）。

## 4. 与「20 路」的关系

- 官方渠道与 **本仓库 grep 均无「20 路 async 子代理」** 的配置或文档。
- 用户记忆中的「20 路」更可能指：
  - **多个顶层 Cloud Agent 并行**（Agents Window / Cloud Agents API），受 plan 并发约束；或
  - **编排上愿意排 1–20 个任务**，用滚动窗口（≤3 在飞）依次补位；或
  - **本地 explore 等内置子代理**（文档提到可「10 parallel searches」），不占 cloud new-VM 配额。
- **单个父代理 fan-out 20 个 async new-VM 子代理不可行**——会撞上观测到的 3 护栏。

## 5. 实操建议（对本仓库编排）

1. async + 新 VM 的子代理保持 **≤3 在飞**，完成一个再补一个（滚动窗口）。
2. 只读调研/复审尽量 **同 VM / 共享 checkout**，不占 new-VM 槽。
3. 需要大并行时，用 **Cloud Agents API / Agents Window 开多个顶层 agent**，按 plan 顶层并发分波。
4. 不要在看板写死「20 路同时 new-VM」——与当前平台行为不符。

## 6. 待权威确认

「3」为平台硬编码的结论来自 **排除法**（运行时错误 + 零配置面 + 零官方数字）。如需产品级确认，可向 Cursor 支持或论坛官方求证。

## 7. 引用

- https://cursor.com/docs/subagents.md
- https://cursor.com/docs/cloud-agent/capabilities.md
- https://cursor.com/changelog/08-19-26
- https://forum.cursor.com/t/what-is-maximum-sub-agent-creation-limit/164696
- https://forum.cursor.com/t/subagents-dont-maximize-parallel-dispatch/152679
- https://forum.cursor.com/t/cloud-agents-simultaneous-limit-what-are-the-actual-numbers-per-plan/154013
- https://forum.cursor.com/t/workflow-long-running-multi-agent-orchestration-root-agent-parallel-sub-agents-separate-prs/160563
