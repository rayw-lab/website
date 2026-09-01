# CC Loop EOD 交接正本｜#104 R2 后置控制纠偏

- **状态**：`ACTIVE_CONTROLLER_CORRECTION / HOLD_DRAFT`
- **时间口径**：2026-09-01 23:40 Asia/Shanghai（15:40 UTC）
- **起始 main**：`8d6efb0ed9c0a523aed1a9523eee46135cc0b405`
- **工程对象**：PR #104 `cursor/cc-vis-x2-facade-r2-1d6f`
- **#104 exact head**：`598764172250f3a0d6e5a29c36aa564dbd44e009`
- **生产矩阵**：`80 / 73 / 87 / —`，不变
- **北极星矩阵**：`98 / 98 / 90 / 85`，不变

> 本文件是当前时间戳最新的 `cc-loop-handoff-*` 交接正本。它不撤销、不改写 #211、#212、#213 或看板历史字节；只纠正 #213 顶部块中已经过期的**运行态与下一动作**。R1/R2 的失败事实、证据 SHA、NO_GO 裁决继续有效。

## 1. Fresh 锚点与当前终裁

当前远端 `main` 已由用户派单时的 `939056d` 依次推进：

1. #212 合入 `ff6d00ea9192094bb34030cc11c9e064c1be53ef`，上链 #104 R2 full-gate NO_GO evidence；
2. #213 合入 `8d6efb0ed9c0a523aed1a9523eee46135cc0b405`，在看板顶部登记 R1/R2 阶段账。

#104 仍为：

- `OPEN`
- `DRAFT`
- GitHub 当前可计算为 mergeable，但**业务门禁不通过**
- exact head 仍为 `598764172250f3a0d6e5a29c36aa564dbd44e009`
- 分支尚未吸收 #212/#213 后的新 main
- 常规 CI 绿只证明 check/build/links/budget/lighthouse，不替代 full E2E

**Controller 终裁：`RESULT_FAIL / NO_GO / HOLD_DRAFT`。禁止转 ready、禁止合入、禁止提分。**

## 2. 正式门禁账

| 轮次 | exact candidate | 正式结果 | 资格 | 裁决 |
|---|---|---|---|---|
| R1 / evidence #211 | `834f1e7e84d1b0e2cd48372f0d556a1c0d5e8ccb` | 76 passed / 2 failed / 8 did not run / 0 flaky / 0 retry | workers=1、retries=0、单 attempt、port 4585、外部 automation=0 | `RESULT_FAIL / NO_GO` |
| R2 / evidence #212 | `598764172250f3a0d6e5a29c36aa564dbd44e009` | 72 passed / 1 failed / 13 did not run / 0 flaky / 0 retry | workers=1、retries=0、单 attempt、port 4587、monitor 1111 samples、外部 automation=0 | `RESULT_FAIL / NO_GO` |

R2 已证明 R1 的两个失败面本轮恢复通过：

- `CITY-VEH-01/02/03/04/06`：PASS；
- `WS-E2E-02`：PASS。

因此不得再沿“统一 mount 卡死”方向猜修。R2 新的唯一破门是：

- 用例：`CITY-OBS-01`；
- leg1 `(20,-8)`：到达；
- leg2 目标 `(28,-28)`：未达；
- 最终采样：`x=1.3, z=-2.1`；
- 页面仍存活，失败页出现“已复位 · 回到最近路口”。

现有 `driveTo` 在无进展后先执行两次倒车脱困，再按 `R` 重生；所以 `(1.3,-2.1)` 是**恢复后终态的高概率解释**，不是已证明的真实撞点。当前只允许把根因写为：

> 路线、自动驾驶测试控制器、POI 触发圈与静态碰撞体之间存在待证明的交互问题。尚未证明是产品几何回归，也尚未证明只需改测试。

## 3. 对 #213 顶部块的运行态纠偏

#213 中以下历史事实继续有效：R1/R2 结果、#211/#212 merge SHA、#104 HOLD_DRAFT、AL-VIS 未启动、分数不变。

以下内容以本交接正本为最新口径：

1. **`SEC-R11 CLOSED` 只表示 R1/R2 失败证据与阶段账已收录，不表示 Cyber City Loop 永久停止。**
2. 用户本轮接班指令已经明确授权继续推进 #104；下一动作是定向根因诊断，不需要再次等待“重启 Loop”口头授权。
3. **当前未授权 R3 full gate**，不是永久禁止 R3。只有定向诊断和补洞门完成，Controller 才能新具名授权 R3。
4. R2 的 13 个 did-not-run 包括 `CITY-PERF-01/02` 与 `VIS-01..04`。因此：
   - `CITY-PERF-02` 必须与 `CITY-OBS-01` 同源路线一起排雷；
   - AL-VIS 仍不启动；
   - 不得用 72 个通过项推定视觉/性能尾段已过门。
5. #213 写入的瞬时磁盘数 `249,958,158,336 bytes` 没有在 #212 正式 receipt 中形成同值单源；#212 receipt 的 postflight available 为 `253,771,276,288 bytes`。**磁盘瞬时值不再作为当前控制裁决依据。**
6. #213 明示“R2 worktree 非强制移除”，与现行整洁离场硬门冲突。当前只证明：tracked PNG 已恢复、工作树 clean、端口 4587 可 bind、相关进程 vacuum=0；**尚未证明 `/private/tmp/x2-104-full-r2` worktree 与任务包已释放。该项登记为 cleanup debt OPEN。**

## 4. 当前唯一合法工程动作

### 4.1 AGY Gemini 3.7 Flash High｜定向取证与最小补洞

先锁定 R2 exact head `598764172250f3a0d6e5a29c36aa564dbd44e009` 还原失败现场；不得把合入 #212/#213 文档后的新 SHA冒充 R2 原候选。

在独立 `/private/tmp/*` worktree 中，仅启动具名诊断窗：

- 新端口，禁止 4321；
- Python socket bind 正证据；
- 无残留 Playwright / Vite / Astro preview；
- `--workers=1 --retries=0`；
- 单 attempt；
- 不直接启动 R3 全量。

临时轨迹必须记录：

- `t`
- `x / z`
- `yaw`
- `speedKmh`
- `targetDist`
- steering / throttle 状态
- no-progress 触发点
- escape 次数
- 两次倒车前后坐标
- `R` 重生前坐标
- respawn 后坐标

至少对比：

1. 现行直接瞄准 parkingBay 中心 `(28,-28)`；
2. 由碰撞体与车辆外接半径计算出的、位于 radius 6 内且远离楼体基座的安全入圈点。

候选点必须由几何计算与轨迹证明得出，禁止凭截图拍脑袋。

### 4.2 Ark GLM-5.3-Flash / DeepSeek｜独立根因复核

复核以下四类原因并给出证据等级：

- 测试路线缺陷；
- `driveTo` 控制器/自救循环缺陷；
- 产品碰撞体或 POI 可达性缺陷；
- 混合原因。

静态计算至少覆盖：

- bridge leg；
- 充电桩碰撞带；
- autodrive-lab 楼体基座；
- 街角道具簇；
- parkingBay radius；
- 车辆最坏外接半径下的 Minkowski clearance。

### 4.3 首选最终 writable domain

- `e2e/cyber-city-observability.spec.ts`
- `e2e/cyber-city-perf.spec.ts`（同源路线时同步）
- 新的根因报告：`docs/research/cc-vis-x2-obs-r2-diagnosis.md`

默认冻结：

- `src/**`
- `public/**`
- poster / visual baseline
- `playwright.config.ts`
- 全局 timeout
- retry / repeat / skip 机制
- parkingBay radius 与业务触发语义

若诊断证明产品碰撞体错误，立即停手并升级任务书；不得以测试绕行掩盖产品缺陷。

## 5. 补洞门与 R3 点火条件

最小修复 exact head 必须依次满足：

1. 根因报告包含失败轨迹、首次失速/碰撞位置、几何余量、补丁前后机制差异；
2. `pnpm install --frozen-lockfile` 成功；
3. `pnpm exec astro check` 成功；
4. `pnpm build` 成功；
5. fresh `pnpm exec playwright test --list`，分母以实数为准；当前正式证据为 86 tests / 19 files；
6. 单 attempt 定向验证：`CITY-OBS-01` 与 `CITY-PERF-02` 均执行并通过，workers=1、retries=0；
7. exact final-head CI 全绿；
8. 吸收 current main 后确认最终 diff 仍严格落在任务书文件域；
9. cleanup debt 闭合：临时 worktree、任务包、端口和进程全部释放并有正证据。

只有上述门全部完成，Controller 才可授权新具名 **R3 full gate**。R3 必须：

- 新端口；
- 单 attempt；
- workers=1；
- retries=0；
- fresh denominator 全执行；
- 0 failed；
- 0 skipped / did-not-run；
- 0 flaky；
- 原始 evidence 先进入独立 docs-only PR；
- evidence 合入 main 后再次同步 #104；
- final-head CI 再次全绿；
- 最后才允许转 ready 与 squash merge。

## 6. 禁止项

- 禁止把 R1 或 R2 重新命名为新轮次；
- 禁止同标签重跑刷绿；
- 禁止提高 timeout 作为修复；
- 禁止 retry、repeat、skip、soft assertion；
- 禁止只跑失败用例直到出现一次 PASS 后直接放行；
- 禁止未取轨迹即移动 X2 几何；
- 禁止修改视觉基线消化失败；
- 禁止转 ready、合流或更新生产矩阵；
- 禁止删除任何 `cursor/cc-loop-audit-*` 分支或历史证据。

## 7. 并发合流事件与控制措施

#213 在 Controller 完成内容审查后、阻断标题生效前，于 `2026-09-01T15:39:35Z` 被另一会话合入。该事件不撤销 #213，但证明：

- 当前 `main` 未启用 GitHub branch protection；
- 同一 GitHub owner 身份无法对自己的 PR 提交 `REQUEST_CHANGES`；
- CI 绿 + docs-only 不能自动等价于 Controller 内容批准。

后续所有 docs-only 收账单除 CI 绿外，必须在 PR Conversation 中出现带 exact head SHA 的 Controller 明示 `APPROVED_FOR_SQUASH`，方可合入。没有该评论即保持开放，不得凭“文档单可直合”自行推断授权。

## 8. 当前交接结论

- 工程 PR：仅 #104，保持 Draft / HOLD；
- 看板账：R1/R2 已收录，但运行态以本最新 handoff 纠偏；
- 下一动作：OBS/PERF 定向归因，不是直接 R3；
- cleanup：仍有 worktree/task package 释放证据欠账；
- AL-VIS：未启动；
- 分数：生产 `80 / 73 / 87 / —`，北极星 `98 / 98 / 90 / 85`；
- CAM 视角旋转、真机六腿、Android S-2 序 A·B：均未触，永不代决。
