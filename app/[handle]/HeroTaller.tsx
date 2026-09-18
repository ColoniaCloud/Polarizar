/**
 * El hero: solo la foto que subió el instalador, al ancho de contenido y con
 * esquinas redondeadas, 40vh fijo en cualquier tamaño de pantalla. Ya no
 * lleva texto encima (nombre, dirección, contacto, redes) — esa información
 * se mudó a la sección de "info y descripción" que sigue después, así que
 * tampoco hace falta el degradé oscuro que existía solo para que ese texto
 * se leyera sobre la foto.
 *
 * El botón de agendar flota exactamente sobre el borde inferior — mitad
 * adentro de la foto, mitad afuera — para que sea lo primero que se note
 * apenas se termina de ver la foto.
 *
 * Solo se dibuja cuando el taller tiene foto cargada — ver `LandingTaller.tsx`,
 * que decide entre esto y el layout de siempre.
 */
export default function HeroTaller({
  heroUrl,
  onAgendar,
}: {
  heroUrl: string
  /** Abre el mismo wizard que el resto de los botones "Agendar un turno". */
  onAgendar: () => void
}) {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-8 md:pt-10">
      <section className="relative h-[40vh] w-full overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      </section>

      {/* -mt-7/-mt-8 es la mitad de la altura del botón (h-14/h-16), no un
          número inventado: así queda centrado justo sobre el borde de abajo
          de la foto sin recurrir a position:absolute. */}
      <div className="relative z-10 flex justify-center">
        <button
          type="button"
          onClick={onAgendar}
          className="-mt-7 h-14 w-[85vw] rounded-full bg-[color:var(--color-acento)] text-base font-semibold text-white shadow-xl transition-transform hover:scale-[1.02] md:-mt-8 md:h-16 md:w-[65vw] md:text-lg"
        >
          Agendar un turno
        </button>
      </div>
    </div>
  )
}
