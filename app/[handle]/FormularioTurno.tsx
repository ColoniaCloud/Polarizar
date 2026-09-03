'use client'

import { useState } from 'react'
import SelectorHorario from './SelectorHorario'
import { TIPOS_VEHICULO } from '@/lib/vehiculos'
import type { PublicService } from '@/lib/crm'
import { formatPrecio, formatDuracion } from '@/lib/formato'

/**
 * El formulario con el que el cliente pide turno.
 *
 * **Pide poco a propósito.** Cada campo de más es gente que abandona: lo mínimo
 * para que el taller pueda llamar y saber de qué se trata es nombre, teléfono,
 * servicio y cuándo. El mail es opcional pero se pide igual, porque es lo único
 * que le permite al cliente cancelar sin llamar.
 *
 * No promete un turno: dice «pedir». La confirmación la da el taller, y la
 * pantalla de después lo repite — prometer un horario que el taller todavía no
 * miró es la forma más rápida de que alguien se presente y no lo atiendan.
 */

type Estado = { tipo: 'listo' } | { tipo: 'enviando' } | { tipo: 'error'; msg: string }

export default function FormularioTurno({
  handle,
  services,
  onListo,
}: {
  handle: string
  services: PublicService[]
  onListo: () => void
}) {
  const [estado, setEstado] = useState<Estado>({ tipo: 'listo' })
  // El servicio vive en estado y no solo en el form: cambiarlo cambia los
  // huecos disponibles, porque la duracion manda.
  const [serviceId, setServiceId] = useState<string>(services[0]?.id ?? '')
  const [inicio, setInicio] = useState('')

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)

    // Dos caminos: el hueco elegido de la agenda del taller, o —cuando no se
    // pudo ver la agenda— el dia y hora que propone el cliente.
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
      // Se arma en la zona del navegador y se manda con offset: el CRM guarda
      // el instante, no un texto. Sin offset, un turno de las 9 en Argentina se
      // guardaria como las 9 UTC, o sea las 6 de la mañana.
      preferredAt = new Date(`${dia}T${hora}`)
    }
    if (Number.isNaN(preferredAt.getTime())) {
      setEstado({ tipo: 'error', msg: 'Esa fecha no es válida.' })
      return
    }

    setEstado({ tipo: 'enviando' })
    try {
      const res = await fetch(`/api/turno/${encodeURIComponent(handle)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: f.get('serviceId') || null,
          clientName: f.get('clientName'),
          clientEmail: f.get('clientEmail') || null,
          clientPhone: f.get('clientPhone'),
          vehicleType: f.get('vehicleType') || null,
          plate: f.get('plate') || null,
          notes: f.get('notes') || null,
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

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      {services.length > 0 && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">¿Qué necesitás?</span>
          <select
            name="serviceId"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="rounded-lg border border-[color:var(--color-linea)] p-2.5"
          >
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

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Tu nombre</span>
          <input
            name="clientName"
            required
            minLength={2}
            className="rounded-lg border border-[color:var(--color-linea)] p-2.5"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Teléfono</span>
          <input
            name="clientPhone"
            type="tel"
            required
            placeholder="11 2345 6789"
            className="rounded-lg border border-[color:var(--color-linea)] p-2.5"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">
          Email <span className="font-normal text-[color:var(--color-tenue)]">(opcional)</span>
        </span>
        <input
          name="clientEmail"
          type="email"
          className="rounded-lg border border-[color:var(--color-linea)] p-2.5"
        />
        <span className="text-xs text-[color:var(--color-tenue)]">
          Si lo dejás, te mandamos el aviso y podés cancelar sin llamar.
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">
            Vehículo <span className="font-normal text-[color:var(--color-tenue)]">(opcional)</span>
          </span>
          <select
            name="vehicleType"
            defaultValue=""
            className="rounded-lg border border-[color:var(--color-linea)] p-2.5"
          >
            <option value="">Elegí uno</option>
            {TIPOS_VEHICULO.map((v) => (
              <option key={v.slug} value={v.slug}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">
            Patente <span className="font-normal text-[color:var(--color-tenue)]">(opcional)</span>
          </span>
          <input
            name="plate"
            placeholder="AB 123 CD"
            className="rounded-lg border border-[color:var(--color-linea)] p-2.5 uppercase"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">
          Algo más que quieras contarle{' '}
          <span className="font-normal text-[color:var(--color-tenue)]">(opcional)</span>
        </span>
        <textarea
          name="notes"
          rows={3}
          maxLength={1000}
          className="rounded-lg border border-[color:var(--color-linea)] p-2.5"
        />
      </label>

      {estado.tipo === 'error' && (
        <p className="text-sm text-red-600" role="alert">
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
