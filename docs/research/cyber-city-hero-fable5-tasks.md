# Fable5 并行 Task 清单：赛博科技城首屏 — 调研 × Premortem × 原型设计

| 项 | 内容 |
|----|------|
| 版本 | v0.1 |
| 日期 | 2026-08-25 |
| 指派 | **Fable5**（`claude-fable-5-thinking-xhigh`，见 `AGENTS.md` §2） |
| 设计母稿 | `docs/research/cyber-city-hero-design-proposal.md` |
| 分支建议 | `cursor/cyber-city-hero-design-1d6f`（本 Task 只产文档/原型，不合并 main 直至王磊评审） |
| 模型纪律 | 子代理回复首行自报 model slug；禁止静默降级 |

---

## 总原则

1. **先设计后代码**：本批 Task 禁止改 `src/lab/world/` 生产逻辑；允许 `prototypes/` 与 `docs/spec/assets/design/`。
2. **交叉调研**：每个 Task 至少引用 **3 个外部先例 + 2 个站内文档 + 1 条社区评论**（HN/Reddit/Awwwards）。
3. **Premortem**：Task 1 产总表；其余 Task 在产出末尾填「本 Task 触发的 Premortem 项」。
4. **联网搜索**：用 WebSearch/WebFetch；记录 URL 与访问日期。
5. **本地交叉**：对照 `vendor/folio-2025`、`vendor/folio-2019`（若未 clone 则读 teardown 文档）、`src/lab/modules/car-configurator/`、`docs/research/portfolio-inspiration-*.md`。

---

## Task 1 — 竞品交叉调研 + Premortem 总表

| 字段 | 值 |
|------|-----|
| **ID** | `CC-T1` |
| **标题** | 赛博城市 / 机甲 / 可驾驶 Portfolio 竞品矩阵 |
| **产出** | `docs/research/cyber-city-competitive-research.md` |
| **验收** | ≥15 行对照表（站点、技术栈、入场、导航、变形、移动端、失败评论）；§8 Premortem 10 条每条至少 1 个外部证据链接 |
| **搜索关键词** | `cyberpunk three.js portfolio city`, `robot transform car webgl`, `jesse zhou ramen`, `night city rapier`, `drive portfolio F1 three.js`, `hektek city r3f`, `mecha portfolio wireframe` |
| **站内交叉** | `portfolio-inspiration-community.md` §3.2、`bruno-simon-teardown-index.md` |
| **工时** | 中 |

---

## Task 2 — 视觉方向 + 情绪板（Art Direction）

| 字段 | 值 |
|------|-----|
| **ID** | `CC-T2` |
| **标题** | 座舱科技城视觉规范与情绪板 |
| **产出** | `docs/research/cyber-hero-art-direction.md` + `docs/spec/assets/design/cyber-hero/moodboard-*.png`（≥4 张：机器人态/车态/夜景/ HUD） |
| **验收** | 色板 ≥5 色（含工业橙锚点）；霓虹规则（emissive 强度上限）；雾与 bloom 档位表；**明确写「禁止 Transformers 可识别元素」** |
| **参考** | Jesse Zhou 青/ Teal；Cyberpunk 2077 UI 仅参考色不抄标；master-plan 第 6 章克制 |
| **交叉** | `homepage-redesign-spec.md` tokens、`car-configurator` 车漆色 |
| **工时** | 中 |

---

## Task 3 — UX 线框：首屏信息架构与动线

| 字段 | 值 |
|------|-----|
| **ID** | `CC-T3` |
| **标题** | 首屏 UX 线框（桌面 1440 + 移动 375） |
| **产出** | `docs/research/cyber-hero-ux-wireframes.md` + wireframe PNG |
| **验收** | Tab 顺序图；0s/5s/30s 三条用户路径（猎头/同行/自己人）；八跳过出口初版（对齐 LAB-18）；reduced-motion 态线框 |
| **交叉** | `PRD.md` §2.6 三层承诺、`human-gate-checklist` Persona 2 |
| **工时** | 小 |

---

## Task 4 — 变形仪式分镜 + 动效规格

| 字段 | 值 |
|------|-----|
| **ID** | `CC-T4` |
| **标题** | 机器人→车 变形分镜与时长表 |
| **产出** | `docs/research/cyber-city-transform-storyboard.md`（6–8 格分镜 + 毫秒时间轴） |
| **验收** | 与 `TransformSystem` 状态机字段对齐（`robot_idle`/`transforming`/`car_idle`）；gsap 禁止，仅 ticker 缓动；音效点位标注（可 Phase C） |
| **交叉** | `bruno-simon-folio-source-teardown.md` §10 morph、`folio-2019` 落地弹跳、`audit-report-v1.1` M-4 |
| **工时** | 小 |

---

## Task 5 — 机器人造型 Brief + 资产合规

| 字段 | 值 |
|------|-----|
| **ID** | `CC-T5` |
| **标题** | 原创机甲机器人造型 Brief 与版权红线 |
| **产出** | `docs/research/cyber-hero-robot-art-brief.md` |
| **验收** |  silhouete 描述、身高比例、胸甲 HUD 区、配色；**CC0/自制/采购** 三条资产路线对比表；Sketchfab 等候选 ≤5 个并标注许可；体积目标 ≤800KB |
| **搜索** | `low poly robot glb cc0`, `mecha robot glb license commercial` |
| **交叉** | `material-security-grading.md`、`THIRD-PARTY-NOTICES` 模板 |
| **工时** | 中 |

---

## Task 6 — 性能预算与加载剧本

| 字段 | 值 |
|------|-----|
| **ID** | `CC-T6` |
| **标题** | 首屏 3D 性能预算与加载时间剧本 |
| **产出** | `docs/research/cyber-hero-performance-budget.md` |
| **验收** | 分项表：HTML 壳 / 城剪影 / 四楼 / 机器人 / 车 / 粒子；首包 ≤2MB；Fast 4G 下机器人可见 ≤2.5s 推算；移动端降档阶梯（与 Quality.ts 对齐） |
| **交叉** | `audit-budget.mjs`、`SRD` §12.7.2、`world-spike-log.md` 帧率证据 |
| **工时** | 小 |

---

## Task 7 — 3D 场景蓝图（布局坐标 + 灯光）

| 字段 | 值 |
|------|-----|
| **ID** | `CC-T7` |
| **标题** | 赛博城首屏 3D 场景技术蓝图 |
| **产出** | `docs/research/cyber-hero-scene-blueprint.md` |
| **验收** | 四座楼世界坐标表；相机/灯光 rig 参数；图层 Z 序；与 `CyberCityScene.ts` 目录一一对应；远景楼实例化策略 |
| **交叉** | `cyber-city-hero-design-proposal.md` §3、`src/lab/world/rendering/` |
| **工时** | 中 |

---

## Task 8 — 可点 HTML 灰盒原型（零 GLB）

| 字段 | 值 |
|------|-----|
| **ID** | `CC-T8` |
| **标题** | 首屏交互灰盒（CSS + 占位几何） |
| **产出** | `prototypes/cyber-hero/index.html`（单文件或 Astro 隔离页） |
| **验收** | 可演示：假变形（CSS）、四楼 chip 可点、跳过 3D、键盘 Tab；**不**引入 three；供王磊 5 分钟手势评审 |
| **注意** | 若 repo 禁止 `prototypes/`，改 `src/pages/prototype/cyber-hero.astro` + `noindex` |
| **工时** | 小 |

---

## 依赖关系

```text
CC-T1（调研）────┬──→ CC-T2（视觉）
                 ├──→ CC-T3（UX）
                 ├──→ CC-T5（机器人 Brief）
                 └──→ CC-T6（性能）

CC-T4（变形）─── 依赖 T1 + T4 分镜可参考 T2 色光

CC-T7（场景蓝图）── 依赖 T2 + T3 + T6

CC-T8（灰盒）── 依赖 T3 线框（可最先给王磊看）

并行建议：T1 先行 4h → T2/T3/T5/T6 并行 → T4/T7 → T8
```

---

## 评审 Gate（王磊）

| Gate | 条件 | 通过后 |
|------|------|--------|
| **G0** | 本设计提案 §6 决策表签字 | 开 Task 1–8 |
| **G1** | T1+T3+T8 评审通过 | 锁 UX 不动 |
| **G2** | T2+T4+T5 评审通过 | 锁视觉与变形 |
| **G3** | T6+T7 评审通过 | 开工程 Epic「首屏实现」 |

---

## 工程 Epic 预告（Gate G3 后，不在本批）

> **已被取代（2026-08-25 CC-IMPL1）**：本节 E1–E3 三行预告升格为下方「工程 Epic（CC-IMPL1 定稿）」，以 `cyber-city-implementation-plan.md` 为唯一施工依据。注意两处口径变化：① `hero-cyber-city` 独立模块**不建**（Premortem P9 双引擎分裂），赛博城落 `src/lab/world/city/` 内容层；② 主题楼由 4 栋扩为 10–20 槽（Phase 1 点亮 12 栋 POI）。

| Epic | 内容 |
|------|------|
| E1 | ~~`hero-cyber-city` 模块 + `/` 壳页~~ → 见 CC-E3/E4/E7 |
| E2 | ~~机器人 GLB 入库 + TransformRitual~~ → 见 CC-E5/E6 |
| E3 | ~~Phase 1 世界壳：WASD + 四楼停车场 + VT 进 Lab~~ → 见 CC-E1/E2/E9 |

---

## 工程 Epic（CC-IMPL1 定稿，2026-08-25）

| 项 | 值 |
|----|-----|
| 施工蓝图 | **`docs/research/cyber-city-implementation-plan.md`**（CC-IMPL1，本清单的工程续篇） |
| 决策基线 | 设计母稿 §6 D1–D6 全部拍板 + 大楼 10–20 可扩展硬需求 |
| Gate 制 | Phase 0 首屏炫技可变形可开 → Phase 1 12 楼 POI → Phase 2 进楼展示 → Phase 3 morph 精修 + 音效（实施方案 §2） |
| Task 拆分 | **CC-E1 ~ CC-E10** 十个可并行施工 Task，含文件域与波次编排（实施方案 §7）：波 1 = E1 车 ∥ E3 城 ∥ E5 机器人 ∥ E10 用例骨架；波 2 = E2 合流 ∥ E4 霓虹 ∥ E6 变形首幕；波 3 = E8 门禁 ∥ E9 POI；波 4 = E7 路由原子切换 |
| 合体裁决 | 一套引擎：spike 驾驶腿并入 `src/lab/world/` 后退役，`?impl=` 分叉与 `/world-spike/` 归档（实施方案 §3） |
| 路由 | `/` 世界壳；HTML 五区块迁 `/home/`；`/world/` 不建（实施方案 §4） |
| 性能 | 桌面 60fps / 首包 ≤5MB / 流式 ≤12MB / Quality 0-1-2 三档移动止损（实施方案 §5） |
| 红线 | 禁 React/R3F/gsap/howler；运行时依赖维持 three + rapier（实施方案 §6） |
| 派发纪律 | 分支模板 `cursor/cc-e<N>-<slug>-1deb`；commit 前缀含 Task ID；文件域重叠的 Task 不得同波并行；子代理首行自报 model slug |

---

*Task 清单 v0.1（设计批）+ 工程 Epic 定稿（CC-IMPL1）— 父代理派发时复制对应 ID + 产出路径即可。*
