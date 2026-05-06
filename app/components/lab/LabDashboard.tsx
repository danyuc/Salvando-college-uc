'use client'

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ROUTE_POINTS, pmColor, typeLabel } from "./data/metroRoute"

export default function LabDashboard() {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [present, setPresent] = useState(false)

  const current = ROUTE_POINTS[index]
  const next = ROUTE_POINTS[index + 1]
  const peak = current.pm25 >= 70
  const shake = current.event === "shake" || current.db >= 88
  const maxPm = Math.max(...ROUTE_POINTS.map((p) => p.pm25))
  const maxDb = Math.max(...ROUTE_POINTS.map((p) => p.db))
  const maxCfu = Math.max(...ROUTE_POINTS.map((p) => p.cfu))
  const avgPm = ROUTE_POINTS.reduce((a, b) => a + b.pm25, 0) / ROUTE_POINTS.length

  const comparison = useMemo(() => {
    const groups = ["subterranean", "elevated", "transition", "walking"] as const
    return groups.map((type) => {
      const rows = ROUTE_POINTS.filter((p) => p.type === type)
      const pm = rows.reduce((a, b) => a + b.pm25, 0) / Math.max(rows.length, 1)
      return { tipo: typeLabel(type), PM25: Math.round(pm) }
    })
  }, [])

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setIndex((value) => (value + 1) % ROUTE_POINTS.length)
    }, present ? 2600 : 1800)
    return () => clearInterval(id)
  }, [playing, present])

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <PollutionOverlay active={peak} current={current.name} />
      <Smoke active={peak} />
      <Shake active={shake} />

      <section className="relative overflow-hidden border-b border-white/10 px-6 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,182,212,.22),transparent_55%)]" />
        <div className="absolute left-0 top-0 h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute right-0 top-0 h-[420px] w-[420px] rounded-full bg-fuchsia-500/10 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.4em] text-cyan-300">
            Laboratorio Ambiental Metro
          </p>

          <h1 className="mt-5 max-w-6xl text-5xl font-black leading-[1] md:text-7xl">
            Digital Twin ambiental del recorrido
          </h1>

          <p className="mt-7 max-w-3xl text-xl text-slate-300 md:text-2xl">
            PM2.5, ruido, humedad, temperatura, bacterias, flujo de personas,
            eventos y playback visual estación por estación.
          </p>

          {!present && (
            <div className="mt-9 flex flex-wrap gap-4">
              <button
                onClick={() => setPlaying((v) => !v)}
                className="rounded-[1.5rem] bg-cyan-400 px-7 py-4 text-lg font-black text-slate-950 shadow-[0_0_50px_rgba(6,182,212,.35)] hover:bg-cyan-300"
              >
                {playing ? "⏸ Pausar recorrido" : "▶ Reproducir recorrido"}
              </button>

              <button
                onClick={() => setIndex((v) => (v + 1) % ROUTE_POINTS.length)}
                className="rounded-[1.5rem] border border-white/10 bg-white/10 px-7 py-4 text-lg font-black backdrop-blur hover:bg-white/15"
              >
                Siguiente →
              </button>

              <button
                onClick={() => {
                  setPresent(true)
                  setPlaying(true)
                }}
                className="rounded-[1.5rem] border border-fuchsia-400/30 bg-fuchsia-500/10 px-7 py-4 text-lg font-black text-fuchsia-100"
              >
                🎥 Modo presentación
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <section className="grid gap-4 md:grid-cols-4">
          <Metric title="Estación actual" value={current.name} />
          <Metric title="PM2.5 actual" value={`${current.pm25} µg/m³`} danger={peak} />
          <Metric title="Peak PM2.5" value={`${maxPm} µg/m³`} danger />
          <Metric title="Ruido peak" value={`${maxDb} dB`} />
        </section>

        <Timeline index={index} setIndex={setIndex} />

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
          <MapPanel index={index} current={current} />

          <aside className="grid gap-6">
            <Panel title="Transición actual" color="cyan">
              <motion.h2
                key={current.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-black"
              >
                {current.name}
              </motion.h2>
              <p className="mt-2 text-slate-300">
                {current.line} · {typeLabel(current.type)} · {current.direction}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Mini label="PM2.5" value={`${current.pm25}`} />
                <Mini label="Temp." value={`${current.temp} °C`} />
                <Mini label="Humedad" value={`${current.humidity}%`} />
                <Mini label="Ruido" value={`${current.db} dB`} />
              </div>
            </Panel>

            <Panel title="Entrada al vagón" color="blue">
              <div className="flex flex-wrap gap-2 text-4xl">
                {Array.from({ length: current.crowd }).map((_, i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.06 }}
                  >
                    👤
                  </motion.span>
                ))}
              </div>
              <p className="mt-4 text-slate-300">
                Flujo visual de personas según la estación actual.
              </p>
            </Panel>

            <SoundPanel db={current.db} />

            <Panel title="Evento detectado" color="fuchsia">
              <h3 className="text-3xl font-black">
                {current.event === "music" ? "🎸 Cantante ambulante" :
                 current.event === "crowd" ? "👥 Vagón lleno" :
                 current.event === "shake" ? "💥 Frenado fuerte" :
                 peak ? "☁️ Peak contaminación" : "📝 Sin evento crítico"}
              </h3>
              <p className="mt-3 text-slate-300">
                {next ? `Siguiente estación: ${next.name}` : "Fin del recorrido."}
              </p>
            </Panel>
          </aside>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Chart title="PM2.5 durante el recorrido">
            <AreaChart data={ROUTE_POINTS}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.1)" />
              <XAxis dataKey="name" hide />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Area type="monotone" dataKey="pm25" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.25} />
            </AreaChart>
          </Chart>

          <Chart title="Comparación por tipo de tramo">
            <BarChart data={comparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.1)" />
              <XAxis dataKey="tipo" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="PM25" fill="#f97316" />
            </BarChart>
          </Chart>

          <Chart title="Ruido por estación">
            <AreaChart data={ROUTE_POINTS}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.1)" />
              <XAxis dataKey="name" hide />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Area type="monotone" dataKey="db" stroke="#d946ef" fill="#d946ef" fillOpacity={0.25} />
            </AreaChart>
          </Chart>

          <Chart title="Bacterias / UFC">
            <BarChart data={ROUTE_POINTS}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.1)" />
              <XAxis dataKey="name" hide />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="cfu" fill="#22c55e" />
            </BarChart>
          </Chart>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <Paper title="Hipótesis" text="El recorrido permite comparar condiciones ambientales entre tramos subterráneos, elevados, de transición y caminata, considerando PM2.5, humedad, temperatura, ruido y bacterias/UFC." />
          <Paper title="Resultado preliminar" text={`El PM2.5 promedio de la demo es ${avgPm.toFixed(1)} µg/m³, con peak de ${maxPm} µg/m³. El mayor ruido observado alcanza ${maxDb} dB y el mayor registro microbiológico simulado alcanza ${maxCfu} UFC.`} />
          <Paper title="Interpretación" text="Los peaks pueden relacionarse con combinaciones, flujo de personas, eventos acústicos, cambios de infraestructura, ventilación y acumulación de material particulado." />
          <Paper title="Limitaciones" text="La demo usa datos simulados para la presentación. Al cargar el Excel real, el sistema puede recalcular estaciones, peaks, eventos, ruido, UFC y visualizaciones." />
        </section>
      </section>

      {present && (
        <button
          onClick={() => {
            setPresent(false)
            setPlaying(false)
          }}
          className="fixed bottom-5 right-5 z-[9999] rounded-2xl bg-white px-5 py-3 font-black text-slate-950"
        >
          Salir presentación
        </button>
      )}
    </main>
  )
}

function Timeline({ index, setIndex }: { index: number; setIndex: (n: number) => void }) {
  return (
    <section className="mt-8 flex gap-4 overflow-x-auto pb-4">
      {ROUTE_POINTS.map((point, i) => {
        const active = i === index
        return (
          <motion.button
            key={point.id}
            onClick={() => setIndex(i)}
            whileHover={{ y: -5, scale: 1.03 }}
            animate={active ? { y: [0, -8, 0], scale: [1, 1.04, 1] } : {}}
            transition={{ repeat: active ? Infinity : 0, duration: 1.3 }}
            className={`min-w-[260px] rounded-[2rem] border p-5 text-left backdrop-blur ${
              active
                ? "border-cyan-300 bg-cyan-400/20 shadow-[0_0_60px_rgba(6,182,212,.25)]"
                : point.pm25 >= 70
                ? "border-red-500/30 bg-red-500/10"
                : "border-white/10 bg-white/10"
            }`}
          >
            <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              {point.line} · {point.direction}
            </p>
            <h3 className="mt-3 text-2xl font-black">{point.name}</h3>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(point.pm25, 100)}%` }}
                className="h-3 rounded-full"
                style={{ background: pmColor(point.pm25) }}
              />
            </div>
            <p className="mt-4 text-sm text-slate-300">
              PM2.5 {point.pm25} · {"👤".repeat(Math.min(point.crowd, 7))}
            </p>
          </motion.button>
        )
      })}
    </section>
  )
}

function MapPanel({ index, current }: { index: number; current: (typeof ROUTE_POINTS)[number] }) {
  return (
    <div className="relative min-h-[640px] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 p-8 shadow-[0_0_80px_rgba(6,182,212,.08)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,.18),transparent_60%)]" />

      {ROUTE_POINTS.map((point, i) => (
        <motion.div
          key={`heat-${point.id}`}
          className="absolute rounded-full blur-3xl"
          style={{
            background: pmColor(point.pm25),
            opacity: point.pm25 >= 70 ? 0.23 : 0.12,
            width: `${80 + point.pm25 * 2}px`,
            height: `${80 + point.pm25 * 2}px`,
            left: `${8 + (i * 7.5) % 82}%`,
            top: `${25 + (i % 5) * 11}%`,
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.22, 0.1] }}
          transition={{ repeat: Infinity, duration: 4 + i * 0.2 }}
        />
      ))}

      <div className="relative">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
          Mapa vivo / heatmap del recorrido
        </p>

        <div className="mt-16 flex items-center gap-3 overflow-x-auto pb-8">
          {ROUTE_POINTS.map((point, i) => (
            <div key={point.id} className="flex items-center gap-3">
              <motion.button
                animate={i === index ? { scale: [1, 1.18, 1] } : {}}
                transition={{ repeat: i === index ? Infinity : 0, duration: 1 }}
                className={`grid h-24 w-24 shrink-0 place-items-center rounded-full border text-3xl ${
                  i === index
                    ? "border-cyan-300 bg-cyan-400 text-slate-950 shadow-[0_0_70px_rgba(6,182,212,.55)]"
                    : point.pm25 >= 70
                    ? "border-red-400 bg-red-500/20"
                    : "border-white/10 bg-white/10"
                }`}
              >
                {i === index ? "🚇" : "🚉"}
              </motion.button>

              {i < ROUTE_POINTS.length - 1 && (
                <div className="h-2 w-16 shrink-0 rounded-full bg-cyan-400/40" />
              )}
            </div>
          ))}
        </div>

        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur"
        >
          <h2 className="text-4xl font-black">🚇 {current.name}</h2>
          <p className="mt-3 text-slate-300">
            {current.line} · {typeLabel(current.type)} · PM2.5 {current.pm25} µg/m³ · {current.db} dB
          </p>
        </motion.div>
      </div>
    </div>
  )
}

function PollutionOverlay({ active, current }: { active: boolean; current: string }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-[9998] bg-gradient-to-br from-zinc-400/35 via-zinc-700/45 to-black/75 backdrop-blur-[4px]"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute left-1/2 top-1/2 w-[min(760px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-red-500/40 bg-black/55 px-10 py-10 text-center shadow-[0_0_140px_rgba(255,0,0,.35)]"
          >
            <div className="text-8xl">☁️</div>
            <h2 className="mt-5 text-5xl font-black text-white md:text-7xl">Peak contaminación</h2>
            <p className="mt-4 text-xl text-zinc-300">PM2.5 crítico detectado en {current}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Smoke({ active }: { active: boolean }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-slate-300/10 blur-2xl"
          style={{
            width: 120 + (i % 5) * 40,
            height: 120 + (i % 5) * 40,
            left: `${(i * 13) % 100}%`,
            top: `${(i * 19) % 100}%`,
          }}
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -60, -20, 0],
            opacity: active ? [0.08, 0.22, 0.12] : [0.02, 0.06, 0.02],
            scale: active ? [1, 1.25, 1] : [1, 1.08, 1],
          }}
          transition={{ duration: 7 + i * 0.2, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  )
}

function Shake({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[9999] bg-red-500/10"
          animate={{ x: [-10, 10, -8, 8, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, repeat: 3 }}
        />
      )}
    </AnimatePresence>
  )
}

function SoundPanel({ db }: { db: number }) {
  return (
    <Panel title="Sonido reactivo" color="fuchsia">
      <h3 className="text-5xl font-black">{db} dB</h3>
      <div className="mt-6 flex h-24 items-end gap-2">
        {Array.from({ length: 16 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-full rounded-t-lg bg-fuchsia-300"
            animate={{ height: [`${Math.max(15, (db + i * 7) % 95) * 0.45}%`, `${Math.max(15, (db + i * 7) % 95)}%`, "35%"] }}
            transition={{ repeat: Infinity, duration: 0.6 + i * 0.02 }}
          />
        ))}
      </div>
    </Panel>
  )
}

function Metric({ title, value, danger }: { title: string; value: string; danger?: boolean }) {
  return (
    <article className={`rounded-[2rem] border p-5 ${danger ? "border-red-500/30 bg-red-500/10" : "border-white/10 bg-white/10"}`}>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <h3 className="mt-3 text-2xl font-black">{value}</h3>
    </article>
  )
}

function Panel({ title, children, color }: { title: string; children: React.ReactNode; color: "cyan" | "blue" | "fuchsia" }) {
  const c = color === "cyan" ? "text-cyan-300" : color === "blue" ? "text-blue-300" : "text-fuchsia-300"
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
      <p className={`text-xs font-black uppercase tracking-[0.25em] ${c}`}>{title}</p>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-900/80 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  )
}

function Chart({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
      <h3 className="text-2xl font-black">{title}</h3>
      <div className="mt-6 h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function Paper({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
      <h3 className="text-2xl font-black">{title}</h3>
      <p className="mt-3 leading-7 text-slate-300">{text}</p>
    </article>
  )
}
