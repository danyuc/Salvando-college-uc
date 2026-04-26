export type FatigueSignal = {
  questionId: string
  isCorrect: boolean
  responseTimeSeconds: number
}

export type FatigueLevel = 'normal' | 'atencion' | 'fatiga'

export function detectFatigue(signals: FatigueSignal[]): {
  level: FatigueLevel
  message: string
  shouldSuggestPause: boolean
} {
  if (signals.length < 4) {
    return {
      level: 'normal',
      message: 'Ritmo estable.',
      shouldSuggestPause: false,
    }
  }

  const recent = signals.slice(-5)
  const wrongCount = recent.filter((s) => !s.isCorrect).length
  const avgTime =
    recent.reduce((sum, s) => sum + s.responseTimeSeconds, 0) / recent.length

  if (wrongCount >= 4 || avgTime >= 55) {
    return {
      level: 'fatiga',
      message: 'Tu precisión bajó. La app ajustará el ritmo.',
      shouldSuggestPause: true,
    }
  }

  if (wrongCount >= 3 || avgTime >= 40) {
    return {
      level: 'atencion',
      message: 'Ritmo exigente. Bajaremos un poco la dificultad.',
      shouldSuggestPause: false,
    }
  }

  return {
    level: 'normal',
    message: 'Buen ritmo. Puedes seguir.',
    shouldSuggestPause: false,
  }
}