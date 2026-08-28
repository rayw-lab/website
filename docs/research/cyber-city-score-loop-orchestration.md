# Phase 0 提分 Loop 编排看板

`main` @ `88097f9` · 2026-08-28 05:00 UTC · **提分 Loop Tick#15（3n 看板界点）** · 范式 `cyber-city-orchestration-paradigm.md`

**模型（L8+）**：全部子代理 Task = `claude-fable-5-thinking-xhigh`；在途 Sol 可跑完（§1.2 宽限）。

> 本单为 SEC-P8 Tick#15 刷新，**基于 [#125](https://github.com/rayw-lab/website/pull/125)（SEC-P7，已收编 #121/#116/#112 世系）head `77a8c2d` 叠 Tick#13–#15 增量**；#103/#125 均未合，main tip 仍 `88097f9`。合流序（T9 [#122](https://github.com/rayw-lab/website/pull/122) 裁决 + T13 [#127](https://github.com/rayw-lab/website/pull/127) 对表）：[#103](https://github.com/rayw-lab/website/pull/103) 即合 → 看板取本单（#125 超集）→ 关 #109/#112/#116/#121/#125（世系收编防双源），禁止看板回退。
>
> **Tick#15 等待项**：① X2 链路——TRIAGE-WRAP 已判 **stale 中止**（T13 [#127](https://github.com/rayw-lab/website/pull/127) ①：报告期 26min 四证齐 + T12 deadline 到点，不重派）；**ENV 专项 + plug 栈双路 RUNNING**（04:41Z 双路派出）；plug r1 已推 3 commit（tip `368b4d4`）但**方向撞纪律待纠偏**（改 e2e 动线绕桥腿 + workers 2→1，与「测试面 = 审计面」冻结正面冲突 → T13 §3.0 方案 A/B 并存，等 ENV 定谳 + 指挥官签字）；[#104](https://github.com/rayw-lab/website/pull/104) draft `c24c7f3` **禁 ready** 不变；② [#103](https://github.com/rayw-lab/website/pull/103) **待指挥官合入**（Codex IDLE ✅ · 落库审计 GO [#120](https://github.com/rayw-lab/website/pull/120)）。两者落地前登记矩阵不动。
>
> **Tick#13 新事实（T13 [#127](https://github.com/rayw-lab/website/pull/127) 出土）**：08-27 先行分支 `cursor/cc-exp01-corridor-fix-0254`（remote `a59d1ea`）早已定性「直线走廊被 BL1 充电桩排封死」并原型测试面改法，历轮 ls-remote grep 词表全部漏检 → 供 ENV 专项对表，防重复归因。

## 登记矩阵（**每 tick 首段必输出**）

| 维度 | 北极星 | 生产登记 | Δ | 在途 |
|------|--------|----------|---|------|
| **综合** | **98** | **80** | +18 | COMP-M0 重算（#105 留痕 / #106 WIP） |
| **视觉** | **98** | **73** | +25 | 顾问路径 →~78（[#98](https://github.com/rayw-lab/website/pull/98) 已合）· X1b [#101](https://github.com/rayw-lab/website/pull/101) 已合待复评 · X2 [#104](https://github.com/rayw-lab/website/pull/104) e2e 裁 FAIL → TRIAGE stale 中止，ENV+plug 双路 RUNNING（plug r1 待纠偏） |
| **功能** | **90** | **84** | +6 | [#103](https://github.com/rayw-lab/website/pull/103) 分支登记 **87** 未合（ready · tip `1a4296f` · Codex IDLE ✅ · 落库审计 GO [#120](https://github.com/rayw-lab/website/pull/120) · 待指挥官合入） |
| **性能** | **85** | **—** | +85 | 六腿桌面单 [#96](https://github.com/rayw-lab/website/pull/96) 已在 main；首分待指挥官真机 → AL-PERF |

> 登记只认审计独立分（JSON 单源：视觉 main@88097f9 = 73，功能 main = 84；T9 [#122](https://github.com/rayw-lab/website/pull/122) 点名 71/73 双源分歧，取看板单源 **73**）。禁止 LHCI/e2e/smoke 冒充功能或性能。**#103 口径注释**：合流前功能仍登 **84**；#103 合入 main 后由秘书**另开增量登记单**登 87，本单只备口径、不冒登。

## 当前焦点（提分 Loop · Tick#15）

| 轨 | 状态 | 下一拍 |
|----|------|--------|
| 视觉 | **73** ✅ [#94](https://github.com/rayw-lab/website/pull/94) · X1b voice-pod 已合 [#101](https://github.com/rayw-lab/website/pull/101)（W2③）· 顾问 [#98](https://github.com/rayw-lab/website/pull/98) / TM-PREP [#99](https://github.com/rayw-lab/website/pull/99) / G3+X5 授权 [#100](https://github.com/rayw-lab/website/pull/100) 已合 | TRIAGE-WRAP **stale 中止**（T13 [#127](https://github.com/rayw-lab/website/pull/127) ①，不重派）→ **ENV 专项 + plug 栈双路 RUNNING**：ENV 裁三候选（出泊爬行 / BL1 桩排封走廊 / 灯杆路缘，对表先行分支 `cc-exp01-corridor-fix-0254` @ `a59d1ea`）；plug 栈（T9 [#122](https://github.com/rayw-lab/website/pull/122) GO：base `c24c7f3` 栈场景①，tip `368b4d4`）**r1 撞纪律待纠偏**（方案 A/B 等 ENV 定谳 + 指挥官签字）；`c24c7f3` **禁 ready** |
| 功能 | **84** ✅ main · 决策树 [#97](https://github.com/rayw-lab/website/pull/97) 已合 · [#103](https://github.com/rayw-lab/website/pull/103) 分支登记 87（ready · tip `1a4296f` · mergeState CLEAN） | Codex IDLE ✅（push 已落地清 L6/F5）· 落库审计 GO [#120](https://github.com/rayw-lab/website/pull/120) → **待指挥官合入** [#103](https://github.com/rayw-lab/website/pull/103) → 秘书另开增量登记 87 |
| 性能 | 六腿桌面单 [#96](https://github.com/rayw-lab/website/pull/96) 已合 | 指挥官真机 S-2 / 六腿（零 VM）仍待 → AL-PERF |
| 综合 | 80 | COMP-M0 五维重算（#105/#106 续派） |

## Loop tick 计数（定时器 `loop-cyber-city-orchestrate`，10m）

| Tick | 派单 | 状态 |
|------|------|------|
| #1 | 顾问 R1（[#110](https://github.com/rayw-lab/website/pull/110)）+ SEC-P3（[#109](https://github.com/rayw-lab/website/pull/109)） | 双双交付，PR open |
| #2 | 顾问 T2（[#111](https://github.com/rayw-lab/website/pull/111)）+ X2（[#104](https://github.com/rayw-lab/website/pull/104)）+ Codex 清账（[#103](https://github.com/rayw-lab/website/pull/103)） | T2 交付；X2 / Codex RUNNING |
| #3 | 顾问 T3（[#113](https://github.com/rayw-lab/website/pull/113)）+ SEC-P4（[#112](https://github.com/rayw-lab/website/pull/112)） | 双双交付；#112 CI 绿待指挥官合入 |
| #4 | 顾问 T4（[#114](https://github.com/rayw-lab/website/pull/114)） | 交付（X2/Codex 活性判定 + 合流优先级） |
| #5 | 顾问 T5（[#115](https://github.com/rayw-lab/website/pull/115)） | 交付；CITY-EXP-01 失败留痕（见 #115） |
| #6 | 顾问 T6（[#117](https://github.com/rayw-lab/website/pull/117)）+ SEC-P5（[#116](https://github.com/rayw-lab/website/pull/116)） | 双双交付；#116 为 #112 超集，待指挥官合入 |
| #7 | 顾问 T7（[#118](https://github.com/rayw-lab/website/pull/118)） | 交付（Codex push 落地取证 + X2 独占复跑验收树 + Tick#8 预排） |
| #8 | 顾问 T8（[#119](https://github.com/rayw-lab/website/pull/119)）+ 落库审计（[#120](https://github.com/rayw-lab/website/pull/120)） | 双双交付；#120 verdict **#103 合流 GO** |
| #9 | SEC-P6（[#121](https://github.com/rayw-lab/website/pull/121)）+ 顾问 T9（[#122](https://github.com/rayw-lab/website/pull/122)，补交） | 双双交付；#121 待指挥官合入；T9 归因坐实 + plug GO + 合流序 |
| #10 | 顾问 T10（[#123](https://github.com/rayw-lab/website/pull/123)） | 交付（X2 判活勿重派 + 结局锁 FAIL + T9 合并规则 + Tick#11 预排） |
| #11 | TRIAGE-WRAP（X2 收轮 triage 收口）+ 顾问 T11（[#124](https://github.com/rayw-lab/website/pull/124)） | T11 交付（对照跑收轮 main 树同挂 1 failed · 判读 B 兑现 + T9 纠偏 + ENV/plug 并行编排）；TRIAGE-WRAP 后判 stale（见 Tick#13 行） |
| #12 | SEC-P7（[#125](https://github.com/rayw-lab/website/pull/125)，3n 看板界点）+ 顾问 T12（[#126](https://github.com/rayw-lab/website/pull/126)） | 双双交付；#125 待指挥官合入（本单为其超集）；T12 裁 plug 独立栈 GO / 续写 #104 NO + JSON 覆写坑三度兑现留痕 |
| #13 | 顾问 T13（[#127](https://github.com/rayw-lab/website/pull/127)）+ fan-out：ENV 专项 + X2 plug 栈（04:41Z 双路派出） | T13 交付（TRIAGE-WRAP 判 stale 中止 + 08-27 先行分支 `cc-exp01-corridor-fix-0254` 出土 + plug r1 撞纪律纠偏 + Tick#14 预排）；双路 RUNNING |
| #14 | ENV+plug 双路监跑 + 顾问 T14 | 双路 RUNNING（plug r1 已推 3 commit tip `368b4d4` 待纠偏；ENV 分支本地未推）；T14 在途（worktree 已开、暂无 PR） |
| #15 | SEC-P8（本单，3n 看板界点） | 在途；ENV/plug 双路监跑 · #103/#125 待指挥官合入 |

## MERGE-WAVE 8/8 合流记录（`771b1e4` → `88097f9`，每步 CI+Deploy 双绿）

| 序 | PR | merge SHA | 内容 |
|----|-----|-----------|------|
| 1 | [#95](https://github.com/rayw-lab/website/pull/95) | `e10d7d7` | 秘书 tick（tip 771b1e4，视觉登记 73） |
| 2 | [#98](https://github.com/rayw-lab/website/pull/98) | `e4aa7e4` | VIS-ADV-73 顾问（73→~78 路径，W2 X1b∥X2） |
| 3 | [#99](https://github.com/rayw-lab/website/pull/99) | `f63f779` | TM-PREP X4 tone mapping 解除 defer 预备 |
| 4 | [#100](https://github.com/rayw-lab/website/pull/100) | `d738f31` | G3 书面裁决 + X5 并行开工授权 |
| 5 | [#97](https://github.com/rayw-lab/website/pull/97) | `c609946` | FXN-NEXT-90 冲 90 第二波决策树 |
| 6 | [#96](https://github.com/rayw-lab/website/pull/96) | `d73784b` | PERF-DESK 性能首分六腿桌面执行单 |
| 7 | [#102](https://github.com/rayw-lab/website/pull/102) | `e84e77b` | AL-VEH-R3 interim 留痕（僵死抢救） |
| 8 | [#101](https://github.com/rayw-lab/website/pull/101) | **`88097f9`** | **X1b voice-pod 第三栋 hero 实模（W2③）→ X2 解锁** |

## 在途子 Task（VM 硬护栏 3，见 #107 调研）

Tick#15 当前在途：

| 在途 | 内容 | 状态 |
|------|------|------|
| ENV 专项 | main 树 CITY-EXP-01 同挂根因裁决——三候选（出泊爬行 / BL1 桩排封走廊 / 灯杆路缘）+「设计意图 vs 测试纪律」错位定谳 + 绿证窗口 + plug 验收签字（T13 [#127](https://github.com/rayw-lab/website/pull/127) §2 骨架）；**对表 08-27 先行分支 `cc-exp01-corridor-fix-0254`（`a59d1ea`，早已定性桩排封走廊 + 原型测试面改法）** | **RUNNING**（分支 `cc-fxn-exp01-env-5b71` 本地 @ 88097f9，未推） |
| X2 plug 段 | 两处新碰撞面补洞（ForegroundFraming 桥腿柱 + StreetProps 东北簇；T9 [#122](https://github.com/rayw-lab/website/pull/122) GO，栈场景① base `c24c7f3`） | **RUNNING · 待纠偏**——tip `368b4d4` 已推 3 commit（04:47–04:51Z，栈纪律守住），但主体 = 改 e2e 动线绕桥腿 + workers 2→1，撞「测试面 = 审计面」冻结 → T13 §3.0 方案 A/B 并存，等 ENV 定谳 + 指挥官签字；验收全量 e2e HOLD 待 ENV 签字 |
| 顾问 T14 | Tick#14 扇出裁决（双路监跑判读） | 在途（worktree 已开、暂无 PR） |
| SEC-P8 | 本单看板 Tick#15 刷新（基于 #125 head `77a8c2d` 叠增量） | 本单 |

X2 实现段已收轮：[#104](https://github.com/rayw-lab/website/pull/104) **e2e 中断收场**，tip `c24c7f3` **draft 禁 ready**；TRIAGE-WRAP 已判 **stale 中止**（T13 [#127](https://github.com/rayw-lab/website/pull/127) ①：报告期 26min 四证齐 + T12 deadline 到点，**中止收割、不重派**；报告型 stale 阈值口径沉淀 T13 §1.2）→ ENV + plug 双路并行接棒（T11 [#124](https://github.com/rayw-lab/website/pull/124) 编排：文件域正交；**不派修复前全量 e2e**——两树都必挂纯废轮）。plug GO 依据 T9 [#122](https://github.com/rayw-lab/website/pull/122)（T11 纠偏采 T9 为 triage 权威）。

已收口（不再占槽）：**Codex 清账 IDLE ✅**——push 已落地清 L6/F5（[#103](https://github.com/rayw-lab/website/pull/103) tip `1a4296f` ready），落库审计 GO [#120](https://github.com/rayw-lab/website/pull/120)，**待指挥官合入**；**TRIAGE-WRAP stale 中止**（不重派）；顾问 T6–T13 交付 [#117](https://github.com/rayw-lab/website/pull/117) / [#118](https://github.com/rayw-lab/website/pull/118) / [#119](https://github.com/rayw-lab/website/pull/119) / [#122](https://github.com/rayw-lab/website/pull/122) / [#123](https://github.com/rayw-lab/website/pull/123) / [#124](https://github.com/rayw-lab/website/pull/124) / [#126](https://github.com/rayw-lab/website/pull/126) / [#127](https://github.com/rayw-lab/website/pull/127)。

| 待派 | 内容 | 条件 |
|------|------|------|
| plug 纠偏段 | plug r1 撞纪律纠偏落地（方案 A：碰撞面补洞保测试面不动；方案 B：ENV 定谳后按签字改测试面） | ENV 定谳 + 指挥官签字后定向派 |
| 槽空滚动（原 P3） | PERF 六腿 kit · M0-R4 [#106](https://github.com/rayw-lab/website/pull/106) · G1 预登记（#101 已合 ✅） | 槽空即派 |
| X5-R4（原 P4） | X5 招牌续拍（[#100](https://github.com/rayw-lab/website/pull/100) 已授权） | X2 收口后串行 |

## 指挥官真机（零 VM，独立于 loop 在途 · **Tick#15 仍待启动**）

1. **S-2 v1** — [#108](https://github.com/rayw-lab/website/pull/108) kit（S-2 执行单 + AL-R10 空壳）
2. **性能六腿** — [#96](https://github.com/rayw-lab/website/pull/96) 桌面单已在 main

→ artifacts 回传 → **AL-R10**（功能真机复核）/ **AL-PERF**（性能首分登记）→ COMP-M0 五维重算

## OPEN PR

| PR | 状态 | 说明 |
|----|------|------|
| [#103](https://github.com/rayw-lab/website/pull/103) | **ready · 待指挥官合入** | AL-FXN-R7 登记 87 · tip `1a4296f` · Codex push 已落地清 L6/F5（IDLE ✅）· 落库审计 GO [#120](https://github.com/rayw-lab/website/pull/120) · mergeState CLEAN |
| [#104](https://github.com/rayw-lab/website/pull/104) | draft · **禁 ready** | X2 立面套件（W2④）· tip `c24c7f3` · e2e **中断收场**，T10 [#123](https://github.com/rayw-lab/website/pull/123) 裁决 3 例 FAIL（#32/#33/#34）· TRIAGE stale 中止 → plug 栈补洞 RUNNING（r1 待纠偏）后再验 |
| [#125](https://github.com/rayw-lab/website/pull/125) | 待指挥官合入 | SEC-P7 看板 Tick#12 刷新（#121 超集）· 本单基于其 head `77a8c2d` 叠增量，合本单后可关闭 |
| [#126](https://github.com/rayw-lab/website/pull/126) | draft | 顾问 T12：Tick#12 扇出裁决（对照跑收轮·阈值 moot + JSON 覆写三度兑现 + Tick#13 plug 栈 GO + stale 清单） |
| [#127](https://github.com/rayw-lab/website/pull/127) | draft | 顾问 T13：Tick#13 扇出裁决（TRIAGE-WRAP stale 中止 + 08-27 先行分支出土 + plug r1 撞纪律纠偏 + Tick#14 预排） |
| [#121](https://github.com/rayw-lab/website/pull/121) | 内容已并入 #125/本单 | SEC-P6 看板 Tick#9 刷新（#116/#112 超集）· 合本单后可关闭 |
| [#122](https://github.com/rayw-lab/website/pull/122) | draft | 顾问 T9：Tick#9 扇出裁决（X2 复挂归因坐实两处新碰撞面 + plug GO + 合流序 + P6 矩阵口径） |
| [#123](https://github.com/rayw-lab/website/pull/123) | draft | 顾问 T10：Tick#10 扇出裁决（X2 判活勿重派 + 结局锁 FAIL + T9 合并规则 + Tick#11 预排） |
| [#124](https://github.com/rayw-lab/website/pull/124) | draft | 顾问 T11：Tick#11 扇出裁决（对照跑收轮 1 failed·判读 B 兑现 + T9 纠偏 + ENV/plug 并行编排 + T7-A 改挂事件门·全量 80 用例口径） |
| [#116](https://github.com/rayw-lab/website/pull/116) | 内容已并入 #121/本单 | SEC-P5 看板 Tick#6 刷新（#112 超集）· 合本单后可关闭 |
| [#120](https://github.com/rayw-lab/website/pull/120) | draft | 落库审计 CC-FXN-R103-LANDING-AUDIT：**#103 合流 GO** |
| [#117](https://github.com/rayw-lab/website/pull/117) | draft | 顾问 T6：Tick#6 扇出裁决 |
| [#118](https://github.com/rayw-lab/website/pull/118) | draft | 顾问 T7：Tick#7 扇出裁决（Codex push 落地取证 + X2 独占复跑验收树 + Tick#8 预排） |
| [#119](https://github.com/rayw-lab/website/pull/119) | draft | 顾问 T8：Tick#8 扇出裁决（#103 合流连锁 + X2 裁决树 + M0-R4 三重门） |
| [#112](https://github.com/rayw-lab/website/pull/112) | CI 绿 | SEC-P4 看板 Tick#3 刷新（含 #109 P3 全量）· 内容已并入 #116/#121/本单，合后可关闭 |
| [#109](https://github.com/rayw-lab/website/pull/109) | CI 绿 | P3 秘书刷新看板 · 内容已并入 #112/#116/#121/本单，合后可关闭 |
| [#110](https://github.com/rayw-lab/website/pull/110) | draft | 顾问 R1：2–3 天 VM loop 自动推进方案（tick 决策树 + 六槽预算） |
| [#111](https://github.com/rayw-lab/website/pull/111) | draft | 顾问 T2：Tick#2 扇出裁决（三路并行 + #103 补洞门 + Tick#3 预排） |
| [#113](https://github.com/rayw-lab/website/pull/113) | draft | 顾问 T3：Tick#3 扇出裁决（不加开实现路 + Tick#4 预排 + 事故缓解核证） |
| [#114](https://github.com/rayw-lab/website/pull/114) | draft | 顾问 T4：Tick#4 扇出裁决（X2/Codex 活性判定 + T4-A 顺延 + 合流优先级 + Tick#5 预排） |
| [#115](https://github.com/rayw-lab/website/pull/115) | draft | 顾问 T5：Tick#5 扇出裁决（阈值对照 + X2 失败留痕 + Codex push 裁决 + Tick#6 预排） |
| [#108](https://github.com/rayw-lab/website/pull/108) | draft | S2 指挥官真机 kit（S-2 v1 + AL-R10 空壳） |
| [#107](https://github.com/rayw-lab/website/pull/107) | draft | 编排交接单 2026-08-28 + VM 并发上限调研（硬护栏 3） |
| [#106](https://github.com/rayw-lab/website/pull/106) | draft | COMP-M0-R4 综合实算 WIP（槽空续派） |
| [#105](https://github.com/rayw-lab/website/pull/105) | draft | COMP-M0-R3 kickoff 留痕 |

## 阻塞

- **PR [#43](https://github.com/rayw-lab/website/pull/43) BL2** · NO-GO · **禁止合流**
- **[#104](https://github.com/rayw-lab/website/pull/104)** · **禁 ready**（T10 [#123](https://github.com/rayw-lab/website/pull/123) 裁 3 例 FAIL，0 failed/0 skipped 硬门必挂）· plug 栈补洞 + 纠偏落地 + ENV 签字 → 全量 e2e 复验后方可 ready
- **plug r1 纪律冲突** · tip `368b4d4`（改 e2e 动线绕桥腿 + workers 2→1）撞「测试面 = 审计面」冻结（T13 [#127](https://github.com/rayw-lab/website/pull/127) §3.0）· 方案 A/B 并存，**等 ENV 定谳 + 指挥官签字**，纠偏前 plug 分支禁 ready/禁合
- **[#103](https://github.com/rayw-lab/website/pull/103)** · 技术阻塞已清（Codex IDLE ✅ · 审计 GO [#120](https://github.com/rayw-lab/website/pull/120)）· **仅待指挥官合入**；合入后秘书另开增量登记 87
- **真机 S-2 / 性能六腿（零 VM）** · 仍待指挥官启动，AL-PERF / AL-R10 前置

## 归档（一行）

顾问 [#87](https://github.com/rayw-lab/website/pull/87)[#88](https://github.com/rayw-lab/website/pull/88)[#98](https://github.com/rayw-lab/website/pull/98) · AL-FXN **84** [#84](https://github.com/rayw-lab/website/pull/84) · AL-VIS **73** [#94](https://github.com/rayw-lab/website/pull/94) · C5-R3 [#90](https://github.com/rayw-lab/website/pull/90) · C6 [#91](https://github.com/rayw-lab/website/pull/91) · X1a-R4 [#92](https://github.com/rayw-lab/website/pull/92) · X3-R4 [#93](https://github.com/rayw-lab/website/pull/93) · 秘书 [#86](https://github.com/rayw-lab/website/pull/86)[#95](https://github.com/rayw-lab/website/pull/95) · 范式 [#85](https://github.com/rayw-lab/website/pull/85) · 清理 [#89](https://github.com/rayw-lab/website/pull/89) · TM-PREP [#99](https://github.com/rayw-lab/website/pull/99) · G3+X5 [#100](https://github.com/rayw-lab/website/pull/100) · FXN-NEXT [#97](https://github.com/rayw-lab/website/pull/97) · PERF-DESK [#96](https://github.com/rayw-lab/website/pull/96) · VEH-R3 留痕 [#102](https://github.com/rayw-lab/website/pull/102) · X1b [#101](https://github.com/rayw-lab/website/pull/101)
