# CC-LOOP-ADVISOR-T19 · Tick#19 扇出裁决（fanout）

- **顾问**：CC-LOOP-ADVISOR-T19（model slug: `claude-fable-5-thinking-xhigh`）
- **取证窗口**：2026-08-28 05:40–05:47 UTC，全部一手取证（ps 进程谱系 + 父链回溯 / tmux ls + list-panes + capture-pane / /tmp mtime / uptime / gh pr view+list / git log+status 七个 worktree 实读 / run 日志 tail 实读）
- **基线**：main @ `88097f9`（fetch 实测无新合入）
- **纪律**：零 `src/` 改动；独立 worktree `/tmp/t19-wt`（base = origin/main）；本文档不写看板，登记由秘书线单源（`docs/research/cyber-city-score-loop-orchestration.md`）
- **本 tick 大事**：① **跑道双占实锤**——05:38:04 ENV run1（合法，slot#2）与 05:40:19 plug-wt EXP-01 复跑（排队残波）并发，load 峰值 **7.81/4 核**，决定性实验 run1 正在被污染（§1）；② **plug 验证轮已收轮**：三腿终局 **EXP-01 ✘ / QST-02 ✘（判读已作废）/ FB-01 ✓**，44.4m，`VERIFY_EXIT=0`（05:35）——FB-01 通过使 **#35 判读=挤兑 flake 获首个干净正样本**；③ **证据灭失事件 #1**：复跑启动即清空 `/tmp/plug-wt/test-results`，QST-02 的 69MB 裸 trace.zip 灭失（T17 F8 预警成真、归档第 7 次逾期）——**部分缓解**：本顾问 05:45 抢救性归档 `playwright-report`（105M，mtime 05:35，内嵌三腿附件）等 351M 入 `/tmp/evidence-exp01/`，7 次逾期代办落地（§1.4）；④ run1 无论结果**降级为诊断样本**，清场后重开 run1'（§2.2）；⑤ #135 ⊇ #130 commit 实证 → 塌栈序简化（§3.1）

---

## 0. 事实核查——七条推翻/超越 Tick#19 简报的 fresh 事实

| # | 简报口径 | 实测（05:40–05:47 UTC） | 证据 |
|---|---------|------------------------|------|
| **F1** | 「跑道有 headless 进程（或 ENV 已上跑道）」 | **两者皆是且并发**：ENV run1（tmux `env-exp01-run1`，05:38:04，`E2E_PORT=4620`，/tmp/env-wt @ `5e41550` = #129 head，tee `/tmp/env-exp01-run1.log`）+ plug-wt EXP-01 复跑（tmux `x2-triage-verify` pane bash 45978 → pnpm 67274，05:40:19，`E2E_PORT=4599`，/tmp/plug-wt @ `839b6fe`，tee `/tmp/exp01-rerun.log`）。05:46 复核两路均存活（elapsed 08:44 / 06:28），load 1min **7.81** | ps 父链 + tmux list-panes + capture-pane |
| **F2** | 「plug IDLE ✅」 | 成立，但**残波在跑**：复跑命令是 pane 输入队列里的排队单（capture-pane 实读：`VERIFY_EXIT=0` 之后 bash 提示符吃到整行 `cd /tmp/plug-wt && E2E_PORT=4599 pnpm exec playwright test … -g "CITY-EXP-01"`）——收轮前被 send-keys 进缓冲、收轮后自动执行。发送者不可逆向取证，效果面 = T17 §2.3 预授权场景「收轮后抢跑 839b6fe 复跑」变体，但该预授权前提（ENV 未上跑道）已不成立 | capture-pane 全量存档 |
| **F3** | （简报未及） | **plug 验证轮终局在案**：`2 failed`（EXP-01 @252 行 / QST-02 @577 行）+ `1 passed`（FB-01）， 44.4m，`VERIFY_EXIT=0`，日志 `/tmp/x2-triage-verify.log`（mtime 05:35）——T17 F4「#35 判读可救」兑现：**FB-01 在串行化跑道上通过** | pane + 日志实读 |
| **F4** | （简报未及） | **证据灭失事件 #1**：`/tmp/plug-wt/test-results` 05:40 被复跑清空重建（现仅 `.playwright-artifacts-0` + `explore-first-discover.png` @05:42，共 520K）——QST-02 69MB 裸 trace 灭失。`/tmp/evidence-exp01` 05:44 实测不存在（第 7 次逾期）→ 本顾问 05:45 落地：`playwright-report`（105M，三腿附件内嵌）+ 轮日志 + pane 全量 + capture 截图链 8 张 + main/x2 test-results，共 **351M** | ls mtime + du 实测 |
| **F5** | 「#134 draft tip e03271f（A案几何）」 | 成立并补栈序：#134 base = `cursor/cc-vis-x2-facade-r2-1d6f`（#104 分支 @ `c24c7f3` 冻结），CI **SUCCESS**（05:37）；分支含 TRIAGE r1 四个在先 commit（含 `839b6fe` 三 spec 扩改）+ `2c1d4ab` 几何 + `e03271f` 报告——**e2e spec 改动在 #134 的 diff 里，不在 #104 里**，冲突解决点落在 #104 rebase（§3.2） | gh pr view 134 + git log 双 worktree |
| **F6** | 「#103 未合」 | 成立：OPEN/ready/MERGEABLE（审计 GO #120 在册）——**第 7 个 tick 复读即合**。#135（P9）CI 05:47 仍 IN_PROGRESS；**#135 commit 集实证包含 #130 tip `f3bc6c2`** → 塌栈可一步走 #135（§3.1） | gh pr view 103/130/135 |
| **F7** | （简报未及） | ENV 开跑三前置复盘：①收轮三证 ✓（05:35 收轮早于 05:38 开跑）；②跑道真空**未可逆证**（chrome 已退净 ✓，但 load 1min 当时大概率 >2——44.4m 轮刚收）；③**归档先行 ✗**（05:38 时 /tmp/evidence-exp01 不存在）——登记 ENV 轻微违纪（前置未查即开跑），情节缓和：归档代办 T17 明确挂父代理名下 | T17 §3.2 对照 + 时间线 |

---

## 1. 任务①：跑道占用归属——一合法一残波，清场令 + 证据灭失登记

### 1.1 占用清单与归属判定

| 占用 | 谱系（父→子） | 启动 | 归属 | 判定 |
|------|--------------|------|------|------|
| **ENV run1** | tmux `env-exp01-run1` → bash 66257 → pnpm 66498 → cli 66510 → worker 66564 + chrome 66576–66620 + preview 66527（port 4620，playwright webServer 自管） | 05:38:04 | ENV（slot#2 放行对象，/tmp/env-wt @ #129 head `5e41550`） | **合法占用**；但 05:40 起被 #2 并发挤兑 → 判读降级（§2.2） |
| **plug-wt EXP-01 复跑** | tmux `x2-triage-verify` pane bash 45978 → pnpm 67274 → cli 67303 → worker 67320 + chrome 67332–67379（复用孤儿 preview 46251 @ port 4599） | 05:40:19 | **排队残波（僵尸腿）**：pane 输入队列命令，收轮后 bash 自动执行；plug 面板 IDLE，非现行代理动作 | **违纪占用**（未带真空检查上跑道）且**信息价值≈0**：839b6fe 归因已双盲收敛入 #129，其改线将在 rebase 时被 ENV canonical 替换（T16 §2.4）——测一条注定被换掉的路 |
| 僵尸 preview #1 | 12388 `astro preview` port 4475，cwd `/tmp/wt-fxn-audit-771b1e4`，tmux `fxn-codex-preview` | 03:05 | T13 时代审计线遗留 | 僵尸，收割 |
| 僵尸 preview #2 | 46251 `astro preview` port 4599，cwd `/tmp/plug-wt`，**父=1 孤儿** | 04:48 | plug 验证轮遗留 | 僵尸；复跑正在复用它——**先 C-c 复跑再 kill** |
| 僵尸静态服 | tmux `plug-preview` python3 @ `/tmp/plug-serve`（port 4507，T17 F2 在册） | 04:59 | plug capture 旁路遗留 | 僵尸，收割 |
| 空闲会话 | tmux `x2-e2e` / `plug-build`（bash 空转） | 02:56 / 04:55 | plug/x2 线遗留 | capture 留痕后 kill-session |

### 1.2 清场令（父代理按序执行，PID 级精确，绝不 pkill）

1. **C-c 复跑**：`tmux -f /exec-daemon/tmux.portal.conf send-keys -t x2-triage-verify C-c`（playwright 收 SIGINT 自行拆浏览器）；30s 后复核 67274/67303/67320/67332–67379 退净，残留者按 PID kill；
2. `kill 46251`（孤儿 preview 4599）、`kill 12388`（stale preview 4475）；
3. capture-pane 留痕后 `kill-session`：`x2-triage-verify`（S1 收割一体，见 §2.4）、`fxn-codex-preview`、`plug-preview`、`plug-build`、`x2-e2e`；
4. **勿动**：`env-exp01-run1` 全谱系（66257/66498/66510/66564/66527/chrome 66576–66620）——run1 让它自然跑完（结果只作诊断，§2.2），preview 4620 随 run1 自退。

### 1.3 违纪与判读登记（交 P9/P10 秘书线）

- **纪律事件 #3 尾款**：排队残波复跑（05:40:19）——未带真空检查、与决定性实验并发、清空 test-results 致证据灭失；主体登记为「plug 收轮前遗留排队单」（send-keys 发送者不可逆向取证，不新开主体）；
- **证据灭失事件 #1（部分缓解）**：QST-02 69MB 裸 trace 灭失；`playwright-report`（105M，内嵌附件）已抢救，判读能力大体保全；
- **#35 判读正样本**：FB-01 在串行化跑道 ✓（44.4m 轮内唯一通过腿）——支持「挤兑 flake」定谳方向，终谳仍挂全量段复核；
- **ENV 轻微违纪**（F7）：三前置之③归档先行未查即开跑；随传话包提醒 run1'/run2 前自查三前置。

### 1.4 归档落地（第 7 次逾期，本 tick 代办完成）

`/tmp/evidence-exp01/`（351M，05:45 落盘）：`plug-verify-round/`（playwright-report 105M + x2-triage-verify.log + pane 全量文本）、`capture-chain/`（plug-before/after ×8 截图链，F6 存证）、`main-exp01.log`、`main-test-results/`（46M）、`x2-test-results/`（196M）。**增量代办**：run1 收尾后补拷 `/tmp/env-exp01-run1.log`、`/tmp/exp01-rerun.log` 与 env-wt test-results；R2 接管卡 N1 的归档半径从「待建」改为「增量维护」。

---

## 2. 任务②：#129 EXP-01×2 验通过标准与签字

### 2.1 run1 有效性裁决：无论结果降级为诊断样本

run1 从 05:40:19 起与复跑并发（load 7.8/4 核），污染窗口覆盖其绝大部分行程（腿预算 ~12–15min）。**严格口径维持 T17 §3.2 前置 2（决定性实验绝不在脏跑道跑）且对称适用、不因结果方向偏袒**：

- 若 run1 ✘ —— 无法区分挤兑 vs 真因（QST-02 同款，T17 F3 先例），作废；
- 若 run1 ✓ —— 也不能直接计为 ×2 之一：EXP-01 卡死检测混用墙钟 timeout 与设计秒预算，低帧率会放大物理步长/改变碰撞采样——**假 ✓ 机制存在**（帧率依赖的碰撞抖动在低 fps 下可能消失）。✓ 只登记为「对抗性负载下的鼓励性诊断」。

**处置**：run1 自然跑完（不 kill，避免半途 SIGINT 再造一份脏数据）→ 结果登记为诊断样本 → 清场（§1.2）+ 真空三查过后重开 **run1'**。

### 2.2 ×2 通过标准（run1' + run2，缺一不过门）

| 项 | 口径 |
|----|------|
| 跑道真空三查（每趟开跑前） | 全 VM 无 chrome-headless/SwiftShader 存活；load 1min **< 2**；除本趟自管 preview 外无任何 astro preview/静态服存活（§1.2 清场后自查） |
| 跑法 | tmux 后台化独占；`/tmp/env-wt` @ `5e41550` 不重建 dist、不换 checkout（T17 F7 near-miss 在册）；日志唯一命名 `env-exp01-run1b.log` / `env-exp01-run2.log`（run1.log 已被污染趟占用，禁复用防混淆） |
| 单趟通过 | `1 passed / 0 failed / 0 skipped / 0 flaky`（world-chromium 串行 project，`--no-deps --grep CITY-EXP-01`），墙钟 ~15min ±5 |
| 三证合一（每趟） | 进程自然退出（EXIT=0 tee 尾行）+ list 末行 `1 passed` + JSON stats `readFileSync` 实读（Node 22 ESM 坑在册） |
| 判读矩阵 | ✓✓ → 过门；✓✘/✘✓ → 第 3 趟定多数 + 查跑道再污染；✘✘ → 判读 B 动摇 → ENV 三候选重裁（候选 a「控制器爬行」主嫌）+ R2 全 HOLD（T17 §3.3 原文维持） |
| 收趟纪律 | 每趟收尾即增量归档 `/tmp/evidence-exp01/`（§1.4），再开下一趟 |

### 2.3 签字门（×2 ✓✓ 后，指挥官一次性签字清单）

1. **测试面改动四处**：ENV explore 改线（#129 内）+ plug explore/observability/perf 三 spec 扩改的处置方案（「#104 rebase 时 EXP-01 区一律取 ENV canonical；OBS-01/PERF-Q2/EXP-02 逐线复核」）——T17 §3.3 扩大版清单原文兑现；
2. **src 改动**：BL1 桩排碰撞带减深（#129 内）；
3. **合流许可**：#129 ready + merge，序位 = #103/#135 之后、plug 栈 rebase 之前（§3）。

签字证据挂 #129 PR 评论 + 看板登记（秘书线单源）；**综合分/其他门不得覆盖本专项门**（AGENTS.md §4.3 口径）。

---

## 3. 任务③：#134 与 #104 合流/rebase 序

### 3.1 全局合流序（对简报「#103→#130→#129→#134 rebase」的两处修正）

| 序 | 动作 | 说明 |
|----|------|------|
| 1 | **合 #103**（即刻，零跑道） | ready/CLEAN/审计 GO #120，第 7 个 tick 复读 |
| 2 | **合 #135 即塌栈**（CI green 后 ready） | **修正一**：#135 commit 集实证包含 #130 tip `f3bc6c2` → 合 #135 则 #130 自动收编关闭，无须先合 #130（先合 #130 不错但多一步且 #135 需再等一轮）。#131/#132/#133/T18/T19 等顾问 docs PR 不在关键路径，指挥官可随时批量收 |
| 3 | **合 #129**（双门过后） | ×2 ✓✓（§2.2）+ 签字（§2.3） |
| 4 | **plug 栈两步走**（§3.2） | **修正二**：不是「#134 rebase」单动作，而是「#134 → #104 分支合并」在前、「#104 整体 rebase」在后，只做一次冲突解决 |

### 3.2 plug 栈两步走（推荐路径 A，单次 rebase 单次冲突解决）

1. **步一：#134 合入 #104 分支**（base `c24c7f3` 不动）——CI 已 SUCCESS、文件域与 #104 冻结 tip 正交（几何 2 文件 + 探针 + 报告）；前置 = **段末审计对 A 案几何内容放行**（探针 §③构图/§④走廊余量双门 PASS 在册；「未授权动工」纪律事件另册登记，不阻内容合流——内容与纪律分账，T17 §2.2 金矿收编同款口径）；
2. **步二：#104 分支整体 rebase onto post-#129 main**——冲突解法预登记：EXP-01 spec 区**一律取 ENV canonical**（timeout 3000 / radius / 腿预算以 ENV 为准，T16 §2.4）；plug 独有 OBS-01/PERF-Q2/EXP-02 改线与去重驶出点改向，逐线按「桩排减深已解毒」复核，能还原走廊基线则还原，不能还原的随 R2 提请签字（#134 PR body 自署「改线去留由段末审计定谳」，口径一致）；
3. **禁则**：不先 rebase #104 再合 #134（双 rebase 双冲突解决，纯浪费）；不在 #129 合入 main 前启动 rebase（白做一遍注定重来的冲突解决）；rebase 由 R2 执行（接管卡 N1–N3 + 本文 §1.4 归档增量职责）。

### 3.3 #104 复活门（维持 draft 禁 ready，三条齐才 ready）

**#129 双门已过 + R2 双清**（plug-eng-wt 未提交几何 stash/patch 存证 + `_scratch-capture.mjs` 走工具转正流程或弃）**+ 全量 e2e 80 例 0 failed/0 skipped/0 flaky**——在「rebase 后的 #104 候选 ⊕ main 集成树」上跑（审计栈上 PR 必自建集成树，AGENTS.md §4.2）。三条即 T17 §5.5 原文，本文无改动、只补执行主体（R2）与集成树口径。

---

## 4. 任务④：Tick#20 预排（≈05:50）与全量 e2e 解锁条件

### 4.1 Tick#20 动作单（按序）

| 序 | 动作 | 口径 |
|----|------|------|
| 1 | 核查 §1.2 清场令执行 | 复跑 C-c 退净 + 双僵尸 preview + 静态服 kill + 五会话收割留痕；未执行则本条升级为 Tick#20 第一优先 |
| 2 | run1 终局登记 | 自然收尾（预计 ~05:53±5）→ 结果按 §2.1 登记为诊断样本；增量归档 run1 日志与 test-results |
| 3 | 放行 run1'（真空三查过后） | ENV 传话包一次发全：run1 降级理由 + §2.2 标准 + F7 前置自查提醒 + plug FB-01 ✓ 情报（#35 正样本）|
| 4 | 合流推进 | #103 即合（第 8 次复读则升级为向指挥官单独催办）；#135 CI green → ready → 塌栈 |
| 5 | R2 派单核对 | 前置 = S1 收割完成 + plug 维持 IDLE；#129 合入前 R2 只做零跑道准备（双清 + rebase 预案 + 归档维护），不碰跑道 |

槽位算术：在途 = ENV（run1'/run2）+ SEC-P9（#135 收尾）+ T18（在途）+ R2（若派）→ ≤4，符合 2–6 约束；重负载串行链锁定 **run1' → run2 →（若需）第 3 趟 → 全量 e2e**，全程单跑道。

### 4.2 全量 e2e 解锁条件（六条全绿才开闸，预计 Tick#22–#24 窗口）

1. **#129 合入 main**（×2 ✓✓ + 签字门，§2）；
2. **#103 + #135（含 #130）塌栈完成**（看板与审计口径落定，零跑道）；
3. **plug 栈两步走完成**（#134 → #104 分支 + rebase onto 新 main + 冲突按 §3.2 预登记解法清仓 + rebase 后门禁 CI green）；
4. **R2 双清落地**（未提交几何存证 + 旁路脚本转正/弃，N2/N3）；
5. **跑道真空 + 归档半径清空**：零 chrome/SwiftShader、load<2、全部僵尸 preview/会话已收割（§1.2）、`/tmp/evidence-exp01` 增量归档完成——全量跑会重写各 worktree test-results，旧证据必须先离开覆写半径（本 tick 灭失事件的直接教训）；
6. **独占窗口与预算**：全量 80 例 ~1.5–2h 独占墙钟，**≥2 轮预算**（AGENTS.md §4.3），0 failed/0 skipped/0 flaky，跑在 #104 候选 ⊕ main 集成树上——此门即 #104 复活门第三条，过门则 #104 ready、W2④ 收口。

### 4.3 登记矩阵四行（照抄，本文不改板）

北极星 **98 / 98 / 90 / 85** vs 生产登记 **80 / 71 / 84 / —**（综合/视觉/功能/性能）；性能未登记显式 **—**，解锁条件 = 真机 human-gate 六腿 → AL-PERF。

---

## 5. 裁决一览（父代理直接执行，按序）

1. **任务① 跑道归属**（§1）：ENV run1 合法但被污染；05:40 复跑 = plug 排队残波（僵尸腿），**立即 C-c 精确清场** + 双僵尸 preview/静态服/五会话收割；纪律事件 #3 尾款 + 证据灭失事件 #1（部分缓解）+ #35 正样本（FB-01 ✓）+ ENV 轻微违纪四条交秘书线登记；归档 351M 已由 T19 落地（第 7 次逾期清账）。
2. **任务② #129 双门**（§2）：run1 无论结果降级诊断样本；×2 = run1'+run2，每趟真空三查 + 三证合一 + `1 passed/0/0/0`；✓✓ 后指挥官一次性签字（测试面四处 + BL1 src + 合流许可）。
3. **任务③ 合流序**（§3）：#103 即合 → #135 塌栈（含 #130，免单合）→ #129 双门过即合 → plug 栈两步走（先 #134 入 #104 分支、后单次 rebase 取 ENV canonical）；#104 复活门三条维持，禁提前 rebase。
4. **任务④ Tick#20 预排**（§4）：五动作单（清场核查 / run1 登记 / run1' 放行 / 合流推进 / R2 派单核对）；全量 e2e 六条解锁清单，开闸窗口预计 Tick#22–#24。

---

*本文档为 CC-LOOP-ADVISOR-T19 Tick#19 交付物；登记看板不在本文更新，由秘书线单源维护。*
