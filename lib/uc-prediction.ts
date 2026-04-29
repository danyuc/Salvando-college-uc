export function predictFinalGrade(evals: any[]) {
  const valid = evals.filter(e => e.grade != null)

  const totalWeight = valid.reduce((s, e) => s + (e.weight_percent || 0), 0)
  const weightedSum = valid.reduce(
    (s, e) => s + (e.grade * (e.weight_percent || 0)),
    0
  )

  const current = totalWeight > 0 ? weightedSum / totalWeight : 0

  const remaining = 100 - totalWeight

  return {
    currentAverage: current,
    remainingWeight: remaining,
  }
}

export function requiredGradeToPass(current: number, remaining: number, target = 4.0) {
  if (remaining <= 0) return 0

  return (target * 100 - current * (100 - remaining)) / remaining
}
