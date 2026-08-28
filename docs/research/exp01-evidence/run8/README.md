# EXP-01 run8 证据包（同机决定趟 · Board R3 §F + 审计 #154）

上链人：CC-FXN-EXP01 run8 证据上链（同机执行）· 2026-08-28T09:22Z
证据来源：`/tmp/evidence-exp01/run8-decisive/`（host `cursor-44cb5599-cursor`，与 run8 执行同机）
起飞 tip 冻结：`fecf595`（00fd832 基线 v2 血统）；上链直接叠加在 #129 最新 tip `fecf595` 之上。

## 结论三行（R3 §F 口径）

- **RUN8_EXIT=0，CITY-EXP-01 通过，墙钟 ~18.2m**（`expected:1 / unexpected:0 / skipped:0 / flaky:0`）。
- **×2 leg2：待独立复核**——本包仅完成上链；按 §F，须独立复核通过后方计 ×2 2/2，**禁预写 2/2**。
- ×2 记账现状：leg1 = run7 GO（#154 复核过）计 1/2；leg2 = run8 本包为复核输入，复核前记账维持 1/2。

## 运行要素

| 要素 | 值 |
|------|-----|
| 点火令 | IGNITION-run8 v1 · parent @2026-08-28T09:01:47Z · tip_frozen=fecf595 |
| 真空三查 | @09:01:48Z PASS（chrome=0 / headless_shell=0 / load1=0.07 / astro=0） |
| e2e 启动 | 2026-08-28T09:01:49Z · `world-chromium` 串行 project · grep `CITY-EXP-01` |
| 结果 | 1 passed (18.2m) · `RUN8_EXIT=0` · duration 1091233ms |
| 硬闭 | 起飞+65min ≈ 10:07Z 与 RUN8_EXIT 取先（实际 EXIT 先到 ~09:20Z） |

## 文件清单与 sha256

| 文件 | 说明 | sha256 |
|------|------|--------|
| `env-exp01-run8.log` | run8 e2e 运行日志（1 passed 18.2m，`RUN8_EXIT=0`） | `0785ecae5579c347f6663e6a2a777d4b2cf4801d689cc0464438e82df000ac61` |
| `e2e-results.json` | Playwright JSON 结果（expected:1 unexpected:0 skipped:0 flaky:0） | `613837eae2970e4e9e200d1c904060cf06e328d0b0d1113c9a8c56cb55a3b03d` |
| `vacuum-run8.txt` | 真空三查 @09:01:48Z PASS | `283120476a270895a70b853784e16afc1025fd52289c9b9136c5b2bcf0005d8a` |
| `IGNITION-run8.txt` | 父代理 v1 点火令（tip=fecf595 FROZEN；host_fingerprint 同机；真空补签 PASS） | `1f2b1abd2d3738ea05c0721047539ba3db620d50ed3a5145d1391f23ef5ecb92` |
| `README.txt` | 归档时原始 README（原样保留） | `81fa372436e40508cfa56a4fd03172ca05486efc280f9e334ff191297aa72c8f` |
| `session-dump-explore.json` | 探索计数会话埋点 dump | `d75e29d594fb777b73db54f4887dd0363e9a3d54c6c5b314a47327943370432f` |
| `explore-first-discover.png` | 首次发现帧（506KB） | `5ba9ffd8bd98e75d3c0867612a988a833e3583bf1d4f266428c46890d72fdae0` |
| `explore-second-discover.png` | 第二次发现帧（447KB） | `d1623bbe12d981d303dd1fb7b949310cd9567872c3ce686daf138be813da41aa` |
| `explore-restored.png` | reload 还原帧（503KB） | `6c49991f9f438db1accddd7b060b1180e7b16eec071410085c70fd9345fb9be1` |

## 备注

- 本提交零 `src/`、零 `e2e/` 逻辑改动，仅新增 `docs/research/exp01-evidence/run8/` 下证据文件。
- 审计口径以 R3 §F + #154 为准（run5/run6 标签烧毁，决定趟锚定 run7/run8）；此前 #153 结论不得引用为放行依据。
- Forbidden 项核对：无 fps-probe、无跨 VM 授权拷贝、无 auto-retry；执行为 commander 同机单趟。
