'use client'

import { useState } from 'react'
import SelectorHorario from './SelectorHorario'
import SelectVehiculo from './SelectVehiculo'
import { Camara, X } from './iconos'
import type { PublicService } from '@/lib/crm'
import { formatPrecio, formatDuracion } from '@/lib/formato'

/**
 * El formulario con el que el cliente pide turno.
 *
 * **Qué es obligatorio y por qué.** Nombre, teléfono, email, vehículo y cuándo.
 * El email pasó a obligatorio porque es lo único que permite avisarle y que
 * pueda cancelar sin llamar; el tipo de vehículo, porque cambia el precio y el
 * tiempo, y preguntarlo después por teléfono es la llamada que este formulario
 * tendría que evitar.
 *
 * La patente y la foto siguen opcionales: son cómodas para el taller pero no
 * imprescindibles, y cada campo obligatorio de más es gente que abandona.
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

export default function FormularioTurno({
  handle,
  services,
  serviceId,
  onServiceId,
  onListo,
}: {
  handle: string
  services: PublicService[]
  /** Lo controla el padre: la lista de servicios de arriba también lo cambia. */
  serviceId: string
  onServiceId: (id: string) => void
  onListo: () => void
}) {
  const [estado, setEstado] = useState<Estado>({ tipo: 'listo' })
  const [inicio, setInicio] = useState('')
  const [vehiculo, setVehiculo] = useState('')
  const [errorVehiculo, setErrorVehiculo] = useState(false)
  const [foto, setFoto] = useState<{ base64: string; mime: string; preview: string } | null>(null)
  const [procesandoFoto, setProcesandoFoto] = useState(false)

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

    if (!vehiculo) {
      setErrorVehiculo(true)
      setEstado({ tipo: 'error', msg: 'Elegí el tipo de vehículo.' })
      return
    }
    setErrorVehiculo(false)

    // Dos caminos: el hueco elegido de la agenda del taller, o —cuando no se
    // pudo ver la agenda— el día y hora que propone el cliente.
    const elegido = String(f.get('inicio') ?? '')
    let preferredAt: Date
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
    if (Number.isNaN(preferredAt.getTime())) {
      setEstado({ tipo: 'error', msg: 'Esa fecha no es válida.' })
      return
    }

    const polarizado = f.get('alreadyTinted')

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
          vehicleType: vehiculo,
          plate: f.get('plate') || null,
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
              return (
                <option key={s.id} value={s.id}>
                  {s.name} · {precio ? `desde ${precio}` : 'a consultar'} ·{' '}
                  {formatDuracion(s.durationMinutes)}
                </option>
              )
            })}
          </select>
        </label>
      )}

      <SelectorHorario
        handle={handle}
        serviceId={serviceId || null}
        valor={inicio}
        onCambio={setInicio}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Tipo de vehículo</span>
        <SelectVehiculo
          name="vehicleType"
          valor={vehiculo}
          onCambio={(v) => {
            setVehiculo(v)
            setErrorVehiculo(false)
          }}
          error={errorVehiculo}
        />
      </div>

      <fieldset className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <legend className="mb-1.5 text-sm font-medium">¿Actualmente está polarizado?</legend>
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
            Ahí te confirmamos el turno y podés cancelarlo sin llamar.
          </span>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">
            Patente <span className="font-normal text-[color:var(--color-tenue)]">(opcional)</span>
          </span>
          <input name="plate" placeholder="AB 123 CD" className={`${campo} uppercase`} />
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">
          Foto del vehículo{' '}
          <span className="font-normal text-[color:var(--color-tenue)]">(opcional)</span>
        </span>
        {foto ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={foto.preview}
              alt="Tu vehículo"
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
        {estado.tipo === 'enviando' ? 'Enviando…' : 'Pedir turno'}
      </button>

      <p className="text-center text-xs text-[color:var(--color-tenue)]">
        El taller confirma el turno. Todavía no está reservado.
      </p>
    </form>
  )
}
