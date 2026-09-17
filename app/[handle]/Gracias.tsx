/**
 * El acuse, al confirmar un pedido desde el wizard.
 *
 * Cierra con el logo del taller y no con un tilde genérico: la persona acaba
 * de confiarle sus datos a un negocio concreto, y ver su marca es lo que
 * confirma que llegó a donde quería. El WhatsApp queda a mano porque es la
 * duda típica de los cinco minutos siguientes.
 */
export default function Gracias({
  nombre,
  logoUrl,
  wa,
  visita,
}: {
  nombre: string
  logoUrl: string | null
  wa: string | null
  /** Si lo que se pidió fue una visita para medir y no un turno. */
  visita: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-xl border border-[color:var(--color-linea)] bg-[color:var(--color-superficie)] p-8 text-center">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={nombre} className="max-h-20 max-w-[14rem] object-contain" />
      ) : (
        <p className="text-xl font-semibold">{nombre}</p>
      )}
      <p className="max-w-sm text-[15px] leading-relaxed">
        Gracias por la confianza, en breve te confirmaremos {visita ? 'tu visita' : 'tu turno'}. Ante
        cualquier duda escribinos por WhatsApp.
      </p>
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl bg-[color:var(--color-acento)] px-5 py-2.5 text-sm font-medium text-white"
        >
          Escribir por WhatsApp
        </a>
      )}
    </div>
  )
}
