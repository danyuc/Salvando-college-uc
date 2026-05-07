'use client'

import { useMemo, useState } from "react"
import { ROUTE_POINTS, pmColor } from "../data/metroRoute"

type Layer = "pm25" | "temp" | "humidity" | "db" | "crowd"

const labels: Record<Layer, string> = {
  pm25: "PM2.5",
  temp: "Temperatura",
  humidity: "Humedad",
  db: "Ruido",
  crowd: "Personas",
}

function color(layer: Layer, value: number) {
  if (layer === "pm25") return pmColor(value)
  if (layer === "temp") return value >= 24 ? "#ef4444" : value >= 22 ? "#f97316" : "#38bdf8"
  if (layer === "humidity") return value >= 40 ? "#38bdf8" : "#22c55e"
  if (layer === "db") return value >= 85 ? "#ef4444" : value >= 75 ? "#f97316" : "#22c55e"
  if (layer === "crowd") return value >= 80 ? "#ef4444" : value >= 50 ? "#eab308" : "#22c55e"
  return "#22c55e"
}

export default function LabLayerSelector() {
  const [layer, setLayer] = useState<Layer>("pm25")

  const peak = useMemo(() => {
    return ROUTE_POINTS.reduce(
      (best, p) => Number(p[layer]) > Number(best[layer]) ? p : best,
      ROUTE_POINTS[0]
    )
  }, [layer])

  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-300">
        Capas ambientales
      </p>

      <h2 className="mt-3 text-4xl font-black">Selector de variable ambiental</h2>

      <div className="mt-5 flex flex-wrap gap-3">
        {(Object.keys(labels) as Layer[]).map((key) => (
          <button
            key={key}
            onClick={() => setLayer(key)}
            className={`rounded-2xl px-5 py-3 font-black ${
              layer === key ? "bg-cyan-400 text-slate-950" : "bg-slate-950/70 text-white"
            }`}
          >
            {labels[key]}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
          Peak de {labels[layer]}
        </p>
        <p className="mt-2 text-4xl font-black" style={{ color: color(layer, Number(peak[layer])) }}>
          {String(peak[layer])}
        </p>
        <p className="mt-2 text-slate-300">{peak.name}</p>

        <div className="mt-5 grid gap-2">
          {ROUTE_POINTS.map((p) => (
            <div key={`${p.id}-${layer}`} className="grid grid-cols-[150px_1fr_60px] items-center gap-3">
              <p className="truncate text-sm text-slate-300">{p.name}</p>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(5, Number(p[layer])))}%`,
                    background: color(layer, Number(p[layer])),
                  }}
                />
              </div>
              <p className="text-right text-sm font-black">{String(p[layer])}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
