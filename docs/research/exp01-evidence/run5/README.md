# EXP-01 run5-β 证据包（同机诊断 · Board R3 #151 §F · 不计 ×2）

上链人：CC-FXN-EXP01-EVIDENCE-UPLINK（本地执行）· 2026-08-28T08:24Z；§F 改判注记 08:27Z
证据来源：`/tmp/evidence-exp01/run5-beta-diagnostic-0803/`（原 `run5-decisive/` 已按 §F 改名）

## 结论三行（§F 最终口径）

- **同机 β RUN5_EXIT=0，CITY-EXP-01 通过，墙钟 17.5m**——**仅情报账**；资格账零。
- **×2 维持 0/2**：run5 标签烧毁、run6 连坐退役；决定趟改锚 **run7/run8**（基线 v2）。
- **跨 VM α**（bc-0b5d1fd4，17.6m PASS）免责但同样不计 ×2；证据另案 `run5-alpha-diagnostic/` 抢救。

## 文件清单与 sha256

| 文件 | 说明 | sha256 |
|------|------|--------|
| `env-exp01-run5.log` | run5 e2e 运行日志（1 passed 17.5m，`RUN5_EXIT=0`） | `cc7df92e0537c62450c8300341ebab62224acf06399e6b1fedc064498139423a` |
| `e2e-results.json` | Playwright JSON 结果 | `6ca1b49686f042180498c7b626434f85585d04720b279669de53d8bfcdbb9174` |
| `vacuum-run5.txt` | 真空三查 @08:03:22Z PASS（chrome=0 / load1=0.00 / astro=0） | `cb3dcdd0c242bf10c4c464f63c815b63f70b2563a4deb0755b7152f89534336e` |
| `IGNITION-run5-v3.txt` | 父代理 v3 点火令（追认同机决定趟；tip=49a5d6a FROZEN） | `4a66e17f8c87b89b4c82af476d79f300912d629137604a550206aa719c3a496c` |
| `README.txt` | 归档时原始 README（原样保留） | `a37920b34709122d4869bb2cd917f8fc4e1535b3415e9ce359b3422750755f39` |
| `session-dump-explore.json` | 探索计数会话埋点 dump | `6420df17b1cead03c7f1e90030b2089ac22b8fc40ca79f69ceba5587badac7ab` |
| `run5-claimed.txt` | 执钥认领记录（bc-990c31cf @08:03:10Z） | `8a3096135ed1efa875d42cb6819ee34050441adde154576a5bf40a1e62d01f30` |
| `R3-SAMEHOST-RUN5.txt` | R3 执行备忘 @08:11:25Z | `ebe0fd8a5451fbc5915f02f60e15a11216564da3479a5e1886ed85344c03486c` |
| `RUN5-DUAL-CLAIM-CONFLICT-R3.txt` | 双认领冲突记账（云侧宣称按跨 VM 不作数） | `3fbb164bbe7fdc9341136dbf6392d2ef5ffa0f83b9b8b9934eda9aa9f216373a` |
| `explore-first-discover.png` | 首次发现帧（507KB） | `8fedbc3da6a7dca5172d4f52bb6bcbb30c35423b78e2c1c115da0a8a4982d5fa` |
| `explore-second-discover.png` | 第二次发现帧（441KB） | `9a20f4436e1c88aa35660a84870b96079beb92c6f7f545e40c4b3452a25a943f` |
| `explore-restored.png` | reload 还原帧（503KB） | `f1c525f5051ed376bb8bbb121e1984c271699ad3e0da1db8434ea6b4d89e4236` |

仅存本机未上链：Playwright test-results 附件目录（`session-dump-explore.json` 的附件副本，12K）——
`/tmp/evidence-exp01/run5-decisive/cyber-city-explore-科技城探索计数-5ab23--重复进圈去重-→-reload-持久还原（埋点互证）-world-chromium/`

## 备注

- 本提交零 `src/`、零 `e2e/` 逻辑改动，仅新增 `docs/research/exp01-evidence/run5/` 下证据文件。
- 分支上此前的 a9ec398（comment-only「run5 签字」）出自云侧宣称，按 R3 口径视为 CLAIM 而非 credit。
- 禁自动 run6；IGNITION-run6 未签发。
