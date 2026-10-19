import Link from 'next/link';

/**
 * Header del sitio de comunidad (`app/(sitio)/layout.tsx`): una cápsula negra
 * flotante con la marca y un solo botón al login del panel. Reemplaza al menú
 * viejo, que linkeaba a secciones que eran esqueletos.
 *
 * "POLARIZAR" va en Clash Display (`font-marca`), igual que la home.
 *
 * `sticky` + `z-[1000]`: la home es un `fixed` a pantalla completa con
 * `z-[1001]` y lo tapa a propósito — ya tiene su propio botón de acceso.
 *
 * Los `!` pisan `.sitio-legacy a` (globals.css), que pinta todo link de celeste
 * y lo subraya al hover.
 */
export default function Header() {
  return (
    <div className="sticky top-0 z-[1000] px-4 pt-4">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-full bg-black py-2.5 pl-6 pr-2.5 shadow-lg">
        <Link
          href="/"
          className="font-marca text-lg font-bold tracking-[0.02em] !text-white !no-underline sm:text-xl"
        >
          POLARIZAR
        </Link>
        <Link
          href="/mi-cuenta"
          className="rounded-full bg-white px-4 py-2 text-xs font-semibold !text-black !no-underline transition-colors hover:bg-white/85 sm:px-5 sm:text-sm"
        >
          Acceder al sistema
        </Link>
      </header>
    </div>
  );
}
