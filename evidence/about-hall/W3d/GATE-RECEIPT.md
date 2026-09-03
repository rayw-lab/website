# W3d 机器门回执

- **时间（UTC）**: 2026-09-03T06:10:43Z
- **工作树**: `/Users/wanglei/studio-data-root/worktrees/website-about-hall`
- **待验改动**: W3d（Curator / StationRail / curator.ts + world slug 接线）；W7a（about 问题卡摘要、Crystal 文案）；`about-hall-gate.mjs` 总载荷 2.5MB→6MB（ADR-3）
- **裁决**: **全门 PASS**（0 FAIL / 0 WARN）

---

## 1. `pnpm exec astro check`

```
Result (184 files):
- 0 errors
- 0 warnings
- 59 hints
```

**门**: PASS

---

## 2. `pnpm build`

构建成功，20 页静态产物写入 `dist/`（含 `/world/about-pavilion/`）。

**门**: PASS

---

## 3. `node scripts/about-hall-gate.mjs`

写出 `evidence/about-hall/GATE.json`（`ok: true`，`generatedAt: 2026-09-03T06:09:18.083Z`）。

| ID | STATUS | DETAIL |
|----|--------|--------|
| G-Hall-1 | **PASS** | `dist/world/about-pavilion/index.html` 存在；sitemap `sitemap-0.xml`；未知 slug 无产物（built=about-pavilion） |
| G-Hall-2 | **PASS** | 扫描 2 个文件（HTML + 静态 JS），零 `lab/world` / `initAllLabFacades` / `mountWorld` |
| G-Hall-3 | **PASS** | 零 rapier / `@dimforge` / `.wasm` |
| G-Hall-4 | **PASS** | 零 `three/webgpu` / `WebGPURenderer` / `MeshStandardNodeMaterial`（初始静态引用） |
| G-Hall-5 | **PASS** | 零 `<script>` / preload 指向 `public/models/**` 或 hero-robot / concept-garage / autodrive |
| G-Hall-6 | **PASS** | 额外 JS gzip **930B** ≤ 20KB 目标（cap 50KB，Hall-S 初始引导脚本） |
| G-Hall-7 | **PASS** | 1 条 hallPath 均对应 dist 页 |
| G-Hall-8 | **PASS** | 7 条媒体对账通过；总载荷 **286,284B** ≤ **6.0MB** |
| G-Hall-9 | **PASS** | 9 个 `data-scene` 均有 `data-bind`，URL 在 dist 可解析 |

**引擎针（G-Hall-2..5）**: 初始扫描文件 = `world/about-pavilion/index.html` + `_astro/Curator.astro_astro_type_script_index_0_lang.DIP8kSzK.js`（930B gzip 引导脚本，动态 `import()` 拉 three chunk）。

**误报**: 无。门脚本未对 Draco `.wasm` 或 three 懒加载 chunk 一刀切误报。

---

## 4. Hall-R 懒加载 chunk gzip（ADR-3 预算 ≤180KB）

在 `dist/_astro/` 检索含 `WebGLRenderer` 的 chunk：

| Chunk | gzip -9 字节 | ≤180KB |
|-------|-------------|--------|
| `curator.Dov0583Q.js` | 84,339 | PASS |
| `three.core.DuBpFJ6F.js` | 64,534 | PASS |
| `three.webgpu.Dv1CRsMj.js` | **176,126** | **PASS**（预算内，余量 4,194B） |

最大单 chunk = `three.webgpu.Dv1CRsMj.js` **176,126B** ≤ **184,320B**（180KB）。

命令：

```bash
for f in dist/_astro/*.js; do
  grep -q WebGLRenderer "$f" && echo "$f $(gzip -9 -c "$f" | wc -c)"
done
```

---

## 5. `e2e/about-hall.spec.ts`（preview :4631）

Preview PID 写入 `~/.codex/state/about-hall/preview-4631.pid`（8670），结束后已杀进程释放 4631。

```bash
python3 -c "import socket;s=socket.socket();s.bind(('127.0.0.1',4631))"
pnpm preview --port 4631 --host 127.0.0.1   # Popen start_new_session=True
env -u CI E2E_PORT=4631 pnpm exec playwright test e2e/about-hall.spec.ts --workers=1 --retries=0 --reporter=list
```

**结果**: **7/7 passed**（3.2s）

| # | 用例 | 结果 |
|---|------|------|
| 1 | 无 query：200，H1 含「架桥」，到达条 hidden | PASS |
| 2 | `?from=city&poi=about-pavilion`：到达条可见 | PASS |
| 3 | 有卡 world-arrival-v1 poi 匹配 | PASS |
| 4 | `?from=city&poi=not-a-building`：到达条 hidden | PASS |
| 5 | prefers-reduced-motion：无运行中 CSS animation | PASS |
| 6 | 禁用 JS：首屏 H1 与 poster `<img>` 可见 | PASS |
| 7 | 未知 slug 404 | PASS |

---

## 6. LHCI `/website/about/`

基线：**100 / 96 / 100 / 100**（Perf / A11y / BP / SEO）。

```bash
node node_modules/.pnpm/lighthouse@12.6.1/node_modules/lighthouse/cli/index.js \
  http://127.0.0.1:4631/website/about/ \
  --output=json --output-path=/tmp/lhci-about.json \
  --chrome-flags='--headless --no-sandbox' \
  --only-categories=performance,accessibility,best-practices,seo --quiet
```

> 注：`npx lighthouse` 本机 shim 不可用；改用仓内 `lighthouse@12.6.1` CLI（与 W4 回执一致）。

| 分类 | 得分 | 基线 | 判定 |
|------|------|------|------|
| Performance | **100** | 100 | 不降 |
| Accessibility | **100** | 96 | 不降（+4） |
| Best Practices | **100** | 100 | 不降 |
| SEO | **100** | 100 | 不降 |

Performance 非 null（本机未触发 SwiftShader null 路径）。

---

## 7. 需指挥官决断项

无。

---

## 命令摘要（顺序执行）

```bash
cd /Users/wanglei/studio-data-root/worktrees/website-about-hall
pnpm exec astro check          # 0 errors
pnpm build                     # OK
node scripts/about-hall-gate.mjs
# chunk gzip 见 §4
pnpm preview --port 4631 --host 127.0.0.1 &
env -u CI E2E_PORT=4631 pnpm exec playwright test e2e/about-hall.spec.ts --workers=1 --retries=0 --reporter=list
node node_modules/.pnpm/lighthouse@12.6.1/node_modules/lighthouse/cli/index.js http://127.0.0.1:4631/website/about/ ...
# kill preview pid → 4631 释放
```
