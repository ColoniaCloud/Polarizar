/**
 * Los tipos de vehículo, espejo de `lib/vehicle-types.ts` de kristall-web y de
 * `src/lib/vehicle-types.ts` del CRM.
 *
 * Los tres tienen que moverse juntos: el CRM valida el slug, kristall-web lo
 * muestra en el alta de instalación y acá lo elige el cliente final. Los SVG son
 * copia de los de kristall-web — **si agregás uno, va en los tres lados y con
 * el archivo en los dos `public/iconos/vehiculos`**.
 */
export interface TipoVehiculo {
  slug: string
  label: string
  icon: string
}

export const TIPOS_VEHICULO: TipoVehiculo[] = [
  { slug: 'SEDAN', label: 'Sedán', icon: '/iconos/vehiculos/Sedan.svg' },
  { slug: 'HATCHBACK', label: 'Hatchback', icon: '/iconos/vehiculos/Hatchback.svg' },
  { slug: 'SUV', label: 'SUV', icon: '/iconos/vehiculos/SUV.svg' },
  { slug: 'PICKUP', label: 'Pickup', icon: '/iconos/vehiculos/Pickup.svg' },
  { slug: 'FURGON', label: 'Furgón', icon: '/iconos/vehiculos/Furgon.svg' },
  { slug: 'VAN_MINIBUS', label: 'Van / Minibús', icon: '/iconos/vehiculos/Van-Minibus.svg' },
  { slug: 'CAMION', label: 'Camión', icon: '/iconos/vehiculos/Camion Grande.svg' },
  { slug: 'COLECTIVO', label: 'Colectivo', icon: '/iconos/vehiculos/Colectivo.svg' },
  { slug: 'EMBARCACION', label: 'Yate / Embarcación', icon: '/iconos/vehiculos/Yate Grande.svg' },
]

/** Slugs viejos que pueden estar guardados. Ver la nota en el espejo del CRM. */
const LEGACY: Record<string, string> = {
  CAMION_CHICO: 'CAMION',
  CAMION_GRANDE: 'CAMION',
  YATE_CHICO: 'EMBARCACION',
  YATE_GRANDE: 'EMBARCACION',
}

const POR_SLUG = new Map(TIPOS_VEHICULO.map((v) => [v.slug, v]))

export function tipoVehiculo(slug: string | null | undefined): TipoVehiculo | undefined {
  if (!slug) return undefined
  return POR_SLUG.get(LEGACY[slug] ?? slug)
}
