import type { Evaluation } from './evaluations'

export type PlannerBlock = {
  evaluationId: string
  day: string
  subject: string
  topic: string
  minutes: number
  startTime: string
  endTime: string
  reason: string
  priority: number
  priorityScore: number
  status?: 'pending' | 'done' | 'missed' | 'adapted'
}

export type StudySessionPlan = PlannerBlock

function getRemainingStudyNeed(evaluation: Evaluation) {
  const estimated =
    typeof (evaluation as any).estimated_minutes === 'number'
      ? (evaluation as any).estimated_minutes
      : 60

  const progress =
    typeof (evaluation as any).study_progress === 'number'
      ? Math.min(100, Math.max(0, (evaluation as any).study_progress))
      : 0

  const remaining = Math.round(estimated * (1 - progress / 100))
  return Math.max(20, remaining)
}

function getUrgencyScore(date?: string | null) {
  if (!date) return 1

  const time = new Date(date).getTime()
  if (Number.isNaN(time)) return 1

  const diff = Math.ceil((time - Date.now()) / 86400000)

  if (diff <= 2) return 10
  if (diff <= 5) return 7
  if (diff <= 10) return 5
  if (diff <= 20) return 3
  return 1
}

function buildReason(evaluation: Evaluation, urgency: number, weight: number) {
  const reasons: string[] = []

  if (urgency >= 8) reasons.push('muy próxima')
  else if (urgency >= 5) reasons.push('cercana')
  else if (urgency >= 3) reasons.push('próxima')

  if (weight >= 40) reasons.push('alto impacto')
  else if (weight >= 20) reasons.push('impacto medio')

  return reasons.join(' · ') || 'seguimiento general'
}

function minutesToEndTime(startTime: string, minutes: number) {
  const [h, m] = startTime.split(':').map(Number)
  const date = new Date()
  date.setHours(h || 9, m || 0, 0, 0)
  date.setMinutes(date.getMinutes() + minutes)

  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`
}

function distributeIntoWeek(
  items: Array<{
    evaluationId: string
    subject: string
    topic: string
    minutes: number
    reason: string
    priority: number
  }>
): PlannerBlock[] {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const startTimes = ['09:00', '11:00', '15:00', '17:00', '19:00']

  return items.map((item, index) => {
    const startTime = startTimes[index % startTimes.length]

    return {
      evaluationId: item.evaluationId,
      day: days[index % days.length],
      subject: item.subject,
      topic: item.topic,
      minutes: item.minutes,
      startTime,
      endTime: minutesToEndTime(startTime, item.minutes),
      reason: item.reason,
      priority: item.priority,
      priorityScore: item.priority,
      status: 'pending',
    }
  })
}

export function buildStudyPlan(evaluations: Evaluation[]): PlannerBlock[] {
  if (!Array.isArray(evaluations) || evaluations.length === 0) return []

  const items = evaluations.map((evaluation, index) => {
    const urgency = getUrgencyScore(evaluation.start_date)
    const weight =
      typeof evaluation.weight_percent === 'number'
        ? evaluation.weight_percent
        : 10

    const minutes = getRemainingStudyNeed(evaluation)
    const priority = urgency * 2 + weight / 10

    return {
      evaluationId: evaluation.id || `evaluation-${index}`,
      subject: evaluation.subject || 'General',
      topic: evaluation.topic || 'General',
      minutes,
      priority,
      reason: buildReason(evaluation, urgency, weight),
    }
  })

  return distributeIntoWeek(items.sort((a, b) => b.priority - a.priority))
}
