# CC-LOOP-AUDIT-AUD-C1 段末独立审计报告（#164 AUD-C1 合入 main 后）

- **审计人**：CC-LOOP-AUDITOR-AUD-C1（×1，不设 ×2；董事会执行令 = main@`d895db7` #165 正本）；**R2 接管**：原审计 Agent 于 §4.2 全量回填前 ERROR（半成品推至 `cursor/cc-loop-audit-aud-c1-2aee`@`7c5a112`），AUD-C1-AUDIT-R2 以新标签接管（禁 resume 已兑现）——新分支 `cursor/cc-loop-audit-aud-c1-r2-f37e` base=origin/main@`3fe7c5f`，cherry-pick 半成品后复核 §0–5、fresh 自跑补齐 §4.2/§6
- **R3 接管声明**：R2（`bc-e4dd7883`）于 §4.2 全量结果回填前再度失联，**R2 E7 DEAD 依据 #175**（董事会急裁 [#175](https://github.com/rayw-lab/website/pull/175) → main@`4a58789`，`docs/research/cc-loop-board-aud-r2-e7-dead.md`；tip 冻结 `b5542ac` + 面板 RUNNING 失真双窗互证，禁 resume）。AUD-C1-AUDIT-R3 自报 slug **claude-fable-5-thinking-xhigh**，fresh 锚 = origin/main@**`4a58789`**，在同分支 `cursor/cc-loop-audit-aud-c1-r2-f37e` **append-only 续写**（保留 `b5542ac`，禁 force-push），按心跳条款 HB-1..5 补齐 §1/§3.5 锚记、§4.2 全量 fresh 自跑与 §6 裁决
- **模型**：claude-fable-5-thinking-xhigh（R1/R2/R3 同 slug）
- **纪律**：零业务代码（本 PR 仅新增本报告一个文件）；R1 动态取证于独立 worktree `/tmp/aud-c1-wt`（锚 = 审计对象 SHA），R2 全量 e2e 于新 VM 独占跑道 fresh 自跑（§4.2）；未跑 fps-probe（无令不飞）
- **审计对象**：[#164](https://github.com/rayw-lab/website/pull/164) squash → **main@`38a2086`**（CC-AUD-C1 驾驶五事件 WebAudio 纯合成音效层 v0）
- **时间窗**：2026-08-28 10:41–12:00 UTC 附近（fresh 取证与动态复跑均在合入后当日完成）

## 0. 裁决速览

| 项 | 结果 |
|---|---|
| Fresh（PR merged + main tip） | ✅ 吻合（§1） |
| diff 文件域 = 任务书五域 | ✅ 恰好 5 文件（§2） |
| 禁 howler | ✅ 依赖零引入（§3.1） |
| `/` 零首包音频字节 | ✅ 懒分包 + 零资产（§3.2） |
| 禁 pointer-lock | ✅ src/e2e 全域零匹配（§3.3） |
| 机位 / EXP-01 未动 | ✅ 只读消费、文件域零触碰（§3.4） |
| 与 #134 文件交集 | ✅ ∅，语义面亦兼容（§3.5） |
| CITY-AUD-01 单测复跑 | ✅ 1 passed（6.3 min，独立跑道）（§4.1） |
| 全量 e2e | 见 §4.2（含数字口径修正：全量实为 **81** 例，非执行令所书 53） |
| LHCI 不降 | ✅ 同 SHA CI artifact 回填，`/` 与 `/home/` 中位四项 100 全平（§5） |
| **裁决** | **见 §6** |

## 1. Fresh 取证

- `gh pr view 164`：state **MERGED**，mergedAt `2026-08-28T10:41:37Z`，mergeCommit **`38a2086e335db5c5fc4f17fc8ffb39741315fd1e`**，base `main`，head `cursor/cc-aud-c1-synth-8177`。
- `git fetch origin main`（10:41 后取证）：origin/main tip = `38a2086` ✅ 完全吻合。
- 审计进行中 main 前进一格：**`d895db7`**（[#165](https://github.com/rayw-lab/website/pull/165) 董事会裁决正本，`docs/research/cc-loop-board-aud-c1-merge.md` 单文件 +48 行，零业务代码）——不改变审计锚 `38a2086`，本报告 PR 挂 base=main 时天然叠其上。
- **R2 锚更新（fresh 复核）**：main 再前进一格至 **`3fe7c5f`**（[#167](https://github.com/rayw-lab/website/pull/167) PLUG-134 段末审计档，docs-only）。`38a2086..3fe7c5f` 差异 = 2 个 docs/research 文件，零 src/e2e/config 触碰——审计锚 `38a2086` 的全部静态结论对现 main tip 依然成立；R2 已在 `3fe7c5f` 树上复跑 §2/§3 关键取证（diff stat、howler、pointer-lock、PR 164 merge 事实）逐项吻合。
- **R3 锚更新（fresh 重锚，16:29 UTC 取证）**：`git fetch origin main` 后 tip = **`4a58789`**（[#175](https://github.com/rayw-lab/website/pull/175) 董事会急裁正本，≥授权书要求）。锚间隔 `3fe7c5f..4a58789` = 8 个 merge（[#168](https://github.com/rayw-lab/website/pull/168)/[#169](https://github.com/rayw-lab/website/pull/169)/[#170](https://github.com/rayw-lab/website/pull/170)/[#171](https://github.com/rayw-lab/website/pull/171)/[#172](https://github.com/rayw-lab/website/pull/172)/[#174](https://github.com/rayw-lab/website/pull/174)/[#173](https://github.com/rayw-lab/website/pull/173)/[#175](https://github.com/rayw-lab/website/pull/175)），diff = 7 文件（AGENTS.md + 6 docs/research），`git diff --name-only 3fe7c5f 4a58789 -- src/ e2e/ playwright.config.ts astro.config.mjs package.json pnpm-lock.yaml lighthouserc.json tsconfig.json .github/ scripts/ tools/ public/` **零命中**——审计锚 `38a2086` 全部静态结论对 `4a58789` 依然成立，无需重审静态面。
- 门禁 CI（merge commit 同 SHA）：run [33164322861](https://github.com/rayw-lab/website/actions/runs/33164322861) **success**（check / build / links / budget / lighthouse 单 job 全绿）。

## 2. diff 文件域复核（恰好五域，与任务书一致）

`git show 38a2086 --stat`：**5 files changed, 765 insertions(+), 2 deletions(-)**

| 文件 | 变更 | 任务书对应域 |
|---|---|---|
| `src/lab/world/audio/WorldAudio.ts` | 新增 619 行 | WorldAudio 本体 |
| `src/lab/world/core/SessionTimeline.ts` | +5/−2（白名单 ux 族追加 `world-audio` + 注释） | SessionTimeline 纯加法 |
| `src/lab/world/index.ts` | +9（构造挂载、cone-hit 沿 `impact()`、dispose 链一行） | index 挂载 |
| `e2e/cyber-city-audio.spec.ts` | 新增 131 行（CITY-AUD-01 单用例） | audio e2e |
| `docs/spec/cyber-city-observability.md` | +2/−1（37→38 type / 10 族随行注记 + 规格表一行） | observability |

白名单加法与文档同 PR 同步（38 type / 10 族，schemaVersion 不动 = §3.6 加法纪律），代码与规格互证一致。域外零触碰：无 view/、无 camera、无 explore、无 playwright.config、无 poster 资产。

## 3. 静态审计面

### 3.1 禁 howler ✅

- `package.json` / `pnpm-lock.yaml`：`howler` 零匹配（rg 实测）。
- 代码域唯一出现处 = `WorldAudio.ts` 文件头注释（「howler 永不引入」重申 SRD §12.7.7），其余全部在 docs/ 研究文献。手写 WebAudio 播放层合同兑现。

### 3.2 `/` 零首包音频字节 ✅

- **零资产**：`WorldAudio.ts` 全部声音为运行时合成（振荡器 + 运行时生成的 1s 白噪声 buffer），无任何 `.mp3/.ogg/.wav` 等 import 或 URL 引用（src/、e2e/ rg 实测零匹配）。
- **懒分包**：WorldAudio 静态 import 于 `src/lab/world/index.ts`，而该模块本身经 `src/pages/index.astro`（L299）动态 `import()` 进入——build 实测（本 worktree `pnpm build` @`38a2086`）WorldAudio 代码只落在 `dist/_astro/world.B5ALVaGp.js` 懒 chunk；`dist/index.html` 首包唯一 module 脚本不含该 chunk，亦无 modulepreload。
- **AudioContext 懒创建**：首个用户手势（window pointerdown/keydown 捕获段）内 new，无手势路径零实例（e2e 硬门断言 A 双口径取证，§4.1）。
- 附注：`public/demo/tts/**` 存在 80 个既有 mp3——为 voice-pod 座舱 TTS demo 历史资产（引用面仅 `src/lab/modules/tts-cockpit/engine.ts` + lab manifest），与 `/` 世界剧本及本 PR 无关，非本次引入。

### 3.3 禁 pointer-lock ✅

`rg -i "requestPointerLock|pointerlock|pointer-lock" src/ e2e/` 全域零匹配（#164 前后均无引入）。

### 3.4 机位 / EXP-01 未动 ✅

- 文件域：`src/lab/world/view/`、`e2e/cyber-city-explore.spec.ts` 均不在 diff 内。
- 代码面：WorldAudio 对相机/视图仅**只读消费**——速度差分读 `game.view.focusPoint.smoothedPosition`（View L725 focusPointSpeed 同源同式）、引擎门读 `game.view.driveView.gate`，零 view/ 改动、零机位写入。
- 事件订阅全部为既有面：`inputs.events.on('brake')`（`index.ts` L232 同款既有模式、Player L154 既有 action）、`game.events` 的 `world-transform`/`world-drive-view`、TransformSystem `stateChange`/`swap`、ticker order 8（视觉同步 4 / 车辆 post 5 / 相机 7 之后、HUD 节拍 999 之前）。

### 3.5 与 #134 交集复核 ✅（文件 ∅ + 语义兼容）

- #134（tip `e03271f`）文件域 10 件：docs/research ×2、`e2e/cyber-city-explore|observability|perf.spec.ts`、`playwright.config.ts`、`public/models/facade-kit/README.md`、`src/lab/world/city/ForegroundFraming.ts`、`src/lab/world/city/StreetProps.ts`、`tools/camera/audit-x2-visibility.mjs`。与 #164 五件**交集 = ∅**（实测两清单逐一对照）。
- 语义面（文本零冲突 ≠ 语义零冲突，专项核过）：#134 的 `playwright.config.ts` 改动 = 全局 `workers: 2→1` + world-chromium `fullyParallel: false`，**不动 testMatch/testIgnore**——`cyber-city-audio.spec.ts` 经既有 `cyber-city.*\.spec\.ts` 泛匹配收编 world-chromium 的链路在 #134 合入后不变，且串行化更严，对音频用例只利不害。无需试合并树即可判定兼容（配置为唯一潜在耦合点，已逐行核）。
- **R2 锚更新**：[#134](https://github.com/rayw-lab/website/pull/134) 已于 10:56:08Z 合入（merge commit `d99a0e2`），但 base = **#104 栈分支** `cursor/cc-vis-x2-facade-r2-1d6f`，**不在 main**（`git merge-base --is-ancestor` 实测 NOT in main）。现 main（含本审计全量 e2e 所跑树）playwright 仍为 `workers: 2` 原配；上述语义兼容结论转为前瞻——待 #104 栈合 main 时生效，无需本段重审。
- **R3 锚更新（fresh 复核，16:30 UTC）**：`d99a0e2` 对 main@`4a58789` **仍 NOT in main**（merge-base --is-ancestor 复跑）；[#104](https://github.com/rayw-lab/website/pull/104) 仍 OPEN draft @`bbba5a5`、[#166](https://github.com/rayw-lab/website/pull/166) 仍 OPEN draft（gh fresh 实测，两者均禁合维持）。R2 前瞻兼容结论**原样维持**：现 main playwright 仍 `workers: 2` 原配，minimap 三例未入分母。

### 3.6 其他纪律点（随查随记）

- dispose 全链拆除逐项核对：手势/visibility 监听、五路事件订阅、ticker、按钮 DOM、`__worldAudio` 探针删除、`ctx.close()`——幂等（`disposed` 位）且挂入 `index.ts` dispose 首段既有链。
- `window.__worldAudio` 只读探针与 `__worldSpike` 同段纪律（挂载/dispose 删除，declare global 收口）。
- 静音钮样式门：`[data-world-state='robot_idle']/[transforming]` 整件 `display:none!important`（DriveFeedback 同款机器兜底）——poster 恒等零涉及；音频层无渲染路径、循环动画配额零占用。
- 无 WebAudio 环境 try/catch 整层静默降级，游戏路径零影响；后台标签 visibilitychange suspend/resume 防拖尾。

## 4. 动态审计

### 4.1 CITY-AUD-01 单测复跑 ✅ 1 passed（6.3 min）

独立 worktree + 独立端口（E2E_PORT=4517，与 plug 跑道 4399 零冲突）：

```
pnpm exec playwright test e2e/cyber-city-audio.spec.ts --project=world-chromium --no-deps
→ 1 passed (6.3m)
```

硬门断言 A–D 全过：首手势前零 AudioContext（addInitScript 构造计数 + `__worldAudio` 探针双口径互证）→ robot_idle 静音钮 hidden → CTA 首手势解锁 + 变形音计数 ≥1 + localStorage 静音记忆构造期还原 → 静音钮切换写回持久 → W 驾驶引擎层 engineLevel 抬升 → 全程零 pageerror。

### 4.2 全量 e2e（R2 fresh 自跑 + 数字口径修正）

- **R1 互斥令执行记录（历史存档）**：10:41 取证时 `/tmp/plug-rebase-wt` 上 #134 的 CITY-EXP（world-chromium，端口 4399，pid 122936）在跑（负载 ~4.4/4 核）——按令未杀、未并发，先铺静态面**排队等待**；10:48 该进程自然退出、跑道空闲后，10:55 在审计 worktree（端口 4517）启动全量。**该 R1 全量结果随 Agent ERROR 一并丢失，未被本报告引用**。
- **数字口径修正（登记要点）**：执行令所书「全量 53（原 52 + CITY-AUD-01）」中的 52 为 **CC-L0 时期的陈旧登记**（`cyber-city-test-framework.md` 首跑实测行）；套件此后随 FXN/OBS/EXP/SIGN 等波次持续扩容，main@`38a2086` fresh `--list` 实测 = **81 例 / 17 文件 / 7 project**（desktop 20 / mobile 3 / car 7 / world 44 / world-perf 1 / city-perf 2 / visual 4），即 **80（合入前）+ 1（CITY-AUD-01）**——与编排看板 #104 复活门「全量 80 例」口径互证一致。**「+1 收编 world-chromium」事实成立**（testMatch 泛匹配 fresh 取证；R2 于 `3fe7c5f` 树复跑 `--list` 同得 81/17）。登记数以 81 为准，53 不应上板。
- **R2 全量登记作废（E7 DEAD）**：R2（`bc-e4dd7883`）于全量结果回填前失联，董事会急裁 [#175](https://github.com/rayw-lab/website/pull/175) 判死（tip 冻结 `b5542ac` + 面板 RUNNING 失真双窗互证）。上一行 R2 预登的「新 VM 独占跑道」口径**未产出任何已上链结果，不被本报告引用**；本报告采信的唯一全量结果 = 下述 R3 fresh 自跑。
- **R3 fresh 全量（本报告采信的唯一全量结果）**：树 = 「候选 ⊕ main」集成树（`git merge-tree --write-tree origin/main@4a58789 HEAD` = CLEAN，tree `cb8d4e3`；候选分支对 main 的 diff 仅 docs/research 报告件，src/e2e/config 面与 main@`4a58789` 逐字节等价，亦即与锚 `38a2086` 等价——§1 锚间隔自证）；**隔离端口按 #171/#174 剧本**（`E2E_PORT`≠4321、socket bind 探针核验①正证据 + `lsof`+`/proc` 核验②，禁 `ss`；`set -o pipefail` + `EXIT=` 尾行实落日志）；`workers: 2` main 原配。**跑道预检（16:28 UTC）实测非独占**：同 VM `/tmp/nav-c1-wt`（15:55 起跑 playwright + preview:4321-族）与 `/tmp/worktrees/bgm-c1`（16:25 点火 BGM 单 spec）在飞，load 10.26/4 核——纪律禁杀他人进程，**排队等自然收轮**后按 HB-3 预登记开跑（等待与开跑时刻见下）。排队实录（`ps`+`/proc/loadavg` 逐点取证）：16:36 bgm-c1 换双 spec 续跑（bgm+audio）；16:41 / 16:46 / 16:51 三点复测两路仍在飞（load 10.25→11.31→11.95）；17:01 bgm-c1 双 spec 自然收轮，仅剩 nav-c1 全量；17:06 / 17:12 / 17:16 复测 nav-c1 仍在飞（load 回落 7.10→7.51→6.72），继续排队。集成树已备妥待点火：worktree `/tmp/aud-c1-ready-wt`@`62e6f24`（本地临时 merge，永不推送），`pnpm install --frozen-lockfile` 完成，fresh `--list` = **Total: 81 tests in 17 files**（分母登记，与 #171 dry-run 81/17 一致）。
- **全量结果**：

```
（回填中：R3 全量运行结果；分母以集成树 fresh --list 实数为准）
```

## 5. LHCI（同 SHA CI artifact 回填，来源登记）

本 VM 为 SwiftShader 软渲染（LHCI 本地惯例 null），按登记口径**未在本地跑 LHCI**，回填来源 = 同 SHA green CI artifact：

- **来源**：CI run [33164322861](https://github.com/rayw-lab/website/actions/runs/33164322861)（headSha = `38a2086`，conclusion success）artifact `lighthouse-results`（id 9683035786）；上轮对照 = CI run [33163104422](https://github.com/rayw-lab/website/actions/runs/33163104422)（headSha = `5be64eb`，#164 合入前 main）artifact id 9682552514。
- **口径**：`lighthouserc.json` 单源——7 URL × 3 run，`median-run` 聚合断言；本轮 `assertion-results.json` **0 failed**。
- **`/` 与 `/home/` 四项逐项对照（中位数）**：

| URL | 轮次 | Perf | A11y | BP | SEO |
|---|---|---|---|---|---|
| `/website/` | 上轮 `5be64eb` | 100 | 100 | 100 | 100 |
| `/website/` | 本轮 `38a2086` | **100** | **100** | **100** | **100** |
| `/website/home/` | 上轮 `5be64eb` | 100 | 100 | 100 | 100 |
| `/website/home/` | 本轮 `38a2086` | **100** | **100** | **100** | **100** |

逐项不低于上轮 ✅（本轮单跑抖动：`/` 一跑 perf 98、`/home/` 一跑 99，中位聚合吸收，属 CI 方差；其余五 URL 中位亦全 100）。**不降门成立，无伪造，来源可复核。**

## 6. 裁决

```
（回填中：GO / 有条件 GO / NO-GO + 依据）
```

## 7. 附：取证命令清单（可复核）

- `gh pr view 164 --json state,mergedAt,mergeCommit` / `git fetch origin main && git rev-parse origin/main`
- `git show 38a2086 --stat` / `gh pr view 134 --json files` / `gh pr diff 134`（playwright.config 段逐行）
- `rg -i howler package.json pnpm-lock.yaml src/` / `rg -i "pointerlock|pointer-lock" src/ e2e/` / `rg "\.(mp3|ogg|wav|m4a|aac|flac|opus)$"`（public 文件清单）
- `pnpm build`（worktree @`38a2086`）+ `rg -l "world-audio-muted" dist/` + `dist/index.html` 首包脚本核对
- `pnpm exec playwright test --list`（81 例分布）/ CITY-AUD-01 单测 / 全量（R1 E2E_PORT=4517；R2 默认 4321）
- `gh api …/runs/{33164322861,33163104422}/artifacts` + `lhr-*.json` categories 逐项聚合
- R2 追加：`gh pr view 134 --json baseRefName,mergeCommit` + `git merge-base --is-ancestor d99a0e2… origin/main`（NOT in main 实证）/ `gh run download {33164322861,33163104422} -n lighthouse-results` + 双轮 7 URL 中位独立复算（Node 脚本，全 100 复现）/ `pnpm test:e2e`（json reporter `test-results/e2e-results.json` 计数核对）
