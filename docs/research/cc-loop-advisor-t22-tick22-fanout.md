# CC-LOOP-ADVISOR-T22 · Tick#22 扇出裁决（fanout）

- **顾问**：CC-LOOP-ADVISOR-T22（model slug: `claude-fable-5-thinking-xhigh`）
- **取证窗口**：2026-08-28 06:10–06:18 UTC，全部一手取证（run1/run2 tee 日志全文 + run2 `e2e-results.json`/`.last-run.json`/error-context 实读 / test-results 与 /tmp 全 ISO mtime / ps 谱系 ×5 轮含 lstart / tmux ls + 五会话 capture-pane / `/tmp/probe-loop.sh` 与 `/tmp/fps-probe.mjs` 源码实读 / probe-plug·plug2·main 三份日志全文 / gh pr list + view 103/104/129/139/140 / git ls-remote / uptime ×3 / T21 交付文档 #139 全文实读）
- **基线**：main @ `88097f9`（fetch 实测无新合入）；T21 裁决（#139）全文承接
- **纪律**：零 `src/` 改动；独立 worktree `/tmp/t22-wt`（base = origin/main）；本文档不写看板，登记由秘书线单源
- **本 tick 大事**：① **run2 已收轮且 ✘**：06:11:04 死于 `Target page, context or browser has been closed`（duration 500.4s，距 3,000s cap 甚远）——与探针 #3（main 腿）同窗同款死法，**外杀误伤 probable**；按 T21 F4 预登记门 + 死因归因双轨，**作废、诊断样本不计 ×2、不触发判读 B 回炉**（§1）；② **复发机制出土——重试壳**：`/tmp/probe-loop.sh`（06:14:56 从 `x2-e2e` 会话拉起）自述「外部清杀导致浏览器中途死亡时自动重试（至多 4 次）」——**TERM 叶杀已被实测证伪 ×3**（06:12:44 / 06:14:56 / 06:16:22 / 06:17:34 四波尝试，取证时刻第 3 次尝试在飞）——防堵必须根杀+缴械+断靶三连（§2）；③ **run2 证据抢救完成**：顾问已归档 `run2-diagnostic/` 688K（三证全套：tee 日志 + `e2e-results.json` + playwright-report 528K + trace + error-context）+ `probe/` 24K（两脚本五日志），证据灭失事件 #3 预防性拦截（§1.3）；④ P10 已派（[#140](https://github.com/rayw-lab/website/pull/140) RUNNING）、T21 已交付（[#139](https://github.com/rayw-lab/website/pull/139)）；#103 第 10 次复读、#135 塌栈拖欠 2 tick；⑤ **x2-wt 现场已变**：working tree 零未提交、`_scratch-capture.mjs` 已不在、分支尖 c24c7f3（R4 kickoff）——R2 双清对象去向待核（§4 条件 4）

---

## 0. 事实核查——七条推翻/超越 Tick#22 简报的 fresh 事实

| # | 简报口径 | 实测（06:10–06:18 UTC） | 证据 |
|---|---------|------------------------|------|
| **F1** | 「ENV run2 在飞（worker ~7min+）」 | **已收轮且 ✘**：stats.startTime 06:02:43.8 → 死亡 06:11:04（duration 500,449ms ≈ 8.3m），`1 failed`，死因 `page.waitForTimeout: Target page, context or browser has been closed`（driveTo 循环中浏览器被外部拆除）；`RUN2_EXIT=0` 系 tee 管道吞码（已知坑），以 list 行 + JSON `unexpected:1` 为准；`env-exp01-run2` tmux 会话已被收割 | tee 日志全文 + e2e-results.json + .last-run.json + tmux ls |
| **F2** | 「fps-probe 再次拉起（父代理已再次 TERM）」 | **TERM 无效，复发已工程化**：`/tmp/probe-loop.sh` 重试壳（自述对抗「外部清杀」，×4 重试 + 20s 间隔）06:14:56 从 `x2-e2e` 会话 bash 拉起，谱系 79263(bash -l)→79523(壳)→node→chrome；取证窗内四波尝试（06:12:44 plug2 波被杀 / 06:14:56 attempt1 / 06:16:22 attempt2 / 06:17:34 attempt3 在飞，06:18:06 robot_idle）——**叶杀触发重拉，越杀越多** | probe-loop.sh 源码 + ps lstart 谱系 ×3 轮 + probe-plug2.log/probe-plug.out |
| **F3** | 「复发污染」（未及死因关联） | **run2 死因与探针清杀同窗同款**：探针 #3（main 腿 @4610）06:10:10 起采样、06:10:30 死于 `browser has been closed`；06:10:48 ps 实录 run2 chrome 仍活（74679 gpu 231%）且探针已退净；34 秒后 06:11:04 run2 同款死法——**外杀扫射误伤 probable**（无 kill 日志直证；OOM 无 dmesg 记录；SwiftShader 崩溃 possible）——三种死因均属环境致死，归因树任何分支不改变 §1 裁决 | probe-main.log + ps 06:10:48 实录 + e2e-results.json 时刻锚定 |
| **F4** | 「load ~6」 | 已回落再抬头：06:10:48 = 5.54 → 06:13:55 = 3.43 → 06:14:29 = 2.10 → 探针重试波再占用（gpu 293% @06:12 波）——**真空三查的 load<2 门在重试壳存活期间不可达成** | uptime ×3 + ps |
| **F5** | 「T21/SEC-P10 RUNNING」 | T21 **已交付**：[#139](https://github.com/rayw-lab/website/pull/139) draft OPEN——×2 重锚（run3/run4 命名令）、跑道互斥令、archive-then-clean 铁则均已立法生效，本文在其基线上作业；P10 **已派**：[#140](https://github.com/rayw-lab/website/pull/140) draft OPEN（base=P9 尖 5f801b7 形态成立） | gh pr list + ls-remote |
| **F6** | 「#103/#135 未合；#134 IDLE；#104 禁 ready」 | 全部成立：#103 OPEN/非 draft/MERGEABLE/CI SUCCESS——**第 10 次复读**；#135 CI SUCCESS 仍 draft——**塌栈拖欠 2 tick**；#134 draft/e03271f 无新动；#104 draft 维持 | gh pr view 103/104 + pr list |
| **F7** | （简报未及） | **x2-wt 双清现场已变**：working tree 零未提交、零 stash、`_scratch-capture.mjs` 不存在、分支尖已推进至 c24c7f3（R4 kickoff，含 R3 kickoff 两笔 chore）——T19/T21「未提交几何存证 + scratch 转正/弃」双清对象去向不明（转正 or 灭失），条件 4 状态改写（§4） | git -C /tmp/x2-wt status/log/stash + ls |

---

## 1. 任务①：run2 污染裁决——作废（诊断样本不计 ×2），不触发回炉，不存在「重跑 run2」

### 1.1 双轨裁决（任一轨独立成立）

**轨 A · 预登记门（既判力）**：T21 F4 已判——run2 开跑（06:02:42）即违真空三查三项全违（探针 chrome 存活 / load 2.44>2 / 三路非自管服务），**无论结果同判诊断样本**。该门对称严格、不因结果偏袒，✘ 与 ✓ 同价。本轨在 run2 起跑当刻即已生效，无需死因参与。

**轨 B · 死因归因（fresh 增补）**：死亡剖检三证——
1. `duration 500,449ms`：距 `test.setTimeout(3_000_000)` cap 甚远，**排除测试超时拆除**；
2. 错误签名 `Target page, context or browser has been closed` 抛自 driveTo 轮询中——测试逻辑未走到任何失败断言，**排除判读 B 型（EXP-01 路径/碰撞）失败**；
3. 时窗对齐：探针 #3 于 06:10:30 死于同款签名（外部清杀），06:10:48 ps 实录 run2 chrome 仍活、探针已退净，06:11:04 run2 同款死法——**外杀扫射误伤 probable**；备择死因 OOM（dmesg 零记录）/ SwiftShader gpu 崩溃（293% CPU 争用背景）均属环境致死。

**裁决措辞（供传话包直引）**：run2 = 污染趟 + 环境致死，**作废、不计 ×2、✘ 不触发判读 B 回炉**（T21 预设「✘ 则归因作废」口径兑现）；#129 先验不因 run2 ✘ 降格（run1 四腿全过的鼓励性诊断维持）。**不存在「重跑 run2」**——run1/run1b/run2 三标签已烧毁（T21 命名令），干净趟从 `env-exp01-run3` 起算，×2 锚点不变。

### 1.2 违令登记（互斥令立法后首犯）

探针 #3（main 腿，06:09:46–06:10:30）与 run2 驾驶腿正面并发 = **T21 §2.2 跑道互斥令生效后的首个违令事件**；06:14:56 重试壳（自述对抗「外部清杀」）= 对清杀纪律的**工程化规避**，性质升级。两事件主体均为探针运营方（父代理侧），入执行力账；per 互斥令条 3，并发窗内的趟（run2）当场降级诊断——与轨 A 结论重合。

### 1.3 证据面（顾问已代办，防证据灭失事件 #3）

`/tmp/evidence-exp01/run2-diagnostic/` **688K**：`env-exp01-run2.log`（tee 全文）+ `test-results/`（`e2e-results.json` 8,972B 三证之 JSON + `explore-first-discover.png` @06:04:14 腿① 实证 + error-context.md + trace.zip）+ `playwright-report/`（index.html 528K @06:11:04）+ `run2-trace-extracted/`；`/tmp/evidence-exp01/probe/` **24K**：`fps-probe.mjs` + `probe-loop.sh` 两脚本与 probe-plug/plug2/main 日志全套。**run3 启动前的 test-results 清理已获放行**（run2 证据已离盘归档；archive-then-clean 铁则首次完整走通）。

---

## 2. 任务②：fps-probe 复发防堵——根杀+缴械+断靶三连，plug 全冻结直至 ENV ✓✓

叶杀（TERM chrome）已被实测证伪 ×3：重试壳 20s 后自动重拉，每波尝试 ≈2–4min chrome/SwiftShader 占道，load<2 真空门在壳存活期间**不可达成**——run3 无法放行。防堵按序（父代理即刻执行，Tick#22 尾）：

| 序 | 令 | 操作口径 |
|----|-----|---------|
| 1 | **根杀令** | 收割重试壳本体而非 chrome 叶子：capture-pane 留痕后 `tmux kill-session -t x2-e2e`（壳谱系 79263→79523 宿主即该会话，且本就在清场令六会话名单）；若壳已易主，按 `ps -eo pid,ppid,args` 实时谱系自上而下精确 PID 收割（壳→node→chrome），**绝不 pkill/按名扫射**（run2 误伤为直接教训） |
| 2 | **缴械令** | `/tmp/fps-probe.mjs` 与 `/tmp/probe-loop.sh` 从 /tmp 移除（归档副本已在 `evidence-exp01/probe/`）——脚本不在则任何残壳/再武装秒败自然耗尽，无 chrome 拉起 |
| 3 | **断靶令** | kill 4507 plug-serve + 4610 main-preview + 4475 fxn-preview（清场令第 4 tick 最后通牒项照单执行）——探针无 URL 可跑；五残留会话（main-preview/plug-preview/plug-build/x2-e2e/x2-triage-verify）capture 留痕后全收割 |
| 4 | **冻结令** | **ENV ✓✓ 前 `/tmp/plug-wt` 全冻结**：禁 build/serve/probe/任何形式重载；#134 保持 IDLE 不动分支；A/B 探针议程整体推迟至 ✓✓ 后真空空档、双腿同窗背靠背（T21 §2.2 条 2 原文维持） |
| 5 | **重试壳禁令（新立法）** | ENV ✓✓ 前禁止任何 chrome 级活动的自动重试/自动重拉包装（loop/watchdog/cron 同罪）；发现即根杀 + 违令登记。理据：重试壳把单次违令放大为持续占道，且使一切叶杀清场失效 |
| 6 | **自然耗尽不豁免** | 取证时刻 attempt3 在飞（~06:20 出数或 attempt4 至 ~06:24 耗尽）——即便壳自然退出，缴械+断靶仍必须执行：main 腿（4610）已有一波前科（06:09:46），靶与弹药不清除即可再武装 |

---

## 3. 任务③：Tick#23 预排（run2 已收轮 → 直接进 run3 链；run1' 裁决：不需要）

**run1' 不需要**：T21 命名令已烧毁 run1b 标签；run1 终局登记「污染跑道 ✓ · 鼓励性诊断」不可重开——「重跑 run1」在 ×2 口径下语义恒等于 run3。凡问 run1' 一律答：**干净趟 = run3/run4，无第三种标签**。

| 序 | 动作 | 口径 |
|----|------|------|
| 0 | （Tick#22 尾）§2 三连 + 冻结 | 根杀→缴械→断靶；load 沉降观察 ~5min |
| 1 | 真空三查 | 零 chrome-headless/SwiftShader 谱系（`ps` 实测）+ load 1min<2（uptime 实测）+ 除自管 preview 外零 astro preview/静态服（tmux ls + 端口扫描）；三查证据（命令+输出+ISO 时刻）随传话包留痕 |
| 2 | **放行 run3（干净趟#1）** | tmux 会话名 `env-exp01-run3`、日志 `/tmp/env-exp01-run3.log`；启动命令**禁嵌 `rm -rf`**（run2 证据已离盘，允许启动前单独清 test-results）；在飞期间跑道互斥令全 VM 生效（父代理自身同受约束）；预计 06:30 起跑 → 06:55±5 收轮（19.7m 基准 + 余量） |
| 3 | run3 收轮 | 三证合一（EXIT 尾行 / list 末行 / JSON stats `readFileSync`）+ 先归档 `evidence-exp01/run3/` 再清理；✓ 则真空复查后即接 run4（07:00–07:25），✘ 则按 T17 §3.3 回炉树判读（干净趟 ✘ 才是真信号） |
| 4 | #103/#135 清账 | #103 第 10 次复读（催办件仍挂指挥官，唯一零成本落袋项）；#135 un-draft → merge → #130 自动收编复核——拖欠 2 tick，每拖一 tick 开闸日排队多一分 |
| 5 | R2 followup 派单 | 零跑道 docs 任务：核实 x2-wt 双清对象去向（F7——`_scratch-capture.mjs` 与未提交几何是转正入 R3/R4 kickoff 还是未存证清除），一次性登记；若灭失则挂证据账 |
| 6 | P10 收轮核验 | [#140](https://github.com/rayw-lab/website/pull/140) 交付后核对 T21 §3.2 十五件（存量七 + 新增八）全落 + 本 tick 增量（run2 终局/重试壳事件/根杀三连立法）转 P11 排期 |

**槽位算术**：ENV 链（单跑道锁定 run3→run4）∥ P10 收轮 ∥ #103/#135 清账 ∥ R2 followup = 2–4 路在途，符合 2–6 约束。**里程碑推演（干净路径）**：三连+沉降 ~06:25 → run3 06:30–06:55 → run4 07:00–07:25 → **✓✓ ~07:25–07:30** → 签字门（T19 §2.3 一次性清单）→ **#129 合流维持 Tick#29–30**。任何再复发/再污染整链顺延一趟（~25min）。

---

## 4. 任务④：全量 e2e 解锁清单复读（六条，Tick#22 状态刷新）

**先纠简报口径**：「全量 e2e 预计 Tick#22–#24 开闸」系 T20 前旧估——T21 已因两趟诊断烧道顺延 **Tick#29–#31**，本 tick 维持该口径（run2 ✘ 本就不计 ×2，关键路径长度未再恶化；前提 = §2 三连即刻执行，否则每拖一 tick 顺延一 tick）。

| # | 条件 | Tick#22 实测状态 | 责任位 |
|---|------|-----------------|--------|
| 1 | #129 合入 main（×2 ✓✓ + 签字门） | **仍零干净趟**（run1 诊断✓ / run2 诊断✘ 双出局）；run2 已收轮，跑道理论上可让渡 run3——但被探针重试壳占道，**解锁的解锁 = §2 三连**；✓✓ 最早 ~07:25–07:30 | 父代理执行三连 + ENV 跑趟 + 指挥官签字 |
| 2 | #103 + #135（含 #130）塌栈 | 双绿在案唯一即刻落袋项：#103 第 10 次复读、#135 拖欠 2 tick；P10（#140）已派但其看板叠层依赖 #135 塌栈序尽快定型 | 指挥官（#103 催办件）+ 父代理（#135） |
| 3 | plug 栈两步走（#134→#104 单次 rebase 取 ENV canonical） | 待 #129；#134 draft/IDLE 维持、#104 禁 ready 维持；**plug-wt 冻结令（§2 条 4）与本条同向**——✓✓ 前零动作即正确动作 | R2 + 段末审计 |
| 4 | R2 双清（几何存证 + `_scratch-capture.mjs` 转正/弃） | **状态改写（F7）**：x2-wt 已零未提交、scratch 已不在、分支尖 c24c7f3（R4 kickoff）——双清对象去向不明，条件从「待执行」改「待核实登记」（Tick#23 序 5 派单）；若核实为转正则本条闭环，灭失则挂证据账不阻塞开闸 | R2 followup |
| 5 | 跑道真空 + 归档半径清空 | 清场拖欠第 4 tick + 探针四波复发直接对撞本条（**本 tick 最大失血点**）；归档增量已落：run1-diagnostic 540K（T21）+ run2-diagnostic 688K + probe 24K（本顾问）——ENV 证据面首次三证全套离盘 | 父代理 |
| 6 | 独占窗口 ≥2 轮全量预算（80 例 0/0/0，跑「#104 候选 ⊕ main 集成树」） | 尾门不变；1.5–2h/轮 ×2 轮；互斥令与重试壳禁令同样适用于全量窗 | R2 + 段末审计 |

**关键路径不变** = 条件 1，且本 tick 新增前置 = §2 三连（探针占道不除，真空门永不达成）；条件 2 仍是每 tick 复读的零成本项。

---

## 5. 裁决一览（父代理直接执行，按序）

1. **run2 作废（§1）**：双轨裁决——预登记门既判 + 环境致死归因（外杀误伤 probable，duration 500s 距 cap 甚远，同窗同款签名）；不计 ×2、不触发判读 B 回炉、不存在「重跑 run2」标签；#129 先验维持。
2. **防堵三连 + 冻结（§2）**：根杀（kill-session x2-e2e 收壳，绝不叶杀/按名扫射）→ 缴械（两脚本离盘，归档已备）→ 断靶（4507/4610/4475 + 五会话收割）；**ENV ✓✓ 前 plug-wt 全冻结、重试壳禁令立法**。
3. **Tick#23 预排（§3）**：真空三查（证据随传话包）→ run3 06:30 窗放行 → 收轮三证+归档 → run4 → ✓✓ ~07:25–07:30 → 签字门；**run1' 不需要**（命名令恒等 run3）；再复发则 run3 顺延并顶格入账。
4. **解锁链口径（§4）**：简报「Tick#22–#24 开闸」作废，维持 T21 顺延 **Tick#29–#31**；条件 4 改「待核实登记」（R2 followup 派单）；条件 1 新增前置 = 防堵三连。
5. **#103/#135（§4 条件 2）**：#103 第 10 次复读挂指挥官；#135 un-draft→merge→#130 收编，拖欠 2 tick 入执行力账。
6. **登记转秘书线**：run2 终局（诊断✘·环境致死）/ 互斥令首犯 + 重试壳事件（工程化规避，性质升级）/ 防堵三连与重试壳禁令立法 / run2-diagnostic+probe 归档落袋 / x2-wt 双清现场改写——五件入 P11 增量清单（P10 #140 在途不追加）。

---

## 登记矩阵四行（看板单源，照抄不改口径）

北极星 **98 / 98 / 90 / 85** vs 生产登记 **80 / 71 / 84 / —**（综合/视觉/功能/性能）；性能未登记显式 **—**，解锁条件 = 真机 human-gate 六腿 → AL-PERF。

---

*本文档为 CC-LOOP-ADVISOR-T22 Tick#22 交付物；登记看板不在本文更新，由秘书线单源维护。*
