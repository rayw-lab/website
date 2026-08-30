# CC-NAV-C1 F3 R7 单次资格窗过门证据固化单

> **R7 VERDICT = PASS**（董事会 §A-3-3 二元：**证一 PASS / 证二 PASS / 证三 PENDING**）：
>
> - R7 为 F3 系列（R4 破门 / R5 双 attempt / R6 唯一红点 VIS-02）以来**首次 82 例全量 0 failed / 0 skipped / 0 flaky 的单次 full attempt**（日志摘要 `82 passed (1.2h)`、末两行 `EXIT=0` / `NAV_F3_EXIT=0`、JSON stats `expected=82 / unexpected=0 / skipped=0 / flaky=0`）。
> - **证三（上链）由本 docs PR 承担：合入前一律 PENDING，本 PR 合入 main 后方为 CLOSED**。本单不预写 #166 ready/merged——固化时点 #166 仍为 OPEN + draft（本 pass `gh pr view 166` 实读：`b4694cf…` / OPEN / `draft=true`）。
> - **A-④ 双面绿证**：(i) 构建面 CI 五门 run `33234213554` 在最终 tip `b4694cf` SUCCESS（controller gate receipt + 本 pass `gh run view` 复核 `success`）；(ii) e2e 面 R7 本地跑道 82/0/0/0 三证（证一/二 VERIFIED，证三 = 本 PR）。
>
> 本单为 **docs-only 证据固化**：仅新增本文档一个文件，零 src/e2e/config/assets 改动；固化 pass 未运行/重跑任何 playwright test / preview / build / `--list`（用户明令暂停新跑），未触碰 `/private/tmp/f3r7`（仅只读 git 查询）、#166 分支、`cursor/cc-loop-audit-*` 分支与任何他人 PR。
> 固化时间：2026-08-30（Asia/Shanghai）；机器：wangleideMacBook-Pro-3.local（Darwin 25.6.0, arm64, Apple M5）；固化执行席：`ark-coding-plan/glm-5-3-flash`（GLM-5.3-Flash，工具型 docs writer）。
> 输入：run receipt（`/tmp/f3r7-run-receipt.md`）、controller gate receipt（`/private/tmp/f3r7-controller-gate-receipt.md`）、秘书审计（`/private/tmp/xhsapi-f3r7-audit-out.md`）、`/tmp/f3r7.log` / `/tmp/f3r7-e2e-results.json` / `/tmp/f3r7-last-run.json` / `/tmp/f3r7.start` / `/tmp/f3r7.end` / 两份 list 日志、董事会件 §A-3（`cc-loop-board-nav-bgm-merge.md`）、EOD 交接档（`cc-loop-handoff-2026-08-29-eod.md`）、R6 证据件（`cc-nav-c1-f3r6-evidence.md`）。全部相互核对；本固化 pass 独立复测项逐条标注，未独立复测的按来源标注（receipt-attested / UNKNOWN）。

## 1. SHA 与世系

| 项 | SHA | 说明 |
| --- | --- | --- |
| candidate | `b4694cf2389315156616a99bc88d3228344b8746` | CC-NAV-C1 候选支 tip（#166 head，本 pass 实读仍为该值且 draft） |
| main | `704561978a727113b201dc45286f98b0dd1f7d8d` | R7 开跑实测 main；= **PR #197 mergeCommit**（mergedAt `2026-08-30T02:26:07Z`，本 pass `gh pr view 197` 实读），含 VIS-02 baseline fix（`world-esc-menu.png` 现 SHA `1eb89247…47ca7f` = R6 actual） |
| integration | `1019d2c2eb72f3058a50e31dc01d02585162502e` | `/private/tmp/f3r7` 集成 HEAD；merge commit，两父 = candidate + main（此序） |
| 交接锚 | `211d9d923ada78fc00b6634c4527c896ce0ca03d` | EOD 交接档口径（#192 OBS-01 稳定化） |

本固化 pass 独立复测（全部 VERIFIED，`git rev-parse <sha>^1 ^2` 与 `git merge-base --is-ancestor` 实跑，只读查询）：

- `1019d2c2^1` = `b4694cf`（candidate）、`1019d2c2^2` = `7045619`（main）——**父序 candidate 先、main 后**。
- `b4694cf → 1019d2c2` **exit 0**；`7045619 → 1019d2c2` **exit 0**（两父证）。
- `211d9d9 → 1019d2c2` **exit 0**（交接锚为 integration 祖先）。
- 本地主仓 main = origin/main = `7045619`（worktree add 落点即该 SHA）。

## 2. R7 要件清单（§A-3-2 六条剧本逐项核）

**单次 attempt：VERIFIED** —— receipt 明载 `Run count: exactly one full attempt; no retries, no failed-test reruns`；`/tmp/f3r7.start` / `/tmp/f3r7.end` 各单个（与 R5 双时间戳形态不同）；日志 `Running 82 tests using 1 worker` 仅出现一次（第 6 行）。

| 要件 | 状态 | 证据 |
| --- | --- | --- |
| 跑道独占（ps 核验） | ✅ VERIFIED | 开跑前 scoped ps：零 repo e2e/Astro/headless blocker；仅 baseline-exempt `@playwright/mcp` 双进程（PID 31592/31619，登记勿杀）；终态 final ps 仅刷新后的 exempt 对（86897/86987），未触 |
| 端口隔离 | ✅ VERIFIED | TCP **4531**（JSON `config.webServer.port = 4531`、`url http://127.0.0.1:4531/website/`，本 pass jq 实读）；已用序列 4501 → 4511（R6）→ **4531（R7）**，4521 未用 |
| socket bind 探针 | ✅ VERIFIED | 起跑前 Python bind `PROBE_OK`（receipt） |
| 前台 canary | ✅ VERIFIED | `CI` unset + `ASTRO_PREVIEW_BACKGROUND=1`：parent PID 43134 存活 ≥5s、listener PID 43147、`GET /website/` = 200、precise TERM、端口释放、`PROBE_OK_AFTER_CANARY`（receipt） |
| fresh `--list` 双分母 | ✅ VERIFIED | plain：`Total: 84 tests in 18 files`（`/tmp/f3r7-list-plain.log` 末行）；qualified：`Total: 82 tests in 17 files`（`/tmp/f3r7-list-qualified.log` 末行）；本 pass grep 复核：qualified VIS-0 ×4 在册、CITY-PERF ×0 缺席 |
| `set -o pipefail` + `EXIT=` 尾行 | ✅ VERIFIED | 日志末两行 `EXIT=0` / `NAV_F3_EXIT=0`，未被 tee 吞码 |
| 产物先归档再清理 | ✅ VERIFIED | `test-results/` 全量归档 `/tmp/f3r7-artifacts/test-results/`：**61 files / 36,592 KiB**（本 pass `find -type f \| wc -l` 与 `du -sk` 复核一致）；归档 reporter hash 与独立 JSON 一致（receipt） |

Preflight（receipt-attested，本 pass 未复算）：`pnpm install --frozen-lockfile` exit 0（702 packages reused，pnpm 10.33.3，2.2s）；`pnpm build` exit 0（Astro 7.2.4，19 pages）。

**偏离登记（均非私 deviation）**：

1. `--grep-invert='CITY-PERF-0[12]'`：沿 #178/#182「84−2 规格恒红 = 82 例」已登记口径，两例未运行、未计入 82。
2. `--no-deps` 为 R7 新增项：qualified list 82 = 实跑 82，**未造成用例流失**；以单 worker + 跑道独占为补偿口径，登记备查。
3. 端口序列偏离：EOD §5「下一窗从 4491 起」指引在 R6 时点已过期，R7 取 4531 属自主隔序，**非故障**，登记备查。

## 3. 原始 stats（全部 VERIFIED，本 pass 实读）

| 项 | 值 |
| --- | --- |
| 运行总数 | **82 tests / 1 worker**（`Running 82 tests using 1 worker`；JSON `config.workers = 1`、`metadata.actualWorkers = 1`） |
| passed | **82**（日志摘要 `82 passed (1.2h)`） |
| failed / skipped / flaky | **0 / 0 / 0** |
| JSON `stats` | `expected=82 / unexpected=0 / skipped=0 / flaky=0 / duration=4,193,155.485 ms`（本 pass jq 实读） |
| JSON `stats.startTime` | `2026-08-30T02:29:15.360Z`（= 10:29:15.360 +0800，webServer 就绪起算） |
| JSON 交叉校验 | 82 test objects（本 pass jq 递归计数） |
| 进程退出码 | **0**（`EXIT=0`） |
| `NAV_F3_EXIT` | **0**（pipefail 生效，tee 未吞码） |
| `last-run.json` | `{"status":"passed","failedTests":[]}`（45B，本 pass 实读） |
| 墙钟 | `/tmp/f3r7.start` `2026-08-30T10:29:08+0800`（`START_EPOCH=1788056948`，`HEAD=1019d2c2`）→ `/tmp/f3r7.end` `11:40:21+0800`（`END_EPOCH=1788061221`），`WALL_SECONDS=4273` = **71m13s**（start/end 本 pass 实读） |

目标用例（VERIFIED，log 行号 + JSON）：

- **NAV 3/3**（#166 本体 minimap 三例，test 41–43）：CITY-NAV-01（1.9m）/ CITY-NAV-02（2.1m，含 F2 `boxesDisjoint()` 恒等门）/ CITY-NAV-03（1.3m）全 ✓。
- **VIS 4/4**（test 79–82）：VIS-01（846ms）/ **VIS-02（437ms）** / VIS-03（1.1m）/ VIS-04（1.3m）全 ✓。
- `WS-PERF-01` 软门禁未达标**不阻断**（p95 208.2ms ≥ 50ms、stall 26/27、≈5.3fps、webgl2；log 第 97 行显式标注，真机门禁走 `docs/spec/human-gate-checklist.md` §2 人工录测）。

**R6 红点闭环（补洞序走完，非降级豁免）**：R6 唯一红点 VIS-02（30,037px / ratio 0.03 > 0.02，stale baseline）→ 补洞序步骤 3/4 由 [#197](https://github.com/rayw-lab/website/pull/197) 单文件重签 `world-esc-menu.png`（现 SHA `1eb89247…47ca7f` = R6 actual）落地 → R7 VIS-02 以 **437ms** 通过。红点账已清。

慢文件 top5（log 摘要）：explore 17.4m / feedback 10.2m / city 8.8m / observability 8.6m / minimap 5.3m。

## 4. 董事会 §A-3 三证比对 → 证一/证二成立，证三由本单补齐

| 证 | §A-3-3 判据 | R7 实测 | 判定 |
| --- | --- | --- | --- |
| 证一 | tee 日志末行含 **`NAV_F3_EXIT=0`**（pipefail 生效前提） | 末两行 `EXIT=0` / `NAV_F3_EXIT=0`（`/tmp/f3r7.log` 第 113–114 行） | ✅ **PASS**（VERIFIED） |
| 证二 | stats `expected=82` · `unexpected=0` · `skipped=0` · `flaky=0`（`readFileSync` 实读） | `82 / 0 / 0 / 0`，duration 4,193,155.485 ms（本 pass jq 复读一致） | ✅ **PASS**（VERIFIED） |
| 证三 | 上二证以 commit 上链至审计/登记分支 | R7 时点证据存于 `/tmp/f3r7*` + controller receipt；**本 docs PR 即证三执行件** | ⏳ **PENDING → 本 PR 合入后 CLOSED** |

引用原句：「**三证格式（缺一即视为未跑）**」「**「未上链 ✓ 不构成过门」**」。列表行 `82 passed (1.2h)` 作为证二辅助交叉项一并留痕。**本 PR 合入前，§A-3 过门要件未完整成立；本单只固化 PASS 原始事实，不提前发放过门结论。**

## 5. A-④ 双面绿证（CI 五门 + R7 e2e，分立缺一不可）

| 面 | 内容 | 状态 | 分级 |
| --- | --- | --- | --- |
| (i) 构建面 | CI 门禁五 job（check / build / links / budget / lighthouse）在最终 tip `b4694cf` 绿 | run **33234213554** SUCCESS（2026-08-29T04:36:09Z→04:41:02Z，controller gate receipt）；本 pass `gh run view` 复核 `conclusion=success`、`headSha=b4694cf`（固化时点 fresh） | receipt-attested + 本 pass fresh 复核；合入后仍须父代理再 fresh（head/CI 可再变） |
| (ii) e2e 面 | 全量 82 例（84−2 规格恒红）0/0/0 + 三证上链 | 证一 PASS / 证二 PASS（VERIFIED）；证三 = 本 PR（合入闭环） | 证一/二 VERIFIED，证三 PENDING |

> 注：F3 **不挂 CI**（CI 门禁五 job 不含全量 e2e），#182 r2 已定口径；R7 剧本与之一致（本地跑道 + 独占 + 端口隔离 + pipefail + `NAV_F3_EXIT=` 尾行 + 产物先归档）。

## 6. 失败分账（沿 #178 终账三分法）

| 账 | 数 | 明细 |
| --- | --- | --- |
| 规格恒红（仓库账） | **0** | `CITY-PERF-01/02` 以 `--grep-invert='CITY-PERF-0[12]'` 整族排除，两例未运行、未计入 82 |
| 真回归（候选账，零容忍） | **0** | CITY-NAV-01/02/03 全 ✓；world-chromium 全族（AUD/EXP/QST/FB/HINT/PA/OBS/SIGN/E2E/VEH）、world-spike 全族、car、mobile、desktop、tts、site-health 全 ✓ |
| 环境性 | **0** | 无环境指纹失败；JSON `flaky=0`、`skipped=0` |

## 7. 归档与清场

- `test-results/` 全量归档 `/tmp/f3r7-artifacts/test-results/`：**61 files / 36,592 KiB**（本 pass 复核一致）。
- 24 条被测试覆写的 tracked 截图：登记于 `/tmp/f3r7-artifacts/dirty-paths.txt` → 备份 `/tmp/f3r7-artifacts/evidence-overwritten/` → 逐条 `git restore -- <exact-path>`（receipt-attested）。
- 终态 `/private/tmp/f3r7` porcelain **0**、HEAD 未动（= `1019d2c2`）。
- 终态 TCP 4531：无 listener（`FINAL_PROBE_OK_AFTER_RUN`）。
- 终态 lane 进程零；刷新后的 baseline-exempt `@playwright/mcp` 双进程（86897/86987）登记未触。
- `/private/tmp/f3r7` worktree 留存供 controller 复查。

## 8. 不可改写数字总表

数字只许追加、引用或显式标注作废，禁止就地改值。

| 项 | 不可改写值 | 分级 |
| --- | --- | --- |
| R7 attempt 性质 | exactly one full attempt；no retries；no reruns | VERIFIED（marker 计数 + start/end 单个） |
| 运行总数 | 82 tests / 1 worker | VERIFIED |
| 结果 | **82 passed / 0 failed / 0 skipped / 0 flaky**；`EXIT=0` / `NAV_F3_EXIT=0` | VERIFIED |
| JSON stats | `expected=82 / unexpected=0 / skipped=0 / flaky=0 / duration=4,193,155.485 ms`；startTime `2026-08-30T02:29:15.360Z` | VERIFIED |
| last-run | `status=passed`、`failedTests=[]` | VERIFIED |
| 墙钟 | **4273 s = 71m13s**（10:29:08 → 11:40:21 +0800） | VERIFIED（start/end 文件实读） |
| 分母 | plain **84/18**；qualified **82/17**（VIS-01..04 在、PERF-01/02 不在） | VERIFIED |
| NAV / VIS | **NAV 3/3**（tests 41–43）· **VIS 4/4**（tests 79–82，VIS-02 **437ms**） | VERIFIED |
| 剧本参数 | `--workers=1 --grep-invert='CITY-PERF-0[12]' --no-deps`（偏离登记见 §2） | VERIFIED（argv，审计实读） |
| 端口 | **4531**（R6 为 4511，勿混） | VERIFIED（JSON config 实读） |
| 唯一历史红点 | R6 VIS-02 30,037px / ratio 0.03 > 0.02 → R7 已清（#197 baseline） | VERIFIED |
| Preflight | install exit 0（702 reused，2.2s）；build exit 0（Astro 7.2.4，19 pages）；TCP 4531 `PROBE_OK` | receipt-attested |
| 前台 canary | parent 43134 / listener 43147 / `GET /website/` 200 / `PROBE_OK_AFTER_CANARY` | receipt-attested |
| 归档 | test-results **61 files / 36,592 KiB** | VERIFIED（本 pass 复核） |
| 清场 | 24 条覆写→备份→restore；porcelain **0**；TCP 4531 无 listener；lane 零 | receipt-attested（归档与 restore 链）+ VERIFIED（终态结论在案） |
| candidate / main / integration | `b4694cf…` / `7045619…`（=#197 mergeCommit）/ `1019d2c2…`（两父 candidate+main 此序） | VERIFIED（本 pass 实跑） |
| 世系 | `211d9d9 → 1019d2c2` exit 0 | VERIFIED（本 pass 实跑） |
| CI | run **33234213554** SUCCESS（`b4694cf`，04:36:09→04:41:02Z） | receipt-attested + 本 pass fresh 复核 success |
| WS-PERF-01 | 软门禁未达标不阻断（p95 208.2ms、stall 26/27、≈5.3fps、webgl2） | VERIFIED（log 第 97 行） |
| R7 主腿目标值 | `expected=82 / unexpected=0 / skipped=0 / flaky=0 / EXIT=0 / NAV_F3_EXIT=0` | **实测即目标值**（非占位） |

## 9. 证据清单（/tmp 原始件 · 字节 · SHA-256）

| 文件 | 字节 | SHA-256 | 本 pass 复算 |
| --- | ---: | --- | --- |
| `/tmp/f3r7.log` | 21,173 | `0d81282059fdb77f8c05bb6081598dc40c87831b60a80e3d54001a86c7312f2d` | ✅ 一致 |
| `/tmp/f3r7-e2e-results.json` | 131,583 | `42676385f713abd2fda3f18c812098cc3c7b275def730196e3a402440cf0b7eb` | ✅ 一致 |
| `/tmp/f3r7-last-run.json` | 45 | `91d1c43004802cd49950d78eb11c8fa7d05da8ffffe219a8b13b2f561bc00903` | ✅ 一致 |
| `/tmp/f3r7.start` | 94 | `21dd484e88a41a4064564484c815c3fcd683797851dc9ba5840f172626ac6b54` | ✅ 一致 |
| `/tmp/f3r7.end` | 64 | `bfa421841ac3d3caec5507d6f05f4f6afad4603f9c0c89e050c7e202ad2764ab` | ✅ 一致 |
| `/tmp/f3r7-list-plain.log` | 17,840 | `4c70b4664e7f369643058b3b2daf44d2a38b1381b897d7f07562ae8730a6a579` | ✅ 一致 |
| `/tmp/f3r7-list-qualified.log` | 17,274 | `b39bf44dd431c741bfb28150a151d6a3dd291442b72c44d413e640d91a95d287` | ✅ 一致 |

两份 list log SHA 与 R6 归档值**完全相同**（`4c70b466…` / `b39bf444…`）——两窗分母口径同源，间接 VERIFIED。另在档：`/tmp/f3r7-artifacts/`（`test-results/` 全量 61 files / 36,592 KiB；`dirty-paths.txt` 24 条；`evidence-overwritten/` 24 文件）。`/private/tmp/f3r7` worktree 留存供 controller 复查。临时件灭失后以本单为准。

## 10. 合入后下一步（仅机械动作，父代理执行）

1. **fresh 核 #166**：`gh pr view 166 --json headRefOid` 仍 = `b4694cf`；`git log -1 origin/main` 仍 = `7045619`；`gh pr checks 166` 五 job 现绿（或更新 run）。
2. `gh pr ready 166`。
3. squash 合入 #166（message 含 `CC-NAV-C1` + 短 SHA `b4694cf`）。
4. **SEC-R9** 收账（D-1 六字段，SEC-R8 已被 #181 占用；A-④ 双证分列：CI run URL + 本件上链 SHA）。

同用户指令：**本轮不再运行任何浏览器/Playwright**；上列动作均为机械命令，无新跑窗。

## 11. 附：本轮未做与禁做

- **未做**：未改任何 src / e2e / config / assets（含未动 `world-esc-menu.png` 基线、`world-visual.spec.ts`、`playwright.config.ts`、阈值、mask、poster）；未 ready / 未 merge #166；未重跑 R6/R7；未开 R8 标签；固化 pass 未运行任何 playwright test / preview / build / `--list`。
- **禁做**（继受在案）：在证三（本 PR）合入前记 §A-3 过门为已完成；把 #166 写成 ready/merged；同 R7 标签重跑/复用；以任何口径降级「未上链 ✓ 不构成过门」立法。
- **未触**：`/private/tmp/f3r7`（仅只读 git 查询，零写入）、`cursor/cc-loop-audit-*` 分支、历史看板块、#166/#177/#185 等他人 PR、CAM 红线 v2 §8 签字、真机性能六腿、安卓 S-2（EOD §4 未决件维持未决）。
- **登记矩阵维持**（EOD 交接档 §0）：生产登记 综合 **80** / 视觉 **73** / 功能 **87** / 性能 **—**；本单零登记分变动。

---

*Ownership 尊重：本单仅新增本文档一个文件；未触碰 `/private/tmp/f3r7`、任何 src/e2e/config/assets、#166/#177/#185 等他人 PR、`cursor/cc-loop-audit-*` 分支、历史看板块。*
