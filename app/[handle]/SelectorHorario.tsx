'use client'

import { useEffect, useState } from 'react'
import type { DiaConHuecos } from '@/lib/crm'

/**
 * Elegir día y hora entre lo que el taller tiene libre.
 *
 * Reemplaza al par de campos «fecha» y «hora» sueltos. La diferencia no es
 * cosmética: antes el cliente proponía a ciegas y le podía pedir un turno un
 * domingo a las 3 de la mañana, y el problema le llegaba al taller. Ahora solo
 * puede elegir lo que existe.
 *
 * **Cae con gracia.** Si el CRM no responde, o el taller no cargó horarios, o
 * no queda ningún hueco, vuelve a los campos libres con un aviso. Un formulario
 * que no se puede completar es peor que uno impreciso.
 */
export default function SelectorHorario({
  handle,
  serviceId,
  valor,
  onCambio,
}: {
  handle: string
  serviceId: string | null
  /** ISO del hueco elegido, o '' si todavía no eligió. */
  valor: string
  onCambio: (iso: string) => void
}) {
  const [dias, setDias] = useState<DiaConHuecos[] | null>(null)
  const [cargando, setCargando] = useState(true)
  const [diaAbierto, setDiaAbierto] = useState<string | null>(null)

  useEffect(() => {
    let vigente = true
    setCargando(true)
    const qs = serviceId ? `?serviceId=${encodeURIComponent(serviceId)}` : ''
    fetch(`/api/turno/${encodeURIComponent(handle)}/huecos${qs}`)
      .then((r) => r.json())
      .then((d) => {
        if (!vigente) return
        const lista: DiaConHuecos[] = d.dias ?? []
        setDias(lista)
        // El primer día con lugar, abierto: el que entra a pedir turno quiere
        // el más cercano, y hacerle tocar dos veces para verlo es fricción.
        setDiaAbierto(lista[0]?.fecha ?? null)
        // Cambiar de servicio cambia los huecos, así que lo elegido antes puede
        // ya no existir. Se limpia en vez de dejar una hora que no se puede dar.
        onCambio('')
      })
      .catch(() => {
        if (vigente) setDias([])
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })
    return () => {
      vigente = false
    }
    // `onCambio` se deja afuera a propósito: viene del padre y cambia en cada
    // render, así que incluirlo dispararía la consulta en bucle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle, serviceId])

  if (cargando) {
    return <p className="text-sm text-[color:var(--color-tenue)]">Buscando horarios…</p>
  }

  // Sin huecos: se dice y se deja pedir igual. El taller acomoda al confirmar,
  // que es exactamente como funcionaba antes de esta pantalla.
  if (!dias || dias.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <p className="rounded-lg border border-[color:var(--color-linea)] bg-[color:var(--color-linea)]/20 p-3 text-sm">
          No pudimos ver la agenda de este taller. Elegí cuándo te queda cómodo y ellos te
          confirman.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Día</span>
            <input
              type="date"
              name="dia"
              min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
              required
              className="rounded-lg border border-[color:var(--color-linea)] p-2.5"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Hora</span>
            <input
              type="time"
              name="hora"
              step={900}
              required
              className="rounded-lg border border-[color:var(--color-linea)] p-2.5"
            />
          </label>
        </div>
      </div>
    )
  }

  const abierto = dias.find((d) => d.fecha === diaAbierto) ?? dias[0]

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium">¿Cuándo?</span>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {dias.map((d) => {
          const activo = d.fecha === abierto.fecha
          return (
            <button
              key={d.fecha}
              type="button"
              onClick={() => setDiaAbierto(d.fecha)}
              className={`shrink-0 rounded-lg border px-3 py-2 text-center text-sm transition-colors ${
                activo
                  ? 'border-[color:var(--color-acento)] bg-[color:var(--color-acento)]/10'
                  : 'border-[color:var(--color-linea)]'
              }`}
            >
              <span className="block font-medium">{etiquetaDia(d.fecha)}</span>
              <span className="block text-xs text-[color:var(--color-tenue)]">
                {d.huecos.length} {d.huecos.length === 1 ? 'horario' : 'horarios'}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {abierto.huecos.map((h) => {
          const elegido = valor === h.inicio
          return (
            <button
              key={h.inicio}
              type="button"
              onClick={() => onCambio(h.inicio)}
              aria-pressed={elegido}
              className={`rounded-lg border px-3 py-2 text-sm tabular-nums transition-colors ${
                elegido
                  ? 'border-[color:var(--color-acento)] bg-[color:var(--color-acento)] text-white'
                  : 'border-[color:var(--color-linea)]'
              }`}
            >
              {h.hora}
            </button>
          )
        })}
      </div>

      {/* El input oculto es lo que viaja en el submit: así el formulario sigue
          siendo un form normal y no depende de estado para enviarse. */}
      <input type="hidden" name="inicio" value={valor} />
    </div>
  )
}

/** "Lun 8/9". Con día de la semana, que es como uno piensa un turno. */
function etiquetaDia(fecha: string): string {
  const [y, m, d] = fecha.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  return `${dias[dt.getUTCDay()]} ${d}/${m}`
}
