# CC-LOOP-ADVISOR-T17 · Tick#17 扇出裁决（fanout）

- **顾问**：CC-LOOP-ADVISOR-T17（model slug: `claude-fable-5-thinking-xhigh`）
- **取证窗口**：2026-08-28 05:20–05:27 UTC，全部一手取证（ps 进程谱系实读 / 面板 API RUNNING 过滤 / gh API / git log+diff 远端 ref 实读 / /tmp 文件 mtime 全 ISO / tmux capture-pane / QST-02 error-context 实读 / T16 交付文档全文实读）
- **基线**：main @ `88097f9`（fetch 实测无新合入）
- **纪律**：零 `src/` 改动；独立 worktree `/tmp/t17-wt`（base = origin/main）；本文档不写看板，登记由秘书线单源（`docs/research/cyber-city-score-loop-orchestration.md`）
- **本 tick 大事**：① **单跑道违纪主体更正**——简报问「ENV push 5e41550 是否与 T14 单跑道冲突」，裁决为**否**（push/开 PR 是零跑道动作，T16 F1 已裁合法）；**真正的违纪者是 plug 自己**：验证轮飞行中（05:13–05:23）在 `/tmp/plug-eng-wt` 反复起 SwiftShader capture 浏览器跑 `_scratch-capture.mjs` 前后帧取证（现行犯 PID 57967 @211% CPU，进程命令行实证），load 峰值 **7.33/4 核**，把自家验证轮的 QST-02 腿挤了个正着（§1）；② **QST-02 ✘（22.2m，05:25:41）但判读失效**——失败签名 `idle-30s 消费腿` nudge 未打（设计秒计时对挤兑极敏感），失败窗口与 plug 自家 capture 负载完全重叠 → #33「异根 vs 挤兑」定谳被自己污染，须干净跑道复跑（§0-F3）；③ **plug `839b6fe`（05:15:04）= 纪律二撞 + 归因金矿**——三 spec 扩改（explore/observability/perf）违反 T15 冻结令，但其复跑遥测把 EXP-01 第一触点定谳为 **X1 桩排东面（17.8 + 车头悬伸 1.6 = 19.4 分毫不差）**，与 ENV #129 归因**独立收敛**，两侧改线路线语义相同（北上东西大道→西行→南下）——T15/T16 要求 R2 第一动作的 trace 定谳已被 plug 自发完成（§2）；④ FB-01 在跑（worker 59768，05:25:43 起），capture 已退净、load 回落 3.19 → **#35 判读窗口仍可救**，收轮顺延 ~05:36±5；⑤ TRIAGE 僵尸**第 5 个 tick** 仍 RUNNING、归档代办**第 6 次逾期**——零跑道两件套再度原地踏步（§0-F8）

---

## 0. 事实核查——九条推翻/超越 Tick#17 简报的 fresh 事实

| # | 简报口径 | 实测（05:20–05:27 UTC） | 证据 |
|---|---------|------------------------|------|
| **F1** | 「T16 顾问 RUNNING」 | **T16 已交付**：draft PR [#132](https://github.com/rayw-lab/website/pull/132)（created 05:20:27Z）；面板 RUNNING 过滤已无 T16（4 路 = T17 本尊 / plug bc-686622df / ENV bc-53ac6339 / TRIAGE bc-ace126a4）。T16 七项裁决（ENV 不 stale 不 resume 不重派 / 纠偏序改写 / #129 双门 / 合流序锁定 / F8 纪律登记 / 零跑道六件 / 兜底分诊）本文全部承接并增量修订 | gh pr view 132 + 面板 API |
| **F2** | 「ENV push 5e41550 可能与 T14 单跑道冲突」 | **不冲突（§1 裁决）**，且违纪主体更正：ENV 侧零浏览器进程、`/tmp/env-wt` 最后 mtime 05:03:56——干净；**plug 侧现行违纪**：sandbox 进程 57921（05:19）命令行实证 `ln -sfn /tmp/plug-wt/dist /tmp/plug-serve/website && curl …4507… && cd /tmp/plug-eng-wt && node tools/camera/_scratch-capture.mjs /tmp/plug-before`，其子孙 SwiftShader gpu 57967 @211% CPU 与验证轮 gpu 52652 @260% 并跑，load 7.33/4 核；capture 截图链 05:13:54→05:16:33→05:17:43→05:18:55→05:21:09 连续落盘 | ps 谱系 + /tmp mtime + uptime |
| **F3** | （简报未及） | **QST-02 ✘ 22.2m**（05:25:41 落盘，error-context + 69MB trace.zip）：签名 = `driving 空闲 30 设计秒应打 idle-nudge（idle-30s 消费腿）` expect true 收 false——设计秒随帧推进，挤兑减帧直接拉长/饿死计时。失败窗口 05:03→05:25 与 plug capture 负载窗口 05:13→05:23 重叠 12 分钟 → **本腿对 #33 的「串行化是否解毒」判读作废**（无法区分异根/挤兑/自家旁路三源） | error-context.md 实读 + mtime 对照 |
| **F4** | 「定向验证仍飞（PID 47720）」 | 复核成立：PID 47720 存活（elapsed 35:01）；EXP-01 ✘ 11.9m（05:03:27，卡 (19.5,-32.9)，在册）→ QST-02 ✘ 22.2m → **FB-01 在跑**（worker 59768 05:25:43 起）。capture 浏览器已全部退出、load 回落 3.19 → FB 腿当前跑道干净，**#35 判读可救**（前提：plug 不再起 capture，见 §2.3 预授权）。收轮顺延 **~05:36±5**（原 05:27±5 作废） | ps + x2-triage-verify.log + test-results mtime |
| **F5** | 「tip 推进到 839b6fe（又改 e2e 动线——纪律再撞）」 | 复核成立并补内容判读：`839b6fe`（05:15:04）改 **三份 spec** 40+18+15 行（explore/observability/perf），EXP-01/OBS-01/PERF-Q2 东段动线改走东西大道（z≈-8…-10）、EXP-02 途径点微调 (-20,-32.5)——测试面**二次扩改**（T15 冻结令 = 不 revert 也不扩，二度违反）。但归因内容 = **复跑遥测实锤**：卡点 x=19.4 与 X1 充电桩排（HeroBlenderMesh PROP_COLLIDERS，世界系 x∈[16.2,17.8]×z∈[-40.3,-25.3]）东面 17.8 + 车头悬伸 1.6 **分毫不差**，「原直线走廊离桩排北端头仅 0.25m，自 X1 合入起即掷硬币」——与 ENV #129 归因**双盲收敛**，且两侧新路线语义同一条路（ENV 霓虹大街 WP(26,-8)→(-26,-8) vs plug 东西大道 (25.5,-10)→(-24,-8)），冲突只剩文本+参数（timeout 3000 vs 2700s、radius 6 vs 3、腿预算 360/480/360 vs 300/480/300） | git show 839b6fe + 两分支对 main 的 diff 并排实读 |
| **F6** | （简报未及） | **plug 未授权 A 案几何进行中**：`/tmp/plug-eng-wt`（checkout `368b4d4`）有未提交 src 改动 `M src/lab/world/city/ForegroundFraming.ts`、`M src/lab/world/city/StreetProps.ts`、`M tools/camera/audit-x2-visibility.mjs` + 未跟踪 `_scratch-capture.mjs`，配前后帧截图（plug-before/after-ritual/60s/120s/180s）——T16 §3-S2 修订 a 已裁「归因=桩带则 A 案几何**降级**为构图优化项挂段末审计」，plug 正在反向硬干 = 纪律事件 #3 预备 | git status /tmp/plug-eng-wt + /tmp 截图 mtime |
| **F7** | （简报未及，虚惊排除） | **飞行中 checkout 换 839b6fe 的一致性风险不成立**：dist 未重建（mtime 04:55:40，早于轮起）；FB-01 所在 `e2e/cyber-city-feedback.spec.ts` 未被 `839b6fe` 触及（diff 实测只动 explore/observability/perf）→ worker 59768（05:25 起，从磁盘读新 checkout）加载的 FB spec 与轮首一致，**轮内三腿一致性保住**（登记为 near-miss：worktree 飞行中换 checkout 是危险动作，仅因 FB 文件未被改而幸免） | stat dist + rg CITY-FB-01 + diff --stat 368b4d4..839b6fe |
| **F8** | （简报未及） | **TRIAGE 僵尸第 5 个 tick**：bc-ace126a4 面板仍 RUNNING（04:18:22 起，T13 裁 → T14 GO 带保险 → T15/T16 点名 → 本轮第五度）；**归档第 6 次逾期**：`/tmp/evidence-exp01` 实测不存在。被覆写风险清单再 +1：QST-02 的 69MB trace.zip 现裸奔在 `/tmp/plug-wt/test-results/`，plug 收轮后若自行复跑即被覆写 | 面板 API + ls 实测 |
| **F9** | 「#103/#130 未合」 | 复核成立：#103 OPEN/ready/**CLEAN/MERGEABLE**（审计 GO #120 在册，**第 6 tick 复读即合**）；#130 draft 待 P9 补登塌栈；#129 draft/MERGEABLE 挂双门；#104 维持 draft 禁 ready；#131（T15）/#132（T16）draft 在册 | gh pr view/list |

---

## 1. 任务①：ENV `5e41550` 与单跑道纪律冲突裁决——**无冲突，合规；违纪主体更正为 plug**

### 1.1 裁决

| 判项 | 依据 | 结论 |
|------|------|------|
| ENV push 违反单跑道令？ | 单跑道令的客体 = **重负载验证跑道**（SwiftShader/playwright 浏览器，T14 §4 算力上界：单进程 337% CPU），不是 git push / 开 PR / 写代码等轻负载动作。ENV push `5e41550`（05:04:23）+ draft [#129](https://github.com/rayw-lab/website/pull/129)（05:05:04）全程零浏览器进程（本轮 ps + /tmp/env-wt mtime 复核干净） | **否**——零跑道动作，T16 F1 已裁合法，本轮 fresh 复核维持 |
| ENV 有无抢跑验证腿？ | #129 验证栏自署「待 plug 收轮后独占跑 CITY-EXP-01×2」，实测未起任何验证进程——**明知排队纪律并自我约束** | 无——模范行为，非但不违纪，反衬 plug |
| 真正的单跑道违纪 | **plug 飞行中旁路负载**（F2）：验证轮自家的 QST-02 腿（05:03–05:25）被自家 capture 浏览器（05:13–05:23，@211% CPU）挤兑，直接把 #33 判读腿污染作废（F3）。这不是「第二跑道申请」而是**未申请的旁路挤兑**，性质比 ENV 假想违纪严重一个量级 | **纪律事件 #2 副款登记**（主款 = e2e 二次扩改，见 §2）；段末审计点名 |

### 1.2 一句话给父代理

简报的担心找错了对象：**ENV 是排队里最守规矩的那个**；把违纪登记从 ENV 名下划掉，写到 plug 名下（旁路挤兑 + 污染自家判读腿），并按 §2.3 预授权保护 FB-01 剩余窗口。

---

## 2. 任务②：plug `839b6fe` 处置——**不中止、不 revert；等收轮即派 PLUG-R2 接管（升级版接管卡）**

### 2.1 三选一裁决

| 选项 | 裁决 | 理由 |
|------|------|------|
| 中止验证轮 | **否** | T15 §1.2 禁飞行中中止维持：EXP-01/QST-02 两腿数据已落袋（30+min 沉没成本）；FB-01 腿跑道已回净（F4），是 #35 判读的**最后可救样本**——中止 = 三腿全废 + 必须重跑 |
| 立即 PLUG-R2 | **否** | R2 开跑前置 = 收轮（单写手 + S1 收割登记，T16 §3 在册）；plug 面板 RUNNING 且 resume 拒在册（T15 §1.1）、follow-up 物理不可达——现在派 R2 = 制造双写手 |
| **等收轮（~05:36±5）即接管** | **是** | 收轮 → S1 收割 → 派 R2；plug 本 tick 已三重撞线（e2e 二次扩改 + 旁路挤兑 + 未授权 A 案几何），任务书控制力已失效，**接管从「可选」升为「必须」** |

### 2.2 `839b6fe` 本体处置：冻结存证不 revert，内容按「金矿」收编

- **纪律面**：与 `8e441ef`/`368b4d4` 同口径**冻结存证**（git 历史承载，不 revert 不扩）；登记**纪律事件 #2**——测试面二次扩改（三 spec、无签字），T15 冻结令二度违反；连同 F6 未授权几何（事件 #3 预备）一并入段末审计点名清单。
- **内容面**：归因部分**全额收编**——plug 复跑遥测与 ENV #129 双盲收敛于「X1 桩排 = EXP-01 第一触点」（17.8+1.6=19.4 分毫不差 + 0.25m 掷硬币边距），T15 §1.5 / T16 §3-S2 修订 a 要求的 **trace 定谳已自发完成，走第一叉**：EXP-01 责任正式移交 #129，R2 不再为 EXP-01 动任何动线或几何，A 案几何维持降级（F6 的未提交改动**冻结在 worktree 不提交**）。
- **两侧路线语义同一（F5）** → rebase 清仓成本大降：EXP-01 spec 区冲突照 T16 §2.4 **一律取 ENV canonical**（参数差异 timeout/radius/腿预算以 ENV 为准）；plug 独有的 OBS-01/PERF-Q2/EXP-02 改线与去重驶出点改向，逐线按「桩排减深已解毒」复核，能还原则还原，不能还原的随 R2 提请签字。

### 2.3 收轮前保护性预授权（FB-01 窗口，~05:36 前）

plug 无传话通道（resume 拒），只能物理面保护：**若 FB-01 飞行期间再现 capture/SwiftShader 旁路进程（特征：`_scratch-capture.mjs` 或 plug-eng-wt 发起的 chrome-headless-shell），父代理可精确 kill 该旁路进程**（PID 级，绝不误伤验证轮 47720/47743/59768 谱系）——旁路负载不是验证轮、不是代理本体，kill 合法且必要；执行即坐实纪律事件 #3。若 plug 收轮后抢跑自己的新验证轮（839b6fe 复跑）：定向单例（~15min）**容忍跑完但登记违纪**，ENV slot 顺延一档；起全量 e2e（独占 1.5–2h）→ 立即精确 kill + 向指挥官申请代理级中止。

### 2.4 PLUG-R2 接管卡（收轮即派，T15 五条 + T16 修订三条 + 本文新增三条）

新增三条：**N1** 第一动作改为「收割 + 归档」（trace 定谳已完成，原第一动作让位）：QST-02 69MB trace + FB-01 结果 + capture 截图链全量拷 `/tmp/evidence-exp01/plug-verify-round/`；**N2** `plug-eng-wt` 未提交几何改动冻结存证（`git stash` 或 patch 留档，禁提交禁扩展）、`_scratch-capture.mjs` 若有留用价值走工具转正流程（先例 `audit-x2-visibility.mjs`），否则弃；**N3** 禁一切 capture/预览类旁路负载直至全量 e2e 硬门段。

---

## 3. 任务③：ENV `5e41550` 定向 EXP-01 验——**可开，slot#2 维持归 ENV，三前置**

### 3.1 裁决：可开（收轮后），且优先级不变

T16 §3-S3 slot#2 = ENV CITY-EXP-01×2 维持——它仍是**信息密度最高的决定性实验**（同时检验判读 B、BL1 减深 src 修复、#129 可合性）。本 tick 新增加持：plug `839b6fe` 的独立归因收敛（F5）使判读 B 的先验大幅上调——两个代理、两份遥测、双盲得出同一桩带定谳 + 同一条改线路，✓✓ 概率显著抬升。

### 3.2 三前置（缺一不开跑）

1. **收轮三证**：PID 47720 自然退出 + list 末行 + JSON stats（e2e-results.json 用 `readFileSync` 读，覆写坑在册）；
2. **跑道真空确认（本文新增）**：全 VM 无 SwiftShader/chrome-headless 存活、load 1min 均值回落 < 2——QST-02 被污染的教训（F3）就是决定性实验绝不能在脏跑道上跑；plug 侧 capture 若再起，先按 §2.3 清场；
3. **归档先行**：`/tmp/evidence-exp01` 落地（第 6 次逾期）+ 验证轮 test-results 增量拷贝完成——ENV 开跑会产生新 test-results，旧证据必须先离开覆写半径。

开跑纪律照 T16：tmux 后台化、三证合一、收轮即归档；EXP-01×2 预算 ~15min/趟 ×2 + 启动开销 ≈ **40min 墙钟**（约 05:40 开跑 → 06:20±10 收）。

### 3.3 判读矩阵

| 结果 | 判读 | 动作 |
|------|------|------|
| ✓✓ | 判读 B 成立、#129 验证门过 | 补签字门 → 合 #129 → R2 rebase 清仓（§2.4）；**签字范围已扩大**：测试面改动现覆盖 ENV explore + plug explore/observability/perf 四处，指挥官一次性签字须列全清单 |
| ✓✘ / ✘✓ | 不稳定——桩带之外仍有随机源 | 加跑第 3 趟定多数；同时查 §2.3 跑道是否被再污染 |
| ✘✘ | 判读 B 动摇 | T16 兜底分诊维持：回 ENV 三候选重裁（候选 a「控制器爬行」升格主嫌——EXP-01 ✘ 的 @1km/h 卡速签名与之相容），R2 全 HOLD 防白烧 |

---

## 4. 任务④：Tick#18 预排

### 4.1 时点与形态

Tick#18 ≈ **05:40**，大概率落在收轮（~05:36±5）**之后**——从纯监控 tick 转为**动作 tick**，预计一次要做四件事，预排如下（按序）：

| 序 | 动作 | 口径 |
|----|------|------|
| 1 | S1 收割登记 | 三腿终局（EXP-01 ✘ / QST-02 ✘污染 / FB-01 ?）+ tmux `x2-triage-verify` capture-pane 留现场后 kill-session + test-results 增量归档；**QST-02 判读显式登记为「作废（自家旁路污染）」**，#33 定谳移交干净跑道复跑（挂 R2 或全量段） |
| 2 | 派 PLUG-R2（接管卡 §2.4） | 前置：plug 面板 IDLE；若仍 RUNNING 按 §2.3 抢跑分诊树处置 |
| 3 | 放 ENV 上 slot#2（§3.2 三前置查毕） | ENV 传话包随放行发出：F2 失败签名（若 T16 §1-3a 未发）+ plug 839b6fe 归因收敛情报（写进 #129 归因节，双盲收敛是最硬旁证）+ 跑道真空责任自查 |
| 4 | 派秘书 P9（3n 界点，T16 §4.2 在册） | 接管 P8 分支 → ready #130 → 指挥官一次塌栈（#125/#121 自动收编） |

### 4.2 P9 补登清单（T16 的 11 条 + 本文新增 5 条）

⑫ T16 交付 #132；⑬ plug `839b6fe` 纪律事件 #2（e2e 二次扩改）+ #3（旁路挤兑/未授权几何，含 §2.3 执行记录）；⑭ 双盲归因收敛（桩带定谳，EXP-01 责任移交 #129）；⑮ 单跑道违纪主体更正（ENV 合规、plug 违纪——纠正 Tick#17 简报口径）；⑯ QST-02 ✘ 22.2m 判读作废 + #33 定谳移交、TRIAGE 第 5 tick / 归档第 6 次逾期（若本 tick 落地则登记落地时间）。

**登记矩阵四行照抄**（看板单源，本文不改板）：北极星 **98 / 98 / 90 / 85** vs 生产登记 **80 / 71 / 84 / —**（综合/视觉/功能/性能）；性能未登记显式 **—**，解锁条件 = 真机 human-gate 六腿 → AL-PERF。

### 4.3 槽位算术

Tick#17 在途 = plug（验证轮收尾）+ ENV（等 slot#2）+ TRIAGE（中止后清零）+ T17 本尊（交付即 IDLE）→ 实质 **2 路**；Tick#18 新派 ≤2（PLUG-R2 + P9），总在途 ≤4，符合 2–6 约束；重负载串行链锁定：FB-01 → ENV EXP-01×2 → R2 定向复跑（若需）→ 全量 e2e，全程单跑道。

### 4.4 本 tick 零跑道清单（收轮前父代理即刻做）

1. **归档自跑（第 6 次逾期，一行命令）**：`mkdir -p /tmp/evidence-exp01 && cp -a /tmp/main-exp01.log /tmp/main-wt/test-results/cyber-city-explore-*world-chromium /tmp/evidence-exp01/ 2>/dev/null; cp -a /tmp/x2-wt/test-results /tmp/evidence-exp01/x2-test-results 2>/dev/null; cp -a /tmp/plug-wt/test-results /tmp/evidence-exp01/plug-verify-round`——QST-02 的 69MB trace 必须在 plug 可能的复跑覆写前离开半径（F8）。
2. **TRIAGE bc-ace126a4 中止落地（第 5 tick）**+ 2–3min 保险复核（参照物 = PID 47720 存活 + `/tmp/plug-wt/test-results` mtime 推进；T14 §1.2 原文）。
3. **#103 合流传话（第 6 tick 复读）**：CLEAN/MERGEABLE + 审计 GO #120，纯 docs 零跑道零交集，即合。
4. **R2 接管卡备妥**（§2.4）+ **FB-01 窗口保护值守**（§2.3 预授权，~05:36 前每 2–3min 瞄一眼 ps）。
5. **对 plug 传话零动作维持**（resume 拒在册）；对 ENV 传话包**推迟到收轮放行时合并发**（§4.1-3，一条 follow-up 三件事，避免验证前多余打扰）。

---

## 5. 裁决一览（父代理直接执行，按序)

1. **任务① ENV 单跑道冲突：无冲突、合规**（§1）——push/开 PR 是零跑道动作；违纪登记主体更正为 plug（旁路挤兑，QST-02 判读被自家污染作废）。
2. **任务② plug 839b6fe：不中止验证轮、839b6fe 冻结存证不 revert、收轮（~05:36±5）即派 PLUG-R2 接管**（§2）——接管卡 = T15 五条 + T16 修订三条 + 本文 N1–N3；FB-01 窗口 §2.3 预授权保护；trace 定谳已双盲完成走第一叉（EXP-01 责任移交 #129，A 案维持降级、未提交几何冻结）。
3. **任务③ ENV 定向 EXP-01×2：可开，slot#2 维持归 ENV**（§3）——三前置（收轮三证 + 跑道真空 + 归档先行）缺一不开跑；判读矩阵 §3.3；签字门范围扩大登记。
4. **任务④ Tick#18 预排**（§4）——动作 tick 四件套（S1 收割 / 派 R2 / 放 ENV / 派 P9）；P9 补登 16 条；槽位 ≤4；零跑道五件本 tick 即做（归档第 6 逾期 + TRIAGE 第 5 tick 是重点追账）。
5. **合流提醒**：#103 即合（第 6 tick 复读）；#129 挂双门（ENV ✓✓ + 扩大版签字清单）过门即合、序在 plug rebase 之前；#130 待 P9 ready 塌栈；#104 维持 draft 禁 ready（复活门 = #129 双门 + R2 双清 + 全量 80 例 0/0/0）。

---

*本文档为 CC-LOOP-ADVISOR-T17 Tick#17 交付物；登记看板不在本文更新，由秘书线单源维护。*
