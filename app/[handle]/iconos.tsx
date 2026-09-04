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
