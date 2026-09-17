import { Whatsapp, Mail, Instagram, Facebook, Tiktok, Google } from './iconos'
import type { PublicWorkshop } from '@/lib/crm'

/**
 * El hero de ancho completo: la foto que subió el instalador, con un degradé
 * negro (oscuro a la izquierda, casi transparente a la derecha) y encima el
 * nombre del taller con sus datos de contacto, en una columna del 40% del
 * ancho en escritorio.
 *
 * La foto ocupa el viewport entero (`w-full` en la `<section>`), pero el
 * contenido va adentro del mismo `max-w-6xl` que el resto de la página —
 * si no, en una pantalla ancha el texto queda pegado al borde izquierdo en
 * vez de alinearse con el resto de las secciones.
 *
 * Solo se dibuja cuando el taller tiene foto cargada — ver `LandingTaller.tsx`,
 * que decide entre esto y el layout de siempre. Colores fijos (blanco, negro)
 * y no las variables de tema: el texto tiene que leerse sobre una foto
 * cualquiera, no sobre el fondo claro/oscuro de la página.
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
}: {
  heroUrl: string
  taller: PublicWorkshop
  subtitulo: string | null
  wa: string | null
  dias: string | null
  horario: string | null
  email: string | null
}) {
  const direccionYHorario = [taller.address, [dias, horario].filter(Boolean).join(', ')]
    .filter(Boolean)
    .join(' · ')
  const redesActivas = REDES.filter((r) => taller.social[r.key])

  return (
    <section className="relative h-[64vh] max-h-[680px] min-h-[440px] w-full overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={heroUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />
      <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-5 sm:px-8">
        <div className="flex w-full flex-col gap-3 md:w-[40%]">
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {taller.name}
          </h1>
          {subtitulo && <p className="text-sm text-white/80">{subtitulo}</p>}

          {direccionYHorario && <p className="text-sm text-white/70">{direccionYHorario}</p>}

          {(wa || email) && (
            <div className="flex flex-col gap-1.5 text-sm text-white/80">
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
  )
}
