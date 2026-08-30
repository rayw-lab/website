# 可观测性规格：SessionTimeline · 事件 schema · #debug 面板 · CI 工件（CC-OBS-DES 正本）

> 执行模型自报：**claude-fable-5-thinking-xhigh**

| 项 | 内容 |
|----|------|
| Task | **CC-OBS-DES**（Loop 8 可观测设计正本）——细化顾问报告 `docs/research/cyber-city-fxn-advisor-consult.md` §1，冻结实现契约 |
| 分支 | `cursor/cc-obs-observability-spec-1d6f`（base：`main`） |
| 日期 | 2026-08-27 |
| 上游 | 顾问报告 §1（架构裁决）· 代码事实 `src/lab/world/{core/Game.ts, core/Events.ts, index.ts, world/Reveal.ts, player/TransformSystem.ts, player/Player.ts, areas/Areas.ts}` · VEH 规格 `docs/spec/cyber-city-vehicle-camera.md`（`world-drive-view` 已冻结）· 计分器 `scripts/score-loop.mjs` · 预算门 `scripts/audit-budget.mjs` · e2e `e2e/cyber-city.spec.ts` / `e2e/world-spike-perf.spec.ts`（WS-PERF-01 工件先例） |
| 消费方 | **CC-OBS-C1**（SessionTimeline + 接线）· **CC-OBS-C2**（#debug 面板 + function-smoke）· CC-FXN-C1…C4（埋点随行）· CC-AL-FXN（审计取证）· 父代理（northStar 读数） |
| 红线 | 本站**无后端**：可观测 = 本地/CI/审计可回放，非 RUM 远端上报（PostHog 等接口位归 Phase B）· SessionTimeline **≤2KB gzip 进 world 分包**，壳零字节、audit-budget 门参数零改动 · `#debug` 面板 debug-only 动态分包，生产路径零请求 · 面板**只读 + 导出**，禁一切改状态控件（G5 同构）· 既有 e2e 52 用例零改动 · `ritual_idle` 恒等 / poster 协议不触碰 |

---

## 0. 结论先行

1. **SessionTimeline 挂 `Game` 构造器**（`game.session`，`src/lab/world/core/SessionTimeline.ts`）：每个 Game 实例恒有一枚、系统一行接线 `this.game.session.log(type, data)` 无空判断；`index.ts` 装配段只负责 window 导出面、HUD 节拍沿检测埋点（cone-hit / idle-30s）与 deep-link 首打。
2. **dump schema v1 冻结**（§3.2）：ring buffer 500 条 + `dropped` 计数；`funnel` 七步首达壁钟毫秒；`counters` 六项聚合**独立于 ring**（溢出不失真；[CC-PERF-C2-B0] 随行加法后**七项**——增 `longFrames` 长帧计数，§3.4 尾注）；`seq` 全局单调（含被丢弃条目）。破坏性变更 `schemaVersion` +1，加法不升版。
3. **事件白名单 v1 冻结**（§3.4，27 个 type、7 族；[CC-FXN-C1] 随行加法后 28 个——ux 族 `hint-recall`；[CC-FXN-C4] 随行加法后 **31 个 type、8 族**——新增 goal 族 `explore-restore` / `explore-progress` / `explore-complete`，F6 探索计数 n/12；[CC-PERF-C2-B1] 随行加法后 **32 个 type、9 族**——新增 perf 族 `quality-auto-drop`，PERF-BR O1 自动降档取证；[CC-FXN-C5] 随行加法后 **34 个 type、9 族**——goal 族 `world-quest`（G4 目标线 v0 主漏斗）+ ux 族 `idle-nudge`（`idle-30s` 消费，L7 空闲主动引导）；[CC-FXN-C6] 随行加法后 **37 个 type、10 族**——drive 族 `brake-first` / `suspension-jump`（loop8-fxn-audit §6-4 F/刹车确认层随行），新增 challenge 族 `world-speedtrap`（G9 测速牌）；[CC-AUD-C1] 随行加法后 **38 个 type、10 族**——ux 族 `world-audio`（G3 合成音效层：首手势解锁沿/静音钮切换）；[CC-NAV-C1] 随行加法后 **41 个 type、10 族**——ux 族 `minimap-open` / `minimap-close` / `minimap-teleport`（M 键小地图，GAP-12 清偿，两段式传送第一段））：既有 `game.events` 总线 `world-*` 事件走**镜像订阅**（args 映射表冻结）；非总线事件走显式 `session.log`（接线点逐一定位到文件/函数）；壳侧（ESC 菜单）经 **`world-obs` CustomEvent 桥**（§3.5）过族白名单进 timeline——壳零 import、window 导出面保持只读。
4. **dispose 导出合同**（§4）：`SessionTimeline.dispose()` 幂等三步（`dispose` 事件入 ring → `console.table` funnel+counters 摘要**一次** → 摘除监听），由 `Game.dispose()` **首段**调用（各系统仍在、读数完整）；`window.__worldSession` 与 `__worldSpike` 同段挂载/删除；bfcache 快照离页不触发（facade `event.persisted` 既有语义），**e2e 取证必须在卸载前 dump**。
5. **function-smoke 是哨兵不是登记分**（§6.2）：漏斗七步齐 70%（非 null + 单调顺序）+ 交互面四事件存在性 30%；**不掺任何时长/帧率**（SwiftShader 下时长无意义）；首个 Loop 软门（OBS annotation），稳定后再议转硬。`quality-score.json` 增只读 `northStar` 块（§6.4），综合分五维权重**零改动**。

---

## 1. 目标 / 非目标

**目标**

1. 回答「用户卡在哪」：任一次会话可导出机读事件序 + 漏斗首达时间 + 交互计数（现状四个总线事件发完即逝，无 sessionId/时间戳/导出面）。
2. 给 CC-AL-FXN 审计与功能 rubric F7 维提供取证面：`__worldSession.dump()`（e2e/CI/审计）、`#debug` 面板（人工调参/复现）、dispose 摘要（人工调试）三通道。
3. 给 CI 提供功能维工件：`test-results/session-dump-<case>.json` + `test-results/function-smoke.json`（末行 `FUNCTION_SMOKE=<0-100>`）。
4. 固化「埋点随行」纪律的技术底座：功能 PR 新增交互必须同 PR 落白名单事件，否则打回（顾问 §5 禁止清单第 3 条）。

**非目标（显式不做）**

- ❌ RUM / 远端上报 / 第三方统计 SDK（PostHog/Plausible 接口位 Phase B 决策；P0 零网络副作用）。
- ❌ 替代 `console.info` 人读通道（保留不删，timeline 是机读通道，双轨并行）。
- ❌ 性能采样归本件（帧间隔采样归 CITY-PERF-01，正本见顾问 §3.3；SessionTimeline 不读 fps，只记事件）。
- ❌ 回放引擎/时间旅行调试（dump 是证据面不是重演面）。
- ❌ 用冒烟分冒充功能登记分（§6.5 四层分工，禁止清单第 2 条）。

---

## 2. 现状事实（代码定位，实现前置核对）

| 机制 | 现状 | 与本规格的关系 |
|------|------|----------------|
| 事件总线 | `core/Events.ts`（folio 移植，order 稀疏数组时序）；`game.events` 现有 trigger：`revealed`（Game.ts L214）· `world-reveal`（Reveal.ts L107）· `world-transform` [to]（TransformSystem.ts L287）· `world-drive-start`（TransformSystem.ts L151）· `world-poi` [id]（Areas.ts L140） | §3.4 镜像订阅集合的全部现有成员 |
| 系统内部事件 | `game.player.events` `respawn` [respawn]（Player.ts L223）· `vehicle.events` `upsideDown`/`rightSideUp`/`flip` 等（PlayerVehicle 契约 L58）· `transformSystem.events` `stateChange`/`swap` | respawn/upside-down/flip-jump 接线点 |
| 锥桶计数 | 无事件——`game.world.knockedConeCount()` 轮询（index.ts HUD 0.25s 节拍 L225） | cone-hit 沿检测挂同一节拍（§3.4） |
| DOM 镜像 | host `data-world-state` 四态 · `[data-world-status]` aria-live · `[data-world-hint]` · HUD `[data-ws-speed/fps/cones]` · 壳 `[data-world-esc-menu]`（index.astro L233） | e2e 瞬时断言面不变；timeline 补「序列」维度 |
| 测试钩子 | `window.__worldSpike`（backend/vehicle/state()/fps()/info()，index.ts L244）；`#debug` 时 `__worldSpikeGame`/`__worldTransform`（L265-268）；dispose 时三者 delete（L293-295） | `__worldSession` 同段挂载/删除（§4.1）；`#debug` 判断分支即面板挂载点（§5.1） |
| 生命周期 | facade（`src/lab/facade.ts`）：pagehide 非 bfcache → dispose（L120-122）；`astro:before-swap` → dispose（L123） | dispose 合同的触发路径（§4.2） |
| CI 工件 | `test-results/e2e-results.json` · `world-spike-metrics.jsonl`（WS-PERF-01）· `quality-score.json`（score-loop.mjs）· `.lighthouseci/lhr-*.json` | §6.1 工件总表的既有行；function-smoke.mjs 与 score-loop.mjs 同构（CLI/退出码/末行机读） |
| 预算门 | `audit-budget.mjs`：world JS 全量 ≤900KB gzip；壳零 world 字节 | SessionTimeline ≤2KB gzip 在 900KB 内消化，门参数零改动 |
| e2e 布局 | `world-chromium` 串行 project（cyber-city.spec.ts CITY-E2E-01…；`PAGE_URL` = 生产 `/`）；`world-perf-chromium` 独占殿后 | 新 OBS 用例入新文件 `e2e/cyber-city-observability.spec.ts`，同 project（§7） |

---

## 3. SessionTimeline 冻结规格（CC-OBS-C1）

### 3.1 定位与装配

| 项 | 冻结值 |
|----|--------|
| 文件 | `src/lab/world/core/SessionTimeline.ts`（新增，零依赖：不 import three/系统模块，只依赖标准 API） |
| 实例 | `Game` 构造器内 `this.session = new SessionTimeline()`，公开字段 `game.session`（**恒有**，ritual/灰盒/world-spike 全路径一致；非 ritual 路径 funnel 各步自然为 null） |
| 会话起点 | SessionTimeline 构造帧：`t0 = performance.now()`、`startedAt = new Date().toISOString()`、`sessionId = crypto.randomUUID()`（不可用时回退 `Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)`）；构造即自打 `mount` 事件（t≈0） |
| sessionId 语义 | **每个 Game 实例一枚**（= 每次 mount 一枚；bfcache 恢复不换 id——实例未销毁） |
| 镜像订阅 | 构造后由 Game 调 `session.attach(game.events)`：按 §3.4 镜像表订阅（默认 order）；`session.dispose()` 时逐一 off |
| 体积预算 | ≤2KB gzip，进 world 分包（`vite build` 后以 world chunk 增量核对）；壳（`/` 静态段）零字节 |
| 时基 | `t = Math.round(performance.now() − t0)`——**壁钟**，`game.pause()` 不冻结（P3 加载体验口径需要壁钟；与 Ticker 游戏时间显式区分，不得混用） |

### 3.2 dump schema v1（冻结）

```ts
interface SessionEvent {
  seq: number;                 // 1 起全局单调递增；ring 溢出丢弃不回收 seq
                               // （events[0].seq > 1 即发生过丢弃）
  t: number;                   // 整数 ms，performance.now() − t0（壁钟，§3.1）
  type: string;                // §3.4 白名单；白名单外 log 调用：丢弃 + console.warn 一次/type
  data?: Record<string, string | number | boolean>;  // 扁平；非法值键剔除不抛错
}

interface SessionDump {
  schemaVersion: 1;
  sessionId: string;
  startedAt: string;           // ISO 8601
  env: {
    backend: 'webgpu' | 'webgl2' | 'pending';   // 活值：Game.init 前 dump = 'pending'
    vehicle: 'physics' | 'kinematic' | 'pending';
    quality: 0 | 1 | 2;                          // Game.quality.level
    reducedMotion: boolean;                      // matchMedia('(prefers-reduced-motion: reduce)')
    dpr: number;                                 // devicePixelRatio（构造时快照）
    viewport: { w: number; h: number };          // innerWidth/Height（构造时快照）
    touch: boolean;                              // matchMedia('(pointer: coarse)')（构造时快照）
  };
  events: SessionEvent[];      // ring buffer 快照，上限 500 条（超限丢最旧）
  dropped: number;             // 溢出丢弃条数（0 = 未溢出）
  counters: {
    respawns: number;          // respawn 事件次数
    coneHits: number;          // 最新 cone-hit.total（锥桶+隔离墩合计，[CC-FXN-C2] §3.4 随行修订；灰盒与 HUD [data-ws-cones] 同源，非事件条数）
    poiEnters: number;         // poi-bounding-in 次数
    poiInteracts: number;      // world-poi 次数
    transforms: number;        // world-transform 次数
    driveViewToggles: number;  // world-drive-view 次数（VEH-VIEW 合流前恒 0）
    longFrames: number;        // [CC-PERF-C2-B0] 墙钟帧间隔 >50ms 的帧数（O10 常驻层；
                               // 非事件不入 ring，装配段 tick 一次比较递增，§3.4 尾注）
  };
  funnel: {                    // 关键路径首达 t（ms；未达 = null）
    reveal: number | null;           // world-reveal
    robotIdle: number | null;        // robot-idle（Reveal.enterRobotIdle，CTA armed）
    transformStart: number | null;   // transform-start
    carReady: number | null;         // world-transform 首次 to='car'
    driveStart: number | null;       // world-drive-start
    firstPoiIn: number | null;       // poi-bounding-in 首次
    firstPoiInteract: number | null; // world-poi 首次
  };
}
```

### 3.3 运行语义（冻结）

1. **ring buffer**：上限 500 条，溢出丢最旧、`dropped` 递增；`seq` 不回收（审计可从 `events[0].seq` 与 `dropped` 互证截断量）。
2. **聚合独立**：`funnel`/`counters` 在 `log()` 入口更新，**不依赖 ring 内容**——溢出后漏斗与计数依旧精确。
3. **funnel 只记首达**：对应事件再次出现不覆盖；`carReady` 只认 `world-transform` 且 `data.to === 'car'`（回变机器人不写）。
4. **`dump()` 纯快照**：返回全新 JSON-safe 平面对象（events 逐条浅拷贝；无 THREE/DOM 引用），任意时刻可调、可反复调、`JSON.stringify` 恒成功；dispose 后调用返回终态（含 `dispose` 事件）。
5. **公开 API 最小面**：`log(type, data?)` · `attach(events)` · `dump()` · `dispose()`；无删改/回放/订阅面（#debug 面板 tail 经内部只读游标 `tail(n)`，仅 world 分包内消费，不上 window）。[CC-PERF-C2-B0] 随行加法：`countLongFrame()`——`counters.longFrames` 专用递增口（§3.4 尾注），仍不上 window、不开订阅面。
6. **健壮性**：`log()` 永不抛错（白名单外丢弃告警、data 非法值剔除）；埋点故障不得影响游戏路径。

### 3.4 事件白名单 v1 + 接线表（冻结；改动纪律见 §3.6）

镜像 = `session.attach(game.events)` 订阅并按下表映射 args → data；显式 = 调用点一行 `game.session.log(...)`；沿检测 = 装配段/系统内边沿判定后显式 log。**console.info 一律保留**（人读通道）。

| 族 | type | data | 接线方式 · 定位 | 波次 |
|----|------|------|-----------------|------|
| lifecycle | `mount` | — | 构造自打 · SessionTimeline 构造器 | P0 |
| lifecycle | `ready` | — | 镜像 `revealed` · Game.reveal()（坑④ 3 帧后） | P0 |
| lifecycle | `world-reveal` | — | 镜像 · Reveal 首幕开演（ticker.wait(6)） | P0 |
| lifecycle | `robot-idle` | — | 显式 · Reveal.enterRobotIdle() | P0 |
| lifecycle | `dispose` | — | dispose 合同 · SessionTimeline.dispose()（§4.2） | P0 |
| ritual | `transform-start` | `{to}` | 显式 · TransformSystem.transform() 入口（状态置 transforming 处） | P0 |
| ritual | `transform-hold` | — | 显式 · RitualRun.holding 置 true 沿（waitFor 未 resolve、充能环多转；每次 run 至多 1 条） | P0 |
| ritual | `world-transform` | `{to}` | 镜像 [to]→`{to}` · TransformSystem.finish() | P0 |
| drive | `world-drive-start` | — | 镜像 · TransformSystem（首个驾驶输入） | P0 |
| drive | `respawn` | `{reason: 'key' \| 'fall' \| 'unstuck'}` | 显式 · Player.ts 两调用点：R 键 handler → `'key'`；killElevation 兜底（updatePostPhysics）→ `'fall'`（`'unstuck'` 枚举预留：屏上 unstuck 按钮未移植） | P0 |
| drive | `cone-hit` | `{total}` | 沿检测 · index.ts HUD 0.25s 节拍：`knockedConeCount() + StreetProps.hitCount` 较上拍增大即打（total = 当前合计）。[CC-FXN-C2] 随行修订（加法不升版）：城市档锥桶撤场（World 城市模式零锥桶）、隔离墩 fixed 刚体不位移，`StreetProps.hitCount`（接触力事件 ≥15 + 0.6s 冷却合并）承接「撞道具」真值并入 total——语义「撞到道具的累计数」与 data 键不变；灰盒无城市时两口径逐拍等值 | P0 |
| drive | `boost-first` | — | 沿检测 · Player.updatePrePhysics 一次性（首次 `boosting === 1`；每会话至多 1 条） | P0 |
| drive | `brake-first` | — | 沿检测 · Player.updatePrePhysics 一次性（首次 `braking === 1`；boost-first 同构，每会话至多 1 条）。[CC-FXN-C6] 随行加法（加法不升版）：loop8-fxn-audit §6-4「Space/B 刹车确认层」的埋点面——DriveFeedback `[data-world-brake]` 徽标走 index.ts 'brake' 动作双沿纯呈现 | P0 |
| drive | `suspension-jump` | — | 显式 · index.ts 装配段（'suspensions'（F）激活沿 + 触屏摇杆内环 `nipple` 'tap' 两来路共用；节流 ≥1 设计秒防按住/连按灌 ring）。[CC-FXN-C6] 随行加法：F 悬挂跳确认层——HUD `[data-world-jump]` 脉冲同源同拍 | P0 |
| drive | `upside-down` | — | 显式 · Player.setUnstuck 内 `vehicle.events.on('upsideDown')` 既有订阅处 +1 行 | P0 |
| drive | `flip-jump` | — | 显式 · Player.setUnstuck waitAndTest 内 `vehicle.flipJump()` 调用点 | P0 |
| poi | `poi-bounding-in` | `{id}` | 显式 · Areas boundingIn handler | P0 |
| poi | `poi-bounding-out` | `{id}` | 显式 · Areas boundingOut handler | P0 |
| poi | `world-poi` | `{id}` | 镜像 [id]→`{id}` · Areas onInteract | P0 |
| poi | `deep-link` | `{poi, shot?}` | 显式 · index.ts 装配段（`?poi=` 非 null 时挂载即打；`shot` 字段 CAM PR #45 合流后由同点补传，字段加法不升版） | P0 |
| camera | `world-drive-view` | `{mode}` | 镜像 [mode]→`{mode}` · **镜像表本 PR 即登记**，VEH-VIEW（`toggleDriveView`/KeyV）合流后事件自然入流，零补丁 | 预留 |
| camera | `shot-apply` | `{id}` | 显式 · `areas/PoiArrival.begin()`（[CC-FXN-C3] E 进站前奏起帧：`world-poi` 之后同交互调用内 log，seq 序稳定；id = `poi_showcase-<buildingId>` 注册表键。预留行转正，零版本变更——§3.6-4） | P0 |
| camera | `shot-interrupt` | `{by: 'drive' \| 'teleport'}` | 显式 · `areas/PoiArrival.interrupt(by)`（驾驶意图 RELEASE_ACTIONS 经 actionStart 同帧中断 = design F1「0.1s 内交还」上界；前奏中断与定帧后驾驶接管同一接线点。[CC-NAV-C1] `by` 枚举 data 值加法：`'teleport'` = 小地图传送显式取消——teleport 直写 moveTo 不经 actionStart，RELEASE_ACTIONS 拦不到，`Minimap.teleportTo()` 经 `PoiArrival.cancel()` 释放在途前奏/定帧 shot） | P0 |
| goal | `explore-restore` | `{n, total}` | 显式 · `areas/ExploreProgress` 构造器（localStorage `world-explore-v1` 跨会话进度还原为非零时挂载即打）。[CC-FXN-C4] 随行加法：新增 goal 族承载 F6 探索计数 n/12（rubric F6 / FXN-BR G5 先遣版），schemaVersion 不动 | P0 |
| goal | `explore-progress` | `{id, n, total}` | 显式 · `areas/ExploreProgress.discover()`（Areas boundingIn 接线：首次发现某 POI 触发圈去重后计数 +1，chip 呈现同拍；重复进圈/已持久点零事件） | P0 |
| goal | `explore-complete` | `{total}` | 显式 · 同 discover()（n 达 total 的跨越沿至多一次；还原到满值不补打） | P0 |
| goal | `world-quest` | `{action: 'shown' \| 'reached' \| 'chain-complete' \| 'collapsed' \| 'expanded', step, targetId, elapsedMs}` | 显式 · `areas/QuestLine`（G4 目标线 v0 主漏斗——首两分钟流失点分析）：激活（ritual = 首个 `world-transform to='car'`；非 ritual = 挂载即激活）与每次链推进出 `shown`；进未完成主链站触发圈（Areas boundingIn 同拍）`reached`（顺序外到站合法照打）；主链五站集齐 `chain-complete`；chip 折叠开合 `collapsed`/`expanded`（localStorage `world-quest-collapsed-v1` 记忆偏好）。step = 相关站 1 起步位，elapsedMs = 距激活壁钟毫秒。[CC-FXN-C5] 随行加法：新增承载 FXN-BR G4 冻结稿事件（`{step, targetId, action, elapsedMs}` 原样），schemaVersion 不动 | P0 |
| challenge | `world-speedtrap` | `{kmh, isRecord}` | 显式 · `city/SpeedTrap.ts` 测速区驶离沿（kmh = 本次通过最高速整数；isRecord = 刷新会话纪录；每次通过至多 1 条 + 5 设计秒冷却兜底）。[CC-FXN-C6] 随行加法：新增 challenge 族承载 G9 测速牌（FXN-BR §4 G9 冻结稿——车进区实时显示 km/h、驶离显示会话最高、≥90 一次性闪 SPEED DEMON、慢车吐槽 60s 频控），schemaVersion 不动 | P0 |
| perf | `quality-auto-drop` | `{from, to, avg, low1}` | 显式 · index.ts 装配段 HUD 节拍（O1 滞回窗触发点：FpsMeter 滑窗连续 3 设计秒 avg<30 或 low1<20 → `Quality.changeLevel` 降一档，只降不升 + 20s 冷却；仅 ritual driving 态评估——robot_idle/transforming 恒等合同零涉及；`?quality=` 显式深链禁用自动档，事件不可能出现；avg/low1 为触发拍读数，一位小数）。[CC-PERF-C2-B1] 随行加法：新增 perf 族承载自动降档取证（PERF-BR O1 / perf rubric P5 确认层随 DriveFeedback `[data-world-quality]` toast 同拍），schemaVersion 不动 | P0 |
| ux | `hint-shown` | — | 显式 · Reveal.showHint()（car_ready 自动浮现） | P0 |
| ux | `hint-dismissed` | `{by: 'timeout' \| 'input'}` | 显式 · Reveal.hideHint() 两类调用点区分：HINT_FADE_DELAY 到期 → `'timeout'`；用户/状态收回（H/「键位」按钮收起、robot_idle/transforming）→ `'input'`。[CC-FXN-C1] 随行修订：driving 不再即隐——首驶重开一个完整阅读窗后走 `'timeout'` | P0 |
| ux | `hint-recall` | `{via: 'key' \| 'button'}` | 显式 · Reveal.toggleHint()（键位卡再唤出：H/? 键 → `'key'`；`[data-world-hint-recall]` 按钮 → `'button'`）。[CC-FXN-C1] 随行加法（GAP-08 键位召回），schemaVersion 不动 | P0 |
| ux | `esc-menu-open` | — | **壳桥** · index.astro ESC 菜单 showModal 处 dispatch（§3.5） | P0 |
| ux | `idle-30s` | — | 沿检测 · index.ts 装配段低频节拍：driving 态连续 30s 零驾驶意图（accelerating/steering/braking/boosting 全 0 且 nipple 非 active）打一条；有输入即重置计时，可再打（每静默期至多 1 条）。[CC-FXN-C5] 随行注记：新增消费方 `QuestLine.idleNudge()`（入账同拍调用）——打点条件与语义不变 | P0 |
| ux | `idle-nudge` | `{targetId}` | 显式 · `areas/QuestLine.idleNudge()`（`idle-30s` 沿检测同拍消费：driving 空闲 30 设计秒 → chip 脉冲 + 「往光柱方向开」nudge 行，驻留至下一个驾驶意图 `clearNudge()` 收起；`idle-30s` 先入账、本事件随后同拍——seq 序稳定；主链完成后无目标可指，静默不打）。[CC-FXN-C5] 随行加法：L7 空闲主动引导的可观测面，schemaVersion 不动 | P0 |
| ux | `world-audio` | `{enabled, source: 'auto' \| 'user'}` | 显式 · `audio/WorldAudio.ts`（首手势解锁沿（AudioContext 达 running）→ `'auto'`，enabled = 非静音记忆态；`[data-world-audio]` 静音钮切换 → `'user'`，enabled = 切换后开声态）。[CC-AUD-C1] 随行加法：G3 合成音效层可观测面（解锁 ≠ 出声两状态位分离，调研 §3.2-3），schemaVersion 不动 | P0 |
| ux | `minimap-open` | `{via: 'key' \| 'button'}` | 显式 · `ui/Minimap.openPanel()`（M 键动作 → `'key'`；HUD「地图」钮 → `'button'`——触屏唯一入口）。[CC-NAV-C1] 随行加法（GAP-12 POI 发现性 P0 / 董事会 R5-impl-gate DP-1 传送式），schemaVersion 不动 | P0 |
| ux | `minimap-close` | `{via: 'key' \| 'esc' \| 'button' \| 'teleport'}` | 显式 · `ui/Minimap.close()`（M 再按 `'key'` / Esc capture 段吞键 `'esc'`——壳 ESC 菜单双响拆弹，NAV 调研 §3.1 / 关闭钮 `'button'` / pin 传送同拍 `'teleport'`）。[CC-NAV-C1] 随行加法 | P0 |
| ux | `minimap-teleport` | `{id, distanceM}` | 显式 · `ui/Minimap.teleportTo()`（两段式第一段：pin 点击/键盘激活 → 传送至该楼 parkingBay，`distanceM` = 传送前直线距离取整；第二段 E 确认走既有 `world-poi`——`poi-bounding-in`/explore/quest 漏斗零旁路。不动 Respawns，R 键语义零漂移）。[CC-NAV-C1] 随行加法 | P0 |
| error | `pageerror` | `{message}` | 显式 · SessionTimeline 自挂 `window` `error` + `unhandledrejection` 监听（message 截 200 字符；dispose 摘除） | P0 |
| error | `context-lost` | — | 显式 · SessionTimeline 自挂 canvas `webglcontextlost`（canvas 经 attach 参数传入；WebGPU device.lost 接线归 §9 开放问题） | P0 |

> **[CC-PERF-C2-B0] counters 随行修订（PERF-BR O10 常驻层，加法不升版）**：`counters.longFrames` = 墙钟帧间隔 >50ms 的帧数（阈值与 WS-PERF-01 / CITY-PERF-01 采样 `STALL_MS = 50` 同源，跨证据面可互证）。**不是事件 type**——不占本表白名单、不入 ring（逐帧 log 会灌爆 ring：SwiftShader 下每帧都是长帧），由装配段 tick（index.ts，复用 FpsMeter 墙钟间隔）一次比较后经 `session.countLongFrame()` 直接递增；跨暂停超长间隔经 `FpsMeter.reset()` 天然不计。dump / dispose `console.table` 自然承载。O10 的 #debug 门控层（分段帧时剖析）见 §5.2 随行行。

### 3.5 壳桥：`world-obs` CustomEvent（冻结）

壳（`src/pages/index.astro`）不 import world 模块、window 导出面只读——壳侧埋点经 DOM 事件桥：

```js
// 壳侧（ESC 菜单 showModal 处，一行）：
window.dispatchEvent(new CustomEvent('world-obs', { detail: { type: 'esc-menu-open' } }));
```

- SessionTimeline 构造时挂 `window` `world-obs` 监听、dispose 摘除。
- **只放行 ux / error 两族**的白名单 type；其余族/未知 type 丢弃 + `console.warn`（防桥被当万能注入面）。
- `detail.data` 按 §3.2 扁平规则清洗。
- world 未挂载时壳 dispatch 无人监听、自然丢失——可接受（ESC 菜单在 world 就绪前本就不可达）。

### 3.6 版本与「埋点随行」纪律

1. **加法不升版**：新增事件 type / data 字段 → 更新 §3.4 表（本文件同 PR 修订）+ 接线，`schemaVersion` 不动。
2. **破坏性 +1**：改名 / 删除 type 或字段 / 改语义（如 funnel 步定义、时基）→ `schemaVersion` +1，且 function-smoke.mjs / 消费方同 PR 适配。
3. **埋点随行是合并门**：功能 PR 新增用户可感交互而无对应白名单事件 + 接线 + §3.4 表行 → 打回（顾问 §5 禁止清单第 3 条的执行面）。审计方（CC-AL-FXN）按本表核对 F7「白名单事件接通率」。
4. 在途分支（VEH-VIEW / TRANS-FX / CAM）合流时按「预留」行补接即可，不触发版本变更。

---

## 4. 导出面与 dispose 合同

### 4.1 三通道总表

| 通道 | 消费者 | 形态 | 生命周期 |
|------|--------|------|----------|
| `window.__worldSession` | e2e / CI / 审计 | **只读单方法** `{ dump(): SessionDump }`（`dump()` 可 `JSON.stringify`） | index.ts 装配段与 `__worldSpike` 同段挂载；dispose 与 `__worldSpike` 同段 `delete`（global 声明同文件补 `__worldSession?`） |
| `#debug` 面板 | 调参 / 审计 / 复现 | §5（事件 tail + 导出按钮） | debug-only 动态分包 |
| dispose 摘要 | 人工调试 | `console.table(funnel)` + `console.table(counters)` + 一行 `[session] <sessionId> 事件 N 条（丢弃 M）` | dispose 时一次 |

### 4.2 dispose 时序合同（冻结）

```
facade（pagehide 非 bfcache / astro:before-swap / 显式卸载）
  → instance.dispose()（index.ts）
      1. delete window.__worldSession   ← 与 __worldSpike/__worldSpikeGame/__worldTransform 同段
      2. …既有各系统 dispose 照旧…
      3. game.dispose() 首段 → session.dispose()：
           a. log('dispose')            ← 终帧事件入 ring（此刻各系统读数已定格）
           b. console.table 摘要一次     ← 人读通道
           c. 摘除 window error/unhandledrejection/world-obs、canvas contextlost 监听，
              off 全部 game.events 镜像订阅
           d. 置 disposed（幂等：二次调用零输出零副作用）
```

- **bfcache**：`pagehide` 且 `event.persisted` → facade 不 dispose（既有 L120 语义）→ session 存续、恢复后同 sessionId 继续。不为 bfcache 单独打事件（Phase B 如需可加 `page-restore`，加法）。
- **e2e/审计消费纪律**：`dump()` 必须在触发卸载**之前**调用取证（window 面删除即不可达）；需要含 `dispose` 事件的终态 dump 时，改由 CI 用例持有引用不可行——**放弃**，`dispose` 事件仅服务 console 摘要与 debug 面板场景，冒烟/审计断言不依赖它。
- **顺序保证**：`session.dispose()` 先于 `inputs/rendering` 释放执行（Game.dispose 首段），保证摘要打印时 renderer 尚未拆除、无级联异常。

---

## 5. `#debug` 面板 v0（CC-OBS-C2；与 CAM F7 合板）

### 5.1 入口与分包红线

- 入口沿用 index.ts 既有判断 `location.hash.includes('debug')`（L265 分支）：命中时 `const { DebugPanel } = await import('../debug/DebugPanel')`（新目录 `src/lab/world/debug/`），构造 `new DebugPanel({ game, fps })`（复用装配段既有 FpsMeter 实例，不重复建表）。
- Vite 动态 import 自动独立 chunk：**无 `#debug` 的生产路径零请求零字节**（CAM-DES F7 同款红线）；audit-budget 门零改动（debug chunk 不在首屏/壳清单）。
- v0 仅挂载时判定（与现状 `__worldSpikeGame` 同口径）；运行中 hashchange 动态开合归 Phase B。
- `instance.dispose()` 时 `panel?.dispose()`（移除 DOM + tick 订阅）。

### 5.2 内容 v0 与 DOM 契约（冻结）

| 区 | 内容 | 数据源 | 刷新 |
|----|------|--------|------|
| 状态行 | `state`（host `data-world-state`，无 ritual 显示 `—`）· `drive-view`（host `data-drive-view`，缺席 `—`）· `shot`（当前 shot id，CAM 合流前 `—` 留位） | DOM 属性 / View | 0.25s |
| 性能行 | `fps avg / 1% low` · `drawCalls` · `triangles` | FpsMeter.read() · renderer.info | 0.25s |
| 分段帧时行 | [CC-PERF-C2-B0] 随行加法（PERF-BR O10 #debug 门控层）：`frame ms`（全帧）+ 7 段（anim / physics / sync / camera / areas / render / hud，按 tick order 段表）各显 `avg / max`（ms，0.25s 窗）——卡顿归因到段（physics 3 / render 998 含 Q0 reflector 镜像 / POI 检测 8–10） | FrameProfiler（`debug/FrameProfiler.ts`：tick 总线 order 检查点 + performance.mark/measure，随 debug 分包，生产路径零字节；measure 发完即清缓冲） | 0.25s |
| 玩家行 | `speed`（km/h，HUD 同公式）· `pos x/y/z`（一位小数） | game.player | 0.25s |
| 事件 tail | 最近 **10** 条：`#seq t(ms) type {data}`（新在下） | `session.tail(10)`（§3.3 内部游标） | 事件驱动 + 0.25s 兜底 |
| 导出 | `[data-debug-export]` 按钮：`JSON.stringify(session.dump(), null, 2)` → Blob 下载 `session-<sessionId 前 8 位>.json` | session.dump() | 点击 |
| CAM F7 留位 | 空分区容器 `[data-debug-cam]`——CAM F7（机位读数 + shot JSON 导出）在此容器内扩展，**禁止另起第二块 overlay** | — | — |

DOM 契约（e2e SEL 对齐）：根 `[data-debug-panel]`（`position:fixed` 右上、等宽字体、半透明底、`z-index` 高于 ritual 覆盖层、**不遮 CTA/HUD 热区**——右上角与左下 CTA/摘要区天然错开）；`pointer-events: none`，仅导出按钮 `pointer-events: auto`。刷新走 `ticker` tick order 999（HUD 同拍）+ 内部 0.25s 节流。

### 5.3 红线

1. **只读 + 导出**：面板不含任何改状态控件（无 teleport/无重生/无画质切换/无相机接管——free 相机 G5 红线不从 debug 后门破窗）。
2. 零新依赖；样式内联注入（Reveal.injectStyles 先例），不进壳样式表。
3. 面板异常不得影响游戏路径（构造/刷新全 try-catch，静默降级为不渲染 + console.warn 一次）。

---

## 6. CI 工件（CC-OBS-C2 + score-loop 加法）

### 6.1 工件总表

| 工件 | 产出者 | 语义 | 门 |
|------|--------|------|-----|
| `test-results/session-dump-<case>.json` | 新 e2e 用例（§7）：`page.evaluate(() => window.__worldSession.dump())` → 落盘 + `test.info().attach()` | 漏斗/事件序原始证据（`<case>` ∈ `funnel` / `deep-link` / `q2` …kebab-case） | 证据非门 |
| `test-results/function-smoke.json` + stdout 末行 `FUNCTION_SMOKE=<0-100>` | 新 `scripts/function-smoke.mjs`（§6.2；score-loop.mjs 同构 sibling，只读 dump 不跑浏览器） | **CI 冒烟分 = 哨兵**：链路存在性/顺序性，不掺时长 | 软门（OBS annotation，首个 Loop 观察后再议转硬） |
| `test-results/city-perf-evidence.jsonl` | CITY-PERF-01/02（`e2e/cyber-city-perf.spec.ts`，CC-PERF-C1 已落地；正本 = `cyber-city-perf-test-plan.md` §2/§3，行 schema §2.5；秤归 `cyber-city-perf-rubric.md`；含 `__worldSession.dump()` 落盘 `session-dump-city-perf.json` + 附档职责） | 性能 CI 证据包（下界哨兵） | 软门（p95<50ms 沿用） |
| `docs/research/cyber-city-function-rubric-score.json` | **仅 CC-AL-FXN 审计登记**（契约与 visual score JSON 同构：score/dimensions/notes/溯源） | 功能登记分机读位 | 挡登记 |
| `docs/research/cyber-city-perf-rubric-score.json` | 仅审计/human-gate 回填登记 | 性能登记分机读位 | 挡登记 |
| `test-results/quality-score.json` | score-loop.mjs（§6.4 加 northStar 只读块） | 综合分 + 北极星汇总 | 既有 |

### 6.2 `scripts/function-smoke.mjs` 算法（冻结）

**输入**：`--dump <path>` 可重复（缺省 `test-results/session-dump-funnel.json`）；多 dump 取**并集**（任一命中即命中）。`schemaVersion !== 1` → 退出 2。

**计分（0–100，纯存在性/顺序性，禁止读时长绝对值）**：

| 块 | 权重 | 规则 |
|----|:---:|------|
| 漏斗完整性 | 70% | 七步 × 10%。步 *i* 命中 = `funnel[i] !== null` **且** 对 ∀ *j* < *i*（按 §3.2 声明序）：`funnel[j] !== null && funnel[j] ≤ funnel[i]`（同帧相等合法——car_ready 同帧 driving 是既有契约；前步缺失或时序倒挂则本步不计） |
| 交互面覆盖 | 30% | 四项 × 7.5%：events 中存在 ≥1 条 `cone-hit` / `respawn` / `world-poi` / `world-drive-view` |

**knownGaps 注记**：脚本内常量表登记「事件 → 依赖任务」（v1 初始：`world-drive-view` → VEH-VIEW 合流）；未命中且在表内 → 写入输出 `knownGaps` 数组，**只注记不改分**（哨兵看趋势，分母跨轮恒定）。依赖合流后从常量表删行（加法维护）。

**输出**：人读明细表 + `test-results/function-smoke.json`（§6.3）+ 末行机读 `FUNCTION_SMOKE=<0-100 一位小数>`。

**退出码**（score-loop 同构）：0 = 计算完成（分数高低不影响）；`--min N` 且分 < N → 1；输入缺失/schema 不符 → 2（基础设施问题区别于低分）。

### 6.3 `function-smoke.json` schema v1（冻结）

```json
{
  "schemaVersion": 1,
  "computedAt": "2026-08-27T00:00:00.000Z",
  "score": 92.5,
  "funnel": {
    "reveal":           { "hit": true,  "t": 6210 },
    "robotIdle":        { "hit": true,  "t": 7360 },
    "transformStart":   { "hit": true,  "t": 9100 },
    "carReady":         { "hit": true,  "t": 10150 },
    "driveStart":       { "hit": true,  "t": 10150 },
    "firstPoiIn":       { "hit": true,  "t": 24400 },
    "firstPoiInteract": { "hit": true,  "t": 26800 }
  },
  "coverage": { "cone-hit": true, "respawn": true, "world-poi": true, "world-drive-view": false },
  "knownGaps": ["world-drive-view（VEH-VIEW 未合流）"],
  "dumps": ["test-results/session-dump-funnel.json"],
  "sessions": [{ "sessionId": "…", "events": 132, "dropped": 0, "backend": "webgl2", "vehicle": "physics" }]
}
```

（`t` 为原始 dump 值，仅供人读定位，**不参与计分**；字段加法不升版、破坏性 +1，与 §3.6 同纪律。）

### 6.4 `quality-score.json` northStar 块（score-loop.mjs 加法，冻结）

综合分五维权重（25/15/20/25/15）**零改动**（跨轮可比性优先）；`COMPOSITE_SCORE` 末行语义零改动。score-loop.mjs 尾部**只读汇总**追加：

```json
"northStar": {
  "visual": 82,
  "function": null,
  "perf": null,
  "composite": 78.4,
  "sources": {
    "visual":   "docs/research/cyber-city-visual-rubric-score.json",
    "function": "docs/research/cyber-city-function-rubric-score.json（缺失）",
    "perf":     "docs/research/cyber-city-perf-rubric-score.json（缺失）"
  }
}
```

- `visual`/`function`/`perf` 各读对应登记 JSON 的 `score`；缺失 = `null` + sources 注记「（缺失）」——**缺失明示，禁止填估值**（禁止清单第 8 条同构）。
- `composite` = 本文件 `composite` 字段镜像（单块自足，供父代理一眼四数）。
- 功能/性能是与综合分**并列**的北极星维度，不折算进五维；`FUNCTION_SMOKE` 冒烟分**不出现**在 northStar（哨兵不入登记面）。

### 6.5 四层分工（谁也不许替谁签字）

| 层 | 测什么 | 门 |
|----|--------|-----|
| e2e 52/52 | 状态机可达、DOM 契约、八出口不破 | **挡合并**（既有，不降） |
| function-smoke | 漏斗完整性 + 交互事件覆盖（读 dump） | 软门（首个 Loop 观察，稳定后再议转硬） |
| 功能 rubric | 2 分钟体验合格（真人脚本 + 锚点） | **挡登记**（AL-FXN 独立，正本归 CC-FXN-DES） |
| 性能双轨 | CI 证据包（下界）+ 真机 human-gate（判定） | **挡登记**（顾问 §3） |

---

## 7. 验收用例（CC-OBS-C2 新 spec `e2e/cyber-city-observability.spec.ts`，world-chromium project；既有 52 用例零改动）

| # | 用例 | 断言要点 |
|---|------|----------|
| CITY-OBS-01 | 漏斗全走 @funnel | 生产 `/` 走 CITY-E2E-03 同款动线到 driving，续驾至撞锥桶 + R 重生 + 进 POI 触发圈 + E 进站（进站跳转前取证）→ `dump()`：`schemaVersion === 1`、funnel 七步非 null 且单调不减、`events` seq 严格递增、counters 与事件互证 → 落盘 `session-dump-funnel.json` + attach |
| CITY-OBS-02 | 导出面契约 | 挂载后 `window.__worldSession` 存在且**仅** `dump` 一键；`dump()` 可 `JSON.stringify`；env 字段齐（backend ∈ webgpu/webgl2、vehicle ∈ physics/kinematic）；连续两次 `dump()` 返回不同对象引用、内容一致（纯快照） |
| CITY-OBS-03 | dispose 合同 | 触发真实离页（`page.goto` 他页，非 bfcache）前后：卸载前 `dump()` 成功；卸载过程 console 出现 `[session]` 摘要一行 + `console.table` 两次；（同页断言 window 面删除不可行——离页后上下文已换，删除语义由 CITY-OBS-02 的挂载对称性 + 代码评审保证） |
| CITY-OBS-04 | ring 溢出 | 经 `world-obs` 桥灌 520 条 ux 族事件（`hint-shown`）→ `dump()`：`events.length ≤ 500`、`dropped ≥ 20`、`events[0].seq > 1`、seq 连续、funnel/counters 不受污染；再 dispatch 1 条白名单外 type → 不入 events、console.warn 出现 |
| CITY-OBS-05 | #debug 面板 | `/#debug`：`[data-debug-panel]` 出现、`[data-debug-tail]` 含最近事件、`[data-debug-export]` 点击触发 download 事件且文件名 `session-*.json`、面板内**零** button/input 除导出按钮（只读红线机器断言）；无 `#debug`：debug chunk 零网络请求（CITY-E2E-01 零字节断言同构） |
| CITY-OBS-06 | 冒烟脚本 | `node scripts/function-smoke.mjs --dump <OBS-01 产物>`：退出码 0、末行 `FUNCTION_SMOKE=` 格式、`function-smoke.json` schema 合法、OBS-01 动线下漏斗 70 分全额 + coverage 中 cone-hit/respawn/world-poi 为 true（shell 断言用例，可并入 CI 步骤而非 playwright） |

补充纪律：OBS 用例全程监听 `pageerror` 断零（既有惯例）；SwiftShader 下只断存在性/顺序性，**禁止**对 t 值设阈值。

取证面登记（[CC-OBS-H2]，2026-08-29）：CITY-OBS-03 的「卸载过程 console」不再经 `page.on('console')`（CDP）收账——headless-shell 151 起卸载期 console 不送达监听器（机制探针见 `docs/research/cc-loop-audit-aud-c1.md` §8.3：`pagehide(persisted=false)` 正常、dispose 照跑，被击穿的是取证方法而非产品语义）。改为测试侧 init script 包裹 `console.table` / `console.info` 落 `sessionStorage`，离页后在同源目标页回读。**断言口径（table 恰两次 + `[session]` 摘要恰一行）与实现（`SessionTimeline.dispose`）零变更**；事件白名单与 `schemaVersion` 不动。

---

## 8. 实现切分与文件域

| PR | 内容 | 文件域 | 依赖 |
|----|------|--------|------|
| **CC-OBS-C1** | SessionTimeline + 镜像/显式接线全量（§3.4 P0 行）+ `__worldSession` window 面 + 壳桥 dispatch + dispose 合同 | 新 `core/SessionTimeline.ts` · `core/Game.ts`（构造/dispose 各一段）· `index.ts`（window 面 + cone-hit/idle-30s 沿检测 + deep-link）· `Reveal.ts` / `TransformSystem.ts` / `Player.ts` / `Areas.ts` 各数行 · `index.astro`（ESC 桥一行） | 无——**立即可做，一切登记的前置** |
| **CC-OBS-C2** | `#debug` 面板 v0 + `scripts/function-smoke.mjs` + `e2e/cyber-city-observability.spec.ts`（CITY-OBS-01…06）+ score-loop northStar 块 | 新 `debug/DebugPanel.ts` · 新脚本 · 新 e2e spec · `score-loop.mjs`（尾部加法） | OBS-C1 |

**热点纪律**：`Reveal.ts` 是 VEH-VIEW（hint 文案）与 FXN-C1 双热点——OBS-C1 对 Reveal 只加 log 行、不动文案与 DOM，冲突面最小化；若 VEH-VIEW 先合流，`world-drive-view` 镜像行自动生效（§3.4 预留行零补丁）。每 PR 过同一套硬门：e2e 52/52 · LHCI 不降 · `ritual_idle` 恒等 · audit-budget 零 ❌ · reduced-motion 双轨 · CITY-03 循环动画配额 · **埋点随行**。

---

## 9. 开放问题（Phase B / 显式欠账）

1. **RUM 接口位**：SessionTimeline 预留的唯一外延 = `dump()` 的 JSON 形状；若 Phase B 决策接 PostHog/Plausible，做单向 adapter（dump → 批量上报），本件零改动。
2. **WebGPU device lost**：`context-lost` P0 仅接 `webglcontextlost`；WebGPU 路径需经 `rendering` 拿 device.lost promise（渲染层接缝），OBS-C1 尽力接、接不上列欠账入 PR 描述。
3. **idle-30s 与 attract 模式**：当前仅记录；FXN-C4/F6 若做 attract 演出，消费本事件（观测先行、演出后至）。[CC-FXN-C4] 回填：本批落地的探索计数（goal 族）**不消费** `idle-30s`——空闲引导/attract 仍开放，注记保留。[CC-FXN-C5] 回填：G4 目标线 v0 已消费 `idle-30s`（`QuestLine.idleNudge()` 入账同拍——chip 脉冲 + 下一站 nudge，`idle-nudge` 埋点随行）——「观测先行、演出后至」闭环，本注记使命完成。
4. **function-smoke 转硬门**：观察 ≥1 个完整 Loop 的稳定性（SwiftShader 波动、POI 进站跳转时序）后由父代理拍板；转硬前恒为 OBS annotation。
5. **`hint-shown`/`hint-dismissed` 的壳 HUD 通道**：`[data-ws-hint]`（壳静态 hint）在 ritual 模式挂载即被置 dismissed（index.ts L159），P0 不接；若后续壳 hint 恢复活跃，经 `world-obs` 桥补接（ux 族，加法）。

---

*CC-OBS-DES · 2026-08-27 — SessionTimeline（挂 Game、≤2KB gzip、ring 500 + 聚合独立）+ dump schema v1 与 27 事件白名单接线表冻结 + `world-obs` 壳桥 + dispose 三步幂等合同 + #debug 只读面板（CAM F7 合板留位）+ function-smoke 70/30 哨兵算法与 northStar 只读块 + CITY-OBS-01…06 验收。只文档，零 src/ 改动。*
