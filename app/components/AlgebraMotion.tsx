'use client'

import { useEffect, useState } from "react"

type Term = {
  value: string
  side: "left" | "right"
  id: string
}

type Step = {
  terms: Term[]
  move?: {
    id: string
    to: "left" | "right"
    newValue?: string
  }
  description?: string
}

export default function AlgebraMotion({ steps }: { steps: Step[] }) {
  const [current, setCurrent] = useState(0)
  const [terms, setTerms] = useState(steps[0].terms)

  useEffect(() => {
    if (current >= steps.length) return

    const step = steps[current]

    if (step.move) {
      setTimeout(() => {
        setTerms(prev =>
          prev.map(t =>
            t.id === step.move!.id
              ? {
                  ...t,
                  side: step.move!.to,
                  value: step.move!.newValue || t.value,
                }
              : t
          )
        )
      }, 600)
    }

    const t = setTimeout(() => {
      setCurrent(current + 1)
    }, 1800)

    return () => clearTimeout(t)
  }, [current])

  return (
    <div style={{ fontSize: 28, fontWeight: 800 }}>
      <div style={{ display: "flex", justifyContent: "space-between", width: 300 }}>
        <div>
          {terms
            .filter(t => t.side === "left")
            .map(t => (
              <span key={t.id} style={{ marginRight: 6, transition: "all .6s" }}>
                {t.value}
              </span>
            ))}
        </div>

        <span>=</span>

        <div>
          {terms
            .filter(t => t.side === "right")
            .map(t => (
              <span key={t.id} style={{ marginLeft: 6, transition: "all .6s" }}>
                {t.value}
              </span>
            ))}
        </div>
      </div>

      <div style={{ marginTop: 10, color: "#60a5fa", fontSize: 14 }}>
        {steps[current]?.description}
      </div>
    </div>
  )
}
