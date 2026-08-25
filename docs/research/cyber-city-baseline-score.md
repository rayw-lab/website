# Cyber City Phase 0 基线分数矩阵（CC-L0-baseline）

Loop 0 基线登记单源。当前有效登记 = **§A 全链复算（五维齐套，87.2 分）**；
§B 为同轮次早前的首跑登记（四维口径 75 分，视觉维未就绪时的保守下界），留档对照不再更新。

---

## §A 全链复算登记（五维齐套 · 当前有效基线）

| 项 | 内容 |
|----|------|
| 登记者 | CC-L0-baseline（`claude-fable-5-thinking-xhigh`，第二轮全链复算） |
| 分支 | `cursor/cc-l0-baseline-score-1d6f` |
| 检验对象 | test-framework `71e7c59` ⊕ visual `a4d16aa` 合并树（= score-loop + 视觉 rubric JSON 齐套；合并冲突仅 `world-visual.spec.ts` JSON 读取方式，保留 fs 读方案） |
| 检验链 | `pnpm quality:loop:full`（build → e2e 全量五 project → LHCI 7 URL × 3 轮 → score-loop），单命令一次跑通，`LOOP_EXIT=0` |
| 计分口径 | `docs/research/cyber-city-score-loop-orchestration.md`「综合分口径」表（`scripts/score-loop.mjs` 实现） |
| 检验日期 | 2026-08-25（UTC） |
| VM 环境 | Cloud Agent VM（4 核无 GPU，SwiftShader 软渲染）· Node v22.14.0 · pnpm 10.33.3 · Playwright 1.62.1（Chromium/Chrome Headless Shell 151）· Lighthouse 12.6.1（LHCI CLI 0.15.1，formFactor=mobile）· `astro preview` @ `127.0.0.1:4321` |

### A.1 五维分数表

| 维度 | 权重 | 得分 | 加权 | 数据源 |
|------|------|------|------|--------|
| LHCI `/` 四项均值 | 25% | **97.75** | 24.44 | **CI artifact @ `71e7c59`**（见 A.3；P 100 / A11y 95 / BP 96 / SEO 100，3 轮中位） |
| LHCI `/home/` 四项均值 | 15% | **100** | 15.0 | 同上（四项全 100，3 轮零波动） |
| e2e 通过率 | 20% | **100**（52/52） | 20.0 | 本 VM 全量实跑（A.2） |
| 视觉 rubric（竞品对标） | 25% | **51** | 12.75 | `docs/research/cyber-city-visual-rubric-score.json`（CC-L0-visual 双评合议 v1.1） |
| 3D 交互冒烟（首幕+POI+ESC） | 15% | **100**（3/3 `@smoke3d`） | 15.0 | 本 VM 实跑：VIS-02 ESC / VIS-03 首幕 / VIS-04 POI 全过 |
| **综合分（五维齐套，可用权重 100%）** | 100% | — | **87.2 / 100** | `scripts/score-loop.mjs --lhci-dir <CI artifact>` |

```
COMPOSITE_SCORE=87.2
```

综合分 **≥85 门槛达成**，无需按 AL0 格式开缺口清单；剩余提分空间见 A.5。

### A.2 e2e 全量（`pnpm quality:loop:full` 内联，五 project 链）

| 项 | 数值 |
|----|------|
| passed / total | **52 / 52**（visual 分支合入后总数 48 → 52，新增 `e2e/visual/` VIS-01…04） |
| failed / skipped | 0 / 0 |
| 墙钟 | **18.4 分钟**（1105s，不含 build；build 3s） |
| 退出码 | 0 |

分项：desktop-chromium 27 · mobile-375 3 · world-chromium 17（串行，含 CITY-E2E-01…06 全过）·
world-perf-chromium 1（WS-PERF-01 软门禁 OBS 留档）· visual-chromium 4（VIS-01 壳静态基线 +
VIS-02/03/04 `@smoke3d`，单 worker 顺序执行；入库基线图 `e2e/visual/__screenshots__/` 首跑即匹配，
maxDiffPixelRatio 0.02 内零更新）。

### A.3 LHCI（双源登记：本地 collect 佐证 + CI artifact 计分）

**本地 collect（本 VM 实跑，227s，7 URL × 3 轮 = 21 run）**：accessibility / seo 全 URL 三轮
全 100；**performance 与 best-practices 全 21 run 为 null**（SwiftShader 软渲染下 Lighthouse
性能追踪不产值，`lhci assert` 报「Audit did not produce a value at all」）——测试框架文档
预告的已知 VM 限制，本地读数不可用于①②维计分。

**计分采用 CI artifact（口径声明）**：**LHCI 来源：CI artifact @ commit `71e7c59`**
（GitHub Actions run [32878074874](https://github.com/rayw-lab/website/actions/runs/32878074874)，
`cursor/cc-l0-test-framework-1d6f` 最近 green run，工件名 `lighthouse-results`，21 run 齐套）。
复算命令：`node scripts/score-loop.mjs --lhci-dir <artifact 解压目录>`。

| URL | Perf | A11y | BP | SEO | 四项均值（中位） |
|-----|------|------|----|----|------------------|
| **`/`（世界壳）** | 100 | **95** | **96** | 100 | **97.75** |
| **`/home/`（宪法首页）** | 100 | 100 | 100 | 100 | **100** |
| `/work/` | 100 | 100 | 100 | 100 | 100 |
| `/work/multilingual-cockpit/` | 100 | 100 | 100 | 100 | 100 |
| `/about/` | 100 | 100 | 100 | 100 | 100 |
| `/lab/car-configurator/` | 100* | 100 | 100 | 100 | 100 |
| `/lab/tts-cockpit/` | 100 | 100 | 100 | 100 | 100 |

\* car-configurator 单轮 Perf 99，三轮中位 100。`/` 两项扣分的具体审计项见 A.5。

### A.4 工件路径

| 工件 | 路径 | 入库状态 |
|------|------|----------|
| 综合分明细 JSON | `test-results/quality-score.json` | gitignore（运行产物）；**快照入库** `docs/spec/assets/quality-score-baseline-l0.json` |
| e2e JSON 报告 | `test-results/e2e-results.json` | gitignore |
| 本地 LHCI 产物 | `.lighthouseci/lhr-*.json`（21 run，perf/BP null） | gitignore |
| CI LHCI 工件 | Actions run 32878074874 `lighthouse-results`（保留期内可下载） | 远端 |
| 3D 取证截图 | `test-results/visual/world-robot-idle.png`、`world-poi-concept-garage.png` | gitignore（固定名跨轮覆盖） |
| 视觉基线图 | `e2e/visual/__screenshots__/world-visual.spec.ts/visual-chromium/*.png` | 已入库（test-framework 分支） |
| 全链运行日志 | quality-loop 全输出随本次 run 工件上传（`quality-loop-full.log`） | agent 工件 |

### A.5 缺口观察（综合分 ≥85，非阻断，Loop 1 提分参考）

1. **视觉 rubric 51/100（唯一 <60 的维度，权重 25%）**——综合分对视觉分敏感度
   ≈ 74.7 + 0.25×视觉分：视觉提到 62（rubric §6 Tier A 十件低成本项）综合分 ≈ 90.2。
   主欠账：黑天空、spike 锥桶滞留首幕、窗色五彩纸屑、零招牌文字零街道层（rubric v1.1 合议记录）。
2. **`/` A11y 95**：`aria-hidden-focus` 单项——世界挂载后 `.world > .stage > .hud` 处于
   `aria-hidden` 容器内但含可聚焦元素（Lighthouse 采样窗恰逢挂载完成态；本地静态壳窗采样为 100）。
   修法：HUD 容器 `aria-hidden` 时同步 `inert` 或对内部控件补 `tabindex="-1"`。
3. **`/` BP 96**：`font-size`（best-practices-ux 组，formFactor=mobile）——壳上存在 <12px
   文本（驾驶提示条/徽标小字）。修法：移动断点下小字号提至 ≥12px 或对提示条按视口降显。

### A.6 复现命令（本 VM）

```bash
pnpm install && pnpm exec playwright install chromium
pnpm quality:loop:full          # build → e2e 52 例 → LHCI 21 run → score，约 23 min
# SwiftShader VM 下 LHCI perf/BP 为 null 时，用 CI 工件复算①②维：
gh run download <green-run-id> -n lighthouse-results -D /tmp/ci-lhci
node scripts/score-loop.mjs --lhci-dir /tmp/ci-lhci   # 末行 COMPOSITE_SCORE=87.2
```

---

## §B 首跑登记（历史留档 · main@1b8d051 · 四维口径）

> 早于 §A 的同 Loop 首跑：检验对象为 `main` @ `1b8d051`（test-framework/visual 未合入），
> 视觉维未登记按保守 0 计，综合分 75/100。其静态门禁/冒烟明细仍具参考价值，原文保留如下。

| 项 | 内容 |
|----|------|
| 登记者 | CC-L0-baseline（`claude-fable-5-thinking-xhigh`） |
| 分支 | `cursor/cc-l0-baseline-score-1d6f`（纯检验，零业务代码改动） |
| 检验对象 | `main` @ `1b8d051`（工程 tip = `74947d9` Phase 0 合入；其后两笔均为 docs） |
| 计分口径 | `docs/research/cyber-city-score-loop-orchestration.md` 编排看板权重 |
| 检验日期 | 2026-08-25（UTC） |
| 环境 | Cloud Agent VM（4 核软渲染）· Node v22.14.0 · pnpm 10.33.3 · Playwright 1.62.1（Chromium + SwiftShader）· Lighthouse 12.6.1（LHCI CLI 0.15.1，formFactor=mobile）· `astro preview` @ `127.0.0.1:4321` |

### B.1 静态工程门禁（全部实跑）

| # | 检验 | 命令 | 结果 | 关键原始数字 |
|---|------|------|------|--------------|
| 1 | 类型/内容检查 | `pnpm astro check` | ✅ PASS | 118 文件：**0 errors / 0 warnings / 58 hints** |
| 2 | 生产构建 | `pnpm build` | ✅ PASS | **19 page(s) built in 1.29s**（含 `rss.xml` + sitemap） |
| 3 | 体积预算 | `node scripts/audit-budget.mjs dist/` | ✅ 全部阻断级门禁通过 | 宪法首页首屏 **33.9KB** gzip（< 200KB 硬门禁；HTML+CSS 13.1/35、JS 0.0/15、poster 20.6/40、图标 0.2/30）；`/` 壳 G-A′ **39.3KB**/90KB（HTML+CSS 5.8/35、引导 JS 1.5/15、poster 31.8/40、静态标签零重资产命中 0）；零 world 字节断言 14 受保护页命中 0；public/ 8.7MB/40MB；world JS 全量 **78.0KB**/900KB（12 chunk）；world 资产池 5.2MB/12MB；黑名单格式命中 0 |
| 4 | 链接完整性 | `node scripts/check-links.mjs dist/` | ✅ PASS | 19 页 × **345 条内部引用全部有效**；manifest 3 模块 × 2 slug 一致；12 栋在册楼 deepLink 核对通过；`deepLinkStatus=fallback` 登记 2 条（agent-nexus → `/ai-lab/`、autodrive-lab → `/work/`，转正计划须按 §12.7.3 守则① 在后续 PR 登记） |

### B.2 e2e 全量（`pnpm test:e2e`，独占端口 4321）

| 项 | 数值 |
|----|------|
| passed | **48** |
| failed | **0** |
| skipped | **0** |
| flaky/retries | 0（本地 retries=0 配置） |
| 墙钟 | **14.3 分钟**（859s，含前置 `astro build`） |
| 退出码 | 0 |

分项（playwright project）：desktop-chromium 27 · mobile-375 3 · world-chromium 17（串行独占，含 cyber-city.spec 6 例 CITY-E2E-01…06 全过）· world-perf-chromium 1（WS-PERF-01 采集留档）。

**e2e 通过率 = 48/48 = 100%。**

### B.3 LHCI（`lighthouserc.json` 全 7 URL × 3 轮 = 21 run，221s）

`lhci collect` + `lhci assert` 断言矩阵（`/` P≥0.80 warn 0.90，内页 P≥0.95，全站 A11y/BP/SEO ≥0.95）：**21 run 全部通过，退出码 0**。逐轮原始 JSON 摘要归档于 `docs/spec/assets/lhci-baseline-loop0.json`。

| URL | Perf | A11y | BP | SEO | 四项均值 | FCP 中位 | LCP 中位 | TBT | CLS |
|-----|------|------|----|----|---------|----------|----------|-----|-----|
| **`/`（世界壳）** | **100** | **100** | **100** | **100** | **100** | 982ms | 1354ms | 0ms | 0 |
| **`/home/`（宪法首页）** | **100** | **100** | **100** | **100** | **100** | 905ms | 1878ms | 0ms | 0 |
| `/work/` | 100 | 100 | 100 | 100 | 100 | — | — | — | — |
| `/work/multilingual-cockpit/` | 100 | 100 | 100 | 100 | 100 | — | — | — | — |
| `/about/` | 100 | 100 | 100 | 100 | 100 | — | — | — | — |
| `/lab/car-configurator/` | 100 | 100 | 100 | 100 | 100 | — | — | — | — |
| `/lab/tts-cockpit/` | 100 | 100 | 100 | 100 | 100 | — | — | — | — |

三轮零波动（每 URL 三轮四项全 100）。注意：localhost 无真实网络 RTT/CDN，线上读数待部署后复测（见 B.6 短板②③）。
（注：该轮本地 collect 曾产出 perf 数值，与 §A 轮 null 不一致——SwiftShader 下 Lighthouse
性能追踪产值不稳定，正是 §A 改用 CI artifact 计分的动因。）

### B.4 运行时冒烟（Playwright + SwiftShader `--enable-unsafe-swiftshader`，1440×900）

四腿独立 browser context 串行执行，截图存 `/opt/cursor/artifacts/l0-baseline-*.png`（8 张，随该次 run 工件上传）：

| 腿 | 剧本 | 结果 | 原始数字 / 证据 |
|----|------|------|-----------------|
| A | `/` 首幕链：静态壳 → `data-state=ready` → `robot_idle` → 变形 CTA → `car_ready` → W → `driving` | ✅ PASS | ready **19.0s** / robot_idle **57.6s** / transform **51.4s**（SwiftShader ~1fps 慢动作墙钟，真机门禁另走 human-gate §5）；transforming 期间 CTA disabled=true；backend 徽标 `WebGL 2`；pageerror 0。截图 `l0-baseline-shell-static / robot-idle / car-ready` |
| B | `/?poi=lingua-tower` 深链 + E 键进站 | ✅ PASS | ready 32.1s（隐含挂城 + POI 分包）；出生即触发圈内（console `[areas] 触发圈进入：lingua-tower`）；按 E → `location.assign` 落地 **`/work/multilingual-cockpit/`**。截图 `l0-baseline-poi-lingua-tower / poi-landing` |
| C | `/home/` 零 world 请求 | ✅ PASS | networkidle + 3s 静置，`/_astro/world\|/models/\|/hdri/\|/textures/city/` 命中 **0 条**。截图 `l0-baseline-home` |
| D | `/` ESC 菜单 → `/work/` | ✅ PASS | domcontentloaded 后即按 Escape（挂载前 0 秒可用）→ `<dialog data-world-esc-menu>` 打开 → 点「招聘方速览」落地 `/work/`。截图 `l0-baseline-esc-menu / esc-work-landing` |

**冒烟 PASS 项 = 4/4 = 100%。**

### B.5 综合分（该轮四维口径）

| 维度 | 权重 | 基线得分 | 加权 | 数据源 |
|------|------|----------|------|--------|
| LHCI `/` 四项均值 | 25% | 100 | 25.0 | B.3（3 轮中位） |
| LHCI `/home/` 四项均值 | 15% | 100 | 15.0 | B.3（3 轮中位） |
| e2e 通过率 | 20% | 100（48/48） | 20.0 | B.2 |
| 视觉 rubric（竞品对标） | 25% | **N/A** | 0（保守记 0） | 该轮量表未合入，无法计分 |
| 3D 交互冒烟 | 15% | 100（4/4） | 15.0 | B.4 |
| **综合分（保守下界，N/A 记 0）** | 100% | — | **75.0 / 100** | — |
| 综合分（可得四维归一，参考值） | 75% → 100% | — | 100.0 | (25+15+20+15)/75 |

该轮预判「量表就绪后 rubric ≥40 即可越线」已由 §A 兑现（rubric 51 → 综合 87.2）。

### B.6 短板与观察（按影响排序）

1. **视觉 rubric 维（25%）空缺且预期非满分**：量表未产出仅是记账缺口；实质风险在于当前城市为程序化灰盒方块 + 纯色霓虹窗格，与竞品（folio 级作品站）在材质细节、光影层次、构图叙事上有可见差距——该维恢复计分后大概率是全场最低分，是 Loop 1 提分主战场。（§A 实证：51 分，全场最低。）
2. **真机计时门禁全部未兑现**：SwiftShader 软渲染读数（robot_idle 57.6s / transform 51.4s 墙钟）与设计门禁（机器人可见 ≤2.5s、加载→可驾驶 ≤8s、变形 1.0–1.2s）不可比，CI 仅采集留档；`human-gate-checklist` §5 真机走查仍是 0 记录。WebGPU 腿（headless 无 `navigator.gpu`）同样零覆盖，降级链仅 WebGL 2 一腿有实证。
3. **LHCI 读数是 localhost 上界**：无网络 RTT、无 CDN、无真实移动设备，四项全 100 不能外推为线上分；且 `/home/` LCP 中位 1878ms 已高于 `/`（1354ms），在真实 4G 下有跌破 Perf 100 的余量风险。线上部署后需以真实 URL 复测一轮校准。

次要观察（不扣分，登记备查）：`deepLinkStatus=fallback` 2 条（agent-nexus、autodrive-lab）转正计划未登记；e2e 套件运行会重写 `docs/spec/assets/e2e-batch1|e2e-integration` 下历史截图（字节级差异，本分支已还原不入账）；环境预装 node_modules 与锁文件曾不同步（缺 `@astrojs/check`/`@playwright/test`，`pnpm install --frozen-lockfile` 后消除——建议环境快照重建）。

### B.7 阻断项登记

**无。** 该轮全部检验（4 静态门禁 + 48 e2e + 21 LHCI run + 4 冒烟腿）零失败，未发现 P0 bug。

### B.8 复现命令

```bash
pnpm install --frozen-lockfile && npx playwright install chromium
pnpm astro check          # 118 文件 0 err / 0 warn
pnpm build                # 19 页
node scripts/audit-budget.mjs dist/
node scripts/check-links.mjs dist/
pnpm test:e2e             # 48 例，约 14 分钟（world project 串行独占）
pnpm preview --host 127.0.0.1 --port 4321 &   # LHCI 需现存服务
npx @lhci/cli collect --config=lighthouserc.json \
  --collect.settings.chromeFlags="--headless=new --no-sandbox --disable-dev-shm-usage"
npx @lhci/cli assert --config=lighthouserc.json
```
