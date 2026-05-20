"use client"

import { FormEvent, ReactNode, useState } from "react"
import { ACCESS_CODES, ACCESS_STORAGE_KEYS } from "@/lib/access-control"

function hasIpre2Access() {
  if (typeof window === "undefined") return false
  return (
    localStorage.getItem(ACCESS_STORAGE_KEYS.ipre2Teacher) === "true" ||
    localStorage.getItem(ACCESS_STORAGE_KEYS.docenciaReview) === "true"
  )
}

export default function Ipre2AccessGate({ children }: { children: ReactNode }) {
  const [allowed, setAllowed] = useState(() => hasIpre2Access())
  const [code, setCode] = useState("")
  const [error, setError] = useState("")

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = code.trim().toUpperCase()

    if (normalized === ACCESS_CODES.ipre2Teacher) {
      localStorage.setItem(ACCESS_STORAGE_KEYS.ipre2Teacher, "true")
      setAllowed(true)
      return
    }

    if (normalized === ACCESS_CODES.docenciaReview) {
      localStorage.setItem(ACCESS_STORAGE_KEYS.docenciaReview, "true")
      document.cookie = `${ACCESS_STORAGE_KEYS.docenciaReview}=true; path=/; max-age=2592000; SameSite=Lax`
      setAllowed(true)
      return
    }

    setError("Código no reconocido. Verifica con el equipo responsable.")
  }

  if (allowed) return <>{children}</>

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.24),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,.2),transparent_30%),linear-gradient(135deg,#020617,#0f172a)] px-6 py-12 text-white">
      <form onSubmit={submit} className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.08] p-8 shadow-2xl backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-300">Explora IPRE2</p>
        <h1 className="mt-4 text-4xl font-black">Acceso institucional</h1>
        <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">
          Ingresa tu código institucional para abrir la línea educativa.
        </p>
        <input
          value={code}
          onChange={(event) => {
            setCode(event.target.value)
            setError("")
          }}
          placeholder="Código institucional"
          className="mt-6 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 font-bold text-white outline-none placeholder:text-slate-500"
        />
        <button className="mt-4 w-full rounded-2xl bg-cyan-300 px-5 py-4 font-black text-slate-950">
          Entrar
        </button>
        <p className="mt-4 text-xs font-semibold text-slate-400">
          Solicita tu código al equipo responsable.
        </p>
        {error ? <p className="mt-4 rounded-2xl bg-red-500/15 p-3 text-sm font-bold text-red-100">{error}</p> : null}
      </form>
    </main>
  )
}
