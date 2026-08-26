# Cyber City 渲染架构缺口裁决咨询

> 裁决角色：CC-Rendering-Gaps-Consult（只规划，不改业务代码）
> 日期：2026-08-26
> 输入：`cyber-city-rendering-architecture-audit.md`、`loop4-audit.md`、当前
> `main` 实现与 Loop 5 状态
> 基线：综合 **92.0**、独立视觉 **68**（raw 67.50）、V2=70、V3=69、V4=58；
> `CC-L5-C1` 已派发，目标是验证程序化路径能否稳定到 70+，否则裁决 Blender 专项

## 0. 结论先行

| 缺口 | 四选一裁决 | 是否现在开 Task | 一句话结论 |
|---|---|---|---|
| ① NoToneMapping | **建议补** | **否** | 它可能改善 V2/V3 的高光滚降与色彩统一，但不是当前 V4 缺口的直接解；只允许在 AL5 后以有条件、单批次校准进入 Loop 6 |
| ② PreRenderer 仅 Q0+WebGPU | **可 defer** | **否** | 目前是风险敞口而非已复现缺陷；把六面 CubeCamera 预热直接铺到低配档/回退后端，可能把“首用卡顿”换成“挂载更慢或上下文丢失” |
| ③ Ticker 四个 TSL uniform 零消费 | **建议补** | **否** | 是确定的死接口与错误注释，适合 AL5 后维护性小 PR 清掉；性能收益趋零，不能占用视觉 Loop 的关键路径 |

**总裁决：不建议立即为三项中的任何一项开实现 Task。** 当前顺序保持
`CC-L5-C1 → CC-AL5`；只把 ② 的冷启动/首用观测加入 AL5 证据合同。AL5 之后再按本文
决策树决定是否开 ① 的 Loop 6 校准、② 的定向修复或 ③ 的维护 PR。

## 1. 逐项裁决

### 1.1 ① NoToneMapping：建议补，但不得插入 L5-C1 与 AL5 之间

#### 事实与边界

- `rendering/Rendering.ts` 当前不设置 `renderer.toneMapping`，Q0/Q1 输出为
  `scenePassColor + bloomPass`，Q2 则直走 `renderer.render()`。
- bloom 的 threshold 固定为 1；幕墙、招牌、信标、反射、天空和网格已经按
  “阈上起辉 / 阈下不抢辉光”手工分档。
- `car-configurator/engine.ts` 的 ACES 只证明同版本 `WebGPURenderer` 的 API 路径可用，
  **不能证明 Cyber City 零成本接入**：车配置器是 HDRI/车漆场景，没有同一套全城
  emissive 台账、bloom 合成和 Q2 旁路合同。

#### ROI

- 正收益主要落在 V2/V3：压住招牌、光幕、机器人关节与湿反射的高光硬截断，并让青/
  品红/暖白在高亮区更统一。
- 当前最弱项是 **V4=58（权重 15%）**，而 V2=70、V3=69；`CC-L5-C1` 的假室内窗格和
  机器人材质直接命中 V4/V2。tone mapping 此时插队会削弱 L5-C1 的归因，且不能替代
  场景密度。
- 因此它是“值得做的画质校准批”，不是“为了过 68 必须还的架构债”，也不能用来掩盖
  L5-C1 对 V4 无效的结论。

#### 风险

1. 这是全局输出变更，不是只加一行常量：Q0/Q1 后处理路径和 Q2 直出路径都要复核，
   WebGPU 与 `?gl=1` WebGL 2 也都要看。
2. bloom 取样仍可能在场景线性空间按 threshold=1 分流，但 tone mapping 会改变最终
   可见的非 bloom 高光、bloom 合成和综合色相；不能因 threshold 数值没变就宣称台账
   契约未变。
3. exposure、bloom strength/smoothWidth 与全部阈上 emissive 强度存在联动；只开 ACES
   而不重校台账，可能把“白爆”换成“灰雾、霓虹失色或暗部糊死”。
4. 有意像素变化会触及视觉基线；只能审阅后更新确属预期的快照，禁止用批量重拍掩盖
   回归。

#### 与提分 Loop 的关系

- **不进 Loop 5**。先让 `CC-L5-C1` 和 `CC-AL5` 独立回答“程序化 V4/Tier C 是否有效”。
- 仅在 AL5 得到“独立视觉 69 左右、V4 已有净增益、剩余明确是高光滚降/综合色彩”时，
  才把 tone mapping 作为一次封顶的 Loop 6 候选。
- 若 AL5 已到 70+，先收口，不为追更高数字自动开批；若仍为 68 且 V4 缺口被判为几何/
  实模密度，直接进入 Blender 专项裁决，不用 tone mapping 绕过 V4 结论。

### 1.2 ② PreRenderer 预热敞口：可 defer，先测后改

#### 事实与边界

- `city/index.ts` 只在 `quality.level===0 && rendering.isWebGPU` 时调用
  `PreRenderer.render()`；`PreRenderer.ts` 会临时显露隐藏件，并用 32px CubeCamera
  六面渲染逼出材质管线编译。
- 这个门不是遗漏式的空判断，而是 folio 同源的低端保护：Q1/Q2 与 WebGL 回退跳过预热，
  用意是避免额外离屏工作和上下文丢失。
- 当前没有提交 cold-run trace、Long Task 记录或真机帧序列证明 Q1/Q2/WebGL 已发生
  用户可见首用卡顿；因此不能把“可能卡顿”升级成已失败的发布门。

#### ROI

- 若 L5-C1 新材质在机器人 reveal、Q2→Q0 切档或首次驶近窗格时才编译，定向预热可减少
  一次性卡顿，收益落在交互流畅度与 CITY 首幕/变形体验，而不是静态视觉分。
- 但现有城市大部分材质在挂载时已入场，真实增益取决于后端缓存与材质首次可见时机；
  未测量前 ROI 不可量化。

#### 风险

1. CubeCamera 即使只有 32px 也会走六个方向；shader 编译而非像素数可能是主成本。
2. 在低配档和 WebGL 回退上扩大预热，最容易拖慢 `ready`、机器人可见与可驾驶时间，
   恰好冲击 ≤2.5s / ≤8s 的既有合同。
3. 把隐藏件临时设为可见会扩大变体编译面；L5-C1 新增材质越多，粗放预热的峰值越高。
4. “所有档一律 CubeCamera”不是预设答案；若证据触发修复，应在
   `renderer.compileAsync`、目标材质清单、分帧预热或维持现状之间用实测裁决。

#### 与提分 Loop 的关系

- AL5 在 exact L5-C1 候选树上补一组**只观测、不改门槛**的冷启动证据：Q0/Q1/Q2、
  WebGPU/`?gl=1`，覆盖挂载、robot reveal、首次变形及 Q2→Q0 首用。
- 若现有 e2e 或真机 ≤2.5s / ≤8s 硬门因编译明确失败，AL5 应判 No-Go，并派定向修复后
  重跑 AL5；这时它是 Loop 5 修复，不是 Loop 6 画质任务。
- 若只有理论敞口或 SwiftShader 软观测，没有可归因失败，则 defer，不新造“首帧毫秒”
  硬门，也不阻塞 L5-C1。

### 1.3 ③ Ticker TSL uniform 悬空：建议补，放到维护队列

> 已执行（2026-08-26）：维护 PR `CC-MNT-TICKER-TSL` /
> `cursor/cc-maint-ticker-tsl-uniforms-1d6f` 按 §2 边界清除——四个 uniform、
> `three/tsl` import、四次逐帧写入与失真注释全删，直接文档同步更新。

#### 事实与边界

- 全仓只有 `core/Ticker.ts` 定义和逐帧写入 `elapsedUniform`、`deltaUniform`、
  `elapsedScaledUniform`、`deltaScaledUniform`；零材质、零系统读取。
- 文件注释称 “Nipple/未来材质消费”，但 `inputs/Nipple.ts` 使用自己的交互 uniform；
  现有 shader 动画统一使用 TSL `time` 节点。

#### ROI

- 删除 `three/tsl` 的 `uniform` import、四个字段与四次 `.value` 写入，可消除错误接口和
  后续开发者误选时间源的风险。
- 每帧四次赋值和四个节点对象的实际性能成本趋零；对 V1–V7、LHCI 或综合分不应承诺
  可测提升。
- 未来若出现必须与 `Ticker.scale`、暂停或回放严格同步的材质，应按“先有消费方，再建
  单一显式 uniform”的方式回补，而不是永久维护无主的四件套。

#### 风险与 Loop 关系

- 内部静态引用为零，风险低；仍需确认 `#debug` 外露句柄没有被文档化为公共 API。
- 它与 L5-C1 文件域正交，但在 AL5 前合入会改变 exact candidate tree、增加无收益的
  回归面；因此排在 AL5 后，作为维护 PR，不计入 Loop 5/6 视觉增量。

## 2. 若纳入执行：Task、分支、串并行与单 PR 边界

| 条件 | 建议 Task / 分支 | 与 L5-C1 的关系 | 单 PR 聚焦边界 |
|---|---|---|---|
| AL5 独立视觉约 69，且明确点名高光滚降/综合色彩为剩余瓶颈 | `CC-L6-TM` / `cursor/cc-l6-tone-mapping-calibration-1d6f`；完成后 `CC-AL6-TM` 独立审计 | **严格串行**于 L5-C1、AL5 之后；校准很可能触及 `Rendering.ts`、`NeonMaterials.ts`、机器人/变形 emissive，与 L5-C1 有文件和视觉语义冲突 | 只做一种 tone mapping 方案、exposure、bloom/emissive 台账重校、三档/双后端同机位证据；不加 DOF/SSAO/LUT/新材质/新内容，不碰预热和 Ticker |
| AL5 证明编译导致现有硬门失败 | `CC-L5-R1-PREWARM` / `cursor/cc-l5-r1-prerender-policy-1d6f`；修后重跑 `CC-AL5` | 文件未必与 L5-C1 重叠，但**证据和材质集合强耦合**；以 L5-C1 exact candidate 为 base，禁止并行归因 | 只处理冷启动/首用编译策略及其遥测、状态恢复和 Q0/Q1/Q2+双后端验证；不改材质外观、不改质量档视觉预算、不改 e2e 阈值 |
| AL5 已收口，维护窗口允许 | `CC-MNT-TICKER-TSL` / `cursor/cc-maint-ticker-tsl-uniforms-1d6f` | 无文件/视觉冲突，但**不在 AL5 前合流**；AL5 后可独立做，若与 Loop 6 并行则合入前必须试合并并全门回归 | 只删四个死 uniform、对应 import/写入及失真注释，并更新直接文档；不把全城 `time` 节点改成 Ticker uniform，不顺手重构 tick/delay/wait |

`CC-L6-TM` 与 `CC-L5-R1-PREWARM` 也不应并行：tone mapping 会新增/改变 shader 变体，
预热结论必须基于最终材质图；若二者都被触发，先修硬门的 PREWARM，再由 AL5 放行，最后
才允许进入 TM。

## 3. 优先级与插入位置

```text
P0  CC-L5-C1（已派发，保持范围）
 │
P1  CC-AL5（独立复评 + ② 的冷启动/首用观测）
 │
 ├─ 现有硬门因 shader 编译失败
 │    → CC-L5-R1-PREWARM → CC-AL5 重审 → 才能继续
 │
 ├─ 独立视觉 ≥70
 │    → 常规 Loop 收口；① defer，③ 转维护队列；按产品目标决定是否需要 Blender
 │
 ├─ 独立视觉约 69，V4 有净增益且剩余瓶颈明确为高光/综合色彩
 │    → Loop 6 只开 CC-L6-TM → CC-AL6-TM；这是 tone mapping 唯一推荐插槽
 │
 └─ 独立视觉仍约 68，V4 仍被实模/几何密度卡住
      → 不开 CC-L6-TM 救总分；转 Blender hero 楼/街角 spike 裁决

AL5 收口后任一空档
      → CC-MNT-TICKER-TSL（不占视觉 Loop 序号）
```

核心纪律是：**L5-C1 与 AL5 之间不插任何三项实现**。否则无法回答 L5-C1 是否真正突破
程序化 V4 上限，也会把刚达线的 raw 67.50 基线暴露给无关输出变化。

## 4. 硬条件影响

### 4.1 所有候选共同硬门

1. exact candidate tree 上 `pnpm test:e2e` 必须保持 **52 passed / 0 failed /
   0 skipped / 0 flaky**；不得改用例分母、重试口径、阈值或 reporter 来换绿。
2. LHCI `/` 与 `/home/` 四项必须逐项不低于 Loop 4 基线；当前基线均为
   **100/100/100/100**。本机出现 null 时，只能用同一候选 SHA 的 green CI artifact
   回填并登记来源。
3. `pnpm score` 必须输出 **`availableWeight===1` 且 `missing=[]`**；缺维归一化高分
   不能放行。e2e、LHCI、视觉和 `@smoke3d` 工件必须能追溯到同一候选 SHA，或证明运行时
   tree 完全相同。
4. `@smoke3d` 保持 3/3；有意视觉变化按固定机位审阅，不能先更新快照再判断是否回归。

### 4.2 分项影响

| 项 | e2e | LHCI | `availableWeight` |
|---|---|---|---|
| ① Tone mapping | 功能断言理论上不变，但 VIS 世界像素、`?gl=1`、变形白爆和 Q0/Q1/Q2 观感都受影响；必须全量 52/52 + 双后端视觉证据 | `/home/` 应零漂移；`/` 的 GPU 输出/挂载负载可能变化，仍须 7 URL×3 collect/assert 并守住逐项不降 | 不改计分 schema；必须重产完整 e2e/LHCI/视觉/smoke 工件，不能沿用 L5 的视觉分或相邻 SHA LHR |
| ② PreRenderer | **影响最高**：重点看 CITY-E2E-03~06、`?gl=1`、reduced-motion、remount，以及真机机器人 ≤2.5s / 可驾驶 ≤8s | 扩预热最可能拉低根路由 Performance/TBT；任何方案都必须在冷缓存下复测，不能拿热 shader cache 结果放行 | 不直接改权重，但若 LHCI 因软件栈出现 null，仍不得用缺维分；必须取同 SHA 完整工件 |
| ③ Ticker cleanup | 预计零行为变化；定向 `astro check`/build 后仍由审计跑全量 52/52，确认 wait/delay/物理时基未误删 | 预计零变化，最多是 world chunk 极小缩减；不得据此豁免“不降”门 | 不改任何输入与权重；完整工件要求不变 |

## 5. 父代理三条执行建议

1. **现在只推进 `CC-L5-C1 → CC-AL5`，把 Q0/Q1/Q2、WebGPU/`?gl=1` 的冷启动与首用编译观测写入 AL5 任务书，不另开渲染实现 Task。**
2. **AL5 仅在“约 69、V4 已涨、剩余明确是高光滚降”时派 `CC-L6-TM`，若 V4 仍被实模密度卡住则直接转 Blender spike 裁决。**
3. **把四个无消费 TSL uniform 登记为 AL5 后的 `CC-MNT-TICKER-TSL` 小 PR，禁止与 tone mapping、预热或其他重构打包。**

## 6. 最终摘要

- ① **建议补**：有画质 ROI，但属 AL5 后的条件式 Loop 6 校准，当前不插队。
- ② **可 defer**：先由 AL5 取运行时证据；只有既有硬门被编译明确击穿才开定向修复。
- ③ **建议补**：确定的维护债，AL5 后单独清理，不作为提分动作。
- **立即开 Task：否。** 立即动作只是完善 AL5 证据合同并继续既定 L5-C1。
