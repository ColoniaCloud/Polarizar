import { NextRequest, NextResponse } from 'next/server'
import { getHuecos, crmConfigurado } from '@/lib/crm'

/** Los horarios libres, por acá para que la api key no salga del servidor. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  if (!crmConfigurado()) return NextResponse.json({ dias: [] })

  const { handle } = await params
  try {
    const dias = await getHuecos(
      handle.toLowerCase(),
      request.nextUrl.searchParams.get('serviceId')
    )
    return NextResponse.json({ dias })
  } catch {
    // Lista vacía y no un error: la pantalla cae al modo «proponé vos», que
    // sigue funcionando. Un taller sin horarios es peor que uno sin agenda.
    return NextResponse.json({ dias: [] })
  }
}
