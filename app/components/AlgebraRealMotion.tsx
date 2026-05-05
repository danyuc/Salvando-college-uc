'use client'

import { useState } from "react"

type Step = {
  left: string
  right: string
  move?: string
  resultLeft?: string
  resultRight?: string
  explanation: string
}

export default function AlgebraRealMotion({ steps }: { steps: Step[] }) {
  const [i, setI] = useState(0)

  const step = steps[i]

  return (
    <div className="real">
      <div className="equation">
        <span className="left">{step.left}</span>
        <span>=</span>
        <span className="right">{step.right}</span>
      </div>

      {step.move && (
        <div className="move">
          {step.move}
        </div>
      )}

      {(step.resultLeft || step.resultRight) && (
        <div className="result">
          <span>{step.resultLeft}</span>
          <span>=</span>
          <span>{step.resultRight}</span>
        </div>
      )}

      <p>{step.explanation}</p>

      <div className="controls">
        <button onClick={() => setI(v => Math.max(0, v-1))}>←</button>
        <button onClick={() => setI(v => Math.min(steps.length-1, v+1))}>→</button>
      </div>

      <style jsx>{`
        .real {
          padding: 20px;
          border-radius: 20px;
          background: rgba(15,23,42,.85);
          border: 1px solid rgba(255,255,255,.1);
        }

        .equation, .result {
          font-size: 42px;
          font-weight: 900;
          display: flex;
          gap: 12px;
          justify-content: center;
          animation: pop .6s ease;
        }

        .move {
          margin: 12px 0;
          text-align: center;
          font-weight: 900;
          color: #60a5fa;
          animation: move 0.6s ease;
        }

        p {
          text-align: center;
          color: #e2e8f0;
        }

        @keyframes pop {
          from { opacity:0; transform:scale(.9)}
          to { opacity:1; transform:scale(1)}
        }

        @keyframes move {
          from { opacity:0; transform:translateY(-10px)}
          to { opacity:1; transform:translateY(0)}
        }
      `}</style>
    </div>
  )
}
