const DIAS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const CORTOS = ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

/**
 * "1,2,3,4,5" → "Lunes a viernes".
 *
 * Agrupa los tramos seguidos en vez de listar los siete días: nadie lee
 * "Lun, Mar, Mié, Jue, Vie" y entiende más rápido que con "Lunes a viernes".
 */
export function formatDias(dias: string | null): string | null {
  if (!dias) return null
  const nums = dias
    .split(',')
    .map((d) => Number(d.trim()))
    .filter((d) => d >= 1 && d <= 7)
    .sort((a, b) => a - b)
  if (nums.length === 0) return null

  const tramos: number[][] = []
  for (const n of nums) {
    const ultimo = tramos[tramos.length - 1]
    if (ultimo && n === ultimo[ultimo.length - 1] + 1) ultimo.push(n)
    else tramos.push([n])
  }

  return tramos
    .map((t) =>
      t.length === 1
        ? DIAS[t[0]]
        : t.length === 2
          ? `${CORTOS[t[0]]} y ${CORTOS[t[1]]}`
          : `${DIAS[t[0]]} a ${DIAS[t[t.length - 1]].toLowerCase()}`
    )
    .join(', ')
}

export function formatPrecio(valor: number | null, moneda: 'ARS' | 'USD'): string | null {
  if (valor === null) return null
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: moneda,
    maximumFractionDigits: 0,
  }).format(valor)
}

/** 120 → "2 h". 45 → "45 min". 90 → "1 h 30 min". */
export function formatDuracion(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const resto = min % 60
  return resto === 0 ? `${h} h` : `${h} h ${resto} min`
}
