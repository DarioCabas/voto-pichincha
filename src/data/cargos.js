// Qué puede y qué no puede hacer cada cargo, en palabras simples.
// Fuente: COOTAD, edición de Ediciones Legales publicada por la AME (última reforma: R.O. 584-4S, 21-VI-2024).
// Cada punto cita su artículo y la página del PDF (pag) para poder comprobarlo.
// Salud, educación y seguridad: Constitución, art. 261 (competencias exclusivas del Estado central).

export const COOTAD_URL = 'https://ame.gob.ec/wp-content/uploads/2025/04/CODIGO-ORGANICO-DE-ORGANIZACION-TERRITORIAL-AUTONOMIA-Y-DESCENTRALIZACION-2.pdf';
// Constitución 2008, copia de CEPAL; art. 261 (num. 1: orden público; num. 6: educación y salud) en la pág. 85-86
export const CONSTITUCION_URL = 'https://oig.cepal.org/sites/default/files/2008_constitucion_ecu_0.pdf#page=86';
export const cootad = (pag) => `${COOTAD_URL}#page=${pag}`;

export const CARGOS = {
  prefectura: {
    quien: 'un prefecto o prefecta',
    resumen: 'Dirige el gobierno de la provincia. Se encarga sobre todo del campo: vías rurales, riego, ambiente y producción.',
    puede: [
      { t: 'Construir y mantener vías fuera de las ciudades (las que unen parroquias y cantones).', art: 'Art. 42 b', pag: 26 },
      { t: 'Construir y mantener sistemas de riego.', art: 'Art. 42 e', pag: 26 },
      { t: 'Cuidar ríos y cuencas, y hacer la gestión ambiental de la provincia.', art: 'Art. 42 c, d', pag: 26 },
      { t: 'Apoyar la producción, sobre todo la agropecuaria.', art: 'Art. 42 f', pag: 26 },
      { t: 'Conseguir cooperación internacional para estas tareas.', art: 'Art. 42 g', pag: 26 },
    ],
    noPuede: [
      { t: 'Calles dentro de las ciudades, agua potable, alcantarillado o basura.', quien: 'Le toca al Municipio (Art. 55 c, d).', pag: 37 },
      { t: 'Policía, salud o educación.', quien: 'Le toca al Gobierno nacional (Constitución, art. 261).' },
    ],
    ojo: 'Desconfía si promete hospitales, policía o arreglar calles de la ciudad: eso no depende de la Prefectura.',
  },
  alcaldia: {
    quien: 'un alcalde o alcaldesa',
    resumen: 'Dirige el Municipio del cantón: es quien ejecuta las obras, firma los contratos y maneja el presupuesto que aprueba el concejo.',
    puede: [
      { t: 'Construir y mantener las calles de la ciudad.', art: 'Art. 55 c', pag: 37 },
      { t: 'Dar agua potable, alcantarillado y recolección de basura.', art: 'Art. 55 d', pag: 37 },
      { t: 'Organizar el tránsito y el transporte público del cantón.', art: 'Art. 55 f', pag: 37 },
      { t: 'Hacer y cuidar parques, plazas y espacios deportivos y culturales.', art: 'Art. 55 g', pag: 37 },
      { t: 'Controlar el uso del suelo y las construcciones.', art: 'Art. 55 b', pag: 37 },
      { t: 'Prevenir y apagar incendios (bomberos).', art: 'Art. 55 m', pag: 37 },
      { t: 'Firmar contratos y convenios, y dirigir a todo el personal municipal.', art: 'Art. 60 n, w', pag: 42 },
      { t: 'Coordinar planes de seguridad con la Policía.', art: 'Art. 60 q', pag: 42 },
    ],
    noPuede: [
      { t: 'Mandar a la Policía o a las Fuerzas Armadas.', quien: 'La seguridad es del Gobierno nacional; el alcalde solo coordina (Constitución, art. 261; COOTAD art. 60 q).' },
      { t: 'Hospitales y escuelas por su cuenta.', quien: 'Son del Gobierno nacional; solo puede construirlos con permiso y convenio del ministerio (Art. 55 g).', pag: 37 },
      { t: 'Vías rurales entre cantones y sistemas de riego.', quien: 'Le tocan a la Prefectura (Art. 42 b, e).', pag: 26 },
      { t: 'Aprobar su propio presupuesto.', quien: 'Lo aprueba el concejo municipal (Art. 57 g).', pag: 38 },
    ],
    ojo: 'Desconfía si promete más policías, hospitales o escuelas sin decir con qué convenio: eso no depende solo del Municipio.',
  },
  concejo: {
    quien: 'un concejal o concejala',
    resumen: 'Es parte del concejo municipal, que hace las leyes del cantón (ordenanzas) y vigila al alcalde. Un concejal no ejecuta obras: vota, propone y fiscaliza.',
    puede: [
      { t: 'Votar en el concejo municipal.', art: 'Art. 58 a', pag: 41 },
      { t: 'Presentar proyectos de ordenanza (leyes del cantón).', art: 'Art. 58 b', pag: 41 },
      { t: 'Fiscalizar, es decir, vigilar y pedir cuentas al alcalde.', art: 'Art. 58 d', pag: 41 },
      { t: 'Aprobar u observar el presupuesto municipal y los préstamos.', art: 'Art. 57 g, i', pag: 38 },
      { t: 'Crear, cambiar o quitar tasas y contribuciones mediante ordenanza.', art: 'Art. 57 c', pag: 38 },
      { t: 'Aprobar el plan de desarrollo y las reglas de uso del suelo.', art: 'Art. 57 e, x', pag: 38 },
    ],
    noPuede: [
      { t: 'Construir obras, contratar o firmar convenios.', quien: 'Eso lo hace el alcalde (Art. 60 b, n).', pag: 42 },
      { t: 'Decidir en qué se gasta el dinero o mover partidas del presupuesto.', quien: 'El alcalde elabora el presupuesto y el concejo lo vota (Art. 60 g; 57 g).', pag: 42 },
      { t: 'Dar empleo en el Municipio o dirigir a su personal.', quien: 'Le toca al alcalde (Art. 60 w).', pag: 42 },
      { t: 'Mandar a la Policía.', quien: 'Le toca al Gobierno nacional (Constitución, art. 261).' },
    ],
    ojo: 'Si un candidato a concejal dice «construiré», «pavimentaré» o «daré trabajo», eso depende del alcalde. Lo que sí puede hacer es proponer una ordenanza, votar el presupuesto para eso y vigilar que se cumpla.',
  },
  junta: {
    quien: 'una junta parroquial (sus vocales)',
    resumen: 'Gobierna una parroquia rural. Se eligen vocales; el más votado preside la junta y es quien ejecuta. Los demás vocales votan, proponen y vigilan.',
    puede: [
      { t: 'Hacer y cuidar parques, plazas y espacios públicos de la parroquia (según el presupuesto participativo).', art: 'Art. 65 b', pag: 46 },
      { t: 'Mantener los caminos parroquiales, junto con la Prefectura.', art: 'Art. 65 c', pag: 46 },
      { t: 'Impulsar la producción comunitaria y cuidar el ambiente.', art: 'Art. 65 d', pag: 46 },
      { t: 'Organizar a comunas y recintos, y convocar mingas.', art: 'Art. 65 f; 67 s', pag: 46 },
      { t: 'Vigilar las obras y los servicios públicos de otras instituciones en la parroquia.', art: 'Art. 65 h', pag: 46 },
      { t: 'Cada vocal: votar, presentar acuerdos y resoluciones, y fiscalizar al presidente de la junta.', art: 'Art. 68', pag: 49 },
    ],
    noPuede: [
      { t: 'Agua potable, alcantarillado o basura.', quien: 'Le tocan al Municipio (Art. 55 d), salvo que se los deleguen (Art. 65 e).', pag: 37 },
      { t: 'Vías provinciales grandes.', quien: 'Le tocan a la Prefectura (Art. 42 b).', pag: 26 },
      { t: 'Salud, escuelas o policía.', quien: 'Le tocan al Gobierno nacional (Constitución, art. 261).' },
      { t: 'Un vocal no ejecuta obras por su cuenta.', quien: 'Quien ejecuta es el presidente de la junta (Art. 69).', pag: 50 },
    ],
    ojo: 'Las juntas tienen poco presupuesto. Desconfía de obras grandes (agua potable, carreteras, hospitales) que no le corresponden.',
  },
};

export const cargoDe = (slug) =>
  slug === 'prefectura' ? CARGOS.prefectura : slug === 'alcaldia' ? CARGOS.alcaldia : slug === 'junta-parroquial' ? CARGOS.junta : CARGOS.concejo;
