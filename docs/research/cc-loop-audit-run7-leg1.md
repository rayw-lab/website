# CC-LOOP-AUDITOR-RUN7 独立复核——同机 run7 ×2 leg1

- **model slug**: `claude-fable-5-thinking-xhigh`
- **角色**: 独立只读复核（防自跑自判）；零 `src/`、零 `e2e/` 改动，本分支仅交本报告。
- **取证窗口**: 2026-08-28 08:53–09:05 UTC，全部一手（`git fetch` + `gh api` + 链上 blob 逐份核验）。
- **口径**: Board R3 [#151](https://github.com/rayw-lab/website/pull/151) §F 最高优先——run5 烧毁 / run6 连坐退役，×2 仅认 run7/run8；
  [#153](https://github.com/rayw-lab/website/pull/153)（run5 有条件 GO / 预签 IGNITION-run6）**整份作废，本审计未沿用其任何结论**。

## 0. 裁决一行

**GO——run7 计 ×2 leg1，×2 记账 0/2 → 1/2；允许签发 IGNITION-run8（先签后飞成立，附 §4 四条件）。**

## 1. 审计机与跑道机分离（防自跑自判）

| 项 | 值 |
|----|-----|
| 跑道机（run7 执行） | `cursor-44cb5599-cursor`（IGNITION `host_fingerprint` = vacuum 头行 `host=` = `run7-claimed.txt` 三档互证） |
| 审计机（本单） | `hostname` = `cursor`，且 `/tmp/evidence-exp01/` 不存在——本 VM 无跑道运行时痕迹，复核仅凭链上证据 |

## 2. 一手核验结果（全部对号）

证据锚点：#129（[PR](https://github.com/rayw-lab/website/pull/129)，head `cursor/cc-fxn-exp01-env-5b71`）tip = **`fecf595`**
（`gh api` 实测 2026-08-28T08:56:14Z：「EXP-01 run7 同机决定趟候选证据上链……零 src/e2e 改动」）。
审计开窗时 tip 尚为 `4ee0c02`（无 `run7/`），08:56 上链后即转全量核验——「待上链」条件已消灭，不必出有条件 GO。

| # | 核验项 | 结果 |
|---|--------|------|
| 1 | 三证上链 `docs/research/exp01-evidence/run7/` | ✓ 11 份文件齐（IGNITION / vacuum / log / JSON / claimed / README×2 / 埋点 dump / 截图×3），`git show --stat fecf595` 确认**纯证据提交，零 `src/` 零 `e2e/`** |
| 2 | `RUN7_EXIT=0` | ✓ `env-exp01-run7.log` 末行 `RUN7_EXIT=0`，`1 passed (17.6m)`，0 failed/skipped/flaky |
| 3 | 墙钟 17.6m | ✓ JSON `stats.duration=1053898ms`（=17.565min≈17.6m）；测例 `dur_ms=1052189`（log 内 17.5m 为测例净时，口径一致） |
| 4 | `expected:1` | ✓ JSON `expected:1 / unexpected:0 / skipped:0 / flaky:0`；log「Running 1 test using 1 worker」（grep `CITY-EXP-01` 定向），测例 status=`passed` |
| 5 | tip 谱系含东线 | ✓ `git merge-base --is-ancestor`：`00fd832`（基线 v2，08:27:37Z git 实测）与 `49a5d6a`（东线改线）均为 fecf595 祖先；起飞冻结 tip=`00fd832` 本身含 `49a5d6a`；`00fd832→fecf595` 区间仅两笔纯证据提交（`4ee0c02` run5-α 抢救 + `fecf595` 本包） |
| 6 | IGNITION-run7 四要素（§F5-3） | ✓ ① HOLD 核对行「run5 BURNED run6 RETIRED; α/β diagnostic only; baseline v2=00fd832」② 本盘 fresh 真空档路径 `/tmp/evidence-exp01/vacuum-run7.txt` ③ `tip_frozen: 00fd832` ④ `host_fingerprint: cursor-44cb5599-cursor` |
| 7 | 真空三查 | ✓ @08:28:27Z PASS：chrome=0 / headless_shell=0 / load1=0.03 / astro=0，host 行与 IGNITION 指纹一致（run5 旧档无 host 行，v3 新要件 run7 首次落实） |
| 8 | sha256 防伪 | ✓ 链上 10 份 blob 逐一 `sha256sum`，与 README.md 登记表**全数一致**（含三张截图 518107/477421/515172 bytes） |
| 9 | 埋点互证 | ✓ `session-dump-explore.json` startedAt 08:28:32.168Z、deep-link `autodrive-lab`、`backend:webgl2 / vehicle:physics`，与测例场景吻合 |
| 10 | 硬闭点 | ✓ 起飞+65min≈09:33Z；实际 exit ≈08:46:02Z（JSON start 08:28:28.579Z + 17.57m），EXIT 先到 |

## 3. 两键时序裁定（IGNITION-run7 × vacuum-run7）

实测时间链（单调自洽）：

```
08:28:26Z IGNITION-run7 v1 头行签发（parent，跑道机原件）
08:28:27Z vacuum-run7 真空三查 PASS（同机）
08:28:28.579Z Playwright runner 起（JSON stats.startTime）
08:28:30.087Z CITY-EXP-01 测例起 → 08:28:32Z 会话埋点起
≈08:46:02Z 自然退出 RUN7_EXIT=0（早于硬闭 09:33Z）
08:56:14Z 三证上链 fecf595
```

**头行 1 秒倒挂的裁定（不构成阻断）**：IGNITION 头行时戳（08:28:26Z）早于真空档（08:28:27Z）1 秒，
但令文正文已写入该真空档的 PASS 结果并显式注记「（晚于本令）」——即令文**终稿晚于真空 PASS、早于点火**，
实质完成了令内补签。与 run5-β 被降级的 T29 §3-1「空引用」（07:49 签令引用 08:03 才存在的真空档、
14 分钟空窗且从未补签）有本质区别：本例引用对象在点火前已存在、已 PASS、已回写令文。
时序四步「签令→真空→起跑→退出」全部在 4 秒窗内闭合，运行面无并发（真空三查即证）。
**留痕注记**：此 1 秒倒挂登记为工艺瑕疵，run8 起必须按 §4-① 正挂时序执行，不得再现。

## 4. IGNITION-run8 裁定：允许签发（先签后飞成立），四条件为硬门

1. **时序正挂**：fresh `vacuum-run8` 先落盘 PASS → `IGNITION-run8.txt` 原件落盘（引用该真空档）→ 即时点火；
   签令与点火同窗（建议 ≤10min），逾窗真空过期须重新真空并补签——杜绝 §3 倒挂复发。
2. **四要素齐**（§F5-3）：HOLD 核对行 + 本盘 fresh 真空档路径 + tip 冻结 + 主机指纹行；
   同机强制令维持——host 必须仍为 `cursor-44cb5599-cursor`。
3. **tip 冻结**：`00fd832` 或其**纯证据后代**（`4ee0c02` / `fecf595` 均合格，谱系含 `49a5d6a` 东线、零业务代码差异）；
   若 #129 在此期间进入任何非证据提交，基线失效、须重新裁决。
4. **计数纪律**：run8 ✓ 同样 = 收轮三证上链 `docs/research/exp01-evidence/run8/` + 独立复核（防自跑自判，
   复核人不得为跑道执行方）；本 GO 只解锁 leg1，**禁把 1/2 预写成 2/2**；✓✓ 后仍须过指挥官签字门方可 #129 合流（§F5-4）。

IGNITION-run7 令文「禁自动 run8」与本裁定不冲突：禁止的是无令自动续飞；本裁定授权的是**另发原件、另做真空**的逐趟签发。

## 5. 作废确认

- [#153](https://github.com/rayw-lab/website/pull/153)（run5 有条件 GO / 预签 IGNITION-run6）：整份作废确认。链上 `run7/README.txt`
  与 README.md 均已显式切割（「IGNITION-run6 未签发」「#153 不得引用为放行依据」），无残留引用风险。
- run5 双趟（α/β）：维持 R3 §F 定谳——诊断趟、情报账全额、资格账零，与本 leg1 计数无涉。

## 6. 登记建议（父代理/秘书执行，本单不代改看板）

- 看板 `docs/research/cyber-city-score-loop-orchestration.md`：×2 = **1/2**（leg1=run7 ✓，证据 `fecf595`，
  独立复核 = 本单）；leg2=run8 待两键。
- #129 合流窗：维持关闭至 run8 ✓ + 指挥官签字门。

—— 审计完。零业务代码改动，本分支仅含本文件。
