# 综合分 M0 实算报告（CC-COMP-M0-R4）

> 执行模型自报：**claude-fable-5-thinking-xhigh**

| 项 | 内容 |
|----|------|
| Task | **CC-COMP-M0-R4**（综合分 M0 登记刷新实算 · doc-only · 重派——R3 `cursor/cc-comp-m0-r3-1d6f` 仅 kickoff [#105](https://github.com/rayw-lab/website/pull/105) 后僵死，其 kickoff 文已 cherry-pick 吸收 `e62f8a0`） |
| 分支 | `cursor/cc-comp-m0-r4-1d6f`（独立 worktree `/tmp/wt-m0-r4`，base `main@771b1e4`） |
| 状态 | **实算进行中**——LHCI 两轴与合同核验已落定；e2e 80 例全量在跑，通过率/smoke3d/COMPOSITE_SCORE 待回填（标 ⏳） |
| 日期 | 2026-08-28（UTC） |
| 口径正本 | `scripts/score-loop.mjs`（权重单源 25/15/20/25/15）· `cyber-city-composite-98-path.md`（M0 定义 §4）· `cyber-city-baseline-score.md`（L0 五维实算先例）· 看板登记矩阵 |
| VM 环境 | Cloud Agent VM（4 核无 GPU，SwiftShader 软渲染）· Node v22.14.0 · pnpm 10.33.3 · Playwright 1.62.1（Chromium Headless Shell，本轮现装）· LHCI 计分源 = CI artifact（Lighthouse 12.6.1，HeadlessChrome/151，formFactor=mobile）· `astro preview` @ `127.0.0.1:4340`（隔离端口，4321 dev server 不复用） |
| 红线 | 零 `src/`；禁止 LHCI/e2e 冒充功能或性能；性能缺席显式 **—** 勿伪造；综合改登权归指挥官（本报告只交实算证据 + 建议值）；BL2 [#43](https://github.com/rayw-lab/website/pull/43) 禁止合流不受本轮影响 |

---

## 0. 结论先行

1. **M0 = 五维齐套实跑一轮、零新实现**（composite-98-path §4 定义）。本轮在 `main@771b1e4` 独立 worktree 完成 fresh install → build → e2e 全量 → LHCI（同 SHA CI artifact 回填）→ `score-loop.mjs` 全链，产出 COMPOSITE_SCORE + northStar 四数 + `availableWeight===1` 证据链。
2. LHCI 两轴实算 **root 100 / home 100**（CI run [33117590389](https://github.com/rayw-lab/website/actions/runs/33117590389)，7 URL × 3 轮全绿，`/` Perf 三轮 [95,100,100] 中位 100）。
3. e2e 合同自 composite-98-RS 时点 **75/15 → 80/16**（+2 explore [#90](https://github.com/rayw-lab/website/pull/90)、+3 signage [#93](https://github.com/rayw-lab/website/pull/93)）；`@smoke3d` 分母仍 **3**，零漂移。⏳ 通过率待全量收尾。
4. **性能北极星维持缺席登记 —**：`cyber-city-perf-rubric-score.json` 不存在（真机六腿 + AL-PERF 未执行），本轮不伪造、不用 LHCI Perf 100 冒充性能分。综合五维**不含**功能/性能（并列北极星，`score-loop.mjs` northStar 块注释明文），故性能缺席**不影响** `availableWeight===1`。
5. ⏳ COMPOSITE_SCORE 与登记建议待 e2e 收尾后回填；**改登与否归指挥官**。

---

## 1. 五维分数表（M0 实算）

| 维度 | 权重 | 得分 | 加权 | 数据源 |
|------|------|------|------|--------|
| LHCI `/` 四项均值 | 25% | **100** | 25.0 | CI artifact @ `771b1e4`（§3；P/A11y/BP/SEO 三轮中位全 100） |
| LHCI `/home/` 四项均值 | 15% | **100** | 15.0 | 同上（四项三轮全 100） |
| e2e 通过率 | 20% | ⏳ | ⏳ | 本 VM 全量实跑（§2） |
| 视觉 rubric（竞品对标） | 25% | **73** | 18.25 | `cyber-city-visual-rubric-score.json`（AL-VIS-L8-W1-R3 独立审计，[#94](https://github.com/rayw-lab/website/pull/94)；本轮恒读不改） |
| 3D 交互冒烟（首幕+POI+ESC） | 15% | ⏳（/3 `@smoke3d`） | ⏳ | 本 VM 实跑：VIS-02 ESC / VIS-03 首幕 / VIS-04 POI 深链（§2） |
| **综合分（五维齐套，可用权重 100%）** | 100% | — | **⏳ / 100** | `scripts/score-loop.mjs --lhci-dir /tmp/lhci-ci-artifact` |

```
COMPOSITE_SCORE=⏳
```

## 2. e2e 全量（80 例 / 16 文件，E2E_PORT=4340 隔离）

⏳ 在跑（串行链 desktop+mobile → car → world → world-perf → city-perf → visual，任意时刻至多一个重 3D 上下文）。合同核验（`--list` 实跑）：

- **80 tests / 16 files**；composite-98-RS 时点 75/15 → +5：`cyber-city-explore` 2→4（[#90](https://github.com/rayw-lab/website/pull/90) C5-R3 G4 目标线 + idle 引导）、`cyber-city-signage` 新文件 +3（[#93](https://github.com/rayw-lab/website/pull/93) X3-R4 CITY-SIGN-01…03）；`cyber-city-feedback` 只改不增（5→5）。
- `@smoke3d` = **3**（VIS-02/03/04，`grep -c` 实数），与登记口径零漂移。
- **墙钟观察（实测中）**：world 链单例墙钟显著高于历史预算——CITY-QST-01（#90 新增目标线闭环）单例实测 **5.1 分钟**（SwiftShader ~1fps 下深链出生 + 链推进 + 埋点互证全程）。composite-98-RS §3.3 的每轮 25–40 min 预算按 75 例估，本轮 80 例含 QST/SIGN 新长例，实测总墙钟收尾后登记（预警：预算需上修）。

| 项 | 数值 |
|----|------|
| passed / total | ⏳ |
| failed / skipped | ⏳ |
| 墙钟 | ⏳ |
| smoke3d 逐例 | ⏳ |

**在跑中已落定的红例（如实登记，不掩盖；根因证据见下）**：

| 用例 | 墙钟 | 失败面 |
|------|------|--------|
| CITY-EXP-01（explore 闭环） | 14.6m | 断言 `泊车位 (-28,-28) 应可达（实测 x=17.6 z=-22.5）`——驾驶腿预算内未达 |
| CITY-QST-02（恒等门 + idle nudge） | 23.1m | 驾驶/空闲长例墙钟型失败 |
| CITY-FB-01…09（反馈全链） | 15.2m | 同上 |
| CITY-HINT-01（键位卡全链） | 10.1m | 同上 |

- **serial 连坐跳过**：CITY-EXP-02、CITY-FB-05、CITY-FB-06（skipped 不计入 score-loop 分母，未执行 ≠ 失败）。
- **根因实锤（运行中取证，2026-08-28 01:22 UTC）**：4 核 VM `loadavg 7.0`，`ps` 捕获**两个** `chrome-headless-shell --type=gpu-process --use-angle=swiftshader-webgl` 并存、各吃 **~196% CPU**——即两个 3D 世界（explore 与 feedback 文件）**同时**在软渲染驾驶。结构洞：`playwright.config.ts` 中 `car-chromium`/`city-perf-chromium`/`visual-chromium` 均钉了 `fullyParallel: false`，**world-chromium 没有**——顶层 `fullyParallel: true` + `workers: 2` 允许 world 链**跨文件并发**，「任意时刻至多一个重 3D 上下文」纪律在 project 内部失守。文件内 serial 只锁文件内顺序，锁不住跨文件。
- **历史对照**：L0 时代 world 用例短（52 例全量 18.4 min），并发窗口伤害小；FXN C1–C6 引入 7 min 级驾驶长例（describe `timeout: 420_000`）后，两长例对撞即互相饿死。composite-98-RS §3.3「修后 clean 全量绿尚无在档实证」的欠账，本轮兑现为**首次在档实证：不绿**。
- **处置口径（M0 红线：不改 e2e/不改秤）**：本全量跑照常收尾作为当轮官方记录，红例如实入分；收尾后对失败 spec 做 `--workers=1` **整机独占复诊**（只作可复现性诊断佐证，不改官方计分 JSON）；`world-chromium` 补 `fullyParallel: false` 的一行修复**移交后续任务**（本轮 doc-only 禁改）。

## 3. LHCI（双源口径：本 VM 已知 null → 同 SHA CI artifact 计分）

- **本 VM 不实跑 collect**：SwiftShader 下 Lighthouse 性能追踪不产值（L0 §A.3 实锤「Audit did not produce a value at all」，范式已知坑 #1），本地读数不可用于①②维计分——按 M0 计划直接走 CI artifact 回填口径。
- **计分源（口径声明）**：**LHCI 来源：CI artifact @ commit `771b1e4`**（GitHub Actions run [33117590389](https://github.com/rayw-lab/website/actions/runs/33117590389)，workflow CI，conclusion=success，2026-08-27T21:19Z，与本轮 base 同 SHA）→ 工件 `lighthouse-results`（id 9665265803，21 份 LHR = 7 URL × 3 轮，与 `lighthouserc.json` 合同一致，未过期）。
- 复算命令：`node scripts/score-loop.mjs --lhci-dir <artifact 解压目录>`（`meanOf`：分类三轮中位数 → 四项均值）。

| URL | Perf | A11y | BP | SEO | 四项均值（中位） | FCP 中位 | LCP 中位 | TBT | CLS |
|-----|------|------|----|----|------------------|----------|----------|-----|-----|
| **`/`（世界壳）** | 100* | 100 | 100 | 100 | **100** | 980ms | 1354ms | 0ms | 0.007 |
| **`/home/`（宪法首页）** | 100 | 100 | 100 | 100 | **100** | 907ms | 1730ms | 0ms | 0 |
| `/work/` | 100 | 100 | 100 | 100 | 100 | 756ms | 1356ms | 0ms | 0 |
| `/work/multilingual-cockpit/` | 100 | 100 | 100 | 100 | 100 | 761ms | 1355ms | 0ms | 0 |
| `/about/` | 100 | 100 | 100 | 100 | 100 | 754ms | 1354ms | 0ms | 0 |
| `/lab/car-configurator/` | 100 | 100 | 100 | 100 | 100 | 1058ms | 1657ms | 0ms | 0 |
| `/lab/tts-cockpit/` | 100 | 100 | 100 | 100 | 100 | 1058ms | 1656ms | 0ms | 0 |

\* `/` Perf 三轮 [95,100,100] → 中位 100；L0 时代的 `/` A11y 95（aria-hidden-focus）与 BP 96（font-size）扣分项在 AL-CAM 轮后维持修复态，本轮 CI 实测四项无一低于 100。其余五 URL 不进综合，仅证 CI 门禁绿。localhost/CI 上界口径注记沿用（基线 §B.6）：线上真机 Lighthouse 是部署后另行校准项，不进综合登记。

## 4. northStar 四数与性能缺席口径

| 北极星 | 登记位 | 本轮读数 | 说明 |
|--------|--------|----------|------|
| 视觉 | `cyber-city-visual-rubric-score.json` | **73** | AL-VIS-L8-W1-R3 独立审计登记于 `771b1e4`（[#94](https://github.com/rayw-lab/website/pull/94)），本轮恒读不改 |
| 功能 | `cyber-city-function-rubric-score.json` | **84** | AL-FXN 独立审计（[#84](https://github.com/rayw-lab/website/pull/84)）登记于 `f2ec089`，本轮恒读不改；**不折算进五维** |
| 性能 | `cyber-city-perf-rubric-score.json` | **—（缺席）** | 文件不存在（`ls` 实证）；真机六腿 + AL-PERF 未执行。**缺失明示、禁止估值**——LHCI Perf 100 是页面加载性能，不冒充 3D 运行时性能北极星 |
| 综合 | `score-loop.mjs` 镜像 | ⏳ | 本轮实算值，见 §1 |

性能缺席**不影响**综合五维完整性：五维 = LHCI×2 + e2e + 视觉 + smoke3d，功能/性能是并列北极星（可观测规格 §6.4 冻结）。`score-loop.mjs` northStar 块对 perf 输出 `null` + sources 注记「（缺失）」，人读行显式 `perf —`。

**矩阵行滞后观察（登记备查，不归本轮改）**：`AGENTS.md`「编排 Delta」矩阵行与看板（tip `502fb2b`）仍写视觉 **71**，滞后于 [#94](https://github.com/rayw-lab/website/pull/94)（`771b1e4`）落进 JSON 的 **73**——`score-loop.mjs` northStar 恒读 JSON 登记位，本轮以 JSON 为准；矩阵行刷新权归指挥官/父代理。

## 5. 证据链核验

- `availableWeight === 1`：⏳（`test-results/quality-score.json` 字段核验）
- `missing === []`：⏳
- smoke3d 逐例（`quality-score.json` `inputs.e2e.smoke3d`）：⏳
- LHCI 来源 commit + run id：`771b1e4` / [33117590389](https://github.com/rayw-lab/website/actions/runs/33117590389)（§3 已登记）

## 6. 综合敏感度行（composite-98-RS §5.3 固定输出）

⏳ `root <x> / home <x> / e2e <n>/80 / smoke <n>/3 → 视觉需求线 <v>`

## 7. 登记建议（改登权归指挥官）

⏳ 待 COMPOSITE_SCORE 落定后给出建议值与看板补丁行；本报告只交实算证据，**不自行改登**看板/AGENTS.md 任何登记位。

## 8. 事故与不入账记录

1. **浏览器缓存缺失（基础设施失败，作废不计）**：本 VM 无 `~/.cache/ms-playwright`，首次 e2e 启动 80 例全数 1ms 秒败（`browserType.launch: Executable doesn't exist … chromium_headless_shell-1234`）——判定基础设施失败，产物作废，`playwright install chromium` 补装后清空 `test-results/` 重跑。该次失败不进任何计分。
2. **e2e 运行重写入库取证截图**：套件运行会字节级重写 `docs/spec/assets/e2e-batch1/*.png`（L0 §B.6 已知现象，先例「还原不入账」）。本轮中间提交 `dfbd277` 误带 12 张——已按先例在后续提交还原至 `main` 基线，最终分支 diff 恢复 doc-only。
3. ⏳ e2e 全量收尾后如有 flaky/失败，逐例登记于 §2。

## 9. 工件与复现命令

| 工件 | 路径 | 入库状态 |
|------|------|----------|
| 综合分明细 JSON | `test-results/quality-score.json` | gitignore；⏳ 快照入库 `docs/spec/assets/quality-score-m0.json` |
| e2e JSON 报告 | `test-results/e2e-results.json` | gitignore |
| CI LHCI 工件 | Actions run [33117590389](https://github.com/rayw-lab/website/actions/runs/33117590389) `lighthouse-results`（id 9665265803） | 远端（保留期内可下载） |

```bash
git worktree add /tmp/wt-m0-r4 -b <branch> origin/main && cd /tmp/wt-m0-r4
pnpm install --frozen-lockfile && pnpm exec playwright install chromium
pnpm build                                    # EXIT=0
E2E_PORT=4340 pnpm exec playwright test       # 80 例全量，串行 3D 链
gh api repos/rayw-lab/website/actions/artifacts/9665265803/zip > lh.zip && unzip lh.zip -d /tmp/lhci-ci-artifact
node scripts/score-loop.mjs --lhci-dir /tmp/lhci-ci-artifact   # 末行 COMPOSITE_SCORE=⏳
```

---

*CC-COMP-M0-R4 · 2026-08-28 —— M0 五维齐套实算（进行中版本；⏳ 处待 e2e 收尾回填）。输入恒读：视觉 73 / 功能 84 / 性能 —。doc-only，零业务代码改动。*
