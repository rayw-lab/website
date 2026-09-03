# AH-AUDIT · PR #234 合入前独立审计

- 席位：Grok 4.6 xhigh · fresh · 只读
- 审计时间：2026-09-03T10:28:13Z
- 工作树：`/Users/wanglei/studio-data-root/worktrees/website-about-hall`
- 分支：`codex/about-hall-20260902`
- HEAD：`985d338d168f96d1c8e87195dd84cf06f0e3e3ee`（`Merge remote-tracking branch 'origin/main' into codex/about-hall-20260902`）
- 远端 topic：`git ls-remote origin refs/heads/codex/about-hall-20260902` = `985d338d168f96d1c8e87195dd84cf06f0e3e3ee`（与本地 HEAD 一致）
- 远端 `main`：`26f1e5df98bf1e781c49c5c6f397f53fd096b204`（本地 `origin/main` 同 SHA；`git merge-base --is-ancestor origin/main HEAD` = YES）
- e2e 进度快照（不等结束）：pid `84264`（`~/.codex/state/about-hall/e2e.pid`）仍在；命令 `env -u CI E2E_PORT=4645 pnpm exec playwright test --workers=1 --retries=0`；`127.0.0.1:4645` LISTEN；`4321` 空闲。日志 `evidence/about-hall/W6/full-e2e.attempt8.log`：**✓ 51 / ✘ 0**，最后一例 `CITY-BGM-01` 用例 2；无 `EXIT=`。进程 etime ≈ 17:32。本裁决**不含** attempt8 终局与 CI 绑定 SHA。
- 工作区脏文件（未进 HEAD / 未进 PR）：`docs/spec/assets/e2e-batch1/` 7 张 PNG 被 attempt8 改写；`evidence/about-hall/GATE.json` 仅 `generatedAt` 时间戳；未跟踪 `full-e2e.attempt8.log`。

口径：不采信 worker/指挥官总结。数字均来自本席当场命令。查不到标 UNVERIFIABLE。

---

## 检查表

| # | 检查项 | 命令 | 输出摘录 | 判定 |
|---|---|---|---|---|
| 1 | 渲染树零 `[[占位`（ADR-4 C.1） | `rg '\[\[占位' src/ dist/` | `src/` 0 命中；`dist/` 0 命中。`docs/` 仅 ADR/INDEX/HANDOFF 讨论该字面 | **PASS** |
| 2 | 布局票 AH-T1a 在 git log | `git log --oneline -40`；`git show 5c7087f --stat` | `5c7087f feat(city): AH-T1a about-pavilion to north slot (-44,-150)…`；`about-pavilion.position = {x:-44,z:-150}`；quest 首站见该 commit | **PASS** |
| 3 | 转场票 AH-T1b 在 git log | 同上 | `df497c4` 机位 + hold 脉冲；`1963f7b` hold 断言改状态语义 | **PASS** |
| 4 | 视频/i2v 瘦身进仓（ADR-4 C.4，不挡合流） | `git log --oneline` + 媒体清单 | `909a209` W1h：`hero-s0-720p.mp4` 1054456 B、`transition-s6-720p.mp4` 2091449 B 在 `public/media/about-hall/` | **PASS** |
| 5 | 馆长契约 AH-W3e / ADR-5 A | `git log`；dist HTML | `5c5ca20`；HTML 有 `data-curator` + 初始 JS 按 scene 写 `data-curator-pose` | **PASS** |
| 6 | INDEX 登记到 L11 | 读 `ABOUT-HALL-INDEX.md` L1 | 页眉 `CURRENT AUTHORITY · 2026-09-03 17:50 · L11`；票册含 T1a/T1b/QE/M0/W1g/W1h/VIS-1/W3e/D5 | **PASS**（内容漂移见 #7） |
| 7 | INDEX / LOOP-LOG 与 `git log --oneline -40` 列对齐 | 对照票状态 vs commit | **漂移 1**：INDEX `AH-VIS-2` = DISPATCHED，LOOP-LOG L11「VIS-2 在途」，但 HEAD 已有 `b09de11 style(about-hall): AH-VIS-2… 18/18`。**漂移 2**：INDEX 两行都叫 `AH-D1`（W0 化身 ADR vs W7 文档同步 `c9d5745`）。**漂移 3**：AH-W4 目标句仍写「+ 9:16」，ADR-5 C 要求改为「9:16 已由 ADR-5 豁免」。**漂移 4**：LOOP-LOG 顶部看板标题仍是「看板（L1–L10）」且表内只有 L1/L2 两行，ADR-5 C 要求顶部加 L11 行（L11 只在「逐 loop」正文） | **FAIL**（文档列，不构成产品硬禁） |
| 8 | 远端 SHA = 本地 HEAD | `timeout git ls-remote origin refs/heads/codex/about-hall-20260902 refs/heads/main` | topic `985d338…`；main `26f1e5d…`；rc=0 | **PASS** |
| 9 | 全量 e2e attempt8 在跑（不等结束） | `pgrep -af 'playwright test'`；读 pid；`lsof :4645`；读 log | pid 84264 活；端口 4645；✓51 / ✘0；无 EXIT | **PASS**（在跑；终局不在本席） |
| 10 | 展厅 HTML + 初始静态 JS 不含 `lab/world` `three/webgpu` `WebGPURenderer` `rapier` `@dimforge` | 读 `dist/world/about-pavilion/index.html` + 其 3 枚 `<script src>` | HTML 与 `Hero.*.js`(1232B) / `Curator.*.js`(2145B) / `Transition.*.js`(603B) 零命中。Curator 初始脚本只 `import('./curator.NflokIZx.js')` 懒加载 three，不在初始静态集 | **PASS** |
| 11 | 无 `models/` preload | HTML `<link rel=preload>`；`extractPreloadAndScriptUrls` 口径 | preload 仅两枚字体 woff2。无 `rel=preload` 指向 glb。存在 `data-model="/website/models/hero-robot/HeroRobot.glb"`（属性指针，非 preload）。G-Hall-5 只扫 script/preload URL，与现树一致 | **PASS**（见 P2：TECH-ARCH 把「HTML 零 models/」写过宽） |
| 12 | `src/components/city/halls/**` infinite 循环动画 ≤5 | `rg infinite` halls + `hall.css` + `HallChrome.astro` | 2 处：`hall.css:250` `hall-scroll-nudge … infinite`；`HallChrome.astro:134` `hall-chrome-pulse … infinite` | **PASS** |
| 13 | 六站文案无年份 `20[0-9]{2}` | `rg '20[0-9]{2}' src/data/about-copy.ts src/components/city/halls/about` | 0 命中。`about-copy.ts` 仅有「十余年」（非年份字面） | **PASS** |
| 14 | 密钥字面 `api_key\|sk-[a-z0-9]{8}\|ark-[a-z0-9]{8}` | `rg -i` 于 `src public scripts e2e`（排除 lock/docs/dist） | 代码面 0。仓内命中 = charter 把门正则写进文档 + `pnpm-lock.yaml` 包名误撞（非密钥） | **PASS** |
| 15 | 媒体清单 bytes/sha256 vs `public/media/about-hall/` | 自算 `hashlib.sha256`；主键 = `src16x9` 否则 `poster` | 9/9 条 bytes+sha 全等。磁盘 10 文件（含 `transition-s6-poster.webp` 作为 S6 poster）。唯一文件合计 **3379813 B = 3.223 MB** ≤ 6 MB（6291456）。无 orphan。无 `src9x16` 字段。无 `*portrait*` 文件 | **PASS** |
| 16 | 无 `src9x16` / portrait 文件（ADR-5 B） | `find public/media/about-hall -iname '*portrait*'`；ledger 字段 | 0 文件；ledger 无该键 | **PASS**（门脚本对非空 `src9x16` 只做文件对账、不按 ADR-5 直接 FAIL，见 P2） |
| 17 | `deepLink` 仍 `/about/` | 读 `cyber-city-buildings.json` about-pavilion | `"deepLink": "/about/"`；`"hallPath": "/world/about-pavilion/"` 加法 | **PASS** |
| 18 | `spawn` (0,0) heading 0 未动 | `git show origin/main:…` vs HEAD | `world.spawn = {position:{x:0,z:0}, heading:0}` 与 `origin/main` 逐字段相等 | **PASS** |
| 19 | `camera-shots.json`：`ritual_idle` 未动；只新增 about 机位 | Python 对 `origin/main` 结构 diff | 新增且仅新增 `poi_showcase-about-pavilion`。既有 shot 零内容差。`ritual_idle` 相等 = True。顶层另改 `updatedAt` 2026-08-27→2026-09-03（元数据，非机位） | **PASS** |
| 20 | PR #234 卫生 | `gh pr view 234 --json …` | title `feat(about-hall): 第一栋楼「我是谁」展厅…`；**isDraft=true**；state OPEN；additions **77900** / deletions **346** / changedFiles **298** / commits **34**。本地 `git diff --shortstat origin/main...HEAD` = `298 files changed, 77900 insertions(+), 346 deletions(-)` → 计数与 API 一致。body 仍写「about-hall.spec.ts **7 例**」「attempt5 **93 passed**」「**attempt6 正在跑**」「视频待 **ZDR** 解除」「六站 `[[占位]]` 事迹灌输」——与现 HEAD 不符（spec 16 `test(`；视频已进仓；占位已删；attempt8 在跑） | **FAIL**（body 过期；文件计数本身一致） |
| 21 | 仍 Draft | 同上 `isDraft` | true。合入权仍 NEEDS_LEIGE，Draft 本身不是缺陷 | **PASS**（状态符合未点 merge） |
| 22 | 分支保护 required checks | `gh api repos/rayw-lab/website/branches/main/protection` | `required_status_checks.strict=true`；contexts = `门禁（check / build / links / budget / lighthouse）`。`gh pr checks 234` 该检查 **pass**（completed 2026-09-03T10:05:18Z）。`actions/runs/33741930438` 的 `headSha` 字段为 null → **CI 是否跑在 985d338 上 UNVERIFIABLE**（按派单：CI 终局由指挥官补核） | **PASS**（名单可读）；SHA 绑定 **UNVERIFIABLE** |
| 23 | 回归面 `src/lab/world` | `git diff --stat origin/main...HEAD -- src/lab/world` | 8 文件 +337/−7。见下节 | **PASS**（有回归风险，不是硬禁违规） |
| 24 | TECH-ARCH 预算 vs `about-hall-gate.mjs` 常量 | 读两边 | 门：`MEDIA_CAP_BYTES = 6 * MB`；`PLAYER_TARGET_BYTES = 20*KB` / `PLAYER_CAP = 50*KB`。TECH-ARCH §6：总载荷 ≤6MB、Hall-S ≤50KB gzip、首屏 mp4 ≤2.0MB、过渡 ≤3.5MB。现树 hero 1.05MB / S6 2.09MB 均在段上限内。残差：TECH-ARCH §1 仍写「移动端 → 9:16 `<source media>`」；§4 写 HTML「零 `models/`」；§6 总载荷仍标「草案」 | **PASS**（常量对齐）；文案残差见 P2 |
| 25 | README 新增四节抽 5 句核仓内出处 | 读 README L18–45 + grep/json | ① Q/E 120°/s、±135°、0.35s 回正 → `View.ts` `LOOKAROUND.rate/maxYaw`，`returnRate=8` 在 0.35s 收敛 ≈93.9%（注释写 95%/0.35s）。② 12 栋 + 8 预留槽 → `buildings.length=12`，`reservedSlots` 8 个 `slot-13..20`，`maxBuildingSlots=20`。③ about 北槽 `(-44,-150)` → JSON 实测。④ 400ms 霓虹脉冲 → `PoiArrival.ts` `HOLD_OVERLAY_MS = 400`。⑤ `/about/` LHCI 100×4 → `evidence/about-hall/VIS-1/RECEIPT.md` 三跑全 100。第六句「静态 JS gzip 仅 1.7KB」= W1h G-Hall-6 **1725 B**；现树三枚初始脚本 gzip9 **2053 B**（馆长初始 JS 已变） | **PASS**（5 句有出处）；1.7KB 句过期见 P2 |

---

## 回归面 · `src/lab/world`（相对 `origin/main...HEAD`）

`git diff --stat origin/main...HEAD -- src/lab/world`：

```
 src/lab/world/areas/Areas.ts      |  13 ++++-
 src/lab/world/areas/PoiArrival.ts |  89 ++++++++++++++++++++++++++++-
 src/lab/world/arrival-snapshot.ts | 114 ++++++++++++++++++++++++++++++++++++++
 src/lab/world/city/CityBlocks.ts  |   6 +-
 src/lab/world/city/CityMap.ts     |   5 ++
 src/lab/world/player/Player.ts    |   8 +++
 src/lab/world/view/View.ts        | 105 ++++++++++++++++++++++++++++++++++-
 src/lab/world/world/Reveal.ts     |   4 +-
 8 files changed, 337 insertions(+), 7 deletions(-)
```

路径在 `view/` `player/` `areas/` `world/`，任务书点名的 `View.ts`/`Player.ts`/`PoiArrival.ts`/`Reveal.ts` 均存在，只是目录更深。

| 文件 | 改了什么（3 行） | 是否可能打到非 about 楼既有 e2e |
|---|---|---|
| `view/View.ts` | 加 `LOOKAROUND` 单源（120°/s、±135°、指数回正）；`updateLookaround` 仅 `car_ready\|driving` × third × 无 shotBaseline。门外 yaw 写回精确 0 | **是**。全城第三人称驾驶相机解算。QE spec 覆盖；仍依赖 attempt8 的 world 项目 |
| `player/Player.ts` | 注册 `lookLeft=KeyQ` / `lookRight=KeyE`，categories=`driving`；注释声明不进 DRIVE/RELEASE，圈内 E 由进站前奏抢相机 | **是**。KeyE 与 `poiInteract` 物理共存。状态机优先级若漏，会打 CITY-PA / 进站 e2e |
| `areas/PoiArrival.ts` | hold 起帧挂 400ms 楼色 DOM 脉冲（单 hex、RM 不挂、中断即卸）。不改 tween 0.8s / hold 0.4s 游戏秒 | **是**。所有楼进站前奏同路径；已有 T1b 状态语义用例。脉冲 CSS 注入 `documentElement` |
| `world/Reveal.ts` | 提示串尾加「Q/E 视角侧转」 | 低。文案，可能碰 hint 快照类断言 |
| `city/CityBlocks.ts` | `firstFrame/roof` 从 `now-signal` 挪到 `about-pavilion`（北槽立面） | **是**。南槽 now-signal 不再带 firstFrame；可能碰开幕入帧/招牌计数（VIS-1 已把 about 立面身份感 BLOCKED→W8） |
| `city/CityMap.ts` | `Building.hallPath?: string` 加法 | 低。类型加法；无 hallPath 的楼走旧 deepLink |
| `areas/Areas.ts` | navigate 前 `snapshotArrival`；`dest = hallPath ?? deepLink`；URL 一律 `?from=city&poi=` | **是**。全城 E 进站 URL 形态变了。NAV_ROUTE 已在 `f6d9ed8` 容纳 query；attempt8 的 poi-arrival/minimap 是真回归面 |
| `arrival-snapshot.ts` | 新文件。写 `sessionStorage['world-arrival-v1']`，失败静默 | 低（新键）。HallChrome / about-hall spec 消费；不写 localStorage |
| `src/pages/index.astro`（非 world，但同 PR 城 HUD） | `.hint` 从顶栏改到底部，让开任务胶囊 | 中。可能碰 HUD 几何/截图类 city e2e，属样式 |

`index.astro` 不在 `src/lab/world` 统计内，但 VIS-1 动了首页 hint，一并登记。

---

## 文档漂移补注

- INDEX 票册 34 行 / 33 unique；重复 ID = `AH-D1`。
- ADR-5 C 要求补的 `AH-W6-full-e2e-clean` / `AH-ARCH-SYNC` 没有独立票号，分别并进 `AH-W6` 与第二行 `AH-D1`。
- LOOP-LOG L11 正文存在且引用了 T1a/T1b/QE/W1h/ADR-5/W3e，但顶部压缩看板未升到 L11。
- README 四节出处抽核：5 句可回源；「1.7KB gzip」停在 W1h 收据，现树初始脚本已大于该数。

---

## Register

### P0（阻塞合入）

无。产品硬禁区（占位、WebGPU/rapier 初始集、年份、密钥、媒体 sha/6MB、portrait、deepLink、spawn、ritual_idle）当场复算均过。

> 提醒：ADR-4 决策 C.5「干净端口全量 e2e 0F/0S/0 flaky」按派单**不纳入本裁决**。现树 attempt8 只证明「在跑且前 51 例全绿」，不是 C.5 完成。

### P1（合入前应修）

1. **PR #234 body 过期（范式坑 17：叙事层数字未跟 API）**  
   body 仍写 7 例 / attempt5 93 / attempt6 进行中 / ZDR 待片 / `[[占位]]` 灌输。API 与 `git diff --shortstat origin/main...HEAD` 已是 298 文件 / +77900 / −346；`e2e/about-hall.spec.ts` 现 16 个 `test(`。  
   **修法**：按 `gh pr view --json additions,deletions,changedFiles` + 现 HEAD 重写 Summary/Evidence/NEEDS_LEIGE（视频已进仓、占位已删、attempt8 进行中）。Draft 可保持。  
   **write root**：GitHub PR body（指挥官）；本文件只登记。

2. **INDEX / LOOP-LOG 把已入库的 VIS-2 仍标在途**  
   `b09de11` 在 HEAD 且已 push 到与 HEAD 相同的远端 topic；INDEX L49 `AH-VIS-2 … DISPATCHED`；LOOP-LOG L11「VIS-2 在途」「下一步：VIS-2 收稿」。会触发重派。  
   **修法**：INDEX 该行改 MERGED `b09de11`；LOOP-LOG 顶部看板加 L11 行（ADR-5 C 原文）并把「在途」改收稿。  
   **write root**：`docs/local-cmd/ABOUT-HALL-INDEX.md`、`ABOUT-HALL-LOOP-LOG.md`。

3. **attempt8 正在改写历史 e2e 截图（ADR-4 C.5 明文）**  
   工作区 `docs/spec/assets/e2e-batch1/` 7 张 PNG 相对 HEAD 已变；`GATE.json` 仅时间戳。L10 已有「改写后 checkout 还原」教训。这些文件目前 unstaged，不会自动进 985d338，但若有人 `git add -u` 会污染 PR。  
   **修法**：attempt8 收口后 `git checkout -- docs/spec/assets/e2e-batch1 evidence/about-hall/GATE.json`；禁止把 attempt 产物当业务 diff。  
   **write root**：工作区还原（指挥官）；本文件只登记。

4. **INDEX `AH-W4` 目标句仍含「9:16」**  
   ADR-5 C 票册纠偏表要求写成「触感 + 四态；9:16 已由 ADR-5 豁免」。现句「`/about/` 触感 + 四态降级 + 9:16」。  
   **修法**：改目标句，不改 MERGED 状态。  
   **write root**：`docs/local-cmd/ABOUT-HALL-INDEX.md`。

### P2（W8）

1. **票号 `AH-D1` 双义**（W0 化身 ADR vs W7 文档同步）。W8 把文档票改名为 `AH-ARCH-SYNC` 或 `AH-DOC-1`。write root：INDEX。
2. **TECH-ARCH §1 架构图仍写「移动端 → 9:16 `<source media>`」；§4 写 HTML「零 `models/`」**。现树移动端不投视频；HTML 合法含 `data-model=…/models/hero-robot/…`，门只禁 script/preload。write root：`ABOUT-HALL-TECH-ARCH.md`。
3. **`about-hall-gate.mjs` 未把「非空 `src9x16` 或 `*portrait*` 文件」做成独立 FAIL**（ADR-5 B 原文）。现账本/磁盘已干净，门是漏 enforce 不是现树脏。write root：`scripts/about-hall-gate.mjs`。
4. **README「静态 JS gzip 仅 1.7KB」停在 W1h 1725 B**；现树 Hero+Curator+Transition gzip9 = 2053 B。write root：README 或改口「G-Hall-6 以当场 GATE.json 为准」。
5. **Areas.ts 全城进站带 query + hallPath 优先**：产品意图（ADR-2），但回归面大于 about 一楼。W8 可把「非 about 楼 hallPath 必须为空」做成门。write root：gate 或 e2e 负例。

---

## 裁决

**`GO_AFTER_P1`**

产品硬禁区与媒体对账当场复算通过；远端 topic = 本地 HEAD；PR 仍 Draft；required check 名单可读且最近一次「门禁」绿。不能直接 GO 的原因是 P1：PR 正文数字停在 W6 中段、INDEX/LOOP-LOG 把已提交的 VIS-2 标成在途、W4 目标句未按 ADR-5 去掉 9:16、attempt8 正在改写历史截图（提交前必须还原）。

本裁决不含全量 e2e attempt8 与 CI 结果，两者由指挥官补核。C.5 未完成前不得点 merge；attempt8 终局若非 0F/0S/0 flaky，本席的 GO_AFTER_P1 不能升级为 GO。
