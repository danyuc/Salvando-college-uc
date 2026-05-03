'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getUsernameFromEmail, isValidUcEmail, saveLocalUser } from "@/lib/local-user"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loadingGoogle, setLoadingGoogle] = useState(false)

  async function loginWithGoogle() {
    try {
      setError("")
      setLoadingGoogle(true)

      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      })

      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión con Google")
      setLoadingGoogle(false)
    }
  }

  function continueWithUcEmail() {
    setError("")

    if (!isValidUcEmail(email)) {
      setError("Debes ingresar un correo institucional UC válido.")
      return
    }

    saveLocalUser(email)
    router.push("/onboarding?local=1")
  }

  const preview = email.includes("@") ? getUsernameFromEmail(email) : ""

  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">Salvando College UC</p>
        <h1>Inicia sesión</h1>
        <p className="sub">
          Entra con Google y luego registra tu correo UC. Si el correo de verificación falla, igual podrás continuar con tu correo institucional.
        </p>

        <button className="google" onClick={loginWithGoogle} disabled={loadingGoogle}>
          {loadingGoogle ? "Conectando..." : "Continuar con Google"}
        </button>

        <div className="divider">
          <span />
          <b>o</b>
          <span />
        </div>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="usuario@estudiante.uc.cl"
          autoCapitalize="none"
        />

        {preview && <p className="preview">Tu usuario UC será: <strong>{preview}</strong></p>}
        {error && <p className="error">{error}</p>}

        <button className="primary" onClick={continueWithUcEmail}>
          Continuar con correo UC
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
            radial-gradient(circle at 88% 8%, rgba(124,58,237,.22), transparent 32%),
            linear-gradient(180deg,#020617,#0f172a);
        }

        .card {
          width: min(560px,100%);
          padding: 34px;
          border-radius: 34px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.14);
          box-shadow: 0 30px 90px rgba(0,0,0,.34);
          backdrop-filter: blur(18px);
        }

        .eyebrow {
          color: #93c5fd;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .08em;
          margin: 0;
        }

        h1 {
          font-size: clamp(40px,6vw,60px);
          margin: 10px 0;
          letter-spacing: -.06em;
        }

        .sub {
          color: #cbd5e1;
          line-height: 1.55;
        }

        input {
          width: 100%;
          min-height: 58px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(15,23,42,.78);
          color: white;
          padding: 0 16px;
          font-size: 17px;
          font-weight: 900;
          box-sizing: border-box;
        }

        button {
          width: 100%;
          min-height: 58px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,.14);
          color: white;
          font-weight: 950;
          font-size: 16px;
          cursor: pointer;
        }

        .google {
          margin-top: 18px;
          background: rgba(255,255,255,.10);
        }

        .primary {
          margin-top: 14px;
          background: linear-gradient(135deg,#2563eb,#7c3aed);
        }

        .divider {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 12px;
          margin: 18px 0;
          color: #94a3b8;
        }

        .divider span {
          height: 1px;
          background: rgba(255,255,255,.14);
        }

        .preview {
          color: #bbf7d0;
        }

        .error {
          color: #fecaca;
          font-weight: 900;
        }
      `}</style>
    </main>
  )
}
