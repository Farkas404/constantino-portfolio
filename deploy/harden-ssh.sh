#!/usr/bin/env bash
# Optional, run ON THE SERVER after confirming key login works: disable passwords, install fail2ban + unattended upgrades.
set -euo pipefail
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/;s/^#\?PermitRootLogin.*/PermitRootLogin prohibit-password/;s/^#\?KbdInteractiveAuthentication.*/KbdInteractiveAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh
apt-get update && apt-get install -y fail2ban unattended-upgrades
printf '[sshd]\nenabled = true\nmaxretry = 4\nbantime = 1h\n' > /etc/fail2ban/jail.d/sshd.local
systemctl enable --now fail2ban
dpkg-reconfigure -f noninteractive unattended-upgrades
echo "ssh hardened, fail2ban active"
