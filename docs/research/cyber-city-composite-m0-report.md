# 综合分 M0 实算报告（CC-COMP-M0-R4）

> 执行模型自报：**claude-fable-5-thinking-xhigh**

| 项 | 内容 |
|----|------|
| Task | **CC-COMP-M0-R4**（综合分 M0 登记刷新实算 · doc-only · 重派——R3 `cursor/cc-comp-m0-r3-1d6f` 仅 kickoff [#105](https://github.com/rayw-lab/website/pull/105) 后僵死，其 kickoff 文已 cherry-pick 吸收 `e62f8a0`） |
| 分支 | `cursor/cc-comp-m0-r4-1d6f`（独立 worktree `/tmp/wt-m0-r4`，base `main@771b1e4`） |
| 状态 | **实算进行中 —— e2e 80 例全量在跑**（本节以下为已落定的实测中间结果，终版报告将覆盖本存根） |
| 日期 | 2026-08-28 |
| 口径正本 | `scripts/score-loop.mjs`（权重单源 25/15/20/25/15）· `cyber-city-composite-98-path.md`（M0 定义 §4）· `cyber-city-baseline-score.md`（L0 实算先例）· 看板登记矩阵 |
| 红线 | 零 `src/`；禁止 LHCI/e2e 冒充功能或性能；性能缺席显式 **—** 勿伪造；综合改登权归指挥官（本报告只交实算证据 + 建议值）；BL2 [#43](https://github.com/rayw-lab/website/pull/43) 禁止合流不受本轮影响 |

## 中间结果（已实测落定，2026-08-28 00:30–00:40 UTC）

### 1. 环境与构建

- worktree fresh：`pnpm install --frozen-lockfile` → `pnpm build` **EXIT=0**（store 命中，dist/ 产出正常）。
- **事故记录（不计入通过率）**：本 VM 无 `~/.cache/ms-playwright` 浏览器缓存，首次 e2e 启动 80 例全数 1ms 秒败（`browserType.launch: Executable doesn't exist … chromium_headless_shell-1234`）——判定为**基础设施失败，产物作废**，`playwright install chromium` 补装后清空 `test-results/` 重跑。该次失败不进任何计分。

### 2. LHCI 两轴（同 SHA green CI artifact 回填，已实算）

- 来源：CI run **[33117590389](https://github.com/rayw-lab/website/actions/runs/33117590389)**（workflow CI，`main@771b1e4` 同 SHA，conclusion=success，2026-08-27T21:19Z）→ artifact `lighthouse-results`（id 9665265803，6.9MB，未过期），21 份 LHR = 7 URL × 3 轮，与 `lighthouserc.json` 合同一致。
- 本 VM SwiftShader 实跑 LHCI 会产出 Perf null（已知坑 #1），按 M0 计划走 CI artifact 回填口径。
- 实算（`score-loop.mjs` `meanOf` 同款：分类三轮中位数 → 四项均值）：
  - `/website/`：Perf 三轮 [0.95, 1, 1] → 中位 1.0；A11y/BP/SEO 三轮全 1.0 → **lhciRoot = 100**
  - `/website/home/`：四项三轮全 1.0 → **lhciHome = 100**
  - 其余五 URL（work/multilingual-cockpit/about/car-configurator/tts-cockpit）四项三轮全 1.0（不进综合，仅证 CI 门禁绿）。

### 3. e2e 合同核验（--list 实跑）

- 当前合同 **80 tests / 16 files**（composite-98-RS 时点 75/15 → +5：`cyber-city-explore` +2（#90 C5-R3 G4 目标线 + idle 引导）、`cyber-city-signage` 新文件 +3（#93 X3-R4 CITY-SIGN-01…03）；`cyber-city-feedback` 只改不增）。
- `@smoke3d` 分母 = **3**（VIS-02 ESC / VIS-03 首幕 / VIS-04 POI 深链），与登记口径零漂移。
- 全量在跑：隔离端口 `E2E_PORT=4340`（4321 dev server 不复用），前 23 例全绿，重 3D 串行链（car → world → world-perf → city-perf → visual）在后。

### 4. 输入登记位（本轮恒读，不改）

视觉 **73**（`cyber-city-visual-rubric-score.json`，[#94](https://github.com/rayw-lab/website/pull/94)）· 功能 **84**（`cyber-city-function-rubric-score.json`）· 性能 **—**（`cyber-city-perf-rubric-score.json` 不存在，缺失明示，禁伪造）。

（待回填：e2e 80 例通过率 + smoke3d 逐例 → `score-loop.mjs --lhci-dir` 全链 → COMPOSITE_SCORE + northStar 四数 + `availableWeight===1` 核验 + 综合敏感度行 + 登记建议。）
