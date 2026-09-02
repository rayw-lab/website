# LOCKED · S1-T「工作台」· 卡通 3D 风格化 · v1

- 日期：2026-09-02 · 出纸：gemini-3.7-flash · 角色锚句：`CHARACTER-SHEET-v1.md`（verbatim）
- purpose：首屏备选 / W3 第 8 幕收官（工作台特写 → 转向镜头）；bind = 三支柱总览 / 讲者简介 / 职业演进收官；站内佐证 URL：`/work/ai-native-workflow/` 与 `/about/`
- 纪律：生成路 verbatim 抽取四段 fence，一个词不改；生成 first ×3、last ×3 各拣 1；审计路另 lane 出 `AUDIT-v1.md` 首行 `VERDICT=PASS|REJECT`；PASS 才 `image_to_video`。同叶 3 连 REJECT 熔断换路线。

## first-frame prompt

```text
Stylized 3D character render in a high-end animated-film look, matte clay skin with soft subsurface scattering and brushed-titanium hard surfaces, NOT photorealistic. Subject: a calm East Asian man in his mid-thirties with short, thick, neatly-styled black hair with slight natural volume on top, a round-oval face with a soft jawline, straight dark eyebrows, dark eyes, and distinctive browline glasses with a black acetate upper rim and thin clear-metal lower rim, wearing a plain black knit polo shirt with two thin copper-brown stripes on the collar and sleeve cuffs, no logo, no emblem. Medium shot: he sits comfortably in a dark ergonomic chair at a sleek dark workstation cockpit in a high-tech studio environment, body angled slightly toward three floating curved monitors arranged in an arc before him; on the monitor displays are abstract luminous data geometries, soft glowing wireframes, and soft cyan-amber waveform bars with no readable characters or text. His right hand rests near a minimalist dark touch console, his face turned toward the central curved screen with a calm, focused expression, mouth closed. He and the workstation setup occupy only the right 55% of the frame; the left 40% of the frame is completely empty deep midnight-blue negative space with faint volumetric haze and nothing else in it. Lighting: one soft amber key light from upper right rims his shoulders and the top edge of his glasses; cool cyan fill from the glowing monitors illuminates his front and hands; deep clean shadows and subtle film grain. Camera at eye level, 50mm lens, medium shot, shallow depth of field on the background studio void. Aspect 16:9. No text, no letters, no numbers, no code, no logos, no badges, no brand marks, no cars.
```

## last-frame prompt

```text
Stylized 3D character render in a high-end animated-film look, matte clay skin with soft subsurface scattering and brushed-titanium hard surfaces, NOT photorealistic. Exactly the same subject: a calm East Asian man in his mid-thirties with short, thick, neatly-styled black hair with slight natural volume on top, a round-oval face with a soft jawline, straight dark eyebrows, dark eyes, and distinctive browline glasses with a black acetate upper rim and thin clear-metal lower rim, wearing a plain black knit polo shirt with two thin copper-brown stripes on the collar and sleeve cuffs, no logo, no emblem. Same medium shot: he sits in the same dark ergonomic chair at the same sleek workstation cockpit with the same three floating curved monitors displaying identical abstract luminous data geometries and soft cyan-amber waveform bars. His body remains seated in the same position, but his right hand has relaxed back from the console surface to rest on the chair armrest, and his head and gaze have smoothly turned about twenty degrees from the screen to face directly toward the camera, composed, faintly confident, mouth closed with a subtle half-smile, the top rim of his glasses catching a gentle amber highlight. He and the workstation setup still occupy only the right 55% of the frame; the left 40% of the frame remains completely empty deep midnight-blue negative space with faint volumetric haze and nothing else in it. Identical lighting: soft amber key light from upper right, cool cyan fill from the monitors, deep clean shadows, subtle film grain. Same camera at eye level, 50mm lens, medium shot. Aspect 16:9. No text, no letters, no numbers, no code, no logos, no badges, no brand marks, no cars.
```

## motion prompt（duration 6）

```text
Static locked camera, no zoom, no pan, no dolly. The man stays seated at the ergonomic workstation in the right half of the frame; over six seconds his right hand eases gently back from the console to the armrest, while his head and gaze turn smoothly about twenty degrees from looking at the center monitor toward facing the camera and settle into a calm, composed expression. The abstract glowing waveform bars and geometric blocks on the three curved screens pulse slowly with soft cyan and amber luminescence. Volumetric haze drifts very slightly in the dark void. Nothing enters or leaves the frame; the left 40% of the frame stays empty midnight blue throughout. Stylized 3D animated-film look maintained in every frame; no morphing of face, glasses, hands, or monitor geometry; no flicker.
```

## negative

```text
photorealistic, photograph, real skin pores, uncanny face, wrong glasses shape, missing glasses, extra fingers, missing fingers, fused hands, deformed hands, second person, crowd, text, letters, numbers, readable code, programming scripts, IDE windows, UI labels, subtitles, caption, watermark, logo, brand, badge, emblem, laurel wreath, keyboard brand, monitor logo, chair brand, car front, license plate, wheels, red and blue robot paint, rubber-hose cartoon, anime cel shading, chibi big head, oversaturated rainbow neon, lens flare streaks, motion blur smear, frame border, split screen, collage, grid
```

## 可量测硬门（审计路逐条量）
1. **负空间**：x < 0.40W 区域内，亮度 > (背景中值 + 30) 的像素占该区 ≤ 1%（掩膜口径写进 AUDIT）。
2. **占宽**：主体 + 工作台掩膜最左列 x ≥ 0.50W（设计目标 0.55W；0.50W 为硬线）。
3. **同世界**：first↔last 在 x<0.40W 区域 RGB 均值每通道差 ≤ 6；两帧工作台三屏轮廓 IoU ≥ 0.85。
4. **零字**：OCR 无置信度 ≥ 0.3 的字符。
5. **角色一致**：browline 眼镜（上粗下细）、短黑发有顶部体积、圆脸——三件缺一 REJECT；polo 无任何徽章。
6. **风格**：无摄影写实特征（毛孔、真实镜头眩光）；无 anime 描边。
7. **工位与屏幕无字专项门**：三块曲面屏上仅允许抽象几何光带、波形与纯色网格，OCR 置信度严格为 0；工位桌椅无任何品牌标牌。

- duration 6（转头视线交汇 6s 稳健自然）· aspect 16:9（1920×1080）· 9:16 版本另开 `S1-T-portrait-LOCKED`
- drop path：`~/studio-data-root/about-hall/gen/S1-T/`（`first-v1-{1,2,3}.png` `last-v1-{1,2,3}.png` `GEN-RECEIPT-v1.md`）→ PASS → `clip-v1.mp4`
- USE_GROK_IMG=yes · USE_GROK_VID=yes（仅 AUDIT PASS 后）· GO=yes（W1 出纸锁定，W3 开工生成）
