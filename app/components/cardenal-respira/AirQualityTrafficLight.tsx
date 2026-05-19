"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  AIR_QUALITY_THRESHOLDS,
  STATUS_LABELS,
  getAirQualityFromPm25,
  type SensorReading,
} from "@/lib/cardenal-respira"

const colors = {
  green: "bg-emerald-400 text-emerald-950 shadow-emerald-400/30",
  yellow: "bg-yellow-300 text-yellow-950 shadow-yellow-300/30",
  orange: "bg-orange-400 text-orange-950 shadow-orange-400/30",
  red: "bg-red-500 text-white shadow-red-500/30",
  purple: "bg-purple-600 text-white shadow-purple-600/30",
}

type ManualValues = {
  pm25: string
  pm10: string
  temperature: string
  humidity: string
}

export default function AirQualityTrafficLight({
  reading,
  editable = false,
  onManualReading,
}: {
  reading: SensorReading
  editable?: boolean
  onManualReading?: (reading: SensorReading) => void
}) {
  const [manual, setManual] = useState<ManualValues>({
    pm25: String(reading.pm25 ?? ""),
    pm10: String(reading.pm10 ?? ""),
    temperature: String(reading.temperature ?? ""),
    humidity: String(reading.humidity ?? ""),
  })

  const effectiveReading = useMemo(() => {
    if (!editable || reading.status !== "manual") return reading
    const pm25 = Number(manual.pm25)
    const pm10 = Number(manual.pm10)
    const temperature = Number(manual.temperature)
    const humidity = Number(manual.humidity)
    const threshold = getAirQualityFromPm25(Number.isFinite(pm25) ? pm25 : null)
    return {
      ...reading,
      pm25: Number.isFinite(pm25) ? pm25 : null,
      pm10: Number.isFinite(pm10) ? pm10 : null,
      temperature: Number.isFinite(temperature) ? temperature : null,
      humidity: Number.isFinite(humidity) ? humidity : null,
      timestamp: new Date().toISOString(),
      educationalInterpretation: `Tal día hubo condición ${threshold.label.toLowerCase()}; esto abre una conversación pedagógica sobre ventilación, horarios y entorno urbano.`,
      recommendedAction: threshold.action,
    }
  }, [editable, manual, reading])

  const threshold = getAirQualityFromPm25(effectiveReading.pm25)

  useEffect(() => {
    if (!editable || reading.status !== "manual") return
    localStorage.setItem("crsh-manual-reading", JSON.stringify(effectiveReading))
    onManualReading?.(effectiveReading)
  }, [editable, effectiveReading, onManualReading, reading.status])

  return (
    <article className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 text-white shadow-2xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
            Semáforo educativo
          </p>
          <h3 className="mt-2 text-2xl font-black">{threshold.label}</h3>
          <span className="mt-2 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black text-slate-200">
            {STATUS_LABELS[effectiveReading.status]}
          </span>
        </div>
        <motion.div
          className={`grid h-16 w-16 place-items-center rounded-full shadow-2xl ${colors[threshold.color]}`}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          {effectiveReading.pm25 ?? "—"}
        </motion.div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Metric label="PM2.5" value={effectiveReading.pm25} suffix="µg/m³" />
        <Metric label="PM10" value={effectiveReading.pm10} suffix="µg/m³" />
        <Metric label="Temp." value={effectiveReading.temperature} suffix="°C" />
        <Metric label="Humedad" value={effectiveReading.humidity} suffix="%" />
      </div>

      {editable && reading.status === "manual" && (
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {([
            ["pm25", "PM2.5"],
            ["pm10", "PM10"],
            ["temperature", "Temperatura"],
            ["humidity", "Humedad"],
          ] as const).map(([key, label]) => (
            <label key={key} className="grid gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              {label}
              <input
                value={manual[key]}
                onChange={(event) => setManual((current) => ({ ...current, [key]: event.target.value }))}
                inputMode="decimal"
                className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-base font-black normal-case tracking-normal text-white outline-none"
              />
            </label>
          ))}
        </div>
      )}

      <p className="mt-4 text-sm font-semibold leading-6 text-slate-300">
        {effectiveReading.educationalInterpretation}
      </p>

      <p className="mt-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm font-black text-cyan-50">
        Acción educativa: {effectiveReading.recommendedAction}
      </p>

      <div className="mt-5 grid gap-2">
        {AIR_QUALITY_THRESHOLDS.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2 text-xs font-bold text-slate-300">
            <span>{item.label}</span>
            <span>{item.range} PM2.5</span>
          </div>
        ))}
      </div>

      <p className="mt-4 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-3 text-xs font-bold leading-5 text-amber-100">
        {effectiveReading.sourceLabel}
      </p>
    </article>
  )
}

function Metric({ label, value, suffix }: { label: string; value: number | null; suffix: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-3">
      <p className="text-xs font-black text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black">
        {value ?? "—"} <span className="text-xs text-slate-400">{value === null ? "" : suffix}</span>
      </p>
    </div>
  )
}
