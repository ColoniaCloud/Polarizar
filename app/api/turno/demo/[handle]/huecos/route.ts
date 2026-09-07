import { NextRequest, NextResponse } from 'next/server'
import { getHuecos, crmConfigurado } from '@/lib/crm'

/** Los horarios libres de un taller de demostración. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  if (!crmConfigurado()) return NextResponse.json({ dias: [] })

  const { handle } = await params
  try {
    const dias = await getHuecos(
      handle.toLowerCase(),
      request.nextUrl.searchParams.get('serviceId'),
      true
    )
    return NextResponse.json({ dias })
  } catch {
    return NextResponse.json({ dias: [] })
  }
}
