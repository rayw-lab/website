# Phase 0 提分 Loop 编排看板

| 项 | 内容 |
|----|------|
| 编排者 | 父代理（只编排，不实现） |
| 实现模型 | `claude-fable-5-thinking-xhigh` |
| 审计模型 | `gpt-5.6-sol-xhigh-fast` |
| 生产 tip | `main` @ `74947d9`（Phase 0 已合入） |
| 目标 | **综合分 ≥ 85**（见下方计分口径） |

## 综合分口径（Loop 统一）

| 维度 | 权重 | 数据源 |
|------|------|--------|
| LHCI `/` 四项均值 | 25% | P/A11y/BP/SEO |
| LHCI `/home/` 四项均值 | 15% | 宪法首页回归 |
| e2e 通过率 | 20% | passed/total |
| 视觉 rubric（竞品对标） | 25% | CC-L0-visual 产出量表 |
| 3D 交互冒烟（首幕+POI+ESC） | 15% | 自动化脚本 PASS 项 |

基线由 CC-L0-baseline 首跑登记；每轮 Loop 结束由 CC-AL* 审计复算。

## Loop 0 — 🚀 并行派发（3× Fable5）

| ID | 分支 | 任务 | Agent |
|----|------|------|-------|
| CC-L0-setup | `cursor/cc-l0-test-framework-1d6f` | VM 安装 3D H5 测试框架（Playwright 视觉/点击/canvas 截图纪律） | [L0-setup](bc-1a7804d0-3f2f-5f96-9d5e-a4d2a7a41ba9) 🚀 |
| CC-L0-baseline | `cursor/cc-l0-baseline-score-1d6f` | 全套工程检验 + 基线分数矩阵 + 工件 | [L0-baseline](bc-45675d88-0cc5-5b62-bd55-1b18638a43ce) 🚀 |
| CC-L0-visual | `cursor/cc-l0-visual-research-1d6f` | 竞品视觉调研 + 85 分 rubric | [L0-visual](bc-d0cbec75-f78f-5a57-b07c-873062fa73b0) 🚀 |

## Loop 0 审计 — 待 L0 齐套

| ID | 分支 | 任务 | Agent |
|----|------|------|-------|
| CC-AL0 | `cursor/cc-al0-loop0-audit-1d6f` | 复核基线分 + 框架可复现 + rubric 合理性 | 🚀 gpt-5.6-sol-xhigh-fast |

## Loop 1+ — 待 AL0 放行后

| ID | 任务 |
|----|------|
| CC-L1-improve | 按 AL0 缺口清单提分（单轮一个聚焦 PR） |
| CC-AL1 | 复算综合分；<85 继续 Loop 2 |

*父代理只在每轮审计后决定是否开下一轮 improve Task。*
