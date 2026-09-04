/**
 * Los tipos de vehículo, espejo de `lib/vehicle-types.ts` de kristall-web y de
 * `src/lib/vehicle-types.ts` del CRM.
 *
 * Los tres tienen que moverse juntos: el CRM valida el slug, kristall-web lo
 * muestra en el alta de instalación y acá lo elige el cliente final. Los SVG son
 * copia de los de kristall-web — **si agregás uno, va en los tres lados y con
 * el archivo en los dos `public/iconos/vehiculos`**.
 *
 * El orden es el de la calle, no alfabético: primero lo que un polarizador ve
 * todos los días y al final lo raro.
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
  { slug: 'FURGON', label: 'Furgón', icon: '/iconos/vehiculos/Furgon.svg' },
  { slug: 'VAN_MINIBUS', label: 'Van / Minibús', icon: '/iconos/vehiculos/Van-Minibus.svg' },
  { slug: 'CAMION_CHICO', label: 'Camión chico', icon: '/iconos/vehiculos/Camion Chico.svg' },
  { slug: 'CAMION_GRANDE', label: 'Camión grande', icon: '/iconos/vehiculos/Camion Grande.svg' },
  { slug: 'COLECTIVO', label: 'Colectivo', icon: '/iconos/vehiculos/Colectivo.svg' },
  { slug: 'YATE_CHICO', label: 'Yate chico', icon: '/iconos/vehiculos/Yate Chico.svg' },
  { slug: 'YATE_GRANDE', label: 'Yate grande', icon: '/iconos/vehiculos/Yate Grande.svg' },
]
