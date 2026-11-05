---
title: FRAME-VAULT · 第三栋楼「帧库 · Frame Vault」设计草案（设计 SSOT · DRAFT）
type: draft
status: draft-for-leige
date: 2026-09-04
owner: 磊哥
executor: Claude Code 主线程（Fable 5.1）
building: workflow-foundry（x48 z-150，泊位 (18,-150) heading 90；楼名/厅名待拍，见 §9）
research: ~/.codex/state/nexus-hall/out/W19-agy-hall3-{a-webgl,b-craft,c-story}.md（三路发散）、W20-agy-videocube.md（GitHub-first 轮子，在跑）
spike: ~/studio-data-root/hall3-spike/spike.html（WebGL2 sampler3D 可行性，2026-09-04 实测，截图 ~/.codex/state/nexus-hall/shots/spike/）
---

> 证据等级标注：`[实测]` 附可复跑命令或截图；`[推断]` 我的判断；`[未坐实-待验]` 写进门之前必须补测；`NEEDS_LEIGE` 只有磊哥知道的私有事实或口径。
> 本文只写设计；施工口径（席位/写根/波次/门）在 `FRAME-VAULT-CHARTER-2026-09-04.md`。文案与正文**全部后补**（磊哥 2026-09-04：「文字或内容都是可以后续补充的」），本文锁的是技术栈、体系、产品设计、交互设计。

# 0. 一句话

**把一支几分钟的视频当成一块可以切开的固体。** x、y 是画面，z 是时间；访客拿一把刀在时间轴上刮（逐帧）、斜着切（一刀切出一张从没存在过的「时间海报」）、把切面抽出来（真视频从这一秒开始放）、翻到背面（这一秒对应的台本）、看到时间轴上的一圈圈「门环」（人审在哪一秒退回了什么）、按一下把它炸开成生产流水线的几层锁。整栋楼讲的是磊哥的自动化视频闭环：**视频不是文件，是一次构建的产物**（raw `TOPOLOGY.md` §5「一集是一次构建」），而这页本身也是同一条流水线跑出来的（§6 dogfood）。

前两栋楼的技术是「卡通视频大桥」（视频当平面播）和「水墨物理」（GPU 流体）；本楼技术换成**体纹理（3D texture）+ 切片/投影渲染 + 构建期视频管线**，交互面从「看」换成「切」。

# 1. 首屏与站序（桌面优先；移动端 §7）

可交互原型（本机 spike，已在服务）：`http://127.0.0.1:8765/spike.html?mode=raw&fps=6&tilt=0.35&cut=0.55`——拖动=旋转、滚轮=刀锋沿时间推进、←→=刀面倾斜。

```
┌──────────────────────────────────────────────────────────────┐
│ W.L. · CYBER CITY   Home Work …                     ← 回城  │
│                                                              │
│                 ┌───────────────┐╲                           │
│                 │  当前帧（纸色）│ ╲ 顶面：x–t 金色纸带        │
│   片架 1 2 3 4  │   切面 / 刀口  │  ╲                          │
│   ▮ ▯ ▯ ▯       │               │   │ 右面：y–t 纸带           │
│                 └───────────────┘   │                          │
│                   ╲_________________╱                          │
│  EP3 · 长期记忆检索 · 323.75 s · 1943 slices @ 6 fps · sha eda9f2b1 │
│  0 ─────◉──────────◉───────◉──────────────── 5:24   ◉=门环      │
│                                    [留影]  [拆开 E]  [翻面 F] │
└──────────────────────────────────────────────────────────────┘
```

## 1.1 首屏（0–10 秒，A 维「哇」）

- 全黑片库。中央一块**悬浮的深色长方体**（画面比 16:9 的正面，时间是纵深），六个面不是贴图：**正面是当前帧（纸色白板）**，四个侧面是金色「活动投影」——像一条穿孔纸带，记录这支视频每一秒在画面哪里动了笔（§4.3，图 `proj-xt-delta.png` 实测）。
- 进馆动画是**放映机快门**：先一格黑、一声「咔」、投影光锥打亮立方体，光锥里有灰尘粒子；随后立方体缓慢自转 20°，让人看见它是有厚度的。0.9 秒内完成，reduced-motion 直接终态。
- 左下角一行等宽字：`EP3 · 长期记忆检索 · 323.75 s · 1943 slices @ 6 fps · sha eda9f2b1`，全部从 manifest 渲染（§5），不手写。
- 立方体下方一条极细的时间标尺（0 → duration），标尺上有几个**金属环**（§3.6 门环），环是真实人审退回的时间位置。

## 1.2 站序（S0–S3）

| 站 | 内容 | 访客动作 | 秒表 |
|---|---|---|---|
| S0 门厅 | 快门进馆 + 当前集立方体 | 看 | 0–10 s |
| S1 帧库 | 七个交互（§3）；片架上 3–8 块立方体切换（键盘 1–8 / 点击片架） | 切、拽、抽、翻、按 | 10 s–3 min |
| S2 闭环 | 「一集是一次构建」：流水线陈列（D 开发 + S/A/P/M/F 五个锁 + L0–L3 门禁金字塔 + 人审日志）；**同一条管线如何把视频变成这块立方体**（dogfood） | 滚动阅读 + 点开收据 | 3–6 min |
| S3 收官 | 出口：回城（`film` 过场）、下一栋楼、系列视频外链、把当前「时间海报」带走 | 点 | — |

S1 与 S2 之间不是「滚动切换」而是**炸开**（§3.7）：把立方体拆成层，层落下来变成 S2 的流水线陈列，用户滚动时层沿时间轴排开。这是本楼的过场母题，全楼只用这一个母题（Fable 5 调研结论：restraint + single motif）。

# 2. 状态机（画 4+ 态，转移带 gate）

```
idle ──wheel/drag(t)──▶ blade ──tilt(←→/拖角)──▶ tilted ──「留影」──▶ poster(modal) ──esc──▶ tilted
  │                      │  ▲                       │
  │                      │  └──tilt→0───────────────┘
  │                dblclick/Enter
  │                      ▼
  │                   pulled ──video ended / click──▶ blade
  ├──F / 拖到背面──▶ flipped ──F──▶ idle
  ├──E──▶ exploded ──E / 滚回顶部──▶ idle
  └──1..8 / 片架──▶ idle(另一块立方体；淡出淡入 300 ms，帧体换纹理)
gates：blade→tilted 只在 desktop pointer；pulled 需 video 可播（manifest.video 非空，否则按钮禁用并说明）；exploded 需 EPISODE-STATE 有该集 gates 字段；poster 需 canvas 可读（WebGL 已初始化）。
reduced-motion：所有转移无 tween，直接终态；exploded 用静态排版。
```

# 3. 七个交互（每个：触发 → 画面 → 反馈 → 退出）

## 3.1 快门进馆（S0）
触发：路由到达（含从城里 `arrivalFx: film` 到达）。画面：黑→一格白闪→光锥→立方体亮起→自转。反馈：`data-vault-state=lit`；标尺与门环依次「叮」出现（无声音，只有光）。退出：任何输入进入 idle。
创新点：不是 loading 动画，是**放映机的物理动作**，和回城协议的 `film` 幕布同一母题（离开时快门合上）。

## 3.2 刀锋刮时（blade）
触发：滚轮 / 拖动立方体正面 / `←` `→`（单帧）/ `Shift+←→`（1 秒）。画面：正面那一帧在换，**侧面纸带上一条细亮线跟着走**（当前时间在纸带上的位置），标尺上的读数跳动 `01:23.500 · f2481`。反馈：切面边缘有 1px 金属高光（刀口）。退出：停 800 ms 后高光褪去。
真实性绑定：帧号 = `round(t × fps_src)`，fps_src 从 manifest（来自 `EPISODE-STATE.json.frames / duration_s`）。
`[实测]` spike：拖动时 118–123 fps，dpr 1（1440×900）与 dpr 2（2880×1800）读数相同——**贴 120 Hz 垂直同步上限，GPU 余量未量化**（`.tmp/spike-dpr.mjs`）。

## 3.3 斜切海报（tilted → poster）
触发：按住角把刀面拧斜（或 `←→` 配 `Alt`）。画面：切面不再是一帧，而是**一张左边来自 t₀、右边来自 t₀+Δ 的时间切片**（slit-scan）；白板上的字会被时间「拉」出错位，暗场切换在切面上成为一道黑色断层（`spike-raw-6fps-t0.7-c0.5.png` 实测可见）。反馈：右下角「留影」按钮亮起；点击生成 PNG（引擎离屏 2× 渲染，右下角烙 `EP3 · cut 0.55 · tilt 0.35 · sha eda9f2b1`），同时地址栏写入 `?ep=3&cut=.55&tilt=.35&rx=.35&ry=-.6`，**同一 URL 任何人打开得到同一张切面**（确定性渲染，和第二栋楼 `?demo` 同思路）。退出：tilt 归零回 blade；Esc 关海报。
磊哥已拍：海报可保存/分享（2026-09-04「第三点我听你的」）。
创新点：这是全站唯一一件**访客亲手做出来、且世界上此前不存在**的画面——它不是视频里的任何一帧。

## 3.4 抽帧成片（pulled）
触发：双击切面 / Enter。画面：当前切面从立方体里**抽出来**（0.4 s，沿法线方向），放大到画面 70%，切面边缘还带着一圈「体」的厚度；到位后切面替换为真 `<video>`，`currentTime = t`，自动播放（带音频，用户手势已满足）。立方体留在后面变暗，纸带上的亮线随播放前进。反馈：播放时标尺读数与纸带同步。退出：单击 / Esc / 播完 → 视频淡出、切面回位、blade 状态的 t 更新为停止位置。
真实性绑定：视频文件 sha256 前 8 位显示在切面角上，必须等于 `EPISODE-STATE.json.current_sha256` 前 8 位（构建期门，§5.3）。
视频托管：`NEEDS_LEIGE`（§9）。

## 3.5 翻面读稿（flipped）
触发：`F` / 把立方体拖过 180°。画面：背面是**该集的台本纵轴**（S 锁产物，`script_pack.narration_sha256` 指向的文本），台本按 cue 排在时间轴上，当前 t 对应的句子高亮、其余降为 40% 灰；背面材质是磨砂玻璃，能隐约透见正面的帧。反馈：滚轮在背面滚台本 = 同步移动 t（正面帧也在变）。退出：`F` 回正面。
内容：台本正文由 raw 仓 `ep*/…` 台本文件在构建期抽取，是否公开 `NEEDS_LEIGE`；结构（cue 数、时长）不待拍。
创新点：**画面和台本是同一块固体的两面**，而不是视频下方的一段文字。

## 3.6 门环（rings，S1 常驻）
触发：悬停 / 点击时间标尺上的金属环。画面：每个环 = `fixtures/human-rejects.jsonl` 一条人审退回（字段 `time_s`、`frame`、`defect_class`、`quote`、`fixed_in`、`status`，31 条实存 `[实测 2026-09-04]`）；悬停展开卡片：原话 `quote`（如「2:10秒那一帧突然消失了」）+ 缺陷类 + 修复版本；点击 → 刀锋跳到 `time_s`，切面停在**被人抓到的那一帧**，环变红一次。反馈：环的粗细 = 该集在此处被退回的次数。退出：移开。
真实性绑定：只渲染 `status == LOCATABLE` 且 `ep` 匹配的条目；`region` 非空时切面上画 bbox。
**吸收 agy 三路的「坏帧扔进去弹回」**：门环就是被弹回的帧，不另做玩具。

## 3.7 爆炸分层（exploded → S2）
触发：`E` / 按钮「拆开」/ 向下滚过 S1 末尾。画面：立方体沿时间轴炸成**阶段层**：一层开发（D 开发）+ 五个锁（S 台本锁 / A 样片锁 / P 画面锁 / M 声音锁 / F 定稿），名称与顺序照抄 raw `TOPOLOGY.md` §2 表（「一集分五个锁」`[实测 2026-09-04 读表]`），构建期读入不手写，每层是一块薄板，板上是该锁的产物指纹：台本 sha、导演稿 sha、工作剪 label、`gates.L0–L3` 四盏灯（PASS / OBSERVED / HUMAN_UNKNOWN / null 四态各有形）；没有成片的集（EP6–EP8）从一开始就是**线框立方体**，炸开后只有已过的锁是实心板。反馈：悬停某层的 L0 灯 → 显示该门当时拦了什么（`quality-gates/known-defects/p0-known-defects.jsonl` 6 条实存）；**吸收 agy 三路的「拉闸门放行」**：拨动 L3 灯不会放行——它只会展示「只有磊哥能签」这句话（`TOPOLOGY.md` §6：L3 唯一能签通过）。退出：`E` / 滚回顶部，层合拢。
层落下来后即 S2 的流水线陈列（滚动驱动，sticky）；S2 末尾是**dogfood 段**：「这块立方体自己怎么来的」——ffmpeg 抽帧 → 帧体打包 → 投影预计算 → manifest 指纹 → 门 → 页面，每一步给收据（§6）。

# 4. 视觉语言

## 4.1 材质与色
- 片库黑 `#05070d`（与城和回城幕布同底色），纸色帧面取自帧本身（EP3 白板均亮度 216/255 `[实测]`），金色活动投影 `#ffd278`，刀口高光 `#e8e6df`，门环金属 `#9aa3ad`、退回态朱红（沿用第二栋楼印泥色，跨楼只借这一个色）。
- 不用霓虹、不用玻璃拟态、不用渐变球。全楼只有三种材质：**纸（帧）、金属（刀/环/标尺）、光（投影锥/纸带）**。

## 4.2 立方体的六个面（这是本楼的视觉核心，spike 已定）
| 面 | 内容 | 来源 | 实测 |
|---|---|---|---|
| 正面（切面） | 当前帧 / 斜切时间切片 | 3D 纹理按刀面采样 | `evidence/frame-vault/spike/01-tilted-slice-raw.png`、`02-tilted-slice-raw-t0.7.png` |
| 顶/底（x–t） | 活动投影：每一时刻画面各列的运动能量最大值，金色纸带 | 构建期预计算 2D 图（N×160） | `evidence/frame-vault/spike/03-side-xt-activity-projection.png`（穿孔纸带质感，98.7% 列非空） |
| 左/右（y–t） | 同上纵向（N×90） | 同上 | `proj-yt-delta.png` |
| 背面 | 台本纵轴 | DOM/canvas 文字层 | — |

**为什么侧面不用原始帧**：spike 第一版侧面直接采体纹理边缘，得到一片米色（`01-tilted-slice-raw.png` 侧面；`91-rejected-edge-trace-sides.png` 换差分编码后侧面仍近空）；「墨迹累积」编码被暗场帧打饱和（`90-rejected-ink-accumulate.png`），两版均否决；白板系列 92% 帧是纸色 `[实测 paper-like ratio 0.919]`，边缘像素没有信息。改为「动了笔的地方」的投影后，侧面变成有节律的金色纸带，**而且它是诚实的**：亮点就是那一秒画面上有东西在动。这一点也回答了 advisor 的「内容贴合」质疑：不靠慢镜头高运动素材，白板系列自己的节律就是纹理。

## 4.3 排版
等宽字（`ui-monospace`）只用于指纹/时码/帧号；标题与说明用与前两楼同一套中文字体栈；字号阶 12 / 14 / 18 / 28 / 44，行高 ≥1.4；标尺刻度 10 px。首屏 3 秒内视线路径：立方体 → 时码行 → 门环。

# 5. 数据绑定（C 维：无绑定 = FAIL）

## 5.1 `src/data/frame-vault/<ep>.json`（构建期产物，每集一份；同一份复制到 `public/demo/frame-vault/<ep>/manifest.json` 供运行时 fetch）
| 字段 | 来源（一手） | 消费点 |
|---|---|---|
| `ep`, `title`, `stage`, `gates{L0..L3}`, `current_label` | raw `EPISODE-STATE.json.episodes[]` | 首屏时码行、线框/实心、爆炸层灯 |
| `sha256`（完整）、`bytes`、`duration_s`、`frames` | 同上 | 时码行、抽帧成片角标、门（§5.3） |
| `volume{ w:160, h:90, n, fps, atlas:[…webp], proj:{xt,yt} }` | `scripts/frame-vault-build.mjs` 从 mp4 生成 | 引擎 |
| `rings[]{ time_s, frame, defect_class, quote, fixed_in, status, region }` | raw `fixtures/human-rejects.jsonl`（按 ep 过滤） | 门环 |
| `reviews[]{ id, date, verdict, category, timecode }` | raw `HUMAN-REVIEW-LOG.jsonl`（33 行实存，`timecode` 可空） | S2 人审日志 |
| `locks[]{ letter, name, artifacts{…sha} }` | raw `TOPOLOGY.md` §2 表 + `script_pack` | 爆炸层 |
| `video{ src, poster }` | `NEEDS_LEIGE` 托管地址 | 抽帧成片 |

**禁止进 manifest 的字段**：`producer_path`、任何 `/Users/…` 路径、`source_path`、`owner_line`、`note` 自由文本（第二栋楼曾漏 `rule:~/.claude/rules/` ×18，同门复用）。

## 5.2 构建期管线 `scripts/frame-vault-build.mjs`（ops 机运行，不进 CI；产物入库）
1. 读 `EPISODE-STATE.json`，对每个 `current_sha256 != null` 的集：`shasum -a 256` 校验 mp4 与登记一致，不一致即 FAIL（**不是**警告）。
2. 选 fps：`fps = max{6,4,3,2,1,0.5}` 使 `n = ceil(duration_s × fps) ≤ 2000`（留 48 片余量给 2048 上限；EP2 425 s → 4 fps = 1702 片）。
3. `ffmpeg -vf fps=<fps>,scale=160:90 -pix_fmt rgb24 -f rawvideo` → 帧体；切成每 256 帧一张 `2560×1440` **WebP 无损（`cwebp -lossless -z 9`）**图集（16×16 网格）。`[实测 W22，流水 R2-2]`：EP3 全集 8 张 0.95 MB 位精确；有损 q75 反而 1.61 MB 且文字振铃，PNG 2.17 MB，AVIF 无损 7.5 MB。
4. 逐帧差分 → `xt`/`yt` 最大值投影 → 两张 PNG（N×160、N×90，8-bit 单通道，EP3 6 fps 约 300 KB 级 `[推断]`）。
5. 合 manifest；跑 §5.3 门；写 `evidence/frame-vault/<ep>/BUILD-RECEIPT.json`（输入 sha、fps、n、各产物 sha、ffmpeg 版本）。

## 5.3 门（构建期必跑）
- `frame-vault-gate.mjs`：manifest 每集 sha == EPISODE-STATE sha；`rings[].time_s ≤ duration_s`；无本地路径字面量（正则 `/Users/|studio-data-root|worktrees/`）；atlas 张数 == `ceil(n/256)`；投影图尺寸 == (n, 160/90)。负控：注入一条 `time_s = duration+1` 必 rc≠0。
- 体积门：每集 atlas 合计 ≤ 2.5 MB（EP3 实测 0.95 MB 的 2.6 倍余量，R2-2）；hall chunk ≤ 50 KB gzip（沿第二栋楼）。

# 6. 技术栈（⭐ 已选，不再开放）

| 层 | 选择 | 理由 / 证据 |
|---|---|---|
| 渲染 | ⭐ **WebGL2 `sampler3D` 自研薄引擎 `VolumeEngine`**（零依赖，TS，约 300 行；形态同第二栋楼 `InkEngine`） | spike `[实测]`：`texImage3D` 84 MB 上传 ≤16 ms（`gl.finish()` 后计时，Apple M5 Metal）、切片渲染贴 120 Hz vsync 上限（dpr 1/2 同读数）、`MAX_3D_TEXTURE_SIZE = 2048`（本机）。不引 three.js：本楼几何只有一个盒子和一个刀面，不值 150 KB+ chunk |
| 切面算法 | 射线–盒相交 + 半空间裁剪（刀面 = 裁剪平面），命中点直接采 3D 纹理；**不做体渲染步进** | spike 用此法，单 pass 单 draw，`[实测]` 见上 |
| 侧面 | 预计算 2D 投影纹理（不是体纹理边缘） | §4.2 |
| WebGPU | 不做首发；W6 备选：`WGSL` 同算法 + 3D texture，作为「同一引擎两后端」的技术陈列 | 2026 调研共识 WebGPU/TSL 主流（W19 c-story），但本楼的算法在 WebGL2 上已无性能缺口，加后端是炫技不是需求；**留作可选，不占波次预算** |
| 视频 | 原生 `<video>` + `currentTime` seek | 音频/字幕免费 |
| 海报 | 引擎离屏 2× 渲染 → `canvas.toBlob` → 下载；URL 参数确定性 | §3.3 |
| 台本/日志层 | DOM（可选中、可搜索、可读屏） | E 维 |
| 管线 | ffmpeg + Node 脚本（§5.2） | — |
| 页面 | Astro 7 hall 路由 `/world/frame-vault/`（复用 `HallChrome`、回城协议） | 第二栋楼接线清单可复用 |

与前两楼技术不同点（磊哥要求「技术又不一样」）：第一楼是视频平面 + 卡通场景；第二楼是流体求解器十二 pass；本楼是**体纹理 + 裁剪平面采样 + 预计算投影 + 构建期视频管线**——没有一段 shader 与第二楼共享。

# 7. 降级与端（E 维；桌面优先，移动端不是重点但要有体面终态）

| 条件 | 终态 |
|---|---|
| `MAX_3D_TEXTURE_SIZE < n` | 运行时按 2 的幂降采样时间轴再上传（保证 ≤ cap；OpenGL ES 3.0 规范下限 **256** `[实测 Khronos refpage glGet："The value must be at least 256"]`，W20 agy 亦报部分移动端为 256） |
| 无 WebGL2 | 静态：当前帧 `<img>` + 两张投影 PNG 拼成的「展开图」 + 门环列表（DOM）+ 视频链接；说明一句「此浏览器不支持体纹理」 |
| 无 JS | 首屏海报（构建期由引擎渲染一张默认切面）+ 集数清单 + 视频链接 |
| reduced-motion | 无快门、无自转、无炸开 tween；所有状态直接终态 |
| 移动端（≤ 768） | **只做「看」**：海报 + 单指左右滑 = blade（无斜切、无抽帧、无爆炸）；斜切与海报按钮不渲染 |
| 视频托管缺失 | 抽帧成片按钮禁用并显示「成片未上线」，其余交互不变 |

# 8. 创新之处（对照表；不用形容词）

| 交互 | 第一楼 | 第二楼 | agy 三路提案 | 网上先例 | 本楼 |
|---|---|---|---|---|---|
| 视频承载 | 平面播放 | 无视频 | 平面/缩略图 | 滚动擦洗视频（Awwwards 常见） | 视频是固体，切开才看见 |
| 斜切海报 | — | 试墨（不可保存） | — | slit-scan 艺术工具（相机/后期，单机） | 浏览器内确定性渲染 + URL 可复现 + 一键带走 |
| 抽帧成片 | 点击播放 | — | 点击播放 | 点击播放 | 切面抽出成为播放器，时间连续 |
| 翻面读稿 | — | 题跋 | 文本面板 | 字幕/文稿面板 | 台本是固体背面，滚台本即移时间 |
| 门环 | — | 印（收据） | 「坏帧弹回」玩具 | — | 真实人审退回坐在时间轴上，点击落到被抓的帧 |
| 爆炸分层 | — | — | 等距工厂/节点图 | 建筑爆炸图 | 阶段锁与 L0–L3 四态灯，L3 拨不动 |
| 过场母题 | 桥 | 墨 | — | — | 放映机快门（进/出/回城 `film` token） |

`[待 W20 核]`：网上先例一列由 W20 agy「GitHub-first」回稿补齐；若发现已有「浏览器内可切视频体」的成熟实现，按 adopt > build 处理并在流水账登记。

# 9. NEEDS_LEIGE（只有磊哥能答；每条给 ⭐ 默认）

| # | 问题 | ⭐ 默认 |
|---|---|---|
| 1 | 成片视频托管在哪（GitHub Pages 单文件 100 MB、仓库体积；EP2 80 MB）？ | ⭐ 外部对象存储（OSS/R2）URL 写进 manifest；仓内只放 EP2 重编码 720p ≤25 MB 作兜底 |
| 2 | EP3–EP5 是 P 阶段工作剪（未过人审），能否公开展示帧体/视频？ | ⭐ 帧体（160×90 低清）可展示并标「工作剪 vX.Y · 未过 F 锁」；**视频**只放已过 F 锁的（当前仅 EP2） |
| 3 | 台本正文能否公开（翻面读稿）？ | ⭐ 公开 cue 结构与首句，正文折叠；正文进不进由每集单独拍 |
| 4 | 人审退回原话（`quote`）能否原文展示？ | ⭐ 原文展示（这是本楼真实性的核心） |
| 5 | 楼名/厅名：建筑 `workflow-foundry`「AI 工作流工厂」是否改名？ | ⭐ 建筑 id 不变；厅名「帧库 · Frame Vault」；建筑中文名改「帧库 · 视频闭环车间」 |
| 6 | tagline | ⭐「视频不是文件，是一次构建。切开它。」 |
| 7 | scout-r0 是否作为第二条流水线并入 S2？ | ⭐ 本期不并入（`TOPOLOGY.md` 制片人裁决「scout-r0 不搬迁」），S2 末尾留一格指向 |

# 10. 明确没证的

- ~~WebP 图集的体积/画质~~ 已坐实（R2-2）；GitHub Pages 是否对 `.bin.gz` 走 `Content-Encoding` 未查（已无需要）。
- 其它 GPU 的 `MAX_3D_TEXTURE_SIZE`（只测了 Apple M5）；Windows/ANGLE-D3D11 的 `texImage3D` 上传耗时未测。
- 切片渲染的 GPU 余量：读数被 120 Hz vsync 封顶，需 `EXT_disjoint_timer_query_webgl2` 或关 vsync 复测。
- `texImage3D` 16 ms 是 `gl.finish()` 后读数，Metal 下可能仍有延迟提交；W2 用 `fence sync` 复测。
- 人审退回条目按集分布（31 条总数已核，逐集数未盘）。
