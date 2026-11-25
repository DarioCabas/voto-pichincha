// Comparación de candidaturas por tema.
// Celular: una tarjeta por candidatura. Pantallas grandes: tabla con una columna por candidatura.
import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ListaPropuestas, BarraConteo, type Item } from "./Propuestas"
import type { Verif } from "./Verificaciones"
import { MarcaCalificacion } from "./Marcas"
import { planUrl, pdfUrl } from "@/lib/planes.js"

export type Cand = {
  id: string; lista: string; partido: string; titulo: string; subtitulo?: string | null
  enfoque?: string; tabla?: Record<string, Item[]>; metas?: string[]; inversion?: string
  pdf?: string | null; cne?: string; notas?: string[]; verif?: Verif[]
}
type Tema = { id: string; nombre: string }

const Etiqueta = ({ children }: { children: React.ReactNode }) => (
  <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</h4>
)

function Enlaces({ c }: { c: Cand }) {
  const pdf = pdfUrl(c.pdf)
  return (
    <>
      {c.pdf ? <a href={planUrl(c.pdf)}>Leer el plan</a> : <span className="text-muted-foreground">No entregó plan</span>}
      {pdf && <a href={pdf} target="_blank" rel="noopener">PDF</a>}
      {c.cne && <a href={c.cne} target="_blank" rel="noopener">Ver en el CNE ↗</a>}
    </>
  )
}

// Cuántas frases de cada calificación; el detalle de cada una está en la ficha
function ResumenVerif({ c }: { c: Cand }) {
  const porCal = Object.entries((c.verif ?? []).reduce((a: Record<string, number>, v) => ((a[v.calificacion] = (a[v.calificacion] ?? 0) + 1), a), {}))
  const fuentes = [...new Set((c.verif ?? []).map((v) => v.fuente))].join(" y ")
  return (
    <>
      <p className="mb-1 text-sm text-muted-foreground">{fuentes} revisaron {c.verif!.length} {c.verif!.length === 1 ? "frase" : "frases"} que dijo en debates:</p>
      <ul className="grid list-none gap-1 p-0">
        {porCal.map(([cal, n]) => <li key={cal} className="flex items-center gap-1.5"><MarcaCalificacion c={cal} /> <span className="text-muted-foreground">{n === 1 ? "1 frase" : `${n} frases`}</span></li>)}
      </ul>
      <a className="mt-1.5 inline-block font-medium" href={`#f-${c.id}`}>Ver qué dijo y qué encontraron</a>
    </>
  )
}

function Tarjeta({ c, temas }: { c: Cand; temas: Tema[] }) {
  const conTemas = temas.filter((t) => c.tabla?.[t.id]?.length)
  return (
    <Card id={`m-${c.id}`} className="scroll-mt-4 gap-0 py-0">
      <CardHeader className="border-b py-4">
        <CardDescription className="font-semibold text-link">Lista {c.lista}</CardDescription>
        <CardTitle className="text-lg leading-snug"><h3 className="m-0 text-lg font-semibold">{c.titulo}</h3></CardTitle>
        {c.subtitulo && <CardDescription>{c.subtitulo}</CardDescription>}
        <CardDescription className="text-xs uppercase tracking-wide">{c.partido}</CardDescription>
        <BarraConteo tabla={c.tabla ?? {}} />
      </CardHeader>
      <CardContent className="grid gap-5 py-4 text-[0.9rem]">
        {c.enfoque && <p><span className="font-semibold">En resumen: </span>{c.enfoque}</p>}
        {conTemas.map((t) => (
          <section key={t.id}>
            <Etiqueta>{t.nombre}</Etiqueta>
            <ListaPropuestas items={c.tabla![t.id]} pdf={c.pdf} id={`m-${c.id}-${t.id}`} />
          </section>
        ))}
        {!conTemas.length && <p className="text-muted-foreground">{c.notas?.[0] ?? "No hay propuestas que mostrar para esta candidatura."}</p>}
        {!!c.metas?.length && (
          <section>
            <Etiqueta>Metas con cifras</Etiqueta>
            <ul className="grid gap-1">{c.metas.map((m, k) => <li key={k}>{m}</li>)}</ul>
          </section>
        )}
        {!!c.verif?.length && (
          <section>
            <Etiqueta>Lo que dicen los verificadores</Etiqueta>
            <ResumenVerif c={c} />
          </section>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-x-4 gap-y-1 border-t py-3 text-sm">
        <Enlaces c={c} />
        <a href={`#f-${c.id}`}>Quiénes son y notas</a>
      </CardFooter>
    </Card>
  )
}

export function Comparacion({ candidatos, temas }: { candidatos: Cand[]; temas: Tema[] }) {
  const filas = temas.filter((t) => candidatos.some((c) => c.tabla?.[t.id]?.length))
  const [visibles, setVisibles] = React.useState<string[]>(candidatos.map((c) => c.id))
  const cols = candidatos.filter((c) => visibles.includes(c.id))
  const hayEnfoque = candidatos.some((c) => c.enfoque)
  const hayMetas = candidatos.some((c) => c.metas?.length)
  const hayVerif = candidatos.some((c) => c.verif?.length)

  return (
    <>
      {/* Celular */}
      <div className="mt-8 md:hidden">
        <h2 className="mt-0 mb-1">Las candidaturas</h2>
        <p className="mb-3 text-sm text-muted-foreground">{candidatos.length} en total. Desliza hacia abajo para verlas todas, o salta a una:</p>
        {candidatos.length > 2 && (
          <nav aria-label="Ir a una candidatura" className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {candidatos.map((c) => (
              <a key={c.id} href={`#m-${c.id}`} className="shrink-0 rounded-full border bg-card px-3 py-1.5 text-sm text-foreground no-underline">{c.titulo}</a>
            ))}
          </nav>
        )}
        <div className="grid gap-4">{candidatos.map((c) => <Tarjeta key={c.id} c={c} temas={temas} />)}</div>
      </div>

      {/* Pantallas grandes */}
      <div className="mt-8 hidden md:block">
        <h2 className="mt-0 mb-2">Las candidaturas, lado a lado</h2>
        {candidatos.length > 2 && (
          <div className="mb-3">
            <p id="mostrar" className="mb-1.5 text-sm text-muted-foreground">Elige a quiénes quieres comparar (toca un nombre para quitarlo o volver a ponerlo):</p>
            <ToggleGroup type="multiple" variant="outline" size="sm" value={visibles} onValueChange={(v) => v.length && setVisibles(v)} aria-labelledby="mostrar" className="flex flex-wrap justify-start gap-1.5">
              {candidatos.map((c) => (
                <ToggleGroupItem key={c.id} value={c.id} className="rounded-full! border px-3 data-[state=off]:text-muted-foreground data-[state=off]:line-through data-[state=on]:bg-secondary">
                  {c.titulo}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}
        <div className="max-h-[calc(100vh-9rem)] overflow-auto rounded-xl border bg-card">
          <Table className="cmp border-separate border-spacing-0 text-[0.875rem]">
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="stick corner"><span className="sr-only">Tema</span></TableHead>
                {cols.map((c) => (
                  <TableHead key={c.id} scope="col" className="h-auto whitespace-normal py-3 align-top">
                    <span className="block text-xs font-semibold text-link">Lista {c.lista}</span>
                    <a className="block text-[0.95rem] font-semibold text-foreground no-underline hover:underline" href={`#f-${c.id}`}>{c.titulo}</a>
                    {c.subtitulo && <span className="block text-xs font-normal text-muted-foreground">{c.subtitulo}</span>}
                    <span className="block text-xs font-normal uppercase tracking-wide text-muted-foreground">{c.partido}</span>
                    <BarraConteo tabla={c.tabla ?? {}} />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {hayEnfoque && (
                <TableRow className="meta">
                  <TableHead scope="row" className="stick">En resumen</TableHead>
                  {cols.map((c) => <TableCell key={c.id} className="whitespace-normal align-top">{c.enfoque}</TableCell>)}
                </TableRow>
              )}
              {filas.map((t) => (
                <TableRow key={t.id}>
                  <TableHead scope="row" className="stick whitespace-normal">{t.nombre}</TableHead>
                  {cols.map((c) => (
                    <TableCell key={c.id} className="whitespace-normal align-top">
                      {c.tabla?.[t.id]?.length
                        ? <ListaPropuestas items={c.tabla[t.id]} pdf={c.pdf} id={`d-${c.id}-${t.id}`} />
                        : <span className="text-muted-foreground">—<span className="sr-only">Sin propuestas de este tema</span></span>}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {hayMetas && (
                <TableRow className="meta">
                  <TableHead scope="row" className="stick">Metas con cifras</TableHead>
                  {cols.map((c) => (
                    <TableCell key={c.id} className="whitespace-normal align-top">
                      {c.metas?.length ? <ul className="grid gap-1">{c.metas.map((m, k) => <li key={k}>{m}</li>)}</ul> : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                  ))}
                </TableRow>
              )}
              {hayVerif && (
                <TableRow className="meta">
                  <TableHead scope="row" className="stick whitespace-normal">Lo que dicen los verificadores</TableHead>
                  {cols.map((c) => (
                    <TableCell key={c.id} className="whitespace-normal align-top">
                      {c.verif?.length ? <ResumenVerif c={c} /> : <span className="text-muted-foreground">Sin verificaciones</span>}
                    </TableCell>
                  ))}
                </TableRow>
              )}
              <TableRow className="meta">
                <TableHead scope="row" className="stick">El plan</TableHead>
                {cols.map((c) => (
                  <TableCell key={c.id} className="whitespace-normal align-top">
                    <span className="flex flex-wrap gap-x-3 gap-y-1"><Enlaces c={c} /></span>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}
