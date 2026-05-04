'use client'

import { useEffect, useRef } from 'react'
import functionPlot from 'function-plot'

type Props = {
  expression: string
}

export default function MathGraph({ expression }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) return

    try {
      functionPlot({
        target: ref.current,
        width: 400,
        height: 300,
        grid: true,
        data: [
          {
            fn: expression,
          },
        ],
      })
    } catch (e) {
      console.error('Error graficando:', e)
    }
  }, [expression])

  return <div ref={ref} />
}
