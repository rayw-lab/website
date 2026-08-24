# Batch 1 四轨交付交叉审计报告（实现层）

> **审计对象**：集成分支 `cursor/bruno-implementation-plan-1d6f` @ `62740fb`（Batch 1 四轨合并点）——
> ① P0 文档 v1.1.1 批次（PRD/SRD v1.1.1、master-plan v1.1、鸟瞰图 v1.0.1、spec README）；
> ② Track D CI（`ci.yml`、`check-links.mjs`、`audit-budget.mjs`、jekyll 工作流删除）；
> ③ Track C2 Lab 子系统收编（manifest/contracts/facade + 两 Demo `mount()` 契约）；
> ④ Track A 设计基建（tokens/global、BaseLayout、五区块首页）。
> **审计基准**：PRD v1.1.1（需求权威）、SRD v1.1.1（架构权威）、实施路径鸟瞰图 v1.0.1（排期与门禁权威）、audit-report-v1.1 §9（P0 修订依据）。
> **审计角色**：独立审计员（未参与上述任何交付）。
> **审计日期**：2026-08-24
> **审计方法**：三类证据并用——(a) 全部交付物源码逐文件通读并逐条对照规格编号；(b) 在 `62740fb` 独立 worktree 实际执行 `pnpm install --frozen-lockfile`、`pnpm astro check`、`pnpm build`、`node scripts/check-links.mjs dist/`、`node scripts/audit-budget.mjs dist/` 并核对输出；(c) `pnpm preview` + 无头浏览器冒烟（首页渲染、配置器 `?gl=1` 强制 WebGL 2 挂载、dispose→再挂载、TTS `?locale=ar-SA` 深链 + RTL）。git 事实用 `git log --follow`、`git show --stat` 核实。

---

## 1. 审计摘要

| 项 | 结论 |
|----|------|
| **总体判定** | **4.5 / 5 —— Batch 1 交付质量高，规格追溯性完整，门禁真实可执行** |
| **Phase A Spike 准入** | ✅ **Go with conditions**（4 项条件见 §8；技术前置 C2 收编 + D4 断言 + Spike 门禁工具全部就绪并经实测验证） |
| **合并建议** | `62740fb` 冻结为 Batch 1 集成基线；B1 Spike 从此点开工；**合入 main 前须完成 §7 清单（含 1 项 P1 整改）** |

**每轨判定**：

| 轨 | 交付物 | 判定 | 摘要 |
|----|--------|------|------|
| P0 文档 v1.1.1 | PRD/SRD/master-plan/鸟瞰图/README 五处修订 | ✅ **Pass** | P0-1~P0-5 全部落笔且五处文本互证一致；B0 尚差王磊终审（流程门，非文本缺陷） |
| Track D CI | `ci.yml` + 两脚本 + jekyll 删除 | ✅ **Pass** | 全部门禁实测运行且阻断逻辑真实；D3 Lighthouse 为明示占位（待办）；1 项测量盲区（F-2） |
| Track C2 Lab | manifest/contracts/facade + 两模块收编 | ✅ **Pass** | 契约实现完整，URL 不变（C-5），git mv 历史保留，`?gl=1` 回退与 dispose→再挂载浏览器实测通过 |
| Track A 设计基建 | tokens/global/BaseLayout/五区块首页 | ⚠️ **Pass with issues** | 视觉系统与预算表现优秀（首页首屏实测 31.5KB gzip）；**1 项 P1：Start here 链接提前出现且指向 `/world-spike/`（F-1）** |

**总评**：四轨交付与 v1.1.1 规格的对齐质量显著高于常见实现批次——几乎每个文件头都标注规格出处（SRD 章节号 / roadmap 里程碑号），关键阈值原文转录且脚本内注明「改动须附规格出处」。两个此前审计（audit-report-v1.1）裁决的 P0 修订在代码层得到真实执行：Spike 资产门禁口径（P0-2）已编码为 `audit-budget.mjs` 的黑名单 + 40MB 配额 + 零 world 断言；流式豁免（SRD §12.6 注*）从「文档注记」升格为**可实测门禁**（声明 + 实测双条件才放行），这是超出规格要求的正向增量。发现的问题集中在边缘：1 项 P1（首页试验场链接违反 HOME-10 门控）、3 项 P2、5 项 m 级。无结构性缺陷。

---

## 2. 实测证据记录（可复现）

全部命令在 `62740fb` 的独立 worktree 内执行（Node 22 / pnpm 10.33.3）：

| # | 命令 | 结果 |
|---|------|------|
| E-1 | `pnpm install --frozen-lockfile` | ✅ 锁文件一致，1s 完成 |
| E-2 | `pnpm astro check` | ✅ 35 files：**0 errors / 0 warnings** / 2 hints |
| E-3 | `pnpm build` | ✅ 4 页（`/`、`/lab/`、`/lab/tts-cockpit/`、`/lab/car-configurator/`）+ sitemap，669ms |
| E-4 | `node scripts/check-links.mjs dist/` | ✅ 4 HTML / 39 条内部引用全部有效；manifest 一致性 2 模块 × 2 slug 核对通过；白名单放行 10 路由（逐条打印） |
| E-5 | `node scripts/audit-budget.mjs dist/` | ✅ 全部阻断级门禁通过。首页首屏 **31.5KB gzip**（HTML+CSS 10.7 / JS 0.0 / poster 20.6 / 图标 0.2），远低于 200KB 硬门禁与 120KB 常态线；零 world 字节 0 命中；`public/` 8.3MB / 40MB；黑名单 0 命中；tts 流式豁免实测成立（160 文件，最大单文件 55.2KB ≤ 60KB） |
| E-6 | `gzip -kc dist/_astro/engine.BLDxFqnT.js \| wc -c` | 262,438 bytes = **256.3KB gzip**——配置器引擎 chunk 实测与 manifest 声明 257KB 吻合，≤ M 级上限 300KB（SRD §12.6）✅ |
| E-7 | 浏览器：`/lab/car-configurator/?gl=1` | ✅ facade `data-state` 走到 `ready`，后端徽章显示 **WebGL 2**（强制回退路径可用，§9.2 保留参数） |
| E-8 | 浏览器：`unmount()` → `start()` | ✅ `idle` → 再挂载 `ready`，canvas 克隆置换后可复用（验证 `3da7915` 修复真实生效） |
| E-9 | 浏览器：`/lab/tts-cockpit/?locale=ar-SA&scene=nav` | ✅ 挂载 `ready`，深链白名单过滤生效（激活语种 ar-SA），页面存在 `dir="rtl"` 节点（RTL 镜像保持） |
| E-10 | `git log --follow src/lab/modules/car-configurator/presets.ts` | ✅ 历史追溯至 `834ea13`（初始配置器提交）——**git mv 保留历史**（roadmap C2 要求） |
| E-11 | `ls .github/workflows/` + `git show f05c69a --stat` | ✅ 仅存 `ci.yml`、`deploy.yml`；jekyll-gh-pages.yml 51 行删除（SRD 技术债 **D1 清偿**） |

浏览器冒烟唯一控制台错误为 Lab 页浏览器默认请求域根 `/favicon.ico` 404（F-7，m 级），非交付缺陷阻断项。

---

## 3. 轨道一：P0 文档 v1.1.1 —— ✅ Pass

对照 audit-report-v1.1 §9 修订记录逐项回源核对：

| P0 项 | 裁决 | 落笔核对 | 判定 |
|-------|------|---------|------|
| P0-1（12 模块单源） | master-plan §4.1 为 canonical，精简集 1/2/6/9/10 | PRD WORK-02 已改引用编号不复制清单、WORK-07 = 1/2/6/9/10、GOV-05 发布件化；master-plan §4.1 有 canonical 声明 + 增量吸收注记（30 秒结论区 / 信息边界声明不占编号） | ✅ 五处互证一致 |
| P0-2（Spike 资产门禁） | `public/world/` 新增 ≤1MB + CarConcept 3.5MB 复用显式豁免 | PRD §7.4 Phase A 行、SRD §13 Phase 2 行、鸟瞰图 §5/§6/§7.2/§7.3 四处命令注释全部统一为该口径 | ✅ 且已预埋进 audit-budget（黑名单/配额/零 world 断言） |
| P0-3（thesis 必填） | schema 改必填 | SRD §8.1 insights `thesis: z.string().max(60)`——无 `.optional()`、无 featured superRefine | ✅ |
| P0-4（RSS 口径） | SRD 口径：work 不进 RSS、description 摘要、全文不入 feed | PRD GLB-03 已按 SRD §5.6/§9.4 口径改写并注明 v1.1.1 裁决 | ✅ |
| P0-5（B0 一揽子） | master-plan 一揽子修订并提级 P1 | master-plan 头部版本注记 v1.1 列全六处修订；第 6 章动效豁免两条完整落笔（Hero 实时层 + `/world/` 沉浸展项）；§2.3 URL 补录、§4.1 canonical、§8.1 英文范围、§2.2 更新频率、§12.1 KPI 映射均在；spec README B0 由 P2 → P1 | ✅ 文本已落笔；**最终关闭以王磊终审批准为准**（与 SRD §14.4 注记一致） |

版本一致性：PRD 头表 v1.1.1 ✅、SRD 头表与文末声明均 v1.1.1（`08ef764` 补同步）✅、鸟瞰图 v1.0.1 修订记录与上游版本号引用一致 ✅、master-plan v1.1 ✅。

**残留（m-6）**：SRD §8.2「现有两模块注册示例」中 car-configurator 的 `deepLinkParams` 写 `"wheel"`（单数），而线上 URL 契约与实现自 `834ea13` 起一直是 `"wheels"`（实测 `git show 08ef764:src/scripts/car-configurator/app.ts` L404 确认）。**实现方向正确**（C-5 URL 冻结优先于文档示例），应回修 SRD 示例一字。

---

## 4. 轨道二：Track D CI —— ✅ Pass

### 4.1 交付完成度（对照 roadmap §4.4 + SRD §11.2）

| 里程碑 | 要求 | 交付 | 判定 |
|--------|------|------|------|
| D1 删 jekyll | Phase 1 首个 PR 内完成 | `f05c69a` 独立提交删除，`ci.yml` 头注说明竞态理由 | ✅ |
| D2 ci.yml 一期 | astro check + build + check-links + audit-budget，预算表进 PR 注释 | 四步全部落地；预算表写 `$GITHUB_STEP_SUMMARY`（PR 可见，等效落地）；权限最小化（`contents: read`）、独立 concurrency group 不触碰 Pages 队列、pnpm 版本由 `packageManager` 决定——与 deploy.yml 分工的约定全部写进文件头注 | ✅ |
| D3 Lighthouse CI | treosh/lighthouse-ci-action | **占位步骤**：明示「D3 待接入，本步骤无断言」——不产生虚假绿灯，处理方式诚实 | ⚠️ 待办（F-3） |
| D4 断言预埋 | 零 world 断言 + 资产黑名单 + 40MB 配额（必须先于 B1 合并） | G-D（含 `<a>` 导航豁免的正确实现——只查资源标签不查导航链接，与「Start here = 一个 `<a>`」口径精确对齐）、G-F 黑名单四类、G-E 40MB 全部就位 | ✅ **B1 审计前提已满足** |

### 4.2 脚本质量要点

- **check-links**：base 前缀检查（GitHub Pages 项目页 404 高发点）、跨页锚点 id 核对、DemoLink↔manifest 双向一致性（未注册 slug 被链接 → 阻断；live 模块无路由页 → 阻断）。**待交付路由白名单设计出色**：精确路由枚举 + 「路由交付后条目自动过期并反向阻断 CI」——白名单只能收缩、不能腐化，符合「门禁不降级」纪律（`2313738`）。
- **audit-budget**：七道门禁（G-A~G-G）全部标注规格出处；**流式豁免为实测门禁**（`62740fb`）：manifest 声明 `budget.streaming{dir,singleFetchKbMax}` 后仍须实测 `public/{dir}` 每个文件 ≤ 上限，「豁免声明本身不构成放行」——把 SRD §12.6 注* 从文档注记升格为机器裁决，方向正确。
- 黑名单正则 `/encoder/i` 不误伤 `draco_decoder.*.js`（实测确认 dist 中 decoder 文件未命中）✅。

### 4.3 发现

- **F-2（P2）｜G-G 懒加载 JS 实测存在盲区**：chunk 定位启发式为「文件名含 slug」，但两模块引擎经 `mount()` 内动态 `import('./engine')` 产出的 chunk 命名为 `engine.<hash>.js`（实测 car 引擎 256.3KB、tts 引擎 17.5KB），启发式只匹配到 0.3~0.4KB 的薄入口 chunk。当前输出「car-configurator 实测 0.3KB ✅」是**误导性读数**——若某模块实际超预算，此列不会报警（声明值对照仍有效，但声明可以写低）。脚本注释自认「收编后按 slug 命名 chunk 即自动实测」，然而收编产物并未按 slug 命名引擎 chunk。**修复建议**（三选一）：Vite `manualChunks` 按模块目录归并命名；或引擎 chunk 文件名加 slug 前缀；或脚本改为解析入口 chunk 的静态 import 图递归归属。**在修复前，Phase A Spike 的 ≤400KB 门禁读数必须用鸟瞰图 §7.3 的人工 `gzip -kc` 命令，不得引用 G-G 实测列**。
- **F-3（P2）｜D3 Lighthouse 未交付**：roadmap §5 Phase 1 D 行要求 D1+D2+**D3**；Batch 1 交付 D2+D4 预埋。占位步骤已诚实标注，但 Phase 1 收口（MVP Gate）前必须接入，且 C-2「四项 ≥95 按路由考核」在此之前只能人工跑。
- **F-5（m）｜PENDING_ROUTES 轨道归属标注失真**：`/work/`、`/insights/`、`/about/`、`/contact/` 等条目标注「Track B」，`/world-spike/` 标注「Track C」——按鸟瞰图四轨定义，前者属 **Track A**（A2/A3/A4），后者属 **Track B**（B1）。标签只影响归责提示不影响门禁逻辑，但会误导「由交付该页面的 PR 负责删除条目」的指派，建议顺手更正。

---

## 5. 轨道三：Track C2 Lab 子系统 —— ✅ Pass

### 5.1 契约实现对照（SRD §8.2 / §9.2 / §12）

| 规格 | 实现 | 判定 |
|------|------|------|
| manifest schema（§8.2） | `contracts.ts` zod 定义与 SRD 逐字段一致（含 `world` 枚举、`viewTransitionName` 放宽前缀）；增量 `budget.streaming` 为 P0-2/流式豁免的合理 schema 化 | ✅ |
| 构建期校验 | `manifest.ts`：schema 解析 + slug/code/viewTransitionName 全站唯一 + entry/poster 存在性（`import.meta.glob`，无 fs 依赖）——任何一条不满足即构建失败 | ✅ 超出 §12.3 最低要求 |
| `mount()` 契约（§9.2） | 两模块薄入口（12/13 行）+ 引擎动态 import（§12.2 第 3 步「重依赖禁止顶层静态 import」严格执行——`astro check` 与 build 产物均证实 three 只在引擎 chunk） | ✅ |
| facade 状态机 | `idle→observing→loading→ready\|error` + `data-state`/`data-blocked` 暴露；四项自动挂载检查（视口+idle / reduced-motion / pointerFine / saveData）；显式点击跳过拦截；`pause/resume`（visibilitychange + 离屏 IO）；`pagehide`（bfcache 感知）与 `astro:before-swap` 双路 dispose；错误态 poster 常驻 + `lab-error` 事件 | ✅ 与 §9.2/§12.4 逐条对应 |
| 事件契约（§9.5） | `lab-mount:{slug}`/`lab-backend:{...}`/`lab-error:{slug}` 已埋；GoatCounter 未接入前以 CustomEvent 暴露 + `goatcounter?.count` 空安全调用——A4 接入后自动生效 | ✅ 前向兼容处理得当 |
| URL 不变（C-5/G4） | `/lab/tts-cockpit`、`/lab/car-configurator` 路由保留；深链参数 `paint/wheels/livery/gl`、`locale/scene` 与收编前逐字一致（E-9 实测） | ✅ |
| git mv 保历史 | E-10 实测 `--follow` 追溯至初始提交 | ✅ |
| 分层守则 | 模块间零互 import；`presets.ts` 被页面静态消费（构建期 UI）+ 引擎运行时消费——正是 SRD 第 7 章分层守则第 6 条的在册例外模式 | ✅ |
| dispose 完整性 | 材质/纹理/几何遍历释放 + 监听器登记表统一解绑 + canvas 克隆置换（`3da7915`）；E-8 实测再挂载成功 | ✅ |
| poster 补齐（D6 债） | tts poster 7.1KB（实机截屏重生成，`32ba607`）、car poster 20.9KB，均 ≤40KB | ✅ D6 清偿 |

`/lab/` 索引页由 manifest 生成（新模块零改动接入），LabLayout 页眉（编号/状态徽章/技术角标/面包屑）全部 manifest 驱动——SRD §12.2 第 5 步「薄壳」目标达成，D3/D4 技术债（页面级千行不可复用代码、app.ts 单体）实质清偿。

### 5.2 发现

- **F-8（m）｜C1 未交付、C2 先行**：Demo 页仍未接入 BaseLayout/六导航（roadmap C1 = Phase 1 交付项：接入全站布局 + 30 秒结论区 + 跳过出口）。现状 LabLayout 自带面包屑（首页/Lab 可达）且 lede + 免责声明 + 静态说明区实质承担「无交互可读结论」职责,但严格对照 LAB-05 验收（30 秒结论区组件化 + 跳过出口）与 C1 范围仍是缺口。属**顺序偏差而非质量缺陷**（见 §6），须在 Phase 1 收口清单中补齐。
- **F-7（m）｜Lab 页 favicon 404**：LabLayout 与 `/lab/` 索引页 head 无 favicon 声明，浏览器默认请求域根 `/favicon.ico` 404（E-7 控制台唯一错误）。一行 `<link rel="icon">` 可消。
- viewer/world 模式入口显式 `throw`（拒绝而非静默错渲染）——符合 C3/C5 为后续里程碑的规划，处理方式正确，不计缺陷。

---

## 6. 轨道四：Track A 设计基建 —— ⚠️ Pass with issues

### 6.1 交付对照（homepage-redesign-spec §3/§5、PRD HOME-01~04/06、A1/A2 里程碑）

| 交付物 | 核对 | 判定 |
|--------|------|------|
| `tokens.css` | 工业橙双主题（`.dark` 与 `prefers-color-scheme` 两块取值逐字一致——头注明示并实核）；`--accent`（文本级 ≥4.5:1）与 `--accent-strong`（图形级）分离 + `--on-accent` 黑字对橙底的对比度论证；4px 间距基数、字体层级、动效时长全套 | ✅ AP-8 单一 token 源成立 |
| `global.css` | `@view-transition` 跨文档；reveal 入场为 scroll-driven CSS（0KB JS）+ `@supports (animation-timeline: view())` 守卫 + `prefers-reduced-motion: reduce` 全局关动画——三层降级的 CSS 层完整；Hero 区不用 `.reveal`（3 秒可读红线，头注明示） | ✅ |
| BaseLayout | SEO meta/canonical（`Astro.site` 绝对 URL）/OG/JSON-LD 插槽/主题防闪烁内联脚本（≤0.2KB）/字体子集预载（latin 可变字体自托管，不计预算）/skip-link | ✅ |
| SiteHeader | 六导航（品牌区 Home + 五栏目）+ `aria-current` + ThemeToggle（日/夜驾驶模式，localStorage 持久化）；backdrop-filter 唯一豁免点有 `@supports` 守卫 | ✅ GLB-01/02 基线成立 |
| SiteFooter | 性能自证行只写可核算事实（「首页传输 < 200KB · 纯静态直出 · 零第三方请求」，未写 Lighthouse 分数——D3 未接入前不虚标，符合 HOME-09「失实即撤下」精神） | ✅ 措辞纪律好 |
| 五区块首页 | Hero（poster 舞台 = LCP，`fetchpriority=high` + 显式宽高）→ 三支柱（量化锚点 + 案例链接）→ Lab bento（manifest 双卡 + `view-transition-name` 与 Demo 页打通）→ 三案例卡（问题→动作→结果 + 证据徽章 + 配套 Demo 挂钩位）→ Now/CTA；精选观点区块按 spec 空态隐藏 | ✅ 结构对齐 |
| 预算 | E-5 实测首屏 31.5KB gzip（常态线 120KB 的 26%）；首页 JS 0.0KB（theme 脚本内联计入 HTML）；零重资产、零 world 字节 | ✅ 远优于 C-3 |
| 循环动画配额 | 首页现状 0 处循环动画（≤2 配额，NFR-P5） | ✅ |

### 6.2 发现

- **F-1（P1）｜Start here 链接违反 HOME-10 门控，指向未交付的隐藏路由**：`HomeHero.astro` 已渲染「Start here · 进入试验场」`<a>`，href 指向 `${base}/world-spike/`。与规格三处冲突：
  1. **PRD HOME-10 验收标准**：「LAB-16 Phase B 未上线时按钮不出现（无 Coming soon）」——按钮应与 Phase B `/world/` 正式路由同上线，当前处于 Phase 1/Spike 前夜；
  2. **PRD §7.4 Phase A**：Spike 是「隐藏路由（noindex、**不进导航**）」——从首页 Hero 常驻入口链接隐藏路由，等于把 Spike 变成公开导航目标（爬虫沿链接可发现，noindex 只保护目标页不保护入口暴露）；
  3. 当前 `/world-spike/` 页面不存在，链接实为断链，靠 check-links 白名单条目放行——用「待交付白名单」掩护一个**按规格本不应存在**的链接,属白名单机制的错用。
  实现本身符合「纯 `<a>`+CSS 零字节」承诺（G-D 断言豁免口径正确），问题只在**出现时机与指向**。**整改（合入 main 前必做，二选一）**：删除该链接（Phase B 时再上，最符合规格）；或按用户明示决策保留为 Spike 期入口——则必须修订 PRD HOME-10 登记例外（PRD 效力约定：范围冲突先修订 PRD 再动工），并保证 `/world-spike/` 壳页先于部署存在。同时从 PENDING_ROUTES 移除该条目。
- **F-4（P2）｜首页卡片文案硬编码，暂不满足 HOME-04 单源要求**：三支柱与三案例卡文案为 `index.astro` 内数组常量（注释自标「P1 占位……P3 接真数据」）。PRD HOME-04 验收为「卡片文案与案例详情页 frontmatter 单源同步，无手工漂移」——A3（content collections）交付时**必须**切换为集合驱动，否则 Batch 2 案例页上线后即出现双源漂移风险。登记为 A3 的强制验收项。

---

## 7. 顺序偏差、门禁状态与合并建议

### 7.1 Phase 门禁状态（对照 SRD §13 / 鸟瞰图 §5）

SRD §13 规定「Phase N 验收未过不得合并 Phase N+1 成果」。Batch 1 实际把两项 **Phase 2 成果**（C2 收编、D4 断言）先于 Phase 1 完成合入了集成分支——Phase 1 的 A3（四集合 schema + 首批内容）、A4（About/Now/Contact/RSS/robots）、C1（Demo 接入全站布局）、D3（Lighthouse CI）、GoatCounter 均未交付，MVP Gate（LH 四项 ≥95 + 10 秒定位 ≥80% + 零待填）尚不可测。

**审计裁决：带条件接受**。理由：(a) 合并目标是集成分支而非 main/生产，门禁的保护对象（线上 URL、访客体验）未暴露；(b) C2 是 B1 Spike 的关键路径前置（鸟瞰图 §6 阻塞项 3），先行收编使 Spike 可与 Phase 1 内容生产并行——符合「内容生产优先级恒高于世界施工」下的并行窗口设计；(c) 先上门禁（D2/D4）再上内容,恰是「门禁上线越早、返工越少」（Track D 使命）的正确顺序。**条件**：main 合并/MVP 上线前，Phase 1 全量交付并回归，PENDING_ROUTES 清零（脚本会强制过期）。

### 7.2 合并建议

1. **`62740fb` 冻结为 Batch 1 集成基线**：四轨合并拓扑清晰（三 merge commit + 两个门禁收尾直接提交），无需回滚或重排；
2. **允许 B1 Spike 立即从此点分支开工**（世界引擎/载具工作流已在并行分支进行，与本基线兼容）;
3. **暂不合入 main**。合入 main 的前置清单：
   - F-1 整改（删除 Start here 链接，或修订 PRD 登记例外 + 交付 `/world-spike/` 壳页）——**P1，阻断项**；
   - Phase 1 剩余交付（A3/A4/C1/D3 + GoatCounter）+ MVP Gate 三项人工验收；
   - F-4 切换案例卡为 frontmatter 驱动（随 A3）；
   - B0 master-plan 修订获王磊终审批准（批准前 Hero 实时化与 world 代码合并锁死规则持续有效——Spike 在隐藏路由内且可丢弃，不受此锁）；
   - F-2 修复或在 PR 中明示 G-G 实测列不可信、附人工 gzip 读数。

---

## 8. Phase A Spike 准入裁决：✅ Go with conditions

**技术前置全部满足并经实测**（鸟瞰图 §7.0 开工前检查逐项核对）：

| 前置 | 状态 |
|------|------|
| C2 收编完成（facade/manifest/mount() 基建可复用） | ✅ 本报告 §5，E-7/E-8/E-9 实测 |
| B0 修订合并 | ✅ 文本已入 master-plan v1.1 并合并至集成分支；⚠️ 王磊终审待批 |
| D4 断言上线（B1 的审计前提） | ✅ 零 world 断言 / 黑名单 / 40MB 配额实测运行（E-5） |
| vendor 参考仓库 | ✅ `vendor/README.md` 在库（重新获取指引），vendor 本体按纪律 gitignore |

**四项 Go 条件**：

1. **B0 终审**：Spike 本身在隐藏路由内、可丢弃，不触碰 Hero 实时化锁——可以开工；但 **Spike 转正（Phase B）前 B0 必须获批**；
2. **门禁读数方法**：Spike 的 ≤400KB gzip 读数用鸟瞰图 §7.3 人工命令（`gzip -kc dist/_astro/<world-chunk>.js | wc -c`），**不得引用 audit-budget G-G 实测列**（F-2 盲区），直至该盲区修复；
3. **资产纪律**：新增资产只进 `public/world/`（≤1MB，P0-2 口径已在 CI 黑名单/配额下受保护）；CarConcept 复用豁免仅限 `public/models/car-concept/` 原位引用；
4. **壳页交付即清白名单**：`/world-spike/` 页面合入时同步删除 check-links PENDING_ROUTES 对应条目（脚本会强制），并同批处理 F-1（首页入口链接的去留须有 PRD 依据）。

**止损机制核查**：帧率止损判据（中端安卓 <24fps 三板斧无效 → 整体丢弃归档 ai-lab）、时间盒性质、决策记录五项必填在鸟瞰图 §7 完整且与 PRD §7.4/SRD R8 一致——止损路径可执行，无空转风险。

---

## 9. 发现清单汇总

| # | 级别 | 发现 | 责任落点 | 期限 |
|---|------|------|---------|------|
| F-1 | **P1** | Start here 链接提前出现且指向 `/world-spike/`，违反 PRD HOME-10 门控与 §7.4「不进导航」 | Track A（`HomeHero.astro`）+ PRD 裁决 | main 合并前 |
| F-2 | P2 | audit-budget G-G 懒加载 JS 实测列匹配不到 `engine.*.js` chunk（实测 0.3KB vs 实际 256.3KB），误导性读数 | Track D（`audit-budget.mjs` 或 Vite chunk 命名） | Spike 门禁读数前修复或明示绕行 |
| F-3 | P2 | D3 Lighthouse CI 为占位（明示无断言）——C-2 按路由考核暂靠人工 | Track D | Phase 1 收口（MVP Gate）前 |
| F-4 | P2 | 首页三支柱/案例卡文案硬编码，HOME-04 frontmatter 单源未成立（过渡态已自标注） | Track A（随 A3 切换集合驱动） | A3 交付时 |
| F-5 | m | check-links PENDING_ROUTES 轨道归属标注与鸟瞰图四轨定义不符（work/insights 等属 Track A、world-spike 属 Track B） | Track D | 顺手 |
| F-6 | m | SRD §8.2 注册示例 `deepLinkParams` 写 `"wheel"`，实现/线上契约为 `"wheels"`（实现正确，回修 SRD 示例） | 文档 | 顺手 |
| F-7 | m | LabLayout 与 `/lab/` 索引页无 favicon 声明 → 浏览器默认 `/favicon.ico` 404 | Track C | 顺手 |
| F-8 | m | C1（Demo 接入 BaseLayout/六导航 + 30 秒结论区组件）未交付，C2 先行——顺序偏差，Phase 1 收口须补 | Track C | Phase 1 收口前 |
| F-9 | 注记 | Phase 2 成果（C2/D4）先于 Phase 1 完成合入集成分支——带条件接受，见 §7.1 | 编排 | main 前回归 |

---

## 10. 审计声明

- 本报告只审 `62740fb` 及其可追溯历史；并行进行中的 world-spike 引擎/载具分支不在本次审计范围；
- 所有「实测」均可按 §2 命令在同 commit 复现；浏览器冒烟为无头 Chromium（WebGL 2 软渲染），WebGPU 路径与真机帧率不在本次范围（属 Spike 门禁人工录测项）；
- Lighthouse 四项 ≥95 与 10 秒定位测试为 MVP Gate 项，本批次页面未做——首页当前 31.5KB / 零 JS / LCP=poster 的实测形态使 LH 达标为大概率事件，但**不得以本报告替代正式读数**；
- 按鸟瞰图 §11.2 钩子 1：本报告结论回写鸟瞰图 §5 Phase Gate 状态的动作，留给编排方在 F-1 裁决后一并执行。

---

*审计人：独立审计员（Cloud Agent）。裁决依据优先级：PRD/SRD v1.1.1 > 鸟瞰图 v1.0.1 > 各 research 文档。对本报告结论有异议时，按 SRD §14.4 / 鸟瞰图 §11.1 修订触发矩阵先修订上游规格再复审。*
