# 角色特征表 v1（自磊哥 2026-09-02 提供的两张照片人工提取；原图待落 `~/studio-data-root/about-hall/ref/formal.jpg` / `selfie.jpg`）

供所有 LOCKED 的 `[CHARACTER]` 锚句 verbatim 引用。**不含任何品牌**（正装照 polo 胸口有月桂标志 → 一律排除）。

## 锚句（英文，各形态共用，字符级同文）

```text
a calm East Asian man in his mid-thirties with short, thick, neatly-styled black hair with slight natural volume on top, a round-oval face with a soft jawline, straight dark eyebrows, dark eyes, and distinctive browline glasses with a black acetate upper rim and thin clear-metal lower rim
```

## 服饰（按场景选一，均无 logo）
- 正式感：`a plain black knit polo shirt with two thin copper-brown stripes on the collar and sleeve cuffs, no logo, no emblem`
- 编辑部感：`a charcoal wool turtleneck`
- 机能感：`a matte black technical jacket with no visible branding`

## 体态 / 表情
- 默认：`arms relaxed or loosely crossed, weight on one leg, composed, faintly confident, mouth closed, not smiling broadly`
- 禁止：大笑、张嘴、夸张手势、比耶。

## 卡通 / 手绘化规则
- 保留三件辨识物：**browline 半框眼镜**、**顶部有体积的短黑发**、**圆脸软下颌**。
- 卡通版比例：头身比 1:4.5–1:5（不做 Q 版大头），面部简化但保留双眼皮与眉形。
- 手绘版：炭笔线 + 单色水彩；眼镜上框实线加粗、下框细线。

## image_edit（R 路线）附加指令
`keep the face, hairstyle, glasses and skin tone exactly as in the reference photo; do not beautify, do not change age, do not add facial hair; remove any logo or emblem from clothing`

## v2 增补（磊哥 2026-09-03 13:47 人拣）
- **真人路线 R 终止**：`S0-R/*` 存档不进仓，不再生成；`formal.jpg` 只留特征参考。
- **化身 = T 卡通 3D（首屏/六站/过渡）+ H 手绘（`/about/` 题图）**。
- **体型修订：偏瘦。** 所有已定选 T/H 帧走 `image_edit` 瘦身：脸颊收窄、下颌线清晰、肩与躯干收窄约 15%，衣服随体型贴合；**其余一切不变**（构图、机位、光、背景、眼镜、发型、表情、衣着款式）。不重生成、不改场景。
