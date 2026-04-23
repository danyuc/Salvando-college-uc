import type { Evaluation } from './evaluations'

export type SubjectAnalytics = {
  subject: string
  average: number | null
  totalWeight: number
  remainingWeight: number
  completed: number
  pending: number
  status: 'excelente' | 'bien' | 'medio' | 'riesgo' | 'sin-notas'
  neededToPass: number | null
  neededToReach55: number | null
}

export type GradeEvaluation = {
  id: string
  subject: string
  weight_percent?: number | null
  grade?: number | null
}

export type SubjectSummary = {
  subject: string
  currentAverage: number
  weightedProgress: number
  remainingWeight: number
  neededToPass: number | null
  neededToSix: number | null
  status: 'riesgo' | 'aprobado' | 'asegurado'
}

function round2(value: number) {
  return Math.round(value * 100) / 100
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function buildFullGradeAnalysis(
  evaluations: Evaluation[]
): SubjectAnalytics[] {
  const grouped = new Map<string, Evaluation[]>()

  evaluations.forEach((evaluation) => {
    const subject = evaluation.subject || 'Sin ramo'
    if (!grouped.has(subject)) grouped.set(subject, [])
    grouped.get(subject)!.push(evaluation)
  })

  const results: SubjectAnalytics[] = []

  for (const [subject, items] of grouped.entries()) {
    const graded = items.filter(
      (item) =>
        typeof item.grade === 'number' &&
        !Number.isNaN(Number(item.grade))
    )

    const weighted = graded.filter(
      (item) =>
        item.weight_percent !== null &&
        item.weight_percent !== undefined &&
        Number(item.weight_percent) > 0
    )

    let totalWeight = 0
    let weightedSum = 0

    weighted.forEach((item) => {
      totalWeight += Number(item.weight_percent)
      weightedSum += Number(item.grade) * Number(item.weight_percent)
    })

    const remainingWeight = Math.max(0, 100 - totalWeight)

    let average: number | null = null

    if (totalWeight > 0) {
      average = Number((weightedSum / totalWeight).toFixed(2))
    } else if (graded.length > 0) {
      average = Number(
        (
          graded.reduce((acc, item) => acc + Number(item.grade || 0), 0) /
          graded.length
        ).toFixed(2)
      )
    }

    let status: SubjectAnalytics['status'] = 'sin-notas'

    if (average !== null) {
      if (average >= 6) status = 'excelente'
      else if (average >= 5.5) status = 'bien'
      else if (average >= 4) status = 'medio'
      else status = 'riesgo'
    }

    let neededToPass: number | null = null
    let neededToReach55: number | null = null

    if (remainingWeight > 0) {
      neededToPass = Number(
        ((4.0 * 100 - weightedSum) / remainingWeight).toFixed(2)
      )
      neededToReach55 = Number(
        ((5.5 * 100 - weightedSum) / remainingWeight).toFixed(2)
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
      neededToReach55,
    })
  }

  return results.sort((a, b) => a.subject.localeCompare(b.subject))
}

export function buildSubjectGradeSummaries(
  evaluations: GradeEvaluation[]
): SubjectSummary[] {
  const grouped = new Map<string, GradeEvaluation[]>()

  for (const ev of evaluations) {
    if (!grouped.has(ev.subject)) grouped.set(ev.subject, [])
    grouped.get(ev.subject)!.push(ev)
  }

  const result: SubjectSummary[] = []

  for (const [subject, list] of grouped.entries()) {
    let totalWeight = 0
    let weightedSum = 0

    for (const ev of list) {
      const weight = ev.weight_percent ?? 0
      const grade = ev.grade

      if (grade !== null && grade !== undefined) {
        weightedSum += (grade * weight) / 100
        totalWeight += weight
      }
    }

    const remainingWeight = clamp(100 - totalWeight, 0, 100)
    const currentAverage = round2(weightedSum)

    function calcNeeded(target: number) {
      if (remainingWeight === 0) return null
      const needed = (target - weightedSum) / (remainingWeight / 100)
      return round2(clamp(needed, 1, 7))
    }

    const neededToPass = calcNeeded(4)
    const neededToSix = calcNeeded(6)

    let status: SubjectSummary['status'] = 'riesgo'
    if (currentAverage >= 5.5) status = 'asegurado'
    else if (currentAverage >= 4) status = 'aprobado'

    result.push({
      subject,
      currentAverage,
      weightedProgress: round2(totalWeight),
      remainingWeight,
      neededToPass,
      neededToSix,
      status,
    })
  }

  return result.sort((a, b) => a.subject.localeCompare(b.subject))
}