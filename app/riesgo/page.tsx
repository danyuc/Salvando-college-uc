'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Evaluation, getRiskLevel, getPriorityText } from '@/lib/academic-engine'

export default function RiskPage() {
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

  const stats = useMemo(() => {
    return {
      alto: evaluations.filter((e) => getRiskLevel(e) === 'alto').length,
      medio: evaluations.filter((e) => getRiskLevel(e) === 'medio').length,
      bajo: evaluations.filter((e) => getRiskLevel(e) === 'bajo').length,
    }
  }, [evaluations])

  return (
    <main style={main}>
      <section style={card}>
        <h1>⚠️ Riesgo académico</h1>
        <p style={muted}>
          Detecta urgencia según fecha, ponderación y proximidad de evaluaciones.
        </p>

        <div style={grid}>
          <div style={box}>Alto: {stats.alto}</div>
          <div style={box}>Medio: {stats.medio}</div>
          <div style={box}>Bajo: {stats.bajo}</div>
        </div>
      </section>

      {evaluations.map((e) => (
        <section key={e.id || e.title} style={card}>
          <h2>{e.subject} · {e.title}</h2>
          <p>{e.date} · {(Number(e.weight) * 100).toFixed(0)}%</p>
          <p>Riesgo: <strong>{getRiskLevel(e)}</strong></p>
          <p style={muted}>{getPriorityText(e)}</p>
        </section>
      ))}
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

const muted = {
  color: '#cbd5e1',
}

const grid = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap' as const,
}

const box = {
  padding: 16,
  borderRadius: 16,
  background: '#111827',
}