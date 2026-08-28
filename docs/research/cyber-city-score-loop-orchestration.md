# Phase 0 提分 Loop 编排看板

`main` @ `9177dcc` · 2026-08-28 06:48 UTC · **合流收口 + 功能 87 增量登记（SEC-FXN87，事件驱动界点单）** · 范式 `cyber-city-orchestration-paradigm.md` · 本单 = 董事会即合序 ①② 执行后的秘书登记件（base = main@`9177dcc`，塌栈世系已全收编，看板恢复 base=main 单链）

> **董事会终裁生效（CC-LOOP-BOARD-ADVISOR-R1，指挥官 2026-08-28 授权）**：书面裁决 = 父代理与所有子代理必须执行的董事会决议，冲突时优先于顾问链 T* 与一切实现/审计单。全文见 `docs/research/cc-loop-board-advisor-r1.md`（已随 [#143](https://github.com/rayw-lab/website/pull/143) 落 main）；要点见下「董事会终裁」节。**即合序 ①②（#103 + #143）已于 06:47 UTC 执行完毕**（见「MERGE-WAVE 9 合流记录」节）；禁合项与双门口径不变。

**模型（L8+）**：全部子代理 Task = `claude-fable-5-thinking-xhigh`；在途 Sol 可跑完（§1.2 宽限）。

> **合流已落地（本单登记核心）**：指挥官授权父代理 squash 合流 ① [#103](https://github.com/rayw-lab/website/pull/103) → main@`e604568`（2026-08-28 06:47:47 UTC，AL-FXN-R7 功能审计 87 落库，第 9 次复读催办件清账）② [#143](https://github.com/rayw-lab/website/pull/143) → main@`9177dcc`（06:47:59 UTC，董事会 R1 终裁 + 秘书世系塌栈）。**同窗 close supersede 八单**：#140/#135/#130/#125/#121（塌栈世系收编）+ #116/#112/#109（内容已并入世系）——8/8 实测 CLOSED。登记矩阵功能 **84 → 87** 由本单落账（见「登记矩阵」）；90 禁登（云端封顶 87–88）。
>
> **在途等待项（合流收口后）**：① X2 链路——**ENV [#129](https://github.com/rayw-lab/website/pull/129) ×2 门第二次重锚 run3/run4 干净趟**（T21 [#139](https://github.com/rayw-lab/website/pull/139) §1.2）：run1/run2 双诊断趟不计（㉓㉔）；每趟真空三查留档 + **跑道互斥令**（㉚：×2 趟在飞全 VM 禁起 chrome 级活动，父代理同受约束）+ **archive-then-clean 铁则**（㉙：启动命令永久禁嵌 `rm -rf`）；假 ✓ 机制实证在册（㉛）；✓✓（run3+run4）→ 签字门（扩大清单含 #134 三 spec，T19 §2.3）→ 合流，**#129 合流窗最早 Tick#29–30**；#129 CI 门禁 pass · draft 挂双门不变；② **plug 门后件**：[#134](https://github.com/rayw-lab/website/pull/134) IDLE draft（tip `e03271f`，A 案几何内容留段末审计放行，过门后先入 #104 分支）；[#104](https://github.com/rayw-lab/website/pull/104) 维持 draft 禁 ready，复活门三条 = #129 双门 + R2 双清 + 全量 80 例 0/0/0（集成树口径，T19 §3.3）；③ R2 零跑道首批已交付 [#145](https://github.com/rayw-lab/website/pull/145)（draft，㉕ 拖欠账落地清偿）；同窗顾问件 T22 [#141](https://github.com/rayw-lab/website/pull/141) · T24 [#144](https://github.com/rayw-lab/website/pull/144) · GOV-ROLES [#142](https://github.com/rayw-lab/website/pull/142) 待存档波；④ **存档波（即合序 ③）**：docs-only 顾问/审计 PR 每波 ≤5 批量合并，空档执行；⑤ 全量 e2e 解锁链六条中「#103+塌栈」一项**已落袋 ✅**，关键路径剩 #129 的 ×2 链，开闸窗口 **Tick#29–#31**。
>
> **Tick#13 出土在册**：08-27 先行分支 `cursor/cc-exp01-corridor-fix-0254`（remote `a59d1ea`）早已定性「直线走廊被 BL1 充电桩排封死」并原型测试面改法；T15 [#131](https://github.com/rayw-lab/website/pull/131) §4 裁决 **不并代码、只并证据链**（ENV 报告设三源对表专节；B 案若签字转正也以 fresh base 单 PR 重实现；分支保留登记 `a59d1ea`）。

## 登记矩阵（**每 tick 首段必输出**）

| 维度 | 北极星 | 生产登记 | Δ | 在途 |
|------|--------|----------|---|------|
| **综合** | **98** | **80** | +18 | COMP-M0 重算（#105 留痕 / #106 WIP）——功能输入 84→87 已更新，重算待续派 |
| **视觉** | **98** | **73** | +25 | 顾问路径 →~78（[#98](https://github.com/rayw-lab/website/pull/98) 已合）· X1b [#101](https://github.com/rayw-lab/website/pull/101) 已合待复评 · X2 [#104](https://github.com/rayw-lab/website/pull/104) draft 禁 ready → ENV 修复段 [#129](https://github.com/rayw-lab/website/pull/129) run1/run2 双诊断趟（污染/探针并发）· **×2 重锚 run3/run4**（T21 §1.2，✓✓ 唯一放行口径）+ plug 交付 [#134](https://github.com/rayw-lab/website/pull/134)（e2e HOLD·段末审计）+ 验证轮终局 1/2/0/0（FB ✓ → #35 挤兑判读成立，⑰） |
| **功能** | **90** | **87** | +3 | **本单增量登记 84 → 87**（[#103](https://github.com/rayw-lab/website/pull/103) 合流 SHA `e604568`；JSON 单源 `cyber-city-function-rubric-score.json` main 实测 score=87）· 真机 S-2 缺席云端封顶 87–88，**90 禁登** → 解锁路径 = 指挥官真机 S-2 → AL-R10 计时增补轮 |
| **性能** | **85** | **—** | +85 | 六腿桌面单 [#96](https://github.com/rayw-lab/website/pull/96) 已在 main；首分待指挥官真机 → AL-PERF |

> 登记只认审计独立分（JSON 单源：视觉 main = 73，功能 main@`9177dcc` = **87**——`docs/research/cyber-city-function-rubric-score.json` 本单实测交叉核验：score=87 · target=90 · Pass A 86 / Pass B 87 分歧 1 取证据更完整的 B · wave2 §1.2 云端从严封顶 87–88，F1/F2/F3/F4 计时锚 SwiftShader 禁判恒锁 85，**90 数学不可达、禁登**，顺延真机计时增补轮）。禁止 LHCI/e2e/smoke 冒充功能或性能。**#103 口径注释已兑现**：合流前登 84 → #103 合入 main@`e604568` 后由本单（秘书增量登记）登 **87**，未冒登、未越顶。诊断跑不作发布/登记分输入（T18 §1.2 硬校验注记）。

## 董事会终裁（事后顾问 · CC-LOOP-BOARD-ADVISOR-R1 · Tick#22）

**触发条件（本次已满足）**：① 连续多 tick 无有效新增（ENV ×2 被污染诊断样本连烧 run1/run2 两趟；#103 第 9 次复读、#135 塌栈拖欠多 tick）；② 角色冲突（ENV 跑道 vs 父代理 fps-probe 互污、TRIAGE stale 已裁未执第 6+ tick、plug 纪律事件 #3、顾问链每 tick 一单与实现链互相覆盖，open PR 达 39）。事后顾问触发与权威已固化入范式手册 §1.3。

**本 tick 董事会决议摘要**（全文 = 终裁文档 §1–§7）：

1. **角色终裁**：ENV 继续（唯一跑道主，run3/run4）；父代理探针窗一次性限时放行后**永久禁与 ENV 趟并发**；plug 停（跑道禁入至段末审计窗）；TRIAGE 终止定谳禁 resume；顾问链节流（T22 起停每 tick 扇出，事件驱动 + 3n 保底）；秘书 3n 单频（#140 冻结、87 增量并入下一界点单）；R2 立即重派（零跑道首批）；段末审计待命；事后顾问交付即 IDLE。
2. **即合序**：① [#103](https://github.com/rayw-lab/website/pull/103) 直接 merge（催办件转即时执行令）→ ② 本单 merge（塌栈收编秘书全世系）→ ③ 存档波：docs-only 顾问/审计 PR 每波 ≤5 单批量合并（空档执行）。**禁合项**：#129（✓✓+签字前）、#104/#134（段末审计放行前）、#43/#34/#28（冻结另案）。
3. **探针窗硬闭**：`MAIN_DONE` 或 **06:40 UTC** 取先——PID 收割 fps-probe 谱系（79523/81006 + chrome 树）+ kill-session；probe 日志归档 `/tmp/evidence-exp01/probe/`；06:40 后未完成腿作废。
4. **run3/run4 真空规程**（终裁 §3）：归档先行（run2 → `run2-diagnostic/`，启动令永久禁嵌 `rm -rf`）→ 全清场（六会话 + 4475/4610/4507，第 4 tick 最后通牒）→ 真空三查留档（`vacuum-run3.txt`/`run4.txt`，缺档 = 该趟自动降级）→ 命名令 run3/run4 + 三证合一 + 在飞全 VM 互斥；✓✓ → 签字门 → #129 合流（预计 Tick#29–30）。
5. **永久硬令**：fps-probe（及任何 chrome 级探针/截图/LHCI/临时 preview）与 ENV 决定性趟（×2 验证趟、全量 e2e 窗）并发 = **永久禁止，无例外**；探针只许在登记空档内跑（先过真空三查 + 看板登记起止 + 自带硬闭点）；违令该趟/该窗证据作废 + 主体入执行力账，父代理同权受约束。
6. **矩阵口径终裁**：视觉生产登记唯一口径 = 看板单源 **73**；AGENTS.md §4.4 旧值 71 属 stale，本 PR 同步修正；#103 合入后功能 87 由秘书下一 3n 界点单登记，禁冒登。

**角色表（董事会终裁 · 含事后顾问）**：

| 角色 | 职责 | 董事会终裁状态 | model slug |
|------|------|----------------|-----------|
| 父代理 | 只编排 + 受限运行时操作（§3.5 互斥硬令约束） | 继续 | 产品设置决定 |
| ENV（#129 实现） | 唯一跑道主：run3/run4 真空趟 + 签字门材料 | 继续 | `claude-fable-5-thinking-xhigh` |
| plug（X2 #134） | 交付冻结待段末审计 | **停**（跑道禁入） | `claude-fable-5-thinking-xhigh` |
| TRIAGE（bc-ace126a4） | — | **终止定谳，禁 resume** | — |
| 顾问链 T-series | 扇出裁决 | **节流**：事件驱动 + 3n 保底 | `claude-fable-5-thinking-xhigh` |
| 秘书 SEC-P 系列 | 看板单源维护 | 继续（3n 界点单频） | `claude-fable-5-thinking-xhigh` |
| R2（PLUG-R2 接管卡） | 零跑道四件首批 → #129 后跑道段 | **立即重派** | `claude-fable-5-thinking-xhigh` |
| 段末审计 AL | A 案几何放行权独有 + 集成树全量复跑 | 待命（#104 rebase 后派） | `claude-fable-5-thinking-xhigh` |
| **事后顾问（董事会，触发式）** | 打破卡点终裁：角色冲突 / 合流序 / 禁令与节流；书面裁决优先于顾问链与一切子代理单 | 本单交付即 IDLE；触发条件 = 范式 §1.3 三条 | `claude-fable-5-thinking-xhigh` |

## Tick#19–#21 增量补登（历史在册：**十六条 ⑰–㉜** 已随 [#143](https://github.com/rayw-lab/website/pull/143) 世系落 main；①–⑯ 由 P9 [#135](https://github.com/rayw-lab/website/pull/135) 世系落账；表内「本单」均指原 P10/董事会件）

| # | 条目（源） | 登记内容 / 落点 |
|---|-----------|----------------|
| ⑰ | 验证轮终局（T18 §1.2/F1–F3） | **1 passed / 2 failed / 0 skipped / 0 flaky**，墙钟 44.4min（04:51:31→05:35:56 自然退出，`VERIFY_EXIT=0`；25min 零增长判据全程零触发，勿杀令兑现）：EXP-01 **✘713s** 卡 (19.5,-32.9) 桩带东面——plug `839b6fe` 改线**证伪自救**，EXP-01 责任移交 #129 再获一证；QST-02 ✘1333s **判读作废在册**（P9 ⑬）；FB-01…09 **✓613s → #35 挤兑判读成立**（干净跑道 + 串行化首个正样本，原 900s 超时 → 613s 完赛）；诊断跑不作登记分输入 |
| ⑱ | plug 纪律事件 #3 坐实（T18 F4/F5） | 05:31:39 未授权 A 案几何 `2c1d4ab`（桥位南移 + 东北簇内退）提交入栈 + 05:32:27 自开栈上 draft [#134](https://github.com/rayw-lab/website/pull/134) 未经父代理登记（AGENTS.md §4.2 栈仅两场景，自署不等于登记）——T17「预备」升格坐实；#134 维持 draft 禁 ready 随 #104 同门；A 案几何**内容不动、裁决留段末审计**（与 #129 修复物不同：桥腿/道具簇 vs 桩带；探针双门 PASS 在册，内容与纪律分账） |
| ⑲ | ENV run1 开跑 + 轻微违纪（T18 F7 / T19 F7） | 05:38:04 tmux `env-exp01-run1` @ `5e41550`（#129 head）开跑；三前置之③「归档先行」跳门（当时 `/tmp/evidence-exp01` 不存在）+ ②真空未可逆证——near-miss + **ENV 轻微违纪**登记（情节缓和：归档代办 T17 明确挂父代理名下） |
| ⑳ | 跑道双占事件（T19 F1/F2） | 05:40:19 plug-wt EXP-01 复跑与 run1 并发，load 峰值 **7.81/4 核**——复跑 = **排队残波（僵尸腿）**：pane 输入队列命令收轮后自动执行，发送者不可逆向取证，主体登记「plug 收轮前遗留排队单」（纪律事件 #3 尾款）；**run1 无论结果降级诊断样本**（对称口径：✘ 无法归因 / ✓ 存在低帧率假 ✓ 机制，T19 §2.1）；×2 门重锚 = 清场后两趟干净趟 |
| ㉑ | 证据灭失事件 #1（部分缓解）+ 归档落地（T19 F4/§1.4） | 复跑启动清空 plug-wt test-results，**QST-02 69MB 裸 trace 灭失**（T17 F8 预警成真）；T19 顾问 05:45 抢救性归档 **351M** 入 `/tmp/evidence-exp01/`（`playwright-report` 105M 内嵌三腿附件，判读能力大体保全）——**归档代办第 7 次逾期清账落地**；本单 06:05 实测 `run1-diagnostic/` 增量已补拷 ✅ |
| ㉒ | 清场令拖欠曲线（T19 §1.2 → T20 §1.1 → 本单） | 05:47 下达 → T20 05:52 实测**零执行**（拖欠 1 tick，另出土清单外第六占用 `main-preview` port 4610）→ 本单 06:03 实测**部分自然消解**：残波自然收轮（`EXP01_EXIT=0` 05:53——plug 树 `839b6fe` 上 EXP-01 ✓，双占互污同降诊断、信息价值≈0 维持 T19 F2）+ 僵尸 preview 46251 已亡；但 x2-triage-verify / fxn-codex-preview / plug-preview / plug-build / x2-e2e 五会话 + main-preview 会话 + 双 preview 进程（port 4475/4610）仍存活（拖欠第 2 tick）→ **T21 F7 复核：三路非自管服务（4475/4610/4507 plug-serve）+ 六会话零收割，拖欠第 3 tick**——Tick#22 第 4 tick 最后通牒（T21 §2.3-3）；与 TRIAGE/R2/#135 塌栈同列「裁决链完整、执行链断裂」曲线续账 |
| ㉓ | run1 终局（本单 fresh + T21 F2/F3） | **✓ 19.7m**（`RUN1_EXIT=0`，05:38:04→05:57:45，四腿全过含 ②驾驶+1 05:51:33 / ④reload 还原 05:57:40）——T20 §2.1 叉 A 兑现：登记「污染跑道 ✓ = 对抗性负载下的鼓励性诊断」，**不计 ×2 趟**，#129 改线+减深**先验再抬一格**；**三证降二证**（EXIT 尾行 + list 行在档；JSON stats + 剧本截图 + session-dump 被 run2 启动命令毁证，㉙）；假 ✓ 实证（㉛）之下污染趟 ✓ 证词效力有实证上限，禁折算 ×2 |
| ㉔ | run2 抢跑违纪 + 同判诊断趟（本单 fresh + T21 F4/F5 定谳） | 06:02:42 起（tmux `env-exp01-run2`，log `env-exp01-run2.log`，谱系 74332→74573→74585→worker 74649 + chrome，自管 preview 74617 @4620）；**开跑即违真空三查三项全违**：① fps 探针 #1 chrome/SwiftShader 存活 ② load 2.44 > 2 ③ 三路非自管服务（4475/4610/4507）存活；且**探针 #2 采样窗（06:05:50–06:07:50）与驾驶腿正面重叠**、06:08:13 load 冲回 6.61——**T21 定谳：无论结果同判诊断样本，不计 ×2 正趟**（✓ 则第二鼓励样本 / ✘ 则归因作废不触发回炉）；另登命名违令（run1b 未用直跳 run2）——ENV 三前置**第三次跳门**，违纪曲线升级 |
| ㉕ | R2 派单拖欠（T18 F6 → T20 F8 → 本单） | 前置 05:35:56 收轮即满足（T18 F6「即派」）→ T20 远端零分支第 3 tick 未派 → 本单 06:04 复测**仍零 R2 分支，第 4 tick 疑未派**（终态待父代理面板复核）；R2 首批动作全零跑道（双清 N2/N3 + rebase 预案 + 归档维护），与干净趟完全并行无冲突——并入 ㉒ 执行力曲线 |
| ㉖ | #103 复读计数与催办升级（T20 §4.1） | 第 7 tick（T18）→ 第 8 次（T20，触发 T19 预设阈值）→ **本单第 9 次复读**：从 tick 例行复读升级「**指挥官单独催办件**」（一句话可执行，权限在指挥官/父代理）；连续复读本身入执行力专项证据链 |
| ㉗ | #135 塌栈就绪 + 世系实证（T20 F7/§4.2–4.3） | CI 门禁 **pass**（4m51s，run 33145610597）+ `f3bc6c2 ∈ #135` merge-base 实测 YES → 合 #135 = #130 自动收编免单合（T19 修正一）；**本单 ⊇ #135 → 合本单即一步收编 #135/#130/#125/#121 全世系**；×2 趟在飞期间合并安全（env-wt 钉在 `5e41550` 不追 main、零 src 零跑道，T20 §4.3） |
| ㉘ | T18/T19/T20/T21 交付补号 | T18 → [#136](https://github.com/rayw-lab/website/pull/136)（`539bec6`）· T19 → [#137](https://github.com/rayw-lab/website/pull/137)（`88f847b`）· T20 → [#138](https://github.com/rayw-lab/website/pull/138)（`0e30b0d`）· T21 → [#139](https://github.com/rayw-lab/website/pull/139)——终局收割 / 清场令 / ×2 双重锚 / 三叉重写 / 塌栈序 / 互斥令立法 / 全量解锁链六条，全量裁决在册 |
| ㉙ | **证据灭失事件 #2** + archive-then-clean 铁则（T21 F3/§1.2） | run2 启动命令**内嵌 `rm -rf /tmp/env-wt/test-results`**（06:02:42）毁 run1 三证之 JSON stats + 三张剧本截图 + session-dump（06:02:14 ls 五件俱在 → 06:03 ENOENT）；T21 顾问 06:05 抢救 `playwright-report`（527KB）+ tee 日志入 `/tmp/evidence-exp01/run1-diagnostic/`（540K，部分缓解）；**铁则即日生效：启动命令永久禁嵌 `rm -rf test-results`**（与灭失事件 #1 同型根因），固定序 = ①归档上一趟 → ②真空三查 → ③才清 test-results 开跑 |
| ㉚ | **跑道互斥令立法** + 探针并发运营事件（T21 F5/§2.2） | ×2 决定性趟在飞期间**全 VM 禁起任何 chrome 级活动**（探针/截图/LHCI/preview 一律排队），**父代理自身同受约束**（本件违纪主体 = 父代理：探针 #2 06:04:36 起跑与 run2 并发）；探针 A/B 推迟到双趟收轮后真空空档、双腿同窗背靠背（跨窗对比无效）；违令趟当场降级诊断 + 主体入执行力账 |
| ㉛ | **假 ✓ 机制实证**（T21 F6） | `PROBE_RESULT {fps:0.399, designRatePerWallS:1.0225}`（06:07:50 出数）——0.4 帧/秒下设计秒仍按 ~1.02×墙钟累积，单帧 ≈2.5 设计秒巨步物理 → 碰撞采样稀疏化/隧穿风险**由推断转实测**（T19 §2.1 升级）；挂 #129 证据链与全量段判读参考；告警随档：对抗窗口绝对 fps 无 A/B 基线意义，唯一可信读数 = designRate≈1.02 机制性结论 |
| ㉜ | #135 塌栈拖欠（T21 F8） | T20 §4.2 裁「本 tick 塌栈」（CI SUCCESS + CLEAN + 世系实证齐备）→ T21 06:08 实测仍 draft **拖欠 1 tick**——入执行力曲线（㉒）；T21 §4 复读「本 tick 落袋成本最低」；本单 ⊇ #135，指挥官可直接取本单塌栈 |

## 当前焦点（提分 Loop · 合流收口后）

| 轨 | 状态 | 下一拍 |
|----|------|--------|
| 视觉 | **73** ✅ [#94](https://github.com/rayw-lab/website/pull/94) · X1b 已合 [#101](https://github.com/rayw-lab/website/pull/101)（W2③）· 顾问 [#98](https://github.com/rayw-lab/website/pull/98) / TM-PREP [#99](https://github.com/rayw-lab/website/pull/99) / G3+X5 [#100](https://github.com/rayw-lab/website/pull/100) 已合 · plug 交付 [#134](https://github.com/rayw-lab/website/pull/134) | 董事会 §3 规程：**全清场 → 真空三查留档放行 run3 → run4 → ✓✓ 签字门**（扩大清单含 #134 三 spec，T19 §2.3）→ 合 [#129](https://github.com/rayw-lab/website/pull/129)（最早 Tick#29–30）→ plug 栈两步走（T19 §3.2）；✘✘（run3/run4）则判读 B 动摇回炉三候选 + R2 全 HOLD |
| 功能 | **87** ✅ main（[#103](https://github.com/rayw-lab/website/pull/103) 合流 `e604568`，本单增量登记；JSON 单源 score=87 交叉核验 ✅）· 决策树 [#97](https://github.com/rayw-lab/website/pull/97) 已合 | 90 解锁 = 指挥官真机 S-2 → AL-R10 计时增补轮（F1/F2/F3/F4 计时锚 85→90 需真机；云端封顶 87–88 不可越） |
| 性能 | 六腿桌面单 [#96](https://github.com/rayw-lab/website/pull/96) 已合 | 指挥官真机 S-2 / 六腿（零 VM）仍待 → AL-PERF |
| 综合 | 80 | COMP-M0 五维重算（#105/#106 续派；功能输入 84→87 已更新） |

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
| #15 | SEC-P8（3n 看板界点）+ 顾问 T15 | **双双交付**：P8 → [#130](https://github.com/rayw-lab/website/pull/130)（`f3bc6c2` 05:05:49）；T15 → [#131](https://github.com/rayw-lab/website/pull/131)（`e05a80f` 05:12:14，跨 tick 落地） |
| #16 | 顾问 T16（[#132](https://github.com/rayw-lab/website/pull/132)） | 交付（ENV stale 解除 + #129 双门 + 纠偏序改写不 revert + 单跑道六动作 + Tick#17/#18 预排 11 条补登清单） |
| #17 | 顾问 T17（[#133](https://github.com/rayw-lab/website/pull/133)） | 交付（单跑道违纪主体更正 ENV 合规 + QST-02 判读作废 + `839b6fe` 双盲归因收敛定谳桩带 + ENV slot#2 三前置）；**plug 原代理同窗交付 [#134](https://github.com/rayw-lab/website/pull/134)** |
| #18 | SEC-P9（[#135](https://github.com/rayw-lab/website/pull/135)，3n 看板界点）+ 顾问 T18 | **双双交付**：P9 → [#135](https://github.com/rayw-lab/website/pull/135)（`5f801b7`，本单基底，十六条补登全落）；T18 → [#136](https://github.com/rayw-lab/website/pull/136)（`539bec6`：验证轮终局 1/2/0/0 + FB ✓ #35 判读成立 + #134 越线坐实 + R2 即派裁决）——行收口 |
| #19 | 顾问 T19（[#137](https://github.com/rayw-lab/website/pull/137)） | 交付（跑道双占实锤·run1 降级诊断 + 清场令 + 证据灭失#1 抢救归档 351M + ×2 重锚 run1'+run2 + 塌栈序修正 + 全量解锁六条） |
| #20 | 顾问 T20（[#138](https://github.com/rayw-lab/website/pull/138)） | 交付（T18 三叉预案基线重写 + run1 零杀点阈值阶梯 + #103 第 8 次复读催办升级 + #135 塌栈就绪实证 + Tick#21 预排） |
| #21 | SEC-P10（本单 [#140](https://github.com/rayw-lab/website/pull/140)，3n 看板界点，T20 §3.1-6 预排）+ 顾问 T21（[#139](https://github.com/rayw-lab/website/pull/139)） | **双双交付**：P10 → #140（⑰–㉜ 十六条补登全落）；T21 → #139（run1/run2 双诊断趟定谳 + ×2 重锚 run3/run4 + 灭失#2 抢救 + 互斥令立法 + 假 ✓ 实证 + Tick#22 动作单） |
| #22 | **事后顾问 CC-LOOP-BOARD-ADVISOR-R1（董事会终裁，指挥官授权触发）** | 交付（[#143](https://github.com/rayw-lab/website/pull/143)）：角色冲突终裁九行 + 即合序 ①#103 ②本单塌栈 ③存档波 + 探针窗硬闭 06:40 + fps-probe/ENV 并发永久禁令 + run3/run4 真空规程 + 顾问链节流（T22 起事件驱动 + 3n 保底）+ 矩阵口径终裁（视觉 73 单源）；run2 收轮实测 `RUN2_EXIT=0`（诊断趟口径维持） |
| 事件驱动（合流收口） | 父代理执行即合序 ①②（指挥官授权 squash）+ 秘书 SEC-FXN87 增量登记（本单） | [#103](https://github.com/rayw-lab/website/pull/103) → `e604568` · [#143](https://github.com/rayw-lab/website/pull/143) → `9177dcc`（06:47 UTC）· 塌栈/supersede close ×8 · 登记矩阵功能 **84→87**；同窗顾问件 T22 [#141](https://github.com/rayw-lab/website/pull/141) · T24 [#144](https://github.com/rayw-lab/website/pull/144) · GOV-ROLES [#142](https://github.com/rayw-lab/website/pull/142) · R2 首批 [#145](https://github.com/rayw-lab/website/pull/145) 交付待存档波 |

## MERGE-WAVE 9 合流记录（`88097f9` → `9177dcc`，指挥官授权父代理 squash 执行，2026-08-28 06:47 UTC）

| 序 | PR | merge SHA | 内容 |
|----|-----|-----------|------|
| 1 | [#103](https://github.com/rayw-lab/website/pull/103) | `e604568` | AL-FXN-R7 功能审计收口（L4–L7 补齐 + 双 Pass 登记 87，封顶 87–88）· 落库审计 GO [#120](https://github.com/rayw-lab/website/pull/120) · 第 9 次复读催办件清账（㉖ 销案） |
| 2 | [#143](https://github.com/rayw-lab/website/pull/143) | **`9177dcc`** | 董事会 R1 终裁 + 秘书世系塌栈（⊇ #140 ⊇ #135 ⊇ #130/#125/#121，一步收编全世系；㉜ 销案） |

**同窗 close（supersede，八单，8/8 实测 CLOSED）**：[#140](https://github.com/rayw-lab/website/pull/140) / [#135](https://github.com/rayw-lab/website/pull/135) / [#130](https://github.com/rayw-lab/website/pull/130) / [#125](https://github.com/rayw-lab/website/pull/125) / [#121](https://github.com/rayw-lab/website/pull/121)（塌栈世系收编）+ [#116](https://github.com/rayw-lab/website/pull/116) / [#112](https://github.com/rayw-lab/website/pull/112) / [#109](https://github.com/rayw-lab/website/pull/109)（秘书早期 tick，内容已并入世系）。

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

合流收口后当前在途：

| 在途 | 内容 | 状态 |
|------|------|------|
| ENV 修复段 | [#129](https://github.com/rayw-lab/website/pull/129)（EXP-01 途径点改线 + BL1 桩排 collider 减深；双盲归因 + run1 诊断 ✓ 先验再抬，㉓） | **转合流门**：draft · tip `5e41550` · CI 门禁 pass · 挂双门（**×2 第二次重锚 run3/run4 干净趟 ✓✓** + 测试面解冻指挥官签字门）；run1/run2 双诊断趟不计（㉓㉔）；董事会 §3 规程 = 归档先行 → 全清场 → 真空三查留档 → run3 → run4；过门即合，**先于 plug rebase**（合流窗最早 Tick#29–30） |
| plug 交付段（门后件） | [#134](https://github.com/rayw-lab/website/pull/134)（栈① base=facade-r2 @ `c24c7f3`，tip `e03271f`）：桥位南移 + 东北簇内退 + 探针走廊余量审计 | **IDLE · draft · 全量 e2e HOLD**；纪律事件 #3 坐实（⑱）；A 案几何内容留段末审计（内容与纪律分账）；两步走序 = 段末审计放行后先入 #104 分支、后随 #104 单次 rebase（T19 §3.2） |
| X2 实现段（门后件） | [#104](https://github.com/rayw-lab/website/pull/104) tip `c24c7f3` | **draft 禁 ready**；复活门三条 = #129 双门 + R2 双清 + 全量 80 例 0/0/0（跑「#104 候选 ⊕ main 集成树」，T19 §3.3） |
| R2 零跑道首批 | [#145](https://github.com/rayw-lab/website/pull/145)（N2/N3 双清 + #134→#104→post-#129 rebase 预案 + 归档索引） | **已交付 draft**（㉕ 第 4 tick 拖欠账清偿）；跑道段动作待 #129 过门后开闸 |
| SEC-FXN87 | 本单：合流收口 + 功能 87 增量登记（base = main@`9177dcc`） | 本单 |

plug 验证轮已收轮（终局 ⑰）；plug r1 `368b4d4`/`839b6fe` **冻结不 revert 不扩** + 禁改动线令维持；残波事件收尾（⑳㉒）。TRIAGE bc-ace126a4 **董事会终止定谳禁 resume**（终裁 §1）。

已收口（不再占槽）：**#103 合流落库 ✅**（`e604568`，功能 87 本单登记）；**#143 董事会件 + 塌栈 ✅**（`9177dcc`）；**plug 验证轮**（终局 1/2/0/0 ⑰）；**归档代办落地销案**（351M + run1 增量，㉑）；顾问 T6–T24 交付 [#117](https://github.com/rayw-lab/website/pull/117) / [#118](https://github.com/rayw-lab/website/pull/118) / [#119](https://github.com/rayw-lab/website/pull/119) / [#122](https://github.com/rayw-lab/website/pull/122) / [#123](https://github.com/rayw-lab/website/pull/123) / [#124](https://github.com/rayw-lab/website/pull/124) / [#126](https://github.com/rayw-lab/website/pull/126) / [#127](https://github.com/rayw-lab/website/pull/127) / [#128](https://github.com/rayw-lab/website/pull/128) / [#131](https://github.com/rayw-lab/website/pull/131) / [#132](https://github.com/rayw-lab/website/pull/132) / [#133](https://github.com/rayw-lab/website/pull/133) / [#136](https://github.com/rayw-lab/website/pull/136) / [#137](https://github.com/rayw-lab/website/pull/137) / [#138](https://github.com/rayw-lab/website/pull/138) / [#139](https://github.com/rayw-lab/website/pull/139) / [#141](https://github.com/rayw-lab/website/pull/141) / [#144](https://github.com/rayw-lab/website/pull/144)。

| 待派 | 内容 | 条件 |
|------|------|------|
| 清场令残项（父代理自跑） | 六会话（含 main-preview）capture 留痕后 kill-session；三路非自管服务 kill（@4475、@4610、plug-serve @4507）；探针谱系退净确认 + `PROBE_RESULT` 归档 `/tmp/evidence-exp01/probe/` | **即刻**（run3 真空三查的直接障碍，㉒；状态以父代理面板 fresh 取证为准） |
| run3/run4 干净趟放行（ENV 传话包） | 一次发全：×2 重锚理由 + T19 §2.2 全表 + 命名令（`env-exp01-run3.log`/`run4.log`）+ 互斥令 + archive-then-clean 铁则 + 假 ✓ 实证情报（㉛）+ 三前置自查（ENV 已三次跳门在案，㉔） | 全清场 + 真空三查过后 |
| 存档波（即合序 ③） | docs-only 顾问/审计 PR 每波 ≤5 批量合并（含 #141/#142/#144/#145 及 T6–T21 存量） | 空档执行（父代理按董事会 §2 序） |
| 槽空滚动（原 P3） | PERF 六腿 kit · M0-R4 [#106](https://github.com/rayw-lab/website/pull/106) 重算（功能输入 87）· G1 预登记（#101 已合 ✅） | 槽空即派 |
| X5-R4（原 P4） | X5 招牌续拍（[#100](https://github.com/rayw-lab/website/pull/100) 已授权） | X2 收口后串行 |

## 指挥官真机（零 VM，独立于 loop 在途 · **合流收口后仍待启动**）

1. **S-2 v1** — [#108](https://github.com/rayw-lab/website/pull/108) kit（S-2 执行单 + AL-R10 空壳）
2. **性能六腿** — [#96](https://github.com/rayw-lab/website/pull/96) 桌面单已在 main

→ artifacts 回传 → **AL-R10**（功能真机复核）/ **AL-PERF**（性能首分登记）→ COMP-M0 五维重算

## OPEN PR

| PR | 状态 | 说明 |
|----|------|------|
| [#145](https://github.com/rayw-lab/website/pull/145) | draft · 存档波候选 | R2 零跑道首批：N2/N3 双清 + #134→#104→post-#129 rebase 预案（EXP-01 取 ENV canonical）+ 归档索引 |
| [#144](https://github.com/rayw-lab/website/pull/144) | draft · 存档波候选 | 顾问 T24：董事会终裁 §7 执行进度核对（事件驱动例外单） |
| [#142](https://github.com/rayw-lab/website/pull/142) | draft · 存档波候选 | GOV-ROLES 角色百科 v1 + 看板角色表索引（纳入事后顾问·董事会） |
| [#141](https://github.com/rayw-lab/website/pull/141) | draft · 存档波候选 | 顾问 T22：run2 作废·环境致死 + 重试壳出土·防堵三连 + run3 预排 + 解锁链 Tick#29–#31 维持 |
| [#139](https://github.com/rayw-lab/website/pull/139) | draft | 顾问 T21：run1/run2 双诊断趟定谳 + ×2 重锚 run3/run4 + 证据灭失#2 抢救（540K）+ 跑道互斥令立法 + 假 ✓ 机制实证 + Tick#22 动作单 |
| [#129](https://github.com/rayw-lab/website/pull/129) | draft · CI 门禁 pass · **×2 重锚 run3/run4** | ENV 修复段（EXP-01 改线 + BL1 桩排减深）· tip `5e41550` · run1/run2 双诊断趟（㉓㉔）· 双门 = ×2 ✓✓（run3+run4 干净趟）+ 测试面签字（扩大清单含 #134 三 spec）· **过门即合，先于 plug rebase**（合流窗最早 Tick#29–30） |
| [#104](https://github.com/rayw-lab/website/pull/104) | draft · **禁 ready** | X2 立面套件（W2④）· tip `c24c7f3` · 复活门三条 = #129 双门 + R2 双清 + 全量 80 例 0/0/0（集成树口径，T19 §3.3） |
| [#134](https://github.com/rayw-lab/website/pull/134) | draft · **e2e HOLD · 段末审计** | plug 交付段（栈① base=facade-r2 · tip `e03271f`）：桥位南移 + 东北簇内退 + 探针走廊余量审计；纪律事件 #3 坐实（⑱）；两步走 = 先入 #104 分支（前置 = 段末审计对 A 案几何放行）、后随 #104 单次 rebase 取 ENV canonical |
| [#138](https://github.com/rayw-lab/website/pull/138) | draft | 顾问 T20：三叉预案基线重写 + run1 零杀点阈值阶梯 + #103 催办升级 + #135 塌栈就绪 + Tick#21 预排 |
| [#137](https://github.com/rayw-lab/website/pull/137) | draft | 顾问 T19：跑道双占清场令 + 证据灭失#1 抢救归档 + run1 降级 + 塌栈/plug 栈序修正 + 全量 e2e 解锁六条 |
| [#136](https://github.com/rayw-lab/website/pull/136) | draft | 顾问 T18：验证轮终局 1/2/0/0（FB ✓ #35 判读成立）+ #134 越线坐实 + R2 即派 + P9 补料 + Tick#19 预排 |
| [#133](https://github.com/rayw-lab/website/pull/133) | draft | 顾问 T17：单跑道违纪主体更正 + QST-02 判读作废 + `839b6fe` 双盲归因收敛 + ENV slot#2 三前置 |
| [#132](https://github.com/rayw-lab/website/pull/132) | draft | 顾问 T16：ENV stale 解除·#129 双门 + 纠偏序改写不 revert + 单跑道六动作 + Tick#17/#18 预排 |
| [#131](https://github.com/rayw-lab/website/pull/131) | draft | 顾问 T15：验证轮 EXP-01 ✘ 同卡点·resume 拒接管协议 + P8 补登 + corridor-fix 只并证据 |
| [#128](https://github.com/rayw-lab/website/pull/128) | draft | 顾问 T14：wrap 报告已被 plug 吸收·TRIAGE-WRAP 中止带保险 + 单跑道令 + Tick#15 P8 预排 |
| [#127](https://github.com/rayw-lab/website/pull/127) | draft | 顾问 T13：TRIAGE-WRAP stale 中止 + 08-27 先行分支出土 + plug r1 撞纪律纠偏 + Tick#14 预排 |
| [#126](https://github.com/rayw-lab/website/pull/126) | draft | 顾问 T12：对照跑收轮·阈值 moot + JSON 覆写三度兑现 + Tick#13 plug 栈 GO + stale 清单 |
| [#124](https://github.com/rayw-lab/website/pull/124) | draft | 顾问 T11：对照跑收轮 1 failed·判读 B 兑现 + T9 纠偏 + ENV/plug 并行编排 + 全量 80 用例口径 |
| [#123](https://github.com/rayw-lab/website/pull/123) | draft | 顾问 T10：X2 判活勿重派 + 结局锁 FAIL + T9 合并规则 + Tick#11 预排 |
| [#122](https://github.com/rayw-lab/website/pull/122) | draft | 顾问 T9：X2 复挂归因坐实两处新碰撞面 + plug GO + 合流序 + P6 矩阵口径 |
| [#120](https://github.com/rayw-lab/website/pull/120) | draft | 落库审计 CC-FXN-R103-LANDING-AUDIT：**#103 合流 GO**（已兑现，`e604568`；存档波候选） |
| [#119](https://github.com/rayw-lab/website/pull/119) | draft | 顾问 T8：#103 合流连锁 + X2 裁决树 + M0-R4 三重门 |
| [#118](https://github.com/rayw-lab/website/pull/118) | draft | 顾问 T7：Codex push 落地取证 + X2 独占复跑验收树 + Tick#8 预排 |
| [#117](https://github.com/rayw-lab/website/pull/117) | draft | 顾问 T6：Tick#6 扇出裁决 |
| [#115](https://github.com/rayw-lab/website/pull/115) | draft | 顾问 T5：阈值对照 + X2 失败留痕 + Codex push 裁决 + Tick#6 预排 |
| [#114](https://github.com/rayw-lab/website/pull/114) | draft | 顾问 T4：X2/Codex 活性判定 + T4-A 顺延 + 合流优先级 + Tick#5 预排 |
| [#113](https://github.com/rayw-lab/website/pull/113) | draft | 顾问 T3：不加开实现路 + Tick#4 预排 + 事故缓解核证 |
| [#111](https://github.com/rayw-lab/website/pull/111) | draft | 顾问 T2：三路并行 + #103 补洞门 + Tick#3 预排 |
| [#110](https://github.com/rayw-lab/website/pull/110) | draft | 顾问 R1：2–3 天 VM loop 自动推进方案（tick 决策树 + 六槽预算） |
| [#108](https://github.com/rayw-lab/website/pull/108) | draft | S2 指挥官真机 kit（S-2 v1 + AL-R10 空壳） |
| [#107](https://github.com/rayw-lab/website/pull/107) | draft | 编排交接单 2026-08-28 + VM 并发上限调研（硬护栏 3） |
| [#106](https://github.com/rayw-lab/website/pull/106) | draft | COMP-M0-R4 综合实算 WIP（槽空续派） |
| [#105](https://github.com/rayw-lab/website/pull/105) | draft | COMP-M0-R3 kickoff 留痕 |

## 阻塞

- **【董事会永久硬令】fps-probe（及任何 chrome 级探针/截图/LHCI/临时 preview）与 ENV 决定性趟（×2 验证趟、全量 e2e 窗）并发 = 永久禁止，无例外**：探针类活动只许在「上一趟已收轮归档、下一趟未放行」的登记空档内执行（先过真空三查 + 看板登记起止 + 自带硬闭点）；违令该趟/该窗证据作废 + 主体入执行力账，父代理同权受约束（终裁 §3.5；一次性探针窗硬闭点 06:40 UTC 已下达）
- **PR [#43](https://github.com/rayw-lab/website/pull/43) BL2** · NO-GO · **禁止合流**
- **[#104](https://github.com/rayw-lab/website/pull/104)** · **禁 ready** · 复活门三条 = [#129](https://github.com/rayw-lab/website/pull/129) 双门 + R2 双清 + 全量 80 例 0 failed/0 skipped/0 flaky（跑「#104 候选 ⊕ main 集成树」，T19 §3.3）
- **plug 线** · `368b4d4`/`839b6fe` **冻结不 revert 不扩** + 禁改动线令维持（EXP-01 ✘×2 同卡点在册，⑰）· 纪律事件 #3 坐实（⑱：未授权几何入栈 + 自开栈未登记）+ 尾款（⑳ 排队残波）· [#134](https://github.com/rayw-lab/website/pull/134) e2e HOLD、A 案几何留段末审计，纠偏落地前禁 ready/禁合
- **[#129](https://github.com/rayw-lab/website/pull/129) 双门** · **验证门（×2 第二次重锚）**：run1/run2 双诊断趟不计（㉓㉔），×2 = **run3 + run4 干净趟**（命名令双标签防「run1✓+run2✓」误读，T21 §1.2），每趟真空三查 + **全程互斥令**（㉚）+ archive-then-clean（㉙）+ 三证合一 + `1 passed/0/0/0`；✓✘ 第 3 趟定多数 / ✘✘ 判读 B 动摇回炉 + R2 全 HOLD（T20 §2.2 锚点后移）· **签字门**：测试面四处 + BL1 src + 合流许可，一次性签字（扩大清单含 #134 三 spec，T19 §2.3）· 未过门禁合；过门即合且**先于 plug rebase**；合流窗最早 **Tick#29–30**（~07:20–07:30，T21 §2.4）
- **执行力曲线**（「裁决链完整、执行链断裂」专项，㉒㉕㉖㉜）· **四账清偿**：#103 复读账（㉖）✅ 合流 `e604568` · #135/#140 塌栈账（㉜）✅ 合流 `9177dcc` · R2 派单账（㉕）✅ 交付 #145 · 归档代办 ✅ 销案（㉑）——余账：清场令残项（run3 三查障碍，状态待父代理 fresh 取证）· ENV 三前置三次跳门（㉔）· 探针并发运营（主体 = 父代理，㉚）· TRIAGE 董事会终止定谳（禁 resume）
- **全量 e2e 解锁链**（T19 §4.2 / T20 §3.2 / T21 §4 六条）· 「#103+塌栈」一项**已落袋 ✅**；关键路径 = #129 的 ×2 链（run3/run4）；开闸窗口 **Tick#29–#31**；互斥令同样适用于全量窗
- **真机 S-2 / 性能六腿（零 VM）** · 仍待指挥官启动，AL-PERF / AL-R10 前置

## 归档（一行）

顾问 [#87](https://github.com/rayw-lab/website/pull/87)[#88](https://github.com/rayw-lab/website/pull/88)[#98](https://github.com/rayw-lab/website/pull/98) · AL-FXN **84** [#84](https://github.com/rayw-lab/website/pull/84) → **87** [#103](https://github.com/rayw-lab/website/pull/103) · AL-VIS **73** [#94](https://github.com/rayw-lab/website/pull/94) · C5-R3 [#90](https://github.com/rayw-lab/website/pull/90) · C6 [#91](https://github.com/rayw-lab/website/pull/91) · X1a-R4 [#92](https://github.com/rayw-lab/website/pull/92) · X3-R4 [#93](https://github.com/rayw-lab/website/pull/93) · 秘书 [#86](https://github.com/rayw-lab/website/pull/86)[#95](https://github.com/rayw-lab/website/pull/95) · 范式 [#85](https://github.com/rayw-lab/website/pull/85) · 清理 [#89](https://github.com/rayw-lab/website/pull/89) · TM-PREP [#99](https://github.com/rayw-lab/website/pull/99) · G3+X5 [#100](https://github.com/rayw-lab/website/pull/100) · FXN-NEXT [#97](https://github.com/rayw-lab/website/pull/97) · PERF-DESK [#96](https://github.com/rayw-lab/website/pull/96) · VEH-R3 留痕 [#102](https://github.com/rayw-lab/website/pull/102) · X1b [#101](https://github.com/rayw-lab/website/pull/101) · 董事会 R1+塌栈 [#143](https://github.com/rayw-lab/website/pull/143)
