# 人工 Gate 证据归档目录

> 执行脚本：`docs/spec/human-gate-checklist.md`
> 回填目标：`docs/spec/mvp-gate-signoff.md` §人工签署区

## 一键启动（推荐）

```bash
pnpm human-gate:preview
```

自动 `build` + `preview --host`，终端打印手机可访问的局域网 URL。

## 命名规范

| 类型 | 格式 | 示例 |
|---|---|---|
| 录屏 | `fps_<desktop\|android>_<webgpu\|gl2>_<yyyymmdd>.mp4` | `fps_desktop_webgpu_20260824.mp4` |
| HUD 截图 | 同上 `.png` | `fps_desktop_webgpu_20260824.png` |
| 定位测试录音 | `positioning_<yyyymmdd>_<n>.m4a` | `positioning_20260824_01.m4a` |

录屏过大可存网盘，在 `human-gate-checklist.md` §2.3 记录表贴链接。

## 测试 URL（合并前）

本分支未部署至 GitHub Pages（生产仍指向 `main`）。请本地：

```bash
pnpm build && pnpm preview
```

- 首页（10 秒定位）：`http://localhost:4321/website/`
- world-spike（帧率）：`http://localhost:4321/website/world-spike/`
- WebGL2 腿：`?gl=1`

手机端定位测试可用同一 Wi-Fi 下 `http://<本机局域网 IP>:4321/website/`（preview 默认监听 `0.0.0.0` 时需 `pnpm preview --host`）。

## 完成后

1. 填 `human-gate-checklist.md` 记录表
2. 填 `mvp-gate-signoff.md` H1–H3
3. 更新 `goal-progress-status.md`「目标整体」
