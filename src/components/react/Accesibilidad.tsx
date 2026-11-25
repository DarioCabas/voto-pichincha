// Controles para leer mejor: tamaño del texto y alto contraste. Se recuerdan en este navegador.
import * as React from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Toggle } from "@/components/ui/toggle"

const TAMANOS = { normal: "100%", grande: "115%", muy: "130%" } as const
type T = keyof typeof TAMANOS
const leer = (k: string) => { try { return localStorage.getItem(k) } catch { return null } }
const guardar = (k: string, v: string) => { try { localStorage.setItem(k, v) } catch {} }

export function Accesibilidad() {
  const [tam, setTam] = React.useState<T>("normal")
  const [contraste, setContraste] = React.useState(false)
  const [listo, setListo] = React.useState(false) // no guardar nada hasta haber leído lo guardado
  React.useEffect(() => {
    const t = leer("vi-tam") as T
    setTam(t && t in TAMANOS ? t : "normal")
    setContraste(leer("vi-contraste") === "1")
    setListo(true)
  }, [])
  React.useEffect(() => { if (!listo) return; document.documentElement.style.fontSize = TAMANOS[tam]; guardar("vi-tam", tam) }, [tam, listo])
  React.useEffect(() => { if (!listo) return; document.documentElement.classList.toggle("contraste", contraste); guardar("vi-contraste", contraste ? "1" : "0") }, [contraste, listo])

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span id="tam-texto" className="text-muted-foreground">Texto</span>
      <ToggleGroup type="single" variant="outline" size="sm" value={tam} onValueChange={(v) => v && setTam(v as T)} aria-labelledby="tam-texto">
        <ToggleGroupItem value="normal" aria-label="Texto normal" className="px-2.5">A</ToggleGroupItem>
        <ToggleGroupItem value="grande" aria-label="Texto grande" className="px-2.5 text-base">A</ToggleGroupItem>
        <ToggleGroupItem value="muy" aria-label="Texto muy grande" className="px-2.5 text-lg">A</ToggleGroupItem>
      </ToggleGroup>
      <Toggle variant="outline" size="sm" pressed={contraste} onPressedChange={setContraste} aria-label="Alto contraste" className="px-2.5">
        <span aria-hidden="true" className="inline-block size-3.5 rounded-full border-2 border-current bg-[linear-gradient(90deg,currentColor_50%,transparent_50%)]" />
        Contraste
      </Toggle>
    </div>
  )
}
