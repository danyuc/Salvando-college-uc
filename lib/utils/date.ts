export function safeDate(
  value?: string | number | Date | null,
  month?: number,
  day?: number
): Date {
  // Caso tipo: safeDate(2024, 0, 1)
  if (typeof value === 'number' && typeof month === 'number') {
    return new Date(value, month, day ?? 1)
  }

  if (!value) return new Date()

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return new Date()
  }

  return date
}
