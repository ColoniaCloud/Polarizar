'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Aparece desenfocado y se va enfocando, cuando entra en pantalla.
 *
 * **Se dispara al entrar y no al cargar la página.** Estas secciones están
 * bien abajo: una animación lanzada en el `load` ya terminó cuando alguien
 * llega scrolleando, así que lo único que se consigue es pagarla sin que
 * nadie la vea.
 *
 * Cada elemento recibe su `retraso` y su `duracion` en lugar de compartirlos.
 * Con todos iguales, media sección aparece de golpe como un bloque; con
 * tiempos distintos se arma sola, que es el efecto que se busca.
 *
 * Pasa una sola vez: el observador se desconecta al primer cruce. Volver a
 * animar cada vez que se scrollea para arriba y para abajo cansa rápido.
 *
 * ─── Por qué el contenido arranca visible ──────────────────────────────────
 *
 * Una animación de entrada esconde el contenido hasta que algo la dispara, y
 * eso la vuelve peligrosa: si ese algo no llega, la sección no aparece nunca.
 * No es hipotético — se vio en una pestaña que el navegador reportaba como
 * visible pero no estaba dibujando: sin ciclo de render no hay callbacks de
 * `IntersectionObserver`, el disparo no llegó y la sección entera quedó en
 * blanco.
 *
 * Así que el orden está invertido a propósito. El HTML sale **visible**, y
 * recién cuando este componente comprueba que puede animar —hay JavaScript,
 * hay observador y el observador responde— esconde el contenido para
 * mostrarlo con la animación. Si algo de eso falla, lo único que se pierde es
 * el efecto.
 *
 * La comprobación es el primer callback del observador, que un observador
 * sano emite siempre y enseguida, esté o no el elemento en pantalla. Si en
 * `MS_DE_GRACIA` no dijo nada, está roto y se deja todo quieto y visible.
 *
 * Esto sirve porque estas secciones viven abajo del todo: nadie ve el
 * instante en que pasa de visible a escondida. Arriba del pliegue se vería
 * un parpadeo, y ahí este componente no va.
 */

/** Cuánto se espera la primera respuesta del observador antes de rendirse. */
const MS_DE_GRACIA = 600

export default function EntradaDifusa({
  retraso = 0,
  duracion = 700,
  className = '',
  children,
}: {
  /** Cuánto espera antes de empezar, en ms. */
  retraso?: number
  /** Cuánto tarda en enfocarse, en ms. */
  duracion?: number
  className?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [estado, setEstado] = useState<'quieto' | 'esperando' | 'animando'>('quieto')

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (sinMovimiento || typeof IntersectionObserver === 'undefined') return

    let respondio = false

    const observador = new IntersectionObserver(
      ([entrada]) => {
        respondio = true
        if (!entrada.isIntersecting) {
          // Contestó y todavía no está en pantalla: el observador funciona,
          // así que se puede esconder sin riesgo de que quede escondido.
          setEstado('esperando')
          return
        }
        setEstado('animando')
        observador.disconnect()
      },
      // Un poco adentro de la pantalla y no apenas asoma: arrancar con el
      // borde de arriba todavía fuera hace que la animación se termine antes
      // de que el elemento se pueda leer.
      { rootMargin: '0px 0px -12% 0px' }
    )
    observador.observe(el)

    const rendicion = setTimeout(() => {
      if (!respondio) observador.disconnect()
    }, MS_DE_GRACIA)

    return () => {
      clearTimeout(rendicion)
      observador.disconnect()
    }
  }, [])

  return (
    <div
      ref={ref}
      className={`${className} ${estado === 'esperando' ? 'opacity-0' : ''}`}
      style={
        estado === 'animando'
          ? {
              // `both` y no `forwards`: con `forwards` el elemento se queda
              // en su estado natural — visible — durante el retraso, así que
              // el que esperaba 470 ms se veía medio segundo, desaparecía de
              // golpe al arrancar su animación y volvía a aparecer. Medido en
              // producción. `both` también aplica el primer fotograma antes
              // de empezar, así que espera escondido, que es el punto de
              // escalonar las entradas.
              animation: `entrada-difusa ${duracion}ms cubic-bezier(0.22, 1, 0.36, 1) ${retraso}ms both`,
            }
          : undefined
      }
    >
      {children}
    </div>
  )
}
