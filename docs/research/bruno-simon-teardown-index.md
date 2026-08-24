# bruno-simon.com 深度拆解 — 调研索引

> **调研日期**：2026-08-24  
> **触发**：用户希望效仿 [bruno-simon.com](https://bruno-simon.com/)——首页 3D 炫技（车可变机器人），点击 **Start here** 后在 3D 地图中漫游浏览作品集。  
> **方法**：3 路 Fable5 并行——UX 体验、技术架构、本土化适配；folio-2025/2019 源码 clone 至 `/tmp` 逐文件分析。

---

## 文档地图

| 文档 | 读者 | 核心问题 |
|------|------|---------|
| **[bruno-simon-teardown-ux.md](./bruno-simon-teardown-ux.md)** | 产品 / 设计 | 体验怎么设计？Start here 为何有效？2019 vs 2025 差异？ |
| **[bruno-simon-teardown-tech.md](./bruno-simon-teardown-tech.md)** | 工程师 | Game Loop 怎么搭？WebGPU/TSL/Rapier 怎么用？资产管线？ |
| **[bruno-simon-teardown-adaptation.md](./bruno-simon-teardown-adaptation.md)** | 决策 / 全员 | **推荐怎么做？** Hybrid 路线、试验场世界地图、三阶段计划 |

**建议阅读顺序**：adaptation（结论）→ ux（体验细节）→ tech（实现细节）

---

## 30 秒结论

| 项 | 结论 |
|----|------|
| **是否 Full Clone？** | **否**——Bruno 模式与 PRD 硬门禁（Lighthouse ≥95、10 秒定位）正面冲突 |
| **推荐路线** | **Hybrid**：HTML 首页/内页保留 + 独立路由 **`/world/`**「智能座舱试验场」 |
| **首页体验** | 打开看到 3D 车（Hero 实车舞台）+ **Start here · 进入试验场** 按钮——**不是**全屏 3D 接管 |
| **车→机器人** | **原创增量**（Bruno 无 morph）；叙事：车=交付载体，机器人=座舱 AI 人格化；V1 用遮蔽式变形，V2 再考虑骨骼动画 |
| **技术栈** | folio-2025 与本站配置器**同源**：Three.js TSL + WebGPU/WebGL 双后端 + Draco/KTX2 |
| **工期现实** | Bruno 全职约 **14 个月**（folio-2025）；建议 Phase A Spike → Phase B 最小可玩 → Phase C 完整版，每阶段有止损点 |

---

## Bruno 站核心机制速查

### 体验层（UX）

```text
加载（3D 地面圆环 diegetic loader）
  → 入世（车/角色出生）
  → [2019: Start 按钮解锁音频] [2025: 无 Start，直接玩]
  → 驾驶漫游 14 个空间分区（Work/Lab/About…）
  → 物理交互（撞名字、成就、排行榜）
  → 深度内容：HTML overlay / 外链，非纯 3D UI
```

**最值得抄**：开场 10 秒用「玩」教操作；内容 in-world / 工具 HTML 分界；低配/宕机优雅降级。

**最不该抄**：信息藏在必须驾驶才能找到的地方（HN：「想找信息很折磨」）。

### 技术层（Tech）

```text
Vite + singleton Game class
  → Ticker（order 0→998：Time/Input → Physics → Camera → World → Render）
  → Rapier 物理 + raycast vehicle
  → WebGPURenderer + TSL 材质（palette 合并网格）
  → Blender 关卡命名约定 → GLB → ETC1S/UASTC 压缩
  → 可选 WebSocket 服务器（空则完全离线可玩）
```

**GitHub Pages**：folio-2025 **可完全静态化**（`VITE_SERVER_URL` 为空即降级）。

---

## 本土化：「智能座舱试验场」六分区

| 分区 | 对应导航 | 内容 |
|------|---------|------|
| 出发广场 | Home | Start here 出生点、操作教学 |
| 案例岛 | Work | 三旗舰案例 3D 标牌 + 证据等级 |
| 实验区 | AI Lab | TTS 电台塔 + 3D 涂装车间（现有 Demo） |
| 档案馆 | Insights | 观点文章入口 |
| 控制塔 | About / Now | 讲者简介、近况 |
| 联络站 | Contact | 四方向联系 CTA |

**最强整合**：玩家开的车 = 现有 **Khronos CarConcept**（已在库）；TTS = 现有 mp3 + timeline.json 环境音。

---

## 三阶段实施（adaptation 文档详述）

| 阶段 | 交付 | 止损条件 |
|------|------|---------|
| **Phase A Spike** | 隐藏路由、灰盒场景、车可动、帧率/预算验证 | 移动端 <30fps → 降级为保守 Hero 方案 |
| **Phase B MVP 世界** | Start here + 3 POI + 两个 Demo 空间化接入 | — |
| **Phase C 完整版** | morph、音效、全六分区、成就/彩蛋 | 按数据决定是否投入 |

---

## 对用户愿景的直接回应

| 你的设想 | 方案映射 |
|---------|---------|
| 首页打开就是 3D 炫技的车 | ✅ Hero 实车舞台（poster → WebGPU 自转） |
| 车能变成机器人 | ✅ 试验场内 morph（V1 遮蔽式，叙事绑定端云/AI） |
| 像 Bruno 一样点 Start here | ✅ 首页按钮 → `/world/` 独立加载 |
| 机器人浏览地图看作品 | ✅ 六分区 POI + 标牌橱窗，深度内容 HTML overlay |

| 需接受的修正 | 原因 |
|-------------|------|
| 首页不 100% 全屏 3D 世界 | Lighthouse + 猎头 30 秒路径 |
| 删除 `/world/` 后站点仍完整 | 信用系统不能绑死在游戏里 |

---

## 开源参考

| 资源 | URL | Star |
|------|-----|------|
| folio-2025（现行站源码 + Blender） | https://github.com/brunosimon/folio-2025 | ~1.7k |
| folio-2019（经典开车版） | https://github.com/brunosimon/folio-2019 | ~4.7k |
| Awwwards 案例研究 | https://www.awwwards.com/brunos-portfolio-case-study.html | — |

---

## 后续动作

1. 评审 adaptation 文档第 9 章决策表，确认 Hybrid 路线
2. 按第 10 章修订 PRD/SRD（新增 LAB-16 `/world/`、预算例外等）
3. 启动 **Phase A Spike**（隐藏路由 + 灰盒 + 现有 CarConcept 可驾驶）
