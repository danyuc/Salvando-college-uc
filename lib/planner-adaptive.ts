import type { StudySession } from './study-sessions'
import type { StudySessionPlan } from './planner-ai'

export type AdaptivePlannerResult = {
  plan: StudySessionPlan[]
  message: string
}

export function adaptTodayPlan(
  originalPlan: StudySessionPlan[],
  completedSessions: StudySession[]
): AdaptivePlannerResult {
  if (originalPlan.length === 0) {
    return {
      plan: [],
      message: 'Hoy no hay bloques de estudio planificados.',
    }
  }

  const doneIds = new Set(
    completedSessions
      .filter((s) => s.status === 'done')
      .map((s) => `${s.evaluation_id}-${s.planned_start}-${s.planned_end}`)
  )

  const skippedIds = new Set(
    completedSessions
      .filter((s) => s.status === 'skipped')
      .map((s) => `${s.evaluation_id}-${s.planned_start}-${s.planned_end}`)
  )

  const adapted = [...originalPlan].map((session) => {
    const key = `${session.evaluationId}-${session.startTime}-${session.endTime}`

    if (doneIds.has(key)) {
      return {
        ...session,
        reason: `Ya completaste este bloque. Buen trabajo.`,
        priorityScore: Math.max(1, session.priorityScore - 30),
      }
    }

    if (skippedIds.has(key)) {
      return {
        ...session,
        reason: `Este bloque se omitió. Súbelo de prioridad y retómalo lo antes posible.`,
        priorityScore: session.priorityScore + 25,
      }
    }

    return session
  })

  adapted.sort((a, b) => b.priorityScore - a.priorityScore)

  const doneCount = completedSessions.filter((s) => s.status === 'done').length
  const skippedCount = completedSessions.filter((s) => s.status === 'skipped').length

  let message = 'Plan equilibrado para hoy.'

  if (skippedCount > 0) {
    message =
      'Detecté bloques omitidos. Reorganicé el plan para recuperar lo más urgente primero.'
  } else if (doneCount > 0) {
    message =
      'Detecté avance real. Bajé la prioridad de lo ya completado y mantuve el foco en lo pendiente.'
  }

  return {
    plan: adapted,
    message,
  }
}