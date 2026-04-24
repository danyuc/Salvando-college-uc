export function safeDate(value: string | number | Date | null | undefined): Date {
  if (!value) return new Date(0)

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return new Date(0)
  }

  return date
}
