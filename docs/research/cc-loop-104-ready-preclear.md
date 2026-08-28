# CC-LOOP-104-READY-PRECLEAR · #104 ready 门非 e2e 预清（R2 双清核实 + 集成树剧本 + 开窗 checklist）

- **执行**：CC-LOOP-104-READY-PRECLEAR（model slug: `claude-fable-5-thinking-xhigh`）
- **纪律**：只读为主，零 `src/` 改动，本 PR 仅本报告一文件；**本单禁跑全量 e2e**（排在 [#166](https://github.com/rayw-lab/website/pull/166) 合入裁决之后，避免白烧集成树）；禁点 ready、禁合 [#104](https://github.com/rayw-lab/website/pull/104)；未杀任何进程，dry-run worktree 用毕即清（防 stale 树误用）
- **取证窗**：2026-08-28 15:32–15:55 UTC，全部 `gh`/git fresh 复核
- **fresh 锚**：#104 tip **`bbba5a5`**（与任务书一致 ✓）· main tip **`40709fc`**（#169；**取证中实测 main 由 `3fe7c5f` 推进两格 docs**——[#168](https://github.com/rayw-lab/website/pull/168) SEC-R5-LEDGER + [#169](https://github.com/rayw-lab/website/pull/169) BGM 调研——集成树时效性风险的活证）· [#134](https://github.com/rayw-lab/website/pull/134) **MERGED** 10:56:08Z · [#167](https://github.com/rayw-lab/website/pull/167) **MERGED** 11:00:25Z（段末审计有条件 GO）· #166 **OPEN draft @`5faab5f`**（未合）

---

## 1. #104 现状 fresh 快照

| 项 | 实测 | 说明 |
|---|---|---|
| tip | `bbba5a5` | 分支 `cursor/cc-vis-x2-facade-r2-1d6f`；#134 九提交已入栈（rebase 后世系 `34b40c1`…`4471ad7`…`bbba5a5`，本单 `git log` 实测 14 提交完整） |
| draft | 是 ✓ | 禁 ready 维持（#167 条件①） |
| mergeable | MERGEABLE / **CLEAN** | `gh pr view 104` 实测 |
| CI 门禁 | **SUCCESS**（check / build / links / budget / lighthouse） | statusCheckRollup on `bbba5a5` |
| merge-base(main) | `d895db7` | main 已推进至 `40709fc`（两单 docs），候选落后 2 格——不需再 rebase，集成树口径本就吸收 main 推进（§3） |
| 审计在案 | #167 有条件 GO | 锚核对 + ENV canonical 零 diff + 探针双门 PASS + explore 4/4 采信；全量 e2e HOLD 列为 ready 门 |
| PR body | **登记滞后（非阻断）** | 仍写「待 X1b #101 先合 main 后 rebase」——X1b 早已合、两轮 rebase 已完成；建议父代理顺手刷新（§6） |

**ready 门现行口径（#168 落板）**：全量 **81 例** 0 failed / 0 skipped / 0 flaky（「#104 候选 ⊕ main」集成树，**分母以 fresh `--list` 实数为准**，历史「80 例」已过期）**+ R2 双清**。#129 双门早已落袋 ✅。

## 2. R2 双清状态表（本单核心交付）

定义源流：T17 §2.4（N2/N3 原文）→ T19 §3.3（复活门第二条口径：`plug-eng-wt` 未提交几何 stash/patch 存证 + `_scratch-capture.mjs` 走工具转正流程或弃）→ T22 F7/§4-4（现场已变，状态改写「**待核实登记**」：转正则闭环、灭失则挂证据账**不阻塞开闸**）。

| 项 | 定义 | 现状核实（本单 fresh） | 证据 | 判定 |
|---|---|---|---|---|
| **N2-a** 未提交 A 案几何存证 | `plug-eng-wt` 的 ForegroundFraming / StreetProps / audit 工具未提交改动须 stash/patch 留档，禁提交禁扩展 | 几何已于 T18 窗被 plug **提交上分支**（`2c1d4ab`，桥位南移 z−26→−19.5 + 东北簇内退 (17.8,−17.8)）→ [#167](https://github.com/rayw-lab/website/pull/167) §2 逐文件核对 + §3.2 探针双门独立复跑 PASS + A 案几何按「构图优化项」**审计放行** → #134 MERGED `d99a0e2` 入 #104 → rebase 后对应 **`4471ad7` ∈ `bbba5a5`**（本单分支 log 实测）。「存证」目的（内容不灭失 + 独立定谳）已被「提交 + 段末审计」超额覆盖；违令提交的纪律面**另账已坐实**（纪律事件 #3，T18 F5 / 看板 ⑱），内容与纪律分账、不回滚不重罚 | `git log origin/cursor/cc-vis-x2-facade-r2-1d6f`；#167 §2/§3.2/§4；#134 mergedAt 10:56:08Z | **已清 ✅**（缺看板一行闭环登记，§6） |
| **N2-b** `_scratch-capture.mjs` 转正/弃 | 有留用价值则走工具转正流程（先例 `audit-x2-visibility.mjs`），否则弃 | **未转正 + 已灭失**：本单 `git log --all --diff-filter=A -- '**/_scratch-capture*'` **全仓历史零命中**（从未入库；对照先例 audit 工具 `aff13dc` 在库）；T22 F7 实测 x2-wt 零未提交、零 stash、脚本已不在；其产出的前后帧截图链（`/tmp/plug-before/after-*`）为 VM 语境证据、未 durable 上链——同机强制令②之下跨 VM 不可引用，**灭失定性** | 本单 git 全历史取证；T22 F7/§4-4 | **核实已毕 → 挂证据账，不阻塞开闸**（T22 口径）；缺的只是**登记动作**——本文档即核实材料，闭环落板归看板单源（§6） |
| **N3** 禁旁路负载直至全量 e2e 硬门段 | 禁一切 capture/预览类旁路负载 | 行为性禁令，非一次性销项——**开窗时点核验**（真空三查 + 互斥令 ㉚ + archive-then-clean ㉙），本单无从预销 | T17 §2.4；T21 立法 | **开窗时核验**（入 §5 checklist 第 4–6 项） |

**结论**：R2 双清的实质障碍为零——N2-a 已清、N2-b 核实毕只欠看板登记（灭失挂证据账、明文不阻塞）、N3 属开窗纪律。**#104 ready 门剩余的唯一实质硬门 = 全量 e2e 81 例 0/0/0（集成树口径）**。

## 3. 「#104 候选 ⊕ main」集成树操作剧本（命令级；本单已演练至 `--list`，未跑 e2e）

```bash
# 0. fresh 取证（每次开窗必做，禁引历史锚）
git fetch origin main cursor/cc-vis-x2-facade-r2-1d6f
CAND=$(git rev-parse origin/cursor/cc-vis-x2-facade-r2-1d6f)   # 预期 bbba5a5；不一致即停手回报
MAIN=$(git rev-parse origin/main)                               # 本单时点 40709fc；变了照走本剧本（锚随取证时刻）

# 1. 零成本冲突预检
git merge-tree --write-tree "$MAIN" "$CAND"    # exit 0 + tree id = CLEAN；冲突则停手登记，explore 腿②区按 ENV canonical 解法（#145 预演口径）

# 2. 建集成树 worktree（独立于主 checkout；临时合并提交仅本地，永不推送）
git worktree add --detach /tmp/x2-ready-wt "$MAIN"
git -C /tmp/x2-ready-wt merge --no-ff --no-edit "$CAND"
git -C /tmp/x2-ready-wt rev-parse HEAD          # 登记集成树 SHA 入收轮档

# 3. 依赖 + 构建（worktree 无 node_modules；同机已装可 ln -s 主仓 node_modules 省时）
cd /tmp/x2-ready-wt && pnpm install --frozen-lockfile && pnpm build

# 4. 分母 fresh --list（ready 门分母唯一单源）
pnpm exec playwright test --list | tail -1      # 登记「Total: N tests in M files」入收轮档

# 5. 全量 e2e —— 本单禁跑；开窗后在独占窗口执行（§5 checklist 全过才点火）
# pnpm test:e2e 2>&1 | tee /tmp/x2-ready-full-run1.log
# 收轮三证：EXIT 尾行 + test-results/e2e-results.json stats（readFileSync 读，Node22 ESM 坑）+ playwright-report
# 硬门：failed=0 / skipped=0 / flaky=0，expected = 步骤 4 登记的分母实数

# 6. 收轮即 durable 上链（同机强制令②③），然后才允许清理/下一轮
```

**本单 dry-run 登记（零跑道，已复原）**：

| 步骤 | 实测 |
|---|---|
| merge-tree 预检 | `git merge-tree --write-tree 40709fc bbba5a5` → **CLEAN**（tree `f810158`，exit 0）——#167 审计时对 `d895db7` CLEAN 的结论在新 main 下**复验仍成立** |
| worktree 合并 | 零冲突，集成树 HEAD `372746f`（本地临时，已随 worktree 清理） |
| `--list` 分母 | **Total: 81 tests in 17 files**——与 #168 落板的 14:57Z 实测**完全一致**（含 #164 `CITY-AUD-01`） |
| 复原 | `git worktree remove --force` 已执行，主 checkout 零触碰——防 stale 集成树被后续窗口误用 |

## 4. main tip 变化重建规则（#166 先合场景）

- **铁则**：集成树锚定**开窗取证时刻**的 `origin/main` tip。main 只要推进——无论 #166 工程件还是任何 docs 件——**旧集成树作废，必须重建 + merge-tree 重验**（审计栈上 PR 必自建「候选 ⊕ main」集成树、防 main 推进后 diff 假象，AGENTS §4.2 / T19 同理）。本单取证中 main 就推进了两格（`3fe7c5f`→`40709fc`），活证在案。
- **#166 先合的具体影响**：① main tip 变 → 重走 §3 全剧本；② 分母变——#166 新增 `e2e/cyber-city-minimap.spec.ts`（**CITY-NAV-01/02/03 共 3 例**，本单分支 blob 实测），预估 81 → **~84**，但**一切以开窗时集成树上 fresh `pnpm exec playwright test --list` 实数为准**（唯一分母单源；「80 例」「81 例」均为历史时点数，禁直接引用）；③ minimap 三例入 world 串行链 → 单轮墙钟再加长，≥2 轮预算相应重估。
- **#166 现状 fresh**：OPEN draft @`5faab5f`，**已从 #168 登记的 CONFLICTING 变 MERGEABLE**（分支 `4ca4b9f`→`5faab5f` 已动过）——合入裁决权在父代理/董事会，本单不预判、不催办。

## 5. 开窗前置 checklist（逐项过完才点火全量窗）

| # | 项 | 口径 |
|---|---|---|
| 1 | #166 合入裁决落定 | 合 → 等 mergeCommit 落 main 后重建集成树（§4）；不合 → 照样 fresh 取 main tip 再建 |
| 2 | fresh 取证四件 | #104 tip（≠`bbba5a5` 即停手核对）· main tip · merge-tree CLEAN 复验 · `--list` 分母登记（§3 步骤 0–4） |
| 3 | R2 双清登记落板 | §2 表 → 看板单源一行闭环（N2-a 转正闭环 / N2-b 灭失挂证据账）；材料即本文档 |
| 4 | 跑道独占 | 在飞轮全部**自然收轮**（NAV/AUD/审计类 worktree 的 playwright/chrome 自然退出；纪律禁杀他人进程）；真空三查 = ① 零 chrome/SwiftShader 存活 ② load < 2 ③ 非自管服务/僵尸 preview 清零 |
| 5 | archive-then-clean 铁则（㉙） | 固定序 = ①归档上一趟 test-results 证据（离开覆写半径）→ ②真空三查 → ③才清 test-results 点火；**启动命令永久禁嵌 `rm -rf test-results`** |
| 6 | 互斥令（㉚） | 窗内全 VM 禁一切 chrome 级活动（探针/截图/LHCI/preview 一律排队）；**父代理自身同受约束** |
| 7 | 预算 ≥2 轮（AGENTS §4.3） | workers=1 串行口径估轮长：52 例时代 `pnpm test:e2e` 实测 ~18.5–23 min；81 例含 explore 长腿（QST-02 单例 24m 级）**单轮预留 1.5–2h**（T19 §5-6 口径） |
| 8 | 收轮三证 + durable 上链 | EXIT 尾行 + `e2e-results.json` stats（`readFileSync` 读）+ report；跨 VM 引用必须 commit 上链（同机强制令②③）；未上链 ✓ 不构成过门 |
| 9 | 过门后边界 | 0/0/0 达成 ≠ 测试代理点 ready——**ready/合 #104 权限在父代理**；#167 条件③：合 main 另需 LHCI 不降 + 指挥官口径；#43 禁合维持 |

## 6. 登记待办（给父代理，均零跑道）

1. **看板 R2 双清行闭环登记**（引用本文档 §2 表）：N2-a 已清（转正 + 审计放行 + 入栈）· N2-b 灭失挂证据账（不阻塞开闸）· N3 转入开窗 checklist——ready 门表述可由「全量 e2e + R2 双清」收敛为「全量 e2e（开窗 checklist 含 N3 纪律）」。
2. **#104 PR body 刷新**（非阻断）：删「待 X1b #101 先合 main 后 rebase」过期段，补 #134 已入栈 + #167 有条件 GO + ready 门现行口径。
3. 本单 dry-run 集成树已清理复原；开窗时按 §3 剧本重建，勿复用任何历史树。

---

*本报告为 CC-LOOP-104-READY-PRECLEAR 唯一交付物；看板登记由父代理/秘书线单源维护。*
