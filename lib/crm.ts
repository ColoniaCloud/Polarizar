/**
 * El único punto por donde este sitio le habla al CRM.
 *
 * **La api key vive solo acá, en el servidor.** Nunca en el navegador, ni en
 * una variable `NEXT_PUBLIC_`: es la misma regla que rige en kristall-web, y la
 * razón es que esta key puede crear pedidos de turno en el CRM.
 *
 * La key es de tipo *sitio público*, distinta de las del Panel de Clientes:
 * puede leer talleres publicados y nada más. Si algún día hay que cortarle el
 * acceso a este sitio, se revoca sin dejar sin panel a kristallfilm.com.
 */

const TIMEOUT_MS = 8000

export class CrmError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
  }
}

function base(): string {
  const url = process.env.CRM_BASE_URL
  if (!url) throw new Error('Falta CRM_BASE_URL')
  return url.replace(/\/$/, '')
}

function key(): string {
  const k = process.env.CRM_PUBLIC_SITE_API_KEY
  // Se tira en vez de seguir sin la key: el CRM devolvería 401 y el error se
  // leería como «ese taller no existe», que manda a buscar el bug al lugar
  // equivocado.
  if (!k) throw new Error('Falta CRM_PUBLIC_SITE_API_KEY')
  return k
}

export async function callCrm<T>(path: string): Promise<T> {
  const res = await fetch(`${base()}${path}`, {
    headers: { 'x-api-key': key() },
    // Sin caché: los horarios y los servicios los cambia el taller cuando
    // quiere, y una página con precios viejos es peor que una página lenta.
    cache: 'no-store',
    // Sin timeout, un CRM colgado cuelga la página del taller hasta que corte
    // la plataforma.
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })

  if (!res.ok) {
    const cuerpo = await res.json().catch(() => null)
    throw new CrmError(res.status, cuerpo?.error ?? `El CRM respondió ${res.status}`)
  }
  return res.json() as Promise<T>
}

export interface PublicService {
  id: string
  name: string
  description: string | null
  /** `null` = el taller eligió no publicar precio. */
  priceFrom: number | null
  currency: 'ARS' | 'USD'
  durationMinutes: number
}

export interface PublicWorkshop {
  name: string
  /** Ruta **relativa al CRM**. Hay que anteponerle su base, no la de este sitio. */
  logoPath: string | null
  address: string | null
  lat: number | null
  lng: number | null
  phone: string | null
  hours: { opening: string | null; closing: string | null; days: string | null }
  services: PublicService[]
}

/** `null` si no existe o si el taller todavía no publicó su página. */
export async function getWorkshopByHandle(handle: string): Promise<PublicWorkshop | null> {
  try {
    return await callCrm<PublicWorkshop>(
      `/api/public/workshop/by-handle/${encodeURIComponent(handle)}`
    )
  } catch (err) {
    if (err instanceof CrmError && err.status === 404) return null
    throw err
  }
}

/** Las imágenes que sirve el CRM no están en este sitio. */
export function crmAssetUrl(path: string | null): string | null {
  if (!path) return null
  return `${base()}${path}`
}
