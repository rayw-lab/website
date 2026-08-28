# CC-LOOP-BOARD-ADVISOR-R3 · 董事会终裁（双 ENV 卡点 · 跨 VM 取证空洞 · 点火制载体重修）

- **角色**：CC-LOOP-BOARD-ADVISOR-R3（事后顾问 / 董事会）。触发 = Loop 硬规「subagent 卡点 → 必派董事会」+ T29 [#150](https://github.com/rayw-lab/website/pull/150) §6 预置触发命中裁定（见 §J）。**本裁决最高优先，父代理必须执行**；与 T29 或任何顾问/实现件冲突时以本单为准（R1/R2 头部授权条款沿用）。
- **model slug**：`claude-fable-5-thinking-xhigh`
- **取证窗口**：2026-08-28 08:01–08:08 UTC。仓库/PR/看板 = `git fetch` + `gh` 一手实测；**双 ENV 状态 = cloud-agent API 一手实测**（本轮新增取证面，时间戳精确到毫秒）；指挥官 VM 运行时事实（`/tmp/evidence-exp01/`、IGNITION 档、load）不在本机，以指挥官 08:00Z 通报为准（F 级）。
- **纪律**：零 `src/`/`e2e/` 改动；独立 worktree `/tmp/board-wt-r3`；base = main `483b942`（#146 已合）；本单不杀任何进程、不起 chrome；运行时动作全部授权父代理按 §E 执行。

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

*本文档为 CC-LOOP-BOARD-ADVISOR-R3 交付物（董事会终裁）。看板登记行由父代理按 §4.4 单源纪律回填；本单文件域仅 `docs/research/cc-loop-board-advisor-r3*.md`，零业务代码。*
