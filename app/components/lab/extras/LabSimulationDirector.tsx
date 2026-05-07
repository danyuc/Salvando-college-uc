'use client'

import { motion } from "framer-motion"
import { ROUTE_POINTS, pmColor, pmLabel, typeLabel, weatherLabel } from "../data/metroRoute"

export default function LabSimulationDirector({
  index,
  setIndex,
  playing,
  setPlaying,
}: {
  index: number
  setIndex: (n: number) => void
  playing: boolean
  setPlaying: (v: boolean) => void
}) {
  const current = ROUTE_POINTS[index]
  const progress = ((index + 1) / ROUTE_POINTS.length) * 100

  return (
    <section className="mt-8 rounded-[2rem] border border-cyan-300/20 bg-slate-950/80 p-6 shadow-[0_0_80px_rgba(34,211,238,.12)]">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
        Simulación científica interactiva
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black">{current.name}</h2>
          <p className="mt-2 text-slate-300">
            {current.segment} · {current.line} · {typeLabel(current.type)}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setPlaying(!playing)}
            className="rounded-2xl bg-cyan-400 px-5 py-3 font-black text-slate-950"
          >
            {playing ? "⏸ Pausar" : "▶ Simular"}
          </button>

          <button
            onClick={() => setIndex(0)}
            className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-black"
          >
            Reiniciar
          </button>
        </div>
      </div>

      <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-cyan-400"
          animate={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-5">
        <Card title="PM2.5" value={`${current.pm25} µg/m³`} color={pmColor(current.pm25)} />
        <Card title="Estado PM" value={pmLabel(current.pm25)} color={pmColor(current.pm25)} />
        <Card title="Ruido" value={`${current.db} dB`} />
        <Card title="Ocupación" value={`${current.crowd}%`} />
        <Card title="Clima" value={`${weatherLabel(current.weather)}`} />
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm leading-7 text-slate-300">
          {current.observation ||
            current.transitionLabel ||
            "Lectura ambiental del tramo actual según PM2.5, ruido, ocupación, clima, viento y tipo de infraestructura."}
        </p>
      </div>
    </section>
  )
}

function Card({ title, value, color }: { title: string; value: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{title}</p>
      <p className="mt-2 text-xl font-black" style={{ color }}>{value}</p>
    </div>
  )
}
