export type GeneratedQuestion = {
  id: string
  type:
    | 'multiple-choice'
    | 'true-false'
    | 'flashcards'
    | 'open'
    | 'problem-solving'
  question: string
  options?: string[]
  answer?: string | number | boolean
  explanation?: string
  graph?: string
}

export type RawAdaptiveQuestionInput = {
  id?: string
  type?: GeneratedQuestion['type']
  question: string
  options?: string[]
  answer?: unknown
  explanation?: string
  graph?: string
}

function normalizeAnswer(
  value: unknown
): string | number | boolean | undefined {
  if (
    typeof value === 'object' &&
    value !== null &&
    'correctIndex' in value &&
    typeof (value as { correctIndex?: unknown }).correctIndex === 'number'
  ) {
    return (value as { correctIndex: number }).correctIndex
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'answerIndex' in value &&
    typeof (value as { answerIndex?: unknown }).answerIndex === 'number'
  ) {
    return (value as { answerIndex: number }).answerIndex
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value
  }

  return undefined
}

function normalizeQuestionType(
  type?: RawAdaptiveQuestionInput['type']
): GeneratedQuestion['type'] {
  if (
    type === 'multiple-choice' ||
    type === 'true-false' ||
    type === 'flashcards' ||
    type === 'open' ||
    type === 'problem-solving'
  ) {
    return type
  }

  return 'multiple-choice'
}

function ensureOptions(
  type: GeneratedQuestion['type'],
  options?: string[]
): string[] | undefined {
  if (type === 'true-false') {
    return ['Verdadero', 'Falso']
  }

  if (type === 'multiple-choice') {
    return Array.isArray(options) ? options.slice(0, 4) : []
  }

  if (type === 'flashcards') {
    return Array.isArray(options) ? options : undefined
  }

  return undefined
}

export function generateAdaptiveQuestion(
  input: RawAdaptiveQuestionInput,
  subject: string
): GeneratedQuestion {
  const type = normalizeQuestionType(input.type)

  return {
    id:
      input.id ||
      `generated-${subject}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`,
    type,
    question: input.question,
    options: ensureOptions(type, input.options),
    answer: normalizeAnswer(input.answer),
    explanation: input.explanation,
    graph: input.graph,
  }
}