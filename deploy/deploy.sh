#!/usr/bin/env bash
# Run ON THE SERVER as root. Pulls the repo, builds nothing (dist is committed), swaps the webroot atomically.
set -euo pipefail
REPO=https://github.com/Farkas404/constantino-portfolio.git
SRC=/opt/portfolio-src
WEB=/var/www/szilardfarkas.uk
STAMP=$(date +%Y%m%d-%H%M%S)

command -v git >/dev/null || apt-get install -y git
if [ -d "$SRC/.git" ]; then git -C "$SRC" pull --ff-only; else git clone --depth 1 "$REPO" "$SRC"; fi

# new webroot next to the old one, then atomic swap
rsync -a --delete "$SRC/dist/" "$WEB.new/"
chown -R root:root "$WEB.new"; find "$WEB.new" -type d -exec chmod 755 {} \; ; find "$WEB.new" -type f -exec chmod 644 {} \;
[ -d "$WEB" ] && mv "$WEB" "/var/www/backup-$STAMP"
mv "$WEB.new" "$WEB"

# nginx config (only if changed)
if ! cmp -s "$SRC/deploy/nginx-szilardfarkas.uk.conf" /etc/nginx/sites-available/szilardfarkas.uk; then
  cp /etc/nginx/sites-available/szilardfarkas.uk "/root/nginx-szilardfarkas.uk.$STAMP.bak" 2>/dev/null || true
  cp "$SRC/deploy/nginx-szilardfarkas.uk.conf" /etc/nginx/sites-available/szilardfarkas.uk
  ln -sf /etc/nginx/sites-available/szilardfarkas.uk /etc/nginx/sites-enabled/szilardfarkas.uk
fi
nginx -t && systemctl reload nginx
echo "deployed $STAMP -> $WEB"
