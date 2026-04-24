'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import { SUBJECT_PRESETS } from '../../lib/subjects'
import { getQuestionsFromBank } from '../../lib/question-bank'
import {
  getDiagnosticBySubject,
  type SubjectDiagnostic,
} from '../../lib/diagnostics'

type ExerciseSource = 'bank' | 'ai' | 'weakest' | 'random'

type StepReview = {
  verdict: 'correcto' | 'revisar' | 'incorrecto'
  feedback: string
  likelyError: string
  correctedHint: string
}

type Point = { x: number; y: number; move: boolean }

export default function PizarraView() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const [selectedSubject, setSelectedSubject] = useState('Precálculo')
  const [selectedTopic, setSelectedTopic] = useState('General')
  const [source, setSource] = useState<ExerciseSource>('random')

  const [exercise, setExercise] = useState('')
  const [summary, setSummary] = useState('')
  const [review, setReview] = useState<StepReview | null>(null)

  const [loadingExercise, setLoadingExercise] = useState(false)
  const [loadingReview, setLoadingReview] = useState(false)

  const [diagnostic, setDiagnostic] = useState<SubjectDiagnostic | null>(null)

  const [isDrawing, setIsDrawing] = useState(false)
  const [paths, setPaths] = useState<Point[]>([])

  // 🔥 CONFIG SUBJECT
  const subjectConfig = useMemo(
    () => SUBJECT_PRESETS.find((s) => s.name === selectedSubject),
    [selectedSubject]
  )

  // 🔥 TOPICS LIMPIOS (SIN DUPLICADOS)
  const subjectTopics = useMemo(() => {
    const topics =
      subjectConfig?.units?.flatMap((u) => u.topics || []) || []

    return topics.length
      ? Array.from(new Set(topics))
      : ['General']
  }, [subjectConfig])

  // 🔥 LOAD USER + DIAGNOSTIC
  useEffect(() => {
    async function load() {
      const user = await getCurrentUser()
      if (!user) return

      const diag = await getDiagnosticBySubject(user.id, selectedSubject)
      setDiagnostic(diag)
    }

    load()
  }, [selectedSubject])

  // 🔥 CANVAS INIT
  useEffect(() => {
    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return

    const rect = wrapper.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvas.width = rect.width * dpr
    canvas.height = 700 * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `700px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    redraw()
  }, [paths])

  function redraw() {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'

    ctx.beginPath()

    paths.forEach((p) => {
      if (!p.move) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    })

    ctx.stroke()
  }

  function getCoords(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    setIsDrawing(true)
    const { x, y } = getCoords(e)
    setPaths((prev) => [...prev, { x, y, move: false }])
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing) return
    const { x, y } = getCoords(e)
    setPaths((prev) => [...prev, { x, y, move: true }])
  }

  function handlePointerUp() {
    setIsDrawing(false)
  }

  function clearBoard() {
    setPaths([])
    setReview(null)
  }

  // 🔥 GENERADOR PRO (ARREGLADO)
  async function generateExercise() {
    setLoadingExercise(true)
    setReview(null)

    try {
      let topic = selectedTopic

      if (source === 'weakest' && diagnostic?.weak_topics?.length) {
        topic = diagnostic.weak_topics[0]
        setSelectedTopic(topic)
      }

      // 🔥 1. BANCO
      if (source !== 'ai') {
        const bank = await getQuestionsFromBank({
          subject: selectedSubject,
          topic,
          limit: 10,
        })

        if (bank.length) {
          const q = bank[Math.floor(Math.random() * bank.length)]
          setExercise(q.question)
          return
        }
      }

      // 🔥 2. IA
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'generate-practice-questions',
          subject: selectedSubject,
          topic,
          count: 1,
          format: 'problem-solving',
        }),
      })

      const data = await res.json()
      setExercise(data?.questions?.[0]?.question || 'No generado.')
    } catch (err) {
      console.error(err)
      alert('Error generando ejercicio')
    } finally {
      setLoadingExercise(false)
    }
  }

  // 🔥 ANALYSIS FIX
  async function analyzeBoard() {
    if (!exercise) {
      alert('Genera un ejercicio primero')
      return
    }

    setLoadingReview(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'review-steps',
          problem: exercise,
          steps: summary
            ? summary.split('\n')
            : ['Resolución escrita en pizarra'],
        }),
      })

      const data = await res.json()
      setReview(data.review)
    } catch {
      alert('Error analizando')
    } finally {
      setLoadingReview(false)
    }
  }

  return (
    <div style={container}>
      <h2>Pizarra Inteligente</h2>

      <div style={grid}>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          {SUBJECT_PRESETS.map((s) => (
            <option key={s.name}>{s.name}</option>
          ))}
        </select>

        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
        >
          {subjectTopics.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <select
          value={source}
          onChange={(e) => setSource(e.target.value as ExerciseSource)}
        >
          <option value="random">Aleatorio</option>
          <option value="bank">Banco</option>
          <option value="ai">IA</option>
          <option value="weakest">Débil</option>
        </select>
      </div>

      <button onClick={generateExercise} disabled={loadingExercise}>
        {loadingExercise ? 'Generando...' : 'Generar ejercicio'}
      </button>

      <textarea value={exercise} onChange={(e) => setExercise(e.target.value)} />

      <div ref={wrapperRef}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: 700 }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      </div>

      <button onClick={clearBoard}>Limpiar</button>

      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="Resume lo que hiciste"
      />

      <button onClick={analyzeBoard} disabled={loadingReview}>
        {loadingReview ? 'Analizando...' : 'Analizar'}
      </button>

      {review && (
        <div>
          <p>{review.verdict}</p>
          <p>{review.feedback}</p>
          <p>{review.likelyError}</p>
          <p>{review.correctedHint}</p>
        </div>
      )}
    </div>
  )
}

const container = { display: 'grid', gap: 16, color: 'white' }
const grid = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }