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

## Loop 1 — ✅ Tier A 五项 + AL1 审计

| ID | 分支 | 任务 | 状态 |
|----|------|------|------|
| CC-L1-improve | `cursor/cc-l1-visual-tier-a-1d6f` · [PR #32](https://github.com/rayw-lab/website/pull/32) | 天空/雾、锥桶撤场、窗色纪律、偏轴构图+rim/接地环、变形白爆抑制 | ✅ `1f0d19e`；视觉自评 51→59；e2e 52/52；CI/LHCI 全绿 |
| CC-AL1 | `cursor/cc-al1-loop1-audit-1d6f` | 五项代码+帧核验、独立视觉复评、e2e/LHCI 与综合分复算 | ✅ 放行；视觉独立 57（Δ2）；登记综合 89.2 / 审计保守 88.7；见 `cyber-city-loop1-audit.md` |

## Loop 2 — 建议受控启动

| 阶段 | 范围 | 进入/退出条件 |
|------|------|---------------|
| A 尾件 | A7 HUD+mini 快览、A8 排版、A9 湿反射、A10 最后重拍 poster | 完成后独立视觉复评 ≥62，并补 robot→veil→car 的 5–10 秒固定脚本录屏 |
| Tier B 主批 | B1 五栋 hero 招牌、B2 街道灯箱/灯杆、B4 剪影密度/高度方差 | V4 场景密度优先；e2e 52/52、LHCI 两维不降、`availableWeight===1` |
| 后置裁决 | B3 飞行光轨、B5 变形运镜 | 先裁 CITY-03 动画配额、GPU 预算和 reduced-motion；不得与 B1/B2 同批 |

Tier C 与 Blender 实模管线不进 Loop 2。父代理仍只在每轮审计后决定是否启动下一轮
improve Task。
