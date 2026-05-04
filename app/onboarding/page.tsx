'use client'

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getUsernameFromEmail, isValidUcEmail, saveLocalUser } from "@/lib/local-user"

const careers = ["College UC", "Ingeniería", "Historia", "Sociología", "Psicología", "Otra"]

export default function OnboardingPage() {
  const router = useRouter()

  const [googleEmail, setGoogleEmail] = useState("")
  const [institutionalEmail, setInstitutionalEmail] = useState("")
  const [career, setCareer] = useState("College UC")
  const [customCareer, setCustomCareer] = useState("")
  const [year, setYear] = useState("1")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const cleanEmail = institutionalEmail.trim().toLowerCase()
  const username = useMemo(() => getUsernameFromEmail(cleanEmail), [cleanEmail])
  const valid = isValidUcEmail(cleanEmail)
  const finalCareer = career === "Otra" ? customCareer.trim() : career

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser()
      const email = data.user?.email || ""
      setGoogleEmail(email)

      if (isValidUcEmail(email)) {
        setInstitutionalEmail(email)
      }
    }

    load()
  }, [])

  async function save() {
    setError("")

    if (!valid) {
      setError("Debes ingresar un correo institucional UC válido.")
      return
    }

    if (!finalCareer) {
      setError("Debes seleccionar tu carrera.")
      return
    }

    setSaving(true)

    try {
      const local = saveLocalUser(cleanEmail)

      const { data } = await supabase.auth.getUser()

      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          username: local.username,
          career: finalCareer,
          year: Number(year),
          institutional_email: cleanEmail,
          institutional_email_verified: true,
          is_onboarded: true,
          updated_at: new Date().toISOString(),
        })
      }

      router.replace("/")
    } catch (err) {
      console.error(err)
      saveLocalUser(cleanEmail)
      router.replace("/")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">Perfil UC obligatorio</p>
        <h1>Completemos tu usuario académico</h1>
        <p className="sub">
          Iniciaste con Google, pero para cargar calendario, notas y práctica debes registrar tu correo institucional UC.
        </p>

        <div className="google">
          <span>Sesión Google</span>
          <strong>{googleEmail || "No detectada"}</strong>
        </div>

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
          <p className={valid ? "ok" : "bad"}>
            {valid ? `Tu usuario será: ${username}` : "Correo UC inválido"}
          </p>
        )}

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

        {error && <p className="bad">{error}</p>}

        <button onClick={save} disabled={saving}>
          {saving ? "Guardando..." : "Guardar perfil UC y entrar"}
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
            radial-gradient(circle at 20% 0%, rgba(37,99,235,.35), transparent 34%),
            linear-gradient(180deg,#020617,#0f172a);
        }

        .card {
          width: min(680px, 100%);
          padding: 34px;
          border-radius: 34px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.14);
          box-shadow: 0 30px 90px rgba(0,0,0,.35);
          display: grid;
          gap: 16px;
        }

        .eyebrow {
          margin: 0;
          color: #93c5fd;
          font-weight: 950;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          font-size: clamp(36px, 6vw, 58px);
          letter-spacing: -.06em;
        }

        .sub {
          color: #cbd5e1;
          line-height: 1.55;
        }

        .google {
          padding: 14px;
          border-radius: 18px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.12);
        }

        .google span {
          display: block;
          color: #94a3b8;
          font-size: 13px;
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
          min-height: 56px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(15,23,42,.78);
          color: white;
          padding: 0 15px;
          font-weight: 900;
          font-size: 16px;
        }

        option {
          color: #0f172a;
        }

        .ok {
          color: #bbf7d0;
          font-weight: 900;
        }

        .bad {
          color: #fecaca;
          font-weight: 900;
        }

        button {
          min-height: 58px;
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
      `}</style>
    </main>
  )
}
