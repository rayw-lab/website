# W3e receipt — 馆长契约对齐 ADR-5 决策 A

worktree: `/Users/wanglei/studio-data-root/worktrees/website-about-hall`
branch: `codex/about-hall-20260902`（未 commit / 未 push）
date: 2026-09-03
preview: `http://127.0.0.1:4643/website/world/about-pavilion/`（pid 档 `~/.codex/state/about-hall/preview-4643.pid`，收工已杀）
裁决单源: `docs/local-cmd/adr/ADR-5-curator-presence-and-portrait.md` 决策 A

## 改动文件（write root 内，无越界）

| 文件 | diff | 角色 |
|---|---:|---|
| `src/components/city/halls/about/Curator.astro` | +49 / −5 | 宿主脚本成为 pose 单源：按主导幕写 `data-curator-pose`；yield 的降透明 + 300ms 淡回 CSS |
| `src/components/city/halls/about/curator.ts` | +114 / −46 | 四态状态机跟随宿主属性；rAF 真取消（非空转挂环）；三热路径互斥；只读帧计数 |
| `e2e/about-hall.spec.ts` | +116 / −0 | **纯追加** 文件末尾一个 `test.describe('AH-W3e 馆长契约')`（2 例）；AH-F1 的块一字未改 |

工作树 HEAD 在本票期间被推进到 `fa1dc2d`（AH-F1 / AH-D1 落地）。`e2e/about-hall.spec.ts` 现在的未提交 diff 是 **+206 / −0 共用**：其中 AH-F1 的 coneHits / 地轨键盘 / 375 三例（90 行）仍未 commit，我的块是末尾 116 行。零删除，AH-F1 的块未被动过。

`Hero.astro` / `Transition.astro` / `ScrubVideo.ts` **零改动**——互斥全在 curator 侧做（见下）。未 import `src/lab/world/**`、无 rapier、无 `three/webgpu`。

## pose 状态机（幕 → pose → 触发条件）

写入方 = `Curator.astro` 的 `syncPresence()`（IntersectionObserver + `scroll` 读数）；`bestScene()` = 可见高度最大的 `[data-scene]`。

| 主导幕 | `data-curator-pose` | 触发条件 | rAF | 备注 |
|---|---|---|---|---|
| `s0` | 属性不写 | `.is-on` = false（`scene==='s0'`） | 不挂 | S0 零 three、零 `import('./curator')`（ADR-5 A.2） |
| `s1` | `gaze` | 在场默认 | 热 | `[data-scene="s1"]` 相交（threshold 0.08）才 `import('./curator')`，只 import 一次 |
| `s2`–`s4` | `gaze` | 在场默认 | 热 | 双臂自然下垂（磊哥已接受的站台帧） |
| `s5` | `present` | 仅 s5（天平幕） | 热 | 托举 = `lift→1` + 米色全息球；**不再横跨 s2–s6** |
| `s6` | `yield` | 仅 s6 | **冷（`cancelAnimationFrame`）** | ≤20 帧收势把手落回 gaze 末姿 → `frozen` → 冻帧；canvas opacity 0.4 |
| `s7` | `gaze` | 在场默认 | 热 | 离 s6 即 `frozen=false`、rAF 重挂，canvas 300ms 淡回 1 |
| `s8` | `salute` | 仅 s8 | 热 | 抬手一次（`saluteDone` 锁，不循环）；滚回 s7 手落回，不留举着的手 |
| footer 相交 / `<900px` | 属性删除 | 现有淡出逻辑不动 | 不挂 | `.is-on` 移除 → 宿主 opacity 0 |
| RM / 无 WebGL | 静态 `gaze` | `playMq` 不匹配或无 WebGL | 不挂 | 属性仍在（ADR-5 A.3 允许不写，票面要求「存在」，取票面） |

`data-curator-scene`（诊断）由宿主写；`data-curator-lift` 仍由 curator.ts 写；`data-curator-raf` = `0|1` 新增。

## 三热路径互斥（实现要点）

ADR-5 A.5：同一动画帧，Hero 指针 seek / S6 滚动 seek / `renderer.render` 至多一条。

1. **冷是真冷**：`tick()` 不再无条件 `requestAnimationFrame`。`wantsLoop()` = 已加载 ∧ `.is-on` ∧ ¬(yield ∧ 已冻帧)；不满足即 `cancelAnimationFrame` 并写 `data-curator-raf="0"`。pose/class 变化由 `MutationObserver`（`attributeFilter: ['data-curator-pose','class']`）驱动重挂，避免第二个 rAF。
2. **同帧兜底**：`seekHot(now)` —— ①`[data-hero-scrub] video.seeking` 且最后一次落在 Hero 内的 pointer 事件在 400ms 内；②`[data-scene="s6"] video.seeking`。命中则本帧只更新 `lastT` 后 return，不 `render`。读的是 DOM/媒体元素公开状态，**不碰 ScrubVideo 内部**，所以 Hero/Transition 一行未改。
3. **让位不重拉 GLB**：不 `destroy()`；`preserveDrawingBuffer: true` 让冻帧真的留在 canvas 上（默认 false 时合成后隐式清空 = 馆长凭空消失）。
4. **加载即让位时不补渲染**：GLB 在 s6 期间加载完成不画首帧（宁可 canvas 空着），「至多一条热路径」优先于「一定有画面」。代价：直接深链到 s6 时馆长位空，离开 s6 即正常。

## 视觉（yield）

不做新动作、不加 infinite 动画：canvas + 接地锚 opacity → **0.4**（ADR 上限 0.45），`transition: opacity 300ms` 只开在 `prefers-reduced-motion: no-preference` 里。收势 = 托举的手在 ≤20 帧内落回下垂（与降透明同步），读作「侧身让位看片」，不是第四套骨骼秀。

## 门与 e2e

| 项 | 结果 |
|---|---|
| `pnpm exec astro check` | 0 errors / 0 warnings / 59 hints（hints 为既有 ld+json / execCommand） |
| `node scripts/about-hall-gate.mjs` | G-Hall-1..9 **全 PASS**，FAIL 0 · WARN 0 |
| G-Hall-6 初始 JS | 1838 B gzip（PASS，目标 20 KB）。同树同 SHA 基线实测 1725 B → **+113 B**，见「取舍」 |
| e2e `about-hall.spec.ts` | **16/16 passed**，0 failed / 0 skipped / 0 flaky，连跑两轮同结果（含 AH-F1 的地轨键盘与 375 两例，均绿） |

命令：`env -u CI E2E_PORT=4643 pnpm exec playwright test e2e/about-hall.spec.ts --no-deps --workers=1 --retries=0 --reporter=list`

新增 2 例断言：
- `s0` 无 pose → `s1` = `gaze` 且 canvas 出现 → `s5` = `present` → `s6` = `yield` ∧ canvas opacity ≤0.45 ∧ `data-curator-raf="0"` ∧ 连采 5 帧 `window.__hallDebug.curatorFrames` 无增长 → 离 s6 后帧计数恢复增长 → `s8` = `salute`。
- RM：pose = `gaze` 存在、`getAnimations()` = 0、`[data-curator] canvas` 数 0、600ms 内 `curatorFrames` 不增长。

## 截图（1440×900，本目录）

| 文件 | 宿主读数 |
|---|---|
| `s5-present.png` | `pose=present raf=1 lift=1.00 opacity=1` |
| `s6-yield.png` | `pose=yield raf=0 lift=0.00 opacity=0.4` |
| `s8-salute.png` | `pose=salute raf=1 lift=0.00 opacity=1` |

## 取舍 / 需指挥官知道

1. **G-Hall-6 涨 113 B gzip**（1725 → 1838，门仍 PASS，门无棘轮）。原因：pose 必须由宿主脚本写——RM/无 WebGL 下 three 根本不加载，pose 属性要存在只能在初始 JS 里算；同时 `bestScene()` 需要 `scroll` 读数补 IntersectionObserver 的盲区（s6 220vh，自身比例到不了 0.5 阈值，中段停住 pose 会僵在旧值）。已压过一轮：pose 表只留 3 个非默认条目、去掉节流器与同值去重、`hasWebGL()` 结果缓存（否则每个 scroll 帧真建一次 WebGL 上下文）。若指挥官要求严格不涨，唯一可行让步是把 RM 下的 pose 属性去掉（回到 ADR-5 A.3 表允许的「属性不写」），代价是票面 RM 例要改口径。
2. **committed `GATE.json` 里 G-Hall-6 = 930 B 是过期读数**（只列了 1 个 script）。同 HEAD 代码重建实测 1725 B（Hero 480 + Curator 930 + Transition 315，三个 script 分包）。比较基线用的是后者，不是 930。
3. **让位收势 ≤20 帧不是绝对零帧**。纯冻帧会把托举的手臂冻在半空（首轮截图已实锤，像「举着球看片」）。收势期间仍走 `seekHot()` 兜底，不与任何 seek 同帧；e2e 先等 `data-curator-raf="0"` 再采帧，所以硬门读数是零渲染。若指挥官坚持「进 s6 立即零帧」，改法 = 收势删掉 + 接受手臂半空冻帧。
4. **`window.__hallDebug` 只读探针**（`__worldSpike` 同段纪律：挂载写、`destroy()` 删）。生产页也在，体积在 lazy chunk 内，不进初始 JS。
5. **salute 收手改动**：抬手保持只在 s8 期间；滚回 s7 手落回 gaze。原实现抬手后永久保持（`saluteDone` 后仍叠 rise=1），与 s7=gaze 冲突。
6. 未碰 `/Users/wanglei/mywebsite`；未 commit / push；未占 4321（preview 用 4643，收工按 pid 杀）。
