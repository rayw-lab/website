# CC-BGM-C1 HG-B2 R2 资格破门证据

- **记录时点**：2026-08-30 Asia/Shanghai
- **最终裁决**：`NO_GO`
- **分类**：`BROKEN_GATE / RESULT_PASS_BUT_QUALIFICATION_FAIL`
- **适用 PR**：[#177](https://github.com/rayw-lab/website/pull/177)（维持 draft）
- **后续义务**：[#189](https://github.com/rayw-lab/website/pull/189) 维持 OPEN；SEC-R10 维持 `PENDING`

> 本轮产品代码补洞、构建面与六例结果面均通过；正式 release gate 未通过。失败点是 #182 规定的全 VM 互斥、`pipefail` 原始程序证据与 evidence commit 上链，不得把 `6/6 PASS` 改写成 ready 资格。

## 1. 身份与候选链

| 项 | 实测值 |
|---|---|
| main | `b693bbad552d303fe0c8de5a478b891df672a8e4` |
| #177 静态合流 head | `95bb79a5501b146b88b105abbcadb53a8e32f5d6` |
| docs-only main 合流候选 | `f296039c7914acbf4899baf78a314bb556aa9898` |
| `f296039` parents | `95bb79a5501b146b88b105abbcadb53a8e32f5d6` + `b693bbad552d303fe0c8de5a478b891df672a8e4` |
| `f296039` tree | `69cdc4f18b6d40583df085e67426eb62803c0f3f` |
| P0 定向补洞 / #177 final head | `d0189262e623a9f67fea5d275db922b818844292` |
| `d018926` parent | `f296039c7914acbf4899baf78a314bb556aa9898` |
| `d018926` tree | `f322d270785a58111d4cd800e807af25fb0dfb1e` |
| final-head CI | [run 33316940802](https://github.com/rayw-lab/website/actions/runs/33316940802) · SUCCESS · 5m05s |

`95bb79a` 已包含 #166/main 与三文件冲突解法：白名单 **42 total / 10 族 / ux 11**；observability 合并 BGM+NAV 子句、四行顺序 `world-bgm → minimap-open → minimap-close → minimap-teleport`、`shot-interrupt` 保留 `'teleport'`；test-framework 仅一个同名章节，三行 `81/17 → 84/18 → 86/19`。

## 2. R1 首轮审计与 P0 定向补洞

`f296039` 上首轮六例虽为 6/6，但独立 Sol 源码审计发现两个硬门破口，该结果自始只作历史 `NO_GO`：

| 破口 | 原事实 | #182 判据 |
|---|---|---|
| HG-B1 bus param 混写 | `busGain.gain.value = 0` 与 `setTargetAtTime(...)` 同参并存 | busGain 只走自动化、禁 `.value` 与自动化混写 |
| B-5 钮零动画 | 正常态 CSS 含 `transition` | BGM 钮无 transition / animation |

定向补洞提交 `d018926` 只改 `src/lab/world/audio/BgmLoop.ts`（`2+/3−`）：

1. 初始化改为 `setValueAtTime(0, ctx.currentTime)`；`busGain.gain.value =` 写入归零，`setValueAtTime` 1 处、`setTargetAtTime` 1 处，τ `0.6 / 0.15` 不变。
2. 删除正常态 transition 与随之失效的 reduced-motion override；`transition|animation` 声明归零。

独立 Sol 定向复审结论：`FIX_GO`。未发现默认 OFF、启动安全、AudioNode 拓扑、duck、事件、持久化或 a11y 行为漂移。

## 3. R2 实际结果面

### 3.1 静态与构建门

| 门 | 实测 |
|---|---|
| `pnpm install --frozen-lockfile` | `EXIT=0` |
| `pnpm exec astro check` | 156 files · **0 errors / 0 warnings** · 58 hints |
| `pnpm build` | 19 pages · `EXIT=0` |
| fresh Playwright `--list` | **86 tests / 19 files** · `EXIT=0` |
| 当前合同三文件 `39 type|41 type` | 0 命中 |
| 全局历史旧字面量 | `HISTORY_ONLY`，按 no-touch 保留 |

### 3.2 唯一正式六例结果

```sh
pnpm exec playwright test \
  e2e/cyber-city-bgm.spec.ts \
  e2e/cyber-city-audio.spec.ts \
  e2e/cyber-city-minimap.spec.ts \
  --project=world-chromium \
  --no-deps \
  --workers=1
```

| 项 | 实测 |
|---|---|
| attempt | 1；无 retry/rerun |
| 结果 | **6 passed (16.5m)** |
| 用例构成 | BGM 2 + AUD 1 + NAV 3 |
| tee 尾行 | `EXIT=0` |
| JSON | `expected=6 / unexpected=0 / skipped=0 / flaky=0 / errors=0` |
| 每例 result 数 | 1 |
| `.last-run.json` | `status=passed` · `failedTests=[]` |

结果字节与哈希：

| 工件 | SHA-256 |
|---|---|
| R2 receipt | `f73ffbe8365bf089d3fe6d16f9bedf98db4186dcc89392c57254606190f11b30` |
| HG-B2 log | `bf07a126701b3e55fdec195d08a9e1aa04b432df8b0387a46e9b2aadce85b6f4` |
| JSON reporter | `52ccceb8f83c352b8a4b56f2d10f2a2ab48565c8f0f260ca3db1d579a76f2cdd` |
| `.last-run.json` | `91d1c43004802cd49950d78eb11c8fa7d05da8ffffe219a8b13b2f561bc00903` |
| HTML report | `04629450822e21e76441875111b421481ff0c4348a7980a175121e95f93f12ad` |
| preflight 摘要 | `56b9c0df66cd0667df983b71ddd5905faac742f90907879ca36859ac1e6d24f6` |
| postflight | `aa4b910d264a2dac58d0651328d96852d9886a71a92f90a2e3ea916acf0f4e17` |

耐久消费面：

- [结果 / hash receipt](https://github.com/rayw-lab/website/pull/177#issuecomment-5469268397)
- [最终独立 NO_GO 修正](https://github.com/rayw-lab/website/pull/177#issuecomment-5469326232)

## 4. B-1 零资产判定

实测：音频二进制变更 0；`public/`、`package.json`、`pnpm-lock.yaml` 零触；source/asset probe 对 `data:audio`、`base64,`、`decodeAudioData`、`new Audio`、音频库与资产 fetch 均为 0。

board broad diff grep 有 2 处字面量，均位于 `e2e/cyber-city-bgm.spec.ts`：一处是文件头对强制 request-filter 扩展名集合的说明注释，另一处是“零音频请求”断言文案；真正的 `AUDIO_URL_RE` 定义不在这 2 个 broad-grep 命中字节中。独立 Sol 按同一 authority 的 D-1 实质门与 D-2 强制过滤器消解为：

```text
TEST_ONLY_FILTER_LITERAL
```

它们不是资产、请求、解码器或库；B-1 PASS，#172 §D 失效条款未触发。字面量非零如实登记，不伪报零命中。

## 5. 正式资格破门

最终独立 release audit 判 `NO_GO`，P0 残余为 0；P1 归并为两项 release blocker（全 VM 独占窗重跑、原始程序证据及 evidence commit 上链），对应下列四个证据破口：

| 阻断 | 原始事实 | 裁决 |
|---|---|---|
| 全 VM 互斥未成立 | preflight 全量进程快照已存在外部 `npm exec vite preview --port 4173` 及其 Node 子进程，摘要过滤器未覆盖通用 Vite preview | 开跑前不是全 VM 真空 |
| 运行期全 VM 互斥未成立 | 正式窗为 13:57:32Z–14:14:03Z；postflight 外部 headless 根进程 `etime=06:47`，反推约 14:10:06Z 启动，重叠约 **3m57s** | 外部 ownership 只意味着禁止误杀，不构成 #182 互斥豁免 |
| `pipefail` 原始程序证据不足 | HG-B2 日志含 `EXIT=0`，但正式 shell 未单独保存 `pipefail=on` 原始状态 | 结果为真，程序门未证明 |
| 证三未以 commit 上链 | PR comment 已 durable，但原始 EXIT/JSON 仍无远端 evidence commit SHA | “报告贴 PR”成立；#182 A-3-3 窄定义未满足 |

因此本轮不得 ready、不得 squash、不得关闭 #189、不得把 SEC-R10 写为 CLOSED。六例不是 flaky；它们是结果 PASS、资格 FAIL。

## 6. 磁盘与跑道清场

同机磁盘协调令生效后，不再启动新的本地运行。两个候选 worktree 经 HEAD/dirty/untracked 复核后非强制移除：

| worktree | HEAD | dirty / untracked | 原占用 | 处置 |
|---|---|---:|---:|---|
| `/private/tmp/bgm177-gate` | `d0189262` | 0 / 0 | 525772 KiB | `git worktree remove`，未 force |
| `/private/tmp/bgm177-r2` | `d0189262` | 0 / 0 | 525784 KiB | `git worktree remove`，未 force |

- worktree 合计释放约 **1.003 GiB**。
- 4551 / 4491 Python bind 成功；本 lane Playwright/Astro/headless 零残留。
- 主仓保持 clean `main@b693bbad`。
- 当前保留 R2 必要证据实际文件内容约 3.38 MiB（文件系统块占用约 3.45 MiB）；旧 R1 临时证据已删除。
- `df`：前 `809Gi used / 67Gi available / 93%`；后 `794Gi used / 85Gi available / 91%`。可用空间增加 18GiB 包含用户并发清理，本任务只认领约 1GiB worktree 释放量。

## 7. 当前状态

| 对象 | 状态 |
|---|---|
| #177 | `d0189262` · draft · 禁 ready/merge |
| #189 | OPEN |
| SEC-R10 | PENDING |
| 登记矩阵 | 北极星 98/98/90/85；生产 80/73/87/— |
| CAM 旋转 | 未触、永不代决 |
| 真机六腿 | 未触、永不代决 |
| Android S-2 | 未触、永不代决 |

## 8. 下一窗的唯一合法剧本

当前没有重跑授权；须先解除同机磁盘 / 运行协调暂停，并确认全 VM 真空。

1. preflight 覆盖通用 `vite|astro|playwright|chrome|headless`，不能只匹配本 lane 命令；任一外部相关进程命中即停。
2. socket bind 正证据、候选 SHA、全量进程快照与 `pipefail=on` 原始状态先落盘。
3. 六例仍只允许一次正式 attempt；运行期间持续或周期性保存全局 Vite/Astro/Playwright/Chrome/headless 证据。任一并发出现即将该趟判资格失败，禁重跑刷绿。
4. 收轮先归档；读取 `EXIT`、JSON stats、每例 result 数与 last-run。
5. 将 EXIT 日志、JSON 原件和 hashes 提交至独立 evidence 分支；以 evidence commit SHA 回贴 #177。
6. 再派独立只读 release audit；只有 `GO_READY` 且 final-head CI 绿，才可转 ready。

## 9. Proof class 与边界

- 产品代码补洞：VERIFIED。
- 构建 / 六例结果：VERIFIED。
- 正式 release gate：`NO_GO`。
- 本件不构成生产部署、真机、听感或性能登记证据；不改变矩阵，不触碰指挥官专属事项，不改写历史块。
