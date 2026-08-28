# CC-LOOP-AUDITOR-RUN8 独立复核——同机 run8 ×2 leg2

- **model slug**: `claude-fable-5-thinking-xhigh`
- **角色**: 独立只读复核（防自跑自判）；零 `src/`、零 `e2e/` 改动，本分支仅交本报告。
- **取证窗口**: 2026-08-28 09:21–09:36 UTC，全部一手（`git fetch` + `gh api` + 链上 blob 逐份核验）。
- **口径**: Board R3 [#151](https://github.com/rayw-lab/website/pull/151) §F 最高优先 + run7 审计 [#154](https://github.com/rayw-lab/website/pull/154) §4 四条件为硬门；
  [#153](https://github.com/rayw-lab/website/pull/153)（run5 有条件 GO / 预签 IGNITION-run6）**整份作废，本审计零沿用**；run5 α/β 维持 R3 §F 诊断趟定谳，与本 leg2 计数无涉。
- **R4-PERF 核对**: [#155](https://github.com/rayw-lab/website/pull/155) 仅涉性能排程（§C 序 A/B），未修改 run8 审计口径——本单口径以 §F + #154 §4 为准无增量。

## 0. 裁决一行

**GO——run8 计 ×2 leg2，×2 记账 1/2 → 2/2（✓✓ 闭合）；可进指挥官签字门（扩大清单含 #134 三 spec），#129 合流以签字门通过为唯一剩余前置。**

## 1. 审计机与跑道机分离（防自跑自判）

| 项 | 值 |
|----|-----|
| 跑道机（run8 执行） | `cursor-44cb5599-cursor`（IGNITION `host_fingerprint` = vacuum 头行 `host=` = README 证据来源行，三档互证；与 run7 跑道同机——同机强制令维持） |
| 审计机（本单） | `hostname` = `cursor`，fresh VM（`uptime -s` = 09:20:30Z），且 `/tmp/evidence-exp01/` 与 `/tmp/env-exp01-run8.log` 均不存在——本 VM 无跑道运行时痕迹，复核仅凭链上证据 |

## 2. 一手核验结果（全部对号）

证据锚点：#129（[PR](https://github.com/rayw-lab/website/pull/129)，head `cursor/cc-fxn-exp01-env-5b71`）tip = **`f5e8adb`**
（`gh api` 实测 2026-08-28T09:23:03Z：「EXP-01 run8 同机决定趟证据上链——RUN8_EXIT=0 ~18.2m……禁预写」）。
审计开窗时 tip 尚为 `fecf595`（无 `run8/`），09:23 上链后即转全量核验——「待上链」有条件 GO 路径不再需要。

| # | 核验项 | 结果 |
|---|--------|------|
| 1 | 三证上链 `docs/research/exp01-evidence/run8/` | ✓ 10 份文件齐（IGNITION / vacuum / log / JSON / README×2 / 埋点 dump / 截图×3），`git show --stat f5e8adb` 确认**纯证据提交，零 `src/` 零 `e2e/`**（492 insertions 全在 `run8/`） |
| 2 | `RUN8_EXIT=0` | ✓ `env-exp01-run8.log` 末行 `RUN8_EXIT=0`，`1 passed (18.2m)`，0 failed/skipped/flaky |
| 3 | 墙钟 ~18.2m | ✓ JSON `stats.duration=1091232.6ms`（=18.19min≈18.2m，README 登记 1091233ms 一致）；测例 `dur_ms=1088592`（log 内 18.1m 为测例净时，口径一致） |
| 4 | `expected:1` | ✓ JSON `expected:1 / unexpected:0 / skipped:0 / flaky:0`；log「Running 1 test using 1 worker」（grep `CITY-EXP-01` 定向，spec 285 行），测例 status=`expected`、result=`passed` |
| 5 | tip 谱系含基线 v2 + 东线 | ✓ `git merge-base --is-ancestor` 实测：`00fd832`（基线 v2）、`49a5d6a`（东线改线）、`fecf595`（run7 证据）均为 f5e8adb 祖先；f5e8adb 父提交 = fecf595（直接叠加，无插入提交） |
| 6 | 区间纯证据性（§4-③ 条款） | ✓ `00fd832..f5e8adb` 区间仅三笔纯证据提交（`4ee0c02` run5-α 抢救 + `fecf595` run7 包 + `f5e8adb` 本包），`git diff --name-only` 实测区间**只触碰 `docs/research/exp01-evidence/`**——×2 窗内 #129 零非证据提交，基线未失效 |
| 7 | IGNITION-run8 四要素（§F5-3） | ✓ ① HOLD 核对行「run7 GO ×2=1/2 (#154); run5/run6 burned; tip lineage 00fd832..fecf595」② 本盘 fresh 真空档路径 `/tmp/evidence-exp01/vacuum-run8.txt` ③ `tip_frozen: fecf595`（§4-③ 明文预认合格：「`4ee0c02` / `fecf595` 均合格」）④ `host_fingerprint: cursor-44cb5599-cursor` |
| 8 | 真空三查 | ✓ @09:01:48Z PASS：chrome=0 / headless_shell=0 / load1=0.07 / astro=0，host 行与 IGNITION 指纹一致 |
| 9 | sha256 防伪 | ✓ 链上 9 份 blob 逐一 `sha256sum`，与 README.md 登记表**全数一致**（含三张截图 518399/457297/515368 bytes = 登记 506/447/503KB） |
| 10 | 埋点互证 + 硬闭点 | ✓ `session-dump-explore.json` startedAt 09:01:53.602Z、deep-link `autodrive-lab`、`backend:webgl2 / vehicle:physics`、`explore-progress 1/12` + bounding-out→in 去重链，与测例名四段（深链发现→驾驶+1→重复进圈去重→reload 还原）逐段吻合；硬闭 09:01:49+65min≈10:07Z，实际 exit ≈09:20:00Z（startTime+duration），EXIT 先到 |

## 3. 两键时序裁定（IGNITION-run8 × vacuum-run8）——§4-① 正挂判定

实测时间链（单调自洽）：

```
09:01:47Z    IGNITION-run8 v1 头行签发（parent，跑道机原件，tip_frozen=fecf595）
09:01:48Z    vacuum-run8 真空三查 PASS（同机）
≥09:01:48Z   令内补签行落盘（「真空补签: PASS @2026-08-28T09:01:48Z (file vacuum-run8.txt)」）
09:01:49.086Z Playwright runner 起（JSON stats.startTime）
09:01:51.463Z CITY-EXP-01 测例起 → 09:01:53.602Z 会话埋点起
≈09:20:00Z   自然退出 RUN8_EXIT=0（早于硬闭 ≈10:07Z）
09:23:03Z    证据上链 f5e8adb（退出后 ~3min，§B-3「收轮即上链」达标）
```

**正挂判定：达成（生效签署层面），GO 不受影响**。§4-① 要求「真空先落盘 PASS → 令原件落盘（引用该真空档）→ 即时点火」。
实测：令头行起草时戳（09:01:47Z）仍早于真空档（09:01:48Z）1 秒，但与 run7 §3 被点名的「回写补救」有实质区别——
run8 令文**预置条款**（「真空档 MUST be fresh PASS written AFTER this file and BEFORE test start」）并在真空 PASS 后、
点火前完成**显式令内补签**（补签行引用已落盘、已 PASS 的真空档原文时戳）。即真空 PASS → 令终稿落盘 → 点火严格单调，
签令-点火窗 2 秒（≤10min 要求），**任何时点均不存在空引用生效状态**——§3 倒挂缺陷的定义要件（引用当时不存在的档）不满足。

**留痕两注**：① 头行起草时戳早于真空 1 秒，登记为残余工艺尾差（非 §3 意义上的倒挂复发）；若后续仍有 runN（×2 已闭，常态不再有），头行时戳亦应晚于真空档。
② 补签行的落盘物理时刻无法从链上独证 mtime，但真空 PASS（09:01:48Z）严格早于点火（09:01:49.086Z）由 vacuum 档与 JSON 双档时戳锁定——两键制的实质保护（未验跑道禁点火）成立，与补签行 mtime 无关。

**「禁自动 run8」不冲突确认**：IGNITION-run7 令文禁止的是无令自动续飞；本趟为**另发原件**（IGNITION-run8 v1 @09:01:47Z）+ **另做真空**（09:01:48Z）的逐趟签发，恰为 #154 §4 授权形态。Forbidden 三项（fps-probe / 跨 VM 授权拷贝 / auto-retry）核对无违反。

## 4. #154 §4 四条件硬门逐条判定

| 条件 | 判定 | 依据 |
|------|------|------|
| ① 时序正挂 | ✓（带 §3 留痕两注） | 真空 PASS → 令终稿补签 → 点火严格单调；签令-点火窗 2s |
| ② 四要素齐 + 同机强制令 | ✓ | §F5-3 四要素全齐（§2-7）；host 仍为 `cursor-44cb5599-cursor`，三档互证 |
| ③ tip 冻结 = `00fd832` 或纯证据后代 | ✓ | `tip_frozen: fecf595` 为 §4-③ 明文预认合格；区间零非证据提交（§2-6），基线未失效 |
| ④ 计数纪律 | ✓ | 三证上链 `run8/`（f5e8adb 纯证据）+ 独立复核 = 本单（复核人非跑道执行方，§1）；**禁预写遵守**——README/commit 措辞均维持「待复核 1/2」，无预写 2/2 |

## 5. ✓✓ 后路径：指挥官签字门 / #129 合流条件

1. **×2 恒等式左侧闭合**：leg1 = run7 ✓（`fecf595`，独立复核 = #154）+ leg2 = run8 ✓（`f5e8adb`，独立复核 = 本单）——两趟同机、同基线血统（`00fd832`+`49a5d6a` 东线）、连续、三干净（程序 ∧ 运行 ∧ 取证）。
2. **可进指挥官签字门**（§F5-4 / #154 §4-④）：✓✓ → 指挥官签字门（**扩大清单含 #134 三 spec**）→ #129 合流。本单确认签字门前置已全部就绪；签字权在指挥官，**审计不代签、不代合**。
3. **签字门核对清单建议**：① 本单 GO 落账，看板 ×2 = 2/2；② #134 三 spec 扩大清单逐项核签；③ **合流前 #129 维持证据冻结**——`f5e8adb` 后进入任何非证据提交须重新裁决（§4-③ 条款在签字门关闭前继续有效）；④ 性能排程注记：×2 已收口，R4-PERF §C 序 A 条件成熟，真机六腿开窗与合流先后由指挥官裁量（#155）。

## 6. 排除确认（遵指挥官令）

- **run5 / #153 零沿用**：本审计一切依据 = R3 §F + #154 + 链上 `run8/` 一手证据；#153 作废定谳维持，run8 证据包自身亦显式切割（README 备注「#153 结论不得引用为放行依据」），无残留引用风险。
- run5 双趟（α/β）：维持诊断趟定谳——情报账全额、资格账零，未参与本 leg2 任何计数。

## 7. 登记建议（父代理/秘书执行，本单不代改看板）

- 看板 `docs/research/cyber-city-score-loop-orchestration.md`：×2 = **2/2**（leg1=run7 ✓ `fecf595` 复核 #154；leg2=run8 ✓ `f5e8adb` 复核 = 本单）。
- #129 状态：合流窗改「指挥官签字门待签」（扩大清单含 #134 三 spec）；签字前分支维持证据冻结。

—— 审计完。零业务代码改动，本分支仅含本文件。
