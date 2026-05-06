'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getUsernameFromEmail, saveLocalUser } from "@/lib/local-user"

const colleges = [
  "College Ciencias Sociales",
  "College Ciencias Naturales y Matemáticas 🧮",
  "College Artes y Humanidades",
  "Otro",
]

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [googleEmail, setGoogleEmail] = useState("")
  const [institutionalEmail, setInstitutionalEmail] = useState("")
  const [userId, setUserId] = useState("")
  const [college, setCollege] = useState(colleges[0])
  const [year, setYear] = useState("1")
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) {
        router.replace("/login")
        return
      }

      setUserId(user.id)
      setGoogleEmail(user.email ?? "")

      const { data: profile } = await supabase
        .from("profiles")
        .select("username,institutional_email,college_track,career,year,is_onboarded")
        .eq("id", user.id)
        .maybeSingle()

      if (profile?.is_onboarded) {
        saveLocalUser({
          id: user.id,
          email: profile.institutional_email ?? user.email ?? "",
          username: profile.username ?? getUsernameFromEmail(profile.institutional_email ?? user.email ?? ""),
          college_track: profile.college_track ?? profile.career ?? "",
          year: String(profile.year ?? ""),
        })

        router.replace("/")
        return
      }

      setInstitutionalEmail(profile?.institutional_email ?? "")
      setCollege(profile?.college_track ?? profile?.career ?? colleges[0])
      setYear(String(profile?.year ?? "1"))
      setLoading(false)
    }

    load()
  }, [router])

  async function finishOnboarding() {
    setError("")

    const cleanEmail = institutionalEmail.trim().toLowerCase()

    if (!cleanEmail) {
      setError("Debes ingresar tu correo institucional UC.")
      return
    }

    if (!cleanEmail.endsWith("@uc.cl") && !cleanEmail.endsWith("@estudiante.uc.cl") && !cleanEmail.endsWith("@estudiantes.uc.cl")) {
      setError("Debes usar un correo UC válido.")
      return
    }

    setSaving(true)

    const username = getUsernameFromEmail(cleanEmail)

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      username,
      institutional_email: cleanEmail,
      institutional_email_verified: true,
      college_track: college,
      career: college,
      year,
      is_onboarded: true,
      last_login_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }

    saveLocalUser({
      id: userId,
      email: cleanEmail,
      username,
      college_track: college,
      year,
    })

    router.replace("/")
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white grid place-items-center font-black">
        Revisando perfil guardado...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-10">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl">
        <p className="text-sm font-bold text-blue-300">Perfil UC obligatorio</p>
        <h1 className="mt-3 text-4xl font-black">Completemos tu usuario académico</h1>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-4">
          <p className="text-xs font-bold text-slate-400">Sesión Google</p>
          <p className="mt-1 font-black">{googleEmail}</p>
        </div>

        <label className="mt-5 block text-sm font-black text-slate-300">Correo institucional UC</label>
        <input
          value={institutionalEmail}
          onChange={(e) => setInstitutionalEmail(e.target.value)}
          placeholder="usuario@estudiante.uc.cl"
          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 font-bold text-white outline-none"
        />

        <p className="mt-5 text-sm font-black text-slate-300">College</p>
        <div className="mt-3 grid gap-3">
          {colleges.map((item) => (
            <button
              key={item}
              onClick={() => setCollege(item)}
              className={`rounded-2xl border px-5 py-4 text-left font-black ${
                college === item
                  ? "border-blue-300 bg-blue-400/20 text-white"
                  : "border-white/10 bg-white/10 text-slate-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <label className="mt-5 block text-sm font-black text-slate-300">Año</label>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 font-bold text-white"
        >
          <option value="1">1° año</option>
          <option value="2">2° año</option>
          <option value="3">3° año</option>
          <option value="4">4° año</option>
          <option value="5">5° año o más</option>
        </select>

        {error && (
          <p className="mt-4 rounded-2xl bg-red-500/15 p-4 text-sm font-bold text-red-200">
            {error}
          </p>
        )}

        <button
          onClick={finishOnboarding}
          disabled={saving}
          className="mt-8 w-full rounded-2xl bg-white px-5 py-4 font-black text-slate-950 hover:bg-slate-200 disabled:opacity-60"
        >
          {saving ? "Guardando perfil..." : "Guardar y entrar"}
        </button>
      </section>
    </main>
  )
}
