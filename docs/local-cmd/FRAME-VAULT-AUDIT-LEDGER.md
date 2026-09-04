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

## R3 · W3 四交互施工 + W24 收稿（2026-09-05 凌晨）

### R3-1 W24 agy「帧精确 seek」收稿（flash，产物 27.9 KB，脚本 `~/studio-data-root/hall3-spike/seek-test/run_seek_benchmark.py`，结果 `benchmark_results.json`）
- 30 个伪随机时刻实测（Chrome 152，EP3 默认 GOP 250）：`|mediaTime − t|` p50 17.7 ms / p95 31.4 ms / max 32.3 ms，全部 ≤ 1 源帧 `[agy 实测，表格 30 行逐行给出；未亲跑脚本，抽核 3 行数字与 json 一致——待补]`。
- 采纳：**不重编码短 GOP**（体积 +75%、精度 +0）；`currentTime = t` 与 `play()` 必须在手势同一同步段（已改 `pull()`，之前 await loadedmetadata 会耗尽用户激活）；`fastSeek()` 禁用；rVFC 回写（已在用）。
- 驳回/搁置：WebCodecs 自解管线（过重，留作储备）。

### R3-2 W3 已落地（`e67c04f`、`189a50c` + 本批）
- 抽帧成片：双击/Enter → 切面抽出为真 `<video>` 从刀锋时刻续播（真机：seek 178.6 s 落 179.8 s 含 1.5 s 播放；rVFC 回写 cut 与 `currentTime/duration` 一致到 1e-4）；单击/Esc 放回；**全屏（F / 按钮）+ 下载 mp4** 按磊哥「全屏 → 退出 → 选其他 / 下载」流程补齐；全屏后焦点落 body → 键盘监听改挂 document。
- 片架：1–8 / 点击切集，帧体重装（引擎 `unload()` 先释放三张纹理），URL `?ep=` 记忆并优先于 SSR 默认集；EP4 切换后 21 条退回 → 19 枚环（同秒合并成粗环，`data-count`）。
- 门环：客户端按 manifest.rings 渲染（Astro scoped 样式作用不到 JS 创建节点 → `<style is:global>`）；悬停卡出原话 + 缺陷类 + 修复版本；点击刀锋跳到 `time_s`（实测 cut 0.0589 == data-t）。
- 布局：舞台 `clamp(420px, 64svh, 760px)`，标题块移到左上，标尺进首屏（之前被页头 69 px 顶出视口，门环悬停不到）。
- **未做**：翻面读稿（台本无时间对齐源：EP2/EP3 无 srt/DIRECTOR，只有烧进画面的字幕；候选 = whisper 对成片音轨做词级对齐，派 agy 下一波）、爆炸分层（W4 与 S2 一起做）。

### R3-3 e2e 骨架收稿（sonnet 子代理）
- `e2e/frame-vault.spec.ts` 202 行 6 例，tsc 零错；其自报「project 应为 `desktop-chromium`（`--list` 验证）」`[未亲核]`；尚未实跑（需停掉 4321 上的 nexus preview 或改端口，W5 处理）。

### R3-4 环境光（磊哥 2026-09-05 凌晨问「立方体周边都是黑色的？」）
- 之前舞台纯片库黑。本批在片元着色器加：放映机光锥（屏幕空间软亮区，左上打下）、地面 y=-0.92 暗平面（距离衰减 + 盒脚接触阴影 + 反射射线再打一次盒子的柔和倒影）、边缘暗角。仍是单 pass 单 draw，无额外纹理；真机 120 fps 未变 `[目测 HUD]`。截图 `shots/vault/01-idle.png`（新）。
- 未做：浮尘粒子（草案 §3.1）——留到 W4 快门进馆一起做，避免常驻粒子抢主体。

## R4 · W4 开工：快门 token + S1 盲评整改（2026-09-05）

### R4-1 `film` token 四消费点落地（`bc0196c`）
- `PoiArrival.ts`：`arrivalFx()` 认 `'film'`；`lingers()` 把「驻留到跨文档」从 ink 特判改成 ink|film；快门 CSS 注入（上下叶板 .34 s 合拢 + 85–91% 一格白闪 + 终态全黑；reduced-motion 淡入全黑）。
- `index.astro` 回城幕布：`[data-return-fx='film']` 黑幕 + 金色进度条。`HallChrome.astro`：退场快门 380 ms。`VaultArriveHead.astro`：`from=city&poi=workflow-foundry` 首帧黑帘，Vault 进 idle 后 .12 s 让位。
- 楼侧真机目击（`.tmp/vault-film.mjs`）：首帧 `html.vault-transit`；idle 后类卸；`sessionStorage[world-return-v1]` 写入 `{poi:"workflow-foundry"}`；返回链接 `?poi=workflow-foundry&from=hall`；点击后 `data-hall-leaving-fx=film`。城侧到达（E 进楼）未真机目击，交 W27 terra e2e / W5。

### R4-2 kimi k3 盲评（一路，A 段只给分；`~/.codex/state/nexus-hall/out/W26-k3-blind.md`，附三张真机图 + 草案节选）
- 分：A 6 / B 7 / C 4 / D 7 / E 8 = **32/50**。总评：夸「母题纯度——切片数、sha、门环全来自真实构建记录」；挑「主体小且暗；底栏时码 + 播放式标尺把它拽回剪辑台，像精致的 MRI 查看器」。
- 采纳（全部事实型，当场改）：快捷键串收进 `?` 弹层（E「把 README 贴进展厅」）；HUD 只留 22 px 时码为主、帧号/切法降级；标尺改金属轨 + 刀片形刀锋（去播放器语义）；门环朱红边 + 「N 次人审退回坐在时间轴上」标签（B「环没有身份」）；机位 2.75→2.35、纸面对比 +12%、基础光 .72→.84（A「主体小且暗、正面发灰」）。截图 `shots/vault/13-ep4-after-k3.png`。
- 磊哥令（同时段）：**k3 只开一路**——两份 k3 席位定义已改，记忆 `feedback-k3-single-lane`。
- 不重审刷分；W6 盲评另派异源席。

### R4-3 管线补全集状态
- `frame-vault-build.mjs` 新产 `src/data/frame-vault/episodes.json`（7 集：EP2 F/85 分、EP3–5 P、EP6 A / EP7 S / EP8 D 无成片 → 线框），供 S2 陈列；glob 排除 `episodes`。

## R5 · 城侧到达闭环 + e2e 首绿（2026-09-05）

### R5-1 城 → 第三楼真机目击（`.tmp/city-film-arrive2.mjs`，Apple M5）
- 首次探针：按 E 后 263 ms 内即跳转，**快门没合**——根因不是 token，是 `camera-shots.json` 无 `poi_showcase-workflow-foundry`，`PoiArrival` 无 showcase 条目时降级为直跳（Areas.ts 注释「无条目楼由 PoiArrival 内部降级为 Phase 1 直跳」）。
- 修：新增 `poi_showcase-workflow-foundry`（about 机位沿南北轴镜像：θ −76、lateral +14、radius 110、lookAtHeight 9），`tools/camera/audit-shot-ndc.mjs` 门 2/2 PASS（ndc.x ∈ [−0.673, 0.096]，八角 8/8 入帧）。`a760abc`。
- 复测：E 后 1.09 s 挂 `world-poi-hold-film` + `data-poi-arrival-fx=film`；截图 `20-city-film-40.png` 上下叶板合拢中（中间一条城景）、`-180` 白闪、`-300/-400` 全黑；跨文档落地 `?from=city&poi=workflow-foundry`，首帧 `html.vault-transit`。城→楼→城三段快门母题闭环。

### R5-2 W27 gpt terra e2e 收稿（`~/.codex/state/nexus-hall/out/W27-terra-e2e.log`，rc=0，1206 s）
- 打到本 worktree 的做法：`E2E_PORT=4341`（config 读 env）+ 自起 `astro preview --port 4341`。
- `e2e/frame-vault.spec.ts`：**6/6**（desktop-chromium）。它改了门环用例：默认集 EP2 无环导致 skip → 改为显式 `?ep=ep3` 真环点击验证，不以跳过掩盖链路（采纳，合理）。
- `e2e/cyber-city-return.spec.ts`：**5/5**（world-chromium）零回归。首轮一次 404 + 2 did not run，单跑与整组复跑均绿，归因 UNKNOWN（服务时序），按「观察一次」记，不改 spec。
- 自报「未 kill 4321/4324、未 git 操作」与 `git status` 一致 `[亲核]`。

### R5-3 W5 收口读数（2026-09-05 凌晨）
- 本 worktree 六门全绿 `[实测 sh -c 逐门取 rc]`：nexus-ledger-gate 0 / nexus-budget-gate 0 / about-hall-gate 0（G-Hall-1..9）/ check-links 0 / frame-vault-gate 0（checked=4）/ audit-shot-ndc 0（13/13 含新机位）。
- `astro check`（CI 类型门，本机这次跑起来了）：4 错 → 0 错（manifest 类型补 `reviews`、`video.sha256/bytes` 必填），`6de668f`。
- hall chunk：`Vault.astro_astro_type_script…js` raw 21,059 B / **gzip 8,409 B**（D 维 ≤50 KB）。
- 海报（sonnet 移植 `nexus-poster.mjs` → `frame-vault-poster.mjs`，255 行）：首版把标题块/片架截进图，降级态与 SSR DOM 重影（`23-unsupported.png`）→ 截图前 `addStyleTag` 藏覆盖层，重出 idle 14.6 KB / tilted 16.8 KB，非底色 23.0% / 21.9%；其「视口 780×1000 才过 ≥20% 门」的偏离合理（盒子像素随高度不随宽度缩放）。
- 移动端只看态：≤768 单指横滑 = 刮时（`b657b1c`）。

## R6 · W6 异源盲评 + 整改（2026-09-05）

### R6-1 seed（doubao-seed-2.1-turbo，视觉主席，一路）盲评 A 段
- 附五张修后真机图（首屏 / 斜切 / EP4 门环悬停 / 抽帧成片 / 拆开 S2）+ 草案节选，评审不知 k3 分数。
- 分：A 8 / B 7 / C 8 / D 7 / E 9 = **39/50**（`~/.codex/state/nexus-hall/out/W28-seed-blind.md`）。C 维 8 与 k3 的 4 是同一批整改前后的两次独立读数，不同席不同帧，**不作「+4」归因**（两次之间改了不止一处）。
- 总评：夸「时间固体概念落地完成度高，视觉/交互/生产链路统一在同一母题」；挑「首屏缺轻量引导、集数锁状态 P/F 语义模糊、时码大字分散注意」。
- 采纳（事实型，当场改）：片架格子字母后补锁名（`P 画面锁`）；一次性引导条（idle 1.2 s 浮出、首次输入或 7 s 收、sessionStorage 只出一次，移动端不出）；时码 22→18 px。真机复核 nudge 出现→滚轮后消失 `[实测]`。
- 不采纳：无。

### R6-2 LIVE_OBSERVED：隔离栈（本 worktree dist，127.0.0.1:4324）真 GPU 全程一镜（`.tmp/live-walk.mjs`，截图 `shots/vault/walk/1–6`）
- +3.6 s 城 ready（`?poi=workflow-foundry` 深链）→ +8.1 s 按 E 挂快门 → +8.5 s 跨文档落地 `?from=city&poi=workflow-foundry` → +8.9 s 帧库 idle → 刮时 + 斜切（cut .67 / tilt .24，phase tilted）→ 键 3 切 EP4（19 枚环）→ 点环 → Enter 抽帧成片（video 111.3 s 播放中）→ Esc → E 拆开（exploded）→ S3「回城」出口 → `?poi=workflow-foundry&from=hall` → +27.5 s car_ready，车在泊位 (18,−150)、yaw −3.14（车头朝街西向，`exitHeading` 缺省 = heading+180）、third 视角。
- 全程零 pageerror；三段快门母题 + 回城续驶接上。

### R6-3 回城幕布冷路径滞留第二次观察 + 墙钟兜底
- 一镜到底落地城侧 +1.5 s 截图仍全黑（`walk/6-city-back.png`），而独立探针（`.tmp/return-timeline.mjs workflow-foundry`）+779 ms 即 `hidden`——与 NEXUS R40-2 同形状，同一现象两次。
- 修：`src/lab/world/index.ts` 收幕加 2.5 s 墙钟兜底（未收完则卸监听、相机复位、`--return-k` 0、`data-return-done`）。帧正常时无副作用（t≥1 已卸）。**未复现路径下无法证明兜底触发**，只保证黑屏上限 2.5 s。

## R7 · 翻面读稿的时间源：本机 mlx_whisper 接进管线（2026-09-05）

- 磊哥令：「不需要装模型，scout-r0 有现成的下载到转写工作流，杀掉直接用，mlx-whisper」。agy W25（跑了 40 min 在装环境）已杀，无产物。
- 本机实况 `[实测]`：`/opt/homebrew/bin/mlx_whisper`，缓存模型 `mlx-community/whisper-large-v3-turbo`（另有 small/tiny）；scout-x `runtime-x.sh:35` 同款调用。
- EP3 直跑：`mlx_whisper ep3.mp4 --model mlx-community/whisper-large-v3-turbo --language zh --output-format json --word-timestamps True` → 24.5 s 墙钟，227 句，词级时间齐全，首句 10.02–11.80「咱们还是从那辆车讲起」，末句 316.4–317.66「这集就讲到这」。
- 管线：`transcribe()` 按重编码视频 sha 缓存到 `evidence/frame-vault/<ep>/cues-<sha8>.json`，manifest 加 `script{source:'asr', model, segments, cues[]}`；门加「句子在时长内」「segments == cues 数」。两处产出侧修正：whisper JSON 裸 `NaN`（EP5 实证）→ 解析前换 null；片尾幻听句超时长（EP5 300–316 s > 306.7 s）→ 起点越界丢弃、终点夹到时长。四集：EP2 283 / EP3 227 / EP4 153 / EP5 80 句；门 4/0，selftest 3/3。
- UI：F 翻面（不在播放态时），`ry += π`，磨砂台本板浮出；当前刀锋时刻那句金色高亮并滚到可见（二分查 start ≤ t）；点句子刀锋跳过去；切集重建。对齐质量 `[未亲核逐句]`——ASR 是对成片音轨的转写，不是台本原稿；板头标 `ASR 对齐 · whisper-large-v3-turbo` 如实披露。
- 合流前 e2e：桌面 project 48/48（帧库 6 + 二楼 25 + 一楼 16 + 1）`[实测]`；world project 在跑。
