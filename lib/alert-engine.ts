import type { Evaluation } from './evaluations'
import type { SubjectAcademicAnalysis } from './academic-engine'
import { daysUntil } from './academic-engine'

export type AcademicAlertLevel = 'critico' | 'alto' | 'medio' | 'info'

export type AcademicAlert = {
  id: string
  level: AcademicAlertLevel
  subject: string
  title: string
  message: string
  action: string
}

function getDate(ev: Evaluation): string | null {
  return ev.start_date  ?? null
}

function getWeight(ev: Evaluation): number {
  const raw = ev.weight_percent ?? 0
  const weight = Number(raw)

  if (!Number.isFinite(weight)) return 0
  if (weight > 0 && weight <= 1) return weight * 100

  return Math.min(Math.max(weight, 0), 100)
}

export function buildAcademicAlerts(
  analysis: SubjectAcademicAnalysis[]
): AcademicAlert[] {
  const alerts: AcademicAlert[] = []

  analysis.forEach((item) => {
    if (item.risk === 'critico') {
      alerts.push({
        id: `critical-${item.subject}`,
        level: 'critico',
        subject: item.subject,
        title: 'Riesgo crítico de aprobación',
        message:
          item.neededToPass !== null && item.neededToPass > 7
            ? `En ${item.subject}, con las notas registradas necesitarías más de 7.0 para llegar a 4.0.`
            : `En ${item.subject}, tu proyección está bajo el mínimo esperado.`,
        action: 'Revisar evaluaciones, calcular escenario de recuperación y priorizar este ramo.',
      })
    }

    if (item.risk === 'alto') {
      alerts.push({
        id: `high-${item.subject}`,
        level: 'alto',
        subject: item.subject,
        title: 'Riesgo alto',
        message:
          item.neededToPass !== null
            ? `Necesitas aproximadamente ${item.neededToPass.toFixed(1)} en lo que queda de ${item.subject}.`
            : `${item.subject} requiere atención prioritaria.`,
        action: 'Hacer práctica tipo prueba y reforzar errores frecuentes.',
      })
    }

    if (item.trend === 'bajando') {
      alerts.push({
        id: `trend-down-${item.subject}`,
        level: 'medio',
        subject: item.subject,
        title: 'Tendencia descendente',
        message: `Tus resultados en ${item.subject} muestran una baja respecto a evaluaciones anteriores.`,
        action: 'Revisar qué cambió: tiempo de estudio, tipo de prueba o contenidos débiles.',
      })
    }

    if (
      item.nextEvaluation &&
      item.daysToNextEvaluation !== null &&
      item.daysToNextEvaluation <= 5
    ) {
      const weight = getWeight(item.nextEvaluation)

      alerts.push({
        id: `next-${item.subject}-${item.nextEvaluation.id ?? item.daysToNextEvaluation}`,
        level: weight >= 20 ? 'alto' : 'medio',
        subject: item.subject,
        title: 'Evaluación próxima',
        message: `${item.nextEvaluation.title ?? item.nextEvaluation.type ?? 'Evaluación'} es en ${item.daysToNextEvaluation} día(s) y pesa ${weight.toFixed(0)}%.`,
        action: 'Planificar bloques de estudio y resolver práctica antes de la fecha.',
      })
    }

    if (item.completedWeight >= 80 && item.projectedFinal !== null) {
      if (item.projectedFinal >= 4 && item.projectedFinal < 4.5) {
        alerts.push({
          id: `close-pass-${item.subject}`,
          level: 'medio',
          subject: item.subject,
          title: 'Aprobación ajustada',
          message: `${item.subject} está cerca del mínimo. Tu proyección es ${item.projectedFinal.toFixed(2)}.`,
          action: 'No descuidar la última evaluación: puede definir el ramo.',
        })
      }
    }
  })

  return alerts.sort((a, b) => {
    const order: Record<AcademicAlertLevel, number> = {
      critico: 0,
      alto: 1,
      medio: 2,
      info: 3,
    }

    return order[a.level] - order[b.level]
  })
}

export function buildEvaluationCalendarAlerts(
  evaluations: Evaluation[]
): AcademicAlert[] {
  return evaluations
    .map((ev) => {
      const date = getDate(ev)
      const days = daysUntil(date)
      const weight = getWeight(ev)
      const subject = ev.subject ?? 'Sin asignatura'
      const title = ev.title ?? ev.type ?? 'Evaluación'

      if (days === null || days < 0) return null

      if (days <= 3 && weight >= 15) {
        return {
          id: `calendar-critical-${ev.id ?? subject}-${title}`,
          level: 'critico' as const,
          subject,
          title: 'Evaluación urgente',
          message: `${title} es en ${days} día(s) y pesa ${weight.toFixed(0)}%.`,
          action: 'Priorizar este contenido hoy.',
        }
      }

      if (days <= 7) {
        return {
          id: `calendar-medium-${ev.id ?? subject}-${title}`,
          level: weight >= 20 ? ('alto' as const) : ('medio' as const),
          subject,
          title: 'Evaluación cercana',
          message: `${title} se acerca en ${days} día(s).`,
          action: 'Crear resumen activo y hacer práctica corta.',
        }
      }

      return null
    })
    .filter(Boolean) as AcademicAlert[]
}

export function getTopAcademicAlert(
  alerts: AcademicAlert[]
): AcademicAlert | null {
  return alerts[0] ?? null
}