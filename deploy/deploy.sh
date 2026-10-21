#!/usr/bin/env bash
# Run ON THE SERVER as root (cron every 5 min, see /etc/cron.d/portfolio).
# Pulls the repo. Only when there is a NEW COMMIT it swaps the webroot atomically
# (dist is committed, nothing is built) and keeps the last $KEEP webroot backups.
# The nginx config is only replaced when it changed, and rolled back if invalid.
set -euo pipefail
# cron starts with a minimal PATH without /usr/sbin, where nginx lives
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
REPO=https://github.com/Farkas404/constantino-portfolio.git
SRC=/opt/portfolio-src
WEB=/var/www/szilardfarkas.uk
KEEP=5                                        # webroot backups to keep
STATE=/var/lib/portfolio-deploy/last-commit   # commit currently live
NGINX_CONF=/etc/nginx/sites-available/szilardfarkas.uk
EXTRA_DIR=/etc/nginx/szilardfarkas.uk.d       # server-local nginx extras, not in git
STAMP=$(date +%Y%m%d-%H%M%S)

# never run twice at the same time (cron every 5 min)
exec 9>/run/portfolio-deploy.lock
flock -n 9 || exit 0

command -v git >/dev/null || apt-get install -y git
if [ -d "$SRC/.git" ]; then git -C "$SRC" pull -q --ff-only; else git clone -q --depth 1 "$REPO" "$SRC"; fi
HEAD=$(git -C "$SRC" rev-parse HEAD)
mkdir -p "$(dirname "$STATE")" "$EXTRA_DIR"

# --- webroot: only on a new commit (or if it is missing)
if [ ! -d "$WEB" ] || [ "$(cat "$STATE" 2>/dev/null || true)" != "$HEAD" ]; then
  rsync -a --delete "$SRC/dist/" "$WEB.new/"
  chown -R root:root "$WEB.new"; find "$WEB.new" -type d -exec chmod 755 {} +; find "$WEB.new" -type f -exec chmod 644 {} +
  [ -d "$WEB" ] && mv "$WEB" "/var/www/backup-$STAMP"
  mv "$WEB.new" "$WEB"
  echo "$HEAD" > "$STATE"
  echo "$STAMP deployed ${HEAD:0:7} -> $WEB"
fi

# --- keep only the newest $KEEP webroot backups (names sort chronologically)
shopt -s nullglob
backups=(/var/www/backup-*)
if [ ${#backups[@]} -gt $KEEP ]; then
  rm -rf -- "${backups[@]:0:${#backups[@]}-KEEP}"
  echo "$STAMP pruned $(( ${#backups[@]} - KEEP )) old webroot backups"
fi
shopt -u nullglob

# --- nginx config: only if changed, roll back if invalid
if ! cmp -s "$SRC/deploy/nginx-szilardfarkas.uk.conf" "$NGINX_CONF"; then
  BAK="/root/nginx-szilardfarkas.uk.$STAMP.bak"
  cp "$NGINX_CONF" "$BAK" 2>/dev/null || true
  cp "$SRC/deploy/nginx-szilardfarkas.uk.conf" "$NGINX_CONF"
  ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/szilardfarkas.uk
  if nginx -t 2>/dev/null; then
    systemctl reload nginx
    echo "$STAMP nginx config updated (backup: $BAK)"
  else
    [ -f "$BAK" ] && cp "$BAK" "$NGINX_CONF"
    nginx -t || true
    echo "$STAMP nginx config from repo is INVALID, kept the old one" >&2
    exit 1
  fi
fi
