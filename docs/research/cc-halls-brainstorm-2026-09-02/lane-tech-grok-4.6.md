# L-TECH｜楼内层技术可行性与开工方案

范围：已拍板的 **C 全覆盖到达横幅** + **B `/world/<slug>/` 5–6 栋展厅** + **A 仅 concept-garage 跨页车辆状态**。项目根只读核代码；本文件是开工契约，不是再争论路线。

工作量单位：人日（单人、含 e2e/LHCI 回归预算，不含视觉调参死磕）。复杂度：S ≤0.5 人日 · M 1–2 人日 · L ≥3 人日或新 3D/采样面。

---

## §1 C 路线：到达横幅

### 1.1 现状：进站会丢掉全部驾驶会话

进站是整页 `location.assign`，**不带 query、不写 sessionStorage**：

```176:180:src/lab/world/areas/Areas.ts
          this.arrival.begin({
            buildingId: building.id,
            navigate:
              entry.action === 'navigate' ? () => location.assign(`${base}${entryUrl}`) : null,
          });
```

`entryUrl` 来自 `building.deepLink`（`cyber-city-buildings.json`）。`PoiArrival.finish()` 在 0.8s tween + 0.4s 定帧后才调 `navigate`（`PoiArrival.ts` L178–184）。注释写明 overlay / View Transition 归 CC-P1（`PoiArrival.ts` L4、`Areas.ts` L15–16）。

驾驶会话活在内存里：`window.__worldSession.dump()`（`src/lab/world/index.ts` L80–81、L487）。`dispose()` 会 `delete window.__worldSession`（同文件 L535）。**不在 `assign` 之前快照，横幅拿不到任何驾驶数据。**

`SessionTimeline` 不是轨迹记录仪。它是 500 条 ring + 漏斗 + 计数器（详见 §4 AutoDrive 行）。`log()` 的 `data` 只允许扁平 `string | number | boolean`（`SessionTimeline.ts` L388–404），**塞不进路径数组**。

### 1.2 传递方案：URL 身份 + sessionStorage 载荷（两者都要）

| 通道 | 存什么 | 为什么 |
|------|--------|--------|
| URL | `from=city` + `poi=<buildingId>` | 可刷新、可分享「从哪栋楼进来」；爬虫/LHCI 默认 URL **没有**这对参数 |
| `sessionStorage` | 压缩驾驶卡（见下） | 体积/隐私不进地址栏；同源 `assign` 后新文档可读 |

**不要**把 ring 500 条、坐标、速度序列放进 URL。**不要**只靠 URL：驾驶卡字段会膨胀，且 `SessionDump` 含 `sessionId` / 环境，不该变成外链。

建议键（对齐已有 `world-explore-v1` / `world-quest-collapsed-v1`）：

```text
sessionStorage['world-arrival-v1'] = {
  v: 1,
  poi: "lingua-tower",
  sessionId: "<uuid>",
  t: 184320,                 // dump 末条 t 或 performance.now()-t0
  coneHits: 3,
  respawns: 1,
  poiEnters: 4,
  poiInteracts: 1,
  exploreN: 4,
  exploreTotal: 12,
  maxKmh: 96,                // 从 events 里 world-speedtrap.kmh 取 max；没有则省略
  speedDemon: true,          // 任一条 isRecord 或 kmh≥90
  wroteAt: 1730000000000
}
```

写入时机：**`location.assign` 的闭包里、同步、先写后跳**。推荐抽 `snapshotArrival(building)`，由 `Areas` 的 `navigate` 闭包调用，不要改 `PoiArrival` 状态机。驾驶意图中断时 `navigate` 被弃（`PoiArrival.interrupt` L191–195），不会误写。

`poi` 白名单 = `cyber-city-buildings.json` 的 `buildings[].id`（12 个）。非法 id → 横幅不出现（与 `?poi=` 无效 slug 告警同构，`Areas.applyDeepLink` L262–267）。

楼名 / `neonColor` **不要进 URL、不要进 storage**：横幅组件构建期从 buildings JSON 查表（`CityMap.Building`，`CityMap.ts` L78–110）。单源，避免 storage 里的色值和 JSON 漂移。

### 1.3 组件放哪一层

**放 `BaseLayout.astro`，紧挨 `<main id="main">` 开槽之后、默认 slot 之前。**

理由（读了四份 layout）：

- 内容页全部经 BaseLayout：`CaseLayout`（work 详情）、`ArticleLayout`（insights / ai-lab）、`LabLayout`（TTS / 配置器）、以及 about / now / contact / work 索引 / home。
- **`/` 不用 BaseLayout**（`src/pages/index.astro` 独立壳）——横幅不会误出现在城里。
- **`/world-spike/` 不用 BaseLayout**（`world-spike/index.astro` L8）——验证场不染横幅。
- 不要只挂 `CaseLayout`：Voice Pod / Garage 的 live deepLink 是 `/lab/tts-cockpit/`、`/lab/car-configurator/`；About / Contact / Now / Insights 也是 C 覆盖面。

实现形态：

```text
src/components/city/ArrivalBanner.astro   // 构建期注入 12 楼 {id,title.zh,neonColor,deepLink} JSON
BaseLayout.astro                          // 引入；hidden 默认
src/lab/world/arrival-snapshot.ts         // 世界分包内：dump → 压缩卡 → sessionStorage
Areas.ts                                  // navigate 闭包：snapshot + assign(`${base}${url}?from=city&poi=${id}`)
```

横幅 DOM 建议（sticky，不滚劫持）：楼名 · 色点（`neonColor`）· 一行驾驶卡（时长 / 探索 n/12 / 可选最高速）· 「返回科技城」链到 `/?poi=<id>`（已有深链出生，`Areas.applyDeepLink`）。

### 1.4 零 JS 不渲染、LHCI 不降

纪律对齐现有壳：样式/逻辑内联、无独立 chunk（`ExploreProgress` 头注 L21：壳静态段零字节、LHCI 零影响）。

1. 标记默认 `hidden`（或 `display:none`）。无 JS：属性永不拿掉 → 不占布局、无 CLS。
2. BaseLayout **已有** `is:inline` 脚本（主题防闪 L52–62、统计 L152+）。横幅脚本同样内联，**第一行** `if (location.search.indexOf('from=city') === -1) return;`。
3. LHCI collect URL **全部无 query**（`lighthouserc.json` L4–11：`/` `/home/` `/work/` 案例 `/about/` 两个 Lab）。断言矩阵对非根路径 Perf ≥95（L36–42）。默认 URL 走 early-return，横幅保持 hidden → **LCP 仍是正文/海报，不新增请求**。
4. 禁止：noscript 里画横幅；构建期按 `Astro.url.search` 预渲染横幅（静态站 search 恒空，且会让无参 HTML 带横幅）。
5. 横幅 CSS 跟组件走，不要进 `global.css` 热路径以外的大文件；`prefers-reduced-motion` 只关装饰，字仍在。

GoatCounter：可加 `city-arrive:{poi}`（对齐 `lab-mount:` / `contact-click`）。非本段阻塞项。

### 1.5 SEO：canonical 已经去参数

```27:28:src/layouts/BaseLayout.astro
const canonical = new URL(Astro.url.pathname, Astro.site).href;
```

`link rel=canonical` 与 `og:url` 都用它（L67、L90）。`?from=city&poi=` **不会**进索引身份。不必 `noindex`；不必改 `robots.txt`。

JSON-LD 用 pathname（CaseLayout L40、ArticleLayout L39），同样无 query。

### 1.6 View Transition：C 不要做自定义转场

全站已有声明式跨文档 VT：

```301:304:src/styles/global.css
@view-transition {
  navigation: auto;
}
```

零 JS；Firefox 整页跳转。e2e 已在 SwiftShader 下把 `Transition was skipped` 当 UA 白名单（`e2e/world-spike.spec.ts` 头注、`docs/spec/e2e-test-plan.md`）。

`PoiArrival` 把 overlay/VT 标成 CC-P1。视觉稿「门禁扫描线」要写 `::view-transition-old/new`，会扩大 flake 面，且 C 的目标页是纸面正文——扫描线从赛博切到编辑部，收益低。

**C 结论：沿用现有 auto fade，不加 named transition。** 扫描线若做，只给 B 展厅，且排在横幅稳定之后。

回城链用已有 `/?poi=<id>`，不要发明第二种出生协议。

### 1.7 C 工作量

| 项 | 人日 |
|----|------|
| `world-arrival-v1` 契约 + `Areas` 接线 + 压缩卡字段表 | 0.3 |
| `ArrivalBanner.astro` + BaseLayout 内联脚本 + 回城 CTA | 0.5 |
| e2e：有参出现 / 无参 hidden / canonical 无 query / 非法 poi 不展示 / noscript 不可见 | 0.4 |
| LHCI 在册 URL 回归（确认无参页不降） | 0.2 |
| **合计** | **~1.4 人日** |

风险：漏写 snapshot（横幅永远「刚刚到达」空数据）——e2e 必须断言 storage 键存在且 `poi` 匹配。

---

## §2 B 路线：`/world/<slug>/` 展厅页

### 2.1 路由与 layout：新建页族，不复用 Lab 注册表

**不要**把展厅登记进 `src/lab/manifest.json` / `kind` 枚举 / `LabStage`。

Lab 契约现状：

- `kind` 只有 `webgpu-3d | audio-viz | svg-hmi | data-viz | world`（`contracts.ts` L42）。
- `budgetClass` 只有 `S | M | L | world`（L7–11）：S ≤50KB gzip JS；M ≤300KB；world 走 §12.7.2。
- `viewTransitionName` 必须 `^(demo|world)-[a-z0-9-]+$` 且全站唯一（L57、`manifest.ts` L24）。
- `LabStage.astro` L91–93 **每页拉 facade 客户端**：`initAllLabFacades()`。自动挂载、poster、启动按钮、GPU pause/resume。
- `facade.ts` 按 `deepLinkParams` 白名单滤 query（L51–59）；`mode` 目前只有配置器/world 的 `full`（配置器 L7–9 直接拒绝 `viewer`/`world`）。

展厅要的是「暗底 + 一招鲜 ≤30s + 底部进正文」，不是第二套 WebGPU Lab。硬塞 manifest 会：污染 `/lab/` 索引、抢 `viewTransitionName`、把 facade ~chunk 塞进本该过内容页 LHCI 的页、还要改 SRD §8.2。

推荐目录：

```text
src/data/world-halls.json          # slug 白名单 + trick 名 + 对应 buildingId（派生自 buildings，禁止第二份楼坐标）
src/layouts/WorldHallLayout.astro  # 包 BaseLayout；暗底 token；slot: ritual / trick / cta
src/pages/world/[slug].astro       # getStaticPaths = halls.json；未知 slug 不生成
src/components/city/HallChrome.astro  # 到达条（复用 C 的 storage）+ 回城 + 探索 n/12（读 world-explore-v1）
src/components/city/halls/*.astro  # 每栋一招鲜，零 three 默认
```

`WorldHallLayout` 走 BaseLayout → C 横幅自动有。展厅自己的「到达仪式」是暗底上的楼色条，避免和纸面横幅重复喊话：Hall 页可把 C 横幅收成一行，或 CSS `[data-hall] .arrival-banner { 紧凑态 }`。

### 2.2 与 SRD「不再建立 `/world/`」的张力（口径，不挡开工）

`SRD.md` §12.7.1 路由表（约 L1032）：**`/world/` 不再建立**——那是否决 v1.1 Hybrid「世界引擎独立入口」。master-plan §2.3 L138 仍写着 `/world/` 试验场，那是 Full Entry 之前的字。

B 的 `/world/<slug>/` 是 **楼内展厅 HTML**，世界引擎入口仍是 `/`。开工时必须在 SRD 路由表加一行，避免下一轮审计当回归：

| 路由 | 内容 | SEO |
|------|------|-----|
| `/world/{slug}/` | 5–6 栋轻量展厅（动效豁免区） | index,follow；canonical 自指（BaseLayout 已去 query）；进 sitemap |

这是文档修订，不是改引擎。

### 2.3 进站 URL：加 `hallPath`，不要改 `deepLink`

`check-links.mjs` 硬核 `buildings[].deepLink` 在 dist 有页（约 L307–321）。现在例如 `lingua-tower` → `/work/multilingual-cockpit/` live。

若把 `deepLink` 改成 `/world/lingua-tower/`：内容页仍在，但城里 E 键不再直达案例，C 全覆盖少一条自然入口。

建议 `Building` 加法字段（schemaVersion 不动，符合 SessionTimeline/POI 的加法纪律）：

```ts
hallPath?: string; // 例 "/world/lingua-tower/"
```

`Areas` navigate：有 `hallPath` 走展厅，否则走 `deepLink`；两者都拼 `?from=city&poi=`。正文 CTA 仍指向原 `deepLink`。

无展厅的楼（Now / Contact / Insights / AutoDrive 若只做 C）保持现状。

### 2.4 每栋 JS 预算

| 档 | 适用 | 预算 | 依据 |
|----|------|------|------|
| **Hall-0** | 纯 DOM/CSS/SVG | 额外 JS **0**（只用 BaseLayout 已有内联 + 横幅脚本） | 内容页 G-D：`/home/` 与内容页对 world **0 字节**（SRD §12.7.2 L1101） |
| **Hall-S** | Canvas2D / 小交互 | 懒加载 JS **≤ 50KB gzip**（对齐 Lab S，`contracts.ts` L8） | 同屏循环动画 ≤5（master-plan 第 6 章豁免 2，L287；任务书红线） |
| **Hall-M** | 禁止作为展厅默认 | 那是 Lab M / world | 配置器已在 `/lab/car-configurator/`（manifest M，257KB 记账） |

硬规则：

- 展厅 HTML **禁止**静态 `import` `src/lab/world/**`。`audit-budget.mjs` G-D 排除表含 `world/` 前缀（L358）——路径恰好叫 `world/` 的展厅 **会被 G-D 放过**。这是陷阱：引擎字节可以偷运进来门还是绿。必须加专项门：`dist/world/**/index.html` 不得出现 `_astro/world.` chunk / `models/` / rapier wasm（Garage 若只链到 Lab 页则仍零引擎）。
- `lighthouserc.json` 对 `.*/website/.+` Perf ≥95。展厅一旦进 collect URL 表，Hall-0/S 必须海报或纯 DOM 当 LCP。**先不要把展厅加进 LHCI collect**；过了再加。
- `prefers-reduced-motion`：循环停、交互结果用静态表。触屏可用（任务书）。

视觉 token：楼色用该栋 `neonColor`，双主轴青/品红只用 `neon-tokens.ts` 的路网语义（L8–13 写明楼色不归该文件）。不要 12 栋共用 `--neon-cyan`。

### 2.5 共享「到达仪式 / 回城 / 探索进度」

三件都已有世界侧实现，展厅只做 **DOM 只读投影**：

| 能力 | 世界侧（已有） | 展厅侧 |
|------|----------------|--------|
| 到达 | `PoiArrival` tween+hold；即将有 `world-arrival-v1` | HallChrome 读同一 storage；楼色条 |
| 回城 | `/?poi=` 深链出生（`Areas.applyDeepLink`） | CTA → `/?poi=<id>`；文案「开回门口」 |
| 探索 n/12 | `ExploreProgress`，键 `world-explore-v1`（L26–27、L96–110） | 只读 JSON 数组长度；**不要第二份计数器** |

`QuestLine` 是 5 站主链（`world-pois.json` L23：garage → voice-pod → agent-nexus → work-gallery → about-pavilion），**不是** 12 栋护照。展厅芯片用 ExploreProgress，不用 QuestLine。

折叠偏好 `world-quest-collapsed-v1` 与展厅无关。

### 2.6 与 `/world-spike/` 的关系

`/world-spike/` 是归档验证场：noindex、canonical → `/`、sitemap 剔除（`astro.config.mjs` L22–24；页头 L27–28）。e2e `world-spike.spec.ts` / `world-spike-perf.spec.ts` 仍以此页为驾驶被测面。

**禁止**拿 spike 壳改展厅。**禁止**让展厅挂 world `mount()`。spike 继续只服务驾驶/物理回归，直到用例迁到 `/?...`（页头注释已写待迁）。

### 2.7 对 e2e / sitemap / check-links 的影响

| 门 | 现在 | B 落地后必改 |
|----|------|----------------|
| sitemap | `@astrojs/sitemap` 只滤 `world-spike`（`astro.config.mjs` L24） | `/world/<slug>/` **会自动进 sitemap**（要的）。不要把展厅写进 spike 那条 filter |
| `check-links.mjs` | 核 buildings `deepLink`；`?poi=` id 必须在册 | `hallPath` 目标必须在 dist；CTA href 必须 200 |
| `e2e/site-health.spec.ts` | `CRAWL_PAGES` 无 `/world/`（L9–18）；`PENDING_ROUTES` 已空（`helpers.ts` L18） | 城里或页脚一旦链到展厅，爬虫会跟到；必须 200，禁止进 PENDING |
| LHCI | collect 7 个 URL，无展厅 | 第一刀不进 collect；Hall-0 稳定后再加 1 个样板 URL |
| `scripts/score-loop.mjs` | 综合分吃 `/` 与 `/home/` LHCI + e2e 通过率 + 视觉 + smoke3d | 展厅 e2e 失败会拉低 20% e2e 维；新用例必须稳定，禁止 flaky |
| G-D | `rel.startsWith('world/')` 排除 | **加 G-Hall**：展厅 HTML 零 world 引擎字节 |

B 共享基建工作量：**~1.5 人日**（layout + halls.json + HallChrome + G-Hall 门 + 1 个空壳 slug 打通路径）。每栋一招鲜另计 §4。

建议 B 名单（与 vis 稿收敛，技术上可开工）：Lingua Tower、Edge-Cloud Hub、Workflow Foundry、Works Gallery、About Pavilion。Voice Pod / Garage 已是成熟 Lab，**不要**再做第三层 3D 展厅。AutoDrive 见 §4：先 C 卡，不够再 B。

---

## §3 A 路线：Garage 跨页车辆状态

### 3.1 两边现读什么

**配置器（有完整状态机）**

- 契约：`ConfiguratorState { livery, paint, wheels }`，默认 `{ carmine, livery, machined }`（`presets.ts` L108–119）。
- 8 漆 / 2 轮 / 3 涂装（`PAINTS` / `WHEELS` / `LIVERIES`）。
- URL：`history.replaceState` 只写相对默认的差量（`engine.ts` L394–402）。manifest 白名单 `paint, wheels, livery, gl`（`manifest.json` L36）。
- 涂装走 glTF `KHR_materials_variants`（`engine.ts` L250–266、`presets.ts` L67）。
- `setParam` 热更（`engine.ts` L506+）。

**世界车（没有配置态）**

`VisualVehicle.ts` 只做：底盘位姿拷贝、前轮转角阻尼、轮滚转、悬挂、HDRI `studio_small_08_1k.hdr`（L18–19、L189–230）。`model.traverse` 只 `castShadow`（L171–173）。**零 `paint` / `livery` / `KHR_materials_variants`。**

世界 `deepLinkParams` 现为 `gl, vehicle, city, robot, ritual, quality, poi, shot`（`manifest.json` L54）。`index.astro` `PARAM_ALLOWLIST` 同表（L259）——**没有 `paint`**。SRD §12.7.1 L1058 写过 `?paint=` 与配置器、Hero 三处共享，**活代码未接**。Hero 配置器 `mode='viewer'` 仍抛错（`car-configurator/index.ts` L7–9）。

共享加载器 `src/lab/shared/gltf-loaders.ts` 给配置器 Draco/KTX2；世界 `VisualVehicle` 吃的是已经 load 好的 `GLTF`。变体开关必须在世界这条加载链上同样能读到 `KHR_materials_variants`（配置器已证资产有变体）。

### 3.2 localStorage 为主，URL 为辅

| 通道 | 用途 |
|------|------|
| `localStorage['world-vehicle-v1']` | 跨页、跨会话：「在车库改完，回城还是那辆」。隐私模式失败则会话内默认（ExploreProgress 同款 try/catch） |
| 配置器 URL `?paint=&wheels=&livery=` | 已有可分享深链，保持 |
| 世界 URL `?paint=` | 可选第二源：SRD 已写、allowlist 未接。分享「开着某漆的城」才需要。第一刀可只读 storage |

**不要**只用 URL：回城是 `/?poi=concept-garage`，配置 query 会被世界 PARAM_ALLOWLIST 丢掉。**不要**把整份 `SessionDump` 当车漆。

写回：配置器 `writeURL()` 旁同步 `localStorage`（同一 `ConfiguratorState`）。世界只读。冲突：storage 与配置器 URL 同时存在时，**配置器页以 URL 为准**（深链契约），写入后再覆盖 storage。

### 3.3 回城后重建时机

进站会 `location.assign` → `/` 整页重挂 → `VisualVehicle` 构造函数再跑一次。

正确时机：**GLTF 进场景之后、第一帧 tick 之前**（构造函数末尾，`setEnvironment()` 旁边）。`TransformSystem` 若仍在 `robot_idle`，车网格可能未显，但材质已设好，变车时直接是新漆。

不要等 `world-transform to=car` 才上漆：用户 `?poi=concept-garage` 非 ritual 出生时可能已是车（`AreasOptions.deepLinkPoi`）。幂等 `applyConfiguratorState(state)` 即可。

`pagehide` / facade `astro:before-swap` 会 dispose 世界；回城不是热更新，是冷重建。bfcache 若把 `/` 整页冻住，`pageshow` 再读一次 storage（防御性，第一刀可后置）。

### 3.4 A 工作量与坑

必须 **移植** 配置器的 `applyPaint` / `applyWheels` / `applyLivery`，抽到 `src/lab/shared/vehicle-look.ts`，两边调用。禁止在 `VisualVehicle` 按印象重写变体逻辑（资产结构陷阱 `VisualVehicle.ts` L20–26 已经很贵）。

| 项 | 人日 |
|----|------|
| 抽共享 `vehicle-look` + 配置器改调用 + storage 读写 | 1.0 |
| `VisualVehicle` 接入；确认世界 GLTF 带 variants | 0.8 |
| `/` allowlist 是否加 `paint`（可选） | 0.2 |
| e2e：改漆 → 回城 → 读 storage / 遥测或截图像素不是默认 Carmine | 0.5 |
| **合计** | **~2.5 人日** |

性能：换材质/变体是一次性，不占 CITY-03 循环配额。失败降级 = 保持 Carmine 默认，不抛。

**砍**：车库内再嵌一套城市 3D、或世界里实时同步未保存的拖动。A 只保证「出库后的车 = 配置器保存态」。

---

## §4 逐创意可行性表

宿主初稿 12 栋 + 横向 4 条（到达仪式 / 探索图腾 / Observatory 解锁 / 子页回城）。建议列：做 = 按原意开工；改 = 换数据已有的形态；砍 = 本阶段不划入 C/B/A。

### 4.0 先核实两件「特别核实」

**SessionTimeline 撑不住「试车场轨迹报告」原意。**

已有（`SessionTimeline.ts`）：

- 白名单事件族：lifecycle / ritual / drive / poi / camera / goal / challenge / perf / ux / error（L69–80）。
- `dump()`：`sessionId, startedAt, env, events[], dropped, counters, funnel`（L159–178）。
- `counters`：respawns、coneHits、poiEnters、poiInteracts、transforms、driveViewToggles、longFrames（L139–156）。**没有平均车速、没有里程。**
- `funnel` 只记首达墙钟 ms：reveal → robotIdle → transformStart → carReady → driveStart → firstPoiIn → firstPoiInteract（L129–137）。
- `world-speedtrap {kmh, isRecord}` 仅在测速区**驶离沿**最多 1 条 + 5s 冷却（`SpeedTrap.ts` L230–241）。`sessionMaxKmh` 活在 SpeedTrap 实例上（L57–58），**不进 dump**，除非事件还在 ring 里。
- 车速公式：`|forwardSpeed| * ticker.scale * 3.6`（`index.ts` L342–347；`SpeedTrap.ts` L185–189），只写 HUD `[data-ws-speed]`，**不 log**。
- ring 上限 500，溢出丢最旧（L22–23）。`data` 禁数组（L388–404）。

没有：`x,z` 轨迹、速度时间序列、圈速、平均速度、刹车曲线。要「轨迹网 / 热力赛道」必须 **新开采样缓冲**（例如 2Hz `{x,z,kmh}` 独立于 ring，上限几百点）。那是 L，且 Observatory 俯视叠加会碰 CITY-03 与移动端。

**ExploreProgress 撑得住「12 栋全亮解锁」。**

- 分母 = 在册 POI id，当前 12（`Areas.ts` L218–222 + `world-pois.json` 12 条）。
- 首次 `boundingIn` → `discover(id)` 去重（`Areas.ts` L193–198）。
- `localStorage['world-explore-v1']` = id 数组（`ExploreProgress.ts` L26–27、L96–110）。
- `n === total` 打 `explore-complete`（L67–70）。**只改 chip 文案，不激活楼、不改 reservedSlots。**
- 非强制、不锁楼（头注 L5–6）。解锁 Observatory 应是 **奖励**，不是门禁。

`reservedSlots` slot-18 建议主题就是 Skyline Observatory（`cyber-city-buildings.json` L311–320），尚未升入 `buildings[]`。

### 4.1 十二栋

| # | 创意 | 数据已有？ | 还需 | 复杂度 | 性能风险 | 建议 |
|---|------|------------|------|--------|----------|------|
| 1 | Lingua 巴别塔电梯 39 层 RTL 热力 | **没有 39 语种表**。TTS 实数 = `tts-manifest.json` **16** 条 locale（含 `ar-SA`/`he-IL` RTL）。buildings `role` 文案写「39 语种」（L81）是产品口号，不是数据集。工作案例 `multilingual-cockpit.mdx` 是叙事+`evidenceLevel: L2`，不是 39 行字宽矩阵 | 字宽测量可在 16 语种上现场 `measureText`；不要编 39 层 | M | 低（DOM/SVG） | **改**：16 语种字宽/RTL 热力，数据 = tts-manifest。B 首选。砍 39 层电梯滚动（无数据 + 像营销长页） |
| 2 | Voice Pod 外墙随 TTS 频谱呼吸 | TTS Lab 成熟：`/lab/tts-cockpit/`，16×5 预生成 mp3+json，`deepLink` live。世界有 `VoicePod.glb` | 城市场景里给外墙加音频驱动 shader = 循环动画，占 CITY-03 配额，且进楼后世界 **dispose**，外墙动画游客看不见 | L（城里）/ S（Lab 已有频谱） | 高（世界 shader） | **砍** B/城里声纹立面。C 横幅进现有 Lab。若要「一招鲜」，Hall-S 用 **已有波形 JSON** 做一次播放，不要麦克风实时（权限+移动端+无语料） |
| 3 | Agent Nexus 指挥塔 + 进楼变回机器人 | 埋点可映射成假日志（transform / poi / quest）。`deepLink` = `/ai-lab/` **fallback**（buildings L119–120），没有专页。`TransformSystem` 在 `/` 世界里，进站后世界已卸载 | 「车变机器人」必须发生在 **跳转前** 的世界里，展厅页没有车 | 世界侧 M；展厅 DOM S | 中（多一次变形） | **改**：跳转前可选 `world-transform to=robot`（仅本栋 interact）；展厅 = 静态派单时间线（用 arrival 卡 + 固定文案，禁止假装实时集群）。不要 ops 大屏 WebGL |
| 4 | Edge-Cloud 算力/时延滑块改路由 | 案例 `/work/llm-capability-layering/` live，`evidenceLevel: L3`。**没有**现成滑块模型或路由仿真器 | 纯前端示意表即可，不要真推理 | S–M | 低（DOM） | **做** Hall-0/S：双滑块 → 端/云/降级三路高亮。砍 3D 天平物理 |
| 5 | Workflow Foundry 双传送带赛跑 | 案例 `/work/ai-native-workflow/` live。没有传送带动画资产 | CSS/SVG 履带即可 | M | 中（infinite 动画易超配额） | **改**：一次赛跑（按钮触发，播完静止），不要 infinite。reduced-motion = 终态对照表 |
| 6 | Now Signal 电波滚动电报 | `/now/` + `src/content/now/entries.json` 单源（`now/index.astro` L3–18） | 无 | S | 低；infinite 滚动要克制 | **砍 B**。C 横幅足够；正文已是电报。展厅重复 Now 页无增量 |
| 7 | AutoDrive 试车场报告 | **部分**：coneHits / respawns / poi 计数 / 时长 / 偶发 maxKmh。`deepLink` = `/work/` **fallback**（L135–137），**没有智驾案例页**。有 `AutodriveLab.glb` | 轨迹缓冲（新）；专页内容（新） | 报告卡 S；轨迹 L | 轨迹采样+绘制 = 中高 | **改**：C/B 做「本局驾驶卡」（压缩 arrival 载荷）。**砍**轨迹打印/赛道热力，除非单独立项采样器。不要假装有智驾案例 |
| 8 | Concept Garage 车 = 配置器的车 | 配置器状态机完整；世界车未读。Lab 路由已成熟 | 共享 `vehicle-look` + storage，见 §3 | M–L | 低 | **做 A**。B 展厅 **砍**（会变成 Lab 的劣质拷贝） |
| 9 | Works Gallery 证据灯亮度 | `content.config.ts` `evidenceLevel: L1–L4`（L12–13、L50）。现 3 篇 work，均有等级。索引已用 `EvidenceBadge` | 无新数据 | S | 低 | **做** Hall-0：3 柜亮度 = L 级。柜数随 collection 长，不要做假 12 柜 |
| 10 | Insights Archive CLI 热敏纸 | 2 篇 insights，有 `thesis`。无全文检索（SRD 把 Pagefind 放 Phase 4 候选） | 客户端滤 2 篇可以；Pagefind 超范围 | S | 低 | **改**：终端 UI 滤标题/thesis。**砍**真 CLI/热敏打印动画（无检索后端） |
| 11 | About 星图 + 履历地铁 | `about/index.astro` 已有三问题叙事 + 职业主线（物联网→…→AI 工作流，L3–4、L29+） | 地铁图是展示层 | M | 低 | **做** Hall-0/S：地铁站 = 现有主线节点，点站滚到对应叙事。砍 WebGL 星图 |
| 12 | Contact 选频道发射脉冲 | 四方向 + mailto 已在 `contact/index.astro` L24–48。邮箱 JS 组装防爬 | 脉冲 CSS | S | 低 | **砍 B**。C 横幅 + 现有四频道足够。脉冲易俗，且 Contact 是转化页，别挡 mailto |

### 4.2 横向四条

| # | 创意 | 数据/机制已有？ | 还需 | 复杂度 | 性能风险 | 建议 |
|---|------|-----------------|------|--------|----------|------|
| H1 | 到达仪式（泊车→showcase→扫描 VT→展厅） | 泊车圈+E+0.8s+0.4s **已有**。VT auto **已有**。扫描线 **没有** | 可选 `::view-transition-*` 仅 B | 核心 0（已交付）；扫描线 M | SwiftShader VT 已 flake | **做** 现有前奏 + C/B 快照。扫描线 **改期**，不进第一刀 |
| H2 | 12 图腾点亮 | ExploreProgress chip 已是 n/12，非六边形图腾墙 | 展厅/HUD 投影 | S | 低 | **改**：复用现有胶囊 chip + 展厅只读。不要第二套 12 灯 HUD（左上已挤 Quest） |
| H3 | 12 全亮解锁 Skyline Observatory | `explore-complete` 事件有；slot-18 预留有；**无楼、无镜头、无轨迹网** | 升槽位进 `buildings[]` + `poi_showcase-*` + 2D 地图 DOM；轨迹另说 | 解锁+2D 地图 M；3D 观景台+轨迹 L | 高（新楼 H 档 GLB + 俯视） | **改**：n/12 满时 chip 完成态 + 小地图多一个 DOM 入口，进 **2D 站点图**（buildings JSON 坐标已有）。**砍**上帝视角轨迹网（无轨迹数据，见 4.0） |
| H4 | 子页回城隧道 VT | `/?poi=` 已能停回门口 | 横幅/Hall CTA | S | 同 H1 | **做** 链接级。**砍**时空隧道自定义 VT |

---

## §5 实施顺序与验收命令

原则：先共享契约，再 C（全覆盖、改动面在 layout+进站一行），再 B 空壳打通门禁，再按「数据已在、JS 最瘦」的楼填一招鲜，A 与 Observatory 放后（A 动 CarConcept 加载链；Observatory 依赖 12 栋探索已可玩）。

项目根命令只列验收用；本任务未跑。

### 步 0 — 契约（0.5 人日）

1. 冻结 `world-arrival-v1`、`world-vehicle-v1` 字段表（写进 SRD 观测规格加法段，schemaVersion 不动）。
2. `Building.hallPath?` 类型 + JSON 1–2 栋试点。
3. SRD §12.7.1 增 `/world/{slug}/` 展厅行，注明不是世界引擎入口。

验收：`pnpm astro check`（若环境允许）。本任务禁跑。

### 步 1 — C 横幅（1.4 人日）← **先做**

共享组件：`ArrivalBanner.astro`。接线：`Areas` snapshot + query。

验收（ verd 后）：

```bash
pnpm test:e2e -- e2e/site-health.spec.ts e2e/home.spec.ts
# 新增 e2e/city-arrival-banner.spec.ts：
#   /work/multilingual-cockpit/ 无 query → [data-arrival-banner] hidden
#   注入 sessionStorage + 同 URL ?from=city&poi=lingua-tower → 可见、楼名/色值来自 JSON
#   document.querySelector('link[rel=canonical]').href 无 search
#   poi=not-a-building → 仍 hidden
node scripts/check-links.mjs dist/
# LHCI 在册 7 URL 回归：pnpm lhci:local   （无参页，横幅不得进入 LCP）
```

### 步 2 — B 空壳 + HallChrome + G-Hall 门（1.5 人日）

先 1 个 Hall-0（建议 Works Gallery：数据最少、无交互预算）。`src/pages/world/[slug].astro` + layout。

验收：

```bash
node scripts/check-links.mjs dist/          # hallPath 200；deepLink 仍 200
node scripts/audit-budget.mjs dist/         # 新 G-Hall：dist/world/** 零 world. chunk
pnpm test:e2e -- e2e/site-health.spec.ts    # 从 / 或 CTA 爬到展厅 200
# sitemap-0.xml 含 /world/work-gallery/ ，不含误伤；world-spike 仍剔除
```

### 步 3 — B 一招鲜，顺序固定

| 序 | 楼 | 形态 | 人日 | 验收要点 |
|----|----|------|------|----------|
| 3a | Works Gallery | 证据柜亮度 = `evidenceLevel` | 0.8 | 柜数 = 非 draft work 篇数；点柜 → `deepLink` |
| 3b | Lingua Tower | 16 语种字宽条，RTL 行 `dir=rtl` | 1.5 | locale 集 ⊆ tts-manifest；reduced-motion 静态条 |
| 3c | Edge-Cloud Hub | 双滑块三路高亮 | 1.2 | 无网络请求；CTA → `/work/llm-capability-layering/` |
| 3d | About Pavilion | 地铁站 = about 主线节点 | 1.2 | 与 about 页同一叙事顺序，禁止新编履历 |
| 3e | Workflow Foundry | 一次赛跑 SVG | 1.5 | 动画非 infinite；同屏循环 ≤5 |

每栋后：该页手测 + `pnpm test:e2e -- e2e/site-health.spec.ts`。不要每栋加 LHCI collect。

### 步 4 — A Garage 跨页车（2.5 人日）

共享 `vehicle-look` + storage + `VisualVehicle`。

验收：

```bash
pnpm test:e2e -- e2e/car-configurator.spec.ts
# 新增：配置器改 paint=abyss → localStorage world-vehicle-v1
#       再打开 /?poi=concept-garage 仪式后，车漆不是默认 Carmine（截图或材质名探针）
```

回城重建：冷挂载构造函数末尾 apply（§3.3）。

### 步 5 — H3 Observatory（可选，1.5 人日，排最后）

仅当步 1+2 绿：`explore-complete` → chip 完成态已有，再加「站点图」页（可挂 `/world/skyline-observatory/`，slot-18 升册）。地图点 = `buildings[].position`，线 = 城区。**禁止**画 SessionTimeline 当轨迹。

验收：清 storage 时入口隐藏；12 id 写入 `world-explore-v1` 后入口出现。

### 步 6 — 明确不做（本迭代）

- 自定义 View Transition 扫描线 / 回城隧道
- Voice Pod 城市场景频谱外墙、麦克风
- AutoDrive 轨迹/赛道报告、假智驾案例
- 39 层巴别塔
- 展厅复用 Lab manifest / facade / LabStage
- 把 `/world-spike/` 改成展厅
- 世界引擎进展厅 chunk
- Pagefind、ops 大屏 WebGL、3D 天平

### 步序依赖图

```text
arrival 契约 ─┬─ C 横幅 ─────────────── 全内容页绿
              │
              └─ B 空壳+G-Hall ─┬─ Gallery / Lingua / Edge / About / Foundry
                                └─（可选）Observatory 2D
A Garage ── 独立于 C，建议 C 绿之后（共用进站 snapshot 习惯，但文件域正交）
```

文件域正交提示（防并行撞车）：C 动 `BaseLayout` + `Areas.ts`；B 动 `src/pages/world/` + `world-halls.json` + `audit-budget.mjs`；A 动 `presets` 消费方 `engine.ts` + `VisualVehicle.ts` + `shared/vehicle-look.ts`。`Areas.ts` 若 B 要读 `hallPath`，与 C 的 snapshot **同一 PR 或 C 先合**。

---

## 附录：关键锚点速查

| 主题 | 锚点 |
|------|------|
| 进站跳转 | `Areas.ts` `location.assign` ~L179 |
| 前奏时序 | `PoiArrival.ts` `TWEEN_DURATION=0.8` `HOLD_DURATION=0.4` |
| 会话导出 | `index.ts` `__worldSession.dump` L487；dispose 删除 L535 |
| 埋点白名单 | `SessionTimeline.ts` `WHITELIST` L69–80 |
| 探索持久化 | `ExploreProgress.ts` `STORAGE_KEY` L26 |
| 测速事件 | `SpeedTrap.ts` `finishPass` L230–241 |
| Lab 契约 | `contracts.ts` `labModuleSchema` L13–63 |
| 配置器状态 | `presets.ts` `ConfiguratorState` L108–119；`engine.ts` `writeURL` L394–402 |
| 世界车视觉 | `VisualVehicle.ts` 全程无 paint |
| canonical | `BaseLayout.astro` L28 |
| VT | `global.css` L302–304 |
| G-D 排除 `world/` | `audit-budget.mjs` L358 |
| sitemap 滤 spike | `astro.config.mjs` L24 |
| LHCI URL | `lighthouserc.json` L4–11 |
| `/` 参数白名单 | `index.astro` `PARAM_ALLOWLIST` L259 |
| 12 楼数据 | `cyber-city-buildings.json` `buildings` L76–272 |
| TTS 16 语 | `tts-manifest.json` `locales` 16× `code` |
