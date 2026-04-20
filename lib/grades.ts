import type { Evaluation } from './evaluations'

export type SubjectGradeSummary = {
  subject: string
  average: number | null
  completedCount: number
  pendingCount: number
  totalWeight: number
  status: 'sin-notas' | 'bien' | 'medio' | 'riesgo'
}

export function buildSubjectGradeSummaries(
  evaluations: Evaluation[]
): SubjectGradeSummary[] {
  const grouped = new Map<string, Evaluation[]>()

  for (const evaluation of evaluations) {
    const key = evaluation.subject || 'Sin ramo'
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(evaluation)
  }

  const result: SubjectGradeSummary[] = []

  for (const [subject, items] of grouped.entries()) {
    const graded = items.filter(
      (item) => typeof item.grade === 'number' && !Number.isNaN(item.grade)
    )

    const pending = items.length - graded.length
    const weighted = graded.filter(
      (item) =>
        typeof item.weight_percent === 'number' &&
        item.weight_percent !== null &&
        item.weight_percent > 0
    )

    let average: number | null = null
    let totalWeight = 0

    if (weighted.length > 0) {
      totalWeight = weighted.reduce(
        (acc, item) => acc + Number(item.weight_percent || 0),
        0
      )

      average =
        totalWeight > 0
          ? Number(
              (
                weighted.reduce(
                  (acc, item) =>
                    acc +
                    Number(item.grade || 0) * Number(item.weight_percent || 0),
                  0
                ) / totalWeight
              ).toFixed(2)
            )
          : null
    } else if (graded.length > 0) {
      average = Number(
        (
          graded.reduce((acc, item) => acc + Number(item.grade || 0), 0) /
          graded.length
        ).toFixed(2)
      )
    }

    let status: SubjectGradeSummary['status'] = 'sin-notas'
    if (average !== null) {
      if (average >= 5.5) status = 'bien'
      else if (average >= 4.0) status = 'medio'
      else status = 'riesgo'
    }

    result.push({
      subject,
      average,
      completedCount: graded.length,
      pendingCount: pending,
      totalWeight,
      status,
    })
  }

  return result.sort((a, b) => a.subject.localeCompare(b.subject))
}