# LOCKED · S0-R「桥」首屏 Hero · 真人写实（`image_edit` 路线）· v0（等原图落盘）

- 前置：`~/studio-data-root/about-hall/ref/formal.jpg`（正装照，黑 polo 棕条，胸口有品牌标 → 必须去除）与 `selfie.jpg`（正面近景，用于面部一致性对照）落盘 + sha256 登记。
- purpose / bind：同 S0-T。
- 工具：Grok Build `image_edit`，源图 = `formal.jpg`；`aspect_ratio` 传 16:9（原图竖版，需扩画布）。若工具拒真人脸 → 记 `DEFERRED_EXTERNAL(real-face)`，最多重试 2 次不同措辞，然后 T/H 转正。

## edit prompt（first）

```text
Cinematic editorial photograph, real skin texture, natural color grading, 50mm lens at f/2.8. Keep the man's face, hairstyle, browline glasses and skin tone exactly as in the reference photo; do not beautify, do not change his age, do not add facial hair. Remove any logo or emblem from his black polo shirt, keeping the two thin copper-brown stripes on the collar and sleeve cuffs. Recompose to a 16:9 medium-wide shot: he stands relaxed with arms loosely crossed at the exact center of a slender suspension bridge made of glowing fiber-optic cables and thin data streams spanning a dark void; the bridge's left end anchors into a cold cyan-lit industrial server hall, its right end reaches a warm amber city skyline of simple block towers. He and the bridge occupy only the right 55% of the frame; the left 40% is completely empty deep midnight-blue negative space with faint volumetric haze. Lighting: soft amber key from upper right rimming his shoulders and the top rim of his glasses, cool cyan fill from the left, cables glowing gentle cyan. Eye level camera, shallow depth of field on the far city, subtle film grain. No text, no letters, no logos, no badges, no cars.
```

## last / motion / negative
- last：同上 + "only his head has turned about fifteen degrees to his left toward the warm city; everything else identical"。
- motion（6s）：同 S0-T motion，把"stylized 3D"锚句换为 "photographic realism maintained; skin, eyes and glasses stay perfectly stable; no warping"。
- negative：S0-T negative 去掉 photorealistic，加 `plastic skin, over-smoothed face, changed identity, younger face, beard, teeth showing, laurel wreath logo, brand emblem`。

## 额外硬门
- 面部相似：审计路对照 `selfie.jpg`，人审 5 项（眼镜形、发型体积、脸型、眉形、肤色）全符合；任一漂移 REJECT。
- scrub 稳定：视频抽 12 帧逐帧看眼镜/手指，任一帧形变 REJECT（回 ⑤ 换种子，不改 prompt）。

- GO=待原图落盘
