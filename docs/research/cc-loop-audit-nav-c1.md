# CC-LOOP-AUDIT-NAV-C1 · 段末独立审计（#166 M 键小地图 + pin 两段式传送）

| 项 | 内容 |
|----|------|
| 角色 | 段末独立审计 NAV-C1（零业务代码、fresh 取证、自建集成树；小地图上线关键路径） |
| model slug | `claude-fable-5-thinking-xhigh` |
| 日期 | 2026-08-28（UTC）取证窗口 15:32Z 起；独占窗复跑收口时间见 §2.1 |
| 对象 | [#166](https://github.com/rayw-lab/website/pull/166) tip `5faab5f`（`gh pr view` headRefOid fetch 复核一致） |
| 集成树 | `32659d2` = `5faab5f` ⊕ origin/main@`40709fc`，`git merge-tree --write-tree` exit 0 零冲突；审计期间 main 推进至 `b29edb8`（#170/#171 纯 docs +2 文件），对新 tip merge-tree 复验仍 CLEAN——运行时/e2e 面与集成树逐字节等价，免重建（§6-6） |
| 跑道 | 本指挥 VM · 独立 worktree `/tmp/nav-c1-wt`（detached @`32659d2`）+ `E2E_PORT=4399` 全隔离（缘由见 §6-1 跑道抢占事故） |
| 上位裁决 | [#163](https://github.com/rayw-lab/website/pull/163) R5-impl-gate §B（DP-1 传送式终裁 + DP-3 随案盖章）/ §D（NAV-C1 开工令 + 验收合同）· [#158](https://github.com/rayw-lab/website/pull/158) R5 §B 文件域 / §D 六门八禁 · [#162](https://github.com/rayw-lab/website/pull/162) NAV 调研 §3/§5（交互正本 + 九断言 A1–A9） |
| 禁域 | 改 src ✗ · 合 #166 ✗ · 抢 AUD 云机 ✗（全程遵守；本文档 = 全部交付物） |

## 0. 结论先行：**fix-forward（禁天然合并）**

1. **破门项唯一且已实锤：NAV×AUD HUD 右上角双钮重叠**。`.world-minimap-btn`（`top:1rem;right:1.15rem`，`Minimap.ts` 后挂载同 z-index 6 后画居上）完全盖住 #164 的 `.world-audio-toggle`（`top:.85rem;right:.95rem`）——两钮可见窗相同（robot_idle/transforming 双态同 hidden、car_ready 起同现身）。运行时证据：CITY-AUD-01 第 108 行 `audioBtn.click()` 被 Playwright hit-target 检查拦截，报错原文 `<button class="world-minimap-btn">… from <div class="world-minimap-root">… subtree intercepts pointer events`，重试 18+ 次后用例超时 **FAIL**——独立探针轮 + 全量轮**两窗复现，非 flaky**。截图取证：car_ready 帧右上角**只见「地图 M」一颗钮**，「音效 OFF」钮在视觉与命中面上双双消失——不止 e2e 破门，真实用户的静音钮同样不可点、不可见。e2e 硬门 0/0/0 破（数字与竞争窗剔除见 §2）。
2. **归因在 #166 tip 自身而非集成树**：`5faab5f` 已是 merge main（含 #164）后的 tip，重叠在 PR 分支上原样复现；PR 声称的「后合者承担试合并 + 合流树冒烟」只清了白名单/规格两处**文本**冲突（41 type / 10 族双全 ✓），未做交互面冒烟——恰是「文本零冲突 ≠ 语义零冲突」的教科书案例。PR 承诺的全量 e2e 跟帖（评论区）截至取证时**未落地**，本审计为该 PR 首份全量证据。
3. **其余核验面全部过门**：DP-1 传送式逐条 PASS（§3）、DP-3 三重保险三层 PASS 且 **CITY-NAV-01/02/03 独占窗全绿 + VIS-01–04 全绿**（poster 恒等运行时终证）、文件域合规（§4）、禁 pointer-lock 零命中、LHCI 不降（CI artifact 回填，§5）。全量轮其余失败经**双向对照实验**（同 VM 无 #166 对照树同款失败、时长指纹 ±0.3m 一致）全部定性为本 VM 环境性/竞争性，与 #166 零因果（§2.1 对照表）。**#166 语义账 = 83/84 过 + 1 真回归**。修复面极小（一处 CSS 落位 + 一条回归断言），**不推倒重来、不降门**，走定向补洞（§7 F1–F3）。

## 1. 集成树与分母（fresh 取证链）

| 步骤 | 结果 |
|------|------|
| `gh pr view 166` headRefOid | `5faab5f3df15…`，与本地 fetch 一致 |
| `git merge-tree --write-tree 5faab5f origin/main@40709fc` | exit 0（零冲突；main 侧仅 AGENTS.md 84→87 一行 + `cc-bgm-rs.md` 新文件 + 看板，全自动合入） |
| 集成树 | `32659d2`（本地分支 `cursor/integration-nav-c1-d051`，不推送）；`pnpm build` ✓ 19 pages |
| 分母 | `pnpm exec playwright test --list` fresh = **84 tests / 18 files**（main 侧 81/17 + CITY-NAV-01/02/03；#171 预清单的「81/17」= main 现口径，两账相容） |
| main 移动靶 | 审计中 main 两度推进（`40709fc` → `d94b9d9` #170 → `b29edb8` #171，均纯 docs）；对 `b29edb8` merge-tree 复验 CLEAN，e2e/运行时面等价，集成树免重建 |

## 2. e2e 全量（隔离 worktree，0/0/0 硬门判定）

**全量轮 raw：62 passed / 6 failed / 16 skipped（分母 84，1.6h 墙钟）—— 硬门 FAIL。**
其中 **1 项真回归（破门项）+ 5 项跑道竞争假阴性嫌疑 + 16 项连坐未跑**；竞争窗取证与逐项裁决如下，独占窗复跑结果见 §2.1。

| 类别 | 用例 | 定性 |
|------|------|------|
| **真回归** | CITY-AUD-01（timedOut，`audioBtn.click()` 被小地图钮拦截 18+ 重试）| 独立探针轮 + 全量轮两窗复现；与竞争无关（拦截报错显式指认 `.world-minimap-btn`） |
| 竞争嫌疑 | CITY-QST-02（idle-nudge 30 设计秒未在轮询预算内出现）· CITY-FB-01…09（长驾驶设计秒链 15.2m）· CITY-HINT-01（淡出等待 210s 超支，「M 地图」文案断言本身已过）· CITY-NAV-01（600s 总超时，无失败断言；trace 尾在传送后链路）· CITY-OBS-01（漏斗全走 14.0m） | 五项全部落在 **16:34–~17:05Z 跑道被双占窗**（外来 `playwright test e2e/cyber-city-bgm.spec.ts` + 自带 preview，3× gpu-process 各 150–170% CPU，4 核 load 11——取证 `/tmp/nav-c1-runway-forensics.log`）；全部为设计秒/轮询预算类超时，零断言级失败；窗后 #45 起连续全绿 |
| 连坐 skipped | FB-05/06 · NAV-02 · OBS-01b/02–06（serial 组连坐）+ WS-PERF-01 · CITY-PERF-01/02 · VIS-01–04（world 依赖链下游 project 拒跑） | 独占窗补跑裁决（§2.1） |
| **NAV 三用例** | CITY-NAV-03 ✓（6.4m：触屏 pin 点按 → 传送落 bay ≤radius 全链）· CITY-NAV-01/02 复跑裁决见 §2.1 | pin→teleport→落点合同已由 NAV-03 在窗内证真 |

竞争窗旁证：外来跑在 CITY-QST-01（5.5m ✓）与 QST-02（23m ✘）之间开机；窗内用例墙钟 2–4× 膨胀（HINT-02 8.9m ✓ vs 常态 ~3m），窗后恢复常态（PA-01 3.4m、CITY-E2E-04 1.4m）。

### 2.1 裁决复跑（竞争嫌疑 + 连坐清账）与双向对照实验

（首轮复跑 17:42Z 起步即遭遇外来**全量** `astro build && playwright test` 二次占道——按跑道互斥硬令让行中止，19:05Z 验证跑道空闲（load 0.02）后执行。）

| 波 | 范围 | 结果 |
|----|------|------|
| R1（19:05Z 独占窗） | explore/feedback/minimap/observability 四 spec 19 例（world-chromium `--no-deps`） | 10 ✓ / 4 ✘ / 5 连坐：**NAV-01 ✓ 6.8m · NAV-02 ✓ 6.2m · NAV-03 ✓ 5.2m**（三用例全绿，A1–A8 运行时证据齐）；OBS-01 ✓（全量轮失败=竞争定谳）；OBS-01b/02 ✓；EXP-01/02、QST-01、HINT-02 ✓；仍败 = QST-02（23.1m）/ FB-01…09 / HINT-01（10.1m）/ OBS-03（49s 快败，新面孔） |
| R3（定向单跑清连坐） | FB-05 / FB-06 / OBS-04 / OBS-05 / OBS-06 | FB-05 ✓ · FB-06 ✓ · OBS-04 ✓ · OBS-05 ✓；OBS-06 ✘ 52ms = **过滤跑工件**（新 session 清空 test-results，其消费的 `session-dump-funnel.json` 需同 session 先跑 OBS-01 产出——报错原文自证），空窗连跑闭账见下 |
| R2 | `world-perf-chromium` → `city-perf-chromium` → `visual-chromium`（`--no-deps`） | WS-PERF-01 ✓；**VIS-01/02/03/04 全 ✓（poster/视觉基线逐字节合同运行时终证）**；CITY-PERF-01 ✘（`[data-ws-fps]` 30s 未现——执行时外来裁决复跑在途、双占窗内，空窗重跑见下） |
| R4（空窗终局轮） | CITY-PERF-01/02 + OBS-01\|01b\|06 同 session 连跑 | 【终局轮回填】 |

**双向对照实验（本审计定性主证据，全部同 VM）**：

| 用例 | #166 树（本审计） | 无 #166 对照树 | 定性 |
|------|------|------|------|
| CITY-AUD-01 | ✘ 拦截超时（探针轮 + 全量轮两复现） | **✓ 6.1m**（外来全量 @`/tmp/aud-c1-ready-wt`，AUD-ready 树）+ ✓（17:55Z 外来单跑） | **#166 真回归（唯一破门项）** |
| CITY-QST-02 | ✘ 23.0m / 23.1m | **✘ 22.9m**（同上对照树） | 环境性（时长指纹一致 ±0.3m） |
| CITY-FB-01…09 | ✘ 15.2m | **✘ 15.1m** | 环境性（同上） |
| CITY-HINT-01 | ✘ 10.2m / 10.1m（「M 地图」文案断言已过，败在淡出 210s 预算） | **✘ 10m** | 环境性（同上） |
| CITY-OBS-03 | ✘ 49–77s（卸载期 console.table 0 条送达） | **✘ 75s**（main@`4a58789` 定向单跑，同条件对照） | 环境性（卸载期 CDP console 送达竞走） |

环境性四项的机制：本指挥 VM 慢于 e2e 校准包线（同用例墙钟 ~2×：EXP-01 本机 26–29m vs 校准预期），设计秒驱动腿（idle-30s / 淡出 / 长驾驶链）在固定 expect/poll 预算内走不完；外来侧同日在本机的全量（无 #166，81 例）同样 62 ✓ / 4 ✘ / 15 连坐、失败集完全一致——**四项与 #166 零因果**。

**裁决口径**：84 分母下，**#166 语义账 = 83 过 / 1 真失败（CITY-AUD-01）**；环境性四项挂 VM 账（对照树同款失败，不入 #166 归因）；0/0/0 硬门在本 VM 物理不可达，**F3 复跑门必须在标准 e2e 云机执行**。跑法：`E2E_PORT=4399 pnpm exec playwright test`（webServer 自拉 preview 于 4399，与共享 checkout 的 4321 零接触）。

## 3. DP-1 执法（传送式两段式，#163 §B 终裁逐条）

| 条款 | 核验点 | 判定 |
|------|--------|------|
| 两段式第一段 = 传送 parkingBay | `teleportTo()` → `physicalVehicle.moveTo(target, rotation)` 直写（无 vehicle 时 player 位姿直写兜底） | PASS |
| 不动 Respawns（R2 硬项） | 传送零触 `Respawns`、不发 player `'respawn'` 事件（不重置道具/不出复位 toast）；`Respawns.ts` 零改动 | PASS |
| 位姿换算单源 | `Math.PI / 2 - (bay.heading * Math.PI) / 180` 与 `Areas.applyDeepLink`（L275）逐字一致 | PASS |
| 直跳楼页否决执行 | `teleportTo()` 全路径零 `navigate` 调用；进楼路由唯一入口仍是 PoiArrival E 确认 | PASS |
| 第二段 = E 确认 | CITY-NAV-01 route abort 取证：`world-poi:{id}` 入账 + navHits≥1 + `minimap-teleport.seq < world-poi.seq` 因果序断言（R1 独占窗 ✓ 6.8m） | PASS |
| 漏斗零旁路 | 落点即触发圈内，`poi-bounding-in` 由 Zones 距离检测天然入账（NAV-01 ✓）；explore/quest 不旁路；触屏腿 NAV-03 ✓ 落点 ≤radius | PASS |
| R3 传送竞态 | teleport 不经 actionStart、RELEASE_ACTIONS 拦不到 → `arrival.cancel()` 显式释放（`PoiArrival.interrupt('teleport')`，`shot-interrupt` by 枚举 data 值加法、无参调用行为不变） | PASS |
| 非模态合同 | `role="dialog"` + `aria-modal="false"`（NAV-01/03 实测）；开态不吞驾驶键、不暂停 Ticker（NAV-02 ✓：开图后 `data-world-state` 仍 driving） | PASS |

## 4. DP-3 执法（双态 hidden 三重保险，#163 §B-3）+ 文件域 + AUD 兼容

**三重保险逐层**：① categories 闸门——`minimap` 动作 categories `['wandering','driving']`，`Inputs.filters` 集合过滤机制核验（intro 期两 category 均不在 filters → M 物理拦截；`?poi=` 深链腿 filters='wandering' 与 E 进站 poiInteract 同权，比调研 P1 `['driving']` 放宽一档的法理成立且恒等保证不变）② CSS 样式门——`[data-world-state='robot_idle'/'transforming'] .world-minimap-root{display:none!important}`（钮层整层）③ 懒初始化——`ensurePanel()` 首开才建面板 DOM（NAV-01 ✓：首开前 `[data-world-minimap]` count=0）。运行时终证齐：CITY-NAV-02 ✓（robot_idle 钮 hidden + M 三连按零反应零埋点 + 零面板节点）+ **VIS-01–04 全 ✓（poster/视觉基线逐字节合同）**。**PASS**。

**文件域（vs #158 §B / #163 §D-1）**：`ui/Minimap.ts`（新增，授权绿地）✓ · `world/index.ts` 装配段（#163 §D-2 预期交叠点，条件动态 import + dispose 链对称）✓ · `SessionTimeline.ts` 白名单（同前，41 type / 10 族与规格 §3.4 双全）✓ · `Reveal.ts` HINT_TEXT 串尾 +「M 地图」（#163 §D-3 明令随行 + feedback spec 断言同 PR 修）✓ · `Keyboard.ts` **零触**（运行期 `addActions`，比 #158 授权域「Keyboard.ts M 动作 +1」更收敛）✓ · `PoiArrival.ts` 超出 #158「areas 数据只读」，但 #162 R3 明令「teleport 入口显式调 arrival 中断」+ #163 §D-3 采纳全套验收合同——判**随行豁免**（改动最小：公开 `cancel()` + `interrupt(by)` 参数化，向后兼容）· 禁入区（`view/View.ts`/city 几何/physics/Respawns）零触 ✓。**禁 pointer-lock：PR 全 diff 0 命中** ✓。禁做项自查复核（BGM/机位/缩略条 dock 空槽 hidden/EXP-01）✓。

**AUD 语义兼容**：埋点/事件/dispose 链零冲突；**唯一语义冲突 = HUD 右上角双钮重叠（破门项）**。注意 [#170](https://github.com/rayw-lab/website/pull/170) 缩略条调研 §2 曾判「WorldAudio 静音钮 / minimap 地图钮两钮同窗并存已各自落位、风险零」——**被本审计运行时证据推翻**，docs-only 调研的共存判断不可替代 hit-target 实测。

## 5. LHCI（本 VM SwiftShader null → CI artifact 回填，来源登记）

| 页面 | 候选（run [33183113406](https://github.com/rayw-lab/website/actions/runs/33183113406) @`5faab5f`，门禁 SUCCESS） | 基线（main run 33185635763 @`40709fc`，SUCCESS） | 判定 |
|------|------|------|------|
| `/` | P/A/BP/SEO = 100/100/100/100（3 跑中位） | 100/100/100/100 | 不降 PASS |
| `/home/` | 100/100/100/100 | 100/100/100/100 | 不降 PASS |

样式内联注入 + 懒初始化 → 壳静态段零字节，与 LHCI 全平互证。（car-configurator 页 P 99 vs 100 属门外页面 + 单分噪声，登记不裁决。）`availableWeight===1` 登记分：本段裁决为 fix-forward，全量未 0/0/0，**不产生可登记分**——过门复跑后由实现侧按 `scripts/score-loop.mjs` 单源出数。

## 6. 避坑短节（本轮新增实录）

1. **共享 checkout 跑道抢占（本轮三连发）**：① `--list`（15:37Z，84 例）与全量启跑（15:48Z）之间，/workspace 被父代理切至 board 分支（reflog 15:39:23Z）——启跑收集到对方树的 **81** 例，作废重跑；② 全量中段 16:34Z 起外来 `cyber-city-bgm.spec.ts` 跑 + 自带 preview 双占 ~30 分钟 → 5 项设计秒类假阴性 + 16 项连坐；③ 裁决复跑 17:42Z 起步即撞上外来**全量** e2e（17:36Z 先占），按互斥硬令让行中止。教训：审计全量必须 `git worktree add` 独立树 + 独立 `E2E_PORT`；**启跑前与跑中都要 `ps` 查 chrome 级活动**（真空三查不是一次性）；孤儿 preview 按 **PID** 精确清理，防 `reuseExistingServer:true` 把陈旧 dist 喂给后续任何一方；被双占污染的失败一律「窗口取证 + 独占窗复跑」裁决，禁直接登记也禁直接豁免。
2. **两 PR 各自绿 ≠ 合流绿**：#164/#166 各自门禁全绿，重叠只在合流树运行时暴露；合流树冒烟必须含**交互面 hit-target 实测**（bounding box 相交检查一行即可），纯 diff/文本审不可替代。
3. **docs-only 调研的运行时论断不可采信**：#170 §2「两钮共存风险零」与事实相反；调研引用运行时结论须标注「未实测」。
4. **click 超时场景无 test-failed 截图**：`screenshot:'only-on-failure'` 在 hit-target 重试超时路径下只有 trace——取证帧从 `trace.zip` 的 `resources/*.jpeg` 提取。
5. **PR body 计数是写作时点值**：body「40 type」为 merge #164 前旧账，tip 实为 41——审计一律以 tip 文件实数为准。
6. **main 移动靶处理**：审计中 main 两度推进；delta 纯 docs 时用 `merge-tree --write-tree` 对新 tip 复验 CLEAN + `diff --stat` 证零运行时面，即可免重建集成树重跑全量。

## 7. 裁决与补洞清单（定向 fix-forward，不降门、不扩批）

**裁决：fix-forward。禁天然合并 #166；过 F1–F3 后本审计预授 GO（无需二次全量以外的新门）。**

| # | 补洞项 | 口径 |
|---|--------|------|
| F1 | `.world-minimap-btn` 落位让位：与 `.world-audio-toggle` 命中盒在**一切共同可见态**零相交（建议同排左移 `right:` 让出音效钮宽度 + 间距，或整钮下移一行；触屏 44px 热区与 `aria-keyshortcuts` 保持） | 仅 `Minimap.ts` injectStyles 一处 CSS；禁动 WorldAudio 侧（#164 已合 main，后合者让位） |
| F2 | 回归锁：e2e 增两钮 `boundingBox()` 不相交断言（建议挂 CITY-NAV-02 car_ready 段，两钮同帧可见时取证） | 防复发；一行代价 |
| F3 | 复跑：CITY-AUD-01 + CITY-NAV-01/02/03 定向轮 + 全量 84 例 0/0/0（分母仍以届时 fresh `--list` 为准） | 过门即 GO |

维持项：DP-1/DP-3/文件域/LHCI 均已过门，补洞段**禁触**上述已过门面；poster 无涉，无需重拍。
