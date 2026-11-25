// Ficha de cada candidatura: quiénes son, todo su plan, notas y verificaciones. Se abre sola si la URL trae #f-<id>.
import * as React from "react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { ListaVerificaciones } from "./Verificaciones"
import { MarcaViab } from "./Marcas"
import type { Cand } from "./Comparacion"
import { planUrl, pdfUrl } from "@/lib/planes.js"

type Ficha = Cand & {
  personas?: { nombre: string; suplente?: string }[]; estructura?: string; primeros100?: string[] | null
  detalle?: { titulo: string; items: string[] }[]; propuestas?: { t: string; v: any; tema: string }[]; objetivos?: string[]
}

const H = ({ children }: { children: React.ReactNode }) => (
  <h4 className="mt-4 mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground first:mt-0">{children}</h4>
)

export function Fichas({ candidatos, temas }: { candidatos: Ficha[]; temas: { id: string; nombre: string }[] }) {
  const [abierta, setAbierta] = React.useState("")
  const nombreTema = Object.fromEntries(temas.map((t) => [t.id, t.nombre]))
  React.useEffect(() => {
    const leer = () => {
      const h = decodeURIComponent(location.hash.slice(1))
      if (h.startsWith("f-") && candidatos.some((c) => `f-${c.id}` === h)) {
        setAbierta(h)
        requestAnimationFrame(() => document.getElementById(h)?.scrollIntoView())
      }
    }
    leer()
    addEventListener("hashchange", leer)
    return () => removeEventListener("hashchange", leer)
  }, [])

  return (
    <section aria-labelledby="fichas" className="mt-10">
      <h2 id="fichas" className="mb-1">Quiénes son y todo lo que trae cada plan</h2>
      <p className="mb-3 text-sm text-muted-foreground">Toca una candidatura para ver a todos sus candidatos, sus metas, las notas sobre el plan y lo que dicen los verificadores.</p>
      <Accordion type="single" collapsible value={abierta} onValueChange={setAbierta} className="grid gap-2">
        {candidatos.map((c) => (
          <AccordionItem key={c.id} value={`f-${c.id}`} id={`f-${c.id}`} className="scroll-mt-4 rounded-xl border bg-card px-4 md:scroll-mt-36 last:border-b">
            <AccordionTrigger className="items-center py-3 hover:no-underline">
              <span className="flex flex-wrap items-baseline gap-x-2.5">
                <span className="text-xs font-semibold text-link">Lista {c.lista}</span>
                <span className="text-base font-semibold">{c.titulo}</span>
                <span className="text-xs font-normal uppercase tracking-wide text-muted-foreground">{c.partido}</span>
                {!!c.verif?.length && <span className="text-xs font-normal text-muted-foreground">· {c.verif.length === 1 ? "1 frase verificada" : `${c.verif.length} frases verificadas`}</span>}
              </span>
            </AccordionTrigger>
            <AccordionContent className="border-t pt-3 pb-4 text-[0.9rem]">
              {!!c.personas?.length && (
                <>
                  <H>Candidatos</H>
                  <ol className="columns-1 gap-8 sm:columns-2">
                    {c.personas.map((p, k) => <li key={k} className="break-inside-avoid">{p.nombre}{p.suplente && <span className="text-muted-foreground"> · suplente: {p.suplente}</span>}</li>)}
                  </ol>
                </>
              )}
              {c.estructura && <p className="mt-3"><b>Cómo está organizado el plan:</b> {c.estructura}</p>}
              {c.inversion && <p className="mt-2"><b>Inversión:</b> {c.inversion}</p>}
              {!!c.metas?.length && (<><H>Metas</H><ul className="grid gap-1">{c.metas.map((m, k) => <li key={k}>{m}</li>)}</ul></>)}
              {!!c.primeros100?.length && (<><H>Primeros 100 días</H><ul className="grid gap-1">{c.primeros100.map((m, k) => <li key={k}>{m}</li>)}</ul></>)}
              {c.detalle?.map((d, k) => (
                <React.Fragment key={k}><H>{d.titulo}</H><ul className="columns-1 gap-8 sm:columns-2">{d.items.map((m, j) => <li key={j} className="break-inside-avoid">{m}</li>)}</ul></React.Fragment>
              ))}
              {!!c.propuestas?.length && (
                <>
                  <H>Todas las propuestas ({c.propuestas.length})</H>
                  <ul className="grid list-none gap-1 p-0 sm:grid-cols-2">
                    {c.propuestas.map((p, k) => (
                      <li key={k} className="flex gap-2"><MarcaViab v={p.v} className="mt-[0.2em]" /><span>{p.t} <span className="text-muted-foreground">· {nombreTema[p.tema]}</span></span></li>
                    ))}
                  </ul>
                </>
              )}
              {!!c.objetivos?.length && (<><H>Objetivos del plan</H><ul className="grid gap-1">{c.objetivos.map((m, k) => <li key={k}>{m}</li>)}</ul></>)}
              {!!c.notas?.length && (<><H>Notas sobre el plan</H><ul className="grid gap-1">{c.notas.map((m, k) => <li key={k}>{m}</li>)}</ul></>)}
              {!!c.verif?.length && (<><H>¿Era cierto lo que dijo?</H><ListaVerificaciones items={c.verif} id={`f-${c.id}`} /></>)}
              <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {c.pdf && <a className="tap" href={planUrl(c.pdf)}>Leer el plan completo</a>}
                {pdfUrl(c.pdf) && <a className="tap" href={pdfUrl(c.pdf)!} target="_blank" rel="noopener">PDF original</a>}
                {c.cne && <a className="tap" href={c.cne} target="_blank" rel="noopener">Ficha en el CNE ↗</a>}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
