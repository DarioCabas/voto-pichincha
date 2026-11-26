// Catálogo de dignidades, temas y reglas de competencia (COOTAD) usados en todo el sitio.

export const DIGNIDADES = [
  // Primero: el cargo de mayor poder de esta elección. Nacional: los mismos candidatos en todas las provincias (data/raw/nacional/cpccs.json); los "cantones" son las tres listas
  { slug: 'cpccs', raw: 'cpccs', nombre: 'CPCCS', que: 'Elige al Fiscal, al Contralor y otras autoridades de control, e investiga denuncias de corrupción. Se vota en todo el país.', cargo: 'Consejeros del CPCCS', territorio: 'grupo', nacional: true, modo: 'curado' },
  // Segundo: las alcaldías, el cargo local que más decide en el día a día
  { slug: 'alcaldia', raw: 'alcalde', nombre: 'Alcaldías', que: 'Gobierna el cantón: calles, agua, basura, tránsito y parques.', cargo: 'Alcalde/sa', territorio: 'canton', modo: 'curado' },
  { slug: 'prefectura', raw: 'prefecto', nombre: 'Prefectura', que: 'Gobierna la provincia: vías rurales, riego y apoyo a la producción.', cargo: 'Prefecto/a', territorio: null, modo: 'curado' },
  { slug: 'concejo-urbano', raw: 'concejal-urbano', nombre: 'Concejo urbano', que: 'Hacen las leyes del cantón y vigilan al alcalde. Los elige la zona urbana.', cargo: 'Concejales urbanos', territorio: 'canton', modo: 'curado' },
  { slug: 'concejo-rural', raw: 'concejal-rural', nombre: 'Concejo rural', que: 'Hacen las leyes del cantón y vigilan al alcalde. Los eligen las parroquias rurales.', cargo: 'Concejales rurales', territorio: 'canton', modo: 'curado' },
  { slug: 'circunscripcion', raw: 'concejal-circ', nombre: 'Concejo por circunscripción', que: 'Concejales que elige cada zona de los cantones grandes (Quito y Rumiñahui).', cargo: 'Concejales por circunscripción', territorio: 'sub', modo: 'curado' },
  { slug: 'junta-parroquial', raw: 'vocal-parroquial', nombre: 'Juntas parroquiales', que: 'Gobiernan la parroquia rural: parques, caminos vecinales y ferias.', cargo: 'Vocales de junta parroquial', territorio: 'sub', modo: 'auto' },
];

// Provincias publicadas. Pichincha usa las URL sin prefijo (/alcaldia/...); las demás, /<slug>/alcaldia/...
export const PROVINCIAS = [
  { slug: 'pichincha', nombre: 'Pichincha' },
  { slug: 'azuay', nombre: 'Azuay' },
  { slug: 'cotopaxi', nombre: 'Cotopaxi' },
  { slug: 'guayas', nombre: 'Guayas' },
  { slug: 'imbabura', nombre: 'Imbabura' },
];
export const provPath = (prov) => (!prov || prov === 'pichincha' ? '' : `/${prov}`);

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
  prefectura: 'Sí puede: vías entre parroquias y cantones, riego, cuidado de ríos y ambiente, apoyo al campo y a la producción. No le toca: calles de la ciudad, agua potable, salud, educación ni policía. (Ley COOTAD, art. 42)',
  alcaldia: 'Sí puede: calles, agua potable y alcantarillado, basura, tránsito y buses, parques, mercados, uso del suelo y prevención de desastres. No le toca: policía, hospitales, escuelas ni crear empleo directamente. (Ley COOTAD, art. 55)',
  concejo: 'Un concejal no hace obras. Sí puede: crear ordenanzas (leyes del cantón), vigilar cómo gasta el alcalde y votar el presupuesto. Si promete construir algo, depende del alcalde. (Ley COOTAD, art. 58)',
  junta: 'Sí puede: parques y espacios de la parroquia, cuidar caminos junto con la Prefectura, apoyar a productores, cuidar el ambiente y organizar a la comunidad. No le toca: agua potable, salud, educación ni policía. (Ley COOTAD, art. 65)',
};
