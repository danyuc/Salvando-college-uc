export type GradeItem = {
  grade?: number | null
  weight_percent?: number | null
}

export function normalizeWeight(value: unknown) {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n) || n <= 0) return 0
  return n > 1 ? n / 100 : n
}

export function calculateWeightedAverage(items: GradeItem[]) {
  const graded = items.filter(
    (item) =>
      typeof item.grade === "number" &&
      Number.isFinite(item.grade) &&
      item.grade >= 1 &&
      item.grade <= 7
  )

  if (!graded.length) return null

  const totalWeight = graded.reduce(
    (acc, item) => acc + normalizeWeight(item.weight_percent),
    0
  )

  if (totalWeight > 0) {
    const weightedSum = graded.reduce(
      (acc, item) =>
        acc + Number(item.grade) * normalizeWeight(item.weight_percent),
      0
    )

    return Number((weightedSum / totalWeight).toFixed(2))
  }

  const simpleAverage =
    graded.reduce((acc, item) => acc + Number(item.grade), 0) / graded.length

  return Number(simpleAverage.toFixed(2))
}

export function calculateCompletedWeight(items: GradeItem[]) {
  return Number(
    (
      items
        .filter(
          (item) =>
            typeof item.grade === "number" &&
            Number.isFinite(item.grade) &&
            item.grade >= 1 &&
            item.grade <= 7
        )
        .reduce((acc, item) => acc + normalizeWeight(item.weight_percent), 0) *
      100
    ).toFixed(1)
  )
}
