# CC-PERF-SPEC：CITY-PERF-01/02 规格恒红修复工单（调研正本）

> 执行模型自报：**claude-fable-5-thinking-xhigh**（CC-PERF-SPEC 规格工单起草人 · docs-only）

| 项 | 内容 |
|----|------|
| Task | **CC-PERF-SPEC**（Loop 续 · #182 D 门清账前置）——CITY-PERF-01/02「规格恒红」根因定谳 + 三案对比 + 推荐案验收草案 + 文件域与冲突面预判 |
| 分支 | `cursor/cc-perf-spec-fix-rs-0fc2`（base = `origin/main` @ `b7f0c9a`） |
| 日期 | 2026-08-29（UTC） |
| 性质 | **调研正本，零实现**——`src/`、`e2e/`、`playwright.config.ts` 本单不改；实现须父代理另派 **CC-PERF-SPEC-IMPL** |
| 上游定谳 | [#178](https://github.com/rayw-lab/website/pull/178) `cc-loop-audit-nav-c1.md` §2.1 PERF 规格恒红三重互证 · [#179](https://github.com/rayw-lab/website/pull/179) `cc-loop-audit-aud-c1.md` §4.2 W3' / §8.4 H3 · [#182](https://github.com/rayw-lab/website/pull/182) D 门「86−2 开窗只准两轮恒红扣减」 |
| 消费方 | 父代理（派单 CC-PERF-SPEC-IMPL）· #104 ready 门排程 · #166/#177 合流后全量 e2e 窗 · CC-AL-PERF（结构门 S3/S5 口径对齐） |

---

## 0. 结论先行

1. **病根 = 测试方案前提失实，不是性能回归**：`e2e/cyber-city-perf.spec.ts` H3 硬断言挂 `[data-ws-fps]` DOM，但该元素**只存在于** `/world-spike/` 页壳；生产城市页 `/` 全史从未挂载（`git log --all -S 'data-ws-fps' -- src/pages/index.astro` 零命中）。引擎 `index.ts` 对 HUD 挂点「缺席容忍」——`querySelector` 不创建、FpsMeter 与 `__worldSpike.fps()` 照常工作。**挂点缺席 ≠ 帧循环死亡 ≠ 性能回退**。
2. **推荐案 = A（改测试挂点）**：H3 改锚既有 `__worldSpike.fps()` 探针 + `data-world-host` 状态机探针（H1/H2 已用），删除对 `[data-ws-fps]` 的 DOM 等待；证据 JSON 的 `meter.fps` 升为 H3 主读数，`hud.fpsText` 降级为可选派生或删除。零 `src/`、最小 e2e diff、与 `human-gate-checklist.md` §5.4 注记（城市页无 HUD，真机走 `#debug` / 控制台）一致。
3. **#182 D 门恒红扣减登记**：双件合流后 e2e 分母 **86 例**（main 81 + #166 +3 + #177 +2）；开窗过门口径 = **86 − 2（CITY-PERF-01/02 规格恒红）= 84 例 0/0/0**。**止损条款：该 −2 扣减只准登记两轮**——本轮（调研）+ 下一轮（IMPL 落地并复跑绿）须清账；第三轮仍红则不得再扣减，必须阻塞合并直至修绿或董事会另裁。
4. **不入 #166/#177 账**：NAV-C1 / AUD-C1 审计均已将 PERF 双例定性为「先于 PR 存在、任何树恒败」；修复归本工单，禁把 CITY-PERF 失败算进小地图或 BGM 补洞范围。

---

## 1. 病根复述（挂点缺席 ≠ 性能回归）

### 1.1 失败签名（可复核，禁 playwright 本单）

| 用例 | 失败断言 | 报错原文（R4 空窗，NAV-C1 §2.1） |
|------|----------|----------------------------------|
| CITY-PERF-01 | H3 | `locator('[data-ws-fps]')` 等待 30s → element not found |
| CITY-PERF-02 | §3 步 ⑤ | 同上，`Q2 档 HUD 帧率仪表应出数` |

**已通过步（证明非性能回归）**：①–④ 全绿——`data-state=ready` → `robot_idle` → 变形 → `car_ready` → `driving` → 速度 >2 km/h → 20s 驾驶脚本 → rAF 采样 ≥6 帧（CITY-PERF-01）；Q2 深链 `env.quality===2` + driveTo 进站漏斗七步（CITY-PERF-02）。败点**仅** DOM 仪表等待，**在引擎遥测已出数之后**。

### 1.2 静态事实链（一手 `rg` / `git`）

| 探针 | `/` 城市页 | `/world-spike/` 灰盒 |
|------|-----------|---------------------|
| `[data-ws-fps]` | **不存在**（`index.astro` HUD 仅有 `data-ws-speed` + `data-world-respawn`） | 存在（`world-spike/index.astro` L68） |
| `__worldSpike.fps()` | **存在**（`index.ts` L479–480，与页壳无关） | 同左 |
| `__worldSession.dump()` | **存在**（漏斗七步 / `quality-auto-drop` 等） | 同左 |
| `[data-world-host]` 四态 | **存在**（H1 已断言） | 不适用 |

引擎接线（缺席容忍，非 bug）：

```92:96:src/lab/world/index.ts
  // HUD 挂点（spike engine.ts 接线迁入；缺席容忍——引擎不依赖壳页 DOM）
  const hudSpeed = opts.host.querySelector<HTMLElement>('[data-ws-speed]');
  const hudFps = opts.host.querySelector<HTMLElement>('[data-ws-fps]');
```

城市壳 HUD（无 fps 挂点）：

```123:129:src/pages/index.astro
        <div class="hud">
          <div class="hud-cell">
            <span class="hud-num" data-ws-speed>0</span>
            <span class="hud-unit">km/h</span>
          </div>
          <button class="hud-respawn" type="button" data-world-respawn>回到路口 (R)</button>
```

`git log --all -S 'data-ws-fps'`：**全仓首次引入** = `ce32485`（Phase A Spike）；城市页 `index.astro` **从未**出现该字符串。

### 1.3 规格文档失实点

`docs/spec/cyber-city-perf-test-plan.md` §1.4 底座表 L90 写「HUD `[data-ws-fps]` 在 `/` 城市档已挂（两页共用装配段）」——**后半句混淆**：两页共用 `mount()` 装配段 ≠ 两页壳 HTML 同构。正本 H3（§2.2）与 rubric §4 真机表仍写 HUD 为主读数，与 `human-gate-checklist.md` §5.4 注记（「`/` 无 `[data-ws-fps]`，屏上读数走 `#debug` 或 `__worldSpike.fps()`」）**自相矛盾**——IMPL 须一并修订测试方案 §1.4 / §2.2 H3 与 rubric §4 表行（doc 随行，加法不改秤）。

### 1.4 审计定谳引用（#178 / #179）

- **NAV-C1 §2.1**：空窗 R4 双跑 + main@`4a58789` 对照双跑，时长指纹 ±0.3m 一致 → **规格恒红（先天，非 #166）**；过门口径 **84 − 2 = 82**（当时分母 84）。
- **AUD-C1 §8.4**：独立三重互证；R2 倾向 **b) spec 改锚 `__worldSpike.fps()`**；#134 栈分支城市页亦无该元素 → **#104 合入后仍恒红**。
- **#182 D 门**：双件合流后分母 **86**；开窗 = **86 − 2 = 84**；**恒红扣减只准两轮** + **开 CC-PERF 规格工单**（本单）。

---

## 2. 修复三案对比

| 维度 | **A · 改测试挂点（推荐）** | B · 城市页补 `[data-ws-fps]` HUD | C · 删除两用例，改六腿真机 AL-PERF |
|------|---------------------------|----------------------------------|-------------------------------------|
| 核心动作 | H3 改锚 `__worldSpike.fps()` + 既有状态机/`dump` 互证；删 `locator('[data-ws-fps]')` | `index.astro` 增 fps 单元格 + 样式；引擎已有接线自动填数 | 删 `cyber-city-perf.spec.ts` + `city-perf-chromium` project；P5/S3 改口 |
| `src/` 触及 | **零** | `index.astro` + 可能 CSS；触 G-A′ 壳 HTML+CSS 预算 | 零（若只删 e2e） |
| e2e 触及 | `cyber-city-perf.spec.ts` + 测试方案/doc 修订 | 可不改断言（挂点补上即绿） | `playwright.config.ts` + 多份 spec 登记 |
| 与引擎设计 | **对齐**「缺席容忍」+ human-gate 城市页读数口径 | 与灰盒 HUD 视觉对齐；但城市 HUD 已产品化（速度+重生，无 fps 面板） | 放弃 CI 下界哨兵 |
| CI 结构门 S3 | 保留 `city-perf-evidence.jsonl` 产出 | 保留 | **击穿**——rubric S3 要求同 commit jsonl 在档 |
| 真机六腿 | 不变（本就不靠 CI HUD） | 不变 | 仅真机；SwiftShader 下无每轮回归网 |
| 首包/视觉 | 无影响 | G-A′ 壳 HTML+CSS 需复跑 `audit-budget`（当前 ~5.1/35KB 壳 CSS，增一 cell 预估 +0.2–0.6KB，大概率仍过） | 无 |
| 工期 | **小**（1 spec + 3 doc 指针） | 中（src + 可能 VIS 回归 + G-A′ 验证） | 大（秤/门/rubric/看板多表改口 + 董事会争议） |
| 风险 | doc 修订遗漏导致口径再分裂 | 产品面：城市 HUD 增开发者向 fps 读数，与 L2 霓虹面板信息架构冲突 | 性能轨 CI 失明；#182 两轮扣减无法清账（用例仍在则仍红） |

---

## 3. 推荐案 A：验收断言草案

### 3.1 H3 修订（挡合并硬断言）

**删除**（两处）：

- CITY-PERF-01：`await expect(hudFps, …).toHaveText(/^\d+ \/ \d+$/, { timeout: 30_000 })`
- CITY-PERF-02：`await expect(page.locator(SEL.hudFps), …).toHaveText(…)`

**保留并加强**（CITY-PERF-01 已有，升为 H3 唯一 DOM 无关口径）：

```typescript
// H3 帧率仪表活着 —— 引擎探针（城市页无 [data-ws-fps] 壳挂点，与 human-gate §5.4 一致）
const meter = await page.evaluate(() => {
  const ws = (window as unknown as { __worldSpike: { fps(): { avg: number; low1: number } } }).__worldSpike;
  return ws.fps();
});
expect(meter.avg, 'H3 fps().avg 必须有读数').toBeGreaterThan(0);
expect(meter.low1, 'H3 fps().low1 必须有读数').toBeGreaterThan(0);
```

**可选加固**（轮询至 avg>0，防首帧 0 假阴性；WS-PERF-01 先例是驾驶后读数）：

```typescript
const fpsLive = await pollEvaluate(
  page,
  () => (window as unknown as { __worldSpike: { fps(): { avg: number } } }).__worldSpike.fps().avg,
  (avg) => avg > 0,
  30_000,
);
expect(fpsLive.ok).toBe(true);
```

CITY-PERF-02：在漏斗 / `world-poi` 断言之后增加**同构** `fps().avg > 0`（存在腿不采样，但「仪表活着」仍属 P5 哨兵）。

### 3.2 证据 schema（§2.5）修订

| 字段 | 变更 |
|------|------|
| `meter.fps.avg` / `meter.fps.low1` | **保留**，H7 必填（已是实质读数） |
| `hud.fpsText` | **改为可选**或删除；若保留则写 `null` + 注释 `cityShellNoHudFps`（城市壳无挂点），防 schema 自检假红 |
| `gateReference` | 不变（信息性，源自 `meter.fps`） |

### 3.3 测试方案正本修订清单（IMPL 随行 doc）

1. `cyber-city-perf-test-plan.md` §1.4 底座表：删「HUD 在 `/` 已挂」；改「引擎 `__worldSpike.fps()` / `info()` 在 `/` 已挂；HUD DOM 仅灰盒页可选」。
2. 同文件 §2.2 H3：改为 `fps().avg > 0 && fps().low1 > 0`（**删除** HUD 正则）。
3. `cyber-city-perf-rubric.md` §4 表「HUD `[data-ws-fps]`」行：加注「CI 城市档以 `__worldSpike.fps()` 为准；HUD DOM 仅 world-spike / 真机 `#debug` 屏读」。
4. `e2e-test-plan.md` §5.9：同步 H3 措辞。
5. `docs/spec/cyber-city-test-framework.md`（若登记 86 例分母）：IMPL 后全量绿，**不增不减用例数**。

### 3.4 IMPL 硬门（父代理派单验收）

| # | 门 |
|---|-----|
| 1 | CITY-PERF-01/02 在标准云机 `city-perf-chromium` **0 failed**（清 −2 恒红） |
| 2 | 全量 e2e 达 **86/0/0**（或当时 fresh `--list` 分母 −0） |
| 3 | `src/` **零 diff**（案 A 纪律） |
| 4 | 上述 doc 五处修订同 PR |
| 5 | 证据 jsonl 末行 H7 自检过（新 schema） |
| 6 | WS-PERF-01 **零改动**（灰盒档锚定不变） |

---

## 4. 文件域（CC-PERF-SPEC-IMPL）

| 文件 | 动作 |
|------|------|
| `e2e/cyber-city-perf.spec.ts` | H3 改锚；删 `SEL.hudFps` 断言；证据对象调整 |
| `docs/spec/cyber-city-perf-test-plan.md` | §1.4 / §2.2 / §2.5 / §6 PR-A 验收条 H3 措辞 |
| `docs/spec/cyber-city-perf-rubric.md` | §4 读数表注记（不改权重/门线） |
| `docs/spec/e2e-test-plan.md` | §5.9 同步 |
| `docs/spec/cyber-city-test-framework.md` | 若需登记「规格恒红已清」注记（可选） |

**禁触**：`src/**`、`playwright.config.ts`（project 拓扑不变）、`SessionTimeline.ts`、poster/视觉基线、`#166`/`#177` 已合文件。

---

## 5. 与 #104 / #177 冲突面预判

### 5.1 #104（X2 立面 / facade-r2 栈 · draft）

| 面 | 预判 |
|----|------|
| 文件域 | **正交**——#104 触 `src/lab/world/city/` 立面与视觉 spec；本工单仅 e2e + perf doc |
| ready 门 | #104 复活门含「全量 0/0/0」；**未清 −2 前**集成树必为 86 例 **2 failed**（PERF）。**排程**：CC-PERF-SPEC-IMPL **应先于或并行于** #104 全量窗，否则 ready 门被 PERF 误挡 |
| 分母 | #182 已裁 **86** fresh；IMPL 清红后 #104 窗应为 **86/0/0**，非 84（84 是**扣减口径**仅适用于 #166 F3 补洞窗与开窗止损，不是永久删用例） |
| ENV/workers | #134 落栈后挤兑项与 PERF 无关；PERF 殿后 `city-perf-chromium` 不受 explore 串行化影响 |

### 5.2 #177（BGM-C1 · 已合 main）

| 面 | 预判 |
|----|------|
| 文件域 | **无交集**（BGM = `WorldAudio` / `cyber-city-bgm.spec.ts`） |
| 白名单 | 合流后 42 type / 10 族；PERF 不修 SessionTimeline |
| 语义 | BGM 默认 OFF / ducking 与 fps 探针无关；CITY-PERF 驾驶脚本已含 `boost-first` 互证，不触 `world-bgm` |

### 5.3 #166（NAV-C1 · 合流中）

- 审计已明确：**PERF 不入 #166 F1–F3**；F3 过门 = **82 例**（84−2）。IMPL 落地后 F3 可升格 **84 例** 全量。

---

## 6. 恒红扣减两轮限期登记（#182 D 门）

| 轮次 | 动作 | 分母口径 | 状态 |
|------|------|----------|------|
| **R1（本轮）** | CC-PERF-SPEC 调研正本落盘；登记 −2 原因与推荐案 | 86 − 2 = **84** 开窗允许 | **本 PR** |
| **R2（限期）** | 父代理派 **CC-PERF-SPEC-IMPL**；云机复跑 CITY-PERF-01/02 绿 + doc 修订 | 恢复 **86/0/0**；销 −2 | **待派** |
| R3（违约） | 若 R2 未绿仍申请扣减 → **禁止**；阻塞合流直至修绿或董事会另裁 | — | — |

**登记矩阵**（编排 Delta，本单仅性能轨 e2e 子项）：

- 北极星 perf：**98** / 生产登记：**—**（真机六腿未跑，维持）
- 本工单影响：**e2e 结构门 S5** 前置清红；**不**改 northStar 数字

---

## 7. 派单骨架（父代理复制用）

```
Task: CC-PERF-SPEC-IMPL
model: claude-fable-5-thinking-xhigh
base: main@<tip after 本 PR merge>
文件域: §4 表；禁 src/
验收: §3.4 六条硬门
背景: docs/research/cc-perf-spec-fix-rs.md（本文件）
纪律: 禁跑与本机 F3 全量争跑道；云机 city-perf-chromium 殿后串行
```

---

## 8. 附：取证命令（复核用，禁本机 playwright 实跑）

```bash
# 挂点全史
git log --all -S 'data-ws-fps' --oneline -- src/pages/index.astro   # 期望零行
rg 'data-ws-fps' src/ e2e/                                          # 期望仅 world-spike + perf spec

# 城市壳 HUD
rg 'data-ws-' src/pages/index.astro                                 # 应有 speed/respawn，无 fps

# 引擎探针
rg '__worldSpike\.fps' src/lab/world/index.ts                       # 应有

# 构建产物（需 pnpm build 后）
rg 'data-ws-fps' dist/index.html                                    # 期望零匹配
```

---

*CC-PERF-SPEC · 2026-08-29 — CITY-PERF-01/02 规格恒红调研正本：挂点缺席 ≠ 性能回归；三案对比推荐 A（测试改锚 `__worldSpike.fps()`）；验收断言草案 + 文件域 + #104/#177 冲突预判 + #182 两轮恒红扣减登记。doc-only，实现须父代理另派 CC-PERF-SPEC-IMPL。*
