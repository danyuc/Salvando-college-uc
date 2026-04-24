import type { Evaluation } from './evaluations'
import { safeDate } from '@/lib/utils/date'

export type WeaknessSummary = {
  subject: string
  topic: string
  accuracy: number
  weaknessLevel: 'alta' | 'media' | 'baja'
  recommendation: string
}

export type RiskEvaluation = Evaluation & {
  riskScore: number
  daysLeft: number
  weaknessBoost: number
  weightBoost: number
  dateBoost: number
  gradeBoost: number
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function calculateDaysLeft(dateString: string) {
  const now = safeDate()
  const target = safeDate(dateString)
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / 86400000)
}

export function buildEvaluationRisk(
  evaluations: Evaluation[],
  weaknesses: WeaknessSummary[]
): RiskEvaluation[] {
  return evaluations.map((evaluation) => {
    const topic = evaluation.topic || 'General'
    const daysLeft = calculateDaysLeft(evaluation.start_date)

    const weakness = weaknesses.find(
      (item) =>
        item.subject === evaluation.subject &&
        item.topic.toLowerCase() === topic.toLowerCase()
    )

    let weaknessBoost = 0
    if (weakness?.weaknessLevel === 'alta') weaknessBoost = 35
    else if (weakness?.weaknessLevel === 'media') weaknessBoost = 20
    else if (weakness?.weaknessLevel === 'baja') weaknessBoost = 8

    const weightPercent =
      typeof evaluation.weight_percent === 'number'
        ? evaluation.weight_percent
        : 0

    const weightBoost = clamp(weightPercent, 0, 40)

    let dateBoost = 0
    if (daysLeft <= 0) dateBoost = 45
    else if (daysLeft <= 3) dateBoost = 38
    else if (daysLeft <= 7) dateBoost = 28
    else if (daysLeft <= 14) dateBoost = 18
    else if (daysLeft <= 21) dateBoost = 10
    else dateBoost = 4

    let gradeBoost = 0
    if (typeof evaluation.grade === 'number') {
      if (evaluation.grade < 4) gradeBoost = 20
      else if (evaluation.grade < 5) gradeBoost = 10
      else gradeBoost = 0
    }

    const riskScore = weaknessBoost + weightBoost + dateBoost + gradeBoost

    return {
      ...evaluation,
      riskScore,
      daysLeft,
      weaknessBoost,
      weightBoost,
      dateBoost,
      gradeBoost,
    }
  })
}

export function rankRiskEvaluations(
  evaluations: Evaluation[],
  weaknesses: WeaknessSummary[]
) {
  return buildEvaluationRisk(evaluations, weaknesses).sort(
    (a, b) => b.riskScore - a.riskScore
  )
}
