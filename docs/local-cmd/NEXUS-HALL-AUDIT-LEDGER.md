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

### R3-7 advisor 二次咨询抓出两个洞（均属实，已闭合）
1. **时序污染**：9 宫格是在修 `smoothstep` **之前**拍的 —— 那时窗口仍是硬编码 `(0.02,0.45)`、
   `uMobHi` 断线，基础形态与现役不同。派出去审图的 agy 因此在审一套已不存在的参数。
   处置：网格重拍进 `w1b-grid2/`（含 mobHi 轴，11/12 唯一；`mobhi0.85` 与 `f0.62-b0.5` 同 sha
   是**正确的**——那正是默认组合，等于一条免费的内部一致性正控）。旧网格锁值结论作废，
   agy 稿只取 R1–R3 反向门与审美方法论。
2. **干纸门只闭合了「笔心在区内」**：splat 是高斯足迹，笔心落在边界外侧时 CPU 门放行，
   尾部照样写进 ink，而 ink 场没有 wet 那样的每帧 `(1-mask)` 清扫。
   处置：新增 `SPLAT_DRY_FS` **独立 Program 实例**做逐片元 gate（R3-4 否定的是"复用同一
   program 自采样"，不是 GPU gate 路线本身；两个实例就没有反馈边）。CPU 门降级为 early-out。
   未采纳「每帧 `ink *= (1-mask)`」：高斯 mask 的无限尾会变成常驻蒸发场，吃掉合法墨。

### R3-8 W1b 锚点门（`scripts-local-nexus-w1b-gate.mjs`，可复跑）
| 项 | 判据 | 结果 |
|---|---|---|
| uMobHi 接通 | `mobhi=5.0` 须改变出图 | ✅ |
| 迁移率有响应 | `mobhi=0.3` 须改变出图 | ✅ |
| 干纸·笔心在内 | 全屏干纸下落笔与不落笔**逐字节相同** | ✅ |
| 干纸·笔心在外 | 干区核心最大色阶差 ≤12 | ✅（实测 8，理论上界 5.4，未加门时 230，衰减 29×） |
| 正控 | 该笔在纸上别处确实画出来了 | ✅ |
判据的物理依据（不是拍脑袋定的门槛）：核心区边缘 mask=0.972 → gate 尚有 2.8%，
笔的高斯在那里是 0.21，密度 1.7×0.21×0.028=0.010，经 Beer–Lambert 约 5.4 色阶。
**真实宣纸的胶矾边界不是刀切，零渗漏反而假**——所以判据是容差不是逐字节。

### R3-9 视觉整改：墨色 / 构图 / 大笔触形态（磊哥标准「极品炫技·高级感」）
- 🔴 **首图是紫的不是墨的**。根因：落笔 density 传 `[0.55,0.72,0.42]`（G 比 R 高 31%），
  而 ABSORB 的 G 也最高（1.12），两者叠加使**墨核本身**吸绿显紫，像碘酒。
  定案：**density 必须中性**，偏色只由 CHROMA 的扩散速率差在外缘生成；冷暖交给 ABSORB
  （新值 `[1.06,1.0,0.85]`，吸红>吸绿>吸蓝 → 残留偏冷 → 墨核成冷黑而非死灰）。
- 构图改疏密三阶（浓 0.058 / 中 0.038 / 淡 0.026），不做等距排列。
- **大笔触收敛成圆**的排查（连续四次假设各只带来微小改善 —— 典型的"在同一维度加候选"）：
  ① 纸纤维频率 0.012→0.035（尺度必须远小于笔）② 次级湿斑（分形=多尺度自相似）
  ③ kick 由 sqrt 改回线性（相对扰动 kick/radius 应与尺寸无关）④ sim 256→512。
  **真因是 seed**：seed=7 恰好接近均匀分布 → 出圆；换 19 立刻恢复不规则轮廓。
  不是系统性缺陷，是单样本运气。①–④ 各有独立价值予以保留（②③ 尤其防大笔失真），
  但**归因必须落在 seed 上**，不能把功劳挂在前四项。
- 线性 kick 首试画面全白（引擎 `ready=1`、零 console 报错，最难查的那种）：
  当时把 lobes 一并提到 10，冲量总量约 4 倍把颜料吹散。已补 `ADVECT_VEL` /
  `GRADIENT_SUB` 速度 clamp（xhsapi P2 早已点名：此前仅 VORTICITY 一处有 clamp）。

### R3-10 xhsapi findings 处置表（已全部闭合，2026-09-04 03:4x）
| 来源 | 项 | 处置 |
|---|---|---|
| xhsapi P1 | idle 停转 `mobile?12:12` 死代码 + `!onFrame` 恒 false + `idleSeconds` 未消费 | 待修（W3 真机会撞） |
| xhsapi P1 | 无 ResizeObserver，旋转/缩放后 FBO 与 canvas 失配 | 待修（W3 真机会撞） |
| xhsapi P1 | `init-failed` 死枚举（着色器编译失败被打成 `no-webgl2`） | 待修 |
| xhsapi P2 | dt 上界只夹 `real`，`fixedStep`/`seek` 裸奔 | 待修（十行内） |
| xhsapi P2 | `dispose()` 后 public 入口未守 disposed；never-stepped timer 未 clearTimeout | 待修（十行内） |
| xhsapi P2 | `halfFloatLinear` 探测后从未消费 | 拟删字段 |
| advisor | sim 256→512 有可见改善但 12 pass × 4 倍像素，中端手机 30fps 目标下需实测 | DEFERRED 至 W3 真机 |


### R3-11 P1/P2 逐条闭合 —— 每条都做行为验证，不接受"编译通过"结案
| finding | 处置 | 验证方式与结果 |
|---|---|---|
| P1 idle 停转（`mobile?12:12` 死代码 / `!onFrame` 恒 false / `idleSeconds` 未消费） | 统一按 `params.idleSeconds` 停转，去掉 onFrame 条件 | 行为探针：阈值后连读两次 HUD 时刻 `8.5 → 8.5` ✅ |
| ↑ 修的过程中发现**更深一层 bug** | `idleSince` 此前累加的是被 `MAX_DT` 夹持后的步长 —— 软件渲染 10fps 时每秒只累加 0.33，**12 秒阈值要跑满 36 秒墙钟**。改为累加真实墙钟 | 首轮验证 `10.8 → 12` FAIL 才暴露；不做行为验证就会当成已修 |
| P1 无 ResizeObserver | 加 ResizeObserver + 180ms debounce → `engine.resize()` 重建全部场，并**重放干纸区**（语义资产不能因一次旋转消失） | 探针改视口 970→610：backing store 跟随 ✅ / dye 宽高比跟随 ✅ / resize 后仍能落新笔 ✅ |
| ↑ 判据一度选错量 | 首版判据是"dye 数值变了"，2045→2044 差 1 像素即判 PASS。实则 `fit()` 用固定短边，**dye 只随宽高比变、不随尺寸变**，正确判据是比值 | 判据选错量与实现出错症状相同，先算清「这个量本该怎么变」 |
| P1 `init-failed` 死枚举 | `create()` 只对「环境不支持」返回 null，构造异常向上抛；`mount()` catch 后归类 `init-failed` | **注入负控**：篡改 `getShaderParameter` 让 COMPILE_STATUS 恒 false → 实报 `init-failed` ✅；配正控（不注入时正常起 ✅） |
| P2 dt 上界只夹 `real` | 上界移到 `engine.step()` 入口统一夹 `[0, 1/30]`，`fixedStep`/`seek` 一并受保护 | 锚点门复跑全过 |
| P2 dispose 后 public 入口无守卫 | `splatInk`/`drop`/`splatWater`/`splatWhite`/`setDryMask`/`setBrush` 全加 `if (this.disposed) return` | astro check 0 errors + 门复跑 |
| P2 never-stepped timer 未清 | 存 id，`dispose()` 里 clearTimeout（连同 resize debounce timer 与 ResizeObserver） | 同上 |
| P2 `halfFloatLinear` 探测后从未消费 | allocate 内 5 处 `gl.LINEAR` 改为按探测结果取 `LINEAR`/`NEAREST`，兑现 gl.ts 注释的承诺 | 同上 |
| P2 速度 clamp 只在 VORTICITY | `ADVECT_VEL` / `GRADIENT_SUB` 补 clamp | 见 R3-9（线性 kick 曾把颜料吹散） |
| P1 `splat()` uTex 死绑定 | 已删（advisor 与 xhsapi 双源独立报出） | R3-5 |
| P0 干纸只拦扩散不拦落笔 | 逐片元 gate + CPU early-out | R3-4 / R3-7 |

## R4 · W2 起手（2026-09-04 03:5x–04:0x）

### R4-1 会话数据一手盘点（reducer 的输入基准，先盘点再派单）
| 项 | 实测 |
|---|---|
| `~/.claude/projects/` 项目目录 | 23 |
| `*.jsonl` 文件 | 1474 |
| 总大小 | 2.0 GB |
| 单行顶层字段（样本） | `sessionId` / `type` / `leafUuid` |
| `type` 枚举（单文件分布） | `user`(166) `assistant`(368) `attachment`(484) `system`(13) `last-prompt`(63) `mode`(63) `permission-mode`(63) `bridge-session`(63) `atis-latch`(63) `ai-title`(62) `file-history-snapshot`(14) `queue-operation`(16) |
- 2.0 GB ⇒ reducer **必须流式**，不能整目录读进内存（派单时已写死此约束）。
- 🔴 `queue-operation` 是已知高危类型：本机规则库有「整类丢 queue-operation 记录致 62.5%
  用户指令丢失、四路下游无一察觉」的先例。reducer 的类型覆盖必须拿**全集**对账，
  不能只处理 user/assistant 两类。
- 这 12 种 type 是**单个文件**的分布，不是全集；跨 23 个项目的 type 全集需另行统计后才能当契约。

### R4-2 glm53flash 通道认知：思考吃掉预算导致代码块截断
- 两路 W2 草稿（gate / reducer）**均在句中截断、代码围栏未闭合、无法落盘**。
- 非通道故障：`identity_ok=true`、`served_model=glm-5-3-flash` 均正常。
  真因是 `finish_reason=length` —— 48000 预算打满，其中
  **reasoning_tokens 占 45457（94.7%）/ 37525（78%）**，正文只剩两三千。
- 处置：提额至 120000（接近 128K cap）+ 派单加硬要求「先输出完整且闭合的代码块，再写说明」，
  这样即使再截断也先拿到能落盘的东西。
- 回写路由认知：**给 glm-5-3-flash 派"写完整脚本"类任务时，48K 不够**；
  按正文需求的 ~5-10 倍预留，或把任务拆成多次单文件产出。

### R4-3 agy 视觉裁决（旧网格版）——锁值作废，但两条结论有效且构成双源收敛
- **反向门 R1/R2/R3 全 PASS**：出图零具象物、无多色水彩、无 UI 笔刷引导。
  （其对 R2 的描述"单色紫墨五档浓淡"是**旧图**的事实；现役已改冷黑墨，需在下一轮复判。）
- 🔴 **§5.2 与 advisor 独立收敛**：九张图宏观差异过小，根因是
  ① `drop()` 的湿迹几何由固定 seed 决定，约 t=2s 后速度耗散、湿区成为不变的固定场；
  ② `ADVECT_INK_FS` 的 `mob < 0.002` 早退构成绝对屏障，墨永远冲不出预设湿迹轮廓；
  ③ `fibre`/`bleed` 属边界着色与扩散率算子，只在过渡带做微观再分配。
  两个异源（advisor 与 agy）从不同路径得到同一机理 = 可信度最高的一类证据。
- 🔴 **对 W3 的硬约束（采纳其建设性建议）**：数据映射层必须把会话权重注入
  **`drop()` 的初速度 / 墨量 / 偏心率**，从宏观几何源头制造差异；
  只映射"落点"不足以让不同会话看起来不同 —— 这决定了 W3 的数据契约要多带哪几个字段。

### R4-4 🔴 抽取式探针在写进契约前被自己的正控拦下（本轮唯一一次「提前」抓住）
- 为省时间，用正则 `"type"\s*:\s*"([^"]+)"` 抓每行第一个 type 统计全集，得到
  **68 种 type**，`message`(123520) 高居第一。若直接当数据契约派给 reducer，
  整个 W2 会建在假分母上。
- **对照验证**（随机 40 文件 × 30 行 = 891 行，真 `json.loads` 取顶层 type）：
  正则与真顶层**仅 36.6% 一致**，错配 565 行。最常见错配：
  `message → assistant`(×469)、`hook_success/skill_listing/deferred_tools_delta → attachment`。
  真相是这些全是**嵌套字段**（`content[].type`、attachment 内层），根本不是顶层 type。
- 真·顶层 type（样本）：`assistant` `user` `attachment` `last-prompt` `queue-operation`
  `mode` `permission-mode` `ai-title` `file-history-snapshot` `system` `atis-latch` —— 约 11 种。
- 处置：作废 `type-census.json`，改用真 `json.loads` 全量普查，并加**闭合账断言**
  （`covered + no_top_level_type + parse_error == lines`），防"静默少数了一批"。
- 🔴 与本轮前 5 次探针事故的区别：**这一次是在结论进入下游之前主动做的对照**。
  判据句已沉淀进 `docs/skills/webgl-ink-frontend.md` §三：
  「抽取式探针必须配命中率反查——用**确知在里面的样本**反算命中率，随料一起交付。」

### R4-5 reducer 覆盖门的真分母（一手全量普查，非抽样）
`evidence/nexus-hall/w2/type-census.json` · 1474 文件 / **358,722 行** / 解析失败 0 / 无顶层 type 0（闭合账成立）
**真·顶层 type 全集 = 23 种**。三个数字互不相同，正好说明三种探针的可信度：
| 来源 | 结果 | 真伪 |
|---|---|---|
| 正则抓每行第一个 `"type"` | 68 种 | 🔴 假（63.4% 错配，抓到嵌套字段） |
| 随机抽样 891 行真解析 | 11 种 | ⚠️ 偏小（罕见 type 抽不到） |
| **全量真解析 358,722 行** | **23 种** | ✅ 契约以此为准 |
- `assistant`/`attachment`/`user` 三类占绝大多数；其余 20 种是长尾但**不可忽略**。
- 🔴 `queue-operation` 10,918 行：本机规则库有「整类丢弃致 62.5% 用户指令蒸发、
  四路下游无一察觉」的先例，reducer 必须对它显式表态（映射 or allowlist 忽略），
  不许落进默认分支。
- **reducer 验收门**：处理的 type 集合必须与本文件的 23 种做**契约闭合**——
  每种要么显式映射、要么显式 allowlist 忽略，二者必居其一，缺一即 FAIL。

### R4-6 S1 墨流原型（W3 前置，`?flow=N`）
- 落实 advisor 与 agy 双源收敛的结论：`drop()` 新增 `shape: { vigor, eccentricity }`，
  数据映射层从**宏观几何**（冲量倍率 / 湿迹偏心）注入差异，而非只映射落点。
  默认 `vigor=1, ecc=0` ⇒ 与既有行为逐字节等价，W1b 锚点门复跑无回归。
- 原型把「一百天」压进 12 秒：半径 ∝ log(体量)、浓淡 ∝ 体量、vigor/ecc 由确定性伪随机给。
  出图 `evidence/nexus-hall/anchors/W3-flow-100.png`：卷曲分形边缘、浓淡层次、
  聚集处相互推挤都出来了，左右两组形态差异明显 ⇒ shape 参数确实作用于宏观剪影。
- 🔴 **性能实测（SwiftShader 软件渲染，非真机）**：`fps 5 · sim 409×256 · dye 2044×1280`，
  17s 墙钟只推进到模拟 t=2.2s（约 18/100 滴）。**这个数字不能外推到真机**——
  软件渲染无 GPU 并行，差一个量级以上。真机 30fps 目标进 DEFERRED，W3 必测。
- 两处已知短板（下一轮处理）：① 伪随机分布成团，不像"一百天的指纹"，
  真实数据的时间结构会改善但需 W2 ledger 到位才能判；② dye 2044×1280 是否需要下调，
  与 sim 256→512 的取舍一并在真机上定。
- 探针教训（又一次）：`?demo` 停帧模式下 `seek(13)` 是**同步**的，100 滴的场直接把主线程堵死，
  `page.goto` 30s 超时。flow 类长场景必须走真实 rAF，不能用 seek 停帧。

## R5 · W2 落地（2026-09-04 03:4x–04:1x）

### R5-1 glm53flash 双路收稿（提额后 `finish_reason=stop`，围栏闭合，identity_ok=true）
| 产物 | 落点 | 亲核结果 |
|---|---|---|
| 发布安全门 | `scripts/nexus-ledger-gate.mjs`（221 行） | `--selftest` **9 红 1 绿**全过，绿样本含 `park-*` 16 条回归；实跑 ledger rc=0，0 违规，分母打印完整 |
| 归约器 | `scripts/nexus-ledger-reduce.mjs`（703 行） | 实跑 2.0GB → **1067 会话 / 31 天 / 255116 B（gzip 17141 B）** |
- 提取踩坑两处：① 首版正则只认 ```` ```mjs ````，而产物用了**嵌套围栏**（外层 ````` ```` `````、内层 ``` ```），
  按行切才拿对；② 注释里写了 `/Users/*/Projects/x`，其中的 `*/` **提前闭合了块注释**，
  后面的中文变成代码 —— 顺手也修了脱敏（注释里本就不该出现 `/Users/`）。

### R5-2 先写门的价值兑现：正确性门一次抓出真缺口
`scripts/nexus-ledger-verify.mjs`（我写，与 glm 的安全门职责分离，两门都跑）首跑 rc=1：
1. **23 种 type 全部未表态** —— reducer 没有 `typeCoverage`，`queue-operation` 那 10,918 行
   到底被怎么处理了**从产物上完全看不出来**。已补 `TYPE_POLICY` 显式表（mapped 2 / ignored 21，
   每条 ignored 必须写理由），并加 **fail-closed**：出现表里没有的新 type 直接 `exit 1`。
   —— 写死的清单不会自己长大，只在新类型出现那天才爆。
2. `totals.sessions=1067 vs sessions[600]` —— **这条是我的门判错**：`--top` 是明细上限、
   totals 是全量，本就不等。改为要求 reducer 显式声明 `sessionsDetail{limit,included,total}`，
   否则"有意截断"与"统计漏了"症状完全相同；另补 ROSTER 判据（明细里的 project/seat 必须在名册内）。

### R5-3 字面门对语义反转失明（NO-COST 误伤自己）
补完覆盖表后门又红了：`typeCoverage['cost-state']` 命中费用正则。
而那一行的内容恰恰是 `'ignored:费用状态 —— 磊哥已拍板不展示'`，**语义与门要防的正好相反**。
处置：按子树豁免 `typeCoverage`/`typeCounts`（它们的 key 是 type 名不是数据字段），
而不是从词表里删 `cost`（删了会漏真费用字段）；且**豁免不免检** —— 豁免子树内只允许
"表态字符串"与"计数"，出现别的照样 FAIL。

### R5-4 🔴 两个自伤，都被自己的判据抓住了
1. **假绿**：幂等测试比较两个 sha，而两个产物文件**根本不存在**，空串等于空串 → 报「✅ 幂等 PASS」。
   典型的「零输入的判据永远为真」。修法：判据先断言 `rc==0 && 产物非空`，再比 sha。
2. **差点改坏一个正确实现**：我看到两次 `generatedAt` 不同就动手把它改成从 t1 派生，
   改完才发现 glm 原本写的是 `isoSeconds(maxMtimeMs)` —— **本来就是确定性的**，
   两次不同是因为活日志被追加、源文件 mtime 在变。已回滚。
   违反的是「未读完目标文件禁开始改」与「新旧不一致先疑新」。

### R5-5 幂等验收（判据闭合）
活日志边跑边长，不能拿它测幂等（`typeCounts.assistant` 两次差 +4 是**输入在变**，不是 reducer 不确定）。
改用 `cp -Rp` 冻结快照（保留 mtime）：两次 rc=0、产物 3301 B 非空、**sha 逐字节相同** ✅。

## R6 · W3 起手：真实 ledger 驱动墨流（2026-09-04 04:0x–04:3x）

### R6-1 600 条真实会话接进引擎
spike 页 frontmatter 注入裁剪后的 ledger（7 字段 ≈20KB），`?flow=N` 由真数据驱动：
半径 ∝ `ink.r`、浓淡由 `ink.tone` 五档（焦/浓/重/淡/清）、冲量 ∝ log(turns)、偏心 ∝ 工具密度。
**数字一个都不在页面里手写**，全部由 ledger 派生。正控：页面内实测注入 600 条 ✅。

### R6-2 空间映射第一版错误：忙日堆成一条黑柱
x 按绝对时间线性 + y 按当天序号取模 ⇒ 7-27（62 场）、7-29（96 场）全挤在同一条竖线上，
y 只有 6 个离散位置，出图是一根糊死的黑柱。
**根因是隐喻错位**：30 天压进一屏必然挤，时间轴属于正式展厅的手卷横向展开。
单屏的隐喻应是「一张纸上的一百天」——位置有机散布，**时间只决定落下顺序**，
后落的会话推开先落的，叠压关系本身就是时间的痕迹（另加轻微右漂保留时间感）。

### R6-3 🔴 又一次"同一维度连加三个候选"：灰盘子不在 wet 场，在呈现层
每滴外面套着大小相近的灰色圆盘，几十滴并排 = 典型集合级 AI 味。
连试三个假设各只有微小改善：① `dryTau` 6→3→2 ② 主湿区半径随 seed 变化 ③ 湿度强度随机。
**真因在 `DISPLAY_FS` 的湿润光泽** `col *= 1 - ws*vec3(0.16,0.15,0.11)`：
它的设计意图是"墨还没干"的线索，而 S1 把一百天压进十几秒，所有滴同时湿着 ⇒ 满屏灰盘。
处置：强度降到 0.065 且响应窗口由 `smoothstep(0.02,0.6)` 抬到 `(0.18,0.85)`，
只有真正很湿处才发暗。判据句：**改了三次都只有微小改善 ⇒ 病灶不在这一层，换层。**

### R6-4 fps 从 3 跳到 120 —— 归因陷阱，不能挂在自己的改动上
两行显示层常量不可能带来 40 倍性能提升。核查发现同一时刻 **agy 视觉审进程（跑了 42 分钟）
刚好退出**，CPU 释放。按长跑纪律「报增益前先画对照表，变了两个就只能说合计」，
本轮**不为 shader 改动记任何性能增益**；真机性能仍在 DEFERRED，W3 必测。

### R6-5 异源视觉审计抓到我的量化门漏项（A4 浓处死黑）
agy 报「最浓处死黑 RGB=0 无纸骨反光，黑得不够贵气」。**亲核属实**：
`W1b-LOCKED.png` 最暗像素 **(0,0,0)**、956 个近黑像素；`W3-varied-halo` 1949 个。
Beer–Lambert 数学上永不到 0，但 8bit 量化把它压成了纯黑 —— 锚点门 A4 实际已失守，
而我自己的量化门当时**根本没查这一项**。
处置：`DISPLAY_FS` 加透射底光夹持 `max(paper*exp(-absorbed), uPaper*0.055)`
（真实宣纸最浓的焦墨仍有纸骨反光，绝对黑洞既不物理也不贵气），
并把 A4 补进可复跑的锚点门。复测：最暗通道 **11**、近黑像素 **0** ✅。
- agy 稿此前"没落盘"是误判：它写到了 stdout 而非我指定的 `--out` 路径，内容完整。已归档。

### R6-6 A4 门首版探针又错了（第 N 次）
门里用 `canvas.drawImage` 读像素，报「近黑像素 588790」= **整幅图**。
真因：WebGL canvas 未开 `preserveDrawingBuffer` 时 `drawImage` 读到的是空白全 0。
若不核，会得出"透射底光夹持完全无效"的相反结论。改用合成后的截图 + 外部像素分析。

## R7 · W3 组件化 + 全席位归约（2026-09-04 04:2x–05:2x）

### R7-1 `Flow.astro` 组件落地并实跑自证
展厅壳（`WorldHallLayout`/`HallChrome`/`world/[slug].astro`）从 about-hall 切出时已在本分支，
ADR-8 的「临时自带最小壳」不需要。但 `[slug].astro` 硬编码了 about 的组件，改它会造成合流冲突 ——
按 ADR-8「不重写 about-hall 产物」，W3 的交付物定为**组件**而非页面（页面接线归 W5）。
`src/components/city/halls/nexus/Flow.astro`：ledger 派生半径/浓淡/冲量/偏心，**零手写数字**，
含 `role="img"` 的等价文本（同样从数据派生）与 noscript 兜底。
部署态自证（`world-spike/nexus-flow`）：注入 600 条 ✅ / canvas 1200px ✅ / 零 page error ✅ / 无降级 ✅。

### R7-2 「墨分五色只出一色」是我的派单缺陷，不是 reducer 缺陷
tone 由**席位**决定（codex=焦 / claude-code=浓 / cursor=重 / grok=淡 / agy+api-direct=清），
而我首轮只传 `--claude`，600 条全是 claude-code ⇒ tone 全「浓」。
补齐三源后：claude-code 347（浓）+ codex 253（焦）= **两色**，1836 会话 / 40 天 / 2026-07-23→09-03。

### R7-3 🔴 fail-closed 门在真实场景下当场拦截（加数据源那一天就爆）
加 cursor 源后 reducer **直接 `exit 1`**：`turn_ended` 未在 TYPE_POLICY 表态。
该类型在同日 03:5x 的普查里**根本不存在** —— 是这一小时内新产生的。
正是「写死的清单不会自己长大，只在新类型出现那天才爆」，而那天就是今天。

### R7-4 门的分母比被测集合窄 —— 「什么东西不会被这个门看见」
表态后门又红：「turn_ended 不在普查全集里（普查过期？）」。
真因不是普查过期，而是**普查只扫 `~/.claude/projects`（23 种），reducer 却读 claude+codex+cursor**。
候选集比被测集合窄 ⇒ 整类逃检。
处置：普查扩到 reducer 实际读的全部源 ⇒ **3731 文件 / 2,126,411 行 / 32 种 type**，
门随即报出 8 种未表态（全是 codex 侧：`session_meta`/`turn_context`/`event_msg`/`response_item`
+ `world_state`/`inter_agent_communication_metadata`/`compacted`/`token_usage_record`）。
同时发现 `SEEN_TYPES` 只在 `claudeLine` 里记录，codex 的类型**根本进不了 typeCoverage** —— 一并补。
终态：**32 种全表态（mapped 6 / ignored 26）**，安全门 rc=0、正确性门 rc=0。
两条 ignored 的理由值得留档：`compacted` 与 `token_usage_record` 若也 mapped 会与
`event_msg` 的 `context_compacted`/`token_count` **重复计数**。

### R7-5 待办：cursor 源识别到白名单却入账 0
`~/.cursor/.../agent-transcripts` 命中 mywebsite(78 文件)/co-agent(15 文件)，但 **kept=0**。
样本行形如 `{role, message:{content:[{type:'text', text}]}}`，**无顶层 type、无标准时间戳字段** ⇒
`tsOf()` 取不到 t0，整条丢弃。第三色（cursor=重）因此缺席。
🔴 **根因已定位**：时间戳藏在消息正文里的标签内 —— `<timestamp>Monday, Aug 24, 2026, 11:27 AM (UTC+8)</timestamp>`。
它是**人类可读串**不是 ISO，需要正则提取 + 规范化时区括号后才能 `Date.parse`。
下一轮实现 `cursorTs()` 并配正控（拿已知样本行断言解析出的时刻落在 2026-08-24 当天）。
判据提醒：解析成功率要随料交付 —— 用"确知在里面的 N 条"反查命中率，
不能只看"跑通了不报错"（reducer 对取不到时间戳的行是**静默丢弃**，跑通与全丢症状相同）。

## R8 · agy W2r 收稿与隐私粒度加固（2026-09-04 04:4x–05:1x）

### R8-1 agy 的 5 条隐私漏洞逐条对照 ledger 亲核：2 条属实、3 条 reducer 已做对
| # | agy 建议 | ledger 实际 | 裁决 |
|---|---|---|---|
| ① 时间戳与公开 commit 交叉去匿名 | `t0` **秒级精确** | 🔴 属实 → 已粗化到小时 |
| ② 工具名 Schema-as-Payload | `tools` 是 int 计数，无名字 | 已符合对策，无需动 |
| ③ 报错文本反刍 | `flags` 仅 4 值枚举（hollow/sidechain/compacted/aborted），无自由文本 | 已符合对策 |
| ④ Token 精准指纹碰撞 | `tokens` **精确值**（如 381452） | 🔴 属实 → 已分箱 |
| ⑤ UUID 谱系刺破 | `id` = `s0001` 局部自增，零 UUID | 已符合对策 |
- ①的攻击链是实的：秒级 t0 可与磊哥公开的 GitHub commit 逐条对齐，一旦对上，
  该「匿名」会话关联的真实仓库与改动即被逆向。展厅只需要顺序与节奏，**不需要秒**。
- ④同理：精确 token 数对已知文档是确定性指纹（同款 tokenizer 本地分词即可碰撞）。
- 处置：`t0` 对齐到小时、`dur` 对齐到分钟、精确 `tokens` 字段**删除**并替换为量级桶 `tk`(0..6)；
  `ink.r` 改由桶中值派生。这些是 ADR-6 的**执行细则加严**，不改变已 accepted 的决定。

### R8-2 识别到的风险必须进门（否则下次改 reducer 会静默回归）
`nexus-ledger-verify.mjs` 新增 PRIVACY 判据四条：t0 % 3600、dur % 60、
不得存在精确 `tokens` 字段、`tk` 桶索引合法。
**负控自证**（注入三处违规）：rc=1 且三条各自报出；还原后 rc=0 ✅ —— 门确实会红也确实会放。

### R8-3 收稿纪律的一处修正
agy 首轮被我判「没落盘」是误判：它把结果写到了 stdout 而非 `--out` 路径。
本轮 W2r 同样先在日志里、随后才落盘 `W2-session-schema.md`。
判据：**agy 席的产出要同时看 `--out` 路径与 stdout 日志**，只看其一会误判为空稿。
