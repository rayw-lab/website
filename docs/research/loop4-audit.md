# Cyber City Loop 4 独立终审（CC-AL4）

| 项 | 内容 |
|----|------|
| 审计对象 | `cursor/cc-l4-b5-transform-camera-1d6f@42c7756` |
| 当前 `main` | `bcf7923` |
| merge-base | `ecb0fd3` |
| exact 被测集成树 | `eff7710`（candidate ⊕ `main@bcf7923`），tree `7110e87` |
| 审计分支 | `cursor/cc-al4-loop4-audit-1d6f` |
| 日期 | 2026-08-26（UTC） |
| 状态 | **独立视觉 68（raw 67.50）· 三门 ✅/✅/✅ · e2e/LHCI 全绿 · Loop 4 GO** |

## 0. 最终裁决

**Loop 4 放行。** CC-L4-B5 只补变形运镜，独立复评把 V5 从 63 提到 **70**；
其余六维沿用 CC-AL3 独立向量不预支，得到 **67.50 → 68/100**，刚好达到终审硬门。

1. 提交方自评 **68**；本审计独立复评 **68**，`|68-68|=0≤5`。
2. 独立视觉 **68≥62**，历史安全底线通过。
3. 独立视觉 **68≥68**，Loop 4 专项硬门通过。
4. fresh clean 全量 Playwright **52 passed / 0 failed / 0 skipped / 0 flaky**，
   17.7 分钟；`VIS-02/03/04 @smoke3d` **3/3**。
5. 隔离 LHCI **7 URL ×3 = 21 LHR**，collect/assert 均为 exit 0；
   `/website/` 与 `/website/home/` 四项中位数均为 **100/100/100/100**，相对
   CC-AL3 基线零下降。
6. 代入独立视觉 68 后，统一计分器输出 **`COMPOSITE_SCORE=92.0`**、
   `availableWeight: 1`、`missing: []`。

三门是 AND 关系；本轮三门及工程底盘同时为绿，因此结论为 **GO**，不是以综合分覆盖
视觉专项门。

## 1. 审计边界与 exact integration tree

候选与最新 `main` 从 `ecb0fd3` 分叉：

- candidate：`42c77564ceb4efd9f8610d541aab0a5c8554c026`；
- `main`：`bcf79237eca017c8654743be05ec7c15048c8467`；
- merge-base：`ecb0fd3fcb86f458582e4bcad4c960210fe522a7`；
- 审计分支合入最新 `main` 后为
  `eff7710143f47effaf95cbc367f07cf9d32f041f`，tree
  `7110e8762b87687d29cf82f47a642b173201dbeb`。

`main` 的分叉差量仅为编排看板两行状态更新；没有改变候选运行时。候选相对
merge-base 的运行时差量只在：

- `src/lab/world/view/View.ts`；
- `src/lab/world/player/TransformSystem.ts`。

其余差量为实现笔记与提交方视觉分登记。候选没有修改 Playwright 用例、测试阈值、
LHCI 配置、统一计分器、车辆物理、状态机四拍常量、雾、光轨、HUD 或 poster。
本审计分支除 exact-tree 合流和本报告外不改业务代码。

## 2. 独立视觉复评

继续使用 `cyber-city-visual-rubric.md` v1.1，不改权重，不因 68 门线改秤。

| 维 | CC-AL3 | 提交方 | CC-AL4 独立 | 复评依据 |
|----|:---:|:---:|:---:|------|
| V1 首幕构图 | 65 | 65 | **65** | 运镜通道在 `robot_idle` 为零；fresh VIS-03 首幕与 VIS-01 壳基线均通过，首幕构图本体未改 |
| V2 光照材质 | 70 | 70 | **70** | 雾、材质、bloom、光幕 shader 零改动；推镜只改变覆盖比例，fresh 时间帧未出现新增全屏白爆 |
| V3 色彩氛围 | 69 | 69 | **69** | 纯相机域改动，青/品红/暖白色轴及分层大气不变 |
| V4 场景密度 | 58 | 58 | **58** | 楼体、招牌、灯杆、光轨及地面生命感零改动，不借运镜重复加分 |
| V5 动效转场 | 63 | 70 | **70** | 充能段可辨推近，光幕峰值保持，落地段回基线并接短促位移/微滚；与既有充能环、热交换、车落地同拍，reduced-motion 直出不动镜，驾驶态无持久残余 |
| V6 UI/HUD | 73 | 73 | **73** | DOM/HUD/poster 零改动；VIS-01 基线通过，首幕机位零漂移条件成立 |
| V7 原创叙事 | 73 | 73 | **73** | 运镜强化既有“机器人→车”仪式，但属类型片通用手法，不重复加原创分 |

计算：

`65×.20 + 70×.20 + 69×.15 + 58×.15 + 70×.15 + 73×.10 + 73×.05`
`= 67.50 → 68/100`。

### 2.1 V5 为什么取 70，而不是继续留在 50–65

fresh 1440×900 robot-idle 帧先确认主体、道路、低云与 HUD 均稳定；随后固定机位实跑
`robot_idle → transforming → car_ready → driving`：

- 充能段主体与背景按同一透视关系连续推近，非对象缩放；帧序列中 7% 推镜可辨；
- 光幕峰值保持推近，热交换后随落地回放到原机位，视觉节拍与既有四拍一致；
- 落地尾接垂直阻尼震动与微滚，随后进入 `car_ready`；首个 `W` 同拍进入
  `driving`；
- `CITY-E2E-04` fresh 通过，证明 reduced-motion 腿仍是 instant swap；
- `ritualCam` 两通道在无仪式/收尾时显式为 0，`dispose()` 也归零；没有把一次性
  运镜变成循环动画或持久驾驶偏移。

这销掉了 CC-AL3 的明确判词“相机仍静止，B5 未做”，并满足 V5 70–85 段底的
“关键节拍完成度高 + 微动层齐 + 转场保持可读”。只取 **70 段底**：运镜仅覆盖变形
一个节拍，入场光柱、POI、出口和 UI 过渡没有新增镜头语言；7% 推镜与落地微震都克制，
不支持段中高位。

独立走查视频为 Cloud Agent artifact
`cc_al4_transform_camera_audit_accelerated.mp4`：原始 SwiftShader 墙钟片段裁掉无关桌面并
4×加速，仅用于展示帧序列，不作为 1.05 秒真机计时证据。

### 2.2 首幕、poster 与驾驶稳定

- fresh VIS-01 静态壳像素基线通过，poster 消费链未漂移；
- fresh VIS-03 robot-idle canvas 非空并落盘，运镜只在 transforming 窗建立；
- `dollyIn=0` 时半径乘数为 1，`shakeY=0` 时垂直偏移为 0；两条通道不靠渐近补间
  维持首幕；
- 收尾先把 `dollyIn` 强制归零，再开始解析微震；微震到窗尾强制归零，roll 弹簧继续
  自收敛；
- CITY-E2E-03、04、05 全绿，覆盖普通腿、reduced-motion 腿与 `?gl=1` 回退腿；
  首个驾驶输入的状态切换仍为同拍。

因此 AL3 条件⑤成立：首幕机位没有改变，poster 三面只复核消费链，不重复重拍。

## 3. 三门独立判定

| 门 | 实测 | 判定 |
|----|------|:---:|
| 自评与独立分差 `≤5` | `|68-68|=0` | ✅ |
| 独立视觉历史底线 `≥62` | 68 | ✅ |
| Loop 4 独立视觉硬门 `≥68` | 68 | ✅ |

**三门全过，Loop 4 GO。**

## 4. e2e、LHCI 与统一计分

### 4.1 fresh e2e

exact tree 上执行 `pnpm test:e2e`：

| 项 | 结果 |
|----|------|
| build | PASS，19 pages |
| Playwright | **52 passed / 0 failed / 0 skipped / 0 flaky**，17.7m |
| CITY 世界剧本 | CITY-E2E-01…06 全过 |
| B5 关键回归 | CITY-E2E-03/04/05 全过（普通变形 / reduced-motion / WebGL2） |
| 3D smoke | VIS-02/03/04 **3/3** |
| VIS-01 | 壳静态基线匹配 |
| 软件光栅性能 | 约 2.0fps，为既有 OBS 软门禁，不包装成真机性能 PASS |

首轮全量在独立视觉浏览器仍占用 SwiftShader 时，灰盒
`WS-E2E-03` 的左转方向断言一次失败（实测确有 `Δyaw=-0.357rad`），后续 5 例因依赖链
未运行。关闭外部 WebGL 上下文后，同一用例隔离复核 **1/1 通过**，再从干净进程完整
重跑得到上述 **52/52**。最终门禁运行无 retry、无 flaky 标记；失败点不在候选改动域，
但本报告保留该资源竞争记录，不隐去首跑。

全量测试重写的 23 张历史说明截图已还原，未进入审计提交。

### 4.2 LHCI

workspace pnpm 布局完成 21 次 collect，但与既有登记一致，Performance 与
Best Practices 为 null，assert 显示 NaN；该缺维结果不用于放行。

随后用隔离 npm 布局的同版本 `@lhci/cli@0.15.1`、同一 `lighthouserc.json`、
同一 `dist/` 与 Chromium 重采：

- 7 URL ×3 = **21 LHR**；
- `Checking assertions against 7 URL(s), 21 total run(s)`；
- `All results processed!`，collect 0 / assert 0；
- `/website/`：Performance / Accessibility / Best Practices / SEO =
  **100 / 100 / 100 / 100**；
- `/website/home/`：**100 / 100 / 100 / 100**。

相对 CC-AL3 同口径的两个 URL 四项全 100，逐项零下降。

### 4.3 五维齐套复算

| 维度 | 分数 | 权重 | 独立加权 |
|------|---:|---:|---:|
| LHCI `/` | 100 | 0.25 | 25.00 |
| LHCI `/home/` | 100 | 0.15 | 15.00 |
| e2e | 100 | 0.20 | 20.00 |
| 独立视觉 | 68 | 0.25 | 17.00 |
| 3D smoke | 100 | 0.15 | 15.00 |
| **合计** |  | **1.00** | **92.00** |

计分器 fresh 输出：

```text
综合分 92.0/100（按可用权重 100% 归一化；五维齐套)
COMPOSITE_SCORE=92.0
```

机读结果为 `availableWeight: 1`、`missing: []`，输入记录
`e2e passed=52 / failed=0 / skipped=0`、`smoke3d=3/3`、七 URL 各 3 轮。

补充工程门：

- `astro check`：128 files，0 errors / 0 warnings / 58 hints；
- `audit-budget`：全部阻断门通过；world JS 84.2/900KB，资产池 5.2/12MB，
  poster 39.7/40KB，壳静态段 86.5/90KB；
- `check-links`：19 页、347 条内部引用全部有效。

## 5. Loop 4 放行结论

建议看板由父代理登记：

| ID | 建议状态 |
|----|----------|
| CC-AL4 | `✅ 独立 68（raw 67.50）；Δ0✅ / ≥62✅ / ≥68✅；e2e 52/52；LHCI 不降；Loop 4 GO` |
| Loop 4 汇总 | `综合 92.0；availableWeight=1；missing=[]；B5 单主题闭合` |

放行边界：

1. 可按 exact-tree 顺序合入/保留 CC-L4-B5；本报告不代替父代理更新看板。
2. 68 是四舍五入门线，raw 仅 **67.50**，没有额外视觉余量；不得登记为 69 或把
   综合 92.0 描述成视觉 92。
3. B5 已完成定向补洞；后续若继续提视觉，按 AL3 裁决转向 V4 近中景密度/Tier C
   或显式调整目标，不再叠普通变形特效赌分。
