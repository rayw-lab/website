# ABOUT-HALL-INDEX · CURRENT AUTHORITY · 2026-09-03 17:50 · L11

> 本节是当前唯一 ACTIVE TODO。冲突时：live Git / 隔离栈 / 日志 > 本文 > 任何旧看板。
> 目标：`/world/about-pavilion/` 炫技自我介绍页 + `/about/` 纸面双胞胎 + 城→厅连贯转场。状态语义：`MERGED` = 已提交进 topic 分支并推远端；合入 main 以 PR #234 为唯一事件。
> 分支 `codex/about-hall-20260902` @ HEAD（见 git）· PR #234 Draft · 基线 `main@3c68b2b`（post-merge attempt7 93/93 已过期：其后 W3d/T1a/T1b/QE/W1h/VIS-1/F1/W3e 入库，收口前必须干净端口再跑全量 109 例）
> **视频叶关闭**：ZDR 13:05 解除；S0 i2v #1/#2 REJECT（头转）→ #3 PASS（LOCKED v4 零头动）；S6 #1 PASS 兜底 / #2 PASS（瘦身首帧）定案。磊哥人拣：R 终止、T 转正 + 偏瘦。ADR-4（第一栋楼=About 北槽 + 转场）、ADR-5（馆长 S1 迎客/S6 让位、9:16 不投）已落。
> 人测窗口：none

## 状态机
`PLANNED → GIANTS_DONE → DISPATCHED → RECEIVED → HOST_READBACK_PASS|FAIL → MERGED → LIVE_OBSERVED`；只有 `LIVE_OBSERVED` 作验收。

## 票册

| 票 | 波 | 维/域 | 目标（一句） | 席位 | write root（唯一） | 依赖 | 最小 Live 验收 | ADR | 状态 |
|---|---|---|---|---|---|---|---|---|---|
| AH-G0 | W0 | 全 | Step 0 digest（4 研究包 + 生成栈实证）adopt/adapt/drop | gemini-3.7-flash ×2 | `docs/local-cmd/STEP0-DIGEST.md` | — | 三栏齐；改波次项列出 | — | RECEIVED |
| AH-D1 | W0 | 决策 | 化身路线兜底顺序（T/H 先行 → R）与双形态接力 | Grok 董事会 | `docs/local-cmd/adr/ADR-1.md` | G0 | ADR 落地 | ADR-1 | MERGED |
| AH-D2 | W0 | 决策 | 进楼快照契约 `world-arrival-v1` + `hallPath` 加法 + SRD 补行 | Grok 董事会 | `adr/ADR-2.md` | G0 | ADR 落地 | ADR-2 | MERGED |
| AH-D3 | W0 | 决策 | 路线 C 双形态正式裁决 + W3 缺口不豁免 + W1 静帧降级/体积门追认（2.0/3.5/6.0） | Grok 董事会 | `adr/ADR-3-dual-form-and-wave-gaps.md` | D1,D2 | ADR 落地；gate 常量同步 | ADR-3 | MERGED |
| AH-D4 | W7 | 决策 | 第一栋楼=About 布局 + 城→厅转场口径 + 合流序 | Grok 董事会 | `adr/ADR-4-*.md` | D3 | ADR 落地 | ADR-4 | MERGED |
| AH-G1 | W1 | 生成 | Giants：Grok `image_to_video` 参数实测（尾帧/seed/aspect）+ scrub 编码 GOP 实测 | gemini-3.7-flash + Grok canary | `evidence/about-hall/GIANTS-L1-i2v.md` | — | canary 6s 有 mp4 + ffprobe | — | RECEIVED |
| AH-W1a | W1 | 资产 | S0-T / S0-H LOCKED v1 出纸 + first/last 生成 + 独立审计 | 指挥官出纸 → Grok 生成 lane → gemini/glm 审计 | `studio-data-root/about-hall/gen/S0-*/`；`docs/local-cmd/locked/` | G1, D1 | AUDIT PASS ×2 | — | MERGED(瘦身 first 进仓为 poster；i2v 见 W1b) |
| AH-W1b | W1 | 资产 | S0 `image_to_video` 6s + 压制 + poster + 仓外临时 HTML scrub 验收 | Grok lane → 指挥官 ffmpeg | `public/media/about-hall/hero-*` | W1a | 机器门体积/fps；人门 A 预评 ≥7 | — | MERGED(`hero-s0-720p.mp4` = i2v#3 v3 零头动，审计 PASS，1.05MB；#1/#2 REJECT 存档；配额 3/3) |
| AH-W1c | W1 | 资产 | S6-T 过渡（人→机甲）LOCKED + 生成 + 10s 视频 | 同上 | `.../gen/S6-T/`；`public/media/about-hall/transition-*` | W1a | 同上 | — | MERGED(`transition-s6-720p.mp4` = i2v#2 瘦身首帧 v2，审计 PASS，2.09MB；#1 兜底存档；配额 2/3) |
| AH-W1d | W1 | 资产 | S0-R 真人版（照片到位后） | 同上 | `.../gen/S0-R/` | 照片 | 同上 | — | ARCHIVED(磊哥 13:47：真人路线终止；3 first + 1 last 存 gen/S0-R，不进仓) |
| AH-W1e | W1 | 资产 | S1–S5 LOCKED 纸（不生成） | gemini-3.7-flash | `docs/local-cmd/locked/S1..S5-*.md` | D1 | 四段 fence + 硬门齐 | — | MERGED |
| AH-W2a | W2 | 壳 | `WorldHallLayout` + `[slug].astro` + `world-halls.json` + `HallChrome` + SRD 一行 | glm-5-3-flash（产出）→ 指挥官落盘 | `src/pages/world/`、`src/layouts/WorldHallLayout.astro`、`src/components/city/HallChrome.astro`、`src/data/world-halls.json`、`docs/spec/SRD.md` | D2 | 隔离栈 200；G-Hall 零 world chunk | — | MERGED |
| AH-W2b | W2 | 壳 | `ScrubVideo.ts` 播放器（Paidax 两段改写）+ Hero 幕接入 | glm-5-3-flash / Grok 编码 | `src/components/city/halls/ScrubVideo.ts`、`halls/about/Hero.astro` | W1b, W2a | 鼠标 scrub 改 currentTime；≤20KB gzip | — | MERGED |
| AH-W2c | W2 | 门 | `about-hall-gate.mjs` + `about-hall.spec.ts` 首批用例 + `about-hall-media.json` 对账 | glm-5-3-flash | `scripts/`、`e2e/about-hall.spec.ts`、`src/data/about-hall-media.json` | W2a | GATE.json 全绿 | — | MERGED |
| AH-W3 | W3 | 叙事 | 8 幕 sticky 区间 + data-bind + 六向晶体/六站地轨 + hero-robot 程序化动作 | glm + gemini（分镜文案）| `src/components/city/halls/about/**` | W1c, W2b | 人门 B ≥7；C 100% | — | MERGED(骨架/静帧/晶体/收官；馆长+地轨见 W3d/W3e) |
| AH-W3d | W3 | 叙事 | 馆长三动作（注视/托举/致意）+ 六站地轨 + 右侧车道防重叠 | Grok 4.6 → gemini 初审 → 指挥官终审 | `halls/about/Curator.astro`、`curator.ts`、`StationRail.astro` | D3 | 门 9/9 绿；e2e 7/7；gemini PASS | ADR-3 | MERGED |
| AH-W7a | W7 | 债 | `/about/` 问题卡折叠摘要 + 六向因果句 | Grok 4.6 → gemini 初审 | `about/index.astro`、`Crystal.astro` | W6 | LHCI 100/100/100/100 | — | MERGED |
| AH-W4 | W4 | 双胞胎 | `/about/` 触感 + 四态降级（9:16 已由 ADR-5 B 豁免：移动端不投视频） | glm | `src/pages/about/index.astro`、`src/styles/` | W3 | E 全绿；LHCI 不降 | — | MERGED |
| AH-W5 | W5 | 联动 | `arrival-snapshot.ts` + `Areas.ts` 接线 + C 横幅 | glm（Areas 单 writer） | `src/lab/world/arrival-snapshot.ts`、`src/lab/world/areas/Areas.ts`、`src/layouts/BaseLayout.astro` | D2 | e2e 进楼到达条 | — | MERGED |
| AH-W6 | W6 | 收口 | 全量 e2e、双评、PR、handoff | 指挥官 + 批评者 ×2 | `evidence/about-hall/W6/` | 全部 | 86+n 绿；三维 ≥7 | — | HOST_READBACK_PASS(attempt7 93/93 `c463c36` 已过期；收口全量 attempt8 待跑；PR #234 Draft) |

| AH-D5 | W7 | 决策 | 馆长 S1 迎客追认 + S5 托举/S6 让位 + 三热路径互斥 + 9:16 不投追认 + L11 登记项 | Grok 董事会 | `adr/ADR-5-curator-presence-and-portrait.md` | D3,D4 | ADR 落地 | ADR-5 | MERGED |
| AH-M0 | W7 | 债 | 渲染树删 `[[占位]]`（6 gap + 1 gapSolo；字段改可选） | 指挥官直改 | `about-copy.ts`、`Stations.astro` | D4 | `rg '\[\[占位' src`=0 | ADR-4 C | MERGED `5e3c4b6` |
| AH-W1f | W1 | 资产 | 9 张定选帧 `image_edit` 瘦身（像素差限人物区）+ gemini 一对一审 | Grok lane → gemini | `gen/*/slim/` | 磊哥 13:47 | 9/9 PASS | — | MERGED(磊哥 15:45 人拣通过) |
| AH-W1g | W1 | 资产 | 瘦身静帧压 webp 进仓 + S0/S6 i2v#2 + 审计 + 压制 | Grok lane | `public/media/about-hall/*.webp`、清单 | W1f | 7 张 ≤60KB | — | MERGED `827308f` |
| AH-W1h | W1/W3 | 资产+叙事 | S0 v3 进仓 + Hero 指针 scrub + S6 220vh 滚动 scrub（`Transition.astro`）+ 竖版删除 + e2e ×2 | Grok → gemini 初审 | `Hero.astro`、`Transition.astro`、`Stations.astro`、`ScrubVideo.ts`、清单 | W1g | 门全绿；总载荷 3.22MB；spec 11/11 | ADR-5 B | MERGED `909a209` |
| AH-T1a | W7 | 城市 | about↔now-signal 换北/南槽（泊位按足迹重算）+ 任务链首站 about + 立面 firstFrame 随北槽 | Grok → gemini 初审 | `cyber-city-buildings.json`、`CityBlocks.ts`、`world-pois.json` | D4 | audit-x2 8/8；e2e 14/14 | ADR-4 A | MERGED `5c7087f` |
| AH-T1b | W7 | 转场 | `poi_showcase-about-pavilion` 机位 + hold 起帧 400ms 楼色边缘脉冲（单 hex 源）+ 到达条驾驶卡三级文案 + e2e | Grok → gemini 初审 | `camera-shots.json`、`PoiArrival.ts`、`HallChrome.astro`、e2e | T1a | e2e 13/13；r2 墙钟→状态语义 5/5×2 | ADR-4 B | MERGED `df497c4`/`1963f7b` |
| AH-QE | W7 | 城市 | Q/E 第三人称环视（120°/s、±135°、0.35s 回正、car_ready+driving 门、FPV/前奏硬锁）+ CITY-QE e2e | Opus 5 medium | `View.ts`、`Player.ts`、`Reveal.ts`、`cyber-city-lookaround.spec.ts` | 提案 AH-QE | QE spec 全绿 | 磊哥 14:35 令 | MERGED `bbdf4ee` |
| AH-VIS-1 | W7 | 视觉 | 城市 HUD 叠压 / hold 脉冲可见度 / 展厅地轨-馆长-到达条 / `/about/` 摘要夹取（about 立面身份感 BLOCKED→W8） | Opus 5 medium | 样式层 6 文件 | T1a,T1b,W3d | LHCI /about/ 100×4；门全绿 | — | MERGED `e3a5a82` |
| AH-F1 | W7 | 补票 | 街区标题去方位词 + e2e ×7（北槽坐标/任务首站/地轨键盘/coneHits/375/纸面摘要翻转/RM） | Grok | 见 F1 RECEIPT | GAPS A/B/C | 7/7 绿 | — | MERGED `fa1dc2d` |
| AH-W3e | W3 | 叙事 | 馆长契约：`data-curator-pose` 四态、S6 yield rAF 真冷、seek/render 同帧互斥 + e2e ×2 | Opus 5 medium | `Curator.astro`、`curator.ts`、`about-hall.spec.ts` | D5 | spec 16/16 ×3 | ADR-5 A | MERGED `5c5ca20` |
| AH-DOC-1 | W7 | 文档 | TECH-ARCH/WBS/HANDOFF/SRD/AGENTS/README/buildings-map 对齐 | agy gemini-3.8 秘书 | 9 文件 | GAPS C | 抽查事实 2 处纠正 | — | MERGED `c9d5745` |
| AH-VIS-2 | W7 | 视觉 | S6 电影幅面（78vw/1180px 车道优先）+ 配文 progress 两段揭示；Hero DOM 跟 scrub progress 联动（12px/scrim/6 点） | Opus 5 medium | `Transition.astro`、`Hero.astro`、`hall.css` | W3e | 门全绿；spec 18/18 | — | MERGED `b09de11` |
| AH-W8 | W8 | 债 | 合入后：about 立面米色招牌（需改 signage 计数契约 → ADR）、城市 poster A10 重拍、履历 `gap` 回填（NEEDS_LEIGE）、S0-R 存档、移动端光缆 CSS 流光、Vite chunk >500KB 告警 | — | — | #234 合入 | — | — | PLANNED |

## 热点文件持有表（单 writer）

| 文件 | 当前持有票 | 释放条件 |
|---|---|---|
| `src/pages/world/[slug].astro` / `WorldHallLayout.astro` | — | 已释放（W3a 收稿） |
| `src/pages/about/index.astro` | — | 已释放（W7a/VIS-1 收稿） |
| `src/lab/world/areas/Areas.ts` | — | 已释放（W5 收稿） |
| `src/data/cyber-city-buildings.json` | — | hallPath 加法后 |
| `docs/spec/SRD.md` | — | W2a 一行后 |
| `AGENTS.md` | 指挥官 | 本次编排落稿后释放 |

## NEEDS_LEIGE

| 项 | 为什么必须磊哥 | 建议 |
|---|---|---|
| ~~真人照片~~ / ~~化身终选~~ | 已解决 13:47 | T 转正 + 偏瘦；R 存档 |
| 六站履历 `gap` 回填 | 履历事实 | 占位已删（M0）；磊哥给事实后回填 `about-copy.ts` gap 字段（W8） |
| 声音/签名/年份 | 素材 | 可选；没有走替代 |
| PR #234 合入 main | 磊哥 14:49 令合流 | 序：VIS-2 → merge main → 全量 attempt8 → Grok xhigh + Opus 双审计 → push → CI 绿 → merge |

## DEFERRED

| 项 | 类型 | 解除条件 |
|---|---|---|
| Grok 真人脸生成能力 | EXTERNAL | W1d 实测一次 |
| ~~`image_to_video` ZDR~~ | 已解除 13:05 | 阻断层 = 会话 `/privacy` coding-data opt-out，非 `zdr_access_enabled` |
| `/world/about-pavilion/` 进 LHCI collect | 内部 | Hall-0 稳定后第二刀 |
