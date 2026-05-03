'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getUsernameFromEmail, isValidUcEmail, saveLocalUser } from "@/lib/local-user"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  function login() {
    setError("")

    if (!isValidUcEmail(email)) {
      setError("Debes ingresar un correo institucional UC válido.")
      return
    }

    saveLocalUser(email)
    router.push("/")
  }

  const preview = email.includes("@") ? getUsernameFromEmail(email) : ""

  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">Salvando College UC</p>
        <h1>Ingresa con tu correo UC</h1>
        <p className="sub">
          Por ahora no enviaremos código de verificación. Tu usuario será el texto antes del arroba.
        </p>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="usuario@uc.cl"
          autoCapitalize="none"
        />

        {preview && <p className="preview">Tu usuario será: <strong>{preview}</strong></p>}
        {error && <p className="error">{error}</p>}

        <button onClick={login}>Entrar</button>
      </section>

      <style jsx>{`
        .page {
          min-height:100vh;
          display:grid;
          place-items:center;
          padding:24px;
          color:white;
          background:
            radial-gradient(circle at 20% 0%, rgba(37,99,235,.35), transparent 34%),
            linear-gradient(180deg,#020617,#0f172a);
        }
        .card {
          width:min(520px,100%);
          padding:32px;
          border-radius:32px;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.14);
          box-shadow:0 30px 90px rgba(0,0,0,.32);
        }
        .eyebrow { color:#93c5fd; font-weight:950; text-transform:uppercase; margin:0; }
        h1 { font-size:42px; letter-spacing:-.05em; margin:10px 0; }
        .sub { color:#cbd5e1; }
        input {
          width:100%;
          min-height:58px;
          border-radius:18px;
          border:1px solid rgba(255,255,255,.14);
          background:rgba(15,23,42,.78);
          color:white;
          padding:0 16px;
          font-size:17px;
          font-weight:900;
          box-sizing:border-box;
        }
        .preview { color:#bbf7d0; }
        .error { color:#fecaca; font-weight:900; }
        button {
          width:100%;
          min-height:56px;
          margin-top:14px;
          border-radius:18px;
          border:0;
          background:linear-gradient(135deg,#2563eb,#7c3aed);
          color:white;
          font-weight:950;
          font-size:16px;
        }
      `}</style>
    </main>
  )
}
