import Ipre2AccessGate from "../../components/ipre2/Ipre2AccessGate"
import Ipre2Session from "../../components/ipre2/Ipre2Session"

export const metadata = {
  title: "Sesión con estudiantes · Explora IPRE2",
}

export default function Page() {
  return (
    <Ipre2AccessGate>
      <Ipre2Session />
    </Ipre2AccessGate>
  )
}
