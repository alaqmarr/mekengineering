#!/usr/bin/env bash
# ============================================================================
# Oracle Cloud Ubuntu 22.04 / 24.04 Free Tier Setup Script for mekengg.com
# Supports both Ampere A1 (ARM64) and AMD EPYC (x86_64) instances.
# ============================================================================
set -euo pipefail

APP_DIR="/var/www/mekengineering"
DOMAIN="mekengg.com"

echo "==> [1/7] Updating system packages & creating 2GB swapfile (prevents OOM during builds)..."
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl git nginx certbot python3-certbot-nginx sqlite3 iptables-persistent build-essential

if [ ! -f /swapfile ]; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

echo "==> [2/7] Installing Node.js 22 LTS & PM2..."
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
sudo npm install -g pm2

echo "==> [3/7] Opening HTTP (80) & HTTPS (443) in Oracle Ubuntu iptables..."
# Note: Also allow TCP 80 & 443 in Oracle Cloud Console -> VCN -> Security List Ingress Rules!
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save

echo "==> [4/7] Preparing application directory & persistent SQLite data folder..."
sudo mkdir -p "${APP_DIR}/data" "${APP_DIR}/backups"
sudo chown -R "$USER:$USER" "${APP_DIR}"

if [ -f "${APP_DIR}/package.json" ]; then
  cd "${APP_DIR}"
  if [ ! -f .env ]; then
    cp .env.example .env
    SECRET=$(openssl rand -base64 32)
    sed -i "s|AUTH_SECRET=.*|AUTH_SECRET=${SECRET}|" .env
    echo "Generated fresh AUTH_SECRET in ${APP_DIR}/.env"
  fi

  echo "==> [5/7] Running ./setup.sh (Port 3600, PM2 app: mekeng)..."
  chmod +x "${APP_DIR}/setup.sh"
  PORT=3600 "${APP_DIR}/setup.sh"
fi

echo "==> [7/7] Configuring Nginx & automated daily SQLite online backup..."
if [ -f "${APP_DIR}/deploy/nginx-mekengg.conf" ]; then
  sudo cp "${APP_DIR}/deploy/nginx-mekengg.conf" /etc/nginx/sites-available/mekengg.conf
  sudo ln -sf /etc/nginx/sites-available/mekengg.conf /etc/nginx/sites-enabled/mekengg.conf
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo nginx -t && sudo systemctl reload nginx
fi

# Safe online SQLite WAL backup every night at 03:15 UTC (retains 14 days)
CRON_CMD="15 3 * * * sqlite3 ${APP_DIR}/data/mekengineering.db \".backup '${APP_DIR}/backups/mekeng-\$(date +\\%F).db'\" && find ${APP_DIR}/backups -name 'mekeng-*.db' -mtime +14 -delete"
(crontab -l 2>/dev/null | grep -v "mekengineering.db" || true; echo "${CRON_CMD}") | crontab -

echo ""
echo "Setup complete! Next steps:"
echo "  1. Ensure DNS A records for ${DOMAIN} and www.${DOMAIN} point to this Oracle VM's public IP."
echo "  2. Run: sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo "  3. Visit https://${DOMAIN}/setup to create your first Admin account!"
