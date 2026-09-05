'use client'

import type { PublicWorkshop, RubroServicio } from '@/lib/crm'

/**
 * Cómo trabaja el taller, en tarjetas.
 *
 * ─── Las de automotriz se muestran siempre ─────────────────────────────────
 *
 * Las tres de auto —taller, domicilio, concesionarias— aparecen aunque el
 * taller no las haya marcado, y las que no marcó van apagadas. Ocultarlas sería
 * más limpio pero peor: alguien que entra buscando servicio a domicilio
 * necesita enterarse de que este taller no lo hace, y si la tarjeta no está
 * simplemente sigue buscando sin saber. Apagada responde la pregunta.
 *
 * ─── Pero un taller de arquitectura no muestra las de auto ─────────────────
 *
 * Eso vale **dentro de un rubro**. «Servicio en el taller — dejás el vehículo y
 * lo retirás listo» no es información para alguien que quiere laminar las
 * ventanas de su casa: es ruido, y encima lo hace dudar de si entró al lugar
 * correcto. Una tarjeta apagada dice «esto no lo hago»; una tarjeta de otro
 * rubro dice «esto no es lo tuyo».
 *
 * Así que las de auto solo salen si el taller trabaja sobre autos, y la de
 * visita solo si trabaja sobre inmuebles. Un taller que hace las dos cosas
 * muestra las cuatro.
 *
 * ─── Cada una lleva la acción que le corresponde ───────────────────────────
 *
 * Y no todas la misma: un turno en el taller se agenda solo, pero un trabajo a
 * domicilio o en una concesionaria hay que conversarlo antes —depende de la
 * distancia, de cuántas unidades, de cuándo— y mandarlo a un formulario de
 * turno sería prometer una agenda que no aplica.
 */
export default function Modalidades({
  taller,
  wa,
  email,
  onAgendar,
}: {
  taller: PublicWorkshop
  /** Link de WhatsApp ya armado, o `null` si no cargó teléfono. */
  wa: string | null
  email: string | null
  /** Baja al formulario y lo deja preparado para ese rubro. */
  onAgendar: (rubro: RubroServicio) => void
}) {
  const boton =
    'w-full rounded-lg bg-[color:var(--color-acento)] px-4 py-2.5 text-sm font-medium text-white'
  const botonSecundario =
    'block w-full rounded-lg border border-[color:var(--color-linea)] px-4 py-2.5 text-center text-sm font-medium'

  const tarjetas: {
    activa: boolean
    titulo: string
    texto: string
    accion: React.ReactNode
  }[] = []

  if (taller.rubros.automotriz) {
    tarjetas.push(
      {
        activa: taller.modalidades.taller,
        titulo: 'Servicio en el taller',
        texto: 'Dejás el vehículo y lo retirás listo.',
        accion: (
          <button type="button" onClick={() => onAgendar('AUTOMOTIVE')} className={boton}>
            Reservar turno
          </button>
        ),
      },
      {
        activa: taller.modalidades.domicilio,
        titulo: 'Realizamos servicio a domicilio',
        texto: 'Vamos hasta donde esté el vehículo.',
        accion: wa ? (
          <a href={wa} target="_blank" rel="noreferrer" className={botonSecundario}>
            Consultar turno por WhatsApp
          </a>
        ) : null,
      },
      {
        activa: taller.modalidades.concesionarias,
        titulo: 'Servicio especializado para concesionarias',
        texto: 'Trabajo por volumen y entregas coordinadas.',
        accion: email ? (
          <a href={`mailto:${email}`} className={botonSecundario}>
            Consultar por mail
          </a>
        ) : null,
      }
    )
  }

  if (taller.rubros.arquitectura) {
    // Siempre activa: no depende de un check del instalador porque es como
    // funciona el rubro. Nadie lleva su ventana al taller, así que el trabajo
    // en inmuebles empieza sí o sí con alguien yendo a mirar y a medir.
    tarjetas.push({
      activa: true,
      titulo: 'Casas, oficinas y edificios',
      texto: 'Vamos a medir y te pasamos el presupuesto.',
      accion: (
        <button type="button" onClick={() => onAgendar('ARCHITECTURAL')} className={boton}>
          Pedir una visita
        </button>
      ),
    })
  }

  if (tarjetas.length === 0) return null

  return (
    <div className={`grid gap-3 ${tarjetas.length > 3 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
      {tarjetas.map((t) => (
        <article
          key={t.titulo}
          aria-disabled={!t.activa}
          className={`flex flex-col gap-2 rounded-xl border p-4 ${
            t.activa
              ? 'border-[color:var(--color-linea)] bg-[color:var(--color-superficie)]'
              : 'border-dashed border-[color:var(--color-linea)] bg-transparent opacity-55'
          }`}
        >
          <h3 className="text-sm font-semibold leading-snug">{t.titulo}</h3>
          <p className="flex-1 text-xs text-[color:var(--color-tenue)]">{t.texto}</p>

          {t.activa ? (
            // Sin acción quiere decir que falta el dato de contacto que esa
            // tarjeta necesita. Se dice, en vez de dejar un botón que no lleva
            // a ningún lado.
            (t.accion ?? (
              <p className="text-xs text-[color:var(--color-tenue)]">
                Consultá por los datos de contacto de arriba.
              </p>
            ))
          ) : (
            <p className="rounded-lg border border-[color:var(--color-linea)] px-4 py-2.5 text-center text-xs text-[color:var(--color-tenue)]">
              No disponible
            </p>
          )}
        </article>
      ))}
    </div>
  )
}
