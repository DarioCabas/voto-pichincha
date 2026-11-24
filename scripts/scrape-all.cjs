// Descarga reanudable de todas las dignidades de Pichincha desde la sesión de Chrome
// que una persona verificó (CDP en el puerto 9333). Uso: node scripts/scrape-all.js [slug...]
const puppeteer = require('puppeteer-core');
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const ROOT = path.resolve(__dirname, '..');
const BASE = 'https://votoinformado.cne.gob.ec/voto-informado';

const DIGNIDADES = [
  { slug: 'alcalde', cod: 4, nombre: 'ALCALDE', ambito: 'C' },
  { slug: 'concejal-urbano', cod: 5, nombre: 'CONCEJALES URBANOS', ambito: 'C' },
  { slug: 'concejal-rural', cod: 3, nombre: 'CONCEJALES RURALES', ambito: 'C' },
  { slug: 'concejal-circ', cod: 12, nombre: 'CONCEJALES URBANOS POR CIRCUNSCRIPCION', ambito: 'T', sub: 'circunscripcion' },
  { slug: 'vocal-parroquial', cod: 6, nombre: 'VOCALES DE JUNTA PARROQUIAL RURAL', ambito: 'Q', sub: 'parroquia' },
];

const only = process.argv.slice(2);

(async () => {
  const b = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9333', defaultViewport: null });
  const p = (await b.pages()).find((x) => x.url().includes('votoinformado'));
  let orgs = null, cand = null;
  p.on('response', async (r) => {
    try {
      if (!r.request().postData()) return;
      if (r.url().includes('OrganizacionesPoliticas')) { const j = await r.json(); if (j?.data) orgs = j.data; }
      if (r.url().includes('CandidatosFormulario')) { const j = await r.json(); if (j?.data) cand = j.data; }
    } catch {}
  });
  const opts = (id) => p.evaluate((id) => [...(document.querySelector('#' + id)?.options ?? [])].slice(1).map((o) => ({ v: o.value, t: o.textContent.trim() })), id);

  for (const d of DIGNIDADES.filter((d) => !only.length || only.includes(d.slug))) {
    const outJson = path.join(ROOT, 'data/raw', `${d.slug}.json`);
    const pdfDir = path.join(ROOT, 'public/planes', d.slug);
    fs.mkdirSync(pdfDir, { recursive: true });
    const result = fs.existsSync(outJson) ? JSON.parse(fs.readFileSync(outJson, 'utf8')) : [];
    const done = new Set(result.map((r) => r.codFormulario));
    const save = () => fs.writeFileSync(outJson, JSON.stringify(result, null, 2));
    const dignUrl = `${BASE}/dignidad/140/${d.cod}?nombre=${encodeURIComponent(d.nombre)}&ambito=${d.ambito}&origen=inicio`;

    // 1) Enumerar filtros (cantón y, si aplica, circunscripción o parroquia)
    await p.goto(dignUrl, { waitUntil: 'networkidle2' }); await wait(2000);
    const pv = (await opts('provincia')).find((o) => o.t === 'PICHINCHA').v;
    await p.select('#provincia', pv); await wait(2000);
    const filtros = [];
    for (const c of await opts('canton')) {
      if (!d.sub) { filtros.push({ canton: c }); continue; }
      await p.select('#canton', c.v); await wait(2200);
      for (const s of await opts(d.sub)) filtros.push({ canton: c, sub: s });
    }
    console.log(`\n### ${d.nombre}: ${filtros.length} filtros`);

    // 2) Para cada filtro: buscar, listar organizaciones, abrir cada una y bajar su plan
    for (const f of filtros) {
      orgs = null;
      await p.goto(dignUrl, { waitUntil: 'networkidle2' }); await wait(1500);
      await p.select('#provincia', pv); await wait(1500);
      await p.select('#canton', f.canton.v); await wait(1800);
      if (f.sub) { await p.select('#' + d.sub, f.sub.v); await wait(1500); }
      await p.evaluate(() => [...document.querySelectorAll('button,a')].find((e) => e.innerText.trim() === 'Buscar').click());
      for (let i = 0; i < 30 && !orgs; i++) await wait(500);
      if (!orgs) { console.log('  sin resultados', f.canton.t, f.sub?.t ?? ''); continue; }
      const listUrl = p.url();
      console.log(`  ${f.canton.t}${f.sub ? ' / ' + f.sub.t : ''}: ${orgs.length} listas`);

      for (const o of orgs) {
        if (done.has(o.codFormulario)) continue;
        cand = null;
        const q = new URL(listUrl).searchParams;
        const url = `${BASE}/candidatos/140/${o.codFormulario}?partido=${encodeURIComponent(o.nomPartido)}&lista=${encodeURIComponent(o.lisPartido)}&dignidad=${encodeURIComponent(d.nombre)}&codigoDignidad=${d.cod}&ambito=${d.ambito}&origen=inicio&provincia=17&canton=${q.get('canton')}${q.get(d.sub) ? `&${d.sub}=${q.get(d.sub)}` : ''}&nombreProvincia=PICHINCHA&nombreCanton=${encodeURIComponent(f.canton.t)}`;
        await p.goto(url, { waitUntil: 'networkidle2' });
        for (let i = 0; i < 20 && !cand; i++) await wait(500);
        const plan = cand?.planesTrabajo?.[0];
        let file = null, md5ok = null, err = null;
        if (plan) {
          const tab = await b.newPage();
          try {
            const purl = `https://backend-apps.cne.gob.ec/vi/api/Catalogos/PlanTrabajo/140/${o.codFormulario}/${plan.codPlanTrabajo}`;
            await tab.goto(purl, { waitUntil: 'load', timeout: 60000 });
            const b64 = await tab.evaluate(async () => {
              const r = await fetch(location.href); const a = new Uint8Array(await r.arrayBuffer()); let s = '';
              for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode(...a.subarray(i, i + 0x8000));
              return btoa(s);
            });
            const buf = Buffer.from(b64, 'base64');
            if (buf.slice(0, 4).toString() === '%PDF') {
              file = `${o.codFormulario}.pdf`;
              fs.writeFileSync(path.join(pdfDir, file), buf);
              md5ok = crypto.createHash('md5').update(buf).digest('hex').toUpperCase() === plan.md5Hash;
            } else err = 'no-pdf';
          } catch (e) { err = String(e.message).slice(0, 80); }
          finally { await tab.close().catch(() => {}); }
        }
        result.push({
          dignidad: d.nombre, canton: f.canton.t, sub: f.sub?.t ?? null,
          lista: o.lisPartido, partido: o.nomPartido, codFormulario: o.codFormulario,
          principales: (cand?.principales ?? []).map((c) => ({ nombre: c.nomPapeleta, orden: c.ordCandidato, cod: c.codCandidato })),
          suplentes: (cand?.suplentes ?? []).map((c) => ({ nombre: c.nomPapeleta, de: c.codCandidato })),
          planArchivo: plan?.urlPlanTrabajo ?? null, pdf: file ? `/planes/${d.slug}/${file}` : null, md5ok, err, fuente: url,
        });
        done.add(o.codFormulario); save();
        console.log(`    ${o.lisPartido.padEnd(9)} ${o.nomPartido.slice(0, 40).padEnd(40)} ${file ? 'ok' : 'SIN PDF'}${md5ok === false ? ' MD5!' : ''}${err ? ' ' + err : ''}`);
        await wait(1500);
      }
    }
    console.log(`### ${d.nombre}: ${result.length} listas guardadas`);
  }
  b.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
