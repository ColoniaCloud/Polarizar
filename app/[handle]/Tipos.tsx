'use client'

import { useEffect, useState, type ReactNode } from 'react'
import type { PublicWorkshop } from '@/lib/crm'
import { TIPOS_VEHICULO } from '@/lib/vehiculos'
import { TIPOS_INMUEBLE } from '@/lib/inmuebles'
import { Casa, Oficina, Local, Edificio, Otro } from './iconos'

const ICONOS_INMUEBLE: Record<string, () => React.JSX.Element> = {
  CASA: Casa,
  OFICINA: Oficina,
  LOCAL: Local,
  EDIFICIO: Edificio,
  OTRO: Otro,
}

interface Tipo {
  key: string
  label: string
  render: ReactNode
}

/** Cuántas casillas como máximo. 6 entra en 3×2 en celular y en una línea en escritorio. */
const CASILLAS = 6

/**
 * Cada casilla cambia a su propio ritmo, en milisegundos.
 *
 * Los números están elegidos para que no compartan múltiplos chicos: con
 * ritmos parecidos (4000, 5000, 6000) las casillas se irían sincronizando
 * cada tanto y volverían a girar todas juntas, que es justo lo que no se
 * quiere. Con estos, se cruzan y nunca vuelven a coincidir.
 */
const RITMOS = [4300, 5200, 6100, 4900, 5800, 6700]

/**
 * "Aplicamos láminas en:" — sobre qué trabaja el taller.
 *
 * Antes era un carrusel que se desplazaba solo, pero arriba ya hay dos filas
 * de fotos moviéndose en el álbum: tres cosas deslizándose en la misma
 * pantalla se leen como una página inquieta.
 *
 * Ahora son casillas fijas —no se mueven de lugar— y cada una va cambiando el
 * tipo que muestra con un giro, a su propio ritmo. Los tipos se reparten entre
 * las casillas de a uno (`j % cantidad`), así que todos terminan apareciendo:
 * la casilla 1 va rotando entre el primero, el séptimo, el decimotercero, y
 * así.
 *
 * Con `prefers-reduced-motion` no gira nada y se muestran **todos** los tipos
 * a la vez, quietos. Es la misma información sin una sola animación, que es
 * mejor que dejar las casillas congeladas mostrando solo seis de catorce.
 */
export default function Tipos({ taller }: { taller: PublicWorkshop }) {
  const [sinMovimiento, setSinMovimiento] = useState(false)

  useEffect(() => {
    const consulta = window.matchMedia('(prefers-reduced-motion: reduce)')
    const leer = () => setSinMovimiento(consulta.matches)
    leer()
    consulta.addEventListener('change', leer)
    return () => consulta.removeEventListener('change', leer)
  }, [])

  const tipos: Tipo[] = []

  if (taller.rubros.automotriz) {
    for (const v of TIPOS_VEHICULO) {
      tipos.push({
        key: v.slug,
        label: v.label,
        // eslint-disable-next-line @next/next/no-img-element
        render: <img src={v.icon} alt="" className="h-8 w-8 object-contain md:h-9 md:w-9" />,
      })
    }
  }

  if (taller.rubros.arquitectura) {
    for (const t of TIPOS_INMUEBLE) {
      const Icono = ICONOS_INMUEBLE[t.slug] ?? Otro
      tipos.push({
        key: t.slug,
        label: t.label,
        render: (
          <div className="flex items-center justify-center [&>svg]:size-7 [&>svg]:md:size-8">
            <Icono />
          </div>
        ),
      })
    }
  }

  if (tipos.length === 0) return null

  const cantidad = Math.min(CASILLAS, tipos.length)
  const casillas = Array.from({ length: cantidad }, (_, i) =>
    tipos.filter((_, j) => j % cantidad === i)
  )

  return (
    <section className="py-10 md:py-14">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <h2 className="mb-6 text-xl font-semibold text-[color:var(--color-tinta)]">
          Aplicamos láminas en:
        </h2>

        {sinMovimiento ? (
          <div className="grid grid-cols-3 gap-y-7 sm:grid-cols-5 md:grid-cols-7">
            {tipos.map((t) => (
              <Casillero key={t.key} tipo={t} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-y-7 sm:grid-cols-6">
            {casillas.map((lista, i) => (
              <Casilla key={lista[0].key} tipos={lista} ritmo={RITMOS[i]} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/**
 * Una casilla: siempre en el mismo lugar, mostrando uno de sus tipos.
 *
 * El `key` del contenido es el paso y no el tipo: así React lo vuelve a montar
 * en cada cambio y la animación de entrada se dispara sola, sin tener que
 * coordinar una animación de salida con un temporizador aparte.
 *
 * En el paso 0 no hay animación a propósito — es el primer dibujado de la
 * página, no un giro, y arrancar con las seis casillas girando a la vez es
 * exactamente el efecto sincronizado que se está evitando.
 */
function Casilla({ tipos, ritmo }: { tipos: Tipo[]; ritmo: number }) {
  const [paso, setPaso] = useState(0)

  useEffect(() => {
    // Con un solo tipo no hay nada que rotar: queda fija y sin temporizador.
    if (tipos.length < 2) return
    const id = setInterval(() => setPaso((p) => p + 1), ritmo)
    return () => clearInterval(id)
  }, [tipos.length, ritmo])

  return (
    <div className="[perspective:600px]">
      <div key={paso} className={paso > 0 ? 'animate-[giro-tipo_0.55s_ease-out]' : undefined}>
        <Casillero tipo={tipos[paso % tipos.length]} />
      </div>
    </div>
  )
}

/**
 * El ícono y su nombre.
 *
 * Los dos altos son fijos: el del ícono porque no todos miden lo mismo, y el
 * del nombre porque "Yate / Embarcación" ocupa dos renglones y "SUV" uno — sin
 * un alto fijo, cada giro movería de lugar a la casilla de al lado.
 */
function Casillero({ tipo }: { tipo: Tipo }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-12 items-center justify-center text-[color:var(--color-acento)]">
        {tipo.render}
      </div>
      <span className="flex h-8 items-start justify-center text-center text-[10px] font-medium leading-tight text-[color:var(--color-tenue)] md:text-xs">
        {tipo.label}
      </span>
    </div>
  )
}
