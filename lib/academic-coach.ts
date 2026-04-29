import type { Evaluation } from './evaluations'

function getEvaluationDate(evaluation: Evaluation): string | null {
  return evaluation.start_date ?? null
}

function getEvaluationWeight(evaluation: Evaluation): number {
  return Number(evaluation.weight_percent ?? 0)
}

export function daysUntil(date?: string | null) {
  if (!date) return Infinity

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const target = new Date(`${date}T00:00:00`)
  const diff = target.getTime() - today.getTime()

  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getRiskLevel(evaluation: Evaluation) {
  const date = getEvaluationDate(evaluation)
  const days = daysUntil(date)
  const weight = getEvaluationWeight(evaluation)

  if (days < 0) return 'pasada'
  if (days <= 3 && weight >= 15) return 'alto'
  if (days <= 7 && weight >= 15) return 'medio'
  if (days <= 14) return 'medio'
  return 'bajo'
}

export function getPriorityText(evaluation: Evaluation) {
  const date = getEvaluationDate(evaluation)
  const days = daysUntil(date)
  const risk = getRiskLevel(evaluation)
  const weight = getEvaluationWeight(evaluation)

  if (risk === 'alto') {
    return `Urgente: ${evaluation.title ?? evaluation.type} es en ${days} día(s) y pesa ${weight.toFixed(0)}%.`
  }

  if (risk === 'medio') {
    return `Prioridad media: ${evaluation.title ?? evaluation.type} se acerca y conviene estudiar desde ahora.`
  }

  if (risk === 'pasada') {
    return `${evaluation.title ?? evaluation.type} ya pasó.`
  }

  return `Baja urgencia: todavía hay tiempo para preparar ${evaluation.title ?? evaluation.type}.`
}

export function generateWeeklyCoach(evaluations: Evaluation[]) {
  const upcoming = evaluations
    .filter((e) => daysUntil(getEvaluationDate(e)) >= 0)
    .sort(
      (a, b) =>
        daysUntil(getEvaluationDate(a)) - daysUntil(getEvaluationDate(b))
    )

  const main = upcoming[0]

  if (!main) {
    return {
      title: 'Semana de mantención',
      description:
        'No tienes evaluaciones próximas registradas. Haz práctica ligera y repasa contenidos anteriores.',
      tasks: [
        'Repasar apuntes de la semana',
        'Resolver 10 preguntas de práctica',
        'Actualizar calendario académico',
      ],
    }
  }

  const risk = getRiskLevel(main)
  const content = main.topic || main.notes || main.title || 'temario asociado'

  return {
    title: `Foco semanal: ${main.subject} · ${main.title ?? main.type}`,
    description: getPriorityText(main),
    tasks:
      risk === 'alto'
        ? [
            `Estudiar contenidos clave: ${content}`,
            'Resolver práctica tipo prueba',
            'Revisar errores y repetir preguntas falladas',
            'Preparar resumen de fórmulas/conceptos',
          ]
        : [
            `Leer o repasar: ${content}`,
            'Hacer práctica corta de 20 minutos',
            'Crear resumen activo',
          ],
  }
}

export function getPracticeTopic(evaluations: Evaluation[]) {
  const next = evaluations
    .filter((e) => daysUntil(getEvaluationDate(e)) >= 0)
    .sort(
      (a, b) =>
        daysUntil(getEvaluationDate(a)) - daysUntil(getEvaluationDate(b))
    )[0]

  if (!next) {
    return {
      subject: 'General',
      topic: 'Repaso general',
      reason: 'No hay evaluaciones próximas registradas.',
    }
  }

  return {
    subject: next.subject,
    topic: next.topic || next.title || next.type,
    reason: getPriorityText(next),
  }
}