'use client'

import { useEffect, useState } from 'react'
import HeaderTaller from './HeaderTaller'
import HeroTaller from './HeroTaller'
import SidebarTaller from './SidebarTaller'
import TurnoWizard from './TurnoWizard'
import Modalidades from './Modalidades'
import AlbumSlider from './AlbumSlider'
import BorderBeam from './BorderBeam'
import EntradaDifusa from './EntradaDifusa'
import Footer from './Footer'
import WhatsAppFlotante from './WhatsAppFlotante'
import { Mapa, Whatsapp, Mail, Instagram, Facebook, Tiktok, Google } from './iconos'
import type { PublicWorkshop, PublicService, FotoDelAlbum } from '@/lib/crm'
import { formatDias, formatPrecio, formatDuracion } from '@/lib/formato'
import { variablesDelTema } from '@/lib/tema'

const REDES: { key: 'instagram' | 'facebook' | 'tiktok' | 'google'; label: string; icono: React.ReactNode }[] = [
  { key: 'instagram', label: 'Instagram', icono: <Instagram /> },
  { key: 'facebook', label: 'Facebook', icono: <Facebook /> },
  { key: 'tiktok', label: 'TikTok', icono: <Tiktok /> },
  { key: 'google', label: 'Google (Maps o Negocio)', icono: <Google /> },
]

/**
 * La página pública del taller.
 *
 * Después del hero (ahora solo la foto, sin texto encima), el contenido se
 * reparte en:
 *
 * 1. Info y descripción del taller / servicios, en dos columnas sobre un
 *    fondo levemente más oscuro que el resto de la página.
 * 2. Dónde trabajamos, en una sola línea de tarjetas.
 * 3. Trabajos realizados (si subió fotos).
 * 4. El carousel "Aplicamos láminas en:".
 * 5. Una foto de fondo con el nombre bien grande, al lado del mapa y dos
 *    botones para llegar.
 * 6. El footer.
 *
 * El wizard vive en un solo componente (`TurnoWizard`) montado una vez acá
 * arriba, y **no** en cada tarjeta de servicio: abrirlo desde una tarjeta
 * puntual solo cambia qué servicio viene preseleccionado
 * (`servicioParaWizard`), igual que antes hacía `elegirServicio` con el
 * formulario inline.
 *
 * El menú lateral (`SidebarTaller`) vive afuera de la columna de contenido,
 * como hermano en el mismo `flex` — así puede empujarla en escritorio sin
 * que el contenido tenga que saber que existe.
 */
export default function LandingTaller({
  handle,
  taller,
  logoUrl,
  heroUrl,
  teamUrl,
  fotos,
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
  /** La cara de quien atiende. `null` = no subió ninguna. */
  teamUrl: string | null
  /** El álbum ya normalizado (URL + descripción), en el orden del taller. */
  fotos: FotoDelAlbum[]
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
  const [sidebarAbierto, setSidebarAbierto] = useState(false)

  const autos = taller.services.filter((s) => s.category === 'AUTOMOTIVE')
  const inmuebles = taller.services.filter((s) => s.category === 'ARCHITECTURAL')
  const agrupar = autos.length > 0 && inmuebles.length > 0

  const soloArquitectura = taller.rubros.arquitectura && !taller.rubros.automotriz

  const dias = formatDias(taller.hours.days)
  const horario =
    taller.hours.opening && taller.hours.closing
      ? `${taller.hours.opening} a ${taller.hours.closing}`
      : null
  const diasYHorario = [dias, horario].filter(Boolean).join(', ') || null

  // Mismo texto que mostraba siempre el hero viejo. No se reinventa el
  // contenido, solo se muda de lugar.
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

  const redesActivas = REDES.filter((r) => taller.social[r.key])

  // Ver el comentario en la sección de "Nosotros" para el porqué del umbral.
  const respaldo = {
    desde: taller.instaladorDesde ?? null,
    garantias: (taller.garantiasRegistradas ?? 0) >= 10 ? taller.garantiasRegistradas : null,
  }

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

  // La portada no lleva `alt`: el nombre del taller está escrito encima de
  // ella, en el h1, así que describirla otra vez es repetir. Las del álbum sí,
  // con lo que haya escrito el taller.
  const slides = [
    ...(heroUrl ? [{ image: heroUrl, alt: '' }] : []),
    ...fotos.map((f) => ({ image: f.url, alt: f.descripcion ?? '' })),
  ].slice(0, 6)

  // Arranca en `true` cuando hay hero: al abrir la página la cabecera ya está
  // sobre la foto, y esperar a que el primer scroll lo confirme se vería como
  // un parpadeo del fondo en el primer cuadro. Sin foto de portada no hay nada
  // detrás de la cabecera, así que va opaca desde el principio.
  const [cabeceraSobreFoto, setCabeceraSobreFoto] = useState(slides.length > 0)

  // El cartel de "Abierto ahora" del hero.
  //
  // Se calcula recién en el navegador y no al renderizar: el server puede
  // estar en otro huso horario que quien mira la página, y un cartel que dice
  // una cosa en el HTML y otra al hidratar es un error de React, no un
  // detalle. `null` = todavía no se sabe (o el taller no cargó horario), y en
  // ese caso el hero no dibuja el cartel.
  const [abiertoAhora, setAbiertoAhora] = useState<boolean | null>(null)

  useEffect(() => {
    const { opening, closing, days } = taller.hours
    if (!opening || !closing) return

    const enMinutos = (hhmm: string) => {
      const [h, m] = hhmm.split(':').map(Number)
      return h * 60 + m
    }

    const ahora = new Date()
    // `days` viene como "1,2,3,4,5" con 1 = lunes; `getDay()` usa 0 = domingo.
    // Sin esto, un taller cerrado el domingo decía "Abierto ahora" el domingo.
    const hoy = ahora.getDay() === 0 ? 7 : ahora.getDay()
    const abreHoy = days
      ? days
          .split(',')
          .map((d) => Number(d.trim()))
          .includes(hoy)
      : true
    const ahoraEnMinutos = ahora.getHours() * 60 + ahora.getMinutes()

    setAbiertoAhora(
      abreHoy && ahoraEnMinutos >= enMinutos(opening) && ahoraEnMinutos <= enMinutos(closing)
    )
  }, [taller.hours])

  return (
    <div
      className="tipografia-taller min-h-screen bg-[color:var(--color-fondo)] text-[color:var(--color-tinta)]"
      style={variablesDelTema(taller.pageTheme, taller.accentColor)}
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

      <div className="flex">
        <div className="min-w-0 flex-1">
          <HeaderTaller
            nombre={taller.name}
            logoUrl={logoUrl}
            fondo={taller.logoBackground}
            transparente={cabeceraSobreFoto}
            onAbrirMenu={() => setSidebarAbierto(true)}
          />

          {slides.length > 0 && (
            <HeroTaller
              slides={slides}
              nombre={taller.name}
              direccion={taller.address}
              horarioTexto={diasYHorario}
              abierto={abiertoAhora}
              onAgendar={() => abrirWizard()}
              onWhatsApp={wa ? () => window.open(wa, '_blank', 'noopener,noreferrer') : undefined}
              onSobreFoto={setCabeceraSobreFoto}
            />
          )}

          <section id="nosotros" className="mx-auto max-w-[1280px] scroll-mt-28 px-4 py-9 md:px-6 md:py-14">
            <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:gap-8">
              <div className="flex flex-col gap-5">
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--color-tinta)]">
                  Nosotros:
                </h2>

                {/* La foto va antes del texto y no después: quien entra llega
                    de un mensaje de WhatsApp y está por dejarle el auto unas
                    horas a alguien que no conoce. La cara contesta esa
                    pregunta más rápido que cualquier párrafo.

                    Si no hay foto no se dibuja nada — ningún avatar genérico
                    con una silueta, que es peor que no tener: anuncia que no
                    hay nadie. Y si hay foto pero no nombre, tampoco se
                    inventa: queda la foto sola. */}
                {teamUrl && (
                  <figure className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={teamUrl}
                      alt={
                        taller.teamName
                          ? `${taller.teamName}${taller.teamRole ? `, ${taller.teamRole}` : ''}`
                          : ''
                      }
                      className="size-20 shrink-0 rounded-full object-cover md:size-24"
                    />
                    {taller.teamName && (
                      <figcaption className="min-w-0">
                        <span className="block font-semibold text-[color:var(--color-tinta)]">
                          {taller.teamName}
                        </span>
                        {taller.teamRole && (
                          <span className="block text-sm text-[color:var(--color-tenue)]">
                            {taller.teamRole}
                          </span>
                        )}
                      </figcaption>
                    )}
                  </figure>
                )}

                <p className="max-w-xl text-base leading-7 text-[color:var(--color-tenue)]">
                  {subtitulo || 'Especialistas en laminado automotriz y arquitectónico con atención personalizada y garantía registrada.'}
                </p>

                {/* `gap-0` + `py-3`: cada link mide 44px de alto para el dedo
                    sin que la lista quede más aireada que antes. El teléfono y
                    el mail se tocan para llamar o escribir — con 20px de alto
                    se fallaba seguido, y son la vía de contacto directa. */}
                <div className="flex flex-col gap-0 text-sm text-[color:var(--color-tenue)]">
                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 py-3 transition-colors hover:text-[color:var(--color-acento)]"
                    >
                      <Whatsapp />
                      <span>{taller.phone}</span>
                    </a>
                  )}

                  {emailContacto && (
                    <a
                      href={`mailto:${emailContacto}`}
                      className="inline-flex items-center gap-2 py-3 transition-colors hover:text-[color:var(--color-acento)]"
                    >
                      <Mail />
                      <span>{emailContacto}</span>
                    </a>
                  )}

                  {taller.address && (
                    <a
                      href={mapaLinkDestino ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapaLinkDestino)}` : '#ubicacion'}
                      target={mapaLinkDestino ? '_blank' : undefined}
                      rel={mapaLinkDestino ? 'noreferrer' : undefined}
                      className="inline-flex items-center gap-2 py-3 text-[color:var(--color-tenue)] transition-colors hover:text-[color:var(--color-acento)]"
                    >
                      <Mapa />
                      <span>{taller.address}</span>
                    </a>
                  )}
                  {redesActivas.length > 0 && (
                    <div className="flex items-center gap-3 pt-2">
                      {redesActivas.map((r) => (
                        <a
                          key={r.key}
                          href={taller.social[r.key] ?? undefined}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={r.label}
                          className="inline-flex size-11 items-center justify-center rounded-full border border-[color:var(--color-linea)] bg-[color:var(--color-superficie)] text-[color:var(--color-tenue)] transition-colors hover:border-[color:var(--color-acento)] hover:text-[color:var(--color-acento)]"
                        >
                          {r.icono}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Prueba social, con lo único que podemos afirmar de verdad:
                    desde cuándo está en la red y cuántas garantías se
                    activaron con su lámina. Nada de "cientos de clientes".

                    El umbral de 10 no es capricho: "2 garantías registradas"
                    convence menos que no decir nada, y un taller nuevo no
                    tiene por qué exhibir que recién empieza. Debajo de eso
                    queda solo la antigüedad, que no depende del volumen. */}
                {(respaldo.desde || respaldo.garantias) && (
                  <p className="text-sm text-[color:var(--color-tinta)]">
                    {[
                      respaldo.desde && `Instalador autorizado Kristall desde ${respaldo.desde}`,
                      respaldo.garantias &&
                        `${respaldo.garantias} garantías registradas con su lámina`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}

                {/* Lleva el ancla `#donde-trabajamos` — la del menú lateral y
                    la del footer — porque es el único lugar donde vive: antes
                    estaba dibujado dos veces, acá y otra vez a ancho completo
                    más abajo, diciendo exactamente lo mismo. */}
                <div id="donde-trabajamos" className="scroll-mt-28 pt-2">
                  <Modalidades
                    taller={taller}
                    wa={wa}
                    email={emailContacto}
                    onAgendar={() => abrirWizard()}
                  />
                </div>
              </div>

              <div
                id="servicios"
                // Sin borde propio: el anillo de adentro (`inset-[1px]`) ya
                // dibuja la línea de la tarjeta, y con los dos juntos el haz
                // corría por el medio de una línea doble — se veía un tubo.
                className="relative scroll-mt-28 overflow-hidden rounded-[22px] bg-[color:var(--color-superficie)] p-4 shadow-[0_20px_50px_rgba(15,23,42,0.06)] md:p-5"
              >
                <div className="absolute inset-[1px] rounded-[21px] border border-[color:var(--color-linea)]/80" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.34),transparent_34%),linear-gradient(120deg,transparent_0%,rgba(163,175,196,0.25)_50%,transparent_100%)] opacity-80" />
                <div className="relative z-10">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold text-[color:var(--color-tinta)]">Servicios</h2>
                    <span className="rounded-full border border-[color:var(--color-linea)] bg-[color:var(--color-fondo)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[color:var(--color-tenue)]">
                      {taller.services.length} servicios
                    </span>
                  </div>

                  {taller.services.length === 0 ? (
                    <p className="text-sm text-[color:var(--color-tenue)]">
                      Este taller todavía no cargó sus servicios.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {taller.services.slice(0, 5).map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => abrirWizard(s.id)}
                          className="flex items-center justify-between gap-4 rounded-xl border border-[color:var(--color-linea)] bg-[color:var(--color-fondo)] px-3 py-3 text-left transition-colors hover:border-[color:var(--color-acento)] hover:bg-[color:var(--color-superficie)]"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-[color:var(--color-tinta)]">{s.name}</div>
                            {s.description && (
                              <div className="mt-1 text-xs text-[color:var(--color-tenue)]">{s.description}</div>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            {s.priceFrom ? (
                              <div className="text-sm font-semibold text-[color:var(--color-acento)]">
                                {formatPrecio(s.priceFrom, s.currency)}
                              </div>
                            ) : (
                              <div className="text-xs text-[color:var(--color-tenue)]">Consultar</div>
                            )}
                            <div className="text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-tenue)]">
                              {s.category === 'ARCHITECTURAL' ? 'Visita' : 'Turno'}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dos haces cruzados por el borde de la tarjeta: uno con el
                    color de acento que eligió el taller y otro gris, que
                    arranca medio giro después (`retraso` = la mitad de
                    `duracion`) para que se persigan y no viajen pegados. */}
                <BorderBeam
                  color="var(--color-acento)"
                  tamano={400}
                  duracion={6}
                  ancho={2}
                  desenfoque={6}
                />
                <BorderBeam
                  color="var(--color-tenue)"
                  tamano={400}
                  duracion={6}
                  retraso={3}
                  ancho={2}
                  desenfoque={6}
                />
              </div>
            </div>
          </section>

          {fotos.length > 0 && (
            <section id="trabajos" className="mx-auto max-w-[1280px] scroll-mt-28 px-4 py-8 md:px-6 md:py-10">
              <h2 className="mb-4 text-xl font-semibold text-[color:var(--color-tinta)]">Trabajos realizados</h2>
              <AlbumSlider fotos={fotos} />
            </section>
          )}

          {/* Un gris oscuro fijo y no un token del tema: el fondo tiene que
              dejar ver el negro de las líneas, y los cuatro presets de la
              página van de blanco a negro — con el preset NEGRO las líneas
              desaparecerían y con BLANCO no habría contraste. Esta banda es de
              Kristall, no del taller, así que que se vea igual en las cuatro
              paletas también es lo correcto. */}
          <section className="relative overflow-hidden bg-[#3a3f46] py-16 md:py-24">
            <div
              className="absolute inset-0 opacity-90"
              style={{
                backgroundImage: "url('/lineas.svg')",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right top',
                backgroundSize: 'cover',
              }}
            />
            <div className="relative mx-auto max-w-[1280px] px-4 md:px-6">
              {/* Todo alineado a la izquierda, y cada parte entra con su propio
                  tiempo: con retrasos iguales la sección aparece de golpe como
                  un bloque, y con estos se arma sola de arriba hacia abajo. */}
              <div className="flex flex-col items-start gap-5">
                <EntradaDifusa duracion={650}>
                  <img
                    src="/logo-kristall.png"
                    alt="Kristall Film"
                    className="h-9 w-auto rounded-md object-contain shadow-md md:h-12"
                  />
                </EntradaDifusa>

                {/* Las negritas cargan los dos nombres propios y el resto va en
                    peso regular. Todo en tinta, también "Kristall Film": acá el
                    acento es el color que eligió el taller, y pintar con él la
                    marca de otro es prestarle un color que no le corresponde. */}
                <EntradaDifusa retraso={140} duracion={800}>
                  <h2 className="max-w-3xl text-2xl font-normal tracking-[-0.04em] text-[#eef1f4] md:text-4xl">
                    <strong className="font-bold text-white">{taller.name}</strong> trabaja con el
                    respaldo y la garantía de los productos{' '}
                    <strong className="font-bold text-white">Kristall Film</strong>.
                  </h2>
                </EntradaDifusa>

                {/* Hasta acá "garantía" era una palabra suelta, y la garantía
                    es la objeción más cara del rubro: cualquiera dice que la
                    tiene. Estos tres renglones cuentan cómo funciona y dónde se
                    comprueba, que es lo único que la vuelve creíble.

                    Ninguno promete un plazo: la cobertura la fija el producto
                    que se termine instalando y sale en el certificado de cada
                    instalación. Un número inventado acá sería una promesa que
                    el taller después tiene que bancar. */}
                <EntradaDifusa retraso={300} duracion={850}>
                  <ul className="flex max-w-3xl flex-col gap-2 text-left text-sm text-white/75 md:text-base">
                  <li>Cada trabajo se registra con su propia garantía, a nombre tuyo.</li>
                  <li>
                    Te llega un certificado por mail con los datos de la instalación, el producto y
                    la cobertura.
                  </li>
                  <li>
                    La podés consultar cuando quieras en{' '}
                    <a
                      href="https://kristallfilm.com/garantia"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-white underline underline-offset-4"
                    >
                      kristallfilm.com/garantia
                    </a>
                    .
                  </li>
                  </ul>
                </EntradaDifusa>

                <EntradaDifusa retraso={470} duracion={700} className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => abrirWizard()}
                    className="rounded-full bg-[color:var(--color-acento)] px-5 py-3 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02] md:px-7 md:text-base"
                  >
                    Agendar turno
                  </button>

                  {wa && (
                    <button
                      type="button"
                      onClick={() => window.open(wa, '_blank', 'noopener,noreferrer')}
                      className="rounded-full border border-[color:var(--color-linea)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--color-tinta)] shadow-sm transition-transform hover:scale-[1.02] md:px-7 md:text-base"
                    >
                      Whatsapp
                    </button>
                  )}
                </EntradaDifusa>
              </div>
            </div>
          </section>

          <section id="ubicacion" className="mx-auto max-w-[1280px] scroll-mt-28 px-4 pb-12 pt-8 md:px-6 md:pb-20 md:pt-12">
            <div className="grid gap-6 md:grid-cols-2 md:gap-8">
              <div className="overflow-hidden rounded-[22px] border border-[color:var(--color-linea)] bg-[color:var(--color-superficie)]">
                {mapaUrl ? (
                  <iframe
                    src={mapaUrl}
                    title={`Dónde queda ${taller.name}`}
                    className="block h-[330px] w-full border-0 md:h-[420px]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex h-[330px] items-center justify-center p-6 text-center text-sm text-[color:var(--color-tenue)] md:h-[420px]">
                    {taller.address ?? 'Este taller todavía no cargó su dirección.'}
                  </div>
                )}
              </div>

              <div className="rounded-[22px] border border-[color:var(--color-linea)] bg-[color:var(--color-realce)] p-5 md:p-7">
                {/* Sin rótulo "UBICACIÓN" arriba: al lado hay un mapa y abajo
                    una dirección, así que la etiqueta no agregaba información
                    que no estuviera ya a la vista — y en 10px mayúsculas era,
                    además, el rengloncito que aparece en cualquier página
                    hecha con plantilla. */}
                <h2 className="text-3xl font-semibold tracking-[-0.05em] text-[color:var(--color-tinta)] md:text-4xl">
                  {taller.name}
                </h2>

                <div className="mt-4 flex flex-col gap-2 text-sm text-[color:var(--color-tenue)]">
                  {taller.address && <p>{taller.address}</p>}
                  {taller.hours.opening && taller.hours.closing && (
                    <p>
                      {dias || 'Horario'} · {taller.hours.opening} a {taller.hours.closing}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {mapaLinkDestino && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapaLinkDestino)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-[45%] min-w-[180px] items-center justify-center gap-2 rounded-full bg-[color:var(--color-acento)] px-4 py-3 text-sm font-semibold text-white"
                    >
                      <Mapa />
                      Cómo llegar
                    </a>
                  )}

                  {mapaLinkDestino && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapaLinkDestino)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-[45%] min-w-[180px] items-center justify-center gap-2 rounded-full border border-[color:var(--color-linea)] bg-white px-4 py-3 text-sm font-semibold text-[color:var(--color-tinta)]"
                    >
                      Abrir perfil de Google Maps
                    </a>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-0 text-sm text-[color:var(--color-tenue)]">
                  {wa && (
                    <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 py-3 hover:text-[color:var(--color-acento)]">
                      <Whatsapp />
                      {taller.phone}
                    </a>
                  )}
                  {emailContacto && (
                    <a href={`mailto:${emailContacto}`} className="inline-flex items-center gap-2 py-3 hover:text-[color:var(--color-acento)]">
                      <Mail />
                      {emailContacto}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>

          <Footer taller={taller} logoUrl={logoUrl} onAgendar={() => abrirWizard()} />
          <WhatsAppFlotante wa={wa} />
        </div>

        <SidebarTaller
          abierto={sidebarAbierto}
          onCerrar={() => setSidebarAbierto(false)}
          taller={taller}
          tieneAlbum={fotos.length > 0}
          onAgendar={() => abrirWizard()}
        />
      </div>

      <TurnoWizard
        abierto={wizardAbierto}
        onCerrar={() => setWizardAbierto(false)}
        handle={handle}
        taller={taller}
        logoUrl={logoUrl}
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
