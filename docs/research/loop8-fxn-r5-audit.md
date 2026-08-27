# Loop 8 功能独立复审 R5（CC-AL-FXN-R5）

> 执行模型自报：**claude-fable-5-thinking-xhigh**

> ⏳ 取证进行中（本文件随每条腿完成增量提交；最终登记以 `cyber-city-function-rubric-score.json` 为准）。

## 0. 审计事实（kickoff）

| 项 | 审计事实 |
|---|---|
| 审计对象 | `main@dc3f56b`（含 FXN-C5 #90 + FXN-C6 #91 + VIS-X1A-R4 #92 + X3 e2e #93；审计分支 `cursor/cc-al-fxn-r5-1d6f`，独立 worktree `/tmp/wt-al-fxn-r5`） |
| 比较基线 | 上轮登记 `main@66ed0fe`（84 分，`loop8-fxn-audit.md`）；R4（`main@5fc9533`）70min 卡骨架被 stop，零证据入账 |
| 冻结秤 | `docs/spec/cyber-city-function-rubric.md` v1.0 |
| 脚本 | S-2 v1.0 + S-5 v1.0（L1–L7 全腿） |
| 真机腿 | **缺席**——按任务书裁决：F1/F2 计时高段锁 85，不伪造 90 |
| 端口纪律 | 吸取 R4 事故：本轮 preview 用全新端口并以构建指纹（当轮 commit 特征交付件在页面/资产中可见）互证后才开始取证 |

## 1. 环境与指纹（取证前置，已互证）

| 项 | 读数 |
|---|---|
| 环境 | Node v22.14.0 · pnpm 10.33.3 · `pnpm install --frozen-lockfile`（锁文件不漂移）→ `pnpm build`（**19 pages**，dist 16M）→ `pnpm preview --host 0.0.0.0 --port 4444`（tmux `fxn-r5-preview`） |
| 构建指纹互证 | 服务口 `GET /website/_astro/world.D74ett3S.js` sha256 `1a762db3…3b84eb` 与本轮 `dist/_astro/world.D74ett3S.js` **逐字节一致**；bundle 内含 C5/C6 特征串 `speedtrap` / `brake-first` / `suspension-jump` / `idle-nudge` / `quest-`——确认被测对象就是 `main@dc3f56b` 当轮构建，非陈旧服务器 |
| 端口环境事实 | 取证时 VM 上仍有 20+ 个历史轮次陈旧 preview/dev 服务器（4321/4322/4329/4331…4602），R4 报告的 4337 陈旧口至今在跑——R5 全部取证只指 4444 |

### 1.1 环境事故留痕（R4 病根定位 + 本轮排除）

R5 开工时根盘 **100% 满（252G/252G，0 可用）**，`pnpm build` 在 vite deps 阶段 ENOSPC 失败。取证定位：`/opt/cursor/recording-staging/` 累计 **236G**，其中 R4 会话 16:12 启动的**僵尸录屏 ffmpeg（PID 96632）持续录制 4h05m 未停**，单文件 `recording_render_proxy_1080p.mp4` 膨胀至 **193GB**，另有 17 个更早轮次录屏残骸。这解释了 R4「70min 卡骨架零产出」的环境侧病根：录屏未收口 + 磁盘被实时吞噬。处置：按 PID 终止该 ffmpeg、清空 staging 残骸与 FXN 世系历史 worktree（~1.6G），盘位恢复 232G 可用后重建通过。**本轮零录屏悬挂**：每段录屏当腿保存收口。

（逐腿取证、逐维打分、双 Pass 合议与裁决随取证增量回填。）
