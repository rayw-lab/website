# CC-LOOP-BOARD-AUD-C1-MERGE 董事会急裁——#164 squash 合入 GO（无需 rebase）+ 合后立刻段末独立审计 ×1（不等 NAV-C1）

- **model slug**: claude-fable-5-thinking-xhigh（董事会急裁短单）
- **日期**: 2026-08-28
- **议题**: [#164](https://github.com/rayw-lab/website/pull/164) `feat(audio): CC-AUD-C1` 分支 `cursor/cc-aud-c1-synth-8177` tip `1c652e8`，站立授权口径「含 src 合入须董事会急裁」（#159/#163）
- **纪律**: 零业务代码，本档为唯一交付物

## 1. 三行裁决

| # | 裁决 | 结论 |
|---|------|------|
| 1 | 现在 squash 合 #164？ | **GO——立即 squash 合入，无需 rebase**。门禁 CI SUCCESS（required check 全绿）；全量 e2e 本就不在 PR 门禁内、归段末审计窗（R1 §3.5 跑道互斥，#163 已确立段末审计 ×1 流程）；main 领先两 commit 实测纯 docs，rebase 换不来任何语义增量 |
| 2 | 审计时机？ | **合后立刻派 AUD-C1 段末独立审计 ×1（在合并后 main tip 上跑全量 e2e 53 例）**，不等 NAV-C1。全量跑道与 #134 互斥则排队错峰，审计先做静态面。NAV-C1 按「后合者试合并」既定义务自行在含 AUD 的 main 上试合并 + 冒烟——等 NAV 齐了合审会把两段归因混在一起，违反单段归因纪律 |
| 3 | 执行令 | 见 §3 |

## 2. 取证记录（fresh，2026-08-28 10:36–10:40 UTC）

### 2.1 PR #164 状态与 CI

- `gh pr view 164`：OPEN / MERGEABLE / mergeStateStatus **CLEAN**，head `1c652e8`。
- statusCheckRollup 仅一项：「门禁（check / build / links / budget / lighthouse）」**SUCCESS**（completed 10:35:43Z，[run 33163623877](https://github.com/rayw-lab/website/actions/runs/33163623877/job/98823729455)）。
- **e2e 不在 PR 门禁 required check 内**——这是仓库常态而非本 PR 缺口；全量 e2e 由段末审计窗在本 VM 执行（R1 §3.5 全量跑道互斥硬令）。PR body 自述：CITY-AUD-01 新 spec 单跑 PASS（5.4 min）+ WS-E2E-03 灰盒回归单跑 PASS（2.7 min），全量因 #134 占跑道留审计窗，符合流程。

### 2.2 rebase 必要性核查（结论：不需要）

- merge-base(#164, main) = `467d148`；main tip = `5be64eb`，领先两 commit（`dedf226` #162、`5be64eb` #163）。
- `git diff --stat 467d148..origin/main` 实测：**5 个 docs 文件（research ×4 + spec ×1），503 insertions，零 src / e2e / config**。
- 结论：squash 合入结果树 = main tip ⊕ #164 变更，与 rebase 后逐字节等价；GitHub 已判 CLEAN。要求 rebase 重跑门禁只烧一轮 CI 无任何增量。

### 2.3 回归风险面核查（董事会独立复核，非仅采信 PR 自述）

- **SessionTimeline diff 实测**：ux 族白名单 +`world-audio` 一个 type + 注释块，schemaVersion 不动，纯加法（§3.6 加法纪律，规格表同 PR 随行修订 ✅）。
- **`e2e/cyber-city-observability.spec.ts` 全断言面核查**：无白名单总数（37）或类型枚举断言；schemaVersion 断言 ===1（不变）；counters/funnel 互证只锚定 respawn / cone-hit 等既有 type；CITY-OBS-04 拒收探针 `obs-e2e-bogus` 仍在白名单外。**未发现 37→38 的必破点**。
- **#164 ⊕ #134 文件清单实测比对**：零共同文件（#134 = VIS-X2-PLUG：ForegroundFraming / StreetProps / 三个既有 e2e spec / playwright.config / tools，无一与 #164 的 WorldAudio / world/index / SessionTimeline / cyber-city-audio.spec / observability doc 重合）。#163 的「零文件交集」口径经实测坐实。
- 残余风险（低）：新 ux 事件在既有动线中入 ring 对 function-smoke 评分、静音钮 DOM 对样式类断言的间接影响——静态核查无必破点但只有全量 e2e 能收口，故 §1-2 要求合后立刻审计而非等待。

### 2.4 HOLD 的机会成本

HOLD 换不来增量证据：全量 e2e 跑道被 #134 占用，PR 分支上跑不了；专项 audio e2e 已单跑 PASS 且日志摘要在 PR body；rebase 无语义增量（§2.2）。HOLD 唯一效果 = AUD 段吊在空中、NAV-C1 后合时的试合并基线继续漂移。

## 3. 给父代理的执行令

> **立即 squash 合 #164（无需 rebase、无需重跑门禁），随即派 AUD-C1 段末独立审计 ×1（fresh 取证：合并后 main tip 全量 e2e 53 例 + LHCI 口径按硬门表，跑道与 #134 错峰排队）；NAV-C1 按后合者义务在含 AUD 的 main 上试合并 + 合流冒烟；若审计 e2e 破门，开定向补洞段 fix-forward，不回滚不降门。**

## 4. 登记备注

- 看板单源 `docs/research/cyber-city-score-loop-orchestration.md` 由父代理按本裁决收口时更新（本档不重复登记，遵循单源纪律）。
- 全量 e2e 用例数口径：合入后 52 → **53**（CITY-AUD-01 收编 world-chromium 串行 project），审计硬门按 53/53 计。
