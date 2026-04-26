import { Suspense } from 'react'
import PracticeView from '../components/PracticeView'

export default function PracticaPage() {
  return (
    <Suspense fallback={<PracticeLoading />}>
      <PracticeView />
    </Suspense>
  )
}

function PracticeLoading() {
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: 24,
        color: 'white',
        background:
          'linear-gradient(180deg, #020617 0%, #0f172a 100%)',
      }}
    >
      <section
        style={{
          padding: 24,
          borderRadius: 24,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        Cargando práctica inteligente...
      </section>
    </main>
  )
}