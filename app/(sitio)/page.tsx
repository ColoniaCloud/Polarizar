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
      className="fixed inset-0 z-[1001] flex items-center justify-center bg-black"
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
    </main>
  );
}
