export type Evaluation = {
  name: string
  grade?: number
  weight: number
}

export function calculateFinalGrade(evals: Evaluation[]) {
  let total = 0
  let weightSum = 0

  for (const e of evals) {
    if (typeof e.grade === "number") {
      total += e.grade * e.weight
      weightSum += e.weight
    }
  }

  return weightSum > 0 ? total / weightSum : 0
}

export function missingToTarget(evals: Evaluation[], target = 4) {
  const completed = evals.filter(e => typeof e.grade === "number")
  const pending = evals.filter(e => typeof e.grade !== "number")

  const current = calculateFinalGrade(completed)

  const remainingWeight = pending.reduce((a,b)=>a+b.weight,0)

  if (remainingWeight === 0) return 0

  return (target - current) / remainingWeight
}
