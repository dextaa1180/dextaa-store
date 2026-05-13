#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/dextaa-store"

cd "$APP_DIR"
git pull
npm install
npm run db:generate
npm run db:push
npm run build
sudo systemctl restart dextaa-api
sudo systemctl reload nginx

echo "DextaaStore deploy complete."
