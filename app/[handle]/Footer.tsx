import type { PublicWorkshop } from '@/lib/crm'
import { Instagram, Facebook, Tiktok, Google } from './iconos'

/**
 * El pie de página: tres columnas — marca del taller, navegación de la
 * página, y el respaldo de Kristall.
 *
 * Siempre oscuro, sin importar el `pageTheme` que haya elegido el taller —
 * mismo criterio que el footer de kristallfilm.com (`bg-[#1A1A1A]` fijo), y
 * es lo que hace que el logo de Kristall (`/cat/logob.svg`, pensado para
 * fondo oscuro) siempre se lea bien.
 */

const REDES: { key: 'instagram' | 'facebook' | 'tiktok' | 'google'; label: string; icono: React.ReactNode }[] = [
  { key: 'instagram', label: 'Instagram', icono: <Instagram /> },
  { key: 'facebook', label: 'Facebook', icono: <Facebook /> },
  { key: 'tiktok', label: 'TikTok', icono: <Tiktok /> },
  { key: 'google', label: 'Google (Maps o Negocio)', icono: <Google /> },
]

export default function Footer({
  taller,
  logoUrl,
}: {
  taller: PublicWorkshop
  logoUrl: string | null
}) {
  const redesActivas = REDES.filter((r) => taller.social[r.key])

  return (
    <footer className="bg-[#1A1A1A] px-6 py-10 text-white/80">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
        {/* Col 1: el taller */}
        <div className="flex flex-col items-start gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={taller.name} className="max-h-10 max-w-[10rem] object-contain" />
          ) : (
            <span className="text-base font-semibold text-white">{taller.name}</span>
          )}
          {redesActivas.length > 0 && (
            <div className="flex items-center gap-3">
              {redesActivas.map((r) => (
                <a
                  key={r.key}
                  href={taller.social[r.key] ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={r.label}
                  className="text-white/50 transition-colors hover:text-white"
                >
                  {r.icono}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Col 2: navegación de esta página */}
        <div className="flex flex-col gap-2 text-sm">
          <a href="#servicios" className="text-white/60 hover:text-white">
            Servicios
          </a>
          <a href="#agendar" className="text-white/60 hover:text-white">
            Agendar un turno
          </a>
        </div>

        {/* Col 3: el respaldo de Kristall */}
        <div className="flex flex-col items-start gap-2 sm:items-end">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/cat/logob.svg" alt="Kristall Film" className="h-5 w-auto opacity-80" />
          <p className="text-xs text-white/50">Automotive &amp; Architectural Films</p>
          <a
            href="https://kristallfilm.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-white/50 hover:text-white"
          >
            kristallfilm.com
          </a>
        </div>
      </div>
    </footer>
  )
}
