"use client"

import Link from "next/link"
import { type ReactNode, useMemo, useState } from "react"
import { Copy, ExternalLink, Gamepad2 } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts"
import {
  AIR_QUALITY_DEMO_DATA,
  CARDENAL_RESPIRA_PROJECT,
  CLASS_IDEAS,
  CRSH_SENSORS,
  STATUS_LABELS,
  TEACHER_MATERIALS,
  buildDemoReading,
  type SensorReading,
} from "@/lib/cardenal-respira"
import AirQualityTrafficLight from "./AirQualityTrafficLight"
import SensorDashboardCard from "./SensorDashboardCard"

export default function TeacherPanel() {
  const [sensorId, setSensorId] = useState(CRSH_SENSORS[0].id)
  const [manualMode, setManualMode] = useState(false)
  const selectedSensor = CRSH_SENSORS.find((sensor) => sensor.id === sensorId) ?? CRSH_SENSORS[0]
  const [manualReading, setManualReading] = useState<SensorReading>(() => ({
    ...buildDemoReading(selectedSensor, 1),
    status: "manual",
    sourceLabel: "Datos manuales ingresados por docente para presentación.",
    isDemo: false,
  }))

  const reading = manualMode
    ? { ...manualReading, sensorId: selectedSensor.id, sensorName: selectedSensor.name, status: "manual" as const }
    : buildDemoReading(selectedSensor, selectedSensor.id === "sensor-71-college-uc" ? 1 : 2)

  const chartData = AIR_QUALITY_DEMO_DATA.map((point) => ({
    ...point,
    sensor: selectedSensor.shortName,
  }))

  const summary = useMemo(
    () =>
      `Cardenal Respira transforma datos de calidad del aire en aprendizaje, proyectos TP, ciencia ciudadana e innovación educativa. Sensor seleccionado: ${selectedSensor.name}. Estado de datos: ${STATUS_LABELS[reading.status]}.`,
    [reading.status, selectedSensor.name]
  )

  function copySummary() {
    navigator.clipboard?.writeText(summary)
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white md:px-10">
      <section className="mx-auto grid max-w-7xl gap-6">
        <header className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 shadow-2xl backdrop-blur-xl">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-300">Panel docente</p>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">Cardenal Respira</h1>
          <p className="mt-4 max-w-3xl text-base font-semibold leading-8 text-slate-300">
            Selecciona sensor, revisa semáforo e interpreta datos demo/manuales con foco institucional.
          </p>
          <p className="mt-4 w-fit rounded-full border border-amber-300/25 bg-amber-300/10 px-4 py-2 text-xs font-black text-amber-100">
            Datos demostrativos hasta conectar fuente live validada.
          </p>
        </header>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <label className="grid gap-2 text-sm font-black text-slate-200">
              Sensor activo
              <select
                value={sensorId}
                onChange={(event) => setSensorId(event.target.value)}
                className="min-h-14 rounded-2xl border border-white/10 bg-slate-950 px-4 font-black text-white outline-none"
              >
                {CRSH_SENSORS.map((sensor) => (
                  <option key={sensor.id} value={sensor.id}>
                    {sensor.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setManualMode((value) => !value)}
                className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white"
              >
                {manualMode ? "Usar demo" : "Modo manual"}
              </button>
              <Link href="/ipre2" className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950">
                <Gamepad2 size={16} />
                Abrir Explora IPRE2
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="grid gap-6">
            <SensorDashboardCard sensor={selectedSensor} preview={selectedSensor.id === "sensor-71-college-uc"} />
          </div>
          <AirQualityTrafficLight reading={reading} editable={manualMode} onManualReading={setManualReading} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel title="Monitoreo educativo">
            <div className="min-w-0 overflow-x-auto">
              <BarChart width={680} height={320} data={chartData} className="max-w-full">
                <CartesianGrid stroke="rgba(148,163,184,.18)" />
                <XAxis dataKey="date" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,.12)", borderRadius: 16 }} />
                <Bar dataKey="pm25" fill="#22d3ee" radius={[10, 10, 0, 0]} />
                <Bar dataKey="pm10" fill="#a78bfa" radius={[10, 10, 0, 0]} />
              </BarChart>
            </div>
          </Panel>

          <Panel title="Tal día había tal condición">
            <p className="text-sm font-semibold leading-7 text-slate-300">{reading.educationalInterpretation}</p>
            <div className="mt-4 rounded-2xl bg-slate-950/55 p-4">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Acción educativa sugerida</p>
              <p className="mt-2 text-2xl font-black">{reading.recommendedAction}</p>
              <p className="mt-2 text-sm font-semibold text-slate-400">Sensor usado: {selectedSensor.name}</p>
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel title="Materiales educativos">
            <div className="grid gap-3">
              {TEACHER_MATERIALS.map((item) => (
                <div key={item} className="rounded-2xl bg-slate-950/55 px-4 py-3 text-sm font-black text-slate-200">{item}</div>
              ))}
            </div>
          </Panel>

          <Panel title="Ideas para clases y proyectos">
            <div className="grid gap-3">
              {CLASS_IDEAS.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold leading-6 text-slate-200">{item}</div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel title="Investigación y alianzas">
            <p className="text-sm font-semibold leading-7 text-slate-300">
              UC, Belén Educa, docentes del establecimiento y oportunidades de ciencia ciudadana pueden articular una línea de trabajo con contaminación atmosférica, salud, educación y urbanismo. Explora se mantiene como oportunidad en revisión, no como aprobación.
            </p>
            <div className="mt-5 rounded-2xl bg-slate-950/55 p-4">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">{CARDENAL_RESPIRA_PROJECT.featuredInstitutionalNumberLabel}</p>
              <p className="mt-2 text-4xl font-black">{CARDENAL_RESPIRA_PROJECT.featuredInstitutionalNumber}</p>
              <p className="mt-2 text-xs font-semibold text-slate-400">Dato institucional/configurable, no medición ambiental.</p>
            </div>
          </Panel>

          <Panel title="Resumen exportable">
            <p className="text-sm font-semibold leading-7 text-slate-300">{summary}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={copySummary} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">
                <Copy size={16} />
                Copiar resumen
              </button>
              <a href={selectedSensor.dashboardUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white">
                Dashboard live
                <ExternalLink size={16} />
              </a>
            </div>
          </Panel>
        </section>
      </section>
    </main>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-7 shadow-2xl backdrop-blur-xl">
      <h2 className="text-3xl font-black">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  )
}
