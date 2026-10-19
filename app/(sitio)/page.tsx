const PALABRA = 'POLARIZAR';

/**
 * Home como pantalla completa: fondo negro, "POLARIZAR" centrado en Clash
 * Display, entrando letra por letra.
 *
 * `fixed inset-0` en vez de `h-svh` en flujo normal: el `<Navigation />` de
 * `(sitio)/layout.tsx` es alto (en mobile se apila entero, sin colapsar a
 * hamburguesa) y si el hero fuera un bloque más después del nav, quedaba su
 * propio alto de una pantalla pero arrancando debajo del nav — o sea, para
 * verlo completo había que scrollear. Fijo y tapando todo el viewport, es
 * "una pantalla" de verdad en cualquier alto de nav. `z-[1001]` porque el
 * nav es `position: sticky` con `z-index: 1000` (Navigation.module.css) —
 * con un z-index menor, el nav le ganaba la mitad de arriba del hero. El
 * `style` inline pisa el `padding`/`max-width` que `.sitio-legacy main` le
 * pone a todas las páginas de este layout (ver globals.css) — solo para
 * esta página.
 *
 * La animación es puro CSS (`.letra-entrada`, en globals.css) para que
 * respete `prefers-reduced-motion` sin JS: mismo criterio que ya usa el
 * scroll suave del sitio.
 *
 * El `style` del `<h1>` también pisa reglas heredadas: `.sitio-legacy h1`
 * le pinta a todo `<h1>` de este layout un degradado oscuro recortado como
 * texto (`background-clip: text`), que le gana a `text-white` por
 * especificidad — sin este reset el texto queda casi negro sobre negro.
 */
export default function HomePage() {
  return (
    <main
      style={{ margin: 0, padding: 0, maxWidth: 'none' }}
      className="fixed inset-0 z-[1001] flex flex-col items-center justify-center bg-black px-4"
    >
      <h1
        aria-label={PALABRA}
        className="font-marca font-bold"
        style={{
          fontSize: 'clamp(2.5rem, 10vw, 8rem)',
          letterSpacing: '0.02em',
          margin: 0,
          color: '#ffffff',
          background: 'none',
          WebkitBackgroundClip: 'border-box',
          backgroundClip: 'border-box',
          WebkitTextFillColor: '#ffffff',
        }}
      >
        {PALABRA.split('').map((letra, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="letra-entrada inline-block"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {letra}
          </span>
        ))}
      </h1>

      {/* Entran después de la última letra (9 × 60 ms), con la misma animación. */}
      <div
        className="letra-entrada mt-10 flex flex-col items-center gap-3 sm:flex-row"
        style={{ animationDelay: `${PALABRA.length * 60 + 150}ms` }}
      >
        <a
          href="/mi-cuenta"
          className="w-56 rounded-md border border-white bg-white px-6 py-3 text-center text-sm font-semibold !text-black !no-underline transition-colors hover:bg-white/85"
        >
          Acceder al sistema
        </a>
        <a
          href="https://kristallfilm.com/es/contacto"
          className="w-56 rounded-md border border-white/40 px-6 py-3 text-center text-sm font-semibold !text-white !no-underline transition-colors hover:border-white hover:bg-white/10"
        >
          Quiero ser cliente
        </a>
      </div>

      <a
        href="https://kristallfilm.com"
        aria-label="Powered by Kristall Film"
        className="letra-entrada mt-8 flex items-center gap-2 text-xs !text-white/50 !no-underline transition-colors hover:!text-white/80"
        style={{ animationDelay: `${PALABRA.length * 60 + 300}ms` }}
      >
        Powered by
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/cat/logob.svg" alt="" className="h-4 w-auto opacity-80" />
      </a>
    </main>
  );
}
