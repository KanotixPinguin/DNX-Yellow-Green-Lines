#!/usr/bin/env bash
set -Eeuo pipefail
CMD=${1:-install}
TYP=${TYP:-auto}
CONTAINER=${CONTAINER:-owrx-8013}
PLUGINS=${PLUGINS:-}
NORESTART=${NORESTART:-0}
HERE=$(cd "$(dirname "$0")" && pwd)
BACK="/opt/dnx-yellow-green-lines-backups"

resolve_paths() {
  if [[ "$TYP" == "normal" ]]; then
    SRC="$PLUGINS"
    if [[ -z "$SRC" ]]; then
      for cand in /usr/lib/python3/dist-packages/htdocs/plugins /opt/openwebrx/htdocs/plugins /srv/openwebrx/htdocs/plugins; do
        if [[ -d "$cand/receiver" ]]; then SRC="$cand"; break; fi
      done
    fi
  else
    if [[ "$TYP" == "auto" && -n "$PLUGINS" && -d "$PLUGINS/receiver" ]]; then
      SRC="$PLUGINS"
    else
      if ! command -v docker >/dev/null 2>&1; then
        echo "Docker nicht gefunden. Fuer native Installation TYP=normal PLUGINS=/pfad/zu/plugins setzen." >&2
        exit 1
      fi
      SRC=$(docker inspect "$CONTAINER" --format '{{range .Mounts}}{{if eq .Destination "/usr/lib/python3/dist-packages/htdocs/plugins"}}{{.Source}}{{end}}{{end}}' 2>/dev/null || true)
    fi
  fi
  [[ -n "${SRC:-}" && -d "$SRC/receiver" ]] || { echo "Plugin-Pfad nicht gefunden ($SRC)."; exit 1; }
  INIT="$SRC/receiver/init.js"
  DEST="$SRC/receiver/dnx_yellow_green_lines"
  [[ -f "$INIT" ]] || { echo "init.js nicht gefunden: $INIT"; exit 1; }
}

remove_loader() {
  python3 - "$INIT" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
t = p.read_text(encoding='utf-8')
a = '/* DNX_YELLOW_GREEN_LINES_LOADER_START */'
b = '/* DNX_YELLOW_GREEN_LINES_LOADER_END */'
if a in t and b in t:
    x, y = t.split(a, 1)
    _, z = y.split(b, 1)
    p.write_text(x.rstrip() + '\n' + z.lstrip(), encoding='utf-8')
PY
}

restart_owrx() {
  [[ "$NORESTART" == "1" ]] && return 0
  if [[ "$TYP" != "normal" ]] && command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
    docker restart "$CONTAINER"
    echo "Container $CONTAINER neu gestartet (60-90 Sekunden warten)."
  elif command -v systemctl >/dev/null 2>&1 && systemctl list-unit-files | grep -q '^openwebrx'; then
    systemctl restart openwebrx
  else
    echo "Hinweis: OpenWebRX bitte bei Bedarf manuell neu starten."
  fi
}

install_cmd() {
  [[ $EUID -eq 0 ]] || { echo "Bitte als root/sudo ausfuehren."; exit 1; }
  resolve_paths
  S=$(date +%F-%H%M%S)
  mkdir -p "$BACK/$S" "$DEST"
  cp -a "$INIT" "$BACK/$S/init.js"
  cp "$HERE/files/dnx_yellow_green_lines.js" "$DEST/"
  remove_loader
  cat >> "$INIT" <<'JS'

/* DNX_YELLOW_GREEN_LINES_LOADER_START */
(function(){if(window.__dnxLoad_dnx_yellow_green_lines)return;window.__dnxLoad_dnx_yellow_green_lines=true;var s0=document.createElement('script');s0.src='/static/plugins/receiver/dnx_yellow_green_lines/dnx_yellow_green_lines.js';document.head.appendChild(s0);})();
/* DNX_YELLOW_GREEN_LINES_LOADER_END */
JS
  command -v node >/dev/null 2>&1 && node --check "$INIT"
  restart_owrx
  echo "DNX-Yellow-Green-Lines: installiert."
}

uninstall_cmd() {
  [[ $EUID -eq 0 ]] || { echo "Bitte als root/sudo ausfuehren."; exit 1; }
  resolve_paths
  S=$(date +%F-%H%M%S)
  mkdir -p "$BACK/$S"
  cp -a "$INIT" "$BACK/$S/init.js"
  remove_loader
  rm -rf "$DEST"
  restart_owrx
  echo "DNX-Yellow-Green-Lines: entfernt (Backup in $BACK/$S)."
}

status_cmd() {
  resolve_paths
  grep -q "DNX_YELLOW_GREEN_LINES_LOADER_START" "$INIT" && echo "installiert ($DEST)" || echo "nicht installiert"
}

case "$CMD" in
  install|update) install_cmd ;;
  uninstall) uninstall_cmd ;;
  status) status_cmd ;;
  *) echo "Aufruf: $0 [install|update|status|uninstall]" ;;
esac
