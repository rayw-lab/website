# e2e-summary.json 勘误（追加文件，不改任何原始字节）

R2 证据档（本目录，#212 合入 `ff6d00e`）中的 `e2e-summary.json` 将**文件数 19** 误写为：

```json
"totalTests": 19
```

正确口径（与本 R3 档 `../cc-vis-x2-full-r3-evidence/e2e-summary.json` 同 schema）：

```json
"totalTests": 86,
"totalFiles": 19
```

- R2 当窗分母 = 86 tests / 19 files（与 `list-e2e-results.json`/`list.log` 一致）；`totalTests` 应为测试数 86，`totalFiles` 才是文件数 19。
- 本勘误为追加文件；本目录既有原始文件（含 `e2e-summary.json` 原字节与其 SHA256SUMS 历史）一律不改不动。
- 登记依据：审计 A（`cc-score-loop-board-delta-pr-104-r2.md` §独立证据勘误）与审计 B（复算 21 份 LHR）一致点名。
