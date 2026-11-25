// Selector que lleva a otra página al elegir una opción (provincia, cantón, parroquia).
// La navegación la hace el script de Layout.astro sobre select[data-ir]; así funciona sin hidratar React.
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

type Opcion = { valor: string; texto: string }

export function SelectorIr({ opciones, valor, etiqueta, className }: { opciones: Opcion[]; valor: string; etiqueta?: string; className?: string }) {
  return (
    <NativeSelect data-ir="" aria-label={etiqueta} defaultValue={valor} className={className}>
      {opciones.map((o) => (
        <NativeSelectOption key={o.valor} value={o.valor}>
          {o.texto}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  )
}
