import type { CSSProperties } from 'react'

/**
 * El *border beam* de MagicUI: un haz de luz que da vueltas por el borde de
 * una tarjeta.
 *
 * Va **adentro** del elemento al que le recorre el borde, que tiene que ser
 * `relative` y tener su propio `rounded-*` — el haz hereda ese radio. Se
 * pueden montar dos o más encima para que se crucen (es la variante de dos
 * haces): cada uno con su color y su `retraso`.
 *
 * La mecánica —las máscaras que dejan ver solo el anillo del borde y el
 * `offset-path` que lleva el haz— está en `globals.css`, en `.borde-haz`.
 * Acá solo viajan los parámetros. Es CSS y no framer-motion, que es lo que
 * usa el original: este repo no tiene dependencias de animación instaladas.
 *
 * Es decorativo puro, así que va `aria-hidden`.
 */
export default function BorderBeam({
  color,
  tamano = 400,
  duracion = 6,
  retraso = 0,
  ancho = 1,
  desenfoque = 0,
}: {
  /** Cualquier color CSS. Se dibuja como un degradé que nace y muere transparente. */
  color: string
  /** Lado del cuadrado de luz, en px: cuanto más grande, más largo el haz. */
  tamano?: number
  /** Cuánto tarda en dar una vuelta entera, en segundos. */
  duracion?: number
  /** En qué punto de la vuelta arranca, en segundos — ver el comentario de abajo. */
  retraso?: number
  /** Grosor del haz, en px. */
  ancho?: number
  /**
   * Cuánto se desenfoca, en px. Con 0 el haz es una línea nítida sobre el
   * borde; subiéndolo deja de leerse como una línea y pasa a leerse como una
   * sombra de color que se mueve, que es lo que se busca cuando la tarjeta no
   * tiene un borde fijo abajo del haz.
   */
  desenfoque?: number
}) {
  return (
    <div
      aria-hidden="true"
      className="borde-haz"
      style={
        {
          '--haz-color': color,
          '--haz-tamano': tamano,
          '--haz-duracion': `${duracion}s`,
          // Negativo a propósito, igual que el `delay: -delay` del original:
          // un retraso positivo dejaría el haz apagado en la esquina esperando
          // su turno, y lo que se quiere es que arranque con la vuelta ya
          // empezada. Con `retraso` = mitad de `duracion`, dos haces quedan
          // enfrentados en el borde.
          '--haz-retraso': `-${retraso}s`,
          '--haz-ancho': ancho,
          '--haz-desenfoque': `${desenfoque}px`,
        } as CSSProperties
      }
    >
      <span />
    </div>
  )
}
