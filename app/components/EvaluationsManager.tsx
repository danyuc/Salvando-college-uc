'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import {
  deleteEvaluation,
  getUserEvaluations,
  type Evaluation,
} from '../../lib/evaluations'
import EvaluationForm from './EvaluationForm'

export default function EvaluationsManager() {
  const [userId, setUserId] = useState('')
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [editing, setEditing] = useState<Evaluation | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      setLoading(true)
      const user = await getCurrentUser()
      if (!user) return

      setUserId(user.id)
      const data = await getUserEvaluations(user.id)
      setEvaluations(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteEvaluation(id)
      await load()
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div style={wrapper}>
      <EvaluationForm
        userId={userId}
        initialData={editing}
        onSaved={() => {
          setEditing(null)
          load()
        }}
      />

      <div style={card}>
        <h3 style={titleStyle}>Tus evaluaciones</h3>

        {loading ? (
          <p style={textStyle}>Cargando...</p>
        ) : evaluations.length === 0 ? (
          <p style={textStyle}>Aún no tienes evaluaciones.</p>
        ) : (
          <div style={list}>
            {evaluations.map((e) => (
              <div key={e.id} style={item}>
                <div>
                  <div style={itemTitle}>
                    {e.type} {e.number ?? ''} · {e.topic || e.title || 'Sin tema'}
                  </div>
                  <div style={itemMeta}>
                    {e.subject} · {e.start_date} → {e.end_date}
                  </div>
                </div>

                <div style={actions}>
                  <button style={editButton} onClick={() => setEditing(e)}>
                    Editar
                  </button>
                  <button style={deleteButton} onClick={() => handleDelete(e.id)}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const wrapper = {
  display: 'grid',
  gap: '20px',
}

const card = {
  padding: '18px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
}

const titleStyle = {
  marginTop: 0,
  marginBottom: '14px',
  color: 'white',
}

const textStyle = {
  color: 'rgba(255,255,255,0.75)',
}

const list = {
  display: 'grid',
  gap: '10px',
}

const item = {
  padding: '14px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.04)',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'center',
}

const itemTitle = {
  color: 'white',
  fontWeight: 700,
}

const itemMeta = {
  color: 'rgba(255,255,255,0.7)',
  fontSize: '0.92rem',
  marginTop: '4px',
}

const actions = {
  display: 'flex',
  gap: '8px',
}

const editButton = {
  padding: '10px 12px',
  borderRadius: '10px',
  border: 'none',
  background: '#2563eb',
  color: 'white',
  cursor: 'pointer',
}

const deleteButton = {
  padding: '10px 12px',
  borderRadius: '10px',
  border: 'none',
  background: '#dc2626',
  color: 'white',
  cursor: 'pointer',
}