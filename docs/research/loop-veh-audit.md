# Cyber City Loop 7 驾驶 FPV 专项独立审计（CC-AL-VEH）

| 项 | 内容 |
|---|---|
| 审计角色 | CC-AL-VEH · GPT-5.6 Sol 独立审计 |
| **审计对象** | **`main@daec44c9bf71d676cdf8a4bf86e776dd86c47ca0` 上 VEH 增量** |
| VEH 实现 | PR [#54](https://github.com/rayw-lab/website/pull/54) · head `6fa22e26895717b23f5a55617d5191e7b43bb6b8` · merge `ad4e6cdfb7b41e4bd3fa428db758a9cd7ad477cf` |
| 审计分支 | `cursor/cc-al-veh-audit-1d6f`（报告提交时基于 `origin/main`） |
| 日期 | 2026-08-27（UTC） |
| 裁决 | **NO-GO（5/6 专项硬门通过；`camera-shots.json` 单源对齐硬门失败）** |

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
5. **阻断项：** `src/data/camera-shots.json` 只有 4 个既有 shot，缺少
   `drive_third`、`drive_fpv`；VEH merge 对该文件零改动，而 `View.ts` 仍内联
   `DRIVE_LOOKAHEAD` / `DRIVE_FPV` 并保留“CAM 合流后改读注册表”的 TODO。审计对象中
   CAM 已经合入，规格 §7.2 的降级前提已失效；
6. PR #54 exact CI 的 `/`、`/home/` median LHR 均为
   **100/100/100/100**，与 Loop 6 登记基线相比八项 delta 全 0。

父代理不得把本报告登记为 GO。定向补洞只需补齐两个 drive shot 并让运行时从注册表读参，
不应借机改相机参数、poster、视觉分或其他驾驶功能。

## 1. 六项专项硬门

| # | 硬门 | 独立证据 | 判定 |
|---:|---|---|:---:|
| 1 | driving 态 V 键 third↔FPV（VEH-01） | `toggleDriveView` 只绑定 `Keyboard.KeyV` + `categories:['driving']`；View 冗余门仅放行 `car_ready/driving`。exact 全量中的联合旅程在 `driving` 态执行 `fpv→third→fpv→third`，DOM `data-drive-view` 与引擎遥测互证，`retry=0`，单例耗时 409.932s | ✅ |
| 2 | e2e 全 suite 绿 | `daec44c` 本地完整 no-retry 五 project 链：JSON stats 为 `expected=54 / skipped=0 / unexpected=0 / flaky=0`，总耗时 2,081,459ms；VEH 两例及 VIS-03 均在同一结果中。不是旧口径 52/52，而是实际 **54/54** | ✅ |
| 3 | `ritual_idle` 恒等 | V 在 intro filter 下不触发；driveView 初值 third；lookahead 初值全 0 且只在 `gate==='driving'` 时产生非零目标；third 输出仍复制后台第三人称相机。VIS-03 retry 0 通过（566 色、非众数 88.5%）；VEH merge 前后 poster tree 同为 `09a04c0b8ee1e5d6e1a56e856bb9a1ba02d7f9fd` | ✅ |
| 4 | G5 无 free 漫游 | 依赖树无 `camera-controls`；View 明确砍除 free/map controls。唯一新相机输入是离散 V 二态切换；`CameraShots` 是白名单 URL 预设且不注册姿态输入；Pointer 只供 RayCursor/Nipple 交互，未写相机 yaw/pitch | ✅ |
| 5 | `drive_third` / `drive_fpv` 与 `camera-shots.json` 对齐 | 注册表缺少两个 key；`git diff ad4e6cd^1..ad4e6cd -- src/data/camera-shots.json` 为 0。View 的数值虽与规格草案逐值相同，但仍是内联双源，且 TODO 明写 CAM 合流后必须改读 JSON；因此数据单源、键存在性与消费链均未闭合 | **❌** |
| 6 | LHCI 不降 | PR #54 exact CI [33046490787](https://github.com/rayw-lab/website/actions/runs/33046490787) 跑 7 URL ×3、assert PASS；median `/` 与 `/home/` 均 100/100/100/100。Loop 6 pre-VEH 登记基线两路亦全 100，delta 八项全 0 | ✅ |

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
`fpv→third` 通过，说明硬切功能未被静止偏好剥夺。

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

| URL | Performance | Accessibility | Best Practices | SEO | 相对 Loop 6 |
|---|---:|---:|---:|---:|---:|
| `/` | 100 | 100 | 100 | 100 | 0 / 0 / 0 / 0 |
| `/home/` | 100 | 100 | 100 | 100 | 0 / 0 / 0 / 0 |

公开 median 报告：

- `/`：[Lighthouse report](https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1787812857307-9506.report.html)
- `/home/`：[Lighthouse report](https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1787812857683-25200.report.html)

两路均无下降；该门通过，但不能覆盖 camera registry 的独立失败。

## 7. 命令与证据摘要

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
| `pnpm exec playwright test --list`（报告收口时 `origin/main`） | 64 tests in 12 files（仅列项，不冒充全量通过） |
| PR #54 CI | success；7 URL ×3；Lighthouse assertions PASS |

---

*CC-AL-VEH · 审计分支只提交本报告；零 `src/`、e2e、生产 score JSON、poster、像素基线与
编排看板改动。裁决 NO-GO 只由 camera registry 单源硬门失败触发。*
