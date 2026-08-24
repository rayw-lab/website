#!/usr/bin/env bash
# Cloud Agent 终端脚本：package.json 存在且 dev 脚本为 astro 时启动 dev server，
# 否则打印提示并保持空闲（idle），避免终端反复崩溃重启。
set -u

if ! command -v node >/dev/null 2>&1 && [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "$HOME/.nvm/nvm.sh" || true
fi

has_astro_dev() {
  [ -f package.json ] && node -e '
    const p = require("./package.json");
    process.exit(p.scripts && p.scripts.dev && /astro/.test(p.scripts.dev) ? 0 : 1);
  ' 2>/dev/null
}

if has_astro_dev; then
  echo '[astro-dev] 启动 Astro dev server（0.0.0.0:4321）'
  exec pnpm dev --host 0.0.0.0
fi

echo '[astro-dev] 未检测到 astro dev 脚本（package.json 缺失或未配置 astro）。'
echo '[astro-dev] 初始化 Astro 工程后手动运行: pnpm dev --host 0.0.0.0'
exec sleep infinity
