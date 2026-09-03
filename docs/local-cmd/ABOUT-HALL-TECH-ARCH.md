---
title: ABOUT-HALL · 技术架构 · 依赖与工具安装说明
type: design
status: draft-for-leige
date: 2026-09-02
parent: ABOUT-HALL-CHARTER-2026-09-02.md
---

# 1. 分层架构（分阶段接力，不双引擎叠加）

```
Stage 1  /  首屏赛博城市（现有 three.js webgpu + hero-robot，零改动）
   │ 泊车 about-pavilion → E → PoiArrival 前奏 → navigate(hallPath?from=city&poi=about-pavilion)
   │ [W5] Areas.ts 在 assign 前写 sessionStorage['world-arrival-v1']
   ▼
Stage 2  /world/about-pavilion/   展厅页（Astro 静态，BaseLayout → WorldHallLayout）
   ├─ HallChrome        到达条（读 world-arrival-v1 + buildings JSON 查楼色）· 回城 /?poi= · 探索 n/12（读 world-explore-v1）
   ├─ Scene S0 Hero     <video> 全屏 + poster；pointer X → currentTime（rAF 节流 24–30fps，seeking 防重）
   ├─ Scenes S2–S6      sticky 长滚动区间（height 300–400vh）→ progress → currentTime + DOM 文字/SVG 由同一 progress 驱动
   │                    每个 <section data-scene data-bind> 绑定六站 id / 支柱 id / URL
   ├─ 六向晶体 / 六站地轨   SVG + CSS（默认）；three 仅当 /world/ 预算允许且为 Hall-S 懒加载
   ├─ 收官 DOM          三问题卡（翻转）· 讲者简介一键复制 · 四出口 · 回城
   └─ 降级四态          reduced-motion → poster + 静态表；无 JS → 首屏文字 + poster 可见；无 WebGL → 与 reduced-motion 同；移动端 → 9:16 <source media>
Stage 3  /about/   纸面双胞胎（现有页 + 触感升级，零 3D，LHCI ≥95）
```

**不做**：不复用 Lab manifest/facade/LabStage（N2 §4.1 八条理由）；展厅 HTML 不 import `src/lab/world/**`（G-D 排除 `world/` 前缀是陷阱，必须加 G-Hall 门）；不做自定义 View Transition（SwiftShader flake）；不做 Monaco/WebContainers 类重件；不双引擎同屏（视频 + three 同帧渲染 GPU 翻倍）。

# 2. 数据契约（加法，schemaVersion 不动）

| 契约 | 位置 | 内容 |
|---|---|---|
| `Building.hallPath?: string` | `src/lab/world/city/CityMap.ts` + `src/data/cyber-city-buildings.json`（about-pavilion 加 `"hallPath": "/world/about-pavilion/"`） | 有则城里 E 键走展厅，否则走 deepLink；正文 CTA 仍指 deepLink |
| `world-halls.json` | `src/data/world-halls.json` | `{ slug, buildingId, trick, scenes[] }`；坐标只从 buildings JSON 派生 |
| `world-arrival-v1` | sessionStorage，`src/lab/world/arrival-snapshot.ts` 写、`HallChrome` 读 | `{v, poi, sessionId, t, coneHits, respawns, poiEnters, exploreN, exploreTotal, maxKmh?}`（L-TECH §1.2） |
| 场景绑定 | `<section data-scene="s4" data-bind="stage:4;pillar:cockpit-i18n;proof:/lab/tts-cockpit/">` | 机器门校验 URL 在 dist 200 |
| 视频清单 | `src/data/about-hall-media.json` | 每段：`id, src16x9, poster, durationS, bytes, sha256, fps, audio, lockedRef, width?, height?`（剔除废弃的 `src9x16` 字段）— 机器门对账 |

# 3. 播放器（≤20KB gzip，零依赖，`src/components/city/halls/ScrubVideo.ts`）

来源：Paidax 两段提示词（`docs/research/x-paidax-hero-research-2026-09-02/01-*.md`）改写，硬要求：Pointer Events；`progress = clamp((clientX-rect.left)/rect.width,0,1)`；`targetTime = progress*duration`；rAF 驱动、`video.seeking` 时不重复 seek、≤30 次/s；`loadedmetadata` 后 seek 0.02s 防黑屏；`muted playsInline preload="auto" poster`；`duration` NaN/Infinity、宽 0、pointerleave/cancel 全处理；销毁时移监听。滚动段：`position: sticky` 长区间，`progress = clamp(-rect.top/(scrollHeight-innerHeight),0,1)`，**禁 `wheel + preventDefault`**；刷新落在中段要按当前滚动恢复帧；文字动画同一 progress 驱动，区间集中配置。滚动 sticky 模式已实装（`Transition.astro` 220vh，W1h 交付已测通近距 200px 预加载与滚动 scrub）。编码侧短 GOP（`-g 15`）；All-Intra 只作审计旁路不进 public（G1：静帧已 7.98MB，seek 收益未证）。**不用 `mix-blend-mode`**：Grok 出图左区是午夜青非纯黑，blend 会染字；DOM 文案直接铺负空间，必要时加 `rgba(4,16,32,.35)` scrim。

# 4. 门与脚本

| 脚本 | 用途 |
|---|---|
| `scripts/about-hall-gate.mjs`（W2） | 汇总门：build/check 通过；`dist/world/**/index.html` 零 `_astro/world.`/`models/`/rapier；media JSON 对账（bytes/sha/fps/时长/无音轨）；`data-bind` URL 200；总载荷 ≤6.0MB（注：ADR-3 决策 C 将 2.5MB 放宽至 6.0MB，非首屏资产必须懒加载）；输出 `evidence/about-hall/GATE.json` |
| `scripts/about-hall-frame-gate.py`（W1） | 静帧硬门：掩膜占宽、负空间纯净度、first↔last 同区色差、OCR 无字（pytesseract 或 macOS Vision） |
| `e2e/about-hall.spec.ts`（W2–W4） | 首屏 scrub 改变 `currentTime`；滚动区间 progress↔currentTime 单调；reduced-motion 无 animation；noscript 首屏可见；`?from=city&poi=about-pavilion` 到达条出现且非法 poi 不出现 |
| 既有 | `scripts/audit-budget.mjs`、`scripts/check-links.mjs`、`lighthouserc.json`（`/about/` 在册，展厅第一刀不加）、`e2e/site-health.spec.ts`（爬到展厅必须 200） |

# 5. 依赖与工具安装（授权 worker 自行安装；装了就在下表补行）

## 5.1 已在本机（核过）
| 工具 | 版本/位置 | 用途 |
|---|---|---|
| Node 22 + pnpm 10.33.x | 仓库 `packageManager` | 构建/e2e |
| ffmpeg / ffprobe | `/opt/homebrew/bin` | 压制、抽帧、回读 |
| yt-dlp | `~/.local/bin` | 参考素材 |
| Grok Build CLI | `~/.local/bin/grok` 1.0.16 | 生图生视频 / 编码 / 董事会 |
| agy_rescue_cli.py | `~/.claude/scripts/` | gemini-3.7-flash |
| api_direct_job.py | `~/.claude/scripts/api-direct/` | glm-5-3-flash@ark-plan（`--attach-image`） |
| stream_wrap.py | `~/.claude/scripts/` | grok 心跳包装 |
| Playwright（仓内） | `pnpm exec playwright` | e2e |
| three r185 / rapier（仓内） | `package.json` | 展厅**不 import**（主城引擎与物理隔离） |
| three addons（GLTFLoader/DRACOLoader） | `three/examples/jsm/loaders/*` | 展厅仅馆长程序化 3D 迎宾按需加载 Draco 压缩模型（`curator.ts`，W3d 落地） |

## 5.2 需安装（worker 执行，写回本表）
| 工具 | 安装 | 用途 | 归属席 |
|---|---|---|---|
| `cwebp` / `libwebp` | `brew install webp` | poster/对比图 | 生成 lane |
| `@gltf-transform/cli` | `pnpm dlx @gltf-transform/cli` 或全局 `npm i -g @gltf-transform/cli` | 若 W3 需给 hero-robot 加剪辑（Draco 重压） | 开发 lane |
| Blender 4.x LTS（可选） | `brew install --cask blender` | 新剪辑 Dock/Point/Salute（程序化骨骼不够时） | 开发 lane（单实例） |
| `pytesseract` + `tesseract`（或用 macOS Vision via `osascript`/swift） | `brew install tesseract && pip install pytesseract pillow numpy` | frame-gate OCR 零字门 | 指挥官/开发 lane |
| `Pillow` / `numpy` | `pip install pillow numpy` | 掩膜占宽/色差量测（已由 worker 装入 state venv） | 同上 |
| `imageio-ffmpeg` | `pip install imageio-ffmpeg` | 视频抽帧/压制/格式化兜底（已由 worker 装入 state venv） | 开发/生成 lane |
| `lighthouse` / `@lhci/cli`（仓内已配） | `pnpm lhci:local` | `/about/` 不降 | 开发 lane |
| Runtime 8787 `gptpro.ts`（可选备选生图） | 已在 `scout-r0/scripts/runtime-cli/hosted-generation/`，需 Docker Chrome 起 | Codex/GPT 生图备选 | 生成 lane，按 `12-runtime-gptpro-grokvideo.md` preflight |

原则：不改系统 python；pip 装进项目外 venv `~/.codex/state/about-hall/venv`；需 sudo 写 `NEEDS_LEIGE`。

# 6. 预算表

| 项 | 上限 | 依据 |
|---|---|---|
| 展厅额外 JS | Hall-0 = 0；Hall-S ≤50KB gzip | 对齐 Lab S，但不是 Lab 模块 |
| 首屏 mp4 | **≤2.0MB**（720p 6s crf 24 g15；G1 实测 600KB 连静帧都过不了；真 I2V 收口后再锁） | 首屏并发拉取；`preload=auto` |
| 过渡 mp4 | **≤3.5MB**（720p 10s；同上草案） | 进视口前 200px 触发全量缓冲 |
| 移动 9:16 | 移动端不投视频（poster only），如需投视频须新 ADR | 废弃（W1h 删除竖版 mp4；移动端走 poster 静帧） |
| poster webp | ≤60KB | LCP |
| 总媒体载荷 | **≤6MB**（草案；首屏之外全部懒加载） | 对齐 Lab M 资产 ≤6MB（ADR-3 决策 C） |
| 同屏循环动画 | ≤5 处 | master-plan §6 豁免 2 |
| `/about/` LHCI | 四项 ≥95 | 在册 URL |

# 7. 文件落点（开工时）

```
src/pages/world/[slug].astro
src/layouts/WorldHallLayout.astro
src/components/city/HallChrome.astro
src/components/city/halls/ScrubVideo.ts
src/components/city/halls/about/{Hero,Stations,Crystal,Epilogue}.astro
src/data/world-halls.json  src/data/about-hall-media.json
src/lab/world/arrival-snapshot.ts        (W5)
public/media/about-hall/*.mp4|webp
public/posters/about-hall-poster.webp
scripts/about-hall-gate.mjs  scripts/about-hall-frame-gate.py
e2e/about-hall.spec.ts
docs/local-cmd/locked/*.md  docs/spec/SRD.md(+1 行 /world/{slug}/)
```
