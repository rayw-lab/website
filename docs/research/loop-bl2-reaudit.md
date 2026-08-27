# Cyber City Blender 沿街扩展 PLUS 独立复审（CC-AL-BL2）

| 项 | 内容 |
|---|---|
| 审计模型 | `gpt-5.6-sol-xhigh-fast` |
| 审计对象 | PR [#43](https://github.com/rayw-lab/website/pull/43) 锁定 `cursor/cc-bl2-street-extension-1d6f@fcdfcb5` |
| 登记基线 | `main@6bd9ca6`，生产登记仍为 AL-BL1 独立视觉 **70** / 综合 **92.5** |
| merge-base | `b9a6edb` |
| exact 被测集成提交 | `a8bc89d`（detached `main@6bd9ca6` ⊕ candidate `fcdfcb5`） |
| exact tree | `fda022f1d89b530cfa5298355decf6fff6d8f8c7` |
| 审计分支 | `cursor/cc-al-bl2-audit-1d6f` |
| 日期 | 2026-08-27（UTC） |
| 独立视觉 | **71/100（raw 70.60）** |
| V4 专项 | **71/100，低于 72–75 门** |
| 独立综合 | **92.8/100**（raw 92.75；`availableWeight=1`、`missing=[]`） |
| 双评 | 实现自评 71 vs 独立 71，`|Δ总分|=0≤5`；V4 自评 72 vs 独立 71，`|ΔV4|=1` |
| 裁决 | **NO-GO**：固定沿街整帧是可接受的替代证据场地，但本 exact 帧只新增画面顶缘被裁切的冠环弧，不构成 whole-frame 可读新轮廓；另有 24 张无关历史取证图混入锁定提交 |

## 0. 结论先行

PLUS 对 robot-idle 的几何反驳成立：`concept-garage` 地块不在该相机水平视锥内；在不改
相机或楼位的授权范围下，单纯抬高屋顶无法让它进入首幕。本复审不把一个几何上不可能的
机位当作唯一可用证据场地。`?poi=work-gallery` 是既有、可复现、距目标楼约一条街的固定
深链帧，原则上可以承接 AL-BL2 §8.1 的“无需 concept POI 近景即可辨认”目标。

但“证据场地可接受”不等于“帧证据已达门”。本审计在 pre-PLUS `0b54513` 与 exact tree
上分别 fresh 挂载 Q0，并等待相机完全收敛；两帧的玩家位置、相机位置、FOV、viewport
完全相同：

```text
player = (140, 18)
camera = (152.29, 5.95, 36.39)
FOV = 42
viewport = 1440×900
```

整帧对照中，主楼仍是同一条宽阔百叶女儿墙。PLUS 可归因变化仅为顶部导航/提示条附近
露出的一小段青色圆弧；螺旋光带、肩块、塔身、桅杆、信标和东书挡没有形成可在整帧中
独立读出的“塔-低-挡”轮廓。必须查看放大裁切或实现说明才知道该圆弧属于螺旋塔，这与
§8 要求的 whole-frame 可读性相反。既有 `CARCONCEPT GARAGE` 招牌可认楼，但不是 PLUS
贡献，不能代替新轮廓。

robot-idle 中目标楼仍完全不入帧；concept POI 又把 18m 以上的新段裁出画面。于是 PLUS
没有一个正常整帧同时清楚显示其主张的轮廓组。独立 V4 维持 **71**，不升到 72。

独立向量：

```text
V1 65 / V2 75 / V3 69 / V4 71 / V5 70 / V6 73 / V7 76

65×.20 + 75×.20 + 69×.15 + 71×.15 + 70×.15 + 73×.10 + 76×.05
= 70.60 → 71/100
```

实现记录已补齐总分自评 71，故双评门本次可计算且通过；但 `|Δ|≤5` 只验证自评合理性，
不能覆盖 V4 独立专项门。综合 92.8 同样不能覆盖 V4。

因此裁决为 **NO-GO（V4=71）**。生产
`docs/research/cyber-city-visual-rubric-score.json` 保持 AL-BL1 的 **70**，不登记本
NO-GO 候选分。

## 1. exact integration tree 与边界

### 1.1 合流四元组

- candidate：`fcdfcb5b038069bfce24eb62e112f2ff63d148ab`；
- 锁定 `main`：`6bd9ca626c025386ab543f98b335ba0a3772cdb2`；
- merge-base：`b9a6edb3bbfbe167461635f13d316f4a4cbcd0a7`；
- detached exact integration：`a8bc89d05e818bb0757b96fd1d4312c85481423a`；
- exact tree：`fda022f1d89b530cfa5298355decf6fff6d8f8c7`。

唯一内容冲突仍是编排看板
`docs/research/cyber-city-score-loop-orchestration.md`。exact tree 保留锁定 main 的较新
看板全文；候选其余字节原样进入集成树。该 detached merge 不推送。

### 1.2 PLUS 业务补洞面

相对 pre-PLUS 清账点 `0b54513..a1362b4`，PLUS 修改六个文件：

| 状态 | 文件 | 内容 |
|---|---|---|
| A | `docs/research/cyber-city-bl2-plus-implementation.md` | 自评、投影论证、证据与复验记录 |
| M | `docs/spec/asset-ledger-cyber-city.md` | 更新 PLUS 资产读数 |
| M | `public/models/concept-garage/ConceptGarage.glb` | 146,464 B → 148,240 B |
| M | `public/models/concept-garage/README.md` | 新包络、SHA、复现说明 |
| M | `src/lab/world/city/HeroBlenderMesh.ts` | 台账/体积注释读数 |
| M | `tools/blender/generate-concept-garage.py` | 西肩、螺旋塔、桅杆、东书挡 |

候选没有修改相机、楼位、tone mapping、poster、HUD 或第三栋楼。

### 1.3 受保护面与锁定 SHA 污染

| 受保护面 | `main..exact` | 判定 |
|---|---:|:---:|
| `e2e/` | 0 | ✅ |
| `playwright.config.ts` | 0 | ✅ |
| `lighthouserc.json` | 0 | ✅ |
| `.github/workflows/` | 0 | ✅ |
| `scripts/` | 0 | ✅ |

但 `fcdfcb5` 的 docs 回填提交同时改写了
`docs/spec/assets/e2e-batch1/` 与 `docs/spec/assets/e2e-integration/` 下 **24 张**历史取证
PNG；这些文件与 PLUS 业务无关，且实现记录末尾声称“像素基线零改动”。PR 分支后续
`dbc47c3` 已回滚这些字节，但本任务锁定对象是 `fcdfcb5`，不能用后续提交替换被测树。
因此锁定 candidate 仍不满足零无关取证面污染的合流纪律。

全量 e2e 本身又在 detached worktree 重写 15 张历史取证图；这些测试副产物未进入
exact commit，也未进入审计分支。

## 2. §8 whole-frame 专项裁定

### 2.1 robot-idle 几何主张

候选给出的地块与相机关系与代码一致：目标楼世界 x 约为 110–170，而 robot-idle 视轴
朝主轴道路；目标楼最近角点仍远在右裁剪面外。fresh exact robot-idle 也没有目标楼像素。
抬高 z 只能改变垂直投影，不能修复约 35° 的水平视锥缺口。

所以本复审接受以下事实：

- 不改相机/楼位时，robot-idle 不可能成为 concept-garage 新轮廓证据；
- 实现没有借这个事实主张 robot-idle 已变化；
- 可用另一个稳定、非 concept 近景的固定整帧来证明沿街收益。

### 2.2 `?poi=work-gallery` 是否属于合格替代场地

它属于既有 `?poi=` 出口，玩家在 `(140,18)`，目标楼中心在 `(140,-44)`，不是
`?poi=concept-garage` 的门前近景；整帧同时包含目标楼整面、相邻 autodrive-lab、
道路、车辆、湿地反射和 HUD。该帧原则上满足“固定、可复现、whole-frame、非目标近景”
四项，因此不是因为换了机位就自动判失败。

### 2.3 实际帧为何仍失败

同位置、同相机、同 FOV 的 fresh 前后帧显示：

- pre-PLUS：宽百叶屋顶线 + 一根细桅杆/点状信标；
- exact：宽百叶屋顶线基本不变；画面顶缘新增一小段被裁切的圆冠青弧；
- 设计清单中的肩块、塔身、螺旋光带、完整桅杆/信标、东书挡，未在 whole-frame 中形成
  可读组合；
- 放大天际线裁切能发现差异，但 §8 要求是不借助裁切即可辨认；
- concept POI 的新增段全部在帧顶之外，robot-idle 又完全不含目标楼。

因此替代场地**可接受**，当前构图结果**不达标**。这不是坚持 robot-idle 唯一场地，而是
对提交方自行选择的 `work-gallery` 场地按 whole-frame 原标准审查。

## 3. Rubric v1.1 独立视觉复评

沿用首审同一把秤：先看 fixed robot-idle、concept POI、autodrive POI、
work-gallery 前后整帧，再核代码；不因 72 门线调秤。

| 维 | AL-BL2 首审 | PLUS 独立 | 依据 |
|---|---:|---:|---|
| V1 首幕构图 | 65 | **65** | robot-idle 零可归因变化；相机、主体、poster、HUD 零改 |
| V2 光照材质 | 75 | **75** | 新件只复用既有材质；没有新增帧内可读材质层或全局光照提升 |
| V3 色彩氛围 | 69 | **69** | 蓝色纪律未破坏，但 whole-frame 新蓝仅顶缘小弧，不足以改变氛围层 |
| V4 场景密度 | 71 | **71** | 第二栋实模 POI 价值仍成立；PLUS 轮廓组在正常整帧不可读，不能补上首审唯一卡项 |
| V5 动效转场 | 70 | **70** | 无新动画、运镜或转场 |
| V6 UI/HUD | 73 | **73** | DOM/HUD 零改；既有楼名牌不重复计分 |
| V7 原创叙事 | 76 | **76** | “螺旋停车坡道”概念在代码/放大裁切成立，但正常帧不能把小冠弧读成车库图腾 |

raw 仍为 **70.60**，四舍五入 **71/100**。

### 3.1 双评门

实现记录 §6 的总分自评为 **71**（raw 70.80），独立为 **71**（raw 70.60）：

```text
|self - independent| = |71 - 71| = 0 ≤ 5
```

V4 自评 72 与独立 71 的差为 1，也在 ±5 内。但专项门要求“独立 V4=72–75”，不是要求
自评与独立接近即可；所以双评通过、专项门失败可以同时成立。

## 4. exact-tree 质量门

### 4.1 build / check / links / budget

- `astro check`：129 files，**0 errors / 0 warnings / 58 hints**；
- build：19 pages；
- links：19 HTML、347 条内部引用，全通过；
- `/` 壳：**86.5/90KB gzip**，poster **39.7/40KB**；
- world JS：**86.0/900KB gzip**；
- world 资产池：**5.5/12MB**；
- public：**9.1/40MB**；
- `.blend/.wav/.band/*encoder*` 黑名单：0。

全部阻断预算通过。

### 4.2 全量 e2e 与 smoke3d

在 detached exact tree、隔离 preview 端口 `4393` 运行完整五 project 链：

- **52 passed / 0 failed / 0 skipped / 0 flaky**；
- 本地 `retries=0`；
- Playwright 墙钟 **18.4m**，质量链记录 e2e 阶段 1107s；
- `VIS-02/03/04 @smoke3d`：**3/3**；
- WS-PERF-01 的 SwiftShader 约 2.1fps 为既有 OBS 软告警，不阻断。

### 4.3 LHCI 隔离端口纠偏

仓库 `run-quality-loop.mjs --full` 的 preview/e2e 会读取 `E2E_PORT=4393`，但 full 模式
没有覆盖 `lighthouserc.json` 内硬编码的 `4321` URL。因此一键链随后采集到的 4321
结果不作为本审计证据。

本审计清空 `.lighthouseci` 后，对 exact preview 显式传入七个 `4393` URL，各跑 3 次：

- collect exit **0**，21 LHR；
- assert exit **0**；
- `/website/` Performance / Accessibility / Best Practices / SEO：
  **100 / 100 / 100 / 100**（各三轮均 100）；
- `/website/home/`：**100 / 100 / 100 / 100**（各三轮均 100）；
- 相对 AL-BL1 两 URL 四项全 100：零下降。

## 5. hero 运行时合同 fresh probe

| 场景 | 请求/场景树实测 | 判定 |
|---|---|:---:|
| Q0 `work-gallery` | 两个 hero GLB 均请求；autodrive/concept hero present+visible；对应程序化 tower present+invisible | ✅ |
| Q2 `concept-garage` | hero GLB 请求 `[]`；两 hero absent；两程序化 tower present+visible；host ready | ✅ |
| 主动 abort ConceptGarage | autodrive hero visible/tower invisible；concept hero absent/tower visible；host ready；失败 warning 命中 | ✅ |

Q0 WebGL2 下可见的 reflector feedback-loop warning 在 pre-PLUS 与 exact 都出现，不是
PLUS 新增错误；本轮不把既有软渲染告警冒充资产回退失败。

## 6. GLB、复现与资产台账

### 6.1 独立二进制解析

| 项 | exact 实测 | 合同 | 判定 |
|---|---:|---:|:---:|
| 文件体积 | **148,240 B** | ≤10MB | ✅ |
| indexed triangles | **2,928** | ≤100,000 | ✅ |
| mesh / primitive / material | 13 / 13 / 13 | — | ✅ |
| Draco | 13/13 primitive | 必须 | ✅ |
| KTX2 | 3/3 image | 必须 | ✅ |
| 贴图尺寸 | 1024² / 256² / 1024² | 每张 ≤2K | ✅ |
| extensionsRequired | Draco + BasisU | 两者齐 | ✅ |
| GLB SHA-256 | `2f529589070bd239149116eaf6a5b0e761c36af1c4efca5a3bd0483314058303` | 留档 | ✅ |

### 6.2 fresh 可复现性

审计机使用 Blender 4.0.2、toktx 4.3.0、gltf-transform CLI 4.4.2，fresh 执行 README 的
Blender → ETC1S quality 255 → Draco 三段管线。重建结果仍为 **148,240 B**，SHA-256
与入库文件完全一致。

### 6.3 台账

`public/models/concept-garage/README.md` 与
`docs/spec/asset-ledger-cyber-city.md` 已登记原创来源、许可、路径、体积、tri、
Draco+KTX2、贴图尺寸、坐标/包络、复现命令和 SHA。首审资产治理缺口已关闭。

## 7. 统一计分器

| 维度 | exact 分数 | 权重 | 加权 |
|---|---:|---:|---:|
| LHCI `/` | 100 | .25 | 25.00 |
| LHCI `/home/` | 100 | .15 | 15.00 |
| e2e | 100 | .20 | 20.00 |
| 独立视觉 | **71** | .25 | 17.75 |
| smoke3d | 100 | .15 | 15.00 |
| **合计** |  | **1.00** | **92.75 → 92.8** |

```text
node scripts/score-loop.mjs --visual-score 71
COMPOSITE_SCORE=92.8
availableWeight=1
missing=[]
```

## 8. 硬门逐行

| 硬门 | 实测 | 判定 |
|---|---|:---:|
| exact tree e2e 52/52 | 52 passed，0 failed/skipped/flaky | ✅ |
| smoke3d | VIS-02/03/04 = 3/3 | ✅ |
| LHCI `/`、`/home/` 不降 | exact port 4393，两 URL 四项三轮全 100 | ✅ |
| `availableWeight===1`、`missing=[]` | `1`、`[]` | ✅ |
| 综合 ≥85 | 92.8 | ✅ |
| 自评/独立 `|Δ总分|≤5` | `|71-71|=0` | ✅ |
| V4 独立 72–75 | **71** | ❌ |
| whole-frame 新轮廓可读 | fixed street 帧只见被裁切冠环弧；组合轮廓不可读 | ❌ |
| GLB ≤10MB / ≤100k tri | 148,240 B / 2,928 tris | ✅ |
| Draco + KTX2 | 13/13 Draco；3/3 KTX2 | ✅ |
| Q2 heroGlb zero-request | `[]`，两程序化 tower visible | ✅ |
| 新楼加载失败 fallback | concept tower visible，autodrive hero 不受影响，host ready | ✅ |
| 资产 README + 正本台账 | 完整且 fresh SHA 可复现 | ✅ |
| 受保护代码/门槛面零差异 | e2e/config/LHCI/workflow/scripts 均 0 | ✅ |
| 锁定 candidate 无无关取证图污染 | `fcdfcb5` 含 24 张历史 PNG 改写 | ❌ |

## 9. 裁决与最小补洞

裁决：**NO-GO，V4=71**。不得合流 PR #43，不更新生产 score JSON。

最小补洞：

1. 可以继续使用固定 `?poi=work-gallery` 作为 whole-frame 场地，不要求追逐几何上不可达
   的 robot-idle；但须让正常 1440×900 整帧直接读到至少“塔身/螺旋带 + 屋顶阶差”
   的组合，而不是只在顶缘露出被裁切冠环；
2. 重拍 settled fixed camera 的 pre/post 整帧；前后相机位置、FOV、viewport 必须相同，
   放大裁切只作辅助，不能替代整帧；
3. 若 GLB 字节变化，按 AL-BL2 §8.5 重跑资产解析/复现、fresh Q0/Q2/abort、52/52 与
   exact-port LHCI；
4. 候选 SHA 必须包含对 24 张历史取证 PNG 的回滚；`dbc47c3` 虽已在 PR 分支出现，但它
   不属于本次锁定 `fcdfcb5`，复审时须明确锁定新 SHA。

## 10. 证据路径与 digest

| 证据 | 路径 | SHA-256 |
|---|---|---|
| settled work-gallery whole-frame 对照 | `/opt/cursor/artifacts/cc-al-bl2-plus-reaudit-work-gallery-comparison.png` | `baf9a984692bfa088d48692d0842a9ebf5bc2dc4bfff2bbd4493e59342df8cc2` |
| settled 天际线辅助放大 | `/opt/cursor/artifacts/cc-al-bl2-plus-reaudit-skyline-comparison.png` | `8bceea7c0b01c40e05bab46e8bd580bad2a12cbd4d68166f76d7d27cafcb1c55` |
| exact robot-idle | `/opt/cursor/artifacts/cc-al-bl2-plus-exact-robot-idle.png` | `75664e87d2fcecfa8a6eb8792f08f631df6fadca62e29971a22dbdeb0ad09e65` |
| exact concept POI | `/opt/cursor/artifacts/cc-al-bl2-plus-exact-concept-poi.png` | `047d5c05a8709cfe67c4068419d1dcea877a3cdae16c52a9529473bf48b6951b` |
| exact autodrive POI | `/opt/cursor/artifacts/cc-al-bl2-plus-exact-autodrive-poi.png` | `d80814fddd15a457da85519dd3ec151ed3be957a11a3bd555efde748e1be3a7d` |
| Q2 fallback | `/opt/cursor/artifacts/cc-al-bl2-plus-exact-q2-fallback.png` | `0870a9c3756889be343ccf1b7bff89c0c9a1395580ea60a8f0296d04d170757a` |
| abort fallback | `/opt/cursor/artifacts/cc-al-bl2-plus-exact-load-failure.png` | `581ddbcf1313ae85bacfd930041269061ddc3180a535e0b16eb8de56fad6e283` |
| full quality-loop 日志 | `/opt/cursor/artifacts/cc-al-bl2-plus-reaudit-quality-loop-full.log` | `b2dac4d9e839bed64012b3f20ce4788e9ef8de50c259545da006c676291a86dd` |
| exact-port LHCI 日志 | `/opt/cursor/artifacts/cc-al-bl2-plus-reaudit-lhci-4393.log` | `149b4c7950a9186ec8b0f7c44bad17b3f878cc8a73fd65a52fea1e583c986f78` |
| GLB fresh 重建日志 | `/opt/cursor/artifacts/cc-al-bl2-plus-reaudit-asset-reproduction.log` | `fc6c090174c9acb57ec38783f8b02a12177848ef48fcfdab79e0b95dbe552870` |
| 52/52 + LHCI 数值摘要 | `/opt/cursor/artifacts/cc-al-bl2-plus-reaudit-gate-summary.log` | `d7074def5d7c81c7ecf04f37b35584517feb7d5484c37c754d44d37f341241cf` |
| 独立计分日志 | `/opt/cursor/artifacts/cc-al-bl2-plus-reaudit-score.log` | `472f7834716320424d32f8c868931ee540d7a7ada4f6ccc6e38bf1772a205458` |

---

*CC-AL-BL2 复审 · 审计分支只提交本报告，并把历史审计分支遗留的 NO-GO score JSON
恢复到生产登记 AL-BL1 70；零业务代码、测试逻辑、阈值、workflow 或像素基线改动。*
