# CC-LOOP-ADVISOR-T20 · Tick#20 扇出裁决（fanout）

- **顾问**：CC-LOOP-ADVISOR-T20（model slug: `claude-fable-5-thinking-xhigh`）
- **取证窗口**：2026-08-28 05:50–05:55 UTC，全部一手取证（ps 谱系 + 父链回溯 / tmux ls / /tmp 与 test-results mtime 全 ISO / find -newermt 活性探针 / gh pr view+list+checks / git ls-remote + merge-base --is-ancestor / uptime / T18 #136 与 T19 交付文档全文实读）
- **基线**：main @ `88097f9`（fetch 实测无新合入）
- **纪律**：零 `src/` 改动；独立 worktree `/tmp/t20-wt`（base = origin/main）；本文档不写看板，登记由秘书线单源（`docs/research/cyber-city-score-loop-orchestration.md`）
- **本 tick 大事**：① **T19 已交付而非 RUNNING**——`88f847b` 已推送、draft PR [#137](https://github.com/rayw-lab/website/pull/137) 在案，其裁决（run1 无论结果降级诊断样本 + 清场令 + ×2 重锚 run1'+run2）对本 tick 生效 → **简报所携 T18 三叉预案整树作废重写**（§2）；② **清场令拖欠一个 tick**：05:52 实测排队残波复跑仍在跑（worker 67320，elapsed 12:22）、双僵尸 preview（12388/46251）与五个陈旧会话全数存活，load **7.21/4 核**，且新增第六占用 `main-preview`（05:46，port 4610，不在 T19 清单）——清场令升级 Tick#20 第一优先 + 执行力曲线追账（§1.1）；③ **run1 活性确认**：`explore-second-discover.png` 05:51:33 落盘（驾驶腿 +1 完成 ≈ 剧本 ⅔），trace 资源持续写至 05:54+，cap 自终止点 ≈06:28±1——**全程无一杀点，勿杀令兑现路径 = 等 cap**（§1.2）；④ **#135 CI 转绿**（门禁 pass 4m51s）+ `f3bc6c2 ∈ #135` merge-base 复核 ✓ → 塌栈**本 tick 即可执行**；#103 **第 8 次复读** → 按 T19 §4.1 预设阈值**升级为向指挥官单独催办件**（§4）；⑤ R2 远端零分支实测 → 大概率仍未派，第 3 个 tick 未派入执行力账（§3.1）

---

## 0. 事实核查——八条推翻/超越 Tick#20 简报的 fresh 事实

| # | 简报口径 | 实测（05:50–05:55 UTC） | 证据 |
|---|---------|------------------------|------|
| **F1** | 「T19 顾问 RUNNING」 | **已交付**：`/tmp/t19-wt` @ `88f847b` 已推送 origin，draft PR [#137](https://github.com/rayw-lab/website/pull/137) OPEN——T19 五项裁决（run1 降级 / 清场令 / ×2 标准 / #135 塌栈序 / plug 栈两步走）即时生效，本文全程在其基线上作业 | git status/log + ls-remote + gh pr list |
| **F2** | 「T18 三叉预案：run1 ✓✓ → 合流 tick / run1 ✘ → 停 run2 回炉」 | **前提已被 T19 推翻**：run1 自 05:40:19 起被排队残波并发污染（T19 F1，load 峰值 7.81），**无论结果降级诊断样本**（✘ 无法归因 / ✓ 存在低帧率假 ✓ 机制）——×2 门重锚 **run1' + run2**，run1 不计趟 | T19 §2.1 原文 + 本 tick load 7.21 复核 |
| **F3** | 「run1 ✘ → 停 run2」 | **无可停之 run2**：当前不存在排队中的 run2；与 run1 并发的那路（/tmp/plug-wt，tee `/tmp/exp01-rerun.log`）是 T19 F2 已定性的**排队残波（僵尸腿）**，无论 run1 结果如何一律 C-c 清场；×2 阶梯里的 run2 是清场后的未来干净趟 | ps 父链（45978→67274→67320）+ T19 F2 |
| **F4** | 「plug IDLE #134」 | 成立（#134 draft/MERGEABLE 维持），但 **T19 清场令全项未执行**：残波复跑存活（67320 elapsed 12:22）、僵尸 preview 12388（port 4475，2h47m）+ 46251（port 4599，1h04m）存活、`x2-triage-verify`/`fxn-codex-preview`/`plug-preview`/`plug-build`/`x2-e2e` 五会话在册未收割 | ps -p 实测 + tmux ls |
| **F5** | （简报未及） | **第六占用出土**：tmux `main-preview`（05:46:05 建，astro preview port 4610，cwd `/tmp/main-wt`）——不在 T19 §1.1 占用清单，属清单外新增；真空三查口径下 run1' 开跑前必须收割（留痕后 kill，重建成本 ~20s） | tmux ls + /tmp/main-preview.log 实读 |
| **F6** | 「run1 仍 RUNNING」 | 成立且**健康推进**：worker 66564 elapsed 14:37；剧本进度 = ①首发现 05:39 ✓ → ②驾驶 +1 05:51:33 ✓（`explore-second-discover.png` 475KB）→ 余 ③重复进圈去重 + ⑤reload 持久还原两腿；trace 资源持续落盘至 05:54+，双零增长判活零触发 | test-results mtime + find -newermt 05:50 |
| **F7** | 「#103/#135 未合」 | 成立但**双双转熟**：#103 ready/CLEAN/MERGEABLE/CI SUCCESS/审计 GO #120——**第 8 次复读，触发 T19 预设的催办升级阈值**；#135 门禁 **pass**（4m51s，run 33145610597），且 `git merge-base --is-ancestor f3bc6c2 origin/cursor/cc-loop-sec-p9-5b71` 实测 **YES** → #130 收编塌栈一步走成立，本 tick 零跑道即可执行 | gh pr view/checks + merge-base 实测 |
| **F8** | （简报未及） | **R2 大概率未派**：origin 全分支实测无 R2 命名分支（仅存量 `cc-vis-x2-plug-5b71`/`cc-vis-x2-facade-r2-1d6f` 等）；T18 F6 判「前置满足即派」、T19 §4.1-5 复核——至本 tick 为**第 3 个 tick 未落地**，入执行力账（面板 API 本 worktree 不可及，终态由父代理面板复核） | git ls-remote 全量 |

---

## 1. 任务①：run1 长跑阈值与父代理动作

### 1.1 动作 T0（本 tick 立即，先于一切监控）——执行 T19 清场令 + 一条增补

**顺序固定（留痕先行，证据灭失事件 #1 的直接教训）**：

1. **留痕**：`tmux capture-pane -t x2-triage-verify` 全量存档 + 拷贝 `/tmp/exp01-rerun.log` 与 `/tmp/plug-wt/test-results`（若有新件）入 `/tmp/evidence-exp01/`；
2. **C-c 残波**：send-keys `C-c` 至 `x2-triage-verify`（playwright 收 SIGINT 自拆浏览器）；30s 复核 67274/67303/67320 及其 chrome 谱系（67332–67379）退净，残留按 PID kill；
3. **杀双僵尸 preview**：`kill 46251`（port 4599 孤儿）、`kill 12388`（port 4475 stale）；
4. **增补（F5）**：capture 留痕后 kill-session `main-preview`（port 4610）——T19 清单外新占用，真空三查的直接障碍；
5. **收割五会话**：`x2-triage-verify`/`fxn-codex-preview`/`plug-preview`/`plug-build`/`x2-e2e` capture 留痕后 kill-session；
6. **勿动**：`env-exp01-run1` 全谱系（66257/66498/66510/66564/preview 66540/chrome 66576–66620）与父代理监控 sleep（70816）。

**执行力登记**：清场令 T19 05:47 下达 → 本 tick 05:52 实测零执行，**拖欠 1 个 tick**；与 TRIAGE/归档双逾期同列「裁决链完整、执行链断裂」曲线（T18 已升格先例），交秘书线续账。C-c 残波的即时收益：释放 ~2 核，run1 剩余两腿提速收轮（虽仍不改其诊断样本定性）。

### 1.2 run1 阈值阶梯（全程无主动杀点，勿杀令的兑现路径 = 等 cap 自终止）

| 时点（UTC） | 含义 | 父代理动作 |
|------------|------|-----------|
| ~06:00–06:15 | 成功路径自然收轮窗（②腿 05:51 完成，余 ③去重 + ⑤reload 重挂载；残波 C-c 后提速） | 收割三证：`RUN1_EXIT=` tee 尾行 + list 末行 + JSON stats `readFileSync` 实读（Node 22 ESM 坑在册） |
| 06:28±1 | **cap 自终止点**：`test.setTimeout(3_000_000)`（3,000s，test 起点 ≈05:38:10–40）——playwright 自杀该用例，进程自然退出 `RUN1_EXIT=1` | 无动作，等 tee 尾行；随后照常收割三证（timeout 也是终局） |
| ~06:31–06:33 | cap + teardown + 报告落盘的最迟自然退出 | 无动作 |
| **06:35** | 未退 = **异常候选**（收尾挂死/chrome 尸体） | 只取证不动手：capture-pane + ps 谱系存档 |
| **06:40** | 仍未退 = 收割点 | 取证完备后**精确 PID** 收割 chrome 谱系（66576–66620），绝不 pkill；此为 cap 后尸体豁免，不违「勿杀 run1」（勿杀语义 = 不提前终止在飞实验） |

**判活口径**：日志静默是设计使然（list reporter 收轮才打印，tee 只见 NO_COLOR 警告）——活性信号以 `test-results/` 与 `.playwright-artifacts-0/traces/resources/` mtime 为准；双零增长 ≥25min 候选 / ≥35min 升级维持 T18 阈值，但升级动作同样只到取证，杀点仍锁 06:40 阶梯。

### 1.3 收轮即办（先于 run1' 一切动作）

1. **增量归档**：`/tmp/env-exp01-run1.log` + `/tmp/env-wt/test-results` + `/tmp/exp01-rerun.log` 拷入 `/tmp/evidence-exp01/`（T19 §1.4 增量代办；run1' 会清写 test-results，旧证据必须先离开覆写半径）；
2. **诊断登记**：结果按 §2 分叉登记为诊断样本（非 ×2 计趟），交秘书线；
3. **真空三查**（run1' 前置）：全 VM 零 chrome-headless/SwiftShader；load 1min **< 2**（C-c + 收轮后预留 ~5min 沉降）；除 run1' 自管 preview 外零 astro preview/静态服（§1.1 清场后自查，含 F5 增补项）。

---

## 2. 任务②：run1 结局三分叉后续（T19 基线重写版——run2 / 合流 / 回炉）

**总则**：三叉共同点 = run1 不计 ×2 趟、残波无条件清场、后续一律走「清场 → 真空三查 → run1'」。简报原树「✓✓ → 合流 / ✘ → 停 run2 回炉」两个动作词全部失效：合流最早也在 run1'+run2 双绿之后；回炉裁决**推迟一趟**，重锚到干净跑道证据上。

### 2.1 叉 A：run1 ✓（对抗性负载下的鼓励性诊断）

- 登记「污染跑道 ✓」——不作 ×2 计趟（低帧率放大物理步长/改变碰撞采样的假 ✓ 机制在册，T19 §2.1）；但作为情报：对抗负载下全剧本走通，#129 改线 + 减深的**先验再抬一格**；
- 动作链：收割三证 → §1.3 归档 → 真空三查 → **放行 run1'**（tmux 后台化独占，`/tmp/env-wt` @ `5e41550` 不重建 dist 不换 checkout，log 唯一命名 `env-exp01-run1b.log`——run1.log 已被污染趟占用禁复用）→ run1' ✓ 则续 run2（`env-exp01-run2.log`）；
- 里程碑推演：run1' ~06:05–06:25 / run2 ~06:25–06:45 → ✓✓ 后签字门（T19 §2.3 扩大清单：测试面四处 + BL1 src + 合流许可，一次性签字）→ **合流 tick 最早 Tick#22**。

### 2.2 叉 B：run1 ✘（归因作废，回炉裁决推迟一趟）

- 登记「污染跑道 ✘ · 归因作废」——挤兑与真因不可区分（QST-02 同款先例，T17 F3）；**不触发回炉三候选、不 HOLD R2 零跑道准备**；
- 必做取证：error-context 卡点坐标存档（若再现 (19.5,-32.9) 桩带东面签名则单独标注）；
- 动作链与叉 A 完全一致：清场 → 真空 → run1'。**回炉判据重锚**：run1' 在干净跑道 ✘ → 视同 ×2 首趟 ✘，若 run2（或第 3 趟）再 ✘ 成 ✘✘ → 判读 B 动摇 → ENV 三候选重裁（候选 a「控制器爬行」主嫌，@1km/h 卡速签名相容）+ R2 全 HOLD + EXP-01 ✘ 证据链升格「几何论失效」（T18 §4.2 兜底树原文维持，仅锚点后移一趟）。

### 2.3 叉 C：run1 cap 超时 / 双零增长挂死

- cap 自终止（06:28±1）：登记「污染跑道 timeout · 作废」，续走叉 B 动作链；
- 挂死走 §1.2 阶梯（06:35 取证 / 06:40 精确收割）；收割后**额外核查** chrome 谱系与 preview 4620 退净，方可起真空三查；
- 特别项：timeout 趟的 trace（retain-on-failure）是三腿预算校准的输入——归档必保件。

---

## 3. 任务③：Tick#21 预排（≈06:00）与全量 e2e 解锁链

### 3.1 Tick#21 动作单（按序）

| 序 | 动作 | 口径 |
|----|------|------|
| 1 | **清场核查**（若本 tick 仍未执行则第一优先 + 执行力曲线第 2 拖欠点上板） | §1.1 六步逐项复核：残波退净 / 双僵尸 preview / main-preview（F5）/ 五会话收割留痕 |
| 2 | **run1 收割或续监控** | 06:00–06:15 窗内大概率收轮：三证 + §1.3 归档 + 诊断登记；未收则按 §1.2 阶梯静候（cap 06:28 心中有数，零杀点） |
| 3 | **放行 run1'**（真空三查过后） | ENV 传话包一次发全：run1 降级理由 + ×2 标准（T19 §2.2 表）+ F7 三前置自查 + FB-01 正样本情报 + log 命名 `env-exp01-run1b.log` + 收趟即增量归档 |
| 4 | **#103/#135 合流确认** | 本 tick（§4）若已合 → 登记合流时间戳；未合 → #103 催办件升格「指挥官单独催办」（第 9 次复读），#135 同 batch 复读 |
| 5 | **R2 派单终核** | F8 零分支在案：若父代理面板复核确未派 → **第 3 tick 未派入执行力账并即派**；派后首批动作全零跑道（双清 N2/N3 + rebase 预案 + 归档维护），#129 合流前不碰跑道 |
| 6 | **P10 秘书线（3n 界点：Tick#21 = 3×7）** | 照 P9 形态：接管 P9 分支或视 #135 合流态开新分支；增量登记件见 §3.3 |

槽位算术：在途 = ENV（run1 收尾→run1'）+ R2（若即派）+ P10（Tick#21 派）+ T20 本尊（交付即 IDLE）→ **2–4 路**，符合 2–6 约束；重负载串行链锁定 **run1' → run2 →（若需）第 3 趟 → slot#3 QST-02 单例 → 全量**，全程单跑道。

### 3.2 全量 e2e 解锁链（T19 六条，本 tick 状态刷新）

| # | 条件 | Tick#20 实测状态 | 责任位 |
|---|------|-----------------|--------|
| 1 | #129 合入 main（×2 ✓✓ + 签字门） | **未启动 ×2**（run1 诊断趟在飞；run1' 最早 ~06:05 起跑）——链上最长杆 | ENV + 指挥官签字 |
| 2 | #103 + #135（含 #130）塌栈 | **双绿已熟，本 tick 零跑道可清**（F7）——六条中唯一可立即落袋项 | 父代理/指挥官 |
| 3 | plug 栈两步走（#134→#104 分支 → 单次 rebase 取 ENV canonical） | 待 #129 合流；步一前置 = 段末审计对 A 案几何放行（审计未派） | R2 + 段末审计 |
| 4 | R2 双清（未提交几何存证 + `_scratch-capture.mjs` 转正/弃） | R2 疑未派（F8）——零跑道项，与 run1'/run2 完全并行无冲突 | R2 |
| 5 | 跑道真空 + 归档半径清空 | 清场令拖欠中（F4/F5）；归档主体 351M 在位，run1/残波增量待收轮补拷 | 父代理 |
| 6 | 独占窗口 ≥2 轮全量预算（80 例 0/0/0，跑「#104 候选 ⊕ main 集成树」） | 尾门；1.5–2h/轮 ×2 轮 | R2 + 段末审计 |

**开闸窗口推演**：清场拖欠 1 tick + run1 诊断趟占用 ≈25min 跑道 → T19 预估 Tick#22–#24 顺延为 **Tick#23–#25**；关键路径 = 条件 1（run1'→run2→签字→合流），条件 2/4 是本 tick 与下 tick 的零跑道并行清账项——**越早清掉，开闸当日越无排队**。

### 3.3 P10 增量登记件（交秘书线，含 T19 四件 + 本 tick 新增）

- T19 存量四件：纪律事件 #3 尾款（排队残波）/ 证据灭失事件 #1（部分缓解）/ #35 正样本（FB-01 ✓）/ ENV 轻微违纪（前置③跳门）；
- 本 tick 新增：**清场令拖欠曲线**（05:47 下达 → 05:52 零执行，逐 tick 时间戳）；**main-preview 清单外占用**（F5）；**#103 第 8 次复读升级催办**（F7）；run1 诊断趟终局（收轮后补时间戳与结果）；R2 派单终态（面板复核后落）；
- 登记矩阵四行照抄，本文不改板（见文末）。

---

## 4. 任务④：#103 / #135 合流复读（第 8 次 / 塌栈就绪版）

### 4.1 #103（[CC-AL-FXN-R7 功能审计收口](https://github.com/rayw-lab/website/pull/103)）——催办升级触发

- **fresh 三证（05:52）**：ready（非 draft）/ MERGEABLE / mergeStateStatus **CLEAN** / 门禁 **SUCCESS** / 审计 GO [#120](https://github.com/rayw-lab/website/pull/120) 在册；docs-only 零跑道零冲突（base main @ `88097f9`）；
- **复读计数**：T18 = 第 7 tick、T19 = 「第 8 次复读则升级」——本 tick 即第 8 次，**升级条款生效：从 tick 例行复读改为向指挥官单独催办件**（一句话即可执行：`gh pr merge 103` 权限在指挥官/父代理）；
- 连续 8 tick「万事俱备只欠合并」本身入执行力专项证据链（与 TRIAGE/归档/清场三案同曲线）。

### 4.2 #135（[SEC-P9 看板 Tick#18 刷新](https://github.com/rayw-lab/website/pull/135)）——塌栈条件本 tick 成熟

- **fresh 双证（05:52）**：门禁 **pass**（4m51s，[run 33145610597](https://github.com/rayw-lab/website/actions/runs/33145610597/job/98765834533)）；`f3bc6c2`（#130 tip）**∈ #135 分支** merge-base 实测 YES → T19 修正一维持：**合 #135 = #130 自动收编，免单合**；
- **执行序**：un-draft #135 → merge → 复核 [#130](https://github.com/rayw-lab/website/pull/130) 自动转 merged/closed（GitHub 通常自动标记；若未自动，父代理手工 close 并评论「收编于 #135」留痕）；
- **与 #103 同 batch**：两 PR 文件域正交（audit 报告 vs 看板 docs）、均 docs-only；建议序 #103 → #135（审计 GO 更早、独立无依赖）。

### 4.3 合流安全性核对（run1 在飞期间合并是否安全）——安全

main 前进不影响在飞实验：`/tmp/env-wt` 是独立 worktree 钉在 `5e41550`（#129 head），不追 main、不重建 dist；两 PR 均零 src/零跑道。**唯一禁则维持**：#129 本身在 ×2 + 签字双门过前禁 ready 禁合；#104/#134 维持 draft 禁 ready（复活门三条不变，T19 §3.3）。顾问 docs PR 积压（#117–#128、#131–#133、#136、#137 与本文 PR）不在关键路径，指挥官可随时批量收。

---

## 5. 裁决一览（父代理直接执行，按序）

1. **清场令补执行（第一优先，§1.1）**：留痕 → C-c 残波 → 双僵尸 preview → **main-preview（清单外增补）** → 五会话收割；勿动 run1 全谱系；拖欠 1 tick 入执行力曲线。
2. **run1 阈值阶梯（§1.2）**：零主动杀点——06:00–06:15 自然收轮窗 / 06:28±1 cap 自终止 / 06:35 取证 / 06:40 才有唯一收割点（cap 后尸体，精确 PID）；收轮即三证 + 增量归档 + 诊断登记。
3. **三叉重写（§2）**：✓ = 鼓励性诊断、✘ = 归因作废、timeout = 作废——三叉同路：清场 → 真空三查 → run1'；回炉三候选判据推迟一趟，重锚干净跑道 ✘✘；合流最早 Tick#22（run1'+run2 ✓✓ + 签字之后）。
4. **#103/#135 本 tick 清账（§4）**：#103 第 8 次复读 → 指挥官单独催办件；#135 CI 绿 + 世系实证 → un-draft → merge → #130 自动收编；run1 在飞期间合并安全性已论证。
5. **Tick#21 预排（§3.1）**：清场核查 / run1 收割 / run1' 放行 / 合流确认 / R2 派单终核（第 3 tick 未派入账）/ **P10 秘书线（3n 界点）**。
6. **全量 e2e 解锁链刷新（§3.2）**：六条中唯条件 2 本 tick 可落袋；开闸窗口顺延 Tick#23–#25；关键路径 = #129 的 ×2 链，零跑道项（塌栈/R2 双清）越早清越好。

---

## 登记矩阵四行（看板单源，照抄不改口径）

北极星 **98 / 98 / 90 / 85** vs 生产登记 **80 / 71 / 84 / —**（综合/视觉/功能/性能）；性能未登记显式 **—**，解锁条件 = 真机 human-gate 六腿 → AL-PERF。

---

*本文档为 CC-LOOP-ADVISOR-T20 Tick#20 交付物；登记看板不在本文更新，由秘书线单源维护。*
