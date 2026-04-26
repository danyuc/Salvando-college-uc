import type { AdaptiveQuestion } from './adaptive-question-engine'

export type ExamMode = 'diagnostico' | 'simulacion_uc' | 'simulacion_paes'

export function buildExamSimulation(input: {
  questions: AdaptiveQuestion[]
  subject: string
  mode: ExamMode
}) {
  const subjectQuestions = input.questions.filter((q) => q.subject === input.subject)

  if (input.mode === 'simulacion_paes') {
    return {
      title: 'Simulación tipo PAES',
      durationMinutes: 65,
      questions: subjectQuestions.slice(0, 30),
      instructions:
        'Responde en condiciones de prueba. No se muestran pistas durante la simulación.',
    }
  }

  if (input.mode === 'simulacion_uc') {
    return {
      title: 'Simulación tipo UC',
      durationMinutes: 45,
      questions: subjectQuestions.slice(0, 20),
      instructions:
        'Simulación académica exigente, enfocada en comprensión y aplicación.',
    }
  }

  return {
    title: 'Diagnóstico inicial',
    durationMinutes: 10,
    questions: subjectQuestions.slice(0, 8),
    instructions:
      'Este diagnóstico ajusta la experiencia de estudio según tus respuestas.',
  }
}