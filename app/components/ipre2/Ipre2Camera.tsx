"use client"

import { useEffect, useRef, useState } from "react"
import { IPRE2_STORAGE_KEYS } from "@/lib/ipre2"
import Ipre2Shell from "./Ipre2Shell"

type Counts = Record<"A" | "B" | "C" | "D", number>

export default function Ipre2Camera() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [started, setStarted] = useState(false)
  const [error, setError] = useState("")
  const [active, setActive] = useState<keyof Counts>("A")
  const [counts, setCounts] = useState<Counts>({ A: 0, B: 0, C: 0, D: 0 })

  async function startCamera() {
    setError("")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setStarted(true)
    } catch {
      setError("No se pudo abrir la cámara. Revisa permisos del navegador.")
    }
  }

  function update(delta: number) {
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
  }

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  return (
    <Ipre2Shell>
      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-8 lg:grid-cols-[1fr_360px]">
        <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-2xl">
          <div className="relative aspect-[9/16] max-h-[78vh] w-full bg-black md:aspect-video">
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
            {!started ? (
              <div className="absolute inset-0 grid place-items-center bg-slate-950/90 p-6 text-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-300">Cámara móvil</p>
                  <h1 className="mt-4 text-4xl font-black">Conteo de manos</h1>
                  <p className="mt-3 max-w-md text-sm font-semibold leading-7 text-slate-300">
                    La cámara funciona localmente para apoyar el conteo. No identifica estudiantes ni guarda video.
                  </p>
                  <button onClick={startCamera} className="mt-6 rounded-full bg-cyan-300 px-6 py-4 text-sm font-black text-slate-950">
                    Activar cámara
                  </button>
                  {error ? <p className="mt-4 rounded-2xl bg-red-500/15 p-3 text-sm font-bold text-red-100">{error}</p> : null}
                </div>
              </div>
            ) : null}
            <div className="absolute bottom-4 left-4 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm font-black text-white backdrop-blur">
              Alternativa {active}: {counts[active]} manos
            </div>
          </div>
        </article>

        <aside className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.08] p-5 shadow-2xl backdrop-blur-xl">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">Conteo manual oficial</p>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">
              Conteo automático experimental. Para resultados oficiales, confirme o corrija manualmente. No se suben frames ni se graba video.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(["A", "B", "C", "D"] as const).map((letter) => (
              <button key={letter} onClick={() => setActive(letter)} className={`rounded-2xl px-4 py-4 text-xl font-black ${active === letter ? "bg-cyan-300 text-slate-950" : "bg-white/10 text-white"}`}>
                {letter}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => update(-1)} className="rounded-2xl bg-white/10 py-4 font-black">-1</button>
            <button onClick={() => update(1)} className="rounded-2xl bg-white/10 py-4 font-black">+1</button>
            <button onClick={() => update(5)} className="rounded-2xl bg-cyan-300 py-4 font-black text-slate-950">+5</button>
          </div>
          <button onClick={confirm} className="rounded-full bg-white px-5 py-4 text-sm font-black text-slate-950">
            Confirmar conteo
          </button>
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
