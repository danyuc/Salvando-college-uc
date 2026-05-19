'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ACCESS_CODES, ACCESS_STORAGE_KEYS } from "@/lib/access-control"
import { saveLocalUser } from "@/lib/local-user"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function loginWithGoogle() {
    setLoading(true)
    setError("")

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

  function enterTeacher(event?: React.FormEvent) {
    event?.preventDefault()

    const cleanCode = code.trim().toUpperCase()

    if (cleanCode === ACCESS_CODES.docenteLab) {
      try {
        localStorage.setItem(ACCESS_STORAGE_KEYS.teacherLab, "true")
        localStorage.setItem("lab-demo-access", "true")
      } catch {}

      window.location.href = "/lab-ambiental?docente=1"
      return
    }

    if (cleanCode === ACCESS_CODES.crshTeacher) {
      try {
        localStorage.setItem(ACCESS_STORAGE_KEYS.crshTeacher, "true")
      } catch {}

      router.push("/cardenal-respira/docentes")
      return
    }

    if (cleanCode === ACCESS_CODES.docenciaReview) {
      try {
        localStorage.setItem(ACCESS_STORAGE_KEYS.docenciaReview, "true")
        document.cookie = `${ACCESS_STORAGE_KEYS.docenciaReview}=true; path=/; max-age=28800; SameSite=Lax`
        saveLocalUser({
          id: "docencia-review-local",
          email: "docencia-review@demo.local",
          username: "Revisión docente",
          college_track: "Modo revisión docente",
          year: "2026",
        })
      } catch {}

      router.push("/")
      return
    }

    setError("Código de acceso inválido.")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <section className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
          Salvando College UC
        </p>

        <h1 className="mt-4 text-4xl font-black">Inicia sesión</h1>

        <p className="mt-3 text-sm leading-6 text-slate-300">
          Si eres estudiante, ingresa con tu cuenta de Google. Si eres docente,
          ingresa el código de acceso a la actividad.
        </p>

        <div className="mt-8">
          <p className="font-black text-white">Estudiantes</p>
          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={loading}
            className="mt-3 w-full rounded-2xl bg-white px-5 py-4 font-black text-slate-950"
          >
            {loading ? "Conectando..." : "Continuar con Google"}
          </button>
        </div>

        <div className="my-8 h-px bg-white/10" />

        <form onSubmit={enterTeacher}>
          <p className="font-black text-fuchsia-300">Docentes y revisión</p>

          <div className="mt-3 grid gap-3 sm:flex">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Código de acceso"
              inputMode="text"
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 font-bold outline-none"
            />

            <button
              type="submit"
              className="rounded-2xl bg-fuchsia-500 px-5 py-3 font-black text-white"
            >
              Entrar
            </button>
          </div>
        </form>

        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-xs font-semibold leading-5 text-slate-400">
          Códigos locales: 2890 mantiene el laboratorio ambiental; CRSH abre Cardenal Respira; DOCENCIA-REVIEW activa revisión demo.
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
