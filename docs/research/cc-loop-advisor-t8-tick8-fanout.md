# CC-LOOP-ADVISOR-T8 Tick#8 扇出裁决（fanout）

- **顾问**：CC-LOOP-ADVISOR-T8（model slug: `claude-fable-5-thinking-xhigh`）
- **时间**：2026-08-28 03:50–03:57 UTC（Tick#8）
- **基线**：main @ `88097f9`（本 tick `git fetch` 实测，无新合入）
- **纪律**：零 src/ 改动，本文档为唯一交付物；产出于独立 worktree `/tmp/t8-wt`
  （base = origin/main），未触碰 `/workspace` 共享检出、未杀任何进程、未代任何一路
  push。登记看板单源仍为 `docs/research/cyber-city-score-loop-orchestration.md`。

---

## 0. 事实核查（fresh 取证，全部本 tick 03:50–03:53 实测）

| 对象 | 实测状态 | 取证方式 |
|------|---------|---------|
| main | `88097f9`，无新合入 | `git fetch` + worktree 基线 |
| **#103 FXN-R7** | **ready 坐实**：`isDraft=false`、tip `1a4296f` 门禁 **SUCCESS**（COMPLETED）、`mergeable=MERGEABLE`——T7 §2.2 门禁时钟按期兑现（03:55 前出绿），Codex 三项清账闭环 | `gh pr view 103` statusCheckRollup 实测 |
| Codex 线 | **IDLE 佐证**：`/tmp/wt-fxn-r7-codex` 与远程零 ahead 零 dirty，全进程扫描无 capture/ffmpeg 存量——交付链走完，无收尾动作在飞 | `git status -sb` + ps 全扫 |
| **X2 独占 e2e** | **在飞**：PID 20226 etime 12:01（03:51:17 快照 → 起跑 ≈03:39:16），playwright 双 worker + 双 SwiftShader 渲染进程 202%/181% CPU；**预计 03:56–04:03 自然收轮**（17–23min 全量口径） | `ps -o pid,etime,pcpu` |
| X2 失败落盘 | **T+12min 零失败**：`test-results/` 内唯一命名目录（explore「步进→距离读数→折叠偏好（埋点互证）」）**是 `testInfo.attach` 附件目录**（仅含 session-dump JSON），非失败标志；config 为 `trace: retain-on-failure` + `screenshot: only-on-failure`，失败必留 trace.zip——当前不存在。零散 PNG/dump 为 spec 内 `page.screenshot` 有意落盘 | `ls test-results` + spec/config 源码互证 |
| X2 脏区 | `docs/spec/assets/e2e-batch1/*.png` **14 张 M 状态**（T7「多张」量化）——收口提交前必须还原（通杀条款） | `git -C /tmp/x2-wt status -sb` |
| #104 X2 | draft，tip `c24c7f3` 静止，现 tip 门禁 SUCCESS | `gh pr view 104` |
| #112 / #116 | 均 draft OPEN、门禁 SUCCESS，仍待指挥官人工合入 | `gh pr view 112/116` |
| **#106 M0-R4** | draft OPEN、tip `96ad0cf` 门禁 SUCCESS，但 **WIP 自述「e2e 数据待回填」**（=重载需求）；base `771b1e4` 为 main 祖先、**落后 8 commit**；文件域混入 **12 张 e2e-batch1 历史截图改动**（纪律噪声，续跑前必须剔除） | `gh pr view 106 --json body,files` + `merge-base --is-ancestor` |
| VM 负载 | load 4.17→**7.85**/6.91/6.59（1/5/15min）。**非共载**：升幅由 X2 自身双 worker 撞上 world 重型段（双渲染进程各 ~200% 打满 4 核）解释；进程面无第二重载，独占窗口纪律仍被遵守（T7 §5 四证延续） | `uptime` + ps 全扫 |
| 残留观察 | 端口 4475 挂一个 idle `astro preview`（fxn-audit 审计 worktree `771b1e4` 遗留），CPU 0.4% 仅象征性——不构成共载，建议 Codex 线彻底收口后由父代理清理；顾问线不动进程 | ps 实测 |
| 看板现值 | main 树单源：综合 **80** / 视觉 **73** / 功能 **84** / 性能 **—**（#112/#116 在途刷新未合流不计） | 看板文件实读 |

---

## 1. 本 tick 父代理动作：**一报一等一备，零新重载**

1. **报指挥官合 #103（本 tick 唯一升级动作）**：ready 三要素齐（undraft + 绿门禁 +
   MERGEABLE），T7 §2.3 落库预检剩余两项也已闭环——budget 判定由门禁 SUCCESS 实证
   （docs 资产不计传输体积口径，预判兑现）；锚点可达性由 links 检查绿覆盖。父代理
   只传话不代合；合入后立即触发 §2 秘书连锁。
2. **等 X2 收轮，全程零打扰**：PID 20226 预计 03:56–04:03 退出，Tick#9 为结局 tick。
   **退出前本 VM 禁止一切新增 capture/ffmpeg/e2e/lighthouse 重载**（窗口保护条款
   延续，写进 Tick#9 所有任务书）。中场观测结论：T+12min 零失败落盘（§0），全绿
   分支概率上升，但不作预判、以收轮为准。
3. **秘书连锁材料只备不动**：§2 清单在 #103 实际 MERGED 前禁止预登（登记只认合流后
   main 树内正本）。
4. #112 / #116 维持指挥官人工窗口；#106 本 tick 不开（§5 三重门裁决）。

---

## 2. #103 合流后秘书连锁：功能 87 上板触发条件与执行卡

### 2.1 触发条件（唯一硬触发 + 三项材料门）

| # | 条件 | 口径 |
|---|------|------|
| 触发 | `gh pr view 103 --json state` == **MERGED** | ready ≠ 触发；指挥官合入是人工动作，父代理不代合、不预登 |
| 材料① | 合流 SHA 落袋 | 记录 main 新 tip（功能 87 的世系锚） |
| 材料② | 分数正本在合流后 main 树内可读 | `docs/research/cyber-city-function-rubric-score.json` + `docs/research/loop8-fxn-r7-audit.md`（T7 §0 已预检零 `/tmp` 引用，登记指针一律仓内路径） |
| 材料③ | 分值口径 | **登记 87**（审计独立分，双 Pass，87–88 封顶取保守端；登记只认审计独立分，禁止 LHCI/e2e 冒充） |

### 2.2 通道二择（沿 T6 §5.2 原文，防双源）

- **#116 尚未合入**（当前态）→ P6 增量以 **commit 追加到 `cursor/cc-loop-sec-p5-5b71`**
  （#116 同分支延展，单 PR 单源，非叠栈）；门禁重跑、合入窗口顺延可接受。
- **#116 已被指挥官合入** → 从合流后 main 新拉 `cursor/cc-loop-sec-p6-5b71`。

### 2.3 登记内容清单（预填）

功能 **84→87**（Δ 对北极星 90 收敛 +6→+3）+ 正本指针（材料②）；main 新 tip 与
#103 合流记录；#116/#112 自身合流态（若届时已合）；若 X2 triage 已出裁决，按 §3
对应分支一并登记（T6 §5.2-④）。**登记矩阵四行随之刷为：综合 80 / 视觉 73 /
功能 87 / 性能 —**（性能仍写 —，解锁条件不变：真机 human-gate 六腿 → AL-PERF）。

### 2.4 轻载性判定

秘书线纯 docs/git/gh 操作，**X2 独占窗口内可跑**，不受重载禁令约束——连锁无需等
X2 收轮，材料齐即动。

---

## 3. X2 收轮三分支裁决树（复用 T7 §3.2）+ 补洞单模板

### 3.1 裁决树复用与本 tick 增补

T7 §3.2 三分支树**原文继续有效**，Tick#9 结局 triage 直接对号入座：

| 结局 | 裁决（沿 T7 §3.2） | 本 tick 增补 |
|------|-------------------|-------------|
| **52/52 全绿** | flake 定性收案 + 崩溃簇环境定性坐实，无需改码；引 T6 §2.1 + T7 §0/§5 独占性证据 | T+12min 零失败落盘（§0）与此分支相容；收案报告可加引本文档 §0 中场观测作旁证 |
| **仅 CITY-EXP-01 复挂** | 真回归嫌疑坐实 → 开定向补洞单（§3.3 模板），泊车位 (-28,-28) 进路 collider 域 | 判据升级：**失败认定以目录内 trace.zip / error-context + reporter 汇总为准**——`attachments` 子目录是 `testInfo.attach` 常规产物（本 tick 实证），不得当失败计数 |
| **独占轮仍现 `Channel closed`** | 环境定性动摇 → 升级环境专项（worker dump / 内存水位），T7-A 顺延 | 本轮双渲染进程曾各 ~200% 打满 4 核（§0 负载行）——若此分支出现，内存/CPU 水位数据已有本文档快照可引 |

**通杀条款（不变，量化更新）**：收口提交前还原 14 张 `docs/spec/assets/e2e-batch1/*.png`
（M 状态清单见 X2 worktree），审计必查 `git diff --stat` 零截图噪声。

### 3.2 T7-A 入场条件

沿 T7 §3.3 五条件原文（52/52、5 例处置报告落 #104、截图还原、undraft + fresh 绿、
X2 线 IDLE），**最早 Tick#10** 不变；补洞路径顺延 Tick#13+。

### 3.3 补洞单模板（仅「仅 CITY-EXP-01 复挂」分支触发，只备不派）

```
任务：CC-VIS-X2-PLUG——CITY-EXP-01 定向补洞（车未达泊车位）
模型：claude-fable-5-thinking-xhigh
分支：cursor/cc-vis-x2-plug-5b71，base = cursor/cc-vis-x2-facade-r2-1d6f（tip c24c7f3）
    ——门控补洞栈场景①（叠在未合入前段上），登记栈序 + base SHA 到看板
PR：draft，单 PR，禁扩批（范围 = 本单清单，执行中不得加塞）
文件域：R2 立面套件/前景景框 collider 相关（泊车位 (-28,-28) 进路沿线）+ 修复说明文档
排查顺序：① trace.zip 回放定位阻挡帧 → ② R2 新增 mesh 的 collider 域比对（套件接线
    commit fb063c6 / 生成脚本 1d86f19 双查）→ ③ 最小修复（不重构、不顺手调参）
硬门：修复后独占窗口全量 e2e 52/52（0 failed/0 skipped/0 flaky）；提交前还原
    docs/spec/assets/e2e-batch1/*.png 全部 14 张；门禁 fresh 绿
互斥：起跑前确认本 VM 无 capture/ffmpeg/e2e/lighthouse 存量（ps 取证入报告）
交付：修复 commit + 补洞报告（含 trace 帧证据指针，仓内路径，禁 /tmp）
```

---

## 4. Tick#9 预排（~04:00 UTC，X2 结局 tick + 第 3n 看板刷新界点）

**界点口径校正**：T7 §4.2 曾写「Tick#8 恰逢 3-tick 界点」，与指挥官本 tick 简报
「Tick#9 = 第 3n 界点」不一致——**以指挥官口径为准（9 = 3×3）**；且按 T6 §5.1
「空刷不动」原则，届时有无板面增量仍是开工前置。Tick#9 大概率增量齐备（X2 结局
+ 可能的 #103 合流），界点与增量将首次重合，看板刷新条件充分。

| # | 任务 | 触发条件 | 动作 | 串并行 |
|---|------|---------|------|--------|
| T9-A | X2 结局 triage | PID 20226 退出 | 按 §3.1 树对号入座；全绿 → 处置报告 + 截图还原 + push + undraft 链启动（T7 §3.3 时点：ready 最早 ~04:20–04:30）；复挂 → §3.3 模板即时派单 | 首位，其余压后对齐 |
| T9-B | 秘书连锁 + 3n 看板刷新 | #103 MERGED（§2 触发） | §2.2 通道二择 + §2.3 清单一次性登记（功能 87 上板与 X2 triage 裁决合并为同一 P6 增量，避免两次刷板） | 与 T9-A 并行（文件域零交集），登记 X2 项等 T9-A 出结论 |
| T9-C | #103 悬挂预案 | Tick#9 时 #103 仍 OPEN | 维持人工窗口传话，不预登；§2 材料卡随时可发 | 零 VM，常驻 |
| T9-D | M0-R4 轻载预备单 | §5 三门中「窗口门」+「登记门」双开（X2 收轮 ∧ #103 合流） | 只做轻载三件事：rebase 到新 main + 剔除 12 张截图噪声 + 报告框架锁「诊断分」口径；**实算重载段不入本单** | 最低优先，可被 T9-A 补洞/T7-A 抢占 |

VM 预算：X2 收轮前唯一重载 = PID 20226 在途；收轮后 Tick#9 内**至多 1 路新重载**
（仅补洞分支的独占复跑），T9-B/C/D 全轻载 → 峰值 ≤2 ✅。逻辑队列 = X2 结局、
#103 合流连锁、#112/#116 人工窗口、T7-A（Tick#10）、M0-R4（压后）≈ 5 项，带内
（2–6），无积压。

---

## 5. VM 槽释放裁决：Codex IDLE 后 P4 #106 M0-R4 **本 tick 不开，Tick#9 末条件开轻载段**

### 5.1 槽位定性

Codex IDLE 释放的是**代理编排槽**，不是重载槽——重载禁令锚定 PID 20226 存活与否
（窗口保护条款），与 Codex 状态无关。「有空槽」≠「该开单」。

### 5.2 三重门（全过才准开实算重载段）

| 门 | 现状 | 判定 |
|----|------|------|
| ① 窗口门 | X2 独占 e2e 在飞（预计 03:56–04:03 收轮）；若复挂还有补洞复跑排队 | **关**——M0-R4 自述「e2e 数据待回填」= 需自跑全量 e2e（base 树与 X2 分支不同，不能借 X2 本轮结果），属重载 |
| ② 登记门 | 功能 87 待 #103 合流后上板（§2）；现在实算用 84 出综合分，合流即过期，白烧一轮重载 | **关**——实算必须锚定功能 87 上板后的登记面 |
| ③ 口径门 | 性能维持 **—** 未登记 → `availableWeight<1`、`missing≠[]` → 按硬门只能出**诊断分**，禁用作发布/登记分 | **半开**——不阻塞开单，但任务书必须写明交付物是诊断报告，防止误登 |

### 5.3 裁决与节奏

- **本 tick（#8）：不开。** 三门两关，开了只能空转或产出即时过期的数字。
- **Tick#9 末（①② 双开后）：开「轻载预备单」**（T9-D）——rebase（base 落后 main
  8 commit，且合 #103 后更多）+ 剔除 12 张 e2e-batch1 截图噪声（该 PR 文件域当前
  混入历史截图改动，违反通杀条款，续跑前必须清干净）+ 报告框架按 ③ 锁诊断分口径。
- **实算重载段：排 VM 重载队列尾**——X2 收口 →（可能的补洞独占复跑）→ T7-A 视觉
  审计（Tick#10）→ M0-R4 e2e+LHCI 实算，现实最早 **Tick#11+**；优先级沿 T4 §5
  T5-D 原文：「槽空滚动、最低优先、可被抢占」。

---

*本文档为 CC-LOOP-ADVISOR-T8 Tick#8 交付物；登记看板不在本文更新，由秘书线单源维护。*
