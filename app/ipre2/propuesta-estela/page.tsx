import Ipre2AccessGate from "../../components/ipre2/Ipre2AccessGate"
import Ipre2Proposal from "../../components/ipre2/Ipre2Proposal"

export const metadata = {
  title: "Propuesta Estela · Explora IPRE2",
}

export default function Page() {
  return (
    <Ipre2AccessGate>
      <Ipre2Proposal />
    </Ipre2AccessGate>
  )
}
