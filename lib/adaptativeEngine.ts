import type { Question } from './questions'

export type Difficulty = 'facil' | 'media' | 'alta'

export function calcAccuracy(correct: number, total: number) {
  if (total === 0) return 0
  return Math.round((correct / total) * 100)
}

export function nextDifficulty(accuracy: number): Difficulty {
  if (accuracy < 50) return 'facil'
  if (accuracy < 80) return 'media'
  return 'alta'
}

export function pickQuestion({
  questions,
  seen,
  difficulty,
  weakTopics,
}: {
  questions: Question[]
  seen: string[]
  difficulty: Difficulty
  weakTopics: string[]
}) {
  const pool = questions.filter(q => !seen.includes(q.id))

  if (pool.length === 0) return null

  const weak = pool.filter(q =>
    weakTopics.includes(q.tema) && q.dificultad === difficulty
  )

  if (weak.length > 0) {
    return weak[Math.floor(Math.random() * weak.length)]
  }

  const sameDifficulty = pool.filter(q => q.dificultad === difficulty)

  if (sameDifficulty.length > 0) {
    return sameDifficulty[Math.floor(Math.random() * sameDifficulty.length)]
  }

  return pool[Math.floor(Math.random() * pool.length)]
}