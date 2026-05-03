export type LocalUser = {
  email: string
  username: string
  createdAt: string
}

const KEY = "salvando-local-user"

export function isValidUcEmail(email: string) {
  const clean = email.trim().toLowerCase()
  return (
    clean.endsWith("@uc.cl") ||
    clean.endsWith("@estudiante.uc.cl") ||
    clean.endsWith("@estudiantes.uc.cl")
  )
}

export function getUsernameFromEmail(email: string) {
  return email.trim().toLowerCase().split("@")[0] || "usuario"
}

export function saveLocalUser(email: string) {
  const user: LocalUser = {
    email: email.trim().toLowerCase(),
    username: getUsernameFromEmail(email),
    createdAt: new Date().toISOString(),
  }

  localStorage.setItem(KEY, JSON.stringify(user))
  return user
}

export function getLocalUser(): LocalUser | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearLocalUser() {
  localStorage.removeItem(KEY)
}
