---
title: FRAME-VAULT · 第三栋楼「帧库 · Frame Vault」施工任务书（CHARTER）
type: charter
status: draft-for-leige
date: 2026-09-04
owner: 磊哥
executor: Claude Code 主线程（Fable 5.1，亲自实装全部代码，沿第二栋楼 §0.2 豁免）
parent: docs/local-cmd/FRAME-VAULT-DRAFT-2026-09-04.md（设计 SSOT）
seat-template: docs/local-cmd/NEXUS-HALL-CHARTER-2026-09-04.md（席位/写根/门形态母版）
---

# 0. 一页纸

**目标**：赛博城市第三栋楼 `workflow-foundry`（x48 z-150，泊位 (18,-150) heading 90）落成 `/world/frame-vault/`：**把磊哥的自动化视频闭环工作流做成一间可以切开视频的片库**。访客 10 秒「哇」（一块能切的视频固体），30 秒读懂「视频是一次构建的产物，每一秒都有人审和门禁的痕迹」，3 分钟切出一张自己的时间海报并带走。验收只认 Live（真浏览器 + fresh 批评者），不认 build 绿。

**设计 SSOT = 草案**（`FRAME-VAULT-DRAFT-2026-09-04.md`）。本文只固化：裁决、口径、波次、门、禁区。冲突时设计口径以草案为准，施工口径以本文为准。

## 0.1 磊哥裁决（2026-09-04，已拍）

| # | 项 | 裁决 |
|---|---|---|
| 1 | 主题 | 第三楼科普磊哥的 AI 视频自动化闭环（raw 座舱 3.0 Master Agent 科普系列 EP1–EP8；scout-r0 只留指向） |
| 2 | 创意与技术 | 创意分 ≥ 前两楼；技术栈必须不同；「UI/UE 和前端设计务必创新」；「创新前提下不要降级」 |
| 3 | 载体 | 「帧库 · Frame Vault」时间立方体方向（「第三点我听你的」）；斜切海报可保存/分享 |
| 4 | 端 | 桌面为主，「手机不是重点」 |
| 5 | 内容 | 文案/正文后补；本期锁技术栈、体系、产品设计、交互设计 |
| 6 | 编排 | 允许 clone 巨人肩膀作锚点参考（2026-09-04 「允许 clone 巨人肩膀 作为锚点参考哦」）；每波一路 agy 调研（沿第二楼裁决 7）；xhsapi 秘书/反核常态 |

## 0.2 待拍（NEEDS_LEIGE，见草案 §9；未拍前按 ⭐ 默认施工，拍后改动记 ADR）
视频托管 / 工作剪是否公开 / 台本是否公开 / 人审原话是否公开 / 楼名 / tagline / scout-r0。

# 1. 尺子（面板分 = min，人分磊哥独有）

| 维 | 权重 | 谁判 | 口径 |
|---|---|---|---|
| **A 哇感（10 秒）** | 25 | fresh 批评者 ×2 看首屏截帧 + 3 s 录屏 | 是否想上手切；**像「视频播放器加了 3D 特效」或「MRI 查看器」→ ≤4 分**；材质只有纸/金属/光三种 |
| **B 复述（30–60 秒）** | 20 | 批评者只看录屏 | 能写出「视频是可切的固体 / 真实集数与锁状态 / 有人审退回坐在时间轴上 / 这页由同一条流水线产出」四点 ≥3 |
| **C 真实性绑定** | 20 | 机器门 + 人门 | 每个可见数字/指纹/环追到 manifest 字段 → 追到 raw 一手文件；**无绑定 = FAIL**；manifest 不含本地路径 |
| **D 工程门** | 20 | 机器门 | build / G-Hall 零 world chunk / hall chunk ≤50 KB gzip / atlas 体积门（W1 实测后定值）/ frame-vault-gate（sha 一致 + 环时刻 ≤ 时长 + 无路径）/ e2e 绿 / 无 secret / 全局类名查重 |
| **E 降级完整** | 15 | 机器门 + 人门 | 3D 纹理上限 / 无 WebGL2 / 无 JS / reduced-motion / 移动端「只看」五态各有体面终态（草案 §7） |

# 2. 席位与派单

| 席 | 载体 | 职责 | 直跑命令 | 身份核验 | 已知故障 |
|---|---|---|---|---|---|
| 执行方 | Claude Code 主线程 | 设计、全部代码、管线、门、e2e、合流、台账 | — | — | — |
| 调研席（每波必派） | agy · Gemini 3.1 Pro (High) / 3.8 Flash | GitHub-first 找轮子 + clone teardown（已允许）、视觉参考、盲区补搜 | `python3 -B ~/.claude/scripts/agy_rescue_cli.py --model pro|flash --prompt-file <0600> --cwd ~/studio-data-root/x-archives/hall3-research --timeout 5000` | receipt exit 0 + 正文非空；identity 仅诊断 | 一次只开一路；产物直接落 `--out` 文件时 `.raw.md` 为 0 是常态 |
| 秘书 / 反核 | xhsapi · dots3-note-prev | 反核「已完成」vs 文件事实、对抗审、LESSONS | 同第二楼 | `served_model=dots3-note-prev` rc=0 | 2026-09-04 两次 `SSL: UNEXPECTED_EOF`，改 `glm-5-3-flash@ark-plan` 顶上 |
| 董事会 | Grok 4.6 xhigh | 重大裁决（§7） | 同第二楼 | `modelUsage` | 壳 completed ≠ 结束 |
| 视频/管线工具 | ffmpeg（本机） | 抽帧、图集 | `ffmpeg -vf fps=,scale=160:90` | 版本进 BUILD-RECEIPT | — |

派单纪律沿第二楼 §2.2（inline SSOT 不给指针；每条事实标证据等级；限制类声称亲跑探针；回稿逐条亲核）。

# 3. 写根与 Git

- 分支：`codex/frame-vault-20260904`，base = `codex/nexus-hall-20260903@3e0680f`（回城协议已入）；worktree `~/studio-data-root/worktrees/website-frame-vault`。**未开**（等磊哥「go」）。
- 唯一写根：`src/components/city/halls/vault/**`、`src/pages/world/frame-vault.astro`、`scripts/frame-vault-build.mjs`、`scripts/frame-vault-gate.mjs`、`public/demo/frame-vault/**`、`evidence/frame-vault/**`、`e2e/frame-vault.spec.ts`、`docs/local-cmd/FRAME-VAULT-*`。
- 热点文件单 writer（加法改动）：`src/data/world-halls.json`（登记 `frame-vault`）、`src/data/cyber-city-buildings.json`（`workflow-foundry` 加 `hallPath`、`arrivalFx: "film"`）、`src/pages/index.astro`（`returnMap` 自动派生，只加 `film` 色值）、`src/components/city/HallChrome.astro`（`film` 退场遮罩）、`src/components/city/PoiArrival*`（`film` 到达）、`src/styles/hall.css`（只加 `.vault-*` 前缀类）、sitemap。
- 铁律：**不 push / 不开 PR / 不发布**；不碰用户脏树（`docs/spec/assets/e2e-batch1/*.png`、`evidence/about-hall/GATE.json`）；不重跑 `scripts/nexus-ledger-reduce.mjs`；commit 前 build + 五门 rc 链式；不打印 secret；manifest 零本地路径。
- raw 仓（`~/workspace/raw/05-Projects/座舱3.0科普系列视频/`）**只读**；管线读它，不写它。

# 4. 波次任务书

| 波 | 票 | 交付 | 最小 Live 验收 | 调研腿 |
|---|---|---|---|---|
| W0 | FV-W0a 文档四件（草案/任务书/台账/流水 R0） | 本文 | 在分支上 | — |
| W0 | FV-W0s 可行性 spike | `~/studio-data-root/hall3-spike/spike.html` + 截图 + 数字 | 已完成（流水 R0） | FV-W0r agy「GitHub-first 视频体/切片轮子」（在跑） |
| W1 | FV-W1 管线 `frame-vault-build.mjs` + `frame-vault-gate.mjs` + EP2/EP3 manifest 入库 | 图集 WebP 体积/画质实测 → 定 D 维体积门；sha 门负控 rc≠0 | 两集 manifest 过门；BUILD-RECEIPT 落盘 | agy：WebP/AVIF 图集编码参数与浏览器解码耗时对照 |
| W2 | FV-W2 `VolumeEngine`（WebGL2）+ 刀锋 + 斜切 + 海报 + URL 确定性 | 引擎 ≤12 KB gzip `[目标，W2 实测后改数]`；`?ep&cut&tilt&rx&ry` 同参同图（像素 diff = 0） | 隔离栈真页切出海报并下载 | agy：slit-scan 视觉参考 20 条 + 「海报烙印」排版参考 |
| W3 | FV-W3 抽帧成片 + 翻面读稿 + 门环 + 爆炸分层 | 视频 seek 与 t 对齐 ≤ 1 帧（`requestVideoFrameCallback`，W20 采纳）；环数 == manifest.rings 数；层数 == 1 + 5（TOPOLOGY §2 表：D 开发 + 五个锁） | 四交互 Live | agy：`<video>` seek 精度与 `requestVideoFrameCallback` 坑 |
| W4 | FV-W4 片库布局 + 快门进馆 + S2 闭环陈列 + dogfood 段 + S3 收官 + `film` token 四消费点 | about 仍 fade（负控）；reduced-motion 直达终态 | 全程 Live 走一遍 | agy：2026 展陈式滚动叙事参考（限制：单母题） |
| W5 | FV-W5 接线 + e2e + 海报 + sitemap + 五门 | e2e ≥ 12 例含 2×2；about/nexus e2e 零回归 | `/world/frame-vault/` 200；城里 E 进楼；回城 `film` | agy：接线清单反核 |
| W6 | FV-W6 盲评（xhsapi A 段只给分 + B 段核声称）+ 修 + LIVE_OBSERVED | 面板分读自 report 文件 | 隔离栈真开 | — |
| 可选 | FV-X WebGPU 后端（WGSL 同算法） | 同引擎双后端切换 | — | — |

每波收口：门绿后必看图（第二楼 LESSONS 第 8 条）；数字从产物读不从记忆抄；台账/流水同笔回写。

# 5. 节律与停门

- 每波末：build + gates rc 链式 → commit（不 push）→ 台账/流水/LESSONS 三处回写。
- 停门：连续 3 轮某维最低分不变且无新一手实证 → 该维停施工上抛；A 维 ≤4（「播放器加特效」判定）→ 立即停，回草案改载体不改参数。
- 磊哥说「go」前：只有 W0 两票（文档 + spike）；**不开分支、不写业务代码**。

# 6. 硬禁区

1. 不重述前两楼任何 shader / 交互（技术必须不同）。
2. 不为哇感造假数据：环、锁灯、指纹全部来自 manifest → raw 文件；缺则不画。
3. 不把工作剪当成片：未过 F 锁的集必须显示阶段与 label。
4. 不做移动端斜切/抽帧（桌面优先是裁决不是偷懒；移动端「只看」态必须体面）。
5. 不在 manifest / HTML / 海报烙印里出现本地路径、账号、`producer_path`。
6. 不引三方渲染库（three.js 等）进 hall chunk。

# 7. ADR（董事会）

| # | 议题 | 触发 |
|---|---|---|
| ADR-FV-1 | 视频托管方案（外部对象存储 vs 仓内重编码） | 磊哥答 §0.2 后若仍两可 |
| ADR-FV-2 | 图集编码（WebP vs AVIF vs PNG 无损） | W1 实测后 |
| ADR-FV-3 | WebGPU 后端是否进主线 | W5 后 |

# 8. NEEDS_LEIGE
见草案 §9（七条，各带 ⭐）。另加：**「go」信号**——开分支与 W1 之前需要磊哥一句「go」。

# 9. 停止与交接
停止条件：W6 LIVE_OBSERVED 且五门绿且盲评 A ≥7；或磊哥叫停。交接物：台账 `FRAME-VAULT-INDEX.md` + 流水账 + LESSONS + handoff。
