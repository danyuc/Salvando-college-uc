'use client'

import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import {
  getMyPracticeAttempts,
  type PracticeAttempt,
} from '../../lib/practice-attempts'
import { buildWeaknessesByTopic } from '../../lib/weakness-engine'
import { SUBJECT_PRESETS } from '../../lib/subjects'

export default function WeaknessView() {
  const [userId, setUserId] = useState('')
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([])
  const [selectedSubject, setSelectedSubject] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const user = await getCurrentUser()
        if (!user) return

        setUserId(user.id)
        const data = await getMyPracticeAttempts(user.id)
        setAttempts(data || [])
      } catch (error) {
        console.error(error)
      }
    }

    load()
  }, [])

  const weaknesses = useMemo(
    () => buildWeaknessesByTopic(attempts, selectedSubject || undefined),
    [attempts, selectedSubject]
  )

  return (
    <div style={container}>
      <div style={heroCard}>
        <h2 style={title}>Debilidades reales por tema</h2>
        <p style={subtitle}>
          Esto se calcula según tus respuestas correctas e incorrectas en práctica.
        </p>
      </div>

      <div style={toolbar}>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          style={select}
        >
          <option value="">Todas las materias</option>
          {SUBJECT_PRESETS.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {weaknesses.length === 0 ? (
        <div style={card}>Aún no hay intentos suficientes para analizar.</div>
      ) : (
        weaknesses.map((item) => (
          <div key={`${item.subject}-${item.topic}`} style={card}>
            <div style={topRow}>
              <div>
                <div style={subject}>{item.subject}</div>
                <div style={topic}>{item.topic}</div>
              </div>

              <div style={badge(item.weaknessLevel)}>{item.weaknessLevel}</div>
            </div>

            <div style={statsGrid}>
              <div style={statBox}>
                <span style={label}>Precisión</span>
                <strong>{item.accuracy}%</strong>
              </div>
              <div style={statBox}>
                <span style={label}>Correctas</span>
                <strong>{item.correct}</strong>
              </div>
              <div style={statBox}>
                <span style={label}>Incorrectas</span>
                <strong>{item.incorrect}</strong>
              </div>
              <div style={statBox}>
                <span style={label}>Intentos</span>
                <strong>{item.total}</strong>
              </div>
            </div>

            <div style={recommendationBox}>{item.recommendation}</div>
          </div>
        ))
      )}
    </div>
  )
}

function badge(level: 'alta' | 'media' | 'baja'): React.CSSProperties {
  return {
    padding: '6px 10px',
    borderRadius: '999px',
    background:
      level === 'alta'
        ? 'rgba(239,68,68,.18)'
        : level === 'media'
        ? 'rgba(250,204,21,.18)'
        : 'rgba(34,197,94,.18)',
    color:
      level === 'alta'
        ? '#fca5a5'
        : level === 'media'
        ? '#fde68a'
        : '#86efac',
    fontWeight: 800,
    textTransform: 'capitalize',
    fontSize: '0.85rem',
  }
}

const container: React.CSSProperties = {
  display: 'grid',
  gap: '16px',
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

const toolbar: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
}

const select: React.CSSProperties = {
  padding: '10px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
}

const card: React.CSSProperties = {
  padding: '18px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const topRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '10px',
  alignItems: 'center',
  marginBottom: '14px',
}

const subject: React.CSSProperties = {
  fontWeight: 800,
  fontSize: '1.05rem',
}

const topic: React.CSSProperties = {
  opacity: 0.78,
  marginTop: '4px',
}

const statsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
  gap: '12px',
}

const statBox: React.CSSProperties = {
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.04)',
  display: 'grid',
  gap: '6px',
}

const label: React.CSSProperties = {
  opacity: 0.75,
  fontSize: '0.9rem',
}

const recommendationBox: React.CSSProperties = {
  marginTop: '14px',
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(59,130,246,.12)',
  lineHeight: 1.45,
}