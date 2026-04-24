import { supabase } from './supabase'

/**
 * 🔥 MODELO COMPLETO DE PERFIL (alineado con onboarding + verificación)
 */
export type UserProfile = {
  id: string

  // básicos
  username: string | null
  career: string | null
  year: number | null

  // correo institucional
  institutional_email: string | null
  institutional_email_verified: boolean | null

  // onboarding
  is_onboarded: boolean | null

  // 🔥 opcional (para escalar después sin romper)
  created_at?: string | null
  updated_at?: string | null
}

/**
 * 🔍 Obtener perfil del usuario
 */
export async function getMyProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Error obteniendo perfil:', error)
    throw error
  }

  return data as UserProfile | null
}

/**
 * 💾 Guardar o actualizar perfil
 * (Partial para evitar errores de TypeScript)
 */
export async function upsertMyProfile(profile: Partial<UserProfile>) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile)
    .select()
    .single()

  if (error) {
    console.error('Error guardando perfil:', error)
    throw error
  }

  return data as UserProfile
}

/**
 * 🔥 Helper PRO: saber si el usuario está listo para usar la app
 */
export function isProfileReady(profile: UserProfile | null) {
  if (!profile) return false

  return (
    !!profile.username &&
    !!profile.career &&
    !!profile.year &&
    !!profile.institutional_email &&
    profile.institutional_email_verified === true &&
    profile.is_onboarded === true
  )
}