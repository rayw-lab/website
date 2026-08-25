# 波 1 工程 Task 交付笔记（Full Entry 科技城 Phase 0）

> 每 Task 完成后追加一小节（验收命令输出摘要），供波末审计 CC-A1 对照
> `cyber-city-eng-orchestration.md` 公共条款 7。分支各自为政，合流时按小节合并。

---

## CC-E3：城市地图 schema + 程序化城区（2026-08-25）

| 项 | 内容 |
|----|------|
| 分支 | `cursor/cc-e3-city-procedural-1d6f`（base = `cursor/cyber-city-hero-design-1d6f`） |
| 文件域 | `src/lab/world/city/*`（7 个新文件）+ `src/lab/world/index.ts` 最小接线 |
| 数据单源 | `src/data/cyber-city-buildings.json` **零改动**：仍 12 buildings + 8 reservedSlots（≤ 20 封顶） |
| 外部资产 | **0 字节**（全程序化 TSL：零贴图、零 GLB、零网络请求）——资产台账登记行见下 |

### 交付文件

| 文件 | 职责 |
|------|------|
| `city/CityMap.ts` | SRD §12.7.3 schema 的 TS 固化（全字段文档注释）+ JSON 加载轻校验（槽位封顶 / id 唯一 / 道路带侵入，console.warn 不阻断——zod/CI 硬校验归 CC-E8）+ `headingToRotationY` / 确定性种子助手 |
| `city/NeonFacade.ts` | TSL 窗格 emissive 材质族：幕墙（层高×列宽栅格 + 每窗 hash 亮灭/色相/呼吸闪烁）、剪影（世界坐标栅格，InstancedMesh 缩放实例专用）、霓虹发光件、全息路障。算法思路重写自 three.js r185 `SkyscraperGenerator`（MIT），换皮赛博 palette；无 LICENSE 仓库零复制 |
| `city/Roads.ts` | 主十字路口：路面三段网格共用 1 材质（世界坐标取样无缝；虚线/白边线/斑马线/霓虹路缘，`createRoadMaterial` 思路重写）+ 出生点光圈与朝北箭标（**直读 JSON `world.spawn`**）+ 四条尽头全息路障（fixed cuboid）+ 城市地面碰撞体（±340m）——物理全部经 `game.objects.add` 显式描述注册（World.ts 同款 Objects 约定） |
| `city/ThemeTowers.ts` | `lodProfile: 'hero'` 五栋（内环四主题塔 + concept-garage）**JSON 数据驱动**：双阶收分体量（≥55m）/ 裙房 / 霓虹招牌带（全息文字归 CC-E4/E9）/ ≥70m 天线呼吸信标；footprint fixed cuboid 碰撞体 |
| `city/CityBlocks.ts` | `lodProfile: 'standard'` 七栋中景体块 + 霓虹檐口 + 碰撞体（CC-P1 流式后即 M 档基底） |
| `city/CitySilhouette.ts` | S 档剪影：预留槽位 8（熄灯窗格 + fixed 碰撞体防穿楼）+ 天际线填充 48（外环 300–420m，确定性种子摆位）——**全层 1 个 InstancedMesh = 1 次 draw call** |
| `city/index.ts` | `mountCity(game)` 装配 + 相机远裁剪面 1000m + 距离雾；类型/材质全量导出 |
| `src/lab/world/index.ts` | 最小接线：`?city=1` 动态 import 挂载（独立分包，默认零城市字节） |

### 验收命令输出摘要

- `pnpm astro check`：**0 errors / 0 warnings**（57 hints 均为既有）。
- `pnpm build`：18 页全绿；city 独立分包 `dist/_astro/city.*.js` = 18.5KB raw / **7.2KB gzip**（含内联 buildings JSON），spike 引擎分包 `world.*.js` 44KB 未变。
- JSON 断言：`buildings=12 reservedSlots=8 max=20`，`git diff src/data/cyber-city-buildings.json` 空（零改动）。
- 运行时证明（`/world-spike/?impl=engine&city=1`，Playwright + WebGL 2 回退，headless 无 WebGPU）——console 原文：

```text
[INFO] [city] CC-E3 程序化城区已挂载：在册 12 栋可见地标（hero 5 [lingua-tower,
voice-pod, agent-nexus, autodrive-lab, concept-garage] + standard 7）；预留剪影
槽位 8 + 天际线填充 48（1 draw call）；道路 2 条 + 尽头路障 4；出生点 (0, 0)
heading 0（十字路口正中，车头朝北）；外部资产 0 字节（全程序化）
```

- 截图三机位（存 agent 工件，PR 描述附图）：① 出生点近景——斑马线 + 青色出生光圈
  与朝北箭标 + 品红/青路缘霓虹；② 高空俯瞰——十字路口四进口斑马线 + 内环四主题塔
  （青 Lingua / 品红 Voice / 紫 Agent / 橙 AutoDrive）+ 概念车库蓝檐口 + 提案锁定
  色标逐楼可辨；③ 沿中轴大道望北街景——Agent Nexus × AutoDrive Lab 峡谷缺口
  （提案 D4 出生第一眼构图复现）。
- 回归检查（默认路径 `/world-spike/?impl=engine` 不带 `?city`）：网络零 `city*` 请求、
  console 零 `[city]` 日志、世界正常 ready——spike 灰盒零回归。

### 资产台账登记（程序化，0 字节外部资产）

| 资产 | 来源 | 许可 | 体积 | 入库路径 |
|------|------|------|------|---------|
| 城市几何/材质（路面、12 楼、8 槽剪影、48 填充、路障） | 程序化生成（CityGenerator/SkyscraperGenerator **算法思路** MIT 重写，零代码复制） | 自制（MIT 思路致谢） | **0 字节外部资产**（代码 7.2KB gzip 分包） | `src/lab/world/city/` |

### 遗留与交接

- 窗格 atlas / 品质三档（Quality 0/1/2）归 CC-E4（`createFacadeMaterial` 为其替换挂载点，接口已留）。
- 楼顶全息招牌文字（构建期 title 纹理）归 CC-E4/E9；泊车触发圈（parkingBay）归 CC-E9。
- 出生点对齐：城市按 JSON `world.spawn`(0,0) 布局；spike 灰盒 respawn 仍在环形道 (10,0,0)（`world/World.ts` 属 CC-E2 文件域，出生点切换随 CC-E2/E6 合流）。
- 道路两侧车道隐形围栏（限定 CC-P0 可驾驶范围为两主轴）未做——当前仅尽头路障 + 楼体/槽位碰撞体，广场可越野至 ±340m 地面边缘（掉落触发 killElevation 复位，spike 语义一致）；细化归 CC-P1。
