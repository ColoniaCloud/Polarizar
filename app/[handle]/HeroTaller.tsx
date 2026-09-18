import { Whatsapp, Mail, Instagram, Facebook, Tiktok, Google } from './iconos'
import type { PublicWorkshop } from '@/lib/crm'

/**
 * El hero: la foto que subió el instalador, al ancho de contenido (no de
 * pantalla completa) y con esquinas redondeadas — antes ocupaba todo el
 * viewport y era casi el doble de alto. 40vh fijo en cualquier tamaño de
 * pantalla, a propósito: la idea es que se vea entera de un vistazo, no que
 * haya que hacer scroll para llegar al botón de abajo.
 *
 * El botón de agendar flota exactamente sobre el borde inferior — mitad
 * adentro de la foto, mitad afuera — para que sea lo primero que se note
 * apenas se termina de ver la foto.
 *
 * Colores fijos (blanco, negro) y no las variables de tema: el texto tiene
 * que leerse sobre una foto cualquiera, no sobre el fondo claro/oscuro de la
 * página.
 *
 * Solo se dibuja cuando el taller tiene foto cargada — ver `LandingTaller.tsx`,
 * que decide entre esto y el layout de siempre.
 */

const REDES: { key: 'instagram' | 'facebook' | 'tiktok' | 'google'; label: string; icono: React.ReactNode }[] = [
  { key: 'instagram', label: 'Instagram', icono: <Instagram /> },
  { key: 'facebook', label: 'Facebook', icono: <Facebook /> },
  { key: 'tiktok', label: 'TikTok', icono: <Tiktok /> },
  { key: 'google', label: 'Google (Maps o Negocio)', icono: <Google /> },
]

export default function HeroTaller({
  heroUrl,
  taller,
  subtitulo,
  wa,
  dias,
  horario,
  email,
  onAgendar,
}: {
  heroUrl: string
  taller: PublicWorkshop
  subtitulo: string | null
  wa: string | null
  dias: string | null
  horario: string | null
  email: string | null
  /** Abre el mismo wizard que el resto de los botones "Agendar un turno". */
  onAgendar: () => void
}) {
  const direccionYHorario = [taller.address, [dias, horario].filter(Boolean).join(', ')]
    .filter(Boolean)
    .join(' · ')
  const redesActivas = REDES.filter((r) => taller.social[r.key])

  return (
    <div className="mx-auto max-w-6xl px-5 pt-8 md:pt-10">
      <section className="relative h-[40vh] w-full overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />
        <div className="relative z-10 flex h-full items-center px-5 sm:px-8">
          <div className="flex w-full flex-col gap-2 md:w-[40%]">
            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-4xl">
              {taller.name}
            </h1>
            {subtitulo && <p className="text-sm text-white/80">{subtitulo}</p>}

            {direccionYHorario && (
              <p className="text-xs text-white/70 md:text-sm">{direccionYHorario}</p>
            )}

            {(wa || email) && (
              <div className="flex flex-col gap-1 text-xs text-white/80 md:text-sm">
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 hover:text-white"
                  >
                    <Whatsapp />
                    {taller.phone}
                  </a>
                )}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center gap-2 hover:text-white"
                  >
                    <Mail />
                    {email}
                  </a>
                )}
              </div>
            )}

            {redesActivas.length > 0 && (
              <div className="mt-1 flex items-center gap-3">
                {redesActivas.map((r) => (
                  <a
                    key={r.key}
                    href={taller.social[r.key] ?? undefined}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={r.label}
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    {r.icono}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* -mt-7/-mt-8 es la mitad de la altura del botón (h-14/h-16), no un
          número inventado: así queda centrado justo sobre el borde de abajo
          de la foto sin recurrir a position:absolute. */}
      <div className="relative z-10 flex justify-center">
        <button
          type="button"
          onClick={onAgendar}
          className="-mt-7 h-14 w-[85vw] rounded-full bg-[color:var(--color-acento)] text-base font-semibold text-white shadow-xl transition-transform hover:scale-[1.02] md:-mt-8 md:h-16 md:w-[65vw] md:text-lg"
        >
          Agendar un turno
        </button>
      </div>
    </div>
  )
}
