// Carga y normaliza los datos de todas las dignidades locales.
import { DIGNIDADES } from '../data/dignidades.js';

const rawFiles = import.meta.glob('../../data/raw/*.json', { eager: true, import: 'default' });
const genFiles = import.meta.glob('../data/gen/*.json', { eager: true, import: 'default' });
const alcaldeFiles = import.meta.glob('../data/alcalde/*.json', { eager: true, import: 'default' });

export const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export const titulo = (s) => s.toLowerCase().replace(/(^|[\s/(-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());

const raw = (slug) => rawFiles[`../../data/raw/${slug}.json`] ?? [];

function alcaldes() {
  const curado = {};
  for (const f of Object.values(alcaldeFiles)) for (const c of f.candidatos) curado[c.codFormulario] = c;
  const grupos = {};
  for (const r of raw('alcalde')) {
    const c = curado[r.codFormulario] ?? {};
    const nombre = r.principales[0]?.nombre ?? r.partido;
    (grupos[r.canton] ??= []).push({
      ...c,
      id: 'f' + r.codFormulario,
      lista: r.lista,
      partido: r.partido,
      titulo: nombre,
      personas: [{ nombre }],
      tabla: c.tabla ?? {},
      notas: [...(c.notas ?? []), ...(!r.pdf ? ['El CNE no publicó plan de trabajo para esta lista.'] : !c.tabla ? ['Resumen en preparación.'] : [])],
      pdf: r.pdf,
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
    const personas = r.principales.map((p) => ({ nombre: p.nombre, suplente: r.suplentes.find((s) => s.de === p.cod)?.nombre }));
    const base = {
      id, lista: r.lista, partido: r.partido,
      titulo: r.principales[0]?.nombre ?? r.partido,
      subtitulo: r.principales.length > 1 ? `y ${r.principales.length - 1} candidatos más` : null,
      personas, pdf: r.pdf, txt: r.pdf ? `/textos/${d.raw}/${r.codFormulario}.txt` : null, cne: r.fuente,
      canton: r.canton, sub: r.sub,
    };
    const fila = c
      ? { ...base, ...c, tabla: c.tabla ?? {}, auto: false }
      : { ...base, ...(a ?? {}), ...base, tabla: a?.tabla ?? {}, auto: true, notas: [...(a?.notas ?? []), ...(!r.pdf ? ['El CNE no publicó plan de trabajo para esta lista.'] : ['Resumen revisado en preparación; se muestra la clasificación automática.'])] };
    (grupos[r.sub ? `${r.canton}|${r.sub}` : r.canton] ??= []).push(fila);
  }
  return grupos;
}

// Devuelve { clave: [candidatos] } donde clave = cantón o "cantón|sub"
export function grupos(d) {
  if (d.slug === 'alcaldia') return alcaldes();
  if (d.slug.startsWith('concejo') || d.slug === 'circunscripcion') return concejales(d);
  return genFiles[`../data/gen/${d.raw}.json`] ?? {};
}

// Territorios navegables de una dignidad: [{ canton, sub, path, n }]
export function territorios(d) {
  return Object.entries(grupos(d))
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
