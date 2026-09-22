type HeroSlide = {
  image: string
  alt?: string
}

export default function HeroTaller({
  slides,
  nombre,
  direccion,
  horarioTexto,
  abierto,
  onAgendar,
  onWhatsApp,
}: {
  slides: HeroSlide[]
  nombre: string
  direccion: string
  horarioTexto: string
  abierto: boolean
  onAgendar: () => void
  onWhatsApp: () => void
}) {
  if (!slides.length) return null

  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-6">
      <section className="relative -mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-black shadow-[0_25px_60px_rgba(0,0,0,0.22)] md:-mt-6">
        <div className="relative h-[40vh] md:h-[52vh]">
          <div className="absolute inset-0 overflow-hidden">
            {slides.map((slide, index) => (
              <div
                key={`${slide.image}-${index}`}
                className="absolute inset-0 transition-transform duration-700 ease-out"
                style={{
                  transform: `translateX(${index * 100}%)`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.image}
                  alt={slide.alt ?? nombre}
                  className="h-full w-full object-cover scale-[1.08]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.64)_0%,rgba(0,0,0,0.18)_42%,rgba(0,0,0,0.2)_100%)]" />
              </div>
            ))}
          </div>

          <div className="absolute inset-0 flex items-end">
            <div className="w-full p-5 pb-6 md:p-8 md:pb-7">
              <div className="max-w-[800px] text-white">
                <h1 className="animate-[fadeInUp_0.7s_ease-out] text-3xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-4xl md:text-5xl lg:text-[4.2rem]">
                  {nombre.split(' ').map((word, index) => (
                    <span
                      key={`${word}-${index}`}
                      className="mr-2 inline-block opacity-0 animate-[heroWordIn_0.55s_ease-out_forwards]"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {word}
                    </span>
                  ))}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/90 md:text-sm">
                  <span className="animate-[fadeInUp_0.7s_ease-out_0.2s_forwards] opacity-0">
                    {direccion}
                  </span>
                  <span className="opacity-60">•</span>
                  <span className="animate-[fadeInUp_0.7s_ease-out_0.25s_forwards] opacity-0">
                    {horarioTexto}
                  </span>
                  <span className="rounded-full border border-white/30 bg-white/10 px-2 py-0.5 text-[10px] font-medium tracking-[0.08em] text-white/90 uppercase md:text-[11px]">
                    {abierto ? 'Abierto ahora' : 'Cerrado'}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3 animate-[fadeInUp_0.7s_ease-out_0.35s_forwards] opacity-0">
                  <button
                    type="button"
                    onClick={onAgendar}
                    className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-acento)] px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] md:px-7 md:py-3.5 md:text-base"
                  >
                    Reservar turno
                  </button>

                  <button
                    type="button"
                    onClick={onWhatsApp}
                    className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-transform hover:scale-[1.02] md:px-6 md:py-3.5 md:text-base"
                  >
                    <span className="md:hidden">WhatsApp</span>
                    <span className="hidden md:inline">Whatsapp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={`${slide.image}-dot-${index}`}
                type="button"
                aria-label={`Ir a la imagen ${index + 1}`}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  index === 0 ? 'w-7 bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
