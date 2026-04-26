export type StudyRisk = 'bajo' | 'medio' | 'alto' | 'critico'

export type StudyBlock = {
  type: 'focus' | 'break' | 'review'
  minutes: number
  label: string
  description: string
}

export function generateStudySession(input: {
  risk: StudyRisk
  score?: number | null
  weakTopics?: string[]
}) {
  const weakTopics = input.weakTopics ?? []

  if (input.risk === 'critico' || input.risk === 'alto') {
    return [
      {
        type: 'focus',
        minutes: 18,
        label: 'Bloque intensivo',
        description: `Trabaja primero: ${weakTopics[0] || 'contenido más débil'}.`,
      },
      {
        type: 'break',
        minutes: 4,
        label: 'Pausa breve',
        description: 'Descanso corto para mantener precisión.',
      },
      {
        type: 'focus',
        minutes: 16,
        label: 'Refuerzo dirigido',
        description: 'Repite preguntas falladas y corrige errores.',
      },
      {
        type: 'review',
        minutes: 8,
        label: 'Cierre activo',
        description: 'Resume lo aprendido sin mirar apuntes.',
      },
    ] satisfies StudyBlock[]
  }

  if (input.risk === 'medio') {
    return [
      {
        type: 'focus',
        minutes: 15,
        label: 'Bloque activo',
        description: `Practica ${weakTopics[0] || 'tema principal'}.`,
      },
      {
        type: 'break',
        minutes: 4,
        label: 'Pausa inteligente',
        description: 'Baja carga mental antes del siguiente bloque.',
      },
      {
        type: 'review',
        minutes: 10,
        label: 'Revisión guiada',
        description: 'Detecta patrones de error.',
      },
    ] satisfies StudyBlock[]
  }

  return [
    {
      type: 'focus',
      minutes: 12,
      label: 'Repaso ligero',
      description: 'Practica sin sobrecargarte.',
    },
    {
      type: 'review',
      minutes: 6,
      label: 'Cierre rápido',
      description: 'Revisa una idea clave.',
    },
  ] satisfies StudyBlock[]
}