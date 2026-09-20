#!/usr/bin/env bash
# Berapa banyak angka px lepas yang masih dipakai untuk jarak di stylesheet.
# Definisi token (`--nama: ...`) tidak dihitung: token justru tujuannya.
# Pakai: bash docs/evidence/putaran-2/polish-1/kosakata.sh <file.css>
grep -oE '(^|[;{[:space:]])(padding|margin|gap|column-gap|row-gap)[a-z-]*: *[^;}]+' "$1" \
  | grep -vE '^\s*--' \
  | grep -oE '[0-9]+px' | sort -n -u
