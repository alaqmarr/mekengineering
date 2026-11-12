#!/usr/bin/env bash
# ============================================================================
# Mek Engineering Corporation — Production Setup & Deploy Script
# Port: 3600 | PM2 Process Name: mekeng
# ============================================================================
set -euo pipefail

APP_NAME="mekeng"
PORT="${PORT:-3600}"
HOST="${HOSTNAME:-127.0.0.1}"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "============================================================"
echo " Setting up ${APP_NAME} in ${APP_DIR} (Port: ${PORT})"
echo "============================================================"

cd "${APP_DIR}"

# 1. Optional Ubuntu/Debian system packages & swap check (when sudo + apt-get exist)
if command -v apt-get >/dev/null 2>&1 && command -v sudo >/dev/null 2>&1; then
  if ! command -v curl >/dev/null 2>&1 || ! command -v sqlite3 >/dev/null 2>&1; then
    echo "==> [1/6] Installing required system utilities (curl, sqlite3, build-essential)..."
    sudo apt-get update -y
    sudo apt-get install -y curl git sqlite3 build-essential
  else
    echo "==> [1/6] System utilities verified."
  fi

  # Create 2GB swapfile on low-memory VMs if no swap is active
  if [ "$(swapon --show | wc -l)" -eq 0 ] && [ ! -f /swapfile ]; then
    echo "==> Creating 2GB swapfile to prevent OOM during Next.js production build..."
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    if ! grep -q '/swapfile' /etc/fstab; then
      echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
    fi
  fi
else
  echo "==> [1/6] Skipping apt-get step (non-Debian environment or non-sudo)."
fi

# 2. Verify Node.js (>= 20) & PM2
echo "==> [2/6] Checking Node.js & PM2..."
if ! command -v node >/dev/null 2>&1; then
  if command -v apt-get >/dev/null 2>&1 && command -v sudo >/dev/null 2>&1; then
    echo "Installing Node.js 22 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
  else
    echo "ERROR: Node.js (>= 20) is not installed. Please install Node.js 22 LTS first."
    exit 1
  fi
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "Installing PM2 globally..."
  if command -v sudo >/dev/null 2>&1 && [ "$(id -u)" -ne 0 ]; then
    sudo npm install -g pm2
  else
    npm install -g pm2
  fi
fi

# 3. Prepare persistent directories & .env
echo "==> [3/6] Preparing persistent SQLite data directory & environment..."
mkdir -p "${APP_DIR}/data" "${APP_DIR}/data/uploads" "${APP_DIR}/backups" "${APP_DIR}/logs"

if [ ! -f "${APP_DIR}/.env" ]; then
  if [ -f "${APP_DIR}/.env.example" ]; then
    cp "${APP_DIR}/.env.example" "${APP_DIR}/.env"
  else
    touch "${APP_DIR}/.env"
  fi

  if command -v openssl >/dev/null 2>&1; then
    GENERATED_SECRET="$(openssl rand -base64 32)"
  else
    GENERATED_SECRET="$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")"
  fi

  if grep -q "^AUTH_SECRET=" "${APP_DIR}/.env"; then
    sed -i "s|^AUTH_SECRET=.*|AUTH_SECRET=${GENERATED_SECRET}|" "${APP_DIR}/.env"
  else
    echo "AUTH_SECRET=${GENERATED_SECRET}" >> "${APP_DIR}/.env"
  fi

  if grep -q "^PORT=" "${APP_DIR}/.env"; then
    sed -i "s|^PORT=.*|PORT=${PORT}|" "${APP_DIR}/.env"
  else
    echo "PORT=${PORT}" >> "${APP_DIR}/.env"
  fi

  if grep -q "^DATABASE_PATH=" "${APP_DIR}/.env"; then
    sed -i "s|^DATABASE_PATH=.*|DATABASE_PATH=${APP_DIR}/data/mekengineering.db|" "${APP_DIR}/.env"
  else
    echo "DATABASE_PATH=${APP_DIR}/data/mekengineering.db" >> "${APP_DIR}/.env"
  fi

  echo "Created ${APP_DIR}/.env with generated AUTH_SECRET and PORT=${PORT}."
fi

# 4. Install dependencies & build Next.js standalone production server
echo "==> [4/6] Installing dependencies & building Next.js standalone bundle..."
if [ -f "${APP_DIR}/package-lock.json" ]; then
  npm ci
else
  npm install
fi

npm run build

echo "==> [5/6] Copying static & public assets into Next.js standalone bundle..."
mkdir -p "${APP_DIR}/.next/standalone/.next"
rm -rf "${APP_DIR}/.next/standalone/public" "${APP_DIR}/.next/standalone/.next/static"
cp -r "${APP_DIR}/public" "${APP_DIR}/.next/standalone/public"
cp -r "${APP_DIR}/.next/static" "${APP_DIR}/.next/standalone/.next/static"

# Copy .env into standalone directory as fallback if needed
if [ -f "${APP_DIR}/.env" ]; then
  cp "${APP_DIR}/.env" "${APP_DIR}/.next/standalone/.env"
fi

# 6. Start / Reload PM2 process "mekeng" on port 3600
echo "==> [6/6] Starting PM2 process '${APP_NAME}' on port ${PORT}..."
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
echo " Deployment Complete!"
echo "  - PM2 App Name : ${APP_NAME}"
echo "  - Listening On : http://${HOST}:${PORT}"
echo "  - Database     : ${APP_DIR}/data/mekengineering.db"
echo "  - Admin Setup  : http://${HOST}:${PORT}/setup"
echo "  - Admin Import : Upload your local .db file at /admin -> Import .db Catalog"
echo "============================================================"
