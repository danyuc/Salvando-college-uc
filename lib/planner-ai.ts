import type { AvailabilityBlock } from './availability'
import type { Evaluation } from './evaluations'
import { getEvaluationStatus, getPriorityScore } from './study-ai'

export type StudySessionPlan = {
  evaluationId: string
  subject: string
  label: string
  startTime: string
  endTime: string
  minutes: number
  reason: string
  priorityScore: number
}

function dayToAppIndex(jsDay: number) {
  return jsDay === 0 ? 6 : jsDay - 1
}

function parseTimeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function formatEvaluationLabel(evaluation: Evaluation) {
  return `${evaluation.type} ${evaluation.number ?? ''} · ${
    evaluation.topic || evaluation.title || 'Sin tema'
  }`
    .replace(/\s+/g, ' ')
    .trim()
}

function getRemainingStudyNeed(evaluation: Evaluation) {
  const estimated = evaluation.estimated_minutes ?? 60
  const progress = Math.min(100, Math.max(0, evaluation.study_progress ?? 0))
  const remaining = Math.round(estimated * (1 - progress / 100))
  return Math.max(20, remaining)
}

function getReason(evaluation: Evaluation) {
  const status = getEvaluationStatus(evaluation)
  const difficulty = evaluation.difficulty ?? 'media'
  const progress = evaluation.study_progress ?? 0

  if (status === 'en-curso' && progress < 40) {
    return 'Está en curso y llevas poco avance.'
  }

  if (status === 'en-curso') {
    return 'Está en curso y conviene cerrarla pronto.'
  }

  if (difficulty === 'alta') {
    return 'Tiene mayor dificultad y conviene adelantarla.'
  }

  if (progress < 50) {
    return 'Tienes avance bajo y necesita atención.'
  }

  return 'Es una de las prioridades de esta semana.'
}

export function buildTodayStudyPlan(
  evaluations: Evaluation[],
  availabilityBlocks: AvailabilityBlock[],
  now = new Date()
): StudySessionPlan[] {
  const todayIndex = dayToAppIndex(now.getDay())

  const todayBlocks = availabilityBlocks
    .filter((block) => block.day_of_week === todayIndex)
    .sort(
      (a, b) =>
        parseTimeToMinutes(a.start_time) - parseTimeToMinutes(b.start_time)
    )

  if (todayBlocks.length === 0) return []

  const candidateEvaluations = evaluations
    .filter((evaluation) => {
      const status = getEvaluationStatus(evaluation, now)
      return status === 'en-curso' || status === 'proxima'
    })
    .map((evaluation) => ({
      evaluation,
      score: getPriorityScore(evaluation, now),
      need: getRemainingStudyNeed(evaluation),
      reason: getReason(evaluation),
    }))
    .sort((a, b) => b.score - a.score)

  if (candidateEvaluations.length === 0) return []

  const plans: StudySessionPlan[] = []

  for (const block of todayBlocks) {
    let cursor = parseTimeToMinutes(block.start_time)
    const end = parseTimeToMinutes(block.end_time)

    while (cursor < end && candidateEvaluations.length > 0) {
      candidateEvaluations.sort((a, b) => b.score - a.score)
      const target = candidateEvaluations[0]

      const remainingBlock = end - cursor
      if (remainingBlock < 20) break

      const sessionMinutes = Math.min(
        remainingBlock,
        Math.max(25, Math.min(60, target.need))
      )

      const startTime = minutesToTime(cursor)
      const endTime = minutesToTime(cursor + sessionMinutes)

      plans.push({
        evaluationId: target.evaluation.id,
        subject: target.evaluation.subject,
        label: formatEvaluationLabel(target.evaluation),
        startTime,
        endTime,
        minutes: sessionMinutes,
        reason: target.reason,
        priorityScore: target.score,
      })

      cursor += sessionMinutes
      target.need -= sessionMinutes

      if (target.need <= 15) {
        candidateEvaluations.shift()
      } else {
        target.score = Math.max(1, target.score - 8)
      }

      if (cursor + 10 <= end) {
        cursor += 10
      }
    }
  }

  return plans
}