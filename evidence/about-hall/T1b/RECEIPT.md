# AH-T1b receipt — 城市→About 展厅→回城转场（ADR-4 决策 B）

worktree: `/Users/wanglei/studio-data-root/worktrees/website-about-hall`  
date: 2026-09-03  
ADR: `docs/local-cmd/adr/ADR-4-first-building-and-transition.md` 决策 B（L144–238）  
提案: `docs/local-cmd/proposals/AH-T1-transition-concepts.md` 方案 1  
preview: `http://127.0.0.1:4634/website/`（Python `http.server` pid **50823**；收工已按 pid 杀掉）

**依赖 T1a**：本票开工时 JSON 已是北槽 `about-pavilion position (−44, −150)` / `parkingBay (−20, −150) heading 270`。showcase 锚 `buildingId`，随楼走。未改 `cyber-city-buildings.json` / `CityBlocks.ts` / `world-pois.json`。

未改：`Hero.astro`、`spawn` / `ritual_idle`、`deepLink` 与 `?from=city&poi=`、`arrival-snapshot.ts` 字段集、named View Transition、音频。未占 4321。未 commit/push。

## 改动文件（本票 write root）

```
 e2e/about-hall.spec.ts               |  43 +++++++++++++
 e2e/cyber-city-poi-arrival.spec.ts   | 114 +++++++++++++++++++++++++++++++++++
 src/components/city/HallChrome.astro |  44 +++++++++++++-
 src/data/camera-shots.json           |  18 +++++-
 src/lab/world/areas/PoiArrival.ts    |  83 ++++++++++++++++++++++++-
 5 files changed, 298 insertions(+), 4 deletions(-)
```

另有未跟踪 `evidence/about-hall/T1b/**`。`evidence/about-hall/GATE.json` 被 `about-hall-gate.mjs` 回写（门脚本副作用，非本票 write root）。

## 机位 `poi_showcase-about-pavilion`

| 项 | 值 |
|---|---|
| mode / status | `poi` / `proposal` |
| anchor | `{ type: building, buildingId: about-pavilion }` |
| spherical | `phiDeg 75` · `thetaDeg 76` · `radius 102` |
| lookAtHeight | `10` |
| lateral | `−14`（负侧移把东立面门廊推到画面右约 1/3；提案旧南槽草图 `lateral: 3.8` 不适用北槽） |
| camera | `(48.211, 26.400, −112.581)` → lookAt `(−47.387, 10.000, −136.416)` |
| NDC | 门廊约 `+0.36`；楼 `ndc.x ∈ [−0.118, 0.711]`；`8/8 inFrame`；`maxAbsNdcX 0.711 ≤ 0.85` |
| audit | `node tools/camera/audit-shot-ndc.mjs --shot poi_showcase-about-pavilion` → **2/2 PASS** |

构图：泊车圈外沿东南斜后方高位偏轴，左侧留暗天——对齐 Hero「左文右景、角色在光缆桥右侧」。未改 `Hero.astro`。

## Overlay（PoiArrival）

| 项 | 落地 |
|---|---|
| 触发帧 | tween `t>=1` 切 `phase='hold'` 的同一帧 `mountHoldOverlay()`；done 重试直切 hold 同挂 |
| 时长 | 墙钟 **400ms**（`HOLD_OVERLAY_MS`）。`HOLD_DURATION` 仍为 **0.4 游戏秒**，数字未改 |
| 形态 | `html.world-poi-hold-pulse::after` inset box-shadow；暗底不动；一次 `ease-out`；**无 infinite**；不进 CITY-03 |
| 颜色 | `map.buildings[].neonColor` → CSS var `--poi-hold-neon`。about = JSON `#fef3c7`。**禁止第二份 hex** |
| 卸类 | ① `setTimeout 400ms` ② 每 tick `performance.now()` 墙钟到期（Playwright 后台页会钳短定时器）③ `interrupt`（RELEASE_ACTIONS / teleport）④ `finish` ⑤ `dispose`。已挂类则禁止 clear+重挂（防定时器重置导致类永不卸） |
| reduced-motion | 构造期 `matchMedia`；`mountHoldOverlay` 早退，**不挂类** |
| 样式入口 | 与 Reveal/DriveFeedback 同款 `document.head` 注入（`world-poi-hold-style`），无 named VT |

## 到达条文案（HallChrome）

ADR-4 L174–178 模板，只消费 `world-arrival-v1` 已有键：

1. 有 `maxKmh` → `最高巡航 ${Math.round(maxKmh)} km/h`
2. 否则 `coneHits > 0` → `途中碰倒 ${coneHits} 个锥桶`
3. 保底：既有 `探索 n/N`（`world-explore-v1`）。完整快照也保留探索行，避免旧「有卡含探索」回归

圆点仍 `building.neonColor`（about `#fef3c7`）。出现时 `hall-chrome-in` ≤400ms 淡入；`prefers-reduced-motion` `animation: none`（既有 `getAnimations()===0` 不放宽）。

## 验证

| 步 | 结果 |
|---|---|
| `pnpm exec astro check` | 0 errors / 0 warnings / 60 hints（既有 + 本票 evidence 脚本） |
| `pnpm build` | 20 page(s) |
| `node scripts/about-hall-gate.mjs` | G-Hall-1..9 全 PASS |
| NDC about showcase | 2/2 PASS |

**4634 伺服**：票面 `pnpm preview --port 4634` 当时与另一预览抢 Astro 锁（4633）；改为 Python `http.server` 绑 `127.0.0.1:4634`，根 `/tmp/ah-t1b-preview4634/website` → worktree `dist/`。MIME 正常。pid 文件 `~/.codex/state/about-hall/preview-4634.pid`。

## e2e

票面命令缺 `--no-deps` 会把 world-chromium 的 car/desktop/mobile 依赖链整表拉进来。本票：

```
env -u CI E2E_PORT=4634 pnpm exec playwright test \
  e2e/about-hall.spec.ts e2e/cyber-city-poi-arrival.spec.ts \
  --workers=1 --retries=0 --reporter=list --no-deps
```

**13 passed / 0 failed / 0 skipped**（10.5 min）。日志：`evidence/about-hall/T1b/e2e-list.log`。

含新增：到达条完整快照「最高巡航 96 km/h」+ 空快照保底「探索 n/N」；hold overlay 类出现且观察者时间戳 ≤1200ms 卸（400ms + 一帧 SwiftShader 对齐）；reduced-motion 新页先 `emulateMedia` 再进，不挂类。CITY-PA-01…04 **未放宽**。

## 截图

| 帧 | 路径 | 人眼 |
|---|---|---|
| 城里出生 | `evidence/about-hall/T1b/01-spawn.png` | `?poi=about-pavilion`，车在黄圈，E 进站 |
| hold 起帧 | `evidence/about-hall/T1b/02-hold-overlay.png` | showcase 高位；楼在右、左留暗天；`captured=true` |
| 展厅到达条 | `evidence/about-hall/T1b/03-hall-chrome.png` | 「个人档案馆 · 探索 2/12 · 最高巡航 96 km/h」+ 米色圆点；左文右景 |
| reduced-motion hold | `evidence/about-hall/T1b/04-hold-reduced.png` | 同机位，`overlayOn=false`，无边缘脉冲 |

脚本：`evidence/about-hall/T1b/shot.mjs`。

## Gemini 初审

prompt `~/.codex/state/about-hall/prompts/AH-T1b-review.md`（0600）。  
`python3 ~/.claude/scripts/agy_rescue_cli.py --model gemini-3.8-flash ...`  
served **Gemini 3.8 Flash (High)**，`identity_ok: true`。首轮 `AGY_NETWORK_TRANSIENT` 后重试成功。

**VERDICT: PASS — 泊车机位与首屏同构，脉冲克制不刺眼，到达条人话自然。**

三问：同构 9/10 · 脉冲 9/10 · 到达条 10/10。全文：`evidence/about-hall/T1b/REVIEW-gemini.md`。
