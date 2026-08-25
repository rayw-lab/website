# Third-Party Notices

本仓库使用的第三方**资产与 vendor 代码**集中声明（npm 依赖许可随 lockfile 自明，不在此重复）。
科技城专项资产的逐笔明细账见 `docs/spec/asset-ledger-cyber-city.md`；调研期的许可分级框架见
`docs/research/cyber-city-github-assets-research.md` §1.2/§5。

## 资产（public/）

| 资产 | 路径 | 作者 / 来源 | 许可 | 义务履行 |
|------|------|-------------|------|---------|
| 机器人英雄机甲（基底「Stan」，Animated Mech Pack） | `public/models/hero-robot/HeroRobot.glb` | **Quaternius** — <https://quaternius.com/packs/animatedmech.html> | **CC0 1.0**（<https://creativecommons.org/publicdomain/zero/1.0/>） | 零署名义务；自愿致谢 + 留痕（目录 README 记录来源/下载日期/改造清单） |
| CarConcept 概念车 | `public/models/car-concept/` | Khronos Group + DGG — <https://github.com/KhronosGroup/glTF-Sample-Assets> | CC BY 4.0 | Demo 页与试验场页已署名 |
| Studio Small 08 HDRI（1K） | `public/hdri/studio_small_08_1k.hdr` | Poly Haven — <https://polyhaven.com/a/studio_small_08> | CC0 | 零义务；页内自愿致谢 |
| 字体（Inter / JetBrains Mono / Noto Sans 四语种） | `public/fonts/` | rsms / JetBrains / Google — 各官方仓库 | SIL OFL 1.1 | OFL 允许分发，保留字体内嵌许可信息 |

## Vendor 代码（vendor/，不进产物 bundle）

| 项目 | 路径 | 许可 | 用途 |
|------|------|------|------|
| brunosimon/folio-2025 | `vendor/folio-2025` | MIT | 引擎层移植参考（teardown 见 `docs/research/bruno-simon-folio-source-teardown.md`） |
| brunosimon/folio-2019 | `vendor/folio-2019` | MIT | 交互语法参考（车落地弹跳等） |

## 禁用红线（摘要）

CC-BY-NC 及文件级 NC 标注（如 HexGL 资产）、无 LICENSE 仓库的代码与资产、游戏拆包冒充 CC、
Mixamo 资产再分发、任何含商标 IP 的模型——一律不得入库（完整清单见 assets research §5.4）。
