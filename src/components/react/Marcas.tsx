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

export function MarcaCalificacion({ c }: { c: string }) {
  const t = tipoCalificacion(c)
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold">
      <t.Icon aria-hidden="true" className={cn("size-[1.1em] shrink-0", t.cls)} strokeWidth={2.4} />
      {c}
    </span>
  )
}
