'use client'

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function loginWithGoogle() {
    try {
      setLoading(true)
      setError("")

      const redirectTo = `${window.location.origin}/auth/callback`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión con Google")
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl">
        <p className="text-sm font-bold text-blue-300">Salvando College UC</p>
        <h1 className="mt-3 text-3xl font-black">Inicia sesión</h1>
        <p className="mt-3 text-sm text-slate-300">
          Para usar la app debes ingresar obligatoriamente con Google.
        </p>

        <button
          onClick={loginWithGoogle}
          disabled={loading}
          className="mt-8 w-full rounded-2xl bg-white px-5 py-4 font-black text-slate-950 hover:bg-slate-200 disabled:opacity-60"
        >
          {loading ? "Conectando..." : "Continuar con Google"}
        </button>

        {error && (
          <p className="mt-4 rounded-xl bg-red-500/15 p-3 text-sm font-bold text-red-200">
            {error}
          </p>
        )}
      </section>
    </main>
  )
}
