import type { Metadata } from 'next'
import { cancelarPedido, crmConfigurado } from '@/lib/crm'

export const metadata: Metadata = { title: 'Cancelar tu turno' }
export const dynamic = 'force-dynamic'

/**
 * Cancelar un pedido desde el link del mail.
 *
 * La cancelación es un POST detrás de un botón y no algo que pase con solo
 * abrir el link: los clientes de correo y los antivirus visitan los links de
 * los mails para escanearlos, y con un GET que cancela, el turno se caería solo
 * antes de que la persona lea el mensaje.
 */
export default async function CancelarPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ hecho?: string }>
}) {
  const { token } = await params
  const { hecho } = await searchParams

  async function cancelar() {
    'use server'
    if (!crmConfigurado()) return
    await cancelarPedido(token)
  }

  return (
    <main className="mx-auto w-full max-w-md px-5 py-16 text-center text-[color:var(--color-tinta)]">
      {hecho ? (
        <>
          <h1 className="text-2xl font-semibold">Listo</h1>
          <p className="mt-3 text-sm text-[color:var(--color-tenue)]">
            Si tu pedido todavía estaba sin responder, quedó cancelado y el taller no te va a
            esperar.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold">¿Cancelás tu pedido de turno?</h1>
          <p className="mt-3 text-sm text-[color:var(--color-tenue)]">
            El taller va a dejar de esperarte. Si ya te confirmaron, mejor llamalos.
          </p>
          <form
            action={async () => {
              'use server'
              await cancelar()
              const { redirect } = await import('next/navigation')
              redirect(`/turno/cancelar/${token}?hecho=1`)
            }}
          >
            <button
              type="submit"
              className="mt-6 rounded-xl border border-[color:var(--color-linea)] px-5 py-3 font-medium"
            >
              Sí, cancelar mi pedido
            </button>
          </form>
        </>
      )}
    </main>
  )
}
