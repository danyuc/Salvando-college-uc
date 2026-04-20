'use client'

import { useEffect, useState } from 'react'
import { getUserEvaluations, deleteEvaluation } from '../../lib/evaluations'
import EvaluationForm from './EvaluationForm'
import { getCurrentUser } from '../../lib/auth'

export default function EvaluationsView() {
  const [userId, setUserId] = useState('')
  const [evaluations, setEvaluations] = useState([])
  const [editing, setEditing] = useState<any>(null)

  async function load() {
    const user = await getCurrentUser()
    if (!user) return

    setUserId(user.id)
    const data = await getUserEvaluations(user.id)
    setEvaluations(data)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div style={{ display: 'grid', gap: '20px' }}>

      <EvaluationForm
        userId={userId}
        existing={editing}
        onSaved={() => {
          setEditing(null)
          load()
        }}
      />

      {evaluations.map((e: any) => (
        <div key={e.id} style={card}>
          <h3>
            {e.type} {e.number || ''} · {e.topic}
          </h3>

          <p>{e.subject}</p>
          <p>{e.start_date} → {e.end_date}</p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setEditing(e)}>Editar</button>
            <button onClick={() => deleteEvaluation(e.id).then(load)}>
              Eliminar
            </button>
          </div>
        </div>
      ))}

    </div>
  )
}

const card = {
  padding: '15px',
  background: '#1e293b',
  borderRadius: '10px'
}