# LOCKED · S0-R「桥」首屏 Hero · 真人写实（`image_edit` 路线）· v1（原图已落盘 · GO=yes）

- 源图：`~/studio-data-root/about-hall/ref/formal.jpg`，sha256 `0cde1f22…59b8fa1`（全文见同目录 `SHA256SUMS`），801×980 RGB，2026-09-03 13:03 磊哥提供。**原图不入 git。**
- 源图实况（替代 v0 里"黑 polo 棕条"的假设）：全身正面站姿；灰蓝色立领衬衫、黑裤；短黑发略蓬；细金属框眼镜；左手持手机、右手夹烟；背景米白墙 + 蓝色中文告示牌 + 右侧大理石柱。
- `selfie.jpg` 不再要求：面部对照用 `formal.jpg` 面部裁切放大（审计路自己裁），磊哥裁定其他角度一律用卡通/手绘替代，不再补拍。
- 分辨率风险：源图短边 801px，`image_edit` 输出 1280×720 需扩画布放大，面部细节有限；审计以"识别为同一人"为门，不以像素锐度为门。
- purpose / bind：同 S0-T。
- 工具：Grok Build `image_edit`，源图 = `formal.jpg`，`aspect_ratio` 16:9。若工具拒真人脸 → 记 `DEFERRED_EXTERNAL(real-face)`，措辞最多再试 2 次，然后 T 转正（ADR-1）。

## edit prompt（first）

```text
Cinematic editorial photograph, real skin texture, natural color grading, 50mm lens at f/2.8. Keep the man's face, hairstyle, thin metal-rimmed glasses, body shape and skin tone exactly as in the reference photo; do not beautify, do not slim him, do not change his age, do not add facial hair. Keep his grey-blue collared shirt and black trousers. Remove the cigarette from his right hand and the phone from his left hand; his hands rest naturally, arms relaxed at his sides or loosely crossed. Remove the wall, the sign and the marble column entirely. Recompose to a 16:9 medium-wide shot: he stands relaxed at the exact center of a slender suspension bridge made of glowing fiber-optic cables and thin data streams spanning a dark void; the bridge's left end anchors into a cold cyan-lit industrial server hall, its right end reaches a warm amber city skyline of simple block towers. He and the bridge occupy only the right 55% of the frame; the left 40% is completely empty deep midnight-blue negative space with faint volumetric haze. Lighting: soft amber key from upper right rimming his shoulders and the top rim of his glasses, cool cyan fill from the left, cables glowing gentle cyan. Eye level camera, shallow depth of field on the far city, subtle film grain. No text, no letters, no signs, no logos, no badges, no cars, no cigarette, no phone.
```

## last / motion / negative
- last：同上 + "only his head has turned about fifteen degrees to his own left toward the warm city; everything else identical"。
- motion（6s）：同 S0-T motion，把"stylized 3D"锚句换为 "photographic realism maintained; skin, eyes and glasses stay perfectly stable; no warping"。
- negative：S0-T negative 去掉 photorealistic，加 `plastic skin, over-smoothed face, slimmed body, changed identity, younger face, beard, teeth showing, cigarette, smoke, phone, signboard, chinese characters, brand emblem`。

## 额外硬门
- 面部相似：审计路对照 `formal.jpg` 面部裁切，人审 5 项（眼镜形、发型体积、脸型、眉形、肤色）全符合；任一漂移 REJECT。
- 去物：烟、烟雾、手机、告示牌文字、大理石柱 任一残留 REJECT。
- 体型：不得被模型"修身"；肩宽/腰身与源图目视一致。
- scrub 稳定：视频抽 12 帧逐帧看眼镜/手指，任一帧形变 REJECT（回 ⑤ 换种子，不改 prompt）。

- GO=yes（2026-09-03 13:05）
