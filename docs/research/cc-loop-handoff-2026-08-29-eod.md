# CC-LOOP 交接档 · 2026-08-29 收工拍（本地编排班）

- **班次**：本地编排（Mac；Composer 2.5 执行/秘书/一轮反核 + Opus 5 medium 复杂件 + 父代理终审合并）
- **收工时刻**：2026-08-29 ~12:10 UTC（20:10 UTC+8），指挥官明示收工
- **main tip**：`211d9d9`（[#192](https://github.com/rayw-lab/website/pull/192) OBS-01 driveTo 闭环稳定化）
- **上一班交接**：`cc-loop-handoff-2026-08-28-stop.md`（云端停机拍）

## 0. 登记矩阵（维持，本班零登记分变动）

| 维度 | 北极星 | 生产登记 |
|------|--------|----------|
| 综合 | 98 | **80** |
| 视觉 | 98 | **73** |
| 功能 | 90 | **87** |
| 性能 | 85 | **—** |

## 1. 本班合入 main（#181–#188、#190–#192，全数 CI 绿 + 终审）

| PR | SHA | 内容 |
|----|-----|------|
| [#181](https://github.com/rayw-lab/website/pull/181) | `a6942bb` | SEC-R8 看板（MERGE-WAVE 14 + 本地 T 索引） |
| [#182](https://github.com/rayw-lab/website/pull/182) | `b7f0c9a` | 董事会 NAV-BGM-MERGE（#166 五门 A-①..⑤ / #177 B 门 / 合流序 #166→#177 / 42 type 真值；r2 修 4×P1：F3 执行链=**本地跑道**与 CI 分立） |
| [#183](https://github.com/rayw-lab/website/pull/183) | `bce8307` | CC-PERF-SPEC 调研（PERF-01/02 恒红=挂点缺席；推荐案 A 改锚 `__worldSpike.fps()`） |
| [#184](https://github.com/rayw-lab/website/pull/184) | `e1d736c` | F3 R1 取证（破门：OBS-03 旧机制 + 8 连坐；NAV 3/3 绿） |
| [#185→draft] | — | PERF 案 A 实现（draft `c43cd72`，验证后置 PERF 窗） |
| [#186](https://github.com/rayw-lab/website/pull/186) | `ed07c0a` | **H2**：OBS-03 dispose 取证改持久侧信道（零 src；验证窗 OBS 7/7 绿后合入） |
| [#187](https://github.com/rayw-lab/website/pull/187) | `0209dbf` | **H1b 处置**：漂移=慢渲染栈债；案 C——本地跑道闭项，#104 串行化保留，1800s 预算仅触发式 |
| [#188](https://github.com/rayw-lab/website/pull/188) | `32fc34a` | SEC-R9-pre 中间收账（MERGE-WAVE 15） |
| [#190](https://github.com/rayw-lab/website/pull/190) | `488eaa8` | F3 R2 取证（破门：workers=2 挤兑致 preview 崩溃连坐 21；归因窗 HINT 5/5 绿） |
| [#191](https://github.com/rayw-lab/website/pull/191) | `4cf419d` | F3 R3 取证（workers=1：70P/1F/11S；**NAV 3/3 绿**；败点=OBS-01 泊车腿） |
| [#192](https://github.com/rayw-lab/website/pull/192) | `211d9d9` | **OBS-01 稳定化**（机制=满油开环控速撞 SpeedTrap 隔板楔死，非帧率；测试侧五改法 + coneHits 硬0→互证式；3/3 绿，**OBS-03 首获在链绿证**） |

另：9 个陈旧 PR（#1/#8/#27/#28/#30/#31/#34/#38/#43）已 CLOSED（分支保留可 reopen）。

## 2. 开放 PR 现状与禁合条件

| PR | tip | 状态 | 合入条件 |
|----|-----|------|---------|
| **#166 NAV-C1** | `b4694cf` | draft | #182 A 门：①②③⑤ ✅；**A-④ e2e 面待 F3 R4**（R1/R2/R3 三破皆非 #166 账：NAV 6/6 全绿两窗）。**R4 = #166⊕main(含 #192) 全量 `--workers=1` 82 例 0/0/0**，绿即 ready→squash |
| **#177 BGM-C1** | `2b00c31` | draft | B 门预核 PASS（零 P0/P1）；#166 先合 → 按 [#189](https://github.com/rayw-lab/website/pull/189) STAGING 剧本解三文件冲突（42 type/10 族/ux 11；test-framework 三行表 81/17→84/18→**86/19**）→ **HG-B2 双用例合流树重跑** → 终审 squash（含 src，急裁授权=#182 B 门） |
| **#189 STAGING** | `6960ea7` | draft 禁合 | 预演树+剧本留痕；#177 合入后关闭 |
| **#185 PERF 案 A** | `c43cd72` | draft | PERF 单跑窗或 #104 窗验证后 ready；先于 #104 开窗合入可清 −2 恒红 |
| **#104 X2** | `bbba5a5` | draft | ready 单门 = 双落后分母 fresh（预期 86−2 或 #185 合入后 86 全量）0/0/0 开窗；H1b ✅ / H2 ✅ / H3=#185 |

## 3. 下一班最短路径

1. **F3 R4**：#166⊕main(≥`211d9d9`) 全量 `--workers=1`（剧本=#191 R3 + 独占核验；预算 ~75 min）→ 82 例 0/0/0 → 三证上链 → ready+squash **#166**（小地图上线）
2. **#177**：merge main 按 #189 剧本解冲突（自检 `rg '39 type|41 type'` 零命中 + `--list` 86/19）→ **HG-B2 双用例合流树重跑** → 终审 squash → 关闭 #189
3. **SEC-R9/R10** 正式收账（#182 D 门字段化）
4. **#185** 验证合入 → **#104 开窗**（84/86 例 0/0/0，含 VIS-01..04 自动帧）→ **AL-VIS 复评**（盘点见 `0aa66379` 交付：4 自动帧+3–4 手拍，l8w1 基线 before；诚实算术 74–75）→ COMP-M0（就绪矩阵见诊断预跑交付）
5. 缩略条 NAV-C1.5（#166 落地后另单）

## 4. 指挥官件（未决，永不代决）

1. **CAM 红线 v2 §8 签字**——决策包已递（会话内一页纸），最小回复三行格式在包尾
2. **真机性能六腿** + **S-2 安卓/序 A·B**——两窗执行卡已递（生产 URL `https://rayw-lab.github.io/website/` 实测 200；数字回传两行格式在卡尾）

## 5. 本班沉淀的跑道纪律（新增/实证）

- **本地 Mac headless 亦慢放档**（fps≈0.96）：#192 推翻「本机高帧率」先验；漂移根因分类须以实测 fps 为准
- **全量窗一律 `--workers=1`**（R2 双 3D 挤兑→preview 崩溃连坐 21 例实证）；开跑前 ps 独占核验（用户桌面 Chrome 常驻属常态，登记勿杀）
- OBS-01 泊车腿曾为掷硬币式 flake（开环控速撞隔板），#192 已闭环化；OBS-06 禁单跑维持
- 隔离端口已用序列：4441/4451/4452/4453/4461/4471/4481——下一窗从 4491 起
- merge-tree 树 ID 引用须带命令原文、统一短 SHA 形态（#182 F6-b 立法）

## 6. 一致性维护

收工前已派 Composer 做 origin↔本地一致性检查（本地 main ff、跑道 worktree 清理、无未推送提交/脏改核验）；结果见其回报。

*本班共 22 单子代理任务（Composer 15 / Opus5m 5 / 反核+预核 2），合入 11 PR，零 src 业务代码由父代理直写。*
