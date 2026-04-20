'use client'

import { useRef, useState } from 'react'

type StepReview = {
  verdict: 'correcto' | 'revisar' | 'incorrecto'
  feedback: string
  likelyError: string
  correctedHint: string
}

export default function PizarraView() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [drawing, setDrawing] = useState(false)
  const [problem, setProblem] = useState('')
  const [steps, setSteps] = useState<string[]>([''])
  const [review, setReview] = useState<StepReview | null>(null)
  const [loading, setLoading] = useState(false)

  function getCtx() {
    const canvas = canvasRef.current
    if (!canvas) return null
    return canvas.getContext('2d')
  }

  function startDrawing(e: React.MouseEvent<HTMLCanvasElement>) {
    const ctx = getCtx()
    if (!ctx) return
    setDrawing(true)
    ctx.beginPath()
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!drawing) return
    const ctx = getCtx()
    if (!ctx) return

    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#ffffff'
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    ctx.stroke()
  }

  function stopDrawing() {
    setDrawing(false)
  }

  function clearBoard() {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  function updateStep(index: number, value: string) {
    setSteps((prev) => prev.map((step, i) => (i === index ? value : step)))
  }

  function addStep() {
    setSteps((prev) => [...prev, ''])
  }

  function removeStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index))
  }

  async function reviewSteps() {
    const cleaned = steps.map((s) => s.trim()).filter(Boolean)
    if (!problem.trim() || cleaned.length === 0) return

    try {
      setLoading(true)

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'review-steps',
          problem,
          steps: cleaned,
        }),
      })

      const data = await res.json()
      setReview(data?.review || null)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>Pizarra inteligente</h2>
        <p style={subtitle}>
          Puedes escribir el ejercicio, desarrollar pasos y pedir revisión del punto donde te equivocaste.
        </p>

        <input
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Escribe el ejercicio o problema"
          style={input}
        />

        <canvas
          ref={canvasRef}
          width={900}
          height={480}
          style={canvasStyle}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />

        <div style={actions}>
          <button onClick={clearBoard} style={secondaryButton}>
            Limpiar pizarra
          </button>
        </div>
      </div>

      <div style={card}>
        <div style={stepsHeader}>
          <h3 style={sectionTitle}>Pasos escritos</h3>
          <button onClick={addStep} style={button}>
            + Agregar paso
          </button>
        </div>

        {steps.map((step, index) => (
          <div key={index} style={stepRow}>
            <div style={stepIndex}>{index + 1}</div>
            <input
              value={step}
              onChange={(e) => updateStep(index, e.target.value)}
              placeholder={`Paso ${index + 1}`}
              style={stepInput}
            />
            {steps.length > 1 && (
              <button onClick={() => removeStep(index)} style={dangerButton}>
                ✕
              </button>
            )}
          </div>
        ))}

        <div style={actions}>
          <button onClick={reviewSteps} style={button}>
            {loading ? 'Revisando...' : 'Revisar desarrollo'}
          </button>
        </div>
      </div>

      {review && (
        <div style={card}>
          <h3 style={sectionTitle}>Revisión</h3>

          <div style={reviewBadge(review.verdict)}>{review.verdict}</div>

          <div style={reviewBlock}>
            <strong>Feedback</strong>
            <div style={reviewText}>{review.feedback}</div>
          </div>

          <div style={reviewBlock}>
            <strong>Error probable</strong>
            <div style={reviewText}>{review.likelyError}</div>
          </div>

          <div style={reviewBlock}>
            <strong>Pista corregida</strong>
            <div style={reviewText}>{review.correctedHint}</div>
          </div>
        </div>
      )}
    </div>
  )
}

function reviewBadge(verdict: string): React.CSSProperties {
  const background =
    verdict === 'correcto'
      ? 'rgba(16,185,129,0.25)'
      : verdict === 'revisar'
      ? 'rgba(245,158,11,0.25)'
      : 'rgba(239,68,68,0.25)'

  return {
    display: 'inline-block',
    padding: '8px 12px',
    borderRadius: '999px',
    background,
    fontWeight: 800,
    marginBottom: '12px',
    textTransform: 'capitalize',
  }
}

const container: React.CSSProperties = {
  display: 'grid',
  gap: '18px',
  padding: '20px',
  color: 'white',
}

const card: React.CSSProperties = {
  padding: '18px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
}

const title: React.CSSProperties = {
  marginTop: 0,
}

const subtitle: React.CSSProperties = {
  opacity: 0.75,
}

const input: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
}

const canvasStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: '14px',
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,0.10)',
  marginTop: '14px',
}

const actions: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  marginTop: '12px',
  flexWrap: 'wrap',
}

const button: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '10px',
  border: 'none',
  background: '#2563eb',
  color: 'white',
  cursor: 'pointer',
}

const secondaryButton: React.CSSProperties = {
  ...button,
  background: '#64748b',
}

const dangerButton: React.CSSProperties = {
  ...button,
  background: '#ef4444',
}

const sectionTitle: React.CSSProperties = {
  marginTop: 0,
}

const stepsHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'center',
  flexWrap: 'wrap',
}

const stepRow: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '40px 1fr auto',
  gap: '10px',
  alignItems: 'center',
  marginBottom: '10px',
}

const stepIndex: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '999px',
  display: 'grid',
  placeItems: 'center',
  background: 'rgba(59,130,246,0.18)',
  fontWeight: 800,
}

const stepInput: React.CSSProperties = {
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
}

const reviewBlock: React.CSSProperties = {
  marginTop: '12px',
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.04)',
}

const reviewText: React.CSSProperties = {
  marginTop: '6px',
  opacity: 0.9,
  lineHeight: 1.5,
}