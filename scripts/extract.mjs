// Extrae el texto de todos los PDF de una dignidad: texto directo si existe; si no, lista el PDF para OCR.
// Uso: node scripts/extract.mjs <slug>   → public/textos/<slug>/<cod>.txt y data/ocr-pendiente-<slug>.txt
import { extractText, getDocumentProxy } from 'unpdf';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const slug = process.argv[2];
const pdfDir = path.join(ROOT, 'public/planes', slug);
const out = path.join(ROOT, 'public/textos', slug);
fs.mkdirSync(out, { recursive: true });
const pendientes = [];
const stats = [];

for (const f of fs.readdirSync(pdfDir).filter((f) => f.endsWith('.pdf'))) {
  const dest = path.join(out, f.replace('.pdf', '.txt'));
  if (fs.existsSync(dest)) continue;
  try {
    const pdf = await getDocumentProxy(new Uint8Array(fs.readFileSync(path.join(pdfDir, f))));
    const { totalPages, text } = await extractText(pdf, { mergePages: false });
    const words = text.join(' ').split(/\s+/).filter(Boolean).length;
    const lineas = text.join('\n').split('\n').filter((l) => l.trim()).length;
    const stop = (text.join(' ').match(/\b(de|la|el|y|en|que|los|las|del)\b/gi) || []).length / Math.max(words, 1);
    if (words / totalPages < 40 || words / Math.max(lineas, 1) < 2.5 || stop < 0.08) { pendientes.push(f); stats.push([f, totalPages, words, 'ocr']); continue; }
    fs.writeFileSync(dest, text.map((p, i) => `\n--- página ${i + 1} ---\n${p}`).join(''));
    stats.push([f, totalPages, words, 'texto']);
  } catch (e) {
    pendientes.push(f); stats.push([f, 0, 0, 'error ' + e.message]);
  }
}
fs.writeFileSync(path.join(ROOT, `data/ocr-pendiente-${slug.replace('/', '-')}.txt`), pendientes.join('\n'));
const ocr = stats.filter((s) => s[3] !== 'texto');
console.log(`${slug}: ${stats.length} nuevos, ${stats.length - ocr.length} con texto, ${ocr.length} para OCR (${ocr.reduce((a, s) => a + s[1], 0)} páginas)`);
