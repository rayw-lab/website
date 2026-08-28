# CC-LOOP-ADVISOR-T14 · Tick#14 扇出裁决（fanout）

- **顾问**：CC-LOOP-ADVISOR-T14（model slug: `claude-fable-5-thinking-xhigh`）
- **取证窗口**：2026-08-28 04:50–04:58 UTC，全部一手取证（面板 API / gh API / ls-remote / worktree birth 时间戳 / ps + /proc environ / tmux capture-pane / 文件 mtime 全 ISO / uptime+nproc）
- **基线**：main @ `88097f9`（fetch 实测无新合入）
- **纪律**：零 `src/` 改动；独立 worktree `/tmp/t14-wt`（base = origin/main）；本文档不写看板，登记由秘书线单源（`docs/research/cyber-city-score-loop-orchestration.md`）
- **本 tick 大事**：① 简报首问被事实反转——**TRIAGE-WRAP 的 wrap 报告并未缺失**，已被 plug 段吸收为 plug 分支 commit `8507aa3`（04:47:46，早于 ~04:50 deadline），标题自署「CC-VIS-X2-TRIAGE-WRAP」；bc-ace126a4 本体则坐实僵尸，**中止 GO（带一道 2 分钟复核保险）**；② **plug 段高活性**：r1 三 commit 已推 + 04:51 起定向验证轮（EXP-01/QST-02/FB-01 串行）正在跑，首截图已落盘；③ **VM 算力单跑道坐实**：4 核 VM 上 SwiftShader 渲染单进程实测 337% CPU、load 3.64——**同一时刻只能跑一个 3D e2e**，ENV 专项的运行腿必须排队；④ ENV 专项出生 15min 零足迹，监控窗已开启（§2.2）

---

## 0. 事实核查——六条推翻/超越 Tick#14 简报的 fresh 事实

| # | 简报口径 | 实测（04:50–04:58 UTC） | 证据 |
|---|---------|------------------------|------|
| F1 | 「TRIAGE-WRAP 仍 RUNNING，wrap 报告可能缺失」 | **报告已存在且入库**：`docs/research/cc-vis-x2-e2e-triage-r1.md`（107 行，标题自署 CC-VIS-X2-TRIAGE-WRAP）已作为 `8507aa3`（04:47:46Z）落 plug 分支并随 tip `368b4d4` 推送远端——**早于 T12 §1.3-2 的 ~04:50 deadline**。内容完整：时间线重建、#32 真回归（桥腿几何解析证明）、#33/#35 挤兑 flake、3 潜伏雷、最小修复方案、§6 验证附录留待回填。**但交付者是 plug 代理（bc-686622df），非 TRIAGE-WRAP 本体**（归属定谳见 F2） | plug 分支 commit 实读 + ls-remote |
| F2 | （归属之问） | **plug-wt worktree birth = 04:43:36.17**，即 plug 代理出生（04:41:55Z）后 101s——新派代理首动作的典型签名；TRIAGE-WRAP（04:18:23 起）在其 e2e 腿 04:26 收轮后 **17 分钟内文件系统零动作**，若它是作者不会等到 04:43 才建工作树。报告 §4「还原登记」的 x2-wt 清理动作（index mtime 04:46:58）与 plug 三 commit（04:46:16 / 04:47:46 / 04:51:19）构成单一作者连续作业链。**归属判定：plug 代理吸收了 wrap 交付物**（与 T13 草稿 F8「plug r1 已推」同向） | `stat` birth 时间戳 + git log 时序 |
| F3 | （简报未及） | **归因陷阱登记：tmux environ 不可用于归因**。验证轮 pane 进程（PID 47720）environ 实读出 `CURSOR_CONVERSATION_ID=bc-0364bcc9`（= 原 X2 代理，02:50 起、已 IDLE）——这是 02:56 由它启动的 tmux server 的**环境快照继承**（此后所有新 session/pane 均携带），不是 04:51 驱动者的身份。跨代理共享 tmux server 时，pane env 归因必然误指 server 创建者 | /proc/47720/environ + tmux ls 会话时序 |
| F4 | 「ENV 专项 RUNNING」 | **出生（04:41:54Z）至 04:58 零可归因足迹**：无新 worktree（`.git/worktrees` 全列）、无远端分支（ls-remote 全列）、无进程、无 /tmp 新目录/日志。尚在「报告型任务合法静默窗」内，但 20min 口径（T13 §1.2）的 deadline = **05:02，恰逢 Tick#15 开局**，处置树见 §2.2 | find -newermt + worktree 全列 |
| F5 | （简报未及） | **面板 updatedAt 腿系统性无效，判活协议需修正**：5 个 RUNNING 代理的 `updatedAtMs` 全部 ≈ `createdAtMs`（含 04:51 刚推过 commit 的 plug、含本顾问自身）——该字段不随活动推进。T13 草稿 §1.1 四证表的「面板活性」腿应从判活协议中**删除**，有效三腿 = 进程 / 推送 / 产物 mtime | 面板 API 5 行 updatedAtMs 逐一比对 |
| F6 | 「#103/#125 未合；#104 draft 禁 ready」 | 复核不变：#103 OPEN/ready/MERGEABLE（`1a4296f`）；#104 draft 冻结 `c24c7f3`；#125 OPEN/draft（P7 tip `77a8c2d`，base=main，**P6/#121 已是其祖先**——合 #125 即收编 #121）；main 无新合入。**T12 §1.3-1 归档动作至今未执行**（`/tmp/evidence-exp01` 不存在，第三次提醒）；T13 草稿 04:53:24 仍在写（未提交），RUNNING 非 stale | gh + ls + t13-wt status |

---

## 1. TRIAGE-WRAP 过 deadline 处置（任务 ①）：**中止 GO——交付物已收割，本体是僵尸**

### 1.1 三选项裁决表

| 选项 | 裁决 | 理由 |
|------|------|------|
| **中止（收割登记）** | **GO** | 交付物两件均已落地且不在其名下：① 定向测产物（04:26 收轮，T11 F4 快照 + trace 原件）；② wrap 判读（被 plug 吸收为 `8507aa3`，F1/F2）。bc-ace126a4 自 04:26 起 32+ min 零进程/零推送/零产物 mtime（F5 修正后的三腿全死），deadline 已过，**无任何未收割产出** |
| 继续等 | NO | 等的标的（wrap 报告）已由他人交付；再等只烧槽位（Tick#15 需要槽给秘书 P8，§3.3） |
| 忽略（挂着不管） | NO | RUNNING 僵尸挂面板会持续污染后续 tick 的态势判读（本轮简报首问即由此产生），且占用 4 路负载口径的名义槽位 |

### 1.2 中止保险（防归属误判的 2 分钟复核，低成本可逆）

F2 归属判定是时序推断（强证据但非直接观测；environ 腿已被 F3 证明不可用）。**兜底**：中止 bc-ace126a4 后 2–3 分钟内复核一次验证轮活性——`ls --time-style=full-iso /tmp/plug-wt/test-results/` 有新增 + chrome 渲染进程（04:58 实测 337% CPU）存活。若验证轮随中止死亡（= 归属误判，驱动者其实是 TRIAGE-WRAP），立即向 plug（bc-686622df）补发一条 follow-up 重启验证（重跑命令在 `/tmp/x2-triage-verify.log` 头部与 tmux `x2-triage-verify` 会话历史里，重放成本 ~1 条命令 + 重跑墙钟）。

### 1.3 台账登记措辞（供秘书 P8）

「TRIAGE-WRAP（bc-ace126a4）：定向测 04:26 自然收轮（1 failed，判读 B）；wrap 判读由 plug 段吸收交付（plug 分支 `8507aa3`，04:47:46，deadline 内）；本体 04:26 后三腿零活性，Tick#14 按僵尸中止收割。判活协议修正：面板 updatedAt 腿删除（F5），有效三腿 = 进程/推送/产物 mtime。」

---

## 2. ENV vs plug 进度监控阈值（任务 ②）

### 2.1 plug（bc-686622df）——高活性，按里程碑门监控

当前态：r1 三 commit 已推（`8e441ef` e2e 串行化+动线绕行 / `8507aa3` 归因报告 / `368b4d4` workers 2→1）；04:51:31 起定向验证轮在 `/tmp/plug-wt` 跑（`--project=world-chromium --no-deps -g "CITY-EXP-01|CITY-QST-02|CITY-FB-01"`，preview 端口 4599），04:5x EXP-01 首截图已落盘。

| 里程碑 / 阈值 | 口径 | 到点动作 |
|---------------|------|---------|
| 验证轮收轮窗 | 三重用例串行一 worker：EXP-01（新三腿动线）+ QST-02（折算 ~750s）+ FB（~650s），实测带 **~30–45min** → 预计 **05:25–05:40**（Tick#17–18） | 等 `VERIFY_EXIT=` 哨兵行落 `/tmp/x2-triage-verify.log` 末尾 |
| 判活（跑动中） | **log 静默是常态**（line reporter 单测中无输出，12min 静默窗正常）；判活看 `test-results/` 新增 + chrome 渲染 PID CPU 推进。**双零增长 ≥25min → 候选；≥35min → 僵死升级**（具体 PID 精确 kill，严禁按名杀） | 升级前先 capture-pane 留现场 |
| 硬顶 | 三例 setTimeout 之和口径 ~75–90min → 绝对 kill-line **~06:15** | 到点仍无哨兵即按僵死处置 |
| 收轮后 | 15min 内应见 §6 验证附录回填 commit；**30min 无 commit → nudge**（报告型口径接管，F5 三腿判活） | follow-up 催回填 |
| 3/3 通过 | 进段末审计排期（含 T13 草稿 F8 点名的两项裁决：**e2e 动线随迁 vs 测试面冻结纪律**、**全局 workers 2→1 的墙钟/单源文档冲突**）——由审计门定谳，父代理**不做飞行中方向反转**（沉没成本 + 备选方案「动桥腿几何」触发 poster 重拍连锁，代价更重）。**通过 ≠ #104 undraft**：复活门仍 = 全量 0 failed/0 skipped/0 flaky（80 例现口径） | 全量轮排期按 ≥2 轮预算（串行化后墙钟近倍增） |
| <3/3 | r2 循环留在 plug 分支内；**EXP-01 若以「爬行签名」挂**（≠ 撞腿签名）→ 归 ENV 域问题，**禁止继续改动线**（防路线编辑螺旋），移交 ENV 结论后再动 | 失败签名分流表沿 T9 §6.3 |

### 2.2 ENV（bc-53ac6339）——零足迹监控窗已开启

| 阈值 | 时点 | 到点动作 |
|------|------|---------|
| 首足迹 deadline（报告型 20min 口径，自 04:41:54 起算） | **05:02 ≈ Tick#15 开局** | 零足迹（无 worktree/分支/实验日志/进程）→ **stale 候选**，父代理发一条 follow-up 询问进度（不中止） |
| 复核点 | **Tick#16 开局（~05:10）** | 仍零足迹 → 中止重派；新卡必须塞四条：① 归档第一动作（§4 附）② T13 F4 出土分支 `cursor/cc-exp01-corridor-fix-0254` 指针（昨日已把 EXP-01 直线走廊定性「被 BL1 充电桩排封死」+ 原型修法，ENV 的核心输入）③ 被覆写 `e2e-results.json` 禁引警示 ④ 单跑道约束（下行） |
| **单跑道硬约束（本报告最重要的一条协调令）** | 即刻生效 | **ENV 的任何运行腿（main 树 EXP-01 实验、变量对照跑）必须 HOLD 到 plug 验证轮收轮**（05:25–05:40）。依据：4 核 VM 上 SwiftShader 渲染单进程实测 337% CPU、load 3.64——双 3D 跑必互相挤兑；且 plug 验证轮验的正是「串行化消 flake」，被挤兑即破坏实验条件，**双跑 = 双废**。ENV 文档腿（读 T11 §2.3 / triage r1 / corridor-fix 分支、设计实验矩阵）不受限可先行。父代理应即刻向 ENV 补发这条 runway 排队指令（若其任务卡未含） |

---

## 3. Tick#15 预排（任务 ③）

### 3.1 3n 界点确认：**是**

Tick 节奏实测 10min 整（T11=04:20 / T12=04:30 / T13=04:40 / T14=04:50，面板 createdAt 逐一验证）→ Tick#15 ≈ **05:00**。#15 = 3×5，且惯例链 P6@Tick#9、P7@Tick#12 成立 → **秘书 P8 本界点必派**。

### 3.2 P8 编排口径

- **base 裁决**：#125 未合 → **P8 叠 P7 tip `77a8c2d`**（PR 栈场景②，秘书链栈深至 3——上板提醒指挥官：合 #103 → 合 #125（自动收编 #121，可顺手关 #121）即可塌栈）；#125 若在派单前已合 → base = main。
- **登记清单**：① 顾问链 #126（T12）+ T13 PR（其草稿 04:53 仍在写，落地后补号）+ 本文档 PR；② TRIAGE-WRAP 中止收割（§1.3 措辞）；③ plug r1 三 commit + 验证轮状态（若已收轮附结果）；④ ENV 状态（足迹/中止重派）；⑤ F4 出土分支 `cc-exp01-corridor-fix-0254` 登记；⑥ 范式增量两条：面板 updatedAt 腿删除（F5）、tmux environ 归因陷阱（F3）；⑦ 仓库改名规范名复读；⑧ **登记矩阵四行照抄**：北极星 **98 / 98 / 90 / 85** vs 生产登记 **80 / 71 / 84 / —**（综合/视觉/功能/性能），性能显式 **—**（解锁条件 = 真机 human-gate 六腿 → AL-PERF）。

### 3.3 槽位算术与派单清单

Tick#15 开局预计在途：plug（验证轮至 05:25+）+ ENV（或已转中止流程）= **2 路**；TRIAGE-WRAP 已中止（§1）、T13/T14 已交付转 IDLE。派 **P8（文档轻负载，可与验证轮共存）→ 3 路**，预留 1 路给验证轮收轮后的应急（r2 或段末审计提前起卡），**不加开第 4 路新工**（§4）。
**不派清单**：修复前全量 e2e（双树 EXP-01 必挂，双废轮）；T7-A 视觉审计（事件门不变：ENV 定谳 + plug 双清 + 验收全绿 + #104 门禁 fresh 绿 + X2 线 IDLE）；任何 corridor 实验运行腿（等 runway，§2.2）。

---

## 4. VM 4/4 满载零加开确认（任务 ④）：**确认，且给出算力上界证据**

- **槽位口径**：面板实测 5 RUNNING（TRIAGE-WRAP 僵尸 + T13/T14 两顾问 + ENV + plug），名义上距 6 路上限有余；**但槽位不是本 VM 的硬约束，算力才是**。
- **算力口径**：`nproc=4`，04:58 实测 load 3.64 / chrome SwiftShader 渲染单进程 337% CPU——**一个 3D e2e 验证轮就吃满整机**。此时任何新增重负载（e2e / build / lighthouse / blender）都会：① 挤兑在跑验证轮，直接复现 triage r1 定性的 #33/#35 挤兑 flake，**污染正在验证的对象本身**；② 自己也拿不到有效算力。
- **裁决**：**验证轮在跑期间（至 VERIFY_EXIT 落盘），父代理零加开重负载任务——确认**。文档型轻任务（P8 秘书、顾问、follow-up 传话）不在此限；对在途代理的 follow-up 指令（§1.2 保险复核、§2.2 runway 排队令）属传话不属加开。
- **附：归档代办（第三次提醒，建议父代理即刻自跑，~1 分钟幂等命令，非代码改动不涉直改白名单）**：`mkdir -p /tmp/evidence-exp01 && cp -a /tmp/main-exp01.log /tmp/main-wt/test-results/cyber-city-explore-*world-chromium /tmp/evidence-exp01/ && cp -a /tmp/x2-wt/test-results /tmp/evidence-exp01/x2-test-results`。T12 写进裁决、T13 写进动作清单均未落地，事不过三。

---

## 5. 裁决一览（父代理直接执行，按序）

1. **中止 TRIAGE-WRAP**（bc-ace126a4）：交付物已双双收割（定向测产物 + wrap 判读被 plug `8507aa3` 吸收）；中止后 2–3min 复核验证轮存活（§1.2 保险），台账按 §1.3 措辞登记。
2. **归档代办即刻自跑**（§4 附命令，第三次提醒）。
3. **向 ENV 补发 runway 排队令**（运行腿 HOLD 至 plug 验证轮收轮；文档腿先行）+ F4 出土分支指针；05:02（Tick#15 开局）零足迹 → follow-up 询问；05:10（Tick#16）仍零 → 中止重派（新卡四条款，§2.2）。
4. **plug 监控按 §2.1 里程碑表**：收轮窗 05:25–05:40，判活看产物 mtime + 渲染 PID（log 静默是常态）；收轮后 30min 无 §6 回填 commit → nudge；通过 ≠ #104 undraft；测试面纪律冲突两项挂段末审计门定谳，飞行中不反转。
5. **Tick#15 = 3n 界点，派秘书 P8**：#125 未合则叠 `77a8c2d`（栈深 3，提醒指挥官 #103 → #125 塌栈序），登记清单 §3.2；槽位 3 路封顶，预留 1 路应急。
6. **验证轮在跑期间零加开重负载**（§4）：4 核被 SwiftShader 吃满，新增重活 = 污染验证 + 自身无效；文档任务与传话不受限。
7. **判活协议修正入范式**：面板 updatedAt 腿删除（F5）、tmux environ 归因陷阱（F3）、「报告型 vs e2e 型分口径 + 收轮时刻切换」（沿 T13 §1.2）三条随 P8 上板，候选手册 §3.5。

---

*本文档为 CC-LOOP-ADVISOR-T14 Tick#14 交付物；登记看板不在本文更新，由秘书线单源维护。*
