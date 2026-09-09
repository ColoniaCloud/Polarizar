import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';

/**
 * Montserrat, para la página pública del taller.
 *
 * Se carga acá porque el layout raíz es el único que envuelve tanto
 * `/[handle]` como `/demo/[handle]`, pero **no se aplica al documento**: se
 * expone como variable y la usa la clase `.tipografia-taller`. El sitio de
 * comunidad conserva su tipografía de sistema — cambiarla no es lo que se
 * pidió, y se vería en páginas que nadie revisó.
 *
 * `display: 'swap'` para que el texto se lea mientras baja la fuente: esta
 * página se abre desde un WhatsApp, muchas veces con mala señal.
 */
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

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
    <html lang='es' className={montserrat.variable}>
      <body>{children}</body>
    </html>
  );
}
