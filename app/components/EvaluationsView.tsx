'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import { getUserEvaluations, type Evaluation } from '../../lib/evaluations'
import EvaluationForm from './EvaluationForm'

export default function EvaluationsView() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [editing, setEditing] = useState<Evaluation | null>(null)
  const [userId, setUserId] = useState('')

  async function loadAll(currentUserId?: string) {
    const user = currentUserId ? { id: currentUserId } : await getCurrentUser()
    if (!user) return

    setUserId(user.id)
    const data = await getUserEvaluations(user.id)
    setEvaluations(data || [])
  }

  useEffect(() => {
    loadAll()
  }, [])

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>Evaluaciones</h2>

        <EvaluationForm
          userId={userId}
          initialData={editing}
          onSaved={async () => {
            setEditing(null)
            await loadAll(userId)
          }}
        />
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Lista</h3>

        {evaluations.map((item) => (
          <div key={item.id} style={itemCard}>
            <div style={itemTitle}>
              {item.subject} · {item.type} {item.number ?? ''}
            </div>
            <div style={itemMeta}>
              {item.topic || 'Sin tema'} · {item.start_date}
            </div>

            <button onClick={() => setEditing(item)} style={button}>
              Editar
            </button>
          </div>
        ))}
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

const card: React.CSSProperties = {
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const title: React.CSSProperties = {
  marginTop: 0,
}

const sectionTitle: React.CSSProperties = {
  marginTop: 0,
}

const itemCard: React.CSSProperties = {
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.04)',
  marginBottom: '10px',
}

const itemTitle: React.CSSProperties = {
  fontWeight: 800,
}

const itemMeta: React.CSSProperties = {
  marginTop: '6px',
  opacity: 0.78,
}

const button: React.CSSProperties = {
  marginTop: '10px',
  padding: '10px 12px',
  borderRadius: '10px',
  border: 'none',
  background: '#2563eb',
  color: 'white',
  cursor: 'pointer',
}
