'use client'

import { FRANJAS } from '@/lib/inmuebles'

/**
 * Cuándo pasa el taller a medir.
 *
 * **No es el selector de horarios de automotriz, y eso es a propósito.** Un
 * polarizado ocupa una bahía de dos horas y por eso se elige un hueco exacto de
 * la agenda. Una visita a una casa no ocupa nada: el taller pasa, mira las
 * ventanas y presupuesta. Ofrecerle a alguien un «jueves 10:30» para eso sería
 * prometer una precisión que nadie va a cumplir, y la primera vez que el taller
 * llegue 11:15 el turno queda como incumplido cuando en realidad estuvo bien.
 *
 * Así que se piden las dos cosas que el taller de verdad puede sostener: el día
 * y si es a la mañana o a la tarde.
 *
 * Todo va en inputs nativos con `name`, así que el formulario los lee del
 * FormData sin depender del estado de React.
 */
export default function SelectorVisita() {
  // Desde mañana: una visita para hoy no le sirve a nadie, y el taller la ve
  // recién cuando abre el panel.
  const manana = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">¿Qué día te viene bien?</span>
          <input
            type="date"
            name="dia"
            min={manana}
            required
            className="rounded-lg border border-[color:var(--color-linea)] bg-[color:var(--color-superficie)] p-2.5"
          />
        </label>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-sm font-medium">¿En qué momento?</legend>
          <div className="flex gap-2">
            {FRANJAS.map((f, i) => (
              <label
                key={f.slug}
                className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-[color:var(--color-linea)] bg-[color:var(--color-superficie)] p-2.5 text-sm"
              >
                <input
                  type="radio"
                  name="timeWindow"
                  value={f.slug}
                  defaultChecked={i === 0}
                  className="size-4 accent-sky-500"
                />
                {f.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <p className="text-xs text-[color:var(--color-tenue)]">
        Es una visita para medir y presupuestar, no el día del trabajo. El taller te confirma la
        hora.
      </p>
    </div>
  )
}
