# CC-FXN-ADV 顾问报告：功能 90 / 性能 85 / 可观测（Loop 8）

> 执行模型自报：**claude-fable-5-thinking-xhigh**

| 项 | 内容 |
|----|------|
| Task | **CC-FXN-ADV**（Loop 8 三路之一）——顾问咨询，**零 src/ 改动** |
| 分支 | `cursor/cc-fxn-advisor-consult-1d6f`（base：`main`） |
| 日期 | 2026-08-27 |
| 输入 | Loop 8 入口 `cyber-city-function-gameplay-loop.md` · CAM 脑暴 `cyber-city-camera-design.md`（F1–F11）· VEH 规格 `docs/spec/cyber-city-vehicle-camera.md`（V 键）· 埋点现状 `src/lab/world/{world/Reveal.ts, player/TransformSystem.ts, player/Player.ts, areas/Areas.ts, index.ts}` · 五维口径 `scripts/score-loop.mjs` · 真机表 `docs/spec/human-gate-checklist.md` · 视觉 rubric v1.1（结构先例） |
| 消费方 | 父代理拍板 → CC-FXN-DES（功能 rubric 正本）· CC-OBS-DES（可观测规格正本）· CC-OBS-C1 / CC-FXN-C1…（实现）· CC-AL-FXN（审计） |

---

## 0. 结论先行

1. **可观测先行是硬序**：现状埋点只有 4 个总线事件（`world-reveal` / `world-transform` / `world-drive-start` / `world-poi`）加散落 `console.info`，**无 sessionId、无时间戳结构、无导出面**——回答不了「用户卡在哪」。第一个实现 PR 必须是 **CC-OBS-C1 SessionTimeline**（§1），之后每个功能 PR 强制「埋点随行」，否则打回（§5 纪律）。
2. **功能 rubric 权重需修正后冻结**：入口文档 §3.1 提议七维合计只有 **95%**（15×5 + 10×2）。顾问冻结建议：**F2 操作反馈 15→20%**（指挥官 2min 实玩的第一痛点），合计 100%（§2.1）。配套「**脚本优先**」口径铁律：playtest 脚本走不到的功能不计分（视觉 rubric「帧优先」的功能版）。
3. **性能 85 与 LHCI 彻底分立**：LHCI performance 测的是**壳加载**（`/` 已 P100，poster-first 架构下对 world 运行时帧率零感知），拿它当性能分必然假高。性能分 = 独立五维 rubric（P1 30 / P2 20 / P3 20 / P4 15 / P5 15），判定权威 = **真机 human-gate §5.4**，CI SwiftShader 证据包只做下界哨兵（§3）。
4. **Loop 8 P0 交互包不与 CAM/VEH 抢文件域**：CAM F2 深链已由 CC-CAM-VIEW（`e44aa49`，PR #45）实现、V 键归 Loop 7 CC-VEH-VIEW（RUNNING）——Loop 8 **不重复实现**，只补埋点与计分。P0 序：OBS-C1 → FXN-C2 驾驶反馈（零依赖先行）→ FXN-C1 键位人性化（排 VEH-VIEW 合流后，Reveal.ts 热点排队）→ FXN-C3 POI 进站前奏（= CAM F1，依赖 #45 合 main）→ FXN-C4 目标/进度（§4）。
5. **登记纪律**：功能 90 = AL-FXN 独立执行 2min+5min 脚本 + 录屏 + SessionTimeline dump JSON + 逐维锚点引用，四件缺一不可；八条禁止清单见 §5（核心：禁 e2e 绿冒充、禁自评登记、禁无埋点改进、禁 SwiftShader 读数当真机判定）。

---

## 1. 可观测架构（交 CC-OBS-DES 细化、CC-OBS-C1 实现）

### 1.1 现状盘点（代码事实）

| 通道 | 现有 | 缺口 |
|------|------|------|
| 事件总线 | `game.events.trigger`：`revealed`（Game.ts）· `world-reveal`（Reveal.ts）· `world-transform` [to]（TransformSystem.finish）· `world-drive-start`（TransformSystem）· `world-poi` [id]（Areas onInteract） | 无订阅者留档：事件发完即逝，无时间戳、无序列 |
| DOM 镜像 | `host[data-world-state]` 四态 · `[data-world-status]` aria-live · `[data-world-hint]` · HUD `[data-ws-speed/fps/cones]` | e2e 可断言瞬时值，不可回放序列 |
| 测试钩子 | `window.__worldSpike`（backend/vehicle/state()/fps()/info()）· `#debug` 下 `__worldSpikeGame`/`__worldTransform` | 只有「当前值」快照面，无历史 |
| 日志 | `console.info` 散落（`[reveal]`/`[transform]`/`[areas]` 前缀） | 人读不可机读；CI 里被淹没 |
| CI 工件 | `test-results/e2e-results.json` · `world-spike-metrics.jsonl`（WS-PERF-01 证据包）· `quality-score.json` · `.lighthouseci/lhr-*.json` | 无功能维工件：没有任何文件能回答「漏斗走到哪一步」 |

### 1.2 SessionTimeline（核心件，CC-OBS-C1）

**定位**：world 分包内零依赖小件（目标 ≤2KB gzip，进 world 分包不进壳，audit-budget 门不动），挂 `Game` 或 `index.ts` 装配段。**本站是静态站，无后端**——「可观测」指本地/CI/审计可回放，不是 RUM 远端上报；PostHog/Plausible 之类接口位留 Phase B 决策，P0 不做。

**dump schema 草案**（正本归 OBS-DES，`schemaVersion` 起 1）：

```ts
interface SessionEvent {
  seq: number;                 // 单调递增
  t: number;                   // performance.now() − mount 起点，取整 ms
  type: string;                // 白名单 §1.3；沿用 SRD §9.5 `world-*` 命名族
  data?: Record<string, string | number | boolean>;   // 扁平可序列化
}
interface SessionDump {
  schemaVersion: 1;
  sessionId: string;           // crypto.randomUUID()，每次 mount 一枚
  startedAt: string;           // ISO
  env: { backend: string; vehicle: string; quality: 0|1|2;
         reducedMotion: boolean; dpr: number;
         viewport: { w: number; h: number }; touch: boolean };
  events: SessionEvent[];      // ring buffer，上限建议 500 条（防内存/防序列化爆量）
  counters: { respawns: number; coneHits: number; poiEnters: number;
              poiInteracts: number; transforms: number; driveViewToggles: number };
  funnel: {                    // 关键路径首达时间戳（ms；未达 = null）——流失点分析最小集
    reveal: number | null;         // world-reveal
    robotIdle: number | null;      // CTA armed（Reveal.enterRobotIdle）
    transformStart: number | null;
    carReady: number | null;
    driveStart: number | null;     // world-drive-start
    firstPoiIn: number | null;     // 首次触发圈 boundingIn
    firstPoiInteract: number | null;  // 首次 world-poi
  };
}
```

**接线方式**：订阅 `game.events` 白名单镜像 + 各系统显式 `session.log(type, data)`（一行接线：Reveal / TransformSystem / Areas / Player 现有 console.info 处同位补打）。console.info 保留不删（人读通道），timeline 是机读通道。

**导出面三通道**：

| 通道 | 消费者 | 形态 |
|------|--------|------|
| `window.__worldSession.dump()` | e2e / CI / 审计 | 返回 SessionDump（可 JSON.stringify）；随 `__worldSpike` 同段挂载，dispose 时删除 |
| `#debug` 面板 | 调参/审计/复现 | §1.4 |
| dispose / pagehide | 人工调试 | `console.table` funnel + counters 摘要一次 |

### 1.3 事件白名单 v1（OBS-DES 冻结，破坏性变更 schemaVersion +1）

| 族 | 事件 | data | 来源 |
|----|------|------|------|
| lifecycle | `mount` `ready` `world-reveal` `robot-idle` `dispose` | — | index.ts / Reveal |
| ritual | `transform-start` `world-transform` `transform-hold` | `{to}`；hold = waitFor 多转 | TransformSystem |
| drive | `world-drive-start` `respawn` `cone-hit` `boost-first` `upside-down` `flip-jump` | respawn 带 `{reason: 'key'\|'fall'\|'unstuck'}`；cone-hit 带 `{total}` | Player / World |
| poi | `poi-bounding-in` `poi-bounding-out` `world-poi` `deep-link` | `{id}`；deep-link 带 `{poi, shot}` | Areas / index.ts |
| camera | `world-drive-view` `shot-apply` `shot-interrupt` | `{mode}` / `{id}` / `{by}` | View（VEH spec §5.2 已冻结 `world-drive-view`；shot-* 对接 CAM F1） |
| ux | `hint-shown` `hint-dismissed` `esc-menu-open` `idle-30s` | dismissed 带 `{by: 'timeout'\|'input'}` | Reveal / 壳 |
| error | `pageerror` `context-lost` | `{message}` 截断 200 字符 | window 监听 |

纪律：**功能 PR 新增交互必须同 PR 落对应事件**（§5）；VEH-VIEW / TRANS-FX 在跑分支合流时按此表补一行镜像即可，白名单预留位已含 `world-drive-view`。

### 1.4 `#debug` 面板（CC-OBS-C2，与 CAM F7 合并为同一面板）

- **入口**：现状 `location.hash.includes('debug')` 判断已存在（index.ts），面板走 **debug-only 动态 import 独立分包**（零生产字节，CAM-DES F7 同款红线）。
- **内容 v0**：state / drive-view / 当前 shot / FPS avg+1% low（FpsMeter 既有）/ drawCalls·triangles / speed / pos / **事件 tail 最近 10 条** / 「导出 dump」按钮（下载 JSON）/ **CAM F7 机位读数与 shot JSON 导出留位**（同面板，避免两个 overlay 叠打架）。
- **红线**：面板只读 + 导出，**不含任何改状态控件**（free 相机 G5 红线不从 debug 面板后门破窗）。

### 1.5 CI 可消费工件与分工

| 工件 | 产出者 | 语义 |
|------|--------|------|
| `test-results/session-dump-<case>.json` | 新 e2e 用例经 `__worldSession.dump()` 落盘 + attach | 漏斗/事件序原始证据 |
| `test-results/function-smoke.json` + 末行 `FUNCTION_SMOKE=<0-100>` | 新 `scripts/function-smoke.mjs`（score-loop 同构 sibling，只读 dump） | **CI 冒烟分 = 哨兵非登记分**：漏斗 7 步齐 70% + 交互面覆盖（cone/respawn/poi/toggle 事件出现）30%；纯存在性/顺序性，**不掺时长**（SwiftShader 时长无意义） |
| `test-results/city-perf-evidence.jsonl` | CITY-PERF-01（§3.3） | 性能 CI 证据包 |
| `docs/research/cyber-city-function-rubric-score.json` | **仅 CC-AL-FXN 审计登记** | 功能登记分机读位，契约与 `cyber-city-visual-rubric-score.json` 同构（score/dimensions/notes/溯源） |
| `docs/research/cyber-city-perf-rubric-score.json` | 仅审计/human-gate 回填登记 | 性能登记分机读位 |

**score-loop 关系**：综合分五维权重**不动**（跨轮可比性优先）；`quality-score.json` 增只读汇总块 `northStar: { visual, function, perf, composite }`（读三个登记 JSON，缺失明示），具体归 OBS-DES。功能/性能是与综合分**并列**的北极星维度，不折算进五维。

### 1.6 与 e2e 的分工（四层，各守各门）

| 层 | 测什么 | 门 |
|----|--------|-----|
| e2e 52/52 | 状态机可达、DOM 契约、八出口不破 | **挡合并**（既有，不降） |
| 功能冒烟（function-smoke） | 漏斗完整性 + 交互事件覆盖，读 dump | 先跑一个 Loop 观察为**软门**（OBS annotation），稳定后再议转硬 |
| 功能 rubric | 2 分钟体验合不合格（真人脚本 + 锚点打分） | **挡登记**（AL-FXN 独立分） |
| 性能双轨 | CI 证据包（下界）+ 真机 human-gate（判定） | **挡登记**（§3） |

一句话：**e2e 证明「能跑」，冒烟证明「链路没退化」，rubric 证明「好玩」，谁也不许替谁签字。**

---

## 2. 功能 rubric v1 冻结建议（交 CC-FXN-DES 出正本 `docs/spec/cyber-city-function-rubric.md`）

### 2.1 七维权重（修正后冻结）

**入口文档 §3.1 提议合计 95%（15×5 + 10×2），非法**。顾问修正：F2 操作反馈 **15→20%**——指挥官 2min 实玩三连抱怨（交互/人性化/游戏特性）的最大公因子是「按了没反应感」；其余维持提议值。

| 维 | 权重 | 测什么 | 主证据源 |
|----|:---:|--------|----------|
| F1 首幕可懂 | 15% | 2min 内理解「我是谁、能干什么、下一步」——三问回答（§2.3） | 录屏 + 三问记录 |
| F2 操作反馈 | **20%** | 按键/碰撞/变形/驾驶/切视角的**即时**视听+UI 反馈（V 键腿 VEH 合流后生效） | 录屏逐帧 + dump 事件↔画面对齐 |
| F3 驾驶乐趣 | 15% | 速度感、视角（third/fpv）、复位友好、障碍/目标感（非纯沙盒） | 录屏 + counters |
| F4 POI 游戏化 | 15% | 进站可发现可完成、深链直达、楼=导航（对接 CAM F1/F2） | funnel.firstPoiIn/Interact + 录屏 |
| F5 人性化 | 15% | 提示消隐/再唤出、误触、失败恢复（翻车/卡墙/掉出）、reduced-motion、触屏 | 5min 脚本专项腿 |
| F6 目标/进度 | 10% | 可选任务线/探索动机/成就感（非强制主线） | 录屏 + counters |
| F7 可观测完备 | 10% | 白名单事件接通率、dump 可导出、#debug 可用、CI 工件接通 | dump 自身 + CI 工件 |

**口径铁律（对应视觉 rubric「帧优先」）**：

1. **脚本优先**：功能必须在 §2.3 playtest 脚本的动线内被自然遇到才计分——「功能在代码里但 2min 脚本里遇不到」不计收益（发现性本身就是 F1/F4 的被测项）。
2. **反馈闭环才算数**：输入→世界响应→玩家可感知确认三段齐才给 F2 分；只有状态变化没有反馈呈现按半价计。
3. F7 是 Loop 8 的强制配套维（无埋点不登记的 rubric 化身）；功能面成熟后 v2 可降为 5% 让渡 F6，**改权重必须升版本号**（视觉 rubric §7 同构条款）。

**90 分的合成含义**：Σ(维分×权重) ≥90 ⇒ 七维几乎全部 ≥85 且至少四维 ≥90——不存在「某一维满分掩护短板」的凑分路径（权重最大单维仅 20%）。锚点段位建议沿视觉 rubric 风格（90-100 / 70-85 / 50-65 / <50，5 的倍数，段内可插值），逐维锚点文本归 FXN-DES 正本。

### 2.2 双评门

沿视觉 rubric v1.1 合议先例：AL-FXN 双 Pass（Pass A = 脚本执行观察打分；Pass B = 锚点量表逐条打分），**分歧 >10 触发合议、以脚本优先铁律仲裁**；实现方自评仅供参考，永不登记。

### 2.3 playtest 脚本大纲（正本归 FXN-DES，脚本版本号进登记 JSON 溯源字段）

**S-2（2 分钟 · 指挥官复测口径 · 首访者视角）**——前置：生产 `/` 或 `pnpm build && pnpm preview`（不测 dev server），桌面 Chrome，无参数，清存储；全程录屏 + 结束导出 dump。

| 时段 | 动作 | 观察/记录 | 计分维 |
|------|------|-----------|:---:|
| 0:00–0:15 | 打开 `/`，只看不点 | 定位语可读？机器人显现？**能否说出下一步**（CTA 可发现） | F1 |
| 0:15–0:30 | 按 CTA/Space 变形 | 反馈连贯？disabled+进度可见？落地有冲击感？ | F2 |
| 0:30–1:30 | WASD 自由驾驶 60s：≥2 急转 + 撞锥桶 + Shift + R（VEH 合流后加 V） | 每个输入是否有即时可感知反馈；复位是否友好 | F2 F3 |
| 1:30–2:00 | 寻找最近光圈并 E 进站 | POI 可发现？键帽提示读到了吗？进站完成？ | F4 |
| 收尾 | 三问：我是谁 / 能干什么 / 下一步 | 逐字记录 | F1 |

**S-5（5 分钟 · 审计口径）= S-2 + 专项腿**：

| 腿 | 动作 | 计分维 |
|----|------|:---:|
| 深链 | `?poi=concept-garage` 落地 + `?shot=` 展示帧（CAM F2） | F4 |
| 失败恢复 | 故意翻车（3s 自救/flipJump）、卡墙（R）、开出边界（killElevation 重生） | F5 |
| 提示系统 | hint 消隐→再唤出；ESC 菜单→出口 | F5 |
| reduced-motion | 模拟开启：终态直出、instant swap、文字状态可读 | F5 |
| 触屏 | DevTools 触屏模拟或真机：摇杆驾驶 + 点标点进站 | F5 |
| 降档 | `?quality=2` 完成变形+驾驶+进站核心路径 | F5 / P5 |
| 空闲 | 60s 不动手观察（attract 候选、hint 行为、世界是否「活着」） | F6 |

打分要求：**逐维引用 ≥1 条 dump 事件（seq/t）+ ≥1 段录屏时间码**；三问回答原文入报告。

---

## 3. 性能 85：与 LHCI 分立的可测口径 + 采样方案

### 3.1 为什么必须分立

LHCI performance 打的是**壳加载指标**（LCP/TBT/CLS）——本站 poster-first 架构下 `/` 已 P100，即使 world 运行时掉到 10fps，LHCI 分毫不动。**性能 85 的分母是运行时体验**，LHCI 四类分继续留在综合分五维里，两边互不折算。

### 3.2 性能 rubric 五维（交 FXN-DES/OBS-DES 并入正本；登记位 `cyber-city-perf-rubric-score.json`）

| 维 | 权重 | 口径 | 判定权威 | CI 哨兵 |
|----|:---:|------|----------|---------|
| P1 帧率体感 | 30% | 桌面双后端均值 ≥60 / 中端安卓 ≥30（human-gate §5.4 表） | **真机录测** | CITY-PERF-01 下界读数（不判定） |
| P2 1% low | 20% | 桌面 ≥45（变形+驾驶 20s 脚本；FpsMeter `low1` 既有口径） | 真机 HUD + DevTools 互证 | 同上 |
| P3 加载可玩 | 20% | Fast 4G「加载→robot_idle CTA 可用」≤8s（= 走查表 §5.1 项 5「加载→可变形」；机读位 `funnel.robotIdle`） | 真机 throttle 秒表 + funnel 互证 | funnel 存在性 only |
| P4 预算 | 15% | audit-budget 零 ❌（既有 CI 硬门） | CI | 同左（本维 CI 即权威） |
| P5 降档可感知 | 15% | `?quality=2` 完成核心路径（变形→驾驶→进站）且无功能性缺失 | S-5 降档腿 + e2e Q2 存在腿 | e2e |

锚点建议：P1/P2 满门 = 100、单腿缺口按缺口幅度落段；P3 ≤8s=100、8–10s=70、>10s=40；P4 二值（零❌=100，否则 0——预算是红线不是滑窗）；P5 完成=100、完成但反馈缺失=70、不可完成=0。**85 的典型合成**：P1 双后端桌面满门 + 安卓 30 达标（100×0.3）+ P2 达标（100×0.2）+ P3 ≤8s（100×0.2）+ P4 零❌（100×0.15）+ P5 完成带小缺口（70×0.15）≈ 95.5——即 85 门允许 P1 安卓腿或 P5 存在一处真实缺口，但不允许两处。

### 3.3 采样方案

**CI 侧（每 PR）**：新 `CITY-PERF-01` spec，照抄 WS-PERF-01 成熟模式（独占殿后串行 project、录像 off、环境指纹、软门不阻断）：对象 `/`，流程 = 挂载 → CTA 变形 → 脚本化驾驶 20s（2 急转 + 1 撞锥桶 + 1 boost，human-gate §2.0 动作脚本同源）→ rAF 帧间隔采样（p50/p95/max/stall）+ `__worldSpike.fps()` 互证 + `__worldSession.dump()` 附档 → `city-perf-evidence.jsonl`。**p95<50ms 软门沿用**；60/30 判定权威恒为真机（SwiftShader ~1fps，任何 CI 数值硬门要么恒假阳性要么恒假阴性——WS-PERF-01 文件头结论直接继承）。

**真机侧（每次登记前 + AL-FXN 审计时）**：human-gate §5.4 四行（桌面 WebGPU/GL2 ×20s、安卓默认/GL2 ×60s）**+ 建议增补两行**：Q2 降档腿（安卓中端）与 Fast 4G 加载计时腿（读 funnel.robotIdle 截图入档）。三件套纪律不变：录屏 + HUD 截图 + 记录表行；归档 `docs/spec/assets/human-gate/`。**云端代理产不出真机读数——留空不伪造**（§5.5 豁免留痕先例延续，欠账列为登记前置）。

---

## 4. Loop 8 PR 切分序（P0 交互包 · 单 PR 单主题 · 按文件域防冲突）

### 4.1 与在途批次的对接事实（先定边界再切 PR）

| 对接项 | 事实 | Loop 8 动作 |
|--------|------|-------------|
| CAM F2 深链直达 | **已实现**：CC-CAM-VIEW `e44aa49`（PR #45 draft，`?poi=&shot=` 数据驱动机位） | **不重做**；OBS-C1 补 `deep-link {poi, shot}` 埋点 + rubric F4 取证消费 |
| CAM F1 进站镜头 | 脑暴 P0（camera-design §2 F1：E 键 0.8s tween → showcase 定帧 → navigate），未实现 | = **FXN-C3** 本体，依赖 #45 合 main（消费 showcase shot 注册表） |
| VEH V 键 FPV | Loop 7 CC-VEH-VIEW RUNNING；spec 已冻结动作行（`toggleDriveView` KeyV）、DOM 镜像 `data-drive-view`、埋点 `world-drive-view` | **不重复实现**；SessionTimeline 白名单预留该事件；S-2/S-5 的 V 键腿合流后生效；rubric F2/F3 计分 |
| TRANS-FX 粒子 | CC-TRANS-FX-IMPL RUNNING（TransformParticles 已 push） | 不碰；F2 变形反馈项在其合流后按同一脚本取证 |
| 热点文件 | `Reveal.ts`（hint 文案）= VEH-VIEW 与 FXN-C1 双热点；`View.ts` = VEH-VIEW / CAM-VIEW / FXN-C3 三热点 | 切分纪律：FXN-C1 排 VEH-VIEW 合流后；FXN-C3 排 #45 合 main 后；**排队不并改** |

### 4.2 PR 序（每 PR 均过同一套硬门：e2e 52/52 · LHCI 不降 · `ritual_idle` 恒等 · audit-budget 零 ❌ · reduced-motion 双轨 · CITY-03 配额 · **埋点随行**）

| # | PR | 主题（单一） | 文件域 | 依赖 | rubric 维 |
|---|-----|-------------|--------|------|:---:|
| 0 | **CC-OBS-C1** | SessionTimeline + 事件白名单接线 + `__worldSession` + `deep-link`/`respawn`/`cone-hit` 等补打点 | 新 `core/SessionTimeline.ts` + index.ts 装配 + Reveal/TransformSystem/Areas/Player 各一行 | 无（**立即可做，一切登记的前置**） | F7 |
| 0.5 | **CC-OBS-C2** | `#debug` 面板 v0（含 CAM F7 机位读数/导出留位）+ function-smoke 脚本与 e2e 漏斗用例 | debug 分包（动态 import）+ `scripts/function-smoke.mjs` + 新 e2e spec + CITY-PERF-01 | OBS-C1 | F7 |
| 1 | **CC-FXN-C2** | 驾驶反馈包：cone-hit HUD 脉冲、respawn toast、boost 可感知强化、翻车自救可视化倒计时 | index.ts HUD 段 + Player/World 小件（**不碰 Reveal/View**） | OBS-C1（与 VEH-VIEW 文件域不相交，可并行先行） | F2 F3 |
| 2 | **CC-FXN-C1** | 键位/引导人性化包：键位卡可再唤出（如 H）、hint 与 drive-view 提示统一、首驶引导文案 | Reveal.ts + 样式 | OBS-C1 + **VEH-VIEW 合流**（hint 文案热点排队） | F1 F5 |
| 3 | **CC-FXN-C3** | POI 进站前奏（CAM F1）：E 键 tween → showcase 定帧 → navigate；驾驶输入 0.1s 中断回 drive；`shot-apply`/`shot-interrupt` 埋点 | View 消费段 + Areas 时序 | **#45 合 main** | F4 + V4/V5 |
| 4 | **CC-FXN-C4** | 目标/进度轻任务：探索计数（n/12 楼）、可选任务提示、完成反馈（非强制主线） | 新小模块 + HUD | OBS-C1；FXN-BR 脑暴定具体形态 | F6 |
| — | 审计 | **CC-AL-FXN**（Sol）：S-2/S-5 执行 + 双 Pass 打分 + 真机性能表核验 | — | C1–C4 合流后 | 登记 |

裁量说明：**FXN-C2 排在 FXN-C1 之前**是文件域决策（C2 与在途 VEH-VIEW 零交集可立即并行；C1 的 Reveal.ts 必须排队）——若 VEH-VIEW 先合流则两者顺序可互换。C4 形态以 CC-FXN-BR 脑暴 + 父代理拍板为准，本表只锁「单 PR 单主题 + 埋点随行」纪律。

---

## 5. 登记纪律：什么证据算功能 90，禁止什么自证

### 5.1 功能 90 成立要件（缺一不登记）

1. **rubric 正本存在且合法**：`docs/spec/cyber-city-function-rubric.md` 冻结版，权重合计 100%，脚本版本号明确。
2. **AL-FXN 独立执行**：Sol 审计代理亲自跑 S-2 + S-5（真浏览器交互，非静态截图拼贴），产出①全程录屏/逐段截图序列、②每腿 `__worldSession.dump()` JSON、③逐维打分且**每维引用 ≥1 条 dump 事件 + ≥1 段录屏时间码**、④三问回答原文。
3. **登记 JSON 溯源齐全**：`cyber-city-function-rubric-score.json` 含 subject commit、scoredBy、scoredAt、脚本版本、双 Pass 分与合议记录（视觉 score JSON 契约同构）。
4. **回归面不塌**：同 commit e2e 52/52 + function-smoke 无退化 + LHCI 不降——注意这是**必要条件不是充分条件**。
5. **性能 85 同规**：真机 human-gate §5.4 表回填（或豁免留痕 + 欠账列前置）+ CI 证据包同 commit 可对照；性能登记走 `cyber-city-perf-rubric-score.json`。

### 5.2 禁止清单（八条）

| # | 禁止 | 依据/先例 |
|---|------|-----------|
| 1 | 实现代理自评登记功能/性能分 | BL1 拍板「禁止用 BL1 自评登记」同构 |
| 2 | 用 e2e 通过率（或 function-smoke 冒烟分）冒充功能分 | 入口 §1：e2e 证明状态机可跑，不证明 2min 体验合格；冒烟 100 ≠ 功能 90 |
| 3 | 无埋点的「功能改进」PR 合流或计分 | Loop 8 纪律「不可观测 = 不可登记」；埋点随行是合并门 |
| 4 | CI SwiftShader 时长/帧率读数充当真机计时/帧率判定 | human-gate 文件头 + WS-PERF-01 口径：CI 读数仅下界参考 |
| 5 | 用视觉分/综合分外推功能分（或反向） | 入口 §7「禁止用视觉分覆盖功能门」；北极星四数各自独立取证 |
| 6 | 「代码里有但脚本里遇不到」的功能计分 | §2.1 脚本优先铁律 |
| 7 | 改 rubric 权重/维度不升版本号、或登记 JSON 溯源字段缺失 | 视觉 rubric §7 反通胀条款同构 |
| 8 | 真机表伪造或以「预计值」填充；产不出就留空并列欠账 | human-gate §5.5「留空不伪造」先例 |

### 5.3 审计输出物清单（AL-FXN 交付定义，供父代理验收）

`docs/research/loop-fxn-audit.md`（分数 + 双 Pass 明细 + 合议）· 录屏/截图归档 `docs/spec/assets/`（命名含日期与腿别）· 两个登记 JSON · dump JSON 附档 · 真机表回填（或豁免留痕）。

---

*CC-FXN-ADV · 2026-08-27 — 可观测架构（SessionTimeline/事件 schema/#debug/CI 工件/e2e 分工）+ 功能七维权重修正冻结（95%→100%，F2 提至 20%）+ 性能 85 双轨口径与采样 + P0 交互包 PR 序（OBS-C1 先行，CAM F1/F2 与 VEH V 键零重复对接）+ 登记八禁。本 Task 零 src/ 改动。*
