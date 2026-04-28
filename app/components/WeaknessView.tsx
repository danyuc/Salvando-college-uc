'use client'

import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import {
  getMyPracticeAttempts,
  type PracticeAttempt,
} from '../../lib/practice-attempts'
import { buildWeaknessesByTopic } from '../../lib/weakness-engine'
import {getSubjectColor, SUBJECT_PRESETS_ARRAY} from '../../lib/subjects'

function normalizeAttempts(attempts: PracticeAttempt[]) {
  return attempts.map((attempt) => ({
    subject: attempt.subject || 'General',
    topic: attempt.topic || 'General',
    is_correct: Boolean(attempt.is_correct),
  }))
}

function formatAccuracy(value: number) {
  if (value <= 1) return `${Math.round(value * 100)}%`
  return `${Math.round(value)}%`
}

export default function WeaknessView() {
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)

        const user = await getCurrentUser()

        if (!user) {
          setAttempts([])
          return
        }

        const data = await getMyPracticeAttempts(user.id)
        setAttempts(data || [])
      } catch (error) {
        console.error('WEAKNESS LOAD ERROR:', error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const weaknesses = useMemo(() => {
    const normalized = normalizeAttempts(attempts)

    const filtered = selectedSubject
      ? normalized.filter((item) => item.subject === selectedSubject)
      : normalized

    return buildWeaknessesByTopic(filtered)
  }, [attempts, selectedSubject])

  const stats = useMemo(() => {
    const high = weaknesses.filter((item) => item.weaknessLevel === 'alta').length
    const medium = weaknesses.filter((item) => item.weaknessLevel === 'media').length
    const low = weaknesses.filter((item) => item.weaknessLevel === 'baja').length

    return {
      total: weaknesses.length,
      high,
      medium,
      low,
    }
  }, [weaknesses])

  if (loading) {
    return (
      <div style={container}>
        <div style={card}>Cargando debilidades...</div>
      </div>
    )
  }

  return (
    <div style={container}>
      <div style={heroCard}>
        <h2 style={title}>🧠 Debilidades inteligentes</h2>
        <p style={subtitle}>
          Detecta los temas donde estás fallando más y te muestra qué deberías
          practicar primero.
        </p>
      </div>

      <div style={card}>
        <label style={label}>Filtrar por asignatura</label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          style={select}
        >
          <option value="">Todas las asignaturas</option>
          {SUBJECT_PRESETS_ARRAY.map((subject) => (
            <option key={subject.name} value={subject.name}>
              {subject.icon ? `${subject.icon} ` : ''}
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      <div style={statsGrid}>
        <div style={statCard}>
          <div style={statLabel}>Total</div>
          <div style={statValue}>{stats.total}</div>
        </div>

        <div style={statCard}>
          <div style={statLabel}>Alta</div>
          <div style={statValue}>{stats.high}</div>
        </div>

        <div style={statCard}>
          <div style={statLabel}>Media</div>
          <div style={statValue}>{stats.medium}</div>
        </div>

        <div style={statCard}>
          <div style={statLabel}>Baja</div>
          <div style={statValue}>{stats.low}</div>
        </div>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Ranking de temas débiles</h3>

        {weaknesses.length === 0 ? (
          <div style={emptyText}>
            Aún no hay suficientes intentos para detectar debilidades. Practica
            algunas preguntas y vuelve aquí.
          </div>
        ) : (
          <div style={list}>
            {weaknesses.map((item, index) => (
              <div
                key={`${item.subject}-${item.topic}-${index}`}
                style={{
                  ...weaknessItem,
                  borderLeft: `5px solid ${getSubjectColor(item.subject)}`,
                }}
              >
                <div style={itemHeader}>
                  <div>
                    <div style={itemTitle}>
                      {index + 1}. {item.subject} · {item.topic}
                    </div>
                    <div style={itemMeta}>
                      Precisión: {formatAccuracy(item.accuracy)} · Nivel:{' '}
                      {item.weaknessLevel}
                    </div>
                  </div>

                  <div style={badge}>{item.weaknessLevel}</div>
                </div>

                <div style={recommendationBox}>
                  {item.recommendation ||
                    'Practica más ejercicios de este tema y revisa tus errores frecuentes.'}
                </div>
              </div>
            ))}
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
  padding: '20px',
  borderRadius: '20px',
  background:
    'linear-gradient(135deg, rgba(239,68,68,0.20), rgba(37,99,235,0.16))',
  border: '1px solid rgba(255,255,255,0.12)',
}

const title: React.CSSProperties = {
  margin: 0,
}

const subtitle: React.CSSProperties = {
  marginTop: '8px',
  opacity: 0.78,
  lineHeight: 1.5,
}

const card: React.CSSProperties = {
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const label: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: 800,
}

const select: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: '#111827',
  color: 'white',
}

const statsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '12px',
}

const statCard: React.CSSProperties = {
  padding: '16px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const statLabel: React.CSSProperties = {
  opacity: 0.75,
  fontWeight: 700,
}

const statValue: React.CSSProperties = {
  marginTop: '8px',
  fontSize: '1.8rem',
  fontWeight: 900,
}

const sectionTitle: React.CSSProperties = {
  marginTop: 0,
}

const emptyText: React.CSSProperties = {
  opacity: 0.76,
  lineHeight: 1.5,
}

const list: React.CSSProperties = {
  display: 'grid',
  gap: '12px',
}

const weaknessItem: React.CSSProperties = {
  padding: '14px',
  borderRadius: '14px',
  background: 'rgba(255,255,255,0.04)',
}

const itemHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'flex-start',
}

const itemTitle: React.CSSProperties = {
  fontWeight: 900,
}

const itemMeta: React.CSSProperties = {
  marginTop: '6px',
  opacity: 0.82,
  lineHeight: 1.45,
}

const badge: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: '999px',
  background: 'rgba(239,68,68,0.18)',
  border: '1px solid rgba(239,68,68,0.35)',
  fontWeight: 900,
}

const recommendationBox: React.CSSProperties = {
  marginTop: '10px',
  padding: '10px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.04)',
  lineHeight: 1.5,
}