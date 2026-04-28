'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import {getSubjectMeta, SUBJECT_PRESETS_ARRAY} from '../../lib/subjects'
import { getQuestionsFromBank } from '../../lib/question-bank'
import {
  getDiagnosticBySubject,
  type SubjectDiagnostic,
} from '../../lib/diagnostics'

type ExerciseSource = 'bank' | 'ai' | 'weakest' | 'random'
type BoardMode = 'draw' | 'erase'
type BoardBackground = 'plain' | 'grid' | 'math'

type StepReview = {
  verdict: 'correcto' | 'revisar' | 'incorrecto'
  feedback: string
  likelyError: string
  correctedHint: string
  problematicStepIndex?: number | null
}

type StrokePoint = {
  x: number
  y: number
}

type Stroke = {
  id: string
  points: StrokePoint[]
  color: string
  size: number
  mode: BoardMode
}

const COLORS = ['#ffffff', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#c084fc']

export default function PizarraView() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const [selectedSubject, setSelectedSubject] = useState('Precálculo')
  const [selectedTopic, setSelectedTopic] = useState('General')
  const [source, setSource] = useState<ExerciseSource>('random')
  const [background, setBackground] = useState<BoardBackground>('math')
  const [mode, setMode] = useState<BoardMode>('draw')
  const [color, setColor] = useState('#ffffff')
  const [size, setSize] = useState(3)

  const [exercise, setExercise] = useState('')
  const [summary, setSummary] = useState('')
  const [review, setReview] = useState<StepReview | null>(null)
  const [diagnostic, setDiagnostic] = useState<SubjectDiagnostic | null>(null)

  const [loadingExercise, setLoadingExercise] = useState(false)
  const [loadingReview, setLoadingReview] = useState(false)

  const [isDrawing, setIsDrawing] = useState(false)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null)

  const subjectConfig = useMemo(
    () => getSubjectMeta(selectedSubject),
    [selectedSubject]
  )

  const subjectTopics = useMemo(() => {
    const topics =
      subjectConfig?.units?.flatMap((unit) => unit.topics || []) || []

    const unique = Array.from(new Set(topics))
    return unique.length > 0 ? unique : ['General']
  }, [subjectConfig])

  useEffect(() => {
    if (!subjectTopics.includes(selectedTopic)) {
      setSelectedTopic(subjectTopics[0] || 'General')
    }
  }, [subjectTopics, selectedTopic])

  useEffect(() => {
    async function loadDiagnostic() {
      const user = await getCurrentUser()
      if (!user) return

      try {
        const diag = await getDiagnosticBySubject(user.id, selectedSubject)
        setDiagnostic(diag)
      } catch {
        setDiagnostic(null)
      }
    }

    loadDiagnostic()
  }, [selectedSubject])

  useEffect(() => {
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  useEffect(() => {
    redraw()
  }, [strokes, currentStroke, background])

  function resizeCanvas() {
    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return

    const rect = wrapper.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvas.width = rect.width * dpr
    canvas.height = 720 * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = '720px'

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    redraw()
  }

  function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, width, height)

    if (background === 'grid' || background === 'math') {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 1

      for (let x = 0; x <= width; x += 32) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      for (let y = 0; y <= height; y += 32) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
    }

    if (background === 'math') {
      const midX = width / 2
      const midY = height / 2

      ctx.strokeStyle = 'rgba(96,165,250,0.55)'
      ctx.lineWidth = 2

      ctx.beginPath()
      ctx.moveTo(0, midY)
      ctx.lineTo(width, midY)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(midX, 0)
      ctx.lineTo(midX, height)
      ctx.stroke()

      ctx.fillStyle = 'rgba(255,255,255,0.55)'
      ctx.font = '12px sans-serif'
      ctx.fillText('x', width - 18, midY - 8)
      ctx.fillText('y', midX + 8, 16)
    }
  }

  function redraw() {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()

    ctx.clearRect(0, 0, rect.width, rect.height)
    drawBackground(ctx, rect.width, rect.height)

    for (const stroke of strokes) {
      drawStroke(ctx, stroke)
    }

    if (currentStroke) {
      drawStroke(ctx, currentStroke)
    }
  }

  function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
    if (stroke.points.length < 1) return

    ctx.save()

    ctx.globalCompositeOperation =
      stroke.mode === 'erase' ? 'destination-out' : 'source-over'

    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.mode === 'erase' ? stroke.size * 5 : stroke.size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.beginPath()
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y)

    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
    }

    ctx.stroke()
    ctx.restore()
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

    const point = getCoords(e)

    const stroke: Stroke = {
      id: crypto.randomUUID(),
      points: [point],
      color,
      size,
      mode,
    }

    setCurrentStroke(stroke)
    setIsDrawing(true)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing || !currentStroke) return
    e.preventDefault()

    const point = getCoords(e)

    setCurrentStroke((prev) =>
      prev ? { ...prev, points: [...prev.points, point] } : prev
    )
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault()

    if (currentStroke) {
      setStrokes((prev) => [...prev, currentStroke])
    }

    setCurrentStroke(null)
    setIsDrawing(false)

    try {
      canvasRef.current?.releasePointerCapture(e.pointerId)
    } catch {}
  }

  function clearBoard() {
    setStrokes([])
    setCurrentStroke(null)
    setReview(null)
  }

  function undo() {
    setStrokes((prev) => prev.slice(0, -1))
  }

  function exportPng() {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `pizarra-${selectedSubject}-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  async function generateExercise() {
    try {
      setLoadingExercise(true)
      setReview(null)

      let effectiveTopic = selectedTopic || 'General'

      if (source === 'weakest' && diagnostic?.weak_topics?.length) {
        effectiveTopic = diagnostic.weak_topics[0]
        setSelectedTopic(effectiveTopic)
      }

      if (source !== 'ai') {
        const bank = await getQuestionsFromBank({
          subject: selectedSubject,
          topic: effectiveTopic,
          limit: 12,
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
            selectedSubject.toLowerCase().includes('precál') ||
            selectedSubject.toLowerCase().includes('mate')
              ? 'problem-solving'
              : 'open',
        }),
      })

      const data = await res.json()
      const q = data?.questions?.[0]

      setExercise(q?.question || 'No se pudo generar un ejercicio.')
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

      const steps = summary.trim()
        ? summary
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
        : [
            'El usuario resolvió el ejercicio en la pizarra visual, pero no escribió pasos textuales. Entrega retroalimentación general, pide verificar pasos y sugiere cómo ordenar la resolución.',
          ]

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'review-steps',
          problem: exercise,
          steps,
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
        <div>
          <h2 style={title}>✍️ Pizarra Dios</h2>
          <p style={subtitle}>
            Pizarra visual para resolver ejercicios, graficar, practicar con banco/IA y recibir feedback.
          </p>
        </div>

        <div style={heroActions}>
          <button onClick={generateExercise} style={primaryButton} disabled={loadingExercise}>
            {loadingExercise ? 'Generando...' : 'Generar ejercicio'}
          </button>
          <button onClick={analyzeBoard} style={secondaryButton} disabled={loadingReview}>
            {loadingReview ? 'Analizando...' : 'Analizar resolución'}
          </button>
        </div>
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
                setReview(null)
              }}
              style={select}
            >
              {SUBJECT_PRESETS_ARRAY.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.icon ? `${item.icon} ` : ''}
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
              {subjectTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          <div style={field}>
            <label style={label}>Fuente</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as ExerciseSource)}
              style={select}
            >
              <option value="random">Aleatorio banco + IA</option>
              <option value="bank">Solo banco</option>
              <option value="ai">Solo IA</option>
              <option value="weakest">Tema débil</option>
            </select>
          </div>

          <div style={field}>
            <label style={label}>Fondo</label>
            <select
              value={background}
              onChange={(e) => setBackground(e.target.value as BoardBackground)}
              style={select}
            >
              <option value="math">Plano cartesiano</option>
              <option value="grid">Cuadrícula</option>
              <option value="plain">Liso</option>
            </select>
          </div>
        </div>
      </div>

      <div style={toolbar}>
        <button
          onClick={() => setMode('draw')}
          style={mode === 'draw' ? activeToolButton : toolButton}
        >
          Lápiz
        </button>

        <button
          onClick={() => setMode('erase')}
          style={mode === 'erase' ? activeToolButton : toolButton}
        >
          Borrador
        </button>

        {COLORS.map((item) => (
          <button
            key={item}
            onClick={() => {
              setColor(item)
              setMode('draw')
            }}
            style={{
              ...colorButton,
              background: item,
              outline: color === item ? '3px solid #93c5fd' : 'none',
            }}
            aria-label={`Color ${item}`}
          />
        ))}

        <label style={sizeControl}>
          Grosor
          <input
            type="range"
            min={1}
            max={12}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          />
          {size}
        </label>

        <button onClick={undo} style={toolButton}>
          Deshacer
        </button>

        <button onClick={clearBoard} style={toolButton}>
          Limpiar
        </button>

        <button onClick={exportPng} style={toolButton}>
          Descargar PNG
        </button>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Ejercicio</h3>
        <textarea
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
          placeholder="Genera un ejercicio automático o escribe uno manualmente."
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
            onPointerCancel={handlePointerUp}
            onPointerLeave={(e) => {
              if (isDrawing) handlePointerUp(e)
            }}
          />
        </div>
      </div>

      <div style={twoColumns}>
        <div style={card}>
          <h3 style={sectionTitle}>Pasos escritos / resumen</h3>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder={`Ejemplo:
1. Identifiqué la función.
2. Igualé a cero.
3. Factoricé.
4. Revisé el gráfico.`}
            style={summaryBox}
          />

          <div style={hintBox}>
            Tip: para que la IA revise mejor, escribe los pasos principales aunque hayas trabajado en la pizarra.
          </div>
        </div>

        <div style={card}>
          <h3 style={sectionTitle}>Feedback IA</h3>

          {!review ? (
            <div style={emptyText}>
              Aquí aparecerá el análisis de tu procedimiento.
            </div>
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
  borderRadius: '20px',
  background:
    'linear-gradient(135deg, rgba(37,99,235,0.22), rgba(124,58,237,0.18))',
  border: '1px solid rgba(255,255,255,0.12)',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  flexWrap: 'wrap',
  alignItems: 'center',
}

const title: React.CSSProperties = {
  margin: 0,
}

const subtitle: React.CSSProperties = {
  marginTop: '8px',
  opacity: 0.78,
  maxWidth: '760px',
  lineHeight: 1.45,
}

const heroActions: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
}

const topCard: React.CSSProperties = {
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const card: React.CSSProperties = {
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '12px',
}

const field: React.CSSProperties = {
  display: 'grid',
  gap: '8px',
}

const label: React.CSSProperties = {
  fontWeight: 800,
}

const select: React.CSSProperties = {
  padding: '11px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: '#111827',
  color: 'white',
}

const toolbar: React.CSSProperties = {
  padding: '14px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  alignItems: 'center',
}

const primaryButton: React.CSSProperties = {
  padding: '12px 15px',
  borderRadius: '12px',
  border: 'none',
  background: '#2563eb',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 800,
}

const secondaryButton: React.CSSProperties = {
  ...primaryButton,
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
}

const toolButton: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.07)',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 700,
}

const activeToolButton: React.CSSProperties = {
  ...toolButton,
  background: '#2563eb',
}

const colorButton: React.CSSProperties = {
  width: '30px',
  height: '30px',
  borderRadius: '999px',
  border: '1px solid rgba(255,255,255,0.25)',
  cursor: 'pointer',
}

const sizeControl: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  fontWeight: 700,
}

const sectionTitle: React.CSSProperties = {
  marginTop: 0,
}

const exerciseBox: React.CSSProperties = {
  width: '100%',
  minHeight: '110px',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: '#111827',
  color: 'white',
  lineHeight: 1.5,
}

const boardWrapper: React.CSSProperties = {
  width: '100%',
  height: '720px',
  overflow: 'hidden',
  borderRadius: '16px',
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,0.12)',
  touchAction: 'none',
}

const canvasStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: '720px',
  touchAction: 'none',
  cursor: 'crosshair',
}

const twoColumns: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '18px',
}

const summaryBox: React.CSSProperties = {
  width: '100%',
  minHeight: '160px',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: '#111827',
  color: 'white',
  lineHeight: 1.5,
}

const hintBox: React.CSSProperties = {
  marginTop: '12px',
  padding: '11px',
  borderRadius: '12px',
  background: 'rgba(37,99,235,0.14)',
  border: '1px solid rgba(37,99,235,0.25)',
  lineHeight: 1.45,
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
  lineHeight: 1.5,
}