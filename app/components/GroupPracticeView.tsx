'use client'

import { useEffect, useMemo, useState } from "react"
import {
  createStudyGroup,
  joinStudyGroup,
  getGroupMembers,
  createGroupSession,
  updateGroupSession,
} from "@/lib/study-groups"

type Player = {
  id: string
  nickname: string
  strengths?: string
}

function localCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

const sampleQuestions = [
  "Resuelve: |2x - 3| ≤ 7",
  "Determina el dominio de f(x)=√(5-|8-x|)",
  "Calcula la pendiente entre (2,-1) y (5,5)",
  "Indica si f(x)=x² es inyectiva en ℝ. Justifica.",
  "Grafica f(x)=1/x e indica dominio y recorrido.",
]

export default function GroupPracticeView() {
  const [groupName, setGroupName] = useState("Grupo MAT1000")
  const [code, setCode] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [groupId, setGroupId] = useState("")
  const [sessionId, setSessionId] = useState("")
  const [nickname, setNickname] = useState("")
  const [strengths, setStrengths] = useState("")
  const [players, setPlayers] = useState<Player[]>([])
  const [selected, setSelected] = useState<Player | null>(null)
  const [question, setQuestion] = useState("")
  const [spinning, setSpinning] = useState(false)
  const [mode, setMode] = useState<"ruleta" | "general" | "dirigida">("ruleta")
  const [status, setStatus] = useState("")

  const coachText = useMemo(() => {
    if (!selected) return "Crea o únete a un grupo y gira la ruleta."
    if (mode === "dirigida") {
      return `${selected.nickname} responde una pregunta dirigida según: ${selected.strengths || "sin perfil todavía"}.`
    }
    if (mode === "general") return `Pregunta general para todo el grupo. Responde primero quien quiera.`
    return `${selected.nickname} fue elegido por ruleta.`
  }, [selected, mode])

  async function createRoom() {
    try {
      setStatus("Creando grupo...")
      const group = await createStudyGroup({ name: groupName })
      setCode(group.code)
      setJoinCode(group.code)
      setGroupId(group.id)

      const session = await createGroupSession({
        groupId: group.id,
        mode,
        currentQuestion: null,
      })

      setSessionId(session.id)
      setStatus("Grupo creado correctamente.")
    } catch {
      const c = localCode()
      setCode(c)
      setJoinCode(c)
      setGroupId("local")
      setStatus("Grupo local creado. Supabase no respondió, pero puedes seguir probando.")
    }
  }

  async function joinRoom() {
    if (!nickname.trim()) return

    try {
      setStatus("Uniéndote al grupo...")
      const res = await joinStudyGroup({
        code: joinCode || code,
        nickname,
        strengths,
      })

      setGroupId(res.group.id)
      setCode(res.group.code)

      const members = await getGroupMembers(res.group.id)
      setPlayers(members.map((m: any) => ({
        id: m.id,
        nickname: m.nickname,
        strengths: m.strengths,
      })))

      setStatus("Entraste al grupo.")
    } catch {
      const member = {
        id: crypto.randomUUID(),
        nickname,
        strengths,
      }
      setPlayers(prev => [...prev, member])
      setStatus("Agregado localmente.")
    }

    setNickname("")
    setStrengths("")
  }

  async function spin() {
    if (!players.length) return

    setSpinning(true)
    let count = 0
    const timer = setInterval(() => {
      const p = players[Math.floor(Math.random() * players.length)]
      setSelected(p)
      count++

      if (count > 20) {
        clearInterval(timer)
        const finalPlayer = players[Math.floor(Math.random() * players.length)]
        const nextQuestion = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)]

        setSelected(finalPlayer)
        setQuestion(nextQuestion)
        setSpinning(false)

        if (sessionId) {
          updateGroupSession({
            sessionId,
            selectedUser: finalPlayer.nickname,
            currentQuestion: { text: nextQuestion, mode },
          }).catch(() => {})
        }
      }
    }, 85)
  }

  useEffect(() => {
    if (!groupId || groupId === "local") return

    getGroupMembers(groupId).then((members: any[]) => {
      setPlayers(members.map((m: any) => ({
        id: m.id,
        nickname: m.nickname,
        strengths: m.strengths,
      })))
    })
  }, [groupId])

  return (
    <main className="groupPage">
      <section className="hero">
        <span>Práctica grupal UC</span>
        <h1>Ruleta, preguntas dirigidas y estudio con amigos</h1>
        <p>{status || "Crea una sala, comparte el código y entrenen como grupo."}</p>
        {code && <strong>Código: {code}</strong>}
      </section>

      <section className="grid">
        <article className="card">
          <h2>Crear sala</h2>
          <input value={groupName} onChange={e => setGroupName(e.target.value)} />
          <button onClick={createRoom}>Crear grupo</button>
        </article>

        <article className="card">
          <h2>Unirse</h2>
          <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="Código sala" />
          <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="Tu apodo" />
          <textarea value={strengths} onChange={e => setStrengths(e.target.value)} placeholder="Ej: domino rectas, me cuesta dominio..." />
          <button onClick={joinRoom}>Entrar / agregar</button>
        </article>
      </section>

      <section className="grid">
        <article className="card">
          <h2>Modo grupal</h2>
          <div className="modes">
            <button className={mode === "ruleta" ? "active" : ""} onClick={() => setMode("ruleta")}>Ruleta</button>
            <button className={mode === "general" ? "active" : ""} onClick={() => setMode("general")}>General</button>
            <button className={mode === "dirigida" ? "active" : ""} onClick={() => setMode("dirigida")}>Dirigida</button>
          </div>

          <div className={`roulette ${spinning ? "spin" : ""}`}>
            {selected?.nickname || "?"}
          </div>

          <button onClick={spin}>Girar y lanzar pregunta</button>
          <p className="coach">{coachText}</p>
        </article>

        <article className="card">
          <h2>Pregunta actual</h2>
          <div className="question">{question || "Todavía no hay pregunta activa."}</div>
        </article>
      </section>

      <section className="card">
        <h2>Participantes</h2>
        <div className="players">
          {players.map(p => (
            <div className="player" key={p.id}>
              <strong>{p.nickname}</strong>
              <small>{p.strengths || "Sin perfil todavía"}</small>
            </div>
          ))}
        </div>
      </section>

      <style jsx>{`
        .groupPage{min-height:100vh;padding:32px;background:radial-gradient(circle at top,#1e3a8a,#020617 55%);color:white}
        .hero,.card{border:1px solid rgba(255,255,255,.12);background:rgba(15,23,42,.86);border-radius:30px;padding:24px;margin-bottom:18px}
        .hero span{color:#93c5fd;font-weight:950;text-transform:uppercase;letter-spacing:.08em}
        h1{font-size:clamp(34px,6vw,72px);line-height:.95;margin:12px 0}
        h2{margin-top:0}
        p{color:#dbeafe;font-weight:800}
        .hero strong{display:inline-block;padding:12px 16px;border-radius:16px;background:rgba(37,99,235,.35)}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
        input,textarea{width:100%;margin:8px 0;padding:14px;border-radius:16px;border:1px solid rgba(255,255,255,.14);background:rgba(2,6,23,.75);color:white;font-weight:850}
        textarea{min-height:105px}
        button{border:0;padding:13px 18px;border-radius:16px;background:linear-gradient(135deg,#2563eb,#22c55e);color:white;font-weight:950;cursor:pointer}
        .modes{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
        .modes button{background:rgba(255,255,255,.1)}
        .modes .active{background:linear-gradient(135deg,#2563eb,#7c3aed)}
        .roulette{height:160px;border-radius:999px;display:grid;place-items:center;font-size:44px;font-weight:950;background:radial-gradient(circle,#2563eb,#020617);border:8px solid rgba(147,197,253,.3);margin-bottom:16px}
        .spin{animation:spin .55s linear infinite}
        .question{min-height:120px;border-radius:22px;background:rgba(255,255,255,.08);padding:20px;font-size:24px;font-weight:950;line-height:1.2}
        .players{display:grid;gap:10px}
        .player{padding:14px;border-radius:18px;background:rgba(255,255,255,.08)}
        .player small{display:block;color:#cbd5e1;margin-top:4px}
        @keyframes spin{from{transform:rotate(-2deg) scale(.98)}50%{transform:rotate(2deg) scale(1.02)}to{transform:rotate(-2deg) scale(.98)}}
        @media(max-width:900px){.grid{grid-template-columns:1fr}.groupPage{padding:18px}}
      `}</style>
    </main>
  )
}
