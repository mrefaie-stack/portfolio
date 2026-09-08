#!/usr/bin/env bash
# نشر/تحديث الموقع على السيرفر. يُشغَّل على السيرفر نفسه:
#   bash /var/www/nodeapps/portfolio/deploy/deploy.sh
# لا يلمس content/ ولا data/uploads/ (بيانات الموقع)، ويسحب آخر كود من GitHub ثم يبني ويعيد التشغيل.
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/nodeapps/portfolio}"
APP_NAME="${APP_NAME:-portfolio}"
PORT="${PORT:-3040}"

cd "$APP_DIR"
echo "==> pulling latest code"
git fetch --quiet origin main
git reset --hard origin/main --quiet

echo "==> installing dependencies"
npm ci --no-audit --no-fund

echo "==> building"
npm run build

echo "==> restarting pm2 ($APP_NAME on :$PORT)"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$APP_NAME" --update-env
else
  PORT="$PORT" pm2 start npm --name "$APP_NAME" -- start -- -p "$PORT"
fi
pm2 save >/dev/null
echo "==> done: https://portfolio.mila-knight.com"
