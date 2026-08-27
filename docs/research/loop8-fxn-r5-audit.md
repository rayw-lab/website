# Loop 8 功能独立复审 R5（CC-AL-FXN-R5）

> 执行模型自报：**claude-fable-5-thinking-xhigh**

> ⏳ 取证进行中（本文件随每条腿完成增量提交；最终登记以 `cyber-city-function-rubric-score.json` 为准）。

## 0. 审计事实（kickoff）

| 项 | 审计事实 |
|---|---|
| 审计对象 | `main@dc3f56b`（含 FXN-C5 #90 + FXN-C6 #91 + VIS-X1A-R4 #92 + X3 e2e #93；审计分支 `cursor/cc-al-fxn-r5-1d6f`，独立 worktree `/tmp/wt-al-fxn-r5`） |
| 比较基线 | 上轮登记 `main@66ed0fe`（84 分，`loop8-fxn-audit.md`）；R4（`main@5fc9533`）70min 卡骨架被 stop，零证据入账 |
| 冻结秤 | `docs/spec/cyber-city-function-rubric.md` v1.0 |
| 脚本 | S-2 v1.0 + S-5 v1.0（L1–L7 全腿） |
| 真机腿 | **缺席**——按任务书裁决：F1/F2 计时高段锁 85，不伪造 90 |
| 端口纪律 | 吸取 R4 事故：本轮 preview 用全新端口并以构建指纹（当轮 commit 特征交付件在页面/资产中可见）互证后才开始取证 |

## 1. 环境与指纹（取证前置，已互证）

| 项 | 读数 |
|---|---|
| 环境 | Node v22.14.0 · pnpm 10.33.3 · `pnpm install --frozen-lockfile`（锁文件不漂移）→ `pnpm build`（**19 pages**，dist 16M）→ `pnpm preview --host 0.0.0.0 --port 4444`（tmux `fxn-r5-preview`） |
| 构建指纹互证 | 服务口 `GET /website/_astro/world.D74ett3S.js` sha256 `1a762db3…3b84eb` 与本轮 `dist/_astro/world.D74ett3S.js` **逐字节一致**；bundle 内含 C5/C6 特征串 `speedtrap` / `brake-first` / `suspension-jump` / `idle-nudge` / `quest-`——确认被测对象就是 `main@dc3f56b` 当轮构建，非陈旧服务器 |
| 端口环境事实 | 取证时 VM 上仍有 20+ 个历史轮次陈旧 preview/dev 服务器（4321/4322/4329/4331…4602），R4 报告的 4337 陈旧口至今在跑——R5 全部取证只指 4444 |

### 1.1 环境事故留痕（R4 病根定位 + 本轮排除）

R5 开工时根盘 **100% 满（252G/252G，0 可用）**，`pnpm build` 在 vite deps 阶段 ENOSPC 失败。取证定位：`/opt/cursor/recording-staging/` 累计 **236G**，其中 R4 会话 16:12 启动的**僵尸录屏 ffmpeg（PID 96632）持续录制 4h05m 未停**，单文件 `recording_render_proxy_1080p.mp4` 膨胀至 **193GB**，另有 17 个更早轮次录屏残骸。这解释了 R4「70min 卡骨架零产出」的环境侧病根：录屏未收口 + 磁盘被实时吞噬。处置：按 PID 终止该 ffmpeg、清空 staging 残骸与 FXN 世系历史 worktree（~1.6G），盘位恢复 232G 可用后重建通过。**本轮零录屏悬挂**：每段录屏当腿保存收口。

## 2. S-2 v1.0（Pass A 主腿，桌面 1440×900，全新 context = 首访清存储实证 ls/ss=0）

> SwiftShader 纪律：`t` 仅用于排序；本轮实测 avg 0.4fps 触发 `quality-auto-drop`（0→1），全部计时类锚点不判。

| 脚本段 | 观察 | dump 锚点（当轮实测） |
|---|---|---|
| 首幕 | 定位语 h1 可读；机器人立于光圈；CTA「变形 · 巡航态 Space」+ 状态行「机器人形态 · 座舱 AI 就位——点击…或按 Space」+ 全键位 hint 三层接力；**quest chip 在 robot_idle 恒 display:none（恒等门实证）**；HERO TOWERS 图例 + 0 KM/H 速度表在位 | `mount #1/t0` → `world-reveal #2/t253347` → `robot-idle #3/t329397`；截图 `s2_01_first_frame.png` |
| 变形 | CTA 点击即 `transforming` + CTA disabled + 文案「变形中 · 光幕遮蔽热交换…」；car_ready 文案「巡航态 · CarConcept 已落地十字路口——WASD 即刻可开」；**chip「下一站 概念车库 141m 1/5」随 car_ready 同拍激活（C5 新面）** | `transform-start{to:car} #4/t477857` → `hint-shown #5` → `world-transform{to:car} #6/t650269` → `world-quest{shown,step:1,concept-garage} #7/t650291` |
| 驾驶 | W 即入 driving；双急转成立；Shift boost、Space 刹车（**BRAKE 徽标按住亮/松开灭，双沿实证**）、F 悬挂跳（**「悬挂弹跳」chip**）、V fpv↔third 往返、R 复位（toast「已复位 · 回到最近路口」）全部三段闭环；追加确认层：`quality-auto-drop` 有「帧率偏低 · 已自动降低画质」toast | `world-drive-start #8/t773224` → `boost-first #9/t892776` → `quality-auto-drop{0→1,avg:0.4} #10` → `brake-first #11/t927570` → `suspension-jump #12/t948951` → `hint-dismissed{timeout} #13` → `world-drive-view{fpv} #14`/`{third} #15` → `respawn{key} #16`；截图 `s2_06_brake_badge.png`（BRAKE+悬挂弹跳+降档 toast+chip 146m 同框） |
| POI | 街边紫色光圈（Agent Nexus）画面内自然可发现；hint 行进阶为「靠近大楼按 E 进站」；进圈三连响；E 进站导航至 `/website/ai-lab/`（楼=分区映射正确）；浏览器返回回到世界页成立 | `poi-bounding-in{agent-nexus} #17` → `explore-progress{agent-nexus,n:1,total:12} #18` → `world-quest{reached,step:3,agent-nexus} #19`（顺序外到站合法照打）；`world-poi`/`shot-apply` 在导航前触发但 ring 随页卸载丢失——**L1 腿补该锚**，不在本腿伪造 |

三问逐字记录（审计者以首访者心智作答）：

1. 我是谁：**「我是能变形成 CarConcept 巡航车的座舱 AI 机器人。」**
2. 能干什么：**「按 Space 变形后用 WASD 在科技城开车、加速刹车跳跃切视角，跟着『下一站』光柱和光圈找大楼，按 E 进站看各产品线内容。」**
3. 下一步：**「照顶上『下一站 概念车库 141m 1/5』往光柱方向开，进圈按 E。」**

S-2 缺口留痕（诚实入账，不伪装 skipped）：① 本腿未撞到道具（`coneHits=0`），cone-hit 锚在后续腿补跑；② `world-poi`/`shot-apply` dump 锚因低帧下前奏窗被压缩 + 导航卸载未采样到，L1 用 pagehide 暂存法补齐。录屏 `s2_full_session_20260827.webm`（30:09）。

## 3. S-5 v1.0 七腿

| 腿 | 结果 | dump/状态证据 |
|---|---|---|
| L1 深链 | **通过（含链推进新证）**。`?poi=concept-garage` 出生 `(140,-18)` 与 JSON parkingBay 一致（`__worldSpike` 遥测 x140/z-18/yaw1.57/grounded）；非 ritual 挂载即激活 chip；出生即在圈 → 链**顺位推进**至「下一站 座舱语音舱 136m 2/5」；E 进站前奏 shot 生效后导航；pagehide 暂存法补齐 S-2 缺口锚 | `mount #1` → `deep-link{poi:concept-garage} #2/t37504` → `ready #3` → `world-quest{shown,step:1} #4` → `poi-bounding-in #5` → `explore-progress{n:1,total:12} #6` → `world-quest{reached,step:1} #7` → `world-quest{shown,step:2,voice-pod} #8` → `world-poi{concept-garage} #9/t469061` → `shot-apply{poi_showcase-concept-garage} #10/t469061`；funnel firstPoiIn=96927 / firstPoiInteract=469061；截图 `l1_01_deeplink_spawn.png`、`l1_02_arrival_prelude.png` |
| L2 失败恢复 | **三路径全通过（计时不判）**。①翻车（#debug 句柄置位，e2e FB-04 同口径——软渲染物理翻车不可确定复现）：倒计时件「翻车检测 · 自动翻正 2.8s · R 立即回到路口」呈现 → 3 设计秒自救 `flip-jump`，车体翻正 grounded；②再翻车 + R：`respawn{key}` + toast「已复位 · 回到最近路口」；③置 y=-60 越 killElevation：`respawn{fall}` + **专属 toast「掉出边界 · 已就近重生」**（与 R 复位文案区分，确认层分语义） | `upside-down #9/t214752` → `flip-jump #10/t414874`；`upside-down #11` → `respawn{key} #12/t550632`；`respawn{fall} #13/t574676`；截图 `l2_01_flip_countdown.png`、`l2_03_aim.png`（fall toast + #debug 面板同框） |
| L3 提示/ESC | **ESC 面通过；H 召回深链会话不适用（ritual 会话 L6 复测）**。ESC 开菜单 `esc-menu-open #14`（壳桥）+ 双出口「招聘方速览→/website/work/」「内容首页→/website/home/」均 200 可达；再按 ESC 关闭成立。深链会话 Reveal 键位卡未挂载（全程无 hint-shown），H 无响应属边界事实非缺陷；S-2 已证 `hint-shown #5`→`hint-dismissed{timeout} #13` 且状态行广告「按 H 重看键位」 | `esc-menu-open #14`；截图 `l3_esc_menu.png`；出口 HTTP 200×2 |

S-2/L2 补锚留痕：撞道具（隔离墩）自然复现三次尝试均未命中——本环境 fps≈0（#debug 读数 fps avg/1% = 0/0，15s 墙钟位移 ~2m），与 e2e CITY-FB-06 文件头判例一致（「物理驾驶撞墩在软渲染下不可确定性复现，真值路径由灰盒锥桶腿代表证明」）；碰撞确认层真值由同 commit e2e FB-06（灰盒撞桩 → 「碰撞 ×N」脉冲 + `[data-ws-cones]` 同拍）承接，`[data-world-collision]` 待机隐藏合同本轮实测成立。**不计成功收益、不作扣分依据**（环境不可判事实）。

F7 随腿取证：`#debug` 面板实时状态（fps/drawCalls 347/triangles 475767/frame ms 分段/pos）+ 事件流镜像 + **EXPORT session JSON 实测下载** `session-7d800a3d.json`（schema 1 · 13 events · dropped 0 · env{webgl2,physics,quality:0,rm:false,1440×900} · counters{respawns:2,poiEnters:1,longFrames:347}）。

（L4–L7、逐维打分、双 Pass 合议与裁决随取证增量回填。）
