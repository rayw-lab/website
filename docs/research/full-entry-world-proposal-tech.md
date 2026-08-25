# 全站入口 world 化技术提案：`/` 直接进入 folio 级 3D 试验场

> **一句话定位**：用户要求「打开 website 就是炫技 3D 场景（folio 级），而不是现在的 HTML 宪法首页 + 灰盒 world-spike」。本文回答这件事**在 GitHub Pages 纯静态 + 现有 CI 门禁 + 依赖红线**约束下怎么做：路由怎么改、folio-2025 还要搬哪几件、预算怎么重新定义、两套现有 world 代码怎么合体、风险在哪里止损。

## 0. 文档信息

| 项 | 值 |
|---|---|
| 版本 | v1.0（提案，未裁决） |
| 日期 | 2026-08-25 |
| 作者 | 云端子代理（技术架构师角色） |
| 上游输入 | `docs/research/folio-gap-and-reuse-report.md`（复用总账）、`docs/research/bruno-simon-folio-source-teardown.md`（源码拆解）、`docs/spec/SRD.md` §12.7（world 专章）、`astro.config.mjs`、`scripts/audit-budget.mjs`（G-A~G-G 门禁）、`lighthouserc.json` |
| 现状基线 | `/` = HTML 宪法首页（首屏 <200KB gzip、Lighthouse 四项 ≥95、零 world 字节断言 G-D 保护）；`/world-spike/` = 公开灰盒路由，`?impl=` 双实现（默认运动学 spike / `?impl=engine` folio 移植引擎） |
| 性质 | 本文**与现行 SRD §12.7.1 存在有意冲突**（SRD 选定「/world/ 独立壳 + 显式进入」，本文提议「/ 即世界」）。若采纳，需按 §8 清单修订 SRD/PRD，冲突期以 SRD 为准 |

### 0.1 执行摘要（五句话）

1. **路由**：`/` 变为 world 入口壳（静态 HTML 壳仍然存在——它就是加载屏与降级态），HTML 宪法首页整体平移到 `/home/`，内页 URL 全部不动（C-5 约束只锁内页，首页职责转移属可控例外）。
2. **移植**：最小可炫首屏 = 现有引擎层 + 再搬 6 件（PhysicsVehicle / VisualVehicle 轮同步段 / MeshGridMaterial / Grid / PreRenderer / Intro+Reveal 合并版），约 **1,130 行新 TS**；`static/` 资产**首版搬 0MB**（地面程序化、车用 CarConcept 豁免件、圆环是 TSL shader）。
3. **门禁**：Lighthouse 四项 ≥95 的「首页考核」移交 `/home/`；`/` 改为 **A11y/BP/SEO ≥95 + Perf ≥90（阻断线 80）** 的世界壳口径；`audit-budget.mjs` 的 G-A/B/C/D 重定向到 `home/index.html`，`/` 增设世界壳专项门禁。
4. **合体**：`src/lab/world/` 引擎层是底盘，spike 四模块（vehicle/carRig/inputs/camera）按 world-spike-log §8 既定约定插入——carRig 并入 VisualVehicle、ChaseCamera 参数喂给 View、spike 输入映射并入 Inputs 动作表、运动学 vehicle 降级为低端回退档，`?impl=` 分叉与 `spike/engine.ts` 装配器退役。
5. **红线**：React/R3F/Lenis 零引入（本来就用不上）；gsap → `Ticker.delay` + 手写缓动（已在 Ticker/Nipple 落实，Reveal 照此办理）；howler → Phase C 手写 WebAudio；运行时依赖维持 three + rapier 两个。

---

## 1. 目标态路由架构

### 1.1 方案对比

| 方案 | 机制 | 判定 |
|---|---|---|
| **W1（推荐）：`/` = world 入口壳，`/home/` = HTML 宪法页** | `src/pages/index.astro` 重写为世界壳（poster LCP + 30 秒结论区 + noscript 六导航 + 引导脚本 ≤15KB）；载入完成后**自动挂载**世界（详见 1.3 挂载策略）；现宪法首页整体平移到 `src/pages/home/index.astro` | ✅ 满足「进去就是炫技」；SEO/a11y 有 HTML 壳兜底；内页零改动 |
| W2：`/` 保持 HTML 首页，Hero 区整块换成自动挂载的世界视口 | 首页五区块保留，Hero canvas 化 | ⛔ 半吊子：世界被压在一个 Hero 框里不是「进去就是世界」；且首页 200KB/四项 ≥95 门禁与 three 首包不可能同页共存 |
| W3：`/` meta-refresh / JS 跳转到 `/world/` | 静态跳转页 | ⛔ GitHub Pages 无服务端 301，meta-refresh 是 SEO 反模式（首页权重最高的一页变成空壳跳板），且多一次导航打断「进去就是」的体验 |
| W4：维持现状（`/` HTML + `/world-spike/` 入口链接） | 不动 | ⛔ 即用户明确否掉的现状 |

**选 W1。** 关键认知：bruno-simon.com 的「进去就是 3D」也不是裸 canvas——它的 HTML 本体就是加载屏 + canvas + noscript，我们做同构的事，只是把加载屏做成「30 秒结论区」（定位语 + 三支柱硬数字），加载屏本身就是招聘方速览页。

### 1.2 目标态路由总表

| 路由 | 内容 | SEO 口径 |
|---|---|---|
| `/`（= `https://rayw-lab.github.io/website/`） | world 入口壳 + 自动挂载世界。壳含：H1 定位语、三支柱硬数字、六导航 `<a>` 链接（noscript 与爬虫可达）、「跳过 3D」链接（首个可聚焦元素）、poster（LCP 元素） | canonical 自指；`WebSite` + `Person` JSON-LD 留在 `/`（首页权重不外流）；index,follow |
| `/home/` | 现宪法首页整体平移（五区块、Bento、Hero poster 舞台） | index,follow；不是 canonical 重复——它与 `/` 内容职责已分离（`/` 是体验入口，`/home/` 是内容总览）；`/` 壳内「跳过 3D」与页脚均链向它 |
| `/work/`、`/insights/`、`/lab/`、`/about/` 等内页 | 完全不动（C-5） | 不变 |
| `/world-spike/` | **归档**：合体完成后改为 ≤1KB 静态占位页（说明 + 链接到 `/`），一个版本周期后删除路由 | noindex 起，避免与 `/` 内容重复 |
| `/world/` | **不再建立**。SRD §12.7.1 原规划的 `/world/` 正式路由由 `/` 取代——世界只有一个入口，避免双路由双份考核 | — |

**站内链接调整**：全站页头 logo/「首页」→ `/`；页脚与面包屑补「站点总览」→ `/home/`；内容页「返回世界」按钮 → `/`（带 `?poi=` 恢复位置，经 sessionStorage）。

### 1.3 `/` 的挂载策略（「进去就是」与门禁的平衡点）

facade 现行纪律是「显式点击才挂载」（SRD §12.4），照搬到 `/` 就不是「进去就是炫技」。提议 `/` 使用**自动挂载**，但保留 facade 的全部拦截条件：

```text
window.load 事件后（关键路径已清空）
  └─ 满足全部条件才自动挂载：
       ① 非 prefers-reduced-motion  ② 非 Save-Data  ③ 视口宽 ≥ 768px 或用户已显式点过「进入」
       ④ WebGPU 或 WebGL2 可用
  └─ 任一不满足 → 壳静态呈现（poster + 显式「进入 3D」按钮 + 完整 HTML 内容），
     触屏窄屏默认此态（虚拟摇杆世界改为显式进入，与 facade pointerFine 规则一致）
  └─ 挂载后：Intro 进度圆环吃 ResourcesLoader 进度 → 任意输入 Reveal（folio-2025 式）
```

- 自动挂载放在 `load` 之后而非 idle 竞态：保证 LCP（poster）与 FCP 完全不受 world 分包影响，Lighthouse 打分窗口内主线程尽量干净（Perf 影响评估见 §6）。
- 桌面宽屏 = 目标受众（招聘方/技术同行）主场景，「进去就是」在此不打折；移动端降级为显式进入不算违约——folio 本身在低端机也是先出加载屏。

---

## 2. folio-2025 最小可炫首屏移植集

### 2.1 判定标准

「最小可炫」= 打开 `/` 后 8 秒内（Fast 4G）看到：**folio 同款网格地面亮起 → 进度圆环收拢 → 任意输入 → 镜头拉起 → CarConcept 可驾驶、轮子真转、有物理手感**。据此逐件裁决：

| 候选件 | 必需？ | 依据 |
|---|---|---|
| **Intro（进度圆环，342 行）+ Reveal（三步状态机，236 行）→ 合并 `Reveal.ts` ~200 行** | ✅ 必需 | 「炫技首屏」的本体就是这套开场编排（圆环吃加载进度 → Grid 亮起 → reveal 半径弹开 → 镜头拉起）。没有它 = 灰盒 spike 换个路由，用户诉求不成立。gsap 补间全换 `ticker.delay` + 手写缓动 |
| **Player（676→~200 行）** | ✅ 必需（**已移植**，在 `src/lab/world/player/Player.ts`） | 意图层 + respawn + 翻车自救；引擎层已就位，无新增工作量 |
| **PhysicsVehicle（590→~450 行）** | ✅ 必需 | folio 手感的全部来源（Rapier `DynamicRayCastVehicleController` + 三 collider 底盘 + 原封参数表）。现 spike 的运动学 vehicle 只是「能开」，不是「folio 级手感」——两者差距正是用户不满的核心 |
| VisualVehicle 轮同步段（546 中取 ~120 行） | ✅ 必需 | 轮子不转 = 车在「滑」，炫技即穿帮 |
| MeshGridMaterial（156 行，零改）+ Grid（101→~80 行） | ✅ 必需 | folio 同款地面颜值，零美术投入，替代灰盒 MeshStandard 地板 |
| PreRenderer（34 行，零改） | ✅ 必需 | shader 预热防首帧白屏/卡顿——首屏体验件 |
| **Areas 五件套（Zones/References/Respawns/Area/Areas + InteractivePoints）** | ⛔ 首版非必需 | Zones/References/Respawns **已移植**（引擎层就位）；Area/Areas/InteractivePoints（~430 行）是 Phase B 内容空间化交付物。首版用 **3~5 块硬编码 TextCanvas 标牌**（案例岛/实验区/退出方向指示）替代，够撑住「世界感」而不引入 POI 数据管线 |
| Wheel（16 行）+ maths 补函数（+60 行） | ✅ 顺手带上 | 滚轮缩放与 Reveal 缓动的零成本依赖 |

**新增移植工作量合计：~1,130 行 TS**（PhysicsVehicle 450 + Reveal 200 + VisualVehicle 120 + MeshGridMaterial 160 + Grid 80 + PreRenderer 40 + Wheel 20 + maths 60），全部有 folio 逐行对照，无探索性开发。加上壳页重写与合体改造（§4），是一个中等强度的移植任务，不是新造引擎。

### 2.2 资产从 `static/` 搬多少 MB：**首版 0MB**

| 资产需求 | 来源 | 体积 | 从 folio `static/` 搬？ |
|---|---|---|---|
| 地面 | MeshGridMaterial 程序化（TSL） | 0 | 否（是代码不是资产） |
| 进度圆环 | Intro 的 TSL 弧线 shader | 0 | 否 |
| 玩家车 | `public/models/car-concept/`（既有，豁免复用） | 3.5MB（已在库） | 否 |
| 环境光 | `public/hdri/studio_small_08_1k.hdr`（既有） | ~0.35MB（已在库） | 否 |
| 标牌文字 | TextCanvas 运行时 Canvas 生成 | 0 | 否 |
| 解码器 | three r185 内置 draco/basis | 0 | 否（无需搬） |
| （可选）POI 键位图标 | `static/interactivePoints/*.ktx` | ~12KB | Phase B，倾向按站点视觉重绘 |
| （Phase C）精选 SFX | `static/sounds/{vehicle,hits,rolling,...}` | ≤1MB | 逐文件核权属，CC0 兜底 |

结论与 gap 报告 §7 一致：folio `static/` 197MB 里能搬的只有 ~1.1MB 工程性小件，且**没有一件挡在「最小可炫首屏」的路上**。本提案不改变资产台账任何口径；`public/` 净新增为 0，G-E（≤40MB）与黑名单 G-F 均无压力。

---

## 3. GitHub Pages 硬约束下的执行口径

### 3.1 无后端

- 一切皆静态文件：Rapier wasm、GLB、HDRI 全走 `public/`/`_astro/` 静态分发；无 SSR、无 API 路由（`/` 壳页照常 prerender）。
- `?poi=`/`?paint=` 深链纯前端解析（query 参数不参与静态路由匹配，Pages 天然支持）；跨页状态走 sessionStorage，不存在服务端会话。
- 无服务端 301：`/world-spike/` 的归档只能用静态占位页 + `<link rel="canonical">` 指向 `/`，不能真重定向——这是 §1.2 归档方案的原因。
- 多人/排行榜维持「永久不做」（gap 报告 §6.3）：入口 world 化不改变这一裁决。

### 3.2 base `/website`

- `site: 'https://rayw-lab.github.io'` + `base: '/website'` 维持不变；世界内**一切**运行时资源 URL 必须经 `import.meta.env.BASE_URL` 拼接（spike 与配置器已有成熟写法，PhysicsVehicle/Reveal 无资源加载、不新增风险点）。
- Vite 侧已就绪：`vite-plugin-wasm` + `build.target: 'esnext'`（顶层 await 直出）+ `optimizeDeps.exclude: ['@dimforge/rapier3d']`，本提案零配置变更。
- 陷阱备忘：`/` 壳里的六导航、跳过链接、canonical、JSON-LD `url` 字段全部带 base；`check-links.mjs` 现有断链检查覆盖之。

### 3.3 CI 门禁改造清单

| 门禁 | 现状 | 目标态 |
|---|---|---|
| `lighthouserc.json` URL 表 | 6 页含 `/website/` | `/website/` 保留（改用世界壳断言组）；**新增 `/website/home/`**（继承原首页断言组）。LHCI 用 `assertMatrix` 按 URL 分组断言 |
| `audit-budget.mjs` G-A/G-B（首页 200KB / 分项） | 考核 `dist/index.html` | 重定向到 `dist/home/index.html`；`/` 壳另设专项：HTML+CSS ≤35KB、**引导 JS ≤15KB**、poster ≤40KB（即世界挂载前的静态壳仍按首页纪律核算） |
| G-C（首页零重资产） | 考核 `dist/index.html` | 重定向到 `home/index.html`；`/` 壳的静态标签同样零重资产——world 分包只允许经引导脚本动态 import，**HTML 里不得出现 three/GLB/HDRI 的 `<script src>`/`<link preload>`**（保 LCP 与 Lighthouse 窗口干净） |
| G-D（零 world 字节断言） | 保护「lab/、world/、world-spike/ 之外的所有页」 | 排除表加入根 `index.html`；`/home/` 与全部内容页**继续受保护**——入口 world 化不许 world 字节渗入内容层（AP-9 不变） |
| G-G（模块预算对照 manifest） | world 未注册 | world 以 `budgetClass:'world'` 注册进 manifest（JS ≤900KB / 资产 ≤12MB 上限已在脚本 `BUDGET_CLASS_CAPS` 就位），chunk 按 slug 命名使实测生效 |
| 新增：`/` 壳交互前零 world 字节冒烟 | 无 | Playwright 断言：`/` 打开后、自动挂载触发前，无任何 `_astro/world*`/`models/`/`hdri/` 网络请求（e2e 既有基建可直接写） |

### 3.4 首屏预算如何重新定义（world 路由考核 vs 首页考核）

核心转变：**「首页」这个考核对象一分为二**——`/` 考核「壳 + 世界」双段，`/home/` 全额继承原首页宪法。

| 考核对象 | 旧口径（现状） | 新口径（提案） |
|---|---|---|
| `/`（世界入口） | 首屏 <200KB gzip；四项 ≥95；零 world 字节 | **壳段**（交互前）：静态传输 ≤90KB gzip（HTML+CSS 35 + JS 15 + poster 40）；LCP = poster ≤2.5s。**世界段**（load 后）：首屏可玩 JS ≤500KB gzip、资产首包 ≤5MB、加载→可驾驶 ≤8s @Fast 4G、桌面 60fps/中端移动 30fps（SRD §12.7.2 原表全部平移到 `/`） |
| `/home/` | —（不存在） | 首屏 <200KB gzip（常态 ≤120KB）；Lighthouse 四项 ≥95；零 world 字节——**原首页宪法一字不改地由它继承** |
| 内容页/Lab 页 | 各自既有口径 | 不变 |

---

## 4. 与现有两层实现的合体方案

### 4.1 现状：一页两实现，互不侵改

| 层 | 位置 | 规模 | 有什么 | 缺什么 |
|---|---|---|---|---|
| **engine 层**（folio 移植） | `src/lab/world/` | 21 文件 3,211 行 | Game 两阶段 init、Ticker/Events/Viewport/Quality、Rapier Physics、Inputs 动作表 + filters、Nipple、View、Player 意图层（`physicalVehicle` 挂点空置）、World 灰盒 step、Zones/References/Respawns | **车**（PhysicsVehicle/VisualVehicle）、Reveal、folio 颜值（GridMaterial） |
| **vehicle 层**（spike） | `src/lab/modules/world/spike/` | 7 文件 1,441 行 | 可驾驶闭环：KinematicVehicle、carRig（CarConcept 轮/转向节点）、ChaseCamera、DriveInputs、灰盒场景 + 锥桶、FpsMeter、完整 dispose | 物理手感（运动学非动力学）、folio 开场、引擎级系统性 |

`/world-spike/` 壳页注释已写明合流约定：「Phase B 转正时 vehicle/carRig/inputs/camera 四模块插进正式 Game 循环合二为一」。本提案即执行这一约定，并把「转正目的地」从 `/world/` 改为 `/`。

### 4.2 合体映射表（谁并入谁、谁退役）

| spike 模块 | 去向 | 说明 |
|---|---|---|
| `spike/engine.ts`（装配器 + 帧循环） | **退役** | Game.ts 的两阶段 init + Ticker order 总线就是它的正式版；FpsMeter 摘出为 `src/lab/world/utils/FpsMeter.ts`（`#debug` HUD 继续用） |
| `spike/vehicle.ts`（KinematicVehicle） | **降级为回退档** | 主路径换 folio `PhysicsVehicle`（Rapier 动力学）。运动学版保留为 `player/KinematicFallback.ts`：Rapier wasm 加载失败/超时（>10s）时顶上，保证「世界永远能开」。两者对 Player 暴露同一 `PlayerVehicle` 接口（挂点已预留） |
| `spike/carRig.ts` | **并入 `world/VisualVehicle.ts`** | carRig 的 CarConcept 节点解析 + 轮/转向骨架就是 VisualVehicle 轮同步段的本站化前置工作，合并后按 folio 结构补位姿插值 |
| `spike/camera.ts`（ChaseCamera） | **参数喂给 `view/View.ts`** | View（focusPoint/zoom/spherical/optimalArea）是正式相机；ChaseCamera 调好的跟随刚度/俯仰参数换算进 View 配置，文件退役 |
| `spike/inputs.ts` | **并入 `inputs/Inputs.ts` 动作表** | spike 的键位映射（WASD/方向键/Shift/空格/R）与触屏摇杆手势直接登记为 Inputs actions；Nipple 已在引擎层，DOM 摇杆退役 |
| `spike/scene.ts`（灰盒 + 锥桶） | **并入 `world/World.ts` step(1)** | 锥桶（含撞击计数）作为 World 的动态体清单项；地面视觉换 Grid + MeshGridMaterial |
| `spike/params.ts` | **拆两半** | 车辆参数：作为 PhysicsVehicle 调参的 A/B 对照基线留档（world-spike-log）；锥桶参数：随锥桶进 World |
| `src/lab/modules/world/index.ts`（mount 薄入口） | **保留，唯一入口** | 仍是 manifest/facade 认的 `mount()`；内部改为动态 import `src/lab/world/index.ts` 的 Game 路径；`mode:'world'` 契约（材质热更 + 位置序列化）在此层实现 |
| `/world-spike/` 壳页 + `?impl=` 分叉 | **归档** | 合体完成即无双实现可切；壳页按 §1.2 处理 |

### 4.3 合体后的目录形态与施工顺序

```text
src/lab/world/            ← 唯一引擎（folio 架构）
  core/ inputs/ physics/  ← 既有 + PhysicsVehicle.ts
  player/                 ← Player.ts + KinematicFallback.ts（spike 遗产）
  rendering/              ← Rendering.ts + MeshGridMaterial.ts + PreRenderer.ts
  view/ world/            ← View.ts + World/Grid/Reveal/VisualVehicle/Zones/...
  utils/                  ← maths/ObservableSet + FpsMeter（spike 遗产）
src/lab/modules/world/index.ts  ← mount() 薄入口（不变，指向上面）
src/pages/index.astro     ← world 入口壳（重写）
src/pages/home/index.astro ← 宪法首页平移
```

施工顺序（每步可独立验证、可独立止损）：**① PhysicsVehicle + VisualVehicle 上车**（在 `/world-spike/?impl=engine` 原地验证手感）→ **② Grid/MeshGridMaterial/PreRenderer/Reveal**（引擎路径达到「可炫」）→ **③ spike 四模块并入 + `?impl=` 退役**（单实现）→ **④ 路由切换 + 门禁改造**（§1/§3，一个 PR 原子完成，含 `/home/` 平移与 CI 三文件同步改）。①②③ 在隐藏验证路径上迭代，④ 才动用户可见面——切换失败可整 PR 回滚。

---

## 5. 依赖红线

### 5.1 不引入清单（与全站红线一致，逐项给出理由与替代）

| 依赖 | 为什么有人会想引 | 裁决与替代 |
|---|---|---|
| React / react-three-fiber / drei | 社区 3D 教程主流生态 | ❌ 永不引入。全站是 Astro 零框架路线；folio 本身就是 vanilla three + 自写 Events/Ticker，我们移植的正是这套——R3F 反而是「第二套架构」。R3F 生态组件（drei 的 OrbitControls 等）在 View.ts 面前无增量价值 |
| Lenis（平滑滚动） | 炫技站标配印象 | ❌ 用不上。world 是全屏 canvas 应用，无页面滚动可平滑；`/home/` 与内容页遵守全站「原生滚动 + reduced-motion 尊重」纪律，本提案不新增任何滚动劫持 |
| gsap | folio 全部补间用它 | ❌ 已有替代且已落实：`Ticker.delay()` + 手写缓动（Ticker/Nipple 两处先例）。Reveal 的三步补间（圆环收拢/半径 back.in 弹开/镜头拉起）用 `remapClamp` + 缓动函数表（~30 行，back/cubic/expo 三款够用）。折损评估：gsap 的 timeline 编排能力在 Reveal 这种 3 步线性状态机里用不到，无实质损失 |
| howler | folio Audio.js 依赖 | ❌ Phase C 手写 WebAudio（`AudioBufferSourceNode` + `GainNode`，预计 ~150 行；超 150 行再评审引库——gap 报告 §6.1 口径不变）。本提案首版无音频，红线零压力 |
| msgpack-lite / uuid / tweakpane | folio Server/Debug | ❌ 随 Server 永久不做；调试用 URL 参数 + `#debug` 全局句柄（spike 先例） |

### 5.2 保留的两个运行时依赖

| 依赖 | 版本 | 备注 |
|---|---|---|
| three | ^0.185.1 | 与 folio 0.183.2 差 2 个 minor；TSL 件（MeshGridMaterial/Intro 圆环）移植时对照迁移指南逐版核对（风险 R3，§7） |
| @dimforge/rapier3d | ^0.20.0（建议锁 0.20.x） | PhysicsVehicle 参数表的语义基准 |

**合体的红线红利**：spike 与引擎层并存期实为两套 three 场景代码，合体后单一路径，红线审计面缩小。

---

## 6. 性能预算表与 Lighthouse 策略

### 6.1 预算总表（提案值，采纳后写进 SRD §12.7.2 修订版与 `audit-budget.mjs`）

| 预算项 | 上限 | 考核方式 |
|---|---|---|
| `/` 壳静态传输（交互/自动挂载前，不含字体） | ≤90KB gzip（HTML+CSS ≤35 / 引导 JS ≤15 / poster ≤40） | `audit-budget.mjs` 新增 `/` 壳专项（G-A' ） |
| `/` 世界首屏可玩 JS | ≤500KB gzip（合体完成前维持 Spike 门禁 400KB） | G-G 按 manifest `budgetClass:'world'` 实测 |
| `/` 世界 JS 全量（含按需 chunk） | ≤900KB gzip | 同上 |
| `/` 资产首包（出生 15 秒可见物） | ≤5MB（现实测 CarConcept 3.5 + HDRI 0.35 + 程序化其余 ≈ 3.9MB，余量 1.1MB） | G-G + 人工台账 |
| 分区流式合计（Phase B 起） | ≤12MB | G-G |
| 加载→可驾驶 | ≤8s @Fast 4G | e2e 冒烟计时断言 |
| 帧率 | 桌面 60fps / 中端移动 30fps；连续 2s 低于阈值自动降档 + toast | FpsMeter `#debug` 读数 + 人工走查表 |
| `/home/` 首屏 | <200KB gzip（常态 ≤120KB）+ 四项 ≥95 | G-A/B/C/D 平移 + LHCI |
| 内容页 world 增量 | **0 字节** | G-D（排除表只加根 index.html 一行） |
| `public/` 总量 | ≤40MB（首版净新增 0） | G-E |

### 6.2 Lighthouse 策略：是否接受首页 Perf 降级——**接受，且量化封顶**

诚实结论：`/` 自动挂载世界后，**Perf ≥95 无法承诺**。即便挂载压在 `load` 之后，LHCI 移动模拟的观测窗口仍可能捕捉到 world 分包解析与 wasm 编译的主线程占用（TBT 项失分）。与其做「骗过打分窗口」的延时魔术（把挂载推迟到 5s 后——体验倒退回「进去不是」），不如显式重定义口径：

| 页面 | Perf | A11y | Best Practices | SEO |
|---|---|---|---|---|
| `/`（世界壳） | **≥90 目标 / ≥80 阻断**（median-run） | ≥95 阻断 | ≥95 阻断 | ≥95 阻断 |
| `/home/` | ≥95 阻断 | ≥95 阻断 | ≥95 阻断 | ≥95 阻断 |
| 其余现有 4 页 | 现行 ≥95 全维持 | 同 | 同 | 同 |

- **Perf 降级的边界**：只降 `/` 一页、只降 Perf 一项、阻断线 80 写死在 `lighthouserc.json` 的 assertMatrix——不是「放弃考核」而是「换一把对的尺」；LCP（poster）与 CLS 仍应满分口径，失分只允许来自 TBT/Speed Index（挂载成本），CI 报表逐项留痕。
- **如何保 a11y**：壳 HTML 语义完整（H1/landmark/六导航链接）；「跳过 3D」是 DOM 首个可聚焦元素；HUD 与退出按钮在 DOM 层非 canvas 内（SRD §12.7.1 纪律平移）；reduced-motion 不自动挂载、canvas `aria-label` + 键位说明常驻；对比度与焦点样式随全站 tokens。a11y 没有任何降级理由——阻断线不动。
- **如何保 SEO**：`/` 壳预渲染完整文案（定位语 + 三支柱 + 六导航），爬虫拿到的不是空 canvas 页；`WebSite`/`Person` JSON-LD 与 canonical 留在 `/`；`/home/` 进 sitemap 承接长文案权重；`/world-spike/` 归档页 noindex 防重复。监控：Search Console 每月复盘首页关键词曝光，连续两月下滑触发 §7 R2 止损评估。

---

## 7. 技术风险 Top 5 与止损

| # | 风险 | 概率×影响 | 先行缓解 | 止损（可执行、可回滚） |
|---|---|---|---|---|
| R1 | **`/` Lighthouse Perf 跌破 80 阻断线**（wasm 编译 + world 分包解析压 TBT，LHCI 移动模拟 4x throttle 下尤甚） | 中×高 | 挂载压 `load` 后；PreRenderer 预热移入挂载段；wasm 与资源并行加载已是引擎既有结构 | 一键开关：壳页挂载策略常量 `AUTO_MOUNT=false` 切回「显式进入」模式（壳恢复四项 ≥95），产品口径退半步为「首页一键进入世界」，路由架构不回滚 |
| R2 | **首页 SEO 受损**（内容变薄 + 权重分流到 `/home/`，Search Console 曝光下滑） | 中×高 | 壳保留完整定位文案与 JSON-LD；`/home/` 即时进 sitemap；切换 PR 合并日记录基线数据 | 连续两月核心词曝光降 >30%：`/` 与 `/home/` 内容互换回滚（宪法页回 `/`，世界退 `/world/` 独立路由）——因内页零改动，回滚只动两个页面文件 + CI 三处配置 |
| R3 | **PhysicsVehicle 手感失真**（three 0.185 vs folio 0.183 的 TSL API 漂移；rapier ^0.20 控制器参数语义差；`threejs-override.js` 的 `Object3D.copy` 补丁我们未搬） | 中×中 | 参数表原封起步；folio 车模（36KB，不入库）做 A/B 对照；rapier 锁 0.20.x；VisualVehicle 克隆异常首查 copy 语义 | 时间盒 3 个工作会话未达标：主路径暂用 spike KinematicFallback 上线（§4.2 已设计双实现同接口），PhysicsVehicle 转后台调参，不阻塞路由切换 |
| R4 | **移动端体验塌方**（无 WebGPU 机型 + 触屏摇杆 + DPR 高的组合下帧率不达 30fps，「进去就是」在手机上变「进去就是卡」） | 高×中 | 触屏窄屏默认不自动挂载（§1.3 条件③），呈现 poster + 显式进入；DPR 封顶 1.5；Quality 分档已就位 | 显式进入后仍 <30fps 持续 2s：自动降档（DPR→1、阴影关、锥桶减半）+ toast；降档后仍不达标 → 该设备档记入黑名单参数，下次访问默认 2D 静态态 |
| R5 | **合体工期黑洞**（Reveal/GridMaterial 的 TSL 移植遇 API 更名逐个排雷；spike 四模块并入时序 bug——folio tick order 与 spike 帧循环语义不完全等价） | 中×中 | §4.3 施工顺序把「可炫」与「合体」拆成独立可验证步；每步在隐藏路径验证后才走下一步；tick order 对照 teardown §12 全表 | 逐件降级 ship：Reveal 卡壳 → 先上 facade 进度条版（无圆环）；GridMaterial 卡壳 → 标准材质 + 网格贴图顶替；**路由切换（步④）永远最后动**，前三步任何一步止损都不影响现网 |

**总止损原则**：步④（路由切换）是唯一动用户可见面的原子 PR，其余全部在隐藏路径迭代；任何风险触发时现网 `/` 始终是完整可用的宪法首页——最坏情况 = 本提案全部工作留在 `/world-spike/` 演进，用户可见面零损伤。

---

## 8. 采纳后的规格修订清单（本文不执行，留给裁决后）

1. SRD §12.7.1：路由方案由「`/world/` 独立壳 + 显式进入」修订为「`/` 入口壳 + 条件自动挂载」，`/home/` 增补入路由表；
2. SRD §12.7.2：预算表按本文 §6.1 增补 `/` 壳专项与双口径 Lighthouse 断言；
3. PRD LAB-16~18 与八条跳过出口：出口①「首页 HTML 路径零依赖」改述为「`/home/` 与跳过链接零依赖」，其余七条不变；
4. `audit-budget.mjs`：G-A/B/C 考核对象改 `home/index.html`，G-D 排除表加根 `index.html`，新增 `/` 壳专项门禁；
5. `lighthouserc.json`：改用 assertMatrix 双断言组，URL 表加 `/website/home/`；
6. `docs/research/world-spike-log.md`：追记合体决策与 `?impl=` 退役；`/world-spike/` 归档页上线。
