# Cyber City Loop 3 全链终审（CC-AL3）

| 项 | 内容 |
|----|------|
| 审计对象 | `cursor/cc-l3-poster-three-surface-1d6f@5057ab4`（B2C + ATM + B3 + POSTER） |
| 当前基线 | `main@b991664` |
| merge-base | `2e6126c`（B2C 与 CC-AL3-B2C 已合流） |
| exact 被测集成树 | `1cf8fec`（candidate ⊕ `main@b991664`），tree `5b6142b` |
| 审计分支 | `cursor/cc-al3-loop3-audit-1d6f` |
| 日期 | 2026-08-26（UTC） |
| 状态 | **终审完成 · 独立视觉 66 · 三门 ✅/✅/❌ · Loop 3 NO-GO · 建议受控开启 Loop 4-B5** |

## 0. 最终裁决

**Loop 3 不放行。** 工程链全部为绿，视觉也没有跌破历史底线，但独立视觉
**66/100 < 68**，三门是 AND 关系，不能用综合 91.5 或自评 67 覆盖终审硬门。

1. 提交方最终自评 **67**；本审计按 rubric v1.1 独立复评
   **66.45 → 66/100**，`|66-67|=1≤5`，一致性门通过。
2. 独立 66 ≥62，历史安全底线通过；独立 66 <68，Loop 3 目标门失败，差 2 个正式
   整数分（原始加权距四舍五入到 68 的 `67.50` 还差 1.05）。
3. exact 集成树 fresh 全量 Playwright **52 passed / 0 failed / 0 skipped /
   0 flaky**，17.9 分钟；`VIS-02/03/04 @smoke3d` **3/3**。
4. exact 集成树隔离 LHCI **7 URL ×3 = 21 LHR**，assert exit 0；`/website/` 与
   `/website/home/` 四项中位数均为 **100**，相对 `main@b991664` 同 SHA CI artifact
   的 100/100/100/100 零下降。
5. 代入独立视觉 66 后统一计分器输出 **`COMPOSITE_SCORE=91.5`**、
   `availableWeight: 1`、`missing: []`。五维齐套，但综合分只证明工程底盘，不改变
   视觉专项门失败。
6. B2C、ATM、B3、POSTER 四段均保留在最终树，边界和证据闭合；失败原因不是集成
   回退，而是 B3 在关键帧里只形成很轻的远景生命感，未把 V4 推到提交方自评的 60。

## 1. 审计边界与 exact integration tree

候选不是相对最新 `main` 的线性快进：

- candidate `5057ab4be6f367255757732437a3063ea17bdd2e`；
- `main` `b9916649d2cc88b62bb00f7dc4d25e6d2eb18e9b`；
- merge-base `2e6126c548c5eb99c075cdee6df95ba9d2c294f4`；
- 本审计先在独立审计分支合入 `main`，得到 `1cf8fec6f3891eea6ec3334e496aaea1c6133d50`；
- 合流只带入看板登记，未改变 candidate 的运行时、poster、基线或视觉 score。

因此 e2e、LHCI、预算、链接与 fresh 帧均针对 `1cf8fec` 的 tree `5b6142b`。本报告提交
发生在测试之后，但只新增本文件；运行时被测树不漂移。

以 Loop 2 收口点 `76950e7` 为前基线，全链产品改动集中在：

- B2C：`StreetLamps.ts` / `NeonMaterials.ts` 的共享 TextCanvas atlas 内容；
- ATM：`Sky.ts` 的双坡距离雾、近地雾床、方位染雾与静态低云带；
- B3：`FlightTrails.ts` 的三航线 630 点单 `InstancedMesh` 光轨及 `city/index.ts`
  档位接线；
- POSTER：desktop、mobile、OG 同源资产与 VIS-01 审阅基线。

全链未修改 Playwright 用例逻辑、`playwright.config.ts`、`lighthouserc.json`、
`scripts/score-loop.mjs`、预算/链接门、workflow、依赖或锁文件。`e2e/` 唯一差异是
有意更新的 VIS-01 静态壳像素基线，不存在降阈值制造通过。

## 2. 四段全链闭合

| 段 | 最终树证据 | fresh/原始工件判断 | 裁决 |
|----|------------|--------------------|:---:|
| B2C | 10 面挂旗共用一张 TextCanvas atlas；仍按道路色族合为 2 个 `InstancedMesh` | fresh 首幕可读近位 `AI CORE`，POI 保留 `TUNE-UP`；不再是通用条纹板 | ✅ |
| ATM | `scene.fogNode` 双距离坡 + 近地雾床；穹顶内静态低云；Q0/Q1/Q2 与关雾开关同路径 | 同机位开/关帧中，右侧道路由单一灰底变成道路消失点、远楼底、辉光云带三层；主体、招牌和 HUD 未被吞没 | ✅ |
| B3 | 3 航线、630 点、1 个 `InstancedMesh`；Q1 裁到 2 航线，Q2 `visible=false`；reduced-motion 冻结时间 | 开/关帧可见品红与青色拖尾；`t1→t2` 位置变化，22 秒 H.264 证据为 1440×900、25fps、550 帧；生命感成立但覆盖很轻 | ✅（低增益） |
| POSTER | desktop 1280×720、mobile 720×1280；`og:image` 复用 desktop | desktop 带入右侧低云和青色光轨；mobile 是以机器人为中心的独立竖构图；VIS-01 fresh 比对通过 | ✅ |

### 2.1 ATM 突破 V2 段顶成立

关雾帧的右侧通廊主要是均匀灰紫天空与单一远衰减；开雾帧能分辨近景主体、中景楼群/
灯杆、道路尽头雾床和其后的低云带。它满足 V2 70–85 段“雾有层次”的最低条件，因此
V2 从 65 提到 **70** 合理。

这个结论不外推到段中高位：楼面仍是规则窗格盒体，机器人材质分区有限，无 IBL/AO/
体积光，湿地仍偏大面积镜面。ATM 是一次有效破段，不是材质完成度已经达到 HM 档。

### 2.2 B3 有运动，但不足以把 V4 记到 60

B3 的空间和性能纪律成立：光轨位于中远景、遮挡走深度、Q2 摘 mesh、总点数低于 800，
动态证据也排除了“静态 emissive 冒充运动”。但按帧优先协议：

- `t1` 首幕能看到左中景一条品红拖尾与右上一个青色机头；
- `t2` 品红航线已出画，只剩很小的青色亮点；
- fresh 1024×640 首幕也只稳定看到两条细小远景光痕；
- 地面层仍无车流、雨丝、行人/杂物，招牌覆盖仍限于既有 hero 楼和灯杆。

所以它销掉“零光轨”判词并给 V4 **+1（57→58）**，但不足以按提交方自评给 +3。
环境微动存在，不等于“关键视角密度达标”；V4 继续留在 50–65 段。

### 2.3 poster 三面与预算

| 面 | 接线 | 实测 |
|----|------|------|
| desktop 壳 / Lab 卡 | `cyber-city-poster.webp` | 1280×720，40,580 bytes（39.6KiB）≤40KiB |
| mobile 壳 | `cyber-city-poster-mobile.webp` | 720×1280，38,916 bytes（38.0KiB）≤40KiB |
| Open Graph | `og:image` 复用 desktop 文件 | 1280×720，无第三份漂移资产 |

预算 fresh 结果：G-A′ poster 39.7/40KB、壳静态段 86.5/90KB、world JS
83.9/900KB gzip、world 资产池 5.2/12MB、受保护 14 页 world 命中 0；全部阻断门通过。

## 3. 独立视觉复评

继续使用 `cyber-city-visual-rubric.md` v1.1，不改权重、不因 68 门线改秤。

| 维 | 最终自评 | CC-AL3 独立 | 复评依据 |
|----|:---:|:---:|------|
| V1 首幕构图 | 65 | **65** | ATM 把右侧道路尽头、远楼和云带分开，poster 同源；但机位、主体比例和道路消失点未改，左侧楼体仍重、楼顶文字仍被上沿裁切，取 50–65 段顶 |
| V2 光照材质 | 70 | **70** | 同机位开关帧证明分层雾和低云在帧内可辨，合法越过 65；无 IBL/AO/体积光、楼面与机器人材质仍程序化，只取 70 段底 |
| V3 色彩氛围 | 69 | **69** | 大气和光轨都锁青/品红/暖白轴，未引入杂色；既有 Roads/Grid 派生线性常量与明暗节奏债未修 |
| V4 场景密度 | 60 | **58** | B2 内容、hero 招牌、灯杆、84 栋剪影和飞行光轨均成立；但光轨在关键帧细小且间歇，地面零车流/雨丝，覆盖离 70 段“关键视角密度达标”仍远 |
| V5 动效转场 | 63 | **63** | B3 是环境生命感，只计 V4 一次；既有 9.4s 变形编舞保留，但相机仍静止，B5 未做 |
| V6 UI/HUD | 73 | **73** | HUD 与 runtime、desktop/mobile/OG 重新同源，移动竖构图成立；仍是覆盖式 DOM、系统字体、非 diegetic 面板 |
| V7 原创叙事 | 73 | **73** | 楼名、garage 与街道广告延伸“楼=产品线”；飞行光轨是类型片通用元素，不重复加原创分 |

`65×.20 + 70×.20 + 69×.15 + 58×.15 + 63×.15 + 73×.10 + 73×.05`
`= 66.45 → 66/100`。

相对 CC-AL3-B2C 独立原始值 64.90，全链净增 **+1.55**，主要来自 ATM；相对
AL3-MID 的 66.30，B3 只增 **+0.15**。POSTER 是一致性债清账，不重复加分。

## 4. 三门独立判定

| 门 | 实测 | 判定 |
|----|------|:---:|
| 自评与独立分差 `≤5` | `|67-66|=1` | ✅ |
| 独立视觉历史底线 `≥62` | 66 | ✅ |
| Loop 3 独立视觉硬门 `≥68` | 66 | **❌** |

结论只能是 **NO-GO**。前两门回答“自评可信、没有倒退”，不能推出第三门已过。

## 5. e2e、LHCI 与 `availableWeight`

### 5.1 fresh exact-tree e2e

在 `1cf8fec` 上执行 `pnpm quality:loop:full`：

| 项 | 结果 |
|----|------|
| build | PASS，19 pages |
| Playwright | **52 passed / 0 failed / 0 skipped / 0 flaky**，17.9m |
| CITY 世界剧本 | CITY-E2E-01…06 全过 |
| 3D smoke | VIS-02/03/04 **3/3** |
| VIS-01 | 最终 poster 静态壳基线匹配 |
| fresh 首幕 / POI | 两帧 canvas 非空；`robot_idle` 与 `parkingBay` 落定 |
| 软件光栅性能 | 约 2.1fps，为既有 OBS 软门禁；不包装成真机性能 PASS |

全量测试重写的 23 张历史说明截图已还原，未进入审计提交。

### 5.2 exact integration LHCI 与 main 对照

workspace pnpm 布局在本 VM 复现已登记限制：collect 21 份成功，但 Performance /
Best Practices 为 null，assert 失败。该 60% 覆盖诊断分不用于发布裁决。

随后用同版本 `@lhci/cli@0.15.1` 的隔离 npm 布局、同一 Playwright Chromium、
同一 `lighthouserc.json` 和同一 `dist/` 重新采集：

- 7 URL ×3 = **21 LHR**；
- `Checking assertions against 7 URL(s), 21 total run(s)`；
- `All results processed!`，collect 0 / assert 0；
- 七个 URL 四项中位数全部为 100。

基线取 `main@b991664` 的 CI run
[32964581500](https://github.com/rayw-lab/website/actions/runs/32964581500) 同口径
`lighthouse-results` artifact（21 LHR）：

| 树 / URL | Perf | A11y | BP | SEO | 相对 main |
|-----------|:---:|:---:|:---:|:---:|:---:|
| `main@b991664` `/website/` | 100 | 100 | 100 | 100 | 基线 |
| `1cf8fec` `/website/` | 100 | 100 | 100 | 100 | 0 |
| `main@b991664` `/website/home/` | 100 | 100 | 100 | 100 | 基线 |
| `1cf8fec` `/website/home/` | 100 | 100 | 100 | 100 | 0 |

### 5.3 五维齐套复算

| 维度 | 分数 | 权重 | 独立加权 |
|------|---:|---:|---:|
| LHCI `/` | 100 | 0.25 | 25.00 |
| LHCI `/home/` | 100 | 0.15 | 15.00 |
| e2e | 100 | 0.20 | 20.00 |
| 独立视觉 | 66 | 0.25 | 16.50 |
| 3D smoke | 100 | 0.15 | 15.00 |
| **合计** |  | **1.00** | **91.50** |

计分器 fresh 输出：

```text
综合分 91.5/100（按可用权重 100% 归一化；五维齐套)
COMPOSITE_SCORE=91.5
```

JSON 为 `availableWeight: 1`、`missing: []`。代入提交方视觉 67 时为 91.8；两者都高于
85，但都不替代独立视觉 68 专项门。

补充工程门：`astro check` 为 128 files、0 errors / 0 warnings / 58 hints；链接门
19 页、347 条内部引用全有效；预算全部阻断项通过。

## 6. 看板更新建议（由父代理执行）

建议看板不要写“Loop 3 放行”，而写：

| ID | 建议状态 |
|----|----------|
| CC-AL3 | `❌ 独立 66（raw 66.45）；Δ1✅ / ≥62✅ / ≥68❌；工程门全绿；Loop 3 NO-GO` |
| Loop 3 汇总 | `综合 91.5；B2C+ATM+B3+POSTER 全链闭合；视觉目标未达，不合并为已过门状态` |
| CC-L4-B5 | `建议受控开启；唯一主题=变形运镜，Fable5 xhigh；base=本次 exact runtime tree` |
| CC-AL4-B5 | `紧随 B5 独立审计，Sol fast xhigh；未过门前不加第二主题` |

### 是否开 Loop 4

**建议开，但它是新一轮定向补洞，不是对 Loop 3 的追认放行。**

理由：

1. 工程硬门全部稳定，失败点单一且可量化；没有必要推倒 B2C/ATM/B3。
2. B3 对 raw 总分只带来 +0.15，继续叠远景粒子收益低；不应再做光轨扩面。
3. V5 仍为 63，预先后置的 B5 是尚未尝试、边界已定义的单主题。若 B5 能让 V5 至少
   到 70，则总 raw 可从 66.45 到 67.50，正式分才有机会到 68。
4. B5 必须保持总节拍、物理与驾驶镜头稳定，提交 5–10 秒
   `robot_idle→veil→car_ready→首次驾驶` 证据；reduced-motion 全程不动镜。
5. B5 必须证明 `robot_idle` 稳定帧零漂移；若首幕像素发生变化，poster 三面仍须在
   Loop 4 最后重拍。没有漂移则只复核 hash/消费链，不为形式重复重拍。
6. 若 B5 独立复评仍 <68，或 raw 增益 `<1.0`，停止普通效果叠加；再单独裁决 V4
   近中景密度/Tier C 或调整目标，不允许把 B5、IBL、雨丝、车流打成一个包赌分。

本次不建议直接开 Blender 全城实模专项。先完成这一个已规划的 B5 定向实验；若仍不过
68，再依据新帧确认差距是否已转为实模/手工材质密度问题。
