# CC-NAV-C1 F3 R4 破门证据固化单（BROKEN_GATE）

> 本单为 docs-only 证据固化，不含任何代码/配置改动，不代表 #166 产品或用例结论。
> 禁令遵守：本单未运行任何 playwright/preview/build/install/--list，未修改 src/e2e/config，未触碰 #166 分支。
> 固化时间：2026-08-29 21:30 CST（Asia/Shanghai）；机器：wangleideMacBook-Pro-3.local（macOS 26.6.2, arm64, Apple M5）。

## 1. SHA 与世系

| 项 | SHA | 说明 |
| --- | --- | --- |
| main | `eed86406de08521f39c0906d27973757faab5078` | origin/main（#193），本单开工时主仓 status 干净且与之同点 |
| candidate | `b4694cf2389315156616a99bc88d3228344b8746` | e3dec41 第一父；CC-NAV-C1 候选支 tip |
| integration | `e3dec419eb24883aae2bd4e452484d14d7ac0af4` | `/tmp/f3r4` 集成 HEAD；merge(b4694cf + eed8640) |
| #192 | `211d9d9` | `git merge-base --is-ancestor 211d9d9 e3dec41` 实跑为真（祖先证） |

`/tmp/f3r4` 与主仓在原命令执行前 status 均干净（本单开工复核：无任何 porcelain 条目）。

## 2. 准备工作核证（install / build / bind / pre-ps / 84-18 账面）

- **install**：无独立日志存活；live 核证 `/tmp/f3r4/node_modules` 存在，且 e2e-results 的 `config.argv` 即从该 node_modules 启动 Playwright CLI → install 已完成。
- **build**：无独立日志存活；live 核证 `/tmp/f3r4/dist/` 存在 21 项（含 `_astro/`、`about/`、`ai-lab/`、`contact/` 等）→ build 产物在位。
- **4491 bind**：kill 前 `lsof -nP -iTCP:4491 -sTCP:LISTEN` 实测 LISTEN（node 81069, 127.0.0.1:4491）；孤儿服务 `HTTP GET /website/` 返回 **200**（7ms）→ 服务本体健康。
- **pre-ps**：`PID 81069, PPID=1`，启动时刻 `Sat Aug 29 21:10:00 2026`，argv `/opt/homebrew/Cellar/node/25.9.0_1/bin/node /private/tmp/f3r4/node_modules/.pnpm/astro@7.2.4_*/node_modules/astro/bin/astro.mjs preview --port 4491 --host 127.0.0.1 --json`。
- **84/18 账面**：candidate b4694cf 登记 `docs/research/cyber-city-test-framework.md:81`「CC-NAV-C1（#166 合入后）**84 tests / 18 files**」（#182 A-⑤，main@52887e5 基线 81/17 → +3）。本单禁跑 `--list`，未复核计数本体，仅引用登记。

## 3. 原命令与原始结果

- 原命令（e2e-results.json `config.argv` 原文，cwd `/tmp/f3r4`，configFile `/private/tmp/f3r4/playwright.config.ts`）：
  `node /opt/homebrew/Cellar/node/25.9.0_1/bin/node /private/tmp/f3r4/node_modules/@playwright/test/cli.js test --workers=1`
- 墙钟：`/tmp/f3r4.start` = `START 2026-08-29 21:09:57 CST`，`/tmp/f3r4.end` = `END 2026-08-29 21:10:00 CST` → 约 **3 秒**；Playwright stats duration 2320.16ms。
- **RAW_EXIT=1**（`/tmp/f3r4.log` 尾行 `EXIT=1`）。
- 原命令只执行过一次；日志 `/tmp/f3r4.log` 全文 435 字节，仅含 WebServer node 警告与下述 error，无任何用例输出。

## 4. 原始 results 账（未加工）

- `test-results/e2e-results.json`：**`suites: []`**；`errors: ["Error: Process from config.webServer exited early."]`；`stats`：expected/unexpected/flaky/skipped 全 0；projects 7 个（desktop-chromium/mobile-375/car-chromium/world-chromium/world-perf-chromium/city-perf-chromium/visual-chromium）。
- `test-results/.last-run.json`：`{"status": "failed", "failedTests": []}`。
- **QUALIFIED_82 = NOT_RUN**。0 suites = 0 用例执行；84/18 资格账未跑，**不得判 82 过门**（NOT_RUN ≠ PASS）。

## 5. 根因链（producer → consumer，全部一手行号）

1. **producer（OMP worker 环境）**：会话 env 实测含 `AGENT=1`、`CI=true`、`CLAUDECODE=1`。
2. `am-i-vibing@0.4.0` `dist/detector-Boc_-HQ9.mjs:29`：provider `claude-code`（type agent）检测变量即 `envVars: ["CLAUDECODE"]` → `detectAgenticEnvironment()` 判 agent。
3. `astro@7.2.4` `dist/cli/agent.js:2-6`：`isRunByAgent()` 返回 `detectAgenticEnvironment().type === "agent"` → true。
4. `astro@7.2.4` `dist/cli/preview/index.js:40`：`const agentDetected = !process.env.ASTRO_PREVIEW_BACKGROUND && isRunByAgent();` → true；`:58-59`：`if (flags.background || agentDetected) { await background({...}) }` → **preview 被 daemonize，父进程退出**（孤儿 PID 81069, PPID=1）。
5. **consumer（Playwright webServer）**：`playwright.config.ts:138-143` `command: pnpm preview --host 127.0.0.1 --port 4491`（`PORT = process.env.E2E_PORT ?? 4321`，R4 以 E2E_PORT=4491 注入）。webServer 进程 fork 后台后立即退出 → Playwright 判 `Error: Process from config.webServer exited early.` → 0 suites，EXIT=1。
6. 结论：孤儿 preview 存活且服务 200 —— **服务与站点无恙；破的是 webServer「父进程存活」语义**。

## 6. Verdict

- **BROKEN_GATE**：宿主启动语义破门（OMP agent-detection env × Astro 7.2.4 preview 后台化 × Playwright webServer 父进程存活检查）。
- **非 #166 产品/用例失败**：0 suites，无任何断言执行，不构成对 minimap 用例或产品行为的任何判断。
- **R4 未重跑**：Controller 已中止原 OMP worker 并明令禁止同标签重跑；本单仅为证据固化与清场。

## 7. 下一步（仅登记候选，不在本单实施）

只能另立 **R5**；R5 任务包须在不改仓库配置/命令主体的前提下**显式前台运行**。候选：

- **a）外层 env 去 agent 检测变量**：以 `env -u CLAUDECODE -u AGENT ...`（或等价方式）启动 Playwright，使 `isRunByAgent()` 为 false。最小改动；注意 `CI=true` 仍会被 Playwright/其他路径读取，需一并评估。
- **b）`ASTRO_PREVIEW_BACKGROUND=<非空>`**：依 `preview/index.js:40`，该变量非空即令 `agentDetected=false` 走前台；一行 env 注入，与 a 可叠加。
- c）其他（如 Astro 显式 foreground 开关）未核证存在性，不登记为可行项。

## 8. 清场结果与临时证据

- PID 81069 精确 kill（kill 前 double-check command 含 `/private/tmp/f3r4` 且监听 4491）；等待后 `lsof -iTCP:4491 -sTCP:LISTEN` 空表（rc=1）→ **4491 无 listener**。
- `/tmp/f3r4` worktree：status 干净无用户改动 → 主仓 `git worktree remove` 摘除；本证据 worktree push 后同法摘除。
- 临时证据（/tmp，易失，本 PR 即持久化载体）：
  - `/tmp/f3r4.log`（435B，原文未动）
  - `/tmp/f3r4.start`（30B）/ `/tmp/f3r4.end`（28B）
  - `/tmp/f3r4-e2e-results.json`（4520B 副本）
  - `/tmp/f3r4-last-run.json`（45B 副本）
  - `/tmp/f3r4-astro-preview-agent-snippet.txt`（agent.js 全文 + preview/index.js L38-62 + am-i-vibing detector L27-31 摘录）
- Ownership 尊重：未触碰 `/Users/wanglei/workspace/website`、主仓工作文件、#166 分支、`cursor/cc-loop-audit-*`、非 `/tmp/f3r4` 进程、CAM/真机/安卓件。
