# CC-NAV-C1 F3 R5 破门证据固化单（FAIL：PROCEDURAL_BROKEN_GATE + SUBSTANTIVE_FAIL）

> **R5 VERDICT = FAIL（PROCEDURAL_BROKEN_GATE + SUBSTANTIVE_FAIL）**，两段并列、不合并：
>
> - `PROCEDURAL_BROKEN_GATE`：同一 R5 标签发生两次 full attempt；attempt 1 截断且无 `EXIT=`、reporter JSON 被 attempt 2 覆盖 → 三证物理不可能成立，复述 R4 已明令禁止的形态；
> - `SUBSTANTIVE_FAIL`：attempt 2 诊断账 qualified 82 = 78 passed / 0 failed / **4 skipped** / 0 flaky、`EXIT=1`，不满足董事会 §A-3-3 证二判据（82/0/0/0）。
>
> **本 verdict 不得给 #166 放行**：#166 保持 draft，A-④ e2e 面仍未过门。
>
> 本单为 **docs-only 证据固化**：仅新增本文档，零 src/e2e/config 改动；固化 pass 未运行/重跑任何 playwright test / preview / build / `--list`，未触碰 `#166` 分支、`/tmp/f3r5` worktree、`cursor/cc-loop-audit-*` 分支与任何他人 PR。
> 固化时间：2026-08-30（Asia/Shanghai）；机器：wangleideMacBook-Pro-3.local（Darwin 25.6.0, arm64, Apple M5）。
> 输入：controller receipt（`/private/tmp/f3r5-controller-audit-receipt.md`）、秘书审计（`/private/tmp/xhsapi-f3r5-audit-out.md`）、四份 /tmp 原始证据、`/tmp/f3r5/playwright.config.ts`、董事会件 §A-3（`cc-loop-board-nav-bgm-merge.md`）、EOD 交接档（`cc-loop-handoff-2026-08-29-eod.md`）、R4 证据件（`cc-nav-c1-f3r4-evidence.md`）。全部相互核对；本 pass 独立复测项逐条标注，未独立复测的按来源标注（receipt-attested / INFERENCE / UNKNOWN）。

## 1. SHA 与世系

| 项 | SHA | 说明 |
| --- | --- | --- |
| candidate | `b4694cf2389315156616a99bc88d3228344b8746` | CC-NAV-C1 候选支 tip（#166 head，`cursor/cc-nav-c1-minimap-8ca4`） |
| main | `543306349c6f29277f7e6bb576ff5b592cd24aa6` | 本单开工实测：origin/main = 本地 main = `5433063`，主仓 status porcelain 0 行（零漂移） |
| integration | `edc967f8a20b0d2bcc579af1b7a8a284c4ac550c` | `/tmp/f3r5` 集成 HEAD；merge commit，两父 = candidate + main |
| 交接 main | `211d9d923ada78fc00b6634c4527c896ce0ca03d` | EOD 交接档口径（#192 OBS-01 稳定化） |

本 pass 独立复测（全部 VERIFIED，`git merge-base --is-ancestor` 实跑）：

- `b4694cf → edc967f` **exit 0**；`5433063 → edc967f` **exit 0**（两父证）。
- `211d9d9 → edc967f` **exit 0**（交接锚为 integration 祖先）。
- 秘书审计 §5-1 标 `UNKNOWN` 的「三个互异 main SHA」（R4 口径 `eed86406…` / R5 口径 `5433063…` / 交接口径 `211d9d9`）由本 pass 消解为**同链快进**：`eed8640 → main` exit 0、`211d9d9 → main` exit 0，时间线 `211d9d9`(#192) → `eed8640`(#193) → `5433063`（现 main）。各口径均为其当时实测，无冲突，「不得互代」禁令解除。

## 2. Attempt 1：ABORTED/TRUNCATED，不可采

时间线（/tmp 时间戳文件，VERIFIED）：

- 08-29 22:00:48 CST：开跑前 fresh `--list`（plain）→ `Total: 84 tests in 18 files`（`/tmp/f3r5.list.log` 落盘；与 candidate `b4694cf` 登记 84/18 一致，#182 A-⑤）。
- 08-29 22:01:30 CST：attempt 1 开跑（`/tmp/f3r5.start`）。

原始残留日志 `/tmp/f3r5.log.aborted1`（**13024 bytes，SHA-256 `175be4e9b39eacd08df1d40d621d6f7d15205c016550f98cca1370f8d30d898e`**，与 receipt 一致）：

- 第 6 行 `Running 84 tests using 1 worker`；
- 逐条 ✓ 至第 **53** 条（本 pass `grep -c '✓'` 实数 53），末条 `CITY-PA-03`；
- **无 `EXIT=` 尾行**（`grep EXIT` 零命中）、**无完成摘要**；
- 对应 reporter JSON 已被 attempt 2 覆盖（receipt 原文）→ 证一/证二/证三均物理不可能成立。

截断根因：**INFERENCE: OMP bash 长命令时限**。无独立机器错误回执佐证，不得写成 VERIFIED、不得升级。

## 3. Attempt 2：同标签违规重跑后的诊断账，不可作过门

过程违规（PROCEDURAL）：attempt 1 中止后，**同一 R5 标签**又发起第二次 full attempt（`/tmp/f3r5.start2` = 08-29 23:22:34 CST）。R4 证据件 §6 已明令「Controller 已中止原 OMP worker 并**明令禁止同标签重跑**」；董事会 §A-3-2 剧本以「跑道独占、产物先归档、单次」为前提。故本 attempt 全部结果**只能作诊断账，不能作过门证据**——本单与 receipt、秘书审计 §1 双 attempt 可采性表同判。

原始账（未加工，全部 VERIFIED）：

- 日志 `/tmp/f3r5.log`：**27277 bytes，SHA-256 `0f5970249d717a1855cbf85a56fd366d7f331ad28d75b6b3e8816e6fd9f9a0c2`**；第 6 行 `Running 84 tests using 1 worker`；摘要 **78 passed (1.1h) / 2 failed / 4 did not run**；**末行 `EXIT=1`**（且非 §A-3-3 要求的 `NAV_F3_EXIT=` 前缀）。
- `/tmp/f3r5-e2e-results.json`：**SHA-256 `8e2d1ecb6afcb80b92df3ed399a9908613ff48a0daf0f54b21115e6f27b96a75`**；stats 本 pass 实读：**`expected=78 / unexpected=2 / skipped=4 / flaky=0 / duration=4,118,412.662ms`**；`startTime=2026-08-29T15:24:54.877Z`（= 23:24:54 CST，start2 后 2m20s，webServer 就绪后起算）。
- `/tmp/f3r5-last-run.json`（SHA-256 `0051bca3f4d1cf83b1f75578795bd011836d718623aac284c05ea4c2540ceac6`）：`{"status":"failed","failedTests":[2 条]}`。
- 墙钟：start2 23:22:34 → `/tmp/f3r5.end` 08-30 00:34:02 ≈ 71.5min，与日志摘要 1.1h（纯测试 duration 68.6min）一致。

## 4. 失败面分账（沿 #178 终账三分法）

| 账 | 数 | 明细 |
| --- | --- | --- |
| 规格恒红（仓库账） | **2** | `CITY-PERF-01`（spec `e2e/cyber-city-perf.spec.ts:281`，断言落 `:404`）、`CITY-PERF-02`（`:555`，断言落 `:640`） |
| 真回归（候选账） | **0** | CITY-NAV-01/02/03 全 ✓（test 序号 41–43，minimap 三例零失败） |
| 依赖链跳过（runner 账） | **4** | VIS-01..04（§5） |
| 环境性 | **0** | 无环境指纹失败 |

两条 failed 的 error 原文（JSON 实读，VERIFIED）：

- `Error: HUD 帧率仪表应有「均值 / 1% low」读数`（PERF-01）／`Error: Q2 档 HUD 帧率仪表应出数`（PERF-02）；
- 共同：`waiting for locator('[data-ws-fps]')` → **`Error: element(s) not found`**；`Expected pattern: /^\d+ \/ \d+$/`；`Timeout: 30000ms`。

`[data-ws-fps]` 缺席属 **#183 调研已定性的规格恒红（挂点缺席，仓库账）**，非 #166 minimap 产品断言失败；**真 #166 功能回归 = 0**。但按 §A-3-4，恒红两例已在分母中扣除（84−2=82），**skipped=4 仍构成硬门失败，不得降级**。

## 5. 四 skipped 精确项目与 producer → consumer 根因

四例（JSON 逐条实读，VERIFIED）：

| # | 用例 | project | 文件:行 | status |
| --- | --- | --- | --- | --- |
| 1 | VIS-01 @visual 壳静态基线 | visual-chromium | `e2e/visual/world-visual.spec.ts:53` | `skipped` |
| 2 | VIS-02 @smoke3d ESC 菜单 | visual-chromium | `e2e/visual/world-visual.spec.ts:74` | `skipped` |
| 3 | VIS-03 @smoke3d 首幕取证 | visual-chromium | `e2e/visual/world-visual.spec.ts:101` | `skipped` |
| 4 | VIS-04 @smoke3d POI 深链取证 | visual-chromium | `e2e/visual/world-visual.spec.ts:121` | `skipped` |

根因链（全部一手，VERIFIED）：

1. producer：`city-perf-chromium` 的 CITY-PERF-01/02 → `status: unexpected`（§4）。
2. 契约：`/tmp/f3r5/playwright.config.ts:133` —— visual-chromium project（name 在 `:130`）明写 `dependencies: ['city-perf-chromium'], // [CC-PERF-C1] 依赖链改指新殿后节点（§1.3 ③）`。
3. consumer：Playwright project dependency 语义 —— 依赖 project 未成功 → 被依赖 project 用例整体 skipped（非 failed）。PERF 的 2 例失败经依赖链传导为 VIS 的 4 例 skipped。
4. **非 maxFailures**：JSON `config.maxFailures=0`（本 pass 实读；0 = 无失败上限），排除 early-abort 形态。

硬门判定：qualified 82 = **78 passed / 0 failed / 4 skipped / 0 flaky ≠ 82/0/0/0** → §A-3-3 证二判据不成立。skipped 属 runner/依赖语义而非产品失败，但门只认 stats，不认语义归因（§A-3-4 禁把 skipped 降级处理）。

## 6. 董事会 §A-3 三证比对 → R5 全不成立

| 证 | §A-3-3 判据 | R5 attempt 1 | R5 attempt 2 | 结论 |
| --- | --- | --- | --- | --- |
| 证一 | tee 日志含 **`NAV_F3_EXIT=0`** 尾行（pipefail 生效前提） | 无任何 `EXIT=` 行 | 末行 `EXIT=1`（且非 `NAV_F3_EXIT=` 前缀） | ✗ |
| 证二 | JSON stats `expected=82`（或 82+k）· `unexpected=0` · `skipped=0` · `flaky=0`，`readFileSync` 实读，禁转述 | reporter 已被覆盖 | 78 / 2 / 4 / 0 | ✗ |
| 证三 | 上二证以 commit 上链至审计/登记分支 | — | 无有效二证可上链 | ✗ |

引用原句：「**三证格式（缺一即视为未跑）**」「**「未上链 ✓ 不构成过门」**（口头／聊天窗里的「跑绿了」一律不采信）」。R5 三证全不成立；叠加同标签双 attempt 过程违规 → **R5 = FAIL（PROCEDURAL_BROKEN_GATE + SUBSTANTIVE_FAIL）**，#166 A-④ e2e 面未过门，**不得 `gh pr ready`**。

## 7. R6 候选（仅登记，**未运行**）

> ★ **R6 未运行**：本单与 R5 均未执行任何 R6 测试；下述命令为候选，**不得视为已验证 PASS**；R6 三证填实前禁止预写任何 ✓。

探针（receipt 记录，R5 窗内实测）：

```bash
pnpm exec playwright test --list --grep-invert='CITY-PERF-0[12]' --no-deps
# → Total: 82 tests in 17 files
```

含 VIS-01..04 与 desktop/mobile/car/world-chromium 全族、home/lab/site/tts 全部用例；仅排除 `CITY-PERF-01/02`，连带 `e2e/cyber-city-perf.spec.ts` 整文件消失（18→17 files）——**不会遗漏任何非 PERF 用例**。

落盘复核（本 pass，VERIFIED）：`/tmp/f3r5.list.log`（08-29 22:00:48，attempt 1 前置分母复核）与 `/tmp/f3r5-qualified82-list.txt`（08-30 04:25 生成的副本）**逐字节相同**（`diff` exit 0），均 `Total: 84 tests in 18 files`——与 84/18 登记分母一致，也与 receipt「不加 `--no-deps` 时 visual dependency 把两条 PERF 重新纳入、仍显示 84/18」的因果表述相容（该因果秘书审计标 `INFERENCE`，维持不升级）。**82/17 的原始输出未见落盘**，本单按 receipt 一手文本登记为 receipt-attested；本固化 pass 未运行任何 `--list` 独立复测。

完整候选命令（**未运行**）：

```bash
set -o pipefail
pnpm exec playwright test --workers=1 --grep-invert='CITY-PERF-0[12]' --no-deps 2>&1 | tee /tmp/f3r6.log
EXIT=$?
echo "EXIT=$EXIT" | tee -a /tmp/f3r6.log
```

候选要件（开跑前置，全部**未勾**）：

1. **新标签 R6 + single attempt**：禁同标签续跑/刷绿（R5 双 attempt 即反教材）；任何中断必须换新标签。
2. **fresh worktree**：`git status --porcelain` 必须为空；开跑当时实测 SHA 写入 R6 证据首行。
3. **独占新端口**：已用序列 4441/4451–4453/4461–4481/4491/4501，取下一空闲值；Python socket bind 探针须 `PROBE_OK`。
4. **前台化 preview**：`ASTRO_PREVIEW_BACKGROUND=1`（或 `env -u CLAUDECODE -u AGENT`），防 R4 破门机制复发（agent-detection → Astro preview daemonize → webServer `exited early` → 0 suites）；日志首行打印 env 探针结果。
5. **稳定长跑 runner**：命令不得依赖 OMP bash 时限（attempt 1 截断根因 INFERENCE 即此），改 `nohup`/`setsid` + 轮询或分段落盘；`set -o pipefail` 必需（否则 `EXIT=` 尾行无效）。
6. **ps 独占核验**：开跑前 scoped `ps` 零 chrome／零 chrome-headless／零他方 preview → `NO_E2E_BLOCKERS`（用户桌面常驻 Chrome 属常态，登记勿杀）。
7. **产物先归档再清理**：`test-results/` 与 `e2e-results.json` 先拷入独立证据目录。
8. **三证上链**（§A-3-3）：`NAV_F3_EXIT=0` 尾行 + stats `readFileSync` 实读 82/0/0/0 + commit SHA；未上链的 ✓ 不构成过门。

## 8. `--no-deps` 偏离登记与分母口径

- **偏离**：`--no-deps` 跳过 project dependency 图，**破 `playwright.config.ts:133` 明写的依赖契约**（其注释纪律目的：线性链保证「任意时刻至多一个重 3D 上下文」）。破链后该纪律只剩 workers 兜底——一旦将来调回 `workers=2`，R2「workers=2 挤兑致 preview 崩溃连坐 21」的失效形态将原样复现。
- **纪律补偿**（缺一即仍 FAIL）：`--workers=1`（全量窗立法，R2 实证）+ 开跑前 scoped `ps` 独占核验 + socket bind 探针。
- **分母分列**：**82/17 = `--grep-invert --no-deps` 下的运行资格分母**（probe 值）；**登记总分母仍 84/18**（`cyber-city-test-framework.md` 用例数登记，#182 A-⑤；双落终值 86/19 不受影响）。两者必须分列呈现，禁止把 82/17 写成「84/18 的合格子集」或静默替换登记分母。
- 秘书审计 §4.3 三条保留意见原样登记在案：①「账面扣除」被变成「运行期排除」（§A-3-4 明禁的「把 82 例改成跑得动的那些例」变体，恒红取证量 = 0 执行 = 0 证据）；②抹掉配置依赖契约（见上）；③分母静默变更（见上）。秘书审计 §4.1 对 receipt 因果表述的 `INFERENCE` 标注维持。

## 9. 恒红见证不另跑（controller 对秘书建议的裁决）

- **秘书建议原意**（`xhsapi-f3r5-audit-out.md` §4.4-a）：另发一发 `--grep='CITY-PERF-0[12]' --no-deps` 的 PERF-only 见证腿（预期 `expected=2 / unexpected=2 / skipped=0 / EXIT=1`），使「84−2」在两份 reporter 上可被独立复核。
- **Controller 裁决：不另跑。** 理由：R5 attempt 2 已**完整执行** CITY-PERF-01/02 并留原始失败证——log `2 failed` 摘要 + JSON error 原文（§4）+ `/tmp/f3r5-artifacts/perf-failures/` 归档的两套 `test-failed-1.png` / `trace.zip` / `error-context.md`；再一次 PERF-only 重跑**违反最小化**：同标签性多余运行且零新增信息量。
- **处置**：R5 attempt 2 的 PERF-01/02 原始失败证 + **#185（draft `c43cd72`，案 A：改锚 `__worldSpike.fps()`，#183 调研定性挂点缺席）** 作为 R6 accounting 伴生证据；秘书 §4.4-b「CC-PERF 规格工单绑定」由在途的 #185 满足。
- 本节为 **controller 对秘书建议的裁决记录**；秘书原意（另发见证腿）如上原样保留登记，不代秘书改写。

## 10. 清场结果

本 pass 实测（2026-08-30）：

- **4501 无 listener**：`lsof -nP -iTCP:4501 -sTCP:LISTEN` 空表（exit 1）。
- **无 `/tmp/f3r5` runner/preview 进程**：`pgrep -fl 'playwright|astro'` 仅命中 OMP 浏览器自动化的 `playwright-mcp` 两进程（与本跑道无关，如实登记），零 f3r5 runner/preview。
- **worktree clean**：`/tmp/f3r5` `status --porcelain` 0 行，HEAD = integration `edc967f`。
- **截图覆写清单已备份并 restore**：`/tmp/f3r5-artifacts/dirty-paths.txt` 登记覆写 PNG **24 条**（`docs/spec/assets/e2e-batch1/` 14 + `e2e-integration/` 10）；备份树 `/tmp/f3r5-artifacts/evidence-overwritten/` 实存 **24 文件**（本 pass 计数）；`/tmp/f3r5` porcelain=0 → restore 完成成立。
- **证据文件保留**：四份 /tmp 原始证据在档，SHA-256 见 §11。

## 11. 不可改写数字总表与证据清单

数字只许追加、引用或显式标注作废，禁止就地改值。

| 项 | 不可改写值 | 状态 |
| --- | --- | --- |
| attempt 1 | 53 passed（末条 CITY-PA-03），无 EXIT，截断；13024B，SHA `175be4e9…` | VERIFIED |
| attempt 1 截断根因 | OMP bash 长命令时限 | **INFERENCE**（禁升 VERIFIED） |
| attempt 2 | `expected=78 / unexpected=2 / skipped=4 / flaky=0 / duration=4,118,412.662ms`；78 passed / 2 failed / 4 did not run / 1.1h；`EXIT=1` | VERIFIED |
| 两条 failed | CITY-PERF-01（`:281`，断言 `:404`）、CITY-PERF-02（`:555`，断言 `:640`），选择器 `[data-ws-fps]` | VERIFIED |
| 四条 skipped | VIS-01..04（`visual/world-visual.spec.ts` `:53/:74/:101/:121`），status `skipped` | VERIFIED |
| `maxFailures` | 0（非失败上限） | VERIFIED |
| qualified 82 | 78 passed / 0 failed / 4 skipped / 0 flaky → **≠ 82/0/0/0** | VERIFIED |
| 依赖传导 | `visual-chromium.dependencies = ['city-perf-chromium']`（config `:133`） | VERIFIED |
| R4 既成事实 | `BROKEN_GATE`、`RAW_EXIT=1`、`QUALIFIED_82=NOT_RUN`、孤儿 preview PID 81069 | VERIFIED（R4 件） |
| R4 破门机制 | `CLAUDECODE`/`AGENT` → agent detection → Astro preview daemonize → webServer `exited early` → 0 suites | VERIFIED（R4 件） |
| 分母登记 | 84/18（CC-NAV-C1，`b4694cf`，#182 A-⑤）；86/19（双落终值）；恒红 2 例 | VERIFIED |
| R6 probe | `--list --grep-invert='CITY-PERF-0[12]' --no-deps` → `Total: 82 tests in 17 files` | receipt-attested（原始输出未落盘；R6 命令本身**未运行**） |
| R6 主腿目标值 | `expected=82 / unexpected=0 / skipped=0 / flaky=0 / EXIT=0` | **占位期望，非实测** |
| 世系 | `b4694cf` + `5433063` → `edc967f`；`211d9d9`、`eed8640` 均 main 祖先 | VERIFIED（本 pass exit 0） |

原始证据（/tmp，易失，本 PR 即持久化载体）：

| 文件 | 大小 | SHA-256 |
| --- | --- | --- |
| `/tmp/f3r5.log.aborted1` | 13024B | `175be4e9b39eacd08df1d40d621d6f7d15205c016550f98cca1370f8d30d898e` |
| `/tmp/f3r5.log` | 27277B | `0f5970249d717a1855cbf85a56fd366d7f331ad28d75b6b3e8816e6fd9f9a0c2` |
| `/tmp/f3r5-e2e-results.json` | 140857B | `8e2d1ecb6afcb80b92df3ed399a9908613ff48a0daf0f54b21115e6f27b96a75` |
| `/tmp/f3r5-last-run.json` | 145B | `0051bca3f4d1cf83b1f75578795bd011836d718623aac284c05ea4c2540ceac6` |

另在档：`/tmp/f3r5-artifacts/`（`dirty-paths.txt` 24 条 / `evidence-overwritten/` 24 文件 / `perf-failures/` 两套失败取证）、`/tmp/f3r5.list.log` 与 `/tmp/f3r5-qualified82-list.txt`（均 84/18）、`/tmp/f3r5.start` / `.start2` / `.end` 时间戳、controller receipt 与秘书审计（/private/tmp）。临时文件灭失后以本单为准。

---

*Ownership 尊重：本单仅新增本文档一个文件；未触碰 `/tmp/f3r5`、任何 src/e2e/config、#166/#177/#185 等他人 PR、`cursor/cc-loop-audit-*` 分支、CAM/真机/安卓件。*
