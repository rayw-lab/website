# LOCKED · S0-H「桥」首屏 Hero · 手绘炭笔水彩 · v1

- 日期：2026-09-02 · 出纸：指挥官 · 角色锚句：`CHARACTER-SHEET-v1.md`（verbatim）· 与 S0-T 并行赛马
- purpose / bind：同 S0-T。
- 纪律：同 S0-T。

## first-frame prompt

```text
Flat 2D hand-drawn illustration: soft charcoal pencil outlines with loose, translucent watercolor washes on warm off-white paper with a subtle cream paper-grain texture filling the whole frame edge to edge; this is a drawing, absolutely NOT a photo, NO 3D render, NO CGI. Subject: a calm East Asian man in his mid-thirties with short, thick, neatly-styled black hair with slight natural volume on top, a round-oval face with a soft jawline, straight dark eyebrows, dark eyes, and distinctive browline glasses with a black acetate upper rim and thin clear-metal lower rim, wearing a charcoal wool turtleneck, no logo, no emblem. He stands at the center of a slender suspension bridge drawn with a few confident charcoal lines, its cables suggested by thin cyan watercolor threads. The left end of the bridge dissolves into a cool grey-blue wash hinting at a server hall of simple rectangles; the right end dissolves into a warm ochre wash hinting at a city skyline of simple blocks. He faces the viewer, arms loosely crossed, composed, mouth closed. He and the bridge sit only in the right 55% of the paper; the left 40% of the paper is untouched warm off-white with nothing drawn on it. Sparse palette: charcoal grey, one cyan accent, one ochre accent, paper white. Aspect 16:9. No text, no letters, no numbers, no logos, no badges, no cars.
```

## last-frame prompt

```text
Flat 2D hand-drawn illustration: soft charcoal pencil outlines with loose, translucent watercolor washes on warm off-white paper with a subtle cream paper-grain texture filling the whole frame edge to edge; this is a drawing, absolutely NOT a photo, NO 3D render, NO CGI. Exactly the same subject: a calm East Asian man in his mid-thirties with short, thick, neatly-styled black hair with slight natural volume on top, a round-oval face with a soft jawline, straight dark eyebrows, dark eyes, and distinctive browline glasses with a black acetate upper rim and thin clear-metal lower rim, wearing a charcoal wool turtleneck, no logo, no emblem. He stands at the center of the same slender charcoal-line suspension bridge with thin cyan watercolor cable threads; his body and crossed arms have not moved, only his head has turned about fifteen degrees to his left toward the warm ochre city wash. The same cool grey-blue server-hall wash at the left end and the same warm ochre skyline wash at the right end. He and the bridge still sit only in the right 55% of the paper; the left 40% remains untouched warm off-white paper with nothing drawn on it. Same sparse palette: charcoal grey, one cyan accent, one ochre accent, paper white. Aspect 16:9. No text, no letters, no numbers, no logos, no badges, no cars.
```

## motion prompt（duration 6）

```text
Static locked camera, no zoom, no pan. Hand-drawn charcoal-and-watercolor style maintained in every frame; line work stays stable with no boiling lines, watercolor edges do not shimmer. Over six seconds the man's head turns smoothly about fifteen degrees from facing the viewer toward the warm ochre city on his right and holds; his crossed arms stay still. A faint cyan wash travels slowly along the bridge cables from left to right at constant speed. Nothing enters or leaves the frame; the left 40% of the paper stays untouched throughout. No morphing of face, glasses or hands.
```

## negative

```text
photorealistic, photograph, 3D render, CGI, glossy surfaces, depth of field bokeh, film grain, lens flare, real paper scan, scanned document, wrong glasses shape, missing glasses, extra fingers, missing fingers, second person, crowd, text, letters, numbers, subtitles, caption, watermark, logo, brand, badge, emblem, laurel wreath, car front, license plate, wheels, anime cel shading, chibi big head, rainbow neon, frame border, split screen, collage, grid
```

## 可量测硬门
同 S0-T 的 1–5；第 6 条改为：无 3D/摄影特征（高光、景深、颗粒）；线条为炭笔质感；整体饱和度低（HSV 平均 S ≤ 0.35）。

- duration 6 · 16:9 · drop `~/studio-data-root/about-hall/gen/S0-H/` · GO=yes
