# website

个人网站工程：Astro + TypeScript + MDX，部署于 GitHub Pages（项目页路径 `/website`）。总体方案见 `docs/website-plan/master-plan.md`，两条 Demo 路线的技术调研见 `docs/research/`。

## 线上地址（Live）

- 首页：https://rayw-lab.github.io/website/
- 多语言 TTS 智能座舱：https://rayw-lab.github.io/website/lab/tts-cockpit/
- 3D 汽车配置器：https://rayw-lab.github.io/website/lab/car-configurator/

当前包含两个可运行的实验室（Lab）Demo：

| Demo | 路径 | 说明 |
|------|------|------|
| 多语言 TTS 智能座舱 | `/lab/tts-cockpit` | 16 语种 × 5 场景预生成 TTS 播放，SVG 座舱 HMI，逐词字幕同步，波形画布，RTL 镜像，自托管 Noto 字体子集 |
| 3D 汽车配置器 | `/lab/car-configurator` | Three.js 车漆/轮毂/环境实时配置，KTX2 压缩纹理，HDRI 环境光，门面海报懒加载 |

## 赛博智能座舱科技城（Cyber City）

### 驾驶操控与交互（WASD / 巡航变形 / Q/E 自由视角环视 / M 小地图）

访客可在首页三维世界中通过 WASD 或方向键操控赛车巡航，按 Space 键触发机器人与车辆形态平滑变形切换（`src/lab/world/inputs/Inputs.ts`、`src/lab/world/player/TransformSystem.ts`）。
驾驶状态下支持按 Q/E 键在第三人称视角进行 120°/s 速度、±135° 范围的平滑自由环视，松开按键后在 0.35s 内自动弹性回正，且在第一人称或进站前奏期间被硬门锁定（`src/lab/world/view/View.ts`、`docs/local-cmd/proposals/AH-QE-lookaround.md`）。
按下 M 键可展开或收起全城 2D 矢量小地图，实时显示全城 12 栋建筑图标、中轴路网与车辆自身位置与航向（`src/lab/world/ui/Minimap.ts`）。

### 建筑进站与城厅流转（专属泊车位 / 进站前奏 / 霓虹脉冲）

科技城内规划 12 栋在册大楼与 8 个预留槽位，每栋建筑具备独立的物理包围盒、专属泊车位（parkingBay）与霓虹主色标（`src/data/cyber-city-buildings.json`）。
当车辆驶入建筑专属泊位减速停稳后，按 E 键进站可触发 400ms 建筑同色双层霓虹边缘呼吸脉冲动效（`src/lab/world/areas/PoiArrival.ts`、`evidence/about-hall/VIS-1/RECEIPT.md`）。
第一栋进驻大楼个人档案馆（about-pavilion）坐落于北槽位 `(-44, -150)`，进站前奏完成后平滑流转进入楼内展厅，回城时通过 `/?poi=about-pavilion` 深链精准恢复泊位朝向（`docs/local-cmd/adr/ADR-4-first-building-and-transition.md`）。

## 个人档案馆展厅（About Pavilion）

### /world/about-pavilion/ 沉浸展厅（指针/滚动双视频 Scrub、六站地轨、馆长程序化动作）

展厅首屏 Hero 视频支持桌面端指针水平位置驱动 6s 视频 scrub 逐帧交互，过渡段采用 220vh sticky 滚动驱动 S6「回家」过渡片并支持近距 200px 预加载（`src/components/city/halls/ScrubVideo.ts`、`src/components/city/halls/about/Transition.astro`）。
展厅底部设有六站地轨导航，区分当前站与静态索引层级，支持无障碍键盘 Tab 聚焦与 Enter 一键跳站（`src/components/city/halls/about/StationRail.astro`）。
三维迎宾馆长机器人由程序化 3D 骨骼渲染与 CSS 驱动，支持凝视、讲解与致意动作状态切换，并在暗色幕布上投射胸灯冷白接地双层反光（`src/components/city/halls/about/Curator.astro`、`src/components/city/halls/about/curator.ts`）。
展厅全量媒体载荷受严格预算控制且无 9:16 竖版视频多余拉取，静态 JS gzip 仅 1.7KB，已通过 G-Hall 自动化门控对账（`scripts/about-hall-gate.mjs`、`evidence/about-hall/W1h/RECEIPT.md`）。

### /about/ 纸面双胞胎（高触感折叠摘要、六向因果晶体、LHCI 四项满分）

作为展厅的纯文字零 3D 高触感镜像，纸面版以「解决什么问题」组织三张核心专业问题卡，正面呈现自然换行的 2 行限制折叠摘要，悬停或聚焦翻转呈现解法与佐证链（`src/pages/about/index.astro`、`src/data/about-copy.ts`）。
页面中心集成六向因果晶体与职业演进主线，清晰贯穿从物联网、整车、AR-HUD、座舱多语种到端云分层与 AI 工作流的演进脉络（`src/components/city/halls/about/Crystal.astro`、`src/pages/about/index.astro`）。
页面在零动画运行时与严格无障碍标准下，持续保持 Lighthouse（性能、可访问性、最佳实践、SEO）四项分类全部 100 分满分表现（`evidence/about-hall/VIS-1/RECEIPT.md`、`docs/local-cmd/ABOUT-HALL-TECH-ARCH.md`）。

## 本地快速启动

```bash
git clone https://github.com/rayw-lab/website.git
cd website
pnpm install
pnpm dev
# TTS Demo: http://localhost:4321/website/lab/tts-cockpit
# 3D Demo:  http://localhost:4321/website/lab/car-configurator
```

要求 Node ≥ 20、pnpm（版本见 `package.json` 的 `packageManager` 字段，推荐 `corepack enable` 自动匹配）。`pnpm-lock.yaml` 已提交，CI/复现请用 `pnpm install --frozen-lockfile`。

注意：`astro.config.mjs` 配置了 `base: '/website'`，因此所有页面都在 `/website/` 前缀之下；绑定自定义域名后需修改 `site` 并删除 `base`。

## 常用命令

| 操作 | 命令 |
|------|------|
| 开发服务器 | `pnpm dev`（端口 4321） |
| 生产构建 | `pnpm build`（产物输出到 `dist/`） |
| 本地预览产物 | `pnpm preview` |

## 部署

push 到 `main` 后由 `.github/workflows/deploy.yml`（withastro/action + actions/deploy-pages）自动构建并发布到 GitHub Pages。Pages 源须设置为 **GitHub Actions**（Settings → Pages → Source）。

## 目录结构

```
.cursor/            Cloud Agent 环境定义（install.sh / dev-server.sh / environment.json）
.github/workflows/  GitHub Pages 部署工作流（withastro/action）
docs/website-plan/  网站方案：总纲、定位、案例大纲、素材安全分级、MVP 清单
docs/research/      技术调研：TTS×座舱可视化（路线A）、3D 汽车 Configurator（路线B）
scripts/            构建期 TTS 生成管线（eSpeak NG，多语料 + 逐词时间轴）
src/pages/          页面：首页 + /lab/tts-cockpit + /lab/car-configurator
src/components/     TTS 座舱前端逻辑
src/scripts/        3D 配置器前端逻辑（Three.js）
public/demo/tts/    预生成 TTS 音频（mp3，16 语种 × 5 场景）
public/fonts/       自托管 Noto 字体子集（含 RTL）
public/models/      车模 glTF + KTX2 压缩纹理
public/hdri/        HDRI 环境贴图
public/posters/     3D Demo 门面海报
```

## 分支说明

- `main` — 上线分支，含全站代码，push 即触发 Pages 部署。
- `cursor/full-site-delivery-1d6f` — 历史交付分支，合并了以下全部工作分支（保留完整历史）：
  - `cursor/cloud-environment-setup-1d6f` — Astro 脚手架、Cloud Agent 环境配置、AGENTS.md、Pages 部署工作流
  - `cursor/cloud-subagent-rules-1d6f` — 云端子代理规则（已包含于 AGENTS.md）
  - `cursor/website-plan-bundle-1d6f` — `docs/website-plan/` 方案文档
  - `cursor/research-ui-bundle-1d6f` — `docs/research/` 技术调研
  - `cursor/demo-bundle-1d6f` 及 `cursor/demo-tts-cockpit-1d6f`、`cursor/demo-3d-car-config-1d6f` 的最新提交 — 两个 Lab Demo 及全部 public 资产

密钥管理：仓库不含任何 API Key；`.env*` 已被 `.gitignore` 排除，未来密钥经 Cursor Dashboard → Cloud Agents → Secrets 注入。
