"use client"

import confetti from "canvas-confetti"
import Link from "next/link"
import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  IPRE2_MODULES,
  IPRE2_SCORING,
  IPRE2_STORAGE_KEYS,
  createDefaultProgress,
  getBonusDifficulty,
  getScoreMessage,
  type Ipre2CourseProgress,
  type Ipre2Question,
} from "@/lib/ipre2"
import Ipre2Shell from "./Ipre2Shell"

type Votes = [number, number, number, number]

function loadProgress(courseName: string): Ipre2CourseProgress[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(IPRE2_STORAGE_KEYS.progress) ?? "[]") as Ipre2CourseProgress[]
  } catch {
    return [createDefaultProgress(courseName)]
  }
}

export default function Ipre2Session() {
  const activeModule = IPRE2_MODULES[0]
  const [courseName, setCourseName] = useState(() =>
    typeof window === "undefined"
      ? "College · Curso A"
      : localStorage.getItem(IPRE2_STORAGE_KEYS.selectedCourse) ?? "College · Curso A"
  )
  const [questionIndex, setQuestionIndex] = useState(0)
  const [votes, setVotes] = useState<Votes>([0, 0, 0, 0])
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [bonusQuestion, setBonusQuestion] = useState<Ipre2Question | null>(null)

  const questions = useMemo(() => activeModule.questions.slice(0, activeModule.questionCount), [activeModule])
  const activeQuestion = bonusQuestion ?? questions[questionIndex]
  const totalVotes = votes.reduce((sum, value) => sum + value, 0)
  const majorityIndex = votes.reduce((best, value, index) => (value > votes[best] ? index : best), 0)
  const majorityCorrect = totalVotes > 0 && majorityIndex === activeQuestion.correctIndex
  const progress = bonusQuestion ? 100 : ((questionIndex + 1) / questions.length) * 100

  function setCourse(value: string) {
    setCourseName(value)
    localStorage.setItem(IPRE2_STORAGE_KEYS.selectedCourse, value)
  }

  function updateVote(index: number, delta: number) {
    setVotes((current) => {
      const next = [...current] as Votes
      next[index] = Math.max(0, next[index] + delta)
      return next
    })
  }

  function calculate() {
    if (revealed) return
    const delta = majorityCorrect ? IPRE2_SCORING.questionPoints : 0
    setScore((value) => value + delta)
    setRevealed(true)
    if (majorityCorrect) confetti({ particleCount: 70, spread: 65, origin: { y: 0.72 } })
  }

  function next() {
    const nextScore = score
    if (bonusQuestion) {
      finishSession(nextScore)
      return
    }

    if (questionIndex + 1 >= questions.length) {
      const difficulty = getBonusDifficulty(nextScore)
      setBonusQuestion(activeModule.bonusQuestions[difficulty])
      setVotes([0, 0, 0, 0])
      setRevealed(false)
      return
    }

    setQuestionIndex((index) => index + 1)
    setVotes([0, 0, 0, 0])
    setRevealed(false)
  }

  function finishSession(finalScore = score) {
    const ranking = loadProgress(courseName)
    const existing = ranking.find((entry) => entry.courseName === courseName)
    const completed = finalScore >= IPRE2_SCORING.passThreshold
    const badges = new Set(existing?.badges ?? [])
    badges.add("Reto completado")
    if (completed) badges.add("Clase científica")
    if (finalScore >= IPRE2_SCORING.excellentThreshold) badges.add("Excelencia de datos")

    const nextEntry: Ipre2CourseProgress = {
      ...(existing ?? createDefaultProgress(courseName)),
      courseName,
      currentModule: activeModule.id,
      completedModules: completed ? Array.from(new Set([...(existing?.completedModules ?? []), activeModule.id])) : existing?.completedModules ?? [],
      totalPoints: (existing?.totalPoints ?? 0) + finalScore,
      lastSessionDate: new Date().toISOString(),
      lastScore: finalScore,
      streak: completed ? (existing?.streak ?? 0) + 1 : 0,
      badges: Array.from(badges),
    }

    const nextRanking = [nextEntry, ...ranking.filter((entry) => entry.courseName !== courseName)]
    localStorage.setItem(IPRE2_STORAGE_KEYS.progress, JSON.stringify(nextRanking))
    setFinished(true)
  }

  if (finished) {
    return (
      <Ipre2Shell>
        <section className="mx-auto grid min-h-[calc(100vh-70px)] max-w-5xl place-items-center px-5 py-10 text-center">
          <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-8 shadow-2xl backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-300">Sesión terminada</p>
            <h1 className="mt-4 text-5xl font-black">{score} puntos</h1>
            <p className="mt-4 text-xl font-black text-cyan-100">{getScoreMessage(score)}</p>
            <p className="mt-4 text-sm font-semibold text-slate-300">El progreso quedó guardado localmente para {courseName}.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/ipre2/ranking" className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950">Ver ranking</Link>
              <button onClick={() => window.location.reload()} className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white">Nueva sesión</button>
            </div>
          </motion.div>
        </section>
      </Ipre2Shell>
    )
  }

  return (
    <Ipre2Shell>
      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8">
        <header className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-300">Sesión con estudiantes</p>
              <h1 className="mt-2 text-3xl font-black md:text-5xl">{activeModule.title}</h1>
            </div>
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-300">
              Curso
              <input value={courseName} onChange={(event) => setCourse(event.target.value)} className="min-h-11 rounded-2xl border border-white/10 bg-slate-950 px-4 text-sm normal-case tracking-normal text-white outline-none" />
            </label>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </header>

        {bonusQuestion ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-[2rem] border border-red-300/30 bg-red-500/15 p-5 text-center shadow-2xl">
            <p className="text-3xl font-black text-red-100">{getScoreMessage(score)}</p>
            <p className="mt-2 text-sm font-bold text-red-100/80">Dificultad: {bonusQuestion.difficulty}. Es una oportunidad pedagógica para cerrar la idea clave.</p>
          </motion.div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-7 shadow-2xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-200">{bonusQuestion ? "Pregunta decisiva" : `Pregunta ${questionIndex + 1} de ${questions.length}`}</p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">{activeQuestion.prompt}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {activeQuestion.options.map((option, index) => (
                <div key={option} className={`rounded-3xl border p-5 ${revealed && index === activeQuestion.correctIndex ? "border-emerald-300 bg-emerald-300/15" : "border-white/10 bg-slate-950/55"}`}>
                  <p className="text-2xl font-black">{String.fromCharCode(65 + index)}. {option}</p>
                  <p className="mt-4 text-sm font-black text-cyan-100">Levanten la mano quienes creen que es {String.fromCharCode(65 + index)}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => updateVote(index, -1)} className="h-10 rounded-full bg-white/10 px-3 font-black">-1</button>
                    <input value={votes[index]} onChange={(event) => {
                      const nextVotes = [...votes] as Votes
                      nextVotes[index] = Math.max(0, Number(event.target.value) || 0)
                      setVotes(nextVotes)
                    }} className="h-12 w-20 rounded-2xl border border-white/10 bg-white/10 text-center text-xl font-black outline-none" />
                    <button onClick={() => updateVote(index, 1)} className="h-10 rounded-full bg-white/10 px-3 font-black">+1</button>
                    <button onClick={() => updateVote(index, 5)} className="h-10 rounded-full bg-cyan-300 px-3 font-black text-slate-950">+5</button>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${totalVotes ? (votes[index] / totalVotes) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={calculate} className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">Calcular resultado</button>
              <button onClick={next} className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950">{bonusQuestion && revealed ? "Finalizar" : "Siguiente pregunta"}</button>
            </div>
            {revealed ? (
              <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <p className="text-2xl font-black">{majorityCorrect ? "La mayoría eligió la respuesta correcta." : "La mayoría no eligió la respuesta correcta. Revisemos la idea clave."}</p>
                <p className="mt-2 text-sm font-semibold leading-7 text-slate-300">{activeQuestion.explanation}</p>
              </div>
            ) : null}
          </article>

          <aside className="grid gap-5">
            <Metric label="Puntaje sesión" value={score} />
            <Metric label="Votos totales" value={totalVotes} />
            <Metric label="Mayoría actual" value={String.fromCharCode(65 + majorityIndex)} />
            <div className="rounded-[2rem] border border-amber-300/20 bg-amber-300/10 p-5 text-sm font-bold leading-7 text-amber-100">
              Modo demo local hasta conectar base de datos. No se suben respuestas ni datos personales.
            </div>
          </aside>
        </section>
      </section>
    </Ipre2Shell>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-2 text-4xl font-black text-cyan-200">{value}</p>
    </div>
  )
}
