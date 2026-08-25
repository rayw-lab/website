# 工程波次笔记：Full Entry 科技城 · 波 1

> 汇集地：各波 Task 完成后在此追加一小节（验收命令输出摘要 + 关键决策），供波末审计（CC-A1）与后续波次引用。编排看板见 `cyber-city-eng-orchestration.md`。

## CC-E10 —— e2e 世界剧本骨架 + 走查表（红灯态先写）

- **分支**：`cursor/cc-e10-e2e-skeleton-1d6f`（自 `cursor/cyber-city-hero-design-1d6f`）
- **交付物**：
  1. `e2e/cyber-city.spec.ts`（新）——世界剧本 6 用例骨架，**全部 `test.skip` 红灯态**，每用例头部注明对应 PRD/SRD 条款；文件头固化选择器契约提案（`SEL` 常量区 = CC-E6/E7 实装时的唯一改动点）与绿灯五条件；
  2. `docs/spec/human-gate-checklist.md` §5（新）——「科技城 Phase 0」走查表空表四张：首幕全流程（§5.1）、八跳过出口（§5.2）、Persona 2 猎头剧本（§5.3）、真机帧率录测回填位（§5.4）；
  3. 本文件（新建，波 1 汇集地）。

### 新增用例清单与 skip 原因

| ID | 覆盖 | 上位条款 | skip 原因（绿灯依赖） |
|----|------|---------|----------------------|
| CITY-E2E-01 | 壳静态段合同：load 前零 world 字节 + HTML 零 world 静态标签 + 定位语/poster/noscript | SRD §11.2 ⑥、§12.7.2 G-A′；PRD CITY-01/02 | `/` 世界壳未交付（CC-E7 波 4，当前根路由 = 宪法 HTML 首页） |
| CITY-E2E-02 | 跳过出口：第 0 秒可点 + Tab 第一焦点 → `/home/` 落地零 world 字节 | PRD §2.6 新承诺二、CITY-02/09①、§7.4 Persona 2；SRD §12.7.8 出口① | `/home/` 路由与壳上跳过出口未交付（CC-E7） |
| CITY-E2E-03 | 变形→可开计时：robot_idle → transforming（CTA disabled）→ car_ready → 即刻 WASD（占位断言 + 计时采集） | PRD CITY-05/06、终裁 D4；SRD §12.7.2（变形 1.0–1.2s / 加载→可驾驶 ≤8s）、§12.7.4 | TransformSystem/Reveal 未交付（CC-E6 波 2）；墙钟阈值待 SwiftShader 慢动作系数标定 |
| CITY-E2E-04 | reduced-motion 终态：不自动挂载（`data-blocked`）→ 显式进入终态直出 → 变形 instant swap + 文字提示 | PRD CITY-05 验收、CITY-09⑤；实施方案 §1.2 | 世界壳与 TransformSystem 均未交付（CC-E6/E7） |
| CITY-E2E-05 | `?gl=1` 回退：徽标 WebGL 2 + 变形在回退腿可播 + 零异常 | SRD §12.7.8 第二档；PRD LAB-17（TSL 双后端）；spike WS-E2E-05 契约结转 | `?gl=` 读参随 CC-E7 壳引导脚本落地 |
| CITY-E2E-06 | 机器人可见计时：poster 先显（LCP 不等 GLB）+ world-reveal 计时采集留档 | PRD CITY-04（≤2.5s）；SRD §12.7.2「e2e 冒烟计时」行 | HeroRobot/Reveal 未交付（CC-E5/E6）；可测信号契约待实装补齐 |

**计时口径决策**：CI SwiftShader 软渲染 ~1fps（e2e 先例实测），墙钟阈值直接断言必假阴性——计时用例在 CI 侧只做「状态序 + annotation 采集留档」（口径同 WS-PERF-01 软门禁），真机判定读数以 human-gate-checklist §5.1/§5.4 走查表为准。

**编排注记**：新用例暂挂 `desktop-chromium` project（skip 态零成本）；绿灯时应移入串行 world project（SwiftShader 下并发 3D 上下文互相挤兑，playwright.config 先例注释），该配置调整与解 skip 同 PR 完成，本次不动 `playwright.config.ts`。CI 门禁阈值（G-A′/LHCI assertMatrix 等）不在本 Task 文件域（CC-E8）。

### 验收命令输出摘要

```text
npx playwright test --list
  → Total 48 tests in 9 files（既有 42 + 新增 CITY-E2E-01~06，均声明为 skip）
pnpm test:e2e  # 独立 worktree 全量验证（E2E_PORT=4620，避开共享 VM 上其他波 1 Task 的 preview）
  → 42 passed / 6 skipped（= CITY-E2E-01~06 红灯态）/ 0 failed，17.2m，exit 0
  → 既有 42 用例零回归；WS-PERF-01 软门禁 OBS 照常登记（SwiftShader ~1.4fps 下界读数，不阻断）
  → 运行再生成的报告截图（docs/spec/assets/e2e-*）按「不提交无关 png」纪律全部还原，未入库
```
