# FRAME-VAULT-INDEX · CURRENT AUTHORITY · 2026-09-04

> 本文是第三栋楼唯一 ACTIVE TODO。冲突时：**live Git / 隔离栈 / 日志 > 本文 > 任何旧看板**。
> 目标：`/world/frame-vault/`「帧库 · Frame Vault」——把视频当成可切开的时间固体，科普磊哥的 AI 视频自动化闭环。
> 设计 SSOT = `FRAME-VAULT-DRAFT-2026-09-04.md`；施工 SSOT = `FRAME-VAULT-CHARTER-2026-09-04.md`。
> 更新 2026-09-04 22:40 · 分支 **未开**（计划 `codex/frame-vault-20260904`，base `codex/nexus-hall-20260903@3e0680f`）· 建筑 `workflow-foundry` · 分支 `codex/frame-vault-20260904`（自 `0f1cdd0`）· 一二楼已合入 main `51fa87d`（PR #238）· 状态：**e2e 62/62 绿；PR 开出，等 CI 合入 main**

## 状态机
`PLANNED → RESEARCHED → BUILT → AUDITED → GATE_PASS → LIVE_OBSERVED`（只有 LIVE_OBSERVED 作验收）

## 票册

| 票 | 波 | 目标 | 席位 | write root | 依赖 | 最小 Live 验收 | 状态 |
|---|---|---|---|---|---|---|---|
| FV-W0r3 | W0 | 三路发散调研（webgl / craft / story） | agy ×3 | `~/.codex/state/nexus-hall/out/W19-agy-hall3-*.md` | — | 报告落盘 + 亲核 | **AUDITED**（R0-1：三路会聚等距工厂/时间线/节点图，判 AI 指纹，载体改帧库；吸收其「坏帧弹回」「拉闸门」两交互进 §3.6/§3.7） |
| FV-W0s | W0 | 可行性 spike（WebGL2 sampler3D） | 执行方 | `~/studio-data-root/hall3-spike/` | — | 真 GPU 数字 + 截图 | **LIVE_OBSERVED**（R0-2：84 MB 帧体上传 ≤16 ms、切片 118–123 fps、`MAX_3D_TEXTURE_SIZE=2048`；侧面改活动投影） |
| FV-W0a | W0 | 文档四件 | 执行方 | `docs/local-cmd/FRAME-VAULT-*` | W0s | 在分支上 | **BUILT**（docs-only 批次已提交在 nexus 分支，见 `git log --grep "docs(vault)"`；未 push） |
| FV-W0r | W0 | GitHub-first 视频体/切片轮子 + clone teardown | agy pro | `~/.codex/state/nexus-hall/out/W20-agy-videocube.md`、`~/studio-data-root/x-archives/hall3-research/repos/` | — | 报告有 file:line + adopt/adapt/drop | **RESEARCHED-IN-PROGRESS**（已 clone 5 仓；中途收稿 R0-5：三流派结论与 spike 一致，采纳 rVFC + 上限硬截断；锚点待亲核） |
| FV-W1 | W1 | 管线 + 门 + 四集 manifest | 执行方 | `scripts/`、`public/demo/frame-vault/`、`src/data/frame-vault/`、`evidence/frame-vault/` | go | 四集过门 | **GATE_PASS**（R2-4：四集全通，门 4/0，selftest 3/3；预算改 10 MB） |
| FV-W2 | W2 | VolumeEngine + 刀锋 + 斜切 + 海报 | 执行方 | `halls/vault/` | W1 | 海报可下载、URL 确定性 | **BUILT**（R2-4：引擎/控制器/首屏真机目击，刀锋与斜切成立；海报下载与 URL 复现未验；e2e 未写） |
| FV-W3 | W3 | 抽帧成片 + 翻面 + 门环 + 爆炸 + 片架 | 执行方 | 同上 | W2 | 四交互 Live | **BUILT**（R3-2：抽帧成片/全屏/下载、片架、门环真机目击；翻面 R7 用本机 mlx_whisper 补齐，爆炸并入 W4） |
| FV-W4 | W4 | 片库布局 + 快门 + S2/S3 + `film` token | 执行方 | 同上 + 热点文件 | W3 | 全程 Live | **BUILT**（R4：film 四消费点、环境光、S2 矩阵/金字塔/日志/dogfood、E 爆炸、S3 三出口；浮尘未做；城侧到达未真机目击） |
| FV-W5 | W5 | 接线 + e2e + 五门 | 执行方 + terra + sonnet | 热点文件 + `e2e/` | W4 | 200 + 进楼 + 回城 | **GATE_PASS**（R5：e2e 6/6 + 回城 5/5；六门全绿；astro check 0 错；chunk 8.4 KB gzip；海报；城→楼快门真机目击） |
| FV-W6 | W6 | 盲评 + 修 + LIVE_OBSERVED | seed（异源）+ 执行方 | — | W5 | 面板分 | **LIVE_OBSERVED**（R6：seed 39/50 三条整改落地；隔离栈真 GPU 一镜到底 城→E→楼四交互→回城 car_ready，零 pageerror） |

## NEEDS_LEIGE
七条已全拍（R1-1），无待拍项。

## 残余
- WebP 图集体积/画质未测（W1）；非 Apple GPU 的 3D 纹理上限与上传耗时未测；`texImage3D` 计时需 fence 复测。
