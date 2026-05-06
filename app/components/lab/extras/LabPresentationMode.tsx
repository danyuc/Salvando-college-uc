'use client'

import { useState } from "react"

export default function LabPresentationMode() {
  const [on, setOn] = useState(false)

  return (
    <>
      <button
        onClick={() => setOn(true)}
        className="fixed bottom-6 left-6 z-[9999] rounded-2xl border border-cyan-300/30 bg-cyan-400 px-5 py-3 font-black text-slate-950 shadow-[0_0_45px_rgba(34,211,238,.35)]"
      >
        🎥 Presentar
      </button>

      {on && (
        <div className="fixed inset-0 z-[9998] bg-slate-950/95 p-8 text-white">
          <button
            onClick={() => setOn(false)}
            className="absolute right-6 top-6 rounded-xl bg-white px-4 py-2 font-black text-slate-950"
          >
            Salir
          </button>

          <div className="mx-auto flex h-full max-w-5xl flex-col justify-center">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-cyan-300">
              Laboratorio Ambiental Metro
            </p>
            <h1 className="mt-5 text-6xl font-black leading-none">
              San Joaquín → Plaza Egaña → San Joaquín
            </h1>
            <p className="mt-6 text-2xl leading-relaxed text-slate-300">
              Visualización inmersiva de PM2.5, ruido, humedad, temperatura, ocupación,
              lluvia y condiciones de infraestructura durante un recorrido real en Metro.
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <Card title="Hipótesis" text="Parcialmente rechazada" />
              <Card title="Peak PM2.5" text="84 µg/m³" />
              <Card title="Factor clave" text="Combinación + densidad + ventilación" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Card({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-black">{text}</p>
    </div>
  )
}
