# Evidence Index

- Repository: `rayw-lab/website`
- Frozen snapshot: `main@4ef7ed4cc9db9bde92180b8498bac7104951dd1d`
- Rows: **39**
- URLs are pinned raw URLs or GitHub read-only API endpoints.
- `TRUST_BASED(receipt)` means the bytes/metadata were read, but the underlying runtime or binary payload was not independently executed/unpacked.

| ID | Claim / Object | Proof class | URL | Time / Ref | Extract |
|---|---|---|---|---|---|
| E01 | 审计快照与 main 未漂移 | `INDEPENDENTLY_VERIFIED` | https://api.github.com/repos/rayw-lab/website/branches/main | 2026-09-02T12:52:59Z | main=4ef7ed4cc9db9bde92180b8498bac7104951dd1d；分支 protected=false，required checks=off。 |
| E02 | #220 元数据与原位编辑 | `INDEPENDENTLY_VERIFIED` | https://api.github.com/repos/rayw-lab/website/pulls/220 | 2026-09-02T08:37:45Z | #220 merged；看板 1 文件 +2/-1，命中已合并 SEC-R13 块。 |
| E03 | #221 整改任务书 PR | `INDEPENDENTLY_VERIFIED` | https://api.github.com/repos/rayw-lab/website/pulls/221 | 2026-09-02 | R-1/R-2/R-3 路线；R-2-1 要求异模型或同模型降级且收据齐全。 |
| E04 | #222 R-1 PR 元数据 | `INDEPENDENTLY_VERIFIED` | https://api.github.com/repos/rayw-lab/website/pulls/222 | 2026-09-02 | PR body 声称 3 文件 +13/-0；与 main-to-main 实际增量不一致。 |
| E05 | #223 R-2 PR 元数据 | `INDEPENDENTLY_VERIFIED` | https://api.github.com/repos/rayw-lab/website/pulls/223 | 2026-09-02 | 4 文件 +118/-5：两份重评 JSON、v2 任务书、视觉登记 JSON。 |
| E06 | #223 文件清单 | `INDEPENDENTLY_VERIFIED` | https://api.github.com/repos/rayw-lab/website/pulls/223/files?per_page=100 | 2026-09-02 | 明确包含 docs/research/cc-loop-audit-prompt-v2.md。 |
| E07 | #224 补交 PR 元数据 | `INDEPENDENTLY_VERIFIED` | https://api.github.com/repos/rayw-lab/website/pulls/224 | 2026-09-02T12:52:59Z | 实际 changed_files=1、+4/-0；并非 body 声称的 2 文件。 |
| E08 | #224 文件清单 | `INDEPENDENTLY_VERIFIED` | https://api.github.com/repos/rayw-lab/website/pulls/224/files?per_page=100 | 2026-09-02 | 仅修改 cyber-city-orchestration-paradigm.md，追加坑 13–16。 |
| E09 | R-1/R-2 总增量 | `INDEPENDENTLY_VERIFIED` | https://api.github.com/repos/rayw-lab/website/compare/cb72a694ae5413cb88442c6e28e9f40059de13fe...4ef7ed4cc9db9bde92180b8498bac7104951dd1d | 2026-09-02 | 整改最终增量位于 docs/research；含 replay、勘误、重评与治理文本。 |
| E10 | 整改路线正本 | `INDEPENDENTLY_VERIFIED` | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-loop-remediation-roadmap-2026-09-02.md | 2026-09-02 | 接受 #220 工艺违规、rotY 算错；定义 R-2-1 验收。 |
| E11 | v2 审计任务书 | `INDEPENDENTLY_VERIFIED` | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-loop-audit-prompt-v2.md | 2026-09-02 | C1/C9' 要求历史后续 commit deletions=0；C7 要求模型/UTC/hash/tool sequence。 |
| E12 | StreetProps 重放脚本 | `INDEPENDENTLY_VERIFIED` | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/tools/streetprops-roty-replay.mjs | 2026-09-02 | 自包含 FNV-1a、mulberry32、共享 PRNG 调用序与 AABB 算式。 |
| E13 | R2 CityMap 源码 | `INDEPENDENTLY_VERIFIED` | https://raw.githubusercontent.com/rayw-lab/website/598764172250f3a0d6e5a29c36aa564dbd44e009/src/lab/world/city/CityMap.ts | R2 exact head | FNV-1a seed 与 mulberry32 实现，可逐行对译。 |
| E14 | R2 StreetProps 源码 | `INDEPENDENTLY_VERIFIED` | https://raw.githubusercontent.com/rayw-lab/website/598764172250f3a0d6e5a29c36aa564dbd44e009/src/lab/world/city/StreetProps.ts | R2 exact head | 簇序、[Vending,Cabinet,Bin] 消费顺序、rotY 抖动和半尺寸。 |
| E15 | Collider 勘误正本 | `INDEPENDENTLY_VERIFIED` | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-vis-x2-collider-aabb-20260902.md | 2026-09-02 | 正确 rotY 与 AABB；顶部写 ≤0.06m，nose 仍在 S2。 |
| E16 | 诊断勘误正本 | `INDEPENDENTLY_VERIFIED` | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-vis-x2-obs-r2-diagnosis.md | 2026-09-02 | 区分静态中心线穿 H11 与控制器右偏后 nose 嵌入 H12/S2。 |
| E17 | 当前 OBS 可执行注释 | `INDEPENDENTLY_VERIFIED` | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/e2e/cyber-city-observability.spec.ts | 2026-09-02 | 仍写 bearing 正穿 H12/S2，未与文档勘误同步。 |
| E18 | 当前 PERF 可执行注释 | `INDEPENDENTLY_VERIFIED` | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/e2e/cyber-city-perf.spec.ts | 2026-09-02 | 同源路线说明仍保留 H12/S2 直穿口径。 |
| E19 | 历史 timeout 提交 c912b49 | `INDEPENDENTLY_VERIFIED` | https://api.github.com/repos/rayw-lab/website/commits/c912b49 | 2026-08-27T08:11:59Z | navigate 900k→1.8m、poll 60k→120k；发生在 R1/R2 正式窗之前。 |
| E20 | 历史 timeout 提交 97223b8 | `INDEPENDENTLY_VERIFIED` | https://api.github.com/repos/rayw-lab/website/commits/97223b8 | 2026-08-27T10:27:33Z | navigate 1.8m→3.0m，并改终腿速度帽。 |
| E21 | 整改增量 ad93ed1 | `INDEPENDENTLY_VERIFIED` | https://api.github.com/repos/rayw-lab/website/commits/ad93ed1 | 2026-09-02T03:17:53Z | 新增东弧 leg2a：radius=2.5、timeoutMs=240000；未改既有 setTimeout。 |
| E22 | R3 e2e 原始 JSON | `TRUST_BASED(receipt)` | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-vis-x2-full-r3-evidence/e2e-results.json | 2026-09-02T05:30Z–06:52Z | 结构可抓取；stats expected=86、unexpected=0、skipped/flaky=0，86 个 retry=0。运行未重跑。 |
| E23 | R3 e2e summary | `INDEPENDENTLY_VERIFIED` | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-vis-x2-full-r3-evidence/e2e-summary.json | 2026-09-02 | totalTests=86、totalFiles=19、passed=86、retries=0、runExit=0。 |
| E24 | R3 list.log | `INDEPENDENTLY_VERIFIED` | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-vis-x2-full-r3-evidence/list.log | 2026-09-02 | 末行 Total: 86 tests in 19 files。 |
| E25 | R2 错误 summary | `INDEPENDENTLY_VERIFIED` | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-vis-x2-full-r2-evidence/e2e-summary.json | 2026-09-01 | expectedPassed72+failed1+skipped13=86，却把 totalTests 写为19。 |
| E26 | R2 追加式勘误 | `INDEPENDENTLY_VERIFIED` | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-vis-x2-full-r2-evidence/SUMMARY-ERRATUM.md | 2026-09-02 | 追加声明 totalTests=86、totalFiles=19；不改原始字节。 |
| E27 | R2 历史原字节 | `INDEPENDENTLY_VERIFIED` | https://raw.githubusercontent.com/rayw-lab/website/ff6d00e/docs/research/cc-vis-x2-full-r2-evidence/e2e-summary.json | ff6d00e | 历史与当前原文件 blob SHA 均为 9011e3…，支持原字节未改。 |
| E28 | CI run 33589801653 | `INDEPENDENTLY_VERIFIED` | https://api.github.com/repos/rayw-lab/website/actions/runs/33589801653 | 2026-09-02 | event=pull_request、head=6f691fce…、completed/success。 |
| E29 | LHCI artifact 元数据 | `INDEPENDENTLY_VERIFIED` | https://api.github.com/repos/rayw-lab/website/actions/runs/33589801653/artifacts | 2026-09-02 | artifact 9831423112 存在、未过期、head 对齐、带 SHA-256 digest。 |
| E30 | LHCI 不回退表 | `TRUST_BASED(receipt)` | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-vis-x2-full-r3-evidence/lhci-no-regression.md | 2026-09-02 | 声称 7 URL×3 runs 四类中位数均100；未解包 artifact 独立复算。 |
| E31 | R2 评审 A | `INDEPENDENTLY_VERIFIED` | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-alvis-r3-eval/r2-eval-a.json | 2026-09-02 | model=gpt-5.6-terra；timestampUtc=UNAVAILABLE；有 toolSequence 与16位 hash echo。 |
| E32 | R2 评审 B | `INDEPENDENTLY_VERIFIED` | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-alvis-r3-eval/r2-eval-b.json | 2026-09-02 | 同模型；无 UTC、无 toolSequence；self total=83、parent recompute=82。 |
| E33 | 视觉登记 JSON | `INDEPENDENTLY_VERIFIED` | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cyber-city-visual-rubric-score.json | 2026-09-02 | 登记视觉76；R2 重评同模型，A75/B复算82，仲裁76。 |
| E34 | 综合分 JSON | `INDEPENDENTLY_VERIFIED` | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/quality-score-r3.json | 2026-09-02 | 五维权重合计1、missing=[]、composite=94。 |
| E35 | 原六帧 SHA256 清单 | `INDEPENDENTLY_VERIFIED` | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-alvis-r3-eval/frames-sha256.txt | 2026-09-02 | 原 E1/E2/B1 前缀可对齐；R2 新 E3/E4/B2 仅收据回显，未见新全哈希清单/图片。 |
| E36 | 看板当前 SEC-R14 | `INDEPENDENTLY_VERIFIED` | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cyber-city-score-loop-orchestration.md | 2026-09-02 | 追认 #220 工艺违规；但仍写 S2 位移≤0.05m。 |
| E37 | 范式坑 13–16 | `INDEPENDENTLY_VERIFIED` | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cyber-city-orchestration-paradigm.md | 2026-09-02 | 已固化快照/重放/append-only/scope；但 rotY 误差写成6°。 |
| E38 | 审计 A/B 原报告检索 | `UNVERIFIED` | https://api.github.com/repos/rayw-lab/website/search/code?q=cc-score-loop-board-delta-pr-104-r2.md | 2026-09-02 | 仓库未检出精确原报告；只能复审整改路线中的引述。 |
| E39 | v1 原任务书检索 | `UNVERIFIED` | https://api.github.com/repos/rayw-lab/website/search/code?q=filename%3Achatgpt-audit-prompt.md | 2026-09-02 | 仓库未检出 v1 原任务书，无法确定 A/B 当时 C10 的精确 scope 文义。 |
