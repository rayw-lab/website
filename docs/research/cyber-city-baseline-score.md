# Cyber City Phase 0 首跑基线分数矩阵（CC-L0-baseline）

| 项 | 内容 |
|----|------|
| 登记者 | CC-L0-baseline（`claude-fable-5-thinking-xhigh`） |
| 分支 | `cursor/cc-l0-baseline-score-1d6f`（纯检验，零业务代码改动） |
| 检验对象 | `main` @ `1b8d051`（工程 tip = `74947d9` Phase 0 合入；其后两笔均为 docs） |
| 计分口径 | `docs/research/cyber-city-score-loop-orchestration.md` 编排看板权重 |
| 检验日期 | 2026-08-25（UTC） |
| 环境 | Cloud Agent VM（4 核软渲染）· Node v22.14.0 · pnpm 10.33.3 · Playwright 1.62.1（Chromium + SwiftShader）· Lighthouse 12.6.1（LHCI CLI 0.15.1，formFactor=mobile）· `astro preview` @ `127.0.0.1:4321` |

## 1. 静态工程门禁（全部实跑）

| # | 检验 | 命令 | 结果 | 关键原始数字 |
|---|------|------|------|--------------|
| 1 | 类型/内容检查 | `pnpm astro check` | ✅ PASS | 118 文件：**0 errors / 0 warnings / 58 hints** |
| 2 | 生产构建 | `pnpm build` | ✅ PASS | **19 page(s) built in 1.29s**（含 `rss.xml` + sitemap） |
| 3 | 体积预算 | `node scripts/audit-budget.mjs dist/` | ✅ 全部阻断级门禁通过 | 宪法首页首屏 **33.9KB** gzip（< 200KB 硬门禁；HTML+CSS 13.1/35、JS 0.0/15、poster 20.6/40、图标 0.2/30）；`/` 壳 G-A′ **39.3KB**/90KB（HTML+CSS 5.8/35、引导 JS 1.5/15、poster 31.8/40、静态标签零重资产命中 0）；零 world 字节断言 14 受保护页命中 0；public/ 8.7MB/40MB；world JS 全量 **78.0KB**/900KB（12 chunk）；world 资产池 5.2MB/12MB；黑名单格式命中 0 |
| 4 | 链接完整性 | `node scripts/check-links.mjs dist/` | ✅ PASS | 19 页 × **345 条内部引用全部有效**；manifest 3 模块 × 2 slug 一致；12 栋在册楼 deepLink 核对通过；`deepLinkStatus=fallback` 登记 2 条（agent-nexus → `/ai-lab/`、autodrive-lab → `/work/`，转正计划须按 §12.7.3 守则① 在后续 PR 登记） |

## 2. e2e 全量（`pnpm test:e2e`，独占端口 4321）

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

## 3. LHCI（`lighthouserc.json` 全 7 URL × 3 轮 = 21 run，221s）

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

三轮零波动（每 URL 三轮四项全 100）。注意：localhost 无真实网络 RTT/CDN，线上读数待部署后复测（见 §6 短板②③）。

## 4. 运行时冒烟（Playwright + SwiftShader `--enable-unsafe-swiftshader`，1440×900）

四腿独立 browser context 串行执行，截图存 `/opt/cursor/artifacts/l0-baseline-*.png`（8 张，随本次 run 工件上传）：

| 腿 | 剧本 | 结果 | 原始数字 / 证据 |
|----|------|------|-----------------|
| A | `/` 首幕链：静态壳 → `data-state=ready` → `robot_idle` → 变形 CTA → `car_ready` → W → `driving` | ✅ PASS | ready **19.0s** / robot_idle **57.6s** / transform **51.4s**（SwiftShader ~1fps 慢动作墙钟，真机门禁另走 human-gate §5）；transforming 期间 CTA disabled=true；backend 徽标 `WebGL 2`；pageerror 0。截图 `l0-baseline-shell-static / robot-idle / car-ready` |
| B | `/?poi=lingua-tower` 深链 + E 键进站 | ✅ PASS | ready 32.1s（隐含挂城 + POI 分包）；出生即触发圈内（console `[areas] 触发圈进入：lingua-tower`）；按 E → `location.assign` 落地 **`/work/multilingual-cockpit/`**。截图 `l0-baseline-poi-lingua-tower / poi-landing` |
| C | `/home/` 零 world 请求 | ✅ PASS | networkidle + 3s 静置，`/_astro/world\|/models/\|/hdri/\|/textures/city/` 命中 **0 条**。截图 `l0-baseline-home` |
| D | `/` ESC 菜单 → `/work/` | ✅ PASS | domcontentloaded 后即按 Escape（挂载前 0 秒可用）→ `<dialog data-world-esc-menu>` 打开 → 点「招聘方速览」落地 `/work/`。截图 `l0-baseline-esc-menu / esc-work-landing` |

**冒烟 PASS 项 = 4/4 = 100%。**

## 5. 综合分（编排看板权重）

| 维度 | 权重 | 基线得分 | 加权 | 数据源 |
|------|------|----------|------|--------|
| LHCI `/` 四项均值 | 25% | 100 | 25.0 | §3（3 轮中位） |
| LHCI `/home/` 四项均值 | 15% | 100 | 15.0 | §3（3 轮中位） |
| e2e 通过率 | 20% | 100（48/48） | 20.0 | §2 |
| 视觉 rubric（竞品对标） | 25% | **N/A** | 0（保守记 0） | CC-L0-visual 量表未合入 `main`，本轮无法计分；量表落地后由 CC-AL0 复算补登 |
| 3D 交互冒烟 | 15% | 100（4/4） | 15.0 | §4 |
| **综合分（保守下界，N/A 记 0）** | 100% | — | **75.0 / 100** | — |
| 综合分（可得四维归一，参考值） | 75% → 100% | — | 100.0 | (25+15+20+15)/75 |

**基线登记：综合分 = 75/100（保守口径）**。可测四维全部满分——距 ≥85 目标的全部缺口集中在视觉 rubric 维（权重 25%）：量表就绪后该维 ≥40 分（即 rubric 得分 ≥40/100）即可越线。

## 6. 短板与观察（按影响排序）

1. **视觉 rubric 维（25%）空缺且预期非满分**：量表未产出仅是记账缺口；实质风险在于当前城市为程序化灰盒方块 + 纯色霓虹窗格，与竞品（folio 级作品站）在材质细节、光影层次、构图叙事上有可见差距——该维恢复计分后大概率是全场最低分，是 Loop 1 提分主战场。
2. **真机计时门禁全部未兑现**：SwiftShader 软渲染读数（robot_idle 57.6s / transform 51.4s 墙钟）与设计门禁（机器人可见 ≤2.5s、加载→可驾驶 ≤8s、变形 1.0–1.2s）不可比，CI 仅采集留档；`human-gate-checklist` §5 真机走查仍是 0 记录。WebGPU 腿（headless 无 `navigator.gpu`）同样零覆盖，降级链仅 WebGL 2 一腿有实证。
3. **LHCI 读数是 localhost 上界**：无网络 RTT、无 CDN、无真实移动设备，四项全 100 不能外推为线上分；且 `/home/` LCP 中位 1878ms 已高于 `/`（1354ms），在真实 4G 下有跌破 Perf 100 的余量风险。线上部署后需以真实 URL 复测一轮校准。

次要观察（不扣分，登记备查）：`deepLinkStatus=fallback` 2 条（agent-nexus、autodrive-lab）转正计划未登记；e2e 套件运行会重写 `docs/spec/assets/e2e-batch1|e2e-integration` 下历史截图（字节级差异，本分支已还原不入账）；环境预装 node_modules 与锁文件曾不同步（缺 `@astrojs/check`/`@playwright/test`，`pnpm install --frozen-lockfile` 后消除——建议环境快照重建）。

## 7. 阻断项登记

**无。** 本轮全部检验（4 静态门禁 + 48 e2e + 21 LHCI run + 4 冒烟腿）零失败，未发现 P0 bug。

## 8. 复现命令

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
