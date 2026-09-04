# About Hall 阶段收口交接

## Artifact Kind

`project_handoff_candidate`，路径 `docs/handoffs/2026-09-04-about-hall-closeout.md`。

## Current Truth

- 项目：`rayw-lab/website`；交付 PR #234 已合入 main。
- topic SHA `942c7b2`；merge SHA `c29d386`。
- 当前权威：`docs/local-cmd/ABOUT-HALL-INDEX.md`、ADR-6、`evidence/about-hall/W8/FINAL-ACCEPTANCE.md`。
- 线上：`https://rayw-lab.github.io/website/`；main CI 与 Pages 均成功。

## Goal For Next Session

本期无需继续施工。只有磊哥提出新目标时，才从索引“剩余事项”另开阶段；最小后续是补 macOS 原生 Safari 与真机 iPhone Safari 证据。

## Done / Partial / Not Done

- Done：首页 About 招牌、赛车与 Q/E、泊位进站、展厅六站、“回家”、纸面 About、回城；W8；PR/CI/Pages/线上自动化。
- Partial：真实 Safari 消费端。macOS 锁屏阻止桌面 Safari 取证，真机 iPhone 也未接入；Chromium 的视频和 375px 结果不冒充 Safari。
- Not Done / 本期排除：真实履历与可选个人素材、第二栋楼、全城重做、全站提分、真机性能登记。

## Key Evidence

- `evidence/about-hall/W6/attempt10-failure/`：97/2/10 失败轮原始证据和受控定向复跑。
- `evidence/about-hall/W8/final-quality-loop-full-r2.log`：109/109、退出码 0。
- `evidence/about-hall/W8/final-r2-lhci-summary.json`：8 URL × 3。
- `evidence/about-hall/W8/grok-visual-recheck-result.md`：A/B/E 8/8/8。
- `evidence/about-hall/W8/ONLINE-VERIFICATION.json`、`REMOTE-RECEIPT.json`：线上动线与部署身份。

## Failed Attempts / Traps

- attempt10 不能被后续定向通过覆盖；其产品失败根因保持 UNKNOWN。
- Astro 7 在代理环境自动后台化会触发 Playwright `webServer exited early`；现由 `ASTRO_PREVIEW_BACKGROUND=1` 固定前台。
- final-r1 随工具会话在 57/109 中断；只剩 preview 不代表测试还活着。
- 到达条只在 `from=city&poi=about-pavilion` 时显示；漏 query 的截图不能判产品缺出口。
- `quality:loop:full` 把部分低分当数据，放行必须同时读 Playwright JSON、LHCI assert 和退出码。

## Next Action Before Editing

运行 `git ls-remote https://github.com/rayw-lab/website.git refs/heads/main`，打开线上首页与索引，对照当前 main 身份；若只补 Safari，保持代码只读。

## Suggested Skills

- `grok-cli-codex`：仅在新阶段需要独立视觉/工程协助时使用。
- `handoff`：下一阶段自然收尾时更新新的正式交接，不覆盖本文件历史。

## Redaction Check

未包含 token、cookie、密钥、原始真人照片、客户文本或价格信息。履历事实未补写。
