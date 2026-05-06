'use client'

import { useEffect, useState } from "react"

const stations = [
  { name: "San Joaquín", pm25: 14, db: 68, type: "Subterráneo", people: 4 },
  { name: "Pedrero", pm25: 26, db: 72, type: "Subterráneo", people: 5 },
  { name: "Mirador", pm25: 38, db: 74, type: "Subterráneo", people: 6 },
  { name: "Bellavista de La Florida", pm25: 58, db: 82, type: "Subterráneo", people: 8 },
  { name: "Vicente Valdés / Combinación", pm25: 84, db: 91, type: "Transición", people: 10 },
  { name: "Rojas Magallanes", pm25: 37, db: 76, type: "Elevado", people: 5 },
  { name: "Trinidad", pm25: 21, db: 70, type: "Elevado", people: 4 },
  { name: "Plaza Egaña", pm25: 31, db: 73, type: "Subterráneo", people: 6 },
]

export default function LabDashboard() {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)

  const current = stations[index]
  const peak = current.pm25 >= 70

  useEffect(() => {
    if (!playing) return

    const id = setInterval(() => {
      setIndex((value) => (value + 1) % stations.length)
    }, 1800)

    return () => clearInterval(id)
  }, [playing])

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      {peak && (
        <div className="pointer-events-none fixed inset-0 z-50 bg-zinc-500/30 backdrop-blur-[3px]">
          <div className="grid h-full place-items-center">
            <div className="rounded-[2rem] border border-red-400/40 bg-black/60 p-10 text-center shadow-[0_0_120px_rgba(255,0,0,.35)]">
              <div className="text-7xl">☁️</div>
              <h2 className="mt-4 text-5xl font-black">Peak contaminación</h2>
              <p className="mt-3 text-slate-300">PM2.5 crítico detectado en {current.name}</p>
            </div>
          </div>
        </div>
      )}

      <section className="relative border-b border-white/10 px-6 py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,182,212,.20),transparent_55%)]" />

        <div className="relative mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-cyan-300">
            Laboratorio Ambiental Metro
          </p>

          <h1 className="mt-5 max-w-5xl text-5xl font-black leading-tight md:text-7xl">
            Digital Twin ambiental del recorrido
          </h1>

          <p className="mt-6 max-w-3xl text-xl text-slate-300">
            Demo interactiva con PM2.5, ruido, flujo de personas, estación actual, peak de contaminación y experiencia visual.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => setPlaying((value) => !value)}
              className="rounded-2xl bg-cyan-400 px-6 py-4 font-black text-slate-950"
            >
              {playing ? "⏸ Pausar recorrido" : "▶ Reproducir recorrido"}
            </button>

            <button
              onClick={() => setIndex((value) => (value + 1) % stations.length)}
              className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 font-black"
            >
              Siguiente estación →
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-4 md:grid-cols-4">
          <Card title="Estación actual" value={current.name} />
          <Card title="PM2.5 actual" value={`${current.pm25} µg/m³`} danger={peak} />
          <Card title="Ruido" value={`${current.db} dB`} />
          <Card title="Tipo de tramo" value={current.type} />
        </div>

        <div className="mt-8 flex gap-4 overflow-x-auto pb-4">
          {stations.map((station, i) => (
            <button
              key={station.name}
              onClick={() => setIndex(i)}
              className={`min-w-[260px] rounded-[2rem] border p-5 text-left transition ${
                i === index
                  ? "border-cyan-300 bg-cyan-400/20 shadow-[0_0_60px_rgba(6,182,212,.25)]"
                  : station.pm25 >= 70
                  ? "border-red-500/30 bg-red-500/10"
                  : "border-white/10 bg-white/10"
              }`}
            >
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                Estación
              </p>

              <h3 className="mt-3 text-2xl font-black">{station.name}</h3>

              <div className="mt-5 h-3 rounded-full bg-slate-800">
                <div
                  className={`h-3 rounded-full ${station.pm25 >= 70 ? "bg-red-500" : "bg-cyan-400"}`}
                  style={{ width: `${Math.min(station.pm25, 100)}%` }}
                />
              </div>

              <p className="mt-4 text-sm text-slate-300">
                PM2.5: {station.pm25} · Personas: {"👤".repeat(Math.min(station.people, 8))}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_.6fr]">
          <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,.18),transparent_60%)]" />

            <div className="relative">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
                Mapa visual del recorrido
              </p>

              <div className="mt-16 flex items-center gap-4 overflow-x-auto pb-8">
                {stations.map((station, i) => (
                  <div key={station.name} className="flex items-center gap-4">
                    <div
                      className={`grid h-24 w-24 place-items-center rounded-full border text-3xl ${
                        i === index
                          ? "border-cyan-300 bg-cyan-400 text-slate-950 shadow-[0_0_60px_rgba(6,182,212,.45)]"
                          : station.pm25 >= 70
                          ? "border-red-400 bg-red-500/20"
                          : "border-white/10 bg-white/10"
                      }`}
                    >
                      {i === index ? "🚇" : "🚉"}
                    </div>

                    {i < stations.length - 1 && (
                      <div className="h-2 w-24 rounded-full bg-cyan-400/40" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/10 p-6">
                <h2 className="text-4xl font-black">{current.name}</h2>
                <p className="mt-3 text-slate-300">
                  {current.type} · PM2.5 {current.pm25} µg/m³ · {current.db} dB
                </p>
              </div>
            </div>
          </div>

          <aside className="grid gap-6">
            <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-500/10 p-6">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                Entrada al vagón
              </p>

              <div className="mt-5 text-4xl">
                {"👤".repeat(Math.min(current.people, 10))}
              </div>

              <p className="mt-4 text-slate-300">
                Flujo visual de personas según la estación actual.
              </p>
            </div>

            <div className="rounded-[2rem] border border-fuchsia-400/20 bg-fuchsia-500/10 p-6">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-fuchsia-300">
                Sonido reactivo
              </p>

              <h3 className="mt-3 text-5xl font-black">{current.db} dB</h3>

              <div className="mt-6 flex h-24 items-end gap-2">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-full rounded-t-lg bg-fuchsia-300"
                    style={{ height: `${Math.max(15, (current.db + i * 7) % 95)}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-red-400/20 bg-red-500/10 p-6">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-red-300">
                Estado ambiental
              </p>

              <h3 className="mt-3 text-4xl font-black">
                {peak ? "Crítico" : "Normal"}
              </h3>

              <p className="mt-4 text-slate-300">
                El overlay gris aparece automáticamente al detectar peak.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}

function Card({
  title,
  value,
  danger,
}: {
  title: string
  value: string
  danger?: boolean
}) {
  return (
    <article className={`rounded-[2rem] border p-5 ${danger ? "border-red-500/30 bg-red-500/10" : "border-white/10 bg-white/10"}`}>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <h3 className="mt-3 text-2xl font-black">{value}</h3>
    </article>
  )
}
