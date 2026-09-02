# LOCKED · S5-T「天平」· 卡通 3D 风格化 · v1

- 日期：2026-09-02 · 出纸：gemini-3.7-flash · 角色锚句：`CHARACTER-SHEET-v1.md`（verbatim）
- purpose：W3 第 5 幕（全息天平从倾斜到水平平衡）；bind = 六站 5（第 5 站「端云大模型：车端/云端能力分层架构与场景化选型」）+ 支柱 2（端云大模型分层）；站内佐证 URL：`/work/llm-capability-layering/` 与 `/about/`
- 纪律：生成路 verbatim 抽取四段 fence，一个词不改；生成 first ×3、last ×3 各拣 1；审计路另 lane 出 `AUDIT-v1.md` 首行 `VERDICT=PASS|REJECT`；PASS 才 `image_to_video`。同叶 3 连 REJECT 熔断换路线。

## first-frame prompt

```text
Stylized 3D character render in a high-end animated-film look, matte clay skin with soft subsurface scattering and brushed-titanium hard surfaces, NOT photorealistic. Subject: a calm East Asian man in his mid-thirties with short, thick, neatly-styled black hair with slight natural volume on top, a round-oval face with a soft jawline, straight dark eyebrows, dark eyes, and distinctive browline glasses with a black acetate upper rim and thin clear-metal lower rim, wearing a plain black knit polo shirt with two thin copper-brown stripes on the collar and sleeve cuffs, no logo, no emblem. Medium shot: he stands poised in a deep dark void, both hands raised in front of his chest with open palms cupped upward, gracefully supporting a floating holographic scale of balance made of glowing geometric light-bars and thin vector fulcrums; the balance beam is slightly tilted at a fifteen-degree angle: the left tray holds a cool-cyan glowing automotive NPU chip module (an intricate geometric semiconductor die with glowing microscopic circuitry but no logos or text); the right tray holds a swirling deep-violet and amber nebula of neural reasoning nodes. The man gazes forward with a calm, analytical expression, mouth closed. He and the floating holographic balance occupy only the right 55% of the frame; the left 40% of the frame is completely empty deep midnight-blue negative space with faint volumetric haze and nothing else in it. Lighting: soft amber key light from upper right rimming his shoulders and the top edge of his glasses; dual under-glow from the balance (cool cyan illuminating his right hand and right side, violet-amber illuminating his left side); deep midnight-blue shadows, subtle film grain. Camera at eye level, 50mm lens, medium shot. Aspect 16:9. No text, no letters, no numbers, no chip logos, no cloud company logos, no brand marks, no badges, no cars.
```

## last-frame prompt

```text
Stylized 3D character render in a high-end animated-film look, matte clay skin with soft subsurface scattering and brushed-titanium hard surfaces, NOT photorealistic. Exactly the same subject: a calm East Asian man in his mid-thirties with short, thick, neatly-styled black hair with slight natural volume on top, a round-oval face with a soft jawline, straight dark eyebrows, dark eyes, and distinctive browline glasses with a black acetate upper rim and thin clear-metal lower rim, wearing a plain black knit polo shirt with two thin copper-brown stripes on the collar and sleeve cuffs, no logo, no emblem. Same medium shot: he stands in the exact same spot with hands cupped in the same supportive posture; the floating holographic scale of balance between his palms has now settled smoothly into a perfectly horizontal, balanced equilibrium (zero tilt); a steady stream of luminous gold and cyan routing data particles flows through the central fulcrum conduit connecting the left cyan NPU chip module and the right violet nebula in harmonious synchrony. The man maintains a composed, confident gaze toward the viewer, mouth closed, the top rim of his glasses catching a balanced dual cyan-amber highlight. He and the balanced holographic scale still occupy only the right 55% of the frame; the left 40% of the frame remains completely empty deep midnight-blue negative space with faint volumetric haze and nothing else in it. Identical lighting: soft amber key from upper right, balanced dual cyan and violet under-glow, deep shadows, subtle film grain. Same camera at eye level, 50mm lens, medium shot. Aspect 16:9. No text, no letters, no numbers, no chip logos, no cloud company logos, no brand marks, no badges, no cars.
```

## motion prompt（duration 6）

```text
Static locked camera, no zoom, no pan, no dolly. The man stays firmly in place in the right half of the frame with hands steadily cupping the holographic balance; over six seconds the tilted balance beam oscillates gently and levels out smoothly into a rock-solid, perfectly horizontal equilibrium. Data light particles flow steadily through the central fulcrum conduit between the left cyan chip and right violet nebula. Volumetric haze drifts very slightly in the dark void. Nothing enters or leaves the frame; the left 40% of the frame stays empty midnight blue throughout. Stylized 3D animated-film look maintained in every frame; no morphing of face, glasses, hands, or chip geometry; no brand marks or text appear; no flicker.
```

## negative

```text
photorealistic, photograph, real skin pores, uncanny face, wrong glasses shape, missing glasses, extra fingers, missing fingers, fused hands, deformed hands, second person, crowd, chip logos, Intel logo, Nvidia logo, Qualcomm logo, Arm logo, Apple logo, cloud provider logos, AWS logo, Google Cloud logo, Azure logo, circuit board text, model parameter numbers, 7B, 70B, parameter labels, readable diagrams, typography, text, letters, numbers, subtitles, caption, watermark, logo, brand, badge, emblem, laurel wreath, car front, license plate, red and blue robot paint, rubber-hose cartoon, anime cel shading, chibi big head, oversaturated rainbow neon, lens flare streaks, motion blur smear, frame border, split screen, collage, grid
```

## 可量测硬门（审计路逐条量）
1. **负空间**：x < 0.40W 区域内，亮度 > (背景中值 + 30) 的像素占该区 ≤ 1%（掩膜口径写进 AUDIT）。
2. **占宽**：主体 + 天平掩膜最左列 x ≥ 0.50W（设计目标 0.55W；0.50W 为硬线）。
3. **同世界**：first↔last 在 x<0.40W 区域 RGB 均值每通道差 ≤ 6；两帧人物姿态与天平中心支点轮廓 IoU ≥ 0.85。
4. **零字**：OCR 无置信度 ≥ 0.3 的字符。
5. **角色一致**：browline 眼镜（上粗下细）、短黑发有顶部体积、圆脸——三件缺一 REJECT；polo 无任何徽章。
6. **风格**：无摄影写实特征（毛孔、真实镜头眩光）；无 anime 描边。
7. **端云全息天平与零商标专项门**：左盘芯片与右盘星云必须为纯抽象几何微架构与粒子科技形态，严禁出现任何真实半导体或云厂商商标/缩写/代号；天平处于水平平衡态（last 帧）时，左右盘托盘中心 Y 坐标高度差 ≤ 0.02H。

- duration 6（天平阻尼平稳归零 6s 稳健定格）· aspect 16:9（1920×1080）· 9:16 版本另开 `S5-T-portrait-LOCKED`
- drop path：`~/studio-data-root/about-hall/gen/S5-T/`（`first-v1-{1,2,3}.png` `last-v1-{1,2,3}.png` `GEN-RECEIPT-v1.md`）→ PASS → `clip-v1.mp4`
- USE_GROK_IMG=yes · USE_GROK_VID=yes（仅 AUDIT PASS 后）· GO=yes（W1 出纸锁定，W3 开工生成）
