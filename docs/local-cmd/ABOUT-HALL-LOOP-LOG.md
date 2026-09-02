# ABOUT-HALL LOOP-LOG

> tick 规则：指挥官每完成一轮「读态 → Giants → 决策 → 派单 → 收稿 → 更新索引」记 1 loop；每 10 loop 重写顶部看板并把 10 轮前的逐 loop 明细压成一行。tick 文件 `~/.codex/state/about-hall/tick.json`。

## 看板（L1–L10）

| loop | 时间 | 在跑 | 收稿 | min 维 | 下一步 |
|---|---|---|---|---|---|
| L1 | 2026-09-02 21:5x | G0 · D1D2 · G1 · S0-T gen · S0-H gen | — | 全维未开工 | 收 G1/D1D2 → 审计 → S6-T |
| L2 | 2026-09-02 22:25 | 审计 ×6（gemini/glm × S0-T/S0-H/S6-T v1）· S0-T v2 gen · S6-T v2 gen · W1e 纸 · W2a 壳 · W2b 播放器 | G0 digest · ADR-1 · ADR-2 · G1（i2v 被 ZDR 拦；image_gen 720p 无 seed/negative/尾帧；体积门修订；不用 blend）· S0-T/S0-H/S6-T v1 各 6 张 | A 维预评 S0-T 7.0 / S0-H 6.5 / S6-T last 8.5 first 4.0 | 收 v2 → 指挥官人门配对 → NEEDS_LEIGE：磊哥 `grok` 里 `/privacy` 关 ZDR 后 i2v |

## 逐 loop

### L1 · 2026-09-02 21:5x
- 做了：切 worktree `codex/about-hall-20260902`@`60b9035`（含 charter/WBS/arch/index/研究存档/AGENTS §5）；`pnpm install --frozen-lockfile` OK；写 LOCKED：CHARACTER-SHEET-v1（自磊哥两张照片提取：browline 半框眼镜、顶部有体积短黑发、圆脸、黑 polo 棕条，去品牌标）、S0-T v1、S0-H v1、S0-R v0（等原图落盘）、S6-T v1；派 5 路。
- 证据：`~/.codex/state/about-hall/logs/launches.tsv`；prompts 0600 于 `~/.codex/state/about-hall/prompts/`。
- 没做：真人照片未落盘（Cursor 附件不进文件系统）→ `NEEDS_LEIGE`；未生成任何正式资产（gen lane 在跑）。
- 下 loop：收 G1（工具契约/ZDR/GOP）→ 若 `image_to_video` 通 → S0-T/S0-H 审计单（gemini + glm 双席）→ PASS 后 i2v；收 ADR-1/2 → 更新索引；派 S6-T gen；派 W1e（S1–S5 纸，gemini）。

### L2 · 2026-09-02 22:25
- 收稿：`STEP0-DIGEST.md`（43KB，含 8 幕文案初稿与 4 项 DEC 建议）；`ADR-1`（T/H 先行、样张 ×3、叶级 3 连熔断、S0=桥定案、S6 唯一变身、motion 坐标系勘误）；`ADR-2`（hallPath 加法、query 锁 `from/poi`、快照最小字段集、SRD 补行原文、G-Hall 1–10 断言、展厅不进 LHCI）；`GIANTS-L1-i2v.md`（**image_to_video 被 ZDR 拒绝 ×2，原文已记**；image_gen 仅 16:9 1280×720、无 seed、无 negative、无尾帧；600KB 门连静帧都不过 → 草案改 2.0/3.5MB；不用 mix-blend）；S0-T/S0-H/S6-T v1 各 first×3 last×3 + 回执 + SHA。
- 指挥官人门预评：`~/studio-data-root/about-hall/gen/HUMAN-GATE-A-L2-commander.md`——S0-T 主路线候选但构图居中/人物过大 → v2；S0-H 改派 `/about/` 插图；S6-T 机甲 last #5 优秀、first 半身/chibi → v2。
- 派：S0-T v2 first+last、S6-T v2 first（沿用 v1 last #5）；审计 ×6 照收作硬门数据；W1e S1–S5 纸；W2a 壳（Grok 编码，ADR-2 口径）；W2b ScrubVideo（Grok 编码）。
- 文档：TECH-ARCH/WBS-01 预算按 G1 修订；提交 `43286a4`。
- NEEDS_LEIGE：① 在终端跑 `grok` → `/privacy` → 关闭 ZDR（i2v 唯一阻塞，SuperGrok Heavy 个人账号可自改）；② 原图落 `~/studio-data-root/about-hall/ref/formal.jpg` `selfie.jpg`。
- 下 loop：收 v2 → 人门配对 → 若 ZDR 已关则 i2v S0-T/S6-T；收 W2a/W2b → 隔离栈开页 → W2c 门脚本单；S0-H #1 交 W4 插图。

### L3 · 2026-09-02 23:50
- 收稿：S0-T v2 first×3/last×3、S6-T v2 first×3（chibi，REJECT 叶第 1 连）→ 改中景 v3 first×3/last×3；W2a 壳（astro check 0 err、20 页、G-Hall-2..5 零命中、`<script src>`=0、SRD 行在 L1033、check-links 全绿、隔离栈 4612：hall 200 / unknown 404 / about 200、到达条显示「个人档案馆 · 探索 0/12 · 返回科技城」）；W2b ScrubVideo（gzip **1041 B**）；W1e S1–S5 纸；`about-hall-frame-gate.py` 建立并按 ADR-1 §5 修订 G1/G2 口径（登记在 HUMAN-GATE 文件）。
- **指挥官人门定选**：S0-T 首屏 = `first-v2-3`（A 8.0）；S6-T = `first-v3-3` → `last-v3-2`（A 8.5）。poster `hero-s0-poster.webp` 41.7KB 已进仓。
- 故障：22:16 网络瞬态（Google TLS 超时 + Ark DNS 失败）打掉 6 路审计与 W1e 首发；W1e 错峰重发成功；审计改由指挥官脚本 + 人门承担（不再重发 6 路）。`brew`（worker 装依赖）升级 openvino 导致 ffmpeg dylib 断裂 → `brew reinstall ffmpeg` 源码编译中；期间用 Pillow 出 webp、`sips` 读尺寸。
- 席位变更：磊哥令 agy 全部用 **Gemini 3.8 Flash**；`agy_rescue_cli.py` 已由 LOOP24 会话把 `gemini-3.7-flash` 键映射到 3.8 (High)，agy pin 1.1.24，launcher 零改动即生效。
- 派：W2c（gate.mjs + e2e + media.json）、W3a（Hero 接 ScrubVideo + 8 幕骨架 + 暗色 chrome）。提交 `f996dff`。
- NEEDS_LEIGE 未变：`/privacy` 关 ZDR（i2v 唯一阻塞）；原图落盘。

### L4 · 2026-09-03 00:35
- 收稿：W2c（`about-hall-gate.mjs` G-Hall-1..9 全 PASS；`e2e/about-hall.spec.ts` 6/6 on `desktop-chromium`，跑法 `env -u CI E2E_PORT=<port>`；`about-hall-media.json` 登记 poster）；W3a（Hero 接 ScrubVideo + poster、六站 sticky 骨架、六向晶体 SVG、收官区、`[data-hall]` 暗色站头；三张截图）。宿主回读：check 0 err / build 20 页 / gate 全绿 / e2e 6 passed / check-links 一处红（悬空 `hero-s0-720p.mp4`）→ 指挥官 ≤10 行直改：Hero `<source>` 改由媒体清单驱动，无片不写；复验全绿。提交 `43fca3c`、`d44ea5f`。
- **指挥官人门（首屏截图）**：暗色站头到位、左侧文案床可读、卡通首屏气质成立；A 维预评 8.0 维持。六站幕为纯文字 + 线框 SVG，待 S1–S5 静帧。
- i2v：磊哥报 ZDR OK，但两路 i2v（S0-T ×6 调用、S6-T）与指挥官亲跑 canary（00:10）**仍被 ZDR 拒**，原文同前。已告知：若 `/privacy` 行显示 `ZDR · Admin Managed` 需在 xAI 控制台团队级关闭或配 S3 桶。`DEFERRED_EXTERNAL(zdr)` 继续。
- 工具：ffmpeg 源码重装仍在跑；已在 `~/.codex/state/about-hall/venv` 装 imageio-ffmpeg 静态 7.1 作兜底（`~/.codex/state/about-hall/ffmpeg`）。
- 派：W3b（S1–S5 first ×3，静帧路线，不出视频）；W5（`arrival-snapshot.ts` + `Areas.ts` 单 writer）；W4（`/about/` 触感 + 手绘插图 + LHCI 自检）。
- 待办登记：视频到位后 `about-hall-media.json` 需新增 `id: hero-s0` 条目（Hero 按此 id 取 `src16x9`）。
