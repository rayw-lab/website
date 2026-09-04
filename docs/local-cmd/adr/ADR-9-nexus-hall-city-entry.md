# ADR-9 · 墨迹展厅进城：agent-nexus 的 hallPath 与纸色主题例外

- 日期：2026-09-04
- 状态：ACCEPTED
- 上游：ADR-2（展厅路由契约）、ADR-6/7/8（本厅三决策）
- 触发：NX-W5 接线（展厅此前只活在 `/world-spike/`）

## 背景与为什么需要这一条

ADR-2 §「本 ADR 只给 `about-pavilion` 加 `hallPath`。其它楼的 B 名单不在本包」——
它把自己的作用域限定在一栋楼。本次给 `agent-nexus` 加 `hallPath` 是**对该契约的扩用**，
不是违反，但必须留一条记录，否则下一个人读 ADR-2 会以为城里只有一栋楼能进厅。

## 决策

1. **沿用 ADR-2 的进楼契约，不发明第二种**：
   `Building.hallPath?: string`，尾斜杠齐全；`deepLink` / `deepLinkStatus` 语义不变。
   `agent-nexus` 保持 `deepLink: "/ai-lab/"`、`deepLinkStatus: "fallback"`（纸面权威 URL 不被展厅污染），
   新增 `hallPath: "/world/agent-nexus/"`。城里按 E 走 `hallPath ?? deepLink`（`Areas.ts:187`）。
   `cyber-city-buildings.json` 的 `schemaVersion` 不升版（加法）。

2. **每厅头部文案显式登记，fail-closed**：
   `world/[slug].astro` 用 `HALL_COPY` 表按 slug 取 title/description，
   查不到直接 `throw`。**不给静默兜底**——兜底的后果是两个厅共用一个 `<title>`，
   SEO 与面包屑同时错且零报错。

3. **纸色厅作为主题例外写在 `hall.css`，不改 Layout 签名**：
   全站展厅是暗底 `html:has([data-hall])`；本厅覆盖为纸色 token。
   🔴 选择器必须写成 `html:has([data-hall='agent-nexus']):has([data-hall])`：
   带值与不带值的属性选择器**特异度相同**（同为 0,1,0），只靠「写在后面」取胜，
   任何人往下追加一条通用规则就静默翻车。

4. **海报仍从独立 spike 端点截，不改指正式路由**：
   正式页两块 canvas 同屏，软件渲染实测约 0.7 帧/秒，同屏抢主线程；
   且容器盒模型变化会同时冲击内容门（≥40KB 原始帧）与预算门（≤60KB webp）。
   要改指必须先做互斥参数（只激活目标组件）并重新校准两道门的基准线。

5. **本波不进 LHCI collect**：沿 ADR-2 §6 的第一刀豁免。已核 `lighthouserc.json`
   在册 7 条 URL 均不含 `agent-nexus`。

## 验收（全部实测，非推断）

| 门 | 结果 |
|---|---|
| `/world/agent-nexus/` | 200；`data-hall="agent-nexus"`；两块 canvas；24 枚印 |
| 城→厅到达条 | `?from=city&poi=agent-nexus` → 显示「主智能体中枢 · 探索 0/12 · 返回科技城」，`data-poi` 正确 |
| 主题 2×2 | 正控本厅 `rgb(239,233,220)`；负控 about 厅仍 `rgb(4,16,32)` |
| 移动端 375 | 到达条与首屏重叠 0px；`scrollWidth == innerWidth` |
| `check-links` | rc=0（并顺带修掉 4 条久红：spike 页 canonical 未带 base） |
| `about-hall-gate` | rc=0，无回归（G-Hall-1 的登记↔产物 1:1 闭合成立） |
| sitemap | 含 `/world/agent-nexus/`（`astro.config.mjs` 的 filter 只排除 `/world-spike/`） |

## 后果

- 城里第二栋楼可进厅。后续每加一栋厅：登记 `world-halls.json` + 补 `hallPath` +
  在 `HALL_COPY` 登记文案 + 若主题不同则加 `hall.css` 例外，四步齐做，缺一有具体症状（见上）。
- `HALL_COPY` 是新的具名清单：**新增 slug 必须同步它**，否则构建期报错（这是故意的）。
