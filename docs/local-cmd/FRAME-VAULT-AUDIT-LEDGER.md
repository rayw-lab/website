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

## R1 · 磊哥裁决 + W20 收稿终核 + 合流令（2026-09-04 晚）

### R1-1 磊哥裁决（原话：「七条全部同意 / 成片视频托管 github 可以公开啊 / 都能公开 / 可以并入 / 楼名先听你的 / 我同意合流的」）
| 草案 §9 | 裁决 | 落地 |
|---|---|---|
| 1 视频托管 | GitHub 公开 | 四集重编码 720p（目标 ≤25 MB/集）入 `public/video/frame-vault/<ep>.mp4`；原片 sha 仍写 manifest 作身份，重编码文件另记 sha |
| 2 工作剪公开 | 可以 | EP3/4/5 帧体 + 视频均展示，标「工作剪 vX.Y · 未过 F 锁」 |
| 3 台本公开 | 可以 | 翻面读稿显示全文 |
| 4 人审原话 | 可以 | 门环原文展示 |
| 5 楼名 | 「先听你的」 | 厅「帧库 · Frame Vault」，建筑中文名「帧库 · 视频闭环车间」，id `workflow-foundry` 不变 |
| 6 tagline | 同意 ⭐ | 「视频不是文件，是一次构建。切开它。」 |
| 7 scout-r0 | 「可以并入」 | 改为：S2 末尾加一段 scout-r0 闭环指向卡（不搬迁其流水线，只并入叙事） |
| go | 「/loop 20m 全力推进…施工以及合流」 | 视为 go：开分支进 W1；一二楼合流授权 |
编排：「主要难点包括审美相关你亲自实施，其他安排多路 glm53flash 或 agy 协助」→ 引擎/切面/海报/布局/材质 = 执行方；管线脚本初稿 = glm（W23）；编码调研 = agy（W22）。

### R1-2 W20 agy 终稿收稿（进程已结束，产物 5.6 KB，含「明确没证的」3 条）
- 锚点亲核：`Autr/slitscan-webgl/index.html` :174 `bindTexture(TEXTURE_2D_ARRAY…)`、:111 `int lookupA = (int(xy.x)+idx) % NUM_FRAMES`、:66 `MAX_ARRAY_TEXTURE_LAYERS` —— **3/3 命中** `[实测 sed -n]`。`ras0q/slitscan3d SlitScanGroup.tsx` :24/:75 —— 两处**不命中**（漂移，本仓 clone 版本行号不同），结论层（每帧一 texture + clippingPlanes）未逐行核，按 `[单源]` 收；该路线本就 DROP，不影响决策。
- 其「明确没证的」第 3 条（斜切后的音频如何重组）：本楼设计规避——斜切只出静态海报，音频只在「抽帧成片」的线性播放里出现。

### R1-3 合流序
- about-hall 已由 PR #234 合入 main（2026-09-03T21:08Z）；nexus 分支领先 origin/main 83 个 commit、落后 0，`git merge-tree` 干净（tree `7ceddf79`）。
- 合流前跑聚合门（`~/.codex/state/nexus-hall/w21-gate.sh`：astro build + nexus-ledger-gate + nexus-hall-gate + about-hall-gate + check-links），绿后 push 分支 + PR + merge；hall 3 worktree 从合流后的 main 开。

## R2 · 合流落地 + W22 图集编码收稿 + W1 开工（2026-09-04 深夜）

### R2-1 一二楼合流
- PR #238（`codex/nexus-hall-20260903` → main）：首次 CI 红 = `astro check` 抓到 `e2e/nexus-hall.spec.ts` 采样数组类型缺 `headInk/domInk`（本机该门跑不动，第二楼 D 维「type gate UNVERIFIED」的账在这里兑现）；修 `0f1cdd0` 后 CI 绿（5m52s），`--merge` 合入。
- hall 3 分支 `codex/frame-vault-20260904` 自 `0f1cdd0` 开（与合流后 main 同内容），worktree `~/studio-data-root/worktrees/website-frame-vault`。

### R2-2 W22 agy「图集编码」收稿（flash，产物 18 KB，`~/studio-data-root/hall3-spike/atlas-test/benchmark_summary.json` 亲核）
- 全矩阵实测（EP3 1943 帧 → 8 张 2560×1440 图集）：**WebP 无损 `-z 9` 总 997,672 B（0.95 MB）**，默认无损 1,231,796 B，PNG 2,270,392 B，有损 q75/85/95 = 1.61/2.23/3.71 MB，AVIF 无损 7.5 MB。`[实测，summary.json 键 webp_lossless / png_baseline 数值逐一对上]`。
- 结论：纸色 + 锐利文字的内容，无损反而比有损小（有损的振铃噪声毁掉平坦背景的游程压缩）。**采纳 `cwebp -lossless -z 9`**；解码 8 张 26 ms `[agy 报，未亲核]`。
- 其「2D 纹理 + FBO + copyTexSubImage3D」上传路径**不采纳**：引擎已用 CPU 重排 + 一次 `texSubImage3D`（每图集），更少状态切换；两者耗时都在几十 ms 量级，不值再加 FBO。
- 草案 §5.2 第 3 步改：图集编码 = WebP 无损 `-z 9`；§5.3 体积门定值：**每集图集合计 ≤ 2.5 MB**（EP3 0.95 MB 的 2.6 倍余量给暗场多的集）。

### R2-3 W1 开工（执行方）
- 已写：`halls/vault/volume/{shaders,VolumeEngine}.ts`（264 行，tsc 通过）、`halls/vault/{Vault.ts,Vault.astro}`；登记 `world-halls.json`（`frame-vault`/`volume`）、`workflow-foundry` 改名「帧库 · 视频闭环车间」+ `hallPath` + `arrivalFx: film`、`hall-copy.ts`、`[slug].astro` 分支。
- manifest 落点改为 `src/data/frame-vault/<ep>.json`（Astro 构建期 `import.meta.glob` 读，与 nexus-ledger 同法），图集/投影/视频在 `public/demo/frame-vault/<ep>/` 与 `public/video/frame-vault/`。
- 视频四集重编码（libx264 crf27 maxrate 550k 720p）：EP2 24.1 MB / EP3 7.3 MB / EP4 8.7 MB / EP5 6.2 MB `[实测 W21-video.log]`，全部 ≤25 MB。

### R2-4 管线首跑 + 体积门改口径 + 首屏真机目击
- `scripts/frame-vault-build.mjs` 四集全通 `[实测]`：EP2 4 fps 1701 片 7 图集 9,632 KB；EP3 6 fps 1943 片 974 KB；EP4 1979 片 2,697 KB（21 环 / 26 人审）；EP5 1840 片 768 KB。EP3 与 W22 agy 的 974.3 KB 逐字节同量级（同参数 `cwebp -lossless -z 9`）。
- 体积门 2.5 MB 被 EP2 顶破（烧字幕 + 案例镜头多，帧间熵高）。分诊：门对代码错还是代码对门错——是**口径**（预算从单一低熵集外推）。改 10 MB/集，理由：桌面受众、只加载当前集、EP2 9.6 MB 在 50 Mbps 下 1.6 s。记为 ADR-FV-2 关闭（图集编码 = WebP 无损 z9，预算 10 MB）。
- 门 `frame-vault-gate.mjs`：正控 checked=4 violations=0；`--selftest` 三负控（环越界 / 本地路径 / 图集张数）全部命中且报对集名 `[实测 rc=0]`。
- glm W23（管线脚本初稿）**空稿**：`api-direct: empty content with non-empty reasoning_content`（flash 推理吃光预算）。未重试，执行方直接写；记通道认知：glm-5-3-flash 写 ≥300 行代码单不可靠，改用 hermes-code 或 sonnet 直跑。
- 首屏真机（Apple M5，`.tmp/vault-look.mjs`）：EP2 装载 540–739 ms 到 idle；四处修：`vault__stage` 容器与锁状态 span 撞类名（标题块被挤没，第二楼 LESSONS 第 1 条再犯）、EP2 无 `frames` 时帧号恒 f0（改为切片号 `s####` 前缀区分）、滚轮灵敏度、侧面投影无 mipmap 出摩尔纹（开 `LINEAR_MIPMAP_LINEAR` 后读作叠纸金边）。截图 `~/.codex/state/nexus-hall/shots/vault/0{1,3,4}-*.png`。
