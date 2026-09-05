/**
 * Los pocos íconos que usa la página del taller, dibujados a mano.
 *
 * Sin librería a propósito: son tres, y traer un paquete de íconos entero para
 * eso son cientos de KB que paga el cliente en su teléfono para ver una
 * hamburguesa.
 */

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export function Menu() {
  return (
    <svg {...base} className="size-5">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function X() {
  return (
    <svg {...base} className="size-5">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function Check() {
  return (
    <svg {...base} className="size-4">
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  )
}

export function Chevron() {
  return (
    <svg {...base} className="size-4">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function Camara() {
  return (
    <svg {...base} className="size-5">
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.7a1 1 0 0 0 .83-.45l.94-1.4A1 1 0 0 1 9.8 3.7h4.4a1 1 0 0 1 .83.45l.94 1.4A1 1 0 0 0 16.8 6h1.7A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5Z" />
      <circle cx="12" cy="12.5" r="3.4" />
    </svg>
  )
}

// ─── Inmuebles ───────────────────────────────────────────────────────────────
//
// Un inmueble no tiene una silueta que se reconozca de un vistazo como la tiene
// una pickup, asi que estos no reemplazan al texto: lo acompanan. Por eso van
// dibujados a mano y chicos, en vez de traer una libreria entera.

export function Casa() {
  return (
    <svg {...base} className="size-5">
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.8V20h12V9.8" />
      <path d="M10 20v-5h4v5" />
    </svg>
  )
}

export function Oficina() {
  return (
    <svg {...base} className="size-5">
      <path d="M4 20V6.5A1.5 1.5 0 0 1 5.5 5h9A1.5 1.5 0 0 1 16 6.5V20" />
      <path d="M16 11h2.5A1.5 1.5 0 0 1 20 12.5V20" />
      <path d="M3 20h18" />
      <path d="M7.5 9h1M11.5 9h1M7.5 13h1M11.5 13h1" />
    </svg>
  )
}

export function Local() {
  return (
    <svg {...base} className="size-5">
      <path d="M4 9.5 5.5 5h13L20 9.5" />
      <path d="M4 9.5a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" />
      <path d="M5.5 11.5V20h13v-8.5" />
      <path d="M9.5 20v-4.5h5V20" />
    </svg>
  )
}

export function Edificio() {
  return (
    <svg {...base} className="size-5">
      <path d="M6 20V4.5A.5.5 0 0 1 6.5 4h11a.5.5 0 0 1 .5.5V20" />
      <path d="M3 20h18" />
      <path d="M9 7.5h1.5M13.5 7.5H15M9 11h1.5M13.5 11H15M9 14.5h1.5M13.5 14.5H15" />
      <path d="M10.5 20v-2.5h3V20" />
    </svg>
  )
}

export function Otro() {
  return (
    <svg {...base} className="size-5">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.8 9.6a2.3 2.3 0 1 1 3.1 2.2c-.6.2-.9.7-.9 1.3v.4" />
      <path d="M12 16.6h.01" />
    </svg>
  )
}

export function Mapa() {
  return (
    <svg {...base} className="size-4">
      <path d="M12 21s6.5-5.6 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 15.4 12 21 12 21Z" />
      <circle cx="12" cy="10.6" r="2.4" />
    </svg>
  )
}
