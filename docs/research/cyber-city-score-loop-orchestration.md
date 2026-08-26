# Phase 0 提分 Loop 编排看板

| 项 | 内容 |
|----|------|
| 编排者 | 父代理（只编排，不实现） |
| 实现模型 | `claude-fable-5-thinking-xhigh` |
| 审计模型 | `gpt-5.6-sol-xhigh-fast` |
| 生产 tip | `main` @ `5fd3ddb`（Loop 2 齐套：综合 **91.0**，视觉 **64**） |
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

## Loop 0 — ✅ 三 Task 齐套

| ID | 分支 | 任务 | Agent | 状态 |
|----|------|------|-------|------|
| CC-L0-setup | `cursor/cc-l0-test-framework-1d6f` | VM 安装 3D H5 测试框架（Playwright 视觉/点击/canvas 截图纪律） | [L0-setup](bc-1a7804d0-3f2f-5f96-9d5e-a4d2a7a41ba9) | ✅ PR #29 齐套 |
| CC-L0-baseline | `cursor/cc-l0-baseline-score-1d6f` | 全套工程检验 + 基线分数矩阵 + 工件 | [L0-baseline](bc-45675d88-0cc5-5b62-bd55-1b18638a43ce) | ✅ 五维基线 87.2 |
| CC-L0-visual | `cursor/cc-l0-visual-research-1d6f` | 竞品视觉调研 + 85 分 rubric | [L0-visual](bc-d0cbec75-f78f-5a57-b07c-873062fa73b0) | ✅ PR #30 rubric v1.1 / 51 |

## Loop 0 审计 — ✅ 有条件放行

| ID | 分支 | 任务 | Agent | 状态 |
|----|------|------|-------|------|
| CC-AL0 | `cursor/cc-al0-loop0-audit-1d6f` | 复核基线分 + 框架可复现 + rubric 合理性 | gpt-5.6-sol-xhigh-fast | ✅ 有条件放行；复算 87.2，视觉独立复评 49（Δ2）；见 `cyber-city-loop0-audit.md` |

## Loop 1 — ✅ Tier A 五项 + AL1 放行

| ID | 分支 | 任务 | Agent | 状态 |
|----|------|------|-------|------|
| CC-L1-improve | `cursor/cc-l1-visual-tier-a-1d6f` · [PR #32](https://github.com/rayw-lab/website/pull/32) | AL0 §6 Tier A：天空/雾辉光、锥桶撤场、窗色纪律、首幕构图/轮廓光、变形白爆抑制 | [L1-improve](bc-c6cee121-d50f-5491-b19d-aeb9d608c4ab) | ✅ `1f0d19e`；视觉 51→59；e2e 52/52；综合 89.2 |
| CC-AL1 | `cursor/cc-al1-loop1-audit-1d6f` | 复算综合分 + 视觉复评 | gpt-5.6-sol-xhigh-fast | ✅ 放行；独立视觉 57（Δ2）；保守综合 88.7；见 `cyber-city-loop1-audit.md` |

## Loop 2 — 🚀 Tier B 完成，AL2 终审中

| 阶段 | 分支 | 任务 | Agent | 状态 |
|------|------|------|-------|------|
| CC-L2-a-tail | `cursor/cc-l2-visual-a-tail-1d6f` · [PR #33](https://github.com/rayw-lab/website/pull/33) | A7–A10 | [L2-a-tail](bc-ddb54b1b-f83e-5082-b79e-de513f56ca92) | ✅ 5/5；自评 62；综合 90.5 |
| CC-AL2-a | `cursor/cc-al2-a-tail-audit-1d6f` | 复评门 | gpt-5.6-sol-xhigh-fast | ⛔ 独立视觉 60；见 `loop2-a-audit.md` |
| CC-L2-a-plus | `cursor/cc-l2-visual-a-plus-1d6f` · [PR #34](https://github.com/rayw-lab/website/pull/34) | 湿反射前景 + HUD 字级 | [L2-a-plus](bc-9eb424da-1c75-562d-a07a-ec295e2feb57) | ✅ 自评 62；综合 90.5 |
| CC-AL2-a-plus | `cursor/cc-al2-a-plus-audit-1d6f` | 复评门复核 | gpt-5.6-sol-xhigh-fast | ✅ 独立视觉 **62**；放行 Tier B；见 `loop2-a-plus-audit.md` |
| CC-L2-tier-b | `cursor/cc-l2-visual-tier-b-1d6f` · [PR #35](https://github.com/rayw-lab/website/pull/35) | B1/B2/B4 | [L2-tier-b](bc-a63837d1-6b15-530d-96b0-24fd0585f8d0) | ✅ 视觉 65；V4 40→56；综合 **91.3** |
| CC-AL2 | `cursor/cc-al2-loop2-audit-1d6f` | Loop 2 全量终审 | gpt-5.6-sol-xhigh-fast | 🚀 已派发 |

**进入条件（AL1 §6）：** e2e 52/52、LHCI 两 URL 不降、`availableWeight===1` 作硬条件。B3/B5 后置不进本 Loop。
