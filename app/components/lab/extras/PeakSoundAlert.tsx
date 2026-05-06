'use client'

import { useEffect, useRef } from "react"

export default function PeakSoundAlert({ active }: { active: boolean }) {
  const played = useRef(false)

  useEffect(() => {
    if (!active) {
      played.current = false
      return
    }

    if (played.current) return
    played.current = true

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = "sine"
    osc.frequency.value = 880
    gain.gain.value = 0.04

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    setTimeout(() => {
      osc.stop()
      ctx.close()
    }, 450)
  }, [active])

  return null
}
