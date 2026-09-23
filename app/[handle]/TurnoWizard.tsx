'use client'

import { useEffect, useState } from 'react'
import SelectorHorario from './SelectorHorario'
import SelectorVisita from './SelectorVisita'
import SelectVehiculo from './SelectVehiculo'
import SelectInmueble from './SelectInmueble'
import Gracias from './Gracias'
import { Camara, X, Chevron } from './iconos'
import { OBJETIVOS } from '@/lib/inmuebles'
import type { PublicWorkshop, PublicService, RubroServicio } from '@/lib/crm'
import { formatPrecio, formatDuracion } from '@/lib/formato'

/**
 * El popup de reserva, en 2 pasos.
 *
 * **No inventa ningún campo nuevo.** Es exactamente lo que pedía
 * `FormularioTurno.tsx` en una sola pantalla, reorganizado: 1) rubro,
 * servicio y datos del bien, 2) horario, datos personales y confirmar. Los
 * sub-componentes (`SelectVehiculo`, `SelectInmueble`, `SelectorHorario`,
 * `SelectorVisita`) son los mismos, sin tocar su lógica.
 *
 * Todos los campos quedan **siempre montados** en el DOM — los pasos se
 * muestran u ocultan con una clase (`hidden`), no con render condicional. Si
 * se desmontaran, un campo nativo sin estado de React (la dirección, el
 * nombre, el teléfono...) perdería lo que la persona ya escribió al volver
 * "Atrás". Por el mismo motivo sigue siendo un único `<form>`: el envío final
 * lee todo con `FormData`, igual que antes.
 */

type Estado = { tipo: 'listo' } | { tipo: 'enviando' } | { tipo: 'error'; msg: string }

const MAX_LADO = 1400

async function achicarFoto(file: File): Promise<{ base64: string; mime: string }> {
  const bitmap = await createImageBitmap(file)
  const escala = Math.min(1, MAX_LADO / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * escala)
  const h = Math.round(bitmap.height * escala)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo procesar la foto')
  ctx.drawImage(bitmap, 0, 0, w, h)

  const dataUri = canvas.toDataURL('image/jpeg', 0.82)
  return { base64: dataUri.split(',')[1] ?? '', mime: 'image/jpeg' }
}

const HORA_DE_FRANJA: Record<string, string> = { MANANA: '09:00', TARDE: '14:00' }

const PASOS = ['Servicio', 'Horario y datos']

export default function TurnoWizard({
  abierto,
  onCerrar,
  handle,
  taller,
  logoUrl,
  apiBase,
  serviceIdInicial,
  wa,
}: {
  abierto: boolean
  onCerrar: () => void
  handle: string
  taller: PublicWorkshop
  logoUrl: string | null
  /** `/api/turno` o `/api/turno/demo`. */
  apiBase: string
  /** Si se abrió desde una tarjeta de servicio puntual, ese servicio ya viene elegido. */
  serviceIdInicial?: string
  wa: string | null
}) {
  const autos = taller.services.filter((s) => s.category === 'AUTOMOTIVE')
  const inmuebles = taller.services.filter((s) => s.category === 'ARCHITECTURAL')
  const ambosRubros = taller.rubros.automotriz && taller.rubros.arquitectura

  const servicioInicial = taller.services.find((s) => s.id === serviceIdInicial)
  const rubroInicial: RubroServicio =
    servicioInicial?.category ??
    (!taller.rubros.automotriz && taller.rubros.arquitectura ? 'ARCHITECTURAL' : 'AUTOMOTIVE')

  const [paso, setPaso] = useState(1)
  const [rubro, setRubro] = useState<RubroServicio>(rubroInicial)
  const [serviceId, setServiceId] = useState(
    serviceIdInicial ?? (rubroInicial === 'ARCHITECTURAL' ? inmuebles[0]?.id : autos[0]?.id) ?? ''
  )
  const [estado, setEstado] = useState<Estado>({ tipo: 'listo' })
  const [enviado, setEnviado] = useState(false)
  const [inicio, setInicio] = useState('')
  const [vehiculo, setVehiculo] = useState('')
  const [inmueble, setInmueble] = useState('')
  const [errorBien, setErrorBien] = useState(false)
  const [foto, setFoto] = useState<{ base64: string; mime: string; preview: string } | null>(null)
  const [procesandoFoto, setProcesandoFoto] = useState(false)

  const esArquitectura = rubro === 'ARCHITECTURAL'
  const serviciosDelRubro = esArquitectura ? inmuebles : autos

  // Cada vez que se abre de nuevo, arranca limpio — si quedó en el paso 4 de
  // un pedido anterior, la próxima persona no tiene que verlo.
  useEffect(() => {
    if (!abierto) return
    setPaso(1)
    setEstado({ tipo: 'listo' })
    setEnviado(false)
  }, [abierto])

  // Cierra con Escape — mismo criterio que cualquier modal nativo.
  useEffect(() => {
    if (!abierto) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [abierto, onCerrar])

  if (!abierto) return null

  function elegirRubro(r: RubroServicio) {
    setRubro(r)
    const primero = (r === 'ARCHITECTURAL' ? inmuebles : autos)[0]
    setServiceId(primero?.id ?? '')
  }

  async function elegirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setProcesandoFoto(true)
    try {
      const { base64, mime } = await achicarFoto(file)
      setFoto({ base64, mime, preview: `data:${mime};base64,${base64}` })
    } catch {
      setEstado({ tipo: 'error', msg: 'No pudimos procesar esa foto. Probá con otra.' })
    } finally {
      setProcesandoFoto(false)
    }
  }

  function irA(destino: number) {
    // Un mínimo de sentido común al salir del paso 1 (donde vive el selector
    // de vehículo/inmueble): sin bien elegido no hay nada que presupuestar.
    // El resto de la validación —la misma de siempre— corre entera al
    // confirmar, no acá.
    if (destino > paso && paso === 1 && (esArquitectura ? !inmueble : !vehiculo)) {
      setErrorBien(true)
      setEstado({
        tipo: 'error',
        msg: esArquitectura ? 'Elegí qué tipo de inmueble es.' : 'Elegí el tipo de vehículo.',
      })
      return
    }
    setErrorBien(false)
    setEstado({ tipo: 'listo' })
    setPaso(destino)
  }

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)

    if (esArquitectura ? !inmueble : !vehiculo) {
      setPaso(1)
      setErrorBien(true)
      setEstado({
        tipo: 'error',
        msg: esArquitectura ? 'Elegí qué tipo de inmueble es.' : 'Elegí el tipo de vehículo.',
      })
      return
    }
    setErrorBien(false)

    let preferredAt: Date
    if (esArquitectura) {
      const dia = String(f.get('dia') ?? '')
      const franja = String(f.get('timeWindow') ?? 'MANANA')
      if (!dia) {
        setPaso(2)
        setEstado({ tipo: 'error', msg: 'Elegí qué día te viene bien.' })
        return
      }
      preferredAt = new Date(`${dia}T${HORA_DE_FRANJA[franja] ?? '09:00'}`)
    } else {
      const elegido = String(f.get('inicio') ?? '')
      if (elegido) {
        preferredAt = new Date(elegido)
      } else {
        const dia = String(f.get('dia') ?? '')
        const hora = String(f.get('hora') ?? '')
        if (!dia || !hora) {
          setPaso(2)
          setEstado({ tipo: 'error', msg: 'Elegí cuándo querés el turno.' })
          return
        }
        preferredAt = new Date(`${dia}T${hora}`)
      }
    }
    if (Number.isNaN(preferredAt.getTime())) {
      setPaso(2)
      setEstado({ tipo: 'error', msg: 'Esa fecha no es válida.' })
      return
    }

    if (esArquitectura && !String(f.get('siteAddress') ?? '').trim()) {
      setPaso(1)
      setEstado({ tipo: 'error', msg: 'Poné la dirección del inmueble.' })
      return
    }

    const polarizado = f.get('alreadyTinted')
    const vidrios = String(f.get('glassCount') ?? '').trim()
    const metros = String(f.get('approxM2') ?? '').trim()

    setEstado({ tipo: 'enviando' })
    try {
      const res = await fetch(`${apiBase}/${encodeURIComponent(handle)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: serviceId || null,
          clientName: f.get('clientName'),
          clientEmail: f.get('clientEmail'),
          clientPhone: f.get('clientPhone'),
          vehicleType: esArquitectura ? null : vehiculo,
          plate: esArquitectura ? null : f.get('plate') || null,
          propertyType: esArquitectura ? inmueble : null,
          glassCount: esArquitectura && vidrios ? Number(vidrios) : null,
          approxM2: esArquitectura && metros ? Number(metros) : null,
          goal: esArquitectura ? f.get('goal') || null : null,
          siteAddress: esArquitectura ? f.get('siteAddress') : null,
          timeWindow: esArquitectura ? f.get('timeWindow') : null,
          notes: f.get('notes') || null,
          alreadyTinted: polarizado === null ? null : polarizado === 'si',
          photo: foto?.base64 ?? null,
          photoMimeType: foto?.mime ?? null,
          preferredAt: preferredAt.toISOString(),
        }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setEstado({ tipo: 'error', msg: body.error ?? 'No pudimos enviar tu pedido.' })
        return
      }
      setEnviado(true)
    } catch {
      setEstado({ tipo: 'error', msg: 'Error de conexión. Probá de nuevo.' })
    }
  }

  const campo =
    'rounded-lg border border-[color:var(--color-linea)] bg-[color:var(--color-superficie)] p-2.5'
  const tituloBien = esArquitectura ? '¿Qué tipo de inmueble es?' : 'Tipo de vehículo'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      {/* El backdrop cierra al tocarlo. El panel de adentro corta el click para
          que tocar el formulario no cierre el modal. */}
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onCerrar}
        className="absolute inset-0 cursor-default"
      />
      <div
        role="dialog"
        aria-modal="true"
        // En celular, dos pasos con más campos cada uno piden más aire que
        // el modal angosto de antes — casi toda la pantalla en vez de un
        // 92vh que ya quedaba ajustado. En escritorio se queda como estaba.
        className="relative flex max-h-[95dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-[color:var(--color-fondo)] text-[color:var(--color-tinta)] shadow-2xl sm:max-h-[92vh] sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-[color:var(--color-linea)] px-5 py-4">
          <h2 className="text-base font-semibold">
            {enviado
              ? '¡Listo!'
              : esArquitectura
                ? 'Pedir una visita'
                : 'Agendar un turno'}
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-[color:var(--color-tenue)] hover:bg-[color:var(--color-superficie)]"
          >
            <X />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {enviado ? (
            <Gracias
              nombre={taller.name}
              logoUrl={logoUrl}
              wa={wa}
              visita={esArquitectura}
            />
          ) : (
            <>
              {/* Indicador de pasos */}
              <ol className="mb-5 flex items-center gap-1.5 text-xs text-[color:var(--color-tenue)]">
                {PASOS.map((t, i) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${
                        i + 1 === paso
                          ? 'bg-[color:var(--color-acento)] text-white'
                          : i + 1 < paso
                            ? 'bg-[color:var(--color-acento)]/20 text-[color:var(--color-acento)]'
                            : 'bg-[color:var(--color-linea)]'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className={i + 1 === paso ? 'font-medium text-[color:var(--color-tinta)]' : ''}>
                      {t}
                    </span>
                    {i < PASOS.length - 1 && <Chevron />}
                  </li>
                ))}
              </ol>

              <form onSubmit={enviar} className="flex flex-col gap-4">
                {/* ── Paso 1: rubro + servicio ─────────────────────────────── */}
                <div className={paso === 1 ? 'flex flex-col gap-4' : 'hidden'}>
                  {ambosRubros && (
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          { v: 'AUTOMOTIVE' as const, t: 'Mi vehículo' },
                          { v: 'ARCHITECTURAL' as const, t: 'Casa u oficina' },
                        ]
                      ).map((o) => (
                        <button
                          key={o.v}
                          type="button"
                          aria-pressed={rubro === o.v}
                          onClick={() => elegirRubro(o.v)}
                          className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                            rubro === o.v
                              ? 'border-[color:var(--color-acento)] bg-[color:var(--color-acento)]/10'
                              : 'border-[color:var(--color-linea)]'
                          }`}
                        >
                          {o.t}
                        </button>
                      ))}
                    </div>
                  )}

                  {serviciosDelRubro.length > 0 && (
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium">¿Qué necesitás?</span>
                      <select
                        value={serviceId}
                        onChange={(e) => setServiceId(e.target.value)}
                        className={campo}
                      >
                        {serviciosDelRubro.map((s: PublicService) => {
                          const precio = formatPrecio(s.priceFrom, s.currency)
                          const partes = [
                            s.name,
                            precio ? `desde ${precio}` : 'a consultar',
                            ...(s.category === 'ARCHITECTURAL' ? [] : [formatDuracion(s.durationMinutes)]),
                          ]
                          return (
                            <option key={s.id} value={s.id}>
                              {partes.join(' · ')}
                            </option>
                          )
                        })}
                      </select>
                    </label>
                  )}
                </div>

                {/* ── Sigue en el paso 1: datos del bien ──────────────────── */}
                <div className={paso === 1 ? 'flex flex-col gap-4' : 'hidden'}>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium">{tituloBien}</span>
                    {esArquitectura ? (
                      <SelectInmueble
                        name="propertyType"
                        valor={inmueble}
                        onCambio={(v) => {
                          setInmueble(v)
                          setErrorBien(false)
                        }}
                        error={errorBien}
                      />
                    ) : (
                      <SelectVehiculo
                        name="vehicleType"
                        valor={vehiculo}
                        onCambio={(v) => {
                          setVehiculo(v)
                          setErrorBien(false)
                        }}
                        error={errorBien}
                      />
                    )}
                  </div>

                  {esArquitectura ? (
                    <>
                      <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium">Dirección del inmueble</span>
                        <input
                          name="siteAddress"
                          required
                          maxLength={300}
                          placeholder="Av. Siempreviva 742, Springfield"
                          className={campo}
                        />
                        <span className="text-xs text-[color:var(--color-tenue)]">
                          Es adonde va el taller a medir.
                        </span>
                      </label>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="flex flex-col gap-1.5">
                          <span className="text-sm font-medium">
                            ¿Cuántos vidrios?{' '}
                            <span className="font-normal text-[color:var(--color-tenue)]">(opcional)</span>
                          </span>
                          <input
                            name="glassCount"
                            type="number"
                            min={1}
                            max={10000}
                            inputMode="numeric"
                            placeholder="12"
                            className={campo}
                          />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className="text-sm font-medium">
                            Metros cuadrados{' '}
                            <span className="font-normal text-[color:var(--color-tenue)]">(opcional)</span>
                          </span>
                          <input
                            name="approxM2"
                            type="number"
                            min={1}
                            step="0.5"
                            inputMode="decimal"
                            placeholder="35"
                            className={campo}
                          />
                        </label>
                      </div>

                      <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium">¿Para qué la querés?</span>
                        <select name="goal" defaultValue="" className={campo}>
                          <option value="">No estoy seguro</option>
                          {OBJETIVOS.map((o) => (
                            <option key={o.slug} value={o.slug}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </>
                  ) : (
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium">
                        Patente <span className="font-normal text-[color:var(--color-tenue)]">(opcional)</span>
                      </span>
                      <input name="plate" placeholder="AB 123 CD" className={`${campo} uppercase`} />
                    </label>
                  )}

                  <fieldset className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <legend className="mb-1.5 text-sm font-medium">
                      {esArquitectura ? '¿Ya tienen lámina puesta?' : '¿Actualmente está polarizado?'}
                    </legend>
                    {[
                      { v: 'si', t: 'Sí' },
                      { v: 'no', t: 'No' },
                    ].map((o) => (
                      <label key={o.v} className="inline-flex items-center gap-2 text-sm">
                        <input type="radio" name="alreadyTinted" value={o.v} className="size-4 accent-sky-500" />
                        {o.t}
                      </label>
                    ))}
                  </fieldset>
                </div>

                {/* ── Paso 2: horario ───────────────────────────────────────── */}
                <div className={paso === 2 ? 'flex flex-col gap-4' : 'hidden'}>
                  {esArquitectura ? (
                    <SelectorVisita />
                  ) : (
                    <SelectorHorario
                      handle={handle}
                      serviceId={serviceId || null}
                      valor={inicio}
                      onCambio={setInicio}
                      apiBase={apiBase}
                    />
                  )}
                </div>

                {/* ── Sigue en el paso 2: datos personales + confirmar ────── */}
                <div className={paso === 2 ? 'flex flex-col gap-4' : 'hidden'}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium">Tu nombre</span>
                      <input name="clientName" required minLength={2} className={campo} />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium">WhatsApp</span>
                      <input name="clientPhone" type="tel" required placeholder="11 2345 6789" className={campo} />
                    </label>
                  </div>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium">Email</span>
                    <input name="clientEmail" type="email" required className={campo} />
                    <span className="text-xs text-[color:var(--color-tenue)]">
                      Ahí te confirmamos {esArquitectura ? 'la visita' : 'el turno'} y podés cancelarlo sin
                      llamar.
                    </span>
                  </label>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium">
                      {esArquitectura ? 'Foto de los vidrios' : 'Foto del vehículo'}{' '}
                      <span className="font-normal text-[color:var(--color-tenue)]">(opcional)</span>
                    </span>
                    {foto ? (
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={foto.preview}
                          alt=""
                          className="h-20 w-28 rounded-lg border border-[color:var(--color-linea)] object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFoto(null)}
                          className="inline-flex items-center gap-1.5 text-sm text-[color:var(--color-tenue)] hover:text-[color:var(--color-tinta)]"
                        >
                          <X />
                          Quitar
                        </button>
                      </div>
                    ) : (
                      <label
                        className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[color:var(--color-linea)] p-3 text-sm text-[color:var(--color-tenue)] ${
                          procesandoFoto ? 'opacity-60' : ''
                        }`}
                      >
                        <Camara />
                        {procesandoFoto ? 'Procesando…' : 'Sacale una foto o subí una'}
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={elegirFoto}
                          disabled={procesandoFoto}
                        />
                      </label>
                    )}
                  </div>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium">
                      Algo más que quieras contarle{' '}
                      <span className="font-normal text-[color:var(--color-tenue)]">(opcional)</span>
                    </span>
                    <textarea name="notes" rows={2} maxLength={1000} className={campo} />
                  </label>
                </div>

                {estado.tipo === 'error' && (
                  <p className="text-sm text-red-500" role="alert">
                    {estado.msg}
                  </p>
                )}

                {/* Nav: "Siguiente" es un botón normal en el paso 1; el
                    submit real solo vive en el paso 2. */}
                <div className="mt-1 flex items-center justify-between gap-3">
                  {paso > 1 ? (
                    <button
                      type="button"
                      onClick={() => irA(paso - 1)}
                      className="rounded-xl border border-[color:var(--color-linea)] px-5 py-2.5 text-sm font-medium"
                    >
                      Atrás
                    </button>
                  ) : (
                    <span />
                  )}

                  {paso < 2 ? (
                    <button
                      type="button"
                      onClick={() => irA(paso + 1)}
                      className="rounded-xl bg-[color:var(--color-acento)] px-5 py-2.5 text-sm font-medium text-white"
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={estado.tipo === 'enviando'}
                      className="rounded-xl bg-[color:var(--color-acento)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                    >
                      {estado.tipo === 'enviando'
                        ? 'Enviando…'
                        : esArquitectura
                          ? 'Confirmar visita'
                          : 'Confirmar turno'}
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
