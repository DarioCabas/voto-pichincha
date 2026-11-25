# Voto Informado · Pichincha 2027

Tabla comparativa de los planes de trabajo de los candidatos de Pichincha (Elecciones Seccionales 2027, proceso CNE 140), con una señal de viabilidad para cada propuesta.

```sh
npm run dev   # http://localhost:4321
```

## Estructura

- `src/pages/index.astro` — la página: tabla comparativa y fichas completas.
- `src/data/prefecto.js` — puntos clave de cada plan, viabilidad y justificación.
- `src/data/contexto.js` — datos públicos usados para medir la viabilidad, con sus fuentes.
- `public/planes/` — los PDF originales del CNE (hash MD5 verificado).
- `data/raw/` — datos crudos del CNE (listas, candidatos, archivo del plan).
- `data/txt/` — texto extraído de cada PDF (directo o por OCR).
- `scripts/` — descarga (`scrape.cjs`, `scrape-all.cjs`), extracción de texto (`totext.mjs`) y OCR (`ocr.py`).

## Cómo se obtuvieron los datos

El portal del CNE está protegido por Imperva/hCaptcha. La descarga se hace desde una ventana visible de Chrome, en la que una persona pasa la verificación; el script se conecta a esa sesión por CDP (`--remote-debugging-port=9333`) y navega a ritmo pausado. No se evade ninguna protección.

```sh
node scripts/scrape.cjs <codDignidad> "<NOMBRE DIGNIDAD>" <ambito> <slug> [CANTÓN]
# Prefecto: node scripts/scrape.cjs 2 "PREFECTO Y VICEPREFECTO" P prefecto
```

Códigos de dignidad: Prefecto 2 (P), Alcalde 4 (C), Concejales urbanos 5 (C), Concejales rurales 3 (C), Concejales por circunscripción 12 (T), Vocales de junta parroquial 6 (Q).

## Pendiente

- Juntas parroquiales: la descarga del CNE se cortó (`data/raw/scrape-all.log`, error `#provincia`). Solo hay 3 de 54 parroquias (Ascázubi, Cangahua y Juan Montalvo, en Cayambe). Hay que reanudar `node scripts/scrape-all.cjs vocal-parroquial` desde la sesión de Chrome verificada.
- Alcaldías: las 53 candidaturas de los 8 cantones tienen tabla con viabilidad (`src/data/alcalde/*.json`). Falta el contexto público (presupuesto municipal) de Cayambe, Pedro Moncayo, Pedro Vicente Maldonado, Puerto Quito y San Miguel de los Bancos.
- Concejales: las 117 listas (31 urbanas, 39 rurales, 47 por circunscripción) tienen resumen revisado en `src/data/concejal/<raw>-<cantón>.json`, superpuesto a la lista base del CNE en `src/lib/datos.js`. Si falta un resumen, la lista cae al análisis automático (`src/data/gen`) y la página muestra la etiqueta "Clasificación automática".

## Otras provincias

Pichincha usa las URL sin prefijo (`/alcaldia/quito/`); Azuay, Cotopaxi y Guayas van en `/<provincia>/alcaldia/<cantón>/`. La lista está en `PROVINCIAS` (`src/data/dignidades.js`); cada provincia muestra las dignidades que tengan `data/raw/<prov>/<dignidad>.json`, con los resúmenes de `src/data/provincias/<prov>/`.

```sh
scripts/pipeline.sh azuay/alcalde   # texto → OCR → resumen con claude -p → build
```

## PDF en producción

`public/planes/` (~1,2 GB) no está en git, así que Vercel no lo publica. Los enlaces a los PDF ("PDF", "Plan, pág. N") usan `PUBLIC_PLANES_URL` como base: sube la carpeta `public/planes/` a un almacenamiento público conservando la ruta `planes/...` y define esa variable en Vercel (por ejemplo `https://<bucket>.r2.dev`). Sin la variable, los enlaces apuntan al mismo sitio, como en local.

## Licencia

MIT — ver [LICENSE](LICENSE).
