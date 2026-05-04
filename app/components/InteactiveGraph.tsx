'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

type Point = {
  x: number
  y: number
}

type ValidationResult = {
  isClose: boolean
  score: number
  message: string
}

type Props = {
  width?: number
  height?: number
  xMin?: number
  xMax?: number
  yMin?: number
  yMax?: number

  /**
   * Si quieres mostrar la curva correcta.
   * Ej: "x^2 - 4", "2*x+1", "abs(x)", "sqrt(x)"
   */
  targetExpression?: string

  /**
   * Si quieres validar puntos esperados exactos.
   */
  expectedPoints?: Point[]

  /**
   * Mostrar o no la curva correcta.
   */
  showReferenceCurve?: boolean

  /**
   * Permite dibujar a mano alzada además de puntos.
   */
  enableFreeDraw?: boolean

  /**
   * Callback cuando cambia la validación.
   */
  onValidate?: (result: ValidationResult) => void
}

type DrawPoint = {
  x: number
  y: number
}

const DEFAULT_WIDTH = 520
const DEFAULT_HEIGHT = 360

export default function InteractiveGraph({
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  xMin = -10,
  xMax = 10,
  yMin = -10,
  yMax = 10,
  targetExpression,
  expectedPoints = [],
  showReferenceCurve = false,
  enableFreeDraw = true,
  onValidate,
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null)

  const [points, setPoints] = useState<Point[]>([])
  const [freehandPaths, setFreehandPaths] = useState<DrawPoint[][]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [activePath, setActivePath] = useState<DrawPoint[]>([])
  const [mode, setMode] = useState<'points' | 'draw'>('points')
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)

  const xRange = xMax - xMin
  const yRange = yMax - yMin

  function toSvgX(x: number) {
    return ((x - xMin) / xRange) * width
  }

  function toSvgY(y: number) {
    return height - ((y - yMin) / yRange) * height
  }

  function fromSvgCoords(clientX: number, clientY: number) {
    if (!svgRef.current) {
      return { x: 0, y: 0 }
    }

    const rect = svgRef.current.getBoundingClientRect()
    const px = clientX - rect.left
    const py = clientY - rect.top

    const x = xMin + (px / width) * xRange
    const y = yMin + ((height - py) / height) * yRange

    return {
      x: round2(x),
      y: round2(y),
    }
  }

  function round2(value: number) {
    return Math.round(value * 100) / 100
  }

  function buildGridLines() {
    const lines: React.ReactNode[] = []

    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += 1) {
      lines.push(
        <line
          key={`vx-${x}`}
          x1={toSvgX(x)}
          y1={0}
          x2={toSvgX(x)}
          y2={height}
          stroke={x === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.08)'}
          strokeWidth={x === 0 ? 1.5 : 1}
        />
      )
    }

    for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y += 1) {
      lines.push(
        <line
          key={`hy-${y}`}
          x1={0}
          y1={toSvgY(y)}
          x2={width}
          y2={toSvgY(y)}
          stroke={y === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.08)'}
          strokeWidth={y === 0 ? 1.5 : 1}
        />
      )
    }

    return lines
  }

  const referenceCurvePath = useMemo(() => {
    if (!targetExpression) return ''

    const samples: string[] = []
    const steps = 180

    for (let i = 0; i <= steps; i += 1) {
      const x = xMin + (i / steps) * xRange
      const y = evaluateExpression(targetExpression, x)

      if (typeof y !== 'number' || !Number.isFinite(y)) continue
      if (y < yMin - 100 || y > yMax + 100) continue

      const sx = toSvgX(x)
      const sy = toSvgY(y)

      samples.push(`${samples.length === 0 ? 'M' : 'L'} ${sx} ${sy}`)
    }

    return samples.join(' ')
  }, [targetExpression, xMin, xMax, xRange, yMin, yMax, width, height])

  const userPolylinePath = useMemo(() => {
    if (points.length < 2) return ''
    const sorted = [...points].sort((a, b) => a.x - b.x)
    return sorted
      .map((point, index) => {
        const sx = toSvgX(point.x)
        const sy = toSvgY(point.y)
        return `${index === 0 ? 'M' : 'L'} ${sx} ${sy}`
      })
      .join(' ')
  }, [points, width, height, xMin, yMin, xRange, yRange])

  const activeFreehandPath = useMemo(() => {
    if (activePath.length < 2) return ''
    return activePath
      .map((point, index) => {
        const sx = toSvgX(point.x)
        const sy = toSvgY(point.y)
        return `${index === 0 ? 'M' : 'L'} ${sx} ${sy}`
      })
      .join(' ')
  }, [activePath, width, height, xMin, yMin, xRange, yRange])

  const savedFreehandPaths = useMemo(() => {
    return freehandPaths.map((path) =>
      path
        .map((point, index) => {
          const sx = toSvgX(point.x)
          const sy = toSvgY(point.y)
          return `${index === 0 ? 'M' : 'L'} ${sx} ${sy}`
        })
        .join(' ')
    )
  }, [freehandPaths, width, height, xMin, yMin, xRange, yRange])

  useEffect(() => {
    const result = validateGraph({
      points,
      expectedPoints,
      targetExpression,
      xMin,
      xMax,
    })

    setValidation(result)
    onValidate?.(result)
  }, [points, expectedPoints, targetExpression, xMin, xMax, onValidate])

  function handleSvgClick(event: React.MouseEvent<SVGSVGElement>) {
    if (mode !== 'points') return
    if (selectedPointIndex !== null) return

    const point = fromSvgCoords(event.clientX, event.clientY)
    setPoints((prev) => [...prev, point])
  }

  function handlePointerDown(event: React.PointerEvent<SVGSVGElement>) {
    if (!enableFreeDraw) return
    if (mode !== 'draw') return

    const point = fromSvgCoords(event.clientX, event.clientY)
    setIsDrawing(true)
    setActivePath([point])
  }

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (!enableFreeDraw) return
    if (!isDrawing || mode !== 'draw') return

    const point = fromSvgCoords(event.clientX, event.clientY)
    setActivePath((prev) => [...prev, point])
  }

  function handlePointerUp() {
    if (!enableFreeDraw) return
    if (!isDrawing || mode !== 'draw') return

    setIsDrawing(false)

    if (activePath.length >= 2) {
      setFreehandPaths((prev) => [...prev, activePath])
    }

    setActivePath([])
  }

  function handlePointMouseDown(index: number) {
    setSelectedPointIndex(index)
  }

  function handleGlobalMouseMove(event: MouseEvent) {
    if (selectedPointIndex === null) return
    const point = fromSvgCoords(event.clientX, event.clientY)

    setPoints((prev) =>
      prev.map((item, index) => (index === selectedPointIndex ? point : item))
    )
  }

  function handleGlobalMouseUp() {
    if (selectedPointIndex !== null) {
      setSelectedPointIndex(null)
    }
  }

  useEffect(() => {
    window.addEventListener('mousemove', handleGlobalMouseMove)
    window.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  })

  function clearAll() {
    setPoints([])
    setFreehandPaths([])
    setActivePath([])
    setSelectedPointIndex(null)
  }

  function undoLastPoint() {
    setPoints((prev) => prev.slice(0, -1))
  }

  function undoLastStroke() {
    setFreehandPaths((prev) => prev.slice(0, -1))
  }

  return (
    <div style={container}>
      <div style={toolbar}>
        <button
          type="button"
          onClick={() => setMode('points')}
          style={mode === 'points' ? activeButton : button}
        >
          Puntos
        </button>

        <button
          type="button"
          onClick={() => setMode('draw')}
          style={mode === 'draw' ? activeButton : button}
          disabled={!enableFreeDraw}
        >
          Dibujo libre
        </button>

        <button type="button" onClick={undoLastPoint} style={button}>
          Deshacer punto
        </button>

        <button type="button" onClick={undoLastStroke} style={button}>
          Deshacer trazo
        </button>

        <button type="button" onClick={clearAll} style={button}>
          Limpiar
        </button>
      </div>

      <div style={graphWrapper}>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          onClick={handleSvgClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={svgStyle}
        >
          {buildGridLines()}

          {showReferenceCurve && referenceCurvePath && (
            <path
              d={referenceCurvePath}
              fill="none"
              stroke="rgba(59,130,246,0.9)"
              strokeWidth={2}
            />
          )}

          {userPolylinePath && (
            <path
              d={userPolylinePath}
              fill="none"
              stroke="rgba(234,88,12,0.95)"
              strokeWidth={2.5}
            />
          )}

          {savedFreehandPaths.map((path, index) => (
            <path
              key={`free-${index}`}
              d={path}
              fill="none"
              stroke="rgba(168,85,247,0.95)"
              strokeWidth={2}
            />
          ))}

          {activeFreehandPath && (
            <path
              d={activeFreehandPath}
              fill="none"
              stroke="rgba(168,85,247,0.7)"
              strokeWidth={2}
            />
          )}

          {points.map((point, index) => (
            <circle
              key={`${point.x}-${point.y}-${index}`}
              cx={toSvgX(point.x)}
              cy={toSvgY(point.y)}
              r={5}
              fill="rgba(239,68,68,1)"
              stroke="white"
              strokeWidth={1}
              onMouseDown={() => handlePointMouseDown(index)}
              style={{ cursor: 'grab' }}
            />
          ))}
        </svg>
      </div>

      <div style={bottomGrid}>
        <div style={panel}>
          <div style={panelTitle}>Puntos</div>

          {points.length === 0 ? (
            <div style={muted}>Aún no has agregado puntos.</div>
          ) : (
            <div style={pointList}>
              {points.map((point, index) => (
                <div key={`point-${index}`} style={pointRow}>
                  P{index + 1}: ({point.x.toFixed(2)}, {point.y.toFixed(2)})
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={panel}>
          <div style={panelTitle}>Validación automática</div>

          {!validation ? (
            <div style={muted}>Sin validación todavía.</div>
          ) : (
            <>
              <div style={validationScore}>
                Puntaje: {Math.round(validation.score)}%
              </div>
              <div
                style={{
                  ...validationBadge,
                  background: validation.isClose
                    ? 'rgba(16,185,129,0.18)'
                    : 'rgba(245,158,11,0.18)',
                }}
              >
                {validation.isClose ? 'Muy cercano' : 'Debe corregirse'}
              </div>
              <div style={validationMessage}>{validation.message}</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function validateGraph(params: {
  points: Point[]
  expectedPoints: Point[]
  targetExpression?: string
  xMin: number
  xMax: number
}): ValidationResult {
  const { points, expectedPoints, targetExpression, xMin, xMax } = params

  if (points.length === 0) {
    return {
      isClose: false,
      score: 0,
      message: 'Agrega puntos o dibuja la curva para validar tu gráfico.',
    }
  }

  if (expectedPoints.length > 0) {
    let matched = 0

    for (const expected of expectedPoints) {
      const found = points.some(
        (point) =>
          Math.abs(point.x - expected.x) <= 0.6 &&
          Math.abs(point.y - expected.y) <= 0.6
      )

      if (found) matched += 1
    }

    const score = (matched / expectedPoints.length) * 100

    return {
      isClose: score >= 75,
      score,
      message:
        score >= 75
          ? 'Tus puntos están bastante cerca de los valores esperados.'
          : 'Faltan puntos clave o algunos están mal ubicados.',
    }
  }

  if (targetExpression) {
    const sampleXs = buildSampleXs(xMin, xMax, 8)

    let totalError = 0
    let validSamples = 0

    for (const x of sampleXs) {
      const expectedY = evaluateExpression(targetExpression, x)
      if (!Number.isFinite(expectedY)) continue

      const nearestPoint = getNearestPointByX(points, x)
      if (!nearestPoint) continue

      totalError += Math.abs(nearestPoint.y - expectedY)
      validSamples += 1
    }

    if (validSamples === 0) {
      return {
        isClose: false,
        score: 0,
        message: 'No hay suficientes puntos comparables para validar.',
      }
    }

    const avgError = totalError / validSamples
    const score = Math.max(0, 100 - avgError * 18)

    return {
      isClose: score >= 70,
      score,
      message:
        score >= 70
          ? 'El gráfico se aproxima bien a la función esperada.'
          : 'El gráfico todavía se desvía bastante de la función esperada.',
    }
  }

  return {
    isClose: points.length >= 3,
    score: points.length >= 3 ? 70 : 30,
    message:
      points.length >= 3
        ? 'Tienes una base razonable de puntos para construir el gráfico.'
        : 'Agrega más puntos para representar mejor la curva.',
  }
}

function buildSampleXs(min: number, max: number, count: number) {
  const result: number[] = []

  for (let i = 0; i < count; i += 1) {
    const x = min + (i / (count - 1)) * (max - min)
    result.push(x)
  }

  return result
}

function getNearestPointByX(points: Point[], targetX: number) {
  if (!points.length) return null

  let nearest = points[0]
  let nearestDistance = Math.abs(points[0].x - targetX)

  for (const point of points) {
    const distance = Math.abs(point.x - targetX)
    if (distance < nearestDistance) {
      nearest = point
      nearestDistance = distance
    }
  }

  return nearest
}

function evaluateExpression(expression: string, x: number) {
  try {
    const normalized = expression
      .replace(/\^/g, '**')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/pi/g, 'Math.PI')
      .replace(/\be\b/g, 'Math.E')

    const fn = new Function('x', `return ${normalized}`)
    const y = fn(x)

    return typeof y === 'number' ? y : NaN
  } catch {
    return NaN
  }
}

const container: React.CSSProperties = {
  display: 'grid',
  gap: '14px',
}

const toolbar: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
}

const button: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  cursor: 'pointer',
}

const activeButton: React.CSSProperties = {
  ...button,
  background: '#2563eb',
}

const graphWrapper: React.CSSProperties = {
  overflowX: 'auto',
}

const svgStyle: React.CSSProperties = {
  background: '#0f172a',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,0.12)',
  touchAction: 'none',
}

const bottomGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
}

const panel: React.CSSProperties = {
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.05)',
}

const panelTitle: React.CSSProperties = {
  fontWeight: 800,
  marginBottom: '8px',
}

const pointList: React.CSSProperties = {
  display: 'grid',
  gap: '6px',
}

const pointRow: React.CSSProperties = {
  fontSize: '0.95rem',
  opacity: 0.9,
}

const muted: React.CSSProperties = {
  opacity: 0.7,
}

const validationScore: React.CSSProperties = {
  fontSize: '1.1rem',
  fontWeight: 800,
}

const validationBadge: React.CSSProperties = {
  display: 'inline-block',
  marginTop: '8px',
  padding: '6px 10px',
  borderRadius: '999px',
}

const validationMessage: React.CSSProperties = {
  marginTop: '10px',
  lineHeight: 1.45,
}
