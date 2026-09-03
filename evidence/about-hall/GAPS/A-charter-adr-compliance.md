# About Hall · Charter / ADR 查缺审计

- **席**：独立查缺（Grok 4.6，只读，零业务代码）
- **工作树**：`/Users/wanglei/studio-data-root/worktrees/website-about-hall`
- **取证时刻**：2026-09-03 17:05–17:10 CST
- **事实 HEAD**：`e3a5a82`（`style: AH-VIS-1 visual pass`）
- **审计过程中 HEAD 移动**：开审时 `1963f7b` → 中途 `909a209`（AH-W1h 视频进仓）→ `e3a5a82`（AH-VIS-1）。下文以**终态 HEAD**为准，并标注 `[uncommitted]` 仅余 `evidence/about-hall/GATE.json`（本席重跑覆盖，章程允许）与本报告。
- **远端** `origin/codex/about-hall-20260902` = `1963f7b`（落后本地 2 commit）
- **PR**：[#234](https://github.com/rayw-lab/website/pull/234) Draft / OPEN / MERGEABLE；CI 绿在 `1963f7b`，**不含** W1h / VIS-1
- **不看**：任何 worker RECEIPT / REVIEW 结论。批评者分只作「文件存在」不入账。
- **未做**：不起 4321、不跑全量 e2e、不 `pnpm build`（用已有 `dist/` @ 16:59，含 Transition + 两段 mp4）。`astro check` 本席未跑。

---

## 1. Checklist

判定：`PASS` / `GAP` / `DEVIATION` / `UNVERIFIABLE`。

### 1.1 章程 §1.5 机器门

| 来源#条目 | 口径 | 事实（命令 + 摘录） | 判定 |
|---|---|---|---|
| CHARTER §1.5 `pnpm build` / `astro check` | 通过 | 本席未跑。CI「门禁（check / build / links / budget / lighthouse）」在 `1963f7b` SUCCESS（`gh pr view 234`，2026-09-03T08:29Z）。本地 HEAD 已再走 `909a209`+`e3a5a82`。 | **UNVERIFIABLE**（现 HEAD）；CI 绿只覆盖到 `1963f7b` |
| CHARTER §1.5 G-Hall 展厅 HTML 无 world chunk / models / rapier | 内容判定，禁文件名假红 | 本席 `node scripts/about-hall-gate.mjs`：G-Hall-2..5 全 PASS。「扫描 4 个文件…零 lab/world / initAllLabFacades / mountWorld」；「零 rapier / @dimforge / .wasm」；「零 `<script>` / preload 指向 public/models/**」。初始 `<script>` 仅 Hero / Curator 桩 / Transition 三枚。`curator.Dov0583Q.js` `from './three.core…'` + `GLTFLoader`；`three/webgpu` 不在该 chunk。 | **PASS**（G-Hall-1..5，对现 dist） |
| CHARTER §1.5 视频 30fps / 无音轨 / 时长 {6,10}±0.2 / 单文件预算 / 总载荷 / poster ≤60KB | 以 ADR-3 追认数字为准：首屏 ≤2.0MB、过渡 ≤3.5MB、9:16 ≤500KB、poster ≤60KB、总载荷 ≤6.0MB | `ls public/media/about-hall/`：`hero-s0-720p.mp4` 1054456B（1.01MB）1280×720 30/1 dur=6.033 音轨 0；`transition-s6-720p.mp4` 2091449B（1.99MB）dur=10.033 音轨 0；`hero-s0-poster.webp` 37876B；无 `*-portrait.mp4`。GATE G-Hall-8 PASS「9 条…总载荷 3379813B ≤ 6.0MB」。sha 与 JSON 一致（`shasum -a 256`）。 | **PASS**（16:9 + poster + 总载荷）；**GAP**（9:16 不存在，见 W4） |
| CHARTER §1.5 每 `<section data-scene>` 有 `data-bind` 且 URL dist 200 | 含 hash id | GATE G-Hall-9 PASS「9 个 data-scene 均有 data-bind」。`/about/#timeline-title` 在 `about/index.astro` L119 有 `id="timeline-title"`。 | **PASS** |
| CHARTER §1.5 reduced-motion 无 CSS animation 运行；无 JS 首屏文字+poster | Playwright | `e2e/about-hall.spec.ts` 有 RM `running===0` 与 `javaScriptEnabled: false` 用例。本席未跑 e2e（禁起服务）。源：HallChrome / hall.css 有 `@media (prefers-reduced-motion: reduce) { animation: none }`；Hero/Transition 在 reduce 下藏 video。 | **UNVERIFIABLE**（本席未跑）；代码面存在断言 |
| CHARTER §1.5 `/about/` LHCI ≥95；展厅第一刀不进 collect | `lighthouserc.json` | `lighthouserc.json` L9 含 `/website/about/`，**无** `/world/about-pavilion/`。W4 仓内 `evidence/about-hall/W4/lh-about.json` categories：perf 1 / a11y **0.96** / bp 1 / seo 1。VIS-1 提交说明 LHCI 100×4；`evidence/about-hall/VIS-1/lh-about-after.json` median 100/100/100/100（证据文件在工作树，本席未重跑 LHCI）。 | **PASS**（在册 URL 未加展厅；W4 四项 ≥95）；现 HEAD 100×4 **UNVERIFIABLE** 本席未重跑 |
| CHARTER §1.5 `rg -i 'api_key\|access_token\|sk-\|ark-'` = 0 | 字面 0 命中 | `src/`+`scripts/`+`e2e/` 无真实密钥。全仓命中文档里的 `glm-5-3-flash@ark-plan`、研究稿引擎名、LHCI 规则 id `landmark-one-main`。gate 脚本**未实现**此条。 | **DEVIATION**（字面全仓 ≠ 0；源码无 token 值） |

### 1.2 章程 §1.5 人门已定设计选择

| 来源#条目 | 口径 | 事实 | 判定 |
|---|---|---|---|
| 暗底 + 单色霓虹；楼色米 `#fef3c7`；眼青 `#49c5b6` | 不再评 | `cyber-city-buildings.json` about `neonColor: "#fef3c7"`；`curator.ts` `EYE = 0x49c5b6` `CREAM = 0xfef3c7`；HallChrome 圆点 `building.neonColor`。本席未做像素批评。 | **PASS**（token 单源）；人门像素 **UNVERIFIABLE** |
| 机器人是馆长不变形；馆内不变形 | 已拍死 | 展厅自写 `curator.ts` WebGL + 现盘 `HeroRobot.glb` Idle；无第二段变身视频。S6 是唯一过渡片。 | **PASS**（代码/资产结构） |
| 文字全部 DOM 不进 diffusion；六站无年份 | 渲染树 | `rg '\[\[占位' src/` 无命中。`about-copy.ts` 六站用 `01–06`，无 `20xx`。`HALL_SUBTITLE`「十余年」不是年份数字。 | **PASS** |
| 不做加载进度条、鼠标跟随大球、打字机 Hero、技能条、奖杯墙 | 展厅页 | halls 内无 typewriter / trophy / skill-bar。Present 用固定相对机器人的小 orb，不跟指针。城市壳 `index.astro` 仍有 world 挂载进度条（城市引擎，非展厅）。 | **PASS**（展厅）；城市壳进度条不在本禁区范围 |

### 1.3 章程 §3 Git 纪律

| 来源#条目 | 口径 | 事实 | 判定 |
|---|---|---|---|
| worktree `codex/about-hall-20260902` 从 main 切出；共享 checkout no-touch | 独立树 | `git rev-parse --abbrev-ref HEAD` = `codex/about-hall-20260902`；cwd 即该 worktree。 | **PASS** |
| 合流：status clean → fetch → merge main → build/check/gate → push；`ls-remote` == HEAD | 每 SYNC | `git status`：`M GATE.json` + `?? GAPS/`（本席）。本地 HEAD `e3a5a82` ≠ `git ls-remote` `1963f7b`。`origin/main` `26f1e5d` 比 merge-base `3c68b2b` 超前 6 枚（全是 docs/loop，PR 仍 MERGEABLE）。 | **GAP**（远端回读失败；main 未再 merge） |
| 不许 force / amend 已推 / stash 共享树 / 媒体原盘入库 | 禁 | `git stash list` 空。public 仅压后 mp4/webp。原盘在 `studio-data-root/about-hall/gen/`。远端 tip 是本地祖先，未见 force。提交身份 `about-hall-loop <loop@local>`（环境变量，未改 config）。 | **PASS**（本树可见事实） |
| `origin/main` / tag 不直推 | PR 合入 | #234 Draft，未 merge。 | **PASS** |

### 1.4 章程 §6 六波最小 Live / 风险禁区

| 来源#条目 | 口径 | 事实 | 判定 |
|---|---|---|---|
| W0 digest 三栏 + ADR-1..3 | 不派实现 | `STEP0-DIGEST.md` 在仓；`adr/ADR-1..4` 均 `status: locked`。 | **PASS** |
| W1 两段 mp4 过机器门；人门 A ≥7；零字；3 连熔断 | Live = 片 + A | 机器门见上 = 绿。抽帧 MAD：S0 first-last **4.67**（LOCKED v4 零转头 + 光缆微动，符合 v4 硬门「光缆 Δ>1」量级）；S6 first-last **24.68**（非 still-hold）。INDEX 仍写 W1b DISPATCHED、人门 A 未对成片双席入账。W6 批评者看的是静帧。 | 机器 **PASS**；人门 A 成片 **UNVERIFIABLE** / INDEX **GAP** |
| W1 禁区：拒脸→卡通先行；原盘不入库 | | R ARCHIVED；T 转正进仓。`formal.jpg` 在 `about-hall/ref/`（0600，118014B），`selfie.jpg` **无**。 | 生产顺序 **PASS**；selfie **GAP**（R 已终止，不阻塞） |
| W2 隔离栈打开 scrub；机器门全绿；不进 Lab manifest；不 import `src/lab/world/**`；不加 LHCI | | `[slug].astro` 注释禁止 import lab/world；Lab manifest 无 about。G-Hall 绿。e2e 有 Hero/S6 scrub 用例，本席未跑。 | 隔离/G-Hall **PASS**；scrub Live **UNVERIFIABLE** |
| W3 人门 B ≥7；C 100% 绑定；禁 infinite >5；禁编年份 | | 9 个 data-scene 均有 bind。infinite 在展厅仅 `hall-chrome-pulse` + `hall-scroll-nudge` = 2。年份见上。B 维双评在 W6 静帧，馆长/真视频后未重评。 | C/infinite/年份 **PASS**；B 维现树 **UNVERIFIABLE** |
| W3 馆长三动作 + 地轨 | 章程 W3 全量；ADR-3 不豁免 | `Curator.astro` + `curator.ts` + `StationRail.astro` 在树。触发：`scene !== 's0'` 即 `start()`（S1 起），**不是**「S6 及之后才 import」。`LIFT_SCENES = s2..s6`（托举横跨 5 幕，不是「第 5 幕」）。Salute 在 `s8`。无 `data-curator-pose`（只有 `data-curator-lift` / `data-curator-scene`）。e2e **零** pose 断言。S6 滚动 scrub 与 curator `rAF` 无互斥。 | **DEVIATION**（触发点/托举范围/同屏 GPU/e2e） |
| W4 `/about/` 触感 + 四态；LHCI 不降；正文零 3D 零滚动劫持；9:16 | | `/about/` 无 three。W4 LHCI 100/96/100/100。W1h commit 明示「portrait variants dropped (mobile = poster only)」。 | 触感/零 3D/LHCI **PASS**；9:16 **GAP** |
| W5 快照 + hallPath；e2e 城里 E → 到达条；不碰 StreetProps | | `arrival-snapshot.ts` 字段集与 ADR-2 一致（sessionStorage，可选键省略）。`Areas.ts` 先 `snapshotArrival` 再 `assign(hallPath + ?from=city&poi=)`。about-hall 用注入 storage 测到达条；T1b 测 hold overlay 但 `route.abort` 不真跳展厅。 | 接线 **PASS**；「城里 E 真进厅见驾驶卡」端到端 **UNVERIFIABLE** |
| W6 86+n 绿；人门三维 ≥7；不为过门改判据 | | 最后一次全量 93/93 在 `c463c36`（**早于** W3d / T1a / T1b / QE / W1h / VIS-1）。PR Draft。INDEX 标 HOST_READBACK_PASS。章程：只有 `LIVE_OBSERVED` 作验收。 | **GAP**（全量过期；未 LIVE；登记把 HOST_READBACK 当收口） |

### 1.5 章程 §8 已拍死 / §10 收稿硬门 / §12 硬禁区 / §13 停止交接

| 来源#条目 | 口径 | 事实 | 判定 |
|---|---|---|---|
| §8 C+B+A；馆长不变形；文字不进 diffusion；不用外部引擎；i2v 解禁 | 不重开 | 站点双胞胎存在。研究稿仍含即梦/可灵名（调研包，STEP0 标 drop）。产品 `src/` 无外部引擎名。 | **PASS**（产品面）；调研包保留原文属预期 |
| §8 NEEDS_LEIGE：照片；人分；公开发布；PR 合入；`/privacy` | | 照片 formal 已落盘；人拣 T 在 INDEX 有记录（本席不采信「已解决」措辞，只核文件：R 未进 `public/media`）。#234 未合。 | 发布权 **PASS**（未偷合）；INDEX 照片行已划掉 **与 ref 事实一致** |
| §10 生成物 sha+ffprobe；glm 落盘后 check+门；越 write root 禁；批评者分不改判；secret rg | | 媒体 JSON sha 与磁盘一致。`evidence/about-hall/W1/` **无** SHA256SUMS（WBS §5 清单）。GIANTS 登记路径 `evidence/about-hall/GIANTS-L1-i2v.md` **不在仓**；实文件在 `studio-data-root/about-hall/gen/G1-canary/GIANTS-L1-i2v.md`（198 行）。 | 对账 **PASS**；W1 回执目录 / GIANTS 入库 **GAP** |
| §12 共享 checkout / workflow / 无索引派单 / 一单多写根 / worker commit / 为过门改判据 / 静态绿写 live / 手写人分 / 日志含 token / 原盘入库 / diffusion 文字 / 编年份 / 编经历 | | INDEX 多票 `MERGED` 但无 LIVE。W1h 改 LOCKED motion 为零转头（v4，磊哥选 A 写在纸上）而非第 3 连后换形态。体积数字已由 ADR-3 追认，gate `MEDIA_CAP_BYTES = 6 * MB`。AH-QE / AH-VIS-1 / AH-W1h 未进 INDEX 票册却已 commit。 | **DEVIATION**（INDEX 用 MERGED/HOST_READBACK 冒充验收；无索引票已施工） |
| §13 索引终态、LOOP-LOG 总结、合流+push+远端回读、交接三块副本到 `raw/03-Output/规划/handoffs/` | | `ABOUT-HALL-HANDOFF-2026-09-03.md` 在仓，自称同文副本 `raw/03-Output/规划/handoffs/…`：**该路径不存在**。HANDOFF 正文仍写「未 push、未开 PR」「ZDR 拦视频」——与现树相反。LOOP-LOG 停在 L10 14:20。`raw/skills-distilled/about-hall/` 不在 worktree。 | **GAP** |

### 1.6 ADR-1 Decision / Consequences / 不可逆 / NEEDS_LEIGE

| 来源#条目 | 口径 | 事实 | 判定 |
|---|---|---|---|
| ADR-1 生产 (a) T/H 赛马，R 等照片；人拣前不进 public 正式名 | | 现 `about-hall-media.json` 正式件为 T 海报/视频 + S0-H **题图** `about-illustration-s0h`（ADR-3 追认改派）。R 不在 public。人拣后 T 进仓合法。 | **PASS**（终态）；历史是否人拣前就进仓 **UNVERIFIABLE** |
| 样张 ×3；禁止三路各出 6s 再赛；9:16 只给赢家 | | 仓内只有赢家 16:9 两段，无三路视频。无 9:16。 | 赛马视频禁令 **PASS**；赢家 9:16 **GAP** |
| 叶级 3 连；不改已 PASS first/last 提示词 | | S0-T-LOCKED-**v4** 只改 motion（零头动），first/last 声明继承 v3。两次头转 REJECT 后第 3 次改 motion 而非换形态。 | **DEVIATION**（熔断「换形态」未执行；改 motion 留 T） |
| S0=桥；S6 唯一变身、同机位机库；禁第二段人→机 | | Hero 仍是桥海报/片。S6 单独 `Transition.astro`。Stations 过滤 `scene !== 's6'`。 | **PASS** |
| 人门 A 只打赢家 6s | | 无成片双席分入 INDEX。 | **GAP** |
| NEEDS_LEIGE 原图 formal+selfie；终选 | | `ref/formal.jpg` 有；selfie 无。T 已转正。 | selfie **GAP**（非合入阻塞，R 已 archive） |

### 1.7 ADR-2 Decision / Consequences

| 来源#条目 | 口径 | 事实 | 判定 |
|---|---|---|---|
| hallPath 加法；deepLink `/about/` 不动；schemaVersion 0.1.0 | | about `hallPath: "/world/about-pavilion/"` `deepLink: "/about/"` `schemaVersion: "0.1.0"`。`CityMap.ts` 有可选字段。 | **PASS** |
| 城里 E 走 hallPath+query；DOM 快览/头脚/CTA/noscript 用 deepLink | | `Areas.ts` `dest = hallPath ?? deepLink`。`index.astro` 楼宇快览 `href: base+deepLink`；`SiteHeader` About → `/about/`。纸面页另有「想看 3D 版」链到 hall（双胞胎出口，不是把快览改成 hallPath）。 | **PASS** |
| query 只 `from`/`poi`；from 只认 city；非法 poi 无到达条 | | HallChrome 脚本：`from !== 'city'` 或 poi 不在 allow 或 ≠ hallPoi → return。e2e 覆盖合法/非法/无 query。 | **PASS**（代码+用例存在） |
| 快照键 `world-arrival-v1`；必填集；禁 localStorage；禁 null 键；禁 neonColor 进卡 | | `arrival-snapshot.ts` 实现与表一致；`putOptional` 缺则省略。HallChrome 读 sessionStorage，探索数另读 `world-explore-v1`。 | **PASS** |
| SRD 只加一行+一句注，不改「不再建立」 | | `docs/spec/SRD.md` L1032 仍「不再建立」；L1033 `/world/{slug}/` 补行；L1035 表下那句注。 | **PASS** |
| 展厅不进 LHCI collect | | 见 §1.1。 | **PASS** |
| G-Hall-1..10 | 见 ADR-2 表；G-Hall-6 目标 20 / 硬顶 50；G-Hall-8 总载荷 ADR-3 改为 6.0 | 本席门 1–9 绿；G-Hall-6 gzip **1725B**。G-Hall-10 由 e2e 承担，未跑。G-Hall-3 仍用任意 `.wasm` 扫初始 corpus（ADR-3 要求收窄，因 Draco 不在初始 HTML 所以仍绿）。 | 1–9 **PASS**；10 **UNVERIFIABLE**；断言收窄 **GAP** |
| W2 不改 Areas.ts；W5 才接线 | 历史 | `Areas.ts` 现有接线（W5 已合）。符合波次。 | **PASS** |
| 不重开：不进 Lab；不 import lab/world；不自定义 VT；deepLink 不被改成展厅 | | `global.css` 仍 `@view-transition { navigation: auto; }`（沿用 auto，未 named）。PoiArrival overlay 注释禁止 named VT。 | **PASS** |

### 1.8 ADR-3 Decision A/B/C / Consequences

| 来源#条目 | 口径 | 事实 | 判定 |
|---|---|---|---|
| A 路线 C：首屏人形态；机甲只在 S6 之后；`/about/` 零 3D | | Hero 为人形态片/poster。馆长 **S1 起挂 three**（`leftHero = scene !== 's0'`），与「机甲只在 S6 之后作为馆长出现」冲突。 | **DEVIATION** |
| A `/about/` 不抢 LHCI；S0-H 只做题图 | | 手绘在 `/about/` `<img loading=lazy>`。 | **PASS** |
| B 地轨 SVG/CSS；禁止地轨第二 canvas | | `StationRail.astro` 纯 DOM/SVG；three 只在 curator。 | **PASS** |
| B 静态禁 lab/world、webgpu、rapier；Hall 自写 curator；S6 后才 import；首屏禁 three | | 静态 import 合规。动态 import 在离开 S0 后即发生。 | 静态 **PASS**；触发 **DEVIATION** |
| B 同屏禁止 video seek 与 three rAF | | S6 `createScrollScrub` 与 curator `requestAnimationFrame` 无暂停/卸载协议。 | **DEVIATION** |
| B Hall-R 懒加载 JS ≤180KB gzip；不进初始 HTML；GLB 动态 fetch；允许 Draco wasm | | 初始 HTML 无 three/GLB preload。Hall-R：curator 84.3KB + three.core 64.5KB + GLTFLoader 15.2KB = **164KB gzip ≤180**。Vite 注入 `draco_decoder.C32yEggz.wasm`（gzip 88KB），属允许的解码器。源码未 `setDecoderPath`，由打包器写入 `decoderPaths`。 | JS 预算 **PASS**；运行时 GLB 能否解码 **UNVERIFIABLE**（未开页） |
| B reduced-motion 不启动 rAF；getAnimations 0；无 JS 不要求 canvas | | `CURATOR_MQ` 含 `no-preference`；reduce 下 `stop()`。e2e 未跑。 | 代码 **PASS**；运行 **UNVERIFIABLE** |
| B e2e：S6 后出现 canvas 或静帧馆长位；三态 `data-curator-pose` | | 无 canvas/pose 用例。 | **GAP** |
| C 静帧降级合法；禁 still-hold 冒充 hero-s0；无 src16x9 不写 source | | 现有真 mp4（S6 MAD 24；S0 非逐帧复制）。Hero 按清单写 `<source>`。 | **PASS**（非假片） |
| C AH-W1b 不得标 MERGED 直到真 mp4 过门 | | INDEX 仍 DISPATCHED，未假标 MERGED。片已进 HEAD `909a209`。 | 状态机滞后 **GAP**（应升 HOST_READBACK / 人门后 LIVE） |
| C 体积此后改数字必须新 ADR；TECH-ARCH 必须抄本包 | | gate 常量 6MB 已抄。TECH-ARCH §4 仍写总载荷 **≤2.5MB** 且「零 `_astro/world.` 文件名」；§6 写「≤6MB（**草案**）」。WBS §5 9:16 **≤1.5MB** 与 ADR-3 500KB 冲突。 | **DEVIATION**（文档未锁死抄本） |
| C 压制 720p 禁止上采样冒充 1080p | | 两段 1280×720。 | **PASS** |
| NEEDS_LEIGE 占位履历；PR；ZDR | | `about-copy.ts` 已删 gap 渲染（`5e3c4b6`）。INDEX 仍建议「删行**或通用句**」——通用句已被 ADR-4 禁止。 | 渲染树 **PASS**；INDEX 建议 **DEVIATION** |

### 1.9 ADR-4 Decision A/B/C / Consequences / 不可逆

| 来源#条目 | 口径 | 事实 | 判定 |
|---|---|---|---|
| A (d) 北槽换位；id/category/districts 不换；parkingBay 按足迹重算 | | about `(-44,-150)` bay `(-20,-150) r=6 h=270`；now-signal `(-44,150)` bay `(-26,150)`。civic / 西南区 id 未换。 | **PASS** |
| A FACADE_PLAN firstFrame 随北槽：about 有 south+roof；now-signal 只 east | | `CityBlocks.ts` L26–31 相符；头注写 about 8/8。 | **PASS** |
| A quest.chain 首站 about-pavilion；否决新地面光带 / 换 nexus / 改 spawn / #234 重拍城市 poster | | `world-pois.json` chain `[about-pavilion, concept-garage, …]`。`git diff origin/main...HEAD` 无城市 LCP poster 图文件（只有 hall poster）。 | **PASS** |
| A e2e：explore 跟 JSON；加 visibility about inFrustum≥1 front=8/8 | | 本席 `node tools/camera/audit-x2-visibility.mjs`：about **8/8 inFrustum、8/8 front** ndc.x `[-0.05,0.39]`；now-signal **0/8**。`e2e/` **无** inFrustum 断言。 | 几何 **PASS**；e2e 条目 **GAP** |
| A 回城 `/?poi=about-pavilion` 落点随 bay | | Epilogue / HallChrome `/?poi=about-pavilion`。 | **PASS** |
| A 不要改 districts/spawn/ritual_idle/FlightTrails 航线（先复跑） | | ritual_idle 仍在；FlightTrails L111 注释仍写「穿行于 **now-signal**/autodrive-lab 楼隙」。本席未复跑航线净距。 | 冻项 **PASS**；航线复跑 **UNVERIFIABLE**；注释 **GAP** |
| A facade-kit README 入帧楼随 FACADE_PLAN 改一句 | | `public/models/facade-kit/README.md` L27 仍「**now-signal**（4/8）…三栋进 ritual_idle」。 | **GAP** |
| B 方案 1：0.8+0.4 不改数字；hold 起帧一次性 overlay 400ms；色 = neon JSON；禁 infinite / 扫描线 / named VT / 音频 | | `PoiArrival.ts` `HOLD_OVERLAY_MS` 400；`neonColor` 进 CSS 变量；keyframes 一次 `forwards`。e2e `AH-T1b hold overlay` 存在。 | **PASS**（代码+用例存在；本席未跑） |
| B 必须有 `poi_showcase-about-pavilion` | | `camera-shots.json` 有该键；`status: "proposal"`（其它多为 `current-snapshot`）。PoiArrival 按 id 查找，不滤 status。 | 条目 **PASS**；status 字段 **DEVIATION**（功能上仍会被用） |
| B 到达条文案模板 maxKmh → coneHits → 保底探索 n/N | | HallChrome L86–96 符合；e2e 驾驶卡短句覆盖 96 km/h 与空快照。 | **PASS** |
| B 展厅首屏左 40% DOM + 右桥；无 src 则 poster | | Hero 结构仍在；现有 src。 | **PASS** |
| B 三态 RM 跳过 overlay；无 JS 快览仍 deepLink | | overlay `reducedMotion` 不挂；e2e RM 腿存在。 | 代码 **PASS** |
| C 合入前序：占位清零 → T1a → T1b → i2v 能赶就进 → **干净端口全量 e2e** → merge | | 占位已删；T1a/T1b/W1h 已在本地 HEAD。全量 e2e 最后绿：`c463c36`。#234 未 merge。 | 1–4 **PASS**；**5 GAP（P0）**；6 NEEDS_LEIGE |
| C `rg '\[\[占位' src/` = 0 | | 本席 rg：src 无；仅 adr/INDEX/handoff/研究稿。 | **PASS** |
| C 全量分母以当时 `--list` 为准 | | INDEX/SCORE_LINE 仍写 86 或 93。`rg '^\s*test\(' e2e` ≈ 100 行（含新 QE/T1b/W1h）。 | **GAP**（登记分母过期） |
| 不可逆：id 不改；spawn/ritual 冻；poster A10 债接受 | | 未改 id/spawn。A10 未进 #234。 | **PASS** |

### 1.10 WBS-01 / TECH-ARCH 依赖表与预算

| 来源#条目 | 口径 | 事实 | 判定 |
|---|---|---|---|
| WBS 依赖 Grok / 不出现外部引擎名 | | 产品代码无。 | **PASS** |
| WBS §1 仍写「董事会 ADR-2 待拍」化身 | 过时 | 化身是 ADR-1；文件头 `status: draft-for-leige`。 | **DEVIATION**（文档） |
| WBS §5 交付 `*-portrait.mp4` ≤1.5MB；`evidence/about-hall/W1/SHA256SUMS` | | 无 portrait；无该 SHA 文件。W1h 主动 drop。 | **GAP** |
| TECH-ARCH §4 门描述 2.5MB + `_astro/world.` 文件名 | 应抄 ADR-2/3 | L47 仍旧口径；与脚本事实相反。 | **DEVIATION** |
| TECH-ARCH §5.2 装了就登记：three addons、Draco、imageio-ffmpeg venv、Pillow | | venv 实装：Pillow 12.3.0、numpy 2.5.2、imageio-ffmpeg 0.6.0（ffmpeg-macos 7.1）。本机 cwebp 1.6.0、tesseract 5.5.3、brew ffmpeg 9.0.1。`three/addons` → `examples/jsm`（package exports），DRACOLoader 在 `node_modules/three/examples/jsm/loaders/`。**TECH-ARCH 表无 imageio-ffmpeg、无 three/addons、无 Draco wasm 行**。 | **GAP**（装了未登记） |
| TECH-ARCH §6 vs gate | 2.0 / 3.5 / 0.5 / 60KB / 6.0 | §6 数字与 ADR-3 一致但标「草案」「真 I2V 收口后再锁」。gate 已锁 6MB。Hall-S 硬顶 50KB 与 ADR-2 一致；表写「Hall-0=0；Hall-S ≤50KB」未写 20KB 目标。 | 数字大体 **PASS**；「草案」措辞 **DEVIATION** |
| TECH-ARCH 落点仍无 Curator/StationRail/Transition/arrival-snapshot | L100–107 | 文件已存在，清单未更新。 | **GAP** |

---

## 2. GAP register

### P0 阻塞合入（ADR-4 决策 C / Git 远端）

| ID | 建议票名 | write root | 验收一句 |
|---|---|---|---|
| P0-1 | **AH-W6-full-e2e-clean** | `evidence/about-hall/W6/`（新 attempt 日志 + `e2e-summary.json` 严守 schema） | 在 **e3a5a82（或含其后提交）** 上、干净隔离端口、workers=1 retries=0，`--list` 分母全绿 0F/0S/0 flaky；历史截图若被改写须还原后再记。 |
| P0-2 | **AH-SYNC-push-readback** | 指挥官 Git（无业务代码） | `git ls-remote --heads origin codex/about-hall-20260902` == 本地 HEAD；PR #234 指向该 OID。现：远端 `1963f7b` / 本地 `e3a5a82`。 |

P0-1 未过不得执行 ADR-4 C.6 merge。P0-2 是合流纪律；不 push 则 CI 仍停在无视频的 `1963f7b`。

### P1 合入前应补

| ID | 建议票名 | write root | 验收一句 |
|---|---|---|---|
| P1-1 | **AH-W3d-curator-contract** | `src/components/city/halls/about/Curator.astro`、`curator.ts`、`e2e/about-hall.spec.ts` | S6 进入视口才 `import('./curator')`；首屏零 three；挂载前暂停并卸掉已出视口 video；`data-curator-pose=gaze\|present\|salute`（Present 仅第 5 幕、Salute 第 8 幕）；e2e 桌面非 RM 能断言三态；RM 无 rAF。 |
| P1-2 | **AH-W1b-human-A** | `evidence/about-hall/W1h/` 双席批评（只看成片+poster，不看代码） | 赢家 6s 两席 A≥7 且 \|Δ\|≤1；INDEX 把 W1b/W1h 从 DISPATCHED 改为与事实一致的状态。 |
| P1-3 | **AH-W4-portrait-or-ADR** | `public/media/about-hall/` + `about-hall-media.json` **或** 新 ADR | 要么赢家 9:16 ≤500KB 进仓并对账，要么董事会 ADR 明文豁免 W4 9:16（W1h 私自 drop 不够）。 |
| P1-4 | **AH-T1a-visibility-e2e** | `e2e/` 一条（或 gate 调 `audit-x2-visibility.mjs`） | CI 可复现 about `inFrustum≥1` 且 `front=8/8`（本席手跑已 8/8，但无自动化门）。 |
| P1-5 | **AH-INDEX-L11** | `docs/local-cmd/ABOUT-HALL-INDEX.md` + `ABOUT-HALL-LOOP-LOG.md` | 票册补 AH-D4/T1a/T1b/QE/W1f/W1g/W1h/M0/VIS-1；AH-D4 不得停在 DISPATCHED；min 维不得再写「全维未开工」；热点表释放已 MERGED 的 about/Areas；NEEDS_LEIGE 占位行删掉「或通用句」。 |
| P1-6 | **AH-ARCH-SYNC** | `ABOUT-HALL-TECH-ARCH.md`、`ABOUT-HALL-WBS-01-HERO-ASSETS.md` | §4/§6 抄 ADR-3 锁死数字（去掉「草案」）；删 `_astro/world.` 文件名口径；依赖表补 three/addons、DRACOLoader、imageio-ffmpeg venv、Pillow/numpy 已装版本；落点补 Curator/StationRail/Transition。 |
| P1-7 | **AH-G1-ingest** | `evidence/about-hall/GIANTS-L1-i2v.md` | 把 `studio-data-root/about-hall/gen/G1-canary/GIANTS-L1-i2v.md` 入库（或改 INDEX 路径指向 gen 并声明不入库）。 |
| P1-8 | **AH-T1a-facade-readme** | `public/models/facade-kit/README.md` | 入帧楼名单改为 about-pavilion（北槽）+ 撤 now-signal firstFrame，与 `CityBlocks.ts` 一句对齐。 |
| P1-9 | **AH-T1a-trails-clearance** | `evidence/about-hall/T1a/` 复跑记录；穿模才改 `FlightTrails.ts` | 北槽 about 36m 宽后航线净距有数字；无穿模则只改注释里的楼名。 |

### P2 W8 可延

| ID | 建议票名 | write root | 验收一句 |
|---|---|---|---|
| P2-1 | **AH-W8-gap-copy** | `src/data/about-copy.ts` | 磊哥给真句子再填 `gap`；没有就维持不渲染。INDEX 保持 NEEDS_LEIGE。 |
| P2-2 | **AH-W8-A10-poster** | 城市 LCP 图文件（**禁止塞进 #234**） | 换位后视觉批最后一刀；LHCI `/` `/home/` 不降。 |
| P2-3 | **AH-W8-LHCI-hall** | `lighthouserc.json` **另开 ADR** | 仍 DEFERRED；未新 ADR 不得加 `/world/about-pavilion/`。 |
| P2-4 | **AH-G-Hall-3-narrow** | `scripts/about-hall-gate.mjs` 仅 G-Hall-3 行 | 初始 corpus 否决 rapier/@dimforge/物理 wasm，不再 `/\.wasm\b/` 一刀切（Draco 仍不得进初始 HTML）。 |
| P2-5 | **AH-copy-score-line** | `src/data/about-copy.ts` L180 | 删除或改为现 `--list`；禁止渲染过期 `e2e 86/86`。 |
| P2-6 | **AH-handoff-raw** | `raw/03-Output/规划/handoffs/` | 按 §13 落同文副本，并改 HANDOFF 过时句（已 push/已 PR/已有 mp4）。 |
| P2-7 | **AH-shot-status** | `src/data/camera-shots.json` | `poi_showcase-about-pavilion` 的 `status` 与消费方合同对齐（现 `proposal`）。 |
| P2-8 | **AH-world-halls-scenes** | `src/data/world-halls.json` | `scenes: []` 补真实幕 id，或改 TECH-ARCH 契约不再要求该数组。 |
| P2-9 | **AH-secret-rg-scope** | gate 或 CI | 把章程 rg 收窄到 `src/scripts/e2e/public`，避免 `ark-plan` 文档假红。 |
| P2-10 | **AH-selfie** | `about-hall/ref/selfie.jpg` | 仅当重开 R；当前 R 已 archive。 |

---

## 3. 登记漂移

与工作树事实不符的登记（行号 = 取证时文件）：

| 文件 | 行 | 登记 | 事实 |
|---|---|---|---|
| `ABOUT-HALL-INDEX.md` | L1–7 | CURRENT AUTHORITY L10 14:20；min「全维未开工」；ZDR 解除后仍写 W1f「在跑」、S0 i2v#1 REJECT / S6 兜底 | HEAD 已有 W1h 真 mp4 + T1a/T1b/QE/VIS-1；min 维不可能仍是 — |
| 同上 | L20 | AH-D4 **DISPATCHED** | `adr/ADR-4-*.md` 已 locked 且 T1a/T1b 已 commit |
| 同上 | L21 | AH-G1 路径 `evidence/about-hall/GIANTS-L1-i2v.md` RECEIVED | 仓内无此文件；在 `studio-data-root/about-hall/gen/G1-canary/` |
| 同上 | L23–24 | W1b DISPATCHED；W1c「slim 待 i2v#2」 | `909a209` 已进仓 hero+transition；JSON 有 `src16x9` |
| 同上 | L32–35 | W3d / W7a / W6 HOST_READBACK_PASS 当收口；W4 MERGED 含 9:16 | 无 LIVE_OBSERVED；无 9:16；全量 e2e 停在 `c463c36` |
| 同上 | L42–43 | 热点：about 仍 AH-W4；Areas 仍 AH-W5 | 两票已 MERGED，VIS-1 又改进 about |
| 同上 | L53 | 占位「删行或**通用句**」 | ADR-4 C 禁止通用句；渲染树已删行 |
| `ABOUT-HALL-LOOP-LOG.md` | L5–11、L75–81 | 看板只到 L10；无 T1a/T1b/QE/W1h/VIS-1 | 这些 commit 已在 `git log c463c36..HEAD` |
| `ABOUT-HALL-HANDOFF-2026-09-03.md` | L7、L11–17、L21 | 「未 push、未开 PR」；W1 视频被 ZDR 拦；W6 还在 attempt4 | #234 已开；远端已有至 `1963f7b`；本地已有 mp4；attempt7 93/93 已发生 |
| 同上 | L3 | 同文副本 raw/handoffs/… | 路径不存在 |
| `ABOUT-HALL-TECH-ARCH.md` | L47 | 总载荷 ≤2.5MB；零 `_astro/world.` 文件名 | gate 6.0MB；ADR-2 禁止文件名假红；Hall island 文件名可含 world |
| 同上 | L85–90 | 「草案」「收口后再锁」 | ADR-3 已锁 2.0/3.5/6.0 |
| 同上 | L69–78 | 需安装表无 imageio-ffmpeg / three addons / Draco | venv 与 dist 均已用 |
| `ABOUT-HALL-WBS-01-HERO-ASSETS.md` | L15 | 「ADR-2 待拍」化身 | ADR-1 已锁 |
| 同上 | L118、L128 | 体积「修订草案」；portrait ≤1.5MB | ADR-3 500KB；W1h 已 drop |
| `about-copy.ts` | L180 | `SCORE_LINE` … `e2e 86/86` | 未引用，但是过期事实；attempt7 已 93，现 test( 约 100 |
| `CityBlocks.ts` vs `facade-kit/README.md` | README L27–29 | now-signal 入帧 4/8 | 代码 about 才是 firstFrame；审计 about 8/8、now-signal 0/8 |
| `FlightTrails.ts` | L111 | 避楼核对写 now-signal 北隙 | about 已占北槽且更宽 |
| `camera-shots.json` | L92–96 | showcase `status: proposal` | 方案 1 合入后缺条目应失败；status 仍像草案 |
| PR #234 title / CI | — | 「W0–W6」；CI SHA `1963f7b` | 本地已 W7 布局/转场 + W1h 视频 + VIS-1；CI 未吃到 |

---

## 4. Verdict

**MERGE-BLOCKED（P0）——不能把 G-Hall 9/9 绿当成合入许可。** 现树已经把 ADR-4 的换位/转场和 ADR-3 的真 mp4 做到本地 HEAD `e3a5a82`，机器门 1–9 本席重跑为绿、about 北槽 8/8 入帧、占位括号已从 `src/` 消失；但 ADR-4 决策 C 第 5 条要求的干净端口全量 e2e 仍停在 `c463c36`（其后至少 8 枚产品 commit），INDEX/LOOP-LOG 停在 L10 14:20，远端比本地少 W1h+VIS-1。馆长层对照 ADR-3 是**做偏**（S1 即挂 three、托举跨 s2–s6、无 `data-curator-pose`、S6 与 rAF 同屏），不是「没做」。9:16 被 W1h 直接丢掉，没有新 ADR。

在 P0-1 全量 e2e 与 P0-2 远端回读完成前，#234 保持 Draft 是正确的；点 merge 会把过期 93/93 和未推送的视觉/视频变更加进 `origin/main`。
