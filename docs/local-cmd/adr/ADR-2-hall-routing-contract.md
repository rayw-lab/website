---
title: ADR-2 · 进楼与路由契约（hallPath、到达快照、SRD 补行、G-Hall）
id: ADR-2
status: locked
date: 2026-09-02
decider: 董事会（Grok 4.6 xhigh，效力 = 磊哥决定）
packages: D2
supersedes: —
---

# ADR-2 · 进楼与路由契约

## 背景

城里 E 键走 `location.assign(base + building.deepLink)`，不带 query、不写 sessionStorage；`dispose()` 删掉 `window.__worldSession`，展厅与正文页拿不到驾驶卡。`about-pavilion.deepLink` 现为 `/about/`（纸面双胞胎，live）。SRD §12.7.1 路由表写着「`/world/` 不再建立」——否决的是 v1.1 Hybrid **世界引擎独立入口**，不是楼内展厅 HTML。`audit-budget.mjs` G-D 排除 `world/` 前缀：展厅路径一旦叫 `/world/`，引擎字节可以偷运进门还绿。本包只裁进楼字段、快照、SRD 措辞、LHCI、G-Hall 断言。不重开 C+B+A；展厅不进 Lab manifest；展厅 HTML 不 import `src/lab/world/**`。

## 选项与代价

| 选项 | 内容 | 代价 |
|---|---|---|
| **(a)** | `Building.hallPath?` 加法；`deepLink` 不动；城里 E 有 hallPath 走展厅，否则走 deepLink；两边都拼 `?from=city&poi=`；`sessionStorage['world-arrival-v1']` 承载驾驶卡 | 多一个可选字段；`check-links` 要兼核 hallPath；楼宇快览与 E 键入口分叉（有意为之） |
| **(b)** | 把 `about-pavilion.deepLink` 改成 `/world/about-pavilion/` | `/` 壳楼宇快览（爬虫/noscript 面）改指炫技页；纸面双胞胎只剩导航才能到；C 全覆盖少一条自然进 `/about/` 的进站；`check-links` 的 deepLink 语义被展厅污染，其它楼若仿效会丢掉案例页 |
| **(c)** | 展厅不接城市，独立页 | 与已锁「机器人的老家」+ C+B 架构正面冲突；到达条/回城/探索 n/12 全部没来源；E 键仍进 `/about/`，炫技页变孤儿 |

## 裁决

**走 (a)：`hallPath` 加法字段，`deepLink` 语义不动；URL 只承载身份，驾驶卡进 `world-arrival-v1`。**

## 执行口径（可直接写进任务书）

1. **字段与 URL**  
   - `Building.hallPath?: string`，例 `"/world/about-pavilion/"`，尾斜杠齐全。`cyber-city-buildings.json` 的 `schemaVersion` 仍为 `"0.1.0"`（加法不升版）。  
   - `deepLink` / `deepLinkStatus` 语义不变：纸面或案例权威 URL。`about-pavilion` 保持 `deepLink: "/about/"`。  
   - 城里 E / POI `navigate`：有 `hallPath` 则 `assign(base + hallPath + "?from=city&poi=" + id)`，否则 `assign(base + deepLink + "?from=city&poi=" + id)`。  
   - **DOM 楼宇快览、页头页脚、正文 CTA、noscript 列表一律仍用 `deepLink`**，禁止改成 hallPath（爬虫与无 JS 必须落到纸面/案例）。  
   - query 名锁死：`from`、`poi`。`from` 只认 `city`，其它值当缺失。`poi` 白名单 = `buildings[].id`（现 12 个）。非法 `poi` → 到达条不出现（与 `Areas.applyDeepLink` 无效 slug 同构）。  
   - 禁止：`src=` / `building=` / `hall=` 等别名；禁止把驾驶卡字段塞进 query；禁止改 `deepLink` 来「顺路」进展厅。

2. **快照最小字段集**（键名 `world-arrival-v1`，sessionStorage，禁止 localStorage）  

   必填：

   | 字段 | 类型 | 来源 |
   |---|---|---|
   | `v` | `1` | 本快照自己的版本，与 `SessionDump.schemaVersion` 不是同一个数 |
   | `poi` | string | 正在进入的 `building.id` |
   | `sessionId` | string | `dump().sessionId` |
   | `t` | number | `dump()` 末条事件 `t`，否则 `performance.now()` 相对会话起点 |
   | `exploreN` | number | 读 `localStorage['world-explore-v1']` 合法 id 个数（与 `ExploreProgress` 同键；dump 里没有此数） |
   | `exploreTotal` | number | 在册楼数（`buildings.length`），不要写死 12 |
   | `wroteAt` | number | `Date.now()` |

   可选（有则写，缺则 **省略键**，禁止 `null`）：`maxKmh`、`coneHits`、`respawns`、`poiEnters`。`maxKmh` 只从已有速度事件取 max；没有就不要键。

   禁止进快照：`neonColor`、楼名、`events[]`、`env`、坐标、速度序列、`speedDemon`（派生布尔，由展示层用 `maxKmh` 判断）、路径数组。楼名与楼色构建期从 buildings JSON 查表，单源。

3. **写入时机与失效**  
   - 抽 `snapshotArrival(building)`，由 `Areas` 的 `navigate` 闭包 **同步、先写后 `assign`**。不改 `PoiArrival` 状态机。前奏被中断、`navigate` 被弃 → 不写。  
   - 新文档读到 `poi` 与 query `poi` 不一致 → 当缺失，到达条不出现。  
   - 关标签即失效（sessionStorage）。禁止抄到 localStorage。

4. **Hall 页与 C 横幅**  
   - `WorldHallLayout` 包 `BaseLayout`，C 横幅代码路径自动存在。Hall 页用 `HallChrome` 做到达仪式；`[data-hall]` 下 C 横幅收成紧凑一行或视觉让位，禁止到达条喊两次。  
   - 无 query 打开 `/world/about-pavilion/`：页照常成立，到达条不出现。回城永远 `/?poi=about-pavilion`，不发明第二种出生协议。  
   - 本 ADR 只给 `about-pavilion` 加 `hallPath`。其它楼的 B 名单不在本包。

5. **SRD §12.7.1 补行措辞（只加一行 + 一句注，不改「不再建立」那一行）**  

   在路由总表现有 `/world/`「不再建立」行 **之下** 追加：

   > | `/world/{slug}/` | 楼内展厅 HTML（动效豁免区）。**不是**世界引擎入口：不挂载 `src/lab/world/**`，不进 Lab manifest，不走 Lab facade。slug 白名单 = `src/data/world-halls.json`；未知 slug 不生成。世界引擎入口仍是 `/`。 | index,follow；canonical 自指（BaseLayout 已去 query）；进 sitemap |

   表下加一句：

   > 「`/world/` 不再建立」否决的是 v1.1 Hybrid 的**世界引擎独立入口**；楼内展厅 HTML `/world/{slug}/` 不在该禁令范围内，也不构成第二套世界引擎。

   禁止：把 `/world/` 那一行改成 301 到 `/` 且误伤 `{slug}`；禁止把展厅登记进 `kind` / `budgetClass`；禁止拿 `/world-spike/` 改展厅。

6. **LHCI：展厅第一刀不进 collect**  
   - `lighthouserc.json` 在册 URL 不动。`/world/about-pavilion/` 本波次不加入 collect。  
   - `/about/` 四项 ≥95 的不降门照旧。  
   - 解锁条件（以后另开 ADR）：Hall-0 稳定（无引擎字节）+ 人门过一刀。禁止为了「看起来有性能分」提前加 URL——`assertMatrix` 的 `.*/website/.+` 会立刻按内容页 Perf ≥95 考核炫技页。

7. **G-Hall 门：L-TECH 原列表必要但不充分；`_astro/world.` 字面是否决陷阱**  
   Astro 路由 `src/pages/world/[slug].astro` 自己的 island 就可能打成 `_astro/world.*.js`。用「文件名含 world」当引擎证据 = 假红。G-D 继续排除 `world/` 前缀（`WORLD_RE` 会把路由名当引擎）；**不要**把展厅折进 G-D，另建 G-Hall。

   W2 第一刀（Hall-0 壳 + Hall-S 播放器）断言：

   | # | 断言 | 失败即 |
   |---|---|---|
   | G-Hall-1 | `dist/world/about-pavilion/index.html` 存在且站点爬虫 200；未知 slug 无产物 | FAIL |
   | G-Hall-2 | 该 HTML 及其静态引用的 JS **不得**出现 `lab/world`、`lab/modules/world`、`initAllLabFacades`、`mountWorld` | FAIL |
   | G-Hall-3 | 不得出现 rapier / `@dimforge` / 物理 `.wasm` | FAIL |
   | G-Hall-4 | 不得出现 `three/webgpu`、`WebGPURenderer`、TSL 城市场材质 | FAIL |
   | G-Hall-5 | 不得 `<script>` / preload `public/models/**`（含 `hero-robot` / `concept-garage` / `autodrive`） | FAIL |
   | G-Hall-6 | Hall-0 额外 JS = 0（只用 BaseLayout 已有内联）。W2b 播放器单独记账，gzip ≤20KB 目标、硬顶 ≤50KB（Hall-S）；超顶 FAIL | FAIL |
   | G-Hall-7 | `hallPath` 有值则 dist 对应页 200；`deepLink` 仍按现 `check-links` 核 | FAIL |
   | G-Hall-8 | 媒体 JSON 对账：sha256 / 字节 / 30fps / 无音轨 / 时长；总载荷 ≤2.5MB | FAIL |
   | G-Hall-9 | 每个 `<section data-scene>` 有 `data-bind`，URL 在 dist 200 | FAIL |
   | G-Hall-10 | e2e：`?from=city&poi=about-pavilion` 且 storage `poi` 匹配 → 到达条出现；非法 poi → 不出现；无 query → 不出现；noscript 首屏文字+poster 可见；`prefers-reduced-motion` 无 CSS animation | FAIL |

   允许：canonical / `<a href>` 含 `/world/about-pavilion/`；`/media/about-hall/` 视频；Hall 自己的 island 文件名带 `world` **但**内容满足 G-Hall-2..5。

   W3 若要在展厅懒加载机甲，必须另开 ADR 放宽 G-Hall-5，并仍禁 `src/lab/world/**` 与 rapier。本包不预放宽。

8. **接线波次**  
   - W2：页、layout、`world-halls.json`、HallChrome、SRD 一行、G-Hall 脚本、e2e 无参/有参。可先读 query，storage 在 W5 才有真实驾驶卡。  
   - W5：`arrival-snapshot.ts` + `Areas.ts` 单 writer 接线。禁止 W2 提前改 `Areas.ts`。

## 不重开清单

- C+B+A 架构；Voice Pod / Garage 不做第三层 3D 展厅。  
- 展厅不进 Lab manifest / LabStage / facade。  
- 展厅 HTML 不 import `src/lab/world/**`。  
- 不做自定义 View Transition（沿用 auto fade）。  
- `deepLink` 不被改成展厅路径。  
- 展厅第一刀不进 LHCI collect。  
- 本 ADR 已锁的字段名、query 名、快照必填集、SRD 补行语义、G-Hall 十条。禁止下一轮把展厅改成独立孤儿页，禁止用「文件名含 world」冒充引擎检测。

## NEEDS_LEIGE

无。进楼契约是工程口径，不消耗肖像、人分或发布权。PR 合入 `main` 仍按章程走 W6，不在本包。
