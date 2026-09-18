'use client'

import type { PublicWorkshop } from '@/lib/crm'

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
/** Llave: "servicio en el taller". */
function IconoLlave() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.7 6.3a4 4 0 1 0-5.66 5.66L3 18v3h3l6.04-6.04a4 4 0 0 0 5.66-5.66l-2.83 2.83-2-2Z" />
    </svg>
  )
}

/** Pin de ubicación: "servicio a domicilio". */
function IconoUbicacion() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s7-6.2 7-11.2A7 7 0 0 0 5 9.8C5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  )
}

/** Edificio: "concesionarias" y "casas, oficinas y edificios". */
function IconoEdificio() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" />
    </svg>
  )
}

export default function Modalidades({
  taller,
  wa,
  email,
}: {
  taller: PublicWorkshop
  /** Link de WhatsApp ya armado, o `null` si no cargó teléfono. */
  wa: string | null
  email: string | null
}) {
  const botonSecundario =
    'mt-1 block w-full rounded-lg border border-[color:var(--color-linea)] px-3 py-2 text-center text-xs font-medium'

  const tarjetas: {
    icono: React.ReactNode
    activa: boolean
    titulo: string
    texto: string
    accion: React.ReactNode
  }[] = []

  if (taller.rubros.automotriz) {
    tarjetas.push(
      {
        icono: <IconoLlave />,
        activa: taller.modalidades.taller,
        titulo: 'En el taller',
        texto: 'Dejás el vehículo y lo retirás listo.',
        // Reservar ya está resuelto por el botón grande de arriba — esta
        // tarjeta es informativa, no repite la acción.
        accion: null,
      },
      {
        icono: <IconoUbicacion />,
        activa: taller.modalidades.domicilio,
        titulo: 'A domicilio',
        texto: 'Vamos hasta donde esté el vehículo.',
        accion: wa ? (
          <a href={wa} target="_blank" rel="noreferrer" className={botonSecundario}>
            Consultar por WhatsApp
          </a>
        ) : null,
      },
      {
        icono: <IconoEdificio />,
        activa: taller.modalidades.concesionarias,
        titulo: 'Concesionarias',
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
      icono: <IconoEdificio />,
      activa: true,
      titulo: 'Casas, oficinas y edificios',
      texto: 'Vamos a medir y te pasamos el presupuesto.',
      accion: null,
    })
  }

  if (tarjetas.length === 0) return null

  return (
    // Una sola línea siempre: en escritorio las 3-4 tarjetas entran holgadas
    // en el ancho de contenido, y en celular scrollea en vez de achicarse
    // hasta ser ilegible.
    <div className="flex gap-3 overflow-x-auto pb-1">
      {tarjetas.map((t) => (
        <article
          key={t.titulo}
          aria-disabled={!t.activa}
          className={`flex w-56 shrink-0 flex-col gap-2 rounded-xl border p-4 sm:w-64 ${
            t.activa
              ? 'border-[color:var(--color-linea)] bg-[color:var(--color-superficie)]'
              : 'border-dashed border-[color:var(--color-linea)] bg-transparent opacity-55'
          }`}
        >
          <span className="text-[color:var(--color-acento)]">{t.icono}</span>
          <h3 className="text-sm font-semibold leading-snug">{t.titulo}</h3>
          <p className="flex-1 text-xs text-[color:var(--color-tenue)]">{t.texto}</p>

          {!t.activa && (
            <p className="rounded-lg border border-[color:var(--color-linea)] px-3 py-2 text-center text-xs text-[color:var(--color-tenue)]">
              No disponible
            </p>
          )}
          {t.activa && t.accion}
        </article>
      ))}
    </div>
  )
}
