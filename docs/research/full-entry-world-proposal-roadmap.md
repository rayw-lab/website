# Full Entry World 提案与路线图：从「Hybrid + 灰盒 Spike」到「进去就是炫技」

> **一句话定位**:本文回答「用户要的『进去就是炫技』怎么落地」——在不推翻 HTML 宪法的前提下,把 `/world-spike/` 从「灰盒验证品」升级为「开场即成品级炫技的完整世界」,并给出分 Gate 交付、folio 资产搬运、并行 Task 拆分与 PRD/SRD 修订清单。

## 0. 文档信息

| 项 | 值 |
|---|---|
| 版本 | v1.0 |
| 日期 | 2026-08-25 |
| 作者 | 云端子代理(Full Entry 落地规划角色) |
| 上游依赖 | `docs/spec/implementation-roadmap-birdseye.md` v1.0.2(§4.2 Track B、§5 Phase 4 Gate)、`docs/research/folio-gap-and-reuse-report.md` v1.0(§7 资产、§8.2 待搬清单、§9 Top 20)、`docs/research/world-spike-log.md`(Spike 决策记录,已判「通过」)、PRD v1.1.1 / SRD v1.1.1 |
| 效力约定 | 本文是**提案**,不是已批准规格。§6 修订清单落笔进 PRD/SRD 并经王磊终审前,任何突破现有红线的施工不得开始;不触红线的部分(Phase B' 大部)可先行 |

### 0.1 「Full Entry」的本站定义(先把词说死)

用户愿景是「进去就是炫技」。本文把它拆成两档,**推荐第一档**:

- **档 1(推荐,本文主路线)——入口即炫技**:HTML 首页保持宪法地位不动;但访客点击「进入 3D 试验场」后,看到的不再是灰盒 + 素色锥桶,而是**成品级视觉的完整世界**——folio 同款网格地面、进度圆环启幕、任意输入即出发、灯光雾、统一材质、POI 分区。入口体验从「工程验证品」升级为「作品」。这一档**不违反** PRD §2.6 承诺二(opt-in)与 SRD AP-9,只需局部修订(§6.1)。
- **档 2(不推荐,仅留档)——首页即世界**:打开域名直接进 3D 接管。这是 PRD §11 / SRD 不做清单里白纸黑字的「Full Bruno Clone,永久不做」,与 C-2/C-3、10 秒定位、猎头 30 秒路径三处硬约束正面冲突。若王磊终审执意选这一档,必须先走 §6.2 的推翻清单——在那之前它是 Out of Scope(§7)。

---

## 1. 现状快照(main @ `5430ffa`,2026-08-25)

已上线(GitHub Pages 生产环境):

| 资产 | 状态 | 细节 |
|---|---|---|
| **HTML 首页** | ✅ 上线 | 五区块(Hero poster + 三支柱 + Lab bento + 案例卡 + Now/CTA);Hero 已挂「进入 3D 试验场」公开入口(`ee46c1c`);Work/Insights/AI Lab/About/Now/Contact 全路由 + RSS/sitemap |
| **`/world-spike/` 公开路由** | ✅ 上线 | 已从 noindex 隐藏路由转公开(index,follow + 进 sitemap,`17d5a0d`);首页与 Lab 索引均有入口卡(`f113e81`);独立最小壳:poster + 进入按钮 + noscript,点击前零 world 字节 |
| **双 Demo** | ✅ 上线 | `tts-cockpit`(RA-01,S 级,9KB JS)与 `car-configurator`(RB-01,M 级,257KB JS)注册于 `src/lab/manifest.json`,走统一 facade/mount() 契约 |
| **两套 world 实现并存** | ✅ 同页合流 | 默认挂载 = **vehicle 可驾驶 Spike**(`src/lab/modules/world/spike/`,手写运动学控制器 ~270 行 + CarConcept carRig + 追尾相机 + 触屏摇杆,Spike 决策记录的验证对象);`?impl=engine` = **引擎层灰盒**(`src/lab/world/`,22 文件 folio 架构:Game/Ticker/Events/Viewport/Quality/ResourcesLoader/Objects/Inputs 四件/Physics(Rapier)/Rendering/Player/View/World/Zones/References/Respawns,Player 已留 physicalVehicle 挂点) |
| **Spike 裁决** | ✅ 通过 | `docs/research/world-spike-log.md` §8:物理选型 = 手写运动学(Rapier 保留为 Phase B 升级路径);JS 实测 283KB gzip(门禁 400KB);`public/world/` 新增 0 字节;条件项 = **真机帧率录测(桌面 + 中端安卓)须在 Phase B 合并前补齐** |
| **门禁基建** | ✅ 运行 | ci.yml(check/链接/预算/Lighthouse CI 四项 ≥95 阻断)、audit-budget 首页零 world 字节断言、e2e 42/42 全绿(含 WS-PERF-01 常驻帧率采样)、MVP Gate 已签署 |

**一句话现状**:地基全部打完、车能开、门禁全绿——但访客点进去看到的是灰盒:素色程序化地面、primitive 锥桶、无启幕仪式、无分区内容、两套实现还没合体。「能玩」已证明,「炫技」尚未开始。

## 2. 目标态一句话

**访客从首页点「进入 3D 试验场」,8 秒内(Fast 4G)看到进度圆环收起、folio 级视觉的试验场亮起、任意按键即驾驶同一辆 CarConcept 驶向六分区 POI——每个分区都是 HTML 内容的空间化橱窗,任何一刻八条出口两跳回宪法。**

## 3. 分阶段交付(Gate 制,不用日历)

> 阶段间是门禁关系:上一 Gate 未过不得合并下一阶段成果。每阶段独立可上线、独立可止损。验收命令沿用 roadmap §12 cheatsheet 既有脚本。

### 3.1 Phase B' —— 炫技首屏(新增阶段,本提案核心)

**使命**:在现有 `/world-spike/` 路由上,把「进去」的头 60 秒从灰盒升级为成品级炫技。不加新分区、不动信息架构——只做合体 + 视觉 + 启幕仪式,是 Phase B 的前置减险切片。

**交付物**:

1. **两实现合体转正**:vehicle 的 vehicle/carRig/inputs/camera 四模块按 `engine.ts` 头注的 tick 契约插进 `src/lab/world/` 的正式 Game 循环(Spike 决策记录 §8 既定路径);`?impl=` 开关退役,单一入口;运动学控制器保留(Rapier 换装留到 Phase B 按需评估)。
2. **folio 同款地面**:`MeshGridMaterial.ts`(零改,156 行)+ `Grid.ts`(低改)替换程序化画布纹理——灰盒瞬间变 folio 颜值,零美术投入(gap report §3.B P1 项)。
3. **启幕仪式**:`Intro.js + Reveal.js` 合并移植为 `world/Reveal.ts`(~200 行,中改):两阶段资产加载 + TSL 进度圆环 + 「任意输入即出发」+ reveal 半径展开;gsap 补间全换 `ticker.delay` + 手写缓动(红线 G5)。
4. **首帧质量三小件**:`PreRenderer.ts`(零改,shader 预热防白帧)、`Wheel.ts`(零改,滚轮缩放)、灯光 + 雾硬编码两盏起步。
5. **真机帧率录测补齐**(Spike 遗留条件项):桌面 DevTools 4x throttle 20s + 中端安卓 chrome://inspect 60s,读数回填 `docs/spec/human-gate-checklist.md` §2。

**验收命令**:

```bash
pnpm astro check && pnpm build
node scripts/audit-budget.mjs dist/        # 首页零 world 字节断言仍全绿
gzip -kc dist/_astro/<world-chunk>.js | wc -c   # ≤ 400KB gzip(Spike 口径继续从严)
du -sh public/world/                        # 新增资产 ≤ 1MB(CarConcept 豁免不变)
pnpm test:e2e                               # 42 用例 + WS-PERF-01 零回归
# 人工:真机录测读数回填 human-gate-checklist §2;?gl=1 双后端走查;
#      启幕全流程(圆环→任意输入→出发)reduced-motion 下直接呈现终态
```

**阻断条件**:真机中端安卓持续 <24fps 且 RR-04 三板斧(DPR→1/关阴影/实例减半)无效 → 按 roadmap 止损路径执行(归档 ai-lab 实验记录,世界降级 HOME-07/08),**Phase B/C 全部冻结**;两实现合体后任何 Spike 已验证行为(整圈/锥桶/复位/摇杆)回归 → 不得合并。

### 3.2 Phase B —— 最小可玩世界(对应 roadmap B2,范围不变、承接 B')

**交付物**(PRD §7.4 Phase B 全量):`/world/` 正式路由与壳页(world-spike 归档 301);六分区骨架中的三个:出发广场(定位大屏 + 教学)、案例岛(旗舰 A 展馆 + B/C 标牌)、实验区(TTS 电台塔 + 涂装车间,`mode:'world'` 复用双 Demo 资产);POI 系统五件套(Zones/References/Respawns 已在 main,补 Area/Areas/InteractivePoints/TextCanvas);POI 数据单源 `src/data/world-pois.json`;八出口全套(LAB-18)+ 2D 等距地图 + iframe overlay;四事件埋点(`world-enter/skip/poi/exit-to`);标牌纹理构建期从 frontmatter 生成(单源不漂移)。

**验收命令**:

```bash
npx lighthouse http://localhost:4321/website/world/ --chrome-flags='--headless --no-sandbox'  # 壳页四项 ≥95,LCP=poster
node scripts/audit-budget.mjs dist/   # world 预算表:首屏 JS ≤500KB / 全量 ≤900KB / 首包 ≤5MB / 流式 ≤12MB
node scripts/check-links.mjs dist/    # 八出口 + POI 深链 ?poi= 零断链
# 人工:加载→可驾驶 ≤8s @Fast 4G 计时;八出口逐条走查表留档;
#      Persona 2 门禁(猎头 30 秒路径相对无世界版本零劣化,G6);
#      加载屏定位文案完整播完一轮;首页 Lighthouse 回归四项 ≥95
```

**阻断条件**:八出口任一失效 = P0(G6);首页/内容页对 world 出现任何字节增量 = CI 阻断(NFR-P6);内容密度未达 mvp-checklist 数量表 → 本阶段禁启(roadmap Phase 3 连坐条款);上线满 30 天读数据阀门——世界→内容转化率 <25% 或 30 秒退出率 >50% → **Phase C 冻结**,先修信息动线。

### 3.3 Phase C —— 完整版(对应 roadmap B3,范围不变)

**交付物**:车↔机器人 morph(V1 遮蔽式,TransformSystem ~250 行自建);音效体系(Audio 结构照抄 + WebAudio 手写播放层,全部可关且 reduced-motion 默认关);档案馆/控制塔/联络站三分区全内容映射;昼夜联动(DayCycles + Time 低改);彩蛋 ≤3;**世界工程复盘长文**(旗舰级 ai-lab 文章,失败与取舍如实入档)。

**验收命令**:Phase B 全指标回归 + morph 在 `?gl=1` 回退路径可播【人工】+ 音效开关全走查【人工】+ 世界同屏循环动画 ≤5 核验【人工】+ `du -sh public/` ≤40MB。

**阻断条件**:数据阀门未过不得开工(唯一不可人为加速的节点);morph 成本失控 → 降级「局部变形」或车形态跑全程(RR-03 既定路径,不影响其他交付物);音效资产来源存疑 → 弃用换 CC0(§4 合规口径)。

## 4. folio 资产搬运清单

> 授权底线(gap report §7.1 三条自律红线的转录):MIT 文本名义覆盖两仓库全部内容,但**只搬工程性资产、不搬内容性资产**;BGM/字体有第三方版权穿透风险禁搬;每笔搬运在 `docs/spec/` 资产台账登记「源路径/许可/体积/入库路径」,文件头署名 `MIT © Bruno Simon`,并建仓库根 `THIRD-PARTY-NOTICES.md` 集中履约。

**入库搬运(合计 ≤1.1MB,全部在 SRD §12.6 40MB 配额内)**:

| # | 源(vendor/folio-2025/static/) | 目标 | 体积 | 阶段 | 合规口径 |
|---|---|---|---|---|---|
| 1 | `interactivePoints/*.ktx`(E/Enter/A 三键位图标) | `public/world/poi/`(或按站点视觉重绘) | ~12KB | Phase B | MIT,工程性 UI 资产;倾向重绘保持风格统一(未决问题,王磊定) |
| 2 | `intro/sound.png`(声音开关序列帧) | `public/world/ui/` | ~8KB | Phase C | MIT,工程性 |
| 3 | `sounds/{vehicle,hits,rolling,swoosh,clicks,reveal}/` 精选 ≤10 文件 | `public/world/sounds/` | ≤1MB | Phase C | 逐文件确认为 Bruno 自制才用,存疑即换 freesound CC0 / Kenney Audio;台账逐文件登记 |
| 4 | `floor/slabs`、`overlay/overlayPattern` 平铺纹理 | 按需 `public/world/` | <70KB | Phase B(候选) | MIT,视觉需要时评估 |

**只借不搬(0 字节入库)**:

| 源 | 用法 |
|---|---|
| `vehicle/default-compressed.glb`(36KB) | 手感调参 A/B 对照,本地开发目录 gitignore,**不上生产**(品牌混淆 + 已定 CarConcept 路线) |
| `areas/areas.glb`(3.2MB) | 仅 Blender 本地打开学习命名约定(`physical/dynamic`、`zoneBounding/zoneFrustum`、`ref*`),照此出我们自己的 areas.glb |
| `draco/` + `basis/` 解码器(4.2MB) | **无需搬**——three r185 loader 内置 `import.meta.url` 解析,ResourcesLoader 已接 |

**明确禁搬**:`sounds/musics/` 148MB BGM(版权穿透)、`projects/` 15MB + `lab/` 8.4MB + `ui/` 9.2MB(Bruno 内容性资产/品牌物料)、`fonts/` 796KB(上游许可未核查)、`terrain/` 1.4MB(平地路线)、folio-2019 全部 models(matcap 路线不用)。

## 5. Fable5 并行 Task 拆分建议(下一轮实施)

> 拆分原则:文件域互斥(可真并行)、每个 task 独立可验收、Task 1 是 2/3 的前置(合体后接口才稳定)。建议 Task 1 先行合并,2-6 并行。

| # | Task 标题 | 负责文件范围 | 对应交付物 |
|---|---|---|---|
| 1 | **world 合体转正:vehicle 四模块插进正式 Game 循环** | `src/lab/world/{core/Game.ts,player/Player.ts,physics/,view/}`、`src/lab/modules/world/spike/*`(迁移后删除)、`src/lab/world/index.ts`、`src/pages/world-spike/index.astro`(去 `?impl=`) | B'-1 |
| 2 | **炫技视觉层:MeshGridMaterial + Grid + 灯光雾 + PreRenderer** | `src/lab/world/rendering/{MeshGridMaterial.ts,PreRenderer.ts}`、`src/lab/world/world/Grid.ts`、`src/lab/world/world/World.ts`(灯光/雾段) | B'-2、B'-4 |
| 3 | **启幕仪式:Intro/Reveal 合并移植 + 输入门控切换** | `src/lab/world/world/Reveal.ts`(新)、`src/lab/world/inputs/Inputs.ts`(filters `['intro']→['wandering']`)、`src/lab/world/inputs/Wheel.ts` | B'-3 |
| 4 | **POI 系统五件套 + 数据单源** | `src/lab/world/areas/{Area.ts,Areas.ts,InteractivePoints.ts}`、`src/lab/world/world/TextCanvas.ts`、`src/lab/world/utils/maths.ts`(补 `circleIntersectsPolygon` 等)、`src/data/world-pois.json`(新 schema) | B 前置 |
| 5 | **`/world/` 壳页 + 八出口 + 2D 地图 + 埋点** | `src/pages/world/index.astro`(新)、`src/lab/world/ui/Map.ts`、`src/lab/manifest.json`(world 条目)、埋点接 facade 既有 GoatCounter 通道、`e2e/world-*.spec.ts` 扩展 | B 主体 |
| 6 | **合规与资产管线:NOTICES + 台账 + POI 图标 + 标牌纹理生成** | `THIRD-PARTY-NOTICES.md`(新)、`docs/spec/` 资产台账、`public/world/poi/`、`scripts/`(标牌纹理构建期生成脚本) | §4 全部 + B |

## 6. PRD/SRD 需修订的条款清单

### 6.1 档 1(入口即炫技,推荐)——小修订批次,B' 开工前合并

| # | 文档与条款 | 现状 | 修订内容 |
|---|---|---|---|
| 1 | PRD §7.4 三阶段表 | A Spike → B → C | 插入 **Phase B'(炫技首屏)** 行:交付物/门禁/止损照本文 §3.1;Phase A 行标注「已通过,决策记录归档」 |
| 2 | PRD LAB-16 / HOME-10 | `/world-spike/` 未在册,入口按钮约定「LAB-16 Phase B 未上线时不出现」 | 补记既成事实:Spike 已公开上线(goal-progress-status 已记录人工 Gate 产品豁免),LAB-16 增补「B' 期间公开路由为 `/world-spike/`,B 转正后 301 至 `/world/`」;HOME-10 验收标准同步 |
| 3 | SRD §12.7 world 专章 | 目录树/预算按 Spike 单实现描述 | 回写合体后目标态(`src/lab/modules/world/spike/` 退役);物理选型结论(手写运动学,Rapier 为升级路径)落笔第 6 章淘汰条件行 |
| 4 | SRD §9.3 / manifest | world 未注册 manifest | Phase B 注册 `slug:'world'`(`kind/budgetClass:'world'`),B' 期间沿用现壳页直挂方式,加注记 |
| 5 | roadmap §4.2/§5/§7 | 无 B' 概念;§7 仍是「执行清单」 | 增 B' 里程碑行与 Gate 格;§7 按维护规则 11.2-3 改写为「执行记录」 |

### 6.2 档 2(首页即世界)——推翻清单,**每一条都需王磊终审签字**

若终审执意选档 2,以下条款按序推翻/重写,缺一不可(在此之前档 2 不得动工):

1. **PRD §11 Out of Scope**「Full Bruno Clone 永久不做」条 + **SRD 不做清单**同条——从「永久不做」降格为「在册例外」,须给出替代性保障方案。
2. **PRD §2.6 承诺二**(opt-in,没有开屏接管)+ **SRD AP-9**——三层承诺是 v1.1 Hybrid 决策的地基,推翻即触发 PRD/SRD 大版本号升级与全部下游文档(roadmap/adaptation/本文)连锁回修。
3. **SRD C-2/C-3 + G1/G2 门禁**——首页四项 ≥95 与 <200KB 在 3D 接管下物理不可达,须为首页另立运行时预算并接受 SEO/无障碍/10 秒定位的量化损失评估。
4. **PRD §10.2 指标 1**(10 秒定位 ≥80%)与 **N2 北极星**——须先做原型实测证明 3D 首屏也能达标,否则即自我否决。
5. **master-plan 第 6 章**动效红线 + **G6/Persona 2 门禁**口径——猎头 30 秒路径的对照基线从「无世界版本」变为「跳过按钮路径」,须重定义劣化判据。

## 7. 不建议做的项(scope 边界)

| 项 | 理由 |
|---|---|
| **首页全屏 3D 接管(档 2)** | PRD/SRD 双文档「永久不做」在册;档 1 已满足「进去就是炫技」,档 2 只增加合规成本不增加体验增量 |
| **Rapier 换装在 B' 强行落地** | Spike 裁决手写运动学通过且手感达标;翻车/互推/悬挂三档是 Phase B 才需要的能力,届时按参数表原封起步,B' 换装是无收益返工 |
| **装饰件全家桶**(Grass/Trees/Snow/Rain/Water/Whispers 等 ~20 模块) | gap report 既定裁决「预算与工期黑洞」,Phase B 至多回访 Fences/PoleLights/Benches 三小件 + Confetti 彩蛋 |
| **排行榜/多人(Server.js)** | 永久不做:纯静态托管无后端、三个红线依赖、隐私成本;圈速用本地 localStorage 替代 |
| **BGM 与 folio 曲库** | 148MB 版权穿透风险,禁搬;音效 ≤2MB 且不上 BGM 是 roadmap 既定纪律 |
| **成就系统进 Phase C 交付物** | 三文档交付清单均不含;保持「C 后备」,数据阀门通过后再议极简版(~150 行) |
| **实时骨骼 IK morph** | RR-03 既定:V1 只做遮蔽式变形,失控即降级局部变形 |
| **为统一风格重做车模** | roadmap §8.3 冻结裁决:写实 CarConcept vs 低模世界的张力已知且接受,Phase C 按数据再评审 |
| **引入 gsap/howler/tweakpane 等红线依赖** | G5 门禁;Ticker.delay + 手写缓动 + WebAudio 路线已在 13 个移植文件验证可行 |
| **B' 期间新增正式美术资产** | 炫技首屏全部靠代码级视觉(MeshGridMaterial/Reveal/灯光雾)达成,新增资产 ≤1MB 门禁不放宽;正式美术随 Phase B areas.glb 一并进场 |

---

*本文为提案稿。裁决路径:王磊终审 §0.1 档位选择 → §6.1 修订批次落笔 PRD/SRD/roadmap → 按 §5 Task 拆分开工。与 PRD/SRD 冲突处一律以 PRD/SRD 现行版为准——本文不产生需求,只组织落地顺序。*
