# 赛博城市 / 机甲 Portfolio 竞品交叉调研 + Premortem 证据表

| 项 | 内容 |
|----|------|
| 版本 | v0.1 |
| 日期 | 2026-08-25 |
| Task ID | CC-T1 |
| 执行 | 父代理（Fable5 任务模板见 `cyber-city-hero-fable5-tasks.md`） |
| 方法 | Web 交叉搜索 + 站内 `portfolio-inspiration-*` + folio teardown 对照 |

---

## 1. 竞品矩阵（≥15 条）

| # | 站点 / 项目 | 主人/身份 | 技术栈 | 入场体验 | 导航隐喻 | 变形/载具 | 移动端 | 社区评价摘要 | 链接 |
|---|-------------|-----------|--------|----------|----------|-----------|--------|--------------|------|
| 1 | Bruno Simon 2025 | WebGL 教育者 | vanilla three TSL + Rapier | 地面圆环 loader，任意键入世 | 开车逛分区 | 仅车 | 卡顿/iOS 冻结投诉 | HN「炫的就是卖的」vs「terrible homepage」 | https://bruno-simon.com |
| 2 | Bruno Simon 2019 | 同上 | three + cannon | Start 按钮 + 车落地 | 开车撞名字 | 仅车 | 加载可理解 | Medium 案例研究 | https://bruno-simon.com/2019 |
| 3 | Jesse's Ramen | 咨询转工程 | vanilla three + Blender | 单场景即全貌 | 拉面店分区交互 | 无 | Awwwards HM | **非工程背景转型最相关先例** | https://jessezhou.com |
| 4 | Night City | Cyrus Mobini | three + Rapier + React | 狐狸探索城 | Easter egg 地点 | 无载具变形 | 未详 | GitHub 开源可读 | https://github.com/cyrus2281/night-city |
| 5 | Cyber Megapolis | Farhad Ali 学生 | vanilla three 零构建 | FPS 霓虹街 | 楼=章节终端 E 交互 | 无变形 | 45+ FPS 宣称 | LinkedIn 自述可玩城市 | LinkedIn 帖文 2026-07 |
| 6 | HekTek City v4 | 软件架构师 | R3F + AntD | Imoto 自动导览 | 楼=section | 无 | 未详 | three.js forum showcase | discourse.threejs.org/t/88344 |
| 7 | drive-my-portfolio | Pooja Gosika | R3F + 程序化 | 电影运镜后交方向盘 | 7 区开车 E 进入 | F1 车 | 未详 | 「No scrolling. Just drive.» | github.com/poojagosika/drive-my-portfolio |
| 8 | mecha-portfolio | chiubaca | R3F 线框机甲 | 机甲部位=技能 | 点击部位镜头 | 无 | 线框 Gundam 风 | 部位映射思路 | github.com/chiubaca/mecha-portofolio |
| 9 | NEXUS-9 cyber-portfolio | Simone | R3F + Tailwind v4 | 全屏 3D hero | 画廊浮岛 | 无 | DPR 降档 | 代码雨+城市剪影背景 | github.com/Simone-techAIGC/cyber-portfolio |
| 10 | Jorge 3D Robot | Jorge Cuevas | R3F + Zustand | 互动机器人 |  poke 彩蛋 | 无 | 响应式布局反馈 | discourse 92251 | discourse.threejs.org/t/92251 |
| 11 | Manthan AI Portfolio | Manthan Mittal | Next + R3F | 赛博机器人 hero | 滚动区块 | 无 | TTS 问候 | 霓虹 aesthetic | github.com/manthan291999/webside1 |
| 12 | Henry Heffernan | Vercel 设计工程师 | 3D Win98 模拟器 | 桌面 OS | 窗口=项目 | 无 | 可关模拟器 | Show HN 31313187 | henryheffernan.com |
| 13 | Thibault Introvigne | 创意开发 | R3F | 太空人收集品 | 找 10 个物品 | 无 | 未详 | Blade Runner/Cyberpunk 氛围 | creativedevjobs 博文 |
| 14 | Weisdevice | Xianyao Wei | three + GLSL + GSAP | 小岛机器人玩具 | 旋钮/掌机交互 | 无 | raycast 30fps | Cyberpunk 2077 V 命名 | creativedevjobs 博文 |
| 15 | 本站 car-configurator | 王磊 | Astro + three WebGPU | poster→canvas | Lab 深链 | 无 | 已验证 | 车模管线可复用 | `/lab/car-configurator/` |
| 16 | 本站 tts-cockpit | 王磊 | Astro + 轻量 JS | 海报入场 | 16 语种演示 | 无 | 已验证 | TTS 楼深链目标 | `/lab/tts-cockpit/` |
| 17 | folio-2025 vendor | Bruno | 同上 #1 | Reveal 半径擦除 | POI 系统 | 无 morph | teardown 已拆 | `vendor/folio-2025` | `bruno-simon-folio-source-teardown.md` |

---

## 2. 模式归纳（对本站首屏）

| 模式 | 代表 | 首屏可偷 | 首屏不偷 |
|------|------|----------|----------|
| **单场景高完成度** | Jesse Ramen | 霓虹 bloom 节制、单镜头叙事 | 室内单一景别 |
| **英雄角色站岗** | Jorge Robot / mecha | 中央角色压阵、idle 微动 | 线框审美 |
| **城市=目录** | Megapolis / HekTek / drive-my | 楼招牌、楼=章节 | 首屏就上全图 WASD |
| **载具=导航** | Bruno / drive-my | 落地弹跳、车=同一资产 | 灰盒路面 |
| **变形叙事** | （稀缺） | 遮蔽变形可接受 | 骨骼 IK 首版 |

**结论**：市场上「赛博城 + 机甲站岗 + 一键变车 + 四楼主题」组合 **无直接克隆品**——差异化成立；风险在于执行密度而非创意撞车。

---

## 3. 技术栈对照（坚持本站路线）

| 能力 | 社区主流 | 本站裁决 |
|------|----------|----------|
| 框架 | R3F 占多数 | **vanilla three + TSL**（folio 腿已就位） |
| 物理 | Rapier / Cannon | Rapier（Phase 1 驾驶） |
| UI | React overlay | **DOM HUD + Astro** |
| 后处理 | Bloom 普遍 | 首屏可选半分辨率 bloom，失败回退 |
| 构建 | Vite 普遍 | **Astro + Vite** 已有 |

---

## 4. Premortem 证据表（对照设计提案 §8）

| ID | 失败模式 | 外部证据 | 缓解状态 |
|----|----------|----------|----------|
| P1 | AI 模板赛博脸 | community.md 反模式 8「赛博朋克主题=AI 味」 | 四座座舱主题楼 + 定位语 |
| P2 | IP 机器人 | mecha-portfolio 用 Gundam 参考有争议 | 原创 Brief Task CC-T5 |
| P3 | 加载谷 | HN Bruno「近 1 分钟」「circle then nothing」 | poster LCP + 圆环双锚点 |
| P4 | 变形廉价 | 社区少变形先例，Bruno 仅车 | 光幕+落地弹跳 |
| P5 | 猎头流失 | HN「terrible as homepage」 | DOM 跳过 + 60s CTA |
| P6 | 移动端烫 | HN iOS 冻结 30s | DPR/粒子 rain 关 |
| P7 | PRD 冲突 | PRD §11 赛博禁令 | 修订为座舱科技城 |
| P8 | 范围膨胀 | Megapolis 全 FPS 工程量大 | 首屏红线文档 |
| P9 | 双引擎 | 本站 spike+engine 并存 | hero 模块预置接口 |
| P10 | 霓虹糊字 | canvas-only a11y 批评 | HUD 全 DOM |

---

## 5. 推荐先例优先级（Fable5 深读顺序）

1. Jesse Zhou Medium 案例 + Awwwards 页（气质与转型叙事）
2. Bruno 2019 Medium 案例（车落地教学）
3. drive-my-portfolio README（开车 E 交互流程）
4. folio source teardown §10 morph 插入点
5. 本站 `world-spike-log.md` + `car-configurator` 代码

---

## 6. 未决问题（交王磊 / CC-T2/T5）

- 机器人更「工业试验场」还是更「科幻英雄」？
- 首屏 bloom 开还是仅 emissive（Jesse 半分辨率 bloom）？
- Master Agent 楼是否暂链 `/about/` 直到 Lab 立项？

*CC-T1 v0.1 完成 — 可与其他 Task 并行。*
