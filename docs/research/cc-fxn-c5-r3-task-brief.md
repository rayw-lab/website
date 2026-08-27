# CC-FXN-C5-R3 任务书复述（第三次重派）

> 执行模型自报：**claude-fable-5-thinking-xhigh**

| 项 | 内容 |
|----|------|
| Task | **CC-FXN-C5-R3**（实现 Task · 84→90 刀 1 第三次重派） |
| 分支 | `cursor/cc-fxn-c5-r3-1d6f`（base：`main` @ `491f38a`，独立 worktree `/tmp/wt-c5-r3`） |
| 日期 | 2026-08-27 |
| 任务书来源 | `docs/research/cyber-city-fxn-90-path-advisor.md` @ main `491f38a`（§3 开发 1 行 + §6 派单 #1） |

## 1. 目标（复述）

实现两件事，主攻 F6 75→90、F3 75→85、F4 自然发现高段，并给 L7 腿产品面：

1. **G4 目标线 v0**（形态照抄 `cyber-city-gameplay-features.md` §4 冻结稿）：
   - 下一站 chip（未进站 POI 中的推荐目标）+ 距离显示；
   - 目标 POI parkingBay 光柱提亮（静态发光，不占动画循环席位）;
   - **非强制**：可无视、可折叠。
2. **`idle-30s` 消费**（空闲主动引导）：现状 `src/lab/world/index.ts` 只记录 `idle-30s` 埋点、零消费；本单接线一个玩家可感消费形态（下一站提示/光柱脉冲/hint 再现，任一即可）。

## 2. 文件域（复述）

- `src/lab/world/areas/ExploreProgress.ts`（探索进度/目标推荐）
- `src/lab/world/world/Reveal.ts`（hint/chip 宿主——本单拥有 chip/hint 宿主结构改动权）
- `src/lab/world/index.ts`（idle-30s 消费接线）
- `world-pois.json` 扩展段（如需）
- 光柱材质（静态发光）
- `e2e/cyber-city-explore.spec.ts` 扩展
- `docs/spec/cyber-city-observability.md`：新事件白名单**加法**增补（随本 PR 同批）

## 3. 硬门（复述）

1. `robot_idle` poster **逐字节恒等**（chip/光柱不进首幕视锥）；
2. CITY-03 循环配额：光柱静态不占席；
3. 非强制（可无视/可折叠）；
4. **四降级轨声明**：RM（reduced-motion）/ 触屏 / Q2（quality=2）/ KinematicFallback；
5. 新事件入 OBS 白名单（加法，不改秤）；
6. e2e **75+ 不降**且新增断言。

## 4. 禁止清单（复述，advisor §5）

1. 禁自评登记：不触碰登记 JSON 与审计报告（唯一登记出口 = CC-AL-FXN-R3）；
2. 禁扩批：不搭车 G7/G3/G5/G13 等非关键路径项；C6 范围（F2 确认层、G9 测速牌）不进本单；
3. 禁改秤：rubric v1.0 / S-2 v1.0 / S-5 v1.0 恒定；OBS 只做加法；
4. 不动 `Player.ts` 键位表语义（C6 域约束，本单同样遵守）。

## 5. 交付纪律（复述）

- `git worktree add /tmp/wt-c5-r3 origin/main` 独立目录工作；
- 30 分钟内 push 分支；先 push 空分支+本任务书复述，再写代码；
- 返回 PR。
