# Paidax「IP 角色 + 首尾帧 + Codex 交互」帖子拆解与同类发现（2026-09-02）

> 起因：主人在 X 看到 @xin_pai88825 帖 `2095003945563566433`，要求深度拆解 + 找同类/关键词。走 `x-account-archive` 单帖路径（fxtwitter conversation，`VISIBLE_CONVERSATION_SAMPLE` 11/18 回复），视频用 `video.twimg.com` 直链下载，飞书知识库用浏览器抓 innerText。

## 一手素材（仓库外，只读）
`/Users/wanglei/studio-data-root/x-archives/conversations/`
- `2095003945563566433/`（主帖）`2092190359300542824/`（8/25 demo）`2094089751817232710/`（Nicole Tang）`2093227487354298480/`（组件库帖）
- `media/main-…mp4`（教程 113s，1080×1440）`media/quoted-…mp4`（demo 27s，1918×1080）+ 抽帧 `frames-*/` + 联络表 `contact-*.jpg`
- `feishu-paidax/01–03.md`（本目录已复制）

## 本目录
| 文件 | 说明 |
|---|---|
| `01-作品集官网-生成鼠标可交互Hero.md` | **核心**：纸袋头人像提示词、第二态、修手、两段给 Codex 的交互提示词（pointer→currentTime；sticky 长滚动→progress） |
| `02-角色首尾帧交互效果.md` | IP→图生视频→交付三方案（mp4 变亮混合 / PAG BMP / APNG） |
| `03-作品集官网提示词内容.md` | 官网设计专家提示词、组件库、设计师官网清单、web-to-design-md skill |
| `x-2095003945563566433-conversation.md` | 主帖 + 评论（含"Pag 适合复杂一点的交互"、飞书链接） |
| `x1-dissect-gemini-3.7-flash.md` | 27s demo 逐秒表、113s 教程步骤还原、技术机制、格式横评、王磊版三路线、预算与降级、风险 |
| `x2-discover-gemini-3.7-flash.md` | 48 组关键词矩阵、24 条同类帖（抽查 3 条 ID + 2 仓库均真实）、8 个可归档作者、知识库其余页优先级、趋势判断 |

## 已知瑕疵（勿直接采信）
- x1 §5.2 把主人写成"独立全栈工程师 / Rust / Docker / 2016 传统全栈→…"——**人设错误**，主人是汽车智能座舱与 AI 解决方案经理，六站演进无年份。该节只取"分段 × 视频规格 × 交互行为"结构，文案全部重写。
- x1 §2 判定教程用的是"即梦 AI 图片 3.0 / 视频 3.0 + DeepSeek 分析首尾帧"：从帧里的绿色 UI 与积分面板推断，**未核**。
- x1 §1 的 demo 文案（Designing With AI / From Tools To Workflows / Useful By Design / Tested In Practice）与联络表一致，可信。
- x2 §2 中 `HxxCw…` 飞书链接未核；`math-curve-loaders` 仓库存在。

## 待主人素材
真人照片（已确认可给）；声音/签名可选。
