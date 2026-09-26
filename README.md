# szilardfarkas.uk — portfolio

Static site, no framework. `src/` holds the content (DE + EN), CSS and JS; `build.py` renders `dist/` (DE at `/`, EN at `/en/`).

```
python3 build.py        # regenerates dist/
deploy/deploy.sh        # run on the server: pulls repo, swaps webroot, reloads nginx
```

- `src/content.py` — all copy and project data in both languages
- `src/style.css`, `src/app.js` — served as external files so nginx can send a strict CSP (no inline script/style)
- `deploy/nginx-szilardfarkas.uk.conf` — TLS, security headers, gzip, cache, 404
- `deploy/harden-ssh.sh` — optional: key-only SSH, fail2ban, unattended upgrades
