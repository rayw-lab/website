# CC-NAV-C1 F3 R6 单次资格窗破门证据固化单

> **R6 VERDICT = FAIL（SUBSTANTIVE_FAIL; PROCEDURALLY_CLEAN）**，二元、不合并：
>
> - `PROCEDURALLY_CLEAN`：R6 是 F3 系列（R4 破门 / R5 双 attempt）以来**第一次程序清洁的单次 full attempt**，§A-3-2 六条剧本要件全齐、单次无 retry；
> - `SUBSTANTIVE_FAIL`：唯一失败 VIS-02 使董事会 §A-3-3 证一/证二均不成立（实测 `81 passed / 1 failed / 0 skipped / 0 flaky`、`EXIT=1 / NAV_F3_EXIT=1`），不满足证二判据 `82/0/0/0`。
>
> **本 verdict 不得给 #166 放行**：#166 保持 draft，A-④ e2e 面仍未过门。本 docs PR 上链后只把 R6 的 FAIL 固化为「已记录的 FAIL」（补齐证三），**不会把 R6 变 PASS**，也不替代任何后续验证腿。
>
> 本单为 **docs-only 证据固化**：仅新增本文档，零 src/e2e/config/assets 改动；固化 pass 未运行/重跑任何 playwright test / preview / build / `--list`，未触碰 `/tmp/f3r6` worktree、`#166` 分支、`cursor/cc-loop-audit-*` 分支与任何他人 PR。
> 固化时间：2026-08-30（Asia/Shanghai）；机器：wangleideMacBook-Pro-3.local（Darwin 25.6.0, arm64, Apple M5）；固化执行席：`ark-coding-plan/glm-5-3-flash`（GLM-5.3-Flash）。
> 输入：run receipt（`/tmp/f3r6-run-receipt.md`）、秘书审计（`/private/tmp/xhsapi-f3r6-audit-out.md`）、controller 视觉+git 复核 receipt（`/private/tmp/f3r6-controller-visual-receipt.md`）、四份 /tmp 原始证据与两份 list 日志、董事会件 §A-3（`cc-loop-board-nav-bgm-merge.md`）、EOD 交接档（`cc-loop-handoff-2026-08-29-eod.md`）、R5 证据件（`cc-nav-c1-f3r5-evidence.md`）。全部相互核对；本固化 pass 独立复测项逐条标注，未独立复测的按来源标注（receipt-attested / INFERENCE / UNKNOWN）。

## 1. SHA 与世系

| 项 | SHA | 说明 |
| --- | --- | --- |
| candidate | `b4694cf2389315156616a99bc88d3228344b8746` | CC-NAV-C1 候选支 tip（#166 head，`cursor/cc-nav-c1-minimap-8ca4`） |
| main | `9bffe3161991f0470bacfd1c8e0b2ead37064920` | R6 开跑实测 main；本固化 pass 开工时本地 main = origin/main = `9bffe316`，主仓 porcelain 0 行 |
| integration | `37bf59a5687ee3e3ff7355afd534d417db613f96` | `/tmp/f3r6` 集成 HEAD；merge commit，两父 = candidate + main（此序） |
| 交接锚 | `211d9d923ada78fc00b6634c4527c896ce0ca03d` | EOD 交接档口径（#192 OBS-01 稳定化） |
| R5 main | `543306349c6f29277f7e6bb576ff5b592cd24aa6` | R5 证据件口径 main |

本固化 pass 独立复测（全部 VERIFIED，`git merge-base --is-ancestor` 与 `git rev-parse <sha>^1 ^2` 实跑）：

- `b4694cf → 37bf59a` **exit 0**；`9bffe316 → 37bf59a` **exit 0**（两父证；父序 candidate 先、main 后）。
- `211d9d9 → 37bf59a` **exit 0**（交接锚为 integration 祖先）。
- `5433063 → 9bffe316` **exit 0**——R5 main 与 R6 main 为**同链快进**，消解秘书审计 §1 登记的「三个互异 main SHA 关系 UNKNOWN」，main 对照树锚点取值落定。

## 2. R6 要件清单（§A-3-2 六条剧本逐项核）

**单次 attempt：VERIFIED** —— receipt 明载 `Run count: exactly one full attempt; no retries, no failed-test reruns`；`/tmp/f3r6.start` 单个、`/tmp/f3r6.end` 单个（与 R5 的 `.start`/`.start2` 双时间戳形态不同）；日志 `Running 82 tests using 1 worker` 仅出现一次（第 6 行）。

| 要件 | 状态 | 证据 |
| --- | --- | --- |
| 跑道独占（ps 核验） | ✅ VERIFIED | 开跑前 scoped ps：零 repo e2e/Astro/headless blocker；仅 baseline-exempt `@playwright/mcp` 双进程（PID 31592/31619，登记勿杀） |
| 端口隔离 | ✅ VERIFIED | TCP **4511**（已用序列 4441/4451–4453/4461–4481/4491/4501 之后取值），Python socket bind `PROBE_OK` |
| 前台 canary | ✅ VERIFIED | `ASTRO_PREVIEW_BACKGROUND=1`：parent PID 74776 存活 ≥5s、listener PID 74790、`GET /website/` = 200、precise TERM、端口释放、`PROBE_OK_AFTER_CANARY` |
| fresh `--list` 双分母 | ✅ VERIFIED | plain：`84 tests in 18 files`（`/tmp/f3r6-list-plain.log`）；qualified：`82 tests in 17 files`（`/tmp/f3r6-list-qualified.log`），**VIS-01..04 在册、CITY-PERF-01/02 缺席**（本 pass grep 复核：plain VIS=4/PERF=2，qualified VIS=4/PERF=0） |
| `set -o pipefail` | ✅ VERIFIED | receipt + config argv 均载；日志末两行 `EXIT=1` / `NAV_F3_EXIT=1` 未被 tee 吞码 |
| 产物先归档再清理 | ✅ VERIFIED | `test-results/` 全量归档 `/tmp/f3r6-artifacts/test-results/`：**67 files / 35,984 KiB**（本 pass `find | wc -l` 与 `du -sk` 复核一致）；归档 reporter hash 与独立 JSON 一致 |

Preflight（receipt-attested，本 pass 未复算）：`pnpm install --frozen-lockfile` exit 0（702 packages reused，pnpm 10.33.3，2.1s）；`pnpm build` exit 0（Astro 7.2.4，19 pages）。

清场（VERIFIED，receipt + 归档在案）：24 条被测试覆写的 tracked 截图先登记于 `/tmp/f3r6-artifacts/dirty-paths.txt`、备份至 `/tmp/f3r6-artifacts/evidence-overwritten/`、再逐条 `git restore`；终态 `/tmp/f3r6` porcelain **0**、HEAD 未动；TCP 4511 终态无 listener（`FINAL_PROBE_OK_AFTER_RUN`）；lane 进程零。

## 3. 原始 stats 与唯一失败

原始 stats（VERIFIED；receipt `readFileSync` 实读 + 本 pass 对 `/tmp/f3r6-e2e-results.json` 末段实读交叉一致）：

| 项 | 值 |
| --- | --- |
| 运行总数 | **82**（`Running 82 tests using 1 worker`） |
| passed | **81**（日志摘要 `81 passed (1.1h)`） |
| failed | **1** |
| skipped | **0**（R4/R5 系列首次 0 skipped） |
| flaky | **0**（系列首次 0 flaky） |
| JSON `stats` | `expected=81 / unexpected=1 / skipped=0 / flaky=0 / duration=4,130,611.83 ms` |
| JSON `stats.startTime` | `2026-08-29T23:52:20.602Z`（= 07:52:20.602 +0800，start 文件 07:52:11 后 9.6s，webServer 就绪起算） |
| 进程退出码 | **1** |
| 日志末两行 | `EXIT=1` / `NAV_F3_EXIT=1` |
| 墙钟 | `/tmp/f3r6.start` `2026-08-30T07:52:11+0800`（`HEAD=37bf59a`）→ `/tmp/f3r6.end` `09:01:37+0800`，`WALL_SECONDS=4166` = **69m26s** |
| `last-run.json` | `{"status":"failed","failedTests":["b2c9ecb42692405341c9-7e69b3395cbcb904511e"]}`（96B，本 pass 实读） |

唯一失败（VERIFIED，日志第 80/109–161 行 + JSON 实读）：

- 用例：**VIS-02** `@smoke3d ESC 菜单：Escape 开 → 双出口链接可见 → 截图基线 → Escape 关`（test 序号 80，`visual-chromium`，`e2e/visual/world-visual.spec.ts:74`，断言 `:90` `toHaveScreenshot('world-esc-menu.png')`；duration 804ms；test id `b2c9ecb42692405341c9-7e69b3395cbcb904511e`）。
- 失败值：**30,037 pixels（ratio 0.03 of all image pixels）are different**，配置阈值 `maxDiffPixelRatio: 0.02`（`playwright.config.ts` `expect.toHaveScreenshot`）——0.03 > 0.02 超门。
- Playwright 重试至 stable screenshot 后三次实测同值（30,037px），非瞬态捕获。
- 附件：expected（入库基线）/ actual / diff / trace 路径与 SHA 见 §10。

NAV-01/02/03（#166 本体 minimap 三例，test 序号 41–43）：**全绿**（1.7m / 2.0m / 1.3m）——**#166 功能回归 = 0**，红点严格局限在视觉 baseline 平面。但门只认 stats 不认语义（§A-3-4），**硬门仍 FAIL**。

登记：world-chromium 串行长跑慢文件 top5（explore 20.0m / feedback 10.5m / observability 9.0m / city 8.1m / minimap 5.0m）；`WS-PERF-01` 软门禁未达标（p95 174.9ms，≈6.2fps，webgl2 后端）按既有定性**不阻断**（真机门禁走 `docs/spec/human-gate-checklist.md` §2 人工录测）。

## 4. 董事会 §A-3 三证比对 → 证一/证二不成立，证三由本单补齐

| 证 | §A-3-3 判据 | R6 实测 | 判定 |
| --- | --- | --- | --- |
| 证一 | tee 日志末行含 **`NAV_F3_EXIT=0`**（pipefail 生效前提） | 末两行 `EXIT=1` / `NAV_F3_EXIT=1` | ✗ 不成立 |
| 证二 | stats `expected=82`（或 82+k）· `unexpected=0` · `skipped=0` · `flaky=0`（`readFileSync` 实读） | `81 / 1 / 0 / 0` | ✗ 不成立（expected 81≠82；unexpected 1≠0） |
| 证三 | 上二证以 commit 上链至审计/登记分支 | R6 时点证据仅存 /tmp；**本 PR 即证三执行件** | 由本单固化（固化后仍只证明 FAIL） |

引用原句：「**三证格式（缺一即视为未跑）**」「**「未上链 ✓ 不构成过门」**」。R6 三证比对：证一/证二不成立 → §A-3 不允许过门；本单上链**只把 FAIL 固化为已记录的 FAIL**，不改变裁决、不把 R6 变 PASS。**#166 保持 draft，A-④ 未过门，禁止 `gh pr ready`。**

## 5. 失败分账（沿 #178 终账三分法）

| 账 | 数 | 明细 |
| --- | --- | --- |
| 规格恒红（仓库账） | **0** | 恒红清单只有 `CITY-PERF-01/02`（`[data-ws-fps]` 挂点缺席，#183 已定性）；R6 以 `--grep-invert='CITY-PERF-0[12]'` 整族排除，两例未运行、未计入 82。VIS-02 **不在**清单内，不得按恒红扣减 |
| 真回归（候选账，零容忍） | **0（对 #166 本体）** | CITY-NAV-01/02/03 全 ✓；world-chromium 全族（AUD/EXP/QST/FB/HINT/PA/OBS/SIGN/E2E/VEH）、world-spike 全族、car、mobile、desktop、tts、site-health 全 ✓ |
| 环境性 | **0** | 无环境指纹失败；同窗同机同 worker VIS-01/03/04 均 ✓（同环境强对照，环境抖动不足以解释「只红 VIS-02」） |
| 未分类（本次唯一红） | **1** | **VIS-02** `world-esc-menu.png`，30,037 px / ratio 0.03 > 0.02 —— 已由 §6/§7 独立复核定 性为 stale baseline（见下） |

## 6. Git 事实与 stale baseline 根因（终裁 VERIFIED）

秘书审计 §4 曾将「stale snapshot baseline」登记为**候选**（INFERENCE，`71e7c59`/`67348d5` 标 caller-attested UNKNOWN，并保留两条意见：runner「moving 3D background」推断与 reduced-motion 前置条件相斥、两 SHA 无内联文本）。**controller 视觉+git 独立复核已完成**，两意见均解，根因升级 **VERIFIED**；本固化 pass 再以主仓 git 独立复测一遍（`git log --follow` / `git log --format='%h %ad %s' --date=iso` 实跑）：

| Git 事实 | 复核值 | 判读 |
| --- | --- | --- |
| ESC 基线入库 | `e2e/visual/__screenshots__/world-visual.spec.ts/visual-chromium/world-esc-menu.png` 的 `git log --follow` **仅一条**：`71e7c59`（2026-08-25 17:28:07 +0000，「docs(test-framework): VM 跑法文档 + 视觉基线图入库 + smoke3d 计分防虚报」） | VIS-02 baseline **此后零更新**，冻结于 poster 重拍之前 |
| poster 最后变更 | `public/` 下 `cyber-city-poster.webp` 末次提交 `67348d5`（2026-08-26 11:04:03 +0000，「feat(shell): CC-L3-POSTER 三面同源重拍——ATM+B3 落定帧」） | poster 在 ESC 基线入库**之后**重拍落定 |
| VIS-01 基线跟拍 | `world-shell-static.png` 末次提交 `50955ef`（2026-08-26 11:08:13 +0000，「test(visual): VIS-01 壳静态基线重生成（新 poster 有意变更，--update-snapshots all）」），晚于 `67348d5` 4 分钟 | VIS-01 baseline **已随 poster 更新**并在 R6 通过；VIS-02 **未跟**——不对称登记即差异来源 |
| 世系 | 见 §1（`5433063 → 9bffe316` 快进 VERIFIED） | main 对照树锚点无歧义 |

对审计保留意见的裁决落定（VERIFIED，controller receipt）：

- runner receipt 的「moving 3D city/robot background」推断**不成立**：VIS-02 截图前显式 `emulateMedia({ reducedMotion: 'reduce' })` 且断言 `data-blocked="reduced-motion"`；独立审图证实主导差异是**静态 poster 帧更换**（expected=机器人居中旧帧；actual=机器人偏左、右侧道路/AGENT NEXUS 新帧），非动态 3D。
- R6 actual 背景与**当前已通过的 VIS-01** `world-shell-static.png` 同源：外场景 RGB 相关系数 ≈ **0.989 / 0.981 / 0.983**（符合 dialog 遮罩变暗）；而 expected 与 VIS-01 相关仅 ≈ 0.128 / 0.122 / 0.063——actual 属现实现帧，expected 属过期帧。

**根因终裁：VIS-02 stale snapshot baseline（旧 poster 帧未随最后重拍更新）。不是动态 3D、不是环境、不是菜单产品回归。**

## 7. 独立视觉复核结论（已完成，三图判读 VERIFIED）

三图 SHA-256（本 pass 对 `/tmp/f3r6-artifacts/test-results/` 归档逐文件复算一致）：

| 图 | 文件 | SHA-256 | 字节 |
| --- | --- | --- | --- |
| expected | `…/visual-chromium/world-esc-menu.png`（入库基线） | `01c0cc22423051e78f6f224a274b9a936e6bf32b4e93559a4d1eb829f1e81dc5` | 499,555 |
| actual | `…/world-esc-menu-actual.png`（R6 现实现帧） | `1eb89247757f2cd8b9b7e73c19cd7e6d6d2e7a8e5d45a019df0f87f7bd47ca7f` | 634,328 |
| diff | `…/world-esc-menu-diff.png` | `8ee9a36f94da537fd85e144ad1408a62414413fe9e9cc9a5c5f02413aac8ad51` | 202,693 |
| trace | `…/trace.zip` | `247c2b8aeaa8488ae04ac1cc8616951a5eb3bec2f1d5c08ff45a6bac0f00388d` | 1,654,634 |

判读结论（controller 独立 vision agent，VERIFIED）：

- 菜单语义完整：双出口链接、说明段、关闭按钮均在；首个 Work 链接仍是 focused（焦点对象/位置一致）。
- dialog 外框 x 范围一致（约 457..982）；y 仅约 **1px 栅格差**，非结构位移。
- 现实现焦点环浅蓝；文字仍同段两行，存在字体宽度/一字符换行的**当前栅格差**——按现实现审阅登记，**不应 mask**。
- 主差异 = poster 帧更换（§6）；无 dialog 位置、焦点对象、出口文字或信息架构的实质漂移。

## 8. 最小补洞序（7 步状态登记）

> 全部步骤须遵守 §A-3-2 六条剧本 + §A-3-3 三证格式；**任何一步都是新标签、新 worktree、single attempt**。

| 步 | 内容 | 状态 |
| --- | --- | --- |
| 1 | R6 证据 docs 上链（证三） | **本 PR 即执行件**（合入后完成） |
| 2 | 独立视觉复核（三图判读 + git 事实复核） | **已完成**（VERIFIED：stale baseline、菜单本体无实质漂移，§6/§7） |
| 3 | 单文件更新基线：`e2e/visual/__screenshots__/world-visual.spec.ts/visual-chromium/world-esc-menu.png` ← R6 actual（SHA `1eb89247…47ca7f`） | **未完成** |
| 4 | 新标签定向 VIS-02 一次绿（`--grep 'VIS-02' --project=visual-chromium --no-deps`，single attempt；期望 `expected=1 / unexpected=0 / skipped=0 / flaky=0 / EXIT=0` + stats 上链） | **未完成** |
| 5 | 含 e2e asset 的 fix PR：final tip CI 五门（check/build/links/budget/lighthouse）绿 + 步骤 2 复核结论在案 | **未完成** |
| 6 | 合入后另立 R7：新标签、新 worktree、single attempt，82 例全量 0/0/0 + 三证上链；**R7 三证上链后才可 ready/squash #166** | **未运行（R7 标签未开）** |
| 7 | 禁止同 R6 标签重跑/复用；R6 的 81/1/0/0 不得写成「接近通过」或用作 A-④ 部分证据 | 在册常令 |

步骤 3 硬约束（controller 裁决原文登记）：修复文件域**只有**上述一个 PNG；保持 `world-visual.spec.ts`、`playwright.config.ts`、阈值 0.02、mask、poster 与 VIS-01 基线、src **全部不变**；不改 test/config/用例数（k=0，分母恒 82/17、登记总分母恒 84/18）；重拍/替换须附动机说明并登记新基线 SHA。

## 9. 不可改写数字总表

数字只许追加、引用或显式标注作废，禁止就地改值。

| 项 | 不可改写值 | 状态 |
| --- | --- | --- |
| R6 attempt 性质 | exactly one full attempt；no retries；no reruns | VERIFIED |
| R6 运行总数 | 82 tests / 1 worker | VERIFIED |
| R6 结果 | 81 passed / 1 failed / 0 skipped / 0 flaky；`EXIT=1` / `NAV_F3_EXIT=1` | VERIFIED |
| JSON stats | `expected=81 / unexpected=1 / skipped=0 / flaky=0 / duration=4,130,611.83 ms`；startTime `2026-08-29T23:52:20.602Z` | VERIFIED |
| 墙钟 | 4166 s = 69m26s（07:52:11 → 09:01:37 +0800） | VERIFIED |
| 唯一失败 | VIS-02，`world-visual.spec.ts:74`（断言 `:90`），30,037 px / ratio **0.03** > 阈值 **0.02** | VERIFIED |
| 分母（plain / qualified） | **84 tests / 18 files**；**82 tests / 17 files**（VIS-01..04 在、PERF-01/02 不在） | VERIFIED |
| Preflight | install exit 0（702 reused，2.1s）；build exit 0（Astro 7.2.4，19 pages）；TCP 4511 `PROBE_OK` | receipt-attested |
| 归档 | test-results **67 files / 35,984 KiB** | VERIFIED（本 pass 复核） |
| 覆写/恢复 | 24 条 PNG 覆写 → 备份 `evidence-overwritten/` → 逐条 `git restore`；porcelain **0** | VERIFIED |
| 终态端口/进程 | TCP 4511 无 listener（`FINAL_PROBE_OK_AFTER_RUN`）；lane 进程零 | VERIFIED |
| candidate / main / integration | `b4694cf…` / `9bffe316…` / `37bf59a5…`（两父 candidate+main） | VERIFIED（本 pass 实跑） |
| 世系 | `211d9d9 → 37bf59a` exit 0；`5433063 → 9bffe316` exit 0 | VERIFIED（本 pass 实跑） |
| ESC 基线唯一入库 | `71e7c59`（2026-08-25 17:28:07 +0000） | VERIFIED（本 pass `git log --follow` 单条） |
| poster 末次变更 | `67348d5`（2026-08-26 11:04:03 +0000） | VERIFIED（本 pass） |
| VIS-01 重签 | `50955ef`（2026-08-26 11:08:13 +0000） | VERIFIED（本 pass） |
| 三图 + trace SHA | 见 §7 | VERIFIED（本 pass 复算） |
| 根因 | VIS-02 stale snapshot baseline（旧 poster 帧未跟重拍）；菜单本体无实质漂移 | VERIFIED（独立视觉复核） |
| R6 主腿目标值 | `expected=82 / unexpected=0 / skipped=0 / flaky=0 / EXIT=0` | **占位期望，非实测**（实测 81/1/0/0/1） |
| R7 目标值 | 同上占位期望 | **占位，R7 未运行** |

秘书审计 §6.2 表内 list-qualified 哈希笔误 `39bf444…95d287` 作废，以 receipt 原值并经本 pass 复算的 **`b39bf44dd431c741bfb28150a151d6a3dd291442b72c44d413e640d91a95d287`** 为准。

## 10. 证据清单（/tmp 原始件 · 字节数 · SHA-256 · 归档）

| 文件 | 字节 | SHA-256 | 本 pass 复算 |
| --- | ---: | --- | --- |
| `/tmp/f3r6.log` | 25,636 | `b0625b5dd9addf3d19d09e0ca47eacc2fe433d4ecd25cae5b210fa35c4b5e41a` | ✅ 一致 |
| `/tmp/f3r6-e2e-results.json` | 138,749 | `1369fae5a99c57ff80d1a0f95778e799fa51f8484d6d843173efea1ce7d87ab9` | ✅ 一致 |
| `/tmp/f3r6-last-run.json` | 96 | `829ae445bda39e120e1d73daea2d2babb00d375279169832f113eb9563c3e470` | ✅ 一致 |
| `/tmp/f3r6.start` | 94 | `e519fd934d61cc08e575e9ec762c1f1bf51260544f55dcf7309c511311930ebd` | ✅ 一致 |
| `/tmp/f3r6.end` | 64 | `2bbf6050f30d4d88283c978fdc3698121c327693c4062160af16740334f6ef8a` | ✅ 一致 |
| `/tmp/f3r6-list-plain.log` | 17,840 | `4c70b4664e7f369643058b3b2daf44d2a38b1381b897d7f07562ae8730a6a579` | ✅ 一致 |
| `/tmp/f3r6-list-qualified.log` | 17,274 | `b39bf44dd431c741bfb28150a151d6a3dd291442b72c44d413e640d91a95d287` | ✅ 一致 |
| expected / actual / diff / trace（`/tmp/f3r6-artifacts/test-results/visual-world-visual-…-visual-chromium/`） | 499,555 / 634,328 / 202,693 / 1,654,634 | `01c0cc22…1e81dc5` / `1eb89247…47ca7f` / `8ee9a36f…aac8ad51` / `247c2b8a…00388d` | ✅ 一致 |

另在档：`/tmp/f3r6-artifacts/`（`test-results/` 全量 67 files / 35,984 KiB；`dirty-paths.txt` 24 条；`evidence-overwritten/` 24 文件）、`/tmp/f3r6.start`/`.end`、controller receipt 与秘书审计（/private/tmp）。`/tmp/f3r6` worktree 留存供 controller 复查。临时件灭失后以本单为准。

## 11. 附：本轮未做与禁做

- **未做**：未改任何 src / e2e / config / assets（含未动 `world-esc-menu.png` 基线、`world-visual.spec.ts`、`playwright.config.ts`、阈值、mask、poster、VIS-01）；未 ready / 未合 #166；未重跑 R6、未开 R7；步骤 3–6 全部未完成（§8）；固化 pass 未运行任何 playwright test / preview / build / `--list`。
- **禁做**（继受在案）：同 R6 标签重跑；把 81/1/0/0 写成「接近通过」；以「基线过期」豁免门禁（基线过期不是豁免，是需走完补洞序的另一条路径）；在步骤 3/4/5/6 未闭环前 `gh pr ready 166`。
- **未触**：`/tmp/f3r6` worktree、`cursor/cc-loop-audit-*` 分支、#166/#177/#185 等他人 PR、CAM 红线 v2 §8 签字、真机性能六腿、安卓 S-2（EOD §4 未决件维持未决）。
- **登记矩阵维持**（EOD 交接档 §0）：生产登记 综合 **80** / 视觉 **73** / 功能 **87** / 性能 **—**；本单零登记分变动。

---

*Ownership 尊重：本单仅新增本文档一个文件；未触碰 `/tmp/f3r6`、任何 src/e2e/config/assets、#166/#177/#185 等他人 PR、`cursor/cc-loop-audit-*` 分支、历史看板块。*
