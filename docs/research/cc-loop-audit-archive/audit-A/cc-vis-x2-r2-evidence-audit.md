---
document: cc-vis-x2-r2-evidence-audit
status: FINAL_READ_ONLY_EVIDENCE_REVIEW
repository: rayw-lab/website
r2_evidence_merged_by: PR #212
r2_evidence_main_anchor: ff6d00ea9192094bb34030cc11c9e064c1be53ef
live_main_at_close: 8d6efb0ed9c0a523aed1a9523eee46135cc0b405
candidate_head: 598764172250f3a0d6e5a29c36aa564dbd44e009
formal_run_exit: 1
verdict: NO_GO
commit_status: NOT_COMMITTED_LOCAL_DRAFT
date: 2026-09-01
---

# #104 X2 R2 运行与环境证据独立复核档

> 本文件对 `docs/research/cc-vis-x2-full-r2-evidence/` 做二次复核，并记录证据上链后的账本并发事件。它不是新的测试运行，仓库零修改。

## 1. 运行证据结论

| 维度 | 复核结论 |
|---|---|
| 候选 exact head | `598764172250f3a0d6e5a29c36aa564dbd44e009` |
| 运行 base | `939056d728218b68cc3e914840ab9f5ddcb2d82b` |
| R2 证据合入锚 | `ff6d00ea9192094bb34030cc11c9e064c1be53ef` |
| 当前 live main | `8d6efb0ed9c0a523aed1a9523eee46135cc0b405` |
| 正式分母 | 86 tests / 19 files |
| 正式结果 | 72 passed / 1 failed / 13 did not run / 0 flaky |
| workers / retries | 1 / 0 |
| 原始退出码 | `RUN_EXIT=1`；`FORMAL_SCRIPT_EXIT=1` |
| 外部干扰 | 1111 samples，external=0 |
| 端口 | 4587，pre/post bind success |
| tracked 资产 | 23 张 PNG，23/23 restore 后与 index 一致 |
| 资格结论 | **NO_GO** |

## 2. 核心凭据索引

根目录：

```text
docs/research/cc-vis-x2-full-r2-evidence/
```

| 文件 | 用途 | SHA-256 |
|---|---|---|
| `run-receipt.md` | 正式运行总收据 | `3c46b888cbaddb3d731a5039b03aa5b949e96c204c15890e02204dbe63a969fd` |
| `e2e-results.json` | Playwright 原始 JSON | `5dae8049e0f7d01de5a1a3c4379b6e4b6a0b447912c3068f9b8405d9f96c0477` |
| `e2e-summary.json` | 摘要；存在 `totalTests` 字段错误 | `50c701f247626261ec5dc6e925e2dff39bd24632b24b06c56d8654f3c45eeb27` |
| `list-e2e-results.json` | fresh `--list` JSON | `08807a333bfe1cfd9af61e3334dbaaad36fb0656fd6bdac707fc75a5eb268c10` |
| `list.log` | fresh 枚举日志 | `cf1b613828a8cecf1fbb7d4063a64e965c3ae7a54455c440f6894acfafadec0f` |
| `full.log` | 正式窗完整日志 | `6821ab69f5cb8fdea55531a496ed4a6c6b34c140103df3a15da009cf0e6c90dc` |
| `error-context.md` | 唯一失败上下文 | `1a3c5f0fa63bc5ef4107a520ae0b56fe99c0ae0c5cfe972204afbc4d91b673d3` |
| `formal-run.zsh` | 正式运行脚本 | `c75c2cb9189e5acf469a59618e0a26e165b237f68a281580d62ea71df6fc49fa` |
| `host-monitor-summary.json` | 环境监控摘要 | `0849875800a81d3dd680eddcecdab0f04ed757ac8f803d185c587f35a625c487` |
| `host-monitor.log` | 1111 个采样窗 | `9befee43a3885be1f41f4806f315fb2215917615f5d90c23619b7ff9e4b2dc44` |
| `preflight-port.log` | 正式前端口探针 | `09889349a358741a9a8ced0a0f9171b070070122b82cd67111a27bbde7f13029` |
| `postflight-port.log` | 正式后端口探针 | `09889349a358741a9a8ced0a0f9171b070070122b82cd67111a27bbde7f13029` |
| `preflight-vacuum.log` | 正式前进程快照 | `30f3395291b850e2b003fa937d0c34c83821cd4199165903f99ca32d4d264c87` |
| `postflight-vacuum.log` | 正式后进程快照 | `8883a1d6b39e6d1a95a530bfc1a327a5c37f20cd3a3d05b520964239b06afd01` |
| `preflight-git.log` | 正式前 git clean | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `postflight-git.log` | 正式后 git clean | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `tracked-restore.json` | 23 张 PNG 还原核验 | `235425c0060e115041bd8541bd93f7c1141bb8bfb8ebca778bd0258d0d1dd609` |
| `test-failed-1.png` | CITY-OBS-01 失败图 | `fae416f59a12bd770549fd3fc687e2ca27c6e18061909f310e3f52a3bc4bff0d` |
| `SHA256SUMS.txt` | 全目录哈希正本 | Git blob `923bae861b4bf77152545f6cf33ce38e43bd51cb` |

## 3. 数量守恒与摘要异常

Fresh list：

```text
Total: 86 tests in 19 files
```

正式结果：

```text
72 expected passed
 1 unexpected failed
13 did not run
 0 flaky
---------------------
86 total
```

数量守恒成立。

`e2e-summary.json` 却写：

```json
"totalTests": 19
```

该值对应文件数，不是测试数。建议追加勘误，不覆盖原始证据字节：

```json
"totalTests": 86,
"totalFiles": 19
```

## 4. 唯一失败与影响面

```text
test: CITY-OBS-01
leg1: (20,-8) reached
leg2 target: (28,-28)
final sampled state: x=1.3, z=-2.1
assertion: e2e/cyber-city-observability.spec.ts:412
duration: ~578.6s
```

原始证据只能证明“该候选在该正式窗未满足可达断言”，不能直接定罪为产品代码、测试路线、控制器或碰撞体中的某一类根因。

13 个未运行项：

```text
CITY-OBS-01b
CITY-OBS-02
CITY-OBS-03
CITY-OBS-04
CITY-OBS-05
CITY-OBS-06
WS-PERF-01
CITY-PERF-01
CITY-PERF-02
VIS-01
VIS-02
VIS-03
VIS-04
```

因此 PERF、VIS、双评、权重与综合分均未闭环。

## 5. 环境独占性

| 项目 | 值 | 判定 |
|---|---:|---|
| port | 4587 | 独立 |
| pre/post bind | SUCCESS / SUCCESS | PASS |
| workers | 1 | PASS |
| retries | 0 | PASS |
| CI env | UNSET | PASS |
| monitor samples | 1111 | 完整 |
| external unique matches | 0 | PASS |
| 第二次正式跑 | 无 | PASS |
| 运行后候选 push | 无 | PASS |

结论：本轮失败不能用已检测到的外部 Chrome/Playwright 抢占解释，也不能撤销。

## 6. exact-head CI 边界

Run `33514114971` 证明：

```text
head_sha = 598764172250f3a0d6e5a29c36aa564dbd44e009
attempt  = 1
result   = success
```

通过：

```text
astro check
build
link gate
budget gate
Lighthouse gate（四项 ≥95）
```

未覆盖：

```text
86 例正式 Playwright
VIS 固定机位双评
availableWeight / missing
五维 score-loop 复算
```

## 7. Diff 与资产卫生

PR #104 的 16 文件分布：

```text
docs/       3
e2e/        3
src/        5
public/     2
tools/      2
root config 1
```

未发现临时 PR body、trace/video 或测试输出截图提交到候选。运行中覆写的 23 张 tracked PNG 已恢复，23/23 匹配 index，postflight git clean。

## 8. 当前证据缺口

| 凭据 | 状态 | 影响 |
|---|---|---|
| LHCI 上轮四项原始基线 | 未定位 | 无法证明不回退 |
| LHCI 本轮四项原始分/artifact | 仅阈值结果可见 | 证据不足 |
| VIS-01…04 | 未运行 | 视觉门失败 |
| 固定机位双评 | 未形成 | 不得登记视觉分 |
| `availableWeight=1.0` | 未形成 | 缺维 |
| `missing=[]` | 未形成 | 缺维 |
| 本轮自动算分收据 | 未形成/未定位 | 综合分不可发布 |

## 9. 证据上链后的账本事件

R2 证据本身已由 #212 合入 `ff6d00e...`，其 `NO_GO` 结论可靠。随后：

```text
15:39:21Z  #213 收到 Controller CHANGES_REQUIRED / DO_NOT_MERGE
15:39:35Z  #213 仍被 merge → main 8d6efb0...
```

#213 的问题不污染 R2 原始运行字节，但污染了“当前运行态与下一动作”的权威看板口径。必须通过看板顶部追加纠偏，不得改写 R2 原始证据或 #213 历史块。

## 10. #214 证据角色边界

#214 新建的 202 行 handoff 可以作为：

```text
SUPPLEMENTAL_EXECUTION_HANDOFF
```

不能作为：

```text
AUTHORITY_SUPERSEDING_THE_BOARD
```

原因：权威单源是 `docs/research/cyber-city-score-loop-orchestration.md`。若 #214 不同时在该看板顶部追加纠偏，它将制造第二权威源。

## 11. Claim → Proof

| Claim | Proof |
|---|---|
| E2E 正式窗失败 | **PROVEN** |
| 环境独占 | **PROVEN** |
| 无 retry / 无第二跑 | **PROVEN** |
| exact-head CI 成功 | **PROVEN** |
| 23 tracked PNG 已还原 | **PROVEN** |
| LHCI 不回退 | **NOT PROVEN** |
| 视觉门通过 | **DISPROVEN / NOT RUN** |
| 权重完整 | **NOT PROVEN / INELIGIBLE** |
| 综合分 ≥85 | **NOT PROVEN / INELIGIBLE** |
| #104 可合入 | **DISPROVEN** |
| #213 当前口径已闭合 | **DISPROVEN** |
| #214 可单独取代看板 | **DISPROVEN** |

## 12. Closeout

- **Conclusion**：R2 证据足以证明 #104 `NO_GO`；当前账本仍需同源纠偏。
- **Changed Files**：仓库 0。
- **Validation**：JSON 守恒、日志/摘要交叉、环境/端口、资产恢复、Actions、PR 评论时序。
- **Proof Class**：`COMMITTED_RUNTIME_RECEIPTS_WITH_HASH_INDEX`。
- **Residual Risks**：root cause 未定；summary schema 错；main 权威看板包含未闭合当前态。
- **Next Action**：#214 改为“看板顶部纠偏 + handoff 降级为补充材料”。
