# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cyber-city-observability.spec.ts >> 科技城可观测性 @phase0（CC-OBS-C2 · world-chromium 串行 project） >> CITY-OBS-01 漏斗全走 @funnel：ritual 动线 + V 往返 + R 重生 + 驾驶进 POI + E 进站取证
- Location: e2e/cyber-city-observability.spec.ts:362:3

# Error details

```
Error: 泊车位 (28,-28) 应可达（实测 x=1.3 z=-2.1）

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "跳过 3D，直达内容首页 →" [ref=e2] [cursor=pointer]:
    - /url: /website/home/
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]: W.L. · CYBER CITY
      - navigation "全站导航" [ref=e6]:
        - link "Home" [ref=e7] [cursor=pointer]:
          - /url: /website/home/
        - link "Work" [ref=e8] [cursor=pointer]:
          - /url: /website/work/
        - link "Insights" [ref=e9] [cursor=pointer]:
          - /url: /website/insights/
        - link "AI Lab" [ref=e10] [cursor=pointer]:
          - /url: /website/ai-lab/
        - link "About" [ref=e11] [cursor=pointer]:
          - /url: /website/about/
        - link "Contact" [ref=e12] [cursor=pointer]:
          - /url: /website/contact/
      - generic [ref=e13]: WebGL 2
    - generic [ref=e14]:
      - generic "智能座舱科技城：变形仪式后 W/A/S/D 或方向键驾驶 CarConcept，靠近大楼按 E 进站" [ref=e15]
      - generic:
        - generic:
          - generic: "2"
          - generic: km/h
        - button "回到路口 (R)" [ref=e16] [cursor=pointer]
      - navigation "楼宇快览（5 栋 hero 楼）" [ref=e17]:
        - paragraph [ref=e18]: HERO TOWERS · 05
        - list [ref=e19]:
          - listitem [ref=e20]:
            - link "多语种方案塔 Lingua Tower" [ref=e21] [cursor=pointer]:
              - /url: /website/work/multilingual-cockpit/
              - generic [ref=e23]: 多语种方案塔
              - generic [ref=e24]: Lingua Tower
          - listitem [ref=e25]:
            - link "座舱语音舱 Voice Pod" [ref=e26] [cursor=pointer]:
              - /url: /website/lab/tts-cockpit/
              - generic [ref=e28]: 座舱语音舱
              - generic [ref=e29]: Voice Pod
          - listitem [ref=e30]:
            - link "主智能体中枢 Agent Nexus" [ref=e31] [cursor=pointer]:
              - /url: /website/ai-lab/
              - generic [ref=e33]: 主智能体中枢
              - generic [ref=e34]: Agent Nexus
          - listitem [ref=e35]:
            - link "智驾实验楼 AutoDrive Lab" [ref=e36] [cursor=pointer]:
              - /url: /website/work/
              - generic [ref=e38]: 智驾实验楼
              - generic [ref=e39]: AutoDrive Lab
          - listitem [ref=e40]:
            - link "概念车库 CarConcept Garage" [ref=e41] [cursor=pointer]:
              - /url: /website/lab/car-configurator/
              - generic [ref=e43]: 概念车库
              - generic [ref=e44]: CarConcept Garage
      - paragraph: W/A/S/D 或方向键驾驶 · Shift 加速 · Space/B 刹车 · R 回到路口 · 靠近大楼按 E 进站 · Esc 菜单
      - generic:
        - generic:
          - paragraph: CYBER CITY · FULL ENTRY
          - heading "王磊｜汽车智能座舱与 AI 解决方案经理" [level=1]
          - paragraph: 把复杂技术转化为可决策、可交付、可复用的解决方案——这座科技城里的每栋楼，都是一条真实产品线。
          - list "能力三支柱":
            - listitem: 16 语种 · RTL/CJK 全覆盖
            - listitem: 端 × 云 · 2 层选型框架
            - listitem: 需求 → 复盘 · 4 阶段覆盖
          - generic:
            - button "进入科技城"
            - paragraph: 变形仪式 + WASD 驾驶 · WebGPU 优先，WebGL 2 自动回退 · 3D 资产点击后才加载
        - navigation "楼宇快览（12 栋主题大楼）":
          - heading "楼即产品线 · 12 栋在册" [level=2]
          - list:
            - listitem:
              - link "多语种方案塔 Lingua Tower":
                - /url: /website/work/multilingual-cockpit/
                - generic: 多语种方案塔
                - generic: Lingua Tower
            - listitem:
              - link "座舱语音舱 Voice Pod":
                - /url: /website/lab/tts-cockpit/
                - generic: 座舱语音舱
                - generic: Voice Pod
            - listitem:
              - link "主智能体中枢 Agent Nexus":
                - /url: /website/ai-lab/
                - generic: 主智能体中枢
                - generic: Agent Nexus
            - listitem:
              - link "智驾实验楼 AutoDrive Lab":
                - /url: /website/work/
                - generic: 智驾实验楼
                - generic: AutoDrive Lab
            - listitem:
              - link "概念车库 CarConcept Garage":
                - /url: /website/lab/car-configurator/
                - generic: 概念车库
                - generic: CarConcept Garage
            - listitem:
              - link "交付案例馆 Works Gallery":
                - /url: /website/work/
                - generic: 交付案例馆
                - generic: Works Gallery
            - listitem:
              - link "洞察档案塔 Insights Archive":
                - /url: /website/insights/
                - generic: 洞察档案塔
                - generic: Insights Archive
            - listitem:
              - link "个人档案馆 About Pavilion":
                - /url: /website/about/
                - generic: 个人档案馆
                - generic: About Pavilion
            - listitem:
              - link "联络信标塔 Contact Beacon":
                - /url: /website/contact/
                - generic: 联络信标塔
                - generic: Contact Beacon
            - listitem:
              - link "端云算力枢纽 Edge-Cloud Hub":
                - /url: /website/work/llm-capability-layering/
                - generic: 端云算力枢纽
                - generic: Edge-Cloud Hub
            - listitem:
              - link "AI 工作流工厂 Workflow Foundry":
                - /url: /website/work/ai-native-workflow/
                - generic: AI 工作流工厂
                - generic: Workflow Foundry
            - listitem:
              - link "当前状态塔 Now Signal":
                - /url: /website/now/
                - generic: 当前状态塔
                - generic: Now Signal
      - generic:
        - status: 驾驶中 · WASD/方向键转向，Shift 加速，V 切换视角，R 回到路口——按 H 重看键位
        - button "键位卡：唤出或收起操作提示" [ref=e45] [cursor=pointer]: 键位 H
      - generic:
        - generic:
          - paragraph: 已复位 · 回到最近路口
      - button "静音音效" [ref=e46] [cursor=pointer]: 音效 ON
      - generic:
        - generic: 探索
        - generic: 0/12
      - generic:
        - generic:
          - generic: 下一站
          - generic: 概念车库
          - generic: 134m
          - generic: 1/5
          - button "目标线：折叠或展开「下一站」导视" [expanded] [ref=e47] [cursor=pointer]: 收起
      - button "城市地图：打开或关闭小地图" [ref=e48] [cursor=pointer]: 地图 M
      - button "BGM 氛围垫" [ref=e49] [cursor=pointer]: BGM OFF
```

# Test source

```ts
  312 |         } else {
  313 |           await page.keyboard.press('r');
  314 |           await page.waitForTimeout(3_000);
  315 |           escapes = 0;
  316 |         }
  317 |         bestDist = Infinity;
  318 |         progressAt = Date.now();
  319 |         state = await readSpike(page);
  320 |         continue;
  321 |       }
  322 | 
  323 |       await page.waitForTimeout(interval);
  324 |     }
  325 |     return { ok: false, state };
  326 |   } finally {
  327 |     if (steering) await page.keyboard.up(steering).catch(() => {});
  328 |     if (throttle) await page.keyboard.up('w').catch(() => {});
  329 |   }
  330 | }
  331 | 
  332 | /** 轮询 dump 直至谓词满足（超时返回最后一次 dump 并置 ok=false） */
  333 | async function pollDump(
  334 |   page: Page,
  335 |   pred: (d: SessionDump) => boolean,
  336 |   timeoutMs: number,
  337 |   intervalMs = 1_000,
  338 | ): Promise<{ ok: boolean; dump: SessionDump }> {
  339 |   const deadline = Date.now() + timeoutMs;
  340 |   let dump = await readDump(page);
  341 |   while (!pred(dump)) {
  342 |     if (Date.now() > deadline) return { ok: false, dump };
  343 |     await page.waitForTimeout(intervalMs);
  344 |     dump = await readDump(page);
  345 |   }
  346 |   return { ok: true, dump };
  347 | }
  348 | 
  349 | test.describe('科技城可观测性 @phase0（CC-OBS-C2 · world-chromium 串行 project）', () => {
  350 |   // 3D 挂载单例互斥（cyber-city.spec.ts 同纪律）；长用例单独 setTimeout 放宽
  351 |   test.describe.configure({ mode: 'serial', timeout: 420_000 });
  352 | 
  353 |   // ---------------------------------------------------------------------------
  354 |   // CITY-OBS-01 漏斗全走 @funnel
  355 |   // 条款：§7 表首行——生产 `/` 走 CITY-E2E-03 同款动线到 driving，续驾至 POI
  356 |   //       触发圈 + E 进站（进站跳转前取证）→ dump 全量断言 → 落盘 + attach。
  357 |   //       动线增量：V 视角往返 ×2（偏差②）+ R 重生（respawn 覆盖；出生点即首幕
  358 |   //       锚点，零路程损失）。锥桶偏差①见文件头注。
  359 |   //       进站 = Areas onInteract 的 location.assign 真实跳转——route abort 拦下
  360 |   //       导航请求保住 JS 上下文（页面原地存续），「跳转前取证」确定性成立。
  361 |   // ---------------------------------------------------------------------------
  362 |   test('CITY-OBS-01 漏斗全走 @funnel：ritual 动线 + V 往返 + R 重生 + 驾驶进 POI + E 进站取证', async ({ page }, testInfo) => {
  363 |     test.setTimeout(1_800_000); // SwiftShader 慢动作下遥测闭环驾驶（桥腿绕行三腿）~4-10min 墙钟
  364 |     const errors = trackErrors(page);
  365 | 
  366 |     // 进站目标 = autodrive-lab（parkingBay (28,-28) r6，deepLink /work/——
  367 |     // 出生 (0,0) 朝北的最近顺路 POI）；abort 该导航请求防上下文销毁。
  368 |     // [CC-FXN-C3] 适配（function-test-plan §3.3 留痕行）：进站前奏把 navigate
  369 |     // 推迟到 ticker 回调（E 的用户手势已过期），默认 abort（net::ERR_FAILED）
  370 |     // 会提交错误页销毁上下文——显式 'aborted'（net::ERR_ABORTED 静默取消）
  371 |     // 保住 JS 上下文，「跳转前取证」合同不变
  372 |     await page.route('**/website/work/', (route) => route.abort('aborted'));
  373 | 
  374 |     await page.goto(PAGE_URL);
  375 |     const host = page.locator(SEL.host);
  376 |     await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
  377 |     await expect(host).toHaveAttribute('data-world-state', 'robot_idle', { timeout: 120_000 });
  378 | 
  379 |     // 变形仪式 → car_ready（CITY-E2E-03 同款校准）
  380 |     await page.locator(SEL.transform).click();
  381 |     await expect(host).toHaveAttribute('data-world-state', 'car_ready', { timeout: 120_000 });
  382 | 
  383 |     // 驾驶接管（world-drive-start）
  384 |     await page.keyboard.down('w');
  385 |     try {
  386 |       await expect(host).toHaveAttribute('data-world-state', 'driving', { timeout: 60_000 });
  387 |     } finally {
  388 |       await page.keyboard.up('w');
  389 |     }
  390 | 
  391 |     // V 往返 ×2：world-drive-view 覆盖（fpv → third 回位，动线其余段视角不变）
  392 |     await page.keyboard.press('v');
  393 |     await expect(host).toHaveAttribute('data-drive-view', 'fpv');
  394 |     await page.keyboard.press('v');
  395 |     await expect(host).toHaveAttribute('data-drive-view', 'third');
  396 | 
  397 |     // R 重生（reason 'key'）：出生点即首幕锚点，随后从原点起跑
  398 |     await page.keyboard.press('r');
  399 |     const respawned = await pollDump(page, (d) => d.counters.respawns >= 1, 30_000);
  400 |     expect(respawned.ok, 'R 重生应记入 respawn 事件').toBe(true);
  401 | 
  402 |     // 遥测闭环驾驶：沿路走位 → autodrive-lab 触发圈。
  403 |     // [CC-VIS-X2-TRIAGE r1] 原 (0,-24)→(28,-28) 直线双障不可通行：① X1
  404 |     // autodrive-lab 充电桩排碰撞体（HeroBlenderMesh，x∈[16.2,17.8]×z∈[-40.3,-25.3]
  405 |     // 15m 带墙）正卡线；② X2 前景景框右桥腿 (15.7,-26)±0.62 正穿箱体。改走
  406 |     // 东西大道路线（EXP-01 同批口径）：E1 (20,-8)（路带内，隔离墩/道具簇边距
  407 |     // ≥4m）→ 东南下泊车位（桩排东面 17.8 与楼裙房西沿 29.1 之间车道，全程
  408 |     // z>-33 无裙房台阶）
  409 |     const leg1 = await driveTo(page, { x: 20, z: -8 }, { radius: 3, timeoutMs: 360_000 });
  410 |     expect(leg1.ok, `途径点 (20,-8) 应可达（实测 x=${leg1.state.x.toFixed(1)} z=${leg1.state.z.toFixed(1)}）`).toBe(true);
  411 |     const leg2 = await driveTo(page, { x: 28, z: -28 }, { radius: 4.5, timeoutMs: 360_000 });
> 412 |     expect(leg2.ok, `泊车位 (28,-28) 应可达（实测 x=${leg2.state.x.toFixed(1)} z=${leg2.state.z.toFixed(1)}）`).toBe(true);
      |                                                                                                       ^ Error: 泊车位 (28,-28) 应可达（实测 x=1.3 z=-2.1）
  413 | 
  414 |     // 触发圈进入（poi-bounding-in → firstPoiIn 首达）
  415 |     const entered = await pollDump(page, (d) => d.funnel.firstPoiIn !== null, 60_000);
  416 |     expect(entered.ok, '进入 parkingBay 触发圈应记 poi-bounding-in').toBe(true);
  417 | 
  418 |     // E 进站（world-poi → location.assign 被 route abort 拦下，上下文存续）；
  419 |     // 溜出触发圈则低速回靠再按（boundingOut 收合 activeItem 的兜底）
  420 |     const deadline = Date.now() + 240_000;
  421 |     let interacted = false;
  422 |     while (Date.now() < deadline && !interacted) {
  423 |       const s = await readSpike(page);
  424 |       if (Math.hypot(28 - s.x, -28 - s.z) > 5.4) {
  425 |         await driveTo(page, { x: 28, z: -28 }, { radius: 4, timeoutMs: 120_000 });
  426 |       }
  427 |       await page.keyboard.press('e');
  428 |       const hit = await pollDump(page, (d) => d.funnel.firstPoiInteract !== null, 5_000);
  429 |       interacted = hit.ok;
  430 |     }
  431 |     expect(interacted, 'E 进站应记 world-poi（进站跳转已被 route 拦截取证）').toBe(true);
  432 |     await page.screenshot({ path: 'test-results/obs-funnel-poi.png' });
  433 | 
  434 |     // ———— 取证与全量断言（§7 CITY-OBS-01 断言要点） ————
  435 |     const dump = await readDump(page);
  436 |     expect(dump.schemaVersion).toBe(1);
  437 | 
  438 |     // funnel 七步非 null 且单调不减（同帧相等合法）
  439 |     const steps = FUNNEL_STEPS.map((step) => dump.funnel[step]);
  440 |     for (const [i, value] of steps.entries()) {
  441 |       expect(value, `funnel.${FUNNEL_STEPS[i]} 应非 null`).not.toBeNull();
  442 |     }
  443 |     for (let i = 1; i < steps.length; i++) {
  444 |       expect(steps[i]!, `funnel 步 ${FUNNEL_STEPS[i]} 应不早于 ${FUNNEL_STEPS[i - 1]}`).toBeGreaterThanOrEqual(steps[i - 1]!);
  445 |     }
  446 | 
  447 |     // events seq 严格递增
  448 |     for (let i = 1; i < dump.events.length; i++) {
  449 |       expect(dump.events[i].seq).toBeGreaterThan(dump.events[i - 1].seq);
  450 |     }
  451 | 
  452 |     // counters 与事件互证（本动线事件量 << ring 500，dropped 必为 0 → ring 全量可数）
  453 |     expect(dump.dropped).toBe(0);
  454 |     const count = (type: string): number => dump.events.filter((e) => e.type === type).length;
  455 |     expect(dump.counters.respawns).toBe(count('respawn'));
  456 |     expect(dump.counters.respawns).toBeGreaterThanOrEqual(1);
  457 |     expect(dump.counters.poiEnters).toBe(count('poi-bounding-in'));
  458 |     expect(dump.counters.poiEnters).toBeGreaterThanOrEqual(1);
  459 |     expect(dump.counters.poiInteracts).toBe(count('world-poi'));
  460 |     expect(dump.counters.poiInteracts).toBeGreaterThanOrEqual(1);
  461 |     expect(dump.counters.transforms).toBe(count('world-transform'));
  462 |     expect(dump.counters.driveViewToggles).toBe(count('world-drive-view'));
  463 |     expect(dump.counters.driveViewToggles).toBe(2);
  464 |     // 城市首幕零锥桶（偏差①）：knockedConeCount 恒 0，cone-hit 覆盖由 OBS-01b
  465 |     // 灰盒 dump 补充。[CC-OBS-STAB] 口径修订（偏差③，见文件头注）：counters.coneHits
  466 |     // 在城市档不再恒 0 —— CC-FXN-C2 把 StreetProps.hitCount（隔离墩接触力）折进
  467 |     // 同一 cone-hit 埋点（src/lab/world/index.ts:366），撞墩即计数。断言改回与
  468 |     // OBS-01b 同构的 counters↔events 互证式：有事件时等于最新 total，无事件时为 0。
  469 |     const cityConeEvents = dump.events.filter((e) => e.type === 'cone-hit');
  470 |     expect(dump.counters.coneHits).toBe(
  471 |       cityConeEvents.length ? cityConeEvents[cityConeEvents.length - 1].data?.total : 0,
  472 |     );
  473 | 
  474 |     await saveDump(testInfo, FUNNEL_DUMP, dump);
  475 |     expect(errors.filter((m) => !isKnownUaError(m)), '漏斗全走零未捕获异常').toEqual([]);
  476 |   });
  477 | 
  478 |   // ---------------------------------------------------------------------------
  479 |   // CITY-OBS-01b 锥桶交互补充取证 @funnel（冻结表偏差①的补充用例，文件头注）
  480 |   // 城市首幕已撤锥桶（CC-L1 A2）——cone-hit 唯一可达路径 = /world-spike/ 灰盒档
  481 |   // （确定性锚点桩 (0,-4.5)/(0,-9)，WS-E2E-04 同款驾驶闭环）。产出第二份 dump，
  482 |   // CITY-OBS-06 按 §6.2 多 dump 并集合并计分。
  483 |   // ---------------------------------------------------------------------------
  484 |   test('CITY-OBS-01b 锥桶补充取证：灰盒直线撞桩 → cone-hit 事件 + coneHits 计数互证', async ({ page }, testInfo) => {
  485 |     test.setTimeout(900_000);
  486 |     const errors = trackErrors(page);
  487 | 
  488 |     await page.goto(SPIKE_URL);
  489 |     const host = page.locator('[data-ws-host]');
  490 |     await expect(host).toHaveAttribute('data-state', 'idle');
  491 |     await page.locator('[data-ws-start]').click();
  492 |     await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
  493 | 
  494 |     // 直线撞桩（WS-E2E-04 同款三次重试）：出生 (0,0) 朝北，锚点桩 (0,-4.5)
  495 |     let knocked = 0;
  496 |     for (let attempt = 1; attempt <= 3 && knocked === 0; attempt++) {
  497 |       await page.keyboard.down('w');
  498 |       const deadline = Date.now() + 150_000;
  499 |       while (Date.now() < deadline) {
  500 |         const s = await readSpike(page);
  501 |         if (s.cones > 0) {
  502 |           knocked = s.cones;
  503 |           break;
  504 |         }
  505 |         if (s.z < -14) break;
  506 |         await page.waitForTimeout(300);
  507 |       }
  508 |       await page.keyboard.up('w');
  509 |       if (knocked === 0) {
  510 |         await page.keyboard.press('r');
  511 |         await page.waitForTimeout(5_000);
  512 |       }
```