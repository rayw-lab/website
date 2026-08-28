# CC-LOOP-BOARD-BGM-SYNTH-SCOPE · 董事会急裁（合成氛围垫 v0 改判 + Codex P1/P2×2 处置）

- **角色**：CC-LOOP-BOARD-ADVISOR-BGM-SCOPE（事后顾问/董事会，事件驱动）；触发 = [#169](https://github.com/rayw-lab/website/pull/169) 合 main 后 Codex 事后审出 P1（调研自裁「无需重裁」）+ P2×2。书面裁决 = 父代理与所有子代理必须执行的董事会决议（权威口径沿 R1 [#143](https://github.com/rayw-lab/website/pull/143) 固化条款）。
- **model slug**：`claude-fable-5-thinking-xhigh`
- **纪律**：零 `src/` 改动；docs-only；base = main@`40709fc`；文件域 = 仅本文档。
- **取证窗口**：2026-08-28 15:38–15:50 UTC，`gh api`/`gh pr view` 实测 + main 一手文档。

---

## 0. 本单 fresh 事实（全部 `gh`/`git` 实测）

| # | 事实 | 证据 |
|---|------|------|
| **F1** | [#169](https://github.com/rayw-lab/website/pull/169)（`cc-bgm-rs.md`）MERGED 15:32:26Z → main@`40709fc` = 现 tip；docs-only，直合程序合规（站立授权 [#159](https://github.com/rayw-lab/website/pull/159)） | `gh pr view 169` |
| **F2** | Codex 三评原文在案：**P1** [r3881889304](https://github.com/rayw-lab/website/pull/169#discussion_r3881889304)（「Obtain a new ruling before replacing the asset BGM scope」，指 cc-bgm-rs §0-7/§5 宣称合成 v0 为 R5 资产域子集、无需重裁）；**P2** [r3881889313](https://github.com/rayw-lab/website/pull/169#discussion_r3881889313)（ducking 双通道争同一 `duckGain.gain`：每帧 `.value` 直写与 `setTargetAtTime` 自动化互相覆盖）；**P2** [r3881889316](https://github.com/rayw-lab/website/pull/169#discussion_r3881889316)（单挂载纪律下断言 E 的 initScript 种子使断言 C「无种子默认 OFF」无法共存） | `gh api repos/rayw-lab/website/pulls/comments/*` |
| **F3** | R5 终裁原文（[#158](https://github.com/rayw-lab/website/pull/158)，`cc-loop-board-advisor-r5-product-audio-nav.md`）：§B 优先级④「BGM **资产落地**」；W-R5-2 行「BGM-C1（**资产 BGM**）」开工条件「CC-AUD-RS **许可/体积裁决**后」；文件域表 BGM-C1 = 「`public/` 音频资产 + audio/ 播放器扩展 + credits 落点」；WBS 行「交付物 = 赛博 BGM 资产 · 门 = 许可/体积审计 + §D 六门」；§C ①③「**合成管事件音、资产管 BGM**」 | main 一手文档 §B/§C/WBS |
| **F4** | 先前音频调研原文（[#157](https://github.com/rayw-lab/website/pull/157)，`cc-audio-pubg-nav-research.md`）：§2.2「BGM = **唯一合成路线明确不划算的事件**（序列器+混音远超 150 行红线）」；§2.3「BGM \| —（**合成不可行**）\| 立项即采样/委托创作，走 DP-3」；§5.3 DP-3「**是否上 BGM 归指挥官产品裁量**」；§4.1-3 / §4.4「roadmap 资产行 #10『不上 BGM』修订 = 立项前置」 | main 一手文档 §2/§4/§5 |
| **F5** | 中间事实已变：**AUD-C1 合成层已落 main**（[#164](https://github.com/rayw-lab/website/pull/164) → `38a2086`，`WorldAudio.ts` 619 行，经急裁 [#165](https://github.com/rayw-lab/website/pull/165) GO）——「~150 行再评审引库」旧预计已被 #164 事实口径更新；`src/lab/world/audio/` 目录既存 | `git log` + `ls` 实测 |
| **F6** | 「合入 ≠ 授权」先例在册：[#161](https://github.com/rayw-lab/website/pull/161) CAM 红线 v2 送签稿——看板明文「送签稿合入 ≠ 指挥官红线签字，视角旋转实现仍禁」 | 看板单源在途区 |
| **F7** | [#166](https://github.com/rayw-lab/website/pull/166) NAV-C1 OPEN（CONFLICTING 待 rebase）在途；两者都触观测白名单计数注释邻域（cc-bgm-rs §10-8 已自预告文本冲突点）；含 src PR 合入须董事会急裁（#159 规程） | `gh pr view 166` + #159 |

---

## A. 终裁一：Codex P1 **成立**——cc-bgm-rs「无需重裁」自我授权条款无效

1. **法理**：书面裁决只能被书面裁决修订（AGENTS.md 董事会行「书面裁决优先于顾问链与一切子代理单」+ R5 §A-1「废止须书面明示废止令」同一法理）。调研子代理单**不得自裁自己与上位裁决的符合性**——cc-bgm-rs §0-7「少而不越，无需重裁」与 §3.3「无冲突声明」是把改判权自我授予，程序违规。
2. **「子集」论定性**：文件域上「audio/ 扩展 ⊂ R5 原表」成立，但 R5 BGM-C1 的**交付物名词是「资产 BGM」**（F3 三处明文），改资产为合成 = 改判交付物本体与门禁结构（许可/体积审查对象消失），不是缩域。域的子集 ≠ 裁决的子集。
3. **效力切割**：cc-bgm-rs 的技术内容（§1–§10）**全部保留为参考底稿，质量不予推翻**；被判无效的仅 §0-7 与 §3.3 的「无需重裁/无冲突」**效力声明**。该两处自本单起标记 superseded by 本单（登记看板一行，不改史、不 revert #169）。

## B. 终裁二：合成氛围垫 v0 路径 = **附条件批准**（三选一之二）

**裁决**：批准 BGM-C1 交付物由「资产 BGM」改判为「**v0 纯合成生成式氛围垫**（资产 BGM 降级为 v1 触发式后备）」，条件见 §C/§D/§E/§F，违反任一条件即回落原 R5 资产口径。

**理由五条**：

1. **风险面单调收窄**：零资产 → R5 给 BGM-C1 设的两大审查面（许可、体积）的审查对象成为空集，以机器可核事实替代（§D）；资产路线不废弃、降级为 v1 后备——本改判只减不增风险，属工程路线裁量，无需重开产品题。
2. **与更上位裁决对齐度更高**：G3（`cyber-city-gameplay-features.md`）主路径 = 「WebAudio 纯合成零资产」，是产品特性单源；R5 §C「合成管事件音、资产管 BGM」的分工修订为「合成先行、资产后备」后，与 G3 主路径一致性反而增强。
3. **#157「不划算/不可行」= 区分成立、翻案不成立**：原文限定语是「编曲级赛博循环曲——序列器+混音远超 150 行红线」（F4）；「两和弦 + 稀疏五声动机 + 空气感」的生成式氛围垫是**不同交付物类**，且 150 行红线已被 #164 事实口径更新（F5，WorldAudio 619 行经急裁合入）。#157 结论在其限定域内继续有效：**任何编曲级诉求仍禁走合成路线**（cc-bgm-rs §10-6 避坑同旨）。
4. **产品层「是否上 BGM」不重开**：#157 DP-3 把该产品题留给指挥官，R5（指挥官明示咨询触发的终裁）已把 BGM 列为优先级④波次件——产品题在 R5 已消化，本单只改「怎么上」。
5. **退出成本对称性**：v0 失败退路廉价（指挥官听感不达标 → 触发 v1，DP-B5 口径已备）；反向「先资产后合成」则许可检索/转码/台账作业全部沉没。

## C. 终裁三：R5 条文修订清单（逐条，未点名条文一字不动）

| R5 原条文 | 修订后口径 |
|-----------|-----------|
| §B 优先级④「BGM 资产落地」 | 「BGM 循环层：**v0 合成氛围垫先行**；资产 BGM 降级 v1 触发式后备」 |
| §B W-R5-2 行 BGM-C1 开工条件「CC-AUD-RS 许可/体积裁决后」 | **v0** = 本裁决合入 + §F 开闸五条；**v1** = 维持原条文全量（DP-3 roadmap #10 修订前置 + 许可/体积审计） |
| §B 文件域表 BGM-C1「`public/` 音频资产 + audio/ 播放器扩展 + credits 落点」 | **v0** = cc-bgm-rs §5 表（`BgmLoop.ts` 新增 + WorldAudio wiring ≤40 行 + SessionTimeline +1 type + observability 1 行 + 新 e2e spec + 测试框架登记）；**`public/` 与 credits 在 v0 转为禁入区**（v1 专属域）；原禁入区（首页关键路径、首包）照旧 |
| WBS 行「BGM-C1 \| 赛博 BGM 资产 \| … \| 许可/体积审计 + §D 六门」 | 「BGM-C1 \| **v0 合成氛围垫** \| W-R5-2 \| 本单合入后 \| **零资产三证（§D）** + §D 六门八禁 + **HG-B1/HG-B2（§E）**」 |

**明确不废止**：R5 §D 六门八禁全文一字不动、不豁免任何门；W-R5-2「三件各自单 PR 禁并」串行纪律不动；禁项③「禁 BGM 自动有声」不动——**默认 OFF 恒定**，DP-B2（muted-until-gesture）未获指挥官对禁项③解释权的书面确认前禁改（实现只留一个常量位）。

## D. 许可面口径：零资产下许可/体积审查的等价替代（合入急裁必查三证）

v0 审查对象为空集，人工许可审查以三条**机器可核事实**替代，缺一即打回：

1. **PR diff 面**：`public/` 零新增、diff 全文零音频二进制与零 base64/data-URI 内嵌音频；`package.json`/lockfile 零新增音频依赖（howler/Tone.js 永不引入红线复读，SRD 禁引清单）。
2. **e2e 取证面**：CITY-BGM-01 断言 C 双口径照裁——全程零音频资源网络请求（`.mp3/.m4a/.webm/.ogg/.opus` 过滤器），同时为 v1 懒加载合同预置取证面。
3. **失效条款**：实现中出现任何资产文件、音频库或预录 PCM（超出运行时程序化生成范畴）→ **本单 v0 批准即刻失效**，整单回落 v1 门（DP-3 roadmap #10 修订 + `asset-ledger-cyber-city.md` 逐笔 + credits 落点 + ≤500KB 双源工作口径 / 1.5MB 绝对天花板）。

体积门澄清：v0 对「音频资产体积」平凡满足，但 `BgmLoop.ts` 的 JS 增量照常受门 6 约束（入 world 懒加载 chunk，G-A′「交互前零 world 字节」既有门覆盖；LHCI `/` 与 `/home/` 四项不降照跑）。

## E. 终裁四：P2×2 **双双升为实现硬门**（写入 BGM-C1 实现任务书，合入急裁 checklist 必查）

| 硬门 | 内容 |
|------|------|
| **HG-B1**（ducking 参数争用，[r3881889313](https://github.com/rayw-lab/website/pull/169#discussion_r3881889313) 成立） | **禁止在同一 AudioParam 上混用每帧 `.value` 直写与 `setTargetAtTime` 自动化**。二选一：(i) 串联双 GainNode——连续侧链 `duckEngine` 每帧直写 × 脉冲 `duckPulse` 走自动化（**推荐**，两通道物理隔离）；(ii) 单节点全 JS 合成包络——脉冲包络在 JS 计算、与连续值相乘后每帧单点直写。实现 PR body 必须声明所选方案；cc-bgm-rs §4.2 表的包络语义（目标值/τ/恢复沿）在所选方案下逐行成立；探针 `bgm.duck` 输出合成后有效值（断言 G 不变） |
| **HG-B2**（断言 C/E 单挂载互斥，[r3881889316](https://github.com/rayw-lab/website/pull/169#discussion_r3881889316) 成立） | **CITY-BGM-01 显式批准第二挂载**：同 spec 文件双用例串行——用例 1（无种子挂载）覆盖 A–D/F–J；用例 2（`addInitScript` 种 `world-bgm-on='1'` 后新文档挂载）覆盖 E。cc-bgm-rs §6 编排行「单用例单次挂载」就此修订；`MOUNT_TIMEOUT 210s`/serial project 口径不变；用例数登记以 `cyber-city-test-framework.md` 单源 fresh `--list` 分母为准 |

效力：两硬门为合入急裁必查项，违反任一 = 打回定向补洞，**不得以综合分或其他门抵扣**（专项门法理，R5 §D 同旨）。

## F. 终裁五：**#169 调研合入 ≠ 实现授权**（开闸条件汇总）

**明文**：#169 合入只交付调研文本（docs 直合合规），不含任何实现授权——与 #161「送签稿合入 ≠ 签字」同一先例（F6）。**BGM-C1 实现开工的充要条件 = 本裁决合入 main 且以下五条全满足**：

1. §C 修订生效（本单合入即生效）；
2. AUD-C1 在 main（已满足，`38a2086`）；
3. 实现任务书完整转录：cc-bgm-rs §5 文件域（经 §C 修订）+ §6 断言草案（经 HG-B2 修订）+ §10 避坑九条 + 本单 **HG-B1/HG-B2 全文** + R5 §D 六门八禁全文；
4. **默认 OFF 恒定**（DP-B2 未获指挥官书面确认前禁改）；
5. 合流义务：NAV-C1 [#166](https://github.com/rayw-lab/website/pull/166) 在途——后合者负试合并 + 合流树冒烟（观测白名单计数注释 = 已预告文本冲突点）；W-R5-2 串行纪律：与 CAM-ROT-C1/NAV-C1.5 永不同批。

**开工授权 ≠ 合入授权**：BGM-C1 为含 src PR，合入时仍须董事会急裁（[#159](https://github.com/rayw-lab/website/pull/159) 站立授权规程），届时按 §D 三证 + §E 双硬门 + R5 §D 六门逐条查验。**听感验收**：验收人 = 指挥官真机，口径「加分而非出戏」；因默认 OFF 零首访影响，听感**不作合入硬门**，作 v1 触发器（DP-B5）与情报账（禁⑥ 自评禁登不变）。

## G. 父代理执行令

**一句话执行令**：本单合入后 BGM-C1 v0（合成氛围垫）即获开工授权——任务书按 §F-3 清单完整转录（含 HG-B1/HG-B2 双硬门 + 默认 OFF + 零资产三证），单 PR 串行、合入仍须董事会急裁；**#169 合入本身不是实现授权，Codex P1 就此销案**。

| # | 动作 |
|---|------|
| 1 | 合本单（docs-only，站立授权直合面） |
| 2 | 看板登记：BGM-C1 改判注记（R5 §B/WBS 行指向本单）+ Codex P1/P2×2 销案行 + cc-bgm-rs §0-7/§3.3 标记 superseded by 本单（不改史、不 revert） |
| 3 | 派 BGM-C1 实现 Task（`claude-fable-5-thinking-xhigh`）：任务书 = §F-3 转录清单，范围外禁扩批（禁⑧） |
| 4 | 禁项复读：CAM-ROT 实现仍禁（#161 未签）；全量 e2e 互斥窗照旧；#166 合流序由父代理裁 |
| 5 | 若指挥官欲改默认态（DP-B2），须其对禁项③解释权的**书面确认**先行，实现只动一个常量位 |

---

## 登记矩阵四行（看板单源口径）

北极星 **98 / 98 / 90 / 85** vs 生产登记 **80 / 73 / 87 / —**（综合/视觉/功能/性能）。性能显式 **—**，解锁条件 = 指挥官真机六腿 → AL-PERF（[#155](https://github.com/rayw-lab/website/pull/155) 唯一合法路径）。本单零分数产出，不触登记矩阵。

---

*本文档为 CC-LOOP-BOARD-ADVISOR-BGM-SCOPE 交付物（董事会急裁）；交付五问全答（P1 定性 §A、路线三选一 §B、R5 修订/开闸/许可面 §C/§D/§F、P2×2 升门 §E、合入≠授权 §F）；链接经 `gh` 实测；看板增量由秘书下一界点单并入，禁多处重复登记。*
