'use client'

import { useEffect, useState } from 'react'
import { X } from './iconos'
import type { PublicWorkshop } from '@/lib/crm'

/** Llave: "servicio en el taller". */
function IconoLlave({ className = 'size-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.7 6.3a4 4 0 1 0-5.66 5.66L3 18v3h3l6.04-6.04a4 4 0 0 0 5.66-5.66l-2.83 2.83-2-2Z" />
    </svg>
  )
}

/** Pin de ubicación: "servicio a domicilio". */
function IconoUbicacion({ className = 'size-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s7-6.2 7-11.2A7 7 0 0 0 5 9.8C5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  )
}

/** Edificio: "concesionarias" y "casas, oficinas y edificios". */
function IconoEdificio({ className = 'size-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" />
    </svg>
  )
}

interface Modalidad {
  clave: string
  Icono: (props: { className?: string }) => React.JSX.Element
  titulo: string
  /** La línea corta de siempre: qué es, en una oración. */
  resumen: string
  /** Lo que no entra en un chip y hay que abrir para leer. */
  detalle: string[]
  activa: boolean
  /** Solo donde hace falta coordinar antes — ver el comentario de abajo. */
  accion?: { href: string; texto: string }
}

/**
 * Cómo trabaja el taller, en chips que abren un modal con la explicación.
 *
 * ─── Las de automotriz se muestran siempre ─────────────────────────────────
 *
 * Las tres de auto —taller, domicilio, concesionarias— aparecen aunque el
 * taller no las haya marcado, y las que no marcó van apagadas. Ocultarlas sería
 * más limpio pero peor: alguien que entra buscando servicio a domicilio
 * necesita enterarse de que este taller no lo hace, y si el chip no está
 * simplemente sigue buscando sin saber. Apagado responde la pregunta — y por
 * eso el chip apagado **también** abre su modal: ahí dice qué es la modalidad
 * y que este taller no la ofrece.
 *
 * ─── Pero un taller de arquitectura no muestra las de auto ─────────────────
 *
 * Eso vale **dentro de un rubro**. «Dejás el vehículo y lo retirás listo» no es
 * información para alguien que quiere laminar las ventanas de su casa: es
 * ruido, y encima lo hace dudar de si entró al lugar correcto. Un chip apagado
 * dice «esto no lo hago»; un chip de otro rubro dice «esto no es lo tuyo».
 *
 * ─── La acción del modal no es la misma en todas ───────────────────────────
 *
 * Un turno en el taller se agenda solo, con el botón de arriba. Un trabajo a
 * domicilio o en una concesionaria hay que conversarlo antes —depende de la
 * distancia, de cuántas unidades, de cuándo— y mandarlo al formulario de turno
 * sería prometer una agenda que no aplica; esos dos llevan el contacto directo.
 */
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
  const [abierta, setAbierta] = useState<Modalidad | null>(null)

  // Cierra con Escape — mismo criterio que el wizard de turno.
  useEffect(() => {
    if (!abierta) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setAbierta(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [abierta])

  const modalidades: Modalidad[] = []

  if (taller.rubros.automotriz) {
    modalidades.push(
      {
        clave: 'taller',
        Icono: IconoLlave,
        titulo: 'En el taller',
        resumen: 'Dejás el vehículo y lo retirás listo.',
        detalle: [
          'Llevás el vehículo al taller el día y la hora que reservaste, y lo dejás mientras se hace el trabajo.',
          'Es la forma más prolija de colocar la lámina: adentro, sin viento ni polvo, que son los que terminan quedando abajo del film.',
          'Cuánto tarda cada trabajo está en la lista de servicios, al lado del precio.',
        ],
        activa: Boolean(taller.modalidades.taller),
      },
      {
        clave: 'domicilio',
        Icono: IconoUbicacion,
        titulo: 'A domicilio',
        resumen: 'Vamos hasta donde esté el vehículo.',
        detalle: [
          'El taller va hasta donde esté el vehículo —tu casa, el trabajo, la cochera— y hace el trabajo ahí.',
          'Conviene coordinarlo antes: depende de la distancia, de dónde va a estar el auto y de que haya sombra y lugar para trabajar alrededor.',
        ],
        activa: Boolean(taller.modalidades.domicilio),
        accion: wa ? { href: wa, texto: 'Consultar por WhatsApp' } : undefined,
      },
      {
        clave: 'concesionarias',
        Icono: IconoEdificio,
        titulo: 'Concesionarias',
        resumen: 'Trabajo por volumen y entregas coordinadas.',
        detalle: [
          'Para agencias y concesionarias que necesitan polarizar varias unidades.',
          'No se reserva por turno: se arma un plan de entregas según cuántas unidades son y para cuándo las necesitás.',
        ],
        activa: Boolean(taller.modalidades.concesionarias),
        accion: email ? { href: `mailto:${email}`, texto: 'Consultar por mail' } : undefined,
      }
    )
  }

  if (taller.rubros.arquitectura) {
    // Siempre activa: no depende de un check del instalador porque es como
    // funciona el rubro. Nadie lleva su ventana al taller, así que el trabajo
    // en inmuebles empieza sí o sí con alguien yendo a mirar y a medir.
    modalidades.push({
      clave: 'arquitectura',
      Icono: IconoEdificio,
      titulo: 'Casas, oficinas y edificios',
      resumen: 'Vamos a medir y te pasamos el presupuesto.',
      detalle: [
        'En arquitectura no hay turno que reservar: primero alguien va hasta el lugar, mide los vidrios y ve cómo se llega a ellos — no es lo mismo una ventana a la calle que un ventanal en altura.',
        'Con esa visita sale el presupuesto, y recién ahí se agenda la colocación.',
      ],
      activa: true,
    })
  }

  if (modalidades.length === 0) return null

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {modalidades.map((m) => (
          <button
            key={m.clave}
            type="button"
            onClick={() => setAbierta(m)}
            aria-haspopup="dialog"
            // Cada chip mide lo que mide su texto y envuelve a la línea de
            // abajo si no entra. Estirados en partes iguales (`flex-1`), en la
            // columna angosta de "Nosotros" los cuatro rubros partían la
            // etiqueta en tres renglones: "Casas, / oficinas y / edificios".
            className={`group flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
              m.activa
                ? 'border-transparent bg-[color:var(--color-superficie)] text-[color:var(--color-tinta)] hover:bg-[color:var(--color-acento)] hover:text-white'
                : 'border-[color:var(--color-linea)] bg-transparent text-[color:var(--color-tenue)] opacity-60 hover:opacity-100'
            }`}
          >
            <span className="transition-transform duration-200 group-hover:scale-110">
              <m.Icono />
            </span>
            <span>{m.titulo}</span>
          </button>
        ))}
      </div>

      {abierta && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
          {/* El backdrop cierra al tocarlo. El panel de adentro corta el click
              para que leer el texto no cierre el modal. */}
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setAbierta(null)}
            className="absolute inset-0 cursor-default"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modalidad"
            className="relative w-full max-w-md overflow-hidden rounded-t-2xl bg-[color:var(--color-fondo)] text-[color:var(--color-tinta)] shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-4 px-5 pt-5">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--color-superficie)] text-[color:var(--color-acento)]">
                <abierta.Icono className="size-9" />
              </span>

              <button
                type="button"
                autoFocus
                onClick={() => setAbierta(null)}
                aria-label="Cerrar"
                className="rounded-lg p-1.5 text-[color:var(--color-tenue)] hover:bg-[color:var(--color-superficie)]"
              >
                <X />
              </button>
            </div>

            <div className="px-5 pb-5 pt-4">
              <h3 id="titulo-modalidad" className="text-lg font-semibold">
                {abierta.titulo}
              </h3>
              <p className="mt-1 text-sm font-medium text-[color:var(--color-tinta)]">
                {abierta.resumen}
              </p>

              <div className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-[color:var(--color-tenue)]">
                {abierta.detalle.map((parrafo) => (
                  <p key={parrafo}>{parrafo}</p>
                ))}
              </div>

              {abierta.activa ? (
                abierta.accion && (
                  <a
                    href={abierta.accion.href}
                    target={abierta.accion.href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className="mt-5 block rounded-xl bg-[color:var(--color-acento)] px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    {abierta.accion.texto}
                  </a>
                )
              ) : (
                <p className="mt-5 rounded-xl border border-dashed border-[color:var(--color-linea)] px-4 py-3 text-center text-sm text-[color:var(--color-tenue)]">
                  {taller.name} no trabaja de esta forma.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
