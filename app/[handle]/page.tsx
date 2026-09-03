import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getWorkshopByHandle, crmAssetUrl } from '@/lib/crm'
import { formatDias, formatPrecio, formatDuracion } from '@/lib/formato'
import SeccionTurno from './SeccionTurno'

/**
 * El mapa del taller, o `null` si no hay con qué ubicarlo.
 *
 * Prefiere las coordenadas sobre el texto: una dirección escrita a mano puede
 * caer en la otra punta del país, y en ese caso es mejor no mostrar mapa que
 * mostrar uno que manda al cliente a otro lado.
 *
 * Devuelve `null` sin la key en vez de armar una URL rota — un iframe de Google
 * sin key muestra un cartel de error gris que se lee como que el taller está mal
 * cargado, cuando el problema es nuestro.
 */
function urlDelMapa(t: { name: string; address: string | null; lat: number | null; lng: number | null }) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!key) return null
  const q = t.lat !== null && t.lng !== null ? `${t.lat},${t.lng}` : t.address
  if (!q) return null
  return `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(q)}&zoom=16`
}

/**
 * La página pública de un taller: polariz.ar/tallercarlos
 *
 * Es una ruta dinámica en la raíz, así que compite con todas las rutas del
 * sitio. Next resuelve primero los segmentos estáticos, por lo que `/garantias`
 * sigue siendo la página de garantías; lo que no matchea nada cae acá. Del lado
 * del CRM hay una lista de handles reservados (`lib/workshop-handle.ts`) que
 * cubre las rutas actuales y las previsibles — **si se agrega una sección nueva
 * al sitio, su nombre tiene que entrar en esa lista**, o un taller podría
 * haberla tomado antes.
 *
 * La página la firma el taller: su logo arriba, su nombre, sus servicios. La
 * marca Kristall va al pie, como respaldo y no como protagonista. Es su página,
 * no la nuestra: la va a repartir él.
 */

export const revalidate = 0

interface Props {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const taller = await getWorkshopByHandle(handle.toLowerCase()).catch(() => null)
  if (!taller) return { title: 'Taller no encontrado' }
  return {
    title: `${taller.name} — Pedí tu turno`,
    description: taller.address
      ? `${taller.name}. ${taller.address}. Instalador autorizado Kristall.`
      : `${taller.name}. Instalador autorizado Kristall.`,
  }
}

export default async function TallerPage({ params }: Props) {
  const { handle } = await params
  const taller = await getWorkshopByHandle(handle.toLowerCase())
  // Un taller que no publicó su página es indistinguible de uno que no existe.
  if (!taller) notFound()

  const logo = crmAssetUrl(taller.logoPath)
  const dias = formatDias(taller.hours.days)
  const mapa = urlDelMapa(taller)
  const horario =
    taller.hours.opening && taller.hours.closing
      ? `${taller.hours.opening} a ${taller.hours.closing}`
      : null

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-10 text-[color:var(--color-tinta)]">
      <header className="flex flex-col items-center gap-4 text-center">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt={taller.name}
            className="max-h-24 max-w-[16rem] object-contain"
          />
        ) : (
          <h1 className="text-3xl font-semibold tracking-tight">{taller.name}</h1>
        )}
        {logo && <h1 className="text-2xl font-semibold tracking-tight">{taller.name}</h1>}

        <p className="text-sm text-[color:var(--color-tenue)]">Instalador autorizado Kristall</p>
      </header>

      {(taller.address || horario || taller.phone) && (
        <section className="mt-8 flex flex-col gap-2 rounded-xl border border-[color:var(--color-linea)] p-5 text-sm">
          {taller.address && (
            <p>
              <span className="text-[color:var(--color-tenue)]">Dónde: </span>
              {taller.address}
            </p>
          )}
          {(dias || horario) && (
            <p>
              <span className="text-[color:var(--color-tenue)]">Cuándo: </span>
              {[dias, horario].filter(Boolean).join(', ')}
            </p>
          )}
          {taller.phone && (
            <p>
              <span className="text-[color:var(--color-tenue)]">Teléfono: </span>
              <a href={`tel:${taller.phone.replace(/\s/g, '')}`} className="underline">
                {taller.phone}
              </a>
            </p>
          )}
        </section>
      )}

      {mapa && (
        <section className="mt-4 overflow-hidden rounded-xl border border-[color:var(--color-linea)]">
          {/* Embed y no la API de JavaScript: para mostrar un punto en un mapa,
              cargar la librería entera son cientos de KB que el cliente paga en
              su teléfono para ver lo mismo. */}
          <iframe
            src={mapa}
            title={`Dónde queda ${taller.name}`}
            className="block h-64 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Servicios</h2>

        {taller.services.length === 0 ? (
          // Se dice, no se oculta: una página sin servicios y sin explicación
          // parece rota. Con la explicación, parece nueva.
          <p className="mt-3 text-sm text-[color:var(--color-tenue)]">
            Este taller todavía no cargó sus servicios. Escribile y coordinás directamente.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col divide-y divide-[color:var(--color-linea)] rounded-xl border border-[color:var(--color-linea)]">
            {taller.services.map((s) => {
              const precio = formatPrecio(s.priceFrom, s.currency)
              return (
                <li key={s.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{s.name}</p>
                    {s.description && (
                      <p className="mt-0.5 text-sm text-[color:var(--color-tenue)]">
                        {s.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {precio ? (
                      <p className="font-medium tabular-nums">
                        {/* «desde» y no el precio pelado: en polarizado depende
                            del vehículo, y prometer un número cerrado obliga al
                            taller a discutirlo después. */}
                        <span className="text-xs font-normal text-[color:var(--color-tenue)]">
                          desde{' '}
                        </span>
                        {precio}
                      </p>
                    ) : (
                      <p className="text-sm text-[color:var(--color-tenue)]">A consultar</p>
                    )}
                    <p className="text-xs text-[color:var(--color-tenue)]">
                      {formatDuracion(s.durationMinutes)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Pedí tu turno</h2>
        <p className="mb-4 mt-1 text-sm text-[color:var(--color-tenue)]">
          Dejale tus datos y {taller.name} te contacta para confirmarlo.
        </p>
        <SeccionTurno handle={handle.toLowerCase()} services={taller.services} telefono={taller.phone} />
      </section>

      <footer className="mt-12 border-t border-[color:var(--color-linea)] pt-5 text-center text-xs text-[color:var(--color-tenue)]">
        <p>
          Trabaja con láminas <strong className="font-semibold">Kristall Film</strong>, con garantía
          registrada.
        </p>
      </footer>
    </main>
  )
}
