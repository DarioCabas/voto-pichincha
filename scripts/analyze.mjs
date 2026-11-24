// Análisis automático de planes (concejales y vocales parroquiales).
// Lee data/raw/<raw>.json + public/textos/<raw>/<cod>.txt → src/data/gen/<raw>.json
// Uso: node scripts/analyze.mjs <raw-slug>
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const slug = process.argv[2];
const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/raw', `${slug}.json`), 'utf8'));
const esJunta = slug === 'vocal-parroquial';
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// ---------- 1. Extracción de propuestas ----------

// Arregla texto con acentos mal decodificados (Windows-1252 leído como MacRoman)
const MOJIBAKE = { '·': 'á', 'È': 'é', 'Ì': 'í', 'Û': 'ó', '˙': 'ú', 'Ò': 'ñ', '¡': 'Á', '…': 'É', 'Õ': 'Í', '”': 'Ó', '⁄': 'Ú', '—': 'Ñ', '¸': 'ü' };
export function reparar(t) {
  const malas = (t.match(/[ÈÌÛ˙Ò]/g) || []).length;
  if (malas < 5) return t;
  return t.replace(/[·ÈÌÛ˙Ò¡…Õ”⁄—¸]/g, (c) => MOJIBAKE[c] ?? c);
}

// Una propuesta empieza con un verbo de acción (infinitivo, futuro o "se + verbo") o con un sustantivo de acción.
const INICIO = /^(se\s+)?(impuls|gestion|promov|promuev|crea|crear|implement|fiscaliz|present|propon|constru|mejor|fortalec|desarroll|garantiz|elabor|ejecut|realiz|apoy|coordin|establec|foment|reform|expedi|expid|legisl|manten|rehabilit|dota|dotar|ampli|capacit|incentiv|vigil|control|prioriz|articul|socializ|organiz|regul|aprob|instal|adecu|recuper|asfalt|adoquin|equipa|habilit|proteg|conserv|difund|transparent|digitaliz|reactiv|moderniz|planific|asegur|propici|contribu|velar|exig|solicit|canaliz|potenci|optimiz|reduc|erradic|preven|atend|brind|ofrec|construy|lider|acompa|monitor|evalu|actualiz|trabaj|abrir|abrire|dar |daremos|lograr|buscar|busca|consolid|recuper|revis|analiz|sanci|proyect|dise[nñ]|integr|vincul|celebr|suscrib|firm|particip|convoc|realizar|declar|exonerar|reduc|simplific|elimin|defend|respald|acerc|llev|ubic|institucionaliz|construcci|creaci|implementaci|fortalecimiento|mejoramiento|gestion|promocion|elaboracion|fiscalizacion|actualizacion|reforma |programa |proyecto |plan |dotacion|ampliacion|rehabilitacion|mantenimiento|capacitacion|impulso|apoyo|desarrollo|regulacion|ordenanza|instalacion|recuperacion|adecuacion|asfaltado|adoquinado|regeneracion|campana|campañas|campañ|red |sistema |centro |escuela |feria|mesa)/;
const BULLET = /^\s*([•●▪◦➢➤✓✔§\-–\*·o]|\d{1,2}[.)]|[a-zñ][.)]|(x\s+){1,6}\d*)\s*/i;

function propuestasDe(texto) {
  const t = reparar(texto).replace(/\r/g, '').replace(/^\[OCR\]/, '').replace(/--- página \d+ ---/g, '\n');
  // Misma longitud que t (para que los índices coincidan) y tolerante a saltos de línea en títulos
  const nt = t.toLowerCase().replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e').replace(/[íìï]/g, 'i').replace(/[óòö]/g, 'o').replace(/[úùü]/g, 'u').replace(/ñ/g, 'n');
  const esIndice = (i) => /\.{4,}|\s\d{1,3}\s*$/m.test(nt.slice(i, i + 140).split('\n').slice(0, 2).join('\n')) || i < nt.length * 0.06;
  const finIdx = (() => { const m = [...nt.matchAll(/mecanismos?\s+(periodicos|de\s+rendicion)|rendicion\s+de\s+cuentas/g)].map((m) => m.index).filter((i) => !esIndice(i)); return m.length ? m[m.length - 1] : nt.length; })();
  const objIdx = [...nt.matchAll(/objetivos?\s+(general|especificos?)/g)].map((m) => m.index).find((i) => !esIndice(i));
  const planIdx = [...nt.matchAll(/plan\s+(de\s+)?trabajo\s+plurianual|propuestas?\s+y\s+estrategias|propuestas?\s+(de\s+trabajo|programaticas)|ejes?\s+(de\s+trabajo|estrategicos|programaticos)|lineas?\s+de\s+accion|programa\s+de\s+gobierno|matriz\s+de\s+propuestas/g)]
    .map((m) => m.index).find((i) => !esIndice(i) && i < finIdx && (objIdx == null || i > objIdx));
  let ini = planIdx ?? objIdx ?? 0;
  if (finIdx - ini < 300) ini = objIdx ?? 0;
  const seccion = t.slice(ini, finIdx > ini ? finIdx : t.length);

  // Unir líneas partidas en ítems
  const items = [];
  let cur = '';
  const lineas = seccion.split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const freq = {};
  for (const l of lineas) freq[l] = (freq[l] ?? 0) + 1;
  for (const linea of lineas.filter((l) => !(freq[l] >= 3 && l.length > 12) && !/\bp[aá]g(ina)?\.?\s*\d+\s*(de\s*\d+)?$/i.test(l))) {
    const sigue = /(,|\b(y|e|o|u|de|del|la|el|los|las|con|para|en|a|al|que|por|sus|su|un|una))$/i.test(cur);
    const nuevo = !sigue && (BULLET.test(linea) || /[.:;]$/.test(cur) || (/^[A-ZÁÉÍÓÚÑ]/.test(linea) && cur.length > 140) || (INICIO.test(norm(linea)) && /^[A-ZÁÉÍÓÚÑ]/.test(linea)));
    if (nuevo && cur) { items.push(cur); cur = ''; }
    cur = cur ? `${cur} ${linea}` : linea;
  }
  if (cur) items.push(cur);

  const out = [];
  const vistos = new Set();
  for (let it of items.flatMap((x) => (x.length > 420 ? x.split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚÑ])/) : [x]))) {
    it = it.replace(BULLET, '').replace(/^(\d+\s+)+/, '').replace(/\s+/g, ' ').trim();
    const n = norm(it);
    const digitos = (it.match(/\d/g) || []).length / it.length;
    if (it.length < 25 || it.length > 480) continue;
    if (!INICIO.test(n)) continue;
    if (digitos > 0.12 || /\binec\b|fuente:|elaboracion propia|\.{4,}|^plan de trabajo plurianual de acuerdo/.test(n)) continue;
    if ((it === it.toUpperCase() && it.length < 90) || (/:$/.test(it) && it.length < 90)) continue;
    const k = n.replace(/[^a-z]/g, '').slice(0, 70);
    if (vistos.has(k)) continue;
    vistos.add(k);
    out.push(it.replace(/^[a-z]/, (c) => c.toUpperCase()));
  }
  return out;
}

function objetivosDe(texto) {
  const t = reparar(texto).replace(/--- página \d+ ---/g, ' ').replace(/\s+/g, ' ');
  const m = norm(t).match(/objetivo general[:\s]*/);
  if (!m) return [];
  const frag = t.slice(m.index + m[0].length, m.index + m[0].length + 600);
  const s = frag.split(/(?<=\.)\s/)[0].trim();
  return s.length > 30 ? [s] : [];
}

// ---------- 2. Tema ----------
const TEMAS = {
  movilidad: /\b(vial|vias?\b|calle|asfalt|adoquin|bache|transit|transporte|movilidad|semaforo|ciclovia|puente|acera|metro|trole|parqueadero|lastr|camino|bus)/,
  servicios: /(agua potable|alcantarill|saneamiento|alumbrado|energia electrica|luz electrica|internet|conectividad|servicios basicos|agua segura|aguas servidas|tratamiento de agua)/,
  ambiente: /(ambient|residuo|basura|recicl|arbol|forest|quebrada|\brio|contamina|fauna|animal|area verde|clima|paramo|cuenca|biodivers)/,
  urbano: /(parque|espacio publico|espacios publicos|mercado|casa comunal|cancha|infraestructura|\bobra|vivienda|catastro|uso de suelo|uso del suelo|regenera|plaza|cementerio|equipamiento|coliseo|estadio|legaliz|escritur)/,
  seguridad: /(segur|policia|delincuen|delito|camara|alarma|riesgo|emergencia|bombero|\bupc\b|violencia|desastre)/,
  social: /(salud|educa|escuela|colegio|deport|cultur|adulto mayor|adultos mayores|discapac|ninez|niños|ninos|juvent|jovenes|mujer|inclus|grupos de atencion|grupos prioritarios|aliment|nutric|arte|recreac|familia)/,
  economia: /(empleo|emprend|turis|product|agric|ganad|comercio|feria|econom|artesan|capacit|agro|riego|cooperativ|microcredito|negocio)/,
  gobierno: /(tribut|impuesto|tasas|transpar|participa|rendicion|fiscaliz|presupuesto|gestion|digital|tramite|corrupc|silla vacia|asamblea|ordenanza|control social|veedur|planificacion|planificar)/,
};
function temaDe(n) {
  let best = 'otros', score = 0;
  for (const [k, re] of Object.entries(TEMAS)) {
    const s = (n.match(new RegExp(re.source, 'g')) || []).length;
    if (s > score) { best = k; score = s; }
  }
  return best;
}

// ---------- 3. Viabilidad por reglas de competencia ----------
const NORMATIVO = /(ordenanza|resolucion|fiscaliz|legisl|reforma|normativ|seguimiento|proyecto de ley|vigil|control social|rendicion|veedur|silla vacia|aprobar|presupuesto participativo|transparen)/;
const GESTION = /(gestion|impuls|promov|promuev|coordin|articul|apoy|foment|propici|canaliz|solicit|exig|velar|incentiv|socializ|convenio|alianza)/;
const EJECUTA = /\b(construir|construccion de|construiremos|asfaltar|asfaltado de|adoquinar|adoquinado de|instalar|instalacion de|dotar|dotacion de|entregar|entrega de|edificar|equipar|implementar (un|una) (centro|hospital|universidad|colegio|upc))\b/;
const AJENO_JUNTA = /(hospital|centro de salud|subcentro|universidad|colegio|unidad educativa|\bupc\b|policia|agua potable|alcantarill|luz electrica|energia electrica|recoleccion de basura|transporte publico)/;
const AJENO_MUNI = /(hospital|universidad|colegio|unidad educativa|policia nacional|\bupc\b|cedula|registro civil|sri\b|iess)/;

function viabilidad(t) {
  const n = norm(t);
  if (esJunta) {
    if (AJENO_JUNTA.test(n) && !GESTION.test(n)) return { v: 'baja', n: 'Es competencia de otro nivel (municipio o Gobierno nacional). La junta parroquial no puede ejecutarlo; solo gestionarlo (COOTAD art. 65).' };
    if (AJENO_JUNTA.test(n)) return { v: 'media', n: 'Tema de otro nivel de gobierno, pero planteado como gestión ante la entidad competente.' };
    if (/(seguridad|riesgo|emergencia)/.test(n)) return { v: 'media', n: 'La junta solo puede coordinar y prevenir; la seguridad es nacional y municipal.' };
    if (/(vial|vias?\b|camino|lastr|asfalt|adoquin|puente)/.test(n)) return { v: 'media', n: 'Vialidad parroquial: competencia compartida con la Prefectura; depende de convenios y presupuesto (art. 65 c).' };
    if (GESTION.test(n) && !/(espacio|parque|cancha|casa comunal|feria|cultur|deport|organiz|ambient)/.test(n)) return { v: 'media', n: 'Depende de la gestión ante otras instituciones o de convenios.' };
    return { v: 'alta', n: 'Dentro de las competencias parroquiales: espacios públicos, actividades productivas comunitarias, ambiente u organización ciudadana (art. 65).' };
  }
  // Concejales: legislan y fiscalizan, no ejecutan (COOTAD art. 58)
  if (AJENO_MUNI.test(n) && !NORMATIVO.test(n)) return { v: 'baja', n: 'Es competencia del Gobierno nacional, no del municipio; un concejal no puede resolverlo.' };
  if (NORMATIVO.test(n)) return { v: 'alta', n: 'Presentar ordenanzas, fiscalizar o vigilar es función directa del concejal (COOTAD art. 58).' };
  if (EJECUTA.test(n) && !GESTION.test(n)) return { v: 'baja', n: 'Plantea ejecutar una obra o entregar algo directamente; el concejal no ejecuta. Solo puede legislar, fiscalizar o impulsarlo en el presupuesto.' };
  return { v: 'media', n: 'Puede impulsarlo con ordenanzas o en el presupuesto municipal, pero la ejecución depende del alcalde.' };
}

// ---------- 4. Ensamblado ----------
const grupos = {};
let sinTexto = 0;
for (const r of raw) {
  const txtFile = r.pdf ? path.join(ROOT, 'public/textos', slug, `${r.codFormulario}.txt`) : null;
  const texto = txtFile && fs.existsSync(txtFile) ? fs.readFileSync(txtFile, 'utf8') : '';
  if (!texto) sinTexto++;
  const props = texto ? propuestasDe(texto).map((t) => ({ t, tema: temaDe(norm(t)), ...viabilidad(t) })) : [];
  const tabla = {};
  for (const p of props) (tabla[p.tema] ??= []).push({ t: p.t, v: p.v, n: p.n });
  const ocr = texto.startsWith('[OCR]');
  const key = r.sub ? `${r.canton}|${r.sub}` : r.canton;
  const personas = r.principales.sort((a, b) => a.orden - b.orden).map((p) => ({ nombre: p.nombre, suplente: r.suplentes.find((s) => s.de === p.cod)?.nombre }));
  (grupos[key] ??= []).push({
    id: 'f' + r.codFormulario,
    lista: r.lista,
    partido: r.partido,
    titulo: personas[0]?.nombre ?? r.partido,
    subtitulo: personas.length > 1 ? `y ${personas.length - 1} candidato${personas.length > 2 ? 's' : ''} más` : null,
    personas,
    tabla,
    propuestas: props.map((p) => ({ t: p.t, tema: p.tema, v: p.v })),
    objetivos: texto ? objetivosDe(texto) : [],
    notas: !r.pdf ? ['El CNE no publicó plan de trabajo para esta lista.'] : !texto ? ['Texto aún no extraído.'] : props.length === 0 ? ['No se identificaron propuestas automáticamente; revisa el PDF o el texto completo.'] : [],
    pdf: r.pdf,
    txt: texto ? `/textos/${slug}/${r.codFormulario}.txt` : null,
    cne: r.fuente,
    extraccion: ocr ? 'ocr' : 'texto',
    canton: r.canton,
    sub: r.sub,
  });
}
fs.mkdirSync(path.join(ROOT, 'src/data/gen'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'src/data/gen', `${slug}.json`), JSON.stringify(grupos));
const total = raw.length, props = Object.values(grupos).flat().reduce((a, c) => a + c.propuestas.length, 0);
const vacios = Object.values(grupos).flat().filter((c) => c.pdf && c.propuestas.length === 0).length;
console.log(`${slug}: ${total} listas en ${Object.keys(grupos).length} territorios · ${props} propuestas · ${vacios} planes sin propuestas detectadas · ${sinTexto} sin texto`);
