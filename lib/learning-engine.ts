type Difficulty = "easy" | "medium" | "hard"

type TopicStats = {
  correct: number
  wrong: number
}

const stats: Record<string, TopicStats> = {}

export function registerAnswer(topic: string, correct: boolean) {
  if (!stats[topic]) stats[topic] = { correct: 0, wrong: 0 }

  if (correct) stats[topic].correct++
  else stats[topic].wrong++
}

export function getWeakTopics() {
  return Object.entries(stats)
    .filter(([_, v]) => v.wrong > v.correct)
    .map(([k]) => k)
}

export function getDifficulty(topic: string): Difficulty {
  const s = stats[topic]
  if (!s) return "easy"

  const ratio = s.correct / (s.correct + s.wrong)

  if (ratio > 0.8) return "hard"
  if (ratio > 0.5) return "medium"
  return "easy"
}
