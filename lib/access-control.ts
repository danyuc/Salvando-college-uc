import type { LocalUser } from "./local-user"

export type AccessRole =
  | "default_student"
  | "college_ciencias_naturales_matematicas"
  | "docente"
  | "crsh_teacher"
  | "docencia_review"

export type AccessContext = {
  role: AccessRole
  isCollegeCiencias: boolean
  isDocenciaReview: boolean
  isCrshTeacher: boolean
}

export const ACCESS_CODES = {
  docenteLab: "2890",
  crshTeacher: "CRSH",
  docenciaReview: "DOCENCIA-REVIEW",
} as const

export const ACCESS_STORAGE_KEYS = {
  crshTeacher: "cardenal-respira-teacher-access",
  docenciaReview: "salvando-docencia-review-access",
  teacherLab: "teacher-lab-access",
} as const

export const REVIEW_MODE_LABEL = "Modo revisión docente"

function normalize(value: string | null | undefined) {
  return value
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim() ?? ""
}

export function isCollegeCienciasNaturalesMatematicas(user: LocalUser | null) {
  const track = normalize(user?.college_track)
  return (
    track.includes("ciencias naturales") ||
    track.includes("matematicas") ||
    track.includes("matematicas") ||
    track.includes("college de ciencias")
  )
}

export function getClientAccessContext(user: LocalUser | null): AccessContext {
  const isReview =
    typeof window !== "undefined" &&
    localStorage.getItem(ACCESS_STORAGE_KEYS.docenciaReview) === "true"
  const isCrsh =
    typeof window !== "undefined" &&
    localStorage.getItem(ACCESS_STORAGE_KEYS.crshTeacher) === "true"
  const isDocente =
    typeof window !== "undefined" &&
    localStorage.getItem(ACCESS_STORAGE_KEYS.teacherLab) === "true"
  const isCollegeCiencias = isCollegeCienciasNaturalesMatematicas(user)

  if (isReview) {
    return {
      role: "docencia_review",
      isCollegeCiencias,
      isDocenciaReview: true,
      isCrshTeacher: isCrsh,
    }
  }

  if (isCrsh) {
    return {
      role: "crsh_teacher",
      isCollegeCiencias,
      isDocenciaReview: false,
      isCrshTeacher: true,
    }
  }

  if (isDocente) {
    return {
      role: "docente",
      isCollegeCiencias,
      isDocenciaReview: false,
      isCrshTeacher: false,
    }
  }

  if (isCollegeCiencias) {
    return {
      role: "college_ciencias_naturales_matematicas",
      isCollegeCiencias: true,
      isDocenciaReview: false,
      isCrshTeacher: false,
    }
  }

  return {
    role: "default_student",
    isCollegeCiencias: false,
    isDocenciaReview: false,
    isCrshTeacher: false,
  }
}

export function canAccessRoute(pathname: string, context: AccessContext) {
  if (context.isDocenciaReview) return true

  if (
    context.isCollegeCiencias &&
    (pathname === "/practica" || pathname.startsWith("/practica?"))
  ) {
    return false
  }

  return true
}

export function shouldShowNavigationItem(href: string, context: AccessContext) {
  if (context.isDocenciaReview) return true

  if (context.isCollegeCiencias) {
    return [
      "/",
      "/precalculo-full",
      "/calendario",
      "/notas",
      "/cardenal-respira",
    ].includes(href)
  }

  return true
}
