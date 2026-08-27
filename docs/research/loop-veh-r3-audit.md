# Cyber City Loop 8 驾驶 UX 三轮独立审计（CC-AL-VEH-R3）

> **INTERIM（审计进行中）** —— 静态腿与硬门 6 证据已落盘；硬门 #2 全量 e2e
> 独占重跑等待 VM 空载窗口（当前有兄弟代理全量 suite 与 playtest 在途，
> 按 prep §4.3 纪律不抢占）。最终裁决以本分支末次 commit 为准。

| 项 | 内容 |
|---|---|
| 审计角色 | CC-AL-VEH-R3 · claude-fable-5-thinking-xhigh · 独立三轮复审（R2 重派） |
| 审计对象 | `main@771b1e45ac2c36f5b2a29f79ea3f3ce03a5a1029` |
| 预备文书 | `docs/research/loop-veh-r3-audit-prep.md`（CC-VEH-R3-PREP，基于 `7eddd7a`） |
| 上轮裁决 | PR [#67](https://github.com/rayw-lab/website/pull/67) · `docs/research/loop-veh-r2-audit.md` · NO-GO（6/7），唯一阻断 = 硬门 #2 全量 e2e 未全绿 |
| 日期 | 2026-08-27（UTC） |
| 裁决 | **待定**（六门证据已闭合，硬门 #2 全量重跑待独占窗口） |

## 1. 入场校验与合同盘点（prep §4.1 + §2 重跑）

Subject 已从 prep 对象 `7eddd7a` 前进 5 个 merge（#90 FXN-C5、#91 FXN-C6、
#92 VIS-X1A-R4、#93 SIGN e2e、#94 docs）。本审计在 `771b1e4` worktree 实测：

- `pnpm exec playwright test --list` = **80 tests / 16 files / 7 projects**
  （prep 时 75/15）；
- 分布：desktop-chromium 20 · mobile-375 3 · car-chromium 7 ·
  world-chromium 43 · world-perf-chromium 1 · city-perf-chromium 2 ·
  visual-chromium 4；
- 增量 +5 全部闭合：`CITY-QST-01/02`（#90 G4 目标线）、`CITY-SIGN-01…03`
  （#93 招牌叙事机器面）；`CITY-FB-01/02/03/04` 原例扩展改名为
  `CITY-FB-01…09`（#91 确认层 + 测速牌并入同例，非新增合同）。

## 2. 静态腿（硬门 1/3/4/5/7 定向复核，范围 `bad4f54..771b1e4`）

| 校验 | 结果 |
|---|---|
| `git diff --exit-code bad4f54 HEAD -- public/posters` | **exit 0**；tree id 两侧同为 `09a04c0b8ee1e5d6e1a56e856bb9a1ba02d7f9fd` |
| `git diff --stat bad4f54..HEAD -- src/data/camera-shots.json src/lab/world/inputs/Keyboard.ts` | **空输出**（零 diff） |
| `View.ts` diff 中 `drive\|fpv` 命中 | 仅 1 行注释上下文，`setDriveViewMode` / `updateFpv` / `DRIVE_LOOKAHEAD` / `DRIVE_FPV` 解算路径零改动 |
| V 键绑定 | `Player.setInputs`：`toggleDriveView` 仍仅绑 `Keyboard.KeyV` + `categories:['driving']`；FXN-C6 的 F 键 = 既有 `suspensions` 动作，确认层为纯呈现 |
| `7eddd7a..771b1e4` VEH 面增量逐 diff | `Player.ts` +9 = brake-first 遥测一次性 log（不动转向/输入解算）；`SessionTimeline.ts` = 白名单加法（37 type / 10 族）；`DriveFeedback.ts` +74 = 刹车徽标 + 悬挂跳 chip（`pointer-events:none` 纯呈现，不进驾驶输入链）；`SpeedTrap.ts` / `QuestLine.ts` / `Areas.ts` 新增件均无 pointer/wheel→相机姿态映射，无 `applyShot` 调用；`QuestLine` 容器全穿透、唯一交互件为折叠按钮 |
| 硬门 3 新风险点 | `Areas.deferQuestUntilCarReady`：ritual 模式下目标线光柱推迟到首个 `world-transform to='car'` 才入场，robot_idle 首幕视锥零新增物（poster 恒等设计意识在位；运行时由全量中 `VIS-01/VIS-03` 复证） |

## 3. 硬门 6：Lighthouse exact CI（subject `771b1e4`）

本审计分支为 `771b1e4` 之上 doc-only（`docs/research/` 不进 Astro 页面构建，
dist 逐字节同构），故 subject 的 main push exact CI 即本轮证据：

- CI run [33117590389](https://github.com/rayw-lab/website/actions/runs/33117590389)
  （`main@771b1e4`，2026-08-27T21:19Z）：check / build / links / budget /
  Lighthouse 全绿，conclusion=success；
- artifact 21 份 LHR（7 URL × 3 轮）实测解析：`/` 与 `/home/` 的 P/A/BP/SEO
  **中位数均 100/100/100/100**（`/` 三轮中一轮 P=95，中位仍 100），其余五 URL
  中位数亦全 100；对照 R2 全 100 基线 **delta 全 0**。

## 4. 硬门 2：全量 e2e（核心腿，待独占窗口）

**待执行。** 口径（prep §4.3）：80/80、`retries=0`、`failed=0`、`skipped=0`、
全部用例 `retry=0`；`test-results/.last-run.json` `status=passed`。执行纪律：
开跑前 `uptime` 确认近空载、无其他 playtest / e2e / preview 在跑；
`E2E_PORT` 独立端口避免复用他人 4321 服务。

---

*CC-AL-VEH-R3 · doc-only 审计分支；零 `src/`、e2e、生产 score、poster 与像素
基线改动。*
