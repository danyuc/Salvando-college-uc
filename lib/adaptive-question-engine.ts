export type Difficulty = 'baja' | 'media' | 'alta'

export type AdaptiveQuestion = {
  id: string
  subject: string
  topic: string
  difficulty: Difficulty
  text: string
  options: string[]
  correct: string
}

export function getNextDifficulty(input: {
  currentDifficulty?: Difficulty
  lastAnswers: boolean[]
  fatigueLevel: 'normal' | 'atencion' | 'fatiga'
}): Difficulty {
  if (input.fatigueLevel === 'fatiga') return 'baja'
  if (input.fatigueLevel === 'atencion') return 'media'

  const recent = input.lastAnswers.slice(-3)
  const correct = recent.filter(Boolean).length

  if (recent.length >= 3 && correct === 3) return 'alta'
  if (recent.length >= 3 && correct <= 1) return 'baja'

  return input.currentDifficulty ?? 'media'
}

export function selectAdaptiveQuestion(input: {
  questions: AdaptiveQuestion[]
  subject: string
  weakTopics?: string[]
  usedQuestionIds: string[]
  difficulty: Difficulty
}): AdaptiveQuestion | null {
  const weakTopics = input.weakTopics ?? []

  const candidates = input.questions.filter((q) => {
    return (
      q.subject === input.subject &&
      q.difficulty === input.difficulty &&
      !input.usedQuestionIds.includes(q.id)
    )
  })

  const weakCandidate = candidates.find((q) => weakTopics.includes(q.topic))
  if (weakCandidate) return weakCandidate

  return candidates[0] ?? null
}