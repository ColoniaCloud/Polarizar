import type { CSSProperties } from 'react'

/**
 * Los 4 presets de color de fondo que el instalador elige desde Mi Taller.
 *
 * Curados a mano y no un color picker libre: un picker libre podría dar
 * combinaciones illegibles (un gris medio con texto gris medio), y el pedido
 * fue "elegir entre tonos muy oscuros/negro y muy claros/blanco" — un
 * conjunto chico de opciones ya probadas cumple eso sin ese riesgo.
 *
 * Solo 5 tokens cambian por preset (fondo/superficie/línea/texto/texto
 * tenue). `--color-acento` se queda fijo en todos: es el celeste de marca, y
 * tiene que reconocerse igual sin importar el fondo.
 */
export type PageTheme = 'BLANCO' | 'GRIS_CLARO' | 'GRIS_OSCURO' | 'NEGRO'

/**
 * El acento sí es un preset aparte del fondo: cambia solo el color de
 * botones/links/íconos activos, no la paleta entera. Mismo criterio de
 * "swatches curados y no un color picker libre" que `PageTheme` — el acento
 * siempre lleva texto blanco encima en los botones sólidos (ver los usos de
 * `bg-[color:var(--color-acento)] text-white]` en el resto de la página), así
 * que cada opción está elegida a mano para que ese contraste funcione.
 */
export type AccentColor = 'AZUL' | 'VERDE' | 'VIOLETA' | 'ROJO' | 'NARANJA' | 'ROSA'

interface Paleta {
  fondo: string
  superficie: string
  linea: string
  tinta: string
  tenue: string
}

const ACENTOS: Record<AccentColor, string> = {
  AZUL: '#0284c7',
  VERDE: '#059669',
  VIOLETA: '#7c3aed',
  ROJO: '#dc2626',
  NARANJA: '#ea580c',
  ROSA: '#db2777',
}

const PALETAS: Record<PageTheme, Paleta> = {
  // Es la paleta que ya vivía fija en `globals.css` — con este preset (el
  // default) el resultado es idéntico a como se veía la página antes de que
  // existiera el selector.
  BLANCO: {
    fondo: '#ffffff',
    superficie: '#f6f8fa',
    // Antes #e3e6ea: contra la superficie (#f6f8fa) el salto era de menos de
    // un 10% de luminosidad, así que un campo de formulario se veía sin
    // borde. Este valor da un salto que se nota sin ser un gris duro.
    linea: '#c7ccd3',
    tinta: '#1e242c',
    tenue: '#6b7480',
  },
  GRIS_CLARO: {
    fondo: '#eceff1',
    superficie: '#f6f7f8',
    linea: '#c2c7cc',
    tinta: '#20242a',
    tenue: '#5c636b',
  },
  GRIS_OSCURO: {
    fondo: '#20242a',
    superficie: '#2a2f36',
    linea: '#4c5560',
    tinta: '#f4f5f7',
    tenue: '#9aa1ab',
  },
  NEGRO: {
    fondo: '#0a0a0a',
    superficie: '#161616',
    linea: '#3d3d3d',
    tinta: '#fafafa',
    tenue: '#9a9a9a',
  },
}

/**
 * Las variables CSS del preset elegido, para pisar las de `globals.css` en un
 * `style={...}` sobre el contenedor de la página. Con `BLANCO`+`AZUL` (los
 * defaults) no hace falta pisar nada, pero se devuelve igual por simplicidad
 * — pisar con el mismo valor no cambia nada visible.
 */
export function variablesDelTema(tema: PageTheme, acento: AccentColor): CSSProperties {
  const p = PALETAS[tema]
  return {
    '--color-fondo': p.fondo,
    '--color-superficie': p.superficie,
    '--color-linea': p.linea,
    '--color-tinta': p.tinta,
    '--color-tenue': p.tenue,
    '--color-acento': ACENTOS[acento],
  } as CSSProperties
}
