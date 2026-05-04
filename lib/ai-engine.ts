type TopicStats = {
  correct: number
  wrong: number
  speed: number[]
}

const db: Record<string, TopicStats> = {}

export function track(topic: string, correct: boolean, time: number) {
  if (!db[topic]) {
    db[topic] = { correct: 0, wrong: 0, speed: [] }
  }

  if (correct) db[topic].correct++
  else db[topic].wrong++

  db[topic].speed.push(time)
}

export function getWeakTopics() {
  return Object.entries(db)
    .filter(([_, v]) => v.wrong > v.correct)
    .map(([k]) => k)
}

export function getSpeed(topic: string) {
  const s = db[topic]
  if (!s) return 0
  return s.speed.reduce((a,b)=>a+b,0) / s.speed.length
}

export function getLevel(topic: string) {
  const s = db[topic]
  if (!s) return "easy"

  const ratio = s.correct / (s.correct + s.wrong)

  if (ratio > 0.8) return "hard"
  if (ratio > 0.5) return "medium"
  return "easy"
}
