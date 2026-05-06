'use client'

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { parseSensorCsv, type SensorPoint } from "./parseSensorCsv"

type Tab = "pm25" | "ruido" | "bacterias" | "tramos" | "paper"

type SessionRow = {
  id: string
  title: string
  source_file_name: string | null
  created_at: string
}

type EnvironmentalPoint = SensorPoint & {
  id?: string
  session_id?: string
  owner_id?: string
}

type DecibelSample = {
  id: string
  line: string | null
  station_origin: string | null
  station_destination: string | null
  segment_type: string | null
  db_exit: number | null
  db_mid: number | null
  db_arrival: number | null
  db_peak: number | null
  notes: string | null
}

type BacteriaSample = {
  id: string
  sample_code: string | null
  line: string | null
  station_origin: string | null
  station_destination: string | null
  segment_type: string | null
  sample_place: string | null
  exposure_minutes: number | null
  cfu_count: number | null
  notes: string | null
}

type MetroSegment = {
  id: string
  line: string | null
  station_origin: string | null
  station_destination: string | null
  segment_type: string | null
  notes: string | null
}

const emptyDb = {
  line: "",
  station_origin: "",
  station_destination: "",
  segment_type: "Subterráneo",
  db_exit: "",
  db_mid: "",
  db_arrival: "",
  db_peak: "",
  notes: "",
}

const emptyBacteria = {
  sample_code: "",
  line: "",
  station_origin: "",
  station_destination: "",
  segment_type: "Subterráneo",
  sample_place: "Vagón",
  exposure_minutes: "",
  cfu_count: "",
  notes: "",
}

const emptySegment = {
  line: "",
  station_origin: "",
  station_destination: "",
  segment_type: "Subterráneo",
  notes: "",
}

function avg(values: Array<number | null | undefined>) {
  const clean = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v))
  if (!clean.length) return null
  return clean.reduce((a, b) => a + b, 0) / clean.length
}

function max(values: Array<number | null | undefined>) {
  const clean = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v))
  if (!clean.length) return null
  return Math.max(...clean)
}

function n(value: string) {
  const number = Number(String(value).replace(",", "."))
  return Number.isFinite(number) ? number : null
}

export default function LabAmbientalClient() {
  const [tab, setTab] = useState<Tab>("pm25")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [userId, setUserId] = useState("")
  const [session, setSession] = useState<SessionRow | null>(null)
  const [points, setPoints] = useState<EnvironmentalPoint[]>([])
  const [decibels, setDecibels] = useState<DecibelSample[]>([])
  const [bacteria, setBacteria] = useState<BacteriaSample[]>([])
  const [segments, setSegments] = useState<MetroSegment[]>([])
  const [dbForm, setDbForm] = useState(emptyDb)
  const [bacteriaForm, setBacteriaForm] = useState(emptyBacteria)
  const [segmentForm, setSegmentForm] = useState(emptySegment)

  const metrics = useMemo(() => {
    const pmAvg = avg(points.map((p) => p.pm25))
    const pmPeak = max(points.map((p) => p.pm25))
    const humidityAvg = avg(points.map((p) => p.humidity))
    const tempAvg = avg(points.map((p) => p.temperature))
    const dbAvg = avg(decibels.flatMap((d) => [d.db_exit, d.db_mid, d.db_arrival, d.db_peak]))
    const dbPeak = max(decibels.map((d) => d.db_peak))
    const bacAvg = avg(bacteria.map((b) => b.cfu_count))
    const bacMax = max(bacteria.map((b) => b.cfu_count))

    return {
      pmAvg,
      pmPeak,
      humidityAvg,
      tempAvg,
      dbAvg,
      dbPeak,
      bacAvg,
      bacMax,
    }
  }, [points, decibels, bacteria])

  useEffect(() => {
    loadCloudData()
  }, [])

  async function loadCloudData() {
    setLoading(true)
    setMessage("")

    const { data: sessionData } = await supabase.auth.getSession()
    const user = sessionData.session?.user

    if (!user) {
      setMessage("No hay sesión activa.")
      setLoading(false)
      return
    }

    setUserId(user.id)

    const { data: sessions, error: sessionError } = await supabase
      .from("environmental_sessions")
      .select("id,title,source_file_name,created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)

    if (sessionError) {
      setMessage(sessionError.message)
      setLoading(false)
      return
    }

    let currentSession = sessions?.[0] as SessionRow | undefined

    if (!currentSession) {
      const { data: created, error } = await supabase
        .from("environmental_sessions")
        .insert({
          owner_id: user.id,
          title: "Laboratorio Ambiental Metro",
        })
        .select("id,title,source_file_name,created_at")
        .single()

      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }

      currentSession = created as SessionRow
    }

    setSession(currentSession)

    await Promise.all([
      loadPoints(currentSession.id),
      loadDecibels(currentSession.id),
      loadBacteria(currentSession.id),
      loadSegments(currentSession.id),
    ])

    setLoading(false)
  }

  async function loadPoints(sessionId: string) {
    const { data, error } = await supabase
      .from("environmental_points")
      .select("*")
      .eq("session_id", sessionId)
      .order("sample_number", { ascending: true })

    if (!error) setPoints((data ?? []) as EnvironmentalPoint[])
  }

  async function loadDecibels(sessionId: string) {
    const { data, error } = await supabase
      .from("decibel_samples")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })

    if (!error) setDecibels((data ?? []) as DecibelSample[])
  }

  async function loadBacteria(sessionId: string) {
    const { data, error } = await supabase
      .from("bacteria_samples")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })

    if (!error) setBacteria((data ?? []) as BacteriaSample[])
  }

  async function loadSegments(sessionId: string) {
    const { data, error } = await supabase
      .from("metro_segments")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })

    if (!error) setSegments((data ?? []) as MetroSegment[])
  }

  async function uploadCsv(file: File) {
    if (!session || !userId) return

    setSaving(true)
    setMessage("Procesando CSV...")

    try {
      const parsed = await parseSensorCsv(file)

      const { error: deleteError } = await supabase
        .from("environmental_points")
        .delete()
        .eq("session_id", session.id)

      if (deleteError) throw deleteError

      const rows = parsed.map((point) => ({
        session_id: session.id,
        owner_id: userId,
        sample_number: point.sample_number,
        device_session: point.device_session,
        raw_timestamp: point.raw_timestamp,
        recorded_at: point.recorded_at,
        lat: point.lat,
        lng: point.lng,
        battery: point.battery,
        pm25: point.pm25,
        humidity: point.humidity,
        temperature: point.temperature,
        valid_session: point.valid_session,
        cache_status: point.cache_status,
      }))

      if (rows.length > 0) {
        const { error } = await supabase.from("environmental_points").insert(rows)
        if (error) throw error
      }

      await supabase
        .from("environmental_sessions")
        .update({ source_file_name: file.name })
        .eq("id", session.id)

      await loadPoints(session.id)
      setMessage(`CSV guardado en la nube: ${rows.length} puntos.`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "No se pudo cargar el CSV.")
    }

    setSaving(false)
  }

  async function addDecibel() {
    if (!session || !userId) return

    setSaving(true)

    const { error } = await supabase.from("decibel_samples").insert({
      session_id: session.id,
      owner_id: userId,
      line: dbForm.line,
      station_origin: dbForm.station_origin,
      station_destination: dbForm.station_destination,
      segment_type: dbForm.segment_type,
      db_exit: n(dbForm.db_exit),
      db_mid: n(dbForm.db_mid),
      db_arrival: n(dbForm.db_arrival),
      db_peak: n(dbForm.db_peak),
      notes: dbForm.notes,
    })

    if (error) setMessage(error.message)
    else {
      setDbForm(emptyDb)
      await loadDecibels(session.id)
      setMessage("Registro de ruido guardado en la nube.")
    }

    setSaving(false)
  }

  async function addBacteria() {
    if (!session || !userId) return

    setSaving(true)

    const { error } = await supabase.from("bacteria_samples").insert({
      session_id: session.id,
      owner_id: userId,
      sample_code: bacteriaForm.sample_code,
      line: bacteriaForm.line,
      station_origin: bacteriaForm.station_origin,
      station_destination: bacteriaForm.station_destination,
      segment_type: bacteriaForm.segment_type,
      sample_place: bacteriaForm.sample_place,
      exposure_minutes: n(bacteriaForm.exposure_minutes),
      cfu_count: n(bacteriaForm.cfu_count),
      notes: bacteriaForm.notes,
    })

    if (error) setMessage(error.message)
    else {
      setBacteriaForm(emptyBacteria)
      await loadBacteria(session.id)
      setMessage("Muestra bacteriana guardada en la nube.")
    }

    setSaving(false)
  }

  async function addSegment() {
    if (!session || !userId) return

    setSaving(true)

    const { error } = await supabase.from("metro_segments").insert({
      session_id: session.id,
      owner_id: userId,
      line: segmentForm.line,
      station_origin: segmentForm.station_origin,
      station_destination: segmentForm.station_destination,
      segment_type: segmentForm.segment_type,
      notes: segmentForm.notes,
    })

    if (error) setMessage(error.message)
    else {
      setSegmentForm(emptySegment)
      await loadSegments(session.id)
      setMessage("Tramo guardado en la nube.")
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white grid place-items-center font-black">
        Cargando laboratorio desde Supabase...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">Seminario privado</p>
            <h1 className="text-2xl font-black">Laboratorio Ambiental Metro</h1>
            <p className="text-xs text-slate-400">
              Datos guardados en Supabase · {session?.source_file_name ?? "sin CSV"}
            </p>
          </div>

          <Link href="/" className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black hover:bg-white/20">
            ← Salir al inicio
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-slate-900 p-8 shadow-2xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-200">Investigación aplicada</p>

          <h2 className="mt-3 max-w-5xl text-4xl font-black leading-tight md:text-6xl">
            PM2.5, humedad, temperatura, ruido, bacterias y tramos del Metro
          </h2>

          <p className="mt-5 max-w-3xl text-lg font-medium text-slate-300">
            Todo lo que cargues o registres queda guardado en Supabase y se recupera al volver a abrir la página.
          </p>

          {message && (
            <p className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm font-bold text-cyan-100">
              {message}
            </p>
          )}
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-5">
          {[
            ["pm25", "🌫️", "PM2.5", `${points.length} puntos`],
            ["ruido", "🔊", "Ruido", `${decibels.length} registros`],
            ["bacterias", "🦠", "Bacterias", `${bacteria.length} muestras`],
            ["tramos", "🚇", "Tramos", `${segments.length} clasificados`],
            ["paper", "📄", "Paper", "Resumen científico"],
          ].map(([key, icon, title, desc]) => (
            <button
              key={key}
              onClick={() => setTab(key as Tab)}
              className={`rounded-3xl border p-5 text-left transition ${
                tab === key ? "border-cyan-300 bg-cyan-400/20" : "border-white/10 bg-white/10 hover:bg-white/15"
              }`}
            >
              <p className="text-3xl">{icon}</p>
              <p className="mt-3 text-xl font-black">{title}</p>
              <p className="mt-1 text-sm text-slate-300">{desc}</p>
            </button>
          ))}
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <Metric title="PM2.5 promedio" value={metrics.pmAvg === null ? "—" : `${metrics.pmAvg.toFixed(1)} µg/m³`} />
          <Metric title="Peak PM2.5" value={metrics.pmPeak === null ? "—" : `${metrics.pmPeak.toFixed(1)} µg/m³`} />
          <Metric title="Humedad promedio" value={metrics.humidityAvg === null ? "—" : `${metrics.humidityAvg.toFixed(1)} %`} />
          <Metric title="Temperatura promedio" value={metrics.tempAvg === null ? "—" : `${metrics.tempAvg.toFixed(1)} °C`} />
          <Metric title="Ruido promedio" value={metrics.dbAvg === null ? "—" : `${metrics.dbAvg.toFixed(1)} dB`} />
          <Metric title="Peak dB" value={metrics.dbPeak === null ? "—" : `${metrics.dbPeak.toFixed(1)} dB`} />
          <Metric title="Bacterias promedio" value={metrics.bacAvg === null ? "—" : `${metrics.bacAvg.toFixed(1)} UFC`} />
          <Metric title="Máx. bacterias" value={metrics.bacMax === null ? "—" : `${metrics.bacMax.toFixed(0)} UFC`} />
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-xl">
          {tab === "pm25" && (
            <Panel title="Carga de CSV del sensor">
              <input
                type="file"
                accept=".csv"
                disabled={saving}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) uploadCsv(file)
                }}
                className="mt-4 block w-full rounded-2xl border border-white/10 bg-slate-900 p-4"
              />

              <DataList title="Puntos guardados" rows={points.slice(0, 8).map((p) => `${p.sample_number} · PM2.5 ${p.pm25 ?? "—"} · Humedad ${p.humidity ?? "—"} · Temp ${p.temperature ?? "—"}`)} />
            </Panel>
          )}

          {tab === "ruido" && (
            <Panel title="Registro manual de ruido">
              <FormGrid>
                <Input label="Línea" value={dbForm.line} onChange={(v) => setDbForm({ ...dbForm, line: v })} />
                <Input label="Estación origen" value={dbForm.station_origin} onChange={(v) => setDbForm({ ...dbForm, station_origin: v })} />
                <Input label="Estación destino" value={dbForm.station_destination} onChange={(v) => setDbForm({ ...dbForm, station_destination: v })} />
                <Select label="Tipo de tramo" value={dbForm.segment_type} onChange={(v) => setDbForm({ ...dbForm, segment_type: v })} />
                <Input label="dB salida" value={dbForm.db_exit} onChange={(v) => setDbForm({ ...dbForm, db_exit: v })} />
                <Input label="dB mitad" value={dbForm.db_mid} onChange={(v) => setDbForm({ ...dbForm, db_mid: v })} />
                <Input label="dB llegada" value={dbForm.db_arrival} onChange={(v) => setDbForm({ ...dbForm, db_arrival: v })} />
                <Input label="Peak dB" value={dbForm.db_peak} onChange={(v) => setDbForm({ ...dbForm, db_peak: v })} />
              </FormGrid>

              <PrimaryButton disabled={saving} onClick={addDecibel}>Guardar ruido en nube</PrimaryButton>
              <DataList title="Registros guardados" rows={decibels.map((d) => `${d.line ?? ""} ${d.station_origin ?? ""} → ${d.station_destination ?? ""} · peak ${d.db_peak ?? "—"} dB`)} />
            </Panel>
          )}

          {tab === "bacterias" && (
            <Panel title="Registro manual de bacterias / hisopos">
              <FormGrid>
                <Input label="Código muestra" value={bacteriaForm.sample_code} onChange={(v) => setBacteriaForm({ ...bacteriaForm, sample_code: v })} />
                <Input label="Línea" value={bacteriaForm.line} onChange={(v) => setBacteriaForm({ ...bacteriaForm, line: v })} />
                <Input label="Estación origen" value={bacteriaForm.station_origin} onChange={(v) => setBacteriaForm({ ...bacteriaForm, station_origin: v })} />
                <Input label="Estación destino" value={bacteriaForm.station_destination} onChange={(v) => setBacteriaForm({ ...bacteriaForm, station_destination: v })} />
                <Select label="Tipo de tramo" value={bacteriaForm.segment_type} onChange={(v) => setBacteriaForm({ ...bacteriaForm, segment_type: v })} />
                <Input label="Lugar muestra" value={bacteriaForm.sample_place} onChange={(v) => setBacteriaForm({ ...bacteriaForm, sample_place: v })} />
                <Input label="Minutos exposición" value={bacteriaForm.exposure_minutes} onChange={(v) => setBacteriaForm({ ...bacteriaForm, exposure_minutes: v })} />
                <Input label="UFC / conteo" value={bacteriaForm.cfu_count} onChange={(v) => setBacteriaForm({ ...bacteriaForm, cfu_count: v })} />
              </FormGrid>

              <PrimaryButton disabled={saving} onClick={addBacteria}>Guardar bacterias en nube</PrimaryButton>
              <DataList title="Muestras guardadas" rows={bacteria.map((b) => `${b.sample_code ?? "Sin código"} · ${b.sample_place ?? ""} · ${b.cfu_count ?? "—"} UFC`)} />
            </Panel>
          )}

          {tab === "tramos" && (
            <Panel title="Clasificación de tramos">
              <FormGrid>
                <Input label="Línea" value={segmentForm.line} onChange={(v) => setSegmentForm({ ...segmentForm, line: v })} />
                <Input label="Estación origen" value={segmentForm.station_origin} onChange={(v) => setSegmentForm({ ...segmentForm, station_origin: v })} />
                <Input label="Estación destino" value={segmentForm.station_destination} onChange={(v) => setSegmentForm({ ...segmentForm, station_destination: v })} />
                <Select label="Tipo" value={segmentForm.segment_type} onChange={(v) => setSegmentForm({ ...segmentForm, segment_type: v })} />
                <Input label="Observación" value={segmentForm.notes} onChange={(v) => setSegmentForm({ ...segmentForm, notes: v })} />
              </FormGrid>

              <PrimaryButton disabled={saving} onClick={addSegment}>Guardar tramo en nube</PrimaryButton>
              <DataList title="Tramos guardados" rows={segments.map((s) => `${s.line ?? ""} ${s.station_origin ?? ""} → ${s.station_destination ?? ""} · ${s.segment_type ?? ""}`)} />
            </Panel>
          )}

          {tab === "paper" && (
            <Panel title="Modo paper científico">
              <div className="grid gap-4 md:grid-cols-2">
                <PaperBlock title="Hipótesis" text="Los tramos subterráneos podrían presentar mayores concentraciones acumuladas de PM2.5 por menor ventilación relativa, mientras que ruido y bacterias pueden variar según flujo de pasajeros, tipo de estación y hora de muestreo." />
                <PaperBlock title="Resultado preliminar" text={`Se registran ${points.length} puntos GPS/PM2.5, ${decibels.length} registros de ruido, ${bacteria.length} muestras bacterianas y ${segments.length} tramos clasificados.`} />
                <PaperBlock title="Limitaciones" text="Los resultados deben interpretarse como exploratorios: dependen de horario, cantidad de muestras, calibración del sensor, exposición de hisopos y consistencia del recorrido." />
                <PaperBlock title="Lectura académica" text="El módulo permite construir una matriz comparativa por tipo de tramo, integrando mediciones ambientales automáticas y registros manuales para fundamentar el análisis del seminario." />
              </div>
            </Panel>
          )}
        </section>
      </section>
    </main>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/10 p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
    </article>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-3xl font-black">{title}</h3>
      <div className="mt-5">{children}</div>
    </div>
  )
}

function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{children}</div>
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 font-bold outline-none"
      />
    </label>
  )
}

function Select({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 font-bold outline-none"
      >
        <option>Subterráneo</option>
        <option>Elevado</option>
        <option>Transición</option>
        <option>Estación</option>
      </select>
    </label>
  )
}

function PrimaryButton({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="mt-6 rounded-2xl bg-white px-5 py-3 font-black text-slate-950 hover:bg-slate-200 disabled:opacity-60"
    >
      {children}
    </button>
  )
}

function DataList({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900 p-5">
      <p className="font-black">{title}</p>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400">Sin datos guardados todavía.</p>
      ) : (
        <div className="mt-3 grid gap-2">
          {rows.map((row, index) => (
            <p key={`${row}-${index}`} className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-300">
              {row}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

function PaperBlock({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-900 p-5">
      <h4 className="text-xl font-black">{title}</h4>
      <p className="mt-3 text-sm leading-6 text-slate-300">{text}</p>
    </article>
  )
}
