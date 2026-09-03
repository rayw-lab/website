# LOCKED · S6-T「回家」过渡（人 → 机甲化身）· 卡通 3D 风格化 · v3（改为中景：人与机甲均腰部以上；v2 全身连续 chibi 三连，换景别不换场景）

- 日期：2026-09-02 · 出纸：指挥官 · 角色锚句：`CHARACTER-SHEET-v1.md`；机甲锚句自 `public/models/hero-robot/README.md`（钛灰 `#5c6472` / 工业橙 `#ff6b35` / 青眼 `#49c5b6`，块面宽胸、五指手、直立人形；反 IP：无红蓝、无胸口车窗、无徽章、无火焰纹、无变形车件）
- purpose：滚动 scrub 过渡视频（W3 第 6→7 幕）；bind = 六站 6「AI 工作流」+ 支柱 3 + 城市化身连续性
- duration **10**

## first-frame prompt

```text
Stylized 3D character render in a high-end animated-film look, matte clay skin and brushed-titanium hard surfaces, NOT photorealistic. Subject: a calm East Asian man in his mid-thirties with short, thick, neatly-styled black hair with slight natural volume on top, a round-oval face with a soft jawline, straight dark eyebrows, dark eyes, and distinctive browline glasses with a black acetate upper rim and thin clear-metal lower rim, wearing a plain black knit polo shirt with two thin copper-brown stripes on the collar and sleeve cuffs, no logo, no emblem. Medium shot from the waist up, normal adult proportions identical to the bridge scene (head about one seventh of body height, NOT chibi): he stands upright and still, arms loosely crossed, framed from just above the waist to just above the head, occupying about 70% of the frame height; the low circular docking platform is out of frame below, only its thin cyan light ring reflects faintly on the floor edge at the bottom of the frame. Behind him a wide dark hangar recedes with faint rows of dark structural columns and a distant dim floor grid giving depth. The platform and the man occupy only the right 55% of the frame; the left 40% is empty deep midnight-blue negative space with faint haze. One soft cool-white top light from directly above casting a clean pool of light on the platform, cyan rim from the platform ring, faint amber ambient from far right. Eye level, 50mm, medium-wide. Aspect 16:9. No text, no letters, no logos, no badges, no cars, no wheels.
```

## last-frame prompt

```text
Stylized 3D render in the same high-end animated-film look, brushed-titanium hard surfaces, NOT photorealistic. On exactly the same circular dark-carbon docking platform with its thin cyan light ring, in the same wide dark hangar, at exactly the spot where the man stood, now stands a blocky humanoid mech framed in the same medium shot from its waist up to just above its squared head, occupying about 80% of the frame height: matte titanium-grey armor plates, small industrial-orange accent panels on the forearms and chest edges, dark grey joints, two glowing cyan eye-lenses, five-fingered hands at rest, calm upright pose. No red or blue paint, no truck-grille chest, no faction emblem, no flame decals, no wheels, no visible vehicle parts. The mech and the platform occupy only the right 55% of the frame; the left 40% remains empty deep midnight-blue negative space with faint haze. Identical lighting: cool-white top light, cyan rim from the ring, faint amber ambient from far right. Same eye-level 50mm medium-wide camera. Aspect 16:9. No text, no letters, no logos, no badges.
```

## motion prompt（duration 10）

```text
Static locked camera, no zoom, no pan. Over ten seconds: fine glowing cyan lattice lines trace across the man's body; he dissolves upward into a slow drift of cyan light particles that hang briefly over the platform; the particles then condense at the same spot into the waist-up form of a blocky titanium-grey humanoid mech with small industrial-orange accents, whose two cyan eye-lenses light up last as the final particles fade. The faint cyan ring reflection at the bottom edge pulses once when the eyes light. The left 40% of the frame stays empty midnight blue throughout; nothing else in the hangar changes. Stylized 3D animated-film look maintained; no wheels or vehicle parts appear at any moment.
```

## negative

```text
photorealistic, photograph, red and blue color scheme, truck grille chest, car windshield chest, faction emblem, badge, logo, flame decals, transforming car parts, wheels, tires, headlights, weapons, gun, sword, extra limbs, fused hands, second person, crowd, text, letters, numbers, subtitles, watermark, anime cel shading, chibi, rainbow neon, lens flare streaks, frame border, split screen, collage
```

## 可量测硬门
0. first 帧为腰部以上中景，头高 / 可见躯干高 ≤ 0.45（防 chibi）；last 帧机甲头顶不出画。
1–4 同 S0-T v1（负空间 / 占宽 / 同世界（平台环 IoU ≥ 0.85）/ 零字）。
5. 机甲主色：last 帧机甲躯干区平均色对 `#5c6472` 的 ΔE00 ≤ 12；橙色面积占机甲 ≤ 15%。
6. 反 IP 人审：无轮/车窗/徽章/红蓝。
7. 视频：抽 20 帧，任一帧出现轮子或车件 REJECT。

- drop：`~/studio-data-root/about-hall/gen/S6-T/`（`first-v3-{1,2,3}.png` `last-v3-{1,2,3}.png` `GEN-RECEIPT-v3.md`） · GO=yes（不依赖照片）
