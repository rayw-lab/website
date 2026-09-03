| document | cc-loop-governance-proposal |
|---|---|
| status | EXECUTED（2026-09-03 D-1 已按 §1 落地；回读收据：required=[门禁（check / build / links / budget / lighthouse）] strict=true / enforce_admins=false / allow_force_pushes=false / allow_deletions=false；artifact 通道方案 A 执行见 docs/research/cc-lhci-artifacts/） |
| date | 2026-09-02 |
| 依据 | 长程整改任务书 R-3-4；实证根因 = main 无 branch protection（#213 评论后 14s 抢合、#214 审计收口后 8s 抢合、#220 原位编辑工艺违规）+ 外部审计 LHCI/artifact 只能 TRUST_BASED |

# 治理提案｜branch protection + 审计 artifact 通道（R-3-4）

## 1. branch protection（GitHub Settings → Branches → main → Add rule）

| 设置项 | 建议值 | 对应实证 |
|---|---|---|
| Require a pull request before merging | ✅（直合 main 的口头授权模式终止；紧急时 admin 可豁免） | #213 抢合（DO_NOT_MERGE 后 14s） |
| Required status checks | ✅ `门禁（check / build / links / budget / lighthouse）` require branches up to date | 现行 CI workflow 名 |
| Do not allow bypassing the above settings | ❌（保留 admin 豁免——指挥官单兵节奏需要直合通道） | 折中：挡误操作不挡授权直合 |
| Allow force pushes / deletions | ❌ | 历史字节保护 |
| Restrict pushes to matching branches | 可选：`codex/*`、`cursor/*` 命名空间 | 分支卫生 |

**保留现状的选项**：若指挥官选择不开启（单兵开发节奏优先），则以「看板追加式勘误 + 事后追责登记」为替代治理（本 Loop 已实证其可行但发生过 #220 工艺违规）——决策页见 §3。

## 2. 审计 artifact 通道（消除外部审计 TRUST_BASED 边界）

- **方案 A（推荐）**：正式窗 evidence PR 合入时，把 LHCI artifact（lhr-*.json 21 份）与 e2e-results.json **以文本形式直接入仓**（LHR 本就是 JSON 文本 ~6.8MB 压缩前；择优：只入 `lhr-*.report.json` 的 categories+audits 摘要切片，全量留 artifact）→ 外部审计可 raw 抓取逐份复算，TRUST_BASED → INDEPENDENTLY_VERIFIED。
- **方案 B**：GitHub Release 附 artifact zip（public repo 附件可下载）——保留二进制原件 + 文本切片入仓双轨。
- 任一方案落定后，更新审计任务书 v2 的 C6 检查项（从 TRUST_BASED 升级为可独立复算）。

## 3. 指挥官决策页

| 决策 | 选项 | 本档建议 |
|---|---|---|
| D-1 branch protection | 开启（含 required checks）/ 不开启 | 开启 required checks、保留 admin 豁免 |
| D-2 artifact 通道 | 方案 A 文本入仓 / 方案 B Release 双轨 / 维持现状 | 方案 A（增量最小、直接消边界） |
