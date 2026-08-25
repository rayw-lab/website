# 波 3 工程审计报告（CC-A3）：E8 / E9 两分支合流前审计

| 项 | 内容 |
|----|------|
| Task | **CC-A3**（波 3 波末审计，编排看板 `cyber-city-eng-orchestration.md`） |
| 审计员 | Fable5（云端子代理，`claude-fable-5-thinking-xhigh`） |
| 日期 | 2026-08-25 |
| 规格基线 | PRD v2.0（CITY-07 POI 体系 / GLB-08 分层门禁，终裁 **D6**）· SRD v2.0 §11.2 ④⑤⑥ / §12.7.2 / §12.7.5 / §12.7.8 出口⑧ / §9.5 · `cyber-city-implementation-plan.md` §4.4 六项 / §5.2 预算总表 / §7 E8·E9 行 · `cyber-city-wave2-audit.md` M9 与观察项交接 |
| 设计基线 | `cursor/cyber-city-hero-design-1d6f` @ `fba3213`（**已含波 2 三分支合流 + M5–M8 织合**） |
| 审计对象 | CC-E8（[#23](https://github.com/rayw-lab/mywebsite/pull/23)，6 文件 +467/−45）· CC-E9（[#24](https://github.com/rayw-lab/mywebsite/pull/24)，12 文件 +1298/−16），均 draft、base = 设计基线 |
| 审计方法 | ① 逐分支 diff vs 设计基线（merge-base `c2a206b` 双向核对）+ 逐文件代码审计；② E9 voice-pod 黑菱形根因**几何独立复核 + 运行时截图对照**；③ 按 **E8 → E9** 顺序真实试合并（detached HEAD 独立 worktree `/tmp/wave3-merge`，未推送），解出唯一 notes 冲突后合流树全量 `astro check` / `build` / `audit-budget` / `check-links` + **E7 三态模拟复现** + **LHCI assertMatrix 空匹配双向独立复验** + Playwright 运行时冒烟（`?poi=` 深链出生 / E 键进站直跳 / 无效 slug 兜底 / 默认路径零 areas 字节）+ e2e 全量回归 |

---

## 0. 裁决速览

> **裁决：放行。** 两分支各自零红线违规、零预算超限、验收全部可独立复现；与波 2 不同，**本波不存在语义级合流冲突**——E8（scripts/CI 配置）与 E9（areas/POI 引擎件）文件域零交叠、语义正交，唯一文本冲突是 `cyber-city-eng-wave1-notes.md` 末尾双追加（add/add 机械冲突，按 **E8 → E9** 小节顺序拼接即解，波 1 M1 同手法）。试合并树 check / build / 预算 / 链接 / LHCI 机制复验 / `?poi=` 运行时冒烟 / e2e 全量**全绿**。合流按 §5 顺序执行 M10（notes 拼接）即可，无波 2 式死锁对或静默破坏。**波 4（CC-E7 原子切换）随基线合流解锁**，必带项清单见 §6。

关键实测数字（合流树，全部 gzip 后）：

| 指标 | 规格上限 | 实测 | 判定 |
|------|---------|------|:---:|
| G-G(world) chunk 直测 | ≤ 900KB | world 命名 chunk ×2 合计 17.8KB（另见观察① 口径说明） | ✅ |
| G-G(world) 资产池（models+hdri） | ≤ 12MB | 5.2MB | ✅ |
| areas 独立懒分包 | 默认路径零字节 | 6.1KB gzip，无 `?poi`/`?city` 时运行时网络零 areas/world-pois 请求（实测断言） | ✅ |
| 宪法首页首屏（过渡口径 `dist/index.html`） | < 200KB | 33.8KB（G-A′ SOFT 档四分项 13.0/0.0/20.6/33.8 全过） | ✅ |
| G-D 零 world 字节 | 受保护页命中 0 | 14 页命中 0；E7 三态模拟（切换绿 / 切换+注入阻断 / 过渡+注入阻断）逐条复现 | ✅ |
| POI 触发圈 | CITY-07 首版 ≥10 | 12/12 就位（运行时日志），新增外部资产 **0 字节** | ✅ |
| 站点门禁 | 全部阻断级 | `audit-budget.mjs` exit 0 零 WARN + `check-links.mjs` 310 条内链零断链（fallback 登记 2 条常驻） | ✅ |
| e2e 存量回归 | 42 绿 + 6 CITY skip | 合流树全量 **42 passed / 6 skipped / exit 0** | ✅ |
| 红线依赖 | 零 React/R3F/gsap/howler | 双分支 diff 正则扫描零命中（E9 命中行全部是「gsap→手写缓动」的说明注释）；`package.json`/lockfile/manifest/workflow 四类文件双分支零改动 | ✅ |

---

## 1. 审计清单逐条裁定（六项总表）

| # | 清单项 | 判定 | 证据摘要 |
|---|--------|:---:|---------|
| 1 | 文件域隔离 / 红线 | ✅（红线零违规）⚠️（域界 4 处，均最小且留痕合理） | 红线：双分支 diff 扫 `react\|@react-three\|gsap\|howler\|lenis\|tweakpane\|postprocessing` 零实码命中；依赖文件零改动。域界：E8 改 `scripts/check-links.mjs`（任务书文件域未列，但它是 §4.4 六项之第 6 项，属验收要求本体）；E9 改 `src/lab/world/index.ts`（+28 行最小接线，波 2 E2/E6 挂点先例）、`src/pages/world-spike/index.astro`（白名单 +1 项 `poi`，M4/M6 纪律要求壳透传）、`e2e/cyber-city.spec.ts`（+6 行纯注释登记交付面，E6 波 2 先例）、`TextCanvas.ts` 落位 `world/` 而非 `areas/`（通用件归世界层，notes 有「楼顶招牌可直接消费」论证）。详见 §2 |
| 2 | PRD/SRD 对齐 | ✅ | **E8**：§4.4 六项逐项落地或合法过渡（对照表见 §2.1）；G-A′ 四分项阈值 = SRD §12.7.2 字面（35/15/40/90）；G-D「排除表只加根 index.html 一行」条件化实现 = SRD 原文语义；LHCI 双口径 = D6/GLB-08。**E9**：CITY-07 十二楼全量触发圈（≥10 达标）；SRD §12.7.5 深链出生（parkingBay + 朝向）字面落地；§12.7.8 出口⑧ `?poi=` 深链成立；§9.5 `world-poi` 事件名对齐（`trigger('world-poi', [id])` 事件+参数形式，统计接线归 CITY-11/CC-P1）；「橱窗不装内容」纪律遵守（标点只有标题+键帽，深度内容走真实 URL 直跳） |
| 3 | 预算与默认路径零字节 | ✅ | 见 §0 数字表；E9 新增 public/ 重资产 **0 字节**（键帽 canvas 手绘、标签 TextCanvas 程序化、菱形圈/光圈纯 TSL/Torus——folio 三款 KTX 键图全砍）；areas 分包仅在 `?poi=`/`?city=1` 时动态 import；默认路径运行时断言零 areas/world-pois 请求（`cyber-city-buildings.js` 分包出现为波 2 既有基线行为——M3 出生单源 `World.ts` 消费，非 E9 引入，与 E9 notes 自述一致） |
| 4 | e2e 纪律 | ✅ | 双分支均未解任何 CITY skip（正确——绿灯归 E7）；E8 零 e2e 改动并论证「不新增重复用例」成立（本审计核对：CITY-E2E-01 骨架已完整承载 §4.4 第 5 项「挂载前零 world 请求」语义，含 `WORLD_BYTES_RE` 超规格覆盖 `textures/city/`）；E9 仅 +6 行注释登记 `?poi=` 可测面。合流树全量 **48 = 42 passed + 6 skipped，exit 0** |
| 5 | 合流冲突预测 | ✅ 仅 1 处机械冲突 | `git merge-tree` 权威结论：E8、E9 对基线**各自零冲突**；顺序合并时唯一冲突 = notes 末尾 add/add（解法 = 小节拼接，M10）。看板 `cyber-city-eng-orchestration.md` 两分支相对 merge-base **均未改动**（diff 显示的差异是基线自身前进），不构成冲突面；`index.ts`/`index.astro` 白名单无竞写（E8 未触碰这两个文件）。**无死锁对、无静默破坏**——本波与波 2 的本质区别 |
| 6 | 放行裁决 + 波 4 | **放行** | 合流按 §5 顺序 + M10 拼接执行即可（无语义织合）。波 4 CC-E7 解锁，必带项 8 条见 §6（M9 quality 白名单、targetHeight 回 9m、manifest 激活拆弹、LHCI 日切、`?poi=` 壳白名单、voice-pod 观察、G-G chunk 命名口径、e2e 注释路径笔误顺手更正） |

---

## 2. 逐分支审计明细

### 2.1 CC-E8 — CI 门禁改造（[#23](https://github.com/rayw-lab/mywebsite/pull/23)）

**§4.4 六项落地对照表**（任务书验收本体）：

| §4.4 条目 | 落地形态 | 判定 |
|---|---|:---:|
| ① `lighthouserc.json` assertMatrix 双断言组 | 组① `.*/website/home/` 四项 ≥95（E7 前 collect.url 无该 URL → 空匹配不生效）+ 组② `.*` 四项 ≥95（与基线单组完全等效）；`/` Perf ≥80 阻断 / ≥90 warn 预置在 `lighthouserc.e7-draft.json`（CI 不引用，`_cc_e8_notes` 写明激活步骤） | ✅ 合法过渡 |
| ② G-A/B/C 重定向 + G-A′ | `E7_SWITCHED = dist/home/index.html 存在` 探测器自动重定向；G-A′ 四分项（35/15/40/90KB）E7 前 SOFT 档、E7 后转硬；零重资产/零 world 静态标签两条**恒硬** | ✅ |
| ③ G-D 排除表加根 index 一行 | `if (E7_SWITCHED && rel === 'index.html') return false` 条件化——过渡期根首页仍全额受保护，杜绝裸奔窗口 | ✅ |
| ④ G-G world 注册 manifest | **本波不注册**（A2 §6 过渡纪律选 b）：本审计独立核对死卡片论证成立——`src/pages/lab/index.astro` 过滤为 `status !== 'archived'` 且 href 硬拼 `/lab/{slug}`，world 注册即渲染 404 死卡片。替代 = **G-G(world) 直测**（chunk gzip ≤900KB + 资产池 ≤12MB，不依赖 manifest）+ 注册块占位补丁留档 notes（含激活须知 4 条，「裸激活」被显式禁止） | ✅ 合法过渡 |
| ⑤ 新增 e2e 冒烟 | 不新增——CITY-E2E-01 骨架（E10 交付、skip 态）已完整承载「load 前零 world 请求 + HTML 零 world 静态标签」语义且覆盖面超规格；本审计核对无缺口，重复用例反而违反 E10 文件域纪律 | ✅ 论证成立 |
| ⑥ `check-links.mjs` 深链改造 | 检查 5 feature-detect（buildings JSON 存在才生效）：12 楼 deepLink 存在性（fallback 登记行放行、缺链 E7 前警告/后阻断）+ dist 内 `?poi={id}` 在册校验（**恒阻断**，空集自然绿）+ `kind==='world'` live 路由豁免预埋 + 壳六导航由既有检查 1 自动覆盖（头注留档） | ✅ |

| 审计点 | 判定 | 证据 |
|--------|:---:|------|
| 日切探测器正确性 | ✅ | 本审计在合流树独立复现 **E7 三态模拟**：① 造 `dist/home/index.html` → 日志切「已切换」口径、G-A/B/C 改盯 home、G-A′ 转阻断、G-D 排除根，全绿 exit 0；② 切换态向根注入 world `<script src>` → G-A′ 阻断 2 条（引导 JS 17.3KB>15 + 零 world 命中 1），exit 1；③ 过渡态同样注入 → G-D 抓到（受保护页命中 1 FAIL）+ G-B 硬阻断 + G-A′ 零 world 恒硬，exit 1。三态行为与 E8 notes 自述逐条一致 |
| E7 前 CI 仍绿 | ✅ | 合流树 `audit-budget.mjs` exit 0 **零 WARN**、`check-links.mjs` exit 0（310 条零断链 + fallback 登记 2 条）；LHCI 组② 与基线断言完全等效（同四项同阈值同聚合），collect.url 未动——现网 CI 行为零变化；`.github/workflows/ci.yml` 零改动 |
| LHCI assertMatrix 机制 | ✅ 独立复验 | 本审计双向复验（`@lhci/cli@0.15.x` + preview 实跑）：正向 = 空匹配组（`/home/` 无 URL 命中）**零报错**（`All results processed!` exit 0）；反向 = 注入必失败断言（FCP maxNumericValue 1）→ `Assertion failed. Exiting with status code 1`——断言组真实生效非静默跳过。E8 notes「三连验证」主张成立 |
| G-G(world) 直测真实性 | ✅（口径见观察①） | 直测真实量测 dist 产物：`world.B_j1Fw9N.js` 17.3KB + `world.wm3Mmt9y.js` 0.5KB = 17.8KB/900KB；资产池 walk 实测 5.2MB/12MB。匹配口径 = `WORLD_RE` 词段（与既有 G-G 声明校验的 slug 命名约定同构）——areas/city/HeroRobot 等不带 world 词段的按需分包未计入（合计约 +20KB，余量巨大无现实风险），彻底收敛归 E7「chunk 按 slug 命名」（§4.4 原文），E8 notes 已自述该机制 |
| 验收复现 | ✅ | E8 notes 验收摘要（check 0 err / build 18 页 / 预算链接全绿 / e2e 48 全量 / LHCI 三连 / E7 双态模拟）全部在本审计合流树复现或独立重做，无一虚报 |

### 2.2 CC-E9 — POI 十二楼 · Phase 1 先遣（[#24](https://github.com/rayw-lab/mywebsite/pull/24)）

| 审计点 | 判定 | 证据 |
|--------|:---:|------|
| 数据驱动 / 零硬编码 | ✅ | `world-pois.json` 12 条只存 `id/buildingId/kind/action` 外键与交互语义（`deepLink` 契约块 + `interaction` 键位注入 + `point.hoverHeight`）——**无任何坐标/标题/颜色/URL 字段**；`Areas.ts` 全部空间量经 `buildingById` 查表取 `parkingBay/title/neonColor/deepLink`；运行期校验（id 重复/外键悬空/数量 <10 告警）就位，构建期 zod 硬校验正确让渡给 E8 管线（E9 notes E8 待办已登记） |
| `?poi=` 白名单 + 隐含挂城 | ✅ | 壳页 `PARAM_ALLOWLIST` += `'poi'`（M4/M6 纪律：壳只透传，引擎吃 `opts.params`——不走 location.search 旁路，比 M9 的 quality 更规矩）；`index.ts` `(city==='1' \|\| poiSlug!==null) && !ritualRequested` 隐含挂城；ritual 模式触发圈照挂但 `deepLinkPoi: null`（深链出生让位首幕锚点，M3 纪律）；dispose 链补 `areas?.dispose()` |
| 进站 URL 走 buildings.deepLink | ✅ | `onInteract` 读 `building.deepLink` + `import.meta.env.BASE_URL` 运行时拼接，`world-pois.json` 的 `deepLink.entryUrlField` 显式声明该间接层；实测 lingua-tower E 键直跳 `/website/work/multilingual-cockpit/` 落地成功（本审计运行时复现） |
| Zones 联动 | ✅ | `Area` 触发圈 = `game.zones.create('cylinder', …)`（enter/leave → boundingIn/Out）；本审计核对 `Game.ts`：zones 仅在 `if (RAPIER)` 内建立——E9 的运动学档兜底 `if (!game.zones) game.zones = new Zones(game)` 前提成立（Zones 零物理依赖，只测 player 距离）；tick order 8(zones)/9(points)/10(area) 与既有全表无冲突 |
| gsap 清零 | ✅ | `InteractivePoints.ts` 补间全部为手写缓动（power2 / back.in(4.5) / elasticOut(1.3, .4/.6/.8) 数值等价）+ tick 驱动 tween 通道表（`Map.set` 同通道后写覆盖 = gsap `overwrite:true` 语义，delay 期不捕获 from 的实现正确）；正则扫描零 gsap import，全部命中为说明注释 |
| voice-pod 黑菱形根因 | ✅ 独立复核成立 | **几何复核**：View 相机 θ=π/4、φ=0.31π、r max=30 → offset≈(17.5, 16.9, 17.5)；bay(28,28)+offset≈(45.5, 16.9, 45.5)，落在 voice-pod 楼体 x,z∈[36,68]、h=42 体积内；bay→楼中心方向 (−0.707,−0.707) 恰为相机方位角反方向——「全城唯一对角线楼」陈述成立。**运行时对照**：`?poi=voice-pod` 截图复现底部 45° 黑菱形（podium 顶面 y=4、#101018 俯视投影）+ 相机穿幕墙可见泊位（背面剔除），`?poi=lingua-tower` 画面干净——**非 E9 缺陷**，POI 件（光圈/标点/标签）在两场景渲染均正确；处置三选一（泊位挪位/相机遮挡淡出/基座提亮）归 E3 数据或 E7 排期（观察②） |
| 移植台账 / 键位纪律 | ✅ | folio 五文件（Areas/Area/InteractivePoints/TextCanvas/RayCursor，MIT commit 41046b5）逐文件登记处置（重写/原样/精简/砍单）；`poiInteract` 只挂 wandering/driving categories、`rayPointer` 只管指针——intro 的 Space/CTA 归 Reveal，波 2 键位裁决零侵犯 |
| 验收复现 | ✅ | 本审计合流树运行时复现：`?poi=lingua-tower` 深链出生 (−28,28) heading 225 + 光圈提亮 + 标点开态标签（截图留档）→ E 键 `world-poi` + 直跳成功；`?poi=not-a-building` warn + 候选清单 + 原地出生 (0,0)、零未捕获异常；默认路径 performance entries 断言零 areas/world-pois 请求；控制台全程零错误（仅 WebGPU→WebGL2 回退预期 warning） |

---

## 3. 试合并实录（合流风险量化）

以设计基线 `fba3213` 为底，按 **E8 → E9** 顺序真实试合并（detached HEAD 独立 worktree，未推送）：

| 步 | 合并 | 文本冲突 | 语义问题 |
|----|------|---------|---------|
| 1 | E8 | **无**（干净合入；看板文件两分支相对 merge-base 均未改，自动取基线版） | — |
| 2 | E9 | `cyber-city-eng-wave1-notes.md` ×1（末尾 add/add：E8 小节 × E9 小节同位追加） | **无**——E8/E9 文件域零交叠（E8 = scripts/lighthouserc，E9 = areas/data/index.ts/壳白名单/e2e 注释），无共改文件即无静默破坏面；E9 的 `?poi=` 链接当前只存在于引擎运行时（dist HTML 零 `?poi=` 引用），E8 check-links 的在册校验空集自然绿，两者在 E7 落深链时才真正交汇且契约已对齐（slug = buildings id） |

**解法（M10，已在合流树验证）**：notes 统一按 **E8 → E9** 小节顺序拼接，小节间补 `---` 分隔线（波 1 M1 同手法），无任何内容取舍。

合流树验证结果（**全绿**）：`astro check` 0 errors → `build` 18 页 → `audit-budget.mjs` exit 0 零 WARN（G-A′ SOFT 四分项全过 + G-G(world) 直测 17.8KB/900KB + 5.2MB/12MB）→ `check-links.mjs` exit 0（310 条 + 12 楼 deepLink 核对 + fallback 登记 2 条）→ E7 三态模拟逐条复现 → LHCI 空匹配/生效双向复验 → `?poi=` 运行时冒烟四场景（lingua-tower 深链 + E 键进站 / voice-pod 黑菱形对照 / 无效 slug / 默认路径零字节）→ **e2e 全量 42 passed / 6 skipped / exit 0**。

---

## 4. 必须修复项与合流执行项

**分支内必须修复项：无**——两分支在自身语境与交汇处均正确。

**合流执行项（M 编号接波 2 续排）**：

| # | 项 | 内容 | 归属 |
|---|-----|------|------|
| M10 | notes add/add 拼接 | `cyber-city-eng-wave1-notes.md` 按 **E8 → E9** 小节顺序拼接（间补 `---`）——本波唯一冲突，机械解法，无内容取舍 | 整合方（或直接采用本审计预演树） |

**非阻塞观察项（编号接波 2 四条观察续记）**：

- **观察⑤ G-G(world) 直测口径**：直测按「world 词段命名 chunk」匹配，areas（6.1KB）/city（4.9KB）/HeroRobot/TransformSystem/Reveal 等按需分包未计入（合计 ≈20KB，相对 900KB 上限零现实风险）——与既有 G-G 声明校验的 slug 命名约定同构，非 E8 引入的回归；彻底收敛 = E7 按 §4.4「chunk 按 slug 命名」统一 world 系分包命名（Vite chunkFileNames/manualChunks），届时直测自动全覆盖。
- **观察⑥ voice-pod 黑菱形**（承 E9 留档，本审计独立复核成立）：根因 = E3 裙房基座近黑材质 × 楼体在自家泊位相机对角线上（全城唯一）；处置三选一（buildings JSON 泊位挪出对角线 / View 相机遮挡淡出 / 基座材质提亮）归 E3 数据改动或 E7 排期，POI 系统本身无责。
- **观察⑦ e2e 注释路径笔误**：`e2e/cyber-city.spec.ts` 注释三处写「`/lab/world-spike/`」，实际路由为 `/world-spike/`（无 `/lab/` 前缀）——波 2 E6 注释既有笔误、E9 新注释沿用；用例体不受影响（`PAGE_URL = u('/')`）。E7 绿灯 PR 动注释区时顺手更正。
- **观察⑧ 标点标签窄画布触边**：出生视角下标签向右延展，窄 viewport（≈1024px）下尾字可能触画布右缘（E9 标定 POINT_SCALE 2.2→1.7 已大幅缓解）；E7 全屏壳画布下预计消失，验收走查时留意即可。

---

## 5. 建议合并顺序

```text
E8（#23） → E9（#24）
```

理由：两分支语义正交，顺序仅由一个弱约束决定——**E8 先进可让 E9 的交付（`?poi=` 深链、POI 数据）落进「深链校验已就位」的门禁树**，check-links 检查 5 的 `?poi=` 在册校验与 deepLink 核对即刻开始看护 E9 引入的契约面；反向顺序功能上亦可行，但门禁看护晚一步。notes 冲突按 M10 拼接。合并全程无语义织合需求，**可天然合并 + 解一处文本冲突**（与波 2「禁止天然合并」的态势本质不同）。

---

## 6. 波 4 交棒（CC-E7 任务书必带项）

1. **M9（承波 2）**：`?quality=` 从 `core/Quality.ts` 的 `location.search` 旁路转正——并入壳页 `PARAM_ALLOWLIST` 经 `opts.params` 转发；
2. **targetHeight 回 9m（承波 2 观察③）**：城市首幕相机（FOV 42°/距 18m/俯角 22°）就位后机器人从灰盒适配值 5.2 回 9m 级——E5/E6 注释有标记；
3. **manifest 激活拆弹（E8 notes 占位补丁 + 激活须知 4 条）**：world 注册块与路由切换同 PR 激活；激活时**必须同步**给 `src/pages/lab/index.astro` 加 `kind !== 'world'` 过滤或交付 `/lab/world/` 跳转页——禁止裸激活；`deepLinkParams` 与壳白名单对齐后定稿；
4. **LHCI 日切**：以 `lighthouserc.e7-draft.json` 的 `ci` 块整体替换 `lighthouserc.json`（collect.url 增 `/website/home/`），删 `_cc_e8_notes` 键与 draft 文件；激活后 CI 全量断言实跑复验（draft 三组结构 E8 已本地验证，E7 须在真实产物上再走一遍）；
5. **`?poi=` 壳白名单**：`/` 世界壳 `PARAM_ALLOWLIST` 增补 `poi`（E9 已在 world-spike 壳落地，正式壳同步）；`?poi=` 深链契约 = slug 用 buildings JSON `id`、进站 URL 读 `deepLink` 字段（勿硬编码）；内容页「返回世界」链接 `/?poi=<id>` 落地后 check-links 在册校验自动看护；
6. **voice-pod 黑菱形处置**（观察⑥ 三选一）+ **两条 fallback 楼转正**（agent-nexus → `/ai-lab/`、autodrive-lab → `/work/`——详情页落地后改 `deepLinkStatus: 'live'` 消登记行）；
7. **G-G chunk 命名口径**（观察⑤）：world 系分包按 slug 命名，使 G-G(world) 直测与 manifest 声明校验全覆盖；
8. **audit-budget / check-links 零改动跟随**：全部日切逻辑挂在 `dist/home/index.html` 存在性探测器上，`/home/` 产物出现即自动转档——E7 不需要碰 scripts/；壳施工按 G-A′ 红线自查（HTML+CSS ≤35 / 引导 JS ≤15 / poster ≤40 / 合计 ≤90KB、world 分包零静态标签），合并前 `node scripts/audit-budget.mjs dist/` 必须零 ❌。

另：E8 待办之一「world-pois.json ⇄ buildings.json 外键完整性收进构建期 zod 校验」（E9 notes 登记）——本波 E8 未做（其管线改造范围是 dist 侧门禁，zod schema 归 `src/data` 构建期校验，与 E7 的 buildings 构建期校验同池），转 E7/后续波登记，运行期 console.warn 兜底已在。

---

## 7. 最终裁决

> ## **放行**
>
> 波 3 两 Task（CC-E8/E9）全部通过分支内审计：红线零违规、预算全部在限内、关键条款（§4.4 六项落地或合法过渡 / 日切探测器三态正确 / manifest 死卡片守住 / G-G(world) 真实直测 / CITY-07 十二楼数据驱动零硬编码 / `?poi=` 白名单纪律 / deepLink 单源 / gsap 清零 / voice-pod 根因成立）逐项验证，验收 100% 可复现（含本审计独立复跑：E7 三态模拟、LHCI 双向复验、`?poi=` 四场景运行时冒烟、合流树 e2e 42 绿）。合流唯一动作 = 按 **E8 → E9** 顺序合并 + M10 notes 拼接，无语义织合需求。波 4（CC-E7 路由原子切换）随基线合流解锁，任务书必带 §6 八项。

*CC-A3 · 2026-08-25 — 审计过程零业务代码改动；试合并在 detached HEAD 完成、未推送；运行时冒烟截图存 agent 工件（lingua-tower 深链出生标点开态 / voice-pod 黑菱形对照）。*
