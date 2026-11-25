// Selector (shadcn Select) que lleva a otra página al elegir: provincia, cantón o parroquia.
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type Opcion = { valor: string; texto: string }

export function SelectorIr({ opciones, valor, etiqueta, id, className }: { opciones: Opcion[]; valor: string; etiqueta: string; id?: string; className?: string }) {
  return (
    <Select defaultValue={valor} onValueChange={(v) => { if (v !== valor) location.href = v }}>
      <SelectTrigger id={id} aria-label={etiqueta} className={cn("min-h-10 text-[0.95rem]", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="item-aligned">
        {opciones.map((o) => <SelectItem key={o.valor} value={o.valor} className="py-2 text-[0.95rem]">{o.texto}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}
