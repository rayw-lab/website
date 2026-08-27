# 人工 Gate 执行清单：10 秒定位测试 + 真机帧率录测

> **文档性质**：`goal-progress-status.md`「人工 Gate：待王磊」两项的**执行脚本 + 记录表 + 签字回填区**。自动化五门禁（astro check / build / check-links / audit-budget / e2e）已全绿并持续在 CI 复跑，CI 侧另有 WS-PERF-01 帧率证据包常驻采样（`docs/research/world-spike-log.md` §3.1）；但本清单覆盖的两项**只能真人/真机完成**——CI 环境无被试、无 GPU（SwiftShader 软件渲染），自动化读数是辅助证据与下界参考，**不替代**本清单的判定。
> **执行人**：王磊（§1 被试可另邀，提问、判定与签字不可委托）。
> **回填纪律**：两项完成后按 §4 清单回填本文件与 `goal-progress-status.md`，「目标整体」方可翻绿为完整 Go。

## 0. 快速链接

| 项 | 链接 |
|---|---|
| 本清单（GitHub） | https://github.com/rayw-lab/website/blob/cursor/bruno-implementation-plan-1d6f/docs/spec/human-gate-checklist.md |
| 签署档 `mvp-gate-signoff.md` | https://github.com/rayw-lab/website/blob/cursor/bruno-implementation-plan-1d6f/docs/spec/mvp-gate-signoff.md |
| 进度看板 | https://github.com/rayw-lab/website/blob/cursor/bruno-implementation-plan-1d6f/docs/spec/goal-progress-status.md |
| 证据归档目录说明 | https://github.com/rayw-lab/website/blob/cursor/bruno-implementation-plan-1d6f/docs/spec/assets/human-gate/README.md |
| 集成 PR #12 | https://github.com/rayw-lab/website/pull/12 |

### 测试 URL

| 环境 | 首页（H1） | world-spike（H2/H3） | WebGL 2 腿 |
|---|---|---|---|
| **生产（合并 `main` 后）✅ 已上线**（PR #12 已合并，Pages 部署生效中） | https://rayw-lab.github.io/website/ | https://rayw-lab.github.io/website/world-spike/ | 加 `?gl=1` |
| **合并前（本机 preview）** | `pnpm human-gate:preview` 终端打印的局域网 URL | 同上路径 `/world-spike/` | 加 `?gl=1` |

> **注意**：PR #12 **已合并 `main`**，生产 URL 即为新版 MVP（Pages 部署生效中，若短暂看到旧版稍候刷新即可）。正式签署以生产环境轮次为准（预览轮次在记录表「环境」列注明）。

### 本地命令

**前置**：必须在 **`rayw-lab/website`** 仓库（Astro 个人站），**不是**其他项目（如 `scout-r0`）。根目录应有 `astro.config.mjs`、`src/pages/world-spike/`。

```bash
# 首次
git clone https://github.com/rayw-lab/website.git && cd website
git fetch origin cursor/bruno-implementation-plan-1d6f
git checkout cursor/bruno-implementation-plan-1d6f
pnpm install

# 每次测人工 Gate
pnpm human-gate:preview   # build + 局域网 preview，打印手机可访问 URL
pnpm human-gate:verify    # 回填签署档与证据后校验是否可签署
```

若 `git checkout cursor/bruno-implementation-plan-1d6f` 报 `pathspec did not match`，说明当前目录不是 `website` 仓库或尚未 `git fetch origin`。

## 1. 10 秒定位测试（门禁：通过率 ≥ 80%）

**依据**：PRD §10.2 指标 1（10 秒定位达成率）、PRD 旅程 1 量化验收、HOME-01 验收标准；master-plan §1.2 作用 1。

### 1.1 被试与环境

- 被试 **3–5 人**，画像尽量贴近目标 Persona（猎头/HRBP、行业同行 PM/架构师、业务决策方）；避免让完全知情者（看过本站或参与过评审的人）充数——无法回避时在记录表「画像」列注明，该样本仅作参考不计入通过率；
- 一律**手机端真机浏览器**（非模拟器、非桌面缩窄窗口）；用被试自己的手机 + 日常网络（蜂窝或家用 Wi-Fi），不做缓存预热——首屏加载体验本身是被测对象的一部分；
- 测试 URL：`main` 部署后的 GitHub Pages 生产首页。上线前可用预览环境替代，但需在记录表「环境」列注明，且正式回填以生产环境轮次为准。

### 1.2 执行脚本（每人 ≈2 分钟）

1. 开场白（照读）：「我给你看一个人的个人网站首页，10 秒后我会收回手机，然后问你三个问题。只看，不用点。」
2. 递上手机（首页已加载完成、停在页面顶部），开始计时 **10 秒**；到时收回或锁屏；
3. 依次提问三问（不提示、不追问、不解释）：
   - **Q1** 他是谁（职业/领域）？
   - **Q2** 他具体做什么（拿手的事）？
   - **Q3** 找他能干嘛（能帮你解决什么问题）？
4. 逐字记录三问回答（可录音后转写）；**答对 ≥ 2 问 = 该被试通过**（口径 = PRD §10.2 指标 1）；
5. 附加观察（不计分，供改版归因）：被试第一眼停留的区块、复述用词与 H1/副标题的偏差。

### 1.3 记录表（执行时逐行填写）

| # | 日期 | 被试画像 | 设备/浏览器 | 环境（生产/预览） | Q1 回答 | Q2 回答 | Q3 回答 | 答对数 | 通过 |
|---|------|---------|------------|----------------|--------|--------|--------|:---:|:---:|
| 1 | 【待填】 | 【待填】 | 【待填】 | 【待填】 | 【待填】 | 【待填】 | 【待填】 | /3 | ☐ |
| 2 | 【待填】 | 【待填】 | 【待填】 | 【待填】 | 【待填】 | 【待填】 | 【待填】 | /3 | ☐ |
| 3 | 【待填】 | 【待填】 | 【待填】 | 【待填】 | 【待填】 | 【待填】 | 【待填】 | /3 | ☐ |
| 4 | 【待填】 | 【待填】 | 【待填】 | 【待填】 | 【待填】 | 【待填】 | 【待填】 | /3 | ☐ |
| 5 | 【待填】 | 【待填】 | 【待填】 | 【待填】 | 【待填】 | 【待填】 | 【待填】 | /3 | ☐ |

**结果回填**：通过 ___ / ___ 人，通过率 ___ %；判定（≥ 80% 为 Go）：☐ Go ☐ No-Go

**No-Go 处置**：按回答偏差归因（H1 措辞 / 三支柱卡量化锚点 / 视觉层级）→ 首页文案迭代 → 重测。HOME-01 验收标准要求**每次首页改版后重测**，本表可复制为新轮次追加。

## 2. 真机帧率录测（Spike 门禁：桌面 60fps / 中端安卓 30fps）

**依据**：roadmap §7.3 Step 9 与验收矩阵 Track B 行（「桌面 60fps / 中端安卓 30fps【人工录测】」）；止损判据 RR-04 → RR-01（中端安卓持续 < 24fps 且三板斧无效）。
**自动化辅助证据（已就位，不替代本节）**：WS-PERF-01 每次 `pnpm test:e2e` 产出 SwiftShader 下界读数 + 帧间隔分布 + 环境指纹（`world-spike-log.md` §3.1）；本节产出的才是门禁判定读数。

### 2.0 公共准备

- 测试对象：`/world-spike/`——生产部署地址，或 `pnpm build && pnpm preview` 的本地产物（记录表注明；**不测 dev server**，与 E2E 口径一致）；
- 每台设备两腿：默认后端（WebGPU 可用则 WebGPU）+ `?gl=1` 强制 WebGL 2（roadmap「双后端复测」口径：渲染差异容忍，功能零差异 + 帧率同门禁）；
- 每腿动作脚本统一（保证读数可比）：进入试验场 → 连续驾驶，途中包含 **2 次急转 + 1 次撞锥桶 + 1 次 Shift boost 直线**；
- 留档三件套：**① 全程录屏**、**② 驾驶尾段 HUD 截图**（「FPS 均值 / 1% low」读数与后端徽标清晰入镜）、**③ 记录表一行**（§2.3）。归档位置 `docs/spec/assets/human-gate/`，命名 `fps_<desktop|android>_<webgpu|gl2>_<yyyymmdd>.<mp4|png>`；录屏过大可存网盘并在记录表贴链接。

### 2.1 桌面 Chrome（门禁：原生均值 ≥ 60fps；4x throttle 无长帧尖峰）

1. 桌面 Chrome（最新稳定版）打开 `/world-spike/` → 进入试验场，确认后端徽标；
2. DevTools → Performance → 录制 **20s 连续驾驶**（按 §2.0 动作脚本）→ 停止；
3. 读数：Performance FPS 轨道均值为主，HUD「FPS 均值 / 1% low」互证；**门禁：无 throttle 下均值 ≥ 60fps**；
4. 复测一遍 CPU 4x slowdown（近似低端桌面）：允许均值下降，但 **无长帧尖峰**（Performance 轨道无红色长任务连片、肉眼无卡停）；
5. `?gl=1` 腿重复步骤 1–3。

### 2.2 中端安卓 Chrome（门禁：持续 ≥ 30fps；< 24fps 触发三板斧）

1. 设备选型：**2019 年后中端档**（Adreno 61x / Mali-G5x 级，如骁龙 675/730/765G 机型）。旗舰机读数不作门禁依据（可另记一行作参考，判定列画「—」）；
2. USB 连接电脑 → 桌面 Chrome 打开 `chrome://inspect` → 手机 Chrome 打开 `/world-spike/` → inspect 远程调试；
3. 触屏摇杆**连续驾驶 60s**（按 §2.0 动作脚本）；
4. 读数：HUD「FPS 均值 / 1% low」为主（远程 DevTools Performance 为辅）；**门禁：持续 ≥ 30fps**；
5. `?gl=1` 腿重复步骤 2–4；
6. **不达标处置**（roadmap §7.3 Step 9 / RR-04）：持续 < 24fps → 依次上三板斧（DPR 1.5→1、关装饰细节、锥桶/轮胎墙实例减半）并逐项复测留档；三板斧后仍 < 24fps → 触发止损裁决（Spike 归档为 ai-lab 实验记录、世界降级 HOME-07/08 保守方案）。**不允许**为凑门禁裁剪 Spike 既有功能（锥桶物理/贴地拟合/HUD 等）后宣称达标——降档只走三板斧白名单。

### 2.3 记录表（每腿一行）

| # | 日期 | 设备（型号/SoC） | 浏览器 | 后端 | 场景/时长 | FPS 均值 | 1% low | 录屏文件 | HUD 截图 | 门禁判定 |
|---|------|----------------|--------|------|----------|:---:|:---:|---------|---------|:---:|
| 1 | 【待填】 | 桌面【待填】 | Chrome 【待填】 | WebGPU | 驾驶 20s | 【待填】 | 【待填】 | 【待填】 | 【待填】 | ☐ |
| 2 | 【待填】 | 桌面【待填】 | Chrome 【待填】 | WebGL 2（`?gl=1`） | 驾驶 20s | 【待填】 | 【待填】 | 【待填】 | 【待填】 | ☐ |
| 3 | 【待填】 | 桌面【待填】 | Chrome（CPU 4x） | WebGPU | 驾驶 20s | 【待填】 | 【待填】 | 【待填】 | 【待填】 | ☐（无长帧尖峰） |
| 4 | 【待填】 | 安卓中端【待填】 | Chrome 【待填】 | 默认 | 驾驶 60s | 【待填】 | 【待填】 | 【待填】 | 【待填】 | ☐ |
| 5 | 【待填】 | 安卓中端【待填】 | Chrome 【待填】 | WebGL 2（`?gl=1`） | 驾驶 60s | 【待填】 | 【待填】 | 【待填】 | 【待填】 | ☐ |

## 3. 签字与总判定（王磊回填）

| 项 | 判定 | 执行日期 | 签字 |
|----|------|---------|------|
| §1 10 秒定位测试 ≥ 80% | ☐ Go ☐ No-Go（重测排期：____） | 【待填】 | 【待填】 |
| §2 桌面 ≥ 60fps（双后端） | ☐ Go ☐ No-Go | 【待填】 | 【待填】 |
| §2 中端安卓 ≥ 30fps（双后端） | ☐ Go ☐ 三板斧后 Go（改动：____） ☐ 止损 | 【待填】 | 【待填】 |

**总结论（全部判定后填写）**：【待填——示例：「人工 Gate 全部通过，`goal-progress-status.md` 目标整体翻绿为完整 Go」/「安卓腿触发三板斧后 Go，参数改动已记录」/「触发止损，按 RR-01 路径执行」】

## 4. 回填动作清单（完成后逐项勾选）

- [ ] 本文件 §1.3 / §2.3 记录表填毕，§3 签字区签署；
- [ ] 录屏与 HUD 截图归档至 `docs/spec/assets/human-gate/`（或记录表贴外链）；
- [ ] `docs/spec/goal-progress-status.md`：「MVP 门禁核对」两项人工 checkbox、「Phase A Spike 门禁核对」人工 checkbox 勾选，「总判定 / Gate 结论」翻绿；
- [ ] `docs/research/world-spike-log.md`：§3 帧率表追加真机读数行（设备 × 后端），§8 条件项闭环；
- [ ] 若走了三板斧或止损：在 `world-spike-log.md` §8 记录裁决过程与参数改动（失败入档同样是信用资产，PRD §7.3 规则 5）。

## 5. 科技城 Phase 0 走查表（CC-E10 预置空表 · 待 CC-E7 路由切换后执行）

**依据**：PRD §7.4 Phase 0 验收门禁（跳过/降级出口逐条人工走查 + Persona 2 门禁）、PRD CITY-09（任一出口失效即 P0 bug）、SRD §12.7.2 预算总表（变形 1.0–1.2s / 机器人可见 ≤2.5s / 加载→可驾驶 ≤8s / 帧率）、SRD §12.7.8 八跳过出口、实施方案 `cyber-city-implementation-plan.md` §2.1 Gate P0 人工项（首幕全流程 / reduced-motion 终态 / `?gl=1` 回退 / 变形→可开零等待 / 桌面 60fps + 1% low ≥45 / 关键帧对照 D3 品质线）。
**执行时机**：CC-E7 路由切换 PR 合并前（合并门禁），对象 = 该 PR 分支 `pnpm build && pnpm preview` 产物或预览部署；正式签署轮次以生产 `/` 为准。
**自动化对应**：`e2e/cyber-city.spec.ts` CITY-E2E-01~06（绿灯后为本表的机器辅助证据；计时门禁的判定读数以本表真机记录为准，CI SwiftShader 读数仅作下界参考）。

### 5.1 首幕全流程走查（六幕前四幕，实施方案 §1.1/§1.2）

| # | 走查项 | 门禁口径 | 实测/观察 | 判定 |
|---|--------|---------|----------|:---:|
| 1 | 幕①打开：定位语 0 秒可读、poster 先显（LCP）、跳过 3D 可见 | 定位语先于 canvas 首帧且永不被遮挡（CITY-02） | 【待填】 | ☐ |
| 2 | 幕②机器人：城市渐亮、机器人光柱显现、≥10 栋楼招牌 stagger 点亮 | 机器人可见 ≤2.5s（Fast 4G 桌面，秒表/录屏计时） | 【待填】 | ☐ |
| 3 | 幕③变形：CTA/Space 触发 → 充能环 → 光幕 → 落地弹跳 | 全程 1.0–1.2s；变形期间按钮 disabled + 进度可见 | 【待填】 | ☐ |
| 4 | 幕④驾驶：车落十字路口、操作提示 ≤1s 出现、WASD 即刻可开 | 变形→可开零等待（终裁 D4）；不允许二次点击 | 【待填】 | ☐ |
| 5 | 加载→可变形计时（Fast 4G throttle） | ≤8s（SRD §12.7.2） | 【待填】 | ☐ |
| 6 | reduced-motion 终态：不自动挂载；显式进入终态直出；变形为即时切换 + 文字提示 | CITY-05 验收 + 实施方案 §1.2 reduced-motion 段 | 【待填】 | ☐ |
| 7 | `?gl=1` 回退：后端徽标 WebGL 2、首幕与变形同样可播 | 功能零差异（TSL 双后端；渲染差异容忍） | 【待填】 | ☐ |
| 8 | 关键帧对照设计稿（D3 品质线：bloom/湿地面反射/体积雾/霓虹） | 不以剪影占位冒充交付（终裁 D3） | 【待填】 | ☐ |

### 5.2 八跳过出口逐条走查（SRD §12.7.8；任一失效 = P0 bug）

| # | 出口 | 验证动作 | 实测 | 判定 |
|---|------|---------|------|:---:|
| ① | 「跳过 3D」→ `/home/`（零 world 字节依赖） | 第 0 秒点击 + Tab 第一焦点；DevTools Network 验证 `/home/` 零 world 请求 | 【待填】 | ☐ |
| ② | 加载屏第 0 秒可跳过 | 挂载进行中点跳过仍即时生效 | 【待填】 | ☐ |
| ③ | 右上角退出常驻 | 世界任意状态下退出可点 | 【待填】 | ☐ |
| ④ | ESC 招聘方速览 → `/work/` | ESC 菜单打开、链接直达 | **已实现**（CC-M11，A4 硬条件 M11 补齐，2026-08-25）：Escape 开合原生 `<dialog>` 菜单（showModal 焦点陷阱 + 背景 inert + Esc 原生可关），含「招聘方速览 → `/work/`」+「内容首页 → `/home/`」+ 关闭；Playwright 冒烟实证 挂载后 Esc → 菜单可见 → 点击直达 `/work/`（截图 `m11-esc-menu.png` 留档） | ✅（冒烟） |
| ⑤ | overlay 即真实 URL（Phase 1 起进楼态） | 前进/后退/直链一致（CC-P0 阶段标注 N/A） | 【待填】 | ☐ |
| ⑥ | 能力降级直达静态壳 / 2D 地图（reduced-motion / 无 WebGL2 / saveData / 触屏窄屏） | 逐条件模拟验证 | 【待填】 | ☐ |
| ⑦ | noscript 楼宇文字列表 + 主导航 | 浏览器禁 JS 后全导航可读可点 | 【待填】 | ☐ |
| ⑧ | `?poi=` 深链直达（Phase 1 起） | 深链出生于对应楼（CC-P0 阶段标注 N/A） | 【待填】 | ☐ |

### 5.3 Persona 2 猎头剧本走查（PRD §7.4，每 Phase 合并前必做）

| # | 步骤 | 口径 | 实测 | 判定 |
|---|------|------|------|:---:|
| 1 | 落地 `/`：DOM 定位语 0 秒可读 | 不慢于纯 HTML 首页时代的定位语呈现 | 【待填】 | ☐ |
| 2 | 第 0 秒点「跳过 3D」 | 唯一允许的增量 = 这一次点击 | 【待填】 | ☐ |
| 3 | `/home/`（或 `/work/`）完成 30 秒路径 | `/home/` 体验零劣化（四项 ≥95 由 CI 佐证） | 【待填】 | ☐ |

### 5.4 真机帧率录测回填位（对象 `/` 科技城；方法论复用 §2.0–§2.2，动作脚本改为「变形 → 十字路口驾驶」）

| # | 日期 | 设备（型号/SoC） | 浏览器 | 后端 | 场景/时长 | FPS 均值 | 1% low | 录屏文件 | HUD 截图 | 门禁判定 |
|---|------|----------------|--------|------|----------|:---:|:---:|---------|---------|:---:|
| 1 | 【待填】 | 桌面【待填】 | Chrome 【待填】 | WebGPU | 变形+驾驶 20s | 【待填】 | 【待填】（门禁 1% low ≥45） | 【待填】 | 【待填】 | ☐ |
| 2 | 【待填】 | 桌面【待填】 | Chrome 【待填】 | WebGL 2（`?gl=1`） | 变形+驾驶 20s | 【待填】 | 【待填】 | 【待填】 | 【待填】 | ☐ |
| 3 | 【待填】 | 安卓中端【待填】 | Chrome 【待填】 | 默认 | 变形+驾驶 60s | 【待填】（门禁 ≥30fps；<24fps 触发降配止损，PRD §7.4） | 【待填】 | 【待填】 | 【待填】 | ☐ |
| 4 | 【待填】 | 安卓中端【待填】 | Chrome 【待填】 | WebGL 2（`?gl=1`） | 变形+驾驶 60s | 【待填】 | 【待填】 | 【待填】 | 【待填】 | ☐ |
| 5 | 【待填】 | 安卓中端（**行 3 同设备**）【待填】 | Chrome 【待填】 | 默认 + `?quality=2` | 变形+驾驶 60s + E 进站 | 【待填】（对照行 3 增益，留档不设门） | 【待填】 | 【待填】 | 【待填】 | ☐（P5：核心路径完成 + 无功能性缺失；帧率只留档） |
| 6 | 【待填】 | 桌面（**行 1 同机**）【待填】 | Chrome 【待填】 + DevTools「Fast 4G」+ 清缓存 | 默认 | 加载 → robot_idle CTA 可用 | 秒表 【待填】s | `funnel.robotIdle` 【待填】ms | 【待填】 | 【待填】 | ☐（P3：两读数较大值 ≤8s；8–10s=70 / >10s=40） |

**行 5/6 增补注记（CC-PERF-HG-PREP 执行性能 rubric §4.1 占位纪律；追加原计划归 PR-C，经顾问报告 `cyber-city-first-score-advisor.md` §3.2 前置至本 doc 腿）**：

- **判定腿全集 = 六行**（`docs/spec/cyber-city-perf-rubric.md` §4.1 只读镜像，本表恒为回填正本与签字位）：行 1–2 计分 P1+P2、行 3–4 计分 P1、行 5 计分 P5（帧率对照行 3 留档不设门）、行 6 计分 P3。P4（预算）由 CI audit-budget 判定，不占本表行。
- **动作脚本（S4 结构门同源口径）**：变形 → 十字路口驾驶，途中 **2 次急转 + 1 次撞道具 + 1 次 Shift boost**（桌面 20s / 安卓 60s；行 5 加 E 进站收尾；行 6 为计时腿不驾驶）——与 CITY-PERF-01 采样脚本同源，为凑读数裁剪即击穿 S4。
- **行 6 列复用**：「FPS 均值 / 1% low」两列改填计时双读数（导航秒表 s / `__worldSession.dump().funnel.robotIdle` ms）；funnel 时基为 world 模块挂载起点、不含壳加载与 world chunk 下载，恒小于秒表——差 >1s 属预期仍须归因一句留痕，**判定取较大值**（rubric §2.2-P3）。
- **三件套命名（城市档六行统一）**：`cityperf_<desktop|android>_<webgpu|gl2|q2|fast4g>_<yyyymmdd>.<mp4|png>`（区别于 §2 world-spike 的 `fps_*`），归档 `docs/spec/assets/human-gate/`；行 3 默认腿 token 按实际后端填，若与行 4 重名则行 3 追加 `-default` 后缀并在记录行注明。
- **逐步执行手册** = `docs/research/cyber-city-perf-human-gate-runbook.md`（设备/浏览器/动作脚本/读数/填表/归档全流程；`/` 城市页无 `[data-ws-fps]` HUD，屏上读数走 `#debug` 面板或控制台 `__worldSpike.fps()`——读数口径详见手册 §1.3）。
- **产不出 = 留空不伪造**（rubric §1 铁律 3 / §5.1 状态机）：行 1–4 任一缺 → P1 `null`；行 1–2 任一缺 → P2 `null`；行 5 缺 → P5 `null`；行 6 缺 → P3 `null`；**任一维 `null` → 登记顶层 `score` 必须 `null` → northStar.perf 仍显 `—`**。豁免走 §5.5 留痕先例，但豁免救不出数字（对应维仍 `null` + `debts` 欠账）；腿→维完整映射与欠账格式见手册 §5。

### 5.5 自动化证据摘要（豁免依据留痕，CC-M11 落账 · A4 硬条件 M12）

对象 = CC-E7 路由切换 PR 交付面（审计 tip `268e99f` + 本 PR M11 ESC 补丁）；数字出自 CC-A4 全量终审独立复跑（`docs/research/cyber-city-phase0-full-audit.md`，2026-08-25）与本 PR 复验，**全部为 CI/SwiftShader 环境自动化读数，不含任何真机帧率数字**：

- e2e 全量 **48 passed / 0 skipped / 0 failed，exit 0**（14.6 分钟）：CITY-E2E-01~06 全绿（壳零 world 字节 / 跳过出口 Tab 第一焦点直达 `/home/` / 变形状态序 + W 即 driving / reduced-motion 终态 / `?gl=1` 回退 / 机器人可见计时采集）；
- LHCI 7 URL × 3 轮全量断言 exit 0：`/` P100 A100 BP96 SEO100；`/home/` 四项全 100；其余五页全 100；
- `audit-budget` 零 ❌（本 PR 复跑，M11 菜单计入后）：G-A′ 壳 HTML+CSS 5.8/35 · 引导 JS 1.5/15 · poster 31.8/40 · 合计 **39.3/90KB gzip**；零 world 静态标签命中 0；G-D 受保护 14 页命中 0；
- A4 运行时冒烟四场景全通（`/` 默认全链变形→驾驶位移实证 / `?poi=lingua-tower` 深链出生 + E 进站直跳 / `?poi=voice-pod` 画面对照 / 内容页零 world 请求）+ 本 PR ESC 冒烟（挂载后 Esc → 菜单 → 「招聘方速览」→ `/work/` 落地）。

**§5 总判定（Go · 人工 Gate 豁免延续留痕，A4 硬条件 M12）**：产品负责人延续 `goal-progress-status.md`「人工 Gate 裁决（2026-08-25）」既有豁免先例（「不执行人工 Gate 流程」「豁免（产品决策，非门禁降级）」）至本路由切换 PR：

| 项 | 口径 |
|---|---|
| 自动化证据覆盖项 | §5.1 项 1/3/4/6/7（定位语与 poster 先显、变形状态序 + CTA disabled、变形→可开零等待、reduced-motion 终态、`?gl=1` 回退——CITY-E2E-01~06 + A4 冒烟）；§5.2 出口①②③④⑥⑦⑧（e2e/冒烟/构建期断言逐条覆盖，④ 由本 PR CC-M11 实现并冒烟实证；⑤ overlay 属 Phase 1 进楼态，表内既有 N/A 标注）；§5.3 Persona 2 三步（CITY-E2E-02 全链 + LHCI `/home/` 四项全 100） |
| 仍欠真人回填项 | §5.1 项 2/5 真机计时（机器人可见 ≤2.5s、加载→可变形 ≤8s @Fast 4G——CI SwiftShader 慢动作读数仅下界参考，不作判定）、项 3 的 1.0–1.2s 变形窗真机计时、项 8 关键帧对照 D3 品质线人工目测；**§5.4 真机帧率全部四行（桌面 60fps + 1% low ≥45 / 中端安卓 ≥30fps，双后端）——云端无真机无 GPU，读数不可诚实产出，留空不伪造** |
| 豁免范围 | **仅限 Phase 0 本次路由切换 PR 合入 `main`**；不构成门禁降级，**不免除 Phase 1 真机走查**——上行欠账项列为 Phase 1 合并前置，回填仍用本表（§5.1/§5.4 复制新轮次追加，正式签署轮次以生产 `/` 为准） |

签字：王磊（产品负责人；豁免延续依据 = `goal-progress-status.md` 2026-08-25 裁决先例，由 CC-M11 按 A4 §6 M12 允许口径落账留痕） 日期：2026-08-25
