export function generateStudyPlan({
  weakTopics,
  hoursPerWeek,
}: {
  weakTopics: string[]
  hoursPerWeek: number
}) {
  const plan: Record<string, string[]> = {}

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

  weakTopics.forEach((topic, i) => {
    const day = days[i % days.length]

    if (!plan[day]) plan[day] = []

    plan[day].push(topic)
  })

  return plan
}