'use client'

import { ROUTE_POINTS, pmColor, pmLabel } from "../data/metroRoute"

const avg = (rows: any[], key: string) =>
  rows.length ? rows.reduce((sum, row) => sum + Number(row[key] || 0), 0) / rows.length : 0

export default function LabKeyFindings() {
  const elevated = ROUTE_POINTS.filter((p) => p.type === "elevated")
  const underground = ROUTE_POINTS.filter((p) => p.type === "subterranean" || p.type === "transfer")
  const rain = ROUTE_POINTS.filter((p) => p.rain === true)
  const noRain = ROUTE_POINTS.filter((p) => p.rain !== true)

  const peak = ROUTE_POINTS.reduce((best, p) => p.pm25 > best.pm25 ? p : best, ROUTE_POINTS[0])

  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-fuchsia-300">
        Hallazgos principales
      </p>

      <h2 className="mt-3 text-4xl font-black">
        La hipótesis fue parcialmente comprobada
      </h2>

      <p className="mt-4 max-w-5xl leading-7 text-slate-300">
        Con los datos reales del sensor, el PM2.5 máximo fue cercano a 26 µg/m³. No hubo contaminación extrema, pero sí variaciones relevantes asociadas a tipo de tramo, ventilación, ocupación, lluvia y transición superficie/subterráneo.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Card title="Peak PM2.5 real" value={`${peak.pm25} µg/m³`} sub={peak.name} color={pmColor(peak.pm25)} />
        <Card title="Prom. elevado" value={`${avg(elevated, "pm25").toFixed(1)} µg/m³`} sub="Tramos exteriores/elevados" />
        <Card title="Prom. subterráneo" value={`${avg(underground, "pm25").toFixed(1)} µg/m³`} sub="Túneles/combinaciones" />
        <Card title="Con lluvia" value={`${avg(rain, "pm25").toFixed(1)} µg/m³`} sub={`Sin lluvia: ${avg(noRain, "pm25").toFixed(1)} µg/m³`} />
      </div>

      <div className="mt-6 rounded-2xl border border-orange-400/20 bg-orange-500/10 p-5">
        <p className="font-black text-orange-200">
          Interpretación: el nivel máximo fue {pmLabel(peak.pm25)}. La lluvia coincidió con una disminución relativa de PM2.5 en varios tramos exteriores, mientras que los sectores cerrados o con mayor ocupación mantuvieron valores más altos.
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
