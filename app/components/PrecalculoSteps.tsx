'use client'

export default function PrecalculoSteps({ pasos = [], animaciones = [] }: any) {
  if (!Array.isArray(pasos) || pasos.length === 0) return null

  return (
    <section style={{
      marginTop: 16,
      padding: 16,
      borderRadius: 18,
      border: '1px solid rgba(255,255,255,0.12)',
      background: 'rgba(255,255,255,0.06)'
    }}>
      <h3 style={{ margin: 0, marginBottom: 12 }}>Resolución guiada paso a paso</h3>

      {pasos.map((paso: any) => {
        const animacion = animaciones.find((a: any) => a.paso === paso.orden)

        return (
          <article key={paso.orden} style={{
            marginBottom: 12,
            padding: 14,
            borderRadius: 14,
            background: 'rgba(99,102,241,0.10)',
            border: '1px solid rgba(99,102,241,0.22)'
          }}>
            <strong>Paso {paso.orden}: {paso.titulo}</strong>
            <p style={{ margin: '8px 0' }}>{paso.explicacion}</p>
            <code>{paso.expresion}</code>

            {animacion && (
              <p style={{ marginTop: 8, opacity: 0.8 }}>
                Animación: {animacion.tipo} · {animacion.descripcion}
              </p>
            )}
          </article>
        )
      })}
    </section>
  )
}
