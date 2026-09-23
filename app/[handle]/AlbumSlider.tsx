'use client'

import { useMemo, useState } from 'react'
import { Chevron } from './iconos'
import type { FotoDelAlbum } from '@/lib/crm'

/**
 * El álbum de trabajos, en dos filas que se cruzan.
 *
 * El `alt` de cada foto es la descripción que escribió el taller desde Mi
 * Taller. Si no escribió nada queda vacío, que para un lector de pantalla
 * significa "esto es decorativo, seguí" — mejor que anunciar "foto 3".
 */
export default function AlbumSlider({ fotos }: { fotos: FotoDelAlbum[] }) {
  const [indiceAbierto, setIndiceAbierto] = useState<number | null>(null)

  const filas = useMemo(() => {
    if (fotos.length === 0) return []
    const duplicadas = [...fotos, ...fotos]
    return [
      { items: duplicadas, direction: 'left' },
      { items: duplicadas, direction: 'right' },
    ]
  }, [fotos])

  if (fotos.length === 0) return null

  const abrirFoto = (index: number) => setIndiceAbierto(index)
  const cerrarFoto = () => setIndiceAbierto(null)
  const irFoto = (delta: number) => {
    if (indiceAbierto === null) return
    setIndiceAbierto((indiceAbierto + delta + fotos.length) % fotos.length)
  }

  return (
    <>
      <div className="space-y-4">
        {filas.map((fila, filaIndex) => (
          <div key={fila.direction} className="relative overflow-hidden py-2">
            {/* Los velos de los costados tapan la foto justo donde entra y sale
                de la fila. Van con el fondo de la página y no con el de una
                tarjeta: acá no hay tarjeta: la fila no tiene ni borde ni fondo
                propio, así que lo que hay detrás de la foto es la página. */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[color:var(--color-fondo)] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[color:var(--color-fondo)] to-transparent" />

            <div
              className="flex w-max gap-3 px-2"
              style={{
                animation: fila.direction === 'left' ? 'marquee-left 34s linear infinite' : 'marquee-right 34s linear infinite',
                willChange: 'transform',
              }}
            >
              {fila.items.map((foto, index) => (
                <button
                  key={`${fila.direction}-${index}-${foto.url}`}
                  type="button"
                  onClick={() => abrirFoto(index % fotos.length)}
                  className="group relative block h-40 w-56 shrink-0 overflow-hidden rounded-xl border border-[color:var(--color-linea)] bg-[color:var(--color-fondo)] transition-transform duration-200 hover:-translate-y-0.5 md:h-52 md:w-72"
                  aria-label={`Abrir foto ${index % fotos.length + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={foto.url}
                    alt={foto.descripcion ?? ''}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {indiceAbierto !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true">
          <div className="relative max-h-[90vh] w-full max-w-5xl">
            <button
              type="button"
              onClick={cerrarFoto}
              className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full bg-black/60 text-lg text-white backdrop-blur-sm hover:bg-black/80"
              aria-label="Cerrar lightbox"
            >
              ×
            </button>

            <button
              type="button"
              aria-label="Foto anterior"
              onClick={() => irFoto(-1)}
              className="absolute left-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <Chevron className="rotate-90" />
            </button>

            <button
              type="button"
              aria-label="Foto siguiente"
              onClick={() => irFoto(1)}
              className="absolute right-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <Chevron className="-rotate-90" />
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fotos[indiceAbierto].url}
              alt={fotos[indiceAbierto].descripcion ?? ''}
              className="max-h-[90vh] w-full rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  )
}
