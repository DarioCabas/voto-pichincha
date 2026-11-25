// Enlaces a los planes de trabajo.
// Los PDF (public/planes, ~1,2 GB) no van en git. En el sitio, cada plan se lee en /plan/<ruta>/ con su texto
// separado por páginas (de public/textos). El PDF original solo se enlaza si hay dónde servirlo:
// PUBLIC_PLANES_URL (almacenamiento externo) o el servidor local de desarrollo.
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const remoto = (import.meta.env.PUBLIC_PLANES_URL ?? '').replace(/\/$/, '');

export const pdfUrl = (pdf) => (!pdf ? null : remoto ? remoto + pdf : import.meta.env.DEV ? base + pdf : null);
export const planUrl = (pdf, pag) =>
  pdf ? `${base}${pdf.replace(/^\/planes\//, '/plan/').replace(/\.pdf$/, '/')}${pag ? `#p${pag}` : ''}` : null;
