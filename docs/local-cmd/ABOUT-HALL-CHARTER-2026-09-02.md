---
title: website · 第一栋楼「我是谁」About Hall · 长任务 loop 任务书（ABOUT-HALL）
type: charter
status: current
date: 2026-09-02
owner: 磊哥（董事会代理 = Grok 4.6 xhigh 常态一路，重大决策才咨询）
executor: Cursor 父代理（本会话模型，只编排 + 复审，不写业务代码）
loop: {LOOP} 一轮 · {HOURS} 小时（磊哥进 loop/goal 模式时填）
---

# 0. 一页纸

**远期目标**：赛博城市第一栋楼 `about-pavilion` 变成一页**极其炫技的自我介绍体验**——访客 10 秒"哇"，30–60 秒能复述"王磊是站在汽车 × 座舱 × 多语种 × 大模型 × AI 工作流 × 交付交叉点的解决方案经理"。验收只认 **Live 最终消费者**：GitHub Pages 构建产物在真浏览器（桌面 Chrome/Safari + 手机 Safari）里的实际观感与 fresh 批评者打分，不是文档自报、不是 build 绿。

**形态（已拍板，2026-09-02）**：
- 路由 **`/world/about-pavilion/`**（`/world/` 动效豁免区）= 炫技版；**`/about/`** 保留为纸面双胞胎（SEO / 移动端 / reduced-motion 兜底），升级触感但不做 3D。
- 叙事 = 「机器人的老家」× 8 幕 scrollytelling × 「真人 → hero-robot」首尾帧接力：首屏真人（或卡通/手绘化身）在工作台，鼠标横向 scrub 转头；滚动进入 sticky 长区间，视频 progress 驱动六站演进与三支柱文字点亮；真人解构为光子汇聚成城里那台 `HeroRobot.glb`（"回老家"）；尾段回归 DOM：三问题卡、讲者简介一键复制、回城 `/?poi=about-pavilion`。
- 技术骨架借 Paidax 帖（`docs/research/x-paidax-hero-research-2026-09-02/`）的两段交互提示词：pointer→`video.currentTime`；sticky 长滚动→progress→`currentTime`。**资产生成全部走本地 Grok Build**（`image_gen` / `image_edit` / `image_to_video` {6,10}s），生图备选 Codex/GPT 图像；**不参考、不出现任何外部生图生视频引擎名**。
- 真人照片可用（磊哥后续提供）；Grok 若拒真人脸 → 卡通 / 手绘化身版（保留辨识特征）先行。**i2v 在本项目解禁**；护栏 = 固定机位 + 单一主事件 + 小幅动作 + first/last 双帧独立审计。

**执行环境**：指挥官 = Cursor 父代理，只编排与复审；**禁用 workflow**；**先建任务索引再派单**。worker 三类（磊哥 2026-09-02 指定，可多轮多路多次）：① `glm-5-3-flash@ark-plan`（arktoken，原生视觉，`--attach-image`）承担开发切片与视觉复核；② `gemini-3.7-flash`（agy，能看图、能联网、能读写仓）承担调研 / 分镜 / 文档 / 秘书 / 批评者；③ Grok Build CLI（`grok -p`，grok-4.6 xhigh）承担生图生视频 + 编码 + 调研；**Grok 另常态化一路为董事会席**。**不再使用 gemini-3.1-pro。** 所有依赖与工具授权 worker 自行安装（写进 §0.6 依赖表）。

**理念**：功能为主；每个动效背后必须有真实信息（六站 / 三支柱 / 定位语 / 站内佐证链接），零装饰性粒子；失败也展示；不乱测不乱审；每波开工前先站巨人肩膀；worker 自报不算，宿主回读才算。

**节律**：`{LOOP}` 一 loop；每 `{SYNC}`（默认 4h）合流 + push loop 分支 + 一路沉淀。

**写根**：分支 `codex/about-hall-20260902` 从 `main`（HEAD `c585df9`）切出，独立 worktree `/Users/wanglei/studio-data-root/worktrees/website-about-hall`。共享 checkout `/Users/wanglei/mywebsite` no-touch；`origin/main` 只由磊哥或董事会拍板后 PR 合入；不 force push。媒体原盘与中间帧留 `/Users/wanglei/studio-data-root/about-hall/`，不入库；进仓只放压后 mp4/webp（预算见 §1.5）。

# 0.5 Step 0 · 起手调研包（首 1–2 loop 吸收，已在仓）

| 包 | 路径 | 规模 | 结构 / 用法 |
|---|---|---|---|
| 12 楼脑暴 | `docs/research/cc-halls-brainstorm-2026-09-02/` | 3 稿 + README | C 横幅 / B 展厅 / A Garage 架构；`world-arrival-v1` 快照、`hallPath` 加法字段、SRD 补 `/world/{slug}/` 一行 |
| Agent Nexus 四路 | `docs/research/agent-nexus-research-2026-09-02/` | 4 稿 | 本楼不用；但 N2 的「零 world 引擎字节 G-Hall 门」「不进 Lab manifest」纪律直接继承 |
| About 三路 | `docs/research/about-showcase-research-2026-09-02/` | P1 标杆 22 例 / P3 8 幕分镜 / P4 化身三概念 | **P3 分镜是 W3 的直接输入**；P4 编了年份（禁用）；P3 第 6 幕分数为示意 |
| Paidax 拆解 | `docs/research/x-paidax-hero-research-2026-09-02/` | 两段 Codex 提示词原文 + 27s 逐秒表 + 格式横评 + 24 条同类帖 | x1 §5.2 人设写错（全栈/Rust/年份）→ 只取结构；引擎名一律忽略 |
| 生成栈实证 | `raw/03-Output/规划/2026-08-27-cockpit-master-agent-video-0to1-playbook/12-runtime-gptpro-grokvideo.md`；`raw/03-Output/规划/2026-08-27-ep3-production/cloud-next-img01/IMG-01-LOCKED-v3.md`；`raw/05-Projects/座舱3.0科普系列视频/00-README.md` D-001/D-003 | — | IMAGINE-GATE 五步门、LOCKED 四段 fence 体例、零字铁律、negative 四轴、3 连 REJECT 熔断、sha/分辨率/时长回读；D-003 i2v 禁令**本项目解禁** |
| 提示词基座 | `raw/03-Output/规划/2026-08-27-ep2-image-video-consult/PINNED.md` 7 仓 + `select_runtime_prompt.py` | 7 repo | 只借镜头/光/节奏/negative 写法，不借主体 |
| 编排范式 | `raw/loop-commander/SKILL.md` + templates + lessons | — | 本 charter 的母版 |

边界：以上全是**调研与脑暴**，尚无一行 About Hall 代码、尚无一帧 About 资产；分镜与化身概念未经磊哥人审；真人照片未到。分工：Step 0 由 gemini-3.7-flash ×2 分读（一路读研究稿出 adopt/adapt/drop digest，一路读生成栈实证出「LOCKED 体例 + 门」摘要），指挥官综合 `STEP0-DIGEST.md`；改变波次的条目走董事会 DEC。

# 0.6 环境与依赖

最大化自主能动性：需要什么就装什么（brew/pnpm/pip/Blender 插件/CLI），不必请示；装了写进 `docs/local-cmd/ABOUT-HALL-TECH-ARCH.md` §依赖表；不改系统解释器、不动他项目 venv、需 sudo 写 `NEEDS_LEIGE`。重资源并发：Grok `image_to_video` 同时 ≤2 路；Blender 单实例；Playwright 全量 e2e 单实例（独占浏览器 10–20 min）。依赖清单与安装命令见 TECH-ARCH。

# 1. 目标事实

## 1.1 尺子（本楼专用，非提分 Loop 五维）

| 维 | 权重 | 谁判 | 口径 |
|---|---|---|---|
| A 哇感（10 秒） | 25 | 人门 fresh 批评者 ×2（gemini-3.7-flash + glm-5-3-flash 看图） | 首屏截帧 + 3s 录屏：是否想继续看；是否像模板 |
| B 复述（30–60 秒） | 25 | 人门 | 批评者只看录屏，写出"他是谁/差异化"，与定位一页纸比对 |
| C 真实性绑定 | 15 | 机器门 + 人门 | 每幕 `data-bind` 指向真实信息源（六站 id / 支柱 id / 佐证 URL）；无绑定幕 = FAIL |
| D 工程门 | 20 | 机器门 | build / astro check / G-Hall 零 world chunk / 视频体积与 fps / `/about/` LHCI ≥95 / e2e 新用例绿 / 无 secret |
| E 降级完整 | 15 | 机器门 + 人门 | reduced-motion、无 JS、移动端 9:16、无 WebGL 四态各有体面静态帧 |

面板分 = min。每轮先问 min 是谁。人分 = 磊哥独有，批评者分是机分，禁混写。

## 1.2 现状表

| 维/域 | 分/态 | 证据档 | 一句话卡点 | 本轮目标 |
|---|---|---|---|---|
| 路由 `/world/about-pavilion/` | 不存在 | — | SRD §12.7.1 写过"`/world/` 不再建立"，需补一行"楼内展厅 HTML ≠ 世界引擎入口" | W2 建壳 |
| 进楼会话 | 丢失 | `src/lab/world/areas/Areas.ts` `location.assign` 不带 query | `world-arrival-v1` sessionStorage 快照未实现 | W5 |
| hero-robot | 有 | `public/models/hero-robot/HeroRobot.glb` Idle/Walk | 无 Dock/Point/Salute 剪辑 | W3 程序化骨骼先行，不够再 Blender 加剪辑 |
| 真人照片 | 未到 | — | 磊哥提供 | W1 先用卡通/手绘化身跑通管线 |
| `/about/` 纸面 | 可用 | `src/pages/about/index.astro` | 零触感、零 3D | W4 升级触感 |

# 1.5 门形态

**机器门** `scripts/about-hall-gate.mjs`（W2 建，每轮自动跑，输出 `evidence/about-hall/GATE.json`）：
- `pnpm build` / `pnpm exec astro check` 通过；
- `dist/world/about-pavilion/index.html` 不含 `_astro/world.` chunk、`models/`、rapier wasm（G-Hall，继承 N2 §4.2）；
- 视频资产：每个 mp4 `ffprobe` 30fps、无音轨、时长 ∈ {6,10}±0.2s 或裁切后声明值、单文件 ≤ 预算（首屏 ≤600KB、过渡 ≤1MB、移动 9:16 ≤500KB）、总载荷 ≤2.5MB；poster webp ≤60KB；
- 每个 `<section data-scene>` 有 `data-bind`（六站 id / 支柱 id / URL）且 URL 在 dist 200；
- `prefers-reduced-motion` 下页面无 CSS animation 运行（Playwright 断言）；无 JS 时首屏文字与 poster 可见；
- `/about/` LHCI 四项 ≥95（`lighthouserc.json` 在册 URL 不降）；`/world/about-pavilion/` **第一刀不进 LHCI collect**；
- `rg -i 'api_key|access_token|sk-|ark-'` = 0。

**人门**（fresh 批评者，两席，只看像素 + rubric 切片 + 已定设计选择清单）：A/B/E 三维打分，|Δ|≤1（10 分制）通过，否则逐维复议。**已定设计选择（不再评）**：暗底 + 单色霓虹（楼色米 `#fef3c7` 为辅、机器人眼青 `#49c5b6` 为签名色）；机器人是馆长不是载具，馆内不变形；文字全部 DOM 不进 diffusion；六站无年份；不做加载进度条、鼠标跟随大球、打字机 Hero、技能条、奖杯墙。连续 3 轮人门震荡 <0.3 且机器门全绿 → 董事会决定是否以机器门为准放行。

# 2. 席位与编排

## 2.1 席位表（磊哥 2026-09-02 指定）

| 席 | 载体 | 职责 | 直跑命令 / 身份核验 | 已知故障与重发 |
|---|---|---|---|---|
| 指挥官 | Cursor 父代理 | 建索引、Giants、派单、收稿回读、合流、写 CURRENT AUTHORITY；**不写业务代码**（≤10 行文档/配置直改除外） | — | — |
| 董事会 | **Grok 4.6 xhigh 常态一路**（`grok -p` 纯推理，`--no-subagents --verbatim`） | 重大决策裁决 = 磊哥决定，落 `adr/ADR-n.md`；只裁不施工；历史拍死不重开；留磊哥的写 `NEEDS_LEIGE` | `stream_wrap.py --tag ah-board -- grok -p "$(cat $P)" -m grok-4.6 --reasoning-effort xhigh --no-subagents --verbatim --output-format json`；核 `modelUsage.grok-4.6-build`、rc=0 | proxy 断流重发一次；55 min 无产出视为挂起，改派 gemini-3.7-flash 出临时意见并登记 |
| 开发 worker | `glm-5-3-flash@ark-plan`（api_direct，原生视觉） | 展厅页组件、scrub 播放器、gate 脚本、`/about/` 触感；**看截图复核像素** | `python3 -B ~/.claude/scripts/api-direct/api_direct_job.py start --model glm-5-3-flash@ark-plan --prompt-file $P --out $OUT [--attach f] [--attach-image img]`；`status <job> --wait 300`；核 `served_model=glm-5-3-flash / identity_ok=true / fallback=null / effort=max` | 无工具、不联网：**输入靳代码文件用 `--attach`，产出为 patch/完整文件由指挥官落盘**；10–15 min/单 |
| 多面 worker | `gemini-3.7-flash`（agy，能看图、联网、读写 cwd） | 调研 / 分镜 / 文档 / 秘书 / 批评者 / 小切片实现 | `python3 ~/.claude/scripts/agy_rescue_cli.py --model gemini-3.7-flash --prompt-file $P --cwd $CWD --write --timeout 1500`；核 `~/.grok/state/agy-rescue/jobs/<job>/receipt.json` `served_label`+`identity_ok` | VPN 下 4–6 min connection reset：错峰重发一次，两败改席；写产物到 write root 才算 |
| 生成/编码 worker | Grok Build CLI（grok-4.6 xhigh，`--always-approve`，cwd = 生成 lane 目录） | `image_gen` / `image_edit` / `image_to_video`；也可编码与联网调研 | 同董事会命令但 `--max-turns 80 --always-approve`，cwd 指到 `/Users/wanglei/studio-data-root/about-hall/gen/<ticket>/`；每张图/每段视频必须本地文件 + SHA-256 + `ffprobe` 分辨率/时长回读写 `GEN-RECEIPT.md` | `SEND_ACCEPTED` 后禁重发；同叶 3 连 REJECT 熔断；**生成路与审计路必须不同 lane** |
| 秘书 | gemini-3.7-flash 每 loop 1 路 | 反核上一 loop"已完成" vs 文件/Git/日志事实，写 `LOOP-LOG.md` | 同上 | 只读 + 写日志 |
| 批评者 | gemini-3.7-flash + glm-5-3-flash 各 1 路 | 只拿录屏/截帧 + rubric 切片 + 已定设计清单；看不到像素写 BLOCKED | 同上（glm 用 `--attach-image`） | 不看代码不看建造者总结 |
| 沉淀席 | gemini-3.7-flash 每 `{SYNC}` 1 路 | 读本会话 jsonl + LOOP-LOG → `LESSONS-<hh>.md` + skill 草案 | 落 `raw/skills-distilled/about-hall/` | 不直写全局 rules/skills |

## 2.2 派单纪律
- 每单一个 0600 prompt 文件放 `/Users/wanglei/.codex/state/about-hall/prompts/<ticket>.md`（不要 `/tmp`）：目标、输入绝对路径、**唯一 write root**、no-touch、交付物、验收命令、停止条件；不放 secret。
- 热点文件单 writer：`src/pages/world/[slug].astro`、`src/layouts/WorldHallLayout.astro`、`src/lab/world/areas/Areas.ts`、`src/data/cyber-city-buildings.json`、`AGENTS.md`、`docs/spec/SRD.md` 每波只允许一票持有。
- 外部 worker 全能力，但不启停现役 dev server、不占 4321 / 4585 / 4587、不写共享 checkout、不 commit/push。
- glm 无文件系统：指挥官把它的产出落盘、跑门、回读；gemini/grok 有 cwd 写权限但 write root 必须是 worktree 内指定子目录或 `studio-data-root` 子目录。
- worker 自报"完成"不算；指挥官回读 diff、跑机器门、隔离栈真开一次页面。

# 3. 写根与 Git

```bash
cd /Users/wanglei/mywebsite
git worktree add -b codex/about-hall-20260902 /Users/wanglei/studio-data-root/worktrees/website-about-hall main
cd /Users/wanglei/studio-data-root/worktrees/website-about-hall && pnpm install --frozen-lockfile
```
- 提交身份用 `GIT_AUTHOR_*`/`GIT_COMMITTER_*` 环境变量，不改 git config。
- 合流（每 `{SYNC}`）：`git status` clean → fetch → merge `main` → `pnpm build && pnpm exec astro check && node scripts/about-hall-gate.mjs` → push loop 分支 → `git ls-remote --heads origin codex/about-hall-20260902` == HEAD 写 LOOP-LOG。每 2 个节点董事会拍是否开 PR 进 `main`（PR 由指挥官开、磊哥或董事会批）；`origin/main`、tag 永不直推。
- 不许：force push、amend 已推、`git stash`/`add -A`/`reset --hard`/`clean` 于共享树、把媒体原盘入库。

# 4. 环境、网络、现役

- dev/preview 只在隔离端口（`pnpm dev --port 4600+`、`pnpm preview --port 4700+`），Python socket bind 先证端口空闲；4321 为现役，节点外不动。
- 全量 e2e（86/19，~20 min）只在波次收口跑一次；loop 内只跑本楼新增 spec + `site-health`。
- Grok 生成产物落 `/Users/wanglei/studio-data-root/about-hall/gen/<ticket>/`，进仓前 ffmpeg 压制到 `public/media/about-hall/`。
- 凭据只走各 worker 自己的 0600 overlay；prompt/日志/证据不含值。

# 5. 任务索引

`docs/local-cmd/ABOUT-HALL-INDEX.md`（模板 `raw/loop-commander/templates/INDEX.md`）。状态机 `PLANNED → GIANTS_DONE → DISPATCHED → RECEIVED → HOST_READBACK_PASS|FAIL → MERGED → LIVE_OBSERVED`；只有 `LIVE_OBSERVED` 作验收。配套 `LOOP-LOG.md`、`adr/ADR-n.md`、`evidence/about-hall/**`。

# 6. 波次范围

| 波 | 目标 | Giants 方向 | write root | 最小 Live 验收 | 风险 / 禁区 |
|---|---|---|---|---|---|
| **W0 Step 0** | 吸收 4 个研究包 + 生成栈实证 → `STEP0-DIGEST.md`；建索引；董事会拍 3 决策（路线 C 双形态、化身兜底顺序、进楼快照契约） | — | `docs/local-cmd/` | digest 有 adopt/adapt/drop 三栏；ADR-1..3 落地 | 不派实现 |
| **W1 Hero 资产管线**（WBS-01） | 6 个场景的 LOCKED 四段 fence（真人版 + 卡通版 + 手绘版）→ Grok `image_gen/edit` 出 first/last → 独立审计 → `image_to_video` 6s → ffmpeg 30fps 无音轨 → 首屏 + 过渡两段 mp4 + poster 进仓 | 7 仓提示词基座写法；Grok Build `image_to_video` 参数实测（是否接受尾帧图）；scrub 友好编码（All-Intra / 短 GOP） | `studio-data-root/about-hall/gen/**`（原盘）+ `public/media/about-hall/`（压后） | 两段 mp4 通过机器门体积/fps/时长；人门 A ≥7 | 真人脸拒生成→卡通先行；3 连 REJECT 熔断；零字铁律 |
| **W2 展厅壳** | `WorldHallLayout` + `src/pages/world/[slug].astro` + `world-halls.json` + `HallChrome`（到达条/回城/探索 n/12）+ scrub 播放器（≤20KB gzip）+ `about-hall-gate.mjs` + SRD 补行 + `hallPath` 加法字段 | Paidax 两段提示词；Codrops OPTIKKA/KAI 的 scrub 实现；N2/L-TECH 的 G-Hall 门 | `src/pages/world/`、`src/layouts/WorldHallLayout.astro`、`src/components/city/`、`src/data/world-halls.json`、`scripts/about-hall-gate.mjs`、`docs/spec/SRD.md`（一行） | 隔离栈打开 `/world/about-pavilion/` 首屏 scrub 可用；机器门全绿 | 不进 Lab manifest；不 import `src/lab/world/**`；不加 LHCI collect |
| **W3 8 幕 scrollytelling** | 按 P3 分镜落 8 幕 sticky 长区间；每幕 `data-bind`；hero-robot 程序化骨骼三动作（注视/托举/致意）或新剪辑；六向晶体 + 六站地轨（SVG/CSS 优先，three 仅在 `/world/` 且预算内） | Codrops 2025-11 GSAP 3D scroll；CSS scroll-driven animations 2026 支持度 | `src/components/city/halls/about/**`、`public/media/about-hall/` | 人门 B ≥7；C 维 100% 绑定 | 禁 infinite 动画 >5 处；禁编年份 |
| **W4 双胞胎与降级** | `/about/` 触感升级（问题卡翻转、复制反馈、时间轴聚焦）；四态降级；移动端 9:16 视频；`/about/` LHCI ≥95 | Eduard Bodak 触感；Stefan 双体验 | `src/pages/about/index.astro`、`src/styles/` | E 维机器门全绿；LHCI 不降 | 正文页零 3D、零滚动劫持 |
| **W5 城市联动** | `world-arrival-v1` sessionStorage 快照 + `?from=city&poi=` + `hallPath` 接线；泊车进楼 → 展厅连续性；回城 `/?poi=about-pavilion` | L-TECH §1 | `src/lab/world/areas/Areas.ts`、`src/lab/world/arrival-snapshot.ts`、`BaseLayout.astro`（C 横幅） | e2e：城里 E 进楼 → 展厅到达条显示驾驶卡 | 与 #104 X2 文件域正交，不碰 `StreetProps/ForegroundFraming` |
| **W6 收口** | 全量 e2e 一次、批评者双评、PR、handoff | — | — | 86+n/86+n；人门三维 ≥7 | 不为过门改判据 |

# 7. 每 loop 节律
读态 → Giants（必做，产 `GIANTS-L<loop>-<主题>.md`）→ 决策（重大→董事会→ADR）→ WBS+文档 → 派单 → 收稿硬门 → 秘书 LOOP-LOG → 更新索引。**每 loop 任务必须充足**：默认一整族收口 + 下一族开工；禁"改一个常数一火"。未收完不 cancel，下一 loop 同 job 续。

# 8. 重大决策流程
决策包 → Grok 董事会一路 → `adr/ADR-n.md`。重大 = 换化身路线 / 改路由形态 / 动 `deepLink` 语义 / 视频预算上调 / 触碰 `src/lab/world/**` 引擎 / 进 LHCI collect。**已拍死不重开**：C 全覆盖 + B 展厅 + A 只给 Garage；机器人是馆长不变形；文字不进 diffusion；不用外部生图引擎；i2v 本项目解禁。**`NEEDS_LEIGE`**：真人照片与个人素材；人分；是否公开发布；PR 合入 main；`/privacy` 类账号设置。

# 9. 每 `{SYNC}` 节点
9.1 合流（§3）。9.2 沉淀：一路 gemini-3.7-flash 读本会话 jsonl + LOOP-LOG + receipt → `raw/skills-distilled/about-hall/LESSONS-<hh>.md` + skill 草案（≤2K）+ 三条别再犯。

# 10. 收稿硬门
照 `raw/loop-commander/SKILL.md` §6 + 本楼加项：Grok 生成物必须 SHA-256 + `ffprobe`/`identify` 回读；glm 产出由指挥官落盘后 `pnpm exec astro check` + 机器门；gemini 写文件后 `git diff --stat` 回读且不得越 write root；批评者分只入账不改判；`rg -i 'api_key|access_token|sk-|ark-'`=0。

# 11. 经验教训（内联）
- **来自座舱 MA 系列**：diffusion 不服从像素级硬边界（IMG-01 三连 REJECT 整族 KILL）→ 精确几何用程序层或留裁切余量；i2v 主体漂移是第一失败模式 → 固定机位 + 小动作 + 双帧审计；零字铁律；negative 四轴（人/字/商标/写实特征）；生成路与审计路分 lane，生成路自评无效；每张图 sha + 分辨率回读，"页面生成中 / URL / HTTP 200"不顶账；`SEND_ACCEPTED` 后禁重发；人分与机分两套账。
- **来自本站提分 Loop**：进楼 `location.assign` 丢会话；`SessionTimeline` 无轨迹；"39 语种"是口号实为 16；`audit-budget` G-D 排除 `world/` 前缀是陷阱 → 必加 G-Hall；SRD 写过"`/world/` 不再建立"需补口径；SwiftShader 下自定义 View Transition 是 flake 源 → 沿用 auto fade；`e2e-summary.json` 曾把文件数写成测试数。
- **来自今日三轮派单**：Shell 工具里 `nohup &` 会被连带杀 → `start_new_session=True` 脱离；glm-5.3（非 flash）附件 100KB 憋 20 min 零字节 → 用 flash；Grok 联网调研可能 55 min 无产出 → 设墙钟上限并改席；Gemini 3.7 Flash 会编年份/编人设 → 任务书写死"未知就不写"并抽查 3 条溯源；fxtwitter conversation 只是 `VISIBLE_CONVERSATION_SAMPLE`。
- **来自 loop-commander lessons**（整段见 `raw/loop-commander/lessons/*.md`）：fresh 批评者无记忆 → 设计选择清单随任务书下发；共享脏树禁 stash/pop；vendor 空壳假绿；worker 自报不算；凭据只在 overlay；热点文件单 writer；exit 124 只算 recovered candidate。

# 12. 硬禁区
§8 已拍死项；共享 checkout / `origin/main` / tag / 他人 PR；force、amend 已推；节点外启停 4321；workflow；无索引派单；一单多写根；worker commit/push；为过门改判据（含放宽体积预算、放宽 LHCI）；静态绿写 live；手写人分；日志含 token；导入外部生图引擎；媒体原盘入库；在 diffusion 里写任何文字；给六站编年份；编造磊哥经历。

# 13. 停止与交接
到点 / 磊哥叫停 / 连续 3 loop 无实质产出 → 索引终态、LOOP-LOG 总结、最后合流 + push + 远端回读、交接三块（收到哪 / Live 坐实了什么 / 下一轮先做什么）同文副本到 `raw/03-Output/规划/handoffs/`。下一任只承接 `NEEDS_LEIGE` / `DEFERRED_*`。

# 附录 A · 现成资产（别重造）
| 资产 | 路径 | 用法 |
|---|---|---|
| hero-robot GLB | `public/models/hero-robot/HeroRobot.glb` + README（Draco 管线） | 化身；材质名 Main/Accent/Grey/LightGrey/Black/Eye |
| 城市引擎 | `src/lab/world/**`（three r185 webgpu/TSL、rapier） | 展厅**不 import**；只借 `NeonMaterials` 思路重写轻量版 |
| Lab facade / LabStage | `src/lab/facade.ts`、`src/components/lab/LabStage.astro` | 不复用；展厅自建 ≤20KB 播放器 |
| 提分门 | `scripts/audit-budget.mjs`、`scripts/check-links.mjs`、`lighthouserc.json`、`e2e/` | 继承；新增 `about-hall-gate.mjs` |
| 定位单源 | `docs/website-plan/positioning-onepager.md`、`src/pages/about/index.astro`（三问题/六站/讲者简介）、`src/data/site.ts` | 全部文案来源 |
| Paidax 两段交互提示词 | `docs/research/x-paidax-hero-research-2026-09-02/01-*.md` | 改写成 W2 任务书 |
| 8 幕分镜 | `docs/research/about-showcase-research-2026-09-02/p3-storyboard-gemini-3.7-flash.md` | W3 输入（去年份、去示意分数） |
| Grok 生成实操 | `raw/.../12-runtime-gptpro-grokvideo.md`、`IMG-01-LOCKED-v3.md` | LOCKED 体例与门 |
| 7 仓提示词基座 | `raw/03-Output/规划/2026-08-27-ep2-image-video-consult/PINNED.md` | 只借写法 |

# 附录 B · 起点
`main` @ `c585df9`（#214 merge）；#104 `cursor/cc-vis-x2-facade-r2-1d6f` 仍 HOLD_DRAFT，本楼文件域与其正交，不合流、不引用其分支。
