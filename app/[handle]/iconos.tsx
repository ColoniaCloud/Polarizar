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

export function Chevron({ className = '' }: { className?: string } = {}) {
  return (
    <svg {...base} className={`size-4 ${className}`}>
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

// ─── Contacto y redes ────────────────────────────────────────────────────────
//
// Estos van rellenos (`fill`, no `stroke` como los de arriba) porque son
// glifos de marca reconocibles de un vistazo — el trazo fino no se lee igual
// a tamaño chico. Se usan en el header, en el hero y en el footer.

export function Whatsapp() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 5.83 2.42 8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.21-8.24 8.21Z" />
    </svg>
  )
}

export function Mail() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="m3 7 8.2 5.5a1.5 1.5 0 0 0 1.6 0L21 7" />
    </svg>
  )
}

export function Instagram() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.741 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.741 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.259 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.072 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.439.645 1.439 1.439z" />
    </svg>
  )
}

export function Facebook() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

export function Tiktok() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82c-.9-.6-1.56-1.53-1.78-2.62-.05-.24-.08-.49-.08-.75h-3.07v13.9c0 1.5-1.22 2.72-2.72 2.72a2.72 2.72 0 0 1-1.35-5.08 2.72 2.72 0 0 1 1.35-.36V10.5a5.84 5.84 0 0 0-5.84 5.84A5.84 5.84 0 0 0 8.95 22a5.84 5.84 0 0 0 5.84-5.84V9.4a7.1 7.1 0 0 0 4.15 1.33V7.6a3.98 3.98 0 0 1-2.34-.78z" />
    </svg>
  )
}

export function Google() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s7-6.2 7-11.2A7 7 0 0 0 5 9.8C5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  )
}
