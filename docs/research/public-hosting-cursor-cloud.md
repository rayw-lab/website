# 调研：Cursor Cloud Agent 云桌面/VM 能否把本地 dev server 暴露到公网

- **调研日期**：2026-08-24
- **调研方式**：Cursor 官方文档（cloud-agent 全部子页 + 官方 environment.json schema）+ 在当前 Cloud Agent VM 内实测
- **实测环境**：本仓库的 Cloud Agent VM（Ubuntu，node 22 / pnpm 10，出口集群 `us6`，egress 策略为全放行）
- **背景**：分支 `cursor/full-site-delivery-1d6f` 上有 Astro 站点（base `/mywebsite`，dev/preview 端口 4321）。用户希望「利用云电脑搭载公开域名让公网访问」。

---

## 一、结论摘要（30 秒版）

**Cursor Cloud Agent 的云桌面/VM 不能当公网服务器用。** 原因有三条，每条单独都是否决项：

1. **没有入站通路（ingress）**。VM 只有私网 IP（实测 `172.30.0.2`），出口走共享 NAT（实测出口 IP `3.20.157.220`，属于官方公布的共享出口段）。即使服务监听 `0.0.0.0`，公网也连不进来（实测：三个海外节点 TCP 探测全部超时）。Cursor 没有提供任何端口映射、公网 URL、preview 链接之类的原生入站机制。
2. **`environment.json` 的 `ports` 字段不生成公网 URL**。官方 schema 原文是 *"Ports to expose from the container. Similar to devcontainers port forwarding"*——它是给 Cursor 客户端/agent 会话用的端口声明，类比 devcontainer 的端口转发，官方文档没有任何一处说它产生可公开访问的地址。
3. **VM 是会话级的，不常驻**。官方安全文档明确写了运行生命周期第 6 步：*"Recycle. VM runtime resources are hibernated and then deleted on lifecycle timers once the run is idle."*（agent 空闲后 VM 先休眠、再按计时器删除；快照 90 天不活跃自动删除）。即便用隧道打洞把服务临时暴露出去，**URL 的寿命 = 这次 agent 会话的寿命**。

**能做到什么**：在 agent 会话进行期间，用 `cloudflared` quick tunnel 可以把 4321 端口临时暴露成一个随机 `trycloudflare.com` URL（本次已实测打通，外部访问返回 200）。这只适合「几分钟的临时演示」，不是托管方案，且属于未文档化用法。

**正确路径**：静态站点走 GitHub Pages（仓库 `.github/workflows/deploy.yml` 已就绪，推 `main` 即发布到 `https://rayw-lab.github.io/mywebsite/`），要自定义域名再叠加 Pages 自定义域或 Cloudflare Pages。Cloud Agent 的角色是**开发、构建、推送**，公网服务交给托管平台。

---

## 二、Cursor 原生能力表

| 能力 | 状态 | 依据 |
| --- | --- | --- |
| `ports` 字段生成公网 URL | **不支持** | 官方 schema：仅 "Similar to devcontainers port forwarding"；全部 cloud-agent 文档无 preview URL / public URL 机制 |
| VM 固定公网 IP | **不支持** | 实测仅私网 IP；出口为共享 NAT 段（官方 `ips.json` 公布并声明「IP 会随扩容变动，不建议依赖」） |
| 公网入站访问（ingress） | **不支持** | 文档只讲 egress（出站）管控，无任何 ingress 功能；实测外部 TCP 探测超时 |
| 出站访问（egress） | 支持 | 默认全放行；可配置三种模式（全放行 / 默认+白名单 / 仅白名单），团队可锁定 |
| VM 常驻运行 | **不支持** | 安全文档：run 空闲 → 休眠 → 按计时器删除；Build 仅保存磁盘状态，「运行中的进程不会延续到下一次 agent 运行」 |
| 远程桌面 / Computer Use | 支持（仅限本人/团队） | 通过 Cursor 认证会话「接管 agent 桌面」，是登录用户专属通道，**没有可分享的公网链接** |
| Artifacts（截图/视频）公网 URL | 部分支持 | 上传到 S3 的静态文件有「长且不可猜测」的公开 URL（为配合 GitHub 图片代理），但那是静态产物，不是动态服务 |
| Tailscale | 支持（方向相反） | 官方章节场景是 **VM 出站接入你的私网**（userspace 模式）；明确写了 "Userspace networking does not let the VM appear as a tailnet exit node" |
| Cloudflare Tunnel（官方文档场景） | 支持（方向相反） | 官方章节是 **connector 装在你的私网里**，让 VM 能访问你的内网服务——与「把 VM 服务暴露公网」正好相反 |
| Cloudflare quick tunnel 反向暴露 | **未文档化**（实测可用） | 官方从未提及此用法；本次实测打通，但受 egress 策略与 VM 生命周期约束 |

### 关键文档出处

- [Cloud Environment Setup](https://cursor.com/docs/cloud-agent/setup)：`install`/`start`/`terminals` 语义、Tailscale 与 Cloudflare Tunnel 章节、资源限制
- [环境 schema（官方）](https://www.cursor.com/schemas/environment.schema.json)：`ports` 字段定义原文
- [Secrets & Network](https://cursor.com/docs/cloud-agent/security-network)：egress 三模式、出口 IP 段 `ips.json`、Private network access
- [Security overview](https://cursor.com/docs/cloud-agent/security)：run 六阶段生命周期（含 Recycle）、Firecracker microVM 隔离、数据保留表
- [Capabilities](https://cursor.com/docs/cloud-agent/capabilities)：Computer use、Remote desktop control、Artifacts 公开 URL 说明
- [Builds](https://cursor.com/docs/cloud-agent/builds)：Build 只保留磁盘状态、进程不延续

### 重点辨析：文档里的 Tunnel/Tailscale 是「进」不是「出」

这是最容易误读的一点。官方 setup 文档的 *Running Tailscale* 和 *Running Cloudflare Tunnel* 两章，解决的都是：**Cloud Agent VM（在 Cursor 的 AWS 里）如何访问你公司/家里私网的服务**——connector/tailscaled 建立的是 VM 向外的认证通道，让 agent 能连到你的内网数据库或 API。方向是 `VM → 你的私网`。

用户想要的是反方向：`公网用户 → VM 上的 dev server`。这个方向官方**零文档、零功能**。quick tunnel 之所以实测能通，是因为 `cloudflared` 自己从 VM 内向 Cloudflare 边缘发起出站连接（只用 egress），公网流量再沿这条出站连接「倒灌」进来——绕过了没有 ingress 的限制，但也因此完全不受 Cursor 支持与保障。

### 会话生命周期与「无固定 IP」细节

- **生命周期**：官方数据表写明 Runtime workspace（活跃 VM）"Recycled automatically after the run goes idle; the timer refreshes when you send follow-up prompts"。VM 快照保留至多 90 天不活跃。也就是说：agent 停止对话后，VM 上所有进程（dev server、隧道）终止；下次唤醒是从磁盘快照恢复，进程不会自动重启（除非写进 `start`/`terminals`，但那也只在 agent 会话期间存活）。
- **无固定 IP**：`curl https://cursor.com/docs/ips.json` 公布的是**出站** NAT 段，按集群分组，官方明言会不定期变更、不建议作为安全依据。这些 IP 是很多 VM 共享的出口，不是任何一台 VM 的入站地址。
- **Computer Use / 浏览器预览**：agent 的桌面和浏览器完全在 VM 内部；用户侧的「Remote desktop control」走 Cursor 认证的 Web 会话。没有临时公网链接可以分享给第三方。唯一带公网 URL 的产物是上传到 `cloud-agent-artifacts.s3.us-east-1.amazonaws.com` 的静态截图/视频。

---

## 三、实测记录（2026-08-24，当前 VM 内）

> 测试对象：`cursor/full-site-delivery-1d6f` 分支的 Astro 站（`pnpm build` + `astro preview`，base `/mywebsite`）。测试完成后所有服务器与隧道已关闭，文中临时 URL 已失效。

### 3.1 网络形态

| 项目 | 命令 | 结果 |
| --- | --- | --- |
| VM 本机地址 | `hostname -I` | `172.30.0.2 172.17.0.1`（全部私网，无公网接口） |
| 出口公网 IP | `curl https://api.ipify.org` | `3.20.157.220`，命中官方 `ips.json` 的 `us6` 集群段（共享 NAT 出口） |
| egress 是否受限 | curl `example.com` / `ngrok.com`、从 GitHub 下载二进制 | 全部成功 → 当前环境为「全放行」模式 |

### 3.2 本地 dev server（正常）

```text
pnpm install --frozen-lockfile   # 1.8s（Build 缓存已温）
pnpm build                       # 3 pages, 641ms
astro preview --host 0.0.0.0 --port 4321
curl http://localhost:4321/mywebsite/   → HTTP 200（返回站点首页 HTML）
```

### 3.3 公网直连（失败——证明无 ingress）

服务监听 `0.0.0.0:4321` / `0.0.0.0:4322`（`ss -tlnp` 确认），用 check-host.net 的外部节点对 `3.20.157.220:4322` 做 TCP 探测：

```text
de2.node.check-host.net  → Connection timed out
il1.node.check-host.net  → Connection timed out
ro1.node.check-host.net  → Connection timed out
```

德国、以色列、罗马尼亚三个节点全部超时。VM 监听任何端口都不影响结果——入站流量根本到不了这台机器。

### 3.4 Cloudflare quick tunnel（成功——但仅会话级）

```text
curl -L -o cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
./cloudflared tunnel --url http://localhost:4322 --no-autoupdate
# 分配随机 URL：https://oils-lenders-excellence-starsmerchant.trycloudflare.com
```

验证（两条独立路径）：

1. VM 内 curl 该公网 URL（流量出 VM → Cloudflare 边缘 → 隧道回 VM）：`HTTP 200, 0.39s`
2. **VM 外**的独立抓取服务访问该 URL：返回站点真实首页内容（标题「王磊｜汽车智能座舱与 AI 解决方案经理」）→ 证明公网任意位置可访问

**踩坑记录**：第一次把隧道直接指向 `astro preview`（Vite）时被拦截，返回 403 "Blocked request. This host … is not allowed"——Vite 5+ 的 host 校验会拒绝陌生 Host 头。需在 `astro.config.mjs` 的 `vite.preview.allowedHosts` 中放行隧道域名，或改用无 host 校验的静态服务器（本次实测用后者）。

**限制**：quick tunnel 无账号、无自定义域名、URL 每次随机、Cloudflare 不承诺可用性；进程一停（或 agent 会话结束、VM 休眠）URL 即死。要固定域名需 Named Tunnel（Cloudflare 账号 + token），但仍然逃不过 VM 生命周期。

### 3.5 ngrok（未完整测试）

`ngrok.com` egress 可达、二进制可下载，但 ngrok 强制要求账号 authtoken 才能建隧道，本环境无该凭据，未测。原理与 quick tunnel 相同（纯出站反向隧道），预期可用性一致，且免费版同样是随机域名 + 会话级。

---

## 四、为何不可行（作为公网托管方案）与替代路径

### 不可行的根本原因

1. **生命周期错配**：托管要求 7×24 常驻；Cloud Agent VM 在会话空闲后休眠/回收，进程全部终止。没有任何配置能让它常驻。
2. **无入站、无固定地址**：没有公网 IP、没有端口映射、没有官方 preview URL；出口 IP 共享且会变。
3. **产品定位**：Cursor 把 VM 定位为「一次 run 的开发环境」，计费按 agent 用量，快照按不活跃时间清理。把它当服务器既不受支持，也随时可能因基础设施调整而失效。

### 替代路径（按当前仓库现状）

| 场景 | 方案 | 现状 |
| --- | --- | --- |
| 静态站上线（本仓库） | **GitHub Pages**：推 `main` 触发已有的 `.github/workflows/deploy.yml`，发布到 `https://rayw-lab.github.io/mywebsite/` | 工作流已在 `cursor/full-site-delivery-1d6f` 分支就绪，合并即用，零成本 |
| 自定义域名 | GitHub Pages 自定义域（CNAME + DNS），或迁到 **Cloudflare Pages** / **Vercel**（同样免费档、自动 HTTPS） | 需要用户持有域名并配置 DNS |
| 将来需要动态后端 | Cloudflare Workers / Pages Functions、Vercel Serverless、Fly.io 等 | 与静态托管平滑衔接 |
| 给评审者看几分钟的临时 demo | agent 会话内 quick tunnel（本文 3.4 的做法），或直接用 Cloud Agent 自带的截图/视频 artifacts | 会话结束即失效，勿当正式链接分发 |

Cloud Agent 在这条链路里的正确角色：写代码 → 本 VM 内构建与验证（curl/Computer Use）→ push → 托管平台自动部署。「云电脑」负责生产内容,「公开域名」由托管平台提供。

---

## 五、开放问题

1. **`ports` 字段的用户侧呈现**：schema 只说类比 devcontainer 转发,官方文档没有描述它在 Cursor Web/Desktop UI 中是否出现「转发端口」入口、供本人访问。本次以子代理身份无法观察用户侧 UI,待用户在 agent 页面自行确认(即便存在,也是认证用户专属,非公网 URL)。
2. **egress 白名单模式下的隧道可用性**：当前环境为全放行;若切到「Default + allowlist」或「Allowlist only」,`trycloudflare.com`、`ngrok.com` 等域名大概率被阻断,quick tunnel 用法失效。
3. **Tailscale Funnel**：理论上可从 VM 内以 userspace 模式把服务发布到 tailnet 乃至 Funnel 公网(仍是纯出站原理),未实测(需 Tailscale 账号);同样受 VM 生命周期约束,且官方仅承诺 userspace 的「访问私网」方向。
4. **官方态度**：反向暴露服务属于「未禁止、未支持」的灰色地带,Cursor 可能随时通过 egress 策略或基础设施变更使其失效,不宜依赖。
5. **Long-running agent 的影响**：文档提到 multi-repo 环境「暂不支持 long-running」,暗示单 repo 存在 long-running 模式;它能把 VM 存活期拉长多少、能否改变「会话级」结论,官方未给出细节。
