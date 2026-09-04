'use client'

import type { PublicWorkshop } from '@/lib/crm'

/**
 * Cómo trabaja el taller, en tarjetas.
 *
 * **Las tres se muestran siempre**, y las que el taller no marcó van apagadas.
 * Ocultarlas sería más limpio pero peor: alguien que entra buscando servicio a
 * domicilio necesita enterarse de que este taller no lo hace, y si la tarjeta
 * no está simplemente sigue buscando sin saber. Apagada responde la pregunta.
 *
 * Cada una lleva la acción que corresponde a su modalidad, y no todas llevan la
 * misma: un turno en el taller se agenda solo, pero un trabajo a domicilio o en
 * una concesionaria hay que conversarlo antes —depende de la distancia, de
 * cuántas unidades, de cuándo— y mandarlo a un formulario de turno sería
 * prometer una agenda que no aplica.
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
  onAgendar: () => void
}) {
  const tarjetas = [
    {
      activa: taller.modalidades.taller,
      titulo: 'Servicio en el taller',
      texto: 'Dejás el vehículo y lo retirás listo.',
      accion: (
        <button
          type="button"
          onClick={onAgendar}
          className="w-full rounded-lg bg-[color:var(--color-acento)] px-4 py-2.5 text-sm font-medium text-white"
        >
          Reservar turno
        </button>
      ),
    },
    {
      activa: taller.modalidades.domicilio,
      titulo: 'Realizamos servicio a domicilio',
      texto: 'Vamos hasta donde esté el vehículo.',
      accion: wa ? (
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          className="block w-full rounded-lg border border-[color:var(--color-linea)] px-4 py-2.5 text-center text-sm font-medium"
        >
          Consultar turno por WhatsApp
        </a>
      ) : null,
    },
    {
      activa: taller.modalidades.concesionarias,
      titulo: 'Servicio especializado para concesionarias',
      texto: 'Trabajo por volumen y entregas coordinadas.',
      accion: email ? (
        <a
          href={`mailto:${email}`}
          className="block w-full rounded-lg border border-[color:var(--color-linea)] px-4 py-2.5 text-center text-sm font-medium"
        >
          Consultar por mail
        </a>
      ) : null,
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-3">
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
