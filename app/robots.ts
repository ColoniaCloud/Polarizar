import type { MetadataRoute } from 'next'
import { SITIO } from '@/lib/seo'

/**
 * polariz.ar/robots.txt. Deja pasar todo salvo lo que no es para buscadores:
 * los talleres de demostración, los paneles con cuenta, la API, los links de
 * cancelación de turnos (llevan un token) y la vista previa interna.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/demo/', '/dashboard', '/mi-cuenta', '/api/', '/turno/', '/vista-previa-tmp'],
    },
    sitemap: `${SITIO}/sitemap.xml`,
    host: SITIO,
  }
}
