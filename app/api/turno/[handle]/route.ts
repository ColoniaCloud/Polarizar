import { NextRequest, NextResponse } from 'next/server'
import { crearPedidoDeTurno, CrmError, crmConfigurado } from '@/lib/crm'

/**
 * El puente por donde pasa el pedido de turno.
 *
 * Existe para que **la api key no salga del servidor**. Si el formulario le
 * pegara directo al CRM, la clave tendría que viajar al navegador y cualquiera
 * podría usarla para crear pedidos en cualquier taller.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  if (!crmConfigurado()) {
    return NextResponse.json(
      { error: 'Los turnos todavía no están disponibles. Llamá al taller.' },
      { status: 503 }
    )
  }

  const { handle } = await params
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  try {
    return NextResponse.json(await crearPedidoDeTurno(handle.toLowerCase(), body), {
      status: 201,
    })
  } catch (err) {
    if (err instanceof CrmError) {
      // El mensaje del CRM ya viene en castellano y pensado para mostrar.
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: 'No pudimos enviar tu pedido' }, { status: 502 })
  }
}
