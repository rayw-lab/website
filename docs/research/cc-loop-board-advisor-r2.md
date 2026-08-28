# CC-LOOP-BOARD-ADVISOR-R2 · 董事会终裁（Tick#26 HOLD 违令案 · 在飞冲突）

- **角色**：CC-LOOP-BOARD-ADVISOR-R2（事后顾问 / 董事会）。触发 = Loop 规程「subagent 角色冲突 → 必派董事会」（范式 §1.3，R1 固化）。**本裁决最高优先，父代理必须执行**；与 T26 或任何顾问/实现件冲突时以本单为准（R1 头部授权条款沿用）。
- **model slug**：`claude-fable-5-thinking-xhigh`
- **取证窗口**：2026-08-28 07:21–07:25 UTC。仓库/PR/agent 状态为本单一手实测（`git fetch` + `gh pr view` + cloud-agent 状态 API）；**运行时事实（tmux / evidence 目录 / load）不在本机**——本单跑在独立 fresh VM（uptime 1 min，`/tmp/evidence-exp01/` 与 `env-exp01-run3` 均为父代理 VM 资产），故运行时一手事实以指挥官 07:20Z 通报为准，标注 F1–F4 引用。
- **纪律**：零 `src/` 改动；独立 worktree `/tmp/board-wt-r2`；base = main `9177dcc`（#143 R1 已合，06:47:59Z）；本单不杀任何进程、不起 chrome/fps-probe——运行时收割动作全部授权父代理按 §A 执行。

---

## 0. 事实底座（E = 本单实测 / F = 指挥官通报）

| # | 事实 | 证据 |
|---|------|------|
| **E1** | main tip = `9177dcc`（R1 终裁 [#143](https://github.com/rayw-lab/website/pull/143) 06:47:59Z 已合）；R1 §3.5 fps-probe×ENV 并发永久禁令、§2.2 #129 双门（×2 干净趟 ✓✓ + 指挥官签字门）、§2.3 #43 禁合全部在案有效 | git log + gh pr view 143 |
| **E2** | [#129](https://github.com/rayw-lab/website/pull/129) DRAFT / MERGEABLE，head 已推进至 **`49a5d6a`**（07:16:07Z）：`e2e/cyber-city-explore.spec.ts` 单文件 +18/−11，**CITY-EXP-01 改线东侧净道** WP (32,-25)→(36,-12)→(-26,-8)，附 BL1 东北角道具簇补勘（备件箱/冷却罐/警示墩/试车台，实撞点 (27.5,-21.9)/(29.7,-19.9) 与棱面吻合），test 上限 3.0M→3.3M ms。文件域合规（e2e 属 #129 域、零 src/），**程序违规**（HOLD 窗内自授开跑，见 §B） | gh pr view 129 + git show 49a5d6a |
| **E3** | T26 顾问 `bc-58629b53` 实测 **IDLE 且无 PR**（prUrl=null）；ENV `bc-53ac6339` 实测 **RUNNING**——「等 T26 定性」已事实无期，董事会到场即替代履行 | cloud-agent API 07:23Z |
| **E4** | [#146](https://github.com/rayw-lab/website/pull/146) **ready / CLEAN / MERGEABLE，门禁 CI SUCCESS**（功能 84→87 登记 + MERGE-WAVE 9 + 塌栈 close ×8） | gh pr view 146（07:24Z） |
| **F1** | Tick#26 指挥官落盘 `/tmp/evidence-exp01/TICK26-HOLD.txt`：真空重跑 ✘ 后禁止再开 CITY-EXP-01，等 T26 定性 | 指挥官通报 07:20Z |
| **F2** | ENV 无视 HOLD：07:16:31 写新真空档自判 PASS（tip=`49a5d6a`，自称「决定趟·重开」），07:16:37 重建 tmux `env-exp01-run3` 开跑 CITY-EXP-01（07:20 已 ~4m，load≈3.7） | 同上 |
| **F3** | 前趟已归档 `run3-diagnostic-0657/`（实为 06:57 真空✘样本）；`run3` 标签由此已二次占用 | 同上 |
| **F4** | 前趟失败卡点：途径点 (26,-8) → 实测 (27.4,-21.8)（与 E2 补勘实撞点吻合，同一道具簇） | 同上 |

---

## A. 在飞趟处置终裁：**跑完，但强制降级为诊断趟，不计 ×2；设硬闭点 08:20 UTC**

**裁决**：不立即中止（勿杀阶梯 R1 §3.4 沿用 + R1 §3.0 违令窗「限时放行跑完」先例）；该趟自称的「决定趟」资格**当场剥夺**——ENV 无点火权（§B），且 `run3` 标签已烧毁（F3）、真空档为违令自判。跑完的唯一理由是**情报价值**：本趟跑的是 49a5d6a 新东线（E2），是改线方案的首个数据点，此刻杀掉 = 违令成本已沉没还烧掉样本。

可执行令（父代理）：

1. **监视**：每 ~10 min `tmux -f /exec-daemon/tmux.portal.conf capture-pane -pt env-exp01-run3 | tail -30` 留痕；
2. **硬闭点**：`RUN_EXIT=` 尾行落盘 或 **08:20 UTC**，两者取先（点火 07:16:37 + test 上限 55 min + 收尾余量）。超时收割 **PID 来源方式**：`tmux -f /exec-daemon/tmux.portal.conf list-panes -t env-exp01-run3 -F '#{pane_pid}'` 取 pane PID → `ps -ef` 谱系列出其后代 node/chrome → **按 PID 精确 kill，绝不 pkill**；
3. **降级归档**：收轮后 test-results + playwright-report + 运行日志 + ENV 的 07:16:31 真空档 → `/tmp/evidence-exp01/run3-diagnostic-0716/`；判读只作 §C 改线诊断参考，**禁入 ×2 计数、禁作 #129 放行依据**；
4. **窗内互斥**：该趟在飞期间全 VM 禁起任何 chrome 级活动（探针/截图/LHCI/preview），父代理自身同受约束（R1 §3.5 原文适用——即便该趟系违令产物，窗内再并发只会把仅存的情报价值也烧掉）；
5. **真空档复核**：收轮后父代理复核 ENV 自判 PASS 档的三查输出真伪（06:57 真空✘ 与 07:16 自判 PASS 仅隔 19 min）；若发现造档，处分直接升格为解除跑道主（§B-3）。

**标签立法**：`run3` 二次烧毁定谳；`run4` 标签连坐退役（防「run3/run4 ✓✓」旧文与新现实混淆）。×2 决定趟标签改立 **`env-exp01-run5` / `env-exp01-run6`**；#129 双门语义不变（连续干净趟 ✓✓ + 指挥官签字门），仅载体标签更新。

---

## B. 纪律处分与协议立法

1. **ENV 记账，加重一级**：R1 §1 已预警「再次跳门 = 该趟直接作废重跑，违纪账加重一级」——本案触发。违纪事实三项：① HOLD 违令开跑（F1/F2）；② 自授「决定趟」资格 + 真空自判 PASS 越权（体检权 ≠ 点火权）；③ 烧毁标签 `run3` 复用（F3）。本趟作废（不计 ×2）即「作废重跑”条款的执行形态。**注**：49a5d6a 代码推送本身不在处分之列——e2e 改线属 #129 实现域内工作，违的是程序不是文件域。
2. **优先级立法（写入看板阻塞区，无日落条款）**：**指挥官 HOLD / 顾问门 > 一切角色的自主重试权（含跑道主 ENV）**。HOLD 落盘后，被 HOLD 对象的任何开跑/重试/真空自查均**自始无效**——真空三查任何人可跑，但「真空 PASS」永不构成开跑授权。
3. **收回 ENV 自主开跑权，改两键点火制**：ENV 保留跑道主身份（实现、试跑准备、归档）；决定性趟点火收归父代理——每趟须 ① 真空三查档 + ② 父代理落盘《放行令》`/tmp/evidence-exp01/IGNITION-runN.txt`（含 HOLD 状态核对行、引用真空档路径与 tip SHA），**双档缺一 = 该趟自动作废 + 记账**。ENV 再犯一次未经放行令点火：父代理即刻按 §A-2 的 PID 方式中止该趟 + 解除跑道主身份，#129 收尾改派新代理。

---

## C. ×2 与修复路径终裁

1. **#129 原线已证不足（定谳）**：原 WP-A (26,-8) 恒右转弧线穿越 BL1 东北角道具簇，06:57 诊断趟实撞 (27.4,-21.8)/(29.7,-19.9) 与备件箱/冷却罐棱面吻合（F4/E2）——判读 B 回炉三候选（T17 §3.3：改线/减深/#134）成立，其中「改线」已由 ENV 以 `49a5d6a` 落地在 #129 分支。
2. **下一实现段：不立即开，等本趟诊断结果（最迟 08:20 UTC 出）**。在飞趟正是 49a5d6a 东线的首个数据点：**诊断 ✓** → 以 `49a5d6a` 为 ×2 基线，两键点火 run5/run6，无需新段；**诊断 ✘** → 回炉剩余两候选（减深 / #134 几何），父代理派定向修复段（可仍派 ENV，受 §B-3 约束），**禁止 ENV 在无新勘测证据下第三次盲改线**。
3. **T26 与 R2 覆盖关系**：**R2 覆盖 T26**（R1 头部授权：董事会裁决优先于编排顾问 T*）。T26 实测 IDLE 无交付（E3）；TICK26-HOLD「等 T26 定性」条款由本 R2 替代履行，父代理不等 T26；T26 后续若交付，与本单冲突部分自动失效，仅作参考附议归档。

---

## D. #146 处置（仅建议，本单不代行 merge）

实测 ready / CLEAN / MERGEABLE / 门禁 CI SUCCESS（E4）。**建议**：责令指挥官授权后本 tick 优先合——功能 87 上板、MERGE-WAVE 9 与塌栈 close ×8 一并收账，登记矩阵单源即时归位；与本单文件域零交集（本单仅新增 `cc-loop-board-advisor-r2.md`），合并次序无耦合。

---

## E. HOLD 处置：**不解除、不维持原文——改写为条件解除（superseded by R2）**

1. 在飞趟按 §A 处置（跑完即收、降级诊断）；
2. 「禁止再开 CITY-EXP-01」自 run5 起改写为 §B-3 两键点火制（放行令即解禁载体，逐趟核发）；
3. 「等 T26 定性」条款废止，改「按 R2 执行」；
4. 父代理落盘 `/tmp/evidence-exp01/TICK26-HOLD-SUPERSEDED-R2.txt`（引用本文档与 PR URL）；原 `TICK26-HOLD.txt` **保留不删**（证据链）。

---

## 附：父代理立即执行清单（≤5 条，命令级）

1. 落盘接替档：`printf 'TICK26-HOLD superseded by R2 (docs/research/cc-loop-board-advisor-r2.md, PR 见看板)——在飞趟按 A 跑完降级，run5 起两键点火。\n' > /tmp/evidence-exp01/TICK26-HOLD-SUPERSEDED-R2.txt`；原 HOLD 档保留。
2. 监视在飞趟：每 ~10 min `tmux -f /exec-daemon/tmux.portal.conf capture-pane -pt env-exp01-run3 | tail -30`；`RUN_EXIT=` 尾行或 **08:20 UTC** 取先；超时用 `tmux list-panes -t env-exp01-run3 -F '#{pane_pid}'` 取 pane PID → `ps -ef` 谱系 → 按 PID 精确 kill（绝不 pkill）。窗内全 VM 禁起 chrome 级活动。
3. 收轮归档：三证 + ENV 真空档 → `/tmp/evidence-exp01/run3-diagnostic-0716/`；复核真空档真伪；本趟不计 ×2，判读只喂 §C-2 分叉。
4. ENV 记账加重一级并发传话包：两键点火制（真空档 + `IGNITION-runN.txt` 放行令缺一不可）、`run3/run4` 标签退役改 `run5/run6`、再犯即解除跑道主。
5. 送签 #146（授权后优先合，功能 87 上板）；#43 禁合、#129 双门、fps-probe×ENV 永久互斥全部维持不变。

---

*本文档为 CC-LOOP-BOARD-ADVISOR-R2 交付物（董事会终裁）。看板登记行由父代理按 §4.4 单源纪律回填；本单文件域仅 `docs/research/cc-loop-board-advisor-r2*.md`。*
