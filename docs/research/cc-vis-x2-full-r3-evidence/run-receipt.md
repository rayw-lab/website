# R3 Full Gate Run Receipt（cc-vis-x2-full-r3-evidence）

| 字段 | 值 |
|---|---|
| 窗口 | **R3**（新具名；R1=`834f1e7`@4585、R2=`5987641`@4587，不同标签不同端口，无同标签重跑） |
| exact head | `6f691fce53dd03e2485d98218e76af6e9a4611da`（= P2 修复 `ad93ed1` ⊕ main `80888ee` merge） |
| 授权 | Controller 具名授权（会话内明示 + PR #104 Conversation 收据评论，含 exact head SHA，点火前落地）：https://github.com/rayw-lab/website/pull/104#issuecomment-5504893961 |
| 分母 | fresh `pnpm exec playwright test --list` = **86 tests / 19 files**（`list.log`） |
| 命令 | `E2E_PORT=4597 pnpm exec playwright test --workers=1 --retries=0`（全 7 project 链，无 --no-deps、无 grep 过滤、单 attempt） |
| 时窗 | 2026-09-02T05:30:29Z → 06:52:19Z（墙钟 81.8 min；Asia/Shanghai 13:30:29–14:52:19） |
| 结果 | **86 passed / 0 failed / 0 skipped / 0 flaky / 0 retry（每例恰 1 attempt）/ RUN_EXIT=0**（`e2e-results.json` stats + 逐例 results 长度核验） |
| 环境 | 本地 Mac；Node v22.23.0 + pnpm 10.33.3；Playwright 1.62.1；webgl2（SwiftShader） |
| 端口 | 4597（预 bind 正证据 + HTTP 200；postflight 全端口 FREE） |

## monitor 登记（informational，不作"干净"宣称）

- `r3-host-monitor.log`：1044 样本、5s 间隔、05:30:29–07:02:31 连续采样。
- 窗口内浏览器进程 PID 谱系核对：全部 OWN（属本运行树）。
- **缺陷登记**：monitor 的 `foreign` 列因 cmdline 路径过滤缺陷将本窗自身 headless-shell 误计（3–11），该列不可作外部干扰证明；外部自动化判定以 PID 谱系核对为准。不写"monitor 干净"。

## 软门 OBS（诚实登记，非阻断）

- WS-PERF-01：p95 帧间隔 283.2ms ≥ 50ms（28/29 stall，≈5.7fps）——SwiftShader 预期读数。
- CITY-PERF-01：p95 399.9ms ≥ 50ms（14/15 stall，≈2.9fps）——同上。
- 两者均为非阻断 OBS 注记，不外推真机性能结论（真机门归 human-gate §5.4 + perf rubric §4，指挥官专属）。

## LHCI 不回退（`lhci-no-regression.md`）

上轮 artifact `9803026775`（head `5987641`）vs 本轮 artifact `9831423112`（CI run `33589801653`，head `6f691fc`）：7 URL × 4 类中位数全 100，逐项 Δ=0，不回退成立。

## tracked PNG restore

24 张被测试覆写的 tracked 截图已 exact restore（`tracked-restore.json` 清单）；restore 后 `git status` tracked-modified=0。

## preflight / postflight

- `preflight.log`：fresh --list 86/19、vacuum、port 4597 预 bind BIND_OK、HTTP 200。
- `postflight-vacuum.log`：VACUUM=0。
- `postflight-port.log`：4321/4585/4587/4593/4595/4597 全 FREE。
- `postflight-git.log`：tracked-modified=0，worktree clean。

## 边界声明

- 本窗为本地正式窗；RUN_EXIT=0 满足 #104 ready 单门（全量 e2e 0/0/0）。
- CI SUCCESS（run 33589801653）仅覆盖 check/build/links/budget/lighthouse，不等于 E2E 通过；E2E 通过以本证据档为准。
- 本证据不登记任何分数；视觉/综合分登记归 P8/P9 独立流程。
