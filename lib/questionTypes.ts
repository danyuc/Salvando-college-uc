export type AnswerOption = 'A' | 'B' | 'C' | 'D'

export type Question = {
  id: string
  pregunta: string
  opciona: string
  opcionb: string
  opcionc: string
  opciond: string
  correcta: string
  explicacion?: string | null
  clase?: string | null
  autor?: string | null
  dificultad?: string | null
  tipo?: string | null
  tema?: string | null
  subtema?: string | null
  tipopregunta?: string | null
}

export function normalizeCorrectAnswer(value: string): AnswerOption {
  const normalized = value?.trim().toUpperCase()

  if (
    normalized === 'A' ||
    normalized === 'B' ||
    normalized === 'C' ||
    normalized === 'D'
  ) {
    return normalized
  }

  return 'A'
}

export function getQuestionOptions(question: Question) {
  return [
    { letter: 'A' as const, text: question.opciona },
    { letter: 'B' as const, text: question.opcionb },
    { letter: 'C' as const, text: question.opcionc },
    { letter: 'D' as const, text: question.opciond },
  ]
}