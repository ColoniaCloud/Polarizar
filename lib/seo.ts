import type { PublicWorkshop } from '@/lib/crm'

/** El dominio público. Todo lo que se le muestra a Google va en absoluto. */
export const SITIO = 'https://polariz.ar'

/** "Polarizado de vehículos." / "Láminas para vidrios…" según los rubros. */
export function queHace(rubros: PublicWorkshop['rubros']): string {
  if (rubros.automotriz && rubros.arquitectura) {
    return 'Polarizado de vehículos y láminas para vidrios de casas y oficinas.'
  }
  if (rubros.automotriz) return 'Polarizado de vehículos.'
  return 'Láminas para vidrios de casas, oficinas y edificios.'
}

const DIA_SCHEMA = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

/** "09:00" o "9:00" → "09:00". Cualquier otra cosa → null. */
function hora(h: string | null): string | null {
  const m = h?.trim().match(/^(\d{1,2}):(\d{2})$/)
  return m ? `${m[1].padStart(2, '0')}:${m[2]}` : null
}

/**
 * Datos estructurados (schema.org, JSON-LD) del taller.
 *
 * Es lo que Google lee para entender que la página es **un negocio local**:
 * dirección, teléfono, horario, ubicación en el mapa y qué servicios ofrece.
 * Sin esto, la página es solo texto; con esto puede aparecer con su ficha en
 * búsquedas como "polarizado en Morón".
 *
 * Solo va lo que el taller cargó: un campo vacío se omite, no se inventa.
 */
export function datosEstructurados(
  handle: string,
  taller: PublicWorkshop,
  imagenes: { hero: string | null; logo: string | null }
) {
  const tipos = [
    ...(taller.rubros.automotriz ? ['AutomotiveBusiness'] : []),
    ...(taller.rubros.arquitectura ? ['HomeAndConstructionBusiness'] : []),
  ]
  const abre = hora(taller.hours.opening)
  const cierra = hora(taller.hours.closing)
  const dias = (taller.hours.days ?? '')
    .split(',')
    .map((d) => DIA_SCHEMA[Number(d.trim())])
    .filter(Boolean)
  const redes = Object.values(taller.social).filter((u): u is string => !!u && /^https?:\/\//.test(u))
  const imagen = [imagenes.hero, imagenes.logo].filter((u): u is string => !!u)

  return {
    '@context': 'https://schema.org',
    '@type': tipos.length === 1 ? tipos[0] : tipos,
    '@id': `${SITIO}/${handle}#taller`,
    name: taller.name,
    url: `${SITIO}/${handle}`,
    description: taller.description?.trim() || `${taller.name}. ${queHace(taller.rubros)} Instalador autorizado Kristall.`,
    ...(imagen.length ? { image: imagen } : {}),
    ...(imagenes.logo ? { logo: imagenes.logo } : {}),
    ...(taller.phone ? { telephone: taller.phone } : {}),
    ...(taller.email ? { email: taller.email } : {}),
    ...(taller.address
      ? { address: { '@type': 'PostalAddress', streetAddress: taller.address, addressCountry: 'AR' } }
      : {}),
    ...(taller.lat !== null && taller.lng !== null
      ? { geo: { '@type': 'GeoCoordinates', latitude: taller.lat, longitude: taller.lng } }
      : {}),
    ...(abre && cierra && dias.length
      ? {
          openingHoursSpecification: [
            { '@type': 'OpeningHoursSpecification', dayOfWeek: dias, opens: abre, closes: cierra },
          ],
        }
      : {}),
    ...(redes.length ? { sameAs: redes } : {}),
    ...(taller.services.length
      ? {
          makesOffer: taller.services.map((s) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: s.name,
              ...(s.description ? { description: s.description } : {}),
            },
          })),
        }
      : {}),
  }
}

/**
 * Serializa el JSON-LD para meterlo en un `<script>` sin que un texto cargado
 * por el taller pueda cerrar la etiqueta: `</script>` en una descripción
 * cortaría el script y lo que sigue se ejecutaría como HTML.
 */
export function jsonLd(datos: unknown): string {
  return JSON.stringify(datos).replace(/</g, '\\u003c')
}
