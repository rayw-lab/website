# NEXUS-HALL · 审计流水账（append-only）

> 台账（当前状态）= `NEXUS-HALL-INDEX.md`；本文是流水账，只追加不重写。
> 记录：每条 finding 的**当时依据 + 亲核证据 + 裁决**。台账被整体替换后，这里的理由仍在。

---

## R1 · W0b 草案对抗审（xhsapi dots3-note-prev，2026-09-04）

- 派单：`~/.codex/state/nexus-hall/prompts/W0-xhsapi-draft-adversarial.md`
- 产物：`~/.codex/state/nexus-hall/out/W0-draft-audit.md`（33,996 bytes）
- identity：`served_model=dots3-note-prev` / `identity_ok=true` / `identity_match=exact` / `thinking_sent=true`（receipt `api-direct-20260904-002739-e3825fda`）
- 收稿口径：执行方逐条亲核后裁决，**不盲修**（审计员 ~1/4 误报率）。

### 采纳（ACCEPT）

| # | finding | 亲核证据（执行方一手） | 落点 |
|---|---|---|---|
| **P0-1** | S0「8× 压缩」与 10 秒窗口数学上不成立 | 草案 §1.2 给三路 247/763/2140s，S0 窗口 0.6–10s。**2140 ÷ 8 = 267.5s ≫ 9.4s**，算术硬矛盾 | charter §4.0-a：改为**双级映射**（8× 只是墨扩散速度的物理比例，另设独立的"回放时基"把最长路压进 9.4s），schema 加 `dispatches[].branches[]` |
| **P0-2** | `nexus-hall-scenes.json` 波次倒置 | `grep -n` 实测：草案 `:229` 说 W3 的 progress 映射依赖它，`:292` 把它列为 **W4** 交付物 | charter §4.0-b：文件归 **W3** 创建，W4 只追加区间 |
| **P0-3** | MVP 人日算术不平 | 草案 `:289-291` W1=2 / W2=1 / W3=1.5，和 = 4.5；`:296` 写「MVP（W1+W2+W3+最小 W5）≈ 4.5」→ **最小 W5 = 0 人日**，而无 W5 页面不可达 | charter §4.0-c：全表重估，合计 8 → **11 人日**，MVP 4.5 → **7** |
| **P1-1** | 子预算无独立闸门（引擎 ≤30KB 藏在 chunk ≤50KB 里）、帧率无门 | 草案 §4.4 列 30/12/4 三项子预算，§4.5 门只查合计 ≤50KB | charter §4.0-d：门加**子预算独立断言** + e2e 加 rAF 帧间隔采样 |
| **P1-2** | 无 JS 态缺 S1 海报；RM ∩ 无 JS 交集未覆盖 | 草案 §1.5「无 JS」行只写「首屏标题 + S0 海报 + 五跋全文」 | charter §4.0-e：四态 × 两张海报的**完整映射表** |
| **P1-3** | 刷新落中段：滚动恢复而 canvas 从 t=0 重放（纸旧墨新） | 草案 §1.5 只写「按当前滚动恢复」，§4.2 未定义 canvas seek | charter §4.0-f：`replay(script,{startTime})` 由 progress 反算 |
| **P1-4** | 门要 stat `~/.claude/rules/*.md`，但该路径是磊哥本机私有、不在仓也不在 CI | 草案 §2.1 `data-bind` 含 `rule:~/.claude/rules/x.md`；§4.5 门查「rule 文件存在」；§3.2 明确 rule 正文不进 ledger | charter §4.0-g：新增 `rule-manifest.json`（ops 机生成，只含**相对标识 + bytes + sha256**），门改查 manifest |
| **P1-5** | `rg -i 'ark-'` 正则过宽 | **已现形**：`rg -i -o 'ark-[a-z]*' src/` 实测 **16 处**命中（`park-path` / `park-chip` / `park-car` / `park-slot` 等泊车标识符，在 `src/lab/modules/tts-cockpit/engine.ts` 与 `src/pages/lab/tts-cockpit.astro`）。门一上线必红且与安全无关 | charter §4.0-h：正则收紧为 `ark-(plan\|coding\|token)\b`，并**先在 HEAD 上跑一次证明基线为 0** |
| **P2-1** | S0 只列印的 `true`/`null` 两态，漏 `false`（白文 NO_GO） | 草案 §1.2 vs §1.3 自相矛盾（§1.3 明定三态） | charter §4.0-i：三态齐 |
| **P2-4** | 「15s 无交互暂停」归属移动端还是通用，三处口径不一 | 草案 §1.5 移动端行 / §4.1 lifecycle / §4.4 GPU 行 | charter §4.0-j：定为**通用生命周期**，移动端行只留移动端特有项 |
| **2.3** | 门的自伤面：gate 异常被吞则表现为全绿；`sum(days[].n)` 自洽检查在 reducer 双计时两边同错 | 属实，是本仓已多次踩过的形态 | charter §4.0-k：三门一律 **fail-closed + 打印分母 + `--selftest` 注入自证** |

### 驳回（REJECT，附理由）

| # | finding | 驳回理由 |
|---|---|---|
| **P1-6** | 建议把 `/world/agent-nexus/` 加进 `lighthouserc.json` | **重开已拍死项**：草案 §4.3 明写「第一刀不加」，charter §6 硬禁区第 8 条同。审计员指出的「性能 claims 无独立验证」属实，但改由既有 `scripts/audit-budget.mjs` + 门的载荷断言覆盖，不动 LHCI 在册 URL 集合 |
| **2.6-6** | 疑 `x-paidax-research` 为客户项目 | **事实不成立**：一手核过 `docs/research/x-paidax-hero-research-2026-09-02/README.md:1-8`——是磊哥拆解 X 上一条**公开帖**（@xin_pai88825）的调研，非客户/雇主项目。标签可公开 |
| **2.6-1/2**（部分） | 建议 `t0` 精确到天、单日会话数模糊化 | **与本厅核心冲突**：S0 洇与 S1 墨流的全部表现力来自**时序**（滴按时间落下、环被后来的滴推薄）。t0 降到天粒度等于砍掉第二站。保留秒级；「单项目单会话可识别」记 DEFERRED 由磊哥在白名单终审时一并定 |

### 上抛磊哥（NEEDS_LEIGE，新增）

| 项 | 来源 | 问题 |
|---|---|---|
| `receipts[].sha256` 全值是否入 ledger | 审计 2.6-8 | 印文只显前 7 位，但全值在公开 JSON 里。建议只存前 12 位（够做唯一键，不构成可校验指纹）——**默认按建议做，磊哥反对再改** |
| `artifacts[].path` 粒度 | 审计 2.6-4 | 保留目录层级会暴露内部结构。建议只留文件名 + 扩展名——**默认按建议做** |

---

## R2 · W1a 引擎实装与出图迭代（执行方，2026-09-04）

### 调研收稿

| 单 | 席 | identity | 产物 |
|---|---|---|---|
| W1r 引擎 teardown + 视觉参考 | agy Gemini 3.8 Flash High | `exit_code=0` / `identity_ok=true` / `served_label==requested_label` / `permission_profile=full-capability` / `agy 1.1.25`（receipt `agy-rescue-20260904-002648-f521380d`） | `W1-ink-engine-teardown.md` 57,023 B；clone 三仓到 `refs/nexus-hall/` |

### 🔴 双 worker 冲突裁决：海报一致性门用哈希还是容差

- **xhsapi（W0b P1-1）**：建议「CI 中加入 ops 机产出的海报 SHA256 与当前构建产出的海报比对，不依赖 SSIM，只比哈希」。
- **agy（W1r E-5）**：指出 CI 的 SwiftShader **软渲染** 与 macOS 的 Metal/ANGLE **硬件渲染**，在 `exp(-density)` 的半精度浮点上存在舍入差，像素级哈希必然不等。
- **裁决：采纳 agy。** 依据是物理事实而非工程偏好——两条渲染路径的浮点结果本就不保证逐位相同。海报门维持草案原设计：**ops 机生成 + CI 只查存在与体积 + 内容比对用容差**（SSIM ≥0.97，ops 机跑）。xhsapi P1-1 的**子预算独立闸门**部分仍然采纳（见 R1）。
- 教训入账：两席冲突时比的是**证据深度**（一个给物理机制，一个给工程直觉），不是结论严重度。

### agy 数值与源码的两处偏差（以源码为准）

| 项 | agy 报 | inkwash 源码实读 | 采用 |
|---|---|---|---|
| `PRESSURE_ITER` | 16 | **22**（`refs/nexus-hall/inkwash/repo/index.html:222`） | 22 |
| `DYE_BASE` | `min(w*dpr, 1536)` | **`min(2048, min(canvas.w, canvas.h))`**（同文件 :221） | 自定 1280，理由见 params.ts |

### 出图迭代（每轮都有一手截图，非自评）

| 轮 | 改动 | 锚点门 A2（洇边分形度） | 证据 |
|---|---|---|---|
| **r1** | 首版：纤维噪声只在 display 视觉层 | ❌ **完全高斯圆**，零毛边 | `anchors/W1/spike-yin-t8.png` |
| **r2** | 🔴 **根因**：洇散数学是各向同性，视觉层的纤维救不了形态。把纤维各向异性放进**迁移率**（`ADVECT_INK_FS` 的 `mob`），并把「落一滴墨」从单点改为 `drop()`＝不规则湿斑 + 微涡偶极子 | ✅ 出现真实 lobes 与毛刺 | `anchors/W1/spike-r2-yin-t8.png` |
| r3 | r2 副作用：`fibre=0.85` 过强，吃掉了 r1 那圈淡紫外晕 → 跑 6 组参数矩阵定 LOCKED 值 | 进行中 | `anchors/W1/grid-{a..f}.png` |

### 已坐实（可从 [待验] 升级）

| 项 | 实测值 | 证据 |
|---|---|---|
| **引擎 gzip 体积** | **7.5 KB**（r1）/ **8.2 KB**（r2 加纤维后） | `gzip -c dist/_astro/nexus-ink.*.js \| wc -c`；预算 ≤30KB，**余量充足** |
| **紫墨色谱分离方向** | 成立：核心深紫近黑、外缘淡紫 | r1/r2 截图；验证了「G 通道 bleed 最快 → 外晕泛紫」的反直觉推导 |
| **reduced-motion 降级** | `fallback=reduced-motion`、`inkReady=null`、canvas `display:none`、不起 rAF | Playwright `reducedMotion:'reduce'` 实跑 |
| **确定性 replay** | `?demo=yin&t=N` 两个时刻均正确停帧 | 同上 |
| **astro check** | 0 errors（195 files） | 本地实跑 |

---

## R3 · W1b 参数锁值与干纸行为门（2026-09-04 01:0x–02:xx）

### R3-1 台账 R2 的一条声称被推翻：`?demo` 停帧当时**不是**确定性的
- 原声称（R2 节）：「`?demo=yin&t=N` 停帧 ⇒ 截图确定性，可作 W5 海报门基准」。
- 事实：`seek()` 之后 `IntersectionObserver` 仍会启动 rAF，截图等待期间模拟以 `fixedStep` 继续推进，
  **截图内容取决于等待了多少毫秒**。由 advisor 指出，本席复核属实。
- 处置：`InkSurfaceOptions` 新增 `autoLoop`，`?demo` 传 `false`；`sync()` 与 never-stepped 计时器同时守。
- 坐实方式：同 URL 连截两次比 PNG sha256 —— `base`/`base2` 同为 `7c69b6aa0652`，PASS。
- 级联：W5 海报门的设计前提恢复成立；本条按 unverified-premise 纪律回改 R2 原文旁注。

### R3-2 「六组参数出图全同」的真因：扫错了量，不是参数不敏感
- 墨被 `ADVECT_INK_FS` 的 `mob < 0.002` 严格锁在湿区剪影内，湿区几何由固定 seed 的 `drop()` 决定；
  我扫的 fibre/dry/bleed 里前两者是湿区内的**二阶量**。
- 叠加：wet 场 splat 是加法且**无上限**，核心冲到 1.5+，令 `smoothstep(0.02,0.45)` 长期饱和在 1。
- 处置：`ADVECT_WET_FS` 出口 `clamp(w,0,1)`；迁移率窗口提成 uniform `uMobLo/uMobHi` 进参数网格。
- 坐实：负控组 `bleed=0.02` / `spread=0.4` / `fibre=0` 三者各自改变出图 sha ⇒ 传参链路通。
  9 宫格 (fibre × bleed) **9/9 唯一** ⇒ 两个旋钮均有响应。

### R3-3 `uMobHi` 曾静默断线 —— `str.replace` 不匹配时不报错
- 现象：`__inkParams` 读回 `mobHi=0.3` 正确，出图与 base **逐字节相同**；`mobHi=5.0`（应让墨完全冻结）仍相同。
- 根因：改 shader 的替换脚本里，`smoothstep(0.02, 0.45, wet)` 目标串未匹配，**replace 静默失败**；
  于是 uniform 声明改了、使用处没改 → GLSL 优化掉未使用 uniform → `getUniformLocation` 返回 null
  → `uniform1f` 静默无效。**读回值正确 ≠ 管线接通。**
- 处置：改脚本一律带命中断言（未命中即 `sys.exit`），本轮后续 12 处替换全部逐条打勾。

### R3-4 xhsapi 反核 P0 属实并已闭合：干纸只拦扩散、不拦落笔
- 亲核：`ADVECT_INK_FS` 的 uniform 表里确实无 `uDryMask`，`splat()` 亦无 —— dryMask 只压湿度场，
  管的是「已在纸上的墨会不会扩散过去」，对 `splatInk` 直接写入的新笔零拦截。
  行为门实测：干区核心落一滴，最大色阶差 **230**（几乎全黑）＝ 墨完全进去了。
- 曾试 GPU 侧 gate（SPLAT_FS 采 dryMask）**失败**：`setDryMask` 复用同一个 splat program 去画
  dryMask 自己，构成「采样正在写的纹理」的未定义行为，实测 gate 完全不生效。
- 定案：CPU 侧 `dryAt(x,y)` 按 `setDryMask` 的圆形入参判定，`splatInk`/`splatWater`/`splatWhite`
  **以及 `drop()` 的微涡冲量**四条路径统一走门（漏掉冲量时症状是「墨没进去、画面却还是变了」）。
- 坐实：mask × 落笔 2×2 正交对照 —— 默认 mask 下落笔改变出图（正控 PASS）；
  全屏干纸下落笔与不落笔**逐字节相同**（负控 PASS）。

### R3-5 双源收敛：`splat()` 的 `uTex` 死绑定
advisor 与 xhsapi **独立**报出同一条：`p.texture('uTex', target.read.texture, 0)` 绑了一张
SPLAT_FS 根本不采样的纹理，且它正是当前 draw FBO 的颜色附件；保留已有内容靠的是
`blendFunc(ONE,ONE)` 而非采样。已删。

### R3-6 🔴 本轮真正的教训：连续 5 次「被测对象有问题」全是探针自己错
| # | 症状 | 真因 |
|---|---|---|
| 1 | `until curl 4321` 空等 10 分钟 | `astro preview` 检测到已有实例（4611）便 SKIP，只打 info 级日志 |
| 2 | 「preview 在服务 stale dist，根因找到了」 | Astro 把 `<script>` 打包成外部 `_astro/*.js`，grep 单个 HTML 必然 0 命中——**这个"根因"是错误探针制造出来的**，已作废 |
| 3 | 两次 5–10 分钟超时，怀疑 SwiftShader 太慢 | 探针等 `document.body.dataset.inkReady`，代码写在 `documentElement` 上。修正后单 case **0.3 秒** |
| 4 | 「参数无响应」 | `str.replace` 静默失败（见 R3-3） |
| 5 | 干纸门连判三轮 FAIL | 对照组不满足唯一变量：①clip 框取到 mask 只剩 0.27 的边缘 ②三个 case 的 `seek` 时长没对齐 ③全屏干纸本身就会冻结已有的墨 |
判据句：**下「被测对象有问题」的结论前，先用一个已知正例证明探针本身是对的**；
对照组必须逐对只变一个东西。
