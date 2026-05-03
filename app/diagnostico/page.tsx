import { Suspense } from "react"
import DiagnosticoClient from "./DiagnosticoClient"

export default function DiagnosticoPage() {
  return (
    <Suspense fallback={<main style={{ padding: 24, color: "white" }}>Cargando diagnóstico...</main>}>
      <DiagnosticoClient />
    </Suspense>
  )
}
