import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Polarizar',
  description: 'Proyecto Next.js para Polarizar',
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
