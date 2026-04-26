export function safeDate(
  value?: string | number | Date | null,
  month?: number,
  day?: number
): Date | null {
  // Caso tipo: safeDate(2024, 0, 1)
  if (typeof value === 'number' && typeof month === 'number') {
    return new Date(value, month, day ?? 1)
  }

  if (!value) return null

  // 🔥 FIX CRÍTICO: forzar hora local
  if (typeof value === 'string' && value.length === 10) {
    // formato YYYY-MM-DD
    return new Date(value + 'T12:00:00')
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date
}