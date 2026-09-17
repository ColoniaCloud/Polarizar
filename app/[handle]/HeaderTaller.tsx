'use client'

import { useState } from 'react'
import { Menu, X, Whatsapp, Mail } from './iconos'

/**
 * El header de la página del taller.
 *
 * Reemplaza a la barra de Polarizar, que competía con la marca del taller justo
 * donde no corresponde: esta es la página que él reparte, y en ella la única
 * marca que manda es la suya.
 *
 * Los dos íconos de contacto no son decorativos — son la salida de emergencia.
 * Mucha gente no completa un formulario y prefiere escribir; darle esa puerta
 * arriba a la derecha vale más que forzarla a bajar hasta el final.
 */
export default function HeaderTaller({
  nombre,
  logoUrl,
  telefono,
  email,
  fondo,
}: {
  nombre: string
  logoUrl: string | null
  telefono: string | null
  email: string | null
  /** Lo elige el taller según cómo se vea su logo. Ver `logoBackground`. */
  fondo: 'CLARO' | 'OSCURO'
}) {
  const [abierto, setAbierto] = useState(false)
  const oscura = fondo === 'OSCURO'

  // El teléfono va a wa.me sin espacios ni guiones. Si no arranca con código de
  // país se asume Argentina, que es de donde viene la mayoría de los talleres.
  const wa = telefono
    ? `https://wa.me/${(() => {
        const d = telefono.replace(/\D/g, '')
        return d.startsWith('54') || d.startsWith('598') ? d : `54${d.replace(/^0/, '')}`
      })()}`
    : null

  const enlaces = (
    <>
      <a href="#agendar" onClick={() => setAbierto(false)} className="hover:text-[color:var(--color-acento)]">
        Agendar
      </a>
      <a href="#servicios" onClick={() => setAbierto(false)} className="hover:text-[color:var(--color-acento)]">
        Servicios
      </a>
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          aria-label={`Escribir a ${nombre} por WhatsApp`}
          className="inline-flex items-center gap-2 hover:text-[color:var(--color-acento)]"
        >
          <Whatsapp />
          <span className="md:sr-only">WhatsApp</span>
        </a>
      )}
      {email && (
        <a
          href={`mailto:${email}`}
          aria-label={`Escribir a ${nombre} por email`}
          className="inline-flex items-center gap-2 hover:text-[color:var(--color-acento)]"
        >
          <Mail />
          <span className="md:sr-only">Email</span>
        </a>
      )}
    </>
  )

  return (
    // La cabecera es lo único que puede ir oscuro: el resto de la página es
    // clara siempre. Sin el `backdrop-blur` cuando es oscura — el desenfoque
    // sobre contenido claro deja un halo sucio en el borde.
    <header
      className={
        oscura
          ? 'sticky top-0 z-30 border-b border-[color:var(--color-cabecera-oscura-linea)] bg-[color:var(--color-cabecera-oscura)] text-[color:var(--color-cabecera-oscura-texto)]'
          : 'sticky top-0 z-30 border-b border-[color:var(--color-linea)] bg-[color:var(--color-fondo)]/90 backdrop-blur'
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <a href="#" className="flex min-w-0 items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={nombre} className="max-h-11 max-w-[11rem] object-contain" />
          ) : (
            <span className="truncate text-lg font-semibold">{nombre}</span>
          )}
        </a>

        <nav className="hidden items-center gap-6 text-sm md:flex">{enlaces}</nav>

        <button
          type="button"
          onClick={() => setAbierto((a) => !a)}
          aria-expanded={abierto}
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          className={`rounded-lg border p-2 md:hidden ${
            oscura
              ? 'border-[color:var(--color-cabecera-oscura-linea)]'
              : 'border-[color:var(--color-linea)]'
          }`}
        >
          {abierto ? <X /> : <Menu />}
        </button>
      </div>

      {abierto && (
        <nav
          className={`flex flex-col gap-4 border-t px-5 py-4 text-sm md:hidden ${
            oscura
              ? 'border-[color:var(--color-cabecera-oscura-linea)]'
              : 'border-[color:var(--color-linea)]'
          }`}
        >
          {enlaces}
        </nav>
      )}
    </header>
  )
}
