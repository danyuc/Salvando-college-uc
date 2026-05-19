"use client"

import { ExternalLink } from "lucide-react"
import { STATUS_LABELS, type CrshSensor } from "@/lib/cardenal-respira"

export default function SensorDashboardCard({ sensor, preview = true }: { sensor: CrshSensor; preview?: boolean }) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 text-white shadow-2xl backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">{STATUS_LABELS[sensor.status]}</p>
          <h3 className="mt-2 text-2xl font-black">{sensor.name}</h3>
          <p className="mt-2 text-sm font-semibold text-slate-300">{sensor.location}</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{sensor.note}</p>
        </div>
        <a
          href={sensor.dashboardUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-black text-slate-950"
        >
          Abrir dashboard en vivo
          <ExternalLink size={16} />
        </a>
      </div>

      {preview && (
        <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950">
          <iframe
            title={`Dashboard ${sensor.name}`}
            src={sensor.iframeUrl}
            className="h-[360px] w-full"
            loading="lazy"
          />
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm font-semibold leading-6 text-cyan-50">
        Si la plataforma externa bloquea la previsualización, abre el dashboard en una nueva pestaña. Las lecturas locales se etiquetan como demo o manual hasta conectar una fuente live validada.
      </div>
    </article>
  )
}
