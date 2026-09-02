# LOCKED · S3-T「光锥」· 卡通 3D 风格化 · v1

- 日期：2026-09-02 · 出纸：gemini-3.7-flash · 角色锚句：`CHARACTER-SHEET-v1.md`（verbatim）
- purpose：W3 第 3 幕（指尖投射梯形光锥 + 全息导航贴合弯道）；bind = 六站 3（第 3 站「AR-HUD：人机界面：显示链路、安全边界与工程落地」）；站内佐证 URL：`/about/`（timeline 03）与 `/lab/tts-cockpit/`
- 纪律：生成路 verbatim 抽取四段 fence，一个词不改；生成 first ×3、last ×3 各拣 1；审计路另 lane 出 `AUDIT-v1.md` 首行 `VERDICT=PASS|REJECT`；PASS 才 `image_to_video`。同叶 3 连 REJECT 熔断换路线。

## first-frame prompt

```text
Stylized 3D character render in a high-end animated-film look, matte clay skin with soft subsurface scattering and brushed-titanium hard surfaces, NOT photorealistic. Subject: a calm East Asian man in his mid-thirties with short, thick, neatly-styled black hair with slight natural volume on top, a round-oval face with a soft jawline, straight dark eyebrows, dark eyes, and distinctive browline glasses with a black acetate upper rim and thin clear-metal lower rim, wearing a plain black knit polo shirt with two thin copper-brown stripes on the collar and sleeve cuffs, no logo, no emblem. Medium-wide shot: he stands poised on an elevated dark observation stage in a deep dark void; his left hand rests relaxed by his side, and his right hand is raised forward at chest level with his index finger pointing outward into the space ahead. In the dark expanse before him, a stylized curved dark asphalt road model sweeps through the void into the distance. From his extended right fingertip, a narrow luminous beam of concentrated cyan and soft amber light begins to emit forward, poised to expand into a spatial projection cone over the road. He, the platform, and the road occupy only the right 55% of the frame; the left 40% of the frame is completely empty deep midnight-blue negative space with faint volumetric haze and nothing else in it. Lighting: soft amber key light from upper right rimming his shoulders and the top edge of his glasses; cool cyan glow from the emission beam illuminating his right hand and face contour; deep midnight-blue shadows, subtle film grain. Camera at eye level, 50mm lens, medium-wide shot. Aspect 16:9. No text, no letters, no numbers, no logos, no badges, no car front, no car hood, no car grille, no headlights, no road sign text.
```

## last-frame prompt

```text
Stylized 3D character render in a high-end animated-film look, matte clay skin with soft subsurface scattering and brushed-titanium hard surfaces, NOT photorealistic. Exactly the same subject: a calm East Asian man in his mid-thirties with short, thick, neatly-styled black hair with slight natural volume on top, a round-oval face with a soft jawline, straight dark eyebrows, dark eyes, and distinctive browline glasses with a black acetate upper rim and thin clear-metal lower rim, wearing a plain black knit polo shirt with two thin copper-brown stripes on the collar and sleeve cuffs, no logo, no emblem. Same medium-wide shot: he stands in the exact same poised stance on the dark observation stage, right hand held steady pointing forward. From his right fingertip, the beam has now fully expanded into a crisp, transparent trapezoidal optical frustum (an AR-HUD optical cone) made of glowing cyan and soft amber volumetric light planes; the optical cone projects down onto the curved road surface ahead, precisely anchoring dynamic holographic chevron guidance arrows and conformal boundary lines flat onto the road curvature in perfect spatial alignment. The man looks steadily along the light path with calm precision, mouth closed, the top rim of his glasses catching a crisp cyan-amber highlight. He, the optical cone, and the road still occupy only the right 55% of the frame; the left 40% of the frame remains completely empty deep midnight-blue negative space with faint volumetric haze and nothing else in it. Identical lighting: soft amber key from upper right, cool cyan fill from the optical cone, deep shadows, subtle film grain. Same camera at eye level, 50mm lens, medium-wide shot. Aspect 16:9. No text, no letters, no numbers, no logos, no badges, no car front, no car hood, no car grille, no headlights, no road sign text.
```

## motion prompt（duration 6）

```text
Static locked camera, no zoom, no pan, no dolly. The man stays firmly planted on the observation stage in the right half of the frame with his right arm held steady; over six seconds the glowing optical beam from his fingertip fans smoothly outward into a crisp transparent trapezoidal optical cone, projecting glowing holographic chevron arrows that settle and snap seamlessly onto the curved road surface ahead. The conformal road arrows pulse with gentle cyan luminescence flowing forward along the road geometry. Volumetric haze drifts subtly in the dark void. Nothing enters or leaves the frame; the left 40% of the frame stays empty midnight blue throughout. Stylized 3D animated-film look maintained in every frame; no morphing of face, glasses, or hands; no car front or real traffic signs appear; no flicker.
```

## negative

```text
photorealistic, photograph, real skin pores, uncanny face, wrong glasses shape, missing glasses, extra fingers, missing fingers, fused hands, deformed hands, second person, crowd, car front, car hood, car windshield, car grille, vehicle bumper, headlights, license plate, real brand logos, badges, emblems, road sign text, speed limit numbers, highway exit signs, street names, readable typography, subtitles, caption, watermark, red and blue robot paint, rubber-hose cartoon, anime cel shading, chibi big head, oversaturated rainbow neon, lens flare streaks, motion blur smear, frame border, split screen, collage, grid
```

## 可量测硬门（审计路逐条量）
1. **负空间**：x < 0.40W 区域内，亮度 > (背景中值 + 30) 的像素占该区 ≤ 1%（掩膜口径写进 AUDIT）。
2. **占宽**：主体 + 光锥路面掩膜最左列 x ≥ 0.50W（设计目标 0.55W；0.50W 为硬线）。
3. **同世界**：first↔last 在 x<0.40W 区域 RGB 均值每通道差 ≤ 6；两帧道路基底轮廓 IoU ≥ 0.85。
4. **零字**：OCR 无置信度 ≥ 0.3 的字符。
5. **角色一致**：browline 眼镜（上粗下细）、短黑发有顶部体积、圆脸——三件缺一 REJECT；polo 无任何徽章。
6. **风格**：无摄影写实特征（毛孔、真实镜头眩光）；无 anime 描边。
7. **零车前脸与光学视锥几何专项门**：画面中严禁出现任何真实汽车前脸、进气格栅、机盖或真实车灯总成；AR-HUD 光锥必须为透明梯形几何视锥，路面投影元素仅限无文字纯几何全息箭头（Chevron）与车道标线，OCR 置信度严格为 0。

- duration 6（光锥展开并贴合道路 6s 稳健定格）· aspect 16:9（1920×1080）· 9:16 版本另开 `S3-T-portrait-LOCKED`
- drop path：`~/studio-data-root/about-hall/gen/S3-T/`（`first-v1-{1,2,3}.png` `last-v1-{1,2,3}.png` `GEN-RECEIPT-v1.md`）→ PASS → `clip-v1.mp4`
- USE_GROK_IMG=yes · USE_GROK_VID=yes（仅 AUDIT PASS 后）· GO=yes（W1 出纸锁定，W3 开工生成）
