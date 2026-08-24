# 浏览器 E2E 测试计划（Batch 1 + integration 扩展）

> 状态：已落地（Batch 1 分支 `cursor/e2e-testing-1d6f`；integration 扩展分支 `cursor/e2e-integration-report-1d6f`，基线 = integration 合并 `cursor/bruno-implementation-plan-1d6f`）
> 执行结果：Batch 1 见 [e2e-test-report-batch1.md](./e2e-test-report-batch1.md)；integration 批次（world-spike 交互 + corner cases）见 [e2e-test-report-integration.md](./e2e-test-report-integration.md)
> 被测对象：Astro 静态站（GitHub Pages 项目页，base `/website`）+ Lab 子系统（统一 facade + WebGL/WebGPU 模块）+ world-spike 隐藏路由（可驾驶 Spike + `?impl=engine` 引擎层灰盒）
> 上位规格：SRD §9.2（facade 契约）/ §12.4（降级链）/ §11.2（CI 门禁）；homepage-redesign-spec §3.1 / §8.4；world 专章 SRD §12.7 + 决策记录 `docs/research/world-spike-log.md`

---

## 1. 目标与范围

为站点建立**真实浏览器**的端到端回归体系（此前仅有 `check-links` / `audit-budget` 两个静态产物门禁，无任何浏览器级验证）。E2E 关注静态检查覆盖不到的运行时契约：

- facade 状态机（poster → 懒加载 → 400ms 交叉淡入 → 控制面解锁）；
- §12.4 自动挂载拦截（reduced-motion / Save-Data / pointer）与显式启动逃生门；
- 深链参数白名单（`?paint= ?wheels= ?livery= ?gl=` / `?locale= ?scene=`）与 `history.replaceState` 回写；
- WebGPU → WebGL 2 降级链与 `?gl=1` 强制回退；
- RTL（阿拉伯语/希伯来语）镜像、移动端 375px 布局、主题切换持久化；
- 断链、404、无 JS `noscript` 退化。

**不在本批范围**（Batch 2+ backlog，见 §8）：视觉回归基线（`toHaveScreenshot`）、WebKit/Firefox 跨引擎、axe 可达性扫描、Lighthouse 断言（由 CI D3 里程碑负责）。

## 2. 调研：Playwright vs Cypress

结合本站形态（纯静态产物 + 重 WebGL 交互页）逐项对比：

| 维度 | Playwright（@playwright/test） | Cypress | 对本站的影响 |
|------|------|------|------|
| 进程模型 | Node 驱动 + CDP 远控真实浏览器 | 测试代码注入浏览器内运行 | 注入式与 WebGL 页共享主线程，重渲染下易互相干扰 |
| 浏览器矩阵 | Chromium / Firefox / WebKit 一等公民 | Chrome/Edge 稳定，FF/WebKit 实验性 | 后续跨引擎验证 WebGPU 缺失路径必需 WebKit |
| WebGL/Canvas | headless 与 headed 同一渲染管线（`--headless=new`），CI 无 GPU 时自动落 SwiftShader 软渲染 | 同为真浏览器但注入架构对长帧更敏感 | 车配置器在 CI 可真实完成 WebGL 2 挂载（实测 ~50s/次） |
| 移动端仿真 | 内建设备描述符（viewport/DPR/触屏/`pointer: coarse`） | 仅 viewport 尺寸 | facade 的 pointer 拦截依赖 `(pointer: fine)` 媒体查询，Cypress 无法仿真 |
| 媒体特性仿真 | `emulateMedia`：`prefers-reduced-motion` / `color-scheme` 一行切换 | 需 launch 参数级 workaround | reduced-motion 阻断是 §12.4 核心用例 |
| 无 JS 上下文 | `javaScriptEnabled: false` 每 context 可配 | 不支持禁 JS | noscript 退化用例必需 |
| 并行 | worker 进程级并行，免费 | 单 spec 串行，并行需付费 Cloud | 3D 用例耗时长，并行能力直接决定 CI 时长 |
| Web 服务器 | 内建 `webServer`（起 `astro preview`、复用已有实例） | 需自行编排 | 与 Astro 静态产物工作流天然贴合 |
| 网络断言 | 全量请求监听（含 chunk/资产拉取） | 仅 XHR/fetch 拦截 | 「拦截态零 chunk 请求」断言需监听 `<script type=module>` 动态 import |

**结论：选 Playwright + @playwright/test**（v1.62，Chromium 151）。决定性因素按权重：媒体特性/触屏/禁 JS 仿真（§12.4 用例硬依赖）＞ 免费并行 ＞ webServer 集成 ＞ 后续 WebKit 扩展空间。Cypress 的组件测试与 in-browser 调试优势对纯静态站无增益。

## 3. 被测系统与运行方式

- **被测产物 = 生产构建**（`astro build` → `dist/`，`astro preview` 伺服），与 GitHub Pages 行为一致；不测 dev server。
- `pnpm test:e2e` = `astro build && playwright test`。本地/Cloud Agent 已有 preview（端口 4321）时自动复用；CI 由 `webServer` 拉起。
- 两个 project：`desktop-chromium`（1440×900）与 `mobile-375`（375×667、DPR 2、触屏、`pointer: coarse`，仅跑 `mobile.spec.ts`）。
- 并行度封顶 2 worker：SwiftShader 软渲染 3D 挂载单次约 50s 且吃满 CPU，4 worker 时实测 5/7 车配置器用例超时假阴性；`car-configurator.spec.ts` 进一步退出 fullyParallel（文件内按序单 worker），避免两个 3D 上下文并发挤兑 4 核 CPU。
- HTML 报告：`pnpm test:e2e:report`；失败自动留 trace + 截图（`test-results/`，已 gitignore）。

### 环境事实（影响断言口径，已在 spec 内注释）

1. **headless Chromium 无 `navigator.gpu`** → three.js `WebGPURenderer` 恒走 WebGL 2 后端。CI 恒验证「回退链路」（徽标断言 `WebGPU|WebGL 2` 二择，`?gl=1` 恒 `WebGL 2`）；WebGPU 正路径留本地 headed + GPU 验证。
2. **CDP 禁 JS 不改变解析器 scripting flag** → `<noscript>` 子树不会渲染成可见 DOM，noscript 文案以 `textContent` 断言（真机无 JS 时浏览器正常渲染）。
3. **SwiftShader 满载时 `locator.click` 的收尾等待可能长挂**（handler 内 `history.replaceState` + rAF 渲染循环压满合成器）→ 3D 页挂载后的控制坞交互统一「可见性断言 + `dispatchEvent('click')`」（`car-configurator.spec.ts` 的 `tap()`，附实测依据）。

## 4. 覆盖矩阵

| 能力 \ 页面 | 首页 `/` | `/lab/` 索引 | tts-cockpit | car-configurator | world-spike |
|---|---|---|---|---|---|
| 加载/骨架/SEO 基础 | HOME-01 | LAB-01 | TTS-01 | CAR-01 | WS-01 + SITE-04* |
| 导航链路 | HOME-02/04 | LAB-03 | —（面包屑随 LabLayout） | 同左 | WS-07（逃生链接→返回） |
| 主题切换 + 持久化 | HOME-03 | —（独立暗色静态页） | — | — | —（独立暗色壳） |
| poster→canvas 启动 | — | — | TTS-01（自动挂载） | CAR-01（自动挂载） | WS-02（**显式启动制**，无自动挡） |
| 驾驶交互（WASD/锥桶/复位/摇杆） | — | — | — | — | WS-03/04/09 |
| 深链参数 | — | — | TTS-03/04/05（`?locale= ?scene=`） | CAR-02/03/04（`?paint= ?wheels= ?livery= ?gl=`） | WS-05/11（`?gl=` `?impl=engine`） |
| reduced-motion 阻断 + 显式启动 | — | — | TTS-06 | CAR-06 | WS-06（显式进入不受阻） |
| `?gl=1` / 降级链 | — | — | —（无 GL） | CAR-01/02 | WS-02/05 |
| dispose / 再挂载 / 快速切页 | —（WS-08 路由风暴途经） | 同左 | 同左 | 同左 | WS-07/08 |
| RTL 阿拉伯语 | — | — | TTS-04（+he-IL 角标） | — | — |
| 移动端 375px | MOB-01 | — | MOB-02 | MOB-03（pointer 拦截） | WS-09（触摸摇杆） |
| 断链/404 | SITE-01/02（全站爬取 + 白名单镜像） | 同左 | 同左 | 同左 | SITE-01（已交付，条目清退）|
| 无 JS noscript | HOME-05 | LAB-04 | TTS-07 | CAR-07 | WS-10 |
| sitemap/noindex | — | — | — | — | SITE-03（sitemap 排除）+ WS-01（meta robots） |

\* SITE-04 的条件 skip 设计已随路由交付自动失效（integration 起恒执行烟测）；world-spike 深度交互由 §5.7 专属 spec 承担。

**已知待交付路由**（与 `scripts/check-links.mjs` PENDING_ROUTES 同步维护于 `e2e/helpers.ts`，只收缩不增长）：`/work/`×4、`/insights/`、`/ai-lab/`、`/about/`、`/contact/`、`/rss.xml`。`/world-spike/` 已于 integration 合并交付，条目按白名单过期纪律清退（Batch 1 的反向阻断设计首次实战生效）。头部导航五链接现阶段命中该白名单属预期；页面交付后 SITE-01 反向阻断，强制同步删除条目。

## 5. 用例清单（Batch 1：30 例 · 6 spec；integration 扩展：+11 例 · 1 spec，§5.7）

### 5.1 `e2e/home.spec.ts` — 首页
- HOME-E2E-01 骨架与 SEO 基础：200 / title / 唯一 h1 / skip-link 首焦点 / canonical 带 base / 五区块锚点
- HOME-E2E-02 顶部导航：品牌 + 五栏目 href 带 base；首页无 aria-current
- HOME-E2E-03 主题切换：html.dark ↔ light、body 背景实变、localStorage 持久化、刷新防闪烁不回退
- HOME-E2E-04 Lab 证据区：两卡指向 /lab/ 详情页、海报 naturalWidth>0、真实点击导航
- HOME-E2E-05 无 JS：内容完整可读、导航与 Lab 入口不依赖脚本

### 5.2 `e2e/lab-index.spec.ts` — /lab/ 索引
- LAB-E2E-01 manifest 卡片：2 live 模块、LIVE 徽标、预算行、tech chips
- LAB-E2E-02 海报加载 + `view-transition-name` 与详情页舞台配对（§9.3 morph 注册表）
- LAB-E2E-03 导航链路：卡片进详情、面包屑回首页
- LAB-E2E-04 零 JS 静态页完整

### 5.3 `e2e/tts-cockpit.spec.ts` — RA-01
- TTS-E2E-01 facade 生命周期：SSR idle 合同 + 自动挂载 ready + 覆盖层 opacity 0/pointer-events none + inert 解锁
- TTS-E2E-02 播放全链路：speaking→done、逐词 `.said` 全量点亮、时钟/进度/统计联动
- TTS-E2E-03 交互切换：locale/scene aria-pressed 联动 + URL replaceState 回写 + 默认值参数清理
- TTS-E2E-04 深链 `?locale=ar-SA&scene=park`：RTL 三处镜像（hmi-dir/data-dir/console[dir]）+ ar/he 角标 + RTL 播放
- TTS-E2E-05 非法深链回退默认 zh-CN×nav，零未捕获异常
- TTS-E2E-06 reduced-motion：data-blocked、滚动后零新增 JS chunk 请求、显式启动逃生门
- TTS-E2E-07 无 JS：noscript 文案合同 + 页眉/脚注静态可读 + facade 保持 idle

### 5.4 `e2e/car-configurator.spec.ts` — RB-01
- CAR-E2E-01 facade→ready：SSR 合同 + canvas 实绘尺寸 + 后端徽标 + HUD 默认配置名 + 控制坞解锁
- CAR-E2E-02 `?gl=1` 强制 WebGL 2 + 交互回写时 gl 参数保持
- CAR-E2E-03 深链三参组合（paint/wheels/livery）选中态与 HUD 全生效
- CAR-E2E-04 非法深链忽略回默认，零未捕获异常
- CAR-E2E-05 交互链路：车漆/Tab/轮毂 + URL 回写 + 车漆切回默认后参数逐 key 精确清理（保留非默认 wheels）
- CAR-E2E-06 reduced-motion：不拉任何 3D 资产（/models/ /hdri/ 零请求）+ 显式启动后才放行
- CAR-E2E-07 无 JS：noscript 文案合同 + 技术说明/署名静态可读

### 5.5 `e2e/site-health.spec.ts` — 全站健康度
- SITE-E2E-01 内链爬取（a[href]+img[src]）：已交付路由全 200；待交付路由精确命中白名单且必须仍 404（白名单过期反向阻断）
- SITE-E2E-02 未知路由 404（页面/深层路径/资源三类）
- SITE-E2E-03 sitemap 可达、含 lab 路由、排除 world-spike；favicon/字体 200
- SITE-E2E-04 world-spike 条件烟测（404 → skip；交付后自动生效）

### 5.6 `e2e/mobile.spec.ts` — 移动端 375px（仅 mobile-375 project）
- MOB-E2E-01 首页无页面级水平溢出、导航横滚可达、主题切换触控目标 ≥44px（§8.4）
- MOB-E2E-02 tts-cockpit：`pointerFine=false` 触屏不拦截自动挂载；<640px 仪表簇隐藏
- MOB-E2E-03 car-configurator：`pointerFine=true` 触屏拦截（data-blocked=pointer）+ 显式启动可用 + 后端徽标

### 5.7 `e2e/world-spike.spec.ts` — world Spike 交互回归（integration 扩展 · 仅 world-chromium project）

选择器契约 = 壳页 `data-ws-*` 属性族 + 引擎遥测钩子 `window.__worldSpike`（state/fps/info/backend，Spike 专用）。驾驶断言全部走「真实 CDP 输入（键盘/触摸）→ 意图层 → 物理积分 → 遥测轮询」闭环，**不允许因软渲染慢而 skip**（SwiftShader ~1fps 下物理 dt clamp 1/20 → 世界呈慢动作，等待时长按此标定）。

- WS-E2E-01 壳页静态合同：200 / `noindex,nofollow` meta / 标题 h1 / 逃生链接带 base / poster 实际解码 / HUD 隐藏 / noscript 文案；**点击「进入试验场」前零 world 字节**（滚动 + 2.5s 空闲后 3D 资产请求 = 0、JS chunk 不增长）
- WS-E2E-02 进入试验场：显式启动 → ready；覆盖层淡出（opacity 0 + pointer-events none）、HUD/提示揭示、后端徽标（WebGPU|WebGL 2）、canvas 实绘尺寸、遥测钩子合同（出生点/锥桶 0/drawCalls/triangles）、CarConcept + HDRI 仅在点击后拉取、零未捕获异常
- WS-E2E-03 WASD 可驾驶：W 加速 >25km/h + 位移 >5m → 空格刹停 <5km/h → R 复位回出生点 → Shift boost 破 70km/h（常态软限速 65 之上）→ A 左转 Δyaw>0.12rad → 教学提示消隐；帧率仪表有读数
- WS-E2E-04 锥桶碰撞 + R 复位闭环：循迹控制器（环形道切线 + 半径误差修正，沿内侧慢弯桩线 52.4m 扫掠，决策记录 §6 同款打法）真实驾驶撞桩 → `state().cones`≥1 + HUD 计数联动 → R 复位（出生点/速度清零/锥桶阵列恢复/HUD 归零）；未命中自动 R 重试（≤3 轮），决不 skip
- WS-E2E-05 深链：`?gl=1` 强制 WebGL 2（徽标 + `__worldSpike.backend`）；白名单外参数（`paint`/`bogus`）忽略且零异常；URL 保持原样（world 壳无 replaceState 回写，与 lab 模块契约区分）
- WS-E2E-06 reduced-motion：静态壳保持零加载（滚动 + 空闲后 3D 请求 = 0）；显式「进入」逃生门照常工作（§12.4 语义对齐——world 显式启动制本就比 facade 自动挡更严）
- WS-E2E-07 dispose 再挂载：ready 后站内跳转（pagehide → `instance.dispose()`）零异常 → 返回 → 重新进入 ready → **仍可驾驶**（dispose 的 canvas 置换克隆 → 新 GL 上下文可用）
- WS-E2E-08 快速切页：资产加载中途弃页（点进入 1.5s 后离开）+ 全站五路由 commit 级快切 → 零未捕获异常；终局再完整进入并驾驶（无脏状态残留）
- WS-E2E-09 移动端 375px 触屏摇杆：CDP 真触摸（`Input.dispatchTouchEvent`）按下生成动态原点摇杆基座 → 上推持杆速度 >10km/h（触点→意图→物理→遥测全链路）→ 松杆基座隐藏 → HUD「复位 (R)」按钮与键盘 R 同语义；页面无水平溢出
- WS-E2E-10 无 JS：noscript 文案合同 + 操作说明/CC 署名静态可读 + 壳保持 idle
- WS-E2E-11 `?impl=engine` 引擎层灰盒腿（integration 合流新增入口）：Rapier 引擎挂载 ready、壳文案切换、车辆 HUD 读数整组隐藏、后端徽标上报、零异常（烟测级；Phase B 合体转正后按 §5.7 全量口径展开）

**已知 UA 级异常白名单（仅一条，精确放行）**：站点启用声明式跨文档 View Transitions（`global.css` `@view-transition`，零 JS）。SwiftShader 慢渲染下离开 3D 页时 UA 产不出转场帧 → 转场跳过，Chromium 把 UA 内部 ViewTransition promise 拒绝上抛为页面级「Transition was skipped」。纯声明式用法下站点侧无 catch 点、真机语义 = 自动退化为普通整页跳转；WS-07/08 过滤该条并在 integration 报告 BUG 列表登记归因。

## 6. CI 集成（可选 job，未默认开启）

E2E 未并入现有 `gate` job（SwiftShader 3D 挂载使 CI 时长 +4~6 分钟，且首批先观察稳定性）。按需在 `.github/workflows/ci.yml` 追加：

```yaml
  e2e:
    name: E2E（Playwright · 可选门禁）
    runs-on: ubuntu-latest
    # 首批建议 PR 观察期不阻断：needs: gate + continue-on-error: true，稳定后移除
    needs: gate
    steps:
      - uses: actions/checkout@v7
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
```

要点：CI 下配置自动切换（`forbidOnly` / `retries: 2` / webServer 不复用）；报告与 trace 仅失败时上传；浏览器二进制可用 `~/.cache/ms-playwright` + `actions/cache` 提速（key 绑 `@playwright/test` 版本）。

## 7. 维护约定

- **选择器契约**：优先 facade/模块的 `data-*` 契约属性（`data-lab-host/-state/-blocked/-start/-gated`、`data-cfg-*`、`data-locale/-scene`、world 的 `data-ws-*` 族），不用样式类名做定位（`.scene-btn` 仅为收窄 `#screen[data-scene]` 属性碰撞）。
- **白名单同步**：`e2e/helpers.ts` PENDING_ROUTES 与 `scripts/check-links.mjs` 双向同步；两侧都有过期反向阻断（integration 批次已实战走过一轮：`/world-spike/` 交付 → 双侧清退）。
- **新 Lab 模块接入**：`lab-index.spec.ts` 的 `LIVE_MODULES` 追加一行；facade 生命周期/拦截用例按 tts/car 模板复制并按 `capabilities` 调整（`pointerFine` 决定移动端拦截断言方向）。
- **3D 重负载调度**：world-spike spec 挂在独立 `world-chromium` project 且 `dependencies: ['desktop-chromium', 'mobile-375']`——4 核 CI 上任何两个 SwiftShader 3D 上下文并发都会把驾驶积分饿死（Batch 1 挤兑结论的加强版）。新增重交互 spec 一律并入该 project 或复制该模式。
- **驾驶断言纪律**：物理量断言只走 `__worldSpike` 遥测轮询（`pollState`），输入只走真实 CDP 事件；禁止 evaluate 直改物理状态“作弊”。世界时间 ≈ 墙钟 × fps × 1/20（dt clamp），等待超时按此换算并留 3× 余量。
- **UA 异常白名单**：只允许逐条精确放行 + 注释归因 + 报告登记（现仅「Transition was skipped」一条）；禁止模式化放宽 pageerror 断言。

## 8. Batch 2+ backlog

1. 视觉回归：`toHaveScreenshot` 基线（Docker 固定环境，先只做静态页——3D 页 SwiftShader 与真机像素漂移大，需 mask 或降阈值）；
2. WebKit/Firefox project：验证 `navigator.gpu` 缺失分支、`requestIdleCallback` 缺失回退（Safari 路径已在 facade 内建）、he-IL RTL 字体子集；
3. axe-core 可达性扫描（@axe-core/playwright），与 Lighthouse A11y ≥95 门槛互补；
4. ~~world-spike 交付后的完整交互用例（键盘/触摇杆输入、物理量断言）~~ → **integration 批次已落地**（§5.7，11 例全绿）；Phase B `/world/` 转正后按同口径迁移并展开引擎层驾驶腿（physicalVehicle 上车后 WS-11 升级为全量）；
5. 弱网/离线：`context.route` 模拟 mp3/模型 404 与慢链路，断言 facade error 态文案与 world 壳 `data-state='error'` 分支（§9.2 error 契约目前仅代码审查覆盖）；
6. bfcache/View Transitions 离页 dispose 断言已部分覆盖（WS-07 走 pagehide→dispose→再挂载）；剩余：内存探针级 GPU 资源释放验证 + 「Transition was skipped」真机语义复核（带 GPU headed 环境确认转场正常播放时无此异常）；
7. WebGPU 正路径：带 GPU 的 headed 环境跑 WS-02/05 双后端矩阵（决策记录 §3 SwiftShader WebGPU 白屏为环境缺陷，真机需复核）；world 真机帧率录测为 Phase B 合并前置动作（决策记录 §8 条件项）。
