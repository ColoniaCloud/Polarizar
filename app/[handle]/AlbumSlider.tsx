'use client'

import { useState } from 'react'
import { Chevron } from './iconos'

/**
 * El álbum de fotos del taller: una foto grande a la vez, al ancho de la
 * columna, con las miniaturas de las demás y las flechas superpuestas sobre
 * un degradé abajo. No una fila de miniaturas chicas (eso era el carrusel de
 * antes) — acá la foto es la protagonista.
 *
 * No se dibuja nada si el taller no subió fotos: `LandingTaller.tsx` ya
 * decide eso antes de montar este componente.
 */
export default function AlbumSlider({ fotos }: { fotos: string[] }) {
  const [indice, setIndice] = useState(0)
  const hayVarias = fotos.length > 1

  function ir(i: number) {
    setIndice((i + fotos.length) % fotos.length)
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-[color:var(--color-linea)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={fotos[indice]} alt="" className="aspect-[4/3] w-full object-cover" />

      {hayVarias && (
        <>
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={() => ir(indice - 1)}
            className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
          >
            <Chevron className="rotate-90" />
          </button>
          <button
            type="button"
            aria-label="Foto siguiente"
            onClick={() => ir(indice + 1)}
            className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
          >
            <Chevron className="-rotate-90" />
          </button>

          {/* El degradé y las miniaturas van juntos: con una sola foto no hay
              nada para elegir, así que tampoco hace falta oscurecerle la
              base a la imagen. */}
          <div className="absolute inset-x-0 bottom-0 flex gap-1.5 overflow-x-auto bg-gradient-to-t from-black/70 via-black/30 to-transparent px-2 pt-8 pb-2">
            {fotos.map((url, i) => (
              <button
                key={url}
                type="button"
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === indice}
                onClick={() => setIndice(i)}
                className={`h-10 w-14 shrink-0 overflow-hidden rounded-md border-2 transition-opacity [scroll-snap-align:start] ${
                  i === indice ? 'border-white opacity-100' : 'border-transparent opacity-60 hover:opacity-85'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
