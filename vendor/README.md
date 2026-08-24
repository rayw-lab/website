# vendor/ — 第三方参考仓库（仅供学习，不入库）

本目录存放团队长期参考的第三方源码 clone。**目录内容已通过 `.gitignore` 排除**（`vendor/*`，仅保留本 README），原因：两个仓库合计约 **762MB**（大头是 folio-2025 的 197MB `static/` 运行时资产 + 150MB `resources/` Blender/GarageBand 创作源文件），远超 Git 仓库承受范围。

## 使用约定

- **仅供学习参考**。两仓库均为 **MIT 许可**（folio-2025 连 `resources/models/bruno-sudo.blend` Blender 源文件都开源；唯一例外是 folio-2025 的 WebSocket 服务端，作者未开源）。
- **不直接 copy-paste 进生产代码**。移植时按 `docs/research/bruno-simon-folio-source-teardown.md` 的模块清单重写为 TypeScript，并保留出处注释。
- 源码级拆解报告见 `docs/research/bruno-simon-folio-source-teardown.md`，其中所有文件路径与行号引用均以下方 commit 为准。

## Clone 记录

| 仓库 | 本地路径 | Commit SHA | Commit 日期 | Clone 日期 | 体积 |
|------|---------|-----------|------------|-----------|------|
| [brunosimon/folio-2025](https://github.com/brunosimon/folio-2025) | `vendor/folio-2025` | `41046b57eeed8d156d9c3fd7fa259900baef7816` | 2026-04-07 | 2026-08-24 | 623MB（sources/ 仅 1.5MB） |
| [brunosimon/folio-2019](https://github.com/brunosimon/folio-2019) | `vendor/folio-2019` | `540f13573a6da282eae942a4c67335b97cd18970` | 2024-05-06 | 2026-08-24 | 139MB（src/ 仅 716KB） |

## 重新获取

```bash
mkdir -p vendor
git clone --depth 1 https://github.com/brunosimon/folio-2025.git vendor/folio-2025
git clone --depth 1 https://github.com/brunosimon/folio-2019.git vendor/folio-2019

# 校验拆解报告引用的行号是否仍然对齐（浅 clone 拿到的是最新 commit，
# 如上游有更新，可按 SHA 精确检出）：
cd vendor/folio-2025 && git fetch --depth 1 origin 41046b57eeed8d156d9c3fd7fa259900baef7816 && git checkout 41046b5
cd ../folio-2019 && git fetch --depth 1 origin 540f13573a6da282eae942a4c67335b97cd18970 && git checkout 540f135
```

## 本地运行 folio-2025（可选）

```bash
cd vendor/folio-2025
cp .env.example .env      # VITE_SERVER_URL 留空 = 完全离线可玩
npm install --force       # three 版本 peer 冲突需 --force
npm run dev               # URL 加 #debug 开 Tweakpane，#stats 看 drawcall
```
