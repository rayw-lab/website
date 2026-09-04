# FRAME-VAULT · 审计流水账（append-only）

> 台账 = `FRAME-VAULT-INDEX.md`；本文只追加不重写。每条记**当时依据 + 亲核证据 + 裁决**。

---

## R0 · W0 立项：三路调研收稿 + spike 实测（2026-09-04）

### R0-1 三路 agy 发散调研收稿裁决
- 产物：`~/.codex/state/nexus-hall/out/W19-agy-hall3-a-webgl.md`（vgpu/shallot 等 WebGPU 栈）、`-b-craft.md`（git-city、CozyClay teardown）、`-c-story.md`（WebGPU/等距/物理/open-canvas 趋势）。
- 依据：三路各自独立给出的「第三楼形态」会聚在等距工厂 / 时间线 / 节点图三种；同一 prompt 同厂商的一致性接近零信息量（parallel-instruction 规则 3），且三种形态都是 AI 常见默认，判为 AI 指纹，**不采纳为载体**。
- 采纳：a 路「2026 三.js 共识 = WebGPU/TSL 主流 + 滚动即叙事引擎 + 一个硬点子做干净」→ 进草案 §1.2 单母题与 §6 WebGPU 备选；b 路两条交互「坏帧扔进去弹回」「拉闸门放行」→ 吸收为门环（§3.6）与爆炸层 L3 灯（§3.7），不做独立玩具；c 路趋势清单 → 草案 §8 对照表「网上先例」列的种子。
- 我的补充调研（主线程 WebSearch）：Fable 5 在 X/Reddit 被讨论的前端作品特征 = 克制 + 单一母题；写进 §1.2。

### R0-2 spike 实测（`~/studio-data-root/hall3-spike/`，Apple M5，Chromium headed `--use-angle=metal`）
- 命令：`ffmpeg -i ep3-workcut-v2.17.mp4 -vf fps=6,scale=160:90 -pix_fmt rgb24 -f rawvideo` → 1943 帧 83.9 MB（gzip 9.3 MB）；2 fps → 648 帧 28.0 MB（gzip 3.1 MB）。
- 探针：`.tmp/spike-look.mjs` / `spike-look2.mjs`（worktree 内，`@playwright/test`）。读数（`window.__spike`）：`maxTex3d=2048`；`texImage3D` 84 MB `gl.finish()` 后 7–16 ms；拖动中 118–123 fps（1440×900，dpr 2）。
- 截图：`~/.codex/state/nexus-hall/shots/spike/spike-raw-6fps-t0.35-c0.55.png`（斜切面 = 纸色帧 + 暗场断层，成立）；`spike-inkacc-*.png`（墨迹累积编码被暗场帧打饱和 → **否决**）；`spike2-trace-t0-rx0.55.png`（体纹理边缘当侧面 → 几乎空白 → **否决**）；`proj-xt-delta.png`（逐帧差分沿 y 取最大值的 x–t 投影 → 穿孔纸带质感，98.7% 列非空 → **采纳为侧面**）。
- 帧统计：纸色帧占 91.9%，暗场帧 4.9%（两段），活动帧（均差分 >2）10.3%。
- 裁决：技术栈 ⭐ WebGL2 `sampler3D` 自研薄引擎；侧面用预计算投影；时间片数 ≤2000（EP2 425 s → 4 fps）。
- 明确没证的：WebP 图集体积/画质；非 Apple GPU；`texImage3D` 真实提交时刻。

### R0-3 数据可绑定性盘点
- `fixtures/human-rejects.jsonl` 31 条，字段含 `time_s`、`frame`、`defect_class`、`quote`、`fixed_in`、`status`、`region` → 门环可绑定 `[实测 2026-09-04]`。
- `EPISODE-STATE.json`：EP2 stage F（sha `1034fc93…`、425.3 s、80.0 MB）；EP3/4/5 stage P（v2.17/v2.2/v1.9）；EP6/7/8 无成片，`gates` 四态 → 线框立方体。
- `quality-gates/known-defects/p0-known-defects.jsonl` 6 条；`HUMAN-REVIEW-LOG.jsonl` 33 行（`timecode` 可空）。
- 禁入字段：`producer_path` / `source_path`（含 `/Users/…`）。

### R0-4 建筑与登记
- `cyber-city-buildings.json`：`workflow-foundry` x48 z-150，泊位 (18,-150) heading 90，`deepLink /work/ai-native-workflow/`，无 `hallPath`/`arrivalFx` → W5 加法登记；`world-halls.json` 现只有 about-pavilion / agent-nexus。

### R0-5 W20 agy「GitHub-first 轮子」中途收稿（agy pro，进程仍在跑，报告 5.6 KB 时读）
- 产物：`~/.codex/state/nexus-hall/out/W20-agy-videocube.md`；clone 落 `~/studio-data-root/x-archives/hall3-research/repos/{shallot,slitscan-webgl,slitscan3d,slitscan3d-new,temporalis-new}` `[实测 /bin/ls]`。
- 三流派：WebGL2 `TEXTURE_2D_ARRAY` 单 draw（Autr/slitscan-webgl，`MAX_ARRAY_TEXTURE_LAYERS` 硬截断）/ three.js 每帧一个面片 + clippingPlanes（ras0q/slitscan3d，draw call 随帧数线性，>100 帧悬崖）/ Canvas 2D CPU 切片（positlabs/temporalis，主存 OOM）。
- 裁决：与 spike 选择一致——**采纳** `sampler3D`/array 单 draw 路线（我们已实测 1943 层 3D 纹理 120 fps，超过其 256 帧 ring buffer 场景）；**采纳** `requestVideoFrameCallback` 进 W3 抽帧成片的视频↔t 对齐；**采纳**运行时读 `MAX_3D_TEXTURE_SIZE` 硬截断（草案 §7 已有，其提到部分移动端下限 256 层，与我的 `[推断]` 一致，仍待查 spec）；**驳回**多面片堆叠与 CPU 切片；其「迁到 three.js Data3DTexture + TSL」建议不采纳（草案 §6 已定不引 three.js，理由：一个盒子不值 150 KB+）。
- 其 file:line 锚点（`index.html:174/111/66` 等）**未逐条亲核**，待进程结束后补核并在 R1 记结果；结论层已可用，锚点层 `[单源未审]`。
