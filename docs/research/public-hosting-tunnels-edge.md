# 调研：从 Cursor 云 VM / CI 把网站暴露到公网——隧道与边缘托管方案

> 状态：已完成（含云 VM 实测）
> 日期：2026-08-24
> 关联：`docs/website-plan/master-plan.md`（GitHub Pages 部署）、`docs/research/3d-car-configurator.md`、`docs/research/tts-cockpit-visualization.md`
> 实测环境：Cursor Cloud Agent VM（Linux x86_64，Node v22.14.0，pnpm 10.33.3），站点代码取自 `cursor/full-site-delivery-1d6f` 分支

---

## 0. TL;DR

- **「快速给老板看 Demo 30 分钟」**：在云 VM 上 `pnpm build && pnpm preview --host 0.0.0.0 --port 4321 --allowed-hosts .trycloudflare.com`，再跑 `cloudflared tunnel --url http://localhost:4321`。**已实测成功**：约 8 秒拿到公网 HTTPS URL，无需任何账号/token，三个页面（首页 + 两个 Demo）全部公网 200。URL 随 cloudflared 进程终止立即失效（实测确认），随 Agent 会话结束自然消亡——正好符合"临时 demo"的安全预期。
- **「长期公网站点」**：不要用隧道。用仓库已配好的 **GitHub Pages**（`.github/workflows/deploy.yml` 已就绪），按「三步走」演进：① 先用默认 URL `https://rayw-lab.github.io/mywebsite/` 上线 → ② 绑自定义域名 + Enforce HTTPS → ③ 可选把 DNS 托管到 Cloudflare 做 CDN/防护前置。
- **所有需要 token 的方案**（ngrok authtoken、cloudflared 命名隧道 token），token 一律放 **Cursor Dashboard → Cloud Agents → Secrets**，以环境变量注入，绝不入库。本次实测选用的 quick tunnel 与 localtunnel **无需任何 token**，天然规避泄露风险。

---

## 1. 背景与评估口径

### 1.1 mywebsite 现状

- **技术栈**：Astro 7 + TypeScript + MDX，纯静态输出（`astro build` 产出 `dist/`），无服务端运行时。
- **部署目标**：GitHub Pages 项目页，`astro.config.mjs` 已设 `site: 'https://rayw-lab.github.io'` + `base: '/mywebsite'`。
- **两个 Demo 页面路径**（构建时静态生成，本次实测的公网验证对象）：
  - 3D 汽车配置器：`/mywebsite/lab/car-configurator/`（源码 `src/pages/lab/car-configurator.astro`）
  - TTS 多语种座舱可视化：`/mywebsite/lab/tts-cockpit/`（源码 `src/pages/lab/tts-cockpit.astro`）
- **CI**：`.github/workflows/deploy.yml`（push 到 main 触发 `withastro/action` 构建 + `deploy-pages` 发布）。
- **云环境**：`.cursor/environment.json` 已声明 4321 端口与 `astro-dev` 终端。

### 1.2 每个方案的评估维度

① 原理与是否适合 Astro 静态站；② 自定义域名 + HTTPS；③ 与 Cloud Agent 环境的兼容性（egress、secrets、会话生命周期）；④ 成本与稳定性（临时 demo vs 生产）；⑤ 安全/合规；⑥ 推荐场景。

---

## 2. 云 VM 实测记录（2026-08-24）

### 2.1 测试步骤与结果

在本次 Cloud Agent 会话的 VM 上按以下步骤操作（站点代码检出到临时 worktree，不影响调研分支）：

```bash
# 1. 构建（Astro 7，3 个页面 642ms 构建完成：/、/lab/car-configurator/、/lab/tts-cockpit/）
pnpm install --frozen-lockfile && pnpm build

# 2. 启动 preview（注意 --allowed-hosts，见 2.2 的坑）
pnpm preview --host 0.0.0.0 --port 4321 --allowed-hosts .trycloudflare.com

# 3. 下载 cloudflared 并开 quick tunnel（无需账号、无需 token）
curl -fsSL -o /tmp/cloudflared \
  https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x /tmp/cloudflared
/tmp/cloudflared tunnel --url http://localhost:4321
```

**结果**：

| 检查项 | 结果 |
|--------|------|
| 获得公网 URL | ✅ `https://nutrition-systems-alumni-kitty.trycloudflare.com`（07:51:47 启动，07:51:51 注册成功，约 **4–8 秒**） |
| 隧道协议 | QUIC 连到 Cloudflare 边缘（`ip=198.41.192.67 location=cmh01 protocol=quic`），出站方向建立，VM 无需开放任何入站端口 |
| HTTPS | ✅ HTTP/2 + 有效证书（Google Trust Services WE1 签发，`CN=trycloudflare.com`），访客侧零配置 |
| 首页 `/mywebsite/` | ✅ 200，公网往返约 55ms，`<title>` 正确返回站点标题 |
| Demo 1 `/mywebsite/lab/car-configurator/` | ✅ 200 |
| Demo 2 `/mywebsite/lab/tts-cockpit/` | ✅ 200 |
| URL 存活时长 | 从 07:51:51 注册到 07:58:38 主动终止，**全程 6 分 47 秒持续可用**（终止前最后一次探测仍 200）；官方语义是"进程活多久 URL 活多久"，无固定时限但**无 uptime 保证** |
| 进程终止后 | ❌ kill cloudflared 后 **5 秒内**公网 URL 失效（实测 Cloudflare 边缘返回 **HTTP 530 / error 1033** "Tunnel not found"）——即 **Agent 会话结束、VM 停止后 URL 必然失效**。localtunnel 同样实测:终止进程后 URL 返回 408 |
| token 入库风险 | 无：quick tunnel 全程零凭据 |

cloudflared 启动日志中的官方提示（原文摘录，与"生产可用性"直接相关）：

> "…these account-less Tunnels have **no uptime guarantee**… If you intend to use Tunnels in **production** you should use a **pre-created named tunnel**…"

### 2.2 实测踩到的坑：Vite/Astro preview 的 Host 校验

第一次通过隧道访问全部返回 **403**，响应体：

```
Blocked request. This host ("nutrition-systems-alumni-kitty.trycloudflare.com") is not allowed.
To allow this host, add "..." to `preview.allowedHosts` in vite.config.js.
```

原因：Astro preview（基于 Vite）默认校验 `Host` 头以防 DNS rebinding 攻击，隧道域名不在白名单。**修复**：启动时加 `--allowed-hosts .trycloudflare.com`（前导点 = 后缀通配，quick tunnel 域名随机所以必须用通配）。这一点对**任何**"dev/preview server + 隧道"组合都适用（ngrok、localtunnel 同理，需把相应域名加入白名单），写进 runbook 可少排查半小时。

### 2.3 第二数据点：localtunnel 同样实测通过

```bash
npx --yes localtunnel --port 4321
# your url is: https://stupid-drinks-march.loca.lt
```

约 20 秒（含 npx 拉包）拿到 URL；preview 侧把 `.loca.lt` 也加入 `--allowed-hosts` 后，公网访问 200。零 token。注意：loca.lt 对首次浏览器访客可能弹"tunnel reminder"确认页（程序化访问可加 `bypass-tunnel-reminder` 请求头绕过），给老板演示前自己先点一遍。

### 2.4 对 Cloud Agent 环境兼容性的实测结论

- **egress**：本环境可直连 GitHub Releases（下载 cloudflared 二进制）、npm registry（npx localtunnel）、Cloudflare 边缘（QUIC/7844）与 localtunnel.me——即默认 egress 足够宽松，两类隧道开箱即用。若目标环境收紧了 egress，cloudflared 可加 `--protocol http2` 退化为 443 出站；quick tunnel 只需放行 `*.trycloudflare.com`、`*.argotunnel.com`、`api.cloudflare.com` 一类域名。
- **secrets**：本次两个方案均零凭据。需要 token 的方案见 §7。
- **会话生命周期**：隧道进程活在 tmux 里，**与 Agent 会话同生共死**。Agent 结束或 VM 休眠 → 进程终止 → URL 失效（实测确认 530）。这决定了隧道只适合"演示窗口期"而非常驻。

---

## 3. 方案逐项分析

### 3.1 Cloudflare Tunnel（`cloudflared`）——临时 quick tunnel / 生产 named tunnel

**原理**：VM 内的 `cloudflared` 主动向 Cloudflare 边缘建立出站 QUIC/HTTP2 连接（反向隧道），公网流量经 Cloudflare anycast 边缘回源到本地端口。无需公网 IP、无需入站端口，天然穿透 NAT/防火墙——这正是云 VM/CI 场景的刚需。

- **适合 Astro 静态站？** 适合（隧道对上游协议无感，转发 preview/任意静态服务器均可）。但注意：隧道背后仍是你自己的单点进程，没有 CDN 缓存静态资源的收益。
- **自定义域名 + HTTPS**：
  - *quick tunnel*（`--url`，实测所用）：❌ 域名随机 `*.trycloudflare.com`，✅ HTTPS 自动。
  - *named tunnel*（需 Cloudflare 账号 + 域名托管在 Cloudflare DNS，免费套餐即可）：✅ 任意自有子域名 + 边缘 HTTPS，还可叠加 Cloudflare Access 做访问鉴权。
- **Cloud Agent 兼容性**：✅ 实测通过（见 §2）。named tunnel 的 token 走 Cursor Secrets（如 `TUNNEL_TOKEN`），启动命令 `cloudflared tunnel run --token $TUNNEL_TOKEN`。
- **成本/稳定性**：免费。quick tunnel 官方明示**无 uptime 保证**、受 ToS 约束，仅限试验；named tunnel 可上生产（但上游仍是你的单进程）。
- **安全/合规**：quick tunnel 把本地端口暴露给**任何知道 URL 的人**——只转发构建产物、不要转发带敏感数据的 dev server；URL 随机长串可视为弱口令，演示完即杀进程。named tunnel + Access 可做到"仅指定邮箱可看"。
- **推荐场景**：**30 分钟 Demo 的首选**（零账号零 token、最快、HTTPS 齐全）；named tunnel 适合"内网服务长期暴露"，但对纯静态站是绕路（不如直接边缘托管）。

### 3.2 ngrok / localtunnel / bore——开发隧道三兄弟

**原理**：同为反向隧道，差异在商业化程度与协议层级。

| | ngrok | localtunnel | bore |
|---|---|---|---|
| 原理 | 商业隧道 SaaS，L7 | 开源 Node 实现 + 社区服务器 loca.lt | 400 行 Rust 的极简 **raw TCP** 隧道 + bore.pub |
| token | **必须** authtoken（免费版也要） | 不需要 | 公共实例不需要 |
| HTTPS | ✅ 自动 | ✅ 自动 | ❌ 只转发 TCP，无 TLS 终止（bore.pub 上是 `http://bore.pub:随机端口`） |
| 免费版限制（2026-02 起 ngrok 大幅收紧） | 会话最长 **2 小时**、**1 GB/月** 流量、随机域名（1 个自动分配 dev domain）、浏览器访客见**插页警告**（`ngrok-skip-browser-warning` 头可绕过） | 无硬限制，尽力而为；首访可能有确认插页 | 无硬限制，尽力而为 |
| 自定义域名 | 仅付费档（约 $5–20/月起，以官网现价为准） | ❌（除非自建服务器） | ❌（除非自建 + 自己做 TLS） |
| 稳定性 | 商业 SLA 仅付费档；免费档 2h 强制断 | 社区服务器,历史上时好时坏 | 公共实例个人维护，尽力而为 |

- **适合 Astro 静态站？** 三者都能转发,但 bore 无 HTTPS,给老板发 `http://bore.pub:34567` 观感差且浏览器告警,不推荐演示用。
- **Cloud Agent 兼容性**：localtunnel **已实测通过**（§2.3）。ngrok 需要先把 `NGROK_AUTHTOKEN` 放进 Cursor Secrets 才能在 VM 上用——对"临时给老板看"反而多一步，且 2 小时会话上限刚好卡在演示场景的边缘。
- **安全/合规**：ngrok authtoken 是账号级凭据，**只能放 Cursor Secrets**，泄露可被他人用你的配额开隧道；ngrok 域名因滥用常被企业防火墙拦截（老板在公司网络打不开的概率 > trycloudflare）。
- **推荐场景**：ngrok 免费版在 2026 年已无优势（2h/1GB/插页），除非团队已有付费账号；localtunnel 可作 trycloudflare 被墙时的**备胎**；bore 适合裸 TCP（数据库、SSH）调试，不适合网页演示。

### 3.3 Cloudflare Pages / Vercel / Netlify——静态边缘托管

**原理**：Git push 触发平台侧构建，产物分发到全球边缘节点（真 CDN），平台托管域名、证书、回滚、预览环境。**没有"你的服务器"这个单点**。

| | Cloudflare Pages | Vercel（Hobby） | Netlify（Starter/Free） |
|---|---|---|---|
| Astro 支持 | ✅ 官方适配 | ✅ 官方适配 | ✅ 官方适配 |
| 免费额度 | **不限带宽/请求**；500 次构建/月、单文件 ≤25MiB、≤2 万文件 | 100 GB/月流量；构建随附 | 300 credits/月（约 30GB 流量或 ~20 次部署的组合） |
| 自定义域名+HTTPS | ✅ 免费（每项目 100 个域名） | ✅ 免费 | ✅ 免费 |
| 商用限制 | 宽松 | **Hobby 明确禁止商业用途** | 免费档允许商用 |
| PR 预览 URL | ✅ 每次提交 | ✅ 每次 push | ✅ |
| 备注 | 新项目官方现在更推 Workers Static Assets，Pages 仍可用 | 超额即暂停到下周期 | credits 用尽即停 |

- **Cloud Agent 兼容性**：极好，而且是**换了个思路**——Agent/CI 只负责 `git push`，公网暴露由平台常驻边缘完成，与 Agent 会话生命周期**解耦**。部署 token（如 `CLOUDFLARE_API_TOKEN` 走 wrangler 直传时）放 Cursor Secrets 或 GitHub Actions Secrets;走 Git 集成则连 token 都不需要。
- **成本/稳定性**：$0；生产级 SLA 心智。对本站（含 ~几十 MB 的 TTS 音频与 3D 模型资产）,Cloudflare Pages 的"不限带宽"最从容;注意单文件 25MiB 上限（当前最大资产 KTX2/HDR/GLTF bin 均远小于此）。
- **安全/合规**：平台托管证书与 DDoS 防护;Vercel Hobby 的"非商用"条款要留意——本站是个人品牌站,现阶段合规,若未来挂咨询收费入口则需换 Netlify/Pages 或付费。
- **推荐场景**：**长期公网站点的正解**（与 GitHub Pages 二选一）。相对 GitHub Pages 的增量价值：不限带宽（GH Pages 100GB/月软限）、每 PR 预览 URL、更快的边缘网络。

### 3.4 自建 VPS + Caddy/Nginx——传统托管

**原理**：租一台有公网 IP 的 VPS（Hetzner ~€4/月、Vultr/DO ~$5–6/月），`rsync dist/` 上去，Caddy（自动 Let's Encrypt，两行配置）或 Nginx 提供服务。

- **适合 Astro 静态站？** 能跑,但对纯静态站是**用大炮打蚊子**：你要自己承担系统补丁、证书续期（Caddy 自动化了大半）、监控、防扫描、备份;而边缘平台把这些全包了且免费。
- **自定义域名 + HTTPS**：✅ 完全自主,Caddy 一行 `example.com { root * /srv/dist; file_server }` 即全自动 HTTPS。
- **Cloud Agent 兼容性**：CI/Agent 侧需要 SSH 私钥或 deploy token → 放 Cursor Secrets/GitHub Secrets;egress 走 22/443 无障碍。但 VM 内不需要也不该跑常驻服务,只做推送。
- **成本/稳定性**：~$50–80/年 + 你的运维时间;单点单区域,无 CDN（可再叠 Cloudflare,但那不如直接用 Pages）。
- **安全/合规**：攻击面最大（SSH 暴露、系统 CVE）;适合有合规要求必须自控基础设施、或站点将来要跑自有后端的情况。
- **推荐场景**：本项目**不推荐**。仅当未来需要自托管动态服务（自建 API、数据库）时再评估。

### 3.5 Cursor 云 VM 常驻 preview——是否可行？

**结论：不可行作为公网托管;可行且好用的是"演示窗口期"模式。**

- `.cursor/environment.json` 的 `ports: [{4321}]` 提供的是 **Cursor 侧带鉴权的端口预览**,面向登录 Cursor 的本人/团队,不是匿名公网 URL——老板没有 Cursor 账号就看不了。
- VM 生命周期绑定 Agent 运行：会话结束/闲置后 VM 停止,**任何常驻进程（preview、隧道）都会终止**。实测：kill 掉 cloudflared 后公网 URL 立即 530。没有"常驻"可言。
- 即便用隧道续命,也受限于会话时长;且把开发 VM 长期暴露公网违背其"临时工作区"的安全定位。
- **正确用法**（即本次实测所做的）：Agent 在会话内 build + preview + quick tunnel,把 URL 发给相关人,演示完会话结束自动回收。零残留、零凭据、零成本,30 分钟 Demo 的完美形态。CI（GitHub Actions）同理:job 内起隧道只活到 job 结束（GitHub 托管 runner 单 job 上限 6 小时）,PR 预览需求应交给 Pages/Vercel/Netlify 的原生预览部署。

---

## 4. 横向对比总表

| 方案 | 公网 URL 获取速度 | 自定义域名+HTTPS | 存活期 | token 需求 | 成本 | 临时 Demo | 长期生产 |
|------|------|------|------|------|------|------|------|
| Cloudflare quick tunnel（**实测✅**） | ~8 秒 | ❌ 随机域名 / ✅ HTTPS | 进程存活期（会话结束即死,实测✅） | **无** | $0 | ★★★★★ | ❌ |
| Cloudflare named tunnel | 分钟级（一次性配置） | ✅ / ✅ | 进程存活期 | token → Cursor Secrets | $0 | ★★★★ | ⚠️ 仅动态服务 |
| ngrok 免费版 | ~10 秒 | ❌付费 / ✅ | ≤2 小时/会话 | authtoken → Cursor Secrets | $0（限 1GB/月） | ★★★ | ❌ |
| localtunnel（**实测✅**） | ~20 秒 | ❌ / ✅ | 进程存活期 | 无 | $0 | ★★★（备胎） | ❌ |
| bore | ~5 秒 | ❌ / **❌ 无 HTTPS** | 进程存活期 | 无 | $0 | ★（仅 TCP 调试） | ❌ |
| GitHub Pages（已配好） | 首次 ~2 分钟/次 push | ✅ / ✅（Let's Encrypt） | 常驻 | 无（仓库内置） | $0（100GB/月软限） | ★★ | ★★★★ |
| Cloudflare Pages | 首次 ~5 分钟 | ✅ / ✅ | 常驻 | Git 集成可零 token | $0（不限带宽） | ★★★（PR 预览） | ★★★★★ |
| Vercel / Netlify | 首次 ~5 分钟 | ✅ / ✅ | 常驻 | 同上 | $0（100GB / 300 credits） | ★★★ | ★★★★（注意 Vercel 非商用条款） |
| VPS + Caddy/Nginx | 小时级 | ✅ / ✅ | 常驻 | SSH 密钥 → Secrets | ~$5/月 + 运维 | ★ | ★★★（运维自负） |
| Cursor VM 常驻 preview | — | ❌ | 会话期,且非公网 | — | 已含 | （见 quick tunnel 行） | ❌ |

---

## 5. 结合 mywebsite 的落地建议

### 5.1 两个 Demo 页面（本次公网实测对象）

| Demo | GitHub Pages 正式路径 | 本次隧道实测 |
|------|------|------|
| 3D 汽车配置器 | `https://rayw-lab.github.io/mywebsite/lab/car-configurator/` | ✅ 200 |
| TTS 多语种座舱 | `https://rayw-lab.github.io/mywebsite/lab/tts-cockpit/` | ✅ 200 |

### 5.2 推荐「三步走」

**第 ① 步：GitHub Pages 默认 URL（现在就能做）**
`cursor/full-site-delivery-1d6f` 合入 main → 仓库 Settings → Pages 选 "GitHub Actions" → `deploy.yml` 自动发布到 `https://rayw-lab.github.io/mywebsite/`。零成本、零新增凭据、HTTPS 自动。限制：100GB/月软性带宽限额、URL 带 `github.io` 与 `/mywebsite` 前缀、明确不允许商业交易类站点。

**第 ② 步：自定义域名 + HTTPS**
购入域名后：DNS 加 `CNAME www → rayw-lab.github.io`（apex 域用 4 条 A 记录 185.199.108–111.153）→ Pages 设置填入域名,等 Let's Encrypt 证书自动签发（通常 ≤1 小时）→ 勾选 **Enforce HTTPS**。同时改 `astro.config.mjs`：`site` 换正式域名并**删除 `base`**（配置文件注释已预留此项;注意全站内链因 `base` 变化需回归一遍,sitemap 会自动跟随 `site`）。

**第 ③ 步（可选）：Cloudflare 前置**
把 DNS 托管到 Cloudflare 免费版,记录开启代理（橙云）：获得边缘缓存、DDoS 防护、访问分析与重定向规则;SSL/TLS 模式设 **Full (strict)**（GH Pages 侧已有有效证书）。注意顺序：**先**在灰云（DNS only）状态让 GitHub 完成证书签发,**再**开橙云,否则 Pages 的域名验证可能失败。若第 ③ 步做完发现带宽/预览需求超出 GH Pages,可平滑切换到 Cloudflare Pages（同一 DNS 面板内操作,构建命令不变）。

### 5.3 「30 分钟给老板看 Demo」runbook（实测验证版）

```bash
pnpm install && pnpm build
pnpm preview --host 0.0.0.0 --port 4321 --allowed-hosts .trycloudflare.com &
curl -fsSL -o /tmp/cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x /tmp/cloudflared
/tmp/cloudflared tunnel --url http://localhost:4321
# 日志中出现 https://<随机词>.trycloudflare.com 后,
# 发送 https://<随机词>.trycloudflare.com/mywebsite/lab/car-configurator/ 给老板
# 演示结束：Ctrl-C 杀掉 cloudflared,URL 即刻失效
```

要点：URL 别忘了带 `/mywebsite` base 前缀;演示前自己先点开一遍;不要在演示窗口外让隧道空挂。

---

## 6. 安全与 Secrets 管理规范

1. **零 token 优先**：quick tunnel / localtunnel 不产生任何凭据,是临时演示的默认选择。
2. **必须用 token 时**（ngrok `NGROK_AUTHTOKEN`、cloudflared 命名隧道 `TUNNEL_TOKEN`、部署用 `CLOUDFLARE_API_TOKEN`、VPS SSH 私钥）：一律存 **Cursor Dashboard → Cloud Agents → Secrets**（或 GitHub Actions Secrets）,以环境变量注入;**绝不写入仓库、绝不打进镜像、绝不出现在文档示例里**。本文档及本次实测未产生、未提交任何凭据。
3. **隧道即公网**：URL 一旦发出,任何持有者都能访问。只隧道**构建产物**（preview/静态服务器）,不要隧道含热更新与源码映射的 dev server;需要限制访客时用 named tunnel + Cloudflare Access（邮箱 OTP 白名单）。
4. **allowedHosts 白名单**：只加必要后缀（`.trycloudflare.com`）,不要用"允许所有主机名"的懒人选项,避免 DNS rebinding 面扩大。
5. **合规**：quick tunnel 受 Cloudflare Online Services ToS 约束且明示不供生产;GitHub Pages 禁止商业交易/SaaS 类站点;Vercel Hobby 禁止商用——个人品牌站现阶段均合规,商业化前需复核。

---

## 7. 参考资料

- Cloudflare Tunnel 文档（quick tunnel 无 uptime 保证、named tunnel 生产指引）：developers.cloudflare.com/cloudflare-one/connections/connect-apps
- cloudflared 启动日志原文（本次实测,§2.1 摘录）
- ngrok 免费版限制（2026-02 收紧:2h 会话/1GB 月流量/插页）：ngrok.com/docs/pricing-limits/free-plan-limits
- Cloudflare Pages 限额（500 构建/月、不限带宽、100 自定义域名/项目、25MiB 单文件）：developers.cloudflare.com/pages/platform/limits
- Vercel Hobby 计划与 Fair Use（100GB/月、非商用）：vercel.com/docs/plans/hobby
- GitHub Pages 使用限制（1GB 站点、100GB/月软限、自定义域名 + Let's Encrypt）：docs.github.com/pages/getting-started-with-github-pages/github-pages-limits
- bore（raw TCP、无 TLS 终止、bore.pub 公共实例）：github.com/ekzhang/bore
- localtunnel：github.com/localtunnel/localtunnel
