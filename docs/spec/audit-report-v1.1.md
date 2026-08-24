# 全套文档交叉审计报告 v1.1

> **审计对象**：PRD v1.1 / SRD v1.1 / 实施路径鸟瞰图 / Bruno Simon 拆解四篇 + 索引 / homepage-redesign-spec（抽样）/ master-plan（抽样）——共 10 份文档
> **审计角色**：独立技术审计员 + 文档 QA（未参与上述文档撰写）
> **审计日期**：2026-08-24
> **审计方法**：10 份文档全文通读；关键数值与引用逐条回源核对；仓库事实用命令核实（`vendor/` 存在且含 folio-2025/2019；`public/` 实测 8.7MB；`.github/workflows/` 现存 `deploy.yml` 与 jekyll 遗留工作流）
> **引用约定**：所有「文档 A 说 X vs 文档 B 说 Y」均给出章节定位，可直接打开对照

---

## 1. 审计摘要

| 项 | 结论 |
|----|------|
| **总体健康度** | **4 / 5** |
| **Phase A Spike 准入** | **Go with conditions**（先完成第 9 章 P0 五项；其中 P0-1 实际阻塞的是更早的 Phase 1 内容施工） |

**总评**：这是一套成熟度显著高于个人项目平均水平的文档体系——四层文档（总纲 → PRD/SRD → 鸟瞰图 → research）职责清晰、Hybrid 决策在全链路对齐、预算体系大体自洽、风险有登记有止损点、每个门禁给出了可执行的过门命令。v1.1 修订（adaptation §10 的 P1–P5 / S1–S6 落点）执行质量高，逐条可追溯。

**主要问题集中在四处**：

1. **一个 Critical**：案例「12 模块」模板在 PRD 与 master-plan/SRD 之间是**两套不同的清单**，且精简版模块集编号互相矛盾（3.1 节 C-1）——这直接影响 Phase 1 MVP 的三篇案例施工，比 Phase A 更紧迫；
2. **Spike 资产门禁三种算法**（3.2 节 M-3）——不裁决则 Spike Gate 无法读数；
3. **KPI 体系存在数个不可测指标**（3.2 节 M-7、5 节）——数据阀门是三阶段推进的核心控制机制，阀门指标测不出来，止损机制就是空转；
4. **master-plan 作为「业务总纲」滞后于 v1.1**——张力登记表只覆盖了第 6 章动效豁免，实际还有 URL 结构、模块表、英文范围、度量章四处需要一并修订（8 节）。

以上均为文档缺陷而非方案缺陷；Hybrid 路线本身、三阶段门禁设计与预算分账架构未发现结构性问题。

---

## 2. 一致性矩阵

关键决策在 PRD ↔ SRD ↔ 鸟瞰图 ↔ research（adaptation / source-teardown / UX / tech / index）↔ master-plan 的对齐情况：

| 决策 | PRD | SRD | 鸟瞰图 | research | master-plan | 判定 |
|------|-----|-----|--------|----------|-------------|------|
| **Hybrid 路线**（HTML 宪法 + opt-in `/world/`，否决 Full Clone） | §2.6 三层承诺、§11 禁令 | AP-9、§12.7 | §1、§3 | adaptation §1/§9 决策表、index | —（未提及，见 ❌ 行） | ✅ 全对齐 |
| **`/world/` 路由与入口**（不进六导航，HOME-10 + Lab 卡） | §5.2 规则 4、HOME-10、LAB-16 | §12.7.1 | §3.2、§4.3 | adaptation §2/§3 | **§2.3 URL 结构无 `/world/` `/lab/` `/en/` `/404`** | ❌ master-plan 未更新（M-10） |
| **预算分账**（首页 <200KB；world 500/900KB JS、5MB 首包、12MB 流式） | C-3、§7.4 | NFR-P2/P6、§12.7.2 | §10.3、D4 | adaptation §7.2 | §7（200KB 一致） | ✅ 规范层对齐；source-teardown §8.3 残留 8MB 旧口径（M-6） |
| **Spike 门禁**（JS ≤400KB / 资产 ≤3MB / 60fps/30fps） | §7.4 Phase A | §13 Phase 2 | §5、§7.3 | adaptation §5 | — | ⚠️ 数字一致，**资产 3MB 的计算口径三种算法**（M-3） |
| **morph**（V1 遮蔽式、Phase C 交付、WebGL2 可播、不做骨骼 IK） | LAB-17、§7.4 Phase C | §12.7、R8 相关 | B3、RR-03 | adaptation §2.4、source-teardown §10 | — | ⚠️ 形态与阶段全对齐；**触发方式矛盾**（自动 vs KeyT 手动，M-4） |
| **Start here**（Hero 旁第三 CTA、纯 `<a>`+CSS、点击前零 world 字节、壳页确认后才加载） | HOME-10、§2.6 | §12.7.1 | §3.2、§5 | adaptation §3.1 | — | ✅ 机制对齐；**点击率指标的度量口径与零 JS 前提冲突**（M-7） |
| **六分区 POI 空间化六导航** | LAB-16（🏁🏗️🔬📚🗼📡） | §12.7.1 | §3.2 | adaptation §2.2 | —（六导航本体在 §2） | ✅ 对齐；tech.md「16 个内容区」为对 Bruno 站的事实描述与 UX「14 分区」不一致（m-5） |
| **三阶段 A/B/C + 止损点 + 数据阀门** | §7.4 | §12.7、§13 | §4.2、§5、§9 | adaptation §5 | — | ✅ 全对齐 |
| **物理选型**（手写运动学优先，Rapier 备选） | §7.4 Phase A 验证点 | §6 选型表 | §7.2 Step 5 | adaptation §5、source-teardown §5 | — | ✅ 原则对齐；鸟瞰图 §7.1 执行细节有歧义（5 节 U-2） |
| **案例 12 模块模板与精简集** | WORK-02（模板 A）、WORK-07（1/2/6/9/**12**） | §8.1 注释（锚定 master-plan 4.1，精简集 1/2/6/9/**10**） | §5 Phase 1 行引用 | — | §4.1（模板 B）、§10（1/2/6/9/**10**） | ❌ **Critical**（C-1） |

---

## 3. 矛盾清单

### 3.1 Critical（1 条）

**C-1｜案例「12 模块」是两套模板，精简集编号互相矛盾——MVP 内容施工的单一事实源缺失**

- **master-plan §4.1 说**：12 模块 = ①背景与语境 ②问题定义 ③约束条件 ④我的角色 ⑤备选方案与取舍 ⑥解决方案 ⑦关键决策点 ⑧落地过程 ⑨结果与量化 ⑩**证据** ⑪复盘与迁移 ⑫**相关链接**；§10 MVP 表：B/C 精简版 = 模块 **1/2/6/9/10**。
- **PRD WORK-02 说**：12 模块 = ①一句话摘要 ②背景 ③约束 ④角色 ⑤核心判断 ⑥方案路径 ⑦关键产物 ⑧**结果** ⑨**取舍** ⑩**失败复盘** ⑪可复用方法 ⑫**信息边界**；WORK-07：B/C 精简版 = 模块 **1/2/6/9/12**。
- **SRD §8.1 说**：work schema 的 `modules` 字段注释「12 模块编号（master-plan 4.1）……精简版最小集 = [1,2,6,9,10]」——锚定 master-plan 编号。
- **PRD 内部还自相矛盾**：§4 旅程 2 表格写「模块 12 相关链接」（这是 master-plan 编号，PRD 自己的模块 12 是「信息边界」）。
- **后果**：两套编号下「精简版五模块」语义完全不同——master-plan 口径是「背景/问题/方案/结果/证据」（自洽的最小案例）；PRD 口径 1/2/6/9/12 = 「摘要/背景/方案路径/取舍/信息边界」，**不含结果模块**，作为对外案例不成立。schema 校验、CI 一致性检查、三篇 MVP 案例的写作全部悬空。
- **建议裁决**：以 master-plan §4.1 为 canonical（SRD schema 已锚定，其模块⑩「证据」与证据等级体系、⑫「相关链接」与互链规则互相支撑）；将 PRD 版本中的真增量（「一句话摘要」→ 与 WORK-04 30 秒结论区合并说明；「信息边界」→ 并入 GOV-05 作为发布件而非模块）合并进 master-plan §4.1 做一次修订，然后 **PRD WORK-02 改为引用编号、不再复制清单**；WORK-07 与 §4 旅程表编号随裁决更正。任选一方为准都可以，但必须单源。

### 3.2 Major（11 条）

**M-1｜RSS 范围与内容口径**
- PRD GLB-03 说：全站 RSS「work/insights/ai-lab 三 collection 合流」，验收「条目含**全文摘要**与 canonical 链接」。
- SRD §5.6 / §9.4 说：「合并 insights + ai-lab（**work 更新低频，不进 RSS**）」；「`<description>` 用 frontmatter description；**全文不入 feed**（引流回站）」。
- 建议裁决：SRD 口径更合理（work 每季度 1 篇，进 feed 价值低；全文不入 feed 与引流策略一致）。修 PRD GLB-03 的范围与验收措辞（「全文摘要」改「frontmatter description」）。

**M-2｜insights `thesis` 必填性**
- PRD INS-03 说：「每篇文章 frontmatter **强制** `thesis`……schema 校验缺失即构建失败」（P0 / MVP）；§7.3 发布门槛表同样要求每篇有 thesis。
- SRD §8.1 说：`thesis: z.string().max(60).optional()`，仅 `featured=true` 时由 superRefine 强制。
- 建议裁决：INS-03 是 P0 验收项且 thesis 驱动索引页展示（INS-01「每篇显示一句话结论」），**改 SRD schema 为必填**；若工程侧认为过严，须同步降级 INS-03 与 INS-01 的验收口径——二选一，不能各说各话。

**M-3｜Phase A Spike「资产 ≤3MB」存在三种互斥算法**
- adaptation §5 说：「资产 ≤ 3MB（**复用现有 CarConcept 3.5MB 的 Draco 重压缩版，目标 ≤2MB**）」——3MB **含**车模，且要求 Spike 期内重压缩。
- 鸟瞰图 §7.2 Step 6 说：「Spike **直接复用现有产物**；Draco 重压缩减面 LOD（目标 ≤2MB）**允许放到 Phase B 再做**」——按 adaptation 的记账法，3.5MB 车模第一天就击穿 3MB 门禁。
- 鸟瞰图 §7.3 Step 9 说：门禁读数命令是 `du -sh public/world/`——而车模位于 `public/models/car-concept/`，**按此命令车模根本不计入**，门禁形同虚设。
- PRD §7.4 / SRD §13 Phase 2 只写「资产 ≤ 3MB」，未定义计什么。
- 建议裁决：明确写死一种，推荐「**Spike 新增资产（`public/world/`）≤ 1MB + 复用 CarConcept 3.5MB 显式豁免但记录在案**」（与 Step 6 的「重压缩推迟到 Phase B」自洽）；同步修 adaptation §5、PRD §7.4、SRD §13 Phase 2 门禁行、鸟瞰图 §5/§7.3。

**M-4｜morph 触发方式：全自动 vs 手动按键**
- PRD LAB-17 说：「变形发生在『巡航 ↔ 驻点交互』模式切换点……**触发全自动（不给用户加操作负担）**」（验收项）。
- source-teardown §10.2 说：事件链起点是「inputs 'morph' 动作（**绑 Keyboard.KeyT / Gamepad.triangle**）」。
- 建议裁决：PRD 规范性优先（自动触发）；source-teardown §10.2 加注「KeyT 绑定仅作调试入口，正式触发接 POI 驻点判定后自动 `transformSystem.request()`」。Phase C 才施工，但 RR-03 同时引用两处为依据，需在引用源头消歧。

**M-5｜folio-2019 体积证据错误（可行性论证引用了错误数字）**
- UX teardown §10.4-E 说：「首包 < 5MB（**Bruno 2019 全站 2.8MB** 证明可行）」。
- source-teardown §1.2 / §8.3 说：folio-2019 **`static/` 实测 18MB**（sounds 7.3 + models 5.6 + draco 3.6 + social 1.1）。
- 建议裁决：source-teardown 为准（有 `du` 实测）；UX 该行改为引 source-teardown §8.2 的正确论据（「去掉母带/encoder/原始 png 后实际网络负载 <15MB」）。作为预算可行性的证据链，引用错误数字比没有证据更糟。

**M-6｜world 资产总量：8MB 旧口径未标记废弃，解码器记账规则缺失**
- source-teardown §8.3 说：「本站 `/world/` V1 预算建议：模型 ≤5MB + 音效 ≤2MB + **解码器 4MB（已有）≈ 首入 ≤8MB**」。
- SRD §12.7.2 / NFR-P6 说：「资产首包 **≤ 5MB**（出发广场 + 主直道）」，且预算表**未说明 draco/basis 解码器（现有约 3.6MB 目录）是否计入首包**。
- 建议裁决：SRD 规范性优先；source-teardown §8.3 加注「本建议已被 SRD §12.7.2 更严口径取代」；SRD §12.7.2 补一行解码器记账规则（建议：解码器为全站共享基建、不计入 world 首包，但计入 `public/` 40MB 总账——现状事实上已如此）。

**M-7｜KPI 度量权威分裂 + 两个阀门指标不可测**
- SRD §2.2 说：「度量（第 12 章）……均以 master-plan 为准」；PRD §10 却自建 7 指标体系且未给出与 master-plan 第 12 章的映射。
- PRD §10.3 / 鸟瞰图 §10.2 说：「进入后 30 秒退出率 < 50%（警戒线）」，埋点栏写「**会话时长分布**」——GoatCounter 无 Cookie、无会话概念，**此数取不出来**；阀门「30 秒退出率 >50% 触发专项复盘」因此空转。
- 鸟瞰图 §10.2 说：「Start here 点击率 = `world-enter` ÷ 首页 PV」——HOME-10 规定首页按钮纯 `<a>`+CSS 零 JS，**首页点击本身无法埋点**；`world-enter` 在壳页确认进入后才触发，分子还混入了从 Lab 索引卡进入的流量，测的实际是「world 进入率」而非 Start here 点击率。
- 建议裁决：① world 内部 JS 自行计时，30 秒内触发退出时上报专用事件（如 `world-exit-under-30s`）——不违反首页零 JS 约束，写入 SRD §9.5 与 PRD §10.3；② 指标改名「world 进入率」，或壳页按 `?from=home|lab` 归因；③ PRD §10 开头加一段与 master-plan 第 12 章的映射声明（或修订 master-plan 第 12 章，见 8 节）。

**M-8｜Lighthouse 门禁生效时点：PR 阻断 vs 合并线阻断**
- SRD AP-4 说：「C-2/C-3 是合并门禁：**任何 PR 使其不达标即阻断合并**」。
- SRD §11.2 / 鸟瞰图 D3 说：「PR **报告** + main 合并线四项 ≥ 95 **阻断**」——即 PR 可以带着不达标分数合入，问题推迟到合并线才爆。
- 建议裁决：统一为 PR 级阻断（与 AP-4 字面一致、故障定位成本更低）；若 Lighthouse CI 在 PR 环境波动大是顾虑，就修 AP-4 措辞为「合并线阻断」并注明理由——两处必须一致。

**M-9｜B0（master-plan 豁免修订）优先级标注冲突**
- 鸟瞰图 §4.2 / RR-07 说：B0「**Phase 1 期间完成**，不拖到 Phase 2 动工时」；且「B0 未合并则 A5 Hero 实时化与 B1 一并锁死」（关键路径阻塞项）。
- `docs/spec/README.md` 下一步表说：该项列为 **P2**（排在 World Spike 之后）。
- 建议裁决：README 提级为 P1 并注明「Phase 1 内完成（鸟瞰图 B0 / RR-07）」。文档优先级标注误导排期，成本极低收益极高的修订。

**M-10｜master-plan §2.3 URL 结构缺失 v1.1 路由，而 SRD 声称遵循它**
- master-plan §2.3 说：URL 结构只含 `/`、`/work/`、`/insights/`、`/ai-lab/`、`/about/`、`/now/`、`/contact/`、`/rss.xml`、`/sitemap.xml`——**无 `/lab/{slug}`、`/world/`、`/en/`、`/404`**。
- PRD §5.2（v1.1 已加 `/world/`）、SRD（多处）、鸟瞰图 §3.2（含 `/en/` 三页与 `/404`）说：这些路由都存在；且 adaptation §10.3 的 master-plan 修订计划（M1）只覆盖第 6 章动效豁免，未列 §2.3。
- 建议裁决：B0 修订 PR 一并补 §2.3（见 8 节「一揽子修订」）。

**M-11｜PRD V1 的三个新 Lab 在 SRD 阶段路线中无落位**
- PRD §9.2 说：V1（上线后 90 天）主线含「**三个新 Lab**：LAB-08 端云分层可视化器、LAB-09 Prompt 对比台、LAB-10 多语种 QA 检查器」。
- SRD §13 说：Phase 3（内容饱和）交付物**无任何新 Lab 模块**；新 Lab（且只点名「端云架构可视化 / 多模态原型」，无 LAB-09/10 对应物）出现在 Phase 4「可选增强池（非承诺）」。
- 后果：PRD 把三个新 Lab 当 V1 承诺，SRD 把它们当 Phase 4 可选项——MVP/V1/V2 与 Phase 0–4 两条时间轴**全文档无对齐表**，这是系统性缺口。
- 建议裁决：SRD §13 增加「PRD 里程碑 ↔ SRD Phase」映射行；三个新 Lab 或落位 Phase 3、或 PRD §9.2 显式降级为「按数据评审」——二选一。

### 3.3 Minor（10 条）

| # | 矛盾 | 出处对照 | 建议 |
|---|------|---------|------|
| m-1 | 统计上报环境：SRD §5.5 说「`localhost`/预览环境**不上报**」；§9.5 说「`localhost` 与 `*.github.io` **之外**的预览域不上报」（字面意为 localhost 上报） | SRD §5.5 vs §9.5 | 统一为 §5.5 口径，改 §9.5 措辞 |
| m-2 | world 深链参数：source-teardown §11 用 `?spawn=`；PRD §5.2 / SRD §12.7.1 / 鸟瞰图 §10 用 `?poi=` | source-teardown §11 vs 规范三件套 | 统一 `?poi=`，source-teardown 加注 |
| m-3 | Bruno folio-2025 工期：UX §9「14 个月（2024-10 → 2025-12-09）」、index、鸟瞰图 RR-01 说 **14 个月**；PRD §7.4/附录 B、SRD R8、adaptation §5 说「全职**约一年**」 | UX §9 vs PRD/SRD/adaptation | 统一「约 14 个月」（有明确起止日期佐证），作为工期校准锚点的数字不宜有两个版本 |
| m-4 | 参考仓库位置：tech.md 序言与 §9 说 clone 至 `/tmp/folio-2025`；source-teardown §1.1、index、鸟瞰图 §7.0 说在 `vendor/`（已核实 `vendor/` 存在） | tech.md vs 其余三篇 | tech.md 加勘误注（/tmp 为初次调研位置，现行以 vendor/ 为准） |
| m-5 | Bruno 站分区数：tech.md §2 说「Areas/ **16 个内容区**」；UX §4.1、鸟瞰图 §3.2 说「**14 分区**」（source-teardown §2.9 列 16 个文件，其中 `Areas.js`/`Area.js` 为基建） | tech.md vs UX/鸟瞰图 | 统一「14 个内容分区（Areas/ 目录 16 文件含 2 个基建件）」 |
| m-6 | World 构建步数：tech.md §2 说 World.js「**两步构建**（step 0/step 1）」；source-teardown §4 说三步（step 2 为 Whispers 延迟构建） | tech.md vs source-teardown §4 | 以 source-teardown（逐行核对产物）为准，tech.md 勘误 |
| m-7 | 车模瘦身目标：adaptation §5 说 Draco 重压缩「目标 ≤**2MB**」；SRD §12.7 / 鸟瞰图 §8 说减面 LOD 副本「目标 ≤**1.5MB**」——两个不同产物（重压缩版 vs LOD 版）但术语未区分，易误读为同一目标的两个数 | adaptation §5 vs SRD §12.7/鸟瞰图 §8 | 统一术语并各自标注适用阶段（Spike 重压缩版 / Phase B LOD 版） |
| m-8 | Work 更新频率：master-plan §2.2 说「1–2 个月」；master-plan §11.3 与 PRD §8 说「每季度」 | master-plan 内部 + PRD | master-plan §2.2 改「每季度」 |
| m-9 | 英文页范围：master-plan §8.1 说「About/**Work 摘要**提供英文版」；PRD ABT-06 / SRD §5.3 说 V1 =「**首页/About/Contact** 三页」，Work 英文摘要推 V2（WORK-10） | master-plan §8.1 vs PRD/SRD | B0 一揽子修订时更新 §8.1 |
| m-10 | world 模块 manifest 示例 `status:"wip"`（Phase B 转 live）与 SRD §12.3 CI 一致性检查「内容 frontmatter `demo` 字段须指向 `status: live` 模块」之间，过渡期内容能否引用 world 未写明 | SRD §12.7.1 vs §12.3 | §12.3 补一句过渡规则（wip 模块禁止被 demo 字段引用即可） |

---

## 4. 遗漏清单（应有而未写）

| # | 遗漏项 | 说明与建议落点 |
|---|--------|---------------|
| O-1 | **测试策略章** | SRD §11 只有 schema/断链/预算/Lighthouse 四类构建期门禁。无单元测试约定（哪些模块必须有测试，如 audit-budget/check-links 脚本本身）、无 E2E 冒烟（哪怕 3 条：首页可达/Demo 挂载/暗色切换）、无视觉回归策略、无 a11y 自动化（axe/pa11y 进 CI 与「无障碍基线」验收挂钩）。建议 SRD §11 增设「测试策略」小节 |
| O-2 | **i18n 语言切换 UI** | PRD ABT-06 验收要求「语言切换入口清晰」，但 SRD 组件清单与 homepage-redesign-spec 的 SiteHeader 组件均无语言切换件的定义（位置/形态/仅英文页可见还是全站可见） |
| O-3 | **world 404 与深链容错** | `?poi=` 无效值行为未定义（忽略/落出生点/提示？）；`/world/` 正式路由在 Phase B 之前访问的行为（404？重定向 `/lab/`？）未定义；`/world-spike/` 与 `/world/` 的关系与退役策略未写 |
| O-4 | **Analytics 事件缺口** | PRD §10 指标 4「Demo 参与度：交互触发率（播放/换色等首次交互）≥ 40%」在 SRD §9.5 事件表中**无对应事件**（只有 `lab-mount`/`lab-backend`，测的是挂载不是交互）；30 秒退出率无事件（M-7）；指标 6「RSS 订阅数」在纯静态托管下无法统计（无服务端日志），PRD GLB-07「全部 KPI 可从统计后台取数」验收因此不可满足（指标 5/6/7 分别依赖 Search Console、反链监测、下载周报——都不是「统计后台」） |
| O-5 | **Now 45 天自动降级缺少定时构建** | PRD HOME-06/风险 5 的「逾期 45 天首页自动降级」是构建期日期比较；SRD §11 的构建触发只有 push。**若 45 天没有内容更新（恰是需要降级的场景），就没有构建，降级永不触发**。需在 `deploy.yml` 加 `schedule` 触发（如每周一次）并写入 SRD §11.1 |
| O-6 | **「中端安卓」基准机型未定义** | Spike 止损判据（<24fps）、NFR 帧率线（30fps）反复引用「中端安卓」，但全文档无机型/年份/SoC 档位定义（如「2023–2024 年 Snapdragon 7 系 / Dimensity 8000 档」）。止损判据必须可复现 |
| O-7 | **【待填】扫描器未列入 CI 清单** | WORK-02 验收「『待填』项未清零的案例构建时阻断」，但 SRD §11.2 门禁清单无对应脚本（check-links/audit-budget 均不管这个）。需明确由 schema（`modules` 完整性）还是正文扫描（`rg "【待填】"`）承载 |
| O-8 | **Blender 美术工作量未入产能假设** | 鸟瞰图 §8 把世界美术资产指派给王磊（Blender 决策/低模），但 PRD §12 的内容产能假设（每周 6–10 小时全部给内容写作）未预留美术工时——Phase B 的实际瓶颈会因此被低估 |
| O-9 | **UX 90 秒红线未落入验收** | UX §10.4-D「Start here 点击到看到第一个真实作品 ≤ 90 秒」是有价值的信息效率红线，但 PRD §7.4 Phase B 验收与 SRD §12.7 均未承接（现有「加载→可驾驶 ≤8s」「出生点 15 秒车程达旗舰 A 馆」只覆盖其中两段） |
| O-10 | **PRD/SRD 风险表滞后于鸟瞰图** | RR-03（morph 成本）、RR-04（移动帧率）、RR-08（资产失控）、RR-09（美术风格）在 PRD §13 与 SRD §14.1 均无登记（鸟瞰图「来源」列只能引功能条目或 research）。规范文档的风险表应回登（见 6 节） |

---

## 5. 不可执行项（模糊到无法开工/无法验收）

| # | 条目 | 问题 | 出处 |
|---|------|------|------|
| U-1 | Spike 资产门禁 | 三种算法并存（M-3），Gate 读数无法执行 | PRD §7.4 / SRD §13 / adaptation §5 / 鸟瞰图 §7.2–7.3 |
| U-2 | Spike 物理件移植时点 | 鸟瞰图 §7.1 Step 3 把 `Physics.ts`+`PhysicsVehicle.ts`（Rapier 专用）列为第一天移植项 8–9 并配「当日验证点」，§7.2 Step 5 又要求「先手写 ~300 行运动学控制器、半日评估、不达标才切 Rapier」——第一天到底移植不移植？需在 Step 3 注明「item 8–9 仅在 Step 5 判负后执行」（Step 1 预装 Rapier 依赖无妨，移植源码则前置消耗时间盒） | 鸟瞰图 §7.1 vs §7.2 |
| U-3 | 「会话时长分布」 | 30 秒退出率的埋点方案在所选工具（GoatCounter）上不存在实现路径（M-7） | 鸟瞰图 §10.2 / PRD §10.3 |
| U-4 | 流式豁免无机器承载 | SRD §12.6 tts 资产 3.4MB 超 S 级 ≤1MB 上限，靠表格星号「流式豁免，单次拉取 ≤60KB」说明——但 §8.2 `labModuleSchema` 无豁免字段，audit-budget.mjs 的实现者按预算表写断言会把 tts 判为超标。需给 schema 加 `budget.streaming: true`（或等价字段）并写明豁免判定规则 | SRD §12.6 vs §8.2 |
| U-5 | GLB-07 KPI 验收 | 「全部 KPI 可从统计后台取数」与指标 5/6/7 的实际数据源矛盾，验收无法执行（O-4） | PRD §10 / GLB-07 |
| U-6 | 「中端安卓」止损判据 | 无基准机型定义，<24fps 止损不可复现（O-6） | 鸟瞰图 §7.3 / PRD §7.4 |
| U-7 | Now 自动降级 | 无定时构建则规则不可执行（O-5） | PRD HOME-06 / SRD §11.1 |

---

## 6. 风险覆盖度（鸟瞰图 Top 10 vs PRD §13 / SRD §14.1）

**正向核对（鸟瞰图 → 规范文档）**：

| 鸟瞰图 | 主题 | PRD §13 | SRD §14.1 | 判定 |
|--------|------|---------|-----------|------|
| RR-01 工期黑洞 | world | — | R8 ✅ | 对齐 |
| RR-02 内容空洞 | 内容 | 风险 1 ✅ | — | 对齐 |
| RR-03 morph 成本 | world | ❌（仅 LAB-17 功能条目） | ❌ | **规范风险表未登记** |
| RR-04 移动端帧率 | world | ❌（仅 §7.4 止损点） | ❌ | **未登记** |
| RR-05 保密泄露 | 治理 | 风险 3 ✅ | R3 ✅ | 对齐 |
| RR-06 WebGPU 碎片化 | 技术 | — | R1 ✅ | 对齐 |
| RR-07 master-plan 张力 | 文档 | — | R4/§14.4 ✅ | 对齐 |
| RR-08 资产体积失控 | 资产 | ❌ | ❌（仅 source-teardown §8） | **未登记** |
| RR-09 美术风格张力 | 美术 | ❌ | ❌（仅 adaptation §8.2） | **未登记** |
| RR-10 世界信息动线失效 | 数据 | §10.3 阀门 ✅（非风险表） | — | 可接受（阀门即缓解） |

**反向核对（规范文档 → 鸟瞰图 Top 10 之外）**：PRD 风险 2（过度炫技）、4（定位模糊）、5（更新断档）、6（证据虚标）、7（托管单点）与 SRD R2（中文字体）、R5（base 迁移）、R6（公交因子）、R7（eSpeak 音质）未入 Top 10——鸟瞰图定位为实施登记簿，此取舍**基本合理**；唯 PRD 风险 5（更新断档）与 O-5（Now 降级机制失效）联动，其缓解措施实际不成立，建议在修 O-5 时于 RR-02 或新增行中注明。

**结论**：world 核心风险双向覆盖良好；4 条鸟瞰图新增风险（RR-03/04/08/09）需回登 PRD §13 / SRD §14.1，否则「规范性裁决以原文为准」（鸟瞰图 §9 自注）无原文可依。

---

## 7. 数值/预算交叉验证

| 预算项 | 各文档取值 | 自洽性判定 |
|--------|-----------|-----------|
| 首页首屏 < 200KB gzip | PRD C-3 = SRD NFR-P2（细分 35+40+15+30KB，常态 ≤120KB）= 鸟瞰图 audit 命令（<200KB）= README | ✅ 自洽（细分项合计 120KB < 200KB，为放宽项留余量的设计成立） |
| world 首屏可玩 JS ≤ 500KB / 全量 ≤ 900KB / Spike ≤ 400KB | SRD §12.7.2 = PRD §7.4 = 鸟瞰图 §5/§10.3 = adaptation §7.2 = README | ✅ 全对齐 |
| world 资产首包 ≤ 5MB / 流式 ≤ 12MB | SRD §12.7.2 = PRD（经 §7.4 引用）= 鸟瞰图 = adaptation §7.2 | ✅ 规范层对齐；⚠️ source-teardown §8.3 残留「首入 ≤8MB」旧口径（M-6）；⚠️ 解码器（~3.6MB 已有）是否计入首包未定义（M-6） |
| Spike 资产 ≤ 3MB | 数字一致，**算法分裂** | ❌ 见 M-3 |
| `public/` ≤ 40MB | SRD §12.6（v1.1 由 25MB 上调）= 鸟瞰图 D4；「现状约 8.8MB」与实测 `du -sh public/` = **8.7MB** 相符 | ✅ 总账成立：8.7（现状）+ 5（world 首包）+ 12（流式）+ 2（音效）+ 1（机器人）+ 1.5（天空上限）≈ 30.2MB，余量约 10MB；⚠️ §12.6 注释「为 world 预留 12MB + 余量」低估了 world 全量约 17–21.5MB 的实际需求，措辞宜改「预留约 20MB」 |
| 车模 3.5MB | SRD AP-4 / §5.4 / 鸟瞰图 §7.2（`du` 实测注释）一致 | ✅；⚠️ 瘦身目标 2MB（重压缩）与 1.5MB（LOD）两个数并存（m-7） |
| Lab 预算级 S ≤50KB JS/≤1MB 资产；M ≤300KB/≤6MB | SRD §8.2/§12.6 与实测（tts 8KB/3.4MB*；car 256KB/5MB）对照 | ✅ M 级达标；⚠️ tts 资产 3.4MB 靠脚注豁免、schema 无承载（U-4） |
| 循环动画配额：首页 ≤2 / 世界 ≤5（分账） | SRD NFR-P5 = §12.6 = 鸟瞰图 §10.3 = PRD §7.4 Phase C 验收 | ✅ 全对齐 |
| 加载→可驾驶 ≤ 8s @Fast 4G | SRD §12.7.2 = PRD §7.4 Phase B = 鸟瞰图 §5 = adaptation §7.2 | ✅ 全对齐 |
| folio 体积事实（129.7MB wav 母带 / <15MB 实际负载 / 2019 static 18MB） | source-teardown §8 为源，鸟瞰图 §8.4 复述一致 | ✅；❌ UX §10.4-E 的「2019 全站 2.8MB」与 18MB 矛盾（M-5） |

**总体判定**：预算体系设计自洽（分账、总账、豁免均有意识），失分点集中在 Spike 3MB 的算法分裂（M-3）、豁免规则未机器化（U-4）与两处 research 旧数字未勘误（M-5/M-6）。

---

## 8. master-plan 张力未消解项状态

| 张力项 | 登记处 | 当前状态 | 审计意见 |
|--------|--------|---------|---------|
| **M1 / R4 / RR-07 / B0**：第 6 章「动效仅 hover 与渐入」vs Hero 实时化 + 循环动画配额 + world 沉浸展项 | SRD §14.4、adaptation §10.3 M1、鸟瞰图 B0/RR-07 | **未消解**（已核实 master-plan 第 6 章无豁免文本）；阻断规则明确（未合并则 A5 Hero 实时化与全部 world 代码不得合并；poster 舞台不受影响） | 登记完备、路径清晰，唯 README 把 B0 标为 P2 与「Phase 1 期间完成」的要求冲突（M-9）。**这是进入 Phase A 的文档侧硬前置** |
| **§2.3 URL 结构缺 `/lab/` `/world/` `/en/` `/404`** | **未在任何张力登记表中**（本审计新增发现） | 未消解；SRD §2.2 声称信息架构以 master-plan 为准，形成引用悖论 | 并入 B0 修订（M-10） |
| **§4.1 十二模块表 vs PRD WORK-02** | 未登记（本审计新增） | 未消解，Critical 级 | 见 C-1，B0 修订一并裁决 |
| **§8.1 英文范围 vs PRD ABT-06/WORK-10** | 未登记（本审计新增） | 未消解，Minor 级 | 并入 B0（m-9） |
| **第 12 章度量 vs PRD §10 七指标** | 未登记（本审计新增） | 未消解，与 M-7 联动 | 并入 B0 或 PRD §10 加映射 |
| **§2.2 vs §11.3 Work 更新频率** | 未登记 | master-plan 内部小矛盾 | 并入 B0（m-8） |

**结论**：adaptation §10.3 把 master-plan 待修项只归纳为 M1 一条，**低估了总纲的滞后面**。建议把 B0 从「第 6 章三豁免」扩容为「master-plan 一揽子对齐 PR」（第 6 章豁免 + §2.3 + §4.1 + §8.1 + §2.2 + 第 12 章映射，一次评审合并），仍在 Phase 1 期间完成——避免总纲反复开修订。

---

## 9. 修订行动清单

### P0（进入 Phase A Spike 前必须完成；P0-1/3/4 实际阻塞更早的 Phase 1 内容与基建施工）

| # | 行动 | 改哪个文件哪一节 |
|---|------|-----------------|
| P0-1 | 裁决 12 模块 canonical 模板与精简集编号（建议以 master-plan §4.1 为准并吸收 PRD 增量） | `master-plan.md` §4.1（吸收「一句话摘要/信息边界」的处置说明）；`PRD.md` WORK-02/WORK-07 改为引用编号、§4 旅程 2 表更正；`SRD.md` §8.1 注释随裁决确认 |
| P0-2 | 统一 Spike 资产 3MB 门禁算法（建议：`public/world/` 新增 ≤1MB + CarConcept 复用显式豁免） | `PRD.md` §7.4 Phase A 行；`SRD.md` §13 Phase 2 门禁；`implementation-roadmap-birdseye.md` §5 Phase 2 行、§7.2 Step 6、§7.3 Step 9 命令注释；`bruno-simon-teardown-adaptation.md` §5 预算门禁行 |
| P0-3 | 裁决 insights `thesis` 必填性（建议 schema 改必填） | `SRD.md` §8.1 insights schema（去 `.optional()` 或改 PRD） vs `PRD.md` INS-03 |
| P0-4 | 裁决 RSS 范围与摘要口径（建议 SRD 口径） | `PRD.md` GLB-03；核对 `SRD.md` §5.6/§9.4 保持现状 |
| P0-5 | B0 扩容为 master-plan 一揽子修订并提级 | `master-plan.md` 第 6 章豁免 + §2.3 + §4.1（随 P0-1）+ §8.1 + §2.2 + 第 12 章映射；`docs/spec/README.md` 下一步表 B0 由 P2 → P1；`bruno-simon-teardown-adaptation.md` §10.3 M1 范围更新 |

### P1（Phase A 期间可并行，Phase B 开工前必须完成）

| # | 行动 | 改哪个文件哪一节 |
|---|------|-----------------|
| P1-1 | KPI 可测性修订：`world-exit-under-30s` 事件（或等价方案）、「Start here 点击率」改名/归因、GLB-07 验收改写、指标 6 RSS 订阅数删除或改口径、指标 4 增加「首次交互」事件 | `SRD.md` §9.5 事件表；`PRD.md` §10.2/§10.3、GLB-03/GLB-07；`implementation-roadmap-birdseye.md` §10.2 |
| P1-2 | morph 触发对齐（PRD 自动触发为准，KeyT 降级为调试入口） | `bruno-simon-folio-source-teardown.md` §10.2 事件链加注 |
| P1-3 | 增加 PRD 里程碑（MVP/V1/V2）↔ SRD Phase 0–4 映射表，落位三个新 Lab | `SRD.md` §13（新增映射行）；必要时 `PRD.md` §9.2 措辞 |
| P1-4 | Lighthouse 门禁时点统一（建议 PR 级阻断） | `SRD.md` AP-4 或 §11.2；`implementation-roadmap-birdseye.md` D3 行 |
| P1-5 | Now 45 天降级加定时构建 | `SRD.md` §11.1（`schedule` 触发说明）；`PRD.md` §13 风险 5 缓解措辞 |
| P1-6 | folio-2019「2.8MB」证据勘误 | `bruno-simon-teardown-ux.md` §10.4-E |
| P1-7 | source-teardown 8MB 旧口径加「已被取代」注；SRD 补解码器记账规则 | `bruno-simon-folio-source-teardown.md` §8.3；`SRD.md` §12.7.2 预算表 |
| P1-8 | Spike 物理件移植时点消歧（item 8–9 仅在手写控制器判负后执行） | `implementation-roadmap-birdseye.md` §7.1 Step 3 表注 |
| P1-9 | 定义「中端安卓」基准机型档位 | `SRD.md` §10（NFR-P 组）或 `implementation-roadmap-birdseye.md` §7.3 |
| P1-10 | manifest 增加流式豁免字段并写明判定规则 | `SRD.md` §8.2 `labModuleSchema` + §12.6 表注 |
| P1-11 | 【待填】扫描器写入 CI 门禁清单 | `SRD.md` §11.2 |

### P2（Phase B 开工前 / 内容饱和期完成）

| # | 行动 | 改哪个文件哪一节 |
|---|------|-----------------|
| P2-1 | Minor 口径统一批处理：工期「约 14 个月」、`?poi=`、localhost 上报、14/16 分区、`/tmp` vs `vendor/`、两步/三步构建、重压缩/LOD 术语 | `bruno-simon-teardown-ux.md` §9；`bruno-simon-teardown-tech.md` 序言/§2/§9；`bruno-simon-folio-source-teardown.md` §11;`SRD.md` §9.5、R8；`PRD.md` §7.4/附录 B；`bruno-simon-teardown-adaptation.md` §5 |
| P2-2 | homepage-redesign-spec 同步注记（Start here 第三 CTA、Content Collections 已提前至 Phase 1、语言切换入口） | `homepage-redesign-spec.md` 区块 1 与 §7；联动 O-2 定义切换件 |
| P2-3 | SRD 增设测试策略小节（a11y 自动化、E2E 冒烟、视觉回归评估结论） | `SRD.md` §11 |
| P2-4 | world 404 / `?poi=` 容错 / `/world-spike/` 退役规则 | `SRD.md` §12.7.1 |
| P2-5 | RR-03/04/08/09 回登规范风险表 | `PRD.md` §13；`SRD.md` §14.1 |
| P2-6 | UX 90 秒红线落入 Phase B 验收 | `PRD.md` §7.4 Phase B 门禁行 |
| P2-7 | Blender 美术工时纳入产能假设 | `PRD.md` §12 假设表 |
| P2-8 | wip 模块与 demo 字段引用的过渡规则 | `SRD.md` §12.3 |

---

## 10. 审计结论与 Sign-off 条件

**结论：Go with conditions。**

文档体系的骨架是健康的：Hybrid 决策链完整可追溯、门禁与止损点设计是全套文档最强的部分、预算总账经交叉验证成立。发现的 1 Critical + 11 Major + 10 Minor 矛盾与 10 项遗漏中，没有一条动摇 Hybrid 路线或三阶段架构本身，全部可通过文档修订消解，无需返工既有决策。

**进入 Phase A Spike 前的 Sign-off 条件（文档侧）**：

1. **P0-1 ~ P0-5 全部完成并合并**——其中 P0-1（12 模块裁决）、P0-3（thesis）、P0-4（RSS）实际阻塞的是 Phase 1 内容与 schema 施工，应立即处理；P0-2（Spike 门禁算法）与 P0-5（B0 一揽子修订，含 master-plan 第 6 章 world 豁免）是 Spike 开工的直接前置；
2. **P1-8（物理件移植时点）与 P1-9（基准机型）建议随 P0 一并完成**——二者直接决定 72 小时时间盒的执行与止损判据的可复现性，改动成本为个位数行；
3. 计划内工程前置照旧（不属于文档缺陷，三份文档口径一致，本审计予以确认）：Track C 收编（C2）完成、D4 world 断言先于 B1 合并、B0 修订经王磊批准合并。

**Sign-off 后建议**：P1 余项在 Spike 时间盒之外并行清偿，P2 项在 Phase B 开工评审时逐条核销；本报告的矛盾编号（C-x/M-x/m-x/O-x/U-x）可直接用作修订 PR 的引用键。

---

*审计报告完。修订裁决权归文档所有者（王磊）；本报告只提供证据与建议，不替代决策。*
