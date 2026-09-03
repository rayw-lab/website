# LOCKED · S0-T「桥」首屏 Hero · 卡通 3D 风格化 · v1

- 日期：2026-09-02 · 出纸：指挥官 · 角色锚句：`CHARACTER-SHEET-v1.md`（verbatim）
- purpose：首屏 pointer scrub（鼠标 X → 头部转向）；bind = `positioning.tagline`「把复杂技术转化为可决策、可交付、可复用的解决方案」/ 页面 H1「在技术与落地之间架桥」
- 纪律：生成路 verbatim 抽取四段 fence，一个词不改；生成 first ×3、last ×3 各拣 1；审计路另 lane 出 `AUDIT-v1.md` 首行 `VERDICT=PASS|REJECT`；PASS 才 `image_to_video`。同叶 3 连 REJECT 熔断换路线。

## first-frame prompt

```text
Stylized 3D character render in a high-end animated-film look, matte clay skin with soft subsurface scattering and brushed-titanium hard surfaces, NOT photorealistic. Subject: a calm East Asian man in his mid-thirties with short, thick, neatly-styled black hair with slight natural volume on top, a round-oval face with a soft jawline, straight dark eyebrows, dark eyes, and distinctive browline glasses with a black acetate upper rim and thin clear-metal lower rim, wearing a plain black knit polo shirt with two thin copper-brown stripes on the collar and sleeve cuffs, no logo, no emblem. He stands relaxed at the exact center of a slender suspension bridge made of glowing fiber-optic cables and thin data streams, arms loosely crossed, weight on one leg, composed, faintly confident, mouth closed, facing the camera. The bridge spans a dark void: its left end anchors into a cold cyan-lit industrial server hall of simple rack silhouettes, its right end reaches a warm amber city skyline of simple block towers. He and the bridge occupy only the right 55% of the frame; the left 40% of the frame is completely empty deep midnight-blue negative space with faint volumetric haze and nothing else in it. Lighting: one soft amber key light from upper right rims his shoulders and the top edge of his glasses; a cool cyan fill from the left; the cables emit a gentle cyan glow. Camera at eye level, 50mm lens, medium-wide shot, shallow depth of field on the far city, subtle film grain. Aspect 16:9. No text, no letters, no numbers, no logos, no badges, no cars, no real brands.
```

## last-frame prompt

```text
Stylized 3D character render in a high-end animated-film look, matte clay skin with soft subsurface scattering and brushed-titanium hard surfaces, NOT photorealistic. Exactly the same subject: a calm East Asian man in his mid-thirties with short, thick, neatly-styled black hair with slight natural volume on top, a round-oval face with a soft jawline, straight dark eyebrows, dark eyes, and distinctive browline glasses with a black acetate upper rim and thin clear-metal lower rim, wearing a plain black knit polo shirt with two thin copper-brown stripes on the collar and sleeve cuffs, no logo, no emblem. He stands at the exact center of the same slender suspension bridge made of glowing fiber-optic cables and thin data streams, arms still loosely crossed, weight on the same leg; his body has not moved, only his head has turned about fifteen degrees to his left to look toward the warm amber city skyline, the top rim of his glasses catching a thin amber highlight, mouth closed. The same dark void, the same cold cyan-lit industrial server hall at the left end and the same warm amber city skyline of simple block towers at the right end. He and the bridge still occupy only the right 55% of the frame; the left 40% of the frame remains completely empty deep midnight-blue negative space with faint volumetric haze and nothing else in it. Identical lighting: soft amber key from upper right, cool cyan fill from the left, cables glowing gentle cyan. Same camera at eye level, 50mm lens, medium-wide shot. Aspect 16:9. No text, no letters, no numbers, no logos, no badges, no cars, no real brands.
```

## motion prompt（duration 6）

```text
Static locked camera, no zoom, no pan, no dolly. The man stays planted at the bridge center with arms crossed; over six seconds his head turns smoothly about fifteen degrees from facing the camera toward the warm city on his right and then holds still, shoulders barely following. The fiber-optic cables pulse slowly with cyan light flowing left to right at constant speed. Volumetric haze drifts very slightly. Nothing enters or leaves the frame; the left 40% of the frame stays empty midnight blue throughout. Stylized 3D animated-film look maintained in every frame; no morphing of face, glasses or hands; no flicker.
```

## negative

```text
photorealistic, photograph, real skin pores, uncanny face, wrong glasses shape, missing glasses, extra fingers, missing fingers, fused hands, second person, crowd, text, letters, numbers, subtitles, caption, watermark, logo, brand, badge, emblem, laurel wreath, car front, license plate, wheels, red and blue robot paint, rubber-hose cartoon, anime cel shading, chibi big head, oversaturated rainbow neon, lens flare streaks, motion blur smear, frame border, split screen, collage, grid
```

## 可量测硬门（审计路逐条量）
1. **负空间**：x < 0.40W 区域内，亮度 > (背景中值 + 30) 的像素占该区 ≤ 1%（掩膜口径写进 AUDIT）。
2. **占宽**：主体 + 桥掩膜最左列 x ≥ 0.50W（设计目标 0.55W；0.50W 为硬线）。
3. **同世界**：first↔last 在 x<0.40W 区域 RGB 均值每通道差 ≤ 6；两帧桥体轮廓 IoU ≥ 0.85。
4. **零字**：OCR 无置信度 ≥ 0.3 的字符。
5. **角色一致**：browline 眼镜（上粗下细）、短黑发有顶部体积、圆脸——三件缺一 REJECT；polo 无任何徽章。
6. 风格：无摄影写实特征（毛孔、真实镜头眩光）；无 anime 描边。

- duration 6 · aspect 16:9（1920×1080）· 9:16 版本另开 `S0-T-portrait-LOCKED`（只改构图锚句为"他占下半 55%，上 40% 留空"）
- drop path：`~/studio-data-root/about-hall/gen/S0-T/`（`first-v1-{1,2,3}.png` `last-v1-{1,2,3}.png` `GEN-RECEIPT-v1.md`）→ PASS → `clip-v1.mp4`
- USE_GROK_IMG=yes · USE_GROK_VID=yes（仅 AUDIT PASS 后）· GO=yes
