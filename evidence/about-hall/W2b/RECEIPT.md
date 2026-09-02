# AH-W2b RECEIPT · ScrubVideo

日期：2026-09-02  
worktree：`/Users/wanglei/studio-data-root/worktrees/website-about-hall`  
分支：`codex/about-hall-20260902`  
未 commit / 未 push。

## 产物

| 路径 | 角色 |
|---|---|
| `src/components/city/halls/ScrubVideo.ts` | `createPointerScrub` / `createScrollScrub`，零依赖 |
| `src/components/city/halls/ScrubVideo.test-notes.md` | 手测步骤与边界 |
| `evidence/about-hall/W2b/demo.html` | 仓外独立 demo（不经 Astro） |
| `evidence/about-hall/W2b/scrub.min.js` | esbuild esm minify |
| `evidence/about-hall/W2b/shot-*.png` | Playwright 回放截图（HUD 对账） |

## gzip 体积

```
$ gzip -c evidence/about-hall/W2b/scrub.min.js | wc -c
1041
```

原始 minify：2321 bytes。  
硬顶 50KB，目标 ≤20KB：**1041 < 20480，过。**

### 编译命令

任务写的 `pnpm exec esbuild` 在本仓 **失败**（esbuild 只作为 Astro/Vite 嵌套依赖，不在 package.json bin）：

```
ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL  Command "esbuild" not found
```

实际使用 Astro 已装的 0.28.2：

```
node_modules/.pnpm/esbuild@0.28.2/node_modules/esbuild/bin/esbuild \
  src/components/city/halls/ScrubVideo.ts \
  --bundle --format=esm --minify \
  --outfile=evidence/about-hall/W2b/scrub.min.js
```

`node --input-type=module` 回读导出：`createPointerScrub,createScrollScrub`。

## `pnpm exec astro check`

exit **0**。摘要（全量 160 files，含本切片）：

```
Result (160 files):
- 0 errors
- 0 warnings
- 58 hints
```

`ScrubVideo.ts` 未出现在 diagnostics。58 hints 均为既有文件（`src/content.config.ts` 的 `z` deprecated、`LabStage.astro` / `BaseLayout.astro` inline script、`about/index.astro` execCommand），与本切片无关。

## demo 手测

视频源（demo 内写死，与任务一致）：

`file:///Users/wanglei/studio-data-root/about-hall/gen/G1-canary/canary-encode-g15.mp4`  
poster：同目录 `canary-first.png`。ffprobe：1280×720、6.000s、180 frames、30fps。

### `open demo.html`

已执行 `open -g evidence/about-hall/W2b/demo.html`（rc=0）。  
**默认浏览器下 `file://` + `type=module` 的指针/滚动手感：未核**（Chrome 对 file:// ESM 常 CORS 拦截；未在 GUI 里逐帧盯默认浏览器）。

### Playwright 同源 http 回放（模块字节未改）

临时把 demo 里的 `file://` 媒体 src 换成 http（Range 206），加载**同一份** `scrub.min.js`。headless Chromium 1280×720：

| 项 | 读数 | 结果 |
|---|---|---|
| 模块加载（HUD 不再 `loading module`） | boot HUD `p=0.000 t=0.020s` | 过 |
| loadedmetadata 初始 seek | `currentTime=0.02` | 过 |
| 指针左 → 右 | t `0.112s` → `5.887s`（p 0.981） | 过，单调 |
| pointerleave 复位 | t 回到 `0.02s` | 过 |
| 滚动中段 | p=0.600 t=3.600s | 过 |
| 滚动终点 | p=1 t=6 | 过 |
| 终点刷新恢复 | scrollY=2160，p=1 t=6 | 过 |
| `reducedMotion: 'reduce'` | HUD 含 `reduced-motion: bindings off`，t=0 不 seek | 过 |

截图：`shot-hero.png` / `shot-pointer-right.png`（HUD `pointer p=0.981 t=5.887s`）/ `shot-scroll-mid.png`（HUD `scroll p=0.600 t=3.600s`）。canary 片是近似静帧，画面差很小，以 HUD/`currentTime` 为准。

### 未核

- 默认浏览器 `open` 后的真实指针/触控手感
- 真机系统「减少动态效果」开关（只做了 Playwright `reducedMotion`）
- 平板 stylus、iOS Safari `playsinline` 实机
- `duration === Infinity` 的直播流（代码防御在，无片源）

## 规格对照

- Pointer Events；`progress = clamp((clientX-rect.left)/rect.width,0,1)`
- 共用 rAF seek，间隔 `1000/30` ms；`video.seeking` 时不 `currentTime=`
- `duration` NaN/Infinity/≤0 与容器宽 0 直接跳过
- 滚动：`progress = clamp(-rect.top/(scrollHeight-innerHeight),0,1)`；**无 wheel、无 preventDefault**
- `onProgress(p)` 驱动 demo 文字亮度（区间 `TEXT_IN = [0.08, 0.72]`）
- `prefers-reduced-motion`：不绑事件、不跑 rAF、不 seek，保留 poster
