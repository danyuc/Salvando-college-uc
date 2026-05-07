'use client'

import { useMemo, useState } from "react"
import { createStudyGroup, joinStudyGroup } from "@/lib/study-groups"

type Player = {
  id: string
  nickname: string
  strengths: string
}

function code() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function GroupPracticeView() {
  const [roomCode] = useState(code())
  const [nickname, setNickname] = useState("")
  const [strengths, setStrengths] = useState("")
  const [players, setPlayers] = useState<Player[]>([])
  const [selected, setSelected] = useState<Player | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [mode, setMode] = useState<"ruleta" | "general" | "dirigida">("ruleta")

  const topicSuggestion = useMemo(() => {
    if (!selected) return "Esperando participante..."
    if (mode === "dirigida") return `Pregunta dirigida según fortalezas/debilidades de ${selected.nickname}.`
    return `Pregunta general para que responda ${selected.nickname}.`
  }, [selected, mode])

  function join() {
    if (!nickname.trim()) return
    setPlayers(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        nickname: nickname.trim(),
        strengths: strengths.trim() || "sin datos todavía",
      },
    ])
    setNickname("")
    setStrengths("")
  }

  function spin() {
    if (!players.length) return
    setSpinning(true)

    let count = 0
    const timer = setInterval(() => {
      setSelected(players[Math.floor(Math.random() * players.length)])
      count++
      if (count > 18) {
        clearInterval(timer)
        setSpinning(false)
      }
    }, 90)
  }

  return (
    <main className="groupPage">
      <section className="hero">
        <span>Práctica grupal MAT1000</span>
        <h1>Estudia con tus amigos en modo ruleta UC</h1>
        <p>Crea una sala, agrega apodos y deja que el sistema elija quién responde.</p>
        <strong>Código sala: {roomCode}</strong>
      </section>

      <section className="grid">
        <article className="card">
          <h2>Crear grupo</h2>

          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Apodo: Dany, Vale, Nico..."
          />

          <textarea
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            placeholder="Ej: Dany sabe dominio y rectas, le cuesta inecuaciones..."
          />

          <button onClick={join}>Agregar participante</button>
        </article>

        <article className="card">
          <h2>Modo</h2>

          <div className="modes">
            <button className={mode === "ruleta" ? "active" : ""} onClick={() => setMode("ruleta")}>Ruleta</button>
            <button className={mode === "general" ? "active" : ""} onClick={() => setMode("general")}>General</button>
            <button className={mode === "dirigida" ? "active" : ""} onClick={() => setMode("dirigida")}>Dirigida</button>
          </div>

          <div className={`roulette ${spinning ? "spin" : ""}`}>
            {selected ? selected.nickname : "?"}
          </div>

          <button onClick={spin}>Girar ruleta</button>

          <p className="tip">{topicSuggestion}</p>
        </article>
      </section>

      <section className="card">
        <h2>Participantes</h2>
        <div className="players">
          {players.map(p => (
            <div key={p.id} className="player">
              <strong>{p.nickname}</strong>
              <small>{p.strengths}</small>
            </div>
          ))}
        </div>
      </section>

      <style jsx>{`
        .groupPage {
          min-height: 100vh;
          padding: 32px;
          background: radial-gradient(circle at top,#1e3a8a,#020617 55%);
          color: white;
        }

        .hero {
          padding: 28px;
          border-radius: 32px;
          background: rgba(15,23,42,.82);
          border: 1px solid rgba(255,255,255,.12);
          margin-bottom: 20px;
        }

        .hero span {
          color: #93c5fd;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .hero h1 {
          font-size: clamp(32px,6vw,70px);
          margin: 10px 0;
          line-height: .95;
        }

        .hero p {
          color: #dbeafe;
          font-weight: 800;
        }

        .hero strong {
          display: inline-block;
          margin-top: 10px;
          padding: 12px 16px;
          border-radius: 16px;
          background: rgba(37,99,235,.35);
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .card {
          padding: 22px;
          border-radius: 28px;
          background: rgba(15,23,42,.86);
          border: 1px solid rgba(255,255,255,.12);
          margin-bottom: 18px;
        }

        input, textarea {
          width: 100%;
          margin: 8px 0;
          padding: 14px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(2,6,23,.7);
          color: white;
          font-weight: 800;
        }

        textarea {
          min-height: 110px;
          resize: vertical;
        }

        button {
          border: 0;
          padding: 13px 18px;
          border-radius: 16px;
          background: linear-gradient(135deg,#2563eb,#22c55e);
          color: white;
          font-weight: 950;
          cursor: pointer;
        }

        .modes {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .modes button {
          background: rgba(255,255,255,.1);
        }

        .modes .active {
          background: linear-gradient(135deg,#2563eb,#7c3aed);
        }

        .roulette {
          height: 160px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          font-size: 44px;
          font-weight: 950;
          background: radial-gradient(circle,#2563eb,#020617);
          border: 8px solid rgba(147,197,253,.3);
          margin-bottom: 16px;
        }

        .spin {
          animation: spin .8s linear infinite;
        }

        .tip {
          color: #dbeafe;
          font-weight: 850;
        }

        .players {
          display: grid;
          gap: 10px;
        }

        .player {
          padding: 14px;
          border-radius: 18px;
          background: rgba(255,255,255,.08);
        }

        .player small {
          display: block;
          color: #cbd5e1;
          margin-top: 4px;
        }

        @keyframes spin {
          from { transform: rotate(-2deg) scale(.98); }
          50% { transform: rotate(2deg) scale(1.02); }
          to { transform: rotate(-2deg) scale(.98); }
        }

        @media(max-width:900px) {
          .grid { grid-template-columns: 1fr; }
          .groupPage { padding: 18px; }
        }
      `}</style>
    </main>
  )
}
