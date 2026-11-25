// Elige las páginas de un plan que contienen propuestas (no diagnóstico ni índice) hasta un límite de caracteres.
// Sin IA: puntúa cada página por densidad de acciones y la penaliza por señales de diagnóstico.
// Prueba: node scripts/seccion.mjs public/textos/alcalde/2022.txt
import fs from 'fs';

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const ACCION = /^\s*(?:[•●▪◦➢➤✓✔§\-–*·]|\d{1,2}(?:\.\d{1,2})*[.)]?|[a-z][.)])?\s*(se\s+)?(construi|construc|crear|creacion|implement|ejecut|rehabilit|mejor|ampli|dotar|dotacion|instal|asfalt|adoquin|reform|ordenanza|fiscaliz|garantiz|promov|impuls|gestion|elabor|desarroll|fortalec|establec|regul|recuper|manten|capacit|program|proyecto|campana|feria|apoy|organiz|habilit|equip|digitaliz|moderniz|transparent|realizar|dar |entregar|brindar|atender|reduc|eliminar|abrir|lograr|plan )/;
const TITULO = /(plan\s+(de\s+)?trabajo\s+plurianual|propuestas?\s+y\s+estrategias|propuestas?\s+(de\s+trabajo|programaticas)|^\s*propuestas?\s*$|ejes?\s+(de\s+trabajo|estrategicos|programaticos|de\s+accion)|lineas?\s+de\s+accion|programas?\s+y\s+proyectos|plan\s+de\s+accion|metas?\s+(e\s+indicadores|estrategicas|de\s+gestion)|acciones\s+(concretas|a\s+ejecutar))/m;
const DIAG = /(diagnostic|censo|inec|habitantes|poblacion|tasa\s+de|indice\s+de|segun\s+(el|la|datos)|porcentaje|situacion\s+actual|caracteriz|km2|km²|hectareas\s+de\s+superficie)/g;

export function paginas(t) {
  const partes = t.split(/\[p\. (\d+)\]/);
  if (partes.length < 3) return [{ pag: null, texto: t }];
  const out = [];
  if (partes[0].trim()) out.push({ pag: 0, texto: partes[0] });
  for (let i = 1; i < partes.length; i += 2) out.push({ pag: Number(partes[i]), texto: partes[i + 1] ?? '' });
  return out;
}

function puntaje(texto) {
  const lineas = texto.split('\n').filter((l) => l.trim());
  if (!lineas.length) return -99;
  const n = norm(texto);
  const acc = lineas.filter((l) => ACCION.test(norm(l))).length;
  const diag = (n.match(DIAG) || []).length + (n.match(/\d+[.,]?\d*\s?%/g) || []).length * 0.5;
  const indice = (texto.match(/\.{5,}|\s\d{1,3}\s*$/gm) || []).length;
  const titulo = TITULO.test(n) ? 1 : 0;
  return (acc * 2 + titulo * 6 - diag * 0.7 - (indice > 4 ? 15 : 0)) / Math.sqrt(lineas.length);
}

// Devuelve { texto, recortado, leidas: [pags], total }
export function seleccionar(t, max) {
  const ps = paginas(t);
  const total = ps.filter((p) => p.pag).length;
  if (t.length <= max) return { texto: t, recortado: false, leidas: ps.map((p) => p.pag).filter(Boolean), total };
  const conPuntaje = ps.map((p, i) => ({ ...p, i, s: puntaje(p.texto) }));
  const elegidas = new Set();
  let usado = 0;
  for (const p of [...conPuntaje].sort((a, b) => b.s - a.s)) {
    if (p.s <= 0) break;
    const largo = p.texto.length + 10;
    if (usado + largo > max) continue;
    elegidas.add(p.i); usado += largo;
  }
  const orden = conPuntaje.filter((p) => elegidas.has(p.i));
  return {
    texto: orden.map((p) => (p.pag ? `[p. ${p.pag}]` : '') + p.texto).join('\n'),
    recortado: true,
    leidas: orden.map((p) => p.pag).filter(Boolean),
    total,
  };
}

// Resume una lista de páginas como "3-10, 14, 20-25"
export const rangos = (ps) => ps.reduce((a, p) => { const u = a[a.length - 1]; if (u && p === u[1] + 1) u[1] = p; else a.push([p, p]); return a; }, []).map(([a, b]) => (a === b ? `${a}` : `${a}-${b}`)).join(', ');

if (process.argv[1]?.endsWith('seccion.mjs')) {
  const t = fs.readFileSync(process.argv[2], 'utf8').replace(/--- página (\d+) ---/g, '\n[p. $1]');
  const r = seleccionar(t, Number(process.argv[3] ?? 60000));
  console.log(`${r.total} páginas, ${t.length} caracteres → ${r.leidas.length} páginas elegidas: ${rangos(r.leidas)}`);
}
