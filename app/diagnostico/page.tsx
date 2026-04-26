import { Suspense } from 'react'
import DiagnosticView from '../components/DiagnosticView'

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Cargando diagnóstico...</div>}>
      <DiagnosticView />
    </Suspense>
  )
}