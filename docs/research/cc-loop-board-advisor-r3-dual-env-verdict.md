# CC-LOOP-BOARD-ADVISOR-R3 · 董事会终裁（双 ENV 卡点 · 跨 VM 取证空洞 · 点火制载体重修）

- **角色**：CC-LOOP-BOARD-ADVISOR-R3（事后顾问 / 董事会）。触发 = Loop 硬规「subagent 卡点 → 必派董事会」+ T29 [#150](https://github.com/rayw-lab/website/pull/150) §6 预置触发命中裁定（见 §J）。**本裁决最高优先，父代理必须执行**；与 T29 或任何顾问/实现件冲突时以本单为准（R1/R2 头部授权条款沿用）。
- **model slug**：`claude-fable-5-thinking-xhigh`
- **取证窗口**：2026-08-28 08:01–08:08 UTC（首裁）+ **08:10–08:20 UTC（Tick#32 增量，见 §F）**。仓库/PR/看板 = `git fetch` + `gh` 一手实测；**双 ENV 状态 = cloud-agent API 一手实测**（时间戳精确到毫秒）；**§F 新增：新 ENV 全量 transcript 一手取证**（121 消息，工单原文 + 全命令流）；指挥官 VM 运行时事实（`/tmp/evidence-exp01/`、IGNITION 档、load）不在本机，以指挥官 08:00Z/08:10Z 通报为准（F 级）。
- **纪律**：零 `src/`/`e2e/` 改动；独立 worktree `/tmp/board-wt-r3`；base = main `483b942`（#146 已合）；本单不杀任何进程、不起 chrome；运行时动作全部授权父代理按 §F5 执行。
- **增量覆盖关系（Tick#32）**：§A-2「创建即死」判定**撤销**（transcript 证明新 ENV 全程在工作，见 §F0-E7）；§C 各条与 §E 清单由 **§F3 / §F5 覆盖**；§J、§B、§D 维持并被 §F 证据加固。首裁原文保留不改（审计链），以 §F 为最终口径。

---

## J. 管辖权裁定：R3 触发**成立**，命中口径 =「制度性失效」

T29 §6 预置三触发的字面第一条是「再次无两键点火」（个体再犯）——本卡点**不是**个体再犯：新 ENV 未违令，它根本没活过（E2）。但预置条款的实质要件命中：**两键点火制的证据总线（同机 `/tmp`）在跨 VM 换将后物理断路**——放行令签在指挥官 VM、跑道在新 ENV VM、真空档与收轮三证回不来（F2）；且本单为连续第三轮顾问/董事会在隔离 fresh VM 上无法一手复核 `/tmp` 证据（R2 §头部、T29 §0、本单 E5——结构性事实的第三个独立样本）。制度无法执行 ≠ 有人违反制度；前者正是 T29 预置触发第一条后半句「须董事会重修点火制本身」的射程。**裁定：R3 管辖权成立，本单重修点火制载体（§B），并对双 ENV、IGNITION-run5、#146 作终裁。**

---

## 0. 事实底座（E = 本单一手实测 / F = 指挥官 08:00Z 通报）

| # | 事实 | 证据 |
|---|------|------|
| **E1** | main tip = `483b942` = [#146](https://github.com/rayw-lab/website/pull/146) merge commit，**#146 已于 2026-08-28T08:01:14Z MERGED**（指挥官授权后合入，卡点快照 08:00Z 之后 74 秒）；files 一手复核 = 看板单文件 docs-only，零 src/e2e | git fetch + `gh pr view 146 --json mergedAt,mergeCommit,files` |
| **E2** | **新 ENV `bc-0b5d1fd4` 创建即死**：createdAt 07:41:49Z，lastMessageActivity 07:41:49Z（创建后 **59 毫秒**），updatedAt 07:41:55Z 后再无更新；events **0 条**、setupStatus **null**、branch null、PR null；取证时刻 08:04:22Z 已 22.5 min 零生命迹象，面板仍 RUNNING。**排除「install 慢」假说**——连 setup 生命周期事件都没有产生 | cloud-agent API `batch-fetch-details`（index.json + events.json） |
| **E3** | **旧 ENV `bc-53ac6339` 僵尸定谳**：createdAt 04:41:54Z，lastMessageActivity **06:48:45Z**（取证时已停滞 75+ min），events 0 条，面板仍 RUNNING；PR null | 同上 |
| **E4** | [#129](https://github.com/rayw-lab/website/pull/129) OPEN draft，head = `49a5d6a4d28…`（与任务书基线一致，×2 冻结基线未漂移）；[#43](https://github.com/rayw-lab/website/pull/43) OPEN 禁合维持；[#149](https://github.com/rayw-lab/website/pull/149) / [#150](https://github.com/rayw-lab/website/pull/150) / [#148](https://github.com/rayw-lab/website/pull/148) 均 draft OPEN 待存档波 | `gh pr view` ×5 |
| **E5** | 本单 VM 隔离 fresh（uptime 3 min，`/tmp/evidence-exp01/` No such file）——董事会/顾问连续第三轮无法一手复核父代理 VM `/tmp` 证据 | 本机 `ls` + `uptime` |
| **E6** | 看板 main 版登记矩阵已实登功能 **87**（#146 合入即上板）；视觉 73 口径在板 | `git show origin/main:docs/research/cyber-city-score-loop-orchestration.md` |
| **F1** | 旧 ENV 已收 `ENV-RELIEVED-R2.txt`（07:37+ run4 违令收割时解除跑道主）+ 指挥官 resume ×2 失败 | 指挥官通报 08:00Z |
| **F2** | 指挥官本盘**无** `vacuum-run5.txt` / `env-exp01-run5.log` / `run5-*` 归档——新 ENV 若产生过任何证据，均滞留其独立 VM，跨 VM 取证空洞实锤 | 同上 |
| **F3** | 指挥官本盘跑道 idle：无 playwright/chrome，load≈0.03（真空前置已具备） | 同上 |
| **F4** | 父代理 07:49 补引重签 `IGNITION-run5.txt`（自称 T29 三要素齐）；×2 = 0/2；07:16✓ 降级不计定谳在案（`run3-diagnostic-0716/`） | 同上 |

### 登记矩阵（看板单源口径，E6 一手复核）

| 维度 | 北极星 | 生产登记 | Δ | 在途 |
|------|--------|----------|---|------|
| **综合** | **98** | **80** | +18 | COMP-M0 重算（功能输入 87 已就位） |
| **视觉** | **98** | **73** | +25 | #129 双门挂 run5/run6@`49a5d6a`，载体本单改同机 |
| **功能** | **90** | **87** | +3 | **#146 已合入落账**（`483b942`），90 禁登维持（云端封顶 87–88） |
| **性能** | **85** | **—** | +85 | 未登记；解锁 = 真机 human-gate 六腿 → AL-PERF |

---

## A. 双 ENV 处置终裁：旧 = 行政除名；新 = 立即解除；**禁换将²；run5 窗不中止，决定趟改同机**

1. **旧 ENV `bc-53ac6339`：僵尸行政除名**。跑道主身份已被 `ENV-RELIEVED-R2.txt` 解除（F1，R2 §B-3 原样兑付），resume ×2 失败 + lastMessage 停滞 75+ min（E3）= 零期望价值。**禁止第三次 resume**；面板 RUNNING 记「平台显示僵尸」，父代理落盘 `ENV1-ZOMBIE-WRITEOFF-R3.txt` 收档并在 dashboard 归档（archive）该 agent；其任何迟到输出**自始无效**（RELIEVED 效力续期）。无进程可杀——它不在指挥官 VM 上，勿杀阶梯不适用。
2. **新 ENV `bc-0b5d1fd4`：创建即死，立即解除**。不保留观察——E2 已排除「慢启动」假说（创建后 59ms 即零活动、零 setup 事件、22.5 min 无生命迹象），观察窗只会烧 run5 时窗。父代理落盘 `ENV2-STILLBORN-R3.txt` 并在 dashboard 归档该 agent；若平台后续自行唤醒，其一切动作按「未持放行令」自始无效（§B-1 同机令兜底）。
3. **禁换将²**：不得再派第三个跨 VM ENV 跑决定趟。本卡点根因是结构（§J），不是个体——换第三个将 = 把同一物理断路再买一次。跨 VM 子代理今后仅可承担**非决定性**工作（实现、文档、审计），且交付一律走 PR artifact（§B-2）。
4. **run5 窗不中止**：07:16✓ 的情报账仍新鲜（`49a5d6a` 东线 17.7m 通过 vs 旧线 8.5m 撞死，T29 §2-2），指挥官本盘跑道 idle（F3），烧掉的只是载体不是方案。**决定趟 run5/run6 改同机执行：父代理在指挥官 VM 自持跑道**，两键文书纪律不变（§C），并加独立复核补偿（§C-4——执行人与点火权人合一后的制衡）。

---

## B. 跨 VM 证据制度补丁（立法，写入看板阻塞区，无日落条款）

1. **同机强制令**：决定趟三要素——跑道（tmux + chrome）、fresh 真空三查档、`IGNITION-runN.txt` 放行令——**必须同机**。不同机的放行令/真空档自始无效，不论内容真伪；「同机」以文书内自证的主机指纹行（`hostname` + `uptime -s` 输出原文）核对。
2. **`/tmp` 证据域界定**：`/tmp` 证据仅在产生它的 VM 语境内有效。跨 VM 引用必须走 durable 通道：**commit 进对应 PR 分支**（收轮三证摘要 + 关键日志 + 截图 webp，目录 `docs/research/exp01-evidence/runN/`）或 CI run artifact 链接（`gh` 实测 URL）。转述性通报（F 级）永不构成放行/计数依据。
3. **收轮即上链**：runN 收轮后下一 tick 内三证 durable 拷贝须进 #129 分支；未上链的 ✓ **不计入 ×2**（取证不可复核 = 非干净趟——「干净」语义自 T29 §2-1 的「程序干净 ∧ 运行干净」扩展为「∧ 取证干净」）。
4. **溯及既往（补账不翻案）**：`run3-diagnostic-0716/` 与 `run4-aborted-no-ignition/` 归档按本补丁补上链（父代理 VM 有原件，同机可执行）；已定谳的会计结论（07:16✓ 不计 ×2、run4 作废）**不因补上链改变**。

---

## C. IGNITION-run5 与 ×2 / #129 合流窗终裁

1. **07:49 版 `IGNITION-run5.txt` 作废，重签 v3（同机版）**。三理由：① 放行令是对**特定跑道**的授权——标的跑道（新 ENV VM）已死（E2），标的物灭失文书自失效；② 其引用的 fresh 真空档从未在任何可复核位置落盘（F2），效力三件（T29 §3-1/2）缺件本就未成立起飞授权；③ §B-1 同机强制令生效后跨 VM 文书自始无效。重签 v3 要素 = HOLD superseded 核对行 + **指挥官本盘** fresh 真空三查档路径（晚于本单送达时刻取样，禁复用任何历史档）+ tip SHA=`49a5d6a` + 主机指纹行（§B-1）。
2. **run5/run6 标签不烧，×2 = 0/2 维持**。两标签下未发生任何违令点火（新 ENV 连跑道都没建），烧标签的构成要件（R2 §A 标签立法 = 违令占用）不成立；文书作废重签 ≠ 标签烧毁。
3. **基线冻结续期**：`49a5d6a`（E4 一手复核未漂移）。×2 期间 #129 head 推进 = 已跑 ✓ 作废重计（T29 §3-3 原文续期）；#146 为 docs-only 合入 main（E1），不触碰基线，**#129 无需 rebase**。
4. **#129 合流窗恒等式原样续期 + 独立复核要件新增**：run5 ✓ + run6 ✓（两键、连续、干净——含 §B-3 取证干净腿）→ 指挥官签字门（扩大清单含 #134 三 spec）→ 合流。因同机化后执行人与点火权人合一（父代理自跑自签），**每趟 ✓ 计数新增要件**：三证上链（§B-3）+ 独立只读复核（审计 Task 复核上链三证与 `RUN_EXIT=0` 一致性，或指挥官核签）——防自跑自判。放行令仍逐趟核发：run5 ✓ 不自动授权 run6，`IGNITION-run6.txt` 另签 + 各自 fresh 真空档（T29 §3-3 续期）。
5. **硬闭点公式续期**（R2 §A-2 沿用）：点火时刻 + 55 min（test 上限 3.3M ms）+ 10 min 收尾余量，`RUN_EXIT=` 尾行与闭点取先；超时收割走 tmux pane_pid 谱系按 PID 精确 kill，绝不 pkill；×2 在飞窗内全 VM 禁 chrome 级活动（R1 §3.5 永久令，父代理自身同受约束——自跑不豁免互斥）。

---

## D. #146 终裁：**已被事实超越——08:01:14Z 合入合规，转收账令**

「是否责令授权后即合」在本单取证窗内已无标的：#146 于 08:01:14Z 由指挥官授权合入（E1，merge commit `483b942`），发生在卡点快照 08:00Z 之后 74 秒。**合入程序合规**：R2 §D / T29 §5 均为「仅建议不代行」，合入权在指挥官，本次由权利人行使，零瑕疵。责令事项转为收账三笔：① 功能 87 上板**已随合入自动落账**（E6 一手复核，父代理无需二次登记、禁重复冒登）；② MERGE-WAVE 9 + 塌栈 close ×8 归档记录已在看板；③ #129 无需 rebase（§C-3）。后续存档波按 T29 §5-2 顺序执行：#149（R2）→ #150（T29）→ #148（T26 附议注记）→ 本单 R3，全程不占 run5/run6 窗口。

---

## E. 父代理立即执行清单（≤5 条，命令级）

1. **双 ENV 收档**：落盘 `/tmp/evidence-exp01/ENV1-ZOMBIE-WRITEOFF-R3.txt`（禁第三次 resume）+ `/tmp/evidence-exp01/ENV2-STILLBORN-R3.txt`（引本单 E2/E3 毫秒级时间戳），dashboard 归档两个 agent；**禁派第三个跨 VM ENV 跑决定趟**。
2. **同机两键重点火**：本盘 fresh 真空三查（含主机指纹行）→ 重签 `IGNITION-run5.txt` v3（§C-1 四要素）→ tmux `env-exp01-run5` 点火跑 CITY-EXP-01@`49a5d6a`；硬闭点 = 点火 + 65 min 与 `RUN_EXIT=` 取先（§C-5），窗内全 VM 禁 chrome 级活动。
3. **收轮上链（§B-3 首例执行）**：run5 三证摘要 + 关键日志 commit 进 #129 分支 `docs/research/exp01-evidence/run5/`；派独立只读复核（审计 Task 或指挥官核签）后方计 ✓；run6 逐趟另签另真空。
4. **看板收账 + 立法上板**：#146 已合（`483b942`）注记核对（禁重复登记）；×2=0/2 锚 run5/run6@`49a5d6a` 同机化注记；§B 制度补丁三条写入看板阻塞区；R2 §A-5 真空档真伪复核销账（本盘有 `run3-diagnostic-0716/` 原件，同机可复核，坐实造档即按 T29 §6-2 回董事会）。
5. **存档波（空档执行，不阻塞 run5）**：#149 → #150 → #148（附议注记）→ 本单；#43 禁合、fps-probe×ENV 永久互斥、#104 禁 ready 全部维持不变。

---

## F. Tick#32 增量终裁（08:10Z 事件包并入 · 取证 08:10–08:20Z · 本节为最终口径）

### F0. 增量事实（E7–E12 全一手；E7/E8/E9 = 新 ENV transcript 逐消息取证）

| # | 事实 | 证据 |
|---|------|------|
| **E7** | **§A-2「创建即死」判定撤销**：新 ENV API 08:13:01Z 状态已翻 **IDLE**（updatedAt 08:12:09Z），transcript 121 消息证明其 07:41–08:12 全程在工作。首裁误判根源 = lastMessageActivity / events / setupStatus 三指标**均不跟踪工具活动**（08:04 与 08:13 两次取样 lastMessage 恒为创建时刻 07:41:49Z）——面板/API 生命征象与真实活动**双向解耦**（旧 ENV 假活 RUNNING、新 ENV 假死零活动，同一缺陷两个方向的实证） | cloud-agent API ×2 + transcript |
| **E8** | **run5-α 全时间线（ENV 自有 VM）**：msg5-6 先查本 VM 无 IGNITION 原件（"NO IGNITION FILE ON THIS VM"）→ msg9 依工单条款自制「IGNITION-run5 (authorization copy)」且**文内如实注明来源与推理** → 真空三查 07:46:11Z PASS（自纠 pgrep 自匹配假阳性后改脚本文件法重做，坑防守到位）→ 07:46:27Z 点火，仅一趟 → **EXIT=0 passed 17.6m**（expected:1/unexpected:0/skipped:0/flaky:0）→ 08:04:06Z 收轮 + 复真空 → 归档其本 VM `/tmp/evidence-exp01/run5-decisive/` → 08:10:33Z 推送 `a9ec398` → 正确自限「未开 run6、需新 IGNITION-run6」→ IDLE。**证据滞留将随 VM 回收蒸发的 /tmp——§J/§B 跨 VM 空洞的完整实证** | transcript msg5/6/9/51/57/75/104/105 + 六项回报原文 |
| **E9** | **父代理工单原文（msg0）三条款**：①「父代理已写入 IGNITION-run5.txt（**若你与父代理不同 VM，以本提示为授权副本**；到共享盘后以文件为准）」；② 任务 5「更新 #129 PR 评论或文档说明 run5 结果（若改代码仅限**签字**/证据路径注释级）」；③ 任务 3 指定标签 run5 / 日志 `/tmp/env-exp01-run5.log` / 建议端口 4620。ENV 交付与工单**逐条吻合** | transcript msg0 全文 |
| **E10** | **#129 head 已漂移** `49a5d6a` → `a9ec398`（08:10:33Z，pusher = 新 ENV，transcript msg104-105 一手锁定）；diff 一手复核 = `e2e/cyber-city-explore.spec.ts` **+9 行纯注释零行为改动**，但注释内容自称「两键合规/决胜趟签字/run5 为合规首计趟」。×2 窗内推进 → T29 §3-3 基线失效条款触发 | `git diff 49a5d6a..a9ec398` + `gh pr view 129` |
| **E11** | **run5-β（指挥官 VM）在飞**：vacuum-run5.txt @08:03 PASS + run5-claimed.txt @08:03 + `/tmp/env-exp01-run5.log`（wrapper PID 101645，load≈3.9）。**igniter 非新 ENV**——08:03 时 α 正在自己 VM 收轮（E8），必为指挥官 VM 本地行为体（父代理或指挥官本人），身份待 F5-2 查明登记 | 指挥官 08:10Z 通报（F 级）+ E8 时间线排除法 |
| **E12** | **run5 标签双重占用成立**：α 已收轮（ENV VM）+ β 在飞（指挥官 VM），同标签两跑道；两趟 08:03–08:04 曾跨 VM 并发（不同 VM，chrome 互斥令按机适用，不构成互烧） | E8 + E11 |

### F1. 核心改判：新 ENV **免责**（执行命令抗辩成立），责任上移至工单条款（越权无效）

1. **伪造指控不成立**：「authorization copy」自制行为系工单 E9-① 条款**明文授权**，且文件内如实注明来源与推理链（msg9 原文「per work order, the task prompt itself is the authorization copy」——造假者不会给自己的伪件写脚注）；「决胜趟签字」入 commit 系工单 E9-② 「签字…注释级」措辞的忠实执行。ENV 全程透明、自纠真空坑、正确自限不开 run6，**执行质量无可指摘**。
2. **但 α 不计 ×2（结论不变，法理换轨）**：工单「以本提示为授权副本」条款**越权自始无效**——T29 §3-1 效力要件（放行令须引 fresh 真空档路径；空引用须在真空档落盘后补签，否则不构成起飞授权）是董事会立法，**工单无权豁免**；即便采认副本形式，签发时真空档（07:46:11）尚不存在于任何文书引用中，效力要件仍缺。⇒ α 起飞时无有效放行令，按 T29 §2-1 资格起飞时判定、EXIT=0 不得追认。**α 转「跨 VM 诊断趟」：情报账全额入账**（东线第二个 ✓，17.6m 与 07:16 趟 17.7m 跨环境同量级 = 改线稳定性双证），**资格账零**——与 07:16 趟会计法完全同构。
3. **父代理训诫（董事会对编排层的处分形态）**，三项违纪记账：① 工单条款越权改写两键制（E9-①）；② 裁决级保留字「签字」误入工单致 ENV commit 措辞染色（E9-②）；③ **双轨同标签**——派 α 后未以可观测交付物核验其生命征象，又在本地点火 β（E11），致 run5 双占用 + 基线被自己工单第 5 条授权的推送在 ×2 窗内烧毁（E10）。处分落地 = F4 工单三纪律（立法）+ 本节记账留痕；父代理编排权不解除（产品设定 + 无恶意 + Tick#32 已主动冻结等裁）。

### F2. 直答指挥官两问

1. **run5 窗 = 分体裁决**：**在飞 run5-β 放行观察**——不杀（R2 勿杀阶梯 + 情报价值：β 是同基线第三数据点，兼可交叉验证 α 的 pass 可信度）、硬闭点 = `RUN_EXIT=` 尾行或 **09:10 UTC** 取先（08:03 点火 + 55min test 上限 + 余量）、**降级诊断不计 ×2**（起飞授权缺件：07:49 放行令签发早于 08:03 真空档且未补签 = T29 §3-1 空引用；vacuum-run5.txt @08:03 本身**采信**为运行面真空证据，但真空 PASS 永不构成开跑授权，R2 §B-2）。**「run5/run6 决定趟窗」关闭**（标签双占用 + 基线漂移），**×2 即时改锚 run7/run8@基线 v2**（F3）——窗不作废、决定趟资格重启，方案（东线）不变。**制度性失效判定维持但责任重定位**：跨 VM 证据空洞被 α 完整实证（E8），根因是工单条款越权 + 双轨派单，非 ENV 个体违纪；修复 = §B 补丁 + F4 工单纪律。
2. **旧僵尸销案 = 三步**：① 落盘 `/tmp/evidence-exp01/ENV1-ZOMBIE-WRITEOFF-R3.txt`（引 E3：lastMessage 06:48:45Z，08:13Z 复测仍停滞 84+ min）；② dashboard **archive** 该 agent（API 实测 isArchived=false 待执行）；③ 看板阻塞区记「已销案」，此后其面板状态变化不再触发 tick 关注、迟到输出自始无效。**禁第三次 resume**。镜像立法见 E7：生命征象判定以**可观测交付物**（推送/PR/上链证据）为准，面板状态仅弱信号。

### F3. 基线 v2 与标签立法（覆盖 §C-1/C-2）

1. **基线 v2**：`a9ec398` 注释中「两键合规/合规首计趟/决胜趟签字」措辞与本终裁抵触，责令父代理按直改白名单（注释措辞调整，≤10 行）修正为降级诊断口径（「run5-α 跨 VM 诊断趟，不计 ×2，Board R3 §F」）并引本单；**修正提交后的 head = ×2 冻结基线 v2**（SHA 登记看板）。禁 force-push、禁 revert 战争——一次措辞修正即收。α 的运行事实（EXIT=0 / 17.6m）**保留在注释中**，只改资格定性——历史不涂改，账目要对齐。
2. **标签**：沿 R2 标签立法——`run5` 双占用**烧毁**，`run6` 连坐退役（防「run5/run6 ✓✓」旧文混淆）；决定趟改 **`run7`/`run8`**，各自 fresh 真空档 + `IGNITION-runN.txt` 原件逐趟核发；归档名 α=`run5-alpha-diagnostic-envvm/`、β=`run5-beta-diagnostic-0803/`。
3. **放行令原件唯一性（立法，无日落）**：放行令仅以点火权人（父代理）在**跑道 VM** 落盘的原件为准；任务书转述、授权副本、提示语授权一律不构成起飞授权；工单永久禁写等效条款。§C-1 重签 v3 要求转化为 `IGNITION-run7.txt` 首签适用（四要素：HOLD 核对行 + 本盘 fresh 真空档路径 + tip=基线 v2 + 主机指纹行）。
4. **指挥官裁量注记**：东线现有三重通过在途（07:16 ✓17.7m + α ✓17.6m + β 待收）——**工程性结论已强，剩余为程序账**。若指挥官行使签字权人主权裁量以现有证据替代 ×2 形式要件，董事会不阻却；但建议仍走 run7/run8（同机两键各 ~20min）完成程序闭环，避免 #129 合流建立在带瑕疵腿上留审计争议。

### F4. 工单三纪律（立法，写入看板阻塞区，无日落）

1. **工单不得改写/豁免董事会立法条款**；确需偏离，先回董事会批条款再派单。
2. **保留字管制**：「签字/决胜/合规首计」等裁决级词汇禁入工单与子代理 commit 措辞；子代理只报事实（EXIT、时长、JSON 判定），资格判定归父代理/董事会/指挥官三级。
3. **一单一跑道一标签**：派单后必须以可观测交付物核验子代理生命征象（E7 立法），确认死单方可换轨；换轨必须换标签。

### F5. 父代理立即执行清单 v2（覆盖首版 §E，≤5 条）

1. **基线 v2 止血**：直改修正 `a9ec398` 注释措辞（F3-1，白名单内）→ push 后登记新 head SHA 为 ×2 冻结基线 v2。
2. **run5-β 放行观察**：不杀；每 ~10 min capture 留痕；`RUN_EXIT=` 或 **09:10Z** 取先，超时 `tmux list-panes` pane_pid 谱系按 PID 精确收割（绝不 pkill）；收轮降级归档 `run5-beta-diagnostic-0803/`（三证 + vacuum@08:03 + run5-claimed + 07:49 IGNITION 原件）并按 §B-3 上链 #129；随档查明并登记 igniter（`ps -o pid,ppid,lstart,cmd -p 101645` + run5-claimed.txt 全文）。
3. **α 证据抢救（单次窄域 resume 新 ENV）**：指令仅限「将本 VM `/tmp/evidence-exp01/run5-decisive/` + vacuum/IGNITION 副本 commit 为 evidence-only 提交至 #129 分支 `docs/research/exp01-evidence/run5-alpha/`，零代码、零其他动作」；失败即登记灭失，孤证规则维持（α 细节数据须 β 或 run7 交叉验证后方可引用）。
4. **run7 两键点火（β 收轮后）**：同机（指挥官 VM）、基线 v2、fresh 真空（主机指纹行）→ `IGNITION-run7.txt` 原件落盘 → 点火；✓ 计数 = 三证上链 + 独立复核（防自跑自判）；run8 逐趟另签；✓✓ → 指挥官签字门（扩大清单含 #134 三 spec）→ #129 合流。
5. **销案 + 收账**：旧 ENV 三步销案（F2-2）；新 ENV 免责结案、抢救后 dashboard 归档；#146=`483b942` 功能 87 核对（禁重复冒登）；F3 标签变更 + F3-3/F4 立法 + E7 生命征象立法上板；存档波 [#149](https://github.com/rayw-lab/website/pull/149) → [#150](https://github.com/rayw-lab/website/pull/150) → [#148](https://github.com/rayw-lab/website/pull/148) → 本单 [#151](https://github.com/rayw-lab/website/pull/151) 空档执行；#43 禁合、fps-probe 永久互斥维持。

---

*本文档为 CC-LOOP-BOARD-ADVISOR-R3 交付物（董事会终裁 + Tick#32 增量终裁）。看板登记行由父代理按 §4.4 单源纪律回填；本单文件域仅 `docs/research/cc-loop-board-advisor-r3*.md`，零业务代码。*
