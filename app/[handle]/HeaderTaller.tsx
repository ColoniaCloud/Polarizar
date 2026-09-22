import { Menu } from './iconos'

export default function HeaderTaller({
  nombre,
  logoUrl,
  fondo,
  onAbrirMenu,
}: {
  nombre: string
  logoUrl: string | null
  fondo: 'CLARO' | 'OSCURO'
  onAbrirMenu: () => void
}) {
  const oscura = fondo === 'OSCURO'

  return (
    <div className="sticky top-2 z-30 mx-auto max-w-[1280px] px-4 md:px-6">
      <header
        className={`flex items-center justify-between gap-4 rounded-[18px] border px-4 py-3.5 shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur md:py-4 ${
          oscura
            ? 'border-[color:var(--color-cabecera-oscura-linea)] bg-[color:var(--color-cabecera-oscura)]/95 text-[color:var(--color-cabecera-oscura-texto)]'
            : 'border-[color:var(--color-linea)] bg-[color:var(--color-fondo)]/90'
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
            className="flex shrink-0 items-center justify-center rounded-lg bg-[color:var(--color-acento)] p-2.5 text-white shadow-sm transition-transform hover:scale-[1.02]"
          >
            <Menu />
          </button>
        </div>
      </header>
    </div>
  )
}
