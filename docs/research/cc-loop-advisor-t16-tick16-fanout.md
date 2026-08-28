# CC-LOOP-ADVISOR-T16 · Tick#16 扇出裁决（fanout）

- **顾问**：CC-LOOP-ADVISOR-T16（model slug: `claude-fable-5-thinking-xhigh`）
- **取证窗口**：2026-08-28 05:10–05:16 UTC，全部一手取证（面板 API RUNNING 过滤 / gh API / git log 远端 ref 实读 / diff 实读 / 文件 mtime 全 ISO / ps + uptime / T13–T15 交付文档全文实读）
- **基线**：main @ `88097f9`（fetch 实测无新合入）
- **纪律**：零 `src/` 改动；独立 worktree `/tmp/t16-wt`（base = origin/main）；本文档不写看板，登记由秘书线单源（`docs/research/cyber-city-score-loop-orchestration.md`）
- **本 tick 大事**：① **ENV stale 线彻底解除**——简报还在问「05:10 stale 线 fresh 判定」，实测 ENV 已于 **05:04:23 push `5e41550`** 并于 **05:05:04 开 draft PR [#129](https://github.com/rayw-lab/website/pull/129)**（e2e 途径点改线 + BL1 桩排 collider 减深，验证栏自署「待 plug 收轮后独占跑 CITY-EXP-01×2」）：T15 §2.1 预排的 Tick#17 首 commit / Tick#18 首推两级里程碑**一次性跳级达成**，不 resume、不重派（§2）；② **T15 已交付 [#131](https://github.com/rayw-lab/website/pull/131)**（`e05a80f`，05:12:14）——简报「T15 RUNNING」已被超越，其接管协议 / B 案未证有效 / corridor-fix 只并证据三链全部有效承接；③ **简报的纠偏序「revert e2e → A案几何」双重过时**——T15 §1.5-2 已改判「B 案冻结不 revert（存证）」，且 ENV 归因把 EXP-01 第一触点移到 **main 存量桩带东面**（X2 楔死 (19.4,-32.7) 即桩带东面，桥腿仅叠加恶化），纠偏枢纽从「plug 分支自我修正」移到「**ENV 合流 + plug rebase 清仓**」（§3）；④ TRIAGE 僵尸「已裁未执」进入**第 4 个 tick**、归档代办**第 5 次逾期**——两件零跑道动作再不落地即成范式事故（§1）

---

## 0. 事实核查——八条推翻/超越 Tick#16 简报的 fresh 事实

| # | 简报口径 | 实测（05:10–05:16 UTC） | 证据 |
|---|---------|------------------------|------|
| **F1** | 「ENV RUNNING，T14 说 05:10 stale 线——请 fresh 判定」 | **stale 线解除且里程碑跳级**：远端 `cursor/cc-fxn-exp01-env-5b71` tip `5e41550`（committer 05:04:23Z）+ draft PR [#129](https://github.com/rayw-lab/website/pull/129)（05:05:04Z）。T14 §2.2 的 05:10 线针对「零足迹」情形，T15 F1 已按 worktree 足迹（05:00:43）解除；本轮 push+PR 使 T15 §2.1 的 Tick#17（首 commit）/Tick#18（首推）两级监控阈值全部**提前作废**。面板复核 ENV（bc-53ac6339）仍 RUNNING——合法：其 PR 验证栏自署等 runway | git log 远端 ref + gh pr view 129 + 面板 API |
| **F2** | 「T15 顾问 RUNNING」 | **T15 已交付**：PR [#131](https://github.com/rayw-lab/website/pull/131)（`e05a80f` 05:12:14）；面板 RUNNING 过滤已无 T15。其六项裁决（接管协议 §1.4-1.5 / F2 签名喂 ENV / TRIAGE 执行 gap / 归档四逾 / P8 补登七条 / corridor-fix 只并证据）本文全部承接并增量修订 | gh pr list + 面板 API |
| **F3** | 「plug tip 368b4d4 仍含 e2e 改动，T13 要求 A案纠偏待收轮」（隐含纠偏序 = revert e2e → A案几何） | **纠偏序双重过时**：① T15 §1.5-2 已改判「`8e441ef`/`368b4d4` **冻结不 revert**（B 案存证）也不扩」；② ENV 归因（#129 正文）把 EXP-01 第一触点定到 **BL1 桩带**（世界 x∈[16.2,17.8]、南缘 z≈-25.25 伸入走廊；X2 楔死点 (19.4,-32.7) 即桩带东面，桥腿为叠加恶化）——若 trace 定谳采信，plug 的 A 案几何对 EXP-01 **不再是主修**。纠偏序改写为 trace 定谳先行的分诊树（§3） | T15 §1.5 原文 + #129 body + T9/T11 卡点在册 |
| **F4** | 「plug 定向 playwright 单跑道占用」 | 复核成立且有进度增量：**EXP-01 ✘（11.9m，05:03:27，卡 (19.5,-32.9)@1km/h ≈ X2 原卡点 (19.4,-32.7)，T15 F2 在册）**；QST-02 在跑（05:05:13 `quest-car-ready.png` 落盘，chrome-headless-shell PID 52633 + worker 52621 存活，折算 ~750s → 预计 ~05:16 收）；FB 排队（~650s → **收轮 ~05:27±5** 维持 T15 口径）。load 5.77 / 4 核——单跑道令持续有效 | /tmp/x2-triage-verify.log + test-results mtime + ps + uptime |
| **F5** | （简报未及） | **TRIAGE 僵尸「已裁未执」第 4 个 tick**：面板实测 bc-ace126a4 仍 RUNNING（04:18:22 起，T13 裁 → T14 裁 GO 带保险 → T15 三度点名 → 本轮第四度）。P8 看板已登记「已判 stale 中止」，面板实况持续背离看板措辞 | 面板 API RUNNING 过滤 |
| **F6** | （简报未及） | **归档代办第 5 次逾期**：`/tmp/evidence-exp01` 05:13 实测仍不存在；ENV 卡第一动作也未替父代理兑现（ENV 把精力投给了修复段）。被覆写 `e2e-results.json` 垃圾值与 trace 原件仍在 `/tmp/main-wt/test-results/` 裸奔 | ls 实测 |
| **F7** | 「#103/#130 未合」 | 复核成立并补世系：#103 OPEN/ready/**CLEAN/MERGEABLE**（`1a4296f`，审计 GO #120 在册，连续第 5 tick 复读即合）；#130 draft，**base=main 且 P7 tip `77a8c2d` 实测为 P8 tip `f3bc6c2` 祖先** → 合 #130 即塌全栈（#125/#121 自动转 merged），但 #130 成稿早于 F1/F2，T15 §3 七缺项 + 本文 §4 新四项待 P9 补登后再塌 | gh pr view + merge-base --is-ancestor 实测 |
| **F8** | （简报未及，纪律登记） | **ENV 交付形态 = 修复段**（e2e 35 行 + src 9 行；HeroBlenderMesh 桩排 collider z 19.25→17.0 / half-z 7.5→5.25，与 #129 声明「北三桩 z∈[-40.25,-29.75]」一致），与 T13 §2 骨架「零 src/零 e2e 只交报告」不同。PR 标题自署「判读 B 修复段」→ 推定父代理已按 T13 §2-⑤「main 侧修复另开单」改派修复卡（合规）；**但 e2e 途径点改线 = 测试面变更，测试面解冻一次性签字（指挥官）至今未见登记**——须挂 #129 合流门（§2.3）。若父代理并未改派（ENV 自扩权），则属纪律事件，段末审计点名定谳 | diff 实读 + #129 body + T13 §2/§3.0-2 原文 |

---

## 1. 单跑道：plug 验证轮期间父代理动作（任务 ①）

验证轮预计 **~05:27±5 收轮**（F4）。期间**零加开重负载**（T14 §4 算力上界证据在册：SwiftShader 单进程 337% CPU、本轮实测 load 5.77/4 核）。以下全部为零跑道动作，按序执行：

1. **归档代办即刻自跑（第 5 次逾期，本文措辞升级为「本 tick 内必须落地」）**：`mkdir -p /tmp/evidence-exp01 && cp -a /tmp/main-exp01.log /tmp/main-wt/test-results/cyber-city-explore-*world-chromium /tmp/evidence-exp01/ && cp -a /tmp/x2-wt/test-results /tmp/evidence-exp01/x2-test-results`（幂等 ~1min）。**并追加一条**：`cp -a /tmp/plug-wt/test-results /tmp/evidence-exp01/plug-verify-round`——验证轮的 EXP-01 ✘ trace（05:03）是 R2 接管卡第一动作的输入，JSON 覆写坑已三度兑现，勿等收轮后被清点覆写。
2. **TRIAGE 中止执行落地（已裁未执第 4 tick）**：中止 bc-ace126a4 → 2–3min 内复核验证轮存活（参照物 = `/tmp/plug-wt/test-results/` mtime 推进 + chrome PID 52633/worker 52621 存活；T14 §1.2 保险原文）。若验证轮随中止死亡（归属误判），重放命令在 `/tmp/x2-triage-verify.log` 头部与 tmux `x2-triage-verify` 会话历史。
3. **向 ENV 发一条合并传话包**（一条 follow-up 三件事，传话不属加开）：
   a. **F2 失败签名喂入**（T15 裁决 2，若尚未执行随包补发）：`途径点 (-19,-30) 不可达，卡 (19.5,-32.9)@1km/h` + trace 路径 `/tmp/plug-wt/test-results/cyber-city-explore-*world-chromium/`——这是**改线后仍挂**的失败，且卡点即其归因的桩带东面，是 #129 归因的最强旁证，应写进 PR 归因节；
   b. **runway 排队确认**：#129 验证腿（CITY-EXP-01×2）HOLD 至验证轮收轮，收轮后 **runway slot#2 归 ENV**（§3-S3 队列）；开跑纪律 = tmux 后台化 + 自然收轮 + 三证合一 + 收轮即归档；
   c. 告知归档代办已由父代理落地（动作 1），其卡第一动作解除。
4. **备好 PLUG-R2 接管卡**（T15 §1.5 五条 + 本文 §3-S2 修订三条），收轮即派零空转。
5. **合流传话（第 5 tick 复读）**：#103 即合（CLEAN/MERGEABLE + 审计 GO #120，纯 docs 零跑道零交集）；秘书栈塌栈待 P9 补登（§4）。
6. **对 plug 零动作**：resume 拒在册（T15 §1.1），follow-up 物理不可达；验证轮正在产 #33/#35 挤兑判读数据，**禁止飞行中中止**（T15 §1.2 原文）。

---

## 2. ENV fresh 判定（任务 ②）：**不 stale、不 resume、不重派——转「验证腿排队 + #129 双门」**

### 2.1 判定

| 判项 | 实测 | 结论 |
|------|------|------|
| stale？ | push `5e41550` 05:04:23 + draft #129 05:05:04 + 面板 RUNNING；T14 05:10 线针对「零足迹」，T15 已按 worktree 足迹解除，本轮 push+PR 双级跳 | **否**——三腿判活（推送/产物/进程语境）中推送腿直接命中 |
| 应 resume？ | ENV 未失联：交付合乎节奏（worktree 05:00:43 → push 05:04 → PR 05:05），当前合法等 runway（其 PR 验证栏自署） | **无需**——resume 是对失联代理的杠杆，ENV 不满足前提 |
| 应重派？ | 剩余交付只剩验证腿（CITY-EXP-01×2 + 回填 + 「ENV 放行」签字），代码已在分支 | **否**——重派 = 制造双写手；plug 线的 resume 拒**不可外推**到 ENV 线（不同代理、询问杠杆未被证伪） |

### 2.2 监控阈值（替换 T15 §2.1 已作废的里程碑链）

| 时点 | 阈值 | 到点动作 |
|------|------|---------|
| 验证轮收轮 + 10min | ENV 应起验证腿（tmux 会话 + playwright 进程 + `/tmp/env-wt/test-results` 新 mtime） | 未起 → follow-up 询问（询问杠杆可用，**不中止**） |
| 询问 + 20min 零响应零足迹 | 三腿零活性 | 升级**接管**：新卡只做验证腿 + 回填 + ready 判据，**禁重写分支上已有代码**（防双写手 + 防推倒重来） |
| 验证腿在跑 | 判活 = test-results mtime + 渲染 PID；EXP-01 新预算三腿 360/480/360s、成功路径自估 ~15min/趟 ×2 | 双零增长 ≥25min 候选、≥35min 升级（精确 PID kill） |

### 2.3 #129 合流双门（缺一不可，父代理登记）

1. **验证门**：CITY-EXP-01×2 三证合一（自然退出 + list 末行 + JSON stats）全绿，回填 PR 验证节并自签「ENV 放行」；
2. **签字门（F8）**：e2e 途径点改线 = 测试面变更，按 T13 §3.0-2 口径须**指挥官测试面解冻一次性签字**——ENV 现在既是定谳者又是修复者，签字更不可少（防运动员兼裁判）；签字随 #129 合流一并落纸，并同步登记「EXP-01 canonical 路线 = 霓虹大街三腿」进测试跑法单源 `docs/research/cyber-city-test-framework.md`。
3. 附段末审计核对项：桩排 collider 世界系换算复核（local z 19.25→17.0 / half-z 7.5→5.25 ⇔ 声明「世界 z∈[-40.25,-29.75]、南端第 1 桩转纯视觉」）+ 「罕见脱线穿模 vs 确定性楔死」的取舍登记。

### 2.4 冲突登记（合流序硬依赖）

**#129 与 plug 分支同改 `e2e/cyber-city-explore.spec.ts` EXP-01 驾驶腿区域**（ENV：途径点改线 + setTimeout 2400→3000s；plug `8e441ef`：动线绕桥腿）——textual+semantic 冲突必然。**合流序锁定：#129 先合，plug 分支 rebase 后清仓**（§3-S2 修订 b）；反序 = ENV 的 canonical 路线被 plug 的 B 案覆写，审计面失单源。

---

## 3. plug 收轮后纠偏序（任务 ③）——改写版：**不 revert，trace 定谳先行，ENV 合流 + rebase 清仓**

简报期望的「revert e2e → A案几何」不再成立（F3）。改写后的收轮触发序：

**S1 收割登记**（收轮即做）：QST-02/FB 结果 + #33/#35「异根 vs 挤兑」判读数据入台账；tmux `x2-triage-verify` capture-pane 留现场后 kill-session；test-results 即归档（§1-1 已预归档，收轮后增量补拷）。

**S2 派 PLUG-R2 接管卡**：T15 §1.5 五条为基（同分支单写手 / e2e 冻结不 revert / trace 定谳第一动作 / 全量 HOLD / 代回填 §6），叠加三条修订：

- **修订 a（定谳分诊）**：trace 逐帧定 (19.5,-32.9) 第一触点归属——
  · **= 桩带东面（main 存量，ENV 归因方向）** → EXP-01 责任正式移交 #129，R2 **不再为 EXP-01 动任何动线或几何**（T13 §3.1-③ 边界规则 + T15 禁改令双重在册）；A 案几何降级为「构图/余量优化项」挂段末审计裁决；
  · **= X2 新增几何（桥腿/楼排景框件）** → A 案几何主修成立：桥沿 z≥-21 或腿柱世界 x≥30 + `tools/camera/audit-x2-visibility.mjs` NDC 探针构图碰撞双达标。
- **修订 b（rebase 清仓，前置 = #129 双门过）**：#129 合流后 R2 rebase plug 分支——EXP-01 spec 区冲突**一律取 main（ENV canonical 路线）**；plug 自己的四条动线改道按「桩排减深已解毒」逐线复核，能还原则还原（B 案动线改动清仓，`8e441ef` 存证价值已由 git 历史承载）；world-chromium 串行化与 workers 2→1 **不随迁不还原**，留段末审计定谳（测试跑法单源冲突 + 墙钟预算重标两项在册）。
- **修订 c（HOLD 门具体化）**：全量 e2e 开跑门 = #129 双门过 + R2 定向复跑绿；硬门 80 例 0 failed/0 skipped/0 flaky 不降；poster 类重拍永远排批次最后。

**S3 runway 队列（单跑道令延续）**：slot#2 = **ENV CITY-EXP-01×2**（短、已编码、决定性实验——它同时检验判读 B 与 #129 可合性，信息密度最高）→ slot#3 = R2 定向复跑（若修订 a 走 X2 叉需 A 案落地后）→ slot#4 = 全量 e2e。R2 的 trace 定谳 / rebase / 编码均为轻负载，可与 slot#2 并行。

**分诊树兜底**：ENV 验证若 **✘**（改线 + 减深仍挂）→ 判读 B 动摇，回 ENV 三候选重裁（候选 a「控制器爬行」升格主嫌），R2 全 HOLD 防白烧独占窗口；若 **✓✓** → 按 S2 修订 b 直行。

**枢纽变化一句话**：纠偏的重心从「plug 分支自我修正」移到「ENV 合流 + plug rebase 清仓」——单写手、路线单源、测试面一次性签字，三件事在同一合流序里闭环。

---

## 4. Tick#17 预排（任务 ④)

### 4.1 时点与动作

Tick 节奏 10min 在册 → Tick#17 ≈ **05:20**：预计 QST-02 已收（~05:16）、FB 在跑，**仍纯监控 tick**；收轮 05:27±5 大概率落 Tick#17–18 之间。

| 路 | 动作 | 口径 |
|----|------|------|
| T17-A | 核 §1 清单执行位（归档 / TRIAGE 中止 / ENV 传话包 / R2 卡备好 / #103 合流） | 任一未落地即本 tick 补执行；TRIAGE 若仍 RUNNING 进第 5 tick → 升级为「父代理执行力事故」上板 |
| T17-B | QST-02 结果登记 | ✓ → #33 挤兑判读初证（串行化有效）；✘ → 异根候选升格，随 S1 一并收割 |
| T17-C | 收轮若提前 → 即走 §3 S1–S3（派 R2 + 放 ENV 上 runway） | R2 卡即 §3-S2；ENV 传话包 §1-3-b 已预埋 |
| T17-D | T7-A 视觉审计维持事件门不派 | 门不变：ENV 定谳 + plug 双清 + 验收全绿 + #104 门禁 fresh 绿 + X2 线 IDLE |

### 4.2 Tick#18（3n 界点）：秘书 P9

- **形态建议**：P9 **接管 P8 分支**（P8 代理已 IDLE，单写手安全）加增量 commit → ready #130 → 指挥官一次塌栈（#121/#125 自动转 merged，F7 世系实测在册）。
- **补登清单** = T15 §3 七条 + 本文新四条：⑧ ENV push `5e41550` + #129 双门（验证 + 测试面签字）；⑨ T15 交付 #131；⑩ TRIAGE「已裁未执」tick 计数（第 4 起）与执行落地时间；⑪ 验证轮三例终局结果 + 纠偏序改写（本文 §3 取代「revert e2e」旧口径）。
- **登记矩阵四行照抄**（看板单源，本文不改板）：北极星 **98 / 98 / 90 / 85** vs 生产登记 **80 / 71 / 84 / —**（综合/视觉/功能/性能）；性能未登记显式 **—**，解锁条件 = 真机 human-gate 六腿 → AL-PERF。

### 4.3 槽位算术

Tick#17 在途 = plug（验证轮）+ ENV（等 runway）+（TRIAGE 中止后清零）= **2 路**；本顾问交付即 IDLE。新派 ≤1（收轮触发的 R2，或 Tick#18 的 P9），符合 2–6 约束；验证轮收轮前新增重载 = 0（单跑道令）。

### 4.4 合流提醒（第 5 tick 复读 + 增量）

> 待指挥官：**#103 即合**（CLEAN/MERGEABLE + 审计 GO #120，五 tick 连续复读）；**#130 待 P9 补登后 ready 塌栈**（合它即收编 #125/#121）；**#129 挂双门**（验证 ×2 绿 + 测试面解冻签字），过门即合、合流序在 plug rebase 之前；**#104 维持 draft 禁 ready**（复活门 = #129 双门 + R2 双清 + 全量 80 例 0/0/0）。

---

## 5. 裁决一览（父代理直接执行，按序）

1. **ENV 判定：不 stale、不 resume、不重派**（F1 + §2.1）；T14 05:10 线与 T15 里程碑链均作废，转 §2.2 阈值 + §2.3 #129 双门（验证 + 测试面签字）。
2. **纠偏序改写**（§3）：不 revert plug 的 e2e（T15 冻结令维持）；收轮 → S1 收割 → S2 派 R2（trace 定谳分诊 + rebase 清仓 + HOLD 门具体化）→ S3 runway 队列 slot#2=ENV 验证 / slot#3=R2 复跑 / slot#4=全量。
3. **单跑道期间零跑道动作六件**（§1）：归档自跑（第 5 次逾期，含 plug-wt 预归档增量）、TRIAGE 中止落地（第 4 tick）+ 2–3min 保险、ENV 三合一传话包、R2 卡备妥、#103 合流传话、对 plug 零动作。
4. **#129 合流序锁定**：先于 plug rebase；EXP-01 spec 冲突一律取 ENV canonical 路线；串行化/workers 2→1 留段末审计，未签字不作数。
5. **F8 纪律登记**：ENV 修复段推定父代理改派合规，但测试面解冻签字缺位——挂 #129 合流门；若实为自扩权，段末审计点名。
6. **Tick#17 纯监控 + 四路核对**（§4.1）；Tick#18 派 P9（接管 P8 分支 → ready #130 → 塌栈），补登 11 条。
7. **兜底分诊**：ENV 验证 ✘ → 判读 B 动摇回炉三候选（候选 a 升格），R2 全 HOLD；✓✓ → 直行 rebase 清仓。

---

*本文档为 CC-LOOP-ADVISOR-T16 Tick#16 交付物；登记看板不在本文更新，由秘书线单源维护。*
