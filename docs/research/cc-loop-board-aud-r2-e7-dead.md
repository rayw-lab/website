# CC-LOOP-BOARD-AUD-R2-E7-DEAD · 董事会急裁（AUD-C1 审计 R2 E7 判死追认 + R3 重派授权 + 平台信号失真登记 + R1/R2 死因分账）

- **角色**：CC-LOOP-BOARD-AUD-R2-E7-DEAD（事后顾问/董事会，事件驱动）；触发 = 判死线 once timer `aud-r2-judge-1600` @16:00Z 命中——§1.3 触发条件①（连续空转/卡点：AUD-C1 段末审计 R1 ERROR 后 R2 再死，审计门二连断）+ ②（平台信号失真致角色停/续冲突：面板 RUNNING 与 git 冻结互相矛盾）。书面裁决 = 父代理与所有子代理必须执行的董事会决议（权威口径沿 §1.3 + 站立授权 [#159](https://github.com/rayw-lab/website/pull/159)）。
- **model slug**：`claude-fable-5-thinking-xhigh`
- **纪律**：零 `src/` 改动；docs-only 单文件；base = main@`7865a84`；文件域 = 仅本文档（看板登记行留给 SEC-R6，见 §F-3，避免与 [#173](https://github.com/rayw-lab/website/pull/173) 冲突面重叠）。
- **取证窗口**：2026-08-28 16:04–16:08 UTC，`git ls-remote`/`gh pr view`/`batch-fetch-details`/`list-cloud-agents` fresh 实测；与父代理 16:03–16:04Z 取证双窗互证。

---

## 0. 本单 fresh 事实（全部实测，非转述）

| # | 事实 | 证据 |
|---|------|------|
| **F1** | 判死分支 `cursor/cc-loop-audit-aud-c1-r2-f37e` tip **仍为** `b5542ac6061dbadff6ef9b6f9fd747bdd303e9c7`（committer 2026-08-28T15:03:26Z）；判死线 16:00Z 后零前进，至本单取证（16:04Z fetch + ls-remote）冻结已 **>60 min** | `git ls-remote` + `git log -1 --format=%cI` |
| **F2** | R2 agent [`bc-e4dd7883-9cb4-5ff7-8a3d-b2341862f37e`](https://cursor.com/agents/bc-e4dd7883-9cb4-5ff7-8a3d-b2341862f37e)（AUD-C1段末审计R2）：面板 status=**RUNNING**，但 `events.json` count=**0**、diff-metadata 全 null、面板 `branchName=null`、无 PR；created 14:56:23Z / updatedAt 14:56:33Z / lastMessageActivity=创建瞬间（+36ms），此后**零更新 ~69 min**。父代理 16:03:50Z 与董事会 16:05:15Z 两次独立 batch-fetch 结论一致 | `batch-fetch-details`（含 events）双窗 |
| **F3** | **双向失真互证**：`b5542ac` commit message 自署「AUD-C1-AUDIT-R2 接管」且落在 R2 创建后 7 min（15:03:26Z）——真实工作确曾发生并推送；同一时刻面板却记 `branchName=null`/diff 全 null/events=0。即面板既把死 agent 记作 RUNNING（假阳性），又把已发生的推送记作零产出（假阴性） | F1+F2 交叉 |
| **F4** | R1 = [`bc-8d29a4a7`](https://cursor.com/agents/bc-8d29a4a7-7edb-56e6-a8ab-5f6566a62aee)：created 10:41:56Z（[#164](https://github.com/rayw-lab/website/pull/164) 合入 10:41:37Z 后即派），面板**显式 ERROR**（updatedAt 13:11:05Z）；半成品已推 `cursor/cc-loop-audit-aud-c1-2aee`@`7c5a112`，R1 全量 e2e 结果随 ERROR 丢失（骨架 §4.2 自证） | `list-cloud-agents` + 骨架文本 |
| **F5** | 判死分支资产盘点：base=`3fe7c5f` 上共 2 commit（`25f42fd` R1 报告主体 cherry-pick + `b5542ac` R2 锚更新），单文件 `docs/research/cc-loop-audit-aud-c1.md` +139 行，**零业务代码**。§0–§5 已齐（含 CITY-AUD-01 复跑 1 passed、LHCI 同 SHA CI artifact 回填全 100 不降、全量分母修正 81 例/17 文件），仅 §4.2 全量结果与 §6 裁决待回填 | `git log/diff --stat 3fe7c5f..b5542ac` + 全文复核 |
| **F6** | 当日另有两例**秒死型** ERROR（与 R2 僵尸型不同类）：NAV 审计首派 `bc-5afa39d8`（15:32:00Z 创建，+1.2s ERROR）→ 重派 [`bc-2b5f3253`](https://cursor.com/agents/bc-2b5f3253-b376-5db4-992e-fd567a63d051) 存活；SEC-R6 首派 `bc-e1c4e5c4`（15:38:02Z，+1.2s ERROR）→ 重派 `bc-e1f934f1` 已完单（16:00:05Z IDLE） | `list-cloud-agents` 全量扫描 |
| **F7** | 合流语境 fresh：main tip = **`7865a84`**（[#172](https://github.com/rayw-lab/website/pull/172) 于 16:05:06Z 合入，发生在本单取证窗内；此前 tip `b29edb8` = #170+#171）；[#174](https://github.com/rayw-lab/website/pull/174) OPEN 非 draft **CI 绿 + MERGEABLE**；[#173](https://github.com/rayw-lab/website/pull/173) OPEN **CONFLICTING**（SEC-R6 rebase agent `bc-4bbd3cf8` 16:05:47Z 新派在途）；[#166](https://github.com/rayw-lab/website/pull/166) draft（mergeable 转 UNKNOWN = main 前进后重算中）；[#104](https://github.com/rayw-lab/website/pull/104) draft 禁合 | `gh pr list/view` + `git ls-remote` |
| **F8** | 锚间隔 `3fe7c5f..7865a84` = 5 commit，仅 docs ×5 + AGENTS.md 措辞 2 行，**零 src/e2e/config**——R3 重锚预期平凡（仍须 R3 fresh 自证） | `git diff --stat` |
| **F9** | 仓库规范名 = `rayw-lab/website`（`gh repo view` 实测；`mywebsite` 为重定向别名）——本单全部链接用规范名（§3.5 已知坑复读） | `gh repo view --json nameWithOwner` |

---

## A. 终裁一：E7 判死**追认成立**——R2 就地宣告 DEAD，禁 resume

1. **证据链闭合**：tip 冻结 >60 min（F1）+ 面板 RUNNING 与 events=0/diff null 自相矛盾（F2）+ 双向失真互证（F3）。三证齐备，E7（平台生命体征失真下的僵尸态）成立，判死线 `aud-r2-judge-1600` 的判定**追认为董事会决议**。
2. **处置**：R2（`bc-e4dd7883`）自本单起状态 = **DEAD**。**禁再 resume**（僵尸态 resume 结果不可预期，且 R1→R2「禁 resume、新标签接管」先例已固化为世系纪律）；父代理**可**将其面板条目归档以防误触，但**禁删**分支 `cursor/cc-loop-audit-aud-c1-r2-f37e`、**禁 force-push** 抹掉 `b5542ac`（R3 资产，F5）。
3. **法理**：面板 RUNNING 自本单起**永不构成存活证据**（详 §C）；存活判定唯一合法口径 = git tip 前进 + 交付物内容推进双证。

## B. 终裁二：R3 重派 = **附条件 GO**（心跳条款为生效前提）

**裁决**：授权父代理在本单合入后派 AUD-C1 段末审计 **R3**（新 Task、新标签 `AUD-C1-AUDIT-R3`、slug `claude-fable-5-thinking-xhigh`）；任务书必须**全文内嵌**下列 HB-1…HB-5 心跳条款，缺任一条即视为未获授权。**本单不派 R3，只授权**（董事会禁项遵守）。

**资产口径（本单裁定，二选一之「同分支续写」）**：R3 在 `cursor/cc-loop-audit-aud-c1-r2-f37e` **原分支 append-only 续写**，不再 cherry-pick 开第三分支。理由：① 骨架 §0–§5 已齐、剩余工作面小（F5），同分支续写零搬运风险；② 「禁删/禁改写 `b5542ac`」由 append-only 天然满足；③ 世系单链（R1 半成品分支 → R2 接管分支 → R3 续写）避免三副本对账。R3 首 commit 须含接管声明（自报 slug + fresh 锚 SHA + 「R2 E7 DEAD 依据本单」一行）。

**范围（闭口清单，禁扩批）**：① fresh 重锚——fetch 后核 main tip（≥`7865a84`）、自证锚间隔零 src/e2e/config（F8 预期）、更新报告 §1/§3.5 锚记；② **§4.2 全量 81 例 fresh 自跑**——独占跑道预检（零 chrome/playwright/lighthouse 进程、端口空闲）+ 分母以 `cyber-city-test-framework.md` 单源 fresh `--list` 复核（81/17 口径，53 禁上板）；③ §6 裁决回填（GO / 有条件 GO / NO-GO + 依据）；④ 开审计 PR（非 draft，base=main，单文件报告件）。

**心跳条款（HB，判死自动化）**：

| # | 条款 |
|---|------|
| **HB-1 首搏** | 派单后 **≤15 min** 推「接管声明 commit」（内容见上）。 |
| **HB-2 常搏** | 此后任意相邻两次 tip 推进（committer 时间戳口径）间隔 **≤30 min**。 |
| **HB-3 长静默窗预登记** | 启动全量 e2e（~17–23 min 墙钟）**前**必须先推「开跑登记 commit」（启动时刻 + 预计时长 + 跑道预检证据）；开跑登记后 **≤40 min** 内必须推结果 commit（pass/fail 计数）。重跑轮（≥2 轮预算，AGENTS.md §4.3）逐轮预登记。 |
| **HB-4 生命体征口径** | 存活 = git tip 前进 + 报告文件内容推进**双证**；面板 RUNNING **禁作**存活证据；`batch-fetch` events/diff 仅辅助参考。 |
| **HB-5 自动判死（本单预授权）** | 违反 HB-1/2/3 任一 → 父代理**无需再开董事会**即判 R3 DEAD：禁 resume、按同款条款派 R4、资产续用同分支 append-only。 |

**监控义务（父代理侧）**：对 R3 armed once/循环 timer，**每 15 min** `git ls-remote origin cursor/cc-loop-audit-aud-c1-r2-f37e` 对时间戳 + 每 tick 读报告文件推进；违约即执行 HB-5。

## C. 终裁三：平台信号失真正式登记（SIG-E7）

**登记事件**：「**面板 RUNNING ≠ 存活**」——2026-08-28 R2 案实证平台生命体征双向失真（假阳性 RUNNING + 假阴性零产出记录，F2/F3）；同日另证「面板 branchName/diff 可为 null 而实际已有推送」。

**父代理可执行对策（即日生效）**：

| # | 对策 |
|---|------|
| **P1** | 存活判定唯一合法口径 = **双证**（git tip 前进 + 交付物文件推进）；`list-cloud-agents` status **禁作唯一依据**。 |
| **P2** | 在途关键 Task 一律 timer 化监控：每 15 min `git ls-remote` 对 tip 时间戳，辅以 `batch-fetch-details` events count；两窗取证（间隔 ≥1 min）再下判。 |
| **P3** | 自本单起，新派审计/实现长跑单任务书**必须内嵌 §B 心跳条款模板**；无心跳条款不派长跑单（在途单不追溯，监控面照适用 P1/P2）。 |
| **P4** | 死型分诊：**秒死型**（创建 ≤5s 即 ERROR，F6 两例）→ 立即重派安全，无需董事会；**僵尸型**（RUNNING + tip 冻结）→ 判死线到点判死、禁 resume、新标签接管。 |
| **P5** | 范式手册 §3.5 已知坑表补「E7 僵尸/面板失真」一行 → 交**后续 docs 单**办理（非本单文件域，禁扩批）。 |

## D. 终裁四：R1/R2 死因分账

| 项 | R1 | R2 |
|---|---|---|
| agent | `bc-8d29a4a7` | `bc-e4dd7883` |
| 创建 | 10:41:56Z（#164 合入后即派） | 14:56:23Z |
| 有效产出 | 报告主体 §0–§5（CITY-AUD-01 1 passed、LHCI 回填全 100、81 例分母修正），推至 `cc-loop-audit-aud-c1-2aee`@`7c5a112` | 接管 commit `b5542ac`（cherry-pick + §1/§3.5 锚更新 + §4.2 改 fresh 自跑口径） |
| 死亡方式 | 面板**显式 ERROR**（13:11:05Z 前后）——死得诚实 | **E7 僵尸**：15:03:26Z 后 tip 冻结、面板假 RUNNING——死得沉默 |
| 死亡工序 | §4.2 全量 e2e 自跑窗（全量结果随 ERROR 丢失） | §4.2 同一工序（接管 7 min 后进入长静默窗即失联） |

**同根因判定**：**工序同、死法异，非同一故障面**。二者均死于 §4.2 全量 e2e 长静默窗（~20 min 零外部痕迹的任务内最长工序）——但 R1 是平台如实报错，R2 是平台失真掩埋。可归纳（登记为**疑似**，样本 2 非结论）：长静默窗内平台会话存活性薄弱是共同暴露面；任务书内容与模型能力均无缺陷证据（骨架质量高、剩余面小）。**R3 可行性不受二连死证伪**。

**对后续审计派单硬约束（AC，即日生效）**：

1. **AC-1**：心跳条款强制内嵌（= §C P3）。
2. **AC-2**：交付分段纪律转正——报告主体先推、长跑窗独立 commit 段（R1/R2 已实践，固化为硬约束：任何时刻死亡损失 ≤1 段）。
3. **AC-3**：长跑窗一律预登记（HB-3 模板），把不可切分的静默窗变成「有痕迹的窗」。
4. **AC-4**：判死后禁 resume、新标签接管、资产续用（R1→R2→R3 世系转正为标准作业程序）。

## E. 角色冲突终裁表（§1.3 必交件）

| 角色 / agent | 终裁 |
|---|---|
| **R2** `bc-e4dd7883` | **DEAD 追认**；禁 resume；面板条目可归档防误触；分支与 `b5542ac` 资产**保留禁删**（§A） |
| **R3**（待派） | **附条件 GO**：HB-1…HB-5 全文入任务书，同分支 append-only 续写，范围四项闭口（§B） |
| NAV 段末审计 [`bc-2b5f3253`](https://cursor.com/agents/bc-2b5f3253-b376-5db4-992e-fd567a63d051) | **续跑勿杀**（指挥官语境）；即刻适用 P1/P2 双证监控；若 **17:00Z** 检查点仍零 git 痕迹且 events=0 → **升级董事会**（本单不预授其判死——其交付分支/口径非本单取证域） |
| SEC-R6 rebase `bc-4bbd3cf8` | 续跑；#173 解冲突时**并入「AUD R2 E7 DEAD → R3 已授权」登记行**（看板单源归 SEC，本单零触碰看板） |
| BGM-C1 实现 `bc-d8b00d9f` | 续跑（16:06:09Z 新派，P3 不追溯）；父代理监控面适用 P1/P2 |
| 面板 status 信号 | 自本单起降格为**辅助信号**，与 git 双证冲突时以 git 为准（§C） |

## F. 立刻可执行合流序（§1.3 必交件；父代理执行，本单勿越权合并）

1. **#174**（Codex 合后补洞，docs，CI 绿 + MERGEABLE）→ **立即 squash 合入**（站立授权 docs 直合面）。
2. **本单 PR**（docs 单文件）→ CI 绿即合（董事会件优先审）。
3. **#173**（SEC-R6 看板收账，CONFLICTING）→ 等 `bc-4bbd3cf8` rebase 完成（对 #174 + 本单之后的 main 重解 + 并入 R2 DEAD 登记行）后合入。
4. **R3 审计 PR** → R3 完工后按其 §6 裁决走段末流程。

**事实登记**：原合序 #174→#172→#173 中 **#172 已于 16:05:06Z 先行合入**（本单取证窗内，F7）——序内提前不改变剩余两件相对序，不追责、不返工。
**禁合项复读**：#166 draft 等 NAV 段末审计；#104 draft 禁合；CAM 视角旋转/真机六腿/安卓事项归指挥官，任何子代理禁代决。

## G. 父代理 Tick 立即执行清单（≤10 条，按序）

| # | 动作 |
|---|------|
| 1 | 合 #174（CI 已绿，直合面） |
| 2 | 本单 PR CI 绿后合入（董事会件优先） |
| 3 | R2 判 DEAD 落地：不再向 `bc-e4dd7883` 发任何 follow-up；面板条目归档（可选）；分支保留 |
| 4 | 本单合入后**即派 R3**：任务书 = §B 范围四项 + HB-1…HB-5 全文 + 零业务代码 + fresh 取证 + `claude-fable-5-thinking-xhigh` |
| 5 | arm R3 心跳监控 timer（15 min 粒度 `git ls-remote` + 报告推进比对）；违约即按 HB-5 判死并派 R4 |
| 6 | NAV 审计 `bc-2b5f3253`：17:00Z 检查点执行 §E 双证核查；零痕迹则开董事会单，勿自判 |
| 7 | #173 合入前核验：R2 DEAD 登记行已并入 + 已对新 main 重解冲突 |
| 8 | 通告在途/新派子代理：面板 RUNNING 降格为辅助信号（§C P1），新长跑单一律带心跳条款（P3） |
| 9 | 择期开 docs 小单：范式手册 §3.5 已知坑表补「E7 僵尸/面板失真」行（P5，非本单域） |
| 10 | 禁项复读不动摇：#166/#104 禁合、CAM/六腿/安卓归指挥官、全量 e2e 互斥窗照旧 |

---

## 登记矩阵四行（看板单源口径）

北极星 **98 / 98 / 90 / 85** vs 生产登记 **80 / 73 / 87 / —**（综合/视觉/功能/性能）。性能显式 **—**，解锁条件 = 指挥官真机 human-gate 六腿 → AL-PERF。本单零分数产出，不触登记矩阵。

---

*本文档为 CC-LOOP-BOARD-AUD-R2-E7-DEAD 交付物（董事会急裁）；四件打包全答（A 判死追认 §A、B R3 附条件 GO §B、C 信号失真登记 §C、D 死因分账 §D）+ §1.3 必交件三项（终裁表 §E、合流序 §F、Tick 清单 §G）；全部链接经 `gh` 实测（规范仓库名 `rayw-lab/website`，F9）。*
