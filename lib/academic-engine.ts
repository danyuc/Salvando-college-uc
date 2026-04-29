import type { Evaluation } from './evaluations'

export type AcademicRisk = 'critico' | 'alto' | 'medio' | 'bajo' | 'sin-datos'
export type AcademicTrend = 'subiendo' | 'bajando' | 'estable' | 'sin-datos'

export type SubjectAcademicAnalysis = {
  subject: string
  evaluations: Evaluation[]
  completedWeight: number
  remainingWeight: number
  weightedScore: number
  currentAverage: number | null
  projectedFinal: number | null
  neededToPass: number | null
  neededFor50: number | null
  neededFor60: number | null
  neededFor70: number | null
  risk: AcademicRisk
  trend: AcademicTrend
  healthScore: number
  nextEvaluation: Evaluation | null
  daysToNextEvaluation: number | null
  recommendation: string
}

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function getGrade(ev: Evaluation): number | null {
  const raw = ev.grade ?? null
  if (raw === null || raw === undefined) return null

  const grade = Number(raw)
  if (!Number.isFinite(grade)) return null

  return Math.min(Math.max(grade, 1), 7)
}

function getWeight(ev: Evaluation): number {
  const raw = ev.weight_percent ?? 0
  const weight = Number(raw)

  if (!Number.isFinite(weight)) return 0

  // Si viene como 0.2, lo interpreta como 20%
  if (weight > 0 && weight <= 1) return weight * 100

  return Math.min(Math.max(weight, 0), 100)
}

function getDate(ev: Evaluation): string | null {
  return ev.start_date  ?? null
}

export function daysUntil(date?: string | null): number | null {
  if (!date) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const target = new Date(`${date}T00:00:00`)
  if (Number.isNaN(target.getTime())) return null

  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function neededGrade(target: number, weightedScore: number, remainingWeight: number) {
  if (remainingWeight <= 0) return null
  return (target * 100 - weightedScore) / remainingWeight
}

function calculateTrend(items: Evaluation[]): AcademicTrend {
  const graded = items
    .filter((ev) => getGrade(ev) !== null)
    .sort((a, b) => {
      const da = getDate(a) ? new Date(`${getDate(a)}T00:00:00`).getTime() : 0
      const db = getDate(b) ? new Date(`${getDate(b)}T00:00:00`).getTime() : 0
      return da - db
    })

  if (graded.length < 2) return 'sin-datos'

  const first = getGrade(graded[0]) ?? 0
  const last = getGrade(graded[graded.length - 1]) ?? 0

  if (last - first >= 0.4) return 'subiendo'
  if (first - last >= 0.4) return 'bajando'
  return 'estable'
}

function getRisk(input: {
  projectedFinal: number | null
  neededToPass: number | null
  completedWeight: number
  nextDays: number | null
}): AcademicRisk {
  const { projectedFinal, neededToPass, completedWeight, nextDays } = input

  if (completedWeight <= 0 || projectedFinal === null) return 'sin-datos'

  if (projectedFinal < 4 && completedWeight >= 100) return 'critico'
  if (neededToPass !== null && neededToPass > 7) return 'critico'
  if (neededToPass !== null && neededToPass >= 6) return 'alto'
  if (projectedFinal < 4 && nextDays !== null && nextDays <= 7) return 'alto'
  if (neededToPass !== null && neededToPass >= 4.5) return 'medio'
  if (projectedFinal < 5) return 'medio'

  return 'bajo'
}

function getHealthScore(input: {
  currentAverage: number | null
  projectedFinal: number | null
  neededToPass: number | null
  completedWeight: number
}) {
  const { currentAverage, projectedFinal, neededToPass, completedWeight } = input

  if (completedWeight <= 0 || currentAverage === null || projectedFinal === null) {
    return 50
  }

  let score = 50

  score += (currentAverage - 4) * 12
  score += (projectedFinal - 4) * 10

  if (neededToPass !== null) {
    score += (4 - neededToPass) * 8
  }

  if (completedWeight >= 50 && projectedFinal >= 4) {
    score += 8
  }

  return Math.round(Math.min(Math.max(score, 0), 100))
}

function getRecommendation(analysis: {
  subject: string
  risk: AcademicRisk
  trend: AcademicTrend
  neededToPass: number | null
  nextEvaluation: Evaluation | null
  daysToNextEvaluation: number | null
}) {
  const { subject, risk, trend, neededToPass, nextEvaluation, daysToNextEvaluation } = analysis

  if (risk === 'critico') {
    return `Riesgo crítico en ${subject}. Necesitas una acción inmediata: prioriza este ramo antes que los demás.`
  }

  if (risk === 'alto') {
    return `Riesgo alto en ${subject}. ${neededToPass ? `Necesitas cerca de ${neededToPass.toFixed(1)} en lo restante.` : 'Refuerza desde hoy.'}`
  }

  if (daysToNextEvaluation !== null && daysToNextEvaluation <= 5 && nextEvaluation) {
    return `Se acerca ${nextEvaluation.title ?? nextEvaluation.type ?? 'una evaluación'} en ${subject}. Conviene preparar práctica tipo prueba.`
  }

  if (trend === 'bajando') {
    return `Tu tendencia en ${subject} va bajando. Revisa errores anteriores antes de avanzar contenido nuevo.`
  }

  if (risk === 'medio') {
    return `Vas con margen ajustado en ${subject}. Mantén estudio constante y sube la próxima nota.`
  }

  return `Buen estado en ${subject}. Mantén práctica ligera y registra cada evaluación nueva.`
}

export function buildAcademicAnalysis(evaluations: Evaluation[]): SubjectAcademicAnalysis[] {
  const grouped = new Map<string, Evaluation[]>()

  evaluations.forEach((ev) => {
    const subject = ev.subject?.trim() || 'Sin asignatura'

    if (!grouped.has(subject)) grouped.set(subject, [])
    grouped.get(subject)?.push(ev)
  })

  return Array.from(grouped.entries()).map(([subject, items]) => {
    const gradedItems = items.filter((ev) => getGrade(ev) !== null)

    const completedWeight = gradedItems.reduce((acc, ev) => acc + getWeight(ev), 0)

    const weightedScore = gradedItems.reduce((acc, ev) => {
      const grade = getGrade(ev) ?? 0
      const weight = getWeight(ev)
      return acc + grade * weight
    }, 0)

    const remainingWeight = Math.max(100 - completedWeight, 0)

    const currentAverage =
      completedWeight > 0 ? weightedScore / completedWeight : null

    const projectedFinal =
      completedWeight > 0 ? weightedScore / 100 : null

    const upcoming = items
      .filter((ev) => {
        const days = daysUntil(getDate(ev))
        return days !== null && days >= 0
      })
      .sort((a, b) => {
        const da = daysUntil(getDate(a)) ?? Infinity
        const db = daysUntil(getDate(b)) ?? Infinity
        return da - db
      })

    const nextEvaluation = upcoming[0] ?? null
    const daysToNextEvaluation = nextEvaluation
      ? daysUntil(getDate(nextEvaluation))
      : null

    const neededToPass = neededGrade(4, weightedScore, remainingWeight)
    const neededFor50 = neededGrade(5, weightedScore, remainingWeight)
    const neededFor60 = neededGrade(6, weightedScore, remainingWeight)
    const neededFor70 = neededGrade(7, weightedScore, remainingWeight)

    const trend = calculateTrend(items)

    const risk = getRisk({
      projectedFinal,
      neededToPass,
      completedWeight,
      nextDays: daysToNextEvaluation,
    })

    const healthScore = getHealthScore({
      currentAverage,
      projectedFinal,
      neededToPass,
      completedWeight,
    })

    const recommendation = getRecommendation({
      subject,
      risk,
      trend,
      neededToPass,
      nextEvaluation,
      daysToNextEvaluation,
    })

    return {
      subject,
      evaluations: items,
      completedWeight,
      remainingWeight,
      weightedScore,
      currentAverage,
      projectedFinal,
      neededToPass,
      neededFor50,
      neededFor60,
      neededFor70,
      risk,
      trend,
      healthScore,
      nextEvaluation,
      daysToNextEvaluation,
      recommendation,
    }
  })
}