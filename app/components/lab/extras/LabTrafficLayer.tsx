'use client'

import {
  ROUTE_POINTS,
  SEGMENT_COLORS,
  pmColor,
  pmLabel,
  typeLabel,
  weatherLabel,
} from "../data/metroRoute"

const TRAFFIC = {
  "Salida sala": {
    level: "media",
    color: "#eab308",
    text: "Flujo moderado cercano al campus y calles interiores.",
    buses: "Buses urbanos ocasionales",
  },

  "San Joaquín": {
    level: "media",
    color: "#eab308",
    text: "Flujo universitario y tránsito constante cercano a Vicuña Mackenna.",
    buses: "Alta circulación de buses",
  },

  "Pedrero": {
    level: "media",
    color: "#f97316",
    text: "Influencia vehicular de Departamental y entorno comercial.",
    buses: "Buses y vehículos particulares",
  },

  "Mirador": {
    level: "alta",
    color: "#ef4444",
    text: "Zona comercial con circulación vehicular constante.",
    buses: "Alta circulación de buses",
  },

  "Bellavista de La Florida": {
    level: "alta",
    color: "#ef4444",
    text: "Tránsito urbano elevado y entrada a túnel.",
    buses: "Buses + taxis + autos",
  },

  "Vicente Valdés": {
    level: "muy alta",
    color: "#dc2626",
    text: "Nodo crítico de combinación ferroviaria y flujo masivo de pasajeros.",
    buses: "Alta circulación metropolitana",
  },

  "Rojas Magallanes": {
    level: "media",
    color: "#f97316",
    text: "Tramo exterior con influencia vial cercana.",
    buses: "Buses interurbanos y locales",
  },

  "Trinidad": {
    level: "media",
    color: "#f97316",
    text: "Sector residencial-vial con flujo moderado.",
    buses: "Circulación media",
  },

  "Grecia": {
    level: "alta",
    color: "#ef4444",
    text: "Alta densidad vial cercana a ejes urbanos.",
    buses: "Buses urbanos frecuentes",
  },

  "Los Orientales": {
    level: "alta",
    color: "#ef4444",
    text: "Flujo urbano elevado y circulación subterránea.",
    buses: "Buses y autos particulares",
  },

  "Plaza Egaña": {
    level: "muy alta",
    color: "#dc2626",
    text: "Nodo urbano crítico con combinación, mall y alto tráfico.",
    buses: "Alta congestión de buses",
  },

  "Llegada sector Collique / salas": {
    level: "baja",
    color: "#22c55e",
    text: "Flujo reducido durante cierre del recorrido.",
    buses: "Poca circulación",
  },
}

export default function LabTrafficLayer({ current }: { current: any }) {
  const traffic =
    TRAFFIC[current.name as keyof typeof TRAFFIC] || {
      level: "media",
      color: "#eab308",
      text: "Sin datos específicos.",
      buses: "Sin información",
    }

  const segmentRows = ROUTE_POINTS.filter(
    (p) => p.segment === current.segment
  )

  const avgPm =
    segmentRows.reduce((a, b) => a + b.pm25, 0) /
    Math.max(segmentRows.length, 1)

  const maxDb = Math.max(...segmentRows.map((p) => p.db))

  const avgCrowd =
    segmentRows.reduce((a, b) => a + b.crowd, 0) /
    Math.max(segmentRows.length, 1)

  return (
    <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">

      <article className="rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
          Fase actual
        </p>

        <div
          className="mt-3 h-2 rounded-full"
          style={{ background: SEGMENT_COLORS[current.segment] }}
        />

        <h2 className="mt-4 text-3xl font-black">
          {current.segment}
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-300">
          {current.transitionLabel ||
            `${current.line} · ${typeLabel(current.type)}`}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Mini
            label="PM promedio"
            value={`${avgPm.toFixed(1)} µg/m³`}
            color={pmColor(avgPm)}
          />

          <Mini
            label="Ruido peak"
            value={`${maxDb} dB`}
          />

          <Mini
            label="Ocupación"
            value={`${avgCrowd.toFixed(0)}%`}
          />

          <Mini
            label="Estado"
            value={pmLabel(current.pm25)}
            color={pmColor(current.pm25)}
          />
        </div>
      </article>

      <article className="rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-300">
          Tráfico cercano
        </p>

        <div
          className="mt-4 flex items-center gap-3 rounded-2xl p-4"
          style={{
            background: `${traffic.color}22`,
            border: `1px solid ${traffic.color}`,
          }}
        >
          <div
            className="h-5 w-5 rounded-full"
            style={{ background: traffic.color }}
          />

          <div>
            <h3 className="font-black">
              Congestión {traffic.level}
            </h3>

            <p className="text-sm text-slate-300">
              {traffic.text}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            Transporte superficial
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            🚌 {traffic.buses}
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            Clima y entorno
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            🌦️ {weatherLabel(current.weather)} · 💨 {current.wind || 0} km/h
          </p>
        </div>
      </article>

      <article className="rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-fuchsia-300">
          Interpretación ambiental
        </p>

        <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">

          <p>
            El comportamiento ambiental cambia dependiendo de la combinación
            entre túneles, ventilación, densidad de pasajeros y entorno vial.
          </p>

          <p>
            Los sectores de combinación y estaciones profundas tienden a
            acumular más calor, ruido y partículas suspendidas.
          </p>

          <p>
            En sectores exteriores el PM2.5 puede disminuir gracias a la
            ventilación natural y la lluvia.
          </p>

          <p>
            El ruido aumenta principalmente durante frenados, ingreso a túneles,
            combinaciones y vagones con alta ocupación.
          </p>

        </div>
      </article>
    </section>
  )
}

function Mini({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color?: string
}) {
  return (
    <div className="rounded-xl bg-slate-950/60 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p
        className="mt-1 font-black"
        style={{ color }}
      >
        {value}
      </p>
    </div>
  )
}
