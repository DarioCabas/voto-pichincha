import { extractText, getDocumentProxy } from 'unpdf';
import fs from 'fs'; import path from 'path';
const dir = process.argv[2]; const out = path.join(dir, '..', 'txt'); fs.mkdirSync(out, { recursive: true });
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.pdf'))) {
  const pdf = await getDocumentProxy(new Uint8Array(fs.readFileSync(path.join(dir, f))));
  const { totalPages, text } = await extractText(pdf, { mergePages: false });
  const t = text.map((p, i) => `\n--- página ${i + 1} ---\n${p}`).join('');
  fs.writeFileSync(path.join(out, f.replace('.pdf', '.txt')), t);
  console.log(f, 'pages', totalPages, 'words', t.split(/\s+/).length);
}
