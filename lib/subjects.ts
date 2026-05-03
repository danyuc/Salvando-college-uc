export type EvaluationTarget =
  | 'control'
  | 'prueba'
  | 'examen'
  | 'tarea'
  | 'interrogacion'
  | 'poster'
  | 'ensayo'
  | 'presentacion'
  | 'all'

export type PracticeFormat =
  | 'exam'
  | 'summary'
  | 'flashcards'
  | 'quiz'
  | 'development'
  | 'mixed'

export type SubjectStudyMode = string

export type SubjectUnit = {
  id: string
  name: string
  topics: string[]
}

export type SubjectMeta = {
  code: string
  name: string
  color: string
  icon: string
  studyMode?: SubjectStudyMode
  preferredDefaultFormat?: PracticeFormat
  evaluationTargets?: EvaluationTarget[]
  practiceFormats?: PracticeFormat[]
  units?: SubjectUnit[]
}

export type SubjectPreset = SubjectMeta

export const SUBJECT_PRESETS: Record<string, SubjectMeta> = {
  SOL500: {
    code: 'SOL500',
    name: 'Sociología',
    color: '#3b82f6',
    icon: '📘',
    units: [
      {
        id: 'soc-1',
        name: 'Sociología',
        topics: [
          'Imaginación sociológica',
          'Estructura social',
          'Cultura',
          'Instituciones'
        ]
      }
    ],
  },
  MAT1000: {
    code: 'MAT1000',
    name: 'Matemática',
    color: '#10b981',
    icon: '📐',
    units: [
      {
        id: 'mat-i1',
        name: 'Interrogación 1',
        topics: [
          'I1',
          'I2',
          'I3',
          'EXAMEN',
          'Módulo 1: Recta y parábola',
          'Módulo 2: Inecuaciones',
          'Módulo 3: Funciones reales',
          'Módulo 4: Exponenciales y logaritmos',
          'Módulo 5: Trigonometría',
          'Módulo 6: Polinomios',
          'Módulo 7: Sucesiones y sumas',
          'Distancia entre puntos',
          'Intersección con ejes coordenados',
          'Ecuación de la recta',
          'Rectas paralelas y perpendiculares',
          'Sistemas lineales 2x2',
          'Parábola y modelos cuadráticos',
          'Intervalos',
          'Inecuaciones lineales',
          'Inecuaciones cuadráticas',
          'Inecuaciones racionales',
          'Valor absoluto',
          'Dominio',
          'Recorrido',
          'Composición de funciones',
          'Función inversa',
          'Funciones por tramos',
          'Ecuaciones exponenciales',
          'Ecuaciones logarítmicas',
          'Circunferencia unitaria',
          'Radianes',
          'Ángulos notables'
        ]
      }
    ],
  },
  PSI1101: {
    code: 'PSI1101',
    name: 'Psicología',
    color: '#a855f7',
    icon: '🧠',
    units: [
      {
        id: 'psi-1',
        name: 'Psicología',
        topics: [
          'Memoria',
          'Aprendizaje',
          'Conducta',
          'Cognición'
        ]
      }
    ],
  },
  IHI0204: {
    code: 'IHI0204',
    name: 'Historia',
    color: '#f59e0b',
    icon: '📚',
    units: [
      {
        id: 'his-1',
        name: 'Historia',
        topics: [
          'Guerra Fría',
          'Democracia',
          'Descolonización',
          'Liberalismo'
        ]
      }
    ],
  },
  CL0000: {
    code: 'CL0000',
    name: 'Seminario',
    color: '#ef4444',
    icon: '🧪',
  },
}

export const SUBJECT_PRESETS_ARRAY = Object.values(SUBJECT_PRESETS)

// =========================
// CORE
// =========================

export function getSubjectMeta(code: string): SubjectMeta {
  return SUBJECT_PRESETS[code] || {
    code,
    name: code,
    color: '#64748b',
    icon: '📄',
  }
}

export function getSubjectName(code: string) {
  return getSubjectMeta(code).name
}

export function getSubjectColor(code: string) {
  return getSubjectMeta(code).color
}

// =========================
// 🔥 COMPATIBILIDAD TOTAL
// =========================

export function getSubjectColorByCodeOrName(value: string) {
  const found = SUBJECT_PRESETS_ARRAY.find(
    s => s.code === value || s.name === value
  )
  return found?.color || '#64748b'
}

export function getSubjectPreset(code: string) {
  return getSubjectMeta(code)
}


// =========================
// GET SUBJECT TOPICS
// =========================
export function getSubjectTopics(code: string): string[] {
  const subject = SUBJECT_PRESETS[code]

  if (!subject || !subject.units) return []

  return subject.units.flatMap(unit => unit.topics || [])
}
