# 共享背景（两路 Gemini 3.7 Flash 通用，先读完）

## 我们在做什么
王磊个人网站（Astro，GitHub Pages 纯静态，项目根 `/Users/wanglei/mywebsite` **只读**）正在规划第一栋楼：**「我是谁」炫技自我介绍页**。主人已确认**可以提供真人照片**（素材后续给）。首屏已有一座 three.js WebGPU 赛博朋克城市与一台 CC0 机器人化身（`public/models/hero-robot/`）。上一轮调研（`docs/research/about-showcase-research-2026-09-02/`）推荐"机器人的老家 + 滚动即镜头"形态。

## 本轮起因
主人在 X 上看到 @xin_pai88825（Paidax，1.6 万粉，设计师）2026-09-02 的帖子（id `2095003945563566433`）："周末手搓了个网站交互 demo……我先生成 IP 角色，然后用首尾帧来优化人物的页面过渡效果……再让 codex 做交互串联，鼠标跟随、滚动动画这些效果就都能实现了。" 引用了他 8/25 的帖（id `2092190359300542824`，"尝试用鼠标控制你的网页"）。评论区他贴出飞书知识库。主人觉得这类"很高级的网页分享"正是想要的方向，要求：**深度拆解这条帖子 + 找同类帖子/关键词**。

## 已抓到的素材（全部只读，路径绝对）
根目录 `/Users/wanglei/studio-data-root/x-archives/conversations/`
- `2095003945563566433/conversation.md` 主帖 + 11 条评论（含作者答复："Pag 适合复杂一点的交互"、飞书链接）
- `2092190359300542824/conversation.md` 被引帖（8/25 demo）
- `2094089751817232710/conversation.md` Nicole Tang 帖（"在做一个更好看的视频动效库"，Paidax 转评）
- `2093227487354298480/conversation.md` Paidax 推荐组件库帖（beUI / BoardUI / ThreeUI …）
- `media/main-2095003945563566433-1080x1440.mp4` 主帖教程视频 113s，竖屏 1080×1440
- `media/quoted-2092190359300542824-1918x1080.mp4` demo 成品录屏 27s，1918×1080
- `media/frames-main/f_001..038.jpg` 主帖每 3 秒一帧；`media/frames-quoted/f_001..027.jpg` demo 每秒一帧
- `media/contact-main.jpg`、`media/contact-quoted.jpg` 联络表（请务必用看图能力逐帧看）
- `feishu-paidax/01-作品集官网-生成鼠标可交互Hero.md` **核心**：人物生图提示词（纸袋头西装男）、第二态提示词、修手提示词、给 Codex 的两段交互提示词（首屏鼠标横向控制 video.currentTime；第二屏 sticky 长滚动区间控制视频进度）
- `feishu-paidax/02-角色首尾帧交互效果.md` IP 角色→图生视频→交付（mp4 混合模式 / PAG BMP / APNG）
- `feishu-paidax/03-作品集官网提示词内容.md` 官网设计专家提示词、组件库、设计师官网推荐清单
- 飞书知识库目录（还有《AI 视频精准控制：镜头语言、人物站位、视频运镜》《分镜提示词》《小鳄鱼IP延展&视频动效交付》《设计师最爱 Vibe Coding 工具合辑》等，URL 见 03 文件与目录 https://gwrdluzl9j9.feishu.cn/wiki/GVHywtdn6iDaHjk1so9c77CCnxh）

## 纪律
- 所有路径只读；只写各自 write root；不放 token。
- 联网结论必须给 URL；看不到就写"未核"。
- 中文输出。归因纪律：Paidax 帖文只代表他本人的主张；评论是他人观点；飞书文档是他的知识库。
