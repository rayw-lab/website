# LOCKED · S0-T「桥」首屏 Hero · 卡通 3D 风格化 · v2（构图/尺度/motion 坐标系勘误；角色锚句同 v1）

- 日期：2026-09-02 · 出纸：指挥官 · 角色锚句：`CHARACTER-SHEET-v1.md`（verbatim）
- purpose：首屏 pointer scrub（鼠标 X → 头部转向）；bind = `positioning.tagline`「把复杂技术转化为可决策、可交付、可复用的解决方案」/ 页面 H1「在技术与落地之间架桥」
- 纪律：生成路 verbatim 抽取四段 fence，一个词不改；生成 first ×3、last ×3 各拣 1；审计路另 lane 出 `AUDIT-v1.md` 首行 `VERDICT=PASS|REJECT`；PASS 才 `image_to_video`。同叶 3 连 REJECT 熔断换路线。

## first-frame prompt

```text
Stylized 3D character render in a high-end animated-film look, matte clay skin with soft subsurface scattering and brushed-titanium hard surfaces, NOT photorealistic. Subject: a calm East Asian man in his mid-thirties with short, thick, neatly-styled black hair with slight natural volume on top, a round-oval face with a soft jawline, straight dark eyebrows, dark eyes, and distinctive browline glasses with a black acetate upper rim and thin clear-metal lower rim, wearing a plain black knit polo shirt with two thin copper-brown stripes on the collar and sleeve cuffs, no logo, no emblem. Wide cinematic shot: the man is small in frame, about one quarter of the frame height, standing relaxed on the deck of a long slender suspension bridge made of glowing fiber-optic cables and thin data streams, arms loosely crossed, weight on one leg, composed, faintly confident, mouth closed, facing the camera. He is positioned in the far right third of the frame. The bridge deck runs from him toward the left and recedes into the distance, growing thinner and dimmer until it dissolves into empty dark sky; far behind him at the right edge a warm amber city skyline of simple block towers glows softly; a cold cyan-lit industrial server hall of simple rack silhouettes sits low and distant at the far left end of the bridge, barely visible. The entire left third of the frame is only deep midnight-blue sky and faint volumetric haze with nothing else in it. Lighting: one soft amber key light from upper right rims his shoulders and the top edge of his glasses; a cool cyan fill from the left; the cables emit a gentle cyan glow; a thin volumetric light beam falls from upper right; cinematic contrast with deep clean shadows and subtle film grain. Camera slightly below eye level, 35mm lens, wide shot, shallow depth of field on the far city. Aspect 16:9. No text, no letters, no numbers, no logos, no badges, no cars, no real brands.
```

## last-frame prompt

```text
Stylized 3D character render in a high-end animated-film look, matte clay skin with soft subsurface scattering and brushed-titanium hard surfaces, NOT photorealistic. Exactly the same subject: a calm East Asian man in his mid-thirties with short, thick, neatly-styled black hair with slight natural volume on top, a round-oval face with a soft jawline, straight dark eyebrows, dark eyes, and distinctive browline glasses with a black acetate upper rim and thin clear-metal lower rim, wearing a plain black knit polo shirt with two thin copper-brown stripes on the collar and sleeve cuffs, no logo, no emblem. Same wide cinematic shot: the man is small in frame, about one quarter of the frame height, standing on the deck of the same long slender suspension bridge made of glowing fiber-optic cables and thin data streams, in the far right third of the frame, arms still loosely crossed, weight on the same leg; his body has not moved, only his head has turned about fifteen degrees to his own left, so that he now looks past the camera toward the distant left end of the bridge, the top rim of his glasses catching a thin amber highlight, mouth closed. The same bridge deck recedes toward the left into empty dark sky; the same warm amber city skyline glows softly behind him at the right edge; the same cold cyan-lit server hall sits low and distant at the far left end. The entire left third of the frame remains only deep midnight-blue sky and faint volumetric haze with nothing else in it. Identical lighting: soft amber key from upper right, cool cyan fill from the left, cables glowing gentle cyan, thin volumetric beam from upper right, cinematic contrast, subtle film grain. Same camera slightly below eye level, 35mm lens, wide shot. Aspect 16:9. No text, no letters, no numbers, no logos, no badges, no cars, no real brands.
```

## motion prompt（duration 6）

```text
Static locked camera, no zoom, no pan, no dolly. The man stays planted on the bridge deck in the right third of the frame with arms crossed; over six seconds his head turns smoothly about fifteen degrees from facing the camera toward his own left (screen left, toward the distant end of the bridge) and then holds still, shoulders barely following. The fiber-optic cables pulse slowly with cyan light flowing left to right at constant speed. Volumetric haze drifts very slightly. Nothing enters or leaves the frame; the left third of the frame stays empty midnight-blue sky throughout. Stylized 3D animated-film look maintained in every frame; no morphing of face, glasses or hands; no flicker.
```

## negative

```text
photorealistic, photograph, real skin pores, uncanny face, wrong glasses shape, missing glasses, extra fingers, missing fingers, fused hands, second person, crowd, text, letters, numbers, subtitles, caption, watermark, logo, brand, badge, emblem, laurel wreath, car front, license plate, wheels, red and blue robot paint, rubber-hose cartoon, anime cel shading, chibi big head, oversaturated rainbow neon, lens flare streaks, motion blur smear, frame border, split screen, collage, grid
```

## 可量测硬门（审计路逐条量）
0. **人物尺度**：人物包围盒高度 ≤ 0.35H（v2 新增；v1 全部 ≈0.9H 为 REJECT 主因）。
1. **负空间**：x < 0.33W 区域内，亮度 > (背景中值 + 30) 的像素占该区 ≤ 1%（掩膜口径写进 AUDIT）。
2. **占宽**：人物掩膜最左列 x ≥ 0.60W（桥体可延伸至 0.33W）。
3. **同世界**：first↔last 在 x<0.40W 区域 RGB 均值每通道差 ≤ 6；两帧桥体轮廓 IoU ≥ 0.85。
4. **零字**：OCR 无置信度 ≥ 0.3 的字符。
5. **角色一致**：browline 眼镜（上粗下细）、短黑发有顶部体积、圆脸——三件缺一 REJECT；polo 无任何徽章。
6. 风格：无摄影写实特征（毛孔、真实镜头眩光）；无 anime 描边。

- duration 6 · aspect 16:9（1920×1080）· 9:16 版本另开 `S0-T-portrait-LOCKED`（只改构图锚句为"他占下半 55%，上 40% 留空"）
- drop path：`~/studio-data-root/about-hall/gen/S0-T/`（`first-v2-{1,2,3}.png` `last-v2-{1,2,3}.png` `GEN-RECEIPT-v2.md`）→ PASS → `clip-v2.mp4`
- USE_GROK_IMG=yes · USE_GROK_VID=yes（仅 AUDIT PASS 后）· GO=yes
