import { supabase } from './supabase'

export async function getCurrentUser() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error('GET SESSION ERROR:', error)
    return null
  }

  if (!session?.user) {
    return null
  }

  return session.user
}

export async function signOutCurrentUser() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('SIGN OUT ERROR:', error)
    throw new Error('No se pudo cerrar sesión')
  }
}