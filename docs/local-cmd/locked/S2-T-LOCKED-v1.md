# LOCKED · S2-T「地基」· 卡通 3D 风格化 · v1

- 日期：2026-09-02 · 出纸：gemini-3.7-flash · 角色锚句：`CHARACTER-SHEET-v1.md`（verbatim）
- purpose：W3 第 2 幕（地面管线升起 + 线框整车成形）；bind = 六站 1–2（第 1 站「物联网：设备连接与数据链路的工程地基」+ 第 2 站「整车前瞻：从单点技术转向整车级系统视角」）；站内佐证 URL：`/about/`（timeline 01–02）与 `/work/multilingual-cockpit/`
- 纪律：生成路 verbatim 抽取四段 fence，一个词不改；生成 first ×3、last ×3 各拣 1；审计路另 lane 出 `AUDIT-v1.md` 首行 `VERDICT=PASS|REJECT`；PASS 才 `image_to_video`。同叶 3 连 REJECT 熔断换路线。

## first-frame prompt

```text
Stylized 3D character render in a high-end animated-film look, matte clay skin with soft subsurface scattering and brushed-titanium hard surfaces, NOT photorealistic. Subject: a calm East Asian man in his mid-thirties with short, thick, neatly-styled black hair with slight natural volume on top, a round-oval face with a soft jawline, straight dark eyebrows, dark eyes, and distinctive browline glasses with a black acetate upper rim and thin clear-metal lower rim, wearing a plain black knit polo shirt with two thin copper-brown stripes on the collar and sleeve cuffs, no logo, no emblem. Medium-wide shot: he stands poised on a dark industrial tech platform, weight on one leg, arms loosely crossed, composed, mouth closed, facing the camera. In the dark platform floor beneath and beside him, subtle glowing cyan and copper data conduits trace through narrow floor seams and begin to glow with soft data pulses. Beside him on the platform, a low-density glowing cyan wireframe chassis base (a purely abstract, unbranded geometric chassis foundation made of thin luminous vector lines) is just beginning to take shape along the floor. He and the emerging wireframe elements occupy only the right 55% of the frame; the left 40% of the frame is completely empty deep midnight-blue negative space with faint volumetric haze and nothing else in it. Lighting: soft amber key light from upper right rimming his shoulders and the top edge of his glasses; cool cyan fill and under-glow from the glowing floor conduits and chassis nodes; deep clean shadows and subtle film grain. Camera at eye level, 50mm lens, medium-wide shot. Aspect 16:9. No text, no letters, no numbers, no logos, no badges, no real car brands, no brand grille, no license plate, no realistic car paint.
```

## last-frame prompt

```text
Stylized 3D character render in a high-end animated-film look, matte clay skin with soft subsurface scattering and brushed-titanium hard surfaces, NOT photorealistic. Exactly the same subject: a calm East Asian man in his mid-thirties with short, thick, neatly-styled black hair with slight natural volume on top, a round-oval face with a soft jawline, straight dark eyebrows, dark eyes, and distinctive browline glasses with a black acetate upper rim and thin clear-metal lower rim, wearing a plain black knit polo shirt with two thin copper-brown stripes on the collar and sleeve cuffs, no logo, no emblem. Same medium-wide shot: he stands on the same dark industrial tech platform, arms still loosely crossed, weight on the same leg, calm and composed, facing the camera. The glowing cyan and copper data conduits in the floor are now fully illuminated with steady streams of light pulses. Beside him, the glowing cyan wireframe has fully risen and locked into a complete, sleek three-dimensional translucent wireframe vehicle body (a generic, unbranded abstract vehicle body silhouette with aerodynamic geometric vector lines, purely structural polygonal cage, with no brand front face, no radiator grille, no badges, no logos, no wheels with branded rims). The man remains poised, mouth closed, the top rim of his glasses catching a warm amber highlight. He and the wireframe vehicle structure still occupy only the right 55% of the frame; the left 40% of the frame remains completely empty deep midnight-blue negative space with faint volumetric haze and nothing else in it. Identical lighting: soft amber key from upper right, cool cyan fill from the conduits and wireframe nodes, deep shadows, subtle film grain. Same camera at eye level, 50mm lens, medium-wide shot. Aspect 16:9. No text, no letters, no numbers, no logos, no badges, no real car brands, no brand grille, no license plate, no realistic car paint.
```

## motion prompt（duration 6）

```text
Static locked camera, no zoom, no pan, no dolly. The man stays standing poised in the right half of the frame with arms crossed; over six seconds glowing data conduits trace smoothly across the dark floor seams, while glowing cyan vector lines rise vertically from the floor beside him, assembling steadily into a complete generic abstract wireframe vehicle body silhouette and locking into place. Data light pulses flow steadily through the floor conduits at constant speed. Volumetric haze drifts very slightly in the dark void. Nothing enters or leaves the frame; the left 40% of the frame stays empty midnight blue throughout. Stylized 3D animated-film look maintained in every frame; no morphing of face, glasses, or hands; no real car logos or realistic textures emerge; no flicker.
```

## negative

```text
photorealistic, photograph, real skin pores, uncanny face, wrong glasses shape, missing glasses, extra fingers, missing fingers, fused hands, deformed hands, second person, crowd, real car brands, Mercedes, BMW, Audi, Tesla, Porsche, BYD, car logo, brand emblem, hood ornament, radiator grille, chrome trim, realistic car paint, realistic glass reflections, real rubber tires, license plate, wheel hub logos, text, letters, numbers, subtitles, caption, watermark, red and blue robot paint, rubber-hose cartoon, anime cel shading, chibi big head, oversaturated rainbow neon, lens flare streaks, motion blur smear, frame border, split screen, collage, grid
```

## 可量测硬门（审计路逐条量）
1. **负空间**：x < 0.40W 区域内，亮度 > (背景中值 + 30) 的像素占该区 ≤ 1%（掩膜口径写进 AUDIT）。
2. **占宽**：主体 + 线框车体掩膜最左列 x ≥ 0.50W（设计目标 0.55W；0.50W 为硬线）。
3. **同世界**：first↔last 在 x<0.40W 区域 RGB 均值每通道差 ≤ 6；两帧地表导轨基座轮廓 IoU ≥ 0.85。
4. **零字**：OCR 无置信度 ≥ 0.3 的字符。
5. **角色一致**：browline 眼镜（上粗下细）、短黑发有顶部体积、圆脸——三件缺一 REJECT；polo 无任何徽章。
6. **风格**：无摄影写实特征（毛孔、真实镜头眩光）；无 anime 描边。
7. **抽象无品牌线框车体专项门**：线框整车必须为纯几何/多边形矢量线框结构（generic abstract vehicle body），严禁包含任何真实量产车进气格栅、品牌车标徽章、特异性量产灯组造型或轮毂标识，经视觉审计人审确认 100% 抽象脱敏。

- duration 6（线框粒子匀速升起与骨架成型 6s 紧凑平稳）· aspect 16:9（1920×1080）· 9:16 版本另开 `S2-T-portrait-LOCKED`
- drop path：`~/studio-data-root/about-hall/gen/S2-T/`（`first-v1-{1,2,3}.png` `last-v1-{1,2,3}.png` `GEN-RECEIPT-v1.md`）→ PASS → `clip-v1.mp4`
- USE_GROK_IMG=yes · USE_GROK_VID=yes（仅 AUDIT PASS 后）· GO=yes（W1 出纸锁定，W3 开工生成）
