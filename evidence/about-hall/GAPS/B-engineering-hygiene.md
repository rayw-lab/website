# About Hall 工程卫生审计（B-engineering-hygiene）

- **审计时间**：2026-09-03 17:00 CST
- **工作目录**：`/Users/wanglei/studio-data-root/worktrees/website-about-hall`
- **隔离栈**：`pnpm preview --port 4640 --host 127.0.0.1`（pid 98976→99002，审计结束已按 pid 清理，4640 已释放）
- **write root**：本文件 + `evidence/about-hall/GAPS/*`（截图/日志/LH JSON）

---

## 1. 残留进程 / 端口

### 命令

```bash
pgrep -fl 'astro preview|pnpm preview|playwright|http.server'
lsof -nP -iTCP -sTCP:LISTEN | rg '46[0-9][0-9]|4321'
```

### 输出摘录

```
98276 /bin/zsh -c cd ... && pnpm exec astro check ... node -e "(playwright reduced-motion probe on 4638)"
98413 node -e (playwright chromium launch)
98415–98419 chrome-headless-shell (playwright child processes)
---
Python    29475  TCP 127.0.0.1:4638 (LISTEN)
node      55462  TCP 127.0.0.1:4630 (LISTEN)
```

（审计期间另起本席 preview：**node 99002 @ 4640**，已结束释放）

### 判定

**ISSUE-P2** — 4638/4630 被其他 worker 占用（playwright 探测 + Python preview）；**4321 未被占用**。本席未 kill 非自有进程。

---

## 2. 工作区脏项

### 命令

```bash
git status --short
git diff --name-only docs/spec/assets/
git status --short --untracked-files=all | rg -i '\.(mp4|png)$|test-results|\.sh$|\.py$'
```

### 输出摘录（审计开始时快照；结束时 worktree 已 clean）

```
 M e2e/about-hall.spec.ts
 M evidence/about-hall/GATE.json
 M evidence/about-hall/QE/qe-hold-q-limit.png
 M evidence/about-hall/QE/qe-release-recentered.png
 M src/components/city/HallChrome.astro
 ...（共 14 个已跟踪改动）
?? evidence/about-hall/VIS-1/（32 张 PNG）
?? evidence/about-hall/W1h/（5 张 PNG）
?? public/media/about-hall/hero-s0-720p.mp4
?? public/media/about-hall/transition-s6-720p.mp4
?? public/media/about-hall/transition-s6-poster.webp
?? src/components/city/halls/about/Transition.astro
```

`docs/spec/assets/**/*.png`：**无 diff / 无改写**（e2e 基线资产未被动）。

可疑 untracked：

| 路径 | 类型 | 备注 |
|------|------|------|
| `public/media/about-hall/*.mp4` | 原盘视频 | G-Hall-8 已登记，可能应入库；体积需指挥官裁定 |
| `evidence/about-hall/VIS-1/*.png` | 大图证据 | 32 张视觉对比，不宜误 commit 到 src |
| `evidence/about-hall/W1h/*.png` | 大图证据 | 5 张 W1h 取证 |
| `test-results/` | — | **未发现** |

### 判定

**ISSUE-P2** — 多 worker 并行脏工作区 + 未跟踪 `.mp4`/大量证据 PNG；`docs/spec/assets` 安全。**不还原**（照指令交指挥官）。

---

## 3. 密钥扫描

### 命令

```bash
rg -n -i 'api_key|access_token|sk-[a-z0-9]{8}|ark-[a-z0-9]{8}|Bearer ' \
  --glob '!node_modules' --glob '!dist' --glob '!pnpm-lock.yaml' .
```

### 输出摘录

```
./docs/local-cmd/ABOUT-HALL-CHARTER-2026-09-02.md:80:  - `rg -i 'api_key|access_token|sk-|ark-'` = 0。
./docs/local-cmd/ABOUT-HALL-CHARTER-2026-09-02.md:150: ...同上口径说明...
exit:0
```

（排除 lockfile 后 **0 条真实密钥**；pnpm-lock 中 `micromark-extension-*` 为误匹配已排除。）

### 判定

**OK**

---

## 4. 构建告警

### 命令

```bash
pnpm build 2>&1 | tee evidence/about-hall/GAPS/build.log
pnpm exec astro check
```

### 输出摘录

**build.log**（WARN 共 **2 处**）：

```
[WARN] The "pnpm" field in package.json is no longer read by pnpm...
16:59:37 [WARN] [vite] [plugin builtin:vite-reporter]
(!) Some chunks are larger than 500 kB after minification.
16:59:38 [build] Complete!
```

**astro check** 汇总行：

```
Result (188 files):
- 0 errors
- 0 warnings
- 59 hints
```

（逐文件 ts(6385) `z` deprecated、astro(4000) inline script 等待为 **hints**，非 blocking warnings。）

### 判定

**ISSUE-P2** — 构建成功；Vite chunk >500 kB 告警 + pnpm 字段弃用提示。astro check **0 error**。

---

## 5. 既有门

### 命令

```bash
node scripts/about-hall-gate.mjs
node scripts/audit-budget.mjs
node scripts/check-links.mjs
```

### 输出摘录

**about-hall-gate.mjs**

```
G-Hall-1..9 全部 PASS
FAIL 0 · WARN 0 · 写出 evidence/about-hall/GATE.json
✔ G-Hall-1..9 无 FAIL
```

**audit-budget.mjs**

```
✅ 全部阻断级门禁通过。
```

**check-links.mjs**

```
✔ 内部链接与锚点全部有效
扫描 20 个 HTML 页面，390 条内部引用
```

### 判定

**OK**

---

## 6. 隔离栈实测（4640）

### 6a. Lighthouse

CLI：`node_modules/.pnpm/lighthouse@12.6.1/.../cli/index.js`（`pnpm exec lighthouse` 未在 `.bin` 登记，走 @lhci 传递依赖）

| URL | Perf | A11y | Best Practices | SEO |
|-----|------|------|----------------|-----|
| `/website/` | 100 | 100 | 100 | 100 |
| `/website/about/` | 100 | 100 | 100 | 100 |
| `/website/world/about-pavilion/` | **99** | 100 | 100 | 100 |

原始 JSON：`lh-website.json`、`lh-website-about.json`、`lh-website-world-about-pavilion.json`

### 6b. Playwright 隔离脚本（`/tmp/about-hall-hygiene-audit.mjs`）

**Console error/warning**：全部视口 **0 条**

**失败请求 (4xx/5xx)**：全部 **0 条**

**`document.getAnimations().length`**

| 页面 | 视口 | 正常 | reduced-motion |
|------|------|------|----------------|
| 展厅 | 1440×900 | **1** | **0** ✓ |
| 展厅 | 375×812 | 0 | 0 |
| `/about/` | 1440 / 375 | **3** | （未单测） |

**媒体**

- 展厅桌面：7 `<img>` 无 broken；2 `<video>` 有 src、networkState=1
- 展厅移动：video `src=""` networkState=3（**poster-only 策略**，与 W1h 一致，非 404）
- station-s3/s4/s5 `naturalWidth=0`：懒加载未进视口，**非 404**
- `data-scene` 数量：**9**（与 G-Hall-9 一致）
- `[[` 文本泄漏：**false**

**截图**（均已落盘）

- `hall-desktop-1440.png` / `hall-desktop-1440-rm.png`
- `hall-mobile-375.png` / `hall-mobile-375-rm.png`
- `about-desktop-1440.png` / `about-mobile-375.png`
- `city-poi-about-pavilion-ready.png`（`data-state="ready"` readyCount=1）
- `hall-keyboard-focus.png`

**键盘 Tab×15（展厅 1440）焦点序列**

| # | 元素 | 焦点环 |
|---|------|--------|
| 1 | `a.skip-link` 跳到主内容 | outline |
| 2–7 | 顶栏 brand + Work/Insights/AI Lab/About/Contact | outline |
| 8 | `button.theme-toggle` | outline |
| 9–14 | `button.hall-rail-stop` 01–06 地轨 | outline |
| 15 | `a` s4 佐证链接（lab/tts-cockpit） | outline |

地轨节点与顶栏 **均可 Tab 到达，焦点环可见（outline）**；15 次 Tab 未进入 Hero 正文区 / S1–S3 站内 CTA（可能需滚动或更多 Tab）。

结构化 JSON：`playwright-audit.json` / `playwright-audit.log`

### 判定

| 子项 | 判定 |
|------|------|
| Lighthouse 展厅 a11y/bp | **OK**（99 perf 可接受） |
| Console / 网络 | **OK** |
| reduced-motion 展厅动画 | **OK**（1→0） |
| `/about/` animCount=3 | **ISSUE-P2**（独立页仍有 3 路 animation，未验证 RM 态） |
| 移动 video 空 src | **OK**（设计行为） |
| 键盘地轨 | **OK**（P2：正文深链需更多 Tab） |

---

## 7. e2e 分母

### 命令

```bash
pnpm exec playwright test --list 2>/dev/null | tail -3
```

### 输出摘录

```
Total: 100 tests in 21 files
```

对照上次 **93 / 20** → **+7 tests / +1 file**。

新增文件 `e2e/about-hall.spec.ts` 含 **11** 例：

1. 无 query 到达条 hidden
2. `?from=city&poi=about-pavilion` 到达条
3. world-arrival-v1 有卡匹配
4. 无效 poi hidden
5. AH-W1h Hero scrub（currentTime > 1s）
6. AH-W1h S6 scroll-scrub（3–8s）
7. reduced-motion video/animation
8. reduced-motion CSS animation
9. 无 JS 降级
10. 未知 slug 404
11. AH-T1b 驾驶卡短句

另有 `cyber-city-poi-arrival.spec.ts` 增 **AH-T1b hold overlay** 1 例。净 +7 暗示其他文件约 **−5** 例合并/删除（建议指挥官 `git log -p e2e/` 对拍）。

### 判定

**ISSUE-P2** — 分母膨胀在预期内（About Hall 专项），需确认合并后 CI 墙钟预算。

---

## ISSUE 汇总

| ID | 级别 | 项 | 说明 |
|----|------|-----|------|
| B-01 | P2 | 端口占用 | 4638/4630 他席 preview/playwright；4321 空闲 |
| B-02 | P2 | 工作区脏 | 14+ 跟踪改动、VIS-1/W1h 证据 PNG、2× untracked mp4 |
| B-03 | P2 | 构建 WARN | Vite chunk >500 kB + pnpm 字段弃用（2 处） |
| B-04 | P2 | astro hints | 59 hints（z deprecated 等），0 error |
| B-05 | P2 | `/about/` 动画 | getAnimations=3，RM 态未在本审计覆盖 |
| B-06 | P2 | e2e 分母 | 100/21 vs 93/20；+7 净增需 CI 排期 |
| — | — | 密钥 / 门 / LH a11y / 展厅 RM | 全部 OK |

---

## Verdict

**CONDITIONAL PASS（无 P0/P1）** — 机器门 G-Hall / audit-budget / check-links 全绿，密钥扫描净零，隔离栈 Lighthouse 展厅 **a11y=100 bp=100**，Playwright 零 console/网络错误，展厅 reduced-motion 动画正确归零。遗留均为 **P2 工程卫生**：并行 worktree 脏状态、他席端口、构建 chunk 告警、`/about/` 动画 RM 未抽检、e2e 分母 +7 需排 CI。建议指挥官收口 untracked mp4/证据目录入库策略后合并。
