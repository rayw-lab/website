# 个人网站「炫技升级」调研索引

> **调研日期**：2026-08-24  
> **触发原因**：当前首页为占位页，视觉与专业定位不匹配；需对标 GitHub / Reddit / HN 社区最佳实践，制定高水准改版路线。  
> **执行方式**：4 路 Fable5（`claude-fable-5-thinking-xhigh`）并行调研 + 1 路汇总执行方案。

---

## 文档地图

| 文档 | 内容 | 读者 |
|------|------|------|
| [portfolio-inspiration-github.md](./portfolio-inspiration-github.md) | Top 15 参考站/Repo、技术栈趋势、架构模式、GitHub Pages 可落地炫技 | 技术选型 |
| [portfolio-inspiration-community.md](./portfolio-inspiration-community.md) | Reddit/HN 社区共识、反模式、职业差异、讨论帖索引 | 定位与内容策略 |
| [portfolio-inspiration-tech-showcase.md](./portfolio-inspiration-tech-showcase.md) | 炫技技术矩阵、5 套 Hero 方案、性能预算、Demo 整合 | 前端实现 |
| **[homepage-redesign-spec.md](./homepage-redesign-spec.md)** | **可直接开发的改版规格书**（视觉 token、组件清单、三阶段计划、验收标准） | **开发落地（首选入口）** |

---

## 核心结论（30 秒版）

1. **坚持 Astro，不迁框架**——2024–2026 内容型个人站收敛到 Astro；本项目已有 TTS + WebGPU 3D 资产，换栈收益为负。
2. **社区放行炫技的唯一条件**：「炫的正是你卖的能力」——TTS 座舱 + 3D 车模是正确方向，但必须内页化、不绑架首页性能。
3. **推荐 Hero 主方案**：「实车即首屏」——复用现有 WebGPU 配置器 + poster 懒加载，首屏增量约 33KB，Lighthouse 预算成立。
4. **降级方案**：「座舱 HMI 开机序列」——零 WebGL，纯 CSS + 排版，岗位语境更对口。
5. **技术路线**：平台原生（View Transitions + scroll-driven CSS）为骨架 → GSAP 首屏编排（已全插件免费）→ 现有 Demo 升格为首页证据卡片。
6. **美学定位**：「技术编辑部 × 夜间座舱 HUD」——专业感 > 纯玩具感；工业橙强调色，拒绝 AI 味蓝紫渐变。

---

## 参考站点速查（社区 + GitHub 双榜交集）

| 站点 | 为什么看 | 学什么 |
|------|---------|--------|
| [brittanychiang.com](https://brittanychiang.com) | 工程师简洁风事实标准 | 信息架构、编号章节、featured 项目布局 |
| [craftz.dog](https://craftz.dog) | 轻 3D + 内容平衡 | 首屏 voxel 点缀 + 克制排版（最接近本站定位） |
| [joshwcomeau.com](https://joshwcomeau.com) | 交互式技术博客天花板 | MDX 内嵌可玩 widget——TTS 波形/座舱 timeline 可复刻 |
| [bruno-simon.com](https://bruno-simon.com) | 3D portfolio 水位线 | WebGPU+TSL 管线（folio-2025 开源） |
| [leerob.com](https://leerob.com) | 管理者型 writing-first | 极简性能 + 观点建立影响力 |
| [antfu.me](https://antfu.me) | 克制生成艺术 | canvas 一次成画 + View Transition 暗色切换 |

---

## 社区 Top 5 共识（必须满足）

1. **10 秒定位**：首屏说清「我是谁、做什么、找我能干嘛」
2. **案例叙事**：问题 → 方案 → 结果，不是技能条堆叠
3. **少而精**：3–5 个旗舰案例，每个讲透
4. **性能即人品**：Lighthouse ≥ 95，招聘方真的会跑
5. **移动端优先**：链接多在手机/WhatsApp 里打开

## 社区 Top 5 反模式（必须避免）

1. 强制 preloader / 开场动画才能看内容
2. 纯简历 PDF 搬运 / 技能百分比条
3. Lighthouse Performance < 80 还自称性能专家
4. 「AI 味模板脸」——蓝紫渐变 + 通用 Inter 排版
5. 炫技与岗位无关（星空背景、流体模拟与座舱/AI 无关）

---

## 下一步行动

| 优先级 | 动作 | 负责文档 |
|--------|------|---------|
| P0 | 按 `homepage-redesign-spec.md` Phase 1 实现首页 MVP 视觉升级 | homepage-redesign-spec |
| P0 | 补 master-plan 第 6 章豁免条款（Hero 实时渲染层、循环动画配额） | tech-showcase 附录 A |
| P1 | ClientRouter + view-transition-name morph 跨页转场 | tech-showcase §1 |
| P1 | Hero 实车首屏 + AI Lab bento 入口 | homepage-redesign-spec |
| P2 | GSAP SplitText/ScrambleText 多语种字符入场 | tech-showcase §1.2 |
| P2 | TSL 自定义车漆 shader 试验 | github 调研 §2.2 |

---

## 调研子代理

| 任务 | Agent ID | 产出 |
|------|----------|------|
| GitHub 调研 | bc-c05a15d2-47ea-55de-99d5-b716815e2c68 | portfolio-inspiration-github.md |
| Reddit/社区调研 | bc-4fb04140-f834-5f47-9710-f27df7dec739 | portfolio-inspiration-community.md |
| 炫技技术调研 | bc-99b704aa-a896-5ff6-a025-ddc7dbd8ee64 | portfolio-inspiration-tech-showcase.md |
| 首页改版规格 | bc-c46f568a-1ee6-5e1c-ad94-e70166079af3 | homepage-redesign-spec.md |
