import { NextRequest, NextResponse } from 'next/server'
import { crearPedidoDeTurno, CrmError, crmConfigurado } from '@/lib/crm'

/**
 * Pedido de turno contra un taller de demostración.
 *
 * Mismo puente que el real —la api key no sale del servidor— apuntando al
 * espejo `/api/public/demo/` del CRM. Del otro lado corre exactamente el mismo
 * handler contra la base de demo, así que las validaciones son las mismas: una
 * demo que valida menos que el producto deja de demostrar el producto.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  if (!crmConfigurado()) {
    return NextResponse.json({ error: 'La demostración no está disponible.' }, { status: 503 })
  }

  const { handle } = await params
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  try {
    return NextResponse.json(await crearPedidoDeTurno(handle.toLowerCase(), body, true), {
      status: 201,
    })
  } catch (err) {
    if (err instanceof CrmError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: 'No pudimos enviar tu pedido' }, { status: 502 })
  }
}
