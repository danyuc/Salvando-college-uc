export type SubjectAnalytics = {
  subject: string
  average: number | null
  totalWeight: number
  remainingWeight: number
  completed: number
  pending: number
  status: 'excelente' | 'bien' | 'medio' | 'riesgo' | 'sin-notas'
  neededToPass: number | null
}

export function buildFullGradeAnalysis(evaluations: any[]): SubjectAnalytics[] {
  const grouped = new Map<string, any[]>()

  evaluations.forEach((e) => {
    const key = e.subject || 'Sin ramo'
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(e)
  })

  const results: SubjectAnalytics[] = []

  for (const [subject, items] of grouped.entries()) {
    const graded = items.filter((e) => typeof e.grade === 'number')
    const weighted = graded.filter((e) => e.weight_percent)

    let totalWeight = 0
    let weightedSum = 0

    weighted.forEach((e) => {
      totalWeight += Number(e.weight_percent)
      weightedSum += Number(e.grade) * Number(e.weight_percent)
    })

    const remainingWeight = Math.max(0, 100 - totalWeight)

    let average: number | null = null

    if (totalWeight > 0) {
      average = Number((weightedSum / totalWeight).toFixed(2))
    }

    let status: SubjectAnalytics['status'] = 'sin-notas'

    if (average !== null) {
      if (average >= 6) status = 'excelente'
      else if (average >= 5.5) status = 'bien'
      else if (average >= 4) status = 'medio'
      else status = 'riesgo'
    }

    let neededToPass: number | null = null

    if (remainingWeight > 0 && average !== null) {
      const target = 4.0

      neededToPass = Number(
        ((target * 100 - weightedSum) / remainingWeight).toFixed(2)
      )
    }

    results.push({
      subject,
      average,
      totalWeight,
      remainingWeight,
      completed: graded.length,
      pending: items.length - graded.length,
      status,
      neededToPass,
    })
  }

  return results
}