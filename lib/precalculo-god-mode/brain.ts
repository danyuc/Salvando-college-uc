export function analyzeUser(data: any): any {
  const errors = data.errors || []
  const feelings = data.feelings || []

  const weakTopics = []
  const strongTopics = []

  for (const t of data.topics || []) {
    if (t.successRate < 0.6) weakTopics.push(t.name)
    if (t.successRate > 0.85) strongTopics.push(t.name)
  }

  const fatigue =
    feelings.filter((f: string) => f === "dificil").length / (feelings.length || 1)

  const level =
    data.accuracy > 0.8 ? "alto"
    : data.accuracy > 0.5 ? "medio"
    : "bajo"

  return {
    weakTopics,
    strongTopics,
    errorPatterns: errors,
    fatigue,
    level
  }
}
