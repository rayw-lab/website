# 科技城测试框架 · 本 VM 跑法（CC-L0-setup）

供提分 Loop（`cyber-city-score-loop-orchestration.md`）各轮复用的端到端测试/取证/计分设施。
一切命令在仓库根目录执行；计分口径单源在编排文档「综合分口径」表，实现在 `scripts/score-loop.mjs`。

> **PERF 规格恒红（#178/#179 定谳）**：`CITY-PERF-01`/`02` 曾挂 `[data-ws-fps]` DOM 致先天恒红（#182 开窗 −2 扣减）；案 A 改锚 `__worldSpike.fps()` 后清红，全量分母恢复 **86/0/0**（见 `docs/research/cc-perf-spec-fix-rs.md` · CC-PERF-SPEC-IMPL）。

## 一次性安装（新 VM 只做一遍）

```bash
pnpm install                        # 含 @playwright/test 与 @lhci/cli（devDependencies）
pnpm exec playwright install chromium   # Chromium + headless shell（~230MB，1 分钟内）
```

LHCI 无需另装 Chrome：`run-quality-loop.mjs` 自动把 Playwright Chromium 路径注入 `CHROME_PATH`。

## 端口与渲染环境

| 项 | 值 |
|----|-----|
| 靶站 | `astro preview` 伺服 `dist/`（生产构建产物，与 Pages 同构；不测 dev server） |
| 端口 | `4321`（`E2E_PORT` 环境变量可覆盖），路径带 base：`http://127.0.0.1:4321/website/` |
| 服务器纪律 | Playwright `webServer` 与 `run-quality-loop.mjs` 都「有则复用、无则拉起」；loop 拉起的 preview 退出后保持运行，后续轮直接复用 |
| WebGL | 无 GPU，SwiftShader 软渲染（~1-5fps 慢动作）：Playwright 启动参数 `--enable-unsafe-swiftshader`（`playwright.config.ts` launchOptions）；LHCI 侧 chromeFlags = `--headless=new --no-sandbox --enable-unsafe-swiftshader` |
| 计时口径 | SwiftShader 下挂载→robot_idle 实测 ~75-110s（等待上限 210s，校准记录见 `e2e/cyber-city.spec.ts` 文件头⑤）；真机计时门禁另走 human-gate |

## 命令表（耗时为本 VM 实测，2026-08-25）

| 命令 | 内容 | 实测耗时 |
|------|------|----------|
| `pnpm build` | astro build → `dist/` | ~10s |
| `pnpm test:visual` | build + 视觉/3D 冒烟 4 例（`e2e/visual/`，`--no-deps` 单跑） | ~3 min |
| `pnpm quality:loop` | **一键链 quick 档**：build → 视觉冒烟 e2e → LHCI（`/`+`/home/` 各 1 轮）→ 综合分 | ~3.5 min |
| `pnpm lhci:local` | build + LHCI 全七 URL × 3 轮中位 + 门禁断言（CI ci.yml 同口径） | ~4 min |
| `pnpm quality:loop:full` | 一键链 full 档：全 e2e 五 project 链 + 全量 LHCI + 综合分（基线登记/审计复算用） | **~23 min 实测**（CC-L0-baseline 首跑登记：build 3s + e2e 52 例 1105s + LHCI 21 run 227s + assert/score ~1s） |
| `pnpm test:e2e` | 既有全量 e2e（build + 五 project 链） | **~18.5 min 实测**（52 例；CITY/VIS 长挂载用例集中在 world/visual 串行 project） |
| `pnpm score` | 只读既有工件重算综合分（不跑测试；fresh clone 须先生成/下载下述输入） | <1s |

常用旗标（`run-quality-loop.mjs`）：`--skip-build/--skip-e2e/--skip-lhci/--skip-score`、
`--lhci-runs N`、`--visual-score N`（透传）、`--min N`（综合分门槛，低于则退出 1）。
退出码语义：测试失败/门禁缺口 = 数据（压低综合分），退出码仍为 0；仅基础设施故障退出 1。

## SwiftShader VM 下 LHCI 已知限制与 CI 工件回填（CC-L0-baseline 实证）

本 VM（无 GPU 软渲染）跑 `lhci collect` 时 **performance 与 best-practices 分类可能全轮为
null**（Lighthouse 性能追踪不产值，`lhci assert` 报「Audit did not produce a value at all」；
accessibility/seo 不受影响）。此时 score-loop 的①②维按缺维归一化——基线/审计登记需五维
齐套时，改用 GitHub Actions 最近 green run 的 LHCI 工件复算：

```bash
gh run list --limit 5                                   # 找最近 green CI run
gh run download <run-id> -n lighthouse-results -D /tmp/ci-lhci
node scripts/score-loop.mjs --lhci-dir /tmp/ci-lhci     # ①②维改读 CI 工件
```

登记纪律：文档必须注明「LHCI 来源：CI artifact @ commit <sha>」（先例见
`cyber-city-baseline-score.md` §A.3）。注意该现象非确定性（§B 首跑轮本地曾产出 perf 数值），
每轮以实际 lhr JSON 里 `categories.performance.score` 是否为 null 判定。

## 综合分

权重（编排文档口径）：LHCI `/` 25% + LHCI `/home/` 15% + e2e 通过率 20% + 视觉 rubric 25% + 3D 交互冒烟 15%。
输入：`.lighthouseci/lhr-*.json`（每 URL 多轮取分类中位）、`test-results/e2e-results.json`
（json reporter 常开；`@smoke3d` 标签用例 = 冒烟维度，未执行的 spec 不计入）、视觉 rubric 登记在
`docs/research/cyber-city-visual-rubric-score.json`（`{"score": 0-100}`，CC-L0-visual 交付后落位）或 `--visual-score N`。
缺失维度按可用权重归一化并明示覆盖率，不计 0 分。该行为只供诊断；发布/基线登记除
`COMPOSITE_SCORE` 达标外，还必须核对 `test-results/quality-score.json` 的
`availableWeight === 1` 且 `missing` 为空，禁止以缺维归一分放行。示例输出（末行机读）：

```
  综合分 90.5/100（按可用权重 100% 归一化；五维齐套)
COMPOSITE_SCORE=90.5
```

## 视觉取证与基线图纪律

- **canvas 非空取证**（`e2e/helpers/visual.ts`）：Playwright 合成器截图 → 浏览器端 2D canvas 像素统计
  （规避 three `preserveDrawingBuffer=false` 页内读空假阴性）。断言中心区量化颜色数 ≥8 且非众数色占比 ≥3%
  （空画布≈1 色/0%；城市场景实测 300+ 色 / 50%+）。
- **取证截图**：`test-results/visual/*.png`（gitignore，固定文件名每轮覆盖写，跨轮同名对比）。
- **`toHaveScreenshot` 基线**：入库 `e2e/visual/__screenshots__/<spec>/<project>/<名>.png`
  （`snapshotPathTemplate`），容差 `maxDiffPixelRatio: 0.02`。基线只在本 VM（SwiftShader+固定系统字体）生成/更新：
  `pnpm exec playwright test --project=visual-chromium --no-deps --update-snapshots`。
  仅对确定性画面（静态壳、DOM 弹层）建基线；3D 帧走像素统计取证，不建像素基线。
- 用例清单（`e2e/visual/world-visual.spec.ts`，`visual-chromium` project 殿后、单 worker 顺序执行）：
  VIS-01 壳静态基线 ·VIS-02 ESC 菜单 ·VIS-03 首幕 robot_idle canvas 取证 ·VIS-04 `?poi=` 深链取证（后三者 = `@smoke3d`）。
