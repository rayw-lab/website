# 共享背景（本轮四路通用，先读完）

## 目标
为王磊个人网站做**第一栋楼：「我是谁」自我介绍页**。要求：**极其炫技**——three.js（WebGPU/TSL）+ 2026 最新最酷的 H5 前端 UI/UX 技术；访客 10 秒"哇"，30–60 秒能复述"他是谁、差异化在哪"。主题不限于汽车座舱。这是形象页，不是简历。

## 站点与仓库（项目根 `/Users/wanglei/mywebsite`，**只读**）
- Astro + TypeScript + MDX，GitHub Pages 纯静态，零后端。
- 首屏已是一座可驾驭的赛博朋克 3D 城市（`src/lab/world/`，three r185 `three/webgpu` + TSL，rapier 物理，WebGPU 优先/WebGL 回退）。城里 12 栋楼对应站内板块；`about-pavilion`（个人档案馆，米色 #fef3c7）目前 deepLink → `/about/`。
- 现有 `/about/`（`src/pages/about/index.astro`）是纸面页，内容骨架已好：①三个"我解决什么问题"（多语种座舱可验收交付 / 端云大模型能力分层 / AI 提效升格为组织流程），各有站内佐证链接；②六站职业演进：物联网 → 整车前瞻 → AR-HUD → 多语种座舱 → 端云大模型 → AI 工作流；③第三人称讲者简介一键复制。
- 定位单源 `docs/website-plan/positioning-onepager.md`：一句话定位「汽车智能座舱与 AI 解决方案经理」；标语「把复杂技术转化为可决策、可交付、可复用的解决方案」；差异化 = 汽车 × 座舱 × 多语种 × 大模型 × AI 工作流 × 项目交付的交叉（master-plan §1.3 有一张六向 mindmap）；两个岗位入口（汽车 AI 座舱方向 / AI 提效 Agent 方向）。
- **现成化身资产**：`public/models/hero-robot/HeroRobot.glb`（CC0，338KB Draco，Idle/Walk 两剪辑，材质 Main/Accent/Grey/LightGrey/Black/Eye，眼睛青色 #49c5b6 emissive 呼吸灯）。它是首屏机器人形态——变形成车之前的"他"。About 楼可以是机器人的"老家"。
- 视觉基调：暗底 + 单色霓虹、技术编辑部 × 工业设计，拒绝营销感与模板感；字体中文思源黑体栈 / Inter / JetBrains Mono。
- 门禁：正文页 LHCI 四项 ≥95；重交互页可走 `/world/` 豁免区或 Lab 预算（S ≤50KB gzip JS / M ≤300KB；world 单例 ≤900KB）；`prefers-reduced-motion`、无 WebGPU/WebGL、移动端、无 JS 都必须有体面的静态版本；无 Cookie。
- 上一轮脑暴/调研存档可参考（勿重复）：`docs/research/cc-halls-brainstorm-2026-09-02/`、`docs/research/agent-nexus-research-2026-09-02/`。

## 未定事项（各路请给建议，不要替主人决定）
- 是否使用真人照片/真人 3D 扫描：**未知**，默认假设不用真人脸，用化身/抽象表现。
- 是否有声音/手写/签名等个人素材：未知。
- 本页路由：可能是重做 `/about/`，也可能是 `/world/about-pavilion/` 新页，正文 `/about/` 保留纸面版。

## 通用纪律
- 项目根只读；只写各自 write root；不放 token/账号。
- 联网席位每个外部案例必须给 URL，不确定标"待核"。
- 中文输出，术语英文。每条创意写到"用户做什么→看到什么"，拒绝空话。不编造主人经历。
