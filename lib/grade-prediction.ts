import type { Evaluation } from './evaluations'
import type { WeaknessSummary } from './weakness-engine'

export type SubjectGradePrediction = {
  subject: string
  completedWeight: number
  remainingWeight: number
  currentWeightedScore: number
  currentAverageOnCompleted: number | null
  projectedFinalIfSamePerformance: number | null
  neededToPass: number | null
  neededFor50: number | null
  neededFor55: number | null
  neededFor60: number | null
  neededFor70: number | null
  status: 'sin-datos' | 'al-dia' | 'en-riesgo' | 'critico'
  weaknessRisk: 'alta' | 'media' | 'baja'
  weaknessTopics: string[]
  summary: string
}

function round2(value: number) {
  return Math.round(value * 100) / 100
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function getWeight(evaluation: Evaluation) {
  const weight =
    typeof evaluation.weight_percent === 'number'
      ? evaluation.weight_percent
      : 0

  return clamp(weight, 0, 100)
}

function getGrade(evaluation: Evaluation) {
  return typeof evaluation.grade === 'number' ? evaluation.grade : null
}

function computeNeededGrade(
  currentWeightedScore: number,
  remainingWeight: number,
  target: number
) {
  if (remainingWeight <= 0) return null

  const needed = (target * 100 - currentWeightedScore) / remainingWeight

  if (!Number.isFinite(needed)) return null

  return round2(needed)
}

function summarizeStatus(params: {
  status: 'sin-datos' | 'al-dia' | 'en-riesgo' | 'critico'
  subject: string
  projectedFinalIfSamePerformance: number | null
  neededToPass: number | null
  weaknessRisk: 'alta' | 'media' | 'baja'
  weaknessTopics: string[]
}) {
  const {
    status,
    projectedFinalIfSamePerformance,
    neededToPass,
    weaknessRisk,
    weaknessTopics,
  } = params

  if (status === 'sin-datos') {
    return 'Todavía no hay suficientes evaluaciones con nota para proyectar con precisión.'
  }

  const projectionText =
    projectedFinalIfSamePerformance === null
      ? 'No hay proyección disponible.'
      : `Si mantienes tu rendimiento actual, tu nota final proyectada sería ${projectedFinalIfSamePerformance.toFixed(2)}.`

  const neededText =
    neededToPass === null
      ? 'No queda peso pendiente para recalcular lo que necesitas.'
      : `Para llegar al 4.0 necesitarías aproximadamente ${neededToPass.toFixed(2)} en lo restante.`

  const weaknessText =
    weaknessTopics.length > 0
      ? `Tus temas más delicados ahora son ${weaknessTopics.join(', ')}.`
      : 'No hay temas débiles detectados por intentos recientes.'

  if (status === 'critico') {
    return `${projectionText} Estás en situación crítica. ${neededText} ${weaknessText}`
  }

  if (status === 'en-riesgo') {
    return `${projectionText} Hay riesgo académico moderado. ${neededText} ${weaknessText}`
  }

  return `${projectionText} Vas en una situación académica estable. ${weaknessRisk === 'alta' ? weaknessText : 'Conviene mantener constancia y seguir reforzando.'}`
}

export function buildGradePredictions(params: {
  evaluations: Evaluation[]
  weaknesses?: WeaknessSummary[]
}) {
  const { evaluations, weaknesses = [] } = params

  const grouped = new Map<string, Evaluation[]>()

  for (const evaluation of evaluations) {
    if (!evaluation.subject) continue
    if (!grouped.has(evaluation.subject)) grouped.set(evaluation.subject, [])
    grouped.get(evaluation.subject)!.push(evaluation)
  }

  const results: SubjectGradePrediction[] = []

  for (const [subject, subjectEvaluations] of grouped.entries()) {
    let completedWeight = 0
    let remainingWeight = 0
    let currentWeightedScore = 0
    let completedGradeSum = 0
    let completedGradeCount = 0

    for (const evaluation of subjectEvaluations) {
      const weight = getWeight(evaluation)
      const grade = getGrade(evaluation)

      if (grade !== null) {
        completedWeight += weight
        currentWeightedScore += grade * weight
        completedGradeSum += grade
        completedGradeCount += 1
      } else {
        remainingWeight += weight
      }
    }

    const currentAverageOnCompleted =
      completedGradeCount > 0 ? round2(completedGradeSum / completedGradeCount) : null

    const projectedFinalIfSamePerformance =
      completedWeight > 0
        ? round2(
            currentWeightedScore / 100 +
              (remainingWeight / 100) * (currentWeightedScore / completedWeight)
          )
        : null

    const neededToPass = computeNeededGrade(currentWeightedScore, remainingWeight, 4.0)
    const neededFor50 = computeNeededGrade(currentWeightedScore, remainingWeight, 5.0)
    const neededFor55 = computeNeededGrade(currentWeightedScore, remainingWeight, 5.5)
    const neededFor60 = computeNeededGrade(currentWeightedScore, remainingWeight, 6.0)
    const neededFor70 = computeNeededGrade(currentWeightedScore, remainingWeight, 7.0)

    const subjectWeaknesses = weaknesses.filter((item) => item.subject === subject)
    const weaknessTopics = subjectWeaknesses
      .filter((item) => item.weaknessLevel !== 'baja')
      .slice(0, 3)
      .map((item) => item.topic)

    let weaknessRisk: 'alta' | 'media' | 'baja' = 'baja'
    if (subjectWeaknesses.some((item) => item.weaknessLevel === 'alta')) {
      weaknessRisk = 'alta'
    } else if (subjectWeaknesses.some((item) => item.weaknessLevel === 'media')) {
      weaknessRisk = 'media'
    }

    let status: 'sin-datos' | 'al-dia' | 'en-riesgo' | 'critico' = 'sin-datos'

    if (completedWeight === 0) {
      status = 'sin-datos'
    } else if (
      (projectedFinalIfSamePerformance !== null &&
        projectedFinalIfSamePerformance < 4.0) ||
      (neededToPass !== null && neededToPass > 6.0)
    ) {
      status = 'critico'
    } else if (
      (projectedFinalIfSamePerformance !== null &&
        projectedFinalIfSamePerformance < 4.8) ||
      weaknessRisk === 'alta'
    ) {
      status = 'en-riesgo'
    } else {
      status = 'al-dia'
    }

    const summary = summarizeStatus({
      status,
      subject,
      projectedFinalIfSamePerformance,
      neededToPass,
      weaknessRisk,
      weaknessTopics,
    })

    results.push({
      subject,
      completedWeight: round2(completedWeight),
      remainingWeight: round2(remainingWeight),
      currentWeightedScore: round2(currentWeightedScore),
      currentAverageOnCompleted,
      projectedFinalIfSamePerformance,
      neededToPass,
      neededFor50,
      neededFor55,
      neededFor60,
      neededFor70,
      status,
      weaknessRisk,
      weaknessTopics,
      summary,
    })
  }

  return results.sort((a, b) => {
    const weight = {
      critico: 0,
      'en-riesgo': 1,
      'al-dia': 2,
      'sin-datos': 3,
    }

    if (weight[a.status] !== weight[b.status]) {
      return weight[a.status] - weight[b.status]
    }

    const aProj = a.projectedFinalIfSamePerformance ?? -1
    const bProj = b.projectedFinalIfSamePerformance ?? -1

    return aProj - bProj
  })
}