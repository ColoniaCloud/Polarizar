'use client'

import { useEffect } from 'react'

/**
 * Congela el scroll de la página mientras hay un modal abierto.
 *
 * Sin esto, al llegar al final de un formulario largo el dedo sigue
 * arrastrando y lo que se mueve es la página de atrás: el modal parece
 * despegarse de su fondo y se pierde el lugar donde se estaba leyendo. Pasa
 * sobre todo en celular, que es donde más se usa esta página.
 *
 * El `padding-right` compensa el ancho de la barra de scroll en escritorio:
 * al ocultarla, la página se ensancharía de golpe y todo el contenido saltaría
 * unos píxeles a la derecha justo cuando aparece el modal.
 *
 * Guarda y restaura los valores previos en lugar de asumir que estaban
 * vacíos — dos modales abiertos en secuencia no se pisan entre sí.
 */
export function useScrollBloqueado(bloqueado: boolean) {
  useEffect(() => {
    if (!bloqueado) return

    const { body, documentElement } = document
    const overflowPrevio = body.style.overflow
    const paddingPrevio = body.style.paddingRight
    const barra = window.innerWidth - documentElement.clientWidth

    body.style.overflow = 'hidden'
    if (barra > 0) body.style.paddingRight = `${barra}px`

    return () => {
      body.style.overflow = overflowPrevio
      body.style.paddingRight = paddingPrevio
    }
  }, [bloqueado])
}
