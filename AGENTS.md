# AGENTS.md

本文件为代理（Agent）工作约定。Cloud Agent 启动时会自动读取本文件，后续通过 Task 工具派生的云端子代理必须遵循以下「云端子代理专用规则」。

## 云端子代理专用规则（Cloud Subagent Rules）

### 1. 适用范围

本节约定仅适用于通过 Task 工具派生的云端子代理。父代理（主对话）模型由产品、账号或组织设置决定，不受下表 slug 限制。

### 2. 模型选择

| 场景 | 推荐 model slug | 说明 |
|------|-----------------|------|
| 日常问题、现状审查、方案讨论、只读调研、进度盘点 | claude-fable-5-thinking-xhigh | 默认分析和规划 |
| 修复、落地代码、补测试、修复缺陷 | claude-fable-5-thinking-xhigh | 实现与落地 |
| 独立审计、登记 JSON、放行裁决 | claude-fable-5-thinking-xhigh | L8 起与实现同模型；纪律仍为零业务代码 + fresh 取证 |
| 复审、复查修复结果、检查回归或遗漏 | claude-fable-5-thinking-xhigh | 独立只读核对 |

如果 xhigh 不在当前列表中，可按明示降级规则使用同系列的 high 版本。

#### 2.1 父代理直改白名单

如果团队采用本约定，父代理可直接处理的修改仅限以下情况之一：

- 文档、注释或配置措辞调整；
- 不超过 10 行，且不涉及业务逻辑、权限或数据面的修改。

直改后必须在回复中说明改了什么；超出上述范围的修改，应派修复子代理处理。

### 3. 明示降级规则

- 禁止静默降级。确需降级时，必须在回复中声明实际使用的 model slug：
  - 修复任务：`claude-opus-5-thinking-high-fast` → `claude-opus-5-thinking-high` → `claude-sonnet-5-thinking-high`，或同系列可用次档；
  - 日常问题、复审和复查：`claude-fable-5-thinking-xhigh` → `claude-fable-5-thinking-high`；
- 如果同系列模型均不可用，应说明情况并暂停询问，不要静默切换到无关模型系列；
- 用户临时指定其他可用模型时，以当次指令为准。
- 所有子代理回复的第一行建议自报实际使用的 model slug。

### 4. 提分 Loop 编排范式（Cyber City Score Loop）

本节为 Phase 0 波次（W1–W4）+ 提分 Loop（L0–L2）实战归纳的精华版；完整手册（七段逐段范式、
已知坑总表、开拍 checklist、Task prompt 与审计清单骨架）见
`docs/research/cyber-city-orchestration-paradigm.md`。

#### 4.1 角色与模型

| 角色 | 职责 | model slug |
|------|------|-----------|
| 父代理 | **只编排**：任务书/文件域/串并行裁决/合并/看板，不写业务代码、不替审计打分 | 产品设置决定 |
| 子代理 Task（实现 / 审计 / 顾问 / 调研 / 脑暴 / 文档 / 测试） | 落地交付或独立审计报告/登记 JSON；审计零业务代码 | `claude-fable-5-thinking-xhigh` |
| **事后顾问（董事会，触发式）** | 打破卡点终裁：角色停/续/重派、合流序与禁合项、跑道禁令与节流、口径定谳；**书面裁决优先于顾问链与一切子代理单**；触发条件与纪律见范式手册 §1.3 | `claude-fable-5-thinking-xhigh` |

**模型变更（2026-08-27）**：L8 起全维度统一 Fable5 xhigh，不再新派 Sol。已派单未中止的在途 Sol Task 可跑完，登记分与放行结论照常采纳。

#### 4.2 串并行与 PR 形态

- **默认串行、单 PR 聚焦**（base = main，一段一 PR，范围 = 任务书清单，执行中禁止扩批）。
  提分（视觉调参）批次永远单 PR：归因依赖固定机位前后帧对照。
- **并行例外（L0 型）**：仅当交付物正交、文件域可划分（如 L0 的 setup/baseline/visual 三件套，
  或波次多 Epic 工程铺面）。并行 Task 涉及同一运行时链路时，段末审计必做试合并 + 合流树冒烟
  （文本零冲突 ≠ 语义零冲突）。
- **门控链（L2 型）**：审计设专项门时严格串行——实现 → 审计门 → 过门才进下段；卡门时开
  **定向补洞段**（只做审计点名缺口），不降门、不硬闯、不推倒重来。
- **PR 栈仅两种场景**：① 门控补洞段必须叠在未合入前段上（如 a-plus base=a-tail）；
  ② 终审条件清账段（如 M11/M12 gates base=E7）。开栈须登记栈序与各段 base SHA；
  审计栈上 PR 必须先自建「候选 ⊕ main」集成树再审（防 main 推进后的 diff 假象）。
- 审计分支零业务代码改动、只交报告；测试重写的历史截图提交前还原；
  合并由父代理按审计指定顺序/解法执行，有条件放行时禁止天然合并。

#### 4.3 硬条件（每段放行必查）

| 硬门 | 口径 |
|------|------|
| e2e **52/52** | 0 failed / 0 skipped / 0 flaky（全量 ~17–23 min 墙钟，排期按每段 ≥2 轮预算） |
| LHCI 不降 | `/` 与 `/home/` 四项分类逐项不低于上轮（本 VM null 时用同 SHA green CI artifact 回填并登记来源） |
| `availableWeight===1` | 且 `missing=[]`；缺维归一化分只作诊断，禁止用作发布/登记分 |
| 视觉双评 \|Δ\|≤5 | 检验自评合理性；**专项门（如视觉 ≥62）以审计独立分判定**，综合分不能覆盖专项门 |
| 综合分 ≥85 | 五维权重 25/15/20/25/15，实现单源 `scripts/score-loop.mjs` |

高频坑速查（详表见手册 §3.5）：SwiftShader LHCI null → CI artifact 回填；e2e 内 JSON 用
`readFileSync` 读（Node 22 ESM import 断言坑）；PR/run 链接用 `gh` 实际输出（曾错写
`rayw-lab/mywebsite`）；poster 重拍永远排批次最后；视觉自评系统性偏乐观 ~2 分。

#### 4.4 看板单源

提分 Loop 状态（分支/PR/分数/裁决）唯一登记处 = `docs/research/cyber-city-score-loop-orchestration.md`；
每段收口即更新，禁止多处重复登记。测试跑法单源 = `docs/research/cyber-city-test-framework.md`；
视觉打分单源 = `docs/research/cyber-city-visual-rubric.md`（帧优先协议见其 §4）。

**编排 Delta / 定时器 `loop-cyber-city-orchestrate` 每次回复必输出登记矩阵四行**：
北极星 **98 / 98 / 90 / 85** vs 生产登记 **80 / 73 / 87 / —**（综合/视觉/功能/性能；见看板「登记矩阵」表，以指挥官最新口径为准；视觉 73 = 看板单源定谳，董事会 R1 §6）。
性能未登记时显式写 **—** 并说明解锁条件（真机 human-gate 六腿 → AL-PERF）。

### 5. 本地 Loop 编排（About Hall 起，磊哥 2026-09-02 指定）

范式母版 = `~/workspace/raw/loop-commander/SKILL.md`；本仓任务书与索引在 `docs/local-cmd/`（`ABOUT-HALL-CHARTER-*.md` / `ABOUT-HALL-INDEX.md` / WBS / TECH-ARCH）。父代理（Cursor 会话）**只编排与复审**，直改仅限 §2.1 白名单。

| 席 | 载体 | 用途 | 禁止 |
|---|---|---|---|
| 董事会 | **Grok 4.6 xhigh 常态一路**（`grok -p` 纯推理） | 重大决策裁决 = 磊哥决定，落 `docs/local-cmd/adr/` | 施工；重开已拍死项 |
| 开发 worker | `glm-5-3-flash@ark-plan`（api_direct，`--attach` 代码 / `--attach-image` 截图） | 组件、脚本、门、像素复核 | 无文件系统：产出由父代理落盘并跑门 |
| 多面 worker | `gemini-3.7-flash`（agy） | 调研 / 分镜 / 文档 / 秘书 / 批评者 / 小切片 | **不再使用 gemini-3.1-pro** |
| **前端视觉 worker** | Cursor Task `model: claude-opus-5-thinking-medium`（磊哥 2026-09-03 14:32 指定） | 页面/组件视觉实装、CSS/动效打磨、截图级审美修正；终审仍归指挥官 | 派给 Grok/Gemini 做视觉实装（它们只做逻辑/数据/门/初审） |
| 生成/编码 worker | Grok Build CLI（`image_gen` / `image_edit` / `image_to_video` {6,10}s；也可编码、联网） | 全部生图生视频 | 引用任何外部生图生视频引擎；生成路与审计路同 lane |

约定：worker 可多轮多路多次；依赖与工具**授权 worker 自行安装**并登记到 TECH-ARCH 依赖表；prompt 文件放 `~/.codex/state/<goal>/prompts/` 0600；一单一 write root；worker 不 commit/push、不占 4321；收稿必宿主回读。i2v 在本仓**解禁**（座舱系列 D-003 不适用），护栏 = 固定机位 + 单一主事件 + first/last 双帧独立审计 + 3 连 REJECT 熔断；diffusion 零文字；六站演进不编年份。

## Cursor Cloud specific instructions

本仓库是个人网站工程（Astro + TypeScript + MDX，部署到 GitHub Pages），总纲见 `docs/website-plan/master-plan.md`（第 7 章为技术实现）。Cloud Agent 环境由 `.cursor/environment.json` 定义：install 阶段运行 `.cursor/install.sh`（确保 Node 20+ / pnpm / git 并安装依赖），`astro-dev` 终端由 `.cursor/dev-server.sh` 启动 dev server。

### 本地开发命令

| 操作 | 命令 | 说明 |
|------|------|------|
| 安装依赖 | `pnpm install` | 有锁文件时环境 install 已用 `--frozen-lockfile` 自动执行 |
| 开发服务器 | `pnpm dev --host 0.0.0.0` | 端口 4321；Cloud Agent 中 `astro-dev` 终端已自动启动 |
| 生产构建 | `pnpm build` | 产物输出到 `dist/` |
| 本地预览 | `pnpm preview --host 0.0.0.0` | 预览 `dist/` 构建产物 |
| 人工 Gate 预览 | `pnpm human-gate:preview` | build + 局域网 preview，打印 H1/H2 测试 URL（见 `docs/spec/human-gate-checklist.md`） |
| 人工 Gate 校验 | `pnpm human-gate:verify` | 回填签署档与证据后运行，通过方可合并 main |

注意：`astro.config.mjs` 配置了 `base: '/website'`（GitHub Pages 项目页路径），dev/preview 访问路径为 `http://localhost:4321/website/`。绑定自定义域名后需修改 `site` 并删除 `base`。

### Lighthouse 测试

master-plan 7.5 的门槛：Lighthouse 四项（Performance / Accessibility / Best Practices / SEO）≥ 95，首页传输体积 < 200KB（不含字体）。测试方法：

```bash
pnpm build
pnpm preview --host 0.0.0.0 &   # 或在另一个终端运行
npx lighthouse http://localhost:4321/website/ --output=json --output=html --chrome-flags='--headless --no-sandbox'
```

### 环境变量与密钥

- 当前无必需环境变量或密钥，`pnpm install && pnpm build` 无需任何凭据。
- 未来如需密钥（如统计服务、API token），通过 Cursor Dashboard → Cloud Agents → Secrets 注入为环境变量，禁止提交到仓库（`.gitignore` 已排除 `.env*`）。

### Cloud Agent 启动后验证

新 Agent 启动后依次运行以下命令确认环境就绪：

```bash
node -v     # 期望 >= v20
pnpm -v     # 期望 10.x（与 package.json 的 packageManager 一致）
pnpm build  # 期望构建成功，产物在 dist/
```

若 install 阶段失败，先查看 setup 日志中 `[install]` 前缀的版本预检输出定位问题。

### 部署

`main` 分支 push 后由 `.github/workflows/deploy.yml`（`withastro/action`）自动构建并发布到 GitHub Pages。Cloud Agent 不需要也不应手动执行部署。
