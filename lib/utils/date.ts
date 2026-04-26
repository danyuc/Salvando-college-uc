export function safeDate(
  value?: string | number | Date | null,
  month?: number,
  day?: number
): Date | null {
  // Caso: safeDate(2024, 0, 1)
  if (typeof value === 'number' && typeof month === 'number') {
    const d = new Date(value, month, day ?? 1)
    return Number.isNaN(d.getTime()) ? null : d
  }

  if (!value) return null

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date
}