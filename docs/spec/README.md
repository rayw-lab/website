# 规格文档索引（SRD + PRD）

> **版本**：v1.0（2026-08-24）  
> **状态**：评审稿  
> **上游**：`docs/website-plan/master-plan.md`（业务总纲）

---

## 文档关系

```text
master-plan.md          ← 业务总纲（定位、内容规范、视觉定调）
    │
    ├── PRD.md          ← 做什么、为谁做、功能清单、路线图（产品视角）
    └── SRD.md          ← 怎么建、模块怎么拆、技术约束（工程视角）
         │
         └── homepage-redesign-spec.md  ← Phase 1 首页落地的设计规格（PRD/SRD 的子集执行文档）
```

| 文档 | 读者 | 核心问题 |
|------|------|---------|
| **[PRD.md](./PRD.md)** | 产品负责人、内容作者 | 做什么？为谁做？优先级？成功标准？ |
| **[SRD.md](./SRD.md)** | 工程师、Cloud Agent | 系统怎么拆？用什么技术？怎么验收？ |

**阅读顺序**：先 PRD 建立产品共识 → 再 SRD 理解架构 → 动手前读 `homepage-redesign-spec.md`。

---

## 关键共识（两份文档共同前提）

1. **两个现有 Demo 是引子，不是终点**——TTS 座舱 + 3D 配置器是 AI Lab「证据工厂」的起点样本。
2. **产品是「个人专业信用系统」**，不是简历站——文字证据（Work/Insights）+ 可交互证据（Lab）双向挂钩。
3. **硬约束不变**：GitHub Pages 纯静态、Lighthouse ≥ 95、首页 < 200KB、保密分级前置。
4. **炫技放行条件**：炫的正是你卖的能力（座舱 / 多语种 / 端云 / AI 工作流）。

---

## 数量级速查

| 维度 | PRD | SRD |
|------|-----|-----|
| 功能需求 | **65 条**（P0/P1/P2 + MVP/V1/V2） | — |
| 子系统 | 六大导航 + Lab 证据工厂 | **6 个子系统**（Content / Presentation / Lab / Build / Analytics / SEO） |
| 未来 Lab | **8 个构想**（V1 优先 3 个） | 可插拔 manifest + `mount()` 契约 |
| Persona | **4 类**（OEM、猎头、同行、媒体） | — |
| 演进阶段 | MVP → V1 → V2 | Phase 0 → 4（门禁式） |

---

## 下一步

| 优先级 | 动作 | 依据 |
|--------|------|------|
| P0 | 评审并冻结 PRD/SRD v1.0 | 本文档 |
| P0 | Phase 1：首页五区块 + Content Collections + CI 门禁 | SRD §13 Phase 1 |
| P1 | Lab 子系统化（manifest 收编两个引子 Demo） | SRD §12 |
| P1 | V1 三个新 Lab（端云可视化 / Prompt 对比台 / 多语种 QA） | PRD §7.2 |
