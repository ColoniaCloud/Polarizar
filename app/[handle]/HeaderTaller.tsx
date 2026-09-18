import { Menu } from './iconos'

/**
 * El header de la página del taller: un módulo flotante angosto (ancho de
 * contenido, no de pantalla completa) despegado del borde superior.
 *
 * Tres elementos: el logo del taller a la izquierda, el respaldo de marca
 * ("Respaldado por" + el logo de Kristall) y, después de ese logo, el botón
 * que abre el menú lateral (`SidebarTaller`) — ahí vive la navegación por
 * secciones, el botón de agendar y las redes sociales, que antes vivían
 * sueltos en el header.
 */
export default function HeaderTaller({
  nombre,
  logoUrl,
  fondo,
  onAbrirMenu,
}: {
  nombre: string
  logoUrl: string | null
  /** Lo elige el taller según cómo se vea su logo. Ver `logoBackground`. */
  fondo: 'CLARO' | 'OSCURO'
  onAbrirMenu: () => void
}) {
  const oscura = fondo === 'OSCURO'

  return (
    <div className="sticky top-4 z-30 mx-auto max-w-6xl px-5">
      <header
        className={`flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 shadow-lg backdrop-blur md:py-5 ${
          oscura
            ? 'border-[color:var(--color-cabecera-oscura-linea)] bg-[color:var(--color-cabecera-oscura)]/95 text-[color:var(--color-cabecera-oscura-texto)]'
            : 'border-[color:var(--color-linea)] bg-[color:var(--color-fondo)]/90'
        }`}
      >
        <a href="#" className="flex min-w-0 items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={nombre} className="max-h-11 max-w-[10rem] object-contain" />
          ) : (
            <span className="truncate text-base font-semibold sm:text-lg">{nombre}</span>
          )}
        </a>

        <div className="flex shrink-0 items-center gap-3">
          {/* En celular va apilado (el texto arriba, chiquito) y no al lado:
              al lado le comía el espacio al nombre del taller cuando no tiene
              logo cargado. */}
          <div className="flex flex-col items-end gap-0.5 sm:flex-row sm:items-center sm:gap-2">
            <span className="text-[10px] leading-none opacity-70 sm:text-sm">Respaldado por</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-stiker.png"
              alt="Kristall Film"
              className="h-4 w-auto shrink-0 object-contain sm:h-5"
            />
          </div>

          <button
            type="button"
            onClick={onAbrirMenu}
            aria-label="Abrir menú"
            className="flex shrink-0 items-center justify-center rounded-lg bg-[color:var(--color-acento)] p-2 text-white"
          >
            <Menu />
          </button>
        </div>
      </header>
    </div>
  )
}
