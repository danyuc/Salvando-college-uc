export function adjustPlan(plan: any[], context: {
  fatigue: number
  errors: number
}) {
  return plan.map(block => {

    // Si está cansado → menos dificultad
    if (context.fatigue > 0.6 && block.type === "practica") {
      return { ...block, difficulty: "easy" }
    }

    // Si tiene muchos errores → más explicación
    if (context.errors > 3 && block.type === "explicacion") {
      return { ...block, minutes: block.minutes + 10 }
    }

    return block
  })
}
