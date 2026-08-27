# Loop 8 功能独立复审 R7（CC-AL-FXN-R7 · 收口轮）

> 执行模型自报：**claude-fable-5-thinking-xhigh**

> ⏳ 取证进行中（本文件随每条腿完成增量提交；最终登记以 `cyber-city-function-rubric-score.json` 为准）。

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

## 2. S-5 v1.0 L4–L7 四腿取证（接续 R5 §2–§3 的 S-2 + L1–L3）

> 每腿全新 browser context（首访清存储实证 ls/ss=0）；SwiftShader 纪律照 §1；录屏/截图/dump 归档 `/opt/cursor/artifacts/`（`fxn_r7_*`）。

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

（L5–L7、逐维打分、双 Pass 合议与裁决随取证增量回填。）
