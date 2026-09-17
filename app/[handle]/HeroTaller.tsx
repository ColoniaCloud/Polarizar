/**
 * El hero de ancho completo: la foto que subió el instalador, con un degradé
 * negro (oscuro a la izquierda, casi transparente a la derecha) y encima el
 * nombre del taller con su descripción, en una columna del 40% del ancho en
 * escritorio.
 *
 * Solo se dibuja cuando el taller tiene foto cargada — ver `LandingTaller.tsx`,
 * que decide entre esto y el layout de siempre. Colores fijos (blanco, negro)
 * y no las variables de tema: el texto tiene que leerse sobre una foto
 * cualquiera, no sobre el fondo claro/oscuro de la página.
 */
export default function HeroTaller({
  heroUrl,
  nombre,
  subtitulo,
}: {
  heroUrl: string
  nombre: string
  subtitulo: string | null
}) {
  return (
    <section className="relative h-[60vh] max-h-[620px] min-h-[380px] w-full overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={heroUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />
      <div className="relative z-10 flex h-full items-center px-5 sm:px-8">
        <div className="w-full md:w-[40%]">
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {nombre}
          </h1>
          {subtitulo && <p className="mt-2 text-sm text-white/80">{subtitulo}</p>}
        </div>
      </div>
    </section>
  )
}
