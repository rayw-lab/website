# Cyber City 驾驶 UX 三轮重审预备（CC-VEH-R3-PREP）

| 项 | 内容 |
|---|---|
| 预备角色 | CC-VEH-R3-PREP · Fable5 xhigh · doc-only 预备（非审计本体） |
| 预备对象 | `main@7eddd7a`（`7eddd7a` = PR [#81](https://github.com/rayw-lab/website/pull/81) merge，2026-08-27） |
| 上轮裁决 | PR [#67](https://github.com/rayw-lab/website/pull/67) · `docs/research/loop-veh-r2-audit.md` · **NO-GO（6/7）**，唯一阻断 = 硬门 #2 全量 e2e 未全绿 |
| R2 审计 base | `main@bad4f546ef402807c9ed18cdab5337a8830b9b76`（下称 `bad4f54`） |
| 本文交付 | R3 入场清单 + 增量盘点 + 审计范围裁定 + 执行手册；供 CC-AL-VEH-R3 直接开审 |
| 日期 | 2026-08-27（UTC） |

## 0. 摘要

R2 已把两项原始阻断（drive shot 注册表单源、reduced-motion FPV FOV 硬切）销账，
发布门只剩一件事：**当前合同数的完整 suite 全绿**（`retries=0`、`failed=0`、
`skipped=0`）。自 `bad4f54` 以来 main 合入了两组 e2e 修复，正面对应 R2 见到的
全部失败模式：

1. PR [#70](https://github.com/rayw-lab/website/pull/70)（`4c1e37f`）：`CAR-E2E-01/05`
   180s 超时根因修复——`car-chromium` 独占 project + 停展台自转改走 tab 点击产品
   路径。R2 两次全量复跑的越线点即在此（挤兑下 164s / 179s 贴线）；
2. PR [#81](https://github.com/rayw-lab/website/pull/81)（`7eddd7a` 含 `0ffe5d8`、
   `20558d0`）：`CITY-EXP-01` 深链出泊位倒车脱困 + 单腿直驱最近邻 + 预算按共享 VM
   竞争实测放宽（4 路竞争下 ~0.1 m/s 墙钟）。

同期合同数从 R2 的 **67 tests / 12 files** 扩为 **75 tests / 15 files / 7 projects**
（本预备在 `7eddd7a` 实测 `--list`）。**尚无任何 clean 75/75 记录**——取得它就是
R3 的核心工作。另有两笔触及 VEH 面的 src 增量（FXN-C3 shot 遥测、PERF-C2-B1 降档
toast），性质均为加法，但硬门 1/3/4/7 需按 §3 做定向复核，不能照抄 R2 结论。

## 1. 七项硬门 · R2 判定 × 增量影响 × R3 动作

| # | 硬门 | R2 | `bad4f54..7eddd7a` 增量 | R3 所需动作 |
|---:|---|:---:|---|---|
| 1 | driving 态 V 键 third↔FPV | ✅ | FXN-C3 引入 POI 进站前奏「驾驶中断」路径（`PoiArrival` 复用 `RELEASE_ACTIONS`）；V 键绑定与 View 状态门未改 | 定向复跑 `CITY-VEH-01…06` 联合例 + `CITY-PA-02`（驾驶中断后 `data-drive-view` 恢复） |
| 2 | e2e 全 suite 绿 | **❌** | #70/#81 两组修复直指 R2 失败模式；合同数 67→75 | **全量重跑（核心）**：75/75，口径见 §4.3 |
| 3 | `ritual_idle` 恒等 | ✅ | 本预备已静态验证：`public/posters/` tree 两侧同为 `09a04c0b8ee1e5d6e1a56e856bb9a1ba02d7f9fd`；View 增量不触跟踪/lookahead 路径 | 复核 §4.2 恒等命令 + 全量中 `VIS-03` 通过 |
| 4 | G5 无 free 漫游 | ✅ | `CameraShots.ts` 导出 `RELEASE_ACTIONS` / 提取 `resolveShotPose` 供 `PoiArrival` 复用；无新相机输入注册 | 静态复核 `PoiArrival` 消费面（只读换算 + 中断释放，无 pointer/wheel→姿态映射） |
| 5 | drive shots 注册表对齐 | ✅ | `src/data/camera-shots.json` **零 diff**；`View.DRIVE_LOOKAHEAD` / `DRIVE_FPV` 消费链未改 | 定向复跑 `CITY-VEH-07`（注册表合同守卫） |
| 6 | LHCI `/` + `/home/` 不降 | ✅ | 增量 PR 均走 exact CI；驾驶面无新首屏资产 | 以 R3 审计分支 exact CI 的 median LHR 为准，对照 R2 全 100 基线 |
| 7 | reduced-motion 路径 | ✅ | `setDriveViewMode` / `updateFpv` 零改动；B1 降档 toast 为独立 chip 不进驾驶输入链 | 定向复跑 `CITY-VEH-05`（rm 下切入 58°、稳定 58°、切回 42°） |

## 2. `bad4f54 → 7eddd7a` 增量盘点

### 2.1 e2e 修复链（直接销账 R2 失败模式）

R2 两次全量的已见失败全部落在 `CAR-E2E-01` / `CAR-E2E-05` 180s 超时（非 VEH 链）。
根因与修复：

- `car-configurator.spec.ts` 此前留在 `desktop-chromium`，只靠文件内串行挡不住
  跨 project 并发——phase 1 的 `MOB-E2E-03` 还有一次完整 car 3D 挂载
  （SwiftShader），挤兑下 `CAR-E2E-01` 164s / `CAR-E2E-05` 179s 贴 180s 线。
  修复为 `car-chromium` 独占 project（`aeee665` → merge `4c1e37f`），独占后
  挂载单次回落 ~13s；
- 展台自转排队税：停转改走 tab 点击产品路径（`ed6fabb`；canvas 拖拽会触发
  damping 衰减长尾）；
- `CITY-EXP-01`（FXN-C4 新增合同）深链出泊位被 R 自救传送回陷阱：改倒车脱困
  （`0ffe5d8` / `7eddd7a`），动线改单腿直驱最近邻、腿预算按共享 VM 竞争实测
  放宽 360s→600s（`20558d0`）。

### 2.2 project 拓扑（硬门 #2 的执行形态）

`playwright.config.ts` 现为 **7 projects 线性链**，任意时刻至多一个重 3D 上下文：

```text
desktop-chromium + mobile-375
  → car-chromium（独占，car-configurator.spec.ts）
    → world-chromium（world-spike + cyber-city 族，串行）
      → world-perf-chromium（WS-PERF-01）
        → city-perf-chromium（CITY-PERF-01→02，单 worker 按序）
          → visual-chromium（VIS-01…04，殿后）
```

### 2.3 合同数：67 → 75（本预备 `--list` 实测）

新增 8 项全部来自 FXN-C3 / FXN-C4 / PERF-C1：`CITY-PA-01…04`
（`cyber-city-poi-arrival.spec.ts`）、`CITY-EXP-01…02`
（`cyber-city-explore.spec.ts`）、`CITY-PERF-01…02`（`cyber-city-perf.spec.ts`）。
分布：

| project | 数 | project | 数 |
|---|---:|---|---:|
| desktop-chromium | 20 | world-chromium | 38 |
| mobile-375 | 3 | world-perf-chromium | 1 |
| car-chromium | 7 | city-perf-chromium | 2 |
| visual-chromium | 4 | **合计** | **75** |

### 2.4 VEH 面 src 增量（均为加法，R3 定向复核对象）

- `View.ts`（FXN-C3）：新增 `shotId` 遥测、`captureShotPose()` 纯读取、
  `applyShot` 追加可选 `id` 参数。**未触** `setDriveViewMode` / `updateFpv` /
  `DRIVE_LOOKAHEAD` / `DRIVE_FPV`（diff 内 drive 相关仅上下文行）；
- `CameraShots.ts`（FXN-C3）：`RELEASE_ACTIONS` 由私有转导出、提取
  `resolveShotPose()` 换算单源，供 `areas/PoiArrival` 复用；drive 深链早退
  （`?shot=drive_*` 告警拒绝）未改；
- `DriveFeedback.ts`（PERF-C2-B1）：追加第五件独立 chip
  `[data-world-quality]` 降档 toast，不与 respawn toast 共元素，不进驾驶输入链；
- **零 diff**：`src/data/camera-shots.json`、`inputs/Keyboard.ts`、
  `public/posters/`（tree id 两侧均 `09a04c0b…f9fd`，本预备已验）。

## 3. R3 审计范围裁定

1. **报告形态**：R2 写明「重新取得 67/67 后本报告可原地升 GO」，但合同数已变
   （75）且 VEH 面出现新增量，**建议 R3 另立 `docs/research/loop-veh-r3-audit.md`**
   引用 R2 与本预备，而非原地改 R2 判决——保留三轮审计链完整可溯；
2. **核心腿** = 硬门 #2 全量重跑：75/75、`retries=0`、`failed=0`、`skipped=0`。
   失败即 NO-GO，**不得以「失败在非 VEH 链」放行**（R2 先例：「与本补洞无关」
   不能替代全量绿证据）；
3. **定向腿** = 硬门 1/5/7 的三个 VEH 用例（`CITY-VEH-01…06` 联合例、
   `CITY-VEH-05`、`CITY-VEH-07`）+ 硬门 1 新界面 `CITY-PA-02`（驾驶中断）。
   全量已含四例，定向单跑仅用于全量前烟测或失败归因；
4. **静态腿** = 硬门 3/4 按 §4.2 命令复核；硬门 6 以 R3 审计分支 exact CI 为准；
5. **升灯动作**：GO 时方可登记 VEH 诊断 JSON 与二/三轮诊断分（R2 留档：V5 74、
   驾驶 UX 82）；NO-GO 不写任何 score JSON，不冒充 visual/function 生产登记。

## 4. 执行手册

### 4.1 入场校验

```bash
git rev-parse HEAD                      # 期望 7eddd7a…（或其后继，需重跑 §2 盘点）
pnpm install --frozen-lockfile
pnpm exec playwright test --list        # 期望 Total: 75 tests in 15 files
```

### 4.2 静态恒等（硬门 3/4/5 快验）

```bash
git diff --exit-code bad4f54 HEAD -- public/posters          # 期望 exit 0
git rev-parse bad4f54:public/posters HEAD:public/posters      # 期望同为 09a04c0b…f9fd
git diff --stat bad4f54..HEAD -- src/data/camera-shots.json \
  src/lab/world/inputs/Keyboard.ts                            # 期望空输出
git diff bad4f54..HEAD -- src/lab/world/view/View.ts | rg -i "drive|fpv"
                                        # 期望仅注释/上下文行，无解算路径改动
```

### 4.3 全量重跑（硬门 #2 · 核心证据）

```bash
pnpm test:e2e                           # = astro build && playwright test
# 或分步：pnpm build && pnpm exec playwright test
```

证据口径：`test-results/.last-run.json` 为 `status=passed`，JSON stats 满足
`expected=75 / skipped=0 / unexpected=0 / flaky=0`，全部用例 `retry=0`。

**预算与环境纪律（本轮 NO-GO 的最大风险项）：**

- **必须独占 VM**。R2 失败与 `CITY-EXP-01` 预算放宽的根因均为共享 VM 竞争
  （4 路竞争实测 ~0.1 m/s 墙钟、load ~20 时任何 3D 腿都会饿死）。开跑前
  `uptime` 确认负载接近空载，且无其他 playtest / e2e / preview 在跑；
- 运行预算：R1 全量（54 合同）全绿实测 34m41.5s；VEH-C2 exact（65 合同）跑到
  45m 仍有 18 项未跑完。75 合同 + car 独占段 + city-perf 串行段，空载预估
  **60–90m**，超 110m 应先查挤兑而非直接判死；
- `retries` 保持 0（本地默认 `process.env.CI ? 2 : 0`）；禁止用 retry 洗绿。

### 4.4 定向腿（烟测 / 失败归因用）

```bash
pnpm exec playwright test e2e/cyber-city.spec.ts --project=world-chromium \
  --grep 'CITY-VEH-01|CITY-VEH-05|CITY-VEH-07' --no-deps --workers=1
pnpm exec playwright test e2e/cyber-city-poi-arrival.spec.ts \
  --project=world-chromium --grep 'CITY-PA-02' --no-deps --workers=1
```

### 4.5 收口

- GO：R3 报告落 `docs/research/loop-veh-r3-audit.md` + VEH 诊断 JSON 登记 +
  看板 VEH 轨升灯；R2 报告不改判决正文，仅由 R3 引用销账；
- NO-GO：报告写明失败例、归因（真回归 vs 环境挤兑）与下一轮定向修复面；
  照例不写 score JSON。

## 5. 纪律红线（沿用 R1/R2）

1. 审计分支 doc-only：零 `src/`、e2e、poster、像素基线、生产 score 改动；
2. 不借机调参：`drive_fpv.status` 仍为 `proposal`，转正走资产级机位验收，
   与 R3 无关；
3. 触屏 FPV 为 spec D5 的 V1 明示非目标，不得以此判失败；
4. 全量绿是硬门，失败链归属只影响「下一步修谁」，不影响本轮判决。

## 6. 本预备已验 / 未验清单

| 项 | 状态 | 依据 |
|---|:---:|---|
| `--list` = 75 tests / 15 files | ✅ 已验 | `7eddd7a` worktree 实测（§2.3） |
| poster tree 恒等 | ✅ 已验 | `git diff --exit-code` exit 0；tree id 两侧 `09a04c0b…f9fd` |
| `camera-shots.json` / `Keyboard.ts` 零 diff | ✅ 已验 | `git diff --stat` 空输出 |
| View/CameraShots/DriveFeedback 增量为加法 | ✅ 已验 | §2.4 逐 diff 复核 |
| 7 projects 线性链拓扑 | ✅ 已验 | `playwright.config.ts` diff（§2.2） |
| **全量 75/75** | **❌ 未验** | 预备期本 VM 负载 ~20（FXN-R2 playtest 在途），任何 e2e 实跑均为竞争噪声；此即 R3 核心腿 |
| `CAR-E2E-01/05` 修复后单跑 | ❌ 未验 | 同上；#70 合流时留有独占后挂载 ~13s 实测 |

---

*CC-VEH-R3-PREP · doc-only 预备分支；零 `src/`、e2e、生产 score、poster 与像素
基线改动。R3 开审入口：§4.1 入场校验 → §4.3 全量重跑。*
