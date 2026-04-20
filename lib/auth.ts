import { supabase } from './supabase'

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:3000',
    },
  })

  if (error) {
    console.error('Error al iniciar sesión con Google:', error)
    throw error
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error al cerrar sesión:', error)
    throw error
  }
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error('Error obteniendo usuario actual:', error)
    throw error
  }

  return user
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error al cerrar sesión:', error)
    throw error
  }
}