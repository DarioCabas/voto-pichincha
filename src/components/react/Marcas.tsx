// Marcas con forma + color + texto, para que nunca dependan solo del color (daltonismo, baja visión).
import { CircleCheck, CircleAlert, CircleX, CircleHelp } from "lucide-react"
import { cn } from "@/lib/utils"

export const VIAB = {
  alta: { label: "Sí, está en sus manos", corto: ["en sus manos", "en sus manos"], Icon: CircleCheck, cls: "text-alta" },
  media: { label: "Depende de otros", corto: ["depende de otros", "dependen de otros"], Icon: CircleAlert, cls: "text-media" },
  baja: { label: "Difícil o no le corresponde", corto: ["difícil o no le corresponde", "difíciles o no le corresponden"], Icon: CircleX, cls: "text-baja" },
} as const
export type Viab = keyof typeof VIAB

export function MarcaViab({ v, texto = false, className }: { v: Viab; texto?: boolean; className?: string }) {
  const m = VIAB[v] ?? VIAB.media
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <m.Icon aria-hidden="true" className={cn("size-[1.1em] shrink-0", m.cls)} strokeWidth={2.4} />
      {texto ? <span>{m.label}</span> : <span className="sr-only">{m.label}: </span>}
    </span>
  )
}

// Calificaciones de los verificadores, agrupadas en 4 tipos. Siempre se muestra la etiqueta exacta del medio.
export function tipoCalificacion(c: string) {
  const s = c.toLowerCase()
  if (/inverificable|sin evidencia/.test(s)) return { Icon: CircleHelp, cls: "text-muted-foreground" }
  if (/falso/.test(s)) return { Icon: CircleX, cls: "text-baja" }
  if (/^cierto|mayormente cierto/.test(s)) return { Icon: CircleCheck, cls: "text-alta" }
  return { Icon: CircleAlert, cls: "text-media" } // impreciso, parcialmente cierto, engañoso
}

// Cuatro grupos para resumir "qué tanto de verdad": siempre se muestra también la etiqueta exacta del medio.
export const GRUPOS = [
  { id: "cierto", label: "Ciertas", uno: "cierta", detalle: "Cierto o mayormente cierto", Icon: CircleCheck, cls: "text-alta", bg: "bg-alta" },
  { id: "mixto", label: "Imprecisas o engañosas", uno: "imprecisa o engañosa", detalle: "Impreciso, parcialmente cierto o engañoso", Icon: CircleAlert, cls: "text-media", bg: "bg-media" },
  { id: "falso", label: "Falsas", uno: "falsa", detalle: "Falso, mayormente falso o completamente falso", Icon: CircleX, cls: "text-baja", bg: "bg-baja" },
  { id: "nd", label: "No se pudieron comprobar", uno: "no se pudo comprobar", detalle: "Inverificable o sin evidencia", Icon: CircleHelp, cls: "text-muted-foreground", bg: "bg-muted-foreground" },
] as const
export function grupoDe(c: string) {
  const s = c.toLowerCase()
  if (/inverificable|sin evidencia/.test(s)) return "nd"
  if (/falso/.test(s)) return "falso"
  if (/^cierto|mayormente cierto/.test(s)) return "cierto"
  return "mixto"
}

export function ResumenVerdad({ cals }: { cals: string[] }) {
  const n: Record<string, number> = { cierto: 0, mixto: 0, falso: 0, nd: 0 }
  for (const c of cals) n[grupoDe(c)]++
  return (
    <div>
      <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
        {GRUPOS.map((g) => n[g.id] > 0 && <span key={g.id} className={g.bg} style={{ flex: n[g.id] }} />)}
      </div>
      <ul className="mt-2 grid list-none gap-1 p-0 text-sm">
        {GRUPOS.filter((g) => n[g.id] > 0).map((g) => (
          <li key={g.id} className="flex items-center gap-1.5">
            <g.Icon aria-hidden="true" className={cn("size-[1.1em] shrink-0", g.cls)} strokeWidth={2.4} />
            <span><b className="font-semibold">{n[g.id]}</b> {n[g.id] === 1 ? g.uno : g.label.toLowerCase()}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function MarcaCalificacion({ c }: { c: string }) {
  const t = tipoCalificacion(c)
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold">
      <t.Icon aria-hidden="true" className={cn("size-[1.1em] shrink-0", t.cls)} strokeWidth={2.4} />
      {c}
    </span>
  )
}
