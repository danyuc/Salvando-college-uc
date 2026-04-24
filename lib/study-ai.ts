import type { Evaluation } from './evaluations'

export type StudyPriority = {
  evaluation: Evaluation
  score: number
  status: 'en-curso' | 'proxima' | 'vencida'
  daysToStart: number
  daysToEnd: number
  preparation: 'critico' | 'bajo' | 'medio' | 'bien'
  recommendation: string
}

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function isEvaluationActive(evaluation: Evaluation, now = new Date()) {
  const today = startOfDay(now)
  const start = startOfDay(new Date(evaluation.start_date))
  const end = startOfDay(new Date(evaluation.end_date))
  return today >= start && today <= end
}

export function daysUntil(dateString: string, now = new Date()) {
  const today = startOfDay(now)
  const target = startOfDay(new Date(dateString))
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

export function getEvaluationStatus(evaluation: Evaluation, now = new Date()) {
  const toStart = daysUntil(evaluation.start_date, now)
  const toEnd = daysUntil(evaluation.end_date, now)

  if (toEnd < 0) return 'vencida'
  if (isEvaluationActive(evaluation, now)) return 'en-curso'
  return 'proxima'
}

export function getPreparationLabel(
  evaluation: Evaluation,
  now = new Date()
): 'critico' | 'bajo' | 'medio' | 'bien' {
  const progress = Number((evaluation as any).study_progress ?? (evaluation as any).progress ?? 0)
  const toEnd = daysUntil(evaluation.end_date, now)
  const difficulty = ((evaluation as any).difficulty ?? 'media')

  if (toEnd <= 1 && progress < 40) return 'critico'
  if (toEnd <= 3 && progress < 50) return 'bajo'
  if (difficulty === 'alta' && progress < 65) return 'bajo'
  if (progress >= 80) return 'bien'
  return 'medio'
}

export function getPriorityScore(evaluation: Evaluation, now = new Date()) {
  const status = getEvaluationStatus(evaluation, now)
  const toStart = daysUntil(evaluation.start_date, now)
  const toEnd = daysUntil(evaluation.end_date, now)
  const difficulty = ((evaluation as any).difficulty ?? 'media')
  const progress = Number((evaluation as any).study_progress ?? (evaluation as any).progress ?? 0)
  const estimated = Number((evaluation as any).estimated_minutes ?? (evaluation as any).estimatedMinutes ?? 60)

  let score = 0

  if (status === 'en-curso') score += 60
  if (status === 'proxima') score += Math.max(0, 25 - Math.max(toStart, 0) * 4)
  if (toEnd <= 2) score += 25
  if (difficulty === 'alta') score += 15
  if (difficulty === 'media') score += 8
  score += Math.min(20, Math.round(estimated / 15))
  score += Math.max(0, 30 - Math.round(progress / 3))

  return Math.max(0, score)
}

export function getRecommendation(evaluation: Evaluation, now = new Date()) {
  const status = getEvaluationStatus(evaluation, now)
  const toEnd = daysUntil(evaluation.end_date, now)
  const progress = Number((evaluation as any).study_progress ?? (evaluation as any).progress ?? 0)
  const topic = evaluation.topic || evaluation.title || 'la materia'

  if (status === 'en-curso' && toEnd <= 1) {
    return `Cierra ${topic} hoy. Prioriza repaso y práctica rápida.`
  }

  if (status === 'en-curso') {
    return `Avanza ${topic} hoy y deja resuelto lo más importante antes del cierre.`
  }

  if (progress < 30) {
    return `Empieza ${topic} desde la base y arma una sesión corta hoy.`
  }

  return `Haz una sesión de consolidación sobre ${topic} y luego practica preguntas tipo prueba.`
}

export function rankEvaluations(
  evaluations: Evaluation[],
  now = new Date()
): StudyPriority[] {
  return [...evaluations]
    .filter((evaluation) => getEvaluationStatus(evaluation, now) !== 'vencida')
    .map((evaluation) => {
      const status = getEvaluationStatus(evaluation, now)
      const daysToStart = daysUntil(evaluation.start_date, now)
      const daysToEnd = daysUntil(evaluation.end_date, now)
      const score = getPriorityScore(evaluation, now)
      const preparation = getPreparationLabel(evaluation, now)
      const recommendation = getRecommendation(evaluation, now)

      return {
        evaluation,
        score,
        status,
        daysToStart,
        daysToEnd,
        preparation,
        recommendation,
      }
    })
    .sort((a, b) => b.score - a.score)
}

export function buildTodayFocus(evaluations: Evaluation[]) {
  const ranked = rankEvaluations(evaluations)
  return {
    top: ranked[0] ?? null,
    secondary: ranked.slice(1, 3),
    load:
      ranked.filter((item) => item.status !== 'vencida').length >= 5
        ? 'alta'
        : ranked.filter((item) => item.status !== 'vencida').length >= 2
        ? 'media'
        : 'baja',
  }
}