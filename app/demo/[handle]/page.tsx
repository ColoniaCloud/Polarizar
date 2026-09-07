import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getWorkshopByHandle, crmAssetUrl } from '@/lib/crm'
import LandingTaller from '@/app/[handle]/LandingTaller'

/**
 * La página pública de un taller de **demostración**: polariz.ar/demo/loquesea
 *
 * Es la misma landing que la real —el mismo componente, sin una copia— leyendo
 * de la base de demo. Lo único que cambia es de dónde salen los datos y una
 * banda arriba que avisa que nada de esto existe.
 *
 * ─── Por qué vive en su propio segmento de URL ─────────────────────────────
 *
 * Porque así el prospecto puede elegir el nombre que quiera —`tallercarlos`, el
 * suyo— y publicar de verdad, que es el momento más convincente del recorrido,
 * sin poder quemarle ese nombre a un taller real. Los handles de demo viven en
 * otra base y bajo otro prefijo de URL: no hay forma de que colisionen.
 *
 * Y `demo` ya estaba en la lista de handles reservados del CRM
 * (`workshop-handle.ts`), así que ningún taller real puede tener
 * `polariz.ar/demo` y este segmento está libre para siempre. La decisión de
 * reservar de más, tomada en su momento, se pagó sola.
 *
 * En Next las rutas estáticas ganan sobre las dinámicas, así que esto convive
 * con `app/[handle]/` sin ambigüedad.
 */

export const revalidate = 0

interface Props {
  params: Promise<{ handle: string }>
}

function urlDelMapa(t: { address: string | null; lat: number | null; lng: number | null }) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!key) return null
  const q = t.lat !== null && t.lng !== null ? `${t.lat},${t.lng}` : t.address
  if (!q) return null
  return `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(q)}&zoom=16`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const taller = await getWorkshopByHandle(handle.toLowerCase(), true).catch(() => null)
  if (!taller) return { title: 'Demostración' }
  return {
    title: `${taller.name} — Demostración`,
    // Una página de demo no tiene por qué competir en buscadores con los
    // talleres reales, ni aparecer cuando alguien busca uno.
    robots: { index: false, follow: false },
  }
}

export default async function TallerDemoPage({ params }: Props) {
  const { handle } = await params
  const taller = await getWorkshopByHandle(handle.toLowerCase(), true)
  if (!taller) notFound()

  return (
    <LandingTaller
      handle={handle.toLowerCase()}
      taller={taller}
      logoUrl={crmAssetUrl(taller.logoPath, true)}
      mapaUrl={urlDelMapa(taller)}
      emailContacto={taller.email}
      apiBase="/api/turno/demo"
      demo
    />
  )
}
