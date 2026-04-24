import type { AvailabilityBlock } from './availability'
import type { Evaluation } from './evaluations'
import type { SubjectPreset } from './subjects'
import type { WeaknessSummary } from './weakness-engine'
import { rankRiskEvaluations } from './study-risk-engine'
import { safeDate } from '@/lib/utils/date'

export type CoachBlock = {
  day: string
  subject: string
  unit: string
  topic: string
  minutes: number
  reason: string
  priority: number
  evaluationType: string
  evaluationDate: string
}

export type WeeklyStudyCoachPlan = {
  week_key: string
  total_weekly_minutes: number
  blocks: CoachBlock[]
  summary: string
}

export type GeneratedCoachPlan = WeeklyStudyCoachPlan

const DAY_ORDER = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
]

function normalizeDay(day: string) {
  const d = day.toLowerCase()

  if (d.startsWith('lun')) return 'Lunes'
  if (d.startsWith('mar')) return 'Martes'
  if (d.startsWith('mié') || d.startsWith('mie')) return 'Miércoles'
  if (d.startsWith('jue')) return 'Jueves'
  if (d.startsWith('vie')) return 'Viernes'
  if (d.startsWith('sáb') || d.startsWith('sab')) return 'Sábado'
  if (d.startsWith('dom')) return 'Domingo'

  return day
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function diffMinutes(start: string, end: string) {
  return Math.max(0, timeToMinutes(end) - timeToMinutes(start))
}

export function getWeekKey(date = safeDate()) {
  const year = date.getFullYear()
  const firstDay = safeDate(year, 0, 1)
  const days = Math.floor((date.getTime() - firstDay.getTime()) / 86400000)
  const week = Math.ceil((days + firstDay.getDay() + 1) / 7)

  return `${year}-W${String(week).padStart(2, '0')}`
}

function getSubjectUnitForTopic(
  subjectPreset: SubjectPreset | undefined,
  topic: string
) {
  if (!subjectPreset) return 'Unidad general'

  const unit = subjectPreset.units.find((item) =>
    item.topics.some((t) => t.toLowerCase() === topic.toLowerCase())
  )

  return unit?.name || subjectPreset.units[0]?.name || 'Unidad general'
}

export function buildCoachSummaryText(
  blocks: CoachBlock[],
  weeklyHours: number
) {
  if (!blocks.length) {
    return 'No hay suficientes datos para crear un plan. Agrega evaluaciones y disponibilidad.'
  }

  const focus = blocks
    .slice(0, 3)
    .map((item) => `${item.subject} (${item.topic})`)
    .join(', ')

  return `Esta semana conviene priorizar ${focus}. El plan distribuye aproximadamente ${weeklyHours} horas según riesgo, cercanía de evaluaciones, peso y debilidades detectadas.`
}

export function buildStudyCoachPlan(params: {
  evaluations: Evaluation[]
  weaknesses: WeaknessSummary[]
  availability: AvailabilityBlock[]
  subjects: SubjectPreset[]
  weeklyHours: number
}): WeeklyStudyCoachPlan {
  const { evaluations, weaknesses, availability, subjects, weeklyHours } = params

  const ranked = rankRiskEvaluations(evaluations, weaknesses)
  const totalWeeklyMinutes = weeklyHours * 60

  const availableBlocks = availability
    .map((block) => ({
      day: normalizeDay(block.day_of_week),
      start: block.start_time,
      end: block.end_time,
      minutes: diffMinutes(block.start_time, block.end_time),
    }))
    .filter((block) => block.minutes >= 30)
    .sort((a, b) => {
      const dayDiff = DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)

      if (dayDiff !== 0) return dayDiff

      return timeToMinutes(a.start) - timeToMinutes(b.start)
    })

  const blocks: CoachBlock[] = []
  let remainingMinutes = totalWeeklyMinutes

  for (const slot of availableBlocks) {
    if (remainingMinutes <= 0) break
    if (ranked.length === 0) break

    const risk = ranked[blocks.length % ranked.length]
    const subjectPreset = subjects.find((item) => item.name === risk.subject)

    const topic = risk.topic || 'General'
    const unit = getSubjectUnitForTopic(subjectPreset, topic)

    const minutes = Math.min(
      slot.minutes >= 120 ? 90 : slot.minutes >= 90 ? 60 : 45,
      remainingMinutes
    )

    const reasons: string[] = []

    if (risk.daysLeft <= 7) reasons.push('evaluación cercana')
    if (risk.weightBoost >= 20) reasons.push('alto peso')
    if (risk.weaknessBoost >= 20) reasons.push('tema débil')

    blocks.push({
      day: slot.day,
      subject: risk.subject,
      unit,
      topic,
      minutes,
      reason: reasons.join(' · ') || 'repaso estratégico',
      priority: risk.riskScore,
      evaluationType: risk.type || 'Evaluación',
      evaluationDate: risk.start_date,
    })

    remainingMinutes -= minutes
  }

  return {
    week_key: getWeekKey(),
    total_weekly_minutes: totalWeeklyMinutes,
    blocks,
    summary: buildCoachSummaryText(blocks, weeklyHours),
  }
}

export const generateStudyPlan = buildStudyCoachPlan
