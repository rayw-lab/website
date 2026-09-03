# ABOUT-HALL 交接（2026-09-03 晨 · L1–L7）

> 同文副本：`raw/03-Output/规划/handoffs/2026-09-03-website-about-hall-handoff.md`。权威索引：`ABOUT-HALL-INDEX.md`；逐 loop：`ABOUT-HALL-LOOP-LOG.md`。

## 一、收到哪

分支 `codex/about-hall-20260902`（worktree `/Users/wanglei/studio-data-root/worktrees/website-about-hall`），基线 `main@c585df9`，本轮 12+ 次提交。**未 push、未开 PR**（合入 main 属 `NEEDS_LEIGE`）。

| 波 | 状态 | 证据 |
|---|---|---|
| W0 | ✅ | `STEP0-DIGEST.md`、`adr/ADR-1-avatar-route.md`、`adr/ADR-2-hall-routing-contract.md` |
| W1 资产 | ✅ 静帧 / ⏸ 视频 | 首屏 `S0-T first-v2-3`（指挥官人门 8.0）、过渡 `S6-T first-v3-3 → last-v3-2`（8.5）、六站 S1–S5 定选；全部 LOCKED 纸在 `docs/local-cmd/locked/`；**`image_to_video` 被 ZDR 拦（账号级）**，canary 脚本 `~/.codex/state/about-hall/zdr-canary.sh` |
| W2 壳 | ✅ | `/world/[slug].astro`、`WorldHallLayout`、`HallChrome`、`world-halls.json`、`hallPath` 加法、SRD §12.7.1 补行、`ScrubVideo.ts`（gzip 1KB）、`about-hall-gate.mjs` G-Hall-1..9、`e2e/about-hall.spec.ts` 7 例 |
| W3 叙事 | ✅（S6 视频占位） | Hero（poster + scrub 就位）、六站静帧 + 差异化揭示、六向晶体、收官区、暗色站头 |
| W4 双胞胎 | ✅ | `/about/` 触感升级 + 手绘插图；LHCI **100/96/100/100** |
| W5 联动 | ✅ | `arrival-snapshot.ts` + `Areas.ts`（hallPath 优先，`?from=city&poi=`，先写快照后 assign） |
| W6 收口 | 🔄 | 批评者双席 A/B/E = 8.5/9/9.5 与 8/8/9（|Δ|≤1）；沉淀 `raw/skills-distilled/about-hall/`；全量 e2e attempt3 80P/2F（NAV_ROUTE 契约）→ 测试侧修 → attempt4 在跑 |

## 二、Live 坐实了什么

隔离栈 `pnpm preview --port 46xx` 真开：`/world/about-pavilion/` 200、未知 slug 404、`?from=city&poi=about-pavilion` 到达条显示楼名/探索 n/12/回城；`prefers-reduced-motion` 下 `getAnimations()`=0；无 JS 首屏文字与 poster 可见；G-Hall 零引擎字节；check-links 全绿；`/about/` LHCI 四项 ≥95。**尚未坐实**：真视频 scrub（无片）；城里真开车进楼→展厅的端到端（只有注入 storage 的有卡 e2e）。

## 三、下一轮先做什么

1. **ZDR**：确认 xAI 账号/团队级 ZDR 已关（`grok` → `/privacy` 若显示 `ZDR · Admin Managed` 需去 console.x.ai），跑 `zdr-canary.sh` 见 `ZDR_CLEAR` 后：`launch.py AH-W1b-i2v-S0T grok-gen …/gen/S0-T` 与 `AH-W1c-i2v-S6T`（各 3 支候选）→ 指挥官逐帧看形变 → `~/.codex/state/about-hall/ffmpeg -vf fps=30 -an -c:v libx264 -preset slow -crf 24 -g 15 -movflags +faststart` → `public/media/about-hall/hero-s0-720p.mp4`（≤2.0MB）→ `about-hall-media.json` 新增 `id: hero-s0` 条目（Hero 按此 id 取 `src16x9`）→ gate/e2e → S6 幕接过渡片。
2. attempt4 若 0F → `evidence/about-hall/W6/` 收 `full-e2e.log` + 复算 SHA；开 PR（草稿）到 `main`，正文贴 GATE.json、LHCI、批评者分、e2e 计数；**合入等磊哥**。
3. W7 债（批评者提出）：问题卡折叠态露摘要；六向交汇加"AI 工作流 → 座舱交付"因果一句；六站 `[[占位]]` 事迹等磊哥灌输；`/about/` 手绘插图可换 S0-H #3。
4. 真人照片 R 路线（`ref/formal.jpg`、`selfie.jpg` 落盘后按 `S0-R-LOCKED-v0` 跑 `image_edit`），与 T 赛马由磊哥人拣。

## 四、NEEDS_LEIGE / DEFERRED

| 项 | 类型 |
|---|---|
| ZDR 账号级关闭（或 S3 桶） | NEEDS_LEIGE |
| 真人照片落盘；化身路线终选（T vs R） | NEEDS_LEIGE |
| 六站真实事迹 `[[占位]]` 灌输 | NEEDS_LEIGE |
| PR 合入 main | NEEDS_LEIGE |
| 展厅进 LHCI collect | DEFERRED（Hall 稳定后另开 ADR） |
| ffmpeg（homebrew-ffmpeg tap）源码重装 | DEFERRED（静态 imageio-ffmpeg 已兜底） |
