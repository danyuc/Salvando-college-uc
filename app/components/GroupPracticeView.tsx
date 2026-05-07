'use client'

import { useEffect, useMemo, useState } from "react"
import {
  createRoom,
  joinRoom,
  getRoomMembers,
  updateRoomState,
  getRoom,
  updateMemberScore,
} from "@/lib/group-rooms"

type Player = { id: string; nickname: string; score: number }
type Q = { text: string; options: string[]; correct: string }

const questions: Q[] = [
  { text: "Determina el dominio de f(x)=√(5-|8-x|)", options: ["(3,13)", "[3,13]", "[-13,-3]", "ℝ"], correct: "[3,13]" },
  { text: "Resuelve |2x-3| ≤ 7", options: ["[-2,5]", "(-∞,-2]∪[5,∞)", "(-2,5)", "[-5,2]"], correct: "[-2,5]" },
  { text: "Pendiente entre (2,-1) y (5,5)", options: ["2", "1/2", "-2", "3/2"], correct: "2" },
  { text: "¿f(x)=x² es inyectiva en ℝ?", options: ["Sí", "No", "Solo si x>0", "No es función"], correct: "No" },
]

export default function GroupPracticeView() {
  const [step, setStep] = useState<"home" | "room">("home")
  const [code, setCode] = useState("")
  const [nickname, setNickname] = useState("")
  const [players, setPlayers] = useState<Player[]>([])
  const [selected, setSelected] = useState<Player | null>(null)
  const [currentQ, setCurrentQ] = useState<Q | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [mode, setMode] = useState("Ruleta UC")
  const [host, setHost] = useState("")
  const [timeLeft, setTimeLeft] = useState(60)
  const [feed, setFeed] = useState<string[]>([])
  const [roundActive, setRoundActive] = useState(false)

  const ranking = useMemo(() => [...players].sort((a, b) => b.score - a.score), [players])

  async function createNewRoom() {
    const roomCode = await createRoom(mode)
    setCode(roomCode)
    setHost("Host")
    await updateRoomState({ code: roomCode, hostNickname: "Host", timeLeft: 60, roundStarted: false })
    setStep("room")
  }

  async function enterRoom() {
    if (!nickname.trim() || !code.trim()) return
    await joinRoom({ code, nickname })
    const members = await getRoomMembers(code)
    setPlayers(members.map((m:any)=>({ id:m.id, nickname:m.nickname, score:m.score })))
    setNickname("")
    setStep("room")
  }

  async function spin() {
    if (!players.length) return
    setSpinning(true)

    let count = 0
    const timer = setInterval(() => {
      setSelected(players[Math.floor(Math.random() * players.length)])
      count++

      if (count > 22) {
        clearInterval(timer)
        const winner = players[Math.floor(Math.random() * players.length)]
        const pool = mode === "Dirigida por IA"
          ? questions.filter(q => q.text.toLowerCase().includes("dominio") || q.text.toLowerCase().includes("inyectiva"))
          : questions

        const q = (pool.length ? pool : questions)[Math.floor(Math.random() * (pool.length ? pool.length : questions.length))]
        setSelected(winner)
        setCurrentQ(q)
        setSpinning(false)
        setTimeLeft(60)
        setRoundActive(true)
        setFeed(prev => [`🎡 Le toca a ${winner.nickname}`, ...prev])

        updateRoomState({
          code,
          currentQuestion: JSON.stringify(q),
          selectedPlayer: winner.nickname,
          timeLeft: 60,
          roundStarted: true,
        }).catch(() => {})
      }
    }, 75)
  }

  async function changeScore(player: Player, points: number, reason: string) {
    const nextPlayers = players.map(p =>
      p.id === player.id ? { ...p, score: Math.max(0, p.score + points) } : p
    )
    setPlayers(nextPlayers)
    setFeed(prev => [`${reason} ${player.nickname} (${points > 0 ? "+" : ""}${points})`, ...prev])
    const updated = nextPlayers.find(p => p.id === player.id)
    if (updated) updateMemberScore({ memberId: updated.id, score: updated.score }).catch(() => {})
  }

  function nextRound() {
    setCurrentQ(null)
    setSelected(null)
    setTimeLeft(60)
    setRoundActive(false)
    setFeed(prev => ["🔄 Nueva ronda lista.", ...prev])
    updateRoomState({
      code,
      currentQuestion: "",
      selectedPlayer: "",
      timeLeft: 60,
      roundStarted: false,
    }).catch(() => {})
  }

  function answer(option: string) {
    if (!selected || !currentQ) return
    if (option === currentQ.correct) changeScore(selected, 10, "✅ Correcta")
    else changeScore(selected, -3, "❌ Incorrecta")
  }

  function passTurn() {
    if (!selected) return
    changeScore(selected, -5, "⏭ Se rinde")
    const others = players.filter(p => p.id !== selected.id)
    if (others.length) {
      const next = others[Math.floor(Math.random() * others.length)]
      setSelected(next)
      setFeed(prev => [`🕹 Rebote: ahora responde ${next.nickname}`, ...prev])
      updateRoomState({ code, selectedPlayer: next.nickname }).catch(() => {})
    }
  }

  useEffect(() => {
    if (!code) return
    const interval = setInterval(async () => {
      const [members, room] = await Promise.all([getRoomMembers(code), getRoom(code)])
      setPlayers(members.map((m:any)=>({ id:m.id, nickname:m.nickname, score:m.score })))
      if (room?.current_question) {
        try { setCurrentQ(JSON.parse(room.current_question)) } catch { setCurrentQ({ text: room.current_question, options: [], correct: "" }) }
      }
      if (room?.selected_player) setSelected({ id: room.selected_player, nickname: room.selected_player, score: 0 })
      if (room?.host_nickname) setHost(room.host_nickname)
      if (typeof room?.time_left === "number") setTimeLeft(room.time_left)
    }, 2200)
  
  useEffect(() => {
    if (!roundActive) return
    if (timeLeft <= 0) {
      setRoundActive(false)
      setFeed(prev => ["⏱ Tiempo terminado.", ...prev])
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(v => Math.max(0, v - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [roundActive, timeLeft])


  return () => clearInterval(interval)
  }, [code])

  return (
    <main className="page">
      <section className="hero">
        <div>
          <span>Práctica grupal UC</span>
          <h1>Ruleta, alternativas, rebote y ranking</h1>
          <p>Una sala compartida para estudiar MAT1000 con amigos.</p>
        </div>
        {code && (
          <button
            className="roomCode"
            onClick={() => navigator.clipboard?.writeText(code)}
            title="Copiar código"
          >
            Sala {code}
          </button>
        )}
      </section>

      {step === "home" ? (
        <section className="startGrid">
          <article className="card">
            <h2>Crear sala</h2>
            <button onClick={createNewRoom}>Crear sala</button>
          </article>
          <article className="card">
            <h2>Unirse</h2>
            <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Código" />
            <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="Tu apodo" />
            <button onClick={enterRoom}>Entrar</button>
          </article>
        </section>
      ) : (
        <>
          <section className="roomGrid">
            <article className="card wheelCard">
              <div className="topline">
                <h2>Modo grupal</h2>
                <select value={mode} onChange={e => setMode(e.target.value)}>
                  <option>Ruleta UC</option>
                  <option>General</option>
                  <option>Dirigida por IA</option>
                  <option>Modo examen grupal</option>
                </select>
              </div>
              <div className={`wheel ${spinning ? "spin" : ""}`}>
                <div className="pointer">▼</div>
                <div className="center">{selected?.nickname || "?"}</div>
              </div>
              <div className="actions">
                <button onClick={spin}>🎡 Girar pregunta</button>
                <button onClick={nextRound}>🔄 Siguiente ronda</button>
              </div>
            </article>

            <article className="card questionCard">
              <span>Pregunta actual</span>
              <div className="meta"><b>👑 {host || "Host"}</b><b>⏱ {timeLeft}s</b></div>
              <h2>{currentQ?.text || "Gira la ruleta para lanzar una pregunta."}</h2>

              <div className="options">
                {currentQ?.options.map(op => (
                  <button key={op} onClick={() => answer(op)}>{op}</button>
                ))}
              </div>

              <div className="actions">
                <button onClick={passTurn}>⏭ Me rindo / rebote</button>
                {selected && <button onClick={() => changeScore(selected, 5, "🤝 Ayuda")}>🤝 Ayuda +5</button>}
              </div>
            </article>
          </section>

          <section className="roomGrid">
            <article className="card">
              <h2>Agregar jugador</h2>
              <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="Apodo" />
              <button onClick={enterRoom}>Agregar</button>
            </article>

            <article className="card">
              <h2>Ranking</h2>
              {ranking.map((p, i) => (
                <div key={p.id} className="rank"><strong>{i + 1}. {p.nickname}</strong><span>{p.score} pts</span></div>
              ))}
            </article>
          </section>

          <section className="card">
            <h2>Feed de la ronda</h2>
            {feed.slice(0, 8).map((f, i) => <p key={i} className="feed">{f}</p>)}
          </section>
        </>
      )}

      <style jsx>{`
        .page{min-height:100vh;padding:28px;background:radial-gradient(circle at top,#172554,#020617 55%);color:white}
        .hero,.card{background:rgba(15,23,42,.84);border:1px solid rgba(255,255,255,.11);border-radius:30px;padding:24px;margin-bottom:18px;box-shadow:0 24px 80px rgba(0,0,0,.22)}
        .hero{display:flex;justify-content:space-between;gap:18px}
        .hero span,.questionCard span{color:#67e8f9;font-weight:950;letter-spacing:.16em;text-transform:uppercase;font-size:12px}
        h1{font-size:clamp(34px,5vw,64px);line-height:.95;margin:10px 0}
        p{color:#cbd5e1;font-weight:750}.roomCode{height:max-content;padding:12px 16px;border-radius:18px;background:linear-gradient(135deg,#2563eb,#7c3aed);white-space:nowrap}
        .startGrid,.roomGrid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px}
        input,select{width:100%;margin:8px 0;padding:14px;border-radius:16px;border:1px solid rgba(255,255,255,.12);background:rgba(2,6,23,.78);color:white;font-weight:850}
        button{border:0;padding:13px 18px;border-radius:16px;background:linear-gradient(135deg,#2563eb,#22c55e);color:white;font-weight:950;cursor:pointer}
        .topline,.meta,.rank{display:flex;justify-content:space-between;gap:12px;align-items:center}.meta{margin:10px 0;color:#bfdbfe}
        .wheel{position:relative;width:min(330px,78vw);height:min(330px,78vw);margin:18px auto;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#2563eb,#7c3aed,#06b6d4,#22c55e,#facc15,#2563eb);box-shadow:0 0 90px rgba(37,99,235,.35),inset 0 0 60px rgba(255,255,255,.14);border:12px solid rgba(255,255,255,.14)}
        .spin{animation:spin .42s linear infinite}.center{width:124px;height:124px;border-radius:50%;display:grid;place-items:center;background:#020617;border:8px solid rgba(255,255,255,.12);font-size:22px;font-weight:950;text-align:center;padding:10px}.pointer{position:absolute;top:-18px;font-size:28px;color:#fef3c7}
        .questionCard h2{font-size:clamp(26px,3.5vw,44px);line-height:1.05}.options,.actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}.options button{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.12)}
        .rank{padding:14px;border-radius:18px;background:rgba(255,255,255,.07);margin-top:10px}.rank span{color:#67e8f9;font-weight:950}.feed{padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.07)}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@media(max-width:900px){.page{padding:16px}.hero,.startGrid,.roomGrid{grid-template-columns:1fr;flex-direction:column}}
      `}</style>
    </main>
  )
}
