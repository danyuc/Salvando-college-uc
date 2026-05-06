'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function loginWithGoogle() {
    setLoading(true)
    const redirectTo = `${window.location.origin}/auth/callback`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    })

    if (error) {
      setError("No se pudo iniciar sesión con Google.")
      setLoading(false)
    }
  }

  function enterTeacher() {
    if (code.trim() !== "2890") {
      setError("Código de acceso inválido.")
      return
    }

    localStorage.setItem("teacher-lab-access", "true")
    router.push("/lab-ambiental?docente=1")
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <section className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-8 backdrop-blur-xl shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
          Salvando College UC
        </p>

        <h1 className="mt-4 text-4xl font-black">Inicia sesión</h1>

        <p className="mt-3 text-sm text-slate-300">
          Si eres estudiante, ingresa con tu cuenta de Google. Si eres docente,
          ingresa el código de acceso a la actividad.
        </p>

        <div className="mt-8">
          <p className="font-black text-white">Estudiantes</p>
          <button
            onClick={loginWithGoogle}
            disabled={loading}
            className="mt-3 w-full rounded-2xl bg-white px-5 py-4 font-black text-slate-950"
          >
            {loading ? "Conectando..." : "Continuar con Google"}
          </button>
        </div>

        <div className="my-8 h-px bg-white/10" />

        <div>
          <p className="font-black text-fuchsia-300">Docentes</p>

          <div className="mt-3 flex gap-3">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Código de acceso"
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 font-bold outline-none"
            />

            <button
              onClick={enterTeacher}
              className="rounded-2xl bg-fuchsia-500 px-5 py-3 font-black text-white"
            >
              Entrar
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-5 rounded-xl bg-red-500/15 p-3 text-sm font-bold text-red-200">
            {error}
          </p>
        )}
      </section>
    </main>
  )
}
