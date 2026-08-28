# CC-BGM-RS：BGM 循环层调研（纯合成优先 · 零首包字节 · 驾驶 ducking）

| 项 | 内容 |
|----|------|
| 任务 | CC-BGM-RS：BGM 循环层调研——目标体验 / 与 AUD-C1 合成层衔接 / 资产策略（纯合成优先）/ 交互（开关·音量·ducking）/ 文件域草案 / 验收断言 / 风险与禁区（**只调研，零实现，零 src**） |
| 模型 | `claude-fable-5-thinking-xhigh` |
| 日期 | 2026-08-28（UTC） |
| 上游 | [#157](https://github.com/rayw-lab/website/pull/157) `cc-audio-pubg-nav-research.md`（声音库/Autoplay/体积预算，DP-3 BGM 立项冲突登记）· [#158](https://github.com/rayw-lab/website/pull/158) `cc-loop-board-advisor-r5-product-audio-nav.md`（§B 波次/文件域、§D 六门八禁、BGM-C1 = W-R5-2）· [#164](https://github.com/rayw-lab/website/pull/164) `src/lab/world/audio/WorldAudio.ts`（AUD-C1 合成层 v0 已落 main，本单只读）· [#165](https://github.com/rayw-lab/website/pull/165)（AUD-C1 合入裁决 + e2e 53 例口径）· `cyber-city-gameplay-features.md` G3 · SRD §6/§12.7.7 |
| 下游 | BGM-C1 实现任务书（W-R5-2，单 PR 永远独立）；若走 v1 资产路线：roadmap 资产行 #10 修订（DP-3）+ `asset-ledger-cyber-city.md` 登记 |
| 红线 | howler/Tone.js 等音频库**永不引入**（SRD v2.0 禁引清单）· BGM **禁自动有声**（#158 禁项③/硬门 4）· `/` 首包音频字节 = 0（G-A′）· robot_idle poster 逐字节恒等 · CITY-03 循环动画配额零占用 · **本单禁域：任何实现代码 / 视角旋转 / 合工程 PR** |

## 0. 结论先行

1. **BGM 分两级，v0 = 纯合成「生成式氛围垫」，零资产零首包字节**。#157 §2.2 裁「编曲级
   darksynth 合成不划算」成立，但「循环层」的产品诉求不是编曲，是**填充驾驶间隙的氛围底**——
   两和弦慢进行 + 稀疏五声动机 + 高频空气感，纯 WebAudio 合成 ~200–260 行可落（§3.1 配方），
   与 AUD-C1 同纪律（零依赖、零网络字节）。编曲级采样 BGM 降级为 **v1 触发式路线**（§3.2）：
   仅当指挥官听感验收判合成垫不达标才立项，且前置 = roadmap 资产行 #10「不上 BGM」修订（DP-3）。
2. **生成式 = 循环问题整体消解**：#157 §4.3 的无缝循环三级方案（选曲首尾同相/零交叉裁切/双
   `<audio>` 交叉淡化）全部是采样路线的补丁；合成生成式**没有循环点**，零爆点且不重复，
   听感疲劳天然更低——这是「循环层」命题下合成路线的第二个结构性优势（第一个是零字节）。
3. **衔接面 = WorldAudio 内聚编排**（§2）：BGM 子总线挂 `master` GainNode 之下（主静音天然
   优先），解锁/可见性暂停/dispose 三条生命周期链全部复用 AUD-C1 既有实现，`index.ts` 零改动
   或 ≤2 行；ducking 侧链直接消费 WorldAudio 每帧已算好的 `engineLevel` 与事件沿，零新增事件面。
4. **交互三件**（§4）：① 第二只钮 `[data-world-bgm]` 紧邻既有音效钮，**默认 OFF**（禁项③最严
   读法零争议）+ localStorage 记忆（记忆开 = 手势解锁后自动恢复，硬门 4 明文语义，不构成
   「加载即响」）；② v0 音量 = 固定混音增益不上滑杆（DP-B3）；③ ducking 双通道 = 引擎连续
   侧链（随 engineLevel）+ 事件脉冲（撞击/打滑/变形让位），规格见 §4.2。
5. **频段避让是合成垫成败关键**：AUD-C1 引擎链占 27–920Hz 基频域（saw 55–461 + sub 27–230 +
   boost 110–922），BGM 垫必须高切让位——垫主体 400–1600Hz + 空气感 2–6kHz + BGM 子总线
   ~300Hz 高通，低频完全让给引擎与 thump（#157 §5.2「不与引擎层抢频段」的合成版执行口径）。
6. **六门八禁全对齐**（§7 映射表）：v0 合成版在体积门（门 6）与许可禁项（禁①）上是**平凡满足**
   （零资产零许可面）；核心合规点 = 门 4/禁③（默认 OFF + 解锁后才可能出声）+ 门 5（robot_idle/
   transforming 样式门 hidden，AUD-C1 静音钮同款机器兜底）+ 门 1（新 spec `CITY-BGM-01`，§6）。
7. **文件域 ⊂ 董事会既定域**：#158 §B 给 BGM-C1 划的域是「`public/` 音频资产 + audio/ 播放器
   扩展 + credits 落点」；v0 合成版只用其中「audio/ 扩展」子集（新 `BgmLoop.ts` + WorldAudio
   wiring + 埋点白名单 +1 + 新 e2e spec），少而不越，无需重裁（§5）。
8. **体积口径按严执行**：#158 §C 给 BGM 循环 ≤1.5MB、#157 §4.4 给 ≤500KB 双源合计——若 v1
   资产路线启动，**以 ≤500KB 为工作口径、1.5MB 为绝对天花板**；v0 合成版两条都恒真（0 字节）。

---

## 1. 目标体验

### 1.1 声景定位

| 维度 | 口径 |
|------|------|
| 定位 | **非叙境（non-diegetic）氛围垫**：城市「通电感」的听觉底色，填充驾驶间隙（停车观楼/读牌/找路）时引擎怠速层（增益仅 0.045）之上的寂静 |
| 气质 | 赛博暗色系：小调慢和声（如 Am9 ↔ Fmaj7 两和弦、16–20s 换一次）+ 稀疏五声动机（三角波短音 + 反馈延迟尾巴）+ 滤波噪声空气感——目标是「远处城市在呼吸」，不是「有人在放歌」 |
| 电平 | 常态显著低于引擎层（BGM 子总线基准 ≈ 0.12–0.16 × master，感知约 −16dB 于事件音）；驾驶时进一步 duck（§4.2）——BGM 永远是背景，五事件音永远是前景 |
| 与 FPV | **不参与舱内闷化**：AUD-C1 的低通只作用于引擎链（叙境音），BGM 为非叙境音不接该滤波——V 键切换时 BGM 恒定，正是 PUBG 类「UI/氛围层不随视角变化」的惯例 |
| 价值锚 | Bruno 拆解裁「声音贡献玩具感的一半」（G3 §0-4）；AUD-C1 已覆盖事件反馈，BGM 补的是**连续在场感**——两层合起来才是 folio Audio.js 769 行里「事件 + 氛围」的完整对位 |

### 1.2 活跃窗（与状态机对表）

| `data-world-state` / gate | BGM | 钮可见性 | 依据 |
|---------------------------|-----|---------|------|
| `robot_idle` / `transforming` | 静默 | **hidden**（样式门 `display:none`，AUD-C1 静音钮同款选择器直接扩位） | poster 逐字节恒等（门 5）；变形四拍让位 ritual sweep |
| `car_ready` / `driving` | 活跃（用户已开启时） | 可见 | 与 WorldAudio 引擎门同窗（`WorldAudio.update` 的 `open` 判定） |
| 灰盒 `gate==='none'` 且已 reveal | 活跃（同上） | 可见 | 引擎门既有第三支（`/world-spike/` 腿） |
| 未解锁（首手势前） | **不存在**（零 AudioContext、零节点） | 随态 | 硬门 4「禁加载即响」+ CITY-AUD-01 独立口径断言 |
| 标签页隐藏 | 暂停 | — | 复用 AUD-C1 `visibilitychange → ctx.suspend()` 全局链，零新增代码 |

## 2. 与 AUD-C1 合成层衔接

### 2.1 节点图（增量 = 虚线框内）

```
AudioContext（既有，首手势内新建）
 └─ master GainNode（既有：静音钮/MASTER_VOLUME 总线）
     ├─ engine 链（既有：saw+sub+boost+风噪 → lowpass）
     ├─ 事件配方（既有：thump/skid/twoTone/ritual sweep 即建即弃）
     └─ ┌──────────── BGM 子总线（新增）────────────┐
        │ bgmGain（开关/基准电平） → duckGain（侧链） │
        │  ├─ highpass ~300Hz（频段让位，§0-5）      │
        │  ├─ pad：2 只 detune 三角/正弦 + 慢 LFO 滤波│
        │  ├─ motif：五声短音调度器 + DelayNode 反馈  │
        │  └─ air：带通噪声（复用 sharedNoise buffer）│
        └────────────────────────────────────────────┘
```

### 2.2 编排归属与生命周期复用

| 关切 | 建议 | 复用自 AUD-C1 |
|------|------|--------------|
| 归属 | **WorldAudio 内聚编排**：`unlock()` 建 master 后按记忆态惰性构造 `BgmLoop`（独立文件承载配方）；`index.ts` 零改动或 ≤2 行传参 | 单例 ctx / 单一 owner 纪律 |
| 解锁 | BgmLoop **只在 unlock 之后存在**——构造前零 AudioNode，模块顶层零副作用（CITY-AUD-01 的 `__audioCtxCount===0` 断言直接回归覆盖） | 手势捕获段解锁链 |
| 每帧驱动 | `WorldAudio.update()`（ticker order 8）尾部转发 `bgm.update(engineLevel, open, dt)`——LFO/侧链平滑用同款帧率无关式 `1−e^(−rate·dt)` | 速度差分 / 参数平滑驻留 |
| 事件脉冲 | `impact()` / `skid()` / `stateChange('transforming')` / `world-transform` 各加一行 `bgm?.duckPulse(...)` 转发 | 既有事件订阅，零新增事件面 |
| 静音关系 | BGM 子总线挂 master 之下 ⇒ 音效钮 OFF 时 BGM 必然无声（状态矩阵见 §4.1），无需第二套静音逻辑 | master 总线 |
| 可见性/析构 | `visibilitychange` 挂 ctx 级已覆盖；`dispose()` 链尾加 `bgm?.dispose()`（停振荡器、断链、清调度器） | 全链拆除合同 |
| 探针 | `__worldAudio.state()` 扩展 `bgm: { enabled, playing, level, duck }` 只读面（e2e 实现口径） | `__worldAudio` 探针纪律 |

### 2.3 调度器口径

稀疏动机需要「未来 0.5s 内的音符排程」：推荐 **lookahead 调度**（Chris Wilson two-clocks 范式的
最简版）——由既有 ticker 每帧检查 `ctx.currentTime + horizon` 内是否需排程下一音，**不新建
setInterval**；标签页隐藏时 ticker 停 + ctx suspended，恢复时从当前时间续排（无积压爆发）。
随机源建议带 seed 的 PRNG（`mulberry32` 一行），便于听感调参复现；e2e 断言不依赖具体音符。

## 3. 资产策略（合成优先两级）

### 3.1 v0：纯合成生成式氛围垫（推荐立即路线）

| 项 | 口径 |
|----|------|
| 网络字节 | **0**（G-A′ 天然覆盖；LHCI 双口径零影响；#158 门 6 平凡满足） |
| 声部配方 | ① pad：2 振荡器（三角/正弦，±6 cent detune）走慢 LFO（~0.05Hz）扫低通，音区 400–1600Hz；② motif：五声音阶（如 A 小调五声）随机短音，三角波 + `DelayNode`（~0.4s，feedback ≈0.35）尾巴，平均 4–8s 一音；③ air：`sharedNoise` 复用 + 带通 2–6kHz 低增益；④ 和声：两和弦交替（i ↔ VI），16–20s 周期，pad 目标频率 `setTargetAtTime` 滑移 |
| 行数预估 | ~200–260 行（含注释；调度器 ~30 行、配方 ~120 行、钮+持久+探针 ~60 行）——与 WorldAudio 619 行同纪律：**howler 禁令是硬红线，「~150 行再评审引库」是旧预计不是门**，#164 合入（董事会急裁 GO）已确立手写规模的事实口径，不重开引库辩论 |
| CPU/内存 | 常驻 ~5 振荡器/滤波器 + 每音 1 组即建即弃节点（thump/skid 同款模式），开销与 AUD-C1 同量级可忽略；无 decode、零 PCM 驻留（对照 #157 §4.2：采样 BGM 若走 decode 路径 ≈23MB/分钟内存，本路线为 0） |
| 循环质量 | 生成式无循环点——#157 §4.3 三级无缝方案整体不适用（结构性消解，见 §0-2） |
| 验收 | 听感验收人 = 指挥官（真机）；验收面 = 「是否加分而非出戏」；不达标 → 触发 v1，**不在合成路线上反复加行数追编曲**（避坑 §10-6） |

### 3.2 v1：采样循环 BGM（触发式后备，本单不立项）

仅当 v0 听感验收不达标才启动，前置与口径全部沿 #157 既有结论，不重裁：

1. **前置 DP-3**：roadmap 资产行 #10「不上 BGM」修订案先行（#157 §4.4 已备好口径文本）；
2. 供给：Pixabay(Music) > FreePD > OGA(CC0)，检索词矩阵照抄 #157 §2.2 BGM 行（避 remix/翻唱）；
3. 体积：**≤500KB 双源合计工作口径**（Opus/WebM 主 + AAC/M4A 回退），#158 §C 的 ≤1.5MB 为天花板；
4. 播放：media element 流式 + `MediaElementAudioSourceNode` 接 master（吃同一静音总线），
   `preload="none"`、用户开钮才拉流——首包/关键路径零字节（#158 禁入区）；
5. 登记：`asset-ledger-cyber-city.md` 逐笔 + 许可视情进 `THIRD-PARTY-NOTICES.md` / credits 落点；
6. 文件域回到 #158 §B 原表全集（`public/` 资产 + credits），验收断言追加「传输体积实测证据 +
   零 `/` 首包请求」（门 6）。

### 3.3 v0 与既有裁决的关系（无冲突声明）

- roadmap #10「不上 BGM」位于**资产表**、约束的是资产账（「音效合计 ≤2MB，不上 BGM」）——
  v0 零资产不触该行；但为杜绝口径争议，建议 BGM-C1 实现 PR 随行给 #10 加一行注记
  （「BGM v0 = 纯合成零资产，不占本行配额；采样 BGM 立项须先修订本行」），属 §D 之外的
  文档卫生，非门禁项（DP-B4 登记）。
- G3「WebAudio 纯合成零资产」主路径：v0 BGM 是该裁决的**延伸执行**而非例外。
- #157 §0-1「BGM 合成不划算」：该结论针对「编曲级赛博循环曲」，v0 明确降格为「生成式氛围垫」
  ——两者验收标准不同，本单与 #157 无翻案关系（§0-1 已声明）。

## 4. 交互设计

### 4.1 开关与默认态（状态矩阵）

| 音效钮（master） | BGM 钮 | 结果 | 备注 |
|------------------|--------|------|------|
| ON | OFF（**默认**） | 事件音有、BGM 无 | 首访基线 = AUD-C1 现状不变 |
| ON | ON | 事件音有、BGM 低电平在场 | 唯一新增听感态 |
| OFF | ON/OFF | 全静 | master 总线优先，BGM 钮态保留但无声 |

- **默认 OFF**：禁项③「禁 BGM 自动有声播放」最严读法；硬门 4 的「muted-until-gesture」备选
  读法（首手势后自动起播）留作 DP-B2 给指挥官——若未来改默认，需指挥官对禁项③的解释权确认，
  实现侧只改一个常量。
- **localStorage 记忆**（建议键 `world-bgm-on`，'1' = 开）：硬门 4 明文「显式开关 + localStorage
  记忆」——用户显式 opt-in 后，下次会话在**手势解锁后**自动恢复播放；恢复永远晚于解锁，
  不存在「加载即响」路径。隐私模式存储不可用时会话内生效（AUD-C1 `readMuted` 同款容错）。
- **钮规格**：`[data-world-bgm]`，紧邻 `[data-world-audio]` 组成右上钮组；`aria-pressed` +
  可聚焦 + 点击后 `blur()`（驾驶键位零误触，AUD-C1 同纪律）；robot_idle/transforming 样式门
  hidden（既有选择器加一个类名即可）；文案建议「BGM ON/OFF」对称既有「音效 ON/OFF」；
  零动画（禁项⑦，`prefers-reduced-motion` 下 transition:none 同款）。
- **埋点**：ux 族新 type `world-bgm` `{enabled, source:'user'|'restore'}`（开钮/关钮 = 'user'，
  记忆恢复沿 = 'restore'）——SessionTimeline 白名单 38→39 type、10 族不变、schemaVersion 不动，
  observability 规格表同 PR 随行修订（加法纪律 §3.6）；复用 `world-audio` 加字段亦可行但漏斗
  会混静音与 BGM 两语义，推荐新 type（DP-B1）。

### 4.2 驾驶音效 ducking 规格

| 通道 | 触发 | 目标 | 恢复 | 实现要点 |
|------|------|------|------|---------|
| 连续侧链 | 每帧 `engineLevel`（WorldAudio 已算好，0–0.335） | `duck = DEPTH × min(engineLevel/0.30, 1)`，DEPTH ≈ 0.55 → 全速时 BGM 退至 ~45% | 随速度自然回落 | `duckGain.gain.value` 帧内直写（引擎参数同款驻留平滑），零自动化事件堆积 |
| 事件脉冲 | `impact()` / `skid()` 排程沿 | 瞬时压至 ~0.25× | `setTargetAtTime` τ≈0.6s 回弹 | 与事件音冷却（IMPACT_COOLDOWN/SKID_COOLDOWN）同沿，天然限流 |
| 变形让位 | `stateChange('transforming')` | 压至 ~0.15×（ritual sweep 是主角） | `world-transform` 完成沿 τ≈1.2s 缓升 | reduced-motion instant swap 路径改为短脉冲（对齐 transformCue） |
| 主静音 | 音效钮 OFF | 总线 0（非 ducking，master 既有） | — | 无新逻辑 |

设计原则：**ducking 只作用于 BGM 子总线**，永不反向（事件音不因 BGM 存在而改电平）；
duck 值进探针（`bgm.duck`），驾驶态数值可断言（§6-G）——SwiftShader 环境无真实音频输出，
e2e 全部走 gain/探针数值面而非听感面。

### 4.3 音量

v0 **不做滑杆**：固定 `BGM_BASE ≈ 0.12–0.16`（相对 master 子总线，实现期 headful 听感定标）。
理由：range input 引入焦点陷阱/驾驶键冲突（方向键改值 vs WASD）与 a11y 面（`aria-valuetext`）
成本，而「背景垫」的电平本就该由混音预设保证；用户粒度控制 = BGM 开关 + 全局静音两级已够。
滑杆列 v1 可选（DP-B3），若上则须解决方向键抢占（建议 focus 时吞键 + Esc 释放）。

## 5. 文件域草案（BGM-C1 v0，单 PR）

| 文件 | 动作 | 量级预估 |
|------|------|---------|
| `src/lab/world/audio/BgmLoop.ts` | **新增**：合成配方（pad/motif/air）+ 调度器 + duck 通道 + 钮 DOM/持久化 | ~200–260 行 |
| `src/lab/world/audio/WorldAudio.ts` | 加法 wiring：unlock 后惰性构造、update 转发（engineLevel/open/dt）、事件脉冲转发 ×4、dispose 链尾、探针扩展、样式门选择器扩位 | ≤40 行 |
| `src/lab/world/core/SessionTimeline.ts` | ux 族白名单 +`world-bgm`（38→39 type），注释块随行 | ≤5 行 |
| `docs/spec/cyber-city-observability.md` | §3.4 表加一行（加法纪律随行修订，schemaVersion 不动） | 1 行 |
| `e2e/cyber-city-bgm.spec.ts` | **新增**：CITY-BGM-01 单用例单挂载串断言（§6），world-chromium 串行 project 收编 | ~130 行 |
| `docs/research/cyber-city-test-framework.md` | 用例数登记 +1（合入时点以该单源为准；#165 口径 AUD-C1 后 53，NAV-C1 [#166](https://github.com/rayw-lab/website/pull/166) 在途另 +N） | 1 行 |

**禁入区**（v0）：`view/`（View.ts/CameraShots.ts 逐字节不动）· city 几何与 `src/data/` 城市
数据 · physics · 既有 e2e spec 断言语义 · `public/`（零资产）· `astro.config.mjs` /
`playwright.config.ts` · 首页壳与 `/home/`。v1 资产路线追加域见 §3.2-6。

## 6. 验收断言草案（CITY-BGM-01，实现任务书转录用）

编排：单用例单次 3D 挂载串全部断言（CITY-AUD-01 同款挂载成本纪律；`MOUNT_TIMEOUT 210s` /
serial project 口径照抄）；取证双口径 = `addInitScript` 独立面 + `__worldAudio.state().bgm` 实现面。

| # | 断言 | 门禁对应 |
|---|------|---------|
| A | 首手势前零 AudioContext（独立口径 `__audioCtxCount()===0` 回归）——BGM 模块顶层与构造前零音频节点 | 门 4 / 禁③ |
| B | robot_idle 态 `[data-world-bgm]` hidden（transforming 态同） | 门 5 |
| C | CTA 解锁后 BGM **默认不响**：`bgm.playing===false` 且 `bgm.level===0`；独立口径 = 全程零 audio 资源网络请求（`page.on('request')` 过滤 `.mp3/.m4a/.webm/.ogg/.opus`——v0 恒真，同时为 v1 懒加载合同预置取证面） | 禁③ / 门 6 |
| D | 开钮 → `bgm.playing===true` + `aria-pressed` 翻转 + localStorage `world-bgm-on='1'` 写回；关钮反向 | 硬门 4 记忆语义 |
| E | 持久还原：initScript 种 `world-bgm-on='1'` → 解锁沿后自动恢复播放（钮态还原 + `bgm.playing===true`），且恢复时点晚于解锁（`unlocked===true` 前 `bgm` 不存在/不响） | 硬门 4 |
| F | 主静音优先：音效钮切 OFF → master gain 归 0（BGM 钮态不变、`bgm.playing` 保持）——状态矩阵 §4.1 机器面 | G3 静音总线 |
| G | ducking：开 BGM + W 驾驶至 driving → `bgm.duck > 0`（或 `bgm.level` 相对静止基线下降 ≥30%） | §4.2 规格 |
| H | 埋点：开/关各产生一条 `world-bgm`（ring 内 `source:'user'`）；记忆恢复产生 `source:'restore'` | 观测规格加法 |
| I | 全程零 pageerror；既有 CITY-AUD-01 全断言回归零破（同 project 串行共存） | 门 1 |
| J | poster/像素基线零改动（全量回归面既有断言，不新增） | 门 5 |

全量口径：合入后全量 e2e **0 failed / 0 skipped / 0 flaky**（用例数以测试框架单源登记为准），
全量窗按跑道互斥硬令登记空档执行；PR 门禁 check 之外，新 spec 单跑 PASS 日志进 PR body（#164 先例）。

## 7. 六门八禁对齐摘要（#158 §D 逐条映射）

| 门/禁 | BGM-C1 v0 姿态 |
|-------|---------------|
| 门 1 e2e | 新增 CITY-BGM-01 最低断言集（§6 A–J）+ 全量 0/0/0；互斥窗登记空档 |
| 门 2 无障碍 | 钮可聚焦 + `aria-pressed` + `aria-label`；无新面板无焦点陷阱；点击后 blur 防键位误触 |
| 门 3 reduced-motion | 钮 transition:none；音频本体口径独立（动效偏好 ≠ 声音偏好，G3 既有）；变形让位在 reduced-motion 下走短脉冲对齐 instant swap；**无任何音频联动视觉脉动** |
| 门 4 autoplay | AudioContext 懒创建合同不破（回归断言 A）；BGM 默认 OFF + 显式开关 + localStorage 记忆；恢复恒晚于手势解锁 |
| 门 5 poster/恒等 | robot_idle/transforming 钮 hidden 样式门；零渲染路径改动；零像素基线触碰 |
| 门 6 LHCI+体积 | v0 零资产零请求（断言 C 双口径）；LHCI `/`+`/home/` 四项不降照跑；v1 才有传输体积证据义务 |
| 禁① 许可 | v0 平凡满足（零素材零库）；v1 按 #157 §2 短名单 + SPDX 逐笔入账 |
| 禁② pointer-lock/自由相机 | 不涉及（本单禁域同时排除视角旋转） |
| 禁③ BGM 自动有声 | 核心合规点，默认 OFF（§4.1；改默认走 DP-B2 指挥官裁量） |
| 禁④ 机位常量 | `view/` 禁入区，逐字节不动 |
| 禁⑤ 跑道互斥 | 全量 e2e/chrome 级活动按登记空档；与 NAV-C1/#104 链错峰 |
| 禁⑥ 自评入登记 | 本单零分数产出；实现段听感自评仅作情报，不触登记矩阵 |
| 禁⑦ 循环动画配额 | 零占用：无可视化、钮零动画 |
| 禁⑧ 扩批 | BGM-C1 单 PR 范围 = §5 表；W-R5-2「三件各自单 PR 禁并」——与 CAM-ROT-C1/NAV-C1.5 永不同批 |

## 8. 风险与禁区

| # | 风险/禁区 | 等级 | 对策 |
|---|----------|------|------|
| R1 | 合成垫听感「电子玩具感」超容忍度（#157 对合成 BGM 的原始疑虑） | 中 | 期望管理写进任务书（氛围垫 ≠ 编曲）；headful 本地调参后交指挥官真机听感验收；不达标走 v1，禁在合成路线反复加行数（§3.1 验收行） |
| R2 | 频段冲突：垫与引擎链互相掩蔽或叠出浑浊低频 | 中 | §0-5 高通 300Hz + 音区规划 + 连续侧链 duck；调参期 A/B = 引擎全速 vs 怠速两工况必听 |
| R3 | CITY-AUD-01 回归破门（`__audioCtxCount`/探针形状变化） | 中 | BgmLoop 惰性构造（解锁后）+ 探针只加字段不改既有键；实现 PR 必单跑 CITY-AUD-01 |
| R4 | 观测白名单 38→39 撞既有断言 | 低 | #165 §2.3 已核 observability spec 无总数/枚举断言（37→38 同题先例）；实现时复核一次 CITY-OBS 全断言面 |
| R5 | 调度器在 suspend/resume 后积压爆发（一次排程多音） | 低 | lookahead 基于 `ctx.currentTime`（suspend 时钟冻结）+ 每帧至多排 1 音；恢复沿重置 next-note 游标 |
| R6 | 节点泄漏（motif 即建即弃节点未 stop） | 低 | thump/skid 同款 `start(t)+stop(t+dur)` 模式；dispose 全链拆除合同照抄 |
| R7 | 默认态争议（指挥官期望「首访即氛围」vs 禁项③） | 低 | DP-B2 前置登记，实现只留一个常量位；未获书面确认前恒 OFF |
| 禁区 | 本单（调研）：零实现代码、零视角旋转内容、不合任何工程 PR；实现段：howler/Tone.js 禁引、`view/` 禁入、`/` 首包零字节、poster 恒等、W-R5-2 串行纪律（与 CAM-ROT 归因隔离） | — | — |

## 9. 开放决策点（登记给编排，本单不裁）

| # | 决策点 | 建议倾向 |
|---|--------|----------|
| DP-B1 | 埋点新 type `world-bgm` vs 复用 `world-audio` 加字段 | 新 type（漏斗语义独立；两者都是加法纪律内） |
| DP-B2 | BGM 默认态：OFF vs muted-until-gesture（解锁后自动起播） | v0 恒 OFF；改默认需指挥官对禁项③解释权书面确认（一个常量位，零改造成本） |
| DP-B3 | 音量滑杆 | v0 不做（固定混音）；v1 可选，须解决方向键抢占 |
| DP-B4 | roadmap 资产行 #10 注记（「合成 BGM 不占本行配额」） | 实现 PR 随行 1 行文档卫生；采样立项才触发正式修订（DP-3 沿 #157） |
| DP-B5 | v0 → v1 触发的验收人与口径 | 指挥官真机听感（「加分而非出戏」）；触发后 v1 任务书以 §3.2 六条为骨架 |

## 10. 经验教训与避坑（实现 Task 启动前必读）

1. **懒创建合同是第一硬门**：CITY-AUD-01 用 `addInitScript` 包裹 `AudioContext` 构造计数做
   独立取证——BGM 模块**顶层 import 副作用、构造函数、静态字段**里出现任何音频节点/context
   都会破门。BgmLoop 只能在 `unlock()` 之后 new。
2. **playwright 旗标陷阱**：本仓 launchOptions 带 `--autoplay-policy=no-user-gesture-required`
   （TTS 既有旗标），e2e 断言的是**懒创建合同本身**而非浏览器政策——别以为本地 e2e 绿了就等于
   autoplay 合规，合规靠代码结构不靠测试环境（CITY-AUD-01 文件头注释同款提醒，照抄）。
3. **SwiftShader 无声取证**：CI 环境听不到声音，一切断言走 gain/探针数值面；探针字段设计
   （`bgm.level/duck/playing`）要在写实现前和 spec 一起定形，别等 spec 写不动了回头改探针。
4. **WebAudio 参数原语坑**：`exponentialRampToValueAtTime` 目标不能为 0（用 0.0001，WorldAudio
   全部先例如此）；开关切换用 `setTargetAtTime` ~30ms 收敛防爆音；每帧参数用驻留平滑 + `.value`
   直写，禁每帧堆自动化事件（AUD-C1 注释明示的既有纪律）。
5. **埋点加法三件套**：白名单 +type、注释块计数更新（38→39）、observability 规格表同 PR 随行
   ——三处少一处审计必点名；schemaVersion 永不动（加法纪律）。
6. **别追编曲**：合成垫的验收是「氛围在场感」，两和弦 + 稀疏动机就是完成态；听感不满意的正解
   是走 v1 资产路线，不是往 BgmLoop 里加声部——行数膨胀 + 归因混乱双输。
7. **钮纪律照抄 AUD-C1**：`blur()` 防驾驶键误触、样式门 `display:none`（不是 visibility）、
   `aria-pressed`、零动画、隐私模式 localStorage 容错——五件套一个不能少，全有先例代码可抄。
8. **跑道与合流**：全量 e2e 窗互斥硬令（登记空档执行）；NAV-C1 [#166](https://github.com/rayw-lab/website/pull/166)
   在途，后合者负试合并 + 合流冒烟义务（文本零冲突 ≠ 语义零冲突——两者都动 world/index 邻域
   与观测白名单，白名单计数注释是可预见的文本冲突点）；含 src 合入须董事会急裁（站立授权 #159 口径）。
9. **链接与登记**：PR/run 链接一律用 `gh` 实际输出（曾错写 `rayw-lab/mywebsite`，AGENTS.md
   高频坑）；分数/状态只登记看板单源，本文档交付后状态行由父代理收口，禁多处重复登记。

---

*CC-BGM-RS · 只调研零实现：本分支仅新增本文档；未触碰 `src/`、`e2e/`、`playwright.config.ts`、
workflow 与像素基线。仓库内结论均标注出处（#157/#158/#164/#165 + WorldAudio.ts/
cyber-city-audio.spec.ts 一手代码）；#158 六门八禁对齐见 §7，文件域草案见 §5，验收断言草案见 §6。*
