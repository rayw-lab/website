# Loop 8 功能独立复审 R7（CC-AL-FXN-R7 · 收口轮 · R9 接续）

> 执行模型自报：**claude-fable-5-thinking-xhigh**

> ✅ 取证已收口（2026-08-28，R9-FINISH）：S-2 + L1–L7 全腿闭合，双 Pass 合议 **87**（真机缺席云端封顶内），登记见 `cyber-city-function-rubric-score.json`，裁决见 §4。

> 🔁 **R8 接续注记（CC-AL-FXN-R8，2026-08-28）**：R7 会话在 L4+L5 提交（tip `756a0f8`）后僵死被 stop——kickoff/环境腿/L4/L5 四提交完整入账，L6–L7 与登记未收口。R8 直接**续写本分支**（`cursor/cc-al-fxn-r7-1d6f`，自真 tip `756a0f8` 顺延，零 rebase 零 cherry-pick，世系干净——R6 hash 重写教训的反面执行），沿用本报告与 PR #103；新 VM 环境重建 + 指纹互证见 §1-R8，L6/L7 取证归档前缀改用 `fxn_r8_*`。评分对象不变（`main@771b1e4`，运行时面 `dc3f56b`），封顶判读不变（真机缺席，云端 87–88，禁登 90）。

> 🔁 **R9 接续注记（CC-AL-FXN-R9，2026-08-28）**：R8 在 kickoff 提交（tip `c09ee31`）后即僵死被 stop——其承诺的 §1-R8 环境腿与 L6/L7 取证**零产出**（`fxn_r8_*` 前缀零文件），kickoff 注记本身按真实世系保留不改写。R9 同法**续写本分支**（自真 tip `c09ee31` 顺延，零 rebase 零 cherry-pick），沿用本报告与 PR #103 并负责收口：新 VM 环境重建 + 指纹互证记 **§1-R9**（顶替 R8 未兑现的 §1-R8），L6/L7 取证归档前缀改用 **`fxn_r9_*`**，独立 worktree `/tmp/wt-al-fxn-r9`。评分对象不变（`main@771b1e4`，运行时面 `dc3f56b`），封顶判读不变（真机缺席，云端 87–88，禁登 90——wave2 §1.2）。
>
> 🔁 **R9-FINISH 接续注记（CC-AL-FXN-R9-FINISH，2026-08-28）**：R9 会话在 L6 提交（tip `5c27f1c`）后被 stop——L7 与登记未收口。本会话同法**续写本分支**（自真 tip `5c27f1c` 顺延，零 rebase 零 cherry-pick），沿用本报告与 PR #103，只负责三件事：§2.4 L7 空闲腿取证、逐维打分 + 双 Pass 合议、登记 JSON 收口。又一台新 VM——环境重建 + 指纹互证记 **§1-R9F**（全新端口 **4474**，独立 worktree `/workspace/.worktrees/fxn-r9`），L7 归档沿用 **`fxn_r9_*`** 前缀。评分对象不变（`main@771b1e4`，运行时面 `dc3f56b`），封顶判读不变（真机缺席，云端 87–88，禁登 90——wave2 §1.2）。
>
> 🔁 **CODEX-CLEAR 接续注记（CC-FXN-R7-CODEX-CLEAR，2026-08-28）**：清 Codex 对 PR #103 的三条阻断（P1 看板漂移 / P1 L6 证据随旧 VM 消亡 / P2 F5=90 缺 hint-recall 补证）。处置：① **merge `main@88097f9` 入本分支**（merge 而非任务书字面的 rebase——本分支报告内多处以真 tip SHA（`756a0f8`/`c09ee31`/`5c27f1c`）钉世系，rebase 重写 hash 即重演 R6「世系污染全量弃用」判例，且已推送分支 rebase 必须 force push，纪律双禁；#103 零看板文件改动，与秘书 [#109](https://github.com/rayw-lab/website/pull/109) 刷新后看板天然零冲突，看板行归秘书不代改）；② **L6 重采（§2.3R）**：新 VM 上 checkout 登记对象 `771b1e4` 重建（chunk 指纹与 R5–R9F 登记值逐字节互证后取证），录屏/截图/dump **落库仓库内 `docs/spec/assets/fxn-audit/`**（rubric §3.2-3 本就要求的归档位；ephemeral `/opt/cursor/artifacts` 引用全部改仓库相对路径或标注消亡）；③ **hint-recall 补证并入 L6R 同会话**（R5 L3 defer 的冻结安排本就是「ritual 会话 L6 复测」）：hint 超时淡出 → H 键召回 → 收起 → 按钮召回，`hint-recall{via:key}` 与 `{via:button}` 双路埋点 + 截图内 `#debug` 事件流同框三方互证。分值零变动：F5=90 段锚「提示可再唤出」由 defer 转直证，合成 **87** 与封顶判读（真机缺席云端 87–88，禁登 90）原样保持。

## 0. 审计事实（kickoff）

| 项 | 审计事实 |
|---|---|
| 审计对象 | `main@771b1e4`（运行时面 = `dc3f56b`，含 FXN-C5 #90 + FXN-C6 #91 + VIS-X1A-R4 #92 + X3 e2e #93；`771b1e4` 仅追加视觉审计 docs #94）。零漂移互证：`git diff --stat dc3f56b 771b1e4 -- src/ e2e/ astro.config.mjs package.json pnpm-lock.yaml` **空输出**——按 wave2 §4.1 判例钉当前 main tip 登记。审计分支 `cursor/cc-al-fxn-r7-1d6f`（base `origin/main`），独立 worktree `/tmp/wt-al-fxn-r7` |
| 接续关系 | **R5**（tip `eeb78bc`）完成 S-2 主腿 + 环境腿 + L1–L3 后 63min 无 push 被 stop——证据正本 `loop8-fxn-r5-audit.md` 已按真 tip 原样吸收进本分支（吸收 commit 见本分支首提交）；**R6**（`cursor/cc-al-fxn-r6-1d6f` tip `c843e9f`）仅产出 kickoff 骨架即被 stop，且其分支把 R5 五个提交 rebase 重写为新 hash（`1dcacc0` ≠ 真 tip `eeb78bc`），世系污染，**零取证入账、全量弃用**——R7 直接基于 `origin/main` 重建，只从真 tip 吸收 |
| 本轮职责 | 补 **L4–L7** 四条腿（决定 F5/F6 段位）+ 逐维打分 + 双 Pass 合议 + 登记 JSON 收口 |
| 比较基线 | 上轮登记 `main@66ed0fe`（84 分，`loop8-fxn-audit.md`） |
| 冻结秤 | `docs/spec/cyber-city-function-rubric.md` v1.0（S-2 v1.0 + S-5 v1.0） |
| 封顶判读 | `cyber-city-fxn-90-wave2.md` §1.2：真机腿缺席时云端从严满配封顶 **87（F7 95）～88（F7 100）**——F1/F2/F3/F4 计时高段锚（0:15 / ≤100ms / ≤3s+主动继续 / 30s 自然吸引）在 SwiftShader 禁令下恒锁 85 |
| 真机腿 | **缺席**——指挥官真机 S-2 三件套未产出；按任务书与 wave2 §4.2 裁决：**禁止登记 90**，云端封顶 87–88 内诚实落分，缺席事实写入登记 JSON notes |
| 端口纪律 | 本 VM 为全新环境（kickoff 时 `ss -tlnp` 无任何 4xxx 监听；R5 报告的 20+ 陈旧口属旧 VM）；R7 preview 用全新端口 **4471**，并以 world chunk sha256 对 R5 记录值 `1a762db3…3b84eb` 逐字节互证后才开始取证 |
| src 纪律 | **零业务 src**：本分支只含 `docs/research/` 三件（R5 吸收正本 + 本报告 + 登记 JSON）；#43（BL2 沿街实模）在途 draft，禁合流禁触碰 |

## 1. 环境与指纹（取证前置，已互证）

| 项 | 读数 |
|---|---|
| 环境 | Node v22.14.0 · pnpm 10.33.3 · `pnpm install --frozen-lockfile`（锁文件不漂移）→ `pnpm build`（**19 pages**，与 R5 记录一致）→ `pnpm preview --host 0.0.0.0 --port 4471`（tmux `fxn-r7-preview`） |
| chunk hash 三方互证 | `dist/_astro/world.D74ett3S.js` sha256 = 服务口 `GET :4471/website/_astro/world.D74ett3S.js` sha256 = R5 记录值，三方**逐字节一致** `1a762db396d6e8dea7bf04250a56fde03ab10c73645a81a63c84620d3b3b84eb`——被测对象与 R5 审计对象为同一构建产物，R5 §1–§3 证据复用合法性成立 |
| 特征串 | bundle 内含 C5/C6 特征串 `idle-nudge`（×2）/ `quest-`（×31）/ `brake-first` / `suspension-jump` / `speedtrap` 全数在位 |
| 端口环境事实 | 全新 VM：kickoff 时 `ss -tlnp` 无任何 4xxx 监听，零陈旧 preview；本轮全部取证只指 **4471** |
| SwiftShader 纪律 | 与 R5 同环境（软渲染）：`t`/墙钟/fps 仅用于排序与存在性判定，全部计时类锚点不判 |

### 1-R9. R9 环境重建与指纹互证（新 VM，取证前置，已互证）

| 项 | 读数 |
|---|---|
| 环境 | 全新 VM（kickoff 时 `ss -tlnp` 无任何 4xxx 监听、根盘 3% 占用零录屏残骸——R5 §1.1 事故的反面确认）；Node v22.14.0 · pnpm 10.33.3 · `pnpm install --frozen-lockfile`（锁文件不漂移）→ `pnpm build`（**19 pages**，与 R5/R7 记录一致）→ `pnpm preview --host 0.0.0.0 --port 4473`（tmux `fxn-r9-preview`，**全新端口 4473**） |
| chunk hash 三方互证 | `dist/_astro/world.D74ett3S.js` sha256 = 服务口 `GET :4473/website/_astro/world.D74ett3S.js` sha256 = R5/R7 记录值，三方**逐字节一致** `1a762db396d6e8dea7bf04250a56fde03ab10c73645a81a63c84620d3b3b84eb`——R9 被测对象与 R5/R7 审计对象为同一构建产物，§2.1/§2.2（L4/L5）与 R5 §1–§3 证据接续合法性成立 |
| 特征串 | world chunk 族内 C5/C6 特征串 `idle-nudge`（×2）/ `quest-`（×31）/ `brake-first` / `suspension-jump` / `speedtrap` 全数在位（dist 全量 rg 清点） |
| 取证浏览器 | Playwright Chromium（headless shell 151.0.7922.34），SwiftShader 软渲染——`t`/墙钟/fps 仅用于排序与存在性判定，全部计时类锚点不判（纪律与 R5/R7 同） |
| 归档前缀 | 本轮录屏/截图/dump 归档 `/opt/cursor/artifacts/`（`fxn_r9_*`）——⚠ 后随 VM 回收消亡（§1-R9F 留痕）；耐久正本见 §2.3R 重采（`docs/spec/assets/fxn-audit/`） |

### 1-R9F. R9-FINISH 环境重建与指纹互证（新 VM，取证前置，已互证）

| 项 | 读数 |
|---|---|
| 环境 | 全新 VM（无 tmux 会话、无任何 4xxx 监听、`/opt/cursor/artifacts/` 为空——R9 的 L6 取证产物随旧 VM 消亡，事实留痕）；Node v22.14.0 · pnpm 10.33.3 · `pnpm install --frozen-lockfile`（锁文件不漂移）→ `pnpm build`（**19 pages**，与 R5/R7/R9 记录一致）→ `pnpm preview --host 0.0.0.0 --port 4474`（tmux `fxn-r9f-preview`，**全新端口 4474**） |
| chunk hash 三方互证 | `dist/_astro/world.D74ett3S.js` sha256 = 服务口 `GET :4474/website/_astro/world.D74ett3S.js` sha256 = R5/R7/R9 记录值，三方**逐字节一致** `1a762db396d6e8dea7bf04250a56fde03ab10c73645a81a63c84620d3b3b84eb`——本会话被测对象与 R5–R9 审计对象为同一构建产物，§2.1–§2.3 证据接续合法性成立 |
| 取证浏览器 | Playwright Chromium（`--enable-unsafe-swiftshader`，SwiftShader 软渲染）——`t`/墙钟/fps 仅用于排序与存在性判定，全部计时类锚点不判（纪律与 R5–R9 同） |

## 2. S-5 v1.0 L4–L7 四腿取证（接续 R5 §2–§3 的 S-2 + L1–L3）

> 每腿全新 browser context（首访清存储实证 ls/ss=0）；SwiftShader 纪律照 §1；录屏/截图/dump 归档 `/opt/cursor/artifacts/`（`fxn_r7_*`）——⚠ 该 ephemeral 归档位随各轮 VM 回收消亡（教训已吸收）：dump 摘录以本报告逐腿表格为正本，L6 腿另有 §2.3R 重采耐久正本落库 `docs/spec/assets/fxn-audit/`。

### 2.1 L4 reduced-motion（emulateMedia RM，桌面 1440×900）

**通过（五面全证，103s 收口）**：

| 被测项 | 观察 | 证据 |
|---|---|---|
| 不自动挂载 | 首帧 `data-blocked="reduced-motion"` + 显式进入按钮「进入科技城」可见可点 | 截图 `fxn_r7_l4_01_rm_blocked.png` |
| 终态直出 | 显式进入后 `world-reveal #2/t29426` → `robot-idle #3/t29426`（**Δt=0ms** 同拍落定） | dump `session-dump-s5-l4-rm-20260827.json`；env `reducedMotion:true` |
| 变形 instant swap | CTA 点击 → `transform-start #4/t53762` → `world-transform #6/t53763`（**Δt=1ms**）；chip「下一站 概念车库 141m 1/5」随 car_ready 同拍激活（`world-quest{shown,step:1} #7/t53780`） | 截图 `fxn_r7_l4_03_car_ready_chip.png`；录屏 `fxn_r7_l4_reduced_motion_20260827.webm` 01:07–01:15 |
| 文字状态可读 | robot_idle「机器人形态 · 座舱 AI 就位——点击『变形 · 巡航态』或按 Space」→ car_ready「巡航态 · CarConcept 已落地十字路口——WASD 即刻可开」两稿接力 | 截图同上 |
| 核心路径可完成 | W → `world-drive-start #8/t81456`，`data-world-state=driving`；遥测 speedKmh 7.6 / grounded true | 截图 `fxn_r7_l4_04_driving.png`；录屏 01:26–01:42 |

funnel 前五步齐（reveal 29426 / robotIdle 29426 / transformStart 53762 / carReady 53763 / driveStart 81456）；dropped 0；零 pageerror。

### 2.2 L5 触屏（375×812 · hasTouch · isMobile · dpr2，CDP 真触摸）

**两段全通过**：

| 段 | 观察 | dump 锚点 |
|---|---|---|
| A 摇杆驾驶（ritual 全链） | 375 视口 `data-blocked="viewport"` 不自动挂载 → 显式进入；状态行触屏分稿「点按『变形 · 巡航态』启动」（零键盘键位）；点按 CTA → car_ready + chip 同拍激活；CDP 真触摸中心持杆上右拖 → `nippleActive=true, progress=1.00, speedKmh=29.2`，`data-world-state=driving` | env `{touch:true, viewport:375×812}`；`transform-start #4/t85574` → `world-transform #6/t125170` → `world-quest{shown,step:1} #7/t125190` → `world-drive-start #8/t143398`；dump `session-dump-s5-l5a-touch-joystick-20260827.json`；截图 `fxn_r7_l5a_04_joystick_driving.png`；录屏 `fxn_r7_l5a_touch_joystick_20260827.webm` 02:07–02:35 |
| B 点标点进站（`?poi=concept-garage` 深链） | 出生落圈（链首站到站 + 顺位推进 2/5「座舱语音舱」与 R5 L1 同判）；相机就位后标点摆入屏内 (93,577)，**持按标点** → `world-poi` → 前奏 shot → 导航落 `/website/lab/car-configurator/`（楼=分区映射正确）；counters poiEnters/poiInteracts 双 1 | `deep-link #2/t4108` → `poi-bounding-in #5/t19540` → `explore-progress{n:1} #6` → `world-quest{reached,step:1} #7` → `world-quest{shown,step:2,voice-pod} #8` → `world-poi{concept-garage} #9/t66046` → `shot-apply{poi_showcase-concept-garage} #10/t66048`；funnel firstPoiIn 19540 / firstPoiInteract 66046；dump `session-dump-s5-l5b-touch-poi-20260827.json`；截图 `fxn_r7_l5b_r3_round0_before_tap.png` / `fxn_r7_l5b_02_after_entry.png`；录屏 `fxn_r7_l5b_touch_poi_entry_20260827.webm` 00:38–01:57 |

方法留痕（诚实入账）：① 瞬时 `touchscreen.tap` 在软渲染 ~1–3fps 下 touchstart/touchend 整体落在相邻两 tick 之间，`Pointer.update()` 观测不到 down 沿——**环境伪影非产品缺陷**（真机 60fps 下 tap 天然跨多帧；`Pointer.ts` 双缓冲 tick 结算为既有设计），取证改用「持按 ~3s 再抬手」的环境等价操作（位移 <25px 点击阈值内，`RayCursor.ts` click 判定原样走通）；② 标点屏幕坐标经 `#debug` 只读句柄相机投影获得（R5 L2 `#debug` 置位判例同构，只读不改状态）；③ dump 抢存于导航前轮询（Astro View Transitions SPA 换页不触发 pagehide，R5 pagehide 暂存法在本路径失效——方法修正留痕）。

### 2.3 L6 `?quality=2` 降档（桌面 1440×900，单会话七步闭环——上轮 84 登记点名缺口）

**通过（单一 Q2 会话七步全闭合，194s 收口；R9 取证）**：`?quality=2#debug` 首访清存储实证 ls/ss=0；env `{quality:2, reducedMotion:false, viewport:1440×900}`（显式档禁用自动降档，全程零 `quality-auto-drop`）。

| 被测项 | 观察 | 证据 |
|---|---|---|
| 恒等门 | robot_idle 期 chip `display:none` + 零 `world-quest` 事件（激活推迟到 car_ready） | 截图 `fxn_r9_l6_01_q2_robot_idle.png` |
| 变形 | CTA 点击 → `transform-start #4/t59586` → `world-transform #6/t92729`；chip「下一站 概念车库 141m 1/5」随 car_ready 同拍激活（`world-quest{shown,step:1} #7/t92748`），状态行/全键位 hint 照常 | 截图 `fxn_r9_l6_02_q2_car_ready_chip.png` |
| 驾驶 | W → `world-drive-start #8/t104936`，遥测 speedKmh 14.2→53.8 / grounded true，`data-world-state=driving` | 截图 `fxn_r9_l6_03_q2_driving.png` |
| 进站（同会话闭合） | 驶入 concept-garage 触发圈 → `poi-bounding-in{concept-garage} #9/t142062` → `explore-progress{n:1} #10` → `world-quest{reached,step:1} #11` → `world-quest{shown,step:2,voice-pod} #12/t142063`（链推进 2/5 + 探索 1/12 同拍）；持按 E → `world-poi{concept-garage} #13/t153282` → `shot-apply{poi_showcase-concept-garage} #14/t153282` → 前奏后导航落 `/website/lab/car-configurator/`（楼=分区映射正确） | 截图 `fxn_r9_l6_04_q2_bounding_in.png`（圈内 + 进站标点 + chip 2/5 同框）/ `fxn_r9_l6_05_configurator_landing.png`；录屏 `fxn_r9_l6_quality2_20260828.webm`（⚠ 本行三件产物随 R9 VM 回收消亡——Codex P1 点名；耐久正本见 **§2.3R 重采**，本表 dump 摘录按真实世系原样保留） |

funnel **七步全齐**（reveal 16279 / robotIdle 44048 / transformStart 59586 / carReady 92729 / driveStart 104936 / firstPoiIn 142062 / firstPoiInteract 153282）；counters poiEnters/poiInteracts 双 1；schema 1 · 14 events · dropped 0 · 零 pageerror。dump `session-dump-s5-l6-q2-20260828.json`。**Q2 轨零功能性缺失**——chip/光柱/触发圈/进站前奏/导航全链与 Q0 轨行为一致（P5 面同证）。

方法留痕（诚实入账）：中途以 `#debug` 句柄置车体 (125,−18) 朝 +X 后**真实持 W 驶入**触发圈——e2e FB-04/FB-09「置位即真值」同判例（SwiftShader ~1fps 下 141m 自然驾驶墙钟不可承受的环境等价操作；置位本身不触发任何 POI/quest 事件，入圈/进站均由真实驾驶与持按 E 产生）；E 进站沿用 L5 持按判例（瞬时按键在软渲染下 down 沿可能落于相邻 tick 之间）。

### 2.3R L6 重采 + hint-recall 补证（CODEX-CLEAR 取证；耐久正本 in-repo）

> 背景：§2.3 的 R9 三件产物（录屏/截图/dump 文件）随旧 VM 回收消亡（§1-R9F 已留痕），Codex P1 判「另一 reviewer 无法核验」；同时 P2 点名 F5=90 段锚的「提示可再唤出」只有 R5 L3 的 defer（深链会话 Reveal 键位卡未挂载，H 不适用——冻结安排即「ritual 会话 L6 复测」），R9 L6 未执行该复测。本节以**单一 Q2 ritual 会话**一次清两账；全部产物落库 `docs/spec/assets/fxn-audit/`（rubric §3.2-3 归档位），永别 ephemeral 路径。

**环境（取证前置，已互证）**：新 VM 零 4xxx 监听；独立构建 worktree checkout **登记对象 `771b1e4`**（非合并树——merge 带入的 #101 voice-pod 属 src 面，指纹必漂）→ `pnpm install --frozen-lockfile` → `pnpm build`（19 pages）→ `pnpm preview --host 0.0.0.0 --port 4475`（全新端口）；`dist/_astro/world.D74ett3S.js` sha256 = 服务口 GET 同文件 sha256 = R5–R9F 登记值 `1a762db3…3b84eb` 三方**逐字节一致**——重采对象与登记对象为同一构建产物。Playwright Chromium `--enable-unsafe-swiftshader`，桌面 1440×900，全新 context 首访清存储实证 **ls/ss=0**；env `{quality:2, reducedMotion:false, backend:webgl2, vehicle:physics}`。

**通过（Q2 七步闭环 + hint 召回双路，单会话约 10min 墙钟收口）**：

| 被测项 | 观察 | 证据（均为仓库相对路径） |
|---|---|---|
| 恒等门 | robot_idle 期 chip `display:none` + 零 `world-quest` 事件 | `docs/spec/assets/fxn-audit/fxn_l6r_01_q2_robot_idle.png` |
| 变形 | CTA → `transform-start #4/t114699` → `world-transform #6/t186102`；chip「下一站 概念车库 141m 1/5」与 `hint-shown #5` 随 car_ready 同拍（`world-quest{shown,step:1} #7/t186118`） | `fxn_l6r_02_q2_car_ready_chip_hint.png` |
| hint 超时淡出 | `hint-dismissed{by:timeout} #8/t291424`，卡片 hidden 实证 | `fxn_l6r_03_q2_hint_faded.png` |
| **H 键召回（R5 L3 defer 清账）** | 按 H → `hint-recall{via:key} #9/t320045`，键位卡整卡重现且**常显**（不再自动淡出） | `fxn_l6r_04_q2_hint_recall_key.png`（卡片 + `#debug` 事件流 #8→#9 + chip 1/5 同框三方互证） |
| **按钮召回（触屏入口同路径）** | H 收起（`hint-dismissed{by:input} #10`）→ 点击 `[data-world-hint-recall]`「键位 H」按钮 → `hint-recall{via:button} #11/t373615` → 再 H 收起（`#12`）——toggle 双向、双入口全闭环 | `fxn_l6r_05_q2_hint_recall_button.png`（事件流 #10→#11 同框） |
| 驾驶 | W → `world-drive-start #13/t402293`，`data-world-state=driving` | `fxn_l6r_06_q2_driving.png` |
| 进站（同会话闭合） | 置位 (125,−18) 朝 +X 后真实持 W 驶入 → `poi-bounding-in{concept-garage} #14/t500182` → `explore-progress{n:1} #15` → `world-quest{reached,step:1} #16` → `world-quest{shown,step:2,voice-pod} #17`（链推进 2/5 + 探索 1/12 同拍）；持按 E → `world-poi{concept-garage} #18/t536480` → `shot-apply{poi_showcase-concept-garage} #19/t536480` → 前奏后导航落 `/website/lab/car-configurator/` | `fxn_l6r_07_q2_bounding_in_chip2.png` / `fxn_l6r_08_configurator_landing.png` |

funnel **七步全齐**（reveal 29241 / robotIdle 79266 / transformStart 114699 / carReady 186102 / driveStart 402293 / firstPoiIn 500182 / firstPoiInteract 536480）；counters poiEnters/poiInteracts 双 1、transforms 1、respawns 0；schema 1 · **19 events · dropped 0 · 零 pageerror**。正本：dump `docs/spec/assets/fxn-audit/session-dump-s5-l6r-q2-20260828.json` + 录屏 `docs/spec/assets/fxn-audit/fxn_l6r_q2_hint_recall_20260828_8x.mp4`（8x 速压制，SwiftShader 慢动作压回近实速观感）+ 采集断言汇总 `fxn_l6r_capture_summary_20260828.json`（首访存储读数/pageerror 清单/quest console 随行）。

方法留痕（诚实入账）：① 置位驶入与持按 E 判例同 §2.3（置位即真值，入圈/进站均由真实驾驶与持按产生）；② hint 淡出等待用 L7 判例时间快进（`ticker.maxDelta` 1/30→0.15，淡出后即复位 1/30）——`HINT_FADE_DELAY=4` 设计秒沿 `ticker.delay` 真实到期触发，检测/收起管线零置位零旁路；③ H 召回走 Playwright 真实键事件（Inputs 为 keydown 事件驱动 + `active` 沿过滤，无 tick 采样丢沿问题），按钮召回走真实鼠标点击（`noWaitAfter`——软渲染主线程繁忙下 Playwright「等待 scheduled navigations」为工具侧伪影，点击本身已派发）。

### 2.4 L7 空闲（driving 撒手 30 设计秒——上轮 84 登记点名缺口，C5 合流后首次实测；R9F 取证）

**通过（idle-30s→idle-nudge 全链 + 恢复即收 + 复触发，单会话 10:15 收口）**：`#debug` 首访清存储实证 ls/ss=0；env `{quality:0, reducedMotion:false, viewport:1440×900}`；单会话动线 = 变形 → W 入驾驶 → 撒手静默期 1 → 驾驶意图恢复 → 撒手静默期 2。

| 被测项 | 观察 | 证据 |
|---|---|---|
| 空闲沿检测 | driving 态撒手，零驾驶意图累计满 30 设计秒 → `idle-30s #12/t415490`（ux 族，OBS-C1 既有行） | dump `session-dump-s5-l7-idle-20260828.json` |
| 主动引导呈现 | 同拍消费 `idle-nudge{concept-garage} #13/t415496`（Δ6ms）：nudge 行「空闲了？往光柱方向开——下一站 概念车库 141m」呈现 + chip 脉冲；console `[quest] idle-30s 消费：空闲引导 nudge → concept-garage` 随行 | 截图 `fxn_r9_l7_02_idle_nudge.png`（nudge 行 + chip + `#debug` 事件流 #12/#13 同框三方互证，speed 0 km/h）；录屏 `fxn_r9_l7_idle_nudge_20260828.webm` |
| 引导不粘身 | 驾驶意图（W）恢复 → nudge 即收（`clearNudge`，hidden 置真），驻留式零淡出赛跑 | 截图 `fxn_r9_l7_03_nudge_cleared.png` |
| 复触发 | 静默期 2 再满 30 设计秒 → `idle-30s #14/t607746` → `idle-nudge #15/t607748`——「有输入即重置、每静默期至多 1 条、可再打」全语义实证 | 截图 `fxn_r9_l7_04_renudge.png`；console 第二条 `[quest]` 行 |
| 世界「活着」（F6 空闲面） | 空闲期间 HUD/遥测照常心跳；Q0 轨自动降档独立照常（`quality-auto-drop ×2` t196990/t363593，perf 面与功能链互不污染）；主链完成后静默返回的「自由探索态不打扰」语义有 e2e 面覆盖 | dump 全序列 15 events |

funnel 前五步齐（reveal 28237 / robotIdle 69279 / transformStart 83295 / carReady 133525 / driveStart 142312；firstPoiIn/Interact 空——L7 腿不进站，非缺口）；counters transforms 1 / respawns 0；schema 1 · 15 events · dropped 0 · 零 pageerror。

方法留痕（诚实入账）：本会话 SwiftShader 实测 ~0.7fps，`ticker.delta` 钳制 1/30（`Ticker.maxDelta`）→ 静默期实测设计时累积速率 0.024 设计秒/墙钟秒，30 设计秒真实等待投影 **1255s** 不可承受——环境等价操作：静默期内经 `#debug` 句柄将 `ticker.maxDelta` 1/30→0.15（时间快进 ≈5×），驾驶操作前复位 1/30。沿检测（idleClock 逐拍累计、≥30 阈值比较）、消费（`idleNudge()`）与收起（`clearNudge()`）管线**全部真实执行，零置位零旁路**（L6「置位即真值」判例同构）；两次触发的沿条件均为真实设计秒跨越，物理全程稳定（respawns 0，零污染事件）。

## 3. 逐维打分（Pass B 冻结锚点向量，rubric v1.0 §2.2）

| 维 | 权重 | 分 | 锚点依据（证据索引） |
|---|:---:|:---:|---|
| F1 首幕可懂 | 15% | 85 | R5 §2：CTA/状态行/键位 hint 三层接力 + 三问全对 + chip 恒等门实证；「0:15」高段计时锚 SwiftShader 禁判恒锁 85 |
| F2 操作反馈 | 20% | 85 | R5 §2 + e2e FB：boost/BRAKE 徽标双沿、悬挂弹跳 chip、respawn 双语义 toast、降档 toast——C6 后确认层缺口清零（`brake-first #11` / `suspension-jump #12` 埋点互证）；「≤100ms」计时锚禁判恒锁 85 |
| F3 驾驶乐趣 | 15% | 85 | R5 §2 速度感/双视角/复位友好 + C5 光柱与 chip 解自然寻路（L1 链顺位推进、L6 真实驶入触发圈）+ C6 测速牌玩点（e2e FB-09 `world-speedtrap`）——上轮 75 的「寻路费力」病根已由 C5 修复；「≤3s 恢复+主动继续」计时子句禁判，止于 85 |
| F4 POI 游戏化 | 15% | 85 | L1 深链出生落圈 + L5b 触屏点标进站 + L6 Q2 同会话驶入进站落 car-configurator（楼=分区映射三证）；「30s 自然吸引」计时锚禁判，止于 85 |
| F5 人性化 | 15% | 90 | 五腿全过（90 段锚原文）：L2 失败恢复三路径（翻车自救/R/fall 重生）+ L3 ESC 双出口 + **提示可再唤出直证（§2.3R：`hint-dismissed{timeout}#8` → `hint-recall{via:key}#9/t320045` → `{via:button}#11/t373615` 双入口闭环——R5 L3 defer 清账，Codex P2 点名项）** + L4 RM 五面全证 + L5 触屏两段 + **L6 Q2 单会话七步闭合（§2.3 取证 + §2.3R 重采耐久正本 in-repo）**；误触无惩罚（S-2 变形窗 CTA disabled 实证） |
| F6 目标/进度 | 10% | 90 | 90 段锚逐项：可见可选目标（chip「下一站」+ 光柱）+ 进度呈现（step n/5 + 探索 n/12 双计数）+ 完成反馈（chain-complete，e2e 面）+ **空闲主动引导实测（§2.4：双静默期 idle-30s→idle-nudge、恢复即收）** + 全部可无视（可折叠、pointer-events 穿透、非强制不阻断） |
| F7 可观测完备 | 10% | 95 | 当轮白名单族全接通（goal `world-quest` / ux `idle-30s`+`idle-nudge` / drive `brake-first`+`suspension-jump` 均实测入账；challenge `world-speedtrap` e2e FB-09 承接）；dump 可导出（`__worldSession` 轮询 + `#debug` EXPORT 实测 `session-7d800a3d.json`）；funnel/counters/dropped 齐；L7 会话 15 events · dropped 0 · 零 pageerror |

合成 = 85×.15 + 85×.20 + 85×.15 + 85×.15 + 90×.15 + 90×.10 + 95×.10 = **raw 87.25 → 87**。反凑分校验（rubric §2.3）：无 ≤70 维，通过。

## 4. 双 Pass 合议与裁决

| Pass | 分 | 口径 |
|---|:---:|---|
| Pass A（脚本执行观察） | 86 | 执行者视角七维初分：F6 落 85——空闲引导呈现面成立但形态克制（单行文字 + chip 脉冲，无 attract 相机候选），执行观感按 70-85 段上缘记 |
| Pass B（冻结锚点逐条） | 87 | §3 向量：F6 按 90 段锚原文逐项过（锚点不含 attract 形态要求，「空闲时世界主动给引导」已实证） |

**合议**：分歧 1（≤10），无需逐维仲裁，按 §3.1 采用证据更完整的 **Pass B = 87**。

**封顶复核**：真机 S-2 缺席 → wave2 §1.2 云端从严封顶 87（F7 95）～88（F7 100）；本轮 87 未越顶，**90 禁登**（F1/F2/F3/F4 计时高段锚 SwiftShader 禁令下恒锁 85，数学上 90 不可达——90 顺延至真机计时增补轮，advisor「轻量 R4」预案照旧）。

**裁决**：有条件放行，未过 90。上轮 84 → 本轮 **87**（+3：F3 75→85 系 C5 寻路修复、F5 85→90 系 L6 闭合、F6 75→90 系 C5 目标线 + L7 空闲引导实测）。登记落 `cyber-city-function-rubric-score.json`；没有条件腿 skipped。

**CODEX-CLEAR 清账复核（2026-08-28）**：Codex 三条阻断全清——① 看板漂移：#103 并入 `main@88097f9`（merge 保世系），看板刷新归 [#109](https://github.com/rayw-lab/website/pull/109)，本分支零看板改动零冲突；② L6 证据消亡：§2.3R 在登记对象同指纹（`1a762db3…3b84eb` 三方互证）上重采，正本落库 `docs/spec/assets/fxn-audit/`；③ F5 hint-recall：`via:key`/`via:button` 双路直证并入 §2.3R 同会话。**分值零变动**：F5=90 的段锚证据由 defer 转直证，合成 87 与封顶判读原样保持（真机缺席云端 87–88，**90 仍禁登**——顺延指挥官真机 S-2 → AL-R10）。
