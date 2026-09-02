# 共享背景（三路 worker 通用，请完整阅读）

## 项目
王磊个人网站（Astro + TypeScript + MDX，GitHub Pages）。定位：**汽车智能座舱与 AI 解决方案经理**；标语：把复杂技术转化为可决策、可交付、可复用的解决方案。三支柱：① 智能座舱多语种 ② 端云大模型 ③ AI 原生工作流。
项目根：`/Users/wanglei/mywebsite`（**只读**，禁止写入任何文件、禁止 git 操作）。

## 赛博朋克城市（首屏 3D 世界）
`src/data/cyber-city-buildings.json` 是唯一数据源。机器人变形为车后可在城里驾驶；每栋楼有 `neonColor`、`parkingBay`（泊车触发圈）、`deepLink`。进楼流程：驶入泊车圈 → 按 E → 0.8s 相机推到 showcase 机位 → 定帧 0.4s → navigate 到 deepLink 页面。
世界里已有可复用数据/机制：`SessionTimeline`（会话埋点：速度、轨迹、事件）、`ExploreProgress`（探索进度）、`SpeedTrap`（超速陷阱）、`Minimap` 小地图传送、`?poi=<id>` 深链停到楼前、Car Configurator 的车辆配置状态。

五大城区 12 栋在册楼（neonColor → deepLink）：
- 南口语言双子：`lingua-tower` 多语种方案塔 #49c5b6 → /work/multilingual-cockpit/；`voice-pod` 座舱语音舱 #ff2d6f → /lab/tts-cockpit/（16 语种 TTS 座舱 demo，已成熟）
- 北城 AI 中枢：`agent-nexus` 主智能体中枢 #a855f7 → /ai-lab/（fallback，机器人形态"老家"）；`edge-cloud-hub` 端云算力枢纽 #22c55e → /work/llm-capability-layering/；`workflow-foundry` AI 工作流工厂 #94a3b8 → /work/ai-native-workflow/；`now-signal` 当前状态塔 #fb7185 → /now/
- 东城出行：`autodrive-lab` 智驾实验楼 #ff6b35 → /work/（fallback，**目前没有对应案例内容**）；`concept-garage` 概念车库 #3b82f6 → /lab/car-configurator/（3D 汽车配置器，已成熟）
- 东南作品：`work-gallery` 交付案例馆 #f59e0b → /work/；`insights-archive` 洞察档案塔 #7dd3fc → /insights/
- 西南个人：`about-pavilion` 个人档案馆 #fef3c7 → /about/；`contact-beacon` 联络信标塔 #a3e635 → /contact/
预留槽位 13–20（外环，可激活）：OTA Depot、NavMap Center、HMI Studio、Acoustics Lab、Career Gate、Skyline Observatory、Multimodal Tower、Safety Center。

## 已拍板的架构决策（不要再争论路线本身，在此框架内发挥）
- **C 全覆盖**：所有正文页在带 `?from=city` 进入时顶部渲染一条"到达横幅"（楼名、该楼 neonColor、玩家驾驶数据），正文保持编辑部纸面风格、LHCI ≥95、零 SEO 影响。
- **B 挑 5–6 栋**：在 `/world/<slug>/` 路由（动效豁免区）做独立轻量"赛博展厅页"：暗底 + 楼 neonColor + **一招鲜交互（≤30 秒能玩懂）** + 底部 CTA 进正文。
- **A 只给 concept-garage**：3D 内景/跨页车辆状态。
- 视觉红线：正文页禁止滚动劫持/视差；`/world/` 内同屏循环动画 ≤5 处；`prefers-reduced-motion` 必须有静态降级；移动端可用。

## 宿主（父代理）已有的初稿创意（供参考、可推翻、请勿照抄）
Lingua Tower 巴别塔电梯（楼层=语种，RTL 层镜像，输入一句话看 39 层字宽热力图）；Voice Pod 声纹立面（外墙随 TTS 频谱呼吸）；Agent Nexus 多智能体指挥塔（父代理/子代理/审计派单流 ops 大屏，进楼车变回机器人）；Edge-Cloud Hub 端云沙盘（算力/时延滑块实时改路由）；Workflow Foundry 两条传送带赛跑；Now Signal 电波塔滚动电报；AutoDrive Lab 试车场报告（把玩家刚才的驾驶轨迹/速度/超速次数打印成测试报告）；Concept Garage 开进来的车=配置器的车，改完出库车真的变了；Works Gallery 霓虹展柜（证据等级=灯亮度）；Insights Archive CLI 检索终端打印热敏纸卡片；About Pavilion 能力星图+履历地铁图；Contact Beacon 选频道发射脉冲。横向：12 栋全亮解锁 Skyline Observatory（站点地图赛博版）。

## 通用纪律
- 唯一 write root 见各任务书；**项目根只读**；不联网抓取无关内容；不放任何 token/账号。
- 输出中文为主，术语可英文。禁止空话；每条创意必须可落地、有具体交互步骤。
- 不确定的写"待确认"，不要编造王磊的真实项目细节（脱敏红线：不出现真实客户名、内部数据）。
