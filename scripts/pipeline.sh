#!/bin/zsh
# Proceso completo de una dignidad, sin conversación con Claude:
#   texto de los PDF → OCR de los escaneados → resumen con `claude -p` (Haiku) → build
# Uso: scripts/pipeline.sh <slug> [opciones de resumir.mjs, p. ej. --max 50 --tope-usd 1]
set -e
ROOT=${0:A:h:h}; cd "$ROOT"
SLUG=$1; shift
# Herramientas de OCR dentro del proyecto (una sola vez)
if [ ! -x .venv-ocr/bin/python ]; then python3 -m venv .venv-ocr && .venv-ocr/bin/pip install -q pymupdf; fi
if [ ! -f .tessdata/spa.traineddata ]; then
  mkdir -p .tessdata && cp /opt/homebrew/share/tessdata/osd.traineddata .tessdata/
  curl -sL -o .tessdata/spa.traineddata https://github.com/tesseract-ocr/tessdata_fast/raw/main/spa.traineddata
fi
echo "== 1/4 texto de los PDF"; node scripts/extract.mjs "$SLUG" 2>&1 | grep -v Warning
echo "== 2/4 OCR de escaneados"; scripts/ocr-batch.sh "$SLUG" "$ROOT/.venv-ocr/bin/python" "$ROOT/.tessdata" 2>&1 | grep -v Warning || true
echo "== 3/4 resumen con IA"; node scripts/resumir.mjs "$SLUG" "$@"
echo "== 4/4 build"; npx astro build 2>&1 | tail -3
