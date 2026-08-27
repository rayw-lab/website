# CC-CAM-VIEW 实现记录：View/Areas 消费 camera-shots（?poi=&shot= 接线）

| 项 | 内容 |
|----|------|
| 任务 | CC-CAM-VIEW（相机批次四路之 VIEW；入口调研 `docs/research/cyber-city-camera-poi-research.md` §4） |
| 分支 / commit | `cursor/cc-cam-view-poi-framing-1d6f`（base = main `0066e19`）；实现 commit `e44aa49` |
| 模型 | claude-fable-5-thinking-xhigh |
| 数据源 | `src/data/camera-shots.json` = **CC-CAM-DATA 分支 `f8c46cb` 同文件逐字节复制**（schemaVersion 1；DATA 分支尚未合入 main，按任务书「未合则复制到本分支」执行——两分支合流时该文件天然零冲突） |
| 红线自查 | poster 三面零字节（`public/posters/` 未触碰）· e2e/ 零改动 · playwright.config 零改动 · lighthouserc/.github/tools-blender 零改动 · 无 camera-controls / 任何用户相机接管输入（G5） |

## 1. 改动面（8 文件）

| 文件 | 改动 | 说明 |
|------|------|------|
| `src/lab/world/view/CameraShots.ts` | **新增** | 镜头单源消费器：加载 camera-shots.json → `?shot=` 白名单（= 注册表键集）→ anchor 解析（spawn/building/parkingBay/corridor/world 五型）→ `View.applyShot`；并在首个驾驶意图动作上一次性接线 `View.releaseShot` |
| `src/lab/world/view/View.ts` | +`applyShot`/`releaseShot` + `ViewShotPose` | 预设应用面：焦点钉锚（`isTracking=false`+磁吸关）+ spherical（φ/θ/radius.edges）/lookAtHeight/lateral 整组改写；release 恢复 applyShot 前现场并回归玩家跟踪。`lookAtHeight` 去 `readonly` 仅类型面（运行时零差异）；`update()` 主循环**零改动** |
| `src/lab/world/index.ts` | +`?shot=` 解析 | 仅 `city && poi && shot` 三条件齐才动态 `import('./view/CameraShots')`——默认路径零字节（与 city/areas 同纪律） |
| `src/data/camera-shots.json` | **新增**（DATA f8c46cb 复制） | 4 shot：`ritual_idle`（现状快照/poster 合同 frozen）· `poi_showcase-concept-garage` · `poi_showcase-autodrive-lab` · `corridor_neon-boulevard-east`；NDC 八角点审计 gates 7/7 PASS（DATA 探针 `tools/camera/audit-shot-ndc.mjs`，本分支不复制探针——归 DATA 文件域） |
| `src/pages/index.astro` / `src/pages/world-spike/index.astro` | PARAM_ALLOWLIST +`'shot'` | 超出任务书名义文件域的**必要最小接线**：M4 纪律下引擎只吃壳白名单转发的显式参数（`本入口不再兜底 location.search` 是既有裁决），不开白名单则 `?shot=` 永远到不了引擎；替代方案（引擎旁路读 location.search）违反已登记架构纪律，故取一行白名单 |
| `src/lab/manifest.json` | deepLinkParams +`"shot"` | 同上（facade 路径同一白名单契约） |
| `src/lab/world/areas/Areas.ts` | **零改动** | 任务书列为「最小接线」候选；实测 shot 消费全部落在 view/ + index.ts，`?poi=` 出生语义零触碰（DES 规格 §0.3「?poi= 语义零改动」同口径），故 Areas 一行未动 |

## 2. 行为契约

### 2.1 `?shot=` 语义（opt-in，DES 规格 §0.3 对齐）

- 仅与 `?poi=` 组合生效：`/?poi=<楼>&shot=<注册表键>`（poi 模式挂载即应用——出生已在 parkingBay，展示帧直达）；`/?ritual=1&poi=<楼>&shot=<键>`（ritual+poi 组合在 **state=robot_idle** 应用，任务书最小可行口径——机器人仪式照常在 spawn 进行，DES 时机细化后可调整）。
- 白名单 = camera-shots.json `shots` 键集，**单点裁决在 CameraShots**（壳只透传字符串）；名单外 / anchor 引用不存在的楼 → `console.warn` + 保持默认机位（`?poi=` 无效 slug 同款不阻断口径）。
- **释放**：首个驾驶意图动作（`forward/right/backward/left/boost/brake/respawn` = View 既有重吸附清单 + `nipplePointer` 触屏摇杆）→ `releaseShot`：取景参数恢复现场、焦点回归玩家跟踪（磁吸复活）、监听即拆。与「任何驾驶意图 → 相机重新吸附」既有机制同一节拍，**非**用户自由相机。

### 2.2 ritual_idle 零漂移合同（poster 三面免重拍前提）

- 机器保证：未指定 `?shot=` 时 CameraShots 分包**不加载**、`View.applyShot` **零调用**、`shotBaseline` 恒 `null`、`update()` 主循环逐行未动——robot_idle 主帧与 main 逐字节一致（`ritualCam` dollyIn/shakeY「0 时恒等」同族纪律）。
- `releaseShot` 幂等：从未 apply 过时空操作（合同另一半）。
- 消费口径备注：`spherical.thetaDriftDeg` 不消费——View 构造期已按档位/reduced-motion 落定 `framing.thetaDrift`，shot 只改取景不改微动纪律；定值 shot（radius min=max）期间速度变焦自然失效（静帧展示语义），release 后恢复。

### 2.3 schema 期差备注（交 DATA/DES 合流时对齐）

DATA 落地文件（schemaVersion 1：`lookAtHeight`/`lateral` 平铺、shot 键 `poi_showcase-*`）与 DES 规格（0.1.0：`lookAt{height,lateral}`/`fov`/`drift`、键 `showcase.*`）字段命名尚未互相对齐（DATA 文件头已自注「DES 规格合入后对齐字段命名」）。本消费器以**落地文件为准**（类型面 `CameraShotEntry` 单点收口）；字段更名时仅 CameraShots.ts 机械重命名，View.applyShot 面不变。`fov` 字段本波未落地（DATA 文件无该字段；View FOV 仍构造期常量）。

## 3. 验证（build + astro check + 手动 preview + 视觉 e2e）

| 项 | 结果 |
|----|------|
| `astro check` | 0 errors / 0 warnings |
| `pnpm build` | 绿；CameraShots+JSON 独立 chunk `world.Q88j7UJN.js` ≈6.5KB，仅 `?shot=` 路径加载 |
| 手动 preview ①（任务书指定帧） | `/?poi=concept-garage&shot=poi_showcase-concept-garage`：**整楼入帧**（60m 宽概念车库 + 顶部全息招牌 + parkingBay 光圈与玩家车同帧可见）。遥测：camera=(60.0, 23.3, −9.5)（≈ DATA 注记 (60.0, 23.3, −10.0)，差值为 thetaDrift 呼吸相位），spherical φ=75° θ=−67° edges 90/90，focus 钉 (140,−44)，isTracking=false magnet=false；出生仍 parkingBay (140,−18)（`?poi=` 语义零改动） |
| 手动 preview ②（释放） | 按 W 1.2s：console `[camera-shots] 驾驶意图接管…释放`，edges 恢复 16/26、θ 恢复 25°、isTracking/magnet 恢复 true——完整回归 city 跟随档 |
| 手动 preview ③（ritual 组合） | `/?ritual=1&poi=concept-garage&shot=poi_showcase-concept-garage`：robot_idle 态 shot 生效（focus (140,−44)，玩家在 spawn (0,0)，变形 CTA 正常在帧） |
| 视觉 e2e | `playwright test --project=visual-chromium --no-deps`：**4/4 passed**（VIS-01/02 像素基线未更新且比对通过 = 壳零漂移；VIS-03 robot_idle 无 shot 挂载绿 = 首幕合同路径；VIS-04 `?poi=` 单参绿 = poi 既有语义零回归）。像素基线零新增（DES 规格 §3「新 shot 取证帧走 ?shot= 显式路径截图，不新增像素基线」） |
| e2e 52/52 全量 | 未在本分支跑（AL-CAM 审计门口径；本 VM 同时有多路并行 Task 抢占 4 核，world-chromium 串行 project 校准为整机独占——审计时按看板纪律跑全量） |

取证截图（/opt/cursor/artifacts/）：

- `cc-cam-view-shot-concept-garage.png` —— 任务书指定帧（poi+shot 展示机位，整楼入帧）
- `cc-cam-view-shot-released-drive.png` —— W 驾驶后释放回跟随档
- `cc-cam-view-ritual-poi-shot-combo.png` —— ritual+poi+shot 组合（robot_idle 应用）
- `cc-cam-view-robot-idle-noshot.png` / `cc-cam-view-poi-noshot-default.png` —— 无 shot 对照（VIS-03/04 取证帧，零漂移路径）

取证注记：本 VM 为多代理共享工作区（/workspace 与 worktree 均可能被并行 Task 切分支），首轮 VIS 取证曾被并行分支切换污染；上表全部结果为在 `e44aa49` 干净 checkout（独立 worktree `git worktree add`）复跑后的有效数据。

## 4. 附录：12 楼 showcase 参数解析审计（交 CC-CAM-DATA 扩表候选）

实现期为验证消费链路对 12 楼全量可行，按 View 同款投影（FOV 42°/16:9，机位 = 锚点 + setFromSphericalCoords(R,φ,θ)，lookAt = 锚点 + lookAtHeight·ŷ）跑了逐楼参数搜索：约束 = 楼体 bbox 八角点 NDC |x|,|y| ≤ 0.92～0.95、机位不入他楼体积（xz 足迹 +3m 缓冲）、机位→视线段不被他楼 AABB 遮挡（slab test，收缩 1m）、八角点深度 < far 200；θ 基向 = 楼心→parkingBay 方位 + 偏轴候选序 [±20°, ±35°, 0°, ±50°…]，取最小可行 R。**本表未入库**（camera-shots.json 归 DATA 文件域单源；此为扩表数值候选 + 方法复现记录）：

| 楼（footprint w×d×h） | φ | θ | R | lookAtH | NDC max \|x\| / \|y\| |
|----|----|----|----|----|----|
| lingua-tower 36×36×78 | 80° | 155° | 138 | 39 | 0.283 / 0.920 |
| voice-pod 32×32×42 | 80° | −101° | 81 | 23.1 | 0.422 / 0.920 |
| agent-nexus 40×40×96（全城最高） | 80° | 65° | 162 | 48 | 0.268 / 0.945（八角点最远深度 193m < far 200，斜距顶格） |
| autodrive-lab 44×36×60 | 76° | −25° | 115 | 30 | 0.388 / 0.917 |
| concept-garage 60×36×18 | 80° | 20° | 64 | 9 | 0.907 / 0.713 |
| work-gallery 56×32×36 | 72° | 200° | 80 | 16.2 | 0.676 / 0.910 |
| insights-archive 32×48×66 | 80° | −70° | 121 | 33 | 0.374 / 0.917 |
| about-pavilion 36×36×40 | 80° | 110° | 82 | 22 | 0.495 / 0.915 |
| contact-beacon 24×24×88 | 80° | 200° | 140 | 44 | 0.179 / 0.915 |
| edge-cloud-hub 64×40×32 | 80° | 20° | 77 | 17.6 | 0.806 / 0.916 |
| workflow-foundry 48×32×28 | 76° | −70° | 70 | 12.6 | 0.681 / 0.915 |
| now-signal 20×20×72 | 80° | 110° | 115 | 36 | 0.182 / 0.914 |

注：DATA 已落地的 concept-garage（φ75/θ−67/R90，沿街高位帧）与本表（φ80/θ20/R64，泊车位正面帧）为两种成立构图；本波以 DATA 数值为准（帧证据见 §3），本表仅证明「12 楼全量各存在满足八角点入帧 + LoS 的 showcase 参数」，扩表裁量归 DATA/DES。

## 5. 后续挂钩

- **AL-CAM 审计门**（入口调研 §4）：指定楼 NDC 入帧 + e2e 52/52 + VIS-03 基线合同——本分支交付面已按门准备。
- DES 时机细化（进站 0.8s 缓动 / E 键 showcase 等 P0/P1 功能）不在本波：本波只落「深链直达展示帧」最小闭环。
- DATA/DES 字段命名合流时：改 `CameraShots.ts` 类型面 + 机械重命名（§2.3）。
