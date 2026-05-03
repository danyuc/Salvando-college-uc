'use client'

import Link from 'next/link'

const cards = [
  {
    title: 'Precálculo Pro',
    text: 'Modo interrogación UC con visualización, pasos y práctica adaptativa.',
    href: '/precalculo-pro',
    icon: '📐',
  },
  {
    title: 'Práctica inteligente',
    text: 'Entrena por ramo, dificultad, modo guiado, diagnóstico o ronda corta.',
    href: '/practica',
    icon: '🧠',
  },
  {
    title: 'Notas y ponderaciones',
    text: 'Registra notas, ponderaciones y revisa tu promedio proyectado.',
    href: '/notas',
    icon: '📊',
  },
  {
    title: 'Diagnóstico',
    text: 'Detecta debilidades y libera rutas de práctica recomendadas.',
    href: '/diagnostico',
    icon: '🔍',
  },
]

export default function ModoProPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: 24,
        color: 'white',
        background:
          'radial-gradient(circle at top left, rgba(59,130,246,.28), transparent 32%), linear-gradient(180deg, #020617 0%, #0f172a 100%)',
      }}
    >
      <section style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div
          style={{
            padding: 28,
            borderRadius: 30,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.14)',
            boxShadow: '0 28px 80px rgba(0,0,0,.35)',
          }}
        >
          <p style={{ margin: 0, color: '#93c5fd', fontWeight: 900 }}>
            Salvando College UC
          </p>

          <h1 style={{ margin: '10px 0 0', fontSize: 42, lineHeight: 1.05 }}>
            Modo Pro académico
          </h1>

          <p style={{ maxWidth: 720, color: '#cbd5e1', lineHeight: 1.7 }}>
            Acceso rápido a práctica adaptativa, diagnóstico, notas ponderadas y
            Precálculo MAT1000 con experiencia visual premium.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 18,
            marginTop: 22,
          }}
        >
          {cards.map(card => (
            <Link
              key={card.href}
              href={card.href}
              style={{
                textDecoration: 'none',
                color: 'white',
                padding: 22,
                borderRadius: 24,
                background: 'rgba(255,255,255,0.075)',
                border: '1px solid rgba(255,255,255,0.14)',
                boxShadow: '0 18px 50px rgba(0,0,0,.22)',
                minHeight: 190,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 34 }}>{card.icon}</div>
                <h2 style={{ margin: '14px 0 8px' }}>{card.title}</h2>
                <p style={{ color: '#cbd5e1', lineHeight: 1.55 }}>
                  {card.text}
                </p>
              </div>

              <strong style={{ color: '#93c5fd' }}>Entrar →</strong>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
