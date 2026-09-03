# LOCKED · S4-T「十六环」· 卡通 3D 风格化 · v1

- 日期：2026-09-02 · 出纸：gemini-3.7-flash · 角色锚句：`CHARACTER-SHEET-v1.md`（verbatim）
- purpose：W3 第 4 幕（16 圈多语种光环从杂乱浮动到一挥对齐）；bind = 六站 4（第 4 站「多语种座舱：16 语种从需求定义到量产交付的全链路」）+ 支柱 1（多语种座舱）；站内佐证 URL：`/lab/tts-cockpit/` 与 `/work/multilingual-cockpit/`
- 纪律：生成路 verbatim 抽取四段 fence，一个词不改；生成 first ×3、last ×3 各拣 1；审计路另 lane 出 `AUDIT-v1.md` 首行 `VERDICT=PASS|REJECT`；PASS 才 `image_to_video`。同叶 3 连 REJECT 熔断换路线。

## first-frame prompt

```text
Stylized 3D character render in a high-end animated-film look, matte clay skin with soft subsurface scattering and brushed-titanium hard surfaces, NOT photorealistic. Subject: a calm East Asian man in his mid-thirties with short, thick, neatly-styled black hair with slight natural volume on top, a round-oval face with a soft jawline, straight dark eyebrows, dark eyes, and distinctive browline glasses with a black acetate upper rim and thin clear-metal lower rim, wearing a plain black knit polo shirt with two thin copper-brown stripes on the collar and sleeve cuffs, no logo, no emblem. Medium-wide shot: he stands poised within a deep dark void; surrounding him in a staggered, slightly drifting orbital cloud are sixteen slender, glowing neon rings; floating along the perimeter of each ring are abstract calligraphic strokes that resemble many writing systems but form no readable word (pure stylized typographic rhythms, subtle varied brush stroke textures with diverse curves and dashes, completely unreadable and non-textual). His right hand is raised to mid-chest level with an open palm as if poised to conduct a celestial orchestra. He and the sixteen neon rings occupy only the right 55% of the frame; the left 40% of the frame is completely empty deep midnight-blue negative space with faint volumetric haze and nothing else in it. Lighting: soft amber key light from upper right rimming his shoulders and the top edge of his glasses; gentle harmonious multicolored rim light (cyan, amber, and subtle violet) from the surrounding sixteen neon rings illuminating his dark knit shirt; deep clean shadows and subtle film grain. Camera at eye level, 50mm lens, medium-wide shot. Aspect 16:9. No text, no letters, no words, no numbers, no readable script, no Latin alphabet, no Arabic words, no Chinese characters, no logos, no badges, no cars.
```

## last-frame prompt

```text
Stylized 3D character render in a high-end animated-film look, matte clay skin with soft subsurface scattering and brushed-titanium hard surfaces, NOT photorealistic. Exactly the same subject: a calm East Asian man in his mid-thirties with short, thick, neatly-styled black hair with slight natural volume on top, a round-oval face with a soft jawline, straight dark eyebrows, dark eyes, and distinctive browline glasses with a black acetate upper rim and thin clear-metal lower rim, wearing a plain black knit polo shirt with two thin copper-brown stripes on the collar and sleeve cuffs, no logo, no emblem. Same medium-wide shot: he stands in the exact same spot; his raised right hand has completed a smooth conducting wave and now rests in a steady, commanding open-palm posture; in response, the sixteen glowing neon rings have snapped from their staggered cloud into a disciplined, perfectly aligned concentric spherical orbital lattice cleanly spaced around him; the abstract calligraphic strokes that resemble many writing systems but form no readable word are now neatly locked into uniform, aligned UI boundary arcs along the sixteen rings, glowing in harmonious, synchronized cyan and soft amber light. The man stands calm and confident, mouth closed, the top rim of his glasses catching a crisp cyan rim highlight. He and the aligned sixteen rings still occupy only the right 55% of the frame; the left 40% of the frame remains completely empty deep midnight-blue negative space with faint volumetric haze and nothing else in it. Identical lighting: soft amber key from upper right, synchronized cyan-amber fill from the aligned rings, deep shadows, subtle film grain. Same camera at eye level, 50mm lens, medium-wide shot. Aspect 16:9. No text, no letters, no words, no numbers, no readable script, no Latin alphabet, no Arabic words, no Chinese characters, no logos, no badges, no cars.
```

## motion prompt（duration 6）

```text
Static locked camera, no zoom, no pan, no dolly. The man stays standing in the right half of the frame; over six seconds his raised right hand sweeps smoothly across in a steady conducting gesture; in response, the sixteen staggered glowing neon rings glide seamlessly from their drifting cloud into a perfectly aligned concentric spherical lattice array around him, while the floating abstract stroke textures lock cleanly into uniform orbital arcs. The sixteen rings pulse with harmonious, synchronized cyan and amber light. Volumetric haze drifts very slightly in the dark void. Nothing enters or leaves the frame; the left 40% of the frame stays empty midnight blue throughout. Stylized 3D animated-film look maintained in every frame; no morphing of face, glasses, or hands; the stroke textures remain strictly unreadable abstract brushmarks throughout with zero readable words or letters appearing; no flicker.
```

## negative

```text
photorealistic, photograph, real skin pores, uncanny face, wrong glasses shape, missing glasses, extra fingers, missing fingers, fused hands, deformed hands, second person, crowd, readable text, real letters, Latin alphabet, Arabic words, Cyrillic script, Chinese characters, Kanji, Hangul, Hebrew text, Thai font, readable typography, dictionary words, subtitles, captions, numbers, punctuation marks, font glyphs, logo, brand, badge, emblem, laurel wreath, car front, license plate, red and blue robot paint, rubber-hose cartoon, anime cel shading, chibi big head, oversaturated rainbow neon, lens flare streaks, motion blur smear, frame border, split screen, collage, grid
```

## 可量测硬门（审计路逐条量）
1. **负空间**：x < 0.40W 区域内，亮度 > (背景中值 + 30) 的像素占该区 ≤ 1%（掩膜口径写进 AUDIT）。
2. **占宽**：主体 + 十六环掩膜最左列 x ≥ 0.50W（设计目标 0.55W；0.50W 为硬线）。
3. **同世界**：first↔last 在 x<0.40W 区域 RGB 均值每通道差 ≤ 6；两帧人物姿态基底轮廓 IoU ≥ 0.85。
4. **零字**：OCR 无置信度 ≥ 0.3 的字符。
5. **角色一致**：browline 眼镜（上粗下细）、短黑发有顶部体积、圆脸——三件缺一 REJECT；polo 无任何徽章。
6. **风格**：无摄影写实特征（毛孔、真实镜头眩光）；无 anime 描边。
7. **十六环不可读笔画质感专项门**：16 圈光环上的浮动笔触必须严格为无义抽象书法笔画质感（"abstract calligraphic strokes that resemble many writing systems but form no readable word"），全图 OCR 扫描置信度 ≥ 0.2 的字符数严格为 0；光环呈现多层同心/环状结构（视觉计数 14–18 圈，核心体现 16 语种量产交付深度）。

- duration 6（光环从散乱到对齐 6s 优雅且张弛有度）· aspect 16:9（1920×1080）· 9:16 版本另开 `S4-T-portrait-LOCKED`
- drop path：`~/studio-data-root/about-hall/gen/S4-T/`（`first-v1-{1,2,3}.png` `last-v1-{1,2,3}.png` `GEN-RECEIPT-v1.md`）→ PASS → `clip-v1.mp4`
- USE_GROK_IMG=yes · USE_GROK_VID=yes（仅 AUDIT PASS 后）· GO=yes（W1 出纸锁定，W3 开工生成）
