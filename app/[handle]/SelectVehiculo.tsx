'use client'

import { useEffect, useRef, useState } from 'react'
import { TIPOS_VEHICULO } from '@/lib/vehiculos'
import { Chevron, Check } from './iconos'

/**
 * Elegir el tipo de vehículo, con la silueta a la vista.
 *
 * Es un desplegable hecho a mano y no un `<select>` porque **el nativo no puede
 * mostrar imágenes**: en las opciones de un select solo entra texto. Y la
 * silueta importa más que la palabra — alguien reconoce su auto en el dibujo
 * antes de terminar de leer «Van / Minibús», sobre todo en un teléfono.
 *
 * El valor viaja en un input oculto, así que el formulario sigue siendo un form
 * normal y no depende del estado de React para enviarse.
 */
export default function SelectVehiculo({
  name,
  valor,
  onCambio,
  error,
}: {
  name: string
  valor: string
  onCambio: (slug: string) => void
  error?: boolean
}) {
  const [abierto, setAbierto] = useState(false)
  const caja = useRef<HTMLDivElement>(null)
  const elegido = TIPOS_VEHICULO.find((v) => v.slug === valor)

  // Cerrar al tocar afuera y con Escape. Sin esto el panel queda abierto tapando
  // los campos de abajo, que en un teléfono es media pantalla perdida.
  useEffect(() => {
    if (!abierto) return
    const fuera = (e: MouseEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false)
    }
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', esc)
    }
  }, [abierto])

  return (
    <div ref={caja} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        className={`flex w-full items-center justify-between gap-3 rounded-lg border p-2.5 text-left ${
          error ? 'border-red-500' : 'border-[color:var(--color-linea)]'
        } bg-[color:var(--color-superficie)]`}
      >
        <span className="flex min-w-0 items-center gap-3">
          {elegido ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={elegido.icon} alt="" className="h-7 w-10 shrink-0 object-contain" />
              <span className="truncate">{elegido.label}</span>
            </>
          ) : (
            <span className="text-[color:var(--color-tenue)]">Elegí tu vehículo</span>
          )}
        </span>
        <Chevron />
      </button>

      {abierto && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-[color:var(--color-linea)] bg-[color:var(--color-superficie)] p-1 shadow-xl"
        >
          {TIPOS_VEHICULO.map((v) => {
            const activo = v.slug === valor
            return (
              <li key={v.slug}>
                <button
                  type="button"
                  role="option"
                  aria-selected={activo}
                  onClick={() => {
                    onCambio(v.slug)
                    setAbierto(false)
                  }}
                  className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left ${
                    activo ? 'bg-[color:var(--color-acento)]/10' : 'hover:bg-black/5'
                  }`}
                >
                  {/* Los SVG son de trazo oscuro y la página es clara, así que
                      van tal cual: invertirlos los haría desaparecer. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={v.icon} alt="" className="h-8 w-12 shrink-0 object-contain" />
                  <span className="flex-1">{v.label}</span>
                  {activo && <Check />}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <input type="hidden" name={name} value={valor} />
    </div>
  )
}
