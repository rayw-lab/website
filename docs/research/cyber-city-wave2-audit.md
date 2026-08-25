# 波 2 工程审计报告（CC-A2）：E2 / E4 / E6 三分支合流前审计

| 项 | 内容 |
|----|------|
| Task | **CC-A2**（波 2 波末审计，编排看板 `cyber-city-eng-orchestration.md`） |
| 审计员 | Fable5（云端子代理，`claude-fable-5-thinking-xhigh`） |
| 日期 | 2026-08-25 |
| 规格基线 | PRD v2.0（§2.6 / §6.1 CITY / §7.4 Phase 0，尤其终裁 **D4 变形后可开**）· SRD v2.0 §12.7 · `cyber-city-implementation-plan.md` 波 2 Task 定义 · `cyber-city-wave1-audit.md` M1–M4 交接项 |
| 设计基线 | `cursor/cyber-city-hero-design-1d6f` @ `d413a38`（**已含波 1 四分支合流**） |
| 审计对象 | CC-E2（[#21](https://github.com/rayw-lab/website/pull/21)，32 文件 +543/−1638）· CC-E4（[#20](https://github.com/rayw-lab/website/pull/20)，10 文件 +932/−220）· CC-E6（[#19](https://github.com/rayw-lab/website/pull/19)，8 文件 +933/−31），均 draft、base = 设计基线 |
| 审计方法 | ① 逐分支 diff vs 设计基线 + 逐文件代码审计；② 逐分支 `pnpm astro check` + `pnpm build` 复现（独立 worktree）；③ 按 **E2 → E4 → E6** 顺序试合并（detached HEAD 独立 worktree，未推送），语义冲突逐一解出后合流树全量 check / build / 预算 / 链接门禁 + **e2e 全量 48 用例** + Playwright 运行时冒烟（`?ritual=1` 全流程 / `?city=1&quality=0|2` / reduced-motion 即时切换 / 默认路径零字节） |

---

## 0. 裁决速览

> **裁决：有条件放行。** 三分支各自零红线违规、零预算超限、验收全部可复现；**但三者存在真实的语义级合流冲突**（波 1 只有注释区冲突，本波不同）——E2 的 mount「等 reveal 才 ready」与 E6 的 `autoReveal=false` 组成**死锁对**，E2 的 M4 参数白名单会**无声掐断** E6 的 `?ritual=1`（该文件无文本冲突，天然合并即静默破坏）。本审计已在试合并中逐一解出（解法全文见 §3/§4），解后合流树 check / build / 预算 / 链接 / e2e 48 用例（42 绿 + 6 CITY skip）/ 运行时冒烟**全绿**。条件 = 整合方**必须按 §4 M5–M8 的解法执行合并**（或直接采用本审计预演树），不得天然合并。满足条件后**波 3（E8 ∥ E9）可开工**。

关键实测数字（合流树，全部 gzip 后）：

| 指标 | 规格上限 | 实测 | 判定 |
|------|---------|------|:---:|
| world 引擎分包（spike 门禁 ≤400KB gzip） | ≤ 400KB | world 20.9KB（raw 71.0KB；波 1 期 17.9KB，+3KB 来自 spike HUD/遥测迁入） | ✅ |
| 按需分包 | — | city 6.0KB + buildings-JSON 2.9KB + HeroRobot 2.2KB + TransformSystem 2.3KB + Reveal 2.5KB（后两者并入 ritual 动态链） | ✅ |
| 默认路径 world 字节 | 0（SRD §11.2 ⑥） | `audit-budget.mjs` G-D 门禁 0/14 页命中 + 运行时网络断言 0 请求 | ✅ |
| spike 目录退役 | 引擎单实现（方案 §3.2） | `src/lab/modules/world/spike/` 7 文件全删（−1,433 行），facade 薄入口保留 | ✅ |
| e2e 存量回归 | 42 绿 + 6 CITY skip | 合流树全量 **42 passed / 6 skipped / exit 0**（含 E2 重标定后的 WS-E2E-01~11） | ✅ |
| 红线依赖 | 零 React/R3F/gsap/howler | 三分支 diff 正则扫描零命中；`package.json`/lockfile 零改动；补间全走 Ticker/TSL | ✅ |
| 站点门禁 | 全部阻断级 | 合流树 `audit-budget.mjs` 全绿（首页首屏 33.8KB/200KB、public/ 8.7MB/40MB、格式黑名单 0）+ `check-links.mjs` 310 条内链零断链 | ✅ |

---

## 1. 审计清单逐条裁定（六项总表）

| # | 清单项 | 判定 | 证据摘要 |
|---|--------|:---:|---------|
| 1 | 文件域隔离 / 红线 | ✅（红线零违规）⚠️（域界 3 处，均已留痕合理） | 红线：三分支 diff 扫 `react\|@react-three\|gsap\|howler` 零命中，依赖文件零改动。域界：E4 把 `NeonFacade` 主体迁到 `rendering/NeonMaterials.ts`（E3 预留的替换挂载点，属设计内交接而非侵占）；E6 改 `inputs/Inputs.ts`（nipplePointer 加 driving 类目，+1 行最小接线）；E2/E6 竞写 `src/lab/world/index.ts` 与 `player/Player.ts`（编排层将两文件同时划给两个 Task，见 §5 冲突预测）。详见 §2 |
| 2 | PRD/SRD 对齐 | ✅ | **spike 退役**（方案 §3.2/M2）：7 文件删净、HUD/遥测/FpsMeter/canvas 置换纪律全部迁入引擎层，`world-spike-log.md` §10 决策留档 ✅；**Quality 三档**（PRD §5.3 D3）：`QualityLevel 0\|1\|2`，霓虹/网格地面/剪影/bloom 四子系统全部响应 `changeLevel` 热切，实测三档视觉可辨（运行时截图留档）✅；**Transform 四态**（SRD §12.7.4）：`robot_idle → transforming → car_ready → driving` 字面落地，幂等防重入 + `transform('robot')` 回变可验 ✅；**D4 零等待可开**：`car_ready` 同帧 `filters.add('driving')`，实测变形落地后首个 W 输入即位移（`world-drive-start` 遥测同帧）✅；**M3 spawn(0,0)**：respawn 注册表默认点改写为 buildings JSON `world.spawn`，R 复位/变形落点/机器人站位三点同锚 ✅；**M4 白名单**：壳页 `PARAM_ALLOWLIST` 转正、`?impl=` 退役、白名单外参数忽略且 URL 不回写（WS-E2E-05 复验）✅——唯 E4 `?quality=` 走 `location.search` 旁路（见 M9） |
| 3 | 预算与默认路径零字节 | ✅ | 见 §0 数字表；world 主分包 20.9KB ≪ 400KB 门禁；ritual 全链（world+city+JSON+robot+transform+reveal+GLB 338KB）按需拉取；默认路径运行时网络断言 0 条 world/city/robot/GLB 请求；三分支未新增任何 public/ 资产 |
| 4 | e2e 42 绿 + CITY skip 合理性 | ✅ | 合流树全量 **48 = 42 passed + 6 skipped，exit 0**（24.5 分钟；WS-PERF-01 软门禁观察行照常输出 SwiftShader 低帧读数，属环境预期、不阻断，真机帧率以 human-gate-checklist §2 人工录测为准）；42 绿含 E2 重标定的 WS-E2E-01~11（spawn 十字路口化、Space=刹车、锥桶 Rapier 动态体、nipple 遥测修正——重标定动因均可追溯至真实行为变更，非放水）；CITY-E2E-01~06 **维持 skip 合理**：用例契约面向 `/` 正式壳（首屏零 world 静态标签、Tab 首焦点跳过出口、正式 HUD 选择器），E6 交付的是引擎侧 TransformSystem/Reveal + `?ritual=1` 演示挂点，壳层路由切换归 CC-E7（波 4）——E6 已在 spec 注释里逐条重新论证 skip 原因并更新选择器契约注释，绿灯五条件不变 |
| 5 | 合流冲突预测 | ⚠️ 语义级冲突 4 处，已全部预演解出 | `git merge-tree` 权威结论：E2 对基线**零冲突**；+E4 冲突 1 文件（notes add/add）；+E6 冲突 3 文件（notes、`src/lab/world/index.ts`、`player/Player.ts`）。**但文本冲突之外另有 2 处无文本冲突的静默破坏**（ritual 白名单缺失、Reveal 键位提示文案过期）与 1 处**死锁对**（E2 mount 等 `revealed` × E6 `autoReveal=false` 永不触发）。全部解法见 §3/§4，解后全量门禁绿 |
| 6 | 放行裁决 + 波 3 | **有条件放行** | 条件 = 合并必须按 §4 M5–M8 执行（禁止天然合并）。满足后波 3 可开工：E9（POI 先遣）依赖 E2（Zones/引擎单实现）+ E3（楼数据，已在基线）——E2 合入即解锁；E8（CI 门禁改造）无波 2 硬依赖、可即刻开工，但其 world manifest 注册项须与 E7 同 PR 生效（方案 §7 原文） |

---

## 2. 逐分支审计明细

### 2.1 CC-E2 — spike 合流退役 + 引擎单实现转正（[#21](https://github.com/rayw-lab/website/pull/21)）

| 审计点 | 判定 | 证据 |
|--------|:---:|------|
| 文件域 | ✅ | 核心动作：删 `src/lab/modules/world/spike/` 全部 7 文件（camera/carRig/engine/inputs/params/scene/vehicle，−1,433 行），`src/lab/modules/world/index.ts` 转薄入口（动态 import 引擎 mount，facade 分包映射位不变）；引擎侧 `src/lab/world/index.ts` 成为唯一 mount 实现（HUD 接线 + `__worldSpike` 遥测 + FpsMeter 迁入）；`src/pages/world-spike/index.astro` 白名单转正。全部在任务书文件域内 |
| spike 语义迁移 | ✅ | 逐项核对 spike engine.ts 契约结转：`__worldSpike.state/fps/info` 遥测面完整（e2e 消费方零改动即绿）、HUD 0.25s 节流刷新、教学提示「任何驾驶意图即消隐」、dispose 时 canvas 置换纪律、FpsMeter 喂墙钟时间戳（绕开 Ticker maxDelta 钳制）——`world-spike-log.md` §10 留档决策 8 条 |
| M3 出生锚点 | ✅ | `World.ts` SPAWN 直读 `cyber-city-buildings.json world.spawn`（0,0 朝北）；灰盒环形道 (10,0,0) 废除；锥桶阵随之重排且改 Rapier 动态体（撞击语义从「标记击倒」升级为真物理，WS-E2E-04 重标定有据） |
| M4 白名单 | ✅ | `PARAM_ALLOWLIST = ['gl','vehicle','city','robot']`（合流时 +`ritual`，见 M6）；`?impl=` 分叉退役；白名单外参数忽略且不回写 URL（WS-E2E-05 断言复验）；引擎侧不再 `location.search` 兜底 |
| 键位裁决 | ✅ | Space=刹车转正（spike 口径 + WS-E2E-03 契约），folio 原 Space=悬挂跳挪 KeyF；`Keyboard.ts` 对驾驶键 `preventDefault`（修页面滚动漏防）；`Nipple.ts` 修 NDC 换算与角度解读两处真 bug（笔记有前后对照） |
| e2e 重标定 | ✅ | WS-E2E-01~11 全绿；重标定四处（spawn 断言、速度阈值、锥桶物理、nipple 遥测）逐条对应真实行为变更，无「改断言凑绿」痕迹 |
| 验收复现 | ✅ | 独立 worktree `astro check` 0 errors / `build` 18 页；world 分包 gzip 20.9KB（迁入 HUD/遥测后 +3KB，远离 400KB 门禁） |

### 2.2 CC-E4 — 霓虹视觉系统 + Quality 三档（[#20](https://github.com/rayw-lab/website/pull/20)）

| 审计点 | 判定 | 证据 |
|--------|:---:|------|
| 文件域 | ✅（1 处设计内跨域） | 新增 `rendering/NeonMaterials.ts`（TSL 程序化霓虹材质厂，核心交付）、`rendering/MeshGridMaterial.ts`、`rendering/PreRenderer.ts`（CubeCamera 预编译防 reveal 卡顿）、`world/Grid.ts`（湿地反射地面）；改 `core/Quality.ts`、`rendering/Rendering.ts`（bloom 回归）、`city/index.ts`（quality 事件接线）。`city/NeonFacade.ts` 改薄转发壳——恰好走 E3 预留的 `createFacadeMaterial` 替换挂载点，波 1 审计点名的 Premortem P9「双材质系统」风险**未发生** |
| Quality 三档 | ✅ | `QualityLevel: 0\|1\|2`（波 1 期 0\|1 扩容）；三档差异实测可辨：0 = 无 bloom/贴地纯网格/剪影减半/霓虹低强度无闪烁，1 = bloom 常规/网格反射弱档，2 = bloom 满档/湿地反射/剪影全量/霓虹闪烁动画；`changeLevel` 事件驱动四子系统热切（霓虹/Grid/Silhouette/bloom），运行时 `?quality=0` 与 `?quality=2` 截图对照留档（agent 工件） |
| 红线/TSL | ✅ | 零新依赖；全部效果 TSL 节点材质 + Ticker 时基，无 gsap/后处理外库；three 0.185 TSL API 迁移核对留档（notes E4 小节） |
| 预算 | ✅ | 纯程序化零外部资产；city 分包 gzip 6.0KB（波 1 期 7.3KB→重构后更小）；默认路径零字节不受影响（bloom 只在 world 分包链内） |
| 偏差观察 | ⚠️ ×2（非阻塞，见 §4 观察） | ① PRD §5.3 写 Quality 0「体积雾」，实现为三档统一距离雾（性能取舍合理但与验收字面不符，需产品侧追认或 E7 前补）；② PRD CITY-03 循环动画配额「≤2 处」vs 方案放宽「同屏 ≤5」——E4 霓虹闪烁为 shader 内取样非独立动画循环，口径待人类裁决 |
| 验收复现 | ✅ | check 0 err / build 18 页；`?city=1&quality=0`、`?city=1&quality=2` 运行时冒烟均零错误加载、档位差异肉眼可辨 |

### 2.3 CC-E6 — TransformSystem V1 + Reveal 首幕剧本（[#19](https://github.com/rayw-lab/website/pull/19)）

| 审计点 | 判定 | 证据 |
|--------|:---:|------|
| 文件域 | ✅（1 处 +1 行跨域） | 新增 `player/TransformSystem.ts`（+~370，四态机 + V1 遮蔽式变形：充能环 + 光幕遮蔽热交换 + 物理 `activate()/deactivate()` 插入点对接 E1 接口）、`world/Reveal.ts`（首幕编排：机器人光柱显现 → CTA/Space → 变形 → 键位提示，DOM 覆盖层归 host 容器）；改 `index.ts`（?ritual=1 装配）、`Game.ts`（+`autoReveal` 选项）、`Player.ts`（categories +driving）、`Inputs.ts`（nipplePointer +driving，+1 行，使触屏摇杆在变形后可用——域外但最小且必要） |
| Transform 四态 | ✅ | `TransformState = 'robot_idle' \| 'transforming' \| 'car_ready' \| 'driving'` 字面吻合 SRD §12.7.4；v0.1 的 car_idle/car_ready 两态按终裁 D4 合并留有明注；transforming 幂等防重入；`transform('robot')` 回变同管线可验（#debug 句柄 `__worldTransform`，CC-P1 预演） |
| D4 零等待 | ✅ | `car_ready` 与 `filters.add('driving')` 同帧；实测（合流树 Playwright）：变形落地帧按 W，下一遥测采样即有位移与 `driving` 态迁移，无任何「等动画播完」门 |
| reduced-motion | ✅ | `prefers-reduced-motion: reduce` 下变形为即时切换（无充能环/光幕动画），状态文字提示仍逐态播报——合流树用 `matchMedia` 注入实测确认走 instant swap 路径 |
| M3 对齐 | ✅ | 机器人站位 = 变形锚点 = JSON `world.spawn`（E5 `getAnchor()` 接口消费）；变形落点即 R 复位点 |
| e2e 纪律 | ✅ | 未解任何 skip（正确——用例契约面向 E7 正式壳）；仅更新 spec 注释：逐条重述 skip 理由 + 选择器契约随交付对齐 |
| 验收复现 | ✅ | check 0 err / build 18 页；`?ritual=1` 全流程冒烟：光柱显现 → CTA → 变形（动画 + reduced-motion 两路）→ WASD 即开（物理档）全绿，截图留档 |

---

## 3. 试合并实录（合流风险量化）

以设计基线 `d413a38` 为底，按 **E2 → E4 → E6** 顺序试合并（detached HEAD 独立 worktree，未推送）。`git merge-tree` 权威冲突面：

| 步 | 合并 | 文本冲突 | 文本冲突之外的语义问题（天然合并不会报错！） |
|----|------|---------|---------------------------------------|
| 1 | E2 | **无**（零冲突干净合入） | — |
| 2 | E4 | `cyber-city-eng-wave1-notes.md`（add/add） | 无——`Rendering.ts` 双方改动自动合并且语义正交（E2 canvas 置换 × E4 bloom/dispose） |
| 3 | E6 | `cyber-city-eng-wave1-notes.md` + `src/lab/world/index.ts` + `src/lab/world/player/Player.ts` | ① **ready 死锁对**：E2 版 mount 末尾 `await 'revealed'` 事件才 resolve，而 E6 ritual 模式 `autoReveal=false` 使该事件永不触发→mount 永久挂起；② **ritual 白名单静默掐断**：E2 壳页 `PARAM_ALLOWLIST` 无 `ritual`，`index.astro` 无文本冲突、天然合并后 `?ritual=1` 静默失效；③ **键位提示文案过期**：E6 `Reveal.ts` 提示写「Space 悬挂跳」，与 E2 键位裁决（Space=刹车/F=悬挂）矛盾，无文本冲突 |

**预演采用的解法（全部已在合流树验证）**：

1. `index.ts` 语义织合：ritual 装配段（E6）嵌入 E2 新骨架（HUD/遥测/白名单化 params）；**死锁解** = `if (!ritualRequested && !game.revealed) await 'revealed'`——ritual 模式下输入放行由 TransformSystem 在 car_ready 帧热切（intro → driving），mount 即刻 resolve，ready 语义 = 首幕剧本已接管（e2e 以 `data-world-state` 为时序信号），裁决理由已写入头注；
2. `Player.ts` 并集：键位取 E2 裁决（Space=brake / KeyF=suspensions），categories 取 E6 扩展（全动作 +`driving`）；
3. `index.astro`：`PARAM_ALLOWLIST` += `'ritual'`；
4. `Reveal.ts`：键位提示改「W/A/S/D 或方向键驾驶 · Shift 加速 · Space/B 刹车 · F 悬挂跳 · R 回到路口」；
5. notes add/add：统一文件头后按 E2 → E4 → E6 小节顺序拼接（同波 1 M1 手法）。

合流树验证结果（**全绿**）：`astro check` 0 errors → `build` 18 页 → `audit-budget.mjs` 全部阻断级门禁通过 → `check-links.mjs` 310 条内链零断链 → **e2e 全量 42 passed / 6 skipped / exit 0** → 运行时冒烟：`?ritual=1` 全流程（含 reduced-motion 即时切换支路 + D4 首输入即开）、`?city=1&quality=0` 与 `?quality=2` 档位对照、默认路径零 world 字节，控制台全程零错误（仅 WebGPU→WebGL2 回退的预期 warning）。

---

## 4. 必须修复项与合流执行项（列给编排方）

**分支内必须修复项：无**——三分支各自在自身语境下均正确、可复现，问题全部产生于**交汇处**。

**合流执行项（M 编号接波 1 续排；M5–M8 为本次合并的硬性条件，跳过任何一条 = `?ritual=1` 挂死或静默失效）**：

| # | 项 | 内容 | 归属 |
|---|-----|------|------|
| M5 | ready 死锁解 | `src/lab/world/index.ts` mount 末尾的 `await 'revealed'` 必须加 `!ritualRequested` 短路（解法与裁决理由见 §3；否则 ritual 模式 mount 永久挂起） | 整合方（本审计已给可直接采用的织合版） |
| M6 | ritual 白名单 | `src/pages/world-spike/index.astro` `PARAM_ALLOWLIST` += `'ritual'`——**该文件无文本冲突，天然合并即静默破坏**，是本波最危险的一处 | 整合方 |
| M7 | Player 键位 × categories 并集 | 冲突解法 = E2 键位（Space=brake/KeyF=suspensions）× E6 categories（+driving），二者正交、必须都保留 | 整合方 |
| M8 | Reveal 键位提示文案 | 随 E2 键位裁决更新（无文本冲突的文案漂移）；顺带对 `driving` 后 Space 归属加注 | 整合方 |
| M9 | `?quality=` 白名单转正 | E4 `core/Quality.ts` 直读 `location.search`（代码已自注临时性）；按 M4 纪律应并入壳页 `PARAM_ALLOWLIST` 经 `opts.params` 转发——非阻塞（旁路可用），归 E7 壳层接管时一并转正 | CC-E7（波 4 任务书必带） |

另记四条非阻塞观察：① E4 体积雾缺位——PRD §5.3 Quality 0 写「体积雾」，实现为三档统一距离雾，需产品侧追认修订 PRD 或在 E7 前补齐；② CITY-03 动画配额口径——PRD「≤2 处循环动画」vs 方案「同屏 ≤5」vs E4 shader 内闪烁取样，三种口径需人类裁决统一（建议：shader 采样不计入配额，DOM/Ticker 循环计入）；③ 机器人 `targetHeight 5.2` 仍是灰盒相机适配值，E7 城市首幕相机（FOV 42°/距 18m/俯角 22°）就位后须回 9m 级——E5/E6 注释均已留标记，勿失传；④ ritual 模式的 `data-ws-hint` 壳页提示由引擎侧 DOM setAttribute 预隐——属跨层最小干预，E7 正式壳自带 HUD 后该挂点随 `?ritual=` 退役。

---

## 5. 建议合并顺序

```text
E2（#21） → E4（#20） → E6（#19）
```

理由：**E2 必须打头**——它删除 spike 目录并重立引擎单实现，是本波「地基置换」；若 E4/E6 先进，E2 的大删改会把三方冲突面从 3 文件放大到两位数。**E4 第二**——它与 E2 的交集只有 `Rendering.ts`（语义正交自动合并）+ notes，先进可让 E6 在「已带 bloom/Quality 的树」上解冲突，一次到位。**E6 收尾**——它是唯一与 E2 存在语义级耦合（mount 骨架 / 键位 / 白名单）的分支，放最后使所有语义织合集中在一步完成（M5–M8 恰好全部落在这一步，见 §3 表）。合并全程**禁止天然合并**，按 §3 解法执行或直接采用本审计预演树 diff。

---

## 6. 波 3 放行建议

**可开工：E8 ∥ E9 并行**（文件域互斥成立：E8 = `scripts/`+CI 配置，E9 = `world/areas/`+POI 数据），前提两条：

1. 波 2 三分支已按 §5 顺序 + §4 M5–M8 解法合入设计基线（E9 硬依赖 E2 的引擎单实现与 Zones 就位——基于未合流基线开工会重蹈本波 index.ts 竞写覆辙）；
2. 波 3/波 4 任务书显式携带：M9（`?quality=` 转正归 E7）、观察③（targetHeight 回 9m 归 E7）、观察①②（雾/动画配额口径需在 E7 验收前裁决）；E8 注意 world manifest 注册项按方案 §7 与 E7 同 PR 生效，避免 manifest 先行导致 lab 索引页出现死卡片。

---

## 7. 最终裁决

> ## **有条件放行**
>
> 波 2 三 Task（CC-E2/E4/E6）全部通过分支内审计：红线零违规、预算全部在限内、PRD/SRD 关键条款（spike 退役 / Quality 三档 / Transform 四态 / D4 零等待 / M3 / M4）逐项字面落地、验收 100% 可复现（含本审计独立复跑与合流树全量 e2e 42 绿）。**条件**：本波合流存在 1 处死锁对 + 2 处无文本冲突的静默破坏，整合方必须按 §3/§4 M5–M8 的已验证解法执行合并，禁止天然合并。条件满足即视为放行，波 3（E8 ∥ E9）随基线合流解锁。

*CC-A2 · 2026-08-25 — 审计过程零业务代码改动；试合并在 detached HEAD 完成、未推送；运行时冒烟截图存 agent 工件（ritual 机器人 idle / quality 0 vs 2 对照 / 变形后驾驶）。*
