'use client'

import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import { getUserEvaluations } from '../../lib/evaluations'
import { buildSmartStudyPlan } from '../../lib/smart-scheduler'

export default function SmartPlanView() {
  const [evaluations, setEvaluations] = useState([])
  const [weeklyHours, setWeeklyHours] = useState(35)

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser()
      if (!user) return

      const data = await getUserEvaluations(user.id)
      setEvaluations(data)
    }
    load()
  }, [])

  const plan = useMemo(
    () => buildSmartStudyPlan(evaluations, weeklyHours),
    [evaluations, weeklyHours]
  )

  return (
    <div style={container}>
      <h2>🧠 Plan inteligente semanal</h2>

      <div style={card}>
        Horas disponibles:
        <input
          type="number"
          value={weeklyHours}
          onChange={(e) => setWeeklyHours(Number(e.target.value))}
        />
      </div>

      {plan.map((p) => (
        <div key={p.subject} style={card}>
          <strong>{p.subject}</strong>
          <div>Horas asignadas: {p.hours}h</div>
          <div>{p.reason}</div>
        </div>
      ))}
    </div>
  )
}

const container = { padding: 20, color: 'white' }
const card = {
  padding: 12,
  borderRadius: 10,
  background: 'rgba(255,255,255,0.05)',
  marginBottom: 10,
}