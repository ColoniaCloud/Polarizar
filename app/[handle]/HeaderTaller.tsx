import { Menu } from './iconos'

/**
 * El header de la página del taller: un módulo flotante angosto (ancho de
 * contenido, no de pantalla completa) despegado del borde superior.
 *
 * Tres elementos: el logo del taller a la izquierda, el respaldo de marca y,
 * después de ese logo, el botón que abre el menú lateral (`SidebarTaller`) —
 * ahí vive la navegación por secciones, el botón de agendar y las redes.
 *
 * Mientras está sobre la foto del hero (`transparente`) se dibuja sin fondo,
 * sin borde y sin sombra, con el texto en blanco: ahí el contraste lo pone el
 * degradé del hero, que arriba es el más cerrado. Pasada la mitad del hero
 * aparece su fondo, y el cambio va con `transition` para que entre en vez de
 * saltar.
 *
 * **El alto es fijo, y eso es a propósito**: es `--alto-cabecera`
 * (`globals.css`), el mismo valor que `HeroTaller` se sube con un margen
 * negativo para que la foto llegue al borde de arriba de la pantalla y esta
 * barra le quede encima. Con un alto que dependa del contenido, el hero no
 * tendría cómo saber cuánto subir.
 */
export default function HeaderTaller({
  nombre,
  logoUrl,
  fondo,
  transparente = false,
  onAbrirMenu,
}: {
  nombre: string
  logoUrl: string | null
  /** Lo elige el taller según cómo se vea su logo. Ver `logoBackground`. */
  fondo: 'CLARO' | 'OSCURO'
  /** `true` mientras la cabecera va montada sobre la foto del hero. */
  transparente?: boolean
  onAbrirMenu: () => void
}) {
  const oscura = fondo === 'OSCURO'

  return (
    <div className="sticky top-0 z-30 mx-auto h-[var(--alto-cabecera)] max-w-[1280px] px-4 pt-3 md:px-6 md:pt-4">
      {/* Opaco a propósito: con transparencia + blur, el texto que pasa por
          detrás durante el scroll quedaba parcialmente legible a través del
          header — se veía roto, no elegante. */}
      <header
        className={`flex h-full items-center justify-between gap-4 rounded-[18px] border px-4 transition-colors duration-300 ${
          transparente
            ? 'border-transparent bg-transparent text-white'
            : oscura
              ? 'border-[color:var(--color-cabecera-oscura-linea)] bg-[color:var(--color-cabecera-oscura)] text-[color:var(--color-cabecera-oscura-texto)] shadow-[0_12px_30px_rgba(15,23,42,0.12)]'
              : 'border-[color:var(--color-linea)] bg-[color:var(--color-fondo)] shadow-[0_12px_30px_rgba(15,23,42,0.12)]'
        }`}
      >
        <a href="#" className="flex min-w-0 items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={nombre} className="max-h-10 max-w-[10rem] object-contain" />
          ) : (
            <span className="truncate text-base font-semibold sm:text-lg">{nombre}</span>
          )}
        </a>

        <div className="flex shrink-0 items-center gap-3">
          <div className="flex flex-col items-end gap-0.5 sm:flex-row sm:items-center sm:gap-2">
            <span className="text-[10px] leading-none opacity-75 sm:text-[11px]">Instalador autorizado</span>
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
            className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[color:var(--color-acento)] text-white shadow-sm transition-transform hover:scale-[1.02]"
          >
            <Menu />
          </button>
        </div>
      </header>
    </div>
  )
}
