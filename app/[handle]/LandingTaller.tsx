'use client'

import { useRef, useState } from 'react'
import HeaderTaller from './HeaderTaller'
import FormularioTurno from './FormularioTurno'
import type { PublicWorkshop } from '@/lib/crm'
import { formatDias, formatPrecio, formatDuracion } from '@/lib/formato'

/**
 * La página pública del taller.
 *
 * Vive en un componente de cliente porque hay una cosa que tienen que
 * compartir dos mitades de la pantalla: **el servicio elegido**. Tocarlo en la
 * lista de arriba baja hasta el formulario y lo deja seleccionado, que es el
 * camino natural —«esto quiero» y después «cuándo»— y evita que la persona
 * elija dos veces lo mismo en dos lugares distintos.
 *
 * El layout es de dos columnas en escritorio y una sola en teléfono, que es
 * donde se va a completar casi siempre.
 */
export default function LandingTaller({
  handle,
  taller,
  logoUrl,
  mapaUrl,
  emailContacto,
}: {
  handle: string
  taller: PublicWorkshop
  logoUrl: string | null
  mapaUrl: string | null
  emailContacto: string | null
}) {
  const [serviceId, setServiceId] = useState(taller.services[0]?.id ?? '')
  const [enviado, setEnviado] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  const dias = formatDias(taller.hours.days)
  const horario =
    taller.hours.opening && taller.hours.closing
      ? `${taller.hours.opening} a ${taller.hours.closing}`
      : null

  function elegirServicio(id: string) {
    setServiceId(id)
    // Sin `behavior: 'smooth'`: esa opcion se ignora en silencio en algunos
    // navegadores y el scroll no pasa. La suavidad la pone el CSS, que cuando
    // no esta soportado degrada a un salto en vez de a nada.
    formRef.current?.scrollIntoView({ block: 'start' })
  }

  const wa = taller.phone
    ? `https://wa.me/${(() => {
        const d = taller.phone.replace(/\D/g, '')
        return d.startsWith('54') || d.startsWith('598') ? d : `54${d.replace(/^0/, '')}`
      })()}`
    : null

  return (
    <div className="min-h-screen bg-[color:var(--color-fondo)] text-[color:var(--color-tinta)]">
      <HeaderTaller
        nombre={taller.name}
        logoUrl={logoUrl}
        telefono={taller.phone}
        email={emailContacto}
      />

      {/* ── Sección 1: quién es · qué ofrece ────────────────────────────── */}
      <section id="servicios" className="mx-auto max-w-6xl px-5 py-10 md:py-14">
        <div className="grid gap-10 md:grid-cols-2 md:gap-14">
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{taller.name}</h1>
              <p className="mt-2 text-sm text-[color:var(--color-tenue)]">
                Instalador autorizado Kristall
              </p>
            </div>

            <dl className="flex flex-col gap-3 text-sm">
              {taller.address && (
                <Dato etiqueta="Dónde">{taller.address}</Dato>
              )}
              {(dias || horario) && (
                <Dato etiqueta="Cuándo">{[dias, horario].filter(Boolean).join(', ')}</Dato>
              )}
              {taller.phone && (
                <Dato etiqueta="Teléfono">
                  <a href={`tel:${taller.phone.replace(/\s/g, '')}`} className="hover:underline">
                    {taller.phone}
                  </a>
                </Dato>
              )}
            </dl>

            <div className="flex flex-wrap gap-3">
              <a
                href="#agendar"
                className="rounded-xl bg-[color:var(--color-acento)] px-5 py-2.5 text-sm font-medium text-white"
              >
                Agendar un turno
              </a>
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-[color:var(--color-linea)] px-5 py-2.5 text-sm font-medium"
                >
                  Escribir por WhatsApp
                </a>
              )}
            </div>

            <p className="mt-2 text-xs text-[color:var(--color-tenue)]">
              Trabaja con láminas <strong className="font-semibold">Kristall Film</strong>, con
              garantía registrada.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Servicios</h2>
            {taller.services.length === 0 ? (
              <p className="text-sm text-[color:var(--color-tenue)]">
                Este taller todavía no cargó sus servicios. Escribile y coordinás directamente.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {taller.services.map((s) => {
                  const precio = formatPrecio(s.priceFrom, s.currency)
                  return (
                    <li key={s.id}>
                      {/* Cliqueable entero, no solo un link chico al costado: en
                          un teléfono el área de toque es lo que decide si algo
                          se usa o se abandona. */}
                      <button
                        type="button"
                        onClick={() => elegirServicio(s.id)}
                        className="flex w-full items-baseline gap-4 rounded-xl border border-[color:var(--color-linea)] bg-[color:var(--color-superficie)] p-4 text-left transition-colors hover:border-[color:var(--color-acento)]"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium">{s.name}</span>
                          {s.description && (
                            <span className="mt-0.5 block text-sm text-[color:var(--color-tenue)]">
                              {s.description}
                            </span>
                          )}
                          <span className="mt-1 block text-xs text-[color:var(--color-acento)]">
                            Agendar este servicio →
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          {precio ? (
                            <span className="block font-medium tabular-nums">
                              <span className="text-xs font-normal text-[color:var(--color-tenue)]">
                                desde{' '}
                              </span>
                              {precio}
                            </span>
                          ) : (
                            <span className="block text-sm text-[color:var(--color-tenue)]">
                              A consultar
                            </span>
                          )}
                          <span className="block text-xs text-[color:var(--color-tenue)]">
                            {formatDuracion(s.durationMinutes)}
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* ── Sección 2: pedir el turno · dónde queda ─────────────────────── */}
      <section
        id="agendar"
        ref={formRef}
        className="border-t border-[color:var(--color-linea)] bg-[color:var(--color-superficie)]/40 scroll-mt-16"
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 md:grid-cols-2 md:gap-14 md:py-14">
          <div>
            {enviado ? (
              <Gracias nombre={taller.name} logoUrl={logoUrl} wa={wa} />
            ) : (
              <>
                <h2 className="text-2xl font-semibold">Pedí tu turno</h2>
                <p className="mb-6 mt-1 text-sm text-[color:var(--color-tenue)]">
                  Dejale tus datos y {taller.name} te contacta para confirmarlo.
                </p>
                <FormularioTurno
                  handle={handle}
                  services={taller.services}
                  serviceId={serviceId}
                  onServiceId={setServiceId}
                  onListo={() => setEnviado(true)}
                />
              </>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Dónde queda</h2>
            {mapaUrl ? (
              <div className="overflow-hidden rounded-xl border border-[color:var(--color-linea)]">
                <iframe
                  src={mapaUrl}
                  title={`Dónde queda ${taller.name}`}
                  className="block h-[26rem] w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            ) : (
              <p className="text-sm text-[color:var(--color-tenue)]">
                {taller.address ?? 'Este taller todavía no cargó su dirección.'}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-[color:var(--color-tenue)]">{etiqueta}:</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  )
}

/**
 * El acuse.
 *
 * Cierra con el logo del taller y no con un tilde genérico: la persona acaba de
 * confiarle sus datos a un negocio concreto, y ver su marca es lo que confirma
 * que llegó a donde quería. El WhatsApp queda a mano porque es la duda típica
 * de los cinco minutos siguientes.
 */
function Gracias({
  nombre,
  logoUrl,
  wa,
}: {
  nombre: string
  logoUrl: string | null
  wa: string | null
}) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-xl border border-[color:var(--color-linea)] bg-[color:var(--color-superficie)] p-8 text-center">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={nombre} className="max-h-20 max-w-[14rem] object-contain" />
      ) : (
        <p className="text-xl font-semibold">{nombre}</p>
      )}
      <p className="max-w-sm text-[15px] leading-relaxed">
        Gracias por la confianza, en breve te confirmaremos tu turno. Ante cualquier duda escribinos
        por WhatsApp.
      </p>
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl bg-[color:var(--color-acento)] px-5 py-2.5 text-sm font-medium text-white"
        >
          Escribir por WhatsApp
        </a>
      )}
    </div>
  )
}
