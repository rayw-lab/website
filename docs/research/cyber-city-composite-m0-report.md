# 综合分 M0 实算报告（CC-COMP-M0-R3）

> 执行模型自报：**claude-fable-5-thinking-xhigh**

| 项 | 内容 |
|----|------|
| Task | **CC-COMP-M0-R3**（综合分 M0 登记刷新实算 · doc-only · 重派，R2 `cursor/cc-comp-m0-r2-1d6f` kickoff 后无产出已弃） |
| 分支 | `cursor/cc-comp-m0-r3-1d6f`（独立 worktree，base `main@771b1e4`） |
| 状态 | **KICKOFF —— 实算进行中**（本存根将被完整报告覆盖） |
| 日期 | 2026-08-27 |
| 口径正本 | `scripts/score-loop.mjs`（权重单源 25/15/20/25/15）· `cyber-city-composite-98-path.md`（M0 定义 §4）· `cyber-city-baseline-score.md`（L0 实算先例）· 看板登记矩阵 |
| 红线 | 零 `src/`；禁止 LHCI/e2e 冒充功能或性能；性能缺席显式 **—** 勿伪造；综合改登权归指挥官（本报告只交实算证据 + 建议值）；BL2 [#43](https://github.com/rayw-lab/website/pull/43) 禁止合流不受本轮影响 |

## 实算计划（M0 = 五维齐套实跑，零新实现）

1. worktree fresh `pnpm install --frozen-lockfile` → `pnpm build`（EXIT=0）
2. e2e 全量（隔离端口，防 4321 dev server 串台）→ `test-results/e2e-results.json`
3. LHCI：SwiftShader 本 VM null → 同 SHA green CI artifact 回填（登记来源 commit + run id）
4. `node scripts/score-loop.mjs --lhci-dir <CI artifact>` → COMPOSITE_SCORE + northStar 四数
5. 证据链核验：`availableWeight===1`、`missing=[]`、smoke3d 逐例登记
6. 输入登记位（本轮恒读，不改）：视觉 **73**（`cyber-city-visual-rubric-score.json`，[#94](https://github.com/rayw-lab/website/pull/94)）· 功能 **84**（`cyber-city-function-rubric-score.json`）· 性能 **—**（`cyber-city-perf-rubric-score.json` 不存在，缺失明示，禁伪造）

（完整五维表、northStar 四数、性能缺席口径注记、综合敏感度行、登记建议——待实算完成后回填。）
