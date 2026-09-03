# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cyber-city.spec.ts >> 科技城 @phase0 世界剧本（CC-E7 绿灯 · world-chromium 串行 project） >> CITY-E2E-05 ?gl=1 回退：后端徽标 WebGL 2，变形仪式在回退腿同样可播，零未捕获异常
- Location: e2e/cyber-city.spec.ts:287:3

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  locator('[data-world-host]')
Expected: "ready"
Received: "loading"
Timeout:  210000ms

Call log:
  - Expect "toHaveAttribute" with timeout 210000ms
  - waiting for locator('[data-world-host]')
    7 × locator resolved to <div class="world" data-state="idle" data-world-host="" data-astro-cid-lcdefpme="">…</div>
      - unexpected value "idle"
    8 × locator resolved to <div class="world" data-world-host="" data-state="loading" data-astro-cid-lcdefpme="">…</div>
      - unexpected value "loading"

```

```yaml
- banner:
  - navigation "全站导航"
  - text: WebGL 2
- paragraph: CYBER CITY · FULL ENTRY
- heading "王磊｜汽车智能座舱与 AI 解决方案经理" [level=1]
- paragraph: 把复杂技术转化为可决策、可交付、可复用的解决方案——这座科技城里的每栋楼，都是一条真实产品线。
- list "能力三支柱":
  - listitem: 16 语种 · RTL/CJK 全覆盖
  - listitem: 端 × 云 · 2 层选型框架
  - listitem: 需求 → 复盘 · 4 阶段覆盖
- progressbar "世界加载进度"
- navigation "楼宇快览（12 栋主题大楼）":
  - heading "楼即产品线 · 12 栋在册" [level=2]
  - list
- status: 首幕加载中 · 座舱 AI 机器人显现在即…
- button "静音音效": 音效 ON
```

# Test source

```ts
  193 |     expect(hits, '跳过路径全程（含 /home/ 落地）零 world 字节').toEqual([]);
  194 |   });
  195 | 
  196 |   // ---------------------------------------------------------------------------
  197 |   // CITY-E2E-03 变形 → 可开计时（占位断言）
  198 |   // 条款：PRD CITY-05（变形 0.9–1.2s；变形期间按钮 disabled + 进度可见）；
  199 |   //       PRD CITY-06 / 终裁 D4（变形后 ≤1s 提示可见、输入可响应——「变形→可开零等待」，
  200 |   //       实施方案 §5.2 预算行「变形 → 可开：0 等待」）；SRD §12.7.2（变形动画 1.0–1.2s、
  201 |   //       加载→可驾驶 ≤8s @Fast 4G 为 e2e 计时断言）；SRD §12.7.4 状态机三态。
  202 |   // ✅ CC-E7 绿灯（原 CC-E6 后仍 skip 的两残项销账）：`/` 壳 + 自动挂载已交付；
  203 |   //       墙钟阈值已按文件头⑤标定（1.05s 设计窗 → ~40s 墙钟；robot_idle/car_ready
  204 |   //       等待均给 120s）。状态序全流程曾在 `/world-spike/?ritual=1` 实测通过
  205 |   //       （原注释 `/lab/world-spike/?impl=engine&…` 为路径笔误 + 已退役参数）。
  206 |   // ---------------------------------------------------------------------------
  207 |   test('CITY-E2E-03 变形仪式：robot_idle → transforming（CTA disabled）→ car_ready，落地即刻 WASD 可开', async ({ page }) => {
  208 |     await page.goto(PAGE_URL);
  209 |     const host = page.locator(SEL.host);
  210 | 
  211 |     // 自动挂载（§4.3 四条件在桌面 headless 全过）→ 首幕就绪；计时点 t0 = 导航发起
  212 |     const t0 = Date.now();
  213 |     await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
  214 |     // ready（mount resolve）→ robot_idle（Reveal 光柱落定）在慢动作下另有 ~40s 窗
  215 |     await expect(host).toHaveAttribute('data-world-state', 'robot_idle', { timeout: 120_000 });
  216 |     const mountMs = Date.now() - t0;
  217 |     // 占位：真机门禁「加载→可变形 ≤8s @Fast 4G」（SRD §12.7.2）；CI 软渲染仅采集留档，
  218 |     // 阈值断言待绿灯校准（walkthrough 表 human-gate-checklist §5 承接真机判定）
  219 |     test.info().annotations.push({ type: 'metric', description: `load→robot_idle ${mountMs}ms（真机门禁 ≤8s，CI 采集不阻断）` });
  220 | 
  221 |     // 变形：唯一主 CTA；transforming 期间 disabled + 进度可见（CITY-05 验收标准）
  222 |     const cta = page.locator(SEL.transform);
  223 |     await expect(cta).toBeEnabled();
  224 |     const t1 = Date.now();
  225 |     await cta.click();
  226 |     await expect(host).toHaveAttribute('data-world-state', 'transforming');
  227 |     await expect(cta).toBeDisabled();
  228 |     await expect(host).toHaveAttribute('data-world-state', 'car_ready', { timeout: 120_000 });
  229 |     const transformMs = Date.now() - t1;
  230 |     test.info().annotations.push({ type: 'metric', description: `transform ${transformMs}ms（设计窗 1.0–1.2s，软渲染慢动作下按系数换算后断言，待校准）` });
  231 | 
  232 |     // D4 硬语义：car_ready 即刻可开——变形完成后立即压 W，不允许二次点击/等待
  233 |     await page.keyboard.down('w');
  234 |     try {
  235 |       // 占位断言：驾驶接管（data-world-state → driving，实施方案 §1.1 幕④）。
  236 |       // 绿灯时升级为遥测轮询（速度/位移，参照 world-spike pollState 先例）。
  237 |       await expect(host).toHaveAttribute('data-world-state', 'driving', { timeout: 60_000 });
  238 |     } finally {
  239 |       await page.keyboard.up('w').catch(() => {});
  240 |     }
  241 |   });
  242 | 
  243 |   // ---------------------------------------------------------------------------
  244 |   // CITY-E2E-04 reduced-motion 终态
  245 |   // 条款：PRD CITY-05 验收（reduced-motion 下为即时切换 + 文字状态提示）；
  246 |   //       PRD CITY-09⑤（reduced-motion 直达降级路径）；实施方案 §1.2（不自动挂载，
  247 |   //       facade 既有拦截 data-blocked="reduced-motion"；显式进入后跳过全部动画——
  248 |   //       静态城市 + 机器人终态直接呈现，变形为 instant swap）；SRD §12.7.2 保 a11y 段。
  249 |   // ✅ CC-E7 绿灯：壳 data-blocked 拦截 + 显式 [data-world-enter] 已交付
  250 |   //       （instant swap 契约在 `/world-spike/?ritual=1` + emulateMedia 已实测）。
  251 |   // ---------------------------------------------------------------------------
  252 |   test('CITY-E2E-04 reduced-motion：不自动挂载零 world 字节；显式进入 → 终态直出；变形为即时切换 + 文字状态提示', async ({ page }) => {
  253 |     await page.emulateMedia({ reducedMotion: 'reduce' });
  254 |     const hits = trackWorldBytes(page);
  255 | 
  256 |     // 拦截合同：§4.3 条件① 不满足 → 壳静态呈现 + 显式「进入」按钮，零 world 字节
  257 |     await page.goto(PAGE_URL);
  258 |     await page.waitForLoadState('networkidle');
  259 |     const host = page.locator(SEL.host);
  260 |     await expect(host).toHaveAttribute('data-blocked', 'reduced-motion');
  261 |     await page.waitForTimeout(2_500);
  262 |     expect(hits, 'reduced-motion 下未显式进入不得拉取 world 字节').toEqual([]);
  263 | 
  264 |     // 显式逃生门（§12.4 语义沿用）：进入后终态直出，无 Reveal 动画序列
  265 |     await host.locator('[data-world-enter]').click(); // 显式「进入科技城」按钮（CC-E7 壳契约已对齐）
  266 |     await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
  267 |     // reduced-motion 零动画窗：ready 后 robot_idle 应速落（慢动作下仍留帧级余量）
  268 |     await expect(host).toHaveAttribute('data-world-state', 'robot_idle', { timeout: 30_000 });
  269 |     expect(hits.length, '显式进入后才允许拉取 world 字节').toBeGreaterThan(0);
  270 | 
  271 |     // 变形 = instant swap + 文字状态提示（无 1.0–1.2s 动画窗；直接落 car_ready）
  272 |     await page.locator(SEL.transform).click();
  273 |     await expect(host).toHaveAttribute('data-world-state', 'car_ready', { timeout: 15_000 });
  274 |     // 文字状态提示（CC-E6 定稿：`[data-world-status]` role="status" aria-live，
  275 |     // car_ready 文案「巡航态 · CarConcept 已落地十字路口——WASD 即刻可开」；
  276 |     // 绿灯 PR 可收紧为精确选择器 + 文案匹配）
  277 |     await expect(host.locator('[role="status"], [aria-live]').first()).toBeVisible();
  278 |   });
  279 | 
  280 |   // ---------------------------------------------------------------------------
  281 |   // CITY-E2E-05 ?gl=1 强制 WebGL 2 回退
  282 |   // 条款：SRD §12.7.8 降级链第二档（WebGL 2 科技城 = 同一世界）；PRD LAB-17 迁移条款
  283 |   //       （变形在 WebGL 2 回退路径同样可播——TSL 双后端）；spike 先例 WS-E2E-05
  284 |   //       （`?gl=1` 契约结转，e2e-test-plan §5.7）。
  285 |   // ✅ CC-E7 绿灯：壳引导脚本 PARAM_ALLOWLIST 含 gl，经 opts.params 透传引擎。
  286 |   // ---------------------------------------------------------------------------
  287 |   test('CITY-E2E-05 ?gl=1 回退：后端徽标 WebGL 2，变形仪式在回退腿同样可播，零未捕获异常', async ({ page }) => {
  288 |     const errors: string[] = [];
  289 |     page.on('pageerror', (e) => errors.push(e.message));
  290 | 
  291 |     await page.goto(`${PAGE_URL}?gl=1`);
  292 |     const host = page.locator(SEL.host);
> 293 |     await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
      |                        ^ Error: expect(locator).toHaveAttribute(expected) failed
  294 | 
  295 |     // 后端徽标：强制回退腿恒为 WebGL 2（headless 无 navigator.gpu 时默认腿同为 WebGL 2，
  296 |     // 本用例的信息量在于 ?gl=1 显式短路 WebGPU 探测——契约与 spike WS-E2E-05 同构）
  297 |     await expect(page.locator(SEL.backend)).toHaveText('WebGL 2');
  298 | 
  299 |     // 变形在回退腿可播（TSL 双后端承诺）：状态序完整走通
  300 |     // （CTA 可点前先等光柱落定 robot_idle——慢动作校准同 CITY-E2E-03）
  301 |     await expect(host).toHaveAttribute('data-world-state', 'robot_idle', { timeout: 120_000 });
  302 |     await page.locator(SEL.transform).click();
  303 |     await expect(host).toHaveAttribute('data-world-state', 'car_ready', { timeout: 120_000 });
  304 |     expect(errors, '?gl=1 回退腿全程零未捕获异常').toEqual([]);
  305 |   });
  306 | 
  307 |   // ---------------------------------------------------------------------------
  308 |   // CITY-E2E-06 机器人可见计时（占位采集）
  309 |   // 条款：PRD CITY-04 验收（机器人可见 ≤2.5s Fast 4G 桌面）；SRD §12.7.2 预算行
  310 |   //       （机器人可见 ≤2.5s，poster 先显、LCP 不等 GLB——考核方式「e2e 冒烟计时」）；
  311 |   //       实施方案 §5.2（机器人可见 ≤3s @Fast 4G，首批 1.3MB 就绪即开演）。
  312 |   // ✅ CC-E7 绿灯：`img[data-world-poster]` 与 `/` 壳自动挂载已交付；「机器人可见」
  313 |   //       DOM 信号 = host `data-world-state` 落 'robot_idle'（CC-E5/E6 契约不变）。
  314 |   // ---------------------------------------------------------------------------
  315 |   test('CITY-E2E-06 机器人可见计时：poster 先显（LCP 不等 GLB），world-reveal 计时采集留档', async ({ page }) => {
  316 |     const t0 = Date.now();
  317 |     await page.goto(PAGE_URL);
  318 | 
  319 |     // poster 先显：机器人 GLB 就绪前 LCP 元素已可见（预算表「poster 先显」行）
  320 |     await expect(page.locator('img[data-world-poster]')).toBeVisible();
  321 | 
  322 |     // 首幕开演信号：world-reveal（实施方案 §1.1 幕②埋点；DOM 侧信号契约已随 CC-E6
  323 |     // 对齐 = host `data-world-state` 落 'robot_idle'，光柱落定后由 Reveal 镜像）
  324 |     await expect(page.locator(SEL.host)).toHaveAttribute('data-world-state', 'robot_idle', {
  325 |       timeout: MOUNT_TIMEOUT,
  326 |     });
  327 |     const revealMs = Date.now() - t0;
  328 |     // 占位：真机门禁 ≤2.5s（Fast 4G 桌面）由 human-gate-checklist §5 承接；
  329 |     // CI 软渲染读数仅采集留档为下界参考，不做阈值阻断（口径同 WS-PERF-01）
  330 |     test.info().annotations.push({ type: 'metric', description: `load→robot 可见 ${revealMs}ms（真机门禁 ≤2.5s，CI 采集不阻断）` });
  331 |   });
  332 | 
  333 |   // ---------------------------------------------------------------------------
  334 |   // CITY-VEH-01/02/03/04/06 驾驶双视角单例全链（CC-VEH-VIEW）
  335 |   // 条款：docs/spec/cyber-city-vehicle-camera.md §11 验收点表——五个 ID 共享一次
  336 |   //       3D 挂载串成完整旅程（world-chromium 串行 project 的挂载成本纪律：每次
  337 |   //       ritual 挂载 ~75-110s 墙钟，逐 ID 独立挂载会把批次拖长 ~10min 无信息量）。
  338 |   //       既有 52 用例零改动（spec §11 头注）。
  339 |   //   VEH-02 robot_idle 门禁：按 V 状态恒 robot_idle、data-drive-view 属性缺席
  340 |   //          （闸门机器保证的 DOM 面证据，恒等清单 §6.3 #1/#5）；
  341 |   //   VEH-06 键位提示：car_ready 后 [data-world-hint] 文案含「V 切换视角」（§8.2 冻结）；
  342 |   //   VEH-03 car_ready 按 V：data-drive-view=fpv 且 data-world-state 恒 car_ready
  343 |   //          （V ∉ DRIVE_ACTIONS 的行为证据）；
  344 |   //   VEH-04 FPV 驾驶冒烟：fpv 态按住 W → driving 接管、视角保持 fpv、零未捕获异常；
  345 |   //   VEH-01 driving 态 V 往返：fpv → third → fpv → third 硬切（每次按键即时生效）。
  346 |   // ---------------------------------------------------------------------------
  347 |   test('CITY-VEH-01/02/03/04/06 驾驶双视角：robot_idle 门禁 → car_ready 切 FPV 不触发 driving → FPV 驾驶 → V 往返', async ({ page }) => {
  348 |     // 全链旅程 = 挂载 + 变形仪式 + 驾驶接管 + 多次 V 往返，是本 describe 最长用例；
  349 |     // SwiftShader 满载机上实测 >7m，超 describe 级 420s——对齐 world-spike 重型
  350 |     // 用例惯例（WS-E2E-03/07 等）单独放宽至 600s
  351 |     test.setTimeout(600_000);
  352 |     const errors: string[] = [];
  353 |     page.on('pageerror', (e) => errors.push(e.message));
  354 | 
  355 |     await page.goto(PAGE_URL);
  356 |     const host = page.locator(SEL.host);
  357 |     await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
  358 |     await expect(host).toHaveAttribute('data-world-state', 'robot_idle', { timeout: 120_000 });
  359 | 
  360 |     // —— CITY-VEH-02：robot_idle 门禁（恒等）——V 被 filters 闸门物理拦截
  361 |     await page.keyboard.press('v');
  362 |     await page.waitForTimeout(1_000);
  363 |     await expect(host).toHaveAttribute('data-world-state', 'robot_idle');
  364 |     expect(
  365 |       await host.getAttribute(DRIVE_VIEW_ATTR),
  366 |       'robot_idle 期间 data-drive-view 属性必须缺席（DOM 面恒等）',
  367 |     ).toBeNull();
  368 | 
  369 |     // 变形至 car_ready（慢动作校准同 CITY-E2E-03）
  370 |     await page.locator(SEL.transform).click();
  371 |     await expect(host).toHaveAttribute('data-world-state', 'car_ready', { timeout: 120_000 });
  372 |     // 属性从 car_ready 起挂载，初值 third（spec §5.2）
  373 |     await expect(host).toHaveAttribute(DRIVE_VIEW_ATTR, 'third');
  374 | 
  375 |     // —— CITY-VEH-06：键位提示含 V（car_ready 浮现窗内断言；文案 §8.2 冻结）
  376 |     await expect(host.locator('[data-world-hint]')).toContainText('V 切换视角');
  377 | 
  378 |     // —— CITY-VEH-03：car_ready 按 V → 切 fpv 且不触发 driving（V ∉ DRIVE_ACTIONS）
  379 |     await page.keyboard.press('v');
  380 |     await expect(host).toHaveAttribute(DRIVE_VIEW_ATTR, 'fpv');
  381 |     await expect(host).toHaveAttribute('data-world-state', 'car_ready');
  382 |     // [CC-VEH-C2] FOV 硬切断言（CC-AL-VEH 阻断项 B 验收 §7.3 之 4）：切换帧基础档
  383 |     // 已写死投影；car_ready 静止（v < kick speedEdge.min ⇒ kick 恒精确 0）恰等
  384 |     // 注册表 drive_fpv.rig.fovDeg——旧缺陷此刻仍在 42° 起低通（首采样帧 43.52°）
  385 |     expect(
  386 |       await engineFov(page),
  387 |       'V 切 fpv 后 FOV 必须硬切至注册表 fovDeg（静止零 kick ⇒ 恰等）',
  388 |     ).toBe(DRIVE_FPV_FOV);
  389 | 
  390 |     // —— CITY-VEH-04：FPV 驾驶冒烟——fpv 态按住 W → driving 接管、视角保持 fpv
  391 |     await page.keyboard.down('w');
  392 |     try {
  393 |       await expect(host).toHaveAttribute('data-world-state', 'driving', { timeout: 60_000 });
```