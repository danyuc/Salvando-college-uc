'use client'

import dynamic from "next/dynamic"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { supabase } from "@/lib/supabase"
import { parseSensorCsv, type SensorPoint } from "./parseSensorCsv"
import { SEMINARIO_SEGMENTS, segmentLabel } from "./seminario/seminarioRoute"
import { autoSegmentByOrder, buildPaperText, buildSegmentAnalysis, avg, max } from "./seminario/seminarioAnalysis"

const LeafletEnvironmentalMap = dynamic(() => import("./LeafletEnvironmentalMap"), { ssr: false })

type Tab = "pm25" | "ruido" | "bacterias" | "tramos" | "analisis" | "paper"

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
  segment_id?: string | null
  direction?: string | null
}

type DecibelSample = {
  id: string
  segment_id: string | null
  direction: string | null
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
  segment_id: string | null
  direction: string | null
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

type MetroSegmentRow = {
  id: string
  segment_id: string | null
  direction: string | null
  line: string | null
  station_origin: string | null
  station_destination: string | null
  segment_type: string | null
  notes: string | null
}

const emptyDb = {
  segment_id: "sj-vv",
  db_exit: "",
  db_mid: "",
  db_arrival: "",
  db_peak: "",
  notes: "",
}

const emptyBacteria = {
  segment_id: "sj-vv",
  sample_code: "",
  sample_place: "Vagón",
  exposure_minutes: "",
  cfu_count: "",
  notes: "",
}

const emptySegment = {
  segment_id: "sj-vv",
  notes: "",
}

function n(value: string) {
  const number = Number(String(value).replace(",", "."))
  return Number.isFinite(number) ? number : null
}

function segmentMeta(segmentId: string) {
  return SEMINARIO_SEGMENTS.find((segment) => segment.id === segmentId) ?? SEMINARIO_SEGMENTS[0]
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
  const [segments, setSegments] = useState<MetroSegmentRow[]>([])
  const [dbForm, setDbForm] = useState(emptyDb)
  const [bacteriaForm, setBacteriaForm] = useState(emptyBacteria)
  const [segmentForm, setSegmentForm] = useState(emptySegment)

  const segmentAnalysis = useMemo(
    () => buildSegmentAnalysis(points, decibels, bacteria),
    [points, decibels, bacteria]
  )

  const paper = useMemo(() => buildPaperText(segmentAnalysis), [segmentAnalysis])

  const metrics = useMemo(() => {
    return {
      pmAvg: avg(points.map((p) => p.pm25)),
      pmPeak: max(points.map((p) => p.pm25)),
      humidityAvg: avg(points.map((p) => p.humidity)),
      tempAvg: avg(points.map((p) => p.temperature)),
      dbAvg: avg(decibels.flatMap((d) => [d.db_exit, d.db_mid, d.db_arrival, d.db_peak])),
      dbPeak: max(decibels.map((d) => d.db_peak)),
      cfuAvg: avg(bacteria.map((b) => b.cfu_count)),
      cfuPeak: max(bacteria.map((b) => b.cfu_count)),
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
        .insert({ owner_id: user.id, title: "Recorrido Seminario San Joaquín - Plaza Egaña" })
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
    const { data } = await supabase.from("environmental_points").select("*").eq("session_id", sessionId).order("sample_number")
    setPoints((data ?? []) as EnvironmentalPoint[])
  }

  async function loadDecibels(sessionId: string) {
    const { data } = await supabase.from("decibel_samples").select("*").eq("session_id", sessionId).order("created_at", { ascending: false })
    setDecibels((data ?? []) as DecibelSample[])
  }

  async function loadBacteria(sessionId: string) {
    const { data } = await supabase.from("bacteria_samples").select("*").eq("session_id", sessionId).order("created_at", { ascending: false })
    setBacteria((data ?? []) as BacteriaSample[])
  }

  async function loadSegments(sessionId: string) {
    const { data } = await supabase.from("metro_segments").select("*").eq("session_id", sessionId).order("created_at", { ascending: false })
    setSegments((data ?? []) as MetroSegmentRow[])
  }

  async function uploadCsv(file: File) {
    if (!session || !userId) return

    setSaving(true)
    setMessage("Procesando CSV del sensor...")

    try {
      const parsed = await parseSensorCsv(file)

      await supabase.from("environmental_points").delete().eq("session_id", session.id)

      const total = parsed.length || 1

      const rows = parsed.map((point, index) => {
        const segmentId = autoSegmentByOrder(index, total)
        const segment = segmentMeta(segmentId)

        return {
          session_id: session.id,
          owner_id: userId,
          segment_id: segmentId,
          direction: segment.direction,
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
        }
      })

      if (rows.length > 0) {
        const { error } = await supabase.from("environmental_points").insert(rows)
        if (error) throw error
      }

      await supabase.from("environmental_sessions").update({ source_file_name: file.name }).eq("id", session.id)
      await loadPoints(session.id)

      setMessage(`CSV guardado en Supabase: ${rows.length} puntos asignados automáticamente a los 5 tramos del recorrido.`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "No se pudo cargar el CSV.")
    }

    setSaving(false)
  }

  async function addDecibel() {
    if (!session || !userId) return

    const segment = segmentMeta(dbForm.segment_id)
    setSaving(true)

    const { error } = await supabase.from("decibel_samples").insert({
      session_id: session.id,
      owner_id: userId,
      segment_id: segment.id,
      direction: segment.direction,
      line: segment.line,
      station_origin: segment.origin,
      station_destination: segment.destination,
      segment_type: segment.type,
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
      setMessage("Ruido guardado en Supabase.")
    }

    setSaving(false)
  }

  async function addBacteria() {
    if (!session || !userId) return

    const segment = segmentMeta(bacteriaForm.segment_id)
    setSaving(true)

    const { error } = await supabase.from("bacteria_samples").insert({
      session_id: session.id,
      owner_id: userId,
      segment_id: segment.id,
      direction: segment.direction,
      sample_code: bacteriaForm.sample_code,
      line: segment.line,
      station_origin: segment.origin,
      station_destination: segment.destination,
      segment_type: segment.type,
      sample_place: bacteriaForm.sample_place,
      exposure_minutes: n(bacteriaForm.exposure_minutes),
      cfu_count: n(bacteriaForm.cfu_count),
      notes: bacteriaForm.notes,
    })

    if (error) setMessage(error.message)
    else {
      setBacteriaForm(emptyBacteria)
      await loadBacteria(session.id)
      setMessage("Muestra bacteriana guardada en Supabase.")
    }

    setSaving(false)
  }

  async function addSegment() {
    if (!session || !userId) return

    const segment = segmentMeta(segmentForm.segment_id)
    setSaving(true)

    const { error } = await supabase.from("metro_segments").insert({
      session_id: session.id,
      owner_id: userId,
      segment_id: segment.id,
      direction: segment.direction,
      line: segment.line,
      station_origin: segment.origin,
      station_destination: segment.destination,
      segment_type: segment.type,
      notes: segmentForm.notes,
    })

    if (error) setMessage(error.message)
    else {
      setSegmentForm(emptySegment)
      await loadSegments(session.id)
      setMessage("Tramo guardado en Supabase.")
    }

    setSaving(false)
  }

  if (loading) {
    return <main className="min-h-screen bg-slate-950 text-white grid place-items-center font-black">Cargando laboratorio desde Supabase...</main>
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">Seminario privado</p>
            <h1 className="text-2xl font-black">Recorrido San Joaquín → Plaza Egaña → San Joaquín</h1>
            <p className="text-xs text-slate-400">Línea 5 + Línea 4 · datos guardados en Supabase · {session?.source_file_name ?? "sin CSV"}</p>
          </div>

          <Link href="/" className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black hover:bg-white/20">
            ← Salir
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <Hero message={message} />

        <section className="mt-8 grid gap-4 md:grid-cols-6">
          <TabButton active={tab === "pm25"} onClick={() => setTab("pm25")} icon="🌫️" title="PM2.5" desc={`${points.length} puntos`} />
          <TabButton active={tab === "ruido"} onClick={() => setTab("ruido")} icon="🔊" title="Ruido" desc={`${decibels.length} registros`} />
          <TabButton active={tab === "bacterias"} onClick={() => setTab("bacterias")} icon="🦠" title="Bacterias" desc={`${bacteria.length} muestras`} />
          <TabButton active={tab === "tramos"} onClick={() => setTab("tramos")} icon="🚇" title="Tramos" desc={`${segments.length} guardados`} />
          <TabButton active={tab === "analisis"} onClick={() => setTab("analisis")} icon="📊" title="Análisis" desc="por segmento" />
          <TabButton active={tab === "paper"} onClick={() => setTab("paper")} icon="📄" title="Paper" desc="automático" />
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <Metric title="PM2.5 promedio" value={metrics.pmAvg === null ? "—" : `${metrics.pmAvg.toFixed(1)} µg/m³`} />
          <Metric title="Peak PM2.5" value={metrics.pmPeak === null ? "—" : `${metrics.pmPeak.toFixed(1)} µg/m³`} />
          <Metric title="Ruido promedio" value={metrics.dbAvg === null ? "—" : `${metrics.dbAvg.toFixed(1)} dB`} />
          <Metric title="Máx. bacterias" value={metrics.cfuPeak === null ? "—" : `${metrics.cfuPeak.toFixed(0)} UFC`} />
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-xl">
          {tab === "pm25" && (
            <Panel title="Carga del CSV del sensor y mapa del recorrido">
              <input type="file" accept=".csv" disabled={saving} onChange={(e) => e.target.files?.[0] && uploadCsv(e.target.files[0])} className="mt-4 block w-full rounded-2xl border border-white/10 bg-slate-900 p-4" />

              <div className="mt-8 h-[500px] overflow-hidden rounded-[2rem] border border-white/10">
                <LeafletEnvironmentalMap points={points} />
              </div>

              <ChartCard title="PM2.5 por muestra">
                <LineChart data={points}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sample_number" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="pm25" stroke="#06b6d4" strokeWidth={3} dot={false} />
                </LineChart>
              </ChartCard>
            </Panel>
          )}

          {tab === "ruido" && (
            <Panel title="Registro de ruido por tramo oficial">
              <FormGrid>
                <SegmentSelect value={dbForm.segment_id} onChange={(v) => setDbForm({ ...dbForm, segment_id: v })} />
                <Input label="dB salida" value={dbForm.db_exit} onChange={(v) => setDbForm({ ...dbForm, db_exit: v })} />
                <Input label="dB mitad" value={dbForm.db_mid} onChange={(v) => setDbForm({ ...dbForm, db_mid: v })} />
                <Input label="dB llegada" value={dbForm.db_arrival} onChange={(v) => setDbForm({ ...dbForm, db_arrival: v })} />
                <Input label="Peak dB" value={dbForm.db_peak} onChange={(v) => setDbForm({ ...dbForm, db_peak: v })} />
                <Input label="Notas" value={dbForm.notes} onChange={(v) => setDbForm({ ...dbForm, notes: v })} />
              </FormGrid>

              <PrimaryButton disabled={saving} onClick={addDecibel}>Guardar ruido</PrimaryButton>
              <DataList title="Registros guardados" rows={decibels.map((d) => `${segmentLabel(d.segment_id ?? "")} · peak ${d.db_peak ?? "—"} dB`)} />

              <ChartCard title="Peak dB por tramo">
                <BarChart data={segmentAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="dbPeak" fill="#22d3ee" />
                </BarChart>
              </ChartCard>
            </Panel>
          )}

          {tab === "bacterias" && (
            <Panel title="Registro de bacterias / UFC por tramo oficial">
              <FormGrid>
                <SegmentSelect value={bacteriaForm.segment_id} onChange={(v) => setBacteriaForm({ ...bacteriaForm, segment_id: v })} />
                <Input label="Código muestra" value={bacteriaForm.sample_code} onChange={(v) => setBacteriaForm({ ...bacteriaForm, sample_code: v })} />
                <Input label="Lugar muestra" value={bacteriaForm.sample_place} onChange={(v) => setBacteriaForm({ ...bacteriaForm, sample_place: v })} />
                <Input label="Minutos exposición" value={bacteriaForm.exposure_minutes} onChange={(v) => setBacteriaForm({ ...bacteriaForm, exposure_minutes: v })} />
                <Input label="UFC / conteo" value={bacteriaForm.cfu_count} onChange={(v) => setBacteriaForm({ ...bacteriaForm, cfu_count: v })} />
                <Input label="Notas" value={bacteriaForm.notes} onChange={(v) => setBacteriaForm({ ...bacteriaForm, notes: v })} />
              </FormGrid>

              <PrimaryButton disabled={saving} onClick={addBacteria}>Guardar bacterias</PrimaryButton>
              <DataList title="Muestras guardadas" rows={bacteria.map((b) => `${b.sample_code ?? "Sin código"} · ${segmentLabel(b.segment_id ?? "")} · ${b.cfu_count ?? "—"} UFC`)} />

              <ChartCard title="UFC por tramo">
                <BarChart data={segmentAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cfuPeak" fill="#a78bfa" />
                </BarChart>
              </ChartCard>
            </Panel>
          )}

          {tab === "tramos" && (
            <Panel title="Clasificación y notas por tramo oficial">
              <FormGrid>
                <SegmentSelect value={segmentForm.segment_id} onChange={(v) => setSegmentForm({ ...segmentForm, segment_id: v })} />
                <Input label="Observación" value={segmentForm.notes} onChange={(v) => setSegmentForm({ ...segmentForm, notes: v })} />
              </FormGrid>

              <PrimaryButton disabled={saving} onClick={addSegment}>Guardar tramo</PrimaryButton>
              <DataList title="Tramos guardados" rows={segments.map((s) => `${segmentLabel(s.segment_id ?? "")} · ${s.segment_type ?? ""} · ${s.notes ?? ""}`)} />
            </Panel>
          )}

          {tab === "analisis" && (
            <Panel title="Análisis ambiental por tramo">
              <div className="grid gap-4">
                {segmentAnalysis.map((row) => (
                  <article key={row.id} className="rounded-3xl border border-white/10 bg-slate-900 p-5">
                    <p className="text-xl font-black">{row.label}</p>
                    <p className="mt-1 text-sm font-bold text-cyan-200">{row.line} · {row.type} · {row.direction}</p>
                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                      <Metric title="PM2.5 prom." value={row.pm25Avg === null ? "—" : `${row.pm25Avg.toFixed(1)}`} />
                      <Metric title="Peak PM2.5" value={row.pm25Peak === null ? "—" : `${row.pm25Peak.toFixed(1)}`} />
                      <Metric title="dB prom." value={row.dbAvg === null ? "—" : `${row.dbAvg.toFixed(1)}`} />
                      <Metric title="UFC peak" value={row.cfuPeak === null ? "—" : `${row.cfuPeak.toFixed(0)}`} />
                    </div>
                  </article>
                ))}
              </div>
            </Panel>
          )}

          {tab === "paper" && (
            <Panel title="Modo paper científico">
              <div className="grid gap-4 md:grid-cols-2">
                <PaperBlock title="Hipótesis" text={paper.hypothesis} />
                <PaperBlock title="Resultado preliminar" text={paper.preliminary} />
                <PaperBlock title="Interpretación" text={paper.interpretation} />
                <PaperBlock title="Limitaciones" text={paper.limitations} />
              </div>
            </Panel>
          )}
        </section>
      </section>
    </main>
  )
}

function Hero({ message }: { message: string }) {
  return (
    <div className="rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-slate-900 p-8 shadow-2xl">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-200">Recorrido oficial del estudio</p>
      <h2 className="mt-3 max-w-5xl text-4xl font-black leading-tight md:text-6xl">
        San Joaquín → Vicente Valdés → Trinidad → Plaza Egaña → regreso
      </h2>
      <p className="mt-5 max-w-3xl text-lg font-medium text-slate-300">
        Sistema centrado en Línea 5 y Línea 4 para comparar PM2.5, humedad, temperatura, ruido y bacterias entre tramos subterráneos, elevados y de transición.
      </p>
      {message && <p className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm font-bold text-cyan-100">{message}</p>}
    </div>
  )
}

function TabButton({ active, onClick, icon, title, desc }: { active: boolean; onClick: () => void; icon: string; title: string; desc: string }) {
  return (
    <button onClick={onClick} className={`rounded-3xl border p-5 text-left transition ${active ? "border-cyan-300 bg-cyan-400/20" : "border-white/10 bg-white/10 hover:bg-white/15"}`}>
      <p className="text-3xl">{icon}</p>
      <p className="mt-3 text-xl font-black">{title}</p>
      <p className="mt-1 text-sm text-slate-300">{desc}</p>
    </button>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/10 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </article>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h3 className="text-3xl font-black">{title}</h3><div className="mt-5">{children}</div></div>
}

function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>
}

function SegmentSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Tramo oficial</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 font-bold outline-none">
        {SEMINARIO_SEGMENTS.map((segment) => (
          <option key={segment.id} value={segment.id}>
            {segment.origin} → {segment.destination} · {segment.line} · {segment.type}
          </option>
        ))}
      </select>
    </label>
  )
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 font-bold outline-none" />
    </label>
  )
}

function PrimaryButton({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return <button disabled={disabled} onClick={onClick} className="mt-6 rounded-2xl bg-white px-5 py-3 font-black text-slate-950 hover:bg-slate-200 disabled:opacity-60">{children}</button>
}

function DataList({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900 p-5">
      <p className="font-black">{title}</p>
      {rows.length === 0 ? <p className="mt-2 text-sm text-slate-400">Sin datos guardados todavía.</p> : (
        <div className="mt-3 grid gap-2">
          {rows.map((row, index) => <p key={`${row}-${index}`} className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-300">{row}</p>)}
        </div>
      )}
    </div>
  )
}

function PaperBlock({ title, text }: { title: string; text: string }) {
  return <article className="rounded-3xl border border-white/10 bg-slate-900 p-5"><h4 className="text-xl font-black">{title}</h4><p className="mt-3 text-sm leading-6 text-slate-300">{text}</p></article>
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <div className="mt-8 rounded-[2rem] border border-white/10 bg-slate-900 p-6">
      <h3 className="text-2xl font-black">{title}</h3>
      <div className="mt-6 h-[320px]">
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
    </div>
  )
}
