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

export default function TiposCarousel({ taller }: { taller: PublicWorkshop }) {
  const items: { key: string; label: string; render: ReactNode }[] = []

  if (taller.rubros.automotriz) {
    for (const v of TIPOS_VEHICULO) {
      items.push({
        key: v.slug,
        label: v.label,
        // eslint-disable-next-line @next/next/no-img-element
        render: <img src={v.icon} alt={v.label} className="h-8 w-8 object-contain md:h-9 md:w-9" />,
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
          <div className="flex items-center justify-center text-[color:var(--color-acento)] [&>svg]:size-7 [&>svg]:md:size-8">
            <Icono />
          </div>
        ),
      })
    }
  }

  if (items.length === 0) return null

  const visibleItems = [...items, ...items]

  return (
    <section className="bg-[color:var(--color-realce)] py-10 md:py-14">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <h2 className="mb-6 text-xl font-semibold text-[color:var(--color-tinta)]">Aplicamos láminas en:</h2>

        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[color:var(--color-realce)] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[color:var(--color-realce)] to-transparent" />

          <div className="flex w-max gap-4" style={{ animation: 'marquee-left 26s linear infinite' }}>
            {visibleItems.map((it, index) => (
              <div
                key={`${it.key}-${index}`}
                className="group flex w-24 shrink-0 flex-col items-center gap-2 px-2 py-3 transition-transform duration-200 hover:-translate-y-0.5 md:w-28"
              >
                <div className="flex h-12 items-center justify-center text-[color:var(--color-acento)] transition-transform duration-200 group-hover:scale-110">
                  {it.render}
                </div>
                <span className="text-center text-[10px] font-medium text-[color:var(--color-tenue)] md:text-xs">
                  {it.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
