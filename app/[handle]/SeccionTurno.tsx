'use client'

import { useState } from 'react'
import FormularioTurno from './FormularioTurno'
import type { PublicService } from '@/lib/crm'

/**
 * Envuelve el formulario para poder mostrar el acuse en su lugar.
 *
 * El acuse reemplaza al formulario en vez de navegar a otra página: la persona
 * acaba de escribir sus datos y mandarla a otra pantalla la deja sin contexto
 * de qué pidió. Además, si vuelve atrás, no reenvía nada.
 */
export default function SeccionTurno({
  handle,
  services,
  telefono,
}: {
  handle: string
  services: PublicService[]
  telefono: string | null
}) {
  const [enviado, setEnviado] = useState(false)

  if (enviado) {
    return (
      <div className="rounded-xl border border-[color:var(--color-linea)] bg-[color:var(--color-acento)]/5 p-6 text-center">
        <p className="text-lg font-semibold">Tu pedido salió</p>
        <p className="mt-2 text-sm text-[color:var(--color-tenue)]">
          El taller lo va a revisar y te contacta para confirmarlo. Si dejaste tu email, ahí te
          llega el aviso.
        </p>
        {telefono && (
          <p className="mt-4 text-sm">
            ¿Es urgente?{' '}
            <a href={`tel:${telefono.replace(/\s/g, '')}`} className="underline">
              Llamalos al {telefono}
            </a>
          </p>
        )}
      </div>
    )
  }

  return <FormularioTurno handle={handle} services={services} onListo={() => setEnviado(true)} />
}
