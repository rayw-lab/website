# ScrubVideo 手测与边界

模块：`src/components/city/halls/ScrubVideo.ts`  
独立 demo：`evidence/about-hall/W2b/demo.html`（不经 Astro）

## 手测步骤

1. 编译（仓根）：

   ```bash
   pnpm exec esbuild src/components/city/halls/ScrubVideo.ts \
     --bundle --format=esm --minify \
     --outfile=evidence/about-hall/W2b/scrub.min.js
   ```

2. 打开 demo：`open evidence/about-hall/W2b/demo.html`  
   Chrome 对 `file://` 的 ES module 常拦截。若控制台报 CORS / `Failed to load module`，改用 Safari，或在 `evidence/about-hall/W2b/` 起一个静态服务再打开（视频仍用任务指定的 `file://` 绝对路径，http 页会拦本地文件——那时把 mp4 拷进同目录改相对路径仅作临时手测，不要提交）。

3. **第一屏 · 指针**
   - 鼠标在画面左右移动：视频 `currentTime` 随 X 单调变化（左≈0.02s，右≈片尾）。
   - 不要按住也可 scrub（hover `pointermove`）；按下拖拽在 touch/笔同样有效。
   - 指针离开画面或 `pointercancel`：进度回到起点（仍停在 ≈0.02s，避免黑帧）。
   - 系统 HUD（demo 右下）读 `p` 与 `t`。

4. **第二屏 · 滚动**
   - 区间 300vh，`position: sticky` 钉在视口；**不要**用 wheel 劫持。
   - 向下滚 → 帧前进；向上滚 → 帧回退。
   - 滚出区间后进入后续空白；再向上滚回，帧应回到对应进度。
   - 左侧占位文字随 `onProgress` 由暗到亮（区间集中在 demo 的 `TEXT_IN`）。

5. **刷新落中段**
   - 滚到第二屏中段，记下 HUD 的 `p` / `t`，刷新。
   - 视频应在 `loadedmetadata` 后seek 到当前滚动对应帧，而不是跳回片头。

6. **reduced-motion**
   - macOS：系统设置 → 辅助功能 → 显示 → 减少动态效果。
   - 刷新后：不绑 pointer/scroll，视频保持 poster，不随指针/滚动 seek。
   - 文字保持可读（不要停在 0 进度的暗色）。

7. **销毁**
   - demo 在 `pagehide` 调 `destroy()`。手测：绑完后切走/关页，控制台无报错即可。

## 已知边界

| 项 | 行为 |
|---|---|
| `duration` 为 `NaN` / `Infinity` / `≤0` | 不 seek，等下一次 metadata/有效时长 |
| 容器 `width === 0` | 指针路径忽略本次读数，保留上一次 progress |
| `section.scrollHeight <= innerHeight` | 滚动进度视为 0 |
| `video.seeking === true` | 本帧不 `currentTime=`，rAF 下一拍再试 |
| seek 频率 | rAF 循环内硬间隔 `1000/30` ms |
| 首帧 | progress 折算时间 `< 0.02s` 时落到 `0.02s` |
| 不绑 `wheel`，不 `preventDefault` 滚动 | 滚动进度只来自 `getBoundingClientRect` |
| 同一 `<video>` 上挂两个 scrub | 未支持；demo 用两个 video 元素 |
| Chrome `file://` + `type=module` | 常失败，见步骤 2 |
| 无 poster 且 reduced-motion | 浏览器可能仍在 metadata 后露出首帧；有 poster 时保持海报 |
| 编码 GOP | canary 为 `-g 15`；GOP 过长时 scrub 会停在关键帧附近（观感卡），属片源不是播放器 |

## 不在本模块

- 不设原生控件、不 autoplay、不循环。
- 不引入 three / 任何 npm 运行时依赖。
- 9:16 `<source media>`、媒体 JSON 对账、Hall 页接线：W2 其它切片。
