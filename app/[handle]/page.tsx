import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getWorkshopByHandle, crmAssetUrl } from '@/lib/crm'
import LandingTaller from './LandingTaller'

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
function urlDelMapa(t: { address: string | null; lat: number | null; lng: number | null }) {
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
 * **No lleva la navegación de Polarizar**: vive fuera del grupo `(sitio)`, que
 * es el que la tiene. Esta es la página que el taller reparte, y en ella la
 * única marca que manda es la suya; Kristall aparece como respaldo.
 */

export const revalidate = 0

interface Props {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const taller = await getWorkshopByHandle(handle.toLowerCase()).catch(() => null)
  if (!taller) return { title: 'Taller no encontrado' }

  // El titulo dice lo que se puede hacer en la pagina, y eso depende del rubro:
  // en arquitectura no se reserva un turno, se pide una visita para medir.
  const soloArquitectura = taller.rubros.arquitectura && !taller.rubros.automotriz
  const accion = soloArquitectura ? 'Pedí tu presupuesto' : 'Pedí tu turno'
  const queHace = taller.rubros.automotriz
    ? taller.rubros.arquitectura
      ? 'Polarizado de vehículos y láminas para vidrios de casas y oficinas.'
      : 'Polarizado de vehículos.'
    : 'Láminas para vidrios de casas, oficinas y edificios.'

  return {
    title: `${taller.name} — ${accion}`,
    description: [
      taller.name + '.',
      queHace,
      taller.address,
      'Instalador autorizado Kristall.',
    ]
      .filter(Boolean)
      .join(' '),
  }
}

export default async function TallerPage({ params }: Props) {
  const { handle } = await params
  const taller = await getWorkshopByHandle(handle.toLowerCase())
  // Un taller que no publicó su página es indistinguible de uno que no existe.
  if (!taller) notFound()

  return (
    <LandingTaller
      handle={handle.toLowerCase()}
      taller={taller}
      logoUrl={crmAssetUrl(taller.logoPath)}
      mapaUrl={urlDelMapa(taller)}
      emailContacto={taller.email}
    />
  )
}
