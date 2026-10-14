systemctl status nfs-api --no-pager
echo '---'
systemctl show nfs-api -p ActiveState -p SubState -p MainPID -p WorkingDirectory -p ExecStart -p FragmentPath -p DropInPaths -p EnvironmentFiles
echo '---'
cd /opt/nfs-web && git status && git rev-parse HEAD && git log -5 --oneline
echo '---'
pid=$(systemctl show nfs-api -p MainPID --value)
if [ -n "$pid" ] && [ "$pid" != '0' ]; then
  xargs -0 -L1 -a /proc/$pid/environ | grep -E '^NFS_PROVIDER=|^NFS_BRIDGE_PATH=|^NFS_PYTHON_BIN=|^NFS_SERVER_PATH=|^PORT=|^FRONTEND_URL='
fi
