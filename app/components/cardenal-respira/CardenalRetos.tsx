"use client"

import confetti from "canvas-confetti"
import { useMemo, useState } from "react"
import {
  Camera,
  ChevronRight,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react"
import {
  CRSH_CHALLENGE_PACKS,
  CRSH_SCORING,
  CRSH_SENSORS,
  STATUS_LABELS,
  buildDemoReading,
  getAirQualityFromPm25,
  type ChallengeType,
  type CrshChallengeQuestion,
} from "@/lib/cardenal-respira"

type Votes = [number, number, number, number]

type RankingEntry = {
  schoolName: string
  courseName: string
  totalPoints: number
  lastChallenge: string
  lastSensor: string
  streak: number
  badges: string[]
  challengesCompleted: number
}

const RANKING_KEY = "crsh-classroom-ranking"
const challengeTypes: Array<{ id: ChallengeType; label: string }> = [
  { id: "pm25-basico", label: "PM2.5 básico" },
  { id: "pm10-vs-pm25", label: "PM10 vs PM2.5" },
  { id: "semaforo-ambiental", label: "Semáforo ambiental" },
  { id: "interpretacion-datos", label: "Interpretación de datos" },
  { id: "decisiones-escolares", label: "Decisiones escolares" },
  { id: "ciencia-ciudadana", label: "Ciencia ciudadana" },
  { id: "tp-innovacion", label: "TP / innovación" },
  { id: "sensor-71", label: "Sensor 71" },
]

export default function CardenalRetos() {
  const [sensorId, setSensorId] = useState(CRSH_SENSORS[0].id)
  const [challengeType, setChallengeType] = useState<ChallengeType>("pm25-basico")
  const [questionIndex, setQuestionIndex] = useState(0)
  const [votes, setVotes] = useState<Votes>([0, 0, 0, 0])
  const [revealed, setRevealed] = useState(false)
  const [courseName, setCourseName] = useState("7A")
  const [schoolName, setSchoolName] = useState("Colegio Cardenal Raúl Silva Henríquez")
  const [ranking, setRanking] = useState<RankingEntry[]>(() => {
    if (typeof window === "undefined") return []
    try {
      return JSON.parse(localStorage.getItem(RANKING_KEY) ?? "[]") as RankingEntry[]
    } catch {
      return []
    }
  })
  const [streak, setStreak] = useState(0)
  const [lastDelta, setLastDelta] = useState(0)

  const sensor = CRSH_SENSORS.find((item) => item.id === sensorId) ?? CRSH_SENSORS[0]
  const reading = buildDemoReading(sensor, sensor.id === "sensor-71-college-uc" ? 1 : 2)
  const threshold = getAirQualityFromPm25(reading.pm25)

  const questions = useMemo(() => {
    const filtered = CRSH_CHALLENGE_PACKS.filter((question) => question.packId === challengeType)
    if (filtered.length > 0) return filtered
    return [buildContextQuestion(challengeType, reading)]
  }, [challengeType, reading])

  const question = questions[questionIndex % questions.length]
  const totalVotes = votes.reduce((sum, value) => sum + value, 0)
  const majorityIndex = votes.reduce((bestIndex, value, index) => value > votes[bestIndex] ? index : bestIndex, 0)
  const correctVotes = votes[question.correctIndex] ?? 0
  const correctRate = totalVotes > 0 ? correctVotes / totalVotes : 0
  const majorityCorrect = totalVotes > 0 && majorityIndex === question.correctIndex

  function updateVote(index: number, delta: number) {
    setVotes((current) => {
      const next = [...current] as Votes
      next[index] = Math.max(0, next[index] + delta)
      return next
    })
  }

  function calculateScore() {
    if (revealed) return

    let delta = CRSH_SCORING.noVotes
    let nextStreak = 0
    const badges = new Set<string>(["Reto completado"])

    if (totalVotes > 0 && majorityCorrect) {
      delta = correctRate >= 0.9
        ? CRSH_SCORING.correctMajority90
        : correctRate >= 0.7
          ? CRSH_SCORING.correctMajority70
          : CRSH_SCORING.correctMajority
      nextStreak = streak + 1
      badges.add("Semáforo dominado")
      badges.add("Mayoría correcta")
      if (question.packId === "pm25-basico") badges.add("Expertos PM2.5")
      if (question.environmentalInsightBonus) delta += CRSH_SCORING.environmentalInsight
      if (nextStreak >= 3) {
        delta += nextStreak >= 5 ? CRSH_SCORING.streak5 : CRSH_SCORING.streak3
        badges.add("Racha ambiental")
      }
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 } })
    } else if (totalVotes > 0) {
      delta = CRSH_SCORING.wrongMajority
      nextStreak = 0
      badges.add("Detectives del aire")
    }

    setStreak(nextStreak)
    setLastDelta(delta)
    setRevealed(true)
    persistRanking(delta, nextStreak, Array.from(badges))
  }

  function persistRanking(delta: number, nextStreak: number, badges: string[]) {
    const nextRanking = [...ranking]
    const existing = nextRanking.find((entry) => entry.schoolName === schoolName && entry.courseName === courseName)
    if (existing) {
      existing.totalPoints = Math.max(0, existing.totalPoints + delta)
      existing.lastChallenge = question.packTitle
      existing.lastSensor = sensor.shortName
      existing.streak = nextStreak
      existing.badges = Array.from(new Set([...existing.badges, ...badges]))
      existing.challengesCompleted += 1
    } else {
      nextRanking.push({
        schoolName,
        courseName,
        totalPoints: Math.max(0, delta),
        lastChallenge: question.packTitle,
        lastSensor: sensor.shortName,
        streak: nextStreak,
        badges,
        challengesCompleted: 1,
      })
    }

    nextRanking.sort((a, b) => b.totalPoints - a.totalPoints)
    setRanking(nextRanking)
    localStorage.setItem(RANKING_KEY, JSON.stringify(nextRanking))
  }

  function nextQuestion() {
    setQuestionIndex((index) => index + 1)
    setVotes([0, 0, 0, 0])
    setRevealed(false)
    setLastDelta(0)
  }

  function resetVotes() {
    setVotes([0, 0, 0, 0])
    setRevealed(false)
    setLastDelta(0)
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.22),transparent_32%),radial-gradient(circle_at_top_right,rgba(168,85,247,.2),transparent_30%),linear-gradient(135deg,#020617,#0f172a)] px-5 py-8 text-white md:px-10">
      <section className="mx-auto grid max-w-7xl gap-6">
        <header className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-7 shadow-2xl backdrop-blur-xl">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-300">Retos ambientales</p>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">Reto ambiental en vivo</h1>
          <p className="mt-4 max-w-3xl text-base font-semibold leading-8 text-slate-300">
            Herramienta docente para participación manual por curso: sensor, semáforo, votación con manos, puntos, rachas y ranking local.
          </p>
          <p className="mt-4 w-fit rounded-full border border-amber-300/25 bg-amber-300/10 px-4 py-2 text-xs font-black text-amber-100">
            Ranking en modo demo local hasta conectar base de datos.
          </p>
        </header>

        <section className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl lg:grid-cols-4">
          <Field label="Colegio" value={schoolName} onChange={setSchoolName} />
          <Field label="Curso" value={courseName} onChange={setCourseName} />
          <label className="grid gap-2 text-sm font-black text-slate-200">
            Sensor
            <select value={sensorId} onChange={(event) => setSensorId(event.target.value)} className="min-h-12 rounded-2xl border border-white/10 bg-slate-950 px-4 text-white">
              {CRSH_SENSORS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-black text-slate-200">
            Tipo de reto
            <select value={challengeType} onChange={(event) => { setChallengeType(event.target.value as ChallengeType); setQuestionIndex(0); resetVotes() }} className="min-h-12 rounded-2xl border border-white/10 bg-slate-950 px-4 text-white">
              {challengeTypes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-7 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-200">{question.packTitle}</p>
                <h2 className="mt-3 text-3xl font-black md:text-5xl">{question.prompt}</h2>
              </div>
              <div className="rounded-3xl bg-slate-950/70 p-4 text-right">
                <p className="text-xs font-black text-slate-400">{STATUS_LABELS[reading.status]}</p>
                <p className="mt-1 text-2xl font-black">{sensor.shortName}</p>
                <p className="text-sm font-bold text-cyan-200">{threshold.label}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {question.options.map((option, index) => (
                <div key={option} className={[
                  "rounded-3xl border p-5 transition",
                  revealed && index === question.correctIndex ? "border-emerald-300 bg-emerald-300/15" : "border-white/10 bg-slate-950/55",
                  revealed && index === majorityIndex && index !== question.correctIndex ? "border-red-300 bg-red-400/15" : "",
                ].join(" ")}>
                  <p className="text-2xl font-black">{String.fromCharCode(65 + index)}. {option}</p>
                  <p className="mt-4 text-sm font-black text-cyan-100">Levanten la mano quienes creen que es {String.fromCharCode(65 + index)}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => updateVote(index, -1)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10"><Minus size={16} /></button>
                    <input
                      value={votes[index]}
                      onChange={(event) => {
                        const next = [...votes] as Votes
                        next[index] = Math.max(0, Number(event.target.value) || 0)
                        setVotes(next)
                      }}
                      className="h-12 w-20 rounded-2xl border border-white/10 bg-white/10 text-center text-xl font-black outline-none"
                    />
                    <button onClick={() => updateVote(index, 1)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10"><Plus size={16} /></button>
                    <button onClick={() => updateVote(index, 5)} className="rounded-full bg-cyan-300 px-3 py-2 text-sm font-black text-slate-950">+5</button>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${totalVotes ? (votes[index] / totalVotes) * 100 : 0}%` }} />
                  </div>
                  <p className="mt-2 text-sm font-bold text-slate-300">{votes[index]} estudiantes</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={calculateScore} className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">Calcular resultado</button>
              <button onClick={nextQuestion} className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950">Siguiente pregunta <ChevronRight size={16} /></button>
              <button onClick={resetVotes} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white"><RotateCcw size={16} /> Reiniciar votos</button>
            </div>

            {revealed && (
              <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <p className="text-2xl font-black">Respuesta correcta: {String.fromCharCode(65 + question.correctIndex)}</p>
                <p className="mt-2 text-sm font-semibold leading-7 text-slate-300">{question.explanation}</p>
                <p className="mt-4 text-xl font-black text-cyan-200">Puntos de esta ronda: {lastDelta > 0 ? `+${lastDelta}` : lastDelta}</p>
              </div>
            )}
          </article>

          <aside className="grid gap-6">
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">Estado del reto</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniMetric label="Votos" value={totalVotes} />
                <MiniMetric label="Racha" value={streak} />
                <MiniMetric label="PM2.5" value={reading.pm25 ?? "—"} />
                <MiniMetric label="PM10" value={reading.pm10 ?? "—"} />
              </div>
              <p className="mt-4 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-3 text-xs font-bold text-amber-100">
                Pregunta generada con datos demostrativos/manuales cuando no hay fuente live validada.
              </p>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">Ranking de cursos</p>
              <div className="mt-4 grid gap-3">
                {ranking.length === 0 ? (
                  <p className="rounded-2xl bg-slate-950/55 p-4 text-sm font-semibold text-slate-300">Aún no hay retos calculados.</p>
                ) : ranking.slice(0, 5).map((entry, index) => (
                  <div key={`${entry.schoolName}-${entry.courseName}`} className="rounded-2xl bg-slate-950/55 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-black">#{index + 1} {entry.schoolName} · Curso {entry.courseName}</p>
                      <p className="font-black text-cyan-200">{entry.totalPoints} pts</p>
                    </div>
                    <p className="mt-2 text-xs font-bold text-slate-400">Último reto: {entry.lastChallenge} · Sensor usado: {entry.lastSensor} · Racha: {entry.streak}</p>
                    <p className="mt-2 text-xs font-bold text-amber-100">{entry.badges.join(" · ")}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">Modo cámara experimental</p>
              <div className="mt-4 rounded-2xl bg-slate-950/55 p-4">
                <Camera className="mb-3" />
                <p className="text-sm font-semibold leading-6 text-slate-300">
                  Conteo automático de manos es experimental; use conteo manual para resultados oficiales. No se identifica a personas, no se guarda video y no se transmiten frames en esta versión.
                </p>
              </div>
            </section>
          </aside>
        </section>
      </section>
    </main>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-black text-slate-200">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="min-h-12 rounded-2xl border border-white/10 bg-slate-950 px-4 text-white outline-none" />
    </label>
  )
}

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-slate-950/55 p-4">
      <p className="text-xs font-black text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  )
}

function buildContextQuestion(type: ChallengeType, reading: ReturnType<typeof buildDemoReading>): CrshChallengeQuestion {
  const threshold = getAirQualityFromPm25(reading.pm25)
  return {
    id: `context-${type}-${reading.sensorId}`,
    packId: type,
    packTitle: "Interpretación de datos",
    prompt: `El sensor marca PM2.5 = ${reading.pm25 ?? "—"}. Según el semáforo, ¿qué estado corresponde?`,
    options: ["Bueno", "Moderado", "Atención", "Alto"] as [string, string, string, string],
    correctIndex: threshold.label === "Bueno" ? 0 : threshold.label === "Moderado" ? 1 : threshold.label === "Atención" ? 2 : 3,
    explanation: `La lectura se interpreta como ${threshold.label}. La acción educativa sugerida es: ${threshold.action}.`,
    environmentalInsightBonus: true,
  }
}
