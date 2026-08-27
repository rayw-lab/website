# Cyber City Loop 7 变形粒子专项独立审计（CC-AL-TRANS-FX）

| 项 | 内容 |
|---|---|
| 审计角色 | CC-AL-TRANS-FX · GPT-5.6 Sol 独立审计 |
| **审计对象** | **`main@daec44c9bf71d676cdf8a4bf86e776dd86c47ca0`** |
| 粒子实现 | PR [#52](https://github.com/rayw-lab/website/pull/52) · head `dc1740d2532b59b94e92864032ad428a3fa39301` · merge `f672d647bf1d88c37432e5811cdc5e2c58477568` |
| 审计分支 | `cursor/cc-al-trans-fx-audit-1d6f` |
| 日期 | 2026-08-27（UTC） |
| V5 专项建议 | **74/100**（生产登记 70 → 建议 74；只建议，不改 score JSON） |
| 全视觉向量建议 | `65 / 74 / 69 / 72 / 74 / 73 / 75`，raw **71.10 → 71/100** |
| 裁决 | **GO（七项指定硬门全部通过；规格漂移列为非阻断债）** |

## 0. 裁决

**GO。** 审计对象固定为
`daec44c9bf71d676cdf8a4bf86e776dd86c47ca0`，不是后续 `main`：

1. 120 Hz 受控 Ticker 的状态机时间戳为
   `0 → 0.3583 → 0.6083 → 0.7667 → 0.9083 → 1.0583s`，
   `transforming → car_ready` 落在 1.0–1.2s 门内；
2. reduced-motion 的 `CITY-E2E-04` 通过；fresh runtime 的 instant swap 为 **0.8ms**，
   前后均无 particle handle/mesh；
3. phase-locked swap 帧 `setParticles(1|0)` A/B 的近白占比分别为 **1.3033% /
   1.2006%**，增量 **+0.1027pp**，同时通过 `≤1.9%` 与 `≤+0.5pp`；
4. PR #52 exact test tree 为 **52/52**；审计对象因随后合入 VEH 用例，实际合同已扩为
   **54/54**，不能把它误写成仍只有 52 项；
5. PR merge 前后 `public/posters/` tree id 完全一致，VIS-03 通过；fresh runtime
   `robot_idle` 中粒子 mesh `visible=false`、贡献 0 draw call；
6. CITY-03 已有“变形窗粒子层 = 瞬态 0 席”书面登记，台账保持 3/3；
7. 三段粒子能在充能、光幕、落地三拍中辨认，且与原四拍同钟，支持 V5 从 70 提到
   **74**。没有真实表面解构/聚形，也没有独立 swap 裂解冲击，因此不支持更高分。

本分支只提交本报告，不修改 `src/`、e2e、poster、生产 score JSON 或编排看板。

## 1. 七项硬门

| # | 硬门 | 独立证据 | 判定 |
|---:|---|---|:---:|
| 1 | 四拍 1.0–1.2s 不变 | 外置探针暂停 Game 后以 `1/120s` 步进同一 Ticker，记录 `stateChange`、`hotSwap`、`completeRun`；终点 `1.058333s`。PR #52 相对第一父提交只把 `RING_IN/VEIL_IN/VEIL_OUT/RING_RADIUS` 改为 export，数值 `0.35/0.25/0.30/4` 未变，`DROP=0.45` 未变 | ✅ |
| 2 | reduced-motion instant swap，零粒子 | `CITY-E2E-04` 通过；fresh runtime 变形调用耗时 `0.8ms`，状态 `transforming → car_ready`，前后 `handleExists=false`、`meshExists=false`；构造式 `this.reducedMotion ? null : new TransformParticles(...)` 与运行时相符 | ✅ |
| 3 | 变形帧不白爆 | phase-locked 五关键拍 A/B 中，swap 帧 on `7854/602640 = 1.3033%`、off `7235/602640 = 1.2006%`、Δ `+0.1027pp`；五拍最高增量为 charge 的 `+0.2670pp`。on 峰值 `<1.9%` 且增量峰值 `<+0.5pp` | ✅ |
| 4 | e2e 52/52 | PR #52 exact merge `f672d64`：`playwright test --list` 为 52 tests / 10 files，完整日志为 `52 passed (28.5m)`、exit 0；审计对象 `daec44c` 的 no-retry 全量回归因 VEH 合入扩为 **54 passed (34.7m)**、exit 0，指定原 52 项仍在其超集中 | ✅ |
| 5 | `robot_idle` 逐字节恒等 / VIS-03 | `public/posters/` 在 `f672d64^1..f672d64` 的 tree id 均为 `09a04c0b8ee1e5d6e1a56e856bb9a1ba02d7f9fd`；VIS-03 通过；runtime 初态为 `robot_idle`、mesh 存在但 `visible=false`、particle draw-call contribution=0 | ✅ |
| 6 | CITY-03 配额书面登记 | `docs/spec/cyber-city-transform-fx.md` §4 有独立登记行：“变形窗粒子层，instance uniform，瞬态 0 席”，并写明三项瞬态条件；`TransformParticles.ts` 头注再次登记，持续席仍为 3/3 | ✅ |
| 7 | V5 四拍时间证据 | §2 状态机实测表 + 充能/光幕/落地三关键帧 + 13.33s/30fps 动态 walkthrough；粒子 `frame()` 只读取同帧 `clock/ringSpin/ring/veil/settle`，没有独立 Ticker 或 await | ✅ |

### 1.1 “墙钟”的口径

本门按任务指定的“状态机时间戳 log”执行，测的是生产 Ticker 的设计秒。Cloud VM 的
SwiftShader 只有约 0.5–1fps，而 Ticker 又将单帧 delta 封顶；因此 CI host
`Date.now()` 会把 1.05 设计秒拉长到数分钟，不能冒充用户真机墙钟。受控步进仍执行真实
`TransformSystem.update()`、真实热交换与真实状态迁移，不是把四个常量相加的静态推导。

## 2. 四拍状态机与 V5 时序证据

| 事件 | 规格时刻 | runtime log | 偏差 | 粒子读法 |
|---|---:|---:|---:|---|
| `state:transforming` | 0.0000s | 0.0000s | 0 | mesh 按 Quality 起拍 |
| RING_IN 完成 | 0.3500s | 0.3583s | +1 step | 火花喷发 + 环向碎屑 |
| swap / VEIL_IN 完成 | 0.6000s | 0.6083s | +1 step | 光幕体积光尘包裹热交换 |
| 首次触地 | ≈0.7666s | 0.7667s | <0.1ms | 余烬从触地门控起拍 |
| VEIL_OUT 完成 | 0.9000s | 0.9083s | +1 step | 光尘随幕归零 |
| `completeRun` / `car_ready` | 1.0500s | 1.0583s | +1 step | mesh `end()` 同帧隐藏 |

`+1 step` 来自离散采样第一次越过边界，步长为 `8.333ms`，不是时间轴延长。日志顺序为：

```text
state:transforming@0
→ beat:ring-in-complete@0.358333
→ swap@0.608333
→ beat:touchdown@0.766667
→ beat:veil-out-complete@0.908333
→ completeRun@1.058333
→ state:car_ready@1.058333
```

源码增量也支持同一结论：

- `TransformParticles` 没有 Ticker 订阅，只暴露 `begin/frame/end`；
- `frame()` 只写七个 uniform，不回写 `run.clock`、state、input、camera 或 vehicle；
- `TransformSystem.update()` 在既有 ring/veil/drop 计算后把已算出的中间量传给粒子；
- `completeRun()` 仍由原 `dropProgress >= 1` / `settleClock >= VEIL_OUT` 条件触发；
- PR #52 未修改 e2e、Playwright 配置、依赖锁或 poster。

## 3. 白爆 A/B

外置探针冻结 `TransformSystem.update()` 的自动订阅，只以 `1/30s` 手动推进原方法到
`charge/swap/touchdown/veilOut/carReady` 五个里程碑；每个里程碑不再推进 transform
clock，依次调用 `setParticles(0)` 与 `setParticles(1)` 截取 1080×558 canvas。swap 对：

- FX off：SHA-256
  `501a43ca24a78979a6084805f0ef485e5e202f7c63af44a6eee8cd9d1494f609`；
- FX on：SHA-256
  `5cab07e31095dde3e500a9523dadd2559473b9f3d725a05ff05644c46984dbdc`；
- metadata：`clock=0.6000`、`swapped=true`、`ringOpacity=1`、`veilOpacity=1`、
  `meshVisible=true`、`meshCount=300`。

| 里程碑 | clock | FX off 近白 | FX on 近白 | Δ |
|---|---:|---:|---:|---:|
| charge | 0.3667s | 0.2003% | 0.4673% | **+0.2670pp** |
| **swap** | **0.6000s** | **1.2006%** | **1.3033%** | **+0.1027pp** |
| touchdown | 0.7667s | 0.0405% | 0.0408% | +0.0003pp |
| veil-out | 0.9000s | 0.0010% | 0.0385% | +0.0375pp |
| car-ready | 1.0667s | 0.0126% | 0.0139% | +0.0013pp |

`min(r,g,b) >= 240` 的绝对峰值是 swap FX-on **1.3033% ≤1.9%**；五里程碑增量峰值是
charge **+0.2670pp ≤+0.5pp**。画面判读与数值一致：FX-on 增加的是离散青/品红软点，
不是新的全屏白层；光幕自身仍是青→品红渐变，落地余烬也保持小面积点状高光。

## 4. reduced-motion、idle 与配额闭合

### 4.1 reduced-motion

资源级而不只是 alpha 级关断：

```text
constructor:
  particles = reducedMotion ? null : new TransformParticles(...)

transform():
  setState(transforming)
  if reducedMotion:
    hotSwap(to)
    finish(to)
    return resolved Promise
```

所以 reduced-motion 下没有 `TransformParticles` 构造、scene mesh、300 实例 attribute、
NodeMaterial 或 `scene.userData.transformFx` 句柄。fresh runtime 结果为：

```json
{
  "durationMs": 0.8,
  "states": ["transforming", "car_ready"],
  "swaps": ["car"],
  "handleBefore": false,
  "meshBefore": false,
  "handleAfter": false,
  "meshAfter": false
}
```

完整 e2e 的 `CITY-E2E-04` 同时验证零 world 字节的显式进入前段、instant swap、
`car_ready` 与 aria-live 文字提示。

### 4.2 `robot_idle` / VIS-03

粒子构造完成时 `mesh.visible=false`；唯一置真点是非 reduced-motion 的 `begin()`，
`completeRun()` 同帧 `end()` 再置 false。fresh runtime inventory：

```json
{
  "state": "robot_idle",
  "handleExists": true,
  "meshExists": true,
  "visible": false,
  "count": 300,
  "rendererDrawCalls": 113
}
```

结合 VIS-03 PASS 与 poster Git tree id 零变化，idle 的像素/资产合同闭合。`count=300`
只是 draw range 上限；`visible=false` 时对象不会进入渲染列表，因此粒子结构性贡献为
0 draw call。两次 screenshot 之间城市常驻 shader 与 Reveal 仍在推进，不能拿 PNG
文件 hash 直接冒充 idle byte identity；本门采用 VIS-03 + poster blob identity +
mesh visibility 三层证据。

### 4.3 CITY-03

正式登记位于设计规格 §4，而不是只靠实现注释：

| 持续席 | 数量 |
|---|---:|
| HeroRobot idle 呼吸 | 1 |
| 楼顶全息板慢呼吸 | 1 |
| FlightTrails 系统 | 1 |
| **TransformParticles** | **瞬态，0** |
| 合计 | **3/3** |

当前实现比登记上限更短：仅 `transforming` 窗内可见，`car_ready` 不保留 1.50s 余辉尾。

## 5. V5 专项复评

沿用 `cyber-city-visual-rubric.md` v1.1。生产 V5=70 已由 Loop 4 的推镜、峰值保持、落地
微震与 reduced-motion 直出建立；本批只计算粒子层新增的可辨收益。

| 子项 | 结果 | 评分影响 |
|---|---|---|
| 节拍一致性 | 三段全部读取原四拍中间量；1.0583s 完成 | 正向 |
| 充能预备 | 环缘火花与碎屑清楚补上“能量积聚” | 正向 |
| 光幕过程 | 青/品红体积软点让幕不再只是平面 | 正向 |
| 落地跟随 | 暖白/青余烬在触地后离散外溅 | 正向 |
| 对比度 | 近白绝对值与增量双过门 | 正向 |
| swap 事件性 | 没有规格中的独立 `uSwapAt` / 48 粒裂解冲击；“burst”实际是充能火花 | 扣分 |
| 形态语义 | 没有机器人表面剥离→车壳聚合，仅为锚点周围 overlay | 扣分 |
| 余韵 | `completeRun()` 即隐藏，没有规格中的 car_ready 有界余辉 | 中性偏负 |

独立建议 **V5 74/100**：稳居 70–85 段下部，较生产 70 有可见增益；但仍未达到段中高位
所需的 swap 裂解事件、表面 morph、入场/POI/UI 全链统一编舞。

其余维度不重复计分：

```text
65×.20 + 74×.20 + 69×.15 + 72×.15 + 74×.15 + 73×.10 + 75×.05
= 71.10 → 71/100
```

因此本专项建议更新 V5 诊断值，不会仅靠四分 V5 增量把生产总视觉从 71 推到 72。

## 6. 非阻断规格漂移

以下不击穿七项指定硬门，但后续若宣称“完整实现
`docs/spec/cyber-city-transform-fx.md`”应先销账：

1. 规格 Q0/Q1 为 820/492，实际为 300/180；性能更保守，但不是规格数值；
2. 规格定义 swap 锁存与裂解冲击，实际没有 `uSwapAt`，role 0 的 `burst` 是充能段火花；
3. 规格要求工业橙 `#ff6b35` 余烬，实际使用暖白 `#f5decb` 向青色混合；
4. 规格允许 car_ready 后至 1.50s 有界余辉，实际在 1.05s `completeRun()` 立即隐藏；
5. 规格要求所有 uniform 为实例字段并禁止模块单例，实际 `fxMaster` 是模块级 uniform；
6. 规格要求显式预热新材质，PR #52 未接 `PreRenderer` 或等价 compile path；
7. 规格 §4 要求把登记摘要转录到 `cyber-city-eng-wave1-notes.md`；当前正式登记已在规格且
   实现头注复写，因而本次“书面条目存在”门通过，但 eng notes 转录动作仍缺。

这些差异解释了 V5 只取 74，不影响当前零白爆、零改拍、零 idle 像素、零
reduced-motion 粒子的 GO 裁决。

## 7. 命令与证据摘要

| 命令 / 证据 | 输出 |
|---|---|
| `git rev-parse daec44c` | `daec44c9bf71d676cdf8a4bf86e776dd86c47ca0` |
| `git diff f672d64^1 f672d64 --stat` | 只改 `TransformParticles.ts`、`TransformSystem.ts` |
| `git diff --exit-code f672d64^1 f672d64 -- e2e playwright.config.ts package.json pnpm-lock.yaml` | exit 0 |
| `git diff --exit-code f672d64^1 f672d64 -- public/posters` | exit 0；tree id 前后同为 `09a04c…f9fd` |
| `git diff --exit-code f672d64 daec44c -- TransformParticles.ts` | exit 0；粒子实现到审计对象未再变化 |
| exact merge `playwright test --list` | 52 tests in 10 files |
| exact merge full e2e | `52 passed (28.5m)`，exit 0；CITY-E2E-03/04/05、VIS-03 全过 |
| subject `daec44c` full e2e (`--retries=0`) | `54 passed (34.7m)`，exit 0；扩容后的 CITY/VEH/VIS 合同全过 |
| 受控 runtime timing probe | `car_ready@1.058333s`，七事件有序，无 page error |
| phase-locked A/B 分析 | swap 近白 on 1.3033%，off 1.2006%，Δ +0.1027pp；五拍最大 Δ +0.2670pp |
| reduced-motion runtime probe | 0.8ms instant swap；前后 handle/mesh 均不存在；无 page error |
| walkthrough | H.264，1080×558，30fps，400 帧 / 13.33s |

---

*CC-AL-TRANS-FX · 审计分支仅提交本报告；零 `src/`、e2e、生产 score JSON、poster 与
像素基线改动。*
