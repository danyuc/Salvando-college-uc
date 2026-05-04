'use client'

type Point = {
  etiqueta: string
  x: number
  y: number
}

export default function PrecalculoVisual({
  puntos = [],
  activeStep = 0,
}: {
  puntos?: Point[]
  activeStep?: number
}) {
  if (!Array.isArray(puntos) || puntos.length < 2) return null

  const [a, b] = puntos
  const dx = b.x - a.x
  const dy = b.y - a.y

  const minX = Math.min(-6, a.x, b.x)
  const maxX = Math.max(6, a.x, b.x)
  const minY = Math.min(-6, a.y, b.y)
  const maxY = Math.max(6, a.y, b.y)

  function xToPct(x: number) {
    return ((x - minX) / (maxX - minX)) * 86 + 7
  }

  function yToPct(y: number) {
    return 93 - ((y - minY) / (maxY - minY)) * 86
  }

  const ax = xToPct(a.x)
  const ay = yToPct(a.y)
  const bx = xToPct(b.x)
  const by = yToPct(b.y)
  const cx = bx
  const cy = ay

  const showA = activeStep >= 0
  const showB = activeStep >= 1
  const showDx = activeStep >= 2
  const showDy = activeStep >= 3
  const showHyp = activeStep >= 4
  const showFormula = activeStep >= 5

  return (
    <section className="visual">
      <div className="top">
        <div>
          <p>Animación matemática</p>
          <h3>
            {activeStep <= 1 && "Ubicamos los puntos"}
            {activeStep === 2 && "Dibujamos el cambio horizontal Δx"}
            {activeStep === 3 && "Dibujamos el cambio vertical Δy"}
            {activeStep === 4 && "Construimos el triángulo"}
            {activeStep >= 5 && "Aplicamos Pitágoras"}
          </h3>
        </div>
        <span>{Math.min(activeStep + 1, 6)}/6</span>
      </div>

      <div className="plane">
        <div className="axis x" />
        <div className="axis y" />

        <svg className="svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          {showDx && (
            <line
              className="dxLine"
              x1={ax}
              y1={ay}
              x2={cx}
              y2={cy}
            />
          )}

          {showDy && (
            <line
              className="dyLine"
              x1={cx}
              y1={cy}
              x2={bx}
              y2={by}
            />
          )}

          {showHyp && (
            <line
              className="hypLine"
              x1={ax}
              y1={ay}
              x2={bx}
              y2={by}
            />
          )}
        </svg>

        {showA && (
          <div className="point a" style={{ left: `${ax}%`, top: `${ay}%` }}>
            <b>A</b>
            <small>({a.x}, {a.y})</small>
          </div>
        )}

        {showB && (
          <div className="point b" style={{ left: `${bx}%`, top: `${by}%` }}>
            <b>B</b>
            <small>({b.x}, {b.y})</small>
          </div>
        )}

        {showDx && (
          <div
            className="label dxLabel"
            style={{
              left: `${(ax + cx) / 2}%`,
              top: `${ay}%`,
            }}
          >
            Δx = {b.x} - ({a.x}) = {dx}
          </div>
        )}

        {showDy && (
          <div
            className="label dyLabel"
            style={{
              left: `${cx}%`,
              top: `${(cy + by) / 2}%`,
            }}
          >
            Δy = {b.y} - ({a.y}) = {dy}
          </div>
        )}

        {showHyp && (
          <div
            className="label hypLabel"
            style={{
              left: `${(ax + bx) / 2}%`,
              top: `${(ay + by) / 2}%`,
            }}
          >
            distancia
          </div>
        )}
      </div>

      {showFormula && (
        <div className="formula">
          <span>d = √(Δx² + Δy²)</span>
          <span>d = √(({dx})² + ({dy})²)</span>
          <strong>d = √{dx * dx + dy * dy}</strong>
        </div>
      )}

      <style jsx>{`
        .visual {
          margin-top: 18px;
          padding: 18px;
          border-radius: 28px;
          background:
            radial-gradient(circle at 0% 0%, rgba(56,189,248,.20), transparent 32%),
            radial-gradient(circle at 100% 0%, rgba(168,85,247,.16), transparent 34%),
            rgba(15,23,42,.84);
          border: 1px solid rgba(147,197,253,.24);
          box-shadow: 0 26px 80px rgba(0,0,0,.34);
        }

        .top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-bottom: 14px;
        }

        .top p {
          margin: 0;
          color: #93c5fd;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: .09em;
          text-transform: uppercase;
        }

        .top h3 {
          margin: 4px 0 0;
          font-size: 21px;
          letter-spacing: -.035em;
        }

        .top span {
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(59,130,246,.18);
          color: #bfdbfe;
          font-weight: 950;
        }

        .plane {
          position: relative;
          height: 360px;
          overflow: hidden;
          border-radius: 24px;
          background:
            linear-gradient(rgba(148,163,184,.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,.12) 1px, transparent 1px),
            radial-gradient(circle at center, rgba(59,130,246,.13), transparent 60%);
          background-size: 28px 28px, 28px 28px, 100% 100%;
          border: 1px solid rgba(255,255,255,.12);
        }

        .axis {
          position: absolute;
          background: rgba(248,250,252,.72);
          z-index: 2;
        }

        .axis.x {
          left: 5%;
          right: 5%;
          top: 50%;
          height: 2px;
        }

        .axis.y {
          top: 5%;
          bottom: 5%;
          left: 50%;
          width: 2px;
        }

        .svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 4;
          pointer-events: none;
        }

        .dxLine,
        .dyLine,
        .hypLine {
          vector-effect: non-scaling-stroke;
          stroke-linecap: round;
          stroke-dasharray: 120;
          stroke-dashoffset: 120;
          animation: drawLine .9s cubic-bezier(.2,.9,.2,1) forwards;
        }

        .dxLine {
          stroke: #22c55e;
          stroke-width: 5;
          filter: drop-shadow(0 0 12px rgba(34,197,94,.9));
        }

        .dyLine {
          stroke: #f59e0b;
          stroke-width: 5;
          filter: drop-shadow(0 0 12px rgba(245,158,11,.9));
        }

        .hypLine {
          stroke: #818cf8;
          stroke-width: 6;
          filter: drop-shadow(0 0 14px rgba(129,140,248,.95));
        }

        .point {
          position: absolute;
          z-index: 8;
          width: 26px;
          height: 26px;
          border-radius: 999px;
          transform: translate(-50%, -50%);
          display: grid;
          place-items: center;
          font-weight: 950;
          animation: popPoint .52s cubic-bezier(.2,1.4,.3,1) both;
        }

        .point.a {
          background: #38bdf8;
          box-shadow: 0 0 28px rgba(56,189,248,.95);
        }

        .point.b {
          background: #22c55e;
          box-shadow: 0 0 28px rgba(34,197,94,.95);
        }

        .point small {
          position: absolute;
          left: 32px;
          top: -10px;
          white-space: nowrap;
          color: white;
          font-size: 12px;
          font-weight: 950;
          text-shadow: 0 2px 10px rgba(0,0,0,.95);
        }

        .label {
          position: absolute;
          z-index: 9;
          transform: translate(-50%, -50%);
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 950;
          white-space: nowrap;
          animation: labelIn .42s ease both;
          border: 1px solid rgba(255,255,255,.18);
          backdrop-filter: blur(10px);
        }

        .dxLabel {
          color: #bbf7d0;
          background: rgba(34,197,94,.18);
        }

        .dyLabel {
          color: #fde68a;
          background: rgba(245,158,11,.18);
        }

        .hypLabel {
          color: #ddd6fe;
          background: rgba(129,140,248,.18);
        }

        .formula {
          margin-top: 14px;
          padding: 16px;
          border-radius: 22px;
          background: rgba(2,6,23,.62);
          border: 1px solid rgba(255,255,255,.12);
          display: grid;
          gap: 8px;
          text-align: center;
          animation: formulaIn .48s ease both;
        }

        .formula span {
          color: #cbd5e1;
          font-weight: 900;
          font-size: 18px;
        }

        .formula strong {
          color: #fef3c7;
          font-size: 26px;
          letter-spacing: -.03em;
        }

        @keyframes drawLine {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes popPoint {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(.25);
          }
          65% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.25);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes labelIn {
          from {
            opacity: 0;
            transform: translate(-50%, -35%) scale(.92);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes formulaIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </section>
  )
}
