# AH-W7a RECEIPT · 问题卡折叠摘要 + Crystal 因果抓手

- date: 2026-09-03 13:08 +0800
- worktree: `/Users/wanglei/studio-data-root/worktrees/website-about-hall`
- HEAD: `9735c81`
- write root: `src/pages/about/index.astro`、`src/components/city/halls/about/Crystal.astro`、本目录
- 未 commit / 未 push / 未占 4321 / 未占 4625 / 未 `pnpm build`（全量 e2e 占 4625）
- dev: `pnpm dev --port 4632 --host 127.0.0.1`

## git diff --stat（两文件）

```
 src/components/city/halls/about/Crystal.astro |  2 +-
 src/pages/about/index.astro                   | 31 +++++++++++++++++++++++++++
 2 files changed, 32 insertions(+), 1 deletion(-)
```

## 新增文案原句

1. `/about/` 折叠摘要：不新写句子，从既有 `how` 取首句（`/^[^。]+。/`），单行 `text-overflow: ellipsis`。三张卡首句为：
   - 「多语种不是文案问题，是时间轴、排版与验收口径问题。」
   - 「「端云怎么分」不该靠评审会上反复摇摆。」
   - 「把 AI 当工位而不是外挂：在需求、开发、测试、复盘四个阶段定义节点输入输出契约与风险分级人审点，提效可量化、产出可审计——个人经验变成可复制的工作流资产。」（过长则省略）
2. Crystal 因果句：「AI 工作流用 Agent、Benchmark 与自动化重构方案生产，智能座舱交付因此可决策、可复用。」
   - 依据：`positioning-onepager.md` 支柱 3「用 Agent、Benchmark 与自动化重构方案生产」+ 核心标语「可决策、可交付、可复用」+ `site.ts` `knowsAbout` 智能座舱 / AI 工作流。能力层因果，无年份、无业绩数字。

## 截图

| 文件 | 内容 |
|---|---|
| `about-cards-collapsed.png` | `/about/` 问题卡折叠态，摘要一行 + 省略号 |
| `about-cards-expanded.png` | 第一张卡 hover 展开背面，how + 佐证链不变 |
| `crystal-intersection.png` | `/world/about-pavilion/` 六向交汇 lede 含因果句 |

绝对路径前缀：`/Users/wanglei/studio-data-root/worktrees/website-about-hall/evidence/about-hall/W7a/`

## 验收

- `pnpm exec astro check`：0 errors / 0 warnings / 59 hints（本页仅既有 `document.execCommand` hint）
- Playwright `shot.mjs` 打 4632 dev；`console.json` = `[]`（零 error / 零 pageerror）
- 未加 JS、未加字体；折叠摘要 `font-style: normal`、`letter-spacing: 0`、`line-height: 1.6`
- 降级三态（reduced-motion / hover:none / ≤639.98px）隐藏 teaser，避免与已展开背面重复
- 阶段初审 Gemini 3.8 Flash (High)（请求 slug `gemini-3.7-flash`）`verdict: PASS`；原文 `REVIEW-gemini.md`

## 未做

- 未跑 `pnpm build` / LHCI（e2e 在跑，禁覆盖 dist）
- 未改 `about.css` / `hall.css` / `src/data/**`
