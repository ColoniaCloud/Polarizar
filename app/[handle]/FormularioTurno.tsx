'use client'

import { useState } from 'react'
import SelectorHorario from './SelectorHorario'
import SelectorVisita from './SelectorVisita'
import SelectVehiculo from './SelectVehiculo'
import SelectInmueble from './SelectInmueble'
import { Camara, X } from './iconos'
import { OBJETIVOS } from '@/lib/inmuebles'
import type { PublicService, RubroServicio } from '@/lib/crm'
import { formatPrecio, formatDuracion } from '@/lib/formato'

/**
 * El formulario con el que el cliente pide turno.
 *
 * ─── Dos formularios en uno ────────────────────────────────────────────────
 *
 * **Lo que se pregunta lo decide el servicio elegido, no el taller.** Un taller
 * que hace las dos cosas necesita las dos formas en la misma página, y obligar
 * al visitante a declarar «vengo por un auto» o «vengo por mi casa» antes de
 * ver nada sería pedirle que clasifique su problema antes de tener contexto.
 * Elige el servicio, que es lo que ya sabe, y el resto se acomoda.
 *
 * En **automotriz** se reserva un hueco de la agenda: el trabajo ocupa una
 * bahía por un tiempo conocido. En **arquitectura** se pide una visita para
 * medir, con día y franja — ver `SelectorVisita`.
 *
 * ─── Qué es obligatorio y por qué ──────────────────────────────────────────
 *
 * Siempre: nombre, teléfono, email y cuándo. El email porque es lo único que
 * permite avisarle y que pueda cancelar sin llamar.
 *
 * En automotriz, además el tipo de vehículo: cambia el precio y el tiempo, y
 * preguntarlo después por teléfono es la llamada que este formulario tendría
 * que evitar. En arquitectura, el tipo de inmueble y **la dirección**: sin
 * dirección no hay visita posible.
 *
 * Todo lo demás es opcional. Cada campo obligatorio de más es gente que
 * abandona, y el taller puede preguntar lo que falte cuando llame.
 *
 * No promete un turno: dice «pedir». La confirmación la da el taller.
 */

type Estado = { tipo: 'listo' } | { tipo: 'enviando' } | { tipo: 'error'; msg: string }

/** Lado máximo de la foto. Una foto de celular moderna son 4000px y varios MB. */
const MAX_LADO = 1400

/** Achica y recomprime en el navegador. Devuelve base64 sin el prefijo `data:`. */
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

  // JPEG y no PNG: es una foto, no un logo. Un PNG de una foto pesa varias veces
  // más, y acá el peso viaja adentro del pedido.
  const dataUri = canvas.toDataURL('image/jpeg', 0.82)
  return { base64: dataUri.split(',')[1] ?? '', mime: 'image/jpeg' }
}

/**
 * La hora con la que viaja una visita.
 *
 * El CRM guarda un instante, así que a la franja hay que darle una hora igual.
 * Se elige el principio de cada mitad del día laboral; lo que vale es
 * `timeWindow`, que viaja aparte y es lo que la bandeja del taller muestra.
 */
const HORA_DE_FRANJA: Record<string, string> = { MANANA: '09:00', TARDE: '14:00' }

export default function FormularioTurno({
  handle,
  services,
  serviceId,
  onServiceId,
  onListo,
  rubroPorDefecto,
}: {
  handle: string
  services: PublicService[]
  /** Lo controla el padre: la lista de servicios de arriba también lo cambia. */
  serviceId: string
  onServiceId: (id: string) => void
  onListo: () => void
  /**
   * Qué preguntar cuando el taller no cargó ningún servicio.
   *
   * Sin servicios no hay categoría de la que derivar la forma del formulario, y
   * hay que preguntar algo igual: se usa el rubro del taller. Con los dos
   * marcados y ningún servicio cargado se asume automotriz, que es lo que hace
   * la enorme mayoría.
   */
  rubroPorDefecto: RubroServicio
}) {
  const [estado, setEstado] = useState<Estado>({ tipo: 'listo' })
  const [inicio, setInicio] = useState('')
  const [vehiculo, setVehiculo] = useState('')
  const [inmueble, setInmueble] = useState('')
  const [errorBien, setErrorBien] = useState(false)
  const [foto, setFoto] = useState<{ base64: string; mime: string; preview: string } | null>(null)
  const [procesandoFoto, setProcesandoFoto] = useState(false)

  const servicio = services.find((s) => s.id === serviceId)
  const rubro: RubroServicio = servicio?.category ?? rubroPorDefecto
  const esArquitectura = rubro === 'ARCHITECTURAL'

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

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)

    // El bien sobre el que se trabaja: sin eso no se puede presupuestar nada.
    if (esArquitectura ? !inmueble : !vehiculo) {
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
      // Día + franja. La hora es de relleno: lo que vale es `timeWindow`.
      const dia = String(f.get('dia') ?? '')
      const franja = String(f.get('timeWindow') ?? 'MANANA')
      if (!dia) {
        setEstado({ tipo: 'error', msg: 'Elegí qué día te viene bien.' })
        return
      }
      preferredAt = new Date(`${dia}T${HORA_DE_FRANJA[franja] ?? '09:00'}`)
    } else {
      // Dos caminos: el hueco elegido de la agenda del taller, o —cuando no se
      // pudo ver la agenda— el día y hora que propone el cliente.
      const elegido = String(f.get('inicio') ?? '')
      if (elegido) {
        preferredAt = new Date(elegido)
      } else {
        const dia = String(f.get('dia') ?? '')
        const hora = String(f.get('hora') ?? '')
        if (!dia || !hora) {
          setEstado({ tipo: 'error', msg: 'Elegí cuándo querés el turno.' })
          return
        }
        // Se arma en la zona del navegador y viaja con offset: el CRM guarda el
        // instante, no un texto. Sin offset, las 9 en Argentina se guardarían como
        // las 9 UTC, o sea las 6 de la mañana.
        preferredAt = new Date(`${dia}T${hora}`)
      }
    }
    if (Number.isNaN(preferredAt.getTime())) {
      setEstado({ tipo: 'error', msg: 'Esa fecha no es válida.' })
      return
    }

    if (esArquitectura && !String(f.get('siteAddress') ?? '').trim()) {
      setEstado({ tipo: 'error', msg: 'Poné la dirección del inmueble.' })
      return
    }

    const polarizado = f.get('alreadyTinted')
    const vidrios = String(f.get('glassCount') ?? '').trim()
    const metros = String(f.get('approxM2') ?? '').trim()

    setEstado({ tipo: 'enviando' })
    try {
      const res = await fetch(`/api/turno/${encodeURIComponent(handle)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: serviceId || null,
          clientName: f.get('clientName'),
          clientEmail: f.get('clientEmail'),
          clientPhone: f.get('clientPhone'),
          // Cada rubro manda lo suyo. El CRM igual descarta lo que no
          // corresponde, mirando el servicio elegido y no lo que diga el body.
          vehicleType: esArquitectura ? null : vehiculo,
          plate: esArquitectura ? null : f.get('plate') || null,
          propertyType: esArquitectura ? inmueble : null,
          glassCount: esArquitectura && vidrios ? Number(vidrios) : null,
          approxM2: esArquitectura && metros ? Number(metros) : null,
          goal: esArquitectura ? f.get('goal') || null : null,
          siteAddress: esArquitectura ? f.get('siteAddress') : null,
          timeWindow: esArquitectura ? f.get('timeWindow') : null,
          notes: f.get('notes') || null,
          // `null` cuando no contestó: no es lo mismo que «no».
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
      onListo()
    } catch {
      setEstado({ tipo: 'error', msg: 'Error de conexión. Probá de nuevo.' })
    }
  }

  const campo =
    'rounded-lg border border-[color:var(--color-linea)] bg-[color:var(--color-superficie)] p-2.5'

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      {services.length > 0 && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">¿Qué necesitás?</span>
          <select value={serviceId} onChange={(e) => onServiceId(e.target.value)} className={campo}>
            {services.map((s) => {
              const precio = formatPrecio(s.priceFrom, s.currency)
              // La duracion es el turno que se reserva. En un servicio de
              // arquitectura no se reserva nada —se pide una visita para
              // medir—, asi que mostrarla seria prometer que el trabajo dura
              // eso.
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

      {esArquitectura ? (
        <SelectorVisita />
      ) : (
        <SelectorHorario
          handle={handle}
          serviceId={serviceId || null}
          valor={inicio}
          onCambio={setInicio}
        />
      )}

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">
          {esArquitectura ? '¿Qué tipo de inmueble es?' : 'Tipo de vehículo'}
        </span>
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

      {esArquitectura && (
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
              {/* Se pregunta la cuenta de vidrios antes que los metros porque es
                  lo que alguien puede contar parado en su living. Los metros los
                  sabe el taller cuando va a medir. */}
              <input
                name="glassCount"
                type="number"
                min={1}
                max={10000}
                inputMode="numeric"
                placeholder="12"
                className={campo}
              />
              <span className="text-xs text-[color:var(--color-tenue)]">
                Aproximado. Contá ventanas y ventanales.
              </span>
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
              <span className="text-xs text-[color:var(--color-tenue)]">
                Si no lo sabés, dejalo vacío.
              </span>
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">¿Para qué la querés?</span>
            {/* Cambia qué lámina se presupuesta: una de seguridad y una
                decorativa no se parecen ni en función ni en precio. */}
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
      )}

      <fieldset className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <legend className="mb-1.5 text-sm font-medium">
          {esArquitectura ? '¿Ya tienen lámina puesta?' : '¿Actualmente está polarizado?'}
        </legend>
        {/* Importa más de lo que parece: sacar lámina vieja puede duplicar el
            tiempo del trabajo, y saberlo antes de confirmar le evita al taller
            un turno que no le entra. */}
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

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Tu nombre</span>
          <input name="clientName" required minLength={2} className={campo} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Teléfono</span>
          <input
            name="clientPhone"
            type="tel"
            required
            placeholder="11 2345 6789"
            className={campo}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Email</span>
          <input name="clientEmail" type="email" required className={campo} />
          <span className="text-xs text-[color:var(--color-tenue)]">
            {esArquitectura
              ? 'Ahí te confirmamos la visita y podés cancelarla sin llamar.'
              : 'Ahí te confirmamos el turno y podés cancelarlo sin llamar.'}
          </span>
        </label>
        {!esArquitectura && (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">
              Patente <span className="font-normal text-[color:var(--color-tenue)]">(opcional)</span>
            </span>
            <input name="plate" placeholder="AB 123 CD" className={`${campo} uppercase`} />
          </label>
        )}
      </div>

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
              alt={esArquitectura ? 'Los vidrios' : 'Tu vehículo'}
              className="h-24 w-32 rounded-lg border border-[color:var(--color-linea)] object-cover"
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
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[color:var(--color-linea)] p-4 text-sm text-[color:var(--color-tenue)] ${
              procesandoFoto ? 'opacity-60' : ''
            }`}
          >
            <Camara />
            {procesandoFoto ? 'Procesando…' : 'Sacale una foto o subí una'}
            {/* `capture` abre la cámara directo en el teléfono, que es donde se
                va a completar esto casi siempre. */}
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
        <span className="text-xs text-[color:var(--color-tenue)]">
          Ayuda al taller a presupuestarte mejor. Se achica sola.
        </span>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">
          Algo más que quieras contarle{' '}
          <span className="font-normal text-[color:var(--color-tenue)]">(opcional)</span>
        </span>
        <textarea name="notes" rows={3} maxLength={1000} className={campo} />
      </label>

      {estado.tipo === 'error' && (
        <p className="text-sm text-red-400" role="alert">
          {estado.msg}
        </p>
      )}

      <button
        type="submit"
        disabled={estado.tipo === 'enviando'}
        className="rounded-xl bg-[color:var(--color-acento)] px-5 py-3 font-medium text-white disabled:opacity-60"
      >
        {estado.tipo === 'enviando'
          ? 'Enviando…'
          : esArquitectura
            ? 'Pedir una visita'
            : 'Pedir turno'}
      </button>

      <p className="text-center text-xs text-[color:var(--color-tenue)]">
        {esArquitectura
          ? 'El taller confirma la visita. Todavía no está agendada.'
          : 'El taller confirma el turno. Todavía no está reservado.'}
      </p>
    </form>
  )
}
