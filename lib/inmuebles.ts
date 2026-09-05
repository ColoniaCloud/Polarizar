/**
 * El vocabulario de arquitectura: qué inmueble es y para qué quiere la lámina.
 *
 * Es el equivalente de `vehiculos.ts` del otro lado del negocio. **Los espejos
 * son `crm-polarizados/src/lib/property-types.ts` y
 * `kristall-web/lib/property-types.ts`**: el slug es lo que se guarda y lo que
 * valida el endpoint del CRM, así que agregar una opción acá sin agregarla allá
 * hace que el CRM rechace el pedido con un error que en pantalla se lee como
 * «algo salió mal».
 *
 * A diferencia de los vehículos no hay archivos SVG: un inmueble no tiene una
 * silueta que se reconozca de un vistazo como la tiene una pickup, así que acá
 * manda el texto y el dibujo solo ancla la vista. Los cinco íconos están en
 * `app/[handle]/iconos.tsx`, dibujados a mano como el resto.
 */
export interface TipoInmueble {
  slug: string
  label: string
}

export const TIPOS_INMUEBLE: TipoInmueble[] = [
  { slug: 'CASA', label: 'Casa' },
  { slug: 'OFICINA', label: 'Oficina' },
  { slug: 'LOCAL', label: 'Local comercial' },
  { slug: 'EDIFICIO', label: 'Edificio' },
  { slug: 'OTRO', label: 'Otro' },
]

/**
 * Para qué quiere la lámina.
 *
 * Cambia qué producto se presupuesta: una lámina de seguridad y una decorativa
 * no se parecen ni en función ni en precio. Preguntarlo acá le ahorra al taller
 * un viaje con el presupuesto equivocado.
 */
export const OBJETIVOS = [
  { slug: 'CONTROL_SOLAR', label: 'Que entre menos calor' },
  { slug: 'PRIVACIDAD', label: 'Que no se vea desde afuera' },
  { slug: 'SEGURIDAD', label: 'Seguridad' },
  { slug: 'DECORATIVO', label: 'Decorativo' },
]

/**
 * Las franjas de una visita.
 *
 * Arquitectura no reserva un hueco de la agenda: pide una visita para medir. Un
 * «jueves 10:30» que nadie se comprometió a cumplir es peor que un «jueves a la
 * mañana» que sí.
 */
export const FRANJAS = [
  { slug: 'MANANA', label: 'Por la mañana' },
  { slug: 'TARDE', label: 'Por la tarde' },
]
