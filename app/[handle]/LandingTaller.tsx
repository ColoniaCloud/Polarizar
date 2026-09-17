'use client'

import { useState } from 'react'
import HeaderTaller from './HeaderTaller'
import HeroTaller from './HeroTaller'
import TurnoWizard from './TurnoWizard'
import Modalidades from './Modalidades'
import TiposCarousel from './TiposCarousel'
import AlbumSlider from './AlbumSlider'
import Footer from './Footer'
import WhatsAppFlotante from './WhatsAppFlotante'
import { Mapa } from './iconos'
import type { PublicWorkshop, PublicService } from '@/lib/crm'
import { formatDias, formatPrecio, formatDuracion } from '@/lib/formato'
import { variablesDelTema } from '@/lib/tema'

/**
 * La página pública del taller.
 *
 * Después del hero, el contenido se reparte en cuatro tramos:
 *
 * 1. Servicios + áreas que cubre (col. 1) al lado del botón que abre el
 *    wizard de reserva + el álbum de fotos (col. 2).
 * 2. El carousel "Aplicamos láminas en:".
 * 3. Una foto de fondo con el nombre bien grande, al lado del mapa y dos
 *    botones para llegar.
 * 4. El footer.
 *
 * El wizard vive en un solo componente (`TurnoWizard`) montado una vez acá
 * arriba, y **no** en cada tarjeta de servicio: abrirlo desde una tarjeta
 * puntual solo cambia qué servicio viene preseleccionado
 * (`servicioParaWizard`), igual que antes hacía `elegirServicio` con el
 * formulario inline.
 */
export default function LandingTaller({
  handle,
  taller,
  logoUrl,
  heroUrl,
  photoUrls,
  mapaUrl,
  mapaLinkDestino,
  emailContacto,
  apiBase = '/api/turno',
  demo = false,
}: {
  handle: string
  taller: PublicWorkshop
  logoUrl: string | null
  /** `null` = todavía no subió foto de portada: se usa el layout de siempre. */
  heroUrl: string | null
  /** URLs ya resueltas del álbum, en el orden elegido por el taller. */
  photoUrls: string[]
  mapaUrl: string | null
  /** Para el botón "Cómo llegar": coordenadas si hay, si no la dirección en texto. */
  mapaLinkDestino: string | null
  emailContacto: string | null
  /** `/api/turno` en la página real, `/api/turno/demo` en la de demostración. */
  apiBase?: string
  /** Dibuja la banda de arriba y cambia lo que promete el formulario. */
  demo?: boolean
}) {
  const [wizardAbierto, setWizardAbierto] = useState(false)
  const [servicioParaWizard, setServicioParaWizard] = useState<string | undefined>(undefined)

  const autos = taller.services.filter((s) => s.category === 'AUTOMOTIVE')
  const inmuebles = taller.services.filter((s) => s.category === 'ARCHITECTURAL')
  const agrupar = autos.length > 0 && inmuebles.length > 0

  const soloArquitectura = taller.rubros.arquitectura && !taller.rubros.automotriz

  const dias = formatDias(taller.hours.days)
  const horario =
    taller.hours.opening && taller.hours.closing
      ? `${taller.hours.opening} a ${taller.hours.closing}`
      : null

  // Mismo texto que mostraba siempre la Sección 1 — con hero, se muda ahí
  // adentro; sin hero, se queda donde estaba. No se reinventa el contenido.
  const subtituloGenerado = `Instalador autorizado Kristall${
    taller.rubros.automotriz && taller.rubros.arquitectura
      ? ' · Vehículos y arquitectura'
      : soloArquitectura
        ? ' · Vidrios de casas, oficinas y edificios'
        : ''
  }`
  // La descripción que escribió el instalador manda sobre el texto genérico
  // — es justo lo que ese campo existe para reemplazar.
  const subtitulo = taller.description?.trim() || subtituloGenerado

  function abrirWizard(serviceId?: string) {
    setServicioParaWizard(serviceId)
    setWizardAbierto(true)
  }

  const wa = taller.phone
    ? `https://wa.me/${(() => {
        const d = taller.phone.replace(/\D/g, '')
        return d.startsWith('54') || d.startsWith('598') ? d : `54${d.replace(/^0/, '')}`
      })()}`
    : null

  return (
    <div
      className="tipografia-taller min-h-screen bg-[color:var(--color-fondo)] text-[color:var(--color-tinta)]"
      style={variablesDelTema(taller.pageTheme)}
    >
      {/* Va arriba de todo y no se puede cerrar.
          Esta página se va a terminar compartiendo por WhatsApp, y alguien va a
          pedirle turno a un taller que no existe. Que se lea antes que el logo
          es el punto: después ya es tarde. */}
      {demo && (
        <div className="bg-amber-100 px-5 py-2.5 text-center text-sm text-amber-900">
          <strong className="font-semibold">Esto es una demostración.</strong> El taller no existe y
          los turnos que pidas acá no le llegan a nadie.
        </div>
      )}

      <HeaderTaller
        nombre={taller.name}
        logoUrl={logoUrl}
        telefono={taller.phone}
        email={emailContacto}
        fondo={taller.logoBackground}
      />

      {heroUrl && <HeroTaller heroUrl={heroUrl} nombre={taller.name} subtitulo={subtitulo} />}

      {/* ── Servicios + áreas · reservar + álbum ────────────────────────── */}
      <section id="servicios" className="mx-auto max-w-6xl px-5 py-10 md:py-14">
        <div className="grid gap-10 md:grid-cols-2 md:gap-14">
          <div className="flex flex-col gap-6">
            {!heroUrl && (
              <div>
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{taller.name}</h1>
                <p className="mt-2 text-sm text-[color:var(--color-tenue)]">{subtitulo}</p>
              </div>
            )}

            {(taller.address || dias || horario) && (
              <p className="text-sm text-[color:var(--color-tenue)]">
                {[taller.address, [dias, horario].filter(Boolean).join(', ')].filter(Boolean).join(' · ')}
              </p>
            )}

            <div>
              <h2 className="mb-3 text-lg font-semibold">Servicios</h2>
              {taller.services.length === 0 ? (
                <p className="text-sm text-[color:var(--color-tenue)]">
                  Este taller todavía no cargó sus servicios. Escribile y coordinás directamente.
                </p>
              ) : agrupar ? (
                <div className="flex flex-col gap-5">
                  <Grupo titulo="Para tu vehículo" servicios={autos} onElegir={abrirWizard} />
                  <Grupo titulo="Para tu casa u oficina" servicios={inmuebles} onElegir={abrirWizard} />
                </div>
              ) : (
                <ListaServicios servicios={taller.services} onElegir={abrirWizard} />
              )}
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold">Dónde trabajamos</h2>
              <Modalidades taller={taller} wa={wa} email={emailContacto} />
            </div>

            <p className="text-xs text-[color:var(--color-tenue)]">
              Trabaja con láminas <strong className="font-semibold">Kristall Film</strong>, con
              garantía registrada.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => abrirWizard()}
              className="w-full rounded-2xl bg-[color:var(--color-acento)] px-6 py-5 text-lg font-semibold text-white transition-transform hover:scale-[1.01]"
            >
              {soloArquitectura ? 'Pedir una visita' : 'Agendar un turno'}
            </button>

            {photoUrls.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-semibold">Trabajos realizados</h2>
                <AlbumSlider fotos={photoUrls} />
              </div>
            )}
          </div>
        </div>
      </section>

      <TiposCarousel taller={taller} />

      {/* ── Cierre: marca + mapa ─────────────────────────────────────────── */}
      <section className="grid overflow-hidden md:grid-cols-2">
        <div
          className="relative flex min-h-[22rem] items-center px-6 py-10 sm:px-10"
          style={
            (photoUrls[0] ?? heroUrl)
              ? { backgroundImage: `url(${photoUrls[0] ?? heroUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : undefined
          }
        >
          {(photoUrls[0] ?? heroUrl) && <div className="absolute inset-0 bg-black/55" />}
          <h2
            className={`relative z-10 font-marca text-4xl font-semibold leading-tight sm:text-5xl ${
              photoUrls[0] ?? heroUrl ? 'text-white' : ''
            }`}
          >
            {taller.name}
          </h2>
        </div>

        <div className="flex flex-col gap-4 bg-[color:var(--color-superficie)] p-6 sm:p-10">
          {mapaUrl ? (
            <div className="overflow-hidden rounded-xl border border-[color:var(--color-linea)]">
              <iframe
                src={mapaUrl}
                title={`Dónde queda ${taller.name}`}
                className="block h-72 w-full border-0"
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
          {mapaLinkDestino && (
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapaLinkDestino)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--color-acento)] px-5 py-2.5 text-sm font-medium text-white"
              >
                <Mapa />
                Cómo llegar
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapaLinkDestino)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--color-linea)] px-5 py-2.5 text-sm font-medium"
              >
                Abrir en Maps
              </a>
            </div>
          )}
        </div>
      </section>

      <Footer taller={taller} logoUrl={logoUrl} />
      <WhatsAppFlotante wa={wa} />

      <TurnoWizard
        abierto={wizardAbierto}
        onCerrar={() => setWizardAbierto(false)}
        handle={handle}
        taller={taller}
        apiBase={apiBase}
        serviceIdInicial={servicioParaWizard}
        wa={wa}
      />
    </div>
  )
}

function Grupo({
  titulo,
  servicios,
  onElegir,
}: {
  titulo: string
  servicios: PublicService[]
  onElegir: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-tenue)]">
        {titulo}
      </h3>
      <ListaServicios servicios={servicios} onElegir={onElegir} />
    </div>
  )
}

function ListaServicios({
  servicios,
  onElegir,
}: {
  servicios: PublicService[]
  onElegir: (id: string) => void
}) {
  return (
    <ul className="flex flex-col gap-2">
      {servicios.map((s) => {
        const precio = formatPrecio(s.priceFrom, s.currency)
        const esArquitectura = s.category === 'ARCHITECTURAL'
        return (
          <li key={s.id}>
            {/* Cliqueable entero, no solo un link chico al costado: en un
                telefono el area de toque es lo que decide si algo se usa o se
                abandona. */}
            <button
              type="button"
              onClick={() => onElegir(s.id)}
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
                  {esArquitectura ? 'Pedir una visita →' : 'Agendar este servicio →'}
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
                  <span className="block text-sm text-[color:var(--color-tenue)]">A consultar</span>
                )}
                {/* La duracion es el turno que se reserva. En una visita para
                    medir no significa nada, asi que no se muestra. */}
                {!esArquitectura && (
                  <span className="block text-xs text-[color:var(--color-tenue)]">
                    {formatDuracion(s.durationMinutes)}
                  </span>
                )}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
