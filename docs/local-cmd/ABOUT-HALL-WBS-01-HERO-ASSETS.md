---
title: ABOUT-HALL · WBS-01 · Hero 资产管线（场景库 + LOCKED 提示词 + 生成/审计/压制）
type: wbs
status: draft-for-leige
date: 2026-09-02
parent: ABOUT-HALL-CHARTER-2026-09-02.md §6 W1
---

# 0. 这份 WBS 交付什么

首屏与过渡两段可 scrub 的 mp4 + poster，进仓路径 `public/media/about-hall/`，通过机器门（30fps、无音轨、体积预算、sha 回读）与人门 A ≥7。**顺带交付可复用的场景库与提示词体例**，后续 W3 六站各幕按同一体例追加。

生成栈：Grok Build CLI（`image_gen` / `image_edit` / `image_to_video` {6,10}s）。生图备选：8787 Runtime `gptpro.ts image --expected-count 1|3|5`。**不出现任何外部引擎名。**

# 1. 三种化身形态与兜底顺序（董事会 ADR-2 待拍）

| 形态 | 何时用 | 辨识度来源 | 风险 |
|---|---|---|---|
| **R 真人写实（ARCHIVED · 终止）** | 磊哥 2026-09-03 13:47 终止真人路线，素材样张存 gen 不进仓；`formal.jpg` 仅作特征参考 | 本人 | 已归档（恐怖谷风险；已由 T 卡通 3D 转正） |
| **T 卡通 / 3D 风格化（正式路线）** | 正式化身路线（首屏/六站/过渡） | 发型、眼镜、偏瘦体态、标志性穿着；体型已统一为偏瘦（`image_edit` 瘦身批 9/9 PASS） | 已转正；通过"工作台道具 + 六站符号"补辨识 |
| **H 手绘 / 炭笔水彩（正式路线）** | `/about/` 纸面双胞胎题图（S0-H） | 同上 + 纸感与技术编辑部气质契合；已瘦身定选 | 仅作静态插图，不进视频管线 |

化身路线定谳（磊哥 13:47 指令）：**R 真人路线正式终止（ARCHIVED）**，素材样张存 `gen/` 不进仓；**正式化身 = T 卡通 3D（首屏/六站/过渡）+ H 手绘（`/about/` 题图）**；化身体型统一修订为「**偏瘦**（`image_edit` 瘦身批 9/9 PASS，见 `CHARACTER-SHEET-v1.md` v2 增补）」。

# 2. 场景库（6 + 1）

原则：每个场景绑定一条真实信息；人物占画面 ≤45% 且左侧 ≥40% 宽为干净负空间（DOM 文案落位）；固定机位、单一主事件；零文字、零商标、零真车前脸；配色 = 深钴蓝/午夜蓝底 + 单一暖光（琥珀）或单一青光（`#49c5b6`，机器人眼色）；16:9 主（移动端不投视频，改由 poster 静帧承载，删除 9:16 视频交付项）。

| # | 场景 | 绑定信息 | 首屏/过渡用途 | 单一主事件（motion） |
|---|---|---|---|---|
| S0 **桥** | 他站在一座由光缆与数据流构成的悬桥中央，桥一端是工业机房的冷光，另一端是暖色的城市天际 | 定位语「在技术与落地之间架桥」 | **首屏 Hero**（pointer scrub） | 零头部动作（LOCKED v4；两次转头 REJECT 后定；光缆光流与粒子流动） |
| S1 **工作台** | 深色人体工学座舱工位，三块曲面屏映出细碎光，他侧坐看向屏幕 | 三支柱 / 讲者简介 | 首屏备选 / 第 8 幕收官 | 眼神从屏幕转向镜头，右手离开键盘 |
| S2 **地基** | 脚下地面裂开升起发光管线，身旁半透明线框整车成形 | 六站 1–2：物联网 → 整车前瞻 | W3 第 2 幕 | 线框车从地面升起 6s |
| S3 **光锥** | 前方一片弯曲道路，从他指尖投出一道透明梯形光锥贴合路面 | 六站 3：AR-HUD | W3 第 3 幕 | 光锥展开、箭头贴合路面 |
| S4 **十六环** | 16 圈细霓虹光环围绕，环上是抽象字形（**不可读**，只做笔画质感），他抬手一挥环阵对齐 | 六站 4 / 支柱 1：多语种座舱（真实数据 16 语种） | W3 第 4 幕 | 杂乱→对齐 |
| S5 **天平** | 双手托起一座全息天平：左盘冷青芯片，右盘深紫星云 | 六站 5 / 支柱 2：端云分层 | W3 第 5 幕 | 天平缓慢倾斜再回正 |
| S6 **回家** | 他周身泛起细密光栅，身体化作光子上飘，同一位置凝聚出钛灰机甲（`HeroRobot` 造型约束：块面、青眼、钛灰 `#5c6472` + 工业橙 `#ff6b35` 点缀，**无红蓝涂装、无胸口车窗、无徽章**） | 六站 6 / 支柱 3：AI 工作流 → 城市化身 | **过渡视频**（滚动 scrub） | 人→光子→机甲，镜头固定；瘦身首帧（v4，输入帧 = `first-v3-3-slim.png`） |

W1 只做 **S0（首屏）+ S6（过渡）**；S1–S5 出 LOCKED 纸不生成，留 W3。

# 3. LOCKED 体例（每个场景 × 每种形态一份文件）

文件：`docs/local-cmd/locked/S<n>-<形态>-LOCKED-v<k>.md`。四段 fence **verbatim 抽取**，生成路一个词不许改；改稿 = 新版本号。

```
- purpose / bind（绑定的真实信息 id）
- first-frame prompt   ```text ... ```
- last-frame prompt    ```text ... ```（同世界锚句字符级同文）
- motion prompt        ```text ... ```（固定机位、单一事件、时长 6|10）
- negative             ```text ... ```（四轴：人形缺陷 / 文字 / 商标 / 写实-or-风格越界）
- 可量测硬门：① 人物包围盒占宽 ≤45%（掩膜口径写死）② x<40% 区域内无主体像素 ③ first↔last 背景同区色差每通道 ≤ 个位数 ④ 零可读字形（OCR 置信度 <0.3）⑤ 零徽章/车标（人审）
- duration / aspect / drop path / GO 行
```

## 3.1 S0-T（卡通 3D 风格化 · 首屏 Hero）v4 —— 零头部动作定案（已落地进仓）

- **bind**：`positioning.tagline`（把复杂技术转化为可决策、可交付、可复用的解决方案）
- **first-frame prompt**（输入为瘦身首帧，体型偏瘦）

```text
Stylized 3D character render, high-end animated-film look, matte clay and brushed-titanium materials, soft subsurface skin, NOT photorealistic. A calm East Asian man in his thirties with short neat black hair and thin black-rimmed glasses, wearing a charcoal wool turtleneck and dark technical trousers, stands relaxed at the exact center of a slender suspension bridge made of glowing fiber-optic cables and thin data streams. The bridge spans a dark void: its left end anchors into a cold cyan-lit industrial server hall, its right end reaches a warm amber city skyline of simple block towers. The man faces the camera, hands loosely in pockets, weight on one leg, a small confident half-smile. He and the bridge occupy only the right 55% of the frame; the left 40% of the frame is completely empty deep midnight-blue negative space with faint volumetric haze and nothing else. Lighting: one soft amber key light from upper right rims his shoulders and glasses; cool cyan fill from the left; the bridge cables emit a gentle cyan glow (#49c5b6). Camera at eye level, 50mm, medium-wide shot, shallow depth of field on the far city, film grain subtle. 16:9. No text, no letters, no logos, no badges, no cars, no real brands.
```

- **last-frame prompt**（同世界锚句同文；姿态终态 = 头转向右侧城市）

```text
Stylized 3D character render, high-end animated-film look, matte clay and brushed-titanium materials, soft subsurface skin, NOT photorealistic. Exactly the same calm East Asian man in his thirties with short neat black hair and thin black-rimmed glasses, charcoal wool turtleneck and dark technical trousers, standing at the exact center of the same slender suspension bridge made of glowing fiber-optic cables and thin data streams; the same dark void, the same cold cyan-lit industrial server hall at the left end and the same warm amber city skyline at the right end. His body has not moved; only his head has turned about fifteen degrees to his left to look toward the warm city skyline, glasses catching a thin amber highlight. He and the bridge still occupy only the right 55% of the frame; the left 40% remains completely empty deep midnight-blue negative space with faint volumetric haze. Identical lighting: soft amber key from upper right, cool cyan fill from the left, cables glowing gentle cyan. Same camera, 50mm, eye level, 16:9. No text, no letters, no logos, no badges, no cars, no real brands.
```

- **motion prompt**（duration 6 · LOCKED v4 定案：两次转头 REJECT 后定选**零头部动作**，scrub 反馈为光缆光流与粒子流动）

```text
Static locked camera, no zoom, no pan, no dolly. The man stands perfectly still on the bridge deck in the right third of the frame, arms crossed, facing the camera the entire time; his head does not turn at all and his eyes stay on the camera; the only motion on him is a slow calm breath (chest and shoulders rise and fall very slightly), one natural eye blink around the middle, and the tips of his hair moving faintly in a light breeze. All visible motion is in the environment: the fiber-optic cables pulse with cyan light flowing steadily from the far left server hall toward the warm city on the right, tiny bright particles drift along the cables, and the volumetric haze in the left third drifts very slowly. Nothing enters or leaves the frame; the left third stays empty midnight-blue sky throughout. Stylized 3D animated-film look maintained in every frame; no morphing of face, glasses or hands; no flicker; no head turn; no profile view.
```

- **negative**

```text
photorealistic, photograph, real skin pores, uncanny face, extra fingers, missing fingers, fused hands, deformed glasses, second person, crowd, text, letters, numbers, subtitles, watermark, logo, brand, badge, emblem, car front, license plate, red and blue robot paint, cartoon rubber-hose style, anime cel shading, oversaturated neon rainbow, lens flare streaks, motion blur smear, frame border, split screen, collage
```

- **硬门**：人物+桥包围盒最左列 x ≥ 0.55W（掩膜：亮度 > 背景中值 + 30）；x<0.40W 区域主体像素 = 0；first↔last 左区背景均值 ΔRGB ≤ 6；OCR 无字；人审无徽章。
- duration 6 · 16:9 1280×720 · drop `public/media/about-hall/hero-s0-720p.mp4` · **GO=yes（LOCKED v4 零头动定案，删 9:16 竖版）**

## 3.2 S0-H（手绘炭笔水彩 · 首屏 Hero）v1 —— 与 S0-T 并行赛马

- first-frame prompt

```text
Flat 2D hand-drawn illustration, soft charcoal pencil outlines with loose watercolor washes on warm off-white paper with a subtle cream grain filling the whole frame; this is a drawing, NOT a photo, NO 3D render. A calm East Asian man in his thirties with short neat black hair and thin black-rimmed glasses, charcoal turtleneck, stands at the center of a slender suspension bridge drawn as a few confident charcoal lines with thin cyan watercolor threads for cables. The left end of the bridge dissolves into a cool grey-blue wash suggesting a server hall; the right end into a warm ochre wash suggesting a city skyline of simple blocks. He faces the viewer, hands in pockets, small half-smile. He and the bridge sit only in the right 55% of the paper; the left 40% is untouched warm paper with nothing drawn. Sparse palette: charcoal, one cyan accent (#49c5b6), one ochre accent, paper white. 16:9. No text, no letters, no logos, no badges, no cars.
```

- last / motion / negative：同 S0-T 结构，把材质锚句换成手绘锚句；motion 加 "line work stays stable, no boiling lines, watercolor edges do not shimmer"。negative 加 "photorealistic, 3D render, CGI, glossy, depth of field, film grain, real paper scan"。
- 硬门同 S0-T。

## 3.3 S0-R（真人写实 · 首屏 Hero · ARCHIVED · 已终止）v1

> **路线归档（ARCHIVED）**：磊哥 2026-09-03 13:47 指令终止真人路线，素材样张留存 `gen/` 不进仓，`formal.jpg` 仅作特征参考；纸版本 `S0-R-LOCKED-v1.md` 归档。正式路线统一收敛至 T 卡通 3D + H 手绘。

- 历史背景：曾基于磊哥 2026-09-03 13:03 提供的 `formal.jpg` 编写 `S0-R-LOCKED-v1.md`（要求面部相似、去烟/手机/告示牌、体型不修身）。
- 终止结论：为彻底消除真人脸在视频 scrub 时的恐怖谷与稳定性风险，决定终止 R 路线，不再投入生成配额。

## 3.4 S6-T（回家 · 过渡视频 · 瘦身首帧）v4 —— 骨架（已落地进仓）

- 继承 v3 全部内容，仅输入帧变更为瘦身首帧 `S6-T/slim/first-v3-3-slim.png`（v4 定案）；last-frame 仍为机甲 `last-v3-2.png`（机甲不瘦身）。
- motion（duration 10）：`Static camera. Over ten seconds fine glowing cyan lattice lines appear across the man's body, he dissolves upward into drifting cyan light particles, and at the same spot a blocky titanium-grey mech with cyan eyes and small industrial-orange accents condenses from the particles and settles into a calm standing pose. Nothing else in the scene changes.`
- negative 追加：`red and blue color scheme, truck grille chest, faction emblem, flame decals, transforming car parts, wheels`（README 反 IP 论证）。
- 硬门追加：last 帧机甲主色 ΔE 对 `#5c6472` ≤ 12；无轮子/车窗几何（人审）。

# 4. 管线步骤（IMAGINE-GATE 五步 · 生成路与审计路分 lane）

| 步 | 席 | 动作 | 产物 / 门 |
|---|---|---|---|
| ① 出纸 | 指挥官 + gemini-3.7-flash（提示词打磨，借 7 仓写法） | 写 `S<n>-<形态>-LOCKED-v<k>.md` | 四段 fence + 硬门；**不生成** |
| ② 生成 | Grok Build lane（cwd `studio-data-root/about-hall/gen/<ticket>/`） | `image_gen` first ×3、last ×3（同 seed 策略若可用）；人拣各 1 | `first-v<k>.png` / `last-v<k>.png` + `GEN-RECEIPT.md`（sha256、分辨率、调用参数） |
| ③ 回审 | 指挥官 | 跑硬门脚本 `scripts/about-hall-frame-gate.py`（掩膜占宽、负空间、色差、OCR） | `FRAME-GATE.json` |
| ④ 独立审计 | gemini-3.7-flash **另一路** + glm-5-3-flash `--attach-image` | 只看两张图 + LOCKED 硬门；首行 `VERDICT=PASS|REJECT` | `AUDIT-v<k>.md`；REJECT 写命中项与坐标；同叶 3 连熔断 |
| ⑤ 生视频 | Grok Build lane | `image_to_video`（first 帧 + motion；若工具支持尾帧则同时传 last）6s / 10s | `clip-v<k>.mp4` + ffprobe 回读 |
| ⑥ 压制 | 指挥官（ffmpeg） | `-vf fps=30 -an -c:v libx264 -preset slow -crf 24 -g 15 -movflags +faststart`（短 GOP 利于 scrub；试 `-g 1` All-Intra 对比体积）；9:16 已废弃删除（移动端走 poster 静帧，不投视频）；poster = 第 1 帧 webp q80 | 体积门（G1 修订草案）：首屏 ≤2.0MB、过渡 ≤3.5MB、移动走 poster；真 I2V 收口后锁定 |
| ⑦ 消费验收 | 指挥官 隔离栈 | 临时 HTML（Paidax 两段提示词的最小实现）载入 mp4，鼠标 scrub 逐帧看伪影 | 人门 A 预评；有形变回 ②换种子 |

Giants（W1 开工前必做，gemini-3.7-flash 一路）：Grok Build `image_to_video` 当前是否接受尾帧图 / seed / aspect 参数（读 `~/.grok/docs` + 实调一次 canary 6s）；scrub 友好编码（All-Intra vs GOP 15 的 seek 延迟实测）；`mix-blend-mode` 对深蓝底的可用性（不是纯黑底 → 可能不用 blend，直接铺满）。

# 5. 交付清单与验收命令

```
public/media/about-hall/
  hero-s0-720p.mp4                ≤2.0MB  30fps  无音轨  6s   （S0-T v3/v4 零头动定案，1.05MB 进仓）
  hero-s0-poster.webp             ≤60KB  （已瘦身更新）
  transition-s6-720p.mp4          ≤3.5MB 10s （S6-T v4 瘦身首帧，2.12MB 进仓）
  transition-s6-poster.webp       ≤60KB
  [已废弃] 9:16 竖版视频已删除（W1h 删除竖版 mp4；移动端走 poster 静帧）
docs/local-cmd/locked/S0-T-LOCKED-v4.md  S0-H-LOCKED-v1.md  S0-R-LOCKED-v1.md(ARCHIVED)  S6-T-LOCKED-v4.md  (+ S1–S5 纸)
evidence/about-hall/W1/  GEN-RECEIPT-*.md  AUDIT-*.md  FRAME-GATE-*.json  ffprobe-*.txt  SHA256SUMS
```

验收：`for f in public/media/about-hall/*.mp4; do ffprobe -v error -select_streams v -show_entries stream=r_frame_rate,width,height -show_entries format=duration,size -of csv=p=0 "$f"; ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 "$f" | wc -l; done`（音轨行数必须为 0）；`sha256sum -c evidence/about-hall/W1/SHA256SUMS`；人门 A ≥7（两席 |Δ|≤1）。

# 6. 不做
不写任何文字进 diffusion；不给六站编年份；不用外部引擎；不做真人脸极端特写；不在 W1 动 `src/**`（消费验收用仓外临时 HTML）；不为过体积门降分辨率到 720p 以下（先试 crf/GOP）。
