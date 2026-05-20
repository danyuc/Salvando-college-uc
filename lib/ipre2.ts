import { CARDENAL_RESPIRA_DASHBOARD_URL } from "./cardenal-respira"

export type Ipre2QuestionDifficulty = "easy" | "regular" | "hard"

export type Ipre2Question = {
  id: string
  prompt: string
  options: [string, string, string, string]
  correctIndex: number
  explanation: string
  difficulty: Ipre2QuestionDifficulty
}

export type Ipre2Module = {
  id: string
  title: string
  objective: string
  capsule: string
  keyConcepts: string[]
  teacherScript: string[]
  suggestedQuestions: string[]
  expectedDifficulties: string[]
  closingActivity: string
  questionCount: number
  questions: Ipre2Question[]
  bonusQuestions: Record<Ipre2QuestionDifficulty, Ipre2Question>
}

export type Ipre2CourseProgress = {
  institutionName: string
  schoolName: string
  courseName: string
  currentModule: string
  completedModules: string[]
  totalPoints: number
  lastSessionDate: string
  lastScore: number
  streak: number
  badges: string[]
}

export const IPRE2_STORAGE_KEYS = {
  progress: "ipre2-course-progress",
  selectedCourse: "ipre2-selected-course",
  cameraCounts: "ipre2-camera-counts",
} as const

export const IPRE2_SENSOR_71_DASHBOARD_URL = CARDENAL_RESPIRA_DASHBOARD_URL

export const IPRE2_SCORING = {
  questionPoints: 250,
  standardQuestionCount: 5,
  excellentThreshold: 2000,
  passThreshold: 1000,
} as const

export const IPRE2_DEMO_COURSES = [
  { institutionName: "College", schoolName: "College UC", courseName: "College · Curso A" },
  { institutionName: "College", schoolName: "College UC", courseName: "College · Curso B" },
  { institutionName: "College", schoolName: "College UC", courseName: "College · Curso C" },
] as const

export const IPRE2_MODULES: Ipre2Module[] = [
  {
    id: "module-1-pm25",
    title: "¿Qué es PM2.5 y por qué importa observarlo?",
    objective:
      "Comprender que PM2.5 se refiere a partículas finas suspendidas en el aire y que observar datos ambientales ayuda a formular preguntas, interpretar el entorno y tomar decisiones educativas.",
    capsule:
      "PM2.5 son partículas muy pequeñas suspendidas en el aire. No siempre se ven, por eso un sensor permite transformar algo invisible en datos para observar, comparar y conversar en clase.",
    keyConcepts: [
      "PM2.5 como partículas finas suspendidas en el aire.",
      "Diferencia entre observar datos y diagnosticar salud.",
      "Transparencia entre datos live, demo y manuales.",
      "Sensor 71 como disparador de preguntas educativas.",
    ],
    teacherScript: [
      "Hoy no vamos a memorizar una definición: vamos a mirar cómo un dato ambiental puede abrir una pregunta.",
      "Cuando veamos PM2.5, pensemos en partículas finas que pueden estar en suspensión aunque no las veamos.",
      "El objetivo es observar el entorno, comparar momentos y aprender a leer datos con cuidado.",
    ],
    suggestedQuestions: [
      "¿Qué cosas del entorno podrían cambiar una lectura ambiental?",
      "¿Por qué es importante saber si un dato es live, demo o manual?",
      "¿Qué decisión educativa podría tomar un curso a partir de un semáforo ambiental?",
    ],
    expectedDifficulties: [
      "Confundir un dato ambiental con un diagnóstico médico.",
      "Pensar que si algo no se ve, no se puede medir.",
      "No distinguir entre dato real, demostrativo y manual.",
    ],
    closingActivity:
      "El curso escribe una pregunta investigable sobre el aire del entorno escolar y propone una forma de observarla con datos.",
    questionCount: 5,
    questions: [
      {
        id: "pm25-q1",
        prompt: "¿Qué mide principalmente PM2.5?",
        options: ["Partículas finas suspendidas en el aire", "Temperatura del suelo", "Cantidad de estudiantes", "Velocidad de internet"],
        correctIndex: 0,
        explanation: "PM2.5 se refiere a partículas muy pequeñas suspendidas en el aire. En clase sirve para observar calidad del aire del entorno.",
        difficulty: "easy",
      },
      {
        id: "pm25-q2",
        prompt: "¿Por qué PM2.5 puede ser difícil de percibir a simple vista?",
        options: ["Porque siempre tiene color azul", "Porque son partículas muy pequeñas", "Porque solo aparece de noche", "Porque no existe en ciudades"],
        correctIndex: 1,
        explanation: "Al ser partículas muy pequeñas, no siempre son visibles. Los sensores ayudan a observarlas como datos.",
        difficulty: "easy",
      },
      {
        id: "pm25-q3",
        prompt: "¿Qué ayuda a hacer un sensor ambiental en una clase?",
        options: ["Observar datos del entorno y formular preguntas", "Reemplazar al profesor", "Identificar estudiantes por nombre", "Cambiar notas automáticamente"],
        correctIndex: 0,
        explanation: "El sensor es una herramienta educativa: convierte condiciones del entorno en datos que el curso puede interpretar.",
        difficulty: "regular",
      },
      {
        id: "pm25-q4",
        prompt: "¿Por qué debemos distinguir entre datos LIVE, DEMO y MANUAL?",
        options: ["Para no confundir una simulación con una medición real", "Para que el panel tenga más colores", "Para ocultar información", "Para evitar hacer preguntas"],
        correctIndex: 0,
        explanation: "La transparencia evita conclusiones equivocadas: una medición live, una demostración y un dato manual no significan lo mismo.",
        difficulty: "regular",
      },
      {
        id: "pm25-q5",
        prompt: "Si el semáforo ambiental cambia durante el día, ¿qué acción educativa tiene sentido?",
        options: ["Ignorar el dato", "Comparar horario, ventilación y entorno", "Cancelar toda actividad escolar sin conversar", "Usarlo para castigar al curso"],
        correctIndex: 1,
        explanation: "Un cambio en el semáforo puede abrir una conversación sobre horarios, ventilación, entorno urbano y lectura crítica de datos.",
        difficulty: "regular",
      },
    ],
    bonusQuestions: {
      easy: {
        id: "pm25-bonus-easy",
        prompt: "Pregunta obligatoria: PM2.5 se refiere a...",
        options: ["Partículas finas en el aire", "Notas de una prueba", "Color del sensor", "Ruido de internet"],
        correctIndex: 0,
        explanation: "PM2.5 son partículas finas suspendidas en el aire.",
        difficulty: "easy",
      },
      regular: {
        id: "pm25-bonus-regular",
        prompt: "Si una lectura es manual, ¿cómo debería presentarse al curso?",
        options: ["Como dato manual", "Como medición live segura", "Como diagnóstico médico", "Sin etiqueta"],
        correctIndex: 0,
        explanation: "Los datos manuales deben etiquetarse claramente para mantener transparencia.",
        difficulty: "regular",
      },
      hard: {
        id: "pm25-bonus-hard",
        prompt: "¿Cuál es la mejor pregunta investigable después de observar PM2.5?",
        options: ["¿Cómo cambia entre mañana y tarde y qué condiciones podrían influir?", "¿Cuál es el color favorito del sensor?", "¿Quién ganó el recreo?", "¿Cuántas sillas hay en la sala?"],
        correctIndex: 0,
        explanation: "Una buena pregunta conecta el dato con tiempo, condiciones observables e interpretación del entorno.",
        difficulty: "hard",
      },
    },
  },
]

export function createDefaultProgress(courseName = "College · Curso A"): Ipre2CourseProgress {
  return {
    institutionName: "College",
    schoolName: "College UC",
    courseName,
    currentModule: IPRE2_MODULES[0].id,
    completedModules: [],
    totalPoints: 0,
    lastSessionDate: "",
    lastScore: 0,
    streak: 0,
    badges: [],
  }
}

export function getScoreMessage(score: number) {
  if (score < IPRE2_SCORING.passThreshold) {
    return "ALERTA: pregunta obligatoria. Esta pregunta lo decide todo."
  }
  if (score < IPRE2_SCORING.excellentThreshold) {
    return "Buen avance. Hay comprensión, pero todavía falta reforzar."
  }
  return "Excelente puntuación. Pasamos a la siguiente unidad."
}

export function getBonusDifficulty(score: number): Ipre2QuestionDifficulty {
  if (score < IPRE2_SCORING.passThreshold) return "easy"
  if (score < IPRE2_SCORING.excellentThreshold) return "regular"
  return "hard"
}
