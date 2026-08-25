# Phase 0 全量终审报告（CC-A4）：从零到 E7 tip 的全部科技城交付审计

| 项 | 内容 |
|----|------|
| Task | **CC-A4**（Phase 0 全量终审，编排看板 `cyber-city-eng-orchestration.md` 波 4 后终审） |
| 审计员 | Fable5（云端子代理，`claude-fable-5-thinking-xhigh`） |
| 日期 | 2026-08-25 |
| 规格基线 | PRD v2.0（§2.6 新三层承诺 / §6.1 CITY-01~11 / §7.4 Phase 0 门禁与 Persona 2 门禁）· SRD v2.0 §11.2 / §12.7 全章 · `cyber-city-implementation-plan.md`（§1 六幕 / §2.1 Gate P0 / §4 路由与门禁 / §5.2 预算 / §6 红线 / §7 Task 表）· `cyber-city-wave1/2/3-audit.md` 全部历史裁决 |
| 审计对象 | **审计 tip = `origin/cursor/cc-e7-world-shell-1d6f` @ `268e99f`**（波 1–3 已合流设计基线 + 波 4 CC-E7 路由原子切换 = Phase 0 完整交付面），对照 **`origin/main` @ `5430ffa`**（合入前生产面；tip 领先 main **79 个提交**，merge-base = main tip，可干净合入） |
| 审计方法 | ① 以 E7 tip 为权威树 checkout 审计分支（零业务代码改动）；② 全量门禁独立复跑：`astro check` / `build` / `audit-budget` / `check-links` / **e2e 全量 48 用例** / **LHCI 7 URL × 3 轮全量断言**；③ 逐波对照 A1/A2/A3 历史裁决在 tip 的成立性（M1–M10 + 观察①–⑧ 逐条复核）；④ A3 §6 八项必带在 E7 tip 逐条独立销账；⑤ Playwright 运行时冒烟四场景（`/` 默认全链 / `?poi=` 深链进站 / voice-pod 对照 / 内容页零字节）+ 截图工件；⑥ 红线正则扫描（依赖 / 商标）+ 资产台账三层核对 |

---

## 0. 裁决速览

> ## **有条件放行（合入 main）**
>
> Phase 0 全部工程交付（设计 5 件 + 波 1 E1/E3/E5/E10 + 波 2 E2/E4/E6 + 波 3 E8/E9 + 波 4 E7）在 E7 tip 上**红线零违规、预算全部在限内、全量门禁独立复跑全绿**（check 0 err / build 19 页 / audit-budget 零 ❌ / check-links 345 条零断链 / **e2e 48 passed 0 failed exit 0（14.6 分钟，CITY 六用例全部解 skip 且绿）** / **LHCI 双口径 7 URL 断言 exit 0**——`/` P100·A100·BP96·SEO100，`/home/` 四项全 100）；A1/A2/A3 历史裁决 M1–M10 与 A3 §6 八项必带在 tip **逐条复核全部成立**；运行时冒烟四场景全通（首幕变形→W 即开、`?poi=` 深链出生泊位 + E 键进站直跳、voice-pod 黑菱形已消、内容页零 world 请求）。
>
> **条件两条（M11/M12，均可执行、可验证，满足即放行）**：
>
> | # | 硬条件 | 依据 | 验证方式 |
> |---|--------|------|---------|
> | **M11** | **八出口之④「ESC 招聘方速览 → `/work/`」缺失**：全仓无 Escape 菜单实现（本审计正则全仓核对）。二选一：(a) 壳层补最小 DOM 实现（ESC 打开菜单含「招聘方速览 → /work/」链接，约 30 行，G-A′ 余量 51KB 充裕）；(b) 产品负责人显式修订 PRD CITY-09②/SRD §12.7.8 出口④ 改期 Phase 1 并同步走查表 §5.2④ 标注——**不可静默缺席**（PRD 原文「任一出口失效即 P0 bug」，CITY-09 为 P0 且「与 CITY-01 同交付，作为其合并门禁」） | PRD §6.1 CITY-09② · SRD §12.7.8 出口④ · 走查表 §5.2④（无 N/A 标注） | (a) 合并前 ESC 实测可开菜单、链接直达 `/work/`；或 (b) PRD/SRD/走查表三处修订同 PR 落账 |
> | **M12** | **`human-gate-checklist.md` §5 走查表全空 + §5 总判定未签**：表头明文「执行时机 = CC-E7 路由切换 PR 合并前（合并门禁）」，含首幕八项、八出口逐条、Persona 2 剧本、真机帧率录测（桌面 60fps / 1% low ≥45 为 Gate P0 阻断项，PRD §7.4）。产品负责人有「人工 Gate 豁免」先例（`goal-progress-status.md` 2026-08-25 裁决，语境为 Phase 1 MVP + Spike）——本条允许以**显式延续豁免**方式满足：在 §5 总判定行记 Go + 豁免依据留痕（或回填走查表实测），二选一，不可空表合并 | PRD §7.4 Phase 0 门禁行 · 走查表 §5 表头 · `goal-progress-status.md` 人工 Gate 裁决 | 走查表回填或豁免留痕随合并 PR 落账 |

关键实测数字（E7 tip 权威树，全部本审计独立复跑）：

| 指标 | 规格上限/口径 | 实测 | 判定 |
|------|--------------|------|:---:|
| `astro check` | 0 errors | 0 errors / 0 warnings（9.4s） | ✅ |
| `build` | 全绿 | 19 页（+`/home/`，2.7s） | ✅ |
| G-A′ 壳静态段（gzip） | HTML+CSS ≤35 / 引导 JS ≤15 / poster ≤40 / 合计 ≤90KB | 5.1 / 1.4 / 31.8 / **38.6KB**；零重资产/零 world 静态标签命中 0（**阻断级已转硬**，E7 探测器识别切换态） | ✅ |
| G-A/B/C 宪法首页（`/home/` 口径） | 首屏 <200KB | 33.9KB（HTML+CSS 13.1 / JS 0.0 / poster 20.6 / 图标 0.2） | ✅ |
| G-D 零 world 字节 | 受保护页命中 0 | 14 页命中 0（排除表 = lab/、world/、world-spike/ + 根 index，`/home/` 与内容页全额受保护） | ✅ |
| G-G(world) JS 直测 | ≤900KB gzip | world 命名 chunk ×12 合计 **78.0KB**（chunk 按 slug 命名已收敛，A3 观察⑤销账）；manifest 声明校验 78.0/500KB 双轨对照 | ✅ |
| G-G(world) 资产池 | ≤12MB | 5.2MB（models + hdri） | ✅ |
| `public/` 总量 | ≤40MB | 8.7MB（G-E） | ✅ |
| 机器人 GLB | ≤800KB Draco | 345,360 B ≈ 338KB（CC0 台账三层齐备） | ✅ |
| `check-links` | 零断链 | 19 页 345 条内链全部有效；12 楼 deepLink 全 200；fallback 登记 2 条（agent-nexus→/ai-lab/、autodrive-lab→/work/）；`?poi=` 在册校验（dist 内 0 条引用，空集绿） | ✅ |
| e2e 全量 | 存量零回归 + CITY 解 skip | **48 passed / 0 skipped / 0 failed，exit 0（14.6 分钟）**——desktop 21 + mobile 3 + world-chromium 串行 23（含 CITY-E2E-01~06 全绿）+ world-perf 1 | ✅ |
| LHCI 双口径 | `/` P≥80 阻断（≥90 warn）+ 三项 ≥95；其余四项 ≥95 | 7 URL × 3 轮全量断言 **exit 0**：`/` **P100 A100 BP96 SEO100**；`/home/` 四项全 100；其余五页全 100 | ✅ |
| 红线依赖 | 零 React/R3F/gsap/howler/lenis/tweakpane/postprocessing | `package.json`/lockfile/src/e2e/scripts 正则扫描零命中；运行时依赖仍仅 three + rapier | ✅ |
| 商标红线 | 零 Transformers 元素 | src/public/e2e/scripts 全扫唯一命中 = hero-robot README 合规声明行本身 | ✅ |
| sitemap | `/` + `/home/` 进、world-spike 剔 | 18 URL：两者在册；`/world-spike/` 已剔（命中的 `ai-lab/world-spike-parallel-agents/` 为文章 slug，非路由，误报排除） | ✅ |

---

## 1. 审计范围：从零到现在（79 提交 × 四波 + 设计基线）

| 波 | 交付 | 历史裁决 | 本审计在 tip 的复核结论 |
|----|------|---------|----------------------|
| 设计 | 提案 D1–D6 锁定、PRD/SRD v2.0、实施方案 CC-E1~E10、buildings JSON 12+8、GH 资产决议 | 五 Task 合流完成 | 规格自洽性成立：PRD §2.6 新三层承诺 ↔ SRD §12.7 逐条呼应；buildings schema 契约（§12.7.3）与落库 JSON 一致（12 在册 + 8 预留 = 20 封顶，spawn (0,0) 朝北）；已裁决冲突（v1.1 禁令 vs D1）在 PRD §2.6 诚实交代。**两处历史敞口仍未收口**（见 §6 观察 A/B：体积雾字面、CITY-03 动画配额口径） |
| 1 | E1 物理车 / E3 程序化城 / E5 机器人 / E10 e2e 骨架 + A1 | **放行**（M1–M4 交接） | M1 notes 拼接 ✔（notes 现存 E1→E3→E5→E10→E2→E4→E6→E8→E9→E7 十小节完整）；M2 VisualVehicle 落位 `player/` 已由方案 §3.1 文字修订收口 ✔；M3 出生锚点 = JSON `world.spawn` 在 `index.ts` 落地 ✔；M4 白名单转正 ✔。机器人 338KB/800KB、城 S 档零网络请求、KinematicFallback 同接口兜底——均在 tip 成立 |
| 2 | E2 spike 退役 / E4 霓虹 Quality / E6 Transform+Reveal + A2 | **有条件放行**（M5–M8 已兑现） | **M5–M8 在 tip 逐条重验成立**：M5 `index.ts` `if (!ritualRequested && !game.revealed) await 'revealed'` 死锁解原样在 ✔；M6 双壳 `PARAM_ALLOWLIST` 均含 `ritual` ✔；M7 `Player.ts` Space=brake / KeyF=suspensions × categories 全动作 +driving ✔；M8 `Reveal.ts` 键位提示「Space/B 刹车 · F 悬挂跳」✔。M9 已由 E7 转正（见 §3）；Transform 四态 + D4 同帧放行在 `TransformSystem.ts`（filters intro→driving 与 car_ready 同帧）字面成立，冒烟实证 |
| 3 | E8 CI 门禁日切 / E9 POI 十二楼 + A3 | **放行**（M10 + §6 八项交棒） | M10 notes 拼接 ✔；E8 日切探测器在 tip 已**真实切换**（`dist/home/index.html` 存在 → G-A/B/C 盯 home、G-A′ 转硬、G-D 排除根），本审计门禁输出逐行确认口径正确；E9 POI 数据驱动零硬编码复核 ✔（`world-pois.json` 12 条仅 id/buildingId/kind/action 四字段，坐标/标题/颜色/URL 全走 buildings 查表）；`?poi=` 深链 + E 键进站冒烟实证 ✔ |
| 4 | E7 `/` 世界壳 + `/home/` 平移 + 原子切换 | 本审计首审 | 见 §2/§3 逐项；A3 §6 八项全部销账成立；**新发现缺口 = M11（ESC 出口）+ M12（走查表）** |

---

## 2. 波 4（CC-E7）路由原子切换逐项审计

| 审计点 | 判定 | 证据 |
|--------|:---:|------|
| `/` 世界壳结构 | ✅ | 跳过出口 = `<body>` 首个可聚焦元素（`a.skip` 在任何容器之前，CITY-E2E-02 实测 Tab 第一焦点 + domcontentloaded 即点）；六导航 `<a>` 恒在顶栏；H1 定位语 + 三支柱 + 12 楼 DOM 快览（dist 实测 12 条 `<a>`，全部 buildings JSON deepLink 真实 URL）+ noscript 全导航（dist 实测 6 链）；canonical 自指 + `WebSite`/`Person` JSON-LD + index,follow；poster = LCP（`fetchpriority=high`，31.9KB 实景截图 ≤40KB） |
| 四条件挂载 + 降级链 | ✅ | `blockReason()` 四条件字面对齐实施方案 §4.3（reduced-motion / saveData / <768px / 无 WebGPU·WebGL2 探针）；任一不满足 → `data-blocked=<因>` + 分因文案 + 显式「进入科技城」按钮（webgl 因除外——文案直接导向导航）；`AUTO_MOUNT_DELAY 1800ms` 给「秒点跳过」让路（CITY-E2E-02 零字节实证）；挂载失败 → `data-state=error` + 错误文案 + 导航兜底（CITY-09⑤⑥ 口径）。窄屏 <768px 转纵排速览页（overflow 恢复滚动） |
| `/home/` 平移零回归 | ✅ | 五区块结构逐段对照原 `index.astro`（git show 552ab18 对照）：唯二差异 = import 深一级 + LabCardWorldSpike 指 `/`（自报一致）；HOME-E2E-01~05 + MOB-E2E-01 重定向后全绿；LHCI `/home/` 四项全 100；G-A/B/C 首屏 33.9KB |
| world-spike 归档 | ✅ | noindex,follow + canonical → `/` + sitemap 剔除（dist 三点实测）；「不降占位页」评估成立——13 个驾驶/物理用例仍以本页为被测面，降页 = 重写被测路由超出原子 PR 边界，降页计划留档一个版本周期（Phase 1 e2e 批次）；WS-E2E-01/07 静态合同随归档改述后全绿 |
| M4/M6/M9 参数纪律 | ✅ | 双壳 `PARAM_ALLOWLIST` 七参数同表（gl/vehicle/city/robot/ritual/quality/poi）= manifest `deepLinkParams` 同表；引擎全链 `opts.params`，`Quality.ts` 构造参数化后**全仓已无 location.search 旁路**（`location.hash` 仅 #debug 句柄，spike 先例）；默认剧本 ritual=1 且显式场景参数（poi/city/robot）让位不叠加 |
| 城市首幕相机 + 9m | ✅ | `View.ts` city 档 FOV 42° / radius edges {14,24}（静止 18m）/ phi 68°（俯角 22°）/ lookAt +2.5m，greybox 档参数原封（world-spike 11 用例全绿佐证零回归）；`index.ts` ritual 与 robot 两路 `targetHeight: 9` 落账（A2 观察③销账） |
| manifest + Lab 拆弹 | ✅ | manifest world 注册（kind=world / budgetClass=world / deepLinkParams 七参数）与路由切换同 PR 激活（E8 须知 1 无裸激活窗口）；`lab/index.astro` `kind !== 'world'` 过滤 + 通栏专区卡（真实 URL `/`）；LAB-E2E-01 断言 `/lab/world` 死卡 = 0 且专区卡 href = `/`（e2e 实测绿） |
| G-G chunk 命名 | ✅ | `astro.config.mjs` client 环境级 `chunkFileNames` + `WORLD_CHUNK_RE` 谓词（world 源/薄入口/rapier/两 JSON）；dist 实测 world 命名 chunk ×12 全量计入直测 78.0KB/900KB（A3 观察⑤彻底收敛）；共享库（three/KTX2/Draco 与 car-configurator 共用）不计入——与既有 G-G 声明口径一致，头注踩坑留档（顶层 rollupOptions 静默失效） |
| LHCI 日切 | ✅ | `lighthouserc.json` 七 URL（含 `/home/`）+ `/` 分档断言（P ≥0.8 error + ≥0.9 warn + 三项 ≥95）+ 其余 `.+` 四项 ≥95；`lighthouserc.e7-draft.json` 已删；`ci.yml` 注释同步。**本审计真实产物全量复验 exit 0**（E8 本地三连验证 → E7 真实产物复验的交接要求兑现） |
| e2e 交付 | ✅ | CITY 六用例解 skip 全绿；`/lab/world-spike/` 注释笔误更正（A3 观察⑦销账）；cyber-city 移入 world-chromium 串行 project + SwiftShader 校准（MOUNT_TIMEOUT 210s）；全套件路由重定向（home/mobile/site-health/lab-index）逐文件核对语义正确——特别是 SITE-E2E-03 断言随归档**反转**（world-spike 不得进 sitemap） |
| voice-pod 处置 + fallback 楼 | ✅ | 三选一取「泊位挪出对角线」：buildings JSON `parkingBay.x` 28→12 纯数据改动（A3 观察⑥口径内）；冒烟截图复核画面干净（§5）；两 fallback 楼维持 `deepLinkStatus: 'fallback'` 上级索引 + check-links 登记（详情页 Phase 0 无排期，转正归 Phase 1 内容批次——符合 §12.7.3 守则①「登记转正计划」要求，计划已在 notes 留档） |

---

## 3. A3 §6 八项必带销账复核（逐条独立验证）

| # | 交棒项 | E7 自报 | 本审计独立复核 | 判定 |
|---|--------|---------|---------------|:---:|
| 1 | M9 `?quality=` 转正 | Quality 构造参数化 | `Quality.ts` 无 location.search；`GameOptions.quality` ← `opts.params`；壳白名单含 quality；非法值忽略走 UA 分档 | ✅ |
| 2 | targetHeight 回 9m | 城市相机同 PR 落账 | `index.ts` 两处 `targetHeight: 9` + View city 档三参数（42°/18m/22°）几何核对成立（radius 14+10×0.4=18） | ✅ |
| 3 | manifest 激活拆弹 | 同 PR 激活 + 过滤 | manifest 注册 + `kind!=='world'` 过滤 + 专区卡 + LAB-E2E-01 断言，四件同 PR | ✅ |
| 4 | LHCI 日切 | draft→正式 + 实测全绿 | draft 文件已删；七 URL 断言结构核对；**本审计独立实跑 3 轮 exit 0**，分数与自报一致（`/` BP96 复现） | ✅ |
| 5 | 壳白名单含 poi | 七参数 | 双壳 + manifest 三处同表；深链契约 = slug 用 buildings id、进站 URL 读 deepLink（`Areas.ts` 查表核对，零硬编码） | ✅ |
| 6 | voice-pod + fallback 转正 | 泊位挪位；fallback 维持登记 | bay (12,28) 落库；冒烟截图干净；fallback 登记合规（转正计划留档 Phase 1） | ✅ |
| 7 | G-G chunk 命名 | 12 chunk 全 world.\<hash\>.js | dist 实测 12 chunk 命名全中 + 直测 78.0KB 含 areas/city/HeroRobot/Transform/Reveal/rapier 全量 | ✅ |
| 8 | e2e 笔误 + 解 skip | 全部完成 | spec 注释更正核对；六用例绿（本审计全量复跑）；串行 project + 计时校准生效（CITY-E2E-03 实跑 3.0m 无超时） | ✅ |

另：A3 补记的「world-pois ⇄ buildings 外键 zod 构建期校验」在 tip 仍未做（运行期 console.warn 兜底在）——维持 Phase 1 登记，非阻塞（见观察 C）。

---

## 4. 十维度审计明细

| # | 维度 | 判定 | 证据摘要 |
|---|------|:---:|---------|
| 1 | 红线 | ✅ | 依赖：package.json/lockfile 正则零命中（react/gsap/howler/lenis/tweakpane/postprocessing/msgpack），运行时依赖仍 three ^0.185.1 + @dimforge/rapier3d ^0.20.0 两个；商标：全仓唯一命中 = 合规声明行；资产台账三层（ledger 逐笔 + THIRD-PARTY-NOTICES 总账 + hero-robot README 复现管线）齐备，Quaternius CC0 / Khronos CC BY 4.0（已署名）/ Poly Haven CC0 |
| 2 | 路由与出口 | ⚠️（M11） | `/` 世界壳 ✔、`/home/` 平移零回归 ✔、跳过 Tab 第一焦点 ✔（e2e+冒烟双证）、noscript ✔（6 链实测）、`?poi=` ✔（冒烟实证）；八出口逐条：①②③⑤⑥⑦⑧ 成立（⑤ 以「POI 进站 = 真实 URL 直跳」超额达成 overlay 语义），**④ ESC 招聘方速览缺失 → M11** |
| 3 | 首幕旅程 | ✅ | 冒烟实证：自动挂载 → robot_idle → 点 CTA → transforming（disabled）→ car_ready → 首个 W 同帧 driving + 位移（D4 零等待）；reduced-motion：CITY-E2E-04 绿（不自动挂载零字节 + 显式进入终态直出 + instant swap + role=status 文字提示）；M3 spawn (0,0) = 机器人站位 = 变形落点 = R 复位点（代码 + 冒烟双证） |
| 4 | 城市/POI | ✅ | ≥10 可见楼：12 栋在册全渲染（S/M 程序化，外部资产 0 字节）+ 剪影层；12 触发圈数据驱动（world-pois 四字段外键 + buildings 查表，运行期校验就位）；buildings 单源纪律成立（3D/DOM 快览/noscript/deepLink 全部派生自同一 JSON，四波对 schema 零破坏性改动，唯一数据改动 = voice-pod 泊位 x） |
| 5 | 键位纪律 | ✅ | M5–M9 逐条在 tip 重验成立（§1 波 2 行）；intro 上下文 Space=CTA（Reveal 动作表 categories:['intro']）与 driving 后 Space=brake 由 filters 闸门天然隔离；KeyF=悬挂；E=POI 进站仅挂 wandering/driving |
| 6 | 预算门禁 | ✅ | 全部阻断级数字见 §0 表；G-A′ 已转硬（探测器识别切换态）；G-D 内容页 14 页零命中；G-G(world) 直测 + 声明双轨；LHCI 双口径断言实跑；public 8.7/40MB |
| 7 | A3 §6 八项 | ✅ | 逐条销账全部成立（§3 表） |
| 8 | e2e | ✅ | 全量复跑 48 passed / 0 failed / exit 0（14.6m）；CITY 六用例状态 = 解 skip 全绿；既有套件（home/mobile/site-health/lab-index/tts/car/world-spike）重定向后零回归；WS-PERF-01 软门禁照常输出 SwiftShader 观察行（≈2.0fps 环境下界，不阻断，真机归走查表） |
| 9 | 运行时冒烟 | ✅ | 四场景全通 + 截图工件（§5）：`/` 进城全链、变形驾驶位移实证、`?poi=lingua-tower` 深链出生 (−28,28) + E 键直跳案例页、`?poi=voice-pod` 出生 (12,28) 画面干净、`/home/`+`/work/`+案例页 world 请求 = 0 |
| 10 | 合入风险与止损 | ⚠️（M12 + 切换日清单） | 回滚面收敛：内页近零改动（SiteHeader/Footer 各 1–2 行 + Home 两卡指向），回滚 = revert 波 4 七提交或整分支不合入，audit-budget/check-links 探测器随 `dist/home/index.html` 消失**自动回退旧口径**（脚本零改动回滚）；SEO：canonical/JSON-LD/sitemap 三件齐备，Search Console 基线记录 = 切换日操作（R6 缓解，列入 §7 清单）；Perf 分层 D6 已由 LHCI 分档断言机器化 |

---

## 5. 运行时冒烟证据（Playwright + SwiftShader，preview 伺服 dist）

| 场景 | 结果 |
|------|------|
| ① `/` 默认全链 | **load 前 world 请求 = 0** → 自动挂载 → robot_idle **55.6s 墙钟**（SwiftShader 慢动作，真机口径归走查表）→ CTA 变形 → car_ready → **首个 W 输入即 driving（D4 零等待）**，15s 墙钟位移 **3.63m** 实证、HUD 显示 25 KM/H + driving 提示条；全程零未捕获异常 |
| ② `/?poi=lingua-tower` | 深链出生泊位 **(−28.0, 28.0)** 与 buildings JSON parkingBay 字面一致；触发圈提亮 + 标点开态标签「…· E 进站」（截图）；**E 键进站直跳 `/work/multilingual-cockpit/`** 落地成功；零未捕获异常 |
| ③ `/?poi=voice-pod` | 出生泊位 **(12.0, 28.0)**（挪位后）；截图复核**地面黑菱形已消**（A3 观察⑥处置有效）。附注：两 POI 截图中标点菱形盖住标签左缘为慢动作**开合动画中间帧**（弹性过冲被 30–40× 墙钟放大后被定格采样），非渲染缺陷，真机 ~0.5s 内落定 |
| ④ 内容页零字节 | `/home/` + `/work/` + `/work/multilingual-cockpit/` 三页 networkidle 后 world 请求合计 = **0**（与 G-D 静态断言互证）；`/home/` 截图与原首页像素级一致 |

冒烟场景 ①–③ 合计 3m45s 墙钟；截图存 agent 工件（`a4_smoke_1~6`）。LHCI 逐页中位分：`/` P100 A100 **BP96** SEO100（BP 扣分 = headless 环境 WebGPU 探测告警落 console，与 E7 自报一致、真机不复现，阈值 0.95 内余量 1 分）；`/home/`、`/about/`、`/work/`、`/work/multilingual-cockpit/`、`/lab/car-configurator/`、`/lab/tts-cockpit/` 四项全 100。

---

## 6. 缺口、硬条件与观察

**硬条件（合并 main 前必须满足，编号接波 3 续排）**：

| # | 项 | 内容与可执行解法 | 归属 |
|---|-----|----------------|------|
| M11 | 八出口④ ESC 招聘方速览 | 见 §0 表——(a) 壳层最小实现（推荐：`keydown Escape` → DOM `<dialog>`/面板含「招聘方速览 → /work/」+「站点总览 → /home/」，纯壳层改动不碰引擎，G-A′ 余量充裕）或 (b) 产品显式改期并同步 PRD/SRD/走查表三处 | 整合方（或补丁 PR） |
| M12 | 走查表回填或豁免留痕 | `human-gate-checklist.md` §5（首幕八项 / 八出口 / Persona 2 / 真机帧率）回填实测，**或**产品负责人按 `goal-progress-status.md` 先例显式延续豁免并在 §5 总判定行留痕——空表状态不满足 PRD §7.4「逐条人工走查」门禁的程序要件 | 产品负责人（王磊） |

**非阻塞观察（编号接波 3 观察续记）**：

- **观察⑨ 挂载后楼宇快览不可达**：`data-state=ready` 后 cover（含 12 楼 DOM 快览）opacity 0 + pointer-events none——SRD §12.7.4 car_ready 行 DOM HUD 列写「键位提示 + **楼宇快览可点**」，字面未满足；挂载后楼宇导航由 3D POI 标点 + 顶栏六导航承载，信息可达性未受损。建议 Phase 1 HUD 批次补「楼宇快览」折叠面板或修订 SRD 该行字面。
- **观察⑩ 内容页「返回世界」`/?poi=<id>` 未落地**：dist 内 `?poi=` 引用 0 条（check-links 空集绿）；现状 = 页头品牌链「回到城市」→ `/`（无 poi 恢复）。SRD §12.7.1 站内链接调整行的「内容页返回科技城 `?poi=` + sessionStorage 恢复」归 Phase 1/2（CC-P1 深链出生已就位，恢复链接是内容侧改动）。
- **观察 A（承 A2 观察①）体积雾字面**：PRD CITY-03/§5.3 写「体积雾」，实现仍为三档统一距离雾——产品侧追认修订 PRD 或 Phase 1 补齐，两波未收口，建议随 M11(b)/M12 的产品确认一并裁决。
- **观察 B（承 A2 观察②）CITY-03 动画配额口径**：PRD「≤2 处循环动画」vs 方案「同屏 ≤5」vs E4 shader 内取样——仍需人类统一口径（建议：shader 采样不计入，DOM/Ticker 循环计入）。
- **观察 C（承 E9/A3）zod 构建期校验**：world-pois ⇄ buildings 外键完整性仍靠运行期 console.warn 兜底，构建期 zod 校验归 Phase 1（SRD §12.7.3 声明「zod 构建期校验」尚未字面兑现）。
- **观察 D `/` BP 96**：Lighthouse「Browser errors logged to console」= headless WebGPU 探测降级告警；真机不复现；余量 1 分。Phase 1 可静默该探测日志收口（E7 遗留自报，本审计复现认可）。
- **观察 E 驾驶 e2e 被测面**：13 个驾驶/物理用例仍以 `/world-spike/` 为被测面，world-spike 降占位页 = 一个版本周期后（用例迁 `/?...` 参数路径），Phase 1 e2e 批次排期——归档口径（noindex/canonical/剔 sitemap）已把 SEO 面收干净，纪律成立。
- **观察 F HUD 速度表**：壳 `data-ws-speed`/`data-world-respawn` 挂点就位、引擎接线缺席容忍（显示恒 0 需 Phase 1 接线）——与 E7 自报一致，不影响驾驶功能（冒烟位移实证）。

---

## 7. 合入 main 执行清单（满足 M11/M12 后）

1. **合并形态**：E7 tip `268e99f` 与 `origin/main`（`5430ffa`）merge-base = main tip，**可干净合入**（无 rebase/冲突面）；建议单 merge PR 承载全部 79 提交（原子回滚单元），PR 描述引用本报告 + 三波审计。
2. **合并前最后一跑**：CI 全量（check/build/budget/links/LHCI/e2e）在合并 PR 上必须全绿——本审计已在 tip 复跑全绿，合并 PR 若有新提交（M11 补丁）须重跑。
3. **切换日操作**（R6/R10 止损配套，非代码）：Search Console 记录首页核心词曝光基线；生产 `/` 冒烟（进城 + 变形 + 跳过出口 + `/home/`）；`goal-progress-status.md` 追记 Phase 0 Go 裁决与生产 URL。
4. **回滚预案**：revert 合并 PR 即整体回退（内页近零改动）；audit-budget/check-links 探测器自动回退旧口径，脚本零改动；`/world-spike/` 功能保留使驾驶验证面在回滚后依旧可用。
5. **Phase 1 交棒清单**（本报告观察项汇总）：ESC 出口若走 (b) 改期则入列；HUD 速度表接线；POI 专项 e2e（触发圈进出/无效 slug/`/?poi=` 用例）；内容页「返回世界」`?poi=` + sessionStorage 恢复；zod 构建期校验；BP96 探测日志静默；world-spike 降占位 + 驾驶用例迁移；体积雾/动画配额产品裁决；fallback 两楼详情页转正。

---

## 8. 最终裁决

> ## **有条件放行（合入 main）**
>
> Phase 0「从零到现在」的全部交付面（设计基线 + 四波十 Task + 三轮波末审计的全部裁决与条件）在 E7 tip `268e99f` 上经本审计独立复核**全部成立**：红线零违规、预算零超限、A1/A2/A3 历史条件（M1–M10）与 A3 §6 八项必带逐条兑现、全量门禁与 e2e 48 用例独立复跑全绿、LHCI 双口径真实产物断言通过、首幕/深链/降级链运行时冒烟实证。**两条硬条件**：M11（八出口④ ESC 招聘方速览缺失——补最小实现或产品显式改期，不可静默）、M12（human-gate-checklist §5 走查表回填或产品显式延续豁免留痕）。满足后按 §7 清单合入 `main`，Phase 0 收口、Phase 1 按交棒清单开工。

*CC-A4 · 2026-08-25 — 审计过程零业务代码改动（仅新增本报告）；全量验证在 E7 tip 权威树完成；冒烟截图存 agent 工件（a4_smoke_1~6：壳静态 / robot_idle / driving / lingua-tower 深链 / voice-pod 对照 / home 宪法首页）。*
