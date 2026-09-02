# Agent Nexus「Agent 能力展示楼」四路调研（2026-09-02）

> 状态：调研收稿，待指挥官拍板方向。未派单、未开工。前序 12 楼脑暴见 `../cc-halls-brainstorm-2026-09-02/`。

## 四路产物

| 文件 | 席位 | 身份 | 一句话结论 |
|---|---|---|---|
| `n1-showcase-grok-4.6.md` | Grok 4.6 xhigh（联网） | modelUsage grok-4.6-build，rc=0 | 业界「哇」已从"会聊天"变成"能回放、能并行、能失败、能举证"；首选形态参考 Traceboard / PAIR 时间线 + Open Agent View 真录像 |
| `n2-webide-grok-4.6.md` | Grok 4.6 xhigh（联网 + 读仓） | 同上 | GH Pages 零后端下**做不了真 IDE**（WebContainers 要 COOP/COEP 头、Monaco 数百 KB、Pyodide 5–7MB）；做「真实会话时间轴指挥台」，MVP ≤3 人日；trace schema 草案 + 今日三路派单可确定性转换 |
| `n3-assets-gemini-3.7-flash.md` | Gemini 3.7 Flash | agy receipt | 真实素材清单 + 可核数字（213+ PR / 20 波次 / e2e 48→86 / 35 份审计 / 多次 NO_GO）；三展项：NO_GO 黑匣子、多模型调度台、200-PR 天梯；五幕叙事 |
| `n4-narrative-gemini-3.7-flash.md` | Gemini 3.7 Flash | agy receipt | 三类受众矩阵；「展示治理比展示代码贵」；A/B/C 三方向 IA；8 条炫技不失信军规；5 个 tagline。**注意：其中 ROI 金额、62→88、"12 次死锁"等数字为示意，未溯源，不得直接上页** |

## 四路收敛点

1. 不做网页端 IDE；做**真实多智能体战役的泳道回放**（父代理 / 实现 / 审计 / 董事会），红灯比绿灯亮。
2. 每个动效背后必须有真实文件：prompts / out / receipt / e2e JSON / SHA256SUMS。
3. 身份核验（`served_model` / `identity_ok` / `fallback`）是本站独有硬门，直接当展品。
4. 默认路径零 key；BYO key 最多做折叠可选项。
5. 挂 `/world/agent-nexus/` 展厅（B 路线），不进 Lab manifest；`hallPath` 加法字段，`deepLink` 仍 `/ai-lab/`。
