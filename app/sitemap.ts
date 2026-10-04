import type { MetadataRoute } from 'next'
import { listTalleresPublicados } from '@/lib/crm'
import { SITIO } from '@/lib/seo'

/**
 * polariz.ar/sitemap.xml: la lista de páginas que le pedimos a Google que
 * indexe. Solo las de los talleres publicados — el sitio de comunidad todavía
 * es un esqueleto y va con noindex (ver `app/(sitio)/layout.tsx`), y las de
 * demostración no se indexan nunca.
 *
 * Se regenera cada hora: un taller que publica hoy entra al sitemap en el día.
 */
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const talleres = await listTalleresPublicados()
  return talleres.map((t) => ({
    url: `${SITIO}/${t.handle}`,
    lastModified: new Date(t.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))
}
