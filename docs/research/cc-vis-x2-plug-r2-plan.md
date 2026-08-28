# CC-VIS-X2-PLUG-R2 · 零跑道首批：N2/N3 双清 + rebase 预案 + 归档索引

model slug: `claude-fable-5-thinking-xhigh`。董事会 R1（#143）终裁重派件。
纪律执行情况：零 playwright/chrome/fps-probe；零 ready 翻转（#104/#134 维持 draft）；
独立 worktree（预演 `/tmp/r2-wt-sim` 分离 HEAD、交付 `/tmp/r2-wt`）；ENV run3 在飞全程零重载
（run3 日志 `/tmp/env-exp01-run3.log` 06:24 UTC 起飞、取证时无结果行，本单只读未触碰）。

## 1. N2/N3 双清（世系双向核对，2026-08-28 06:3x UTC fresh 取证）

### 1.1 结论表

| 检查项 | 登记口径 | 实测（git cat-file / merge-base） | 判定 |
|--------|----------|-----------------------------------|------|
| N2：#134 tip | `e03271f` | **实际 head = `4a7edd9`**；`e03271f` 是 `4a7edd9` 的祖先，登记 tip 已滞后 **2 个提交**（`d4bcf66` QST-02 idle 预算 1200s→1800s 重标定 + `4a7edd9` triage 报告 r2 勘误，均为补洞验证期追加） | 栈未断，**登记需刷新** |
| N3：#104 tip 与栈基 | `c24c7f3` | #104 head = `c24c7f3` 一致；且 `c24c7f3` 是 `e03271f` 与 `4a7edd9` 的祖先——#134 栈①（base=c24c7f3，见 #134 标题登记）**完整成立**，无漂移 | ✅ 双清 |
| #104 栈基 vs main | base=main | merge-base(`origin/main`, `c24c7f3`) = `88097f9` = 当前 main tip——#104 目前**直接坐在 main tip 上** | ✅ |

### 1.2 世系图（实测）

```
main 88097f9 (#101 X1B voice-pod)
  └─ #104 cursor/cc-vis-x2-facade-r2-1d6f：7 提交 → c24c7f3
       └─ #134 cursor/cc-vis-x2-plug-5b71：8 提交
            8e441ef → 8507aa3 → 839b6fe → 368b4d4 → 2c1d4ab → e03271f(旧登记 tip) → d4bcf66 → 4a7edd9(实际 tip)
main 侧待合：#129 cursor/cc-fxn-exp01-env-5b71 → 5e41550（EXP-01 改线 + BL1 减深，ENV canonical 源）
```

### 1.3 文件域交集（冲突面先验）

| 交集 | 文件 | 含义 |
|------|------|------|
| #129 ∩ #104 | **空** | #104 rebase 到 post-#129 main 预期零冲突 |
| #129 ∩ #134 | `e2e/cyber-city-explore.spec.ts` | **唯一冲突面**：EXP-01 腿②区（两单各自改线同一走廊） |
| #104 ∩ #134 | 4 文件（ForegroundFraming/StreetProps/facade README/audit 探针） | 栈内线性历史，非 rebase 冲突源 |

（#129 的 `src/lab/world/city/HeroBlenderMesh.ts` BL1 减深与 #104/#134 的 src 域零交集。）

## 2. Rebase 预案：#134→#104→post-#129 main（EXP-01 区取 ENV canonical）

### 2.1 预演实录（分离 HEAD，本地 sim SHA 未推送、仅为可复算指纹）

| 步骤 | 操作 | 结果 |
|------|------|------|
| ① 模拟 post-#129 main | `origin/main(88097f9)` squash-merge `5e41550` → SIM_MAIN `6f1dd18` | 干净合入（真实合并 SHA 会不同，树级冲突面等价） |
| ② rebase #104 | `git rebase --onto SIM_MAIN origin/main c24c7f3` | **7/7 零冲突** → SIM_104 `e69d3ea` |
| ③ rebase #134 | `git rebase --onto SIM_104 c24c7f3 4a7edd9` | 8 提交中 **2 停（5 个冲突块）**，全部位于 `e2e/cyber-city-explore.spec.ts` EXP-01 腿②区；按 §2.2 解法通过 → SIM_134 `f6f1149` |

### 2.2 冲突面明细与逐块解法（执行单直接照抄）

| 停点 | 冲突块 | ENV 侧（HEAD） | #134 侧 | 解法 |
|------|--------|----------------|---------|------|
| `8e441ef`（triage r1 改线） | ① `test.setTimeout` | 3_000_000（三腿 360+480+360s 口径） | 2_700_000 | **取 ENV** |
| 同上 | ② 腿②注释块 | 霓虹大街改线论证（WP-A/WP-B + BL1 桩带/隔离墩边距） | 桥腿南侧绕行带论证 | **取 ENV** |
| 同上 | ③ 腿②途径点代码 | `(26,-8)` r6/360s + `(-26,-8)` r6/480s + 末腿 360s | `(19,-33)`/`(-19,-30)` r3 + 末腿 300s | **取 ENV** |
| `839b6fe`（东西大道归因修正） | ④ 腿②注释块 | 同上 ENV 版 | 东西大道 W1(25.5,-10)/W2(-24,-8) 版 | **取 ENV** |
| 同上 | ⑤ 腿②途径点代码 | 同上 ENV 版 | `(25.5,-10)`/`(-24,-8)` r3 | **取 ENV** |

解法机械口径：两个停点均**整块取 HEAD（ENV canonical）**，其余自动合并部分不动，
`git add e2e/cyber-city-explore.spec.ts && git rebase --continue`。
语义依据：#134 的 `839b6fe` 与 ENV 改线是**同一思路的先后两版**（都是弃 z∈[-24,-28] 走廊、
改走大道），ENV 版是 T11 #124/T12 #126 判读 B 兑现的加固终版（途径点半径 6、预算实测化）——
取 ENV 后 #134 腿②旧线自然溶解，非语义丢失。

### 2.3 收编后 #134 残留载荷（SIM_134 vs SIM_104 diffstat，10 文件 +420/−39）

全部与 EXP-01 腿②正交，无一丢失：

- **src 面**：桥位 z −26→**−19.5** + 东北簇内退 (17.8,−17.8)（`2c1d4ab`，ForegroundFraming/StreetProps）；
- **e2e 面**：腿③去重出圈点东向→南向 (−28,−42)；EXP-04 南绕行途径点 (−20,−32.5)；
  QST-02 idle 预算 1_200_000→**1_800_000** + setTimeout 2_100_000→2_700_000（`d4bcf66` A/B 探针实测标定）；
  observability/perf spec 配套；`playwright.config.ts` 全局 workers 2→**1**（`368b4d4`）；
- **docs/工具面**：triage r1/r2 报告、plug 补洞报告、facade README、audit-x2 探针增强。

### 2.4 终树验证（sim 内完成，零跑道）

- 冲突标记零残留（`rg '<<<<<<<|>>>>>>>'` 全空）；
- EXP-01 腿②终态 = ENV canonical：`setTimeout(3_000_000)` + `(26,-8)`/`(-26,-8)` 途径点在位；
- `ForegroundFraming.ts` BRIDGE `z=-19.5` 在位（#134 桥位南移未被覆写）。

### 2.5 执行时点与顺序（严格遵 #143 禁合项）

1. **前置门**：#129 双✓ + 签字后合 main（本预案假定 squash 合入；合并树与 SIM_MAIN 等价）。
2. `git rebase --onto origin/main <旧 merge-base 88097f9> cursor/cc-vis-x2-facade-r2-1d6f`（预期零冲突，7/7）→ force-with-lease 推 #104 分支。
3. `git rebase --onto <新 #104 head> c24c7f3 cursor/cc-vis-x2-plug-5b71`，两停点按 §2.2 取 ENV → force-with-lease 推 #134 分支（GitHub 栈基随 #104 分支引用自动跟随）。
4. rebase 后 #104/#134 **仍维持 draft**，段末审计（全量 e2e 52/52 + LHCI + 视觉双评）过门才 ready——本单与执行单均无权翻转。

### 2.6 执行时复核项（本单禁跑探针，登记给段末审计）

| # | 项 | 口径 |
|---|-----|------|
| R1 | ENV 腿②注释中「X2 桥腿 (±15.7,−26) 距线 18m」在桥位南移后失真 | 实际桥腿 z=−19.5 → 距大街线 z=−8 为 **11.5m**，仍远超 2.5m 净距纪律——**安全但注释过时**，执行时可顺手改注释（≤10 行白名单）或留给审计 |
| R2 | 隔离墩 (±17.2,−13.6) 距线 5.6m 成为腿②约束主导 | 数值未变，仅确认无新增道具入带（东北簇内退后 x≤20.8 → 17.8，更远离） |
| R3 | 全量 e2e 52/52 必须在合流树上重跑 | rebase 干净 ≠ 语义冒烟；QST-02 1800s 预算与 workers=1 的墙钟影响一并观测 |

## 3. 归档维护（/tmp/evidence-exp01/）

- 根级索引 README **原缺，已补建** `/tmp/evidence-exp01/README.md`：10 条目全索引
  （run1/run2 诊断趟、main/x2 test-results、plug-verify-round、capture-chain 8 帧、
  probe 缴械件 062446、四会话 pane 快照），总体积 ~354MB。
- 索引内已登记 run3 待办：收轮后由 **ENV 本人**将 `/tmp/env-exp01-run3.log` + 报告归档为
  `run3-diagnostic/`（#143 归档先行规程），他角禁代归档。
- `run1-diagnostic/README.txt`（test-results 误删经过）保留原样未动。

## 4. 登记矩阵四行

北极星 **98 / 98 / 90 / 85** vs 生产登记 **80 / 73 / 84 / —**（综合/视觉/功能/性能；
视觉 73 = 看板单源终裁口径）。性能未登记显式 **—**，解锁条件 = 真机 human-gate 六腿 → AL-PERF。
