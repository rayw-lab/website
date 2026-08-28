# CC-LOOP-BOARD-ADVISOR-R5-IMPL-GATE · 董事会急裁（W-R5-1 实现开闸：AUD/NAV 开工令 + DP-1 终裁 + #134→#104 策略确认 + 指挥官阻塞清单）

- **角色**：CC-LOOP-BOARD-ADVISOR-R5-IMPL-GATE（董事会急裁，站立授权规程 [#159](https://github.com/rayw-lab/website/pull/159) 已合 main——本书面裁决父代理必须执行；权威口径沿 R1 [#143](https://github.com/rayw-lab/website/pull/143) 固化条款）。
- **model slug**：`claude-fable-5-thinking-xhigh`
- **纪律**：零 `src/` 改动；独立 worktree `/tmp/board-wt-r5-impl`；base = main@`dedf226`；文件域 = 仅本文档。
- **取证窗口**：2026-08-28 10:05–10:20 UTC，`gh` 实测 + `git` 世系/文件域一手核验 + 在途跑道只读探视（零干预）。
- **生效**：本裁决**交付（draft PR 开出）即生效执行**，合入仅为存档登记（docs-only，站立授权直合面）。

---

## 0. 一行裁决表（A–F 速览）

| # | 议题 | 裁决 |
|---|------|------|
| **A** | #160/#161/#162 合入序 | **GO·追认**——父代理已按 160→161→162 序 squash 合入（10:07–10:08Z，三单 CI 全绿，站立授权合规）；**#161 合入 ≠ 实现授权**（签字栏空），#162 合入 ≠ NAV-C1 自动开工（须 DP-1 = 本单 B） |
| **B** | NAV DP-1 终裁 | **GO·传送式**（两段式：pin 点击 → 传送 parkingBay → E 确认进站）；直跳楼页 v1 **否决**；DP-3 随案盖章（robot_idle + transforming 双态 hidden） |
| **C** | AUD-C1 开工 | **GO·立即**（W-R5-1 门 = post-#129 main 已满足）；与 #134/X2 链**零文件交集**（本单实测）；六门实例化 + 禁项见 §C；chrome 级验证按互斥令排队 |
| **D** | NAV-C1 时点 | **GO·立即**（#162 已合 + DP-1 已裁），**不等 #134 段末审计**；与 AUD-C1 **并行 GO**（并行例外条款：文件域正交 + 段末试合并 + 合流树冒烟必做；全量窗错峰） |
| **E** | #134→#104 策略 | **维持两步走·更新栈**（主案）：段末审计放行 → #134 入 #104 分支 → #104 单次 rebase onto main；「新 PR base=main」仅为逃生舱（条件三条）；段末审计 = **独立 ×1**（零业务代码 + fresh 取证 + 自建集成树），**不设 ×2 双趟**——×2 属 EXP-01 决定趟专项已销案 |
| **F** | 指挥官阻塞清单 | 三项阻塞（CAM 签字 / 真机 S-2 安卓+序 A/B / 真机性能六腿）+ 一项非阻塞裁量（DP-2 质感取向）——**永不代决**，父代理只置顶催办 |

**登记矩阵四行（看板单源口径）**：北极星 **98 / 98 / 90 / 85** vs 生产登记 **80 / 73 / 87 / —**（综合/视觉/功能/性能）。性能第四行维持 **—**，解锁条件 = 指挥官真机六腿 → AL-PERF（[#155](https://github.com/rayw-lab/website/pull/155) 两步不可再压；口头 85 已入声明档/情报账，禁登生产）。视觉 73 为看板单源（AGENTS.md 71 已裁 stale）。

---

## 1. Fresh 事实（全部 `gh`/`git` 实测，快照 10:05–10:20 UTC）

| # | 事实 | 证据 |
|---|------|------|
| F1 | main tip 快照演进：取证起点 `467d148`（#159 站立授权）→ 本单交付时 **`dedf226`**——父代理在本单取证窗内已合 [#160](https://github.com/rayw-lab/website/pull/160)→`c62f867`（10:07Z）、[#161](https://github.com/rayw-lab/website/pull/161)→`6c51f53`（10:07Z）、[#162](https://github.com/rayw-lab/website/pull/162)→`dedf226`（10:08:23Z）；三单 CI 门禁全 pass（#162 4m53s pass 后合入），main@`dedf226`/`6c51f53` CI success | `gh pr view/checks` + `gh run list --branch main` |
| F2 | #129 MERGED `4f445e4`、#158 MERGED `9c5f102`、#157 MERGED `3b7498e`、#159 MERGED `467d148`——×2 = 2/2 闭合、R5 波次与优先级（音效>小地图>旋转>BGM>缩略条）、性能声明分账均在 main | `gh pr view` 逐单 |
| F3 | [#134](https://github.com/rayw-lab/website/pull/134) OPEN draft，base = `cursor/cc-vis-x2-facade-r2-1d6f`，tip 已从看板登记的 `e03271f` 前进至 **`d99a0e2`**（新增：QST-02 idle 腿预算重标定 1200s→1800s `9ad97ec` fix(e2e) + triage 报告 r2 勘误 + WP-C 注释更新——含 e2e 预算改动，段末审计取证面须含此三笔）；[#104](https://github.com/rayw-lab/website/pull/104) OPEN draft 禁 ready；[#43](https://github.com/rayw-lab/website/pull/43) 冻结 NO-GO 维持 | `gh pr view 134 --json commits` + `git log pr-134` |
| F4 | 在途跑道（只读探视，零干预）：`/tmp/plug-rebase-wt` HEAD = `d99a0e2`（分支 `wt-plug`，**main NOT ancestor——仍在栈上、未 rebase**），test-results 含 CITY-EXP（explore 计数/reload 还原）产物——实现子代理自证跑在途，**勿杀令续期** | `git -C /tmp/plug-rebase-wt log/status` + `ls test-results` |
| F5 | X2 链（origin/main...pr-134 三点 diff）文件域实测：`src/lab/world/city/`（CityBlocks/FacadeKit/ForegroundFraming/StreetProps/index）+ `e2e/cyber-city-{explore,observability,perf}.spec.ts` + `playwright.config.ts` + `tools/{blender,camera}` + facade-kit 资产 | `git diff --stat/--name-only` |
| F6 | 新 spec 零配置接入实证：`playwright.config.ts` world-chromium project `testMatch: /world-spike\.spec\.ts\|cyber-city.*\.spec\.ts/`——AUD/NAV 新 spec 命名 `cyber-city-*.spec.ts` 即自动收编，**playwright.config.ts 零改动**（与 #134 该文件的改动零相遇） | main `playwright.config.ts` L94 |
| F7 | 事件白名单单源 = `src/lab/world/core/SessionTimeline.ts`（groups L62-66 + 表 L84-107）——AUD 与 NAV 唯一预期文本交叠点（#134 不触该文件）；HINT_TEXT 在 `src/lab/world/world/Reveal.ts`，其断言面在 `e2e/cyber-city-feedback.spec.ts`（**#134 未触**） | `git grep` origin/main |

---

## A. 裁决：#160/#161/#162 合入序——GO·追认 + 两条效力切割

1. **追认合规**：三单均 docs-only、base=main、文件域两两零交集（#160 仅看板 / #161 仅 camera 双档 / #162 仅 nav survey），CI 全绿后按 160→161→162 序 squash 合入——站立授权（#159：docs 直合）程序合规，**合入行为追认，零瑕疵**。并行 squash 本亦可行（文件域正交），父代理选串行序更利登记，予以确认。
2. **效力切割一（#161）**：**合入 ≠ 实现授权**。`docs/spec/cyber-city-camera-orbit.md` §8 签字栏为空（☐ 待签），合入仅使送签稿上主干可供指挥官签署；G5 相机纪律 **v1 继续全额有效**，CAM-ROT-C1 开工须 §5 三绿：P0 指挥官签字（永不代决）+ P1 X2 链收口 + P2 AL-VIS 复评交付。任何子代理不得以「送签稿已合」为由触碰 `view/View.ts`/`inputs/Pointer.ts` 的 orbit 通道。
3. **效力切割二（#162）**：合入使 NAV 调研结论可引用，但 NAV-C1 开工还需 DP-1 终裁——**本单 B 项即为该终裁**，自本单交付起 NAV-C1 开工条件齐备（详见 D）。
4. 看板登记：#160 快照锚 `467d148` 与现 tip `dedf226` 的差 = 本波三合入 + 本单，属正常演进；秘书下一界点单一并收编（禁临时单）。

## B. 裁决：NAV DP-1——GO·传送式（董事会终裁，即日生效）

**终裁：采纳传送式两段式**（NAV 调研 §3.3）：pin 点击 → 传送至该楼 parkingBay（复用 `applyDeepLink` 位姿换算，落点即触发圈内）→ 关面板 → `boundingIn` 全链天然入账 → 标点 pinned 展开 → 玩家 **E 确认进站**（PoiArrival 前奏照常）。

1. **法理**（采纳 NAV §6 DP-1 三条 + R5 §C 倾向，全部一手核验成立）：① 漏斗完整——`world-poi`/`poi-bounding-in`/explore/quest 四件零旁路；② 误操作代价不对称——直跳误点 = 离开世界 + 重挂载 ~8s（GAP-13 P0 同伤口），传送误点 ≈ 0；③ 实现面最小——落点换算/respawn/触发圈全现成，直跳需新开远程 navigate 旁路。
2. **否决面**：直跳楼页 v1 禁做；「pin 详情面显式直接进站」次级动作留 v1.5 评估（不入 NAV-C1，禁扩批）。
3. **DP-3 随案盖章**：robot_idle **与 transforming** 双态一切导航 UI hidden（口径与 ExploreProgress/DriveFeedback 统一），三重保险照 NAV §3.5 执行（categories 闸门 + CSS 两态样式门 + 懒初始化）——即日为 NAV-C1 §D 门 5 执行细则。
4. **DP-2 默认值**（非阻塞，见 F-4）：v1 零缩略资产（neonColor 色块 + 双语楼名 + district 标签）；v1.5 若需图矢量图标优先；楼卡截图仅指挥官明确要「真实楼景」质感才走（体积入账 + 单 PR 归因 + 重拍排批次最后）。

## C. 裁决：AUD-C1——GO·立即开工

**开工条件已全部满足**：W-R5-1 门 = post-#129 main（#129 已合 `4f445e4` ∈ main）；音频调研 [#157](https://github.com/rayw-lab/website/pull/157) 已合可引用；R5 优先级第一位。**零采样纯合成即为本段正解**——G3 v0 口径（WebAudio 合成管事件音，全站音频字节 = 0），BGM/资产一律禁入本段（W-R5-2 另案）。

1. **范围（禁扩批）**：五事件合成音（加速 / 行驶引擎振荡器速度映射 / 刹车 / 撞楼 impulse 分档 / 变形 whoosh 对齐四拍）+ 静音钮（DOM 注入 + localStorage 持久）。单 PR，base = main@`dedf226` 或更新 tip。
2. **文件域（本单实测校准）**：新增 `src/lab/world/audio/`（绿地，F6 已证目录不存在）+ `e2e/cyber-city-audio.spec.ts`（**playwright.config.ts 零改动**，F6 泛匹配自动收编）；触碰 = Player/TransformSystem/PhysicsVehicle 事件挂钩各 ≤5 行 + 静音钮 DOM + `core/SessionTimeline.ts` 白名单加行（按字母序插入）；禁入 = `view/`、city 几何与数据、既有 e2e 断言语义、`playwright.config.ts`。
3. **与 #134/X2 链冲突面 = 零文件交集**（F5 vs 上行文件域逐一比对：X2 链五 city 文件 + 三 spec + config + tools，AUD 全部禁入）——与视觉轨并行**无合流风险**，段末试合并义务仅对 NAV（见 D）。
4. **门禁清单（R5 §D 六门实例化，段末放行必查）**：
   | 门 | AUD-C1 口径 |
   |----|-------------|
   | 1 e2e | 全量 0/0/0（80 例口径单源 `cyber-city-test-framework.md`）+ 新增断言最低集：**首手势前零 AudioContext 实例** / 静音钮持久（reload 记忆）/ 事件音触发计数入 dump |
   | 2 无障碍 | 静音钮可聚焦 + `aria-pressed` + 键位卡如加「静音」条目须同 PR 修 feedback spec 文案断言 |
   | 3 reduced-motion | 禁任何音频联动视觉脉动（如做可视化 = 事件驱动一次性，CITY-03 配额 ≤3 席不破）；mute 常驻可达 |
   | 4 autoplay 政策 | AudioContext 懒创建 + 首手势 `resume()`（iOS 手势 handler 内同步解锁）；禁一切「加载即响」 |
   | 5 poster/恒等 | robot_idle 逐字节恒等；静音钮 robot_idle/transforming hidden（与 NAV DP-3 同口径）；不改首幕渲染路径 |
   | 6 LHCI+体积 | `/` 与 `/home/` 四项不降；音频资产字节 = 0（纯合成天然满足，PR 附声明） |
   禁项沿 R5 §D 八条：零依赖原生 WebAudio（禁 GPL/LGPL 库）、禁扩批（BGM/采样/可视化面板均出界）。
5. **跑道纪律**：编码/构建/单测**即刻开工**；一切 chrome 级验证（e2e/LHCI/截图）按互斥硬令排登记空档——当前 `/tmp/plug-rebase-wt` CITY-EXP 自证跑在途（F4），**勿杀、勿并发 chrome 级活动**，收轮后错峰进窗。

## D. 裁决：NAV-C1——GO·立即开工（不等 #134 段末审计），与 AUD-C1 并行 GO

1. **时点**：#162 已合（F1）+ DP-1 已裁（本单 B）→ 开工条件齐备，**即刻可派**。**不等 #134 段末审计**——R5 §B-2 已裁 NAV/AUD 与 city 几何零文件交集可与视觉轨并行，本单实测复证：NAV 文件域（新 `src/lab/world/ui/Minimap.ts` + `world/index.ts` 装配段 ≠ X2 的 `city/index.ts` + `world/Reveal.ts` HINT_TEXT + `e2e/cyber-city-minimap.spec.ts` 新 spec + feedback spec 文案修正）与 X2 链（F5）**零文件交集**（HINT 断言面在 feedback spec，#134 未触，F7）。等待反而把 P0 缺口（GAP-12）清偿人为串行化，零收益。
2. **与 AUD-C1 并行 = GO**（W-R5-1 双 PR 并行例外条款）。唯一预期文本交叠 = `core/SessionTimeline.ts` 白名单 + `world/index.ts` 装配段（F7），按 NAV 调研 §5.1 三措施执行：① 白名单行字母序插入；② DOM 各自独立 root + injectStyles；③ **段末试合并 + 合流树冒烟必做**（文本零冲突 ≠ 语义零冲突）——两 PR 中后合者承担试合并取证，父代理按审计指定顺序合流。
3. **验收合同**：NAV 调研 §5.2 九断言（A1–A9）+ R5 §D 六门全过；Esc 双响回归锁（A2）与 Respawns 禁触（R2：传送走独立 `teleportTo()`，不动 R 键语义）为硬项；HINT_TEXT 串尾加「M 地图」须同 PR 修 feedback spec 断言（F7）。
4. **全量窗错峰**：AUD 与 NAV 的全量 e2e 各自登记空档执行，**禁同窗**；均排在 plug 在途自证跑收轮之后（互斥硬令，R1 §3.5）。

## E. 裁决：#134→#104——维持两步走·更新栈（主案）；段末审计独立 ×1，不设 ×2

1. **主案确认（登记在案的两步走，禁改道）**：段末审计放行 → **#134 先入 #104 分支**（squash/merge into `cursor/cc-vis-x2-facade-r2-1d6f`）→ **#104 单次 rebase onto main**——EXP-01 动线相关冲突**取 main/ENV canonical**（#129 已落 main），A 案几何保 plug 版 → 复活门余两条（R2 双清 + 全量 80 例 0/0/0，「#104 候选 ⊕ main」集成树口径）→ ready → 董事会/站立授权程序合入（含 src，须董事会放行确认）。
2. **否决「新 PR base=main」为主案**：审计锚（纪律事件 #3 分账、探针双门 PASS、triage r1/r2）与世系全部挂在 #134/#104 号上，重开 PR = 取证链重锚 + 登记面翻倍，且违「一段一 PR」聚焦。**仅当** rebase 重放冲突不可控（如 EXP-01 canonical 与 A 案几何在同文件段落纠缠到无法机械择边）时作为逃生舱启用，启用须三件齐备：① 旧双 PR close superseded + SHA 映射登记看板；② 新树按 fresh「候选 ⊕ main」集成树全量重取证；③ 父代理回报董事会备案（事后追认即可，不阻塞）。
3. **段末审计门口径**：**仍必设、独立 ×1**——独立审计（零业务代码 + fresh 取证 + 自建「#134⊕#104⊕main」集成树）对 A 案几何放行 + QST-02 预算重标定（F3 新增 `9ad97ec`，e2e 预算改动属审计必查面）+ 全量 80 例 0/0/0。**不设 ×2 双趟制**——×2 是 EXP-01 决定趟专项制度（run7/run8 ✓✓ 已闭合销案），非段末审计一般要件；全量窗按 ≥2 轮排期预算（AGENTS §4.3 排期口径，非双签门）。审计取证锚 = **`d99a0e2`**（F3：tip 已前进，勿按看板旧值 `e03271f` 取证）。
4. **在途自证跑处置**：`/tmp/plug-rebase-wt` CITY-EXP 跑（F4）= 实现侧情报，**不替代审计独立分**；勿杀令续期，收轮产物归档后再开审计窗（互斥令）。子代理如拟先行 rebase 演练，允许在私有 worktree 内做**试装不推送**；正式 rebase 动作等段末审计放行后按主案序执行。

## F. 裁决:指挥官阻塞项清单（永不代决——父代理只置顶催办、备齐材料，禁代签禁代跑）

| # | 阻塞项 | 材料状态 | 解锁面 |
|---|--------|----------|--------|
| F-1 | **CAM 红线 v2 签字**（`docs/spec/cyber-city-camera-orbit.md` §8 签字栏：同意/附条件/拒绝+替代案 Alt-A/B/C） | 送签稿已上 main（`6c51f53`），随时可签 | CAM-ROT-C1 P0（另需 P1 X2 收口 + P2 AL-VIS，签字先到不解锁跑道） |
| F-2 | **真机 S-2 功能走查**（安卓腿 + 序 A/B，kit [#108](https://github.com/rayw-lab/website/pull/108) 已在 main） | kit 齐备，待指挥官执行 → artifacts 回传 | AL-R10 计时增补轮 → 功能 87→90 唯一路径（云端封顶 87–88，90 禁登） |
| F-3 | **真机性能六腿**（[#96](https://github.com/rayw-lab/website/pull/96) 桌面单已在 main） | 单据齐备，真机在手 = 采集窗口最优（R5 §A E-4 口径） | AL-PERF 首分登记 → 第四行 — 解锁（[#155](https://github.com/rayw-lab/website/pull/155) 两步不可再压；口头 85 仅情报账） |
| F-4 | （非阻塞裁量）DP-2 质感取向——楼卡截图 vs 矢量 | 默认值已由本单 B-4 定（v1 零资产 / v1.5 矢量优先），不阻塞 NAV-C1 | 指挥官可事后改判，改判走 NAV-C1.5 单 PR |

北极星调整、放行令核发、红线修订签署均属永不代决类（#159 规程表第 4 行）；F-1/F-2/F-3 建议父代理在每次编排 Delta 中置顶复读直至清账。

---

## 附：父代理立即动作单（≤6 条，命令式）

1. **即派 AUD-C1 实现 Task**（Fable5 xhigh，单 PR base=main@`dedf226`+，任务书 = 本单 §C 范围/文件域/六门 + R5 §D 禁项全文；chrome 级验证排队互斥令）；
2. **即派 NAV-C1 实现 Task**（Fable5 xhigh，单 PR 并行，任务书 = NAV 调研 §3/§5 + 本单 B/D + R5 §D 六门全文；后合者承担段末试合并 + 合流树冒烟）；
3. **勿杀 plug 自证跑**；收轮归档后**派段末审计 AL**（独立 ×1，取证锚 `d99a0e2`，含 QST-02 预算重标定审查 + A 案几何放行 + 集成树全量 80 例 0/0/0 排程）；
4. 段末审计放行后按 §E 主案执行 #134 入 #104 分支 + #104 单次 rebase（EXP-01 取 main canonical）；逃生舱仅按 §E-2 三条件启用；
5. **向指挥官置顶三催办**：CAM 签字（F-1）、S-2 安卓+序 A/B（F-2）、性能六腿（F-3）——材料全部已在 main，零准备成本；
6. 本单合入（docs-only 站立授权直合）+ 秘书下一界点单收编本波登记（160/161/162 合入 + 本单 + AUD/NAV 派单），禁临时单。

---

*本文档为 CC-LOOP-BOARD-ADVISOR-R5-IMPL-GATE 交付物（董事会急裁）；A–F 全答，链接与 SHA 经 `gh`/`git` 一手实测；零 src 改动；在途跑道只读探视零干预。*
