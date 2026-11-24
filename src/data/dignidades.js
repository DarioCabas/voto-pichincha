// Catálogo de dignidades, temas y reglas de competencia (COOTAD) usados en todo el sitio.

export const DIGNIDADES = [
  { slug: 'prefectura', raw: 'prefecto', nombre: 'Prefectura', cargo: 'Prefecto/a', territorio: null, modo: 'curado' },
  { slug: 'alcaldia', raw: 'alcalde', nombre: 'Alcaldías', cargo: 'Alcalde/sa', territorio: 'canton', modo: 'curado' },
  { slug: 'concejo-urbano', raw: 'concejal-urbano', nombre: 'Concejo urbano', cargo: 'Concejales urbanos', territorio: 'canton', modo: 'curado' },
  { slug: 'concejo-rural', raw: 'concejal-rural', nombre: 'Concejo rural', cargo: 'Concejales rurales', territorio: 'canton', modo: 'curado' },
  { slug: 'circunscripcion', raw: 'concejal-circ', nombre: 'Concejo por circunscripción', cargo: 'Concejales por circunscripción', territorio: 'sub', modo: 'curado' },
  { slug: 'junta-parroquial', raw: 'vocal-parroquial', nombre: 'Juntas parroquiales', cargo: 'Vocales de junta parroquial', territorio: 'sub', modo: 'auto' },
];

export const TEMAS_LOCALES = [
  { id: 'movilidad', nombre: 'Vialidad y movilidad' },
  { id: 'servicios', nombre: 'Agua y servicios básicos' },
  { id: 'ambiente', nombre: 'Ambiente y residuos' },
  { id: 'urbano', nombre: 'Obra y espacio público' },
  { id: 'seguridad', nombre: 'Seguridad y riesgos' },
  { id: 'social', nombre: 'Social, salud, educación y deporte' },
  { id: 'economia', nombre: 'Economía, empleo y turismo' },
  { id: 'gobierno', nombre: 'Gestión, transparencia y participación' },
  { id: 'otros', nombre: 'Otros' },
];

export const COMPETENCIAS = {
  prefectura: 'COOTAD art. 42: vialidad rural, riego, cuencas, gestión ambiental, fomento productivo y agropecuario, cooperación internacional.',
  alcaldia: 'COOTAD art. 55: vialidad urbana, agua potable y alcantarillado, residuos, tránsito y transporte, uso del suelo, espacios públicos, mercados, catastro, riesgos e incendios.',
  concejo: 'COOTAD art. 58: un concejal no ejecuta obras. Presenta ordenanzas y resoluciones, fiscaliza al alcalde y vota el presupuesto.',
  junta: 'COOTAD art. 65: espacios públicos parroquiales, vialidad parroquial (con la Prefectura), actividades productivas comunitarias, ambiente, organización ciudadana y cooperación. Agua, salud, educación y seguridad son de otros niveles.',
};
