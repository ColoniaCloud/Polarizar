'use client'

import { Fragment, useEffect, useState } from 'react'

type HeroSlide = {
  image: string
  alt?: string
}

/** Cada cuánto pasa sola a la foto siguiente. */
const MS_POR_FOTO = 6000

/**
 * El hero de la página del taller.
 *
 * **La foto va de borde a borde y arranca pegada arriba de todo.** Es lo
 * primero que se ve al abrir el link, así que no vive en la columna de
 * contenido como el resto de las secciones: ocupa el ancho entero y se sube
 * `--alto-cabecera` (`globals.css`) con un margen negativo, que es justo lo
 * que mide la cabecera flotante — así la cabecera queda *encima* de la foto y
 * no antes, y arriba de la foto no queda ninguna franja de fondo.
 *
 * El degradé oscuro sube desde el borde de abajo y se desvanece antes de la
 * mitad: no está para ambientar, está para que el nombre, la dirección y los
 * botones se lean sobre cualquier foto — incluida una clara, o una con cielo
 * de fondo, que es donde el texto blanco desaparece.
 *
 * El contenido, en cambio, **sí** respeta la columna de contenido
 * (`max-w-[1280px]` y el mismo padding lateral que el resto de la página): el
 * nombre del taller arranca en la misma línea vertical que "Nosotros:" de la
 * sección siguiente, y no pegado al borde de la pantalla.
 *
 * Las fotos se cruzan con un fundido y no con un desplazamiento lateral: al
 * volver de la última a la primera, un desplazamiento se ve rebobinar toda la
 * tira para atrás; el fundido no tiene ese salto.
 */
export default function HeroTaller({
  slides,
  nombre,
  direccion,
  horarioTexto,
  abierto,
  onAgendar,
  onWhatsApp,
}: {
  slides: HeroSlide[]
  nombre: string
  /** `null` cuando el taller todavía no cargó dirección: se omite, no se rellena. */
  direccion: string | null
  /** "Lunes a viernes, 09:00 a 18:00", o `null` si no cargó horario. */
  horarioTexto: string | null
  /** `null` = todavía no se sabe si está abierto; ahí no se dibuja el cartel. */
  abierto: boolean | null
  onAgendar: () => void
  /** `undefined` cuando el taller no cargó teléfono: ahí no se dibuja el botón. */
  onWhatsApp?: () => void
}) {
  const [actual, setActual] = useState(0)
  const hayVarias = slides.length > 1
  const datos = [direccion, horarioTexto].filter((d): d is string => Boolean(d))

  // `actual` entra en las dependencias a propósito: tocar un puntito reinicia
  // la cuenta, así una foto elegida a mano no se va sola medio segundo después.
  useEffect(() => {
    if (!hayVarias) return
    const id = setTimeout(() => setActual((i) => (i + 1) % slides.length), MS_POR_FOTO)
    return () => clearTimeout(id)
  }, [actual, hayVarias, slides.length])

  if (slides.length === 0) return null

  return (
    <section className="relative mt-[calc(var(--alto-cabecera)*-1)] h-[calc(40vh_+_var(--alto-cabecera))] w-full overflow-hidden bg-black md:h-[calc(52vh_+_var(--alto-cabecera))]">
      {slides.map((slide, index) => (
        <div
          key={`${slide.image}-${index}`}
          aria-hidden={index !== actual}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            index === actual ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.image}
            alt={slide.alt ?? nombre}
            className="h-full w-full object-cover"
          />
        </div>
      ))}

      {/* Empieza opaco abajo y se termina antes de la mitad: la parte de arriba
          de la foto queda limpia, que es la que se ve detrás de la cabecera. */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.66)_20%,rgba(0,0,0,0.32)_45%,rgba(0,0,0,0.08)_70%,transparent_100%)]" />

      <div className="absolute inset-0 flex items-end">
        <div className="mx-auto w-full max-w-[1280px] px-4 pb-14 md:px-6 md:pb-20">
          <div className="max-w-[800px] text-white">
            <h1 className="animate-[fadeInUp_0.7s_ease-out] text-3xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-4xl md:text-5xl lg:text-[4.2rem]">
              {nombre.split(' ').map((word, index) => (
                <span
                  key={`${word}-${index}`}
                  className="mr-2 inline-block opacity-0 animate-[heroWordIn_0.55s_ease-out_forwards]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {word}
                </span>
              ))}
            </h1>

            {(datos.length > 0 || abierto !== null) && (
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/90 md:text-sm">
                {datos.map((dato, index) => (
                  <Fragment key={dato}>
                    {index > 0 && <span className="opacity-60">•</span>}
                    <span
                      className="animate-[fadeInUp_0.7s_ease-out_forwards] opacity-0"
                      style={{ animationDelay: `${200 + index * 50}ms` }}
                    >
                      {dato}
                    </span>
                  </Fragment>
                ))}

                {abierto !== null && (
                  <span className="rounded-full border border-white/30 bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-white/90 md:text-[11px]">
                    {abierto ? 'Abierto ahora' : 'Cerrado'}
                  </span>
                )}
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3 animate-[fadeInUp_0.7s_ease-out_0.35s_forwards] opacity-0">
              <button
                type="button"
                onClick={onAgendar}
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-acento)] px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] md:px-7 md:py-3.5 md:text-base"
              >
                Reservar turno
              </button>

              {/* `#25d366` es el verde oficial de WhatsApp, y va literal y no
                  como token del tema: el resto de los colores de la página los
                  elige el taller, este es de otra marca y no se toca. El relleno
                  queda casi transparente — el botón es el secundario, el primario
                  sigue siendo reservar el turno. */}
              {onWhatsApp && (
                <button
                  type="button"
                  onClick={onWhatsApp}
                  className="inline-flex items-center justify-center rounded-full border border-[#25d366] bg-[#25d366]/15 px-4 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:scale-[1.02] hover:bg-[#25d366]/25 md:px-6 md:py-3.5 md:text-base"
                >
                  Whatsapp
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {hayVarias && (
        <div className="absolute inset-x-0 bottom-5 z-10 flex items-center justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={`${slide.image}-dot-${index}`}
              type="button"
              aria-label={`Ir a la imagen ${index + 1}`}
              aria-current={index === actual}
              onClick={() => setActual(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === actual ? 'w-7 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
