// Carga y normaliza los datos de todas las dignidades locales.
import { DIGNIDADES, provPath } from '../data/dignidades.js';
import VERIFICACIONES from '../data/verificaciones.json';

const rawFiles = import.meta.glob(['../../data/raw/*.json', '../../data/raw/*/*.json'], { eager: true, import: 'default' });
const genFiles = import.meta.glob('../data/gen/*.json', { eager: true, import: 'default' });
const alcaldeFiles = import.meta.glob('../data/alcalde/*.json', { eager: true, import: 'default' });

export const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
// El CNE publica los nombres en mayúsculas y sin tildes; estos son los nombres oficiales para mostrar.
const NOMBRES = {
  'A.BAQUERIZO MORENO': 'Alfredo Baquerizo Moreno', ALANGASI: 'Alangasí', ALOAG: 'Alóag', ALOASI: 'Aloasí', ASCAZUBI: 'Ascázubi',
  'ATAHUALPA /HABASPAMBA': 'Atahualpa (Habaspamba)', CALACALI: 'Calacalí', CALDERON: 'Calderón', 'CAMILO PONCE ENRIQUEZ': 'Camilo Ponce Enríquez',
  CHAUPI: 'El Chaupi', 'CIRCUNSCRIPCION URBANA 1': 'Circunscripción urbana 1', 'CIRCUNSCRIPCION URBANA 2': 'Circunscripción urbana 2',
  'CIRCUNSCRIPCION URBANA 3': 'Circunscripción urbana 3', 'CORNEJO ASTORGA /TANDAPI': 'Manuel Cornejo Astorga (Tandapi)',
  'CRNL MARCELINO MARIDUENAS': 'Coronel Marcelino Maridueña', CUMBAYA: 'Cumbayá', DURAN: 'Durán', GIRON: 'Girón',
  'GRAL. A. ELIZALDE': 'General Antonio Elizalde', 'LA MANA': 'La Maná', MALCHINGUI: 'Malchinguí', MEJIA: 'Mejía', NABON: 'Nabón',
  NAYON: 'Nayón', 'NOBOL / PIEDRAHITA': 'Nobol', 'OLMEDO/PESILLO': 'Olmedo (Pesillo)', OTON: 'Otón', PINTAG: 'Píntag', PUCARA: 'Pucará',
  PUJILI: 'Pujilí', QUINCHE: 'El Quinche', SAMBORONDON: 'Samborondón', 'SAN JOSE DE AYORA': 'San José de Ayora',
  'SAN JOSE DE MINAS': 'San José de Minas', 'SANTA LUCIA': 'Santa Lucía', SAQUISILI: 'Saquisilí', SIGSIG: 'Sígsig',
  'SIMON BOLIVAR': 'Simón Bolívar', 'STA.ROSA DE CUSUBAMBA': 'Santa Rosa de Cuzubamba', YARUQUI: 'Yaruquí', ZAMBIZA: 'Zámbiza',
};
// "SAN MIGUEL DE LOS BANCOS" → "San Miguel de los Bancos"; también para nombres de personas
export const titulo = (s) =>
  NOMBRES[s] ??
  s.toLowerCase().replace(/(^|[\s/(-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()).replace(/ (De|Del|La|Las|Los|Y)(?= )/g, (m, w) => ' ' + w.toLowerCase());

const raw = (slug) => rawFiles[`../../data/raw/${slug}.json`] ?? [];
// Resúmenes de otras provincias (scripts/resumir.mjs <prov>/<raw>): src/data/provincias/<prov>/<raw>-<canton>.json
const provFiles = import.meta.glob('../data/provincias/*/*.json', { eager: true, import: 'default' });
const nombreSuplente = (r, p) => { const s = r.suplentes?.find((x) => x.de === p.cod)?.nombre; return s ? titulo(s) : undefined; };
// Verificaciones de Ecuador Chequea y Lupa Media (src/data/verificaciones.json), por "<raw>:<codFormulario>" o "prefecto:<lista>"
const VERIF = {};
for (const v of VERIFICACIONES) (VERIF[v.clave] ??= []).push(v);
export const verificacionesDe = (clave) => VERIF[clave] ?? [];
const notaIA = 'Resumen hecho con IA a partir del plan, sin revisión humana. Revisa el PDF ante cualquier duda.';
const notaSinPlan = (r) => (r.planArchivo ? 'El plan está publicado en el CNE pero su servidor no lo entregó; ábrelo desde el enlace del CNE.' : 'El CNE no publicó plan de trabajo para esta lista.');

// Alcaldías (y en el futuro otras dignidades) de provincias distintas de Pichincha
function deProvincia(d, prov) {
  const curado = {};
  for (const [ruta, f] of Object.entries(provFiles)) {
    if (!ruta.startsWith(`../data/provincias/${prov}/${d.raw}-`)) continue;
    for (const c of f.candidatos) curado[c.codFormulario] = c;
  }
  const grupos = {};
  for (const r of raw(`${prov}/${d.raw}`)) {
    const c = curado[r.codFormulario];
    const personas = r.principales.map((p) => ({ nombre: titulo(p.nombre), suplente: nombreSuplente(r, p) }));
    (grupos[r.sub ? `${r.canton}|${r.sub}` : r.canton] ??= []).push({
      ...(c ?? {}),
      id: 'f' + r.codFormulario,
      lista: r.lista,
      partido: r.partido,
      titulo: personas[0]?.nombre ?? r.partido,
      subtitulo: r.principales.length > 1 ? `y ${r.principales.length - 1} candidatos más` : null,
      personas,
      tabla: c?.tabla ?? {},
      auto: !!c?.ia,
      notas: [...(c?.notas ?? []), ...(c?.ia ? [notaIA] : []), ...(!r.pdf ? [notaSinPlan(r)] : !c ? ['Resumen en preparación.'] : [])],
      pdf: r.pdf,
      txt: r.pdf ? `/textos/${prov}/${d.raw}/${r.codFormulario}.txt` : null,
      verif: verificacionesDe(`${prov}/${d.raw}:${r.codFormulario}`),
      cne: r.fuente,
      canton: r.canton,
      sub: r.sub,
    });
  }
  return grupos;
}

function alcaldes() {
  const curado = {};
  for (const f of Object.values(alcaldeFiles)) for (const c of f.candidatos) curado[c.codFormulario] = c;
  const grupos = {};
  for (const r of raw('alcalde')) {
    const c = curado[r.codFormulario] ?? {};
    const nombre = titulo(r.principales[0]?.nombre ?? r.partido);
    (grupos[r.canton] ??= []).push({
      ...c,
      id: 'f' + r.codFormulario,
      lista: r.lista,
      partido: r.partido,
      titulo: nombre,
      personas: [{ nombre }],
      tabla: c.tabla ?? {},
      notas: [...(c.notas ?? []), ...(!r.pdf ? [notaSinPlan(r)] : !c.tabla ? ['Resumen en preparación.'] : [])],
      pdf: r.pdf,
      verif: verificacionesDe(`alcalde:${r.codFormulario}`),
      txt: r.pdf ? `/textos/alcalde/${r.codFormulario}.txt` : null,
      cne: r.fuente,
      canton: r.canton,
    });
  }
  return grupos;
}

// Concejales: lista base del CNE (data/raw) + resumen revisado (src/data/concejal/<raw>-*.json).
// Si una lista no tiene resumen revisado, se usa el análisis automático (src/data/gen) y se marca auto: true.
const concejalFiles = import.meta.glob('../data/concejal/*.json', { eager: true, import: 'default' });

function concejales(d) {
  const curado = {};
  for (const [ruta, f] of Object.entries(concejalFiles)) {
    if (!ruta.split('/').pop().startsWith(d.raw + '-')) continue;
    for (const c of f.candidatos) curado[c.codFormulario] = c;
  }
  const auto = {};
  for (const cands of Object.values(genFiles[`../data/gen/${d.raw}.json`] ?? {})) for (const c of cands) auto[c.id] = c;
  const grupos = {};
  for (const r of raw(d.raw)) {
    const id = 'f' + r.codFormulario;
    const c = curado[r.codFormulario];
    const a = auto[id];
    const personas = r.principales.map((p) => ({ nombre: titulo(p.nombre), suplente: nombreSuplente(r, p) }));
    const base = {
      id, lista: r.lista, partido: r.partido,
      titulo: personas[0]?.nombre ?? r.partido,
      subtitulo: r.principales.length > 1 ? `y ${r.principales.length - 1} candidatos más` : null,
      personas, pdf: r.pdf, txt: r.pdf ? `/textos/${d.raw}/${r.codFormulario}.txt` : null, cne: r.fuente,
      verif: verificacionesDe(`${d.raw}:${r.codFormulario}`),
      canton: r.canton, sub: r.sub,
    };
    const fila = c
      ? { ...base, ...c, tabla: c.tabla ?? {}, auto: !!c.ia, notas: [...(c.notas ?? []), ...(c.ia ? [notaIA] : [])] }
      : { ...base, ...(a ?? {}), ...base, tabla: a?.tabla ?? {}, auto: true, notas: [...(a?.notas ?? []), ...(!r.pdf ? [notaSinPlan(r)] : ['Resumen revisado en preparación; se muestra la clasificación automática.'])] };
    (grupos[r.sub ? `${r.canton}|${r.sub}` : r.canton] ??= []).push(fila);
  }
  return grupos;
}

// Devuelve { clave: [candidatos] } donde clave = cantón o "cantón|sub"
export function grupos(d, prov = 'pichincha') {
  if (prov !== 'pichincha') return deProvincia(d, prov);
  if (d.slug === 'alcaldia') return alcaldes();
  if (d.slug.startsWith('concejo') || d.slug === 'circunscripcion' || d.slug === 'junta-parroquial') return concejales(d);
  return genFiles[`../data/gen/${d.raw}.json`] ?? {};
}

// Territorios navegables de una dignidad: [{ canton, sub, path, n }]
export function territorios(d, prov = 'pichincha') {
  return Object.entries(grupos(d, prov))
    .map(([k, cands]) => {
      const [canton, sub] = k.split('|');
      return { canton, sub: sub ?? null, path: sub ? `${slugify(canton)}/${slugify(sub)}` : slugify(canton), n: cands.length, cands };
    })
    .sort((a, b) => a.canton.localeCompare(b.canton) || (a.sub ?? '').localeCompare(b.sub ?? ''));
}

// Contexto público por cantón (presupuesto municipal, obras clave) escrito junto al resumen de alcaldes
export function contextoCanton(canton) {
  return Object.values(alcaldeFiles).filter((f) => f.canton === canton).flatMap((f) => f.contexto ?? []);
}

export const dignidadesLocales = DIGNIDADES.filter((d) => d.slug !== 'prefectura');

// Dignidades publicadas en una provincia: Pichincha tiene todas; las demás, las que tengan data/raw/<prov>/<raw>.json
export const dignidadesDe = (prov) =>
  prov === 'pichincha' ? DIGNIDADES : DIGNIDADES.filter((d) => rawFiles[`../../data/raw/${prov}/${d.raw}.json`]);

// Rutas estáticas de las páginas de dignidad de una provincia (ver src/components/PaginaDignidad.astro)
export function rutasDignidad(prov) {
  const paths = [];
  for (const d of dignidadesDe(prov).filter((x) => x.slug !== 'prefectura')) {
    const ts = territorios(d, prov);
    paths.push({ params: { dign: d.slug, terr: undefined }, props: { d, ts, t: null, prov } });
    for (const t of ts) paths.push({ params: { dign: d.slug, terr: t.path }, props: { d, ts, t, prov } });
    // Página intermedia por cantón cuando hay subterritorios
    if (d.territorio === 'sub') {
      for (const canton of [...new Set(ts.map((t) => t.canton))]) {
        const c = ts.find((t) => t.canton === canton).path.split('/')[0];
        paths.push({ params: { dign: d.slug, terr: c }, props: { d, ts, t: null, canton, prov } });
      }
    }
  }
  return paths;
}

// Datos de la candidatura dueña de un plan (para /plan/...): busca el PDF en todos los data/raw
export function fichaPlan(pdf) {
  for (const [ruta, lista] of Object.entries(rawFiles)) {
    const slug = ruta.replace('../../data/raw/', '').replace('.json', '');
    // prefecto.json guarda solo el nombre del archivo; el resto, la ruta completa
    const r = lista.find?.((x) => x.pdf && (x.pdf === pdf || `/planes/${slug}/${x.pdf}` === pdf));
    if (!r) continue;
    const prov = slug.includes('/') ? slug.split('/')[0] : 'pichincha';
    const d = DIGNIDADES.find((x) => x.raw === slug.split('/').pop());
    const terr = !r.canton ? '' : r.sub ? `${slugify(r.canton)}/${slugify(r.sub)}` : slugify(r.canton);
    const volver = d.slug === 'prefectura' ? `/prefectura/#f-l${r.lista.replace(/\W/g, '')}` : `${provPath(prov)}/${d.slug}/${terr}/#f-f${r.codFormulario}`;
    const lugar = d.slug === 'prefectura' ? 'Pichincha' : r.sub ? `${titulo(r.sub)}, ${titulo(r.canton)}` : titulo(r.canton);
    // prefecto.json trae los nombres como texto; las demás dignidades, como objetos
    return { r, d, prov, volver, lugar, nombres: r.principales.map((p) => titulo(p.nombre ?? p)) };
  }
  return null;
}
