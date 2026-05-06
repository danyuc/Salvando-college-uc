'use client'

import { ROUTE_POINTS, pmColor, pmLabel } from "../data/metroRoute"

const avg = (rows: any[], key: string) =>
  rows.length ? rows.reduce((sum, row) => sum + Number(row[key] || 0), 0) / rows.length : 0

export default function LabKeyFindings() {
  const elevated = ROUTE_POINTS.filter((p) => p.type === "elevated")
  const underground = ROUTE_POINTS.filter((p) => p.type === "subterranean" || p.type === "transfer")
  const rain = ROUTE_POINTS.filter((p) => p.weather === "rain")
  const noRain = ROUTE_POINTS.filter((p) => p.weather !== "rain")

  const peak = ROUTE_POINTS.reduce((best, p) => p.pmPeak > best.pmPeak ? p : best, ROUTE_POINTS[0])

  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-fuchsia-300">
        Hallazgos principales
      </p>

      <h2 className="mt-3 text-4xl font-black">
        La hipótesis fue parcialmente rechazada
      </h2>

      <p className="mt-4 max-w-5xl leading-7 text-slate-300">
        Se esperaba que los tramos elevados concentraran más PM2.5 por exposición a calles y autopistas. Sin embargo, el recorrido mostró que combinaciones, estaciones subterráneas, alta ocupación, fricción ferroviaria y ventilación limitada también influyeron fuertemente.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Card title="Peak PM2.5" value={`${peak.pmPeak} µg/m³`} sub={peak.name} color={pmColor(peak.pmPeak)} />
        <Card title="Prom. elevado" value={`${avg(elevated, "pm25").toFixed(1)} µg/m³`} sub="Tramos abiertos/elevados" />
        <Card title="Prom. subterráneo" value={`${avg(underground, "pm25").toFixed(1)} µg/m³`} sub="Túneles/combinaciones" />
        <Card title="Con lluvia" value={`${avg(rain, "pm25").toFixed(1)} µg/m³`} sub={`Antes: ${avg(noRain, "pm25").toFixed(1)} µg/m³`} />
      </div>

      <div className="mt-6 rounded-2xl border border-orange-400/20 bg-orange-500/10 p-5">
        <p className="font-black text-orange-200">
          Interpretación: el nivel máximo fue {pmLabel(peak.pmPeak)}. La lluvia durante el regreso coincidió con una baja relativa de partículas en varios tramos exteriores, mientras que zonas cerradas y de combinación mantuvieron mayor carga ambiental.
        </p>
      </div>
    </section>
  )
}

function Card({ title, value, sub, color }: { title: string; value: string; sub: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-black" style={{ color }}>{value}</p>
      <p className="mt-1 text-sm text-slate-400">{sub}</p>
    </div>
  )
}
