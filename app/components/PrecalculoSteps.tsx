'use client'

import { useState } from 'react'

export default function PrecalculoSteps({ pasos = [], animaciones = [] }: any) {
  const [open, setOpen] = useState(false)

  if (!Array.isArray(pasos) || pasos.length === 0) return null

  return (
    <section style={{
      marginTop: 16,
      padding: 16,
      borderRadius: 18,
      border: '1px solid rgba(255,255,255,0.12)',
      background: 'rgba(255,255,255,0.06)'
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          padding: 14,
          borderRadius: 14,
          border: '1px solid rgba(99,102,241,.35)',
          background: 'rgba(99,102,241,.18)',
          color: 'white',
          fontWeight: 900,
          cursor: 'pointer'
        }}
      >
        {open ? 'Ocultar paso a paso' : '¿Quieres ver el paso a paso?'}
      </button>

      {open && (
        <div style={{ marginTop: 14 }}>
          <p style={{ color: '#cbd5e1' }}>
            Revisa cada transformación lentamente. La idea no es memorizar la respuesta, sino entender por qué cada paso es válido.
          </p>

          {pasos.map((paso: any) => {
            const animacion = animaciones.find((a: any) => a.paso === paso.orden)

            return (
              <article key={paso.orden} style={{
                marginBottom: 12,
                padding: 14,
                borderRadius: 14,
                background: 'rgba(15,23,42,0.72)',
                border: '1px solid rgba(148,163,184,0.18)'
              }}>
                <strong>Paso {paso.orden}: {paso.titulo}</strong>
                <p style={{ margin: '8px 0', color: '#e2e8f0' }}>{paso.explicacion}</p>
                <code style={{
                  display: 'block',
                  padding: 10,
                  borderRadius: 10,
                  background: 'rgba(0,0,0,.22)',
                  color: '#bfdbfe'
                }}>
                  {paso.expresion}
                </code>

                {animacion && (
                  <p style={{ marginTop: 8, color: '#93c5fd' }}>
                    Animación sugerida: {animacion.tipo} · {animacion.descripcion}
                  </p>
                )}
              </article>
            )
          })}

          <p style={{ marginTop: 12, color: '#bbf7d0', fontWeight: 800 }}>
            Cuando entiendas el procedimiento, continúa con la siguiente pregunta.
          </p>
        </div>
      )}
    </section>
  )
}
