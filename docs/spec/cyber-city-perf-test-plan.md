# CITY-PERF 测试方案：`/` 城市档性能证据包 + Q2 降档存在腿（CC-PERF-DES 正本）

> 执行模型自报：**claude-fable-5-thinking-xhigh**

| 项 | 内容 |
|----|------|
| Task | **CC-PERF-DES**（Loop 8 性能扩展）——CITY-PERF-01/02 的 spec 级设计冻结，交 CC-PERF-C1 照单实现 |
| 分支 | `cursor/cc-perf-des-spec-1d6f`（base：`main` @ `cf76d35`） |
| 日期 | 2026-08-27 |
| 上游 | WS-PERF-01 `e2e/world-spike-perf.spec.ts`（成熟模式正本：独占殿后、录像 off、环境指纹、软门不阻断——本方案照抄其骨架换对象）· e2e-test-plan §5.8（WS-PERF-01 用例条目）· 顾问报告 `cyber-city-fxn-advisor-consult.md` §3.3（CI 侧采样方案冻结大纲）· **PERF-RS `cyber-city-runtime-perf-survey.md` §3.4/§3.5（已合 PR #59：`/` vs `/world-spike/` 差异表 + 七步采样协议设计输入 + project 拓扑两案）**· **PERF-BR `cyber-city-perf-optimization-features.md` O4（已合 PR #60：drawCalls/triangles 哨兵 + 「每优化 PR 附前后对照」流程约束）**· 可观测规格 `cyber-city-observability.md` §3.2/§6.1（dump schema 与 `city-perf-evidence.jsonl` 工件行）· 性能 rubric `cyber-city-perf-rubric.md`（同批姊妹件，门语义正本）· 代码事实 `src/lab/world/index.ts`（`__worldSpike`/`__worldSession`/HUD 接线）· `playwright.config.ts`（project 布局） |
| 消费方 | **CC-PERF-C1**（实现 PR）· CC-AL-PERF（审计取证对照）· CI（证据归档 + 软门哨兵） |
| 红线 | 既有全量 e2e（tip 时点 **64 例 / 12 文件 / 五 project**）零改动零降级 · WS-PERF-01 零改动 · SwiftShader 下**禁止**任何时长/帧率数值硬门（下界哨兵 only）· 采样用例独占串行（并发 3D 上下文污染帧间隔）· `src/` 零改动（纯测试侧交付） |

---

## 0. 结论先行

1. **两个新用例，一新 spec 文件**：`e2e/cyber-city-perf.spec.ts` 承载 **CITY-PERF-01**（`/` 城市档帧率证据包，WS-PERF-01 同构）与 **CITY-PERF-02**（`?quality=2` 降档核心路径存在腿，rubric P5 CI 哨兵）；归 `world-perf-chromium` project（殿后独占），project 补 `fullyParallel: false` 钉死单 worker 顺序。
2. **RS 案 A 的文件名修正**（DES 定稿裁决）：RS §3.5 案 A 提议文件名 `city-perf.spec.ts` + 两行 config——但该名**既不命中 `desktop-chromium` 的 testIgnore（`cyber-city.*` 前缀不匹配，正则实测 false）也不命中任何 testMatch 收编前的 project**，会漏进 desktop-chromium 并行池，采样纪律直接破产。定稿改为 **`cyber-city-perf.spec.ts`**（家族前缀保住 desktop-chromium 既有 ignore）+ `world-chromium` testMatch 负向前瞻排除 + `world-perf-chromium` 收编（§1.2，三处 config 改动，正则逐条实测）。
3. **门分层冻结**（§4）：CITY-PERF-01 硬断言 = 「链路活着」（挂载/变形/驾驶/读数存在性，挡合并）；软门 = p95 帧间隔 <50ms（OBS annotation + 证据标记，不阻断——SwiftShader 下预期不达标）；CITY-PERF-02 全部为存在性/顺序性断言（**挡合并**——降档路径可达性在软渲染下可诚实判定）。真机 60/30/45/8s 判定恒归 human-gate（rubric §3.1），对照表见 §5。
4. **CI 单腿 + 指纹归因**（RS §3.3 物理事实采纳）：不做 `?gl=1` 双后端腿——SwiftShader WebGPU 有 `createBuffer` 缺陷且实测自动回退 webgl2，证据以 `__worldSpike.backend`（实际后端非探测值）归因；双后端差异恒归真机。分档矩阵采样（`?quality=0|1|2` × 后端）**不入 v1**（殿后尾巴失控），列 v1.1 裁决点（§7）。
5. **证据三路落盘**：`test-results/city-perf-evidence.jsonl`（跨 commit 趋势归档，观测规格 §6.1 冻结行）+ 报告附件 `city-perf-evidence.json` / `session-dump-city-perf.json`（单 run 审计）+ HUD 截图 `city_perf_hud_after_drive` 入库 `docs/spec/assets/e2e-integration/`（三件套纪律，WS-PERF-01 同构）。**drawCalls/triangles 首轮即建城市档负载基线**（环境无关、唯一可跨轮硬比的 CI 读数，RS §3.2）——v1 只留档不设门，回归护栏阈值（BR O4 提议首采 +20% 定标）积累两三轮基线后 v1.1 再议。
6. **动作脚本对齐真机口径（脚本同源铁律）**：CI 驾驶脚本 = 真机 human-gate 城市档动作脚本同源（2 次急转 + 撞道具尝试 + Shift boost 直线），两轨读数同负载形态才可互证；城市档锥桶已撤场（CC-L1 A2），「撞道具」= 隔离墩 `StreetProps.hitCount` 承接，CI 侧命中为 best-effort **不作硬断言**（§2.3 注 c）。

---

## 1. 文件与 project 布局

### 1.1 新 spec 文件

`e2e/cyber-city-perf.spec.ts`——与 `world-spike-perf.spec.ts` 保持**相互独立、互不 import**（两 spec 镜像工具函数的既有纪律）；dump 消费侧接口镜像 `cyber-city-observability.spec.ts` 的最小面声明。

### 1.2 `playwright.config.ts` 三处修改（本方案冻结，实现照抄；正则均已实测）

| 位置 | 现值 | 改为 | 理由 |
|------|------|------|------|
| `world-chromium` `testMatch` | `/world-spike\.spec\.ts\|cyber-city.*\.spec\.ts/` | `/world-spike\.spec\.ts\|cyber-city(?!-perf).*\.spec\.ts/` | 新文件名命中既有 `cyber-city.*` 通配——负向前瞻把 perf spec 让渡给殿后 project，其余 cyber-city 族（主 spec / feedback / observability）归属不变（实测：perf false / 其余 true） |
| `world-perf-chromium` `testMatch` | `/world-spike-perf\.spec\.ts/` | `/world-spike-perf\.spec\.ts\|cyber-city-perf\.spec\.ts/` | 收编新 spec，殿后独占语义与 visual-chromium 依赖链零改动 |
| `world-perf-chromium` 并行度 | 无覆盖（吃全局 `fullyParallel: true`） | **`fullyParallel: false`** | project 从单文件变双文件后，全局 2 worker 会并发跑 WS-PERF-01 与 CITY-PERF-01，两个 3D 采样上下文互相挤兑 = 读数作废（batch 1 并发挤兑结论 + visual-chromium 先例同款处置；RS §3.5 拓扑警告同源） |

`desktop-chromium` **零改动**——`cyber-city-perf.spec.ts` 命中其既有 testIgnore `cyber-city.*`（家族前缀命名的意义所在，§0-2 修正的另一半收益）。

### 1.3 运行纪律（WS-PERF-01 文件头三条全文继承）

- 独占殿后串行（帧间隔采样对并发 3D/测试负载最敏感）；
- 录像显式关闭 `test.use({ video: 'off' })`（Playwright 录屏 CPU 开销系统性拉低读数）；
- 证据以 JSON + HUD 截图留档，不以录像留档。

## 2. CITY-PERF-01：`/` 城市档帧率证据包

### 2.1 定位

对生产 `/`（城市档，facade 自动挂载路径）每次全量 e2e 留档：帧率读数 + 帧间隔分布 + 环境指纹 + 会话 dump——真机录测前后可对照的**软件光栅化硬下界**。不做 60/30/45 数值判定（判定权威 = human-gate，rubric §1 铁律 2）。与 WS-PERF-01 的分工：灰盒 `/world-spike/` 证据包继续常驻（试验场负载基线），本用例补「登记对象 `/`」的缺口（RS §3.4 差异表：入场路径/变形负载/城市全量场景/工件四面均不同）。

### 2.2 用例流程（冻结）

| 步 | 动作 | 校准 |
|----|------|------|
| ① | `page.goto('/')` → host `[data-world-host]` `data-world-state` 落 `robot_idle` | 超时 210s（OBS spec 同校准：SwiftShader 慢动作全链 75–110s + 余量）；**同时记录 `timing.loadToRobotIdleMs`**（goto resolve 起算墙钟）→ annotation 采集不判定（CITY-E2E-03 先例） |
| ② | 环境指纹采集 | UA / hardwareConcurrency / dpr / `'gpu' in navigator` / viewport + `__worldSpike.backend`（**实际后端**，防 SwiftShader WebGPU 回退假象）/ `.vehicle` + dump `env.quality`；**CI 单腿**，不加 `?gl=1`（§0-4 裁决） |
| ③ | 点击 CTA `[data-world-transform]` → `car_ready` | 超时 210s；记录 `timing.transformToCarReadyMs`；变形段计入取证窗口（真机口径「变形+驾驶」同型） |
| ④ | 脚本化驾驶 ≥20s 墙钟（§2.3 动作表）；首先硬断言 `state().speedKmh > 2`（轮询 60s） | W 落下即 `driving`（既有契约）；速度断言 = 「真实 CDP 按键 → 意图 → 物理 → 遥测」闭环活着 |
| ⑤ | 读数采集：HUD `[data-ws-fps]` 匹配 `/^\d+ \/ \d+$/`（放宽等待 30s，软渲染 HUD 节拍 ~5s 一拍）+ `__worldSpike.fps()/info()/state()` 互证 | `fps().avg > 0` 硬断言（FpsMeter 样本 <10 时返回 0——驾驶 20s 后必然 ≥10 样本，断言同时覆盖此契约）；`info()` 的 drawCalls/triangles 入证据（城市档负载基线首轮建档） |
| ⑥ | 驾驶不间断中 rAF 帧间隔采样：≥5s 且 ≥6 帧，封顶 45s；统计 p50/p95/max/stall(>50ms) | WS-PERF-01 采样器逐行同构（SAMPLE_MIN_MS 5000 / SAMPLE_MIN_FRAMES 6 / SAMPLE_CAP_MS 45000 / STALL_MS 50——两档读数同标定才可横比） |
| ⑦ | `window.__worldSession.dump()` 取证：`schemaVersion === 1`、`funnel.robotIdle/carReady/driveStart` 非 null 且单调不减 | 卸载前取证纪律（观测规格 §4.2）；本用例不离页，无 View Transition 白名单需求 |
| ⑧ | 证据落盘三路（§2.5）+ 软门判定（§2.4）+ HUD 截图 `city_perf_hud_after_drive` | `shotIntegration` 既有 helper |
| ⑨ | 兜底 `keyboard.up`（finally）+ 全程 `pageerror` 断零 | 无白名单（不离页） |

超时预算：`test.setTimeout(600_000)`（RS §3.5 标定采纳：ready/robot_idle ≤210s + car_ready ≤210s 与驾驶 20s + 采样 ≤45s 部分重叠 + 余量；WS-PERF-01 的 420s 对城市档更重的挂载不够）。

### 2.3 驾驶动作脚本（冻结 · 与真机 human-gate 城市档同源）

W 全程按住不放，叠加时间窗（墙钟，自 driving 确认起算）：

| 窗口 | 动作 | 对应真机脚本项 |
|------|------|----------------|
| 0–4s | 直行加速 | 基线段 |
| 4–6s | +A（左急转） | 急转 ① |
| 8–10s | +D（右急转） | 急转 ② |
| 12–16s | +Shift（boost 直线） | boost 直线 |
| 16–20s | 直行（自然可能撞及沿街隔离墩） | 撞道具尝试 |

注：a) 窗口间隙为回正直行段；b) 20s 为下限，⑤⑥ 步读数采集在持续驾驶中进行，实际驾驶墙钟 = 20s + 采样窗口；c) **撞道具命中不作硬断言**——SwiftShader 慢动作下轨迹不可精确复现，命中时 `counters.coneHits ≥ 1` 记录于证据 JSON（`collisionHit: true/false`），未命中不扣分不重试（碰撞反馈链路的挡合并断言已由 CITY-FB-06 灰盒腿承载，本用例不重复）；d) R 复位**不进脚本**（复位清速度会污染帧率积分窗口）；e) 采样窗/动作脚本**不许为凑读数裁剪**（脚本同源铁律，rubric 禁止清单 9）。

### 2.4 断言分层（冻结）

**硬断言（挡合并——「链路活着」，不因环境慢而 skip）**：

1. 挂载 `robot_idle` 可达 → CTA 变形 `car_ready` 可达 → W 接管 `driving`；
2. 驾驶产生速度（`speedKmh > 2`）；
3. HUD `[data-ws-fps]` 出「均值 / 1% low」读数；
4. `__worldSpike.fps().avg > 0`；
5. rAF 持续出帧（采样 ≥6 帧）；
6. dump 取证合法（`schemaVersion === 1` + funnel 三步非 null 单调）；
7. 全程零未捕获异常。

**软门（不阻断 CI）**：采样期 p95 帧间隔 < 50ms（≈95% 帧保持 ≥20fps 节奏、无长 stall）。失败不 fail 用例：登记 OBS annotation + 证据 JSON `softGate.pass=false` + `console.warn`——SwiftShader 下为预期读数；真机 60/30 门禁以 human-gate §5.4 为准（WS-PERF-01 逐字同构语义）。

**禁止**：对 `timing.*`、`funnel.*`、fps 读数设任何数值上限断言（rubric 禁止清单第 3 条的 e2e 执行面）。

### 2.5 证据 schema（`city-perf-evidence.jsonl` 行 + 报告附件，冻结）

RS §3.5 草案定稿版（`timing` 键名采纳 RS；增 `collisionHit` 与 `session` 摘要）：

```jsonc
{
  "label": "CITY-PERF-01 evidence",
  "spec": "CITY-PERF-01",
  "capturedAt": "ISO",
  "ci": true,
  "env": {                       // 环境指纹：读数必须可归因
    "userAgent": "…", "hardwareConcurrency": 4, "devicePixelRatio": 1,
    "webgpuAvailable": true, "viewport": { "w": 1440, "h": 900 },
    "backend": "webgl2",         // 实际值非探测值（SwiftShader WebGPU 自动回退归因位）
    "vehicle": "physics", "quality": 0
  },
  "timing": {                    // 采集不判定（P3 双时基对照，rubric §3.3；均为下界 only）
    "loadToRobotIdleMs": 0,      // Playwright 侧导航起算墙钟
    "transformToCarReadyMs": 0,
    "funnelRobotIdle": 0,        // dump funnel（Game 构造起算，恒 ≤ loadToRobotIdleMs）
    "funnelCarReady": 0, "funnelDriveStart": 0
  },
  "driveMs": 0,                  // 实际驾驶墙钟
  "hud": { "fpsText": "N / M" },
  "meter": { "fps": { "avg": 0, "low1": 0 }, "info": { "drawCalls": 0, "triangles": 0 } },
  "sampling": {                  // rAF 帧间隔统计（WS-PERF-01 同构）
    "frames": 0, "durationMs": 0, "p50Ms": 0, "p95Ms": 0, "maxMs": 0,
    "stallCount": 0, "stallRatio": 0, "approxFps": 0
  },
  "collisionHit": false,         // §2.3 注 c：best-effort 撞道具是否命中（counters.coneHits ≥1）
  "softGate": { "rule": "p95 < 50ms（软断言不阻断 CI）", "thresholdMs": 50, "p95Ms": 0, "pass": false, "blocking": false },
  "gateReference": {             // 仅信息性对照（软件光栅化硬下界，不作判定）
    "avgFps": 0, "desktop60Ref": false, "android30Ref": false, "low1Ref45": false,
    "verdictAuthority": "docs/spec/cyber-city-perf-rubric.md §3.1（真机 human-gate §5.4）"
  },
  "session": { "sessionId": "…", "events": 0, "dropped": 0 }
}
```

附件双落：`test.info().attach('city-perf-evidence.json')` + `test.info().attach('session-dump-city-perf.json')`（dump 全文，观测规格 §6.1「CITY-PERF-01 含 dump 附档职责」，case 命名 `city-perf` 采纳 RS）；dump 同时落盘 `test-results/session-dump-city-perf.json`（function-smoke 多 dump 并集的可选输入，不改其分母）。字段加法不升版、破坏性变更在本文件留痕（观测规格 §3.6 同纪律）。

## 3. CITY-PERF-02：`?quality=2` 降档核心路径存在腿（rubric P5 CI 哨兵）

### 3.1 定位

`?quality=2` 最低档下核心路径（变形 → 驾驶 → 进站）可达性的**存在性/顺序性**断言——SwiftShader 可诚实判定，故为**挡合并硬用例**（rubric §5 四层分工表）。当前全库无任何 Q2 腿（`?quality=` 深链 M9 转正后零 e2e 覆盖，RS §3.1 grep 实证），本用例补位。**哨兵非判定**：本用例绿 ≠ P5 = 100（真人 S-5 L6 腿 + 真机 Q2 安卓腿才是判定，rubric 禁止清单第 6 条）。与 PERF-BR O1（自动降档）解耦：**显式 `?quality=` 深链禁用自动降档**（BR O1 冻结约束），本用例可复现性不受其落地影响。

### 3.2 用例流程（冻结）

| 步 | 动作 | 断言 |
|----|------|------|
| ① | `page.goto('/?quality=2')` → `robot_idle`（210s） | dump `env.quality === 2`（参数生效的机器证据） |
| ② | CTA 变形 → `car_ready` → W 接管 → `driving` | 状态序完整（Q2 不断链） |
| ③ | 驾驶至最近 POI 触发圈 → E 进站（动线打法镜像 CITY-OBS-01 的进站腿，两 spec 互不 import） | `poi-bounding-in` → `world-poi` 事件序在 dump 中出现 |
| ④ | **跳转前** dump 取证 + 落盘 `test-results/session-dump-q2.json` + attach | funnel 七步非 null 且单调不减（Q2 全漏斗跑通 = 「无功能性缺失」的 CI 面）；HUD `[data-ws-fps]` 有读数（HUD 在岗） |
| ⑤ | 进站跳转发生 → 全程 pageerror 断零 | **View Transition 白名单沿用**（`Transition was skipped`，OBS/WS 既有先例——本用例离页） |

超时预算：`test.setTimeout(600_000)`（挂载/变形校准同 CITY-PERF-01，进站动线沿用 OBS-01 校准）。本用例**无帧率采样、无软门**——纯存在性；跑在 world-perf-chromium 仅因文件归属（§1.2），排在 CITY-PERF-01 之后执行（`fullyParallel: false` 顺序保证，采样用例先跑、机器最干净）。

### 3.3 显式非目标

- ❌ 不断言 Q2 与 Q0 的帧率差（SwiftShader 下无意义；真机 Q2 读数归 §5 对照表增补行 5）；
- ❌ 不断言 Q2 视觉裁剪清单（bloom 旁路/粒子 0/剪影 21 等梯退数值的机器断言归 BR O13「预算单源台账 + e2e 合同断言」落地轮，防两处断言口径漂移）；
- ❌ 不替代 S-5 L6 真人腿（「反馈缺失」类观察只有真人能判）。

## 4. 软/硬门总表（本方案冻结的完整门面）

| 门 | 载体 | 级别 | 失败处置 |
|----|------|:---:|----------|
| 链路活着（挂载/变形/驾驶/读数存在性） | CITY-PERF-01 硬断言 §2.4 | **挡合并** | fail 用例 |
| Q2 核心路径可达 | CITY-PERF-02 全部断言 | **挡合并** | fail 用例 |
| p95 帧间隔 <50ms | CITY-PERF-01 软门 | 软（哨兵） | OBS annotation + 证据标记 + warn，不 fail |
| 字节预算零 ❌ | audit-budget（既有） | **挡合并** + P4 判定权威 | CI 红 |
| 60/30/45/8s 真机门 | human-gate §5.4 + 增补两行 | **挡登记** | 不入 CI，欠账列登记前置 |
| 既有全量 e2e 不降 | 全量跑（64 例 → 66 例） | **挡合并** | 实现 PR 验收项 |
| drawCalls/triangles 负载回归 | 证据 jsonl（v1 留档） | v1 无门（v1.1 裁决点 §7） | 趋势人读；优化 PR 必附前后对照（BR O4 流程约束） |

## 5. human-gate 对照表（CI 证据字段 ↔ 真机行 ↔ rubric 维）

审计（CC-AL-PERF）按此表把三方证据对齐到登记 JSON：

| rubric 维 | 判定权威（真机行） | CI 对照字段（`city-perf-evidence.jsonl`） | 对照语义 |
|:---:|--------------------|-------------------------------------------|----------|
| P1 桌面 | §5.4 行 1（WebGPU 20s）/ 行 2（`?gl=1` 20s） | `meter.fps.avg` · `sampling.approxFps` · `gateReference.desktop60Ref` | CI = 软件光栅化硬下界；真机读数 < CI 下界 = 环境标注错误，触发复测 |
| P1 安卓 | §5.4 行 3（默认 60s）/ 行 4（`?gl=1` 60s） | —（CI 无此腿） | 纯真机；旗舰机只作参考行 |
| P2 | §5.4 行 1/2 的「1% low」列（≥45） | `meter.fps.low1` · `sampling.p95Ms`/`stallCount`（帧稳侧写） | HUD 与 DevTools 互证（rubric §4 `verification.hudVsDevtools`） |
| P3 | 增补行 6（Fast 4G 秒表，≤8s） | `timing.loadToRobotIdleMs` + `timing.funnelRobotIdle`（双时基，均下界 only） | 秒表 ≥ funnel 为合法形态（rubric §3.3 含系统差注记） |
| P4 | —（CI 即权威） | audit-budget 同 commit run（`evidence.budgetRun`） | 零 ❌ 二值 |
| P5 | 增补行 5（Q2 安卓中端核心路径）+ S-5 L6 真人腿 | CITY-PERF-02 绿 + `session-dump-q2.json`（`env.quality=2` + funnel 七步） | CI 存在腿是必要非充分（禁止清单第 6 条） |
| 负载基线 | —（环境无关，CI 可硬比） | `meter.info.drawCalls/triangles` | 唯一可跨轮硬比的 CI 读数；Blender GLB 类资产合流后基线须重定标（BR §7） |

增补行 5/6 的表体已在 rubric §3.2 冻结，回填时复制追加到 human-gate §5.4。

## 6. 实现验收清单（CC-PERF-C1 过门自查）

1. 新 spec 两用例全绿且**跑在 world-perf-chromium**（`--list` 核对归属；world-chromium 与 desktop-chromium 均不再/不会命中 perf spec）；
2. WS-PERF-01 与既有 64 例零改动零退化（全量 e2e 0 failed）；
3. `test-results/city-perf-evidence.jsonl` 出现且行 schema 与 §2.5 一致；报告附件两件（evidence + dump）齐；HUD 截图入库；
4. 软门失败路径实测（SwiftShader 下必然触发）：OBS annotation 出现、用例仍绿；
5. `pnpm build` 产物跑（不测 dev server）；audit-budget / LHCI 零变化（纯测试侧，`src/` 零 diff）；
6. 文档随行：e2e-test-plan §5 追加 CITY-PERF 条目、观测规格 §6.1 工件行措辞更新（「正本归顾问 §3.3 / FXN-DES」→ 指向本方案与 perf rubric）、功能 rubric §5/§6.2 指针化注记（impl-plan「随行 doc」项）。

## 7. v1.1 裁决点（显式不入 v1，防殿后尾巴失控）

| # | 候选 | 出处 | 立项条件 |
|---|------|------|----------|
| 1 | LoAF 长帧归因通道（`PerformanceObserver` type `long-animation-frame`，采样窗内长帧的 script/render 耗时拆解入证据 JSON，~20 行零依赖） | RS §2.1/§3.5 | stall 帧归因有真实需求时（P2 真机不达标轮） |
| 2 | drawCalls/triangles 回归护栏软门（首采 +20% 定标） | BR O4 | jsonl 积累 ≥3 轮基线后 |
| 3 | 分档矩阵采样（`?quality=0\|1\|2` 逐档证据行） | BR O4 | Quality 优化序（BR §6 ②起）开跑后，按「每优化 PR 附前后对照」需求扩 |
| 4 | Q2 梯退合同机器断言（粒子 0/剪影 21/DPR 1 对表） | BR O13 | perf-budgets 单源台账落地同 PR |

---

*CC-PERF-DES · 2026-08-27 — CITY-PERF-01（`/` 城市档证据包：WS-PERF-01 骨架同构 + 真机同源驾驶脚本 + P3 双时基 + dump 附档 + 负载基线首档）与 CITY-PERF-02（Q2 降档存在腿，挡合并哨兵）spec 级冻结；RS 案 A 文件名缺陷修正（desktop-chromium 泄漏）+ CI 单腿裁决 + 600s 超时标定吸收 PERF-RS/BR 结论；软/硬门总表与 human-gate 对照表 + v1.1 裁决点四项。仅文档交付，`src/`、`e2e/` 零改动；实现归 CC-PERF-C1（`docs/research/cyber-city-perf-impl-plan.md` PR-A）。*
