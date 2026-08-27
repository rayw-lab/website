# Cyber City Loop 6 相机集成独立审计（CC-AL-CAM）

| 项 | 内容 |
|---|---|
| 审计角色 | CC-AL-CAM · GPT-5.6 Sol 独立审计 |
| 审计对象 | `main@b2a59e4323db1cd8fbe5db3225b2d8248ffa7c6b` |
| 相机实现 | PR [#45](https://github.com/rayw-lab/website/pull/45) · `e94159a362787ef614048e8c46fac587b5c27289` · merge `5152c8437b701df5e54bda829aee6f7cc730ba73` |
| 审计分支 | `cursor/cc-al-cam-audit-1d6f` |
| 日期 | 2026-08-27（UTC） |
| 独立视觉建议 | **71/100**（raw **70.50**；生产登记基线 70） |
| 综合建议 | **92.8/100**（`availableWeight=1`、`missing=[]`） |
| 裁决 | **GO** |

## 0. 裁决

**GO。** Loop 6 的七项指定硬门全部通过：

1. PR #45 exact runtime/test tree 的完整 Playwright 链为 **52/52**；审计 tip 相对该提交的
   `src/`、`e2e/`、Playwright 配置及依赖树差异为 0；
2. `node tools/camera/audit-shot-ndc.mjs` 为 **7/7 PASS**；
3. 无 `?shot=` 的 ritual 路径未加载 CameraShots、未应用 shot，注册值与 `View.ts`
   合同逐值相等，VIS-03 通过；
4. `concept-garage` showcase 的楼体包络 **8/8 角入帧**，运行时确实应用注册位姿；
5. 没有 free-roam 控制面，第一次 `W` 驾驶意图恰好释放一次 shot 并恢复跟随参数；
6. PR #45 与 pre-CAM `main` 的 `/`、`/home/` LHCI 四分类三轮中位数均为
   **100/100/100/100**，逐项 delta 为 0；
7. `public/posters/` 在相机 merge 前后对象 id 完全一致、diff 为 0。

父代理可登记本报告的独立建议值；本审计分支不修改生产 score JSON 或编排看板。

## 1. 硬门证据

| 硬门 | 独立结果 | 判定 |
|---|---|:---:|
| e2e 52/52 | PR #45 exact 集成分支完整运行 `52 passed (25.8m)`；本地 `retries=0`。审计时 VM load average 为 10.9–14.6，另一个完整 SwiftShader suite 正在运行，因此未再并发启动第三套全量链；`git diff --exit-code e94159a..b2a59e4 -- src e2e playwright.config.ts package.json pnpm-lock.yaml` 为 0，证明审计 tip 的 runtime/test tree 与这次 52/52 完全相同。PR #45 同 SHA CI [33039446671](https://github.com/rayw-lab/website/actions/runs/33039446671) 亦为 green | ✅ |
| NDC probe | **7/7 PASS**；`poi_showcase-concept-garage` 的 `maxAbsNdcX(0.85)` 与 `inFrame` 两门均过 | ✅ |
| VIS-03 / ritual identity | 注册值精确为 `φ75° / θ25° / drift1.1° / radius 16–26 / baseRatio .6 / ratioOffset 9 / lookAt 3.4 / lateral 4.2 / FOV42`；无-shot fresh runtime 中 `shotBaseline=null`、tracking/magnet=true、CameraShots resource=0、camera log=0；exact e2e 的 VIS-03 PASS | ✅ |
| concept showcase whole-frame | fresh URL `?poi=concept-garage&shot=poi_showcase-concept-garage` 应用 `φ75° / θ−67° / radius90 / lookAt7 / lateral0`；焦点 `(140,0,−44)`、玩家出生 `(140,−18)`；楼体包络 8/8 入帧，`x_ndc=[−0.696,0.432]`，整楼横跨约 **56.4%** 帧宽 | ✅ |
| G5 / release | 禁用面搜索无 `camera-controls`、Orbit/Map controls 或 `freeCamera`；runtime 第一次 `W` 后 release log 恰好 1 条，恢复 `θ25° / radius16–26 / lookAt3.4 / lateral4.2` 与 tracking/magnet=true | ✅ |
| LHCI `/`、`/home/` 不降 | pre-CAM run [33040913969](https://github.com/rayw-lab/website/actions/runs/33040913969) 与 PR #45 run [33039446671](https://github.com/rayw-lab/website/actions/runs/33039446671) 各 3 轮：两路四分类均全 100，八项 delta 全 0 | ✅ |
| `public/posters/` zero diff | merge 第一父提交与 merge 结果的四个 poster blob id 逐个一致；`git diff --exit-code ... -- public/posters` 为 0 | ✅ |

### 1.1 ritual / poster 合同解释

VIS-03 是时间相位会变化的非像素基线取证帧，仓库协议本身不要求把两次 PNG 文件 hash
当作恒等证明。这里的“逐字节恒等”按 poster 合同的可复现口径由四层证据闭合：

- `ritual_idle` 注册数字与既有 View 合同逐值相等；
- 无 `?shot=` 时 CameraShots chunk/resource 数为 0，`applyShot()` 零调用；
- `View.update()` 的既有相机解算段在 PR #45 中零改动，新增方法只在 opt-in shot 路径调用；
- `public/posters/` Git blob id 前后完全一致。

审计 fresh no-shot 截图同时确认 robot_idle 构图、主体、HUD 与跟随状态正常。

### 1.2 showcase 与释放

解析 NDC 与 fresh runtime 相互独立：

- 解析层按注册表重建 PerspectiveCamera，目标楼八角点全部在视锥内；
- 浏览器层实际读到 shot 锚点、球坐标、视线高与定距，且画面同时显示完整屋顶、基座、
  南/西立面、楼名牌、道路与 POI 圈；
- 相机是数据预设，不接受鼠标自由旋转；首个驾驶意图后一次性监听拆除并回到玩家跟随。

## 2. 视觉复评

沿用生产登记 CC-AL-BL1 的 rubric v1.1 向量，只给相机本批可归因收益，不把已有楼体、
招牌、材质或道路重复计分。

| 维 | 生产基线 | CC-AL-CAM | 依据 |
|---|---:|---:|---|
| V1 首幕构图 | 65 | **65** | 无-shot robot_idle 与 poster 合同不变；showcase 是 opt-in POI 帧，不冒充首幕 definitive shot |
| V2 光照材质 | 74 | **74** | 相机没有新增材质、光照或后处理 |
| V3 色彩氛围 | 69 | **69** | 色板与明暗节奏不变 |
| V4 场景密度 / whole-frame | 70 | **72** | 新固定 shot 首次让 concept-garage 完整楼体、两面立面、楼名牌、道路与 POI 圈在正常整帧同时可读；8/8 NDC 与 fresh 帧闭合此前“只能看裁切/近景”的取景缺口。仍只到 70–85 段下部：当前 main 上该楼仍是程序化盒体，远景紫色体块平、街道生活与手工细节不足 |
| V5 动效转场 | 70 | **70** | shot 为挂载期直切；无 tween、巡礼编排或新镜头运动，不因“有预设”虚加动效分 |
| V6 UI/HUD | 73 | **73** | DOM/HUD/poster 未改 |
| V7 原创叙事 | 75 | **75** | 专用取景提高可见性，但没有新增叙事物件，不重复计算楼名与 POI |

```text
65×.20 + 74×.20 + 69×.15 + 72×.15 + 70×.15 + 73×.10 + 75×.05
= 70.50 → 71/100
```

shot-only 构图诊断为 **74/100**（不进入生产 rubric 的额外维度）：主体明确、完整包络与
标牌可读、占帧充足；扣分来自低细节盒体、大片平紫背景及缺少电影化前/中/远层经营。

## 3. 综合建议（只建议，不自登记）

统一计分器使用 PR #45 的 21 个 CI LHR、exact 52/52 JSON、独立视觉 71：

| 维度 | 分数 | 权重 | 加权 |
|---|---:|---:|---:|
| LHCI `/` | 100 | .25 | 25.00 |
| LHCI `/home/` | 100 | .15 | 15.00 |
| e2e | 100 | .20 | 20.00 |
| 独立视觉建议 | **71** | .25 | 17.75 |
| 3D smoke | 100 | .15 | 15.00 |
| **综合建议** |  | **1.00** | **92.75 → 92.8** |

计分输出为 `COMPOSITE_SCORE=92.8`、`availableWeight=1`、`missing=[]`。父代理若登记，
应登记 **视觉 71 / 综合 92.8**，而非实现自评或本报告中的 shot-only 诊断值。

## 4. 命令 → 输出摘要

| 命令 / 证据 | 输出摘要 |
|---|---|
| `pnpm build` | 19 pages，build PASS |
| `pnpm test:e2e`（PR #45 exact integration） | `Running 52 tests` → `52 passed (25.8m)`；VIS-01/02/03/04 全过 |
| `git diff --exit-code e94159a..b2a59e4 -- src e2e playwright.config.ts package.json pnpm-lock.yaml` | exit 0；main 后续仅 docs |
| `node tools/camera/audit-shot-ndc.mjs` | `gates 7/7 PASS`；concept showcase 8/8、max `|x_ndc|=.696` |
| 外置 Playwright runtime probe | showcase pose PASS；第一次 `W` release PASS；恢复 drive pose PASS；no-shot ritual untouched PASS |
| ritual registry contract probe | expected 与 actual 九个取景字段逐值相等 |
| PR #45 / pre-CAM CI LHR 解析 | `/`、`/home/` 各 3 轮，P/A/BP/SEO 全 100，delta 全 0 |
| `git diff --exit-code 5152c84^1 5152c84 -- public/posters` | exit 0；四个 blob id 前后一致 |
| `node scripts/score-loop.mjs --visual-score 71 ...` | `COMPOSITE_SCORE=92.8`；五维齐套 |

## 5. 非阻断风险

1. 新 shot 与 release 尚未进入仓库 e2e；本审计以外置 runtime probe 覆盖当前提交，
   但未来回归不会自动被 CI 拦截。后续测试批可加入 `?poi=&shot=` 位姿/首个驾驶意图用例。
2. 已合 DES 规格与 v1 runtime 注册表存在命名/组合语义漂移：规格示例使用
   `showcase.concept-garage` 且允许无 `?poi=` 的 full-id shot；当前实现使用
   `poi_showcase-concept-garage` 并只在 `?poi=&shot=` 组合消费。指定审计 URL 完全通过，
   但在宣称完整 DES 矩阵落地前应由后续批次统一规范或明确修订规格。
3. 当前 7 个 NDC gate 覆盖水平余量和入帧性，但没有把 DES 提议的 `cameraFree` /
   `lineOfSight` 写成机器 gate。fresh 帧未见遮挡或穿楼；此项作为探针覆盖债，不阻断本次
   明列的 7/7 门。

---

*CC-AL-CAM · 审计分支只提交本报告；零 `src/`、`e2e/`、生产 score、看板、poster 或像素基线改动。*
