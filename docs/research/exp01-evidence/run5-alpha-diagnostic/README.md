# EXP-01 run5-α 证据包（跨 VM 诊断情报趟 · Board R3 #151 §F · 不计 ×2）

上链人：CC-FXN-EXP01-ENV（bc-0b5d1fd4 · α 执行者本人，单次窄域 resume evidence-only）· 2026-08-28T08:30Z
证据来源：α VM `/tmp/evidence-exp01/run5-decisive/`——**α VM 已随 resume 回收，原目录灭失**。
本包 = 幸存原件（持久 artifacts 区）+ 会话誊本逐字重建件，**原件/重建两账分列**（见清单表），不冒充。

## 结论四行（§F 最终口径）

- **跨 VM α**：CITY-EXP-01 **passed 17.6m，EXIT=0**（ignition 07:46:27Z → finished 08:04:06Z，
  JSON duration 1,058,583ms；tip=`49a5d6a` 独立 worktree、`E2E_PORT=4620`、
  `world-chromium --no-deps` 单趟）。执行命令抗辩成立（两键留痕齐全），**已免责**。
- **情报账全额**：与 run3（旧 ENV 诊断趟 17.7m）、同机 β（17.5m，见 `../run5/`）三趟
  跨环境互证——#129 东线改线修复在 SwiftShader 同量级墙钟下稳定复现。
- **资格账零**：按 §F **不计 ×2**；×2 决定趟改锚 **run7/run8**（基线 v2，见 `00fd832`）。
- **run5 标签烧毁**：α/β 双认领冲突（记账见 `../run5/RUN5-DUAL-CLAIM-CONFLICT-R3.txt`），
  run5/run6 退役。本包仅作诊断归档，禁止读成决胜/首计（spec 头注已按 §F 改判措辞）。

## 文件清单与 sha256（原件/重建分账）

| 文件 | 账别 | 说明 | sha256 |
|------|------|------|--------|
| `env-exp01-run5.log` | **原件** | α 全程日志（点火/收轮时间戳 + `1 passed (17.6m)` + `EXIT=0`；收轮当日复制到持久 artifacts 区而幸存） | `4ff5412ec603f030fd3fd081e2320e9f23461eb9b65586183c73bff08ec08f33` |
| `explore-restored.png` | **原件** | 第⑤腿 reload 重挂载后 chip 还原 2/12 截图（同上幸存路径） | `c603843afc262cf52378c5e984f9bd78f8dc9bf13a964ea8b5e9f3c09f68c0c4` |
| `IGNITION-run5.transcript-restored.txt` | 誊本重建 | 07:42:43Z 授权副本原文逐字（α VM 与父代理不同机，按任务单落授权副本） | `cd12e3273544f1d5d0de27f8d3d5fd099ffe1c58f26d02c91501fbe6acc11c1a` |
| `vacuum-run5.transcript-restored.txt` | 誊本重建 | 07:46:11Z 点火前真空三查 tee 原文逐字（PASS×4：chrome=0 / load1=0.14 / astro=0 / fps-probe=0；脚本文件法防 pgrep 自匹配） | `5d8d33283a5927a0648945669105a1d6e2b08fa9653ea08a687b282989e01d12` |
| `e2e-results-stats.transcript-extract.txt` | 誊本摘录 | `e2e-results.json` 灭失前提取的 stats + 用例判定两行（expected:1 / unexpected:0 / skipped:0 / flaky:0） | `5354d4c454d699fd22444e1c231ab51c21afcad53b8334c21d5432ab05143a79` |

## 灭失清单（留痕，未逐字抢救）

- `e2e-results.json` 全文（7,080B）、`session-dump-explore.json`（2,842B）、
  `explore-first-discover.png`（519KB）、`explore-second-discover.png`（455KB）——随 α VM `/tmp` 回收。
- `vacuum-run5-postrun-recheck.txt`（08:11:02Z 收轮后复查：PASS×4、load1=0.02，
  环境已回真空、未开 run6）——判定行见会话誊本，正文未逐字抢救。
- trace 本就无（`retain-on-failure` 且通过，预期缺项）。

## 时间线（α 账）

| UTC | 事件 |
|-----|------|
| 07:42:43 | IGNITION-run5 授权副本落档（任务单转录） |
| 07:46:11 | 真空三查 PASS×4（点火前留痕） |
| 07:46:27 | 点火：`world-chromium --no-deps` 单跑 CITY-EXP-01 @`49a5d6a` |
| 08:04:06 | 收轮：passed 17.6m，EXIT=0 |
| 08:08 | 归档 `/tmp/evidence-exp01/run5-decisive/`；关键两件复制持久区（本包原件来源） |
| 08:11 | 收轮后复查回真空；未开 run6 |
| ~08:26 | α VM 随 resume 回收，`/tmp` 证据灭失 → 本包按 §F 抢救上链 |
