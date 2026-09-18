'use client'

import { useEffect } from 'react'
import { X, Instagram, Facebook, Tiktok, Google } from './iconos'
import type { PublicWorkshop } from '@/lib/crm'

const SECCIONES = [
  { href: '#servicios', label: 'Servicios' },
  { href: '#donde-trabajamos', label: 'Dónde trabajamos' },
  { href: '#trabajos', label: 'Trabajos realizados' },
  { href: '#ubicacion', label: 'Ubicación' },
] as const

const REDES: { key: 'instagram' | 'facebook' | 'tiktok' | 'google'; label: string; icono: React.ReactNode }[] = [
  { key: 'instagram', label: 'Instagram', icono: <Instagram /> },
  { key: 'facebook', label: 'Facebook', icono: <Facebook /> },
  { key: 'tiktok', label: 'TikTok', icono: <Tiktok /> },
  { key: 'google', label: 'Google (Maps o Negocio)', icono: <Google /> },
]

/**
 * El menú lateral que abre el botón hamburguesa del header.
 *
 * En escritorio empuja el contenido: un separador angosto en el flujo normal
 * hace lugar, y el panel de verdad es `fixed` y desliza con `transform` — así
 * no depende de `position: sticky` adentro de un contenedor con
 * `overflow-hidden` animado, que es frágil. En celular NO empuja nada: un
 * sidebar de ~280px en una pantalla de 375px dejaría el contenido principal
 * en unos 95px, inusable — ahí se superpone con un velo oscuro atrás, como
 * cualquier drawer de celular.
 */
export default function SidebarTaller({
  abierto,
  onCerrar,
  taller,
  tieneAlbum,
  onAgendar,
}: {
  abierto: boolean
  onCerrar: () => void
  taller: PublicWorkshop
  /** Si no subió fotos, no tiene sentido ofrecer ese link. */
  tieneAlbum: boolean
  onAgendar: () => void
}) {
  const secciones = SECCIONES.filter((s) => s.href !== '#trabajos' || tieneAlbum)
  const redesActivas = REDES.filter((r) => taller.social[r.key])
  const soloArquitectura = taller.rubros.arquitectura && !taller.rubros.automotriz

  // Cierra con Escape — mismo criterio que el wizard de turno.
  useEffect(() => {
    if (!abierto) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [abierto, onCerrar])

  return (
    <>
      {/* Separador que empuja el contenido — solo en escritorio. En celular
          el panel de abajo se superpone en vez de correr nada. */}
      <div
        className={`hidden shrink-0 transition-[width] duration-300 md:block ${abierto ? 'w-72' : 'w-0'}`}
        aria-hidden="true"
      />

      {/* Velo — solo en celular, donde el sidebar se superpone. */}
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={onCerrar}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${
          abierto ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col border-l border-[color:var(--color-linea)] bg-[color:var(--color-fondo)] p-5 text-[color:var(--color-tinta)] shadow-2xl transition-transform duration-300 ${
          abierto ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-tenue)]">
            Menú
          </span>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar menú"
            className="rounded-lg p-1.5 text-[color:var(--color-tenue)] hover:bg-[color:var(--color-superficie)]"
          >
            <X />
          </button>
        </div>

        <nav className="mt-6 flex flex-col gap-1">
          {secciones.map((s) => (
            <a
              key={s.href}
              href={s.href}
              onClick={onCerrar}
              className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[color:var(--color-superficie)]"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => {
            onCerrar()
            onAgendar()
          }}
          className="mt-6 rounded-xl bg-[color:var(--color-acento)] px-5 py-3 text-center text-sm font-semibold text-white"
        >
          {soloArquitectura ? 'Pedir una visita' : 'Agendar un turno'}
        </button>

        {redesActivas.length > 0 && (
          <div className="mt-auto flex items-center gap-4 pt-6">
            {redesActivas.map((r) => (
              <a
                key={r.key}
                href={taller.social[r.key] ?? undefined}
                target="_blank"
                rel="noreferrer"
                aria-label={r.label}
                className="text-[color:var(--color-tenue)] transition-colors hover:text-[color:var(--color-tinta)]"
              >
                {r.icono}
              </a>
            ))}
          </div>
        )}
      </aside>
    </>
  )
}
