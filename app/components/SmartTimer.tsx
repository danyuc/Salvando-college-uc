'use client'

import { useEffect, useState } from "react"

export default function SmartTimer({ total }: { total: number }) {
  const [time, setTime] = useState(total)
  const [alert, setAlert] = useState(false)

  useEffect(() => {
    const i = setInterval(() => {
      setTime(t => {
        if (t < total * 0.2) setAlert(true)
        return t > 0 ? t - 1 : 0
      })
    }, 1000)

    return () => clearInterval(i)
  }, [])

  const m = Math.floor(time / 60)
  const s = time % 60

  return (
    <div style={{
      padding: 12,
      borderRadius: 12,
      background: alert ? "#7f1d1d" : "#020617",
      fontWeight: 900
    }}>
      ⏱ {m}:{s.toString().padStart(2,"0")}
      {alert && <div>⚠ Te estás quedando sin tiempo</div>}
    </div>
  )
}
