export type StudentPracticeQuestion = {
  id: string
  prompt: string
  options: [string, string, string, string]
  correctIndex: number
  explanation: string
  feedback?: string
}

export type StudentPracticeContentPack = {
  subject: string
  unit: string
  classTitle: string
  sourceTitle?: string
  questions: StudentPracticeQuestion[]
}

export const STUDENT_PRACTICE_CONTENT_PACKS: StudentPracticeContentPack[] = []

export const FUTURE_PSYCHOLOGY_CONTENT_NOTE =
  "Additional Psychology student practice content should be added only from real class materials."
