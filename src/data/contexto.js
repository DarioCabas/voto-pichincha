// Datos públicos usados para contrastar la viabilidad de las propuestas.
// Cada dato tiene su fuente. Revisado el 22-nov-2026.

export const temas = [
  { id: 'vial', nombre: 'Vialidad y conectividad', competencia: 'Exclusiva provincial (COOTAD art. 42 b) en zona rural; las vías urbanas son municipales.' },
  { id: 'riego', nombre: 'Riego y agua', competencia: 'Exclusiva provincial (COOTAD art. 42 e), en coordinación con la autoridad del agua.' },
  { id: 'produccion', nombre: 'Producción y empleo', competencia: 'Exclusiva provincial: fomento agropecuario y productivo (COOTAD art. 42 f, g).' },
  { id: 'ambiente', nombre: 'Ambiente y cuencas', competencia: 'Exclusiva provincial: gestión ambiental y obras en cuencas (COOTAD art. 42 c, d).' },
  { id: 'turismo', nombre: 'Turismo y cultura', competencia: 'Concurrente: fomento turístico y cultural con otros niveles de gobierno.' },
  { id: 'social', nombre: 'Social, salud e inclusión', competencia: 'Función provincial de protección a grupos prioritarios (COOTAD art. 41). Salud y educación son nacionales.' },
  { id: 'seguridad', nombre: 'Seguridad y riesgos', competencia: 'La seguridad ciudadana es nacional; la Prefectura solo coordina. Riesgos: obras de prevención en vías y cuencas.' },
  { id: 'gobierno', nombre: 'Gobierno abierto y participación', competencia: 'Propia de la gestión del GAD: transparencia, participación y cooperación internacional (COOTAD art. 42 h).' },
  { id: 'otros', nombre: 'Otros (fuera del núcleo provincial)', competencia: 'Temas como residuos, fauna urbana, vivienda o transporte son de otros niveles; requieren convenios.' },
];

export const escala = {
  alta: { label: 'Alta', desc: 'Competencia propia de la Prefectura y escala compatible con su presupuesto.' },
  media: { label: 'Media', desc: 'Depende de convenios con otros niveles, de crédito o cooperación, o la meta es ambiciosa frente a la línea base.' },
  baja: { label: 'Baja', desc: 'Fuera de la competencia provincial sin mecanismo claro, o monto desproporcionado frente al presupuesto.' },
};

export const datos = [
  {
    titulo: 'Presupuesto Prefectura 2025',
    valor: 'USD 207,8 M',
    detalle: '45 % transferencias del Gobierno (USD 94,5 M), 30 % ingresos propios, 18 % créditos. Avanza cita un PAI aproximado de USD 122 M al año.',
    fuente: 'Expreso / Primicias',
    url: 'https://www.expreso.ec/actualidad/pichincha-invertira-60-millones-vialidad-229026.html',
  },
  {
    titulo: 'Reforma COOTAD 2026',
    valor: '≥ 65 % → 70 % a inversión',
    detalle: 'Publicada en el R.O. el 23-feb-2026. Obliga a destinar al menos 65 % del gasto no financiero a inversión en 2026 y 70 % hacia 2028. Los programas sociales quedan fuera del cálculo, lo que presiona las propuestas sociales. Hay demandas en la Corte Constitucional.',
    fuente: 'El Comercio / El Mercurio',
    url: 'https://www.elcomercio.com/actualidad/ecuador/cootad-registro-oficial-cambia-destino-gasto-municipios-prefecturas/',
  },
  {
    titulo: 'Vías delegadas por el MTOP',
    valor: 'Alóag–Unión del Toachi y Calacalí–Río Blanco',
    detalle: 'El MTOP delegó a la Prefectura la administración de ambas vías en 2017, con facultad para cobrar peajes. Las propuestas sobre ellas sí están dentro del alcance provincial.',
    fuente: 'El Universo',
    url: 'https://www.eluniverso.com/noticias/2017/12/15/nota/6526618/mtop-entregavia-prefectura',
  },
  {
    titulo: 'Solución Vial Bicentenario',
    valor: 'USD 230 M (APP, 30 años)',
    detalle: 'Concurso abierto por la Prefectura en nov-2026. El ganador operaría el peaje de la Autopista General Rumiñahui por 30 años para recuperar la inversión.',
    fuente: 'Expreso / Primicias',
    url: 'https://www.expreso.ec/quito/solucion-vial-bicentenario-pichincha-abre-concurso-350-millones-292995.html',
  },
  {
    titulo: 'Deuda del Gobierno con los GAD',
    valor: '≈ USD 1.500 M (todos los GAD)',
    detalle: 'Cifra citada por la prefecta saliente para todos los gobiernos locales. Los retrasos en transferencias afectan cualquier plan financiado con recursos del Estado.',
    fuente: 'Expreso',
    url: 'https://www.expreso.ec/quito/prefectura-pichincha-aplicara-recortes-personal-cumplir-reformas-cootad-291089.html',
  },
];
