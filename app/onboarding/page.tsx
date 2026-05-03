'use client'

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getUsernameFromEmail, isValidUcEmail, saveLocalUser } from "@/lib/local-user"

const careers = [
  "College UC",
  "Ingeniería",
  "Historia",
  "Sociología",
  "Psicología",
  "Otra",
]

export default function OnboardingPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [googleEmail, setGoogleEmail] = useState("")
  const [institutionalEmail, setInstitutionalEmail] = useState("")
  const [career, setCareer] = useState("College UC")
  const [customCareer, setCustomCareer] = useState("")
  const [year, setYear] = useState("1")

  const cleanEmail = institutionalEmail.trim().toLowerCase()
  const username = useMemo(() => getUsernameFromEmail(cleanEmail), [cleanEmail])
  const finalCareer = career === "Otra" ? customCareer.trim() : career
  const isValid = isValidUcEmail(cleanEmail)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser()
      const email = data.user?.email || ""
      setGoogleEmail(email)

      if (email && isValidUcEmail(email)) {
        setInstitutionalEmail(email)
      }

      setLoading(false)
    }

    load()
  }, [])

  async function save() {
    setError("")

    if (!isValid) {
      setError("Debes ingresar un correo UC válido.")
      return
    }

    if (!finalCareer) {
      setError("Debes seleccionar o escribir tu carrera.")
      return
    }

    setSaving(true)

    try {
      saveLocalUser(cleanEmail)

      const { data } = await supabase.auth.getUser()
      const user = data.user

      if (user) {
        await supabase.from("profiles").upsert({
          id: user.id,
          username,
          career: finalCareer,
          year: Number(year),
          institutional_email: cleanEmail,
          institutional_email_verified: true,
          is_onboarded: true,
          updated_at: new Date().toISOString(),
        })
      }

      router.push("/")
    } catch (err) {
      console.error(err)
      saveLocalUser(cleanEmail)
      router.push("/")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="page">
        <section className="card">Cargando...</section>
      </main>
    )
  }

  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">Bienvenido</p>
        <h1>Completemos tu perfil</h1>
        <p className="sub">
          Tu sesión puede venir de Google, pero tu usuario académico se arma con tu correo UC.
        </p>

        <div className="googleBox">
          <small>Sesión Google</small>
          <strong>{googleEmail || "Sin correo Google detectado"}</strong>
        </div>

        <label>
          Carrera
          <select value={career} onChange={(e) => setCareer(e.target.value)}>
            {careers.map(c => <option key={c}>{c}</option>)}
          </select>
        </label>

        {career === "Otra" && (
          <label>
            Escribe tu carrera
            <input value={customCareer} onChange={(e) => setCustomCareer(e.target.value)} />
          </label>
        )}

        <label>
          Año
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="1">1° año</option>
            <option value="2">2° año</option>
            <option value="3">3° año</option>
            <option value="4">4° año</option>
            <option value="5">5° año</option>
            <option value="6">6° año</option>
          </select>
        </label>

        <label>
          Correo institucional UC
          <input
            value={institutionalEmail}
            onChange={(e) => setInstitutionalEmail(e.target.value)}
            placeholder="usuario@estudiante.uc.cl"
            autoCapitalize="none"
          />
        </label>

        {cleanEmail && (
          <p className={isValid ? "ok" : "bad"}>
            {isValid ? `Usuario UC: ${username}` : "Correo UC no válido"}
          </p>
        )}

        {error && <p className="bad">{error}</p>}

        <button onClick={save} disabled={saving}>
          {saving ? "Guardando..." : "Guardar y continuar"}
        </button>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 24px;
          color: white;
          background:
            radial-gradient(circle at 18% 0%, rgba(37,99,235,.34), transparent 34%),
            linear-gradient(180deg,#020617,#0f172a);
        }

        .card {
          width: min(720px,100%);
          padding: 32px;
          border-radius: 32px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.14);
          box-shadow: 0 30px 90px rgba(0,0,0,.34);
          display: grid;
          gap: 16px;
        }

        .eyebrow {
          color: #93c5fd;
          font-weight: 950;
          text-transform: uppercase;
          margin: 0;
        }

        h1 {
          font-size: clamp(34px,5vw,52px);
          margin: 0;
          letter-spacing: -.05em;
        }

        .sub {
          color: #cbd5e1;
        }

        .googleBox {
          padding: 14px;
          border-radius: 18px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.12);
        }

        .googleBox small {
          display: block;
          color: #94a3b8;
          margin-bottom: 4px;
        }

        label {
          display: grid;
          gap: 8px;
          color: #cbd5e1;
          font-weight: 900;
        }

        input,
        select {
          min-height: 54px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(15,23,42,.82);
          color: white;
          padding: 0 14px;
          font-weight: 900;
        }

        option {
          color: #0f172a;
        }

        button {
          min-height: 56px;
          border-radius: 18px;
          border: none;
          background: linear-gradient(135deg,#2563eb,#7c3aed);
          color: white;
          font-weight: 950;
          font-size: 16px;
          cursor: pointer;
        }

        button:disabled {
          opacity: .6;
        }

        .ok {
          color: #bbf7d0;
          font-weight: 900;
        }

        .bad {
          color: #fecaca;
          font-weight: 900;
        }
      `}</style>
    </main>
  )
}
