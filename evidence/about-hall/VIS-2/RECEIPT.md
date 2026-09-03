# AH-VIS-2 · 合流前最后一刀视觉（前后对照）

worktree `/Users/wanglei/studio-data-root/worktrees/website-about-hall`，base `5c5ca20`。未 commit / 未 push。
门：`astro check` 0 errors · `about-hall-gate.mjs` G-Hall-1..9 全 PASS（G-Hall-6 额外 JS gzip **2043B** ≤ 20KB）。
e2e：`about-hall.spec.ts` 16 + `about-paper.spec.ts` 2 = **18 passed**（port 4644，`--workers=1 --retries=0`）。

---

## 1. S6 幅面：站卡 → 电影幅面

| 项 | 前（`W3e/s6-yield.png`） | 后（`03/04/05-s6-*.png`） |
|---|---|---|
| 视频宽（1440 视口） | ~265px（`.hall-station-visual` min(48rem) 再被 42%/1fr 栅格与 260px 车道压扁） | **1123px** = `min(78vw, 1180px, 让车道后余量, 视高换算)` |
| 幅面 | 站卡尺寸 16:9 小框 | 16:9，632px 高，画面占视口高度 70% |
| 圆角 / 描边 | `--radius-card` 8px + `var(--line)` | **4px** + `rgb(254 243 199 / .10)` 1px；无发光 |
| 版式 | 左文右图两栏（栅格） | 单层舞台：片子居中偏左让车道，文案床压在片左侧（与 Hero 同构） |
| 文案 | 两行常显 | 同一 `--s6-progress` 两段揭示 |
| 馆长重叠 | 车道把片子挤成小卡 | 片右缘 **1152px** vs 馆长左缘 **1177px** → 25px 净空，零重叠 |

- 两段揭示区间：`open`（kicker 句）`opacity: clamp(0, (0.34 - p) / 0.12, 1)`；`close`（"AI 工作流。…"句）`clamp(0, (p - 0.62) / 0.12, 1)`；中段两句同时淡出（见 `04-s6-mid.png`）。附 ≤8px 横向位移，无 infinite 动画、无 mix-blend。
- progress 来源 = `createScrollScrub` 已有的 `onProgress` 出口，**没有新增第二个滚动监听**；`section.style.setProperty('--s6-progress')`。
- 降级：`data-s6-live` 只在 scrub 绑定成功时写。RM `{live:null, open:1, close:1, anims:0}`；无 JS `{live:null, open:1, close:1}`（唯一 animation 是既有 scroll-nudge）。
- 不变：220vh、进视口前 200px 预加载、移动端 poster（`06-s6-375.png`，横向溢出 0）、`<900px` / `hover:none` / RM 隐藏 video。

## 2. Hero DOM ↔ 指针 scrub

| 项 | 前（`W1h/01-`/`02-hero-scrub-*.png`） | 后（`01/02-hero-progress-*.png`、`07-hero-ticks-detail.png`） |
|---|---|---|
| 静态可辨性 | 只有光缆光流变化，DOM 完全不动 | 文案床 0→12px 横移 + scrim 提亮 + 右侧 6 点进度 |
| 标题 | — | 不动（位移只挂 lede / role / scroll） |
| scrim | 固定 `.62 / .35 / 0` | 底层锚死左缘 `.62`，`::after` 可变层 `opacity: 1 - p` → 58% 处合成 **.32 → .15** |
| 进度指示 | 无 | 右缘 6 个 4px 点（对应 6s），`opacity: clamp(.16, (p*6 - i)*4, 1)`；探针实测 p=0.5 → `[1,1,1,.16,.16,.16]` |

- 消费出口：`createPointerScrub(root, video, { onProgress })` —— `ScrubVideo.ts` **零改动**。
- 抬指回位：`pointerleave/pointercancel` 清 `data-hero-scrubbing`，CSS 在 `:not([data-hero-scrubbing])` 下开 `transition: 300ms var(--ease-out)`；scrub 途中 transition 关闭以保证跟手（不是插值动画）。
- 无指针 / RM：`data-hero-live` 不写 → 点隐藏、`--hero-progress` 恒 0 → DOM 静态；RM 下 hall.css 全局 `transition: none !important` 兜底，`getAnimations()` 仍 0。

## 3. 取舍

1. **78vw 与车道冲突时车道优先**：1024 视口实得 732px（78vw 目标 798px），因为 `100vw - 260px 车道 - 安全边` 先触顶。1440 视口足额 1123px。
2. **文案压片而非并排**：78vw 之后没有并排文案的横向余量，按票面「左侧或上方」取左侧 overlay，与 Hero 同构；用暗渐变兜底可读性（非 mix-blend）。
3. **scrim 用分层而非整层 opacity**：整层压暗系数会把左缘从 .62 一起拉到 .27，progress 1 时正文压在光缆上发糊。改为锚死左缘、只淡出可变层，实测 58% 处 .32→.15，与票面 .35→.15 相差 0.03。
4. **两句的语义映射**：票面写「人形态句 / 馆长句」，但 `about-copy` 的 s6 现有文案是 kicker + body 两行且不许改，故按出现次序映射：kicker → 0–0.34，body → 0.62–1。
5. **窄屏 stage 吃满安全区**：375 下 78vw 会留大边，改 `width:100%`。
