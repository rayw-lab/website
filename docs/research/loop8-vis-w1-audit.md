# Loop 8 W1 视觉独立审计（CC-AL-VIS-L8-W1-R3）

> 执行模型自报：**claude-fable-5-thinking-xhigh**（R1/R2 零产出 stop，本轮 R3 重派）

| 项 | 审计事实 |
|---|---|
| 审计对象 | `main@dc3f56b`（worktree fresh 构建，审计分支 `cursor/cc-al-vis-l8-w1-r3-1d6f`） |
| 比较基线 | 上次生产登记 `main@b2a59e4`（CC-AL-CAM 独立 71，raw 70.50） |
| 冻结秤 | `docs/research/cyber-city-visual-rubric.md` v1.1（七维锚点 + 帧优先铁律） |
| 环境 | Node v22.14.0、pnpm 10.33.3、Chromium(SwiftShader)、1440×900；`pnpm install --frozen-lockfile` → `pnpm build`（EXIT=0）→ `pnpm preview --port 4331` |
| 状态 | **草稿（DRAFT）**——首帧已取证入库，七维为草稿分；终稿分与 score JSON 登记在本文件后续 commit 收口 |

## 1. Fresh 帧入库登记（取证 B 协议）

| # | 帧 | 入库路径 | 取证参数 |
|---|---|---|---|
| F1 | robot_idle 首幕 | `docs/research/assets/visual-rubric/l8w1-world-robot-1440.webp`（81,194B） | `/website/` 默认路径；`data-state=ready` → `data-world-state=robot_idle` 落定后按规程派发 `visibilitychange(hidden)` 暂停渲染再截；1440×900 CSS px |

（后续帧：`?poi=work-gallery` 鼓塔组合轮廓帧、招牌叙事细读帧、car_ready 帧——取证后补登记本表。）

## 2. 七维草稿分（DRAFT，待终稿合议）

| 维 | 权重 | 上轮（CAM 71） | 草稿 | 草稿依据（F1 帧 + 合流增量） |
|---|:---:|:---:|:---:|---|
| V1 首幕构图 | .20 | 65 | **72** | F1：机器人主体 + 招牌中景 + 雾/地平线辉光远景 ≥3 层纵深；锥桶已撤；构图有斜向张力 |
| V2 光照材质 | .20 | 74 | **75** | F1 首幕机位湿地面反射清晰可见（上轮首幕不入画的扣分点已销）；bloom 纪律不变 |
| V3 色彩氛围 | .15 | 69 | **70** | 主色调统一、HUD/3D 同源；窗格仍见红/青/白/橙多族同框，色相纪律待细读 |
| V4 场景密度 | .15 | 72 | **74** | X3 三层招牌体系 + 全息广告板（AGENT NEXUS 等文字帧内直读）+ X1A-R4 鼓塔几何 + 路灯/站台道具；待 work-gallery 帧核 72–75 门 |
| V5 动效转场 | .15 | 70 | **74** | D10 潜分收账：AL-TRANS-FX GO 建议 74（变形粒子炫技层）；FXN-C3 进站 tween + 招牌 stagger 150ms 逐楼点亮 |
| V6 UI/HUD 整合 | .10 | 73 | **74** | F1：HERO TOWERS 霓虹面板常驻 + 速度表 + hint 丸同族视觉语言 |
| V7 主题原创 | .05 | 75 | **78** | 楼=产品线由 X3 招牌文字实现帧内自明（上轮「靠文案自明」扣分点部分销账） |

**草稿合成**：72×.20+75×.20+70×.15+74×.15+74×.15+74×.10+78×.05 = raw **73.4 → 73**（上轮 71，Δ+2）。

> 反通胀声明：以上为草稿；终稿须逐维引用 ≥1 证据帧 + 锚点段落，与上轮分差 ≥±10 的维写差异说明。V4 的 X1a 72–75 门以 `?poi=work-gallery` 同参帧为准，不以本草稿预支。
