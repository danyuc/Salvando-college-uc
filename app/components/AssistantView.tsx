'use client'

import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import { getUserEvaluations, type Evaluation } from '../../lib/evaluations'
import { getQuestionEngineBySubject } from '../../lib/question-engine'
import AIStudyChat from './AIStudyChat'

export default function AssistantView() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const user = await getCurrentUser()
        if (!user) return

        const data = await getUserEvaluations(user.id)
        setEvaluations(data || [])

        if ((data || []).length > 0) {
          setSelectedId(data[0].id)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const selectedEvaluation = useMemo(
    () => evaluations.find((item) => item.id === selectedId) ?? null,
    [evaluations, selectedId]
  )

  const engine = useMemo(
    () =>
      selectedEvaluation
        ? getQuestionEngineBySubject(
            selectedEvaluation.subject,
            selectedEvaluation.type
          )
        : null,
    [selectedEvaluation]
  )

  return (
    <div style={container}>
      <div style={headerCard}>
        <h2 style={title}>Asistente académico</h2>
        <p style={subtitle}>
          Elige una evaluación y conversa con una IA contextualizada según el ramo y la forma correcta de practicar.
        </p>

        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          style={select}
        >
          {loading && <option value="">Cargando evaluaciones...</option>}

          {!loading && evaluations.length === 0 && (
            <option value="">Sin evaluaciones</option>
          )}

          {!loading &&
            evaluations.map((item) => (
              <option key={item.id} value={item.id}>
                {item.subject} · {item.type} {item.number ?? ''} ·{' '}
                {item.topic || item.title || 'Sin tema'}
              </option>
            ))}
        </select>

        {selectedEvaluation && engine && (
          <div style={contextCard}>
            <div style={contextTitle}>
              {selectedEvaluation.type} {selectedEvaluation.number ?? ''} ·{' '}
              {selectedEvaluation.topic || selectedEvaluation.title || 'Sin tema'}
            </div>

            <div style={contextMeta}>
              {selectedEvaluation.subject} · modo recomendado: {engine.recommendedMode}
            </div>

            <div style={contextExplanation}>{engine.explanation}</div>
          </div>
        )}
      </div>

      <AIStudyChat
        context={
          selectedEvaluation && engine
            ? {
                subject: selectedEvaluation.subject,
                type: selectedEvaluation.type,
                topic:
                  selectedEvaluation.topic ||
                  selectedEvaluation.title ||
                  'tema principal',
                difficulty: engine.difficulty,
                start_date: selectedEvaluation.start_date,
                end_date: selectedEvaluation.end_date,
                number: selectedEvaluation.number,
                notes: selectedEvaluation.notes,
                mode: engine.recommendedMode,
                strategy: engine.strategy,
              }
            : null
        }
        title="Chat IA"
      />
    </div>
  )
}

const container: React.CSSProperties = {
  display: 'grid',
  gap: '18px',
  padding: '20px',
}

const headerCard: React.CSSProperties = {
  padding: '18px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
  color: 'white',
}

const title: React.CSSProperties = {
  marginTop: 0,
  marginBottom: '8px',
}

const subtitle: React.CSSProperties = {
  opacity: 0.75,
}

const select: React.CSSProperties = {
  width: '100%',
  marginTop: '12px',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
}

const contextCard: React.CSSProperties = {
  marginTop: '14px',
  padding: '14px',
  borderRadius: '14px',
  background: 'rgba(255,255,255,0.04)',
}

const contextTitle: React.CSSProperties = {
  fontWeight: 800,
  color: 'white',
}

const contextMeta: React.CSSProperties = {
  marginTop: '6px',
  opacity: 0.72,
  fontSize: '0.92rem',
}

const contextExplanation: React.CSSProperties = {
  marginTop: '10px',
  opacity: 0.88,
  lineHeight: 1.5,
}