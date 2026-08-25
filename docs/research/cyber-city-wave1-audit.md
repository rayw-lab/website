# 波 1 工程审计报告（CC-A1）：E1 / E3 / E5 / E10 四分支合流前审计

| 项 | 内容 |
|----|------|
| Task | **CC-A1**（波 1 波末审计，编排看板 `cyber-city-eng-orchestration.md`） |
| 审计员 | Fable5（云端子代理，`claude-fable-5-thinking-xhigh`） |
| 日期 | 2026-08-25 |
| 规格基线 | PRD v2.0（§2.6 / §6.1 CITY-01~11 / §7.4 Phase 0）· SRD v2.0（§12.7 全章 / 红线 / 预算）· `cyber-city-implementation-plan.md`（§5–§8 / §7 波 1 Task 定义） |
| 设计基线 | `cursor/cyber-city-hero-design-1d6f` @ `3f10102` |
| 审计对象 | CC-E1（[#16](https://github.com/rayw-lab/website/pull/16)）· CC-E3（[#14](https://github.com/rayw-lab/website/pull/14)）· CC-E5（[#17](https://github.com/rayw-lab/website/pull/17)）· CC-E10（[#15](https://github.com/rayw-lab/website/pull/15)），均 draft、base = 设计基线 |
| 审计方法 | ① 逐分支 diff vs 各自 merge-base；② 逐分支 `pnpm astro check` + `pnpm build` 复现；③ 四分支按 E1→E3→E5→E10 顺序**试合并**（detached HEAD，不污染任何分支），合流树全量 check/build/预算/链接门禁 + Playwright 运行时冒烟（`?impl=engine` / `&city=1&robot=1` / `&vehicle=kinematic` / 默认路径零字节）；④ 联网核对 Quaternius 许可 |

---

## 0. 裁决速览

> **裁决：放行。** 四分支零红线违规、零预算超限、验收全部可复现、试合并冲突面小且已预演解法（合流树 check/build/门禁/运行时冒烟全绿）。**波 2（E2 ∥ E4 ∥ E6）可开工**，前提 = 编排方先按 §7 建议顺序把波 1 四分支合入设计基线，并把 §8 交接项写进波 2 任务书。分支内**必须修复项：无**；合流执行项 4 条（M1–M4，均为常规整合动作，非缺陷）。

关键实测数字：

| 指标 | 规格上限 | 实测 | 判定 |
|------|---------|------|:---:|
| 机器人 GLB | ≤ 800KB Draco（CITY-04 / SRD §12.7.2） | **345,360 B ≈ 338KB**（余量 462KB） | ✅ |
| 科技城首包净新增滚动核算 | ≤ 2MB | 338KB（其余分项未启用） | ✅ |
| city 默认路径外部资产 | 0 网络请求（SRD §12.7.6 S 档） | 0（全程序化；`?city=1` 分包 gzip 7.3KB 按需拉取） | ✅ |
| buildings JSON 槽位 | 12 在册 + 8 预留 = 封顶 20（SRD §12.7.3） | 12 + 8 = 20，spawn (0,0) 朝北，双主轴，五城区；**四分支对 JSON 零改动** | ✅ |
| world 引擎分包（spike 门禁 ≤400KB gzip） | ≤ 400KB | world 17.9KB + city 7.3KB + HeroRobot 2.2KB（合流树 gzip 实测） | ✅ |
| e2e 存量回归 | 42 用例零回归 | `--list` 48 = 42 存量 + 6 新增（全 skip 红灯态）；E10 留档全量跑 42 passed / 6 skipped / exit 0 | ✅ |
| 红线依赖 | 零 React/R3F/gsap/howler | 四分支 diff 扫描零命中；`package.json`/lockfile 零改动 | ✅ |

---

## 1. 审计清单逐条裁定（七项总表）

| # | 清单项 | 判定 | 证据摘要 |
|---|--------|:---:|---------|
| 1 | 文件域隔离 | ⚠️ 小幅越界，均已留痕且合理 | 详见 §2 各分支「文件域」行；共性：E1/E3/E5 三分支都改了共享挂载入口 `src/lab/world/index.ts`（编排层未把它列进任何 Task 文件域，属编排疏漏而非执行违规）；四分支各自**创建**了 `docs/research/cyber-city-eng-wave1-notes.md`（该文件头自述「分支各自为政，合流时按小节合并」，为设计内行为） |
| 2 | PRD/SRD 对齐 | ✅ | CITY-04（≤800KB/许可留档/零商标/idle 呼吸灯+环顾）✅；CITY-05 变形本体归波 2 E6，E5 已交付 `getAnchor()`/`setVisible()` 预留接口与交底 ✅；CITY-06/SRD §12.7.5 PhysicsVehicle 主路径 + KinematicFallback 同 `PlayerVehicle` 接口热切换，两档实测可开 ✅；SRD §12.7.3 buildings 12+8 数据驱动（ThemeTowers/CityBlocks/CitySilhouette 全部读 JSON，加楼=改 JSON 零代码）✅；e2e 红灯骨架符合方案 §7「用例骨架先写，红灯态」✅ |
| 3 | 红线 | ✅ | 零 React/R3F/gsap/howler（diff 正则扫描 + 依赖文件零改动）；补间全走 Ticker；E5 建 `THIRD-PARTY-NOTICES.md` + `docs/spec/asset-ledger-cyber-city.md` 台账；Quaternius CC0 已联网核证（官网「free to use in personal and commercial projects」+ 作者 itch.io 明文「the license is CC0」+ OpenGameArt 同步发布页）；E3 对 three.js `SkyscraperGenerator` 采用「MIT 算法思路重写、零代码复制」并登记台账 |
| 4 | 预算 | ✅ | 见 §0 数字表；合流树 `audit-budget.mjs` 全绿（首页首屏 33.8KB/200KB、G-D 零 world 字节命中 0/14 页、public/ 8.7MB/40MB、格式黑名单 0 命中）；E1 将 CarConcept 3.5MB 接入 spike 引擎加载清单——属 SRD §12.7.2 显式豁免复用件且仅在隐藏路径显式进入后拉取，合规 |
| 5 | 验收可复现 | ✅ | 四分支逐一复跑 `pnpm astro check`（0 errors）+ `pnpm build`（18 页全绿）；合流树运行时冒烟：`?impl=engine`（Rapier 档 W 键 6s 位移 2.43m、四轮触地、speed 4.6）、`?vehicle=kinematic`（同流程位移 0.72m，SwiftShader 慢速环境）、`?city=1`（console 输出 12 栋在册 + 8 槽 + 48 填充挂载日志）、`?robot=1`（机器人在场、光柱/idle 可见）、默认路径（city/robot/hero 相关网络请求 = 0）——控制台全程 0 错误（仅 WebGPU 不可用回退 WebGL 2 的 2 条预期 warning） |
| 6 | 合流风险 | ⚠️ 冲突面小、已预演 | 试合并实录：冲突只发生在 2 个文件——`src/lab/world/index.ts`（×2 次，**均只在文件头注释区**，函数体三方改动自动合并干净）+ `cyber-city-eng-wave1-notes.md`（add/add ×3，按小节拼接即解）；解完后合流树 check/build/预算/链接/冒烟全绿。建议顺序见 §7 |
| 7 | 波 2 放行 | ✅ 可开工 | E2（依赖 E1 ✅）、E4（依赖 E3 ✅，E3 已留 `createFacadeMaterial` 替换挂载点）、E6（依赖 E1+E5 ✅，`activate()/deactivate()` 物理插入点 + `getAnchor()/setVisible()` 热交换接口 + reduced-motion 口径交底齐备）；无硬阻塞，交接项见 §8 |

---

## 2. 逐分支审计明细

### 2.1 CC-E1 — PhysicsVehicle 上车 + VisualVehicle 合体（[#16](https://github.com/rayw-lab/website/pull/16)）

| 审计点 | 判定 | 证据 |
|--------|:---:|------|
| 文件域 | ⚠️ | 域内：`physics/PhysicsVehicle.ts`(+566)、`player/KinematicFallback.ts`(+370)、`player/Player.ts`(+104)。越界但必要：`core/Game.ts`(+52，装配接线——车辆挂点必须在 Game 阶段三构造，E5 明确避让了该文件以让位 E1，实际零冲突)、`src/lab/world/index.ts`(`?vehicle=` 接线)。**落位偏差**：`VisualVehicle.ts` 放在 `player/` 而实施方案 §3.2/任务行写的是 `world/VisualVehicle.ts` |
| 规格对齐 | ✅ | folio 参数表原封（frictionSlip 0.9 / sideFrictionStiffness 3 / 悬挂三档 0.88/1.23/1.63 + 20/30/40 / engineForce 300 / brake 35，逐值对照头注留档）；两段式 tick（order 2 pre / 5 post）；Rapier `DynamicRayCastVehicleController`；wasm 加载失败捕获 → KinematicFallback 顶上（SRD §12.7.5「世界永远能开」）；两档同 `PlayerVehicle` 契约 |
| 交接质量 | ✅ | `activate()/deactivate()` 为 CC-E6 变形物理插入点；`stop/upsideDown/stuck/flip` 事件面留给音效/UI；A/B 参数留档 `world-spike-log.md` §9；踩坑两枚（净高口径 0.92 / 底盘不进 Objects 注册表）留档 |
| 验收复现 | ✅ | check 0 err / build 18 页；`?impl=engine` Rapier 档实测可开（位移 2.43m/6s @SwiftShader）、`?vehicle=kinematic` 同流程可开 |

### 2.2 CC-E3 — 城市地图 schema + 程序化城区（[#14](https://github.com/rayw-lab/website/pull/14)）

| 审计点 | 判定 | 证据 |
|--------|:---:|------|
| 文件域 | ✅ | `city/` 内 7 个新文件 + `index.ts` 最小接线；`src/data/cyber-city-buildings.json` **零改动**（blob 同基线 `0b95212`，CC-MAP1 落库件，单源纪律成立）。注：`NeonFacade.ts` 提前实现了部分窗格材质（E4 的 `NeonMaterials` 域），但以显式替换挂载点交接、非侵占 |
| 规格对齐 | ✅ | 12 在册 + 8 预留槽（封顶 20）全数据驱动；十字路口双主轴 + 尽头路障 + 城市地面碰撞体走 Objects 约定；出生点直读 JSON `world.spawn` (0,0) 朝北；S 档 0 网络请求（SRD §12.7.6）；hero 5 栋（四主题塔 + concept-garage）与 spawnHd 名单一致 |
| 预算 | ✅ | 外部资产 0 字节；city 独立分包 gzip 7.3KB，默认路径零 city 字节（运行时网络断言复核） |
| 验收复现 | ✅ | check/build 绿；`?city=1` 挂载日志与 12+8+48 数字逐项对上；默认路径零 `city*` 请求复测通过 |

### 2.3 CC-E5 — 机器人英雄接入（[#17](https://github.com/rayw-lab/website/pull/17)）

| 审计点 | 判定 | 证据 |
|--------|:---:|------|
| 文件域 | ⚠️ | 域内：`public/models/hero-robot/`、`city/HeroRobot.ts`(+382)。越界（已在笔记「域外挂点」自报）：`src/lab/world/index.ts`（`?robot=1` 演示挂点）、`src/pages/world-spike/index.astro`（+4 行参数透传，E2 文件域）。**任务书偏差**：未改 `core/ResourcesLoader` 两阶段清单——改为导出 `HERO_ROBOT_RESOURCES` 清单 + 合流约定（CC-E6/E7 拼进 `Game.init` 阶段二），属明智避让（E1 正在竞写 Game.ts），且交接路径明确 |
| 许可/红线 | ✅ | Quaternius Animated Mech Pack「Stan」CC0 1.0（包内 License.txt + 官网声明 + 本审计联网核证）；台账（asset-ledger）+ 总账（THIRD-PARTY-NOTICES）+ 目录 README 留痕（来源/日期/改造清单/复现管线/热替换约定）三层齐备；零 Transformers 商标元素（换装钛灰/青/橙、无红蓝涂装/徽章/火焰纹） |
| 预算 | ✅ | 338KB ≤ 800KB；动态 import 独立分包（gzip 2.2KB），默认路径零机器人字节；GLB 失败自动回退程序化块面机甲（R4 止损，同接口） |
| Transform 预留 | ✅ | `getAnchor()`（机器人站位即变形锚点，SRD §12.7.4 同锚点热交换）+ `setVisible()`（光幕峰值热交换开关）+ reveal 光柱剧本可复用为回变显现拍 + idle 呼吸灯循环动画配额（CITY-03 ≤2 处）交底 + reducedMotion 构造参数与 E6 instant swap 口径对齐 |
| 验收复现 | ✅ | check/build 绿；`?robot=1` 机器人在场、光柱 + idle + 呼吸灯可见（合流树截图留档 agent 工件） |

### 2.4 CC-E10 — e2e 世界剧本骨架 + 走查表（[#15](https://github.com/rayw-lab/website/pull/15)）

| 审计点 | 判定 | 证据 |
|--------|:---:|------|
| 文件域 | ✅ | `e2e/cyber-city.spec.ts`（+261，仓库既有 `e2e/` 目录约定，优于方案字面 `tests/e2e/`）+ `human-gate-checklist.md` §5；未动 `playwright.config.ts`（绿灯时与解 skip 同 PR 调整，留有明注） |
| 规格对齐 | ✅ | CITY-E2E-01~06 覆盖：壳零 world 字节冒烟（SRD §11.2 ⑥ 正则含 `_astro/world*`/`models/`/`hdri/`/`textures/city/`）、跳过出口 Tab 首焦点、变形→可开状态机、reduced-motion 终态、`?gl=1` 回退、机器人可见计时；每用例头注上位条款；**全部 `test.skip` 红灯态**且 skip 原因/绿灯五条件成文；选择器契约 `SEL` 常量区 = 实装时唯一改动点 |
| 走查表 | ✅ | §5.1 首幕八项 / §5.2 八出口（任一失效 = P0 bug）/ §5.3 Persona 2 猎头剧本 / §5.4 真机帧率回填位——PRD §7.4 门禁四张表齐 |
| 零回归 | ✅ | 本审计 `--list` 复核 48 = 42+6；E10 留档全量 42 passed / 6 skipped / exit 0；运行再生成的 e2e 截图按纪律未入库 |

---

## 3. 试合并实录（合流风险量化）

以设计基线 `3f10102` 为底，按 **E1 → E3 → E5 → E10** 顺序试合并（detached HEAD，未推送）：

| 步 | 合并 | 冲突 | 解法 |
|----|------|------|------|
| 1 | E1 | 无 | fast整合，`Game.ts`/`Player.ts`/三个新文件干净落地 |
| 2 | E3 | `src/lab/world/index.ts`（仅文件头注释区）+ notes（add/add） | 头注两段并列保留；notes 取 E1 版头 + 拼接 E3 小节 |
| 3 | E5 | 同上两文件、同样位置 | 同法；**函数体（vehicle/city/robot 三段接线与 dispose 链）全部自动合并干净** |
| 4 | E10 | 仅 notes（add/add） | 拼接 E10 小节 |

合流树验证结果（全绿）：`astro check` 0 errors → `build` 18 页 → `audit-budget.mjs` 全部阻断级门禁通过 → `check-links.mjs` 310 条内部引用零断链 → 运行时冒烟四条关键路径 + 默认路径零字节全过（§1 第 5 行）。**结论：合流为低风险机械操作，无语义级冲突。**

---

## 4. 必须修复项与合流执行项（列给编排方）

**分支内必须修复项：无**（未发现任何红线违规、预算超限、验收造假或语义缺陷）。

**合流执行项（合并波 1 时由整合方处理，M1 必做，M2–M4 为波 2 任务书必带交接项）**：

| # | 项 | 内容 | 归属 |
|---|-----|------|------|
| M1 | 两个共享文件的冲突解法 | `src/lab/world/index.ts` 头注并列保留（vehicle/city/robot 三行）；`cyber-city-eng-wave1-notes.md` 统一文件头后按 E1/E3/E5/E10 小节顺序拼接（两分支文件头标题不同，取其一即可） | 整合方（本报告 §3 已给可用解法） |
| M2 | `VisualVehicle.ts` 落位裁决 | 现在 `player/`，方案 §3.2 写 `world/`——E2 合流（carRig 并入方）时二选一：迁到 `world/` 或修订方案文字。不影响功能，影响的是 E2 任务书文件域指向 | CC-E2 |
| M3 | 出生锚点统一 | spike 灰盒 respawn 仍在环形道 (10,0,0)，city JSON spawn 为十字路口 (0,0)；机器人站位挂 respawn 默认点。E2 合流/E6 首幕需把 respawn 默认点切到 JSON `world.spawn` 并让机器人/变形落点/城市三者对齐（E3/E5 笔记均已登记） | CC-E2 / CC-E6 |
| M4 | 临时接线转正 | `?vehicle=`/`?city=` 走 `location.search` 兜底属临时接线（壳页白名单只转发 `gl`/`robot`）；E2 退役 `?impl=` 时一并把参数并入壳页白名单 | CC-E2 |

另记两条非阻塞观察：① E5 演示挂点的机器人 `targetHeight 5.2` 是灰盒相机取景适配，城市首幕相机就位后须回 8–12m 级（类默认 9m，E5 注释已写明）——E6 接管时勿沿用 5.2；② 共享 VM 上波 1 各 Task 曾并行跑 preview/e2e，工作区偶有 e2e 截图再生成的未提交改动，各分支提交纪律均未被污染（E10 显式还原），后续波次沿用「不提交无关 png」纪律即可。

---

## 5. 建议合并顺序

```text
E1（#16） → E3（#14） → E5（#17） → E10（#15）
```

理由：E1 动 `core/Game.ts` 最深、是 E2/E6 的硬依赖，先进减少后续 rebase 面；E3 次之（city 目录独立，index.ts 冲突最小化）；E5 头注与挂点在 E1/E3 语境下解冲突最自然（其 robot 段引用 `game.respawns`，E1 已在树上）；E10 纯增文件、任意位置可进，放最后免得 notes 文件反复冲突。四合一后跑一次全量门禁（本审计 §3 已预演全绿）。

---

## 6. 波 2 放行建议

**可开工：E2 ∥ E4 ∥ E6 三 Task 并行**（文件域互斥成立），前提两条：

1. 波 1 四分支已按 §5 顺序合入设计基线（否则波 2 各自基于未合流基线，E2/E6 对 Game.ts/index.ts 的改动会把冲突面放大数倍）；
2. 波 2 任务书显式携带 M2/M3/M4 交接项与 §4 两条观察，并把各分支笔记「给 CC-E6 的接口交底」「遗留与交接」小节列为必读。

无阻塞项。E4 注意与 E3 `NeonFacade.ts` 的关系：窗格材质替换挂载点已留（`createFacadeMaterial`），E4 应替换/扩展而非另起炉灶，避免 Premortem P9 双材质系统。

---

## 7. 最终裁决

> ## **放行**
>
> 波 1 四 Task（CC-E1/E3/E5/E10）全部通过审计：文件域越界均已自报留痕且属装配必需、PRD/SRD 条款逐项对齐、红线零违规、预算全部在限内且台账制度就位、验收 100% 可复现（含本审计独立复跑与合流树运行时冒烟）、合流冲突面收敛于两个共享文件且解法已预演。按 §5 顺序合并，携 §4/§6 交接项放行波 2（E2 ∥ E4 ∥ E6）。

*CC-A1 · 2026-08-25 — 审计过程零业务代码改动；试合并在 detached HEAD 完成、未推送；合流树集成截图存 agent 工件（a1-merged-city-robot.png）。*
