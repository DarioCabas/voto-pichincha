// Resume cada plan de trabajo con `claude -p` (usa la suscripción de Claude Code, no API key).
// Lee data/raw/<slug>.json + public/textos/<slug>/<cod>.txt  (slug = "alcalde" o "azuay/alcalde")
// Guarda cada resumen en data/resumen/<slug>/<cod>.json (reanudable) y arma los archivos de la página:
//   Pichincha → src/data/concejal/<slug>-<canton>-ia.json · otras → src/data/provincias/<prov>/<dignidad>-<canton>.json
// Cada propuesta lleva una cita textual del PDF; el script la busca en el texto y anota la página.
// Si la cita no aparece en el plan, la propuesta se descarta (no se publica nada que el PDF no diga).
//
// Uso: node scripts/resumir.mjs <slug> [--modelo haiku] [--max 20] [--tope-usd 2] [--paralelo 3] [--compilar]
//   --max       cuántos planes nuevos resumir en esta corrida (para ir por partes)
//   --tope-usd  se detiene al llegar a ese costo equivalente (referencia del consumo del plan)
//   --compilar  solo vuelve a armar los archivos de la página con lo ya resumido
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { seleccionar } from './seccion.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--') && !/^\d/.test(a));
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const MODELO = opt('modelo', 'haiku');
const MAX = Number(opt('max', 1e9));
const TOPE = Number(opt('tope-usd', 1e9));
const PARALELO = Number(opt('paralelo', 3));
const SOLO_COMPILAR = args.includes('--compilar');
const SOLO = opt('solo', null); // probar un solo formulario
const MAX_CHARS = Number(opt('max-chars', 0)) || null; // por defecto: 120k alcaldes, 60k el resto
if (!slug) { console.error('Falta el slug: alcalde | concejal-urbano | concejal-rural | concejal-circ | vocal-parroquial'); process.exit(1); }

const BASE = slug.split('/').pop();
const LIMITE = MAX_CHARS ?? (BASE === 'alcalde' || BASE === 'prefecto' ? 120000 : 60000);
const PROV = slug.includes('/') ? slug.split('/')[0] : null;
const CRITERIOS = {
  alcalde: {
    dignidad: 'Alcalde/sa',
    comp: 'Sí puede: calles, agua potable y alcantarillado, basura, tránsito y buses, parques, mercados, uso del suelo y prevención de desastres. No le toca: policía, hospitales, escuelas ni crear empleo directamente.',
    viab: '    alta = le toca al Municipio y es realista; media = la puede empujar pero depende de otros (Gobierno, Prefectura, préstamos); baja = no le toca al Municipio (policía, salud, educación) o es irreal.',
  },
  concejal: {
    dignidad: 'Concejal/a',
    comp: 'Un concejal no hace obras. Sí puede: crear ordenanzas (leyes del cantón), vigilar cómo gasta el alcalde y votar el presupuesto.',
    viab: '    alta = es una ordenanza, una resolución o vigilar al alcalde (lo hace el concejal); media = pedir o empujar algo que hace el alcalde; baja = promete construir obras o dar servicios él mismo, o es tema de otro nivel de gobierno.',
  },
  'vocal-parroquial': {
    dignidad: 'Vocal de junta parroquial rural',
    comp: 'Sí puede: parques y espacios de la parroquia, cuidar caminos junto con la Prefectura, apoyar a productores, cuidar el ambiente y organizar a la comunidad. Tiene poco presupuesto. No le toca: agua potable, salud, educación ni policía.',
    viab: '    alta = le toca a la junta y cuesta poco (mingas, ferias, parques, cursos, organizar a la comunidad); media = necesita un acuerdo con el Municipio o la Prefectura; baja = le toca a otro nivel (agua potable, salud, escuelas, policía) o es una obra grande irreal.',
  },
};
CRITERIOS.prefecto = {
  dignidad: 'Prefecto/a y viceprefecto/a de la provincia',
  comp: 'Sí puede (COOTAD art. 42): vías rurales que unen parroquias y cantones, riego, gestión ambiental y de cuencas, fomento de la producción agropecuaria, turismo y cooperación internacional. No le toca: calles de la ciudad, agua potable, alcantarillado o basura (Municipio), ni policía, salud o educación (Gobierno nacional).',
  viab: '    alta = le toca a la Prefectura y es realista (vías rurales, riego, apoyo productivo, cuencas); media = la puede empujar pero depende de otros (MTOP, Ministerio, Municipio, préstamos o convenios); baja = no le toca a la Prefectura (calles urbanas, agua potable, policía, hospitales, escuelas) o es irreal.',
};
CRITERIOS.cpccs = {
  dignidad: 'Consejero/a del Consejo de Participación Ciudadana y Control Social (CPCCS)',
  comp: 'Sí puede (Constitución art. 208): designar con comisiones ciudadanas al Fiscal, Contralor, Defensor del Pueblo, Defensor Público, Procurador, superintendentes y miembros del CNE, TCE y Consejo de la Judicatura; investigar denuncias de corrupción y pasar los informes a Fiscalía o Contraloría; promover la participación ciudadana, la rendición de cuentas y las veedurías. No puede: juzgar ni sancionar (eso lo hacen jueces, Fiscalía y Contraloría), hacer leyes, hacer obras ni manejar seguridad, salud, educación o empleo.',
  viab: '    alta = es una función del CPCCS (designaciones, veedurías, rendición de cuentas, investigar y derivar denuncias); media = necesita a otra institución (Asamblea, Fiscalía, Contraloría) o un cambio de reglamento; baja = no le toca al CPCCS (sancionar, encarcelar, obras, leyes, temas sociales o económicos) o es irreal.',
};
const crit = CRITERIOS[BASE] ?? CRITERIOS[BASE.startsWith('concejal') ? 'concejal' : ''];
// Prefectura: los mismos temas que la de Pichincha (src/data/contexto.js); el resto, los temas locales
const TEMAS = BASE === 'prefecto'
  ? ['vial', 'riego', 'produccion', 'ambiente', 'turismo', 'social', 'seguridad', 'gobierno', 'otros']
  : ['movilidad', 'servicios', 'ambiente', 'urbano', 'seguridad', 'social', 'economia', 'gobierno', 'otros'];
const item = { type: 'object', properties: { t: { type: 'string' }, que: { type: 'string' }, v: { enum: ['alta', 'media', 'baja'] }, n: { type: 'string' }, cita: { type: 'string' } }, required: ['t', 'que', 'v', 'n', 'cita'] };
const SCHEMA = {
  type: 'object',
  properties: {
    enfoque: { type: 'string' },
    tabla: { type: 'object', properties: Object.fromEntries(TEMAS.map((t) => [t, { type: 'array', items: item }])), additionalProperties: false },
    metas: { type: 'array', items: { type: 'string' } },
    notas: { type: 'array', items: { type: 'string' } },
  },
  required: ['enfoque', 'tabla', 'metas', 'notas'],
};

const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/raw', `${slug}.json`), 'utf8'));
const cacheDir = path.join(ROOT, 'data/resumen', slug);
fs.mkdirSync(cacheDir, { recursive: true });
const cachePath = (cod) => path.join(cacheDir, `${cod}.json`);
const usoPath = path.join(ROOT, 'data/resumen/uso.jsonl');

// Resúmenes revisados a mano: no se tocan
const outDir = path.join(ROOT, PROV ? `src/data/provincias/${PROV}` : 'src/data/concejal');
fs.mkdirSync(outDir, { recursive: true });
const revisados = new Set();
for (const f of fs.existsSync(outDir) ? fs.readdirSync(outDir) : []) {
  if (PROV || !f.startsWith(slug + '-') || f.endsWith('-ia.json')) continue;
  for (const c of JSON.parse(fs.readFileSync(path.join(outDir, f), 'utf8')).candidatos) revisados.add(c.codFormulario);
}

// ---------- Texto y detección de planes copiados ----------
const MOJIBAKE = { '·': 'á', 'È': 'é', 'Ì': 'í', 'Û': 'ó', '˙': 'ú', 'Ò': 'ñ', '¡': 'Á', '…': 'É', 'Õ': 'Í', '”': 'Ó', '⁄': 'Ú', '—': 'Ñ', '¸': 'ü' };
const reparar = (t) => ((t.match(/[ÈÌÛ˙Ò]/g) || []).length < 5 ? t : t.replace(/[·ÈÌÛ˙Ò¡…Õ”⁄—¸]/g, (c) => MOJIBAKE[c] ?? c));
const texto = (cod) => {
  const p = path.join(ROOT, 'public/textos', slug, `${cod}.txt`);
  if (!fs.existsSync(p)) return null;
  return reparar(fs.readFileSync(p, 'utf8')).replace(/^\[OCR\]/, '').replace(/--- página (\d+) ---/g, '\n[p. $1]').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
};
const tejas = (t) => {
  const w = t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]+/g, ' ').split(/\s+/).filter((x) => x.length > 2);
  const s = new Set();
  for (let i = 0; i + 5 <= w.length; i += 2) s.add(w.slice(i, i + 5).join(' '));
  return s;
};
const parecido = (a, b) => { let n = 0; for (const x of a) if (b.has(x)) n++; return n / Math.max(1, Math.min(a.size, b.size)); };

// ---------- Llamada a claude -p ----------
const sysFile = path.join(os.tmpdir(), `resumir-${slug.replace("/", "-")}.md`);
fs.writeFileSync(sysFile, fs.readFileSync(path.join(ROOT, 'scripts/prompts/resumir.md'), 'utf8')
  .replace('{{DIGNIDAD}}', crit.dignidad).replace('{{COMPETENCIAS}}', crit.comp).replace('{{VIABILIDAD}}', crit.viab).replace('{{TEMAS}}', TEMAS.join(', ')));
const vacio = fs.mkdtempSync(path.join(os.tmpdir(), 'resumir-')); // sin CLAUDE.md ni AGENTS.md

function claude(entrada) {
  return new Promise((resolve) => {
    const p = spawn('claude', ['-p', '--model', MODELO, '--tools', '', '--strict-mcp-config', '--setting-sources', '',
      '--no-session-persistence', '--system-prompt-file', sysFile, '--json-schema', JSON.stringify(SCHEMA), '--output-format', 'json'],
      { cwd: vacio, stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '', err = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (err += d));
    p.on('close', () => { try { resolve(JSON.parse(out)); } catch { resolve({ is_error: true, result: (out + err).slice(0, 300) }); } });
    p.stdin.end(entrada);
  });
}

// Verificación: la cita debe estar en el texto del plan (tolerante a OCR, saltos de línea y viñetas)
const plano = (t) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9ñ]+/g, ' ').trim();
function ubicar(cita, t) {
  const w = plano(cita).split(' ').filter(Boolean);
  if (w.length < 4) return null;
  const doc = plano(t.replace(/\[p\. \d+\]/g, ' '));
  const n = w.length - 2; let ok = 0, primera = -1;
  for (let i = 0; i < n; i++) {
    const at = doc.indexOf(w.slice(i, i + 3).join(' '));
    if (at >= 0) { ok++; if (primera < 0) primera = at; }
  }
  if (ok / n < 0.8) return null;
  // Página: la última marca [p. N] antes de la posición encontrada
  const marcas = [...t.matchAll(/\[p\. (\d+)\]/g)].map((m) => ({ pos: plano(t.slice(0, m.index).replace(/\[p\. \d+\]/g, ' ')).length, pag: Number(m[1]) }));
  let pag = null; for (const m of marcas) if (m.pos <= primera) pag = m.pag;
  return { pag };
}
let descartadas = 0;
const limpio = (r, t) => {
  const tabla = {};
  for (const [k, v] of Object.entries(r.tabla ?? {})) {
    if (!TEMAS.includes(k) || !v?.length) continue;
    const ok = [];
    for (const x of v) {
      const u = x.t && x.v && x.cita ? ubicar(x.cita, t) : null;
      if (!u) { descartadas++; continue; }
      ok.push({ t: x.t, que: x.que, v: x.v, n: x.n, cita: x.cita.trim(), pag: u.pag });
    }
    if (ok.length) tabla[k] = ok;
  }
  return { enfoque: r.enfoque ?? '', tabla, metas: r.metas ?? [], notas: r.notas ?? [] };
};

// ---------- Corrida ----------
let gasto = 0, hechos = 0, parar = false;
if (!SOLO_COMPILAR) {
  const listos = []; // [{cod, tejas}] para detectar copias
  for (const r of raw) {
    if (!fs.existsSync(cachePath(r.codFormulario))) continue;
    const t = texto(r.codFormulario); if (t) listos.push({ cod: r.codFormulario, tj: tejas(t) });
  }
  const cola = raw.filter((r) => (!SOLO || String(r.codFormulario) === SOLO) && r.pdf && !revisados.has(r.codFormulario) && !fs.existsSync(cachePath(r.codFormulario)));
  console.log(`${slug}: ${cola.length} planes por resumir (${revisados.size} revisados a mano, modelo ${MODELO})`);

  const trabajar = async () => {
    while (cola.length && !parar && hechos < MAX) {
      const r = cola.shift();
      const t = texto(r.codFormulario);
      if (!t || t.length < 200) { console.log(`  ${r.codFormulario}  sin texto (falta extract/OCR)`); continue; }
      const tj = tejas(t);
      const copia = listos.find((l) => parecido(tj, l.tj) >= 0.85);
      if (copia) {
        const base = JSON.parse(fs.readFileSync(cachePath(copia.cod), 'utf8'));
        fs.writeFileSync(cachePath(r.codFormulario), JSON.stringify({ ...base, copiaDe: copia.cod, notas: [...base.notas, `Plan casi idéntico al del formulario ${copia.cod}.`] }, null, 1));
        listos.push({ cod: r.codFormulario, tj });
        console.log(`  ${r.codFormulario}  copia de ${copia.cod} (sin costo)`);
        continue;
      }
      hechos++;
      const sel = seleccionar(t, LIMITE);
      const entrada = `${BASE === 'cpccs' ? 'Lista' : BASE === 'prefecto' ? 'Provincia' : 'Cantón'}: ${r.canton ?? r.provincia}${r.sub ? ` · ${r.sub}` : ''}\nOrganización: ${r.partido} (lista ${r.lista})\nCandidatos: ${r.principales.map((p) => p.nombre).join(', ')}\n\nTEXTO DEL PLAN${sel.recortado ? ` (plan de ${sel.total} páginas; solo van las páginas con propuestas)` : ''}:\n${sel.texto}`;
      const res = await claude(entrada);
      const usd = res.total_cost_usd ?? 0; gasto += usd;
      fs.appendFileSync(usoPath, JSON.stringify({ fecha: new Date().toISOString(), slug, cod: r.codFormulario, modelo: MODELO, usd, entrada: res.usage?.input_tokens, cache: res.usage?.cache_read_input_tokens, salida: res.usage?.output_tokens, error: !!res.is_error }) + '\n');
      if (res.is_error || !res.structured_output) {
        console.log(`  ${r.codFormulario}  ERROR ${String(res.result ?? res.api_error_status).slice(0, 120)}`);
        if (/limit|rate|usage|quota|overloaded|529|429/i.test(String(res.result) + res.api_error_status)) { parar = true; console.log('  → límite de uso: me detengo. Reanuda luego con el mismo comando.'); }
        continue;
      }
      const antes = descartadas;
      const limpiado = limpio(res.structured_output, sel.texto);
      if (sel.recortado) limpiado.notas.push(`Plan muy largo (${sel.total} págs.): se resumieron las ${sel.leidas.length} páginas con propuestas.`);
      fs.writeFileSync(cachePath(r.codFormulario), JSON.stringify({ ...limpiado, modelo: MODELO, leidas: sel.leidas, paginas: sel.total }, null, 1));
      listos.push({ cod: r.codFormulario, tj });
      const n = Object.values(limpiado.tabla).flat().length;
      console.log(`  ${r.codFormulario}  ok  ${n} propuestas verificadas${descartadas > antes ? `, ${descartadas - antes} descartadas (cita no encontrada)` : ''}  $${usd.toFixed(4)}  (acumulado $${gasto.toFixed(3)})`);
      if (gasto >= TOPE) { parar = true; console.log(`  → llegué al tope de $${TOPE}: me detengo.`); }
    }
  };
  await Promise.all(Array.from({ length: PARALELO }, trabajar));
}

// ---------- Compilar para la página ----------
const porCanton = {};
for (const r of raw) {
  if (revisados.has(r.codFormulario) || !fs.existsSync(cachePath(r.codFormulario))) continue;
  const c = JSON.parse(fs.readFileSync(cachePath(r.codFormulario), 'utf8'));
  (porCanton[r.canton ?? "provincia"] ??= []).push({ codFormulario: r.codFormulario, ia: true, modelo: c.modelo, copiaDe: c.copiaDe, enfoque: c.enfoque, tabla: c.tabla, metas: c.metas, notas: c.notas });
}
for (const [canton, candidatos] of Object.entries(porCanton)) {
  fs.writeFileSync(path.join(outDir, PROV ? `${BASE}-${slugify(canton)}.json` : `${slug}-${slugify(canton)}-ia.json`), JSON.stringify({ canton, candidatos }, null, 2) + '\n');
}
const total = raw.filter((r) => r.pdf).length;
const resumidos = Object.values(porCanton).flat().length;
console.log(`\n${slug}: ${resumidos + revisados.size}/${total} con resumen (${revisados.size} revisados, ${resumidos} con IA). Gasto de esta corrida: $${gasto.toFixed(3)}`);
fs.rmSync(vacio, { recursive: true, force: true });
