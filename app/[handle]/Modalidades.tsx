'use client'

import type { PublicWorkshop } from '@/lib/crm'

function IconoLlave() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.7 6.3a4 4 0 1 0-5.66 5.66L3 18v3h3l6.04-6.04a4 4 0 0 0 5.66-5.66l-2.83 2.83-2-2Z" />
    </svg>
  )
}

function IconoUbicacion() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s7-6.2 7-11.2A7 7 0 0 0 5 9.8C5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  )
}

function IconoEdificio() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" />
    </svg>
  )
}

export default function Modalidades({
  taller,
  wa,
  email,
}: {
  taller: PublicWorkshop
  wa: string | null
  email: string | null
}) {
  const tarjetas: { icono: React.ReactNode; titulo: string; activa: boolean }[] = []

  if (taller.rubros.automotriz) {
    tarjetas.push(
      { icono: <IconoLlave />, titulo: 'Taller', activa: Boolean(taller.modalidades.taller) },
      { icono: <IconoUbicacion />, titulo: 'A domicilio', activa: Boolean(taller.modalidades.domicilio) },
      { icono: <IconoEdificio />, titulo: 'Concesionarias', activa: Boolean(taller.modalidades.concesionarias) }
    )
  }

  if (taller.rubros.arquitectura) {
    tarjetas.push({ icono: <IconoEdificio />, titulo: 'Casas y edificios', activa: true })
  }

  if (tarjetas.length === 0) return null

  return (
    <div className="flex flex-wrap gap-3">
      {tarjetas.slice(0, 3).map((t) => (
        <button
          key={t.titulo}
          type="button"
          aria-label={t.titulo}
          className={`group flex min-w-[110px] flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-200 ${
            t.activa
              ? 'border-transparent bg-[color:var(--color-superficie)] text-[color:var(--color-tinta)] hover:bg-[color:var(--color-acento)] hover:text-white'
              : 'border-[color:var(--color-linea)] bg-transparent text-[color:var(--color-tenue)] opacity-60'
          }`}
        >
          <span className="transition-transform duration-200 group-hover:scale-110">{t.icono}</span>
          <span>{t.titulo}</span>
        </button>
      ))}
    </div>
  )
}
