import Ipre2AccessGate from "../../components/ipre2/Ipre2AccessGate"
import Ipre2Ranking from "../../components/ipre2/Ipre2Ranking"

export const metadata = {
  title: "Ranking · Explora IPRE2",
}

export default function Page() {
  return (
    <Ipre2AccessGate>
      <Ipre2Ranking />
    </Ipre2AccessGate>
  )
}
