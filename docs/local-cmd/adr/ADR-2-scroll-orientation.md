---
id: ADR-2
title: 手卷横向平移 vs 纯竖滚
status: accepted
date: 2026-09-04
decided_by: 草案 §附录（line 309）「移动端纯竖滚，不做横向平移」+ TECH-ARCH §3
---

# 决定

**桌面：竖向滚动驱动横向手卷**；**移动端：纯竖滚，不做横向平移**。

- 唯一输入是页面的竖向滚动 progress，由 sticky 长区间（S0–S6 合计 ≈600–800vh）产出：
  `progress = clamp(-rect.top / (scrollHeight - innerHeight), 0, 1)`，再分段映射到手卷 `translateX`、S0 模拟时间、S1 月份轴、题跋进场。
- 🔴 **禁 `wheel + preventDefault`**（TECH-ARCH §3 原话）：劫持滚轮会破坏浏览器原生滚动、触控板惯性与可访问性，且在 iOS 上不可靠。
- 刷新落在中段时按当前滚动位置恢复对应帧，不回到起点。

# 为什么不做真横向滚动容器

1. 手卷的**隐喻**只需要"画面横向展开"这一视觉结果，不需要"用户横向操作"这一交互方式；用竖滚驱动即可拿到隐喻，且零学习成本。
2. 真横向容器在移动端与竖向手势冲突，且键盘/读屏用户无自然的横向导航。
3. 竖滚 progress 是**单一真值源**，S0 的模拟时间、S1 的月份轴、手卷位移全部由它派生——避免多个滚动状态互相打架。

# 与降级的关系

`prefers-reduced-motion` 下手卷不平移，五跋改为常规竖向文档流（引擎本身已实测在 RM 下不起 rAF、canvas 隐藏、报 `fallback=reduced-motion`）。
