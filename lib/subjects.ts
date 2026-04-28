
// 🔥 TIPOS FALTANTES (compatibilidad total)

export type EvaluationTarget = 'prueba' | 'control' | 'examen' | 'tarea'

export type PracticeFormat =
  | 'multiple_choice'
  | 'true_false'
  | 'development'
  | 'flashcards'

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
  units?: SubjectUnit[]
  studyMode?: SubjectStudyMode
  evaluationTargets?: EvaluationTarget[]
  practiceFormats?: PracticeFormat[]
  preferredDefaultFormat?: string
}

export type SubjectPreset = SubjectMeta

export const SUBJECT_PRESETS: Record<string, SubjectMeta> = {
  SOL500: {
    code: 'SOL500',
    name: 'Sociología',
    color: '#3b82f6',
    icon: '🏛️',
    studyMode: 'mixed',
    preferredDefaultFormat: 'exam',
  },
  MAT1000: {
    code: 'MAT1000',
    name: 'Matemática',
    color: '#10b981',
    icon: '📐',
    studyMode: 'practice',
    preferredDefaultFormat: 'exam',
  },
  PSI1101: {
    code: 'PSI1101',
    name: 'Psicología',
    color: '#a855f7',
    icon: '🧠',
    studyMode: 'mixed',
    preferredDefaultFormat: 'exam',
  },
  IHI0204: {
    code: 'IHI0204',
    name: 'Historia',
    color: '#f59e0b',
    icon: '📜',
    studyMode: 'study',
    preferredDefaultFormat: 'summary',
  },
}

// 🔥 ARRAY PARA UI
export const SUBJECT_PRESETS_ARRAY = Object.values(SUBJECT_PRESETS)

// 🔥 CORE
export function getSubjectMeta(code: string): SubjectMeta {
  return SUBJECT_PRESETS[code] || {
    code,
    name: code,
    color: '#64748b',
    icon: '📄',
  }
}

// 🔥 COMPATIBILIDAD TOTAL

export function getSubjectName(code: string) {
  return getSubjectMeta(code).name
}

export function getSubjectColor(code: string) {
  return getSubjectMeta(code).color
}

export function getSubjectColorByCodeOrName(input: string) {
  const match =
    SUBJECT_PRESETS[input] ||
    SUBJECT_PRESETS_ARRAY.find(
      (s) => s.name.toLowerCase() === input.toLowerCase()
    )

  return match?.color || '#64748b'
}

export function getSubjectPreset(code: string) {
  return getSubjectMeta(code)
}

export function getSubjectTopics(code: string): string[] {
  const meta = getSubjectMeta(code)
  if (!meta.units) return []
  return meta.units.flatMap((u) => u.topics || [])
}
