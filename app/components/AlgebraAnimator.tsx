'use client'

import { useEffect, useState } from "react"

type Step = {
  left: string
  right: string
  action?: string
}

export default function AlgebraAnimator({ steps }: { steps: Step[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (index < steps.length - 1) {
      const t = setTimeout(() => setIndex(index + 1), 1800)
      return () => clearTimeout(t)
    }
  }, [index])

  const current = steps[index]

  return (
    <div style={{ fontSize: 28, fontWeight: 800 }}>
      <div style={{ display: "flex", gap: 10 }}>
        <span>{current.left}</span>
        <span>=</span>
        <span>{current.right}</span>
      </div>

      {current.action && (
        <div style={{ marginTop: 10, color: "#60a5fa", fontSize: 14 }}>
          {current.action}
        </div>
      )}
    </div>
  )
}
