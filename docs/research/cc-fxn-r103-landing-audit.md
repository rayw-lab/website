# CC-FXN-R103-LANDING-AUDIT：#103 合流前落库审计（Codex 清账证据核验）

> 审计代理：CC-FXN-R103-LANDING-AUDIT · model `claude-fable-5-thinking-xhigh` · 2026-08-28
> 纪律：**只读审计 + docs/ 报告，零 src/、禁改 score、禁合流**。
> 审计对象：PR [#103](https://github.com/rayw-lab/website/pull/103) 分支 `cursor/cc-al-fxn-r7-1d6f` @ tip `1a4296f`（独立 worktree detached checkout，远端 SHA 逐字核对 `1a4296fd780c70d82cf83bc9b0d7743a421ee2c2`）。
> 参照系：`origin/main` = `88097f9`（取证时点，零推进）；看板分支 #109 = `3e863e0`、#112 = `3815160`。

## Verdict：**合流 GO**

Codex 三项清账（P1 看板漂移 / P1 L6 证据消亡 / P2 F5 hint-recall 补证）证据已全部正确落库，五项检查全过、零阻断项。理由见 §1–§5 逐项，残留注记（均不阻断）见 §6。

---

## 1. `docs/spec/assets/fxn-audit/` L6 证据落库 —— ✅ PASS

11 个文件全部在 `1a4296f` 被 git 追踪（`git ls-files` 逐一确认），格式经 `file`/`ffprobe` 实际解码验证，全部可用仓库相对路径引用：

| 文件 | 验证结果 |
|------|----------|
| `fxn_l6r_01…08_*.png`（8 帧：恒等门/变形+chip+hint/淡出/H 召回/按钮召回/驾驶/入圈 2/5/配置器落地） | 均为 PNG 1440×900 RGB，有效 |
| `fxn_l6r_q2_hint_recall_20260828_8x.mp4` | h264 1152×720 · 2291 帧 · 76.37s · 3.9MB，可解码 |
| `session-dump-s5-l6r-q2-20260828.json` | schema 1 · 19 events · dropped 0 · funnel 七步全齐 |
| `fxn_l6r_capture_summary_20260828.json` | 首访 ls/ss=0 · pageErrors=[] · counters 与 dump 一致 |

引用侧核验：报告 `loop8-fxn-r7-audit.md` §2.3R 逐行表与登记 JSON `evidence.recordings/sessionDumps` 均以 `docs/spec/assets/fxn-audit/…` 相对路径指向上述文件，文件名与实际落库逐一对得上，无死链。

## 2. 登记 JSON `cyber-city-function-rubric-score.json` —— ✅ PASS

- **score = 87** 确认；`target: 90`；七维加权自算复核 85×.15+85×.20+85×.15+85×.15+90×.15+90×.10+95×.10 = raw 87.25 → 87，数学成立。
- 封顶口径完好：真机 S-2 缺席 → 云端从严封顶 87–88，87 未越顶，「90 仍禁登」原文保留。分值零变动（CODEX-CLEAR 前后均 87），本审计亦零改动。
- **ephemeral 路径**：`/tmp` 零出现；`/opt/cursor/artifacts` 字面仅出现 **1 处**（`evidence.recordings[2]`），且系「消亡留痕」免责声明——原文明示「各轮 VM 回收后 /opt/cursor/artifacts 湮灭，**禁再引用**」，仅列历史文件名不含完整路径，证据面已由报告内 dump 摘录 + L6R 重采正本承接。**全部活证据指针均为仓库相对路径**，「登记引用去 ephemeral 化」达成（墓碑注记属诚实留痕，判读为合规，见 §6 注记 a）。

## 3. F5 hint-recall 证据锚 —— ✅ PASS（三方 + 帧内四重互证）

| 证据面 | 锚点 |
|--------|------|
| 登记 JSON `dimensions.f5Humanization.evidence` | `hint-dismissed{timeout}#8/t291424 → hint-recall{via:key}#9/t320045 → hint-recall{via:button}#11/t373615` 双入口 toggle 闭环，标注 §2.3R |
| 报告 §2.3R 逐行表 + §3 F5 行 | 「H 键召回（R5 L3 defer 清账）」与「按钮召回」两行，锚点数值与 JSON 逐字一致 |
| session dump（in-repo 正本） | seq 9 `hint-recall{via:key}` t=320045；seq 11 `hint-recall{via:button}` t=373615，逐字节吻合 |
| 截图帧内 `#debug` 事件流（本审计肉眼抽验） | `fxn_l6r_04` 帧内可见 `#8 …timeout → #9 …via:"key"` 且键位卡整卡常显；`fxn_l6r_05` 帧内可见 `#10 …input → #11 …via:"button"` |

R5 L3 defer 由此转直证，F5=90 段锚「提示可再唤出」证据链闭合。

## 4. merge 世系 `862ab26` —— ✅ PASS

- `git cat-file -p 862ab26`：双亲 = `c4e844c`（#103 分支线，R9F 落分提交）+ `88097f9`（main）；**merge 而非 rebase**。
- `88097f9` 经 `merge-base --is-ancestor` 确认在 `origin/main` 世系上；且取证时点 `origin/main` **恰好仍是 `88097f9`**——merge 后 main 零推进，#103 相对 main 严格前进，GitHub 判 `mergeable: MERGEABLE`，CI 门禁（check/build/links/budget/lighthouse）**pass**。
- 报告钉死的三个真 tip SHA `756a0f8`/`c09ee31`/`5c27f1c` 均存活且为分支 tip 祖先——零 hash 重写，R6「世系污染」判例反面执行成立。
- tip 提交 `1a4296f` 改动域 13 文件全部 `docs/`（JSON+r7 报告+11 个证据文件）；分支相对 `main@88097f9` 全量 diff 14 文件亦全部 `docs/`，**零 src/、零看板文件**。

## 5. 与 #109/#112 看板口径比对 —— ✅ 零冲突（只读，未改看板）

- **文本面**：#109（`cursor/cc-loop-sec-p3-5b71`）与 #112（`cursor/cc-loop-sec-p4-5b71`）相对 main 各只改 1 个文件 = 看板 `cyber-city-score-loop-orchestration.md`；#103 不触碰该文件，文件域交集为空。`git merge-tree --write-tree` 冒烟：#103×#109、#103×#112 均 exit 0 干净合树。
- **口径面**：两份看板一致登记「功能 main = **84**、#103 分支登记 **87** 未合、合流前不登记；Codex 清账（L6 重采/F5 补证）RUNNING，未清禁合，清账后合 #103 → 登记 87」。#103 现内容恰好交付该清账清单，与看板预期严丝合缝，无任何口径冲突。
- 看板中 #103 状态行（「RUNNING/未清禁合」）在合流后需秘书线（#109/#112 后继 tick）常规刷新，属其职责范围，非 #103 阻断项。

## 6. 残留注记（均不阻断 GO）

a. 登记 JSON 内 1 处 `/opt/cursor/artifacts` 字面为墓碑免责声明（含「禁再引用」原文），非活引用；若指挥官希望 grep 级零字面，可由后续秘书轮改写为「ephemeral 归档位」等措辞，无分值影响。
b. 构建同指纹声明（`771b1e4` checkout，world chunk sha256 `1a762db3…3b84eb` 五轮互证）：本审计验证了 `771b1e4` 为存活提交且 R5–R9F–L6R 各处登记值内部一致，未重新执行整套构建复算指纹（超出落库审计范围，按记录采信）。
c. 合流顺序建议：main 现仍 = `88097f9`，#103 先合为天然序（#109/#112 看板 anyway 需按合流后事实刷新）；若 #109/#112 先合，merge-tree 冒烟已证 #103 仍零冲突可跟进。

## 附：取证命令留痕（全部只读）

```
git fetch origin cursor/cc-al-fxn-r7-1d6f   # 1a4296fd…e2c2
git worktree add /tmp/audit-r103 1a4296f --detach
git ls-files docs/spec/assets/fxn-audit/     # 11 文件全追踪
file *.png *.mp4 · ffprobe *.mp4             # 格式/可解码验证
git cat-file -p 862ab26                      # 双亲 c4e844c + 88097f9
git merge-base --is-ancestor 88097f9 origin/main   # YES
git rev-parse origin/main                    # 88097f9（零推进）
git merge-base --is-ancestor {756a0f8,c09ee31,5c27f1c} 1a4296f  # 全 YES
git diff --name-only 88097f9 1a4296f         # 14 文件全 docs/
git merge-tree --write-tree 1a4296f origin/cursor/cc-loop-sec-p{3,4}-5b71  # 均 exit 0
gh pr view 103/109/112 · gh pr checks 103    # MERGEABLE · CI pass
rg '/tmp|/opt/cursor' 登记 JSON + r5/r7 报告  # 仅墓碑留痕
```
