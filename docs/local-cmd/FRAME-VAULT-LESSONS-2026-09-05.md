# FRAME-VAULT · LESSONS（第三栋楼「帧库」施工，2026-09-04/05）

> 每条：触发 → 症状 → 根因 → 判据 → 修法。只记本楼一手踩到的；流水账编号可回查证据。

### 1. 先 spike 再写方案，估值不进门
- 触发：advisor 提醒「把估值写进门就成前提」。
- 症状：若按草案先写「侧面用体纹理边缘」「体积 2.5 MB」，两条都会被实测推翻（R0-2、R2-4）。
- 根因：白板视频 92% 帧是纸色，边缘像素没有信息；单集外推的预算被高熵集顶破。
- 判据：任何要写进门/预算/派单的数字，先问「实测过还是我的判断」。
- 修法：spike 一小时拿到真数字（上传 ≤16 ms、MAX_3D=2048、vsync 封顶），文档只写 `[实测]`/`[未坐实]`。

### 2. Astro scoped 样式作用不到 JS 动态创建的节点
- 触发：门环改为控制器按 manifest 创建（R3-2）。
- 症状：环 `width: 0`，Playwright 报 not visible。
- 根因：`<style>` 默认按 `data-astro-cid-*` 作用域，`document.createElement` 的节点没有该属性。
- 判据：组件里有任何运行时建 DOM，样式就得 `is:global` 或 `:global()`。
- 修法：整块 `<style is:global>`，类名全带 `vault__` 前缀并 grep `src/styles` 查重。

### 3. 全局类名撞名第二次发生
- 触发：容器 `.vault__stage` 与锁状态 span 同名（R2-4）。
- 症状：标题块被 `min-height: 72svh` 挤没。
- 根因：同一组件内两处语义共用了一个名字（第二楼 LESSONS 第 1 条是跨文件撞名，这次是同文件）。
- 判据：新类名不只 grep 全仓，也 grep 本文件。
- 修法：改 `.vault__lock`。

### 4. `hidden` 属性会被自己的 `display: flex` 盖掉
- 触发：EP2 无退回时「0 次人审退回」标签仍显示（R4-2 后截图）。
- 根因：`[hidden]` 是 UA 样式，被作者样式的 `display` 覆盖。
- 判据：给元素写了 `display` 又靠 `hidden` 切换 → 必补 `.x[hidden]{display:none}`。

### 5. 没有前奏机位的楼，进楼转场根本不跑
- 触发：城侧快门 token 四处都接了，真机按 E 却 263 ms 直跳（R5-1）。
- 根因：`PoiArrival` 无 `poi_showcase-<id>` 条目时降级为直跳，与 token 无关。
- 判据：给一栋楼接到达 fx，清单必含 `camera-shots.json` 机位 + `audit-shot-ndc` 门，不只是 buildings JSON 的字段。
- 修法：about 机位镜像一条，NDC 门 2/2 过。

### 6. 全屏后键盘焦点落到 body
- 触发：`F` 进全屏后再按 `F`/Esc 无效（R3-2）。
- 根因：`requestFullscreen` 后 `document.activeElement` 变 body，挂在宿主上的 keydown 收不到。
- 判据：任何全屏交互的键盘监听挂 `document`，按「宿主含焦点 / 全屏中 / 播放态」过滤。

### 7. seek 与 play 必须在同一手势同步段
- 触发：抽帧成片先 `await loadedmetadata` 再 `play()`。
- 根因：异步等待耗尽 user activation → `NotAllowedError`（W24 agy 实测）。
- 判据：手势回调里同步 `currentTime = t; play()`；元数据未到时赋值按规范排队。
- 附：默认 GOP 250 的 `currentTime` 已帧精确（max 32 ms），别为 seek 精度重编短 GOP（体积 +75%，精度 +0）。

### 8. 同秒多条退回要合环，否则互相压住
- 触发：EP4 两条退回都在 0:05，Playwright 报「另一枚环拦截指针」。
- 判据：时间轴标记先按 ±0.4% 时长分组再渲染；粗细 = 次数（草案本来就这么写，实现时漏了）。

### 9. 海报截 canvas 元素会把压在上面的 DOM 一起截进去
- 触发：无 WebGL2 降级态标题块与片架各出现两次（R5-3）。
- 根因：`locator.screenshot()` 截的是元素区域的合成结果，覆盖层也在。
- 判据：截引擎画面前 `addStyleTag` 藏掉所有 `position:absolute` 覆盖层。

### 10. 首屏必须把标尺算进去
- 触发：门环悬停不到——标尺被页头 69 px 顶出视口。
- 判据：舞台高度 = 视口 − 页头 − HUD − 标尺，用 `clamp()` 写死，不用 `100svh` 撑 section。

### 11. glm-5-3-flash 写 ≥300 行代码单会空稿
- 症状：`empty content with non-empty reasoning_content`（W23）。
- 判据：代码类派 sonnet 子代理 / hermes-code / terra；flash 只做短产出。

### 12. 磊哥令：k3 只开一路
- 「不要三路 kimi k3，太浪费了，一路 k3 即可」。两份 k3 席位定义已改；多视角换异源席（本楼 W6 用 seed）。
