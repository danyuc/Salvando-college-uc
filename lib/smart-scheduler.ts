import type { Evaluation } from './evaluations'

export type StudyPlan = {
  subject: string
  hours: number
  priority: number
  reason: string
  riskLevel: 'alto' | 'medio' | 'bajo'
}

function getPredictedGrade(pred: any) {
  return (
    pred?.predictedGrade ??
    pred?.predicted_grade ??
    pred?.finalGrade ??
    pred?.final_grade ??
    pred?.grade ??
    5
  )
}

function getRiskLevel(pred: any): 'alto' | 'medio' | 'bajo' {
  const direct = pred?.riskLevel ?? pred?.risk_level

  if (direct === 'alto' || direct === 'medio' || direct === 'bajo') {
    return direct
  }

  const grade = Number(getPredictedGrade(pred))

  if (grade < 4) return 'alto'
  if (grade < 5) return 'medio'
  return 'bajo'
}

function getSubjectFromPrediction(pred: any) {
  return pred?.subject ?? pred?.subjectName ?? pred?.name ?? 'General'
}

export function buildSmartSchedule(
  evaluations: Evaluation[] = [],
  weeklyHours = 35
): StudyPlan[] {
  const source = evaluations.map((evaluation) => ({
    subject: evaluation.subject || 'General',
    grade: Number((evaluation as any).current_grade ?? (evaluation as any).grade ?? 5),
    riskLevel:
      Number((evaluation as any).current_grade ?? (evaluation as any).grade ?? 5) < 4
        ? 'alto'
        : Number((evaluation as any).current_grade ?? (evaluation as any).grade ?? 5) < 5
        ? 'medio'
        : 'bajo',
  }))

  if (!source.length) return []

  const rawPlans = source.map((pred) => {
    const subject = getSubjectFromPrediction(pred)
    const riskLevel = getRiskLevel(pred)

    let score = 1

    if (riskLevel === 'alto') score += 5
    else if (riskLevel === 'medio') score += 3
    else score += 1

    const relatedEvaluations = evaluations.filter(
      (evaluation) => evaluation.subject === subject
    )

    const weightBoost = relatedEvaluations.reduce((sum, evaluation) => {
      return sum + (evaluation.weight_percent ?? 0) / 20
    }, 0)

    score += weightBoost

    return {
      subject,
      score,
      riskLevel,
    }
  })

  const totalScore = rawPlans.reduce((sum, item) => sum + item.score, 0) || 1

  return rawPlans
    .map((item) => {
      const hours = Math.max(
        1,
        Math.round((weeklyHours * item.score) / totalScore)
      )

      return {
        subject: item.subject,
        hours,
        priority: item.score,
        riskLevel: item.riskLevel,
        reason: `Riesgo: ${item.riskLevel} | Ajuste automático`,
      }
    })
    .sort((a, b) => b.priority - a.priority)
}

export const generateSmartSchedule = buildSmartSchedule
export const buildSmartStudyPlan = buildSmartSchedule
