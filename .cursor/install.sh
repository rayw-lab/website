#!/usr/bin/env bash
# Cloud Agent 环境 install 脚本。
# 要求：幂等、非交互、必须正常终止。禁止在此启动 dev server 或任何前台常驻进程。
# 职责：确保 Node 20+ / pnpm / git 基础工具就绪，并安装仓库依赖（若存在 package.json）。
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

log() { printf '[install] %s\n' "$*"; }

node_ok() {
  command -v node >/dev/null 2>&1 || return 1
  [ "$(node -p 'Number(process.versions.node.split(".")[0])')" -ge 20 ]
}

# 默认镜像通过 nvm 管理 Node，非交互 shell 可能未加载，先尝试加载。
if ! node_ok && [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "$HOME/.nvm/nvm.sh" || true
fi

# 镜像无 Node 20+ 时，通过 NodeSource 官方源安装 Node 22 LTS（幂等：已满足则跳过）。
if ! node_ok; then
  log '未检测到 Node >= 20，通过 NodeSource 官方源安装 Node 22'
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y --no-install-recommends nodejs
fi

# git 与常用工具：仅在缺失时安装。
missing=()
command -v git >/dev/null 2>&1 || missing+=(git)
command -v curl >/dev/null 2>&1 || missing+=(curl)
[ -e /etc/ssl/certs/ca-certificates.crt ] || missing+=(ca-certificates)
if [ "${#missing[@]}" -gt 0 ]; then
  log "安装缺失工具: ${missing[*]}"
  sudo apt-get update -y
  sudo apt-get install -y --no-install-recommends "${missing[@]}"
fi

# pnpm：优先 corepack（遵循 package.json 的 packageManager 固定版本），失败则回退 npm 全局安装。
if ! command -v pnpm >/dev/null 2>&1; then
  log '未检测到 pnpm，通过 corepack 启用'
  corepack enable pnpm 2>/dev/null \
    || sudo env COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack enable pnpm \
    || npm install -g pnpm
fi

# 预检：版本写入日志，便于排查环境问题。
log "node: $(node -v)"
log "npm:  $(npm -v)"
log "pnpm: $(pnpm -v)"
log "git:  $(git --version)"

# 依赖安装：有锁文件时用 frozen-lockfile 保证可复现。
if [ -f package.json ]; then
  if [ -f pnpm-lock.yaml ]; then
    log '执行 pnpm install --frozen-lockfile'
    pnpm install --frozen-lockfile
  else
    log '执行 pnpm install（无锁文件）'
    pnpm install
  fi
else
  log '未发现 package.json，跳过依赖安装'
fi

log 'install 完成'
