'use client'

import { ROUTE_POINTS } from "../data/metroRoute"

function avg(rows: any[], key: string) {
  return rows.length
    ? rows.reduce((sum, row) => sum + Number(row[key] || 0), 0) / rows.length
    : 0
}

export default function LabComparativeAnalysis() {
  const beforeRain = ROUTE_POINTS.filter((p) => p.weather !== "rain")
  const rain = ROUTE_POINTS.filter((p) => p.weather === "rain")

  const elevated = ROUTE_POINTS.filter((p) => p.type === "elevated")
  const underground = ROUTE_POINTS.filter((p) => p.type === "subterranean" || p.type === "transfer")

  const beforePm = avg(beforeRain, "pm25")
  const rainPm = avg(rain, "pm25")
  const variation = beforePm ? ((rainPm - beforePm) / beforePm) * 100 : 0

  const elevatedPm = avg(elevated, "pm25")
  const undergroundPm = avg(underground, "pm25")

  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-6">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
        Comparativas científicas del recorrido
      </p>

      <h2 className="mt-4 text-4xl font-black">
        La lluvia coincidió con una disminución relativa del PM2.5
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Card title="Antes de lluvia" value={`${beforePm.toFixed(1)} µg/m³`} />
        <Card title="Con lluvia" value={`${rainPm.toFixed(1)} µg/m³`} />
        <Card title="Variación" value={`${variation.toFixed(1)}%`} />
        <Card title="Lectura" value={variation < 0 ? "Disminuye" : "Aumenta"} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
          <h3 className="text-2xl font-black">Elevado vs subterráneo</h3>
          <p className="mt-3 leading-7 text-slate-300">
            En el recorrido, los tramos subterráneos y de combinación concentraron mayor carga contextual que varios tramos elevados, especialmente por ventilación reducida, fricción mecánica, congestión y permanencia de pasajeros.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Card title="Promedio elevado" value={`${elevatedPm.toFixed(1)} µg/m³`} />
            <Card title="Promedio subterráneo/combinación" value={`${undergroundPm.toFixed(1)} µg/m³`} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
          <h3 className="text-2xl font-black">Interpretación</h3>
          <p className="mt-3 leading-7 text-slate-300">
            La hipótesis inicial esperaba mayores niveles en tramos elevados por exposición a vías vehiculares. Sin embargo, los datos sugieren que la acumulación en túneles, combinaciones, densidad de pasajeros y condiciones de ventilación fueron más determinantes. La lluvia durante el regreso pudo favorecer la reducción de partículas en tramos exteriores.
          </p>
        </div>
      </div>
    </section>
  )
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  )
}
