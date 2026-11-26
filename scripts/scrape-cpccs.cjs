// Descarga los candidatos al CPCCS (elección nacional) y su "Propuesta y Trayectoria" en PDF
// desde la sesión de navegador que una persona verificó (CDP en el puerto 9333).
// Uso: node scripts/scrape-cpccs.cjs   → data/raw/nacional/cpccs.json y public/planes/nacional/cpccs/<cod>.pdf (reanudable)
// Mismo formato que scrape-all.cjs para que extract/ocr/resumir funcionen con el slug "nacional/cpccs".
const puppeteer = require('puppeteer-core');
const fs = require('fs'), path = require('path');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const ROOT = path.resolve(__dirname, '..');
const BASE = 'https://votoinformado.cne.gob.ec/voto-informado';
const FILES = 'https://backend-apps.cne.gob.ec/repository/api/File/Get?file=';

(async () => {
  const b = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9333', defaultViewport: null });
  const p = await b.newPage();
  let cands = null;
  p.on('response', async (r) => {
    try { if (r.url().includes('CandidatosCpccs') && r.request().postData()) { const j = await r.json(); if (j?.data) cands = j.data; } } catch {}
  });
  const fuente = `${BASE}/cpccs/140?partido=${encodeURIComponent("REPRESENTANTES MUJERES")}`;
  await p.goto(fuente, { waitUntil: 'networkidle2' });
  for (let i = 0; i < 30 && !cands; i++) await wait(500);
  if (!cands) throw new Error('El CNE no devolvió candidatos del CPCCS');

  const outJson = path.join(ROOT, 'data/raw/nacional/cpccs.json');
  const pdfDir = path.join(ROOT, 'public/planes/nacional/cpccs');
  fs.mkdirSync(pdfDir, { recursive: true }); fs.mkdirSync(path.dirname(outJson), { recursive: true });
  const result = fs.existsSync(outJson) ? JSON.parse(fs.readFileSync(outJson, 'utf8')) : [];
  const done = new Set(result.filter((r) => !r.err).map((r) => r.codFormulario));
  const save = () => fs.writeFileSync(outJson, JSON.stringify(result, null, 2));
  console.log(`### CPCCS: ${cands.length} candidaturas`);

  for (const c of cands) {
    if (done.has(c.codCandidato)) continue;
    const grupo = c.nomPartido.trim().replace(/^REPRESENTANTES\s+/, ''); // HOMBRES | MUJERES | ORGANIZACIONES SOCIALES...
    const ced = String(c.codCandidato).padStart(10, '0');
    const planArchivo = `votoinformado/140/cpccs/info-cpccs/${ced}.pdf`;
    let file = null, err = null;
    const tab = await b.newPage();
    try {
      await tab.goto(FILES + planArchivo, { waitUntil: 'load', timeout: 60000 });
      const b64 = await tab.evaluate(async () => {
        const r = await fetch(location.href); const a = new Uint8Array(await r.arrayBuffer()); let s = '';
        for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode(...a.subarray(i, i + 0x8000));
        return btoa(s);
      });
      const buf = Buffer.from(b64, 'base64');
      if (buf.slice(0, 4).toString() === '%PDF') { file = `${c.codCandidato}.pdf`; fs.writeFileSync(path.join(pdfDir, file), buf); }
      else err = 'no-pdf';
    } catch (e) { err = String(e.message).slice(0, 80); }
    finally { await tab.close().catch(() => {}); }
    const prev = result.findIndex((r) => r.codFormulario === c.codCandidato);
    if (prev >= 0) result.splice(prev, 1);
    result.push({
      dignidad: 'CPCCS', canton: grupo, sub: null, lista: String(c.ordCandidato), partido: c.nomPartido.trim(),
      codFormulario: c.codCandidato,
      principales: [{ nombre: c.nomPapeleta, orden: c.ordCandidato, cod: c.codCandidato }], suplentes: [],
      foto: c.urlFotoCandidato ? FILES + c.urlFotoCandidato : null,
      planArchivo, pdf: file ? `/planes/nacional/cpccs/${file}` : null, provincia: 'NACIONAL', md5ok: null, err, fuente,
    });
    done.add(c.codCandidato); save();
    console.log(`  ${grupo.padEnd(24)} ${String(c.ordCandidato).padStart(2)} ${c.nomPapeleta.slice(0, 36).padEnd(36)} ${file ? 'ok' : 'SIN PDF'}${err ? ' ' + err : ''}`);
    await wait(1500);
  }
  console.log(`### CPCCS: ${result.length} guardadas`);
  await p.close(); b.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
