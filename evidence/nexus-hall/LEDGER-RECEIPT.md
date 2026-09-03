# LEDGER-RECEIPT · nexus-ledger-reduce

- reducer: scripts/nexus-ledger-reduce.mjs @ sha256:9e92f50d48c7
- 确定性: generatedAt = 源最大 mtime（2026-09-03T19:53:40Z），无墙钟、无随机，同输入重跑逐字节一致
- ledger: src/data/nexus-ledger.json · 255116 bytes · gzip 17141 bytes · sha256 9934d5627c31f2bc86f8784c2c976e7c167ca678c5cd64aaf7d51a3692889bf3
- 会话: 入账 1067 · 明细 600（top 600）· 席位 1 · 天 31

## 源清单

| 席位 | 源目录 | jsonl | 入账 | 备注 |
|---|---|---:|---:|---|
| claude-code | ~/.claude/projects/-Users-wanglei | 2 | 0 | 白名单外，整目录丢弃 |
| claude-code | ~/.claude/projects/-Users-wanglei-Documents-Codex-2026-08-11-codex-sidebar-agent-team-skill | 3 | 0 | 白名单外，整目录丢弃 |
| claude-code | ~/.claude/projects/-Users-wanglei-Projects-agent-tmux-stack-research | 10 | 10 | agent-tmux-stack-research |
| claude-code | ~/.claude/projects/-Users-wanglei-Projects-agent-tmux-stack-research-runs-2026-07-27-v12-maformac-tmp-consolidation | 38 | 33 | agent-tmux-stack-research |
| claude-code | ~/.claude/projects/-Users-wanglei-Projects-agent-tmux-stack-research-runs-2026-07-29-subagent-runtime-upgrade | 2 | 2 | agent-tmux-stack-research |
| claude-code | ~/.claude/projects/-Users-wanglei-Projects-co-agent | 291 | 291 | co-agent |
| claude-code | ~/.claude/projects/-Users-wanglei-agent-skills | 1 | 0 | 白名单外，整目录丢弃 |
| claude-code | ~/.claude/projects/-Users-wanglei-mywebsite | 1 | 1 | mywebsite |
| claude-code | ~/.claude/projects/-Users-wanglei-workspace | 25 | 0 | 白名单外，整目录丢弃 |
| claude-code | ~/.claude/projects/-Users-wanglei-workspace-MAformac | 138 | 0 | 白名单外，整目录丢弃 |
| claude-code | ~/.claude/projects/-Users-wanglei-workspace-lark-research-feishu-doc-factory | 7 | 0 | 白名单外，整目录丢弃 |
| claude-code | ~/.claude/projects/-Users-wanglei-workspace-raw | 728 | 726 | workspace-raw |
| claude-code | ~/.claude/projects/-Users-wanglei-workspace-raw-03-Output----2026-08-12----------- | 4 | 4 | workspace-raw |
| claude-code | ~/.claude/projects/-Users-wanglei-workspace-scout-r0 | 176 | 0 | 白名单外，整目录丢弃 |
| claude-code | ~/.claude/projects/-private-tmp | 8 | 0 | 白名单外，整目录丢弃 |
| claude-code | ~/.claude/projects/-private-tmp-cc-probe-85006 | 3 | 0 | 白名单外，整目录丢弃 |
| claude-code | ~/.claude/projects/-private-tmp-ccapi-probe-empty | 14 | 0 | 白名单外，整目录丢弃 |
| claude-code | ~/.claude/projects/-private-tmp-claude-501--Users-wanglei-workspace-ce114b8f-91cc-499a-8aab-cf07e222deb3-scratchpad-probe | 3 | 0 | 白名单外，整目录丢弃 |
| claude-code | ~/.claude/projects/-private-tmp-claude-501--Users-wanglei-workspace-raw-abf7b16f-6a2b-4e2f-9224-8c95074c8480-scratchpad | 1 | 0 | 白名单外，整目录丢弃 |
| claude-code | ~/.claude/projects/-private-tmp-claude-501--Users-wanglei-workspace-raw-e65ca40e-8094-46e7-a4e6-d56f5aad1602-scratchpad | 18 | 0 | 白名单外，整目录丢弃 |
| claude-code | ~/.claude/projects/-private-tmp-co-agent-ccapi-stdin-vK5BtQ | 1 | 0 | 白名单外，整目录丢弃 |
| claude-code | ~/.claude/projects/-private-tmp-directrun-probe | 3 | 0 | 白名单外，整目录丢弃 |
| claude-code | ~/.claude/projects/-private-tmp-lineage-probe | 0 | 0 | 白名单外，整目录丢弃 |

## 丢弃与原因

- 白名单外整目录: 15（涉及文件 403）
- 白名单外单会话（codex cwd 判定）: 0
- 空会话/不可读文件: 7
- 行级 JSON 解析失败（跳过该行）: 0

## 派单与备注

- 无

## 口径要点

- turns/tools/patches/tokens 口径见脚本头部注释；total_cost_usd 不读取、不输出。
- identityOk 三态：缺失即 null，从不推断 true；prompts 正文永不入 ledger。
