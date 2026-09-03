# AH-T1a receipt — about-pavilion 北槽换位 + 链首

worktree: `/Users/wanglei/studio-data-root/worktrees/website-about-hall`  
date: 2026-09-03  
ADR: `docs/local-cmd/adr/ADR-4-first-building-and-transition.md` 决策 A  
preview: `http://127.0.0.1:4633/website/`（pid 38571 / 子进程 38596，收工已杀，4633 空闲）

## 改动文件（本票 write root）

```
 src/data/cyber-city-buildings.json | 8 ++++----
 src/data/world-pois.json           | 2 +-
 src/lab/world/city/CityBlocks.ts   | 6 +++---
 3 files changed, 8 insertions(+), 8 deletions(-)
```

| 文件 | 做什么 |
|---|---|
| `src/data/cyber-city-buildings.json` | about ↔ now-signal **只换世界槽位**；id/slug/deepLink/hallPath/category/districts/neonColor 未动 |
| `src/lab/world/city/CityBlocks.ts` | `FACADE_PLAN['about-pavilion'] = { street:'east', firstFrame:'south', roof:true }`；`now-signal` 只留 `street:'east'`；头注入帧楼改 about |
| `src/data/world-pois.json` | `quest.chain[0] = "about-pavilion"`，其余四站相对顺序不变 |

**e2e 断言：0 条改动。** `rg -n 'now-signal|about-pavilion' e2e/` 后：三份定向 spec（poi-arrival / minimap / about-hall）无写死 about/now-signal 坐标；explore 的 `CHAIN[0]` 读 JSON。未放宽任何判据。

未改：spawn、`ritual_idle`、poster、`PoiArrival.ts`、`HallChrome.astro`、`camera-shots.json`、`src/lab/world/**` 除 `CityBlocks.ts` 外、`FlightTrails`、`public/models/facade-kit/README.md`（ADR 允许同票改一句，本票 write root 未列入故未动）。

工作树另有 T1b 在途脏文件（`PoiArrival` / `HallChrome` / `camera-shots` / 两份 spec 等），**本票未写入**。定向 e2e 是在该混合树上跑的。

## 足迹核算（东墙 + 圈心）

坐标约定：楼 `position` = 足迹中心；东墙 `x = position.x + footprint.w/2`；heading 270 = 车头朝西正对东立面；引擎 yaw = `π/2 − heading·π/180`。

| 楼 | 中心 | 足迹 w×d×h | 东墙 x | parkingBay | 圈心在墙外 | 判定 |
|---|---|---|---|---|---|---|
| about-pavilion | (−44, −150) | 36×36×40 | **−26.0** | (−20, −150) h270 r=6 | **6.0 m** | ≥6，与 ADR 表一致；圆与墙相切 |
| now-signal | (−44, 150) | 20×20×72 | **−34.0** | (−26, 150) h270 r=6 | **8.0 m** | ≥6，相对东墙仍 ~8m |

未盲抄 now-signal 的 `x=−26` 给 about（那会贴墙）。

`/?poi=about-pavilion` 落点遥测：`x=−20, z=−150, yaw=−π` ≡ heading 270。

## 脚本

`pnpm exec astro check`：0 errors / 0 warnings / 59 hints（既有）。

`node tools/camera/audit-x2-visibility.mjs`（仓内路径；无 `scripts/audit-x2-visibility.mjs`）：

| 楼 | inFrustum | front | ndc.x | ndc.y |
|---|---|---|---|---|
| **about-pavilion** | **8/8** | **8/8** | [−0.05, 0.39] | [0.16, 0.87] |
| now-signal | 0/8 | 0/8 | [1.43, 2.19] | [−1.68, 0.41] |
| workflow-foundry | 4/8 | 8/8 | — | — |
| edge-cloud-hub | 1/8 | 8/8 | — | — |

ADR 门：about `inFrustum ≥ 1` 且 `front = 8/8`。实测 8/8 / 8/8（about 高 40m，八角全入；原 now-signal 72m 塔顶出画才是 4/8）。头注 accordingly 写 `about-pavilion 8/8`。全文：`evidence/about-hall/T1a/audit-x2-visibility.txt`。

`node scripts/audit-budget.mjs`：全部阻断级门通过（exit 0）。  
`pnpm build`：20 page(s)。`node scripts/about-hall-gate.mjs`：G-Hall-1..9 全 PASS，FAIL 0。

## e2e

命令（相对票面多 `--no-deps`：否则 world-chromium 会先拉 car + desktop + mobile 全量）：

```
env -u CI E2E_PORT=4633 pnpm exec playwright test \
  e2e/cyber-city-poi-arrival.spec.ts \
  e2e/cyber-city-minimap.spec.ts \
  e2e/about-hall.spec.ts \
  --workers=1 --retries=0 --reporter=list --no-deps
```

**14 passed / 0 failed / 0 skipped**（11.3 min）。日志：`evidence/about-hall/T1a/e2e-list.log`。非 host-load 超时。

## 截图

| 机位 | 路径 | 人眼 |
|---|---|---|
| 开屏 ritual_idle | `evidence/about-hall/T1a/shot-spawn.png` | `data-state=ready` + `data-world-state=robot_idle`。中轴大道远端是 36m 方馆而非 72m 玫红细塔；米色檐口/立面在远楼可见。 |
| 深链泊位 | `evidence/about-hall/T1a/shot-poi-about.png` | 车在 (−20, −150) 黄圈内，heading 270；东立面（立面件/窗格）在圈西侧，圈心未穿模。进圈后探索 1/12，下一站变为概念车库（链首已消费）。 |

遥测：`evidence/about-hall/T1a/shot-pose.json`。

## 初审

prompt：`~/.codex/state/about-hall/prompts/AH-T1a-review.md`（0600）  
第一趟 `agy-rescue-20260903-145456-60f986b1`：`identity_ok=true`，`--print-timeout 600s` 工具空转超时（exit 1，未落盘）。  
第二趟 `agy-rescue-20260903-150630-425b0424`：`served_label=Gemini 3.8 Flash (High)`，`identity_ok=true`，exit 0，98s。

产出：`evidence/about-hall/T1a/REVIEW-gemini.md`

> VERDICT: PASS-WITH-NOTES — 泊位落位与无穿模达标，但中轴远端未呈米色霓虹方馆且身份难辨。

- Q1 开屏 about 立面：**4/10**（远楼已是方馆非玫红细塔，但 156m 处窗格暗底盖过 `#fef3c7` 檐口，近景机器人/MASTER AGENT 挡路）。几何门 audit-x2 about `8/8` inFrustum / `8/8` front 已过；米色远读是观感债，本票未改材质/招牌。
- Q2 泊位穿模：**10/10**（黄圈在东墙外路面，车头 heading 270 对东立面，未切楼）。
