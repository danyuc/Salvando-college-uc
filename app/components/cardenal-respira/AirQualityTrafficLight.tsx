"use client"

import { motion } from "framer-motion"
import { AIR_QUALITY_THRESHOLDS, type AirQualityDemoPoint } from "@/lib/cardenal-respira"

const colors = {
  green: "bg-emerald-400 text-emerald-950 shadow-emerald-400/30",
  yellow: "bg-yellow-300 text-yellow-950 shadow-yellow-300/30",
  orange: "bg-orange-400 text-orange-950 shadow-orange-400/30",
  red: "bg-red-500 text-white shadow-red-500/30",
  purple: "bg-purple-600 text-white shadow-purple-600/30",
}

export default function AirQualityTrafficLight({ point }: { point: AirQualityDemoPoint }) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 text-white shadow-2xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
            Semáforo educativo
          </p>
          <h3 className="mt-2 text-2xl font-black">{point.status}</h3>
        </div>
        <motion.div
          className={`grid h-16 w-16 place-items-center rounded-full shadow-2xl ${colors[point.color]}`}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          {point.pm25}
        </motion.div>
      </div>

      <p className="mt-4 text-sm font-semibold leading-6 text-slate-300">
        Tal día hubo condición <strong className="text-white">{point.status.toLowerCase()}</strong>; esto abre una conversación pedagógica sobre ventilación, horarios y entorno urbano.
      </p>

      <div className="mt-5 grid gap-2">
        {AIR_QUALITY_THRESHOLDS.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2 text-xs font-bold text-slate-300">
            <span>{item.label}</span>
            <span>{item.range} PM2.5</span>
          </div>
        ))}
      </div>

      <p className="mt-4 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-3 text-xs font-bold leading-5 text-amber-100">
        Datos demostrativos para presentación. La interpretación oficial debe configurarse con criterios institucionales.
      </p>
    </article>
  )
}
