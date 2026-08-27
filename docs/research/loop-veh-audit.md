# Cyber City Loop 7 驾驶 FPV 专项独立审计（CC-AL-VEH）

| 项 | 内容 |
|---|---|
| 审计角色 | CC-AL-VEH · GPT-5.6 Sol 独立审计 |
| **审计对象** | **`main@daec44c9bf71d676cdf8a4bf86e776dd86c47ca0` 上 VEH 增量** |
| VEH 实现 | PR [#54](https://github.com/rayw-lab/website/pull/54) · head `6fa22e26895717b23f5a55617d5191e7b43bb6b8` · merge `ad4e6cdfb7b41e4bd3fa428db758a9cd7ad477cf` |
| 审计分支 | `cursor/cc-al-veh-audit-1d6f`（报告提交时基于 `origin/main`） |
| 日期 | 2026-08-27（UTC） |
| 裁决 | **NO-GO（5/7 专项硬门通过；registry 单源与 reduced-motion 硬切两门失败）** |

## 0. 裁决

**NO-GO。** 驾驶双视角本身可用，回归链也通过，但不能把“运行时数值碰巧与规格草案一致”
当作“与 `camera-shots.json` 对齐”：

1. `driving` 态 V 键 `third ↔ fpv` 往返通过；同一用例还覆盖 `robot_idle` 门禁、
   `car_ready` 按 V 不触发驾驶、FPV 持续驾驶、提示文案与零 page error；
2. 审计对象完整 Playwright suite 实跑 **54/54**，`skipped=0`、`unexpected=0`、
   `flaky=0`、全部 `retry=0`，耗时 **34m41.5s**；
3. `ritual_idle` 的门外 `+0`/third 直通成立，VIS-03 通过，VEH merge 前后
   `public/posters/` tree id 完全一致；
4. 没有鼠标/触屏到相机姿态的 free-roam 映射，G5 通过；
5. **阻断项 A：** `src/data/camera-shots.json` 只有 4 个既有 shot，缺少
   `drive_third`、`drive_fpv`；VEH merge 对该文件零改动，而 `View.ts` 仍内联
   `DRIVE_LOOKAHEAD` / `DRIVE_FPV` 并保留“CAM 合流后改读注册表”的 TODO。审计对象中
   CAM 已经合入，规格 §7.2 的降级前提已失效；
6. PR #54 exact CI 的 `/`、`/home/` median LHR 均为
   **100/100/100/100**，与 pre-VEH PR #53 exact CI 相比八项 delta 全 0；
7. **阻断项 B：** reduced-motion 的自动挂载拦截、显式进入、instant transform、V
   往返、lookahead=0、pitch/roll=0 均通过，但 `third→fpv` 切换首个采样帧 FOV
   实测仅 **43.52°**；代码把 42→58 也套入 3s⁻¹ 低通，违反规格 §3 D3“硬切天然
   同形”及 §10“FOV kick 关（恒 58°）”。

父代理不得把本报告登记为 GO。定向补洞应只做两件事：补齐两个 drive shot 并让运行时从
注册表读参；进入 FPV 时立即写基础 FOV 58°，之后只对非 reduced-motion 的 speed kick
做低通。不应借机改 poster、生产视觉分或其他驾驶功能。

## 1. 七项专项硬门

| # | 硬门 | 独立证据 | 判定 |
|---:|---|---|:---:|
| 1 | driving 态 V 键 third↔FPV（VEH-01） | `toggleDriveView` 只绑定 `Keyboard.KeyV` + `categories:['driving']`；View 冗余门仅放行 `car_ready/driving`。exact 全量中的联合旅程在 `driving` 态执行 `fpv→third→fpv→third`，DOM `data-drive-view` 与引擎遥测互证，`retry=0`，单例耗时 409.932s | ✅ |
| 2 | e2e 全 suite 绿 | `daec44c` 本地完整 no-retry 五 project 链：JSON stats 为 `expected=54 / skipped=0 / unexpected=0 / flaky=0`，总耗时 2,081,459ms；VEH 两例及 VIS-03 均在同一结果中。不是旧口径 52/52，而是实际 **54/54** | ✅ |
| 3 | `ritual_idle` 恒等 | V 在 intro filter 下不触发；driveView 初值 third；lookahead 初值全 0 且只在 `gate==='driving'` 时产生非零目标；third 输出仍复制后台第三人称相机。VIS-03 retry 0 通过（566 色、非众数 88.5%）；VEH merge 前后 poster tree 同为 `09a04c0b8ee1e5d6e1a56e856bb9a1ba02d7f9fd` | ✅ |
| 4 | G5 无 free 漫游 | 依赖树无 `camera-controls`；View 明确砍除 free/map controls。唯一新相机输入是离散 V 二态切换；`CameraShots` 是白名单 URL 预设且不注册姿态输入；Pointer 只供 RayCursor/Nipple 交互，未写相机 yaw/pitch | ✅ |
| 5 | `drive_third` / `drive_fpv` 与 `camera-shots.json` 对齐 | 注册表缺少两个 key；`git diff ad4e6cd^1..ad4e6cd -- src/data/camera-shots.json` 为 0。View 的数值虽与规格草案逐值相同，但仍是内联双源，且 TODO 明写 CAM 合流后必须改读 JSON；因此数据单源、键存在性与消费链均未闭合 | **❌** |
| 6 | LHCI `/` + `/home/` 不降 | pre-VEH PR #53 exact CI [33046310295](https://github.com/rayw-lab/website/actions/runs/33046310295) 与 PR #54 exact CI [33046490787](https://github.com/rayw-lab/website/actions/runs/33046490787) 均跑 7 URL ×3、assert PASS；两次 median 的指定两路 P/A/BP/SEO 都是 100/100/100/100，八项 delta 全 0 | ✅ |
| 7 | reduced-motion 路径不受影响 | 行为面通过：拦自动挂载、显式进入、instant swap、V 往返；引擎探针也读到 lookahead `len/steer/offset=0`、FPV pitch/roll=0。**但**切到 FPV 首帧 FOV=43.52°，不是规格要求的硬切 58°；目标虽为 58°，实际仍逐帧低通逼近，故完整门失败 | **❌** |

## 2. 审计对象与当前合同数

本报告选择任务允许的第二种口径：审计 `daec44c` 上 VEH 增量，而不是把随后 OBS #57 /
FXN #56 一并归因给 VEH。

- `ad4e6cd` 第一父提交为 `1f44c909`，VEH merge 增量只涉及 7 个文件：
  实装 note、`e2e/cyber-city.spec.ts`、`index.ts`、`Player.ts`、
  `TransformSystem.ts`、`View.ts`、`Reveal.ts`；
- exact 审计对象的完整 suite 是 **54 tests / 10 files**，本次实际跑完 **54/54**；
- 报告收口时 `origin/main` 已含 OBS #57 + FXN #56，`playwright test --list` 已扩为
  **64 tests / 12 files**。本报告**不宣称 64/64**；这 10 项后续增量不属于所选 VEH
  审计对象，也不应反向改写已取得的 `daec44c` 54/54 证据。

## 3. VEH-01 与相机纪律

### 3.1 状态机

动作注册为 `toggleDriveView`，类别只有 `driving`。View 还检查状态镜像：

```text
gate ∉ {car_ready, driving}  → ignore
third + V                    → fpv
fpv + V                      → third
```

切换只改二态标志并发出 `world-drive-view`；没有位置补间。切回 third 时恢复跟踪与基础
FOV，下一帧继续复制始终在后台更新的 `defaultCamera`。联合 e2e 的行为顺序为：

```text
robot_idle + V → 属性缺席
car_ready + V  → fpv，状态仍 car_ready
W              → driving，视角仍 fpv
V / V / V      → third / fpv / third，状态始终 driving
```

该用例结果为 `passed`、`errors=[]`、`retry=0`；reduced-motion 独立例也以
`fpv→third` 通过，说明切换功能未被静止偏好剥夺，但 DOM 二态断言没有覆盖 FOV
是否硬切，不能据此宣称视觉切换合同通过。

### 3.2 无 free roam

FPV yaw 来自车辆 `forward`，pitch/roll 来自底盘姿态的衰减低通，FOV kick 来自
`focusPointSpeed`；没有 pointer delta 或 wheel 输入。第三人称 lookahead 同样来自车辆
位移方向与舵量，不是用户相机接管。`RayCursor` 的 pointer 射线只做世界物件交互，
`Nipple` 继续使用 `defaultCamera` 投地，不构成 free camera。

## 4. `ritual_idle` 恒等闭合

本门不是用两张持续动画中的 PNG hash 冒充“逐字节恒等”，而按既有 poster 协议用三层
证据闭合：

1. **控制流：** intro filter 不放行 V；driveView 初值 third；TransformSystem 初态把
   gate 置 `robot_idle`，FPV 分支不执行；
2. **数值流：** lookahead 的 `len/steer/offset` 初值均为精确 0，非 driving 帧目标仍为
   0；机位和 lookAt 只增加零向量，最终输出保持原 third 直通；
3. **资产与运行时：** VEH merge 前后 `public/posters/` tree id 完全一致；完整 suite
   中 VIS-03 通过且 `retry=0`。

因此 VEH 增量在未驾驶 ritual 帧没有可见相机贡献，也没有 poster 资产改写。

## 5. 阻断缺口：相机注册表没有 drive shots

规格 §7.2 的状态机很明确：

```text
CAM-C1 未合 → 可临时内联常量 + TODO
CAM-C1 已合 → 追加 drive_* 条目并改为从 camera-shots.json 读参
```

审计对象已包含 CameraShots 集成，但实际注册表 key 仍只有：

```text
ritual_idle
poi_showcase-concept-garage
poi_showcase-autodrive-lab
corridor_neon-boulevard-east
```

与此同时，`View.ts` 中仍存在：

```text
DRIVE_LOOKAHEAD  // TODO(CC-CAM 合流：改读 camera-shots.json drive_third...)
DRIVE_FPV        // TODO(CC-CAM 合流：改读 camera-shots.json drive_fpv...)
```

当前内联值确实与规格冻结值相符（lookahead 4.5m、3–20m/s、6/4s⁻¹、0.45、8m/s；
FPV offset 0.35/0.55/0、FOV 58、kick 6°、姿态 1/0.7/0.35），但 JSON 中不存在可对齐
对象，运行时也没有消费 JSON。只满足“值抄对”，不满足硬门要求的“注册与消费对齐”。

### 5.1 最小补洞验收

1. 以规格 §7.1 字段在 `camera-shots.json` 增加 `drive_third`、`drive_fpv`，保持
   `schemaVersion: 1`，不得改 `ritual_idle`；
2. 删除 View 内联双源与 TODO，运行时从注册表读取两组参数；
3. 增加轻量机器断言，至少验证两个 key、关键字段及 runtime 消费入口存在；
4. 重跑 VEH 两例、VIS-03、NDC probe 与当时完整 suite；确认 poster tree 不变；
5. 不需要重拍 poster，不得顺带调参或引入 free look。

## 6. LHCI

PR #54 exact head 的 CI 对 7 个 URL 各跑 3 次并上传 median LHR。指定两路为：

| URL | Performance | Accessibility | Best Practices | SEO | 相对 pre-VEH |
|---|---:|---:|---:|---:|---:|
| `/` | 100 | 100 | 100 | 100 | 0 / 0 / 0 / 0 |
| `/home/` | 100 | 100 | 100 | 100 | 0 / 0 / 0 / 0 |

公开 median 报告：

- `/`：[Lighthouse report](https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1787812857307-9506.report.html)
- `/home/`：[Lighthouse report](https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1787812857683-25200.report.html)

两路均无下降；该门通过，但不能覆盖 camera registry 的独立失败。

## 7. reduced-motion 与 V5 专项

### 7.1 完整 reduced-motion 运行时取证

fresh reduced-motion 上下文以 `?ritual=1&quality=2#debug` 进入，独立探针顺序为：

```text
自动挂载拦截
→ 显式进入 robot_idle
→ instant transform 到 car_ready
→ V 切 fpv
→ W 进入 driving
```

通过项：`data-drive-view` 往返正常；lookahead 的 `len/steer/offset` 全 0；FPV
`pitch/roll` 全 0；拖动指针不改变相机。失败项是切换瞬间 FOV：

```text
third：42°
按 V 后首个采样帧：43.52°
目标：58°
后续：按 3 s⁻¹ 低通渐近 58°（稳定性采样时仍为 56.04°）
```

根因不需要猜测：`setDriveViewMode('fpv')` 不写基础 FOV；`updateFpv()` 对完整
`58 + kick` 目标执行低通。reduced-motion 只把 kick 置 0，并没有绕过这层低通。
因此“FOV kick 关闭”成立，“FOV 恒 58 / V 硬切同形”不成立。

### 7.2 独立诊断分（只建议，不写生产 JSON）

| 诊断项 | 分数 | 独立依据 |
|---|---:|---|
| **V5 动效 / 镜头转场** | **66/100** | 二态切换响应、yaw 直通、pitch/roll 衰减、lookahead 变化率钳制形成了可用动态骨架；但 base FOV 也被低通，导致“位置/姿态硬切 + 透视缓变”的混合转场，reduced-motion 同样发生，合同与观感均未收口 |
| **驾驶 UX** | **77/100** | V 提示、门禁、往返、FPV 驾驶、复位与无 free-roam 都清楚；独立 FPV 帧方向可读且未见穿模，但道路/反射占据约半帧，规格要求的引擎盖前缘参照不明显，且 FOV 首帧违约削弱即时档差与静止偏好可信度 |

这两个数是 CC-AL-VEH 的诊断量，不替代生产 visual rubric，不写
`visual-score*.json`、score-loop 登记或看板。

### 7.3 V5 最小修复验收

1. `third→fpv` 状态切换时立即设 `camera.fov=58` 并更新投影；
2. reduced-motion 下每帧保持恰好 58，不经过 kick 低通；
3. 非 reduced-motion 仅让 `0..6°` speed kick 分量从 0 低通，不让 42→58 基础档差
   低通；
4. e2e 增加引擎 FOV 断言：V 后首帧 FPV=58、切回 third=42；reduced-motion 两向同断言；
5. 复核挡风/引擎盖下缘参照，若资产允许则满足规格 §6.2 可见性门，但不改
   `ritual_idle`。

## 8. 命令与证据摘要

| 命令 / 证据 | 输出 |
|---|---|
| `git rev-parse daec44c` | `daec44c9bf71d676cdf8a4bf86e776dd86c47ca0` |
| `git diff --stat ad4e6cd^1 ad4e6cd` | 7 files，461 insertions / 6 deletions |
| `git diff --exit-code ad4e6cd^1 ad4e6cd -- public/posters` | exit 0；tree id 前后均 `09a04c…f9fd` |
| `git diff --exit-code ad4e6cd^1 ad4e6cd -- src/data/camera-shots.json` | exit 0；VEH merge 未增加 drive shots |
| `pnpm exec playwright test --list`（`daec44c`） | 54 tests in 10 files |
| `pnpm exec playwright test`（`daec44c`，本地 `retries=0`） | 54 passed；0 skipped / unexpected / flaky；34m41.5s |
| Playwright JSON：VEH 联合旅程 | passed；409.932s；retry 0；errors=[] |
| Playwright JSON：VEH reduced-motion | passed；126.580s；retry 0；errors=[] |
| Playwright JSON：VIS-03 | passed；222.696s；retry 0；566 色 / 非众数 88.5% |
| reduced-motion 外置 runtime probe | 自动挂载拦截、explicit enter、instant swap、V 往返、lookahead=0、pitch/roll=0 PASS；FPV 首帧 FOV `43.52`（目标 58）FAIL |
| `pnpm exec playwright test --list`（报告收口时 `origin/main`） | 64 tests in 12 files（仅列项，不冒充全量通过） |
| pre/post LHCI median LHR 解析 | PR #53 与 PR #54 的 `/`、`/home/` 均 P/A/BP/SEO=`100/100/100/100`，八项 delta=0 |

---

*CC-AL-VEH · 审计分支只提交本报告；零 `src/`、e2e、生产 score JSON、poster、像素基线与
编排看板改动。裁决 NO-GO 由 camera registry 单源与 reduced-motion FPV 硬切两门失败触发。*
