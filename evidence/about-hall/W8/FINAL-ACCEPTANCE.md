# W8 最终验收记录

## 结论

本地冻结版本达到合入前放行条件：产品增量已完成；正式全量测试、Lighthouse 与视觉复议均通过。结果仍需由最终提交 SHA 的 GitHub CI 复核，随后才能合入并核线上版本。

## 机器验收

- 运行：`E2E_PORT=4661 pnpm quality:loop:full`
- 环境：Node 22.23.2、pnpm 10.33.3、Playwright 单 worker、`retries=0`
- 分母：`playwright test --list` 实读 109 tests / 22 files / 7 projects
- final-r1：第 57/109 项后随工具会话中断；无终态 JSON，保留为中断轮，不计通过或失败。
- final-r2：109 passed、0 failed、0 skipped、0 flaky、退出码 0；Playwright 7013 秒，聚合脚本最终退出码 0。
- Lighthouse：8 URL × 3 = 24 次采集；断言全部通过。`/world/about-pavilion/` 中位 Performance / Accessibility / Best Practices / SEO = 99 / 96 / 100 / 100。
- 综合分：95.14；`availableWeight=1`、`missing=[]`。

证据：

- `final-playwright-list-r2.log`
- `final-quality-loop-full-r1-interrupted.log`
- `final-quality-loop-full-r2.log`
- `final-r2-e2e-results.json`
- `final-r2-lhci-summary.json`
- `final-r2-lhci-assertions.json`
- `final-r2-quality-score.json`

## 视觉复议

- Grok 首轮：A/B/E = 7.6 / 6.3 / 6.8，指出移动地轨断词、纸面标题断词、S6 中段缺少可复述标题，并把移动端无到达条与馆长机器人误判为缺陷。
- 修正：地轨站名不拆词；“复杂技术”不拆词；S6 “回家”标题全程保留；移动截图使用真实城市来源参数；补齐 S1–S5 画面。
- Grok 针对核验：5 条中 4 条已修、1 条误报；六站证据闭合；A/B/E = 8 / 8 / 8，最大差 0。
- 最终截图 `final-review/` 共 12 张，`console-errors.json` 为 0 条。

## 具名非阻塞项

构建仍打印大分包警告。超过 500KB 的主体是城市按需运行时中的 `three.webgpu`、Draco、Basis 和 Rapier WASM；静态首页壳、纸面页和展厅 HTML 不预载这些模块，现有预算门通过。此项不提高阈值消音，留给后续城市性能阶段。

## 证明等级

- 本地真实浏览器自动化：已证。
- 本地 Lighthouse：已证。
- 独立静态视觉复议：已证。
- GitHub CI、Pages 部署、线上消费端：待 S4 完成后另记最终回执。
- 真机 iPhone Safari：本期允许的单项 `PARTIAL`；浏览器模拟不冒充真机。
