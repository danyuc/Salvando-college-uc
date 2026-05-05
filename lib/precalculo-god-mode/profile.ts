export type UserProfile = {
  weakTopics: string[]
  strongTopics: string[]
  errorPatterns: string[]
  level: "bajo" | "medio" | "alto"
  fatigue: number
}
