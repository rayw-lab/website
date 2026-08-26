# Cyber City Loop 2 全量终审（CC-AL2）

| 项 | 内容 |
|----|------|
| 审计对象 | PR [#35](https://github.com/rayw-lab/website/pull/35) `cursor/cc-l2-visual-tier-b-1d6f@37770ae` |
| 指定基线 | `main@19978fa` |
| Loop 2 全链 | A-tail `711339c` → A-plus `bdcd29d` → Tier B `37770ae` |
| 本地被测集成树 | `b01ebf6`（Tier B ⊕ `main@19978fa`，tree `3587674`） |
| 审计分支 | `cursor/cc-al2-loop2-audit-1d6f` |
| 日期 | 2026-08-26（UTC） |
| 状态 | **审计完成 · Loop 2 放行（目标未满）· 建议受控启动 Loop 3** |

## 0. 最终裁决

**放行 Loop 2 当前边界，但不接受“已达到 Tier B ~70 档”或“视觉 ≥68”宣称。**

1. Loop 2 三段链路闭合：A-tail 的 A7-A10 已在前序审计确认 5/5 落地，但独立视觉
   60 未过 62 门；A-plus 定向补洞后独立视觉 62，合法放行 B1/B2/B4；Tier B 最终树
   中 B1/B2/B4 均有代码接线和 fresh 帧可见证据。
2. Tier B 自评视觉 **65/100**；CC-AL2 按 rubric v1.1 独立复评
   **63.75 → 64/100**，`|64-65|=1≤5`，双评纪律通过。64 高于 A-plus 独立基线 62，
   但低于实施记录中的派发预期 68；本轮应登记为“受控三件有效增益”，不是五件
   Tier B 全落后的 ~70 档。
3. exact 集成树本地全量 e2e **52 passed / 0 failed / 0 skipped / 0 flaky**，
   三项 `@smoke3d` **3/3**；build 19 pages、预算与链接门禁全过。
4. 同树本地隔离 LHCI 采集 **7 URL ×3 轮**，断言 exit 0；计分 URL `/` 与
   `/home/` 四项中位均值均为 **100**。五维齐套，
   `availableWeight===1`、`missing=[]`。
5. 登记视觉 65 的综合原始值为 **91.25 → `COMPOSITE_SCORE=91.3`**；代入本审计
   独立视觉 64 后为 **`COMPOSITE_SCORE=91.0`**。两种口径均稳定高于 85。
6. **建议受控启动 Loop 3**，但先闭合静态 poster 与 B2 灯箱内容两项债务，再只选
   一个高收益视觉主题；不建议直接把 B3 飞行光轨、B5 变形运镜、Tier C 和 Blender
   实模打成一个批次。

## 1. 审计边界与分支拓扑

指定对象不是相对 `main@19978fa` 的线性快进：

- Tier B 与 main 的 merge-base 是 `bdcd29d`；
- `main@19978fa` 在同一 A-plus 运行时树上另含 A-tail/A-plus 两份审计报告；
- 原始 `19978fa..37770ae` 因分叉会显示两份报告被“删除”，这只是分支拓扑，不是
  Tier B 的产品回退。

本审计先把 `main@19978fa` 合入审计分支，形成 `b01ebf6`，再对该实际可合入树跑全链。
集成后 `19978fa..b01ebf6` 只剩 Tier B 的 11 个文件差异：2 张视觉证据、工程记录与
视觉 score JSON、7 个 world 运行时文件；前序审计报告不再丢失。

完整 Loop 2 以 Loop 1 合入点 `a9532c9` 为前基线，共影响 29 个文件：

- A-tail：HUD/mini、壳排版、湿反射参数、desktop/mobile poster、9.416667s 动态证据；
- A-plus：主体前景湿反射、HUD 字级/留白、neon token 扩大单源范围、poster 再拍；
- Tier B：五栋 hero 招牌、10 杆街道灯箱、84 栋剪影填充与高度方差。

`e2e/` 测试逻辑、`playwright.config.ts`、`lighthouserc.json`、计分器、门槛和
workflow 相对 Loop 1 均未为 Tier B 改写；Loop 2 的 e2e 差异仅有 A-tail/A-plus
经审阅更新的 VIS-01 壳像素基线，不存在降阈值制造通过。

## 2. Loop 2 三段全链复核

| 阶段 | 前序/本次独立裁决 | 全链终态判断 |
|------|-------------------|--------------|
| A-tail A7-A10 | `cyber-city-loop2-a-audit.md`：5/5 落地，独立视觉 60，自评差 Δ2；动态证据 9.416667s；因独立分 `<62` 暂停 Tier B | 交付保留在最终树；全量 e2e 的 VIS-01/02/03/04 继续通过 |
| A-plus 补洞 | `cyber-city-loop2-a-plus-audit.md`：主体前景湿反射与 HUD/mini 精修闭合；独立视觉 62，合法放行 B1/B2/B4 | 运行时代码、poster 和壳基线均保留；Tier B 未回退 Roads/Grid/HUD |
| Tier B B1/B2/B4 | 本审计：三项均有最终树接线与 fresh 帧证；独立视觉 64 | 当前受控边界完成；B3/B5 确实未越界混入 |

动态证据 `l2-transform-seq.mp4` 仍为 H.264、1280×800、24fps、226 帧、
9.416667s，SHA-256
`cff8296801f1d3b6f81341e5b5f7c56a36e5daeaf989dbf9acc83cf39e1cd0d0`。
Tier B 未改变形状态机、镜头或时序，因此该证据可继续证明 V5 连续编舞，但本轮不给
V5 加分。

## 3. B1/B2/B4 落地核验

| 项 | 最终树证据 | fresh 帧判断 | 裁决 |
|----|------------|--------------|:---:|
| B1 五栋 hero 可读招牌 | `BuildingSigns` 按 `lodProfile==='hero'` 建 5 组；每栋 1 块双面楼顶全息板，临街立面合计 9 面；文字来自 `TextCanvas`；`ThemeTowers` 同时撤掉占位箍带 | 首幕可读 `AGENT NEXUS`，POI 帧可读 `CARCONCEPT GARAGE`；文字与湿地倒影均在帧内，不再只靠 DOM mini 认楼 | ✅ |
| B2 6-10 件灯杆/灯箱 | `StreetLamps` 固定 10 个 spot；杆/臂/灯头/挂旗合并几何，按道路轴拆 2 个 `InstancedMesh`；1 个 fixed body 挂 10 个 cylinder；色值直取 `NEON` | 首幕北廊可见青色灯杆纵深，garage 帧可见品红灯杆；数量、街道层和反射源成立 | ✅（有折扣） |
| B4 剪影密度/高度方差 | 填充 `48→84`；Q0/Q1/Q2 为 84/42/21；高度分 28-96、96-134、132-196m 三档；北向视锥避让与模 4 写入保护天空开口及低配全环 | 首幕中远层更密，顶部高度不再齐平，北向道路尽头仍有天空开口；远楼仍主要是窗格盒体 | ✅ |

B2 有一处规格实现偏差：rubric B2 施工说明写“灯箱纹理走 TextCanvas 程序化”，实际
挂旗灯箱只用局部坐标条纹 emissive，没有文字或图形纹理。因此它满足“10 件灯杆 +
广告灯箱、1-2 draw call”的主验收面，但视觉上仍读作通用发光板；本审计据此下修 V4，
并把 TextCanvas 内容化列入 Loop 3 首批收口项。

## 4. 视觉独立复评

量尺、权重和锚点完全沿用 `cyber-city-visual-rubric.md` v1.1。

| 维 | Tier B 自评 | CC-AL2 独立分 | 复评依据 |
|----|:---:|:---:|------|
| V1 首幕构图 | 63 | **61** | 运行时首幕增加招牌锚点、路灯纵深和远景高度变化；但构图本体未变，楼顶文字在上沿被裁切，且 desktop/mobile 静态 poster 仍是 A-plus 前帧，未呈现本批三项 |
| V2 光照材质 | 65 | **65** | 灯箱与招牌给湿地增加有语义倒影；镜面面积偏大、单层雾、无 IBL/AO、楼面程序感仍把分数封在 50-65 段顶 |
| V3 色彩氛围 | 69 | **69** | 新件沿用 cyan/magenta 与楼宇身份色，没有引入无语义杂色；Roads/Grid 仍保留派生线性字面量，不能宣称全链严格单源 |
| V4 场景密度 | 56 | **53** | 招牌文字层、10 杆街道家具和 84 栋剪影三层增量均真实，足以从 40 进入 50-65 段；但覆盖只到 5 栋 hero、灯箱无 TextCanvas 内容、无车流/雨丝/光轨，不能取段中上沿 |
| V5 动效转场 | 63 | **63** | 沿用经逐帧验证的 9.416667s 连续证据；本批未改编舞或镜头，B5 后置成立 |
| V6 UI/HUD | 72 | **72** | A-plus 的字级、留白、mini 快览与移动重叠修复均保留；Tier B 零 DOM 改动，不重复加分 |
| V7 原创叙事 | 72 | **72** | “楼=产品线”首次进入 3D 可读层，garage POI 与楼名同帧闭合；城市其余部分仍接近通用程序化赛博城 |

`61×.20 + 65×.20 + 69×.15 + 53×.15 + 63×.15 + 72×.10 + 72×.05`
`= 63.75 → 64/100`。

**双评通过：** `|64-65|=1≤5`。最大单维差为 V4 的 -3；原因不是否认三项落地，而是
按帧内覆盖与细节质量把“有一层街道内容”与“关键视角密度达标”分开。独立分从
A-plus 的 62 增至 64，增益成立，但派发预期 68 未达到。

## 5. e2e、LHCI 与工程门禁

### 5.1 exact 集成树本地全量

在 `b01ebf6` 上执行 `pnpm quality:loop:full`：

| 项 | 实测 |
|----|------|
| build | PASS，19 pages |
| Playwright | **52 passed / 0 failed / 0 skipped / 0 flaky**，17.8m |
| CITY 世界剧本 | CITY-E2E-01…06 全过 |
| 3D smoke | VIS-02/03/04 **3/3** |
| fresh 首幕 | `world-robot-idle.png`：AGENT NEXUS、灯杆、HUD、湿地倒影均可见 |
| fresh POI | `world-poi-concept-garage.png`：garage 招牌、品红灯杆、parkingBay 出生断言通过 |
| 软件光栅性能 | WS-PERF-01 约 2.0fps，为既定 OBS 软门禁；不包装成真机性能 PASS |

测试重写的历史说明截图已全部还原，未进入审计提交。

### 5.2 LHCI

仓库内 `pnpm exec lhci` 在本 VM 的 pnpm 依赖布局下完成 21 次 collect，但
Performance/Best Practices 产出 `NaN`；这与前序审计记录的 SwiftShader/`tslib`
限制一致，不能记为 PASS。

随后用同版本 `@lhci/cli@0.15.1` 的隔离 npm 布局、同一 Chromium、同一
`lighthouserc.json` 和同一 preview 重新采集：

- 7 URL ×3 轮 = **21 LHR**；
- `lhci assert`：`Checking assertions against 7 URL(s), 21 total run(s)`，
  `All results processed!`，exit 0；
- `/website/` 与 `/website/home/` 四项中位均值均为 **100**；
- 相对 A-plus 的两个计分 URL 没有下降。

### 5.3 预算与链接

- `pnpm astro check`：127 files，**0 errors / 0 warnings / 58 hints**；
- `audit-budget`：全部阻断级门禁通过；壳静态段 **80.9/90KB**，world JS
  **81.7/900KB gzip**，world 资产池 **5.2/12MB**，受保护 14 页 world 命中 0；
- `check-links`：19 页、347 条内部引用全有效，12 栋 deepLink 核对通过；
- Tier B 外部资产新增 **0 字节**。

## 6. 综合分复算

| 维度 | 分数 | 权重 | 登记加权 | 独立加权 |
|------|---:|---:|---:|---:|
| LHCI `/` | 100 | 0.25 | 25.00 | 25.00 |
| LHCI `/home/` | 100 | 0.15 | 15.00 | 15.00 |
| e2e | 100 | 0.20 | 20.00 | 20.00 |
| 视觉 rubric | 65 / **64** | 0.25 | 16.25 | **16.00** |
| 3D smoke | 100 | 0.15 | 15.00 | 15.00 |
| **合计** |  | **1.00** | **91.25 → 91.3** | **91.00 → 91.0** |

两次计分器输出均为 `availableWeight: 1`、`missing: []`。本地 pnpm LHCI 的
60% 覆盖诊断分 85.4 因缺两项而按可用权重归一化，**不作为发布分**；发布裁决采用
隔离采集后的五维齐套结果。

## 7. 放行保留项与 Loop 3 建议

### 非阻塞保留项

1. **Tier B 后 poster 未重拍。** `public/posters/cyber-city-poster*.webp` 与 VIS-01
   壳基线在 `bdcd29d..37770ae` 零差异；reduced-motion、移动端和无 3D 用户看到的
   仍是 A-plus 城市，不含 B1/B2/B4。页面不坏，但 Full Entry 三面同源已发生漂移。
2. **B2 灯箱内容不足。** 几何、数量、draw call、物理和反射都成立，但挂旗没有
   TextCanvas 广告内容，视觉上仍是通用条纹发光板。
3. **真机性能仍需人工 Gate。** 本次只能证明 JS/资产预算与软件光栅功能零回归，
   不能用 SwiftShader 约 2fps 推断桌面 60fps 或中端安卓 30fps。

### Loop 3 裁决

**建议受控启动 Loop 3，目标为独立视觉 ≥68，按以下顺序：**

1. 先给 B2 灯箱补 TextCanvas 内容；所有运行时视觉落定后，最后重拍
   desktop/mobile/OG poster，恢复三面同源；
2. 只开一个主攻主题，优先分层雾/低云带以突破 V2=65 段顶，同时改善 V1 远景；
3. B3 与 B5 不同批：B3 先书面统一 CITY-03 动画配额并验证 Q2 关闭；B5 先补
   reduced-motion 直出、驾驶镜头不漂和固定录屏证据；
4. Loop 3 继续保持 e2e 52/52、LHCI 两 URL 不降、`availableWeight===1`，并要求
   poster 在批次最后重拍。

不建议此时进入完整 Tier C 或 Blender 实模管线。当前 64→68 仍有低风险程序化与
证据一致性收益；实模专项应在程序化上限再次独立复评后另行裁决。

