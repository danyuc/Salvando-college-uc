"use client"

import { useEffect, useRef, useState } from "react"
import { IPRE2_STORAGE_KEYS } from "@/lib/ipre2"
import Ipre2Shell from "./Ipre2Shell"

type Counts = Record<"A" | "B" | "C" | "D", number>
const alternatives: Array<keyof Counts> = ["A", "B", "C", "D"]

function cameraErrorMessage(error: unknown) {
  if (typeof window !== "undefined" && !navigator.mediaDevices?.getUserMedia) {
    return "Este navegador no soporta acceso a cámara con getUserMedia."
  }
  if (typeof window !== "undefined" && window.location.protocol !== "https:" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "La cámara requiere HTTPS. Usa la versión desplegada en Vercel o localhost para pruebas."
  }
  const name = error instanceof DOMException ? error.name : ""
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Permiso denegado. Habilita la cámara en el navegador para continuar."
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No se encontró una cámara disponible en este dispositivo."
  }
  if (name === "NotReadableError") {
    return "La cámara está ocupada por otra aplicación o no está disponible."
  }
  return "No se pudo abrir la cámara. Revisa permisos, HTTPS y disponibilidad del dispositivo."
}

export default function Ipre2Camera() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [started, setStarted] = useState(false)
  const [error, setError] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [active, setActive] = useState<keyof Counts>("A")
  const [counts, setCounts] = useState<Counts>({ A: 0, B: 0, C: 0, D: 0 })

  async function startCamera() {
    setError("")
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(cameraErrorMessage(null))
      return
    }

    try {
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        })
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      }
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setStarted(true)
    } catch (err) {
      setError(cameraErrorMessage(err))
    }
  }

  function update(delta: number) {
    setConfirmed(false)
    setCounts((current) => ({
      ...current,
      [active]: Math.max(0, current[active] + delta),
    }))
  }

  function confirm() {
    localStorage.setItem(IPRE2_STORAGE_KEYS.cameraCounts, JSON.stringify({
      counts,
      active,
      updatedAt: new Date().toISOString(),
      note: "Prototype local. No cross-device sync.",
    }))
    setConfirmed(true)
  }

  function nextAlternative() {
    setActive((current) => alternatives[(alternatives.indexOf(current) + 1) % alternatives.length])
    setConfirmed(false)
  }

  function finishCount() {
    confirm()
    streamRef.current?.getTracks().forEach((track) => track.stop())
    setStarted(false)
  }

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  return (
    <Ipre2Shell>
      <section className="mx-auto grid min-h-[calc(100vh-58px)] max-w-6xl gap-5 px-4 py-5 lg:grid-cols-[1fr_360px]">
        <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-2xl">
          <div className="relative aspect-[9/16] max-h-[82vh] w-full bg-black md:aspect-video">
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
            {!started ? (
              <div className="absolute inset-0 grid place-items-center bg-slate-950/92 p-6 text-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-300">Cámara móvil</p>
                  <h1 className="mt-4 text-[clamp(2.4rem,8vw,4.8rem)] font-black">Conteo de manos</h1>
                  <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-7 text-slate-300">
                    La cámara funciona localmente para apoyar el conteo. No identifica estudiantes, no graba video y no sube frames.
                  </p>
                  <p className="mx-auto mt-3 max-w-md rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3 text-xs font-bold text-amber-100">
                    En teléfono, la cámara requiere HTTPS. Usa la versión desplegada en Vercel o localhost para pruebas.
                  </p>
                  <button onClick={startCamera} className="mt-6 rounded-full bg-cyan-300 px-6 py-4 text-sm font-black text-slate-950">
                    Activar cámara
                  </button>
                  {error ? <p className="mt-4 rounded-2xl bg-red-500/15 p-3 text-sm font-bold text-red-100">{error}</p> : null}
                </div>
              </div>
            ) : null}
            <div className="absolute left-4 top-4 rounded-full border border-emerald-300/20 bg-emerald-300/15 px-4 py-2 text-xs font-black text-emerald-100 backdrop-blur">
              Cámara local · sin grabación · sin reconocimiento facial
            </div>
            <div className="absolute bottom-4 left-4 rounded-2xl border border-white/10 bg-slate-950/80 px-5 py-4 text-xl font-black text-white backdrop-blur">
              Alternativa {active}: {counts[active]} manos
            </div>
          </div>
        </article>

        <aside className="grid content-start gap-4 rounded-[2rem] border border-white/10 bg-white/[0.08] p-5 shadow-2xl backdrop-blur-xl">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">Conteo manual asistido</p>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">
              Conteo automático experimental no activo. Usa conteo manual asistido.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {alternatives.map((letter) => (
              <button key={letter} onClick={() => setActive(letter)} className={`rounded-2xl px-4 py-4 text-xl font-black ${active === letter ? "bg-cyan-300 text-slate-950" : "bg-white/10 text-white"}`}>
                {letter}
              </button>
            ))}
          </div>
          <div className="rounded-3xl bg-slate-950/60 p-5 text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Actual</p>
            <p className="mt-2 text-6xl font-black text-cyan-200">{counts[active]}</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => update(-1)} className="rounded-2xl bg-white/10 py-4 font-black">-1</button>
            <button onClick={() => update(1)} className="rounded-2xl bg-white/10 py-4 font-black">+1</button>
            <button onClick={() => update(5)} className="rounded-2xl bg-cyan-300 py-4 font-black text-slate-950">+5</button>
          </div>
          <button onClick={confirm} className="rounded-full bg-white px-5 py-4 text-sm font-black text-slate-950">
            Confirmar conteo
          </button>
          <button onClick={nextAlternative} className="rounded-full border border-white/15 bg-white/10 px-5 py-4 text-sm font-black text-white">
            Siguiente alternativa
          </button>
          <button onClick={finishCount} className="rounded-full border border-red-300/20 bg-red-500/15 px-5 py-4 text-sm font-black text-red-100">
            Finalizar conteo
          </button>
          {confirmed ? <p className="rounded-2xl bg-emerald-300/10 p-3 text-sm font-black text-emerald-100">Conteo confirmado localmente.</p> : null}
          <div className="grid gap-2">
            {Object.entries(counts).map(([letter, value]) => (
              <div key={letter} className="flex items-center justify-between rounded-2xl bg-slate-950/60 p-3">
                <span className="font-black">{letter}</span>
                <span className="font-black text-cyan-200">{value}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </Ipre2Shell>
  )
}
