---
title: AH-VIS-1 视觉统装 · 收稿回执
ticket: AH-VIS-1
date: 2026-09-03
worker: Cursor 前端视觉 worker（Opus 5）
scope: 只打磨，不改逻辑、不改数据契约
---

# AH-VIS-1 视觉统装 · RECEIPT

写根 `/Users/wanglei/studio-data-root/worktrees/website-about-hall`（未碰 `/Users/wanglei/mywebsite`，未 commit/push，未占 4321）。
取证目录 `evidence/about-hall/VIS-1/`，前后图一律同机位同视口。

## 0. 一页纸

| 债 | 结论 | 关键数值 |
|---|---|---|
| 1 顶部 HUD 叠压 | **已修** | 叠压 overlapY `+40.2px` → `−454.9px`（455px 净空） |
| 2 about 立面身份感 | **BLOCKED（未改一行）** | 被冻结 e2e 计数契约挡住，见 §2 |
| 3 进站标点牌被楼牌半遮 | **不是缺陷（撤销）** | 原图是擦除动画中途帧；about 无楼牌可遮 |
| 4 hold 脉冲观感 | **已修** | 单层 `80px/17.6px@.70` → 双层 `3.2px@.58 + 128px/38.4px@.88` |
| 5 展厅侧三件 | **已修** | 见 §5 |
| 6 `/about/` 问题卡 | **已修** | 卡 03 溢出 `1057→477px` 归零，摘要 1 行→2 行 |

门与验证（final build）：`astro check` 0 errors · `about-hall-gate.mjs` **FAIL 0 / WARN 0** ·
展厅与 `/about/` reduced-motion `getAnimations()` 均 **0** · `/about/` LHCI **100/100/100/100**（3 runs 全 100）·
`cyber-city-lookaround.spec.ts` 全绿 · `about-hall.spec.ts` 9 passed / 2 failed（2 条非本票，见 §7 归因）。

---

## 债 1 · 顶部 HUD 叠压

**现象**：驾驶提示条与任务胶囊同处顶部中轴，**文字压文字**。1024×640 实测两者盒重叠
`overlapY = 40.2px`、`overlapX = 279.2px`——任务胶囊整体落在提示条盒内。

- 提示条 `.hint`（`src/pages/index.astro`）：`top:0.7rem` / z-4 / 盒 `y 64→121.7`、`x 256→768`
- 任务胶囊 `.world-quest`（`QuestLine.ts`）：`top:1rem` / z-5 / 盒 `y 68.8→109`、`x 372.4→651.6`

**归因**：只在**非 ritual 腿**出现。ritual 腿挂载即把提示条置 `data-dismissed=true`
（`src/lab/world/index.ts` L191，键位卡交给 Reveal），所以正常开屏无此问题；
`?poi=` 深链腿（**含 ADR-4 决策 B 的回城 `/?poi=about-pavilion`**）不走那条路，
提示条常显到首次驾驶意图为止——即回城访客第一眼就撞上。

**改法**（只动 `.hint` 的布局/样式，未碰 `QuestLine.ts`）：顶部中轴让给任务胶囊（主信息），
驾驶提示（次信息）改走底部次要信息位。非 ritual 腿没有 `.world-ritual` 底部栈，底部中轴是空的；
左下速度表与右下「回到路口」用 `max-width` 让开。窄屏（≤767.98px）抬到 HUD 面板之上占近满宽。

```
top: 0.7rem                        → top: auto; bottom: 1.15rem
max-width: 92%                     → max-width: min(64rem, calc(100% - 17rem))
+ @media (max-width:767.98px){ bottom:6.2rem; max-width:calc(100% - 1.6rem); font-size:.78rem }
```

**数值**：`overlapY +40.2px → −454.9px`。提示条盒 `y 563.9→621.6`，胶囊 `y 68.8→109`，
水平落在速度表（终于 x≈112）与「回到路口」（起于 x≈912）之间。

前 `before-city-01-bay-hud.png` → 后 `after-city-01-bay-hud.png`

---

## 债 2 · about-pavilion 立面身份感 —— BLOCKED，未改一行

**现象坐实**（比 Gemini 初审更硬的取证）：`node tools/camera/audit-x2-visibility.mjs` 下
`about-pavilion` 在 `ritual_idle` 是 **inFrustum 8/8 / front 8/8**，`ndc.x[-0.05,0.39]`、
`ndc.y[0.16,0.87]` → 1440×900 屏幕 `x 684..1001 / y 58..378`。按此裁切开屏帧
（`before-city-00b-opening-about-crop.png`）：**确实只是一只带三色彩窗的黑方块**，
无楼名、无米色霓虹带，`#fef3c7` 只是三种窗色之一，读不出身份。ADR-4「第一眼」
几何上成立、语义上不成立。

**根因**：`BuildingSigns.ts` 只给 `lodProfile === 'hero'` 挂三层招牌
（`BuildingSigns.ts` L106 `.filter(lodProfile === 'hero')`），而 about 是 `standard`
（`cyber-city-buildings.json`）——**它根本没有任何招牌**。about 的窗格 emissive 与楼顶
霓虹檐口由 `CityBlocks.ts` 生成。

**为什么没动**：本票文件域内**无可行改法**，两头都堵：

1. 给 about 补招牌（唯一能出「楼名全息板」的机制）会**同时打红 4 条冻结判据**，
   而 `e2e/**` 是他票文件域且章程禁「为过门改判据」：
   - `e2e/cyber-city-signage.spec.ts:46` `HERO_COUNT = filter(lodProfile==='hero').length` = 5
   - 同文件 `:160` `counts.holo` 必须 `=== 5`（会变 6）
   - 同文件 `:161` `counts.panels` 必须 `=== 5`（会变 6）
   - `:55` 台账正则「hero 招牌叙事 v2：**5** 栋三层体系」（会变 6）
   - `:63` 点亮台账「**6** 通道 × 150ms 间隔」（会变 7）
2. 改 about 的窗色/檐口强度要动 `src/lab/world/city/CityBlocks.ts`，**不在本票文件域**。
3. `NeonFacade.ts` 是纯 re-export barrel（`NeonMaterials` 的转发），无可调参数面；
   材质实现在 `src/lab/world/rendering/NeonMaterials.ts`，同样不在文件域。

即：任务书设想的「在既有 BuildingSigns 机制内加一条米色霓虹带」在**不碰 e2e 的前提下不可达**。
本席按「不降门、不硬闯」处理，留给下一票（建议见 §8）。

---

## 债 3 · 进站标点牌被楼牌半遮 —— 不是缺陷，建议撤销该条

**复核**：把等待从 3s 拉到 12s 墙钟后重截，标点牌**完整可读**：
`[E] 个人档案馆 / About Pavilion · E 进站`，无任何遮挡（`before-city-01-bay-hud.png`）。

**真因**：`InteractivePoints.ts` 的标签是 `labelOffset` 驱动的 **0.6 游戏秒横向擦除**
（L270 `tween(labelOffset, 0, 0.6, 0.2)`）。SwiftShader 慢动作下 0.6 游戏秒 ≈ 十几秒墙钟，
`T1a/shot-poi-about.png` 与 `T1b/02-hold-overlay.png` 都截在**擦除中途**，
剩下的暗色板体被读成了「楼牌」。而 about 是 `standard`、**没有楼牌**（见 §2），
物理上不存在能遮它的招牌。

**结论**：层级/偏移/机位三项均无问题，`PoiArrival` / `InteractivePoints` **未改一行**。
副产物：后续取证脚本请对标点牌留 ≥12s 墙钟，否则会继续误报。

---

## 债 4 · hold 边缘脉冲观感

**现象**：`T1b/02-hold-overlay.png` 看不出脉冲。把 `::after` 钉在峰值定格后复核
（`before-city-06-hold-pulse-peak.png`）——即使 `opacity:1`，四缘仍近乎不可见：
单层 `inset 0 0 80px 17.6px @ alpha .70` 的窄带在亮城景里被冲掉，
且峰值只在 `38% × 400ms ≈ 152ms` 一帧，读作闪屏而非呼吸。

**改法**（只动 `PoiArrival.ts` 里注入的那段 CSS 字面；触发/卸载/类名/色源/时长零改动）：

| 项 | 前 | 后 |
|---|---|---|
| 边形态 | 单层 `inset 0 0 5rem 1.1rem @70%` | 双层：`inset 0 0 0 .2rem @58%`（硬边细管）+ `inset 0 0 8rem 2.4rem @88%`（宽羽化） |
| 计算值 | `0 0 80px 17.6px / .7` | `0 0 0 3.2px / .58` + `0 0 128px 38.4px / .88` |
| 关键帧 | `0%:.18 → 38%:1 → 100%:0` | `0%:.22 → 30%:1 → 58%:.9 → 100%:0` |
| easing | `ease-out` | `cubic-bezier(.22,.61,.36,1)` |
| 时长 | `.4s` | `.4s`（ADR-4 决策 B 锁定值，未动） |

硬边细管压住画面四缘轮廓，宽羽化承担「一次呼吸」的体量，58% 的衰减平台把单帧尖峰
拉成「吸—吐」。仍是一次性、无 infinite、不占 CITY-03 配额、无扫描线、无 named VT，
色源仍是 `--poi-hold-neon`（buildings JSON `neonColor` 单源）。
`e2e/cyber-city-poi-arrival.spec.ts` 只断言类名挂卸与 `--poi-hold-neon` 取值，本改动与其兼容。

前 `before-city-06-hold-pulse-peak.png` → 后 `after-city-06-hold-pulse-peak.png`
（同法定格；运行时帧见 `*-city-05-hold-pulse.png`）

---

## 债 5 · 展厅侧

### 5a 馆长 `Curator.astro`

**淡入节奏**：`transition: opacity 300ms ease` → 220×300 的机器人「啪」地出现。
改 `opacity+transform 420ms var(--ease-out)` + 静止态 `translateY(8px)` → `is-on` 归零，
读作「走进来」。位移与过渡整体关在 `prefers-reduced-motion: no-preference` 内，
reduced-motion 下仍零动画直出（复核 `getAnimations() = 0`）。

**标签**：`馆长` 原 13px + `letter-spacing .04em`（`.hall-kicker` 继承）。两个汉字加字距违中文 UI 地板，
改 `font-size .75rem` + `letter-spacing: 0`，标签退一档让机器人当主体。

**地面阴影（本条含一次判据修正）**：原件 `left/right 8%`、`height 28%`、`rgb(0 0 0/.5)`
的黑色大散射。实测本页幕布 `rgb(4,16,32)`（相对亮度 ≈0.006），**黑压黑只把像素压低 2–3 级
= 肉眼无影**，机器人是飘着的；继续「加浓」也救不回来。故改双层并收到双脚跨度：

```
left/right: 8%  → 26%          bottom: 6% → 9%          height: 28% → 15%
background: 单层 rgb(0 0 0/.5) extent 74%
         → 暗核 rgb(0 0 0/.55) extent 38%（幕布转亮时才承担接触压暗）
         + 反光 rgb(214 226 240/.13) extent 72%（胸灯落地反弹 = 暗底上唯一读得出的接地信号）
```
反光用**中性冷白**而非楼色：签名色只留给 hold 脉冲与到达条圆点那一处（ADR-4 决策 B）。

前 `before-hall-05-curator-crop.png` → 后 `after-hall-05-curator-crop.png`

### 5b 地轨 `StationRail.astro`

**现象**（实测计算值）：六站 `01–06` **全部** `13px / weight 400 / rgb(254,243,199)`，
站名全部 `13px / 400`，当前站只靠节点换色（`rgb(73,197,182)`）区分——序号与字号零层级，
「你在这」读不出来。

**改法**：序号退为安静索引，当前站三处同时抬升，无新循环动画。

| 元素 | 前 | 后 |
|---|---|---|
| 非当前序号 | `13px / 400 / #fef3c7` | `0.72rem / 400 / #fef3c7 52%` |
| 当前序号 | 同上（无区别） | `13px / 600 / #fef3c7` |
| 当前站名 | `400` | `600` |
| 当前节点 | 实心 accent | 实心 accent + `box-shadow 0 0 0 3px accent 20%`（静态光环，零时间项） |
| hover/focus 序号 | — | 回满 `#fef3c7` |

前 `before-hall-04-rail-crop.png` → 后 `after-hall-04-rail-crop.png`

### 5c 到达条 `HallChrome.astro`

**现象**：三段只靠 `gap` 分隔，`探索 2/12` 与 `最高巡航 96 km/h` **同 14px 同色 `rgb(154,173,194)`**，
读成一串没有层级的流水字（章程/ADR 的写法本来带 `·`）。

**改法**：`·` 分隔 + 三级层级。分隔点走 `::before`，驾驶卡 `hidden` 时随之消失、不留孤点。

| 段 | 前 | 后 |
|---|---|---|
| 楼名 | `--ink / 600 / 14px` | 不动（主信息） |
| 探索 n/N | `--ink-2` + `letter-spacing .02em` | `--ink-2`，去掉汉字字距（中文 UI 地板） |
| 驾驶卡 | `--ink-2`（与探索同级） | `--ink-3`（会话临时读数，退到末级） |
| 分隔点 | 无 | `·` `color-mix(--ink-3 70%)`（结构不是内容） |
| 容器 gap | `--space-3 / --space-4` | `--space-2 / --space-3`（分隔点接手节律） |

**圆点基线（实测后不动，如实登记）**：圆点中线 `103.0`，楼名字形中线 `102.3`，
偏差 **0.7px** —— 已对齐，无需修，未动 `.hall-chrome-dot`。其签名辉光实测
`color(srgb .996 .953 .780 / .7)` = `#fef3c7`（`--hall-neon` 由 `WorldHallLayout.astro` L29 下发），
ADR-4 决策 B 的「只准这一处 120%」完好。

前 `before-hall-02-chrome-crop.png` → 后 `after-hall-02-chrome-crop.png`

---

## 债 6 · `/about/` 问题卡折叠摘要

**现象**（实测，1024 视口）：`.about-qcard-teaser` 是 `white-space:nowrap` +
`text-overflow:ellipsis` 的单行夹取，且 `width:100%` 顶满卡宽 878px。

| 卡 | 摘要盒宽 | scrollWidth | 是否切断 | 摘要→提示行间距 |
|---|---|---|---|---|
| 01 | 878 | 878 | 否 | 24px |
| 02 | 878 | 878 | 否 | 12px |
| 03 | 878 | **1057** | **是（溢出 179px）** | 12px |

卡 03 被切在词中（断在「个人…」），贴到卡右内缘，与上方自然换行的标题不同轴；
提示行只剩 12px 就贴上来。间距节律 24/12/12 也不齐。

**改法**（只动 `src/pages/about/index.astro` 的 `<style>`；未碰 `src/styles/about.css` 与 `about-copy.ts`）：

```
max-inline-size: 100% (width:100%)  → 54ch
white-space: nowrap + text-overflow → display:-webkit-box; -webkit-line-clamp:2; line-clamp:2
+ .about-qcard-hint { padding-block-start: var(--space-2) }   /* 提示行最小呼吸 */
```

**数值**：三卡摘要盒统一 `477px`，`scrollWidth 477`、**溢出归零**；卡 03 从「单行切词」变成
「两行自然换行 + 行尾省略」，文字块与标题同轴。摘要→提示行视觉间距
`24/12/12` → `24/20/20`（提示行仍锚卡底 = 页脚语义，只加地板不改锚点）。卡高不塌（正面本来比背面矮）。

前 `before-about-02-cards-crop.png` → 后 `after-about-02-cards-crop.png`

---

## 7. 验证与归因

```
pnpm exec astro check         → 0 errors / 0 warnings / 59 hints
pnpm build                    → 20 pages, Complete
node scripts/about-hall-gate.mjs → G-Hall-1..9 全 PASS，FAIL 0 · WARN 0
```

`/about/` Lighthouse（仓内 `lhci collect`，3 runs，mobile，服务端口 4638）：

| | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| run 1/2/3 | 100 / 100 / 100 | 100 / 100 / 100 | 100 / 100 / 100 | 100 / 100 / 100 |
| median | **100** | **100** | **100** | **100** |

对现状登记 100/100/100/100 **不降**。原始读数 `lh-about-after.json`。

e2e（`env -u CI E2E_PORT=4638 --no-deps --workers=1 --retries=0`，日志 `e2e-vis1.log`）：

- `e2e/cyber-city-lookaround.spec.ts` —— **全绿**（6.7m）
- `e2e/about-hall.spec.ts` —— **9 passed / 2 failed**

两条 red 均为 `About Hall scrub（AH-W1h）`：
`about-hall.spec.ts:68`（Hero `currentTime > 1`）与 `:89`（S6 transition `currentTime ∈ (3,8)`）。

**归因：非本票回归，实验坐实。** 把本票 6 个文件全部 `git checkout` 回 HEAD、重 build、
重跑这两条，**同样 2 failed**（本回执 §7 实验；随后按保存的 patch 原样恢复，`git diff --stat` 逐文件核对一致）。
旁证：跑测期间 `AH-W1h` 正在**同树落地视频 scrub 特性**——新增未跟踪
`public/media/about-hall/hero-s0-720p.mp4`、`transition-s6-720p.mp4`、
`transition-s6-poster.webp`、`src/components/city/halls/about/Transition.astro`，
并在改 `ScrubVideo.ts` / `Hero.astro` / `Stations.astro` / `e2e/about-hall.spec.ts`（该 spec 自身也在 dirty 列）。
两条 red 打的正是这套在建管线；本票 6 处改动全是 CSS 定位/配色/间距，与 `video.currentTime` 无接触面。
补充观察：两个 mp4 均为 **h264**，而 Playwright 自带 `chrome-headless-shell` 不含专有编解码，
scrub 类断言在该 runner 上另有环境风险，建议 AH-W1h 一并确认。

其他硬约束复核（final build）：

| 约束 | 结果 |
|---|---|
| 展厅 reduced-motion `getAnimations()` | **0** |
| `/about/` reduced-motion `getAnimations()` | **0** |
| 新增 infinite 动画 | **0**（当前站光环、接地反光、脉冲双层均零时间项或一次性） |
| G-Hall 门 | 未变红（FAIL 0） |
| 汉字 italic / CJK letter-spacing | 未引入；并**移除** 2 处既有 CJK 字距（到达条探索段、馆长标签） |
| 中文正文行高 1.6–1.8 | 摘要 `line-height:1.6` 保持 |
| 禁区文件（`e2e/**`、`public/media/**`、`about-hall-media.json`、`View.ts`、`Areas.ts`、`camera-shots.json`、buildings JSON） | **零改动** |

`git diff --stat`（本票 6 文件）：

```
 src/components/city/HallChrome.astro              | 26 ++++++++++++++----
 src/components/city/halls/about/Curator.astro     | 33 ++++++++++++++++++-----
 src/components/city/halls/about/StationRail.astro | 24 +++++++++++++++--
 src/lab/world/areas/PoiArrival.ts                 | 12 ++++++---
 src/pages/about/index.astro                       | 18 ++++++++++---
 src/pages/index.astro                             | 18 +++++++++++--
 6 files changed, 109 insertions(+), 22 deletions(-)
```

### 环境备注（一处偏离任务书，如实登记）

任务书要求 `pnpm preview --port 4638`。实际 **astro preview 是全局单例**，4636 上有他票
残留 preview 持锁（`Another astro preview server is already running. PID 19255`），
本票不杀他人进程（L10 教训：禁盲目 pkill 误伤在飞会话），改用等价静态服务器伺服同一
`dist/`（`~/.codex/state/about-hall/static-4638.py`，pid 写
`~/.codex/state/about-hall/preview-4638.pid`）。`playwright.config.ts` 的
`reuseExistingServer: !CI` 探到 `/website/` 200 即复用，未拉起 astro preview。
收尾按 pid 杀本 attempt 进程，未动 4636 / 4321。

---

## 8. 超出本票范围的建议

1. **【接债 2，建议优先】开一票同时持有 `BuildingSigns.ts` + `e2e/cyber-city-signage.spec.ts`**：
   把计数单源从 `lodProfile === 'hero'` 改成「hero ∪ 有 `hallPath` 的楼」（当前只多 about 一栋），
   spec 的 `HERO_COUNT` 随之改名/改口径，再给 about 补三层招牌。
   注意 about 只有 **east 一个临街槽位**（`|z|=150 > ROAD_FACING_MAX`），
   而开屏可读的是**南立面**（`FACADE_PLAN['about-pavilion'].firstFrame = 'south'` 已在册）——
   补位要按 first-frame 朝南，否则东面招牌在开屏机位是掠射，白做。
   另：about 落在 `CATEGORY_ICONS.civic = 'agent'`，个人档案馆用主智能体图标语义不符，
   宜同票加一个 civic 图标（`SignageAtlas.drawSignIcon`）。
2. **卡 03 摘要是数据问题不是样式问题**：`about-copy.ts` 里卡 01/02 的 teaser 是一句短摘要，
   卡 03 直接是整段长文。CSS 只能把切口挪得体面，真正的解是补一句 ≤40 字的短摘要，
   届时两行夹取会自然变一行。
3. **馆长画布留白**：`馆长` 标签与机器人头顶之间空档偏大，源自 `curator.ts` 的 3D 取景
   （220×300 画布内机器人偏下），非 CSS 可解；要收需动 `curator.ts` 相机/构图。
4. **`.hint` 与 `.world-ritual-hint` 是重复内容**：非 ritual 腿用壳页那条、ritual 腿用引擎那条，
   文案还不一致（引擎版多 V/F/H/M/Q-E）。建议归一到引擎键位卡（含 H 召回），
   壳页那条退化为纯无 JS 兜底，可省一处长期漂移源。
5. **取证纪律**：SwiftShader 下 `InteractivePoints` 标签擦除、`PoiArrival` 400ms 脉冲都短于
   常用等待，历史截图已因此产生过一次误报（债 3）。建议把「标点牌 ≥12s 墙钟」与
   「脉冲峰值定格法（注入 `animation:none;opacity:1` 再截）」写进视觉取证约定。
6. **`/world/about-pavilion/` 仍不在 LHCI collect**（ADR-2 DEFERRED）。展厅侧本票只动了 CSS，
   但视频 scrub 落地后这条 DEFERRED 的风险敞口会变大，建议 W8 一并评估。
