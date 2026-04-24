import { buildGradePredictions } from './grade-prediction'
import type { Evaluation } from './evaluations'

export type StudyPlan = {
  subject: string
  hours: number
  priority: number
  reason: string
}

export function buildSmartStudyPlan(
  evaluations: Evaluation[],
  weeklyHours = 35
): StudyPlan[] {
  const predictions = buildGradePredictions({ evaluations })

  const subjectMap = new Map<string, number>()

  for (const ev of evaluations) {
    const pred = predictions.find(p => p.subject === ev.subject)
    if (!pred) continue

    let score = 0

    // 🔴 RIESGO (LO MÁS IMPORTANTE)
    const predictedGrade =
      (pred as any).predictedGrade ??
      (pred as any).predicted_grade ??
      (pred as any).finalGrade ??
      (pred as any).final_grade ??
      (pred as any).grade ??
      5

    const riskLevel =
      predictedGrade < 4
        ? 'alto'
        : predictedGrade < 5
        ? 'medio'
        : 'bajo'

    if (riskLevel === 'alto') score += 5
    else if (riskLevel === 'medio') score += 3
    else score += 1

    // ⏰ CERCANÍA
    const days =
      (new Date(ev.start_date).getTime() - Date.now()) / 86400000

    if (days < 3) score += 5
    else if (days < 7) score += 3
    else if (days < 14) score += 1

    // 📊 PESO
    score += (ev.weight_percent || 0) / 10

    subjectMap.set(ev.subject, (subjectMap.get(ev.subject) || 0) + score)
  }

  const totalScore = [...subjectMap.values()].reduce((a, b) => a + b, 0)

  const plan: StudyPlan[] = []

  for (const [subject, score] of subjectMap.entries()) {
    const proportion = totalScore ? score / totalScore : 0
    const hours = Math.round(proportion * weeklyHours)

    const pred = predictions.find(p => p.subject === subject)

    plan.push({
      subject,
      hours,
      priority: score,
      reason: `Riesgo: ${riskLevel} | Ajuste automático`,
    })
  }

  return plan.sort((a, b) => b.hours - a.hours)
}