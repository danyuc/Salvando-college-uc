'use client'

import { useMemo, useState } from 'react'
import { generatePracticeSet } from '@/lib/precalculo-engine'
import PrecalculoVisual from '../components/PrecalculoVisual'
import PrecalculoSteps from '../components/PrecalculoSteps'

export default function PrecalculoProPage() {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState('')
  const [showSolution, setShowSolution] = useState(false)
  const [correctas, setCorrectas] = useState(0)

  const questions = useMemo(() => {
    return generatePracticeSet({
      modulo: 'modulo_1',
      subtema: 'Distancia entre puntos',
      cantidad: 10,
      dificultad: 'media',
      origen: 'prueba_real',
    })
  }, [])

  const q = questions[index]
  const isCorrect = selected === q?.respuesta_correcta

  function responder(opcion: string) {
    if (selected) return
    setSelected(opcion)
    setShowSolution(true)
    if (opcion === q.respuesta_correcta) setCorrectas(prev => prev + 1)
  }

  function siguiente() {
    setSelected('')
    setShowSolution(false)
    setIndex(prev => Math.min(prev + 1, questions.length - 1))
  }

  if (!q) return null

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: 24,
        color: 'white',
        background: 'linear-gradient(180deg, #020617 0%, #0f172a 100%)',
      }}
    >
      <section
        style={{
          maxWidth: 980,
          margin: '0 auto',
          padding: 24,
          borderRadius: 28,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <p style={{ opacity: 0.75, margin: 0 }}>MAT1000 · Precálculo Pro</p>
        <h1 style={{ marginTop: 8 }}>Modo Interrogación UC</h1>

        <p style={{ opacity: 0.8 }}>
          Pregunta {index + 1} de {questions.length} · Correctas: {correctas}
        </p>

        <h2>{q.pregunta}</h2>

        <PrecalculoVisual
          puntos={(q.visualizacion?.parametros?.puntos as any) || []}
        />

        <div style={{ display: 'grid', gap: 10, marginTop: 20 }}>
          {q.opciones.map(opcion => (
            <button
              key={opcion}
              onClick={() => responder(opcion)}
              style={{
                padding: 14,
                borderRadius: 14,
                border:
                  selected === opcion
                    ? opcion === q.respuesta_correcta
                      ? '1px solid #22c55e'
                      : '1px solid #ef4444'
                    : '1px solid rgba(255,255,255,0.15)',
                background:
                  selected === opcion
                    ? opcion === q.respuesta_correcta
                      ? 'rgba(34,197,94,0.18)'
                      : 'rgba(239,68,68,0.18)'
                    : 'rgba(255,255,255,0.06)',
                color: 'white',
                textAlign: 'left',
                cursor: selected ? 'default' : 'pointer',
              }}
            >
              {opcion}
            </button>
          ))}
        </div>

        {showSolution && (
          <>
            <section style={{ marginTop: 18 }}>
              <strong>
                {isCorrect ? 'Correcto.' : 'Incorrecto.'}
              </strong>{' '}
              Respuesta: {q.respuesta_correcta}
              <p>{q.explanation}</p>
            </section>

            <PrecalculoSteps pasos={q.pasos} animaciones={q.animaciones} />

            <button
              onClick={siguiente}
              disabled={index === questions.length - 1}
              style={{
                marginTop: 20,
                padding: '12px 18px',
                borderRadius: 14,
                border: 'none',
                background: '#6366f1',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Siguiente
            </button>
          </>
        )}
      </section>
    </main>
  )
}
