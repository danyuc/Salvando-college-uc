"use client"

import { FormEvent, useState } from "react"
import { ACCESS_STORAGE_KEYS } from "@/lib/access-control"
import { CARDENAL_RESPIRA_ACCESS_CODE } from "@/lib/cardenal-respira"
import TeacherPanel from "../../components/cardenal-respira/TeacherPanel"

export default function Page() {
  const [allowed, setAllowed] = useState(() =>
    typeof window !== "undefined" &&
    localStorage.getItem(ACCESS_STORAGE_KEYS.crshTeacher) === "true"
  )
  const [code, setCode] = useState("")
  const [error, setError] = useState("")

  function unlock(event: FormEvent) {
    event.preventDefault()
    if (code.trim().toUpperCase() !== CARDENAL_RESPIRA_ACCESS_CODE) {
      setError("Código no reconocido. Verifica con el equipo responsable.")
      return
    }
    localStorage.setItem(ACCESS_STORAGE_KEYS.crshTeacher, "true")
    setAllowed(true)
    setError("")
  }

  if (allowed) return <TeacherPanel />

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-white">
      <form onSubmit={unlock} className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">Cardenal Respira</p>
        <h1 className="mt-4 text-4xl font-black">Acceso docente</h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-300">
          Ingresa tu código institucional para abrir el panel docente local.
        </p>
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Código institucional"
          className="mt-6 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 font-bold outline-none"
        />
        <button className="mt-4 w-full rounded-2xl bg-cyan-300 px-5 py-4 font-black text-slate-950">
          Entrar al panel
        </button>
        {error && <p className="mt-4 rounded-2xl bg-red-500/15 p-3 text-sm font-bold text-red-100">{error}</p>}
      </form>
    </main>
  )
}
