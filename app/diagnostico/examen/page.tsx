import { Suspense } from 'react'
import DiagnosticExamView from '../../components/DiagnosticExamView'

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Cargando examen...</div>}>
      <DiagnosticExamView />
    </Suspense>
  )
}