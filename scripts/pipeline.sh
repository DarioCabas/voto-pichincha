#!/bin/zsh
# Extrae texto, hace OCR de los escaneos y analiza una dignidad. Uso: scripts/pipeline.sh <slug> <python> <tessdata>
ROOT=${0:A:h:h}; cd "$ROOT"
node scripts/extract.mjs "$1" 2>&1 | grep -v Warning
scripts/ocr-batch.sh "$1" "$2" "$3" 2>&1 | grep -v Warning
node scripts/analyze.mjs "$1"
