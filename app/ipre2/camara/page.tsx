import Ipre2AccessGate from "../../components/ipre2/Ipre2AccessGate"
import Ipre2Camera from "../../components/ipre2/Ipre2Camera"

export const metadata = {
  title: "Cámara · Explora IPRE2",
}

export default function Page() {
  return (
    <Ipre2AccessGate>
      <Ipre2Camera />
    </Ipre2AccessGate>
  )
}
