# 赛博科技城性能测试方案 v1.0（CC-PERF-DES 执行正本）

> 执行模型自报：**claude-fable-5**

| 项 | 内容 |
|----|------|
| Task | **CC-PERF-DES**（Loop 8 性能扩展 DES 三件套之一）——性能双轨的**测试执行正本**：CI 证据包（CITY-PERF-01/02）冻结规格 + WS-PERF-01/CITY-PERF 分档 + project 拓扑 + CI 五步链 + 软/硬门总表 |
| 分支 | `cursor/cc-perf-des-spec-1d6f`（base：`main` @ `cf76d35`） |
| 日期 | 2026-08-27 |
| 定位 | **执行正本，不是改秤**：五维权重/锚点/85 门/真机腿归姊妹件 `docs/spec/cyber-city-perf-rubric.md`（v1.0 冻结）；dump schema/工件契约归 `docs/spec/cyber-city-observability.md`（冻结）；四层分工语义归 `docs/spec/cyber-city-function-test-plan.md` §1（本文件为其性能轨镜像）——对三正本冻结面**零改动**，只锁 CI 侧用例合同与链路协作面 |
| 冻结时点事实 | main `cf76d35`：PERF-RS（#59）/ PERF-BR（#60）/ FXN-TEST（#61）已合；e2e 全量 **64 用例 / 12 文件 / 五 project**（功能测试方案 §1.3 分布表）；`?quality=2` e2e **零覆盖**（grep 实证，PERF-RS §3.1）；`/` 城市档零性能采样（gap 审计行）；`city-perf-evidence.jsonl` 在观测规格 §6.1 有名无产出者；`northStar.perf` 接线已落 `scripts/score-loop.mjs`（恒读登记位，缺失显 `—`）；在途：FXN-C1 #62 / VEH-C2 #63（draft，可能先合流——e2e 计数以当轮 `--list` 为准，全量不降语义） |
| 上游 | PERF-RS §3.3（双轨口径）/§3.4（两档差异审计）/§3.5（CITY-PERF-01 设计输入）· PERF-BR O4（哨兵增量 + 流程约束）· WS-PERF-01 `e2e/world-spike-perf.spec.ts`（标定与姿势先例）· `e2e/cyber-city.spec.ts` / `e2e/cyber-city-observability.spec.ts`（超时标定与动线先例）· `playwright.config.ts`（project 拓扑现状） |
| 消费方 | **CC-PERF-C1**（PR-A 实现，§2/§3 断言合同 = 合并门）· CC-PERF-C2（PR-B 前后对照流程约束）· CC-AL-PERF（S3/S4 结构门核对面）· 父代理看板（§4 五步链读数） |

---

## 0. 结论先行

1. **两档三用例定档**（§1.2）：WS-PERF-01（灰盒 `/world-spike/`，既有，零改动）守试验场下界；**CITY-PERF-01**（生产 `/`，新增）产性能 85 的登记对象证据——采样标定全抄 WS-PERF-01、动作脚本改抄真机 §4.1 行 1（脚本同源是 rubric 结构门 S4）；**CITY-PERF-02**（`/?quality=2`，新增）补 P5 存在腿的 e2e 零覆盖缺口。CI 单腿不做 `?gl=1` 双后端（SwiftShader WebGPU 腿不可靠且自动回退，PERF-RS §3.3 物理事实），后端差异靠环境指纹归因。
2. **project 拓扑改判案 B**（§1.3）：PERF-RS §3.5 推荐的案 A（`world-perf-chromium` 扩 testMatch + `fullyParallel: false`）**不能保证跨文件串行**——Playwright 语义里 `fullyParallel` 只控制单文件内用例并行，文件间并行由 worker 调度决定（全局 `workers: 2` 下两个 spec 文件仍可同槽并跑，采样互相污染）。本正本冻结 RS 自己列出的案 B：新 `city-perf-chromium` project 经 `dependencies` 链殿后——project 依赖是 Playwright 唯一的跨文件强序原语。
3. **CI 五步链零改形**（§4）：功能测试方案 §4.2 的 build → e2e → smoke → score-loop → 看板五步**原链不动**；性能证据包在步 ② 内由殿后 project 自然产出（该方案 §6 开放问题 5 预告的「追加证据包步」按此落账，不另开第六步）；步 ④ `northStar.perf` 恒读登记位、步 ⑤ 缺失显 `—`——CI 证据包读数**永不流入** northStar。
4. **软/硬门分置**（§5）：硬门 = 存在性/顺序性断言（挡合并）；软门 = p95<50ms annotation + 负载漂移告警（v1.1 起）——SwiftShader 下软门**恒预期失败**，这正是失败路径的常驻实测（annotation 出现且用例绿是 PR-A 验收项）；判定门 = 真机（挡登记，归 rubric）。任何人不得以软门读数阻断合并或冒充判定。
5. **验收清单十条**（§6）：PR-A 合并 = 既有回归硬门全过 + 本文件 §2/§3 断言合同全绿 + config diff 恰为 §1.3 冻结三处 + `src/` 零 diff + 随行 doc 三件。

---

## 1. 双轨分层与用例分档

### 1.1 性能轨责任矩阵（功能测试方案 §1.1 同构镜像）

| 层 | 判定什么 | 显式**不**判定什么 | 执行者 · 时机 | 工件 | 门语义 |
|----|----------|--------------------|---------------|------|--------|
| **① CI 证据包**（WS-PERF-01 + CITY-PERF-01/02） | 链路存在性/顺序性（状态机走通、驾驶产生速度、rAF 持续出帧、零 pageerror）、下界读数留档、负载基线（drawCalls/triangles） | **任何** 60/30 帧率判定、≤8s 时长判定、体感（SwiftShader 禁令） | 实现代理每 PR · 全量 e2e 殿后 project | `test-results/city-perf-evidence.jsonl` · `world-spike-metrics.jsonl` · `session-dump-city-perf.json` · 报告附件 | 硬断言**挡合并**；读数**软门**（annotation） |
| **② 真机录测**（rubric §4.1 六腿） | P1/P2/P3/P5 判定读数（FPS 均值 / 1% low / Fast 4G 计时 / Q2 完成度） | 预算（P4 归 CI）、代码回归（归 e2e） | 指挥官 · 登记轮（PR-C） | human-gate §5.4 记录行 + 三件套归档 | **挡登记** |
| **③ AL-PERF 审计** | 数值门 + 结构门 S1–S5 双门判定、登记 JSON 写入 | 实现细节评审（归 PR review） | Sol（CC-AL-PERF，唯一登记人）· 登记轮 | `docs/research/cyber-city-perf-rubric-score.json` | **唯一登记出口** |
| **④ northStar.perf** | —（只读汇总） | 一切判定 | `scripts/score-loop.mjs` 每轮 | `test-results/quality-score.json` | 无门（缺失显 `—` 禁估值） |

**铁律**：数据只向下游流——① 的读数可被 ③ 引用为 S3 在档性证据与趋势对照，**永不**折算维分；② 的读数只经 ③ 落登记 JSON；④ 只读 ③ 的 `score`。

### 1.2 用例分档表：WS-PERF-01 vs CITY-PERF-01/02

| 面 | WS-PERF-01（灰盒档 · 既有零改动） | CITY-PERF-01（城市档 · 新增） | CITY-PERF-02（Q2 存在腿 · 新增） |
|----|----------------------------------|------------------------------|----------------------------------|
| 对象 | `/world-spike/` 试验场 | **生产 `/`**（性能 85 分母，rubric 评分对象） | 生产 `/?quality=2` 深链 |
| 职责 | 试验场下界哨兵 + 双 spec 采样口径的锚（标定源） | 登记对象的 CI 证据包：下界读数 + 城市档负载基线 + 漏斗互证 | P5「Q2 核心路径无功能性缺失」的 CI 存在性哨兵（判定归 S-5 L6 真人腿） |
| 入场 | 显式点击 `[data-ws-start]` → `data-state: ready`（150s） | 自动挂载 → `ready`（210s）→ `data-world-state: robot_idle`（120s） | 同左（Q2 深链参数不改挂载路径） |
| 动作脚本 | W 直行 30s（历史口径保留，锚定跨轮可比性） | **真机 §4.1 行 1 同源**：CTA 变形 → 驾驶 20s 墙钟（2 急转 + 1 撞道具尝试 + 1 boost） | 变形 → 驾驶 → driveTo POI 触发圈 → E 进站（S-5 L6 核心路径镜像） |
| 采样 | rAF 帧间隔（≥5s 且 ≥6 帧，封顶 45s，stall 50ms） | **同标定照抄**（横比前提；驾驶保持不间断） | **不采样**（存在性腿，负载轻跑） |
| 软门 | p95 < 50ms（annotation 不阻断） | 同左沿用 | 无 |
| 工件 | `world-spike-metrics.jsonl` | `city-perf-evidence.jsonl` 全量行 + `session-dump-city-perf.json` | `city-perf-evidence.jsonl` 精简行（Q2 档负载基线） |
| project | `world-perf-chromium`（独占殿后，不动） | `city-perf-chromium`（新，§1.3） | 同左（同文件串行第二例） |
| 与真机关系 | 方法论先例（不对应任何判定腿） | 判定腿 1–4 的 CI 同源影子（脚本同源 S4） | 判定腿 5（Q2 降档腿）+ S-5 L6 的 CI 影子 |

### 1.3 project 拓扑冻结（案 B · config diff 三处）

**改判依据**（对 PERF-RS §3.5 案 A 的修正）：Playwright 的 `fullyParallel: false` 只保证**同一文件内**用例按序同 worker 执行；不同 spec 文件是独立的调度组，全局 `workers: 2` 下 `world-spike-perf.spec.ts` 与 `cyber-city-perf.spec.ts` 若同属一个 project 仍会双 worker 并跑——两个 3D 上下文互相挤兑（batch 1 实测结论），双方采样全废。**一手实验实证**（2026-08-27，仓库同版 `@playwright/test`）：单 project 双 spec 文件 + project 级 `fullyParallel: false` + 全局 `workers: 2` → 两文件时间戳完全重叠并跑（B 先 A 97ms 起步、双双 3s 全程重叠）——案 A 的「文件间按字母序串行」预期实测不成立。project 间 `dependencies` 是唯一的跨文件强序原语，故取 RS 自列的案 B（「语义最显式」）。

> 旁注（观察项，非本批交付）：`visual-chromium` 块内既有注释「fullyParallel=false 钉死单 worker 顺序执行」是同一误解——该 project 4 个 spec 文件在全量跑时同样可能两两并跑；对截图基线的影响由容差吸收未曾显性，登记为 §7 观察项供 OBS/维护批次复核。

**冻结 diff（PR-A 照抄，恰好三处）**：

```ts
// ① world-chromium：排除 perf spec（cyber-city.*\.spec\.ts 泛匹配会误收编）
{
  name: 'world-chromium',
  testMatch: /world-spike\.spec\.ts|cyber-city.*\.spec\.ts/,
  testIgnore: /cyber-city-perf\.spec\.ts/,          // ← 新增行
  …
}
// ② 新 project（world-perf-chromium 块之后插入）
{
  name: 'city-perf-chromium',
  testMatch: /cyber-city-perf\.spec\.ts/,
  fullyParallel: false,                              // 文件内两用例（01→02）按序单 worker
  dependencies: ['world-perf-chromium'],             // WS-PERF-01 采样完毕后才开跑
  use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
},
// ③ visual-chromium：依赖链改指新殿后节点
dependencies: ['city-perf-chromium'],                // 原 ['world-perf-chromium']
```

执行序（全量 e2e）：desktop-chromium + mobile-375 → world-chromium → world-perf-chromium → **city-perf-chromium** → visual-chromium。perf 双 project 采样期均整机独占；visual 基线截图仍殿后（既有语义不变）。

**命名纪律**：新 spec 文件名 `e2e/cyber-city-perf.spec.ts`（功能测试方案 §2-1 家族命名沿用）。双重依据：① RS 案 A 提议的 `city-perf.spec.ts` 不命中 desktop-chromium 既有 testIgnore（`cyber-city.*` 前缀不匹配），会泄漏进桌面并行池，采样纪律直接破产——家族前缀保住该 ignore；② 正因家族名撞 world-chromium 的 `cyber-city.*` 泛匹配，上文 diff 第 ① 处 testIgnore 是必须行。实现时用 `--list` 验证：该文件**只**出现在 city-perf-chromium（§6-7 验收条）。

### 1.4 冻结时点执行底座盘点（PR-A 零依赖的证据）

| 底座 | 事实 | 出处 |
|------|------|------|
| 取证钩子 | `__worldSpike.backend/fps()/info()/state()` 在 `/` 城市档已挂（两页共用装配段）；`__worldSession.dump()`（OBS-C1 #53）；HUD `[data-ws-fps]`；`data-world-state` 四态 | PERF-RS §3.4 |
| 深链 | `?quality=0\|1\|2` 已转正（M9/CC-E7）；dump `env.quality` 已入 schema（CITY-OBS 已断言 ∈ {0,1,2}） | 观测规格 §3.2 |
| 超时标定 | 挂载 `ready` 210s · `robot_idle` 120s · `car_ready` 120s · `driving` 60s · driveTo 腿 360s（CITY-OBS-01 实战绿） | `e2e/cyber-city.spec.ts` / `cyber-city-observability.spec.ts` |
| 采样标定 | ≥5s 且 ≥6 帧、封顶 45s、stall 50ms、p50/p95/max/stallCount/stallRatio/approxFps | `e2e/world-spike-perf.spec.ts` |
| 工件名 | `test-results/city-perf-evidence.jsonl` 已在观测规格 §6.1 冻结（软门 p95<50ms 沿用注记在） | 观测规格 §6.1 |
| CI 环境事实 | SwiftShader ~1fps；WebGPU 腿 `createBuffer` 缺陷 → 自动回退 webgl2（`webgpuAvailable: true` ≠ 实际后端） | PERF-RS §1 末行 |

## 2. CITY-PERF-01 冻结规格（城市档证据包）

### 2.1 七步协议（动作与真机 rubric §4.1 行 1 同源——S4 结构门依据）

1. **入场**：生产 `/` 无 URL 参数、全新 context（清存储首访口径）→ 自动挂载 → `data-state: ready`（210s）→ `data-world-state: robot_idle`（120s）；`load → robot_idle` 毫秒数进 annotation + 证据 `timing.loadToRobotIdleMs`（**采集不判定**，CITY-E2E-03 先例）。
2. **环境指纹**：`userAgent` / `hardwareConcurrency` / `devicePixelRatio` / `'gpu' in navigator` / viewport / **`__worldSpike.backend`（实际后端，防 SwiftShader WebGPU 回退假象）** / `dump().env.quality` / `ci` 布尔。CI 单腿，不跑 `?gl=1`（§0-1）。
3. **变形 + 脚本化驾驶 20s 墙钟**：CTA 点击（或 Space）→ `transforming` → `car_ready`（120s；`transformToCarReadyMs` 采集不判定）→ 压 W 至 `driving` + 速度 >2km/h → 补足 20s 墙钟，途中 2 次急转（A/D 各 ~0.6s 脉冲）+ 1 次撞道具尝试（城市档 = 隔离墩/道具，`counters.coneHits` 承接——**尝试同源、命中不判**，防慢动作动线抖动假阴性）+ 1 次 Shift boost（≥1.5s，`boost-first` 事件互证）。
4. **rAF 帧间隔采样**（驾驶不间断，W 保持按住）：标定全抄 WS-PERF-01——`SAMPLE_MIN_MS 5000` / `SAMPLE_MIN_FRAMES 6` / `SAMPLE_CAP_MS 45000` / `STALL_MS 50`；统计 p50/p95/max/stallCount/stallRatio/approxFps。两档同标定才可横比。
5. **互证读数**：`__worldSpike.fps()`（avg/low1）+ `info()`（drawCalls/triangles——**城市档负载基线首轮建档**，环境无关、唯一可跨环境硬比读数）+ `state()`（速度证明驾驶真发生）+ HUD `[data-ws-fps]` 文本（`/^\d+ \/ \d+$/`）。
6. **硬断言**（§2.2 清单）执行后——
7. **证据落盘**：`test-results/city-perf-evidence.jsonl` 追加全量行（§2.5 schema）+ `test.info().attach('city-perf-evidence.json')` + `__worldSession.dump()` 落盘 `test-results/session-dump-city-perf.json` 并 attach（观测规格 §6.1 `session-dump-<case>` 命名族，case = `city-perf`；smoke 分母不收——function-smoke 只读显式 `--dump` 传参，零干扰）。

### 2.2 硬断言清单（挡合并；全部存在性/顺序性/计数，SwiftShader 禁令合规）

| # | 断言 | 口径 |
|---|------|------|
| H1 | 状态机走通 | `ready → robot_idle → car_ready → driving` 依序达成（各步超时 §1.4 标定） |
| H2 | 驾驶真发生 | `state().speedKmh > 2`（轮询，60s 预算） |
| H3 | 帧率仪表活着 | `fps().avg > 0` 且 HUD `[data-ws-fps]` 匹配 `/^\d+ \/ \d+$/` |
| H4 | rAF 持续出帧 | 采样 `frames ≥ 6` |
| H5 | 漏斗互证 | `dump().funnel` 的 `robotIdle`/`carReady`/`driveStart` 非 null 且单调不减 |
| H6 | 零未捕获异常 | `pageerror` 断零（UA「Transition was skipped」唯一白名单，既有惯例） |
| H7 | 证据完整 | jsonl 行 append 成功且含 §2.5 必填字段（schema 自检在用例内做，防哑工件） |

### 2.3 软门清单（不阻断；annotation + console.warn，WS-PERF-01 同款姿势）

| 软门 | 口径 | 状态 |
|------|------|------|
| p95 帧间隔 < 50ms | 失败 → `softGate.pass=false` 入证据 + OBS annotation + console.warn，用例保持绿。SwiftShader 下**恒预期失败**——即失败路径每轮常驻实测；带 GPU 环境预期转绿 | v1 唯一软门 |
| 负载漂移告警 | drawCalls/triangles 相对上一轮同环境（`ci: true`）行漂移 >+20% → annotation | v1 只留档不设门；≥2 轮基线后启用（rubric §7.1） |
| LoAF 长帧归因 | `long-animation-frame` 观察窗拆解 stall 帧 script/render 耗时进证据 JSON | v1.1 裁决点（rubric §7.1），v1 不做 |

### 2.4 超时与预算

| 项 | 冻结值 | 推导 |
|----|--------|------|
| CITY-PERF-01 test timeout | **600s** | 挂载 210 + robot_idle 120 + car_ready 120 + 驾驶/采样 65 + 余量（WS-PERF-01 的 420s 对城市档不够，PERF-RS §3.5 红线段） |
| CITY-PERF-02 test timeout | **600s** | 挂载/变形同上 + driveTo 腿 360s 预算复用 CITY-OBS-01 实战值 |
| city-perf-chromium 尾巴 | 封顶 **20 min**（2 × 600s），实测预期 8–14 min | 全量墙钟增量入 PR-A 描述实测留档；再增用例须回本文件改 §1.3 布局 |
| 录像 | `video: 'off'` 显式声明 | 录屏吃 CPU 系统性拉低读数（WS-PERF-01 运行纪律） |
| 重试 | 沿全局（CI retries 2） | 重试轮 jsonl 会多行——`capturedAt` + `ci` 指纹可区分，趋势对照取该 commit 最后一行 |

### 2.5 `city-perf-evidence.jsonl` 行 schema v1（冻结；`spec` 为判别字段）

```jsonc
// CITY-PERF-01 全量行
{
  "spec": "CITY-PERF-01",
  "capturedAt": "ISO-8601", "ci": true,
  "env": { "userAgent": "…", "hardwareConcurrency": 4, "devicePixelRatio": 1,
           "webgpuAvailable": true, "viewport": { "w": 1440, "h": 900 },
           "backend": "webgl2",          // __worldSpike.backend 实际值，非探测值
           "quality": 0 },
  "timing": { "loadToRobotIdleMs": 0, "transformToCarReadyMs": 0 },   // 采集不判定
  "driveMs": 20000,
  "hud": { "fpsText": "1 / 0" },
  "meter": { "fps": { "avg": 0, "low1": 0 }, "info": { "drawCalls": 0, "triangles": 0 } },
  "sampling": { "frames": 0, "durationMs": 0, "p50Ms": 0, "p95Ms": 0, "maxMs": 0,
                "stallCount": 0, "stallRatio": 0, "approxFps": 0 },
  "softGate": { "rule": "p95 < 50ms", "thresholdMs": 50, "p95Ms": 0, "pass": false, "blocking": false },
  "gateReference": { "avgFps": 0, "desktop60Ref": false, "android30Ref": false,
                     "verdictAuthority": "docs/spec/human-gate-checklist.md §5.4 + docs/spec/cyber-city-perf-rubric.md §4" },
  "funnel": { "robotIdle": 0, "carReady": 0, "driveStart": 0 },        // dump 摘要（全量进附档）
  "counters": { "coneHits": 0, "respawns": 0 }                          // 动作脚本旁证（不判命中）
}
// CITY-PERF-02 精简行（无 sampling/softGate/hud/gateReference）
{
  "spec": "CITY-PERF-02",
  "capturedAt": "ISO-8601", "ci": true,
  "env": { …同上, "quality": 2 },
  "timing": { "loadToRobotIdleMs": 0, "transformToCarReadyMs": 0 },
  "meter": { "info": { "drawCalls": 0, "triangles": 0 } },              // Q2 档负载基线
  "funnel": { "robotIdle": 0, "carReady": 0, "driveStart": 0, "firstPoiIn": 0, "firstPoiInteract": 0 }
}
```

字段加法不升版、破坏性变更升版并同步消费方（观测规格 §3.6 同纪律）。`gateReference` 仅信息性对照（WS-PERF-01 先例），**不构成判定**。

## 3. CITY-PERF-02 冻结规格（Q2 存在腿）

**被测命题**：`?quality=2`（止损档：bloom 整段旁路 / 阴影关 / 反射无 / 粒子 0 / DPR 1）下**核心路径零功能性缺失**——rubric P5 的 CI 存在性哨兵、S-5 L6 真人腿与真机判定腿 5 的影子。当前 e2e 对 `?quality=` 零覆盖（冻结时点事实），本用例是 P5 维从「无 CI 面」到「有 CI 面」的第一腿。

**协议**（同 spec 文件第二用例，PERF-01 之后串行）：

1. `/?quality=2` 深链 → `ready`（210s）→ `robot_idle`（120s）；
2. 断言 `dump().env.quality === 2`（深链生效的机读证明）；
3. CTA 变形 → `car_ready`（120s）→ W 驾驶（速度 >2km/h）；
4. driveTo 最近 POI 触发圈（预算 360s；动线打法镜像 CITY-OBS-01 已实战跑绿的 driveTo 遥测闭环）→ `poi-bounding-in` 入 dump → E 进站，route abort 拦下 navigate（跳转前取证合同延续）；
5. 硬断言：funnel 七步（`reveal…firstPoiInteract`）非 null 且单调不减、`world-poi` 事件在档、HUD 出数、零 pageerror；
6. 证据：jsonl 精简行（§2.5）——Q2 档 drawCalls/triangles 与 Q0 行对照即梯退表实效的 CI 旁证。

**显式不做**：帧率采样（存在性腿不采样，避免双倍尾巴）；Q2 视觉面判定（归视觉 rubric / AL 对照帧）；reduced-motion × Q2 组合矩阵（既有 CITY-E2E-04 守 reduced-motion 主路径，组合腿按需入 v1.1）。

## 4. CI 五步链（功能测试方案 §4.2 原链 + 性能读法）

链形零改动（该方案 §6 开放问题 5「证据包步属加法」按此落账：并入步 ②，不开第六步）：

| 步 | 命令 | 性能轨产出/读法 | 门 |
|----|------|------|-----|
| ① build | `pnpm build` | `dist/`（四层共用被测对象） | 失败 = 基础设施故障，链路中止 |
| ② e2e 全量 | `pnpm exec playwright test` | 六 project 依序：…→ world-perf-chromium（`world-spike-metrics.jsonl`）→ **city-perf-chromium**（`city-perf-evidence.jsonl` 两行 + `session-dump-city-perf.json` + softGate annotation）→ visual-chromium | **硬门**：任何失败挡合并 |
| ③ smoke 复算 | `node scripts/function-smoke.mjs --dump …funnel… --dump …cones…` | 功能侧沿用；**perf 证据不入 smoke 分母**（冻结：coverage 四项与漏斗分母零改动，观测规格 §6.2「分母跨轮恒定」） | 软门 |
| ④ 综合分 + northStar | `node scripts/score-loop.mjs` | `northStar.perf` 恒读 `docs/research/cyber-city-perf-rubric-score.json` 顶层 `score`；缺失/`null` → `—`。综合分五维权重零改动，CI 证据包读数**永不流入** northStar | 汇总非判定 |
| ⑤ 看板消费 | 父代理读 `quality-score.json.northStar` | 四数一行：visual / function / **perf** / composite；perf 出数当且仅当 AL-PERF 完成登记（rubric §5.1 状态机） | 缺失显 `—`，禁估值 |

**优化 PR 流程约束**（PERF-BR O4 增量的执行面，PR-B 起生效）：每个触碰渲染/加载面的 PR，描述必附同 commit `city-perf-evidence.jsonl` 前后对照（至少 drawCalls/triangles + sampling 摘要）；无对照不得宣称性能收益。趋势对照只看同环境（`ci: true`）行；单行异常不触发任何门（环境波动免责，annotation 留观察）。

## 5. 软/硬门总表

| 级 | 门 | 判定方式 | 生效点 |
|----|-----|----------|--------|
| 硬（挡合并） | CITY-PERF-01 硬断言 H1–H7 | §2.2 | PR-A 起每轮全量 |
| 硬（挡合并） | CITY-PERF-02 全断言 | §3 | 同上 |
| 硬（挡合并） | e2e 全量不降 | 冻结时点 64 → 66；以当轮 `--list` 计数，只增不减；WS-PERF-01 spec 文本零改动 | 既有硬门延伸 |
| 硬（挡合并） | LHCI 不降 · audit-budget 零 ❌ · `ritual_idle`/poster 恒等 · reduced-motion 双轨 · pageerror 断零 | 功能测试方案 §5 十条沿用（PERF 用例纯观测零 UI 面，恒等门天然满足仍须复跑） | 既有 |
| 硬（PR-A 专属） | `src/` 零 diff + config diff 恰为 §1.3 三处 | git diff 审查 | PR-A |
| 软（annotation） | p95 < 50ms | §2.3；SwiftShader 恒预期失败 = 失败路径常驻实测 | 每轮 |
| 软（annotation） | 负载漂移 >+20% | §2.3；≥2 轮基线后启用 | v1.1 |
| 软（趋势） | function-smoke 无退化 | 功能测试方案 §5-9 沿用（perf 零触碰其分母） | 每轮 |
| 判定（挡登记） | 真机六腿 + 数值门 + 结构门 S1–S5 | rubric §3/§4/§5 | 登记轮（PR-C） |

## 6. PR-A 验收清单（CC-PERF-C1 合并门 = 以下十条全过）

1. 全量 e2e 0 failed（当轮 `--list` 计数 = 冻结时点 64 + 新增 2；FXN-C1/VEH-C2 若先合流按其后计数，全量不降语义）；
2. CITY-PERF-01 硬断言 H1–H7 全绿，**且** softGate annotation 实测出现（SwiftShader 恒触发）而用例保持绿——软门失败路径验证；
3. CITY-PERF-02 全绿，`env.quality === 2` 断言在档；
4. `test-results/city-perf-evidence.jsonl` ≥2 行（01 全量行 + 02 精简行），字段对照 §2.5 schema 自检通过；
5. `session-dump-city-perf.json` 落盘 + attach 双动作齐；
6. WS-PERF-01：spec 文本零 diff、`world-spike-metrics.jsonl` 照常产出、读数量级与近轮一致（无采样污染旁证）；
7. `playwright.config.ts` diff 恰为 §1.3 冻结三处（testIgnore 行 + city-perf-chromium 块 + visual 依赖改写），`--list` 验证 `cyber-city-perf.spec.ts` **只**出现在 city-perf-chromium；
8. `src/` 零 diff；LHCI / audit-budget 零变化；
9. 随行 doc 三件：`docs/spec/e2e-test-plan.md` §5 追加 CITY-PERF-01/02 条目；功能 rubric §5/§6.2 加「正本已迁」指针注记（加法不改秤）；观测规格 §6.1 `city-perf-evidence.jsonl` 行产出者状态更新（「正本归顾问 §3.3 / FXN-DES」措辞改指本文件与 perf rubric）；
10. 全量墙钟增量实测入 PR 描述（city-perf-chromium 尾巴 ≤20 min 封顶核对）。

## 7. 版本纪律与开放问题

**版本纪律**：本文件改用例合同/拓扑/软硬门 → 版本 +1 并 PR 留痕；rubric 权重/锚点/真机腿、OBS 工件契约的变更由各自正本升版，本文件同 PR 跟随更新引用（不先行、不代改）。§2.5 schema 字段加法属勘误不升版。

**开放问题**：

1. **负载漂移软门阈值**（§2.3）：+20% 为 PERF-BR O4 建议值，≥2 轮基线后由 AL-PERF 复核定标再启用（rubric §7.1 裁决点）。
2. **LoAF 归因通道**：v1.1 裁决点；~20 行零依赖，Chromium 恒可用——首轮证据若出现无法归因的 stall 簇则提前立项。
3. **分档采样矩阵**（`?quality=0|1|2` × 后端）：CI 单腿纪律下不做矩阵；PR-B（Quality 优化）若需分档对照，优先真机轨/本地带 GPU 环境执行，CI 侧按需加档位参数化用例（届时回本文件改 §1.3 预算）。
4. **重试轮 jsonl 多行**（§2.4）：趋势脚本消费时取同 commit 最后一行；若未来做自动趋势工具，归 OBS 批次。
5. **FXN-C1/VEH-C2 合流时序**：两 draft PR 若先合流，e2e 计数基线上移，本文件 §6-1 按「全量不降」语义自适应，数字不回改（功能测试方案 §5 注 1 同构）。
6. **visual-chromium 并行注释勘误**（§1.3 旁注）：该 project 的「单 worker 顺序」注释与 Playwright 实测语义不符；是否需要为视觉基线补依赖链/单 worker 保证，归 OBS/维护批次按截图稳定性数据裁决，本正本只登记观察。

---

*CC-PERF-DES v1.0 · 2026-08-27 — 性能测试执行正本冻结：两档三用例分档（WS-PERF-01 锚定标定 / CITY-PERF-01 城市档证据包七步协议 + H1–H7 硬断言 + p95 软门 / CITY-PERF-02 Q2 存在腿）+ project 拓扑案 B 改判（city-perf-chromium 依赖链殿后，附 Playwright 语义依据与 config diff 三处冻结）+ CI 五步链性能读法（证据包并入步 ②，northStar.perf 只认登记位）+ 软/硬门总表 + PR-A 验收十条。doc-only，`src/`、e2e 与 config 零改动；秤与门归姊妹件 `cyber-city-perf-rubric.md`，PR 切分归 `cyber-city-perf-impl-plan.md`。*
