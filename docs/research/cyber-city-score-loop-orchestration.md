# Phase 0 提分 Loop 编排看板

`main` @ `88097f9` · 2026-08-28 05:40 UTC · **提分 Loop Tick#18（3n 看板界点）** · 范式 `cyber-city-orchestration-paradigm.md` · 本单 PR [#135](https://github.com/rayw-lab/website/pull/135)

**模型（L8+）**：全部子代理 Task = `claude-fable-5-thinking-xhigh`；在途 Sol 可跑完（§1.2 宽限）。

> 本单为 SEC-P9 Tick#18 刷新（T16 [#132](https://github.com/rayw-lab/website/pull/132) §4.2 预排），**基于 [#130](https://github.com/rayw-lab/website/pull/130)（SEC-P8）head `f3bc6c2` 叠 Tick#16–#18 增量（补登十六条 = T16 十一条 + T17 五条，全落，见「增量补登」节）**；#103/#130 均未合，main tip 仍 `88097f9`。合流序（T9 [#122](https://github.com/rayw-lab/website/pull/122) + T16 [#132](https://github.com/rayw-lab/website/pull/132) §4.4）：[#103](https://github.com/rayw-lab/website/pull/103) 即合（第 6 tick 复读）→ 看板取本单（#130 超集，P8 tip 为本单祖先，**合本单即收编 #130/#125/#121 世系**）→ [#129](https://github.com/rayw-lab/website/pull/129) 双门过门即合（**合流序先于 plug rebase**）→ [#104](https://github.com/rayw-lab/website/pull/104) 维持 draft 禁 ready。禁止看板回退。
>
> **Tick#18 等待项**：① X2 链路——**plug 验证轮 RUNNING**（定向 playwright 三例：EXP-01 **✘ 11.9m 同卡点** · QST-02 ✘ 22.2m **判读作废**（⑬ 污染窗口）· FB-01 在跑，收轮窗 ~05:36±5；**resume 拒在册，飞行中零杠杆、禁中止**，收轮即派 PLUG-R2 接管卡）；**plug 原代理已交付 [#134](https://github.com/rayw-lab/website/pull/134)**（栈①，桥位南移 + 东北簇内退，全量 e2e HOLD）；**ENV 修复段已交 [#129](https://github.com/rayw-lab/website/pull/129)**（draft · tip `5e41550` · CI 门禁 pass）**挂双门**（CITY-EXP-01×2 三证 + 测试面解冻指挥官签字），定向 EXP-01×2 **可开、slot#2 归 ENV，三前置**（收轮三证 + 跑道真空确认 + 归档先行，T17 [#133](https://github.com/rayw-lab/website/pull/133) ③）；[#104](https://github.com/rayw-lab/website/pull/104) 禁 ready 不变；② [#103](https://github.com/rayw-lab/website/pull/103) **待指挥官合入**（第 6 tick 复读 · Codex IDLE ✅ · 落库审计 GO [#120](https://github.com/rayw-lab/website/pull/120)）；③ TRIAGE 僵尸中止执行（第 5 tick）+ 归档代办（**第 6 次逾期**，69MB trace 裸奔）待父代理落地。登记矩阵在 ①② 落地前不动。
>
> **Tick#13 出土在册**：08-27 先行分支 `cursor/cc-exp01-corridor-fix-0254`（remote `a59d1ea`）早已定性「直线走廊被 BL1 充电桩排封死」并原型测试面改法；T15 [#131](https://github.com/rayw-lab/website/pull/131) §4 裁决 **不并代码、只并证据链**（ENV 报告设三源对表专节；B 案若签字转正也以 fresh base 单 PR 重实现；分支保留登记 `a59d1ea`）。

## 登记矩阵（**每 tick 首段必输出**）

| 维度 | 北极星 | 生产登记 | Δ | 在途 |
|------|--------|----------|---|------|
| **综合** | **98** | **80** | +18 | COMP-M0 重算（#105 留痕 / #106 WIP） |
| **视觉** | **98** | **73** | +25 | 顾问路径 →~78（[#98](https://github.com/rayw-lab/website/pull/98) 已合）· X1b [#101](https://github.com/rayw-lab/website/pull/101) 已合待复评 · X2 [#104](https://github.com/rayw-lab/website/pull/104) draft 禁 ready → ENV 修复段 [#129](https://github.com/rayw-lab/website/pull/129) CI 绿挂双门 + plug 交付 [#134](https://github.com/rayw-lab/website/pull/134)（e2e HOLD）+ 验证轮 EXP-01 ✘ / QST-02 判读作废 / FB-01 在跑（R2 接管卡备妥） |
| **功能** | **90** | **84** | +6 | [#103](https://github.com/rayw-lab/website/pull/103) 分支登记 **87** 未合（ready · tip `1a4296f` · CLEAN/MERGEABLE · 落库审计 GO [#120](https://github.com/rayw-lab/website/pull/120) · **第 6 tick 复读待指挥官合入**） |
| **性能** | **85** | **—** | +85 | 六腿桌面单 [#96](https://github.com/rayw-lab/website/pull/96) 已在 main；首分待指挥官真机 → AL-PERF |

> 登记只认审计独立分（JSON 单源：视觉 main@88097f9 = 73，功能 main = 84；T9 [#122](https://github.com/rayw-lab/website/pull/122) 点名 71/73 双源分歧，取看板单源 **73**）。禁止 LHCI/e2e/smoke 冒充功能或性能。**#103 口径注释**：合流前功能仍登 **84**；#103 合入 main 后由秘书**另开增量登记单**登 87，本单只备口径、不冒登。EXP-01/QST-02 ✘ 属 e2e 验证面事实，不动功能登记 84。

## Tick#16–#18 增量补登（**十六条** = T15 §3 七条 + T16 [#132](https://github.com/rayw-lab/website/pull/132) §4.2 新四条 + T17 [#133](https://github.com/rayw-lab/website/pull/133) 增量五条，本单全落）

| # | 条目（源） | 登记内容 / 落点 |
|---|-----------|----------------|
| ① | ENV 首足迹（T15 §3-1） | 05:00:43 worktree + 分支落地，T14 05:10 stale 线解除；**已被 ⑧ push+PR 超越**——T15 §2.1 里程碑链（Tick#17 首 commit / Tick#18 首推）提前作废（T16 F1） |
| ② | 验证轮 EXP-01 ✘ 数据点（T15 §3-2） | ✘（11.9m，05:03:27）失败签名原文 **`途径点 (-19,-30) 应可达（实测 x=19.5 z=-32.9）`**，页面快照速度 **1km/h**；卡点 (19.5,-32.9) ≈ X2 原卡点 (19.4,-32.7)（T9 楔死点）**重合** → B 案动线改道未清除第一触点，**工程有效性未证明**；「禁改动线」条款激活（T14 §2.1） |
| ③ | resume 拒事故（T15 §3-3） | plug 线 follow-up 杠杆全灭（04:55 T13 裁决 → 05:00 resume 拒确认），处置树改写「等收轮接管 / 中止」二元；**接管协议上板**（T15 §1.4–1.5 五条款：同分支 base `c24c7f3` 不变 / e2e 冻结不 revert 不扩 / 第一动作 = fresh trace 第一触点定谳 / 全量 e2e 维持 HOLD / §6 验证附录代回填）；范式增量候选「**可 resume 性不是可靠假设**」（T15 §1.6） |
| ④ | T14 交付补号（T15 §3-4） | [#128](https://github.com/rayw-lab/website/pull/128)（doc commit `d2e1578` 05:02:01；P8 稿「T14 暂无 PR」过时）；T14 三条范式增量随板：面板 updatedAt 删腿 / tmux environ 归因陷阱 / 单跑道令 |
| ⑤ | TRIAGE「已裁未执」缝隙（T15 §3-5） | bc-ace126a4 面板仍 RUNNING（04:18:22 起）——看板措辞修正为「**已判 stale 中止，执行待父代理落地（+2–3min 保险复核）**」；面板消失前不得写「已中止」 |
| ⑥ | 归档代办逾期（T15 §3-6） | 升级为显式待办行（见「待派」）：T12 裁决起连续逾期，T15 计第 4 次、T16 计第 5 次；**本单 05:33 实测 `/tmp/evidence-exp01` 仍不存在**，被覆写 `e2e-results.json` 垃圾值与 trace 原件仍在 `/tmp/main-wt/test-results/` 裸奔 |
| ⑦ | T15 交付登记（T15 §3-7） | 与 ⑨ 并件：[#131](https://github.com/rayw-lab/website/pull/131)（`e05a80f` 05:12:14）；tick 计数表 #15 行收口（见下） |
| ⑧ | ENV push + #129 双门（T16 ⑧） | push `5e41550`（05:04:23）+ draft PR [#129](https://github.com/rayw-lab/website/pull/129)（05:05:04）；**CI 门禁 pass**（run 33143688516，本单 fresh 取证）；**双门 = CITY-EXP-01×2 三证 + 测试面解冻指挥官签字**；F8 纪律登记：交付形态 = 修复段（e2e 35 行 + src 9 行，BL1 桩排 collider 减深），e2e 途径点改线 = 测试面变更而**签字至今未登记**——挂 #129 合流门；推定父代理已按 T13 §2-⑤ 改派（合规），若实为自扩权由段末审计点名定谳；**合流序锁定先于 plug rebase**，EXP-01 spec 冲突一律取 ENV canonical 路线 |
| ⑨ | T15 交付 #131（T16 ⑨） | 补号落地（并 ⑦） |
| ⑩ | TRIAGE tick 计数（T16 ⑩) | 「已裁未执」：T13 裁 → T14 裁 GO 带保险 → T15 三度点名 → T16 第 4 tick；**执行落地时间待父代理兑现后回填** |
| ⑪ | 验证轮终局 + 纠偏序改写（T16 ⑪） | 三例：EXP-01 **✘**（11.9m，②）· QST-02 ✘（22.2m，05:25:43 落盘；**判读作废**，⑬）· FB-01 **在跑**（worker 59768 存活，预计收轮 ~05:36±5）；纠偏序改写为 T16 §3 **「S1 收割 → S2 R2 接管（trace 定谳分诊：X2 新增几何→A 案 / main 存量→移交 ENV）→ S3 runway 队列（slot#2=ENV 验证 → slot#3=R2 复跑 → slot#4=全量）」**，取代「revert e2e → A 案几何」旧口径（T15 冻结令 + ENV 归因移触点至 main 存量 BL1 桩带双重过时） |
| ⑫ | 单跑道违纪主体更正（T17 ①） | **ENV push `5e41550`/开 #129 = 零跑道动作，合规**；违纪主体更正为 **plug**——验证轮飞行中 05:13–05:23 起 SwiftShader capture 旁路浏览器 @211% CPU（load 峰值 7.33/4 核），把自家 QST-02 判读腿挤兑污染 |
| ⑬ | QST-02 判读**作废**（T17 ④-S1） | ✘ 22.2m（idle-30s nudge 未打）落在 ⑫ 污染窗口内 → **显式登记作废，不作 B 案/功能面判据**；FB-01 窗口预授权保护（旁路进程精确 kill）；ENV 定向复跑三前置之「跑道真空确认」即此教训 |
| ⑭ | 双盲归因收敛（T17 ②） | plug 复跑遥测与 ENV [#129](https://github.com/rayw-lab/website/pull/129) 独立定谳 **BL1 桩带（17.8+1.6=19.4 分毫不差）**；trace 定谳走第一叉：**EXP-01 责任移交 #129，A 案维持降级**；`839b6fe` 冻结存证（**纪律事件#2**：三 spec 二次扩改）——不中止、不 revert，收轮即派 R2 接管 |
| ⑮ | T17 交付 + plug 交付（补号） | T17 → [#133](https://github.com/rayw-lab/website/pull/133)（`b3e9011`）；plug 原代理 → [#134](https://github.com/rayw-lab/website/pull/134)（栈① base=facade-r2，tip `e03271f`：ForegroundFraming 桥位 z −26→−19.5 + StreetProps 东北簇 (19.5,−19.5)→(17.8,−17.8) + 探针 §④ 走廊余量审计；**全量 e2e HOLD 待 ENV 签字**，改线去留由段末审计定谳） |
| ⑯ | 计数刷新（T17 新事实） | TRIAGE「已裁未执」**第 5 tick**；[#103](https://github.com/rayw-lab/website/pull/103) **第 6 tick** 复读即合；归档代办 **第 6 次逾期**（69MB trace 裸奔，ENV slot#2 三前置含「归档先行」） |

## 当前焦点（提分 Loop · Tick#18）

| 轨 | 状态 | 下一拍 |
|----|------|--------|
| 视觉 | **73** ✅ [#94](https://github.com/rayw-lab/website/pull/94) · X1b voice-pod 已合 [#101](https://github.com/rayw-lab/website/pull/101)（W2③）· 顾问 [#98](https://github.com/rayw-lab/website/pull/98) / TM-PREP [#99](https://github.com/rayw-lab/website/pull/99) / G3+X5 授权 [#100](https://github.com/rayw-lab/website/pull/100) 已合 · plug 交付 [#134](https://github.com/rayw-lab/website/pull/134) | T17 [#133](https://github.com/rayw-lab/website/pull/133) 动作四件套：**S1 收割（QST-02 作废登记 ✅ 本单）→ S2 派 PLUG-R2 接管**（③ 协议 + T16 §3-S2；trace 定谳走第一叉：EXP-01 责任移交 #129，A 案降级）**→ S3 放 ENV 上跑道**（slot#2，三前置）**→ S4 P9 补登塌栈**（本单）；[#129](https://github.com/rayw-lab/website/pull/129) 双门过门即合（先于 plug rebase） |
| 功能 | **84** ✅ main · 决策树 [#97](https://github.com/rayw-lab/website/pull/97) 已合 · [#103](https://github.com/rayw-lab/website/pull/103) 分支登记 87（ready · tip `1a4296f` · CLEAN/MERGEABLE） | **待指挥官合入**（第 6 tick 复读：审计 GO [#120](https://github.com/rayw-lab/website/pull/120)，纯 docs 零跑道零交集）→ 秘书另开增量登记 87 |
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
| #12 | SEC-P7（[#125](https://github.com/rayw-lab/website/pull/125)，3n 看板界点）+ 顾问 T12（[#126](https://github.com/rayw-lab/website/pull/126)） | 双双交付；T12 裁 plug 独立栈 GO / 续写 #104 NO + JSON 覆写坑三度兑现留痕 |
| #13 | 顾问 T13（[#127](https://github.com/rayw-lab/website/pull/127)）+ fan-out：ENV 专项 + X2 plug 栈（04:41Z 双路派出） | T13 交付（TRIAGE-WRAP 判 stale 中止 + 先行分支出土 + plug r1 撞纪律纠偏 + Tick#14 预排）；双路 RUNNING |
| #14 | ENV+plug 双路监跑 + 顾问 T14 | 双路 RUNNING；**T14 交付 [#128](https://github.com/rayw-lab/website/pull/128)**（`d2e1578` 05:02:01，补登 ④） |
| #15 | SEC-P8（3n 看板界点）+ 顾问 T15 | **双双交付**：P8 → [#130](https://github.com/rayw-lab/website/pull/130)（`f3bc6c2` 05:05:49，本单基底）；T15 → [#131](https://github.com/rayw-lab/website/pull/131)（`e05a80f` 05:12:14，跨 tick 落地，补登 ⑦⑨）——行收口 |
| #16 | 顾问 T16（[#132](https://github.com/rayw-lab/website/pull/132)） | 交付（ENV stale 解除 + #129 双门 + 纠偏序改写不 revert + 单跑道六动作 + Tick#17/#18 预排 11 条补登清单） |
| #17 | 顾问 T17（[#133](https://github.com/rayw-lab/website/pull/133)） | 交付（单跑道违纪主体更正 ENV 合规 + QST-02 判读作废 + `839b6fe` 双盲归因收敛定谳桩带 + ENV slot#2 三前置 + Tick#18 动作四件套预排）；**plug 原代理同窗交付 [#134](https://github.com/rayw-lab/website/pull/134)** |
| #18 | SEC-P9（本单 [#135](https://github.com/rayw-lab/website/pull/135)，3n 看板界点，T16 §4.2/T17 ④ 预排） | 在途；十六条补登全落 · plug 验证轮收轮窗 ~05:36±5（FB-01 在跑）· [#129](https://github.com/rayw-lab/website/pull/129) 挂双门 · #103/#130 待指挥官处置 |

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

Tick#18 当前在途：

| 在途 | 内容 | 状态 |
|------|------|------|
| plug 验证轮 | 定向 playwright 三例（`/tmp/x2-triage-verify.log`，单跑道令下唯一重负载） | **RUNNING**——EXP-01 **✘ 11.9m**（②，同卡点签名）· QST-02 ✘ 22.2m **判读作废**（⑬ 污染窗口）· FB-01 在跑（worker 59768 存活，收轮 ~05:36±5，窗口预授权保护）；**resume 拒在册**（③），飞行中零杠杆、**禁中止**；收轮即派 PLUG-R2 |
| plug 交付段 | [#134](https://github.com/rayw-lab/website/pull/134)（栈① base=facade-r2，tip `e03271f`）：桥位南移 + 东北簇内退 + 探针 §④ 走廊余量审计（⑮） | **draft · 全量 e2e HOLD 待 ENV 签字**；`839b6fe` 冻结存证（纪律事件#2）；改线去留 + 走廊基线恢复由段末审计定谳 |
| ENV 专项 | main 树 CITY-EXP-01 同挂根因裁决 → 已交付**修复段** [#129](https://github.com/rayw-lab/website/pull/129)（EXP-01 途径点改线 + BL1 桩排 collider 减深；归因：第一触点 = main 存量 BL1 桩带，X2 楔死点即桩带东面、桥腿为叠加恶化；⑭ 双盲收敛坐实） | **转合流门**：draft · tip `5e41550` · **CI 门禁 pass** · 挂双门（CITY-EXP-01×2 三证 + 测试面解冻指挥官签字，⑧）；定向 EXP-01×2 **可开、slot#2 归 ENV，三前置**（收轮三证 + 跑道真空确认 + 归档先行，T17 ③）；面板 RUNNING 合法 |
| SEC-P9 | 本单看板 Tick#18 刷新（[#135](https://github.com/rayw-lab/website/pull/135)，基于 #130 head `f3bc6c2` 叠十六条补登） | 本单 |
| TRIAGE 僵尸 | bc-ace126a4（04:18:22 起，三腿零活性） | **已判 stale 中止、执行待父代理落地**（⑤⑩⑯：T13 裁 → 第 5 tick 未执行）；执行后 2–3min 保险复核验证轮存活 |

X2 实现段已收轮：[#104](https://github.com/rayw-lab/website/pull/104) **e2e 中断收场**，tip `c24c7f3` **draft 禁 ready**；复活门 = #129 双门 + R2 双清 + 全量 80 例 0/0/0（T16 §4.4）。plug r1 tip `368b4d4`：**冻结不 revert 不扩**（B 案存证，T15 §1.5-2）+ **禁改动线令激活**（② 同卡点 ✘）。

已收口（不再占槽）：**Codex 清账 IDLE ✅**（[#103](https://github.com/rayw-lab/website/pull/103) tip `1a4296f` ready · 审计 GO [#120](https://github.com/rayw-lab/website/pull/120) · 待指挥官合入）；**TRIAGE-WRAP stale 中止**（裁决在册，执行见上表）；顾问 T6–T17 交付 [#117](https://github.com/rayw-lab/website/pull/117) / [#118](https://github.com/rayw-lab/website/pull/118) / [#119](https://github.com/rayw-lab/website/pull/119) / [#122](https://github.com/rayw-lab/website/pull/122) / [#123](https://github.com/rayw-lab/website/pull/123) / [#124](https://github.com/rayw-lab/website/pull/124) / [#126](https://github.com/rayw-lab/website/pull/126) / [#127](https://github.com/rayw-lab/website/pull/127) / [#128](https://github.com/rayw-lab/website/pull/128) / [#131](https://github.com/rayw-lab/website/pull/131) / [#132](https://github.com/rayw-lab/website/pull/132) / [#133](https://github.com/rayw-lab/website/pull/133)。

| 待派 | 内容 | 条件 |
|------|------|------|
| PLUG-R2 接管卡（**备妥**） | T15 §1.5 五条款 + T16 §3-S2 修订三条（fresh trace 第一触点定谳分诊 / rebase 清仓 / HOLD 具体化）；X2 新增几何 → A 案（几何让位 + NDC 探针双达标）；main 存量 → 回报移交 ENV | plug 验证轮收轮即派（零空转） |
| 归档代办（父代理自跑，**第 6 次逾期**） | `/tmp/evidence-exp01` 建档 + trace/JSON 原件迁移（69MB trace 裸奔；幂等命令 T14 §4 附；含 plug-wt 预归档增量） | **即刻**，且为 ENV slot#2 三前置之「归档先行」（⑥⑯） |
| 槽空滚动（原 P3） | PERF 六腿 kit · M0-R4 [#106](https://github.com/rayw-lab/website/pull/106) · G1 预登记（#101 已合 ✅） | 槽空即派 |
| X5-R4（原 P4） | X5 招牌续拍（[#100](https://github.com/rayw-lab/website/pull/100) 已授权） | X2 收口后串行 |

## 指挥官真机（零 VM，独立于 loop 在途 · **Tick#18 仍待启动**）

1. **S-2 v1** — [#108](https://github.com/rayw-lab/website/pull/108) kit（S-2 执行单 + AL-R10 空壳）
2. **性能六腿** — [#96](https://github.com/rayw-lab/website/pull/96) 桌面单已在 main

→ artifacts 回传 → **AL-R10**（功能真机复核）/ **AL-PERF**（性能首分登记）→ COMP-M0 五维重算

## OPEN PR

| PR | 状态 | 说明 |
|----|------|------|
| [#103](https://github.com/rayw-lab/website/pull/103) | **ready · 待指挥官合入（第 6 tick 复读）** | AL-FXN-R7 登记 87 · tip `1a4296f` · Codex IDLE ✅ · 落库审计 GO [#120](https://github.com/rayw-lab/website/pull/120) · CLEAN/MERGEABLE · 纯 docs 零跑道零交集 |
| [#129](https://github.com/rayw-lab/website/pull/129) | draft · **CI 门禁 pass** · **挂双门** | ENV 修复段（EXP-01 途径点改线 + BL1 桩排减深，判读 B）· tip `5e41550` · 双门 = CITY-EXP-01×2 三证 + 测试面解冻指挥官签字（⑧ F8）· **过门即合，合流序先于 plug rebase** |
| [#130](https://github.com/rayw-lab/website/pull/130) | draft · 本单基底 | SEC-P8 看板 Tick#15 刷新 · tip `f3bc6c2` 为本单祖先 → **本单为其超集，合本单即收编 #130/#125/#121**（T16 F7 世系实测） |
| [#104](https://github.com/rayw-lab/website/pull/104) | draft · **禁 ready** | X2 立面套件（W2④）· tip `c24c7f3` · 3 例 FAIL 在册（T10 [#123](https://github.com/rayw-lab/website/pull/123)）· 复活门 = #129 双门 + R2 双清 + 全量 80 例 0/0/0 |
| [#134](https://github.com/rayw-lab/website/pull/134) | draft · **e2e HOLD** | plug 交付段（栈① base=facade-r2 · tip `e03271f`）：桥位南移 + 东北簇内退 + 探针 §④ 走廊余量审计；含 r1 四个在先 commit（`839b6fe` 冻结存证，纪律事件#2）；全量 e2e HOLD 待 ENV 签字，改线去留由段末审计定谳 |
| [#133](https://github.com/rayw-lab/website/pull/133) | draft | 顾问 T17：Tick#17 扇出裁决（单跑道违纪主体更正 ENV 合规 + QST-02 判读作废 + `839b6fe` 双盲归因收敛 + ENV slot#2 三前置 + Tick#18 动作四件套） |
| [#132](https://github.com/rayw-lab/website/pull/132) | draft | 顾问 T16：Tick#16 扇出裁决（ENV stale 解除·#129 双门 + 纠偏序改写不 revert + 单跑道六动作 + Tick#17/#18 预排） |
| [#131](https://github.com/rayw-lab/website/pull/131) | draft | 顾问 T15：Tick#15 扇出裁决（验证轮 EXP-01 ✘ 同卡点·resume 拒接管协议 + ENV stale 解除 + P8 补登 + corridor-fix 只并证据） |
| [#128](https://github.com/rayw-lab/website/pull/128) | draft | 顾问 T14：Tick#14 扇出裁决（wrap 报告已被 plug 吸收·TRIAGE-WRAP 中止带保险 + 单跑道令 + Tick#15 P8 预排） |
| [#127](https://github.com/rayw-lab/website/pull/127) | draft | 顾问 T13：Tick#13 扇出裁决（TRIAGE-WRAP stale 中止 + 08-27 先行分支出土 + plug r1 撞纪律纠偏 + Tick#14 预排） |
| [#126](https://github.com/rayw-lab/website/pull/126) | draft | 顾问 T12：Tick#12 扇出裁决（对照跑收轮·阈值 moot + JSON 覆写三度兑现 + Tick#13 plug 栈 GO + stale 清单） |
| [#125](https://github.com/rayw-lab/website/pull/125) | 由本单收编 | SEC-P7 看板 Tick#12 刷新 · head `77a8c2d` 为 #130/本单祖先，合本单后自动转 merged |
| [#124](https://github.com/rayw-lab/website/pull/124) | draft | 顾问 T11：Tick#11 扇出裁决（对照跑收轮 1 failed·判读 B 兑现 + T9 纠偏 + ENV/plug 并行编排 + 全量 80 用例口径） |
| [#123](https://github.com/rayw-lab/website/pull/123) | draft | 顾问 T10：Tick#10 扇出裁决（X2 判活勿重派 + 结局锁 FAIL + T9 合并规则 + Tick#11 预排） |
| [#122](https://github.com/rayw-lab/website/pull/122) | draft | 顾问 T9：Tick#9 扇出裁决（X2 复挂归因坐实两处新碰撞面 + plug GO + 合流序 + P6 矩阵口径） |
| [#121](https://github.com/rayw-lab/website/pull/121) | 由本单收编 | SEC-P6 看板 Tick#9 刷新 · 合本单后自动转 merged |
| [#120](https://github.com/rayw-lab/website/pull/120) | draft | 落库审计 CC-FXN-R103-LANDING-AUDIT：**#103 合流 GO** |
| [#119](https://github.com/rayw-lab/website/pull/119) | draft | 顾问 T8：Tick#8 扇出裁决（#103 合流连锁 + X2 裁决树 + M0-R4 三重门） |
| [#118](https://github.com/rayw-lab/website/pull/118) | draft | 顾问 T7：Tick#7 扇出裁决（Codex push 落地取证 + X2 独占复跑验收树 + Tick#8 预排） |
| [#117](https://github.com/rayw-lab/website/pull/117) | draft | 顾问 T6：Tick#6 扇出裁决 |
| [#116](https://github.com/rayw-lab/website/pull/116) | 内容已并入 #121/本单 | SEC-P5 看板 Tick#6 刷新（#112 超集）· 合本单后可关闭 |
| [#115](https://github.com/rayw-lab/website/pull/115) | draft | 顾问 T5：Tick#5 扇出裁决（阈值对照 + X2 失败留痕 + Codex push 裁决 + Tick#6 预排） |
| [#114](https://github.com/rayw-lab/website/pull/114) | draft | 顾问 T4：Tick#4 扇出裁决（X2/Codex 活性判定 + T4-A 顺延 + 合流优先级 + Tick#5 预排） |
| [#113](https://github.com/rayw-lab/website/pull/113) | draft | 顾问 T3：Tick#3 扇出裁决（不加开实现路 + Tick#4 预排 + 事故缓解核证） |
| [#112](https://github.com/rayw-lab/website/pull/112) | CI 绿 | SEC-P4 看板 Tick#3 刷新（含 #109 P3 全量）· 内容已并入 #116/#121/本单，合后可关闭 |
| [#111](https://github.com/rayw-lab/website/pull/111) | draft | 顾问 T2：Tick#2 扇出裁决（三路并行 + #103 补洞门 + Tick#3 预排） |
| [#110](https://github.com/rayw-lab/website/pull/110) | draft | 顾问 R1：2–3 天 VM loop 自动推进方案（tick 决策树 + 六槽预算） |
| [#109](https://github.com/rayw-lab/website/pull/109) | CI 绿 | P3 秘书刷新看板 · 内容已并入 #112/#116/#121/本单，合后可关闭 |
| [#108](https://github.com/rayw-lab/website/pull/108) | draft | S2 指挥官真机 kit（S-2 v1 + AL-R10 空壳） |
| [#107](https://github.com/rayw-lab/website/pull/107) | draft | 编排交接单 2026-08-28 + VM 并发上限调研（硬护栏 3） |
| [#106](https://github.com/rayw-lab/website/pull/106) | draft | COMP-M0-R4 综合实算 WIP（槽空续派） |
| [#105](https://github.com/rayw-lab/website/pull/105) | draft | COMP-M0-R3 kickoff 留痕 |

## 阻塞

- **PR [#43](https://github.com/rayw-lab/website/pull/43) BL2** · NO-GO · **禁止合流**
- **[#104](https://github.com/rayw-lab/website/pull/104)** · **禁 ready** · 复活门 = [#129](https://github.com/rayw-lab/website/pull/129) 双门 + R2 双清 + 全量 80 例 0 failed/0 skipped/0 flaky（T16 §4.4）
- **plug 线** · `368b4d4`/`839b6fe` **冻结不 revert 不扩**（B 案存证；`839b6fe` 纪律事件#2 三 spec 二次扩改）· **禁改动线令激活**（EXP-01 ✘ 同卡点，② T14 §2.1 条款兑现）· **resume 拒 → 飞行中零杠杆**，收轮后按接管协议派 R2（③；trace 定谳走第一叉：EXP-01 责任移交 #129，A 案降级，⑭）· [#134](https://github.com/rayw-lab/website/pull/134) e2e HOLD、纠偏落地前禁 ready/禁合
- **[#129](https://github.com/rayw-lab/website/pull/129) 双门** · CI 门禁 pass 但 ① CITY-EXP-01×2 三证未跑（slot#2 三前置：收轮三证 + 跑道真空确认 + 归档先行，T17 ③）② **测试面解冻指挥官签字缺位**（⑧ F8 纪律登记）· 未过门禁合；过门即合且**先于 plug rebase**
- **TRIAGE bc-ace126a4** · 已裁未执**第 5 tick**（⑤⑩⑯）· 待父代理中止落地 + 2–3min 保险复核；落地前看板不得写「已中止」
- **归档代办** · **第 6 次逾期**（⑥⑯，本单 05:33 实测 `/tmp/evidence-exp01` 仍缺失，69MB trace 裸奔）· 父代理即刻自跑，ENV slot#2 前置
- **[#103](https://github.com/rayw-lab/website/pull/103)** · 技术阻塞已清 · **仅待指挥官合入**（第 6 tick 复读）；合入后秘书另开增量登记 87
- **真机 S-2 / 性能六腿（零 VM）** · 仍待指挥官启动，AL-PERF / AL-R10 前置

## 归档（一行）

顾问 [#87](https://github.com/rayw-lab/website/pull/87)[#88](https://github.com/rayw-lab/website/pull/88)[#98](https://github.com/rayw-lab/website/pull/98) · AL-FXN **84** [#84](https://github.com/rayw-lab/website/pull/84) · AL-VIS **73** [#94](https://github.com/rayw-lab/website/pull/94) · C5-R3 [#90](https://github.com/rayw-lab/website/pull/90) · C6 [#91](https://github.com/rayw-lab/website/pull/91) · X1a-R4 [#92](https://github.com/rayw-lab/website/pull/92) · X3-R4 [#93](https://github.com/rayw-lab/website/pull/93) · 秘书 [#86](https://github.com/rayw-lab/website/pull/86)[#95](https://github.com/rayw-lab/website/pull/95) · 范式 [#85](https://github.com/rayw-lab/website/pull/85) · 清理 [#89](https://github.com/rayw-lab/website/pull/89) · TM-PREP [#99](https://github.com/rayw-lab/website/pull/99) · G3+X5 [#100](https://github.com/rayw-lab/website/pull/100) · FXN-NEXT [#97](https://github.com/rayw-lab/website/pull/97) · PERF-DESK [#96](https://github.com/rayw-lab/website/pull/96) · VEH-R3 留痕 [#102](https://github.com/rayw-lab/website/pull/102) · X1b [#101](https://github.com/rayw-lab/website/pull/101)
