# Loop 8 功能独立审计（CC-AL-FXN）

> 执行模型自报：**gpt-5.6-sol-xhigh-fast**

| 项 | 审计事实 |
|---|---|
| 审计对象 | `main@66ed0fe`（审计分支 `cursor/cc-al-fxn-audit-1d6f`） |
| 比较基线 | 合流前 `main@b2b8684` |
| 冻结秤 | `docs/spec/cyber-city-function-rubric.md` v1.0 |
| 脚本 | S-2 v1.0 + S-5 v1.0 |
| 环境 | Node `v22.14.0`、pnpm `10.33.3`、Chromium、1440×900 桌面与 375×812 DevTools 触屏模拟；`pnpm install --frozen-lockfile` → `pnpm build` → `pnpm preview --host 0.0.0.0 --port 4337` |
| 清存储 | S-2 首访与各 S-5 主腿在新导航前清理/隔离状态；F6 完成态腿按规格明确预置 11/12，只取“完成反馈”证据，不冒充自然发现 |
| 独立功能分 | **84 / 100**（目标 90） |
| 裁决 | **有条件放行**：功能登记有效，但未过 90；L6 同会话全链、L7 空闲主动引导和 F3/F4 自然发现性须补强 |

## 1. 边界与集成差分

`b2b8684..66ed0fe` 共 34 个文件、`+4697/-359`。业务面集中于：

- C1：`Reveal.ts` 键位卡召回、首驶阅读窗、触屏分文案；
- C3：`PoiArrival.ts`、相机 shot 注册表和进站前奏/中断；
- C4：`ExploreProgress.ts` 探索计数与 goal 族埋点；
- VEH/PERF 随行：drive shot 单源与性能证据用例。

任务书称 C1/C2/C3 已合，但审计 tip 实际还包含 `686f91a` 的 C4。审计不能假装该代码不存在，因此 F6 按实际生产树计入；这是范围事实偏差，不是本审计新增业务改动。

测试面相对基线为 `+1844/-8`：

- 新增 `cyber-city-poi-arrival.spec.ts`、`cyber-city-explore.spec.ts`、`cyber-city-perf.spec.ts`；
- 扩展 `cyber-city.spec.ts`、`cyber-city-feedback.spec.ts`，并对 observability 的异步导航使用 `route.abort('aborted')` 保住取证上下文；
- `playwright.config.ts` 将 car/world/world-perf/city-perf/visual 串成重 3D 独占链，`cyber-city-perf.spec.ts` 从 world 泛匹配中显式排除；当前 `--list` 为 **75 tests / 15 files**。

合理性结论：新增断言与 C1/C3/C4/PERF 交付逐项对应，重 3D project 拆分针对 SwiftShader 资源争用，未见删断言或用软断言替换硬断言。灰盒翻车置位、11/12 预置完成腿只用于确定性状态合同；本报告没有拿它们替代真人脚本评分。

## 2. S-2 v1.0（Pass A）

SwiftShader 的游戏时钟远慢于墙钟。依冻结禁令，以下 `t` 只用于事件排序，不用于 15s/30s/100ms 或帧率判断。

| 脚本段 | 观察 | dump 锚点 | 录屏 |
|---|---|---|---|
| 首幕 | 定位语、机器人、CTA“变形 · 巡航态 Space”和状态行形成明确接力 | `mount #1/t0` → `world-reveal #2/t30558` → `robot-idle #3/t103545` | `s5_reduced_quality_hint_menu_audit_20260827.mp4` `00:00–00:24`（首幕信息面） |
| 变形 | CTA 触发后 disabled；落到 CarConcept 后状态行与键位卡出现 | `transform-start #4/t141265` → `hint-shown #5/t270693` → `world-transform #6/t270693` | 同上 `00:24–00:40`；正常速档事件序由 S-2 dump 互证 |
| 驾驶 60s | W/A/S/D、Shift、V 往返、R 复位均有可见响应；车辆速度/视角改变成立 | `world-drive-start #7/t608839`、`boost-first #8/t612591`、`world-drive-view #9/#10`、`respawn #11/t757158` | `s2_driving_feedback_audit_20260827.mp4` `00:40–01:12` |
| 碰撞 | 道具命中入 HUD/事件；城市自然寻路仍费力 | `cone-hit #14/t1398161 {total:1}` | 同上 `00:40–01:12` |
| POI | 最终进入 AutoDrive Lab 圈并 E 进站，前奏 shot 生效；但自然发现/到达不够顺滑 | `poi-bounding-in #16/t3680416` → `world-poi #17/t3721240` → `shot-apply #18/t3721242` | `s5_deep_link_poi_progress_audit_20260827.mp4` `00:00–01:10`、触屏同路 `s5_touch_poi_marker_entry_audit_20260827.mp4` `00:35–01:03` |

三问逐字记录：

1. 我是谁：**“我是可以变成 CarConcept 巡航车的座舱 AI 机器人。”**
2. 能干什么：**“我能在科技城里驾驶、加速、切视角，寻找并进入代表不同作品分区的大楼。”**
3. 下一步：**“先点‘变形 · 巡航态’或按 Space，再用 WASD 开到光圈，按 E 进站。”**

Pass A 维分：F1 85 / F2 80 / F3 75 / F4 80 / F5 85 / F6 75 / F7 90，合成 **81**。

## 3. S-5 v1.0 七腿

| 腿 | 结果 | dump/状态证据 | 录屏时间码 |
|---|---|---|---|
| L1 深链 | **通过**。`concept-garage` 出生 `(140,-18)` 与 JSON parkingBay 一致，shot 为 `poi_showcase-concept-garage`，圈内进度 1/12 | `deep-link #2/t20386 {poi,shot}` → `poi-bounding-in #4/t103895` → `explore-progress #5/t103900`；交互后 `world-poi #6/t185240` → `shot-apply #7/t185245` | `s5_deep_link_poi_progress_audit_20260827.mp4` `00:00–01:10` |
| L2 失败恢复 | **通过（计时不判）**。翻车倒计时可见，R 一键翻正；独立等待腿出现 `flip-jump`；底盘置于 killElevation 下方后自动回 parkingBay | recovery：`upside-down #6/t172365` → `respawn #7/t317891 {reason:key}`；auto：`upside-down #6/t317350` → `flip-jump #7/t735159`；fall：`respawn #8/t325755 {reason:fall}` | `s5_flip_recovery_debug_audit_20260827.mp4` `00:10–03:20` |
| L3 提示/ESC | **通过**。自动淡出、H 收起/召回、ESC 菜单双出口、Work 落地后浏览器返回均成立 | S-2 `hint-dismissed #12/t906524 {by:timeout}`；Q2-RM `hint-dismissed #8/t144262` → `hint-recall #9/t148797 {via:key}` → `esc-menu-open #10/t158726` | `s5_reduced_quality_hint_menu_audit_20260827.mp4` `01:15–01:46` |
| L4 reduced-motion | **通过**。不自动挂载；显式进入后 reveal/robot-idle 同拍，变形 instant swap，文字状态与驾驶保留 | env `reducedMotion:true`；`world-reveal #2/t38835` → `robot-idle #3/t38842`；`transform-start #4/t85684`、`world-transform #6/t85684`；`world-drive-start #7/t135309` | 同上 `00:00–01:05` |
| L5 触屏 | **通过**。env 为 375×812、`touch:true`；单指摇杆使 ritual 进入 driving；点按画面中 POI 标点产生进站与 shot | touch ritual `world-drive-start #7/t243235`；touch POI `world-poi #6/t178573` → `shot-apply #7/t178574` | `s5_touch_joystick_core_path_audit_20260827.mp4` `00:00–01:07`；`s5_touch_poi_marker_entry_audit_20260827.mp4` `00:35–01:03` |
| L6 `?quality=2` | **部分通过**。同一 Q2 会话已证明 env `quality:2`、instant swap 与驾驶；POI 进站只由另一深链会话证明，未在同一 Q2 会话闭合七步，不能写成通过 | Q2-RM `transform-start #4/t85684` → `world-transform #6/t85684` → `world-drive-start #7/t135309`；`firstPoiIn/Interact` 仍为 null | `s5_reduced_quality_hint_menu_audit_20260827.mp4` `00:24–01:05` |
| L7 空闲 | **未证明主动引导**。停车无输入 60s 后仍无 `idle-30s`；SwiftShader 游戏时钟过慢，不能据墙钟判事件实现失败，但代码/规格事实也表明 C4 未消费 `idle-30s`，没有 attract/“下一站”引导 | 当前 idle dump 末事件仍为 `world-drive-start #7/t243235`；进度 chip 保持 0/12 | 无单独合格录屏；不伪造、不列 skipped |

条件腿均已合流并执行：V 键、`?shot=`、进站前奏；`scripts.legsSkipped = []`。L6/L7 是已执行后的缺口，不能伪装为 skipped。

## 4. Pass B 锚点量表与合议

| 维 | 权重 | Pass B | 锚点裁决 | 证据链 |
|---|:---:|:---:|---|---|
| F1 首幕可懂 | .15 | **85** | 三问全对，CTA/状态/hint 接力完整；云端不能合法证明 0:15 高段计时，止于 85 | `robot-idle #3/t103545`；首幕录屏 `00:00–00:24` |
| F2 操作反馈 | .20 | **85** | 核心输入、碰撞、boost、复位、V、E 有专属确认；F/刹车的确认层未形成同等级证据，且 ≤100ms 不在 SwiftShader 判 | `boost-first #8`、`cone-hit #14`、`respawn #11`、`world-drive-view #9/#10`；S-2 `00:40–01:12` |
| F3 驾驶乐趣 | .15 | **75** | 速度感、双视角、复位成立；自然寻路多次复位，未出现“主动要求继续开”的 90+ 证据 | `world-drive-start #7`、`respawn #11/#13/#15`；S-2 `00:40–01:12` |
| F4 POI 游戏化 | .15 | **85** | 深链、点按/E、前奏、落点均成立；S-2 自然发现与到达仍偏费力，不能给 90 | `deep-link #2`、`poi-bounding-in #4`、`world-poi #6`、`shot-apply #7`；L1 `00:00–01:10` |
| F5 人性化 | .15 | **85** | 失败恢复、提示/出口、RM、触屏均过；L6 同会话核心路径未闭合，按“≥4 腿过、一腿小缺口”锚止于 85 | `upside-down`/`flip-jump`/`respawn{key,fall}`、`hint-recall`、touch `world-drive-start`；L2/L3/L4/L5 录屏 |
| F6 目标/进度 | .10 | **75** | 轻目标可见、可完成、非强制；完成反馈明确，但空闲主动引导缺席 | `explore-progress #6/t48571` → `explore-complete #7/t48575`；`s5_explore_completion_audit_20260827.mp4` `00:00–00:28` |
| F7 可观测完备 | .10 | **95** | 交付涉及族均入 timeline；`dump()`、只读 `#debug`、导出下载、funnel/counters 齐；导出实测 `session-95e4a641.json` schema 1、7 events、dropped 0 | `deep-link #2`、`explore-complete #7`；debug 录屏 `s5_flip_recovery_debug_audit_20260827.mp4` `00:00–03:20` |

Pass B 合成：

`85×.15 + 85×.20 + 75×.15 + 85×.15 + 85×.15 + 75×.10 + 95×.10 = 83.50 → 84`

Pass A 81、Pass B 84，分歧 3（≤10）。无需逐维强制仲裁，按冻结规程直接采用证据更完整的 Pass B：**登记 84**。

## 5. 回归面与禁止清单

### 5.1 回归面

- fresh install：通过（700 packages，锁文件不漂移）。
- production build：通过（19 pages）。
- Playwright inventory：75 tests / 15 files。
- 全量回归：本审计在同 commit 启动；桌面 + mobile 前 23 项全绿后，外部 `SIGINT` 在 CAR-E2E-01 起始处中断，随后按剩余 project 重跑。最终结果见本节收口更新。
- function-smoke：只消费当轮 OBS dump，不用于功能分。

### 5.2 八条硬门

1. 独立审计署名，未采用实现方自评分：**守住**。
2. e2e/smoke 只作回归必要条件，不冒充 84 分：**守住**。
3. C1/C3/C4 新交互均有白名单事件与实测 dump：**守住**。
4. SwiftShader 的 `t`、墙钟与 fps 不作计时/性能裁决：**守住**。
5. 未从视觉分或综合分外推功能分：**守住**。
6. 脚本未自然证明的 L6/L7 不计成功收益：**守住**。
7. rubric/scripts 均保持 v1.0；三个条件项已转正，`legsSkipped` 为空：**守住**。
8. 未填写任何真机预计值：**守住**。

## 6. 裁决与下一轮

**有条件放行，84/100。** 登记可出数，但距离 northStar 90 仍差 6 分；条件不是“代码存在”，而是下列脚本证据闭环：

1. 用单一 `?quality=2` 会话重跑“变形 → 驾驶 → POI 进站”七步，补齐 L6 dump/录屏。
2. 给 `idle-30s` 增加玩家可感消费（下一站提示、目标光柱或 hint 再现），再跑 L7；仅有埋点不构成 F6 主动引导。
3. 加强从出生点到最近 POI 的自然目标指向，减少 S-2 中为找圈而复位/绕行，主攻 F3/F4。
4. 补齐 F 悬挂跳与 Space/B 刹车的同等级可感确认证据；真机复测 F1 0:15、F2 ≤100ms 高段锚。

本审计只新增本报告与 `docs/research/cyber-city-function-rubric-score.json`，`src/`、`e2e/`、配置与规格正文零改动。
