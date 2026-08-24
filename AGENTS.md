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

## Cursor Cloud specific instructions

本仓库是个人网站工程（Astro + TypeScript + MDX，部署到 GitHub Pages），总纲见 `docs/website-plan/master-plan.md`（第 7 章为技术实现）。Cloud Agent 环境由 `.cursor/environment.json` 定义：install 阶段运行 `.cursor/install.sh`（确保 Node 20+ / pnpm / git 并安装依赖），`astro-dev` 终端由 `.cursor/dev-server.sh` 启动 dev server。

### 本地开发命令

| 操作 | 命令 | 说明 |
|------|------|------|
| 安装依赖 | `pnpm install` | 有锁文件时环境 install 已用 `--frozen-lockfile` 自动执行 |
| 开发服务器 | `pnpm dev --host 0.0.0.0` | 端口 4321；Cloud Agent 中 `astro-dev` 终端已自动启动 |
| 生产构建 | `pnpm build` | 产物输出到 `dist/` |
| 本地预览 | `pnpm preview --host 0.0.0.0` | 预览 `dist/` 构建产物 |

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
