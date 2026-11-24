// uso: node scrape.js <codDignidad> <nombreDignidad> <ambito> <slug> [canton]
const puppeteer = require('puppeteer-core');
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const wait = ms => new Promise(r => setTimeout(r, ms));
const [cod, nombre, ambito, slug, canton] = process.argv.slice(2);
const OUT = path.resolve(__dirname, '../data'); const PDF = path.join(OUT, 'pdf');
(async () => {
  const b = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9333', defaultViewport: null });
  const p = (await b.pages()).find(x => x.url().includes('votoinformado'));
  let orgs = null, cand = null, pdfBuf = null;
  p.on('response', async r => {
    const u = r.url();
    try {
      if (u.includes('OrganizacionesPoliticas') && r.request().postData()) { const j = await r.json(); if (j?.data) orgs = j.data; }
      if (u.includes('CandidatosFormulario') && r.request().postData()) { const j = await r.json(); if (j?.data) cand = j.data; }
      if (u.includes('.pdf') || (r.headers()['content-type']||'').includes('pdf')) pdfBuf = await r.buffer();
    } catch {}
  });
  await p.goto(`https://votoinformado.cne.gob.ec/voto-informado/dignidad/140/${cod}?nombre=${encodeURIComponent(nombre)}&ambito=${ambito}&origen=inicio`, { waitUntil: 'networkidle2' }); await wait(2500);
  const pv = await p.evaluate(() => [...document.querySelectorAll('#provincia option')].find(o => o.textContent.trim() === 'PICHINCHA').value);
  await p.select('#provincia', pv); await wait(2500);
  if (canton) { const cv = await p.evaluate(c => [...document.querySelectorAll('#canton option')].find(o => o.textContent.trim() === c).value, canton); await p.select('#canton', cv); await wait(2500); }
  await p.evaluate(() => [...document.querySelectorAll('button,a')].find(e => e.innerText.trim() === 'Buscar').click());
  for (let i = 0; i < 20 && !orgs; i++) await wait(500);
  console.log('listas', orgs.length);
  const result = [];
  for (const o of orgs) {
    cand = null; pdfBuf = null;
    const url = `https://votoinformado.cne.gob.ec/voto-informado/candidatos/140/${o.codFormulario}?partido=${encodeURIComponent(o.nomPartido)}&lista=${encodeURIComponent(o.lisPartido)}&dignidad=${encodeURIComponent(nombre)}&codigoDignidad=${cod}&ambito=${ambito}&origen=inicio&provincia=17&nombreProvincia=PICHINCHA`;
    await p.goto(url, { waitUntil: 'networkidle2' });
    for (let i = 0; i < 20 && !cand; i++) await wait(500);
    const plan = cand?.planesTrabajo?.[0];
    let file = null, md5ok = null;
    if (plan) {
      const purl = `https://backend-apps.cne.gob.ec/vi/api/Catalogos/PlanTrabajo/140/${o.codFormulario}/${plan.codPlanTrabajo}`;
      const tab = await b.newPage();
      try {
        const resp = await tab.goto(purl, { waitUntil: 'load', timeout: 60000 }).catch(() => null);
        if (resp) { const b64 = await tab.evaluate(async () => { const r = await fetch(location.href); const a = new Uint8Array(await r.arrayBuffer()); let s = ''; for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode(...a.subarray(i, i + 0x8000)); return btoa(s); }).catch(e => null); if (b64) pdfBuf = Buffer.from(b64, 'base64'); }
      } finally { await tab.close().catch(() => {}); }
      if (pdfBuf && pdfBuf.slice(0, 4).toString() === '%PDF') { file = `${slug}_${o.lisPartido}.pdf`; fs.writeFileSync(path.join(PDF, file), pdfBuf); md5ok = crypto.createHash('md5').update(pdfBuf).digest('hex').toUpperCase() === plan.md5Hash; }
      else if (pdfBuf) console.log('  no es PDF:', pdfBuf.slice(0, 80).toString());
    }
    result.push({ dignidad: nombre, canton: canton || null, lista: o.lisPartido, partido: o.nomPartido, codFormulario: o.codFormulario, principales: cand?.principales?.map(c => c.nomPapeleta), suplentes: cand?.suplentes?.map(c => c.nomPapeleta), planArchivo: plan?.urlPlanTrabajo, pdf: file, md5ok, fuente: url });
    console.log(o.lisPartido, o.nomPartido, '| pdf:', file, 'md5ok:', md5ok, pdfBuf ? pdfBuf.length + 'B' : '');
    await wait(2500);
  }
  fs.writeFileSync(path.join(OUT, `${slug}.json`), JSON.stringify(result, null, 2));
  b.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
