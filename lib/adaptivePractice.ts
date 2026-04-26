import { Question } from './questions'

export type Difficulty = 'facil' | 'media' | 'alta'

export function getNextDifficulty(mastery: number): Difficulty {
  if (mastery < 50) return 'facil'
  if (mastery < 80) return 'media'
  return 'alta'
}

export function calculateMastery(correct: number, total: number) {
  if (total === 0) return 0
  return Math.round((correct / total) * 100)
}

export function pickNextQuestion({
  questions,
  difficulty,
  seenIds,
}: {
  questions: Question[]
  difficulty: Difficulty
  seenIds: string[]
}) {
  const filtered = questions.filter(
    (q) => q.dificultad === difficulty && !seenIds.includes(q.id)
  )

  if (filtered.length === 0) {
    return questions[Math.floor(Math.random() * questions.length)]
  }

  return filtered[Math.floor(Math.random() * filtered.length)]
}