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
set_env SMTP_HOST smtp.hostinger.com
set_env SMTP_PORT 465
set_env SMTP_USER contacto@acbldeveloper.com
set_env MAIL_FROM '"NFSU2 Online <contacto@acbldeveloper.com>"'
if ! grep -qE '^SMTP_PASS=.+' "$ENV_FILE"; then
  echo "    Aviso: falta SMTP_PASS en $ENV_FILE (la recuperación por email queda desactivada)"
fi
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
for _ in $(seq 1 20); do
  if curl -fsS http://127.0.0.1:3100/api/health >/dev/null 2>&1; then
    echo "==> Listo: la API responde"
    exit 0
  fi
  sleep 1
done
echo "!! La API no respondió en 20 segundos. Revisá: journalctl -u nfs-api -n 50" >&2
exit 1
