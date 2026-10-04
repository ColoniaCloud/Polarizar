import type { Metadata } from 'next';
import Navigation from '../components/Navigation';

/**
 * Fuera de Google por ahora: las secciones del sitio de comunidad son
 * esqueletos ("Sección X creada."), y las páginas vacías le bajan la nota al
 * dominio entero — que es el mismo en el que viven las páginas de los talleres.
 * `follow` sí, para no cortar los links. Cuando tengan contenido, sacar esto y
 * sumarlas a `app/sitemap.ts`.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

/** El sitio de comunidad: todo lo que no es la página pública de un taller. */
export default function SitioLayout({ children }: { children: React.ReactNode }) {
  return (
    // `sitio-legacy` acota los estilos viejos de globals.css a estas paginas.
    // Sin eso se filtraban a la pagina publica del taller y la rompian.
    <div className="sitio-legacy">
      <Navigation />
      {children}
    </div>
  );
}
