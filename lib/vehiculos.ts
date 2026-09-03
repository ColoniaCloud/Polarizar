/**
 * Los tipos de vehículo, espejo de `lib/vehicle-types.ts` de kristall-web y de
 * `src/lib/vehicle-types.ts` del CRM.
 *
 * Los tres tienen que moverse juntos: el CRM valida el slug, kristall-web lo
 * muestra en el alta de instalación y acá lo elige el cliente final. Los iconos
 * viven en kristall-web, así que esta lista es solo texto — la página del taller
 * no los necesita.
 */
export const TIPOS_VEHICULO: { slug: string; label: string }[] = [
  { slug: 'SEDAN', label: 'Sedán' },
  { slug: 'HATCHBACK', label: 'Hatchback' },
  { slug: 'SUV', label: 'SUV' },
  { slug: 'FURGON', label: 'Furgón' },
  { slug: 'VAN_MINIBUS', label: 'Van / Minibús' },
  { slug: 'CAMION_CHICO', label: 'Camión chico' },
  { slug: 'CAMION_GRANDE', label: 'Camión grande' },
  { slug: 'COLECTIVO', label: 'Colectivo' },
  { slug: 'YATE_CHICO', label: 'Yate chico' },
  { slug: 'YATE_GRANDE', label: 'Yate grande' },
]
