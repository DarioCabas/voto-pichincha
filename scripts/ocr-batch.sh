#!/bin/zsh
# OCR de los PDF pendientes de una dignidad. Uso: scripts/ocr-batch.sh <slug> <python-con-pymupdf> <tessdata-dir>
SLUG=$1; PY=$2; TESS=$3
ROOT=${0:A:h:h}
while read -r f || [ -n "$f" ]; do
  [ -z "$f" ] && continue
  out="$ROOT/public/textos/$SLUG/${f%.pdf}.txt"
  [ -f "$out" ] && continue
  "$PY" -I "$ROOT/scripts/ocr.py" "$ROOT/public/planes/$SLUG/$f" "$out" "$TESS" || echo "fallo $f"
done < "$ROOT/data/ocr-pendiente-${SLUG//\//-}.txt"
