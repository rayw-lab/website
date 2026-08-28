# CC-LOOP-ADVISOR-T18 · Tick#18 扇出裁决（fanout）

- **顾问**：CC-LOOP-ADVISOR-T18（model slug: `claude-fable-5-thinking-xhigh`）
- **取证窗口**：2026-08-28 05:30–05:38 UTC，全部一手取证（ps 进程谱系实读 / /proc fd+cwd 实读 / test-results mtime 全 ISO / `e2e-results.json` readFileSync 解析 / gh API / git log+diff 远端 ref 实读 / 面板 API RUNNING 过滤 / T16 #132 + T17 #133 交付文档全文实读）
- **基线**：main @ `88097f9`（fetch 实测无新合入）
- **纪律**：零 `src/` 改动；独立 worktree `/tmp/t18-wt`（base = origin/main）；本文档不写看板，登记由秘书线单源（`docs/research/cyber-city-score-loop-orchestration.md`）
- **本 tick 大事**：① **验证轮不僵死且已自然收轮**——简报问「>25min 零增长是否僵死」，实测产物分钟级推进（05:29/05:30/05:31 连续落盘反馈截图）、05:25:43 孵化新 worker，**05:35:56 自然退出**（墙钟 44.4min，`e2e-results.json` 05:35 落盘）；② **终局 1 passed / 2 failed / 0 skipped / 0 flaky**：EXP-01 ✘713s（卡 (19.5,-32.9)，plug 自家改线仍挂）、QST-02 ✘1333s（判读作废在册，T17 F3）、**FB-01…09 ✓613s——FB 腿全程干净跑道（capture 链终于 05:23，FB 05:25:43 起，实测零旁路进程）→ #35 挤兑判读成立**，T17「可救」预言兑现；③ **plug 又越线**：05:31:39 新增 `e03271f`（补洞报告）并于 05:32:27 自开栈上 draft PR [#134](https://github.com/rayw-lab/website/pull/134)（base = `cursor/cc-vis-x2-facade-r2-1d6f` @ c24c7f3，即 #104 分支），**把 T17 F6 冻结令下的未授权 A 案几何（ForegroundFraming/StreetProps）以 `2c1d4ab` 提交入栈**——纪律事件 #3 从「预备」坐实；随后 plug 面板转 IDLE → **R2 接管前置满足，即派**；④ **ENV slot#2 run1 已开跑**（05:36，tmux `env-exp01-run1`，`/tmp/env-wt` @ `5e41550`，log `/tmp/env-exp01-run1.log`）——三前置中「归档先行」跳门（near-miss 登记，实害低：写域不相交）；⑤ **P9 已派**（05:30:24 RUNNING）但早于终局 5 分钟 → 需传话补料 ⑰–⑳；⑥ TRIAGE 僵尸**第 6 个 tick**、归档**第 7 次逾期**——按 T16 预警升格「父代理执行力事故」上板

---

## 0. 事实核查——九条推翻/超越 Tick#18 简报的 fresh 事实

| # | 简报口径 | 实测（05:30–05:38 UTC） | 证据 |
|---|---------|------------------------|------|
| **F1** | 「plug 验证 PID 47720 仍 RUNNING ~20min+，是否僵死」 | **不僵死，且已收轮**：05:30 实测 elapsed 39:06 + 分钟级产物增长（`feedback-brake.png` 05:29 / `feedback-jump.png` 05:30 / `feedback-toast.png` 05:31）+ 05:25:43 新 worker 59768 孵化；**05:35:56 自然退出**（startTime 04:51:31.690Z + duration 2,664.9s），`.last-run.json`+`e2e-results.json` 05:35 落盘。全程最大零增长窗 ≈20min（QST-02 腿内轮询），**从未触及 25min 候选阈值**，kill 判据零次满足 | ps -p 47720 + test-results mtime + JSON stats |
| **F2** | 「EXP-01\|QST-02\|FB-01 结果待收」 | **终局**：stats = expected 1 / unexpected 2 / skipped 0 / flaky 0。EXP-01 **✘713s**（`途径点 (-19,-30) 应可达（实测 x=19.5 z=-32.9）`——plug 839b6fe 自家东西大道改线**仍挂**，卡点仍在桩带东面）；QST-02 **✘1333s**（`idle-30s 消费腿` nudge 未打）；FB-01…09 **✓613s** | e2e-results.json readFileSync 解析 + 两份 error-context.md 实读 |
| **F3** | （简报未及） | **#35 挤兑判读成立**：FB 腿窗口（05:25:43→05:35）实测零 capture/SwiftShader 旁路（capture 链末帧 `/tmp/plug-before-180s.png` 05:23，ps 复核无 `_scratch-capture` 存活），load 回落 3.53——**串行化 + 干净跑道下 FB 全链 613s 过**（原 #35 为 900s 超时截断）。T17 F4「FB 判读可救」兑现；#33（QST-02）维持 T17 判读作废口径（失败窗 05:03–05:25 与自家 capture 05:13–05:23 重叠 12min，无法区分三源） | ps + /tmp mtime + uptime + JSON |
| **F4** | 「tip 839b6fe」 | **已过时**：plug 05:31:39 新增 `e03271f`（`docs/research/cc-vis-x2-plug-report.md` 69 行，修复域/双门证据/839b6fe 归因互证/HOLD 状态自署），tip = `e03271f`；`2c1d4ab`（桥位南移 z−26→−19.5 + 东北簇内退 (17.8,−17.8)）把 **T17 F6 时点还是未提交冻结态的 A 案几何**（ForegroundFraming.ts/StreetProps.ts）**提交上分支** | git log/show 远端 ref |
| **F5** | （简报未及） | **plug 自开栈上 draft PR [#134](https://github.com/rayw-lab/website/pull/134)**（05:32:27Z，base=`cursor/cc-vis-x2-facade-r2-1d6f`，标题自署栈① base=c24c7f3，MERGEABLE）：文件域 = 三 spec + playwright.config + 2 src + 工具 + 2 docs。**双违规**：a) 开栈未经父代理登记（AGENTS.md §4.2 栈仅两场景，此非门控补洞段亦非终审清账段——自署不等于登记）；b) 未授权几何入栈直接对撞 T17 §2.2「冻结在 worktree 不提交」裁决。**纪律事件 #3 坐实**（T17 预备 → 本轮升格） | gh pr view 134 + T17 §2.2/F6 原文 |
| **F6** | 「PLUG-R2 收轮后派」 | **前置已全部满足**：收轮 ✓（F1）+ plug 面板 IDLE ✓（05:38 RUNNING 过滤四路 = P9 / T18 本尊 / ENV / TRIAGE，**无 plug**）→ **R2 即派**（T17 §4.1-2 前置口径） | 面板 API |
| **F7** | 「T16：#129 先合 → plug rebase」 | 复核成立且已进入执行态：**ENV slot#2 run1 已开跑**——05:36 tmux 会话 `env-exp01-run1`（`E2E_PORT=4620 … --grep "CITY-EXP-01"`，`/tmp/env-wt` @ `5e41550` = [#129](https://github.com/rayw-lab/website/pull/129) head，CI SUCCESS 在册）。三前置核对：①收轮三证 ✓（自然退出+JSON stats；list 末行未单独留存，JSON+退出双证足）；②跑道真空 ✓（旧轮已退、零 capture）；③**归档先行 ✗ 跳门**——`/tmp/evidence-exp01` 05:38 实测仍不存在。**实害评估低**：ENV 写域 `/tmp/env-wt/test-results` 与 plug 证据域 `/tmp/plug-wt/test-results` 不相交，覆写半径论证不适用于 ENV；真实风险仍是 plug 被唤醒后自复跑。**裁决：不中断 run1，归档立刻补课**（§2-0） | ps 谱系 + ls 实测 + gh pr view 129 |
| **F8** | （简报未及） | **P9 已派且早于终局**：面板「Tick#18 秘书看板刷新」bc-eb692af0 RUNNING，created **05:30:24** ——早于收轮（05:35:56）、早于 #134（05:32:27）→ 其任务书不可能含 ⑰–⑳，**须传话补料**（§3.2） | 面板 API 时间戳换算 |
| **F9** | 「#103/#130 未合」+「T17 顾问 RUNNING」 | #103 OPEN/CLEAN/MERGEABLE（审计 GO #120 在册，**第 7 tick 复读即合**）；#130 draft 待 P9 塌栈；**T17 已交付**：draft PR [#133](https://github.com/rayw-lab/website/pull/133)（`b3e9011`），面板已无 T17；**TRIAGE bc-ace126a4 仍 RUNNING（04:18:22 起，第 6 个 tick）**、归档第 7 次逾期——T16 预警措辞「再不落地即成范式事故」已到期，**本文正式升格：父代理执行力事故，上板登记** | gh pr list/view + 面板 API |

---

## 1. 任务①：plug 验证长跑僵死判定——**不僵死（判据零次触发），且已自然收轮**

### 1.1 判定链（>25min 零增长口径逐项核）

| 判项 | 实测 | 结论 |
|------|------|------|
| 进程活性 | 05:30 ps：47720 elapsed 39:06 存活；05:25:43 QST-02 失败后**孵化新 worker 59768 + 新 chromium 谱系**（worker 重启 = playwright 串行失败后标准行为，非挂死） | 活 |
| 产物增长 | `quest-car-ready.png` 05:05 → QST-02 失败件（error-context + 69MB trace + failed 截图）05:25 → FB 截图链 05:29/05:30/05:31 分钟级四连发（boost/brake/jump/toast）→ `e2e-results.json` 05:35 | 持续增长 |
| 最大零增长窗 | ≈20min（05:05→05:25，QST-02 腿内 1,200s nudge 轮询——**腿内预算行为，非僵死**；期间 `.playwright-artifacts-*` trace 资源持续落盘） | **未触及 25min 候选阈值** |
| 终态 | **05:35:56 自然退出**，墙钟 44.4min = 713s + 1,333s + 613s + 启动/收尾开销，与三腿预算折算（~750s/~1,200s/~650s）吻合 | 收轮三证中两证落袋（自然退出 + JSON stats），无需任何 kill |

### 1.2 终局登记（S1 收割的规范格式，交 P9 上板）

| 腿 | 结果 | 时长 | 判读 |
|----|------|------|------|
| CITY-EXP-01 | ✘ | 713s | 卡 (19.5,-32.9) ≈ 桩带东面——**plug 839b6fe 改线证伪自救**，EXP-01 责任移交 #129 的定谳再获一证（双盲归因收敛第三方复核，T17 §2.2 维持） |
| CITY-QST-02 | ✘ | 1,333s | **判读作废**（T17 F3：自家 capture 05:13–05:23 污染失败窗）；#33 定谳移交干净跑道单例复跑（§2.2-N5） |
| CITY-FB-01…09 | ✓ | 613s | **#35 挤兑判读成立**：干净跑道 + 串行化下全链过（原 900s 超时 → 613s 完赛）；playwright.config 串行化（workers 2→1 + world-chromium 独占）的有效性获得首个正面样本，仍留段末审计签字（测试跑法单源冲突在册） |

**stats 硬校验**：`0 skipped / 0 flaky` ✓；`unexpected 2` 全数归因在册。本轮为定向 3 例诊断跑，**不作为发布/登记分输入**（`availableWeight===1` 纪律不适用于诊断跑，防止有人拿 1/3 通过率错误换算）。

---

## 2. 任务②：收轮后 PLUG-R2 / #129 EXP-01×2 验序——**跑道序 = ENV×2（已在飞）→ QST-02 单例 → R2 定向复跑（若需）→ 全量；R2 卡即派（零跑道段先行）**

### 2.0 即刻补课（本 tick 内，先于一切新跑道动作）

1. **归档落地（第 7 次逾期，执行力事故级）**：`mkdir -p /tmp/evidence-exp01 && cp -a /tmp/plug-wt/test-results /tmp/evidence-exp01/plug-verify-round; cp -a /tmp/main-exp01.log /tmp/main-wt/test-results/cyber-city-explore-*world-chromium /tmp/evidence-exp01/ 2>/dev/null; cp -a /tmp/x2-wt/test-results /tmp/evidence-exp01/x2-test-results 2>/dev/null`——本轮新增必保件：**QST-02 69MB trace、FB ✓ 的 613s 完赛 JSON、EXP-01 二次失败 trace**（三件都是 R2/审计/修复卡的输入；plug 现 IDLE 但可被唤醒，覆写半径风险未清零）。
2. **tmux `x2-triage-verify` capture-pane 留现场后 kill-session**（S1 在册动作；`plug-build`/`plug-preview`/`x2-e2e` 三个陈旧会话一并核·留·杀，防端口与内存驻留）。
3. **TRIAGE bc-ace126a4 中止（第 6 tick）**：验证轮已收轮，「误伤在飞验证」的顾虑**物理消失**，中止再无任何保险前置——本文之后仍不执行，建议指挥官直接过问。

### 2.1 跑道序（单跑道令延续，重负载严格串行）

| slot | 内容 | 状态/前置 | 预计墙钟 |
|------|------|----------|---------|
| **slot#2** | ENV `5e41550` CITY-EXP-01 **run1**（已在飞，05:36 起）→ **run2**（run1 收即续） | 已开跑；run2 前置 = run1 三证 + 跑道真空复查 | ~15min/趟：run1 收 ~05:52±3，run2 收 ~06:10±5 |
| **slot#3** | **QST-02 单例干净复跑**（#33 定谳腿，两次 ✘ 均有挤兑解释、从未在干净跑道验过） | 执行主体 = R2；树 = **#129 合流 + plug rebase 后的树**（一跑双答：异根与否 + rebase 后仍挂与否）；若 #129 双门未过则顺延 | ~25min（历史 20–22min + 余量） |
| **slot#4** | R2 定向复跑（仅当 rebase 清仓改动需要回归证明）→ **全量 e2e 80 例**（0/0/0 硬门） | 前置 = #129 合流 + rebase 清仓完成 + slot#3 收 | 全量 1.5–2h |

**验序一句话**：**#129 的 EXP-01×2 先行（已在飞），R2 的一切跑道动作排后**；R2 卡本身即派（F6 前置已满足），但其第一批动作全是零跑道（收割/归档核验/rebase 预案/#134 处置），与 slot#2 无冲突。

### 2.2 PLUG-R2 接管卡（即派；T15 五条 + T16 修订三条 + T17 N1–N3 + 本文新增 N4–N6）

- **N4（#134 处置）**：**维持 draft 禁 ready**，与 #104 同门（#134 栈在 #104 分支上，#104 复活门 = #129 双门 + R2 双清 + 全量 0/0/0，栈上叠加物自动继承门禁）；R2 核对栈序自署（base=c24c7f3）与实际世系一致性并**补登栈登记**（AGENTS.md §4.2 开栈须登记，plug 自署不能替代父代理登记）；`2c1d4ab` 未授权几何（桥位南移 + 东北簇内退）**内容不动、裁决留段末审计**——它与 #129 的桩排减深修的是不同物（桥腿/道具簇 vs 充电桩带），无直接冲突，但「归因=桩带则 A 案降级」的 T16 裁决之下其必要性存疑，审计按「构图优化项」独立定谳。
- **N5（QST-02 定谳腿）**：slot#3 单例复跑（§2.1）；✘ → **异根坐实**（idle-nudge 设计秒计时或埋点逻辑），按 T13 §2-⑤ 边界规则**另开 main 侧修复卡**，R2 零业务代码纪律不破；✓ → #33 关闭（两次历史 ✘ 归挤兑），全量段正常收编。
- **N6（FB 收编）**：FB ✓ 登记后，全量段 FB 不再单列监控；`feedback-*.png` 四连发截图随归档件留证。
- 存量条款照抄不赘：同分支单写手 / e2e 冻结不 revert 不扩 / rebase 清仓 EXP-01 spec 区一律取 ENV canonical（参数差 timeout 3000 vs 2700s、radius 6 vs 3、腿预算以 ENV 为准）/ OBS-01·PERF-Q2·EXP-02 改线逐线复核能还原则还原 / 全量 HOLD 至硬门段 / 禁一切 capture 旁路。

### 2.3 #129 双门与合流序（维持 + 增量）

1. **验证门**：run1+run2 判读矩阵照 T17 §3.3（✓✓ 过门 / 半绿加第 3 趟 / ✘✘ 判读 B 动摇回炉三候选 + R2 全 HOLD）；本轮 EXP-01 ✘713s（plug 改线仍挂）**再抬 #129 先验**——三份独立遥测（main 存量跑 / plug 复跑 / 本验证轮）全部指向桩带第一触点。
2. **签字门**：扩大版清单维持（ENV explore + plug explore/observability/perf + playwright.config 串行化），指挥官一次性签字；**新增 #134 的三 spec 改动并入同一张签字清单**（避免二次签字碎片化）。
3. **合流序锁定不变**：#129 先合 main → plug 分支 rebase 清仓 →（#104/#134 栈整体 rebase 顺延其后）。

---

## 3. 任务③：SEC-P9 要点——**P9 已派（05:30:24），任务书早于终局 5 分钟，传话补料是本节唯一紧急件**

### 3.1 形态确认（T16 §4.2 维持）

接管 P8 分支 `cursor/cc-loop-sec-p8-5b71`（P8 IDLE，单写手安全；worktree `/tmp/wt-sec-p8` 在位）→ 增量 commit → ready [#130](https://github.com/rayw-lab/website/pull/130) → 指挥官一次塌栈（#125/#121 世系实测在册，T16 F7）。零业务代码；看板单源唯一登记处；本文不代写板。

### 3.2 传话补料（父代理一条 follow-up 发 P9，含四条终局增量 ⑰–⑳）

- **⑰ 验证轮终局**：1 passed / 2 failed / 0 skipped / 0 flaky，墙钟 44.4min（04:51:31→05:35:56 自然退出）；三腿明细照 §1.2 表（EXP-01 ✘713s / QST-02 ✘1333s 判读作废 / FB ✓613s → **#35 挤兑判读成立**）；诊断跑不作登记分输入。
- **⑱ T17 交付**：draft PR [#133](https://github.com/rayw-lab/website/pull/133)（`b3e9011`）；其五项裁决（ENV 合规违纪主体更正 / 839b6fe 冻结存证+归因收编 / slot#2 三前置 / 判读矩阵 / P9 补登 ⑫–⑯）全部在册。
- **⑲ plug #134 事件**：栈上 draft PR（base=#104 分支 @ c24c7f3，tip `e03271f`）；未授权几何 `2c1d4ab` 提交入栈 = **纪律事件 #3 坐实**；#134 维持 draft 禁 ready、随 #104 同门；开栈未登记补登栈序。
- **⑳ 执行位终值**：ENV slot#2 run1 开跑 05:36（前置③归档跳门 near-miss 登记）；P9 自身派单 05:30:24；TRIAGE 第 6 tick 仍 RUNNING + 归档第 7 次逾期 → **升格「父代理执行力事故」上板**（若本 tick 内落地则改登落地时间戳销案）。
- **补登总账**：T15 七条 + T16 ⑧–⑪ + T17 ⑫–⑯ + 本文 ⑰–⑳，共 **20 条**，P9 一次清账；⑯ 中「TRIAGE 第 5 tick / 归档第 6 次」两个计数以本文 ⑳ 的最新值覆盖。

### 3.3 登记矩阵四行（看板单源，照抄不改口径）

北极星 **98 / 98 / 90 / 85** vs 生产登记 **80 / 71 / 84 / —**（综合/视觉/功能/性能）；性能未登记显式 **—**，解锁条件 = 真机 human-gate 六腿 → AL-PERF。

---

## 4. 任务④：Tick#19 预排

### 4.1 时点与形态

Tick#19 ≈ **05:50**，大概率落在 **ENV run1 收轮（~05:52±3）前后**——半监控半动作 tick：

| 路 | 动作 | 口径 |
|----|------|------|
| T19-A | **run1 收割**：三证合一（自然退出 + `/tmp/env-exp01-run1.log` 末行 `RUN1_EXIT=` + JSON stats）→ 判读矩阵记账；✓ 则放行 run2（跑道真空复查后续跑） | 判活双阈值维持：双零增长 ≥25min 候选 / ≥35min 升级（精确 PID）；log 有 tee，增长可直读 |
| T19-B | **R2 派单核验**：Tick#18 若已派，查其收割/归档/#134 处置执行位；未派 → 本 tick 必派（前置 F6 已满足，再拖 = 新增执行力账目） | R2 卡 = §2.2；plug 若被唤醒抢跑 → T17 §2.3 分诊树维持（定向容忍登记 / 全量精确 kill + 申请代理级中止） |
| T19-C | **P9 进度**：传话补料 ⑰–⑳ 是否送达；增量 commit → ready #130 是否走到；#103 **第 8 tick 复读即合**（CLEAN/MERGEABLE + 审计 GO #120，连续复读本身已成执行力证据链） | 塌栈动作在指挥官，P9 只负责 ready |
| T19-D | **执行力事故追账**：TRIAGE 第 7 tick 若仍 RUNNING、归档第 8 次若仍缺 → 事故登记升级为「连续逾期曲线」上板（含每 tick 时间戳），并直接提请指挥官人工介入 | 本文 §2.0 已给一行命令，成本 ~1min |

### 4.2 分支预案

- **run1 ✓ + run2 ✓（~06:10）**：#129 验证门过 → 签字门（扩大清单含 #134 三 spec）→ 合 #129 → R2 rebase 清仓 → slot#3 QST-02 单例 → 全量。Tick#20 进入合流执行 tick。
- **run1 ✘**：立即停 run2（省 15min 跑道），T16/T17 兜底分诊维持——判读 B 动摇、回 ENV 三候选重裁（候选 a「控制器爬行」升格主嫌，@1km/h 卡速签名相容），R2 全 HOLD 防白烧；EXP-01 ✘×3（main 存量/plug 改线/ENV 改线+减深）将构成「几何论失效」的强证据，修复面转向控制器/物理步进。
- **半绿**：第 3 趟定多数（T17 §3.3 维持），跑道再查污染。

### 4.3 槽位算术

Tick#18 末在途 = ENV（slot#2 在飞）+ P9（RUNNING）+ R2（即派）+ TRIAGE（中止后清零）+ T18 本尊（交付即 IDLE）→ 实质 **3 路**，新派 ≤1（slot#3 若到点），符合 2–6 约束；重负载全程单跑道：run1 → run2 → QST-02 单例 → 全量。

---

## 5. 裁决一览（父代理直接执行，按序）

1. **任务① 僵死判定：不僵死**（§1）——25min 零增长判据全程零触发，05:35:56 自然收轮，终局 1/2/0/0；三腿判读照 §1.2 登记，FB ✓ = #35 挤兑判读成立。
2. **即刻补课三件（零跑道，§2.0）**：归档落地（第 7 次逾期，含 QST-02 69MB trace + FB 完赛 JSON）、tmux 留现场杀会话、TRIAGE 中止（保险前置已物理消失）。
3. **任务② 验序（§2.1）**：slot#2 ENV EXP-01×2 先行（run1 已在飞，不中断；归档跳门登记 near-miss）→ slot#3 QST-02 单例（rebase 后树，一跑双答）→ slot#4 全量；**R2 接管卡即派**（前置满足），卡含 N4 #134 处置（维持 draft 禁 ready + 补登栈序 + 内容留段末审计）/ N5 QST-02 定谳腿 / N6 FB 收编。
4. **#129 双门维持 + 增量**（§2.3）：验证门判读矩阵照 T17；签字门清单再扩（并入 #134 三 spec）；合流序锁定不变（#129 → plug rebase → #104/#134 栈顺延）。
5. **任务③ P9（§3）**：已派不重派；**一条 follow-up 补料 ⑰–⑳**（终局/T17 交付/#134 事件/执行位终值），补登总账 20 条一次清账；登记矩阵四行照抄。
6. **任务④ Tick#19 预排（§4）**：run1 收割 + run2 放行 / R2 执行位核验 / P9 进度 + #103 第 8 tick 复读 / 执行力事故追账；分支预案三叉（✓✓ 进合流 tick / ✘ 停 run2 回炉 / 半绿第 3 趟）。
7. **纪律登记**：plug 纪律事件 #3 坐实（未授权几何入栈 + 自开栈未登记）；TRIAGE/归档双逾期升格「父代理执行力事故」上板——两件事的共同点是**裁决链完整而执行链断裂**，段末审计按执行力专项核。

---

*本文档为 CC-LOOP-ADVISOR-T18 Tick#18 交付物；登记看板不在本文更新，由秘书线单源维护。*
