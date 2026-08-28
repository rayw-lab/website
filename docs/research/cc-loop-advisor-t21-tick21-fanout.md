# CC-LOOP-ADVISOR-T21 · Tick#21 扇出裁决（fanout）

- **顾问**：CC-LOOP-ADVISOR-T21（model slug: `claude-fable-5-thinking-xhigh`）
- **取证窗口**：2026-08-28 06:01–06:08 UTC，全部一手取证（ps 谱系 + 启动命令全文实读 / tmux ls + capture-pane / /tmp 与 test-results mtime 全 ISO / run1 tee 日志与 rerun 日志全文 / `/tmp/fps-probe.mjs` 源码实读 + PROBE_RESULT 实读 / gh pr list + view 103/135 checks / git ls-remote 全量 + fetch main / uptime ×2 / T19 #137 与 T20 #138 交付文档全文实读）
- **基线**：main @ `88097f9`（fetch 实测无新合入）
- **纪律**：零 `src/` 改动；独立 worktree `/tmp/t21-wt`（base = origin/main）；本文档不写看板，登记由秘书线单源（`docs/research/cyber-city-score-loop-orchestration.md`）
- **本 tick 大事**：① **run1 收轮三证变二证**：`RUN1_EXIT=0` + list 行 `1 passed (19.7m)` 在案，但 06:02:42 的 run2 启动命令**内嵌 `rm -rf /tmp/env-wt/test-results`**，把 run1 的 JSON stats 第三证 + 三张剧本截图 + session-dump 全部灭失——**证据灭失事件 #2**（T21 顾问 06:05 抢救 playwright-report 527KB + tee 日志入 `/tmp/evidence-exp01/run1-diagnostic/` 540K，部分缓解）；② **run2 开跑即违真空三查**：开跑时刻全 VM 有 fps 探针 chrome-headless/SwiftShader 存活、load 2.44>2、三路非自管 preview/静态服存活——run2 与 run1 同判**诊断样本，不计 ×2**（§1）；③ **假 ✓ 机制首个定量实锤**：父代理 fps 探针 06:07:50 出数 `fps=0.399 / designRatePerWallS=1.0225`——0.4 帧/秒下设计秒仍按墙钟速率累积（每帧 ≈2.5 设计秒的巨步物理），T19 §2.1 判定从「机制存在」升级「机制实测」（§1.2）；④ **跑道互斥令立法**：探针与 ×2 决定性趟并发 = 编排层自身成为污染源——×2 趟在飞期间全 VM 禁起任何 chrome 级活动，父代理同样受约束（§2.2）；⑤ #135 塌栈拖欠 1 tick（CI SUCCESS/CLEAN 仍 draft）、#103 第 9 次复读、R2 第 4 个 tick 未派、P10 本 tick 3n 界点应派（§3/§4）

---

## 0. 事实核查——八条推翻/超越 Tick#21 简报的 fresh 事实

| # | 简报口径 | 实测（06:01–06:08 UTC） | 证据 |
|---|---------|------------------------|------|
| **F1** | 「T20 顾问 RUNNING」 | **已交付**：draft PR [#138](https://github.com/rayw-lab/website/pull/138) OPEN，远端分支 `cursor/cc-loop-advisor-t20-5b71` 在案——T20 六项裁决（清场第一优先/run1 零杀点阶梯/三叉重写/#135 塌栈/催办升级/解锁链刷新）即时生效，本文在其基线上作业 | gh pr list + ls-remote |
| **F2** | 「ENV run1 ✓ 19.7m · RUN1_EXIT=0」 | 成立且叉 A 兑现：05:38:04–05:57:45，四腿全过（②驾驶 +1 05:51:33 / ④reload 还原 05:57:40 截图为证）——按 T19 §2.1 登记「污染跑道 ✓ = 对抗性负载下的鼓励性诊断」，不计 ×2 | tee 日志全文 + 06:02:14 ls 实录 |
| **F3** | 「已 resume ENV 跑 run1'+run2」 | **run1' 命名未用、直接起 run2 且启动即毁证**：06:02:42 tmux `env-exp01-run2` 建立，启动命令内嵌 `rm -rf /tmp/env-wt/test-results` → run1 的 `e2e-results.json`、`explore-first/second-discover.png`、`explore-restored.png`、`session-dump-explore.json` 全灭（06:02:14 ls 实录五件俱在，06:03 复读 ENOENT）——**证据灭失事件 #2**，三证降二证；T21 顾问 06:05 抢救残存 `playwright-report`（index.html 527KB @05:57:45，run2 结束前不会被覆写）+ tee 日志 + README 时间线入 `/tmp/evidence-exp01/run1-diagnostic/`（540K） | ps 74316 启动命令全文 + 双次 ls + ENOENT 实测 |
| **F4** | （简报未及） | **run2 开跑即违真空三查（三项全违）**：开跑时刻（06:02:42）① fps 探针 #1 chrome-headless+SwiftShader 存活（06:01:31 起，06:02:14 ps 实录谱系 73406/73418–73465）；② load 1min 2.44 > 2；③ 三路非自管服务存活（4475 fxn preview / 4610 main-preview / 4507 plug-serve）——按 T19 §2.2 预登记门（对称严格、不因结果偏袒），**run2 同判诊断样本，不计 ×2 正趟** | ps + uptime + tmux ls |
| **F5** | （简报未及） | **探针运营与 run2 并发进行时**：探针 #2 于 06:04:36 起跑（`/tmp/fps-probe.mjs`，挂载→变形→driving→120s 采样），06:05:50–06:07:50 采样窗与 run2 驾驶腿正面重叠；run2 腿① 截图 06:04:14 落盘于探针 #1/#2 窗口之间；06:08:13 load 冲回 **6.61**/4 核——污染贯穿 run2 前半程 | probe-plug.log 时间戳 + test-results mtime + uptime |
| **F6** | （简报未及） | **假 ✓ 机制定量实锤**：`PROBE_RESULT {fps:0.399, frames:48/120.4s, designDeltaS:123.11, designRatePerWallS:1.0225, wallSecondsFor30DesignS:29, quality:0→0}`——极端争用下渲染 0.4 fps，设计秒照常 1.02×墙钟累积（单帧 ≈2.5 设计秒巨步）→ 碰撞采样稀疏化/隧穿风险实测成立，T19「低帧率假 ✓ 机制」由推断转实证；**副作用告警**：该绝对 fps 是对抗窗口读数，无 A/B 基线意义，A/B 结论必须真空窗重测，本轮唯一可信读数是 designRate≈1.02 的机制性结论 | /tmp/probe-plug.log PROBE_RESULT + fps-probe.mjs 源码 |
| **F7** | 「父代理已清 plug 残波」 | 成立（rerun 05:53:27 封口，pane 尾 `EXP01_EXIT=0` 无结果行 = 中断退出留痕）；但**清场令其余项第 3 个 tick 拖欠**：12388（4475）/70318+70331（4610）/plug-serve（4507）存活，六会话（`x2-triage-verify`/`fxn-codex-preview`/`plug-preview`/`plug-build`/`x2-e2e`/`main-preview`）零收割；main-preview 用途出土解谜（T20 F5）：疑为探针 A/B 之 A 腿（main 基线）基础设施——推断项，待父代理自证 | capture-pane + tmux ls + ps |
| **F8** | 「#103/#135 未合；#134 plug IDLE；#104 禁 ready」 | 全部成立并加码：#103 ready/**CLEAN**/MERGEABLE/CI SUCCESS——**第 9 次复读**（T20 已升格指挥官单独催办件，仍未执行）；#135 CI **SUCCESS**/CLEAN 仍 draft——**T20「本 tick 塌栈」拖欠 1 tick**；#130 仍 OPEN；R2 远端零分支（**第 4 个 tick 未派**）；`cursor/cc-loop-sec-p10-*` 零分支（P10 未派，本 tick 3n=21 界点应派） | gh pr view 103/135 --json checks + ls-remote 全量 |

---

## 1. 任务①：run1 ✓ 但污染——放行口径（×2 门第二次重锚，必须 ✓✓ 干净趟）

### 1.1 run1 终局登记（叉 A 兑现，口径不变）

登记「**污染跑道 ✓ · 鼓励性诊断**」：19.7m 四腿全过、`RUN1_EXIT=0`、list 行 `1 passed`——在 load 峰值 7.81 的对抗负载下全剧本走通，#129 改线+减深的先验再抬一格；但 F6 已把假 ✓ 机制从推断做成实测（0.4 fps 下设计秒照跑），**污染趟 ✓ 的证词效力有实证上限，禁折算 ×2**。证据面：三证降二证（F3），残证归档 `/tmp/evidence-exp01/run1-diagnostic/`。

### 1.2 ×2 门重锚（run1 与 run2 双双出局，×2 = 未来两趟干净趟）

| 项 | 口径（T19 §2.2 全文维持 + 本 tick 两条增补） |
|----|------|
| 干净趟定义 | 开跑前真空三查全过（零 chrome-headless/SwiftShader；load 1min<2；除自管 preview 外零 astro preview/静态服）**+ 新增：全程跑道互斥**——趟在飞期间全 VM 禁起任何 chrome 级活动（探针/截图/LHCI/preview 一律排队），父代理自身同受约束（F5 直接教训） |
| 命名令 | run1/run1b（未用即作废）/run2 三个标签已烧毁；干净趟一律 **`env-exp01-run3.log` / `env-exp01-run4.log`**（tmux 会话同名），登记双标签「run3 = 干净趟#1」「run4 = 干净趟#2」防混记——防止「run1(污染✓)+run2(✓)」被误读成 ✓✓ |
| archive-then-clean 铁则 | **启动命令永久禁嵌 `rm -rf test-results`**（证据灭失事件 #1/#2 同型根因）；固定序：①归档上一趟 test-results+playwright-report+tee 日志入 `/tmp/evidence-exp01/<趟名>/` → ②真空三查 → ③才允许清 test-results 并开跑 |
| 单趟通过/三证/判读矩阵 | `1 passed/0/0/0` + 三证合一（EXIT 尾行 / list 末行 / JSON stats `readFileSync`）+ ✓✓ 过门、✓✘ 第 3 趟、✘✘ 判读 B 动摇（T17 §3.3 回炉树）——原文维持，锚点后移至 run3/run4 |
| 签字门 | T19 §2.3 一次性签字清单（测试面四处 + BL1 src + 合流许可）不变；✓✓ 最早 ~07:20（§2.4 推演）→ #129 合流窗顺延 Tick#29–30 |

**裁决措辞（供传话包直引）**：run1 = 对抗趟诊断 ✓；run2 = 探针并发趟，无论结果同判诊断（✓ 则为第二个鼓励样本，✘ 则归因作废不触发回炉）；**×2 计趟从 run3 起算，✓✓ 干净趟是 #129 ready/merge 的唯一放行口径，综合分与任何诊断样本不得覆盖本专项门**。

---

## 2. 任务②：run2 监控与 Tick#22 动作

### 2.1 run2 在飞处置（勿杀令延续，阶梯照 T20 §1.2 平移）

| 时点（UTC） | 含义 | 父代理动作 |
|------------|------|-----------|
| ~06:22–06:27 | 自然收轮窗（19.7m 基准 + 争用拖长余量；腿① 06:04:14 已过） | 收割三证（`RUN2_EXIT=` 尾行 + list 末行 + 新 test-results JSON 实读）；**先归档 `/tmp/evidence-exp01/run2-diagnostic/` 再做任何清理** |
| 06:53±1 | cap 自终止点（`test.setTimeout(3_000_000)`，test 起点 ≈06:03:1x） | 无动作，等 tee 尾行照常收三证 |
| **07:00** | 未退 = 异常候选 | 只取证不动手：capture-pane + ps 谱系存档 |
| **07:05** | 仍未退 = 收割点 | 精确 PID 收割 chrome 谱系（74649 worker 及其 chrome 子代），绝不 pkill；cap 后尸体豁免，不违勿杀令 |

判活口径照旧：`/tmp/env-wt/test-results` 与 `.playwright-artifacts-0` mtime 为准，双零增长 ≥25min 候选 / ≥35min 升级，动作只到取证。

### 2.2 跑道互斥令（本 tick 立法，立即生效）

1. **run2 在飞期间零新探针**：探针 #2 已于 06:07:50 出数自退，PROBE_RESULT 已在 `/tmp/probe-plug.log`——归档入 `/tmp/evidence-exp01/probe/` 即可，**A/B 后续腿（含 main 4610 腿）一律推迟到 ×2 双趟收轮之后的空档执行**；
2. 探针排程规则：真空窗内跑（与 ×2 趟同等的三查），且 A/B 双腿同窗背靠背（跨窗对比无效——F6 副作用告警）；
3. 违令即登记：×2 趟在飞期间出现任何新 chrome 谱系 → 该趟当场降级诊断样本 + 违纪主体入执行力账。

### 2.3 Tick#22 动作单（按序）

| 序 | 动作 | 口径 |
|----|------|------|
| 1 | **互斥令生效核查** | ps 复核零新探针/chrome；探针 #2 谱系退净确认；PROBE_RESULT 归档 |
| 2 | **run2 收轮** | §2.1 阶梯；三证 + `run2-diagnostic/` 归档（先归档后清理）+ 诊断登记（F4 口径） |
| 3 | **全清场（第 4 个 tick，最后通牒）** | T20 §1.1 六步 + 增补：kill 12388（4475）/ 70318 谱系（4610）/ plug-serve（4507）；六会话 capture 留痕后 kill-session；勿动 run2 谱系直至收轮 |
| 4 | **真空三查 → 放行 run3（干净趟#1）** | 传话包一次发全：§1.2 全表（互斥令 + 命名令 + archive-then-clean 模板）+ F6 机制实证情报 + 三前置自查（ENV 已两次跳门在案） |
| 5 | **#103/#135 清账** | #103 第 10 次复读（催办件仍挂指挥官）；#135 un-draft → merge → #130 自动收编复核（T20 §4.2 原文，拖欠 1 tick 入执行力账） |
| 6 | **P10 派单（若本 tick 未派）+ R2 终核** | P10 见 §3；R2 第 4 个 tick 未派入执行力账，若派则首批全零跑道（N2/N3 双清 + rebase 预案），#129 合流前不碰跑道 |

**槽位算术**：在途 = ENV（run2 收尾→run3）+ P10 + R2（若派）+ T21 本尊（交付即 IDLE）→ 2–4 路，符合 2–6 约束；重负载串行链锁定 **run2 收轮 → run3 → run4 →（若需）第 5 趟 → 全量 e2e**，全程单跑道 + 互斥令。

### 2.4 里程碑推演（干净路径）

run2 收轮 ~06:25 → 归档+全清场+沉降 ~06:35 → 真空三查 → **run3** 06:38–06:58 → 归档+复查 → **run4** 07:03–07:23 → ✓✓ ~07:25 → 签字门（指挥官一次性清单）→ **#129 合流最早 Tick#29–30**（07:20–07:30）。任何一趟 ✘ 或再污染，整链顺延一趟（~25min/趟）。

---

## 3. 任务③：SEC-P10 要点（3n 界点 Tick#21 = 3×7，本 tick 派单）

### 3.1 派单口径

- **分支策略**：#135 未合（F8）→ P10 开新分支 `cursor/cc-loop-sec-p10-5b71`，**base = P9 分支尖 `5f801b7`**（看板单源连续性，避免同文件对 main 冲突；照 P8→P9 叠 #130 head 同款形态）；若读单时 #135 已合，则 base = 合流后 main。**禁止直接往 #135 分支追加 commit**（会重置其绿 CI、进一步拖延塌栈）；
- **纪律**：零业务代码、docs-only；唯一写入点 = `docs/research/cyber-city-score-loop-orchestration.md`；模型 `claude-fable-5-thinking-xhigh`。

### 3.2 增量登记件清单（存量 + 本 tick 新增）

**T19/T20 存量七件**：纪律事件 #3 尾款（排队残波）/ 证据灭失事件 #1（部分缓解）/ #35 正样本（FB-01 ✓）/ ENV 轻微违纪（前置③跳门）/ 清场令拖欠曲线（05:47 下达 → 逐 tick 时间戳）/ main-preview 清单外占用 / #103 催办升级（第 8 次触发）。

**T21 新增八件**：
1. run1 终局：污染跑道 ✓ · 19.7m · 鼓励性诊断（不计 ×2）；
2. **证据灭失事件 #2**：run2 启动命令内嵌 `rm -rf` 毁 run1 三证之 JSON+截图（06:02:42）；顾问抢救 540K 残证（`run1-diagnostic/`）；**archive-then-clean 立铁则**；
3. run2 抢跑违纪：未过真空三查即开跑（三项全违，F4）+ 未按 run1b 命名——ENV 三前置第三次跳门，违纪曲线升级；
4. **跑道互斥令立法**（§2.2）+ 探针并发运营事件（父代理自身为主体，F5）；
5. **假 ✓ 机制实证**：PROBE_RESULT fps 0.399 / designRate 1.0225（F6）——挂 #129 证据链与全量段判读参考；
6. #135 塌栈拖欠（T20 裁决 → 本 tick 未执行）+ #103 第 9 次复读；
7. R2 第 4 个 tick 未派（执行力账）；
8. T20 交付确认（[#138](https://github.com/rayw-lab/website/pull/138)）+ 本文交付登记。

登记矩阵四行照抄（文末），P10 不改口径。

---

## 4. 任务④：全量 e2e 解锁链复读（六条，Tick#21 状态刷新）

| # | 条件 | Tick#21 实测状态 | 责任位 |
|---|------|-----------------|--------|
| 1 | #129 合入 main（×2 ✓✓ + 签字门） | **仍零干净趟**：run1/run2 两趟诊断样本烧掉 ~40min 跑道；×2 重锚 run3/run4（最早 ✓✓ ~07:25）——链上最长杆再加长 | ENV + 指挥官签字 |
| 2 | #103 + #135（含 #130）塌栈 | **双绿双 CLEAN 在案（F8），唯一即刻落袋项**——#103 第 9 次复读（催办件挂指挥官）、#135 拖欠 1 tick，零跑道零冲突 | 父代理/指挥官 |
| 3 | plug 栈两步走（#134→#104 分支 → 单次 rebase 取 ENV canonical） | 待 #129；#134 draft/MERGEABLE 维持，前置 = 段末审计对 A 案几何放行（审计未派） | R2 + 段末审计 |
| 4 | R2 双清（未提交几何存证 + `_scratch-capture.mjs` 转正/弃） | R2 第 4 个 tick 未派（F8）——零跑道项，与 run3/run4 完全并行无冲突 | R2 |
| 5 | 跑道真空 + 归档半径清空 | 清场拖欠第 3 tick（F7）；归档增量：`run1-diagnostic/` 540K 已落（本顾问）、run2 收轮待补、probe 日志待归档 | 父代理 |
| 6 | 独占窗口 ≥2 轮全量预算（80 例 0/0/0，跑「#104 候选 ⊕ main 集成树」） | 尾门不变；1.5–2h/轮 ×2 轮，**互斥令同样适用于全量窗** | R2 + 段末审计 |

**开闸窗口推演**：T20 估 Tick#23–#25 → 两趟诊断烧道 + 塌栈/清场拖欠累积 → 顺延 **Tick#29–#31**（#129 合流 07:20–07:30 后接 plug 两步走与 R2 双清）；关键路径不变 = 条件 1；条件 2 每拖一个 tick，开闸日排队多一分——**本 tick 落袋成本最低**。

---

## 5. 裁决一览（父代理直接执行，按序）

1. **×2 门第二次重锚（§1.2）**：run1 = 对抗趟诊断 ✓、run2 = 探针并发趟同判诊断——✓✓ 干净趟（run3+run4）是 #129 唯一放行口径；命名令（run3/run4 双标签）+ archive-then-clean 铁则（启动命令永久禁嵌 `rm -rf`）即日生效。
2. **跑道互斥令立法（§2.2）**：×2 趟在飞期间全 VM 禁起任何 chrome 级活动（父代理自身同受约束）；探针 A/B 推迟到双趟收轮后的真空空档、双腿同窗背靠背；违令趟当场降级。
3. **run2 勿杀 + 阶梯（§2.1）**：06:22–06:27 自然收轮 / 06:53 cap / 07:00 取证 / 07:05 精确收割；收轮先归档 `run2-diagnostic/` 再清理。
4. **Tick#22 动作单（§2.3）**：互斥令核查 → run2 收轮 → 全清场（第 4 tick 最后通牒）→ 真空三查放行 run3 → #103/#135 清账 → P10 派单 + R2 终核。
5. **#103/#135（§4 条件 2）**：#103 催办件维持挂指挥官（第 9 次复读）；#135 un-draft → merge → #130 自动收编——T20 裁决拖欠 1 tick，本 tick 落袋成本最低。
6. **SEC-P10（§3）**：base = `5f801b7`（#135 未合形态），八件新增登记 + 七件存量续账；禁往 #135 分支追加 commit。
7. **假 ✓ 机制实证入档（F6）**：PROBE_RESULT 挂 #129 证据链；绝对 fps 无 A/B 基线意义的告警随档；designRate≈1.02 为唯一可信机制读数。

---

## 登记矩阵四行（看板单源，照抄不改口径）

北极星 **98 / 98 / 90 / 85** vs 生产登记 **80 / 71 / 84 / —**（综合/视觉/功能/性能）；性能未登记显式 **—**，解锁条件 = 真机 human-gate 六腿 → AL-PERF。

---

*本文档为 CC-LOOP-ADVISOR-T21 Tick#21 交付物；登记看板不在本文更新，由秘书线单源维护。*
