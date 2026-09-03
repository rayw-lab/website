# Evidence Index｜CC Loop 第三轮审计

- 仓库：`rayw-lab/website`
- 被审 SHA：`4ef7ed4cc9db9bde92180b8498bac7104951dd1d`
- 抓取时间：`2026-09-02T13:48:45Z`
- 行数：50

| ID | 声称/用途 | URL | 抓取时间 | 摘引/观测 |
|---|---|---|---|---|
| E001 | 审计收口时 main | https://api.github.com/repos/rayw-lab/website/branches/main | `2026-09-02T13:48:45Z` | main=fbb09eb；protected=false。 |
| E002 | PR #104 元数据 | https://api.github.com/repos/rayw-lab/website/pulls/104 | `2026-09-02T13:48:45Z` | 21 commits / 18 files；最终合并 aa4a438。 |
| E003 | PR #104 全历史文件表 | https://api.github.com/repos/rayw-lab/website/pulls/104/files?per_page=100 | `2026-09-02T13:48:45Z` | 含 observability/perf/playwright 等。 |
| E004 | PR #104 完整 diff | https://github.com/rayw-lab/website/pull/104.diff | `2026-09-02T13:48:45Z` | OBS 1.5M→1.8M；PERF 1.2M→1.5M。 |
| E005 | 最小修复 commit | https://api.github.com/repos/rayw-lab/website/commits/ad93ed1efcce66ea9367bb3ca40a95b811c9e393 | `2026-09-02T13:48:45Z` | ad93ed1：东弧 waypoint；声明零 timeout/radius。 |
| E006 | 最小修复 compare | https://api.github.com/repos/rayw-lab/website/compare/598764172250f3a0d6e5a29c36aa564dbd44e009...ad93ed1efcce66ea9367bb3ca40a95b811c9e393 | `2026-09-02T13:48:45Z` | 5987641..ad93ed1 仅 4 文件，e2e 两文件纯新增 hunks。 |
| E007 | fix 前 OBS | https://raw.githubusercontent.com/rayw-lab/website/598764172250f3a0d6e5a29c36aa564dbd44e009/e2e/cyber-city-observability.spec.ts | `2026-09-02T13:48:45Z` | test.setTimeout=1_800_000。 |
| E008 | fix 后 OBS | https://raw.githubusercontent.com/rayw-lab/website/ad93ed1efcce66ea9367bb3ca40a95b811c9e393/e2e/cyber-city-observability.spec.ts | `2026-09-02T13:48:45Z` | test.setTimeout 仍=1_800_000；新增 leg2a。 |
| E009 | 历史 commit c912 | https://api.github.com/repos/rayw-lab/website/commits/c912b49f6aea0f07bf71b74d58399ebe83c568a5 | `2026-09-02T13:48:45Z` | 直接 patch 含 1.5M→2.7M、0.9M→1.5M、navigate→1.8M。 |
| E010 | 历史 commit 972 | https://api.github.com/repos/rayw-lab/website/commits/97223b8333be48b6b762380c6e208dbb496252aa | `2026-09-02T13:48:45Z` | navigate 1.8M→3.0M，并非最终 setTimeout 净变化。 |
| E011 | PR #218 | https://api.github.com/repos/rayw-lab/website/pulls/218 | `2026-09-02T13:48:45Z` | 首轮同模型双会话 74/78→76。 |
| E012 | PR #218 文件 | https://api.github.com/repos/rayw-lab/website/pulls/218/files?per_page=100 | `2026-09-02T13:48:45Z` | 视觉 score + eval 工件。 |
| E013 | PR #219 | https://api.github.com/repos/rayw-lab/website/pulls/219 | `2026-09-02T13:48:45Z` | OK-2：综合 94 / 视觉 76。 |
| E014 | PR #219 文件 | https://api.github.com/repos/rayw-lab/website/pulls/219/files?per_page=100 | `2026-09-02T13:48:45Z` | 看板 + quality-score。 |
| E015 | PR #220 | https://api.github.com/repos/rayw-lab/website/pulls/220 | `2026-09-02T13:48:45Z` | 措辞勘误 +2/−1，append-only 历史违规。 |
| E016 | PR #220 文件 | https://api.github.com/repos/rayw-lab/website/pulls/220/files?per_page=100 | `2026-09-02T13:48:45Z` | 单看板文件原位编辑。 |
| E017 | PR #221 | https://api.github.com/repos/rayw-lab/website/pulls/221 | `2026-09-02T13:48:45Z` | 整改路线：接受/部分接受/驳回。 |
| E018 | 整改路线原文 | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-loop-remediation-roadmap-2026-09-02.md | `2026-09-02T13:48:45Z` | A/B 指控摘要与 R-1/R-2 验收口径。 |
| E019 | PR #222 | https://api.github.com/repos/rayw-lab/website/pulls/222 | `2026-09-02T13:48:45Z` | 正文写 3 文件 +13/−0；API 为 5 文件 +133/−0。 |
| E020 | PR #222 文件 API | https://api.github.com/repos/rayw-lab/website/pulls/222/files?per_page=100 | `2026-09-02T13:48:45Z` | 实际 5 路径。 |
| E021 | PR #222 diff | https://github.com/rayw-lab/website/pull/222.diff | `2026-09-02T13:48:45Z` | R-1 新增 errata/replay/诊断。 |
| E022 | score orchestration | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cyber-city-score-loop-orchestration.md | `2026-09-02T13:48:45Z` | SEC-R14 与 timeout 谱系文本。 |
| E023 | 碰撞体勘误 | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-vis-x2-collider-aabb-20260902.md | `2026-09-02T13:48:45Z` | rotY/AABB/H11-H12 勘误。 |
| E024 | 运行时诊断 | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-vis-x2-obs-r2-diagnosis.md | `2026-09-02T13:48:45Z` | 轨迹与 escapes 收据。 |
| E025 | rotY replay | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/tools/streetprops-roty-replay.mjs | `2026-09-02T13:48:45Z` | FNV-1a/mulberry32 自包含重放。 |
| E026 | CityMap 源码 | https://raw.githubusercontent.com/rayw-lab/website/50c33d9b98b86155c31ae2749ddbf68bd75bde4c/src/lab/world/city/CityMap.ts | `2026-09-02T13:48:45Z` | hashStringToSeed/createSeededRandom。 |
| E027 | StreetProps 源码 | https://raw.githubusercontent.com/rayw-lab/website/50c33d9b98b86155c31ae2749ddbf68bd75bde4c/src/lab/world/city/StreetProps.ts | `2026-09-02T13:48:45Z` | 六簇、三件、rotY 与世界坐标公式。 |
| E028 | PR #223 | https://api.github.com/repos/rayw-lab/website/pulls/223 | `2026-09-02T13:48:45Z` | 正文列 5 文件；API 为 4。 |
| E029 | PR #223 文件 API | https://api.github.com/repos/rayw-lab/website/pulls/223/files?per_page=100 | `2026-09-02T13:48:45Z` | 包含 audit prompt，不含 paradigm。 |
| E030 | R2-A | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-alvis-r3-eval/r2-eval-a.json | `2026-09-02T13:48:45Z` | 同模型；timestamp UNAVAILABLE；75。 |
| E031 | R2-B | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-alvis-r3-eval/r2-eval-b.json | `2026-09-02T13:48:45Z` | 同模型；父代补录；self=83/recompute=82。 |
| E032 | 视觉 score | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cyber-city-visual-rubric-score.json | `2026-09-02T13:48:45Z` | 原 76 + R2 仲裁 76。 |
| E033 | 审计 prompt v2 | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-loop-audit-prompt-v2.md | `2026-09-02T13:48:45Z` | C1–C10、五件套、REFUTED→FAIL。 |
| E034 | PR #224 | https://api.github.com/repos/rayw-lab/website/pulls/224 | `2026-09-02T13:48:45Z` | confession 声称 #223 三件、#224 两件。 |
| E035 | PR #224 文件 API | https://api.github.com/repos/rayw-lab/website/pulls/224/files?per_page=100 | `2026-09-02T13:48:45Z` | 实际仅 paradigm 一件。 |
| E036 | PR #224 diff | https://github.com/rayw-lab/website/pull/224.diff | `2026-09-02T13:48:45Z` | 只新增坑 13–16。 |
| E037 | 范式文档 | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cyber-city-orchestration-paradigm.md | `2026-09-02T13:48:45Z` | 坑 13–16 最终落库。 |
| E038 | quality score | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/quality-score-r3.json | `2026-09-02T13:48:45Z` | 五维 100/100/100/76/100、94、missing=[]。 |
| E039 | score-loop | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/scripts/score-loop.mjs | `2026-09-02T13:48:45Z` | 按可用权重归一化；文件视觉 score 未校验范围。 |
| E040 | e2e summary | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-vis-x2-full-r3-evidence/e2e-summary.json | `2026-09-02T13:48:45Z` | 86 tests / 19 files / 0F/0S/0flaky。 |
| E041 | e2e raw JSON | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-vis-x2-full-r3-evidence/e2e-results.json | `2026-09-02T13:48:45Z` | workers=1/retries=0；stats expected=86。 |
| E042 | PR #216 文件 API | https://api.github.com/repos/rayw-lab/website/pulls/216/files?per_page=100 | `2026-09-02T13:48:45Z` | 追加 erratum 与 R3 evidence。 |
| E043 | CI run | https://api.github.com/repos/rayw-lab/website/actions/runs/33589801653 | `2026-09-02T13:48:45Z` | 33589801653 success，head 6f691fce。 |
| E044 | CI jobs | https://api.github.com/repos/rayw-lab/website/actions/runs/33589801653/jobs | `2026-09-02T13:48:45Z` | 运行 job 元数据。 |
| E045 | Artifacts 列表 | https://api.github.com/repos/rayw-lab/website/actions/runs/33589801653/artifacts | `2026-09-02T13:48:45Z` | lighthouse-results artifact 存在。 |
| E046 | Artifact 元数据 | https://api.github.com/repos/rayw-lab/website/actions/artifacts/9831423112 | `2026-09-02T13:48:45Z` | id 9831423112，未过期，含 digest。 |
| E047 | PR #225 | https://api.github.com/repos/rayw-lab/website/pulls/225 | `2026-09-02T13:48:45Z` | R-3 sky forensic，晚于被审快照。 |
| E048 | PR #225 文件 | https://api.github.com/repos/rayw-lab/website/pulls/225/files?per_page=100 | `2026-09-02T13:48:45Z` | 仅 FORENSIC.md + 2 PNG。 |
| E049 | PR #226 | https://api.github.com/repos/rayw-lab/website/pulls/226 | `2026-09-02T13:48:45Z` | R-3 proposal/handoff/memo，非设置落地。 |
| E050 | PR #226 文件 | https://api.github.com/repos/rayw-lab/website/pulls/226/files?per_page=100 | `2026-09-02T13:48:45Z` | 未修改 #222/#223/#224 收据或核心 score。 |
