export type Evaluation = {
  id?: string
  subject: string
  title: string
  type: string
  date: string
  weight: number
  contents?: string | null
  start_time?: string | null
  end_time?: string | null
}

export function daysUntil(date: string) {
  const today = new Date()
  const target = new Date(`${date}T00:00:00`)
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getRiskLevel(evaluation: Evaluation) {
  const days = daysUntil(evaluation.date)
  const weight = Number(evaluation.weight || 0)

  if (days < 0) return 'pasada'
  if (days <= 3 && weight >= 0.15) return 'alto'
  if (days <= 7 && weight >= 0.15) return 'medio'
  if (days <= 14) return 'medio'
  return 'bajo'
}

export function getPriorityText(evaluation: Evaluation) {
  const days = daysUntil(evaluation.date)
  const risk = getRiskLevel(evaluation)

  if (risk === 'alto') {
    return `Urgente: ${evaluation.title} es en ${days} día(s) y pesa ${(evaluation.weight * 100).toFixed(0)}%.`
  }

  if (risk === 'medio') {
    return `Prioridad media: ${evaluation.title} se acerca y conviene estudiar desde ahora.`
  }

  if (risk === 'pasada') {
    return `${evaluation.title} ya pasó.`
  }

  return `Baja urgencia: todavía hay tiempo para preparar ${evaluation.title}.`
}

export function generateWeeklyCoach(evaluations: Evaluation[]) {
  const upcoming = evaluations
    .filter((e) => daysUntil(e.date) >= 0)
    .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))

  const main = upcoming[0]

  if (!main) {
    return {
      title: 'Semana de mantención',
      description: 'No tienes evaluaciones próximas registradas. Haz práctica ligera y repasa contenidos anteriores.',
      tasks: [
        'Repasar apuntes de la semana',
        'Resolver 10 preguntas de práctica',
        'Actualizar calendario académico',
      ],
    }
  }

  const risk = getRiskLevel(main)

  return {
    title: `Foco semanal: ${main.subject} · ${main.title}`,
    description: getPriorityText(main),
    tasks:
      risk === 'alto'
        ? [
            `Estudiar contenidos clave: ${main.contents || 'temario asociado'}`,
            'Resolver práctica tipo prueba',
            'Revisar errores y repetir preguntas falladas',
            'Preparar resumen de fórmulas/conceptos',
          ]
        : [
            `Leer o repasar: ${main.contents || 'contenidos próximos'}`,
            'Hacer práctica corta de 20 minutos',
            'Crear resumen activo',
          ],
  }
}

export function getPracticeTopic(evaluations: Evaluation[]) {
  const next = evaluations
    .filter((e) => daysUntil(e.date) >= 0)
    .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))[0]

  if (!next) {
    return {
      subject: 'General',
      topic: 'Repaso general',
      reason: 'No hay evaluaciones próximas registradas.',
    }
  }

  return {
    subject: next.subject,
    topic: next.contents || next.title,
    reason: getPriorityText(next),
  }
}