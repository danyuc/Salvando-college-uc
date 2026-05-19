"use client"

import { FormEvent, useState } from "react"
import { LockKeyhole } from "lucide-react"
import {
  ACCESS_CODES,
  ACCESS_STORAGE_KEYS,
} from "@/lib/access-control"
import CardenalRetos from "./CardenalRetos"

function hasLocalAccess() {
  if (typeof window === "undefined") return false
  return (
    localStorage.getItem(ACCESS_STORAGE_KEYS.crshTeacher) === "true" ||
    localStorage.getItem(ACCESS_STORAGE_KEYS.teacherLab) === "true" ||
    localStorage.getItem(ACCESS_STORAGE_KEYS.docenciaReview) === "true"
  )
}

export default function CardenalRetosGate() {
  const [allowed, setAllowed] = useState(() => hasLocalAccess())
  const [code, setCode] = useState("")
  const [error, setError] = useState("")

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = code.trim().toUpperCase()

    if (normalized === ACCESS_CODES.crshTeacher) {
      localStorage.setItem(ACCESS_STORAGE_KEYS.crshTeacher, "true")
      setAllowed(true)
      return
    }

    if (normalized === ACCESS_CODES.docenteLab) {
      localStorage.setItem(ACCESS_STORAGE_KEYS.teacherLab, "true")
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

  if (allowed) return <CardenalRetos />

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.22),transparent_32%),linear-gradient(135deg,#020617,#0f172a)] px-6 py-12 text-white">
      <section className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.08] p-8 shadow-2xl backdrop-blur-xl">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-cyan-300 text-slate-950">
          <LockKeyhole size={24} />
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.32em] text-cyan-300">Acceso institucional</p>
        <h1 className="mt-3 text-3xl font-black">Retos ambientales docentes</h1>
        <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">
          Ingresa tu código institucional para abrir la experiencia de participación en aula.
        </p>
        <form onSubmit={submit} className="mt-6 grid gap-3">
          <input
            value={code}
            onChange={(event) => {
              setCode(event.target.value)
              setError("")
            }}
            placeholder="Código institucional"
            className="min-h-14 rounded-2xl border border-white/10 bg-slate-950 px-4 text-base font-bold text-white outline-none placeholder:text-slate-500"
          />
          {error ? <p className="rounded-2xl border border-red-300/20 bg-red-500/10 p-3 text-sm font-bold text-red-100">{error}</p> : null}
          <button className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">
            Entrar
          </button>
        </form>
        <p className="mt-4 text-xs font-semibold text-slate-400">
          Solicita tu código al equipo responsable del proyecto.
        </p>
      </section>
    </main>
  )
}
