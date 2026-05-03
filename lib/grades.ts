import type { Evaluation } from "./evaluations"
import { calculateCompletedWeight, calculateWeightedAverage } from "./grade-calculator"

export type SubjectGradeSummary = {
  subject: string
  average: number | null
  completedCount: number
  pendingCount: number
  totalWeight: number
  status: "sin-notas" | "bien" | "medio" | "riesgo"
}

export function buildSubjectGradeSummaries(
  evaluations: Evaluation[]
): SubjectGradeSummary[] {
  const grouped = new Map<string, Evaluation[]>()

  for (const evaluation of evaluations) {
    const key = evaluation.subject || "Sin ramo"
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(evaluation)
  }

  const result: SubjectGradeSummary[] = []

  for (const [subject, items] of grouped.entries()) {
    const average = calculateWeightedAverage(items)
    const graded = items.filter(
      (item) =>
        typeof item.grade === "number" &&
        Number.isFinite(item.grade) &&
        item.grade >= 1 &&
        item.grade <= 7
    )

    let status: SubjectGradeSummary["status"] = "sin-notas"

    if (average !== null) {
      if (average >= 5.5) status = "bien"
      else if (average >= 4.0) status = "medio"
      else status = "riesgo"
    }

    result.push({
      subject,
      average,
      completedCount: graded.length,
      pendingCount: items.length - graded.length,
      totalWeight: calculateCompletedWeight(items),
      status,
    })
  }

  return result.sort((a, b) => a.subject.localeCompare(b.subject))
}
