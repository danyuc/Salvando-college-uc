'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Evaluation, generateWeeklyCoach } from '@/lib/academic-engine'

export default function WeeklyCoachPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('evaluations')
        .select('*')
        .order('date', { ascending: true })

      setEvaluations((data || []) as Evaluation[])
    }

    load()
  }, [])

  const coach = generateWeeklyCoach(evaluations)

  return (
    <main style={main}>
      <section style={card}>
        <p style={pill}>Coach semanal automático</p>
        <h1>{coach.title}</h1>
        <p style={muted}>{coach.description}</p>
      </section>

      <section style={card}>
        <h2>Plan recomendado</h2>

        {coach.tasks.map((task, index) => (
          <div key={task} style={taskCard}>
            <strong>{index + 1}.</strong> {task}
          </div>
        ))}
      </section>
    </main>
  )
}

const main = {
  minHeight: '100vh',
  background: '#020617',
  color: 'white',
  padding: 24,
  fontFamily: 'Arial, sans-serif',
}

const card = {
  padding: 22,
  borderRadius: 22,
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,.12)',
  marginBottom: 18,
}

const taskCard = {
  padding: 16,
  borderRadius: 16,
  background: '#111827',
  marginTop: 12,
}

const pill = {
  color: '#93c5fd',
  fontWeight: 800,
}

const muted = {
  color: '#cbd5e1',
  lineHeight: 1.5,
}