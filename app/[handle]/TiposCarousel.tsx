import type { ReactNode } from 'react'
import type { PublicWorkshop } from '@/lib/crm'
import { TIPOS_VEHICULO } from '@/lib/vehiculos'
import { TIPOS_INMUEBLE } from '@/lib/inmuebles'
import { Casa, Oficina, Local, Edificio, Otro } from './iconos'

const ICONOS_INMUEBLE: Record<string, () => React.JSX.Element> = {
  CASA: Casa,
  OFICINA: Oficina,
  LOCAL: Local,
  EDIFICIO: Edificio,
  OTRO: Otro,
}

/**
 * "Aplicamos láminas en:" — un carousel horizontal de a qué se le aplica la
 * lámina. Autos si el taller es automotriz, inmuebles si es de arquitectura,
 * los dos juntos si hace ambas cosas.
 *
 * `scroll-snap` a mano y no una librería: no hay ninguna instalada en este
 * repo, y el resto de `polarizar` evita dependencias a propósito.
 */
export default function TiposCarousel({ taller }: { taller: PublicWorkshop }) {
  const items: { key: string; label: string; render: ReactNode }[] = []

  if (taller.rubros.automotriz) {
    for (const v of TIPOS_VEHICULO) {
      items.push({
        key: v.slug,
        label: v.label,
        // eslint-disable-next-line @next/next/no-img-element
        render: <img src={v.icon} alt="" className="h-14 w-auto object-contain" />,
      })
    }
  }

  if (taller.rubros.arquitectura) {
    for (const t of TIPOS_INMUEBLE) {
      const Icono = ICONOS_INMUEBLE[t.slug] ?? Otro
      items.push({
        key: t.slug,
        label: t.label,
        render: (
          <div className="text-[color:var(--color-acento)] [&>svg]:size-10">
            <Icono />
          </div>
        ),
      })
    }
  }

  if (items.length === 0) return null

  return (
    <section className="border-t border-[color:var(--color-linea)] py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="mb-6 text-xl font-semibold">Aplicamos láminas en:</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 [scroll-snap-type:x_mandatory]">
          {items.map((it) => (
            <div
              key={it.key}
              className="flex w-28 shrink-0 flex-col items-center gap-3 rounded-xl border border-[color:var(--color-linea)] bg-[color:var(--color-superficie)] px-4 py-5 [scroll-snap-align:start]"
            >
              <div className="flex h-14 items-center justify-center">{it.render}</div>
              <span className="text-center text-xs font-medium text-[color:var(--color-tenue)]">
                {it.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
