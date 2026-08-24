# 规格文档索引（SRD + PRD）

> **版本**：v1.1（2026-08-24）  
> **状态**：评审稿  
> **上游**：`docs/website-plan/master-plan.md`（业务总纲）  
> **v1.1 变更**：正式采纳 Hybrid 路线（见下方决策摘要）

---

## Hybrid 决策摘要（v1.1）

用户已**正式接受** Hybrid 路线（决策依据：`docs/research/bruno-simon-teardown-adaptation.md` 第 9 章决策表）：

| 项 | 决策 |
|----|------|
| 路线 | **Hybrid**：HTML 首页/内页原样保留（宪法）+ 独立路由 **`/world/`「智能座舱试验场」**（opt-in 旗舰 Lab 展项） |
| 明确否决 | Full Bruno Clone（全屏 3D 作为首页/唯一入口）——与 Lighthouse ≥ 95、10 秒定位、猎头 30 秒路径正面冲突 |
| 入口 | 首页 Hero 车模旁「**Start here · 进入试验场**」第三 CTA（点击前首页零 world 字节） |
| 世界形态 | 六分区 POI 空间化六导航 + **车↔机器人 morph**（车=交付载体，机器人=座舱 AI 人格化，隐喻端云分层）；内容永不进 3D，深度内容一律 HTML overlay/真实 URL |
| 推进方式 | 三阶段 A（Spike，可丢弃）→ B（最小可玩）→ C（完整版），每阶段独立门禁 + 止损点 + 数据阀门 |
| 预算 | 首页 C-3（< 200KB）与 world 预算完全分账；world 首屏可玩 JS ≤ 500KB gzip + lazy assets（SRD NFR-P6 / §12.7.2） |

落点：PRD v1.1（§2.6 三层承诺、HOME-10、LAB-16~18、§7.4 三阶段、§10 阀门、§11 禁令、附录 B 改评）；SRD v1.1（AP-9、C-2/C-3 按路由分层、`budgetClass: 'world'`、§12.7 专章、Phase 2/4 路线、R8 风险）。

---

## 文档关系

```text
master-plan.md          ← 业务总纲（定位、内容规范、视觉定调）
    │
    ├── PRD.md          ← 做什么、为谁做、功能清单、路线图（产品视角）
    └── SRD.md          ← 怎么建、模块怎么拆、技术约束（工程视角）
         │
         ├── implementation-roadmap-birdseye.md   ← 实施路径鸟瞰图：四轨并行排布、Phase Gate 矩阵、关键路径、Spike 执行清单（执行视角）
         ├── homepage-redesign-spec.md            ← Phase 1 首页落地的设计规格（PRD/SRD 的子集执行文档）
         └── bruno-simon-teardown-adaptation.md   ← /world/ Hybrid 决策与整合设计（v1.1 采纳，LAB-16~18 / SRD §12.7 的设计输入）
```

| 文档 | 读者 | 核心问题 |
|------|------|---------|
| **[PRD.md](./PRD.md)** | 产品负责人、内容作者 | 做什么？为谁做？优先级？成功标准？ |
| **[SRD.md](./SRD.md)** | 工程师、Cloud Agent | 系统怎么拆？用什么技术？怎么验收？ |
| **[implementation-roadmap-birdseye.md](./implementation-roadmap-birdseye.md)** | 决策者（5 分钟路径）、施工工程师（30 分钟路径） | 按什么顺序做？谁来做？每步的过门命令与阻断条件？哪里止损？ |

**阅读顺序**：先 PRD 建立产品共识 → 再 SRD 理解架构 → **排期与开工看 `implementation-roadmap-birdseye.md`**（含各轨「开工前必读」清单）→ 首页施工读 `homepage-redesign-spec.md`；涉及 `/world/` 的施工再读 `bruno-simon-teardown-adaptation.md` 与 `bruno-simon-folio-source-teardown.md`。

---

## 关键共识（两份文档共同前提）

1. **两个现有 Demo 是引子，不是终点**——TTS 座舱 + 3D 配置器是 AI Lab「证据工厂」的起点样本。
2. **产品是「个人专业信用系统」**，不是简历站——文字证据（Work/Insights）+ 可交互证据（Lab）双向挂钩。
3. **硬约束不变**：GitHub Pages 纯静态、Lighthouse ≥ 95、首页 < 200KB、保密分级前置。
4. **炫技放行条件**：炫的正是你卖的能力（座舱 / 多语种 / 端云 / AI 工作流）。
5. **HTML 是宪法，3D 世界是 opt-in 公民**（v1.1）：`/world/` 不承载任何独占信息，删除整个世界站点零损失；进入永远是显式选择（PRD §2.6 / SRD AP-9）。

---

## 数量级速查

| 维度 | PRD | SRD |
|------|-----|-----|
| 功能需求 | **69 条**（P0/P1/P2 + MVP/V1/V2；v1.1 新增 HOME-10、LAB-16~18） | — |
| 子系统 | 六大导航 + Lab 证据工厂 | **6 个子系统**（Content / Presentation / Lab / Build / Analytics / SEO）；world 为 Lab 子系统单例旗舰模块（非平行子系统） |
| 未来 Lab | **9 个构想**（V1 优先 3 个；第 9 号 = `/world/` Hybrid 旗舰，独立走三阶段门禁） | 可插拔 manifest + `mount()` 契约（模式：full / viewer / world） |
| Persona | **4 类**（OEM、猎头、同行、媒体） | — |
| 演进阶段 | MVP → V1 → V2 | Phase 0 → 4（门禁式；Phase 2 尾项 world Spike、Phase 4 world B/C 收编） |

---

## 下一步

| 优先级 | 动作 | 依据 |
|--------|------|------|
| P0 | 评审并冻结 PRD/SRD v1.1 与实施路径鸟瞰图 | 本文档 |
| P0 | Phase 1：首页五区块 + Content Collections + CI 门禁（Track A + D） | SRD §13 Phase 1 / 鸟瞰图 §5 |
| P1 | Lab 子系统化（manifest 收编两个引子 Demo，Track C）——world 启动的前置条件 | SRD §12 / 鸟瞰图 §4.3 |
| P1 | V1 三个新 Lab（端云可视化 / Prompt 对比台 / 多语种 QA） | PRD §7.2 |
| P2 | World Phase A Spike（`/world-spike/` 隐藏路由，可丢弃，Track B） | PRD §7.4 / SRD §12.7 / 鸟瞰图 §7 |
| P2 | master-plan 第 6 章豁免修订（Hero + 循环动画 + world 三条一次做完）——鸟瞰图关键路径阻塞项 B0 | SRD §14.4 / adaptation §10.3 M1 |

排期总视图、四轨里程碑、Phase 0→4 Gate 交叉矩阵与风险登记簿见 [implementation-roadmap-birdseye.md](./implementation-roadmap-birdseye.md)。
