'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth'
import { getDiagnosticBySubject, upsertDiagnostic } from '../../lib/diagnostics'
import { createPracticeAttempts } from '../../lib/practice-attempts'

type Subject = {
  code: string
  name: string
}

const SUBJECTS: Subject[] = [
  { code: 'SOL500', name: 'Sociología' },
  { code: 'MAT1000', name: 'Matemática' },
  { code: 'PSI1101', name: 'Psicología' },
  { code: 'IHI0204', name: 'Taller de fuentes I' },
]

export default function DiagnosticView() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const subjectParam = searchParams.get('subject')
  const next = searchParams.get('next') || '/home'

  const [userId, setUserId] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState(subjectParam || '')
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser()

      if (!user) {
        router.replace('/login')
        return
      }

      setUserId(user.id)
    }

    load()
  }, [router])

  async function continueSubject(subject: string) {
    if (!userId) return

    setChecking(true)

    const existing = await getDiagnosticBySubject(userId, subject)

    if (existing?.completed) {
      router.push(next)
      return
    }

    router.push(`/diagnostico/examen?subject=${subject}&next=${next}`)
  }

  return (
    <main style={main}>
      <section style={card}>
        <p style={pill}>Diagnóstico obligatorio</p>

        <h1 style={title}>¿Qué asignatura quieres estudiar?</h1>

        <p style={warning}>
          TIENES QUE HACER EL DIAGNÓSTICO AHORA PARA CONTINUAR Y DARTE LA MEJOR EXPERIENCIA.
        </p>

        <div style={grid}>
          {SUBJECTS.map((subject) => (
            <button
              key={subject.code}
              style={
                selectedSubject === subject.code
                  ? selectedButton
                  : subjectButton
              }
              onClick={() => setSelectedSubject(subject.code)}
            >
              <strong>{subject.name}</strong>
              <span>{subject.code}</span>
            </button>
          ))}
        </div>

        <button
          style={primaryButton}
          disabled={!selectedSubject || checking}
          onClick={() => continueSubject(selectedSubject)}
        >
          {checking ? 'Revisando diagnóstico...' : 'Hacer diagnóstico ahora'}
        </button>
      </section>
    </main>
  )
}

const main: React.CSSProperties = {
  minHeight: '100vh',
  padding: 24,
  display: 'grid',
  placeItems: 'center',
  background: 'linear-gradient(180deg,#020617,#0f172a)',
  color: 'white',
}

const card: React.CSSProperties = {
  width: '100%',
  maxWidth: 780,
  padding: 28,
  borderRadius: 28,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
}

const pill: React.CSSProperties = {
  display: 'inline-block',
  padding: '7px 12px',
  borderRadius: 999,
  background: 'rgba(239,68,68,0.18)',
  color: '#fecaca',
  fontWeight: 900,
  textTransform: 'uppercase',
  fontSize: 12,
}

const title: React.CSSProperties = {
  fontSize: 34,
  fontWeight: 950,
}

const warning: React.CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: 'rgba(239,68,68,0.16)',
  border: '1px solid rgba(239,68,68,0.35)',
  color: '#fecaca',
  fontWeight: 900,
}

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 12,
  marginTop: 18,
}

const subjectButton: React.CSSProperties = {
  padding: 18,
  borderRadius: 18,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(15,23,42,0.9)',
  color: 'white',
  display: 'grid',
  gap: 5,
  textAlign: 'left',
  cursor: 'pointer',
}

const selectedButton: React.CSSProperties = {
  ...subjectButton,
  background: 'rgba(37,99,235,0.35)',
  border: '1px solid rgba(96,165,250,0.65)',
}

const primaryButton: React.CSSProperties = {
  marginTop: 20,
  width: '100%',
  padding: 16,
  borderRadius: 18,
  border: 'none',
  background: '#2563eb',
  color: 'white',
  fontWeight: 950,
  cursor: 'pointer',
}