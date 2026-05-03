export type SubjectCode = "MAT1000" | "PSI1101" | "SOL500" | "CLG0000" | "IHI0204"

export const SUBJECT_THEMES: Record<SubjectCode, {
  name: string
  short: string
  icon: string
  color: string
  accent: string
  gradient: string
}> = {
  MAT1000: {
    name: "Precálculo",
    short: "MAT1000",
    icon: "📐",
    color: "#22c55e",
    accent: "rgba(34,197,94,.22)",
    gradient: "linear-gradient(135deg, rgba(34,197,94,.32), rgba(14,165,233,.16))",
  },
  PSI1101: {
    name: "Psicología",
    short: "PSI1101",
    icon: "🧠",
    color: "#a855f7",
    accent: "rgba(168,85,247,.22)",
    gradient: "linear-gradient(135deg, rgba(168,85,247,.34), rgba(59,130,246,.14))",
  },
  SOL500: {
    name: "Sociología",
    short: "SOL500",
    icon: "🌎",
    color: "#38bdf8",
    accent: "rgba(56,189,248,.22)",
    gradient: "linear-gradient(135deg, rgba(56,189,248,.32), rgba(16,185,129,.14))",
  },
  CLG0000: {
    name: "Seminario",
    short: "CLG0000",
    icon: "🌫️",
    color: "#f43f5e",
    accent: "rgba(244,63,94,.22)",
    gradient: "linear-gradient(135deg, rgba(244,63,94,.32), rgba(251,191,36,.12))",
  },
  IHI0204: {
    name: "Historia",
    short: "IHI0204",
    icon: "📜",
    color: "#f59e0b",
    accent: "rgba(245,158,11,.22)",
    gradient: "linear-gradient(135deg, rgba(245,158,11,.32), rgba(244,63,94,.12))",
  },
}

export type AcademicEvent = {
  id: string
  subjectCode: SubjectCode
  title: string
  type: "interrogacion" | "examen" | "control" | "prueba" | "perusall" | "tarea" | "trabajo" | "ensayo" | "actividad"
  date: string
  time?: string
  weight: number
  unit: string
  practiceEvaluation?: "I1" | "I2" | "I3" | "EXAMEN"
  requiresDiagnostic?: boolean
  mode?: string
}

export const ACADEMIC_EVENTS: AcademicEvent[] = [
  { id: "mat-i1", subjectCode: "MAT1000", title: "Interrogación 1", type: "interrogacion", date: "2026-04-15", time: "17:30-19:30", weight: 21, unit: "Módulos 1 y 2", practiceEvaluation: "I1", requiresDiagnostic: true, mode: "Presencial" },
  { id: "mat-i2", subjectCode: "MAT1000", title: "Interrogación 2", type: "interrogacion", date: "2026-05-07", time: "17:30-19:30", weight: 21, unit: "Módulos 3 y 4", practiceEvaluation: "I2", requiresDiagnostic: true, mode: "Presencial" },
  { id: "mat-i3", subjectCode: "MAT1000", title: "Interrogación 3", type: "interrogacion", date: "2026-06-04", time: "17:30-19:30", weight: 21, unit: "Módulo 5", practiceEvaluation: "I3", requiresDiagnostic: true, mode: "Presencial" },
  { id: "mat-ex", subjectCode: "MAT1000", title: "Examen", type: "examen", date: "2026-07-03", time: "13:40-15:40", weight: 30, unit: "Módulos 1 al 7", practiceEvaluation: "EXAMEN", requiresDiagnostic: true, mode: "Presencial" },

  { id: "mat-c1", subjectCode: "MAT1000", title: "Control 1", type: "control", date: "2026-03-27", time: "Canvas · 60 min", weight: 1, unit: "Módulo 1", practiceEvaluation: "I1", mode: "Online · 3 intentos" },
  { id: "mat-c2", subjectCode: "MAT1000", title: "Control 2", type: "control", date: "2026-04-10", time: "Canvas · 60 min", weight: 1, unit: "Módulo 2", practiceEvaluation: "I1", mode: "Online · 3 intentos" },
  { id: "mat-c3", subjectCode: "MAT1000", title: "Control 3", type: "control", date: "2026-04-24", time: "Canvas · 60 min", weight: 1, unit: "Módulo 3", practiceEvaluation: "I2", mode: "Online · 3 intentos" },
  { id: "mat-c4", subjectCode: "MAT1000", title: "Control 4", type: "control", date: "2026-05-08", time: "Canvas · 60 min", weight: 1, unit: "Módulo 4", practiceEvaluation: "I2", mode: "Online · 3 intentos" },
  { id: "mat-c5", subjectCode: "MAT1000", title: "Control 5", type: "control", date: "2026-06-05", time: "Canvas · 60 min", weight: 1, unit: "Módulo 5", practiceEvaluation: "I3", mode: "Online · 3 intentos" },
  { id: "mat-c6", subjectCode: "MAT1000", title: "Control 6", type: "control", date: "2026-06-19", time: "Canvas · 60 min", weight: 1, unit: "Módulo 6", practiceEvaluation: "EXAMEN", mode: "Online · 3 intentos" },
  { id: "mat-c7", subjectCode: "MAT1000", title: "Control 7", type: "control", date: "2026-07-03", time: "Canvas · 60 min", weight: 1, unit: "Módulo 7", practiceEvaluation: "EXAMEN", mode: "Online · 3 intentos" },

  { id: "psi-p1", subjectCode: "PSI1101", title: "Prueba 1", type: "prueba", date: "2026-04-14", weight: 23.333, unit: "Clases y lecturas 0, 1, 2 y 3" },
  { id: "psi-p2", subjectCode: "PSI1101", title: "Prueba 2", type: "prueba", date: "2026-05-26", weight: 23.333, unit: "Clases y lecturas no evaluadas en Prueba 1" },
  { id: "psi-p3", subjectCode: "PSI1101", title: "Prueba 3", type: "prueba", date: "2026-06-30", weight: 23.334, unit: "Clases y lecturas no evaluadas en Prueba 1 y 2" },

  { id: "psi-per-1", subjectCode: "PSI1101", title: "Perusall 1", type: "perusall", date: "2026-03-19", time: "15:00", weight: 3, unit: "Lilienfeld cap. 3" },
  { id: "psi-per-2", subjectCode: "PSI1101", title: "Perusall 2", type: "perusall", date: "2026-03-27", time: "15:00", weight: 3, unit: "Lilienfeld cap. 4" },
  { id: "psi-per-3", subjectCode: "PSI1101", title: "Perusall 3", type: "perusall", date: "2026-04-07", time: "15:00", weight: 3, unit: "Atención · opcional" },
  { id: "psi-per-4", subjectCode: "PSI1101", title: "Perusall 4", type: "perusall", date: "2026-04-16", time: "15:00", weight: 3, unit: "Gray cap. 9" },
  { id: "psi-per-5", subjectCode: "PSI1101", title: "Perusall 5", type: "perusall", date: "2026-04-23", time: "15:00", weight: 3, unit: "Feldman cap. 5" },
  { id: "psi-per-6", subjectCode: "PSI1101", title: "Perusall 6", type: "perusall", date: "2026-04-30", time: "15:00", weight: 3, unit: "Gray cap. 10" },
  { id: "psi-per-7", subjectCode: "PSI1101", title: "Perusall 7", type: "perusall", date: "2026-05-07", time: "15:00", weight: 3, unit: "Feldman cap. 7" },
  { id: "psi-per-8", subjectCode: "PSI1101", title: "Perusall 8", type: "perusall", date: "2026-05-28", time: "15:00", weight: 3, unit: "Feldman cap. 8" },
  { id: "psi-per-9", subjectCode: "PSI1101", title: "Perusall 9", type: "perusall", date: "2026-06-04", time: "15:00", weight: 3, unit: "Lilienfeld cap. 12" },
  { id: "psi-per-10", subjectCode: "PSI1101", title: "Perusall 10", type: "perusall", date: "2026-06-11", time: "15:00", weight: 3, unit: "Feldman cap. 14" },

  { id: "sol-p1", subjectCode: "SOL500", title: "Prueba 1", type: "prueba", date: "2026-04-29", time: "Módulo 3", weight: 22.5, unit: "Unidades 1 y 2" },
  { id: "sol-p2", subjectCode: "SOL500", title: "Prueba 2", type: "prueba", date: "2026-06-12", time: "Módulo 3", weight: 22.5, unit: "Unidad 3" },
  { id: "sol-trabajo", subjectCode: "SOL500", title: "Tarea grupal domiciliaria", type: "trabajo", date: "2026-06-19", time: "18:00", weight: 15, unit: "Entrevista + podcast" },

  { id: "clg-prueba", subjectCode: "CLG0000", title: "Prueba contenidos", type: "prueba", date: "2026-04-10", weight: 20, unit: "Unidad 1" },
  { id: "clg-biblio", subjectCode: "CLG0000", title: "Bibliografía académica y gestor", type: "actividad", date: "2026-05-06", time: "23:59", weight: 5, unit: "Actividad evaluada" },
  { id: "clg-ensayo", subjectCode: "CLG0000", title: "Ensayo / columna", type: "ensayo", date: "2026-05-15", weight: 20, unit: "Perspectiva interdisciplinaria" },
  { id: "clg-poster", subjectCode: "CLG0000", title: "Poster de investigación", type: "trabajo", date: "2026-06-22", weight: 40, unit: "Trabajo final" },

  { id: "ihi-c1", subjectCode: "IHI0204", title: "Control lectura I", type: "control", date: "2026-04-08", weight: 16.67, unit: "Crisis modernidad/eurocentrismo" },
  { id: "ihi-t1", subjectCode: "IHI0204", title: "Taller fuentes I", type: "actividad", date: "2026-04-29", weight: 12.5, unit: "Totalitarismo y descolonización" },
  { id: "ihi-c2", subjectCode: "IHI0204", title: "Control lectura II", type: "control", date: "2026-05-27", weight: 16.67, unit: "Guerra Fría y bienestar" },
  { id: "ihi-t2", subjectCode: "IHI0204", title: "Taller fuentes II", type: "actividad", date: "2026-06-15", weight: 12.5, unit: "Era de la revolución" },
  { id: "ihi-c3", subjectCode: "IHI0204", title: "Control lectura III", type: "control", date: "2026-06-24", weight: 16.66, unit: "Fin Guerra Fría / nuevo orden" },
]

export function daysUntil(date: string) {
  const today = new Date()
  const target = new Date(`${date}T12:00:00`)
  today.setHours(0,0,0,0)
  target.setHours(0,0,0,0)
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

export function getRisk(event: AcademicEvent) {
  const days = daysUntil(event.date)
  if (days < 0) return "pasada"
  if (days <= 3 && event.weight >= 15) return "alto"
  if (days <= 7) return "urgente"
  if (days <= 14) return "activo"
  return "estable"
}
