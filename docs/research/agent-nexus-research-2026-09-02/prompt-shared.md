# 共享背景（本轮四路调研通用，先读完）

## 我们要做什么
王磊个人网站（Astro + MDX，GitHub Pages 纯静态、零后端、无服务端密钥；项目根 `/Users/wanglei/mywebsite`，**只读**）。首屏是一座可驾驶的赛博朋克 3D 城市，12 栋楼各对应一个站内板块。上一轮已对 12 栋楼做过发散脑暴并存档（`docs/research/cc-halls-brainstorm-2026-09-02/`，可参考，勿重复）。

**本轮聚焦一栋楼**：展示王磊「AI Agent 能力 / 解决方案能力」的专页。形态不限——可以是网页端 IDE、指挥中心式实时回放、交互式案例、或介绍页；**主题不限于汽车座舱**。唯一硬要求：**依然很炫技**（访客 10 秒内"哇"，30 秒内明白他能干什么），同时在 GitHub Pages 静态托管下真能跑。

## 主人是谁
王磊｜汽车智能座舱与 AI 解决方案经理。他不是算法工程师，卖点是「把复杂技术转化为可决策、可交付、可复用的解决方案」。三支柱：智能座舱多语种 / 端云大模型 / **AI 原生工作流**。本楼主要服务第三支柱。

## 他手里真实、可脱敏的 Agent 素材（这是差异化来源，不要编造别的）
1. `AGENTS.md` §4「提分 Loop 编排范式」：父代理只编排、子代理实现/审计分离、董事会触发式终裁、五维硬门（e2e 全绿 / LHCI ≥95 / 视觉双评 |Δ|≤5 / 综合 ≥85）、看板单源。
2. `docs/research/cyber-city-score-loop-orchestration.md` 看板 + 数十份 `cc-loop-*` / `loop*-audit.md` 手记 + `cc-*-evidence/` 证据目录（run-receipt、SHA256SUMS、e2e 结果 JSON）——一段跨两周、200+ PR 的真实多智能体工程编排史，含失败、NO_GO、纠偏。
3. 多模型 worker 直跑体系：Gemini / Grok / GLM / Kimi / DeepSeek 等席位，每席有 receipt（served_model、identity_ok、fallback、sha256、process reaped）身份核验硬门；`~/.codex/state/cc-buildings-brainstorm/` 就是今天刚跑完的一次三路派单实例（prompts/ + out/ + logs/ 可读）。
4. 站内已有 AI Lab 文章《双代理并行 Spike》《16 语种语料流水线》，Lab demo 两个（TTS 座舱、3D 配置器），世界引擎 `src/lab/world/`（three.js webgpu）。

## 技术约束
- 纯静态：无后端、无服务端密钥；可选 BYO key（访客自带 API key 在浏览器端调用）但默认路径必须零 key 可玩。
- 性能门禁：正文页 LHCI 四项 ≥95；重交互页可走 Lab 模块预算（S ≤50KB gzip JS / M ≤300KB）或 `/world/` 豁免区。
- `prefers-reduced-motion` 必须有静态降级；移动端可用；无 Cookie。
- 视觉：暗底 + 单色霓虹（Agent Nexus 楼色 #a855f7 紫）；技术编辑部气质，拒绝营销感。

## 通用纪律
- 项目根只读；只写各自 write root；不放 token/账号。
- 有网的席位可以联网调研，**每个外部案例必须给 URL**，不确定就标"待核"。
- 中文输出，术语英文。结论要具体到"用户做什么→看到什么"，拒绝空话。
