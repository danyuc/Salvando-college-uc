'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { generateMat1000ForceQuestions } from '@/lib/mat1000-force-questions'
import PrecalculoVisual from './PrecalculoVisual'
import PrecalculoSteps from './PrecalculoSteps'
import { analyzeMat1000Diagnostic } from '@/lib/mat1000-diagnostic-engine'

function getEvaluationFromUrl() {
  if (typeof window === 'undefined') return 'I1'
  const value = new URLSearchParams(window.location.search).get('evaluation')
  return value === 'I2' || value === 'I3' || value === 'EXAMEN' ? value : 'I1'
}

export default function DiagnosticView() {
  const [evaluation, setEvaluation] = useState('I1')
  const [questions, setQuestions] = useState<any[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState('')
  const [answers, setAnswers] = useState<any[]>([])
  const [showSteps, setShowSteps] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const ev = getEvaluationFromUrl()
    setEvaluation(ev)
    setQuestions(generateMat1000ForceQuestions({
      evaluation: ev,
      mode: 'diagnostico',
      moduleLabel: 'Todos',
      subtema: 'Todos',
      cantidad: 12,
    }))
  }, [])

  const q = questions[index]
  const correct = answers.filter(a => a.correct).length
  const accuracy = answers.length ? Math.round((correct / answers.length) * 100) : 0
  const weak = [...new Set(answers.filter(a => !a.correct).map(a => a.subtema))]

  function answer(op: string) {
    if (!q || selected) return
    const isCorrect = op === q.respuesta_correcta
    setSelected(op)
    setAnswers(prev => [...prev, { subtema: q.subtema, correct: isCorrect }])
  }

  function next() {
    if (index >= questions.length - 1) {
      const result = {
        ...analyzeMat1000Diagnostic(
          answers.map(a => ({ subtema: a.subtema, correct: a.correct })),
          evaluation
        ),
        completedAt: new Date().toISOString(),
      }

      localStorage.setItem(`mat1000-diagnostic-${evaluation}`, JSON.stringify(result))
      setDone(true)
      return
    }

    setIndex(i => i + 1)
    setSelected('')
    setShowSteps(false)
  }

  return (
    <main style={{ minHeight: '100vh', padding: 28, color: 'white', background: 'linear-gradient(180deg,#020617,#0f172a)' }}>
      <section style={{ maxWidth: 1050, margin: '0 auto', display: 'grid', gap: 18 }}>
        <section style={{ padding: 26, borderRadius: 28, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.13)' }}>
          <p style={{ color: '#93c5fd', fontWeight: 900 }}>MAT1000 · Diagnóstico obligatorio · {evaluation}</p>
          <h1 style={{ fontSize: 42, margin: '8px 0' }}>Diagnóstico práctico de Precálculo</h1>
          <p style={{ color: '#cbd5e1' }}>Este diagnóstico libera la práctica de {evaluation}. Solo incluye contenidos de esa evaluación.</p>
        </section>

        {done && (
          <section style={{ padding: 24, borderRadius: 26, background: 'rgba(16,185,129,.14)', border: '1px solid rgba(16,185,129,.32)' }}>
            <h2>Diagnóstico finalizado</h2>
            <p>Precisión: <strong>{accuracy}%</strong></p>
            {weak.length ? <p>Estás débil en: <strong>{weak.join(', ')}</strong>.</p> : <p>No se detectaron debilidades críticas.</p>}
            <Link href={`/practica?subject=MAT1000&evaluation=${evaluation}&mode=practica`} style={{ color: '#bbf7d0', fontWeight: 900 }}>
              Ir a practicar {evaluation}
            </Link>
          </section>
        )}

        {!done && q && (
          <section style={{ padding: 24, borderRadius: 26, background: 'rgba(255,255,255,.075)', border: '1px solid rgba(255,255,255,.13)' }}>
            <p style={{ color: '#bfdbfe', fontWeight: 900 }}>Pregunta {index + 1} de {questions.length} · {q.subtema}</p>
            <h2>{q.pregunta}</h2>

            {Array.isArray(q.visualizacion?.parametros?.puntos) && (
              <PrecalculoVisual puntos={q.visualizacion.parametros.puntos} />
            )}

            <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
              {q.opciones.map((op: string) => (
                <button
                  key={op}
                  onClick={() => answer(op)}
                  style={{
                    minHeight: 54,
                    borderRadius: 16,
                    border: selected
                      ? op === q.respuesta_correcta
                        ? '1px solid #22c55e'
                        : selected === op
                          ? '1px solid #ef4444'
                          : '1px solid rgba(255,255,255,.13)'
                      : '1px solid rgba(255,255,255,.13)',
                    background: 'rgba(255,255,255,.07)',
                    color: 'white',
                    fontWeight: 900,
                    textAlign: 'left',
                    padding: '0 16px',
                  }}
                >
                  {op}
                </button>
              ))}
            </div>

            {selected && (
              <section style={{ marginTop: 18, padding: 16, borderRadius: 18, background: 'rgba(15,23,42,.75)' }}>
                <p><strong>Respuesta correcta:</strong> {q.respuesta_correcta}</p>
                <p>{q.explicacion || q.explanation}</p>
                <button onClick={() => setShowSteps(v => !v)}>Ver paso a paso</button>
                {showSteps && <PrecalculoSteps pasos={q.pasos || []} animaciones={q.animaciones || []} />}
                <br />
                <button onClick={next} style={{ marginTop: 12 }}>Siguiente</button>
              </section>
            )}
          </section>
        )}
      </section>
    </main>
  )
}
