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
