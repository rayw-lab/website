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
