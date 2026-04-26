import { safeDate } from '@/lib/utils/date'

export function getEvaluationDate(e: any) {
  return e.start_date ?? e.end_date ?? e.date ?? null
}

export function getEvaluationEndDate(e: any) {
  return e.end_date ?? e.start_date ?? e.date ?? null
}

export function getEvaluationTitle(e: any) {
  return e.topic ?? e.title ?? e.contents ?? 'Sin tema'
}

export function getEvaluationWeight(e: any) {
  if (typeof e.weight_percent === 'number') return e.weight_percent
  if (typeof e.weight === 'number') return e.weight * 100
  return 0
}

export function getDaysLeft(value?: string | null) {
  const date = safeDate(value)
  if (!date) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Math.ceil((date.getTime() - today.getTime()) / 86400000)
}

export function formatEvaluationDate(value?: string | null) {
  const date = safeDate(value)
  if (!date) return 'Sin fecha'

  return date.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function getEvaluationRisk(e: any) {
  const days = getDaysLeft(getEvaluationDate(e))
  const weight = getEvaluationWeight(e)

  if (days === null) return 'sin datos'
  if (days < 0) return 'pasada'
  if (days <= 3 && weight >= 20) return 'alto'
  if (days <= 10 && weight >= 15) return 'medio'
  if (days <= 14) return 'medio'
  return 'bajo'
}

export function normalizeEvaluations(evaluations: any[]) {
  return evaluations
    .map((e) => ({
      ...e,
      normalized_date: getEvaluationDate(e),
      normalized_title: getEvaluationTitle(e),
      normalized_weight: getEvaluationWeight(e),
      days_left: getDaysLeft(getEvaluationDate(e)),
      risk_level: getEvaluationRisk(e),
    }))
    .filter((e) => e.subject && e.normalized_date && e.days_left !== null)
    .sort((a, b) => (a.days_left ?? 9999) - (b.days_left ?? 9999))
}

export function getUpcomingEvaluations(evaluations: any[]) {
  return normalizeEvaluations(evaluations).filter((e) => (e.days_left ?? -1) >= 0)
}

export function getFocusEvaluation(evaluations: any[]) {
  return [...getUpcomingEvaluations(evaluations)].sort((a, b) => {
    const scoreA = a.normalized_weight - (a.days_left ?? 999)
    const scoreB = b.normalized_weight - (b.days_left ?? 999)
    return scoreB - scoreA
  })[0]
}