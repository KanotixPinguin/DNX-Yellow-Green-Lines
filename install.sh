#!/usr/bin/env bash
set -Eeuo pipefail
CMD=${1:-install};CONTAINER=${CONTAINER:-owrx-8013};HERE=$(cd "$(dirname "$0")"&&pwd);BACK=/opt/dnx-yellow-green-lines-backups
paths(){ SRC=$(docker inspect "$CONTAINER" --format '{{range .Mounts}}{{if eq .Destination "/usr/lib/python3/dist-packages/htdocs/plugins"}}{{.Source}}{{end}}{{end}}');[[ -n $SRC ]]||exit 1;INIT="$SRC/receiver/init.js";DEST="$SRC/receiver/dnx_yellow_green_lines";}
remove(){ python3 - "$INIT" <<'PY'
from pathlib import Path
import sys
p=Path(sys.argv[1]);t=p.read_text();a='/* DNX_YELLOW_GREEN_LINES_LOADER_START */';b='/* DNX_YELLOW_GREEN_LINES_LOADER_END */'
if a in t and b in t:x,y=t.split(a,1);_,z=y.split(b,1);p.write_text(x+z)
PY
}
install(){ [[ $EUID -eq 0 ]]||exit 1;paths;S=$(date +%F-%H%M%S);mkdir -p "$BACK/$S" "$DEST";cp -a "$INIT" "$BACK/$S/init.js";cp "$HERE/files/dnx_yellow_green_lines.js" "$DEST/";remove;cat >>"$INIT" <<'JS'
/* DNX_YELLOW_GREEN_LINES_LOADER_START */
(function(){if(window.__dnxYellowGreenLinesReleaseLoader)return;window.__dnxYellowGreenLinesReleaseLoader=true;var s=document.createElement('script');s.src='/static/plugins/receiver/dnx_yellow_green_lines/dnx_yellow_green_lines.js';document.head.appendChild(s)})();
/* DNX_YELLOW_GREEN_LINES_LOADER_END */
JS
command -v node>/dev/null&&node --check "$INIT";docker restart "$CONTAINER";echo 'Installiert. 60–90 Sekunden warten.';}
uninstall(){ [[ $EUID -eq 0 ]]||exit 1;paths;S=$(date +%F-%H%M%S);mkdir -p "$BACK/$S";cp -a "$INIT" "$BACK/$S/init.js";remove;rm -rf "$DEST";docker restart "$CONTAINER";echo 'Entfernt.';}
status(){ paths;grep -q DNX_YELLOW_GREEN_LINES_LOADER_START "$INIT"&&echo installiert||echo fehlt;}
case "$CMD" in install|update)install;;uninstall)uninstall;;status)status;;*)echo 'install | update | status | uninstall';;esac
