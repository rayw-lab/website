# Cyber City Loop 0 审计（CC-AL0）

| 项 | 内容 |
|----|------|
| 审计对象 | PR [#29](https://github.com/rayw-lab/website/pull/29) `cursor/cc-l0-test-framework-1d6f` · PR [#30](https://github.com/rayw-lab/website/pull/30) `cursor/cc-l0-visual-research-1d6f` · `cursor/cc-l0-baseline-score-1d6f` |
| 审计树 | `f704664`（test-framework `71e7c59` ⊕ visual `a4d16aa` ⊕ baseline 登记） |
| 审计分支 | `cursor/cc-al0-loop0-audit-1d6f` |
| 日期 | 2026-08-25（UTC） |
| 状态 | **审计完成 · 有条件放行** |

## 0. 最终裁决

**有条件放行。**

当前五维齐套、权重口径一致，基线原始算术为 **87.1875 → `COMPOSITE_SCORE=87.2`**，高于 85
门槛。视觉 51 分经本审计按入库帧独立重打为 **49 分**，`|49-51|=2≤5`，通过双评纪律。

条件均不改变当前分数：

1. PR #30 当前 `mergeStateStatus=DIRTY`；落地主干时须采用已在 baseline 分支验证的合并树，
   `world-visual.spec.ts` 冲突保留 Node ESM 兼容的 `readFileSync` 读取方案。
2. CI Lighthouse 原始工件只保留至 **2026-11-23**；本审计已固化 digest 与逐 URL
   分类中位摘要，但到期前仍应把原始 LHR archive 转存为长期可寻址工件。当前入库的
   `quality-score-baseline-l0.json` 是派生快照，不能替代原始 LHR。
3. e2e 原始 JSON 和 `quality-loop-full.log` 未在仓库内长期留存；当前可由同一合并树重跑，
   但后续基线登记应上传可寻址的原始 JSON/日志，而不只登记“agent 工件”。

另有两项文档勘误已在本审计分支当场修正，不再列为放行条件：rubric §4 已改为
VIS-01/02 基线已入库；测试框架命令表已明确 `pnpm score` 的工件前置条件与五维覆盖要求。

## 1. 综合分口径与实现

编排看板、`score-loop.mjs` 和基线登记三处口径一致：

| 维度 | 看板 | 脚本 | 基线 |
|------|:---:|:---:|:---:|
| LHCI `/` 四项中位后均值 | 25% | 25% | 25% |
| LHCI `/home/` 四项中位后均值 | 15% | 15% | 15% |
| e2e 通过率 | 20% | 20% | 20% |
| 视觉 rubric | 25% | 25% | 25% |
| 3D 冒烟 | 15% | 15% | 15% |
| 合计 | **100%** | **100%** | **100%** |

实现核对：

- LHCI 对每个分类分别取多轮中位数，再对 P/A11y/BP/SEO 求均值，符合文档。
- e2e 分母排除 skipped；retry 后通过的 flaky 计通过。当前登记为 52 passed、0 failed、
  0 skipped、0 flaky，不存在边界解释对分数的影响。
- 3D 冒烟只统计实际执行且标题含 `@smoke3d` 的 spec，规避 `--list`/全 skipped 的
  `spec.ok=true` 假满分。
- 视觉 CLI 覆盖会校验 0–100；JSON 路径只校验 number、不校验范围。当前 JSON 为合法 51，
  不影响本轮，但后续可补 fail-fast schema 校验。
- 缺维会按可用权重归一化。这适合诊断，不适合作为 ≥85 的发布门禁；本轮快照
  `availableWeight=1`、`missing=[]`，未触发该风险。后续 promotion 必须同时要求
  `availableWeight===1`。

## 2. 基线来源与可复现性

### 2.1 LHCI

登记来源可追溯且当前可下载：

- GitHub Actions run [32878074874](https://github.com/rayw-lab/website/actions/runs/32878074874)，
  head SHA `71e7c59252506a30c2b771ceaf5b1701930e8281`，结论 `success`。
- artifact `lighthouse-results`，43 个文件：21 个 LHR JSON、21 个 HTML、1 个
  `assertion-results.json`；API 登记大小 6,849,799 bytes。
- artifact digest：
  `sha256:a5c51a30faa786445688a4ba126b2044e4113b914435f5046a8843a4aed2168c`。
- 过期时间：2026-11-23T17:28:20Z。
- `71e7c59..f704664` 对 `src/`、`public/`、`astro.config.mjs`、`lighthouserc.json`、
  `package.json`、`pnpm-lock.yaml` 的运行时变更 commit 数为 **0**；因此用 `71e7c59`
  的 CI LHR 回填 `f704664` 的 LHCI 两维合理，不存在被测页面漂移。

原始 LHR 可还原：

| URL | Perf | A11y | BP | SEO | 四项均值 |
|-----|:---:|:---:|:---:|:---:|:---:|
| `/website/` | 100 | 95 | 96 | 100 | **97.75** |
| `/website/home/` | 100 | 100 | 100 | 100 | **100** |

本地 SwiftShader 偶发使 performance/BP 为 `null`，改用同运行树的 green CI artifact 是合理的
环境回填，不是改分。限制是远端 artifact 有保留期，见条件 2。

### 2.2 e2e 与 3D 冒烟

入库派生快照记录 52/52、3 个 `@smoke3d` 全过，标题与 VIS-02/03/04 一一对应；测试配置
固定 JSON reporter、项目链、viewport、SwiftShader 参数和单 worker 视觉腿，重跑路径完整。

证据链的小缺口是原始 `test-results/e2e-results.json` 被 gitignore，且文档所称
`quality-loop-full.log` 没有仓库内 URL。它不阻止在当前树重跑，因此裁为条件放行而非驳回。

## 3. 视觉 rubric 可审计性

七维权重为 20/20/15/15/15/10/5，合计 100%；维度覆盖首幕、渲染、色彩、密度、动效、
HUD 与原创性，并明确排除已由 LHCI/e2e 承载的性能、可达性和功能，避免重复计分。

锚点审计结论：

- 0–100 每维均有五档可观察描述，且把 88° Orion、82° Jesse、62° Night City、
  45° 模板、20° 灰盒分布到量尺上，能够区分“工程可用”与“视觉完成度”。
- Awwwards 官方口径确为 Design 40% / Usability 30% / Creativity 20% / Content 10%，
  HM 为 jury 总分 ≥6.5。rubric 的“85°=HM 量级”应理解为**项目内部的保守视觉目标**，
  不是把 Awwwards 官方 6.5 线直接换算成 85 分；后续版本宜把这点写得更明确。
- Orion/Jesse 的 HM 页面、Bruno case study、three.js generator city 和开源 Night City
  均提供公开 URL；定标锚与施工参照分开，引用方式合理。
- “帧优先、软渲染折扣有界、分差 ≥10 写说明”三条能抑制代码存在但画面不可见造成的
  自评通胀。
- V5 是动态维度，当前长期证据只有变形前/后静帧与行为测试；下一轮应补 5–10 秒固定脚本
  录屏或关键帧条，避免仅凭代码/状态机评价缓动与节奏。

## 4. 视觉独立复评（CC-AL0）

证据：入库的 desktop shell、robot_idle、car_ready、mobile shell 四帧，两张
VIS-01/02 PNG，以及 rubric 代码核对项。

| 维 | 合议分 | AL0 独立分 | 复评依据 |
|----|:---:|:---:|------|
| V1 首幕构图 | 45 | **43** | 主体/斑马线焦点明确；纯黑远层、正中平铺与锥桶抢前景，落 30–45 段 |
| V2 光照材质 | 52 | **50** | bloom/反射可见但材质平、天空与大气缺席，取 50–65 段下沿 |
| V3 色彩氛围 | 55 | **52** | 青色品牌轴成立；绿红紫白窗格同帧争抢，色彩层级不足 |
| V4 场景密度 | 35 | **33** | 楼体体量存在；零可读招牌、街道道具稀薄、环境生命感缺席 |
| V5 动效转场 | 58 | **56** | 四拍状态链与前后帧成立；静止镜头且 car 帧被灰雾洗平，动态证据有限 |
| V6 UI/HUD | 55 | **57** | 静态壳/ESC 面板完整统一；挂载后 HUD 稀薄，移动端仍是 desktop poster 裁切 |
| V7 原创叙事 | 70 | **68** | 机器人变车主题有辨识度；城市本体仍接近通用赛博模板 |

`43×.20 + 50×.20 + 52×.15 + 33×.15 + 56×.15 + 57×.10 + 68×.05`
`= 48.85 → 49/100`。

**总分差 `|49-51|=2≤5`，51 分通过复核。** 合议分的逐维方向与证据一致，未发现为了跨
综合门槛而抬高视觉分的迹象。

## 5. 综合分复算

| 维度 | 分数 | 权重 | 加权 |
|------|---:|---:|---:|
| LHCI `/` | 97.75 | 0.25 | 24.4375 |
| LHCI `/home/` | 100 | 0.15 | 15.0000 |
| e2e | 100 | 0.20 | 20.0000 |
| 视觉 rubric | 51 | 0.25 | 12.7500 |
| 3D 冒烟 | 100 | 0.15 | 15.0000 |
| **合计** |  | **1.00** | **87.1875** |

脚本按一位小数输出：

```text
COMPOSITE_SCORE=87.2
```

即使用 AL0 独立视觉分 49 代入，综合分仍为 `86.6875 → 86.7`，裁决不依赖 ±5 容差边缘。

## 6. 框架与文档完整性

`package.json` 已提供 `test:visual`、`lhci:local`、`quality:loop`、
`quality:loop:full`、`score`；测试框架文档覆盖安装、端口/base path、SwiftShader、
quick/full 差异、输入路径、截图基线、CI artifact 回填和退出码。

新 VM 的完整顺序是：

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm quality:loop:full
gh run download 32878074874 -n lighthouse-results -D /tmp/ci-lhci
node scripts/score-loop.mjs --lhci-dir /tmp/ci-lhci
```

`pnpm score` 是“读取既有工件”而非 fresh-clone 单命令；未先生成 e2e/LHCI 工件时退出 2
符合脚本设计。本审计已在命令表直接补充此前置条件及 `availableWeight===1` 放行纪律。

## 7. 运行复现结果

2026-08-25 UTC 在审计分支 fresh dependency install 后实跑：

| 命令 | 结果 |
|------|------|
| `pnpm install --frozen-lockfile` | PASS；锁文件无需更新，372 packages 就位 |
| `pnpm exec playwright install chromium` | PASS；Chromium 151 + headless shell + FFmpeg 就位 |
| `pnpm quality:loop:full` | **exit 0**；build 2s；e2e **52/52**，0 failed/skipped/flaky，1024s；本地 LHCI 21 run collect 完成 |
| VIS-01/02 | 入库截图直接比对 PASS，未更新 snapshot |
| VIS-03 | PASS；robot_idle 中心采样 **430 色 / 非众数 56.1%** |
| VIS-04 | PASS；POI 中心采样 **327 色 / 非众数 70.1%**，parkingBay 断言通过 |
| 本地 `pnpm score`（full 链内） | 79.6，明确显示 LHCI 两维缺失、`availableWeight=0.6`；与已登记 SwiftShader 限制一致，不作为基线 |
| `pnpm score --lhci-dir /tmp/cc-al0-ci-lhci` | **`COMPOSITE_SCORE=87.2`**；`availableWeight=1`、`missing=[]`、7 URL 各 3 LHR |
| `pnpm astro check` | exit 0；122 files，**0 errors / 0 warnings / 58 hints** |

全链生成的 Playwright JSON 复核为 `expected=52`、`unexpected=0`、`skipped=0`、
`flaky=0`；score 输出的三个 smoke 标题与 VIS-02/03/04 一致且均 `ok=true`。测试产生的
历史截图字节差异已从审计提交中排除，审计分支仅保留文档变更；preview 服务按测试框架约定
继续运行。

## 8. Loop 1 建议聚焦项

综合分可信且 ≥85，Loop 1 应只开一个视觉聚焦 PR，按可见 ROI 分两道门：

### Tier A1（先做，目标视觉约 51→58）

1. 天空渐变 + 地平线辉光，并同步雾色；
2. 撤首幕 16 个试车锥桶，替换少量叙事一致的霓虹城市道具；
3. 窗色收敛为青/品红/暖白三族；
4. 首幕偏轴构图 + 机器人 rim light/接地环；
5. 变形白爆降强并改品牌双色，保住 car_ready 对比度。

### Tier A2（A1 复评后做，目标视觉约 58→62）

1. 挂载后 HUD 面板化并保留 5 栋 mini 楼宇快览；
2. H1/标签纯 CSS 排版强化；
3. 湿反射可见性调参；
4. A1/A2 全部落定后再重拍 desktop/mobile poster。

### Tier B（仅当 A 复评达标后）

先做楼顶可读招牌与街道灯箱/灯杆，再评估飞行光轨、剪影层和变形运镜。不要在同一 PR
并入 Tier C 或 Blender 实模资产管线；后者应单独立项并重新核算 world JS/资产预算。

