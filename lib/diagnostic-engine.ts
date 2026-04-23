export type DiagnosticStage = 'initial' | 'mid' | 'final'

export type DiagnosticResult = {
  subject: string
  stage: DiagnosticStage
  score: number
  weakTopics: string[]
  strongTopics: string[]
}

export function analyzeDiagnostic(
  answers: Array<{
    topic: string
    correct: boolean
  }>
): Omit<DiagnosticResult, 'subject' | 'stage'> {
  const topicStats: Record<string, { correct: number; total: number }> = {}

  for (const a of answers) {
    if (!topicStats[a.topic]) {
      topicStats[a.topic] = { correct: 0, total: 0 }
    }

    topicStats[a.topic].total++
    if (a.correct) topicStats[a.topic].correct++
  }

  const weakTopics: string[] = []
  const strongTopics: string[] = []

  Object.entries(topicStats).forEach(([topic, stats]) => {
    const percent = stats.correct / stats.total

    if (percent < 0.5) weakTopics.push(topic)
    else if (percent > 0.8) strongTopics.push(topic)
  })

  const totalCorrect = answers.filter(a => a.correct).length
  const score = totalCorrect / answers.length

  return {
    score,
    weakTopics,
    strongTopics,
  }
}