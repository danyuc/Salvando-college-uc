import Ipre2AccessGate from "../../components/ipre2/Ipre2AccessGate"
import Ipre2MaterialDocente from "../../components/ipre2/Ipre2MaterialDocente"

export const metadata = {
  title: "Material docente · Explora IPRE2",
}

export default function Page() {
  return (
    <Ipre2AccessGate>
      <Ipre2MaterialDocente />
    </Ipre2AccessGate>
  )
}
