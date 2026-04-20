import { supabase } from './supabase'

export type UserProfile = {
  id: string
  username: string | null
  career: string | null
  year: number | null
  institutional_email: string | null
  is_onboarded: boolean | null
}

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

export async function upsertMyProfile(profile: UserProfile) {
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