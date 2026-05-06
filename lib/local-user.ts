export type LocalUser = {
  id?: string
  name?: string
  email: string
  username?: string
  college_track?: string
  year?: string
}

const KEY = "salvando-local-user"

export function getUsernameFromEmail(email: string) {
  return email.split("@")[0]?.trim() ?? ""
}

export function isValidUcEmail(email: string) {
  const clean = email.trim().toLowerCase()
  return (
    clean.endsWith("@uc.cl") ||
    clean.endsWith("@estudiante.uc.cl") ||
    clean.endsWith("@estudiantes.uc.cl") ||
    clean.endsWith("@gmail.com")
  )
}

export function saveLocalUser(user: LocalUser) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(user))
}

export function getLocalUser(): LocalUser | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) as LocalUser : null
  } catch {
    return null
  }
}

export function clearLocalUser() {
  if (typeof window === "undefined") return
  localStorage.removeItem(KEY)
}
