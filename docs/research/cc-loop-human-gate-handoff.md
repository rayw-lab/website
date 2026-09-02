| document | cc-loop-human-gate-handoff |
|---|---|
| status | HANDOFF_PACKAGE（R-3-2/R-3-3 · 执行与登记归指挥官，永不代决） |
| date | 2026-09-02 |
| 被审对象 | main@`4ef7ed4`（R-2 后 tip；视觉 76 / 综合 94 / 功能 87 / 性能 —） |

# 真机 handoff 包｜R-3-2 功能 S-2 + R-3-3 性能六腿

## 1. R-3-2 功能 87→90（human-gate S-2 腿）

- **权威单源**：`docs/spec/human-gate-checklist.md`（S-2 腿协议）+ `docs/spec/cyber-city-function-rubric-score.json`（现登记 87；90 档判读归真机）。
- **指挥官执行清单**：① 按 human-gate-checklist §S-2 在真机（含触屏）走指定用例矩阵并录屏；② 回填签署档与证据（录屏 + 截图 + 偏差说明）到 human-gate 约定位置；③ 回填后由 AL 流程按 checklist 判读 87→90 登记幅度。
- **当前代码状态**：R3 窗全量 e2e 86/86 云端侧全绿（功能分云端封顶 87-88 已实测多轮），90 的增量判定面全部在真机腿。

## 2. R-3-3 性能 —→85（真机六腿 → AL-PERF）

- **权威单源**：`docs/spec/cyber-city-perf-rubric.md` §4（六腿协议；P1/P2/P3/P5 判定读数**挡登记**）+ `docs/spec/human-gate-checklist.md` §5.4。
- **指挥官执行清单**：① 真机按 §4.1 六腿逐腿录测（桌面 60fps 锚 + 移动 30fps 锚；含 boost/急转/POI 深链腿）；② 每腿记录 fps.avg/low1 与掉帧段；③ 回填后 AL-PERF 按 rubric 判定并登记性能行。
- **云端侧已备**：CI 证据包（CITY-PERF-01/02 + WS-PERF-01）在档；SwiftShader p95 软门 OBS 读数（283/400ms）仅为软件渲染基线，与真机判定无涉。

## 3. 边界

- 两包的执行、录测、判读、登记全部为**指挥官专属**；自动化/子代理永不代决。
- 本包只交「清单 + 指针 + 回填模板」；不新增任何被测代码。
