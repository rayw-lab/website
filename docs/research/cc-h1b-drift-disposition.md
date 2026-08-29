# CC-H1B-DRIFT-DISPOSITION · H1b 漂移型处置调研（EXP-01 / QST-02）

- **执行**：H1b 处置调研（docs-only；禁 chrome，归因窗占用）
- **纪律**：零 `src/`/`e2e/` 改动；证据数字不美化
- **取证窗**：2026-08-29；fresh 锚 = main@`e1d736c`（含 #184）· #179 审计 `cc-loop-audit-aud-c1.md` · F3 `cc-nav-c1-f3-evidence.md` · #104 tip `bbba5a5`
- **上游定谳**：[#179](https://github.com/rayw-lab/website/pull/179) AUD R3 §6 条件⑤——**漂移型 2** = `CITY-EXP-01` / `CITY-QST-02`（云 VM 串行仍挂）→ H1b 定向补洞挂 #104 ready 链

---

## 1. 问题陈述

| 项 | #179 云 VM 定谳 | F3 本地 Mac 新事实 |
|---|---|---|
| 归因 | 漂移型 2：串行 `workers=1` 仍挂，跨窗同配置异果 | 同集成树口径全量跑，**两腿均 pass** |
| EXP-01 | W2' ✘ 544s，`途径点 (36,-12) 应可达（实测 x=35.2 z=-19.0）` | ✓ **9.1m**（`nav-f3-full.log` L50） |
| QST-02 | W2' ✘ 1392s，`driving 空闲 30 设计秒应打 idle-nudge` | ✓ **9.7m**（`nav-f3-full.log` L52） |
| 对照窗 | R2 W2 同 VM 曾串行 ✓（EXP-01 18.1m / QST-02 19.3m） | Darwin arm64 · `E2E_PORT=4441` · **workers=2**（main 原配） |

**核心矛盾**：#179 将 H1b 定性为「SwiftShader 时序漂移、串行化不能归零」；F3 在**未应用 #104 H1b 补洞**（预算 1800s / EXP-01 改线）的前提下，本地跑道已绿。需裁定 H1b 是继续 #104 栈内补洞，还是随跑道口径切换登记消解。

---

## 2. 云 VM 漂移 vs 本地过——证据链

### 2.1 渲染栈差异（SwiftShader vs Mac Metal）

| 证据 | 云 VM（#179 / R2） | 本地 Mac（F3） |
|---|---|---|
| GPU | Chromium `--enable-unsafe-swiftshader` 软渲染（`playwright.config.ts` L47） | Apple Silicon **Metal** 硬件加速（F3 §1：`arm64` Darwin 25.6） |
| 驾驶态帧率 | A/B 探针（#104 triage）：main **0.78fps** / X2 **0.70fps**（`bbba5a5` 提交说明） | 未单测 fps；墙钟 **~2.0–2.1× 快**（见 §2.2） |
| load | R1 双 worker 时 load **~7.4–7.8**（双 SwiftShader GPU 进程各 ~190% CPU） | F3 独占窗，未登记高 load |
| workers | W2' 串行 `workers=1` 仍挂 H1b 两腿 | F3 全量 **`workers=2`** 仍绿——**排除「仅 workers 差异」单因** |

**推论**：同一 spec + 同 main 配置下，云 VM SwiftShader 与本地 Metal 构成**一级环境分叉**；F3 证明 H1b 失败不是 spec 逻辑恒红，而是**慢渲染环境下的时序/物理步长敏感**。

### 2.2 墙钟 vs 设计秒（时间预算链）

**QST-02 机制**（`e2e/cyber-city-explore.spec.ts` L656–669）：

- 断言 = `pollDump` 等待 `idle-nudge` 事件，轮询预算 **1_200_000ms**（main）
- 前置条件 = driving 撒手后累积 **30 设计秒**（游戏内 `maxDelta` 限频，非墙钟 30s）
- #104 triage 实测公式：`设计秒累积率 ≈ fps × maxDelta(1/30)` → 0.7fps 下 30 设计秒 ≈ **1288s 墙钟**（#104 `62f4098` 注释）

| 环境 | QST-02 墙钟 | 轮询预算余量 |
|---|---|---|
| 云 VM W2' ✘ | 1392s（超时） | 1200s 预算 **不足**（#104 注释：main 余量仅 46s = 掷硬币） |
| 云 VM R2 W2 ✓ | 19.3m ≈ 1158s | 同预算下**偶发过线**（漂移实证） |
| 本地 F3 ✓ | 9.7m ≈ 582s | 充裕（Metal 高 fps → 设计秒快速积满） |

**EXP-01 机制**（同文件 L347–354）：

- 多段 `driveTo` 途径点 + `timeoutMs` 封顶（legB 300s / legC 480s 等）
- 失败签名 = 途径点 **差 0.3–1.8 世界单位**未进圈（#179 W2'：`x=35.2 z=-19.0` vs 目标 `(36,-12)`）

| 环境 | EXP-01 墙钟 | 失败模式 |
|---|---|---|
| 云 VM W1/W2' ✘ | 544–665s | 低速下转向/贴壁**物理步长粗**，卡桩带/桥腿域 |
| 云 VM R2 W2 ✓ | 18.1m | 同配置偶发绿 |
| 本地 F3 ✓ | 9.1m | 高帧率下途径点驾驶在预算内完成 |

**推论**：H1b 两腿共享根因——**SwiftShader 低 fps 使「设计秒驱动断言」与「驾驶物理步长」同时恶化**；串行化（`workers:1`）只消除挤兑加重因子（#179 §6 挤兑型 3 已另账），**不能消除渲染栈速度差**。

### 2.3 #104 分支对两腿的改动（`origin/cursor/cc-vis-x2-facade-r2-1d6f`）

| 改动 | 文件 | 性质 |
|---|---|---|
| `workers: 2→1` + `world-chromium.fullyParallel: false` | `playwright.config.ts` | **挤兑型**（#179 条件⑤ 第一类），非 H1b 漂移本体 |
| QST-02 轮询 **1200s→1800s**，总超时 **2100s→2700s** | `cyber-city-explore.spec.ts` | **H1b 预算补洞**（按 0.7fps 探针标定） |
| EXP-01 ③ 驶出点改南向；EXP-02 插入 `(-20,-32.5)` 绕行；注释桥位随 PLUG 南移 | 同文件 | **几何随行 + 走廊让位**（#104 X2 桥位 `z−26→−19.5` 后必需；main 树 F3 未含此几何） |

**分界**：#104 栈内改动**混合两类债**——workers 串行化解决挤兑；QST 预算 / EXP 改线针对 SwiftShader 慢环境。F3 在 **main 几何 + main 预算** 下已绿，说明对 **Metal 本地跑道 H1b 补洞非必要**；#104 集成树开窗时 EXP 改线可能因几何变化**仍属必需**（与 H1b 登记解耦）。

---

## 3. 处置三选一

### A · 跑道口径切换（登记消解 H1b）

- **做法**：#104 ready 门 e2e 面沿用 #182 先例——**本地跑道全量**（构建面仍 CI 五门）；H1b 记「F3 本地 82 例账内 EXP-01/QST-02 已绿 → **情报账闭项**」，不另开 H1b IMPL 段、不改 main spec。
- **优点**：与 #182 A-3/F3 证据一致；避免为云 VM 慢路径永久膨胀预算；零额外墙钟。
- **风险**：云 VM 回归盲区保留（记情报账，非 ready 门）；#104 几何改线仍需在集成树验证（非 H1b 问题）。

### B · 仍按 #179 在 #104 栈内串行化/预算补洞

- **做法**：合入 #104 全部 e2e 改动（workers:1 + QST 1800s + EXP 改线），以云 VM 可过为目标再开窗。
- **优点**：单轨 spec，任何环境理论可跑；与 #179 原 H1b 工单字面一致。
- **风险**：F3 已证本地 main 无需 H1b 补丁即绿——**过度标定**（1800s 轮询在 Metal 上零收益）；云 VM 开窗仍可能因 OBS-03 等它项破门，H1b 补丁不保证整窗 0/0/0。

### C · 混合（推荐）

- **做法**：
  1. **登记**：H1b 在 **本地跑道口径**下记 **已消解**（F3 双例 pass + #182 先例延伸）；云 VM 漂移记**情报账**（不阻塞 ready）。
  2. **#104 栈保留**：`workers:1` + `fullyParallel:false`（挤兑类，全环境收益）；**几何随行 EXP 改线**（#104 PLUG 域必需）。
  3. **条件触发**：#104 本地集成树开窗若 EXP-01/QST-02 **仍红**，再启用 QST **1800s** 预算补洞（#104 `62f4098` 已备）；否则不主动合入纯预算放宽。
- **优点**：尊重 F3 新事实，不推翻 #179 云 VM 情报；#104 改动按「必需 vs 兜底」分层，避免无谓 diff。
- **风险**：需开窗时明确记录「本地 Metal / 集成树 SHA」，防口径漂移。

---

## 4. 推荐

**推荐案 C（混合）**：H1b 随 **本地跑道 + F3 实证** 登记闭项；#104 保留挤兑修复与几何改线，**QST/EXP 预算补洞降为开窗条件触发**，而非 ready 前置硬改。

一句话：**漂移是云 VM SwiftShader 特有债，本地跑道已绿则 H1b 不必再为慢 VM 扩预算，但 #104 串行化与几何改线仍保留。**

---

## 5. #104 开窗 checklist 增量（建议插入 §5 表第 4 项后）

| # | 项 | 口径 |
|---|---|---|
| **4a** | **H1b 漂移口径（#179 → 本单）** | ready 门 e2e **在本地跑道执行**（#182 A-3 延伸）；**不以云 VM SwiftShader 全量作为 H1b 过门依据**。开窗前登记：集成树 SHA + `Darwin/arm64` 或 Metal 环境指纹。F3 先例：main 配置 `workers=2` 下 EXP-01/QST-02 仍 pass → **禁止为 H1b 预合 QST 1800s 预算补丁**；若本地集成树跑红该两腿，再启用 #104 栈 `62f4098`/`4946ae7` 预算补洞并单登记 |

---

## 6. 关联

| 文档 / PR | 关系 |
|---|---|
| [#179](https://github.com/rayw-lab/website/pull/179) `cc-loop-audit-aud-c1.md` §6⑤ · §8 W2' | H1b 源定谳 |
| [#182](https://github.com/rayw-lab/website/pull/182) A-3 | 本地跑道 e2e 先例 |
| `cc-nav-c1-f3-evidence.md` | F3 本地全量；EXP-01 9.1m / QST-02 9.7m |
| [#104](https://github.com/rayw-lab/website/pull/104) `bbba5a5` | workers/预算/改线候选 |
| `cc-loop-104-ready-preclear.md` §5 | 开窗 checklist 母表 |

---

*CC-H1B-DRIFT-DISPOSITION · 2026-08-29 — docs-only 调研正本；实现/开窗由父代理按 §4 推荐执行。*
