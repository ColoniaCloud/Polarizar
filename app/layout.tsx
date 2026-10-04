import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  // Base para que Next arme URLs absolutas (canonical, Open Graph) con el
  // dominio real y no con el del servidor que hizo el build.
  metadataBase: new URL('https://polariz.ar'),
  title: 'Polarizar',
  description: 'Talleres de polarizado e instaladores autorizados Kristall: pedí tu turno online.',
};

/**
 * Layout raíz: solo el documento.
 *
 * La navegación de Polarizar **no vive acá** a propósito. La página pública de
 * un taller la firma el taller, y la barra del sitio le competía la marca justo
 * donde no corresponde — además de mostrarle un botón «Dashboard» a un cliente
 * que solo quiere pedir un turno.
 *
 * El sitio de comunidad la sigue teniendo: está en `app/(sitio)/layout.tsx`, que
 * envuelve todo lo demás.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='es'>
      <body>{children}</body>
    </html>
  );
}
