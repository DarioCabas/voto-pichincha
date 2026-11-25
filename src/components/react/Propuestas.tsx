// Lista de propuestas: cada una se abre para ver qué promete, si puede cumplirla y la frase exacta del plan.
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { MarcaViab, VIAB, type Viab } from "./Marcas"
import { planUrl } from "@/lib/planes.js"

export type Item = { t: string; que?: string; v: Viab; n?: string; cita?: string; pag?: number | null }

export function ListaPropuestas({ items, pdf, id }: { items: Item[]; pdf?: string | null; id: string }) {
  return (
    <Accordion type="multiple" className="w-full">
      {items.map((i, k) => (
        <AccordionItem key={k} value={`${id}-${k}`} className="border-b-0">
          <AccordionTrigger className="gap-2 py-1.5 text-[0.9rem] font-normal leading-snug hover:no-underline hover:bg-muted/60 rounded-md px-1.5 -mx-1.5">
            <span className="flex items-start gap-2">
              <MarcaViab v={i.v} className="mt-[0.2em]" />
              <span>{i.t}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="ml-[1.6em] grid gap-2 border-l-2 pl-3 pb-3 text-[0.85rem] leading-relaxed">
            {i.que && (
              <p><span className="font-semibold">Qué promete: </span>{i.que}</p>
            )}
            <p>
              <span className="font-semibold">¿Se puede cumplir? </span>
              <MarcaViab v={i.v} texto className="font-medium" />.{" "}
              {i.n}
            </p>
            {i.cita && (
              <figure className="m-0">
                <figcaption className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lo que dice el plan</figcaption>
                <blockquote className="m-0 italic">«{i.cita}»</blockquote>
                {pdf && (
                  <a className="mt-1 inline-block font-medium" href={planUrl(pdf, i.pag)}>
                    {i.pag ? `Verlo en el plan, página ${i.pag}` : "Verlo en el plan"} →
                  </a>
                )}
              </figure>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export const conteo = (tabla: Record<string, Item[]> = {}) => {
  const o = { alta: 0, media: 0, baja: 0 }
  for (const items of Object.values(tabla)) for (const i of items) if (i.v in o) o[i.v]++
  return o
}

export function BarraConteo({ tabla }: { tabla: Record<string, Item[]> }) {
  const n = conteo(tabla)
  const total = n.alta + n.media + n.baja
  if (!total) return null
  return (
    <div className="mt-3">
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
        <span className="bg-alta" style={{ flex: n.alta }} />
        <span className="bg-media" style={{ flex: n.media }} />
        <span className="bg-baja" style={{ flex: n.baja }} />
      </div>
      <ul className="mt-1.5 flex list-none flex-wrap gap-x-3 gap-y-0.5 p-0 text-xs text-muted-foreground">
        {(Object.keys(VIAB) as Viab[]).map((v) => (
          <li key={v} className="inline-flex items-center gap-1">
            <MarcaViab v={v} /> {n[v]} {VIAB[v].corto[n[v] === 1 ? 0 : 1]}
          </li>
        ))}
      </ul>
    </div>
  )
}
