# LHCI 不回退收据（R3 轮 vs 上轮）

| 项 | 上轮 | 本轮 | Δ |
|---|---|---|---|
| 来源 artifact | **9803026775**（`x2-final-head-lighthouse-results.zip`，21 份 LHR） | **9831423112**（CI run `33589801653`，`lighthouse-results`，21 份 LHR... 实测 22 文件含 manifest） | — |
| head | `598764172250f3a0d6e5a29c36aa564dbd44e009` | `6f691fce53dd03e2485d98218e76af6e9a4611da` | — |
| `/` Performance 中位数 | 100 | 100 | 0 |
| `/` Accessibility 中位数 | 100 | 100 | 0 |
| `/` Best Practices 中位数 | 100 | 100 | 0 |
| `/` SEO 中位数 | 100 | 100 | 0 |
| `/home/` Performance 中位数 | 100 | 100 | 0 |
| `/home/` Accessibility 中位数 | 100 | 100 | 0 |
| `/home/` Best Practices 中位数 | 100 | 100 | 0 |
| `/home/` SEO 中位数 | 100 | 100 | 0 |
| 其余 5 URL（about / lab/car-configurator / lab/tts-cockpit / work / work/multilingual-cockpit）四类 | 全 100 | 全 100 | 0 |
| **7 URL × 4 类总中位数** | **100 / 100 / 100 / 100** | **100 / 100 / 100 / 100** | **0 / 0 / 0 / 0** |

- 口径：7 URL（每 URL n=3 runs）原始分类分数中位数；非"≥95 阈值门"表述，而是原始值逐项对照。
- 结论：**逐项 Δ=0，不回退成立**。
- 本轮来源：GitHub Actions run `33589801653` artifact `9831423112`（exact head `6f691fc`）；上轮来源：R2 收据审计包内 artifact `9803026775` 原件（head `5987641`）。
