"use client"

import confetti from "canvas-confetti"
import Link from "next/link"
import { type ReactNode, useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  IPRE2_DEMO_COURSES,
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
type Stage = "setup" | "capsule" | "challenge" | "feedback" | "summary"

function loadProgress(): Ipre2CourseProgress[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(IPRE2_STORAGE_KEYS.progress) ?? "[]") as Ipre2CourseProgress[]
  } catch {
    return []
  }
}

const capsuleSlides = [
  {
    title: "¿Qué es PM2.5 y por qué importa observarlo?",
    kicker: "Módulo 1",
    text: "Hoy usaremos datos ambientales para hacer preguntas, no para memorizar una definición aislada.",
  },
  {
    title: "PM2.5 son partículas finas suspendidas en el aire",
    kicker: "Idea clave",
    text: "Son pequeñas y pueden permanecer en suspensión. En esta clase las tratamos como una variable ambiental observable.",
  },
  {
    title: "No siempre se ven",
    kicker: "Por qué usar sensores",
    text: "Si algo no se ve, igual puede medirse. El sensor convierte el entorno en datos para conversar con evidencia.",
  },
  {
    title: "Sensor 71 como disparador",
    kicker: "Dashboard",
    text: "Sensor 71 y el dashboard son una fuente para observar tendencias. Si no hay API validada, usamos demo/manual claramente etiquetado.",
  },
  {
    title: "Cómo funciona el desafío",
    kicker: "Participación",
    text: "El curso vota levantando la mano. El docente ingresa los conteos y verifica la respuesta con feedback inmediato.",
  },
]

export default function Ipre2Session() {
  const activeModule = IPRE2_MODULES[0]
  const [stage, setStage] = useState<Stage>("setup")
  const [institution, setInstitution] = useState("College")
  const [courseName, setCourseName] = useState(() =>
    typeof window === "undefined"
      ? "College · Curso A"
      : localStorage.getItem(IPRE2_STORAGE_KEYS.selectedCourse) ?? "College · Curso A"
  )
  const [capsuleIndex, setCapsuleIndex] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [votes, setVotes] = useState<Votes>([0, 0, 0, 0])
  const [score, setScore] = useState(0)
  const [lastDelta, setLastDelta] = useState(0)
  const [bonusQuestion, setBonusQuestion] = useState<Ipre2Question | null>(null)
  const [lastCompleted, setLastCompleted] = useState<Ipre2CourseProgress | null>(() =>
    loadProgress().find((entry) => entry.courseName === courseName) ?? null
  )

  const questions = useMemo(() => activeModule.questions.slice(0, activeModule.questionCount), [activeModule])
  const activeQuestion = bonusQuestion ?? questions[questionIndex]
  const totalVotes = votes.reduce((sum, value) => sum + value, 0)
  const majorityIndex = votes.reduce((best, value, index) => (value > votes[best] ? index : best), 0)
  const majorityCorrect = totalVotes > 0 && majorityIndex === activeQuestion.correctIndex
  const progress = bonusQuestion ? 100 : ((questionIndex + 1) / questions.length) * 100

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (stage !== "capsule") return
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault()
        if (capsuleIndex === capsuleSlides.length - 1) setStage("challenge")
        else setCapsuleIndex((index) => index + 1)
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        setCapsuleIndex((index) => Math.max(0, index - 1))
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [capsuleIndex, stage])

  function startSession() {
    localStorage.setItem(IPRE2_STORAGE_KEYS.selectedCourse, courseName)
    setLastCompleted(loadProgress().find((entry) => entry.courseName === courseName) ?? null)
    setStage("capsule")
  }

  function updateVote(index: number, delta: number) {
    setVotes((current) => {
      const next = [...current] as Votes
      next[index] = Math.max(0, next[index] + delta)
      return next
    })
  }

  function verifyAnswer() {
    const delta = majorityCorrect ? IPRE2_SCORING.questionPoints : 0
    setLastDelta(delta)
    setScore((value) => value + delta)
    setStage("feedback")
    if (majorityCorrect) confetti({ particleCount: 120, spread: 75, origin: { y: 0.7 } })
  }

  function nextQuestion() {
    if (bonusQuestion) {
      finishSession(score)
      return
    }

    if (questionIndex + 1 >= questions.length) {
      const finalScore = score
      const difficulty = getBonusDifficulty(finalScore)
      setBonusQuestion(activeModule.bonusQuestions[difficulty])
      setVotes([0, 0, 0, 0])
      setStage("summary")
      return
    }

    setQuestionIndex((index) => index + 1)
    setVotes([0, 0, 0, 0])
    setStage("challenge")
  }

  function launchBonus() {
    setVotes([0, 0, 0, 0])
    setStage("challenge")
  }

  function finishSession(finalScore = score) {
    const ranking = loadProgress()
    const existing = ranking.find((entry) => entry.courseName === courseName)
    const completed = finalScore >= IPRE2_SCORING.passThreshold
    const badges = new Set(existing?.badges ?? [])
    badges.add("Reto completado")
    if (completed) badges.add("Clase científica")
    if (finalScore >= IPRE2_SCORING.excellentThreshold) badges.add("Excelencia de datos")

    const nextEntry: Ipre2CourseProgress = {
      ...(existing ?? createDefaultProgress(courseName)),
      institutionName: institution,
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
    setLastCompleted(nextEntry)
    setStage("summary")
  }

  return (
    <Ipre2Shell>
      {stage === "setup" && (
        <ProjectionFrame>
          <div className="grid h-full content-center gap-6">
            <p className="text-xs font-black uppercase tracking-[0.34em] text-cyan-300">Explora IPRE2 · Setup</p>
            <h1 className="text-[clamp(2.7rem,6vw,5.8rem)] font-black leading-none">Sesión con estudiantes</h1>
            {lastCompleted ? (
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5">
                <p className="text-2xl font-black">Bienvenidos de vuelta</p>
                <p className="mt-2 text-sm font-bold text-emerald-100">La clase anterior completaron: Módulo 1. Hoy avanzamos a: Módulo 2 cuando esté disponible.</p>
              </motion.div>
            ) : null}
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Institución" value={institution} onChange={setInstitution} />
              <label className="grid gap-2 text-sm font-black text-slate-200">
                Curso
                <select value={courseName} onChange={(event) => setCourseName(event.target.value)} className="min-h-12 rounded-2xl border border-white/10 bg-slate-950 px-4 text-white">
                  {IPRE2_DEMO_COURSES.map((course) => <option key={course.courseName}>{course.courseName}</option>)}
                  <option>Curso editable</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-black text-slate-200">
                Módulo
                <select className="min-h-12 rounded-2xl border border-white/10 bg-slate-950 px-4 text-white">
                  <option>{activeModule.title}</option>
                </select>
              </label>
            </div>
            <button onClick={startSession} className="w-fit rounded-full bg-cyan-300 px-8 py-4 text-lg font-black text-slate-950">
              Iniciar sesión
            </button>
          </div>
        </ProjectionFrame>
      )}

      {stage === "capsule" && (
        <ProjectionFrame>
          <div className="grid h-full place-items-center text-center">
            <motion.div key={capsuleIndex} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="max-w-5xl">
              <p className="text-sm font-black uppercase tracking-[0.36em] text-cyan-300">{capsuleSlides[capsuleIndex].kicker}</p>
              <h1 className="mt-5 text-[clamp(2.8rem,6.5vw,6.6rem)] font-black leading-[0.96]">{capsuleSlides[capsuleIndex].title}</h1>
              <p className="mx-auto mt-6 max-w-3xl text-[clamp(1rem,2vw,1.55rem)] font-semibold leading-8 text-slate-300">{capsuleSlides[capsuleIndex].text}</p>
              <div className="mt-8 flex justify-center gap-2">
                {capsuleSlides.map((slide, index) => <span key={slide.title} className={`h-3 w-10 rounded-full ${index === capsuleIndex ? "bg-cyan-300" : "bg-white/15"}`} />)}
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button onClick={() => setCapsuleIndex((index) => Math.max(0, index - 1))} className="rounded-full border border-white/15 bg-white/10 px-5 py-3 font-black">Anterior</button>
                {capsuleIndex < capsuleSlides.length - 1 ? (
                  <button onClick={() => setCapsuleIndex((index) => index + 1)} className="rounded-full bg-white px-5 py-3 font-black text-slate-950">Siguiente</button>
                ) : (
                  <button onClick={() => setStage("challenge")} className="rounded-full bg-cyan-300 px-6 py-3 font-black text-slate-950">Iniciar reto</button>
                )}
              </div>
            </motion.div>
          </div>
        </ProjectionFrame>
      )}

      {stage === "challenge" && (
        <ProjectionFrame compact>
          <div className="grid h-full grid-rows-[auto_1fr_auto] gap-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">{bonusQuestion ? "Pregunta obligatoria" : `Pregunta ${questionIndex + 1}/${questions.length}`}</p>
                <h1 className="text-[clamp(1.35rem,3vw,2.2rem)] font-black">{activeModule.title}</h1>
              </div>
              <div className="rounded-3xl bg-white px-5 py-3 text-right text-slate-950">
                <p className="text-xs font-black uppercase">Puntaje</p>
                <p className="text-3xl font-black">{score}</p>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-cyan-300" style={{ width: `${progress}%` }} />
            </div>
            <div className="grid min-h-0 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <section className="grid min-h-0 grid-rows-[auto_1fr] gap-4 rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-5">
                <h2 className="text-[clamp(1.7rem,4vw,3.2rem)] font-black leading-tight">{activeQuestion.prompt}</h2>
                <div className="grid min-h-0 gap-3 md:grid-cols-2">
                  {activeQuestion.options.map((option, index) => (
                    <div key={option} className="rounded-3xl border border-white/10 bg-slate-950/65 p-4">
                      <p className="text-[clamp(1rem,2vw,1.45rem)] font-black">{String.fromCharCode(65 + index)}. {option}</p>
                    </div>
                  ))}
                </div>
              </section>
              <aside className="grid gap-3 rounded-[2rem] border border-white/10 bg-white/[0.08] p-4">
                <p className="text-xl font-black">El curso vota levantando la mano.</p>
                {activeQuestion.options.map((_, index) => (
                  <div key={index} className="grid grid-cols-[2rem_1fr_auto_auto_auto] items-center gap-2 rounded-2xl bg-slate-950/60 p-2">
                    <p className="text-xl font-black">{String.fromCharCode(65 + index)}</p>
                    <input value={votes[index]} onChange={(event) => {
                      const next = [...votes] as Votes
                      next[index] = Math.max(0, Number(event.target.value) || 0)
                      setVotes(next)
                    }} className="min-h-10 rounded-xl border border-white/10 bg-white/10 px-3 text-center text-xl font-black outline-none" />
                    <button onClick={() => updateVote(index, -1)} className="rounded-xl bg-white/10 px-3 py-2 font-black">-1</button>
                    <button onClick={() => updateVote(index, 1)} className="rounded-xl bg-white/10 px-3 py-2 font-black">+1</button>
                    <button onClick={() => updateVote(index, 5)} className="rounded-xl bg-cyan-300 px-3 py-2 font-black text-slate-950">+5</button>
                  </div>
                ))}
                <button onClick={verifyAnswer} className="mt-1 rounded-full bg-white px-5 py-3 text-lg font-black text-slate-950">Verificar respuesta</button>
                <p className="text-sm font-bold text-slate-300">Votos: {totalVotes} · Mayoría actual: {String.fromCharCode(65 + majorityIndex)}</p>
              </aside>
            </div>
          </div>
        </ProjectionFrame>
      )}

      {stage === "feedback" && (
        <FeedbackScreen
          correct={majorityCorrect}
          points={lastDelta}
          question={activeQuestion}
          majorityIndex={majorityIndex}
          onNext={nextQuestion}
        />
      )}

      {stage === "summary" && (
        <ProjectionFrame>
          <div className="grid h-full place-items-center text-center">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.08] p-8 shadow-2xl">
              <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-300">Cierre de módulo</p>
              <h1 className="mt-3 text-[clamp(3rem,7vw,6rem)] font-black">{score} puntos</h1>
              <p className="mt-4 text-[clamp(1.4rem,3vw,2.4rem)] font-black text-cyan-100">{getScoreMessage(score)}</p>
              {bonusQuestion ? (
                <button onClick={launchBonus} className="mt-8 rounded-full bg-red-400 px-8 py-4 text-lg font-black text-white shadow-2xl shadow-red-500/30">
                  Lanzar pregunta decisiva
                </button>
              ) : (
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link href="/ipre2/ranking" className="rounded-full bg-cyan-300 px-6 py-3 font-black text-slate-950">Ver ranking</Link>
                  <button onClick={() => finishSession(score)} className="rounded-full bg-white px-6 py-3 font-black text-slate-950">Guardar cierre</button>
                </div>
              )}
            </motion.div>
          </div>
        </ProjectionFrame>
      )}
    </Ipre2Shell>
  )
}

function ProjectionFrame({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return (
    <section className={`mx-auto aspect-video max-h-[calc(100vh-76px)] w-full max-w-[min(100vw,1400px)] overflow-hidden px-4 py-4 md:px-6 ${compact ? "text-white" : "text-white"}`}>
      <div className="h-full rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl md:p-7">
        {children}
      </div>
    </section>
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

function FeedbackScreen({
  correct,
  points,
  question,
  majorityIndex,
  onNext,
}: {
  correct: boolean
  points: number
  question: Ipre2Question
  majorityIndex: number
  onNext: () => void
}) {
  return (
    <section className={`grid min-h-[calc(100vh-56px)] place-items-center px-5 text-center ${correct ? "bg-emerald-500" : "bg-orange-600"}`}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-5xl text-white">
        <p className="text-[clamp(4rem,11vw,10rem)] font-black leading-none">{correct ? "¡Correcto!" : "Aún no"}</p>
        <h1 className="mt-5 text-[clamp(1.8rem,4vw,3.7rem)] font-black">
          {correct ? "Excelente, la mayoría eligió la alternativa correcta." : "Revisemos la idea clave."}
        </h1>
        <p className="mt-6 text-[clamp(1.5rem,4vw,3rem)] font-black">{points > 0 ? `+${points}` : points} puntos</p>
        {!correct ? <p className="mt-4 text-2xl font-black">Correcta: {String.fromCharCode(65 + question.correctIndex)} · Mayoría: {String.fromCharCode(65 + majorityIndex)}</p> : null}
        <p className="mx-auto mt-5 max-w-3xl text-lg font-semibold leading-8">{question.explanation}</p>
        <button onClick={onNext} className="mt-8 rounded-full bg-white px-8 py-4 text-lg font-black text-slate-950">Vamos por la siguiente</button>
      </motion.div>
    </section>
  )
}
