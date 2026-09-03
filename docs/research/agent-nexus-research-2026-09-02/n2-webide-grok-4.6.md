# N2-WEBIDE｜网页端 IDE / 终端 / Agent 回放：静态可行架构

日期：2026-09-02。项目根 `/Users/wanglei/mywebsite` 只读。本文件是开工契约，不是再争论「要不要做真 IDE」。

一句话：**GitHub Pages 零后端下，可上线的是「真实会话的时间轴指挥台」，不是浏览器里的 VS Code。** Monaco + WebContainers + BYO key 三件套每一件都会撞本仓库的预算门、LHCI 门或托管头限制。第一刀做纯回放。

---

## §1 技术选型表

体积数字标来源。标「待核」的是未对本机 `pnpm` 实测 gzip 的项；标「CDN/文档」的是第三方公开读数。KB = 1024 字节口径与 `scripts/audit-budget.mjs` 一致。

| 候选 | gzip 体积（公开读数） | 许可 | 静态可行（零后端、GH Pages） | 移动端 | 推荐度 | 备注 |
|------|----------------------|------|------------------------------|--------|--------|------|
| **CodeMirror 6** `basicSetup` | **116 KB** gzip（[bundlephobia `codemirror@6.0.2`](https://bundlephobia.com/package/codemirror)）；`EditorView` 单独 60.2 KB | MIT | 是，可树摇、可按需 `import('@codemirror/lang-json')` | 一等公民（Replit 实测切 CM6 后移动留存 +70%，[Replit 对比](https://blog.replit.com/code-editors)） | **回放里的只读 JSON/TS 高亮：B 档可考虑** | 已超 Lab **S 50 KB**（`contracts.ts` L8）。单独一项就进 M。本仓无此依赖（`package.json` 只有 `three` + `rapier3d`） |
| **Monaco Editor** | `min/` 目录 **15.7 MB** 未压（[unpkg monaco-editor@0.55.1](https://unpkg.com/monaco-editor/)）；install size **72.6 MB**（[Snyk 0.55.1](https://snyk.io/advisor/npm-package/monaco-editor)）；CDN `editor.main.js` 历史 gzip **~734 KB**（jsDelivr 0.33 实测评论，[issue #463](https://github.com/microsoft/monaco-editor/issues/463)）；0.55 有人报打包 **>6 MB**（[issue #5154](https://github.com/microsoft/monaco-editor/issues/5154)，待核本仓 bundler） | MIT | 文件能托管，但 **必然超 Lab M 300 KB / world JS 900 KB** | 官方/业界口径：**桌面优先，移动不可用**（Replit：「Monaco is unusable on mobile」） | **不做** | 「像真 IDE」的观感来源。体积与触屏都否决它当默认路径 |
| **Ace** | ~300 KB min 量级（对比文，待核 gzip） | BSD | 是 | 中等 | 不做 | 被 CM6 覆盖，无增量 |
| **xterm.js** `@xterm/xterm` | **63.6 KB** gzip（[bundlephobia `xterm@5.3.0`](https://bundlephobia.com/package/xterm)）；6.0.0 MIT（[xterm.js package.json](https://github.com/xtermjs/xterm.js/blob/master/package.json)） | MIT | 是（纯前端模拟终端，**没有 pty**） | 回放可用；虚拟键盘输入差 | **回放终端：B 档可考虑；MVP 用 `<pre>` 替代** | 63.6 KB 单独已超 Lab S。无后端时只能 `term.write()` 灌录制字节 |
| **asciinema-player** v3 | install size **1.34 MB**（[Snyk](https://snyk.io/advisor/npm-package/asciinema-player)）；含 Rust WASM。独立 `asciinema-player.min.js` gzip **待核**（官方有 standalone bundle，[README](https://github.com/asciinema/asciinema-player)） | Apache-2.0 | 是，`.cast` 是静态文本 | 播放器可用 | **次选**：只当「一条终端轨」的现成播放器 | 格式 = asciicast v2 JSONL，**表达不了多 agent / receipt / 工具调用**。本楼主数据不是 tty |
| **ttyrec** | 播放器体积视实现 | 格式本身无许可问题 | 是 | 同终端 | 不做 | 二进制旧格式，生态不如 asciicast |
| **只回放、零执行**（DOM 时间轴 + `<pre>`/`<code>`） | 播放器可压到 **≤ 20 KB** gzip（自研）；trace JSON 流式，单文件可 ≤ 60 KB（对齐 TTS `singleFetchKbMax`） | 自有（随仓） | **是，且是唯一稳过门的默认路径** | 是（CSS 栅格；窄屏改单列手风琴） | **⭐ 默认** | 访客 10 秒看到的是「三路真派单在跑」，不是编辑器皮肤 |
| **StackBlitz WebContainers** `@webcontainer/api` | 运行时从 StackBlitz 域拉 Node 发行，**不是一个 npm gzip 数字** | **专有**。非营利/低用量免费；**营利生产要买 WebContainer API License**；>1 万次 API/月另计（[StackBlitz FAQ](https://developer.stackblitz.com/guides/user-guide/general-faqs)） | **否（硬）**：要 `COOP: same-origin` + `COEP: require-corp\|credentialless`（[webcontainers.io headers](https://webcontainers.io/guides/configuring-headers)）；**GitHub Pages 不能自定义响应头**（[community #13309](https://github.com/orgs/community/discussions/13309) 仍未落地）。`coi-serviceworker` 可伪造头，但会拦 `https://gc.zgo.at/count.js`（GoatCounter，`BaseLayout.astro` L135） | Chromium 友好；Firefox/Safari 嵌入限制多 | **砍（本仓托管形态）** | 另要第三方 cookie / `*.webcontainer.io` Service Worker 例外（[browser-config](https://webcontainers.io/guides/browser-config)）。个人站即使用免费档，**体验依赖访客浏览器设置** |
| **Pyodide** | `pyodide.asm.wasm` **9.15–9.61 MB** 未压，gzip 历史 **~2.75 MB**（[pyodide#6032](https://github.com/pyodide/pyodide/issues/6032)）；`python_stdlib.zip` **2.43–2.55 MB**（[npm pyodide@314.0.6](https://www.npmjs.com/package/pyodide)） | MPL-2.0 | 文件能放 `public/` 或走 jsDelivr（外部域，`audit-budget` 不计入 G-E，但 LHCI/体验会炸） | 能跑，首包致命 | **砍** | 首载 5–7 MB。Lab M 资产上限 6 MB、world 流式 12 MB 都吃紧。跑的是 CPython，不是本仓的 Node agent |
| **Sandpack** `@codesandbox/sandpack-react` | **282 KB** gzip（[Best of JS](https://bestofjs.org/projects/sandpack)），内含 CM6 | Apache-2.0（现行 2.x） | **半静态**：UI 可打包，**bundler iframe 打 CodeSandbox CDN**，离线/零第三方会空 | 尚可 | **砍** | 本仓 **没有 React**（`package.json`）。引入 React+Sandpack 是新框架，不是加一个组件 |
| **QuickJS** `quickjs-emscripten` | WASM **~505 KB** 未压（Simon Willison webpack 实测，[til](https://til.simonwillison.net)）；gzip **待核 ~180–250 KB** | MIT | 是，本仓已有 `vite-plugin-wasm`（`package.json` L36、`astro.config.mjs` L5/L27） | 可用 | **B 档唯一可谈的沙盒** | 只能跑 **ES 子集 JS**，没有 npm/Node/文件系统。适合「把这段 JSON 变换跑一遍」，不能复现 grok/glm 派单 |
| **wasmer-js / WASIX** | 运行时 **50–70 MB/包 未压**（[wasmer 博文](https://wasmer.io/posts/wasmer-local-sandboxes-for-ai-agents)） | MIT（SDK） | 理论上静态，体积不可接受 | 自称能，首包不可接受 | **砍** | |
| **BYO key 直连 Anthropic** | 0 额外运行时（`fetch`） | API ToS | **浏览器可走**：必须带头 `anthropic-dangerous-direct-browser-access: true`（[DEV 2026-05-03](https://dev.to/sendotltd/calling-the-anthropic-api-directly-from-the-browser-a-150-line-byok-comparison-tool-for-opus--nh)；[read-frog #558](https://github.com/mengxi-ream/read-frog/pull/558)） | 可用 | C 档可选，**默认关** | 密钥进 `localStorage` = XSS 即盗号。系统提示词随 JS 下发 = 编排秘方泄漏 |
| **BYO key 直连 OpenAI** | 0 | API ToS | SDK 有 `dangerouslyAllowBrowser`（[openai-node ClientOptions](https://github.com/openai/openai-node/blob/master/src/client.ts)），**真正 CORS 头是否放行待核**（多家文档仍写 api.openai.com 无 ACAO） | 待核 | **不作为默认** | 未对本机 `fetch` 打 OPTIONS，禁止写成「已通」 |
| **BYO key 直连 Gemini** | 0 | API ToS | 原生 `@google/genai` 设计含浏览器；**OpenAI 兼容路径 CORS 已知坏**（不锈钢 `x-stainless-*` 预检，[Google AI 论坛 2025-01](https://discuss.ai.google.dev/t/gemini-api-cors-error-with-openai-compatability/58619)） | 待核 | C 档次选 | 访客 key ≠ 磊哥席位。演示「他的编排」不能换成「你的 Flash」还自称同一套 |

**选型收敛（给后文三套架构用）**

| 层 | MVP（A） | 加沙盒（B） | 加真调用（C） |
|----|----------|-------------|---------------|
| 编辑器 | 无。只读 `<pre class="mono">` + 现有站点等宽字体 | 若要可改：CM6 JSON 模式，懒加载，**不要 Monaco** | 同 B |
| 终端 | 无 xterm。日志用 DOM 行 + `aria-live` | xterm.js 只灌录制；或 asciinema-player 单轨 | 同 B，禁止当伪 pty |
| 执行 | **零** | QuickJS 限定「变换访客改过的 JSON」；WebContainers/Pyodide/Sandpack **不进本仓 GH Pages** | 浏览器 `fetch` + 显式危险开关；失败则回 A |
| 数据 | 预计算 `nexus-trace.json` | 同左 + 可选 `*.cast` sidecar | 同左；真调用结果 **不写回仓库**，只活在内存 |

---

## §2 三套架构

预算对照本仓硬门（不是抽象「越小越好」）：

- Lab S：懒加载 JS ≤ 50 KB gzip、资产 ≤ 1 MB（`contracts.ts` L8；`audit-budget.mjs` L72–76 `BUDGET_CLASS_CAPS`）
- Lab M：JS ≤ 300 KB、资产 ≤ 6 MB（L9）
- Lab L：**默认拒绝**，且 `BUDGET_CLASS_CAPS` **没有 L 键**——登记 `budgetClass:'L'` 会在声明校验里踩 `caps.jsKb` 空引用或被当超限。要 L 必须先改 SRD + 脚本
- world：仅 `slug='world'` 单例（L11）；JS 全量 ≤ 900 KB、流式资产 ≤ 12 MB
- LHCI：`lighthouserc.json` L35–42，`.*/website/.+` 四项 ≥ 95（含现有 `/lab/tts-cockpit/`、`/lab/car-configurator/`）。**新 URL 一旦进 collect 表就按 95 打**
- G-D：`/home/` 与内容页对 world **0 字节**；排除表含 `lab/`、`world/`、`world-spike/`（`audit-budget.mjs` L358）
- `kind` 枚举只有 `webgpu-3d | audio-viz | svg-hmi | data-viz | world`（`contracts.ts` L22）——没有 `ide`
- 每页至多 1 个 Lab 模块（`facade.ts` L245 注释）
- `prefers-reduced-motion`：facade 自动挂载拦截（`facade.ts` L177–179）；展厅必须另做静态终态

### A. 纯回放型（录制真实会话 → 时间轴，零执行）

**用户做什么 → 看到什么**

1. 城里开到 Agent Nexus（紫 `#a855f7`，`cyber-city-buildings.json` L111–125），E 键进楼。
2. 10 秒：暗底三列指挥台亮起——**vis / tech / content** 三路同时从 t=0 往前跑，父列显示 `launch.py` 拉起。不是装饰性代码雨。
3. 30 秒：点开 content 路，看见 `served_model: glm-5-3-flash`、`identity_ok: true`、`identity_match: exact`（今天的 `receipt.json` 原文）。明白「卖点是编排 + 身份核验，不是聊天窗口」。
4. 拖 scrubber 跳到「tech 交稿」；reduced-motion 用户看到的是同一张表，没有滚动。

**分层（文字）**

```
[GitHub Pages 静态]
  HTML 壳 WorldHallLayout（暗底 + 楼色条 + 到达横幅）
    └─ 指挥台 DOM
         ├─ 父轨：commander / launch.py
         ├─ 三子轨：lane cards（状态灯 / 模型名 / 耗时）
         ├─ 详情：只读 prompt 摘录 + 产物路径 + receipt 字段
         └─ scrubber（range input；RM 时改为逐步按钮）
  数据：public/demo/agent-nexus/*.json 按需 fetch（单文件 ≤ 60 KB）
  JS：≤ 20 KB gzip 播放器（无 CM6 / 无 xterm / 无 three）
  零：WebSocket、pty、API key、SharedArrayBuffer
```

**数据流**

```
真实会话目录（构建期脚本，CI 或不入库的 ops 机）
  prompts/*.md + out/** + logs/*.log + receipt.json|md
        │  确定性转换（禁止 LLM 改写时间戳）
        ▼
  nexus-trace.json  （schema 见 §5）
        │  Astro 构建拷进 public/demo/agent-nexus/
        ▼
  浏览器 fetch → 解析 → 按 t 播放 span
        │  深链 ?t=ms&lane=content 只读白名单
        ▼
  结束态：三路 SUCCEEDED + 产物字节数（来自 mtime/size，不是编的）
```

**JS 预算**：播放器 15–20 KB gzip + 一张 30–80 KB 的 trace JSON（流式，不进首包 HTML）。**Hall-0 甚至可以把第一幕 span 内联进 HTML，JS=0。** 对齐 TTS 的「语料全量磁盘、单次拉取上限」思路（`manifest.json` L15 `streaming.singleFetchKbMax: 60`），但本页 **不进 Lab manifest**（见 §4）。

**LHCI**：先 **不要** 把 `/world/agent-nexus/` 加进 `lighthouserc.json` collect（与邻路 L-TECH `tech-feasibility.md` §2.4 同一条纪律）。Hall-0 的 LCP = 海报或 H1，无重 JS，加表后理论可过 95；加表是第二刀。

**人日**：壳 + 转换脚本 + 播放器 + 一条 e2e「JSON 在、三列在、RM 无动画」= **2.5–3 人日**（含回归，不含视觉死磕）。

**最大风险**：把 SessionTimeline 城里驾驶事件 **冒充** agent 日志（邻路 vis 候选 A 就是这条，L-TECH 已改成「禁止假装实时集群」，`tech-feasibility.md` L345）。本方案只回放 **真派单目录**。第二条：G-D 排除了 `world/` 前缀（`audit-budget.mjs` L358），引擎 chunk 可以偷运进厅门还绿——必须另加「`dist/world/**/index.html` 零 `_astro/world.` / `models/` / rapier」门（邻路已写，本楼继承）。

### B. 回放 + 本地沙盒（可改代码在浏览器内跑）

**用户做什么 → 看到什么**

在 A 的结束态多一个「打开这条产物」：例如把 `content-proposals.md` 的某一节放进 CM6，点「在沙盒跑 JSON 校验」。QuickJS 对一段纯函数 `validateTrace(json)` 返回 PASS/FAIL。**看起来像能跑，跑的不是 agent。**

**分层**

```
A 的全部
  + 懒加载 @codemirror/view + lang-json     ~80–120 KB gzip
  + 懒加载 quickjs wasm                      ~180–250 KB gzip（待核）
  + 可选 @xterm/xterm 灌校验 stdout          +64 KB
合计懒加载 ≈ 260–430 KB  → 超 Lab S，贴 Lab M 上限或超
```

WebContainers 路径（对照，**不推荐**）：

```
页面 COOP/COEP
  → SharedArrayBuffer
    → WebContainer.boot()
      → npm install 访客改过的 package
        → node 真跑
需要：自定义响应头、StackBlitz 运行时域、cookie 例外、商用许可评估
本仓：withastro/action@v6 → actions/deploy-pages@v5（`.github/workflows/deploy.yml` L27/L38），中间没有头注入点
```

**数据流**：A 的 trace 不变。沙盒输入 = 访客内存里的一份 JSON 拷贝，**写不回** `public/`。输出只进 xterm 或 `<pre>`。

**JS 预算**：CM6+QuickJS ≈ 260–430 KB gzip。Lab M 上限 300 KB——**只带 CM6 不带 xterm 勉强；加上 xterm 超。** 走 Hall 则不受 Lab cap，但一旦进 LHCI collect，300 KB JS 的移动端 Perf 95 **极大概率红**（对照：配置器走 M + WebGPU，已在 LHCI 表里靠 poster/门控活着）。

**LHCI**：B 默认 **永不进** 宪法页 collect。若将来进 Lab，按配置器模式：poster 常驻、`pointerFine: true`、显式「启动沙盒」才拉 wasm（`LabStage.astro` L70–77 已有 pointer/save-data/RM 文案）。

**人日**：A + CM6 接线 1.5 日 + QuickJS 1 日 + 失败态 0.5 日 = **5–6 人日**。WebContainers 另计 8+ 人日且可能根本上不了 GH Pages。

**最大风险**：访客以为「这就是磊哥的 agent 在跑」。产品文案必须写死 **「校验器，不是模型」**。第二风险：COEP 服务工人方案会砸 GoatCounter（`site.ts` L36，`BaseLayout.astro` L124–146）和任何无 CORP 的第三方。第三：Sandpack 要 React + 运行时 CDN，和「零后端静态」口是心非。

### C. 回放 + BYO key 真调用

**用户做什么 → 看到什么**

A 的指挥台旁有折叠「用我的 key 再跑一刀」。打开：本地输入框（不上传仓库）、选 Anthropic/OpenAI/Gemini、贴一段 **演示用短 prompt**（不是 `prompts/tech.md` 全文）。三秒后第四列出现「访客会话」，状态独立，明确徽章 **DEMO / NOT-HIS-FLEET**。

**分层**

```
A 的全部（默认路径零 key）
  + 折叠面板：provider × key × 短 prompt
  + fetch() 浏览器直连
  + 内存中的 ephemeral span（刷新即逝）
禁止：把访客 key 写入 localStorage 以外的任何持久层；禁止把系统提示词做成「本站编排宪法」全文
```

**数据流**

```
默认：只播 nexus-trace.json（A）
可选：
  key 留在内存（闭包）→ Authorization / x-api-key
  Anthropic: header anthropic-dangerous-direct-browser-access: true
  响应流 → 追加一条 lane=visitor 的 span
  失败（CORS/401/额度）→ 面板显示错误原文，指挥台 A 不受影响
```

**JS 预算**：A + ~8 KB 的 fetch 封装。不引入官方 SDK（OpenAI SDK 默认禁浏览器）。总预算仍可 Hall-S。

**LHCI**：与 A 同页则 key 面板必须 `hidden` 直到点击，避免 TBT。Best Practices 对「页面含 API key 输入」不直接打分，但 XSS 是产品风险不是灯塔风险。

**人日**：A + 面板 + 三家适配 + 失败矩阵 = **4–5 人日**。其中 1 日是 CORS 实打（本调研未在浏览器里 OPTIONS，见 receipt 未核实项）。

**最大风险（最大）**

1. **提示词泄漏**：`prompts/tech.md` 是编排秘方。C 只能跑 **专门写的 800 字演示 prompt**，禁止把三路原文当 system。
2. **密钥**：`localStorage` 被任何未来 XSS 读走。默认只放内存，关页即焚。
3. **CORS 不确定**：OpenAI/Gemini 兼容路径可能纯红，面板会「看起来能用、点了才死」。必须预检 OPTIONS，失败则禁用该家并写原因。
4. **归因欺诈**：访客用自己的 Flash 跑出一段字，截图说「这是王磊的指挥台」。UI 必须永远同时显示 **录制轨（他的）** 与 **现场轨（你的）**，不能互相覆盖。
5. **ToS / 费用**：访客自己的账单；页面写明。本站零代理，也就 **零能力做额度熔断**——滥用是访客自己的事，但恶意页把 key 打到别的 origin 是 XSS 问题，要 CSP。本仓目前没有严格 CSP 头（GH Pages 同样加不上），只能靠不引入第三方脚本。

---

## §3 推荐方案 + 第一刀 MVP

**推荐：A，第一刀就上；B 的 QuickJS 作为明确的第二刀候选项；C 默认不做；WebContainers/Monaco/Pyodide/Sandpack 从本仓 GH Pages 形态删除。**

理由（按本仓约束，不是审美）：

1. **差异化在数据不在编辑器。** 今天磁盘上已经有一次真三路派单（见 §5.2），以及 `docs/research/cc-*-evidence/` 的 run-receipt / SHA256SUMS / e2e JSON。访客在 10 秒内「哇」的是 **三列真模型名 + identity_ok**，不是 Monaco 的小地图。
2. **体积算术。** CM6 116 KB 已超 Lab S 50 KB；Monaco 单文件 gzip 就数百 KB；xterm 再 +64 KB。A 可以 Hall-0（0 JS）或 Hall-S（≤50 KB）。B 一加编辑器就进「必须改 SRD / 必须豁免 LHCI」区。
3. **托管算术。** WebContainers 要的头，`deploy.yml` 给不了。`coi-serviceworker` 会伤 GoatCounter。Pyodide 首包以 MB 计。Sandpack 要 React+CDN。
4. **邻路已改过「指挥塔」形态。** L-TECH：展厅 = 静态派单时间线，禁止假装实时集群，不要 ops 大屏 WebGL（`tech-feasibility.md` L345）。L-VIS 候选 A 用 SessionTimeline 冒充日志——那是城里驾驶事件，不是 agent。本方案用 **真 prompts/out/receipt**，正好把 vis 的「瀑布流」和 tech 的「别假装」焊死成可做的一招鲜。
5. **默认路径零 key**（共享背景硬要求）。C 可以后挂，不能当门面。

### 第一刀 MVP（≤3 人日，最小炫技）

范围锁死：**一页、一场、三路、零编辑器。**

| 日 | 交付 | 不做 |
|----|------|------|
| D1（1.0） | `WorldHallLayout`（若邻路 C/B 壳已在则复用）+ `src/pages/world/agent-nexus.astro` + 海报 + 三列静态 HTML 把今天三路的模型名/耗时/产物路径写死在构建期 | 不改 `manifest.json`；不加 LHCI URL；不改 `deepLink`（仍 `/ai-lab/`） |
| D2（1.0） | 转换脚本：读 `~/.codex/state/cc-buildings-brainstorm/` → `public/demo/agent-nexus/cc-buildings-2026-09-02.json`；播放器：play/pause/scrub + 高亮当前 span | 不转全部 `cc-*-evidence/`（第二场另开） |
| D3（0.5–1.0） | `identity_ok` 徽章、RM 终态表、e2e：JSON 200、三列可见、`prefers-reduced-motion` 无 CSS animation、无 world chunk | 不做 xterm、不做 BYO key、不做进楼变形（变形是世界侧，邻路已单列） |

**验收（用户语言）**

- 10 秒：三列同时亮，标题能读出「Gemini / Grok / GLM」三家，不是三个假名「Agent-1」。
- 30 秒：点 content，看到 `identity_ok=true` 和产物 `content-proposals.md`。
- noscript：三列静态表仍在（构建期把结束态渲染进 HTML，JS 只负责「动」）。
- 移动：单列手风琴，三路可点开；不要横向 IDE。

**刻意砍掉的炫技**：Monaco 皮肤、闪烁光标伪打字超过 3 个 span、WebGL 节点图、实时「正在思考」假进度（进度必须来自 trace 的 `t0/t1`）。

---

## §4 与本仓库的接线

**结论：挂 `/world/agent-nexus/` 展厅，不挂 Lab manifest，不挂 world 单例，不复用 `LabStage`。**

### 4.1 为什么不是 Lab 模块

| 约束 | 位置 | 若硬塞 Lab 会怎样 |
|------|------|-------------------|
| `kind` 无 ide/replay | `contracts.ts` L22 | 只能谎报 `data-viz`，Lab 索引卡会把它和 TTS/配置器并列（`lab/index.astro` L14 只滤 `world`） |
| S=50 / M=300 | `contracts.ts` L8–9；`audit-budget.mjs` L72–76 | A 的播放器本可以 S，但一进 Lab 就要 facade 客户端（`LabStage.astro` L90–93 `initAllLabFacades()`）+ poster 协议，为 20 KB 播放器买一套 GPU 生命周期 |
| L 默认拒绝且 caps 无 L | `contracts.ts` L10；`BUDGET_CLASS_CAPS` 无 L | Monaco/WebContainers 无合法预算级 |
| `viewTransitionName` 必须 `^(demo\|world)-` | `contracts.ts` L57 | 能取 `world-agent-nexus`，但 Lab 页走 `demo-*` 更常见；展厅用 `world-` 前缀语义对 |
| 深链白名单 | `contracts.ts` L54–55；`facade.ts` L51–59 | 播放器要 `?t=&lane=`，Lab 还得改 manifest 再发版 |
| LHCI 已收 `/lab/tts-cockpit/` `/lab/car-configurator/` | `lighthouserc.json` L10–11 | 新 Lab 页很容易被「顺手加 URL」然后 95 红 |
| 每页 1 模块 | `facade.ts` L245 | 指挥台不是 canvas mount |
| `pointerFine` 自动挡 | `facade.ts` L186–192 | 移动端会停在海报——指挥台应该 **静态可读**，不要「点启动才看见三列」 |

Lab 现役：`tts-cockpit` S + 流式 mp3（`manifest.json` L1–23）、`car-configurator` M WebGPU（L24–41）、`world` 单例入口 `/`（L42–59；`lab/index.astro` L4–6、L72–75 把 world 卡链到 `/` 而不是 `/lab/world`）。Agent Nexus 不是第四个 WebGPU/音频 demo。

### 4.2 为什么是 `/world/agent-nexus/` 而不是改 `/ai-lab/`

- 楼的 `deepLink` 今天是 `/ai-lab/`，`deepLinkStatus: "fallback"`（`cyber-city-buildings.json` L119–120）。`/ai-lab/` 是 **文章索引**（`src/pages/ai-lab/index.astro` L1–5：按工作阶段分组，明确「可运行 Demo 在 /lab/，与本栏互链不混排」）。把 IDE 塞进文章索引 = 破坏信息架构。
- 邻路已定 B 路线：`src/pages/world/[slug].astro` + `WorldHallLayout`，**不要**复用 Lab 注册表（`tech-feasibility.md` §2.1）。本楼是 B 的候选之一（指挥塔）。
- SRD §12.7.1 L1032「`/world/` 不再建立」否决的是 **世界引擎第二入口**（v1.1 Hybrid），不是 HTML 展厅。开工前 SRD 路由表加一行 `/world/{slug}/` = 楼内展厅（邻路 §2.2 已写）。`astro.config.mjs` L22–24 只把 `/world-spike/` 踢出 sitemap；新厅要进 sitemap。
- G-D 陷阱：`audit-budget.mjs` L358 把 `world/` 排除。厅 HTML **禁止**静态 import `src/lab/world/**`。`WORLD_CHUNK_RE`（`astro.config.mjs` L12–13）命中的文件会打成 `_astro/world.[hash].js`——厅页一旦出现这个文件名即违规。
- `check-links.mjs` 核 `buildings[].deepLink` 在 dist 有页。建议 **加法** `hallPath: "/world/agent-nexus/"`，城里 E 键走厅，正文 CTA 仍去 `/ai-lab/`（邻路 §2.3）。不要把 deepLink 改成厅，否则 AI Lab 文章失城内入口。

### 4.3 不要挂 world 单例

`budgetClass:'world'` / `kind:'world'` 仅限 `slug='world'`（`contracts.ts` L11）。世界 JS 全量已经要 ≤900 KB gzip，再塞 Monaco 是抢城市预算。进楼后世界 `dispose()`（邻路已核），厅页本来就没有 three。

### 4.4 建议的文件落点（开工时，本调研不写项目根）

```
src/pages/world/agent-nexus.astro      # 或 [slug].astro 之一
src/layouts/WorldHallLayout.astro      # 邻路 B 共享
src/components/city/AgentNexusDesk.ts  # 播放器，DOM backend
public/demo/agent-nexus/*.json         # 流式 trace
public/posters/agent-nexus-poster.webp # facade 不用，厅用
scripts/nexus-trace-from-dispatch.mjs  # 转换，CI 可选
```

`kind`/`budgetClass`：**不登记**。体积用厅专项门（Hall-0 = 0 额外 JS；Hall-S ≤ 50 KB gzip，数字对齐 Lab S 但 **不是** Lab 模块）。

深链：`?from=city&poi=agent-nexus` 给到达横幅（C 路线）；`?t=12345&lane=content` 给播放器。后者不要泄漏进 canonical（`BaseLayout` 已去 query——邻路 C 已依赖这点）。

### 4.5 现有 Lab 接线（对照，避免抄错）

- 挂载状态机：`facade.ts` L3–6 idle→observing→loading→ready|error；RM/save-data/pointer 拦截 L175–193；显式点击跳过 L219。
- 舞台 DOM：`LabStage.astro` L42–88。
- TTS 先例：构建期语料 + 运行时时间轴，**零 API key**（`tts-cockpit.astro` L19–35）。Agent 回放是同一哲学：预计算 trace，不要现场推理。
- 配置器先例：M 级 + `pointerFine: true`。指挥台 **不要** 抄 pointerFine，否则手机只剩海报。

---

## §5 trace 数据格式草案 + 今天三路能转的证明

### 5.1 设计原则

- **一场会话 = 一文件**，可流式拉取。不要 OTLP protobuf（浏览器解析贵，也没有 Collector）。
- 字段名 **对齐** OpenTelemetry GenAI（Development，[semconv gen-ai](https://opentelemetry.io/docs/specs/semconv/gen-ai/)）与 Langfuse observation 类型，但 **不声称兼容导出**。OTel 仍不稳定（`OTEL_SEMCONV_STABILITY_OPT_IN=gen_ai_latest_experimental`）；本 schema 以本仓 receipt 为 SSOT。
- 时间用 **相对毫秒** `t0/t1`（相对 `trace.startedAt`），绝对时间只在根上留 ISO。避免时区争论。
- 正文 **摘录 + 路径 + sha256**，不把 33 KB 的 `tech-feasibility.md` 整篇塞进 trace。播放器要全文时再 fetch 静态 md（可 git 忽略或裁剪）。
- `identity_*` 是本仓硬门，OTel/LangSmith 都没有同等字段—— **保留为扩展属性**，不要压扁掉。

对照：

| 本 schema | OTel GenAI | LangSmith run | Langfuse |
|-----------|------------|---------------|----------|
| `spans[].kind: llm` | `gen_ai.operation.name=chat` | `run_type=llm` | observation `GENERATION` |
| `spans[].kind: agent` | `invoke_agent` | `run_type=chain` + `ls_agent_type` | `AGENT` |
| `spans[].kind: tool` | `execute_tool` | `run_type=tool` | `TOOL` |
| `requestedModel` / `servedModel` | `gen_ai.request.model` / `gen_ai.response.model` | `ls_model_name` | `model` |
| `provider` | `gen_ai.provider.name`（`gen_ai.system` 已弃） | `ls_provider` | metadata |
| `identityOk` | 无 | 无 | 无 → `attributes.identity_ok` |
| `usage.inputTokens` | `gen_ai.usage.input_tokens` | `usage_metadata` | `usage` |
| 终端字节 sidecar | 无 | 无 | 无 → 可选 `artifacts[].castUrl` |

### 5.2 JSON Schema（草案）

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://rayw-lab.github.io/website/demo/agent-nexus/nexus-trace.schema.json",
  "title": "AgentNexusTrace",
  "type": "object",
  "required": ["schemaVersion", "id", "startedAt", "durationMs", "displayName", "spans"],
  "additionalProperties": false,
  "properties": {
    "schemaVersion": { "const": "agent-nexus-trace/v1" },
    "id": { "type": "string", "minLength": 1 },
    "displayName": { "type": "string", "maxLength": 80 },
    "startedAt": { "type": "string", "format": "date-time" },
    "durationMs": { "type": "integer", "minimum": 0 },
    "sourceDir": { "type": "string" },
    "parent": {
      "type": "object",
      "required": ["role"],
      "properties": {
        "role": { "const": "commander" },
        "launch": { "type": "string" }
      }
    },
    "spans": {
      "type": "array",
      "minItems": 1,
      "items": { "$ref": "#/$defs/span" }
    },
    "artifacts": {
      "type": "array",
      "items": { "$ref": "#/$defs/artifact" }
    }
  },
  "$defs": {
    "span": {
      "type": "object",
      "required": ["id", "parentId", "kind", "name", "lane", "t0", "t1", "status"],
      "properties": {
        "id": { "type": "string" },
        "parentId": { "type": ["string", "null"] },
        "kind": { "enum": ["session", "agent", "llm", "tool", "gate"] },
        "name": { "type": "string" },
        "lane": { "type": "string", "description": "vis | tech | content | commander | visitor" },
        "t0": { "type": "integer", "minimum": 0 },
        "t1": { "type": "integer", "minimum": 0 },
        "status": { "enum": ["succeeded", "failed", "blocked", "unknown"] },
        "provider": { "type": "string" },
        "requestedModel": { "type": "string" },
        "servedModel": { "type": "string" },
        "identityOk": { "type": ["boolean", "null"] },
        "identityMatch": { "type": ["string", "null"] },
        "fallback": { "type": ["string", "null"] },
        "promptRef": { "type": "string", "description": "相对 sourceDir 的路径" },
        "promptExcerpt": { "type": "string", "maxLength": 240 },
        "outputRef": { "type": "string" },
        "receiptRef": { "type": "string" },
        "usage": {
          "type": "object",
          "properties": {
            "inputTokens": { "type": ["integer", "null"] },
            "outputTokens": { "type": ["integer", "null"] },
            "reasoningTokens": { "type": ["integer", "null"] }
          }
        },
        "exitCode": { "type": ["integer", "null"] },
        "attributes": { "type": "object" }
      }
    },
    "artifact": {
      "type": "object",
      "required": ["path", "bytes"],
      "properties": {
        "path": { "type": "string" },
        "bytes": { "type": "integer", "minimum": 0 },
        "sha256": { "type": "string", "pattern": "^[0-9a-f]{64}$" },
        "role": { "enum": ["prompt", "output", "receipt", "log", "cast", "evidence"] }
      }
    }
  }
}
```

`t1 >= t0` 由转换器断言。`identityOk=null` = 该通道没有 identity 收据（例如 vis 的 Markdown receipt 只有「Gemini 3.1 Pro (High)」一句）。**禁止把 null 填成 true。**

可选 sidecar：某 span `attributes.castUrl = "/website/demo/agent-nexus/tech.cast"`，播放器用 asciinema-player 懒加载。第一刀不做。

### 5.3 证明：今天的三路派单能转

源目录 `/Users/wanglei/.codex/state/cc-buildings-brainstorm/`（本机 `stat` 于 2026-09-02，未改项目根）。相对 t0 = 共享 prompt mtime `2026-09-02T17:30:25`（`prompts/_shared-context.md`）。

| 磁盘对象 | → span / artifact 字段 | 实测值 |
|----------|------------------------|--------|
| `launch.py` | parent.launch | 三路 detatch；GROK_LANES=tech 同类，FLASH=content 同类（本场 vis 走 Gemini 不在此脚本的 GROK/FLASH 二分里——**转换器按 receipt 的模型字段，不按 launch.py 猜测**） |
| `prompts/vis.md` 2624 B @ 17:30:53 | span `vis.prompt` kind=tool | excerpt = 任务书首句「赛博朋克视觉 × 交互创意总监」 |
| `prompts/tech.md` 3288 B @ 17:31:15 | span `tech.prompt` | excerpt = 「前端架构师…可直接开工的技术方案」 |
| `prompts/content.md` 3012 B @ 17:31:39 | span `content.prompt` | excerpt = 「内容策略师 + 汽车智能座舱行业顾问」 |
| `out/vis/vis-brainstorm.md` 20181 B @ 17:34:32 | span `vis.agent` kind=agent t1≈247s | outputRef |
| `out/vis/receipt.md` 990 B | 同 lane receiptRef | 「实际使用的模型标识：Gemini 3.1 Pro (High)」→ `servedModel`；**无 identity_ok** → `identityOk: null` |
| `logs/vis.log` **0 字节** @ 17:31:56 | artifact role=log bytes=0 | 转换器必须保留 0，禁止当成「没这个文件」删掉（absence-claim：0 字节 ≠ 不存在） |
| `out/tech/tech-feasibility.md` 33463 B @ 17:43:08 | span `tech.agent` t1≈763s | |
| `out/tech/receipt.md` 4255 B | `requestedModel/servedModel = grok-4.6`；「未降档」 | `identityOk: null`（Markdown 自报，没有 `identity_ok` 布尔字段） |
| `logs/tech.log` 8104 B | 含 `modelUsage.grok-4.6-build`、`num_turns: 19`、`total_cost_usd: 0.87254132` | 可进 `attributes`；**费用是否展示给访客 = 产品选择，默认不展示** |
| `out/content/content-proposals.md` 20980 B @ 18:06:05 | span `content.agent` t1≈2140s | |
| `out/content/receipt.json` 1423 B | **机器收据** | 见下一表 |
| `logs/content.log` 28645 B | | |

`out/content/receipt.json` 可 **逐字段** 映射，不经 LLM：

| JSON 路径 | trace 字段 | 值 |
|-----------|------------|-----|
| `schema` | `attributes.receiptSchema` | `api-direct-background.receipt/v1` |
| `job_id` | `attributes.jobId` | `69b364c1-1cd2-4413-96db-7a79630fff03` |
| `requested` / `api_direct.requested` | `requestedModel` | `glm-5-3-flash@ark-plan` |
| `api_direct.served_model` | `servedModel` | `glm-5-3-flash` |
| `api_direct.identity_ok` | `identityOk` | `true` |
| `api_direct.identity_match` | `identityMatch` | `exact` |
| `api_direct.fallback` | `fallback` | `null` |
| `api_direct.http_code` | `attributes.httpCode` | `200` |
| `exit_code` | `exitCode` | `0` |
| `state` | `status` | `succeeded` ← `succeeded` |
| `started_at` / `finished_at` | `t0/t1` | unix 浮点 → 相对 ms；墙钟 **643 s**（3503.485−2860.676） |
| `api_direct.thinking_sent` | `attributes.thinkingSent` | `true` |
| `process_group_reaped` | `attributes.processGroupReaped` | `true` |

三路并行结构：三个 `kind=agent` span 的 `parentId` 都指向 `kind=session` 的 commander span；`t0` 重叠。播放器按 lane 分列，不按绝对串行。这就是 10 秒「哇」的几何形状。

**转换器伪代码（确定性）**

```
trace.startedAt = min(mtime(prompts), started_at from json)
for lane in [vis, tech, content]:
  add artifact prompts/{lane}.md
  add artifact out/{lane}/*
  add artifact logs/{lane}.log   # 包括 0 字节
  if out/{lane}/receipt.json exists:
     map machine fields; identityOk = api_direct.identity_ok  # 布尔或缺失→null
  else:
     parse markdown 「模型标识」为 servedModel；identityOk = null
```

不需要模型参与。缺字段就 `null`，禁止补 `true`。

### 5.4 第二场：`cc-*-evidence/` 也能转（同一 schema，不当第一刀）

例：`docs/research/cc-perf-spec-r1-evidence/`

| 源 | 映射 |
|----|------|
| `run-receipt.md` | session span + `attributes.commit`（候选 SHA 在 bgm 那场是 `fe46a4f…`；本目录是 perf 场，以该目录 receipt 为准） |
| `SHA256SUMS.txt` | 每个文件一行 → `artifacts[].sha256` + `bytes` 需另 `stat`（SUMS 只有哈希） |
| `json-summary.txt` | gate span：`STATS_UNEXPECTED=0` `TEST_COUNT=86` `LAST_RUN_STATUS=passed` |
| `e2e-results.json` | 过大，**不要整文件进 trace**；只抽 `config.metadata` + 失败列表（本文件 `last-run.json` 为 `{status:"passed", failedTests:[]}`） |
| `last-run.json` | gate span output |

这证明 schema 的 `kind=gate` 不是空枚举：提分 Loop 的 e2e/LHCI 硬门可以直接变成指挥台上的一盏灯。第一刀仍只用 buildings 三路，避免 30+ 文件的证据目录撑爆单文件 60 KB 上限（SHA256SUMS 自身已 36 行；e2e-results.json 是完整 Playwright 报告，会超）。

### 5.5 播不了什么（写清，避免第二刀假装能）

- **token 用量**：content 收据无 `input_tokens`；tech log 有 `input_tokens`/`output_tokens`/`reasoning_tokens`（`logs/tech.log` 的 `usage` 段）但 vis 没有。缺则 null。
- **真 tty**：这三路没有 asciinema。不要合成假 `.cast`。
- **思考链全文**：不进 trace、不进页面（提示词泄漏 + 体积）。
- **「正在调用工具 Read/Grep」逐步回放**：tech 的 JSON log 有 `num_turns: 19`，没有逐步 tool 时间戳。第一刀用 **整段 agent span**，不要伪造 19 个 tool span。

---

## 附录：10 秒 / 30 秒脚本（给实现，不是给营销页）

- **10 秒**：三列从左到右亮灯，父列一句「commander 拉起 vis / tech / content」。楼色 `#a855f7`。
- **30 秒**：自动停在 content 的 identity 行。旁白（静态文字，不是 TTS）：「默认路径零 key。这些数字来自一次真实派单的 receipt，不是演示生成器。」
- **RM**：无自动播放；三列终态表；按钮「逐步下一条」。
- **窄屏**：父列收成一行摘要；三路手风琴，默认打开 vis（最短，先给完场感）。
