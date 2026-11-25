// Lo que dijo la candidatura en debates y qué encontraron los verificadores (Ecuador Chequea, Lupa Media).
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { MarcaCalificacion, ResumenVerdad } from "./Marcas"

export type Verif = { fuente: string; evento: string; fecha: string; url: string; afirmacion: string; calificacion: string; explicacion: string }

// "Ecuador Chequea y Lupa Media revisaron 24 frases que dijo en debates."
export function introVerif(items: { fuente: string; evento?: string }[]) {
  const fuentes = [...new Set(items.map((v) => v.fuente))]
  const fuera = items.some((v) => v.evento && !v.evento.startsWith("Debate"))
  const n = items.length
  return `${fuentes.join(" y ")} ${fuentes.length > 1 ? "revisaron" : "revisó"} ${n === 1 ? "una frase" : `${n} frases`} que dijo ${fuera ? "en debates y en redes sociales" : "en debates"}.`
}

export function ListaVerificaciones({ items, id }: { items: Verif[]; id: string }) {
  if (!items?.length) return null
  return (
    <section aria-label="Verificaciones de lo que dijo">
      <p className="mb-2 text-sm text-muted-foreground">{introVerif(items)} Así quedaron:</p>
      <ResumenVerdad cals={items.map((v) => v.calificacion)} />
      <p className="mt-3 text-sm text-muted-foreground">Toca cada frase para ver qué encontraron y leer la verificación completa.</p>
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
                <span>{v.evento} · verificación publicada el {new Date(v.fecha + "T12:00:00").toLocaleDateString("es-EC", { day: "numeric", month: "long", year: "numeric" })}</span>
              </p>
              <a className="tap font-medium" href={v.url} target="_blank" rel="noopener">Leer la verificación completa en {v.fuente} ↗</a>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
