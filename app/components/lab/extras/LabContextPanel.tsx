'use client'

import { ROUTE_POINTS, SEGMENT_COLORS, pmColor, typeLabel, weatherLabel } from "../data/metroRoute"

export default function LabContextPanel({ current }: { current: any }) {
  const segmentRows = ROUTE_POINTS.filter((p) => p.segment === current.segment)
  const avgPm =
    segmentRows.reduce((sum, p) => sum + p.pm25, 0) / Math.max(segmentRows.length, 1)

  const traffic =
    current.segment === "Sala → San Joaquín" ? "Tráfico exterior bajo a moderado alrededor del campus." :
    current.segment === "San Joaquín → Vicente" ? "Tráfico urbano cercano a ejes viales, pero el trayecto es principalmente ferroviario." :
    current.segment === "Vicente → Trinidad" ? "Mayor exposición exterior y posible influencia de vías cercanas." :
    current.segment === "Trinidad → Plaza Egaña" ? "Tramo mixto: superficie, túnel y sectores urbanos con distinta ventilación." :
    current.segment === "Plaza Egaña → Vicente" ? "Regreso con alta ocupación del vagón y lluvia exterior." :
    current.segment === "Vicente → San Joaquín" ? "Retorno por L5 con lluvia y menor PM2.5 relativo." :
    "Tramo exterior final hacia sala."

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-3">
      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Tramo actual</p>
        <h3 className="mt-2 text-2xl font-black" style={{ color: SEGMENT_COLORS[current.segment] }}>
          {current.segment}
        </h3>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          {current.transitionLabel || `${current.line} · ${typeLabel(current.type)}`}
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">Tráfico contextual</p>
        <h3 className="mt-2 text-2xl font-black">🚦 Observación urbana</h3>
        <p className="mt-3 text-sm leading-6 text-slate-300">{traffic}</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">PM2.5 del tramo</p>
        <h3 className="mt-2 text-3xl font-black" style={{ color: pmColor(avgPm) }}>
          {avgPm.toFixed(1)} µg/m³
        </h3>
        <p className="mt-3 text-sm text-slate-300">
          Clima: {weatherLabel(current.weather)} · Viento: {current.wind} km/h
        </p>
      </div>
    </div>
  )
}
