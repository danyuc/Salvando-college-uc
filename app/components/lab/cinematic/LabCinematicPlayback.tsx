'use client'

import { useEffect } from "react"
import { ROUTE_POINTS } from "../data/metroRoute"

export default function LabCinematicPlayback({
  index,
  setIndex,
  playing,
}: {
  index: number
  setIndex: (v: number) => void
  playing: boolean
}) {
  useEffect(() => {
    if (!playing) return

    const interval = setInterval(() => {
      const next = index >= ROUTE_POINTS.length - 1 ? 0 : index + 1
      setIndex(next)
    }, 3500)

    return () => clearInterval(interval)
  }, [playing, index, setIndex])

  return null
}
