# tools/camera — camera-shots NDC 投影审计探针（CC-CAM-DATA）

`audit-shot-ndc.mjs` 把 AL-BL2/PLUS 审计的「楼体 bounding box 八角点 NDC 投影」论证方法
脚本化：读 `src/data/camera-shots.json`（shot 注册表，schemaVersion 1）与
`src/data/cyber-city-buildings.json`（楼体单源），按 `View.ts` 口径纯数学解算每个 shot 的
静止收敛态机位（`smoothedRatio = baseRatio`、`thetaDrift = 0`、`dollyIn = 0`），再用
`three` 的 `PerspectiveCamera` 把被审计楼体八角点投影到 NDC，并按 shot 内声明的
`projectionAudit.gates` 把门。零浏览器 / playwright 依赖，只读数据，不 import 引擎代码。

## 复现命令

```bash
# 全部 shot + 全部 gate（任一 gate 失败 → exit 1）
node tools/camera/audit-shot-ndc.mjs

# 单 shot
node tools/camera/audit-shot-ndc.mjs --shot poi_showcase-concept-garage

# 机读 JSON 报告
node tools/camera/audit-shot-ndc.mjs --json

# 覆盖视口（默认 1440×900 = AL-BL2/PLUS 审计协议视口，aspect 1.6 → 水平半视场 ±31.56°）
node tools/camera/audit-shot-ndc.mjs --width 1920 --height 1080
```

## 口径说明

- **八角点**：楼体 bbox = `position` 为中心的 `footprint.w × footprint.d`，`y ∈ [0, h]`；
  角点命名 `N/S`（z∓，北/南）× `W/E`（x∓，西/东）× `y0/yH`（地面/檐口）。
- **入帧**：位于相机前方（view-space z < 0）且 `|ndc.x| ≤ 1`、`|ndc.y| ≤ 1`、
  `ndc.z ∈ [−1, 1]`。机位后方的角点 `front=✗`，其 NDC 数值仅供参考（透视除法翻转）。
- **gate 类型**：`maxAbsNdcX(limit)`（八角点全部在前方且 `|ndc.x| ≤ limit`）、
  `inFrame`（8/8 入帧）、`partiallyInFrame`（≥1 入帧）、`outOfFrame`（0/8 入帧，
  用于「东向楼体不可达」这类现状事实的机器可验证文档化）。
- **ritual_idle / corridor 快照与审计实测的差异**：审计截图（如 PLUS 复审
  `camera=(152.29, 5.95, 36.39)`）可能取自 zoom 未完全收敛的瞬间；本探针输出解析收敛态
  （同参数下 `(152.13, 5.28, 34.08)`），机位差 < 2.5m，不影响八角点入帧/出画结论。

## 与批次纪律的关系

- 本目录只含数据探针；`View.ts` / `Areas.ts` / e2e / playwright.config / poster /
  workflow 零字节改动（shot 消费接线归 CC-CAM-VIEW）。
- GLB / 楼体零改动：探针读的是 `cyber-city-buildings.json` 的程序化包络
  （main 上 `concept-garage` 为 60×36×18，PR #43 未合流），showcase shot 靠机位
  而非改楼解决入帧。
- 设计草案：`docs/research/cyber-city-camera-poi-research.md` §3.1；DES 规格
  `docs/spec/cyber-city-camera-shots.md` 合入后按其对齐字段命名。
