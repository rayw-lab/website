# CC-AUDIO-PUBG-RESEARCH：PUBG 式驾驶导航音频调研（声音库 · Autoplay · 体积预算）

| 项 | 内容 |
|----|------|
| 任务 | CC-AUDIO-PUBG-RESEARCH：回顾既有 PUBG/驾驶调研 → 补研可商用声音库 → Autoplay 政策与首手势解锁 → 音频体积预算策略（**只调研，零实现，零 src**） |
| 模型 | `claude-fable-5-thinking-xhigh` |
| 日期 | 2026-08-28（UTC；外部事实均为当日 web 核验快照） |
| 上游 | `github-vehicle-camera-survey.md`（PUBG V 键/防晕）· `docs/spec/cyber-city-vehicle-camera.md`（D1–D5 裁决）· `cyber-city-gameplay-features.md`（G3 合成音效层）· `cyber-city-gameplay-gap-audit.md`（GAP-12）· `bruno-simon-folio-source-teardown.md`（Audio.js 769 行拆解 + Start 按钮双功能）· `folio-gap-and-reuse-report.md`（启动链 audio.init 时序）· `implementation-roadmap-birdseye.md`（资产行 #10 · G2 预算）· `docs/spec/SRD.md`（§12.7.7 音频行 + howler 禁引）· `cyber-city-implementation-plan.md`（§6 红线 · Phase 3 音效）· `docs/spec/cyber-city-transform-fx.md`（变形四拍） |
| 下游 | 音频实现任务书（Audio.ts 设计，暂未立项编号）· 若采样/BGM 立项：`docs/spec/asset-ledger-cyber-city.md` 登记 + roadmap 资产行 #10 修订 |
| 红线 | howler **永不引入**（SRD v2.0 禁引清单）· G3 主路径 = WebAudio 纯合成零资产 · 「零 Transformers 元素」商标红线延伸到音频素材 · `/` 首包与 LHCI 零影响（交互前零 world 字节） |

## 0. 结论先行

1. **既有裁决已钉死音频路线的一半，本调研不推翻**：G3（`cyber-city-gameplay-features.md`）裁定
   主路径 = WebAudio **纯合成零资产**（v0 三音包：变形 whoosh / 碰撞 thump / 进站确认音；v1 速度驱动
   引擎哼鸣）；SRD §12.7.7 裁定手写播放层 ~150 行、howler 永不引入。本篇的采样库短名单是
   **「合成听感不够用时」的补充路径**（最典型：赛博朋克循环 BGM——合成器序列器不是 150 行能写好的）。
2. **声音库短名单 5 家**（详见 §2）：**Kenney**（CC0，零许可作业）→ **Sonniss GDC 年度包**
   （royalty-free 商用免署名，2026 包 7.47GB + 历年档案 200GB+，专业录音室级）→ **Freesound**
   （70 万+ 素材，**必须滤 `license:"Creative Commons 0"`**，CC-BY 需署名、CC-BY-NC 是商用陷阱）→
   **Pixabay**（Content License 商用免署名，BGM 区强）→ **OpenGameArt**（逐资产滤 CC0/CC-BY，防 GPL 传染）。
   BGM 补充：FreePD（CC0 音乐）。**BBC Sound Effects 出局**（RemArc 许可仅限个人/非商用）。
3. **变形音效有商标暗礁**：Hasbro 对「变形金刚变形声」（标志性六音级联）有商标主张与注册申请史，
   素材站上以 "transformer" 命名的素材大量是影视原声盗录。检索词一律用 **servo / mech / hydraulic /
   whoosh** 组合，凡素材名或描述蹭 Transformers IP 的直接跳过——与仓库既有「零 Transformers 元素」
   红线（`cyber-city-phase0-full-audit.md` 维度 1）同一纪律。
4. **Autoplay 政策口径（2026-08 核验）**：Chrome 71+ 起 Web Audio 纳入 autoplay 政策，无手势时
   AudioContext 以 `suspended` 出生；解锁 = **在用户手势事件处理器内 create 或 `resume()`**。
   本站首手势天然存在：**变形 CTA（`[data-world-transform]` 点击或 Space keydown）**——与 folio
   `Reveal.updateStep(1) → audio.init()` 先例同构（`folio-gap-and-reuse-report.md` 启动链 ④）。
   Space/WASD 的 keydown 属于合法 activation triggering event，键盘党与鼠标党都覆盖。
5. **iOS 两个专项坑**：① 静音拨键默认静音 Web Audio（页面 audio session 默认 `ambient` 类别）而
   `AudioContext.state` 仍报 `running`——iOS 17+ 用 `navigator.audioSession.type = 'playback'`
   （feature-detect）声明播放意图，旧 Safari 兜底 = 手势内循环播放静音 media element；
   ② Safari **17.4 起**才对 WebM Opus 达成 media element 一致支持，`decodeAudioData` 的 Opus 支持
   仍有历史坑（WebKit issue 226922/245428）——**decode 路径用 MP3/AAC，流式路径才可上 Opus 双源**。
6. **体积策略三句话**：SFX 走合成 **0 字节**（G3 不动）；若 v1 后仍需采样 SFX，走**单 sprite 文件 +
   JSON 偏移表、手势后懒加载**（≤300KB，计 world 流式账，绝不进首包）；BGM 与 roadmap 资产行 #10
   「不上 BGM」旧口径**正面冲突**——若立项须先修订该行，建议口径 = 单 60–90s 无缝循环 ≤500KB
   （Opus 96kbps / AAC 128kbps 双源）、media element 流式播放、`/` 首包与 LHCI 零字节影响（§4）。

---

## 1. 既有调研回顾（可复用结论摘要）

任务点名的四个维度，仓库既有结论如下——**全部可直接复用，本篇零重裁**。

### 1.1 镜头（PUBG 式载具相机——已设计完毕）

| 结论 | 出处 |
|------|------|
| **V 键硬切** `third ↔ fpv` 双态（PUBG 官方支持页核验 V = 1st/3rd toggle；GTA V 同键位；Sketchbook 一手源码 `KeyBinding('KeyV')`）；无补间（PUBG 原版即硬切，e2e 单帧位姿断言最友好） | `github-vehicle-camera-survey.md` §0/§3.5 |
| 第三人称**保持 folio 等距**，不改 PUBG 背后追尾（裁决 D1：`optimalArea`/Nipple/thetaDrift 连锁改动面 ≫ 收益）；「PUBG 式」需求本体 = V 切换 + FPV | `cyber-city-vehicle-camera.md` §4 D1 |
| FPV = 挡风前上沿 hood cam（无内饰资产，D4）、锁前向（G5 用户不可接管相机，PUBG Alt 自由环视**明确不抄**，D2）、防晕三件套 = 水平线锁定 + pitch 限幅 + FOV kick 低速死区 | 同上 D2/D4 + survey §3.1/§3.4 |
| respawn **不**强制回 third（PUBG 视角记忆口径）；reduced-motion 下 V 保留（硬切无动画）、lookahead/FOV kick 归零 | `cyber-city-vehicle-camera.md` §状态机/§reduced-motion 表 |
| **对音频的直接含义**：FPV/TPP 双态是 PUBG 声音签名的挂点——车内 FPV 引擎声闷化（低通）、TPP 开阔（§5.2 挂点表） | 本篇引申 |

### 1.2 小地图（当前为零，方案已备案）

| 结论 | 出处 |
|------|------|
| 现状**无罗盘/路标/距离指示/小地图**，POI 触发圈 6m + 出画即隐——GAP-12 定级 **P0 发现性缺口** | `cyber-city-gameplay-gap-audit.md` GAP-12 |
| folio `Game/Map.js`（192 行，canvas 合成底图 + 玩家标记）已拆解，标记 🔶 V2 可移植；folio 底图 png 1.4–1.6MB/张是体积反面教材 | `bruno-simon-folio-source-teardown.md` §模块表/§8 |
| 目标态：常驻小地图 + M 键传送 +「全图一屏可达」设计规则；资产行 #9 = 2D 等距 SVG 地图（数十 KB，兼 OG 图） | `bruno-simon-teardown-adaptation.md` §迷路对策 · roadmap 资产表 #9 |
| **对音频的直接含义**：小地图与音频无直接耦合；唯一交点是 UI 音（地图开合/传送确认音归 G3 v1 UI 音族） | 本篇引申 |

### 1.3 音效（现状 0 字节，合成路线已裁决）

| 结论 | 出处 |
|------|------|
| 现状：folio 移植时 **Audio 整层砍除**（`Game.ts` 头注「Debug/Server/Audio/氛围系统全砍」），全站音频字节数 = 0 | `src/lab/world/core/Game.ts` L8 · gap-audit §反馈通道 |
| G3 裁决：WebAudio **纯合成零资产**。v0 三音包 = 变形 whoosh（噪声扫频 0.8s 对齐四拍）/ 碰撞 thump（低频正弦+噪声瞬态随 impulse）/ E 进站确认（双音上行）；v1 = 速度驱动引擎哼鸣（振荡器频率映射车速、boost 加谐波）；右上常驻静音钮 + localStorage 记忆；`world-audio` 埋点 | `cyber-city-gameplay-features.md` G3 |
| 声音层价值判断：Bruno 拆解证明声音贡献「玩具感」的一半、载具是全站最富声源；G3 被列「当前值最被低估的缺口」 | 同上 §0-4 |
| 依赖红线：**howler 永不引入**（folio Audio.js 的依赖），替代 = 手写 WebAudio `AudioBufferSourceNode` + `GainNode` ~150 行，超 150 行再评审引库 | SRD §6 选型表 + `cyber-city-implementation-plan.md` §6 |
| folio `Game/Audio.js`（769 行）可借结构不借依赖：注册表 / 分组 / 位置衰减 / antiSpam 冷却 / mute 持久化 / **init() 延迟到用户手势** | `bruno-simon-folio-source-teardown.md` §模块表 |
| 资产口径（旧）：freesound CC0 / Kenney Audio 已被点名为采样来源；**音效合计 ≤2MB，不上 BGM** | roadmap 资产表 #10 |

### 1.4 加载（音频的懒加载可搭既有便车）

| 结论 | 出处 |
|------|------|
| folio 两阶段加载：先 4 件小资产出加载画面 → 重资产后台并行 → **任意首个输入到达即 `updateStep(1)`：audio.init（用户手势解锁）+ filters 切 wandering**——音频初始化严格绑定启动手势是 folio 的既定范式 | `folio-gap-and-reuse-report.md` §启动链 |
| 2019 版 Start 按钮第一功能就是满足 autoplay 政策，第二功能是推迟重系统构建 | `bruno-simon-folio-source-teardown.md` §7.3 |
| 本站预算链：`/` 首屏 <200KB gzip（G2，不含字体；对 world **零字节增量**）→ world 首包 ≤5MB / JS ≤500KB → 流式 ≤12MB → `public/` ≤40MB；加载→可驾驶 ≤8s @Fast 4G；加载屏 0 秒可跳过 | roadmap G2/§预算表 · SRD §12.7.2 · human-gate ② |
| shader 预热占加载屏末拍——音频若有资产解码，同窗并行是天然位置（decode 不占 GPU） | adaptation §7.2-3 |

---

## 2. 声音库短名单（开源 / 可商用优先）

### 2.1 五家主力 + 许可速查

| # | 库 / 素材站 | 许可 | 商用 | 署名 | 关键注意（2026-08 核验） |
|---|------------|------|:----:|:----:|--------------------------|
| 1 | **Kenney.nl**（Audio 系列包：Sci-Fi Sounds ~300 条 / Impact Sounds / Interface Sounds / Engine 类散见） | **CC0** | ✅ | 免 | 零许可作业的第一站；游戏化 UI/撞击/科幻音强，**引擎循环与 BGM 弱**；风格偏卡通轻量，撑不起「写实驾驶」时用 §2.2 检索词换站 |
| 2 | **Sonniss GDC 年度包**（gdc.sonniss.com；2026 包 7.47GB，历年档案 200GB+） | 专有 royalty-free EULA（v2.0，2026-08-27 生效） | ✅ | 免 | 专业录音室级 WAV（引擎/撞击/机械最强的免费来源）；**禁止以素材库形式转售/再分发**（打进站点产物没问题）、禁 AI/ML 训练用途；文件大，选中后必须转码（§4.3） |
| 3 | **Freesound.org**（70 万+ 条） | 逐条 CC0 / CC-BY 4.0 / CC-BY-NC 4.0 | 滤后 ✅ | CC-BY 需 | **必须开许可筛选**：网页端勾 CC0（或 Free Cultural Works = CC0+BY），API 端 `filter=license:"Creative Commons 0"`；CC-BY-NC 对本站（个人品牌/求职导向）属灰区，**一律排除**；CC-BY 素材须进 `THIRD-PARTY-NOTICES` 总账（Khronos CC-BY 已有先例） |
| 4 | **Pixabay**（Sound Effects + Music 双区） | Pixabay Content License | ✅ | 免 | 商用免署名；**禁独立转售/再分发原文件**；BGM 区 synthwave/cyberpunk 标签供给充足，是循环 BGM 的首查站；单曲质量方差大，按 §2.2 关键词 + 时长 <2min 过滤 |
| 5 | **OpenGameArt.org** | 逐资产 CC0 / CC-BY / GPL / OGA-BY 混排 | 滤后 ✅ | 视许可 | 检索时**必须勾许可过滤**（CC0 优先）；GPL 音频对静态站虽无传染实害，但与本站资产台账纪律不合，直接排除；游戏向循环 BGM 与机械音的长尾比 Kenney 深 |

BGM 专项补充（不占主名单席位）：**FreePD.com**（CC0 音乐，电子/氛围分类可用）；Incompetech
（Kevin MacLeod，CC-BY 4.0，需署名登记）。**明确出局**：BBC Sound Effects（RemArc 许可仅限
个人/教育/非商用，本站带个人品牌与求职属性，不碰）；任何「Transformers 同款变形声」素材（§0-3 商标红线）。

### 2.2 六事件检索关键词矩阵

检索词以英文为准（各站索引语言）；「优先库」按供给质量排序；许可注意为该事件专属坑。

| 事件 | 推荐检索关键词 | 优先库 | 事件级许可/选材注意 |
|------|----------------|--------|---------------------|
| **加速** | `car acceleration ramp` · `engine rev up` · `electric motor spin up` · `EV acceleration whine` · `sci-fi vehicle boost` | Sonniss > Freesound(CC0) > Pixabay | 本站车是赛博概念车——**电机声（whine/spin-up）比 V8 声更贴题**且更易与合成引擎层混合；注意素材尾部是否带换挡声（本站无挡位概念，需裁剪） |
| **巡航行驶** | `engine idle loop` · `car engine loop seamless` · `electric hum loop` · `hover vehicle loop` · `motor drone loop` | Sonniss > Freesound(CC0) | 必须选**标注 seamless/loopable** 的素材，普通素材头尾有环境底噪导致循环爆点；巡航层是常驻声源，优先 mono（§4.2 内存账减半）；G3 v1 的合成哼鸣是此层首选，采样是 fallback |
| **刹车** | `tire skid` · `brake squeal` · `car brake screech` · `air brake hiss` · `servo brake sci-fi` | Sonniss > Kenney(Impact) > Freesound(CC0) | 刹车声与轮胎摩擦声是两个素材族（brake squeal vs tire skid），驾驶手感上**skid 反馈优先**（与 `PhysicsVehicle` 打滑状态挂钩）；短样本（<1.5s）即可，进 sprite |
| **撞击建筑** | `car crash metal` · `impact thud concrete` · `metal hit debris` · `collision crunch low` · `body impact heavy` | Sonniss > Kenney(Impact) > OGA(CC0) | G3 v0 已裁合成 thump 为主路径（强度随 impulse 可参数化，采样做不到）；采样仅作「重撞击加料层」叠加；避免带玻璃碎裂的素材（本站楼宇无玻璃破碎表现，音画不符） |
| **机器人变形** | `servo motor` · `mech transformation` · `robotic whir` · `hydraulic actuator` · `mechanical latch clank` · `power up whoosh` | Freesound(CC0) > Sonniss > Kenney(Sci-Fi) | **商标红线最高危区**（§0-3）：跳过一切名称/描述含 Transformers/Autobot 的素材；变形四拍总长 1.05s（`TransformSystem.ts` 时间轴常量），素材须按拍裁切对齐——合成 whoosh（G3 v0）+ 采样 servo 点缀是最稳组合 |
| **赛博朋克循环 BGM** | `synthwave loop` · `darksynth loop` · `cyberpunk ambient loop` · `retrowave seamless` · `dystopian electronic loop` | Pixabay(Music) > FreePD > OGA(CC0) | **唯一合成路线明确不划算的事件**（序列器+混音远超 150 行红线）；必须 seamless 循环（§4.3 无缝方案）；与 roadmap「不上 BGM」旧口径冲突，立项前置条件见 §4.4 DP-3；选曲避开翻唱/remix（remix 素材的上游版权链不可查） |

### 2.3 合成 vs 采样的事件级裁量（G3 口径下的补充建议）

| 事件 | 主路径（既有裁决） | 采样介入条件 |
|------|--------------------|--------------|
| 加速/巡航 | G3 v1 合成哼鸣（振荡器频率映射 `focusPointSpeed`，boost 加谐波）——参数随速度连续变化是合成的不可替代优势 | 合成音「电子玩具感」超出赛博题材容忍度时，叠一层低音量采样电机底噪（sprite 内 1 条循环） |
| 刹车 | 合成滤波噪声突发（~20 行） | 打滑反馈需要「胎面颗粒感」时上采样 skid |
| 撞击 | G3 v0 合成 thump（impulse 参数化） | 重撞击（速度阈值上段）叠采样 crunch 加料 |
| 变形 | G3 v0 合成 whoosh 对齐四拍 | servo/latch 机械点缀音（每拍 1 条短样本） |
| BGM | —（合成不可行） | 立项即采样/委托创作，走 DP-3 决策 |

---

## 3. Autoplay 政策与首手势解锁模式

### 3.1 政策现状（2026-08 核验）

| 引擎 | 口径 |
|------|------|
| Chrome（71+ 至今） | Web Audio 纳入 autoplay 政策：无手势创建的 AudioContext 以 `suspended` 出生；手势内 `resume()`（或手势内新建）即解锁。媒体元素侧另有 MEI（媒体参与度指数）放行通道，但 **Web Audio 不吃 MEI，只认手势**。muted 自动播放恒许可 |
| Safari（macOS/iOS） | 同样要求手势内 create/resume；iOS 额外有 audio session 类别问题（§3.3）。`decodeAudioData` 对 WebM Opus 支持史上长期缺位（media element 侧 17.4 起才一致支持） |
| Firefox | 默认阻止无手势音频，用户可全局/逐站放宽；解锁模式与 Chrome 相同 |
| 通用判定 | 创建后查 `AudioContext.state`：`running` = 无需解锁；`suspended` = 等手势；监听 `statechange` 异步感知。合法 activation triggering events 含 `click` / `pointerdown` / `pointerup` / `touchend` / **`keydown`**（非单独修饰键）——Space 与 WASD 都算 |

### 3.2 与科技城变形 CTA 结合的解锁链（推荐模式）

本站首幕流程已天然提供手势闸门，音频解锁**零新增 UI**：

```
robot_idle（CTA armed）
   │ 用户第一手势 = CTA 点击 或 Space keydown（[data-world-transform]，Reveal.ts CITY-05 唯一主 CTA）
   ▼
Audio.init()：new AudioContext()（手势内新建，直接 running）
   + navigator.audioSession?.type = 'playback'（iOS，feature-detect，§3.3）
   + 主 GainNode 挂载（mute 态读 localStorage）
   ▼
变形 whoosh 成为用户听到的第一个声音（G3：~0:05 处「这个站有声音」的惊喜时刻）
   ▼
后备解锁（CTA 被绕过的路径）：
   · reduced-motion「显式进入」按钮 click（CITY-E2E-04 路径）→ 同一 Audio.init
   · ?poi= 深链 / 任何直入驾驶态路径 → 首个 WASD keydown / pointerdown 的 once 监听兜底
```

设计要点（全部有仓库先例背书）：

1. **手势内新建优于「先建后 resume」**：folio 精确同款（`Reveal.updateStep(1) → audio.init()`，
   `bruno-simon-folio-source-teardown.md` §7.3——Start 按钮第一功能就是 autoplay 合规）；
   避免页面加载即建 context 的 console 警告与 suspended 悬挂态。
2. **单例 AudioContext**：全站一个 context（MDN 最佳实践口径），挂 `Game` 生命周期，
   `dispose()` 时 `close()`（mount 契约可重复挂载的要求）。
3. **解锁 ≠ 出声**：init 只建图不播声；mute 钮（G3：右上常驻、localStorage 记忆、默认开）
   控制主 GainNode——「解锁」与「用户音频偏好」两个状态位分离，`world-audio` 埋点记
   `{enabled, source:'auto'|'user'}`。
4. **reduced-motion 不联动音频**（G3 既有口径：口径独立，动效偏好 ≠ 声音偏好），但显式进入
   按钮同样是合法手势，该路径解锁链不断。
5. **e2e 面**：mute 钮进断言（G3 红线）；autoplay 合规本身可断言 = 无手势路径下
   `AudioContext` 不存在（懒创建的可测性副产品）。

### 3.3 iOS 专项（两坑一表）

| 坑 | 事实 | 对策 |
|----|------|------|
| 静音拨键静音 Web Audio | iOS 页面 audio session 默认 `ambient` 类别 = 受静音键管辖；Web Audio 全静但 `state` 仍 `running`、无任何报错（media element 反而不受影响）。WebKit bug 237322 已按「配置变更」关闭 | iOS 17+ / Safari 16.4+：`navigator.audioSession.type = 'playback'`（feature-detect，API 仍是 Editor's Draft 仅 WebKit 实现）；旧 Safari 兜底 = 手势内**循环**播放静音 media element（swevans/unmute 范式——一次性 1ms 静音片会在结束后回落 ambient） |
| `playback` 的产品权衡 | `playback` = 无视静音键出声（原生播放器行为）；`ambient` = 尊重静音键（但用户困惑「为什么没声」且无从提示） | **推荐**：`Audio.init` 即设 `playback`，但首次解锁 toast 提示「已开声 · 右上可静音」——静音键党一键可关，比无声+无提示的 `ambient` 体验诚实；此为 DP-2 开放决策（§5.3） |
| 解码格式 | Safari 17.4 前 WebM Opus media element 不可播；`decodeAudioData` 的 Opus 史上问题（issue 226922/245428）不建议赌 | sprite（decode 路径）用 **MP3 或 AAC**（全引擎安全）；BGM（流式路径）Opus/WebM 主源 + AAC/M4A `<source>` 回退 |

---

## 4. 体积预算策略（相对 <200KB 站点预算的音频分账）

### 4.1 分账口径（先厘清「200KB 管不管音频」）

master-plan 7.5 的 **<200KB（不含字体）是 `/`（及 `/home/`）首屏传输预算**；world 资产走独立分账
（SRD NFR-P6：首包 ≤5MB / 流式 ≤12MB / `public/` ≤40MB）。音频的预算纪律因此是三条：

1. **`/` 首包音频字节 = 0，永远**。音频初始化在首手势后（§3.2），资产加载更在其后——
   G-A′「交互前零 world 字节」门禁天然覆盖，LHCI 双口径零影响。
2. **采样资产计 world 流式账**（≤12MB 池），并逐笔进 `asset-ledger-cyber-city.md` +
   CC-BY 素材进 `THIRD-PARTY-NOTICES`（Khronos 先例）。roadmap 资产行 #10 既有配额
   「音效合计 ≤2MB」继续有效。
3. **BGM 当前无预算行**（#10 明文「不上 BGM」）——立项须先修订 roadmap 该行（DP-3）。

### 4.2 三工具适用矩阵（流式 / 懒加载 / sprite）

| 工具 | 机制 | 适用 | 不适用 | 内存/体积账 |
|------|------|------|--------|-------------|
| **纯合成**（G3 主路径） | OscillatorNode/噪声 buffer + GainNode 实时生成 | 全部 SFX（加速/巡航/刹车/撞击/变形/UI） | BGM（编排复杂度超红线） | **0 网络字节、~0 内存**；CPU 开销可忽略（G3 已核） |
| **Audio sprite + 懒加载** | 多条短样本拼单文件 + JSON 偏移表；手势后 `fetch → decodeAudioData` 一次；播放 = `AudioBufferSourceNode.start(0, offset, duration)` | 采样 SFX 介入时（§2.3 右列）：1 请求 1 解码，杜绝 N 小文件竞争带宽 | 长音频（decode 后 PCM 驻内存：48kHz 立体声 float32 ≈ **23MB/分钟**，mono 减半） | 建议 sprite ≤300KB（MP3/AAC 96kbps ≈ 25s 素材量，对短 SFX 族充裕）；偏移表进 `src/data/`（camera-shots.json 同范式，DP-4） |
| **Media element 流式** | `<audio>` + `MediaElementAudioSourceNode` 接入图（吃主 GainNode 的 mute/音量总线）；HTTP Range 流式，不 decode 全曲 | BGM（长时长、无内存爆账、浏览器原生缓冲） | 采样级精确调度/参数化（SFX 不走此路） | 60–90s 循环 @ Opus 96kbps ≈ 720KB–1.1MB、@ 64kbps ≈ 480–720KB；**建议预算行 ≤500KB**（64–80kbps 立体声 60s 或 mono 96kbps 90s） |

### 4.3 无缝循环与格式细则

- **SFX（sprite/合成）**：`AudioBufferSourceNode.loop = true` 是采样级无缝（巡航层可用 sprite 内
  短循环段 3–5s）；合成层天然无循环问题。
- **BGM（media element）**：`loop` 属性有 gap 风险——MP3 编码器 padding 是循环爆点元凶，
  Opus/AAC 视编码参数可 gapless 但不保证。三级方案按成本升序：① 选曲首尾同相（fade 头尾的
  ambient 类曲目 gap 不可闻）；② Opus 编码 + 首尾零交叉裁切；③ 双 `<audio>` 交叉淡化（~30 行，
  仅在 ①② 实测可闻爆点时上）。**不建议**为无缝把 BGM 搬进 decodeAudioData（60s 立体声 ≈ 23MB
  常驻内存，低端移动档不可接受；mono 也要 11MB）。
- **格式矩阵**：sprite = MP3 128kbps 或 AAC 96kbps（decode 全引擎安全，§3.3）；BGM =
  `<source>` 双源 Opus(WebM) 主 + AAC(M4A) 回退（Safari <17.4 与旧 iOS 覆盖）；
  Sonniss 的 WAV 原料**必须转码后入库**（原文件动辄数十 MB）。
- **加载时序**：sprite decode 与 BGM 首缓冲挂在「首手势后 + 加载屏末拍 shader 预热同窗」
  （adaptation §7.2-3 便车）；BGM `preload="none"`，用户开声（或首个 driving 帧）才拉流。

### 4.4 建议预算表（供实现任务书转录）

| 资产 | 上限 | 计账 | 前置条件 |
|------|------|------|----------|
| 合成 SFX（v0 三音包 + v1 引擎层） | **0 字节** | — | 无（G3 已裁决） |
| 采样 SFX sprite（含偏移 JSON） | ≤300KB（预留 #10 的 ≤2MB 配额内首期额度） | world 流式账 + asset-ledger | §2.3 采样介入条件触发 + 素材许可入账 |
| 赛博朋克循环 BGM（双源合计） | ≤500KB（单源 ≤300KB） | world 流式账 + asset-ledger（+ 署名视许可） | **DP-3：修订 roadmap 资产行 #10「不上 BGM」** |
| `/` 首包音频字节 | **0（硬门）** | G-A′ 既有门禁 | 永久 |

---

## 5. 给下游实现任务书的建议与开放决策点

### 5.1 Audio.ts 结构建议（对齐 150 行红线）

借 folio `Audio.js` 的**结构**不借依赖（769 行 → 手写收敛）：单例 context（手势内建）+ 主
GainNode（mute/音量总线，media element 与合成节点同接）+ 事件注册表（名称 → 合成配方或
sprite 偏移）+ antiSpam 冷却（碰撞连击限流，folio 同款）+ localStorage mute 持久化 +
`dispose()` 全链拆除。位置衰减（PannerNode）v1 不做——本站单声源密度低，
StereoPannerNode 按需后补。

### 5.2 事件挂点表（全部为既有事件/状态，零新增事件面）

| 声音事件 | 挂点（现有代码） | PUBG 签名对齐 |
|----------|------------------|---------------|
| 加速/巡航引擎层 | `focusPointSpeed`（View 已算的速度域单源；**不得**用 `forwardSpeed`，D 系裁决同款口径）+ boost 动作态 | 引擎音高/音量随速度连续映射，boost 谐波增强 |
| 刹车/打滑 | brake 动作（Space/B/Ctrl）+ `PhysicsVehicle` 打滑态（若暴露） | 短 skid 突发，非循环 |
| 撞击建筑 | cone-hit / `streetProps.hitCount` 计数增量（`index.ts` L359 既有轮询点，DriveFeedback 同源） | thump 强度随撞击规模 |
| 机器人变形 | `world-transform` 事件 + 四拍时间轴常量（1.05s，按拍对齐 whoosh/servo） | 变形 = 首个声音时刻 |
| FPV/TPP 切换（V 键） | driveView 二态（CC-VEH 已落地） | **FPV 时引擎层过低通滤波（舱内闷化）、TPP 撤滤波**——一个 BiquadFilterNode 的 PUBG 质感，成本 ~5 行 |
| 进站确认 | `world-poi` 事件 | 双音上行（G3 v0 ③） |
| BGM | 用户开声后常驻，`visibilitychange` 暂停 | 低混、不与引擎层抢频段（选曲时留中低频空间） |

### 5.3 开放决策点（本篇不裁，登记给编排）

| # | 决策点 | 建议倾向 |
|---|--------|----------|
| DP-1 | 采样 SFX 是否立项 | v0/v1 纯合成先上线听感验收，**不满足再开** §2.3 采样介入（sprite ≤300KB 预算已备好口径） |
| DP-2 | iOS audioSession `playback` vs `ambient` | `playback` + 首次解锁 toast（§3.3 权衡表）；随 Audio.ts 任务书终裁 |
| DP-3 | BGM 立项与 roadmap #10 修订 | 供给（Pixabay/FreePD）与预算口径（≤500KB 双源）已备好；是否上 BGM 归指挥官产品裁量——BGM 是「氛围沉浸」与「个人站克制感」的取舍，非纯技术题 |
| DP-4 | sprite 偏移表/音频参数数据面归属 | `src/data/audio-sprite.json`（camera-shots.json 同范式：数据驱动、零硬编码机位常量的同款纪律） |

---

*CC-AUDIO-PUBG-RESEARCH · 只调研零实现：本分支仅新增本文档；未触碰 `src/`、`e2e/`、
`playwright.config.ts`、workflow 与像素基线。外部事实（Sonniss EULA v2.0、Freesound API
许可过滤、Chrome/Safari autoplay 与 audioSession、WebM Opus 支持时间线）均为 2026-08-28
web 核验快照；仓库内结论均标注出处文档与行级证据。*
