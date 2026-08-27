# 3D 视角 / POI 机位调研与脑暴（父代理起草 · CC-CAM 批次入口）

| 项 | 内容 |
|----|------|
| 触发 | BL2/PLUS 双次 NO-GO 根因：**固定 ritual 机位**与 **东向沿街楼位**几何不匹配；`?poi=` 仅改 **parkingBay 出生**，不改 **robot_idle 首幕机位** |
| 北极星 | 解锁 V4 whole-frame 可读轮廓 + 游戏化 POI 体验（对标 folio / Orion / three-story-controls） |
| 实现模型 | `claude-fable-5-thinking-xhigh` × 多路并行 |
| 登记 | 仍 **70/92.5**；本批次 **不改 Blender GLB**，先解 **机位/镜头单源** |

## 1. 现状痛点（代码事实）

| 机制 | 现状 | 缺口 |
|------|------|------|
| `robot_idle` 首幕 | `View.ts` city 档：FOV 42°、斜距 ~18–20m、俯角 22°、锚点 `world.spawn` 十字路口 | 水平视场约 ±31.6°；**x≥110 东向楼体物理不可入帧**（AL-BL2/PLUS 投影实测） |
| `?poi=` 深链 | `Areas.ts` 仅改写 **出生点 → parkingBay**；ritual 模式出生仍归 `TransformSystem` | **无镜头预设**；深链 ≠ 展示帧 |
| `work-gallery` 沿街帧 | 固定深链 + 驾驶后撤可读整楼 | 塔冠仍常被裁切；**非 robot_idle 协议 B 主帧** |
| poster / OG | 绑定 robot_idle 主帧（rubric 协议 B） | 改 ritual 机位 → **poster 三面重拍门禁** |
| 竞品 folio-2025 | `camera-controls` + `#debug` + Tweakpane camerakit | 本站 **G5 红线禁 free 相机**；须 **数据驱动预设镜头** |

## 2. GitHub / 开源对标（初筛 · 子代理 CC-CAM-RS 深化）

| 仓库 / 项目 | 星/量级 | 可借鉴点 | 红线 |
|-------------|---------|----------|------|
| [nytimes/three-story-controls](https://github.com/nytimes/three-story-controls) | NYT 3D 故事 | `StoryPointsControls` POI 数组 position+quaternion；`CameraHelper` 导出 JSON；深链可映射 POI index | 勿引入整库 free 漫游 |
| [brunosimon/folio-2025](https://github.com/brunosimon/folio-2025) | 1k+ | `camera-controls`、区域进站 tween 相机、wheel zoom；`#debug` 调机位 | 与本站同源 View；portfolio 自由相机 ≠ 本站纪律 |
| [cyrus2281/night-city](https://github.com/cyrus2281/night-city) | 霓虹城参考 | 第三人称跟随 + 城市尺度 | 密度低于 Orion |
| Orion / Jesse Ramen | Awwwards HM | 进站俯拍 tween、选择性 bloom、单场景高密度 | 非开源；对标 rubric §2 |
| [pmndrs/camera-controls](https://github.com/yomotsu/camera-controls) | 广泛 | 平滑阻尼、fitToBox、saveState | folio-2025 已用；**禁止用户接管** |

## 3. 设计方向脑暴（待 CC-CAM-DES 定稿）

### 3.1 镜头单源 `camera-shots.json`（提议）

```json
{
  "shots": {
    "ritual_idle": { "anchor": "spawn", "spherical": {...}, "lookAtHeight": 3.4, "lateral": 4.2 },
    "poi_arrival": { "anchor": "parkingBay", "spherical": {...}, "buildingFocus": "target" },
    "building_showcase": { "anchor": "building.centroid", "spherical": {...}, "fitFootprint": true },
    "street_pullback": { "anchor": "corridor", "corridorId": "neon-boulevard-east", ... }
  }
}
```

- **anchor 类型**：`spawn` | `parkingBay` | `building` | `corridor` | `world`
- **模式**：`ritual`（首幕恒等 poster 合同）| `poi`（深链）| `drive`（驾驶跟随，现有 View）
- **审计**：每 shot 附带 `projectionAudit` 脚本输出 NDC 八角点

### 3.2 多路产品功能（游戏化 POI）

| 功能 | 描述 | 优先级 |
|------|------|--------|
| POI 进站镜头 | E 键进站前 0.8s 缓动至 `building_showcase` | P0 |
| 沿街扫视 | 驾驶进入 `corridor` 区触发轻 yaw 偏轴（非 free cam） | P1 |
| 双主角 framing | ritual_idle **分轨**：西向 autodrive 收益 / 东向 boulevard 收益（**须 poster 重拍任务书**） | P0 争议 |
| 深链直达展示帧 | `?poi=concept-garage&shot=showcase` 跳过 ritual 或 ritual 后立即切 showcase | P1 |
| Debug 机位导出 | `#debug` 下导出 shot JSON（对齐 three-story-controls CameraHelper 工作流） | P2 |

### 3.3 与 BL2 合流关系

- **PR #43 仍 NO-GO**；相机批次 **不依赖** BL2 合流
- 相机方案 GO 后 → 可选 **CC-BL2-CAM** 重审（同 GLB + 新 shot 可读东向楼）
- **poster** 若动 ritual_idle → 单独 **CC-POSTER-RESHOT** 批次（永远最后）

## 4. 并行 Task 路标（Fable5 xhigh）

| ID | 文件域 | 交付 |
|----|--------|------|
| CC-CAM-RS | `docs/research/github-camera-poi-survey.md` | GitHub 深搜 + 许可 + 接入成本表 |
| CC-CAM-DES | `docs/spec/cyber-city-camera-shots.md` | Shot 注册表 schema + rubric 对齐 + poster 影响矩阵 |
| CC-CAM-DATA | `src/data/camera-shots.json` + `tools/camera/` 投影审计脚本 | 数据 + 可复现 NDC 探针 |
| CC-CAM-VIEW | `src/lab/world/view/` + `areas/` 接线 | 消费 shots；`?poi=` 可选 shot；零 poster 改动 |

审计：**CC-AL-CAM**（Sol）在 DATA+VIEW 集成后 — 专项门：指定楼 NDC 入帧 + e2e 52/52 + VIS-03 基线合同

## 5. 纪律

- 禁止 `camera-controls` 用户 free 漫游（G5）
- 禁止未授权改 `e2e/`、`playwright.config.ts`、像素基线（CAM-VIEW 若动 VIS-03 须单独任务书）
- tone mapping / poster 三面 **本批次不碰**
- 登记分只认审计独立分
