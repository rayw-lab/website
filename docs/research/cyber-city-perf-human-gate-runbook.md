# 赛博科技城性能真机六腿执行手册（CC-PERF-HG-PREP · 指挥官版）

> 执行模型自报：**claude-fable-5-thinking-xhigh**

| 项 | 内容 |
|----|------|
| Task | **CC-PERF-HG-PREP**（doc-only，顾问报告 §3.2 剩余步 1 / §5 派单 3）——性能首分硬前置：指挥官真机六腿**逐步执行手册** + human-gate §5.4 城市档表行 5/6 追加（随本 PR 落地） |
| 分支 | `cursor/cc-perf-hg-prep-1d6f`（base：`main` @ `b1c8130`，#68 顾问报告 / #69 / #70 已合） |
| 日期 | 2026-08-27 |
| 性质 | **执行手册，不是秤**：判定腿集合/门值/锚点正本 = `docs/spec/cyber-city-perf-rubric.md` §4（v1.0 冻结，本手册零改秤）；**回填正本与签字位** = `docs/spec/human-gate-checklist.md` §5.4（行 5/6 已随本 PR 追加）；登记契约 = rubric §5（JSON schema 与 null 语义）。三处冲突时以 rubric 为准并回报勘误，不得现场自行改口径 |
| 执行人 | **指挥官（王磊）**——判定与签字不可委托（human-gate 文件头纪律）；云端代理产不出真机读数（rubric §1 铁律 3） |
| 消费方 | 指挥官（照做）· CC-AL-PERF（登记时引用 §5.4 记录行 + 本手册 §5 null 映射）· 父代理（northStar.perf 出数前置盘点） |
| 红线 | ① 留空不伪造（产不出的腿 = 对应维 `null`，§5）；② CI/SwiftShader 读数永不充当判定（禁止清单 4）；③ 为凑读数裁剪脚本/换轻量动作 = S4 结构门击穿，登记无效（rubric §1 铁律 2） |

---

## 0. 一页速览

**你要做什么**：在自己的桌面 Chrome 和一台中端安卓真机上，对生产首页 `/`（科技城）跑六条测试腿，把帧率/计时读数回填到 `human-gate-checklist.md` §5.4 表，并把「录屏 + 截图 + 记录行」三件套归档。这是性能 85 登记（northStar.perf 从 `—` 变数字）**唯一**产不出于云端的环节；六腿读数缺一，顶层分必须 `null`（§5）。

| 腿 | 回填行 | 设备 | URL（生产） | 动作 | 主读数 | 门 | 计分维 |
|:--:|:--:|------|------|------|--------|-----|:--:|
| 1 | §5.4 行 1 | 桌面 Chrome | `/#debug` | 变形+驾驶 20s 脚本 | fps avg / 1% low | avg ≥60 · low ≥45 | P1 P2 |
| 2 | §5.4 行 2 | 同上 | `/?gl=1#debug` | 同上 | 同上 | 同上 | P1 P2 |
| 3 | §5.4 行 3 | 中端安卓 Chrome | `/#debug` | 变形+驾驶 60s 脚本（触屏口径 §2.3） | 同上 | 持续 ≥30fps（<24 → 三板斧） | P1 |
| 4 | §5.4 行 4 | 同上 | `/?gl=1#debug` | 同上 | 同上 | 同上 | P1 |
| 5 | §5.4 行 5 | **行 3 同设备** | `/?quality=2#debug` | 变形+驾驶 60s + 进站 | 核心路径完成度（帧率留档） | 完成 + 无功能性缺失 | P5（P1 对照） |
| 6 | §5.4 行 6 | 桌面（行 1 同机） | `/`（**不加 #debug**）+ DevTools Fast 4G + 清缓存 | 加载 → CTA 可用，计时 | 秒表 s + `funnel.robotIdle` ms | 较大值 ≤8s | P3 |

**建议执行顺序**：一次坐姿完成桌面三腿（1 → 2 → 6），一次连线完成安卓三腿（3 → 4 → 5）。腿间互不依赖，中断后可从任意缺腿续跑；同一腿录砸了可整腿重来（读数以当轮完整录屏为准，不许拼接）。

## 1. 事前准备

### 1.1 设备与工具硬需求

| 项 | 要求 | 说明 |
|----|------|------|
| 桌面 | Chrome **最新稳定版**（版本号入记录表） | 腿 1/2/6；操作系统不限 |
| 安卓 | **2019 年后中端档**：Adreno 61x / Mali-G5x 级 SoC（骁龙 675/730/765G 等机型），Chrome 最新稳定版 | 腿 3/4/5。**旗舰机读数不作门禁**——可另记参考行，判定列画「—」（§2.2 既有纪律） |
| 数据线 + 主机 | 安卓 USB 调试开启，桌面 Chrome `chrome://inspect` 可见设备 | 安卓腿远程读控制台/DevTools 用 |
| 录屏 | 桌面 = 系统录屏或 OBS；安卓 = 系统自带录屏 | 三件套之一，全程录（含读数入镜） |
| 秒表 | 手机秒表或桌面秒表皆可 | 仅腿 6；录屏内可见更佳（时间码即秒表） |

### 1.2 被测对象与 URL

- **正式签署轮次一律测生产** `https://rayw-lab.github.io/website/`（合并 `main` 后的 GitHub Pages 部署）；合并前预演可用 `pnpm build && pnpm preview`（或 `pnpm human-gate:preview` 打印局域网 URL），但记录表「环境」信息必须注明 preview，且不作正式判定轮。
- **安卓测 preview 的安全上下文陷阱**：WebGPU 只在安全上下文（https / localhost）可用——手机直接访问 `http://<局域网 IP>:4321` 是非安全上下文，**WebGPU 腿会假回退成 WebGL 2**，行 3 读数作废。正确姿势：`chrome://inspect` → Port forwarding 把设备 `localhost:4321` 映射到主机 preview 端口，手机地址栏访问 `http://localhost:4321/website/`。测生产 https 无此问题。
- 每腿**清存储首访**：用全新无痕窗口，或 DevTools → Application → Clear site data。首访加载体验是被测对象的一部分。

### 1.3 读数工具箱（城市档与 world-spike 的关键差异）

**`/` 城市页没有 `[data-ws-fps]` 帧率 HUD**——那是 `/world-spike/` 专属挂点；城市页屏上常驻 HUD 只有速度（km/h）、「回到路口 (R)」与楼宇快览。城市档真机读数走以下三条通道（数据源同为引擎 FpsMeter，avg / 1% low 口径与 rubric 一致）：

| 通道 | 用法 | 用途 |
|------|------|------|
| **`#debug` 只读面板**（主读数，截图友好） | URL 尾加 `#debug` 打开页面（面板在**挂载时**判定 hash，进页后再改 hash 无效）。右上角出等宽字面板：`fps avg/1%` 行 + `drawCalls` / `triangles` / `state` / `speed` 等行 + 「EXPORT session JSON」按钮 | 腿 1–5 的屏上读数与 HUD 截图载体；面板只读、pointer-events 穿透，不碰驾驶输入；为独立动态 chunk，对帧率影响可忽略（存疑时与控制台读数互证） |
| **控制台 `__worldSpike.fps()`** | 桌面 = DevTools Console；安卓 = `chrome://inspect` → inspect → Console。返回 `{ avg, low1 }`；`__worldSpike.backend` 给实际后端字符串 | 互证读数 + 后端确认（防回退假象：探测到 WebGPU ≠ 实际用上） |
| **`__worldSession.dump()`** | 控制台执行 `window.__worldSession.dump().funnel`，取 `robotIdle`（ms） | 腿 6 计时互证机读位；「EXPORT session JSON」按钮导出同一份 dump |

后端徽标：页面顶栏右侧 `[data-world-backend]` 常驻显示当前后端（WebGPU / WebGL 2）——每腿录屏与截图须让它清晰入镜。

DevTools Performance（桌面腿互证）：录制 20s 驾驶段，看 FPS 轨道均值与红色长任务——P2 的「无长帧连片」互证依据（rubric §2.2-P2）。

### 1.4 三件套纪律（每腿一套，缺一即该腿无效）

1. **全程录屏**（`.mp4`）：从打开 URL 到脚本收尾，读数面板与后端徽标入镜；
2. **尾段读数截图**（`.png`）：驾驶尾段（腿 6 = CTA 可用瞬间 + throttle 面板入镜）截一张，`#debug` fps 行 / 后端徽标清晰可读；
3. **记录表一行**：`human-gate-checklist.md` §5.4 对应行逐列回填（§4.1）。

命名与归档见 §4.2。录屏过大可存网盘、记录行贴链接（README 既有先例）。

## 2. 公共动作脚本（S4 结构门同源——禁止裁剪）

### 2.1 键位（桌面）

`W/A/S/D` 或方向键驾驶 · `Shift` 加速（boost）· `Space/B` 刹车 · `V` 切换视角 · `R` 回到路口 · `E` 进站 · `Esc` 菜单。变形 CTA = 屏上按钮「**变形 · 巡航态**」或 `Space`（robot_idle 态出现即 armed）。

### 2.2 标准脚本（与 CITY-PERF-01 CI 采样脚本同源；桌面 20s / 安卓 60s 墙钟）

1. 打开对应 URL → 等待首幕：城市渐亮 → 机器人显现 → CTA「变形 · 巡航态」可点（`data-world-state: robot_idle`）；
2. 点击 CTA（或 Space）→ 变形动画 → 车落十字路口（`car_ready`）；
3. **立即压 W 起步**，从起步计 20s（桌面）/ 60s（安卓）墙钟，途中完成且仅完成：
   - **2 次急转**：A / D 各一次约 0.6s 满舵脉冲；
   - **1 次撞道具**：驶向隔离墩/道具撞一下（尝试即可，命中与否不判）；
   - **1 次 Shift boost**：直线段按住 Shift ≥1.5s；
   - 其余时间保持连续驾驶不停车（读数窗口不许挂机）。
4. 墙钟到点：读数（§1.3）→ 截图 → 停录屏。

**不许做**：中途暂停/切后台（帧率窗作废）；为读数好看减负载（关 `#debug` 以外的任何功能、绕开道具区、贴墙龟速）；一腿录屏拼接多段。

### 2.3 触屏替代口径（安卓腿 3/4/5）

触屏无键盘：拖动屏幕摇杆驾驶转向 · 点按屏幕跳跃 · 驶近光圈点按标点进站 · 「回到路口」按钮复位。脚本映射：急转 = 摇杆左右满打各一次；撞道具 = 驶向隔离墩；**boost 无触屏档** → 以摇杆满推直线 ≥1.5s 替代，并在记录行「场景/时长」列注明「触屏脚本」。若有蓝牙键盘可接，优先按 §2.2 原脚本执行（记录行注明）。

## 3. 六腿逐步执行

### 3.1 腿 1：桌面 WebGPU（§5.4 行 1 · P1 P2）

1. 桌面 Chrome 无痕窗打开 `https://rayw-lab.github.io/website/#debug`；确认顶栏后端徽标 = **WebGPU**（若显示 WebGL 2 = 本机无 WebGPU，如实记录并在记录行注明，该腿按实际后端计）；
2. 开始录屏；DevTools → Performance → 点录制；
3. 执行 §2.2 脚本（20s）；
4. 停 Performance 录制：看 FPS 轨道均值 + 有无红色长任务连片（P2 互证）；
5. 读数：`#debug` 面板 `fps avg/1%` 行为主，控制台 `__worldSpike.fps()` 互证；截图（面板 + 徽标入镜）；停录屏；
6. **门**：均值 ≥60 且 1% low ≥45；变形落地窗单次孤立尖峰可归因不扣（rubric §2.2-P2 70-85 段），驾驶段规律性 stall 要如实记；
7. 回填行 1 + 三件套归档（`cityperf_desktop_webgpu_<yyyymmdd>.mp4/.png`）。

### 3.2 腿 2：桌面 WebGL 2（§5.4 行 2 · P1 P2）

同腿 1，URL 换 `https://rayw-lab.github.io/website/?gl=1#debug`，确认徽标 = **WebGL 2**。命名 `cityperf_desktop_gl2_<yyyymmdd>.*`。

### 3.3 腿 3：安卓默认后端（§5.4 行 3 · P1）

1. 安卓 Chrome 打开 `https://rayw-lab.github.io/website/#debug`（清存储首访）；主机 `chrome://inspect` → inspect 该页备用；
2. 开手机录屏；等 CTA armed → 点按变形；
3. 触屏脚本驾驶 **60s**（§2.3）；
4. 读数：屏上 `#debug` fps 行为主（截图），远程 Console `__worldSpike.fps()` 互证；确认实际后端（`__worldSpike.backend`——中端安卓大概率无 WebGPU 而回退 webgl2，**如实按实际后端记录**）；
5. **门**：持续 ≥30fps；**<24fps → 三板斧裁决路径**（§2.2-6 既有：DPR 降档 → 关装饰细节 → 实例减半，逐项复测留档；三板斧后仍 <24fps → 止损裁决）。注意城市档三板斧的白名单口径沿 world-spike 既有裁决，且 `?quality=` 显式降档属腿 5 被测面而非本腿救场手段——本腿必须默认档跑完记录真值；
6. 回填行 3 + 归档（`cityperf_android_webgpu_<yyyymmdd>.*`，token 按实际后端；若实际为 webgl2 与行 4 重名，本腿文件名追加 `-default`）。

### 3.4 腿 4：安卓 WebGL 2（§5.4 行 4 · P1）

同腿 3，URL 换 `…/website/?gl=1#debug`，确认后端 WebGL 2。命名 `cityperf_android_gl2_<yyyymmdd>.*`。

### 3.5 腿 5：Q2 降档腿（§5.4 行 5 · P5，P1 对照留档）

**行 3 同一台设备**（对照前提），URL `https://rayw-lab.github.io/website/?quality=2#debug`。

1. 清存储首访 → 录屏 → CTA armed → 变形 → 触屏脚本驾驶 60s（同腿 3，帧率读数留档：对照行 3 的增益是 Q2 梯退实效旁证，**不设门**）；
2. 驾驶收尾后**驶近任一 hero 楼**：POI 光圈进入 → 前奏可见 → 点按标点（键盘 E）进站 → 落到楼宇真实页面 = **核心路径完成**；
3. **功能性缺失核查清单**（任一项不可达/失效 = P5 落 0 段，逐项过）：
   - CTA 变形可点、变形动画完整走完到 `car_ready`；
   - 驾驶输入有效（摇杆/WASD、转向、刹车）；
   - 「回到路口」复位可用；
   - POI 光圈 + 前奏 + 进站跳转可达；
   - HUD 速度读数与键位卡在场；Esc 菜单可开（桌面复核时）。
4. **预期差异 ≠ 缺失**：Q2 是止损档（后处理关 / 哑光地面 / 窗格静态 / 剪影层减档 / DPR 1.0）——画面变糙、无 bloom/反射属**设计内梯退**，不算功能性缺失；
5. **反馈项如实记**：当前无降档确认层（自动降档 O1 未合流），玩家无从感知自己处于 Q2 档——「完成但反馈缺失」按 rubric §2.2-P5 落 70 段；执行者能读 `#debug` 不算玩家可感知，不得据此上调；
6. 回填行 5 + 归档（`cityperf_android_q2_<yyyymmdd>.*`）。

### 3.6 腿 6：Fast 4G 计时腿（§5.4 行 6 · P3）

**URL 不加 `#debug`**（保持首访负载纯净），桌面 Chrome 行 1 同机。

1. 开无痕窗 → **先开 DevTools**：Network 面板 → throttling 选 **Fast 4G** → 勾 **Disable cache**；
2. 秒表就位（或依赖录屏时间码）→ 开始录屏；
3. 地址栏输入 `https://rayw-lab.github.io/website/` 回车，**回车即开表**；
4. 盯屏等待：poster/定位语先显 → 城市渐亮 → 机器人显现 → **CTA「变形 · 巡航态」可点**（`data-world-state: robot_idle`）——**CTA 可点即停表**，记秒表读数 T₁（s）；
5. 截图（CTA armed 画面 + Network throttle 设置入镜）；
6. Console 执行 `window.__worldSession.dump().funnel.robotIdle`，记 T₂（ms）；
7. **互证口径**：T₂ 时基是 world 模块挂载（引擎构造）起点，**不含壳加载与 world chunk 下载**，恒小于 T₁；差值主要为 Fast 4G 下的下载 + 挂载前静置拍，>1s 属预期但仍须在记录行写一句归因（如「差 3.2s = world chunk 下载」）；若 T₂ ≥ T₁ 或差值无法归因（如远超预算），如实记录并标注异常；
8. **判定取两读数较大值**（= T₁，对被试更诚实，rubric §2.2-P3）：≤8s = 100 · 8–10s = 70 · >10s = 40（只此三段，不插值）；
9. 回填行 6 + 归档（`cityperf_desktop_fast4g_<yyyymmdd>.*`）。

## 4. 回填与归档

### 4.1 §5.4 记录表逐列口径

| 列 | 填法 |
|----|------|
| 日期 | 执行当日 `yyyy-mm-dd` |
| 设备 | 桌面 = 机型/CPU/GPU 一句；安卓 = 型号 + SoC（如「Redmi Note 8 Pro / Helio G90T」）——入登记 JSON `evidence.environment` |
| 浏览器 | Chrome 完整版本号（`chrome://version`）；腿 6 追加「Fast 4G + 清缓存」已在表列预置 |
| 后端 | **实际后端**（徽标/`__worldSpike.backend`），非探测值；与预期不符（如安卓无 WebGPU）如实填并注明 |
| FPS 均值 / 1% low | 腿 1–5 = `#debug`/`fps()` 读数（整数）；腿 6 = 秒表 s / `funnel.robotIdle` ms（表列已注明） |
| 录屏文件 / HUD 截图 | 归档文件名（或网盘链接） |
| 门禁判定 | 按各腿门勾判；触发三板斧/止损时在行内注明裁决动作 |

环境补充信息（生产/preview、清存储确认、throttle 设置）不占列的，写在行内括号或表后一行备注——AL-PERF 登记 `evidence.environment` 会逐字引用。

### 4.2 归档与提交

- 三件套入 `docs/spec/assets/human-gate/`，命名 **`cityperf_<desktop|android>_<webgpu|gl2|q2|fast4g>_<yyyymmdd>.<mp4|png>`**（rubric §4.1 占位纪律；与 §2 world-spike 的 `fps_*` 命名族区分）；
- 回填与归档以 **PR-C**（真机表回填 + AL-PERF 登记，实现方案 `cyber-city-perf-impl-plan.md` §2）落库：指挥官可自行提交回填 commit，或将读数与文件交 AL-PERF 随登记 PR 一并落库——但**记录行数字与判定列必须出自指挥官**（判定与签字不可委托）；
- 六行回填完毕 = CC-AL-PERF 可派信号（顾问报告 §3.2 剩余步 3/4：数值门 + 结构门 S1–S5 双门判定 → 写 `docs/research/cyber-city-perf-rubric-score.json` → northStar.perf 自动出数）。

## 5. 产不出怎么办：null 语义与欠账（登记铁律）

**总规则**（rubric §1 铁律 3 + §5.1 状态机）：真机腿产不出 → 对应维 `score: null` + 登记 JSON `debts` 逐条留痕（腿号 + 原因 + 补测前置）；**任一维 `null` → 顶层 `score` 必须 `null` → northStar.perf 仍显 `—`**。禁止预计值、禁止 CI 读数补位、禁止旧轮读数冒充当轮。

### 5.1 腿 → 维映射（哪条缺、哪维 null）

| 缺失腿 | 必须置 `null` 的维 | 说明 |
|--------|:--:|------|
| 行 1（桌面 WebGPU） | **P1、P2** | P1 被测 = 行 1–4 四腿**全集**，缺一即 P1 `null`（不允许「以三腿打分」）；P2 被测 = 行 1–2 双后端，缺一即 P2 `null` |
| 行 2（桌面 `?gl=1`） | **P1、P2** | 同上 |
| 行 3（安卓默认） | **P1** | 行 5 的帧率对照基线随之缺失（P5 判定本身不依赖行 3——对照仅留档） |
| 行 4（安卓 `?gl=1`） | **P1** | |
| 行 5（Q2 降档腿） | **P5** | CITY-PERF-02（CI 存在腿）**不能**替代——禁止清单 2/4 |
| 行 6（Fast 4G 计时腿） | **P3** | CI 的 `loadToRobotIdleMs` 采集值同样不能替代（SwiftShader 慢动作，仅下界留档） |
| —（P4 无真机腿） | — | P4 唯一不依赖真机：登记同 commit CI run 零 ❌ = 100，任何 ❌ = 0；同 commit CI 证据缺失则击穿结构门 S3，**登记整体无效**（比 null 更早失效） |

### 5.2 常见缺腿场景

| 场景 | 后果 | 处置 |
|------|------|------|
| **无中端安卓设备**（首分第一临界资源，顾问报告 §4.2） | 行 3/4/5 全缺 → P1、P5 `null` → 顶层必 `null`，northStar 仍 `—` | 桌面腿 1/2/6 照跑照回填（少欠账，下一轮只补安卓三腿）；设备可得性（借/购/云真机）由指挥官决策后补测 |
| 桌面无 WebGPU | 行 1 按实际后端跑会与行 2 同后端——P1「双后端」口径破缺 | 记录行如实注明「本机无 WebGPU」；该腿读数留档，P1 是否可判由 AL-PERF 按 rubric 裁量（保守 = P1 `null` + debts「WebGPU 腿待有硬件后补」） |
| 走 §5.5 豁免留痕 | **豁免救不出数字**：对应维仍 `null` + `debts`，豁免只是产品决策留痕（非门禁降级） | human-gate §5.5 先例格式：豁免范围、不免除后续轮次、签字 |
| 单腿读数异常（如录屏中断、秒表漏按） | 该腿无效，不许用残段拼数 | 整腿重跑；当轮跑不完 = 该腿缺失，按 §5.1 映射置 `null` |

### 5.3 `debts` 欠账行格式（登记 JSON 契约，rubric §5.2）

```
"debts": ["腿 3/4/5（安卓三腿）：无中端安卓设备——补测前置 = 设备可得（借/购/云真机）", …]
```

## 6. 现场禁止事项速查（执行时贴手边）

1. **不伪造**：产不出留空，欠账入 `debts`——northStar 显 `—` 是诚实状态不是失败状态；
2. **不许 CI 读数上桌**：`city-perf-evidence.jsonl` / WS-PERF-01 / CI 的 loadToRobotIdle 采集值一律不进 §5.4 表（下界哨兵非判定）；
3. **不裁剪脚本**：2 急转 + 1 撞道具 + 1 boost 一个不许少（触屏替代按 §2.3 注明）；不许为读数绕开负载；
4. **旗舰安卓不作门禁**：只可另记参考行，判定列「—」；
5. **腿 3/4 不许用 `?quality=` 救场**：默认档跑真值，显式降档是腿 5 的被测面；<24fps 走三板斧/止损既有裁决路径；
6. **后端以实际为准**：徽标/`__worldSpike.backend` 说了算，探测值与预期不算数；
7. **判定与签字不可委托**：记录行数字、门禁判定列、§5.5 豁免签字必须出自指挥官本人。

---

*CC-PERF-HG-PREP · 2026-08-27 — 性能首分硬前置交付：指挥官真机六腿执行手册（设备/URL/读数通道——`/` 城市页无 `[data-ws-fps]` HUD，屏上读数走 `#debug` 面板或 `__worldSpike.fps()`；S4 同源动作脚本 + 触屏替代口径；腿 6 秒表/funnel 时基差归因与取大判定；三件套 `cityperf_*` 归档）+ human-gate §5.4 行 5/6 随 PR 追加 + null 语义腿→维映射（任一维 null → 顶层 score 必 null → northStar 显 `—`，豁免救不出数字）。doc-only，`src/`、e2e、config 零改动；秤恒为 perf rubric v1.0，回填正本恒为 human-gate §5.4。*
