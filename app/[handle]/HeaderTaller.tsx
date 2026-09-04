'use client'

import { useState } from 'react'
import { Menu, X } from './iconos'

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
          <IconoWhatsapp />
          <span className="md:sr-only">WhatsApp</span>
        </a>
      )}
      {email && (
        <a
          href={`mailto:${email}`}
          aria-label={`Escribir a ${nombre} por email`}
          className="inline-flex items-center gap-2 hover:text-[color:var(--color-acento)]"
        >
          <IconoMail />
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

function IconoWhatsapp() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 5.83 2.42 8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.21-8.24 8.21Z" />
    </svg>
  )
}

function IconoMail() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="m3 7 8.2 5.5a1.5 1.5 0 0 0 1.6 0L21 7" />
    </svg>
  )
}
