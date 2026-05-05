export function generateDailyPlan(input: {
  availableMinutes: number
  level: "bajo" | "medio" | "alto"
}) {
  const plan = []

  if (input.availableMinutes < 30) {
    return [
      { type: "diagnostico", minutes: 10 },
      { type: "practica", minutes: 20 }
    ]
  }

  if (input.availableMinutes < 60) {
    return [
      { type: "diagnostico", minutes: 10 },
      { type: "explicacion", minutes: 20 },
      { type: "practica", minutes: 30 }
    ]
  }

  return [
    { type: "diagnostico", minutes: 10 },
    { type: "explicacion", minutes: 20 },
    { type: "practica", minutes: 30 },
    { type: "simulacion", minutes: 20 }
  ]
}
