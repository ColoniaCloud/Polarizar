'use client'

import { TIPOS_INMUEBLE } from '@/lib/inmuebles'
import { Casa, Oficina, Local, Edificio, Otro } from './iconos'

/**
 * Qué tipo de inmueble es.
 *
 * **Botones a la vista y no un desplegable**, al revés que el de vehículos: son
 * cinco opciones cortas y entran todas en pantalla, así que esconderlas detrás
 * de un panel agrega un toque sin ahorrar nada. En vehículos son nueve con
 * dibujos grandes y ahí el desplegable sí paga.
 *
 * El valor viaja en un input oculto, igual que el de vehículos, para que el
 * formulario siga siendo un form normal.
 */

const ICONOS: Record<string, () => React.JSX.Element> = {
  CASA: Casa,
  OFICINA: Oficina,
  LOCAL: Local,
  EDIFICIO: Edificio,
  OTRO: Otro,
}

export default function SelectInmueble({
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
  return (
    <div className="flex flex-col gap-1.5">
      <div
        role="radiogroup"
        aria-label="Tipo de inmueble"
        className={`grid grid-cols-2 gap-2 sm:grid-cols-3 ${
          error ? 'rounded-lg ring-1 ring-red-500' : ''
        }`}
      >
        {TIPOS_INMUEBLE.map((t) => {
          const Icono = ICONOS[t.slug] ?? Otro
          const activo = t.slug === valor
          return (
            <button
              key={t.slug}
              type="button"
              role="radio"
              aria-checked={activo}
              onClick={() => onCambio(t.slug)}
              className={`flex items-center gap-2.5 rounded-lg border p-3 text-left text-sm transition-colors ${
                activo
                  ? 'border-[color:var(--color-acento)] bg-[color:var(--color-acento)]/10'
                  : 'border-[color:var(--color-linea)] bg-[color:var(--color-superficie)]'
              }`}
            >
              <span className="shrink-0 text-[color:var(--color-tenue)]">
                <Icono />
              </span>
              <span className="min-w-0">{t.label}</span>
            </button>
          )
        })}
      </div>

      <input type="hidden" name={name} value={valor} />
    </div>
  )
}
