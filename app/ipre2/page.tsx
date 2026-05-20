import Ipre2AccessGate from "../components/ipre2/Ipre2AccessGate"
import Ipre2Home from "../components/ipre2/Ipre2Home"

export const metadata = {
  title: "Explora IPRE2 · Salvando College UC",
  description: "Cápsulas, sesiones con estudiantes, puntaje por curso y aprendizaje basado en datos reales.",
}

export default function Page() {
  return (
    <Ipre2AccessGate>
      <Ipre2Home />
    </Ipre2AccessGate>
  )
}
