# ABOUT-HALL-INDEX · CURRENT AUTHORITY · 2026-09-02 (pre-loop)

> 本节是当前唯一 ACTIVE TODO。冲突时：live Git / 隔离栈 / 日志 > 本文 > 任何旧看板。
> 目标：`/world/about-pavilion/` 炫技自我介绍页 + `/about/` 纸面双胞胎。当前 min：全维未开工（A/B/C/D/E 均 —）。
> 分支 `codex/about-hall-20260902`（未切）· 基线 `main@c585df9` · 上次合流 — · 上次沉淀 —
> 人测窗口：none

## 状态机
`PLANNED → GIANTS_DONE → DISPATCHED → RECEIVED → HOST_READBACK_PASS|FAIL → MERGED → LIVE_OBSERVED`；只有 `LIVE_OBSERVED` 作验收。

## 票册

| 票 | 波 | 维/域 | 目标（一句） | 席位 | write root（唯一） | 依赖 | 最小 Live 验收 | ADR | 状态 |
|---|---|---|---|---|---|---|---|---|---|
| AH-G0 | W0 | 全 | Step 0 digest（4 研究包 + 生成栈实证）adopt/adapt/drop | gemini-3.7-flash ×2 | `docs/local-cmd/STEP0-DIGEST.md` | — | 三栏齐；改波次项列出 | — | PLANNED |
| AH-D1 | W0 | 决策 | 化身路线兜底顺序（T/H 先行 → R）与双形态接力 | Grok 董事会 | `docs/local-cmd/adr/ADR-1.md` | G0 | ADR 落地 | ADR-1 | PLANNED |
| AH-D2 | W0 | 决策 | 进楼快照契约 `world-arrival-v1` + `hallPath` 加法 + SRD 补行 | Grok 董事会 | `adr/ADR-2.md` | G0 | ADR 落地 | ADR-2 | PLANNED |
| AH-G1 | W1 | 生成 | Giants：Grok `image_to_video` 参数实测（尾帧/seed/aspect）+ scrub 编码 GOP 实测 | gemini-3.7-flash + Grok canary | `evidence/about-hall/GIANTS-L1-i2v.md` | — | canary 6s 有 mp4 + ffprobe | — | PLANNED |
| AH-W1a | W1 | 资产 | S0-T / S0-H LOCKED v1 出纸 + first/last 生成 + 独立审计 | 指挥官出纸 → Grok 生成 lane → gemini/glm 审计 | `studio-data-root/about-hall/gen/S0-*/`；`docs/local-cmd/locked/` | G1, D1 | AUDIT PASS ×2 | — | PLANNED |
| AH-W1b | W1 | 资产 | S0 `image_to_video` 6s + 压制 + poster + 仓外临时 HTML scrub 验收 | Grok lane → 指挥官 ffmpeg | `public/media/about-hall/hero-*` | W1a | 机器门体积/fps；人门 A 预评 ≥7 | — | PLANNED |
| AH-W1c | W1 | 资产 | S6-T 过渡（人→机甲）LOCKED + 生成 + 10s 视频 | 同上 | `.../gen/S6-T/`；`public/media/about-hall/transition-*` | W1a | 同上 | — | PLANNED |
| AH-W1d | W1 | 资产 | S0-R 真人版（照片到位后） | 同上 | `.../gen/S0-R/` | 照片 | 同上 | — | PLANNED · NEEDS_LEIGE(照片) |
| AH-W1e | W1 | 资产 | S1–S5 LOCKED 纸（不生成） | gemini-3.7-flash | `docs/local-cmd/locked/S1..S5-*.md` | D1 | 四段 fence + 硬门齐 | — | PLANNED |
| AH-W2a | W2 | 壳 | `WorldHallLayout` + `[slug].astro` + `world-halls.json` + `HallChrome` + SRD 一行 | glm-5-3-flash（产出）→ 指挥官落盘 | `src/pages/world/`、`src/layouts/WorldHallLayout.astro`、`src/components/city/HallChrome.astro`、`src/data/world-halls.json`、`docs/spec/SRD.md` | D2 | 隔离栈 200；G-Hall 零 world chunk | — | PLANNED |
| AH-W2b | W2 | 壳 | `ScrubVideo.ts` 播放器（Paidax 两段改写）+ Hero 幕接入 | glm-5-3-flash / Grok 编码 | `src/components/city/halls/ScrubVideo.ts`、`halls/about/Hero.astro` | W1b, W2a | 鼠标 scrub 改 currentTime；≤20KB gzip | — | PLANNED |
| AH-W2c | W2 | 门 | `about-hall-gate.mjs` + `about-hall.spec.ts` 首批用例 + `about-hall-media.json` 对账 | glm-5-3-flash | `scripts/`、`e2e/about-hall.spec.ts`、`src/data/about-hall-media.json` | W2a | GATE.json 全绿 | — | PLANNED |
| AH-W3 | W3 | 叙事 | 8 幕 sticky 区间 + data-bind + 六向晶体/六站地轨 + hero-robot 程序化动作 | glm + gemini（分镜文案）| `src/components/city/halls/about/**` | W1c, W2b | 人门 B ≥7；C 100% | — | PLANNED |
| AH-W4 | W4 | 双胞胎 | `/about/` 触感 + 四态降级 + 9:16 | glm | `src/pages/about/index.astro`、`src/styles/` | W3 | E 全绿；LHCI 不降 | — | PLANNED |
| AH-W5 | W5 | 联动 | `arrival-snapshot.ts` + `Areas.ts` 接线 + C 横幅 | glm（Areas 单 writer） | `src/lab/world/arrival-snapshot.ts`、`src/lab/world/areas/Areas.ts`、`src/layouts/BaseLayout.astro` | D2 | e2e 进楼到达条 | — | PLANNED |
| AH-W6 | W6 | 收口 | 全量 e2e、双评、PR、handoff | 指挥官 + 批评者 ×2 | `evidence/about-hall/W6/` | 全部 | 86+n 绿；三维 ≥7 | — | PLANNED |

## 热点文件持有表（单 writer）

| 文件 | 当前持有票 | 释放条件 |
|---|---|---|
| `src/lab/world/areas/Areas.ts` | — | W5 收稿 |
| `src/data/cyber-city-buildings.json` | — | hallPath 加法后 |
| `docs/spec/SRD.md` | — | W2a 一行后 |
| `AGENTS.md` | 指挥官 | 本次编排落稿后释放 |

## NEEDS_LEIGE

| 项 | 为什么必须磊哥 | 建议 |
|---|---|---|
| 真人照片 1–3 张 | 肖像 | 正面 + 侧 30°，中性光白墙 |
| 化身路线终选（T/H/R 赛马结果人拣） | 人分 | W1b 后看三张 first 帧 |
| 声音/签名/年份 | 素材 | 可选；没有走替代 |
| PR 合入 main | 发布 | W6 |

## DEFERRED

| 项 | 类型 | 解除条件 |
|---|---|---|
| Grok 真人脸生成能力 | EXTERNAL | W1d 实测一次 |
| `/world/about-pavilion/` 进 LHCI collect | 内部 | Hall-0 稳定后第二刀 |
