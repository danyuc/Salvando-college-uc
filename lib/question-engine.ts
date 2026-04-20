export type QuestionMode =
  | 'multiple-choice'
  | 'open'
  | 'essay'
  | 'problem-solving'
  | 'flashcards'

export type QuestionEnginePlan = {
  recommendedMode: QuestionMode
  modes: QuestionMode[]
  explanation: string
  prompts: string[]
  difficulty: 'baja' | 'media' | 'alta'
  strategy: string
}

export function getQuestionEngineBySubject(
  subject?: string | null,
  evaluationType?: string | null
): QuestionEnginePlan {
  const normalizedSubject = (subject || '').trim().toLowerCase()
  const normalizedType = (evaluationType || '').trim().toLowerCase()

  const isMathLike =
    normalizedSubject.includes('precálculo') ||
    normalizedSubject.includes('precalculo') ||
    normalizedSubject.includes('calculo') ||
    normalizedSubject.includes('cálculo') ||
    normalizedSubject.includes('álgebra') ||
    normalizedSubject.includes('algebra') ||
    normalizedSubject.includes('matem')

  const isHumanities =
    normalizedSubject.includes('historia') ||
    normalizedSubject.includes('sociología') ||
    normalizedSubject.includes('sociologia') ||
    normalizedSubject.includes('seminario') ||
    normalizedSubject.includes('psicología') ||
    normalizedSubject.includes('psicologia')

  if (isMathLike) {
    return {
      recommendedMode: 'problem-solving',
      modes: ['problem-solving', 'multiple-choice', 'flashcards'],
      explanation:
        'Este ramo conviene practicarlo con resolución paso a paso, ejercicios tipo control y detección de errores frecuentes.',
      prompts: [
        'Explícame el tema paso a paso',
        'Hazme ejercicios tipo control',
        'Pregúntame con alternativas',
        'Muéstrame los errores más comunes',
      ],
      difficulty: 'alta',
      strategy:
        'Prioriza ejercicios, procedimiento completo, revisión de errores y práctica tipo control.',
    }
  }

  if (isHumanities && normalizedType.includes('ensayo')) {
    return {
      recommendedMode: 'essay',
      modes: ['essay', 'open', 'flashcards'],
      explanation:
        'Aquí conviene trabajar ideas clave, estructura de respuesta, argumentación y conceptos centrales.',
      prompts: [
        'Hazme una pregunta de desarrollo',
        'Ayúdame a estructurar una respuesta',
        'Hazme un resumen del tema',
        'Dime los conceptos clave',
      ],
      difficulty: 'media',
      strategy:
        'Prioriza estructura, argumentos, conceptos clave y práctica de redacción.',
    }
  }

  if (isHumanities) {
    return {
      recommendedMode: 'open',
      modes: ['open', 'essay', 'flashcards', 'multiple-choice'],
      explanation:
        'Este ramo conviene reforzarlo con conceptos, análisis breve, preguntas abiertas y repasos rápidos.',
      prompts: [
        'Hazme preguntas abiertas',
        'Hazme un resumen claro',
        'Pregúntame conceptos clave',
        'Dime qué debería memorizar primero',
      ],
      difficulty: 'media',
      strategy:
        'Prioriza comprensión, conceptos centrales, análisis breve y memoria activa.',
    }
  }

  return {
    recommendedMode: 'multiple-choice',
    modes: ['multiple-choice', 'open', 'flashcards'],
    explanation:
      'La práctica ideal combina preguntas breves, comprensión general y repaso rápido de conceptos.',
    prompts: [
      'Hazme preguntas de práctica',
      'Explícame el tema simple',
      'Hazme un resumen corto',
      'Dime qué estudiar primero',
    ],
    difficulty: 'media',
    strategy:
      'Combina repaso general, preguntas cortas y verificación rápida de comprensión.',
  }
}