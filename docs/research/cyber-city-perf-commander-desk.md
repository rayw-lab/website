# 性能首分·指挥官桌面执行单（CC-PERF-DESK）

> 执行模型自报：**claude-fable-5-thinking-xhigh**

| 项 | 内容 |
|----|------|
| Task | **CC-PERF-DESK**（doc-only）——把 R2 顾问报告 + 真机 runbook 压成一页可勾选执行单：六腿核对表 + 冻结 main 合流窗口话术 + §5.4 回填后派 CC-AL-PERF 的一句话任务书骨架 |
| 分支 | `cursor/cc-perf-desk-1d6f`（base：`main` @ `771b1e4`） |
| 日期 | 2026-08-27 |
| 性质 | **桌面执行单，不是秤、不是手册正本**：判定口径正本 = `docs/spec/cyber-city-perf-rubric.md` v1.0（零改秤）；回填正本与签字位 = `docs/spec/human-gate-checklist.md` §5.4；逐步手册 = `docs/research/cyber-city-perf-human-gate-runbook.md`（本单每腿一行摘要，细节照手册 §3）；当轮事实与裁定 = `docs/research/cyber-city-perf-first-score-advisor-r2.md`。任何冲突以正本为准 |
| 执行人 | 指挥官（王磊）——记录行数字、门禁判定列、签字不可委托 |
| 红线 | ① 产不出留空不伪造：缺腿 → 对应维 `null` → 顶层 `score` 必 `null`（腿→维映射见 runbook §5.1）；② 顾问报告 §5 预计区间（75–95）**禁止**写入 §5.4 表或登记 JSON；③ CI/SwiftShader 读数永不上桌；④ 为凑读数裁剪脚本 = S4 击穿，登记无效 |

**被测对象**：生产 `https://rayw-lab.github.io/website/`。每腿无痕窗清存储首访；顶栏后端徽标（`[data-world-backend]`）每腿入镜；动作脚本 = 变形 → 驾驶，途中 **2 急转 + 1 撞道具 + 1 boost**（桌面 20s / 安卓 60s；触屏替代照 runbook §2.3 并在记录行注明）。

---

## 1. 开窗前核对（全勾才开跑）

- [ ] 桌面 Chrome 最新稳定版（版本号入表）；**中端安卓真机**（2019 后，Adreno 61x / Mali-G5x 级）+ USB 调试开启 + `chrome://inspect` 可见。无安卓 → 只跑腿 1/2/6，安卓三腿留空入 `debts`（P1、P5 `null`，顶层仍 `null`，northStar 照显 `—`）
- [ ] 录屏（桌面系统录屏/OBS；安卓自带）与秒表就位
- [ ] 向父代理发【话术 A】冻结 main，确认合并队列已排空
- [ ] 记录部署 commit（`gh run list` Deploy 行 = main tip）：**subject = `＿＿＿＿＿＿＿`**，开窗时间 `＿＿＿＿`

## 2. 六腿核对表

每腿三件套 = 全程录屏 + 尾段读数截图 + §5.4 记录行，缺一即整腿无效；录砸整腿重来，不许拼接。腿 1–4 共同纪律（R2 增补二）：**自动降档属默认档真值**——触发时照跑照记，「场景/时长」列注明「自动降档 Qx→Qy @ 约 Xs」（toast 入镜 + EXPORT dump 的 `quality-auto-drop` 事件互证），不注明视同记录不完整，AL-PERF 有权要求整腿重跑。

- [ ] **腿 1 · 桌面 WebGPU**（§5.4 行 1 · P1 P2）：`/#debug`，徽标确认 WebGPU（无则如实注明、按实际后端计）；DevTools Performance 同录（P2 长任务互证）；脚本 20s → 读 `#debug` fps avg/1%（`__worldSpike.fps()` 互证）。**门：avg ≥60 且 1% low ≥45**。归档 `cityperf_desktop_webgpu_<yyyymmdd>.*`
- [ ] **腿 2 · 桌面 WebGL 2**（行 2 · P1 P2）：同腿 1，URL 换 `/?gl=1#debug`，徽标 WebGL 2。归档 `cityperf_desktop_gl2_*`
- [ ] **腿 3 · 安卓默认档**（行 3 · P1）：`/#debug` 清存储首访，触屏脚本 60s；后端按 `__worldSpike.backend` 实际值记。**门：持续 ≥30fps；<24fps 走三板斧/止损既有裁决**；禁用 `?quality=` 救场（显式降档是腿 5 的被测面）。归档 `cityperf_android_webgpu_*`（实际 webgl2 且与行 4 重名则追加 `-default`）
- [ ] **腿 4 · 安卓 WebGL 2**（行 4 · P1）：同腿 3，URL 换 `/?gl=1#debug`。归档 `cityperf_android_gl2_*`
- [ ] **腿 5 · Q2 降档腿**（行 5 · P5；帧率对照行 3 留档不设门）：**行 3 同设备**，`/?quality=2#debug`，触屏 60s 后驶近 hero 楼 → POI 光圈 → 进站落页 = 核心路径完成；功能性缺失清单逐项过（CTA 变形 / 驾驶输入 / 回到路口 / POI 进站 / HUD 与键位卡）。口径按 R2 §2.1 勘误后版本：显式 `?quality=` 深链**禁用**自动档、toast 不触发——「完成但反馈缺失」按 v1.0 落 70 段；画面糙属设计内梯退不算缺失；执行者能读 `#debug` 不算玩家可感知。归档 `cityperf_android_q2_*`
- [ ] **腿 6 · Fast 4G 计时腿**（行 6 · P3）：桌面行 1 同机，URL **不加 `#debug`**；先开 DevTools → Network 选 Fast 4G + 勾 Disable cache；回车即开表 → CTA「变形 · 巡航态」可点即停表 = T₁（s）；Console `__worldSession.dump().funnel.robotIdle` = T₂（ms，恒小于 T₁，差 >1s 写一句归因）。**判定取较大值：≤8s=100 / 8–10s=70 / >10s=40，无插值**。归档 `cityperf_desktop_fast4g_*`
- [ ] **收尾**：§5.4 六行逐列回填（口径照 runbook §4.1）+ 三件套入 `docs/spec/assets/human-gate/` + 门禁判定列勾判 + 签字 → 回填 commit push（或读数交 AL-PERF 随登记 PR 落库——数字与判定列必须出自指挥官本人）
- [ ] 向父代理发【话术 C】解冻并触发派单

**中断续跑**：任意缺腿可续，但续跑前先发【话术 B】核对 main tip 未动；tip 已动 = 整轮重排（读数不可跨版本拼接）。

## 3. 冻结 main 合流窗口话术（复制即用）

**话术 A · 开窗冻结**（开跑前发父代理）：

> 性能真机六腿窗口现在开启。请立即排空合并队列并**冻结 main 合流**——含视觉轨 X 系列、B2/B3 等一切改 `src/` 的 PR，doc-only PR 一并排队——直至我回填 §5.4 并通知解冻。请用 `gh run list` Deploy 行核对当前生产部署 commit 并回报，我以该 commit 为六腿被测版本与 AL-PERF 的 subject。

**话术 B · 中断续跑核对**（续跑前发父代理）：

> 六腿窗口续跑核对：请确认冻结仍生效、main tip 仍为 `<subject commit>`。若 tip 已动，本轮读数作废，我重新排窗。

**话术 C · 回填完成解冻**（回填 push 后发父代理）：

> §5.4 六行已回填、三件套已归档、签字完毕，回填 commit 已 push。**解除 main 冻结**。被测 subject = `main@<subject commit>`，请即派 CC-AL-PERF（任务书骨架见执行单 §4）。两条窗口纪律随派：① AL-PERF 全量 e2e 窗口 = VM 静默窗，期间禁止并行派其他 e2e 实跑 Task；② B2/B3 与视觉轨改 `src/` 的合流排在登记 PR 之后。

（依据：R2 §3.2 六腿同版本纪律 + §4.2 并行约束——main 每 push 自动部署 Pages，tip 漂移即击穿 S3 与 subject 钉定。）

## 4. §5.4 回填后派 CC-AL-PERF 的一句话任务书骨架（填空即发）

> CC-AL-PERF。claude-fable-5-thinking-xhigh（不可用按 AGENTS.md 明示降级并自报）。独立 worktree。钉 subject `main@<部署 commit>`：`pnpm build && pnpm preview` 复核 → 空载 VM 静默窗**全量 75/75 e2e 实跑**（retries=0、`.last-run.json` status=passed、expected=75/skipped=0/unexpected=0/flaky=0；一次跑产 S3+S5 双证据；取不得 clean 全绿则本轮**不登记**，按 R2 §3.3 预案归因留痕）→ 按 perf rubric v1.0 数值门 + S1–S5 结构门逐条判定 human-gate §5.4 六行读数 → 写 `docs/research/cyber-city-perf-rubric-score.json`（rubric §5.2 schema；任一维 `null` 则顶层 `score: null`；`scoredBy` 照 rubric 写独立审计口径）+ 审计报告 `docs/research/loop8-perf-audit.md` → northStar.perf 自动出数；随行落 runbook §3.3/§3.5 勘误两行（R2 §2.3）。分支 `cursor/cc-al-perf-loop8-1d6f`。返回 PR。

派单时点硬约束：**严格后置于 §5.4 回填 push**（rubric §5.1 禁预登记填数）；是否与 CC-VEH-R3 共享同 commit 的 clean 75/75（双销账）由父代理终拍（R2 §6-3），共享与否都必须与 AL-PERF 错峰跑。

---

*CC-PERF-DESK · 2026-08-27 — 一页桌面执行单：开窗前核对 + 六腿勾选核对表（含 B1 后腿 1–4 降档留痕义务与腿 5 v1.0 恒 70 勘误后口径）+ 冻结 main 窗口三段话术（开窗 A / 续跑核对 B / 解冻派单 C）+ AL-PERF 一句话任务书骨架与派单时点硬约束。doc-only，`src/`、e2e、config 零改动；正本恒为 perf rubric v1.0 / human-gate §5.4 / runbook。*
