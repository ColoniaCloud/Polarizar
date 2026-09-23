'use client'

import { Fragment, useEffect, useRef, useState } from 'react'

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
 * El degradé oscuro es más cerrado arriba y abajo que en el medio: no está
 * para ambientar, está para que el contenido sea el protagonista y se lea
 * sobre cualquier foto — incluida una clara, o una con cielo de fondo, que es
 * donde el texto blanco desaparece. Arriba además carga la cabecera, que
 * mientras está sobre la foto va transparente y en blanco.
 *
 * Al scrollear, el contenido se queda atrás de la foto (parallax) y se va
 * apagando. El mismo listener avisa hacia arriba cuándo se pasó la mitad del
 * hero, que es donde la cabecera deja de ser transparente: es un solo cálculo
 * por cuadro para las dos cosas, y el aviso es un booleano, así que React
 * descarta solo los cuadros en los que no cambió nada.
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
  onSobreFoto,
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
  /**
   * `true` mientras la cabecera todavía está sobre la foto (primera mitad del
   * hero). Tiene que ser una función estable — un `setState` sirve — porque
   * entra en las dependencias del efecto de scroll.
   */
  onSobreFoto?: (sobreFoto: boolean) => void
}) {
  const [actual, setActual] = useState(0)
  const seccionRef = useRef<HTMLElement>(null)
  const contenidoRef = useRef<HTMLDivElement>(null)
  const hayVarias = slides.length > 1
  const datos = [direccion, horarioTexto].filter((d): d is string => Boolean(d))

  // `actual` entra en las dependencias a propósito: tocar un puntito reinicia
  // la cuenta, así una foto elegida a mano no se va sola medio segundo después.
  useEffect(() => {
    if (!hayVarias) return
    const id = setTimeout(() => setActual((i) => (i + 1) % slides.length), MS_POR_FOTO)
    return () => clearTimeout(id)
  }, [actual, hayVarias, slides.length])

  useEffect(() => {
    const seccion = seccionRef.current
    if (!seccion) return

    const quietito = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let encolado = false

    function actualizar() {
      encolado = false
      const seccion = seccionRef.current
      if (!seccion) return

      const alto = seccion.offsetHeight
      const y = window.scrollY
      onSobreFoto?.(y < alto / 2)

      const contenido = contenidoRef.current
      if (quietito || !contenido) return
      // 0.35 = la foto se va entera y el contenido recorre un tercio: si fuera
      // 1 no habría parallax, y más cerca de 1 el contenido se despega tanto
      // que sale por abajo del hero antes de terminar de leerse.
      const avance = Math.min(y / alto, 1)
      contenido.style.transform = `translate3d(0, ${(y * 0.35).toFixed(1)}px, 0)`
      contenido.style.opacity = String(Math.max(1 - avance * 1.4, 0))
    }

    function alScrollear() {
      // Un solo cálculo por cuadro: el evento de scroll se dispara muchas más
      // veces de las que el navegador llega a dibujar.
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
      // Si el hero se desmonta, la cabecera no puede quedarse transparente
      // sobre una foto que ya no está.
      onSobreFoto?.(false)
    }
  }, [onSobreFoto])

  if (slides.length === 0) return null

  return (
    <section
      ref={seccionRef}
      className="relative mt-[calc(var(--alto-cabecera)*-1)] h-[calc(40vh_+_var(--alto-cabecera))] w-full overflow-hidden bg-black md:h-[calc(52vh_+_var(--alto-cabecera))]"
    >
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

      {/* Cerrado en las dos puntas y más abierto en el medio: arriba tiene que
          aguantar la cabecera transparente y abajo el corte con la sección que
          sigue, pero en ninguna parte baja de 0.45 — el contenido está
          centrado y ahí también tiene que leerse, sobre la foto que sea. */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.6)_22%,rgba(0,0,0,0.46)_50%,rgba(0,0,0,0.68)_80%,rgba(0,0,0,0.88)_100%)]" />

      <div className="absolute inset-0 flex items-center">
        <div
          ref={contenidoRef}
          className="mx-auto w-full max-w-[1280px] px-4 py-10 will-change-transform md:px-6"
        >
          <div className="mx-auto max-w-[800px] text-center text-white">
            <h1 className="animate-[fadeInUp_0.7s_ease-out] text-3xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-4xl md:text-5xl lg:text-[4.2rem]">
              {/* El espacio entre palabras es un espacio de verdad y no un
                  margen. Con margen, el texto del h1 era "PolarizadosdelSur":
                  así lo leía Google, así lo anunciaba un lector de pantalla y
                  así se copiaba — y el nombre del taller en el h1 es
                  justamente lo que alguien busca después de que se lo
                  recomiendan. */}
              {nombre.split(' ').map((palabra, index) => (
                <Fragment key={`${palabra}-${index}`}>
                  {index > 0 && ' '}
                  <span
                    className="inline-block opacity-0 animate-[heroWordIn_0.55s_ease-out_forwards]"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {palabra}
                  </span>
                </Fragment>
              ))}
            </h1>

            {(datos.length > 0 || abierto !== null) && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-white/90 md:text-sm">
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

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 animate-[fadeInUp_0.7s_ease-out_0.35s_forwards] opacity-0">
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

      {/* El puntito se ve de 10px pero el botón mide 44: en un teléfono un
          objetivo de 10px se falla más veces de las que se acierta. El tamaño
          visible lo pone el `span`, el táctil el `button`. */}
      {hayVarias && (
        <div className="absolute inset-x-0 bottom-1 z-10 flex items-center justify-center">
          {slides.map((slide, index) => (
            <button
              key={`${slide.image}-dot-${index}`}
              type="button"
              aria-label={`Ir a la imagen ${index + 1}`}
              aria-current={index === actual}
              onClick={() => setActual(index)}
              className="flex size-11 items-center justify-center"
            >
              <span
                className={`block h-2.5 rounded-full transition-all ${
                  index === actual ? 'w-7 bg-white' : 'w-2.5 bg-white/50'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
