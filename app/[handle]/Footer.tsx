'use client'

import { useEffect, useRef } from 'react'
import type { PublicWorkshop } from '@/lib/crm'
import { Instagram, Facebook, Tiktok, Google } from './iconos'

/**
 * El pie de página: tres columnas — marca del taller, navegación de la
 * página, y el respaldo de Kristall.
 *
 * Siempre oscuro, sin importar el `pageTheme` que haya elegido el taller —
 * mismo criterio que el footer de kristallfilm.com (`bg-[#1A1A1A]` fijo), y
 * es lo que hace que el logo de Kristall (`/cat/logob.svg`, pensado para
 * fondo oscuro) siempre se lea bien.
 *
 * El contenido entra con parallax: arranca desplazado hacia abajo y sube
 * hasta su lugar a medida que el pie se va descubriendo. Por eso el pie es
 * alto — el recorrido necesita aire para leerse como movimiento y no como un
 * salto, y un pie apretado no lo tiene.
 */

/** Cuánto sube el contenido, en px, entre que el pie asoma y queda entero. */
const RECORRIDO = 90

const REDES: { key: 'instagram' | 'facebook' | 'tiktok' | 'google'; label: string; icono: React.ReactNode }[] = [
  { key: 'instagram', label: 'Instagram', icono: <Instagram /> },
  { key: 'facebook', label: 'Facebook', icono: <Facebook /> },
  { key: 'tiktok', label: 'TikTok', icono: <Tiktok /> },
  { key: 'google', label: 'Google (Maps o Negocio)', icono: <Google /> },
]

export default function Footer({
  taller,
  logoUrl,
  onAgendar,
}: {
  taller: PublicWorkshop
  logoUrl: string | null
  onAgendar: () => void
}) {
  const redesActivas = REDES.filter((r) => taller.social[r.key])
  const pieRef = useRef<HTMLElement>(null)
  const contenidoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const pie = pieRef.current
    if (!pie) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let encolado = false

    function actualizar() {
      encolado = false
      const pie = pieRef.current
      const contenido = contenidoRef.current
      if (!pie || !contenido) return

      // 0 cuando el pie recién asoma por abajo, 1 cuando entró entero. Se
      // mide contra el alto del **pie** y no contra el de la pantalla: así
      // llega a 1 aunque el pie sea más alto que la ventana, que es
      // justamente el caso de este.
      const caja = pie.getBoundingClientRect()
      const avance = Math.min(Math.max((window.innerHeight - caja.top) / caja.height, 0), 1)
      contenido.style.transform = `translate3d(0, ${((1 - avance) * RECORRIDO).toFixed(1)}px, 0)`
    }

    function alScrollear() {
      if (encolado) return
      encolado = true
      requestAnimationFrame(actualizar)
    }

    actualizar()
    window.addEventListener('scroll', alScrollear, { passive: true })
    window.addEventListener('resize', alScrollear)
    return () => {
      window.removeEventListener('scroll', alScrollear)
      window.removeEventListener('resize', alScrollear)
    }
  }, [])

  return (
    <footer ref={pieRef} className="overflow-hidden bg-[#1A1A1A] px-6 py-20 text-white/80 md:py-28">
      <div
        ref={contenidoRef}
        className="mx-auto grid max-w-6xl gap-8 will-change-transform sm:grid-cols-3"
      >
        {/* Col 1: el taller */}
        <div className="flex flex-col items-start gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={taller.name} className="max-h-10 max-w-[10rem] object-contain" />
          ) : (
            <span className="text-base font-semibold text-white">{taller.name}</span>
          )}
          {redesActivas.length > 0 && (
            <div className="-ml-3 flex items-center">
              {redesActivas.map((r) => (
                <a
                  key={r.key}
                  href={taller.social[r.key] ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={r.label}
                  className="inline-flex size-11 items-center justify-center text-white/50 transition-colors hover:text-white"
                >
                  {r.icono}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Col 2: navegación de esta página */}
        {/* `gap-0` + `py-3` en cada link: 44px de alto para el dedo sin
            estirar la columna. Mismo criterio que los datos de contacto de
            arriba. */}
        <div className="flex flex-col gap-0 text-sm">
          <a href="#servicios" className="py-3 text-white/60 hover:text-white">
            Servicios
          </a>
          <a href="#donde-trabajamos" className="py-3 text-white/60 hover:text-white">
            Dónde trabajamos
          </a>
          <a href="#ubicacion" className="py-3 text-white/60 hover:text-white">
            Ubicación
          </a>
          {/* No hay una sección "agendar": el botón vive flotando sobre el
              hero y en el sidebar. Este es el único lugar donde no hay
              ancla posible, así que abre el wizard directo. */}
          <button type="button" onClick={onAgendar} className="py-3 text-left text-white/60 hover:text-white">
            Agendar un turno
          </button>
        </div>

        {/* Col 3: el respaldo de Kristall */}
        <div className="flex flex-col items-start gap-2 sm:items-end">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/cat/logob.svg" alt="Kristall Film" className="h-5 w-auto opacity-80" />
          <p className="text-xs text-white/50">Automotive &amp; Architectural Films</p>
          <a
            href="https://kristallfilm.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-white/50 hover:text-white"
          >
            kristallfilm.com
          </a>
        </div>
      </div>
    </footer>
  )
}
