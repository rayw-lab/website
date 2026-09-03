---
title: ADR-5 · 馆长出场时机、S6 让位、9:16 删除追认、登记纠偏
id: ADR-5
status: locked
date: 2026-09-03
decider: 董事会（Grok 4.6 xhigh，效力 = 磊哥决定）
packages: GAPS-A P1-1 / P1-3 / P1-5（本包只裁；INDEX 由指挥官 L11 登记，本文件不改）
supersedes: —
amends: ADR-3 决策 A Consequences #1（机甲出场时机）；ADR-3 决策 B 三动作表「Present = 第 5 幕」、B.2 触发句、B.2 同屏 GPU、B.6 pose 断言；ADR-3 决策 C 体积表「移动 9:16」行；ADR-1 §3「9:16 只给赢家」收窄为本期不投
---

# ADR-5 · 馆长出场、竖版删除与登记纠偏

## 背景

查缺审计 A（`evidence/about-hall/GAPS/A-charter-adr-compliance.md`，HEAD `e3a5a82`）抓出两处产品偏差，外加登记停在 L10。本包只裁这三件。不重开：路线 C、S0=桥、S6=唯一变身、馆内不变形、首屏禁 three、展厅不 import `src/lab/world/**`、Hall-R ≤180KB gzip、总载荷 ≤6.0MB、文字不进 diffusion、六站无年份、不用外部引擎。

**偏差 1 · ADR-3 内部自相矛盾（必须定谳）**

| 条款 | 原文 | 现树 |
|---|---|---|
| A Consequences #1 | 「机甲只在 S6 之后作为馆长出现」 | `Curator.astro`：`leftHero = scene !== 's0'`，S1 进视口即 `import('./curator')` |
| B 三动作表 | Present = 「第 5 幕区间」；Gaze = 挂载后默认；Salute = 第 8 幕 | `LIFT_SCENES = s2..s6`（托举横跨五幕，含 S6）；Salute 在 `s8`；无 `data-curator-pose` |
| B.2 触发 | 「S6 及之后的区间进入视口才 `import()`」 | 与 A#1 同向，但与「Present = 第 5 幕」互斥：若真 S6 后才挂，第 5 幕没有馆长 |
| B.2 同屏 | 「禁止 hall `<video>` 的 play/seek 与 three `rAF` 同帧」 | S6 `createScrollScrub` 与 curator `tick()` 无暂停协议；`tick` 在 `is-on===false` 时仍 `requestAnimationFrame` |
| B.6 e2e | 滚到 S6 之后出现 canvas；三态 `data-curator-pose` | 无 pose 属性、无 pose 用例 |

叙事母本未改：路线 C = 人形态 → S6 唯一变身 → 馆长机甲；展厅是「机器人的老家」。S0 仍是桥上的人形态片/poster。S6 仍是 220vh 滚动 scrub 的唯一变身片。

事实机位：磊哥看过并接受 `evidence/about-hall/W3d/shot-stations.png` 与 `VIS-1/after-hall-03-station-rail-curator.png`（站 04 右侧有馆长，双臂自然下垂）。Gaze / Present / Salute 骨骼已在 `curator.ts` 实装，合同未锁。

**偏差 2 · 9:16 被 W1h 私自 drop**

ADR-3 决策 C 锁「移动 9:16 ≤500KB/段」。W1h（`909a209`）把 `hero-s0-portrait.mp4` / `transition-s6-portrait.mp4` 从 `public/media/about-hall/` 与清单 `src9x16` 删掉；移动端只显示 poster、不请求视频。gen 原件保留。竖版实测 726488 B，本身已超 500KB。审计标 P1-3：私自 drop 不够，必须董事会明文。

**登记**：`ABOUT-HALL-INDEX.md` / `ABOUT-HALL-LOOP-LOG.md` 停在 L10 14:20。本包决策 C **只列**指挥官 L11 必登记行，不改那两份文件。

幕号（现树，不重开）：`s0` Hero · `s1` 工作台出发 · `s2`–`s5` 演进站 · `s6` 回家变身片 · `s7` 晶体 · `s8` 收官。

---

## 决策 A · 馆长出场时机：门口迎客 + S6 让位

### Decision

**追认现实现的出场时机，不追认现实现的托举范围与同屏 GPU。**

1. **出场。** 馆长机甲从 **S1 起在场**（宽屏 + `prefers-reduced-motion: no-preference` + WebGL）。S0 禁止挂 three、禁止 `import('./curator')`。解释：展厅是机器人的老家，馆长从门口迎客；S6 视频讲的是**他的来历**（人形态如何变成他）。人与机甲**同框但不同层**：片里是过去，画框外是现在。路线 C 的变身仍只有 S6 这一段，馆内机甲仍不变形。
2. **three 懒加载写死。** 第一次 `[data-scene="s1"]` 与视口相交（现树 threshold `0.08` 可保留）才允许 `import('./curator')`；只 import 一次。初始 HTML 零 three / 零 curator chunk `modulepreload` / 零 `HeroRobot.glb` preload（ADR-3 B.2 静态禁令不放宽）。
3. **三动作表纠正。** 「第 5 幕」= `data-scene="s5"`（文案 kicker「天平」、静帧 alt「双手托起全息天平」），**不是**「连续五幕」。现 `LIFT_SCENES = s2..s6` 是误读，本包否决。

   | 代号 | `data-curator-pose` | 触发（`bestScene()`） |
   |---|---|---|
   | Gaze | `gaze` | `s1` `s2` `s3` `s4` `s7`（挂载后默认） |
   | Present | `present` | **仅 `s5`** |
   | Yield | `yield` | **仅 `s6`**（本包新增；让位，不是第四套骨骼秀） |
   | Salute | `salute` | `s8` |
   | （不在场） | 属性不写或宿主无 `.is-on` | `s0`；页脚相交；`<900px`；reduced-motion；无 WebGL |

4. **S6 同框纪律（两个主角禁令）。** `bestScene()==='s6'` 时馆长必须让位，禁止继续 Present、禁止 `renderer.render` 与 S6 `seek` 抢同一帧。让位形态 = **冻最后一帧 + 降不透明度（≤0.45）**；不 `destroy()`（禁止为让位重拉 GLB）。离 S6 后恢复 rAF 与对应 pose。
5. **同屏 GPU 互斥（可验收）。** 任一动画帧，下列三条最多一条为热路径：Hero 指针 scrub 写 `currentTime`；S6 滚动 scrub 写 `currentTime`；curator `renderer.render`。具体化：

   | 主导幕 | 允许热 | 必须冷 |
   |---|---|---|
   | `s0` | Hero seek（桌面非 RM） | curator rAF **取消**（不是 early-return 仍挂环）；S6 video `pause` |
   | `s1`–`s5`、`s7`–`s8` | curator rAF | Hero 与 S6：`pause`；已滚出视口的 video 卸 `src` 或保持 `preload=none` 且不 seek |
   | `s6` | S6 seek | curator rAF **取消**；`pose=yield`；Hero `pause` |
   | RM / 无 WebGL / `<900px` | 无 | 不启动 rAF；不播骨骼；video 按已有降级藏 |

   现 `tick()` 在 `!is-on` 时仍 `requestAnimationFrame(tick)` = 冷路径挂环，**不合格**。冷 = `cancelAnimationFrame`，再热再挂。

6. **`data-curator-pose` 升硬门。** 宿主在 `.is-on` 期间必须写 `gaze|present|salute|yield` 之一。`data-curator-lift` / `data-curator-scene` 可留作诊断，不能替代 pose。e2e（桌面、非 RM）最低：S1 后存在 canvas；`s1`→`gaze`；`s5`→`present`；`s6`→`yield` 且 rAF 冷（`data-curator-raf="0"` 或等价）；`s8`→`salute`。RM 例：无 three 循环、`getAnimations()` 仍 0。无 JS：不要求 canvas。

### Rationale

选项 (1)「严格 S6 之后才出现」叙事最纯（末帧机甲 → canvas 接力 = 变身完成、馆长就位），但会让 Gaze/Present 几乎作废、S1–S5 右侧空掉，并且**拆掉磊哥已接受的站台帧**。更致命的是：它救不了 ADR-3 的自相矛盾——B 把 Present 放在第 5 幕，A/B.2 又禁止第 5 幕有馆长。选 (1) 等于把 B 的三动作表作废，而章程 W3 点名的就是这三动作。

选项 (2) 能同时成立的读法：S0 片是「专家从哪来」，S6 片是「他怎么成为馆长」，画框外的机甲是「现在负责这座老家的人」。这与「机器人的老家」同向，也不碰路线 C（变身仍然只有 S6、馆内仍不变形、首屏仍是人形态）。

本席**不**把「磊哥看过图」读成「五幕托举也追认」。已接受帧是站 04 右侧馆长、双臂下垂 = Gaze。s5 天平才是 Present 的文案锚。S6 上继续 lift 才是「两个主角」：片里机甲在凝聚，框外机甲还在托球。

指挥官倾向 (2)。本席独立结论与倾向同向，但收窄了托举、补了让位与 GPU 互斥；不是盖章现树。

### Consequences

- ADR-3 A#1 改读为本包 A.1；「机甲只在 S6 之后出现」作废。S6 视频 last 帧仍是变身完成的**片内**句号，不是馆长 canvas 的首次允许时刻。
- ADR-3 B.2 触发句改读为本包 A.2（S1，不是 S6）。B.2 同屏句改读为本包 A.5。B.6 改读为本包 A.6（四态，含 `yield`）。
- 要改的文件（实现票，本 ADR 不施工）：`src/components/city/halls/about/Curator.astro`、`curator.ts`、`e2e/about-hall.spec.ts`。Hero / Transition 只补「离视口即 pause、不与 rAF 同热」；不改片源、不改 220vh。
- 验收一句：桌面非 RM，S1 相交才出现 curator chunk；S0 初始 HTML 零 three；S5 `data-curator-pose=present`；S6 `=yield` 且 rAF 取消、scrub 仍能改 `currentTime`；S8 `=salute`；同一时刻三条热路径至多一条。
- 不改：Hall-R 180KB、G-Hall 引擎针、`HeroRobot.glb` 动态 fetch、地轨仍 SVG、`/about/` 零 3D。

### Rejected alternatives

| 选项 | 内容 | 否决理由 |
|---|---|---|
| (1) 严格 S6 后登场 | 拆 S1–S5 馆长，Gaze/Present 基本作废 | 与已接受帧、与 B 的第 5 幕 Present、与「老家迎客」三撞 |
| (2′) 追认现树整包 | 出场 S1 **且** 托举 s2–s6 **且** S6 继续 rAF | 只修了 A#1，把两个主角和误读「五幕」写死 |
| (2″) S6 卸载 canvas | 进 S6 `destroy()`，出 S6 再 mount | GLB/Draco 重拉；让位变成闪烁 |
| (3) S6 馆长跟着片做变身 | canvas 上再演一次人→机 | 第二段变身；ADR-1/3 已禁 |
| Present = s2–s5 | 全程向导托球 | 三动作无差别；已接受帧是下垂双臂；天平幕才是托举锚 |

### 已拍死不重开（本条）

- 路线 C；S6 唯一变身；馆内不变形。
- 首屏（S0）禁 three。
- 不 import `src/lab/world/**` / webgpu / rapier。
- 不为过门删 G-Hall-2..4。

### 不可逆点

- 公开叙事变成「进门就遇见馆长」。再改回「看完变身才出现」= 拆站台右侧与地轨构图。
- `yield` 写入 e2e 后，删第四态必须改测试，不能只改骨骼。

---

## 决策 B · 9:16 竖版删除：追认合规

### Decision

**追认 W1h。** 移动端（`<900px` 或 `hover: none`）**不投视频**：不写 9:16 `<source>`、不请求 16:9 片、画面 = poster。`public/media/about-hall/` 不得有 `*-portrait.mp4`；`about-hall-media.json` 不得有非空 `src9x16`。gen 原件可留在 `studio-data-root/about-hall/gen/`，不入库。

ADR-3 决策 C 体积表「移动 9:16 ≤500KB/段」**改为**：

| 项 | ADR-3 锁定 | 本包锁定 |
|---|---|---|
| 移动视频 | ≤500KB/段（当时无实证） | **本期不投。** 清单无 `src9x16`、仓内无 portrait 文件即合规。日后若要投，**必须新 ADR**（预算、谁请求、是否计入 6.0MB 总载荷一并裁） |

2.0 / 3.5 / 6.0 / poster 60KB **不改**。G-Hall-8：无 `src9x16` 不得红；若有人把 portrait 或非空 `src9x16` 塞回来而没有新 ADR → FAIL。ADR-1「9:16 只给赢家，赛马不做」收窄为：赛马仍不做；**本期赢家也不投**。

移动端「活」感（例如 Hero poster 上的 CSS 光缆流光）**不**用竖版视频补。记 **W8 可延**，不阻塞 #234。禁止用 three、禁止 autoplay 横片硬裁冒充竖版活感。

### Rationale

W1h 不是偷放宽体积，是**面对 726KB > 500KB 选择不请求**，总载荷从 5.36MB 降到 3.22MB。纸面双胞胎 `/about/` 仍是移动端权威文案（ADR-3 A）；展厅移动端走与 reduced-motion / 无 JS 同一条 poster 路径，四态仍然体面。章程 W4「移动端 9:16 视频」是未被实证的交付想象；ADR-3 C 已写「尚无 9:16 实证；超了另开 ADR」。超了、选择不投、走 ADR = 合规。把 500KB 抬到 726KB、或把横片塞给手机，才是改判据。

### Consequences

- 要改的文件（文档抄本，本 ADR 不施工）：`docs/local-cmd/ABOUT-HALL-TECH-ARCH.md`（§4 总载荷、§5.2 清单字段删强制 `src9x16`、§6 表该行改「本期不投」并去掉「草案」）；`docs/local-cmd/ABOUT-HALL-WBS-01-HERO-ASSETS.md`（删除 `*-portrait.mp4` 交付行与 ≤1.5MB 口径）；`scripts/about-hall-gate.mjs`（无 `src9x16` PASS；`public/media/about-hall/*portrait*` 或非空 `src9x16` FAIL）；INDEX 的 AH-W4 目标句去掉「含 9:16」——在决策 C 的 L11 行里改，不在本文件改。
- Hero.astro / Transition.astro 现已 `source media="(min-width: 900px) and (hover: hover)"`，保持。
- 验收一句：`ls public/media/about-hall/*portrait*` 为空；媒体 JSON 无非空 `src9x16`；窄视口 Network 不出现 hall mp4；G-Hall-8 仍绿。
- CHARTER §1.5 / W4 历史句子不在本包 write root；L11 文档票加一句「已被 ADR-5 取代」，禁止静默改回 9:16 交付。

### Rejected alternatives

| 选项 | 内容 | 否决理由 |
|---|---|---|
| 补压赢家 9:16 ≤500KB 进仓 | 履行旧表 | 726KB 已证 crf24/720p 竖版不适合该预算；为过门再压会伤画质；移动权威页不靠这段片 |
| 把 500KB 改成 800KB 再进仓 | 新数字无 ADR | 章程「视频预算上调 = 重大」；W1h 当时超限未走 ADR，本包追认的是**不投**不是改数 |
| 移动端播 16:9 | 省一档资产 | 窄屏硬裁，Paidax 调研要避开的坑；现 source 已不给移动 |
| 判 W1h 违规、把 portrait 请回 public | 形式追章程 W4 | 请回即超 500KB 或偷偷改门 |

### 已拍死不重开（本条）

- 不为过门再放宽 2.0 / 3.5 / 6.0。
- 不把 `/about/` 升级成第二条 i2v。
- 赛马不出三路视频、不出 9:16。

### 不可逆点

- 本期 PR / #234 不含竖版文件。复活竖版 = 新 ADR + 新机器门，不能把 gen 原件直接拷回 public。

---

## 决策 C · 登记纠偏：INDEX / LOOP-LOG 停在 L10，L11 必写这些行

### Decision

**只列，不改文件。** 指挥官下一 loop（L11）必须把 CURRENT AUTHORITY 推到 L11，并按下面状态行登记。禁止继续用 HOST_READBACK / MERGED 冒充 `LIVE_OBSERVED`。全量 e2e 仍以 ADR-4 决策 C.5 为准：干净端口、现 HEAD（≥ `e3a5a82`）、`--list` 分母、0F/0S/0 flaky。

### Rationale

审计 A §3 已对过 Git：L10 之后至少还有 T1a / T1b / QE / M0 / W1g / W1h / VIS-1。看板若不停在「全维未开工 / W1b DISPATCHED / D4 DISPATCHED」，下一轮会把已合代码再派一次，或把过期 93/93 写成现树绿。

### Consequences · 指挥官 L11 必须登记的状态行

**页眉**

| 字段 | 现（错） | L11 必须写成 |
|---|---|---|
| CURRENT AUTHORITY | L10 14:20 | **L11** + 实际时刻 |
| min 维 | 「全维未开工（A/B/C/D/E 均 —）」 | 按现树重填；**禁止**再写全维 —（视频/馆长/纸面/换位均已有物，人门成片与全量 e2e 仍缺） |
| ZDR / i2v 摘要 | 「W1f 在跑；S0 i2v#1 REJECT / S6 兜底」 | W1h 真 mp4 已在 HEAD `909a209`；竖版已 drop（ADR-5 B）；人门 A 成片仍未双席入账 |
| 远端 | （未写清） | 本地 `e3a5a82` ≠ `origin/codex/about-hall-20260902` `1963f7b`；#234 CI 停在无视频 SHA |

**票册（已有行纠偏）**

| 票 | 现 | L11 必须写成 |
|---|---|---|
| AH-D3 | HOST_READBACK_PASS | MERGED（ADR-3 locked；体积门已进 gate）；出场/9:16 以 **ADR-5** 为准 |
| AH-D4 | DISPATCHED | **MERGED**（`adr/ADR-4-*.md` locked；T1a/T1b 已 commit） |
| AH-D5 | （无） | **本包** MERGED；write root `docs/local-cmd/adr/ADR-5-*.md` |
| AH-G1 | RECEIVED · 路径 `evidence/about-hall/GIANTS-L1-i2v.md` | 路径改为 `studio-data-root/about-hall/gen/G1-canary/GIANTS-L1-i2v.md`，并声明**不入库**；或另票把文件拷进 `evidence/about-hall/` |
| AH-W1a | HOST_READBACK（等 W1f slim） | 静帧定选 PASS；后续见 W1g/W1h |
| AH-W1b | DISPATCHED(W1f→i2v#2) | **HOST_READBACK_PASS**（`hero-s0-720p.mp4` 在仓）；**不得** MERGED/LIVE——人门 A 双席未入账 |
| AH-W1c | HOST_READBACK（slim 待 i2v#2） | **HOST_READBACK_PASS**（`transition-s6-720p.mp4` 在仓）；同上，人门未 LIVE |
| AH-W3d | HOST_READBACK_PASS | 维持 HOST_READBACK；合同以 ADR-5 A 为准，补洞走 **AH-W3e**；不得标 LIVE |
| AH-W4 | MERGED（目标句含 9:16） | MERGED 可留；目标句改为「触感 + 四态；**9:16 已由 ADR-5 豁免**」 |
| AH-W6 | HOST_READBACK_PASS（93/93 @ `c463c36`） | 注明 **全量过期**（其后 ≥8 枚产品 commit）；新 attempt 另票 **AH-W6-full-e2e-clean**；禁止把 93/93 写成现 HEAD 绿 |

**票册（L10 后已施工、INDEX 无行 —— 必须补行）**

| 票 | 对应 commit（取证） | L11 状态 |
|---|---|---|
| AH-M0 | `5e3c4b6` 渲染树删 `[[占位]]` | MERGED |
| AH-T1a | `5c7087f` 北槽换位 | HOST_READBACK_PASS（几何 8/8 已手跑；visibility e2e 仍缺，见审计 P1-4） |
| AH-T1b | `df497c4` 方案 1 转场 | HOST_READBACK_PASS（代码+用例存在；本席未跑 e2e） |
| AH-QE | `bbdf4ee` Q/E 第三人称 | HOST_READBACK_PASS |
| AH-W1g | `827308f` slim 静帧进仓 | MERGED |
| AH-W1h | `909a209` 两段 16:9 + 竖版 drop | HOST_READBACK_PASS；9:16 以 ADR-5 B 追认 |
| AH-VIS-1 | `e3a5a82` 视觉 pass | HOST_READBACK_PASS（零逻辑）；人门三维现树未重评 |
| AH-W3e | （未开工） | **PLANNED**，依赖 D5；见下方实现票 |
| AH-W6-full-e2e-clean | （未跑） | **PLANNED**；ADR-4 C.5 合入门，不在本包施工 |
| AH-ARCH-SYNC | （未做） | **PLANNED**；抄 ADR-3/5 数字与 9:16 豁免 |

**热点表**

| 文件 | 现 | L11 |
|---|---|---|
| `src/pages/about/index.astro` | 持有 AH-W4 | **释放**（W4 已 MERGED；VIS-1 已过） |
| `src/lab/world/areas/Areas.ts` | 持有 AH-W5 | **释放** |
| `Curator.astro` / `curator.ts` | （未列） | 持有 **AH-W3e**，直到 pose/rAF 门绿 |

**NEEDS_LEIGE 行**

| 项 | L11 |
|---|---|
| 六站 `[[占位]]` | 渲染树已删。建议改为「合入后填真句子；**禁止**『或通用句』」（ADR-4 C） |
| PR #234 merge | 仍须磊哥点；前置 = ADR-4 C 序（现缺 C.5 全量 e2e + 远端回读） |

**LOOP-LOG**

- 顶部看板加 **L11** 行：收稿 = 本 ADR + 审计 A 的 P0/P1 清单；在跑 = W3e / ARCH-SYNC / INDEX 回写 / 全量 e2e（若开）；下一步不得再写「等 ADR-4」。
- L10 之后的 T1a/T1b/QE/M0/W1g/W1h/VIS-1 压进 L11 正文，禁止只改页眉不写明细。

本包**不**授权改 HANDOFF / TECH-ARCH / WBS——那些走 AH-ARCH-SYNC 与 §13 副本票。

### Rejected alternatives

| 选项 | 内容 | 否决理由 |
|---|---|---|
| 本席直接改 INDEX | 董事会施工 | 席位禁写业务与看板；write root 只有本 ADR |
| 把 HOST_READBACK 升 LIVE | 省一次全量 | 章程：只有 `LIVE_OBSERVED` 作验收 |
| 等 W3e 再登记 L11 | 先做后写 | 无索引票已施工正是审计 DEVIATION；先补行再派单 |

### 不可逆点

- 无。登记可改；不改 Git 对象。

---

## 与 ADR-1 / 2 / 3 / 4 的分工

| 问题 | 以谁为准 |
|---|---|
| R/T/H 生产顺序、S0=桥、S6=唯一变身、叶级熔断 | ADR-1 |
| `hallPath` / `deepLink` / 快照 / 展厅不进 LHCI / G-Hall 引擎针 | ADR-2 |
| 路线 C 叙事、Hall-R 懒加载预算、2.0/3.5/6.0、静帧降级合法 | ADR-3（出场时机与 9:16 行以 **本包** 修正） |
| 北槽换位、城厅转场、#234 合入序、禁通用句 | ADR-4 |
| 馆长何时出现、S6 与 rAF 怎么互斥、pose 硬门、竖版是否交付、L11 登记什么 | **本包** |

冲突时：引擎隔离与体积上限仍以 ADR-2/3 为准；本包只改出场时刻、让位、9:16 交付与看板纠偏。

---

## 实现票建议（指挥官派，本席不施工）

| 票名 | write root（唯一） | 验收一句 |
|---|---|---|
| **AH-W3e-curator-contract** | `src/components/city/halls/about/Curator.astro`、`curator.ts`、`e2e/about-hall.spec.ts` | 桌面非 RM：S1 相交才 `import('./curator')`；S0 初始 HTML 零 three；`data-curator-pose` 在 s1=gaze / s5=present / s6=yield / s8=salute；S6 期间 rAF 取消且 scrub 仍 seek；同一帧 Hero seek、S6 seek、`renderer.render` 至多一条；RM 无 rAF。 |
| **AH-ARCH-SYNC** | `docs/local-cmd/ABOUT-HALL-TECH-ARCH.md`、`ABOUT-HALL-WBS-01-HERO-ASSETS.md`、`scripts/about-hall-gate.mjs`（仅 G-Hall-8 的 9:16 / portrait 断言） | §4/§6 抄 ADR-3 锁死数字并去掉「草案」；9:16 行抄 ADR-5「本期不投」；无 `src9x16` 不红；`public/media/about-hall/*portrait*` 存在则 FAIL。 |
| **AH-INDEX-L11** | `docs/local-cmd/ABOUT-HALL-INDEX.md`、`ABOUT-HALL-LOOP-LOG.md` | 页眉 L11；上表「必须写成」全部落地；补 T1a/T1b/QE/M0/W1g/W1h/VIS-1/D5/W3e 行；热点释放 about/Areas；占位建议删「或通用句」。 |

W8（不阻塞 #234）：移动端 poster 光缆流光等「活」感；六站真履历；A10 城市 poster。全量 e2e 与 push 回读仍是 ADR-4 C 的 P0，不在本包重裁。

---

## NEEDS_LEIGE

| 项 | 为什么必须磊哥 | 建议 |
|---|---|---|
| （本包无新必问项） | 出场读法与竖版不投已由本席锁定；磊哥已接受站台馆长帧 | 若实机看 S6 仍觉得两个主角打架，只加码让位（opacity→0），**不重开**出场时机 |
| PR #234 点 merge | 发布权（ADR-4） | C.5 全量 e2e + 远端回读后再点 |

其余（S1 迎客、s5 才托举、S6 yield、9:16 本期不投、L11 必登记）董事会已裁，不再问。
