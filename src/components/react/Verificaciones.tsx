// Lo que dijo la candidatura en debates y qué encontraron los verificadores (Ecuador Chequea, Lupa Media).
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { MarcaCalificacion } from "./Marcas"

export type Verif = { fuente: string; evento: string; fecha: string; url: string; afirmacion: string; calificacion: string; explicacion: string }

export function ListaVerificaciones({ items, id }: { items: Verif[]; id: string }) {
  if (!items?.length) return null
  const fuentes = [...new Set(items.map((v) => v.fuente))].join(" y ")
  return (
    <section aria-label="Verificaciones de lo que dijo">
      <p className="text-sm text-muted-foreground">
        {fuentes} revisaron {items.length === 1 ? "una frase" : `${items.length} frases`} que dijo en debates. Toca cada una para ver qué encontraron.
      </p>
      <Accordion type="multiple" className="mt-1 w-full">
        {items.map((v, k) => (
          <AccordionItem key={k} value={`${id}-v${k}`}>
            <AccordionTrigger className="gap-2 py-2 text-[0.9rem] font-normal hover:no-underline">
              <span className="grid gap-0.5">
                <MarcaCalificacion c={v.calificacion} />
                <span className="text-muted-foreground">«{v.afirmacion}»</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="grid gap-2 pb-3 text-[0.85rem] leading-relaxed">
              <p><span className="font-semibold">Qué encontró {v.fuente}: </span>{v.explicacion}</p>
              <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">{v.fuente}</Badge>
                <span>{v.evento} · {new Date(v.fecha + "T12:00:00").toLocaleDateString("es-EC", { day: "numeric", month: "long", year: "numeric" })}</span>
              </p>
              <a className="font-medium" href={v.url} target="_blank" rel="noopener">Leer la verificación completa en {v.fuente} ↗</a>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
