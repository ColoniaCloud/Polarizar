/**
 * El álbum de fotos del taller, en un slider horizontal a mano (`scroll-snap`,
 * sin librería — ver la nota en `TiposCarousel.tsx`).
 *
 * No se dibuja nada si el taller no subió fotos: `LandingTaller.tsx` ya
 * decide eso antes de montar este componente.
 */
export default function AlbumSlider({ fotos }: { fotos: string[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {fotos.map((url, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={url}
          src={url}
          alt=""
          className="h-32 w-44 shrink-0 rounded-xl border border-[color:var(--color-linea)] object-cover [scroll-snap-align:start]"
          loading={i > 2 ? 'lazy' : undefined}
        />
      ))}
    </div>
  )
}
