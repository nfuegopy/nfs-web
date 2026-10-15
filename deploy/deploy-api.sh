#!/usr/bin/env bash
# Despliega la API en el VPS. Uso (como root):
#   bash /opt/nfs-web/deploy/deploy-api.sh [rama]
# No toca /opt/NFS-Online-Server ni la base de cuentas.
set -euo pipefail

APP=/opt/nfs-web
ENV_FILE=$APP/apps/api/.env
BRANCH=${1:-master}
BRIDGE=$APP/scripts/nfs-web-bridge.py

cd "$APP"

echo "==> Respaldo de .env"
cp -a "$ENV_FILE" "$ENV_FILE.bak.$(date +%Y%m%d%H%M%S)"

echo "==> Código ($BRANCH)"
# dist/ dejó de estar versionado: se descartan sus cambios locales antes de actualizar.
git checkout -- apps/api/dist 2>/dev/null || true
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "==> Configuración"
set_env() {
  if grep -q "^$1=" "$ENV_FILE"; then
    sed -i "s|^$1=.*|$1=$2|" "$ENV_FILE"
  else
    echo "$1=$2" >> "$ENV_FILE"
  fi
}
set_env NFS_PROVIDER python
set_env NFS_BRIDGE_PATH "$BRIDGE"
set_env FRONTEND_URL https://nfs.acbldeveloper.com
set_env COOKIE_SECURE true
if ! grep -qE '^SESSION_SECRET=.{32,}' "$ENV_FILE"; then
  set_env SESSION_SECRET "$(openssl rand -hex 32)"
  echo "    SESSION_SECRET generado"
fi
chmod 600 "$ENV_FILE"

echo "==> Comprobación del bridge (sólo lectura)"
echo '{"action":"summary"}' | python3 "$BRIDGE"
echo

echo "==> Build"
npm ci --workspace api --include-workspace-root --no-audit --no-fund
npm run build --workspace api

echo "==> Reinicio"
systemctl restart nfs-api
sleep 3
systemctl --no-pager --lines=5 status nfs-api || true
curl -fsS http://127.0.0.1:3100/api/health && echo && echo "==> Listo"
