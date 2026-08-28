# EXP-01 run7 证据包（同机决定趟候选 · Board R3 #151 §F）

上链人：CC-FXN-EXP01 run7 证据上链（同机执行）· 2026-08-28T08:55Z
证据来源：`/tmp/evidence-exp01/run7-decisive/`（host `cursor-44cb5599-cursor`，与 run7 执行同机）
起飞 tip 冻结：`00fd832`（基线 v2）；上链叠加在 #129 最新 tip `4ee0c02`（run5-α 抢救段）之上。

## 结论三行（R3 §F 口径）

- **RUN7_EXIT=0，CITY-EXP-01 通过，墙钟 17.6m**（`expected:1 / unexpected:0 / skipped:0 / flaky:0`）。
- **×2 leg1：待独立复核**——本包仅完成上链；按 §F，leg1 须独立复核通过后方可计入，禁自动 run8。
- **#153 对 run5 的条件 GO 不作数**：已被 R3 §F 覆盖（run5 标签烧毁、run6 连坐退役，IGNITION-run6 未签发）；决定趟锚定 run7/run8。

## 运行要素

| 要素 | 值 |
|------|-----|
| 点火令 | IGNITION-run7 v1 · parent @2026-08-28T08:28:26Z · tip_frozen=00fd832 |
| 真空三查 | @08:28:27Z PASS（chrome=0 / headless_shell=0 / load1=0.03 / astro=0） |
| e2e 启动 | 2026-08-28T08:28:30Z · `world-chromium` 串行 project · grep `CITY-EXP-01` |
| 结果 | 1 passed (17.6m) · `RUN7_EXIT=0` · duration 1053898ms |
| 硬闭 | 起飞+65min ≈ 09:33Z 与 RUN7_EXIT 取先（实际 EXIT 先到） |

## 文件清单与 sha256

| 文件 | 说明 | sha256 |
|------|------|--------|
| `env-exp01-run7.log` | run7 e2e 运行日志（1 passed 17.6m，`RUN7_EXIT=0`） | `fc5d0bfd3032b839c13590cc02b488e50a0d4a6ee4d331b404903b36b094707f` |
| `e2e-results.json` | Playwright JSON 结果（expected:1 unexpected:0 skipped:0 flaky:0） | `af13efe7f693543b3bbb48cdb7c45a373b530452f5d19c43cbb612ef51dd1b75` |
| `vacuum-run7.txt` | 真空三查 @08:28:27Z PASS | `a7ad8fd76489983ea7d578007e274633e37ef46e6fca20291eb3983581eaa42a` |
| `IGNITION-run7.txt` | 父代理 v1 点火令（tip=00fd832 FROZEN；host_fingerprint 同机） | `481cf2b5460ed2cc1cfc3eb0f60be53508219ded0e06e1bfe8e048f24d6d9ba4` |
| `README.txt` | 归档时原始 README（原样保留） | `0164298602e097b9e36b1cdd1e851655e68114a48703857d75dce33477dba9bd` |
| `run7-claimed.txt` | 执钥认领记录（parent commander same-host @08:28:27Z） | `04637ff43d2b6b4d8fd4bc17110250ab19fdc4364ecb063fb11711e484fef23b` |
| `session-dump-explore.json` | 探索计数会话埋点 dump | `2fb45ecaef6c33ebdc02cb8297b0ab8e45afe1f737899bf15112a4f139dd88cf` |
| `explore-first-discover.png` | 首次发现帧（506KB） | `c07c52c1d1ed798ec9fc9eed0b4d89e93cf225865847557996867202cf99b75b` |
| `explore-second-discover.png` | 第二次发现帧（466KB） | `1dac148d6528b0a93714a8d079ece71900996d136dbebf6dfcf068f074649318` |
| `explore-restored.png` | reload 还原帧（503KB） | `f9c82eef1dd20954adc8a43f0560931e6c0995a065bd2067e4bf41e8aca05bdf` |

## 备注

- 本提交零 `src/`、零 `e2e/` 逻辑改动，仅新增 `docs/research/exp01-evidence/run7/` 下证据文件。
- ×2 记账维持：leg1 = run7 待独立复核（本包为复核输入）；leg2 = run8 未点火，须另发 IGNITION-run8。
- 审计口径以 R3 #151 §F 为准；此前 #153 审计（run5 条件 GO / 预签 IGNITION-run6）整体作废，不得引用为放行依据。
