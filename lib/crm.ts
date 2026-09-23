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

/** `true` cuando este sitio tiene con qué hablarle al CRM. */
export function crmConfigurado(): boolean {
  return Boolean(process.env.CRM_BASE_URL && process.env.CRM_PUBLIC_SITE_API_KEY)
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
  // equivocado. Quien llama sin haber chequeado `crmConfigurado()` se entera.
  if (!k) throw new Error('Falta CRM_PUBLIC_SITE_API_KEY')
  return k
}

/**
 * El prefijo de los endpoints públicos del CRM.
 *
 * El portal de demostración corre el mismo código contra otra base, y del lado
 * del CRM eso son cinco rutas espejo bajo `/api/public/demo/`. Acá se elige el
 * prefijo y nada más: los caminos, los parámetros y las respuestas son
 * idénticos, porque del otro lado es literalmente el mismo handler.
 */
export function prefijoPublico(demo: boolean): string {
  return demo ? '/api/public/demo' : '/api/public'
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

/** Sobre qué se aplica un servicio. PPF no está: va sobre autos. */
export type RubroServicio = 'AUTOMOTIVE' | 'ARCHITECTURAL'

export interface PublicService {
  id: string
  name: string
  description: string | null
  /**
   * Lo que decide **qué campos muestra el formulario** cuando el visitante
   * elige este servicio: un auto tiene tipo y patente, un inmueble tiene
   * dirección y metros.
   *
   * Va por servicio y no por taller para que uno que hace las dos cosas tenga
   * las dos formas en la misma página, sin obligar al visitante a declarar qué
   * es antes de tener contexto.
   */
  category: RubroServicio
  /** `null` = el taller eligió no publicar precio. */
  priceFrom: number | null
  currency: 'ARS' | 'USD'
  durationMinutes: number
}

export interface PublicWorkshop {
  name: string
  /** Ruta **relativa al CRM**. Hay que anteponerle su base, no la de este sitio. */
  logoPath: string | null
  /**
   * Foto de fondo del hero de ancho completo. `null` = el taller todavía no
   * subió ninguna, y la landing se dibuja sin esa sección (mismo layout de
   * siempre). Ruta relativa al CRM, igual que `logoPath`.
   */
  heroPath: string | null
  /** Bajada corta que escribió el instalador. `null` = no completó nada. */
  description: string | null
  /**
   * La cara de quien atiende, para "Nosotros". Ruta relativa al CRM, igual
   * que `logoPath`. `null` = no subió ninguna, y ahí la sección va solo con
   * texto — nunca con un avatar genérico, que anuncia que no hay nadie.
   */
  teamPath?: string | null
  /** Quién es y qué hace. Una cara con nombre convence; una cara sola, no. */
  teamName?: string | null
  teamRole?: string | null
  /** Preset de color de fondo elegido — ver `lib/tema.ts`. */
  pageTheme: 'BLANCO' | 'GRIS_CLARO' | 'GRIS_OSCURO' | 'NEGRO'
  /** Preset de color de acento elegido — ver `lib/tema.ts`. */
  accentColor: 'AZUL' | 'VERDE' | 'VIOLETA' | 'ROJO' | 'NARANJA' | 'ROSA'
  /** Cada campo es `null` si no lo completó: no se muestra ese ícono. */
  social: {
    instagram: string | null
    facebook: string | null
    tiktok: string | null
    google: string | null
  }
  /**
   * El álbum, en el orden que eligió el taller. Vacío = sin fotos aún.
   *
   * **Acepta las dos formas a propósito.** El CRM pasó de mandar una lista de
   * rutas sueltas a mandar cada foto con su descripción, pero los dos repos
   * despliegan por separado: entre que sale esta versión y sale la del CRM,
   * `photos` sigue llegando como `string[]` y el álbum tiene que dibujarse
   * igual. Normalizalo siempre con `fotosDelAlbum()` en vez de leerlo crudo.
   */
  photos: (string | { path: string; description: string | null })[]
  /**
   * Sobre qué fondo se ve bien el logo, elegido por el taller.
   *
   * Define **solo el color de la cabecera**, no el de la página: hay logos de
   * trazo oscuro que desaparecen sobre negro y logos blancos que desaparecen
   * sobre blanco, y no hay forma confiable de deducirlo mirando los píxeles.
   */
  logoBackground: 'CLARO' | 'OSCURO'
  /**
   * Cómo trabaja el taller. Las tres tarjetas se muestran siempre; las que
   * están en `false` van apagadas — decir «esto no lo hago» también informa.
   */
  modalidades: { taller: boolean; domicilio: boolean; concesionarias: boolean }
  /**
   * Sobre qué trabaja el taller. Define la **forma** de la página: con uno solo
   * los servicios van en una lista plana; con los dos van agrupados en bloques
   * y aparece la tarjeta de visita.
   *
   * Al menos uno viene en `true`: el CRM no deja guardar los dos apagados.
   */
  rubros: { automotriz: boolean; arquitectura: boolean }
  /**
   * Año en que entró a la red de instaladores, o `null` si no se sabe.
   *
   * Opcionales los dos porque el CRM los empezó a mandar después: entre que
   * despliega esta versión y despliega la del CRM no vienen, y la página
   * tiene que dibujarse igual sin ellos.
   */
  instaladorDesde?: number | null
  /** Garantías activadas con lámina comprada por este taller. */
  garantiasRegistradas?: number
  address: string | null
  lat: number | null
  lng: number | null
  phone: string | null
  /** El mail que el taller eligió publicar, no el de su cuenta. */
  email: string | null
  hours: { opening: string | null; closing: string | null; days: string | null }
  services: PublicService[]
}

/** `null` si no existe o si el taller todavía no publicó su página. */
export async function getWorkshopByHandle(
  handle: string,
  demo = false
): Promise<PublicWorkshop | null> {
  // Sin configurar, no hay páginas de taller — pero el resto del sitio tiene
  // que seguir funcionando. Esta ruta es dinámica en la raíz, así que atrapa
  // **toda** URL que no matchee otra página: si acá se tirara, cada 404 del
  // sitio se convertiría en un 500. Se avisa por log, que es un problema de
  // configuración y no del visitante.
  if (!crmConfigurado()) {
    console.error(
      '[polarizar] Falta CRM_BASE_URL o CRM_PUBLIC_SITE_API_KEY: las páginas de taller no se pueden mostrar.'
    )
    return null
  }

  try {
    return await callCrm<PublicWorkshop>(
      `${prefijoPublico(demo)}/workshop/by-handle/${encodeURIComponent(handle)}`
    )
  } catch (err) {
    if (err instanceof CrmError && err.status === 404) return null
    throw err
  }
}

/**
 * Las imágenes que sirve el CRM no están en este sitio.
 *
 * En modo demo hay que reapuntar la ruta al espejo: el CRM devuelve el logo
 * como `/api/public/workshop/logo/<slug>` sin saber por cuál de las dos bases
 * se le preguntó, y ese slug solo existe en la de demo. Sin esta traducción el
 * logo del taller de demostración da 404 y la cabecera queda con el nombre en
 * texto — que es justo lo que la página tenía que mostrar bien.
 */
export function crmAssetUrl(path: string | null, demo = false): string | null {
  if (!path) return null
  const ruta = demo ? path.replace('/api/public/', '/api/public/demo/') : path
  return `${base()}${ruta}`
}

/** Una foto del álbum, ya lista para dibujar. */
export interface FotoDelAlbum {
  url: string
  /**
   * Lo que escribió el taller sobre la foto, o `null` si no escribió nada.
   *
   * Va al `alt` de la imagen. Cuando es `null` el `alt` queda vacío y no se
   * rellena con algo genérico: un lector de pantalla anunciando "foto 3, foto
   * 4, foto 5" molesta más que el silencio, y un texto inventado sobre una
   * foto que no vimos puede describir algo que no está.
   */
  descripcion: string | null
}

/**
 * Deja el álbum en una sola forma, venga como venga del CRM, y descarta las
 * fotos cuya URL no se pudo armar.
 */
export function fotosDelAlbum(photos: PublicWorkshop['photos'], demo = false): FotoDelAlbum[] {
  return photos
    .map((foto) => (typeof foto === 'string' ? { path: foto, description: null } : foto))
    .map((foto) => ({
      url: crmAssetUrl(foto.path, demo),
      descripcion: foto.description?.trim() || null,
    }))
    .filter((foto): foto is FotoDelAlbum => foto.url !== null)
}

// ─── Pedidos de turno ────────────────────────────────────────────────────────

export interface BookingInput {
  serviceId?: string | null
  alreadyTinted?: boolean | null
  /** Base64 sin el prefijo `data:`. */
  photo?: string | null
  photoMimeType?: string | null
  clientName: string
  clientEmail?: string | null
  clientPhone: string
  /** Automotriz. Obligatorio cuando el servicio elegido es de ese rubro. */
  vehicleType?: string | null
  plate?: string | null
  /** Arquitectura. `propertyType` y `siteAddress` son obligatorios ahí. */
  propertyType?: string | null
  glassCount?: number | null
  approxM2?: number | null
  goal?: string | null
  siteAddress?: string | null
  /** `MANANA` o `TARDE`. Solo en las visitas: reemplaza a la hora exacta. */
  timeWindow?: string | null
  notes?: string | null
  /** ISO con offset. El CRM rechaza el pasado y lo que esté a más de un año. */
  preferredAt: string
}

async function postCrm<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${base()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key() },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => null)
    throw new CrmError(res.status, cuerpo?.error ?? `El CRM respondió ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function crearPedidoDeTurno(handle: string, datos: BookingInput, demo = false) {
  return postCrm<{ ok: true }>(
    `${prefijoPublico(demo)}/workshop/by-handle/${encodeURIComponent(handle)}/bookings`,
    datos
  )
}

/** `false` si el token no existe o el pedido ya fue respondido. */
export async function cancelarPedido(token: string, demo = false): Promise<boolean> {
  try {
    await postCrm(`${prefijoPublico(demo)}/booking/cancel/${encodeURIComponent(token)}`)
    return true
  } catch (err) {
    if (err instanceof CrmError && err.status === 404) return false
    throw err
  }
}

export interface Hueco {
  /** Instante exacto, ISO. */
  inicio: string
  /** "09:30" en hora del taller — ya viene calculada, no recalcularla acá. */
  hora: string
}

export interface DiaConHuecos {
  /** "2026-09-10" */
  fecha: string
  huecos: Hueco[]
}

/** Los horarios libres. `serviceId` cambia el resultado: la duración manda. */
export async function getHuecos(handle: string, serviceId?: string | null, demo = false) {
  const qs = serviceId ? `?serviceId=${encodeURIComponent(serviceId)}` : ''
  const r = await callCrm<{ dias: DiaConHuecos[] }>(
    `${prefijoPublico(demo)}/workshop/by-handle/${encodeURIComponent(handle)}/slots${qs}`
  )
  return r.dias
}
