---
title: ADR-3 · 路线 C 双形态、W3 馆长缺口、W1 静帧降级与体积门
id: ADR-3
status: locked
date: 2026-09-03
decider: 董事会（Grok 4.6 xhigh，效力 = 磊哥决定）
packages: D3（W0 未完项）+ W3 偏差登记 + W1 偏差登记
supersedes: —
amends: ADR-2 G-Hall-5/6 记账范围（Hall-R 懒加载）；章程 §1.5 视频单文件/总载荷数字（G1 实证追认）
---

# ADR-3 · 路线 C 双形态与两处波次偏差

## 背景

章程 §6 W0 要求董事会拍三件事：路线 C 双形态、化身兜底顺序、进楼快照契约。后两件已落 ADR-1 / ADR-2。第一件在 ADR-1 里只被**复述为已锁叙事**，没有独立 ADOPT 边界，也没有把站点双胞胎写进 ADR 链。STEP0-DIGEST #49 把 Paidax 路线 C 标成 adopt，但 digest 不是裁决。

同时出现两处执行偏差，必须在本包一并定谳，否则下一轮会把「已合」和「应交」搅在一起：

1. **W3**：章程要 8 幕 + `data-bind` + **hero-robot 程序化三动作（注视 / 托举 / 致意）** + **六站地轨**。L6 收口时 `src/components/city/halls/about/` 只有 `Hero` / `Stations` / `Crystal` / `Epilogue`；无 `Curator` / `StationRail`；INDEX 把 AH-W3 标成 MERGED。指挥官已另派补齐，write root 为 `Curator.astro` | `curator.ts` | `StationRail.astro`。
2. **W1**：`image_to_video` 被 ZDR 连拒（G1 canary 原文在册）。以静帧 poster 开页；S0-H 改派 `/about/` 题图；S6-T 因 chibi 改腰上中景；体积门在 TECH-ARCH / WBS-01 被指挥官改成首屏 2.0MB，**未走 ADR**。章程 §8 写明「视频预算上调 = 重大」。

本包不重开：C+B+A；机器人是馆长不变形；文字不进 diffusion；六站无年份；不用外部生图引擎；i2v 本项目解禁；ADR-1 生产顺序 / S0=桥 / S6=唯一变身；ADR-2 的 `hallPath` / `deepLink` / 快照字段 / SRD 补行语义。

三个「C」不得混用：

| 称呼 | 来源 | 本包地位 |
|---|---|---|
| **路线 C** | Paidax x1 §5.1 / STEP0 #49 | **本包 ADOPT**：人形态（物理世界专家）→ S6 → 馆长机甲 |
| **方向 C** | P1 标杆：证据编辑部 | **纸面层**：`/about/` 高触感双胞胎，不是第二条变身叙事 |
| **C 全覆盖** | 12 楼脑暴：到达横幅 | **已锁**（ADR-2），与化身无关 |

---

## 决策 A · 路线 C 双形态正式裁决

### Decision

**ADOPT 路线 C 为页内叙事与站点形态，不覆盖 ADR-1 的生产赛马。**

页内：首屏人形态化身（真人 / 卡通 / 手绘之中的生产赢家）= 物理世界专家；唯一过渡 S6 把人解构为光子，同机位凝聚为钛灰馆长机甲（`HeroRobot.glb` 同族）；馆内机甲不再变形、不驾车、不出现第二段人→机。

站点：`/world/about-pavilion/` = 炫技展厅（动效豁免区，不进第一刀 LHCI）；`/about/` = 纸面双胞胎（SEO / 无 JS / reduced-motion / 移动端权威文案，零 3D）。城里 E 有 `hallPath` 进展厅；楼宇快览与正文 CTA 仍走 `deepLink: "/about/"`（ADR-2，不重开）。

### Rationale

章程 §0 已写这套骨架；STEP0 #49 与 #32 只是调研 adopt，需要 ADR 才能对抗下一轮「首屏直接上机甲」或「关掉 `/about/`」。ADR-1 裁的是 **R/T/H 哪条出像素** 以及 S0=桥、S6=唯一变身；若不把叙事双形态单独立案，两份 ADR 会抢「双形态」这个词。拆开之后：ADR-1 = 生产叶；本包 = 访客看到的接力与两个 URL。

### Consequences

1. 首屏禁止以机甲为主角；机甲只在 S6 之后作为馆长出现（视频 last 帧或 Hall-R canvas，见决策 B）。
2. `/about/` 不得上 three / 滚动劫持 / 与展厅抢 LHCI 预算。手绘 S0-H 只做题图，不把纸面页升级成第二条 i2v 叶（决策 C）。
3. 文案与 `data-bind` 继续只引用定位单源与站内真实 URL；六站用序号 `01–06`，禁止年份；扩散图零字。
4. 人形态生产赢家仍按 ADR-1：T/H 赛马，R 等照片；本包不指定 T 或 H 为形象终局（终选仍 `NEEDS_LEIGE`）。

### Rejected alternatives

| 选项 | 内容 | 否决理由 |
|---|---|---|
| (a′) 只锁站点双胞胎、页内可改成全程机甲 | 无照片就用 HeroRobot 当 Hero | 与「机器人的老家」相反：老家要先看见人从哪来；也撞 ADR-1「T/H 不是可删玩具」 |
| (b′) 关掉 `/about/`，只留炫技页 | 单一 URL | 无 JS / SEO / 移动端失去权威页；ADR-2 已锁 `deepLink` 指纸面 |
| (c′) 本包重裁 T/H/R 顺序 | 把 ADR-1 赛马再开一次 | 已拍死 |

### 已拍死不重开（本条）

- 馆长不变形、不出现变形车件、不红蓝涂装、不胸口车窗、不派系徽章。
- 文字 / 年份 / 商标 / 真车前脸不进 diffusion。
- S6 是唯一变身；禁止机甲→车、禁止第二段人→机。
- 不引用任何外部生图生视频引擎名。

---

## 决策 B · W3 馆长三动作 + 六站地轨：应交未交，不豁免

### Decision

**不豁免。** L6 合入的是 W3 的骨架与静帧层（8 幕 sticky、`data-bind`、六向 SVG 晶体、收官 DOM），**不是**章程 W3 全量。hero-robot 程序化三动作与六站地轨属于 W3 应交未交，必须补齐。已合的 8 幕与静帧不推倒。补齐票建议记 AH-W3d，write root 仅 `src/components/city/halls/about/Curator.astro`、`curator.ts`、`StationRail.astro`（外加本包授权的 G-Hall 断言修订，由该票开发 worker 改 `scripts/about-hall-gate.mjs` 对应行，不得顺手改其它门）。

本条同时履行 ADR-2 预告：「W3 若要懒加载机甲，必须另开 ADR 放宽 G-Hall-5」。**只放宽记账范围，不废引擎否决。**

### Rationale

现树事实：`[slug].astro` 只挂 Hero / Stations / Crystal / Epilogue；全仓 `src/components/city/halls/about/` 无馆长、无地轨；无 `src/lab/world/**` 之外的 Hall 专用 three。展厅因此是「能读完的滚动档案」，还不是「城里那台机器人的老家」。P3 §2 与 STEP0 #34/#40 已 adopt 程序化三动作与整备坞地轨；批评者双席过的是静帧纸面，B 维分数不能覆盖未交付的馆长层。豁免会把 INDEX 的 MERGED 写成假完成。

Walk 是 GLB 已有剪辑，**不算**三动作之一。章程点名的三动作是：

| 代号 | 动作 | 最低可见位置 |
|---|---|---|
| Gaze | 注视：`Idle` + 头骨 Look-at（阻尼，小幅） | 馆长挂载后的默认态 |
| Present | 托举：上臂 / 脊柱程序化抬起（天平 / 推演） | 第 5 幕区间 |
| Salute | 致意：抚胸颔首后回待命 | 第 8 幕收官 |

程序化骨骼不够再 Blender 加剪辑（TECH-ARCH 已准），仍禁止新增大体积未压模型。

### Consequences · 验收口径（可直接写进任务书）

1. **地轨默认 SVG/CSS。** `StationRail.astro` 用 DOM/SVG 表达六站进度（与现有 `--hall-reveal` 同源），循环动画仍计入「全页 ≤5 处」。只有 SVG 无法表达**馆长本体**时才上 three；禁止为地轨单独开第二个 canvas。
2. **Hall-R 懒加载 three（仅 `/world/about-pavilion/`）。**
   - 静态 `import` 禁止：`src/lab/world/**`、`three/webgpu`、`three/tsl`、`WebGPURenderer`、任何 TSL 节点材质、rapier / `@dimforge`。
   - 禁止复用 `src/lab/world/city/HeroRobot.ts`（它绑 webgpu + TSL）。Hall 必须自写 `curator.ts`（WebGLRenderer + GLTFLoader + 现盘 `HeroRobot.glb`）。
   - 触发：S6 及之后的区间进入视口才 `import()`；**首屏 Hero 禁止挂 three**。
   - 同屏：禁止 hall `<video>` 的 play/seek 与 three `rAF` 同帧。挂载馆长前暂停并卸掉已滚出视口的视频。
3. **预算。**

   | 项 | 上限 | 门 |
   |---|---|---|
   | 初始 HTML 引用的额外 JS（ScrubVideo + island 桩） | 目标 20KB gzip，硬顶 50KB | G-Hall-6，**数字不改**（ADR-2） |
   | Hall-R 懒加载 JS（`three` WebGL + GLTFLoader + DRACOLoader） | ≤180KB gzip | 新增记账：不得出现在初始 HTML 的 `<script>` / `modulepreload` |
   | `HeroRobot.glb` | 复用现盘，不新拷一份未压模型 | 动态 fetch；初始 HTML 仍零 preload |
   | Draco 解码器 | 允许 JS 或 **Draco** wasm | G-Hall-3 继续否决 rapier / `@dimforge` / 物理 wasm；**禁止**再用任意 `.wasm` 一刀切（现脚本过严，补洞时收窄断言） |

4. **G-Hall 引擎符号（不放宽否决列表）。** 扫描对象仍是展厅 HTML + **初始静态引用**的 JS。继续 FAIL：`lab/world`、`lab/modules/world`、`initAllLabFacades`、`mountWorld`、`three/webgpu`、`WebGPURenderer`、`MeshStandardNodeMaterial`、rapier、`@dimforge`。允许 Hall-R **懒加载 chunk** 出现 `from 'three'` 与 `WebGLRenderer`。G-Hall-5：**初始 HTML** 仍不得 `<script>` / preload `public/models/**`（含 hero-robot / concept-garage / autodrive）；**动态 fetch** `HeroRobot.glb` 允许。概念车库与自动驾驶模型仍禁。
5. **reduced-motion / 无 WebGL / 无 JS。** `prefers-reduced-motion: reduce` 下：不启动 three `rAF`，不播骨骼动画；馆长位用 S6 last 静帧（已定选 `last-v3-2`）或 CSS 静姿；CSS `getAnimations()` 仍为 0。无 WebGL 与 reduced-motion 同。无 JS：首屏文字 + poster 可见，不要求馆长 canvas。`/about/` 继续零 3D。
6. **e2e 最低。** 桌面、非 reduced-motion：滚到 S6 之后出现馆长 canvas 或明确的静帧馆长位；Gaze / Present / Salute 三态可用 DOM `data-curator-pose`（或等价）断言，不要求像素级骨骼对比。reduced-motion 例：无 running CSS animation、无 three 循环。

### Rejected alternatives

| 选项 | 内容 | 否决理由 |
|---|---|---|
| (a′) 豁免馆长与地轨，W3 已合即完 | 把 SVG 晶体当「老家」 | 章程 W3 与「馆长」身份落空；INDEX MERGED 会变成假完成 |
| (b′) 在 Hall 静态 import `src/lab/world/city/HeroRobot.ts` | 省一份额外 loader | 直接把 webgpu/TSL/世界引擎符号打进展厅 chunk，G-Hall-2/4 必红 |
| (c′) 放宽 G-Hall-6 硬顶到塞进 three | 初始 50KB 改成 200KB | 首屏关键路径吞掉 three；与「懒加载」相反 |
| (d′) 地轨也用 three | 一条 canvas 包轨道+馆长 | 预算与同屏 GPU 翻倍；TECH-ARCH 已定 SVG/CSS 优先 |

### 已拍死不重开（本条）

- 展厅 HTML 不 import `src/lab/world/**`；不进 Lab manifest / facade。
- 馆内机甲不变形。
- 不为过门删 G-Hall-2..4 引擎针。
- 不把 W3 骨架推倒重做。

---

## 决策 C · W1 静帧降级、改派与体积门：程序缺口，实质追认

### Decision

**ZDR 拦 i2v 期间，静帧 poster 开页是合法降级，不是 W1 完成。** S0-H 改派 `/about/` 题图、S6-T 改腰上中景，追认。**首屏单文件 600KB→2.0MB 属于章程 §8「视频预算上调 = 重大」**；L2 指挥官改 TECH-ARCH/WBS 而未走 ADR 是程序缺口，**本包追认数字、不要求回滚已交付静帧，不要求补跑已经失败的 i2v。** 真视频仍要双帧审计 + 机器门，AH-W1b 不得标 MERGED。

体积数字本包一次锁死（G1 静帧 g15 已 1.70MB，600KB @ 720p / 6s / crf24 / g15 物理不可达；这是 canary 证伪原门，不是拿失败正式片去改判据）：

| 项 | 原章程 §1.5 | 本包锁定 |
|---|---|---|
| 首屏 16:9 mp4 | ≤600KB | **≤2.0MB**（720p 6s，crf24，`-g 15`） |
| 过渡 16:9 mp4 | ≤1MB | **规划顶 ≤3.5MB**（720p 10s，进视口才缓冲） |
| 移动 9:16 | ≤500KB/段 | **维持 500KB**（尚无 9:16 实证；超了另开 ADR） |
| poster webp | ≤60KB | 维持（现 `hero-s0-poster.webp` 41.7KB 合规） |
| 总载荷 | ≤2.5MB | **≤6.0MB**（unique 文件；非首屏必须懒加载） |

G-Hall-8 总载荷上限从 2.5MB 改为 6.0MB **仅由本 ADR 授权**。真 I2V 若仍超过 2.0 / 3.5，**再开 ADR**，禁止 worker 或 TECH-ARCH 再静默改门。

### Rationale

G1 canary 两次同文：`Video generation tools are unavailable under zero data retention (ZDR)`。无 mp4 可压制。Hero 已按媒体清单「无 `src16x9` 不写 `<source>`」退化到 poster，机器门在「无视频则 fps=0 / durationS=0」下可绿——这证明降级路径工程上成立，**不**证明 W1 视频车道交付。章程 W1 Live 验收仍是两段 mp4 + 人门 A≥7。

S0-H：指挥官人门 6.5，「炫技不够哇」、手绘 i2v 易沸腾；改派纸面题图与方向 C（证据编辑部）一致，且省一条 i2v 叶。这不是 ADR-1 的 3 连 REJECT 换路线，是视觉门把关（磊哥令：指挥官盯审美）。人拣权仍在磊哥：若要把 H 抬回首屏，补 last + i2v，不重开三方赛马。

S6-T：v2 全身 = chibi（叶第 1 连 REJECT），改中景不改场景、不改机库同机位，落在 ADR-1 护栏内。

体积：原 600KB+1MB+0.5MB≈2.5MB 是一套自洽的过时编码模型。只改首屏 2.0 而保留总载荷 2.5，两段真视频无法同时合法进仓。过渡 3.5 与总载荷 6.0 必须与 2.0 **同包**追认，并强制非首屏懒加载。

### Consequences

1. **降级合法边界。** 允许：poster 开页、S1–S5 静帧、S6 占位文案。禁止：把 G1 的 still-hold 循环 mp4、或任何「静帧冒充 i2v」的片子写成 `hero-s0` 正式源。`about-hall-media.json` 无 `src16x9` 时 Hero 必须不写 `<source>`（已做，保持）。
2. **票状态。** AH-W1a / W1c 维持「静帧定选 PASS、i2v 待 ZDR」。AH-W1b 保持 PLANNED（或等价未完成），直到真 mp4 过门。
3. **ZDR 解除后的接入条件（全部满足才派生成 lane）：**
   - 指挥官 canary：`image_to_video` 对抽象图返回真实 mp4，而不是 ZDR 拒绝原文。
   - 输入帧必须是已独立审计 PASS 的 first：S0-T `first-v2-3`；S6-T `first-v3-3`。**禁止回改进 PASS 的 first/last 提示词。** last 只作审计基准（G1：工具无尾帧槽）。
   - 生成路与审计路分 lane；生成路自评无效。
   - 每段最多 3 次（无 seed 参数 = 三次独立调用）。抽帧看形变 / 主体漂移；3 连 REJECT 停该叶，按 ADR-1 降到亚军形态，不整族 KILL。
   - 压制：`fps=30 -an libx264 -preset slow -crf 24 -g 15 +faststart`；分辨率断言 1280×720，禁止上采样冒充 1080p。
   - 机器门：单文件体积、30fps、无音轨、时长 ∈ {6,10}±0.2s、sha 回读、总载荷 ≤6.0MB。人门 A 只打赢家成片，不打落选叶。
   - `SEND_ACCEPTED` 后禁重发。
4. **程序。** 此后任何体积数字变更 = 重大，必须新 ADR。TECH-ARCH 表与 gate 常量必须抄本包，不得再「草案先改」。

### Rejected alternatives

| 选项 | 内容 | 否决理由 |
|---|---|---|
| (a′) 判 W1 违规，撤回 poster、停展厅 | 没有视频就不许开页 | 把外部 ZDR 当成产品失败；骨架与纸面双胞胎会空转 |
| (b′) 把静帧循环 mp4 当 W1 完成 | 过体积/时长门 | G1 写明「这不是 I2V」；人门 A 的「活」没交付 |
| (c′) 维持 600KB，等真 I2V 再改 | 形式上没动重大项 | 连静帧代理都假红，门失去诊断意义 |
| (d′) 只追认 2.0MB、总载荷仍 2.5MB | 少改一个数 | 2.0+3.5 自相矛盾，W1b 一进仓就红 |
| (e′) 要求现在补走 i2v 程序 | 对着 ZDR 重试 | 确定性政策墙；ADR-1 已禁拿 3 连撞 ToS |

### 已拍死不重开（本条）

- i2v 本项目解禁；护栏仍是固定机位 + 单一主事件 + first/last 双帧独立审计。
- 不为过门再放宽 2.0 / 3.5 / 6.0。
- 不把工作台抬回首屏（ADR-1）。
- 不把 S0-H 改派写成 REJECT（它是改派，叶仍在盘）。

---

## 与 ADR-1 / ADR-2 的分工（防打架）

| 问题 | 以谁为准 |
|---|---|
| R/T/H 谁先跑、样张 ×3、叶级熔断、S0=桥、S6=唯一变身 | ADR-1 |
| `hallPath` / `deepLink` / 快照字段 / SRD 补行 / 展厅不进 LHCI / G-Hall 引擎针 | ADR-2 |
| 人形态→馆长的叙事；两个 URL 的职责 | **本包 A** |
| Hall-R 可否动态拉 GLB；G-Hall-5/6 怎么记账 | **本包 B**（修正 ADR-2「本包不预放宽」） |
| 无视频能否开页；体积数字 | **本包 C** |

冲突时：已锁叙事与引擎隔离以 ADR-1/2 为准；本包只补 W0 缺口和两处偏差，不改字段名、不改 query、不改 S0 场景。

---

## NEEDS_LEIGE

| 项 | 为什么必须磊哥 | 建议 |
|---|---|---|
| 原图 `formal.jpg` + `selfie.jpg` 落盘 | 肖像；R 路线唯一输入 | 同 ADR-1 |
| T / H / R 形象终选 | 人分；公开化身 | 并列 S0-T `first-v2-3`、S0-H 题图、R（若有） |
| `about-copy.ts` 六站 `[[占位：磊哥…]]` | 履历事实，董事会不编 | 各站一句真实工程类型或里程碑；没有就删该行，不填假项目 |
| PR #234 合入 `main` | 发布 | 馆长补齐与否不阻塞草稿存在；合入仍由磊哥点 |
| 账号 / 团队 ZDR | i2v 唯一外部墙 | `grok` → `/privacy`；若 `Admin Managed` 走 xAI 控制台或自备桶 |

其余（豁不免 W3 馆长、2.0/6.0 数字、S0-H 改派、S6 中景、Hall-R 懒加载口径）董事会已裁，不再问。
