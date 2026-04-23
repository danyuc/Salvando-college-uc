// ============================================
// TIPOS
// ============================================

export type TopicWeakness = {
  subject: string
  topic: string
  total: number
  correct: number
  accuracy: number
}

export type WeaknessSummary = {
  subject: string
  topic: string
  accuracy: number
  weaknessLevel: 'alta' | 'media' | 'baja'
  recommendation: string
}

// ============================================
// FUNCION PRINCIPAL
// ============================================

export function buildWeaknessesByTopic(
  attempts: {
    subject: string
    topic: string
    is_correct: boolean
  }[]
): WeaknessSummary[] {
  const map = new Map<string, TopicWeakness>()

  for (const attempt of attempts) {
    const key = `${attempt.subject}::${attempt.topic}`

    if (!map.has(key)) {
      map.set(key, {
        subject: attempt.subject,
        topic: attempt.topic,
        total: 0,
        correct: 0,
        accuracy: 0,
      })
    }

    const item = map.get(key)!

    item.total += 1
    if (attempt.is_correct) item.correct += 1
  }

  const results: WeaknessSummary[] = []

  for (const item of map.values()) {
    const accuracy =
      item.total > 0 ? item.correct / item.total : 0

    let weaknessLevel: 'alta' | 'media' | 'baja' = 'baja'

    if (accuracy < 0.5) {
      weaknessLevel = 'alta'
    } else if (accuracy < 0.75) {
      weaknessLevel = 'media'
    }

    results.push({
      subject: item.subject,
      topic: item.topic,
      accuracy,
      weaknessLevel,
      recommendation: buildRecommendation(item.topic, weaknessLevel),
    })
  }

  return results.sort((a, b) => a.accuracy - b.accuracy)
}

// ============================================
// RECOMENDACIONES IA
// ============================================

function buildRecommendation(
  topic: string,
  level: 'alta' | 'media' | 'baja'
) {
  if (level === 'alta') {
    return `Debes reforzar urgentemente ${topic}. Practica ejercicios básicos y revisa teoría.`
  }

  if (level === 'media') {
    return `Tienes fallos en ${topic}. Practica ejercicios intermedios.`
  }

  return `Buen dominio en ${topic}. Mantén práctica.`
}