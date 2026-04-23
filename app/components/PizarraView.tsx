'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import { SUBJECT_PRESETS } from '../../lib/subjects'
import { getQuestionsFromBank } from '../../lib/question-bank'
import { getDiagnosticBySubject, type SubjectDiagnostic } from '../../lib/diagnostics'

type ExerciseSource = 'bank' | 'ai' | 'weakest' | 'random'

type StepReview = {
  verdict: 'correcto' | 'revisar' | 'incorrecto'
  feedback: string
  likelyError: string
  correctedHint: string
  problematicStepIndex?: number | null
}

type Point = { x: number; y: number; move: boolean }

export default function PizarraView() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const [userId, setUserId] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('Precálculo')
  const [selectedTopic, setSelectedTopic] = useState('Módulo 1')
  const [source, setSource] = useState<ExerciseSource>('random')

  const [exercise, setExercise] = useState('')
  const [summary, setSummary] = useState('')
  const [review, setReview] = useState<StepReview | null>(null)

  const [loadingExercise, setLoadingExercise] = useState(false)
  const [loadingReview, setLoadingReview] = useState(false)

  const [diagnostic, setDiagnostic] = useState<SubjectDiagnostic | null>(null)

  const [isDrawing, setIsDrawing] = useState(false)
  const [paths, setPaths] = useState<Point[]>([])

  const subjectConfig = useMemo(
    () => SUBJECT_PRESETS.find((s) => s.name === selectedSubject) || null,
    [selectedSubject]
  )

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser()
      if (!user) return
      setUserId(user.id)

      const diag = await getDiagnosticBySubject(user.id, selectedSubject)
      setDiagnostic(diag)
    }

    load()
  }, [selectedSubject])

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
    ctx.lineJoin = 'round'

    ctx.beginPath()

    for (let i = 0; i < paths.length; i++) {
      const p = paths[i]
      if (!p.move) {
        ctx.moveTo(p.x, p.y)
      } else {
        ctx.lineTo(p.x, p.y)
      }
    }

    ctx.stroke()
  }

  function getCoords(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.setPointerCapture(e.pointerId)
    const { x, y } = getCoords(e)

    setIsDrawing(true)
    setPaths((prev) => [...prev, { x, y, move: false }])
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing) return
    e.preventDefault()

    const { x, y } = getCoords(e)
    setPaths((prev) => [...prev, { x, y, move: true }])
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      canvas.releasePointerCapture(e.pointerId)
    } catch {}

    setIsDrawing(false)
  }

  function clearBoard() {
    setPaths([])
    setReview(null)
  }

  async function generateExercise() {
    try {
      setLoadingExercise(true)
      setReview(null)

      let effectiveTopic = selectedTopic

      if (source === 'weakest' && diagnostic?.weak_topics?.length) {
        effectiveTopic = diagnostic.weak_topics[0]
        setSelectedTopic(effectiveTopic)
      }

      if (source === 'bank' || source === 'random' || source === 'weakest') {
        const bank = await getQuestionsFromBank({
          subject: selectedSubject,
          topic: effectiveTopic,
          limit: 10,
        })

        if (bank.length > 0) {
          const picked = bank[Math.floor(Math.random() * bank.length)]
          setExercise(picked.question)
          return
        }
      }

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'generate-practice-questions',
          subject: selectedSubject,
          topic: effectiveTopic,
          difficulty: 'media',
          count: 1,
          format:
            selectedSubject.toLowerCase().includes('cál') ||
            selectedSubject.toLowerCase().includes('mate')
              ? 'problem-solving'
              : 'open',
        }),
      })

      const data = await res.json()
      const q = data?.questions?.[0]

      if (q?.question) {
        setExercise(q.question)
      } else {
        setExercise('No se pudo generar un ejercicio en este momento.')
      }
    } catch (error) {
      console.error(error)
      alert('No se pudo generar el ejercicio')
    } finally {
      setLoadingExercise(false)
    }
  }

  async function analyzeBoard() {
    if (!exercise.trim()) {
      alert('Primero genera o escribe un ejercicio.')
      return
    }

    try {
      setLoadingReview(true)
      setReview(null)

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'review-steps',
          problem: exercise,
          steps: summary.trim()
            ? summary
                .split('\n')
                .map((x: string) => x.trim())
                .filter(Boolean)
            : ['El usuario resolvió en pizarra y no escribió todos los pasos. Analiza según el resumen disponible.'],
        }),
      })

      const data = await res.json()
      setReview(data?.review || null)
    } catch (error) {
      console.error(error)
      alert('No se pudo analizar la resolución')
    } finally {
      setLoadingReview(false)
    }
  }

  return (
    <div style={container}>
      <div style={heroCard}>
        <h2 style={title}>Pizarra inteligente</h2>
        <p style={subtitle}>
          Funciona con mouse, dedo y lápiz. Puedes generar ejercicios automáticos y luego pedir análisis de tu resolución.
        </p>
      </div>

      <div style={topCard}>
        <div style={grid}>
          <div style={field}>
            <label style={label}>Asignatura</label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value)
                setSelectedTopic('General')
              }}
              style={select}
            >
              {SUBJECT_PRESETS.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div style={field}>
            <label style={label}>Tema</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              style={select}
            >
              {(subjectConfig?.topics || ['General']).map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          <div style={field}>
            <label style={label}>Fuente del ejercicio</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as ExerciseSource)}
              style={select}
            >
              <option value="random">Aleatorio recomendado</option>
              <option value="bank">Banco</option>
              <option value="ai">IA</option>
              <option value="weakest">En lo que me va peor</option>
            </select>
          </div>
        </div>

        <div style={actionsRow}>
          <button onClick={generateExercise} style={button} disabled={loadingExercise}>
            {loadingExercise ? 'Generando...' : 'Generar ejercicio'}
          </button>
          <button onClick={clearBoard} style={secondaryButton}>
            Limpiar pizarra
          </button>
        </div>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Ejercicio</h3>
        <textarea
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
          placeholder="Aquí aparecerá el ejercicio automático o puedes escribir uno manualmente."
          style={exerciseBox}
        />
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Pizarra</h3>
        <div ref={wrapperRef} style={boardWrapper}>
          <canvas
            ref={canvasRef}
            style={canvasStyle}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
        </div>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Resumen opcional de lo que hiciste</h3>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="No es obligatorio poner todos los pasos. Basta con resumir lo que intentaste o dónde crees que te confundiste."
          style={summaryBox}
        />

        <div style={actionsRow}>
          <button onClick={analyzeBoard} style={button} disabled={loadingReview}>
            {loadingReview ? 'Analizando...' : 'Analizar resolución'}
          </button>
        </div>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Resultado del análisis</h3>

        {!review ? (
          <div style={emptyText}>Aquí aparecerá la devolución de la IA.</div>
        ) : (
          <div style={reviewGrid}>
            <div style={reviewItem}>
              <strong>Veredicto</strong>
              <div>{review.verdict}</div>
            </div>

            <div style={reviewItem}>
              <strong>Feedback</strong>
              <div>{review.feedback}</div>
            </div>

            <div style={reviewItem}>
              <strong>Error probable</strong>
              <div>{review.likelyError}</div>
            </div>

            <div style={reviewItem}>
              <strong>Pista corregida</strong>
              <div>{review.correctedHint}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const container: React.CSSProperties = {
  display: 'grid',
  gap: '18px',
  padding: '20px',
  color: 'white',
}

const heroCard: React.CSSProperties = {
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const title: React.CSSProperties = {
  margin: 0,
}

const subtitle: React.CSSProperties = {
  marginTop: '8px',
  opacity: 0.75,
}

const topCard: React.CSSProperties = {
  padding: '18px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const card: React.CSSProperties = {
  padding: '18px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
  gap: '12px',
}

const field: React.CSSProperties = {
  display: 'grid',
  gap: '8px',
}

const label: React.CSSProperties = {
  fontWeight: 700,
}

const select: React.CSSProperties = {
  padding: '10px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
}

const actionsRow: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  marginTop: '14px',
}

const button: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: '12px',
  border: 'none',
  background: '#2563eb',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 700,
}

const secondaryButton: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  cursor: 'pointer',
}

const sectionTitle: React.CSSProperties = {
  marginTop: 0,
}

const exerciseBox: React.CSSProperties = {
  width: '100%',
  minHeight: '110px',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
}

const boardWrapper: React.CSSProperties = {
  width: '100%',
  height: '700px',
  overflow: 'auto',
  borderRadius: '14px',
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,0.10)',
  touchAction: 'none',
}

const canvasStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: '700px',
  touchAction: 'none',
}

const summaryBox: React.CSSProperties = {
  width: '100%',
  minHeight: '120px',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
}

const emptyText: React.CSSProperties = {
  opacity: 0.75,
}

const reviewGrid: React.CSSProperties = {
  display: 'grid',
  gap: '10px',
}

const reviewItem: React.CSSProperties = {
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.04)',
  lineHeight: 1.45,
}