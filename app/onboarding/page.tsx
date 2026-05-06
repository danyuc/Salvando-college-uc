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
  const [email, setEmail] = useState("")
  const [userId, setUserId] = useState("")
  const [college, setCollege] = useState(colleges[0])
  const [year, setYear] = useState("1")

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) {
        router.replace("/login")
        return
      }

      const userEmail = user.email ?? ""
      setEmail(userEmail)
      setUserId(user.id)

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_onboarded,college_track,year,institutional_email,username")
        .eq("id", user.id)
        .maybeSingle()

      if (profile?.is_onboarded) {
        saveLocalUser({
          id: user.id,
          email: profile.institutional_email ?? userEmail,
          username: profile.username ?? getUsernameFromEmail(userEmail),
          college_track: profile.college_track ?? "",
          year: String(profile.year ?? ""),
        })

        router.replace("/")
        return
      }

      setLoading(false)
    }

    load()
  }, [router])

  async function finishOnboarding() {
    setSaving(true)

    const username = getUsernameFromEmail(email)

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      username,
      institutional_email: email,
      institutional_email_verified: true,
      college_track: college,
      career: college,
      year,
      is_onboarded: true,
      last_login_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      alert(error.message)
      setSaving(false)
      return
    }

    saveLocalUser({
      id: userId,
      email,
      username,
      college_track: college,
      year,
    })

    router.replace("/")
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white grid place-items-center font-black">
        Preparando tu perfil...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl">
        <p className="text-sm font-bold text-blue-300">Onboarding</p>
        <h1 className="mt-3 text-3xl font-black">Selecciona tu College</h1>
        <p className="mt-3 text-sm text-slate-300">
          Sesión activa con: <b>{email}</b>
        </p>

        <div className="mt-6 grid gap-3">
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

        <label className="mt-6 block text-sm font-black text-slate-300">
          Año
        </label>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="mt-2 w-full rounded-2xl bg-slate-900 px-4 py-3 font-bold text-white"
        >
          <option value="1">1° año</option>
          <option value="2">2° año</option>
          <option value="3">3° año</option>
          <option value="4">4° año</option>
          <option value="5">5° año o más</option>
        </select>

        <button
          onClick={finishOnboarding}
          disabled={saving}
          className="mt-8 w-full rounded-2xl bg-white px-5 py-4 font-black text-slate-950 hover:bg-slate-200 disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Entrar a Salvando College UC"}
        </button>
      </section>
    </main>
  )
}
