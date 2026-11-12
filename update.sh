#!/usr/bin/env bash
# ============================================================================
# Mek Engineering Corporation — Production Update & Redeploy Script
# Port: 3600 | PM2 Process Name: mekeng
# ============================================================================
set -euo pipefail

APP_NAME="mekeng"
PORT="${PORT:-3600}"
HOST="${HOSTNAME:-127.0.0.1}"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "============================================================"
echo " Updating ${APP_NAME} in ${APP_DIR} (Port: ${PORT})"
echo "============================================================"

cd "${APP_DIR}"

# 1. Safe online SQLite backup before updating (if database exists)
mkdir -p "${APP_DIR}/data" "${APP_DIR}/backups"
if [ -f "${APP_DIR}/data/mekengineering.db" ] && command -v sqlite3 >/dev/null 2>&1; then
  STAMP="$(date +%Y%m%d-%H%M%S)"
  BACKUP_FILE="${APP_DIR}/backups/mekeng-pre-update-${STAMP}.db"
  echo "==> [1/5] Backing up live SQLite database to ${BACKUP_FILE}..."
  sqlite3 "${APP_DIR}/data/mekengineering.db" ".backup '${BACKUP_FILE}'"
  # Keep the 15 most recent pre-update backups
  ls -1t "${APP_DIR}/backups"/mekeng-pre-update-*.db 2>/dev/null | tail -n +16 | xargs -r rm -f
else
  echo "==> [1/5] Skipping pre-update DB snapshot (no existing database or sqlite3 CLI)."
fi

# 2. Pull latest code from Git
echo "==> [2/5] Pulling latest changes from Git..."
git pull

# Ensure scripts stay executable after git pull
chmod +x "${APP_DIR}/setup.sh" "${APP_DIR}/update.sh" 2>/dev/null || true

# 3. Install dependencies with --legacy-peer-deps
echo "==> [3/5] Installing npm packages (--legacy-peer-deps)..."
if [ -f "${APP_DIR}/package-lock.json" ]; then
  npm ci --legacy-peer-deps
else
  npm install --legacy-peer-deps
fi

# 4. Rebuild Next.js standalone bundle & sync static/public assets
echo "==> [4/5] Building Next.js standalone production bundle..."
npm run build

mkdir -p "${APP_DIR}/.next/standalone/.next"
rm -rf "${APP_DIR}/.next/standalone/public" "${APP_DIR}/.next/standalone/.next/static"
cp -r "${APP_DIR}/public" "${APP_DIR}/.next/standalone/public"
cp -r "${APP_DIR}/.next/static" "${APP_DIR}/.next/standalone/.next/static"

if [ -f "${APP_DIR}/.env" ]; then
  cp "${APP_DIR}/.env" "${APP_DIR}/.next/standalone/.env"
fi

# 5. Reload PM2 process "mekeng" on port 3600
echo "==> [5/5] Reloading PM2 process '${APP_NAME}' on port ${PORT}..."
if pm2 describe "${APP_NAME}" >/dev/null 2>&1; then
  PORT="${PORT}" HOSTNAME="${HOST}" DATABASE_PATH="${APP_DIR}/data/mekengineering.db" \
    pm2 reload ecosystem.config.cjs --only "${APP_NAME}" --update-env
else
  PORT="${PORT}" HOSTNAME="${HOST}" DATABASE_PATH="${APP_DIR}/data/mekengineering.db" \
    pm2 start ecosystem.config.cjs --only "${APP_NAME}" --update-env
fi

pm2 save

echo ""
echo "============================================================"
echo " Update Complete! '${APP_NAME}' is live on http://${HOST}:${PORT}"
echo "============================================================"
